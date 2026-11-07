# Twenty One Years // 21

Sorpresa interactiva (React + Vite), estética *Clancy*. Presentación de ~4,3 min (13 canciones × 20 s) + tracklist + animación de letras + pantalla final.

## Instalar y ejecutar
```bash
npm install
npm run dev        # desarrollo (también accesible desde el celular en la misma red)
npm run build      # genera dist/ para publicar
npm run preview    # prueba la versión compilada
```

## Cargar tu material (botón `MATERIAL`, arriba a la derecha)
**Un solo archivo por canción: el mp4.** El video y la música salen del mismo archivo.
- "Importar videos": elegí los 13 mp4 juntos. Si no tienen número, se asignan en orden alfabético a las canciones 1 a 13; si se llaman `05-clip.mp4`, van directo a la canción 5. También se puede cargar uno por fila.
- **INICIO (s)**: segundo desde el que arranca el fragmento de cada canción (dura 20 s, con fade de volumen).
- Opcional: fotos/videos de ustedes (`01-recuerdo.jpg` o `.mp4`, hasta 2 por canción).
- Nada se sube a ningún servidor; los archivos se pierden al recargar la página.
- Si falta algún video, se usa un fondo alternativo y la presentación sigue.

## Vista previa rápida
`?go=finale` salta al tracklist + letras, `?go=end` a la pantalla final, `?go=show` a la presentación (sin pantalla inicial).

## Notas
- El audio no arranca hasta presionar `ESTABLISH CONNECTION`. Para el celular, cargá el material y abrí la página por el mismo navegador en el que lo cargaste.
- La portada de *Clancy* viene de iTunes Search API; si falla (sin internet), se usa el fondo alternativo.
