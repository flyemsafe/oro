"""Application configuration using Pydantic Settings"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str = "postgresql://oro_user:oro_password@localhost:5432/oro_db"

    # Application
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Oro"
    APP_VERSION: str = "0.1.0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "changeme-in-production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
