"""SQL code executor using SQLite in-memory database."""

import sqlite3
import time
from typing import Dict, Any


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
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                age INTEGER
            )
        """)
        cursor.execute("INSERT INTO users VALUES (5, 'John Doe', 'john@example.com', 25)")
        
        cursor.execute("""
            CREATE TABLE customers (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                city TEXT
            )
        """)
        cursor.execute("INSERT INTO customers VALUES (1, 'Alice Johnson', 'New York')")
        cursor.execute("INSERT INTO customers VALUES (2, 'Bob Smith', 'Los Angeles')")
        cursor.execute("INSERT INTO customers VALUES (3, 'Charlie Brown', 'Chicago')")
        
        cursor.execute("""
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY,
                customer_id INTEGER,
                total REAL,
                date TEXT
            )
        """)
        cursor.execute("INSERT INTO orders VALUES (101, 1, 150.00, '2024-01-15')")
        cursor.execute("INSERT INTO orders VALUES (102, 2, 75.50, '2024-01-16')")
        cursor.execute("INSERT INTO orders VALUES (103, 1, 200.00, '2024-01-17')")
        cursor.execute("INSERT INTO orders VALUES (104, 3, 125.75, '2024-01-18')")
        
        cursor.execute("""
            CREATE TABLE products (
                id INTEGER PRIMARY KEY,
                name TEXT,
                price REAL
            )
        """)
        
        conn.commit()
        
        # Execute user's SQL statements
        statements = [s.strip() for s in code.split(';') if s.strip() and not s.strip().startswith('--')]
        output_lines = []
        
        for statement in statements:
            try:
                cursor.execute(statement)
                
                # Check if it's a SELECT query
                if statement.upper().strip().startswith('SELECT'):
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
                elif statement.upper().strip().startswith('INSERT'):
                    output_lines.append(f"{cursor.rowcount} row(s) inserted")
                elif statement.upper().strip().startswith('UPDATE'):
                    output_lines.append(f"{cursor.rowcount} row(s) updated")
                elif statement.upper().strip().startswith('DELETE'):
                    output_lines.append(f"{cursor.rowcount} row(s) deleted")
                elif statement.upper().strip().startswith('CREATE'):
                    output_lines.append("Table created successfully")
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
