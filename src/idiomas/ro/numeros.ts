/*
 * idiomas/ro/numeros.ts: los números en rumano (fase ID2 de docs/PLAN-IDIOMAS.md). NUM_RO es la forma de contar (unu,
 * doi, trei...), la que sustituye a NUM de juegos/comps.ts cuando se juega en rumano. cantidadRo(n, femenino) es el
 * número delante de un nombre, que cambia con el género (un câine, o pisică; doi câini, două pisici) y desde el 20 lleva
 * «de» (douăzeci de mere).
 * Exporta: NUM_RO y cantidadRo. No importa nada.
 */

/** Los números del 0 al 20 en rumano, para contar. */
export const NUM_RO: readonly string[] = [
  'zero',
  'unu',
  'doi',
  'trei',
  'patru',
  'cinci',
  'șase',
  'șapte',
  'opt',
  'nouă',
  'zece',
  'unsprezece',
  'doisprezece',
  'treisprezece',
  'paisprezece',
  'cincisprezece',
  'șaisprezece',
  'șaptesprezece',
  'optsprezece',
  'nouăsprezece',
  'douăzeci',
];

// Desde este número, entre el número y el nombre va «de» (douăzeci de mere).
const CON_DE = 20;

// cantidadRo(n, fem): el número n delante de un nombre en rumano, en femenino si fem (también los neutros en plural):
// 1 un/o, 2 doi/două, 12 doisprezece/douăsprezece; desde el 20, con «de» detrás. Más allá de la tabla, en cifras.
export function cantidadRo(n: number, fem: boolean): string {
  const formas: Readonly<Record<number, readonly [string, string]>> = {
    1: ['un', 'o'],
    2: ['doi', 'două'],
    12: ['doisprezece', 'douăsprezece'],
  };
  const f = formas[n];
  const palabra = f ? f[fem ? 1 : 0] : (NUM_RO[n] ?? String(n));
  return n >= CON_DE ? palabra + ' de' : palabra;
}
