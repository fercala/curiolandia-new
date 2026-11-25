/*
 * dominio/misiones.ts: las reglas de las misiones del día y la semana temática (idea 36 de docs/IDEAS-MEJORA.md, en la
 * PR de todas las ideas pendientes, v0.2.180). Cada día hay tres misiones cortas (la primera, siempre terminar un juego
 * de una casita; las otras dos salen de la fecha) que se cumplen solas con lo que se apunta en el diario de Tito
 * (dominio/diario.ts, las mismas claves). Al cumplir las tres, 5 monedas una vez al día; los viernes, además, la
 * pegatina de la semana. Cada semana tiene un tema (el mar, los bichos, la granja, el espacio) que sale en las misiones.
 * Lo guardado va en S.misiones ({ d, premio }): opcional, sin migración.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/misiones.test.ts.
 * Exporta: MISIONES, SEMANAS, MISIONES_MONEDAS, misionesDeHoy, semanaDe, esViernes, cumplidas y premioMisiones.
 * Importa: el tipo ClaveDiario y RegistroDiario (dominio/diario.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- cuántas misiones, las monedas y los días de la semana: las reglas
   mismas, en constantes con nombre. */
import type { ClaveDiario, RegistroDiario } from './diario.ts';

// MISIONES: las misiones que pueden salir: su clave del diario, su dibujo y su frase.
export const MISIONES: readonly { clave: ClaveDiario; dibujo: string; frase: string }[] = [
  { clave: 'casita', dibujo: 'estrella', frase: 'Termina un juego en una casita.' },
  { clave: 'patio', dibujo: 'pelota', frase: 'Juega en el patio del cole.' },
  { clave: 'logica', dibujo: 'lupa', frase: 'Resuelve un juego del rincón de la lógica.' },
  { clave: 'ciencias', dibujo: 'bombilla', frase: 'Haz un experimento en el taller de ciencias.' },
  { clave: 'arte', dibujo: 'pinturas', frase: 'Pinta o haz música en el estudio de arte.' },
  { clave: 'cuento', dibujo: 'libro', frase: 'Lee un cuento y elige qué pasa.' },
  { clave: 'excursion', dibujo: 'autobus', frase: 'Ve de excursión en el autobús del cole.' },
];
// SEMANAS: los temas de las semanas, por turno: su dibujo (la pegatina del viernes) y lo que dice Tito.
export const SEMANAS: readonly { id: string; dibujo: string; frase: string }[] = [
  { id: 'mar', dibujo: 'pez', frase: 'Esta semana es la semana del mar.' },
  { id: 'bichos', dibujo: 'mariposa', frase: 'Esta semana es la semana de los bichos.' },
  { id: 'granja', dibujo: 'vaca', frase: 'Esta semana es la semana de la granja.' },
  { id: 'espacio', dibujo: 'cohete', frase: 'Esta semana es la semana del espacio.' },
];
// MISIONES_MONEDAS: las monedas por cumplir las tres misiones del día.
export const MISIONES_MONEDAS = 5;
// DIA_MS: lo que dura un día, en milisegundos.
const DIA_MS = 86_400_000;

// diaDe(hoy): el número de días desde el 1 de enero de 1970 de la fecha 'AAAA-MM-DD'.
function diaDe(hoy: string): number {
  const [a, m, d] = hoy.split('-').map(Number);
  return Math.floor(Date.UTC(a!, (m ?? 1) - 1, d ?? 1) / DIA_MS);
}

// misionesDeHoy(hoy): las tres misiones del día: la de la casita y dos más, distintas, que salen de la fecha.
export function misionesDeHoy(hoy: string): (typeof MISIONES)[number][] {
  const resto = MISIONES.slice(1),
    d = diaDe(hoy),
    a = d % resto.length,
    b = (a + 1 + (Math.floor(d / resto.length) % (resto.length - 1))) % resto.length;
  return [MISIONES[0]!, resto[a]!, resto[b]!];
}
// semanaDe(hoy): el tema de la semana de esa fecha (cambia cada lunes).
export const semanaDe = (hoy: string): (typeof SEMANAS)[number] =>
  SEMANAS[Math.floor((diaDe(hoy) + 3) / 7) % SEMANAS.length]!;
// esViernes(hoy): ¿es viernes?
export const esViernes = (hoy: string): boolean => (diaDe(hoy) + 4) % 7 === 5;
// cumplidas(reg, hoy): cuáles de las misiones de hoy están cumplidas (en su orden).
export const cumplidas = (reg: RegistroDiario, hoy: string): boolean[] =>
  misionesDeHoy(hoy).map((m) => (reg[hoy] ?? []).includes(m.clave));
// premioMisiones(guardado, reg, hoy): si hoy ya se han cumplido las tres y aún no se ha dado el premio: las monedas y
// la pegatina (los viernes, la de la semana; si no, ''); si no, null.
export function premioMisiones(
  guardado: unknown,
  reg: RegistroDiario,
  hoy: string,
): { monedas: number; pegatina: string } | null {
  const g = (guardado && typeof guardado === 'object' ? guardado : {}) as { d?: string; premio?: boolean };
  if ((g.d === hoy && g.premio) || !cumplidas(reg, hoy).every(Boolean)) return null;
  return { monedas: MISIONES_MONEDAS, pegatina: esViernes(hoy) ? semanaDe(hoy).dibujo : '' };
}
