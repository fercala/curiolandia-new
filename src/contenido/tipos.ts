// contenido/tipos.ts: los tipos de los cuentos de contenido/cuentos.ts (fase 2g). Story (juegos/comps2.ts) los lee.
// Un texto es una frase en rioplatense o un par [rioplatense, España] que V() elige (nucleo/idioma.ts).
import type { Par } from '../nucleo/idioma.ts';

/** Una frase del cuento: en rioplatense (tx() la pasa a España) o el par [rioplatense, España]. */
export type Frase = string | Par;

/** Un dibujo de una página: [clave de PICS o 'emo:…', x, y, tamaño, volteado]. x,y = centro en la pantalla de 1600x900. */
export type DibujoCuento = readonly [clave: string, x: number, y: number, s: number, volteado?: boolean];

/** Una página: el fondo (nombre de BG), sus dibujos y lo que lee Tito. */
export interface PaginaCuento {
  readonly bg: string;
  readonly items: readonly DibujoCuento[];
  readonly say: Frase;
}

/** Una pregunta del final: ok es la clave de PICS correcta y opts todas las opciones (se barajan). */
export interface PreguntaCuento {
  readonly q: Frase;
  readonly ok: string;
  readonly opts: readonly string[];
  readonly okSay?: Frase;
}

/** Un cuento: título, páginas y preguntas. */
export interface Cuento {
  readonly title: Frase;
  readonly pages: readonly PaginaCuento[];
  readonly qs: readonly PreguntaCuento[];
}
