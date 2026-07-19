"""Smoke checks for CodeQuest Resume Lab CRUD shapes."""

import unittest

from app.api.v1.resumes import ResumeCreate, ResumeUpdate, _default_resume_data


class StudentResumesApiTests(unittest.TestCase):
    def test_default_resume_data_has_required_sections(self):
        data = _default_resume_data()
        self.assertIn("basics", data)
        self.assertIn("sections", data)
        self.assertIn("experience", data["sections"])
        self.assertEqual(data["metadata"]["template"], "onyx")

    def test_resume_create_schema_defaults(self):
        body = ResumeCreate()
        self.assertEqual(body.title, "My Resume")

    def test_resume_update_optional_fields(self):
        body = ResumeUpdate(title="Updated", data={"basics": {"name": "A"}})
        self.assertEqual(body.title, "Updated")
        self.assertEqual(body.data["basics"]["name"], "A")


if __name__ == "__main__":
    unittest.main()
