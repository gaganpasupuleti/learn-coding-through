"""Java code executor with compilation and execution."""

import subprocess
import time
import tempfile
import os
import re
import shutil
from typing import Dict, Any

from .common import build_result, run_guarded_subprocess


def _collect_process_output(result: subprocess.CompletedProcess) -> str:
    """Merge stderr/stdout so compile and runtime errors surface on all platforms."""
    chunks = []
    for stream in (result.stderr, result.stdout):
        text = (stream or "").strip()
        if text and text not in chunks:
            chunks.append(text)
    return "\n".join(chunks)


def _compile_timeout_seconds(timeout: int) -> int:
    return max(2, min(timeout, 8))


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

    try:
        if not code or not code.strip():
            return build_result(
                success=False,
                output="",
                error="Code cannot be empty",
                start_time=start_time,
                language="java",
                error_code="validation_error",
            )

        class_match = re.search(r"public\s+class\s+(\w+)", code)
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
        compile_timeout = _compile_timeout_seconds(timeout)

        with tempfile.TemporaryDirectory() as temp_dir:
            java_file = os.path.join(temp_dir, f"{class_name}.java")

            try:
                with open(java_file, "w", encoding="utf-8") as handle:
                    handle.write(code)
            except OSError as exc:
                return build_result(
                    success=False,
                    output="",
                    error=f"Failed to write Java file: {exc}",
                    start_time=start_time,
                    language="java",
                    error_code="executor_error",
                )

            try:
                compile_result = run_guarded_subprocess(
                    ["javac", "-J-Xms32m", "-J-Xmx128m", java_file],
                    timeout=compile_timeout,
                    cwd=temp_dir,
                    # Skip POSIX RLIMIT_AS for the JVM (same reason as Node/V8):
                    # a JVM reserves far more *virtual* address space than a tight
                    # cap allows, so javac cannot start under it on Linux. Heap is
                    # still bounded by -Xmx128m and wall time by the timeout.
                    max_memory_mb=0,
                )
            except subprocess.TimeoutExpired:
                return build_result(
                    success=False,
                    output="",
                    error=f"Compilation timeout: exceeded {compile_timeout} seconds",
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
            except Exception as exc:
                return build_result(
                    success=False,
                    output="",
                    error=f"Compilation failed: {exc}",
                    start_time=start_time,
                    language="java",
                    error_code="executor_error",
                )

            if compile_result.returncode != 0:
                details = _collect_process_output(compile_result)
                return build_result(
                    success=False,
                    output="",
                    error=f"Compilation error:\n{details or 'javac failed with no diagnostic output'}",
                    start_time=start_time,
                    language="java",
                    error_code="compile_error",
                )

            try:
                exec_result = run_guarded_subprocess(
                    ["java", "-Xms32m", "-Xmx128m", class_name],
                    timeout=timeout,
                    cwd=temp_dir,
                    # Skip POSIX RLIMIT_AS for the JVM (same reason as Node/V8):
                    # virtual address-space reservation exceeds a tight cap. Heap
                    # stays bounded by -Xmx128m and wall time by the timeout.
                    max_memory_mb=0,
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
            except Exception as exc:
                return build_result(
                    success=False,
                    output="",
                    error=f"Execution failed: {exc}",
                    start_time=start_time,
                    language="java",
                    error_code="executor_error",
                )

            stdout = (exec_result.stdout or "").strip()
            if exec_result.returncode == 0:
                return build_result(
                    success=True,
                    output=stdout or "Java executed successfully",
                    error=None,
                    start_time=start_time,
                    language="java",
                    error_code=None,
                )

            details = _collect_process_output(exec_result)
            return build_result(
                success=False,
                output=stdout,
                error=f"Runtime error:\n{details or 'program exited with a non-zero status'}",
                start_time=start_time,
                language="java",
                error_code="runtime_error",
            )
    except Exception as exc:
        return build_result(
            success=False,
            output="",
            error=f"Java execution failed: {exc}",
            start_time=start_time,
            language="java",
            error_code="executor_error",
        )
