# Plan de la casa de Tito interactiva y las mascotas que crecen

Fernando lo pidió y lo aprobó el 2 de noviembre de 2026 («de acuerdo con todo y lo recomendado»): que cada cosa que
se gana o se compra en la tienda tenga alguna interacción en la casa de Tito (por ejemplo, que el telescopio enseñe
las estrellas cuando Tito se acerca), que la casa tenga más gracia y que las mascotas vayan creciendo. El documento
de trabajo con el que se aprobó está en [Claude Docs](https://claude.ai/artifact/9iUsywAqDXDqc1hnhRtGFS); este
archivo es la copia que siguen los PR. Si cambia una decisión, se cambia aquí y se apunta en `CAMBIOS.md`.

## Qué había antes

La casa por dentro es la escena 2D `casaTito` (`escenas/tienda.ts`), con 7 habitaciones (`ROOMS`) que se abren al
terminar casitas. Hay 55 objetos de la casa en la tienda (49 cosas y 6 mascotas). Se pueden arrastrar y llevar a otra
habitación; al tocarlos salen chispitas, 32 tienen sonido propio (`homeAction`) y Tito dice su nombre. Tito está
quieto a la izquierda. Solo crece Pipo, con las estrellas.

## Decisiones tomadas

| # | Decisión | Qué se hace |
| --- | --- | --- |
| 1 | Cómo se acerca Tito | Al tocar un objeto, Tito camina solo hasta él y juega con él. Tocar el suelo lo lleva a ese sitio. Si pasa cerca de algo, el objeto brilla un poco para invitar a tocarlo. |
| 2 | 2D o 3D | La casa por dentro sigue en 2D, con Tito más pequeño para que pueda andar por la habitación. |
| 3 | Cómo crecen las mascotas | Con los días en que se cuidan: bebé, joven (3 días cuidados) y mayor (8). Un día cuenta con dos cuidados distintos. Los días no tienen que ser seguidos. |
| 4 | Sin castigos | Las mascotas nunca enferman, no se escapan, no se ponen tristes y no pierden lo crecido. |
| 5 | Mascotas ya compradas | Empiezan como jóvenes (la migración 3 → 4 les da su ficha); las nuevas nacen bebés. |
| 6 | Nombres | El niño elige entre tres nombres que dice Tito la primera vez; se puede cambiar en la zona de adultos. |
| 7 | Monedas | Jugar en la casa no da monedas: es juego libre y el premio es la sorpresa. |
| 8 | Aprender jugando | Retos pequeños y opcionales, sin fallar: contar estrellas fugaces, repetir un ritmo, la hora del reloj, buscar España en el globo. |
| 9 | Álbum | «Sorpresas de la casa»: se llena con cada reacción y combinación descubierta. |

## Cómo se juega

1. **Reacción** (los 49 objetos que no son mascotas): Tito camina hasta el objeto, el objeto se mueve y Tito hace algo
   con él (`REACCIONES` en `dominio/casa.ts`: se sienta, se tumba, chuta, abraza...). Dura 2 o 3 segundos y Tito dice
   una frase corta.
2. **Escena pequeña** (10 escenas): la pantalla se acerca al objeto y se juega un rato, con un botón para volver.
   `cielo` (telescopio), `mundo` (globo terráqueo), `tele`, `instrumentos` (piano, xilófono, guitarra y tambor),
   `pizarra`, `buenasNoches` (cama), `merienda` (nevera), `sopa` (olla), `bano` (bañera) y `huerto` (flor).
3. **Combinaciones** (`COMBINACIONES`): dos objetos que juntos hacen algo, como el patito en la bañera, la regadera en
   la flor o la pelota al perro.

La tabla completa de qué hace cada objeto está en el documento de trabajo.

## Mascotas

Las 6 de la tienda (`MASCOTAS`: perro de la casita, gato, pájaro, conejo, hámster y peces) tienen ficha en
`S.mascotas`. Al tocar una, Tito va a su lado y salen los botones de sus cuidados (`CUIDADOS`: comer, agua, jugar y
lavar; los peces, comer y mirar). Una mascota pide en su bocadillo lo que le falta hoy (`quiereHoy`), sin insistir.
Al crecer hay fiesta. Pipo sigue creciendo con las estrellas y también se puede cuidar.

## Fases

| Fase | Qué entra |
| --- | --- |
| C1 (v0.2.81) | Reglas y datos en `dominio/casa.ts` con pruebas (`tests/unidad/casa.test.ts`); partida versión 4 con `mascotas`, `sorpresas` y `huerto`; este plan. Nada visible. |
| C2 | Tito camina por la habitación y los 49 objetos tienen su reacción (`escenas/casaReacciones.ts`, frases en `contenido/casa.ts`). Hecha en la v0.2.82. |
| C3 | La torre: escena del cielo de noche (telescopio, `escenas/casaCielo.ts`) y la vuelta al mundo (globo terráqueo, `escenas/casaMundo.ts`); Saturno sale en el cielo si Tito lo tiene; el cohete ya despega desde la C2. Las sorpresas descubiertas se apuntan en `S.sorpresas`. Hecha en la v0.2.83. |
| C4 | Música y dibujo: escenas Los instrumentos (`escenas/casaMusica.ts`), Mi pizarra (`casaPizarra.ts`) y Mi tele (`casaTele.ts`). Hecha en la v0.2.84. |
| C5 | Cocina, baño, dormitorio y huerto: escenas La merienda, Sopa de Tito, El baño, Buenas noches y Mi huerto. |
| C6 | Mascotas que crecen: dibujos de bebé, joven y mayor, cuidados, nombres, avisos y fiesta al crecer. |
| C7 | Combinaciones, álbum «Sorpresas de la casa», mascotas mayores en el mapa, sección en la zona de adultos y prueba de la casa ampliada (`tests/regresion/casa.js`). |

## Partida guardada y voces

Solo se añaden campos (receta en [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)): `mascotas`, `sorpresas` y `huerto`, con
la migración 3 → 4 en `dominio/partida.ts`. `home` y `owned` no cambian. Las frases nuevas (unas 250) van con la voz
del navegador en castellano de España, se apuntan en `dialogos/pendientes.txt` y se rehace el catálogo con
`npm run dialogos` en cada fase.

## Riesgos

| Riesgo | Qué se hace |
| --- | --- |
| Tocar para jugar y arrastrar para mover se confunden | Se mantiene la regla de hoy (moverse más de 12 px es arrastrar) y se prueba con Playwright. |
| 18 dibujos nuevos de mascotas | Se parte de los que hay: el bebé con la cabeza más grande y el cuerpo más corto; el mayor con un detalle. |
| Escenas largas para 3 años | Botón grande de volver; ninguna escena tiene fallos ni tiempo. |
| La casa resta tiempo a las casitas | No da monedas y el límite de tiempo de la zona de adultos sigue contando. |
| Rendimiento en móviles viejos | Todo 2D, como la casa de hoy; se mide con `tests/regresion/fps.js`. |
| Romper lo que leen las pruebas | Lo nuevo se añade a [CONTRATO-PRUEBAS.md](CONTRATO-PRUEBAS.md) sin quitar nada. |
