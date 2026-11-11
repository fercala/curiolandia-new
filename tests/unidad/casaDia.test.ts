// Pruebas de «Un día con Tito» (src/dominio/casaDia.ts, fase M6 de docs/PLAN-CASA-MEJORA.md): el momento del día, la
// rutina de cada hora, qué cosas la cumplen y las rutinas hechas hoy (que se vacían al cambiar el día).
/* eslint-disable ts-patterns/no-magic-numbers -- las horas de cada caso, tal cual, son más claras que con nombre. */
import { describe, expect, test } from 'vitest';
import { RUTINAS, cumple, diaDe, hacerRutina, hechaHoy, momentoDe, rutinaDe } from '../../src/dominio/casaDia.ts';

describe('un día con Tito', () => {
  test('el momento del día', () => {
    expect([6, 7, 14.9, 15, 19.9, 20, 23].map(momentoDe)).toEqual([
      'noche',
      'manana',
      'manana',
      'tarde',
      'tarde',
      'noche',
      'noche',
    ]);
  });
  test('cada hora tiene su rutina, y la de dormir pasa la medianoche', () => {
    expect([8, 11, 14, 16, 18, 20, 22, 2, 6.9].map((h) => rutinaDe(h).id)).toEqual([
      'desayuno',
      'jugar',
      'comida',
      'siesta',
      'bano',
      'cena',
      'dormir',
      'dormir',
      'dormir',
    ]);
    for (let h = 0; h < 24; h += 0.5) expect(rutinaDe(h)).toBeDefined();
    expect(RUTINAS.every((r) => r.cosas.includes(r.icono))).toBe(true);
  });
  test('qué cosas cumplen cada rutina', () => {
    expect(cumple(rutinaDe(8), 'nevera')).toBe(true);
    expect(cumple(rutinaDe(8), 'cama')).toBe(false);
    expect(cumple(rutinaDe(22), 'cama')).toBe(true);
  });
  test('las rutinas hechas son de hoy y cada una cuenta una vez', () => {
    const a = hacerRutina(undefined, '2026-11-10', 'desayuno');
    expect(a).toEqual({ dia: { d: '2026-11-10', hechas: ['desayuno'] }, nueva: true });
    expect(hacerRutina(a.dia, '2026-11-10', 'desayuno').nueva).toBe(false);
    expect(hechaHoy(a.dia, '2026-11-10', 'desayuno')).toBe(true);
    expect(hechaHoy(a.dia, '2026-11-11', 'desayuno')).toBe(false);
    expect(diaDe({ d: '2026-11-10', hechas: 'roto' }, '2026-11-10')).toEqual({ d: '2026-11-10', hechas: [] });
    expect(diaDe(null, '2026-11-10').hechas).toEqual([]);
  });
});
