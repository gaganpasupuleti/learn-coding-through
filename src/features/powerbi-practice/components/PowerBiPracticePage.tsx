import { useCallback, useEffect, useState } from 'react'
import { DAX_PRACTICE_ROUTE, POWERBI_PRACTICE_ROUTE } from '../types/powerbiPractice.types'
import { DaxPracticePage } from './DaxPracticePage'
import { PowerBiLandingPage } from './PowerBiLandingPage'

function readPowerBiSubRoute(): 'landing' | 'dax' {
  if (typeof window === 'undefined') return 'landing'
  return window.location.pathname === DAX_PRACTICE_ROUTE ? 'dax' : 'landing'
}

/**
 * Entry point for /practice/powerbi and sub-routes.
 */
export function PowerBiPracticePage() {
  const [subRoute, setSubRoute] = useState<'landing' | 'dax'>(() => readPowerBiSubRoute())

  useEffect(() => {
    setSubRoute(readPowerBiSubRoute())
  }, [])

  const openDaxPractice = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', DAX_PRACTICE_ROUTE)
    }
    setSubRoute('dax')
  }, [])

  const openLanding = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', POWERBI_PRACTICE_ROUTE)
    }
    setSubRoute('landing')
  }, [])

  if (subRoute === 'dax') {
    return <DaxPracticePage onBackToLanding={openLanding} />
  }

  return <PowerBiLandingPage onOpenDaxPractice={openDaxPractice} />
}
