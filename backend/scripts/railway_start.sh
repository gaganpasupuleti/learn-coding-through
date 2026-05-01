#!/usr/bin/env bash
# NOTE: intentionally NOT using 'set -e' so a failed migration does not
# prevent uvicorn from starting and the Railway healthcheck from passing.
set -uo pipefail

cd "$(dirname "$0")/.."

if [[ -n "${PYTHON_BIN:-}" ]]; then
	PYTHON_CMD="$PYTHON_BIN"
elif command -v python3 >/dev/null 2>&1; then
	PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
	PYTHON_CMD="python"
else
	echo "[railway] python executable not found"
	exit 1
fi

echo "[railway] running migrations..."
"$PYTHON_CMD" -m alembic upgrade head || echo "[railway] WARNING: alembic migration failed — starting API anyway"

echo "[railway] starting api on port ${PORT:-8000}"
exec "$PYTHON_CMD" -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
