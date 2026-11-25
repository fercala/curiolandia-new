/*
 * idiomas/ro/textos.ts: los textos del juego en rumano (docs/PLAN-IDIOMAS.md). Va del texto en castellano, tal como está
 * en el código y en dialogos/todos.csv, a su traducción: { '¿Cómo te llamas?': 'Cum te cheamă?' }.
 * Desde la fase ID4 junta las tablas de cada parte del juego (adultos.ts: la zona de adultos, head.html y el núcleo; escenas.ts, desde la ID4b: la portada, el mapa, la asamblea,
 * la tienda, el cofre, el repaso, las islas y los nombres de los temas; casa.ts, desde la ID4c: la casa de Tito; cole.ts, desde la ID4d: el cole, el patio, las excursiones y el deporte; juegos.ts, desde la ID5a: los juegos comunes; temas3.ts, desde la ID5b: los temas de 3 años y los especiales; temas4.ts, desde la ID5c: los de 4 años; temas5.ts, desde la ID5d: los de 5 años; cuentos.ts y cielo.ts, desde la ID5e: los cuentos y el paisaje 3D; letras.ts, desde la ID6a: la Isla de las Letras; ingles.ts, desde la ID7: la Isla del Inglés; paseo.ts, desde la v0.2.157: la gran aventura de Tito; zoo.ts, desde la v0.2.161: la excursión al zoo; clases.ts, desde la v0.2.173: las clases del cole y el rincón de las construcciones; tren.ts, desde la v0.2.174: el tren de Curiolandia; linterna.ts, desde la v0.2.175: la linterna de noche; amigos.ts, desde la v0.2.177: los amigos de Tito en el mapa; programa.ts, desde la v0.2.178: «Programa a Tito»; cuentosDecisiones.ts, desde la v0.2.179: los cuentos con decisiones; ideas.ts, desde la v0.2.181: todas las ideas pendientes); lo
 * que aún no está sale en castellano y nucleo/traducir.ts lo apunta en sinTraducir. El rumano se escribe sin ¡ ni ¿ y
 * tuteando al niño, con frases cortas.
 * Desde la ID4d, también los números en rumano (NUM_RO) como ya traducidos: las cuentas («unu, doi, trei...») se dicen
 * con NUM, que ya está en rumano, y say() no debe apuntarlas como sin traducir.
 * Exporta: TEXTOS_RO. Importa las tablas de cada parte (adultos.ts, escenas.ts, casa.ts, cole.ts, juegos.ts, temas3.ts, temas4.ts, temas5.ts, cuentos.ts, cielo.ts, letras.ts, ingles.ts, paseo.ts, zoo.ts, clases.ts, tren.ts, linterna.ts, amigos.ts, programa.ts, cuentosDecisiones.ts, ideas.ts) y NUM_RO (numeros.ts).
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
import { INGLES_RO } from './ingles.ts';
import { PASEO_RO } from './paseo.ts';
import { ZOO_RO } from './zoo.ts';
import { CLASES_RO } from './clases.ts';
import { TREN_RO } from './tren.ts';
import { LINTERNA_RO } from './linterna.ts';
import { AMIGOS_RO } from './amigos.ts';
import { PROGRAMA_RO } from './programa.ts';
import { CUENTOS_DEC_RO } from './cuentosDecisiones.ts';
import { IDEAS_RO } from './ideas.ts';
import { ACTIVIDADES_EXTRAS_RO } from './actividadesExtras.ts';
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
  ...INGLES_RO,
  ...PASEO_RO,
  ...ZOO_RO,
  ...CLASES_RO,
  ...TREN_RO,
  ...LINTERNA_RO,
  ...AMIGOS_RO,
  ...PROGRAMA_RO,
  ...CUENTOS_DEC_RO,
  ...IDEAS_RO,
  ...ACTIVIDADES_EXTRAS_RO,
};
