# Problemas conocidos

Al comentar todo el código (octubre de 2026) se apuntaron estos fallos y rarezas. **Ninguno está arreglado todavía**: la tarea fue solo documentar. Están ordenados de más a menos importante dentro de cada grupo. Si arreglas uno, bórralo de esta lista en el mismo commit.

## Fallos que un niño o una familia pueden notar

| Dónde | Qué pasa |
|---|---|
| juegos/comps.ts, `Excava` | Falla con más de 6 objetos (solo hay 6 posiciones). |
| juegos/comps.ts y juegos/comps2.ts | `Atrapa`, `Excava`, `Riega`, `Frota` y `Velas` no llaman a `onRight`: no dan la moneda por acierto ni ajustan la dificultad. |
| aplicacion/bucle.ts, `frame()` | El candado de adultos cuenta como mucho 0,25 s por fotograma (`VIVO.lockHold`): en un aparato que vaya a menos de 4 FPS (el mapa sin tarjeta gráfica va a unos 3) hay que mantenerlo pulsado más de 3 s. Visto en las pruebas de la fase 0 (B5 de `informe-b.js`, que ahora espera hasta 10 s). |
| temas/extras.ts + temas | El cuento se añade al final de `games` al cargar: añadir un juego al final de un tema con cuento desplaza el progreso guardado del cuento (ver COMO-AGREGAR.md, receta 5). |

### G1. La tienda cobra dos veces por el mismo artículo en dos pestañas

**Estado:** pendiente. Reproducido en Chromium con la v0.2.134 (`13c943e`).

1. Abre la misma partida con al menos 12 monedas en dos pestañas y entra en la tienda en ambas.
2. Toca el gorro de fiesta en cada pestaña para dejar abiertas las dos confirmaciones.
3. Confirma en la primera. Espera a que la segunda reciba la compra y confirma también allí. Recarga.

**Esperado:** se cobran 6 monedas y queda un gorro. **Observado:** con 100 monedas, el saldo pasa a 94 y después a 88. Sigue habiendo un solo gorro. La pérdida persiste al recargar.

La tienda comprueba si el artículo ya es del niño y si le alcanza el saldo al abrir la confirmación. Al aceptarla, `buy()` en `src/escenas/tienda.ts` no vuelve a comprobar esas dos condiciones antes de gastar. Un posible arreglo es validarlas al confirmar, antes de modificar la partida. Eso cubriría este caso, donde la segunda pestaña ya recibió la compra. Dos escrituras que ocurran antes de que se notifique a la otra pestaña requieren una prueba aparte.

Reproducción automatizada: `node tests/regresion/cobertura.js dist guardado-compra-doble` después de compilar. El caso falla hasta que se corrija la compra.

## Límites que conviene saber

- Cada camino de edad admite 12 casitas (`zonePos()` en escenas/zonas.ts) y cada casita unos 8 juegos (`st3Pos()` en mundo3d/casita3d.ts).
- Cada habitación de la casa de Tito tiene 13 sitios (3 grandes y 5 normales en el suelo, 4 en la pared y la alfombra) más los de encima de los muebles (`SITIOS_FIJOS` y `ENCIMA` en `dominio/casaSitios.ts`). Desde la fase M2 de PLAN-CASA-MEJORA.md las cosas ya no se pisan: lo que no cabe se guarda en el baúl. Con muchas cosas, el salón se llena (unas 16) y hay que repartirlas por las habitaciones.
- Varios números están escritos a mano en frases grabadas ("tres casitas", "seis flores"): si se cambia `NEED` o la regla de 6 flores (`FLORES_PARA_SEGUIR`), los dos en `dominio/apertura.ts`, las frases dejan de cuadrar.

## Rarezas sin efecto visible (limpieza)

- Multiplicaciones por 0 que no hacen nada (restos de ajustes): `umb3`, `scare3`, `flower()`, `SPOT3.ingles`, `Sonido`, `Cuenta`, `SONGS.colores`...
- Comentarios del código original colocados encima de la función equivocada (están señalados con una nota en los comentarios nuevos).
- `GNAME` recibe `memoria` dos veces.
- Campos y variables sin uso: `S.album`, `trim` de los temas (`GICON`, que tampoco se usaba, se borró en la fase 4n).
- Siete piezas 3D piden media esfera o un cilindro abierto (la cúpula de la cabina de `phone3`, las hojas de nenúfar
  de `frog3`, `squir3`, el montón de `leafs3`, la tapa de `tea3`, el nido de `nest3` y la cáscara de `makePipo`), pero
  `Sph` y `Cyl` solo pasan a Three.js el radio y los segmentos, así que se ven enteras. La fase 2o quitó esos
  argumentos de más (no hacían nada); para arreglarlo, que `Sph` y `Cyl` acepten los ángulos y volver a ponerlos.
- `skyClouds`/`orbFace` deciden la noche con su propia hora, distinta de `skyNow()`.
- `EnCuenta` (temas/ingles.ts) ignora `cfg.key`.
- `Gira`, `Semaforo` y `Cruce` ignoran `cfg.bg`.
- `load()` solo mezcla el primer nivel de `S` (subcampos nuevos no reciben valor por defecto en partidas viejas).
