import { useEffect, useState } from 'react';
import { checkApiHealth, fetchCurrentUser } from '../../lib/api';
import { getAuthDisplayName, getAuthToken, getStoredUser, hasAuth } from '../../lib/auth';

function authStatusMessage(authState, displayName) {
  switch (authState) {
    case 'authenticated':
      return `signed in as ${displayName}`;
    case 'missing':
      return 'auth required — sign in via main app (localhost:5000), then reopen sandbox';
    case 'expired':
      return 'session expired — sign in again via main app';
    case 'invalid-user':
      return 'stored user profile was invalid and was cleared — sign in again via main app';
    case 'unavailable':
      return 'auth could not be verified — backend unreachable or token rejected';
    default:
      return 'checking auth…';
  }
}

export default function ConnectionStatus() {
  const [apiOk, setApiOk] = useState(null);
  const [legacyOk, setLegacyOk] = useState(null);
  const [authState, setAuthState] = useState('checking');
  const [displayName, setDisplayName] = useState(() => getAuthDisplayName());

  useEffect(() => {
    checkApiHealth().then(setApiOk);
    fetch('http://127.0.0.1:5000/', { method: 'HEAD', mode: 'no-cors' })
      .then(() => setLegacyOk(true))
      .catch(() => setLegacyOk(false));
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    const cachedUser = getStoredUser();

    if (!token) {
      setAuthState('missing');
      setDisplayName(null);
      return;
    }

    if (!cachedUser) {
      setAuthState('invalid-user');
      setDisplayName(null);
      return;
    }

    setDisplayName(getAuthDisplayName());

    fetchCurrentUser()
      .then((user) => {
        setAuthState('authenticated');
        setDisplayName(user?.full_name || user?.email || getAuthDisplayName());
      })
      .catch((error) => {
        if (error.authMissing) {
          setAuthState('missing');
        } else if (error.authExpired) {
          setAuthState('expired');
        } else if (error.networkError || !hasAuth()) {
          setAuthState('unavailable');
        } else {
          setAuthState('unavailable');
        }
        setDisplayName(getAuthDisplayName());
      });
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
        {authStatusMessage(authState, displayName)}
      </p>
    </div>
  );
}
