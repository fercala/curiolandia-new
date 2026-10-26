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

  // El orden importa: adult.js primero (core.js, lex.js, comps.js, comps2.js, los temas, cuentos.js, extras.js, ingles.js,
  // scenes.js, zonas.js, tienda.js y repaso.js ya son módulos: src/nucleo/, src/contenido/, src/juegos/, src/temas/ y src/escenas/), y world3d.js y boot.js al final (ver docs/ARQUITECTURA.md).
  test.each([
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

  test('los módulos dejan los dibujos, el núcleo, los componentes y los temas al código global', () => {
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
    // contenido/lex.ts amplía el vocabulario del núcleo.
    expect(global['LEX']).toMatchObject({ gato: 'el gato', escuela: 'la escuela' });
    expect(global['ONO']).toMatchObject({ vaca: '¡Muuu!', ambulancia: '¡Niinoo, niinoo!' });
    expect(runInContext("S.variant = 'es'; tx('Agarralo con la valija')", global)).toBe('Cógelo con la maleta');
    // juegos/: los componentes y sus ayudas de texto.
    for (const k of ['Busca', 'Arrastra', 'Memoria', 'Tracer', 'Story', 'thing', 'ponThing']) expect(typeof global[k], k).toBe('function');
    expect(runInContext("unN(3, 'perro') + ' / ' + eseEs('mesa')", global)).toBe('tres perros / Esa es la mesa');
    // temas/: los temas de cada edad, makeGame y los fondos (temas4.ts añade los suyos a BG al cargarse).
    expect(runInContext('[T3.length, T4.length, T5.length].join()', global)).toBe('12,12,12');
    for (const k of ['makeGame', 'ponMakeGame', 'vestir']) expect(typeof global[k], k).toBe('function');
    expect(runInContext('typeof BG.aula + typeof BG.bosque', global)).toBe('functionfunction');
    // contenido/cuentos.ts: un cuento por tema, con páginas y preguntas.
    expect(runInContext("CUENTOS['3A-T1'].pages.length > 0 && CUENTOS['3A-T1'].qs.length > 0", global)).toBe(true);
    // temas/extras.ts: los temas extra, el fondo de los trazos y «El cuento» al final de los temas con cuento.
    expect(runInContext('[RUT.id, TRZ.id, CAN.id, FIESTAS.length, typeof BG.trazo].join()', global)).toBe('X-RUT,X-TRZ,X-CAN,4,function');
    expect(runInContext("T3.find((t) => t.id === '3A-T1').games.at(-1).t", global)).toBe('cuento');
    // temas/ingles.ts: el Rincón del inglés y sus juegos.
    expect(runInContext("ING.map((t) => t.id).join() + ' ' + EN.numbers[2].en", global)).toBe('EN-HELLO,EN-COLORS,EN-NUMBERS,EN-ANIMALS Three');
    for (const k of ['EnConocer', 'EnEscucha', 'EnGlobos', 'EnCuenta', 'sayMix']) expect(typeof global[k], k).toBe('function');
    // escenas/escenas2d.ts: las escenas 2D en SCENES y la lista de todos los temas.
    expect(runInContext("['title', 'edad', 'juego', 'asamblea', 'album', 'dormir'].every((n) => typeof SCENES[n].draw === 'function')", global)).toBe(true);
    expect(runInContext("TEMAS.length === Object.keys(TEMA).length && TEMA['EN-HELLO'] === ING[0]", global)).toBe(true);
    for (const k of ['finishGame', 'ponFinishGame', 'suggestTema', 'stationPos', 'drawFace', 'tree', 'inR']) expect(typeof global[k], k).toBe('function');
    // escenas/zonas.ts: las zonas, sus escenas y las reglas del camino (cambia SCENES.map y suggestTema al cargarse).
    expect(runInContext("Object.keys(ZONES).join() + ' ' + ['jardin', 'bosque', 'montana', 'fiestas', 'ingles', 'cofre'].every((z) => typeof SCENES[z].draw === 'function')", global)).toBe('jardin,bosque,montana,fiestas,ingles true');
    expect(runInContext("S.age = 3; [zoneOpen('jardin'), temaOpen(T3[0]), curTema('jardin') === T3[0], suggestTema() === T3[0]].join()", global)).toBe('true,true,true,true');
    for (const k of ['goSeguir', 'ponGoSeguir', 'zoneScene', 'grantGift', 'isBday']) expect(typeof global[k], k).toBe('function');
    // escenas/tienda.ts: monedas, tienda y casa de Tito (añade los campos de DEF2 a S y las escenas tienda y casaTito).
    expect(runInContext("[S.coins, S.tito.shell, S.vales.length, SHOP.length > 50, typeof SCENES.tienda.draw, typeof SCENES.casaTito.draw].join()", global)).toBe('0,naranja,6,true,function,function');
    for (const k of ['giveCoins', 'creditCoins', 'STARS', 'drawCoinHUD', 'placeHome', 'wear', 'roomsOpen']) expect(typeof global[k], k).toBe('function');
    // escenas/repaso.ts: el repaso diario (añade kg y gs a S, la escena repaso y REP_ON para las pruebas).
    expect(runInContext("[typeof S.kg, typeof S.gs, typeof SCENES.repaso.draw, REP_ON].join()", global)).toBe('object,object,function,false');
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
