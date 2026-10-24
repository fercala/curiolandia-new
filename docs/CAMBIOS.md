# Cambios

| Fecha | Cambio |
| --- | --- |
| 2026-10-24 | **Fase 0, v0.1 (sin publicar todavía).** Código de `curiolandia-3d` importado del commit `dd5fc61` (v1.592) sin voces grabadas: Tito habla siempre con la voz del navegador (`S.voz='nav'`) y la zona de adultos ya no ofrece «Voz grabada» ni «Voz de Fer». Clave de guardado propia `curiolandia-new.v1` con copia única de la partida de `curiolandia-3d`. Montaje a `dist/` (`npm run build`), caché del service worker con prefijo propio `curiolandia-new-`, nombre de la app «Curiolandia». GitHub Actions pasa comentarios, humo, informe-b, voces, casa, guardado-viejo y 1/8 de los juegos en cada PR y publica desde `main`. Pruebas nuevas: `guardado-viejo.js`, `comprobar.js`, `fps.js`; `informe-b.js` (B5) espera al candado hasta 10 s. Documentos: CONTRATO-PRUEBAS, LINEA-BASE y las guías del juego viejo al día. Catálogo de frases en `dialogos/`. Sin frases nuevas ni cambiadas (se quita el saludo al cambiar de voz grabada, que también se dice al presentarse Tito). |
| 2026-10-24 | Herramientas de Claude comprobadas: gancho de inicio que prepara Chrome para Playwright y copia local de UX Agent Skills en `.claude/` (ver `.claude/LEEME.md` y el apartado 12 del plan). |
| 2026-10-24 | Plan de migración, borrador de constitución, CLAUDE.md y README. Sin código todavía. |
