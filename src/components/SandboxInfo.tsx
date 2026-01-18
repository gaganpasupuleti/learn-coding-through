import { Card } from '@/components/ui/card'
import { 
import { 
  ShieldCheck, 
  Clock, 
  Code, 
  Lightning,
  CheckCircle,
import
  DialogContent,
  Dialog
  DialogT
import { Button 
export function Sand
    <Dialog>
        <Butto
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
            <Card className="p-4 border-2">
                <div className="w-10 h-10 b
                </div>
              </div>
                Code executes in isolated sandboxes that pre
            </Card>
            <Card class
        
                </div>
              </div>
                Execution automatically sto
            </Card>
            <Card className="p-4 border-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-cente
                </div>
              </div>
                Java
            </Card>
            <Card className="p-4 border-2">
                <d
                </d

                Supports JavaScript, Python
            </Card>

            <h3 className="font-semibold flex items-center gap-2">
              Supporte
            
              <div c
                <p className="text-sm text-muted-foreground flex-1">
                </p>
              
                <Ba

              </div>
              <div className="flex items-start gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                </p>
              
                <Badge variant="secondary">SQL</Badge>
                  SE
              </div>
          </div>
          <Card cl
              <Info

                  This sandbox is designed 
                  allows you to learn syntax, logic, and pro
              </div>
          </Card>
      </DialogContent>
  )






























































