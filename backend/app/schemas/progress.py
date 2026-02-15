from pydantic import BaseModel


class ProgressUpdateRequest(BaseModel):
    role_id: int
    stage_id: int
    lessons_completed: int
    total_lessons: int
    exercises_completed_pct: int
    latest_quiz_score: int


class ProgressResponse(BaseModel):
    stage_id: int
    lessons_completed: int
    total_lessons: int
    exercises_completed_pct: int
    latest_quiz_score: int
    unlocked: bool
