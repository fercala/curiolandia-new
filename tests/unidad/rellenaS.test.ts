// Pruebas de rellenaS (src/nucleo/guardado.ts, mejora 10b): completa una partida con una copia de cada campo por defecto
// que le falta, sin tocar los que ya tiene, como hacía el bucle con Libre de escenas/tienda.ts con DEF2.
// guardado.ts lee la partida al cargarse: antes de importarlo se conectan unos puertos de prueba (sin partida guardada).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso. */
import { beforeAll, describe, expect, test } from 'vitest';
import { ponPuertos } from '../../src/aplicacion/puertos.ts';

type Guardado = typeof import('../../src/nucleo/guardado.ts');
let G: Guardado;

// Puertos de prueba: hora fija, azar fijo y un guardado vacío que no recuerda nada.
beforeAll(async () => {
  ponPuertos({
    reloj: { ahora: () => new Date(2026, 10, 6, 9, 0) },
    azar: { numero: () => 0.5 },
    guardado: { leer: () => null, escribir: () => true, alCambiarFuera: () => {} },
  });
  G = await import('../../src/nucleo/guardado.ts');
});

describe('rellenaS', () => {
  test('añade los campos que faltan y deja los que ya hay, aunque sean null, 0 o vacíos', () => {
    const def = { coins: 0, owned: { a: 1 }, vales: null, bdayDone: '' };
    const partida: Record<string, unknown> = { coins: 7, vales: null, bdayDone: '' };
    expect(G.rellenaS(partida, def)).toBe(partida);
    expect(partida).toEqual({ coins: 7, owned: { a: 1 }, vales: null, bdayDone: '' });
  });

  test('lo añadido es una copia: cambiarlo no cambia el valor por defecto', () => {
    const def = { owned: { a: 1 }, valesLog: [] as number[] };
    const partida: { owned?: Record<string, number>; valesLog?: number[] } = {};
    G.rellenaS(partida, def);
    partida.owned!['b'] = 2;
    partida.valesLog!.push(1);
    expect(def).toEqual({ owned: { a: 1 }, valesLog: [] });
  });

  test('tras sanoS, un campo roto (null o de otro tipo) queda con su valor por defecto', () => {
    const def = { coins: 0, owned: { a: 1 } };
    const partida: Record<string, unknown> = { coins: null, owned: 'roto' };
    G.rellenaS(G.sanoS(partida, def), def);
    expect(partida).toEqual({ coins: 0, owned: { a: 1 } });
  });
});
