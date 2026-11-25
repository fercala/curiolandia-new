// Pruebas de las reglas del estudio de arte (src/dominio/arte.ts, idea 31 de docs/IDEAS-MEJORA.md): el cuadro con
// simetría y la canción del xilófono.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  CUADRO_VACIO,
  HUECOS,
  LADO,
  cancionDe,
  cuadroDe,
  cuadroPintado,
  melodia,
  pintar,
  ponerNota,
} from '../../src/dominio/arte.ts';

describe('el estudio de arte', () => {
  test('pintar una casilla pinta también su espejo', () => {
    const c = pintar(CUADRO_VACIO, 2, 1, 3);
    expect(c[2 * LADO + 1]).toBe('3');
    expect(c[2 * LADO + LADO - 2]).toBe('3');
    expect(cuadroPintado(c)).toBe(true);
    expect(pintar(c, 9, 0, 1)).toBe(c);
  });
  test('un cuadro guardado roto se lee vacío', () => {
    expect(cuadroDe('hola')).toBe(CUADRO_VACIO);
    expect(cuadroPintado(cuadroDe(undefined))).toBe(false);
  });
  test('la canción tiene como mucho HUECOS notas y la última suena más larga', () => {
    let c: number[] = [];
    for (let i = 0; i < 12; i++) c = ponerNota(c, i % 5);
    expect(c).toHaveLength(HUECOS);
    expect(cancionDe([0, 9, 2, 'x'])).toEqual([0, 2]);
    const m = melodia([0, 1]);
    expect(m[1]![1]).toBeGreaterThan(m[0]![1]!);
  });
});
