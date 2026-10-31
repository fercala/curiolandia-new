// Pruebas de las letras de la Isla de las Letras (src/contenido/letras.ts, fase L1 de docs/PLAN-LECTURA.md): que estén
// las 20 letras sin repetir y en sus zonas, que existan los dibujos de los amigos y las palabras, que cada palabra
// empiece por su letra y que los trazos estén dentro de la caja de la letra. Un error aquí es una letra mal escrita: el
// mensaje dice cuál.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (cuántas letras, límites de la
   caja): leerlos tal cual es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import { LETRAS, letra, letraEnPantalla, letrasDeZona } from '../../src/contenido/letras.ts';
import { ZONAS_LETRAS } from '../../src/dominio/apertura.ts';
import { PICS } from '../../src/dibujos/todos.ts';

// sinTildes(s): s en mayúsculas sin tildes ni diéresis (la Ñ se queda), para comparar la primera letra de una palabra.
const sinTildes = (s: string): string => s.toUpperCase().replace(/Ñ/g, '\u0000').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0000/g, 'Ñ');

describe('letras de la isla', () => {
  test('son 20, sin repetir, y cada una está en una zona de la isla', () => {
    expect(LETRAS).toHaveLength(20);
    expect(new Set(LETRAS.map((x) => x.l)).size).toBe(20);
    for (const x of LETRAS) expect(ZONAS_LETRAS, `zona de la ${x.l}`).toContain(x.zona);
    expect(letrasDeZona('playaSonidos').map((x) => x.l).join('')).toBe('AEIOU');
    expect(letra('Ñ')?.amigoDice).toBe('ñu');
    expect(letra('W')).toBeUndefined();
  });

  test('el amigo y las palabras tienen dibujo y empiezan por su letra', () => {
    for (const x of LETRAS) {
      for (const k of [x.amigo, ...x.palabras]) expect(PICS, `dibujo ${k} de la ${x.l}`).toHaveProperty(k);
      expect(sinTildes(x.amigoDice)[0], `amigo de la ${x.l}`).toBe(x.l);
      // Las claves de PICS no llevan tildes ni ñ, así que la de cada palabra empieza por la letra. La Ñ casi nunca va al
      // principio: sus palabras (piña, clave 'pina') la llevan dentro y no se comprueban así.
      if (x.l !== 'Ñ') for (const k of x.palabras) expect(sinTildes(k)[0], `palabra ${k} de la ${x.l}`).toBe(x.l);
    }
  });

  test('los trazos tienen al menos dos puntos y caben en la caja (la tilde de la Ñ, un poco por encima)', () => {
    for (const x of LETRAS) {
      expect(x.trazos.length, `trazos de la ${x.l}`).toBeGreaterThan(0);
      for (const t of x.trazos) {
        expect(t.length, `trazo de la ${x.l}`).toBeGreaterThanOrEqual(2);
        for (const [px, py] of t) {
          expect(px, `x de la ${x.l}`).toBeGreaterThanOrEqual(-0.01);
          expect(px, `x de la ${x.l}`).toBeLessThanOrEqual(1.01);
          expect(py, `y de la ${x.l}`).toBeGreaterThanOrEqual(-0.35);
          expect(py, `y de la ${x.l}`).toBeLessThanOrEqual(1.01);
        }
      }
    }
  });

  test('letraEnPantalla lleva un trazo de la caja a la pantalla', () => {
    expect(letraEnPantalla([[0, 0], [1, 0.5]], 600, 200, 400, 500)).toEqual([[600, 200], [1000, 450]]);
  });
});
