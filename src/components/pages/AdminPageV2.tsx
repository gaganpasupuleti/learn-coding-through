import { Sparkle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AdminPage } from '@/components/pages/AdminPage'

export function AdminPageV2() {
  return (
    <div data-v2-page="admin" className="min-h-screen bg-gradient-to-b from-background to-secondary/15">
      <div className="container mx-auto px-6 pt-8">
        <Card className="border-border/60 bg-card/90 backdrop-blur">
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin V2</p>
              <p className="text-sm text-muted-foreground">Executive dashboard styling with V2 palette continuity.</p>
            </div>
            <Badge className="rounded-full px-3 py-1"><Sparkle size={12} className="mr-1" weight="fill" />Operations</Badge>
          </CardContent>
        </Card>
      </div>
      <AdminPage />
    </div>
  )
}
