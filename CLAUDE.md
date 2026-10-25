# Curiolandia (nueva)

Migración de Curiolandia 3D (juego de temas de Educación Infantil, 3 a 5 años, con Tito como guía) a TypeScript + Vite
con arquitectura limpia. Se habla y se documenta en castellano.

## Antes de nada
- **Estado: fase 2 (de globales a módulos), 24 de octubre de 2026.** Las fases 0 y 1 están publicadas. Desde la 2a, un
  archivo no reasigna las globales de otro: usa `VIVO` o las funciones `pon*`. Desde la 2b, los archivos pasan a módulos
  TypeScript (`src/modulos.ts`; ya están los dibujos de `src/dibujos/` y, desde la 2c, el núcleo de `src/nucleo/`, antes
  `core.js`, desde la 2d el vocabulario de `src/contenido/`, antes `lex.js`, desde la 2e los componentes de juego de `src/juegos/`, antes `comps.js` y `comps2.js`, y desde la 2f los temas de `src/temas/`, antes `temas*.js`) y el resto sigue global. El puente deja lo de los módulos en `globalThis` siempre al día y de solo lectura
  ([docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)). El código es el de
  `curiolandia-3d` (commit `dd5fc61`, v1.592) sin voces grabadas; [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) explica cómo funciona.
- Lee [docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md): decisiones, arquitectura objetivo, fases y riesgos.
- El juego de referencia es `fercala/curiolandia-3d`: **solo lectura**, no se hacen commits allí desde este trabajo.

## Montar y probar
```sh
npm ci && npx playwright install chromium   # la primera vez (también activa los ganchos de commit)
npm run dev                  # servidor de desarrollo: recarga al guardar
npm run build                # dist/ con la web completa (Vite + herramientas/vite/curiolandia.mts)
npm run test:comentarios     # comentarios de cabecera (docs/POLITICA-DOCUMENTACION.md)
npm run tipos                # TypeScript estricto (montaje y pruebas .ts)
npm run tipos:js             # avisos de tipos de src/*.js: no pueden subir del límite (docs/TIPOS.md)
npm run test:unidad          # Vitest (tests/unidad)
npm run test:humo            # escenas de día y de noche sin errores
npm run test:pr              # lo que pasa GitHub Actions en cada PR (unos minutos)
```
Las pruebas de Playwright, de una en una (a la vez bajan los FPS y fallan). Para publicar, sube `version` en
`package.json` (es el nombre de la caché del service worker) y fusiona en `main`: `.github/workflows/web.yml` monta, prueba y publica en GitHub Pages.
Lo que las pruebas leen del juego (`window.__cl`) está en [docs/CONTRATO-PRUEBAS.md](docs/CONTRATO-PRUEBAS.md): no lo rompas.

## Reglas
- Sin voces grabadas: el juego nuevo usa solo la voz del navegador.
- Cada diálogo nuevo o cambiado se apunta en `dialogos/pendientes.txt` y en el catálogo `dialogos/todos.csv` ([dialogos/LEEME.md](dialogos/LEEME.md)).
- Las partidas guardadas no se rompen nunca: clave de guardado propia, copia única de la partida de `curiolandia-3d`, versión y migraciones.
- Cada cambio va documentado: comentario de cabecera en cada función, `docs/` al día y una entrada en `docs/CAMBIOS.md`.
- Las fases se hacen en ramas pequeñas con PR, y el juego queda publicable y con las pruebas en verde al final de cada una.
- Principios del proyecto: [docs/CONSTITUCION-BORRADOR.md](docs/CONSTITUCION-BORRADOR.md) (futura constitución de spec-kit).
