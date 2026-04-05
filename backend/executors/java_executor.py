"""Java code executor with compilation and execution."""

import subprocess
import time
import tempfile
import os
import re
import shutil
from typing import Dict, Any

from .common import build_result, run_guarded_subprocess


def verify_java_runtime_setup() -> None:
    """Validate Java compiler/runtime availability with actionable errors."""
    missing_tools = [tool for tool in ("javac", "java") if shutil.which(tool) is None]
    if missing_tools:
        tool_list = ", ".join(missing_tools)
        raise RuntimeError(
            f"Missing Java tools on PATH: {tool_list}. Install a JDK and ensure PATH includes both javac and java."
        )

    for tool in ("javac", "java"):
        try:
            subprocess.run([tool, "-version"], capture_output=True, text=True, timeout=5, check=True)
        except subprocess.TimeoutExpired as exc:
            raise RuntimeError(
                f"{tool} version check timed out. Verify Java installation and PATH configuration."
            ) from exc
        except subprocess.CalledProcessError as exc:
            detail = (exc.stderr or exc.stdout or "").strip()
            raise RuntimeError(
                f"{tool} version check failed: {detail or 'unknown error'}. Verify Java installation."
            ) from exc


def execute_java(code: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Compile and execute Java code using javac and java.
    
    Args:
        code: Java code to execute (must contain a class with main method)
        timeout: Maximum execution time in seconds
        
    Returns:
        Dictionary with success, output, error, and execution_time
    """
    start_time = time.time()
    
    # Extract class name from code
    class_match = re.search(r'public\s+class\s+(\w+)', code)
    if not class_match:
        return build_result(
            success=False,
            output="",
            error="No public class found in Java code",
            start_time=start_time,
            language="java",
            error_code="validation_error",
        )
    
    class_name = class_match.group(1)
    
    # Create temporary directory for Java files
    with tempfile.TemporaryDirectory() as temp_dir:
        java_file = os.path.join(temp_dir, f"{class_name}.java")
        
        # Write Java code to file
        try:
            with open(java_file, 'w') as f:
                f.write(code)
        except Exception as e:
            return build_result(
                success=False,
                output="",
                error=f"Failed to write Java file: {str(e)}",
                start_time=start_time,
                language="java",
                error_code="executor_error",
            )
        
        # Compile Java code
        try:
            compile_result = run_guarded_subprocess(
                ["javac", "-J-Xms32m", "-J-Xmx128m", java_file],
                timeout=timeout,
                cwd=temp_dir,
                max_memory_mb=384,
            )
            
            if compile_result.returncode != 0:
                return build_result(
                    success=False,
                    output="",
                    error=f"Compilation error:\n{compile_result.stderr}",
                    start_time=start_time,
                    language="java",
                    error_code="compile_error",
                )
        except subprocess.TimeoutExpired:
            return build_result(
                success=False,
                output="",
                error=f"Compilation timeout: exceeded {timeout} seconds",
                start_time=start_time,
                language="java",
                error_code="timeout",
                timed_out=True,
            )
        except FileNotFoundError:
            return build_result(
                success=False,
                output="",
                error="Java compiler not found. Install JDK and add 'javac' to PATH.",
                start_time=start_time,
                language="java",
                error_code="runtime_unavailable",
            )
        except Exception as e:
            return build_result(
                success=False,
                output="",
                error=f"Compilation failed: {str(e)}",
                start_time=start_time,
                language="java",
                error_code="executor_error",
            )
        
        # Execute Java code
        try:
            exec_result = run_guarded_subprocess(
                ["java", "-Xms32m", "-Xmx128m", class_name],
                timeout=timeout,
                cwd=temp_dir,
                max_memory_mb=384,
            )
            
            output = exec_result.stdout.strip()
            error = exec_result.stderr.strip() if exec_result.returncode != 0 else None

            return build_result(
                success=exec_result.returncode == 0,
                output=output or "Java executed successfully",
                error=error,
                start_time=start_time,
                language="java",
                error_code=None if exec_result.returncode == 0 else "runtime_error",
            )
        except subprocess.TimeoutExpired:
            return build_result(
                success=False,
                output="",
                error=f"Execution timeout: exceeded {timeout} seconds",
                start_time=start_time,
                language="java",
                error_code="timeout",
                timed_out=True,
            )
        except FileNotFoundError:
            return build_result(
                success=False,
                output="",
                error="Java runtime not found. Install JDK and add 'java' to PATH.",
                start_time=start_time,
                language="java",
                error_code="runtime_unavailable",
            )
        except Exception as e:
            return build_result(
                success=False,
                output="",
                error=f"Execution failed: {str(e)}",
                start_time=start_time,
                language="java",
                error_code="executor_error",
            )
