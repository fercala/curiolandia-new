// Pruebas de las reglas de los encargos de los vecinos (src/dominio/encargos.ts, idea 34 de docs/IDEAS-MEJORA.md): el
// encargo del día, decirlo una vez y cumplirlo al llegar a su sitio.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import { ENCARGO_MONEDAS, decirEncargo, encargoDeHoy, estadoEncargos, llegarA } from '../../src/dominio/encargos.ts';

const HOY = '2026-11-25';
describe('los encargos de los vecinos', () => {
  test('el encargo es el mismo todo el día', () => {
    expect(encargoDeHoy(HOY)).toEqual(encargoDeHoy(HOY));
  });
  test('lo de otro día se olvida, pero no cuántos se han hecho', () => {
    expect(estadoEncargos({ d: '2026-11-24', dicho: true, hecho: true, veces: 4 }, HOY)).toEqual({
      d: HOY,
      dicho: false,
      hecho: false,
      veces: 4,
    });
  });
  test('se dice una vez y se cumple al llegar a su destino (no a otro sitio)', () => {
    const e = estadoEncargos(undefined, HOY);
    expect(llegarA(e, encargoDeHoy(HOY).destino, HOY)).toBeNull();
    const dicho = decirEncargo(e)!;
    expect(decirEncargo(dicho)).toBeNull();
    expect(llegarA(dicho, 'ningunSitio', HOY)).toBeNull();
    const r = llegarA(dicho, encargoDeHoy(HOY).destino, HOY)!;
    expect(r.monedas).toBe(ENCARGO_MONEDAS);
    expect(r.estado.veces).toBe(1);
    expect(llegarA(r.estado, encargoDeHoy(HOY).destino, HOY)).toBeNull();
  });
});
