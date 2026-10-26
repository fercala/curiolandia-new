// Pruebas de los casos de uso de los premios del día (src/aplicacion/premiosDelDia.ts, fase 4m): el regalo del día,
// el cumpleaños, el repaso y la asamblea (con la figurita de la semana y las asambleas que se guardan), sin cambiar la
// partida que reciben. Sin navegador: cada prueba inventa la partida.
import { describe, expect, test } from 'vitest';
import { ASAMBLEAS_POR_SEMANA, DIAS_DE_ASAMBLEA, premioDelCumple, premioDelRepaso, regaloDelDia, terminarAsamblea } from '../../src/aplicacion/premiosDelDia.ts';
import { MONEDAS } from '../../src/dominio/monedas.ts';

describe('los premios del día', () => {
  test('el regalo del día: una vez al día', () => {
    expect(regaloDelDia({}, '2026-10-26')).toEqual({ partida: { gift: '2026-10-26' }, monedas: MONEDAS.regaloDelDia });
    expect(regaloDelDia({ gift: '2026-10-25' }, '2026-10-26')?.partida.gift).toBe('2026-10-26');
    expect(regaloDelDia({ gift: '2026-10-26' }, '2026-10-26')).toBeNull();
  });

  test('el cumpleaños: apunta el día, una tarta más y sus monedas', () => {
    const p = { stk: { tarta: 1, sol: 2 } };
    expect(premioDelCumple(p, '2026-10-26')).toEqual({ partida: { bdayDone: '2026-10-26', stk: { tarta: 2, sol: 2 } }, monedas: MONEDAS.cumple });
    expect(p.stk.tarta).toBe(1);
  });

  test('el repaso: la primera lupa y sus monedas', () => {
    const p = { stk: {} };
    expect(premioDelRepaso(p)).toEqual({ partida: { stk: { lupa: 1 } }, monedas: MONEDAS.repaso });
    expect(p).toEqual({ stk: {} });
  });
});

describe('terminar la asamblea', () => {
  test('la primera de hoy: se guarda con done y la edad, y da monedas; sin figurita', () => {
    const p = { asam: {}, first: {} };
    const r = terminarAsamblea(p, '2026-10-26', '2026-10-26', { tiempo: 'sol' }, 4);
    expect(r).toEqual({ partida: { asam: { '2026-10-26': { tiempo: 'sol', done: 1, age: 4 } } }, hoy: { tiempo: 'sol', done: 1, age: 4 }, figurita: false, monedas: MONEDAS.asamblea });
    expect(p).toEqual({ asam: {}, first: {} });
  });

  test('repetirla el mismo día: sin monedas', () => {
    const r = terminarAsamblea({ asam: { '2026-10-26': { done: 1 } }, first: {} }, '2026-10-26', '2026-10-26', { done: 1 }, 4);
    expect(r.monedas).toBe(0);
  });

  test('la tercera de la semana da la figurita una sola vez', () => {
    const asam = { '2026-10-26': { done: 1 }, '2026-10-27': { done: 1 }, '2026-10-25': { done: 1 } };
    const r = terminarAsamblea({ asam, first: { askedName: 1 } }, '2026-10-28', '2026-10-26', {}, 5);
    expect(ASAMBLEAS_POR_SEMANA).toBe(3);
    expect(r.figurita).toBe(true);
    expect(r.partida.first).toEqual({ askedName: 1, wk: '2026-10-26' });
    const otra = terminarAsamblea({ asam: r.partida.asam, first: r.partida.first! }, '2026-10-29', '2026-10-26', {}, 5);
    expect(otra.figurita).toBe(false);
    expect(otra.partida.first).toBeUndefined();
  });

  test('se guardan como mucho DIAS_DE_ASAMBLEA días: se borran los más antiguos', () => {
    const asam: Record<string, { done: number }> = {};
    const d = new Date(2026, 0, 1);
    for (let i = 0; i < DIAS_DE_ASAMBLEA; i++) { asam[d.toISOString().slice(0, 10)] = { done: 1 }; d.setDate(d.getDate() + 1); }
    const r = terminarAsamblea({ asam, first: {} }, '2026-12-31', '2026-12-28', {}, 3);
    const dias = Object.keys(r.partida.asam).sort();
    expect(dias.length).toBe(DIAS_DE_ASAMBLEA);
    expect(dias[0]).not.toBe(Object.keys(asam).sort()[0]);
    expect(dias.at(-1)).toBe('2026-12-31');
    expect(Object.keys(asam).length).toBe(DIAS_DE_ASAMBLEA);
  });
});
