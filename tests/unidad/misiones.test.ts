// Pruebas de las reglas de las misiones del día y la semana temática (src/dominio/misiones.ts, idea 36 de
// docs/IDEAS-MEJORA.md).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  MISIONES_MONEDAS,
  cumplidas,
  esViernes,
  misionesDeHoy,
  premioMisiones,
  semanaDe,
} from '../../src/dominio/misiones.ts';

describe('las misiones del día', () => {
  test('tres misiones distintas cada día, la primera la de la casita', () => {
    for (let d = 1; d <= 28; d++) {
      const hoy = '2026-11-' + String(d).padStart(2, '0'),
        m = misionesDeHoy(hoy);
      expect(m).toHaveLength(3);
      expect(m[0]!.clave).toBe('casita');
      expect(new Set(m.map((x) => x.clave)).size).toBe(3);
    }
  });
  test('la semana cambia el lunes y el 27 de noviembre de 2026 es viernes', () => {
    expect(esViernes('2026-11-27')).toBe(true);
    expect(esViernes('2026-11-26')).toBe(false);
    expect(semanaDe('2026-11-23')).toEqual(semanaDe('2026-11-29'));
    expect(semanaDe('2026-11-29')).not.toEqual(semanaDe('2026-11-30'));
  });
  test('el premio llega con las tres cumplidas, una vez al día, y el viernes con la pegatina', () => {
    const hoy = '2026-11-27',
      reg = { [hoy]: misionesDeHoy(hoy).map((m) => m.clave) };
    expect(cumplidas(reg, hoy)).toEqual([true, true, true]);
    expect(premioMisiones(undefined, {}, hoy)).toBeNull();
    const p = premioMisiones(undefined, reg, hoy)!;
    expect(p.monedas).toBe(MISIONES_MONEDAS);
    expect(p.pegatina).toBe(semanaDe(hoy).dibujo);
    expect(premioMisiones({ d: hoy, premio: true }, reg, hoy)).toBeNull();
  });
});
