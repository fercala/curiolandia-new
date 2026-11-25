// Pruebas del estilo de cada tema en «conocer» y «busca» (src/dominio/variedad.ts, idea 46 de docs/IDEAS-MEJORA.md).
import { describe, expect, test } from 'vitest';
import { ADORNOS, ENTRADAS, estiloDe } from '../../src/dominio/variedad.ts';

describe('el estilo de los temas', () => {
  test('el mismo tema, siempre el mismo estilo; sin tema, el de siempre', () => {
    expect(estiloDe('otono')).toEqual(estiloDe('otono'));
    expect(estiloDe(undefined)).toEqual({ entrada: 'rebote', adorno: 'burbujas', color: '#FFFFFF' });
  });
  test('los temas no son todos iguales', () => {
    const ids = ['otono', 'familia', 'cole', 'animales', 'invierno', 'cuerpo', 'mar', 'granja', 'espacio', 'frutas'],
      estilos = ids.map(estiloDe);
    expect(new Set(estilos.map((e) => e.entrada)).size).toBeGreaterThan(1);
    expect(new Set(estilos.map((e) => e.adorno)).size).toBeGreaterThan(1);
    estilos.forEach((e) => {
      expect(ENTRADAS).toContain(e.entrada);
      expect(ADORNOS).toContain(e.adorno);
    });
  });
});
