FROM python:3.11-slim

WORKDIR /app

# Install Node.js and Java (needed for code execution sandbox)
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY executors ./executors
COPY models ./models
COPY security ./security
COPY alembic ./alembic
COPY alembic.ini .
COPY scripts ./scripts
COPY main.py .

# $PORT is injected by Railway at runtime; fall back to 8000 for local Docker use
EXPOSE 8000

CMD ["sh", "-c", "python -m alembic upgrade head && PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
