/**
 * Static catalog data — mirrors backend/app/services/seed.py
 * Used as a fallback (or primary source) when the backend is unavailable.
 */

import type {
  CatalogQuiz,
  CatalogQuizSummary,
  CatalogProject,
  CatalogProjectSummary,
} from './api'

// ── Quizzes ───────────────────────────────────────────────────────────────────

export const CATALOG_QUIZZES: CatalogQuiz[] = [
  {
    id: 'frontend-foundations',
    title: 'Frontend Foundations',
    description: 'Quick checks on HTML, CSS, and basic browser behavior.',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        title: 'HTML Structure',
        prompt: 'Which tag represents the main heading of a page?',
        options: ['<h1>', '<head>', '<title>', '<p>'],
        correctIndex: 0,
        explanation: 'The <h1> tag is used for the top-level heading in HTML.',
      },
      {
        id: 2,
        type: 'true-false',
        title: 'CSS Responsibility',
        prompt: 'CSS is responsible for the structure of a web page.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'HTML provides structure, while CSS handles presentation and styling.',
      },
      {
        id: 3,
        type: 'code-completion',
        title: 'Event Listener',
        prompt: 'Complete the line to log a message when the button is clicked.',
        code: "const button = document.querySelector('button')\n\nbutton.addEventListener('click', () => {\n  // TODO\n})",
        language: 'javascript',
        answer: "console.log('Clicked!')",
        acceptableAnswers: ["console.log('Clicked!')", 'console.log("Clicked!")'],
        explanation: 'The click handler should log a message inside the callback function.',
      },
      {
        id: 4,
        type: 'code-output',
        title: 'Array Length',
        prompt: 'What is the output of this code?',
        code: "const colors = ['red', 'blue', 'green']\nconsole.log(colors.length)",
        language: 'javascript',
        expectedOutput: '3',
        explanation: 'Arrays store three items, so length is 3.',
      },
    ],
  },
  {
    id: 'js-logic-check',
    title: 'JavaScript Logic Check',
    description: 'Practice reasoning about conditions, loops, and outputs.',
    difficulty: 'beginner',
    estimatedTime: '12 minutes',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        title: 'Conditional Logic',
        prompt: 'Which operator checks if two values are equal and of the same type?',
        options: ['==', '===', '!=', '='],
        correctIndex: 1,
        explanation: 'The strict equality operator (===) checks both value and type.',
      },
      {
        id: 2,
        type: 'true-false',
        title: 'Loop Behavior',
        prompt: 'A for-loop can run zero times if its condition is false at the start.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'If the condition is false initially, the loop body never runs.',
      },
      {
        id: 3,
        type: 'code-completion',
        title: 'Function Return',
        prompt: 'Fill in the missing line to return the sum.',
        code: 'function add(a, b) {\n  // TODO\n}\n\nconsole.log(add(2, 5))',
        language: 'javascript',
        answer: 'return a + b',
        acceptableAnswers: ['return a + b', 'return a+b'],
        explanation: 'The function needs to return the sum of a and b.',
      },
      {
        id: 4,
        type: 'code-output',
        title: 'Loop Output',
        prompt: 'What is the output of this code?',
        code: 'let total = 0\nfor (let i = 1; i <= 3; i += 1) {\n  total += i\n}\nconsole.log(total)',
        language: 'javascript',
        expectedOutput: '6',
        explanation: 'The loop adds 1 + 2 + 3, which equals 6.',
      },
    ],
  },
]

export const CATALOG_QUIZ_SUMMARIES: CatalogQuizSummary[] = CATALOG_QUIZZES.map((q) => ({
  id: q.id,
  title: q.title,
  description: q.description,
  difficulty: q.difficulty,
  estimatedTime: q.estimatedTime,
  questionCount: q.questions.length,
}))

// ── Projects ──────────────────────────────────────────────────────────────────

export const CATALOG_PROJECTS: CatalogProject[] = [
  {
    id: 'digital-clock',
    title: 'Digital Clock',
    shortDescription: 'Build a live updating clock that shows hours, minutes, and seconds.',
    description: 'Learn how to display and update time in real-time by building a digital clock from scratch.',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A digital clock shows the current time and updates automatically every second.',
          points: [
            'The clock needs to know what time it is right now',
            'It must show hours, minutes, and seconds clearly',
            'It should update every single second to stay accurate',
            'The display should be easy to read at a glance',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Let's break this down into simple steps:",
          points: [
            "Ask the computer 'What time is it right now?'",
            'Split the time into hours, minutes, and seconds',
            'Make sure each part always shows 2 digits',
            'Display the time on the screen',
            'Wait one second, then repeat',
            'Keep repeating forever',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'typescript',
          points: [
            'Set up state to store the current time and update it every second',
            'Format hours, minutes, and seconds to always be two digits',
            'Render the time inside a large, easy-to-read display',
          ],
          code: "import { useState, useEffect } from 'react'\n\nfunction DigitalClock() {\n  const [time, setTime] = useState(new Date())\n\n  useEffect(() => {\n    const timer = setInterval(() => setTime(new Date()), 1000)\n    return () => clearInterval(timer)\n  }, [])\n\n  const hours = time.getHours().toString().padStart(2, '0')\n  const minutes = time.getMinutes().toString().padStart(2, '0')\n  const seconds = time.getSeconds().toString().padStart(2, '0')\n\n  return <div className=\"text-6xl font-bold\">{hours}:{minutes}:{seconds}</div>\n}",
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Watch your digital clock come to life! It updates every second automatically.',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Can you modify the clock to show 12-hour format (with AM/PM) instead of 24-hour format?',
          hint: "Check if hours > 12 and subtract 12 if so. Don't forget AM/PM!",
        },
      },
    ],
  },
  {
    id: 'calculator',
    title: 'Calculator',
    shortDescription: 'Create a working calculator that can add, subtract, multiply, and divide.',
    description: 'Build an interactive calculator with buttons and learn how to handle user input and perform calculations.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A calculator takes numbers and operations from the user, does the math, and shows the result.',
          points: [
            'Users click number buttons to build their number',
            'Users click operation buttons (+, -, x, /) to choose math',
            'The calculator remembers the first number and the operation',
            'When = is pressed, it calculates and shows the answer',
            'A Clear button lets users start over',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how the calculator thinks step-by-step:",
          points: [
            'Start with empty display showing 0',
            'When a number is clicked, add it to the display',
            'When an operation is clicked, remember the number and operation',
            'Let the user enter a second number',
            'When = is clicked, do the math',
            'Show the result',
            'Clear resets to 0',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'typescript',
          code: "import { useState } from 'react'\n\nfunction Calculator() {\n  const [display, setDisplay] = useState('0')\n  const [prev, setPrev] = useState<number | null>(null)\n  const [op, setOp] = useState<string | null>(null)\n  const [fresh, setFresh] = useState(true)\n\n  const handleNumber = (n: string) => {\n    setDisplay(fresh ? n : (display === '0' ? n : display + n))\n    setFresh(false)\n  }\n  const handleClear = () => { setDisplay('0'); setPrev(null); setOp(null); setFresh(true) }\n  // ... operator and equals handlers\n}",
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Try out your calculator! Click the buttons to enter numbers and operations.',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Can you add a decimal point button so users can calculate with decimal numbers like 3.14?',
          hint: 'Check if the display already has a decimal point before adding another one!',
        },
      },
    ],
  },
  {
    id: 'temperature-converter',
    title: 'Temperature Converter',
    shortDescription: 'Convert between Celsius, Fahrenheit, and Kelvin with Python.',
    description: 'Learn Python basics by building a temperature converter that handles multiple temperature scales.',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A temperature converter takes a temperature in one scale and converts it to another.',
          points: [
            'Users input a value and select the source scale',
            'The program applies the correct formula',
            'Displays the converted temperature',
            'Supports Celsius, Fahrenheit, and Kelvin',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how we'll convert temperatures:",
          points: [
            'Get the temperature value',
            'Get the source scale (C, F, or K)',
            'Get the target scale',
            'Apply the correct conversion formula',
            'Display the result',
            'Handle edge cases like absolute zero',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'python',
          code: "def convert_temperature(value, from_scale, to_scale):\n    if from_scale == to_scale:\n        return value\n    if from_scale == 'F':\n        celsius = (value - 32) * 5/9\n    elif from_scale == 'K':\n        celsius = value - 273.15\n    else:\n        celsius = value\n    if to_scale == 'F':\n        return (celsius * 9/5) + 32\n    elif to_scale == 'K':\n        return celsius + 273.15\n    else:\n        return celsius\n\nprint(f\"25C = {convert_temperature(25, 'C', 'F')}F\")",
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Test your converter with different temperatures and scales!',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: "Add input validation to ensure the temperature isn't below absolute zero.",
          hint: 'Check if converted Celsius < -273.15 and raise an error!',
        },
      },
    ],
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    shortDescription: 'Create secure random passwords with customizable options in Python.',
    description: 'Build a Python tool that generates strong, random passwords with different character types.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A password generator creates random, secure passwords.',
          points: [
            'Generate random combinations of characters',
            'Include uppercase, lowercase, numbers, and symbols',
            'Allow users to specify password length',
            'Make passwords unpredictable',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how we'll generate secure passwords:",
          points: [
            'Define character sets',
            'Get desired length from user',
            'Randomly select characters',
            'Ensure one of each type is included',
            'Shuffle the result',
            'Return the password',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'python',
          code: "import random, string\n\ndef generate_password(length=12):\n    chars = string.ascii_letters + string.digits + string.punctuation\n    required = [random.choice(string.ascii_uppercase), random.choice(string.ascii_lowercase), random.choice(string.digits), random.choice(string.punctuation)]\n    rest = [random.choice(chars) for _ in range(length - 4)]\n    pwd = required + rest\n    random.shuffle(pwd)\n    return ''.join(pwd)\n\nprint(generate_password(16))",
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Generate multiple passwords and see how random and secure they are!',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Add a password strength checker that rates passwords as weak, medium, or strong.',
          hint: 'Check the length and count how many different character types are used!',
        },
      },
    ],
  },
  {
    id: 'student-database',
    title: 'Student Database',
    shortDescription: 'Create and query a student records database with SQL.',
    description: 'Learn SQL basics by creating tables, inserting data, and running queries on a student database.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A student database stores information about students. SQL lets us organize and retrieve it easily.',
          points: [
            'Create tables to store student information',
            'Insert records with multiple fields',
            'Query data to find specific students',
            'Update records when info changes',
            'Use relationships between tables',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how we'll structure our database:",
          points: [
            'Design a Students table with ID, name, email, and major',
            'Define primary keys',
            'Write SELECT queries',
            'Use WHERE clauses to filter',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'sql',
          code: "CREATE TABLE Students (\n    student_id INT PRIMARY KEY,\n    first_name VARCHAR(50),\n    last_name VARCHAR(50),\n    email VARCHAR(100),\n    major VARCHAR(50)\n);\n\nINSERT INTO Students VALUES (1,'Alice','Johnson','alice@email.com','Computer Science'), (2,'Bob','Smith','bob@email.com','Mathematics');\n\nSELECT * FROM Students;\nSELECT first_name, last_name FROM Students WHERE major = 'Computer Science';",
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'See how SQL queries retrieve and manipulate student data!',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: "Add a Courses table and create a JOIN query to show which students are enrolled in which courses.",
          hint: "You'll need a junction table to handle the many-to-many relationship!",
        },
      },
    ],
  },
  {
    id: 'sales-analytics',
    title: 'Sales Analytics Dashboard',
    shortDescription: 'Analyze sales data with SQL aggregations and reports.',
    description: 'Master SQL aggregate functions by building queries for a sales analytics dashboard.',
    difficulty: 'beginner',
    estimatedTime: '25 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A sales analytics system helps businesses understand performance through totals, averages, and trends.',
          points: [
            'Store sales transactions',
            'Calculate total revenue',
            'Find top products/salespeople',
            'Group by time periods',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how we'll analyze sales:",
          points: [
            'Create Sales table',
            'Use SUM() for total revenue',
            'Use AVG() for averages',
            'Use COUNT() for transactions',
            'Use GROUP BY for categories',
            'Use ORDER BY to rank',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'sql',
          code: "CREATE TABLE Sales (sale_id INT PRIMARY KEY, product_name VARCHAR(100), sale_amount DECIMAL(10,2), sale_date DATE, salesperson VARCHAR(50));\n\nINSERT INTO Sales VALUES (1,'Laptop',1200,'2024-01-15','John'),(2,'Mouse',25,'2024-01-15','Sarah'),(3,'Keyboard',75,'2024-01-16','John');\n\nSELECT SUM(sale_amount) total_revenue FROM Sales;\nSELECT salesperson, COUNT(*) sales, SUM(sale_amount) total FROM Sales GROUP BY salesperson ORDER BY total DESC;",
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Watch SQL aggregate functions transform raw sales data into insights!',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Find the salesperson with the highest average sale, excluding sales below $100.',
          hint: 'Use HAVING clause with AVG() and a WHERE filter!',
        },
      },
    ],
  },
  {
    id: 'grade-calculator',
    title: 'Grade Calculator',
    shortDescription: 'Calculate and display student grades with letter grades in Java.',
    description: 'Learn Java fundamentals by building a grade calculator that computes averages and assigns letter grades.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A grade calculator takes multiple test scores, computes the average, and assigns a letter grade.',
          points: [
            'Accept multiple test scores',
            'Calculate the average',
            'Assign a letter grade',
            'Display both numeric and letter grade',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how we'll calculate grades:",
          points: [
            'Store scores in an array',
            'Loop to sum all scores',
            'Divide by count for average',
            'Use if-else for letter grades',
            'A:90+, B:80-89, C:70-79, D:60-69, F:<60',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'java',
          code: 'public class GradeCalculator {\n    public static double calculateAverage(double[] scores) {\n        double sum = 0;\n        for (double s : scores) sum += s;\n        return sum / scores.length;\n    }\n    public static String getLetterGrade(double avg) {\n        if (avg >= 90) return "A";\n        else if (avg >= 80) return "B";\n        else if (avg >= 70) return "C";\n        else if (avg >= 60) return "D";\n        else return "F";\n    }\n    public static void main(String[] args) {\n        double[] scores = {85.5, 92.0, 78.5, 88.0, 95.0};\n        double avg = calculateAverage(scores);\n        System.out.println("Average: " + String.format("%.2f", avg));\n        System.out.println("Grade: " + getLetterGrade(avg));\n    }\n}',
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'See how the calculator processes scores and assigns letter grades!',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Extend the calculator to support plus/minus grades (A+, A, A-).',
          hint: '97-100=A+, 93-96=A, 90-92=A-, etc.',
        },
      },
    ],
  },
  {
    id: 'number-guesser',
    title: 'Number Guessing Game',
    shortDescription: 'Build an interactive game where users guess a random number in Java.',
    description: 'Create a fun Java game that generates a random number and gives hints until the user guesses correctly.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: 'A number guessing game generates a random number and challenges the player with hints.',
          points: [
            'Generate a random number',
            'Accept guesses',
            'Give too-high/too-low feedback',
            'Track attempt count',
            'Celebrate on correct guess',
          ],
        },
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        videoId: 'jNQXAC9IVRw',
        content: {
          description: "Here's how the game works:",
          points: [
            'Generate random 1-100',
            'Initialize attempt counter',
            'Loop until correct',
            'Compare guess',
            'Print hint',
            'Count attempts and show on win',
          ],
        },
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        videoId: 'jNQXAC9IVRw',
        content: {
          language: 'java',
          code: 'import java.util.Random;\nimport java.util.Scanner;\n\npublic class NumberGuessingGame {\n    public static void main(String[] args) {\n        int secret = new Random().nextInt(100) + 1;\n        Scanner sc = new Scanner(System.in);\n        int attempts = 0;\n        System.out.println("Guess a number between 1 and 100!");\n        while (true) {\n            int guess = sc.nextInt();\n            attempts++;\n            if (guess < secret) System.out.println("Too low!");\n            else if (guess > secret) System.out.println("Too high!");\n            else { System.out.println("Correct in " + attempts + " attempts!"); break; }\n        }\n        sc.close();\n    }\n}',
        },
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Watch the game provide hints to guide the player!',
        },
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Add difficulty levels: Easy (1-50, unlimited), Medium (1-100, 10 guesses), Hard (1-200, 7 guesses).',
          hint: 'Add a max-attempts limit and check it in the while condition!',
        },
      },
    ],
  },
  
]

export const CATALOG_PROJECT_SUMMARIES: CatalogProjectSummary[] = CATALOG_PROJECTS.map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  shortDescription: p.shortDescription,
  difficulty: p.difficulty,
  estimatedTime: p.estimatedTime,
  stepCount: p.steps.length,
}))
