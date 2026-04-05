"""Python code executor using subprocess."""

import subprocess
import sys
import time
from typing import Dict, Any

from .common import build_result, isolated_workspace, run_guarded_subprocess


def execute_python(code: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Execute Python code using subprocess with timeout.
    
    Args:
        code: Python code to execute
        timeout: Maximum execution time in seconds
        
    Returns:
        Dictionary with success, output, error, and execution_time
    """
    start_time = time.time()
    
    try:
        with isolated_workspace() as workspace:
            result = run_guarded_subprocess(
                [sys.executable, "-I", "-B", "-c", code],
                timeout=timeout,
                cwd=workspace,
                env={"PYTHONNOUSERSITE": "1", "PYTHONUNBUFFERED": "1"},
                max_memory_mb=256,
            )

        output = result.stdout.strip()
        error = result.stderr.strip() if result.returncode != 0 else None

        return build_result(
            success=result.returncode == 0,
            output=output or "Python executed successfully",
            error=error,
            start_time=start_time,
            language="python",
            error_code=None if result.returncode == 0 else "runtime_error",
        )
    except subprocess.TimeoutExpired:
        return build_result(
            success=False,
            output="",
            error=f"Execution timeout: exceeded {timeout} seconds",
            start_time=start_time,
            language="python",
            error_code="timeout",
            timed_out=True,
        )
    except Exception as e:
        return build_result(
            success=False,
            output="",
            error=str(e),
            start_time=start_time,
            language="python",
            error_code="executor_error",
        )
