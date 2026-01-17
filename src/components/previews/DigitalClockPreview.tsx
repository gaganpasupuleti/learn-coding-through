import { useState, useEffect } from 'react'

export function DigitalClockPreview() {
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
    <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8">
      <div className="text-center">
        <div className="text-7xl md:text-8xl font-bold tracking-tight text-primary font-mono">
          {hours}:{minutes}:{seconds}
        </div>
        <div className="mt-4 text-lg text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  )
}
