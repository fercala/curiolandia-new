# Tipos (TypeScript)

Desde la fase 1 de la migración hay dos revisiones de tipos. Ninguna cambia el juego: solo avisan.

## `npm run tipos`: TypeScript estricto

`tsconfig.json`. Revisa el código TypeScript: el montaje (`vite.config.mts`, `herramientas/**/*.mts`), las pruebas de
Vitest (`tests/unidad/**/*.ts`) y, desde la fase 2b, los módulos del juego (`src/**/*.ts`: `src/modulos.ts`, los
dibujos de `src/dibujos/` y, desde la 2c, el núcleo de `src/nucleo/`). Modo estricto (`strict`, `noImplicitReturns`, `noUnusedLocals`...).
**Tiene que terminar sin errores**: lo comprueba GitHub Actions en cada PR. Un archivo que pasa de global a módulo
entra aquí con todos sus tipos: parámetros con tipo, listas de tuplas con `as const`, opciones con su `interface`
(por ejemplo `Persona`, las opciones de `person()` en `pics-new.ts`, u `OpcionesSay` y `OpcionesTexto` en el núcleo).
Los tipos compartidos del núcleo (`Estado`, `Vivo`, `Escena`, `Particula`...) están en `src/nucleo/tipos.ts`. Lo que
el código global todavía crea sin tipos (escenas con campos propios, lo que se arrastra) usa `Libre` o un índice con
`any`: es la frontera con el código global y se cierra cuando cada archivo pase a módulo.

## `npm run tipos:js`: el código del juego, con límite de avisos

`tsconfig.js.json`. Revisa `src/*.js` (salvo `icons.js`) como JavaScript con tipos (`checkJs`), usando:

- `src/tipos/estado.d.ts`: nombres globales para los tipos del estado guardado `S` (`Estado`...), que están en
  `src/nucleo/tipos.ts` (igual que [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)), para usarlos con JSDoc.
- `src/tipos/globales.d.ts`: temas (`Tema`, `JuegoTema`), `Libre` y `Vivo` (de `src/nucleo/tipos.ts`) y lo que el
  juego pone en `window` (`__cl`, `__w3`...; `__fast` y `__said` están en `src/nucleo/tipos.ts`).
- `src/tipos/puente.d.ts`: lo que los módulos dejan en `globalThis` para el código global (`PICS`, `S`, `say`, `go`...),
  con el tipo que tiene en su módulo (ver `src/modulos.ts`). Son `const`: el código global no puede reasignarlos.
  `tests/unidad/globales.test.ts` comprueba que la lista es exactamente la del puente.
- `@types/three` 0.128: los tipos de Three.js r128 (la variable global `THREE`).

El código es global y casi sin tipos, así que salen avisos (283 al empezar la fase 1, 278 tras la fase 2a, 254 tras la 2b y 254 tras la 2c: se fueron los 12 de `core.js`
y salieron 12 nuevos porque el código global ve ahora los tipos exactos del núcleo, por ejemplo que `shuffle` devuelve
la misma clase de lista que recibe; 254 tras la 2d, 229 tras la 2e, al salir `comps.js` y `comps2.js`, 225 tras la 2f, al salir los temas, 219 tras la 2h, al salir `extras.js`, 218 tras la 2i, al salir `ingles.js`, 206 tras la 2j, al salir `scenes.js`, 172 tras la 2k, al salir `zonas.js`, 159 tras la 2l, al salir `tienda.js`, y 158 tras la 2m, al salir `repaso.js`). `tests/tipos-js.js` los cuenta
y **falla si hay más que el límite** de `tests/tipos-js-limite.txt`: ningún cambio puede añadir avisos. Si un cambio
los baja, el script lo dice y hay que bajar el límite en el mismo PR. `node tests/tipos-js.js --lista` los muestra todos.

Avisos al empezar (24 de octubre de 2026), por tipo:

| Aviso | Cuántos | Qué suele ser |
| --- | --- | --- |
| TS2339 | 195 | Una propiedad que no está en el tipo: escenas a las que otro archivo añade campos (`wake`, `unl`, `openT`...), elementos HTML genéricos (`value`, `width`). |
| TS2365, TS2362, TS2363 | 38 | Operaciones con valores que TypeScript no sabe que son números (fechas restadas, textos). |
| TS2630 | 14 | Se reasigna una función declarada con `function` (`makeGame = ...`, `thing = ...`): las envolturas de las capas. Desde la fase 2a quedan 9, todas dentro de las funciones `pon*` (`ponGo`, `ponThing`...), que cambian la función de su propio archivo; desde la 2c, 6 (`go`, `rec` y `onRight` son `let` en el núcleo). Desaparecen en la fase 4. |
| Otros | 36 | Llamadas con más o menos argumentos, claves repetidas en objetos, etc. |

## Cuándo se ponen más tipos

En la fase 2 cada archivo pasa a `.ts` con `import`/`export` y entra en `tsconfig.json`; los tipos de `src/tipos/`
pasan a ser los de esos módulos. Hasta entonces, añadir un tipo en `src/tipos/` o una anotación JSDoc es bienvenido
si baja avisos sin cambiar lo que hace el código.
