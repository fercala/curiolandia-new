/*
 * dominio/encargos.ts: las reglas de los encargos de los vecinos (idea 34 de docs/IDEAS-MEJORA.md, en la PR de todas
 * las ideas pendientes, v0.2.180). Cada día un vecino de la isla (el cartero, el panadero, la granjera, la maestra o la
 * frutera) da a Tito algo que hay que llevar a un sitio: al llegar a ese sitio, el encargo está hecho (3 monedas, una
 * vez al día). El encargo del día sale de la fecha (el mismo todo el día).
 * Lo guardado va en S.encargos ({ d, dicho, hecho, veces }): opcional, sin migración.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/encargos.test.ts.
 * Exporta: el tipo Encargo y EstadoEncargos, ENCARGOS, ENCARGO_MONEDAS, encargoDeHoy, estadoEncargos, decirEncargo y
 * llegarA.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las monedas del encargo, en una constante con nombre. */

/** Un encargo: quién lo pide (su dibujo), lo que hay que llevar (su dibujo), adónde (la escena) y lo que dice Tito al
 * recibirlo y al entregarlo. */
export interface Encargo {
  readonly id: string;
  readonly quien: string;
  readonly cosa: string;
  readonly destino: string;
  readonly pide: string;
  readonly hecho: string;
}
// ENCARGOS: los encargos de los vecinos.
export const ENCARGOS: readonly Encargo[] = [
  {
    id: 'carta',
    quien: 'cartero',
    cosa: 'carta',
    destino: 'cole',
    pide: 'El cartero nos ha dado una carta para el cole. ¿La llevamos? Toca el cole en el mapa.',
    hecho: '¡Ya hemos dejado la carta en el cole! Gracias por ayudar al cartero.',
  },
  {
    id: 'pan',
    quien: 'panadero',
    cosa: 'pan',
    destino: 'casaTito',
    pide: 'El panadero nos ha dado pan para la merienda. ¿Lo llevamos a mi casa?',
    hecho: '¡Ya tenemos el pan en casa! Gracias por ayudar al panadero.',
  },
  {
    id: 'zanahorias',
    quien: 'granjera',
    cosa: 'zanahoria',
    destino: 'tienda',
    pide: 'La granjera quiere vender zanahorias en la tienda. ¿Se las llevamos?',
    hecho: '¡Las zanahorias ya están en la tienda! Gracias por ayudar a la granjera.',
  },
  {
    id: 'libro',
    quien: 'maestra',
    cosa: 'libro',
    destino: 'clases',
    pide: 'La maestra se ha dejado un libro. ¿Se lo llevamos a las clases del cole?',
    hecho: '¡La maestra ya tiene su libro! Gracias por ayudarla.',
  },
  {
    id: 'fresas',
    quien: 'frutera',
    cosa: 'fresa',
    destino: 'casaTito',
    pide: 'La frutera nos ha regalado fresas. ¿Las llevamos a mi casa?',
    hecho: '¡Qué ricas las fresas en casa! Gracias por ayudar a la frutera.',
  },
];
// ENCARGO_MONEDAS: las monedas por hacer el encargo del día.
export const ENCARGO_MONEDAS = 3;

/** Lo guardado: el día, si Tito ya ha dicho el encargo, si está hecho y cuántos se han hecho en total. */
export interface EstadoEncargos {
  readonly d: string;
  readonly dicho: boolean;
  readonly hecho: boolean;
  readonly veces: number;
}

// encargoDeHoy(hoy): el encargo del día (sale de la fecha).
export function encargoDeHoy(hoy: string): Encargo {
  const n = [...hoy].reduce((s, ch) => (s * 17 + ch.charCodeAt(0)) % 7919, 3);
  return ENCARGOS[n % ENCARGOS.length]!;
}
// estadoEncargos(x, hoy): lo guardado (S.encargos), con el día de hoy (si era otro día, sin decir ni hacer).
export function estadoEncargos(x: unknown, hoy: string): EstadoEncargos {
  const e = (x && typeof x === 'object' ? x : {}) as Partial<EstadoEncargos>,
    veces = typeof e.veces === 'number' && e.veces > 0 ? Math.floor(e.veces) : 0;
  return e.d === hoy
    ? { d: hoy, dicho: !!e.dicho, hecho: !!e.hecho, veces }
    : { d: hoy, dicho: false, hecho: false, veces };
}
// decirEncargo(e): el estado tras decir el encargo (si aún no se había dicho ni hecho); null si no hay que decirlo.
export const decirEncargo = (e: EstadoEncargos): EstadoEncargos | null =>
  e.dicho || e.hecho ? null : { ...e, dicho: true };
// llegarA(e, escena, hoy): al entrar en la escena: si es el destino del encargo dicho y aún no hecho, está hecho:
// devuelve el estado nuevo y las monedas; si no, null.
export function llegarA(
  e: EstadoEncargos,
  escena: string,
  hoy: string,
): { estado: EstadoEncargos; monedas: number } | null {
  if (!e.dicho || e.hecho || encargoDeHoy(hoy).destino !== escena) return null;
  return { estado: { ...e, hecho: true, veces: e.veces + 1 }, monedas: ENCARGO_MONEDAS };
}
