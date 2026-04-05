"""Code validation and security checks."""

import re
from dataclasses import dataclass
from typing import List, Tuple


# Dangerous patterns to check for
DANGEROUS_PATTERNS = {
    "python": [
        r"import\s+os",
        r"import\s+subprocess",
        r"import\s+sys",
        r"from\s+os\s+import",
        r"from\s+subprocess\s+import",
        r"__import__\s*\(",
        r"exec\s*\(",
        r"eval\s*\(",
        r"open\s*\(",
        r"compile\s*\(",
        r"__builtins__",
    ],
    "javascript": [
        r"require\s*\(\s*['\"]fs['\"]",
        r"require\s*\(\s*['\"]child_process['\"]",
        r"require\s*\(\s*['\"]net['\"]",
        r"process\.exit",
        r"process\.env",
        r"global\.",
        r"eval\s*\(",
        r"Function\s*\(",
    ],
    "java": [
        r"import\s+java\.io\.File",
        r"import\s+java\.lang\.Runtime",
        r"import\s+java\.lang\.Process",
        r"Runtime\.getRuntime",
        r"ProcessBuilder",
        r"FileInputStream",
        r"FileOutputStream",
        r"System\.exit",
    ],
    "sql": [
        r"ATTACH\s+DATABASE",
        r"DETACH\s+DATABASE",
        r"PRAGMA",
        r"LOAD_EXTENSION",
        r"\bTRIGGER\b",
        r"\bTEMP\s+TABLE\b",
        r"\bVACUUM\b",
        r"\bANALYZE\b",
    ]
}

SQL_ALLOWED_STATEMENT_PREFIXES = {
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE TABLE",
    "DROP TABLE",
    "ALTER TABLE",
    "WITH",
    "EXPLAIN",
}

SQL_DENYLIST_KEYWORDS = {
    "ATTACH",
    "DETACH",
    "PRAGMA",
    "LOAD_EXTENSION",
    "VACUUM",
    "ANALYZE",
    "REINDEX",
    "CREATE TRIGGER",
    "DROP TRIGGER",
    "CREATE VIEW",
    "DROP VIEW",
    "CREATE INDEX",
    "DROP INDEX",
}

MAX_CODE_LENGTH = 50_000
MAX_SQL_STATEMENTS = 25
MAX_SQL_STATEMENT_LENGTH = 4_000


@dataclass
class SQLPolicyViolation:
    statement_index: int
    rule_id: str
    message: str
    statement_preview: str


def _normalize_language(language: str) -> str:
    normalized = language.lower()
    if normalized in ["js", "javascript"]:
        return "javascript"
    if normalized in ["py", "python"]:
        return "python"
    return normalized


def _split_sql_statements(sql: str) -> List[str]:
    """Split SQL into statements while respecting quoted strings."""
    statements: List[str] = []
    buffer: List[str] = []
    in_single_quote = False
    in_double_quote = False

    for ch in sql:
        if ch == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
        elif ch == '"' and not in_single_quote:
            in_double_quote = not in_double_quote

        if ch == ";" and not in_single_quote and not in_double_quote:
            statement = "".join(buffer).strip()
            if statement:
                statements.append(statement)
            buffer = []
        else:
            buffer.append(ch)

    trailing = "".join(buffer).strip()
    if trailing:
        statements.append(trailing)

    return statements


def evaluate_sql_policy(code: str) -> List[SQLPolicyViolation]:
    """Evaluate SQL against allowlist/denylist and per-statement constraints."""
    statements = _split_sql_statements(code)
    violations: List[SQLPolicyViolation] = []

    if len(statements) > MAX_SQL_STATEMENTS:
        violations.append(
            SQLPolicyViolation(
                statement_index=0,
                rule_id="sql.max_statements",
                message=f"Too many SQL statements ({len(statements)}). Max is {MAX_SQL_STATEMENTS}.",
                statement_preview="",
            )
        )
        return violations

    for index, statement in enumerate(statements, start=1):
        compact = re.sub(r"\s+", " ", statement).strip()
        upper = compact.upper()
        preview = compact[:120]

        if len(compact) > MAX_SQL_STATEMENT_LENGTH:
            violations.append(
                SQLPolicyViolation(
                    statement_index=index,
                    rule_id="sql.max_statement_length",
                    message=(
                        f"Statement {index} exceeds max length "
                        f"({MAX_SQL_STATEMENT_LENGTH} characters)."
                    ),
                    statement_preview=preview,
                )
            )

        if not any(upper.startswith(prefix) for prefix in SQL_ALLOWED_STATEMENT_PREFIXES):
            violations.append(
                SQLPolicyViolation(
                    statement_index=index,
                    rule_id="sql.disallowed_statement_type",
                    message=(
                        f"Statement {index} starts with a disallowed command. "
                        "Allowed: SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, "
                        "DROP TABLE, ALTER TABLE, WITH, EXPLAIN."
                    ),
                    statement_preview=preview,
                )
            )

        for keyword in SQL_DENYLIST_KEYWORDS:
            if keyword in upper:
                violations.append(
                    SQLPolicyViolation(
                        statement_index=index,
                        rule_id="sql.denylist_keyword",
                        message=f"Statement {index} contains blocked keyword: {keyword}",
                        statement_preview=preview,
                    )
                )
                break

    return violations


def validate_code(code: str, language: str) -> Tuple[bool, str]:
    """
    Validate code for dangerous patterns.
    
    Args:
        code: Code to validate
        language: Programming language (python, javascript, java, sql)
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not code or not code.strip():
        return False, "Code cannot be empty"
    
    # Normalize language name
    language = _normalize_language(language)
    
    # Get patterns for language
    patterns = DANGEROUS_PATTERNS.get(language, [])
    
    # Check for dangerous patterns
    for pattern in patterns:
        if re.search(pattern, code, re.IGNORECASE | re.MULTILINE):
            return False, f"Dangerous pattern detected: {pattern}"
    
    # Check code length
    if len(code) > MAX_CODE_LENGTH:
        return False, f"Code is too long (max {MAX_CODE_LENGTH:,} characters)"

    if language == "sql":
        violations = evaluate_sql_policy(code)
        if violations:
            first = violations[0]
            return (
                False,
                f"SQL policy violation [{first.rule_id}] in statement {first.statement_index}: {first.message}",
            )
    
    return True, ""


def sanitize_output(output: str, max_length: int = 10000) -> str:
    """
    Sanitize and truncate output.
    
    Args:
        output: Output to sanitize
        max_length: Maximum length of output
        
    Returns:
        Sanitized output
    """
    if not output:
        return ""
    
    # Truncate if needed
    if len(output) > max_length:
        return output[:max_length] + "\n...output truncated"
    
    return output
