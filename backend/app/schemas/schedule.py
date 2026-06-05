from __future__ import annotations

from datetime import date, time
from typing import Literal

from pydantic import BaseModel, Field


class UpcomingSessionResponse(BaseModel):
    id: int
    batch_name: str
    title: str
    topic: str | None
    session_date: date
    start_time: time
    end_time: time
    status: str

    class Config:
        from_attributes = True


class DeadlineQuizItem(BaseModel):
    quiz_id: int
    title: str
    due_date: date
    passed: bool


class DeadlineStageItem(BaseModel):
    stage_id: int
    title: str
    due_date: date
    unlocked: bool


class UpcomingDeadlinesResponse(BaseModel):
    quizzes: list[DeadlineQuizItem]
    stages: list[DeadlineStageItem]


CalendarEventType = Literal["class", "quiz", "project"]


class CalendarEventResponse(BaseModel):
    """Unified event for the expanded week calendar (classes, quizzes, stage milestones)."""

    id: str
    event_type: CalendarEventType
    title: str
    subtitle: str | None = None
    event_date: date
    start_time: time
    end_time: time
    batch_name: str | None = None
    status: str | None = None
    entity_id: int
    stage_id: int | None = None
    all_day: bool = False
    description: str | None = None
    duration_minutes: int = 60


class CalendarEventsResponse(BaseModel):
    start_date: date
    end_date: date
    events: list[CalendarEventResponse] = Field(default_factory=list)


class ClassSessionCreate(BaseModel):
    title: str
    topic: str | None = None
    session_date: date
    start_time: time
    end_time: time


class ClassSessionUpdate(BaseModel):
    title: str | None = None
    topic: str | None = None
    session_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    status: str | None = None


class ClassSessionResponse(BaseModel):
    id: int
    batch_id: int
    title: str
    topic: str | None
    session_date: date
    start_time: time
    end_time: time
    status: str

    class Config:
        from_attributes = True
