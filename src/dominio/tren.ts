/*
 * dominio/tren.ts: las reglas del tren de Curiolandia (resto de la idea 19 de docs/IDEAS-MEJORA.md, fase P28). El tren
 * sale de la estación del mapa, da una vuelta entera a la isla por una vía cerrada y vuelve a la estación. Por el camino:
 * - Pasa por túneles (2, 3 o 4 según la edad) que el niño cuenta; al llegar, Tito pregunta cuántos ha habido y se elige
 *   entre tres números.
 * - Para en tres paradas (el bosque, la montaña y la playa) y en cada una sube un pasajero (Lupi, Polly y el pato).
 * - Hay animales junto a la vía a los que decir adiós.
 * La vuelta se mide de 0 (la estación) a 1 (otra vez la estación): cada cosa tiene su sitio u en la vuelta. Los túneles
 * van en huecos que no pisan las paradas ni los animales.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/tren.test.ts.
 * Exporta: los tipos Parada, AnimalVia y PlanTren, TREN, PARADAS, planTren, tunelEn, tunelesPasados, paradaEn y
 * opcionesCerca.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos túneles según la edad y los
   sitios de la vuelta), en tablas con nombre. */

/** Una parada de la vuelta: su sitio u, su id (el sitio del mapa) y quién sube. */
export interface Parada {
  readonly u: number;
  readonly id: string;
  readonly pasajero: string;
}
/** Un animal junto a la vía: su sitio u y qué animal es. */
export interface AnimalVia {
  readonly u: number;
  readonly animal: string;
}
/** Una vuelta en tren: dónde empieza cada túnel, las paradas, los animales y los números para contar los túneles. */
export interface PlanTren {
  readonly tuneles: readonly number[];
  readonly paradas: readonly Parada[];
  readonly animales: readonly AnimalVia[];
  readonly opciones: readonly number[];
}

// TREN: las reglas: cuántos túneles según la edad, lo que mide un túnel y una parada (en trozos de vuelta), los huecos
// para los túneles y los sitios de los animales.
export const TREN = {
  tuneles: { 3: 2, 4: 3, 5: 4 } as Readonly<Record<number, number>>,
  largoTunel: 0.04,
  paradaSeg: 2.6,
  huecos: [0.08, 0.15, 0.35, 0.42, 0.58, 0.65, 0.84, 0.91] as readonly number[],
  sitiosAnimales: [0.3, 0.53, 0.8] as readonly number[],
  animales: ['vaca', 'oveja', 'cerdo', 'caballo', 'gallina'] as readonly string[],
} as const;

// PARADAS: las tres paradas de la vuelta, siempre las mismas y en este orden.
export const PARADAS: readonly Parada[] = [
  { u: 0.25, id: 'bosque', pasajero: 'lupi' },
  { u: 0.5, id: 'montana', pasajero: 'polly' },
  { u: 0.73, id: 'playa', pasajero: 'pato' },
];

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));
// barajar(lista, azar): la lista en otro orden, con el azar dado (sin cambiar la de antes).
const barajar = <X>(lista: readonly X[], azar: () => number): X[] =>
  lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.x);

// opcionesCerca(respuesta, azar): tres números para elegir, en orden: la respuesta y dos cerca de ella, de 1 a 6.
export function opcionesCerca(respuesta: number, azar: () => number): number[] {
  const cerca = [respuesta - 2, respuesta - 1, respuesta + 1, respuesta + 2].filter((x) => x >= 1 && x <= 6);
  return [respuesta, ...barajar(cerca, azar).slice(0, 2)].sort((a, b) => a - b);
}

// planTren(edad, azar): una vuelta: los túneles (2, 3 o 4 según la edad, en huecos al azar, de menos a más), las
// paradas, tres animales distintos junto a la vía y los números para contar los túneles.
export function planTren(edad: number, azar: () => number): PlanTren {
  const n = TREN.tuneles[edadDe(edad)]!,
    tuneles = barajar(TREN.huecos, azar)
      .slice(0, n)
      .sort((a, b) => a - b),
    animales = barajar(TREN.animales, azar)
      .slice(0, TREN.sitiosAnimales.length)
      .map((animal, i) => ({ u: TREN.sitiosAnimales[i]!, animal }));
  return { tuneles, paradas: PARADAS, animales, opciones: opcionesCerca(n, azar) };
}

// tunelEn(u, tuneles): el túnel en el que está el tren en el sitio u de la vuelta (su número desde 0), o -1 si está fuera.
export function tunelEn(u: number, tuneles: readonly number[]): number {
  return tuneles.findIndex((t) => u >= t && u < t + TREN.largoTunel);
}

// tunelesPasados(u, tuneles): cuántos túneles ha dejado atrás el tren en el sitio u (los que ya ha terminado de cruzar).
export function tunelesPasados(u: number, tuneles: readonly number[]): number {
  return tuneles.filter((t) => u >= t + TREN.largoTunel).length;
}

// paradaEn(antes, ahora, hechas): la parada a la que llega el tren al ir del sitio antes al sitio ahora, si no ha parado
// ya en ella (hechas: los ids de las paradas hechas), o null.
export function paradaEn(antes: number, ahora: number, hechas: readonly string[]): Parada | null {
  return PARADAS.find((p) => antes < p.u && ahora >= p.u && !hechas.includes(p.id)) ?? null;
}
