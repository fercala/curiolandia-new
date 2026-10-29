# Problemas conocidos

Al comentar todo el código (octubre de 2026) se apuntaron estos fallos y rarezas. **Ninguno está arreglado todavía**: la tarea fue solo documentar. Están ordenados de más a menos importante dentro de cada grupo. Si arreglas uno, bórralo de esta lista en el mismo commit.

## Fallos que un niño o una familia pueden notar

| Dónde | Qué pasa |
|---|---|
| juegos/comps.ts, `Excava` | Falla con más de 6 objetos (solo hay 6 posiciones). |
| juegos/comps.ts y juegos/comps2.ts | `Atrapa`, `Excava`, `Riega`, `Frota` y `Velas` no llaman a `onRight`: no dan la moneda por acierto ni ajustan la dificultad. |
| aplicacion/adultos.ts, `frame()` | El candado de adultos cuenta como mucho 0,25 s por fotograma (`VIVO.lockHold`): en un aparato que vaya a menos de 4 FPS (el mapa sin tarjeta gráfica va a unos 3) hay que mantenerlo pulsado más de 3 s. Visto en las pruebas de la fase 0 (B5 de `informe-b.js`, que ahora espera hasta 10 s). |
| temas/extras.ts + temas | El cuento se añade al final de `games` al cargar: añadir un juego al final de un tema con cuento desplaza el progreso guardado del cuento (ver COMO-AGREGAR.md, receta 5). |

## Límites que conviene saber

- Cada camino de edad admite 12 casitas (`zonePos()` en escenas/zonas.ts) y cada casita unos 8 juegos (`st3Pos()` en mundo3d/casita3d.ts).
- La casa de Tito tiene 12 huecos de suelo y 4 de pared por habitación (`HOMESPOT`, `WALLSPOT`): a partir de ahí las cosas nuevas se colocan al azar y pueden quedar unas encima de otras (se pueden mover arrastrándolas).
- Varios números están escritos a mano en frases grabadas ("tres casitas", "seis flores"): si se cambia `NEED` o la regla de 6 flores (`FLORES_PARA_SEGUIR`), los dos en `dominio/apertura.ts`, las frases dejan de cuadrar.
- `tx()` convierte "a vos" en "a tú" (debería ser "a ti"): "¡Ahora te toca a tú!" ya está grabado así en tres frases de las canciones, y hay una más pendiente. Arreglarlo cambia el texto de frases grabadas: habría que regrabarlas.

## Rarezas sin efecto visible (limpieza)

- Multiplicaciones por 0 que no hacen nada (restos de ajustes): `umb3`, `scare3`, `flower()`, `SPOT3.ingles`, `Sonido`, `Cuenta`, `SONGS.colores`...
- Comentarios del código original colocados encima de la función equivocada (están señalados con una nota en los comentarios nuevos).
- `GNAME` recibe `memoria` dos veces; `TU` y contenido/lex.ts tienen pares repetidos o que no cambian nada.
- Campos y variables sin uso: `S.album`, `trim` de los temas (`GICON`, que tampoco se usaba, se borró en la fase 4n).
- Siete piezas 3D piden media esfera o un cilindro abierto (la cúpula de la cabina de `phone3`, las hojas de nenúfar
  de `frog3`, `squir3`, el montón de `leafs3`, la tapa de `tea3`, el nido de `nest3` y la cáscara de `makePipo`), pero
  `Sph` y `Cyl` solo pasan a Three.js el radio y los segmentos, así que se ven enteras. La fase 2o quitó esos
  argumentos de más (no hacían nada); para arreglarlo, que `Sph` y `Cyl` acepten los ángulos y volver a ponerlos.
- `skyClouds`/`orbFace` deciden la noche con su propia hora, distinta de `skyNow()`.
- `EnCuenta` (temas/ingles.ts) ignora `cfg.key`.
- `Gira`, `Semaforo` y `Cruce` ignoran `cfg.bg`.
- `load()` solo mezcla el primer nivel de `S` (subcampos nuevos no reciben valor por defecto en partidas viejas).
