/*
 * idiomas/ro/nombres.ts: los nombres de los dibujos y de las cosas en rumano (fase ID2 de docs/PLAN-IDIOMAS.md), con las
 * formas que piden las frases (Nombre, de dominio/idiomas.ts). Va del nombre en castellano con su artículo (el de LEX o
 * el name de una cosa: 'el gato', 'la cabeza') a sus formas en rumano:
 *   'el gato': { art: 'pisica', sin: 'pisică', g: 'f', pl: false, plu: 'pisici', de: 'pisicii', a: 'pisicii' }
 * Está vacía hasta la fase ID4: hasta entonces salen los nombres en castellano (nucleo/traducir.ts los apunta en
 * sinTraducir).
 * Exporta: NOMBRES_RO. Importa el tipo Nombre (dominio/idiomas.ts).
 */
import type { Nombre } from '../../dominio/idiomas.ts';

/** Del nombre en castellano con artículo a sus formas en rumano. */
export const NOMBRES_RO: Readonly<Record<string, Nombre>> = {};
