// Pruebas del montaje (herramientas/vite/curiolandia.mts): que la página lleve todo el código del juego en el orden de
// ARCHIVOS, sin depender de internet (ni Google Fonts ni cdnjs), y que el service worker use la caché propia con la
// versión de package.json. Son las primeras pruebas de Vitest; las reglas del juego llegan en la fase 3.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { ARCHIVOS, PREFIJO_CACHE, codigoJuego, nombreCache, paginaJuego, serviceWorker } from '../../herramientas/vite/curiolandia.mts';

const RAIZ = join(import.meta.dirname, '..', '..');
const SRC = join(RAIZ, 'src');
// icons.js es una herramienta aparte (genera iconos con Node), no parte del juego.
const FUERA_DEL_JUEGO: readonly string[] = ['icons.js'];

describe('ARCHIVOS', () => {
  test('tiene todos los .js del juego de src/, sin repetir ni faltar ninguno', () => {
    const enSrc = readdirSync(SRC).filter((f) => f.endsWith('.js') && !FUERA_DEL_JUEGO.includes(f)).sort();
    expect([...ARCHIVOS].sort()).toEqual(enSrc);
    expect(new Set(ARCHIVOS).size).toBe(ARCHIVOS.length);
  });

  // El orden importa: los dibujos van antes que core.js, y world3d.js y boot.js al final (ver docs/ARQUITECTURA.md).
  test.each([
    ['pics-base.js', 'core.js'],
    ['core.js', 'scenes.js'],
    ['scenes.js', 'zonas.js'],
    ['adult.js', 'world3d.js'],
    ['world3d.js', 'boot.js'],
  ] as const)('%s va antes que %s', (antes, despues) => {
    expect(ARCHIVOS.indexOf(antes)).toBeLessThan(ARCHIVOS.indexOf(despues));
  });
});

describe('paginaJuego', () => {
  const publicada = paginaJuego({ src: SRC, conServiceWorker: true });
  const desarrollo = paginaJuego({ src: SRC, conServiceWorker: false });

  test('lleva el código de todos los archivos, en orden', () => {
    const posiciones = ARCHIVOS.map((f) => publicada.indexOf(readFileSync(join(SRC, f), 'utf8')));
    expect(posiciones.every((p) => p >= 0)).toBe(true);
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
    expect(publicada).toContain(codigoJuego(SRC));
  });

  test('no carga nada de internet: fuentes y Three.js locales', () => {
    expect(publicada).not.toContain('fonts.googleapis.com');
    expect(publicada).not.toContain('cdnjs.cloudflare.com');
    expect(publicada).toContain('<script src="three.min.js">');
    expect(publicada).toContain('url(fonts/fredoka-latin.woff2)');
    expect(publicada).toContain('<link rel="manifest" href="manifest.webmanifest">');
  });

  test('registra el service worker solo en la web publicada; en desarrollo, el cliente de Vite', () => {
    expect(publicada).toContain('serviceWorker.register("sw.js")');
    expect(publicada).not.toContain('@vite/client');
    expect(desarrollo).not.toContain('serviceWorker.register');
    expect(desarrollo).toContain('/@vite/client');
  });
});

describe('service worker', () => {
  test('la caché se llama como la versión de package.json', () => {
    const paquete: unknown = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'));
    expect(paquete).toMatchObject({ version: expect.any(String) });
    expect(nombreCache(RAIZ)).toBe(`${PREFIJO_CACHE}v${(paquete as { version: string }).version}`); // comprobado justo encima
  });

  test('solo borra cachés con el prefijo propio, nunca las de curiolandia-3d', () => {
    const sw = serviceWorker('curiolandia-new-v9.9.9');
    expect(sw).toContain("const C='curiolandia-new-v9.9.9'");
    expect(sw).toContain("x.startsWith('curiolandia-new-')");
    expect(sw).not.toContain('curiolandia3d-');
  });
});
