// Pruebas de las reglas del rincón de construcciones (src/dominio/bloques.ts, fase P27 de docs/IDEAS-MEJORA.md): qué
// se sostiene, poner bloques, los retos de copiar, la casa y contar según la edad, y leer lo guardado del jardín. Sin
// navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  BLOQUES,
  casaLista,
  leeJardin,
  paredes,
  planCasa,
  planContar,
  planCopiar,
  poner,
  siguienteCopia,
  sostiene,
  type Torres,
} from '../../src/dominio/bloques.ts';

// azarDe(semilla): un azar de prueba que siempre da la misma serie para la misma semilla.
const azarDe = (semilla: number) => {
  let s = semilla;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};
const vacio: Torres = [[], [], []];

describe('el rincón de construcciones', () => {
  test('encima del cono y de la esfera no se sostiene nada; encima del cubo, sí', () => {
    expect(sostiene([])).toBe(true);
    expect(sostiene(['cubo'])).toBe(true);
    expect(sostiene(['cubo', 'cono'])).toBe(false);
    expect(sostiene(['esfera'])).toBe(false);
  });

  test('poner: se pone, rueda o no cabe, sin cambiar las torres de antes', () => {
    const a = poner(vacio, 1, 'cubo');
    expect(a.r).toBe('puesto');
    expect(a.torres[1]).toEqual(['cubo']);
    expect(vacio[1]).toEqual([]);
    const b = poner(poner(a.torres, 1, 'esfera').torres, 1, 'cubo');
    expect(b.r).toBe('rueda');
    expect(b.torres[1]).toEqual(['cubo', 'esfera']);
    const lleno: Torres = [[], Array(BLOQUES.alto).fill('cubo'), []];
    expect(poner(lleno, 1, 'cubo').r).toBe('lleno');
  });

  test('copiar: el modelo crece con la edad, sin dos iguales seguidos y con el cono o la esfera solo arriba', () => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((s) => {
      const m = planCopiar(5, azarDe(s));
      expect(m).toHaveLength(4);
      m.slice(0, -1).forEach((f, i) => {
        expect(['cono', 'esfera']).not.toContain(f);
        if (i) expect(f).not.toBe(m[i - 1]);
      });
    });
    expect(planCopiar(3, azarDe(1))).toHaveLength(2);
    expect(siguienteCopia(['cubo', 'arco'], ['cubo'])).toBe('arco');
    expect(siguienteCopia(['cubo', 'arco'], ['cubo', 'arco'])).toBeNull();
  });

  test('la casa: las paredes se levantan por igual y está lista con el tejado', () => {
    expect(planCasa(4, azarDe(3)).alto).toBe(2);
    expect(paredes(vacio)).toBe(0);
    expect(paredes([['cubo'], [], []])).toBe(2);
    expect(paredes([['cubo'], [], ['cubo']])).toBe(0);
    expect(casaLista([['cubo'], [], ['cilindro']], 1)).toBe(false);
    expect(casaLista([['cubo'], ['tejado'], ['cilindro']], 1)).toBe(true);
    expect(casaLista([['cubo'], ['tejado'], ['cilindro']], 2)).toBe(false);
  });

  test('contar: la respuesta está entre las tres opciones, en orden y de 1 a 6; con 5 años, una forma de la torre', () => {
    [1, 2, 3, 4, 5, 6].forEach((s) => {
      const p = planContar(4, azarDe(s));
      expect(p.cuenta).toBe('todos');
      expect(p.respuesta).toBe(p.torre.length);
      expect(p.opciones).toContain(p.respuesta);
      expect(new Set(p.opciones).size).toBe(p.opciones.length);
      expect([...p.opciones].sort((a, b) => a - b)).toEqual(p.opciones);
      p.opciones.forEach((o) => expect(o >= 1 && o <= 6).toBe(true));
      const q = planContar(5, azarDe(s));
      expect(q.torre).toContain(q.cuenta);
      expect(q.respuesta).toBe(q.torre.filter((f) => f === q.cuenta).length);
    });
  });

  test('el jardín: lo guardado se lee sano; si falta, está vacío o roto, no hay nada', () => {
    expect(leeJardin({ jardin: [['cubo', 'xx'], [], ['cono']] })).toEqual([['cubo'], [], ['cono']]);
    expect(leeJardin(undefined)).toBeNull();
    expect(leeJardin({ jardin: [[], [], []] })).toBeNull();
    expect(leeJardin({ jardin: 'roto' })).toBeNull();
  });
});
