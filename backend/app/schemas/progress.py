from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class ProgressUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    role_id: int = Field(validation_alias=AliasChoices("role_id", "roleId"))
    stage_id: int = Field(validation_alias=AliasChoices("stage_id", "stageId"))
    lessons_completed: int = Field(validation_alias=AliasChoices("lessons_completed", "lessonsCompleted"))
    total_lessons: int = Field(validation_alias=AliasChoices("total_lessons", "totalLessons"))
    exercises_completed_pct: int = Field(
        validation_alias=AliasChoices("exercises_completed_pct", "exercisesCompletedPct")
    )
    latest_quiz_score: int = Field(validation_alias=AliasChoices("latest_quiz_score", "latestQuizScore"))


class ProgressResponse(BaseModel):
    stage_id: int
    lessons_completed: int
    total_lessons: int
    exercises_completed_pct: int
    latest_quiz_score: int
    unlocked: bool
