from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Full name is required")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.strip()) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GoogleLoginPayload(BaseModel):
    id_token: str

    @field_validator("id_token", mode="before")
    @classmethod
    def normalize_token(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Google id_token is required")
        return cleaned


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

    @field_validator("reset_token", mode="before")
    @classmethod
    def normalize_token(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Reset token is required")
        return cleaned

    @field_validator("new_password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.strip()) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None


class MessageResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    credit_balance: int

    class Config:
        from_attributes = True
