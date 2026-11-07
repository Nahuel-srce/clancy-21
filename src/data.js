export const SONGS = ['Overcompensate','Next Semester','Backslide','Midwest Indigo','Routines in the Night','Vignette','The Craving','Lavish','Navigating','Snap Back','Oldies Station','At the Risk of Feeling Dumb','Paladin Strait'];
export const SONG_SEC = 20;
export const pad = n => String(n).padStart(2, '0');
const KINDS = { audio:'clip', clip:'clip', video:'clip', recuerdo:'memory', memoria:'memory', memory:'memory', foto:'memory' };
// "03-audio.mp3", "03-clip.mp4", "03-recuerdo.jpg", "03-recuerdo-2.mp4"
export function parseName(name) {
  const m = /^(\d{1,2})\D*?(audio|clip|video|recuerdo|memoria|memory|foto)/i.exec(name);
  if (!m) return null;
  const n = +m[1];
  return n >= 1 && n <= SONGS.length ? { n, kind: KINDS[m[2].toLowerCase()] } : null;
}
