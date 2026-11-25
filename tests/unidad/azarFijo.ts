// azarFijo(semilla): un azar que siempre da la misma serie (mulberry32), para las pruebas de las reglas que barajan.
/* eslint-disable ts-patterns/no-magic-numbers -- las constantes del generador mulberry32. */
export function azarFijo(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
