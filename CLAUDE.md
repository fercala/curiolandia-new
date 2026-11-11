# Curiolandia (nueva)

Migración de Curiolandia 3D (juego de temas de Educación Infantil, 3 a 5 años, con Tito como guía) a TypeScript + Vite
con arquitectura limpia. Se habla y se documenta en castellano.

Codex también colabora en desarrollo, pruebas, documentación y revisión de PR desde el 10 de noviembre de 2026.
La entrada es [AGENTS.md](AGENTS.md) y su guía [CODEX.md](CODEX.md); el protocolo compartido está en
[docs/COLABORACION-CODEX.md](docs/COLABORACION-CODEX.md). Los planes y las reglas del juego son los mismos para ambos.
Al cambiar una regla compartida, mantener coherentes esas entradas y la política de documentación; el resumen de fases sigue aquí y en sus planes.

## Antes de nada
- **Estado: fase 4 (escenas sin capas) terminada el 26 de octubre de 2026; fase 5 (contenido como datos) en marcha.** Las fases 0 y 1 están publicadas.
  Desde la 2p todo el juego son módulos TypeScript (`src/modulos.ts` y lo que importa: los dibujos de `src/dibujos/`,
  el núcleo de `src/nucleo/`, antes `core.js`, `src/contenido/`, `src/juegos/`, `src/temas/`, las escenas de
  `src/escenas/`, `src/aplicacion/` y la capa 3D de `src/mundo3d/`, antes `world3d.js`): ya no queda código global. Lo
  que varios archivos cambian va en `VIVO` o se cambia con las funciones `pon*`. El puente deja lo de los módulos en
  `globalThis` siempre al día y de solo lectura, para las pruebas. Desde la fase 3, las
  reglas del juego (apertura, progreso y premios, monedas, repaso diario, dificultad, y la versión y las migraciones de
  la partida, `S.ver`) están en `src/dominio/`, sin dibujo ni `S`, con pruebas de Vitest; y la hora, el azar y lo
  guardado se piden a sus puertos (`ahora()`, `azar()`, `leerGuardado()`... en `src/aplicacion/puertos.ts`), con los
  adaptadores del navegador en `src/infraestructura/`. **Fase 4 (escenas sin capas y casos de uso), terminada**
  ([docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md) tiene sus partes, y las de la fase 5): desde la 4a las monedas en pantalla tienen su módulo (desde
  la 4b, `src/nucleo/monedas.ts`) y `STARS` e `inR` están en el núcleo; desde la 4b, terminar un juego (`finishGame`) es
  una sola función con su caso de uso, `src/aplicacion/terminarJuego.ts`, el primero de `src/aplicacion/`, y desde la
  4c el repaso del día no envuelve nada (caso de uso `src/aplicacion/repasoDelDia.ts`); desde la 4d, el mapa, las zonas y
  la casita se definen una sola vez, en `src/escenas/zonas.ts`, y desde la 4e la asamblea (con el cumpleaños), en
  `src/escenas/escenas2d.ts`; desde la 4f, `makeGame` (`src/temas/hacerJuego.ts`) y `thing` no se envuelven: solo envuelve
  la capa 3D; desde la 4g y la 4h, la capa 3D está partida en módulos (`src/mundo3d/`: el motor, las piezas, la decoración, el
  cielo, los objetos, los personajes, la interacción y un módulo por escena 3D; `mundo3d.ts` solo la monta). El código es el de `curiolandia-3d` (commit `dd5fc61`, v1.592) sin voces grabadas;
  [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) explica cómo funciona.
- Lee [docs/PLAN-MIGRACION.md](docs/PLAN-MIGRACION.md): decisiones, arquitectura objetivo, fases y riesgos.
- **Isla de las Letras** (aprender a leer, 3 a 5 años): plan aprobado y fases en [docs/PLAN-LECTURA.md](docs/PLAN-LECTURA.md). Completa: fases L1 a L7, hasta la v0.2.69.
- **Isla del Inglés** (sustituye al Rincón del inglés, 3 a 5 años, con Polly la lorita): plan aprobado el 2 de noviembre de 2026 y fases en [docs/PLAN-INGLES.md](docs/PLAN-INGLES.md). Completa: fases I1 a I7, hasta la v0.2.78. Las casitas del rincón (`EN-HELLO`...) pasan a la isla con su id: no se pierde el progreso.
- **Casa de Tito interactiva y mascotas que crecen**: plan aprobado el 2 de noviembre de 2026 y fases en [docs/PLAN-CASA.md](docs/PLAN-CASA.md). Hechas: C1 (reglas en `src/dominio/casa.ts`, partida versión 4) C2 (Tito anda por la casa y juega con cada objeto, `src/escenas/casaReacciones.ts`) C3 (escenas del telescopio y del globo terráqueo), C4 (instrumentos, pizarra y tele), C5 (merienda, sopa, baño, buenas noches y huerto), C6 (mascotas que crecen, `src/escenas/casaMascotas.ts`) y C7 (combinaciones, álbum «Sorpresas de la casa» y zona de adultos): plan completo, hasta la v0.2.87.
- **Zona de adultos (menú de los padres) reorganizada**: plan aprobado el 8 de noviembre de 2026 (lo recomendado) y fases en [docs/PLAN-MENU-ADULTOS.md](docs/PLAN-MENU-ADULTOS.md). Plan completo: A1 (7 categorías en `src/aplicacion/adultos/`, `openAdult(pagina?)`, prueba `tests/regresion/adultos.js`, v0.2.100) y A2 a A6 (Resumen con avisos, progreso compacto, textos, accesibilidad y el aviso de copia con `S.bkFecha`; reglas en `src/dominio/zonaAdultos.ts`; v0.2.101).
- **Mejora integral de la casa de Tito** (baúl y sitios, objetos que responden, casa en 3D): plan aprobado el 7 de noviembre de 2026 (todo lo recomendado) y fases en [docs/PLAN-CASA-MEJORA.md](docs/PLAN-CASA-MEJORA.md). Hechas: M1 (sitios en `src/dominio/casaSitios.ts`, partida versión 5, la casa en `src/escenas/casa.ts`), M0 (casa 3D de prueba, `src/mundo3d/casa3d.ts`; falta la medida de FPS en el móvil de Fernando) M2 (el baúl y la casa ordenada: `src/aplicacion/casa.ts`, `src/escenas/casaBaul.ts`, v0.2.99) M3a (toques directos y estados guardados: `src/dominio/casaToques.ts`, `src/escenas/casaToques.ts`, v0.2.112) y M3b (formas de jugar de Tito con `VARIANTES` en `src/dominio/casa.ts`, arrastrar a Tito, pistas de pareja, 13 combinaciones más y el cuadro; v0.2.125) y M6 en 2D (un día con Tito: la casa según la hora, las rutinas del día con su pegatina y el reloj; `src/dominio/casaDia.ts`, `S.casaDia`; v0.2.129); siguen M4 y M5 (casa 3D) si los FPS de la casa 3D de prueba en el móvil de Fernando son buenos.
- **Banco de ideas para la siguiente etapa** (excursiones del cole como la granja escuela, patio y juegos de moverse, más 3D, juegos más largos): Fernando aprobó todas (8 de noviembre de 2026), de una en una, en el orden de [docs/IDEAS-MEJORA.md](docs/IDEAS-MEJORA.md) (apartado 12). Hecha: P1 (el cole en el mapa, su patio y «¡Estatuas!»: `src/escenas/cole.ts`, `patio.ts`, `estatuas.ts`, reglas en `src/dominio/cole.ts`, `S.cole`; v0.2.102) y P2 («Tito dice»: `src/escenas/titoDice.ts`, reglas en `src/dominio/titoDice.ts`; lo común del patio en `src/escenas/patioComun.ts`; v0.2.103) y P3 (yoga de los animales y pausa activa a los 20 minutos: `src/escenas/yoga.ts`, reglas en `src/dominio/yoga.ts`; v0.2.104) y P4 (retos en casa y opción de quitar los juegos de moverse: `src/escenas/retos.ts`, reglas en `src/dominio/retos.ts`, `S.retos`, `S.sinMoverse`; v0.2.105) y P5 (el autobús del cole y la granja escuela con el motor de excursiones: `src/escenas/excursion.ts`, `granja.ts`, reglas en `src/dominio/excursiones.ts`, datos en `src/contenido/excursiones.ts`, `S.exc`; v0.2.106) y P6 (el resto de las estaciones de la granja: queso, cepillar, huerto y tractor: `src/escenas/granjaTalleres.ts`; v0.2.107) y P7 (animales recortables que pasean por la granja y álbum de excursiones: `src/escenas/granjaAnimales.ts`, `albumExcursiones.ts`; v0.2.108) y P8 (crecer por días y el manzano de la granja: `src/dominio/crecer.ts`, `src/escenas/granjaManzano.ts`, `S.crece`; v0.2.109) y P9 (crías y familias de animales: `src/dominio/crias.ts`, `src/escenas/granjaCrias.ts`, `S.crias`; v0.2.110) y P10 (el patio en 3D y las carreras de Tito: `src/mundo3d/carreras3d.ts`, reglas en `src/dominio/carreras.ts`; v0.2.111) y P11 (el gran día del deporte: `src/escenas/deporte.ts`, `deportePruebas.ts`, reglas en `src/dominio/deporte.ts`, `S.deporte`; v0.2.117) y P12a (los juegos cortos del patio, de dos en dos: menú en `src/escenas/juegosCortos.ts`, la rayuela y los columpios en `rayuela.ts` y `columpios.ts`, reglas en `src/dominio/juegosCortos.ts`; v0.2.128) y P12b (los penaltis y las pompas: `src/escenas/penaltis.ts` y `pompas.ts`; v0.2.131).
- **Varios idiomas (primero, el rumano)**: plan aprobado el 9 de noviembre de 2026 (lo recomendado) y fases en [docs/PLAN-IDIOMAS.md](docs/PLAN-IDIOMAS.md) (ID0 a ID9). Hechas: ID0 (letras ă ș ț en `public/fonts/*-ro.woff2`, catálogo con la zona de adultos, `npm run idiomas:compuestas`; v0.2.114) e ID1 (`tr()` en `src/nucleo/traducir.ts`, reglas en `src/dominio/idiomas.ts`, tablas en `src/idiomas/`, `S.idioma`, `?idioma=ro` o `?idioma=xx` para probar; v0.2.116) e ID2a (plantillas `fmt()`, nombres con formas por idioma `nombreEn()`, números en rumano; v0.2.118) e ID2b (el mapa, la tienda, la asamblea y el cofre, con plantillas y `juntar()`; v0.2.119) e ID2c (los juegos comunes de `src/juegos/`; v0.2.120) e ID2d (los temas de 3 y 4 años; v0.2.122) e ID2e (los temas de 5 años; v0.2.124) e ID2f (las demás escenas: fuera de la Isla de las Letras ya no queda ninguna frase compuesta; v0.2.127) e ID3 (textos de pantalla: `text()` con ancho máximo `max`, prueba `tests/regresion/idiomas.js` con el pseudoidioma; v0.2.132). Sigue la ID4 (el rumano, primera parte); las 66 frases de la Isla de las Letras, en la ID6.
- El juego de referencia es `fercala/curiolandia-3d`: **solo lectura**, no se hacen commits allí desde este trabajo.

## Montar y probar
```sh
npm ci && npx playwright install chromium   # la primera vez (también activa los ganchos de commit)
npm run dev                  # servidor de desarrollo: recarga al guardar
npm run build                # dist/ con la web completa (Vite + herramientas/vite/curiolandia.mts)
npm run test:comentarios     # comentarios de cabecera (docs/POLITICA-DOCUMENTACION.md)
npm run formato              # formatea el código con Prettier (formato:comprobar, solo mira)
npm run lint                 # linter (oxlint), sin avisos (docs/FORMATO-Y-LINTER.md)
npm run dialogos             # rehace el catálogo de frases dialogos/todos.csv
npm run tipos                # TypeScript estricto (el juego, el montaje y las pruebas .ts)
npm run test:unidad          # Vitest (tests/unidad)
npm run test:humo            # escenas de día y de noche sin errores
npm run test:pr              # lo que pasa GitHub Actions en cada PR (unos minutos)
```
Las pruebas de Playwright, de una en una (a la vez bajan los FPS y fallan). Para publicar, sube `version` en
`package.json` (es el nombre de la caché del service worker) y fusiona en `main`: `.github/workflows/web.yml` monta, prueba y publica en GitHub Pages.
Lo que las pruebas leen del juego (`window.__cl`) está en [docs/CONTRATO-PRUEBAS.md](docs/CONTRATO-PRUEBAS.md): no lo rompas.

## Reglas
- Sin voces grabadas: el juego nuevo usa solo la voz del navegador.
- Cada diálogo nuevo o cambiado se apunta en `dialogos/pendientes.txt` y se rehace el catálogo `dialogos/todos.csv` con `npm run dialogos` ([dialogos/LEEME.md](dialogos/LEEME.md)).
- Las partidas guardadas no se rompen nunca: clave de guardado propia, copia única de la partida de `curiolandia-3d`, versión y migraciones.
- El código lo formatea Prettier y lo revisa oxlint ([docs/FORMATO-Y-LINTER.md](docs/FORMATO-Y-LINTER.md)): `npm run formato` antes de cada commit.
- Cada cambio va documentado: comentario de cabecera en cada función, `docs/` al día y una entrada en `docs/CAMBIOS.md`.
- Las fases se hacen en ramas pequeñas con PR, y el juego queda publicable y con las pruebas en verde al final de cada una.
- Principios del proyecto: [docs/CONSTITUCION-BORRADOR.md](docs/CONSTITUCION-BORRADOR.md) (futura constitución de spec-kit).
