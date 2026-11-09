/*
 * dominio/crecer.ts: la regla común de «crecer por días» (base B4 de docs/IDEAS-MEJORA.md, fase P8). Un ser vivo (una
 * mascota de la casa, la flor del huerto, el manzano de la granja y, más adelante, las crías) crece con los días en
 * que se le cuida: cada día cuenta una sola vez (aunque se le cuide varias veces), los días no tienen que ser seguidos
 * y su etapa sale de cuántos días lleva comparados con una tabla de umbrales (los días que pide cada etapa).
 * Lo usan dominio/casa.ts (etapaMascota, regar y etapaFlor) y la granja (escenas/granjaManzano.ts, con S.crece).
 * Pruebas: tests/unidad/crecer.test.ts.
 * Exporta: el tipo Crecimiento, crecimientoDe, contarDia, etapaPorDias y creceAl.
 * No importa nada.
 */

/** Lo que se guarda de un ser vivo que crece: los días que se le ha cuidado y el último día que contó ('' si nunca). */
export interface Crecimiento {
  readonly dias: number;
  readonly dia: string;
}

// crecimientoDe(r, id): lo guardado del ser vivo id en r (S.crece) si tiene la forma buena; si no (partidas de antes o
// algo roto), sin días.
export function crecimientoDe(r: unknown, id: string): Crecimiento {
  const c = (r && typeof r === 'object' ? (r as Record<string, unknown>)[id] : undefined) as
    Partial<Crecimiento> | undefined;
  if (!c || typeof c !== 'object') return { dias: 0, dia: '' };
  return {
    dias: typeof c.dias === 'number' && c.dias > 0 ? Math.floor(c.dias) : 0,
    dia: typeof c.dia === 'string' ? c.dia : '',
  };
}

// contarDia(c, hoy): el crecimiento tras cuidarlo hoy. Cuenta una vez al día; otra vez el mismo día no suma. Devuelve
// el crecimiento nuevo y si el día ha contado. No cambia c.
export function contarDia(c: Crecimiento, hoy: string): { crecimiento: Crecimiento; cuenta: boolean } {
  if (c.dia === hoy) return { crecimiento: { ...c }, cuenta: false };
  return { crecimiento: { dias: c.dias + 1, dia: hoy }, cuenta: true };
}

// etapaPorDias(dias, umbrales): la etapa con esos días: cuántos umbrales (días que pide cada etapa, de menor a mayor)
// se han alcanzado. 0 es la primera etapa.
export function etapaPorDias(dias: number, umbrales: readonly number[]): number {
  return umbrales.filter((n) => dias >= n).length;
}

// creceAl(antes, despues, umbrales): ¿se cambia de etapa al pasar de antes a despues días?
export function creceAl(antes: number, despues: number, umbrales: readonly number[]): boolean {
  return etapaPorDias(despues, umbrales) > etapaPorDias(antes, umbrales);
}
