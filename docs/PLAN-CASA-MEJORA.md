# Plan de mejora integral de la casa de Tito

Fernando lo pidió el 7 de noviembre de 2026: que la casa de Tito sea mucho más interactiva, que los objetos no estén
«tirados» por la casa sin orden sino **guardados**, y que se puedan **poner en cualquier habitación**; que los objetos
**respondan de verdad** al tocarlos; y valorar si la casa debería pasar de 2D a **3D**. Este documento es solo el plan:
no hay código todavía. Cada fase (M0 a M8) se aprueba por separado y va en su propio PR, como las de
[PLAN-CASA.md](PLAN-CASA.md) (C1 a C7, ya hechas), sobre las que se construye.

**Estado: aprobado el 7 de noviembre de 2026** («comencemos con las mejoras», después de proponer empezar con lo
recomendado): las 14 decisiones del final quedan como se recomienda. Hechas: M1 (v0.2.97), M0 (v0.2.98: falta que
Fernando la pruebe en su móvil y diga si se sigue con la casa 3D), M2 (v0.2.99: el baúl y la casa ordenada) y la
primera parte de M3, M3a (v0.2.112: toques directos, estados guardados y las reglas de toque nuevas).

---

## 1. Cómo está la casa hoy

Revisado en `main` (v0.2.95), con una partida de prueba que tiene las 14 casitas terminadas y los 55 objetos comprados.

### Lo que hay

| Parte | Dónde | Cómo funciona |
| --- | --- | --- |
| Escena de la casa | `SCENES.casaTito` en `escenas/tienda.ts` (unas 550 líneas) | 2D, en el lienzo de 1600×900. Arriba, un botón por habitación; abajo, el armario con la ropa y Pipo. |
| Habitaciones | `ROOMS` en `escenas/tienda.ts` | 7: salón (siempre), dormitorio (1 casita), cocina (3), baño (5), cuarto de juegos (8), jardín (11) y torre de las estrellas (14). |
| Objetos | `SHOP` (sin `slot`) | 55: 49 cosas y 6 mascotas. Cada uno tiene `room` (habitación fija, con candado en la tienda) o `pref` (preferida). |
| Dónde está cada uno | `S.home[id] = {x, y, r}` | Píxeles de la pantalla 2D y la habitación. Al comprar, `placeHome` lo pone en el primer hueco libre de `HOMESPOT` (12 de suelo) o `WALLSPOT` (4 de pared); si no hay, **al azar**. |
| Moverlos | `down`/`move`/`up` de `casaTito` | Arrastrar más de 12 px mueve; soltar sobre el botón de otra habitación lo lleva allí. |
| Jugar con ellos | `irA` + `escenas/casaReacciones.ts` + `homeAction` | Tito anda hasta el objeto, hace su acción (`REACCIONES`, 2 o 3 segundos), suena algo y dice su frase. |
| Escenas pequeñas | `escenas/casa*.ts` (fases C3 a C5) | 10: cielo, mundo, tele, instrumentos, pizarra, buenas noches, merienda, sopa, baño y huerto. |
| Combinaciones | `COMBINACIONES` en `dominio/casa.ts` | 14 parejas (patito + bañera, regadera + flor...). |
| Mascotas | `escenas/casaMascotas.ts`, `S.mascotas` | Crecen con los días cuidados (fase C6). |
| Álbum | `escenas/casaAlbum.ts`, `S.sorpresas` | 63 sorpresas (49 + 14). |
| 3D | `mundo3d/mapa3d.ts`, `personajes.ts` | Solo la casa **por fuera**, en el mapa. Por dentro no hay nada en 3D (tampoco en `curiolandia-3d`, que solo tiene `makeHouse`, la fachada). |

### Por qué se ve desordenada (lo que se ve en las capturas)

- **Se amontona.** Con todo comprado, el salón tiene 12 objetos y el cuarto de juegos 14 en una pantalla: se tapan
  unos a otros (el banco tapa la alfombra, la tele tapa el banco, el sofá tapa la fuente...). `homeSpot` solo mira que
  no haya otro objeto *casi en el mismo punto* (170×40 px), no si se pisan.
- **Flotan.** Los huecos de `HOMESPOT` empiezan en y = 560 y el suelo en y = 600: el piano, el farol, el xilófono o el
  robot quedan «pegados» a la pared, a media altura. Al soltar, el objeto se encaja en un rectángulo (`clamp`), no en
  un sitio con sentido.
- **No hay muebles que sostengan cosas.** El cuento, el jabón, la tarta o las pinturas van al suelo como el sofá: no
  hay mesa, estantería ni baldas donde ponerlos.
- **Todo lo comprado está siempre fuera.** No existe «guardar»: lo único que se puede hacer con algo que estorba es
  llevarlo a otra habitación.
- **Mover de habitación es difícil para 3 años**: hay que arrastrar el objeto hasta un botón de 34 px arriba del todo.

### Por qué no parece interactivo (aunque C2–C7 añadieron mucho)

- **El que juega es Tito, no el niño.** Al tocar, Tito camina y hace una animación de 2 o 3 segundos; el niño mira.
- **Siempre pasa lo mismo.** Cada objeto tiene una sola reacción y una sola frase.
- **Los objetos no cambian.** La lámpara es el único que cambia algo (y no se guarda). La nevera no se abre, la tele
  no se enciende en la habitación, la cama no se deshace, el baúl no tiene nada dentro.
- **Lo bueno está escondido.** Las escenas pequeñas sacan al niño de la casa; las combinaciones solo se descubren por
  casualidad, y nada invita a probarlas.
- **La casa no tiene vida propia.** No pasa nada si no se toca: no hay hora del día, ni rutinas, ni visitas.

---

## 2. Objetivos y principios

1. **Orden**: cada objeto está en un sitio con sentido (en el suelo, colgado en la pared, encima de un mueble) o
   guardado en el baúl. Nunca se pisan.
2. **Libertad**: cualquier objeto se puede poner en cualquier habitación abierta (con las mismas reglas de tamaño).
3. **Interacción directa**: el niño toca y el objeto responde en el momento (se abre, se enciende, bota, suena), sin
   esperar a Tito. Tito sigue jugando con las cosas, pero como una segunda capa.
4. **Variedad**: varios toques distintos por objeto, estados que se guardan y cosas que pasan según la hora.
5. **Para 3 a 5 años**: un dedo, sin fallos, sin tiempo, sin castigos; nada se pierde nunca (decisión 4 de
   PLAN-CASA.md). Botones grandes (mínimo 90 px lógicos) y voz que explica.
6. **Aprender jugando**: rutinas del día, vocabulario de posiciones (encima, debajo, dentro, al lado), clasificar
   (cada cosa a su habitación), contar.
7. **No romper nada**: partidas guardadas, lo que leen las pruebas (`window.__cl`) y el rendimiento en móviles.
8. **La casa no da monedas** (decisión 7 de PLAN-CASA.md): el premio es la sorpresa.

---

## 3. Propuesta

### 3.1 Guardar y colocar: el baúl de Tito y los sitios de cada habitación

**El baúl (el almacén).** Un cajón grande abajo a la derecha de la casa (un baúl de juguetes dibujado). Al tocarlo se
abre una bandeja con lo que está guardado, en filas grandes con pestañas por tipo (muebles, juguetes, música,
cocina y baño, jardín, cielo, mascotas). Desde la bandeja se arrastra un objeto a la habitación; para guardarlo, se
arrastra de vuelta al baúl (o se mantiene pulsado y sale el botón «Guardar»). El baúl no tiene límite.

**Los sitios (huecos con nombre).** Cada habitación tiene una lista fija de sitios, definida como datos, con su tipo
y su tamaño:

| Tipo de sitio | Qué va | Ejemplos |
| --- | --- | --- |
| `suelo-grande` | Muebles y cosas grandes | cama, sofá, piano, bañera, piscina, tobogán, columpio, árbol |
| `suelo` | Cosas medianas | robot, tambor, silla, casita del perro, planta |
| `pared` | Lo que se cuelga | cuadro, reloj, pizarra, estrellas, Saturno |
| `encima` | Cosas pequeñas sobre un mueble | cuento, jabón, tarta, pinturas, pato, pecera |
| `alfombra` | La alfombra (centro del suelo) | alfombra |

- Cada objeto de la tienda lleva su **tamaño** (`grande`, `mediano`, `pequeno`, `pared`, `alfombra`), que dice en qué
  sitios cabe. Un pequeño también cabe en el suelo; un grande, solo en `suelo-grande`.
- Los sitios `encima` **nacen de los muebles**: la mesa, la estantería, el baúl, la mesilla de la cama o la bañera
  tienen 1 a 3 sitios encima. Si el mueble se guarda, lo que tenía encima vuelve al baúl (Tito lo dice).
- Propuesta de partida: unos **8 sitios de suelo (3 grandes), 4 de pared y la alfombra** por habitación, más los de
  encima de los muebles. Con 55 objetos y 7 habitaciones caben todos, pero no todos a la vez en una sola.
- **Al arrastrar**, los sitios libres donde cabe ese objeto se iluminan (círculos amarillos en el suelo, marcos en la
  pared); al soltar, el objeto **salta al sitio** más cercano. Si se suelta lejos de cualquier sitio libre, vuelve a
  donde estaba (o al baúl si venía de él). Nunca se pisan.
- Los objetos se dibujan **de atrás hacia delante por su sitio** (ya no por la `y` libre), con el tamaño que da la
  profundidad.

**Lo nuevo que se compra** va al baúl, que se abre con el objeto brillando, y Tito pregunta: «¿Dónde lo ponemos?».
Los sitios libres de su habitación habitual brillan. Si el niño sale sin colocarlo, se queda guardado (ver
decisión 2).

**Llevar a otra habitación** de tres maneras: arrastrarlo al botón de la habitación como hoy (los botones crecen
mientras se arrastra); guardarlo en el baúl en una y sacarlo en otra; o, en 3D, arrastrarlo hasta la puerta.

**«¡Ordena, Tito!»** Un botón en la zona del baúl: Tito recoge la habitación y pone cada cosa en su habitación
habitual (la `room`/`pref` de hoy), con una animación corta. Sirve de ayuda a los pequeños y de enseñanza (cada
cosa tiene su sitio).

**Pistas suaves**: si una habitación está vacía, Tito invita a abrir el baúl; si el baúl tiene cosas nuevas, lleva un
puntito con el número, como el álbum.

### 3.2 Interacciones de verdad

Cuatro capas, de lo más inmediato a lo más elaborado. Lo de hoy (C2–C7) se mantiene y pasa a ser la capa 3.

| Capa | Qué es | Quién actúa | Ejemplo |
| --- | --- | --- | --- |
| 1. Toque directo | El objeto responde al instante al tocarlo: se mueve, suena, se abre | El niño | La pelota bota, la nevera se abre, el tambor suena, el reloj hace tic-tac. |
| 2. Estado | El objeto cambia y **se queda así** (se guarda) | El niño | La lámpara encendida, la cama deshecha, la tele encendida con dibujos, las cortinas cerradas. |
| 3. Tito juega | Tito va y hace su acción (lo de C2), ahora con **2 o 3 variantes** por objeto | Tito | Se sienta en el sofá / salta en el sofá / se echa la siesta. |
| 4. Juegos y escenas | Las 10 escenas pequeñas de C3–C5 y los juegos nuevos de la casa (§ 3.4) | Los dos | El cielo del telescopio, «¡A recoger!». |

**Cómo se reparten los toques** (regla sencilla para 3 años):

- **Un toque** = capa 1 (o capa 2 si el objeto tiene estado): respuesta inmediata.
- **Tocar a Tito y luego un objeto**, o **arrastrar a Tito hasta el objeto** = capa 3: Tito va y juega con él.
- Si el niño toca **dos veces seguidas** el mismo objeto con escena, sale un botón grande con el dibujo de la escena
  («¡A mirar las estrellas!») para entrar en la capa 4. Así las escenas dejan de abrirse solas al jugar y no
  interrumpen.
- Tito, si está libre, mira lo que toca el niño y a veces comenta o se acerca solo (sin bloquear nada).

**Estados que se guardan** (se apuntan en `S.casaEst`, ver § 3.5): lámpara (luz de la habitación), tele
(encendida/apagada y canal), cama (hecha/deshecha), cortinas de cada ventana (día/noche), nevera y baúl (solo
mientras están abiertos), regadera (llena/vacía), grifo de la bañera (agua/vacía), cuadro (cuál de 3 dibujos), reloj
(marca la hora real), pizarra (el último dibujo, que ya guarda la escena de C4 si se decide), planta (crece con el
huerto de C5).

**Física sencilla y sin motor** (para el rendimiento): botes con una parábola y amortiguación, rodar por el suelo
hasta un borde, balanceo (columpio), girar (globo terráqueo). Todo con la hora `T`, como `casaReacciones.ts`.

**Combinaciones con más sentido** (las 14 de C7 y unas 15 nuevas):

- **Por cercanía en el sitio**: un objeto pequeño encima de un mueble compatible hace algo (el pato en la bañera
  flota, el cuento en la cama hace que Tito lo lea, la tarta en la mesa enciende las velas).
- **Por habitación**: algo en su habitación habitual da un pequeño extra la primera vez (la regadera en el jardín
  riega sola la planta).
- **Pista visual**: cuando el niño arrastra un objeto cerca de su pareja, la pareja hace un guiño (brillo corto), para
  que se descubran sin leer.

**Catálogo propuesto por objeto** (1 = toque directo, 2 = estado, 3 = variantes de Tito; las escenas de C3–C5 se
quedan). Es una primera propuesta para revisar en cada fase; lo marcado con ★ es lo más importante.

| Habitación habitual | Objeto | 1. Toque directo | 2. Estado | 3. Variantes de Tito |
| --- | --- | --- | --- | --- |
| Salón | sofá ★ | los cojines botan | — | se sienta / salta / siesta |
| Salón | tele ★ | se enciende con el último canal | encendida, canal (3 dibujos animados cortos) | se sienta delante / baila con la música |
| Salón | lámpara ★ | luz sí/no | luz de la habitación | — |
| Salón | alfombra | ondas al tocar | — | se tumba / croqueta |
| Salón | cuadro | se tuerce y se endereza | cuál de 3 dibujos | lo mira / lo endereza |
| Salón | planta de interior | las hojas se mueven | — | la riega (si hay regadera) |
| Salón | banco | cruje | — | se sienta |
| Salón | estantería | salen y entran libros | — | coge un libro y lo lee |
| Salón | reloj ★ | tic-tac y dice la hora real | marca la hora real | lo mira y dice qué toca hacer (rutina) |
| Salón | farol | se enciende | encendido | — |
| Salón | piano ★ | una nota por tecla tocada | — | toca una canción / baila |
| Salón | fuente | salpica gotas | agua sí/no | se moja y se sacude |
| Dormitorio | cama ★ | rebota la almohada | hecha / deshecha | se tumba / salta / la hace |
| Dormitorio | baúl ★ | se abre y salen juguetes guardados | — | busca dentro |
| Dormitorio | cuento | se abre y pasa una página | — | lo lee en voz alta (frase corta) |
| Dormitorio | estrellas del techo | brillan | encendidas de noche | las cuenta (1 a 5) |
| Cocina | mesa | — (tiene sitios encima) | puesta / sin poner | pone la mesa |
| Cocina | silla | se mueve un poco | — | se sienta |
| Cocina | nevera ★ | se abre y se ve la comida | — | coge una fruta y la come |
| Cocina | olla ★ | burbujea | fuego sí/no | remueve |
| Cocina | tarta | velas sí/no | velas encendidas | sopla las velas |
| Baño | bañera ★ | sale agua del grifo | con agua / vacía | se baña / juega con espuma |
| Baño | toalla | se balancea | — | se seca |
| Baño | jabón | burbujas | — | se lava las manos |
| Baño | pato | cuac y flota si hay agua | — | lo aprieta |
| Juegos | pelota de playa ★ | bota y rueda | — | la chuta / la lanza |
| Juegos | bloques ★ | se apilan uno más en cada toque (hasta 5) y se caen | torre de 0 a 5 | construye y los tira |
| Juegos | peluche | se aplasta y suena | — | lo abraza |
| Juegos | cometa | se sacude | — | la vuela (en el jardín sube de verdad) |
| Juegos | xilófono ★ | una nota por barra | — | toca la escala |
| Juegos | muñeca | baila | — | la acuna |
| Juegos | robot ★ | anda unos pasos y gira | — | baila como un robot |
| Juegos | tren de juguete ★ | da una vuelta por una vía pequeña | — | lo empuja |
| Juegos | guitarra | un acorde | — | la toca |
| Juegos | tambor | suena | — | marca un ritmo para repetir |
| Juegos | pizarra | se ve el último dibujo | último dibujo | pinta |
| Juegos | pinturas | salpican color | — | pinta en la pared (se borra sola) |
| Juegos | globo | sube y baja | — | lo sujeta y flota un poco |
| Juegos | tobogán | algo baja por él | — | se tira |
| Jardín | árbol | caen hojas o frutos | — | se esconde detrás |
| Jardín | planta con flor | la flor se abre | (huerto de C5) | la huele / la riega |
| Jardín | regadera | gotea | llena / vacía | riega lo que tiene cerca |
| Jardín | columpio ★ | se balancea | — | se columpia |
| Jardín | castillo de arena | se le cae una torre y vuelve | — | lo construye |
| Jardín | piscina | ondas | — | se tira / chapotea |
| Torre | telescopio ★ | gira hacia la ventana | — | mira (escena del cielo) |
| Torre | globo terráqueo ★ | gira | — | lo gira y dice un continente |
| Torre | Saturno | gira el anillo | — | lo mira |
| Torre | cohete ★ | cuenta atrás y tiembla | — | despega (como hoy) |
| Mascotas | perro, gato, pájaro, conejo, hámster, peces | sonido y saltito | (cuidados de C6) | lo acaricia / juega; **pasean solas por la habitación** y siguen a Tito |

### 3.3 2D o 3D: evaluación

Fernando propone que la casa sea 3D. Hay tres caminos:

| | A. 2D mejorada («2,5D») | B. 3D con recortables (recomendada) | C. 3D completa |
| --- | --- | --- | --- |
| Qué es | La misma casa 2D, con suelo en perspectiva, sitios, profundidad y sombras dibujadas. | Habitaciones 3D de verdad (paredes, suelo, ventana, puerta, luz) con Three.js, como la casita de tema 3D (`mundo3d/casita3d.ts`). Los objetos son los dibujos de siempre como **recortables de cartón de pie** (`picTex` + `spr`/`plane`, con contorno y sombra redonda), y los muebles con los que más se juega se modelan en 3D poco a poco. Tito es el Tito 3D de siempre (`makeTito`), que anda con `walkTo`. | Todos los objetos (55) modelados en 3D, con animaciones de piezas (puertas de la nevera, teclas del piano...). |
| Trabajo | Poco (2 fases). | Medio (3 fases para la casa 3D, más modelos poco a poco). | Mucho: unos 55 modelos con animaciones; varias semanas de fases. |
| Cómo se ve | Mejor que hoy, pero sigue plano. | Casa con profundidad, luz de día/noche, Tito anda por dentro y la cámara sigue; cambia mucho la sensación. Los recortables quedan bonitos en estilo «libro troquelado» y casan con el mapa 3D. | Lo más vistoso. |
| Rendimiento | Igual que hoy (60 FPS). | Una habitación cada vez, sin sombras reales (sombra redonda), texturas en caché: comparable a la casita 3D. Hay que medirlo en un móvil de verdad (M0). | El más pesado; riesgo en móviles viejos. |
| Interacciones | Todas las de § 3.2 se pueden hacer en 2D. | Todas, y además puertas entre habitaciones, cámara que se acerca a lo que se toca, luz real de la lámpara. | Igual que B, con animaciones más ricas. |
| Riesgo | Bajo. | Medio: el paso del 2D al 3D en la casa es un cambio grande; se reduce con el prototipo M0 y manteniendo la 2D de reserva. | Alto. |

**Recomendación: B, condicionada al prototipo M0.** Razones:

- La capa 3D ya está preparada para esto: la casita de tema y el cofre son escenas 3D hechas a partir de la 2D
  (`SCENES.cofre = {...cofre2D, three: true, ...}`) que proyectan cada cuadro las posiciones 3D a la pantalla de
  1600×900 (`proj`, `projO`) para que la lógica 2D siga funcionando. La casa 3D seguiría el mismo patrón: la lógica
  de la casa (sitios, baúl, toques, Tito, escenas) se escribe una vez y la dibuja la 2D o la 3D.
- Los 55 dibujos ya existen (`PICS`) y `picTex` los convierte en texturas: no hay que modelar 55 objetos para tener
  la casa en 3D desde el primer día.
- Se modelan en 3D solo los muebles que más se usan y donde más se nota (unos 12: cama, sofá, mesa, silla,
  estantería, baúl, nevera, bañera, piano, tele, telescopio, columpio), cuando haya tiempo, sin bloquear nada.
- **La 2D se queda de reserva**: si el aparato no tiene WebGL (`R3frame` es null) o va muy lento (la calidad `PRK`
  llega al mínimo y los FPS siguen bajos), la casa se ve en 2D con los mismos datos. Y la zona de adultos puede tener
  un interruptor «Casa en 3D / 2D».
- Las 10 escenas pequeñas (cielo, sopa, baño...) siguen siendo 2D a pantalla completa, como hoy.

**Qué guarda la partida en 3D**: el sitio (`h`), no los píxeles: así 2D y 3D leen lo mismo, y cambiar de una a otra
no mueve nada.

**Cámara**: fija mirando la habitación desde la puerta, un poco desde arriba (como la casita 3D), con un pequeño giro
al arrastrar el fondo con el dedo y acercamiento suave al objeto con el que se juega. Nada de cámara libre (marea a
los pequeños y complica tocar).

**Entre habitaciones**: cada habitación tiene sus puertas (dibujadas en la pared o el borde); tocar una puerta hace que
Tito vaya y la cámara pase a la habitación de al lado con un barrido corto. Los botones de arriba se quedan como atajo.

### 3.4 Juegos y vida en la casa (para que pase algo aunque no se toque)

- **La hora de verdad.** De día entra sol por la ventana; por la tarde, luz naranja; de noche, luna y la lámpara
  encendida (ya hay `skyNow()` en la capa 3D y `homeLight` en la 2D). El reloj marca la hora real.
- **Un día con Tito (rutinas).** Según la hora, Tito propone lo que toca, con un icono en un bocadillo: desayunar
  (mañana, cocina), jugar (media mañana), comer, siesta, baño (tarde), cena y a dormir (noche). Si el niño lo hace
  (lleva a Tito a la nevera, a la bañera, a la cama...), sale una pegatina del día. Es opcional y sin castigo: si no
  se hace, no pasa nada. Contenido de Infantil (rutinas y hábitos).
- **¡A recoger!** Un juego que se abre desde el baúl: hay 5 a 8 cosas fuera de su sitio y el niño las arrastra a su
  habitación (en 3 años, al baúl; en 4 y 5 años, cada una a su habitación: clasificar). Sin fallos: si se equivoca,
  Tito dice dónde suele ir.
- **¿Dónde está?** Tito esconde un juguete (el peluche, la pelota...) y da una pista con una posición: «Está
  **debajo** de la cama», «**encima** de la mesa», «**dentro** del baúl», «**al lado** del sofá». El niño lo busca
  tocando. Vocabulario espacial, por edad (3 años: encima/debajo; 4: dentro/fuera, delante/detrás; 5: al lado,
  entre, izquierda/derecha).
- **Las mascotas viven en la casa.** Pasean solas entre sus sitios, se tumban en la alfombra, siguen a Tito un rato;
  el perro trae la pelota si está en la misma habitación. (Siguen sin enfermar ni ponerse tristes.)
- **Visitas.** De vez en cuando (una vez al día como mucho) llama a la puerta un amigo de la isla (un animal del
  bosque, la lorita Polly de la Isla del Inglés) y Tito le enseña algo de su casa: el niño elige qué.
- **Decorar** (fase final): colores de pared y de suelo, cortinas y papel pintado como artículos nuevos de la tienda,
  que se aplican tocando la pared.

### 3.5 Partida guardada (`S`)

Regla del proyecto: **las partidas guardadas no se rompen nunca** (versión y migraciones en `dominio/partida.ts`,
receta en [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)). La partida está en la versión 4 (fase C1).

**Propuesta: versión 5, solo añadiendo campos.**

| Campo | Hoy | Después | Notas |
| --- | --- | --- | --- |
| `home[id]` | `{x, y, r}` | `{x, y, r, h?}` | `h`: id del sitio (`'salon:suelo3'`, `'cocina:mesa:1'`...). `r: 'baul'` = guardado. `x` e `y` se siguen escribiendo (la posición 2D del sitio), para que nada que los lea se rompa. |
| `casaEst` | — | `{[id]: valor}` | Estados de los objetos (lámpara, tele y canal, cama, cortinas, regadera, cuadro, torre de bloques...). Lo que no esté, en su valor normal. |
| `casaVistos` | — | `{[id]: 1}` | Lo que ya se colocó alguna vez (para el puntito de «nuevo» del baúl). |
| `casaDia` | — | `{d: 'AAAA-MM-DD', hechas: [...]}` | Rutinas hechas hoy (fase M6); se vacía al cambiar el día. |
| `rooms`, `mascotas`, `sorpresas`, `huerto`, `owned` | igual | igual | No cambian. |

**Migración 4 → 5** (en `dominio/partida.ts`, con pruebas):

1. Para cada habitación, sus objetos se ordenan por su `y` de hoy y cada uno va al sitio libre **más cercano** a donde
   estaba en el que quepa (los de pared, a la pared; la alfombra, a la alfombra).
2. Los que no quepan (habitación llena o tamaño sin sitio) van al baúl (`r: 'baul'`).
3. Lo comprado que no estaba en `home` (no debería pasar, pero `placeHome` lo arreglaba al entrar) va al baúl.
4. `x` e `y` pasan a ser las del sitio. No se borra nada más.

Así ningún niño encuentra su casa vacía de golpe: está casi igual, pero ordenada; lo que estorbaba, en el baúl.

**Las partidas viejas de `curiolandia-3d`** (copia única, `{x, y}` sin `r` = salón) pasan por las migraciones de
siempre y después por la 4 → 5: se prueba en `tests/regresion/guardado-viejo.js` con una partida de 40 objetos en el
salón.

### 3.6 Arquitectura

Siguiendo la arquitectura limpia del repo ([ARQUITECTURA.md](ARQUITECTURA.md)):

| Capa | Archivo nuevo o cambiado | Qué lleva |
| --- | --- | --- |
| Dominio | `dominio/casaSitios.ts` (nuevo) | Tipos `Sitio`, `TamanoObjeto`; reglas puras: `sitiosDe(habitacion, home)`, `cabe(objeto, sitio)`, `colocar`, `guardar`, `sitioMasCercano`, `ordenar` (lo de «¡Ordena, Tito!»), `migrarAHuecos` (la de 4 → 5). Sin dibujo ni `S`. Pruebas en `tests/unidad/casaSitios.test.ts`. |
| Dominio | `dominio/casa.ts` | Añade `TOQUES` (capa 1), `ESTADOS` (capa 2, con su valor normal), variantes de `REACCIONES` y combinaciones nuevas. |
| Dominio | `dominio/partida.ts` | `VERSION_PARTIDA = 5` y el paso 4 → 5. |
| Contenido | `contenido/casaSitios.ts` (nuevo) | Los sitios de cada habitación (posición 2D, posición 3D, tipo) y el tamaño de cada objeto. Son datos: añadir una habitación o un objeto es añadir filas. |
| Contenido | `contenido/casa.ts` | Frases nuevas (toques, estados, rutinas, juegos). |
| Aplicación | `aplicacion/casa.ts` (nuevo) | Casos de uso: `colocarObjeto`, `guardarObjeto`, `cambiarEstado`, `comprarParaCasa` (al baúl). Usan el dominio y guardan con los puertos. |
| Escenas | `escenas/tienda.ts` → `escenas/casa.ts` (nuevo) | Sacar `SCENES.casaTito` de la tienda (que hoy tiene 1890 líneas) a su propio módulo, antes de cambiarla. |
| Escenas | `escenas/casaBaul.ts` (nuevo) | La bandeja del baúl y el arrastre a los sitios. |
| Escenas | `escenas/casaToques.ts` (nuevo) | Toques directos y estados en 2D (como `casaReacciones.ts`). |
| Escenas | `escenas/casaJuegos.ts` (nuevo) | «¡A recoger!», «¿Dónde está?», rutinas. |
| 3D | `mundo3d/casa3d.ts` (nuevo) | La casa por dentro en 3D, con `montarCasa3D()`: habitaciones, recortables, Tito, puertas, cámara, proyección a la disposición; `SCENES.casaTito = {...casa2D, three: true, ...}`. |
| 3D | `mundo3d/muebles3d.ts` (nuevo, poco a poco) | Los muebles modelados. |

### 3.7 Pruebas

- **Unidad (Vitest)**: `casaSitios.test.ts` (que todos los objetos tienen tamaño y caben en algún sitio; que ningún
  sitio se repite; que `colocar` nunca deja dos en el mismo sitio; que `ordenar` pone cada uno en su habitación; la
  migración 4 → 5 con partidas de ejemplo: vacía, normal, llena, vieja de curiolandia-3d, con datos rotos); ampliar
  `casa.test.ts` (cada toque y estado tiene su frase); `partida.test.ts` (versión 5).
- **Regresión (Playwright)**: ampliar `tests/regresion/casa.js` con casos nuevos desde C26 (abrir el baúl, arrastrar a
  un sitio, guardar, llevar a otra habitación, «¡Ordena, Tito!», toques y estados que se guardan al recargar, juegos
  nuevos, la casa en 3D y su reserva 2D); `guardado-viejo.js` con la migración; `fps.js` mide también la casa (2D y 3D).
- **Contrato de pruebas** ([CONTRATO-PRUEBAS.md](CONTRATO-PRUEBAS.md)): **no se quita nada** de lo que ya leen las
  pruebas (`homeItems`, `placeHome`, `roomOf`, `roomsOpen`, `homeRoom`, `SCENES.casaTito.paseo/acc/va/irA/paseoTok`,
  `combina`...). Lo nuevo se añade con su fila: `sitiosDe`, `baul()`, `SCENES.casaTito.colocar(id, h)`,
  `SCENES.casaTito.guardar(id)`, `casaEst`, y en 3D lo que haga falta en `window.__w3`. Si `placeHome` cambia de
  comportamiento (al baúl en vez de a la habitación), se mantiene su nombre y se apunta en el contrato.
- **Capturas** de cada habitación llena antes y después, en el PR de cada fase.

### 3.8 Rendimiento en móviles

- **Medir primero, en un móvil de verdad.** Las cifras de [LINEA-BASE.md](LINEA-BASE.md) (mapa 2,7 FPS, casita 3D
  6,4) son del navegador de pruebas con WebGL por software, que es mucho más lento que un móvil. En M0 se mide el
  prototipo en el móvil de Fernando (y, si puede, en uno viejo) con un contador de FPS en la zona de adultos.
- **Objetivo**: 30 FPS en un móvil de gama media; nunca por debajo de lo que hoy da la casita 3D.
- **Presupuesto de la casa 3D**: una sola habitación montada a la vez (la de al lado se monta al cruzar la puerta y la
  anterior se libera con `disposeWorld`); menos de 150 llamadas de dibujo y 60.000 triángulos; geometrías unidas
  (`mg`) y compartidas (`gcache`); texturas de los recortables a 256 px en caché (una por objeto, reutilizadas entre
  visitas); sin sombras reales, solo una sombra redonda debajo de cada objeto; luz ambiental + una direccional;
  calidad adaptable `PRK` como el resto; el bucle se para con la pestaña oculta.
- **Reserva 2D** automática si no hay WebGL o si los FPS no llegan (§ 3.3).
- **En 2D**: los sitios ordenan el dibujo y evitan solapes; dibujar menos objetos a la vez (los guardados no se
  dibujan) hace la 2D incluso más ligera que hoy.

### 3.9 Frases y voz

- Sin voces grabadas: voz del navegador, castellano de España.
- Calculo unas **200 a 300 frases nuevas** (toques, estados, variantes de Tito, baúl, rutinas, juegos, visitas).
- En cada fase: se apuntan en `dialogos/pendientes.txt` y se rehace el catálogo con `npm run dialogos`
  (`dialogos/todos.csv`). Las frases que ya dice el juego no se cambian sin necesidad.
- Frases cortas (una idea, menos de 12 palabras) y con el nombre de las cosas, para aprender vocabulario.

---

## 4. Fases

Cada fase en su rama y su PR, con la versión subida en `package.json`, documentación al día (`CAMBIOS.md`,
`ARQUITECTURA.md`, `ESTADO-GUARDADO.md`, `CONTRATO-PRUEBAS.md`, este plan), frases en `pendientes.txt` y
`npm run test:pr` en verde. El juego queda publicable al final de cada una.

| Fase | Qué entra | Se ve | Depende de |
| --- | --- | --- | --- |
| **M0. Prototipo 3D** | Un salón 3D con 8 recortables, Tito andando y la cámara, detrás de un interruptor en la zona de adultos («Casa en 3D (prueba)»). Contador de FPS. Fernando lo prueba en su móvil y se decide si se sigue con la B o se queda en la A. **Hecha en la v0.2.98**: escena aparte `SCENES.casa3dPrueba` (`mundo3d/casa3d.ts`), que se abre con el botón «Casa de Tito en 3D (prueba)» de la sección «Casa de Tito» de la zona de adultos; enseña el salón del niño (o 8 cosas de muestra si tiene menos de 4), sin sombras reales, con el contador de FPS y la calidad arriba a la derecha. No cambia la casa de verdad ni guarda nada. | Solo con el botón | — |
| **M1. Reglas de los sitios** | `dominio/casaSitios.ts`, `contenido/casaSitios.ts` (sitios de las 7 habitaciones y tamaño de los 55 objetos), partida versión 5 con la migración 4 → 5, `aplicacion/casa.ts`; `SCENES.casaTito` pasa a `escenas/casa.ts` sin cambiar nada. Pruebas de unidad. **Hecha en la v0.2.97**, con dos cambios: las tablas (sitios y tamaños) van en `dominio/casaSitios.ts` y no en `contenido/`, porque la migración de la partida (dominio) las necesita y el dominio no importa nada de fuera; y la migración 4 → 5 solo añade `h` (no mueve `x`, `y` ni la habitación, ni guarda nada en el baúl), para que en M1 no cambie nada en pantalla: lo que se queda sin sitio irá al baúl en M2, cuando el baúl exista. `aplicacion/casa.ts` se hace en M2, con la escena que lo usa. Con los 55 objetos comprados y repartidos como hoy, 44 reciben sitio y 11 se quedarían sin él. | Nada | — |
| **M2. El baúl y la casa ordenada (2D)** | Baúl con bandeja y pestañas, arrastrar a sitios que se iluminan, guardar, lo nuevo al baúl, botones de habitación más fáciles, «¡Ordena, Tito!», dibujo por sitios sin solapes. **Arregla ya el desorden**, aunque luego se pase a 3D. **Hecha en la v0.2.99**: casos de uso en `aplicacion/casa.ts` (`arreglarCasa` al entrar, `nuevoAlBaul`, `colocarObjeto`, `guardarObjeto`, `ordenarCasa`) y la bandeja en `escenas/casaBaul.ts`. La bandeja tapa el armario mientras está abierta (abajo, una fila de 7 con flechas; las pestañas, a la izquierda, solo las de las categorías con algo guardado: todo, casa, juguetes, jardín y mascotas). Un toque en una cosa del baúl la pone sola en el sitio libre que prefiere de la habitación (para los más pequeños, a quienes les cuesta arrastrar). «¡Ordena, Tito!» (la varita de la bandeja) pide un segundo toque antes de ordenar, para que no se deshaga la casa sin querer. Lo nuevo del baúl lleva un número rojo en su botón (`casaVistos`, campo nuevo que no necesita migración). La fila de delante de los sitios sube un poco (y de 750 a 775) para asomar por encima de la bandeja. Los regalos del cofre también van al baúl. `placeHome` sigue existiendo (lo usan las pruebas) y coloca en un sitio. | Sí | M1 |
| **M3. Objetos que responden** | Capa 1 (toque directo) y capa 2 (estados guardados en `casaEst`) para los 49 objetos; reglas de toque nuevas (un toque = objeto; Tito = arrastrarlo o tocarlo antes; escena = botón tras dos toques); variantes de Tito; combinaciones por sitio y nuevas; pistas de pareja. **Partida en dos.** **M3a, hecha en la v0.2.112**: el toque directo de las 55 cosas (`TOQUES` en `dominio/casaToques.ts`: bota, salta, gira, se sacude, se balancea, se aplasta, late, tiembla, sube o rueda, dibujado en `escenas/casaToques.ts`), los estados guardados en `S.casaEst` de 11 cosas (`ESTADOS`: lámpara, que oscurece su habitación, farol, tele con 3 canales, cama, olla, tarta, bañera, regadera, fuente, estrellas y la torre de 5 bloques, que se cae) y las reglas de toque nuevas: un toque, el objeto responde y Tito dice su nombre la primera vez; tocar a Tito lo deja listo 6 s (un aro bajo los pies) y el siguiente objeto que se toque, va y juega; dos toques seguidos a un objeto con escena (o a una mascota) sacan su botón grande, que lleva a Tito a jugar y luego a la escena. El cuadro con 3 dibujos se deja para M3b, porque necesita dibujos nuevos. **M3b, pendiente**: variantes de Tito, combinaciones por sitio y nuevas, pistas de pareja y arrastrar a Tito hasta un objeto. | Sí | M2 |
| **M4. Casa 3D: salón, dormitorio y cocina** | `mundo3d/casa3d.ts` con el patrón de la casita 3D: habitaciones con paredes, ventana y puerta; recortables en los sitios; Tito 3D; cámara; baúl y arrastre en 3D; luz de la hora y de la lámpara; reserva 2D automática. | Sí (3 habitaciones) | M0 (si sale bien), M3 |
| **M5. Casa 3D: baño, cuarto de juegos, jardín y torre** | Las 4 habitaciones que faltan, puertas entre habitaciones con paso de cámara, mascotas que pasean; primeros muebles modelados (cama, sofá, nevera, bañera). | Sí | M4 |
| **M6. Un día con Tito** | La hora de verdad en la casa, rutinas del día con bocadillo, pegatina del día (`casaDia`), reloj con la hora. | Sí | M3 (2D) o M5 (3D) |
| **M7. Juegos de la casa** | «¡A recoger!» (por edad), «¿Dónde está?» (posiciones por edad), visitas de amigos de la isla, el perro trae la pelota. | Sí | M3 |
| **M8. Decorar y cerrar** | Colores y papel pintado de pared y suelo en la tienda; resto de muebles modelados; álbum ampliado con lo nuevo; sección de la zona de adultos (casa 3D/2D, qué ha descubierto); `fps.js` y capturas finales; repaso de todo el plan. | Sí | M5, M7 |

Si en M0 se decide **quedarse en 2D**, M4 y M5 se cambian por una sola fase «M4. Casa 2,5D» (suelo en perspectiva,
profundidad, sombras, puertas dibujadas) y el resto sigue igual.

Orden propuesto: M0 y M1 a la vez (no dependen entre sí), luego M2 (lo más urgente: el desorden), M3, y después la
3D (M4, M5) y los juegos (M6, M7), que pueden alternarse.

---

## 5. Riesgos

| Riesgo | Qué se hace |
| --- | --- |
| La casa 3D va lenta en móviles | Prototipo M0 medido en un móvil de verdad antes de decidir; presupuesto de § 3.8; reserva 2D automática y el interruptor de adultos. |
| Al migrar, la casa del niño cambia y se asusta («¿dónde están mis cosas?») | La migración deja cada cosa lo más cerca posible de donde estaba; solo va al baúl lo que no cabe. La primera vez, Tito explica el baúl y lo abre enseñando lo guardado. |
| Tocar, arrastrar, jugar con Tito y abrir escenas se confunden | Una regla para cada cosa (§ 3.2), probada con Playwright y con niños (Fernando); umbral de arrastre de 12 px como hoy. |
| Recortables 2D dentro de 3D se ven raros de lado | La cámara casi fija los ve siempre de frente; los recortables giran un poco hacia la cámara (como los sprites) y llevan contorno y sombra. |
| Demasiado contenido para 3 años | Las capas 3 y 4 no se imponen: con un toque ya pasa algo. Los juegos son opcionales y por edad. |
| Romper lo que leen las pruebas | No se quita nada del contrato; lo nuevo se añade con su fila. |
| `escenas/tienda.ts` ya es muy grande | En M1 la casa sale a su propio módulo antes de cambiarla. |
| Muchas frases nuevas sin voz grabada | Voz del navegador (regla del proyecto); frases cortas; todas en `pendientes.txt` y en el catálogo. |
| La casa resta tiempo a las casitas | Sigue sin dar monedas y cuenta en el límite de tiempo de la zona de adultos. |

---

## 6. Decisiones abiertas para Fernando

Cada una con lo que se recomienda. Con «de acuerdo con lo recomendado» se puede empezar por M0 y M1.

| # | Decisión | Opciones | Recomendado |
| --- | --- | --- | --- |
| 1 | ¿2D o 3D? | A. 2D mejorada · B. 3D con recortables · C. 3D completa | **B, si el prototipo M0 va bien en tu móvil**; si no, A. |
| 2 | ¿Qué pasa con lo que se compra? | Va al baúl y Tito pregunta dónde ponerlo · Va directo a su habitación como hoy | **Al baúl, que se abre con lo nuevo brillando y los sitios de su habitación iluminados**; si no se coloca, se queda guardado. |
| 3 | ¿Qué pasa con lo que ya está en la casa al actualizar? | Se ordena en su sitio más cercano y lo que no cabe va al baúl · Todo al baúl y se empieza de cero | **Se ordena y lo que no cabe va al baúl** (nadie encuentra la casa vacía). |
| 4 | ¿Cualquier objeto en cualquier habitación? | Sí, con la regla de tamaño · Solo en su habitación y alguna más | **Sí, todos, con la regla de tamaño** (la piscina en el salón vale si hay un sitio grande libre). |
| 5 | ¿Cuántos sitios por habitación? | 8 de suelo (3 grandes) + 4 de pared + alfombra + encima de los muebles · Más · Menos | **El recomendado**: caben unos 15 objetos por habitación sin amontonarse. |
| 6 | ¿Cómo se juega con un objeto? | Un toque = el objeto responde; Tito juega si se le arrastra o se le toca antes; la escena con un botón tras dos toques · Como hoy (un toque = Tito va y juega, y se abre la escena) | **La nueva regla**: el niño es el que juega primero. |
| 7 | ¿Cómo se va de una habitación a otra? | Botones de arriba · Puertas (3D) · Las dos | **Las dos**. |
| 8 | ¿Siguen las habitaciones abriéndose con las casitas? | Sí · Todas abiertas | **Sí**: es un premio que ya funciona. |
| 9 | ¿Rutinas del día («Un día con Tito»)? | Sí, opcionales, sin castigo · No | **Sí**, con pegatina del día y sin nada negativo si no se hacen. |
| 10 | ¿Juegos nuevos de la casa? | «¡A recoger!» y «¿Dónde está?» · Solo uno · Ninguno | **Los dos**, por edad. |
| 11 | ¿Decorar paredes y suelos con monedas? | Sí, artículos nuevos en la tienda · No | **Sí, en la última fase**. |
| 12 | ¿Cámara 3D? | Casi fija con un pequeño giro al arrastrar · Libre | **Casi fija** (mejor para 3 años). |
| 13 | ¿Visitas de amigos de la isla? | Sí, una al día como mucho · No | **Sí**, en M7. |
| 14 | ¿Interruptor «Casa en 3D / 2D» en la zona de adultos? | Sí · No (solo automático) | **Sí**, además del cambio automático. |

Lo que **no cambia** de PLAN-CASA.md: las mascotas nunca enferman ni se ponen tristes, la casa no da monedas, las
escenas pequeñas no tienen fallos ni tiempo y el álbum de sorpresas sigue (se amplía).
