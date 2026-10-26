// Pruebas de las reglas del repaso diario (src/dominio/repaso.ts, fase 3d): qué juegos se pueden repasar, cuáles
// cuestan, cuáles hace más tiempo que no se juegan, cómo se eligen los 3 del día, cuándo hay que volver a armarlo,
// cuándo está terminado y cuándo toca, los juegos recientes de cada habilidad y, desde la fase 4b, lo que se apunta al
// terminar un juego (la fecha y el juego del repaso hecho) y, desde la 4c, cómo suma cada intento. Sin navegador: cada
// prueba inventa los temas, lo jugado y los resultados.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (aciertos, fallos, estrellas):
   leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import type { DatosRepaso, TemaRepasable } from '../../src/dominio/repaso.ts';
import {
  NOREP, REPASO, caducado, conFecha, conHecho, conIntento, conJuegoReciente, elegirRepaso, masAntiguos, queCuestan,
  repasable, terminado, toca,
} from '../../src/dominio/repaso.ts';

const HOY = '2026-10-25';

// Tres temas: A tiene un cuento (A#1, no se repasa), C tiene un juego sin jugar (C#1).
const TEMAS: TemaRepasable[] = [
  { id: 'A', games: [{ t: 'elige' }, { t: 'cuento' }, { t: 'cuenta' }] },
  { id: 'B', games: [{ t: 'elige' }, { t: 'parejas' }] },
  { id: 'C', games: [{ t: 'elige' }, { t: 'elige' }] },
];
const JUGADOS: Record<string, Record<string, number>> = { A: { 0: 1, 1: 1, 2: 1 }, B: { 0: 1, 1: 1 }, C: { 0: 1 } };

// datos(cambios): los datos de una partida de prueba, con lo que se cambie encima.
function datos(cambios: Partial<DatosRepaso> = {}): DatosRepaso {
  return {
    stats: {
      contar: { ok: 1, err: 4 }, colores: { ok: 2, err: 2 }, formas: { ok: 1, err: 1 }, letras: { ok: 9, err: 1 },
    },
    kg: { contar: ['A#1', 'B#1', 'A#0'], colores: ['B#1', 'A#2'] },
    gs: {
      'A#0': { ok: 0, err: 3, d: '2026-10-20' }, 'A#2': { ok: 3, err: 0, d: '2026-10-24' },
      'B#1': { ok: 1, err: 2, d: '2026-10-20' }, 'C#0': { ok: 1, err: 1, d: '2026-10-22' },
    },
    temas: TEMAS,
    tema: (id) => TEMAS.find((t) => t.id === id),
    jugados: (id) => JUGADOS[id] ?? {},
    ...cambios,
  };
}

// Sin nada que cueste: ni estadísticas ni resultados por juego.
const SIN_FALLOS = datos({ stats: {}, gs: {} });

describe('qué se repasa', () => {
  test('los números de las reglas y los tipos de juego que no se repasan', () => {
    expect(REPASO).toEqual({ juegos: 3, aciertos: 0.7, intentosHabilidad: 4, intentosJuego: 3, recientes: 6, estrellas: 6 });
    expect(NOREP).toContain('cuento');
    expect(NOREP).toContain('cancion');
  });

  test('un juego se repasa si existe, es de un tipo con aciertos y ya se ha jugado', () => {
    const d = datos();
    expect(['A#0', 'A#1', 'A#2', 'C#1', 'C#5', 'X#0'].map((id) => repasable(d, id))).toEqual([true, false, true, false, false, false]);
  });
});

describe('qué cuesta y qué hace más que no se juega', () => {
  test('primero las habilidades que cuestan (de peor a mejor), después los juegos, sin repetir', () => {
    // contar (20 %) → B#1 (A#1 es un cuento); colores (50 %) → A#2 (B#1 ya está); formas tiene pocos intentos.
    // Juegos: A#0 (0 %); B#1 (33 %) ya está; C#0 tiene pocos intentos.
    expect(queCuestan(datos())).toEqual(['B#1', 'A#2', 'A#0']);
    expect(queCuestan(SIN_FALLOS)).toEqual([]);
  });

  test('los más antiguos primero; sin fecha, antes que ninguno; con la misma fecha, en el orden de los temas', () => {
    expect(masAntiguos(datos())).toEqual(['B#0', 'A#0', 'B#1', 'C#0', 'A#2']);
  });
});

describe('los juegos del día', () => {
  test('hasta 3 que cuestan', () => {
    expect(elegirRepaso(['B#1', 'A#2', 'A#0', 'C#0'], [])).toEqual({ list: ['B#1', 'A#2', 'A#0'], weak: 3 });
  });

  test('si faltan, los más antiguos de temas distintos', () => {
    expect(elegirRepaso([], ['B#0', 'A#0', 'B#1', 'C#0', 'A#2'])).toEqual({ list: ['B#0', 'A#0', 'C#0'], weak: 0 });
  });

  test('si aún faltan, cualquiera de los antiguos', () => {
    expect(elegirRepaso(['A#0'], ['A#2', 'A#0', 'B#1'])).toEqual({ list: ['A#0', 'B#1', 'A#2'], weak: 1 });
    expect(elegirRepaso([], [])).toEqual({ list: [], weak: 0 });
  });
});

describe('cuándo se rehace, cuándo está terminado y cuándo toca', () => {
  test('se rehace si no hay, si es de otro día, si ahora algo cuesta o si estaba vacío y ya hay juegos', () => {
    const d = datos();
    expect(caducado(null, HOY, d)).toBe(true);
    expect(caducado({ d: '2026-10-24', list: ['A#0'], done: {}, weak: 1 }, HOY, d)).toBe(true);
    expect(caducado({ d: HOY, list: ['B#0'], done: {}, weak: 0 }, HOY, d)).toBe(true);
    expect(caducado({ d: HOY, list: ['B#0'], done: { 'B#0': 1 }, weak: 0 }, HOY, d)).toBe(false);
    expect(caducado({ d: HOY, list: ['A#0'], done: {}, weak: 1 }, HOY, d)).toBe(false);
    expect(caducado({ d: HOY, list: [], done: {}, weak: 0 }, HOY, SIN_FALLOS)).toBe(true);
    expect(caducado({ d: HOY, list: ['A#0'], done: {}, weak: 0 }, HOY, SIN_FALLOS)).toBe(false);
  });

  test('está terminado si es de hoy, tiene juegos y están todos hechos', () => {
    expect(terminado({ d: HOY, list: ['A#0', 'B#0'], done: { 'A#0': 1, 'B#0': 1 } }, HOY)).toBe(true);
    expect(terminado({ d: HOY, list: ['A#0', 'B#0'], done: { 'A#0': 1 } }, HOY)).toBe(false);
    expect(terminado({ d: '2026-10-24', list: ['A#0'], done: { 'A#0': 1 } }, HOY)).toBe(false);
    expect(terminado({ d: HOY, list: [], done: {} }, HOY)).toBe(false);
    expect(terminado(null, HOY)).toBe(false);
  });

  test('toca con 6 estrellas o más, sin terminar y con algo que cuesta', () => {
    const d = datos();
    expect(toca(5, null, HOY, d)).toBe(false);
    expect(toca(6, null, HOY, d)).toBe(true);
    expect(toca(6, { d: HOY, list: ['A#0'], done: { 'A#0': 1 } }, HOY, d)).toBe(false);
    expect(toca(6, null, HOY, SIN_FALLOS)).toBe(false);
  });
});

describe('juegos recientes de cada habilidad', () => {
  test('el juego pasa al principio sin repetirse y se guardan como mucho 6', () => {
    const lista = ['A#0', 'B#0'];
    const igual = conJuegoReciente(lista, 'A#0');
    expect(igual).toEqual(lista);
    expect(igual).not.toBe(lista);
    expect(conJuegoReciente(['A#0', 'B#0', 'C#0'], 'C#0')).toEqual(['C#0', 'A#0', 'B#0']);
    expect(conJuegoReciente(['1', '2', '3', '4', '5', '6'], 'X')).toEqual(['X', '1', '2', '3', '4', '5']);
    expect(conJuegoReciente([], 'A#0')).toEqual(['A#0']);
  });
});

// Fase 4b: lo que apunta el repaso al terminar un juego.
describe('al terminar un juego', () => {
  test('conFecha pone hoy como último día jugado; si no había resultado, empieza sin aciertos ni fallos', () => {
    const r = { ok: 3, err: 1, d: '2026-10-01' };
    expect(conFecha(r, HOY)).toEqual({ ok: 3, err: 1, d: HOY });
    expect(r.d).toBe('2026-10-01');
    expect(conFecha(undefined, HOY)).toEqual({ ok: 0, err: 0, d: HOY });
  });

  test('conHecho marca hecho un juego del repaso del día; si no está en la lista, el mismo repaso', () => {
    const R = { d: HOY, list: ['A#0', 'B#1'], done: { 'A#0': 1 }, weak: 1 };
    expect(conHecho(R, 'B#1')).toEqual({ ...R, done: { 'A#0': 1, 'B#1': 1 } });
    expect(R.done).toEqual({ 'A#0': 1 });
    expect(conHecho(R, 'C#0')).toBe(R);
  });
});

// Fase 4c: cada acierto o fallo suma un intento.
describe('apuntar un intento', () => {
  test('conIntento suma un acierto o un fallo, conserva lo demás y no cambia el resultado que recibe', () => {
    const r = { ok: 3, err: 1, d: '2026-10-01' };
    expect(conIntento(r, true)).toEqual({ ok: 4, err: 1, d: '2026-10-01' });
    expect(conIntento(r, 0)).toEqual({ ok: 3, err: 2, d: '2026-10-01' });
    expect(r).toEqual({ ok: 3, err: 1, d: '2026-10-01' });
  });
});
