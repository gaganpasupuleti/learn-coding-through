from pydantic import BaseModel


class StageResponse(BaseModel):
    id: int
    order_number: int
    title: str
    description: str
    unlock_quiz_score: int
    unlock_exercise_completion: int
    unlocked: bool = False


class RoleRoadmapResponse(BaseModel):
    role_id: int
    role_name: str
    stages: list[StageResponse]
