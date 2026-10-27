# Curiolandia (nueva)

Migración de Curiolandia 3D (juego de temas de Educación Infantil, 3 a 5 años, con Tito como guía) a TypeScript + Vite
con arquitectura limpia. Se habla y se documenta en castellano.

## Antes de nada
- **Estado: fase 4 (escenas sin capas) terminada el 26 de octubre de 2026; fase 5 (contenido como datos) en marcha.** Las fases 0 y 1 están publicadas.
  Desde la 2p todo el juego son módulos TypeScript (`src/modulos.ts` y lo que importa: los dibujos de `src/dibujos/`,
  el núcleo de `src/nucleo/`, antes `core.js`, `src/contenido/`, `src/juegos/`, `src/temas/`, las escenas de
  `src/escenas/`, `src/aplicacion/` y la capa 3D de `src/mundo3d/`, antes `world3d.js`): ya no queda código global. Lo
  que varios archivos cambian va en `VIVO` o se cambia con las funciones `pon*`. El puente deja lo de los módulos en
  `globalThis` siempre al día y de solo lectura, para las pruebas. Desde la fase 3, las
  reglas del juego (apertura, progreso y premios, monedas, repaso diario, dificultad, y la versión y las migraciones de
  la partida, `S.ver`) están en `src/dominio/`, sin dibujo ni `S`, con pruebas de Vitest; y la hora, el azar y lo
  guardado se piden a sus puertos (`ahora()`, `azar()`, `leerGuardado()`... en `src/aplicacion/puertos.ts`), con los
  adaptadores del navegador en `src/infraestructura/`. **Fase 4 (escenas sin capas y casos de uso), terminada**
  ([docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md) tiene sus partes, y las de la fase 5): desde la 4a las monedas en pantalla tienen su módulo (desde
  la 4b, `src/nucleo/monedas.ts`) y `STARS` e `inR` están en el núcleo; desde la 4b, terminar un juego (`finishGame`) es
  una sola función con su caso de uso, `src/aplicacion/terminarJuego.ts`, el primero de `src/aplicacion/`, y desde la
  4c el repaso del día no envuelve nada (caso de uso `src/aplicacion/repasoDelDia.ts`); desde la 4d, el mapa, las zonas y
  la casita se definen una sola vez, en `src/escenas/zonas.ts`, y desde la 4e la asamblea (con el cumpleaños), en
  `src/escenas/escenas2d.ts`; desde la 4f, `makeGame` (`src/temas/hacerJuego.ts`) y `thing` no se envuelven: solo envuelve
  la capa 3D; desde la 4g y la 4h, la capa 3D está partida en módulos (`src/mundo3d/`: el motor, las piezas, la decoración, el
  cielo, los objetos, los personajes, la interacción y un módulo por escena 3D; `mundo3d.ts` solo la monta). El código es el de `curiolandia-3d` (commit `dd5fc61`, v1.592) sin voces grabadas;
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
