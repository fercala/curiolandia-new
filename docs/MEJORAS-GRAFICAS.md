# Mejoras gráficas (v0.2.183, v0.2.184 y v0.2.185)

Fernando pidió el 25 de noviembre de 2026 diez mejoras gráficas y luego que se hicieran todas en la misma PR. Salen de
revisar unas 150 capturas del juego (v0.2.182), de día y de noche: el mapa y las zonas en 3D se veían muy bien, pero
muchas escenas 2D (el cole, el patio, las excursiones y la casa) se veían planas y vacías a su lado.

Ninguna cambia el estado guardado `S`, ninguna frase de `say()` ni ningún texto de pantalla (por eso no hay rumano nuevo:
los carteles del mapa siguen diciendo lo mismo, ahora con dibujo). Todo es dibujo barato para el móvil: sin luces de
verdad de three.js, sin sombras nuevas y con patrones que se hacen una sola vez.

El 26 de noviembre de 2026 Fernando pidió seguir con otras diez (de la 11 a la 20, v0.2.184), en la misma PR. Tampoco
cambian `S`, ni frases, ni textos de pantalla.

Ese mismo día pidió otras veinte (de la 21 a la 40, v0.2.185), en una PR nueva. Tampoco cambian `S`, ni frases, ni
textos de pantalla.

| # | Mejora | Qué cambia | Dónde |
| --- | --- | --- | --- |
| 1 | Las escenas 2D cambian con la hora | Cuatro momentos de luz (amanecer de 7 a 9, día, tarde de 18 a 20 y noche de 20 a 7, las mismas horas que el mapa 3D). El cielo va hacia los colores del momento (rosado, naranja o azul oscuro con estrellas y la luna) y un velo calienta u oscurece el suelo y el paisaje, no los botones ni lo que se toca. | Reglas en `src/dominio/luz.ts` (`momentoLuz`, `cieloDe`, `VELO_LUZ`, pruebas en `tests/unidad/luz.test.ts`); dibujo en `src/nucleo/paisaje.ts` (`cieloExterior`, `veloHora`). Lo usan `fondoCole` (`escenas/cole.ts`), `fondoPatio` (`escenas/patio.ts`, y con él todos los juegos del patio) y los fondos de fuera de `escenas/excursion.ts` (granja, zoo, ciudad, bosque, mercado, playa y la carretera del autobús). |
| 2 | Fondos 2D con profundidad | Dos filas de colinas al fondo, más claras cuanto más lejos (se funden con el cielo), que se mueven un poco con el dedo o el ratón (paralaje; la de delante el doble), el sol con su halo y nubes que pasan despacio. | `cieloExterior(arriba, abajo, horizonte, { colinas: true })` en `src/nucleo/paisaje.ts`. En la playa no hay colinas (es el mar). |
| 3 | Un Tito 2D con vida | Además del balanceo y el parpadeo que ya tenía: una sombra suave en el suelo, respira (se estira un poquito), se inclina hacia el puntero y da un saltito de alegría en cada acierto. | `drawTito` y `titoContento` en `src/nucleo/tito.ts` (opción nueva `sombra: false`). |
| 4 | Una casa de Tito más acogedora | El salón y el dormitorio tienen zócalo con paneles y un cuadro colgado (a la izquierda, lejos de los sitios de pared); el suelo de madera tiene vetas; de día entran rayos de sol por la ventana y de noche, con la luz encendida, hay un resplandor cálido en vez de solo oscurecer. No hay alfombra ni lámpara fijas porque son cosas que se compran. | `zocalo`, `cuadroPared` y `luzHabitacion` en `src/escenas/casa.ts`. |
| 5 | Islas de las Letras y del Inglés más ricas | Caminos de arena del centro (Lupi o Polly) a cada zona, olas de espuma en la orilla, rocas y conchas en la arena, palmeras, arbustos, flores y, de noche, luciérnagas. Todo lejos de lo que se toca. | `adornarIsla` en `src/mundo3d/islaAdornos.ts`, desde `buildIsla` (`isla3d.ts`) y `buildIslaIngles` (`islaIngles3d.ts`). |
| 6 | El mapa de noche con luces | Farolas junto a siete caminos (apagadas de día; de noche con la bombilla, el halo y un charco de luz que respiran), un resplandor cálido en los sitios con casas y el reflejo de la luna en el mar. | `farolas3`, `resplandores3` y `reflejoLuna3` en `src/mundo3d/lucesNoche.ts`, desde `buildMap` (`mapa3d.ts`, lista `FAROLAS`). |
| 7 | Carteles del mapa con dibujo | Los carteles de los sitios llevan un círculo con su dibujo (la tienda, la casa, la escuela, el barco, el globo) o la cifra de los años (3, 4 y 5, también en las islas), y son más grandes. | `cartelTex` en `src/mundo3d/materiales.ts`; carteles en `mapa3d.ts`, `personajes.ts` (la casa de Tito), `isla3d.ts` e `islaIngles3d.ts`. |
| 8 | Respuesta igual al tocar en todos los juegos | Cada toque deja una onda; cada acierto (`SFX.good`), estrellitas y un aro verde donde se tocó y el saltito de Tito; cada fallo (`SFX.bad`), un temblor suave de la escena. | `src/nucleo/toques.ts` (`ondaToque`, `sacudida`, `dibujaToques`), enganchado con `ponRespuestaVisual` (`src/nucleo/sonido.ts`); el bucle (`aplicacion/bucle.ts`) los dibuja. |
| 9 | Superficies con textura | Patrones dibujados de arena, tierra, hierba, madera y agua, encima del color de siempre: la hierba y la arena del cole y del patio, el prado de la granja y del zoo, el suelo del bosque, la arena y el mar de la playa, el suelo del museo, la tierra del huerto de la granja, los suelos de madera de la casa y la arena de «Buscar fósiles» y de los demás juegos de excavar (ondas, piedrecitas, conchas y una sombra de hoyo). | `textura` en `src/nucleo/texturas.ts`; `texturaExcava` en `src/juegos/comps.ts` (con fórmulas fijas, sin `azar()`, para no cambiar el azar del juego). |
| 10 | Pegatinas que brillan | Las pegatinas ganadas tienen una franja de luz que las cruza cada pocos segundos y una estrellita que titila; las que faltan salen en el álbum como silueta crema con una chapita «?». | `drawSticker` (con `brillo`) y `drawStickerFalta` en `src/nucleo/interfaz.ts`; el álbum, en `src/escenas/escenas2d.ts`. |
| 11 | Botones que se hunden y rebotan | Al tocar un botón se hunde un poco (se encoge al 92 %) y, al soltarlo, rebota antes de volver a su tamaño. Funciona también con el dedo, sin ratón encima. | `hv`, `hR`, `hC` y `ponPulsado` en `src/nucleo/puntero.ts`; el bucle (`src/aplicacion/bucle.ts`) llama a `ponPulsado` al tocar y al soltar. |
| 12 | Estela de estrellitas al arrastrar | Mientras se arrastra algo, el dedo deja estrellitas de colores que se encogen, giran y se desvanecen en medio segundo (una cada 22 píxeles, como mucho 24 a la vez). | `estela` y `dibujaEstela` en `src/nucleo/toques.ts`; el bucle llama a `estela` al mover con `VIVO.drag`. |
| 13 | Monedas del marcador que saltan y brillan | Al llegar monedas, un resplandor dorado detrás del marcador y el número que salta y crece; cada pocos segundos, la moneda brilla con una estrellita. | `drawCoinHUD` en `src/nucleo/monedas.ts`. |
| 14 | Estaciones en las escenas de fuera | Hojas naranjas y rojas que caen en otoño (octubre y noviembre), nieve en invierno (diciembre a febrero) y pétalos en primavera (marzo a mayo), con los mismos meses que el mapa 3D; en verano, nada. | Regla `loQueCae` en `src/dominio/luz.ts` (con su prueba); dibujo en `veloHora` (`estacion`) de `src/nucleo/paisaje.ts`, así que sale en todas las escenas con el cielo de la hora. |
| 15 | Vida en el fondo | De día, dos pájaros que cruzan el cielo aleteando y dos mariposas que revolotean por la hierba; de noche, luciérnagas que flotan y parpadean. | `vidaExterior` en `src/nucleo/paisaje.ts` (desde `veloHora`, con el horizonte que guarda `cieloExterior`). |
| 16 | Zonas 3D de noche con luces | En los caminos de casitas (el jardín, el bosque, la montaña y las zonas de las islas), de noche, una farola encendida entre cada dos casitas de la misma fila y el resplandor de las ventanas encendidas. | `lucesZona` en `src/mundo3d/zonas3d.ts`, con `farolas3` y `resplandores3` de `src/mundo3d/lucesNoche.ts`. |
| 17 | El sol brilla en el mar | De día, chispitas blancas que se encienden y se apagan sobre el mar del mapa y a los dos lados de las islas. | `destellosSol3` en `src/mundo3d/lucesNoche.ts`; lo llaman `buildMap` (`mapa3d.ts`) y `adornarIsla` (`islaAdornos.ts`). |
| 18 | Luz en el acuario y en el museo | En el acuario, cinco rayos de luz que se mecen y laten, la luz que baila en la arena y burbujas con su brillo; en el museo, un haz cálido que baja de una claraboya sobre el esqueleto, con motas de polvo que brillan. | `fondoAcuario` y `causticas`, y `fondoMuseo` y `luzMuseo`, en `src/escenas/excursion.ts`. |
| 19 | El cofre se abre con más luz | Detrás de los rayos que ya giraban, un resplandor dorado que late y otros rayos finos que giran al revés y se apagan hacia fuera. | `drawChest` en `src/escenas/cofre.ts`. |
| 20 | Transición iris con estrellitas | Al cambiar de escena, el círculo que se cierra y se abre lleva estrellitas de colores girando por su borde. | `dibujaIris` en `src/aplicacion/bucle.ts`. |
| 21 | Sombras de nubes en el suelo | De día, tres sombras suaves de nube que pasan despacio por el suelo de las escenas de fuera. | `sombrasNubes` en `src/nucleo/cieloVivo.ts`, desde `veloHora` (`src/nucleo/paisaje.ts`). |
| 22 | Estrellas fugaces | De noche, una estrella fugaz con su estela cada 7 segundos, cada vez desde un sitio distinto. | `estrellaFugaz` en `src/nucleo/cieloVivo.ts`, desde `cieloExterior`. |
| 23 | Un globo aerostático | De día, un globo de rayas con su cesta cruza el cielo despacio una vez cada minuto y medio. | `globoAerostatico` en `src/nucleo/cieloVivo.ts`. |
| 24 | Rayos de sol | Ocho rayos suaves que salen del sol y giran muy despacio (anaranjados al amanecer y por la tarde), sin bajar del horizonte. | `rayosSol` en `src/nucleo/cieloVivo.ts`. |
| 25 | Un arcoíris a ratos | De día, un arcoíris a la izquierda del cielo que aparece, se queda 14 segundos y se desvanece, una vez cada dos minutos (la primera, al minuto de jugar). | `arcoiris` en `src/nucleo/cieloVivo.ts`. |
| 26 | La ciudad de noche | Las ventanas de los edificios encendidas, con su resplandor (alguna se apaga y se enciende despacio), y dos farolas con su halo en la acera. | `ventanasCiudad` en `src/escenas/fondosVivos.ts`, desde `fondoCiudad` (`escenas/excursion.ts`). |
| 27 | La orilla de la playa | La espuma blanca de la orilla sube y baja como las olas, y el sol hace destellos sobre el mar. | `orillaPlaya` en `src/escenas/fondosVivos.ts`, desde `fondoPlaya`. |
| 28 | Rayos de sol en el bosque | De día, cuatro rayos de sol que bajan en diagonal entre los árboles y brillan más y menos. | `rayosBosque` en `src/escenas/fondosVivos.ts`, desde `fondoBosque`. |
| 29 | Banderines en el mercado | Una guirnalda de banderines de colores, de lado a lado, que se mecen con el viento. | `banderinesMercado` en `src/escenas/fondosVivos.ts`, desde `fondoMercado`. |
| 30 | Un molino en la granja | Un molino de viento junto al granero con las aspas girando. | `molinoGranja` en `src/escenas/fondosVivos.ts`, desde `fondoGranja`. |
| 31 | Nebulosas en el planetario | Nubes de colores que laten en la cúpula y una estrella fugaz de vez en cuando. | `nebulosas` en `src/escenas/fondosVivos.ts`, desde `fondoPlanetario`. |
| 32 | Motas doradas en la casa | Motas de polvo que flotan, suben y brillan en el rayo de sol que entra por la ventana. | `motasSol` en `src/escenas/fondosVivos.ts`, desde `luzHabitacion` (`escenas/casa.ts`). |
| 33 | Monedas con chispas | Las monedas que vuelan al marcador dejan tres chispitas doradas detrás. | `drawCoinFx` en `src/nucleo/monedas.ts`. |
| 34 | El cartel «+N» con rayos | Detrás del cartel de las monedas ganadas giran rayos de luz dorados. | `drawCoinFx` en `src/nucleo/monedas.ts`. |
| 35 | Halo bajo el ratón | En el ordenador, un brillo suave que late bajo el puntero cuando está encima de algo que se puede tocar (con el dedo no sale). | `haloPuntero` en `src/nucleo/toques.ts`. |
| 36 | Espuma en la orilla del mapa | Dos aros de espuma con la forma de la isla del mapa que se abren y se desvanecen. | `espumaOrilla3` en `src/mundo3d/mapaVivo.ts`, desde `island3` (`mapa3d.ts`). |
| 37 | Sombras de nubes en 3D | De día, sombras suaves de nube que cruzan el mapa, las islas y las zonas. | `sombrasNubes3` en `src/mundo3d/mapaVivo.ts`. |
| 38 | Chispitas en la casita que toca | Del aro dorado de la casita siguiente suben chispitas doradas que giran y se desvanecen. | `chispasSuben3` en `src/mundo3d/mapaVivo.ts`, desde `buildZone` (`zonas3d.ts`). |
| 39 | Las islas de noche con luces | En las islas de las Letras y del Inglés, de noche, una farola junto a cada camino y el resplandor de las ventanas de cada zona. | `adornarIsla` (`src/mundo3d/islaAdornos.ts`) con `farolas3` y `resplandores3`. |
| 40 | Huellas de Tito | Al pasear por el mapa, las islas y las zonas, Tito deja huellas a un lado y a otro que se borran en 3 segundos. | `huellas3` en `src/mundo3d/mapaVivo.ts`. |

## Cómo añadir el cielo de la hora a una escena 2D nueva

1. Dibuja el cielo con `cieloExterior(colorArriba, colorAbajo, horizonte, { colinas: true })` en vez de `sky()`.
2. Dibuja el suelo y el paisaje y, si quieres, `textura('hierba', x, y, ancho, alto, 0.8)` encima del color del suelo.
3. Al final del fondo, antes de los botones, Tito y lo que se toca, llama a `veloHora()`.

Las escenas de dentro (la casa, el museo, el acuario, el planetario) no llevan el velo de la hora. Con `veloHora()` vienen también lo que cae del cielo según la estación y los pájaros, las mariposas o las luciérnagas (mejoras 14 y 15) y, desde la v0.2.185, las sombras de las nubes; y con `cieloExterior()`, los rayos del sol, el arcoíris, el globo y las estrellas fugaces (mejoras 21 a 25).
