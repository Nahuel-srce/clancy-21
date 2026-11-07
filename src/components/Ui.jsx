import { useEffect, useRef } from 'react';

export const Fx = () => (
  <>
    <div className="fx noise" /><div className="fx scan" /><div className="fx vig" /><div className="fx roll" />
  </>
);

export function Controls({ stage, paused, muted, onPause, onMute, onMaterial }) {
  const playing = stage === 'show' || stage === 'finale';
  return (
    <div className="ctl">
      {playing && <button onClick={onPause}>{paused ? '▶ play' : '❚❚ pause'}</button>}
      {playing && <button onClick={onMute}>{muted ? 'sound off' : 'sound on'}</button>}
      <button onClick={onMaterial}>material</button>
    </div>
  );
}

// <video> that releases its media on unmount and respects pause/mute
export function Clip({ src, muted, paused, className }) {
  const r = useRef();
  useEffect(() => { const v = r.current; return () => { v.pause(); v.removeAttribute('src'); v.load(); }; }, []);
  useEffect(() => { r.current.muted = muted; }, [muted]);
  useEffect(() => { const v = r.current; if (paused) v.pause(); else v.play().catch(() => {}); }, [paused, src]);
  return <video ref={r} src={src} loop playsInline preload="auto" className={className} />;
}
