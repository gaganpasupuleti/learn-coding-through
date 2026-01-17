export const testCases = {
  javascript: {
    basic: `// Basic JavaScript test
console.log("Hello from JavaScript!");
const x = 10;
const y = 20;
console.log("Sum:", x + y);`,
    
    loops: `// Loop test
for (let i = 1; i <= 5; i++) {
  console.log("Count:", i);
}`,
    
    functions: `// Function test
function greet(name) {
  return "Hello, " + name + "!";
}
console.log(greet("Student"));`,
    
    arrays: `// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Original:", numbers);
console.log("Doubled:", doubled);`,
  },

  python: {
    basic: `# Basic Python test
print("Hello from Python!")
x = 10
y = 20
print("Sum:", x + y)`,
    
    loops: `# Loop test
for i in range(1, 6):
    print("Count:", i)`,
    
    functions: `# Function test
def greet(name):
    return "Hello, " + name + "!"
print(greet("Student"))`,
    
    lists: `# List operations
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Original:", numbers)
print("Doubled:", doubled)`,
  },

  java: {
    basic: `// Basic Java test
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        int x = 10;
        int y = 20;
        System.out.println("Sum: " + (x + y));
    }
}`,
    
    loops: `// Loop test
public class LoopTest {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}`,
    
    methods: `// Method test
public class GreetingApp {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static void main(String[] args) {
        System.out.println(greet("Student"));
    }
}`,
    
    numberGuesser: `import java.util.Random;
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
            
            if (guess == secretNumber) {
                hasWon = true;
                System.out.println("Congratulations! You won in " + attempts + " attempts!");
            } else if (guess < secretNumber) {
                System.out.println("Too low! Try again.");
            } else {
                System.out.println("Too high! Try again.");
            }
        }
        
        scanner.close();
    }
}`,
  },

  sql: {
    basic: `-- Basic SQL test
SELECT * FROM users;`,
    
    insert: `-- Insert test
INSERT INTO users (name, email, age) 
VALUES ('John Doe', 'john@example.com', 25);`,
    
    update: `-- Update test
UPDATE users 
SET age = 26 
WHERE name = 'John Doe';`,
    
    delete: `-- Delete test
DELETE FROM users 
WHERE age < 18;`,
    
    join: `-- Join test
SELECT orders.id, customers.name, orders.total
FROM orders
INNER JOIN customers ON orders.customer_id = customers.id
WHERE orders.total > 100;`,
    
    createTable: `-- Create table test
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    stock INT
);`,
  }
}

export function getTestCase(language: string, testName: string): string {
  const lang = language.toLowerCase()
  const tests = testCases[lang as keyof typeof testCases]
  
  if (!tests) {
    return `// No test cases available for ${language}`
  }
  
  return tests[testName as keyof typeof tests] || tests[Object.keys(tests)[0] as keyof typeof tests]
}

export function getAllTestsForLanguage(language: string): Record<string, string> {
  const lang = language.toLowerCase()
  return testCases[lang as keyof typeof testCases] || {}
}
