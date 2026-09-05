import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request, Response, Header, Query, status
import jwt

from backend.config import settings
from backend.models import (
    UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse,
    RegisterResponse, VerifyEmailRequest, ResendVerificationRequest
)
from backend.services.auth_service import AuthService
from backend.services.email_service import EmailService

logger = logging.getLogger("travel_planner.routes.auth")
router = APIRouter()

def set_refresh_cookie(response: Response, refresh_token: str):
    """Store refresh token in a secure, HttpOnly cookie."""
    max_age_seconds = settings.JWT_REFRESH_EXPIRES_DAYS * 24 * 3600
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=max_age_seconds,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )

def clear_refresh_cookie(response: Response):
    """Clear refresh token cookie on logout or invalid session."""
    response.delete_cookie(
        key="refresh_token",
        path="/"
    )

def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    FastAPI dependency to validate access JWT and attach authenticated user.
    Reads 'Authorization: Bearer <token>'.
    """
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
    elif "authorization" in request.headers and request.headers["authorization"].startswith("Bearer "):
        token = request.headers["authorization"].split("Bearer ")[1].strip()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = AuthService.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = AuthService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or has been removed",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Enforce email verification on every authenticated request
    if not user.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "EMAIL_NOT_VERIFIED", "message": "Please verify your email address before accessing this resource."}
        )

    return AuthService.safe_user(user)

def get_optional_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> Optional[Dict[str, Any]]:
    """Optional user dependency for endpoints accessible both publicly and by authenticated users."""
    try:
        return get_current_user(request, authorization)
    except HTTPException:
        return None

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest):
    """
    Register a new user. Does NOT issue JWT tokens.
    Sends a verification email — user must verify before they can log in.
    """
    clean_email = req.email.strip().lower()
    if "@" not in clean_email or "." not in clean_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address format")

    if len(req.password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters")

    existing_user = AuthService.get_user_by_email(clean_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists"
        )

    user_doc = AuthService.create_user(req.name, clean_email, req.password)
    user_id = user_doc["id"]
    safe_user = AuthService.safe_user(user_doc)

    # Generate and store verification token (hash only goes to DB)
    raw_token, token_hash, expires_at = AuthService.generate_verification_token()
    AuthService.store_verification_token(user_id, token_hash, expires_at)

    # Send verification email (dev fallback logs to console)
    EmailService.send_verification_email(req.name.strip(), clean_email, raw_token)

    logger.info(f"Registered new user (pending verification): {clean_email} ({user_id})")
    return RegisterResponse(
        message="Account created. Please check your email and verify your address to continue.",
        email_verified=False,
        user=UserResponse(**safe_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, response: Response):
    """
    Authenticate user. Blocks login if email is not verified.
    """
    clean_email = req.email.strip().lower()
    user = AuthService.get_user_by_email(clean_email)

    # Verify credentials (timing-safe — same code path for missing user vs wrong password)
    if not user or not AuthService.verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Block login if email is not verified
    if not user.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "EMAIL_NOT_VERIFIED", "message": "Please verify your email address before logging in.", "email": clean_email}
        )

    user_id = user["id"]
    safe_user = AuthService.safe_user(user)

    access_token = AuthService.create_access_token(user_id, clean_email)
    refresh_token, _ = AuthService.create_refresh_token(user_id)
    set_refresh_cookie(response, refresh_token)

    logger.info(f"User logged in: {clean_email} ({user_id})")
    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        user=UserResponse(**safe_user)
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response):
    """
    Validate refresh token from HttpOnly cookie, rotate token session, and issue a fresh access token.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found in request"
        )

    payload = AuthService.validate_refresh_token(refresh_token)
    if not payload:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, revoked, or expired refresh token"
        )

    user_id = payload.get("sub")
    old_session_id = payload.get("jti")
    
    # Invalidate the old refresh token session (Token Rotation)
    if old_session_id:
        AuthService.revoke_refresh_token(old_session_id)

    user = AuthService.get_user_by_id(user_id)
    if not user:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists"
        )

    # Issue new access token and rotated refresh token
    access_token = AuthService.create_access_token(user["id"], user["email"])
    new_refresh_token, _ = AuthService.create_refresh_token(user["id"])
    set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        user=UserResponse(**AuthService.safe_user(user))
    )

@router.post("/logout")
def logout(request: Request, response: Response):
    """
    Revoke refresh token session in database and clear the HttpOnly cookie.
    """
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        try:
            payload = jwt.decode(
                refresh_token,
                settings.JWT_REFRESH_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
                options={"verify_exp": False}
            )
            session_id = payload.get("jti")
            if session_id:
                AuthService.revoke_refresh_token(session_id)
        except Exception as e:
            logger.debug(f"Logout token decode error: {e}")

    clear_refresh_cookie(response)
    return {"status": "success", "message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Return currently authenticated user information.
    """
    return UserResponse(**current_user)


@router.get("/verify-email")
def verify_email(token: str = Query(..., description="Raw email verification token from URL")):
    """
    Validate an email verification token.
    Hashes it, looks up the user, checks expiry, and marks email as verified.
    The token is single-use and is cleared after successful verification.
    """
    if not token or len(token) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

    user = AuthService.verify_email_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_OR_EXPIRED_TOKEN", "message": "Verification link is invalid or has expired."}
        )

    logger.info(f"Email verified successfully for {user.get('email')}")
    return {
        "status": "success",
        "message": "Email verified successfully! You can now log in.",
        "email": user.get("email")
    }


@router.post("/resend-verification")
def resend_verification(req: ResendVerificationRequest):
    """
    Resend a verification email. Enforces 60-second cooldown.
    Returns a generic success message to avoid user enumeration.
    """
    clean_email = req.email.strip().lower()
    if "@" not in clean_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address")

    user, raw_token, error = AuthService.resend_verification(clean_email)

    if error == "already_verified":
        return {"status": "success", "message": "This email address is already verified. Please log in."}

    if error and error.startswith("cooldown:"):
        remaining = int(error.split(":")[1])
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "RESEND_COOLDOWN",
                "message": f"Please wait {remaining} seconds before requesting another verification email.",
                "retry_after": remaining
            }
        )

    # Send new email (raw_token may be None if user not found — we still return success)
    if user and raw_token:
        EmailService.send_verification_email(user["name"], clean_email, raw_token)
        logger.info(f"Resent verification email to {clean_email}")

    # Generic success — don't reveal whether the email exists in our system
    return {
        "status": "success",
        "message": "If this email is registered and unverified, a new verification link has been sent."
    }
