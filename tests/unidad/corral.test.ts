// Pruebas de las reglas del corral de Tito en la granja (src/dominio/corral.ts, idea 33 de docs/IDEAS-MEJORA.md):
// lo guardado, lo que pide cada animal, cuidarlo una vez al día, comprar animales y vender lo que dan.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  ANIMALES_CORRAL,
  comprar,
  corralDe,
  cuidar,
  pedidoDe,
  totalProductos,
  vender,
} from '../../src/dominio/corral.ts';

const HOY = '2026-11-25';
describe('el corral de Tito', () => {
  test('sin nada guardado, el corral tiene la gallina y ningún producto', () => {
    const c = corralDe(undefined, HOY);
    expect(c.animales).toEqual(['gallina']);
    expect(totalProductos(c)).toBe(0);
  });
  test('los cuidados de otro día no cuentan hoy', () => {
    expect(corralDe({ d: '2026-11-24', cuidados: ['gallina'] }, HOY).cuidados).toEqual([]);
  });
  test('lo que pide el animal es siempre lo mismo en el día', () => {
    expect(pedidoDe('vaca', HOY)).toBe(pedidoDe('vaca', HOY));
  });
  test('cuidarlo con lo que pide da su producto una vez al día; otra cosa no', () => {
    const c = corralDe(undefined, HOY),
      pide = pedidoDe('gallina', HOY),
      otra = (['comida', 'agua', 'cepillo'] as const).find((n) => n !== pide)!;
    expect(cuidar(c, 'gallina', otra, HOY).pasa).toBe('otra');
    const r = cuidar(c, 'gallina', pide, HOY);
    expect(r.pasa).toBe('bien');
    expect(r.corral.productos['huevo']).toBe(1);
    expect(cuidar(r.corral, 'gallina', pide, HOY).pasa).toBe('ya');
  });
  test('comprar cuesta su precio, solo una vez y con monedas suficientes; vender da una moneda por producto', () => {
    const vaca = ANIMALES_CORRAL.find((a) => a.id === 'vaca')!,
      c = corralDe({ productos: { huevo: 3, leche: 1 } }, HOY);
    expect(comprar(c, 'vaca', vaca.precio - 1).precio).toBe(0);
    const r = comprar(c, 'vaca', 100);
    expect(r.precio).toBe(vaca.precio);
    expect(comprar(r.corral, 'vaca', 100).precio).toBe(0);
    const v = vender(c);
    expect(v.monedas).toBe(4);
    expect(totalProductos(v.corral)).toBe(0);
  });
});
