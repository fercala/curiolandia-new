# Ideas para llevar Curiolandia a otro nivel

**Estado: aprobado todo (8 de noviembre de 2026), en marcha de una idea en una.** Hechas: P1 (el cole, el patio y
«¡Estatuas!», v0.2.102) P2 («Tito dice», v0.2.103) P3 (yoga de los animales, rincón de la calma y pausa activa, v0.2.104) P4 (retos en casa y la opción de quitar los juegos de moverse, v0.2.105) P5 (el autobús del cole y la granja escuela con sus dos primeras estaciones, v0.2.106) P6 (el resto de las estaciones de la granja: queso, cepillar, huerto y tractor, v0.2.107) P7 (los animales recortables que pasean por la granja y el álbum de excursiones, v0.2.108) P8 (crecer por días y el manzano de la granja, v0.2.109) y P9 (crías y familias de animales, v0.2.110). El orden y las fases, en el apartado 12. Fernando pide muchas ideas viables para que el juego sea más
rico, con juegos más largos y profundos, más uso del motor 3D y actividades nuevas (una visita del cole a la granja,
carreras y juegos al aire libre...), **sin perder nada de lo que ya hay**. Este documento es el banco de ideas: Fernando
eligió el 8 de noviembre de 2026 **hacerlas todas, de una en una** («Vamos a hacer todos, ve haciendo de uno a la vez»);
cada una va en su PR (las grandes, en varias fases), como
[PLAN-LECTURA.md](PLAN-LECTURA.md), [PLAN-INGLES.md](PLAN-INGLES.md) o [PLAN-CASA-MEJORA.md](PLAN-CASA-MEJORA.md).

Cómo leer cada idea:

- **Qué es**: lo que ve y hace el niño.
- **Por qué**: por qué divierte y qué aprende (con el currículo de Infantil en mente: 3, 4 y 5 años).
- **Esfuerzo**: **S** (pequeño: un PR, uno o dos días), **M** (mediano: dos o tres PR), **L** (grande: una fase larga
  de cuatro a siete PR, como una isla). Es una estimación con lo que hay hoy.
- **Reutiliza**: las piezas que ya existen y ahorran trabajo.

---

## 1. Lo que hay hoy (y lo que limita)

Lo que se ha mirado en el código antes de proponer:

- **Contenido**: 36 casitas de edad (12 por camino en el Jardín, el Bosque y la Montaña) con unos 6 juegos cada una, los
  Rincones de los Conceptos, canciones, trazos, rutinas, días especiales, la **Isla de las Letras** (34 casitas) y la
  **Isla del Inglés** (34 casitas, con Polly). En total, más de 100 casitas y unos 45 componentes de juego
  (`juegos/comps.ts`, `comps2.ts`, `lectura.ts` y los de inglés).
- **Juegos cortos**: casi todos son de rondas (busca, arrastra, memoria, cuenta, traza...) y duran uno o dos minutos.
  No hay ninguno que dure diez minutos con una historia, ni juegos de moverse de verdad.
- **Casa de Tito**: habitaciones, baúl y sitios, mascotas que crecen (`cuidar`, `etapaMascota` en `dominio/casa.ts`),
  huerto con flor que crece por días, cocina, baño, música, telescopio, globo... y el plan de mejora en marcha (M3 a M8:
  objetos que responden, casa 3D, «Un día con Tito», «¡A recoger!»). Estas ideas **no repiten** ese plan.
- **Motor 3D** (`mundo3d/`): mapa, zonas, casitas, cofre, islas y la casa de prueba. Ya sabe hacer cosas que hoy se
  usan poco:
  - Tito 3D que anda a donde se toca (`walkTo`, `walkGround`), con huellas y polvo.
  - Cámara que se mueve suave (`camRig`, `camTick`).
  - Muchos animales y objetos 3D hechos con piezas (`objetos.ts`: cabra, rana, cangrejo, pingüino, ardilla, búho,
    pájaros, ballena, delfín, loro, marmota, abejas, mariquitas, autobús, cometa, pompas, muñeco de nieve...).
  - **Recortables**: cualquier dibujo de `PICS` puede ser una figura plana en 3D (`picTex`), como en la casa 3D de
    prueba. Así cualquier animal o cosa de los temas sale en 3D sin modelarlo.
  - Cielo de día y de noche, estaciones (`seasonFx`), luciérnagas, estrellas, nubes, lluvia de partículas.
- **Zona de adultos** reorganizada (siete categorías, resumen, progreso, avisos).

Límites que condicionan las ideas:

1. **Cada camino admite 12 casitas** y ya están llenos: lo nuevo no cabe como «más casitas» en el Jardín, el Bosque o la
   Montaña. Va en **sitios nuevos del mapa** (como las islas) o en un tipo de actividad nuevo.
2. **Rendimiento del 3D en el móvil**: falta la medida de FPS de la casa 3D de prueba en el móvil de Fernando (fase M0).
   Las ideas 3D proponen siempre una versión ligera y una reserva 2D, y conviene tener esa medida antes de la primera
   escena 3D grande.
3. **Partidas guardadas**: todo lo nuevo va en campos nuevos y opcionales de `S` (con migración si hace falta), nunca
   cambiando los que hay.
4. **Voz del navegador**: cada idea trae muchas frases nuevas (se apuntan en `dialogos/pendientes.txt`). Las frases
   cortas y claras suenan mejor con la voz del navegador.
5. **Niños de 3 a 5 años**: sesiones de 10 a 20 minutos, un toque o un arrastre como mucho, nada de leer instrucciones,
   nada de perder ni de castigo, y el adulto controla el tiempo (`S.limit`).

---

## 2. Bases comunes (se construyen una vez y sirven a muchas ideas)

Antes de las ideas, cuatro piezas que, si se hacen bien una vez, abaratan casi todo lo demás. Se hacen dentro de la
primera idea que las necesite, no aparte.

| Base | Qué es | La usan |
|---|---|---|
| **B1. Motor de excursiones** | Un tipo de actividad larga: llegada (en autobús), varias **estaciones** en orden o libres (cada una un minijuego o una escena), una historia que las une, foto de grupo al final y recuerdo en el álbum. Datos en `contenido/` (una excursión = una lista de estaciones), reglas en `dominio/excursiones.ts` (qué estación toca, qué se ha visto) y escena genérica `escenas/excursion.ts`. | Ideas 1 a 9 |
| **B2. Animales de granja 3D** | Vaca, cerdo, oveja, gallina, pollito, caballo, conejo y pato: primero como **recortables** de sus dibujos (`picTex`, gratis) con sombra y un saltito al andar; después, si los FPS lo permiten, modelados con piezas como `goat3`. Saben andar, comer y hacer su sonido (`SOUNDS`). | Ideas 1, 2, 22, 34 |
| **B3. Patio 3D** | Un escenario 3D al aire libre (césped, árboles, arenero, columpios, pista con líneas) con Tito y sus amigos (Lupi, Polly, Pipo) como corredores. Cámara que sigue a Tito. | Ideas 10 a 17 |
| **B4. Crecer por días** | Generalizar la regla de las mascotas (`cuidar`, `etapaMascota`: días cuidados → etapas) para cualquier ser vivo: animales de la granja, crías, plantas del huerto grande, un árbol del mapa. Ya existe y tiene pruebas: solo hay que sacarla a una regla común. | Ideas 1, 22, 33, 34 |

---

## 3. Excursiones del cole (actividades largas con historia)

Un **autobús del cole** nuevo en el mapa (el `bus3` 3D ya existe) lleva a las excursiones. Cada excursión dura de 10 a
15 minutos, se puede dejar a medias y seguir otro día (se guarda la estación), y al acabar hay una **foto de grupo** y una
**pegatina** en un álbum de excursiones. Las excursiones se abren por edad o por temas terminados (la granja al acabar
«Los animales de la granja», el zoo con «Animales domésticos y salvajes»...), así refuerzan lo que ya se ha aprendido.

### 1. La granja escuela ⭐ (la que propone Fernando)

- **Qué es**: llegada en autobús y la granjera saluda. Estaciones:
  1. **Dar de comer**: cada animal pide lo suyo (la vaca hierba, la gallina maíz, el conejo zanahorias, el cerdo
     restos de fruta, el caballo heno y una manzana) y el niño lo arrastra a su comedero. Si se equivoca, el animal lo
     huele y pone cara rara (sin castigo).
  2. **Recoger huevos**: buscar huevos en la paja del gallinero y contarlos en la cesta (de 3 a 10 según la edad).
  3. **Ordeñar y hacer queso** (paso a paso: ordeñar, remover, moldear): secuencia temporal.
  4. **Limpiar y cepillar**: frotar al caballo y bañar al cerdo en el barro (otra vez se ensucia).
  5. **El huerto**: sembrar, regar y recoger (zanahorias para el conejo).
  6. **Paseo en tractor** por la granja (3D: la cámara va detrás del tractor y se ven los animales en el prado).
  7. **¡Han nacido crías!**: la estación sorpresa (ver idea 22): al volver otro día, algún animal tiene crías y el niño
     elige su nombre.
- **Por qué**: es la actividad estrella de Infantil en la vida real; trabaja animales y su comida, de dónde vienen los
  alimentos (huevo, leche, queso, lana), contar, secuencias, cuidar seres vivos y empatía.
- **Esfuerzo**: **L** (con B1, B2 y B4). Primera fase jugable en 2D con recortables; 3D después.
- **Reutiliza**: `Arrastra` (comederos: como el «corral» de 3A-T9), `Excava` y `Lens` (huevos escondidos), `Cuenta`,
  `Secuencia` (el queso), `Frota` (cepillar), `Riega` y el huerto de la casa, los dibujos de los animales y sus
  sonidos (`SOUNDS`, `ONO`), `cuidar`/`etapaMascota`, el tema 3A-T9 y el `bus3` 3D.

### 2. El zoo

- **Qué es**: recorrido por recintos (sabana, selva, polo, reptiles, aviario). En cada uno, un reto: dar a cada animal su
  comida, descubrir a quién pertenece una huella o un sonido, contar crías, y un **safari fotográfico** (idea 20) para
  completar el álbum del zoo. El cuidador cuenta un dato curioso de cada animal.
- **Por qué**: animales salvajes y dónde viven (4A-T9, 5A-T8), clasificar (qué comen, cómo se mueven, dónde viven).
- **Esfuerzo**: **M** con el motor de excursiones ya hecho.
- **Reutiliza**: dibujos de jirafa, cebra, tigre, león, cocodrilo, camello, pingüino, oso polar...; `Sonido`, `Une`
  (animal con su casa), `Arrastra`, `pinguino`/`peng3`, `parrot3`, `owl3`.

### 3. El acuario

- **Qué es**: túnel submarino en 3D (la cámara avanza y los peces pasan alrededor). Retos: tocar los peces de un color,
  contar estrellas de mar, alimentar a los delfines al ritmo (palmas), ordenar del más pequeño al más grande, la ballena
  que canta.
- **Por qué**: el mar y sus animales (3A-T12), tamaños, colores, contar; asombro visual.
- **Esfuerzo**: **M**.
- **Reutiliza**: `whale3`, `dolph3`, `crab3`, `peng3`, `bubbles3`, `sea3`, `Atrapa` (peces que pasan), `Series`,
  `Palmas`.

### 4. El museo de los dinosaurios

- **Qué es**: excavar huesos con el pincel, montar el esqueleto como un puzle, medir al dinosaurio con pasos de Tito,
  separar los que comen plantas de los que comen carne, y un huevo que eclosiona al final.
- **Por qué**: 5A-T7 (Los dinosaurios) es de los temas que más gustan; paciencia, medida, clasificar.
- **Esfuerzo**: **M**.
- **Reutiliza**: `Excava`, `Puzzle`, `Arrastra`, dibujos `fosil`, `huevoDino`, `tiranosaurio`, `triceratops`,
  `diplodoco`, `pterodactilo`, `volcan`.

### 5. El parque de bomberos y la ciudad

- **Qué es**: visitar el parque de bomberos (vestirse por orden, subir al camión, apagar un fuego con la manguera), la
  panadería (hacer pan), el centro de salud (curar a un muñeco) y cruzar la calle bien.
- **Por qué**: los oficios (4A-T7) y la calle (4A-T8), educación vial, secuencias.
- **Esfuerzo**: **M**.
- **Reutiliza**: `vestir` (fábrica de «vestir al nene»), `Apaga`, `Semaforo`, `Cruce`, dibujos de los oficios y sus
  herramientas (`pics-a.ts`).

### 6. El bosque de otoño (senderismo)

- **Qué es**: un sendero 3D por el bosque: recoger hojas de colores y castañas, seguir huellas hasta la madriguera,
  escuchar y adivinar animales, ver una ardilla que guarda bellotas y montar un mural con lo recogido al volver.
- **Por qué**: el otoño (3A-T4, 4A-T3, 5A-T3), observar la naturaleza, clasificar por color y tamaño.
- **Esfuerzo**: **M**.
- **Reutiliza**: `leafs3`, `squir3`, `burrow3`, `owl3`, `tree3`, `Huellas`, `Sonido`, `Pinta` (mural).

### 7. El mercado

- **Qué es**: una lista con dibujos y monedas de verdad (euros de 1 y 2 y céntimos para los mayores): comprar en la
  frutería, la panadería y la pescadería, pagar y recibir la vuelta (5 años). Después, cocinar algo en la casa de Tito
  con lo comprado.
- **Por qué**: matemáticas útiles (contar, sumar, el valor del dinero), alimentos (5A-T4 Comer sano), autonomía.
- **Esfuerzo**: **M**.
- **Reutiliza**: `Cuenta`, la cocina de la casa (`casaSopa`, `casaMerienda`), dibujos de frutas y verduras.

### 8. El planetario y el viaje a la Luna

- **Qué es**: la cuenta atrás (10 a 0), despegar en un cohete 3D, pasar por los planetas, pisar la Luna (Tito salta a
  cámara lenta), plantar una bandera y volver.
- **Por qué**: el universo (5A-T6), contar hacia atrás, el día y la noche, asombro.
- **Esfuerzo**: **M**.
- **Reutiliza**: `casaCielo`, `jupiter`, `saturn`, `bigDipper`, `skyStars`, `marte`, `Gira` (día y noche), `sayNum`.

### 9. Un día de playa

- **Qué es**: hacer un castillo de arena, buscar conchas, ponerse la crema, jugar a las palas, ver los barcos y el faro,
  y recoger la basura de la playa.
- **Por qué**: el verano (3A-T12), cuidar el planeta (5A-T11), hábitos (la crema, el agua).
- **Esfuerzo**: **S** a **M**.
- **Reutiliza**: `sandc3`, `umb3`, `crab3`, `lighthouse3`, `concha`, `Excava`, `Arrastra` (reciclar), `Frota` (crema).

---

## 4. El patio: carreras y juegos al aire libre

Un **patio del cole** nuevo en el mapa (B3). Aquí la idea es doble: juegos de patio en la pantalla y, sobre todo,
**juegos que hacen moverse al niño de verdad** (la app pone la música y las consignas, el niño se mueve y luego toca).
No se puede comprobar si se ha movido: se confía y se celebra, como hace la profe.

### 10. Carreras de Tito ⭐

- **Qué es**: carrera 3D por una pista del patio o un camino del bosque contra Lupi, Polly y Pipo. El niño toca para que
  Tito salte charcos y piedras, recoge estrellas y elige atajos (izquierda o derecha, como `Cruce`). Todos llegan y todos
  tienen medalla; al final, el podio cuenta «primero, segundo, tercero». Variantes por edad: 3 años, solo tocar para
  saltar; 5 años, coger los números en orden o las letras de una palabra por el camino.
- **Por qué**: lo que pide Fernando; ordinales, reflejos, coordinación ojo-mano y, en las variantes, números y letras.
- **Esfuerzo**: **M** (corredor 3D con la cámara detrás de Tito; la pista es una cinta como los caminos de las zonas).
- **Reutiliza**: `makeTito`, `walkTo`, `camRig`, `ribbon`/`roadPts` (la pista), `ball3`, `flag3`, los amigos
  (recortables de Lupi y Polly), `titoCheer`.

### 11. ¡Estatuas! (baila y para) ⭐

- **Qué es**: suena música y Tito baila; el niño baila de verdad. Cuando la música para, todos quietos como estatuas
  («¡Quieto como un flamenco!», «¡Quieto como un robot!»). Cinco rondas. Con micrófono no hace falta: es un juego de
  confianza.
- **Por qué**: actividad física, escucha, control del cuerpo (inhibición, muy trabajado en Infantil).
- **Esfuerzo**: **S**.
- **Reutiliza**: la música (`nucleo/sonido.ts`, `SONGS`), las poses de Tito de la casa (`poseTito`: bailando,
  sentado...).

### 12. Tito dice (Simón dice) en movimiento

- **Qué es**: «Tito dice: ¡salta tres veces!», «Tito dice: toca tu nariz», «¡Agáchate!» (sin «Tito dice», no vale).
  Tito lo hace a la vez en la pantalla. Por edad, consignas más largas o con izquierda y derecha.
- **Por qué**: esquema corporal, lateralidad, escucha activa y movimiento.
- **Esfuerzo**: **S**.
- **Reutiliza**: `Cuerpo` (partes del cuerpo), `EnPollySays` (la misma mecánica en inglés), poses de Tito.

### 13. Yoga de los animales y el rincón de la calma

- **Qué es**: posturas de animales (el gato, la cobra, el flamenco, la rana) con Tito haciéndolas, y respiraciones
  guiadas (inflar un globo, oler la flor y soplar la vela). Puede salir sola tras 20 minutos de juego como **pausa
  activa**, y al final del día antes de dormir.
- **Por qué**: relajación, emociones (4A-T4), equilibrio; un buen final de sesión para los padres.
- **Esfuerzo**: **S**.
- **Reutiliza**: `Velas` (soplar), `Song`, las poses de Tito, `VIVO.sessionT` y `restAsked` (ya avisan de descansar).

### 14. El escondite

- **Qué es**: Tito cuenta hasta 10 (el niño cuenta con él) y luego busca a sus amigos escondidos en el patio o el bosque
  3D (detrás de árboles, en el tobogán, dentro de la casita). Pistas de posición: «está detrás de algo verde», «debajo
  del tobogán». Después se cambian los papeles: el niño esconde a Tito y un amigo lo busca.
- **Por qué**: conceptos espaciales (delante, detrás, dentro, debajo), contar, atención.
- **Esfuerzo**: **M**.
- **Reutiliza**: `Lens`, el Rincón de los Conceptos (arriba/abajo...), `tree3`, `bush3`, `walkTo`, la cámara.

### 15. Circuito de psicomotricidad

- **Qué es**: un circuito con aros, túnel, banco, conos y colchoneta. El niño programa a Tito tocando los obstáculos en
  el orden que dice la profe («primero el túnel, luego el banco»), y Tito lo recorre en 3D. Versión física: el adulto
  monta en casa un circuito con cojines y la app pone las consignas.
- **Por qué**: dentro/fuera, encima/debajo, alrededor, memoria de órdenes, secuencias.
- **Esfuerzo**: **M**.
- **Reutiliza**: `Secuencia`, `walkTo` por puntos, el Rincón de los Conceptos.

### 16. Juegos de patio cortos (paquete)

Cada uno es un juego pequeño del patio; se pueden hacer de dos en dos:

- **Rayuela**: tirar la piedra a una casilla (número que dice Tito) y saltar a la pata coja contando. Números del 1 al
  10. *(S; reutiliza `Cuenta`, `sayNum`.)*
- **Columpios**: empujar en el momento justo para subir más alto (ritmo). *(S.)*
- **Penaltis**: elegir hacia dónde chuta Tito (izquierda, derecha, arriba) y contar los goles. *(S; `ball3`.)*
- **Pompas de jabón**: soplar (tocar) y explotar las pompas del color que se pide. *(S; `bubbles3`, `Atrapa`.)*
- **La cometa**: llevar la cometa con el dedo sin que toque los árboles; el viento cambia. *(S; `kite3`.)*
- **El pañuelo**: dos equipos con números; cuando Tito dice un número, corre el amigo que lo tiene. *(S; números.)*
- **Las sillas musicales** (sin eliminar a nadie: siempre hay sitio para todos al final). *(S.)*

### 17. Gran día del deporte (jornada larga)

- **Qué es**: una vez por semana, el patio monta unas mini olimpiadas: cinco pruebas seguidas (carrera, salto, puntería,
  equilibrio y relevos), con medallero y una copa para la casa de Tito.
- **Por qué**: une los juegos del patio en una actividad larga con final; superación, deportividad.
- **Esfuerzo**: **S** cuando estén las ideas 10 y 16.
- **Reutiliza**: lo del patio, el cofre y la tienda (la copa como regalo).

---

## 5. Sacarle partido al motor 3D

### 18. Paseo libre por la isla con tesoros escondidos ⭐

- **Qué es**: hoy Tito ya anda a donde se toca en el mapa 3D. La idea es que el mapa sea un sitio para explorar: cada
  día se esconden tres tesoros (una pluma, una concha, una piña) en rincones del mapa, y al acercarse Tito brillan. Hay
  amigos paseando (los animales 3D que ya están por las zonas) que dan pistas. Lo encontrado va a una vitrina en la
  casa de Tito.
- **Por qué**: exploración libre, sensación de mundo vivo, motivo para volver cada día.
- **Esfuerzo**: **M**.
- **Reutiliza**: `walkGround`, `walkTo`, `w.avoid`, los animales y la decoración del mapa, el baúl de la casa.

### 19. Viajes en vehículo entre lugares

- **Qué es**: en vez de un fundido al cambiar de sitio, viajes cortos en 3D: el tren que da la vuelta a la isla y para
  en cada zona, el barco a la Isla de las Letras, el globo a la Isla del Inglés (la cámara vuela) y el autobús a las
  excursiones. El niño toca la bocina, cuenta túneles o dice adiós a los animales.
- **Por qué**: transportes (3A-T11, 4A-T11), orientación; da sensación de mundo grande y conectado.
- **Esfuerzo**: **M** (empezar por el globo y el barco, que ya están en el mapa).
- **Reutiliza**: `globoAire3`, el barco del muelle, `bus3`, `camRig`, `sea3`.

### 20. La cámara de fotos (safari fotográfico)

- **Qué es**: Tito tiene una cámara. En el mapa, las zonas y las excursiones, el niño hace fotos a animales y cosas
  (encuadrar y tocar). Cada foto nueva va a un **álbum de fotos** por páginas («Animales del bosque», «Del mar»...), con
  el nombre en castellano y, si quiere, en inglés.
- **Por qué**: observar, clasificar, vocabulario; un coleccionable que da ganas de volver a todos los sitios.
- **Esfuerzo**: **M**.
- **Reutiliza**: `pickAt` (qué hay bajo el dedo en 3D), los animales 3D, `NAMES3`, el álbum de sorpresas de la casa
  (`casaAlbum.ts`: mismas páginas y casillas), el diccionario de inglés.

### 21. El tiempo y las estaciones de verdad

- **Qué es**: el mapa cambia con el tiempo: días de lluvia (charcos donde Tito salta con las botas de agua, arcoíris al
  acabar), nieve en invierno (hacer un muñeco de nieve por partes, guerra de bolas con los amigos), viento que mueve
  los árboles, hojas en otoño. La asamblea pregunta qué tiempo hace y el mapa lo muestra.
- **Por qué**: el tiempo y el clima (5A-T9), las estaciones (todos los cursos), y el mundo parece vivo.
- **Esfuerzo**: **M**.
- **Reutiliza**: `seasonFx`, `winterNow`, `summerNow`, `snowman3`, `fallPts`, `skyClouds`, el arcoíris, la asamblea.

### 22. Crías y familias de animales

- **Qué es**: en la granja (idea 1) y en el mapa, los animales bien cuidados tienen crías al cabo de unos días: la
  gallina empolla y nace el pollito (el niño ve cómo se rompe el huevo), la vaca tiene un ternero, la oveja un corderito.
  El niño elige el nombre (como con las mascotas) y las crías crecen por etapas. Juego: unir cada cría con su madre
  y su nombre (pollito-gallina, ternero-vaca, potro-yegua, lechón-cerda).
- **Por qué**: ciclo de la vida (5A-T10 Los seres vivos), vocabulario de crías, responsabilidad y cariño.
- **Esfuerzo**: **M** (encima de la idea 1 y B4).
- **Reutiliza**: `cuidar`, `etapaMascota`, `NOMBRES_MASCOTA`, la escena de la mascota (`casaMascotas.ts`), `Une`.

### 23. Construir con bloques 3D

- **Qué es**: un rincón de construcción: bloques de colores (cubo, cilindro, cono, esfera, arco) que se apilan con el
  dedo. Retos: copiar una torre del modelo, hacer una casa para un animal, contar cuántos bloques hay, y construcción
  libre. Lo construido se puede poner en el jardín de Tito.
- **Por qué**: cuerpos geométricos (5 años), equilibrio, creatividad, contar, copiar un modelo (percepción espacial).
- **Esfuerzo**: **M** (el arrastre en 3D ya se plantea en la casa 3D, M4).
- **Reutiliza**: `Box`, `Cyl`, `Cone`, `Sph` de `materiales.ts`, `pickAt`, el arrastre de la casa.

### 24. Linternas de noche

- **Qué es**: de noche (o en una cueva del monte), Tito lleva una linterna y el niño mueve la luz para encontrar
  animales nocturnos (búho, murciélago, erizo, luciérnagas) y estrellas fugaces.
- **Por qué**: día y noche, animales nocturnos, atención visual; muy atractivo a esta edad.
- **Esfuerzo**: **S** a **M**.
- **Reutiliza**: `Lens` (es la misma mecánica), `fireflies`, `owl3`, el cielo de noche, `casaCielo`.

### 25. Los amigos de Tito en 3D

- **Qué es**: Lupi, Polly y Pipo aparecen en 3D por el mapa: pasean, saludan cuando Tito se acerca y a veces traen un
  encargo («¿Me ayudas a buscar mi gorro?»). Sirven a las carreras, el escondite y las visitas a la casa (M7).
- **Por qué**: el mundo tiene vida y personajes que el niño ya conoce; los encargos llevan a otros sitios del juego.
- **Esfuerzo**: **S** como recortables, **M** modelados.
- **Reutiliza**: `LUPI_SVG`, `POLLY_SVG`, `makePipo`, `picTex`, `walkTo`.

---

## 6. Juegos más profundos y más largos

### 26. La gran aventura de Tito (una historia por capítulos) ⭐

- **Qué es**: una historia larga dividida en capítulos de unos 10 minutos (uno al día): «El mapa del tesoro perdido».
  Cada capítulo lleva a Tito a una zona distinta, con un reto que usa lo aprendido allí (contar en el Bosque, letras en
  la isla, inglés con Polly) y una pieza del mapa del tesoro. Al juntar todas, se abre el gran tesoro (un objeto único
  para la casa). Después puede haber otras temporadas («El dragón que tenía frío», «La estrella que se cayó»).
- **Por qué**: hilo narrativo y motivo para volver; repasa contenidos de todas partes sin que parezca repaso.
- **Esfuerzo**: **L** (la primera temporada), **M** cada temporada después.
- **Reutiliza**: `Story` (cuentos ilustrados), las escenas de zona y de isla, los componentes de siempre, el cofre.

### 27. Cuentos en los que el niño decide

- **Qué es**: cuentos ilustrados en los que, en dos o tres momentos, el niño elige qué hace el protagonista («¿Cruza el
  puente o rodea el río?») y el final cambia. Todos los finales son buenos.
- **Por qué**: comprensión, causa y efecto, toma de decisiones, ganas de volver a leer.
- **Esfuerzo**: **M** (un componente nuevo encima de `Story`, y los cuentos como datos).
- **Reutiliza**: `Story`, `contenido/cuentos.ts`, los fondos `BG` y los dibujos.

### 28. Programa a Tito (pensamiento computacional)

- **Qué es**: un tablero de casillas (en 3D, visto desde arriba) con Tito y una meta (una fresa, su casa). El niño pone
  flechas en orden (adelante, girar) y pulsa «¡Vamos!»: Tito las sigue. Si no llega, se ve dónde se ha equivocado y se
  arregla. 3 años: una o dos flechas sin giros; 5 años: obstáculos y bucles («repite 3 veces»).
- **Por qué**: está en el currículo actual de Infantil (robots tipo abeja en las aulas); secuencias, orientación,
  resolver problemas, ensayo y error sin miedo.
- **Esfuerzo**: **M**.
- **Reutiliza**: `walkTo` por casillas, `Secuencia`, el suelo y los caminos 3D.

### 29. Rincón de lógica (paquete)

- **Laberintos** que Tito recorre con el dedo (de 3 a 5 años, más caminos). *(S; parecido a `Tracer`.)*
- **Tangram y formas**: completar una figura con piezas. *(M; `Puzzle`, `formas`.)*
- **Sudoku de dibujos** de 3x3 o 4x4 (cada fila, un dibujo de cada). *(S.)*
- **¿Qué falta?**: mirar una escena, se tapa, se quita algo, ¿qué falta? *(S; `falta` ya existe en algún tema.)*
- **Las diferencias**: dos dibujos casi iguales. *(S.)*
- **La balanza**: ¿qué pesa más?, equilibrar con bloques. *(S; 5 años, medida.)*

### 30. Taller de experimentos

- **Qué es**: experimentos guiados: ¿flota o se hunde? (predecir y comprobarlo en un barreño), mezclar colores
  (rojo y amarillo dan naranja), el ciclo del agua (sol, nube, lluvia), imanes (¿qué se pega?), sombras con una
  linterna, y la semilla en el algodón (crece en días reales, con B4).
- **Por qué**: método científico a su nivel (predecir, probar, contar lo que ha pasado), ciencias de 4 y 5 años.
- **Esfuerzo**: **M** (cinco o seis experimentos como escenas pequeñas, como las de la casa).
- **Reutiliza**: `Llena`, `Pinta`, `Arrastra`, las escenas pequeñas de la casa como patrón, `regar`/`etapaFlor`.

### 31. Estudio de arte y música

- **Qué es**: colorear libre con más herramientas (rodillo, estampas, purpurina), simetría (pintar media mariposa y la
  otra mitad sale sola), y **componer una canción** con los instrumentos de Tito en una partitura de dibujos que luego
  suena entera. Las obras se cuelgan en la pared de la casa de Tito.
- **Por qué**: expresión artística y musical, simetría, creatividad, orgullo de lo hecho.
- **Esfuerzo**: **M**.
- **Reutiliza**: `casaPizarra`, `casaMusica` (`INSTRUMENTOS`), `Pinta`, los sitios de pared de la casa.

### 32. Modo reto en los juegos de siempre

- **Qué es**: al terminar una casita con todas las estrellas, cada juego tiene una versión **reto** (más opciones, más
  rondas, contra reloj suave con un reloj de arena, sin ayudas) que da una estrella dorada. Para los niños que van rápido
  o tienen 5 años y repiten los temas de 3.
- **Por qué**: alarga lo que ya hay sin contenido nuevo; reto adaptado (zona de desarrollo próximo).
- **Esfuerzo**: **S** a **M** (la dificultad ya es adaptable en `dominio/dificultad.ts`).
- **Reutiliza**: `nOpts`, `nRounds`, `VIVO.ADAPT`, el progreso de los temas.

---

## 7. Un mundo vivo (continuidad entre días)

### 33. La granja de Tito (granja propia que crece)

- **Qué es**: después de la excursión, Tito recibe un pequeño corral junto a su casa. Empieza con una gallina; con los
  días y las monedas, puede tener más animales, un huerto grande y un estanque. Cada día los animales piden algo
  (como las mascotas), dan huevos, leche o lana que se venden en el mercado (idea 7) o se usan en la cocina.
- **Por qué**: rutina diaria de cuidado, causa y efecto, economía sencilla; une la granja, el mercado y la casa.
- **Esfuerzo**: **L** (es casi un juego en sí; hay experiencia en el juego `granja` de Fernando).
- **Reutiliza**: B2, B4, el huerto, la cocina, la tienda, las monedas (`dominio/monedas.ts`).

### 34. Encargos de los vecinos

- **Qué es**: los vecinos de la isla (la panadera, el cartero, la granjera, Lupi, Polly) piden cosas sencillas cada
  día: «tráeme tres manzanas del huerto», «lleva esta carta a la casa azul». El encargo lleva a un sitio del mapa y da
  una recompensa y una cara contenta.
- **Por qué**: comprensión de mensajes, orientación en el mapa, contar, ayudar a los demás.
- **Esfuerzo**: **M**.
- **Reutiliza**: el paseo libre (idea 18), los oficios dibujados, el huerto, las monedas.

### 35. El diario de Tito

- **Qué es**: al final del día (o al volver al día siguiente), Tito cuenta con dibujos lo que hicieron juntos: «Ayer
  fuimos a la granja, dimos de comer a la vaca y nació un pollito». Las páginas quedan en un libro.
- **Por qué**: memoria, lenguaje oral (el adulto puede preguntar «¿te acuerdas?»), vínculo con Tito.
- **Esfuerzo**: **S** a **M** (se apuntan los momentos clave en un campo nuevo de `S`).
- **Reutiliza**: `Story` para enseñarlo, los dibujos de cada actividad.

### 36. Misiones del día y semana temática

- **Qué es**: cada día, tres misiones cortas en el mapa (dar de comer en la granja, una carrera, una casita); la semana
  tiene un tema (la semana del mar, la semana de los bichos) con decoración y una sorpresa el viernes.
- **Por qué**: variedad guiada para el niño que no sabe qué elegir; motivo para volver sin presionar.
- **Esfuerzo**: **S**.
- **Reutiliza**: el repaso del día (`aplicacion/repasoDelDia.ts`), el regalo del día, la asamblea.

---

## 8. Familia, adultos y fuera de la pantalla

### 37. Retos para hacer en casa (sin pantalla) ⭐

- **Qué es**: al cerrar la sesión, Tito propone un reto para hacer fuera de la pantalla, ligado a lo jugado: «busca en
  casa tres cosas rojas», «salta como una rana hasta la cocina», «ayuda a poner la mesa», «cuenta las ventanas de tu
  casa». Al día siguiente, el adulto marca en la zona de adultos que se hizo y Tito lo celebra con una pegatina.
- **Por qué**: lleva lo aprendido a la vida real, actividad física fuera del móvil, implica a la familia. Responde a la
  preocupación por el tiempo de pantalla.
- **Esfuerzo**: **S**.
- **Reutiliza**: la zona de adultos (una página nueva o el Resumen), las pegatinas (`S.stk`), los temas.

### 38. Varios niños en el mismo móvil (perfiles)

- **Qué es**: hasta tres perfiles (hermanos o primos), cada uno con su nombre, su edad, su Tito y su progreso. Al
  abrir, «¿Quién juega?» con las caras.
- **Por qué**: muy pedido en familias con varios hijos; cada uno a su ritmo.
- **Esfuerzo**: **M** (toca el guardado: cada perfil es una partida `S` aparte, con migración cuidadosa: la partida de
  hoy pasa a ser el primer perfil, sin perder nada).
- **Reutiliza**: la escena «¿Quién juega?» (`SCENES.quien`), el puerto de guardado, la copia de seguridad.

### 39. Jugar juntos (dos en el mismo móvil)

- **Qué es**: modo para dos (niño y adulto, o dos hermanos) por turnos: memoria por turnos, carrera de Tito contra Lupi
  con dos botones, el escondite (uno esconde, otro busca).
- **Por qué**: juego compartido, esperar el turno, juego cooperativo con el adulto.
- **Esfuerzo**: **M**.
- **Reutiliza**: `Memoria`, las carreras (idea 10), el escondite (idea 14).

### 40. Fichas para imprimir

- **Qué es**: en la zona de adultos, fichas en PDF para imprimir del tema que está jugando el niño: colorear, trazos de
  las letras, contar y rodear, recortar y pegar.
- **Por qué**: continuidad en papel, motricidad fina con lápiz de verdad.
- **Esfuerzo**: **M** (se generan con los mismos dibujos y trazos que el juego).
- **Reutiliza**: `PICS`, los trazos de `LETRAS`, `TRZ`.

### 41. Informe semanal para la familia

- **Qué es**: un resumen de la semana en la zona de adultos: tiempo jugado, qué ha aprendido, lo que le cuesta, y una
  idea para reforzarlo en casa. Opción de compartirlo con la profe.
- **Por qué**: los padres saben qué hace y cómo ayudar.
- **Esfuerzo**: **S** (las reglas ya están en `dominio/zonaAdultos.ts`).
- **Reutiliza**: el Resumen y «Cómo le va» de la zona de adultos, `S.gs`, `S.kg`.

---

## 9. Pulir lo que ya hay (calidad general)

Fernando pide también «mejor calidad». Son cambios más pequeños que se notan en todo el juego:

- **42. Celebraciones más vistosas**: al terminar una casita, una pequeña fiesta 3D (Tito baila, confeti, los amigos
  aplauden) en vez de solo el cofre. *(S.)*
- **43. Música propia de cada sitio** y sonidos de ambiente (pájaros en el bosque, olas en la playa, viento en la
  montaña). *(S; `nucleo/sonido.ts`.)*
- **44. Transiciones entre escenas** con un viaje corto (idea 19) o un iris que se cierra sobre Tito, en vez de un
  fundido. *(S.)*
- **45. Primeros pasos guiados**: un tutorial jugable de dos minutos la primera vez (tocar, arrastrar, el botón verde,
  la casa). *(S.)*
- **46. Juegos repetidos con más variedad**: los juegos de «conocer» y «busca» (los más repetidos, unos 50) con fondos
  y animaciones distintas por tema, para que no parezcan iguales. *(M.)*
- **47. Rendimiento**: medir de verdad en el móvil (lo pendiente de M0) y bajar la calidad sola cuando haga falta, antes
  de añadir escenas 3D grandes. *(S; `PRK`, `fps.js`.)*

---

## 10. Resumen y recomendación

| Nº | Idea | Categoría | Esfuerzo | 3D |
|---|---|---|---|---|
| 1 | La granja escuela ⭐ | Excursiones | L | Sí (2D al principio) |
| 2 | El zoo | Excursiones | M | Opcional |
| 3 | El acuario | Excursiones | M | Sí |
| 4 | El museo de los dinosaurios | Excursiones | M | Opcional |
| 5 | Bomberos y la ciudad | Excursiones | M | Opcional |
| 6 | El bosque de otoño | Excursiones | M | Sí |
| 7 | El mercado | Excursiones | M | No |
| 8 | El viaje a la Luna | Excursiones | M | Sí |
| 9 | Un día de playa | Excursiones | S–M | Opcional |
| 10 | Carreras de Tito ⭐ | Patio | M | Sí |
| 11 | ¡Estatuas! ⭐ | Patio (moverse) | S | No |
| 12 | Tito dice en movimiento | Patio (moverse) | S | No |
| 13 | Yoga y rincón de la calma | Patio (moverse) | S | No |
| 14 | El escondite | Patio | M | Sí |
| 15 | Circuito de psicomotricidad | Patio | M | Sí |
| 16 | Juegos de patio cortos (7) | Patio | S cada uno | Algunos |
| 17 | Gran día del deporte | Patio | S | Sí |
| 18 | Paseo libre con tesoros ⭐ | Motor 3D | M | Sí |
| 19 | Viajes en vehículo | Motor 3D | M | Sí |
| 20 | Cámara de fotos | Motor 3D | M | Sí |
| 21 | Tiempo y estaciones | Motor 3D | M | Sí |
| 22 | Crías y familias | Motor 3D | M | Sí |
| 23 | Construir con bloques | Motor 3D | M | Sí |
| 24 | Linternas de noche | Motor 3D | S–M | Opcional |
| 25 | Amigos de Tito en 3D | Motor 3D | S–M | Sí |
| 26 | La gran aventura (capítulos) ⭐ | Más profundos | L | Opcional |
| 27 | Cuentos con decisiones | Más profundos | M | No |
| 28 | Programa a Tito | Más profundos | M | Sí |
| 29 | Rincón de lógica (6) | Más profundos | S cada uno | No |
| 30 | Taller de experimentos | Más profundos | M | No |
| 31 | Arte y música | Más profundos | M | No |
| 32 | Modo reto | Más profundos | S–M | No |
| 33 | La granja de Tito | Mundo vivo | L | Sí |
| 34 | Encargos de los vecinos | Mundo vivo | M | Sí |
| 35 | El diario de Tito | Mundo vivo | S–M | No |
| 36 | Misiones del día | Mundo vivo | S | No |
| 37 | Retos en casa ⭐ | Familia | S | No |
| 38 | Perfiles | Familia | M | No |
| 39 | Jugar juntos | Familia | M | No |
| 40 | Fichas para imprimir | Familia | M | No |
| 41 | Informe semanal | Familia | S | No |
| 42–47 | Pulir lo que ya hay | Calidad | S–M | Algunos |

**Recomendación (primer paquete).** Empezar por lo que más cambia el juego con menos riesgo, en este orden:

1. **Ganancias rápidas de moverse** (ideas 11, 12, 13 y 37): un PR pequeño cada una; dan lo de «actividad física»
   enseguida y sin depender del 3D.
2. **La granja escuela** (idea 1) con el motor de excursiones (B1) y los animales recortables (B2), y después las crías
   (idea 22). Es lo que Fernando pone de ejemplo y abre la puerta a todas las demás excursiones, que luego salen mucho
   más baratas.
3. **El patio 3D con las carreras** (B3 e idea 10), cuando esté la medida de FPS del móvil.
4. **Paseo libre con tesoros** (18) y **cámara de fotos** (20): sacan partido al 3D que ya hay y hacen que el mapa sea
   un sitio al que apetece volver.
5. **La gran aventura de Tito** (26) como hilo que une todo lo anterior.

## 11. Decisiones para Fernando

| Nº | Pregunta | Opciones | Recomendación |
|---|---|---|---|
| 1 | ¿Qué ideas se hacen y en qué orden? | Cualquier combinación de la tabla | El primer paquete de arriba. |
| 2 | ¿Dónde van las actividades nuevas en el mapa? | Un sitio por actividad · un autobús (excursiones) y un patio | **Autobús y patio**: dos sitios nuevos y el mapa no se llena. |
| 3 | ¿Las excursiones se abren por edad o por temas terminados? | Edad · temas · las dos cosas | **Las dos**: abiertas por edad, y con un aviso de Tito cuando se termina el tema que la prepara. |
| 4 | ¿Juegos de moverse de verdad (sin poder comprobarlo)? | Sí · solo en pantalla | **Sí**, con aviso a los padres en la zona de adultos y la opción de quitarlos. |
| 5 | ¿Granja escuela en 2D primero o directamente 3D? | 2D primero · 3D | **2D con recortables primero**, 3D cuando haya la medida de FPS. |
| 6 | ¿Perfiles para varios niños? | Sí · no por ahora | **No por ahora**: toca el guardado y conviene hacerlo con calma más adelante. |

Decisiones tomadas (8 de noviembre de 2026): Fernando aprueba todas las ideas; se toma lo recomendado en todo, con un
cambio en la 2: en lugar de dos sitios nuevos, **uno solo, «El cole»**, porque el mapa ya está muy lleno. El cole junta
el patio, el autobús de las excursiones y las clases (los rincones), y así caben casi todas las ideas sin tocar más el
mapa.

## 12. Orden de trabajo y fases

Una idea (o una fase de una idea grande) por PR, en este orden. Lo de cada fase se apunta aquí al acabarla.

| Fase | Qué | Ideas | Estado |
|---|---|---|---|
| **P1** | El cole en el mapa (2D y 3D: el edificio con el autobús), su escena con el patio y lo que viene «¡Muy pronto!», el patio con sus botones y el primer juego, «¡Estatuas!». Reglas en `dominio/cole.ts` (3 monedas la primera vez de cada día, `S.cole`). | 11 | Hecha (v0.2.102) |
| **P2** | «Tito dice»: Tito da órdenes para moverse y un niño dibujado las hace con la parte del cuerpo iluminada; trampas sin «Tito dice» desde los 4 años (reglas en `dominio/titoDice.ts`). Lo común de los juegos del patio, en `escenas/patioComun.ts`. | 12 | Hecha (v0.2.103) |
| **P3** | Yoga de los animales y el rincón de la calma: 8 posturas de animales con Tito en la esterilla y un aro que marca cuándo tomar y soltar el aire; respiraciones del globo y de la flor y la vela. Pausa activa corta a los 20 minutos de juego, que vuelve sola al mapa (reglas en `dominio/yoga.ts`). El yoga antes de dormir queda para cuando se haga la idea de la rutina de la noche. | 13 | Hecha (v0.2.104) |
| **P4** | Retos para hacer en casa sin pantalla (16, uno por día): Tito lo deja al irse a dormir y al proponer descansar; la familia lo marca en el Resumen de la zona de adultos y Tito lo celebra con una pegatina. En «Cómo se juega», el aviso de los juegos de moverse y la opción de quitarlos (el patio cierra y no hay pausa activa). Reglas en `dominio/retos.ts`, `S.retos` y `S.sinMoverse`. | 37 | Hecha (v0.2.105) |
| **P5** | El motor de excursiones (B1: `dominio/excursiones.ts`, `contenido/excursiones.ts`, `escenas/excursion.ts`, `S.exc`), el autobús del cole (elegir destino y viaje; el zoo y el bosque, «¡Muy pronto!») y la granja escuela en 2D con la granjera Rosa y sus dos primeras estaciones: dar de comer y recoger huevos (`escenas/granja.ts`); al hacerlas todas, foto de grupo y 5 monedas la primera vez del día. | 1 | Hecha (v0.2.106) |
| **P6** | El resto de las estaciones de la granja escuela, en 2D (`escenas/granjaTalleres.ts`): hacer queso (ordeñar, remover y apretar en el molde), cepillar al caballo (frotar el barro), el huerto (sembrar, regar y arrancar zanahorias) y el paseo en tractor (recoger balas de paja). La foto de grupo llega con las seis. | 1 | ✅ v0.2.107 |
| **P7** | Los animales recortables (B2, en 2D: `escenas/granjaAnimales.ts`; la vaca, el caballo y el cerdo con cuerpo, sombra y saltito) que pasean por el plano de la granja y saltan y hacen su sonido al tocarlos, y el recuerdo: la foto de grupo va al álbum de excursiones (`escenas/albumExcursiones.ts`, botón en el autobús) y la primera visita da la pegatina de la excursión. Los recortables en 3D, con el patio 3D (B3). | 1 | ✅ v0.2.108 |
| **P8** | Crecer por días (B4): la regla común `dominio/crecer.ts` (cada día cuenta una vez; la etapa sale de una tabla de días), que usan ya las mascotas y la flor de la casa, y el manzano de la granja (`escenas/granjaManzano.ts`, `S.crece`): se planta la primera visita y crece cada día que se vuelve (semilla, brote, arbolito, en flor y con manzanas que caen al tocarlo). | 1 | ✅ v0.2.109 |
| **P9** | Crías y familias de animales (`dominio/crias.ts`, `escenas/granjaCrias.ts`, `S.crias`): desde el segundo día de granja nace una cría por día (pollito, corderito, ternero, lechón y potro); se destapa en la paja (el pollito rompe el huevo), se elige su nombre entre tres, pasea detrás de su madre y crece con los días; con dos o más, «Cada cría con su mamá» (arrastrar cada cría hasta su madre). | 22 | ✅ v0.2.110 |
| **P10** | El patio en 3D (B3: `mundo3d/carreras3d.ts`) y las carreras de Tito (`SCENES.carreras`, reglas en `dominio/carreras.ts`): Tito corre solo por la pista contra Polly, Lupi y Pipo (si ya ha nacido), con la cámara detrás; tocar la pantalla le hace saltar charcos y piedras (si no, tropieza y va más despacio un momento) y coger las estrellas de arriba; desde los 4 años, un cruce (izquierda o derecha, con más estrellas por un lado); a los 5, los números del 1 al 5 en orden. Todos llegan y todos tienen medalla: el podio dice el lugar de cada uno con los ordinales. 3 monedas la primera vez de cada día (`S.cole`). Sin WebGL, «¡Muy pronto!». Se hace en 3D sin esperar a la medida de FPS del móvil: la pista es ligera (sin sombras reales ni modelos nuevos) y el motor baja solo la resolución si va lento. | 10 | ✅ v0.2.111 |
| **P11** | El gran día del deporte (`SCENES.deporte`, `escenas/deporte.ts` y `escenas/deportePruebas.ts`; reglas en `dominio/deporte.ts`): una jornada larga de cinco pruebas seguidas, en orden, cada una con su medalla (oro, plata o bronce: siempre hay medalla, según los puntos y la edad): la carrera (la de la P10, en 3D; sin WebGL la jornada se queda en cuatro pruebas), el salto de longitud (tocar justo antes de la raya, tres saltos), la puntería (la canasta se mueve, cinco tiros), el equilibrio (el niño aguanta a la pata coja de verdad mientras Tito cuenta, con un pie y con el otro: es de confianza y siempre da oro) y los relevos (tocar al siguiente corredor cuando brilla para pasarle el testigo). Al final, el medallero con lo que dice Tito y la copa, una por semana (`S.deporte`); 3 monedas la primera vez de cada día (`S.cole`). La copa se queda en la vitrina de la jornada: aún no va a la casa de Tito, porque los objetos de la casa salen de la tienda; puede ir en las fases de la casa. | 17 | ✅ v0.2.117 |
| **P12** | Juegos de patio cortos, de dos en dos: el patio tiene un botón «Juegos cortos» que abre su menú (`SCENES.juegosCortos`, `escenas/juegosCortos.ts`), con una tarjeta por juego (`JUEGOS_CORTOS`, `dominio/juegosCortos.ts`) y «¡Muy pronto!» en los que faltan. **P12a**: la rayuela (`escenas/rayuela.ts`: Tito dice un número, se toca su casilla para tirar la piedra y Tito salta a la pata coja contando hasta ella, con el niño; casillas como en la tiza, hasta el 5, el 8 o el 10 según la edad; tres rondas) y los columpios (`escenas/columpios.ts`: se empuja a Tito cuando el columpio llega atrás del todo, a la mano; cada empujón a tiempo le sube más, uno a destiempo no quita nada; 5, 6 o 7 empujones según la edad). Cada juego corto se apunta en `S.cole` con su id y da 3 monedas la primera vez de cada día, como las demás actividades del patio. **P12b**: los penaltis (`escenas/penaltis.ts`: se toca un lado de la portería, izquierda o derecha y, con 5 años, arriba, y Tito chuta; Lupi, de portera, casi nunca acierta, `paradaDe`; cinco tiros) y las pompas de jabón (`escenas/pompas.ts`: el niño sopla con Tito y suben pompas de colores; se explotan solo las del color que se pide, `planPompas`: 2, 3 o 4 colores según la edad, tres rondas). **P12c**: la cometa (`escenas/cometa.ts`: la cometa va hacia donde se toca o se arrastra el dedo y hay que llevarla hasta las estrellas, de una en una, sin que toque los árboles; el viento la empuja y cambia de lado cada 5 segundos, más fuerte con los mayores, `vientoEn`; tocar un árbol solo la hace rebotar; 4, 5 o 6 estrellas según la edad, `planCometa`) y el pañuelo (`escenas/panuelo.ts`: Tito en el medio con el pañuelo y dos equipos de amigos con números; Tito dice un número, se toca al amigo de nuestro equipo que lo lleva y corre a por el pañuelo; 3, 4 o 5 amigos según la edad, descolocados con 5 años, `planPanuelo`; cuatro rondas). **P12d**: las sillas musicales sin eliminar a nadie (`escenas/sillas.ts`: Tito y sus amigos bailan en corro mientras suena la música, con el niño; cuando para, los amigos se sientan y se toca la silla libre para que se siente Tito; en cada ronda hay una silla menos, pero los que se quedan sin silla se sientan encima de otro, `repartoSillas`, y al final todos caben en dos sillas; 3, 4 o 5 rondas según la edad, con la música de duración distinta en cada una, `planSillas`). Con ella, P12 está completa. | 16 | P12a ✅ v0.2.128, P12b ✅ v0.2.131, P12c ✅ v0.2.133, P12d ✅ v0.2.135 |
| P13 | El escondite y el circuito de psicomotricidad, de uno en uno: los dos son botones nuevos del patio, que con ocho actividades pone los botones en dos filas. **P13a**: el escondite (`escenas/escondite.ts`, reglas en `dominio/escondite.ts`): Tito se tapa los ojos y cuenta hasta diez con el niño; después busca a sus amigos (2, 3 o 4 según la edad) con una pista de posición para cada uno («¡Está detrás del árbol!», «debajo del tobogán», «dentro de la casita»: seis sitios, dos de cada posición, `planEscondite`); con 3 años asoman un poco, con 4 menos y con 5 nada; en un sitio vacío, Tito dice que allí no hay nadie y repite la pista. Al final se cambian los papeles: el niño elige dónde se esconde Tito y Lupi lo busca, mirando antes en dos sitios (`busquedaLupi`). **P13b**: el circuito (`escenas/circuito.ts`, reglas en `dominio/circuito.ts`): la profe dice el orden de los obstáculos («Primero, el túnel. Después, el banco. Y al final, los aros.»: frases enteras, `frasesDelOrden`), el niño los toca en ese orden (fichas numeradas arriba; con 3 años se ven antes, flojitas) y Tito hace el recorrido (dentro de los aros, por dentro del túnel, por encima del banco, alrededor de los conos y una voltereta en la colchoneta). Tres vueltas de 2, 3 o 4 obstáculos según la edad (`planCircuito`). En 2D, como el resto del patio. | 14, 15 | ✅ P13a v0.2.137, P13b v0.2.150 |
| P14–P15 | Paseo libre con tesoros y la cámara de fotos. | 18, 20 | — |
| P16 | La gran aventura de Tito (primera temporada, en varias fases). | 26 | — |
| Después | El resto de excursiones (2 a 9), el resto del 3D (19, 21, 23, 24, 25), los juegos más profundos (27 a 32), el mundo vivo (33 a 36), la familia (38 a 41) y pulir lo que hay (42 a 47). | — | — |
