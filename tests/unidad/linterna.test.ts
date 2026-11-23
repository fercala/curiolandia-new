// Pruebas de las reglas de la linterna de noche (src/dominio/linterna.ts, fase P29 de docs/IDEAS-MEJORA.md): cuántos
// animales según la edad, en escondites distintos, el brillo de los ojos, la luz y las estrellas fugaces. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { ANIMALES_NOCHE, LINTERNA, enLaLuz, hayFugaz, planLinterna } from '../../src/dominio/linterna.ts';

// azarDe(semilla): un azar de prueba que siempre da la misma serie para la misma semilla.
const azarDe = (semilla: number) => {
  let s = semilla;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

describe('la linterna de noche', () => {
  test('3, 4 o 5 animales distintos, en escondites distintos, y el brillo de los ojos según la edad', () => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((s) =>
      [3, 4, 5].forEach((edad) => {
        const p = planLinterna(edad, azarDe(s));
        expect(p.animales).toHaveLength(LINTERNA.animales[edad]!);
        expect(new Set(p.animales.map((a) => a.id)).size).toBe(p.animales.length);
        expect(new Set(p.animales.map((a) => a.sitio)).size).toBe(p.animales.length);
        p.animales.forEach((a) => {
          expect(ANIMALES_NOCHE.some((x) => x.id === a.id)).toBe(true);
          expect(a.sitio >= 0 && a.sitio < LINTERNA.escondites).toBe(true);
        });
      }),
    );
    expect(planLinterna(3, azarDe(1)).brillo).toBe('mucho');
    expect(planLinterna(5, azarDe(1)).brillo).toBe('nada');
  });

  test('la luz alumbra lo que está cerca de su centro', () => {
    expect(enLaLuz({ x: 500, y: 400 }, { x: 520, y: 420 })).toBe(true);
    expect(enLaLuz({ x: 500, y: 400 }, { x: 800, y: 400 })).toBe(false);
  });

  test('las estrellas fugaces pasan de vez en cuando', () => {
    expect(hayFugaz(2)).toBeNull();
    expect(hayFugaz(5)).toBe(0);
    expect(hayFugaz(6.1)).toBeCloseTo(0.5);
    expect(hayFugaz(5 + LINTERNA.fugazDura + 1)).toBeNull();
    expect(hayFugaz(5 + LINTERNA.fugazCada)).toBe(0);
  });
});
