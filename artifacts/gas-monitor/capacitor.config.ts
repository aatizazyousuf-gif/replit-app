import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Change this to your own reverse-domain package name before you publish
  // (e.g. com.yourcompany.gasmonitor). Renaming it later requires Android
  // Studio's "Refactor > Rename Package" step, so pick it once now.
  appId: 'com.smartgasmonitor.app',
  appName: 'Gas Monitor',
  webDir: 'dist/public',
};

export default config;
