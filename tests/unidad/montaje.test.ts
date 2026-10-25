// Pruebas del montaje (herramientas/vite/curiolandia.mts): que la página lleve el juego entero (los módulos) en un solo
// <script>, sin código global (desde la fase 2p) ni depender de internet (ni Google Fonts ni cdnjs), que los módulos
// dejen en globalThis lo del puente de src/modulos.ts y pongan el juego en marcha, y que el service worker use la caché
// propia con la versión de package.json, que la partida lleve su versión (fase 3f) y que el reloj y el azar se
// puedan cambiar con ponPuertos (fase 3g). Las reglas del juego (fase 3)
// tienen sus propias pruebas en tests/unidad/.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { beforeAll, describe, expect, test } from 'vitest';
import { PREFIJO_CACHE, codigoModulos, nombreCache, paginaJuego, serviceWorker } from '../../herramientas/vite/curiolandia.mts';
import { VERSION_PARTIDA } from '../../src/dominio/partida.ts';

const RAIZ = join(import.meta.dirname, '..', '..');
const SRC = join(RAIZ, 'src');
// icons.js es una herramienta aparte (genera iconos con Node), no parte del juego.
const FUERA_DEL_JUEGO: readonly string[] = ['icons.js'];

describe('src/', () => {
  // Desde la fase 2p no queda código global: boot.js, el último, es aplicacion/arranque.ts. Los demás (core.js, lex.js,
  // comps.js, comps2.js, los temas, cuentos.js, extras.js, ingles.js, scenes.js, zonas.js, tienda.js, repaso.js,
  // adult.js y world3d.js) ya eran módulos (ver docs/ARQUITECTURA.md).
  test('no quedan .js del juego: todo son módulos', () => {
    expect(readdirSync(SRC).filter((f) => f.endsWith('.js') && !FUERA_DEL_JUEGO.includes(f))).toEqual([]);
  });
});

describe('paginaJuego', () => {
  const pagina = { publicada: '', desarrollo: '', modulos: '' };
  beforeAll(async () => {
    pagina.publicada = await paginaJuego({ src: SRC, conServiceWorker: true });
    pagina.desarrollo = await paginaJuego({ src: SRC, conServiceWorker: false });
    pagina.modulos = await codigoModulos(SRC);
  });

  test('lleva el juego en un solo <script> normal, sin código global', () => {
    const { publicada, modulos } = pagina;
    expect(publicada.indexOf(`<script>\n${modulos}</script>`)).toBeGreaterThan(0);
    // Los otros <script> son three.min.js (head.html) y el registro del service worker, en una línea.
    expect(publicada.match(/<script>\n/g)).toHaveLength(1);
  });

  // Las fuentes que pide el arranque (aplicacion/arranque.ts): aquí no llegan nunca, así que el juego no va a la
  // portada (sin lienzo de verdad no se puede dibujar).
  const fuentesPedidas: string[] = [];
  // Ejecuta los módulos en un navegador de mentira (lo justo para que el núcleo arranque: lienzo, localStorage,
  // Image, fuentes...) y mira lo que dejan en globalThis (el puente de src/modulos.ts). guardado es lo que hay en
  // localStorage (por clave); sin nada, el juego empieza una partida nueva.
  const ejecutaModulos = (guardado: Readonly<Record<string, string>> = {}): Record<string, unknown> => {
    // aplicacion/adultos.ts conecta al cargarse los botones de los paneles y los eventos del lienzo y del documento.
    const lienzo = { width: 0, height: 0, style: {}, getContext: () => ({}), toDataURL: () => '', addEventListener: () => undefined };
    const global: Record<string, unknown> = {
      document: {
        getElementById: () => lienzo, createElement: () => lienzo, addEventListener: () => undefined,
        fonts: { load: (f: string) => { fuentesPedidas.push(f); return new Promise(() => undefined); } },
      },
      setTimeout: () => 0,
      localStorage: { getItem: (k: string) => guardado[k] ?? null, setItem: () => undefined },
      location: { protocol: 'file:' },
      Image: class { src = ''; complete = false; },
      addEventListener: () => undefined,
      innerWidth: 1600,
      innerHeight: 900,
      performance,
      console,
    };
    global['window'] = global;
    createContext(global);
    runInContext(pagina.modulos, global);
    return global;
  };

  test('los módulos dejan en globalThis los dibujos, el núcleo, los componentes, los temas y lo demás', () => {
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
    for (const k of ['Busca', 'Arrastra', 'Memoria', 'Tracer', 'Story', 'thing']) expect(typeof global[k], k).toBe('function');
    expect(runInContext("unN(3, 'perro') + ' / ' + eseEs('mesa')", global)).toBe('tres perros / Esa es la mesa');
    // temas/: los temas de cada edad, makeGame y los fondos (temas4.ts añade los suyos a BG al cargarse).
    expect(runInContext('[T3.length, T4.length, T5.length].join()', global)).toBe('12,12,12');
    for (const k of ['makeGame', 'vestir']) expect(typeof global[k], k).toBe('function');
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
    for (const k of ['finishGame', 'drawFace', 'tree', 'inR', 'isBday']) expect(typeof global[k], k).toBe('function');
    // escenas/zonas.ts: las zonas, sus escenas (con el mapa y la casita, desde la fase 4d solo aquí) y las reglas del camino.
    expect(runInContext("Object.keys(ZONES).join() + ' ' + ['map', 'casita', 'jardin', 'bosque', 'montana', 'fiestas', 'ingles', 'cofre'].every((z) => typeof SCENES[z].draw === 'function')", global)).toBe('jardin,bosque,montana,fiestas,ingles true');
    expect(runInContext("S.age = 3; [zoneOpen('jardin'), temaOpen(T3[0]), curTema('jardin') === T3[0], suggestTema() === T3[0]].join()", global)).toBe('true,true,true,true');
    for (const k of ['goSeguir', 'ponGoSeguir', 'suggestTema', 'stationPos', 'ponStationPos', 'zoneScene', 'grantGift']) expect(typeof global[k], k).toBe('function');
    // escenas/tienda.ts: monedas, tienda y casa de Tito (añade los campos de DEF2 a S y las escenas tienda y casaTito).
    expect(runInContext("[S.coins, S.tito.shell, S.vales.length, SHOP.length > 50, typeof SCENES.tienda.draw, typeof SCENES.casaTito.draw].join()", global)).toBe('0,naranja,6,true,function,function');
    for (const k of ['giveCoins', 'creditCoins', 'STARS', 'drawCoinHUD', 'placeHome', 'wear', 'roomsOpen']) expect(typeof global[k], k).toBe('function');
    // escenas/repaso.ts: el repaso diario (añade kg y gs a S, la escena repaso y REP_ON para las pruebas).
    expect(runInContext("[typeof S.kg, typeof S.gs, typeof SCENES.repaso.draw, REP_ON].join()", global)).toBe('object,object,function,false');
    // aplicacion/adultos.ts: la zona de adultos, el bucle frame() (lo pone en marcha aplicacion/arranque.ts), la copia de
    // seguridad y window.__cl.
    for (const k of ['frame', 'openAdult', 'closeAdult', 'openNameDlg', 'openResetDlg', 'doReset', 'bkEncode', 'bkDecode']) expect(typeof global[k], k).toBe('function');
    expect(runInContext("__cl.go === undefined ? 'no' : typeof __cl.go + ' ' + (__cl.S === S)", global)).toBe('function true');
    // mundo3d/mundo3d.ts: sin Three.js (aquí no hay WebGL) la capa 3D no se monta: R3frame sigue en null y el juego va en 2D.
    expect(runInContext("R3frame === null && window.__w3 === undefined && SCENES.map.three === undefined", global)).toBe(true);
  });

  test('al cargar, arranca el juego: espera a las fuentes Andika y Fredoka', () => {
    fuentesPedidas.length = 0;
    ejecutaModulos();
    expect(fuentesPedidas).toEqual(['700 100px Andika', '700 100px Fredoka']);
  });

  // Desde la fase 3f la partida lleva su versión (dominio/partida.ts): una nueva empieza en la actual y una de
  // curiolandia-3d (sin versión) se pone al día al cargarla, sin perder nada.
  test('la partida lleva su versión: la nueva, la actual; la de curiolandia-3d se pone al día al cargar', () => {
    expect(ejecutaModulos()['S']).toMatchObject({ ver: VERSION_PARTIDA, age: 0 });
    const vieja = { name: 'Leo', coins: 7, temas: { '3A-T1': { g: { 0: 1 }, done: 0 } } };
    const S = ejecutaModulos({ 'curiolandia.v1': JSON.stringify(vieja) })['S'];
    expect(S).toMatchObject({ ...vieja, ver: VERSION_PARTIDA, voz: 'nav' });
  });

  // Desde la fase 3g el juego pide la hora y el azar a sus puertos (aplicacion/puertos.ts): una prueba puede fijarlos
  // sin tocar Date ni Math.random.
  test('con un reloj y un azar de prueba (ponPuertos), el juego usa esa fecha y ese azar', () => {
    const global = ejecutaModulos();
    runInContext('ponPuertos({ reloj: { ahora: () => new Date(2026, 11, 25, 10) }, azar: { numero: () => 0 } })', global);
    expect(runInContext('today()', global)).toBe('2026-12-25');
    expect(runInContext("pick(['a', 'b', 'c'])", global)).toBe('a');
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
