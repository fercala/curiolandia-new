// Pruebas de las reglas de apertura (src/dominio/apertura.ts, fase 3a): qué zonas, casitas, juegos y sitios del mapa
// están abiertos y qué casita toca; desde la fase L1 (docs/PLAN-LECTURA.md), también las zonas de la Isla de las Letras. Usan un mapa pequeño inventado y partidas inventadas, sin navegador: cada prueba
// dice qué temas están terminados o empezados, la edad, el modo libre y el mes.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (edades, meses, casitas,
   juegos): leerlos tal cual en la prueba es más claro que darles un nombre. */
import { describe, expect, test } from 'vitest';
import {
  NEED, empezado, fiestaDelMes, juegoAbierto, siguienteJuego, siguienteTema, sitioAbierto, sitioNecesita, temaAbierto,
  siguienteLetra, temaQueToca, terminadasPrincipales, zonaAbierta, zonaDeLaEdad, zonaDeLetrasDeLaEdad,
} from '../../src/dominio/apertura.ts';
import type { Mapa, Partida, TemaAbrible } from '../../src/dominio/apertura.ts';

// tema(id, zona, rincon): un tema de mentira con tres juegos; rincon = es el Rincón de los Conceptos de su zona.
const tema = (id: string, zone?: string, rincon = false): TemaAbrible => ({ id, zone, concepts: rincon || undefined, games: ['a', 'b', 'c'] });
// camino(zona, letra, n): n temas en el camino de la zona (J1, J2...) y su Rincón de los Conceptos al final (JC).
const camino = (zona: string, letra: string, n: number): TemaAbrible[] =>
  [...Array.from({ length: n }, (_x, i) => tema(`${letra}${i + 1}`, zona)), tema(`${letra}C`, zona, true)];

const MAPA: Mapa<TemaAbrible> = {
  zonas: {
    jardin: camino('jardin', 'J', 6),
    bosque: camino('bosque', 'B', 6),
    montana: camino('montana', 'M', 3),
    fiestas: [tema('F-navidad', 'fiestas'), tema('F-carnaval', 'fiestas'), tema('F-libro', 'fiestas')],
    ingles: [tema('EN-1', 'ingles'), tema('EN-2', 'ingles')],
  },
  can: tema('X-CAN'),
  rut: tema('X-RUT'),
  trz: tema('X-TRZ'),
};

/** Cómo es una partida de prueba: temas terminados, juegos jugados por tema, edad, modo libre y mes (enero si no se dice). */
interface Datos {
  readonly hechos?: readonly string[];
  readonly jugados?: Readonly<Record<string, readonly number[]>>;
  readonly edad?: number;
  readonly libre?: boolean;
  readonly mes?: number;
}

// partida(d): una Partida con los datos d (edad 3, sin modo libre y en mayo si no se dice otra cosa).
const MAYO = 4;
const partida = (d: Datos = {}): Partida => ({
  libre: d.libre ?? false,
  edad: d.edad ?? 3,
  mes: () => d.mes ?? MAYO,
  progreso: (id) => ({
    done: d.hechos?.includes(id) ? 1 : 0,
    g: Object.fromEntries((d.jugados?.[id] ?? []).map((j) => [j, 1])),
  }),
});

// buscar(id): el tema id del mapa de prueba (falla si no está).
const buscar = (id: string): TemaAbrible => {
  const t = [...Object.values(MAPA.zonas).flat(), MAPA.can, MAPA.rut, MAPA.trz].find((x) => x.id === id);
  if (!t) throw new Error(`no hay tema ${id}`);
  return t;
};
const abierto = (p: Partida, id: string): boolean => temaAbierto(p, MAPA, buscar(id));
const JARDIN_HECHO = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6'];

describe('zonas', () => {
  test('el jardín y las zonas sin edad, siempre abiertos', () => {
    expect(zonaAbierta(partida(), MAPA, 'jardin')).toBe(true);
    expect(zonaAbierta(partida(), MAPA, 'fiestas')).toBe(true);
  });

  test('el bosque se abre con 4 años, en modo libre o con 6 flores en el jardín', () => {
    expect(zonaAbierta(partida(), MAPA, 'bosque')).toBe(false);
    expect(zonaAbierta(partida({ edad: 4 }), MAPA, 'bosque')).toBe(true);
    expect(zonaAbierta(partida({ libre: true }), MAPA, 'bosque')).toBe(true);
    expect(zonaAbierta(partida({ hechos: JARDIN_HECHO.slice(0, 5) }), MAPA, 'bosque')).toBe(false);
    expect(zonaAbierta(partida({ hechos: JARDIN_HECHO }), MAPA, 'bosque')).toBe(true);
  });

  test('la montaña pide el bosque abierto y 6 flores en él', () => {
    const bosque = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
    expect(zonaAbierta(partida({ hechos: bosque }), MAPA, 'montana')).toBe(false);
    expect(zonaAbierta(partida({ edad: 4, hechos: bosque }), MAPA, 'montana')).toBe(true);
    expect(zonaAbierta(partida({ edad: 5 }), MAPA, 'montana')).toBe(true);
  });

  test('zona de la edad: la suya si está abierta; si no, el jardín', () => {
    expect(zonaDeLaEdad(partida({ edad: 4 }), MAPA)).toBe('bosque');
    expect(zonaDeLaEdad(partida({ edad: 5 }), MAPA)).toBe('montana');
    expect(zonaDeLaEdad(partida({ edad: 9 }), MAPA)).toBe('jardin');
  });
});

describe('casitas', () => {
  test('en el camino, cada casita se abre al terminar la anterior; lo empezado no se cierra', () => {
    expect(abierto(partida(), 'J1')).toBe(true);
    expect(abierto(partida(), 'J2')).toBe(false);
    expect(abierto(partida({ hechos: ['J1'] }), 'J2')).toBe(true);
    expect(abierto(partida({ jugados: { J4: [0] } }), 'J4')).toBe(true);
    expect(empezado(partida({ jugados: { J4: [0] } }), buscar('J4'))).toBe(true);
    expect(abierto(partida({ libre: true }), 'J5')).toBe(true);
  });

  test('en una zona cerrada no se abre ni la primera casita', () => {
    expect(abierto(partida(), 'B1')).toBe(false);
    expect(abierto(partida({ edad: 4 }), 'B1')).toBe(true);
  });

  test('el Rincón de los Conceptos pide NEED.concepts casitas de su zona', () => {
    expect(NEED['concepts']).toBe(3);
    expect(abierto(partida({ hechos: ['J1', 'J2'] }), 'JC')).toBe(false);
    expect(abierto(partida({ hechos: ['J1', 'J2', 'J3'] }), 'JC')).toBe(true);
  });

  test('fiestas: 4 casitas del camino y en orden, salvo la fiesta del mes', () => {
    const tres = ['J1', 'J2', 'J3'];
    const cuatro = [...tres, 'J4'];
    expect(abierto(partida({ hechos: tres }), 'F-navidad')).toBe(false);
    expect(abierto(partida({ hechos: cuatro }), 'F-navidad')).toBe(true);
    expect(abierto(partida({ hechos: cuatro }), 'F-carnaval')).toBe(false);
    expect(abierto(partida({ hechos: [...cuatro, 'F-navidad'] }), 'F-carnaval')).toBe(true);
    expect(abierto(partida({ hechos: cuatro, mes: 3 }), 'F-libro')).toBe(true);
    expect(abierto(partida({ hechos: tres, mes: 3 }), 'F-libro')).toBe(false);
  });

  test('inglés: 2 casitas del camino y en orden', () => {
    expect(abierto(partida({ hechos: ['J1'] }), 'EN-1')).toBe(false);
    expect(abierto(partida({ hechos: ['J1', 'J2'] }), 'EN-1')).toBe(true);
    expect(abierto(partida({ hechos: ['J1', 'J2'] }), 'EN-2')).toBe(false);
  });

  test('canciones, rutinas y trazos piden 1, 2 y 3 casitas de las zonas principales', () => {
    const p = partida({ edad: 4, hechos: ['J1', 'B1'] });
    expect(terminadasPrincipales(p, MAPA)).toBe(2);
    expect([abierto(p, 'X-CAN'), abierto(p, 'X-RUT'), abierto(p, 'X-TRZ')]).toEqual([true, true, false]);
  });

  test('un tema sin reglas está abierto; sin tema, no', () => {
    expect(temaAbierto(partida(), MAPA, tema('suelto'))).toBe(true);
    expect(temaAbierto(partida(), MAPA, null)).toBe(false);
  });
});

describe('juegos de una casita', () => {
  test('el primero siempre; los demás al terminar el anterior; los jugados se repiten', () => {
    const t = buscar('J1');
    expect([0, 1, 2].map((j) => juegoAbierto(partida(), t, j))).toEqual([true, false, false]);
    expect([0, 1, 2].map((j) => juegoAbierto(partida({ jugados: { J1: [0] } }), t, j))).toEqual([true, true, false]);
    expect(juegoAbierto(partida({ jugados: { J1: [2] } }), t, 2)).toBe(true);
    expect(juegoAbierto(partida({ libre: true }), t, 2)).toBe(true);
  });

  test('el siguiente juego es el primero abierto sin terminar; -1 si están todos', () => {
    const t = buscar('J1');
    expect(siguienteJuego(partida(), t)).toBe(0);
    expect(siguienteJuego(partida({ jugados: { J1: [0, 1] } }), t)).toBe(2);
    expect(siguienteJuego(partida({ jugados: { J1: [0, 1, 2] } }), t)).toBe(-1);
  });
});

describe('qué toca', () => {
  test('en una zona: la primera casita pendiente, luego el Rincón y al final nada', () => {
    expect(temaQueToca(partida({ hechos: ['J1'] }), MAPA, 'jardin')?.id).toBe('J2');
    expect(temaQueToca(partida({ hechos: JARDIN_HECHO }), MAPA, 'jardin')?.id).toBe('JC');
    expect(temaQueToca(partida({ hechos: [...JARDIN_HECHO, 'JC'] }), MAPA, 'jardin')).toBeNull();
    expect(temaQueToca(partida({ hechos: ['J1', 'J2', 'J3', 'J4'] }), MAPA, 'fiestas')?.id).toBe('F-navidad');
  });

  test('seguir el camino: primero la zona de su edad, luego las otras, luego los extras en orden', () => {
    expect(siguienteTema(partida({ edad: 4 }), MAPA)?.id).toBe('B1');
    expect(siguienteTema(partida({ edad: 4, hechos: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] }), MAPA)?.id).toBe('J1');
    const todoElCamino = [...JARDIN_HECHO, 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'M1', 'M2', 'M3'];
    expect(siguienteTema(partida({ edad: 5, hechos: todoElCamino }), MAPA)?.id).toBe('X-CAN');
    expect(siguienteTema(partida({ edad: 5, hechos: [...todoElCamino, 'X-CAN', 'X-RUT'] }), MAPA)?.id).toBe('EN-1');
    const todo = [...todoElCamino, 'X-CAN', 'X-RUT', 'EN-1', 'EN-2', 'X-TRZ', 'JC', 'BC', 'MC', 'F-navidad', 'F-carnaval', 'F-libro'];
    expect(siguienteTema(partida({ edad: 5, hechos: todo }), MAPA)).toBeNull();
  });
});

describe('sitios del mapa', () => {
  test('cada sitio con candado pide sus casitas; el resto está siempre abierto', () => {
    expect(sitioAbierto(partida(), MAPA, 'canciones')).toBe(false);
    expect(sitioAbierto(partida({ hechos: ['J1'] }), MAPA, 'canciones')).toBe(true);
    expect(sitioAbierto(partida({ hechos: ['J1'] }), MAPA, 'ingles')).toBe(false);
    expect(sitioAbierto(partida({ hechos: ['J1', 'J2', 'J3', 'J4'] }), MAPA, 'fiestas')).toBe(true);
    expect(sitioAbierto(partida(), MAPA, 'bosque')).toBe(false);
    expect(sitioAbierto(partida(), MAPA, 'tienda')).toBe(true);
    expect(sitioAbierto(partida({ libre: true }), MAPA, 'trazos')).toBe(true);
    expect(['canciones', 'rutinas', 'trazos', 'fiestas', 'ingles', 'plaza'].map(sitioNecesita)).toEqual([1, 2, 3, 4, 2, undefined]);
  });

  test('la fiesta de cada mes', () => {
    expect(Array.from({ length: 12 }, (_x, m) => fiestaDelMes(m))).toEqual([
      'F-navidad', 'F-carnaval', 'F-carnaval', 'F-libro', null, null, null, null, null, null, null, 'F-navidad',
    ]);
  });
});

// MAPA_ISLA: el mapa de prueba con la Isla de las Letras: tres zonas con su camino (sin Rincón de los Conceptos).
const isla = (zona: string, letra: string, n: number): TemaAbrible[] =>
  Array.from({ length: n }, (_x, i) => tema(`${letra}${i + 1}`, zona));
const MAPA_ISLA: Mapa<TemaAbrible> = {
  ...MAPA,
  zonas: { ...MAPA.zonas, playaSonidos: isla('playaSonidos', 'LP', 6), bosqueLetras: isla('bosqueLetras', 'LB', 6), puebloPalabras: isla('puebloPalabras', 'LU', 3) },
};
const PLAYA_HECHA = ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6'];

describe('Isla de las Letras', () => {
  test('sus zonas se abren como las principales: por edad, en modo libre o con 6 flores en la anterior', () => {
    expect(zonaAbierta(partida(), MAPA_ISLA, 'playaSonidos')).toBe(true);
    expect(zonaAbierta(partida(), MAPA_ISLA, 'bosqueLetras')).toBe(false);
    expect(zonaAbierta(partida({ edad: 4 }), MAPA_ISLA, 'bosqueLetras')).toBe(true);
    expect(zonaAbierta(partida({ libre: true }), MAPA_ISLA, 'puebloPalabras')).toBe(true);
    expect(zonaAbierta(partida({ hechos: PLAYA_HECHA.slice(0, 5) }), MAPA_ISLA, 'bosqueLetras')).toBe(false);
    expect(zonaAbierta(partida({ hechos: PLAYA_HECHA }), MAPA_ISLA, 'bosqueLetras')).toBe(true);
    expect(zonaAbierta(partida({ hechos: PLAYA_HECHA }), MAPA_ISLA, 'puebloPalabras')).toBe(false);
    expect(zonaAbierta(partida({ edad: 5 }), MAPA_ISLA, 'puebloPalabras')).toBe(true);
  });

  test('las flores del mapa grande no abren la isla, ni las de la isla el mapa grande', () => {
    expect(zonaAbierta(partida({ hechos: JARDIN_HECHO }), MAPA_ISLA, 'bosqueLetras')).toBe(false);
    expect(zonaAbierta(partida({ hechos: PLAYA_HECHA }), MAPA_ISLA, 'bosque')).toBe(false);
    expect(terminadasPrincipales(partida({ hechos: PLAYA_HECHA }), MAPA_ISLA)).toBe(0);
    expect(sitioAbierto(partida({ hechos: PLAYA_HECHA }), MAPA_ISLA, 'canciones')).toBe(false);
  });

  test('sus casitas se abren de una en una y sin edad la zona sigue cerrada', () => {
    const abiertoIsla = (p: Partida, id: string): boolean =>
      temaAbierto(p, MAPA_ISLA, Object.values(MAPA_ISLA.zonas).flat().find((t) => t.id === id));
    expect(abiertoIsla(partida(), 'LP1')).toBe(true);
    expect(abiertoIsla(partida(), 'LP2')).toBe(false);
    expect(abiertoIsla(partida({ hechos: ['LP1'] }), 'LP2')).toBe(true);
    expect(abiertoIsla(partida(), 'LB1')).toBe(false);
    expect(abiertoIsla(partida({ edad: 4 }), 'LB1')).toBe(true);
  });

  test('el seguir de la isla: primero la zona de su edad, luego las otras abiertas; el del mapa grande no la mira', () => {
    expect(zonaDeLetrasDeLaEdad(partida({ edad: 5 }), MAPA_ISLA)).toBe('puebloPalabras');
    expect(zonaDeLetrasDeLaEdad(partida(), MAPA_ISLA)).toBe('playaSonidos');
    expect(siguienteLetra(partida(), MAPA_ISLA)?.id).toBe('LP1');
    expect(siguienteLetra(partida({ edad: 4 }), MAPA_ISLA)?.id).toBe('LB1');
    expect(siguienteLetra(partida({ edad: 4, hechos: ['LB1', 'LB2', 'LB3', 'LB4', 'LB5', 'LB6'] }), MAPA_ISLA)?.id).toBe('LP1');
    const todo = [...PLAYA_HECHA, 'LB1', 'LB2', 'LB3', 'LB4', 'LB5', 'LB6', 'LU1', 'LU2', 'LU3'];
    expect(siguienteLetra(partida({ edad: 5, hechos: todo }), MAPA_ISLA)).toBeNull();
    expect(siguienteTema(partida(), MAPA_ISLA)?.id).toBe('J1');
    expect(siguienteLetra(partida(), MAPA)).toBeNull();
  });
});
