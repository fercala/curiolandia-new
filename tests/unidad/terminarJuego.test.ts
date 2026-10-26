// Pruebas del caso de uso «terminar un juego» (src/aplicacion/terminarJuego.ts, fase 4b): qué campos nuevos de la
// partida devuelve (progreso del tema, último día jugado, repaso del día), si era la primera vez, si se acaba de
// terminar el tema y cuántas monedas da, sin cambiar la partida que recibe. Sin navegador: cada prueba inventa la
// partida y el tema.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (veces jugado, aciertos,
   monedas): leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import type { PartidaDeJuegos } from '../../src/aplicacion/terminarJuego.ts';
import { terminarJuego } from '../../src/aplicacion/terminarJuego.ts';
import { MONEDAS } from '../../src/dominio/monedas.ts';

const HOY = '2026-10-25';
// Un tema de tres juegos.
const TEMA = { id: '3A-T1', games: [{ t: 'conocer' }, { t: 'busca' }, { t: 'memoria' }] };
const NORMAL = { hoy: HOY, delRepaso: false };

describe('terminar un juego', () => {
  test('la primera vez: cuenta el juego, apunta hoy y da las monedas de juego nuevo', () => {
    const p: PartidaDeJuegos = { temas: {}, gs: {} };
    const r = terminarJuego(p, TEMA, 1, NORMAL);
    expect(r).toEqual({
      partida: { temas: { '3A-T1': { g: { 1: 1 }, done: 0 } }, gs: { '3A-T1#1': { ok: 0, err: 0, d: HOY } } },
      primera: true, fin: false, monedas: MONEDAS.juegoNuevo,
    });
  });

  test('al repetirlo: suma una vez más, guarda aciertos y fallos y da las monedas de juego repetido', () => {
    const p: PartidaDeJuegos = { temas: { '3A-T1': { g: { 1: 1 }, done: 0 } }, gs: { '3A-T1#1': { ok: 4, err: 2, d: '2026-10-20' } } };
    const r = terminarJuego(p, TEMA, 1, NORMAL);
    expect(r.partida.temas['3A-T1']).toEqual({ g: { 1: 2 }, done: 0 });
    expect(r.partida.gs['3A-T1#1']).toEqual({ ok: 4, err: 2, d: HOY });
    expect([r.primera, r.fin, r.monedas]).toEqual([false, false, MONEDAS.juegoRepetido]);
  });

  test('con el último juego que faltaba, el tema queda terminado y fin es true; los demás temas siguen igual', () => {
    const otro = { g: { 0: 1 }, done: 0 };
    const p: PartidaDeJuegos = { temas: { '3A-T1': { g: { 0: 1, 1: 3 }, done: 0 }, '3A-T2': otro } };
    const r = terminarJuego(p, TEMA, 2, NORMAL);
    expect(r.partida.temas).toEqual({ '3A-T1': { g: { 0: 1, 1: 3, 2: 1 }, done: 1 }, '3A-T2': otro });
    expect([r.primera, r.fin]).toEqual([true, true]);
    // Sin S.gs (una partida muy vieja), empieza vacío.
    expect(r.partida.gs).toEqual({ '3A-T1#2': { ok: 0, err: 0, d: HOY } });
  });

  test('no cambia la partida que recibe', () => {
    const p: PartidaDeJuegos = { temas: { '3A-T1': { g: { 0: 1 }, done: 0 } }, gs: {}, rep: { d: HOY, list: ['3A-T1#0'], done: {} } };
    const copia = structuredClone(p);
    terminarJuego(p, TEMA, 0, { hoy: HOY, delRepaso: true });
    expect(p).toEqual(copia);
  });
});

describe('el repaso del día', () => {
  const rep = { d: HOY, list: ['3A-T1#0', '4B-T2#1'], done: {}, weak: 1 };

  test('un juego lanzado desde el repaso que está en su lista queda hecho', () => {
    const r = terminarJuego({ temas: {}, gs: {}, rep }, TEMA, 0, { hoy: HOY, delRepaso: true });
    expect(r.partida.rep).toEqual({ ...rep, done: { '3A-T1#0': 1 } });
  });

  test('si no se lanzó desde el repaso, o no hay repaso, el repaso no cambia (no sale en lo devuelto)', () => {
    expect(terminarJuego({ temas: {}, gs: {}, rep }, TEMA, 0, NORMAL).partida).not.toHaveProperty('rep');
    expect(terminarJuego({ temas: {}, gs: {}, rep: null }, TEMA, 0, { hoy: HOY, delRepaso: true }).partida).not.toHaveProperty('rep');
  });

  test('desde el repaso, un juego que no está en su lista deja el repaso igual', () => {
    expect(terminarJuego({ temas: {}, gs: {}, rep }, TEMA, 2, { hoy: HOY, delRepaso: true }).partida.rep).toBe(rep);
  });
});
