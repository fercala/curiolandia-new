// Pruebas de las reglas de la dificultad (src/dominio/dificultad.ts, fase 3e): la edad que cuenta, cuántas opciones y
// rondas tiene un juego según la edad, las repeticiones y la dificultad adaptativa, y cómo sube y baja esta. Sin
// navegador: cada prueba pasa la edad, la dificultad y las repeticiones.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (edades, repeticiones,
   aciertos): leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import type { Adaptacion } from '../../src/dominio/dificultad.ts';
import {
  EDAD_POR_DEFECTO, SIN_ADAPTAR, edadDe, opciones, repeticion, rondas, trasAcierto, trasDosFallos,
} from '../../src/dominio/dificultad.ts';

describe('edad y repeticiones', () => {
  test('sin edad elegida cuentan 3 años', () => {
    expect(EDAD_POR_DEFECTO).toBe(3);
    expect([edadDe(undefined), edadDe(0), edadDe(3), edadDe(4), edadDe(5)]).toEqual([3, 3, 3, 4, 5]);
  });

  test('las repeticiones cuentan hasta 2', () => {
    expect([repeticion(undefined), repeticion(0), repeticion(1), repeticion(2), repeticion(7)]).toEqual([0, 0, 1, 2, 2]);
  });
});

describe('opciones y rondas', () => {
  test('2 opciones a los 3 años y 3 a los 4 y 5', () => {
    expect([3, 4, 5].map((e) => opciones(e, 0, 0))).toEqual([2, 3, 3]);
  });

  test('la dificultad adaptativa y la repetición suman, entre 2 y 4', () => {
    expect([opciones(3, -1, 0), opciones(3, 1, 0), opciones(3, 0, 1), opciones(3, 1, 2)]).toEqual([2, 3, 3, 4]);
    expect([opciones(5, -1, 0), opciones(5, 1, 0), opciones(5, 1, 1), opciones(5, -1, 2)]).toEqual([2, 4, 4, 3]);
  });

  test('4 rondas a los 3 años y 5 después; una más desde la segunda repetición', () => {
    expect([3, 4, 5].map((e) => rondas(e, 0))).toEqual([4, 5, 5]);
    expect([rondas(3, 1), rondas(3, 2), rondas(5, 1), rondas(5, 2)]).toEqual([4, 5, 5, 6]);
  });
});

describe('dificultad adaptativa', () => {
  // aciertos(a, lista): la dificultad después de una serie de aciertos (true: a la primera).
  const aciertos = (a: Adaptacion, lista: boolean[]): Adaptacion => lista.reduce(trasAcierto, a);

  test('4 aciertos seguidos a la primera suben un punto y la racha vuelve a 0', () => {
    expect(aciertos(SIN_ADAPTAR, [true, true, true])).toEqual({ adapt: 0, racha: 3 });
    expect(aciertos(SIN_ADAPTAR, [true, true, true, true])).toEqual({ adapt: 1, racha: 0 });
  });

  test('un acierto que no es a la primera no cambia nada, ni corta la racha', () => {
    expect(aciertos(SIN_ADAPTAR, [true, false, true, false, true, true])).toEqual({ adapt: 1, racha: 0 });
  });

  test('no pasa de 1', () => {
    expect(aciertos({ adapt: 1, racha: 3 }, [true])).toEqual({ adapt: 1, racha: 0 });
  });

  test('fallar dos veces baja un punto, no pasa de -1 y corta la racha', () => {
    expect(trasDosFallos({ adapt: 1, racha: 2 })).toEqual({ adapt: 0, racha: 0 });
    expect(trasDosFallos({ adapt: -1, racha: 3 })).toEqual({ adapt: -1, racha: 0 });
  });

  test('las reglas no cambian la dificultad que reciben', () => {
    const a = { adapt: 0, racha: 3 };
    trasAcierto(a, true);
    trasAcierto(a, false);
    trasDosFallos(a);
    expect(a).toEqual({ adapt: 0, racha: 3 });
    expect(trasAcierto(a, false)).not.toBe(a);
  });
});
