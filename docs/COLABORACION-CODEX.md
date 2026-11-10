# Colaboración con Codex: desarrollo y revisión de PR

Acuerdo inicial del **25-10-2026**, ampliado por Fernando el **10-11-2026**, para `fercala/curiolandia-new`.

## Papel acordado

Codex colabora como **un programador más del proyecto**: implementa funcionalidades y fases pedidas, corrige errores, escribe pruebas, documenta y revisa PR. Adopta el método que ya usa Claude, con las mismas reglas de producto, arquitectura, guardado y calidad. La petición de cada tarea define el alcance; esta incorporación no inicia por sí sola todas las fases pendientes.

En una **revisión de PR**, Codex conserva su papel de revisor independiente: no modifica código ni pruebas ni implementa arreglos salvo petición posterior explícita. En una tarea de **desarrollo o corrección**, sí modifica los archivos necesarios, con sus pruebas y documentación, en una rama propia. La aprobación y fusión permanecen en manos de Fernando. `curiolandia-3d` es referencia de solo lectura.

Las instrucciones de entrada están en [AGENTS.md](../AGENTS.md), la guía de trabajo en [CODEX.md](../CODEX.md) y el análisis fechado de incorporación en [CONTEXTO-CODEX.md](CONTEXTO-CODEX.md). Las fuentes compartidas siguen siendo `CLAUDE.md`, los planes, las guías y el código; no se duplican en un plan distinto de Codex.

## Protocolo de desarrollo

1. **Acordar el resultado a partir de la petición.** Leer el plan aprobado y los contratos afectados. Si se pide una propuesta, preparar la propuesta; si se pide implementar una fase concreta, completarla con su validación y documentación. Resolver decisiones rutinarias sin pedir de nuevo una autorización ya dada.
2. **Partir de una base comprobada.** Revisar `main`, el estado local y los PR abiertos. Crear una rama `codex/<cambio>`; no editar la rama de Claude ni mezclar trabajo ajeno. Conservar modificaciones locales. Los PR abiertos son trabajo pendiente, no cambios ya disponibles.
3. **Encontrar la causa y la capa.** Seguir datos, llamadas y pruebas antes de cambiar. Reglas puras al dominio, casos de uso a aplicación, contenido a sus tablas y dibujo a la escena. Preferir los puertos y funciones comunes existentes frente a otra implementación del mismo premio, fecha o guardado.
4. **Implementar el alcance.** Para un bug, identificar disparador y efecto y añadir una prueba de regresión cuando aporte protección. Para una regla nueva, probar límites y conservación del estado de entrada en Vitest. Para interacción, probar recorrido, navegación y finalización sin depender únicamente de llamar a métodos internos.
5. **Documentar en el mismo cambio.** Actualizar las cabeceras, la guía, el plan y el contrato que toque, y registrar el cambio. Frases nuevas o cambiadas a `dialogos/pendientes.txt` y catálogo regenerado. No mantener una copia manual de los diálogos ni un resumen de fases distinto por asistente.
6. **Verificar por riesgo.** Usar la tabla siguiente y las órdenes de `package.json`; las pruebas de navegador, de una en una. Antes de publicar un cambio de juego, pasar los controles acordados en `CLAUDE.md` y las puertas adicionales del plan. Si el entorno impide alguno, dejarlo pendiente con motivo; no marcarlo como hecho.
7. **Repasar el diff y entregar.** Sin archivos generados, cambios de formato ajenos o dependencias injustificadas. PR pequeño con la plantilla del repo cuando forme parte de la entrega; describir resultado, pruebas y límites en castellano. No fusionar ni activar publicación por cuenta propia.

### Qué verificar según el cambio

| Cambio | Comprobación relevante, además de los controles del proyecto |
| --- | --- |
| Solo documentación | Coherencia con código/planes, enlaces y rutas, diff y `test:comentarios`. No necesita crear una versión del juego ni volver a jugarlo; el PR #122 es un precedente. |
| Regla de dominio o caso de uso | Vitest del módulo: casos normales, límites, repetición y no mutación cuando el contrato la promete; luego integración afectada. |
| Estado guardado, monedas o premios | Migraciones y valores por defecto, carga vieja/rota, repetición, salida antes de la animación, recarga y otra pestaña si procede. Comprobar saldo y registro, no solo una animación. |
| Juego, escena, casa, patio o zona de adultos | Humo y recorrido afectado, edades pertinentes, ayuda, salida/vuelta y guardado; 2D y 3D cuando existan ambas implementaciones. |
| Voz, textos o idioma | Catálogo y pendientes, secuencia/cancelación de voz y callbacks, textos visibles y HTML, plantillas y pseudoidioma. La escucha real se declara aparte de la simulada. |
| Montaje, PWA o rendimiento | Build, caché y actualización sin conexión, alternativa sin WebGL, medición aislada de FPS y dispositivo real si el objetivo lo requiere. |

La tabla ayuda a elegir pruebas, no sustituye `test:pr` ni las puertas de publicación. No lanzar una batería completa varias veces sin cambios o fallos que lo justifiquen. Revisar los JSON y el comprobador de resultados: una salida 0 del guion no basta en todos los casos.

### Documentación que acompaña al código

| Si cambia... | Mantener al día |
| --- | --- |
| Responsabilidades, módulos, orden de carga o flujo | `ARQUITECTURA.md` y la receta de `COMO-AGREGAR.md`. |
| Un contrato de partida | `ESTADO-GUARDADO.md`, tipos, valores por defecto y migraciones/pruebas cuando hagan falta. |
| Lo que usa el arnés de pruebas | `CONTRATO-PRUEBAS.md` y las pruebas que lo consumen. |
| Textos del juego | Pendientes y catálogo, según `dialogos/LEEME.md`; guías de idiomas cuando cambie su mecanismo. |
| Una fase o decisión | Su plan existente y el resumen de `CLAUDE.md` si cambia el estado. No actualizar una fotografía histórica como si fuese el plan vivo. |
| Una regla compartida de colaboración | `CLAUDE.md`, `AGENTS.md`, la política y esta guía o `CODEX.md`, según corresponda. |
| Un fallo sin resolver o corregido | `PROBLEMAS-CONOCIDOS.md` o el informe de hallazgos pertinente, con evidencia, estado y alcance actual. |
| Una entrega | `CAMBIOS.md`; si cambia el juego publicado, versión de aplicación y lockfile coherentes. Solo documentación no requiere subir versión. |

La [política de documentación](POLITICA-DOCUMENTACION.md) es la referencia para el detalle. Al añadir comentarios, explicar qué hace la función, sus entradas/salida y lo que escribe en `S`; no limitarse a satisfacer el comprobador automático.

## Coordinación y continuidad

- Antes de una fase, comprobar si otro PR ya la implementa. Si se pide continuar uno concreto, usar su cabecera y rama; no tomarlo como base por casualidad.
- Cuando se solapen planes, versión, catálogo o registro de cambios, integrar el resultado completo de ambos trabajos, sin borrar entradas ajenas. La versión de la aplicación se decide con la base actual, no con el título de otro PR.
- No delegar en otros agentes ni escribir en otros chats por el mero hecho de que existan agentes de Claude; hacerlo solo cuando la tarea y las instrucciones aplicables lo autoricen.
- Al terminar, dejar en los documentos compartidos las decisiones y pendientes que deba conocer otro colaborador. El informe final distingue qué cambió, qué se comprobó y qué queda pendiente. No guardar secretos, partidas personales ni rutas de una máquina como requisitos del proyecto.

## Contexto de partida

**Histórico del 25-10-2026.** No describe el estado actual; para la incorporación ampliada, ver [CONTEXTO-CODEX.md](CONTEXTO-CODEX.md).

En la revisión inicial: v0.2.5, fase 2e, referencia `5398b60b6aa0d0ff3d669f492244fb15991373be`. El juego combina módulos TypeScript con código global. Ya se trasladaron dibujos, núcleo, vocabulario y componentes de juego; quedan otras partes por migrar. El puente mantiene valores actuales entre ambas capas.

La base importada del juego antiguo es v1.592, commit `dd5fc61`. El juego nuevo usa únicamente voz del navegador y una clave de partida propia, con copia única de la anterior. No se deben tratar esas diferencias intencionadas como regresiones.

Referencias que deben releerse según el PR:
- [Plan de migración](PLAN-MIGRACION.md), [arquitectura](ARQUITECTURA.md) y [cambios](CAMBIOS.md).
- [Estado guardado](ESTADO-GUARDADO.md) y [contrato de pruebas](CONTRATO-PRUEBAS.md).
- [Línea base](LINEA-BASE.md), [tipos](TIPOS.md), [documentación](POLITICA-DOCUMENTACION.md) y `CLAUDE.md`.

La fase y versión anteriores son una fotografía inicial, no una afirmación sobre todos los PR futuros.

## Formas de colaborar

| Trabajo | Entrega |
|---|---|
| Desarrollo y corrección | Rama con implementación, pruebas, documentación y PR según la tarea |
| Revisión de PR | Hallazgos por gravedad, archivo y línea, evidencia y recomendación |
| Protección de partidas | Matriz de compatibilidad, importación, reinicio, copias dañadas y concurrencia |
| Comparación entre versiones | Diferencias esperadas, regresiones reproducidas y puntos pendientes |
| Auditoría de pruebas | Qué comprueban las aserciones, huecos y casos concretos a añadir |
| Revisión de arquitectura | Riesgos de dependencias, tipos, puente y preparación del dominio |
| Documentación y contenido | Contradicciones, guías heredadas y propuestas de diálogos claros para 3–5 años |

La colaboración también puede incluir jugabilidad, accesibilidad, rendimiento y PWA. No se confunde una comprobación automática con escucha real o validación en móvil físico.

## Protocolo de revisión de PR

1. **Entrada:** enlace del PR y foco, si existe. Anotar número, rama base, commit base y commit de cabecera revisado.
2. Leer descripción, diferencias y contexto relacionado. Distinguir traslado mecánico, cambio funcional solicitado y deuda que la fase todavía no pretende resolver.
3. Revisar guardado, progreso, monedas y entregas únicas; ids e índices persistidos; callbacks, temporizadores, orden de carga y estado compartido; voz del navegador, navegación y contrato `__cl`.
4. Consultar CI y sus resultados. Un resultado verde no sustituye revisar qué casos se ejecutaron ni sus aserciones.
5. Ejecutar pruebas existentes seleccionadas en una copia aislada cuando ayuden a resolver una duda y el entorno lo permita. No modificar tests para obtener un resultado verde ni tocar partidas personales.
6. Informar solo de problemas accionables sustentados por el cambio y su contexto. Distinguir fallo confirmado, riesgo pendiente y error del entorno de pruebas.
7. Entregar hallazgos y límites de la revisión. Si no se encuentran problemas, decir «sin hallazgos en el alcance revisado»; no certificar ausencia total de bugs.
8. Tras cambios del autor, revisar los nuevos commits y confirmar cada corrección. No declarar revisado un commit posterior que todavía no se ha inspeccionado.

### Formato del resultado

- PR, base y cabecera exactas.
- Resumen del alcance.
- Por hallazgo: prioridad, título, archivo/líneas, disparador, efecto, evidencia o reproducción y posible solución.
- Pruebas ejecutadas y resultado; pruebas no ejecutadas y motivo.
- Riesgos residuales y puntos pendientes.
- En una segunda pasada: qué hallazgos se resolvieron y contra qué commit.

Prioridades: P0 crítico y generalizado; P1 riesgo grave que debe atenderse pronto; P2 bug relevante de prioridad normal; P3 menor. No elevar sugerencias de estilo a bugs. Los comentarios deben estar en castellano.

## Integración inicial: revisión a petición desde este chat

Fernando comparte el enlace y pide, por ejemplo:

> Revisa este PR siguiendo docs/COLABORACION-CODEX.md. No cambies archivos. Prioriza partidas guardadas, regresiones de comportamiento y cobertura de pruebas.

El informe se entrega en el chat. Publicar comentarios o una revisión en GitHub se hará cuando Fernando lo solicite expresamente para ese trabajo. Una revisión publicada se vincula al commit examinado.

Este modo no activa vigilancia permanente ni revisa PR nuevos sin una nueva solicitud o una automatización acordada.

## Integración opcional: revisión de Codex en GitHub

La consulta del 25-10-2026 a la documentación oficial describía la revisión de GitHub mediante un repositorio conectado y Code Review habilitado, la petición `@codex review` y ajustes para revisión automática. Antes de configurar esa integración, volver a comprobar la documentación y los ajustes disponibles en la cuenta.

El revisor utiliza las instrucciones aplicables de `AGENTS.md`. No debe suponerse que dispone del historial de este chat: el contexto duradero queda aquí y en las reglas del repositorio.

La disponibilidad y el alcance del servicio de revisión pueden cambiar. El protocolo de este chat incluye problemas accionables y límites de cobertura, sin presuponer los filtros actuales del servicio de GitHub.

Fuente consultada el 25-10-2026: [documentación oficial de integración con GitHub](https://learn.chatgpt.com/docs/third-party/github).

**Estado de esta incorporación:** se añaden instrucciones y contexto de trabajo. Esto no habilita ni verifica revisiones automáticas, permisos, protecciones de rama o una revisión obligatoria para fusionar; no se cambia el workflow. No confundir revisión automática con un requisito de fusión.

## Control de consumo y de calidad

- Empezar por las diferencias y el contexto que realmente afecta al PR.
- Seleccionar pruebas existentes por riesgo, una batería de navegador cada vez.
- Usar capturas cuando haya una duda visual; evitar inspecciones imagen por imagen para lógica automatizable.
- Evitar revisiones automáticas duplicadas del mismo commit.
- La CI inicial ejecuta una muestra fija de una octava parte de actividades; verificar el comando vigente en `package.json` y el workflow antes de interpretar resultados.
- No trasladar B1–B19 del repositorio anterior como bugs abiertos sin comprobarlos en la versión nueva.
- Los informes heredados pueden estar desactualizados: separar evidencia histórica de pruebas actuales.

## Cómo empezar una tarea

Fernando puede pedir una fase, un arreglo, pruebas o una revisión. Codex toma el plan correspondiente y completa ese alcance con el método anterior. Una fase documentada o un PR abierto no inicia por sí solo otra tarea ni una vigilancia permanente.
