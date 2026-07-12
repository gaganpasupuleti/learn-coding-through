import { useCallback, useEffect, useState } from 'react'

const NAV_COLLAPSED_KEY = 'cq-student-nav-collapsed'
const NAV_EVENT = 'cq-student-nav-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(NAV_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(NAV_COLLAPSED_KEY, collapsed ? '1' : '0')
  } catch {
    /* ponytail: localStorage optional */
  }
  window.dispatchEvent(new Event(NAV_EVENT))
}

export function useStudentNavCollapsed() {
  const [collapsed, setCollapsedState] = useState(readCollapsed)

  useEffect(() => {
    const sync = () => setCollapsedState(readCollapsed())
    window.addEventListener(NAV_EVENT, sync)
    return () => window.removeEventListener(NAV_EVENT, sync)
  }, [])

  const setCollapsed = useCallback((value: boolean) => {
    writeCollapsed(value)
    setCollapsedState(value)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev
      writeCollapsed(next)
      return next
    })
  }, [])

  return { collapsed, setCollapsed, toggleCollapsed }
}
