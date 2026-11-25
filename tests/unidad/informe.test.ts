// Pruebas de las reglas del informe semanal para la familia (src/dominio/informe.ts, idea 41 de docs/IDEAS-MEJORA.md).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { informeSemana } from '../../src/dominio/informe.ts';

describe('el informe semanal', () => {
  test('cuenta solo los últimos siete días', () => {
    const inf = informeSemana(
      { '2026-11-25': 20, '2026-11-19': 10.4, '2026-11-18': 50, '2026-11-24': 0 },
      { '2026-11-25': ['casita', 'arte'], '2026-11-20': ['casita'], '2026-11-10': ['patio'] },
      undefined,
      '2026-11-25',
    );
    expect(inf.minutos).toBe(30);
    expect(inf.dias).toBe(2);
    expect(inf.cosas).toEqual([
      { clave: 'casita', veces: 2 },
      { clave: 'arte', veces: 1 },
    ]);
  });
  test('lo que mejor se le da y lo que más le cuesta salen de los aciertos', () => {
    const inf = informeSemana(
      {},
      {},
      { contar: { ok: 18, err: 2 }, formas: { ok: 2, err: 8 }, poco: { ok: 1, err: 0 } },
      '2026-11-25',
    );
    expect(inf.sabe).toBe('contar');
    expect(inf.cuesta).toBe('formas');
    expect(informeSemana(undefined, undefined, undefined, '2026-11-25')).toEqual({
      minutos: 0,
      dias: 0,
      cosas: [],
      sabe: '',
      cuesta: '',
    });
  });
});
