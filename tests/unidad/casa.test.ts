// Pruebas de las reglas de la casa de Tito interactiva y de las mascotas que crecen (src/dominio/casa.ts, fase C1 de
// docs/PLAN-CASA.md): que cada objeto de la casa de la tienda tiene su reacción, las combinaciones, el álbum de
// sorpresas, cómo se cuidan y crecen las mascotas (sin restar nunca) y la flor del huerto. Sin navegador: los objetos
// de la tienda se leen de SHOP (escenas/tienda.ts) cargando el juego con ejecutaModulos, como en contenido.test.ts.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (días, etapas): leerlos tal
   cual en la prueba es más claro que darles un nombre. */
import { join } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { codigoModulos } from '../../herramientas/vite/curiolandia.mts';
import {
  COMBINACIONES, CUIDADOS_POR_DIA, DIAS_ETAPA, MASCOTAS, REACCIONES, TOTAL_SORPRESAS, combinacion, cuantasSorpresas,
  cuidadosDe, cuidar, descubrir, etapaFlor, etapaMascota, fichaComprada, fichaDe, fichaNueva, huertoNuevo, idSorpresa,
  quiereHoy, reaccionDe, regar,
} from '../../src/dominio/casa.ts';
import { FRASES_CASA } from '../../src/contenido/casa.ts';
import { ejecutaModulos } from './juegoEnVm.ts';

// Artículos de la tienda tal como los ve el juego: id, si es ropa (slot) y su categoría.
type ArticuloVisto = { id: string; slot?: string; cat: string };
let SHOP: ArticuloVisto[] = [];

beforeAll(async () => {
  const g = ejecutaModulos(await codigoModulos(join(import.meta.dirname, '..', '..', 'src')));
  SHOP = g['SHOP'] as ArticuloVisto[];
}, 120_000);

describe('los objetos de la casa', () => {
  test('cada objeto de la casa de la tienda tiene su reacción, salvo las mascotas, y no sobra ninguna', () => {
    const casa = SHOP.filter((a) => !a.slot && a.cat !== 'vales').map((a) => a.id);
    const sinMascotas = casa.filter((id) => !MASCOTAS.includes(id));
    expect(sinMascotas.filter((id) => !reaccionDe(id))).toEqual([]);
    expect(Object.keys(REACCIONES).filter((id) => !sinMascotas.includes(id))).toEqual([]);
    expect(MASCOTAS.filter((id) => !casa.includes(id))).toEqual([]);
    expect(Object.keys(REACCIONES)).toHaveLength(49);
  });

  test('cada objeto con reacción tiene su frase (contenido/casa.ts) y no sobra ninguna (fase C2)', () => {
    expect(Object.keys(REACCIONES).filter((id) => !FRASES_CASA[id])).toEqual([]);
    expect(Object.keys(FRASES_CASA).filter((id) => !reaccionDe(id))).toEqual([]);
  });

  test('las mascotas y lo desconocido no tienen reacción', () => {
    expect([...MASCOTAS, 'nada', 'toString'].map(reaccionDe)).toEqual(MASCOTAS.map(() => null).concat([null, null]));
  });

  test('las escenas pequeñas: el telescopio abre el cielo y los instrumentos comparten escena', () => {
    expect(reaccionDe('telescopio')).toEqual({ tito: 'mirar', escena: 'cielo' });
    const instrumentos = Object.entries(REACCIONES).filter(([, r]) => r.escena === 'instrumentos').map(([id]) => id);
    expect(instrumentos.sort()).toEqual(['guitarra', 'piano', 'tambor', 'xilofono']);
    expect(new Set(Object.values(REACCIONES).map((r) => r.escena).filter(Boolean)).size).toBe(10);
  });

  test('las combinaciones son de objetos que existen y se encuentran en cualquier orden', () => {
    const ids = SHOP.map((a) => a.id);
    expect(COMBINACIONES.flatMap((c) => [c.a, c.b]).filter((id) => !ids.includes(id))).toEqual([]);
    expect(combinacion('banera', 'pato')).toEqual({ a: 'pato', b: 'banera' });
    expect(combinacion('pato', 'sofa')).toBeNull();
    expect(idSorpresa('banera', 'pato')).toBe('pato+banera');
    expect(idSorpresa('piano')).toBe('piano');
  });
});

describe('el álbum de sorpresas', () => {
  test('descubrir apunta una vez y no cambia lo que recibe', () => {
    const antes = { piano: 1 };
    const r1 = descubrir(antes, 'telescopio');
    expect(r1).toEqual({ sorpresas: { piano: 1, telescopio: 1 }, nueva: true });
    expect(antes).toEqual({ piano: 1 });
    expect(descubrir(r1.sorpresas, 'telescopio').nueva).toBe(false);
  });

  test('se cuentan solo las que existen; el total es objetos más combinaciones', () => {
    expect(TOTAL_SORPRESAS).toBe(49 + COMBINACIONES.length);
    expect(cuantasSorpresas({ piano: 1, 'pato+banera': 1, viejo: 1, 'banera+pato': 1 })).toBe(2);
  });
});

describe('las mascotas que crecen', () => {
  test('nacen bebés; las compradas antes son jóvenes', () => {
    expect(etapaMascota(fichaNueva().dias)).toBe(0);
    expect(etapaMascota(fichaComprada().dias)).toBe(1);
    expect([0, 2, 3, 7, 8, 50].map(etapaMascota)).toEqual([0, 0, 1, 1, 2, 2]);
    expect(DIAS_ETAPA).toEqual([3, 8]);
  });

  test('un día cuenta con dos cuidados distintos; repetir no suma', () => {
    const a = cuidar(fichaNueva(), 'comer', '2026-11-03');
    expect(a.cuenta).toBe(false);
    const b = cuidar(a.ficha, 'comer', '2026-11-03');
    expect([b.cuenta, b.ficha.dias]).toEqual([false, 0]);
    const c = cuidar(b.ficha, 'agua', '2026-11-03');
    expect([c.cuenta, c.ficha.dias, c.ficha.hechos.length]).toEqual([true, 1, CUIDADOS_POR_DIA]);
    const d = cuidar(c.ficha, 'jugar', '2026-11-03');
    expect([d.cuenta, d.ficha.dias]).toEqual([false, 1]);
  });

  test('otro día empieza de cero y crece al llegar a los días de su etapa, sin días seguidos', () => {
    const fin = ['2026-11-01', '2026-11-05', '2026-11-20'].reduce(({ f, crecio }, dia) => {
      const r = cuidar(cuidar(f, 'comer', dia).ficha, 'lavar', dia);
      return { f: r.ficha, crecio: r.crece ? [...crecio, dia] : crecio };
    }, { f: fichaNueva(), crecio: [] as string[] });
    expect([fin.f.dias, etapaMascota(fin.f.dias), fin.crecio]).toEqual([3, 1, ['2026-11-20']]);
  });

  test('no cambia la ficha que recibe', () => {
    const f = fichaNueva();
    cuidar(f, 'comer', '2026-11-03');
    expect(f).toEqual(fichaNueva());
  });

  test('qué pide hoy: el primer cuidado sin hacer, o nada si hoy ya cuenta', () => {
    const f = cuidar(fichaNueva(), 'comer', '2026-11-03').ficha;
    expect(quiereHoy(f, 'gato', '2026-11-03')).toBe('agua');
    expect(quiereHoy(f, 'gato', '2026-11-04')).toBe('comer');
    expect(quiereHoy(cuidar(f, 'mirar', '2026-11-03').ficha, 'pecera', '2026-11-03')).toBeNull();
    expect(cuidadosDe('pecera')).toEqual(['comer', 'mirar']);
  });

  test('fichaDe: sin ficha, joven; una ficha rota se arregla sin perder los días', () => {
    expect(fichaDe({}, 'gato')).toEqual(fichaComprada());
    expect(fichaDe({ gato: null }, 'gato')).toEqual(fichaComprada());
    expect(fichaDe({ gato: { dias: 6, nombre: 3, hechos: ['comer', 2] } }, 'gato')).toEqual({ nombre: '', dias: 6, dia: '', hechos: ['comer'] });
    expect(fichaDe({ gato: { dias: -1 } }, 'gato').dias).toBe(DIAS_ETAPA[0]);
  });
});

describe('el huerto', () => {
  test('regar cuenta una vez al día y la flor crece por etapas', () => {
    const a = regar(huertoNuevo(), '2026-11-03');
    expect(a).toEqual({ huerto: { dias: 1, dia: '2026-11-03' }, cuenta: true });
    expect(regar(a.huerto, '2026-11-03').cuenta).toBe(false);
    expect([0, 1, 2, 3, 5, 8, 20].map(etapaFlor)).toEqual([0, 1, 1, 2, 3, 4, 4]);
  });
});
