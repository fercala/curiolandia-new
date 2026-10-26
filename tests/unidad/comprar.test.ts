// Pruebas del caso de uso comprar (src/aplicacion/comprar.ts, fase 4m): un artículo pasa a ser del niño, un vale se
// apunta para canjearlo y un vale desactivado no se vende; sin cambiar la partida que recibe. Sin navegador.
import { describe, expect, test } from 'vitest';
import { comprar } from '../../src/aplicacion/comprar.ts';

describe('comprar en la tienda', () => {
  test('un artículo pasa a ser del niño', () => {
    const p = { owned: { gorra: 1 } };
    expect(comprar(p, { id: 'piano' }, '2026-10-26')).toEqual({ tipo: 'articulo', partida: { owned: { gorra: 1, piano: 1 } } });
    expect(p.owned).toEqual({ gorra: 1 });
  });

  test('un vale activo se apunta en valesLog con la fecha y sin dar', () => {
    const vale = { id: 'parque', txt: 'Ir al parque', on: 1 };
    const p = { vales: [vale], valesLog: [{ id: 'cine', d: '2026-10-01', given: 1 }] };
    expect(comprar(p, { id: 'vale-parque', vale }, '2026-10-26')).toEqual({ tipo: 'vale', partida: { valesLog: [
      { id: 'cine', d: '2026-10-01', given: 1 }, { id: 'parque', txt: 'Ir al parque', d: '2026-10-26', given: 0 }] } });
    expect(p.valesLog.length).toBe(1);
  });

  test('un vale desactivado o borrado por un adulto no se vende', () => {
    const vale = { id: 'parque', txt: 'Ir al parque', on: 1 };
    expect(comprar({ vales: [{ ...vale, on: 0 }] }, { id: 'v', vale }, '2026-10-26')).toEqual({ tipo: 'desactivado' });
    expect(comprar({ vales: [null] }, { id: 'v', vale }, '2026-10-26')).toEqual({ tipo: 'desactivado' });
    expect(comprar({}, { id: 'v', vale }, '2026-10-26')).toEqual({ tipo: 'desactivado' });
  });
});
