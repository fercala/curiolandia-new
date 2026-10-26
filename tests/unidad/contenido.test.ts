// Pruebas del contenido (fase 5b de docs/PLAN-MIGRACION.md): que los temas, sus palabras y juegos y los cuentos estén
// bien escritos. Carga el juego entero en un navegador de mentira (juegoEnVm.ts) y mira lo que dejan los módulos en
// globalThis: los ids de los temas no se repiten, cada tema está en su zona, cada dibujo que nombran existe, cada
// fondo está en BG y cada juego se puede crear (makeGame, temas/hacerJuego.ts). Un error aquí es un tema o un cuento
// mal escrito: el mensaje dice cuál.
import { join } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { codigoModulos } from '../../herramientas/vite/curiolandia.mts';
import { ejecutaModulos } from './juegoEnVm.ts';

const SRC = join(import.meta.dirname, '..', '..', 'src');
// Prefijo de las caritas de emoción ('emo:alegria'), que dibuja drawFace (juegos/caras.ts) y no son de IMG.
const EMO_PREFIJO = 'emo:';
// Por debajo de estos números, algo ha dejado de cargarse (hoy hay 59 temas y un cuento por tema del camino).
const MIN_TEMAS = 40;
const MIN_CUENTOS = 30;
// Iconos de juego que no son dibujos de IMG: los pinta drawStation (escenas/escenas2d.ts) con las palabras del tema.
const ICONOS_DE_ESTACION = ['lupa', 'busca', 'memo'];

/** Lo que estas pruebas leen de un tema (el tipo Tema de src/juegos/tipos.ts, sin las funciones). */
interface TemaLeido {
  id: string;
  zone: string;
  icon: string;
  bg: unknown;
  en?: string;
  words?: Array<{ k?: string; ex?: string[]; name?: unknown; draw?: unknown }>;
  games: Array<{ t: string; icon?: string; make?: unknown; song?: string }>;
}

/** Lo que estas pruebas leen de un cuento (el tipo Cuento de src/contenido/tipos.ts). */
interface CuentoLeido {
  pages: Array<{ bg: string; items: Array<[string, number, number, number, boolean?]> }>;
  qs: Array<{ ok: string; opts: string[] }>;
}

const juego: Record<string, unknown> = {};
// Las listas que se leen del juego: los temas por lista, los dibujos (IMG, uno por clave de PICS), las caritas (EMO),
// los fondos (BG), los cuentos y las canciones.
const lee = <T>(k: string): T => juego[k] as T;
beforeAll(async () => {
  Object.assign(juego, ejecutaModulos(await codigoModulos(SRC)));
});

// existeDibujo(k): si k se puede dibujar: una clave de IMG (los dibujos de PICS) o una carita 'emo:…' de EMO.
function existeDibujo(k: string): boolean {
  if (k.startsWith(EMO_PREFIJO)) return k.slice(EMO_PREFIJO.length) in lee<Record<string, unknown>>('EMO');
  return k in lee<Record<string, unknown>>('IMG');
}

// dibujosDe(t): las claves de dibujo que nombra el tema t, con dónde: su icono, el de cada juego (salvo los de
// ICONOS_DE_ESTACION) y sus palabras con sus ejemplos. Las palabras dibujadas a mano (con draw) no tienen clave.
function dibujosDe(t: TemaLeido): Array<[string, string]> {
  const juegos = t.games.flatMap((g, j): Array<[string, string]> => (g.icon && !ICONOS_DE_ESTACION.includes(g.icon) ? [[g.icon, `${t.id}: juego ${j}`]] : []));
  const palabras = (t.words ?? []).flatMap((w): Array<[string, string]> => [
    ...(w.k ? [[w.k, `${t.id}: palabra`] as [string, string]] : []),
    ...(w.ex ?? []).map((e): [string, string] => [e, `${t.id}: ejemplo de ${w.k}`]),
  ]);
  return [[t.icon, `${t.id}: icon`], ...juegos, ...palabras];
}

describe('los temas', () => {
  const temas = (): TemaLeido[] => lee<TemaLeido[]>('TEMAS');

  test('hay temas y sus ids no se repiten (son la clave del progreso guardado)', () => {
    const ids = temas().map((t) => t.id);
    expect(ids.length).toBeGreaterThan(MIN_TEMAS);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  test('cada tema está en la zona de su lista', () => {
    const zonas: Array<[string, string[]]> = [
      ['jardin', ['T3', 'C3']], ['bosque', ['T4', 'C4']], ['montana', ['T5', 'C5']],
      ['extras', ['CAN', 'RUT', 'TRZ']], ['fiestas', ['FIESTAS']], ['ingles', ['ING']],
    ];
    const fuera = zonas.flatMap(([zona, listas]) =>
      listas.flatMap((l) => juego[l] as TemaLeido | TemaLeido[]).filter((t) => t.zone !== zona).map((t) => `${t.id} no es de ${zona}`));
    expect(fuera).toEqual([]);
    expect(temas().filter((t) => !['jardin', 'bosque', 'montana', 'extras', 'fiestas', 'ingles'].includes(t.zone))).toEqual([]);
  });

  test('cada dibujo que nombran existe (icono, juegos, palabras y ejemplos)', () => {
    const faltan = temas().flatMap(dibujosDe).filter(([k]) => !existeDibujo(k)).map(([k, d]) => `${d}: ${k}`);
    expect(faltan).toEqual([]);
  });

  test('cada fondo es uno de BG', () => {
    const fondos = Object.values(lee<Record<string, unknown>>('BG'));
    expect(temas().filter((t) => !fondos.includes(t.bg)).map((t) => t.id)).toEqual([]);
  });

  test('cada juego se puede crear: tiene make o makeGame sabe hacerlo con lo que trae el tema', () => {
    const cuentos = lee<Record<string, unknown>>('CUENTOS');
    const canciones = lee<Record<string, unknown>>('SONGS');
    // sinFabrica(t, g): por qué makeGame no sabría crear el juego g del tema t (vacío si sí sabe).
    const sinFabrica = (t: TemaLeido, g: TemaLeido['games'][number]): string => {
      if (g.make) return '';
      if (t.en && ['enConocer', 'enEscucha', 'enGlobos', 'enCuenta'].includes(g.t)) return '';
      if (g.t === 'cuento') return t.id in cuentos ? '' : 'cuento sin CUENTOS[id]';
      if (g.t === 'cancion') return g.song && g.song in canciones ? '' : `canción sin SONGS[${g.song}]`;
      if (['conocer', 'busca', 'memoria'].includes(g.t)) return t.words?.length ? '' : `${g.t} sin words`;
      return `tipo ${g.t} sin make`;
    };
    const malos = temas().flatMap((t) => t.games.map((g, j) => [`${t.id} juego ${j}`, sinFabrica(t, g)])).filter(([, p]) => p);
    expect(malos).toEqual([]);
  });
});

describe('los cuentos', () => {
  const cuentos = (): Array<[string, CuentoLeido]> => Object.entries(lee<Record<string, CuentoLeido>>('CUENTOS'));

  test('cada cuento es de un tema que existe', () => {
    const tema = lee<Record<string, unknown>>('TEMA');
    expect(cuentos().length).toBeGreaterThan(MIN_CUENTOS);
    expect(cuentos().filter(([id]) => !(id in tema)).map(([id]) => id)).toEqual([]);
  });

  test('cada página tiene un fondo de BG y sus dibujos existen', () => {
    const fondos = lee<Record<string, unknown>>('BG');
    const malos = cuentos().flatMap(([id, c]) => c.pages.flatMap((p, i) => [
      ...(p.bg in fondos ? [] : [`${id} página ${i}: fondo ${p.bg}`]),
      ...p.items.filter(([k]) => !existeDibujo(k)).map(([k]) => `${id} página ${i}: ${k}`),
    ]));
    expect(malos).toEqual([]);
  });

  test('cada pregunta tiene la respuesta entre sus opciones y todas se pueden dibujar', () => {
    const malos = cuentos().flatMap(([id, c]) => c.qs.flatMap((q, i) => [
      ...(q.opts.includes(q.ok) ? [] : [`${id} pregunta ${i}: ${q.ok} no está en opts`]),
      ...q.opts.filter((k) => !existeDibujo(k)).map((k) => `${id} pregunta ${i}: ${k}`),
    ]));
    expect(malos).toEqual([]);
  });
});
