import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import bcrypt
import jwt

from backend.config import settings
from backend.database import db

logger = logging.getLogger("travel_planner.auth")

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plaintext password with bcrypt and salt."""
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plaintext password against its bcrypt hash."""
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False

    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        """Create a short-lived access JWT."""
        now = datetime.now(timezone.utc)
        exp = now + timedelta(minutes=settings.JWT_ACCESS_EXPIRES_MINUTES)
        payload = {
            "sub": str(user_id),
            "email": str(email),
            "type": "access",
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp())
        }
        return jwt.encode(payload, settings.JWT_ACCESS_SECRET, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> Tuple[str, str]:
        """
        Create a long-lived refresh JWT and persist its session in MongoDB.
        Returns a tuple of (refresh_token_jwt, session_id).
        """
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        exp = now + timedelta(days=settings.JWT_REFRESH_EXPIRES_DAYS)
        
        # Persist session to db.refresh_tokens
        session_record = {
            "id": session_id,
            "user_id": str(user_id),
            "expires_at": exp.isoformat(),
            "revoked": False,
            "created_at": now.isoformat()
        }
        db.refresh_tokens.insert_one(session_record)
        
        payload = {
            "sub": str(user_id),
            "jti": session_id,
            "type": "refresh",
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp())
        }
        token = jwt.encode(payload, settings.JWT_REFRESH_SECRET, algorithm=settings.JWT_ALGORITHM)
        return token, session_id

    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode an access JWT."""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_ACCESS_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            if payload.get("type") != "access":
                return None
            return payload
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            logger.debug(f"Access token validation failed: {e}")
            return None

    @staticmethod
    def validate_refresh_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode a refresh JWT, then verify the session is active in MongoDB.
        """
        try:
            payload = jwt.decode(
                token,
                settings.JWT_REFRESH_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            if payload.get("type") != "refresh":
                return None

            session_id = payload.get("jti")
            if not session_id:
                return None

            # Verify session in database
            session = db.refresh_tokens.find_one({"id": session_id, "revoked": False})
            if not session:
                return None

            return payload
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            logger.debug(f"Refresh token validation failed: {e}")
            return None

    @staticmethod
    def revoke_refresh_token(session_id: str) -> None:
        """Mark a refresh token session as revoked."""
        db.refresh_tokens.update_one(
            {"id": session_id},
            {"$set": {"revoked": True, "revoked_at": datetime.now(timezone.utc).isoformat()}}
        )

    @staticmethod
    def revoke_all_user_sessions(user_id: str) -> None:
        """Revoke all sessions for a user."""
        db.refresh_tokens.update_many(
            {"user_id": str(user_id), "revoked": False},
            {"$set": {"revoked": True, "revoked_at": datetime.now(timezone.utc).isoformat()}}
        )

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Retrieve user document by email (case-insensitive)."""
        clean_email = email.strip().lower()
        return db.users.find_one({"email": clean_email})

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user document by unique ID."""
        return db.users.find_one({"id": str(user_id)})

    @staticmethod
    def create_user(name: str, email: str, password: str) -> Dict[str, Any]:
        """Hash password, generate ID, and save new user. email_verified starts False."""
        clean_email = email.strip().lower()
        user_id = f"user_{str(uuid.uuid4())[:8]}"
        password_hash = AuthService.hash_password(password)
        now_str = datetime.now(timezone.utc).isoformat()

        user_doc = {
            "id": user_id,
            "name": name.strip(),
            "email": clean_email,
            "password_hash": password_hash,
            # Email verification
            "email_verified": False,
            "email_verification_token_hash": None,
            "email_verification_expires_at": None,
            "resend_cooldown_until": None,
            "created_at": now_str,
            "updated_at": now_str
        }
        db.users.insert_one(user_doc)
        return user_doc

    # ------------------------------------------------------------------
    # Email verification
    # ------------------------------------------------------------------

    @staticmethod
    def generate_verification_token() -> Tuple[str, str, str]:
        """
        Generate a cryptographically secure verification token.
        Returns (raw_token, token_hash, expires_at_iso).
        The raw_token is sent in the email; only the hash is stored in the DB.
        """
        from backend.config import settings  # avoid circular at module level
        raw_token = secrets.token_urlsafe(32)  # 256-bit entropy
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = (
            datetime.now(timezone.utc)
            + timedelta(minutes=settings.EMAIL_VERIFICATION_EXPIRES_MINUTES)
        ).isoformat()
        return raw_token, token_hash, expires_at

    @staticmethod
    def store_verification_token(user_id: str, token_hash: str, expires_at: str) -> None:
        """Persist the hashed verification token and expiry for a user."""
        db.users.update_one(
            {"id": user_id},
            {"$set": {
                "email_verification_token_hash": token_hash,
                "email_verification_expires_at": expires_at,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

    @staticmethod
    def verify_email_token(raw_token: str) -> Optional[Dict[str, Any]]:
        """
        Validate a raw email verification token.
        - Hashes the received token and looks it up in the DB.
        - Checks expiry.
        - On success: sets email_verified=True and clears the token fields (single-use).
        Returns the updated user doc on success, None on failure.
        """
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        user = db.users.find_one({"email_verification_token_hash": token_hash})
        if not user:
            return None

        # Check expiry
        expires_at_str = user.get("email_verification_expires_at")
        if not expires_at_str:
            return None
        try:
            expires_at = datetime.fromisoformat(expires_at_str)
            # Make offset-aware if naive
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
        except ValueError:
            return None

        if datetime.now(timezone.utc) > expires_at:
            logger.debug(f"Verification token expired for user {user.get('id')}")
            return None  # token expired

        # Mark verified and clear token (single-use)
        db.users.update_one(
            {"id": user["id"]},
            {"$set": {
                "email_verified": True,
                "email_verification_token_hash": None,
                "email_verification_expires_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        user["email_verified"] = True
        user["email_verification_token_hash"] = None
        user["email_verification_expires_at"] = None
        logger.info(f"Email verified for user {user.get('id')} ({user.get('email')})")
        return user

    @staticmethod
    def can_resend_verification(user: Dict[str, Any]) -> Tuple[bool, int]:
        """
        Checks whether the 60-second resend cooldown has passed.
        Returns (can_resend: bool, seconds_remaining: int).
        """
        cooldown_str = user.get("resend_cooldown_until")
        if not cooldown_str:
            return True, 0
        try:
            cooldown_until = datetime.fromisoformat(cooldown_str)
            if cooldown_until.tzinfo is None:
                cooldown_until = cooldown_until.replace(tzinfo=timezone.utc)
        except ValueError:
            return True, 0

        now = datetime.now(timezone.utc)
        if now >= cooldown_until:
            return True, 0
        remaining = int((cooldown_until - now).total_seconds())
        return False, remaining

    @staticmethod
    def resend_verification(
        email: str
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str], Optional[str]]:
        """
        Issue a new verification token for a user (invalidating the old one).
        Returns (user_doc, raw_token, error_message).
        error_message is set when operation should not proceed.
        """
        from backend.config import settings  # avoid circular at module level
        user = AuthService.get_user_by_email(email)
        if not user:
            # Return generic success to avoid user enumeration
            return None, None, None

        if user.get("email_verified"):
            return user, None, "already_verified"

        can_send, remaining = AuthService.can_resend_verification(user)
        if not can_send:
            return user, None, f"cooldown:{remaining}"

        raw_token, token_hash, expires_at = AuthService.generate_verification_token()

        # Set new cooldown
        new_cooldown = (
            datetime.now(timezone.utc)
            + timedelta(seconds=settings.EMAIL_RESEND_COOLDOWN_SECONDS)
        ).isoformat()

        db.users.update_one(
            {"id": user["id"]},
            {"$set": {
                "email_verification_token_hash": token_hash,
                "email_verification_expires_at": expires_at,
                "resend_cooldown_until": new_cooldown,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return user, raw_token, None

    @staticmethod
    def safe_user(user_doc: Dict[str, Any]) -> Dict[str, Any]:
        """Strip password_hash and mongo _id from user dict."""
        return {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "email_verified": bool(user_doc.get("email_verified", False)),
            "created_at": user_doc.get("created_at", "")
        }
