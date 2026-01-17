import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldCheck, 
  Clock, 
  Code, 
  Lightning,
  CheckCircle,
  Info
} from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function SandboxInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Info size={16} />
          Sandbox Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck size={28} weight="duotone" className="text-primary" />
            Sandboxed Execution Environment
          </DialogTitle>
          <DialogDescription>
            Your code runs in a secure, isolated environment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={20} weight="duotone" className="text-primary" />
                </div>
                <h3 className="font-semibold">Secure Isolation</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Code executes in isolated sandboxes that prevent access to your system, files, and network.
              </p>
            </Card>

            <Card className="p-4 border-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock size={20} weight="duotone" className="text-accent" />
                </div>
                <h3 className="font-semibold">Time Limits</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Execution automatically stops after 5 seconds to prevent infinite loops and hangs.
              </p>
            </Card>

            <Card className="p-4 border-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Lightning size={20} weight="duotone" className="text-secondary" />
                </div>
                <h3 className="font-semibold">Real Execution</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                JavaScript runs natively. Python, Java, and SQL are intelligently simulated for learning.
              </p>
            </Card>

            <Card className="p-4 border-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code size={20} weight="duotone" className="text-primary" />
                </div>
                <h3 className="font-semibold">Multi-Language</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Supports JavaScript, Python, Java, and SQL with language-specific features.
              </p>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle size={20} weight="duotone" className="text-primary" />
              Supported Features
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-2">
                <Badge variant="secondary">JavaScript</Badge>
                <p className="text-sm text-muted-foreground flex-1">
                  Full native execution with console output, functions, loops, arrays, objects, and async operations
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Badge variant="secondary">Python</Badge>
                <p className="text-sm text-muted-foreground flex-1">
                  Print statements, variables, basic math, string operations, and function definitions
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Badge variant="secondary">Java</Badge>
                <p className="text-sm text-muted-foreground flex-1">
                  System.out.println, variables, methods, Scanner simulation, Random number generation
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Badge variant="secondary">SQL</Badge>
                <p className="text-sm text-muted-foreground flex-1">
                  SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, and JOIN operations
                </p>
              </div>
            </div>
          </div>

          <Card className="bg-muted/50 border-2 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Learning Environment</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This sandbox is designed for education. Some language features are simulated to provide
                  immediate feedback without requiring server-side compilers or interpreters. This approach
                  allows you to learn syntax, logic, and programming concepts safely in your browser.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
