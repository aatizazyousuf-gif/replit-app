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

// Backend URL resolution:
// 1. Apply the VITE_API_BASE_URL build-time default immediately and
//    synchronously - this must never be blocked by a native plugin call,
//    since Capacitor plugins aren't guaranteed ready this early in boot.
// 2. Then, once Preferences is available, check for a URL the user saved
//    themselves on the in-app Settings screen and use that instead if
//    present. This lets you update the backend address (e.g. after
//    restarting your Cloudflare Tunnel) without ever rebuilding the app -
//    but it's applied as a non-blocking overlay, not a boot dependency.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById('root')!).render(<App />);

Preferences.get({ key: 'apiBaseUrl' })
  .then(({ value: savedUrl }) => {
    if (savedUrl) {
      setBaseUrl(savedUrl);
    } else if (apiBaseUrl) {
      // Seed storage so the Settings screen has something to show/edit.
      Preferences.set({ key: 'apiBaseUrl', value: apiBaseUrl });
    }
  })
  .catch(() => {
    // If Preferences isn't available for some reason, we've already
    // applied the build-time default above, so the app still works.
  });
