# Curiolandia (nueva)

Migración de Curiolandia 3D (juego de temas de Educación Infantil, 3 a 5 años, con Tito como guía) a TypeScript + Vite
con arquitectura limpia. Se habla y se documenta en castellano.

## Antes de nada
- **Estado: fase 0 (red de seguridad), empezada el 24 de octubre de 2026** a petición de Fernando. El código es el de
  `curiolandia-3d` (commit `dd5fc61`, v1.592) sin voces grabadas; [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) explica cómo funciona.
- Lee [docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md): decisiones, arquitectura objetivo, fases y riesgos.
- El juego de referencia es `fercala/curiolandia-3d`: **solo lectura**, no se hacen commits allí desde este trabajo.

## Montar y probar
```sh
npm ci && npx playwright install chromium   # la primera vez
npm run build                # dist/ con la web completa (src/build.sh + src/build_web.py)
npm run test:comentarios     # comentarios de cabecera (docs/POLITICA-DOCUMENTACION.md)
npm run test:humo            # escenas de día y de noche sin errores
npm run test:pr              # lo que pasa GitHub Actions en cada PR (unos minutos)
```
Las pruebas de Playwright, de una en una (a la vez bajan los FPS y fallan). Para publicar, sube `VER` en
`src/build_web.py` y fusiona en `main`: `.github/workflows/web.yml` monta, prueba y publica en GitHub Pages.
Lo que las pruebas leen del juego (`window.__cl`) está en [docs/CONTRATO-PRUEBAS.md](docs/CONTRATO-PRUEBAS.md): no lo rompas.

## Reglas
- Sin voces grabadas: el juego nuevo usa solo la voz del navegador.
- Cada diálogo nuevo o cambiado se apunta en `dialogos/pendientes.txt` y en el catálogo `dialogos/todos.csv` ([dialogos/LEEME.md](dialogos/LEEME.md)).
- Las partidas guardadas no se rompen nunca: clave de guardado propia, copia única de la partida de `curiolandia-3d`, versión y migraciones.
- Cada cambio va documentado: comentario de cabecera en cada función, `docs/` al día y una entrada en `docs/CAMBIOS.md`.
- Las fases se hacen en ramas pequeñas con PR, y el juego queda publicable y con las pruebas en verde al final de cada una.
- Principios del proyecto: [docs/CONSTITUCION-BORRADOR.md](docs/CONSTITUCION-BORRADOR.md) (futura constitución de spec-kit).
