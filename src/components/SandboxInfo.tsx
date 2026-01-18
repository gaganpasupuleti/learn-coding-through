import { Card } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
            <ShieldCheck size={28} weight="fill" className="text-primary" />
            Secure Sandbox Environment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} weight="bold" className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Isolated Execution</h4>
                  <p className="text-sm text-muted-foreground">
                    Code executes in isolated sandboxes that prevent access to your system
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={20} weight="bold" className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Time Limited</h4>
                  <p className="text-sm text-muted-foreground">
                    Execution automatically stops after a safe time limit
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Code size={20} weight="bold" className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Multiple Languages</h4>
                  <p className="text-sm text-muted-foreground">
                    Supports JavaScript, Python, and more
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center shrink-0">
                  <Lightning size={20} weight="bold" className="text-chart-1" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Instant Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    See results immediately as you write code
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-primary" />
              Supported Languages
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                  <strong>JavaScript:</strong> Full ES6+ support with modern features
                </p>
                <Badge variant="secondary">JS</Badge>
              </div>
              
              <div className="flex items-start gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                  <strong>Python:</strong> Python 3.x with standard library
                </p>
                <Badge variant="secondary">PY</Badge>
              </div>
              
              <div className="flex items-start gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                  <strong>SQL:</strong> Query language for database operations
                </p>
                <Badge variant="secondary">SQL</Badge>
              </div>
            </div>
          </div>
          
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-2">
              <Info size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>
                  This sandbox is designed for learning and practicing code. It 
                  allows you to learn syntax, logic, and problem-solving safely.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
