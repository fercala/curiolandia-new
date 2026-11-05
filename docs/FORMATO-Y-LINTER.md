# Formato y linter

Desde la v0.2.91 todo el código (`src/`, `tests/`, `herramientas/` y la configuración de Vite) tiene el mismo formato,
lo pone una herramienta y no la mano, y pasa un linter. Antes el código venía de `curiolandia-3d`, escrito muy
apretado (varias instrucciones por línea y líneas de cientos de letras) y solo algunas funciones se habían pasado a
mano a una instrucción por línea (las «mejoras de código» 9 a 9h).

## Las órdenes

```sh
npm run formato             # formatea todo el código (Prettier)
npm run formato:comprobar   # falla si algún archivo no está formateado (lo pasa GitHub Actions)
npm run lint                # el linter (oxlint): falla con cualquier aviso (lo pasa GitHub Actions)
```

El gancho de commit (`herramientas/git-hooks/pre-commit`) también comprueba el formato y el linter de los archivos de
código que van en el commit. Si falla por formato, `npm run formato` (o `npx prettier --write <archivo>`), `git add` y
otra vez el commit. Lo más cómodo es que el editor formatee al guardar: en VS Code, la extensión de Prettier
(`esbenp.prettier-vscode`) y la de oxc (`oxc.oxc-vscode`), que leen la configuración del repositorio.

## Formato: Prettier

Configuración en `prettier.config.mjs`: sangría de 2 espacios, comillas simples, punto y coma y líneas de hasta 120
letras, como ya se escribía a mano. Una opción importante:

- `quoteProps: 'preserve'`: las claves de los objetos se quedan como están (`'gato':` con comillas, `gato:` sin
  ellas). El catálogo de frases (`herramientas/dialogos/catalogo.mts`) lee las claves entre comillas como textos; si
  Prettier las quitara, `dialogos/todos.csv` cambiaría.

Qué formatea: lo que no deja fuera `.prettierignore` (fuera: `docs/`, `dialogos/`, `public/`, `.claude/`, `.github/`
y los `.md`, `.html` y `.json`). Prettier no parte los comentarios largos: esos siguen a mano.

**El formato no cambia el juego.** Se comprobó al formatear todo: el JavaScript de `dist/index.html` antes y después,
pasado los dos por el minificador de rolldown sin compresión ni nombres nuevos (solo quita espacios y comentarios),
sale idéntico, letra por letra. Lo mismo vale para comprobar cualquier cambio que solo deba tocar el formato.

## Linter: oxlint

¿Por qué oxlint y no ESLint? El proyecto usa TypeScript 7, que ya no tiene la API de JavaScript que necesita
`typescript-eslint` (que pide TypeScript 6.0 o anterior). oxlint tiene las mismas reglas que ESLint (y las de
`typescript-eslint`, `unicorn`...), escritas en Rust: no necesita TypeScript y revisa todo el proyecto en menos de un
segundo. Los tipos ya los revisa `npm run tipos`.

Configuración en `.oxlintrc.json` (con comentarios):

- Las reglas de la categoría **correctness** (código que casi seguro está mal o no sirve para nada), como errores.
- `no-unused-expressions` admite `a && b()` y `c ? d() : e()` como instrucción: es la forma corta de un `if` que el
  juego usa mucho.
- `no-unused-vars` no cuenta lo que empieza por `_` (parámetros que se reciben y no se miran) ni el error de un
  `catch`.
- `unicorn/prefer-string-starts-ends-with` está apagada: `/o$/.test(w)` y `w.endsWith('o')` hacen lo mismo.

Si una línea hace a propósito lo que la regla señala, se deja con un comentario que diga por qué:

```ts
// oxlint-disable-next-line erasing-op -- el «* 0.0» es una perilla apagada a propósito
```

Lo que el linter encontró la primera vez (v0.2.91) y cómo se dejó:

| Dónde | Aviso | Qué se hizo |
| --- | --- | --- |
| `escenas/casaMascotas.ts` (2), `escenas/tienda.ts`, `dominio/partida.ts` | `...(x \|\| {})`: el `{}` sobra | `...x` (repartir `undefined` en un objeto no hace nada: mismo resultado) |
| `temas/temas.ts` (fondo de la asamblea) | `c ? a() : (b(), d())` como instrucción | `if`/`else` con las mismas llamadas |
| `temas/temas.ts` (colores de 3 años) | `[, 'azul']`, lista con un hueco | `[undefined, 'azul']` (solo se lee la posición 1) |
| `nucleo/dibujo.ts`, `mundo3d/objetos.ts` (2), `dibujos/pics-c.ts` | `x * 0` siempre vale 0 | se deja (perillas apagadas a propósito) con su comentario |
| `tests/regresion/informe-b.js` | dos variables sin usar (`s`, `w0`) | quitadas |
| `tests/regresion/limites.js` | cambia `Date` | se deja: la prueba cambia la hora a propósito |
| `tests/unidad/letras.test.ts`, `contenido.test.ts` | `\u0000` en una expresión regular | se deja: es la marca de la Ñ mientras se quitan los acentos |

Los seis cambios del juego se comprobaron con el mismo minificador: el JavaScript montado solo cambia en esas seis
líneas.

## Comentarios de cabecera con funciones partidas

Prettier parte en varias líneas las funciones con muchos parámetros (`const panelZone = (` y un parámetro por línea).
`tests/comentarios.py` junta esas líneas hasta la flecha para seguir exigiendo el comentario de cabecera.
