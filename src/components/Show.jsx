import { useEffect, useRef, useState } from "react";
import { SONGS, SONG_SEC, pad } from "../data.js";
import { useTicker } from "../hooks.js";
import { Clip } from "./Ui.jsx";
import { Media } from "./Media.jsx";

const POS = ["l", "c", "r"];

export default function Show({
  media,
  cover,
  paused,
  muted,
  armed = true,
  onDone,
}) {
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const q = useRef({ i: 0, t: 0, done: false, vk: -1 });
  const refs = useRef({});
  const n = idx + 1,
    mems = media.memory[n] || [];

  useTicker(paused || !armed, (dt) => {
    const s = q.current;
    if (s.done) return;
    s.t += dt;
    if (s.t >= SONG_SEC) {
      if (s.i >= SONGS.length - 1) {
        s.done = true;
        onDone();
        return;
      }
      s.i++;
      s.t = 0;
      s.vk = -1;
      setIdx(s.i);
    }
    // fade de volumen del video de la canción actual (entrada 0,5 s / salida 1,5 s)
    const v = Math.max(0, Math.min(1, s.t / 0.5, (SONG_SEC - s.t) / 1.5)),
      kk = Math.round(v * 20);
    if (kk !== s.vk) {
      s.vk = kk;
      const m = refs.current[s.i + 1];
      if (m) m.vol(v);
    }
    setT(Math.round(s.t * 10) / 10);
  });

  const k = Math.floor((t - 2) / 7),
    mem = k >= 0 && k < mems.length && t - 2 - k * 7 < 6.5 ? mems[k] : null;
  const pos = POS[idx % 3];
  return (
    <div className={`show ${t > SONG_SEC - 1.1 ? "out" : ""}`} data-pos={pos}>
      <div className="bg" key={idx}>
        <div
          className="fb"
          style={{
            "--hue": `${((idx * 23) % 40) - 15}deg`,
            "--sx": `${(idx * 17) % 50}%`,
          }}
        >
          {cover && (
            <img src={cover} alt="" onError={(e) => e.currentTarget.remove()} />
          )}
        </div>
        <div className="bgn">{pad(n)}</div>
      </div>
      <div className="reel">
        {[n, n + 1]
          .filter((k) => k <= SONGS.length)
          .map((k) => {
            const url = media.clip[k];
            return (
              url && (
                <Media
                  key={`${k}-${url}`}
                  ref={(el) => {
                    refs.current[k] = el;
                  }}
                  url={url}
                  start={media.start[k] || 0}
                  active={armed && k === n}
                  muted={muted}
                  paused={paused || !armed}
                />
              )
            );
          })}
      </div>
      <div className="tint" />
      {mem && (
        <figure className={`mem m${(idx + k) % 2}`} key={`${n}-${k}`}>
          <div className="frame">
            {mem.type.startsWith("video") ? (
              <Clip src={mem.url} muted paused={paused} />
            ) : (
              <img src={mem.url} alt="" />
            )}
            <b className="tint" />
          </div>
          <i className="tape" />
          <figcaption>
            EVIDENCE {pad(n)}-{"AB"[k]} <span>● REC</span>
          </figcaption>
        </figure>
      )}
      <div className="hud">
        <span>
          FILE {pad(n)}/{SONGS.length}
        </span>
        <b>● REC</b>
      </div>
      <div className="cap" key={`c${idx}`}>
        <h2 className="title gl" data-t={SONGS[idx]}>
          {SONGS[idx]}
        </h2>
        <p className="sub">CANCIÓN {pad(n)} // CLANCY</p>
      </div>
      <div className="bar">
        {SONGS.map((_, i) => (
          <i
            key={i}
            className={i < idx ? "d" : i === idx ? "c" : ""}
            style={i === idx ? { "--p": t / SONG_SEC } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
