// Pruebas de las reglas de progreso y premios (src/dominio/progreso.ts, fase 3b): estrellas, temas terminados, casa de
// Tito, Pipo, habitaciones, niveles de la tienda, regalo del cofre y cumpleaños. Sin navegador: cada prueba inventa el
// progreso de los temas o lo que ya tiene el niño.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (temas, estrellas, meses):
   leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import {
  GIFTS, HOUSE_NEXT, PET_NEXT, esCumple, estrellas, etapaPipo, habitacionAbierta, nivelAbierto, nivelCasa,
  siguienteRegalo, temasTerminados,
} from '../../src/dominio/progreso.ts';

describe('estrellas y temas terminados', () => {
  test('una estrella por juego distinto terminado; los temas sin datos no cuentan', () => {
    const temas = { a: { g: { 0: 1, 1: 3 }, done: 1 }, b: { g: { 2: 1 } }, c: null, d: { done: 0 } };
    expect(estrellas(temas)).toBe(3);
    expect(temasTerminados(temas)).toBe(1);
    expect([estrellas({}), temasTerminados({})]).toEqual([0, 0]);
  });
});

describe('casa de Tito y Pipo', () => {
  test('la casa sube de nivel con 2, 5, 9 y 14 temas terminados', () => {
    expect(HOUSE_NEXT).toEqual([2, 5, 9, 14]);
    expect([0, 1, 2, 4, 5, 8, 9, 13, 14, 30].map(nivelCasa)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  test('Pipo crece con 4, 15, 35 y 70 estrellas', () => {
    expect(PET_NEXT).toEqual([4, 15, 35, 70]);
    expect([0, 3, 4, 14, 15, 34, 35, 69, 70, 200].map(etapaPipo)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });
});

describe('habitaciones y tienda', () => {
  test('una habitación se abre con sus temas terminados; las de 0, siempre', () => {
    expect(habitacionAbierta(0, 0)).toBe(true);
    expect(habitacionAbierta(3, 2)).toBe(false);
    expect(habitacionAbierta(3, 3)).toBe(true);
  });

  test('los niveles de la tienda: el 1 siempre, el 2 con 8 estrellas y el 3 con 20', () => {
    expect([nivelAbierto(1, 0), nivelAbierto(2, 7), nivelAbierto(2, 8), nivelAbierto(3, 19), nivelAbierto(3, 20)]).toEqual([true, false, true, false, true]);
    expect(nivelAbierto(9, 0)).toBe(true);
  });
});

describe('cofre', () => {
  const catalogo = [{ id: 'pelotaPlaya' }, { id: 'gorroFiesta' }, { id: 'cuadro' }];

  test('el regalo es el primero de GIFTS que está en la tienda y aún no se tiene', () => {
    expect(GIFTS.slice(0, 3)).toEqual(['gorroFiesta', 'pelotaPlaya', 'cuadro']);
    expect(siguienteRegalo(catalogo, {})?.id).toBe('gorroFiesta');
    expect(siguienteRegalo(catalogo, { gorroFiesta: 1 })?.id).toBe('pelotaPlaya');
    expect(siguienteRegalo(catalogo, { gorroFiesta: 1, pelotaPlaya: 1, cuadro: 1 })).toBeNull();
  });
});

describe('cumpleaños', () => {
  test('es el cumpleaños si coinciden el mes y el día guardados', () => {
    expect(esCumple({ m: 1, d: 29 }, 1, 29)).toBe(true);
    expect(esCumple({ m: 1, d: 29 }, 2, 1)).toBe(false);
    expect(esCumple(null, 1, 29)).toBe(false);
  });
});
