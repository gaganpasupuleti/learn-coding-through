import { ArrowRight, Zap, Code2, Trophy } from 'lucide-react'
import { LearningPathsShowcase } from '@/components/home/LearningPathsShowcase'

interface LandingPageProps {
  onNavigate: (page: 'projects' | 'practice' | 'quiz' | 'roadmapper') => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">

        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Career Acceleration Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Go from student to{' '}
            <span className="text-blue-600">job-ready engineer</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            See career paths, choose your target role, build skills through hands-on projects and practice, and track your progress to job readiness.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('roadmapper')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Start Career Mapping
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Explore Projects
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Zap size={22} className="text-blue-600" strokeWidth={2} />,
              iconBg: 'bg-blue-50',
              title: 'Role-Focused Roadmaps',
              description:
                'Each role shows required skills, salary range, hiring companies, difficulty, and expected timeline to job-ready.',
            },
            {
              icon: <Code2 size={22} className="text-violet-600" strokeWidth={2} />,
              iconBg: 'bg-violet-50',
              title: 'Stage Lock System',
              description:
                'Progression is gated by quiz completion. Unlock the next stage only after proving you understand the current one.',
            },
            {
              icon: <Trophy size={22} className="text-emerald-600" strokeWidth={2} />,
              iconBg: 'bg-emerald-50',
              title: 'Job Selection Readiness',
              description:
                'Blend coding exercises, guided projects, and final interview prep into one cohesive, measurable flow.',
            },
          ].map(({ icon, iconBg, title, description }) => (
            <div
              key={title}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
                {icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <p className="mt-16 text-center text-xs text-slate-400 tracking-wide">
          Quiz-gated stage progression · Job-focused learning · Build-to-selection flow
        </p>
      </div>

      {/* Curated Learning Paths */}
      <LearningPathsShowcase />
    </div>
  )
}
