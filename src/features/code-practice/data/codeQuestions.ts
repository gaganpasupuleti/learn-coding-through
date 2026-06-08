import type { CodePracticeLanguageMode, CodePracticeQuestion } from '../types/codePractice.types'

export const CODE_PRACTICE_QUESTIONS: CodePracticeQuestion[] = [
  // ── Python ──
  {
    id: 'py-hello-world',
    title: 'Print Hello World',
    language: 'python',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Write a program that prints exactly `Hello World` to standard output.',
    examples: [
      { input: '(none)', output: 'Hello World', explanation: 'Print a single line with no extra spaces.' },
    ],
    constraints: ['Use print()', 'Output must match exactly (case-sensitive)'],
    starterCode: '# Print Hello World\nprint("Hello World")\n',
    expectedOutput: 'Hello World',
    testCases: [
      { id: 'py-hw-1', label: 'Sample case', expectedOutput: 'Hello World' },
    ],
    hints: ['Use the built-in print() function.', 'Wrap the text in double quotes.'],
  },
  {
    id: 'py-add-two',
    title: 'Add Two Numbers',
    language: 'python',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Read two integers from input (one per line), add them, and print the sum.',
    examples: [
      { input: '2\\n3', output: '5' },
      { input: '10\\n20', output: '30' },
    ],
    constraints: ['Assume valid integers', 'Print only the sum on one line'],
    starterCode: 'a = int(input())\nb = int(input())\nprint(a + b)\n',
    expectedOutput: '5',
    defaultInput: '2\n3',
    testCases: [
      { id: 'py-add-1', label: '2 + 3', input: '2\n3', expectedOutput: '5' },
      { id: 'py-add-2', label: '10 + 20', input: '10\n20', expectedOutput: '30' },
    ],
    hints: ['Use int(input()) to read each number.', 'Sample input is shown beside the output panel.'],
  },
  {
    id: 'py-even-odd',
    title: 'Check Even or Odd',
    language: 'python',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Read an integer and print `Even` if it is even, otherwise print `Odd`.',
    examples: [
      { input: '4', output: 'Even' },
      { input: '7', output: 'Odd' },
    ],
    constraints: ['Use modulo (%) operator', 'Output must be exactly `Even` or `Odd`'],
    starterCode: 'n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n',
    expectedOutput: 'Even',
    defaultInput: '4',
    testCases: [
      { id: 'py-eo-1', label: 'Even (4)', input: '4', expectedOutput: 'Even' },
      { id: 'py-eo-2', label: 'Odd (7)', input: '7', expectedOutput: 'Odd' },
    ],
    hints: ['A number is even when n % 2 == 0.', 'Use an if/else to choose the label.'],
  },

  // ── JavaScript ──
  {
    id: 'js-hello-world',
    title: 'Print Hello World',
    language: 'javascript',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Use `console.log` to print exactly `Hello World`.',
    examples: [
      { input: '(none)', output: 'Hello World' },
    ],
    constraints: ['Use console.log', 'No extra lines'],
    starterCode: '// Print Hello World\nconsole.log("Hello World");\n',
    expectedOutput: 'Hello World',
    testCases: [
      { id: 'js-hw-1', label: 'Sample case', expectedOutput: 'Hello World' },
    ],
    hints: ['console.log writes to stdout in our runner.', 'Match the string exactly.'],
  },
  {
    id: 'js-add-two',
    title: 'Add Two Numbers',
    language: 'javascript',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Given two numbers stored in variables `a` and `b`, print their sum.',
    examples: [
      { input: 'a=2, b=3', output: '5' },
      { input: 'a=10, b=20', output: '30' },
    ],
    constraints: ['Variables a and b are pre-defined in starter', 'Print only the number'],
    starterCode: 'const a = 2;\nconst b = 3;\nconsole.log(a + b);\n',
    expectedOutput: '5',
    defaultInput: 'a=2, b=3',
    testCases: [
      { id: 'js-add-1', label: '2 + 3', expectedOutput: '5' },
      { id: 'js-add-2', label: '10 + 20 (change a/b in code)', expectedOutput: '30' },
    ],
    hints: ['Use console.log(a + b).', 'Change a and b locally to match other sample cases.'],
  },
  {
    id: 'js-reverse-string',
    title: 'Reverse a String',
    language: 'javascript',
    difficulty: 'medium',
    topic: 'strings',
    description: 'Reverse the string stored in `text` and print the result.',
    examples: [
      { input: 'text = "code"', output: 'edoc' },
      { input: 'text = "hello"', output: 'olleh' },
    ],
    constraints: ['Do not use external libraries', 'Preserve character casing'],
    starterCode: 'const text = "code";\nconsole.log(text.split("").reverse().join(""));\n',
    expectedOutput: 'edoc',
    defaultInput: 'text = "code"',
    testCases: [
      { id: 'js-rev-1', label: 'Reverse "code"', expectedOutput: 'edoc' },
      { id: 'js-rev-2', label: 'Reverse "hello" (change text)', expectedOutput: 'olleh' },
    ],
    hints: ['Try text.split("").reverse().join("")', 'Or loop from the end of the string.'],
  },

  // ── React ──
  {
    id: 'react-button',
    title: 'Create a Button',
    language: 'react',
    difficulty: 'easy',
    topic: 'components',
    description: 'Define a React component that renders a button with the label `Click me`.',
    examples: [
      { input: '(render)', output: 'Click me' },
    ],
    constraints: ['Use a functional component', 'Button text must be exactly `Click me`'],
    starterCode: `function App() {
  return (
    <button>Click me</button>
  );
}

console.log("Click me");
`,
    expectedOutput: 'Click me',
    testCases: [
      { id: 'react-btn-1', label: 'Button label', expectedOutput: 'Click me' },
    ],
    hints: ['Return JSX from your component.', 'Use console.log for Phase 2 checks until Sandpack preview.'],
  },
  {
    id: 'react-card',
    title: 'Create a Card',
    language: 'react',
    difficulty: 'medium',
    topic: 'ui',
    description: 'Build a card component that shows a title `Welcome` and body text `Start coding`.',
    examples: [
      { input: '(render)', output: 'Welcome\\nStart coding' },
    ],
    constraints: ['Use semantic structure (heading + paragraph)', 'Text must match exactly'],
    starterCode: `function Card() {
  return (
    <div className="card">
      <h2>Welcome</h2>
      <p>Start coding</p>
    </div>
  );
}

console.log("Welcome");
console.log("Start coding");
`,
    expectedOutput: 'Welcome\nStart coding',
    testCases: [
      { id: 'react-card-1', label: 'Card copy', expectedOutput: 'Welcome\nStart coding' },
    ],
    hints: ['Use <h2> for the title and <p> for the body.', 'console.log each line until live preview ships.'],
  },
  {
    id: 'react-counter',
    title: 'Create a Counter',
    language: 'react',
    difficulty: 'medium',
    topic: 'state',
    description: 'Create a counter that starts at 0 and prints `Count: 0` (stateful UI in Phase 3).',
    examples: [
      { input: '(initial)', output: 'Count: 0' },
    ],
    constraints: ['Initial count is 0', 'Label format: `Count: N`'],
    starterCode: `function Counter() {
  const count = 0;
  return <p>Count: {count}</p>;
}

console.log("Count: 0");
`,
    expectedOutput: 'Count: 0',
    testCases: [
      { id: 'react-ctr-1', label: 'Initial count', expectedOutput: 'Count: 0' },
    ],
    hints: ['Log the expected initial state for now.', 'useState + Sandpack preview arrive in Phase 3.'],
  },
]

export function getQuestionsForLanguage(language: CodePracticeLanguageMode): CodePracticeQuestion[] {
  return CODE_PRACTICE_QUESTIONS.filter((q) => q.language === language)
}

export function getQuestionById(id: string): CodePracticeQuestion | undefined {
  return CODE_PRACTICE_QUESTIONS.find((q) => q.id === id)
}

export function getDefaultQuestionForLanguage(language: CodePracticeLanguageMode): CodePracticeQuestion | null {
  const questions = getQuestionsForLanguage(language)
  return questions[0] ?? null
}
