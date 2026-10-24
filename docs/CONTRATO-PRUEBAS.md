# Contrato con las pruebas: `window.__cl` y lo que leen las pruebas

Las pruebas de `tests/` son de **caja negra**: abren el juego en Chromium (Playwright), juegan siguiendo la ayuda de cada
escena y leen el estado por `window.__cl` y por unas pocas variables globales. Mientras dure la migración, **todo lo de
esta página tiene que seguir existiendo con el mismo nombre y el mismo significado**: es lo que permite comprobar que cada
fase deja el juego igual. Si una fase lo cambia, cambia también las pruebas en el mismo PR y lo apunta aquí.

Cuando el código pase a módulos (fase 2), estas variables dejan de ser globales: `window.__cl` tendrá que ofrecer
lo que hoy las pruebas leen sueltas (última tabla) o las pruebas tendrán que pasar por `__cl`.

## `window.__cl` (definido en `src/adult.js`)

| Nombre | Qué es | Usos en las pruebas |
| --- | --- | --- |
| `go(nombre, opciones)` | Cambia de escena, como `go()` del juego. `lib.js` lo sustituye al abrir por el `go` sin la envoltura 3D. | 67 |
| `S` (solo lectura del objeto, se puede modificar por dentro) | El estado guardado (ver [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)). | 56 |
| `scene` | La escena actual: sus `hint()`, `down/move/up`, `g` (juego en curso)... | 29 |
| `name` | Nombre de la escena actual (`'title'`, `'map'`, `'juego'`...). | 27 |
| `TEMAS`, `TEMA`, `SCENES` | Los temas con sus juegos, el tema por id y las escenas. | 6 |
| `tap(x, y)`, `drag(x1, y1, x2, y2)`, `hover(x, y)` | Toques en coordenadas de la pantalla lógica de 1600x900. | — |
| `T()` | Tiempo de juego en segundos. | — |
| `say`, `openAdult`, `closeAdult` | Hablar y abrir/cerrar la zona de adultos. | — |

## Lo que las pruebas leen fuera de `__cl`

| Nombre | Dónde está | Para qué |
| --- | --- | --- |
| `window.__fast` | lo ponen las pruebas | Modo rápido: `say()` no habla y acaba en 30 ms. |
| `window.__said` | lo ponen las pruebas | `say()` apunta ahí cada frase en modo rápido. |
| `window.__w3` (`ok`, `W`, `retito`, `FPS`, `pickAt`, `proj`...) | `src/world3d.js` | Saber si hay 3D y leer el mundo 3D. |
| `#adult` (elemento HTML) | `src/head.html` | Ver si la zona de adultos está abierta (`hidden`). |
| `save`, `doReset`, `go`, `sceneName`, `scene`, `S` | `core.js`, `adult.js` | Guardar, borrar todo, cambiar de escena. |
| `OX`, `OY`, `SC` | `core.js` | Pasar de la pantalla lógica 1600x900 a píxeles de la ventana (ratón de verdad). |
| `VIVO.talking` | `core.js` | Esperar a que Tito termine de hablar. |
| `VIVO.fade`, `VIVO.sessionT`, `VIVO.minuteAcc` | `core.js` | Esperar a que acabe el velo de una escena; tiempo de juego (`cobertura.js`, `limites.js`). |
| `ponGo` | `core.js` | Envolver `go` para apuntar las escenas (`camino.js`). |
| `pickVoice`, `VOICE` | `core.js` | Prueba de la elección de voz (`voces.js`). |
| `bkEncode`, `bkDecode` | `adult.js` | Copias de seguridad. |
| `VIVO.MX`, `T` | `core.js` | Posición del ratón y reloj de juego. |
| `localStorage['curiolandia-new.v1']` | `core.js` (`KEY`) | Escribir partidas de prueba antes de cargar. |
| `localStorage['curiolandia.v1']` | `core.js` (`KEY_VIEJA`) | La partida de curiolandia-3d que se copia (`guardado-viejo.js`). |
| Versión en `sw.js` (`curiolandia-new-vX`) | `package.json` (`version`) y `herramientas/vite/curiolandia.mts` | `cobertura.js` la lee para el informe. |

Cuentas sacadas con `grep` sobre `tests/` el 24 de octubre de 2026 (fase 0). En la fase 2a, `talking`, `fade`, `sessionT`,
`minuteAcc` y `MX` pasaron a `VIVO` y `camino.js` envuelve `go` con `ponGo`.
