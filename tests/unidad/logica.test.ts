// Pruebas de las reglas del rincón de la lógica (src/dominio/logica.ts, idea 29 de docs/IDEAS-MEJORA.md): el sudoku de
// dibujos, ¿qué falta?, las diferencias, la balanza y el tangram, con un azar fijo.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  difEn,
  figuraTangram,
  mayorPeso,
  pesoDe,
  planBalanza,
  planDiferencias,
  planFalta,
  planSudoku,
  puedePoner,
  sudokuHecho,
} from '../../src/dominio/logica.ts';
import { azarFijo } from './azarFijo.ts';

describe('el rincón de la lógica', () => {
  test('el sudoku no repite en filas ni columnas y tiene los huecos de la edad', () => {
    [3, 4, 5].forEach((edad) => {
      const s = planSudoku(edad, azarFijo(edad)),
        n = s.solucion.length;
      expect(n).toBe(edad === 5 ? 4 : 3);
      s.solucion.forEach((fila) => expect(new Set(fila).size).toBe(n));
      [...Array(n).keys()].forEach((c) => expect(new Set(s.solucion.map((f) => f[c])).size).toBe(n));
      expect(s.tablero.flat().filter((v) => v === null).length).toBe({ 3: 3, 4: 4, 5: 6 }[edad]);
      expect(sudokuHecho(s)).toBe(false);
    });
  });
  test('en el sudoku solo se puede poner lo que va en el hueco', () => {
    const s = planSudoku(4, azarFijo(9)),
      f = s.tablero.findIndex((fila) => fila.includes(null)),
      c = s.tablero[f]!.indexOf(null),
      bueno = s.solucion[f]![c]!;
    expect(puedePoner(s, f, c, bueno)).toBe(true);
    expect(puedePoner(s, f, c, (bueno + 1) % 3)).toBe(false);
  });
  test('¿qué falta?: lo que falta estaba y está entre tres opciones distintas', () => {
    const p = planFalta(5, azarFijo(3));
    expect(p.dibujos).toHaveLength(5);
    expect(p.dibujos).toContain(p.falta);
    expect(p.opciones).toContain(p.falta);
    expect(new Set(p.opciones).size).toBe(3);
  });
  test('las diferencias: tantas como la edad pide y se encuentran por su sitio', () => {
    const p = planDiferencias(4, azarFijo(5));
    expect(p.difs).toHaveLength(3);
    const d = p.difs[0]!,
      o = p.objetos[d.i]!;
    expect(difEn(p, o.x, o.y)).toEqual(d);
    expect(difEn(p, -1, -1)).toBeNull();
  });
  test('la balanza: cada ronda tiene un platillo que pesa más; con 5 años, una para equilibrar', () => {
    for (let s = 1; s < 30; s++) planBalanza(4, azarFijo(s)).forEach((r) => expect(mayorPeso(r)).not.toBeNull());
    const cinco = planBalanza(5, azarFijo(2));
    expect(cinco).toHaveLength(4);
    expect(cinco[3]!.equilibrar).toBe(true);
    expect(pesoDe(['bloque', 'bloque'])).toBe(2);
  });
  test('el tangram tiene una figura con piezas para cada edad', () => {
    [3, 4, 5].forEach((e) => expect(figuraTangram(e).piezas.length).toBeGreaterThan(0));
  });
});
