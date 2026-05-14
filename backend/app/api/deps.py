from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.config import settings
from app.core.database import get_db
from app.core.security import ALGORITHM, get_password_hash
from app.models.models import User, UserRole


# auto_error=False so unauthenticated requests get None instead of 401.
# Endpoints that truly require auth raise their own 401 via require_admin.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

_DEMO_EMAIL = "demo@student.com"


def _get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.email == _DEMO_EMAIL).first()
    if user is None:
        user = User(
            email=_DEMO_EMAIL,
            full_name="Demo Student",
            password_hash=get_password_hash(settings.demo_student_seed_password),
            role=UserRole.STUDENT,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


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
        user = _try_legacy_auth(token, db)
        if user is not None:
            return user

    if settings.allow_unauthenticated_demo_user:
        return _get_or_create_demo_user(db)

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
