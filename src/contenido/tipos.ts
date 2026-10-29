// contenido/tipos.ts: los tipos de los cuentos de contenido/cuentos.ts (fase 2g). Story (juegos/comps2.ts) los lee.
// Los textos están en castellano de España.

/** Un dibujo de una página: [clave de PICS o 'emo:…', x, y, tamaño, volteado]. x,y = centro en la pantalla de 1600x900. */
export type DibujoCuento = readonly [clave: string, x: number, y: number, s: number, volteado?: boolean];

/** Una página: el fondo (nombre de BG), sus dibujos y lo que lee Tito. */
export interface PaginaCuento {
  readonly bg: string;
  readonly items: readonly DibujoCuento[];
  readonly say: string;
}

/** Una pregunta del final: ok es la clave de PICS correcta y opts todas las opciones (se barajan). */
export interface PreguntaCuento {
  readonly q: string;
  readonly ok: string;
  readonly opts: readonly string[];
  readonly okSay?: string;
}

/** Un cuento: título, páginas y preguntas. */
export interface Cuento {
  readonly title: string;
  readonly pages: readonly PaginaCuento[];
  readonly qs: readonly PreguntaCuento[];
}
