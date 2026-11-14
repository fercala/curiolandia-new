// Pruebas de las reglas de los tesoros escondidos del mapa (src/dominio/tesoros.ts, fase P14 de docs/IDEAS-MEJORA.md):
// los tesoros del día, lo guardado (S.tesoros) y lo que pasa al encontrar uno. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  RINCONES,
  TESOROS,
  TESOROS_MAPA,
  hallarTesoro,
  pendientesHoy,
  registroTesoros,
  rincon,
  tesoro,
  tesorosDelDia,
} from '../../src/dominio/tesoros.ts';

describe('los tesoros del mapa', () => {
  test('tesoros y rincones con ids distintos, nombre, frase y pista enteras', () => {
    expect(new Set(TESOROS.map((t) => t.id)).size).toBe(TESOROS.length);
    expect(new Set(RINCONES.map((r) => r.id)).size).toBe(RINCONES.length);
    // la frase y la pista son exclamaciones enteras: acepta "¡Una pluma! La guardo." y rechaza "una pluma"
    // (probar en https://regex101.com/?regex=%5E%C2%A1.%2B!)
    TESOROS.forEach((t) => expect(t.frase).toMatch(/^¡.+!/));
    // la pista dice dónde: acepta "¡Hay un tesoro cerca del jardín!" y rechaza "Cerca del jardín"
    // (probar en https://regex101.com/?regex=%5E%C2%A1Hay%20un%20tesoro%20cerca%20de)
    RINCONES.forEach((r) => expect(r.pista).toMatch(/^¡Hay un tesoro cerca de/));
    expect(tesoro('pluma')?.nombre).toBe('La pluma');
    expect(rincon('nada')).toBeUndefined();
  });

  test('cada día, tres tesoros distintos en rincones distintos, siempre los mismos ese día', () => {
    ['2026-11-14', '2026-11-15', '2027-01-01', '2026-06-30'].forEach((dia) => {
      const h = tesorosDelDia(dia);
      expect(h).toHaveLength(TESOROS_MAPA.porDia);
      expect(new Set(h.map((e) => e.tesoro)).size).toBe(3);
      expect(new Set(h.map((e) => e.rincon)).size).toBe(3);
      h.forEach((e) => {
        expect(tesoro(e.tesoro)).toBeDefined();
        expect(rincon(e.rincon)).toBeDefined();
      });
      expect(tesorosDelDia(dia)).toEqual(h);
    });
    const dias = Array.from({ length: 10 }, (_, i) => `2026-11-${String(i + 10)}`);
    expect(new Set(dias.map((d) => JSON.stringify(tesorosDelDia(d)))).size).toBeGreaterThan(5);
  });

  test('un registro roto o de una partida de antes se lee vacío', () => {
    expect(registroTesoros(undefined)).toEqual({ d: '', hoy: [], vitrina: {} });
    expect(registroTesoros({ d: 4, hoy: ['plaza', 3], vitrina: { pluma: 2, concha: 'x', pina: 0 } })).toEqual({
      d: '',
      hoy: ['plaza'],
      vitrina: { pluma: 2 },
    });
  });

  test('al encontrar los tres del día: una moneda cada uno y dos más con el último; al día siguiente, otros', () => {
    const dia = '2026-11-14',
      [a, b, c] = tesorosDelDia(dia);
    let reg = registroTesoros({ d: '2026-11-13', hoy: ['x'], vitrina: { pluma: 1 } });
    expect(pendientesHoy(reg, dia)).toHaveLength(3);
    const vacio = RINCONES.find((r) => !tesorosDelDia(dia).some((e) => e.rincon === r.id))!;
    expect(hallarTesoro(reg, vacio.id, dia).monedas).toBe(0);
    const r1 = hallarTesoro(reg, a!.rincon, dia);
    expect(r1).toMatchObject({ tesoro: a!.tesoro, monedas: 1, todos: false });
    expect(hallarTesoro(r1.registro, a!.rincon, dia).monedas).toBe(0);
    reg = hallarTesoro(r1.registro, b!.rincon, dia).registro;
    const r3 = hallarTesoro(reg, c!.rincon, dia);
    expect(r3).toMatchObject({ tesoro: c!.tesoro, monedas: 3, todos: true });
    expect(pendientesHoy(r3.registro, dia)).toHaveLength(0);
    expect(Object.values(r3.registro.vitrina).reduce((s, n) => s + n, 0)).toBe(4);
    expect(pendientesHoy(r3.registro, '2026-11-15')).toHaveLength(3);
  });
});
