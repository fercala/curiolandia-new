# Colaboración con Codex y revisión de PR

Acuerdo guardado el **25-10-2026** para `fercala/curiolandia-new`.

## Papel acordado

Codex colabora como **revisor independiente de la migración**. La primera actividad elegida es revisar pull requests. No implementa arreglos ni modifica código del juego o de las pruebas dentro de una revisión, salvo una instrucción posterior explícita de Fernando.

Se pueden guardar informes y documentación cuando Fernando lo pida. Las decisiones de implementación, aprobación y fusión permanecen en manos de Fernando y del responsable del desarrollo. El repositorio `curiolandia-3d` se consulta como referencia de solo lectura.

Este documento conserva el contexto para futuras sesiones y para otros revisores. Las reglas breves para revisiones están en [AGENTS.md](../AGENTS.md).

## Contexto de partida

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
| Revisión de PR — prioridad inicial | Hallazgos por gravedad, archivo y línea, evidencia y recomendación |
| Protección de partidas | Matriz de compatibilidad, importación, reinicio, copias dañadas y concurrencia |
| Comparación entre versiones | Diferencias esperadas, regresiones reproducidas y puntos pendientes |
| Auditoría de pruebas | Qué comprueban las aserciones, huecos y casos concretos a añadir |
| Revisión de arquitectura | Riesgos de dependencias, tipos, puente y preparación del dominio |
| Documentación y contenido | Contradicciones, guías heredadas y propuestas de diálogos claros para 3–5 años |

Revisiones futuras pueden incluir jugabilidad, accesibilidad, rendimiento y PWA. No se confunde una comprobación automática con escucha real o validación en móvil físico.

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

La documentación oficial indica que el repositorio debe estar conectado a Codex y tener Code Review habilitado. Una vez configurado, un comentario `@codex review` en el PR solicita una revisión. También se pueden activar revisiones automáticas y elegir sus disparadores en los ajustes.

El revisor utiliza las instrucciones aplicables de `AGENTS.md`. No debe suponerse que dispone del historial de este chat: el contexto duradero queda aquí y en las reglas del repositorio.

La revisión de GitHub se centra actualmente en hallazgos P0/P1. Para una revisión más amplia de migración, cobertura y documentación, se mantiene el informe de este chat.

Fuente consultada el 25-10-2026: [documentación oficial de integración con GitHub](https://learn.chatgpt.com/docs/third-party/github).

**Estado al guardar:** se han documentado el protocolo y las reglas. No se han habilitado revisiones automáticas, cambiado permisos, creado protecciones de rama ni configurado GitHub Actions. Tampoco se ha supuesto acceso a la configuración de Code Review de la cuenta.

## Control de consumo y de calidad

- Empezar por las diferencias y el contexto que realmente afecta al PR.
- Seleccionar pruebas existentes por riesgo, una batería de navegador cada vez.
- Usar capturas cuando haya una duda visual; evitar inspecciones imagen por imagen para lógica automatizable.
- Evitar revisiones automáticas duplicadas del mismo commit.
- La CI inicial ejecuta una muestra fija de una octava parte de actividades; verificar el comando vigente en `package.json` y el workflow antes de interpretar resultados.
- No trasladar B1–B19 del repositorio anterior como bugs abiertos sin comprobarlos en la versión nueva.
- Los informes heredados pueden estar desactualizados: separar evidencia histórica de pruebas actuales.

## Primeros trabajos propuestos

1. Revisar el siguiente PR de migración antes de fusionarlo.
2. Establecer el primer informe con el formato anterior y ajustar el nivel de detalle según Fernando.
3. Después, reconciliar B1–B19 con la nueva versión y revisar las puertas de validación entre fases.
