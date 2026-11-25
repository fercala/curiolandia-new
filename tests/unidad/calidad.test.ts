// Pruebas de la calidad automática del 3D (src/dominio/calidad.ts, idea 47 de docs/IDEAS-MEJORA.md).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { CALIDAD, ajustarCalidad } from '../../src/dominio/calidad.ts';

const BIEN = { prk: 1, ligeras: false, up: false, noUp: false };
describe('la calidad automática', () => {
  test('si va lento, primero baja la nitidez hasta el mínimo y después aligera las sombras', () => {
    let c = BIEN;
    for (let i = 0; i < 5; i++) c = ajustarCalidad(c, 10);
    expect(c.prk).toBe(CALIDAD.minimo);
    expect(c.ligeras).toBe(true);
    expect(ajustarCalidad(BIEN, 10)).toEqual({ ...BIEN, prk: 0.75 });
  });
  test('si va sobrado, la nitidez sube (las sombras ligeras se quedan); si vuelve a ir lento tras subir, ya no sube', () => {
    const baja = { prk: 0.75, ligeras: true, up: false, noUp: false },
      sube = ajustarCalidad(baja, 60);
    expect(sube).toEqual({ prk: 1, ligeras: true, up: true, noUp: false });
    const otraVez = ajustarCalidad(sube, 10);
    expect(otraVez.noUp).toBe(true);
    expect(ajustarCalidad(otraVez, 60).prk).toBe(0.75);
    expect(ajustarCalidad(BIEN, 40)).toBe(BIEN);
  });
});
