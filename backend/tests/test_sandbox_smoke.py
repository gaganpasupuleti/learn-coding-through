"""Sandbox smoke tests for CI regression blocking."""

from __future__ import annotations

import shutil
import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from executors.javascript_executor import execute_javascript
from executors.java_executor import execute_java
from executors.python_executor import execute_python
from executors.sql_executor import execute_sql
from security.validator import validate_code


class SandboxSmokeTests(unittest.TestCase):
    def test_sql_policy_blocks_denylisted_keyword(self) -> None:
        is_valid, message = validate_code("PRAGMA foreign_keys=ON;", "sql")
        self.assertFalse(is_valid)
        self.assertTrue("pragma" in message.lower() or "sql policy" in message.lower())

    def test_sql_policy_allows_simple_select(self) -> None:
        is_valid, message = validate_code("SELECT 1 as ok;", "sql")
        self.assertTrue(is_valid)
        self.assertEqual(message, "")

    def test_python_executor_contract(self) -> None:
        result = execute_python("print('smoke')", timeout=3)
        self.assertIn("success", result)
        self.assertIn("language", result)
        self.assertEqual(result["language"], "python")
        self.assertTrue(result["success"])

    def test_sql_executor_contract_for_errors(self) -> None:
        result = execute_sql("SELECT * FROM table_that_does_not_exist;", timeout=3)
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "sql_error")
        self.assertEqual(result.get("language"), "sql")

    @unittest.skipUnless(shutil.which("node"), "node runtime not available")
    def test_javascript_executor_contract(self) -> None:
        result = execute_javascript("console.log('smoke')", timeout=3)
        self.assertIn("success", result)
        self.assertEqual(result.get("language"), "javascript")

    @unittest.skipUnless(shutil.which("node"), "node runtime not available")
    def test_javascript_hello_world(self) -> None:
        result = execute_javascript('console.log("Hello World")', timeout=3)
        self.assertTrue(result["success"])
        self.assertEqual(result.get("output"), "Hello World")

    @unittest.skipUnless(shutil.which("node"), "node runtime not available")
    def test_javascript_variables_sum(self) -> None:
        code = "const x = 10;\nconst y = 20;\nconsole.log(x + y);"
        result = execute_javascript(code, timeout=3)
        self.assertTrue(result["success"])
        self.assertEqual(result.get("output"), "30")

    @unittest.skipUnless(shutil.which("node"), "node runtime not available")
    def test_javascript_infinite_loop_times_out(self) -> None:
        result = execute_javascript("while (true) {}", timeout=2)
        self.assertFalse(result["success"])
        self.assertTrue(result.get("timed_out"))
        self.assertEqual(result.get("error_code"), "timeout")

    @unittest.skipUnless(shutil.which("javac") and shutil.which("java"), "java runtime not available")
    def test_java_executor_contract(self) -> None:
        code = "public class Main { public static void main(String[] args) { System.out.println(\"smoke\"); } }"
        result = execute_java(code, timeout=5)
        self.assertIn("success", result)
        self.assertEqual(result.get("language"), "java")
        self.assertTrue(result["success"])

    @unittest.skipUnless(shutil.which("javac") and shutil.which("java"), "java runtime not available")
    def test_java_compile_error_is_structured(self) -> None:
        result = execute_java(
            "public class Main { public static void main(String[] args) { int x = } }",
            timeout=3,
        )
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "compile_error")
        self.assertIn("Compilation error:", result.get("error", ""))

    @unittest.skipUnless(shutil.which("javac") and shutil.which("java"), "java runtime not available")
    def test_java_runtime_error_is_structured(self) -> None:
        result = execute_java(
            'public class Main { public static void main(String[] args) { throw new RuntimeException("boom"); } }',
            timeout=3,
        )
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "runtime_error")
        self.assertIn("Runtime error:", result.get("error", ""))

    def test_java_empty_code_is_safe(self) -> None:
        result = execute_java("", timeout=3)
        self.assertFalse(result["success"])
        self.assertEqual(result.get("error_code"), "validation_error")

    @unittest.skipUnless(shutil.which("javac") and shutil.which("java"), "java runtime not available")
    def test_java_infinite_loop_times_out(self) -> None:
        result = execute_java(
            "public class Main { public static void main(String[] args) { while (true) {} } }",
            timeout=2,
        )
        self.assertFalse(result["success"])
        self.assertTrue(result.get("timed_out"))
        self.assertEqual(result.get("error_code"), "timeout")


if __name__ == "__main__":
    unittest.main(verbosity=2)
