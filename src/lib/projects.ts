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
}`
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
}`
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
  }
]

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}
