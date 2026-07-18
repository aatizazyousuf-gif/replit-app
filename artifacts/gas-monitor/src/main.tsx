import { createRoot } from 'react-dom/client';
//import { setBaseUrl } from '@workspace/api-client-react';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { Preferences } from '@capacitor/preferences';

import App from './App';

import './index.css';

// When running inside the packaged Android app (Capacitor), relative "/api/..."
// requests have no server to resolve against. Point them at a deployed backend
// via the VITE_API_BASE_URL build-time variable (set as a GitHub Actions
// variable/secret). When unset (e.g. normal web deploy), requests stay
// relative and behave exactly as before.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}
setAuthTokenGetter(async () => {
  const { value } = await Preferences.get({ key: 'authToken' });
  return value ?? null;
});
createRoot(document.getElementById('root')!).render(<App />);
