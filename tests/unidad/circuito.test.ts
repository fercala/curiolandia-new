// Pruebas de las reglas del circuito de psicomotricidad del patio (src/dominio/circuito.ts, fase P13b de
// docs/IDEAS-MEJORA.md): los obstáculos y sus frases, las vueltas según la edad y lo que dice la profe. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { CIRCUITO, OBSTACULOS, frasesDelOrden, obstaculo, planCircuito } from '../../src/dominio/circuito.ts';

// azarDe(semilla): un azar de prueba que siempre da la misma serie para la misma semilla.
const azarDe = (semilla: number) => {
  let s = semilla;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

describe('el circuito', () => {
  test('cinco obstáculos con ids distintos, cada uno con su acción y sus tres frases enteras', () => {
    expect(new Set(OBSTACULOS.map((o) => o.id)).size).toBe(5);
    OBSTACULOS.forEach((o) => {
      // la acción es una exclamación entera: acepta "¡Por dentro del túnel!" y rechaza "por dentro del túnel"
      // (probar en https://regex101.com/?regex=%5E%C2%A1.%2B!%24)
      expect(o.accion).toMatch(/^¡.+!$/);
      expect(o.primero.startsWith('Primero, ')).toBe(true);
      expect(o.despues.startsWith('Después, ')).toBe(true);
      expect(o.alFinal.startsWith('Y al final, ')).toBe(true);
    });
    expect(obstaculo('tunel')?.nombre).toBe('El túnel');
    expect(obstaculo('nada')).toBeUndefined();
  });

  test('las vueltas tienen los obstáculos de la edad, sin repetir, y no empiezan como la anterior', () => {
    [3, 4, 5].forEach((edad) =>
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((semilla) => {
        const plan = planCircuito(edad, azarDe(semilla));
        expect(plan).toHaveLength(CIRCUITO.vueltas);
        plan.forEach((vuelta, i) => {
          expect(vuelta).toHaveLength(CIRCUITO.largo[edad] ?? 0);
          expect(new Set(vuelta).size).toBe(vuelta.length);
          vuelta.forEach((id) => expect(obstaculo(id)).toBeDefined());
          if (i > 0) expect(vuelta[0]).not.toBe(plan[i - 1]![0]);
        });
      }),
    );
  });

  test('la profe dice primero, después y al final', () => {
    expect(frasesDelOrden(['tunel', 'banco'])).toEqual(['Primero, el túnel.', 'Y al final, el banco.']);
    expect(frasesDelOrden(['aros', 'conos', 'colchoneta', 'tunel'])).toEqual([
      'Primero, los aros.',
      'Después, los conos.',
      'Después, la colchoneta.',
      'Y al final, el túnel.',
    ]);
  });
});
