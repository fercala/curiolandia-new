// Pruebas de las reglas del tren de Curiolandia (src/dominio/tren.ts, fase P28 de docs/IDEAS-MEJORA.md): cuántos túneles
// según la edad, que no pisan las paradas ni los animales, contar los túneles pasados, llegar a las paradas y los
// números para elegir. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { PARADAS, TREN, opcionesCerca, paradaEn, planTren, tunelEn, tunelesPasados } from '../../src/dominio/tren.ts';

// azarDe(semilla): un azar de prueba que siempre da la misma serie para la misma semilla.
const azarDe = (semilla: number) => {
  let s = semilla;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

describe('el tren de Curiolandia', () => {
  test('los túneles crecen con la edad, van en orden y no pisan las paradas ni los animales', () => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((s) => {
      [3, 4, 5].forEach((edad) => {
        const p = planTren(edad, azarDe(s));
        expect(p.tuneles).toHaveLength(TREN.tuneles[edad]!);
        expect([...p.tuneles].sort((a, b) => a - b)).toEqual(p.tuneles);
        const ocupados = [...PARADAS.map((x) => x.u), ...p.animales.map((a) => a.u)];
        p.tuneles.forEach((t) =>
          ocupados.forEach((u) => expect(u < t - 0.02 || u > t + TREN.largoTunel + 0.02).toBe(true)),
        );
      });
    });
  });

  test('tres animales distintos junto a la vía y la respuesta entre los números', () => {
    [1, 2, 3, 4, 5, 6].forEach((s) => {
      const p = planTren(4, azarDe(s));
      expect(new Set(p.animales.map((a) => a.animal)).size).toBe(3);
      expect(p.opciones).toContain(p.tuneles.length);
      expect(p.opciones).toHaveLength(3);
    });
  });

  test('dentro y fuera de un túnel, y los túneles que ya se han pasado', () => {
    const t = [0.1, 0.4];
    expect(tunelEn(0.05, t)).toBe(-1);
    expect(tunelEn(0.11, t)).toBe(0);
    expect(tunelEn(0.41, t)).toBe(1);
    expect(tunelesPasados(0.11, t)).toBe(0);
    expect(tunelesPasados(0.2, t)).toBe(1);
    expect(tunelesPasados(1, t)).toBe(2);
  });

  test('se llega a cada parada una sola vez', () => {
    expect(paradaEn(0.2, 0.26, [])?.id).toBe('bosque');
    expect(paradaEn(0.2, 0.26, ['bosque'])).toBeNull();
    expect(paradaEn(0.26, 0.3, [])).toBeNull();
    expect(paradaEn(0.49, 0.51, ['bosque'])?.pasajero).toBe('polly');
  });

  test('los números para elegir: en orden, distintos y de 1 a 6', () => {
    [2, 3, 4].forEach((r) =>
      [1, 2, 3].forEach((s) => {
        const o = opcionesCerca(r, azarDe(s));
        expect(new Set(o).size).toBe(3);
        expect([...o].sort((a, b) => a - b)).toEqual(o);
        o.forEach((x) => expect(x >= 1 && x <= 6).toBe(true));
      }),
    );
  });
});
