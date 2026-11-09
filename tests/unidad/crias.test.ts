// Pruebas de las crías de la granja escuela (src/dominio/crias.ts), fase P9 de docs/IDEAS-MEJORA.md. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { CRIAS, criaPendiente, criaPorId, criasDe, etapaCria, familiasListas, nacer } from '../../src/dominio/crias.ts';

describe('crías de la granja', () => {
  test('ids distintos, tres nombres distintos cada una y nacen en orden', () => {
    expect(new Set(CRIAS.map((c) => c.id)).size).toBe(CRIAS.length);
    CRIAS.forEach((c) => expect(new Set(c.nombres).size).toBe(3));
    expect(CRIAS.map((c) => c.dia)).toEqual(CRIAS.map((c) => c.dia).sort((a, b) => a - b));
    expect(criaPorId('potro')?.nombreMadre).toBe('la yegua');
  });

  test('lo guardado roto se descarta', () => {
    expect(criasDe(undefined)).toEqual({});
    expect(criasDe({ pollito: { nombre: 'Pío', d: 2 }, gato: { nombre: 'X', d: 1 }, cordero: { nombre: '' } })).toEqual(
      {
        pollito: { nombre: 'Pío', d: 2 },
      },
    );
  });

  test('el primer día no nace nada; luego, de una en una, la que toca', () => {
    expect(criaPendiente(1, {})).toBeUndefined();
    expect(criaPendiente(2, {})?.id).toBe('pollito');
    const a = nacer({}, 'pollito', 'Pío', 2);
    expect(criaPendiente(2, a)).toBeUndefined();
    expect(criaPendiente(9, a)?.id).toBe('cordero');
    expect(nacer(a, 'pollito', 'Otro', 5)).toBe(a);
  });

  test('las crías crecen con los días de granja, y las familias salen con dos', () => {
    const c = { nombre: 'Pío', d: 2 };
    expect([2, 3, 4, 6, 7, 20].map((d) => etapaCria(d, c))).toEqual([0, 0, 1, 1, 2, 2]);
    expect(familiasListas(nacer({}, 'pollito', 'Pío', 2))).toBe(false);
    expect(familiasListas(nacer(nacer({}, 'pollito', 'Pío', 2), 'cordero', 'Rizos', 3))).toBe(true);
  });
});
