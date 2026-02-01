"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenAI Configuration
    openai_api_key: str = ""  # Optional, validated when NLQ is used
    openai_api_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"

    # Database Configuration
    database_path: str = "./data/db-query.sqlite"

    # Query Configuration
    query_timeout: int = 30

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Global settings instance
settings = Settings()
