// Pruebas de las reglas del progreso por letra (src/dominio/letras.ts, fase L7 de docs/PLAN-LECTURA.md): lo que lleva
// el niño de cada letra (juegos de su casita y aciertos) y su estado (sin empezar, en camino, aprendida o le cuesta);
// y que los juegos de la isla que siempre aciertan no entran en el repaso. Sin navegador: cada prueba inventa lo jugado.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (juegos, aciertos, fallos):
   leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import { PROGRESO_LETRA, aciertosLetra, datosLetra, estadoLetra } from '../../src/dominio/letras.ts';
import { NOREP } from '../../src/dominio/repaso.ts';

describe('lo que lleva el niño de una letra', () => {
  test('cuenta los juegos terminados de su casita y suma los aciertos y fallos solo de sus juegos', () => {
    const gs = {
      'L4-M#0': { ok: 3, err: 1 },
      'L4-M#2': { ok: 2, err: 0 },
      'L4-P#0': { ok: 9, err: 9 },
      'L4-M#9': { ok: 5, err: 5 },
    };
    expect(datosLetra('L4-M', 7, { 0: 1, 2: 3 }, gs)).toEqual({ hechos: 2, total: 7, ok: 5, err: 1 });
    expect(datosLetra('L5-R', 7, {}, {})).toEqual({ hechos: 0, total: 7, ok: 0, err: 0 });
  });

  test('el porcentaje de aciertos, redondeado, o null sin intentos', () => {
    expect(aciertosLetra({ hechos: 1, total: 4, ok: 2, err: 1 })).toBe(67);
    expect(aciertosLetra({ hechos: 1, total: 4, ok: 0, err: 0 })).toBeNull();
  });
});

describe('cómo va cada letra', () => {
  test('los números de las reglas', () => {
    expect(PROGRESO_LETRA).toEqual({ intentos: 5, aprendida: 0.8, cuesta: 0.6 });
  });

  test('sin juegos terminados está sin empezar, aunque tenga intentos', () => {
    expect(estadoLetra({ hechos: 0, total: 4, ok: 0, err: 0 })).toBe('sinEmpezar');
    expect(estadoLetra({ hechos: 0, total: 4, ok: 1, err: 2 })).toBe('sinEmpezar');
  });

  test('con la casita terminada y pocos intentos o el 80 % de aciertos, aprendida', () => {
    expect(estadoLetra({ hechos: 4, total: 4, ok: 2, err: 0 })).toBe('aprendida');
    expect(estadoLetra({ hechos: 4, total: 4, ok: 8, err: 2 })).toBe('aprendida');
    expect(estadoLetra({ hechos: 4, total: 4, ok: 7, err: 3 })).toBe('enCamino');
  });

  test('con 5 intentos o más y menos del 60 % de aciertos, le cuesta (también con la casita terminada)', () => {
    expect(estadoLetra({ hechos: 4, total: 4, ok: 2, err: 3 })).toBe('cuesta');
    expect(estadoLetra({ hechos: 1, total: 4, ok: 1, err: 3 })).toBe('enCamino');
    expect(estadoLetra({ hechos: 2, total: 4, ok: 3, err: 2 })).toBe('enCamino');
  });
});

describe('las letras en el repaso del día', () => {
  test('los juegos de la isla que solo son de mirar, escuchar o trazar no se repasan; los de elegir, sí', () => {
    for (const t of [
      'conocerLetra',
      'conocerVocales',
      'trazaLetra',
      'huellasLetra',
      'pizarra',
      'miNombre',
      'trenLetra',
      'palmas',
      'cancionAbc',
    ])
      expect(NOREP).toContain(t);
    for (const t of ['buscaLetra', 'atrapaLetra', 'uneLetras', 'leoYElijo', 'silabaFalta', 'frase'])
      expect(NOREP).not.toContain(t);
  });
});
