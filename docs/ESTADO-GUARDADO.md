# El estado guardado `S`

`S` es el objeto global con todo lo que el juego recuerda: edad, nombre, progreso, monedas, ropa de Tito, ajustes de la familia... Está definido en `src/nucleo/guardado.ts` (sus tipos, en `src/nucleo/tipos.ts`) y se guarda en el `localStorage` del navegador, a través del puerto Guardado (`leerGuardado` y `escribirGuardado` de `src/aplicacion/puertos.ts`, desde la fase 3h; el adaptador está en `src/infraestructura/navegador.ts`).

> **Importante:** hay niños jugando con partidas guardadas en sus móviles. Si cambias el formato de `S` de forma incompatible, esas partidas se rompen o se pierden. Lee la sección 3 antes de tocar nada.

## 1. Cómo se guarda y se carga

- **Clave** en `localStorage`: `'curiolandia-new.v1'` (constante `KEY` en `nucleo/guardado.ts`). No se cambia nunca.
- **Partida de curiolandia-3d:** las dos webs están en `fercala.github.io` y comparten `localStorage`. Si no hay partida propia, `load()` copia **una sola vez** la de `'curiolandia.v1'` (`KEY_VIEJA`) y lo apunta en `'curiolandia-new.copiada'` (`KEY_COPIA`). La vieja nunca se escribe ni se borra, así el juego viejo sigue igual. Lo prueba `tests/regresion/guardado-viejo.js`.
- **Guardar**: `save()` escribe todo `S` como JSON. **No hay guardado automático**: llama a `save()` justo después de cambiar algo que deba recordarse.
- **Cargar**: `load()` se ejecuta una vez al arrancar. Primero pone al día lo guardado con `migrar()` (`dominio/partida.ts`, desde la fase 3f; ver la sección 3). Después hace `S = Object.assign(copia de DEF, lo guardado)`. Es decir: parte de los valores por defecto `DEF` y encima pone lo guardado. Solo mezcla el **primer nivel** (los objetos de dentro, como `S.tito`, se toman tal cual de lo guardado). Antes de mezclar, `sanoS(lo guardado, DEF)` quita los campos con un tipo imposible (desde v1.586): un `null` donde `DEF` tiene un valor, un objeto que no es objeto, un número donde va texto (se pasa a texto) o un texto con número donde va número (se pasa a número), y las entradas de `temas` que no son objetos. Esos campos quedan con su valor por defecto, así una partida o copia rota no rompe el juego.
- Después de `sanoS`, `sanoHondo()` (`nucleo/guardado.ts`; viene de core.js de curiolandia-3d v1.592) arregla lo de dentro de las colecciones: `temas.X.g`, `stats`, `gs`, `home`, `kg`, `vales`, `valesLog`, `rep` y `cofreP` (ver su comentario). Se usa también cuando otra pestaña guarda (evento `storage`): esta pestaña adopta esa partida (también pasada por `migrar()`) para no pisarla con datos viejos.
- Los campos de `escenas/tienda.ts` (`DEF2`) se rellenan después: `sanoS(S, DEF2)` y luego `rellenaS(S, DEF2)` (`nucleo/guardado.ts`, desde la v0.2.93), que pone una copia de `DEF2[k]` en cada `S[k]` que sea `undefined`. `escenas/repaso.ts` pone `{}` en `kg` y `gs` si faltan o no son objetos.
- Si no hay partida pero sí una de **Letrilandia** (otro juego de la familia, clave `letrilandia.v1`), se copian de ahí el nombre, la edad, el acento y el volumen.
- **Copia de seguridad** (zona de adultos): `bkEncode()` genera un texto `CURIO1.` + JSON comprimido en base64; "Recuperar" lo vuelve a escribir en `localStorage` (con `escribirGuardado`) y recarga la página. `bkDecode()` solo acepta un objeto con `temas` que sea un objeto (no `null` ni una lista).

## 2. Los campos

### En `DEF` (`nucleo/guardado.ts`)

| Campo | Formato | Para qué |
|---|---|---|
| `age` | `0` (sin elegir), `3`, `4` o `5` | Edad del niño. Usa `AGE()`, que devuelve 3 si aún es 0. |
| `name` | texto (máx. 20) | Nombre del niño (`''` si no hay). |
| `variant` | `'es'` | Variante del español. Desde la fase 5d el juego es solo en castellano de España: siempre `'es'`. Las partidas con `'ar'` (rioplatense) o vacía pasan a `'es'` al cargarlas (migración 1 → 2). Se conserva el campo para no cambiar la forma de la partida. |
| `tipoLetra` | `'mayus'` o `'ambas'` | Cómo salen las letras en la Isla de las Letras (desde la fase L7b de `PLAN-LECTURA.md`): solo mayúsculas o también minúsculas. Lo elige el adulto en la zona de adultos («Letras de la isla»). Las partidas de antes pasan a `'mayus'` al cargarlas (migración 2 → 3), salvo si ya traen `'ambas'`. Se lee con `ambas()` (`temas/letras.ts`). |
| `hemi` | `'N'` o `'S'` | Hemisferio, para las estaciones del año. |
| `vol` | `{voz, mus, fx}` de 0 a 1 | Volúmenes. |
| `limit` | minutos: `0`, `10`, `15`, `20` | Límite de tiempo de juego al día (0 = sin límite). |
| `temas` | `{idTema: {g: {índiceJuego: veces}, done: 0/1}}` | **El progreso.** Cuántas veces se ha terminado cada juego de cada tema y si el tema está terminado. Lo cambia `finishGame` con el caso de uso `terminarJuego` (`aplicacion/terminarJuego.ts`, desde la fase 4b; regla `trasTerminarJuego` de dominio/progreso.ts). |
| `stats` | `{habilidad: {ok, err}}` | Aciertos y fallos por habilidad (`rec()`, en `nucleo/interfaz.ts` desde la fase 4c), para la tabla de adultos y el repaso. |
| `days` | `{'AAAA-MM-DD': minutos}` | Minutos jugados por día (últimos 30). |
| `asam` | `{'AAAA-MM-DD': {done, age, dia, tiempo, emo}}` | Asambleas hechas (máx. 120 días). |
| `stk` | `{claveDibujo: cantidad}` | Pegatinas del álbum. Desde la fase P7 de IDEAS-MEJORA.md, la primera visita terminada a una excursión suma la pegatina de su dibujo (`vaca` para la granja escuela). |
| `album` | `[]` | No se usa. |
| `intro` | `true/false` | Si ya vio el cuento de bienvenida. |
| `first` | `{askedName, fromLetri, jardin, bosque..., isla, wk}` | Cosas que solo pasan una vez (saludos largos, si ya se preguntó el nombre...). `titoDice` (desde la fase P2 de IDEAS-MEJORA.md): ya se oyó la explicación larga de «Tito dice»; `yoga` (desde la P3), la del yoga; `exc:granja` (desde la P5), la presentación de la granjera. `isla` (desde la fase L2): ya se oyó la bienvenida a la Isla de las Letras. Las casitas de la isla guardan su progreso en `S.temas` con sus ids (`L3-A`...), como las demás. `islaIngles` (desde la fase I2 de PLAN-INGLES): ya se oyó la bienvenida a la Isla del Inglés; las casitas de inglés siguen con sus ids de siempre (`EN-HELLO`...), ahora en la zona `playaHello`. |
| `seenFl` | número | Flores ya celebradas en el mapa. |
| `ver` | número entero (hoy `3`) | Versión del formato de la partida (`VERSION_PARTIDA`, desde la fase 3f). Las partidas de antes, también las de curiolandia-3d, no la llevan: cuentan como versión 0 y `migrar()` las pone al día al cargarlas. Una partida de una versión más nueva se deja como está. |

### En `DEF2` (escenas/tienda.ts)

| Campo | Formato | Para qué |
|---|---|---|
| `coins`, `coinsTot` | números | Monedas actuales y ganadas en total. |
| `gift` | fecha `'AAAA-MM-DD'` | Último regalo diario de monedas. |
| `woke` | `{bosque: 1, montana: 1}` | Zonas ya "despertadas" (anunciadas). |
| `home` | `{idArtículo: {x, y, r}}` | Dónde está cada objeto en la casa de Tito. `r` (v1.590) es la habitación (`ROOMS` en escenas/tienda.ts); sin `r`, el salón (partidas de antes). `h` (partida versión 5, fase M1 de PLAN-CASA-MEJORA.md) es su sitio (`'salon:grande2'`, `'cocina:mesa:1'`: `dominio/casaSitios.ts`); sin `h`, el objeto no tiene sitio todavía. Desde la fase M2, `r: 'baul'` es «guardado en el baúl» (sin `h`; `x` e `y` no se usan), lo comprado o regalado va al baúl y, al entrar en la casa, cada objeto se pone en la posición de su sitio y lo que no tiene sitio va al baúl (`arreglarCasa`, `aplicacion/casa.ts`). |
| `rooms` | número o ausente | (v1.590) Cuántas habitaciones de la casa ya se vieron abiertas: si hay más abiertas, al entrar en la casa Tito anuncia la nueva. Ausente = 1. |
| `tito` | `{shell, scarf, hat, glasses, bow, kind}` | Colores y ropa de Tito; `kind` = `'caracol'`, `'erizo'`, `'tortuga'` o `'conejo'`. |
| `owned` | `{idArtículo: 1}` | Artículos que tiene. |
| `vales`, `valesLog` | listas | Vales que ofrece la familia (`{id, txt, ic, p: precio, on: si se ofrece}`) y vales comprados (además `d`: fecha, `given`: entregado). |
| `bday`, `bdayDone` | `{d, m}` (mes de 0 a 11) o `null`; fecha | Cumpleaños y última vez que se celebró. |
| `unlockAll` | `true/false` | Modo libre (todo abierto). |
| `seenOpen` | `{clave: [ids]}` | Qué estaba abierto la última vez, para animar lo que se abre nuevo. |
| `houseSeen`, `petSeen` | números | Último nivel de la casa / etapa de Pipo celebrados. |
| `cofres` | número | Cofres abiertos. |
| `mascotas` | `{idMascota: {nombre, dias, dia, hechos}}` | (Fase C1, partida versión 4) Ficha de cada mascota que crece (`MASCOTAS` en dominio/casa.ts): nombre elegido (`''` si aún no), días cuidados en total (bebé, joven con 3, mayor con 8), el día de los cuidados de hoy y qué cuidados se hicieron ese día. Sin ficha cuenta como joven (`fichaDe`). Desde la fase C6 la escribe `SCENES.casaMascota` (`escenas/casaMascotas.ts`) al elegir el nombre y al cuidar, y `buy` (`escenas/tienda.ts`) al comprar una mascota (`fichaNueva`: bebé). La de Pipo (`pipo`) también se apunta al cuidarlo, pero Pipo crece con las estrellas. |
| `sorpresas` | `{idSorpresa: 1}` | (Fase C1) Lo descubierto en la casa para el álbum: el id del objeto (su reacción) o `'a+b'` (una combinación de `COMBINACIONES`). Desde la fase C3 se apunta al jugar con un objeto, desde la C7 al descubrir una combinación (`combina`, `escenas/tienda.ts`), y lo enseña el álbum «Sorpresas de la casa» (`escenas/casaAlbum.ts`). |
| `huerto` | `{dias, dia}` | (Fase C1) La flor del huerto: días regados en total y el último día que se regó (cuenta uno al día). |
| `casaEst` | `{idArtículo: número}` | (Fase M3a de PLAN-CASA-MEJORA.md) El estado de las cosas de la casa que lo tienen (`ESTADOS` en `dominio/casaToques.ts`): 0 es el normal (el de una cosa recién comprada); un toque pasa al siguiente. Un valor que no vale (fuera de rango, no numérico) cuenta como 0 (`estadoDe`). `{}` en `DEF2`; no necesita migración. |
| `casaVistos` | `{idArtículo: 1}` o `null` | (Fase M2 de PLAN-CASA-MEJORA.md) Lo que ya se ha colocado alguna vez en la casa de Tito: lo del baúl que no está aquí es «nuevo» (número rojo del botón del baúl). `null` (en `DEF2`) hasta la primera visita a la casa: entonces todo lo que ya había cuenta como visto. No necesita migración. |
| `cofreP` | objeto `{idTema: 1}` o ausente | Cofres con el premio aún sin entregar (v1.592): se apunta al entrar en el cofre y se quita al dar el premio. Si la página se cerró antes, `cofrePend()` (escenas/zonas.ts, llamada desde aplicacion/arranque.ts) lo entrega al arrancar. |

### En `escenas/repaso.ts`

| Campo | Formato | Para qué |
|---|---|---|
| `kg` | `{habilidad: [ids de juego]}` | En qué juegos sale cada habilidad (últimos 6, el más reciente primero; `conJuegoReciente` en dominio/repaso.ts). Lo apunta `rec` en cada acierto o fallo dentro de un juego (caso de uso `apuntarResultado`, desde la fase 4c). |
| `gs` | `{'idTema#índice': {ok, err, d}}` | Aciertos, fallos y fecha de cada juego. Los aciertos y fallos, `rec` (`apuntarResultado`, desde la fase 4c; regla `conIntento`); la fecha (`d`), al terminar el juego, `terminarJuego` (desde la fase 4b; regla `conFecha`). |
| `rep` | `{d, list, done, weak, paid, seen}` | El repaso del día. Cómo se eligen los juegos y cuándo se rehace: dominio/repaso.ts; lo prepara la escena del repaso con el caso de uso `repasoDelDia` (`repasoCaducado`, `nuevoRepaso`, desde la fase 4c). Un juego lanzado desde el repaso (`REP_ON`) queda en `done` al terminarlo (`terminarJuego`, regla `conHecho`). |

### Sueltos (sin valor en `DEF`; se leen con `S.x || valor`)

| Campo | Formato | Para qué |
|---|---|---|
| `voz` | `'nav'` | Siempre `'nav'` (solo voz del navegador): `load()` lo pone así al arrancar, también en partidas copiadas de curiolandia-3d que traían `''` (voz grabada) o `'fer'`. |
| `vozNav` | texto (`voiceURI` o nombre), `''` o ausente | Voz del navegador elegida en la zona de adultos (v1.589). Vacío o ausente: automática (`pickVoice`). Si esa voz no existe en el aparato, se usa la automática. Se conserva al empezar de nuevo. |
| `cole` | `{d: 'AAAA-MM-DD', hechas: [ids], veces: {id: n}}` o ausente | (Fase P1 de IDEAS-MEJORA.md, v0.2.102) Lo jugado en el patio del cole: el último día, las actividades hechas ese día (la primera de cada día da 3 monedas) y cuántas veces se ha hecho cada una desde siempre (para la zona de adultos; ids: `estatuas`, `titoDice`, `yoga` y, desde la P10, `carreras`). Lo escribe la escena de cada actividad con `terminarActividad` (`dominio/cole.ts`); `registroCole` lee como vacío uno ausente o roto. Opcional, sin migración. No está en `keep`: al borrar todo, se va con el progreso. |
| `retos` | `{d: 'AAAA-MM-DD', id, hecho, celebrado, n}` o ausente | (Fase P4 de IDEAS-MEJORA.md, v0.2.105) El último reto para hacer en casa que propuso Tito (`dominio/retos.ts`): el día y su id, si la familia lo marcó como hecho en el Resumen de la zona de adultos, si Tito ya lo celebró con la pegatina de la casa (`S.stk.casa`) y cuántos retos se han hecho. Opcional, sin migración. |
| `sinMoverse` | `true` o ausente | (Fase P4, v0.2.105) La familia ha quitado los juegos de moverse en «Cómo se juega»: el patio del cole sale cerrado, no hay pausa activa y los retos no son de moverse. Sin el campo, están puestos. |
| `exc` | `{id: {vistas: [ids], veces, foto, d}}` o ausente | (Fase P5 de IDEAS-MEJORA.md, v0.2.106) Las excursiones del autobús del cole (`dominio/excursiones.ts`), por id (`granja`): las estaciones hechas en la visita de ahora, las visitas terminadas, si ya hay foto de grupo y el último día que se terminó una (5 monedas la primera de cada día). Opcional, sin migración. Desde la P7, el álbum de excursiones (`SCENES.albumExcursiones`) lee `veces` y `d` para la foto de recuerdo, sin cambiar la forma. |
| `crece` | `{id: {dias, dia}}` o ausente | (Fase P8 de IDEAS-MEJORA.md, v0.2.109) Los seres vivos que crecen por días (`dominio/crecer.ts`), por id: de momento, el manzano de la granja (`'granja:manzano'`). `dias`: días distintos que se le ha cuidado (cada visita a la granja, una vez al día); `dia`: el último que contó. Sin migración: sin el campo, el manzano aún no se ha plantado. |
| `crias` | `{id: {nombre, d}}` o ausente | (Fase P9 de IDEAS-MEJORA.md, v0.2.110) Las crías nacidas en la granja escuela (`dominio/crias.ts`), por id (`pollito`, `cordero`, `ternero`, `lechon`, `potro`): el nombre que les puso el niño y el día de granja (`crece['granja:manzano'].dias`) en que nacieron, del que sale cuánto han crecido. Sin migración: sin el campo, aún no ha nacido ninguna. |
| `bkFecha` | `'AAAA-MM-DD'` o ausente | Día de la última copia de seguridad descargada, vista o copiada en la zona de adultos (desde la fase A6 de `PLAN-MENU-ADULTOS.md`, v0.2.101). Si nunca se ha hecho y hay progreso, o es de hace 30 días o más, el Resumen y el menú lo recuerdan (`tocaCopia`, `dominio/zonaAdultos.ts`). Opcional, sin migración: las partidas de antes no lo tienen y cuentan como «sin copia». No está en `keep`: al borrar todo, se va con el progreso. |
| `quiet3` | `0` o `1` | Si Tito se calla al tocar el paisaje 3D. |
| `last` | id de tema | Último tema visitado. |
| `ses` | `{t: segundos, at: hora en ms}` o `null` | Tiempo jugado en la sesión, para el límite `limit` (desde v1.586). Se guarda cada 15 s; al recargar, si es de hace menos de 30 min, la sesión sigue desde ahí. Se pone a `null` al cerrar la zona de adultos. |

## 3. Reglas para no romper partidas guardadas

1. **No renombres** ningún campo ni cambies su tipo o su significado. Si `temas` es un objeto, seguirá siendo un objeto con el mismo formato.
2. **No cambies los `id`** de temas (`'3A-T1'`), de artículos de la tienda ni de dibujos que estén guardados en `S.temas`, `S.owned`, `S.home`, `S.stk`...
3. **Los juegos de un tema se guardan por posición** (`S.temas[id].g[índice]`): añade juegos nuevos **al final** de `games`. Si insertas uno en medio, las estrellas guardadas pasan a apuntar a otro juego.
4. **Campo nuevo = valor por defecto obligatorio.** Tres formas válidas:
   - añadirlo a `DEF2` en escenas/tienda.ts (se rellena solo en las partidas viejas);
   - añadirlo a `DEF` en `nucleo/guardado.ts` (y su tipo a `Estado` en `nucleo/tipos.ts`) (también se rellena al cargar);
   - o leerlo siempre con un valor de respaldo: `S.miCampo || 0`.
5. **Subcampos nuevos dentro de un objeto** (por ejemplo `S.tito.zapatos`): `load()` no los rellena en partidas viejas. Léelos siempre con respaldo: `(S.tito.zapatos || '')`.
6. Llama a `save()` después de cambiar algo.
7. Si el campo debe sobrevivir a "Borrar todo el progreso" (zona de adultos), añádelo a la lista `keep` de `doReset()` en aplicacion/adultos.ts.
8. **Si un formato tiene que cambiar sí o sí** (desde la fase 3f), se hace con una **migración**, nunca a mano en el código que lee el campo:
   1. Sube `VERSION_PARTIDA` en `src/dominio/partida.ts` (de 1 a 2, por ejemplo).
   2. Añade a `MIGRACIONES` el paso de la versión anterior: `1: (d) => ({ ...d, nuevo: convertir(d['viejo']) })`. Recibe la partida tal como venga (quizá rota, sin el campo o con otro tipo): no puede fallar con nada, y devuelve una partida nueva sin cambiar la que recibe. `migrar()` apunta la versión.
   3. Cambia `DEF` (o `DEF2`) y el tipo `Estado` al formato nuevo: después de migrar, `sanoS` y `sanoHondo` arreglan lo que siga roto.
   4. Pruébalo en `tests/unidad/partida.test.ts` con una partida de la versión anterior (y con una rota). La prueba de que no falta ningún paso ya está.
   5. Un paso ya publicado no se cambia nunca: hay móviles que ya lo han aplicado. Si estaba mal, se arregla con otro paso.
   6. Pasos que hay: 0 → 1 (solo apunta la versión) y 1 → 2 (fase 5d: `variant` pasa a `'es'`) 2 → 3 (fase L7b: `tipoLetra` pasa a `'mayus'` si no era `'ambas'`) 3 → 4 (fase C1 de PLAN-CASA.md: añade `mascotas`, con ficha de joven para las mascotas ya compradas, `sorpresas` y `huerto`) y 4 → 5 (fase M1 de PLAN-CASA-MEJORA.md: cada objeto de `home` recibe su sitio `h`, el libre más cercano en su habitación, con `asignarSitios`; no cambia `x`, `y` ni `r`, y lo que no cabe se queda sin `h`).
   7. Ojo: curiolandia-3d no entiende las migraciones. Una copia de seguridad de este juego con un formato nuevo no sirve en el juego viejo.

## 4. Cómo probar con una partida concreta

Desde la consola del navegador (F12):

```js
__cl.S                    // ver el estado
__cl.S.age = 5; __cl.S.unlockAll = true; __cl.go('map')   // cambiar algo y volver al mapa
localStorage.removeItem('curiolandia-new.v1'); location.reload()  // empezar de cero (¡borra la partida de ese navegador!)
```

Para probar que una partida antigua sigue funcionando, guarda una copia de seguridad antes de tu cambio, monta tu versión y recupera esa copia en la zona de adultos.
