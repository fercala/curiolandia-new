// Pruebas de las reglas del tiempo de verdad en el mapa (src/dominio/tiempo.ts, fase P26 de docs/IDEAS-MEJORA.md): qué
// muestra el mapa con cada tiempo de la asamblea, qué juego hay, y cuántos charcos, partes del muñeco y bolas de nieve
// según la edad. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  COLORES_ARCOIRIS,
  PARTES_MUNECO,
  bolasDeNieve,
  cuantosCharcos,
  juegoDelTiempo,
  partesMuneco,
  tiempoDelMapa,
} from '../../src/dominio/tiempo.ts';

describe('el tiempo en el mapa', () => {
  test('cada tiempo de la asamblea se pinta en el mapa; sin decirlo, el mapa sigue como siempre', () => {
    expect(tiempoDelMapa('lluvia')).toBe('lluvia');
    expect(tiempoDelMapa('tormenta')).toBe('lluvia');
    expect(tiempoDelMapa('nublado')).toBe('nubes');
    expect(tiempoDelMapa('nieve')).toBe('nieve');
    expect(tiempoDelMapa('viento')).toBe('viento');
    expect(tiempoDelMapa('niebla')).toBe('niebla');
    expect(tiempoDelMapa('sol')).toBe('sol');
    expect(tiempoDelMapa(undefined)).toBeNull();
    expect(tiempoDelMapa('granizo')).toBeNull();
  });

  test('con lluvia se saltan charcos, con nieve se hace el muñeco; con los demás, no hay juego', () => {
    expect(juegoDelTiempo('lluvia')).toBe('charcos');
    expect(juegoDelTiempo('nieve')).toBe('muneco');
    expect(juegoDelTiempo('sol')).toBeNull();
    expect(juegoDelTiempo('viento')).toBeNull();
    expect(juegoDelTiempo(null)).toBeNull();
  });

  test('los charcos y las bolas de nieve crecen con la edad', () => {
    expect([3, 4, 5].map(cuantosCharcos)).toEqual([3, 4, 5]);
    expect([3, 4, 5].map(bolasDeNieve)).toEqual([3, 4, 5]);
    expect(cuantosCharcos(2)).toBe(3);
    expect(bolasDeNieve(7)).toBe(5);
  });

  test('el muñeco empieza siempre por las bolas, en orden, y con 5 años lleva todas las partes', () => {
    expect(partesMuneco(3).map((p) => p.id)).toEqual(['bolaGrande', 'bolaPequena', 'nariz']);
    expect(partesMuneco(4).map((p) => p.id)).toEqual(['bolaGrande', 'bolaPequena', 'nariz', 'gorro']);
    expect(partesMuneco(5)).toEqual(PARTES_MUNECO);
    expect(new Set(PARTES_MUNECO.map((p) => p.id)).size).toBe(PARTES_MUNECO.length);
    // cada petición es una frase entera, acabada en punto o exclamación: acepta "Y una bufanda calentita." y rechaza
    // "la bufanda" (probar en https://regex101.com/?regex=%5B.!%5D%24&testString=Y%20una%20bufanda%20calentita.)
    PARTES_MUNECO.forEach((p) => expect(p.pide).toMatch(/[.!]$/));
  });

  test('el arcoíris tiene siete colores', () => {
    expect(COLORES_ARCOIRIS).toHaveLength(7);
  });
});
