// Pruebas de copiaProfunda (src/nucleo/utilidades.ts, mejora 6 del issue #55): la copia no comparte nada con el
// original y se comporta exactamente como JSON.parse(JSON.stringify(...)), que es lo que hacía el código antes (los
// undefined desaparecen, las fechas quedan como texto, NaN como null), para que la partida se copie igual que se guarda.
import { describe, expect, test } from 'vitest';
import { copiaProfunda } from '../../src/nucleo/utilidades.ts';

describe('copiaProfunda', () => {
  test('da un valor igual que no comparte objetos ni listas con el original', () => {
    const original = {
      coins: 3,
      tito: { shell: 'naranja' },
      album: ['a', 'b'],
      vales: [{ id: 'v1', on: 1 }],
      bday: null,
    };
    const copia = copiaProfunda(original);
    expect(copia).toEqual(original);
    expect(copia).not.toBe(original);
    expect(copia.tito).not.toBe(original.tito);
    expect(copia.album).not.toBe(original.album);
    expect(copia.vales[0]).not.toBe(original.vales[0]);
    copia.tito.shell = 'verde';
    copia.album.push('c');
    expect(original.tito.shell).toBe('naranja');
    expect(original.album).toEqual(['a', 'b']);
  });

  test('trata los valores raros igual que JSON (como al guardar la partida)', () => {
    const fecha = new Date(Date.UTC(2026, 10, 1));
    const raro = { nada: undefined, fecha, nan: Number.NaN, infinito: Number.POSITIVE_INFINITY, lista: [undefined, 1] };
    const copia = copiaProfunda(raro);
    expect(copia).toEqual(JSON.parse(JSON.stringify(raro)));
    expect('nada' in copia).toBe(false);
    expect(copia.fecha).toBe(fecha.toISOString());
    expect(copia.nan).toBeNull();
    expect(copia.lista).toEqual([null, 1]);
  });

  test('copia también textos, números y null sueltos', () => {
    expect(copiaProfunda('roja')).toBe('roja');
    expect(copiaProfunda(7)).toBe(7);
    expect(copiaProfunda(null)).toBeNull();
  });
});
