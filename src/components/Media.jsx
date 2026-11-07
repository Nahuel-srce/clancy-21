import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export const Media = forwardRef(function Media(
  { url, start, active, muted, paused },
  ref,
) {
  const r = useRef(null);
  const [ok, setOk] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      vol: (x) => {
        if (r.current) {
          r.current.volume = Math.max(0, Math.min(1, x));
        }
      },
    }),
    [],
  );

  // Limpiar el reproductor al desmontarse.
  useEffect(() => {
    const v = r.current;

    return () => {
      if (!v) return;

      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, []);

  // Silenciar cuando no es el videoclip activo.
  useEffect(() => {
    const v = r.current;
    if (!v) return;

    v.muted = muted || !active;
  }, [muted, active]);

  // Posicionar el video en el segundo elegido.
  useEffect(() => {
    const v = r.current;

    if (!v || !active) return;

    if (v.readyState >= 1) {
      try {
        v.currentTime = start || 0;
      } catch {}
    }
  }, [active, start]);

  // Reproducir o pausar.
  useEffect(() => {
    const v = r.current;
    if (!v) return;

    if (active && !paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, paused, url]);

  const handleMetadata = (e) => {
    const v = e.currentTarget;

    setOk(v.videoWidth > 0);

    if (active) {
      try {
        v.currentTime = start || 0;
      } catch {}
    }

    if (active && !paused) {
      v.play().catch(() => {});
    }
  };

  return (
    <video
      ref={r}
      src={url}
      loop
      playsInline
      preload="auto"
      className="bgvid"
      style={{
        opacity: active && ok ? 1 : 0,
      }}
      onLoadedMetadata={handleMetadata}
    />
  );
});
