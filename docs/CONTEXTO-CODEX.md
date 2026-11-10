# Contexto de incorporación de Codex

Análisis de incorporación del **10-11-2026**, sobre `main` en `e322d5145c54fd130d7dc698f5a74701bcd27c7d`, versión **0.2.118**. Es una fotografía verificable para retomar el trabajo, no un segundo registro de fases. Reconsultar `main`, `CLAUDE.md`, los planes y los PR al empezar otra tarea.

Se han estudiado las instrucciones, las guías de arquitectura, guardado, pruebas y documentación, los puntos de entrada y casos de uso representativos y los PR que se citan abajo. Esto prepara la colaboración; no certifica que todo el juego esté libre de errores ni equivale a haber jugado todos sus recorridos.

## Lo que ha cambiado desde nuestras primeras revisiones

Las revisiones de los PR #9 a #12 trataban traslados de JavaScript global a módulos. Ese ya no es el estado del proyecto:

- Desde la fase 2p todo el juego está en módulos TypeScript.
- El dominio y los puertos están separados desde la fase 3. La fase 4 está terminada; la fase 5 de contenido tiene partes hechas. El estado detallado vive en [PLAN-MIGRACION](PLAN-MIGRACION.md), no en los informes antiguos.
- `makeGame` está en `src/temas/hacerJuego.ts`, sin las antiguas envolturas `ponMakeGame` y `ponThing`. No deben reaparecer al copiar un ejemplo histórico.
- La base de texto es castellano de España. El antiguo parámetro de variante de algunas pruebas no demuestra que el producto siga ofreciendo rioplatense. Hay un plan nuevo para idiomas, con rumano y pseudoidioma de prueba.
- Three.js es la dependencia de npm `three`, incluida en el montaje. No usar como guía actual el antiguo script de CDN r128.
- El juego incluye las islas de Letras e Inglés, casa interactiva, mascotas, zona de adultos por categorías, cole, patio y excursiones.

## Mapa para encontrar la responsabilidad correcta

| Área | Dónde mirar primero | Qué conservar |
| --- | --- | --- |
| Montaje y arranque | `herramientas/vite/curiolandia.mts`, `src/modulos.ts`, `src/aplicacion/arranque.ts`, `src/aplicacion/bucle.ts` | Un script con el juego, fuentes locales, orden de carga, caché propia y arranque con el puente ya puesto. |
| Reglas | `src/dominio/` | Funciones sin navegador ni `S`, datos de entrada explícitos y resultados comprobables con Vitest. |
| Casos de uso | `src/aplicacion/terminarJuego.ts`, `abrirCofre.ts`, `comprar.ts`, `repasoDelDia.ts`, `casa.ts` | El cambio de partida y el resultado a celebrar no se deben duplicar en la escena. |
| Puertos y adaptadores | `src/aplicacion/puertos.ts`, `src/infraestructura/conectar.ts`, `navegador.ts` | Conectar antes de usar; pedir reloj, azar y guardado por sus puertos. Las pruebas pueden poner adaptadores en memoria. |
| Núcleo | `src/nucleo/` | Guardado, escena y reloj vivos, voz, dibujo, puntero y monedas. Importar lo que se usa; no reasignar imports. |
| Contenido y juegos | `src/contenido/`, `src/temas/`, `src/juegos/` | Datos y frases frente a motores de juego. `makeGame` decide el componente; el orden publicado de `games` tiene significado guardado. |
| Escenas | `src/escenas/indice.ts` y el módulo de la actividad | Navegación, entrada, dibujo, ayuda, interacción, temporizadores y persistencia en el punto correcto. |
| Capa 3D | `src/mundo3d/` | Disposición e interacción coherentes con 2D, recursos y rendimiento, alternativa sin WebGL. |
| Zona de adultos | `src/aplicacion/adultos.ts`, `src/aplicacion/adultos/`, `src/dominio/zonaAdultos.ts`, `src/head.html` | Controles, navegación por teclado, ajustes guardados y traducción tras pintar HTML. |
| Idiomas | `src/dominio/idiomas.ts`, `src/nucleo/traducir.ts`, `src/idiomas/` | Idioma al cargar, frases enteras, plantillas y formas gramaticales; nada de traducir dos veces o deducir el género por una cadena castellana. |

La [arquitectura](ARQUITECTURA.md) tiene el inventario completo. Sus apartados históricos describen decisiones anteriores; contrastarlos con la cabecera del módulo y el plan vigente.

### Dos flujos comprobados al estudiar el código

**Acabar un juego de tema.** `src/aplicacion/terminarJuego.ts` recibe partida, tema, número de juego y fecha/contexto del repaso. Aplica progreso, fechas, repaso y monedas; devuelve campos nuevos y señales de primera vez/tema terminado sin cambiar su entrada. La escena aplica el resultado, guarda y celebra. `tests/unidad/terminarJuego.test.ts` comprueba repetición, último juego, conservación de la entrada y repaso. Antes de cambiar recompensas, seguir este flujo completo.

**Acabar una actividad del patio.** `terminarEnElPatio` en `src/escenas/patioComun.ts` usa la regla `terminarActividad` de `src/dominio/cole.ts`, actualiza `S.cole`, abona monedas con `creditCoins` y guarda antes de la animación diferida. La animación usa `giveCoins` con las monedas ya abonadas. Un cambio debe mantener esa separación para no perder el premio al salir ni volver a abonarlo al animar.

## Contratos que afectan a casi cualquier cambio

- Partida propia en `curiolandia-new.v1`; referencia antigua en `curiolandia.v1`; marca de copia única en `curiolandia-new.copiada`. No escribir ni borrar la partida vieja.
- En esta base, `VERSION_PARTIDA = 5` en `src/dominio/partida.ts`. `package.json` tiene otra versión, la de la aplicación y su caché. Las migraciones aceptan datos rotos, no cambian la entrada y se prueban; un campo opcional compatible no obliga por sí solo a subir la versión del formato.
- `save()` se llama al cambiar algo persistente. Revisar recarga, salida durante una animación, repetición y otra pestaña cuando el cambio afecte a premios o guardado.
- Los nombres del puente, `window.__cl`, las coordenadas lógicas y las ayudas están en [CONTRATO-PRUEBAS](CONTRATO-PRUEBAS.md). El puente usa getters y rechaza reasignaciones y nombres duplicados; no es una vía para que nuevos módulos dependan de globales.
- `__fast` evita la espera de voz. Una prueba con él acredita lógica rápida, no audio audible ni sincronización real.
- Traducción: `tr` sale por voz, texto y HTML; `fmt` rellena plantillas, `nombreEn` da las formas del nombre. Cambiar idioma recarga. El rumano aún no está completo; no presentar como publicado lo que solo está preparado.

## Cómo documenta Claude: evidencia en PR

| PR estudiado | Evidencia observada | Método que seguirá Codex |
| --- | --- | --- |
| [#122, plan de idiomas](https://github.com/fercala/curiolandia-new/pull/122) | Solo tres archivos: plan, `CLAUDE.md` y cambios. Explica decisiones, fases y por qué no ejecuta Playwright ni sube versión. | Separar planificación e implementación. No publicar una versión de juego por cambiar solo documentación. |
| [#120, casa M3a](https://github.com/fercala/curiolandia-new/pull/120) | Reglas nuevas en `dominio/casaToques.ts`, dibujo separado, pruebas unitarias y recorrido `casa.js`; comentarios, plan, arquitectura, guardado, contrato, diálogos y versión en el mismo PR. | Cada comportamiento tiene una regla, una integración visible, sus pruebas y los documentos que cambia. Explicar lo que queda para la fase siguiente. |
| [#126, idiomas ID2a](https://github.com/fercala/curiolandia-new/pull/126) | Plantillas y formas del nombre, números rumanos, adaptación de consumidores; casos de Vitest para mayúsculas y género neutro, catálogo, plan y guías. El PR distingue pruebas ejecutadas de la casilla de juego manual no marcada. | Revisar consumidores y casos de idioma; declarar con precisión qué se ha probado y qué no. |

Se leyeron las descripciones y listas de archivos y parches representativos de esos PR, además de los PR recientes de excursiones, casa y patio. Las cifras de pruebas de un PR son evidencia declarada por su autor, no pruebas ejecutadas por Codex en esta incorporación. La guía de documentación obliga a todas las personas y asistentes, no solo a quien abre el PR.

## Frentes activos al incorporar a Codex

| Frente | Fuente y estado observado en esta base | Precaución al elegir trabajo |
| --- | --- | --- |
| Idiomas | [PLAN-IDIOMAS](PLAN-IDIOMAS.md): ID0, ID1 e ID2a en `main`. | Seguir los grupos de frases pendientes, sin dar por traducida la tabla rumana. Reconsultar el inventario con `npm run idiomas:compuestas`; no copiar un recuento de un PR antiguo. |
| Casa | [PLAN-CASA-MEJORA](PLAN-CASA-MEJORA.md): M3a fusionada; [PR #123](https://github.com/fercala/curiolandia-new/pull/123) abierto para M3b. | No rehacer variantes, arrastrar a Tito, combinaciones y dibujos que ya estén en ese PR. La medida de FPS de M0 en móvil físico sigue siendo una comprobación distinta. |
| Patio | [IDEAS-MEJORA](IDEAS-MEJORA.md): P1 a P11 en `main`; [PR #127](https://github.com/fercala/curiolandia-new/pull/127) abierto para P12a. | Coordinar juegos cortos y cambios en el menú. Un título con v0.2.118 no significa que esté integrado ni que esa versión siga libre. |

Las ramas abiertas pueden coincidir en `CLAUDE.md`, planes, catálogo, registro de cambios y versión. Resolver esos archivos leyendo el resultado final de ambas líneas de trabajo; conservar las dos entradas y recalcular versión/catálogo cuando proceda. No fusionar un PR ajeno para hacer esta incorporación.

## Pruebas y alcance observado

La fuente de órdenes es `package.json`. `.github/workflows/web.yml` usa Node 22, Python 3.12 y Chromium; monta, revisa comentarios, formato, lint y tipos, ejecuta Vitest, humo y `test:pr`. Al fusionar en `main` también publica Pages.

En esta base, `test:pr` ejecuta `informe-b`, `voces`, `casa`, `guardado-viejo`, `juegos` con `0 8 90`, `adultos`, `cole` y el comprobador de sus resultados. La muestra de juegos es una octava parte; no incluye automáticamente todos los guiones de [tests/regresion/LEEME](../tests/regresion/LEEME.md). `comprobar.js` falla si faltan resultados o hay hallazgos: el código de salida del guion aislado puede no bastar.

El contrato y los scripts actuales mandan sobre tablas históricas de duración o cobertura. No tomar «250/253, los tres de regar» ni B1–B19 como diagnóstico vigente sin reproducirlo. Para nuevas reglas, empezar por Vitest; para interacción, usar el recorrido afectado y comprobar sus aserciones; para voz, rendimiento o PWA, usar la prueba específica y registrar sus límites.

El proceso de trabajo y la matriz de documentación están en [COLABORACION-CODEX](COLABORACION-CODEX.md). No se añade aquí una segunda lista permanente de bugs ni otra hoja de ruta.
