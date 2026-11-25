// Pruebas de las reglas del taller de experimentos (src/dominio/experimentos.ts, idea 30 de docs/IDEAS-MEJORA.md):
// mezclar colores, los imanes, las sombras, el ciclo del agua y la semilla.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { PASOS_AGUA, etapaSemilla, mezcla, planImanes, planSombras } from '../../src/dominio/experimentos.ts';
import { azarFijo } from './azarFijo.ts';

describe('el taller de experimentos', () => {
  test('los colores primarios se mezclan en los dos órdenes y un color con él mismo no', () => {
    expect(mezcla('rojo', 'amarillo')?.sale).toBe('naranja');
    expect(mezcla('amarillo', 'rojo')?.sale).toBe('naranja');
    expect(mezcla('azul', 'amarillo')?.sale).toBe('verde');
    expect(mezcla('rojo', 'azul')?.sale).toBe('morado');
    expect(mezcla('rojo', 'rojo')).toBeNull();
  });
  test('los imanes: seis objetos, tres de metal', () => {
    const p = planImanes(azarFijo(4));
    expect(p).toHaveLength(6);
    expect(p.filter((o) => o.metal)).toHaveLength(3);
  });
  test('las sombras: la buena siempre está y hay más opciones con más edad', () => {
    planSombras(3, azarFijo(1)).forEach((r) => {
      expect(r.sombras).toContain(r.objeto);
      expect(r.sombras).toHaveLength(2);
    });
    expect(planSombras(5, azarFijo(1))[0]!.sombras).toHaveLength(3);
  });
  test('el ciclo del agua tiene sus cuatro pasos y la semilla crece con los días', () => {
    expect(PASOS_AGUA).toHaveLength(4);
    expect([0, 1, 2, 4, 9].map(etapaSemilla)).toEqual([0, 1, 2, 3, 3]);
  });
});
