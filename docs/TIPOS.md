# Tipos (TypeScript)

Desde la fase 2p de la migración todo el juego es TypeScript y hay una sola revisión de tipos, que no cambia el juego:
solo avisa. Hasta entonces había otra para el código global (ver al final).

## `npm run tipos`: TypeScript estricto

`tsconfig.json`. Revisa el código TypeScript: el montaje (`vite.config.mts`, `herramientas/**/*.mts`), las pruebas de
Vitest (`tests/unidad/**/*.ts`) y, desde la fase 2b, los módulos del juego (`src/**/*.ts`: `src/modulos.ts`, los
dibujos de `src/dibujos/` y, desde la 2c, el núcleo de `src/nucleo/`; desde la 2p, todo el juego). Modo estricto (`strict`, `noImplicitReturns`, `noUnusedLocals`...).
**Tiene que terminar sin errores**: lo comprueba GitHub Actions en cada PR. Cada archivo que pasó de global a módulo
entró aquí con todos sus tipos: parámetros con tipo, listas de tuplas con `as const`, opciones con su `interface`
(por ejemplo `Persona`, las opciones de `person()` en `pics-new.ts`, u `OpcionesSay` y `OpcionesTexto` en el núcleo).
Los tipos compartidos del núcleo (`Estado`, `Vivo`, `Escena`, `Particula`...) están en `src/nucleo/tipos.ts`. Lo que
el código que viene del juego viejo crea sin forma fija (escenas con campos propios, lo que se arrastra) usa `Libre` o
un índice con `any`: es la frontera con ese código, que era global y sin tipos, y se cierra en las fases 3 a 5. En la capa 3D
(`src/mundo3d/`), `userData` de Three.js y `Nodo` (material, geometría y sombra de un objeto cualquiera) también son
`any`: cambian de tipo según el objeto.

## Hasta la fase 2p: `npm run tipos:js`

Mientras quedaban archivos globales (`src/*.js`), `tsconfig.js.json` los revisaba como JavaScript con tipos
(`checkJs`), con los tipos de `src/tipos/` (`estado.d.ts`, `globales.d.ts` y `puente.d.ts`, lo que el puente dejaba en
`globalThis`). Salían avisos y `tests/tipos-js.js` fallaba si había más que el límite de `tests/tipos-js-limite.txt`:
ningún cambio podía añadirlos. Fueron 283 al empezar la fase 1 (24 de octubre de 2026), 278 tras la 2a, 254 de la 2b a
la 2d, 229 tras la 2e, 225 tras la 2f, 219 tras la 2h, 218 tras la 2i, 206 tras la 2j, 172 tras la 2k, 159 tras la 2l,
158 tras la 2m, 120 tras la 2n y 0 tras la 2o, al salir `world3d.js`. En la 2p salió `boot.js`, el último archivo
global, y se quitaron la revisión, su límite y `src/tipos/`.

## Cuándo se ponen más tipos

En la fase 2 cada archivo pasó a `.ts` con `import`/`export` y entró en `tsconfig.json`. Lo que queda de forma libre
(`Libre`, `Cosa`, los índices con `any`, `userData` de Three.js) se irá cerrando en las fases 3 (reglas del juego en
`dominio/`), 4 (escenas sin capas) y 5 (temas, cuentos y dibujos como datos tipados). Un tipo más exacto es bienvenido
si no cambia lo que hace el código.
