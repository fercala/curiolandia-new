# Herramientas de Claude para este repo

Lo que hay en `.claude/` lo carga Claude Code al abrir una sesión en este repo (en la nube o en el ordenador).

## Gancho de inicio: Chrome para Playwright
`settings.json` ejecuta `hooks/chrome-playwright.sh` al empezar cada sesión. El plugin playwright busca Google Chrome en
`/opt/google/chrome/chrome`, y en la nube solo hay el Chromium de Playwright; el script crea ese lanzador con
`--no-sandbox`. Si ya hay Chrome o no se puede escribir en `/opt`, no hace nada.

Ojo en la nube: la red del entorno no deja salir a `fercala.github.io`. Para probar el juego con Playwright se monta en
local, se sirve con `python3 -m http.server` y se abre `http://localhost:<puerto>/`.

## UX Agent Skills (copia local)
El plugin UX Agent Skills (Carl Sziebert, licencia MIT, versión 0.6.0, ver `skills/LICENSE-ux-agent-skills`) no se carga
como plugin porque depende de `web-quality-skills`, que no está en el catálogo. Aquí está copiado:

- `skills/`: `ux-audit`, `usability-audit`, `spec-cuj`, `audit-cuj`, `render-report`.
- `agents/`: `usability-auditor`, `cuj-author`, `cuj-auditor`.
- `scripts/`: validadores y el generador de informes HTML (`python3 .claude/scripts/...`).

Cambios respecto al original: las órdenes `python3 scripts/` pasan a `python3 .claude/scripts/`. Las partes de `ux-audit`
que envuelven `web-quality-skills` (accesibilidad y rendimiento) no están; para accesibilidad se usan
`design:accessibility-review` o `ux-ui-audit`. Los informes se escriben en `.ux/`.
