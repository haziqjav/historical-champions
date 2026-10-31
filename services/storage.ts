// localStorage can throw (private mode, quota, disabled storage, some WebViews). A game must never
// crash or show a blank screen because of that, so every access goes through these helpers.
export const safeGet = (key: string): string | null => {
  try { return typeof localStorage === 'undefined' ? null : localStorage.getItem(key); } catch { return null; }
};
export const safeSet = (key: string, value: string): boolean => {
  try { if (typeof localStorage === 'undefined') return false; localStorage.setItem(key, value); return true; } catch { return false; }
};
