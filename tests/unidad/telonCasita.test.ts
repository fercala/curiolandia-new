// Pruebas de bgSample (src/mundo3d/casita3d.ts, mejora 8 del issue #55): el telón de la casita reutiliza el lienzo del
// último tema (TELON) y los colores de muestra de cada tema (MUESTRA), así que el fondo del tema se pinta menos veces,
// pero los colores que devuelve son los mismos, la textura es nueva en cada entrada (disposeWorld libera la anterior)
// y el lienzo del juego (ctx) queda como estaba.
import { beforeAll, describe, expect, test, vi } from 'vitest';
import * as THREE from 'three';
import type { Tema } from '../../src/juegos/tipos.ts';

type Casita = typeof import('../../src/mundo3d/casita3d.ts');
type Nucleo = typeof import('../../src/nucleo/indice.ts');
let bgSample: Casita['bgSample'];
let nucleo: Nucleo;

// lienzoFalso(): un lienzo de mentira cuyo contexto lee siempre el mismo color (rojo 200, verde 100, azul 50).
// Cuenta las lecturas de píxeles en lecturas.n.
const lecturas = { n: 0 };
const PIXEL = [200, 100, 50, 255];
function lienzoFalso(): Record<string, unknown> {
  const contexto = {
    scale: () => undefined,
    getImageData: (_x: number, _y: number, w: number, h: number) => {
      lecturas.n++;
      return { data: Uint8ClampedArray.from({ length: w * h * 4 }, (_v, i) => PIXEL[i % 4]!) };
    },
  };
  return { width: 0, height: 0, style: {}, getContext: () => contexto, addEventListener: () => undefined };
}

// casita3d.ts importa el núcleo, las escenas y el resto de mundo3d/, que al cargarse buscan el lienzo de la página y
// escuchan la ventana: se les da un navegador de mentira con lo justo (como tests/unidad/claveMaterial.test.ts).
beforeAll(async () => {
  vi.stubGlobal('document', {
    getElementById: lienzoFalso,
    createElement: lienzoFalso,
    addEventListener: () => undefined,
  });
  vi.stubGlobal('addEventListener', () => undefined);
  vi.stubGlobal('innerWidth', 1600);
  vi.stubGlobal('innerHeight', 900);
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined });
  vi.stubGlobal(
    'Image',
    class {
      src = '';
      complete = false;
    },
  );
  vi.stubGlobal('location', { protocol: 'file:' });
  vi.stubGlobal('setTimeout', () => 0);
  vi.stubGlobal('window', globalThis);
  // el núcleo lee la partida al cargarse: sin nada guardado, empieza una nueva
  const { ponPuertos } = await import('../../src/aplicacion/puertos.ts');
  ponPuertos({
    reloj: { ahora: () => new Date(0) },
    azar: { numero: () => 0.5 },
    guardado: { leer: () => null, escribir: () => true, alCambiarFuera: () => undefined },
  });
  nucleo = await import('../../src/nucleo/indice.ts');
  ({ bgSample } = await import('../../src/mundo3d/casita3d.ts'));
  // como en el juego (mundo3d/motor.ts): los colores, sin conversión a sRGB, para leerlos tal cual
  THREE.ColorManagement.enabled = false;
}, 30000);

// temaFalso(id): un tema con solo lo que mira bgSample (id y bg); pintadas.n cuenta las veces que se pinta su fondo.
function temaFalso(id: string): { t: Tema; pintadas: { n: number } } {
  const pintadas = { n: 0 };
  return {
    t: {
      id,
      bg: () => {
        pintadas.n++;
      },
    } as unknown as Tema,
    pintadas,
  };
}

describe('bgSample: el telón de la casita', () => {
  const a = temaFalso('telonA'),
    b = temaFalso('telonB');

  test('la primera vez pinta el fondo dos veces (telón y muestras) y lee el suelo y el cielo', () => {
    const antes = nucleo.ctx,
      l0 = lecturas.n;
    const bs = bgSample(a.t);
    expect(a.pintadas.n).toBe(2);
    expect(lecturas.n - l0).toBe(2);
    expect(bs.ground.getHexString()).toBe('c86432');
    expect(bs.top.getHexString()).toBe('c86432');
    expect(nucleo.ctx).toBe(antes);
  });

  test('al volver a la misma casita no pinta ni lee nada, con los mismos colores y una textura nueva', () => {
    const primera = bgSample(a.t),
      l0 = lecturas.n,
      p0 = a.pintadas.n;
    const otra = bgSample(a.t);
    expect(a.pintadas.n).toBe(p0);
    expect(lecturas.n).toBe(l0);
    expect(otra.tex).not.toBe(primera.tex);
    expect(otra.tex.image).toBe(primera.tex.image);
    expect(otra.ground.equals(primera.ground)).toBe(true);
    expect(otra.top.equals(primera.top)).toBe(true);
  });

  test('tras otra casita, vuelve a pintar el telón, pero no las muestras', () => {
    bgSample(b.t);
    expect(b.pintadas.n).toBe(2);
    const p0 = a.pintadas.n,
      l0 = lecturas.n,
      antes = nucleo.ctx;
    const bs = bgSample(a.t);
    expect(a.pintadas.n).toBe(p0 + 1);
    expect(lecturas.n).toBe(l0);
    expect(bs.ground.getHexString()).toBe('c86432');
    expect(nucleo.ctx).toBe(antes);
  });
});
