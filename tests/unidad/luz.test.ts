// Pruebas de la luz de las escenas 2D según la hora (src/dominio/luz.ts, mejora gráfica 1 de docs/MEJORAS-GRAFICAS.md):
// el momento de cada hora, la mezcla de colores y el cielo de cada momento.
/* eslint-disable ts-patterns/no-magic-numbers -- las horas y los colores de cada caso, tal cual, son más claros. */
import { describe, expect, test } from 'vitest';
import { CIELO_LUZ, VELO_LUZ, cieloDe, mezcla, momentoLuz } from '../../src/dominio/luz.ts';

describe('la luz de las escenas 2D', () => {
  test('el momento de cada hora, como el cielo del mapa', () => {
    expect([0, 6, 7, 8, 9, 17, 18, 19, 20, 23].map(momentoLuz)).toEqual([
      'noche',
      'noche',
      'amanecer',
      'amanecer',
      'dia',
      'dia',
      'tarde',
      'tarde',
      'noche',
      'noche',
    ]);
  });
  test('la mezcla de dos colores', () => {
    expect(mezcla('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mezcla('#000000', '#FFFFFF', 1)).toBe('#ffffff');
    expect(mezcla('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(mezcla('#FF0000', '#0000FF', 0.25)).toBe('#bf0040');
  });
  test('de día el cielo es el de la escena; de noche, mucho más oscuro', () => {
    expect(cieloDe('dia', '#BFE3FF', '#E6F5FF')).toEqual(['#BFE3FF', '#E6F5FF']);
    const [arriba] = cieloDe('noche', '#BFE3FF', '#E6F5FF');
    expect(parseInt(arriba.slice(1, 3), 16)).toBeLessThan(0x60);
  });
  test('cada momento tiene su velo, y de día no tapa nada', () => {
    expect(VELO_LUZ.dia.alfa).toBe(0);
    expect(VELO_LUZ.noche.alfa).toBeGreaterThan(VELO_LUZ.tarde.alfa);
    expect(CIELO_LUZ.dia).toBeNull();
  });
});
