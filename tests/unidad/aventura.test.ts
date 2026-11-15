// Pruebas de las reglas de la gran aventura de Tito (src/dominio/aventura.ts, fase P16 de docs/IDEAS-MEJORA.md): los
// capítulos en orden, uno nuevo cada día, lo guardado (S.aventura), lo que da terminar uno y, desde la P16b, el gran
// tesoro. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  AVENTURA,
  estadoCapitulo,
  premioFinal,
  registroAventura,
  terminarCapitulo,
} from '../../src/dominio/aventura.ts';

const ORDEN = ['c1', 'c2', 'c3'];

describe('la gran aventura de Tito', () => {
  test('un registro roto o de una partida de antes se lee vacío', () => {
    expect(registroAventura(undefined)).toEqual({ hechos: [], d: '' });
    expect(registroAventura({ hechos: ['c1', 3, 'c1', 'c2'], d: 5 })).toEqual({ hechos: ['c1', 'c2'], d: '' });
  });

  test('al empezar, solo el primer capítulo está abierto', () => {
    const reg = registroAventura({});
    expect(ORDEN.map((c) => estadoCapitulo(reg, ORDEN, c, '2026-11-15'))).toEqual(['abierto', 'cerrado', 'cerrado']);
    expect(estadoCapitulo(reg, ORDEN, 'nada', '2026-11-15')).toBe('cerrado');
  });

  test('un capítulo nuevo cada día: el siguiente es para mañana y se abre al día siguiente', () => {
    const r1 = terminarCapitulo(registroAventura({}), ORDEN, 'c1', '2026-11-15');
    expect(r1).toMatchObject({ nuevo: true, monedas: AVENTURA.monedas, completa: false });
    expect(ORDEN.map((c) => estadoCapitulo(r1.registro, ORDEN, c, '2026-11-15'))).toEqual([
      'hecho',
      'manana',
      'cerrado',
    ]);
    // hoy no se puede terminar el siguiente: no cambia nada
    expect(terminarCapitulo(r1.registro, ORDEN, 'c2', '2026-11-15')).toMatchObject({ nuevo: false, monedas: 0 });
    expect(estadoCapitulo(r1.registro, ORDEN, 'c2', '2026-11-16')).toBe('abierto');
  });

  test('repetir uno hecho no da monedas; con el último, la temporada está completa', () => {
    let reg = terminarCapitulo(registroAventura({}), ORDEN, 'c1', '2026-11-15').registro;
    expect(terminarCapitulo(reg, ORDEN, 'c1', '2026-11-16')).toMatchObject({ nuevo: false, monedas: 0 });
    reg = terminarCapitulo(reg, ORDEN, 'c2', '2026-11-16').registro;
    const r3 = terminarCapitulo(reg, ORDEN, 'c3', '2026-11-17');
    expect(r3).toMatchObject({ nuevo: true, monedas: 3, completa: true });
    expect(r3.registro).toEqual({ hechos: ['c1', 'c2', 'c3'], d: '2026-11-17' });
    expect(terminarCapitulo(r3.registro, ORDEN, 'c2', '2026-11-18').completa).toBe(true);
  });

  test('el gran tesoro: el sombrero de pirata o, si ya se tiene, monedas', () => {
    expect(premioFinal(false)).toEqual({ regalo: 'sombreroPirata', monedas: 0 });
    expect(premioFinal(true)).toEqual({ regalo: null, monedas: AVENTURA.tesoro });
  });
});
