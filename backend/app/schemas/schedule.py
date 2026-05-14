from __future__ import annotations

from datetime import date, time
from pydantic import BaseModel


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
