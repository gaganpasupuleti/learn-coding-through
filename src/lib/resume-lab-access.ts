/** Resume Lab preview allowlist — locked for everyone else until general release. */
const RESUME_LAB_ALLOWED_EMAILS = new Set(['kundetiriya@gmail.com'])

export function canAccessResumeLab(email: string | null | undefined): boolean {
  if (!email) return false
  return RESUME_LAB_ALLOWED_EMAILS.has(email.trim().toLowerCase())
}
