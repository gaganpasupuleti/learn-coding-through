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
    starterCode: '// TODO: Create a variable to store the current time\n// Hint: Use new Date() to get the current time\n\nconsole.log("Time:", now)',
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
    successMessage: 'Awesome! You\'ve learned how to get the current time!'
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
    successMessage: 'Perfect! You can now extract individual time components!'
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
    successMessage: 'Excellent! Your time now looks professional with leading zeros!'
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
    successMessage: 'Great! You\'ve created your first calculator function!'
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
    successMessage: 'Awesome! Your calculator now has all basic operations!'
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
    successMessage: 'Perfect! You\'ve built a fully functional calculator!'
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
    successMessage: 'Excellent! You can now convert Celsius to Fahrenheit!'
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
    successMessage: 'Perfect! Your temperature converter works both ways!'
  }
]

/* =============== RESUME BUILDER PROJECT =============== */

export const resumeBuilderBuildSteps: BuildStep[] = [
  {
    id: 1,
    title: 'Step 1: Build Base Profile',
    description: 'Start by creating a function that initializes a resume profile dictionary.',
    requirements: [
      'Create a function named buildProfile',
      'Accept fullName, email, and summary parameters',
      'Return an object with keys: full_name, email, summary, skills, experience',
    ],
    starterCode: `// TODO: Create buildProfile(fullName, email, summary)
// It should return an object with empty skills and experience arrays


console.log(buildProfile('Asha Patel', 'asha@mail.com', 'Frontend developer'))`,
    testCases: [
      {
        id: 1,
        description: 'Should define buildProfile function',
        expected: 'Function exists',
        test: async (code: string) => {
          return code.includes('function buildProfile') || code.includes('const buildProfile')
        },
      },
      {
        id: 2,
        description: 'Should return profile shape',
        expected: 'Object with required keys',
        test: async (code: string) => {
          return ['full_name', 'email', 'summary', 'skills', 'experience'].every((key) => code.includes(key))
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'Return one object literal that stores all profile fields.',
      },
      {
        level: 1,
        text: 'Initialize skills and experience as empty arrays so we can append data later.',
        codeSnippet: "function buildProfile(fullName, email, summary) {\n  return { full_name: fullName, email, summary, skills: [], experience: [] }\n}",
      },
    ],
    successMessage: 'Great start! Your base resume profile is ready.'
  },
  {
    id: 2,
    title: 'Step 2: Normalize Skills',
    description: 'Add a helper that cleans skill input and removes duplicates.',
    requirements: [
      'Create a function called addSkills(profile, skills)',
      'Trim and lowercase each skill',
      'Remove duplicates before storing them in profile.skills',
    ],
    starterCode: `function buildProfile(fullName, email, summary) {
  return { full_name: fullName, email, summary, skills: [], experience: [] }
}

// TODO: Create addSkills(profile, skills)
// skills will be an array like ['React', ' TypeScript ', 'react']


const profile = buildProfile('Asha', 'asha@mail.com', 'Frontend dev')
console.log(addSkills(profile, ['React', ' TypeScript ', 'react']))`,
    testCases: [
      {
        id: 1,
        description: 'Should create addSkills function',
        expected: 'Function exists',
        test: async (code: string) => {
          return code.includes('function addSkills') || code.includes('const addSkills')
        },
      },
      {
        id: 2,
        description: 'Should normalize and deduplicate',
        expected: 'trim/lowercase + unique',
        test: async (code: string) => {
          return code.includes('trim') && (code.includes('toLowerCase') || code.includes('toLowerCase()'))
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'A Set is useful when you want unique values.',
      },
      {
        level: 1,
        text: 'Map each skill through trim and toLowerCase before adding to Set.',
        codeSnippet: 'const normalized = [...new Set(skills.map((s) => s.trim().toLowerCase()))]'
      }
    ],
    successMessage: 'Nice! Skills are now clean and duplicate-free.'
  },
  {
    id: 3,
    title: 'Step 3: Add Experience Entries',
    description: 'Now add a function to push work experience items into the profile.',
    requirements: [
      'Create addExperience(profile, title, company, impact)',
      'Push a new object with title, company, and impact into profile.experience',
      'Return the updated profile',
    ],
    starterCode: `function buildProfile(fullName, email, summary) {
  return { full_name: fullName, email, summary, skills: [], experience: [] }
}

// TODO: Create addExperience(profile, title, company, impact)


const profile = buildProfile('Asha', 'asha@mail.com', 'Frontend dev')
console.log(addExperience(profile, 'Frontend Intern', 'Acme', 'Built reusable dashboard widgets'))`,
    testCases: [
      {
        id: 1,
        description: 'Should create addExperience function',
        expected: 'Function exists',
        test: async (code: string) => {
          return code.includes('function addExperience') || code.includes('const addExperience')
        },
      },
      {
        id: 2,
        description: 'Should push into experience list',
        expected: 'push call',
        test: async (code: string) => {
          return code.includes('experience') && code.includes('push')
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'Create one object for the new experience and push it into profile.experience.',
      },
      {
        level: 1,
        text: 'The new object should include exactly title, company, and impact fields.',
      },
    ],
    successMessage: 'Excellent! Your resume can now store project/work history.'
  },
  {
    id: 4,
    title: 'Step 4: Compute ATS Score',
    description: 'Implement an ATS score function by matching required vs candidate skills.',
    requirements: [
      'Create atsScore(requiredSkills, candidateSkills)',
      'Compare skills case-insensitively',
      'Return percentage match as an integer from 0 to 100',
    ],
    starterCode: `// TODO: Create atsScore(requiredSkills, candidateSkills)
// Example: ['react', 'typescript'] vs ['React', 'TypeScript', 'css'] should return 100


console.log(atsScore(['react', 'typescript', 'python'], ['React', 'TypeScript'])) // Expected around 66`,
    testCases: [
      {
        id: 1,
        description: 'Should define atsScore function',
        expected: 'Function exists',
        test: async (code: string) => {
          return code.includes('function atsScore') || code.includes('const atsScore')
        },
      },
      {
        id: 2,
        description: 'Should use intersection logic',
        expected: 'matching sets',
        test: async (code: string) => {
          return code.includes('Set') || code.includes('filter')
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'Convert both arrays to lowercase sets before comparison.',
      },
      {
        level: 1,
        text: 'Use matched/required length times 100, then Math.floor or Math.round.',
        codeSnippet: 'return Math.floor((matched / required.size) * 100)'
      },
    ],
    successMessage: 'Great! You now have a meaningful resume quality score.'
  },
  {
    id: 5,
    title: 'Step 5: Render Markdown Resume',
    description: 'Finish by generating a markdown version that can be copied to a CV document.',
    requirements: [
      'Create renderMarkdown(profile) function',
      'Include full name, summary, skills, and experience sections',
      'Return one markdown string',
    ],
    starterCode: `// TODO: Create renderMarkdown(profile)
// Return markdown with sections: Name, Summary, Skills, Experience


const profile = {
  full_name: 'Asha Patel',
  email: 'asha@mail.com',
  summary: 'Frontend developer with strong UI focus',
  skills: ['react', 'typescript', 'tailwind'],
  experience: [
    { title: 'Frontend Intern', company: 'Acme', impact: 'Built reusable dashboard widgets' }
  ]
}

console.log(renderMarkdown(profile))`,
    testCases: [
      {
        id: 1,
        description: 'Should define renderMarkdown function',
        expected: 'Function exists',
        test: async (code: string) => {
          return code.includes('function renderMarkdown') || code.includes('const renderMarkdown')
        },
      },
      {
        id: 2,
        description: 'Should include markdown heading structure',
        expected: '# and section markers',
        test: async (code: string) => {
          return code.includes('#') && (code.includes('Skills') || code.includes('Experience'))
        },
      },
    ],
    hints: [
      {
        level: 0,
        text: 'Build the markdown with template literals and array joins.',
      },
      {
        level: 1,
        text: 'Convert each experience object into a bullet line like: - Title at Company: Impact.',
      },
    ],
    successMessage: 'Outstanding! You completed an end-to-end Resume Builder workflow.'
  },
]

export const projectBuilderConfigs: Record<string, BuildStep[]> = {
  'digital-clock': digitalClockBuildSteps,
  'calculator': calculatorBuildSteps,
  'temperature-converter': temperatureConverterBuildSteps,
  'resume-builder': resumeBuilderBuildSteps,
}

