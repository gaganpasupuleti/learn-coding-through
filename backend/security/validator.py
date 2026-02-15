"""Code validation and security checks."""

import re
from typing import Tuple


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
    ]
}


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
    language = language.lower()
    if language in ["js", "javascript"]:
        language = "javascript"
    elif language in ["py", "python"]:
        language = "python"
    
    # Get patterns for language
    patterns = DANGEROUS_PATTERNS.get(language, [])
    
    # Check for dangerous patterns
    for pattern in patterns:
        if re.search(pattern, code, re.IGNORECASE | re.MULTILINE):
            return False, f"Dangerous pattern detected: {pattern}"
    
    # Check code length
    if len(code) > 50000:
        return False, "Code is too long (max 50,000 characters)"
    
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
