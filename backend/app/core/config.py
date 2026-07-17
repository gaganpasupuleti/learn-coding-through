from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SQLITE_PATH = (BACKEND_DIR / "career_portal.db").as_posix()
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"
ENV_FILE_PATH = str(BACKEND_DIR / ".env")


class Settings(BaseSettings):
    app_name: str = "Student Career Acceleration Portal"
    environment: str = "development"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24
    password_reset_token_expire_minutes: int = 30
    database_url: str = DEFAULT_DATABASE_URL
    auto_create_tables: bool = True
    bootstrap_admin_email: str | None = None
    bootstrap_admin_password: str | None = None
    bootstrap_admin_full_name: str = "Platform Admin"
    promote_admin_emails: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["gaganpasupuleti@gmail.com"]
    )
    # Comma-separated in env: ADMIN_PRO_JOB_TIER_EMAILS=a@x.com,b@y.com — unlimited job posts (same as super_admin).
    admin_pro_job_tier_emails: Annotated[list[str], NoDecode] = Field(default_factory=list)
    google_oauth_client_id: str | None = None
    registration_limit_enabled: bool = True
    registration_user_limit: int = 1500
    allow_unauthenticated_demo_user: bool = False
    # Comma-separated student emails that receive idempotent dashboard KPI seed data on startup.
    # Always includes demo@student.com via ensure in seed when that account is auto-created.
    kpi_demo_student_emails: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["demo@student.com", "kundetiriya@gmail.com"]
    )
    # Password assigned only when the demo student account is first created (see seed_student_dashboard_demo).
    demo_student_seed_password: str = "DemoStudent@123"
    auto_start_resume_backend: bool = False
    resume_backend_host: str = "127.0.0.1"
    resume_backend_port: int = 8001
    resume_backend_python: str | None = None
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: [
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )
    cors_origin_regex: str | None = None

    # JobSpy scrape + job mail (Code Quest integrated jobs feature)
    admin_job_key: str | None = None
    jobspy_enabled: bool = True
    jobspy_default_country: str = "India"
    jobspy_default_location: str = "India"
    jobspy_results_wanted: int = 50
    jobspy_hours_old: int = 48
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_pass: str | None = None
    smtp_from: str | None = None
    job_mail_enabled: bool = False
    job_mail_test_recipient: str | None = None
    job_mail_max_recipients_per_run: int = 50
    job_digest_cta_url: str | None = None
    # Email transport: smtp (default) or brevo (HTTPS API)
    email_provider: str = "smtp"
    brevo_api_key: str | None = None
    email_from_address: str | None = None
    email_from_name: str = "Code Quest"

    enable_huggingface_ai: bool = False
    hf_token: str | None = None
    hf_model: str | None = None

    # Resume Matcher integration (backend-only — never VITE_*)
    resume_matcher_enabled: bool = False
    resume_matcher_base_url: str = "http://127.0.0.1:8001"
    resume_matcher_timeout_seconds: float = 30.0
    resume_matcher_connect_timeout_seconds: float = 5.0
    resume_matcher_max_upload_bytes: int = 8 * 1024 * 1024

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg2://", 1)

        if isinstance(value, str) and value.startswith("sqlite:///./"):
            relative_path = value.replace("sqlite:///./", "", 1)
            return f"sqlite:///{(BACKEND_DIR / relative_path).as_posix()}"

        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("promote_admin_emails", mode="before")
    @classmethod
    def parse_promoted_admin_emails(cls, value):
        if isinstance(value, str):
            return [email.strip().lower() for email in value.split(",") if email.strip()]
        if isinstance(value, list):
            return [str(email).strip().lower() for email in value if str(email).strip()]
        return value

    @field_validator("kpi_demo_student_emails", mode="before")
    @classmethod
    def parse_kpi_demo_student_emails(cls, value):
        if isinstance(value, str):
            return [email.strip().lower() for email in value.split(",") if email.strip()]
        if isinstance(value, list):
            return [str(email).strip().lower() for email in value if str(email).strip()]
        return value

    @field_validator("admin_pro_job_tier_emails", mode="before")
    @classmethod
    def parse_admin_pro_job_tier_emails(cls, value):
        if isinstance(value, str):
            return [email.strip().lower() for email in value.split(",") if email.strip()]
        if isinstance(value, list):
            return [str(email).strip().lower() for email in value if str(email).strip()]
        return value

    @field_validator("environment", mode="before")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.lower().strip() if isinstance(value, str) else value

    @field_validator("bootstrap_admin_email", mode="before")
    @classmethod
    def normalize_admin_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip().lower()
        return cleaned or None

    @field_validator("bootstrap_admin_password", mode="before")
    @classmethod
    def normalize_admin_password(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @model_validator(mode="after")
    def validate_production_safety(self):
        if self.environment != "production":
            return self

        default_secrets = {"change-me", "change-me-in-production", "replace-with-strong-random-secret"}
        if self.secret_key in default_secrets:
            raise ValueError("SECRET_KEY must be set to a strong non-default value in production")

        if self.auto_create_tables:
            raise ValueError("AUTO_CREATE_TABLES must be false in production")

        if not self.cors_origins:
            raise ValueError("CORS_ORIGINS must include at least one allowed origin in production")

        if "*" in self.cors_origins:
            raise ValueError("CORS_ORIGINS cannot include '*' in production")

        return self

    model_config = SettingsConfigDict(env_file=ENV_FILE_PATH, env_file_encoding="utf-8")


settings = Settings()
