import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CalculatorPreview() {
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

  const calculate = (a: number, b: number, op: string): number => {
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

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['C', '0', '=', '+']
  ]

  return (
    <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-secondary/20 to-primary/10 rounded-lg p-8">
      <div className="w-full max-w-xs">
        <div className="bg-card rounded-lg shadow-xl p-6 space-y-4">
          <div className="bg-primary/5 rounded-md p-4 text-right">
            <div className="text-4xl font-mono font-bold text-primary truncate">
              {display}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((btn) => {
              const isOperation = ['+', '-', '×', '÷'].includes(btn)
              const isEquals = btn === '='
              const isClear = btn === 'C'
              
              return (
                <Button
                  key={btn}
                  onClick={() => {
                    if (btn === 'C') handleClear()
                    else if (btn === '=') handleEquals()
                    else if (isOperation) handleOperation(btn)
                    else handleNumber(btn)
                  }}
                  variant={isOperation || isEquals ? 'default' : isClear ? 'destructive' : 'secondary'}
                  className={`h-14 text-xl font-semibold ${
                    isOperation || isEquals ? 'bg-primary hover:bg-primary/90' : ''
                  } ${isClear ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                >
                  {btn}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
