export type QuizQuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'code-completion'
  | 'code-output'

interface BaseQuestion {
  id: number
  type: QuizQuestionType
  title: string
  prompt: string
  explanation: string
  code?: string
  language?: string
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice' | 'true-false'
  options: string[]
  correctIndex: number
}

export interface CodeCompletionQuestion extends BaseQuestion {
  type: 'code-completion'
  answer: string
  acceptableAnswers?: string[]
}

export interface CodeOutputQuestion extends BaseQuestion {
  type: 'code-output'
  expectedOutput: string
}

export type QuizQuestion =
  | ChoiceQuestion
  | CodeCompletionQuestion
  | CodeOutputQuestion

export interface Quiz {
  id: string
  title: string
  description: string
  difficulty: 'beginner'
  estimatedTime: string
  questions: QuizQuestion[]
}

export const quizzes: Quiz[] = [
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
        explanation: 'The <h1> tag is used for the top-level heading in HTML.'
      },
      {
        id: 2,
        type: 'true-false',
        title: 'CSS Responsibility',
        prompt: 'CSS is responsible for the structure of a web page.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'HTML provides structure, while CSS handles presentation and styling.'
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
        explanation: 'The click handler should log a message inside the callback function.'
      },
      {
        id: 4,
        type: 'code-output',
        title: 'Array Length',
        prompt: 'What is the output of this code?',
        code: 'const colors = [\'red\', \'blue\', \'green\']\nconsole.log(colors.length)',
        language: 'javascript',
        expectedOutput: '3',
        explanation: 'Arrays store three items, so length is 3.'
      }
    ]
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
        explanation: 'The strict equality operator (===) checks both value and type.'
      },
      {
        id: 2,
        type: 'true-false',
        title: 'Loop Behavior',
        prompt: 'A for-loop can run zero times if its condition is false at the start.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'If the condition is false initially, the loop body never runs.'
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
        explanation: 'The function needs to return the sum of a and b.'
      },
      {
        id: 4,
        type: 'code-output',
        title: 'Loop Output',
        prompt: 'What is the output of this code?',
        code: 'let total = 0\nfor (let i = 1; i <= 3; i += 1) {\n  total += i\n}\nconsole.log(total)',
        language: 'javascript',
        expectedOutput: '6',
        explanation: 'The loop adds 1 + 2 + 3, which equals 6.'
      }
    ]
  }
]
