import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export const isNativeApp = (): boolean => { try { return Capacitor.isNativePlatform(); } catch { return false; } };

export interface LifecycleHandlers {
  /** Return true if the back action was handled by the UI; false = exit the app (native) / ignore (web). */
  onBack: () => boolean;
  onBackground: () => void;
  onForeground: () => void;
}

/**
 * Wires Android back button + app lifecycle (Capacitor) and the browser's visibility API.
 * Returns a cleanup function that removes every listener.
 */
export function subscribeLifecycle(h: LifecycleHandlers): () => void {
  const cleanups: Array<() => void> = [];
  let hidden = typeof document !== 'undefined' && document.hidden;

  const vis = () => {
    const nowHidden = document.hidden;
    if (nowHidden === hidden) return;
    hidden = nowHidden;
    nowHidden ? h.onBackground() : h.onForeground();
  };
  document.addEventListener('visibilitychange', vis);
  cleanups.push(() => document.removeEventListener('visibilitychange', vis));

  if (isNativeApp()) {
    let disposed = false;
    const add = (p: Promise<{ remove: () => Promise<void> }>) => p.then((handle) => {
      if (disposed) void handle.remove(); else cleanups.push(() => { void handle.remove(); });
    }).catch(() => undefined);

    add(App.addListener('backButton', () => { if (!h.onBack()) void App.exitApp(); }));
    add(App.addListener('appStateChange', ({ isActive }) => {
      if (isActive === !hidden) return;
      hidden = !isActive;
      isActive ? h.onForeground() : h.onBackground();
    }));
    cleanups.push(() => { disposed = true; });
  }
  return () => cleanups.splice(0).forEach((c) => c());
}

export function exitApp() { if (isNativeApp()) void App.exitApp(); }
