// Pruebas del caso de uso «el repaso del día» (src/aplicacion/repasoDelDia.ts, fase 4c): qué se apunta de cada acierto
// o fallo (en un juego o fuera), cuándo hay que preparar otra vez el repaso y cómo queda el nuevo, si toca repasar, si
// está terminado y si el botón verde pasa hoy por el repaso, sin cambiar la partida que recibe. Sin navegador: cada
// prueba inventa la partida y los temas (los mismos que tests/unidad/repaso.test.ts).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (aciertos, fallos, estrellas):
   leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import type { CatalogoDeTemas, PartidaDeRepaso } from '../../src/aplicacion/repasoDelDia.ts';
import {
  apuntarResultado, nuevoRepaso, repasoCaducado, repasoTerminado, seguirPorElRepaso, tocaRepasar,
} from '../../src/aplicacion/repasoDelDia.ts';
import type { TemaRepasable } from '../../src/dominio/repaso.ts';

const HOY = '2026-10-25';

// Tres temas: A tiene un cuento (A#1, no se repasa), C tiene un juego sin jugar (C#1).
const TEMAS: TemaRepasable[] = [
  { id: 'A', games: [{ t: 'elige' }, { t: 'cuento' }, { t: 'cuenta' }] },
  { id: 'B', games: [{ t: 'elige' }, { t: 'parejas' }] },
  { id: 'C', games: [{ t: 'elige' }, { t: 'elige' }] },
];
const CATALOGO: CatalogoDeTemas = { lista: TEMAS, tema: (id) => TEMAS.find((t) => t.id === id) };

// partida(cambios): una partida de prueba: B#1, A#2 y A#0 cuestan; lo más antiguo es B#0.
function partida(cambios: Partial<PartidaDeRepaso> = {}): PartidaDeRepaso {
  return {
    stats: { contar: { ok: 1, err: 4 }, colores: { ok: 2, err: 2 }, formas: { ok: 1, err: 1 }, letras: { ok: 9, err: 1 } },
    kg: { contar: ['A#1', 'B#1', 'A#0'], colores: ['B#1', 'A#2'] },
    gs: {
      'A#0': { ok: 0, err: 3, d: '2026-10-20' }, 'A#2': { ok: 3, err: 0, d: '2026-10-24' },
      'B#1': { ok: 1, err: 2, d: '2026-10-20' }, 'C#0': { ok: 1, err: 1, d: '2026-10-22' },
    },
    temas: { A: { g: { 0: 1, 1: 1, 2: 1 } }, B: { g: { 0: 1, 1: 1 } }, C: { g: { 0: 1 } } },
    ...cambios,
  };
}

describe('apuntar un acierto o un fallo', () => {
  test('fuera de un juego, solo en la habilidad', () => {
    expect(apuntarResultado(partida(), 'contar', null, true)).toEqual({ stats: { ...partida().stats, contar: { ok: 2, err: 4 } } });
    expect(apuntarResultado(partida(), 'nueva', null, false).stats['nueva']).toEqual({ ok: 0, err: 1 });
  });

  test('en un juego, también en el juego y en los recientes de la habilidad', () => {
    const r = apuntarResultado(partida(), 'colores', 'C#0', false);
    expect(r.stats['colores']).toEqual({ ok: 2, err: 3 });
    expect(r.kg).toEqual({ contar: ['A#1', 'B#1', 'A#0'], colores: ['C#0', 'B#1', 'A#2'] });
    expect(r.gs?.['C#0']).toEqual({ ok: 1, err: 2, d: '2026-10-22' });
    // Un juego sin resultado empieza sin aciertos, sin fallos y sin fecha.
    expect(apuntarResultado(partida(), 'letras', 'B#0', true).gs?.['B#0']).toEqual({ ok: 1, err: 0, d: '' });
  });

  test('sin S.kg ni S.gs (partida vieja), empiezan vacíos; la partida no cambia', () => {
    const p = partida({ kg: undefined, gs: undefined });
    const copia = structuredClone(p);
    expect(apuntarResultado(p, 'contar', 'A#0', true)).toMatchObject({ kg: { contar: ['A#0'] }, gs: { 'A#0': { ok: 1, err: 0, d: '' } } });
    expect(p).toEqual(copia);
  });
});

describe('preparar el repaso de hoy', () => {
  test('hay que prepararlo si no hay o es de otro día; no, si el de hoy sigue valiendo', () => {
    expect(repasoCaducado(partida({ rep: null }), CATALOGO, HOY)).toBe(true);
    expect(repasoCaducado(partida({ rep: { d: '2026-10-24', list: ['A#0'], done: {}, weak: 1 } }), CATALOGO, HOY)).toBe(true);
    expect(repasoCaducado(partida({ rep: { d: HOY, list: ['A#0'], done: {}, weak: 1 } }), CATALOGO, HOY)).toBe(false);
  });

  test('el nuevo: hasta 3 que cuestan, sin hechos ni premio cobrado', () => {
    expect(nuevoRepaso(partida(), CATALOGO, HOY)).toEqual({ d: HOY, list: ['B#1', 'A#2', 'A#0'], done: {}, weak: 3, paid: 0, seen: 0 });
  });

  test('sin nada que cueste, los más antiguos de temas distintos', () => {
    expect(nuevoRepaso(partida({ stats: {}, gs: {} }), CATALOGO, HOY).list).toEqual(['A#0', 'B#0', 'C#0']);
  });
});

describe('cuándo toca y cuándo está hecho', () => {
  const pendiente = { d: HOY, list: ['B#1', 'A#2', 'A#0'], done: { 'B#1': 1 }, weak: 3 };

  test('toca con 6 estrellas o más, si algo cuesta y el de hoy no está terminado', () => {
    expect(tocaRepasar(partida({ rep: pendiente }), CATALOGO, HOY, 6)).toBe(true);
    expect(tocaRepasar(partida({ rep: pendiente }), CATALOGO, HOY, 5)).toBe(false);
    expect(tocaRepasar(partida({ rep: pendiente, stats: {}, gs: {} }), CATALOGO, HOY, 9)).toBe(false);
  });

  test('está terminado si están hechos todos los juegos del repaso de hoy', () => {
    const hecho = { ...pendiente, done: { 'B#1': 1, 'A#2': 1, 'A#0': 1 } };
    expect(repasoTerminado(partida({ rep: hecho }), HOY)).toBe(true);
    expect(tocaRepasar(partida({ rep: hecho }), CATALOGO, HOY, 9)).toBe(false);
    expect(repasoTerminado(partida({ rep: pendiente }), HOY)).toBe(false);
    expect(repasoTerminado(partida({ rep: null }), HOY)).toBe(false);
  });

  test('el botón verde pasa por el repaso si toca, una vez al día', () => {
    expect(seguirPorElRepaso(partida({ rep: pendiente }), CATALOGO, HOY, 6)).toBe(true);
    expect(seguirPorElRepaso(partida({ rep: { ...pendiente, seen: 1 } }), CATALOGO, HOY, 6)).toBe(false);
    expect(seguirPorElRepaso(partida({ rep: pendiente }), CATALOGO, HOY, 3)).toBe(false);
  });
});
