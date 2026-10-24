// todos.ts: todos los dibujos de src/dibujos/, cargados en su orden. Cada archivo añade los suyos a PICS y, si se repite
// una clave, gana el último: por eso quien necesita PICS completo (src/modulos.ts, nucleo/imagenes.ts) importa de aquí.
// Reexporta lo que usan los demás módulos y el puente: K, PICS y los dibujos sueltos con su propio viewBox.
export { GLASSES_SVG, HAND_SVG, K, LUPI_SVG, PICS } from './pics-base.ts';
export { CONEJO_SVG, ERIZO_SVG, TITO_SVG, TORTUGA_SVG } from './pics-new.ts';
import './pics-a.ts';
import './pics-b.ts';
import './pics-c.ts';
import './pics-d.ts';
import './pics-e.ts';
import './pics-mine.ts';
