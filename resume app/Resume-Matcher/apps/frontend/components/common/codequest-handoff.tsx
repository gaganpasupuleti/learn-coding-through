'use client';

import { useEffect, useState } from 'react';

interface HandoffUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface HandoffPayload {
  token?: string;
  user: HandoffUser;
  returnUrl: string;
  flowMode?: ResumeFlowMode;
  issuedAt: number;
}

export type ResumeFlowMode = 'no_ai' | 'ai';

const HANDOFF_PARAM = 'cq_handoff';
const RETURN_URL_KEY = 'codequest_return_url';
const FLOW_MODE_KEY = 'codequest_resume_flow_mode';

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return decodeURIComponent(escape(atob(padded)));
}

function readHandoffPayload(): HandoffPayload | null {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const encoded = params.get(HANDOFF_PARAM);
  if (!encoded) return null;

  try {
    return JSON.parse(fromBase64Url(encoded)) as HandoffPayload;
  } catch {
    return null;
  }
}

function applyHandoff(payload: HandoffPayload): void {
  if (payload.token) {
    localStorage.setItem('career-portal-token', payload.token);
  }
  localStorage.setItem('career-portal-user', JSON.stringify(payload.user));
  localStorage.setItem(RETURN_URL_KEY, payload.returnUrl);
  if (payload.flowMode === 'no_ai' || payload.flowMode === 'ai') {
    localStorage.setItem(FLOW_MODE_KEY, payload.flowMode);
  }
}

export function getResumeFlowMode(): ResumeFlowMode {
  if (typeof window === 'undefined') return 'ai';
  const storedMode = localStorage.getItem(FLOW_MODE_KEY);
  return storedMode === 'no_ai' ? 'no_ai' : 'ai';
}

function clearHandoffFromUrl(): void {
  if (!window.location.hash) return;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

export function CodeQuestHandoff() {
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const payload = readHandoffPayload();
    if (payload) {
      applyHandoff(payload);
      setReturnUrl(payload.returnUrl || null);
      setUserName(payload.user?.full_name || 'CodeQuest user');
      clearHandoffFromUrl();
      return;
    }

    const storedReturn = localStorage.getItem(RETURN_URL_KEY);
    if (storedReturn) {
      setReturnUrl(storedReturn);
    }

    if (!localStorage.getItem(FLOW_MODE_KEY)) {
      localStorage.setItem(FLOW_MODE_KEY, 'ai');
    }
  }, []);

  if (!returnUrl) {
    return null;
  }

  return (
    <div className="border-b border-neutral-300 bg-neutral-100 px-4 py-2 text-xs text-neutral-700">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <span>
          Connected from CodeQuest{userName ? ` as ${userName}` : ''}.
        </span>
        <a className="font-medium underline" href={returnUrl}>
          Back to CodeQuest
        </a>
      </div>
    </div>
  );
}
