// Pruebas de qué suena de fondo en cada sitio (src/dominio/ambiente.ts, idea 43 de docs/IDEAS-MEJORA.md).
import { describe, expect, test } from 'vitest';
import { ambienteDe, musicaDe } from '../../src/dominio/ambiente.ts';

describe('los sonidos de ambiente', () => {
  test('cada sitio suena a lo suyo y el resto, a nada', () => {
    expect(ambienteDe('map')).toEqual(['pajaros']);
    expect(ambienteDe('playaCastillo')).toEqual(['olas']);
    expect(ambienteDe('bosqueHojas')).toEqual(['pajaros', 'viento']);
    expect(ambienteDe('mapaTesoros')).toEqual([]);
    expect(ambienteDe('tienda')).toEqual([]);
  });
  test('el mar y el bosque tienen su música; los demás, la de la escena', () => {
    expect(musicaDe('acuarioDelfines')).toBe('mar');
    expect(musicaDe('bosqueMural')).toBe('bosque');
    expect(musicaDe('granjaComer')).toBe('');
  });
});
