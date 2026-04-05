import socket
import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1 import admin, auth, credits, interview, progress, projects, quiz, resume, roadmap, roles, execute, typing
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.models.models import TypingAttempt
from app.services.seed import seed_admin_user, seed_catalog_data, seed_default_roles
from executors.java_executor import verify_java_runtime_setup


app = FastAPI(title=settings.app_name, version="0.1.0")


def _is_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.75)
        return sock.connect_ex((host, port)) == 0


def _resolve_resume_python_executable(resume_backend_dir: Path) -> str:
    if settings.resume_backend_python:
        return settings.resume_backend_python

    if sys.platform.startswith("win"):
        candidate = resume_backend_dir / ".venv" / "Scripts" / "python.exe"
    else:
        candidate = resume_backend_dir / ".venv" / "bin" / "python"

    if candidate.exists():
        return str(candidate)

    return sys.executable


def _start_resume_backend_if_enabled() -> None:
    app.state.resume_backend_process = None

    if not settings.auto_start_resume_backend:
        return

    if _is_port_open(settings.resume_backend_host, settings.resume_backend_port):
        print(
            "Resume backend auto-start skipped: "
            f"{settings.resume_backend_host}:{settings.resume_backend_port} already in use"
        )
        return

    repo_root = Path(__file__).resolve().parents[2]
    resume_backend_dir = repo_root / "resume app" / "Resume-Matcher" / "apps" / "backend"
    if not resume_backend_dir.exists():
        print(f"Resume backend auto-start skipped: directory not found at {resume_backend_dir}")
        return

    python_executable = _resolve_resume_python_executable(resume_backend_dir)
    command = [
        python_executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        settings.resume_backend_host,
        "--port",
        str(settings.resume_backend_port),
    ]

    try:
        process = subprocess.Popen(
            command,
            cwd=resume_backend_dir,
            stdout=None,
            stderr=None,
        )
        app.state.resume_backend_process = process
        print(
            "Resume backend auto-started "
            f"(pid={process.pid}) at {settings.resume_backend_host}:{settings.resume_backend_port}"
        )
    except Exception as exc:
        print(f"Warning: failed to auto-start resume backend: {exc}")


def _stop_resume_backend_if_started() -> None:
    process = getattr(app.state, "resume_backend_process", None)
    if process is None:
        return

    if process.poll() is not None:
        return

    try:
        process.terminate()
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
    except Exception as exc:
        print(f"Warning: failed to stop auto-started resume backend: {exc}")


def _ensure_typing_attempts_table() -> None:
    try:
        TypingAttempt.__table__.create(bind=engine, checkfirst=True)
    except Exception as exc:
        print(f"Warning: unable to ensure typing_attempts table exists: {exc}")

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
        db = SessionLocal()
        try:
            seed_default_roles(db)
            seed_admin_user(
                db,
                settings.bootstrap_admin_email,
                settings.bootstrap_admin_password,
                settings.bootstrap_admin_full_name,
            )
            seed_catalog_data(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Code execution endpoints will still work without database")

    _ensure_typing_attempts_table()

    _start_resume_backend_if_enabled()


@app.on_event("shutdown")
def shutdown_event():
    _stop_resume_backend_if_started()


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


app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")
app.include_router(roadmap.router, prefix="/api/v1")
app.include_router(progress.router, prefix="/api/v1")
app.include_router(typing.router, prefix="/api/v1")
app.include_router(credits.router, prefix="/api/v1")
app.include_router(quiz.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(execute.router, prefix="/api/v1")
