import { LandingCtaButton } from '@/components/landing/LandingCtaButton'

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Arenas', href: '#quest-arenas' },
      { label: 'Career Map', href: '#career-map' },
      { label: 'Features', href: '#features' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Home', href: '#hero', action: 'home' as const },
      { label: 'Login', href: '#', action: 'login' as const },
      { label: 'Start Your Quest', href: '#', action: 'login' as const },
    ],
  },
]

type LandingFooterProps = {
  onStartQuest: () => void
  onHome?: () => void
}

export function LandingFooter({ onStartQuest, onHome }: LandingFooterProps) {
  return (
    <footer className="landing-section-footer landing-footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="landing-footer-heading mb-4 text-2xl font-bold sm:text-3xl">
            Start your coding quest today.
          </h2>
          <LandingCtaButton size="lg" className="landing-btn-primary" onClick={onStartQuest}>
            Start Your Quest
          </LandingCtaButton>
        </div>

        <div className="mx-auto mb-12 grid max-w-xl grid-cols-2 gap-8">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="landing-footer-col-title mb-4 text-xs font-semibold uppercase tracking-widest">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const action = 'action' in link ? link.action : undefined
                  if (action === 'login') {
                    return (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={onStartQuest}
                          className="landing-footer-link text-sm transition-colors"
                        >
                          {link.label}
                        </button>
                      </li>
                    )
                  }
                  if (action === 'home') {
                    return (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={onHome}
                          className="landing-footer-link text-sm transition-colors"
                        >
                          {link.label}
                        </button>
                      </li>
                    )
                  }
                  return (
                    <li key={link.label}>
                      <a href={link.href} className="landing-footer-link text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="landing-footer-divider flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <span className="landing-footer-brand font-bold">CodeQuest</span>
          <p className="landing-footer-fine-print text-xs">
            Learn, practice, and get job-ready — guided student journey.
          </p>
        </div>
      </div>
    </footer>
  )
}
