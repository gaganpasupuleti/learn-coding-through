"""Python code executor using subprocess."""

import subprocess
import time
from typing import Dict, Any


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
        result = subprocess.run(
            ["python3", "-c", code],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        execution_time = (time.time() - start_time) * 1000  # Convert to ms
        
        output = result.stdout.strip()
        error = result.stderr.strip() if result.returncode != 0 else None
        
        # Limit output length
        max_length = 10000
        if output and len(output) > max_length:
            output = output[:max_length] + "\n...output truncated"
        
        return {
            "success": result.returncode == 0,
            "output": output or "Python executed successfully",
            "error": error,
            "execution_time": execution_time
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": f"Execution timeout: exceeded {timeout} seconds",
            "execution_time": timeout * 1000
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": str(e),
            "execution_time": (time.time() - start_time) * 1000
        }
