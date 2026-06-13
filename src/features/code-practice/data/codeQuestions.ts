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

  // ── Java ──
  {
    id: 'java-hello-world',
    title: 'Print Hello World',
    language: 'java',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Write a program that prints exactly `Hello World` to standard output.',
    examples: [
      { input: '(none)', output: 'Hello World', explanation: 'Use System.out.println with the exact text.' },
    ],
    constraints: ['Class must be named `Main`', 'Use System.out.println', 'Output must match exactly'],
    starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`,
    expectedOutput: 'Hello World',
    testCases: [
      { id: 'java-hw-1', label: 'Sample case', expectedOutput: 'Hello World' },
    ],
    hints: ['Java programs need a public class and a main method.', 'Use System.out.println("Hello World");'],
  },
  {
    id: 'java-add-two',
    title: 'Add Two Numbers',
    language: 'java',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Given two integers stored in variables `a` and `b`, print their sum.',
    examples: [
      { input: 'a=2, b=3', output: '5' },
    ],
    constraints: ['Variables a and b are pre-defined in starter', 'Print only the number'],
    starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 2;
        int b = 3;
        System.out.println(a + b);
    }
}
`,
    expectedOutput: '5',
    defaultInput: 'a=2, b=3',
    testCases: [
      { id: 'java-add-1', label: '2 + 3', expectedOutput: '5' },
    ],
    hints: ['Use System.out.println(a + b);', 'Change a and b in the editor to experiment — Submit checks this case only.'],
  },
  {
    id: 'java-even-odd',
    title: 'Check Even or Odd',
    language: 'java',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Given an integer `n`, print `Even` if it is even, otherwise print `Odd`.',
    examples: [
      { input: 'n=4', output: 'Even' },
    ],
    constraints: ['Use modulo (%) operator', 'Output must be exactly `Even` or `Odd`'],
    starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 4;
        if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
    }
}
`,
    expectedOutput: 'Even',
    defaultInput: 'n=4',
    testCases: [
      { id: 'java-eo-1', label: 'Even (4)', expectedOutput: 'Even' },
    ],
    hints: ['A number is even when n % 2 == 0.', 'Change n in the editor to try odd values — Submit checks n=4 only.'],
  },
  {
    id: 'java-max-two',
    title: 'Max of Two Numbers',
    language: 'java',
    difficulty: 'easy',
    topic: 'basics',
    description: 'Given integers `a` and `b`, print the larger value.',
    examples: [
      { input: 'a=7, b=12', output: '12' },
    ],
    constraints: ['Use in-code variables', 'Print only the number'],
    starterCode: `public class Main {
    public static void main(String[] args) {
        int a = 7;
        int b = 12;
        System.out.println(Math.max(a, b));
    }
}
`,
    expectedOutput: '12',
    defaultInput: 'a=7, b=12',
    testCases: [
      { id: 'java-max-1', label: 'max(7, 12)', expectedOutput: '12' },
    ],
    hints: ['Try Math.max(a, b).', 'Change a and b in the editor to experiment — Submit checks this case only.'],
  },
  {
    id: 'java-print-one-to-five',
    title: 'Print Numbers 1 to 5',
    language: 'java',
    difficulty: 'easy',
    topic: 'loops',
    description: 'Print the numbers 1 through 5, each on its own line.',
    examples: [
      { input: '(none)', output: '1\\n2\\n3\\n4\\n5' },
    ],
    constraints: ['Use a loop', 'One number per line'],
    starterCode: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println(i);
        }
    }
}
`,
    expectedOutput: '1\n2\n3\n4\n5',
    testCases: [
      { id: 'java-15-1', label: 'Lines 1–5', expectedOutput: '1\n2\n3\n4\n5' },
    ],
    hints: ['Use for (int i = 1; i <= 5; i++).', 'System.out.println(i) inside the loop.'],
  },
  {
    id: 'java-sum-array',
    title: 'Sum Array Values',
    language: 'java',
    difficulty: 'easy',
    topic: 'loops',
    description: 'Given `int[] nums = {1, 2, 3, 4}`, print the sum of all elements.',
    examples: [
      { input: 'nums = {1,2,3,4}', output: '10' },
    ],
    constraints: ['Use the provided array', 'Print only the sum'],
    starterCode: `public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4};
        int sum = 0;
        for (int n : nums) {
            sum += n;
        }
        System.out.println(sum);
    }
}
`,
    expectedOutput: '10',
    defaultInput: 'nums = {1,2,3,4}',
    testCases: [
      { id: 'java-sum-1', label: 'Sum 1+2+3+4', expectedOutput: '10' },
    ],
    hints: ['Loop with for (int n : nums).', 'Add each n to sum, then println(sum).'],
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
    starterCode: `export default function App() {
  return (
    <button style={{ padding: '8px 16px', borderRadius: 8, background: '#0ea5e9', color: '#fff', border: 'none' }}>
      Click me
    </button>
  );
}

console.log("Click me");
`,
    expectedOutput: 'Click me',
    testCases: [
      { id: 'react-btn-1', label: 'Button label', expectedOutput: 'Click me' },
    ],
    hints: ['Edit the button label and watch the Sandpack preview update.', 'console.log still powers Run/Submit checks.'],
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
    starterCode: `export default function App() {
  return (
    <div style={{ border: '1px solid #334155', borderRadius: 8, padding: 16, maxWidth: 280 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Welcome</h2>
      <p style={{ margin: 0, color: '#64748b' }}>Start coding</p>
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
    hints: ['Style the card in JSX and preview it live on the right.', 'console.log lines support Run/Submit.'],
  },
  {
    id: 'react-counter',
    title: 'Create a Counter',
    language: 'react',
    difficulty: 'medium',
    topic: 'state',
    description: 'Create a counter that starts at 0. Use `useState` so the preview updates when you click +1.',
    examples: [
      { input: '(initial)', output: 'Count: 0' },
    ],
    constraints: ['Initial count is 0', 'Label format: `Count: N`'],
    starterCode: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

console.log("Count: 0");
`,
    expectedOutput: 'Count: 0',
    testCases: [
      { id: 'react-ctr-1', label: 'Initial count', expectedOutput: 'Count: 0' },
    ],
    hints: ['Click +1 in the Sandpack preview to test state.', 'Initial Run/Submit still checks console output.'],
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
