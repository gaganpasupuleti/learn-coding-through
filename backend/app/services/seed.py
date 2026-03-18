import json
import logging
from typing import Any

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.models import (
    DifficultyLevel,
    ProjectCatalog,
    ProjectCatalogStep,
    Quiz,
    QuizCatalog,
    QuizCatalogQuestion,
    QuizQuestion,
    Role,
    Stage,
    User,
    UserRole,
)

logger = logging.getLogger(__name__)


def seed_default_roles(db: Session):
    role_payloads = [
        {
            "name": "Data Analyst",
            "skills_required": ["SQL", "Python", "Excel", "Power BI", "Statistics"],
            "salary_range": "$55k - $110k",
            "companies_hiring": ["Accenture", "Deloitte", "Amazon", "TCS"],
            "difficulty": DifficultyLevel.BEGINNER,
            "duration": 24,
        },
        {
            "name": "Python Backend Developer",
            "skills_required": ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Testing"],
            "salary_range": "$70k - $140k",
            "companies_hiring": ["PayPal", "Swiggy", "Razorpay", "Zoho"],
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "duration": 28,
        },
        {
            "name": "Data Engineer",
            "skills_required": ["SQL", "Python", "Spark", "Airflow", "Data Warehousing"],
            "salary_range": "$85k - $165k",
            "companies_hiring": ["Google", "Uber", "Flipkart", "Walmart"],
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "duration": 32,
        },
        {
            "name": "ML Engineer",
            "skills_required": ["Python", "Machine Learning", "MLOps", "TensorFlow", "Feature Engineering"],
            "salary_range": "$95k - $190k",
            "companies_hiring": ["NVIDIA", "Microsoft", "OpenAI", "Infosys"],
            "difficulty": DifficultyLevel.ADVANCED,
            "duration": 36,
        },
        {
            "name": "Full Stack Developer",
            "skills_required": ["React", "TypeScript", "Node.js", "Databases", "System Design"],
            "salary_range": "$75k - $155k",
            "companies_hiring": ["Meta", "Atlassian", "Freshworks", "CRED"],
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "duration": 30,
        },
        {
            "name": "DevOps Engineer",
            "skills_required": ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud"],
            "salary_range": "$90k - $175k",
            "companies_hiring": ["Adobe", "IBM", "Oracle", "ServiceNow"],
            "difficulty": DifficultyLevel.ADVANCED,
            "duration": 34,
        },
    ]

    for payload in role_payloads:
        existing = db.query(Role).filter(Role.name == payload["name"]).first()
        if existing:
            continue

        role = Role(
            name=payload["name"],
            skills_required=json.dumps(payload["skills_required"]),
            salary_range=payload["salary_range"],
            companies_hiring=json.dumps(payload["companies_hiring"]),
            difficulty_level=payload["difficulty"],
            estimated_duration_weeks=payload["duration"],
        )
        db.add(role)
        db.flush()

        for idx in range(1, 5):
            stage = Stage(
                role_id=role.id,
                order_number=idx,
                title=f"Stage {idx}: Core Growth",
                description="Learn concepts, practice exercises, clear quiz, then build mini project.",
                unlock_quiz_score=70,
                unlock_exercise_completion=80,
            )
            db.add(stage)
            db.flush()

            quiz = Quiz(
                stage_id=stage.id,
                title=f"{role.name} Stage {idx} Quiz",
                timer_seconds=900,
                pass_percentage=70,
            )
            db.add(quiz)
            db.flush()

            db.add_all(
                [
                    QuizQuestion(
                        quiz_id=quiz.id,
                        question_text="What is the best first step in solving a new problem?",
                        options_json=json.dumps(["Guess", "Read requirements", "Skip", "Copy code"]),
                        correct_answer="Read requirements",
                    ),
                    QuizQuestion(
                        quiz_id=quiz.id,
                        question_text="Why write test cases for exercises?",
                        options_json=json.dumps(["To slow down", "To validate logic", "For UI only", "No need"]),
                        correct_answer="To validate logic",
                    ),
                ]
            )

    db.commit()


def seed_admin_user(db: Session, email: str | None, password: str | None, full_name: str):
    if not email or not password:
        return

    normalized_email = email.strip().lower()
    if not normalized_email:
        return


# ──────────────────────────────────────────────────────────────────────────────
# Catalog seed data — mirrors src/lib/quizzes.ts and src/lib/projects.ts
# ──────────────────────────────────────────────────────────────────────────────

QUIZZES: list[dict[str, Any]] = [
    {
        "slug": "frontend-foundations",
        "title": "Frontend Foundations",
        "description": "Quick checks on HTML, CSS, and basic browser behavior.",
        "difficulty": "beginner",
        "estimated_time": "10 minutes",
        "questions": [
            {
                "order": 1,
                "question_type": "multiple-choice",
                "title": "HTML Structure",
                "prompt": "Which tag represents the main heading of a page?",
                "options": ["<h1>", "<head>", "<title>", "<p>"],
                "correct_index": 0,
                "explanation": "The <h1> tag is used for the top-level heading in HTML.",
            },
            {
                "order": 2,
                "question_type": "true-false",
                "title": "CSS Responsibility",
                "prompt": "CSS is responsible for the structure of a web page.",
                "options": ["True", "False"],
                "correct_index": 1,
                "explanation": "HTML provides structure, while CSS handles presentation and styling.",
            },
            {
                "order": 3,
                "question_type": "code-completion",
                "title": "Event Listener",
                "prompt": "Complete the line to log a message when the button is clicked.",
                "code_snippet": "const button = document.querySelector('button')\n\nbutton.addEventListener('click', () => {\n  // TODO\n})",
                "language": "javascript",
                "answer": "console.log('Clicked!')",
                "acceptable_answers": ["console.log('Clicked!')", 'console.log("Clicked!")'],
                "explanation": "The click handler should log a message inside the callback function.",
            },
            {
                "order": 4,
                "question_type": "code-output",
                "title": "Array Length",
                "prompt": "What is the output of this code?",
                "code_snippet": "const colors = ['red', 'blue', 'green']\nconsole.log(colors.length)",
                "language": "javascript",
                "expected_output": "3",
                "explanation": "Arrays store three items, so length is 3.",
            },
        ],
    },
    {
        "slug": "js-logic-check",
        "title": "JavaScript Logic Check",
        "description": "Practice reasoning about conditions, loops, and outputs.",
        "difficulty": "beginner",
        "estimated_time": "12 minutes",
        "questions": [
            {
                "order": 1,
                "question_type": "multiple-choice",
                "title": "Conditional Logic",
                "prompt": "Which operator checks if two values are equal and of the same type?",
                "options": ["==", "===", "!=", "="],
                "correct_index": 1,
                "explanation": "The strict equality operator (===) checks both value and type.",
            },
            {
                "order": 2,
                "question_type": "true-false",
                "title": "Loop Behavior",
                "prompt": "A for-loop can run zero times if its condition is false at the start.",
                "options": ["True", "False"],
                "correct_index": 0,
                "explanation": "If the condition is false initially, the loop body never runs.",
            },
            {
                "order": 3,
                "question_type": "code-completion",
                "title": "Function Return",
                "prompt": "Fill in the missing line to return the sum.",
                "code_snippet": "function add(a, b) {\n  // TODO\n}\n\nconsole.log(add(2, 5))",
                "language": "javascript",
                "answer": "return a + b",
                "acceptable_answers": ["return a + b", "return a+b"],
                "explanation": "The function needs to return the sum of a and b.",
            },
            {
                "order": 4,
                "question_type": "code-output",
                "title": "Loop Output",
                "prompt": "What is the output of this code?",
                "code_snippet": "let total = 0\nfor (let i = 1; i <= 3; i += 1) {\n  total += i\n}\nconsole.log(total)",
                "language": "javascript",
                "expected_output": "6",
                "explanation": "The loop adds 1 + 2 + 3, which equals 6.",
            },
        ],
    },
]


PROJECTS: list[dict[str, Any]] = [
    {
        "slug": "digital-clock",
        "title": "Digital Clock",
        "short_description": "Build a live updating clock that shows hours, minutes, and seconds.",
        "description": "Learn how to display and update time in real-time by building a digital clock from scratch.",
        "difficulty": "beginner",
        "estimated_time": "15 minutes",
        "steps": [
            {"order": 1, "step_type": "understanding", "title": "Understanding the Problem", "description": "A digital clock shows the current time and updates automatically every second.", "points": ["The clock needs to know what time it is right now", "It must show hours, minutes, and seconds clearly", "It should update every single second to stay accurate", "The display should be easy to read at a glance"]},
            {"order": 2, "step_type": "logic", "title": "Breaking Down the Logic", "description": "Let's break this down into simple steps:", "points": ["Ask the computer 'What time is it right now?'", "Split the time into hours, minutes, and seconds", "Make sure each part always shows 2 digits", "Display the time on the screen", "Wait one second, then repeat", "Keep repeating forever"]},
            {"order": 3, "step_type": "code", "title": "The Code", "language": "typescript", "points": ["Set up state to store the current time and update it every second", "Format hours, minutes, and seconds to always be two digits", "Render the time inside a large, easy-to-read display"], "code": "import { useState, useEffect } from 'react'\n\nfunction DigitalClock() {\n  const [time, setTime] = useState(new Date())\n\n  useEffect(() => {\n    const timer = setInterval(() => setTime(new Date()), 1000)\n    return () => clearInterval(timer)\n  }, [])\n\n  const hours = time.getHours().toString().padStart(2, '0')\n  const minutes = time.getMinutes().toString().padStart(2, '0')\n  const seconds = time.getSeconds().toString().padStart(2, '0')\n\n  return <div className=\"text-6xl font-bold\">{hours}:{minutes}:{seconds}</div>\n}", "walkthrough_gif": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXo3N3NvNGxyZjdqbnZ0eHFmZzNyMDZmbWNzb2xvbTdhZ3ZxMTd0ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26tn33aiTi1jkl6H6/giphy.gif", "walkthrough_caption": "Watch the clock component update every second as the state changes."},
            {"order": 4, "step_type": "preview", "title": "See It In Action", "description": "Watch your digital clock come to life! It updates every second automatically."},
            {"order": 5, "step_type": "challenge", "title": "Try It Yourself", "challenge": "Can you modify the clock to show 12-hour format (with AM/PM) instead of 24-hour format?", "hint": "Check if hours > 12 and subtract 12 if so. Don't forget AM/PM!"},
        ],
    },
    {
        "slug": "calculator",
        "title": "Calculator",
        "short_description": "Create a working calculator that can add, subtract, multiply, and divide.",
        "description": "Build an interactive calculator with buttons and learn how to handle user input and perform calculations.",
        "difficulty": "beginner",
        "estimated_time": "20 minutes",
        "steps": [
            {"order": 1, "step_type": "understanding", "title": "Understanding the Problem", "description": "A calculator takes numbers and operations from the user, does the math, and shows the result.", "points": ["Users click number buttons to build their number", "Users click operation buttons (+, -, x, /) to choose math", "The calculator remembers the first number and the operation", "When = is pressed, it calculates and shows the answer", "A Clear button lets users start over"]},
            {"order": 2, "step_type": "logic", "title": "Breaking Down the Logic", "description": "Here's how the calculator thinks step-by-step:", "points": ["Start with empty display showing 0", "When a number is clicked, add it to the display", "When an operation is clicked, remember the number and operation", "Let the user enter a second number", "When = is clicked, do the math", "Show the result", "Clear resets to 0"]},
            {"order": 3, "step_type": "code", "title": "The Code", "language": "typescript", "code": "import { useState } from 'react'\n\nfunction Calculator() {\n  const [display, setDisplay] = useState('0')\n  const [prev, setPrev] = useState<number | null>(null)\n  const [op, setOp] = useState<string | null>(null)\n  const [fresh, setFresh] = useState(true)\n\n  const handleNumber = (n: string) => {\n    setDisplay(fresh ? n : (display === '0' ? n : display + n))\n    setFresh(false)\n  }\n  const handleClear = () => { setDisplay('0'); setPrev(null); setOp(null); setFresh(true) }\n  // ... operator and equals handlers\n}", "walkthrough_gif": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXUwa2NlZ2g2NmJsbXYyMHltdnFzbWc5Z3B0d3NzMGQydnNraDhpOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xeJpnrWC4XWblEk/giphy.gif", "walkthrough_caption": "Follow the button presses to see how the calculator updates its display."},
            {"order": 4, "step_type": "preview", "title": "See It In Action", "description": "Try out your calculator! Click the buttons to enter numbers and operations."},
            {"order": 5, "step_type": "challenge", "title": "Try It Yourself", "challenge": "Can you add a decimal point button so users can calculate with decimal numbers like 3.14?", "hint": "Check if the display already has a decimal point before adding another one!"},
        ],
    },
    {
        "slug": "temperature-converter",
        "title": "Temperature Converter",
        "short_description": "Convert between Celsius, Fahrenheit, and Kelvin with Python.",
        "description": "Learn Python basics by building a temperature converter that handles multiple temperature scales.",
        "difficulty": "beginner",
        "estimated_time": "15 minutes",
        "steps": [
            {"order": 1, "step_type": "understanding", "title": "Understanding the Problem", "description": "A temperature converter takes a temperature in one scale and converts it to another.", "points": ["Users input a value and select the source scale", "The program applies the correct formula", "Displays the converted temperature", "Supports Celsius, Fahrenheit, and Kelvin"]},
            {"order": 2, "step_type": "logic", "title": "Breaking Down the Logic", "description": "Here's how we'll convert temperatures:", "points": ["Get the temperature value", "Get the source scale (C, F, or K)", "Get the target scale", "Apply the correct conversion formula", "Display the result", "Handle edge cases like absolute zero"]},
            {"order": 3, "step_type": "code", "title": "The Code", "language": "python", "code": "def convert_temperature(value, from_scale, to_scale):\n    if from_scale == to_scale:\n        return value\n    if from_scale == 'F':\n        celsius = (value - 32) * 5/9\n    elif from_scale == 'K':\n        celsius = value - 273.15\n    else:\n        celsius = value\n    if to_scale == 'F':\n        return (celsius * 9/5) + 32\n    elif to_scale == 'K':\n        return celsius + 273.15\n    else:\n        return celsius\n\nprint(f\"25C = {convert_temperature(25, 'C', 'F')}F\")"},
            {"order": 4, "step_type": "preview", "title": "See It In Action", "description": "Test your converter with different temperatures and scales!"},
            {"order": 5, "step_type": "challenge", "title": "Try It Yourself", "challenge": "Add input validation to ensure the temperature isn't below absolute zero.", "hint": "Check if converted Celsius < -273.15 and raise an error!"},
        ],
    },
    {
        "slug": "password-generator",
        "title": "Password Generator",
        "short_description": "Create secure random passwords with customizable options in Python.",
        "description": "Build a Python tool that generates strong, random passwords with different character types.",
        "difficulty": "beginner",
        "estimated_time": "20 minutes",
        "steps": [
            {"order": 1, "step_type": "understanding", "title": "Understanding the Problem", "description": "A password generator creates random, secure passwords.", "points": ["Generate random combinations of characters", "Include uppercase, lowercase, numbers, and symbols", "Allow users to specify password length", "Make passwords unpredictable"]},
            {"order": 2, "step_type": "logic", "title": "Breaking Down the Logic", "description": "Here's how we'll generate secure passwords:", "points": ["Define character sets", "Get desired length from user", "Randomly select characters", "Ensure one of each type is included", "Shuffle the result", "Return the password"]},
            {"order": 3, "step_type": "code", "title": "The Code", "language": "python", "code": "import random, string\n\ndef generate_password(length=12):\n    chars = string.ascii_letters + string.digits + string.punctuation\n    required = [random.choice(string.ascii_uppercase), random.choice(string.ascii_lowercase), random.choice(string.digits), random.choice(string.punctuation)]\n    rest = [random.choice(chars) for _ in range(length - 4)]\n    pwd = required + rest\n    random.shuffle(pwd)\n    return ''.join(pwd)\n\nprint(generate_password(16))"},
            {"order": 4, "step_type": "preview", "title": "See It In Action", "description": "Generate multiple passwords and see how random and secure they are!"},
            {"order": 5, "step_type": "challenge", "title": "Try It Yourself", "challenge": "Add a password strength checker that rates passwords as weak, medium, or strong.", "hint": "Check the length and count how many different character types are used!"},
        ],
    },
    {
        "slug": "medical-sql-basics",
        "title": "Medical SQL Basics",
        "short_description": "Create a Medical database flow with Patients table and validate each SQL step.",
        "description": "Practice core SQL workflow in 4 steps: create database, create table, insert data, and query results.",
        "difficulty": "beginner",
        "estimated_time": "15 minutes",
        "steps": [
            {
                "order": 1,
                "slug": "medical-step-1-create-db",
                "step_type": "code",
                "title": "Step 1: Create the Database",
                "description": "Write a SQL command to create a database named Medical.",
                "language": "sql",
                "initial_code": "CREATE DATABASE Medical;",
                "test_cases": json.dumps([
                    {
                        "expected_output": "Database 'Medical' created successfully",
                        "hidden": False,
                    }
                ]),
            },
            {
                "order": 2,
                "slug": "medical-step-2-create-patients-table",
                "step_type": "code",
                "title": "Step 2: Create the Patients Table",
                "description": "Create a Patients table with patient_id (INT, Primary Key) and name (VARCHAR).",
                "language": "sql",
                "initial_code": "CREATE TABLE Patients (patient_id INT PRIMARY KEY, name VARCHAR(50));",
                "test_cases": json.dumps([
                    {
                        "expected_output": "Table created successfully",
                        "hidden": False,
                    }
                ]),
            },
            {
                "order": 3,
                "slug": "medical-step-3-insert-data",
                "step_type": "code",
                "title": "Step 3: Insert Data",
                "description": "Insert a patient named 'John Doe' with ID 1.",
                "language": "sql",
                "initial_code": "INSERT INTO Patients (patient_id, name) VALUES (1, 'John Doe');",
                "test_cases": json.dumps([
                    {
                        "input_data": "CREATE TABLE Patients (patient_id INT PRIMARY KEY, name VARCHAR(50));",
                        "expected_output": "1 row(s) inserted",
                        "hidden": False,
                    }
                ]),
            },
            {
                "order": 4,
                "slug": "medical-step-4-query-data",
                "step_type": "code",
                "title": "Step 4: Query the Data",
                "description": "Write a query to select all patients.",
                "language": "sql",
                "initial_code": "SELECT * FROM Patients;",
                "test_cases": json.dumps([
                    {
                        "input_data": "CREATE TABLE Patients (patient_id INT PRIMARY KEY, name VARCHAR(50));\nINSERT INTO Patients (patient_id, name) VALUES (1, 'John Doe');",
                        "validation_regex": "(?is)patient_id\\s*\\|\\s*name.*1\\s*\\|\\s*John Doe.*1 row\\(s\\) returned",
                        "hidden": False,
                    }
                ]),
            },
        ],
    },
    {
        "slug": "student-database",
        "title": "Student Database",
        "short_description": "Build a Python CRUD system for student records — validated with automated tests.",
        "description": "Learn core data manipulation by implementing Create, Read, Update, Delete, and Analytics functions on a list-based student database. Each step is validated by hidden test cases.",
        "difficulty": "beginner",
        "estimated_time": "25 minutes",
        "steps": [
            {
                "order": 1,
                "slug": "step-1-create",
                "step_type": "code",
                "title": "Step 1: The Insertion Engine",
                "description": "Write a function `add_student(db, student_id, name, grade)` that appends a new student dictionary to the database list and returns the updated list.",
                "language": "python",
                "callable_name": "add_student",
                "initial_code": "def add_student(db, student_id, name, grade):\n    pass\n\n# Example usage\ndb = []\nresult = add_student(db, 'S1', 'Alice', 95)\nprint(result)",
                "test_cases": json.dumps([
                    {"input_data": [[], "S1", "Alice", 95], "expected_output": "[{'id': 'S1', 'name': 'Alice', 'grade': 95}]", "hidden": False},
                    {"input_data": [[{"id": "S0", "name": "Bob", "grade": 80}], "S2", "Charlie", 88], "expected_output": "[{'id': 'S0', 'name': 'Bob', 'grade': 80}, {'id': 'S2', 'name': 'Charlie', 'grade': 88}]", "hidden": True},
                ]),
            },
            {
                "order": 2,
                "slug": "step-2-read",
                "step_type": "code",
                "title": "Step 2: The Retrieval Query",
                "description": "Write a function `get_student(db, student_id)` that finds and returns the student dict with the given id, or None if not found.",
                "language": "python",
                "callable_name": "get_student",
                "initial_code": "def get_student(db, student_id):\n    pass\n\n# Example usage\ndb = [{'id': 'S1', 'name': 'Alice', 'grade': 95}]\nresult = get_student(db, 'S1')\nprint(result)",
                "test_cases": json.dumps([
                    {"input_data": [[{"id": "S1", "name": "Alice", "grade": 95}], "S1"], "expected_output": "{'id': 'S1', 'name': 'Alice', 'grade': 95}", "hidden": False},
                    {"input_data": [[{"id": "S1", "name": "Alice", "grade": 95}], "S99"], "expected_output": "None", "hidden": True},
                ]),
            },
            {
                "order": 3,
                "slug": "step-3-update",
                "step_type": "code",
                "title": "Step 3: The Update Mutation",
                "description": "Write a function `update_grade(db, student_id, new_grade)` that updates the grade of the matching student and returns the updated database list.",
                "language": "python",
                "callable_name": "update_grade",
                "initial_code": "def update_grade(db, student_id, new_grade):\n    pass\n\n# Example usage\ndb = [{'id': 'S1', 'name': 'Alice', 'grade': 95}]\nresult = update_grade(db, 'S1', 99)\nprint(result)",
                "test_cases": json.dumps([
                    {"input_data": [[{"id": "S1", "name": "Alice", "grade": 95}], "S1", 99], "expected_output": "[{'id': 'S1', 'name': 'Alice', 'grade': 99}]", "hidden": False},
                    {"input_data": [[{"id": "S1", "name": "Alice", "grade": 95}, {"id": "S2", "name": "Bob", "grade": 70}], "S2", 85], "expected_output": "[{'id': 'S1', 'name': 'Alice', 'grade': 95}, {'id': 'S2', 'name': 'Bob', 'grade': 85}]", "hidden": True},
                ]),
            },
            {
                "order": 4,
                "slug": "step-4-delete",
                "step_type": "code",
                "title": "Step 4: The Deletion Protocol",
                "description": "Write a function `remove_student(db, student_id)` that removes the student with the given id and returns True if removed, False if not found.",
                "language": "python",
                "callable_name": "remove_student",
                "initial_code": "def remove_student(db, student_id):\n    pass\n\n# Example usage\ndb = [{'id': 'S1', 'name': 'Alice', 'grade': 95}]\nresult = remove_student(db, 'S1')\nprint(result)",
                "test_cases": json.dumps([
                    {"input_data": [[{"id": "S1", "name": "Alice", "grade": 95}], "S1"], "expected_output": "True", "hidden": False},
                    {"input_data": [[{"id": "S1", "name": "Alice", "grade": 95}], "S99"], "expected_output": "False", "hidden": True},
                ]),
            },
            {
                "order": 5,
                "slug": "step-5-analytics",
                "step_type": "code",
                "title": "Step 5: The Analytics Engine",
                "description": "Write a function `calculate_class_average(db)` that returns the average grade as a float. Return 0.0 if the database is empty.",
                "language": "python",
                "callable_name": "calculate_class_average",
                "initial_code": "def calculate_class_average(db):\n    pass\n\n# Example usage\ndb = [{'id': 'S1', 'grade': 90}, {'id': 'S2', 'grade': 100}]\nresult = calculate_class_average(db)\nprint(result)",
                "test_cases": json.dumps([
                    {"input_data": [[{"id": "S1", "grade": 90}, {"id": "S2", "grade": 100}]], "expected_output": "95.0", "hidden": False},
                    {"input_data": [[]], "expected_output": "0.0", "hidden": True},
                ]),
            },
        ],
    },
    {
        "slug": "sales-analytics",
        "title": "Sales Analytics Dashboard",
        "short_description": "Build Python analytics functions for a sales dashboard — validated with automated tests.",
        "description": "Learn data aggregation by implementing revenue, filtering, and average-order-value functions on real sales data. Each step is validated by hidden test cases.",
        "difficulty": "beginner",
        "estimated_time": "25 minutes",
        "steps": [
            {
                "order": 1,
                "slug": "sa-step-1",
                "step_type": "code",
                "title": "Step 1: Total Revenue",
                "description": "Write a function `calc_revenue(sales)` that loops through a list of dictionaries and returns the sum of the `'amount'` keys.",
                "language": "python",
                "callable_name": "calc_revenue",
                "initial_code": "def calc_revenue(sales):\n    pass",
                "test_cases": json.dumps([
                    {"input_data": [[{"amount": 100}, {"amount": 250}]], "expected_output": "350", "hidden": False},
                    {"input_data": [[{"amount": 50}, {"amount": 50}, {"amount": 10}]], "expected_output": "110", "hidden": True},
                ]),
            },
            {
                "order": 2,
                "slug": "sa-step-2",
                "step_type": "code",
                "title": "Step 2: Filter High Value",
                "description": "Write a function `filter_vip(sales, threshold)` that returns a list of sales dictionaries where the `'amount'` is strictly greater than the threshold.",
                "language": "python",
                "callable_name": "filter_vip",
                "initial_code": "def filter_vip(sales, threshold):\n    pass",
                "test_cases": json.dumps([
                    {"input_data": [[{"id": 1, "amount": 100}, {"id": 2, "amount": 50}], 80], "expected_output": "[{'id': 1, 'amount': 100}]", "hidden": False},
                ]),
            },
            {
                "order": 3,
                "slug": "sa-step-3",
                "step_type": "code",
                "title": "Step 3: Average Order Value",
                "description": "Write `calc_aov(sales)` that returns the average amount as a float. Return 0.0 if empty.",
                "language": "python",
                "callable_name": "calc_aov",
                "initial_code": "def calc_aov(sales):\n    pass",
                "test_cases": json.dumps([
                    {"input_data": [[{"amount": 100}, {"amount": 200}]], "expected_output": "150.0", "hidden": False},
                    {"input_data": [[]], "expected_output": "0.0", "hidden": True},
                ]),
            },
        ],
    },
    {
        "slug": "grade-calculator",
        "title": "Grade Calculator",
        "short_description": "Build ML-style Python functions for feature extraction, prediction, and error metrics — validated with automated tests.",
        "description": "Learn foundational ML concepts by implementing feature extraction, a linear predictor, and mean absolute error from scratch. Each step is validated by hidden test cases.",
        "difficulty": "beginner",
        "estimated_time": "20 minutes",
        "steps": [
            {
                "order": 1,
                "slug": "gc-step-1",
                "step_type": "code",
                "title": "Step 1: Feature Extraction",
                "description": "Write `extract_features(data)` that takes a list of dicts and returns a list of just the `'hours_studied'` values.",
                "language": "python",
                "callable_name": "extract_features",
                "initial_code": "def extract_features(data):\n    pass",
                "test_cases": json.dumps([
                    {"input_data": [[{"hours_studied": 5, "score": 80}, {"hours_studied": 2, "score": 50}]], "expected_output": "[5, 2]", "hidden": False},
                ]),
            },
            {
                "order": 2,
                "slug": "gc-step-2",
                "step_type": "code",
                "title": "Step 2: Simple Linear Predictor",
                "description": "Write `predict_score(hours, weight, bias)`. Formula is: hours * weight + bias. Return the integer result.",
                "language": "python",
                "callable_name": "predict_score",
                "initial_code": "def predict_score(hours, weight, bias):\n    pass",
                "test_cases": json.dumps([
                    {"input_data": [5, 10, 20], "expected_output": "70", "hidden": False},
                    {"input_data": [2, 8, 15], "expected_output": "31", "hidden": True},
                ]),
            },
            {
                "order": 3,
                "slug": "gc-step-3",
                "step_type": "code",
                "title": "Step 3: Mean Absolute Error",
                "description": "Write `calc_mae(actuals, predictions)` that calculates the average absolute difference between two lists.",
                "language": "python",
                "callable_name": "calc_mae",
                "initial_code": "def calc_mae(actuals, predictions):\n    pass",
                "test_cases": json.dumps([
                    {"input_data": [[100, 90], [90, 80]], "expected_output": "10.0", "hidden": False},
                ]),
            },
        ],
    },
    {
        "slug": "number-guesser",
        "title": "Number Guessing Game",
        "short_description": "Build an interactive game where users guess a random number in Java.",
        "description": "Create a fun Java game that generates a random number and gives hints until the user guesses correctly.",
        "difficulty": "beginner",
        "estimated_time": "20 minutes",
        "steps": [
            {"order": 1, "step_type": "understanding", "title": "Understanding the Problem", "description": "A number guessing game generates a random number and challenges the player with hints.", "points": ["Generate a random number", "Accept guesses", "Give too-high/too-low feedback", "Track attempt count", "Celebrate on correct guess"]},
            {"order": 2, "step_type": "logic", "title": "Breaking Down the Logic", "description": "Here's how the game works:", "points": ["Generate random 1-100", "Initialize attempt counter", "Loop until correct", "Compare guess", "Print hint", "Count attempts and show on win"]},
            {"order": 3, "step_type": "code", "title": "The Code", "language": "java", "code": "import java.util.Random;\nimport java.util.Scanner;\n\npublic class NumberGuessingGame {\n    public static void main(String[] args) {\n        int secret = new Random().nextInt(100) + 1;\n        Scanner sc = new Scanner(System.in);\n        int attempts = 0;\n        System.out.println(\"Guess a number between 1 and 100!\");\n        while (true) {\n            int guess = sc.nextInt();\n            attempts++;\n            if (guess < secret) System.out.println(\"Too low!\");\n            else if (guess > secret) System.out.println(\"Too high!\");\n            else { System.out.println(\"Correct in \" + attempts + \" attempts!\"); break; }\n        }\n        sc.close();\n    }\n}"},
            {"order": 4, "step_type": "preview", "title": "See It In Action", "description": "Watch the game provide hints to guide the player!"},
            {"order": 5, "step_type": "challenge", "title": "Try It Yourself", "challenge": "Add difficulty levels: Easy (1-50, unlimited), Medium (1-100, 10 guesses), Hard (1-200, 7 guesses).", "hint": "Add a max-attempts limit and check it in the while condition!"},
        ],
    },
]


def _upsert_quiz(db: Session, data: dict[str, Any]) -> None:
    quiz = db.query(QuizCatalog).filter_by(slug=data["slug"]).first()
    if quiz is None:
        quiz = QuizCatalog()
        db.add(quiz)
    quiz.slug = data["slug"]
    quiz.title = data["title"]
    quiz.description = data["description"]
    quiz.difficulty = data.get("difficulty", "beginner")
    quiz.estimated_time = data["estimated_time"]
    db.flush()
    db.query(QuizCatalogQuestion).filter_by(quiz_id=quiz.id).delete()
    for q in data["questions"]:
        db.add(QuizCatalogQuestion(
            quiz_id=quiz.id,
            order=q["order"],
            question_type=q["question_type"],
            title=q["title"],
            prompt=q["prompt"],
            options_json=json.dumps(q["options"]) if "options" in q else None,
            correct_index=q.get("correct_index"),
            answer=q.get("answer"),
            acceptable_answers_json=json.dumps(q["acceptable_answers"]) if "acceptable_answers" in q else None,
            expected_output=q.get("expected_output"),
            code_snippet=q.get("code_snippet"),
            language=q.get("language"),
            explanation=q["explanation"],
        ))


def _upsert_project(db: Session, data: dict[str, Any]) -> None:
    project = db.query(ProjectCatalog).filter_by(slug=data["slug"]).first()
    if project is None:
        project = ProjectCatalog()
        db.add(project)
    project.slug = data["slug"]
    project.title = data["title"]
    project.short_description = data["short_description"]
    project.description = data["description"]
    project.difficulty = data.get("difficulty", "beginner")
    project.estimated_time = data["estimated_time"]
    db.flush()
    db.query(ProjectCatalogStep).filter_by(project_id=project.id).delete()
    for s in data["steps"]:
        db.add(ProjectCatalogStep(
            project_id=project.id,
            order=s["order"],
            slug=s.get("slug"),
            step_type=s["step_type"],
            title=s["title"],
            description=s.get("description"),
            points_json=json.dumps(s["points"]) if "points" in s else None,
            code=s.get("code"),
            language=s.get("language"),
            challenge=s.get("challenge"),
            hint=s.get("hint"),
            walkthrough_gif=s.get("walkthrough_gif"),
            walkthrough_caption=s.get("walkthrough_caption"),
            callable_name=s.get("callable_name"),
            initial_code=s.get("initial_code"),
            test_cases=s.get("test_cases"),  # already a JSON string
        ))


def seed_catalog_data(db: Session) -> None:
    """Idempotent catalog seeder. Safe to call on every startup."""
    logger.info("Seeding quiz catalog (%d quizzes)…", len(QUIZZES))
    for quiz_data in QUIZZES:
        _upsert_quiz(db, quiz_data)
    logger.info("Seeding project catalog (%d projects)…", len(PROJECTS))
    for project_data in PROJECTS:
        _upsert_project(db, project_data)
    db.commit()
    logger.info("Catalog seed complete.")
