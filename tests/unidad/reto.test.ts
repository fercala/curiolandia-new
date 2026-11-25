// Pruebas de las reglas del modo reto (src/dominio/reto.ts, idea 32 de docs/IDEAS-MEJORA.md): cuándo se abre, más
// opciones y rondas, y las estrellas doradas con sus monedas.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { RETO_MONEDAS, apuntarReto, doradasDe, registroReto, retoAbierto, rondasReto } from '../../src/dominio/reto.ts';
import { rondas } from '../../src/dominio/dificultad.ts';

describe('el modo reto', () => {
  test('solo se abre con todos los juegos de la casita terminados', () => {
    expect(retoAbierto({ 0: 1, 1: 2 }, 2)).toBe(true);
    expect(retoAbierto({ 0: 1 }, 2)).toBe(false);
    expect(retoAbierto(undefined, 0)).toBe(false);
  });
  test('tiene una ronda más que la dificultad más alta', () => {
    [3, 4, 5].forEach((e) => expect(rondasReto(e)).toBe(rondas(e, 2) + 1));
  });
  test('la estrella dorada se apunta una vez y da monedas solo la primera', () => {
    const a = apuntarReto({}, 'otono', 2);
    expect(a.nueva).toBe(true);
    expect(a.monedas).toBe(RETO_MONEDAS);
    const b = apuntarReto(a.reg, 'otono', 2);
    expect(b.nueva).toBe(false);
    expect(b.monedas).toBe(0);
    expect(doradasDe(apuntarReto(b.reg, 'otono', 0).reg, 'otono')).toEqual([0, 2]);
    expect(registroReto({ otono: [1, -1, 'a'], mal: 3 })).toEqual({ otono: [1] });
  });
});
