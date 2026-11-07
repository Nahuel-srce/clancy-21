import { useState, useEffect, useCallback } from "react";
import Intro from "./components/Intro.jsx";
import Show from "./components/Show.jsx";
import Finale from "./components/Finale.jsx";
import Ending from "./components/Ending.jsx";
import Material from "./components/Material.jsx";
import { Fx, Controls } from "./components/Ui.jsx";
import { parseName } from "./data.js";
import {
  saveAsset,
  getAssets,
  deleteAsset,
  deleteMemoryAssets,
} from "./storage.js";

const EMPTY = { clip: {}, start: {}, memory: {} };

function readStarts() {
  try {
    return JSON.parse(localStorage.getItem("clancy21-starts") || "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const go = new URLSearchParams(location.search).get("go");

  const [stage, setStage] = useState(
    ["show", "finale", "end"].includes(go) ? go : "intro",
  );
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [panel, setPanel] = useState(false);
  const [media, setMedia] = useState({
    ...EMPTY,
    start: readStarts(),
  });
  const [cover, setCover] = useState(null);
  const [storageReady, setStorageReady] = useState(false);

  // Recuperar archivos guardados al abrir o actualizar la página.
  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const records = await getAssets();
        if (!active) return;

        const restored = {
          clip: {},
          start: readStarts(),
          memory: {},
        };

        records.forEach((record) => {
          const url = URL.createObjectURL(record.blob);

          if (record.kind === "clip") {
            restored.clip[record.n] = url;
          }

          if (record.kind === "memory") {
            if (!restored.memory[record.n]) {
              restored.memory[record.n] = [];
            }

            restored.memory[record.n][record.index] = {
              url,
              type: record.type,
            };
          }
        });

        Object.keys(restored.memory).forEach((n) => {
          restored.memory[n] = restored.memory[n].filter(Boolean);
        });

        setMedia(restored);
      } catch (error) {
        console.error("No se pudo recuperar el material:", error);
      } finally {
        if (active) setStorageReady(true);
      }
    }

    restore();

    return () => {
      active = false;
    };
  }, []);

  // Buscar la portada de Clancy.
  useEffect(() => {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 6000);

    fetch(
      "https://itunes.apple.com/search?term=twenty+one+pilots+clancy&entity=album&limit=8",
      { signal: ac.signal },
    )
      .then((response) => response.json())
      .then((json) => {
        const album = (json.results || []).find((item) =>
          /clancy/i.test(item.collectionName),
        );

        if (album) {
          setCover(album.artworkUrl100.replace("100x100", "600x600"));
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));

    return () => {
      ac.abort();
      clearTimeout(timeout);
    };
  }, []);

  // Importar varios archivos.
  const importFiles = useCallback(
    (files) => {
      if (!storageReady) return files.length;

      const sorted = [...files].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      );

      const items = sorted.map((file) => [parseName(file.name), file]);

      const used = new Set(
        items
          .filter(([result]) => result?.kind === "clip")
          .map(([result]) => result.n),
      );

      let next = 1;
      let bad = 0;

      const assignments = [];

      items.forEach(([result, file]) => {
        let r = result;

        if (!r && /^(video|audio)\//.test(file.type)) {
          while (used.has(next)) next++;

          if (next <= 13) {
            used.add(next);
            r = { n: next, kind: "clip" };
          }
        }

        if (!r) {
          bad++;
          return;
        }

        assignments.push({ ...r, file });
      });

      setMedia((current) => {
        const updated = {
          ...current,
          clip: { ...current.clip },
          memory: { ...current.memory },
        };

        assignments.forEach(({ kind, n, file }) => {
          const url = URL.createObjectURL(file);

          if (kind === "clip") {
            if (updated.clip[n]) URL.revokeObjectURL(updated.clip[n]);

            updated.clip[n] = url;

            saveAsset({
              id: `clip:${n}`,
              kind: "clip",
              n,
              blob: file,
              type: file.type,
            }).catch(console.error);
          }

          if (kind === "memory") {
            const memories = [
              ...(updated.memory[n] || []),
              { url, type: file.type },
            ].slice(-2);

            updated.memory[n] = memories;

            deleteMemoryAssets(n)
              .then(() =>
                Promise.all(
                  memories.map((memory, index) => {
                    const originalFile =
                      index === memories.length - 1 ? file : null;

                    // El archivo anterior se conserva en el estado,
                    // pero su Blob se recupera abajo desde IndexedDB.
                    return originalFile
                      ? saveAsset({
                          id: `memory:${n}:${index}`,
                          kind: "memory",
                          n,
                          index,
                          blob: originalFile,
                          type: originalFile.type,
                        })
                      : Promise.resolve();
                  }),
                ),
              )
              .catch(console.error);
          }
        });

        return updated;
      });

      return bad;
    },
    [storageReady],
  );

  // Asignar un archivo individual.
  const assign = useCallback(
    (kind, n, file) => {
      if (!storageReady) return;

      const url = URL.createObjectURL(file);

      if (kind === "clip") {
        setMedia((current) => {
          if (current.clip[n]) URL.revokeObjectURL(current.clip[n]);

          return {
            ...current,
            clip: { ...current.clip, [n]: url },
          };
        });

        saveAsset({
          id: `clip:${n}`,
          kind: "clip",
          n,
          blob: file,
          type: file.type,
        }).catch(console.error);

        return;
      }

      if (kind === "memory") {
        setMedia((current) => {
          const memories = [
            ...(current.memory[n] || []),
            { url, type: file.type },
          ].slice(-2);

          deleteMemoryAssets(n)
            .then(() =>
              Promise.all(
                memories.map((memory, index) => {
                  const isNew = memory.url === url;

                  if (!isNew) return Promise.resolve();

                  return saveAsset({
                    id: `memory:${n}:${index}`,
                    kind: "memory",
                    n,
                    index,
                    blob: file,
                    type: file.type,
                  });
                }),
              ),
            )
            .catch(console.error);

          return {
            ...current,
            memory: { ...current.memory, [n]: memories },
          };
        });
      }
    },
    [storageReady],
  );

  // Quitar un archivo.
  const clear = useCallback((kind, n) => {
    setMedia((current) => {
      if (kind === "clip") {
        if (current.clip[n]) URL.revokeObjectURL(current.clip[n]);

        deleteAsset(`clip:${n}`).catch(console.error);

        const clips = { ...current.clip };
        delete clips[n];

        return { ...current, clip: clips };
      }

      if (kind === "memory") {
        (current.memory[n] || []).forEach((item) => {
          URL.revokeObjectURL(item.url);
        });

        deleteMemoryAssets(n).catch(console.error);

        const memories = { ...current.memory };
        delete memories[n];

        return { ...current, memory: memories };
      }

      return current;
    });
  }, []);

  // Guardar el segundo de inicio.
  const setStart = useCallback((n, value) => {
    setMedia((current) => {
      const starts = { ...current.start };

      if (value === "") {
        delete starts[n];
      } else {
        starts[n] = Math.max(0, Number(value) || 0);
      }

      localStorage.setItem("clancy21-starts", JSON.stringify(starts));

      return { ...current, start: starts };
    });
  }, []);

  const hold = paused || panel;

  const start = () => {
    setPaused(false);
    setStage("show");
  };

  const replay = () => {
    setRun((r) => r + 1);
    setPaused(false);
    setStage("intro");
  };

  return (
    <div className="app">
      {(stage === "intro" || stage === "show") && (
        <Show
          key={run}
          armed={stage === "show"}
          media={media}
          cover={cover}
          paused={hold}
          muted={muted}
          onDone={() => setStage("finale")}
        />
      )}

      {stage === "intro" && <Intro cover={cover} onStart={start} />}

      {stage === "finale" && (
        <Finale paused={hold} onDone={() => setStage("end")} />
      )}

      {stage === "end" && <Ending onReplay={replay} />}

      <Fx />

      <Controls
        stage={stage}
        paused={paused}
        muted={muted}
        onPause={() => setPaused((p) => !p)}
        onMute={() => setMuted((m) => !m)}
        onMaterial={() => setPanel(true)}
      />

      {panel && (
        <Material
          media={media}
          onImport={importFiles}
          onAssign={assign}
          onClear={clear}
          onStart={setStart}
          onClose={() => setPanel(false)}
        />
      )}
    </div>
  );
}
