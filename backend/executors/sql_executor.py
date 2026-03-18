"""SQL code executor using SQLite in-memory database."""

import sqlite3
import time
from typing import Dict, Any


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
    """Return SQL practice schema metadata for frontend display."""
    return PRACTICE_SCHEMA


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
                output_lines.append(f"Error: {str(e)}")
        
        conn.close()
        
        execution_time = (time.time() - start_time) * 1000  # Convert to ms
        
        output = "\n".join(output_lines)
        
        # Limit output length
        max_length = 10000
        if output and len(output) > max_length:
            output = output[:max_length] + "\n...output truncated"
        
        return {
            "success": True,
            "output": output or "SQL executed successfully",
            "error": None,
            "execution_time": execution_time
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": str(e),
            "execution_time": (time.time() - start_time) * 1000
        }
