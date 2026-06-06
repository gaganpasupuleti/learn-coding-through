export type AuthPreviewVariant = 'planner' | 'journey' | 'jobs'

export interface AuthPromoSlide {
  id: string
  headline: string
  subtext: string
  variant: AuthPreviewVariant
}

export const AUTH_PROMO_SLIDES: AuthPromoSlide[] = [
  {
    id: 'planner',
    headline: 'Plan your learning day',
    subtext: 'Calendar-driven objectives, timeline, and daily focus.',
    variant: 'planner',
  },
  {
    id: 'journey',
    headline: 'Track your career progress',
    subtext: 'Syllabus journey, stages, and completion at a glance.',
    variant: 'journey',
  },
  {
    id: 'jobs',
    headline: 'Prepare for your next role',
    subtext: 'Job readiness scores and matched openings.',
    variant: 'jobs',
  },
]

export const AUTH_CAROUSEL_INTERVAL_MS = 5000
