"""Quiz engine and bank import tests."""

from __future__ import annotations

import io
import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base, SessionLocal, engine
from app.models.models import QuizCatalog, QuizCatalogAttempt, QuizCatalogQuestion, User, UserRole
from app.services.quiz_bank_import import import_quiz_bank_rows, parse_quiz_bank_file
from app.services.quiz_engine import start_catalog_attempt, submit_catalog_attempt


class QuizEngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        Base.metadata.create_all(bind=engine)

    def setUp(self) -> None:
        self.db = SessionLocal()
        self.db.query(QuizCatalogAttempt).delete()
        self.db.query(QuizCatalogQuestion).delete()
        self.db.query(QuizCatalog).delete()
        self.db.query(User).filter(User.email == "quiz-engine-test@example.com").delete()
        self.db.commit()

        self.user = User(
            email="quiz-engine-test@example.com",
            full_name="Quiz Engine Test",
            password_hash="hash",
            role=UserRole.STUDENT,
            is_active=True,
        )
        self.db.add(self.user)
        self.db.flush()

        self.quiz = QuizCatalog(
            slug="engine-smoke-quiz",
            title="Engine Smoke Quiz",
            description="Test quiz",
            difficulty="beginner",
            estimated_time="5 min",
        )
        self.db.add(self.quiz)
        self.db.flush()
        self.db.add_all(
            [
                QuizCatalogQuestion(
                    quiz_id=self.quiz.id,
                    order=1,
                    question_type="multiple-choice",
                    title="MCQ",
                    prompt="2 + 2 = ?",
                    explanation="Basic math",
                    options_json='["3","4","5"]',
                    correct_index=1,
                ),
                QuizCatalogQuestion(
                    quiz_id=self.quiz.id,
                    order=2,
                    question_type="fill-blank",
                    title="Blank",
                    prompt="Capital of France",
                    explanation="Paris",
                    answer="Paris",
                ),
            ]
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()

    def test_start_attempt_shuffles_questions(self) -> None:
        payload = start_catalog_attempt(self.db, user_id=self.user.id, quiz_slug=self.quiz.slug)
        self.assertTrue(payload["attempt_id"])
        self.assertEqual(len(payload["question_order"]), 2)

    def test_submit_attempt_persists_score_and_wrong_answers(self) -> None:
        start = start_catalog_attempt(self.db, user_id=self.user.id, quiz_slug=self.quiz.slug)
        result = submit_catalog_attempt(
            self.db,
            attempt_id=start["attempt_id"],
            user_id=self.user.id,
            answers=[
                {"question_id": self.db.query(QuizCatalogQuestion).filter_by(title="MCQ").one().id, "answer": 0},
                {"question_id": self.db.query(QuizCatalogQuestion).filter_by(title="Blank").one().id, "answer": "Paris"},
            ],
            time_taken_seconds=42,
        )
        self.assertEqual(result.score, 50)
        self.assertFalse(result.passed)
        self.assertEqual(result.correct_count, 1)
        self.assertEqual(len(result.wrong_answers), 1)

    def test_import_quiz_bank_csv(self) -> None:
        csv_content = (
            "quiz_slug,order,question_type,title,prompt,explanation,options,correct_index\n"
            "imported-quiz,1,mcq,Imported Q,Prompt text,Because,A|B|C,1\n"
        ).encode("utf-8")
        rows = parse_quiz_bank_file(csv_content, "quiz-bank.csv")
        result = import_quiz_bank_rows(self.db, rows)
        self.assertEqual(result.inserted, 1)
        self.assertEqual(result.rejected, 0)
        quiz = self.db.query(QuizCatalog).filter_by(slug="imported-quiz").one()
        self.assertEqual(len(quiz.questions), 1)

    def test_import_rejects_invalid_row(self) -> None:
        csv_content = (
            "quiz_slug,order,question_type,title,prompt,explanation\n"
            "bad-quiz,1,unknown_type,Bad Q,Prompt,Explanation\n"
        ).encode("utf-8")
        rows = parse_quiz_bank_file(csv_content, "quiz-bank.csv")
        result = import_quiz_bank_rows(self.db, rows)
        self.assertEqual(result.inserted, 0)
        self.assertEqual(result.rejected, 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
