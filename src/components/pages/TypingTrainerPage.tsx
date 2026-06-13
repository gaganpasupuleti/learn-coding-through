import { TypingPracticePage } from '@/features/typing-practice/components/TypingPracticePage'

interface TypingTrainerPageProps {
  embedded?: boolean
}

/** Legacy route wrapper — Phase 15 typing upgrade lives in features/typing-practice. */
export function TypingTrainerPage({ embedded = false }: TypingTrainerPageProps = {}) {
  return <TypingPracticePage embedded={embedded} />
}
