import { useRef, useState } from "react";
import { SONGS, pad } from "../data.js";
import { useTicker } from "../hooks.js";

const LIST_SEC = 8;
const FLY_SEC = 24;
const OUT_SEC = 1.3;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const clamp = (v) => Math.max(0, Math.min(1, v));

const random = (a, b) => a + Math.random() * (b - a);

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function getTargets(W, H, count) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const lines = ["FELIZ CUMPLE", "TE AMO"];

  ctx.font = "900 100px Arial";

  const maxWidth = W * 0.88;

  const maxLineWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line).width),
  );

  const fontSize = Math.min(
    90,
    W * 0.095,
    H * 0.12,
    (maxWidth / maxLineWidth) * 100,
  );

  ctx.font = `900 ${fontSize}px Arial`;

  const targets = [];

  lines.forEach((line, lineIndex) => {
    const totalWidth = ctx.measureText(line).width;

    let x = (W - totalWidth) / 2;

    const y = lineIndex === 0 ? H * 0.47 : H * 0.61;

    for (const char of line) {
      const width = ctx.measureText(char).width;

      if (char !== " ") {
        targets.push({
          char,
          x: x + width / 2,
          y,
          fontSize,
        });
      }

      x += width;
    }
  });

  return targets.slice(0, count);
}

function wander(p, t) {
  const progress = ease(clamp((t - p.delay) / 4));

  return [
    p.sx + (p.wx - p.sx) * progress + Math.sin(t * p.speed + p.seed) * 12,

    p.sy + (p.wy - p.sy) * progress + Math.cos(t * p.speed * 0.8 + p.seed) * 12,
  ];
}

export default function Finale({ paused, onDone }) {
  const [phase, setPhase] = useState("list");
  const [parts, setParts] = useState([]);

  const root = useRef(null);
  const els = useRef([]);

  const S = useRef({
    t: 0,
    f: 0,
    ph: "list",
    P: [],
    done: false,
  });

  const build = () => {
    if (!root.current) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Obtener las letras originales de las canciones.
    const base = [];

    root.current.querySelectorAll(".L").forEach((el) => {
      const rect = el.getBoundingClientRect();

      base.push({
        ch: el.textContent.toUpperCase(),
        sx: rect.left + rect.width / 2,
        sy: rect.top + rect.height / 2,
        fs: parseFloat(getComputedStyle(el).fontSize),
      });
    });

    // Obtener las posiciones del mensaje final.
    const targets = getTargets(W, H, 16);

    const selected = shuffle(base).slice(0, targets.length);

    const particles = selected.map((source, i) => {
      const target = targets[i];

      return {
        ...source,

        targetChar: target.char,

        tx: target.x,
        ty: target.y,

        targetSize: target.fontSize,

        delay: random(0.2, 2.2),

        wx: random(W * 0.12, W * 0.88),
        wy: random(H * 0.15, H * 0.85),

        speed: random(0.5, 1),
        seed: random(0, 6.28),

        spin: random(-25, 25),

        convergence: random(8, 10),
        duration: 4,

        morphed: false,
      };
    });

    S.current.P = particles;
    S.current.f = 0;
    S.current.ph = "fly";

    setParts(particles);
    setPhase("fly");
  };

  useTicker(paused, (dt) => {
    const s = S.current;

    // Fase del tracklist.
    if (s.ph === "list") {
      s.t += dt;

      if (s.t >= LIST_SEC) {
        build();
      }

      return;
    }

    // Fase de salida: seguir contando aunque ya no sea fly.
    if (s.ph === "out") {
      s.f += dt;

      if (s.f >= FLY_SEC + OUT_SEC && !s.done) {
        s.done = true;
        onDone?.();
      }

      return;
    }

    if (s.ph !== "fly") return;

    const t = (s.f += dt);

    s.P.forEach((p, i) => {
      const el = els.current[i];
      if (!el) return;

      let x = p.sx;
      let y = p.sy;
      let rotation = 0;
      let scale = 1;

      if (t >= p.delay) {
        const [wx, wy] = wander(p, t);

        x = wx;
        y = wy;

        rotation = p.spin * (t - p.delay);

        if (t >= p.convergence) {
          const progress = ease(clamp((t - p.convergence) / p.duration));

          x += (p.tx - x) * progress;
          y += (p.ty - y) * progress;

          rotation *= 1 - progress;

          const targetScale = p.targetSize / p.fs;

          scale = 1 + (targetScale - 1) * progress;

          // Transformar la letra original en la letra del mensaje.
          if (progress > 0.85 && !p.morphed) {
            el.textContent = p.targetChar;
            p.morphed = true;
          }
        }
      }

      el.style.transform = `
        translate3d(${x}px, ${y}px, 0)
        translate(-50%, -50%)
        rotate(${rotation}deg)
        scale(${scale})
      `;

      el.style.opacity = "1";
    });

    // Finalizar el movimiento y comenzar la salida.
    if (t >= FLY_SEC) {
      s.ph = "out";
      setPhase("out");
    }
  });

  return (
    <div ref={root} className={`finale ${phase}`}>
      <div className="file">
        <header>
          <span>CASE FILE // CLANCY</span>
          <span>13 RECORDS RECOVERED</span>
        </header>

        <ol>
          {SONGS.map((song, i) => (
            <li key={song} style={{ "--i": i }}>
              <em>{pad(i + 1)}</em>

              <span>
                {[...song].map((char, j) =>
                  char === " " ? (
                    <i key={j} className="sp" />
                  ) : (
                    <b key={j} className="L">
                      {char}
                    </b>
                  ),
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {parts.map((p, i) => (
        <span
          key={i}
          ref={(el) => (els.current[i] = el)}
          className="P"
          style={{
            fontSize: p.fs,
            opacity: 0,
            left: 0,
            top: 0,
            transform: `
              translate3d(${p.sx}px, ${p.sy}px, 0)
              translate(-50%, -50%)
            `,
          }}
        >
          {p.ch}
        </span>
      ))}
    </div>
  );
}
