import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Play, ArrowUp, ArrowDown, Trophy } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function NumberGuesserPreview() {
  const [secretNumber, setSecretNumber] = useState<number>(0)
  const [guess, setGuess] = useState<string>('')
  const [attempts, setAttempts] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [hasWon, setHasWon] = useState<boolean>(false)
  const [hint, setHint] = useState<string>('')

  const startGame = () => {
    const random = Math.floor(Math.random() * 100) + 1
    setSecretNumber(random)
    setAttempts(0)
    setGameStarted(true)
    setHasWon(false)
    setHint('')
    setGuess('')
    toast.success('Game started! Guess a number between 1 and 100.')
  }

  const makeGuess = () => {
    const guessNum = parseInt(guess)
    
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      toast.error('Enter a number between 1 and 100')
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (guessNum < secretNumber) {
      setHint('Too low! Try a higher number.')
      toast('Too low! 📉')
    } else if (guessNum > secretNumber) {
      setHint('Too high! Try a lower number.')
      toast('Too high! 📈')
    } else {
      setHasWon(true)
      setHint(`Correct! You won in ${newAttempts} attempts!`)
      toast.success('🎉 You won!')
    }

    setGuess('')
  }

  useEffect(() => {
    startGame()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Number Guessing Game</h3>
          <p className="text-sm text-muted-foreground">
            I'm thinking of a number between 1 and 100
          </p>
        </div>

        {gameStarted && !hasWon && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="px-4 py-2">
                Attempts: {attempts}
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                Range: 1-100
              </Badge>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
                min="1"
                max="100"
                onKeyDown={(e) => e.key === 'Enter' && makeGuess()}
                className="text-lg"
              />
              <Button onClick={makeGuess} size="lg">
                Guess
              </Button>
            </div>

            {hint && (
              <div className={`border-2 rounded-lg p-4 text-center ${
                hint.includes('Too low') 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}>
                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                  {hint.includes('Too low') ? (
                    <ArrowUp size={24} weight="bold" />
                  ) : (
                    <ArrowDown size={24} weight="bold" />
                  )}
                  {hint}
                </div>
              </div>
            )}
          </div>
        )}

        {hasWon && (
          <div className="space-y-4">
            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 text-center space-y-3">
              <Trophy size={48} weight="duotone" className="mx-auto text-primary" />
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">Congratulations! 🎉</div>
                <div className="text-muted-foreground">
                  You guessed the number <span className="font-bold text-foreground">{secretNumber}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  It took you <span className="font-bold text-foreground">{attempts}</span> attempts
                </div>
              </div>
              {attempts <= 5 && (
                <Badge className="bg-accent text-accent-foreground">
                  Excellent! You're a natural!
                </Badge>
              )}
              {attempts > 5 && attempts <= 10 && (
                <Badge className="bg-primary text-primary-foreground">
                  Good job!
                </Badge>
              )}
              {attempts > 10 && (
                <Badge variant="secondary">
                  You got there eventually!
                </Badge>
              )}
            </div>

            <Button 
              onClick={startGame} 
              className="w-full"
              size="lg"
            >
              <Play className="mr-2" size={18} weight="fill" />
              Play Again
            </Button>
          </div>
        )}

        {!gameStarted && (
          <Button 
            onClick={startGame} 
            className="w-full"
            size="lg"
          >
            <Play className="mr-2" size={18} weight="fill" />
            Start Game
          </Button>
        )}
      </Card>
    </div>
  )
}
