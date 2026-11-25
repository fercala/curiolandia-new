// Pruebas de rellenaS (src/nucleo/guardado.ts, mejora 10b): completa una partida con una copia de cada campo por defecto
// que le falta, sin tocar los que ya tiene, como hacía el bucle con Libre de escenas/tienda.ts con DEF2.
// guardado.ts lee la partida al cargarse: los puertos de prueba incluyen volúmenes inválidos para comprobar su carga.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso. */
import { beforeAll, describe, expect, test } from 'vitest';
import { ponPuertos } from '../../src/aplicacion/puertos.ts';

type Guardado = typeof import('../../src/nucleo/guardado.ts');
let G: Guardado;
let avisar: (clave: string, texto: string | null) => void;

// Puertos de prueba: hora y azar fijos, una copia sintética y el aviso de otra pestaña.
beforeAll(async () => {
  ponPuertos({
    reloj: { ahora: () => new Date(2026, 10, 6, 9, 0) },
    azar: { numero: () => 0.5 },
    guardado: {
      leer: (clave) =>
        clave === 'curiolandia-new.v1' ? JSON.stringify({ temas: {}, vol: { voz: -5, mus: '0.2', fx: 4 } }) : null,
      escribir: () => true,
      alCambiarFuera: (fn) => {
        avisar = fn;
      },
    },
  });
  G = await import('../../src/nucleo/guardado.ts');
});

describe('rellenaS', () => {
  test('la carga limita los volúmenes y convierte los números de una copia antigua', () => {
    expect(G.S.vol).toEqual({ voz: 0, mus: 0.2, fx: 1 });
    expect(G.DEF.vol).toEqual({ voz: 1, mus: 0.45, fx: 0.8 });
  });

  test('los volúmenes recibidos de otra pestaña se reparan igual que al cargar', () => {
    avisar(G.KEY, JSON.stringify({ temas: {}, vol: { voz: '0.5', mus: null, fx: 'roto' } }));
    expect(G.S.vol).toEqual({ voz: 0.5, mus: 0.45, fx: 0.8 });
    avisar(G.KEY, JSON.stringify({ temas: {}, vol: { voz: 10, mus: -1 } }));
    expect(G.S.vol).toEqual({ voz: 1, mus: 0, fx: 0.8 });
  });

  test('una lista de vales vacía recibida de otra pestaña conserva la elección de la familia', () => {
    avisar(G.KEY, JSON.stringify({ temas: {}, vales: [{ id: 'parque', txt: 'Ir al parque', on: 1, p: 30 }] }));
    expect(G.S.vales).toHaveLength(1);
    avisar(G.KEY, JSON.stringify({ temas: {}, vales: [] }));
    expect(G.S.vales).toEqual([]);
  });

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
