import { sandbox } from './sandboxInstance'

export interface BuildStep {
  id: number
  title: string
  description: string
  requirements: string[]
  starterCode: string
  testCases: TestCase[]
  hints: Hint[]
  successMessage: string
  /** Optional YouTube video ID shown in the left-panel video player. */
  videoId?: string
}

export interface TestCase {
  id: number
  description: string
  input?: any
  expected: any
  test: (code: string) => Promise<boolean>
}

export interface Hint {
  level: number
  text: string
  codeSnippet?: string
}

/* =============== DIGITAL CLOCK PROJECT =============== */

export const digitalClockBuildSteps: BuildStep[] = [
  {
    id: 1,
    title: 'Step 1: Get Current Time',
    description: 'First, let\'s learn how to get the current time from the computer.',
    requirements: [
      'Create a variable called "now" using new Date()',
      'Log the time to the console to see it',
    ],
    starterCode: '// TODO: Create a variable to store the current time\n// Hint: Use new Date() to get the current time\n\n// const now = new Date()\n// console.log("Time:", now)',
    testCases: [
      {
        id: 1,
        description: 'Should create a Date object',
        expected: 'Date object',
        test: async (code: string) => {
          return code.includes('new Date()') || code.includes('new Date(')
        },
      },
      {
        id: 2,
        description: 'Should store it in a variable',
        expected: 'Variable assignment',
        test: async (code: string) => {
          return /(?:const|let|var)\s+\w+\s*=/.test(code)
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'In JavaScript, we use "new Date()" to get the current date and time.',
      },
      {
        level: 1,
        text: 'Store the result in a variable using const, let, or var.',
        codeSnippet: 'const now = new Date()'
      }
    ],
    successMessage: 'Awesome! You\'ve learned how to get the current time!',
    videoId: 'jNQXAC9IVRw',
  },
  {
    id: 2,
    title: 'Step 2: Extract Hours, Minutes, Seconds',
    description: 'Now let\'s break down the time into hours, minutes, and seconds.',
    requirements: [
      'Get hours using getHours() method',
      'Get minutes using getMinutes() method',
      'Get seconds using getSeconds() method',
    ],
    starterCode: `const now = new Date()

// TODO: Extract hours, minutes, and seconds
// Use the getHours(), getMinutes(), and getSeconds() methods

console.log("Hours:", hours)
console.log("Minutes:", minutes)  
console.log("Seconds:", seconds)`,
    testCases: [
      {
        id: 1,
        description: 'Should extract hours',
        expected: 'hours variable',
        test: async (code: string) => {
          return code.includes('.getHours()') && /hours\s*=/.test(code)
        }
      },
      {
        id: 2,
        description: 'Should extract minutes',
        expected: 'minutes variable',
        test: async (code: string) => {
          return code.includes('.getMinutes()') && /minutes\s*=/.test(code)
        }
      },
      {
        id: 3,
        description: 'Should extract seconds',
        expected: 'seconds variable',
        test: async (code: string) => {
          return code.includes('.getSeconds()') && /seconds\s*=/.test(code)
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'Date objects have methods like getHours(), getMinutes(), and getSeconds().',
      },
      {
        level: 1,
        text: 'Call these methods on your "now" variable.',
        codeSnippet: 'const hours = now.getHours()\nconst minutes = now.getMinutes()\nconst seconds = now.getSeconds()'
      }
    ],
    successMessage: 'Perfect! You can now extract individual time components!',
    videoId: 'jNQXAC9IVRw',
  },
  {
    id: 3,
    title: 'Step 3: Format with Leading Zeros',
    description: 'Make the time look professional by adding leading zeros (e.g., "09" instead of "9").',
    requirements: [
      'Convert numbers to strings',
      'Add leading zeros using padStart(2, "0")',
      'Apply to hours, minutes, and seconds',
    ],
    starterCode: `const now = new Date()
const hours = now.getHours()
const minutes = now.getMinutes()
const seconds = now.getSeconds()

// TODO: Format each value with padStart to always show 2 digits
// Convert to string first, then use .padStart(2, '0')


console.log(\`Time: \${formattedHours}:\${formattedMinutes}:\${formattedSeconds}\`)`,
    testCases: [
      {
        id: 1,
        description: 'Should convert to string and use padStart',
        expected: 'padStart usage',
        test: async (code: string) => {
          return code.includes('padStart') && code.includes('.toString()')
        }
      },
      {
        id: 2,
        description: 'Should format all three time values',
        expected: '3 formatted variables',
        test: async (code: string) => {
          const matches = code.match(/padStart/g)
          return matches ? matches.length >= 3 : false
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'First convert the number to a string with .toString(), then use .padStart(2, "0").',
      },
      {
        level: 1,
        text: 'The padStart method adds characters to the start of a string until it reaches a certain length.',
        codeSnippet: 'const formattedHours = hours.toString().padStart(2, "0")'
      }
    ],
    successMessage: 'Excellent! Your time now looks professional with leading zeros!',
    videoId: 'jNQXAC9IVRw',
  }
]

/* =============== CALCULATOR PROJECT =============== */

export const calculatorBuildSteps: BuildStep[] = [
  {
    id: 1,
    title: 'Step 1: Basic Addition Function',
    description: 'Let\'s start by creating a simple function that adds two numbers.',
    requirements: [
      'Create a function called "add"',
      'Accept two parameters (a and b)',
      'Return the sum of a and b',
    ],
    starterCode: `// TODO: Create a function that adds two numbers
// function add(a, b) { ... }


// Test it
console.log(add(5, 3)) // Should output: 8
console.log(add(10, 20)) // Should output: 30`,
    testCases: [
      {
        id: 1,
        description: 'Should define an add function',
        expected: 'add function',
        test: async (code: string) => {
          return code.includes('function add') || code.includes('const add') || code.includes('let add')
        }
      },
      {
        id: 2,
        description: 'Should return the sum',
        expected: 'return a + b',
        test: async (code: string) => {
          return code.includes('return') && code.includes('+')
        }
      },
      {
        id: 3,
        description: 'Function should work correctly',
        expected: '8',
        test: async (code: string) => {
          try {
            const result = await sandbox.executeJavaScript(code + '\nconsole.log(add(5, 3))')
            return result.output.includes('8')
          } catch {
            return false
          }
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'A function in JavaScript starts with the "function" keyword, followed by a name and parameters.',
      },
      {
        level: 1,
        text: 'Use the return keyword to send back the result.',
        codeSnippet: 'function add(a, b) {\n  return a + b\n}'
      }
    ],
    successMessage: 'Great! You\'ve created your first calculator function!',
    videoId: 'jNQXAC9IVRw',
  },
  {
    id: 2,
    title: 'Step 2: Add More Operations',
    description: 'Now add subtract, multiply, and divide functions.',
    requirements: [
      'Create a subtract function (a - b)',
      'Create a multiply function (a * b)',
      'Create a divide function (a / b)',
    ],
    starterCode: `function add(a, b) {
  return a + b
}

// TODO: Create subtract, multiply, and divide functions




// Test them
console.log(subtract(10, 3)) // Should output: 7
console.log(multiply(4, 5)) // Should output: 20
console.log(divide(20, 4)) // Should output: 5`,
    testCases: [
      {
        id: 1,
        description: 'Should define subtract function',
        expected: 'subtract function',
        test: async (code: string) => {
          return code.includes('function subtract') || code.includes('const subtract')
        }
      },
      {
        id: 2,
        description: 'Should define multiply function',
        expected: 'multiply function',
        test: async (code: string) => {
          return code.includes('function multiply') || code.includes('const multiply')
        }
      },
      {
        id: 3,
        description: 'Should define divide function',
        expected: 'divide function',
        test: async (code: string) => {
          return code.includes('function divide') || code.includes('const divide')
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'Follow the same pattern as the add function, but use different operators (-, *, /).',
      },
      {
        level: 1,
        text: 'Each function should take two parameters and return the result of the operation.',
        codeSnippet: 'function subtract(a, b) {\n  return a - b\n}\n\nfunction multiply(a, b) {\n  return a * b\n}\n\nfunction divide(a, b) {\n  return a / b\n}'
      }
    ],
    successMessage: 'Awesome! Your calculator now has all basic operations!',
    videoId: 'jNQXAC9IVRw',
  },
  {
    id: 3,
    title: 'Step 3: Create a Calculator Function',
    description: 'Combine everything into one smart calculator function.',
    requirements: [
      'Create a calculate function that takes 3 parameters: num1, operator, num2',
      'Use if/else or switch to check which operation to perform',
      'Return the result of the calculation',
    ],
    starterCode: `function add(a, b) { return a + b }
function subtract(a, b) { return a - b }
function multiply(a, b) { return a * b }
function divide(a, b) { return a / b }

// TODO: Create a calculate function
// It should accept: num1, operator ('+', '-', '*', '/'), num2
// Use if/else or switch to call the right function


// Test it
console.log(calculate(10, '+', 5)) // Should output: 15
console.log(calculate(10, '-', 5)) // Should output: 5
console.log(calculate(10, '*', 5)) // Should output: 50
console.log(calculate(10, '/', 5)) // Should output: 2`,
    testCases: [
      {
        id: 1,
        description: 'Should define calculate function',
        expected: 'calculate function',
        test: async (code: string) => {
          return code.includes('function calculate') || code.includes('const calculate')
        }
      },
      {
        id: 2,
        description: 'Should use conditional logic',
        expected: 'if/switch statement',
        test: async (code: string) => {
          return code.includes('if') || code.includes('switch')
        }
      },
      {
        id: 3,
        description: 'Should handle all operations',
        expected: 'all operators',
        test: async (code: string) => {
          return code.includes("'+'") || code.includes('"+') || 
                 (code.includes("'-'") || code.includes('"-')) && 
                 (code.includes("'*'") || code.includes('"*'))
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'Use an if/else chain or switch statement to check which operator was passed.',
      },
      {
        level: 1,
        text: 'For each operator, call the corresponding function and return its result.',
        codeSnippet: `function calculate(num1, operator, num2) {
  if (operator === '+') {
    return add(num1, num2)
  } else if (operator === '-') {
    return subtract(num1, num2)
  } else if (operator === '*') {
    return multiply(num1, num2)
  } else if (operator === '/') {
    return divide(num1, num2)
  }
}`
      }
    ],
    successMessage: 'Perfect! You\'ve built a fully functional calculator!',
    videoId: 'jNQXAC9IVRw',
  }
]

/* =============== TEMPERATURE CONVERTER PROJECT =============== */

export const temperatureConverterBuildSteps: BuildStep[] = [
  {
    id: 1,
    title: 'Step 1: Celsius to Fahrenheit',
    description: 'Create a function to convert Celsius to Fahrenheit. Formula: (C × 9/5) + 32',
    requirements: [
      'Create a celsiusToFahrenheit function',
      'Apply the formula: (celsius * 9/5) + 32',
      'Return the result',
    ],
    starterCode: `// TODO: Create a function to convert Celsius to Fahrenheit
// Formula: (celsius * 9/5) + 32


// Test it
console.log(celsiusToFahrenheit(0)) // Should output: 32
console.log(celsiusToFahrenheit(100)) // Should output: 212`,
    testCases: [
      {
        id: 1,
        description: 'Should define celsiusToFahrenheit function',
        expected: 'function definition',
        test: async (code: string) => {
          return code.includes('function celsiusToFahrenheit') || code.includes('const celsiusToFahrenheit')
        }
      },
      {
        id: 2,
        description: 'Should use correct formula',
        expected: 'formula with 9/5 and 32',
        test: async (code: string) => {
          return code.includes('9/5') || code.includes('1.8')
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'The formula for converting Celsius to Fahrenheit is: (celsius * 9/5) + 32',
      },
      {
        level: 1,
        text: 'Create a function that takes celsius as a parameter and returns the calculated value.',
        codeSnippet: 'function celsiusToFahrenheit(celsius) {\n  return (celsius * 9/5) + 32\n}'
      }
    ],
    successMessage: 'Excellent! You can now convert Celsius to Fahrenheit!',
    videoId: 'jNQXAC9IVRw',
  },
  {
    id: 2,
    title: 'Step 2: Fahrenheit to Celsius',
    description: 'Create the reverse function. Formula: (F - 32) × 5/9',
    requirements: [
      'Create a fahrenheitToCelsius function',
      'Apply the formula: (fahrenheit - 32) * 5/9',
      'Return the result',
    ],
    starterCode: `function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32
}

// TODO: Create a function to convert Fahrenheit to Celsius
// Formula: (fahrenheit - 32) * 5/9


// Test it
console.log(fahrenheitToCelsius(32)) // Should output: 0
console.log(fahrenheitToCelsius(212)) // Should output: 100`,
    testCases: [
      {
        id: 1,
        description: 'Should define fahrenheitToCelsius function',
        expected: 'function definition',
        test: async (code: string) => {
          return code.includes('function fahrenheitToCelsius') || code.includes('const fahrenheitToCelsius')
        }
      },
      {
        id: 2,
        description: 'Should use correct formula',
        expected: 'formula with - 32 and 5/9',
        test: async (code: string) => {
          return code.includes('- 32') && (code.includes('5/9') || code.includes('* 5'))
        }
      }
    ],
    hints: [
      {
        level: 0,
        text: 'This is the reverse operation. Subtract 32 first, then multiply by 5/9.',
      },
      {
        level: 1,
        text: 'Remember to use parentheses for the order of operations.',
        codeSnippet: 'function fahrenheitToCelsius(fahrenheit) {\n  return (fahrenheit - 32) * 5/9\n}'
      }
    ],
    successMessage: 'Perfect! Your temperature converter works both ways!',
    videoId: 'jNQXAC9IVRw',
  }
]

/* =============== STUDENT DATABASE PROJECT =============== */

export const studentDatabaseSteps: BuildStep[] = [
  {
    id: 1,
    title: 'Step 1: Define the Dictionary',
    description: 'First, let\'s create a Python dictionary to store student names and their corresponding grades.',
    requirements: [
      'Create a dictionary named "student_grades".',
      'Add at least three students with their names as keys (strings) and grades as values (integers).',
    ],
    starterCode: `# TODO: Create a dictionary named student_grades
# Add at least three students with names (strings) as keys and grades (integers) as values

# Example:
# student_grades = {
#     "Alice": 90,
#     "Bob": 85,
#     "Charlie": 92
# }`,
    testCases: [
      {
        id: 1,
        description: 'Should define "student_grades" dictionary',
        expected: 'student_grades dictionary',
        test: async (code: string) => {
          return code.includes('student_grades = {') || code.includes('student_grades = dict(')
        },
      },
      {
        id: 2,
        description: 'Should contain at least 3 key-value pairs',
        expected: '3+ key-value pairs',
        test: async (code: string) => {
          const matches = code.match(/:/g)
          return matches ? matches.length >= 3 : false
        },
      },
      {
        id: 3,
        description: 'Should use string keys',
        expected: 'string keys',
        test: async (code: string) => {
          return /"\w+":/.test(code) || /'\w+':/.test(code)
        },
      },
      {
        id: 4,
        description: 'Should use integer values',
        expected: 'integer values',
        test: async (code: string) => {
          const matches = code.match(/:\s*\d+/g)
          return matches ? matches.length >= 3 : false // At least 3 integer values
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'In Python, dictionaries are defined using curly braces `{}` with key-value pairs.',
      },
      {
        level: 1,
        text: 'Example: `my_dict = {"key1": value1, "key2": value2}`',
        codeSnippet: 'student_grades = {\n    "Alice": 90,\n    "Bob": 85,\n    "Charlie": 92\n}'
      }
    ],
    successMessage: 'Great! You\'ve successfully defined your student grades dictionary.',
    videoId: 'jNQXAC9IVRw',
  },
  {
    id: 2,
    title: 'Step 2: Create the Lookup Function',
    description: 'Now, let\'s write a function to look up a student\'s grade from the dictionary.',
    requirements: [
      'Define a function `get_student_grade` that takes two arguments: `grades_dict` and `student_name`.',
      'The function should return the grade if the student exists in the dictionary.',
      'If the student is not found, return `None`.',
    ],
    starterCode: `# TODO: Define a function get_student_grade(grades_dict, student_name)
# It should return the grade if the student exists, otherwise None

# Example usage (after defining student_grades in Step 1):
# student_grades = {
#     "Alice": 90,
#     "Bob": 85,
#     "Charlie": 92
# }
#
# def get_student_grade(grades_dict, student_name):
#     # Your code here
#     pass
#
# # print(get_student_grade(student_grades, "Alice")) # Should output: 90
# # print(get_student_grade(student_grades, "David")) # Should output: None`,
    testCases: [
      {
        id: 1,
        description: 'Should define "get_student_grade" function',
        expected: 'function definition',
        test: async (code: string) => {
          return code.includes('def get_student_grade(')
        },
      },
      {
        id: 2,
        description: 'Should check for student existence (e.g., using "in" or "get")',
        expected: '"in" operator or ".get()" method',
        test: async (code: string) => {
          return code.includes(' in ') || code.includes('.get(')
        },
      },
      {
        id: 3,
        description: 'Should return grade if found',
        expected: 'return grades_dict[student_name] or grades_dict.get(student_name)',
        test: async (code: string) => {
          return code.includes('return grades_dict[') || code.includes('return grades_dict.get(')
        },
      },
      {
        id: 4,
        description: 'Should return None if not found',
        expected: 'return None',
        test: async (code: string) => {
          return code.includes('return None')
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'You can check if a key exists in a dictionary using the `in` operator or the `get()` method.',
      },
      {
        level: 1,
        text: 'The `get()` method allows you to specify a default value if the key is not found, e.g., `grades_dict.get(student_name, None)`',
        codeSnippet: 'def get_student_grade(grades_dict, student_name):\n    if student_name in grades_dict:\n        return grades_dict[student_name]\n    else:\n        return None'
      }
    ],
    successMessage: 'Excellent! Your lookup function works perfectly.',
    videoId: 'jNQXAC9IVRw',
  },
]

export const projectBuilderConfigs: Record<string, BuildStep[]> = {
  'digital-clock': digitalClockBuildSteps,
  'calculator': calculatorBuildSteps,
  'temperature-converter': temperatureConverterBuildSteps,
  'student-database': studentDatabaseSteps,
}
