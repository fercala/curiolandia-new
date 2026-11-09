// Pruebas de las reglas de los retos para hacer en casa y del interruptor de los juegos de moverse
// (src/dominio/retos.ts, fase P4 de docs/IDEAS-MEJORA.md). Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  RETOS,
  marcarRetoHecho,
  moverseActivo,
  proponerReto,
  registroRetos,
  retoCelebrado,
  retoPorId,
  tocaCelebrarReto,
} from '../../src/dominio/retos.ts';

describe('los retos en casa', () => {
  test('los retos tienen ids distintos y frase para Tito y para la familia', () => {
    const ids = RETOS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    RETOS.forEach((r) => {
      expect(r.frase.length).toBeGreaterThan(5);
      expect(r.adultos.length).toBeGreaterThan(5);
    });
  });

  test('un registro roto o de una partida de antes se lee como vacío', () => {
    expect(registroRetos(undefined)).toEqual({ d: '', id: '', hecho: false, celebrado: false, n: 0 });
    expect(registroRetos({ d: 1 }).id).toBe('');
  });

  test('hoy se propone un reto y el mismo día se repite; otro día cambia', () => {
    const a = proponerReto(undefined, '2026-11-09', () => 0.3);
    expect(retoPorId(a.id)).toBeDefined();
    expect(proponerReto(a, '2026-11-09', () => 0.9)).toEqual(a);
    const b = proponerReto(a, '2026-11-10', () => 0.3);
    expect(b.id).not.toBe(a.id);
    expect(b.d).toBe('2026-11-10');
  });

  test('sin juegos de moverse, el reto no es de moverse', () => {
    Array.from({ length: 20 }, (_, i) => i / 20).forEach((k) => {
      const r = proponerReto(undefined, '2026-11-09', () => k, true);
      expect(retoPorId(r.id)!.tipo).not.toBe('moverse');
    });
  });

  test('marcarlo como hecho suma uno, Tito lo celebra una vez y no se cuenta dos veces', () => {
    const a = proponerReto(undefined, '2026-11-09', () => 0);
    expect(tocaCelebrarReto(a)).toBe(false);
    const b = marcarRetoHecho(a);
    expect(b.n).toBe(1);
    expect(tocaCelebrarReto(b)).toBe(true);
    expect(marcarRetoHecho(b).n).toBe(1);
    const c = retoCelebrado(b);
    expect(tocaCelebrarReto(c)).toBe(false);
    expect(marcarRetoHecho(undefined).hecho).toBe(false);
  });

  test('los juegos de moverse están puestos salvo que la familia los quite', () => {
    expect(moverseActivo(undefined)).toBe(true);
    expect(moverseActivo(true)).toBe(false);
  });
});
