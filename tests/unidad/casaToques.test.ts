// Pruebas de los toques y estados de la casa de Tito (src/dominio/casaToques.ts, fase M3 de docs/PLAN-CASA-MEJORA.md):
// que cada cosa de la casa tiene su toque, que los estados pasan al siguiente y vuelven al 0, y que un estado roto vale
// 0; sin cambiar los estados que reciben. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los estados de cada caso: leerlos tal cual en la
   prueba es más claro que darles nombre. */
import { describe, expect, test } from 'vitest';
import { ESTADOS, TOQUES, estadoDe, siguienteEstado, toqueDe } from '../../src/dominio/casaToques.ts';
import { MASCOTAS, REACCIONES } from '../../src/dominio/casa.ts';

describe('toques de la casa', () => {
  test('las 49 cosas de REACCIONES y las 6 mascotas tienen su toque', () => {
    const ids = [...Object.keys(REACCIONES), ...MASCOTAS];
    expect(ids.filter((id) => !Object.hasOwn(TOQUES, id))).toEqual([]);
    expect(Object.keys(TOQUES).length).toBe(ids.length);
  });

  test('un objeto desconocido late', () => {
    expect(toqueDe('nada')).toBe('late');
  });

  test('los estados son de cosas de la casa', () => {
    expect(Object.keys(ESTADOS).filter((id) => !Object.hasOwn(REACCIONES, id))).toEqual([]);
  });
});

describe('estados guardados', () => {
  test('cada toque pasa al estado siguiente y el último vuelve al 0', () => {
    const est = { lampara: 1 };
    expect(siguienteEstado(est, 'lampara')).toEqual({ lampara: 0 });
    expect(siguienteEstado(est, 'tele')).toEqual({ lampara: 1, tele: 1 });
    expect(est).toEqual({ lampara: 1 });
  });

  test('la torre de bloques sube hasta 5 y se cae', () => {
    const alturas: number[] = [];
    Array.from({ length: 7 }).reduce<Record<string, number>>((e) => {
      const n = { ...siguienteEstado(e, 'bloques') };
      alturas.push(estadoDe(n, 'bloques'));
      return n;
    }, {});
    expect(alturas).toEqual([1, 2, 3, 4, 5, 0, 1]);
  });

  test('lo que no tiene estado no cambia y un estado roto vale 0', () => {
    const est = { robot: 3 };
    expect(siguienteEstado(est, 'robot')).toBe(est);
    expect(estadoDe(null, 'tele')).toBe(0);
    expect(estadoDe({ tele: 9 }, 'tele')).toBe(0);
    expect(estadoDe({ tele: 'a' } as unknown as Record<string, number>, 'tele')).toBe(0);
    expect(estadoDe({ tele: 2 }, 'tele')).toBe(2);
  });
});
