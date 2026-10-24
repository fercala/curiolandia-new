# Tipos (TypeScript)

Desde la fase 1 de la migración hay dos revisiones de tipos. Ninguna cambia el juego: solo avisan.

## `npm run tipos`: TypeScript estricto

`tsconfig.json`. Revisa el código TypeScript nuevo: el montaje (`vite.config.mts`, `herramientas/**/*.mts`) y las
pruebas de Vitest (`tests/unidad/**/*.ts`). Modo estricto (`strict`, `noImplicitReturns`, `noUnusedLocals`...).
**Tiene que terminar sin errores**: lo comprueba GitHub Actions en cada PR.

## `npm run tipos:js`: el código del juego, con límite de avisos

`tsconfig.js.json`. Revisa `src/*.js` (salvo `icons.js`) como JavaScript con tipos (`checkJs`), usando:

- `src/tipos/estado.d.ts`: el estado guardado `S` (`Estado`), igual que [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md).
  `core.js` lo usa con JSDoc: `/** @type {Estado} */ let S`.
- `src/tipos/globales.d.ts`: temas (`Tema`, `JuegoTema`) y lo que el juego pone en `window` (`__cl`, `__w3`, `__fast`...).
- `@types/three` 0.128: los tipos de Three.js r128 (la variable global `THREE`).

El código es global y casi sin tipos, así que salen avisos (283 al empezar la fase 1, 278 tras la fase 2a). `tests/tipos-js.js` los cuenta
y **falla si hay más que el límite** de `tests/tipos-js-limite.txt`: ningún cambio puede añadir avisos. Si un cambio
los baja, el script lo dice y hay que bajar el límite en el mismo PR. `node tests/tipos-js.js --lista` los muestra todos.

Avisos al empezar (24 de octubre de 2026), por tipo:

| Aviso | Cuántos | Qué suele ser |
| --- | --- | --- |
| TS2339 | 195 | Una propiedad que no está en el tipo: escenas a las que otro archivo añade campos (`wake`, `unl`, `openT`...), elementos HTML genéricos (`value`, `width`). |
| TS2365, TS2362, TS2363 | 38 | Operaciones con valores que TypeScript no sabe que son números (fechas restadas, textos). |
| TS2630 | 14 | Se reasigna una función declarada con `function` (`makeGame = ...`, `thing = ...`): las envolturas de las capas. Desde la fase 2a quedan 9, todas dentro de las funciones `pon*` (`ponGo`, `ponThing`...), que cambian la función de su propio archivo. Desaparecen en la fase 4. |
| Otros | 36 | Llamadas con más o menos argumentos, claves repetidas en objetos, etc. |

## Cuándo se ponen más tipos

En la fase 2 cada archivo pasa a `.ts` con `import`/`export` y entra en `tsconfig.json`; los tipos de `src/tipos/`
pasan a ser los de esos módulos. Hasta entonces, añadir un tipo en `src/tipos/` o una anotación JSDoc es bienvenido
si baja avisos sin cambiar lo que hace el código.
