import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { syncAuthFromDevHash } from './lib/auth';
import App from './App';
import './index.css';

syncAuthFromDevHash();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
