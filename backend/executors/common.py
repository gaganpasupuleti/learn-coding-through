"""Shared helpers for deterministic executor responses."""

from __future__ import annotations

import os
import subprocess
import time
from contextlib import contextmanager
from tempfile import TemporaryDirectory
from typing import Any, Dict


MAX_OUTPUT_CHARS = 10_000
DEFAULT_MAX_MEMORY_MB = 256


@contextmanager
def isolated_workspace() -> str:
    """Create a temporary isolated working directory for execution."""
    with TemporaryDirectory(prefix="sandbox_exec_") as temp_dir:
        yield temp_dir


def _posix_preexec_with_memory_limit(max_memory_mb: int):
    """Return preexec function that applies memory limits on POSIX systems."""
    if os.name == "nt" or max_memory_mb <= 0:
        return None

    def _preexec():
        import resource

        memory_bytes = max_memory_mb * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))

    return _preexec


def run_guarded_subprocess(
    args: list[str],
    *,
    timeout: int,
    cwd: str | None = None,
    env: Dict[str, str] | None = None,
    max_memory_mb: int = DEFAULT_MAX_MEMORY_MB,
) -> subprocess.CompletedProcess:
    """Run subprocess with baseline isolation and guardrails.

    Pass max_memory_mb=0 to skip POSIX RLIMIT_AS (used for Node.js where V8
    needs a larger virtual code range than a tight cap allows).
    """
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)

    return subprocess.run(
        args,
        capture_output=True,
        text=True,
        timeout=timeout,
        cwd=cwd,
        stdin=subprocess.DEVNULL,
        env=merged_env,
        start_new_session=True,
        preexec_fn=_posix_preexec_with_memory_limit(max_memory_mb),
    )


def truncate_output(output: str) -> tuple[str, bool]:
    """Trim oversized output to keep responses predictable."""
    if len(output) <= MAX_OUTPUT_CHARS:
        return output, False
    return output[:MAX_OUTPUT_CHARS] + "\n...output truncated", True


def build_result(
    *,
    success: bool,
    output: str,
    error: str | None,
    start_time: float,
    language: str,
    error_code: str | None = None,
    timed_out: bool = False,
) -> Dict[str, Any]:
    """Create a consistent executor response payload."""
    normalized_output, truncated = truncate_output(output or "")

    return {
        "success": success,
        "output": normalized_output,
        "error": error,
        "execution_time": (time.time() - start_time) * 1000,
        "language": language,
        "error_code": error_code,
        "timed_out": timed_out,
        "truncated": truncated,
    }
