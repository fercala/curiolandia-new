// Pruebas del montaje (herramientas/vite/curiolandia.mts): que la página lleve los módulos y después todo el código
// global en el orden de ARCHIVOS, sin depender de internet (ni Google Fonts ni cdnjs), que los módulos dejen al código
// global lo que necesita (el puente de src/modulos.ts) y que el service worker use la caché propia con la versión de
// package.json. Las reglas del juego llegan en la fase 3.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { beforeAll, describe, expect, test } from 'vitest';
import {
  ARCHIVOS, PREFIJO_CACHE, codigoJuego, codigoModulos, nombreCache, paginaJuego, serviceWorker,
} from '../../herramientas/vite/curiolandia.mts';

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

  // El orden importa: lex.js primero (core.js ya es módulo: src/nucleo/), y world3d.js y boot.js al final (ver
  // docs/ARQUITECTURA.md).
  test.each([
    ['lex.js', 'comps.js'],
    ['lex.js', 'scenes.js'],
    ['scenes.js', 'zonas.js'],
    ['adult.js', 'world3d.js'],
    ['world3d.js', 'boot.js'],
  ] as const)('%s va antes que %s', (antes, despues) => {
    expect(ARCHIVOS.indexOf(antes)).toBeLessThan(ARCHIVOS.indexOf(despues));
  });
});

describe('paginaJuego', () => {
  const pagina = { publicada: '', desarrollo: '', modulos: '' };
  beforeAll(async () => {
    pagina.publicada = await paginaJuego({ src: SRC, conServiceWorker: true });
    pagina.desarrollo = await paginaJuego({ src: SRC, conServiceWorker: false });
    pagina.modulos = await codigoModulos(SRC);
  });

  test('lleva el código de todos los archivos globales, en orden', () => {
    const { publicada } = pagina;
    const posiciones = ARCHIVOS.map((f) => publicada.indexOf(readFileSync(join(SRC, f), 'utf8')));
    expect(posiciones.every((p) => p >= 0)).toBe(true);
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
    expect(publicada).toContain(codigoJuego(SRC));
  });

  test('los módulos van antes que el código global, en un <script> normal', () => {
    const { publicada, modulos } = pagina;
    expect(publicada.indexOf(`<script>\n${modulos}</script>`)).toBeGreaterThan(0);
    expect(publicada.indexOf(modulos)).toBeLessThan(publicada.indexOf(codigoJuego(SRC)));
  });

  // Ejecuta los módulos en un navegador de mentira (lo justo para que el núcleo arranque: lienzo, localStorage,
  // Image...) y mira lo que dejan para el código global (el puente de src/modulos.ts).
  const ejecutaModulos = (): Record<string, unknown> => {
    const lienzo = { width: 0, height: 0, style: {}, getContext: () => ({}), toDataURL: () => '' };
    const global: Record<string, unknown> = {
      document: { getElementById: () => lienzo, createElement: () => lienzo },
      localStorage: { getItem: () => null, setItem: () => undefined },
      location: { protocol: 'file:' },
      Image: class { src = ''; complete = false; },
      addEventListener: () => undefined,
      innerWidth: 1600,
      innerHeight: 900,
      console,
    };
    global['window'] = global;
    createContext(global);
    runInContext(pagina.modulos, global);
    return global;
  };

  test('los módulos dejan los dibujos y el núcleo al código global', () => {
    const global = ejecutaModulos();
    const pics: unknown = global['PICS'];
    expect(typeof pics === 'object' && pics !== null ? Object.keys(pics).length : 0).toBeGreaterThan(300);
    expect(pics).toMatchObject({ gato: expect.stringContaining('<path') });
    for (const k of ['K', 'TITO_SVG', 'ERIZO_SVG', 'TORTUGA_SVG', 'CONEJO_SVG', 'LUPI_SVG', 'GLASSES_SVG', 'HAND_SVG']) {
      expect(typeof global[k], k).toBe('string');
    }
    for (const k of ['say', 'go', 'ponS', 'tx', 'drawTito', 'later', 'save']) expect(typeof global[k], k).toBe('function');
    expect(global['S']).toMatchObject({ variant: 'es', voz: 'nav', vol: { voz: 1 } });
    expect(Object.keys(global['IMG'] as object).length).toBeGreaterThan(300);
  });

  test('el puente da siempre el valor actual y no deja reasignar', () => {
    const global = ejecutaModulos();
    runInContext('ponT(12.5); ponS({ nuevo: 1 })', global);
    expect(runInContext('T', global)).toBe(12.5);
    expect(runInContext('S', global)).toEqual({ nuevo: 1 });
    expect(() => runInContext('T = 3', global)).toThrow(/es de un módulo/);
    expect(runInContext('T', global)).toBe(12.5);
    // Una global con el nombre de algo del puente no se puede declarar (habría dos SCENES distintas).
    expect(() => runInContext('const SCENES = {}', global)).toThrow();
    expect(() => runInContext('function go() {}', global)).toThrow();
  });

  test('no carga nada de internet: fuentes y Three.js locales', () => {
    const { publicada } = pagina;
    expect(publicada).not.toContain('fonts.googleapis.com');
    expect(publicada).not.toContain('cdnjs.cloudflare.com');
    expect(publicada).toContain('<script src="three.min.js">');
    expect(publicada).toContain('url(fonts/fredoka-latin.woff2)');
    expect(publicada).toContain('<link rel="manifest" href="manifest.webmanifest">');
  });

  test('registra el service worker solo en la web publicada; en desarrollo, el cliente de Vite', () => {
    const { publicada, desarrollo } = pagina;
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
