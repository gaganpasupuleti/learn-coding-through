import secrets

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    get_password_hash,
    verify_password,
    verify_password_reset_token,
)
from app.models.models import User, UserRole
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GoogleLoginPayload,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/google-login", response_model=TokenResponse)
def google_login(payload: GoogleLoginPayload, db: Session = Depends(get_db)):
    client_id = (settings.google_oauth_client_id or "").strip()
    if not client_id:
        raise HTTPException(status_code=503, detail="Google login is not configured")

    try:
        info = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            audience=client_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid Google token") from exc

    email = str(info.get("email") or "").strip().lower()
    external_uid = str(info.get("sub") or "").strip()
    full_name = str(info.get("name") or "").strip() or "Google User"
    email_verified = bool(info.get("email_verified", False))

    if not email or not external_uid:
        raise HTTPException(status_code=401, detail="Google token missing required claims")

    if not email_verified:
        raise HTTPException(status_code=401, detail="Google email is not verified")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            email=email,
            full_name=full_name,
            password_hash=get_password_hash(secrets.token_urlsafe(32)),
            role=UserRole.STUDENT,
            external_auth_uid=external_uid,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if user.external_auth_uid and user.external_auth_uid != external_uid:
            raise HTTPException(status_code=409, detail="This email is linked to a different Google account")
        if not user.external_auth_uid:
            user.external_auth_uid = external_uid
        if not user.full_name.strip() and full_name:
            user.full_name = full_name
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_message = "If the email exists, a reset link has been generated."
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        return ForgotPasswordResponse(message=generic_message)

    reset_token = create_password_reset_token(user.email)
    if settings.environment == "production":
        return ForgotPasswordResponse(message=generic_message)

    return ForgotPasswordResponse(message=generic_message, reset_token=reset_token)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_password_reset_token(payload.reset_token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user.password_hash = get_password_hash(payload.new_password)
    db.add(user)
    db.commit()

    return MessageResponse(message="Password updated successfully")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
