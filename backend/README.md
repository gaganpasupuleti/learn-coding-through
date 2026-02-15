# Student Career Acceleration Portal Backend

FastAPI backend for role-based career acceleration with JWT auth, roadmap stages, quizzes, projects, resume ATS scoring, and interview simulation.

## Stack
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication

## Local Run (without Docker)
1. Create virtual env and install deps:
   - `pip install -r requirements.txt`
2. Configure env values from `.env.example`.
3. Run API:
   - `uvicorn app.main:app --reload --port 8000`
4. Open Swagger:
   - `http://localhost:8000/docs`

## Docker Run
From repo root:
- `docker compose up --build`

Services:
- Frontend: `http://localhost:5000`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## Modules
- `auth`: register/login, JWT
- `roles`: admin role creation + role listing
- `roadmap`: stage-wise roadmap fetch
- `progress`: stage progress update + unlock status
- `quiz`: quiz retrieval, submission, scoring, pass/fail
- `projects`: capstone/mini project submission tracking
- `resume`: role-aware ATS scoring
- `interview`: interview simulation questions + summary

## Database Tables
- `users`
- `roles`
- `stages`
- `topics`
- `lessons`
- `exercises`
- `quizzes`
- `quiz_questions`
- `submissions`
- `projects`
- `resumes`
- `progress_tracking`

Tables are created automatically at startup for MVP bootstrapping.
