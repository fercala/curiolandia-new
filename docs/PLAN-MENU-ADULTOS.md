# Plan para reorganizar la zona de adultos (el menú de los padres)

Fernando lo pidió el 7 de noviembre de 2026: «El menú de los padres de curiolandia-new ha quedado demasiado grande,
quiero que crees un plan de mejoras para dejarlo mejor, pueden ser páginas, pestañas o un menú lateral de categorías,
pero con la cantidad de cosas que tenemos hoy ya es molesto para interactuar». Fernando fusionó el plan el 8 de
noviembre de 2026 y pidió seguir («continua»): se toma lo recomendado en las decisiones del apartado 10. **Estado:
hecha la fase A1 (v0.2.100); siguen A2 a A5 y la A6, opcional.** Si cambia una decisión, se apunta aquí y en
`CAMBIOS.md`. Cada fase va en su rama y su PR, como los planes de la casa, las letras y el inglés. Las fases se llaman A1 a A6 (A de adultos) para no
confundirlas con las fases M de [PLAN-CASA-MEJORA.md](PLAN-CASA-MEJORA.md).

En el código se llama **zona de adultos** (`src/aplicacion/adultos.ts` y, desde la fase A1, la carpeta
`src/aplicacion/adultos/`; panel `#adult` de `src/head.html`); en este
documento «menú de los padres» y «zona de adultos» son lo mismo.

## 1. Qué había antes del plan

La zona se abre manteniendo pulsado 3 s el candado de abajo a la derecha. `openAdult()` construye **todo el panel de una
vez**, como una sola página que se desplaza hacia abajo, y lo vuelve a construir entero cada vez que algo cambia (por
ejemplo, al pulsar «Entregado» en un vale).

### Lo que mide (v0.2.95, partida nueva, medido con Playwright)

| | Móvil en vertical (390 × 844) | Tableta (1024 × 768) |
| --- | --- | --- |
| Alto del panel | **15.588 px, unas 18,5 pantallas** | 7.711 px, unas 10 pantallas |
| Secciones con título | 27 | 27 |
| Controles (botones, casillas, listas, campos) | 67 | 67 |
| Tarjetas de temas en «progreso» | 114 | 114 |
| Dónde empieza «Copia de seguridad» | pantalla 17 | pantalla 9 |

Más de la mitad del alto (de la pantalla 2,5 a la 13 en el móvil) son las 114 tarjetas de los temas, así que lo que se
usa a menudo (vales por entregar, copia de seguridad, «Ir a») queda al fondo. El botón «Volver al juego» está arriba y
se va al desplazar, y no hay forma de saltar a una sección.

### Inventario, en el orden de hoy

| # | Sección | Qué tiene | Campo de `S` |
| --- | --- | --- | --- |
| 1 | Modo de juego | Camino o Libre, con dos notas largas | `unlockAll`, `seenOpen`, `woke` |
| 2 | Perfil | Nombre, edad (3, 4, 5), cumpleaños (día y mes) | `name`, `age`, `bday`, `bdayDone` |
| 3 | Personaje de Tito | Caracol, erizo, tortuga o conejo | `tito.kind` |
| 4 | Idioma y voz | Hemisferio (estaciones), voz del navegador con «Probar», guía «Cómo conseguir voces más naturales», letras de la isla (mayúsculas o ambas), paisaje (Tito comenta o no), volúmenes de voz, música y efectos | `hemi`, `vozNav`, `tipoLetra`, `quiet3`, `vol` |
| 5 | Tiempo de juego | Sin límite, 10, 15 o 20 min, y los minutos de los últimos 7 días | `limit`, `days` |
| 6–16 | Progreso por zonas (11 secciones) | Jardín, Bosque, Montaña, Canciones/rutinas/trazos, Días especiales, 3 zonas de la Isla del Inglés y 3 de la Isla de las Letras: una tarjeta por tema con su barra | `temas` (solo lectura) |
| 17 | Monedas y premios | Monedas, estrellas, cofres, una nota muy larga de cómo se gana todo, los vales (activar, texto y precio) y los vales por entregar | `coins`, `vales`, `valesLog` |
| 18 | Lo que sigue | Próximo tema del camino y una idea para fuera de la pantalla | (solo lectura) |
| 19 | Asambleas | Tiempo y emoción de las últimas 14 | `asam` (solo lectura) |
| 20 | Cómo le va | Tabla de habilidades (aciertos, intentos, etiqueta) | `stats` (solo lectura) |
| 21 | Letras | Tabla de las 20 letras de la isla | `gs`, `temas` (solo lectura) |
| 22 | Inglés | Casitas y palabras por zona, aviso si no hay voz inglesa | (solo lectura) |
| 23 | Casa de Tito | Sorpresas, días del huerto, mascotas y, mientras dure la prueba (fase M0 de `PLAN-CASA-MEJORA.md`), el botón «Casa de Tito en 3D (prueba)» | `sorpresas`, `huerto`, `mascotas` (solo lectura) |
| 24 | Copia de seguridad | Descargar, ver código, cargar archivo, copiar, recuperar | (toda `S`) |
| 25 | Instalar en el celular o la tablet | Botón si el navegador lo ofrece e instrucciones | — |
| 26 | Ir a | 10 atajos a escenas y una lista de todos los temas | — |
| 27 | Empezar de cero | Borrar todo, con confirmación | (toda `S`) |

### Otros problemas que se ven al revisarlo

- **Mezcla de cosas**: «Idioma y voz» junta el hemisferio, la voz, las letras de la isla, el paisaje y los volúmenes;
  el progreso está partido en 17 secciones repartidas entre ajustes.
- **Textos que quedaron en rioplatense o en español de América**, aunque el juego es solo de España desde la fase 5d:
  «se abren de a uno», «Copialo y guardalo», «Seleccioná», «usá», «Revisá», «celular», «Computadora», «ícono»,
  «Agregar a inicio». Son textos del panel, no frases de Tito: no tienen audio ni están en `dialogos/todos.csv`
  (el catálogo deja fuera la zona de adultos), así que se pueden cambiar sin coste.
- **Accesibilidad**: el panel no es un diálogo para los lectores de pantalla (`role="dialog"`, `aria-modal`), el foco no
  entra ni se queda dentro, Escape no lo cierra, el texto blanco del botón «Volver al juego» sobre lavanda tiene un
  contraste de 2,99 : 1 (hace falta 4,5 : 1) y algunas opciones miden menos de 44 px de alto en el móvil.
- **Código**: `adultos.ts` tiene 880 líneas, con todo el HTML en una plantilla enorme («no se pueden poner comentarios
  dentro»), y cada cambio vuelve a pintar el panel entero.

## 2. Opciones para ordenarlo

| Opción | Cómo es | A favor | En contra |
| --- | --- | --- | --- |
| A. Pestañas arriba | Una fila de 6 o 7 pestañas y debajo su contenido | Conocida, rápida de cambiar | En el móvil no caben 7 pestañas: hay que desplazarlas de lado y se esconden; el progreso, con sus subapartados, pediría pestañas dentro de pestañas |
| B. Menú lateral de categorías | Lista de categorías a la izquierda y el contenido a la derecha | Se ve todo lo que hay de un vistazo, caben subapartados, es lo habitual en los ajustes de un ordenador o una tableta | En el móvil en vertical la columna lateral quita casi todo el ancho |
| C. Páginas | Una portada con tarjetas por categoría; al tocar una, se entra en su página con «‹ Atrás» | Ideal en el móvil (como los Ajustes del iPhone), cada página es corta | En la tableta desaprovecha el ancho y obliga a ir y volver para cambiar de categoría |
| D. Una página con apartados plegables | Lo de hoy, con cada sección cerrada | Lo más barato | Sigue siendo una lista larga; no arregla el desorden ni el «Volver» que se va |

### Recomendación: B y C a la vez (una sola estructura que se adapta)

Las categorías son las mismas y el código es el mismo; solo cambia cómo se ven según el ancho:

- **Tableta y ordenador** (ancho de 720 px o más): **menú lateral** con las categorías (icono y nombre) y la página
  elegida a la derecha.
- **Móvil en horizontal** (el juego se juega casi siempre así, con poca altura): **menú lateral estrecho**, solo con
  iconos grandes y el nombre debajo en pequeño.
- **Móvil en vertical**: **páginas**. Se abre en la portada («Resumen») con las categorías como tarjetas; al tocar una se
  entra en ella y arriba sale «‹ Categorías».

Así no hay pestañas que se esconden, cada página es corta y en cualquier tamaño se ve a la primera qué hay.

### Categorías propuestas (7)

| Categoría | Qué va dentro (de las secciones de hoy) | Por qué |
| --- | --- | --- |
| 🏠 **Resumen** (se abre aquí) | Lo nuevo: quién juega y su edad, minutos de hoy, monedas y estrellas, «Lo que sigue» (18), avisos (vales por entregar, sin voz inglesa en este aparato) y los atajos de «Ir a» más usados | Lo que se mira casi siempre, sin buscar |
| 🧒 **Quién juega** | Perfil (2): nombre, edad, cumpleaños | Datos del niño o la niña |
| 🎮 **Cómo se juega** | Modo de juego (1), tiempo de juego (5, sin los minutos, que pasan a «Progreso»), letras de la isla, estaciones (hemisferio) y paisaje (de 4) | Reglas del juego que decide la familia |
| 🐌 **Tito y el sonido** | Personaje de Tito (3), voz del navegador con «Probar» y la guía de voces, volúmenes (de 4) | Cómo se ve y cómo suena |
| 📊 **Progreso** | Con subapartados: *Zonas* (las 11 de hoy, cada una en una fila con su barra; se toca para ver sus temas), *Cómo le va* (20), *Letras* (21), *Inglés* (22), *Asambleas* (19), *Casa de Tito* (23) y *Minutos por día* (de 5) | Todo lo que se consulta junto; deja de ocupar media zona |
| 🎟️ **Premios y vales** | Monedas y premios (17): monedas y estrellas, vales por entregar arriba, configurar los vales, y «Cómo se ganan las monedas» plegado | Lo que la familia toca cuando el niño compra un vale |
| 💾 **Copia y aparato** | Copia de seguridad (24), instalar (25), «Ir a» completo con la lista de temas (26) y, al final y separado, «Empezar de cero» (27) | Herramientas del aparato; borrar queda lejos de lo que se toca a diario |

### Mejoras que van con la nueva estructura

- **Cabecera fija**: «Volver al juego» y el título de la página siempre a la vista. Escape cierra la zona.
- **Resumen con avisos**: un número en la categoría cuando hay algo que hacer (por ejemplo, «🎟️ 2» si hay dos vales por
  entregar).
- **Progreso compacto**: 11 filas en lugar de 114 tarjetas; la tabla «Cómo le va» enseña primero lo que le cuesta y las
  10 habilidades más practicadas, con «Ver todas».
- **Notas largas plegadas**: las explicaciones (camino y libre, cómo se ganan las monedas) en un «Más información» que se
  abre al tocarlo.
- **Al volver a la zona** se abre en el Resumen (o en la última página, según la decisión 4).
- **Solo se vuelve a pintar la página que cambia**, no la zona entera.

## 3. Cómo se hace por dentro

- `src/aplicacion/adultos.ts` se parte en una carpeta `src/aplicacion/adultos/`: un módulo por categoría
  (`resumen.ts`, `quienJuega.ts`, `comoSeJuega.ts`, `titoYSonido.ts`, `progreso.ts`, `premios.ts`, `copia.ts`), el panel
  y su navegación (`panel.ts`) y la copia de seguridad (`copiaSeguridad.ts`, con `bkEncode`, `bkDecode` y `bkWire`).
- Las categorías son **datos**: una tabla `PAGINAS_ADULTOS` con `id`, título, icono y dos funciones, `html()` (lo que se
  ve) y `conectar(el)` (los `onchange` que guardan en `S`). Una opción nueva es una fila en la página que toque
  (`COMO-AGREGAR.md` se actualiza).
- Las cuentas que hoy van dentro del HTML (etiqueta de cada habilidad «Lo sabe / En camino / Le cuesta», resumen de cada
  zona, avisos del resumen) pasan a reglas puras en `src/dominio/` con pruebas de Vitest, como las de las letras y la casa.
- `adultos.ts` sigue existiendo como entrada (exporta `openAdult`, `closeAdult`, `bkEncode`, `bkDecode`, `doReset`...),
  así el puente y `window.__cl` no cambian de sitio.
- El catálogo de frases deja fuera `aplicacion/adultos.ts` (`FUERA` en `herramientas/dialogos/catalogo.mts`): pasa a
  dejar fuera la carpeta entera.
- Estilos: las reglas de `#adult` de `head.html` suman las del menú lateral, la portada de tarjetas y la cabecera fija,
  con `@media` para los tres tamaños. Sin dependencias nuevas.

## 4. Móvil y accesibilidad

- Tres tamaños probados en cada fase: móvil en vertical (390 × 844), móvil en horizontal (844 × 390) y tableta
  (1024 × 768), con las zonas seguras del iPhone (`env(safe-area-inset-*)`).
- Botones, opciones y categorías de 44 × 44 px como mínimo.
- El panel es un diálogo (`role="dialog"`, `aria-modal="true"`, con su título); al abrirlo el foco va dentro y se queda
  dentro, y al cerrarlo vuelve al juego. Escape cierra.
- El menú es un `<nav>` con botones y `aria-current` en la categoría abierta; al cambiar de página el foco va a su título.
  Con el teclado se pasa de categoría con las flechas.
- Contraste de 4,5 : 1 como mínimo (hay que cambiar el botón «Volver al juego»), y nunca el color solo para decir algo:
  las etiquetas de progreso llevan siempre su texto.
- Con «reducir movimiento» del sistema, sin animaciones al cambiar de página.
- El niño no puede entrar sin querer: el candado de 3 s sigue igual.

## 5. Partidas guardadas (`S`)

**El plan no cambia nada de `S`**: todos los controles siguen guardando en los mismos campos y con los mismos valores, no
hace falta migración ni subir `S.ver`, y las copias de seguridad de antes se recuperan igual. La página abierta se
recuerda solo mientras el juego está abierto (`VIVO`), no en la partida. Solo la fase opcional A6 propone un campo nuevo
(la fecha de la última copia), y sería opcional y sin migración (ver la decisión 5).

## 6. Pruebas y contrato con las pruebas (`window.__cl`)

- **Se conservan** los `id` y `name` de todos los controles (`#a-name`, `[name=a-age]`, `[name=a-mode]`, `#a-vnav`,
  `#a-vprueba`, `#a-mus`, `[data-von]`, `[data-vgive]`, `#a-bk-txt`, `#a-bk-load`, `#a-tema`, `#a-gotema`, `#a-close`...),
  el `#adult` con su `hidden`, `openAdult`, `closeAdult`, `bkEncode`, `bkDecode` y `doReset`.
- **Todas las páginas se pintan al abrir** y se esconden las que no se ven, para que las pruebas que buscan un control
  con `document.querySelector` lo sigan encontrando.
- **Se añade** al contrato `openAdult(pagina?)`, que abre la zona en una página (`'resumen'`, `'premios'`...), para las
  pruebas que pulsan con Playwright, que necesitan el control a la vista: «vale-desactivado» y «vale-canje-control»
  (`cobertura.js`, página de premios), «Ir al tema» (`cobertura.js`, copia y aparato), la recuperación de copia
  (`ampliada.js`), la guía de voces (`voces.js`) y la sección «Casa de Tito» (`casa.js`, que busca el `h3`). Se cambian
  en el mismo PR y se apuntan en `CONTRATO-PRUEBAS.md`.
- **Prueba nueva** `tests/regresion/adultos.js`, en `test:pr`: en los tres tamaños, cada categoría se abre, no hay
  desplazamiento de lado, «Volver al juego» se ve siempre, Escape cierra, cada control guarda en su campo de `S`, y al
  recargar todo sigue igual.
- **Pruebas de unidad**: que `PAGINAS_ADULTOS` tenga ids únicos y que cada control del contrato esté en alguna página
  (`tests/unidad/`), y las reglas nuevas del resumen y del progreso.

## 7. Reglas del proyecto que se cumplen

- Cada función nueva o cambiada con su comentario de cabecera, los documentos de `docs/` al día (`ARQUITECTURA.md` §13,
  `COMO-AGREGAR.md` §12, `CONTRATO-PRUEBAS.md`, `COBERTURA-PRUEBAS.md`) y una entrada en `CAMBIOS.md` en cada fase.
- Todo en castellano de España.
- **Diálogos**: la zona de adultos no habla (la única frase, la de «Probar» la voz, ya existe y no cambia), así que no
  hay frases nuevas que apuntar en `dialogos/pendientes.txt`. Si alguna fase añadiera una frase dicha con `say()`, se
  apunta en `pendientes.txt` y se rehace `dialogos/todos.csv` con `npm run dialogos`.
- Cada fase sube `version` en `package.json`, deja el juego publicable y pasa `npm run test:pr`.

## 8. Fases

| Fase | Qué se hace | Qué ve la familia |
| --- | --- | --- |
| **A1. Estructura y navegación** (hecha, v0.2.100) | Partir `adultos.ts` en `aplicacion/adultos/` con `PAGINAS_ADULTOS`; las 7 categorías con el contenido de hoy movido tal cual; menú lateral, menú de iconos y portada de páginas según el ancho; cabecera fija; Escape; `openAdult(pagina?)`; pruebas actualizadas y `tests/regresion/adultos.js` | La zona ya está ordenada por categorías y nada se pierde |
| **A2. Resumen** | La página de inicio con quién juega, minutos de hoy, monedas, lo que sigue, avisos y atajos; el número de avisos en las categorías; reglas en `dominio/` con Vitest | Lo importante, nada más entrar |
| **A3. Progreso compacto** | Las 11 zonas en filas que se abren, «Cómo le va» ordenado por lo que cuesta con «Ver todas», subapartados de progreso; reglas en `dominio/` con Vitest | El progreso cabe en una o dos pantallas |
| **A4. Textos** | Todo el panel en castellano de España (sin «de a uno», «Copialo», «celular»...), notas largas plegadas en «Más información», títulos y botones más cortos | Se lee más rápido |
| **A5. Accesibilidad y móvil** | Diálogo accesible, foco, teclado, 44 px, contraste, zonas seguras, reducir movimiento; revisión con Playwright en los tres tamaños | Más cómodo con el dedo y con lector de pantalla |
| **A6. Extras (opcional)** | A elegir: recordar la última página abierta, aviso «Hace 30 días que no haces una copia» (campo opcional `S.bkFecha`), buscador de ajustes | — |

A1 es la fase grande y la que cambia el aspecto (hecha: ver «Cómo quedó la fase A1»); A2 a A5 se pueden hacer en otro orden. Calculo que cada una cabe en un PR.

### Cómo quedó la fase A1 (v0.2.100)

- `src/aplicacion/adultos/`: `panel.ts` (`openAdult(pagina?)`, `closeAdult`, menú y navegación), `paginas.ts`
  (`PAGINAS_ADULTOS`), `tipos.ts` (`PaginaAdultos`, `IdPagina`, `AccionesPagina`), una página por categoría
  (`resumen.ts`, `quienJuega.ts`, `comoSeJuega.ts`, `titoYSonido.ts`, `progreso.ts`, `premios.ts`, `copia.ts`),
  `copiaSeguridad.ts` y `comun.ts`. `aplicacion/adultos.ts` queda como entrada (reexporta y define `window.__cl`).
- El contenido de cada sección es el de antes, movido tal cual a su categoría; «Idioma y voz» se reparte entre «Cómo se
  juega» (estaciones, letras de la isla, paisaje) y «Tito y el sonido» (voz y volumen), y los minutos por día pasan a
  «Progreso». El Resumen tiene, por ahora, «Lo que sigue» y cinco atajos (la A2 lo completa).
- Al tocar «Entregado» en un vale o «Instalar», solo se vuelve a pintar esa página.
- Medido con Playwright: sin desplazamiento de lado y con «Volver al juego» a la vista en las 7 páginas, en 390 × 844,
  844 × 390 y 1024 × 768 (`tests/regresion/adultos.js`).
- El panel ya es un diálogo (`role="dialog"`, `aria-modal`), el menú un `<nav>` con `aria-current` y el foco va al
  título de la página al cambiar; lo demás de accesibilidad (foco atrapado, contraste del botón, 44 px) sigue en la A5.

## 9. Riesgos

| Riesgo | Cómo se evita |
| --- | --- |
| Romper las pruebas que pulsan en el panel | Se conservan ids y nombres, todas las páginas están en el DOM, y `openAdult(pagina)` para las que pulsan con Playwright |
| Un ajuste deja de guardarse al moverlo de sitio | La prueba nueva cambia cada control y comprueba su campo de `S` y que sigue tras recargar |
| En el móvil en horizontal no cabe | Menú de iconos estrecho y prueba a 844 × 390 en cada fase |
| La familia no encuentra algo que antes estaba | Resumen con atajos y nombres de categoría claros; decisión 2 por si se quiere otro reparto |

## 10. Decisiones (tomadas el 8 de noviembre de 2026: lo recomendado)

| # | Decisión | Elegido (lo recomendado) | Otras opciones que había |
| --- | --- | --- | --- |
| 1 | Forma de la navegación | Menú lateral en tableta y en el móvil en horizontal, páginas en el móvil en vertical | Solo pestañas arriba; solo menú lateral; solo páginas |
| 2 | Las categorías | Las 7 de arriba | Juntar «Quién juega» y «Cómo se juega» en «Ajustes» (6); separar «Ir a» como categoría propia (8) |
| 3 | Dónde va «Ir a» | Los atajos más usados en el Resumen y la lista completa en «Copia y aparato» | Categoría propia; solo en el Resumen |
| 4 | Qué página se abre al entrar | Siempre el Resumen | La última que se usó (mientras el juego siga abierto) |
| 5 | Aviso de copia de seguridad (A6) | Sí, con el campo opcional `S.bkFecha` (sin migración) | No guardar nada nuevo en la partida |
| 6 | Orden de las fases A2 a A5 | A2, A3, A4 y A5 | Empezar por los textos (A4), que es lo más rápido |
