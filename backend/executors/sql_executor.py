"""SQL code executor using SQLite in-memory database."""

import sqlite3
import time
from typing import Dict, Any, List

from .common import build_result

# Preview rows for API / UI (must match _bootstrap_practice_schema seed data).
PRACTICE_SAMPLE_ROWS: Dict[str, List[Dict[str, Any]]] = {
    "users": [
        {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 25},
        {"id": 2, "name": "Priya Shah", "email": "priya@example.com", "age": 22},
        {"id": 3, "name": "Rahul Verma", "email": "rahul@example.com", "age": 28},
    ],
    "customers": [
        {"id": 1, "name": "Alice Johnson", "city": "New York"},
        {"id": 2, "name": "Bob Smith", "city": "Los Angeles"},
        {"id": 3, "name": "Charlie Brown", "city": "Chicago"},
    ],
    "orders": [
        {"id": 101, "customer_id": 1, "total": 150.0, "order_date": "2024-01-15"},
        {"id": 102, "customer_id": 2, "total": 75.5, "order_date": "2024-01-16"},
        {"id": 103, "customer_id": 1, "total": 200.0, "order_date": "2024-01-17"},
        {"id": 104, "customer_id": 3, "total": 125.75, "order_date": "2024-01-18"},
    ],
    "products": [
        {"id": 1, "name": "Laptop", "category": "Electronics", "price": 899.99, "stock": 12},
        {"id": 2, "name": "Mouse", "category": "Electronics", "price": 19.99, "stock": 120},
        {"id": 3, "name": "Notebook", "category": "Stationery", "price": 3.99, "stock": 250},
    ],
    "students": [
        {"id": 1, "full_name": "Ananya Reddy", "cohort": "2026-A", "score": 88},
        {"id": 2, "full_name": "Kiran Patel", "cohort": "2026-A", "score": 74},
        {"id": 3, "full_name": "Meera Nair", "cohort": "2026-B", "score": 92},
    ],
    "courses": [
        {"id": 1, "title": "Python Foundations", "level": "beginner", "duration_weeks": 4},
        {"id": 2, "title": "SQL for Analysts", "level": "intermediate", "duration_weeks": 3},
        {"id": 3, "title": "Java OOP", "level": "intermediate", "duration_weeks": 5},
    ],
    "enrollments": [
        {"id": 1, "student_id": 1, "course_id": 1, "status": "active"},
        {"id": 2, "student_id": 1, "course_id": 2, "status": "completed"},
        {"id": 3, "student_id": 2, "course_id": 1, "status": "active"},
        {"id": 4, "student_id": 3, "course_id": 3, "status": "active"},
    ],
}


PRACTICE_SCHEMA = {
    "tables": [
        {
            "name": "users",
            "primary_key": "id",
            "columns": ["id", "name", "email", "age"],
            "description": "Platform users with profile basics.",
        },
        {
            "name": "customers",
            "primary_key": "id",
            "columns": ["id", "name", "city"],
            "description": "Customer master list for order joins.",
        },
        {
            "name": "orders",
            "primary_key": "id",
            "columns": ["id", "customer_id", "total", "order_date"],
            "description": "Order transactions linked to customers.",
        },
        {
            "name": "products",
            "primary_key": "id",
            "columns": ["id", "name", "category", "price", "stock"],
            "description": "Product catalog and inventory details.",
        },
        {
            "name": "students",
            "primary_key": "id",
            "columns": ["id", "full_name", "cohort", "score"],
            "description": "Student details for learning analytics joins.",
        },
        {
            "name": "courses",
            "primary_key": "id",
            "columns": ["id", "title", "level", "duration_weeks"],
            "description": "Courses available in the training program.",
        },
        {
            "name": "enrollments",
            "primary_key": "id",
            "columns": ["id", "student_id", "course_id", "status"],
            "description": "Student-course mapping table for join practice.",
        },
    ]
}


def get_practice_schema() -> Dict[str, Any]:
    """Return SQL practice schema metadata and sample rows (Excel/CSV-friendly preview)."""
    tables_out: List[Dict[str, Any]] = []
    for table in PRACTICE_SCHEMA["tables"]:
        name = table["name"]
        tables_out.append({**table, "sample_rows": PRACTICE_SAMPLE_ROWS.get(name, [])})
    return {"tables": tables_out}


def _bootstrap_practice_schema(cursor: sqlite3.Cursor):
    """Create and seed in-memory SQL practice tables."""
    cursor.execute(
        """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            age INTEGER
        )
        """
    )
    cursor.executemany(
        "INSERT INTO users (id, name, email, age) VALUES (?, ?, ?, ?)",
        [
            (1, "John Doe", "john@example.com", 25),
            (2, "Priya Shah", "priya@example.com", 22),
            (3, "Rahul Verma", "rahul@example.com", 28),
        ],
    )

    cursor.execute(
        """
        CREATE TABLE customers (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            city TEXT
        )
        """
    )
    cursor.executemany(
        "INSERT INTO customers (id, name, city) VALUES (?, ?, ?)",
        [
            (1, "Alice Johnson", "New York"),
            (2, "Bob Smith", "Los Angeles"),
            (3, "Charlie Brown", "Chicago"),
        ],
    )

    cursor.execute(
        """
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            total REAL,
            order_date TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
        """
    )
    cursor.executemany(
        "INSERT INTO orders (id, customer_id, total, order_date) VALUES (?, ?, ?, ?)",
        [
            (101, 1, 150.00, "2024-01-15"),
            (102, 2, 75.50, "2024-01-16"),
            (103, 1, 200.00, "2024-01-17"),
            (104, 3, 125.75, "2024-01-18"),
        ],
    )

    cursor.execute(
        """
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            category TEXT,
            price REAL,
            stock INTEGER
        )
        """
    )
    cursor.executemany(
        "INSERT INTO products (id, name, category, price, stock) VALUES (?, ?, ?, ?, ?)",
        [
            (1, "Laptop", "Electronics", 899.99, 12),
            (2, "Mouse", "Electronics", 19.99, 120),
            (3, "Notebook", "Stationery", 3.99, 250),
        ],
    )

    cursor.execute(
        """
        CREATE TABLE students (
            id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            cohort TEXT,
            score INTEGER
        )
        """
    )
    cursor.executemany(
        "INSERT INTO students (id, full_name, cohort, score) VALUES (?, ?, ?, ?)",
        [
            (1, "Ananya Reddy", "2026-A", 88),
            (2, "Kiran Patel", "2026-A", 74),
            (3, "Meera Nair", "2026-B", 92),
        ],
    )

    cursor.execute(
        """
        CREATE TABLE courses (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            level TEXT,
            duration_weeks INTEGER
        )
        """
    )
    cursor.executemany(
        "INSERT INTO courses (id, title, level, duration_weeks) VALUES (?, ?, ?, ?)",
        [
            (1, "Python Foundations", "beginner", 4),
            (2, "SQL for Analysts", "intermediate", 3),
            (3, "Java OOP", "intermediate", 5),
        ],
    )

    cursor.execute(
        """
        CREATE TABLE enrollments (
            id INTEGER PRIMARY KEY,
            student_id INTEGER,
            course_id INTEGER,
            status TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
        """
    )
    cursor.executemany(
        "INSERT INTO enrollments (id, student_id, course_id, status) VALUES (?, ?, ?, ?)",
        [
            (1, 1, 1, "active"),
            (2, 1, 2, "completed"),
            (3, 2, 1, "active"),
            (4, 3, 3, "active"),
        ],
    )


def execute_sql(code: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Execute SQL code using SQLite in-memory database.
    
    Args:
        code: SQL code to execute
        timeout: Maximum execution time in seconds (not strictly enforced for SQLite)
        
    Returns:
        Dictionary with success, output, error, and execution_time
    """
    start_time = time.time()
    
    try:
        # Create in-memory database
        conn = sqlite3.connect(":memory:")
        conn.row_factory = sqlite3.Row  # Enable column access by name
        cursor = conn.cursor()
        
        # Pre-populate with sample tables
        _bootstrap_practice_schema(cursor)
        
        conn.commit()
        
        # Execute user's SQL statements
        sql_without_line_comments = "\n".join(
            line for line in code.splitlines() if not line.strip().startswith("--")
        )
        statements = [s.strip() for s in sql_without_line_comments.split(';') if s.strip()]
        output_lines = []
        statement_errors = []
        
        for statement in statements:
            try:
                upper_stmt = statement.upper().strip()

                # SQLite does not support CREATE DATABASE; emulate success for learning flows.
                if upper_stmt.startswith('CREATE DATABASE'):
                    db_name = statement.strip().split()[-1].rstrip(';')
                    output_lines.append(f"Database '{db_name}' created successfully")
                    continue

                cursor.execute(statement)
                
                # Check if it's a SELECT query
                if upper_stmt.startswith('SELECT'):
                    rows = cursor.fetchall()
                    
                    if rows:
                        # Get column names
                        columns = [description[0] for description in cursor.description]
                        
                        # Format as table
                        header = " | ".join(columns)
                        separator = "-+-".join(["---"] * len(columns))
                        
                        output_lines.append(header)
                        output_lines.append(separator)
                        
                        for row in rows:
                            values = [str(row[col]) if row[col] is not None else "NULL" for col in columns]
                            output_lines.append(" | ".join(values))
                        
                        output_lines.append(f"\n{len(rows)} row(s) returned")
                    else:
                        output_lines.append("0 rows returned")
                elif upper_stmt.startswith('INSERT'):
                    output_lines.append(f"{cursor.rowcount} row(s) inserted")
                elif upper_stmt.startswith('UPDATE'):
                    output_lines.append(f"{cursor.rowcount} row(s) updated")
                elif upper_stmt.startswith('DELETE'):
                    output_lines.append(f"{cursor.rowcount} row(s) deleted")
                elif upper_stmt.startswith('CREATE TABLE'):
                    output_lines.append("Table created successfully")
                elif upper_stmt.startswith('CREATE'):
                    output_lines.append("Object created successfully")
                else:
                    output_lines.append(f"Executed: {statement[:50]}...")
                
                conn.commit()
            except sqlite3.Error as e:
                message = str(e)
                output_lines.append(f"Error: {message}")
                statement_errors.append(message)
        
        conn.close()
        
        output = "\n".join(output_lines)

        return build_result(
            success=len(statement_errors) == 0,
            output=output or "SQL executed successfully",
            error="; ".join(statement_errors) if statement_errors else None,
            start_time=start_time,
            language="sql",
            error_code="sql_error" if statement_errors else None,
        )
    except Exception as e:
        return build_result(
            success=False,
            output="",
            error=str(e),
            start_time=start_time,
            language="sql",
            error_code="executor_error",
        )
