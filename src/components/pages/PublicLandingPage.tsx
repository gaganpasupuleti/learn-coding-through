import { CareerMap } from '@/components/landing/CareerMap'
import { CinematicHero } from '@/components/landing/CinematicHero'
import { FeatureStory } from '@/components/landing/FeatureStory'
import { FinalQuestCTA } from '@/components/landing/FinalQuestCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { PlatformShowcase } from '@/components/landing/PlatformShowcase'
import { QuestArenas } from '@/components/landing/QuestArenas'
import { QuestJourney } from '@/components/landing/QuestJourney'
import { SkillsTicker } from '@/components/landing/SkillsTicker'
import { PublicNavbar } from '@/components/layout/PublicNavbar'

type PublicLandingPageProps = {
  onStartQuest: () => void
}

export function PublicLandingPage({ onStartQuest }: PublicLandingPageProps) {
  const scrollHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="landing-cinematic min-h-dvh overflow-x-clip">
      <PublicNavbar onStartQuest={onStartQuest} onHome={scrollHome} />
      <main>
        <CinematicHero onStartQuest={onStartQuest} />
        <SkillsTicker />
        <QuestJourney />
        <QuestArenas />
        <CareerMap />
        <PlatformShowcase />
        <FeatureStory />
        <FinalQuestCTA onStartQuest={onStartQuest} />
      </main>
      <LandingFooter onStartQuest={onStartQuest} onHome={scrollHome} />
    </div>
  )
}
