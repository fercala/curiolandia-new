# Arquitectura de Curiolandia 3D

> **En este repo (fase 0 de la migración):** el código es el de `curiolandia-3d` (commit `dd5fc61`, v1.592) con tres
> cambios: sin voces grabadas (todo con la voz del navegador, `S.voz='nav'`), clave de guardado propia con copia única
> de la partida vieja ([ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)) y montaje a `dist/` publicado por GitHub Actions
> (apartado 14). Lo que esta guía cuenta de `voz/`, `voz-fer/` y las grabaciones describe el juego viejo.

Esta guía explica cómo está hecho el juego por dentro. Está pensada para alguien que empieza: léela de arriba abajo una vez antes de tocar código. Para los pasos concretos de "cómo añado X", ve a [COMO-AGREGAR.md](COMO-AGREGAR.md).

Otras guías:
- [COMO-AGREGAR.md](COMO-AGREGAR.md): el proceso de trabajo y recetas paso a paso.
- [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md): el estado `S` que se guarda en el móvil y cómo no romperlo.
- [CONTRATO-PRUEBAS.md](CONTRATO-PRUEBAS.md): lo que las pruebas leen del juego (`window.__cl`) y no puede cambiar de nombre.
- [PROBLEMAS-CONOCIDOS.md](PROBLEMAS-CONOCIDOS.md): fallos y rarezas que se han visto en el código y siguen sin arreglar.

---

## 1. Qué es

Curiolandia 3D es un juego web para niños de Educación Infantil (3, 4 y 5 años). Tito (un caracol; también puede ser erizo, tortuga o conejo) guía al niño por una isla con zonas por edad. Cada zona tiene un camino de **casitas**, cada casita es un **tema** (la familia, los animales, el otoño...) y dentro de cada tema hay varios **juegos** cortos. Al terminar un tema se abre un **cofre** con un regalo para Tito. Las monedas que se ganan se gastan en una **tienda**.

Características técnicas:
- **HTML + JavaScript y TypeScript**, sin frameworks. Vite monta la página: junta los módulos TypeScript en un solo `<script>` (ver «Archivos de `src/`»).
- **Three.js r128** para la capa 3D (el archivo `three.min.js` va incluido).
- **Funciona sin conexión** (es una PWA con service worker) y se puede instalar en el móvil.
- **Voz del navegador** (`speechSynthesis`) para todo lo que dice Tito; no hay voces grabadas.
- Se publica en GitHub Pages: https://fercala.github.io/curiolandia-new/

## 2. Mapa del repositorio

```
/
├── src/                EL CÓDIGO FUENTE (aquí es donde se trabaja)
├── public/             lo que se copia tal cual a la web: three.min.js (r128), fonts/, iconos
├── dist/               la web montada (no está en git; la genera `npm run build` y la publica GitHub Actions)
├── tests/              humo.js, comentarios.py y regresion/ (ver tests/regresion/LEEME.md)
├── dialogos/           catálogo de frases (todos.csv) y frases nuevas o cambiadas (pendientes.txt)
├── docs/               esta documentación y el plan de migración
├── .github/workflows/  web.yml: pruebas en cada PR y publicación desde main
├── package.json        versión, órdenes (`npm run ...`) y herramientas: Vite, TypeScript, Vitest, Playwright
├── vite.config.mts, index.html  Vite; index.html es solo la entrada, la página la monta el plugin
├── herramientas/       vite/curiolandia.mts (el montaje) y git-hooks/ (ganchos de commit)
├── CLAUDE.md           reglas cortas para trabajar con Claude Code
└── README.md           presentación del proyecto
```

### Archivos de `src/`

Desde la fase 2p de la migración todo el juego son **módulos TypeScript**: `src/modulos.ts` y lo que importa (los
dibujos de `src/dibujos/`, el núcleo de `src/nucleo/`, el vocabulario y los cuentos de `src/contenido/`, los componentes
de juego de `src/juegos/`, los temas de `src/temas/`, las escenas de `src/escenas/`, la zona de adultos, el bucle y el
arranque de `src/aplicacion/`, la capa 3D de `src/mundo3d/` y, desde la fase 3, las reglas de `src/dominio/`, los
puertos de `src/aplicacion/puertos.ts` y sus adaptadores de `src/infraestructura/`). Cada archivo importa lo que usa
(`import { S, save } from './guardado.ts'`). El plugin de Vite los junta con rolldown en un único `<script>`. Hasta la
fase 2p había además otro `<script>` con el **código global**: los `.js` que aún no eran módulos, pegados en un orden fijo.

**El orden importa**: los módulos se evalúan en el orden de los `import` de `src/modulos.ts` (y, dentro de cada carpeta,
en el de su `indice.ts`), que es el de la tabla. Un módulo que va antes no puede importar de uno que va después (sería un
ciclo de imports): lo poco que usa de él, solo al jugar o al dibujar, cuando ya está todo cargado, está declarado en
`src/tardias.d.ts` y lo encuentra por su nombre gracias al puente.

`src/modulos.ts` deja en `globalThis` todo lo que exportan los módulos (el **puente**), para esos usos tardíos y para
las pruebas (`window.__cl` y lo que leen con `page.evaluate`, ver [CONTRATO-PRUEBAS.md](CONTRATO-PRUEBAS.md)).
  - Cada nombre del puente es una propiedad de `globalThis` con `get`: se lee siempre el valor actual del módulo,
    aunque cambie (`S` tras `ponS`, `ctx` tras `ponCtx`, `T`, `scene`, `go` tras `ponGo`...).
  - **No se puede reasignar** desde fuera (`T = 3` da error: para eso están las funciones `pon*`) ni declarar otra
    global con el mismo nombre (el navegador da error al cargar). Dos módulos que exportaran el mismo nombre también
    darían error: `tests/unidad/globales.test.ts` lo comprueba antes (con `herramientas/analisis/globales.mts`).

| Orden | Archivo | Qué contiene |
|---|---|---|
| — | `head.html` | Cabecera HTML: estilos, los dos lienzos (`#gl` para el 3D y `#cv` para el 2D, encima), la carga de Three.js y los paneles HTML (nombre, reinicio, zona de adultos). |
| — | `modulos.ts` | Entrada del juego: importa los módulos en orden, deja el puente en `globalThis` y llama a `arrancar()`. |
| 0 | `infraestructura/conectar.ts`, `infraestructura/navegador.ts` y `aplicacion/puertos.ts` (`modulos.ts` importa `conectar.ts` el primero) | **Puertos Reloj, Azar y Guardado** (desde las fases 3g y 3h): el juego pide la fecha y la hora con `ahora()`, los números al azar con `azar()` y lo guardado con `leerGuardado()`, `escribirGuardado()` y `alGuardarFuera()` (`aplicacion/puertos.ts`), nunca con `new Date()`, `Date.now()`, `Math.random()` ni `localStorage`. Los adaptadores de verdad, los del navegador, están en `infraestructura/navegador.ts` (los únicos que usan `Date`, `Math.random` y `localStorage`) y `conectar.ts` los conecta antes de que se cargue nada más. Una prueba puede poner otros con `ponPuertos` (un reloj parado, un azar fijo, un guardado en memoria). Pruebas en `tests/unidad/puertos.test.ts`. |
| 1 | `dibujos/pics-base.ts`, `pics-new.ts`, `pics-a.ts` ... `pics-e.ts`, `pics-mine.ts`; `dibujos/todos.ts` | **Dibujos** (módulos). Cada dibujo es un SVG con un nombre (`'perro'`, `'manzana'`...) dentro del objeto `PICS`. `todos.ts` los carga en su orden: quien necesita `PICS` completo importa de ahí. |
| 2 | `nucleo/*.ts` (antes `core.js`) | **El núcleo** (módulos), en este orden (`nucleo/indice.ts`): `tipos` (tipos de `S`, `VIVO`, escenas...), `pantalla` (lienzo, escala, `VIVO`, reloj `T`), `utilidades` (azar, `clamp`, colores), `guardado` (`S`, `save`), `idioma` (`tx`, `V`, `LEX`, `W_`), `imagenes` (`IMG`, `pic`), `dibujo` (`card`, `circ`, `text`...), `puntero` (`hv`, `hR`, `hC`, cursores), `tito` (Tito en 2D), `sonido` (`tone`, `noise`, `SFX`, música), `escenas` (`SCENES`, `go`, `later`, partículas, `REP_ON`), `voz` (`say`, `sayQ`, voces), `monedas` (desde la fase 4b, antes en las escenas: el marcador `drawCoinHUD` e `inCoinHUD`, las monedas que vuelan y el cartel "+N" `drawCoinFx`, abonar `creditCoins`, dar `giveCoins` y gastar `spendCoins`) e `interfaz` (botón de volver, rondas, ayudas, dificultad y la moneda de cada acierto en `onRight`, `rec` para apuntar aciertos y fallos, desde la fase 4c; pegatinas, calendario). |
| 3 | `contenido/lex.ts` (antes `lex.js`) | **Vocabulario** (módulo, se carga después del núcleo): nombres de las cosas (`LEX`, `LEX2`), sonidos de animales (`SOUNDS`, `ONO`) y más cambios del español rioplatense al de España (`_tuRe`). Solo añade cosas al núcleo; no exporta nada. |
| 4 | `juegos/comps.ts`, `juegos/comps2.ts` (antes `comps.js` y `comps2.js`; `juegos/indice.ts` los junta) | **Componentes de juego** (módulos): el "motor" de cada tipo de juego (`Busca`, `Arrastra`, `Memoria`, `Cuenta`, `Secuencia`, `Tracer`, `Song`, `Story`...). |
| 5 | `temas/temas.ts`, `temas4.ts`, `temas5.ts` (antes `temas.js`, `temas4.js` y `temas5.js`; `temas/indice.ts` los junta) | **Contenido** (módulos): los temas de 3, 4 y 5 años (`T3`, `T4`, `T5`) con sus juegos. |
| 6 | `contenido/cuentos.ts` (antes `cuentos.js`; tipos en `contenido/tipos.ts`) | **Cuentos** (módulo, solo datos): los cuentos ilustrados de cada tema (`CUENTOS`), que lee `Story`. |
| 7 | `temas/extras.ts` (antes `extras.js`; va en `temas/indice.ts` después de `temas5.ts`) | **Temas extra** (módulo): canciones (`CAN`, `SONGS`), rutinas (`RUT`), trazos (`TRZ`) y días especiales (`FIESTAS`). Añade «El cuento» a los temas con cuento. |
| 8 | `temas/ingles.ts` (antes `ingles.js`; va en `temas/indice.ts` después de `extras.ts`) | **Rincón del inglés** (módulo): palabras (`EN`, tipo `PalabraEn`), temas (`ING`) y juegos `EnConocer`, `EnEscucha`, `EnGlobos` y `EnCuenta`. |
| — | `temas/hacerJuego.ts` (va en `temas/indice.ts` después de `ingles.ts`) | **La fábrica de juegos** (módulo, desde la fase 4f): `makeGame` convierte cada juego de un tema en su componente (los de inglés, el cuento, la canción y los que se arman con las palabras del tema). Antes estaba en `temas/temas.ts` y la envolvían `extras.ts` e `ingles.ts`. |
| 9 | `escenas/escenas2d.ts` (antes `scenes.js`) | **Escenas 2D** (módulo; `escenas/indice.ts` la carga la primera) originales: portada, edad, intro, asamblea, juego, álbum, dormir (el mapa, las zonas y la casita, desde la fase 4d solo en `escenas/zonas.ts`). Lista total de temas `TEMAS` y `finishGame` (terminar un juego: desde la fase 4b, una sola función, con el caso de uso `terminarJuego`). |
| — | `aplicacion/terminarJuego.ts` (la importa `escenas/escenas2d.ts`, así que se carga justo antes que ella) | **Caso de uso «terminar un juego»** (aplicación, desde la fase 4b): lo que cambia en la partida al acabar un juego (progreso del tema, último día jugado, repaso del día hecho) y lo que hay que celebrar (primera vez, tema terminado, monedas). Usa las reglas del dominio y no cambia la partida que recibe: devuelve los campos nuevos. Pruebas en `tests/unidad/terminarJuego.test.ts`. |
| 10 | `escenas/zonas.ts` (antes `zonas.js`; `escenas/indice.ts` la carga después de `escenas2d.ts`) | **Zonas y camino** (módulo). Escenas del mapa, de las zonas y de la casita (desde la fase 4d definidas solo aquí, con `suggestTema` y `stationPos`; antes reescribía una versión 1 de `escenas/escenas2d.ts`) y **reglas de apertura** (qué tema o zona está abierto). Cofre y regalos (`GIFTS`). Desde la fase 4c, también lo del repaso que se ve en el camino: la lupa del mapa (`repDue`, `repAllDone`), el paso por el repaso del botón verde (`goSeguir`) y la vuelta al repaso desde la casita. Desde la fase 4i, `stationPos` pregunta primero a la disposición de la vista (`nucleo/disposicion.ts`, nuevo: la interfaz de dónde está cada cosa en la pantalla lógica, que pone la vista 3D), y desde la 4j también `mzOf` y `casitaPos`; `goSeguir` es una función normal (el mapa la llama desde su método `seguir`). |
| — | `aplicacion/repasoDelDia.ts` (la importan `nucleo/interfaz.ts`, `escenas/zonas.ts` y `escenas/repaso.ts`) | **Caso de uso «el repaso del día»** (aplicación, desde la fase 4c): lo que se apunta de cada acierto o fallo (`apuntarResultado`: `S.stats`, `S.kg`, `S.gs`), preparar el repaso de hoy (`repasoCaducado`, `nuevoRepaso`), si toca repasar o ya está hecho (`tocaRepasar`, `repasoTerminado`) y si el botón verde pasa por el repaso (`seguirPorElRepaso`). Recibe la partida y los temas (`CATALOGO`). Pruebas en `tests/unidad/repasoDelDia.test.ts`. |
| — | `dominio/apertura.ts` (la importa `escenas/zonas.ts`, así que se carga justo antes que ella) | **Reglas de apertura** (dominio, desde la fase 3a): qué zonas, casitas, juegos y sitios del mapa están abiertos y qué casita toca. Sin dibujo y sin `S`: recibe la partida y el mapa. Pruebas en `tests/unidad/apertura.test.ts`. |
| — | `dominio/progreso.ts` (la importa `nucleo/tito.ts`, así que se carga con el núcleo) | **Reglas de progreso y premios** (dominio, desde la fase 3b): estrellas, temas terminados, casa de Tito (`HOUSE_NEXT`), Pipo (`PET_NEXT`), habitaciones, niveles de la tienda (`TIER_NEED`), regalo del cofre (`GIFTS`) y cumpleaños. Pruebas en `tests/unidad/progreso.test.ts`. |
| — | `dominio/monedas.ts` (la importa `escenas/zonas.ts`, así que se carga justo antes que ella) | **Reglas de las monedas** (dominio, desde la fase 3c): cuántas da cada cosa (`MONEDAS`), los aciertos (como mucho 5 por juego) y cómo se suman y se gastan (`ganar` y `gastar` devuelven el monedero nuevo). Pruebas en `tests/unidad/monedas.test.ts`. |
| — | `dominio/repaso.ts` (la importa `escenas/repaso.ts`, así que se carga justo antes que ella) | **Reglas del repaso diario** (dominio, desde la fase 3d): qué juegos se pueden repasar (`NOREP`), cuáles cuestan (menos del 70 % de aciertos), cuáles hace más que no se juegan, cómo se eligen los 3 del día, cuándo se rehace el repaso, cuándo está terminado y cuándo toca (`REPASO`), y los últimos 6 juegos de cada habilidad. Pruebas en `tests/unidad/repaso.test.ts`. |
| — | `dominio/dificultad.ts` (la importa `nucleo/guardado.ts`, así que se carga con el núcleo) | **Reglas de la dificultad** (dominio, desde la fase 3e): la edad que cuenta (`AGE`), cuántas opciones (`nOpts`) y rondas (`nRounds`) tiene un juego según la edad y las repeticiones (`VIVO.REP`), y la dificultad adaptativa (`VIVO.ADAPT`: sube con 4 aciertos seguidos a la primera y baja al fallar dos veces). Pruebas en `tests/unidad/dificultad.test.ts`. |
| — | `dominio/partida.ts` (la importa `nucleo/guardado.ts`, así que se carga con el núcleo) | **Versión y migraciones de la partida** (dominio, desde la fase 3f): `VERSION_PARTIDA` (la de `S.ver`), los pasos que ponen al día una partida vieja (`MIGRACIONES`) y `migrar`, que `load()` y el evento `storage` usan antes de arreglar la partida (`sanoS`, `sanoHondo`). También `esPartida` (lo usa también la copia de seguridad). Pruebas en `tests/unidad/partida.test.ts`. |
| 11 | `escenas/tienda.ts` (antes `tienda.js`; `escenas/indice.ts` la carga después de `zonas.ts`) | **Tienda y casa de Tito** (módulo). Tienda, ropa y colores de Tito, casa de Tito, vales. Añade a `S` los campos de `DEF2`. Desde la fase 4b no envuelve nada: las monedas de los juegos las dan `onRight` y `finishGame`. Tipos `Articulo` (lo que vende la tienda) y `Ranura`. |
| 12 | `escenas/repaso.ts` (antes `repaso.js`; `escenas/indice.ts` la carga después de `tienda.ts`) | **Repaso** (módulo). Estadísticas por juego y habilidad (`S.gs`, `S.kg`) y repaso diario (`S.rep`, escena `repaso`, botón de la lupa del mapa). Las reglas del repaso, en `dominio/repaso.ts`, y lo que se hace con ellas, en el caso de uso `aplicacion/repasoDelDia.ts`. Desde la fase 4c no envuelve nada: `rec` (núcleo) apunta lo de cada juego, `go` (núcleo) olvida el repaso al salir de él, y el mapa, `goSeguir` y la casita (`escenas/zonas.ts`) traen lo suyo; desde la 4b, la fecha del juego y el repaso hecho los apunta `terminarJuego`, y `REP_ON` está en el núcleo (lo pone con `ponRepOn`). |
| 13 | `aplicacion/adultos.ts` (antes `adult.js`; `modulos.ts` la carga la última, después de las escenas) | **Aplicación** (módulo): zona de adultos, copia de seguridad, **entrada (ratón/dedo/teclado), el bucle de dibujo `frame()`** y `window.__cl` para las pruebas. |
| 14 | `mundo3d/mundo3d.ts` (antes `world3d.js`; `modulos.ts` lo carga después de la aplicación; tipos en `mundo3d/tipos.ts` y `THREE` en `mundo3d/three.d.ts`) | **La capa 3D**: portada, mapa (isla), zonas, casitas, cofre, Tito y Pipo en 3D, objetos que se tocan. `mundo3d.ts` es la entrada: si hay Three.js y WebGL, monta el motor y cada escena 3D (y exporta `R3frame`). Cada parte está en su módulo de `mundo3d/` (fases 4g y 4h, ver el apartado 8): `motor.ts`, `materiales.ts`, `decorado.ts`, `cielo.ts`, `objetos.ts`, `personajes.ts`, `interaccion.ts`, `mapa3d.ts`, `zonas3d.ts`, `casita3d.ts`, `cofre3d.ts` y `portada3d.ts`. Ninguno crea nada al cargarse. |
| 15 | `aplicacion/arranque.ts` (antes `boot.js`, el último archivo global; `modulos.ts` llama a `arrancar()` al final) | **Arranque** (módulo): entrega los cofres que quedaron sin abrir, espera a las fuentes, va a la portada y empieza el bucle. |
| — | `tardias.d.ts` | Tipos de lo que un módulo usa de otro que se carga después (lo encuentra por el puente). No cambia el juego. |
| — | `icons.js` | Script aparte (Node + Playwright) para regenerar los iconos PNG. No forma parte del juego. |

**Dominio** (`src/dominio/`, desde la fase 3): las reglas del juego, en TypeScript puro. No saben nada de lienzos,
Three.js, sonido, voz ni `localStorage`, y no leen `S`: cada regla recibe lo que necesita (por ejemplo, la partida y el
mapa) y devuelve la respuesta, sin escribir nada. Las escenas las usan a través de sus funciones de siempre y Vitest las
prueba en milisegundos, con partidas inventadas (ver la arquitectura objetivo en [PLAN-MIGRACION.md](PLAN-MIGRACION.md)).
Desde la 3a están las reglas de apertura (`dominio/apertura.ts`), desde la 3b las de progreso y premios
(`dominio/progreso.ts`), desde la 3c las de las monedas (`dominio/monedas.ts`), desde la 3d las del repaso diario
(`dominio/repaso.ts`) y desde la 3e las de la dificultad (`dominio/dificultad.ts`). Desde la 3f, la partida lleva su
versión y `dominio/partida.ts` la pone al día al cargarla (migraciones).

**Casos de uso** (`src/aplicacion/`, desde la fase 4b): lo que pasa en la partida cuando el niño hace algo, en un solo
sitio. Un caso de uso junta las reglas del dominio que hacen falta, recibe la partida (en el juego, `S`) y devuelve los
campos nuevos y lo que la escena tiene que celebrar; no cambia la partida que recibe, no dibuja, no habla y no guarda.
La escena pone los campos en `S`, guarda y celebra. El primero es `terminarJuego` (`aplicacion/terminarJuego.ts`), que
usa `finishGame`; desde la 4c, el repaso del día (`aplicacion/repasoDelDia.ts`), que usan `rec`, el mapa, `goSeguir` y
la escena del repaso, con los temas en `CATALOGO` (`escenas/escenas2d.ts`). Los demás (abrir el cofre, comprar, el
regalo del día...) llegan con el resto de la fase 4. Vitest los prueba igual que el dominio
(`tests/unidad/terminarJuego.test.ts`, `tests/unidad/repasoDelDia.test.ts`).

**Puertos y adaptadores** (desde la fase 3g): lo que el juego necesita de fuera se pide a un puerto
(`aplicacion/puertos.ts`) y no al navegador directamente. Hoy son el **reloj** (`ahora()`), el **azar** (`azar()`) y, desde la 3h, el
**guardado** (`leerGuardado()`, `escribirGuardado()` y `alGuardarFuera()`, para lo que guarda otra pestaña); sus
adaptadores, los del navegador, están en `src/infraestructura/`. Así una prueba puede fijar la fecha o el azar, o
guardar en memoria, con `ponPuertos` sin navegador, y `tests/unidad/puertos.test.ts` comprueba que nadie más usa
`new Date()`, `Date.now()`, `Math.random()` ni `localStorage`. Una base de datos en la nube sería otro adaptador del
puerto Guardado.

Lo que comparten varios archivos se importa de su módulo. Por ejemplo, `S` (de `nucleo/guardado.ts`) se importa en casi todos.

**Leer sí, reasignar no.** Un módulo puede leer lo que importa y cambiar los campos de sus objetos (`S.coins++`,
`SCENES.map.draw = ...`), pero no reasignarlo: JavaScript no deja reasignar un `import` (y `npm run tipos` lo marca
como error). Para lo que varios archivos cambian hay dos vías:

- **`VIVO`** (`nucleo/pantalla.ts`): el estado de la partida en curso que no se guarda. Son el puntero (`VIVO.MX`, `VIVO.MY`,
  `VIVO.mouseOn`, `VIVO.hovNow`...), la voz (`VIVO.talking`, `VIVO.sayTok`) y la escena (`VIVO.fade`, `VIVO.timers`,
  `VIVO.idle`, `VIVO.hintSaid`, `VIVO.drag`). También el candado (`VIVO.lockHold`...), la dificultad (`VIVO.ADAPT`,
  `VIVO.REP`; sus reglas, en `dominio/dificultad.ts`), el tiempo de juego (`VIVO.sessionT`, `VIVO.restAsked`, `VIVO.minuteAcc`) y los avisos (`VIVO.toast`,
  `VIVO.coinBanner`, `VIVO.deferredInstall`). El tipo con todos los campos es `Vivo`, en `src/nucleo/tipos.ts`.
- **Funciones `pon*`** para cambiar desde otro archivo una variable entera de un módulo: `ponS` (partida nueva), `ponT` (reloj),
  `ponCtx` (lienzo de dibujo), `ponRepOn` (`REP_ON`, si se juega un juego del repaso; desde la fase 4b) y `ponGo` (núcleo; desde la fase 4k solo lo usan las pruebas, `camino.js`). Ya no hay ninguna para envolver funciones de otro: hasta la fase 4f había `ponThing` y `ponMakeGame`; hasta la 4i, `ponStationPos`, y hasta la 4j, `ponGoSeguir`, y hasta la 4k la capa 3D envolvía `go` (ahora la vista 3D pone su disposición con `ponDisposicion`, ver el apartado 8, y el mapa 3D, su método `seguir`). Dentro del núcleo hay dos más: `ponMusica` (la música
  de la escena, la usa `go`) y `ponRopaTito` (`escenas/tienda.ts` le da a `drawTito` la imagen de colores y la ropa de Tito).

## 3. La pantalla lógica de 1600x900

Todo el juego trabaja en una pantalla imaginaria de **1600 x 900 píxeles**. `nucleo/pantalla.ts` escala el lienzo al tamaño real de la ventana y `aplicacion/adultos.ts` convierte cada toque a esas coordenadas (`toLogical`). Así nunca tienes que pensar en el tamaño del móvil: si dibujas algo en `x=800, y=450`, siempre sale en el centro.

## 4. El bucle principal (`frame` en `aplicacion/adultos.ts`)

Cada cuadro (unas 60 veces por segundo) `frame()` hace, en este orden:

1. Calcula `dt` (segundos desde el cuadro anterior, máximo 0,05) y avanza el reloj global `T`.
2. Ejecuta los temporizadores de `later()` que tocan (solo los de la escena actual).
3. Comprueba el candado de adultos (mantener pulsado 3 s abajo a la derecha) y el límite de tiempo de juego (`S.limit`, que lleva a la escena `dormir`).
4. Música (`musicTick`) y `scene.update(dt)`.
5. **Si la escena es 3D** (`scene.three`), llama a `R3frame(dt)` de `mundo3d/mundo3d.ts`, que anima y pinta el 3D en `#gl`.
6. `scene.draw()` pinta lo 2D en `#cv` (encima del 3D), y luego la ayuda (`drawHelp`), las partículas (`drawParts`), avisos y monedas.
   La ayuda automática se rige por `VIVO.idle`, los segundos sin tocar: brillo a los 6 s, manita y `prompt()` a los 11 s. `VIVO.idle` no avanza mientras Tito habla y vuelve a 0 con cada `say()`, así la ayuda nunca corta una frase (desde v1.586). Por lo mismo, las frases que el juego dice solo con `later()` usan `sayQ()` en vez de `say()`: esperan a que Tito acabe la frase que esté diciendo (`whenQuiet()`). Un juego que quiere la ayuda enseguida (tras el segundo fallo) pone `idle=12` **después** de su `say()`: la manita sale ya y la consigna se repite cuando Tito acaba.

Los toques llegan por eventos del navegador: `pointerdown` → `scene.down(x,y)`, `pointermove` → `scene.move`, `pointerup` → `scene.up`. La tecla Escape equivale a tocar el botón de la casa.

## 5. Escenas

Una **escena** es una pantalla del juego. Todas viven en el objeto `SCENES` (`nucleo/escenas.ts`):

```js
SCENES.miEscena = {
  music: 'jardin',          // música de fondo (o null)
  enter(o) { ... },         // se llama al entrar; o = datos del viaje ({t: idTema, g: nJuego, hello: true...})
  update(dt) { ... },       // opcional: animación por tiempo
  draw() { ... },           // obligatorio: pinta la pantalla
  down(x, y) { ... },       // toque (también move/up para arrastrar)
  hint() { return {x, y, r} }, // dónde brilla la ayuda si el niño no toca nada
  prompt() { say('...') },  // repite la consigna (al tocar a Tito, y una vez con la manita de ayuda)
  dwell(id) { ... },        // el ratón se queda quieto sobre algo: decir su nombre
  three: true,              // solo las escenas 3D (lo ponen las funciones montar* de mundo3d/)
};
```

Para cambiar de escena se llama a `go('nombre', {datos})`. `go` cancela los temporizadores (`later`), las partículas y la voz de la escena anterior, y llama a `enter`. **Usa siempre `later(ms, fn)` en vez de `setTimeout`**: así, si el niño se va de la escena, lo programado no se ejecuta en la siguiente.

### Las escenas que hay

| Escena | Archivo | Qué es |
|---|---|---|
| `title` | escenas/escenas2d.ts (+3D) | Portada |
| `edad`, `quien`, `intro` | escenas/escenas2d.ts | Elegir edad, nombre y cuento de bienvenida (solo la primera vez) |
| `map` | escenas/zonas.ts (+3D) | La isla con todos los lugares |
| `jardin`, `bosque`, `montana`, `fiestas`, `ingles` | escenas/zonas.ts (+3D) | Zonas con su camino de casitas (se crean con `zoneScene(z)`) |
| `casita` | escenas/zonas.ts (+3D) | Dentro de un tema: las estaciones de juego |
| `juego` | escenas/escenas2d.ts | Ejecuta un juego (un componente de juegos/) |
| `cofre` | escenas/zonas.ts (+3D) | Recompensa al terminar un tema |
| `asamblea` | escenas/escenas2d.ts | La rutina diaria (día, tiempo, emociones, cumpleaños) |
| `tienda`, `casaTito` | escenas/tienda.ts | Tienda (con páginas) y casa de Tito (2D) con siete habitaciones (`ROOMS`) que se abren con las casitas terminadas |
| `album` | escenas/escenas2d.ts | Álbum de pegatinas |
| `repaso` | escenas/repaso.ts | Repaso diario |
| `dormir` | escenas/escenas2d.ts | Fin del tiempo de juego |

### Capas: cómo se "reescriben" las escenas

El juego empezó en 2D y creció por capas. Cada archivo posterior **envolvía** métodos de escenas anteriores en lugar de reescribirlas desde cero. La fase 4 las ha juntado (cada escena y cada función, definida una sola vez): desde la fase 4k ya no queda ninguna capa que envuelva (la última fue la capa 3D, `mundo3d/`). Era este patrón, que **ya no se usa**: no lo vuelvas a escribir.

```js
// Patrón para envolver un método sin perder el original
{ const A = SCENES.map, enter0 = A.enter;
  A.enter = function (o) { enter0.call(this, o); /* lo nuevo */ }; }

// Patrón para envolver una función de otro módulo: con su pon* (ver «Leer sí, reasignar no»)
{ const g0 = go;
  ponGo(function (n, o) { /* lo nuevo */ return g0(n, o); }); }
```

- Desde la fase 4d, el mapa, las zonas y la casita se definen una sola vez, en `escenas/zonas.ts` (antes `escenas/escenas2d.ts` tenía una versión 1 que `zonas.ts` reescribía y que ya no se usaba). Desde la fase 4e, la asamblea (con el paso de cumpleaños y las monedas del día) y `GNAME` también están enteros en `escenas/escenas2d.ts` (antes `zonas.ts` los completaba): ya ningún archivo de escenas envuelve a otro.
- Desde la fase 4c, `escenas/repaso.ts` ya no envuelve nada (antes `rec`, `go`, `goSeguir`, la casita y el mapa: ahora cada uno trae lo suyo del repaso, con el caso de uso `repasoDelDia`). Desde la fase 4b, terminar un juego ya no se envuelve: `finishGame` (`escenas/escenas2d.ts`) es una sola función, con su caso de uso `terminarJuego`, y la moneda de cada acierto la da `onRight` (núcleo); `escenas/tienda.ts` ya no envuelve nada.
- Desde las fases 4i (`title`, `cofre` y `casita`) y 4j (`map` y las zonas), la capa 3D ya no envuelve escenas: pone en `SCENES` otra escena hecha a partir de la 2D, que queda sin tocar (ver el apartado 8). Desde la 4k tampoco envuelve `go`: ya no envuelve nada.

**Consecuencia práctica**: las escenas del mapa, las zonas, la casita, el cofre y la portada tienen dos implementaciones, la 2D (`escenas/`) y la 3D (`mundo3d/`): un cambio en su lógica se hace en la 2D (la 3D la llama), y uno en cómo se ven o se tocan, en las dos.

## 6. El flujo del niño

1. **Portada** → la primera vez: **edad** → **¿quién juega?** (nombre) → **intro**. Después, directamente al **mapa**.
2. **Mapa**: si no ha hecho la asamblea hoy, el botón verde "seguir" lleva a la **asamblea**; si ya la hizo, lleva a la casita del siguiente tema (`nextTema()`). También puede tocar una zona, la tienda, la casa de Tito o el álbum.
3. **Zona**: camino de casitas. Solo se abre la siguiente cuando se termina la anterior.
4. **Casita** (tema): estaciones de juego; también se abren en orden.
5. **Juego**: `SCENES.juego` crea el componente con `makeGame(...)`. Al terminar, `finishGame` suma la estrella, da monedas y vuelve a la casita (lo que cambia en `S` lo decide el caso de uso `terminarJuego`).
6. Cuando se terminan todos los juegos del tema → **cofre** (regalo de `GIFTS`, pegatina y monedas) → vuelta a la zona con la siguiente casita abierta.

Las reglas de apertura están, desde la fase 3a, en `dominio/apertura.ts` (`zonaAbierta`, `temaAbierto`, `juegoAbierto`, `sitioAbierto`, `temaQueToca`, `siguienteTema`, `NEED`, `ZAGE`), con sus pruebas en `tests/unidad/apertura.test.ts`. `escenas/zonas.ts` les pasa la partida de verdad (`PARTIDA`: `S`, la edad y la fecha) y el mapa (`MAPA`, de `ZONES`) y conserva los nombres de antes (`zoneOpen`, `temaOpen`, `gameOpen`, `spotOpen`, `curTema`, `nextTema`...), que son los que usan las escenas y la capa 3D. En la zona de adultos se puede poner el **modo libre** (`S.unlockAll`), que lo abre todo.

## 7. Temas y juegos

Un **tema** es un objeto en `T3`, `T4`, `T5` (o `CAN`, `RUT`, `TRZ`, `FIESTAS`, `ING`):

```js
{ id: '3A-T1',            // identificador ÚNICO; el progreso se guarda con él (¡no cambiarlo nunca!)
  n: 'Mi escuela',        // nombre que se ve
  icon: 'escuela',        // dibujo de la casita (clave de PICS)
  c: '#5CC16A',           // color
  bg: BG.aula,            // fondo de los juegos
  words: [...],           // palabras/dibujos del tema (para los juegos genéricos)
  games: [                // juegos, en orden (el progreso se guarda por posición)
    { t: 'conocer' },                         // juego genérico con las palabras del tema
    { t: 'busca' },
    { t: 'orden', icon: 'mochila', name: 'Ordena la clase',
      make: (d, t) => Arrastra({ ... , bg: t.bg }, d) },  // juego con configuración propia
  ] }
```

`makeGame(juego, tema, alAcabar)` (temas/hacerJuego.ts, desde la fase 4f; antes en temas/temas.ts, ampliado por temas/extras.ts y temas/ingles.ts) convierte cada entrada de `games` en un componente de juego.

Un **componente de juego** (juegos/comps.ts, juegos/comps2.ts) es una función que recibe una configuración y devuelve un objeto con `enter`, `draw`, `down/move/up`, `hint`, `prompt`, `total` y `done`. Cuando el niño termina, llama a `onDone()`. La lista completa de componentes y su configuración está en la cabecera de `juegos/comps.ts` y en [COMO-AGREGAR.md](COMO-AGREGAR.md#5-un-juego-nuevo-dentro-de-un-tema).

Los **dibujos** se buscan por nombre en `PICS` y se pintan con `pic(nombre, x, y, tamaño)`. Su nombre hablado sale de `LEX`/`LEX2` (`nucleo/idioma.ts` y `contenido/lex.ts`).

## 8. La capa 3D (`mundo3d/`)

Es la parte más grande y la más delicada (antes era un solo archivo, `world3d.js`; desde la fase 2o, un módulo con tipos estrictos, `mundo3d/mundo3d.ts`, y desde las fases 4g y 4h, partida en módulos). La idea clave:

> **La lógica del juego sigue siendo 2D.** El 3D solo dibuja y, en cada cuadro, "le cuenta" a la lógica 2D dónde ha quedado cada cosa en la pantalla.

### Cómo engancha con lo 2D

1. Al montar la capa 3D, cada módulo de escena (`montarPortada3D`, `montarMapa3D`, `montarZonas3D`, `montarCasita3D`, `montarCofre3D`) pone la versión 3D de su escena (`title`, `map`, las 5 zonas, `casita` y `cofre`). Desde la fase 4i, la portada, el cofre y la casita son **dos implementaciones**: la escena 2D (`escenas/`) queda sin tocar y la 3D es otra escena, `SCENES.x = {...x2D, three: true, enter, sync, draw, down}`, que copia de la 2D la lógica que no cambia (`prompt`, `hint`, `reward`...) y llama a sus métodos por su nombre (`cofre2D.down.call(this, x, y)`) cuando hace falta la lógica de siempre. Si no hay WebGL, en `SCENES` siguen las 2D. Desde la fase 4j, el mapa y las zonas también (antes se envolvían con `Object.assign(SCENES.x, {three: true, ...})`, guardando sus métodos originales, `enter0` y `down0`). Lo que el 3D hace distinto y antes envolvía otra función va en un método de la escena: el botón verde del mapa llama a `this.seguir()`, que en 2D es `goSeguir()` y en 3D hace caminar a Tito antes.
2. **`enter`** llama al `enter` de la escena 2D y construye el mundo 3D (`buildMap`, `buildZone`, `buildCasita`, `buildCofre`, `buildTitle`), y lo activa con `setWorld(w)`.
3. **Cada cuadro**, `sync()` **proyecta** las posiciones 3D a la pantalla lógica de 1600x900 (`proj`, `projR`, `projO`) y la lógica 2D la usa. Así los `down`, `hint` y bocadillos originales siguen funcionando sin saber que hay 3D. Desde las fases 4i y 4j, la proyección es una **interfaz explícita**, `Disposicion` (`nucleo/disposicion.ts`: dónde está cada cosa en la pantalla lógica). Cada parte de la vista 3D pone la suya al montarse (`ponDisposicion`, que las junta) con lo último que ha proyectado `sync`, y la lógica le pregunta antes de usar la posición 2D: `stationPos` (los puestos de la casita), `mzOf` (los sitios del mapa; `MZ2` guarda solo los 2D) y `casitaPos` (las casitas de cada zona; `ZPOS` guarda solo las 2D). Como lo proyectado cambia de un cuadro a otro (la cámara se mueve), se pregunta en el momento de usarlo: por ejemplo, al llegar Tito a una casita, no al tocarla. Desde la fase 4k también Tito (`titoPos`, que usa `inTito`; `TITO` guarda solo el 2D) y su casa en el mapa (`casaPos`; `HOUSE_AT` guarda solo la 2D), que la disposición solo da mientras la escena es 3D: así, al ir a una escena 2D, vuelven solos los valores 2D, sin envolver `go`.
4. **Al tocar** (`down`): `pickAt(x,y)` lanza un rayo desde la cámara (raycast) y mira qué objeto 3D hay debajo. Si es un lugar o una casita, Tito camina hasta allí (`walkTo`) y al llegar se llama al `down` 2D original (`call0`; mientras dura, la disposición pone a Tito y su casa fuera de la pantalla, porque esos toques ya los ha mirado el rayo). Pipo tiene su propia acción, `tocarPipo` (desde la fase 4k), que el mapa 3D llama directamente. Si no es nada importante, se prueba con los objetos decorativos (`flyTap`, `wobTap`), el cielo (`skyTap`), el mar (`seaTap`) y, si no, Tito pasea hasta ese punto (`walkGround`).
5. `R3frame(dt)` (llamado desde `frame()` de aplicacion/adultos.ts) ejecuta las animaciones del mundo (`w.upd`), mueve la cámara y pinta con el renderer `R`.

Desde la fase 4g el motor está en `mundo3d/motor.ts` (`R`, `W3`, `newWorld`, `setWorld`, `proj`, `pickAt`...) y los materiales y piezas en `mundo3d/materiales.ts` (`M`, `mk`, `grp`, `canvasTex`...). Ninguno de los dos crea nada al cargarse: `montarMotor()` crea el dibujante y lo demás al montar el 3D, y devuelve `false` si no hay Three.js o WebGL. Para comprobar sin navegador que un cambio no altera el 3D, el mundo 3D se puede construir en Node con el Three.js de verdad y un dibujante de mentira (ver `docs/CAMBIOS.md`, fase 4g).

Desde la fase 4h, lo demás también está en su módulo. `mundo3d/mundo3d.ts` solo es la entrada: llama a `montarMotor()` y, si hay 3D, crea `R3frame` y llama a las funciones `montar*` en este orden:

| Módulo | Qué tiene | Al montar |
|---|---|---|
| `decorado.ts` | flores, árboles, arbustos, piedras, candados, flechas, aros, cintas y caminos (`bez`), mariposas, gaviotas, luciérnagas, estrellas, lo que cae (`fallPts`) | — |
| `cielo.ts` | `skyNow` (día y noche), la voz del paisaje (`say3`, `sayNum`, `NAMES3`, `SYL3`, `sylClap`), el cielo que se toca (`skyTap`, Júpiter, Saturno, el Carro, el sol y la luna con cara, el águila, el trineo, pájaros y nubes) | — |
| `objetos.ts` | los animales y cosas tocables de las zonas (`frog3`, `kite3`, `cann3`...: su patrón está explicado antes de `cann3`), las fechas (`xmasNow`, `summerNow`...), `hitS`, `allTap`, `chainWob` | — |
| `personajes.ts` | Tito (`makeTito`), Pipo (`makePipo`) y la casa de Tito (`makeHouse`), y lo que pasa al tocar a Tito | — |
| `interaccion.ts` | caminar (`walkTo`, `walkTick`, `walkGround`), tocar objetos (`WOBK`, `wobInit`, `wobTap`, `flyTap`, `seaTap`) y el puente con lo 2D (`titoRect`, `ponCasaP`, `call0`); `retito` | `montarInteraccion`: la disposición de Tito y su casa y `window.__w3` |
| `mapa3d.ts` | la isla (`sea3`, `island3`, `SPOT3`, `buildMap`) | `montarMapa3D`: su disposición (los sitios proyectados, `MZP`) y el mapa 3D en `SCENES.map`, con su `seguir` |
| `zonas3d.ts` | las zonas (`casita3`, `roadPts`, `zoneDecor`, `buildZone`) | `montarZonas3D`: su disposición (las casitas proyectadas, `ZP3`) y las 5 zonas 3D en `SCENES` |
| `casita3d.ts` | la casita de un tema (`st3Pos`, `st3Tito`, `buildCasita`) | `montarCasita3D`: su disposición (los puestos proyectados) y la casita 3D en `SCENES.casita` (Tito aparece en el último juego, `ultimoJuego` de `escenas/escenas2d.ts`) |
| `cofre3d.ts` | el cofre (`buildCofre`) | `montarCofre3D`: el cofre 3D en `SCENES.cofre` |
| `portada3d.ts` | la portada (`buildTitle`) | `montarPortada3D`: la portada 3D en `SCENES.title` |

Los módulos se importan entre sí (por ejemplo, `interaccion.ts` usa los objetos de `objetos.ts` y estos, `say3` de `cielo.ts`): no pasa nada porque al cargarse solo definen funciones y datos, y todo lo de Three.js se crea dentro de las funciones (`fhit()`, el material invisible de los toques, y el rayo del rastro de Tito se crean la primera vez que se usan).

Si el navegador no tiene WebGL, el juego funciona igual en 2D.

### El mundo `w`

`newWorld()` crea un objeto mundo; el activo se guarda en `W3` (en el código suele llamarse `w`). Su tipo, `Mundo`,
está en `mundo3d/tipos.ts` con todos sus campos (también los que añaden los juegos del cielo y del paisaje), junto a
las opciones de las piezas (`OpcionesPieza` de `mk`, `OpcionesSprite`...) y `Nodo`, el objeto cualquiera que sale al
recorrer la escena (`traverse`). Los tipos de Three.js son los de `@types/three` 0.128 (`import type * as Tres from 'three'`).


| Campo | Qué es |
|---|---|
| `w.sc`, `w.cam` | la escena y la cámara de Three.js |
| `w.kind` | `'title'`, `'map'`, `'zone'`, `'casita'` o `'cofre'` |
| `w.upd` | lista de funciones `(dt) => {}` que se llaman cada cuadro (animaciones) |
| `w.pick` | objetos que `pickAt` puede devolver (lugares, casitas, estaciones; con `userData.id`) |
| `w.trees` | objetos decorativos que reaccionan al tocarlos (los rellena `wobInit`) |
| `w.tito` | Tito en 3D |
| `w.walk` | el paseo de Tito en curso |
| `w.spots`, `w.cas`, `w.st`, `w.chest` | lugares del mapa, casitas de la zona, estaciones de la casita, cofre |

### Objetos 3D que se tocan

Todos siguen el mismo patrón (funciones `xxx3(w, x, z, escala)`: `frog3`, `kite3`, `can3`...):

1. Se crea un grupo con `grp(...)` y piezas con `mk(geometría, color, opciones)`.
2. Se marca con `g.userData.<tipo> = 1` y, si hace falta, `g.userData.dur` (duración de la animación).
3. Su animación se añade a `w.upd`: mira `g.userData.wob` (el instante en que se tocó) y anima durante `dur` segundos.
4. La marca se añade a `WOBK` (`mundo3d/interaccion.ts`) para que `wobInit` lo meta en `w.trees` y se pueda tocar.
5. En `wobTap` (también en `interaccion.ts`) hay una rama `else if (u.<tipo>) {...}` con su sonido, partículas y frase.
6. Si Tito debe decir su nombre, va en `NAMES3` (frase grabada, palabra escrita) y sus sílabas en `SYL3` (los dos en `mundo3d/cielo.ts`).

Los objetos están en `mundo3d/objetos.ts` (y los de decoración más sencillos, en `mundo3d/decorado.ts`).

La receta completa está en [COMO-AGREGAR.md](COMO-AGREGAR.md#3-un-objeto-3d-nuevo-que-se-pueda-tocar).

### Ayudantes de geometría y rendimiento

- `M(color)` material "toon" (sombreado de dibujos animados); `mk` añade un **contorno** marrón con la técnica del casco invertido (`OLm`, `olGeo`).
- `gcache(clave, f)` guarda geometrías repetidas para no recrearlas; `mg` fusiona piezas de un mismo color en una sola geometría (menos llamadas de dibujo).
- `canvasTex` crea texturas dibujando con las funciones 2D (`card`, `text`...).
- `PRK` y `fpsTick` bajan la resolución si el móvil va lento; las piezas pequeñas no proyectan sombra.
- `disposeWorld` libera geometrías y texturas al cambiar de escena (evita que la memoria crezca).

### Día, noche y estaciones

`skyNow()` (`mundo3d/cielo.ts`) decide el cielo por la hora del dispositivo: noche de 20 h a 7 h, atardecer de 18 h a 20 h, amanecer hasta las 9 h. De noche salen la luna, estrellas, Júpiter, Saturno, búho, luciérnagas, y los animales duermen. Hay decoración por época: `summerNow()` (sombrilla y castillo de arena), `hallowNow()` (calabazas), Navidad, etc.

## 9. Estado guardado `S`

`S` es un objeto con todo el progreso. Se guarda con `save()` en el puerto Guardado (en el navegador, `localStorage`; desde la fase 3h) (no hay guardado automático: hay que llamar a `save()` después de cambiarlo). **Hay partidas guardadas en móviles reales**, así que nunca se puede cambiar el formato de un campo existente sin una migración (desde la fase 3f, `S.ver` y `dominio/partida.ts`). Todos los campos y las reglas están en [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md).

## 10. Voz e idioma

- `say(texto, alAcabar)` hace hablar a Tito con la **voz del navegador** (`speechSynthesis`). La voz es la elegida en la zona de adultos (`S.vozNav`) o la más natural del país (`pickVoice`, `vozCalidad` en `nucleo/voz.ts`). El código de las voces grabadas (`vozLoad`, `vozFile`, `vozSeq`...) sigue en `nucleo/voz.ts` pero no se usa, porque `S.voz` es siempre `'nav'`; se quita en la migración.
- Muchos textos del código están escritos en **español rioplatense** ("Tocá", "Buscá") porque el juego nació así; `tx()` los convierte al **castellano de España** cuando la variante es España (`S.variant='es'`). `V(['rioplatense', 'España'])` elige entre dos versiones cuando el cambio es grande.
- Las frases nuevas o cambiadas se escriben en castellano de España y se apuntan en `dialogos/` (ver [dialogos/LEEME.md](../dialogos/LEEME.md)).

## 11. Sonido, música y partículas

- `tone(frecuencia, duración, tipo, volumen, deslizamiento, retraso)` y `noise(...)` generan efectos con Web Audio (no hay archivos de sonido, salvo la voz). `SFX.good()`, `SFX.bad()`, `SFX.tap()` son los habituales. Los sonidos de animales están en `SOUNDS`.
- La música es generativa: `MUSIC[clave]` define una escala y un tempo; cada escena elige la suya con `music`.
- Partículas 2D: `parts.push({x, y, vx, vy, life, c, r, k, ...})`; `k` es el tipo (`'s'` estrella, `'c'` confeti, `'d'` punto, `'h'` corazón, `'o'` onda, `'n'` nota, `'t'` texto, `'z'` zeta de dormir). Atajos: `burst(x,y,n)`, `sparkles(x,y)`.

## 12. Recompensas

- **Estrellas**: una por juego terminado (`S.temas[id].g`). Se ven en las casitas. Las reglas de esta lista (estrellas,
  flores, casa, Pipo, cofre, habitaciones y niveles de la tienda) están en `dominio/progreso.ts` desde la fase 3b.
- **Flores**: una por tema terminado. Abren zonas (6 flores en una zona despiertan la siguiente) y hacen crecer la casa de Tito (`HOUSE_NEXT`).
- **Monedas** (`S.coins`): 1 por acierto a la primera (máx. 5 por juego), 3 al terminar un juego (2 si se repite), regalos diarios y del cofre. Se gastan en la tienda. Cuántas da cada cosa está en `MONEDAS` (`dominio/monedas.ts`, desde la fase 3c); la animación, en `nucleo/monedas.ts` (desde la fase 4a en su propio módulo y desde la 4b en el núcleo).
- **Cofre**: al terminar un tema, el siguiente regalo de `GIFTS` (lista fija en dominio/progreso.ts).
- **Pipo**: la mascota crece con las estrellas (`PET_NEXT`).
- **Vales**: premios reales que configura la familia en la zona de adultos.
- Diseño: nada de cajas sorpresa aleatorias ni rachas que se pierden; el tiempo de juego lo limita la familia.

## 13. Zona de adultos

Se abre manteniendo pulsado 3 segundos el candado de abajo a la derecha (`openAdult` en aplicacion/adultos.ts). Es un panel HTML (no canvas) con: modo de juego (camino o libre), edad, nombre, cumpleaños, idioma y voz, volumen, límite de tiempo, animal de Tito, paisaje (que Tito comente o no), vales, estadísticas, copia de seguridad y borrar progreso.

## 14. Montar y publicar

```
src/head.html + src/modulos.ts (rolldown) + public/ ──Vite + herramientas/vite/curiolandia.mts──> dist/
  (index.html, sw.js, manifest.webmanifest, three.min.js, fuentes, iconos)
main ──GitHub Actions (.github/workflows/web.yml)──> pruebas ──> dist/ en GitHub Pages
```

`npm run build` hace el primer paso; `npm run dev` sirve lo mismo sin service worker y recarga al guardar. Nadie copia archivos a mano ni los sube montados: al fusionar en `main`,
el workflow monta, prueba y publica.

`version` en `package.json` da el nombre de la caché del service worker (`curiolandia-new-v<versión>`): **hay que subirlo en cada publicación** o los móviles seguirán con la versión anterior. Los pasos exactos están en [COMO-AGREGAR.md](COMO-AGREGAR.md#1-el-proceso-de-trabajo).

## 15. Pruebas

No hay tests unitarios. Se prueba de dos maneras:
- **A mano**: abrir el juego con un servidor local (`python3 -m http.server`) y jugar.
- **Automática**: `node tests/humo.js dist` abre el juego en un navegador sin ventana, recorre las escenas de día y de noche, guarda capturas en `tests/capturas/` y falla si hay errores de JavaScript. Las pruebas de regresión de `tests/regresion/` juegan como un niño; en cada PR, GitHub Actions pasa `npm run test:pr` (ver [CONTRATO-PRUEBAS.md](CONTRATO-PRUEBAS.md) y [LINEA-BASE.md](LINEA-BASE.md)).

Para pruebas desde la consola del navegador, el juego expone `window.__cl` (escenas, `go`, `S`...) y `window.__w3` (mundo 3D, `pickAt`, `proj`). Con `window.__fast = 1` la voz no espera al audio, y `window.__said` guarda lo que va diciendo Tito.
