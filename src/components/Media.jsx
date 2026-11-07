import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Un solo archivo por canción: el video y su propio audio (la música) salen del mismo mp4.
// Si el archivo es solo audio, no se muestra imagen y queda el fondo alternativo.
export const Media = forwardRef(function Media({ url, start, active, muted, paused }, ref) {
  const r = useRef(); const [ok, setOk] = useState(false);
  useImperativeHandle(ref, () => ({ vol: x => { r.current.volume = Math.max(0, Math.min(1, x)); } }), []);
  useEffect(() => { const v = r.current; return () => { v.pause(); v.removeAttribute('src'); v.load(); }; }, []);
  useEffect(() => { r.current.muted = muted || !active; }, [muted, active]);
  useEffect(() => { const v = r.current; if (active) { v.volume = 0; try { v.currentTime = start || 0; } catch {} } }, [active]);
  useEffect(() => { const v = r.current; if (active && !paused) v.play().catch(() => {}); else v.pause(); }, [active, paused]);
  return <video ref={r} src={url} loop playsInline preload="auto" className="bgvid" style={{ opacity: active && ok ? 1 : 0 }}
    onLoadedMetadata={e => setOk(e.currentTarget.videoWidth > 0)} />;
});
