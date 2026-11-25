// Pruebas de las reglas del diario de Tito (src/dominio/diario.ts, idea 35 de docs/IDEAS-MEJORA.md): leer lo guardado,
// apuntar una vez por día, guardar solo los últimos días y las páginas de la más nueva a la más vieja.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  COSAS_DIARIO,
  DIAS_DIARIO,
  apuntar,
  hechoHoy,
  paginasDiario,
  registroDiario,
} from '../../src/dominio/diario.ts';

describe('el diario de Tito', () => {
  test('lo guardado roto se lee vacío y las claves que no existen se quitan', () => {
    expect(registroDiario(null)).toEqual({});
    expect(registroDiario({ '2026-11-20': ['casita', 'nada'], hola: ['casita'] })).toEqual({
      '2026-11-20': ['casita'],
    });
  });
  test('cada cosa tiene su frase y su dibujo', () => {
    Object.values(COSAS_DIARIO).forEach((c) => {
      expect(c.frase.length).toBeGreaterThan(5);
      expect(c.dibujo.length).toBeGreaterThan(1);
    });
  });
  test('se apunta una vez por día y se sabe si ya se hizo', () => {
    let r = apuntar({}, '2026-11-20', 'casita');
    r = apuntar(r, '2026-11-20', 'casita');
    r = apuntar(r, '2026-11-20', 'arte');
    expect(r['2026-11-20']).toEqual(['casita', 'arte']);
    expect(hechoHoy(r, '2026-11-20', 'arte')).toBe(true);
    expect(hechoHoy(r, '2026-11-21', 'arte')).toBe(false);
  });
  test('solo se guardan los últimos días y las páginas van de la más nueva a la más vieja', () => {
    let r = {};
    for (let d = 1; d <= 20; d++) r = apuntar(r, '2026-11-' + String(d).padStart(2, '0'), 'patio');
    const p = paginasDiario(r);
    expect(p).toHaveLength(DIAS_DIARIO);
    expect(p[0]!.fecha).toBe('2026-11-20');
  });
});
