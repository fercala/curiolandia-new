# Contrato con las pruebas: `window.__cl` y lo que leen las pruebas

Las pruebas de `tests/` son de **caja negra**: abren el juego en Chromium (Playwright), juegan siguiendo la ayuda de cada
escena y leen el estado por `window.__cl` y por unas pocas variables globales. Mientras dure la migración, **todo lo de
esta página tiene que seguir existiendo con el mismo nombre y el mismo significado**: es lo que permite comprobar que cada
fase deja el juego igual. Si una fase lo cambia, cambia también las pruebas en el mismo PR y lo apunta aquí.

Desde la fase 2p todo el código son módulos, pero el puente de `src/modulos.ts` sigue dejando en `globalThis`, con su
nombre y de solo lectura, todo lo que exportan: las pruebas leen sueltas las variables de la última tabla igual que
antes. Si un módulo deja de exportar una de ellas, la prueba que la lee falla con «X is not defined».

## `window.__cl` (definido en `src/aplicacion/adultos.ts`; su tipo, `PuertaPruebas`, en `src/nucleo/tipos.ts`)

| Nombre | Qué es | Usos en las pruebas |
| --- | --- | --- |
| `go(nombre, opciones)` | Cambia de escena, como `go()` del juego. `lib.js` lo sustituye al abrir por el `go` sin la envoltura 3D. | 67 |
| `S` (solo lectura del objeto, se puede modificar por dentro) | El estado guardado (ver [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)). | 56 |
| `scene` | La escena actual: sus `hint()`, `down/move/up`, `g` (juego en curso)... | 29 |
| `name` | Nombre de la escena actual (`'title'`, `'map'`, `'juego'`...). | 27 |
| `TEMAS`, `TEMA`, `SCENES` | Los temas con sus juegos, el tema por id y las escenas. | 6 |
| `tap(x, y)`, `drag(x1, y1, x2, y2)`, `hover(x, y)` | Toques en coordenadas de la pantalla lógica de 1600x900. | — |
| `T()` | Tiempo de juego en segundos. | — |
| `say`, `openAdult(pagina?)`, `closeAdult` | Hablar y abrir/cerrar la zona de adultos. Desde la fase A1 de [PLAN-MENU-ADULTOS.md](PLAN-MENU-ADULTOS.md), `openAdult` abre una página concreta si se le pasa su id (`'resumen'`, `'quienJuega'`, `'comoSeJuega'`, `'titoYSonido'`, `'progreso'`, `'premios'`, `'copia'`): lo necesitan las pruebas que pulsan con Playwright, que solo ve lo que está a la vista (`cobertura.js`, `ampliada.js`, `adultos.js`). | — |

## Lo que las pruebas leen fuera de `__cl`

| Nombre | Dónde está | Para qué |
| --- | --- | --- |
| `window.__fast` | lo ponen las pruebas | Modo rápido: `say()` no habla y acaba en 30 ms. |
| `window.__said` | lo ponen las pruebas | `say()` apunta ahí cada frase en modo rápido. |
| `window.__w3` (`ok`, `W`, `retito`, `FPS`, `pickAt`, `proj`...) | `src/mundo3d/interaccion.ts` (`montarInteraccion`; `ok` lo pone `src/mundo3d/mundo3d.ts`) | Saber si hay 3D y leer el mundo 3D. |
| `#adult` (elemento HTML) | `src/head.html` | Ver si la zona de adultos está abierta (`hidden`). Desde la fase A1, dentro: `#a-close`, `#a-atras`, `nav.menu button[data-pag]` y una caja `.pag[data-pag]` por página; los controles conservan sus `id` y `name` de siempre (`#a-name`, `[name=a-age]`, `[name=a-mode]`, `#a-vnav`, `#a-mus`, `[data-von]`, `[data-vgive]`, `#a-bk-txt`, `#a-tema`...), y todas las páginas están en el DOM aunque no se vean. Desde la fase A4, la guía de voces es `details.guia-voces` (`voces.js`), porque hay otros `details` («Más información») antes. |
| `save`, `doReset`, `go`, `sceneName`, `scene`, `S` | `nucleo/guardado.ts`, `nucleo/escenas.ts`, `aplicacion/adultos.ts` | Guardar, borrar todo, cambiar de escena. |
| `OX`, `OY`, `SC` | `nucleo/pantalla.ts` | Pasar de la pantalla lógica 1600x900 a píxeles de la ventana (ratón de verdad). |
| `VIVO.talking` | `nucleo/voz.ts` | Esperar a que Tito termine de hablar. |
| `VIVO.fade`, `VIVO.sessionT`, `VIVO.minuteAcc` | `nucleo/escenas.ts`, `nucleo/interfaz.ts` | Esperar a que acabe el velo de una escena; tiempo de juego (`cobertura.js`, `limites.js`). |
| `ponGo` | `nucleo/escenas.ts` | Envolver `go` para apuntar las escenas (`camino.js`). |
| `pickVoice`, `VOICE` | `nucleo/voz.ts` | Prueba de la elección de voz (`voces.js`). |
| `VOZ`, `vozFile`, `kid` | `nucleo/voz.ts` | Plan de voz de una frase con el nombre del niño (`limites.js`, `audio.js`; sin voces grabadas `VOZ` es `null`). |
| `bkEncode`, `bkDecode` | `aplicacion/adultos/copiaSeguridad.ts` (los vuelve a exportar `aplicacion/adultos.ts`) | Copias de seguridad. |
| `VIVO.MX`, `T` | `nucleo/puntero.ts`, `nucleo/pantalla.ts` | Posición del ratón y reloj de juego. |
| `localStorage['curiolandia-new.v1']` | `nucleo/guardado.ts` (`KEY`) | Escribir partidas de prueba antes de cargar. |
| `localStorage['curiolandia.v1']` | `nucleo/guardado.ts` (`KEY_VIEJA`) | La partida de curiolandia-3d que se copia (`guardado-viejo.js`). |
| `SCENES.casaTito`: `paseo`, `acc`, `va`, `irA(id)`, `paseoTok` | `escenas/casa.ts` (desde la fase C2 de PLAN-CASA.md; hasta la fase M1 de PLAN-CASA-MEJORA.md, en `escenas/tienda.ts`) | Que Tito ande hasta lo que se toca y juegue (`casa.js`, C8 a C10): `paseo` (`x1`, `y1`, `dur`), la acción en curso (`acc.id`, `acc.accion`) y a qué va (`va.accion`). |
| `SCENES.casaMascota`: `id`, `elige`, `fiesta`, `cuida(c)`; `etapaDe(id)` | `escenas/casaMascotas.ts` (desde la fase C6 de PLAN-CASA.md) | Que las mascotas se cuiden, tengan nombre y crezcan (`casa.js`, C20 a C22). |
| `SCENES.casaTito.combina(a, b, x, y)`; `SCENES.sorpresasCasa.pag`; `ALBUM_CASA_BOTON`, `ENTRADAS_ALBUM`, `POR_PAGINA`, `mascotasMayores()`, `openAdult()` | `escenas/casa.ts`, `escenas/casaAlbum.ts`, `escenas/casaMascotas.ts` (desde la fase C7 de PLAN-CASA.md) | Las combinaciones, el álbum de sorpresas y las mascotas mayores (`casa.js`, C23 a C25). |
| `baulItems()`, `baulNuevos()`, `BAUL`, `ORDENA`, `casillasBaul(ids, pestana, pag, catDe)`; `SCENES.casaTito`: `baul`, `pest`, `bpag`, `drag.cerca`, `colocar(id, h)`; `placeHome(id)` y `homeItems()` | `escenas/casa.ts` y `escenas/casaBaul.ts` (desde la fase M2 de PLAN-CASA-MEJORA.md); `escenas/tienda.ts` | La casa ordenada (`casa.js`, C27 a C30; y C6, que ahora espera la compra en el baúl). Desde la M2, `placeHome` pone el objeto en un sitio libre de su habitación (o en el baúl si no cabe) y `homeItems()` sin habitación no cuenta lo del baúl (`homeItems('baul')`, solo lo del baúl). Las pruebas `arrastre-*` de `ampliada.js` cogen el objeto desde donde esté tras entrar (salta a su sitio). |
| `SCENES.casa3dPrueba`: `three`, `objetos`, `muestra`, `jugado`, `down(x, y)`; `window.__w3.pickAt`; el botón `[data-go="casa3dPrueba"]` de la zona de adultos | `mundo3d/casa3d.ts`, `aplicacion/adultos.ts` (desde la fase M0 de PLAN-CASA-MEJORA.md) | La casa en 3D de prueba: se abre, tiene los 8 recortables de muestra, Tito juega con el sofá y se vuelve a la casa (`casa.js`, C26). |
| `mzOf('cole')`, `COLE_SITIOS`, `BOTONES_PATIO` (con `a.id`, `x`, `y`, `w`, `h`), `S.cole`, `__cl.name`, `planDeOrdenes(edad, azar)` (lista de `{orden, trampa}`), `VIVO.sessionT`, `VIVO.restAsked`, `VIVO.pausaHecha` (la pausa activa: `lib.abrir` la da por hecha) | `escenas/zonas.ts`, `escenas/cole.ts`, `escenas/patio.ts` (desde la fase P1 de IDEAS-MEJORA.md), `escenas/titoDice.ts` (desde la P2), `escenas/yoga.ts` y el mapa (`escenas/zonas.ts`, desde la P3) | Llegar al cole desde el mapa, del cole al patio, a «¡Estatuas!» y a «Tito dice», que el plan de «Tito dice» con 5 años tenga sus trampas bien puestas, hacer el yoga y que la pausa activa salga a los 20 minutos, y que al terminar se apunte en `S.cole` con sus monedas (`cole.js`, P1 a P4). |
| Versión en `sw.js` (`curiolandia-new-vX`) | `package.json` (`version`) y `herramientas/vite/curiolandia.mts` | `cobertura.js` la lee para el informe. |

Cuentas sacadas con `grep` sobre `tests/` el 24 de octubre de 2026 (fase 0). En la fase 2a, `talking`, `fade`, `sessionT`,
`minuteAcc` y `MX` pasaron a `VIVO` y `camino.js` envuelve `go` con `ponGo`.
