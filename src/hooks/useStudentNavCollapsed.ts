import { useCallback, useEffect, useState } from 'react'

const NAV_HIDDEN_KEY = 'cq-student-nav-hidden'
const NAV_EVENT = 'cq-student-nav-hidden'

function readHidden(): boolean {
  try {
    return localStorage.getItem(NAV_HIDDEN_KEY) === '1'
  } catch {
    return false
  }
}

function writeHidden(hidden: boolean) {
  try {
    localStorage.setItem(NAV_HIDDEN_KEY, hidden ? '1' : '0')
  } catch {
    /* ponytail: localStorage optional */
  }
  window.dispatchEvent(new Event(NAV_EVENT))
}

export function useStudentNavCollapsed() {
  const [hidden, setHiddenState] = useState(readHidden)

  useEffect(() => {
    const sync = () => setHiddenState(readHidden())
    window.addEventListener(NAV_EVENT, sync)
    return () => window.removeEventListener(NAV_EVENT, sync)
  }, [])

  const setHidden = useCallback((value: boolean) => {
    writeHidden(value)
    setHiddenState(value)
  }, [])

  const toggleHidden = useCallback(() => {
    setHiddenState((prev) => {
      const next = !prev
      writeHidden(next)
      return next
    })
  }, [])

  return {
    hidden,
    /** @deprecated alias — sidebar hidden means fully collapsed off-canvas */
    collapsed: hidden,
    setHidden,
    setCollapsed: setHidden,
    toggleHidden,
    toggleCollapsed: toggleHidden,
  }
}
