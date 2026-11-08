// Pruebas de las reglas de la zona de adultos (src/dominio/zonaAdultos.ts, fases A2, A3 y A6 de
// docs/PLAN-MENU-ADULTOS.md): vales por entregar, cuándo se recuerda la copia de seguridad, la etiqueta y el orden de
// las habilidades de «Cómo le va» y el resumen de una zona. Sin navegador: cada prueba inventa los datos.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (aciertos, fallos, días):
   leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import {
  ZONA_ADULTOS,
  diasEntre,
  etiquetaHabilidad,
  ordenHabilidades,
  resumenZona,
  tocaCopia,
  valesPorEntregar,
} from '../../src/dominio/zonaAdultos.ts';

describe('resumen de la zona de adultos', () => {
  test('cuenta los vales comprados que faltan por entregar', () => {
    expect(valesPorEntregar([])).toBe(0);
    expect(valesPorEntregar([{ given: 1 }, {}, { given: 0 }])).toBe(2);
  });

  test('cuenta los días entre dos fechas, también con cambio de hora y de año', () => {
    expect(diasEntre('2026-10-24', '2026-10-26')).toBe(2);
    expect(diasEntre('2026-12-31', '2027-01-01')).toBe(1);
    expect(diasEntre('2026-11-08', '2026-11-01')).toBe(-7);
  });

  test('recuerda la copia solo si hay progreso y nunca se hizo o es de hace 30 días o más', () => {
    expect(tocaCopia(undefined, '2026-11-08', false)).toBe(false);
    expect(tocaCopia('', '2026-11-08', true)).toBe(true);
    expect(tocaCopia('2026-10-20', '2026-11-08', true)).toBe(false);
    expect(tocaCopia('2026-10-09', '2026-11-08', true)).toBe(true);
    expect(ZONA_ADULTOS.diasCopia).toBe(30);
  });
});

describe('cómo le va', () => {
  test('la etiqueta sigue las reglas de siempre (5 intentos, 80 % y 60 %)', () => {
    expect(etiquetaHabilidad({ ok: 4, err: 0 })).toBe('empieza');
    expect(etiquetaHabilidad({ ok: 4, err: 1 })).toBe('sabe');
    expect(etiquetaHabilidad({ ok: 3, err: 2 })).toBe('camino');
    expect(etiquetaHabilidad({ ok: 2, err: 3 })).toBe('cuesta');
  });

  test('ordena primero lo que cuesta, luego por intentos, y deja fuera lo que no se ha jugado', () => {
    const stats = {
      colores: { ok: 20, err: 0 },
      contar: { ok: 1, err: 5 },
      formas: { ok: 0, err: 0 },
      memoria: { ok: 1, err: 9 },
      puzzle: { ok: 5, err: 0 },
      une: { ok: 5, err: 0 },
    };
    expect(ordenHabilidades(stats)).toEqual(['memoria', 'contar', 'colores', 'puzzle', 'une']);
  });
});

describe('resumen de una zona', () => {
  test('suma temas terminados y juegos hechos', () => {
    expect(
      resumenZona([
        { hechos: 3, juegos: 3, terminado: true },
        { hechos: 1, juegos: 4, terminado: false },
      ]),
    ).toEqual({ terminados: 1, temas: 2, hechos: 4, juegos: 7 });
    expect(resumenZona([])).toEqual({ terminados: 0, temas: 0, hechos: 0, juegos: 0 });
  });
});
