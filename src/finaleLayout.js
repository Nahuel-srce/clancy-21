const FONT = "Impact,'Haettenschweiler','Arial Narrow Bold','Arial Black',sans-serif";
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Rasterizes "FELIZ CUMPLE / TE AMO" and returns N target points split per line, with a font size per line.
export function buildTargets(W, H, N) {
  const mob = W < 640;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d', { willReadFrequently: true });
  const main = mob ? ['FELIZ', 'CUMPLE'] : ['FELIZ CUMPLE'];
  const fit = s => { x.font = `100px ${FONT}`; return 100 * W * 0.86 / x.measureText(s).width; };
  const F = Math.min(...main.map(fit), H * (mob ? 0.2 : 0.32));
  const sub = F * (mob ? 0.6 : 0.55);
  const lines = [...main.map(s => ({ s, size: F, w: 1 })), { s: 'TE AMO', size: sub, w: 1.8 }];
  const total = main.length * F * 1.05 + F * 0.3 + sub;
  let y = H / 2 - total / 2;
  lines.forEach((l, i) => { if (i === main.length) y += F * 0.3; l.y = y + l.size / 2; y += l.size * 1.05; });
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach(l => { x.font = `${l.size}px ${FONT}`; x.fillText(l.s, W / 2, l.y); });
  const data = x.getImageData(0, 0, W, H).data;
  lines.forEach(l => {
    l.cand = [];
    for (let yy = Math.max(0, l.y - l.size * 0.6 | 0); yy < Math.min(H, l.y + l.size * 0.6); yy += 2)
      for (let xx = 0; xx < W; xx += 2) if (data[(yy * W + xx) * 4 + 3] > 128) l.cand.push([xx, yy]);
  });
  const sumW = lines.reduce((s, l) => s + l.cand.length * l.w, 0);
  let left = N;
  lines.forEach((l, i) => { l.n = i === lines.length - 1 ? left : Math.round(N * l.cand.length * l.w / sumW); left -= l.n; });
  return lines.map(l => {
    const sp = Math.sqrt(l.cand.length * 4 / Math.max(1, l.n));
    const cells = new Map();
    l.cand.forEach(c => { const k = (c[0] / sp | 0) + ',' + (c[1] / sp | 0); (cells.get(k) || cells.set(k, []).get(k)).push(c); });
    const picks = shuffle([...cells.values()].map(a => a[Math.random() * a.length | 0])).slice(0, l.n);
    for (let g = 0; picks.length < l.n && g < l.n * 20; g++) picks.push(l.cand[Math.random() * l.cand.length | 0]);
    return { fs: Math.max(11, sp * 1.9), pts: picks.map(p => ({ x: p[0], y: p[1] })) };
  });
}
export { shuffle };
