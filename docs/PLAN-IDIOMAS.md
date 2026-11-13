# Plan para que Curiolandia hable varios idiomas (primero, el rumano)

Fernando lo pidió el 9 de noviembre de 2026: «quiero hacer que curiolandia-new pueda ser multiidioma y el primer idioma a
incorporar además del castellano debería ser el rumano», y después: «crea un plan y revisa a fondo los cambios que hay que
hacer, ya que no solo los diálogos deberían ser multiidioma sino que también los textos que se muestran».

**Estado: aprobado, en marcha.** Fernando fusionó el plan el 9 de noviembre de 2026 (PR #122): se toma lo recomendado en
las decisiones del apartado 3. Hechas: **ID0** (v0.2.114), **ID1** (v0.2.116) **ID2a** (v0.2.118), **ID2b** (v0.2.119), **ID2c** (v0.2.120), **ID2d** (v0.2.122), **ID2e** (v0.2.124), **ID2f** (v0.2.127) e **ID3** (v0.2.132), y de la ID4 (el rumano, por partes), **ID4a** (v0.2.134), **ID4b** (v0.2.136), **ID4c** (v0.2.138) e **ID4d** (v0.2.140), y de la ID5, **ID5a** (v0.2.142), **ID5b** (v0.2.144) e **ID5c** (v0.2.145), apartado 9. Si cambia una decisión, se apunta aquí y en
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

### ID1 (v0.2.116): el núcleo de los idiomas

- **Reglas** en `src/dominio/idiomas.ts` (pruebas en `tests/unidad/idiomasReglas.test.ts`): `IDIOMAS` (castellano
  completo, rumano sin completar y el pseudoidioma de prueba `xx`), `idiomaActivo` (manda `?idioma=` en la dirección,
  luego `S.idioma`, luego el navegador), `idiomasElegibles`, `rellena` (plantillas con `{huecos}`, para la ID2) y
  `pseudo`.
- **`src/nucleo/traducir.ts`**: `iniciarIdioma()` (lo llama el arranque, antes de nada; la primera vez guarda en
  `S.idioma` el idioma del navegador), `tr(texto)` (busca el texto en castellano en la tabla del idioma; lo que no está
  sale en castellano y se apunta en `sinTraducir`), `trHtml(raiz)` (traduce los textos y los atributos `title`,
  `aria-label`, `placeholder` y `alt` de un trozo de HTML) y `ponIdioma(id)` (guarda y recarga). No se traducen nunca el
  inglés (lo que empieza por `@`), lo que no lleva letras ni las letras sueltas (las de la Isla de las Letras).
- **Dónde se traduce**: `say()` (y por ella `sayQ`, `say3`...), `sayTTS` (la prueba de voz), `text()` del lienzo, las
  ventanas de `head.html` al arrancar y cada página y el menú de la zona de adultos al pintarlos. En castellano `tr` y
  `trHtml` no hacen nada: el juego queda igual.
- **La voz** se elige en el idioma del juego (`vocesES` y `pickVoice` miran `idioma().voces`; sin voz de ese idioma,
  ninguna, nunca la de otro idioma).
- **`S.idioma`** (`'es'` o `'ro'`, campo suelto, se conserva al empezar de nuevo). La tabla del rumano,
  `src/idiomas/ro/textos.ts`, está vacía hasta la ID4.
- **Selector** «Idioma» en «Tito y el sonido»: solo sale si hay más de un idioma que elegir (hoy, solo con
  `?idioma=ro`). Al cambiarlo, el juego se recarga.
- **Para probar**: `index.html?idioma=xx` enseña cada texto traducido entre ⟦ ⟧ y un 30 % más largo; lo que se ve sin
  corchetes se escapa de la traducción (frases compuestas, ID2; rótulos 3D y textos que el HTML cambia después, ID3).
  `index.html?idioma=ro` usa la tabla del rumano, y `__cl.sinTraducir()` lista lo que falta.

### ID2a (v0.2.118): la gramática por idioma

La ID2 se parte: la **ID2a** pone la gramática de cada idioma y quita los trucos del castellano; las **ID2b** y
siguientes pasan las frases compuestas a plantillas, por grupos de archivos (`npm run idiomas:compuestas` dice cuántas
quedan: 383 al terminar la ID2a, con la P11).

- **El idioma se decide al cargar** `nucleo/traducir.ts` (justo después de `guardado.ts`), así que las tablas que se
  calculan al cargar ya salen en su idioma (`NUM`).
- **`fmt(plantilla, huecos)`**: traduce la plantilla entera y rellena sus huecos (`'Tienes {n} monedas.'`). Un hueco
  con mayúscula (`{Cosa}`) pone en mayúscula la primera letra de `cosa`, para empezar la frase. Lo que sale de `fmt`
  (y de `nombreEn`) se recuerda como ya traducido, para que `say()` y `text()` no lo traduzcan otra vez.
- **Los nombres, con sus formas** (`Nombre` en `dominio/idiomas.ts`: con artículo, sin él, género —en rumano también
  neutro—, plural, su plural, y tras «de» y «a»). La clave es el nombre en castellano con su artículo (el de `LEX` o el
  `name` de una cosa). `nombreEn(frase)` da las formas en el idioma del juego: en castellano salen del artículo
  (`formasEs`, lo mismo que antes); en rumano, de `src/idiomas/ro/nombres.ts` (vacía hasta la ID4).
- **`W_`, `Wn`, `dela`, `ala`** (`nucleo/idioma.ts`) y **`nameT`, `isPl`, `fem`, `esta`, `eseEs`, `plural`, `unN`**
  (`juegos/comps.ts`) usan esas formas: ya no miran el artículo del texto. `femPl(k)` es el femenino al contar varias
  (en rumano, también los neutros). `esta` y `eseEs` son plantillas de `fmt`.
- **Números en rumano**: `NUM` es `NUM_RO` al jugar en rumano y `unN` usa `cantidadRo` (un/o, doi/două, «de» desde el
  20), en `src/idiomas/ro/numeros.ts`.
- **Trucos quitados**: el «de el» → «del» del cofre, el «se abrió/se abrieron» del mapa, el «es/son para» de la
  tienda, el «Cuántos/Cuántas» de las sumas de `temas5.ts` y el «el primero» → «PRIMERO» de los ordinales: ahora son
  plantillas con las formas del nombre. Quedan los de la Isla de las Letras (`temas/letras.ts`, `juegos/lectura.ts`),
  que es propia del castellano y tendrá su versión rumana en la ID6.
- En castellano el juego dice y escribe lo mismo que antes (lo comprueban `npm run test:pr` y las frases de `__said`).

### ID2b (v0.2.119): las frases del mapa, la tienda, la asamblea y el cofre

- **69 frases compuestas pasan a plantillas** de `fmt` en `escenas/zonas.ts`, `tienda.ts`, `escenas2d.ts` y
  `cofre.ts`; quedan 314 (`npm run idiomas:compuestas`). Cada variante (uno o varios, masculino o femenino, se abre o se
  abren) es una plantilla entera: el traductor ve la frase completa.
- **`juntar(...trozos)`** (`nucleo/traducir.ts`): para las frases que se dicen seguidas y alguna depende de algo (el
  saludo según la hora, la presentación del tema, «¡Ya tiene dos!» detrás de otra frase). Cada trozo va ya traducido
  (`tr` o `fmt`) y el resultado no se traduce otra vez; en castellano sale lo mismo que pegarlos con un espacio.
- **Fechas**: los días, los meses y las estaciones se traducen como palabras sueltas (`tr(DIASL[i])`) antes de ir a su
  hueco. Las estaciones con artículo (`el otoño`, `la primavera`), para «después viene…» y «el árbol del…», son
  nombres (`nombreEn`).
- **Nombres de la tienda**: los caparazones y las bufandas de colores tienen su nombre entero escrito (`'el caparazón
  rosa'`), para que esté en el catálogo y en la tabla de nombres; el del vale es una plantilla (`'el vale: {vale}'`).
- `lowName(t)` (el nombre del tema en minúscula) y los nombres de los sitios del mapa salen en el idioma del juego, y el
  «dormida/dormido» y el «se abre/se abren» se eligen por el género y el número del nombre.
- Las plantillas nuevas están en `dialogos/pendientes.txt`. En castellano el juego dice lo mismo (`npm run test:pr`).

### ID2c (v0.2.120): los juegos comunes

- **38 frases compuestas** de `juegos/comps.ts` y `juegos/comps2.ts` (los juegos que usan muchos temas: contar,
  pintar, sonidos de animales, partes del cuerpo, series, derecha e izquierda, tarjetas en orden y cuentos) pasan a
  plantillas; quedan 276.
- Lo que llega de las tablas de contenido (las partes del cuerpo, los colores, las tarjetas, los títulos y las páginas
  de los cuentos, las preguntas) se traduce con `tr` antes de ir a su hueco. Los sonidos de los animales, con
  `sonidoSin(k)` (traducido, sin ¡ ! y en minúscula).
- «¿Cuántos/Cuántas…?» y «Toca cada uno/una» se eligen con `femPl` (en rumano, los neutros cuentan como femeninos);
  «pintarlo/pintarla», con `fem`.
- Las plantillas nuevas están en `dialogos/pendientes.txt`. En castellano el juego dice lo mismo (`npm run test:pr`).

### ID2d (v0.2.122): los temas de 3 y 4 años

- **57 frases compuestas** de `temas/temas.ts` y `temas/temas4.ts` pasan a plantillas; quedan 219 (las de los temas de
  5 años, la Isla de las Letras y algunas escenas).
- Los días (los vagones, «¿qué día falta?»), las emociones (`EMOADJ`, `EMO`), los sitios (`nm`) y las preguntas de las
  tablas se traducen con `tr` antes de su hueco; las estaciones, los momentos del día y las formas son nombres
  (`nombreEn`, con su forma «de»: «el árbol del otoño», «de la primavera»).
- Las plantillas nuevas están en `dialogos/pendientes.txt`. En castellano el juego dice lo mismo (`npm run test:pr`).

### ID2e (v0.2.124): los temas de 5 años

- **61 frases compuestas** de `temas/temas5.ts` pasan a plantillas; quedan 158 (la Isla de las Letras, que espera a
  la ID6, y las escenas sueltas: la casa, la granja, el deporte, la excursión...).
- Los meses, los colores, los adjetivos («más pesado») y las frases de las tablas se traducen con `tr` antes de su
  hueco; los contenedores, las formas y los puestos de la fila («el primero», «el último») son nombres (`nombreEn`).
- La v0.2.123 se deja para el PR #127 (P12a), que aún tenía la v0.2.122.
- Visto con `?idioma=xx`: en el pseudoidioma, `plural()` añade la terminación castellana al nombre ya marcado («⟦pelota··⟧es»). Solo afecta a la prueba (en rumano sale el `plu` de la tabla); se arreglará en la ID3 con los demás detalles de pantalla.
- Las plantillas nuevas están en `dialogos/pendientes.txt`. En castellano el juego dice lo mismo (`npm run test:pr`).

### ID2f (v0.2.127): la casa, la granja, el deporte y las demás escenas

- **92 frases compuestas** de las escenas sueltas pasan a plantillas: la casa de Tito (habitaciones, Pipo, la cocina,
  las mascotas, el baño, el cielo, el álbum y el globo), el repaso, los retos, el yoga, «Tito dice», las carreras, el
  cole, el patio, las dos islas, el diccionario, el libro de letras, la excursión, la granja y sus crías y talleres, el
  gran día del deporte y sus pruebas, el álbum de excursiones y la portada. **Fuera de la Isla de las Letras ya no queda
  ninguna** (`tests/unidad/idiomas.test.ts` lo comprueba); quedan las 66 de `letras.ts` y `lectura.ts`, para la ID6.
- Los nombres con artículo (las habitaciones, los animales, las crías y sus madres, las pruebas, las excursiones, las
  zonas de las islas) van con `nombreEn`, y las formas «a» y «de» sustituyen a los arreglos castellanos (`alAnimal`,
  `deCria`, `deNombre`, que se quitan). `nombreExcursion(e)` (`escenas/excursion.ts`) saca las formas del nombre de una
  excursión, que se escribe con mayúscula. «Cerrada» o «cerrado» y «está» o «están» salen del género y el número del
  nombre en el idioma del juego (`femenino`, `.pl`).
- La cocina de Tito cuenta las frutas con `unN` (y su `plural`, que ahora se exporta) en lugar de sus tablas de números
  y plurales en castellano.
- En el dominio, que no traduce: `fraseLugar` de las carreras pasa a `mundo3d/carreras3d.ts` y el dominio solo da los
  lugares (`lugaresDelPodio`); `fraseMedallero` del deporte recibe la función que traduce (`tr`) y monta la frase con
  plantillas y `rellena` (sin ella, en castellano, como antes).
- Pendiente para la ID3: las fechas del álbum de excursiones («9 de noviembre», `diaYMes` y `vecesTexto` del dominio)
  llevan el «de» y el «veces» en castellano, y los números de las medallas en rumano necesitan su género.
- La v0.2.127: la v0.2.125 la tomó la M3b (PR #123) y la v0.2.126, el PR #127 (P12a).
- Las plantillas nuevas están en `dialogos/pendientes.txt`. En castellano el juego dice lo mismo (`npm run test:pr`).

### ID5c (v0.2.145): los temas de 4 años en rumano

- **Tabla nueva `src/idiomas/ro/temas4.ts`** (`TEMAS4_RO`, unos 300 textos): los doce temas de 4 años y su Rincón de los
  Conceptos (`temas/temas4.ts`). Las emociones van en masculino («vesel», «speriat») y las plantillas rumanas las ponen
  tras «cineva» o «se simte» («Acolo e cineva vesel»), para no concordarlas con «fețișoara»; quien revise el rumano
  puede afinarlo.
- `nombres.ts`: las formas (triángulo, rectángulo, óvalo, rombo), las partes de la planta, las torres y los lápices,
  la mañana, la tarde y la noche, y, como nombres de tarjeta, los días («el lunes»), los colores de las series y las
  posiciones («delante»).
- Frases compuestas: `unN` (`juegos/comps.ts`, «patru struguri») sale marcada como ya traducida, y la respuesta
  equivocada de los cinco sentidos se junta con `juntar`. En la ciudad y en la casa, la plantilla rumana dice «merge»
  («Mingea merge în parc»; antes, en la casa, «stă»).
- Jugando con `?idioma=ro`, con 4 y con 5 años, cada juego de estos temas con toques al azar, solo quedan los cuentos
  (ID5e). Queda para la revisión un caso raro: con una sola uva sale «un struguri» (el rumano dice «un strugure»).
- Versión: la v0.2.143 la lleva el PR #144 (P13b, el circuito). En castellano todo sigue igual.

### ID5b (v0.2.144): los temas de 3 años y los especiales en rumano

- **Tabla nueva `src/idiomas/ro/temas3.ts`** (`TEMAS3_RO`, unos 350 textos): los doce temas de 3 años y el Rincón de los
  Conceptos (`temas/temas.ts`), y los especiales de `temas/extras.ts` (las canciones, las rutinas, los trazos, el
  cumpleaños, la Navidad, el carnaval y el Día del Libro). Lleva también lo que el código compone y el catálogo no ve:
  los días y los colores de las canciones con su artículo («el lunes», «el rojo»), los días y los meses con mayúscula,
  los versos de las canciones de los colores y de las estaciones, y los colores concordados (`colorAdj`: «roja»,
  «amarillas»), que en rumano van tras «culoarea» con su nombre («are culoarea roșu»). Lo que no está en el catálogo
  sale en `dialogos/ro.csv` con el tipo «tabla», para que también lo revise quien hable rumano.
- `nombres.ts`: mamá y papá, la lancha y el helicóptero, las piezas del muñeco de nieve, el círculo y el cuadrado, las
  viñetas de las rutinas y las opciones del Rincón de los Conceptos («muchas galletas», «de día», «el grande»).
- **Frases compuestas que se escapaban** (salían bien en castellano, pero en rumano se quedaban a medias o se apuntaban
  como sin traducir; se ven jugando, no al abrir el juego):
  - `praise()` (`nucleo/voz.ts`) da la felicitación ya traducida: «¡Muy bien, Ana!» se quedaba en castellano, porque con
    el nombre ya no estaba en la tabla.
  - `cap()` conserva la marca de «ya traducido» (`estaTraducido`, `nucleo/traducir.ts`), y `tr` deja como está un texto
    ya traducido con un punto detrás («Mărul.»).
  - Las felicitaciones con el nombre de la cosa, la parte del cuerpo o el color (`juegos/comps.ts` y `comps2.ts`) y los
    «Esa es la pera. ¿Dónde está...?» de las respuestas equivocadas se juntan con `juntar`, y la pregunta pasa por `tr`
    (en temas/extras.ts también; en temas5.ts, en la ID5d). «La fresa es roja» va con plantilla (`fmt`).
  - El rótulo de las tarjetas de «Conocer» (`juegos/comps.ts`) se traduce antes de ponerlo en mayúsculas.
  - Los números en rumano, también con mayúscula («Unu»), como ya traducidos (`textos.ts`).
- Jugando con `?idioma=ro`, con 3 y con 5 años, cada juego de estos temas con toques al azar, lo único que queda sin
  traducir son los cuentos (ID5e).
- Versión: la v0.2.143 la lleva el PR #144 (P13b, el circuito). En castellano todo sigue igual.

### ID5a (v0.2.142): los nombres de los dibujos y los juegos comunes en rumano

- La ID5 (los temas, sus juegos y los cuentos: unos 2.000 textos) va también por partes: **ID5a**, lo que comparten
  todos los temas; ID5b, ID5c e ID5d, los temas de 3, 4 y 5 años; ID5e, los cuentos y el cielo 3D.
- **Tabla nueva `src/idiomas/ro/lex.ts`** (`LEX_RO`, unos 270 nombres con sus formas): los dibujos de LEX
  (`nucleo/idioma.ts` y `contenido/lex.ts`) y las partes del cuerpo del niño dibujado. `nombres.ts` la junta con la
  suya, y las formas de `nombres.ts` mandan si un nombre está en las dos.
- **Tabla nueva `src/idiomas/ro/juegos.ts`** (`JUEGOS_RO`, unos 150 textos): las frases de los juegos comunes
  (`juegos/comps.ts` y `comps2.ts`), los colores, los números y las partes del cuerpo tal como se dicen, y los sonidos
  de los dibujos de `contenido/lex.ts`.
- **Derecha e izquierda** (`Cruce`, `juegos/comps2.ts`): el castellano dice «Vamos al parque» (`ala`), y el rumano pide
  el sitio sin artículo tras «la» («Mergem la parc»). Las frases llevan los dos huecos, `{lugar}` y `{sitio}` (`Wn`), y
  cada idioma usa el suyo.
- Jugando con `?idioma=ro` todos los juegos de cada casita (menos la Isla de las Letras), lo que queda sin traducir es
  ya solo de los temas (ID5b a ID5d), los cuentos (ID5e) y el inglés (ID7).
- Versión: la v0.2.141 la lleva el PR #144 (P13b, el circuito) y la v0.2.140 la tomó la ID4d. En castellano todo sigue igual.

### ID4d (v0.2.140): el cole, el patio, las excursiones y el deporte en rumano

- **Tabla nueva `src/idiomas/ro/cole.ts`** (`COLE_RO`, unos 450 textos): el cole y el patio, las estatuas, «Tito
  dice» y sus órdenes, el yoga de los animales, los retos en casa (lo que dice Tito y la lista de la zona de adultos),
  las carreras 3D con los lugares del podio, el gran día del deporte y sus cuatro pruebas, los juegos cortos (rayuela,
  columpios, penaltis, pompas, cometa, pañuelo y sillas), el escondite, el autobús, el álbum de excursiones y la granja
  escuela (comer, huevos, queso, cepillar, huerto, tractor, el manzano y las crías con sus nombres). Y lo poco que
  quedaba fuera de los temas: los nombres de juegos que salen en el repaso, las emociones y los planetas del cielo 3D.
  Con esto, **la ID4 está completa**: fuera de los temas, los juegos y las islas solo quedan sin traducir las palabras
  sueltas en inglés y las letras de los carteles (de la ID6 y la ID7).
- **Nombres con sus formas** (`nombres.ts`): los sitios del cole, las pruebas del deporte, las excursiones (su `a` es
  lo que va tras «Mergem»: «la ferma-școală»), los animales de la granja y sus crías.
- **Las plantillas rumanas del deporte** ponen la prueba delante («{Prueba}: medalie de {medalla}!»): tras «la» o «în»
  el rumano quiere el nombre sin artículo, y el hueco lleva el artículo.
- **Arreglos que salieron al traducir**: los nombres de las crías se guardan en castellano y se decían sin traducir
  (ahora con `tr`, `escenas/granjaCrias.ts`); las cuentas (el equilibrio, la rayuela, el escondite...) dicen `NUM`, ya
  en rumano, y `tr` las apuntaba como sin traducir: `textos.ts` lleva los números rumanos como ya traducidos.
- **Prueba**: la I5 de `tests/regresion/idiomas.js` recorre también estas escenas (`escena:x` abre la excursión x).
- Versión: la v0.2.139 queda para el PR #144 (P13b, el circuito), cuyas frases nuevas se traducen después. En
  castellano todo sigue igual.

### ID4c (v0.2.138): la casa de Tito en rumano

- **Tabla nueva `src/idiomas/ro/casa.ts`** (`CASA_RO`, unos 340 textos): lo que dice Tito con cada cosa, sus otras
  formas de jugar, las combinaciones, las rutinas del día y el reloj (`contenido/casa.ts`); la casa, el baúl y los
  nombres de las habitaciones en su título; el álbum de sorpresas; las escenas del telescopio, el globo terráqueo, el
  piano, la pizarra, la tele, la merienda, la sopa, el baño, las buenas noches y el huerto; las mascotas (sus nombres
  para elegir, traducidos a nombres rumanos de mascota donde el castellano lo es: Copito, «Fulguț») y la casa 3D de
  prueba. Las frutas de la merienda tienen sus formas en `nombres.ts`.
- **Arreglo que salió al traducir**: el nombre elegido de la mascota se guarda en castellano (así no se pierde si se
  cambia de idioma) y se decía sin traducir; ahora `nombreDe` (`escenas/casaMascotas.ts`) lo traduce y lo marca con
  `juntar`, y el título de la mascota ya no se traducía dos veces.
- **Prueba**: la I5 de `tests/regresion/idiomas.js` recorre también la casa, sus escenas y cada mascota (`escena:inst`).
- Versión: la v0.2.137 queda para el PR #142 (P13a). En castellano todo sigue igual.

### ID4b (v0.2.136): la portada, el mapa, la asamblea, la tienda, el cofre, el repaso y las islas en rumano

- **Tabla nueva `src/idiomas/ro/escenas.ts`** (`ESCENAS_RO`, unos 320 textos): la portada (edad, nombre y el cuento del
  principio), el mapa y sus zonas, la casita de cada tema, la asamblea (emociones, tiempo, días, calendario, estaciones),
  el álbum, la tienda, el cofre, el repaso, la Isla de las Letras y la del Inglés (sus casitas, en la ID6 y la ID7), el
  diccionario de inglés y los carteles 3D del cielo. Y **`TEMAS_RO`**: los nombres de los temas (menos las casitas de la
  Isla de las Letras, que son de la ID6).
- **Nombres con sus formas** (`src/idiomas/ro/nombres.ts`): las cosas de la tienda y la ropa de la asamblea, las
  estaciones, las zonas y los sitios del mapa, las habitaciones de la casa y los temas (sus formas salen de `TEMAS_RO`:
  «de» es «din căsuța …»). En rumano, `art` es la forma con el artículo detrás («șapca») y `de` y `a` la del genitivo y
  dativo («șepcii»): las plantillas rumanas ponen delante lo que haga falta.
- **`{n:de}` en las plantillas** (`rellena`, `dominio/idiomas.ts`): la «de» del rumano entre un número y lo que cuenta,
  que va desde el 20 («Costă 30 de monede», pero «8 monede»; `deRumano`, con su prueba de Vitest).
- **Arreglos que salieron al traducir**: el cofre buscaba las formas del tema por su nombre ya traducido (ahora por el
  castellano, `claveTema`, `escenas/zonas.ts`); en la asamblea, la emoción y su consejo de 5 años se pegaban con `+` y
  el acierto de «¿día o noche?» salía sin traducir (ahora con `juntar` y `tr`).
- **Prueba**: la I5 de `tests/regresion/idiomas.js` recorre también estas escenas con `?idioma=ro`.
- Versión: la v0.2.135 la lleva el PR #140 (P12d). En castellano todo sigue igual.

### ID4a (v0.2.134): la zona de adultos en rumano, el aviso de voz y la hoja de revisión

- La ID4 es sobre todo traducción (unos 1.500 textos fuera de los temas, los juegos y las islas): va en partes. **ID4a**:
  la zona de adultos, las ventanas de `head.html` y el núcleo (días, meses, sonidos de los animales, felicitaciones).
  Siguen ID4b (portada, mapa, tienda, cofre, asamblea y los nombres de los temas), ID4c (la casa de Tito) e ID4d (el cole,
  el patio, las excursiones y el deporte).
- **Las tablas del rumano por partes**: `src/idiomas/ro/adultos.ts` (`ADULTOS_RO`), que `textos.ts` junta con las demás.
  Es un borrador de Claude, con el registro de la zona de adultos (de usted no: tuteando a la familia, como en
  castellano), y lo revisa una persona que hable rumano en la ID9.
- **`tr` encuentra un texto envuelto**: con un dibujo o signos delante («🏠 Resumen», el menú) o puntuación detrás
  («iPhone o iPad:»), busca lo de dentro y deja lo demás (`ENVOLTURA`, en `nucleo/traducir.ts`).
- **Frases de la zona de adultos con números o negritas dentro**: el HTML se traducía por nodos de texto, y «3/5
  juegos» o «Hay <b>3 vales</b> por entregar.» no se podían traducir. Ahora van con `fmtHtml(plantilla, huecos)` (fmt
  ya marcado) y `hecho(html)` (un trozo ya traducido), que `trHtml` no vuelve a tocar (`data-traducido`); en castellano
  no añaden nada y la página queda igual. Los mensajes de la copia de seguridad (`#a-bk-msg`) se traducen al salir.
- **Aviso de voz rumana**: en el Resumen, si se juega en otro idioma y el aparato no tiene voz de ese idioma
  (`hayVozDelIdioma`), con su botón a «Tito y el sonido»; la guía de voces, en rumano, explica cómo instalar una voz
  rumana en cada aparato.
- **Hoja de revisión `dialogos/ro.csv`** (adelantada de la ID5): la escribe `npm run dialogos` (`hojaIdioma` y
  `csvIdioma`, `herramientas/dialogos/catalogo.mts`): cada texto del catálogo con su traducción, su tipo, dónde sale y
  su estado (`borrador` o `falta`), y al final los textos de la tabla que no salen en el catálogo (plantillas y trozos
  del HTML, tipo `tabla`). `tests/unidad/dialogos.test.ts` comprueba que está al día.
- **Prueba**: `tests/regresion/idiomas.js` gana la I5: la zona de adultos con `?idioma=ro`, página a página, sin nada en
  `sinTraducir` salvo los nombres de los temas (ID4b y ID5) y el nombre del niño.
- Versión: la v0.2.133 la lleva el PR #137 (P12c). En castellano todo sigue igual.

### ID3 (v0.2.132): los textos de pantalla

- Medido con el pseudoidioma en las 63 escenas, los tres primeros juegos de cada casita y la zona de adultos: todo lo
  que se pinta y se dice ya pasaba por `tr` (desde la ID1, `text()`, los carteles 3D, `head.html` y la zona de adultos),
  y ningún texto se sale de la pantalla aunque sea un 30 % más largo. Lo que fallaba era lo que no cabe en su cartel.
- **`text()` con ancho máximo** (`{ max }`, `nucleo/dibujo.ts`): si el texto no cabe, la letra se encoge (hasta la
  mitad); lo que ya cabe no cambia. Lo llevan `pill()`, los carteles 3D (`pillTex`, que además mide el texto
  traducido), las tarjetas del autobús, del patio y del deporte (antes, la letra se elegía por el largo en castellano),
  los «¡Muy pronto!», el título del repaso y los días y meses de las tarjetas.
- **Carteles medidos ya traducidos**: los que se hacen a la medida de su texto (el nombre de la casita, de la zona y del
  lugar bajo el ratón en el mapa y las islas, el regalo del cofre, el repaso) miden `tr(texto)`, que es lo que se pinta.
- **Días y meses** de las tarjetas: `tr(DIASL[i]).toUpperCase()` (antes se buscaba «LUNES» en la tabla). Las palabras en
  mayúsculas ya traducidas se apuntan con `juntar` para no traducirlas otra vez.
- Frases pintadas que se pegaban a trozos: «{n} años» de las islas y «{n} de {total}» del yoga.
- **Fechas del álbum de excursiones**: `diaYMes` y `vecesTexto` (`dominio/excursiones.ts`) reciben la función que traduce
  («{dia} de {mes}», «{n} veces»). **Medallas**: `fraseMedallero` recibe también cómo se dice el número; en rumano, en
  femenino (`cantidadRo`: «două medalii»).
- **Pseudoidioma**: `plural()` marca entero el plural castellano (antes, «⟦pelota··⟧es»).
- **Prueba nueva** `tests/regresion/idiomas.js` (en `npm run test:pr`): con `?idioma=xx` recorre todo y falla si Tito
  dice o se pinta algo sin traducir, si un texto se sale de la pantalla o si la zona de adultos enseña algo sin traducir.
  Lo dicho en inglés va también a `window.__saidEn` (no se traduce; `docs/CONTRATO-PRUEBAS.md`). La Isla de las Letras
  se salta hasta la ID6.
- Versión: la v0.2.128 la lleva el PR #127 (P12a). En castellano el juego dice lo mismo; solo cambia el tamaño de algún
  texto que antes no cabía en su cartel.

