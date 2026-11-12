# Curiolandia (nueva)

Nueva versión de [Curiolandia 3D](https://github.com/fercala/curiolandia-3d), el juego de temas de Educación Infantil
(3, 4 y 5 años) con Tito como guía, rehecha en TypeScript con arquitectura limpia.

Todo el juego está en módulos TypeScript, con reglas de dominio y casos de uso separados del dibujo; usa solo voz
del navegador. Se monta con Vite y tiene pruebas en cada PR. El estado de las fases está en [docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md), los principios
en [docs/CONSTITUCION-BORRADOR.md](docs/CONSTITUCION-BORRADOR.md) y cómo funciona en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

Web: https://fercala.github.io/curiolandia-new/

Para colaborar: [CLAUDE.md](CLAUDE.md) y, con Codex, [AGENTS.md](AGENTS.md) y [CODEX.md](CODEX.md).
Ambos siguen los mismos planes y la [política de documentación](docs/POLITICA-DOCUMENTACION.md).

Las pruebas de [guardado y recuperación](docs/COBERTURA-PRUEBAS.md#guardado-y-recuperación-11-de-noviembre-de-2026) se ejecutan después de compilar con `node tests/regresion/cobertura.js dist guardado-`.
