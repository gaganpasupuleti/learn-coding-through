import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  Cpu,
  FileText,
  HardDrive,
  Laptop,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Wifi,
  WifiOff,
} from 'lucide-react';

const CONNECTOR_URL = import.meta.env.VITE_CONNECTOR_URL || 'http://127.0.0.1:17891';
const CONNECTOR_TOKEN = import.meta.env.VITE_CONNECTOR_TOKEN || 'codequest-local-lab';
const DRAFT_KEY = 'codequest-local-resume-lab-draft-v1';

const demo = {
  resume: `Gagan K — Data Analyst

SUMMARY
Data analyst with experience in banking operations, workforce forecasting, SQL and Power BI.

EXPERIENCE
- Built SQL dashboards for weekly banking operations reporting.
- Automated Excel and Python reporting workflows for operational teams.
- Created Power BI KPI views for SLA, AHT and forecast variance.

SKILLS
SQL, Python, Power BI, Excel, FastAPI`,
  job: `We are hiring a Data Analyst with strong SQL, Python and Power BI experience.
The candidate should build KPI dashboards, automate recurring reporting, and communicate findings to stakeholders. AWS experience is preferred.`,
};

async function connectorFetch(path, options = {}) {
  const response = await fetch(`${CONNECTOR_URL}${path}`, {
    ...options,
    headers: {
      'X-CodeQuest-Connector-Token': CONNECTOR_TOKEN,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({ error: 'invalid_connector_response' }));
  if (!response.ok) {
    const error = new Error(payload.message || payload.error || 'Connector request failed');
    error.code = payload.error;
    throw error;
  }
  return payload;
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return 'Size unavailable';
  const units = ['B', 'KB', 'MB', 'GB'];
  let amount = value;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount.toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function statusCopy(error) {
  const messages = {
    ollama_unavailable: 'Ollama is not running on this laptop.',
    ollama_timeout: 'Ollama took too long to respond.',
    model_output_invalid: 'The model returned invalid JSON. Try a stronger model.',
    model_schema_invalid: 'The model response did not match the resume format.',
  };
  return messages[error?.code] || error?.message || 'The local connector could not complete the request.';
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [model, setModel] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [checking, setChecking] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const connected = Boolean(status?.ollama?.connected);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    setError('');
    try {
      const currentStatus = await connectorFetch('/api/v1/status');
      setStatus(currentStatus);
      if (currentStatus.ollama.connected) {
        const modelPayload = await connectorFetch('/api/v1/models');
        setModels(modelPayload.models);
        setModel((current) => current || modelPayload.models[0]?.name || '');
      } else {
        setModels([]);
        setModel('');
      }
    } catch (connectionError) {
      setStatus(null);
      setModels([]);
      setError('Connector not detected. Start the Code Quest Local AI connector and try again.');
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) {
      try {
        const draft = JSON.parse(stored);
        setResumeText(draft.resumeText || '');
        setJobDescription(draft.jobDescription || '');
        setModel(draft.model || '');
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    checkConnection();
  }, [checkConnection]);

  const readiness = useMemo(() => {
    const steps = [
      { label: 'Connector running', complete: Boolean(status?.connector) },
      { label: 'Ollama connected', complete: connected },
      { label: 'Model selected', complete: Boolean(model) },
      { label: 'Resume and job ready', complete: resumeText.trim().length >= 20 && jobDescription.trim().length >= 20 },
    ];
    return { steps, complete: steps.every((step) => step.complete) };
  }, [connected, jobDescription, model, resumeText, status]);

  function loadDemo() {
    setResumeText(demo.resume);
    setJobDescription(demo.job);
    setResult(null);
    setMeta(null);
    setError('');
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ resumeText, jobDescription, model }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setResumeText('');
    setJobDescription('');
    setResult(null);
    setMeta(null);
    setSaved(false);
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 50000) {
      setError('This connection lab accepts text files up to 50 KB.');
      return;
    }
    setResumeText(await file.text());
    setResult(null);
    setError('');
  }

  async function analyse() {
    setAnalysing(true);
    setError('');
    setResult(null);
    setMeta(null);
    try {
      const payload = await connectorFetch('/api/v1/resume/tailor', {
        method: 'POST',
        body: JSON.stringify({
          model,
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });
      setResult(payload.result);
      setMeta(payload.meta);
    } catch (analysisError) {
      setError(statusCopy(analysisError));
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Code Quest Local AI Lab home">
          <span className="brand-mark">CQ</span>
          <span>
            <strong>Local Resume Lab</strong>
            <small>Connection proof · no cloud AI</small>
          </span>
        </a>
        <div className={`connection-pill ${connected ? 'is-online' : 'is-offline'}`}>
          {checking ? <LoaderCircle className="spin" size={15} /> : connected ? <Wifi size={15} /> : <WifiOff size={15} />}
          {checking ? 'Checking laptop' : connected ? 'Local AI connected' : 'Local AI offline'}
        </div>
      </header>

      <main id="top" className="workspace">
        <section className="intro-card">
          <div>
            <span className="eyebrow"><Laptop size={14} /> Runs on this laptop</span>
            <h1>Prove the local connection before integrating Code Quest.</h1>
            <p>
              Your resume moves from this page to the loopback connector and then to Ollama.
              Nothing in this lab calls Hugging Face or the Code Quest backend.
            </p>
          </div>
          <div className="privacy-badge">
            <ShieldCheck size={28} />
            <span><strong>Local route</strong><small>Browser → Connector → Ollama</small></span>
          </div>
        </section>

        {error && (
          <div className="alert" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button>
          </div>
        )}

        <div className="main-grid">
          <section className="editor-panel" aria-labelledby="workspace-title">
            <div className="panel-heading">
              <div>
                <span className="step-number">01</span>
                <div><h2 id="workspace-title">Local resume workspace</h2><p>Paste text or open a local TXT/Markdown file.</p></div>
              </div>
              <button className="text-button" type="button" onClick={loadDemo}>Load demo</button>
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="resume">Resume text</label>
                <label className="file-button" htmlFor="resume-file"><Upload size={14} /> Open local file</label>
                <input id="resume-file" className="sr-only" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleFile} />
              </div>
              <textarea id="resume" value={resumeText} onChange={(event) => setResumeText(event.target.value)} placeholder="Paste the student's resume here…" rows={13} />
              <span className="char-count">{resumeText.length.toLocaleString()} / 50,000</span>
            </div>

            <div className="field-group">
              <label htmlFor="job-description">Job description</label>
              <textarea id="job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the target job description here…" rows={8} />
              <span className="char-count">{jobDescription.length.toLocaleString()} / 30,000</span>
            </div>

            <div className="local-actions">
              <button className="secondary-button" type="button" onClick={saveDraft}><Save size={16} /> {saved ? 'Saved locally' : 'Save draft locally'}</button>
              <button className="danger-button" type="button" onClick={clearDraft}><Trash2 size={16} /> Clear</button>
            </div>
          </section>

          <aside className="connector-panel" aria-labelledby="connector-title">
            <div className="panel-heading compact">
              <div><span className="step-number">02</span><div><h2 id="connector-title">Laptop connector</h2><p>Check every hop before generation.</p></div></div>
            </div>

            <div className="route-map" aria-label="Local connection route">
              <div><FileText size={18} /><span>Resume Lab</span></div><ChevronRight size={16} />
              <div><LockKeyhole size={18} /><span>Connector</span></div><ChevronRight size={16} />
              <div><Cpu size={18} /><span>Ollama</span></div>
            </div>

            <div className="checklist">
              {readiness.steps.map((step) => (
                <div key={step.label} className={step.complete ? 'check-item complete' : 'check-item'}>
                  {step.complete ? <CheckCircle2 size={17} /> : <CircleOff size={17} />}<span>{step.label}</span>
                </div>
              ))}
            </div>

            <button className="secondary-button full" type="button" onClick={checkConnection} disabled={checking}>
              <RefreshCw className={checking ? 'spin' : ''} size={16} /> {checking ? 'Checking…' : 'Check connection'}
            </button>

            <div className="field-group model-field">
              <label htmlFor="model">Local model</label>
              <select id="model" value={model} onChange={(event) => setModel(event.target.value)} disabled={!connected || models.length === 0}>
                {models.length === 0 && <option value="">No model detected</option>}
                {models.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              {models.find((item) => item.name === model) && (
                <small className="model-meta"><HardDrive size={13} /> {formatBytes(models.find((item) => item.name === model)?.size_bytes)} · {models.find((item) => item.name === model)?.parameter_size || 'Unknown size'}</small>
              )}
            </div>

            <button className="primary-button full" type="button" onClick={analyse} disabled={!readiness.complete || analysing}>
              {analysing ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
              {analysing ? 'Ollama is analysing…' : 'Analyse locally'}
            </button>

            <p className="local-note"><LockKeyhole size={14} /> AI generation stays on this laptop. Saving to Code Quest is not implemented in this lab.</p>
          </aside>
        </div>

        <section className="results-panel" aria-labelledby="results-title">
          <div className="panel-heading">
            <div><span className="step-number">03</span><div><h2 id="results-title">Validated local result</h2><p>Suggestions are previews and are never applied automatically.</p></div></div>
            {meta && <span className="result-meta"><Cpu size={14} /> {meta.model} · {meta.duration_ms} ms</span>}
          </div>

          {!result ? (
            <div className="empty-state"><Sparkles size={30} /><h3>No local analysis yet</h3><p>Complete the four connection checks, then run the demo through Ollama.</p></div>
          ) : (
            <div className="result-content">
              <div className="summary-row"><CheckCircle2 size={20} /><p>{result.summary}</p></div>
              <div className="keyword-grid">
                <div><span>Matched evidence</span><div className="chips">{result.matched_keywords.length ? result.matched_keywords.map((item) => <span className="chip matched" key={item}>{item}</span>) : <em>None detected</em>}</div></div>
                <div><span>Missing—not added</span><div className="chips">{result.missing_keywords.length ? result.missing_keywords.map((item) => <span className="chip missing" key={item}>{item}</span>) : <em>None</em>}</div></div>
              </div>
              <div className="suggestions">
                {result.suggestions.map((suggestion) => (
                  <article className="suggestion-card" key={suggestion.id}>
                    <div className="suggestion-top"><span className="section-chip">{suggestion.section}</span><span className={suggestion.evidence_verified ? 'evidence valid' : 'evidence invalid'}>{suggestion.evidence_verified ? <Check size={13} /> : <AlertTriangle size={13} />}{suggestion.evidence_verified ? 'Evidence verified' : 'Evidence needs review'}</span></div>
                    <div className="diff-grid"><div><span>Original</span><p>{suggestion.original}</p></div><div className="suggested"><span>Suggested preview</span><p>{suggestion.suggested}</p></div></div>
                    <p className="reason">{suggestion.reason}</p>
                  </article>
                ))}
              </div>
              {result.warnings.map((warning) => <div className="warning-row" key={warning}><AlertTriangle size={16} />{warning}</div>)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

