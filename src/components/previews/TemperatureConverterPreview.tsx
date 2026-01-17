import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowRight } from '@phosphor-icons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TemperatureConverterPreview() {
  const [temperature, setTemperature] = useState<string>('25')
  const [fromScale, setFromScale] = useState<string>('C')
  const [toScale, setToScale] = useState<string>('F')
  const [result, setResult] = useState<number | null>(null)

  const convertTemperature = () => {
    const temp = parseFloat(temperature)
    if (isNaN(temp)) return

    let celsius: number
    if (fromScale === 'F') {
      celsius = (temp - 32) * 5/9
    } else if (fromScale === 'K') {
      celsius = temp - 273.15
    } else {
      celsius = temp
    }

    let converted: number
    if (toScale === 'F') {
      converted = (celsius * 9/5) + 32
    } else if (toScale === 'K') {
      converted = celsius + 273.15
    } else {
      converted = celsius
    }

    setResult(Math.round(converted * 100) / 100)
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-secondary/20 to-primary/10 rounded-lg p-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Temperature Converter</h3>
          <p className="text-sm text-muted-foreground">Convert between Celsius, Fahrenheit, and Kelvin</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temp-input">Temperature Value</Label>
            <Input
              id="temp-input"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="Enter temperature"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromScale} onValueChange={setFromScale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">Celsius (°C)</SelectItem>
                  <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                  <SelectItem value="K">Kelvin (K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toScale} onValueChange={setToScale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">Celsius (°C)</SelectItem>
                  <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                  <SelectItem value="K">Kelvin (K)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={convertTemperature} 
            className="w-full"
            size="lg"
          >
            Convert
            <ArrowRight className="ml-2" size={18} />
          </Button>

          {result !== null && (
            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {result}°{toScale === 'K' ? 'K' : toScale}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {temperature}°{fromScale === 'K' ? 'K' : fromScale} equals {result}°{toScale === 'K' ? 'K' : toScale}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
