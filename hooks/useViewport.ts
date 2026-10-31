import { useEffect, useState } from 'react';

export interface ViewportInfo { width: number; height: number; isPortrait: boolean; isTouch: boolean; }

const read = (): ViewportInfo => {
  const vv = window.visualViewport;
  const width = Math.round(vv?.width ?? window.innerWidth);
  const height = Math.round(vv?.height ?? window.innerHeight);
  const isTouch = (navigator.maxTouchPoints ?? 0) > 0 || (window.matchMedia?.('(pointer: coarse)').matches ?? false);
  return { width, height, isPortrait: height > width, isTouch };
};

/** Tracks window size/orientation (resize, orientationchange, visualViewport) with one rAF-coalesced update. */
export function useViewport(): ViewportInfo {
  const [vp, setVp] = useState<ViewportInfo>(read);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp((prev) => {
        const n = read();
        return prev.width === n.width && prev.height === n.height && prev.isTouch === n.isTouch ? prev : n;
      }));
    };
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return vp;
}
