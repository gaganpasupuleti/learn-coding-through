from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import admin, auth, credits, interview, progress, projects, quiz, resume, roadmap, roles, execute
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.services.seed import seed_admin_user, seed_default_roles


app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials="*" not in settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
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
        finally:
            db.close()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Code execution endpoints will still work without database")


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")
app.include_router(roadmap.router, prefix="/api/v1")
app.include_router(progress.router, prefix="/api/v1")
app.include_router(credits.router, prefix="/api/v1")
app.include_router(quiz.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(execute.router, prefix="/api")
