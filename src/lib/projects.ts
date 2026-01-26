export interface Step {
  id: number
  title: string
  type: 'understanding' | 'logic' | 'code' | 'preview' | 'challenge'
  content: {
    description?: string
    points?: string[]
    code?: string
    language?: string
    challenge?: string
    hint?: string
    walkthroughGif?: string
    walkthroughCaption?: string
  }
}

export interface Project {
  id: string
  title: string
  description: string
  shortDescription: string
  difficulty: 'beginner'
  estimatedTime: string
  steps: Step[]
}

export const projects: Project[] = [
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
        content: {
          description: 'A digital clock shows the current time (hours, minutes, and seconds) and updates automatically every second. Think of it like the clock on your phone or computer - it always shows the right time and never stops updating!',
          points: [
            'The clock needs to know what time it is right now',
            'It must show hours, minutes, and seconds clearly',
            'It should update every single second to stay accurate',
            'The display should be easy to read at a glance'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Let\'s break this down into simple steps that anyone can understand:',
          points: [
            'Ask the computer "What time is it right now?"',
            'Take that time and split it into hours, minutes, and seconds',
            'Make sure each part always shows 2 digits (like "09" instead of "9")',
            'Display the time on the screen in a nice format',
            'Wait one second, then repeat everything again',
            'Keep repeating forever so the clock never stops'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          code: `import { useState, useEffect } from 'react'

function DigitalClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  return (
    <div>
      <div className="text-6xl font-bold">
        {hours}:{minutes}:{seconds}
      </div>
    </div>
  )
 }`,
          walkthroughGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXo3N3NvNGxyZjdqbnZ0eHFmZzNyMDZmbWNzb2xvbTdhZ3ZxMTd0ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26tn33aiTi1jkl6H6/giphy.gif',
          walkthroughCaption: 'Watch the clock component update every second as the state changes.'
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Watch your digital clock come to life! It updates every second automatically, just like a real clock.'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Can you modify the clock to show 12-hour format (with AM/PM) instead of 24-hour format?',
          hint: 'You\'ll need to check if hours is greater than 12, and subtract 12 if it is. Don\'t forget to add "AM" or "PM"!'
        }
      }
    ]
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
        content: {
          description: 'A calculator takes numbers and operations (like + or ×) from the user, does the math, and shows the result. It\'s like having a math helper right on your screen!',
          points: [
            'Users need to click number buttons to build their number',
            'Users click operation buttons (+ - × ÷) to choose what math to do',
            'The calculator remembers the first number and the operation',
            'When users press "=", it calculates and shows the answer',
            'A "Clear" button lets users start over anytime'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how the calculator thinks step-by-step:',
          points: [
            'Start with an empty display showing "0"',
            'When a number is clicked, add it to the display',
            'When an operation (+, -, ×, ÷) is clicked, remember the number and operation',
            'Let the user enter a second number',
            'When "=" is clicked, do the math with both numbers',
            'Show the result on the display',
            'If "Clear" is clicked, reset everything back to "0"'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          code: `import { useState } from 'react'

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [newNumber, setNewNumber] = useState(true)

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num)
      setNewNumber(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const handleOperation = (op: string) => {
    const current = parseFloat(display)
    if (previousValue === null) {
      setPreviousValue(current)
    } else if (operation) {
      const result = calculate(previousValue, current, operation)
      setPreviousValue(result)
      setDisplay(String(result))
    }
    setOperation(op)
    setNewNumber(true)
  }

  const calculate = (a: number, b: number, op: string) => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return a / b
      default: return b
    }
  }

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display)
      const result = calculate(previousValue, current, operation)
      setDisplay(String(result))
      setPreviousValue(null)
      setOperation(null)
      setNewNumber(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setNewNumber(true)
  }

  return (
    <div className="calculator-grid">
      <div className="display">{display}</div>
      {/* Number and operation buttons */}
    </div>
  )
 }`,
          walkthroughGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXUwa2NlZ2g2NmJsbXYyMHltdnFzbWc5Z3B0d3NzMGQydnNraDhpOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xeJpnrWC4XWblEk/giphy.gif',
          walkthroughCaption: 'Follow the button presses to see how the calculator updates its display.'
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Try out your calculator! Click the buttons to enter numbers and operations, then press = to see the result.'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Can you add a decimal point button so users can calculate with decimal numbers like 3.14?',
          hint: 'You\'ll need to check if the display already has a decimal point before adding another one!'
        }
      }
    ]
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
        content: {
          description: 'A temperature converter takes a temperature in one scale (like Celsius) and converts it to another scale (like Fahrenheit). It\'s useful for science, cooking, and travel!',
          points: [
            'Users input a temperature value and select the source scale',
            'The program applies the correct conversion formula',
            'It displays the converted temperature in the target scale',
            'Supports Celsius, Fahrenheit, and Kelvin conversions'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how we\'ll convert temperatures step-by-step:',
          points: [
            'Get the temperature value from the user',
            'Get the source scale (C, F, or K)',
            'Get the target scale to convert to',
            'Apply the correct conversion formula based on scales',
            'Display the result with proper formatting',
            'Handle edge cases like absolute zero'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'python',
          code: `def celsius_to_fahrenheit(celsius):
    return (celsius * 9/5) + 32

def celsius_to_kelvin(celsius):
    return celsius + 273.15

def fahrenheit_to_celsius(fahrenheit):
    return (fahrenheit - 32) * 5/9

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15

def convert_temperature(value, from_scale, to_scale):
    if from_scale == to_scale:
        return value
    
    # Convert to Celsius first
    if from_scale == 'F':
        celsius = fahrenheit_to_celsius(value)
    elif from_scale == 'K':
        celsius = kelvin_to_celsius(value)
    else:
        celsius = value
    
    # Convert from Celsius to target
    if to_scale == 'F':
        return celsius_to_fahrenheit(celsius)
    elif to_scale == 'K':
        return celsius_to_kelvin(celsius)
    else:
        return celsius

# Example usage
temp = 25
result = convert_temperature(temp, 'C', 'F')
print(f"{temp}°C = {result}°F")`
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Test your converter with different temperatures and scales!'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Add input validation to ensure the temperature isn\'t below absolute zero (-273.15°C, -459.67°F, or 0K).',
          hint: 'Check the temperature value after converting to Celsius and display an error message if it\'s below -273.15!'
        }
      }
    ]
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    shortDescription: 'Create secure random passwords with customizable options in Python.',
    description: 'Build a Python tool that generates strong, random passwords with different character types and lengths.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        content: {
          description: 'A password generator creates random, secure passwords to help protect accounts. Strong passwords use a mix of different character types and are hard to guess.',
          points: [
            'Generate random combinations of characters',
            'Include uppercase letters, lowercase letters, numbers, and symbols',
            'Allow users to specify password length',
            'Make passwords unpredictable and secure',
            'Display the generated password clearly'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how we\'ll generate secure passwords:',
          points: [
            'Define character sets (uppercase, lowercase, digits, symbols)',
            'Get desired password length from user',
            'Randomly select characters from the combined character set',
            'Ensure at least one character from each type is included',
            'Shuffle the result to make it truly random',
            'Return the generated password'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'python',
          code: `import random
import string

def generate_password(length=12, use_uppercase=True, 
                     use_lowercase=True, use_digits=True, 
                     use_symbols=True):
    
    characters = ""
    password = []
    
    if use_uppercase:
        characters += string.ascii_uppercase
        password.append(random.choice(string.ascii_uppercase))
    
    if use_lowercase:
        characters += string.ascii_lowercase
        password.append(random.choice(string.ascii_lowercase))
    
    if use_digits:
        characters += string.digits
        password.append(random.choice(string.digits))
    
    if use_symbols:
        characters += string.punctuation
        password.append(random.choice(string.punctuation))
    
    # Fill remaining length with random characters
    for _ in range(length - len(password)):
        password.append(random.choice(characters))
    
    # Shuffle to make it unpredictable
    random.shuffle(password)
    
    return ''.join(password)

# Generate a password
new_password = generate_password(16)
print(f"Your secure password: {new_password}")`
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Generate multiple passwords and see how random and secure they are!'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Add a password strength checker that rates passwords as weak, medium, or strong based on length and character variety.',
          hint: 'Create a function that checks the length and counts how many different character types are used!'
        }
      }
    ]
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
        content: {
          description: 'A student database stores information about students like their names, grades, and courses. SQL lets us organize this data in tables and retrieve it easily.',
          points: [
            'Create tables to store student information',
            'Insert student records with multiple fields',
            'Query data to find specific students or information',
            'Update records when information changes',
            'Use relationships between different tables'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how we\'ll structure our database:',
          points: [
            'Design a Students table with ID, name, email, and major',
            'Create a Grades table to store test scores',
            'Define primary keys to uniquely identify each record',
            'Use foreign keys to link students to their grades',
            'Write SELECT queries to retrieve information',
            'Use WHERE clauses to filter results'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'sql',
          code: `-- Create the Students table
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    major VARCHAR(50),
    enrollment_date DATE
);

-- Insert sample student records
INSERT INTO Students VALUES
    (1, 'Alice', 'Johnson', 'alice@email.com', 'Computer Science', '2023-09-01'),
    (2, 'Bob', 'Smith', 'bob@email.com', 'Mathematics', '2023-09-01'),
    (3, 'Carol', 'Davis', 'carol@email.com', 'Physics', '2023-09-01');

-- Query all students
SELECT * FROM Students;

-- Find students in Computer Science
SELECT first_name, last_name, email 
FROM Students 
WHERE major = 'Computer Science';

-- Update a student's major
UPDATE Students 
SET major = 'Data Science' 
WHERE student_id = 1;

-- Count students by major
SELECT major, COUNT(*) as student_count 
FROM Students 
GROUP BY major;`
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'See how SQL queries retrieve and manipulate student data!'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Add a Courses table and create a JOIN query to show which students are enrolled in which courses.',
          hint: 'You\'ll need a junction table to handle the many-to-many relationship between students and courses!'
        }
      }
    ]
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
        content: {
          description: 'A sales analytics system helps businesses understand their performance by calculating totals, averages, and trends from sales data.',
          points: [
            'Store sales transactions with dates and amounts',
            'Calculate total revenue and average sale amounts',
            'Find top-performing products or salespeople',
            'Group sales by time periods (daily, monthly)',
            'Identify trends and patterns in the data'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how we\'ll analyze sales data:',
          points: [
            'Create tables for Sales and Products',
            'Use SUM() to calculate total revenue',
            'Use AVG() to find average sale amounts',
            'Use COUNT() to count number of transactions',
            'Use GROUP BY to organize data by categories',
            'Use ORDER BY to rank results',
            'Apply date functions for time-based analysis'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'sql',
          code: `-- Create Sales table
CREATE TABLE Sales (
    sale_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    sale_amount DECIMAL(10, 2),
    sale_date DATE,
    salesperson VARCHAR(50)
);

-- Insert sample sales data
INSERT INTO Sales VALUES
    (1, 'Laptop', 1200.00, '2024-01-15', 'John'),
    (2, 'Mouse', 25.00, '2024-01-15', 'Sarah'),
    (3, 'Keyboard', 75.00, '2024-01-16', 'John'),
    (4, 'Monitor', 350.00, '2024-01-16', 'Sarah'),
    (5, 'Laptop', 1200.00, '2024-01-17', 'John');

-- Total revenue
SELECT SUM(sale_amount) as total_revenue 
FROM Sales;

-- Average sale amount
SELECT AVG(sale_amount) as avg_sale 
FROM Sales;

-- Sales by salesperson
SELECT salesperson, 
       COUNT(*) as num_sales,
       SUM(sale_amount) as total_sales,
       AVG(sale_amount) as avg_sale
FROM Sales
GROUP BY salesperson
ORDER BY total_sales DESC;

-- Daily sales summary
SELECT sale_date, 
       COUNT(*) as transactions,
       SUM(sale_amount) as daily_revenue
FROM Sales
GROUP BY sale_date
ORDER BY sale_date;

-- Top selling products
SELECT product_name, 
       COUNT(*) as times_sold,
       SUM(sale_amount) as revenue
FROM Sales
GROUP BY product_name
ORDER BY revenue DESC
LIMIT 3;`
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Watch SQL aggregate functions transform raw sales data into meaningful insights!'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Write a query to find the salesperson with the highest average sale amount, excluding sales below $100.',
          hint: 'Use HAVING clause to filter groups and nest your AVG() function with WHERE for filtering!'
        }
      }
    ]
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
        content: {
          description: 'A grade calculator takes multiple test scores, calculates the average, and assigns a letter grade (A, B, C, D, or F) based on the result.',
          points: [
            'Accept multiple test scores as input',
            'Calculate the average of all scores',
            'Determine the letter grade based on the average',
            'Display both the numeric average and letter grade',
            'Handle different grading scales'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how we\'ll calculate grades:',
          points: [
            'Store test scores in an array',
            'Loop through the array to sum all scores',
            'Divide the sum by the number of scores for average',
            'Use if-else statements to assign letter grades',
            'A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: below 60',
            'Format and display the results clearly'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'java',
          code: `public class GradeCalculator {
    
    public static double calculateAverage(double[] scores) {
        double sum = 0;
        for (double score : scores) {
            sum += score;
        }
        return sum / scores.length;
    }
    
    public static String getLetterGrade(double average) {
        if (average >= 90) {
            return "A";
        } else if (average >= 80) {
            return "B";
        } else if (average >= 70) {
            return "C";
        } else if (average >= 60) {
            return "D";
        } else {
            return "F";
        }
    }
    
    public static void main(String[] args) {
        double[] testScores = {85.5, 92.0, 78.5, 88.0, 95.0};
        
        double average = calculateAverage(testScores);
        String letterGrade = getLetterGrade(average);
        
        System.out.println("Test Scores:");
        for (int i = 0; i < testScores.length; i++) {
            System.out.println("Test " + (i + 1) + ": " + testScores[i]);
        }
        
        System.out.println("\\nAverage: " + String.format("%.2f", average));
        System.out.println("Letter Grade: " + letterGrade);
    }
}`
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'See how the calculator processes scores and assigns letter grades!'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Extend the calculator to support plus/minus grades (A+, A, A-, B+, etc.) for more precise grading.',
          hint: 'You\'ll need more detailed if-else conditions. For example, 97-100 is A+, 93-96 is A, 90-92 is A-!'
        }
      }
    ]
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
        content: {
          description: 'A number guessing game generates a random number and challenges the player to guess it. The game provides hints like "too high" or "too low" to guide the player.',
          points: [
            'Generate a random number within a range',
            'Accept user guesses as input',
            'Compare the guess to the secret number',
            'Provide feedback (too high, too low, or correct)',
            'Track the number of attempts',
            'Congratulate the player when they win'
          ]
        }
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Here\'s how the game works step-by-step:',
          points: [
            'Generate a random number between 1 and 100',
            'Initialize a counter for number of attempts',
            'Start a loop that continues until the correct guess',
            'Get the player\'s guess',
            'Compare guess to the secret number',
            'Print "Too high!" if guess is greater',
            'Print "Too low!" if guess is smaller',
            'Print "Correct!" and exit loop if guess matches',
            'Display the total number of attempts'
          ]
        }
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'java',
          code: `import java.util.Random;
import java.util.Scanner;

public class NumberGuessingGame {
    
    public static void main(String[] args) {
        Random random = new Random();
        Scanner scanner = new Scanner(System.in);
        
        int secretNumber = random.nextInt(100) + 1;
        int attempts = 0;
        boolean hasWon = false;
        
        System.out.println("Welcome to the Number Guessing Game!");
        System.out.println("I'm thinking of a number between 1 and 100.");
        
        while (!hasWon) {
            System.out.print("Enter your guess: ");
            int guess = scanner.nextInt();
            attempts++;
            
            if (guess < secretNumber) {
                System.out.println("Too low! Try again.");
            } else if (guess > secretNumber) {
                System.out.println("Too high! Try again.");
            } else {
                hasWon = true;
                System.out.println("\\n🎉 Congratulations! You guessed it!");
                System.out.println("The number was: " + secretNumber);
                System.out.println("It took you " + attempts + " attempts.");
                
                if (attempts <= 5) {
                    System.out.println("Excellent! You're a natural!");
                } else if (attempts <= 10) {
                    System.out.println("Good job!");
                } else {
                    System.out.println("You got there eventually!");
                }
            }
        }
        
        scanner.close();
    }
}`
        }
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Play the game and try to guess the number in as few attempts as possible!'
        }
      },
      {
        id: 5,
        title: 'Try It Yourself',
        type: 'challenge',
        content: {
          challenge: 'Add difficulty levels: Easy (1-50), Medium (1-100), and Hard (1-500). Let the player choose at the start.',
          hint: 'Use a switch statement or if-else to set the upper bound based on user input before generating the random number!'
        }
      }
    ]
  }
]

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}
