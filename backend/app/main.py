import socket
import subprocess
import sys
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from sqlalchemy import inspect, text
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from app.api import jobs as jobs_board
from app.api.v1 import activity, admin, ai, auth, credits, enrollment, feedback, interview, progress, projects, quiz, roadmap, roles, execute, schedule, typing
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.schema_ensure import (
    ensure_job_posts_fixture_columns,
    ensure_schedule_schema,
    ensure_student_feedback_table,
    ensure_quiz_catalog_attempts_table,
    ensure_typing_attempts_table,
)
from app.core.security import ALGORITHM
from app.models.models import User, UserActivityLog
from app.services.seed import seed_admin_user, seed_catalog_data, seed_default_roles, seed_promoted_admins, seed_student_dashboard_demo
from executors.java_executor import verify_java_runtime_setup


app = FastAPI(title=settings.app_name, version="0.1.0")


def _is_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.75)
        return sock.connect_ex((host, port)) == 0


 


def _ensure_job_posts_linkedin_columns() -> None:
    try:
        inspector = inspect(engine)
        if not inspector.has_table("job_posts"):
            return
        cols = {c["name"] for c in inspector.get_columns("job_posts")}
        dialect = engine.dialect.name
        with engine.begin() as conn:
            if "external_apply_url" not in cols:
                conn.execute(text("ALTER TABLE job_posts ADD COLUMN external_apply_url VARCHAR(2048)"))
            if "listing_metadata" not in cols:
                if dialect == "sqlite":
                    conn.execute(text("ALTER TABLE job_posts ADD COLUMN listing_metadata TEXT"))
                else:
                    conn.execute(text("ALTER TABLE job_posts ADD COLUMN listing_metadata JSON"))
    except Exception as exc:
        print(f"Warning: unable to ensure job_posts external/metadata columns: {exc}")


def _ensure_user_password_setup_column() -> None:
    try:
        inspector = inspect(engine)
        if not inspector.has_table("users"):
            return
        cols = {c["name"] for c in inspector.get_columns("users")}
        if "password_setup_required" in cols:
            return
        dialect = engine.dialect.name
        with engine.begin() as conn:
            if dialect == "sqlite":
                conn.execute(
                    text(
                        "ALTER TABLE users ADD COLUMN password_setup_required BOOLEAN NOT NULL DEFAULT 0"
                    )
                )
            else:
                conn.execute(
                    text(
                        "ALTER TABLE users ADD COLUMN password_setup_required BOOLEAN NOT NULL DEFAULT false"
                    )
                )
    except Exception as exc:
        print(f"Warning: unable to ensure users.password_setup_required column: {exc}")


# Initialize the rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

default_railway_origin_regex = r"^https://[a-z0-9-]+(?:\.up)?\.railway\.app$"
cors_origin_regex = settings.cors_origin_regex or default_railway_origin_regex

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials="*" not in settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _resolve_user_id_from_auth_header(authorization_header: str | None) -> int | None:
    if not authorization_header or not authorization_header.startswith("Bearer "):
        return None

    token = authorization_header.replace("Bearer ", "", 1).strip()
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        return int(subject) if subject is not None else None
    except (JWTError, ValueError, TypeError):
        return None


@app.middleware("http")
async def log_api_request_activity(request, call_next):
    started = time.perf_counter()
    response = await call_next(request)

    path = request.url.path
    if not path.startswith("/api/v1"):
        return response

    elapsed_ms = max(0, int((time.perf_counter() - started) * 1000))
    db = SessionLocal()
    try:
        user_id = _resolve_user_id_from_auth_header(request.headers.get("authorization"))
        if user_id is not None:
            user_exists = db.query(User.id).filter(User.id == user_id).first() is not None
            if not user_exists:
                user_id = None

        activity_row = UserActivityLog(
            user_id=user_id,
            event_type="api_request",
            route=path,
            method=request.method,
            status_code=response.status_code,
            duration_ms=elapsed_ms,
            metadata_json=request.headers.get("user-agent"),
        )
        db.add(activity_row)
        db.commit()
    except Exception as exc:
        print(f"Warning: unable to persist API activity log: {exc}")
        db.rollback()
    finally:
        db.close()

    return response


@app.on_event("startup")
def startup_event():
    # Surface Java toolchain problems at boot time without blocking non-Java features.
    try:
        verify_java_runtime_setup()
        app.state.java_runtime_ready = True
        app.state.java_runtime_error = None
    except RuntimeError as exc:
        app.state.java_runtime_ready = False
        app.state.java_runtime_error = str(exc)
        print(f"Warning: Java runtime unavailable at startup: {exc}")

    try:
        if settings.auto_create_tables:
            Base.metadata.create_all(bind=engine)
        ensure_schedule_schema()
        ensure_job_posts_fixture_columns()
        db = SessionLocal()
        try:
            seed_default_roles(db)
            seed_admin_user(
                db,
                settings.bootstrap_admin_email,
                settings.bootstrap_admin_password,
                settings.bootstrap_admin_full_name,
            )
            seed_promoted_admins(db, settings.promote_admin_emails)
            seed_catalog_data(db)
            seed_student_dashboard_demo(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Code execution endpoints will still work without database")

    ensure_typing_attempts_table()
    ensure_student_feedback_table()
    ensure_quiz_catalog_attempts_table()
    _ensure_user_password_setup_column()
    _ensure_job_posts_linkedin_columns()
    ensure_job_posts_fixture_columns()



@app.on_event("shutdown")
def shutdown_event():
    pass


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "service": "learn-coding-through-backend",
        "status": "ok",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health/capabilities")
def health_capabilities():
    java_ready = bool(getattr(app.state, "java_runtime_ready", False))
    java_error = getattr(app.state, "java_runtime_error", None)
    return {
        "status": "ok",
        "capabilities": {
            "java": {
                "ready": java_ready,
                "error": None if java_ready else java_error,
            }
        },
    }


@app.get("/health/db")
def health_db():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "unreachable", "detail": str(exc)},
        )
    finally:
        db.close()


app.include_router(ai.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")
app.include_router(roadmap.router, prefix="/api/v1")
app.include_router(progress.router, prefix="/api/v1")
app.include_router(enrollment.router, prefix="/api/v1")
app.include_router(typing.router, prefix="/api/v1")
app.include_router(activity.router, prefix="/api/v1")
app.include_router(credits.router, prefix="/api/v1")
app.include_router(quiz.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(feedback.admin_router, prefix="/api/v1")
app.include_router(execute.router, prefix="/api/v1")
app.include_router(jobs_board.router, prefix="/api")
app.include_router(jobs_board.admin_router, prefix="/api")
