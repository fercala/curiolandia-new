# Curiolandia (nueva)

Migración de Curiolandia 3D (juego de temas de Educación Infantil, 3 a 5 años, con Tito como guía) a TypeScript + Vite
con arquitectura limpia. Se habla y se documenta en castellano.

## Antes de nada
- **Estado: fase 2 (de globales a módulos) completa con la 2p, 25 de octubre de 2026.** Las fases 0 y 1 están
  publicadas. Todo el juego son módulos TypeScript (`src/modulos.ts` y lo que importa: los dibujos de `src/dibujos/`,
  el núcleo de `src/nucleo/`, antes `core.js`, `src/contenido/`, `src/juegos/`, `src/temas/`, las escenas de
  `src/escenas/`, `src/aplicacion/` y la capa 3D de `src/mundo3d/`, antes `world3d.js`): ya no queda código global. Lo
  que varios archivos cambian va en `VIVO` o se cambia con las funciones `pon*`. El puente deja lo de los módulos en
  `globalThis` siempre al día y de solo lectura, para las pruebas y para `src/tardias.d.ts`. **Fase 3 (dominio y puertos) en marcha:**
  desde la 3a, las reglas de apertura están en `src/dominio/apertura.ts`, desde la 3b las de progreso y premios en
  `src/dominio/progreso.ts`, desde la 3c las de las monedas en `src/dominio/monedas.ts` y desde la 3d las del repaso
  diario en `src/dominio/repaso.ts` y desde la 3e las de la dificultad en `src/dominio/dificultad.ts`, sin dibujo ni
  `S`, con pruebas de Vitest; desde la 3f la partida lleva su versión (`S.ver`) y sus migraciones están en
  `src/dominio/partida.ts`; desde la 3g la hora y el azar se piden a sus puertos (`ahora()` y `azar()`,
  `src/aplicacion/puertos.ts`), con los adaptadores del navegador en `src/infraestructura/`. El código es el de `curiolandia-3d` (commit `dd5fc61`, v1.592) sin voces grabadas;
  [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) explica cómo funciona.
- Lee [docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md): decisiones, arquitectura objetivo, fases y riesgos.
- El juego de referencia es `fercala/curiolandia-3d`: **solo lectura**, no se hacen commits allí desde este trabajo.

## Montar y probar
```sh
npm ci && npx playwright install chromium   # la primera vez (también activa los ganchos de commit)
npm run dev                  # servidor de desarrollo: recarga al guardar
npm run build                # dist/ con la web completa (Vite + herramientas/vite/curiolandia.mts)
npm run test:comentarios     # comentarios de cabecera (docs/POLITICA-DOCUMENTACION.md)
npm run tipos                # TypeScript estricto (el juego, el montaje y las pruebas .ts)
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
