// Pruebas de los temporizadores de later() (nucleo/escenas.ts) en el bucle del juego (frame, aplicacion/bucle.ts):
// que cada uno se ejecuta una sola vez al vencer y solo si sigue en su escena, que los que vencen salen de la lista y
// que, en los cuadros en que no vence ninguno, la lista no se rehace (no se reserva memoria en cada cuadro).
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { codigoModulos } from '../../herramientas/vite/curiolandia.mts';
import { ejecutaModulos } from './juegoEnVm.ts';
import { join } from 'node:path';

const SRC = join(import.meta.dirname, '..', '..', 'src');

/** Lo que estas pruebas usan del juego cargado (el puente de src/modulos.ts). */
interface Juego {
  readonly VIVO: { timers: unknown[] };
  readonly later: (ms: number, fn: () => void) => void;
  readonly frame: (ahora: number) => void;
  readonly sceneTok: number;
  readonly ponCtx: (g: unknown) => void;
}

// lienzoMudo(): un contexto 2D de mentira en el que cada método existe y no hace nada (measureText da ancho 0), para que
// frame() pueda dibujar sin lienzo de verdad.
function lienzoMudo(): unknown {
  const nada = (): void => undefined;
  return new Proxy({}, {
    get: (o: Record<string | symbol, unknown>, k) => (k in o ? o[k] : k === 'measureText' ? () => ({ width: 0 }) : nada),
    set: (o: Record<string | symbol, unknown>, k, v) => { o[k] = v; return true; },
  });
}

describe('temporizadores de later() en frame()', () => {
  let juego: Juego;
  let reloj = 0;
  // cuadro(ms): avanza el bucle un cuadro de ms milisegundos (frame limita dt a 0,05 s).
  const cuadro = (ms: number): void => {
    reloj += ms;
    juego.frame(reloj);
  };
  beforeAll(async () => {
    const global = ejecutaModulos(await codigoModulos(SRC));
    // frame() pide el cuadro siguiente al terminar: aquí los cuadros los da cuadro().
    global['requestAnimationFrame'] = (): number => 0;
    juego = global as unknown as Juego;
    juego.ponCtx(lienzoMudo());
    juego.frame(reloj);
  });
  // Cada prueba empieza sin temporizadores (los que dejara el arranque o una prueba que falla no cuentan).
  beforeEach(() => {
    juego.VIVO.timers = [];
  });

  test('se ejecuta una vez al vencer, sale de la lista y no rehace la lista si no vence ninguno', () => {
    const veces: string[] = [];
    juego.later(100, () => veces.push('a'));
    juego.later(1000, () => veces.push('b'));
    const lista = juego.VIVO.timers;
    expect(lista).toHaveLength(2);
    cuadro(40);
    expect(juego.VIVO.timers).toBe(lista);
    cuadro(40);
    cuadro(40);
    expect(veces).toEqual(['a']);
    expect(juego.VIVO.timers).toHaveLength(1);
    const despues = juego.VIVO.timers;
    cuadro(40);
    expect(juego.VIVO.timers).toBe(despues);
    for (let i = 0; i < 25; i++) cuadro(40);
    expect(veces).toEqual(['a', 'b']);
    expect(juego.VIVO.timers).toHaveLength(0);
  });

  test('uno que se añade al vencer otro se recorre en el mismo cuadro', () => {
    const veces: string[] = [];
    juego.later(10, () => {
      veces.push('a');
      juego.later(0, () => veces.push('b'));
    });
    cuadro(40);
    expect(veces).toEqual(['a', 'b']);
    expect(juego.VIVO.timers).toHaveLength(0);
  });

  test('uno de otra escena vence y sale de la lista sin ejecutarse', () => {
    const veces: string[] = [];
    juego.later(10, () => veces.push('a'));
    const t = juego.VIVO.timers[0] as { tok: number };
    t.tok = juego.sceneTok - 1;
    cuadro(40);
    expect(veces).toEqual([]);
    expect(juego.VIVO.timers).toHaveLength(0);
  });
});
