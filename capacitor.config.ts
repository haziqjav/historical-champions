import type { CapacitorConfig } from '@capacitor/cli';

/**
 * appId is the Google Play package name. It is PERMANENT once you upload to Play:
 * decide it before the first upload (reverse-domain of something you own).
 * If you change it, also change `namespace`/`applicationId` in android/app/build.gradle
 * and move MainActivity's package folder (or delete android/ and re-run `npx cap add android`).
 */
const config: CapacitorConfig = {
  appId: 'com.haziqjav.historicalchampions',
  appName: 'Historical Champions',
  webDir: 'dist',
  backgroundColor: '#000000',
  android: {
    // Never allow mixed content / debugging in shipped builds.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    // Capacitor 8 built-in SystemBars plugin: hide status + navigation bars (immersive game mode) and
    // expose cutout/safe-area insets to CSS (see --safe-area-inset-* handling in index.css).
    SystemBars: { hidden: true, style: 'DARK', insetsHandling: 'css', initialViewportFitValueHint: 'cover' },
  },
};

export default config;
