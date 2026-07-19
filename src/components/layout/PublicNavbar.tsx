import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { LandingCtaButton } from '@/components/landing/LandingCtaButton'

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Arenas', href: '#quest-arenas' },
  { label: 'Career Map', href: '#career-map' },
  { label: 'Features', href: '#features' },
]

type PublicNavbarProps = {
  onStartQuest: () => void
  onHome?: () => void
}

export function PublicNavbar({ onStartQuest, onHome }: PublicNavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="landing-nav fixed top-0 left-0 right-0 z-50">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="landing-nav-brand">CodeQuest</span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="landing-nav-link text-sm transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <LandingCtaButton size="sm" className="landing-btn-primary" onClick={onStartQuest}>
            Start Your Quest
          </LandingCtaButton>
        </div>

        <button
          type="button"
          className="landing-nav-toggle p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="landing-nav-mobile md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="landing-nav-link py-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <LandingCtaButton
                size="sm"
                className="landing-btn-primary mt-2 w-full"
                onClick={() => {
                  setOpen(false)
                  onStartQuest()
                }}
              >
                Start Your Quest
              </LandingCtaButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
