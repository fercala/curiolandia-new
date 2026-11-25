// Pruebas de las reglas de «Jugar juntos», las parejas por turnos (src/dominio/juntos.ts, idea 39 de
// docs/IDEAS-MEJORA.md).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { nuevaPartida, planParejas, tapar, terminada, voltear } from '../../src/dominio/juntos.ts';
import { azarFijo } from './azarFijo.ts';

describe('jugar juntos', () => {
  test('4, 6 u 8 parejas según la edad, cada dibujo dos veces', () => {
    [3, 4, 5].forEach((e, i) => {
      const c = planParejas(e, azarFijo(e));
      expect(c).toHaveLength([8, 12, 16][i]!);
      new Set(c).forEach((k) => expect(c.filter((x) => x === k)).toHaveLength(2));
    });
  });
  test('una pareja suma al que juega y sigue; un fallo pasa el turno al tapar', () => {
    let p = nuevaPartida(['a', 'b', 'a', 'b']);
    expect(voltear(p, 0).pasa).toBe('primera');
    p = voltear(p, 0).partida;
    expect(voltear(p, 0).pasa).toBe('nada');
    const fallo = voltear(p, 1);
    expect(fallo.pasa).toBe('fallo');
    expect(voltear(fallo.partida, 3).pasa).toBe('nada');
    p = tapar(fallo.partida);
    expect(p.turno).toBe(1);
    p = voltear(voltear(p, 1).partida, 3).partida;
    expect(p.puntos).toEqual([0, 1]);
    expect(p.turno).toBe(1);
    p = voltear(voltear(p, 0).partida, 2).partida;
    expect(terminada(p)).toBe(true);
  });
});
