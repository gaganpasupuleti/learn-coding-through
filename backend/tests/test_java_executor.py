"""Focused Java executor tests for Code Workbench Phase 13."""

import shutil
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from executors.java_executor import execute_java


JAVA_AVAILABLE = shutil.which("javac") and shutil.which("java")


class JavaExecutorTests(unittest.TestCase):
    @unittest.skipUnless(JAVA_AVAILABLE, "java runtime not available")
    def test_java_hello_world_stdout(self) -> None:
        code = (
            'public class Main { public static void main(String[] args) {'
            ' System.out.println("Hello, Java!"); } }'
        )
        result = execute_java(code, timeout=5)
        self.assertTrue(result["success"])
        self.assertEqual(result.get("output"), "Hello, Java!")

    @unittest.skipUnless(JAVA_AVAILABLE, "java runtime not available")
    def test_java_simple_arithmetic_stdout(self) -> None:
        code = (
            "public class Main { public static void main(String[] args) {"
            " int a = 10; int b = 20; System.out.println(a + b); } }"
        )
        result = execute_java(code, timeout=5)
        self.assertTrue(result["success"])
        self.assertEqual(result.get("output"), "30")

    @unittest.skipUnless(JAVA_AVAILABLE, "java runtime not available")
    def test_java_compile_error_returns_friendly_error(self) -> None:
        result = execute_java(
            "public class Main { public static void main(String[] args) { int x = } }",
            timeout=3,
        )
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "compile_error")
        self.assertIn("Compilation error:", result.get("error", ""))

    @unittest.skipUnless(JAVA_AVAILABLE, "java runtime not available")
    def test_java_timeout_is_handled(self) -> None:
        result = execute_java(
            "public class Main { public static void main(String[] args) { while (true) {} } }",
            timeout=2,
        )
        self.assertFalse(result["success"])
        self.assertTrue(result.get("timed_out"))
        self.assertEqual(result.get("error_code"), "timeout")

    def test_java_missing_public_class_validation(self) -> None:
        result = execute_java('class Main { public static void main(String[] args) {} }', timeout=3)
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "validation_error")

    @patch("executors.java_executor.run_guarded_subprocess", side_effect=FileNotFoundError)
    def test_missing_jdk_returns_runtime_unavailable(self, _mock_run: object) -> None:
        result = execute_java(
            'public class Main { public static void main(String[] args) { System.out.println("x"); } }',
            timeout=3,
        )
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "runtime_unavailable")


if __name__ == "__main__":
    unittest.main(verbosity=2)
