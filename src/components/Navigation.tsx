import { Button } from '@/components/ui/button'
import { House, Cube, Code } from '@phosphor-icons/react'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: 'landing' | 'projects' | 'practice') => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Cube size={20} className="text-primary-foreground" weight="bold" />
            </div>
            <span className="text-xl font-bold">CodeQuest</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={currentPage === 'landing' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('landing')}
              className={currentPage === 'landing' ? 'bg-primary' : ''}
            >
              <House size={18} className="mr-2" weight={currentPage === 'landing' ? 'fill' : 'regular'} />
              Home
            </Button>
            <Button
              variant={currentPage === 'projects' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('projects')}
              className={currentPage === 'projects' ? 'bg-primary' : ''}
            >
              <Cube size={18} className="mr-2" weight={currentPage === 'projects' ? 'fill' : 'regular'} />
              Projects
            </Button>
            <Button
              variant={currentPage === 'practice' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('practice')}
              className={currentPage === 'practice' ? 'bg-primary' : ''}
            >
              <Code size={18} className="mr-2" weight={currentPage === 'practice' ? 'fill' : 'regular'} />
              Practice
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
