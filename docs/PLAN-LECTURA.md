# Plan de la Isla de las Letras

Fernando lo pidió y lo aprobó el 31 de octubre de 2026: una parte del juego para acercarse a la lectura, de 3 a 5 años,
abierta desde el principio y con la dificultad que sube por edad como el jardín, el bosque y la montaña. El documento de
trabajo con el que se aprobó está en [Claude Docs](https://claude.ai/artifact/5gmZ6jMQmqDk55bS5aZixE); este archivo es
la copia que siguen los PR. Si cambia una decisión, se cambia aquí y se apunta en `CAMBIOS.md`.

## Decisiones tomadas

| Decisión | Qué se hace |
| --- | --- |
| Entrada | Un **muelle con un barco** en la costa del mapa (un sitio pequeño, el 13). Al tocarlo, Tito va en barco a una isla aparte, con su propio mapa pequeño y su propio botón «Seguir». Se vuelve en barco o con el botón de casa. |
| Zonas | Tres, por edad: **Playa de los Sonidos** (`playaSonidos`, 3 años), **Bosque de las Letras** (`bosqueLetras`, 4) y **Pueblo de las Palabras** (`puebloPalabras`, 5). |
| Apertura | Como las zonas principales: la de su edad y las anteriores, abiertas; la siguiente, con 6 flores en la anterior o en modo libre. La isla no cuenta para abrir nada del mapa grande, ni el mapa grande para la isla. |
| Guía | Tito, con **Lupi**, la lechuza de Letrilandia (su dibujo ya está en el juego: `LUPI_SVG`, `dibujos/pics-base.ts`), como amiga que vive en la isla. |
| Letras | 20: las vocales (Playa), M P L S T N D F B (Bosque) y R C G J V Ñ (Pueblo). Cada una con un amigo cuyo nombre empieza por ella (la A de abeja). Más adelante, una cuarta zona con CH, LL, RR, QU, Y, Z, H, K, W y X. |
| Mayúsculas | Primero la letra de palo (mayúsculas). A los 5 años, la minúscula al lado. En la zona de adultos: mayúsculas, minúsculas o las dos. |
| Sonido | Tito dice el nombre y una palabra («la eme de mono») y, si la frase lo permite, el sonido alargado dentro de la palabra («mmmono»). La voz del navegador no dice bien los sonidos sueltos. |
| Voz | Solo la voz del navegador, como el resto del juego nuevo. Cada frase se apunta en `dialogos/pendientes.txt`. |

## Cómo se organiza

Cada casita de la isla es un **tema** normal (`Tema`, con `zone` de la isla), así que el camino, la casita, el cofre,
las estrellas, las monedas y el progreso guardado (`S.temas`) son los de siempre. Cada casita de letra sigue la misma
rutina: conocer la letra, escuchar con qué empieza, trazarla, atraparla y un juego de unir o de memoria (5 a 7 juegos).

| Zona | Casitas del camino |
| --- | --- |
| Playa de los Sonidos (10) | Las palmas, ¿Cómo empieza?, A, E, I, O, U, Mi nombre, Las vocales mezcladas, Fiesta de las vocales |
| Bosque de las Letras (12) | Repaso de vocales, M, P, L, S, T, N, D, F, B, Escribo mi nombre, Fiesta de las letras |
| Pueblo de las Palabras (12) | R, C, G, J, V, Ñ, Fábrica de sílabas, Palabras de dos sílabas, Palabras de tres sílabas, Frases que se mueven, Cuentos para leer, Fiesta del abecedario |

La dificultad tiene dos capas. La de siempre (`dominio/dificultad.ts`: opciones, rondas, repeticiones y racha) y otra
de la lectura que depende de la edad, no de la zona:

| | 3 años | 4 años | 5 años |
| --- | --- | --- | --- |
| Letras que distraen | Muy distintas (A con O) | Las ya vistas | Parecidas (M y N, P y B, E y F) |
| Trazo | Camino ancho, con el animal que avanza | Normal, con flechas | Más fino, con el orden de los trazos |
| Mayúsculas y minúsculas | Mayúsculas | Mayúsculas | Las dos |
| Pistas | El dibujo amigo siempre al lado | El dibujo al tocar | Sin dibujo en la última ronda |

## Minijuegos

| # | Juego | Qué hace el niño | Edad | Cómo se hace |
| --- | --- | --- | --- | --- |
| 1 | Las palmas | Toca el tambor una vez por sílaba | 3 | Nuevo `Palmas` (sílabas como en `SYL3`) |
| 2 | ¿Cómo empieza? | Oye «aaabeja» y toca el dibujo que empieza igual | 3 | `ChoiceGame` |
| 3 | ¿Riman? | Dos dibujos: corazón si riman, nube si no | 4 | `ChoiceGame` |
| 4 | Caracoles que hablan | Busca los dos caracoles cuya palabra empieza igual | 4 | `Memoria` con voz |
| 5 | La palabra larga | ¿Qué palabra tiene más palmas? | 4 | `ChoiceGame` |
| 6 | El eco de Tito | Tito dice la palabra a trozos y el niño toca el dibujo | 4 | `ChoiceGame` |
| 7 | Conoce la letra | La letra sale de una burbuja, se dibuja sola y presenta a su amigo | 3 | `Conocer` con letra dibujada |
| 8 | ¿Dónde está la A? | Toca la letra que pide Tito | 3 | `Busca` |
| 9 | Burbujas de letras | Explota las burbujas con la letra | 3 | `Atrapa` |
| 10 | Excava la letra | Frota la arena y toca la letra que vale | 3 | `Excava` |
| 11 | Pesca de letras | Pesca el pez con la letra que pide Tito | 4 | Variante de `Atrapa` |
| 12 | La lupa de letras | Busca con la lupa letras escondidas | 4 | `Lens` |
| 13 | Memoria de letras | Parejas: la letra con su amigo | 4 | `Memoria` |
| 14 | Letras parecidas | ¿Cuál es la M? entre M, N y W | 5 | `ChoiceGame` |
| 15 | ¿Qué letra sigue? | A B C _ | 5 | `Series` |
| 16 | Grande y pequeña | Toca la minúscula de la A | 5 | `ChoiceGame` |
| 17 | Une la letra con su animal | Flecha de la A a la abeja | 3 | `Une` |
| 18 | Une el animal con su letra | Del dibujo a su primera letra | 4 | `Une` |
| 19 | Une la palabra y el dibujo | De SOL al dibujo del sol | 5 | `Une` |
| 20 | Une mayúscula y minúscula | De la A a la a | 5 | `Une` |
| 21 | Traza la letra | Sigue el trazo con el dedo | 3 | `Tracer` con `LETRAS` |
| 22 | Huellas en la arena | Toca en orden las huellas que forman la letra | 3 | Variante de `Tracer` |
| 23 | Pinta la letra | Pinta la letra grande y su amigo | 3 | `Pinta` |
| 24 | Construye la letra | Palitos y curvas para formar la letra | 4 | `Arrastra` |
| 25 | La pizarra | Dibuja libre sobre la letra en gris | 3 | Nuevo `Pizarra` |
| 26 | Mi nombre | Su nombre en letras gigantes, que suenan y se trazan | 3 | Nuevo `MiNombre` |
| 27 | El monstruo comelón | Da al monstruo la galleta con la letra que pide | 3 | `Arrastra` |
| 28 | La cesta de la letra | Mete en la cesta lo que empieza por M | 4 | `Llena` o `Arrastra` |
| 29 | El cartero de letras | Cada carta con dibujo, al buzón de su letra | 4 | `Arrastra` |
| 30 | La vocal escondida | _SO: la vocal que falta | 4 | `Arrastra` |
| 31 | El tren de las sílabas | Vagón A + locomotora M = MA | 4 | Nuevo `Tren` |
| 32 | La máquina de sílabas | Dos ruedas que imprimen la sílaba | 5 | Nuevo `Maquina` |
| 33 | Globos de sílabas | Explota los globos que dicen PE | 5 | `Atrapa` |
| 34 | La sílaba que falta | LU _ _ + NA = LUNA | 5 | `Arrastra` |
| 35 | Armo la palabra | Ordena PA y SO: SOPA | 5 | `Arrastra` |
| 36 | Leo y elijo | Lee PATO y toca su dibujo | 5 | `ChoiceGame` |
| 37 | El cartero de palabras | Cada palabra, a la casita de su dibujo | 5 | `Arrastra` |
| 38 | Frases que se mueven | Lee EL SAPO SALTA y elige la escena | 5 | Nuevo `Frase` |
| 39 | Cuentos para leer | Cuento narrado con una palabra que lee él | 5 | `Story` ampliado |
| 40 | La canción del abecedario | Las letras cantan; al tocarlas suenan | 3 | `Song` |

## Fases

Cada fase es un PR pequeño que deja el juego publicable, con las pruebas en verde y la versión subida.

1. **L1, reglas y datos (hecha en v0.2.55).** Las zonas de la isla en `dominio/apertura.ts` (`ZONAS_LETRAS`, `ZAGE`,
   `zonaAbierta` con la zona anterior en una tabla, `temaAbierto`, `zonaDeLetrasDeLaEdad` y `siguienteLetra`) y las 20
   letras en `contenido/letras.ts` (`LETRAS`, con los trazos de las mayúsculas), con sus pruebas. El dibujo del ñu.
   El juego no cambia.
2. **L2, la entrada.** El muelle en el mapa (2D y 3D), el viaje en barco y la escena del mapa de la isla con sus tres
   zonas y candados, aún sin casitas. Lupi en la isla.
3. **L3, Playa de los Sonidos.** Sus 10 casitas, `Palmas`, `Pizarra`, `MiNombre` y el trazado de las vocales.
4. **L4, Bosque de las Letras.** Sus 12 casitas, `Tren`, la pesca y las huellas.
5. **L5, Pueblo de las Palabras.** Sus 12 casitas, `Maquina`, `Frase`, los cuentos para leer y los trazos de las
   minúsculas.
6. **L6, la isla en 3D.** Decoración de la isla y de sus zonas.
7. **L7, recompensas y adultos.** «Mi libro de letras» en el álbum, las letras en el repaso diario (`S.kg`), la opción
   de mayúsculas y minúsculas (un campo nuevo y opcional de `S`, con su migración) y el progreso por letra.

## Riesgos

- La voz del navegador no dice bien los sonidos sueltos: por eso van dentro de palabras.
- Trazar letras de varios trazos con el dedo cuesta a los 3 años: camino ancho y animal que avanza; probarlo con un niño.
- Son 34 casitas y unas 300 frases: por eso va por fases que se publican solas.
- El 3D de la isla puede pesar: medir los FPS en cada PR.
