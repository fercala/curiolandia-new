// Pruebas de la regla común de crecer por días (src/dominio/crecer.ts), fase P8 de docs/IDEAS-MEJORA.md, y del
// manzano de la granja (MANZANO de src/dominio/excursiones.ts). Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { contarDia, creceAl, crecimientoDe, etapaPorDias } from '../../src/dominio/crecer.ts';
import { MANZANO } from '../../src/dominio/excursiones.ts';
import { etapaFlor, etapaMascota, regar } from '../../src/dominio/casa.ts';

describe('crecer por días', () => {
  test('lo guardado roto o de antes empieza sin días', () => {
    expect(crecimientoDe(undefined, 'x')).toEqual({ dias: 0, dia: '' });
    expect(crecimientoDe({ x: 'roto' }, 'x')).toEqual({ dias: 0, dia: '' });
    expect(crecimientoDe({ x: { dias: -3, dia: 5 } }, 'x')).toEqual({ dias: 0, dia: '' });
    expect(crecimientoDe({ x: { dias: 4, dia: '2026-11-09' } }, 'x')).toEqual({ dias: 4, dia: '2026-11-09' });
  });

  test('cada día cuenta una sola vez, aunque no sean seguidos', () => {
    const a = contarDia({ dias: 0, dia: '' }, '2026-11-09');
    expect(a).toEqual({ crecimiento: { dias: 1, dia: '2026-11-09' }, cuenta: true });
    expect(contarDia(a.crecimiento, '2026-11-09').cuenta).toBe(false);
    expect(contarDia(a.crecimiento, '2026-11-20').crecimiento.dias).toBe(2);
  });

  test('la etapa sale de los umbrales, y se sabe cuándo se cambia de etapa', () => {
    expect([0, 1, 2, 3, 5, 7, 20].map((d) => etapaPorDias(d, MANZANO.dias))).toEqual([0, 0, 1, 2, 3, 4, 4]);
    expect(creceAl(1, 2, MANZANO.dias)).toBe(true);
    expect(creceAl(3, 4, MANZANO.dias)).toBe(false);
  });

  test('la casa usa la misma regla y no cambia', () => {
    expect([0, 2, 3, 7, 8].map(etapaMascota)).toEqual([0, 0, 1, 1, 2]);
    expect([0, 1, 3, 5, 8].map(etapaFlor)).toEqual([0, 1, 2, 3, 4]);
    expect(regar({ dias: 2, dia: '2026-11-08' }, '2026-11-09')).toEqual({
      huerto: { dias: 3, dia: '2026-11-09' },
      cuenta: true,
    });
    expect(regar({ dias: 3, dia: '2026-11-09' }, '2026-11-09').cuenta).toBe(false);
  });
});
