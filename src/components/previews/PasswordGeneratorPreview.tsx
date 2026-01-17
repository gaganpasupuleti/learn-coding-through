import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ArrowsClockwise, Copy, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function PasswordGeneratorPreview() {
  const [password, setPassword] = useState<string>('Generate your first password!')
  const [length, setLength] = useState<number>(12)
  const [useUppercase, setUseUppercase] = useState<boolean>(true)
  const [useLowercase, setUseLowercase] = useState<boolean>(true)
  const [useDigits, setUseDigits] = useState<boolean>(true)
  const [useSymbols, setUseSymbols] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let characters = ''
    const newPassword: string[] = []

    if (useUppercase) {
      characters += uppercase
      newPassword.push(uppercase[Math.floor(Math.random() * uppercase.length)])
    }
    if (useLowercase) {
      characters += lowercase
      newPassword.push(lowercase[Math.floor(Math.random() * lowercase.length)])
    }
    if (useDigits) {
      characters += digits
      newPassword.push(digits[Math.floor(Math.random() * digits.length)])
    }
    if (useSymbols) {
      characters += symbols
      newPassword.push(symbols[Math.floor(Math.random() * symbols.length)])
    }

    if (characters.length === 0) {
      toast.error('Select at least one character type!')
      return
    }

    for (let i = newPassword.length; i < length; i++) {
      newPassword.push(characters[Math.floor(Math.random() * characters.length)])
    }

    const shuffled = newPassword.sort(() => Math.random() - 0.5)
    setPassword(shuffled.join(''))
    setCopied(false)
    toast.success('Password generated!')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-accent/10 to-secondary/20 rounded-lg p-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Password Generator</h3>
          <p className="text-sm text-muted-foreground">Create secure random passwords</p>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-3">
          <div className="font-mono text-lg break-all text-center min-h-[60px] flex items-center justify-center">
            {password}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generatePassword} 
              className="flex-1"
              size="lg"
            >
              <ArrowsClockwise className="mr-2" size={18} />
              Generate
            </Button>
            <Button 
              onClick={copyToClipboard} 
              variant="outline"
              size="lg"
              disabled={password === 'Generate your first password!'}
            >
              {copied ? (
                <CheckCircle size={18} weight="fill" />
              ) : (
                <Copy size={18} />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Password Length</Label>
              <span className="text-sm font-semibold">{length}</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              min={4}
              max={32}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={useUppercase}
                onCheckedChange={setUseUppercase}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
              <Switch
                id="lowercase"
                checked={useLowercase}
                onCheckedChange={setUseLowercase}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="digits">Numbers (0-9)</Label>
              <Switch
                id="digits"
                checked={useDigits}
                onCheckedChange={setUseDigits}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Symbols (!@#$%)</Label>
              <Switch
                id="symbols"
                checked={useSymbols}
                onCheckedChange={setUseSymbols}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
