# Code Execution Backend

This directory contains the backend infrastructure for secure code execution across multiple programming languages.

## Architecture

The backend provides real code execution for:
- **Python** - Using subprocess with Python 3
- **JavaScript** - Using Node.js
- **Java** - Compilation with javac and execution with java
- **SQL** - In-memory SQLite database with pre-populated sample data

## Directory Structure

```
backend/
├── app/                          # FastAPI application
│   ├── api/v1/execute.py        # Code execution endpoint
│   └── main.py                  # Application entry point
├── executors/                   # Language-specific executors
│   ├── python_executor.py       # Python code execution
│   ├── javascript_executor.py   # JavaScript/Node.js execution
│   ├── java_executor.py         # Java compilation & execution
│   └── sql_executor.py          # SQLite execution
├── models/                      # Pydantic models
│   └── schemas.py               # Request/Response schemas
├── security/                    # Security layer
│   └── validator.py             # Code validation & safety checks
├── Dockerfile                   # Docker configuration
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## API Endpoint

### POST /api/v1/execute

Execute code in the specified language.

**Request:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello, World!",
  "error": null,
  "execution_time": 15.23
}
```

**Supported Languages:**
- `python` or `py`
- `javascript` or `js`
- `java`
- `sql`

## Security Features

### Code Validation
Before execution, all code is checked for dangerous patterns:

**Python:**
- `import os`, `import subprocess`, `import sys`
- `__import__`, `exec`, `eval`, `compile`
- `open()` function calls

**JavaScript:**
- `require('fs')`, `require('child_process')`
- `process.exit`, `process.env`
- `eval()`, `Function()` constructor

**Java:**
- `Runtime.getRuntime()`, `ProcessBuilder`
- File I/O operations
- `System.exit()`

**SQL:**
- `ATTACH DATABASE`, `PRAGMA`
- `LOAD_EXTENSION`

### Execution Limits
- **Timeout**: 5 seconds per execution
- **Output Limit**: 10,000 characters
- **Process Isolation**: Each execution runs in isolated subprocess
- **No File System Access**: Code cannot read/write files

## SQL Sample Data

The SQL executor pre-populates an in-memory database with sample tables:

**users table:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  age INTEGER
);
INSERT INTO users VALUES (5, 'John Doe', 'john@example.com', 25);
```

**customers table:**
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT
);
-- Pre-populated with 3 sample customers
```

**orders table:**
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  total REAL,
  date TEXT
);
-- Pre-populated with 4 sample orders
```

**products table:**
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price REAL
);
-- Empty table ready for use
```

## Docker Setup

The Docker image includes:
- Python 3.11
- Node.js
- OpenJDK (Java)
- All required dependencies

### Building the Image

```bash
cd backend
docker build -t code-execution-backend .
```

### Running the Container

```bash
docker run -p 8000:8000 code-execution-backend
```

## Development

### Installing Dependencies

```bash
pip install -r requirements.txt
```

### Running Locally

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing

Test individual executors:

```python
from executors.python_executor import execute_python

result = execute_python('print("Hello, World!")')
print(result)
```

Test the API endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"Hello, World!\")", "language": "python"}'
```

## Error Handling

The API returns appropriate HTTP status codes:

- **200 OK**: Successful execution (even if user code has errors)
- **400 Bad Request**: Invalid request (dangerous code patterns, unsupported language)
- **500 Internal Server Error**: Server-side execution failure

Execution errors are returned in the response:

```json
{
  "success": false,
  "output": "",
  "error": "NameError: name 'x' is not defined",
  "execution_time": 12.45
}
```

## Frontend Integration

The frontend uses `src/lib/api.ts` to communicate with this backend:

```typescript
import { executeCode } from '@/lib/api'

const result = await executeCode('print("Hello")', 'python')
console.log(result.output)
```

The `src/lib/sandbox.ts` module wraps the API client and maintains backward compatibility with existing components.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Subprocess Isolation**: All code runs in isolated subprocesses with timeouts
2. **Pattern Validation**: Dangerous imports and operations are blocked
3. **No Network Access**: Executed code cannot make network requests
4. **No File System**: Code cannot read or write files
5. **Resource Limits**: Timeout and output limits prevent abuse

While these measures significantly reduce risk, **never expose this API to untrusted users without additional sandboxing** (containers, VMs, or specialized sandbox solutions).

## Future Enhancements

Potential improvements:
- [ ] Add more languages (C++, Go, Rust, etc.)
- [ ] Implement rate limiting per user/IP
- [ ] Add memory usage limits
- [ ] Implement code execution queueing
- [ ] Add support for multi-file projects
- [ ] Implement persistent storage for SQL exercises
