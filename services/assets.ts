// Image loading with caching + decode, so combat never starts with half-loaded art and
// the app never decodes everything at once on a low-memory phone.
const cache = new Map<string, Promise<HTMLImageElement>>();

const loadOnce = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // decode() makes the first draw smooth; ignore failures (older WebViews)
      (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()).then(() => resolve(img));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

export function loadImage(url: string): Promise<HTMLImageElement> {
  let p = cache.get(url);
  if (!p) {
    p = loadOnce(url).catch(async (e) => {
      await new Promise((r) => setTimeout(r, 300)); // one retry (transient WebView hiccup)
      return loadOnce(url).catch(() => { cache.delete(url); throw e; });
    });
    cache.set(url, p);
  }
  return p;
}

export interface PreloadResult { loaded: number; failed: string[]; }

export async function preloadImages(urls: string[], onProgress?: (done: number, total: number) => void): Promise<PreloadResult> {
  const unique = [...new Set(urls)];
  let done = 0;
  const failed: string[] = [];
  await Promise.all(unique.map((u) =>
    loadImage(u).catch(() => { failed.push(u); }).finally(() => { done++; onProgress?.(done, unique.length); })));
  return { loaded: unique.length - failed.length, failed };
}

/** Drop cached decoded images that are not needed any more (battle sprites after a fight). */
export function releaseImages(urls: string[]) { urls.forEach((u) => cache.delete(u)); }
