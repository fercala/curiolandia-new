// Pruebas de las reglas del cole y su patio (src/dominio/cole.ts, fase P1 de docs/IDEAS-MEJORA.md): las actividades
// del patio, el registro guardado (S.cole) y lo que pasa al terminar una actividad. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { ACTIVIDADES_PATIO, COLE, actividadDelPatio, registroCole, terminarActividad } from '../../src/dominio/cole.ts';

describe('el patio del cole', () => {
  test('las actividades tienen ids distintos y ¡Estatuas!, Tito dice y el yoga ya se pueden jugar', () => {
    const ids = ACTIVIDADES_PATIO.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(actividadDelPatio('estatuas')?.escena).toBe('estatuas');
    expect(actividadDelPatio('titoDice')?.escena).toBe('titoDice');
    expect(actividadDelPatio('yoga')?.escena).toBe('yoga');
    expect(actividadDelPatio('nada')).toBeUndefined();
  });

  test('un registro roto o de una partida de antes se lee como vacío', () => {
    expect(registroCole(undefined)).toEqual({ d: '', hechas: [], veces: {} });
    expect(registroCole({ d: 3 })).toEqual({ d: '', hechas: [], veces: {} });
    expect(registroCole({ d: '2026-11-08', hechas: ['estatuas', 4], veces: null })).toEqual({
      d: '2026-11-08',
      hechas: ['estatuas'],
      veces: {},
    });
  });

  test('la primera vez del día da monedas; la segunda, no', () => {
    const a = terminarActividad(undefined, 'estatuas', '2026-11-08');
    expect(a.monedas).toBe(COLE.monedasActividad);
    expect(a.primeraVez).toBe(true);
    expect(a.registro).toEqual({ d: '2026-11-08', hechas: ['estatuas'], veces: { estatuas: 1 } });
    const b = terminarActividad(a.registro, 'estatuas', '2026-11-08');
    expect(b.monedas).toBe(0);
    expect(b.primeraVez).toBe(false);
    expect(b.registro.veces['estatuas']).toBe(2);
  });

  test('al día siguiente vuelve a dar monedas y no cambia el registro que recibe', () => {
    const ayer = { d: '2026-11-07', hechas: ['estatuas'], veces: { estatuas: 3 } };
    const r = terminarActividad(ayer, 'estatuas', '2026-11-08');
    expect(r.monedas).toBe(COLE.monedasActividad);
    expect(r.registro).toEqual({ d: '2026-11-08', hechas: ['estatuas'], veces: { estatuas: 4 } });
    expect(ayer.veces.estatuas).toBe(3);
  });
});
