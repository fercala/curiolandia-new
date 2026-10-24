# Línea base (fase 0)

Medidas del juego tal como se importó de `curiolandia-3d` (commit `dd5fc61`, v1.592), para compararlas al final de cada
fase de la migración. Si una fase empeora algo de aquí, se explica en su PR.

Medido el 24 de octubre de 2026 en el entorno en la nube de Claude Code (4 núcleos, Chromium 1.63 de Playwright sin
ventana y **sin tarjeta gráfica**: WebGL por software con SwiftShader). En un móvil o un ordenador con tarjeta gráfica
todo va mucho más rápido; lo que importa es comparar siempre en el mismo sitio.

## Tamaño de la web (`dist/`)

| Archivo | Bytes | Comprimido (gzip) |
| --- | --- | --- |
| `index.html` (todo el juego) | 1.300.964 | 419.720 |
| `three.min.js` (r128) | 603.445 | — |
| `dist/` entera | 2.100.292 | — |

La web de `curiolandia-3d` pesa unos 101 MB más: `voz/` (48 MB) y `voz-fer/` (51 MB) no se publican aquí.

## Fotogramas por segundo

`node tests/regresion/fps.js dist`: cuatro segundos contando `requestAnimationFrame` en cada escena, partida de 3 años,
sin otras pruebas en marcha.

| Escena | FPS |
| --- | --- |
| Mapa (3D) | 2,7 |
| Casita 3A-T1 (3D) | 6,4 |
| Cuento de la introducción (2D) | 22,2 |
| Juego 3A-T1 #0 (2D) | 60,1 |

El mapa es lo más pesado. Con menos de 4 FPS el candado de adultos tarda más de 3 s en abrirse
(ver [PROBLEMAS-CONOCIDOS.md](PROBLEMAS-CONOCIDOS.md)).

## Juegos que terminan siguiendo la ayuda

`node tests/regresion/juegos.js dist 0 1 90` (los 253 juegos, uno detrás de otro, 90 s cada uno como máximo).

Resultado (24 de octubre de 2026, 47 minutos): **250 de 253 juegos terminan**, sin errores de JavaScript.

Los 3 que no terminan son los de regar (`riega`): 3A-T10 #1, 4A-T10 #3 y 5A-T10 #4. No es un fallo del juego: el
conductor de las pruebas suelta la regadera al momento y hay que mantenerla regando un rato (ya pasaba en
`curiolandia-3d`; ver `tests/regresion/AMPLIADA.md`, control de regar manteniendo el arrastre). Cualquier otro juego que
deje de terminar en una fase es una regresión.

## Pruebas en verde al importar

| Prueba | Resultado |
| --- | --- |
| `tests/comentarios.py` | 26 archivos, 0 fallos |
| `tests/humo.js` | de día y de noche, 3D sí, 0 errores |
| `informe-b.js` | B1-B7 bien (B5 con la espera del candado ajustada; fallaba igual en `curiolandia-3d` en este entorno) |
| `voces.js` | V1-V3 bien |
| `casa.js` | C1-C7 bien |
| `guardado-viejo.js` (nueva) | G1-G5 bien |
| `juegos.js dist 0 1 90` | 250 de 253 (los 3 de regar, ver arriba) |

## Fase 1: montaje con Vite y tipos

- La página que monta Vite (`dist/index.html`) es la misma que la de `build.sh` y `build_web.py`, byte a byte; `humo.js`
  y `guardado-viejo.js` pasan sobre ella.
- `npm run tipos`: 0 errores. `npm run test:unidad`: 11 de 11.
- `npm run tipos:js`: **283 avisos** de tipos en `src/*.js` (límite en `tests/tipos-js-limite.txt`, ver [TIPOS.md](TIPOS.md)).
  Solo pueden bajar.

## Fase 2a: VIVO y funciones pon*

Todo en verde con el código de la fase 2a (24 de octubre de 2026): humo, informe-b, voces, casa, guardado-viejo,
camino 3/4/5, limites (0 hallazgos), cobertura (15 de 15), ampliada (17 de 17) y **250 de 253 juegos** (los 3 de regar,
igual que antes). `npm run tipos:js`: 278 avisos.
