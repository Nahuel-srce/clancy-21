import { useEffect, useRef } from 'react';
// rAF loop that stops completely while paused
export function useTicker(paused, fn) {
  const f = useRef(fn); f.current = fn;
  useEffect(() => {
    if (paused) return;
    let raf, last = performance.now();
    const loop = now => { const dt = Math.min(0.1, (now - last) / 1000); last = now; f.current(dt); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
}
