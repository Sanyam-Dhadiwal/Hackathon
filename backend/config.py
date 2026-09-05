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

settings = Settings()
