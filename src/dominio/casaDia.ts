/*
 * dominio/casaDia.ts: «Un día con Tito» (fase M6 de docs/PLAN-CASA-MEJORA.md). El momento del día según la hora de
 * verdad (mañana, tarde o noche: cómo se ve la ventana de la casa), la rutina que toca a cada hora (desayunar, jugar,
 * comer, la siesta, el baño, cenar y dormir), qué cosas de la casa la cumplen y cómo se apuntan las rutinas hechas hoy
 * (S.casaDia: {d: 'AAAA-MM-DD', hechas: [ids]}, que se vacía al cambiar el día). Es opcional y sin castigo: si una
 * rutina no se hace, no pasa nada.
 * Es DOMINIO: no dibuja ni sabe de S ni de la hora del reloj; recibe la hora (0 a 23,99) y la fecha de hoy y devuelve
 * lo nuevo, sin cambiar lo que recibe.
 * Pruebas: tests/unidad/casaDia.test.ts.
 * Exporta: los tipos Momento, Rutina y CasaDia; la tabla RUTINAS y las reglas momentoDe, rutinaDe, cumple, diaDe,
 * hechaHoy y hacerRutina.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las horas de cada rutina y de cada momento del día,
   en una tabla con nombre; sacarlos a otra constante solo repetiría el nombre. */

/** El momento del día, para cómo se ve la casa: mañana (sol), tarde (cielo naranja) o noche (luna). */
export type Momento = 'manana' | 'tarde' | 'noche';

/** Una rutina del día: su id, desde qué hora y hasta qué hora toca (desde < hasta; la de dormir da la vuelta a la
 * medianoche), las cosas de la casa con las que Tito la hace y la cosa que se dibuja en su bocadillo (icono). */
export interface Rutina {
  readonly id: string;
  readonly desde: number;
  readonly hasta: number;
  readonly cosas: readonly string[];
  readonly icono: string;
}

/** Lo guardado del día: la fecha y las rutinas hechas ese día. */
export interface CasaDia {
  readonly d: string;
  readonly hechas: readonly string[];
}

// RUTINAS: las rutinas del día, por orden de hora. La de dormir va de las 21 a las 7 (da la vuelta a la medianoche).
export const RUTINAS: readonly Rutina[] = [
  { id: 'desayuno', desde: 7, hasta: 10, cosas: ['nevera', 'mesa', 'silla'], icono: 'nevera' },
  {
    id: 'jugar',
    desde: 10,
    hasta: 13,
    cosas: [
      'pelotaPlaya',
      'bloques',
      'peluche',
      'cometa',
      'xilofono',
      'muneca',
      'robot',
      'trenJuguete',
      'guitarra',
      'tambor',
      'pizarra',
      'pinturas',
      'globo',
      'tobogan',
      'columpio',
    ],
    icono: 'pelotaPlaya',
  },
  { id: 'comida', desde: 13, hasta: 15.5, cosas: ['mesa', 'silla', 'olla'], icono: 'olla' },
  { id: 'siesta', desde: 15.5, hasta: 17, cosas: ['cama', 'sofa'], icono: 'sofa' },
  { id: 'bano', desde: 17, hasta: 19, cosas: ['banera', 'jabon', 'toalla', 'pato'], icono: 'banera' },
  { id: 'cena', desde: 19, hasta: 21, cosas: ['mesa', 'silla', 'olla', 'nevera'], icono: 'mesa' },
  { id: 'dormir', desde: 21, hasta: 7, cosas: ['cama', 'cuento', 'estrellas'], icono: 'cama' },
];

// momentoDe(hora): el momento del día a esa hora: mañana de 7 a 15, tarde de 15 a 20 y noche de 20 a 7.
export function momentoDe(hora: number): Momento {
  if (hora >= 7 && hora < 15) return 'manana';
  if (hora >= 15 && hora < 20) return 'tarde';
  return 'noche';
}

// rutinaDe(hora): la rutina que toca a esa hora (siempre hay una: de noche, dormir).
export function rutinaDe(hora: number): Rutina {
  const h = ((hora % 24) + 24) % 24;
  return (
    RUTINAS.find((r) => (r.desde < r.hasta ? h >= r.desde && h < r.hasta : h >= r.desde || h < r.hasta)) ??
    RUTINAS[RUTINAS.length - 1]
  );
}

// cumple(rutina, id): ¿jugar con la cosa id cumple la rutina?
export function cumple(rutina: Rutina, id: string): boolean {
  return rutina.cosas.includes(id);
}

// diaDe(guardado, hoy): lo del día de hoy: lo guardado si es de hoy y está bien; si no (otro día, vacío o roto), un día
// sin rutinas hechas.
export function diaDe(guardado: unknown, hoy: string): CasaDia {
  const g = guardado as Partial<CasaDia> | null | undefined;
  if (!g || g.d !== hoy || !Array.isArray(g.hechas)) return { d: hoy, hechas: [] };
  return { d: hoy, hechas: g.hechas.filter((x): x is string => typeof x === 'string') };
}

// hechaHoy(guardado, hoy, id): ¿ya se hizo hoy la rutina id?
export function hechaHoy(guardado: unknown, hoy: string, id: string): boolean {
  return diaDe(guardado, hoy).hechas.includes(id);
}

// hacerRutina(guardado, hoy, id): el día con la rutina id hecha y si es nueva (la primera vez hoy: da su pegatina).
export function hacerRutina(guardado: unknown, hoy: string, id: string): { dia: CasaDia; nueva: boolean } {
  const dia = diaDe(guardado, hoy);
  if (dia.hechas.includes(id)) return { dia, nueva: false };
  return { dia: { d: hoy, hechas: [...dia.hechas, id] }, nueva: true };
}
