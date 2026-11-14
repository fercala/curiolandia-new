/*
 * idiomas/ro/textos.ts: los textos del juego en rumano (docs/PLAN-IDIOMAS.md). Va del texto en castellano, tal como está
 * en el código y en dialogos/todos.csv, a su traducción: { '¿Cómo te llamas?': 'Cum te cheamă?' }.
 * Desde la fase ID4 junta las tablas de cada parte del juego (adultos.ts: la zona de adultos, head.html y el núcleo; escenas.ts, desde la ID4b: la portada, el mapa, la asamblea,
 * la tienda, el cofre, el repaso, las islas y los nombres de los temas; casa.ts, desde la ID4c: la casa de Tito; cole.ts, desde la ID4d: el cole, el patio, las excursiones y el deporte; juegos.ts, desde la ID5a: los juegos comunes; temas3.ts, desde la ID5b: los temas de 3 años y los especiales; temas4.ts, desde la ID5c: los de 4 años; temas5.ts, desde la ID5d: los de 5 años; cuentos.ts y cielo.ts, desde la ID5e: los cuentos y el paisaje 3D; letras.ts, desde la ID6a: la Isla de las Letras); lo
 * que aún no está sale en castellano y nucleo/traducir.ts lo apunta en sinTraducir. El rumano se escribe sin ¡ ni ¿ y
 * tuteando al niño, con frases cortas.
 * Desde la ID4d, también los números en rumano (NUM_RO) como ya traducidos: las cuentas («unu, doi, trei...») se dicen
 * con NUM, que ya está en rumano, y say() no debe apuntarlas como sin traducir.
 * Exporta: TEXTOS_RO. Importa las tablas de cada parte (adultos.ts, escenas.ts, casa.ts, cole.ts, juegos.ts, temas3.ts, temas4.ts, temas5.ts, cuentos.ts, cielo.ts, letras.ts) y NUM_RO (numeros.ts).
 */
import { ADULTOS_RO } from './adultos.ts';
import { ESCENAS_RO } from './escenas.ts';
import { CASA_RO } from './casa.ts';
import { COLE_RO } from './cole.ts';
import { JUEGOS_RO } from './juegos.ts';
import { TEMAS3_RO } from './temas3.ts';
import { TEMAS4_RO } from './temas4.ts';
import { TEMAS5_RO } from './temas5.ts';
import { CUENTOS_RO } from './cuentos.ts';
import { CIELO_RO } from './cielo.ts';
import { LETRAS_TEXTOS_RO } from './letras.ts';
import { NUM_RO } from './numeros.ts';

// NUMEROS: cada número en rumano, a sí mismo (ya está traducido).
// Desde la ID5b, también con mayúscula («Unu», al contar en voz alta con cap).
const NUMEROS: Readonly<Record<string, string>> = Object.fromEntries(
  NUM_RO.flatMap((n) => {
    const c = n.charAt(0).toUpperCase() + n.slice(1);
    return [
      [n, n],
      [c, c],
    ];
  }),
);

/** Del texto en castellano a su traducción al rumano. */
export const TEXTOS_RO: Readonly<Record<string, string>> = {
  ...NUMEROS,
  ...ADULTOS_RO,
  ...ESCENAS_RO,
  ...CASA_RO,
  ...COLE_RO,
  ...JUEGOS_RO,
  ...TEMAS3_RO,
  ...TEMAS4_RO,
  ...TEMAS5_RO,
  ...CUENTOS_RO,
  ...CIELO_RO,
  ...LETRAS_TEXTOS_RO,
};
