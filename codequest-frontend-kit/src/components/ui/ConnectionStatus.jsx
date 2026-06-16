import { useEffect, useState } from 'react';
import { checkApiHealth } from '../lib/api';
import { getStoredUser, isLoggedIn } from '../lib/auth';

export default function ConnectionStatus() {
  const [apiOk, setApiOk] = useState(null);
  const [legacyOk, setLegacyOk] = useState(null);
  const user = getStoredUser();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    checkApiHealth().then(setApiOk);
    fetch('http://127.0.0.1:5000/', { method: 'HEAD', mode: 'no-cors' })
      .then(() => setLegacyOk(true))
      .catch(() => setLegacyOk(false));
  }, []);

  if (apiOk === null) return null;

  return (
    <div className="rounded-card border border-slate/20 bg-cream-soft px-3 py-2 text-[12px] text-slate">
      <p>
        <strong className="text-charcoal">Backend:</strong>{' '}
        {apiOk ? 'connected' : 'not reachable — start backend on :8000'}
      </p>
      <p>
        <strong className="text-charcoal">Main app:</strong>{' '}
        {legacyOk ? 'running' : 'not running — start `npm run dev` in repo root (:5000)'}
      </p>
      <p>
        <strong className="text-charcoal">Auth:</strong>{' '}
        {loggedIn ? `signed in as ${user?.full_name || user?.email}` : 'log in via main app first (localhost:5000)'}
      </p>
    </div>
  );
}
