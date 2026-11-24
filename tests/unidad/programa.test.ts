// Pruebas de las reglas de «Programa a Tito» (src/dominio/programa.ts, fase P32 de docs/IDEAS-MEJORA.md): las tarjetas
// de cada edad, el «por dos», cómo acaba un programa (fresa, roca, fuera o corto) y que cada tablero tiene solución.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  PROGRAMA,
  ejecutar,
  expandir,
  nivelesDe,
  ordenesDe,
  siguienteOrden,
  solucion,
} from '../../src/dominio/programa.ts';

describe('programa a Tito', () => {
  test('las tarjetas de cada edad y el «por dos»', () => {
    expect(ordenesDe(3)).toEqual(['av']);
    expect(ordenesDe(4)).toEqual(['av', 'iz', 'de']);
    expect(ordenesDe(5)).toContain('x2');
    expect(expandir(['av', 'x2', 'de']).map((x) => x.o)).toEqual(['av', 'av', 'de']);
    expect(expandir(['x2', 'av']).map((x) => x.o)).toEqual(['av']);
  });

  test('cada tablero tiene solución con las tarjetas de su edad, y cabe', () => {
    [3, 4, 5].forEach((edad) =>
      nivelesDe(edad).forEach((n) => {
        const s = solucion(n, edad);
        expect(s.length).toBeGreaterThan(0);
        expect(s.length).toBeLessThanOrEqual(PROGRAMA.caben[edad]!);
        expect(ejecutar(n, s).fin).toBe('meta');
      }),
    );
  });

  test('chocar con una roca, salirse, quedarse corto y la ayuda', () => {
    const [n1, n2] = nivelesDe(5);
    expect(ejecutar(n2!, ['av', 'av']).fin).toBe('roca');
    expect(ejecutar(n2!, ['av', 'av']).fallo).toBe(1);
    expect(ejecutar(n1!, ['iz', 'av']).fin).toBe('fuera');
    expect(ejecutar(n1!, ['av']).fin).toBe('corto');
    expect(ejecutar(n1!, ['av', 'x2', 'av']).fin).toBe('meta');
    expect(siguienteOrden(n1!, ['av'], 5)).toBe('av');
    expect(siguienteOrden(n1!, ['iz', 'av'], 5)).toBeNull();
    expect(siguienteOrden(n2!, [], 5)).toBe('av');
  });
});
