// Pruebas del caso de uso comprar (src/aplicacion/comprar.ts, fase 4m): un artículo pasa a ser del niño, un vale se
// apunta para canjearlo y un vale desactivado no se vende; sin cambiar la partida que recibe. Sin navegador.
import { describe, expect, test } from 'vitest';
import { comprar } from '../../src/aplicacion/comprar.ts';

describe('comprar en la tienda', () => {
  test('confirmar un objeto ya comprado no vuelve a concederlo ni reinicia su mascota', () => {
    expect(comprar({ coins: 100, owned: { hamster: 1 } }, { id: 'hamster', p: 25 }, '2026-11-24')).toEqual({
      tipo: 'ya-comprado',
    });
  });

  test('confirmar con saldo insuficiente no concede el artículo ni registra el vale', () => {
    const vale = { id: 'parque', txt: 'Ir al parque', on: 1, p: 50 };
    const p = { coins: 4, owned: {}, vales: [vale], valesLog: [] };
    expect(comprar(p, { id: 'piano', p: 30 }, '2026-11-24')).toEqual({ tipo: 'sin-monedas' });
    expect(comprar(p, { id: 'v', p: 50, vale }, '2026-11-24')).toEqual({ tipo: 'sin-monedas' });
    expect(p.owned).toEqual({});
    expect(p.valesLog).toEqual([]);
  });

  test('un vale editado durante la confirmación exige volver a elegirlo', () => {
    const vale = { id: 'parque', txt: 'Ir al parque', on: 1, p: 50 };
    for (const cambio of [{ p: 60 }, { txt: 'Ir al cine' }]) {
      const p = { coins: 100, vales: [{ ...vale, ...cambio }] };
      expect(comprar(p, { id: 'v', p: 50, vale }, '2026-11-24')).toEqual({ tipo: 'desactivado' });
    }
  });

  test('un artículo pasa a ser del niño', () => {
    const p = { coins: 100, owned: { gorra: 1 } };
    expect(comprar(p, { id: 'piano', p: 30 }, '2026-10-26')).toEqual({
      tipo: 'articulo',
      partida: { owned: { gorra: 1, piano: 1 } },
    });
    expect(p.owned).toEqual({ gorra: 1 });
  });

  test('un vale activo se apunta en valesLog con la fecha y sin dar', () => {
    const vale = { id: 'parque', txt: 'Ir al parque', on: 1, p: 50 };
    const p = { coins: 100, vales: [vale], valesLog: [{ id: 'cine', d: '2026-10-01', given: 1 }] };
    expect(comprar(p, { id: 'vale-parque', p: 50, vale }, '2026-10-26')).toEqual({
      tipo: 'vale',
      partida: {
        valesLog: [
          { id: 'cine', d: '2026-10-01', given: 1 },
          { id: 'parque', txt: 'Ir al parque', d: '2026-10-26', given: 0 },
        ],
      },
    });
    expect(p.valesLog.length).toBe(1);
  });

  test('un vale desactivado o borrado por un adulto no se vende', () => {
    const vale = { id: 'parque', txt: 'Ir al parque', on: 1, p: 50 };
    expect(comprar({ coins: 100, vales: [{ ...vale, on: 0 }] }, { id: 'v', p: 50, vale }, '2026-10-26')).toEqual({
      tipo: 'desactivado',
    });
    expect(comprar({ coins: 100, vales: [null] }, { id: 'v', p: 50, vale }, '2026-10-26')).toEqual({
      tipo: 'desactivado',
    });
    expect(comprar({ coins: 100 }, { id: 'v', p: 50, vale }, '2026-10-26')).toEqual({ tipo: 'desactivado' });
  });
});
