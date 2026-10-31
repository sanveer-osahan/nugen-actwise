import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret-key-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://actwise:actwise@localhost:5432/actwise"
)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
