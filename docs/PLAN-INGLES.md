# Plan de la Isla del Inglés

Fernando lo pidió y lo aprobó el 2 de noviembre de 2026: el Rincón del inglés deja el mapa y pasa a ser una isla, con
el mismo concepto que la Isla de las Letras ([PLAN-LECTURA.md](PLAN-LECTURA.md)), muchos más juegos y un personaje
propio además de Tito. El documento de trabajo con el que se aprobó está en
[Claude Docs](https://claude.ai/artifact/RsYnj8gmGwbTQ7i7fnWnnB); este archivo es la copia que siguen los PR. Si
cambia una decisión, se cambia aquí y se apunta en `CAMBIOS.md`.

## Decisiones tomadas

| Decisión | Qué se hace |
| --- | --- |
| Entrada | En el sitio del Rincón del inglés (entre el bosque y la montaña) se pone un **globo aerostático** con un **cartel grande «Isla del Inglés»** que se ve siempre, en 2D y en 3D. Tito sube al globo y vuela a la isla. El barco de las letras costaba encontrarlo (en 3D quedaba cortado por el borde y no tenía cartel): el globo va dentro del mapa y se comprueba con capturas del móvil en horizontal y en vertical. |
| Personaje | **Polly, la lorita** (`dibujos/polly.ts`), que vive en la isla. Los loros repiten palabras, así que «escucha y repite» es lo suyo. Polly dice las palabras en inglés (con la voz inglesa) y Tito lo explica en castellano. |
| Zonas | Tres, por edad: **Playa Hello** (`playaHello`, 3 años), **Parque de Londres** (`parqueLondres`, 4) y **Pueblo de los Cuentos** (`puebloCuentos`, 5). El parque usa la decoración 3D que ya tenía el rincón: el autobús rojo, la cabina, el reloj, el guardia y la tetera. |
| Apertura | La isla está abierta desde el principio (el rincón pedía 2 casitas del camino). Dentro, como en la de las letras: la zona de su edad y las anteriores, abiertas; la siguiente, con 6 flores en la anterior o en modo libre. La isla no abre nada del mapa grande ni de la otra isla. |
| Progreso guardado | Las casitas del rincón (`EN-HELLO`, `EN-COLORS`, `EN-NUMBERS`, `EN-ANIMALS`) son las cuatro primeras de la Playa Hello, en el mismo orden y con sus juegos de siempre; los juegos nuevos van detrás (el progreso se guarda por id y posición). Las habilidades del repaso (`ingles-hello`...) se quedan. No cambia `S`. |
| Voz | Como el resto del juego nuevo: la voz del navegador, en inglés para las palabras (`say` con `{en: 1}`) y en castellano de España para las explicaciones. Cada frase nueva va a `dialogos/pendientes.txt` y al catálogo. |
| Palabra escrita | Debajo del dibujo, para que la vean, pero sin pedir que la lean: a los 5 años aprenden a leer en castellano y no conviene mezclar. |

## Zonas y casitas

Cada casita es un tema normal (`Tema`, con `zone` de la isla y su conjunto de palabras), así que el camino, el cofre,
las estrellas, las monedas y el progreso son los de siempre. Las palabras de cada casita cambian con la edad.

| Zona | Casitas del camino |
| --- | --- |
| Playa Hello (10) | Los saludos, Los colores, Los números, Los animales (las 4 del rincón), La familia, Mi cuerpo, Los juguetes, La fruta, Las formas, Fiesta de la playa |
| Parque de Londres (12) | Repaso de la playa, La ropa, La comida, Mi casa, El tiempo, Los transportes, La granja, Lo que hacemos (run, jump, sleep), Grande y pequeño, Cómo me siento, Canciones del parque, Fiesta del parque |
| Pueblo de los Cuentos (12) | Los días de la semana, Las estaciones, Dónde está (in, on, under), Polly says, Me gusta (I like), What is it?, Cosas de colores (a red apple), Contar hasta 20, Los oficios, La tienda de Polly, Cuentos en inglés, Gran fiesta del inglés |

## Minijuegos

| # | Juego | Qué hace el niño | Edad | Cómo se hace |
| --- | --- | --- | --- | --- |
| 1 | Escucha y repite | Toca cada dibujo y oye la palabra | 3 | `EnConocer` (ya existe) |
| 2 | ¿Dónde está? | Polly dice «cat» y toca el gato | 3 | `EnEscucha` (ya existe) |
| 3 | Revienta los globos | Los globos de «red» | 3 | `EnGlobos` (ya existe) |
| 4 | Contar en inglés | One, two, three | 3 | `EnCuenta` (ya existe) |
| 5 | Memoria en inglés | Parejas que dicen su palabra | 3 | `Memoria` |
| 6 | Burbujas | Explota las del dibujo que pide Polly | 3 | `Atrapa` |
| 7 | Excava | Frota la arena: «the shell» | 3 | `Excava` |
| 8 | Sonidos de la granja | «The cow says moo» | 3 | `Sonido` |
| 9 | Stop and go | Rojo: stop; verde: go | 3 | `Semaforo` |
| 10 | Canta con Polly | Canciones de saludos, colores y números | 3 | `Song` |
| 11 | Pinta en inglés | «Colour the sun yellow» | 3 | `Pinta` |
| 12 | Une los iguales | Del dibujo a su sombra | 3 | `Une` |
| 13 | Repite conmigo | Polly dice la palabra y el niño la repite en voz alta | 3 | Nuevo `Repite` |
| 14 | El teléfono rojo | Suena la cabina y Polly pide una cosa | 3 | Nuevo `Telefono` |
| 15 | La lupa | Busca «the ball» | 4 | `Lens` |
| 16 | La cesta | Mete las cosas «red» | 4 | `Llena` |
| 17 | ¿Sí o no? | «Is it a dog?» | 4 | `ChoiceGame` |
| 18 | ¿Cuántos hay? | How many apples? | 4 | `Cuenta` |
| 19 | Grande y pequeño | Big o small | 4 | `ChoiceGame` |
| 20 | Mamás y bebés | Cada animal con su cría | 4 | `Une` |
| 21 | Puzle | Arma el dibujo y Polly lo nombra | 4 | `Puzzle` |
| 22 | Dibuja con Polly | «Draw a circle» | 4 | `Pizarra` |
| 23 | Mi cuerpo | «Touch your nose» | 4 | `TocaPartes` |
| 24 | ¿Qué tiempo hace? | Ropa para «sunny» o «rainy» | 4 | `Arrastra` |
| 25 | La caja misteriosa | «What is it?» | 4 | `Frota` |
| 26 | Pesca en inglés | El pez que pide Polly | 4 | `Atrapa` |
| 27 | Viste a Tito | «Put on the red hat» | 4 | Nuevo `Viste` |
| 28 | Polly says | Solo si dice «Polly says» | 5 | `ChoiceGame` |
| 29 | In, on, under | ¿Dónde está la pelota? | 5 | `ChoiceGame` |
| 30 | Pon la pelota | «Put the ball under the table» | 5 | `Arrastra` |
| 31 | ¿Qué sigue? | Monday, Tuesday... | 5 | `Series` |
| 32 | Mi día | Wake up, eat, sleep | 5 | `Secuencia` |
| 33 | ¿Qué falta? | «What's missing?» | 5 | `ChoiceGame` |
| 34 | Me gusta | «I like apples»: cara contenta o triste | 5 | `ChoiceGame` |
| 35 | La tienda de Polly | «An apple, please» | 5 | `Arrastra` |
| 36 | Cuentos en inglés | Cuento en castellano con palabras en inglés | 5 | `Story` |
| 37 | Une el color y la cosa | Del «red» a la manzana roja | 5 | `Une` |
| 38 | Las estaciones | Cada cosa a su estación | 5 | `Arrastra` |
| 39 | Bingo | Polly canta palabras y el niño las tacha | 5 | Nuevo `Bingo` |
| 40 | El autobús de Londres | Sube al pasajero que dice Polly | 5 | Nuevo `Autobus` |

## Fases

Cada fase es un PR pequeño que deja el juego publicable, con las pruebas en verde y la versión subida. Antes de
fusionar cada uno se pone al día con `main` y se vuelve a subir la versión si otro PR la ha usado.

1. **I1, reglas y datos (hecha en v0.2.72).** Las tres zonas de la isla en `dominio/apertura.ts` (`ZONAS_INGLES`,
   `ZAGE`, la zona anterior de cada una) y las dos islas en la tabla `ISLAS`, con las reglas de isla para las dos
   (`zonaDeIslaDeLaEdad` y `siguienteDeIsla`; `siguienteLetra` es la de las letras). Las palabras nuevas en
   `contenido/ingles.ts` (`PALABRAS_INGLES`, 13 conjuntos con dibujo) con sus pruebas, y el dibujo de Polly. El juego
   no cambia.
2. **I2, la entrada y la Playa Hello con sus 4 casitas (hecha en v0.2.73).** El globo con su cartel en el mapa (2D y
   3D) en el sitio del rincón (`MZ2` con id `globo` y `esc: 'islaIngles'`; en 3D, `SPOT3.globo`, con el cartel pegado a
   lo alto del globo: delante lo tapaba la montaña), la escena de la isla con Polly (`escenas/islaIngles.ts`, en 2D) y
   las 4 casitas del rincón ya en la playa (`ZONES.playaHello`, con `vuelta: 'islaIngles'`). La zona `ingles` y la regla
   de las 2 casitas (`NEED.ingles`) desaparecen. La decoración 3D del rincón se reparte: las letras que flotan, los
   cubos HELLO y la sombrilla, a la playa; lo de Londres (autobús, cabina, reloj, buzón, tetera, guardia y bandera),
   al Parque de Londres, que sale en la fase I4. El Parque y el Pueblo salen «en obras».
3. **I3, el resto de la Playa Hello (hecha en v0.2.74).** Las otras 6 casitas detrás de las del rincón (`EN-FAMILY`,
   `EN-BODY`, `EN-TOYS`, `EN-FRUIT`, `EN-SHAPES` y la fiesta `EN-BEACH`, que repasa palabras de toda la playa) y los
   juegos nuevos `EnRepite` (Polly dice la palabra dos veces y el niño la repite y toca la boca: no se usa el micrófono)
   y `EnTelefono` (suena el teléfono rojo, se coge y Polly pide una cosa: «Ball, please!»).
4. **I4, Parque de Londres (hecha en v0.2.75).** Sus 12 casitas (`ING_PARQUE`: `EN-REVIEW`, `EN-CLOTHES`, `EN-FOOD`,
   `EN-HOUSE`, `EN-WEATHER`, `EN-TRANSPORT`, `EN-FARM`, `EN-ACTIONS`, `EN-OPPOSITES`, `EN-FEELINGS`, `EN-SONGS` y
   `EN-PARK`). El juego `EnViste` es **Viste a Polly** y no a Tito: Tito puede ser un caracol, un erizo, una tortuga o un
   conejo, y a Polly la ropa le queda siempre en su sitio (gorro, gafas, bufanda y botas de colores). Las acciones, los
   contrarios y las caritas se dibujan con una función que se mueve (`enAccion`, `enOpuesto` y `enFace`). Los sonidos de
   la granja son `EnEscucha` con `dice` («¿Quién dice moo?») y las tres canciones en inglés usan `Song` con `en:1` en
   cada verso. En 3D, la decoración de Londres se reparte por delante de las casitas para no taparlas.
5. **I5, Pueblo de los Cuentos (hecha en v0.2.76).** Módulo nuevo `temas/inglesPueblo.ts` con sus 12 casitas
   (`ING_PUEBLO`: `EN-DAYS`, `EN-SEASONS`, `EN-WHERE`, `EN-SIMON`, `EN-ILIKE`, `EN-WHAT`, `EN-COLOURTHINGS`, `EN-COUNT20`,
   `EN-JOBS`, `EN-SHOP`, `EN-STORIES` y `EN-TOWN`) y seis juegos nuevos: `EnPollySays` (con la señal de stop cuando
   Polly no lo dice), `EnMeGusta` (carita contenta o triste), `EnQueEs` (una ventana que se abre poco a poco),
   `EnBingo` (cartón de 6), `EnAutobus` (los animales suben al autobús de dos pisos) y `EnCuento` (dos cuentos en
   castellano con palabras en inglés, `CUENTOS_INGLES`, y preguntas al final). Los cuentos son juegos propios y no
   `Story`, porque cada trozo se dice con su voz (sayMix). Las mesas de «dónde está» se dibujan sin nada encima.
6. **I6, la isla en 3D.** El mar, las tres zonas, Polly, el globo y Tito caminando.
7. **I7, premios y adultos.** «Mi diccionario de inglés» en el álbum, el progreso de inglés en la zona de adultos y
   las palabras en el repaso diario.

## Riesgos

- La voz inglesa del navegador cambia mucho de un móvil a otro y en algunos no hay: entonces las palabras se oyen con
  acento castellano. Ya pasa en el rincón; se avisará en la zona de adultos.
- No se oye al niño (no se usa el micrófono): «repite conmigo» no comprueba nada, solo le anima a hablar.
- Son 34 casitas y unas 300 frases nuevas: por eso va por fases que se publican solas.
