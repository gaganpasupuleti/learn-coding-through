import { Button } from '@/components/ui/button'
import { House, Cube, Code, ListChecks, MapTrifold, ShieldCheck } from '@phosphor-icons/react'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: 'landing' | 'projects' | 'practice' | 'quiz' | 'roadmapper' | 'admin') => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Cube size={20} className="text-primary-foreground" weight="bold" />
            </div>
            <span className="text-xl font-bold">CodeQuest</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
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
            <Button
              variant={currentPage === 'quiz' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('quiz')}
              className={currentPage === 'quiz' ? 'bg-primary' : ''}
            >
              <ListChecks size={18} className="mr-2" weight={currentPage === 'quiz' ? 'fill' : 'regular'} />
              Quiz
            </Button>
            <Button
              variant={currentPage === 'roadmapper' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('roadmapper')}
              className={currentPage === 'roadmapper' ? 'bg-primary' : ''}
            >
              <MapTrifold size={18} className="mr-2" weight={currentPage === 'roadmapper' ? 'fill' : 'regular'} />
              Career Mapper
            </Button>
            <Button
              variant={currentPage === 'admin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('admin')}
              className={currentPage === 'admin' ? 'bg-primary' : ''}
            >
              <ShieldCheck size={18} className="mr-2" weight={currentPage === 'admin' ? 'fill' : 'regular'} />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
