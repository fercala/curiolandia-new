/*
 * idiomas/ro/textos.ts: los textos del juego en rumano (docs/PLAN-IDIOMAS.md). Va del texto en castellano, tal como está
 * en el código y en dialogos/todos.csv, a su traducción: { '¿Cómo te llamas?': 'Cum te cheamă?' }.
 * Desde la fase ID4 junta las tablas de cada parte del juego (adultos.ts: la zona de adultos, head.html y el núcleo; escenas.ts, desde la ID4b: la portada, el mapa, la asamblea,
 * la tienda, el cofre, el repaso, las islas y los nombres de los temas; casa.ts, desde la ID4c: la casa de Tito; cole.ts, desde la ID4d: el cole, el patio, las excursiones y el deporte); lo
 * que aún no está sale en castellano y nucleo/traducir.ts lo apunta en sinTraducir. El rumano se escribe sin ¡ ni ¿ y
 * tuteando al niño, con frases cortas.
 * Desde la ID4d, también los números en rumano (NUM_RO) como ya traducidos: las cuentas («unu, doi, trei...») se dicen
 * con NUM, que ya está en rumano, y say() no debe apuntarlas como sin traducir.
 * Exporta: TEXTOS_RO. Importa las tablas de cada parte (adultos.ts, escenas.ts, casa.ts, cole.ts) y NUM_RO (numeros.ts).
 */
import { ADULTOS_RO } from './adultos.ts';
import { ESCENAS_RO } from './escenas.ts';
import { CASA_RO } from './casa.ts';
import { COLE_RO } from './cole.ts';
import { NUM_RO } from './numeros.ts';

// NUMEROS: cada número en rumano, a sí mismo (ya está traducido).
const NUMEROS: Readonly<Record<string, string>> = Object.fromEntries(NUM_RO.map((n) => [n, n]));

/** Del texto en castellano a su traducción al rumano. */
export const TEXTOS_RO: Readonly<Record<string, string>> = {
  ...NUMEROS,
  ...ADULTOS_RO,
  ...ESCENAS_RO,
  ...CASA_RO,
  ...COLE_RO,
};
