/**
 * Extractor API – calls the backend /analyzer/extract-data endpoint.
 *
 * Returns the deterministically formatted FinalStructuredResume JSON.
 * No AI or LLM calls are involved.
 */

import { API_BASE } from './client';

// ── Backend response types ──────────────────────────────────────────

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
}

export interface FinalStructuredResume {
  contact_info: string;
  summary: string;
  skills: string[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  education: ExperienceEntry[];
}

// ── API call ────────────────────────────────────────────────────────

/**
 * Upload a resume file and receive a structured JSON representation.
 *
 * @param file - A PDF or DOCX `File` from an `<input>` or drag-and-drop.
 * @returns Parsed & deterministically formatted resume data.
 */
export async function extractResumeData(file: File): Promise<FinalStructuredResume> {
  const form = new FormData();
  form.append('resume', file);

  const res = await fetch(`${API_BASE}/analyzer/extract-data`, {
    method: 'POST',
    body: form,
    // Let the browser set the multipart boundary automatically —
    // do NOT set Content-Type manually.
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Extract failed (${res.status}): ${detail}`);
  }

  return res.json() as Promise<FinalStructuredResume>;
}
