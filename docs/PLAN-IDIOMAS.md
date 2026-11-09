# Plan para que Curiolandia hable varios idiomas (primero, el rumano)

Fernando lo pidió el 9 de noviembre de 2026: «quiero hacer que curiolandia-new pueda ser multiidioma y el primer idioma a
incorporar además del castellano debería ser el rumano», y después: «crea un plan y revisa a fondo los cambios que hay que
hacer, ya que no solo los diálogos deberían ser multiidioma sino que también los textos que se muestran».

**Estado: aprobado, en marcha.** Fernando fusionó el plan el 9 de noviembre de 2026 (PR #122): se toma lo recomendado en
las decisiones del apartado 3. Hecha: **ID0** (v0.2.114, apartado 9). Si cambia una decisión, se apunta aquí y en
`CAMBIOS.md`. Las fases se llaman **ID0 a ID9** (ID de idiomas) para no confundirlas con las fases L (letras),
I (inglés), C y M (casa), A (adultos) y P (ideas).

El castellano de España sigue siendo el idioma principal: es el que se escribe en el código y el que sale si no se elige
otro. El rumano es el primero que se añade, y el sistema queda preparado para añadir más (cada idioma nuevo serían solo
sus tablas de textos, sus nombres de dibujos y, si se quiere, su Isla de las Letras).

## 1. Qué hay que traducir: no solo lo que dice Tito

Todo lo que el niño **oye** y todo lo que el niño o el adulto **ve escrito**:

| Dónde | Qué es | Cómo sale hoy |
| --- | --- | --- |
| Voz de Tito, Lupi, Polly y los demás | frases, preguntas, aciertos, fallos, cuentos | `say()`, `sayQ()`, `say3()`, `sayMix()` en `src/nucleo/voz.ts` |
| Textos pintados en el lienzo | botones, carteles, títulos de casitas, rótulos de la tienda, números, días... | `text()` de `src/nucleo/dibujo.ts` |
| Rótulos en 3D | el cartel «Isla del Inglés», el del cole, nombres de zonas | texturas hechas con un lienzo (`canvasTex`, `pillTex`) en `src/mundo3d/` |
| Ventanas de la página | «¿Cómo se llama quien juega?», «¿Empezar de nuevo?», «Zona de adultos», «Gira el móvil» | HTML fijo de `src/head.html` y textos del bucle (`src/aplicacion/bucle.ts`) |
| Zona de adultos | las 7 categorías, avisos, ayudas, progreso, premios, copia de seguridad | HTML escrito en `src/aplicacion/adultos/` (unas 1.360 líneas) |
| Datos de contenido | temas, juegos, cuentos, palabras, letras, excursiones, la casa | `src/contenido/`, `src/temas/`, `src/juegos/`, `src/escenas/` |
| La página en sí | `<html lang>`, título de la pestaña, descripción del manifiesto | `index.html`, `public/manifest.webmanifest` |
| Calendario y números | días, meses, estaciones, números dichos («tres globos») | `DIASL`, `MESES`, `ESTACIONES` (`src/nucleo/interfaz.ts`), `NUM` (`src/juegos/comps.ts`) |

## 2. Lo que he medido en el código (main, v0.2.112)

- **Catálogo de textos** (`dialogos/todos.csv`, de `npm run dialogos`): 3.156 textos: 1.277 frases enteras, 1.521
  trozos de frases que se componen o textos cortos que se ven, 332 nombres de dibujos con artículo y 26 en inglés. El
  catálogo **deja fuera la zona de adultos** y el HTML de `head.html`: también hay que traducirlos.
- **Llamadas que hablan**: unas 610 a `say()` y sus hermanas; **llamadas que escriben**: unas 250 a `text()`.
- **Frases que se componen pegando trozos**: medidas en la ID0 con `npm run idiomas:compuestas`, **376** (contando
  también las que se guardan en tablas y las que llevan `kid()`; la primera cuenta, mirando solo dentro de `say()`, daba
  unas 100).
  Son el problema principal: «Guarda » + el nombre + « dentro de la mochila» solo funciona con el orden y la gramática del
  castellano.
- **Trucos de gramática castellana en el código** (57 en la medida de la ID0): `dela()` y `ala()` (del, al), `isPl()`
  (mira si el nombre empieza por «los»/«las»), `fem()` (por «la»/«las»), `esta()`, `eseEs()`, y reglas sueltas como
  `.replace(/ de el /, ' del ')` (`src/escenas/cofre.ts`), `.replace('Cuántos', fem(k) ? 'Cuántas' : 'Cuántos')`
  (`src/temas/temas5.ts`) o `/^l[ao]s /.test(z.name) ? 'abrieron ' : 'abrió '` (`src/escenas/zonas.ts`). En rumano el
  artículo va pegado al final de la palabra (pisică → pisica), hay tres géneros y los casos cambian la palabra (pisicii),
  así que estos trucos no sirven: hay que darle a cada nombre sus formas.
- **El nombre del niño** se mete en 31 sitios con `kid()` («¡Muy bien, Ana!») y hay 57 elogios con `praise()`.
- **Las letras de la página no tienen ă, ș ni ț**: `public/fonts/andika-700-latin.woff2` y `fredoka-latin.woff2` son el
  recorte «latin» de Google Fonts. Tienen â e î, pero faltan **ă, ș, ț, Ă, Ș y Ț**: se verían con otra letra del sistema
  (o como cuadraditos en algún móvil). Hay que añadir el recorte «latin-ext».
- **La voz**: el juego nuevo usa solo la voz del navegador. `pickVoice()` busca voces `es-*` (y `en-*` para el inglés);
  habrá que buscar `ro-RO`. Hay voz rumana en Edge (voces naturales «Alina» y «Emil», con internet), en Android (voz de
  Google) y en iPhone/iPad («Ioana»); en Windows se puede instalar «Andrei». En Chrome de ordenador no siempre hay voz
  rumana. Sin voz, un niño de 3 a 5 años no puede jugar, así que la zona de adultos tendrá que avisar.
- **Contenido que depende del idioma, no solo de la traducción**:
  - **Isla de las Letras** (`src/contenido/letras.ts`, `src/temas/letras.ts` 1.657 líneas, `src/juegos/lectura.ts` 1.067):
    enseña 20 letras del castellano (con la Ñ), sus sílabas, palmas por sílabas, la máquina de palabras, el tren, las
    frases y los cuentos para leer. En rumano el alfabeto es otro (31 letras: A Ă Â B C D E F G H I Î J K L M N O P Q R S
    Ș T Ț U V W X Y Z), las sílabas también (ce, ci, ge, gi, che, chi, ghe, ghi) y las palabras de cada letra son otras.
    No se traduce: se hace su versión rumana.
  - **Juegos de sonido inicial y de sílabas fuera de la isla** (en `comps.ts`, `comps2.ts`, `escenas/repaso.ts`, la
    tienda de música de la casa...): «¿Qué empieza por...?» depende de la palabra en cada idioma.
  - **Isla del Inglés**: lo que dice Polly en inglés se queda; lo que explica en castellano y la traducción de cada
    palabra (`es` en `src/contenido/ingles.ts`) pasan a rumano.
  - **Cuentos** (`src/contenido/cuentos.ts`, 2.557 líneas): el bloque más grande de texto.
  - **Fiestas y costumbres**: Navidad, Reyes Magos, carnaval, castañas en otoño... (en `temas5.ts`, `extras.ts`,
    `cuentos.ts`, `dominio/apertura.ts`, el mapa 3D). En Rumanía hay otras (Mărțișor el 1 de marzo, Moș Nicolae el 6 de
    diciembre, la Pascua ortodoxa con otra fecha, el 1 de diciembre).
- **Textos más largos**: el rumano suele ocupar algo más que el castellano. `text()` escribe a un tamaño fijo, sin
  ajustar al ancho: botones y carteles pueden salirse.
- **Tablas que se calculan al cargar**: muchos textos se guardan en constantes al importar los módulos (temas, LEX...).
  Si se cambia de idioma en mitad de la partida, esas tablas seguirían en castellano.

## 3. Decisiones (con la recomendada)

1. **Cómo se identifica cada texto.** (a) **Recomendada**: la clave es el propio texto en castellano, con el id que ya da
   el catálogo (las 12 primeras letras de su md5). El código sigue escrito en castellano, legible como hoy, y cada idioma
   es una tabla `id → texto`. El catálogo `todos.csv`, que ya se hizo «para poder traducir el juego algún día», es la
   lista de lo que hay que traducir. (b) Claves con nombre (`casa.cocina.saludo`): habría que tocar los 3.156 textos y el
   código se lee peor. Se descarta.
2. **Dónde se traduce.** **Recomendada**: en los pocos sitios por donde sale todo (`say()` y familia, `text()`, los
   rótulos 3D y una función para el HTML de la zona de adultos y `head.html`). Las frases enteras se traducen solas al
   salir; las ~100 frases que se componen pasan a plantillas con huecos (`'Guarda {cosa} dentro de la mochila.'`) que se
   traducen enteras y luego se rellenan. Así no hay que envolver cada uno de los 3.000 textos a mano.
3. **Cambiar de idioma recarga el juego.** **Recomendada**: al elegir otro idioma se guarda y se recarga la página. Evita
   tablas y rótulos 3D a medio traducir y es lo que hace casi todo el mundo. Para un niño no se nota: lo cambia el adulto.
4. **Quién elige el idioma.** **Recomendada**: la primera vez, el idioma del navegador (si es rumano, rumano; si no,
   castellano), y después lo elige el adulto en la zona de adultos (categoría «Tito y el sonido», que pasaría a llamarse
   «Idioma, Tito y el sonido»). Además, en la ventana del primer día («¿Cómo se llama quien juega?») un selector pequeño
   de idioma con banderas, por si el móvil está en otro idioma.
5. **La partida y el progreso.** **Recomendada**: un campo nuevo `S.idioma` (`'es'` o `'ro'`; si no está, `'es'`), sin
   romper ninguna partida. Estrellas, monedas, pegatinas, casa y temas terminados **se comparten** entre idiomas (es el
   mismo niño). La Isla de las Letras en rumano tiene **casitas propias** (ids nuevos, `RO-L3-A`...), así el progreso de
   las letras de un idioma no se mezcla con el del otro. Se conserva al empezar de nuevo, como la voz y el volumen.
6. **La voz en rumano.** **Recomendada**: la voz del navegador en `ro-RO`, como hoy en castellano (el juego nuevo no
   lleva voces grabadas). Si el aparato no tiene voz rumana, la zona de adultos lo avisa en el Resumen con los pasos para
   instalarla (como ya hace con la voz inglesa), y no se usa nunca una voz castellana leyendo rumano. Grabar voces en
   rumano se puede pensar más adelante.
7. **Quién traduce.** **Recomendada**: Claude hace un primer borrador de todo en rumano, con el registro de un cuento
   infantil (tuteo, frases cortas, sin ¡ ni ¿, que en rumano no se usan), y **una persona que hable rumano lo revisa**
   antes de publicarlo. Para revisarlo se genera una hoja (`dialogos/ro.csv`: castellano, rumano, dónde sale, estado).
   Pregunta para Fernando: ¿hay alguien que pueda revisarlo?
8. **Fiestas y costumbres.** **Recomendada**: primero se traduce tal cual (la Navidad o el carnaval se entienden igual);
   la adaptación a Rumanía (Mărțișor, Moș Nicolae, Pascua ortodoxa...) va en una fase aparte (ID8) que se decide al
   llegar.
9. **El rumano se publica cuando esté entero.** **Recomendada**: el selector solo enseña el rumano cuando una prueba
   confirme que todos los textos tienen traducción (menos la Isla de las Letras, que mientras no esté hecha en rumano se
   cierra con un cartel «Pronto» en ese idioma). Mientras tanto se puede probar con `?idioma=ro` en la dirección.

## 4. Cómo se hará por dentro

Siguiendo la arquitectura de `docs/ARQUITECTURA.md`:

- **`src/dominio/idioma.ts`**: las reglas sin dibujo ni `S`: idiomas que hay (`IDIOMAS`), idioma de partida según el
  navegador, si un idioma está completo, y cómo se rellena una plantilla. Con pruebas de Vitest.
- **`src/nucleo/traducir.ts`**: `tr(texto)` (busca el id del texto en la tabla del idioma; si no está, devuelve el
  castellano y lo apunta en `window.__cl.sinTraducir` para las pruebas) y `fmt(plantilla, huecos)`. Lo llaman `say()`,
  `text()`, los rótulos 3D y el HTML de la zona de adultos.
- **`src/idiomas/ro/`**: las tablas del rumano: `textos.ts` (id → texto), `nombres.ts` (los dibujos con sus formas) y,
  en su fase, `letras.ts`. Se cargan aparte con `import()` solo si el idioma es el rumano, para que la versión en
  castellano no pese más; el service worker las guarda para jugar sin internet.
- **Nombres de los dibujos con sus formas.** Hoy `LEX` guarda «el gato» y el código adivina género y número por el
  artículo. Pasará a tener por idioma las formas que piden las frases: en castellano `{ art: 'el gato', sin: 'gato',
  gen: 'm', pl: false }`; en rumano `{ art: 'pisica', sin: 'pisică', gen: 'f', pl: false, gd: 'pisicii' }`. Las
  plantillas piden la forma que necesitan (`{cosa}`, `{cosa:sin}`, `{cosa:gd}`), y `dela()`, `ala()`, `isPl()`, `fem()`
  y los `replace` de gramática desaparecen.
- **Números**: `NUM` y lo que dice números pasan a cada idioma. En rumano el número cambia con el género (un/o, doi/două:
  «doi câini», «două pisici») y desde el 20 lleva «de» («douăzeci de mere»).
- **Fechas**: días, meses y estaciones por idioma (`Intl` del navegador para los nombres, con tabla propia de respaldo).
- **Ajustar al ancho**: `text()` gana una opción de ancho máximo que reduce la letra si no cabe; se usa en botones,
  carteles y títulos.
- **El catálogo**: `herramientas/dialogos/catalogo.mts` también saca la zona de adultos y `head.html` (con otro tipo,
  `adultos`), y escribe `dialogos/ro.csv` con lo que falta por traducir. `tests/unidad/dialogos.test.ts` comprueba que
  cada texto del catálogo tiene traducción cuando el idioma se da por completo.
- **El estado guardado**: `S.idioma` en `DEF` de `nucleo/guardado.ts`, en `docs/ESTADO-GUARDADO.md` y en la lista de lo
  que se conserva al empezar de nuevo.

## 5. Fases

Cada fase en su rama y su PR, con el juego publicable y las pruebas en verde al final. Hasta la ID4 el juego en
castellano **no cambia nada** para el niño (se comprueba con las pruebas de regresión y comparando lo que dice, `__said`).

| Fase | Qué se hace | Se nota |
| --- | --- | --- |
| **ID0** | Letras de la página con ă, ș, ț (recorte latin-ext de Andika y Fredoka); el catálogo incluye la zona de adultos y `head.html`; lista medida de las frases compuestas y de los trucos de gramática. | No |
| **ID1** | Núcleo de idiomas: `dominio/idioma.ts`, `nucleo/traducir.ts`, `S.idioma`, carga de las tablas, `<html lang>`, recarga al cambiar, `?idioma=` para probar. La voz elige por idioma (`pickVoice` con `ro-RO`). Un «pseudoidioma» de prueba que marca cada texto traducido (`⟦...⟧`) y lo alarga un 30 %, para ver en pantalla lo que se escapa sin traducir y lo que no cabe. | No |
| **ID2** | Frases compuestas a plantillas (376, en varios PR por grupos de archivos) y nombres de dibujos con formas por idioma: fuera `dela`, `ala`, `isPl`, `fem` y los `replace` de gramática. Números y fechas por idioma. | No (en castellano dice lo mismo) |
| **ID3** | Textos en pantalla: `text()` con ancho máximo, rótulos 3D traducibles, HTML de la zona de adultos y de `head.html` por `tr()`. Repaso con el pseudoidioma de todas las escenas. | No |
| **ID4** | Rumano, primera parte: portada, mapa, tienda, casa de Tito, cole, patio, excursiones, ventanas y zona de adultos, con el selector de idioma (oculto hasta la ID9 salvo con `?idioma=ro`) y el aviso de voz rumana. | Solo con `?idioma=ro` |
| **ID5** | Rumano, segunda parte: los temas y sus juegos, y los cuentos. Hoja `dialogos/ro.csv` para la revisión. | Solo con `?idioma=ro` |
| **ID6** | Isla de las Letras en rumano: sus letras y su orden (las vocales primero, con Ă, Â e Î; luego las consonantes, con Ș y Ț; sin Ñ), los trazos nuevos (breve, circunflejo, coma de abajo), palabras con dibujo para cada letra, sílabas del rumano (ce/ci, ge/gi, che/chi, ghe/ghi), frases y cuentos para leer, con sus casitas `RO-L*`. Se revisa con alguien que conozca cómo se enseña a leer en Rumanía (el *abecedar*). | Solo con `?idioma=ro` |
| **ID7** | Isla del Inglés desde el rumano: lo que explica Polly y las traducciones de cada palabra en rumano; lo que dice en inglés no cambia. Juegos de sonido inicial fuera de la isla con palabras rumanas. | Solo con `?idioma=ro` |
| **ID8** | (Se decide al llegar.) Adaptación a Rumanía: fiestas, costumbres y fechas (Mărțișor, Moș Nicolae, Pascua ortodoxa, 1 de diciembre). | Solo en rumano |
| **ID9** | Revisión de la persona que hable rumano, prueba de que no falta nada, pruebas de regresión en rumano, y se enseña el rumano en el selector. Se publica. | Sí: el rumano se puede elegir |

**Cuánto es**: ID0 a ID3 son el trabajo de código (sobre todo la ID2, porque toca muchos juegos); ID4, ID5 y ID6 son
sobre todo traducción y contenido. El texto a traducir son unos 3.150 textos del catálogo más la zona de adultos.

## 6. Cómo se prueba

- Lo de siempre en castellano (`npm run test:pr`) en cada fase, y comparar lo que dice el juego antes y después en las
  fases ID1 a ID3 (que no cambie ni una frase).
- Vitest: plantillas, formas de los nombres, números en rumano, idioma de partida, migración de `S`.
- `tests/regresion/idiomas.js` (nueva): juega con `?idioma=ro` el mapa, la casa, una casita de cada zona, la tienda y la
  zona de adultos, y falla si algo sale sin traducir (`__cl.sinTraducir`) o si un texto no cabe.
- `docs/CONTRATO-PRUEBAS.md`: se apunta `__cl.sinTraducir` y cómo se elige el idioma en las pruebas.

## 7. Riesgos

- **Frases compuestas que se escapan**: alguna concatenación que no se vea al leer el código. El pseudoidioma y
  `__cl.sinTraducir` en las pruebas lo cazan.
- **Calidad del rumano**: un borrador automático puede sonar raro a un niño. Por eso la revisión de una persona
  rumanohablante antes de enseñar el idioma (decisión 7).
- **Voz rumana que no está** en el aparato: aviso en la zona de adultos (decisión 6).
- **Conflictos con otros PR**: las fases ID2 y ID3 tocan muchos archivos que también cambian las fases P y M. Se harán en
  PR pequeños y se traerá `main` a menudo; las frases nuevas de otras fases se traducirán en la ID9 (la prueba dirá
  cuáles faltan).
- **Frases nuevas después**: cada frase nueva del juego tendrá que traducirse. La regla de `dialogos/LEEME.md` se amplía:
  la frase nueva se apunta en `pendientes.txt` y la prueba avisa de que falta su rumano.

## 8. Lo que no cambia

- El castellano de España sigue siendo el idioma del código, el principal y el que sale por defecto.
- Las partidas guardadas no se rompen: `S.idioma` es un campo nuevo con valor por defecto.
- Las reglas de documentación y de diálogos siguen igual; el catálogo `todos.csv` sigue siendo la lista de todos los
  textos, ahora también la de lo que hay que traducir.

## 9. Fases hechas

### ID0 (v0.2.114): preparar sin cambiar el juego

- **Letras del rumano en la página**: `public/fonts/andika-700-ro.woff2` (Andika, su recorte latin-ext) y
  `public/fonts/baloo2-700-ro.woff2`, solo con Ă ă, Ș ș, Ț ț y las antiguas Ş ş, Ţ ţ (3,5 KB y 1,6 KB). Fredoka no tiene
  esas letras en ninguna versión, así que se toman de **Baloo 2**, otra letra redondeada de Google Fonts (licencia OFL,
  como las otras dos). Van como otra `@font-face` de «Andika» y de «Fredoka» con `unicode-range`
  (`LETRAS_RO` en `herramientas/vite/curiolandia.mts`): el navegador las usa solo para esas letras, y el resto sigue
  igual. `aplicacion/arranque.ts` las pide al cargar (con el texto `'Aaăș'`) y el service worker las guarda.
- **El catálogo incluye la zona de adultos y `head.html`**: `herramientas/dialogos/catalogo.mts` los lee al final, con el
  tipo `adultos`, y de su HTML saca solo lo que se lee (entre etiquetas y en `title`, `aria-label`, `placeholder` y
  `alt`). Son unos 340 textos más: el catálogo pasa de 3.156 a 3.946.
- **Lista de trabajo de la ID2**: `herramientas/idiomas/compuestas.mts` (`npm run idiomas:compuestas`, y con `-- --todo`
  cada sitio con su línea): 376 frases compuestas y 57 trucos de gramática. Los archivos con más: `temas/temas5.ts`
  (62 y 16), `temas/letras.ts` (55 y 3), `temas/temas4.ts` (41 y 3), `juegos/comps.ts` (22 y 16), `escenas/escenas2d.ts`
  (32), `juegos/comps2.ts` (18 y 6), `escenas/zonas.ts` (19 y 1), `escenas/tienda.ts` (17 y 1) y `temas/temas.ts` (16 y 1).
- Pruebas: `tests/unidad/idiomas.test.ts`, y `dialogos.test.ts` y `montaje.test.ts` amplían las suyas.

