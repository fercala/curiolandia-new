# Curiolandia: instrucciones para colaborar

Juego web para niños de 3 a 5 años, con Tito como guía. Se trabaja y se documenta en castellano de España.

Desde el acuerdo con Fernando del 10-11-2026, Codex también colabora en desarrollo, correcciones, pruebas y documentación. La modalidad la determina la petición:

- **Desarrollo o arreglo:** implementar el alcance pedido en una rama `codex/<cambio>`, con pruebas y documentación. Seguir los planes aprobados, sin dar por terminada una fase solo por haber escrito código.
- **Revisión de PR:** analizar el commit exacto, sin modificar archivos ni implementar arreglos, salvo petición posterior explícita. Entregar el informe en el chat; publicar una revisión o comentarios en GitHub solo si Fernando lo pide para ese trabajo.
- **Análisis o propuesta:** respetar el alcance; una propuesta no autoriza por sí sola a implementar todas sus fases.

La fusión y la publicación permanecen en manos de Fernando. No escribir en `main` ni en ramas de otro colaborador como parte del trabajo normal.

## Al empezar

1. Leer [CODEX.md](CODEX.md) y [CLAUDE.md](CLAUDE.md). Las reglas del producto y el proceso documentadas para Claude también se aplican al trabajo de Codex; no copiar su estado a una segunda lista de fases.
2. Consultar [POLITICA-DOCUMENTACION](docs/POLITICA-DOCUMENTACION.md), la sección relevante de [ARQUITECTURA](docs/ARQUITECTURA.md), la receta de [COMO-AGREGAR](docs/COMO-AGREGAR.md) y el plan de la tarea. El [contexto de incorporación](docs/CONTEXTO-CODEX.md) es una fotografía fechada, no el estado vivo.
3. Comprobar rama, cambios locales y PR abiertos antes de editar. No deshacer trabajo ajeno ni trabajar sobre un PR pendiente como si ya estuviera en `main`.
4. Leer los archivos que se van a tocar y sus pruebas. Buscar primero con `rg`; elegir pruebas por riesgo, sin recorrer de nuevo todo el proyecto en cada tarea pequeña.

## Reglas de implementación

- Dominio puro en `src/dominio/`: sin DOM, lienzo, Three.js ni estado global `S`. Casos de uso en `src/aplicacion/`; datos en `src/contenido/` y `src/temas/`; dibujo e interacción en escenas y `src/mundo3d/`. Usar los puertos de reloj, azar y guardado existentes.
- Todo el juego es TypeScript modular. No reintroducir globales tardías ni envolturas de funciones ya eliminadas. El puente de `src/modulos.ts` se mantiene para las pruebas; respetar valores vivos, funciones `pon*`, orden de importación y ausencia de nombres exportados duplicados.
- No cambiar claves de guardado, ids publicados ni posiciones persistidas de juegos. Cambios incompatibles de `S`: migración en `src/dominio/partida.ts`, valores por defecto y pruebas. Leer [ESTADO-GUARDADO](docs/ESTADO-GUARDADO.md).
- Solo voz del navegador. Frases enteras y, si varían partes, `fmt()`; no inferir la gramática del artículo castellano. Registrar diálogos nuevos o cambiados y regenerar el catálogo según [dialogos/LEEME](dialogos/LEEME.md) y [PLAN-IDIOMAS](docs/PLAN-IDIOMAS.md).
- Comentario de cabecera correcto en cada función nueva o cambiada, también métodos, y en cada archivo afectado. Actualizar guías, plan y registro de cambios según el alcance. No rebajar tipos, aserciones o controles para conseguir verde.
- Pruebas de reglas en Vitest; recorridos en Playwright, una batería de navegador cada vez. Respetar [CONTRATO-PRUEBAS](docs/CONTRATO-PRUEBAS.md), leer los JSON de resultados y usar `comprobar.js` cuando corresponda. `__fast` no demuestra audio audible.
- Prettier y oxlint son los del repo. No añadir dependencias sin justificarlo en el plan. `dist/`, capturas y resultados locales no se editan ni se versionan.
- `curiolandia-3d` es referencia de solo lectura. Mantener PWA sin conexión, alternativa 2D y uso en móviles modestos. Ninguna prueba debe usar partidas personales.

Proceso, pruebas según el cambio y entrega: [docs/COLABORACION-CODEX.md](docs/COLABORACION-CODEX.md).

## Code Review Rules

Estas reglas se aplican a revisiones; no convierten una tarea de implementación en una revisión de solo lectura.

### Compatibilidad de partidas y entregas

Señalar cambios que pierdan o reasignen progreso, monedas, inventario o canjes existentes. Los identificadores y las posiciones de juegos persistidas deben conservar su significado o tener una migración explícita y probada. La partida de `curiolandia-3d` debe seguir intacta; su importación en el juego nuevo es única. Las recompensas no deben perderse ni duplicarse al salir, recargar o interactuar desde otra pestaña.

### Conservación de comportamiento durante la migración

Un traslado mecánico a módulos debe conservar el comportamiento, salvo diferencias funcionales expresamente descritas. Revisar orden de carga, valores vivos del puente, callbacks, temporizadores, navegación y el contrato de pruebas. No marcar como bug el uso de solo voz del navegador ni exigir terminar fases de arquitectura posteriores a la del PR.

### Evidencia y alcance de las pruebas

Cada hallazgo debe identificar un disparador concreto y su efecto, con ubicación y evidencia. Diferenciar un fallo del juego de un error del guion o del entorno. Verificar qué ejecuta realmente CI: compilar, una muestra parcial o `__fast` no demuestran todos los recorridos ni audio audible. No considerar resuelto un bug solo porque desaparezca una aserción o se amplíe una espera sin justificarlo.

Presentar la revisión en castellano, centrada en problemas accionables. Registrar la cabecera exacta revisada y distinguir comprobaciones ejecutadas de las pendientes. No trasladar automáticamente estados históricos B1–B19 al nuevo repositorio.
