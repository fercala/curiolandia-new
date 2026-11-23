// Pruebas de las reglas de los amigos de Tito en el mapa (src/dominio/amigos.ts, fase P31 de docs/IDEAS-MEJORA.md): el
// encargo del día (siempre el mismo, de su amigo y fuera de los rincones de los tesoros), las fases y las monedas.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  CERCA_DE,
  PERDIDOS,
  devolver,
  encargoDelDia,
  faseEncargo,
  pedirAyuda,
  registroAmigos,
} from '../../src/dominio/amigos.ts';
import { tesorosDelDia } from '../../src/dominio/tesoros.ts';

// DIAS: unos cuantos días seguidos para probar.
const DIAS = Array.from({ length: 30 }, (_, i) => `2026-11-${String(i + 1).padStart(2, '0')}`);

describe('los amigos de Tito', () => {
  test('el encargo del día es siempre el mismo, de su amigo, con pista y fuera de los rincones de los tesoros', () => {
    DIAS.forEach((d) => {
      const e = encargoDelDia(d);
      expect(encargoDelDia(d)).toEqual(e);
      expect(PERDIDOS.find((p) => p.id === e.perdido)?.amigo).toBe(e.amigo);
      expect(CERCA_DE[e.rincon]).toBeTruthy();
      expect(tesorosDelDia(d).map((t) => t.rincon)).not.toContain(e.rincon);
    });
    expect(new Set(DIAS.map((d) => encargoDelDia(d).perdido)).size).toBeGreaterThan(1);
  });

  test('sin pedir, buscando y hecho; devolver da 2 monedas una sola vez y al día siguiente vuelve a empezar', () => {
    const vacio = registroAmigos(undefined);
    expect(faseEncargo(vacio, '2026-11-20')).toBe('sinPedir');
    expect(devolver(vacio, '2026-11-20').monedas).toBe(0);
    const pedido = pedirAyuda(vacio, '2026-11-20');
    expect(faseEncargo(pedido, '2026-11-20')).toBe('buscando');
    const r = devolver(pedido, '2026-11-20');
    expect(r.monedas).toBe(2);
    expect(faseEncargo(r.registro, '2026-11-20')).toBe('hecho');
    expect(devolver(r.registro, '2026-11-20').monedas).toBe(0);
    expect(faseEncargo(r.registro, '2026-11-21')).toBe('sinPedir');
    expect(registroAmigos(r.registro).ayudas).toBe(1);
    expect(registroAmigos('roto')).toEqual(vacio);
  });
});
