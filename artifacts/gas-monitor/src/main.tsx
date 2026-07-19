import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { Preferences } from '@capacitor/preferences';

import App from './App';

import './index.css';

// The packaged app talks to a remote server, so requests are cross-origin —
// browsers/WebViews won't reliably send the session cookie on those requests.
// Use a Bearer token instead: it's saved to device storage on login/register
// (see Login.tsx) and attached to every request automatically from here.
setAuthTokenGetter(async () => {
  const { value } = await Preferences.get({ key: 'authToken' });
  return value ?? null;
});

// Backend URL resolution order:
// 1. A URL the user saved themselves on the in-app Settings screen (this is
//    what lets you update the backend address - e.g. after restarting your
//    Cloudflare Tunnel - without ever rebuilding the app).
// 2. The VITE_API_BASE_URL baked in at build time (GitHub Actions variable),
//    used the very first time the app runs before any override is saved.
async function initApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const { value: savedUrl } = await Preferences.get({ key: 'apiBaseUrl' });

  if (savedUrl) {
    setBaseUrl(savedUrl);
  } else if (apiBaseUrl) {
    setBaseUrl(apiBaseUrl);
    // Seed storage so the Settings screen has something to show/edit.
    await Preferences.set({ key: 'apiBaseUrl', value: apiBaseUrl });
  }
}

initApiBaseUrl().finally(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
