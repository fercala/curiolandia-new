# Trabajar con Codex en Curiolandia

Entrada de trabajo para Codex, acordada con Fernando el **10-11-2026**. Codex puede desarrollar funcionalidades, corregir errores, escribir pruebas, mantener documentación y revisar PR. En una petición de revisión sigue sin modificar archivos.

[AGENTS.md](AGENTS.md) contiene las instrucciones de repositorio que Codex reconoce. Este archivo se consulta desde allí; no necesita una configuración de cuenta ni activa automatizaciones. [CLAUDE.md](CLAUDE.md) conserva el resumen de fases que ya usa el proyecto. Las guías y planes son compartidos: no hay un plan de juego distinto para cada asistente.

## Primera sesión y siguientes

1. Confirmar que se trabaja en `fercala/curiolandia-new`, anotar la base y revisar el estado local. Consultar `main` y los PR abiertos: una descripción, un título o una fase escrita en otra rama no demuestra que esté fusionada.
2. Leer `AGENTS.md`, `CLAUDE.md` y la política de documentación. En la primera incorporación, recorrer la arquitectura y los contratos; después, volver a las partes afectadas por la tarea.
3. Para orientarse, usar [CONTEXTO-CODEX](docs/CONTEXTO-CODEX.md). Para saber qué falta hoy, leer el plan correspondiente y el código actual. La versión sale de `package.json`, la de la partida de `VERSION_PARTIDA`: no son la misma cosa.
4. Trabajar en una rama pequeña `codex/<cambio>` desde la base comprobada. Si hay cambios locales, conservarlos; no actualizar ni limpiar a ciegas. En una copia limpia se puede traer `main` antes de abrir la rama.
5. Definir el resultado esperado, implementar, verificar y documentar. Para una fase grande, seguir o completar su plan en `docs/`; no crear otra hoja de ruta que compita con él.

## Comandos reales del proyecto

Desde la raíz del repo; comprobar `package.json` y el workflow si cambian:

```sh
npm ci
npx playwright install chromium
npm run dev
npm run build
npm run test:comentarios
npm run formato
npm run formato:comprobar
npm run lint
npm run tipos
npm run test:unidad
npm run test:humo
npm run test:pr
```

`npm ci` activa los ganchos de Git mediante `prepare`. En Windows, las herramientas que invocan `sh` o `python3` necesitan esos ejecutables; indicar un problema de entorno como tal. No copiar el gancho de inicio de `.claude/`, sus rutas Linux ni sus opciones de navegador a una configuración de Codex.

Si hay cambios de texto:

```sh
npm run dialogos
npm run idiomas:compuestas
```

El primero regenera `dialogos/todos.csv`; revisar su diff. El segundo inventaría frases compuestas y trucos de gramática: no traduce por sí solo el juego.

No ejecutar `npm run formato` sobre trabajo ajeno sin revisar su alcance. Para un cambio acotado, formatear los archivos de código tocados con la versión instalada de Prettier, y comprobar el resultado. Los Markdown están excluidos por `.prettierignore`.

## Qué compartir con Claude y qué adaptar

Se comparte el método: fases pequeñas, dominio con pruebas, contratos compatibles, comentarios que expliquen el porqué, guías al día, diálogos catalogados y un PR con evidencia. Véanse los ejemplos estudiados en el contexto de incorporación.

La adaptación de Codex está en buscar primero la causa, aprovechar Vitest y pruebas existentes, comprobar los resultados del arnés y reservar navegador, capturas y escucha para las dudas que los necesiten. No se atribuyen a esta sesión las pruebas que solo declara el autor de un PR.

Las herramientas UX de `.claude/` están documentadas en [.claude/LEEME.md](.claude/LEEME.md). No se supone que Codex las descubra, que tenga los mismos plugins o que ejecute sus agentes automáticamente. Si una tarea requiere reutilizarlas, leer sus instrucciones y licencia y adaptar solo lo necesario a las herramientas disponibles. No duplicar ese paquete en otra carpeta sin una necesidad concreta.

## Terminar una tarea

Usar el [protocolo compartido](docs/COLABORACION-CODEX.md): resultado concreto, documentación correspondiente, pruebas ejecutadas y pendientes y diff revisado. Preparar un PR cuando forme parte de la entrega pedida; usar [.github/pull_request_template.md](.github/pull_request_template.md), en castellano y sin marcar comprobaciones no realizadas.

Las decisiones compartidas van en el plan o guía correspondiente. Los hallazgos sin resolver llevan evidencia y estado pendiente en el documento de fallos adecuado. Un dato importante no debe quedarse solo en este chat ni en una memoria local de la máquina.

Los archivos de incorporación no habilitan revisión automática ni obligatoria de PR, no conceden permisos y no autorizan una fusión. Una nueva petición de Fernando define el siguiente trabajo.

Referencia para la estructura de instrucciones, consultada el 10-11-2026: [OpenAI Docs: flujos de desarrollo con Codex](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex). Se aprovecha `AGENTS.md` y la documentación que ya existe; los demás archivos de esa guía son convenciones opcionales.
