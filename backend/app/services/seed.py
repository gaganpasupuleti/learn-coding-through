import json

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.models import DifficultyLevel, Quiz, QuizQuestion, Role, Stage, User, UserRole


def seed_default_roles(db: Session):
    role_payloads = [
        {
            "name": "Data Analyst",
            "skills_required": ["SQL", "Python", "Excel", "Power BI", "Statistics"],
            "salary_range": "$55k - $110k",
            "companies_hiring": ["Accenture", "Deloitte", "Amazon", "TCS"],
            "difficulty": DifficultyLevel.BEGINNER,
            "duration": 24,
        },
        {
            "name": "Python Backend Developer",
            "skills_required": ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Testing"],
            "salary_range": "$70k - $140k",
            "companies_hiring": ["PayPal", "Swiggy", "Razorpay", "Zoho"],
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "duration": 28,
        },
        {
            "name": "Data Engineer",
            "skills_required": ["SQL", "Python", "Spark", "Airflow", "Data Warehousing"],
            "salary_range": "$85k - $165k",
            "companies_hiring": ["Google", "Uber", "Flipkart", "Walmart"],
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "duration": 32,
        },
        {
            "name": "ML Engineer",
            "skills_required": ["Python", "Machine Learning", "MLOps", "TensorFlow", "Feature Engineering"],
            "salary_range": "$95k - $190k",
            "companies_hiring": ["NVIDIA", "Microsoft", "OpenAI", "Infosys"],
            "difficulty": DifficultyLevel.ADVANCED,
            "duration": 36,
        },
        {
            "name": "Full Stack Developer",
            "skills_required": ["React", "TypeScript", "Node.js", "Databases", "System Design"],
            "salary_range": "$75k - $155k",
            "companies_hiring": ["Meta", "Atlassian", "Freshworks", "CRED"],
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "duration": 30,
        },
        {
            "name": "DevOps Engineer",
            "skills_required": ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud"],
            "salary_range": "$90k - $175k",
            "companies_hiring": ["Adobe", "IBM", "Oracle", "ServiceNow"],
            "difficulty": DifficultyLevel.ADVANCED,
            "duration": 34,
        },
    ]

    for payload in role_payloads:
        existing = db.query(Role).filter(Role.name == payload["name"]).first()
        if existing:
            continue

        role = Role(
            name=payload["name"],
            skills_required=json.dumps(payload["skills_required"]),
            salary_range=payload["salary_range"],
            companies_hiring=json.dumps(payload["companies_hiring"]),
            difficulty_level=payload["difficulty"],
            estimated_duration_weeks=payload["duration"],
        )
        db.add(role)
        db.flush()

        for idx in range(1, 5):
            stage = Stage(
                role_id=role.id,
                order_number=idx,
                title=f"Stage {idx}: Core Growth",
                description="Learn concepts, practice exercises, clear quiz, then build mini project.",
                unlock_quiz_score=70,
                unlock_exercise_completion=80,
            )
            db.add(stage)
            db.flush()

            quiz = Quiz(
                stage_id=stage.id,
                title=f"{role.name} Stage {idx} Quiz",
                timer_seconds=900,
                pass_percentage=70,
            )
            db.add(quiz)
            db.flush()

            db.add_all(
                [
                    QuizQuestion(
                        quiz_id=quiz.id,
                        question_text="What is the best first step in solving a new problem?",
                        options_json=json.dumps(["Guess", "Read requirements", "Skip", "Copy code"]),
                        correct_answer="Read requirements",
                    ),
                    QuizQuestion(
                        quiz_id=quiz.id,
                        question_text="Why write test cases for exercises?",
                        options_json=json.dumps(["To slow down", "To validate logic", "For UI only", "No need"]),
                        correct_answer="To validate logic",
                    ),
                ]
            )

    db.commit()


def seed_admin_user(db: Session, email: str | None, password: str | None, full_name: str):
    if not email or not password:
        return

    normalized_email = email.strip().lower()
    if not normalized_email:
        return

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        if existing.role != UserRole.ADMIN:
            existing.role = UserRole.ADMIN
            db.commit()
        return

    user = User(
        email=normalized_email,
        full_name=full_name.strip() or "Platform Admin",
        password_hash=get_password_hash(password),
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
