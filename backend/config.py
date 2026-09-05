import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Adaptive AI Travel Planner"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # MongoDB Configuration
    # Can be MongoDB Atlas URI (e.g. mongodb+srv://user:pass@cluster.mongodb.net/travel_planner)
    # or local mongodb://localhost:27017
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "travel_planner")
    
    # Free Google Gemini API Key from Google AI Studio (https://aistudio.google.com/app/apikey)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    _raw_model: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    GEMINI_MODEL: str = "gemini-flash-latest" if ("1.5" in _raw_model or not _raw_model) else _raw_model
    
    # Host & Port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # JWT Authentication
    JWT_ACCESS_SECRET: str = os.getenv("JWT_ACCESS_SECRET", "super-secret-access-key-travel-planner-hackathon-2026-min32chars")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "super-secret-refresh-key-travel-planner-hackathon-2026-min32chars")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRES_MINUTES: int = int(os.getenv("JWT_ACCESS_EXPIRES_MINUTES", "15"))
    JWT_REFRESH_EXPIRES_DAYS: int = int(os.getenv("JWT_REFRESH_EXPIRES_DAYS", "7"))
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() in ("true", "1", "yes")
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")

    # Email Verification
    EMAIL_VERIFICATION_EXPIRES_MINUTES: int = int(os.getenv("EMAIL_VERIFICATION_EXPIRES_MINUTES", "30"))
    EMAIL_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("EMAIL_RESEND_COOLDOWN_SECONDS", "60"))

    # SMTP Email Configuration (leave blank in dev to use console-log fallback)
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@travelplanner.app")
    EMAIL_USE_TLS: bool = os.getenv("EMAIL_USE_TLS", "true").lower() in ("true", "1", "yes")

    # Frontend URL — used to build email verification links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
