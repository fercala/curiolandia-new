# Problemas conocidos

Al comentar todo el código (octubre de 2026) se apuntaron estos fallos y rarezas. **Ninguno está arreglado todavía**: la tarea fue solo documentar. Están ordenados de más a menos importante dentro de cada grupo. Si arreglas uno, bórralo de esta lista en el mismo commit.

## Fallos que un niño o una familia pueden notar

| Dónde | Qué pasa |
|---|---|
| juegos/comps.ts y juegos/comps2.ts | `Atrapa`, `Excava`, `Riega`, `Frota` y `Velas` no llaman a `onRight`: no dan la moneda por acierto ni ajustan la dificultad. |
| temas/extras.ts + temas | El cuento se añade al final de `games` al cargar: añadir un juego al final de un tema con cuento desplaza el progreso guardado del cuento (ver COMO-AGREGAR.md, receta 5). |

## Límites que conviene saber

La tienda comprueba el saldo y el inventario actuales al confirmar una compra. Si otra pestaña ya notificó que el objeto es del niño, la confirmación anterior se cancela. Un vale conserva una copia de lo ofrecido para detectar cambios de texto y precio. Esto cubre confirmaciones posteriores al evento de almacenamiento. Las escrituras simultáneas anteriores a ese evento siguen requiriendo coordinación entre pestañas.

En «Premios y vales», los controles conservan la entrada que mostraron. Si otra pestaña reemplaza esa entrada antes de la acción, el panel se renueva sin guardar: un índice antiguo no puede editar ni dar por entregado un vale diferente. Una partida recibida de otra pestaña puede exigir repetir la acción tras esa actualización, aunque los textos sean iguales.

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
