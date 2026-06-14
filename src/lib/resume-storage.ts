import {
  createEmptyResume,
  SAMPLE_RESUME,
  type ResumeData,
} from '@/components/resume/resume-demo-data'

const STORAGE_KEY = 'codequest-resume-v1'

function readRaw(): ResumeData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ResumeData
  } catch {
    return null
  }
}

export function loadResumeData(defaults?: Partial<ResumeData['personal']>): ResumeData {
  return readRaw() ?? createEmptyResume(defaults)
}

export function saveResumeData(data: ResumeData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore quota */
  }
}

export function resetResumeToSample(): ResumeData {
  saveResumeData(SAMPLE_RESUME)
  return SAMPLE_RESUME
}

export function clearResumeData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
