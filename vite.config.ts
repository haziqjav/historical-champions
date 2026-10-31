/// <reference types="vitest/config" />
import path from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

// NOTE: No API keys are injected into the client bundle. The Gemini key lives on the
// server-side proxy only (see server/chronicle-proxy.mjs). Do not add `define` entries
// for secrets here - anything defined here is readable by every player.
export default defineConfig({
  // Relative base so the same build works from a web sub-path AND inside the Capacitor
  // WebView (https://localhost/). Absolute "/assets/..." URLs are never used.
  base: './',
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
    assetsInlineLimit: 0, // keep game art as real files (no giant base64 blobs in JS)
  },
  test: { environment: 'node', include: ['game/**/*.test.ts', 'services/**/*.test.ts'] },
});
