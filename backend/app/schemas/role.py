from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str
    skills_required: list[str]
    salary_range: str
    companies_hiring: list[str]
    difficulty_level: str
    estimated_duration_weeks: int


class RoleResponse(BaseModel):
    id: int
    name: str
    skills_required: list[str]
    salary_range: str
    companies_hiring: list[str]
    difficulty_level: str
    estimated_duration_weeks: int

    class Config:
        from_attributes = True
