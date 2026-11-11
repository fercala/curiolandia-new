/*
 * idiomas/ro/textos.ts: los textos del juego en rumano (docs/PLAN-IDIOMAS.md). Va del texto en castellano, tal como está
 * en el código y en dialogos/todos.csv, a su traducción: { '¿Cómo te llamas?': 'Cum te cheamă?' }.
 * Desde la fase ID4 junta las tablas de cada parte del juego (adultos.ts: la zona de adultos, head.html y el núcleo); lo
 * que aún no está sale en castellano y nucleo/traducir.ts lo apunta en sinTraducir. El rumano se escribe sin ¡ ni ¿ y
 * tuteando al niño, con frases cortas.
 * Exporta: TEXTOS_RO. Importa las tablas de cada parte (adultos.ts).
 */
import { ADULTOS_RO } from './adultos.ts';

/** Del texto en castellano a su traducción al rumano. */
export const TEXTOS_RO: Readonly<Record<string, string>> = { ...ADULTOS_RO };
