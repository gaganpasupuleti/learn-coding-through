from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Student Career Acceleration Portal"
    environment: str = "development"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/career_portal"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
