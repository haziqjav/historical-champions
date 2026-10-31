/// <reference types="vite/client" />
declare const __APP_VERSION__: string;
interface ImportMetaEnv {
  /** Optional URL of your Gemini proxy (server/chronicle-proxy.mjs). Never put an API key here. */
  readonly VITE_CHRONICLE_ENDPOINT?: string;
}
