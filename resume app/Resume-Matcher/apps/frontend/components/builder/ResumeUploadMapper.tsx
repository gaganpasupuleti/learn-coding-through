'use client';

import React, { useRef, useState, useCallback } from 'react';
import { extractResumeData, type FinalStructuredResume } from '@/lib/api/extractor';
import type {
  ResumeData,
  PersonalInfo,
  Experience,
  Education,
  Project,
  AdditionalInfo,
} from '@/components/dashboard/resume-component';
import { Button } from '@/components/ui/button';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

// ── Mapper helpers ──────────────────────────────────────────────────

function parseContactInfo(raw: string): PersonalInfo {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const info: PersonalInfo = {};

  // First line is usually the name
  if (lines[0]) info.name = lines[0];
  // Second line is usually the title
  if (lines[1]) info.title = lines[1];

  // Scan remaining lines for known patterns
  const rest = lines.slice(2).join(' | ');
  const emailMatch = rest.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch) info.email = emailMatch[0];
  const phoneMatch = rest.match(/\+?[\d\s()-]{7,}/);
  if (phoneMatch) info.phone = phoneMatch[0].trim();
  const locationMatch = rest.match(/(?:Hyderabad|Bangalore|Chennai|Mumbai|Delhi|INDIA|USA|UK)[\w\s,]*/i);
  if (locationMatch) info.location = locationMatch[0].trim();

  return info;
}

function mapExperience(entries: FinalStructuredResume['experience']): Experience[] {
  return entries.map((e, i) => ({
    id: i + 1,
    company: e.company || '',
    title: e.role || '',
    years: e.duration || '',
    description: e.description ? e.description.split('\n').filter(Boolean) : [],
  }));
}

function mapEducation(entries: FinalStructuredResume['education']): Education[] {
  return entries.map((e, i) => ({
    id: i + 1,
    institution: e.company || '',
    degree: e.role || '',
    years: e.duration || '',
    description: e.description || '',
  }));
}

function mapProjects(entries: FinalStructuredResume['projects']): Project[] {
  return entries.map((p, i) => ({
    id: i + 1,
    name: p.title || '',
    role: '',
    years: '',
    description: p.description ? p.description.split('\n').filter(Boolean) : [],
  }));
}

function mapAdditional(skills: string[]): AdditionalInfo {
  return {
    technicalSkills: skills,
    languages: [],
    certificationsTraining: [],
    awards: [],
  };
}

/**
 * Convert the backend's `FinalStructuredResume` into the frontend's
 * `ResumeData` shape used by the resume builder.
 */
export function toResumeData(parsed: FinalStructuredResume): ResumeData {
  return {
    personalInfo: parseContactInfo(parsed.contact_info),
    summary: parsed.summary || '',
    workExperience: mapExperience(parsed.experience),
    education: mapEducation(parsed.education),
    personalProjects: mapProjects(parsed.projects),
    additional: mapAdditional(parsed.skills),
  };
}

// ── Component ───────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ResumeUploadMapperProps {
  /** Called with the mapped ResumeData on successful extraction. */
  onImport: (data: ResumeData) => void;
}

export function ResumeUploadMapper({ onImport }: ResumeUploadMapperProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setError('Only PDF or DOCX files are supported.');
        setStatus('error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File exceeds 10 MB limit.');
        setStatus('error');
        return;
      }

      setStatus('loading');
      setError('');
      try {
        const parsed = await extractResumeData(file);
        const mapped = toResumeData(parsed);
        onImport(mapped);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Extraction failed.');
        setStatus('error');
      }
    },
    [onImport]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : status === 'error'
            ? 'border-red-400 bg-red-50'
            : status === 'success'
              ? 'border-green-500 bg-green-50'
              : 'border-slate-300 bg-white'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={onFileChange}
      />

      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="font-mono text-sm uppercase text-slate-600">
            Extracting resume data…
          </p>
        </div>
      ) : status === 'success' ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <p className="font-mono text-sm uppercase text-green-700">
            Resume imported successfully
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 rounded-none border-black"
            onClick={() => {
              setStatus('idle');
              inputRef.current?.click();
            }}
          >
            Import Another
          </Button>
        </div>
      ) : (
        <>
          {status === 'error' && (
            <div className="flex items-center gap-2 justify-center mb-3 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="font-mono text-xs">{error}</span>
            </div>
          )}
          <Button
            variant="outline"
            className="rounded-none border-black"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Existing Resume
          </Button>
          <p className="font-mono text-xs mt-2 text-slate-500 uppercase">
            or drag &amp; drop a PDF / DOCX file here
          </p>
        </>
      )}
    </div>
  );
}
