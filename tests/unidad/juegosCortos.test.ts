// Pruebas de las reglas de los juegos cortos del patio (src/dominio/juegosCortos.ts, fase P12 de docs/IDEAS-MEJORA.md):
// la lista de juegos, las casillas y el plan de la rayuela y el momento bueno del columpio. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  JUEGOS_CORTOS,
  RAYUELA,
  casillasRayuela,
  empujonBueno,
  juegoCorto,
  planRayuela,
} from '../../src/dominio/juegosCortos.ts';

// azarFijo(valores): un azar de prueba que va dando esos valores, en bucle.
const azarFijo = (valores: readonly number[]) => {
  let i = 0;
  return () => valores[i++ % valores.length] ?? 0;
};

describe('los juegos cortos del patio', () => {
  test('son siete con ids distintos; la rayuela y los columpios ya tienen escena', () => {
    const ids = JUEGOS_CORTOS.map((j) => j.id);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
    expect(juegoCorto('rayuela')?.escena).toBe('rayuela');
    expect(juegoCorto('columpios')?.escena).toBe('columpios');
    expect(juegoCorto('penaltis')?.escena).toBeUndefined();
    expect(juegoCorto('nada')).toBeUndefined();
  });

  test('la rayuela tiene sus casillas como en la tiza: sueltas y por parejas, hasta el número de cada edad', () => {
    const diez = casillasRayuela(5);
    expect(diez.map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(diez.find((c) => c.n === 4)).toEqual({ n: 4, col: 3, fila: 'abajo' });
    expect(diez.find((c) => c.n === 5)).toEqual({ n: 5, col: 3, fila: 'arriba' });
    expect(diez.find((c) => c.n === 10)).toEqual({ n: 10, col: 7, fila: 'sola' });
    expect(casillasRayuela(3).map((c) => c.n)).toEqual([1, 2, 3, 4, 5]);
    expect(casillasRayuela(4)).toHaveLength(8);
    expect(casillasRayuela(9)).toHaveLength(10);
  });

  test('el plan de la rayuela: números distintos de su rayuela, empezando por uno fácil', () => {
    [3, 4, 5].forEach((edad) =>
      [0, 0.3, 0.7, 0.99].forEach((a) => {
        const plan = planRayuela(edad, azarFijo([a, 0.5, 0.1, 0.9, 0.2]));
        expect(plan).toHaveLength(RAYUELA.rondas);
        expect(new Set(plan).size).toBe(plan.length);
        expect(plan[0]).toBeGreaterThanOrEqual(1);
        expect(plan[0]).toBeLessThanOrEqual(3);
        plan.forEach((n) => expect(n).toBeLessThanOrEqual(RAYUELA.hasta[edad] ?? 10));
      }),
    );
  });

  test('el columpio se empuja cuando está atrás del todo; con 3 años hay más margen', () => {
    expect(empujonBueno(0.25, 5)).toBe(true);
    expect(empujonBueno(0.35, 5)).toBe(true);
    expect(empujonBueno(0.37, 5)).toBe(false);
    expect(empujonBueno(0.4, 3)).toBe(true);
    expect(empujonBueno(0.75, 3)).toBe(false);
    expect(empujonBueno(1.25, 4)).toBe(true);
    expect(empujonBueno(-0.75, 4)).toBe(true);
  });
});
