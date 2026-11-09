/*
 * dominio/titoDice.ts: las reglas de «Tito dice» (idea 12 de docs/IDEAS-MEJORA.md, fase P2): cuántas órdenes tiene una
 * partida según la edad, cuántas son trampa (sin «Tito dice» delante) y dónde caen. Con 3 años, 6 órdenes y ninguna
 * trampa; con 4, 8 órdenes y 2 trampas; con 5, 8 y 3. Las trampas nunca son las dos primeras órdenes ni van seguidas.
 * Es DOMINIO: no sabe nada de pantalla ni de S; la escena (escenas/titoDice.ts) le pasa cuántas órdenes tiene, la edad
 * y el azar, y dibuja lo que devuelve. Pruebas: tests/unidad/titoDice.test.ts.
 * Exporta: el tipo PasoTitoDice, TITO_DICE (los números de las reglas) y planTitoDice.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de TITO_DICE son las reglas mismas, cada uno con su
   nombre. */

/** Una orden del plan de una partida: cuál es (su posición en la lista de órdenes de la escena) y si es trampa. */
export interface PasoTitoDice {
  readonly orden: number;
  readonly trampa: boolean;
}

// TITO_DICE: los números de las reglas, por edad (3, 4 y 5 años).
export const TITO_DICE = {
  /** Órdenes por partida. */
  ordenes: { 3: 6, 4: 8, 5: 8 } as Readonly<Record<number, number>>,
  /** Trampas por partida (órdenes sin «Tito dice»). */
  trampas: { 3: 0, 4: 2, 5: 3 } as Readonly<Record<number, number>>,
  /** Las órdenes antes de esta posición nunca son trampa (así se aprende primero el juego). */
  primeraTrampa: 2,
} as const;

// planTitoDice(total, edad, r): el plan de una partida para esa edad con una lista de total órdenes: cuáles salen
// (barajadas, sin repetir) y cuáles son trampa (desde la tercera, nunca dos seguidas). La edad se ajusta entre 3 y 5.
// r() da números al azar entre 0 y 1 (el puerto azar en el juego; uno fijo en las pruebas).
export function planTitoDice(total: number, edad: number, r: () => number): PasoTitoDice[] {
  const e = Math.min(5, Math.max(3, Math.round(edad))),
    n = Math.min(total, TITO_DICE.ordenes[e] ?? 8),
    nTrampas = TITO_DICE.trampas[e] ?? 0;
  // las órdenes, barajadas, sin repetir
  const ordenes = Array.from({ length: total }, (_, i) => ({ i, k: r() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((x) => x.i);
  // dónde caen las trampas, sin que queden dos juntas: se eligen k números distintos al azar entre 0 y m - k (m, los
  // huecos desde primeraTrampa), se ordenan y a cada uno se le suma su puesto: así entre dos siempre queda uno libre.
  const m = Math.max(0, n - TITO_DICE.primeraTrampa),
    k = Math.min(nTrampas, Math.ceil(m / 2)),
    trampas = Array.from({ length: Math.max(0, m - k + 1) }, (_, i) => ({ i, q: r() }))
      .sort((a, b) => a.q - b.q)
      .slice(0, k)
      .map((x) => x.i)
      .sort((a, b) => a - b)
      .map((c, j) => c + j + TITO_DICE.primeraTrampa);
  return ordenes.map((orden, i) => ({ orden, trampa: trampas.includes(i) }));
}
