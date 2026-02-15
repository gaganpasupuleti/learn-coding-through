"""Code execution modules for different programming languages."""

from .python_executor import execute_python
from .javascript_executor import execute_javascript
from .java_executor import execute_java
from .sql_executor import execute_sql, get_practice_schema

__all__ = [
    "execute_python",
    "execute_javascript",
    "execute_java",
    "execute_sql",
    "get_practice_schema",
]
