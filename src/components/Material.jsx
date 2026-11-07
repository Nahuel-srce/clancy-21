import { useState } from "react";
import { SONGS, pad } from "../data.js";

function Slot({ label, accept, has, onFile, onClear }) {
  return (
    <span className={`slot ${has ? "ok" : ""}`}>
      <label>
        {label}
        {has ? " ✓" : " +"}
        <input
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {has && (
        <button onClick={onClear} aria-label="quitar">
          ×
        </button>
      )}
    </span>
  );
}

export default function Material({
  media,
  onImport,
  onAssign,
  onClear,
  onStart,
  onClose,
}) {
  const [msg, setMsg] = useState("");
  const bulk = (e) => {
    const f = [...e.target.files],
      bad = onImport(f);
    setMsg(
      `${f.length - bad} ARCHIVOS ASIGNADOS${bad ? ` // ${bad} SIN ASIGNAR: revisá el nombre` : ""}`,
    );
    e.target.value = "";
  };
  return (
    <div className="panel">
      <div className="pn">
        <header>
          <h2>MATERIAL</h2>
          <button onClick={onClose}>CERRAR ×</button>
        </header>
        <p className="mono"></p>
        <label className="bulk">
          IMPORTAR VIDEOS
          <input
            type="file"
            multiple
            hidden
            accept="video/*,audio/*,image/*"
            onChange={bulk}
          />
        </label>
        <p className="mono dim"></p>
        {msg && <p className="mono msg">{msg}</p>}
        <ul>
          {SONGS.map((s, i) => {
            const n = i + 1,
              mem = media.memory[n] || [];
            return (
              <li key={s}>
                <em>{pad(n)}</em>
                <strong>{s}</strong>
                <Slot
                  label="VIDEO (MP4)"
                  accept="video/*,audio/*"
                  has={!!media.clip[n]}
                  onFile={(f) => onAssign("clip", n, f)}
                  onClear={() => onClear("clip", n)}
                />
                <label className="st">
                  INICIO{" "}
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={media.start[n] ?? ""}
                    onChange={(e) => onStart(n, e.target.value)}
                  />{" "}
                  s
                </label>
                <Slot
                  label={`RECUERDO ${mem.length}/2`}
                  accept="image/*,video/*"
                  has={mem.length > 0}
                  onFile={(f) => onAssign("memory", n, f)}
                  onClear={() => onClear("memory", n)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
