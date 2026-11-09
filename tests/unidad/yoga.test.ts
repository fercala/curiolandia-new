// Pruebas de las reglas del yoga de los animales y la pausa activa (src/dominio/yoga.ts, fase P3 de
// docs/IDEAS-MEJORA.md). Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { POSTURAS, RESPIRACIONES, planYoga, tocaPausaActiva } from '../../src/dominio/yoga.ts';

// azarFijo(semilla): un azar que siempre da la misma serie (para que cada prueba salga igual).
function azarFijo(semilla: number): () => number {
  let s = semilla;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

describe('el yoga de los animales', () => {
  test('las posturas y respiraciones tienen ids distintos', () => {
    const ids = [...POSTURAS, ...RESPIRACIONES].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('en el patio: 3 posturas con 3 años y 4 con 4 o 5, sin repetir, y las dos respiraciones al final', () => {
    const p3 = planYoga(3, 'patio', azarFijo(1)),
      p5 = planYoga(5, 'patio', azarFijo(2));
    expect(p3.filter((p) => p.tipo === 'postura')).toHaveLength(3);
    expect(p5.filter((p) => p.tipo === 'postura')).toHaveLength(4);
    expect(p3.map((p) => p.tipo).slice(-2)).toEqual(['respiracion', 'respiracion']);
    const ids = p5.flatMap((p) => (p.tipo === 'postura' ? [p.postura.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(p3[0]!.respiros).toBe(2);
    expect(p5[0]!.respiros).toBe(3);
  });

  test('la pausa activa es corta: 2 posturas y una respiración', () => {
    const p = planYoga(4, 'pausa', azarFijo(5));
    expect(p.map((x) => x.tipo)).toEqual(['postura', 'postura', 'respiracion']);
  });

  test('la pausa activa se propone a los 20 minutos, una vez y sin límite de tiempo', () => {
    expect(tocaPausaActiva(19 * 60, false, 0)).toBe(false);
    expect(tocaPausaActiva(20 * 60, false, 0)).toBe(true);
    expect(tocaPausaActiva(25 * 60, true, 0)).toBe(false);
    expect(tocaPausaActiva(25 * 60, false, 30)).toBe(false);
  });
});
