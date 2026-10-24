// Entrada de los módulos del juego (fase 2 de docs/PLAN-MIGRACION.md). El juego se va pasando de un único <script>
// global a módulos TypeScript archivo a archivo, en el orden de ARCHIVOS (herramientas/vite/curiolandia.mts). Mientras
// tanto conviven las dos partes: el plugin de Vite monta estos módulos en un <script> que va ANTES del código global, y
// este archivo deja en globalThis lo que el código global todavía usa de ellos (el «puente»). Cuando todo sea módulo,
// el puente desaparece.
// Los import se evalúan en el orden en que están escritos: es el mismo de antes (los dibujos de cada archivo se añaden
// a PICS y, si se repite una clave, gana el último).
import { GLASSES_SVG, HAND_SVG, K, LUPI_SVG, PICS } from './dibujos/pics-base.ts';
import { CONEJO_SVG, ERIZO_SVG, TITO_SVG, TORTUGA_SVG } from './dibujos/pics-new.ts';
import './dibujos/pics-a.ts';
import './dibujos/pics-b.ts';
import './dibujos/pics-c.ts';
import './dibujos/pics-d.ts';
import './dibujos/pics-e.ts';
import './dibujos/pics-mine.ts';

// Puente: lo de los módulos que usa el código global (core.js y los siguientes). Son constantes (PICS es siempre el
// mismo objeto), así que basta con copiarlas. Sus tipos para `npm run tipos:js` están en src/tipos/globales.d.ts.
Object.assign(globalThis, { K, PICS, LUPI_SVG, GLASSES_SVG, HAND_SVG, TITO_SVG, ERIZO_SVG, TORTUGA_SVG, CONEJO_SVG });
