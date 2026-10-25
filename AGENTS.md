# Curiolandia: contexto para revisión de PR

Estas instrucciones se aplican a tareas de **revisión de código**. No sustituyen el plan de migración ni convierten todas las tareas de implementación en tareas de revisión. Para desarrollo, consultar también `CLAUDE.md` y la documentación aplicable.

Acuerdo con Fernando: Codex empieza como revisor independiente; dentro de una revisión no modifica código del juego ni pruebas, no implementa arreglos y no fusiona PR. Una petición posterior explícita puede cambiar el alcance.

Procedimiento, formato de informes y otras formas de colaboración: [docs/COLABORACION-CODEX.md](docs/COLABORACION-CODEX.md).

## Code Review Rules

### Compatibilidad de partidas y entregas

Señalar cambios que pierdan o reasignen progreso, monedas, inventario o canjes existentes. Los identificadores y las posiciones de juegos persistidas deben conservar su significado o tener una migración explícita y probada. La partida de `curiolandia-3d` debe seguir intacta; su importación en el juego nuevo es única. Las recompensas no deben perderse ni duplicarse al salir, recargar o interactuar desde otra pestaña.

### Conservación de comportamiento durante la migración

Un traslado mecánico a módulos debe conservar el comportamiento, salvo diferencias funcionales expresamente descritas. Revisar orden de carga, valores vivos del puente, callbacks, temporizadores, navegación y el contrato de pruebas. No marcar como bug el uso de solo voz del navegador ni exigir terminar fases de arquitectura posteriores a la del PR.

### Evidencia y alcance de las pruebas

Cada hallazgo debe identificar un disparador concreto y su efecto, con ubicación y evidencia. Diferenciar un fallo del juego de un error del guion o del entorno. Verificar qué ejecuta realmente CI: compilar, una muestra parcial o `__fast` no demuestran todos los recorridos ni audio audible. No considerar resuelto un bug solo porque desaparezca una aserción o se amplíe una espera sin justificarlo.

Presentar la revisión en castellano, centrada en problemas accionables. Registrar la cabecera exacta revisada y distinguir comprobaciones ejecutadas de las pendientes. No trasladar automáticamente estados históricos B1–B19 al nuevo repositorio.
