from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import ALGORITHM, get_password_hash
from app.models.models import User, UserRole


# auto_error=False so unauthenticated requests get None instead of 401.
# Endpoints that truly require auth raise their own 401 via require_admin.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

_DEMO_EMAIL = "demo@student.com"
_SUPABASE_ALGORITHM = "HS256"


def _get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.email == _DEMO_EMAIL).first()
    if user is None:
        user = User(
            email=_DEMO_EMAIL,
            full_name="Demo Student",
            password_hash=get_password_hash("demo-password-not-for-login"),
            role=UserRole.STUDENT,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _try_supabase_auth(token: str, db: Session) -> Optional[User]:
    """Verify a Supabase-issued JWT and return (or auto-provision) the User."""
    if not settings.supabase_jwt_secret:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[_SUPABASE_ALGORITHM],
            audience="authenticated",
        )
        supabase_uid: str | None = payload.get("sub")
        if not supabase_uid:
            return None

        # Look up by Supabase UID first
        user = db.query(User).filter(User.supabase_uid == supabase_uid).first()
        if user:
            return user

        # Auto-provision: first time this Supabase user hits our backend
        email: str | None = payload.get("email")
        if not email:
            return None
        user_metadata: dict = payload.get("user_metadata") or {}
        full_name: str = user_metadata.get("full_name") or email.split("@")[0]

        # If a legacy row with the same email exists, link it instead of creating a duplicate
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.supabase_uid = supabase_uid
        else:
            user = User(
                email=email,
                supabase_uid=supabase_uid,
                full_name=full_name,
                password_hash=get_password_hash("supabase-managed-not-for-direct-login"),
                role=UserRole.STUDENT,
            )
            db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except JWTError:
        return None


def _try_legacy_auth(token: str, db: Session) -> Optional[User]:
    """Verify a legacy self-signed JWT (integer sub) as a fallback."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is not None:
            return db.query(User).filter(User.id == int(user_id)).first()
    except (JWTError, ValueError):
        pass
    return None


def get_current_user(db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme)) -> User:
    if token:
        user = _try_supabase_auth(token, db) or _try_legacy_auth(token, db)
        if user is not None:
            return user
    # No token or invalid token — fall back to the shared demo student account.
    return _get_or_create_demo_user(db)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
