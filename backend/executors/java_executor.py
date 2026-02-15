"""Java code executor with compilation and execution."""

import subprocess
import time
import tempfile
import os
import re
from typing import Dict, Any


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
        return {
            "success": False,
            "output": "",
            "error": "No public class found in Java code",
            "execution_time": (time.time() - start_time) * 1000
        }
    
    class_name = class_match.group(1)
    
    # Create temporary directory for Java files
    with tempfile.TemporaryDirectory() as temp_dir:
        java_file = os.path.join(temp_dir, f"{class_name}.java")
        
        # Write Java code to file
        try:
            with open(java_file, 'w') as f:
                f.write(code)
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Failed to write Java file: {str(e)}",
                "execution_time": (time.time() - start_time) * 1000
            }
        
        # Compile Java code
        try:
            compile_result = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=temp_dir
            )
            
            if compile_result.returncode != 0:
                return {
                    "success": False,
                    "output": "",
                    "error": f"Compilation error:\n{compile_result.stderr}",
                    "execution_time": (time.time() - start_time) * 1000
                }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": f"Compilation timeout: exceeded {timeout} seconds",
                "execution_time": timeout * 1000
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Compilation failed: {str(e)}",
                "execution_time": (time.time() - start_time) * 1000
            }
        
        # Execute Java code
        try:
            exec_result = subprocess.run(
                ["java", class_name],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=temp_dir
            )
            
            execution_time = (time.time() - start_time) * 1000  # Convert to ms
            
            output = exec_result.stdout.strip()
            error = exec_result.stderr.strip() if exec_result.returncode != 0 else None
            
            # Limit output length
            max_length = 10000
            if output and len(output) > max_length:
                output = output[:max_length] + "\n...output truncated"
            
            return {
                "success": exec_result.returncode == 0,
                "output": output or "Java executed successfully",
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
                "error": f"Execution failed: {str(e)}",
                "execution_time": (time.time() - start_time) * 1000
            }
