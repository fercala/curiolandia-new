/*
 * dominio/crias.ts: las crías de los animales de la granja escuela (idea 22 de docs/IDEAS-MEJORA.md, fase P9). Los
 * animales bien cuidados tienen crías: cada cría nace el día de granja que le toca (los días distintos que se ha ido a
 * la granja, los mismos que cuenta el manzano, MANZANO de dominio/excursiones.ts) y, una vez nacida, crece por etapas
 * con los días de granja que pasan (regla común de dominio/crecer.ts). El niño le pone nombre al nacer.
 * Es una regla pura, sin dibujo ni S. Lo guardado, en S.crias. Pruebas: tests/unidad/crias.test.ts.
 * Exporta: los tipos Cria y CriaNacida, CRIAS, CRIA_DIAS_ETAPA, criasDe, criaPendiente, criaPorId, nacer, etapaCria y
 * familiasListas.
 * Importa: etapaPorDias de dominio/crecer.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (el día en que nace cada cría y los
   días de cada etapa), en tablas con nombre. */
import { etapaPorDias } from './crecer.ts';

/** Una cría: su id, cómo se llama la especie (con artículo), el dibujo y el sonido de su madre (y cómo se llama la
 * madre), su propio dibujo si lo tiene (si no, la madre en pequeño), el día de granja en que nace y los tres nombres
 * para elegir. */
export interface Cria {
  readonly id: string;
  readonly nombre: string;
  readonly madre: string;
  readonly nombreMadre: string;
  readonly dibujo?: string;
  readonly dia: number;
  readonly nombres: readonly string[];
}
/** Una cría nacida: el nombre que le puso el niño y el día de granja en que nació. */
export interface CriaNacida {
  readonly nombre: string;
  readonly d: number;
}

// CRIAS: las crías, en el orden en que nacen (la primera, el segundo día de granja; luego, una cada día).
export const CRIAS: readonly Cria[] = [
  {
    id: 'pollito',
    nombre: 'el pollito',
    madre: 'gallina',
    nombreMadre: 'la gallina',
    dibujo: 'pollito',
    dia: 2,
    nombres: ['Pío', 'Plumita', 'Amarillo'],
  },
  {
    id: 'cordero',
    nombre: 'el corderito',
    madre: 'oveja',
    nombreMadre: 'la oveja',
    dia: 3,
    nombres: ['Algodón', 'Rizos', 'Copo'],
  },
  {
    id: 'ternero',
    nombre: 'el ternero',
    madre: 'vaca',
    nombreMadre: 'la vaca',
    dia: 4,
    nombres: ['Manchitas', 'Lucero', 'Canela'],
  },
  {
    id: 'lechon',
    nombre: 'el lechón',
    madre: 'cerdo',
    nombreMadre: 'la cerda',
    dia: 5,
    nombres: ['Rosita', 'Trufa', 'Bellota'],
  },
  {
    id: 'potro',
    nombre: 'el potro',
    madre: 'caballo',
    nombreMadre: 'la yegua',
    dia: 6,
    nombres: ['Rayo', 'Galope', 'Estrella'],
  },
];
// CRIA_DIAS_ETAPA: días de granja desde que nació para cada etapa de la cría (0 recién nacida, 1 pequeña, 2 mayor).
export const CRIA_DIAS_ETAPA: readonly number[] = [2, 5];

// criasDe(r): las crías nacidas guardadas en r (S.crias) que tienen la forma buena, por id; lo roto, fuera.
export function criasDe(r: unknown): Readonly<Record<string, CriaNacida>> {
  if (!r || typeof r !== 'object') return {};
  return Object.fromEntries(
    Object.entries(r as Record<string, unknown>)
      .filter(([id]) => CRIAS.some((c) => c.id === id))
      .map(([id, v]) => [id, v as Partial<CriaNacida>] as const)
      .filter(([, v]) => !!v && typeof v.nombre === 'string' && v.nombre !== '' && typeof v.d === 'number')
      .map(([id, v]) => [id, { nombre: v.nombre as string, d: v.d as number }]),
  );
}

// criaPorId(id): la cría con ese id, o undefined.
export const criaPorId = (id: string): Cria | undefined => CRIAS.find((c) => c.id === id);

// criaPendiente(diasGranja, nacidas): la primera cría a la que ya le toca nacer (su día ha llegado) y aún no ha nacido,
// o undefined. Nacen de una en una: aunque toquen varias, la siguiente espera a que nazca la anterior.
export function criaPendiente(diasGranja: number, nacidas: Readonly<Record<string, CriaNacida>>): Cria | undefined {
  return CRIAS.find((c) => c.dia <= diasGranja && !nacidas[c.id]);
}

// nacer(nacidas, id, nombre, diasGranja): las crías nacidas con una más (la cría id, con su nombre, nacida hoy). Si ya
// había nacido, no cambia nada. No cambia nacidas.
export function nacer(
  nacidas: Readonly<Record<string, CriaNacida>>,
  id: string,
  nombre: string,
  diasGranja: number,
): Readonly<Record<string, CriaNacida>> {
  return nacidas[id] ? nacidas : { ...nacidas, [id]: { nombre, d: diasGranja } };
}

// etapaCria(diasGranja, c): la etapa de la cría nacida c (0 recién nacida, 1 pequeña, 2 mayor), según los días de
// granja que han pasado desde que nació.
export function etapaCria(diasGranja: number, c: CriaNacida): number {
  return etapaPorDias(Math.max(0, diasGranja - c.d), CRIA_DIAS_ETAPA);
}

// familiasListas(nacidas): ¿hay ya crías para el juego de las familias (unir cada cría con su madre)? Hace falta que
// hayan nacido al menos dos.
export function familiasListas(nacidas: Readonly<Record<string, CriaNacida>>): boolean {
  return Object.keys(nacidas).length >= 2;
}
