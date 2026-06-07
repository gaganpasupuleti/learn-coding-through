import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import func
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
from app.models.models import RegistrationWaitlist, User, UserRole
from app.schemas.auth import (
    AuthPublicConfigResponse,
    CompletePasswordSetupRequest,
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


@router.get("/config", response_model=AuthPublicConfigResponse)
def auth_public_config():
    """Tell the SPA whether Google Sign-In is supported and which Web Client ID to use."""
    client_id = (settings.google_oauth_client_id or "").strip()
    return AuthPublicConfigResponse(
        google_auth_enabled=bool(client_id),
        google_client_id=client_id or None,
    )


def _active_user_count(db: Session) -> int:
    return int(db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0)


def _upsert_waitlist(db: Session, email: str, full_name: str | None, source: str) -> None:
    normalized_email = email.strip().lower()
    normalized_name = full_name.strip() if full_name else None

    entry = db.query(RegistrationWaitlist).filter(RegistrationWaitlist.email == normalized_email).first()
    now = datetime.utcnow()
    if entry is None:
        entry = RegistrationWaitlist(
            email=normalized_email,
            full_name=normalized_name,
            source=source,
            status="pending",
            attempt_count=1,
            first_attempted_at=now,
            last_attempted_at=now,
        )
        db.add(entry)
    else:
        entry.attempt_count += 1
        entry.last_attempted_at = now
        if normalized_name and not entry.full_name:
            entry.full_name = normalized_name
        entry.source = source
        db.add(entry)
    db.commit()


def _enforce_registration_limit(db: Session, email: str, full_name: str | None, source: str) -> None:
    normalized_email = email.strip().lower()
    approved_entry = (
        db.query(RegistrationWaitlist)
        .filter(
            RegistrationWaitlist.email == normalized_email,
            RegistrationWaitlist.status == "approved",
        )
        .first()
    )
    if approved_entry is not None:
        return

    if not settings.registration_limit_enabled:
        return

    active_users = _active_user_count(db)
    if active_users < settings.registration_user_limit:
        return

    _upsert_waitlist(db, email=normalized_email, full_name=full_name, source=source)
    raise HTTPException(
        status_code=429,
        detail=(
            f"We have reached {settings.registration_user_limit} active users. "
            "Please wait for your turn to access the platform. Register below, and we will grant access very soon. "
            "We are actively working to increase our capacity."
        ),
    )


@router.post("/register", response_model=UserResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    normalized_email = payload.email.strip().lower()
    approved_entry = (
        db.query(RegistrationWaitlist)
        .filter(
            RegistrationWaitlist.email == normalized_email,
            RegistrationWaitlist.status == "approved",
        )
        .first()
    )
    is_pre_approved = approved_entry is not None

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
        role=UserRole.STUDENT,
        is_active=is_pre_approved,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if not is_pre_approved:
        _upsert_waitlist(db, email=normalized_email, full_name=payload.full_name, source="register")
        raise HTTPException(
            status_code=403,
            detail="Registration received! Your account is pending admin approval. You will be able to log in once an admin approves your request.",
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. Please wait until an admin approves your registration.",
        )

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
            clock_skew_in_seconds=30,
        )
    except ValueError as exc:
        detail = "Invalid Google token"
        if settings.environment != "production":
            hint = (
                "Ensure GOOGLE_OAUTH_CLIENT_ID in backend/.env matches VITE_GOOGLE_CLIENT_ID "
                "and the Google Cloud Web client ID, then restart the API and Vite."
            )
            if "too early" in str(exc).lower() or "too late" in str(exc).lower():
                hint = (
                    "Your system clock may be slightly out of sync with Google. "
                    "Sync Windows date/time (Settings → Time & language → Sync now), then retry. "
                    + hint
                )
            detail = f"{detail}: {exc}. {hint}"
        raise HTTPException(status_code=401, detail=detail) from exc

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
        approved_entry = (
            db.query(RegistrationWaitlist)
            .filter(
                RegistrationWaitlist.email == email,
                RegistrationWaitlist.status == "approved",
            )
            .first()
        )
        is_pre_approved = approved_entry is not None

        # Create new user, but don't auto-activate unless pre-approved
        user = User(
            email=email,
            full_name=full_name,
            password_hash=get_password_hash(secrets.token_urlsafe(32)),
            role=UserRole.STUDENT,
            external_auth_uid=external_uid,
            is_active=is_pre_approved,
            password_setup_required=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if not is_pre_approved:
            _upsert_waitlist(db, email=email, full_name=full_name, source="google-login")
            raise HTTPException(
                status_code=403,
                detail="Registration via Google received! Your account is pending admin approval. You will be able to log in once an admin approves your request.",
            )
    else:
        if user.external_auth_uid and user.external_auth_uid != external_uid:
            raise HTTPException(status_code=409, detail="This email is linked to a different Google account")
        
        # Link Google UID if not already linked
        if not user.external_auth_uid:
            user.external_auth_uid = external_uid
        
        if not user.full_name.strip() and full_name:
            user.full_name = full_name
            
        db.add(user)
        db.commit()
        db.refresh(user)

    # Final check: is the user active? (Covers both new and existing users)
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. Please wait until an admin approves your registration.",
        )

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


@router.post("/complete-password-setup", response_model=UserResponse)
def complete_password_setup(
    payload: CompletePasswordSetupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.password_setup_required:
        raise HTTPException(status_code=400, detail="Password is already set for this account")
    current_user.password_hash = get_password_hash(payload.password)
    current_user.password_setup_required = False
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
