// Pruebas de los sitios de la casa de Tito (src/dominio/casaSitios.ts, fase M1 de docs/PLAN-CASA-MEJORA.md): que cada
// objeto de la casa de la tienda tiene tamaño y cabe en algún sitio, que en un sitio solo hay un objeto, que los
// muebles añaden sitios encima y los pierden al guardarse, que asignarSitios ordena sin mover a nadie de habitación y
// que se puede repetir, y que «¡Ordena, Tito!» lleva cada cosa a su habitación. Los objetos de la tienda se leen de
// SHOP (escenas/tienda.ts) cargando el juego con ejecutaModulos, como en casa.test.ts.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las posiciones de cada caso: leerlas tal cual en la
   prueba es más claro que darles un nombre. */
import { join } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { codigoModulos } from '../../herramientas/vite/curiolandia.mts';
import {
  EN_BAUL,
  PLANO,
  TAMANOS,
  asignarSitios,
  cabe,
  colocar,
  guardar,
  libres,
  ordenar,
  quienEsta,
  sitioDe,
  sitioMasCercano,
  sitiosDe,
  type Casa,
} from '../../src/dominio/casaSitios.ts';
import { ejecutaModulos } from './juegoEnVm.ts';

// Artículos de la tienda tal como los ve el juego: id, si es ropa (slot), su categoría y su habitación.
type ArticuloVisto = { id: string; slot?: string; cat: string; room?: string; pref?: string };
let SHOP: ArticuloVisto[] = [];
let CASA: string[] = [];

beforeAll(async () => {
  const g = ejecutaModulos(await codigoModulos(join(import.meta.dirname, '..', '..', 'src')));
  SHOP = g['SHOP'] as ArticuloVisto[];
  CASA = SHOP.filter((a) => !a.slot && a.cat !== 'vales').map((a) => a.id);
}, 120_000);

// sinRepetir(casa): ¿ningún sitio tiene dos objetos?
const sinRepetir = (casa: Casa) => {
  const hs = Object.values(casa)
    .map((p) => p?.h)
    .filter(Boolean);
  return new Set(hs).size === hs.length;
};

describe('las tablas', () => {
  test('cada objeto de la casa de la tienda tiene tamaño, y no sobra ninguno', () => {
    expect(CASA.filter((id) => !TAMANOS[id])).toEqual([]);
    expect(Object.keys(TAMANOS).filter((id) => !CASA.includes(id))).toEqual([]);
    expect(Object.keys(TAMANOS)).toHaveLength(55);
  });

  test('cada tamaño cabe en algún sitio de una habitación, y los ids de los sitios no se repiten', () => {
    const tipos = sitiosDe(PLANO, 'salon', {}).map((s) => s.tipo);
    for (const t of ['grande', 'mediano', 'pequeno', 'pared', 'alfombra'] as const)
      expect(tipos.some((tipo) => cabe(t, tipo))).toBe(true);
    for (const r of Object.keys(PLANO.habitaciones)) {
      const ids = sitiosDe(PLANO, r, {}).map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('lo grande solo va en sitios grandes; lo pequeño prefiere encima de un mueble', () => {
    expect([cabe('grande', 'suelo'), cabe('grande', 'suelo-grande'), cabe('pequeno', 'encima')]).toEqual([
      false,
      true,
      true,
    ]);
    const casa = colocar(PLANO, {}, 'mesa', 'cocina:grande1');
    expect(libres(PLANO, 'cocina', casa, 'tarta')[0].tipo).toBe('encima');
    expect(libres(PLANO, 'cocina', casa, 'nevera').map((s) => s.tipo)).toEqual(['suelo-grande', 'suelo-grande']);
  });
});

describe('colocar y guardar', () => {
  test('colocar pone el objeto en el sitio, con su habitación y la posición del sitio', () => {
    const casa = colocar(PLANO, {}, 'sofa', 'salon:grande2');
    const s = sitioDe(PLANO, casa, 'salon:grande2')!;
    expect(casa['sofa']).toEqual({ x: s.x, y: s.y, r: 'salon', h: 'salon:grande2' });
  });

  test('no se coloca en un sitio ocupado, que no existe o donde no cabe', () => {
    const casa = colocar(PLANO, {}, 'sofa', 'salon:grande2');
    expect(colocar(PLANO, casa, 'piano', 'salon:grande2')).toBe(casa);
    expect(colocar(PLANO, casa, 'piano', 'salon:nada')).toBe(casa);
    expect(colocar(PLANO, casa, 'piano', 'salon:suelo1')).toBe(casa);
    expect(colocar(PLANO, casa, 'cuento', 'salon:sofa:1')['cuento'].h).toBe('salon:sofa:1');
  });

  test('los muebles tienen sitios encima mientras están en un sitio; al guardarlos, lo de encima va al baúl', () => {
    let casa = colocar(PLANO, {}, 'mesa', 'cocina:grande1');
    casa = colocar(PLANO, casa, 'tarta', 'cocina:mesa:1');
    casa = colocar(PLANO, casa, 'olla', 'cocina:mesa:2');
    expect(quienEsta(casa, 'cocina:mesa:2')).toBe('olla');
    const g = guardar(PLANO, casa, 'mesa');
    expect([g['mesa'].r, g['tarta'].r, g['olla'].r, g['tarta'].h]).toEqual([EN_BAUL, EN_BAUL, EN_BAUL, undefined]);
    expect(sitiosDe(PLANO, 'cocina', g).some((s) => s.tipo === 'encima')).toBe(false);
    // mover la mesa a otro sitio también deja en el baúl lo de encima (sus sitios ya no están)
    const m = colocar(PLANO, casa, 'mesa', 'cocina:grande3');
    expect([m['mesa'].h, m['tarta'].r]).toEqual(['cocina:grande3', EN_BAUL]);
  });

  test('guardar algo que no está en la casa no cambia nada; las reglas no cambian lo que reciben', () => {
    const casa = Object.freeze(colocar(PLANO, {}, 'sofa', 'salon:grande2'));
    expect(guardar(PLANO, casa, 'piano')).toBe(casa);
    expect(() => guardar(PLANO, casa, 'sofa')).not.toThrow();
    expect(casa['sofa'].h).toBe('salon:grande2');
  });
});

describe('asignarSitios (la migración 4 → 5)', () => {
  test('cada objeto recibe el sitio libre más cercano en su habitación, sin moverse ni cambiar de habitación', () => {
    const casa: Casa = {
      sofa: { x: 990, y: 640, r: 'salon' },
      cuadro: { x: 800, y: 330 },
      robot: { x: 1300, y: 780, r: 'juegos' },
    };
    const n = asignarSitios(PLANO, casa);
    expect([n['sofa'].h, n['cuadro'].h, n['robot'].h]).toEqual(['salon:grande2', 'salon:pared1', 'juegos:suelo4']);
    expect([n['sofa'].x, n['sofa'].y, n['cuadro'].r]).toEqual([990, 640, undefined]);
  });

  test('con la casa llena, nunca hay dos en un sitio y lo que no cabe se queda sin sitio; repetirla no cambia nada', () => {
    const casa: Record<string, { x: number; y: number; r: string }> = {};
    CASA.forEach((id, i) => (casa[id] = { x: 400 + ((i * 97) % 1100), y: 600 + ((i * 53) % 200), r: 'salon' }));
    const n = asignarSitios(PLANO, casa);
    expect(sinRepetir(n)).toBe(true);
    const con = Object.keys(n).filter((id) => n[id].h);
    expect(con.length).toBeGreaterThan(12);
    expect(con.length).toBeLessThan(CASA.length);
    expect(asignarSitios(PLANO, n)).toEqual(n);
    expect(Object.keys(n).every((id) => n[id].r === 'salon' && n[id].x === casa[id].x)).toBe(true);
  });

  test('respeta los sitios buenos, arregla los malos y repetidos, y no toca el baúl ni lo roto', () => {
    const casa = {
      sofa: { x: 0, y: 0, r: 'salon', h: 'salon:grande1' },
      piano: { x: 0, y: 0, r: 'salon', h: 'salon:grande1' },
      tele: { x: 0, y: 0, r: 'salon', h: 'cocina:suelo1' },
      cama: { x: 0, y: 0, r: 'salon', h: 'salon:suelo1' },
      pato: { x: 1, y: 2, r: EN_BAUL },
      roto: null,
      raro: { x: 'a', y: 3 },
    } as unknown as Casa;
    const n = asignarSitios(PLANO, casa);
    expect(n['sofa'].h).toBe('salon:grande1');
    expect([n['piano'].h, n['cama'].h].every((h) => h && h !== 'salon:grande1' && h.includes('grande'))).toBe(true);
    expect(n['tele'].h!.startsWith('salon:')).toBe(true);
    expect([n['pato'], n['roto'], n['raro']]).toEqual([casa['pato'], null, casa['raro']]);
    expect(sinRepetir(n)).toBe(true);
  });

  test('lo pequeño va encima de los muebles que se quedaron en la habitación', () => {
    const n = asignarSitios(PLANO, { mesa: { x: 640, y: 650, r: 'cocina' }, tarta: { x: 600, y: 520, r: 'cocina' } });
    expect([n['mesa'].h, n['tarta'].h]).toEqual(['cocina:grande1', 'cocina:mesa:1']);
  });
});

describe('ordenar («¡Ordena, Tito!», para la fase M2)', () => {
  test('cada cosa va a su habitación si está abierta (si no, al salón) y lo que no cabe, al baúl', () => {
    const habitual = (id: string) => {
      const a = SHOP.find((x) => x.id === id);
      return a && (a.room || a.pref);
    };
    const casa: Casa = Object.fromEntries(CASA.map((id) => [id, { x: 900, y: 700, r: 'salon' }]));
    const n = ordenar(PLANO, casa, habitual, ['salon', 'cocina', 'bano']);
    expect(n['nevera'].r).toBe('cocina');
    expect(n['banera'].r).toBe('bano');
    expect(['salon', EN_BAUL]).toContain(n['telescopio'].r);
    expect(sinRepetir(n)).toBe(true);
    expect(Object.values(n).every((p) => (p.r === EN_BAUL) === !p.h)).toBe(true);
  });

  test('sitioMasCercano da undefined cuando no queda sitio', () => {
    let casa: Casa = {};
    for (const [id, h] of [
      ['sofa', 'salon:grande1'],
      ['piano', 'salon:grande2'],
      ['cama', 'salon:grande3'],
    ])
      casa = colocar(PLANO, casa, id, h);
    expect(sitioMasCercano(PLANO, 'salon', casa, 'nevera', 0, 0)).toBeUndefined();
  });
});
