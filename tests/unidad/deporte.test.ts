// Pruebas del gran día del deporte (src/dominio/deporte.ts), fase P11 de docs/IDEAS-MEJORA.md. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  PRUEBAS_DEPORTE,
  fraseMedallero,
  ganarCopa,
  medallaDe,
  registroDeporte,
  semanaDe,
} from '../../src/dominio/deporte.ts';

describe('el gran día del deporte', () => {
  test('cinco pruebas con ids y escenas distintas, y el oro pide más que la plata', () => {
    expect(PRUEBAS_DEPORTE.map((p) => p.id)).toEqual(['carrera', 'salto', 'punteria', 'equilibrio', 'relevos']);
    expect(new Set(PRUEBAS_DEPORTE.map((p) => p.escena)).size).toBe(5);
    PRUEBAS_DEPORTE.forEach((p) => [3, 4, 5].forEach((e) => expect(p.oro[e] ?? 0).toBeGreaterThan(p.plata[e] ?? 0)));
  });

  test('siempre hay medalla, y la edad cuenta', () => {
    expect(medallaDe('punteria', 0, 4)).toBe('bronce');
    expect(medallaDe('punteria', 2, 3)).toBe('oro');
    expect(medallaDe('punteria', 2, 5)).toBe('plata');
    expect(medallaDe('carrera', 3, 9)).toBe('oro');
    expect(medallaDe('nada', 99, 4)).toBe('bronce');
  });

  test('la semana va de lunes a domingo', () => {
    expect(semanaDe('2026-11-09')).toBe('2026-11-09'); // lunes
    expect(semanaDe('2026-11-15')).toBe('2026-11-09'); // domingo
    expect(semanaDe('2026-11-16')).toBe('2026-11-16');
    expect(semanaDe('2027-01-01')).toBe('2026-12-28');
  });

  test('una copa por semana', () => {
    expect(registroDeporte(null)).toEqual({ copas: 0, semana: '' });
    const a = ganarCopa(undefined, '2026-11-10');
    expect(a).toEqual({ registro: { copas: 1, semana: '2026-11-09' }, nueva: true });
    expect(ganarCopa(a.registro, '2026-11-14').nueva).toBe(false);
    expect(ganarCopa(a.registro, '2026-11-17')).toEqual({ registro: { copas: 2, semana: '2026-11-16' }, nueva: true });
  });

  test('el medallero lo dice con sus números', () => {
    expect(fraseMedallero({ a: 'oro', b: 'oro', c: 'plata', d: 'bronce' })).toBe(
      'Tienes dos medallas de oro, una de plata y una de bronce.',
    );
    expect(fraseMedallero({ a: 'plata' })).toBe('Tienes una medalla de plata.');
    expect(fraseMedallero({})).toBe('');
  });
});
