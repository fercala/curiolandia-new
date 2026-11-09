// Pruebas del motor de excursiones (src/dominio/excursiones.ts) y de sus datos (src/contenido/excursiones.ts), fase P5
// de docs/IDEAS-MEJORA.md. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  EXCURSION,
  estacionesJugables,
  siguienteEstacion,
  terminarEstacion,
  terminarVisita,
  visitaCompleta,
  visitaDe,
} from '../../src/dominio/excursiones.ts';
import { EXCURSIONES, excursionPorId } from '../../src/contenido/excursiones.ts';

const granja = excursionPorId('granja')!;

describe('las excursiones', () => {
  test('ids distintos, y la granja tiene ya estaciones jugables con ids distintos', () => {
    const ids = EXCURSIONES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const est = granja.estaciones.map((s) => s.id);
    expect(new Set(est).size).toBe(est.length);
    expect(estacionesJugables(granja).map((s) => s.id)).toEqual(['comer', 'huevos']);
  });

  test('lo guardado roto o de antes se lee como una visita vacía', () => {
    expect(visitaDe(undefined, 'granja')).toEqual({ vistas: [], veces: 0, foto: false, d: '' });
    expect(visitaDe({ granja: { vistas: ['comer', 3] } }, 'granja').vistas).toEqual(['comer']);
  });

  test('las estaciones se hacen de una en una hasta completar la visita', () => {
    const v0 = visitaDe(undefined, 'granja');
    expect(siguienteEstacion(granja, v0)?.id).toBe('comer');
    const v1 = terminarEstacion(v0, 'comer');
    expect(terminarEstacion(v1, 'comer')).toBe(v1);
    expect(visitaCompleta(granja, v1)).toBe(false);
    expect(siguienteEstacion(granja, v1)?.id).toBe('huevos');
    const v2 = terminarEstacion(v1, 'huevos');
    expect(visitaCompleta(granja, v2)).toBe(true);
    expect(siguienteEstacion(granja, v2)).toBeUndefined();
  });

  test('terminar la visita da la foto y monedas la primera vez del día, y la siguiente empieza de cero', () => {
    const v = terminarEstacion(terminarEstacion(visitaDe(undefined, 'granja'), 'comer'), 'huevos');
    const a = terminarVisita(v, '2026-11-09');
    expect(a.monedas).toBe(EXCURSION.monedasVisita);
    expect(a.visita).toEqual({ vistas: [], veces: 1, foto: true, d: '2026-11-09' });
    expect(terminarVisita(a.visita, '2026-11-09').monedas).toBe(0);
    expect(terminarVisita(a.visita, '2026-11-10').monedas).toBe(EXCURSION.monedasVisita);
  });

  test('una excursión sin estaciones nunca está completa', () => {
    expect(visitaCompleta(excursionPorId('zoo')!, visitaDe(undefined, 'zoo'))).toBe(false);
  });
});
