// Pruebas de la versión de la partida y sus migraciones (src/dominio/partida.ts, fase 3f): qué parece una partida, qué
// versión tiene, que no falta ningún paso de migración y que migrar pone al día una partida vieja sin perder nada ni
// cambiar la que recibe. Sin navegador: cada prueba inventa la partida (y, para probar una cadena de pasos, las
// migraciones).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (versiones, monedas): leerlos
   tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import type { Migracion } from '../../src/dominio/partida.ts';
import { MIGRACIONES, VERSION_PARTIDA, esPartida, migrar, versionDe } from '../../src/dominio/partida.ts';

// Una partida de curiolandia-3d (sin versión), como las que hay en los móviles.
const VIEJA = { age: 4, name: 'Leo', temas: { '3A-T1': { g: { 0: 2 }, done: 0 } }, coins: 12, tito: { shell: 'azul' } };

describe('qué es una partida y qué versión tiene', () => {
  test('una partida es un objeto: ni null, ni una lista, ni un número o un texto', () => {
    expect([{}, VIEJA].map(esPartida)).toEqual([true, true]);
    expect([null, undefined, [], 3, 'hola', true].map(esPartida)).toEqual([false, false, false, false, false, false]);
  });

  test('sin versión, o con una que no es un entero de 0 en adelante, es la 0', () => {
    expect(versionDe(VIEJA)).toBe(0);
    expect([1, 2, 0].map((ver) => versionDe({ ver }))).toEqual([1, 2, 0]);
    expect([-1, 1.5, '1', null, Number.NaN].map((ver) => versionDe({ ver }))).toEqual([0, 0, 0, 0, 0]);
  });
});

describe('migraciones', () => {
  test('hay un paso por cada versión, de 0 a la anterior a la actual', () => {
    expect(VERSION_PARTIDA).toBeGreaterThanOrEqual(1);
    const faltan = Array.from({ length: VERSION_PARTIDA }, (_x, v) => v).filter((v) => typeof MIGRACIONES[v] !== 'function');
    expect(faltan).toEqual([]);
  });

  test('una partida de curiolandia-3d sale con la versión actual y los mismos datos, sin cambiar la que se pasa', () => {
    const copia = structuredClone(VIEJA);
    const nueva = migrar(VIEJA);
    expect(nueva).toEqual({ ...VIEJA, ver: VERSION_PARTIDA });
    expect(nueva).not.toBe(VIEJA);
    expect(VIEJA).toEqual(copia);
  });

  test('una partida ya al día, o de un juego más nuevo, sale igual', () => {
    const al = { ...VIEJA, ver: VERSION_PARTIDA };
    expect(migrar(al)).toEqual(al);
    const futura = { ...VIEJA, ver: VERSION_PARTIDA + 3, nuevo: 1 };
    expect(migrar(futura)).toEqual(futura);
  });

  test('los pasos se aplican en orden, desde la versión de la partida, y cada uno apunta la suya', () => {
    const vistos: number[] = [];
    // paso(v, cambio): un paso de prueba que apunta que pasó por la versión v y cambia la partida.
    const paso = (v: number, cambio: (d: Record<string, unknown>) => Record<string, unknown>): Migracion => (d) => {
      vistos.push(Number(d['ver'] ?? 0));
      return cambio({ ...d, desde: v });
    };
    const pasos: Record<number, Migracion> = {
      0: paso(0, (d) => d),
      1: paso(1, (d) => ({ ...d, monedas: d['coins'] })),
      2: paso(2, ({ coins: _quitado, ...d }) => d),
    };
    // El paso 1 copia coins en monedas y el 2 quita coins.
    expect(migrar(VIEJA, 3, pasos)).toEqual({ age: 4, name: 'Leo', temas: VIEJA.temas, tito: VIEJA.tito, monedas: 12, desde: 2, ver: 3 });
    expect(vistos).toEqual([0, 1, 2]);
    vistos.length = 0;
    expect(migrar({ ...VIEJA, ver: 2 }, 3, pasos)).not.toHaveProperty('coins');
    expect(vistos).toEqual([2]);
  });

  test('si faltara un paso, esa versión se salta sin cambiar nada', () => {
    expect(migrar(VIEJA, 2, {})).toEqual({ ...VIEJA, ver: 2 });
  });
});
