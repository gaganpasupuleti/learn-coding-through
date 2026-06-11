"""JavaScript code executor using Node.js subprocess."""

import subprocess
import time
from typing import Dict, Any

from .common import build_result, isolated_workspace, run_guarded_subprocess


def execute_javascript(code: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Execute JavaScript code using Node.js with timeout.
    
    Args:
        code: JavaScript code to execute
        timeout: Maximum execution time in seconds
        
    Returns:
        Dictionary with success, output, error, and execution_time
    """
    start_time = time.time()
    
    try:
        with isolated_workspace() as workspace:
            # Node/V8 reserves a large virtual code range; a tight RLIMIT_AS (e.g. 256MB)
            # causes "Fatal process OOM … CodeRange" on small containers (Railway).
            result = run_guarded_subprocess(
                ["node", "--max-old-space-size=128", "-e", code],
                timeout=timeout,
                cwd=workspace,
                max_memory_mb=0,
            )

        output = result.stdout.strip()
        error = result.stderr.strip() if result.returncode != 0 else None

        return build_result(
            success=result.returncode == 0,
            output=output or "JavaScript executed successfully",
            error=error,
            start_time=start_time,
            language="javascript",
            error_code=None if result.returncode == 0 else "runtime_error",
        )
    except subprocess.TimeoutExpired:
        return build_result(
            success=False,
            output="",
            error=f"Execution timeout: exceeded {timeout} seconds",
            start_time=start_time,
            language="javascript",
            error_code="timeout",
            timed_out=True,
        )
    except FileNotFoundError:
        return build_result(
            success=False,
            output="",
            error="Node.js runtime not found. Install Node.js and ensure 'node' is in PATH.",
            start_time=start_time,
            language="javascript",
            error_code="runtime_unavailable",
        )
    except Exception as e:
        return build_result(
            success=False,
            output="",
            error=str(e),
            start_time=start_time,
            language="javascript",
            error_code="executor_error",
        )
