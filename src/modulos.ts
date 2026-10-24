// Entrada de los módulos del juego (fase 2 de docs/PLAN-MIGRACION.md). El juego se va pasando de un único <script>
// global a módulos TypeScript archivo a archivo, en el orden de ARCHIVOS (herramientas/vite/curiolandia.mts). Mientras
// tanto conviven las dos partes: el plugin de Vite monta estos módulos en un <script> que va ANTES del código global, y
// este archivo deja en globalThis lo que el código global todavía usa de ellos (el «puente»). Cuando todo sea módulo,
// el puente desaparece.
// Los import se evalúan en el orden en que están escritos: primero los dibujos (dibujos/todos.ts, que los carga en su
// orden), luego el núcleo (nucleo/indice.ts, lo que antes era core.js) y después el contenido que lo amplía
// (contenido/lex.ts, antes lex.js: no exporta nada, solo añade palabras y sonidos al núcleo).
import * as dibujos from './dibujos/todos.ts';
import * as nucleo from './nucleo/indice.ts';
import './contenido/lex.ts';

// puente(m): deja cada cosa que exporta el módulo m en globalThis con su mismo nombre, para el código global.
// Es una propiedad con get que lee siempre el valor actual del módulo: así S, ctx, T, scene, go... están al día aunque
// el módulo los cambie (con ponS, ponCtx, ponT, go, ponGo...). El set da error: el código global no puede reasignar
// lo de un módulo (para eso están las funciones pon*). Y como no es configurable, si un archivo global declarara
// otra global con el mismo nombre (const, let, function), el navegador daría error al cargar en vez de tener dos.
// Los tipos de lo que pasa por aquí, para `npm run tipos:js`, están en src/tipos/puente.d.ts.
function puente(m: Readonly<Record<string, unknown>>): void {
  for (const nombre of Object.keys(m)) {
    Object.defineProperty(globalThis, nombre, {
      get: () => m[nombre],
      set: () => {
        throw new TypeError(`${nombre} es de un módulo: el código global no puede cambiarlo (usa su función pon*)`);
      },
      enumerable: true,
      configurable: false,
    });
  }
}
puente(dibujos);
puente(nucleo);
