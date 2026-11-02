// Pruebas de las palabras de la Isla del Inglés (src/contenido/ingles.ts, fase I1 de docs/PLAN-INGLES.md): que cada
// palabra tenga dibujo, que no se repitan dentro de un conjunto, que cada conjunto tenga palabras para los 3 años y esté
// en una zona de la isla, y que Polly tenga su dibujo. Un error aquí es una palabra mal escrita: el mensaje dice cuál.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (edades, mínimos de palabras):
   leerlos tal cual es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import { PALABRAS_INGLES, ZONA_DE_CONJUNTO, conjuntosDeZona, palabrasDeEdad } from '../../src/contenido/ingles.ts';
import { ZONAS_INGLES } from '../../src/dominio/apertura.ts';
import { PICS, POLLY_SVG } from '../../src/dibujos/todos.ts';

describe('palabras de la Isla del Inglés', () => {
  test('cada palabra tiene su dibujo, su traducción y una edad de 3 a 5', () => {
    for (const [c, ws] of Object.entries(PALABRAS_INGLES)) {
      for (const w of ws) {
        expect(PICS, `dibujo ${w.k} de ${w.en} (${c})`).toHaveProperty(w.k);
        expect(w.es.length, `traducción de ${w.en} (${c})`).toBeGreaterThan(0);
        expect([3, 4, 5], `edad de ${w.en} (${c})`).toContain(w.a);
        expect(w.en[0], `${w.en} empieza en mayúscula`).toBe(w.en[0]?.toUpperCase());
      }
    }
  });

  test('no se repiten palabras ni dibujos dentro de un conjunto', () => {
    for (const [c, ws] of Object.entries(PALABRAS_INGLES)) {
      expect(new Set(ws.map((w) => w.en)).size, `palabras de ${c}`).toBe(ws.length);
      expect(new Set(ws.map((w) => w.k)).size, `dibujos de ${c}`).toBe(ws.length);
    }
  });

  test('cada conjunto tiene al menos 4 palabras a los 3 años y está en una zona de la isla', () => {
    for (const c of Object.keys(PALABRAS_INGLES)) {
      expect(palabrasDeEdad(c, 3).length, `palabras de 3 años en ${c}`).toBeGreaterThanOrEqual(4);
      expect(ZONAS_INGLES, `zona de ${c}`).toContain(ZONA_DE_CONJUNTO[c]);
    }
    expect(Object.keys(ZONA_DE_CONJUNTO).sort()).toEqual(Object.keys(PALABRAS_INGLES).sort());
  });

  test('las palabras de cada edad incluyen las de antes, y los animales de la granja dicen algo', () => {
    expect(palabrasDeEdad('fruit', 5).length).toBeGreaterThan(palabrasDeEdad('fruit', 3).length);
    expect(palabrasDeEdad('nada', 5)).toEqual([]);
    for (const w of PALABRAS_INGLES['farm'] ?? []) expect(w.dice, `lo que dice ${w.en}`).toBeTruthy();
    expect(conjuntosDeZona('playaHello')).toEqual(['family', 'body', 'toys', 'fruit']);
  });

  test('Polly tiene su dibujo', () => {
    expect(POLLY_SVG).toContain('<path');
  });
});
