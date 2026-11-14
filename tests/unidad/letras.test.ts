// Pruebas de las letras de la Isla de las Letras (src/contenido/letras.ts, fase L1 de docs/PLAN-LECTURA.md): que estén
// las 20 letras sin repetir y en sus zonas, que existan los dibujos de los amigos y las palabras, que cada palabra
// empiece por su letra y que los trazos estén dentro de la caja de la letra (desde la fase L7b, también los de la
// minúscula), y desde la fase ID6a de docs/PLAN-IDIOMAS.md, lo mismo para las 23 letras del rumano (contenido/letrasRo.ts).
// Un error aquí es una letra mal escrita: el
// mensaje dice cuál.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (cuántas letras, límites de la
   caja): leerlos tal cual es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import { LETRAS, MINUS_CAJA, letra, letraEnPantalla, letrasDeZona } from '../../src/contenido/letras.ts';
import { LETRAS_RO } from '../../src/contenido/letrasRo.ts';
import { ZONAS_LETRAS } from '../../src/dominio/apertura.ts';
import { PICS } from '../../src/dibujos/todos.ts';

// sinTildes(s): s en mayúsculas sin tildes ni diéresis (la Ñ se queda), para comparar la primera letra de una palabra.
const sinTildes = (s: string): string =>
  s
    .toUpperCase()
    .replace(/Ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // oxlint-disable-next-line no-control-regex -- \u0000 es la marca que se pone a la Ñ mientras se quitan los acentos
    .replace(/\u0000/g, 'Ñ');

describe('letras de la isla', () => {
  test('son 20, sin repetir, y cada una está en una zona de la isla', () => {
    expect(LETRAS).toHaveLength(20);
    expect(new Set(LETRAS.map((x) => x.l)).size).toBe(20);
    for (const x of LETRAS) expect(ZONAS_LETRAS, `zona de la ${x.l}`).toContain(x.zona);
    expect(
      letrasDeZona('playaSonidos')
        .map((x) => x.l)
        .join(''),
    ).toBe('AEIOU');
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

  test('cada letra tiene los trazos de su minúscula, de al menos dos puntos y dentro de su caja (fase L7b)', () => {
    for (const x of LETRAS) {
      expect(x.minus.length, `minúscula de la ${x.l}`).toBeGreaterThan(0);
      for (const t of x.minus) {
        expect(t.length, `trazo de la ${x.l} minúscula`).toBeGreaterThanOrEqual(2);
        for (const [px, py] of t) {
          expect(px, `x de la ${x.l} minúscula`).toBeGreaterThanOrEqual(-0.01);
          expect(px, `x de la ${x.l} minúscula`).toBeLessThanOrEqual(1.01);
          expect(py, `y de la ${x.l} minúscula`).toBeGreaterThanOrEqual(-0.01);
          expect(py, `y de la ${x.l} minúscula`).toBeLessThanOrEqual(1.01);
        }
      }
    }
    // la a pequeña empieza arriba (en lo alto de las letras pequeñas) y se apoya en la línea de abajo
    const a = LETRAS[0]!.minus.flat();
    expect(Math.min(...a.map((p) => p[1]))).toBeCloseTo(MINUS_CAJA.x, 1);
    expect(Math.max(...a.map((p) => p[1]))).toBeCloseTo(MINUS_CAJA.base, 1);
  });

  test('letraEnPantalla lleva un trazo de la caja a la pantalla', () => {
    expect(
      letraEnPantalla(
        [
          [0, 0],
          [1, 0.5],
        ],
        600,
        200,
        400,
        500,
      ),
    ).toEqual([
      [600, 200],
      [1000, 450],
    ]);
  });
});

// Las letras de la isla en rumano (contenido/letrasRo.ts, fase ID6a de docs/PLAN-IDIOMAS.md).
describe('letras de la isla en rumano', () => {
  test('son 23, sin repetir, en sus zonas y en el orden de la isla', () => {
    expect(LETRAS_RO).toHaveLength(23);
    expect(new Set(LETRAS_RO.map((x) => x.l)).size).toBe(23);
    const zona = (z: string) =>
      LETRAS_RO.filter((x) => x.zona === z)
        .map((x) => x.l)
        .join('');
    expect(zona('playaSonidos')).toBe('AEIOUĂÎ');
    expect(zona('bosqueLetras')).toBe('MPLSTNDFB');
    expect(zona('puebloPalabras')).toBe('RCGVȘȚÂ');
  });

  test('los dibujos existen, no se repiten y el amigo empieza por su letra (o la lleva, si casi nunca va delante)', () => {
    const todos = LETRAS_RO.flatMap((x) => [x.amigo, ...x.palabras]);
    expect(new Set(todos).size, 'dibujos repetidos').toBe(todos.length);
    for (const x of LETRAS_RO) {
      for (const k of [x.amigo, ...x.palabras]) expect(PICS, `dibujo ${k} de la ${x.l}`).toHaveProperty(k);
      if ('ĂȚÂ'.includes(x.l)) expect(x.amigoDice, `amigo de la ${x.l}`).toContain(x.l.toLowerCase());
      else expect(x.amigoDice[0]?.toUpperCase(), `amigo de la ${x.l}`).toBe(x.l);
      expect(x.nombre).toBe(`litera ${x.l.toLowerCase()}`);
    }
  });

  test('las letras con signo llevan un trazo más, y caben (la coma de la Ș y la Ț, un poco por debajo)', () => {
    for (const [l, b] of [
      ['Ă', 'A'],
      ['Î', 'I'],
      ['Ș', 'S'],
      ['Ț', 'T'],
      ['Â', 'A'],
    ] as const) {
      const x = LETRAS_RO.find((q) => q.l === l)!,
        y = letra(b)!;
      expect(x.trazos.length, `trazos de la ${l}`).toBe(y.trazos.length + 1);
      // la î pequeña cambia el punto de la i por el circunflejo
      expect(x.minus.length, `minúscula de la ${l}`).toBe(l === 'Î' ? y.minus.length : y.minus.length + 1);
    }
    for (const x of LETRAS_RO)
      for (const [px, py] of [...x.trazos, ...x.minus].flat()) {
        expect(px, `x de la ${x.l}`).toBeGreaterThanOrEqual(-0.01);
        expect(px, `x de la ${x.l}`).toBeLessThanOrEqual(1.01);
        expect(py, `y de la ${x.l}`).toBeGreaterThanOrEqual(-0.35);
        expect(py, `y de la ${x.l}`).toBeLessThanOrEqual(1.18);
      }
  });
});
