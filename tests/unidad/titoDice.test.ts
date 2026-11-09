// Pruebas de las reglas de «Tito dice» (src/dominio/titoDice.ts, fase P2 de docs/IDEAS-MEJORA.md): cuántas órdenes y
// trampas tiene una partida según la edad y dónde caen las trampas. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { planTitoDice } from '../../src/dominio/titoDice.ts';

// azarFijo(semilla): un azar que siempre da la misma serie (para que cada prueba salga igual).
function azarFijo(semilla: number): () => number {
  let s = semilla;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

describe('Tito dice', () => {
  test('con 3 años, 6 órdenes y ninguna trampa', () => {
    const plan = planTitoDice(15, 3, azarFijo(1));
    expect(plan).toHaveLength(6);
    expect(plan.some((p) => p.trampa)).toBe(false);
  });

  test('con 4 y 5 años, 8 órdenes sin repetir, con 2 y 3 trampas', () => {
    Array.from({ length: 30 }, (_, k) => k).forEach((k) => {
      const a = planTitoDice(15, 4, azarFijo(k)),
        b = planTitoDice(15, 5, azarFijo(k));
      expect(a).toHaveLength(8);
      expect(new Set(a.map((p) => p.orden)).size).toBe(8);
      expect(a.filter((p) => p.trampa)).toHaveLength(2);
      expect(b.filter((p) => p.trampa)).toHaveLength(3);
    });
  });

  test('las trampas nunca son las dos primeras ni van seguidas', () => {
    Array.from({ length: 50 }, (_, k) => k).forEach((k) => {
      const plan = planTitoDice(15, 5, azarFijo(k));
      expect(plan[0]!.trampa || plan[1]!.trampa).toBe(false);
      plan.forEach((p, i) => {
        if (i > 0) expect(p.trampa && plan[i - 1]!.trampa).toBe(false);
      });
    });
  });

  test('una edad fuera de rango se ajusta, y con pocas órdenes no se pasa', () => {
    expect(planTitoDice(15, 2, azarFijo(3))).toHaveLength(6);
    expect(planTitoDice(15, 7, azarFijo(3)).filter((p) => p.trampa)).toHaveLength(3);
    expect(planTitoDice(4, 5, azarFijo(3))).toHaveLength(4);
  });
});
