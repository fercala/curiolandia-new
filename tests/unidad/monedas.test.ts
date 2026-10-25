// Pruebas de las reglas de las monedas (src/dominio/monedas.ts, fase 3c): cuántas da cada cosa, los aciertos (como
// mucho 5 por juego) y cómo se suman y se gastan sin tocar el monedero que se pasa.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (monedas, precios): leerlos
   tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import { MONEDAS, alcanza, ganar, gastar, monedasAlTerminar, monedasDelCofre, monedasPorAcierto } from '../../src/dominio/monedas.ts';

describe('cuántas monedas', () => {
  test('un acierto a la primera da 1 moneda, como mucho 5 por juego', () => {
    expect([0, 1, 4].map((dadas) => monedasPorAcierto(true, dadas))).toEqual([1, 1, 1]);
    expect(monedasPorAcierto(true, 5)).toBe(0);
    expect(monedasPorAcierto(false, 0)).toBe(0);
  });

  test('terminar un juego da 3 la primera vez y 2 al repetirlo; el cofre, 10 con regalo y 20 sin él', () => {
    expect([monedasAlTerminar(true), monedasAlTerminar(false)]).toEqual([3, 2]);
    expect([monedasDelCofre(true), monedasDelCofre(false)]).toEqual([10, 20]);
  });

  test('las frases que dicen el número con palabras siguen cuadrando', () => {
    // «¡tres monedas!» (regalo del día) y «diez monedas» (cumpleaños), en escenas/zonas.ts.
    expect([MONEDAS.regaloDelDia, MONEDAS.cumple]).toEqual([3, 10]);
  });
});

describe('ganar y gastar', () => {
  test('ganar suma a las que tiene y al total, sin cambiar el monedero de antes', () => {
    const antes = { coins: 4, coinsTot: 10 };
    expect(ganar(antes, 3)).toEqual({ coins: 7, coinsTot: 13 });
    expect(antes).toEqual({ coins: 4, coinsTot: 10 });
    expect(ganar({}, 2)).toEqual({ coins: 2, coinsTot: 2 });
    expect(ganar(antes, 0)).toEqual(antes);
    expect(ganar(antes, -3)).toEqual(antes);
  });

  test('gastar resta solo de las que tiene; alcanza dice si llegan', () => {
    expect(gastar({ coins: 30, coinsTot: 50 }, 12)).toEqual({ coins: 18 });
    expect([alcanza(10, 10), alcanza(9, 10), alcanza(40, 10)]).toEqual([true, false, true]);
  });
});
