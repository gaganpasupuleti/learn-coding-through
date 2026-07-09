from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, computed_field, field_serializer

from app.core.datetime_utils import format_ist, utc_iso_z


FeedbackCategoryLiteral = Literal["general", "concern", "bug", "suggestion"]
FeedbackStatusLiteral = Literal["pending", "reviewed"]


class FeedbackCreate(BaseModel):
    category: FeedbackCategoryLiteral
    message: str = Field(min_length=10, max_length=2000)


class FeedbackResponse(BaseModel):
    id: int
    category: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackReviewUpdate(BaseModel):
    status: Literal["reviewed"] = "reviewed"
    admin_notes: str | None = Field(default=None, max_length=2000)


class AdminFeedbackItem(BaseModel):
    id: int
    user_id: int
    student_name: str
    student_email: str
    category: str
    message: str
    status: str
    admin_notes: str | None
    reviewed_by_user_id: int | None
    reviewed_at: datetime | None
    created_at: datetime

    @field_serializer("created_at", "reviewed_at")
    def _serialize_utc(self, value: datetime | None) -> str | None:
        return utc_iso_z(value)

    @computed_field
    @property
    def created_at_ist(self) -> str | None:
        return format_ist(self.created_at)

    @computed_field
    @property
    def reviewed_at_ist(self) -> str | None:
        return format_ist(self.reviewed_at)

    class Config:
        from_attributes = True
