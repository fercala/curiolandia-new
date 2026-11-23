/*
 * dominio/linterna.ts: las reglas de la linterna de noche (idea 24 de docs/IDEAS-MEJORA.md, fase P29). Tito se va de
 * acampada al pie del monte; es de noche y, con la linterna, el niño busca a los animales de la noche escondidos (3, 4 o
 * 5 según la edad). Con 3 años, en la oscuridad les brillan mucho los ojos; con 4, poco; con 5, nada. De vez en cuando
 * cruza el cielo una estrella fugaz.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/linterna.test.ts.
 * Exporta: los tipos AnimalNoche, Brillo y PlanLinterna, ANIMALES_NOCHE, LINTERNA, planLinterna, enLaLuz y
 * hayFugaz.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos animales según la edad, el
   radio de la luz y cada cuánto pasa una estrella fugaz), en tablas con nombre. */

/** Un animal de la noche: su id (el de su dibujo) y lo que dice Tito al encontrarlo (una frase entera). */
export interface AnimalNoche {
  readonly id: string;
  readonly dato: string;
}
/** Cuánto brillan en la oscuridad los ojos de los animales escondidos. */
export type Brillo = 'mucho' | 'poco' | 'nada';
/** Una noche de linterna: qué animales hay y en qué escondite (su número), y cuánto les brillan los ojos. */
export interface PlanLinterna {
  readonly animales: readonly { readonly id: string; readonly sitio: number }[];
  readonly brillo: Brillo;
}

// ANIMALES_NOCHE: los animales que salen de noche, con su dato (frases enteras, para traducirlas bien).
export const ANIMALES_NOCHE: readonly AnimalNoche[] = [
  { id: 'buho', dato: '¡Un búho! Ve muy bien en la oscuridad y caza de noche.' },
  { id: 'murcielago', dato: '¡Un murciélago! Duerme de día cabeza abajo y vuela de noche.' },
  { id: 'erizo', dato: '¡Un erizo! Sale de noche a buscar bichitos para comer.' },
  { id: 'rana', dato: '¡Una rana! Por la noche canta: ¡cro, cro!' },
  { id: 'lobo', dato: '¡Un lobo! Aúlla a la luna: ¡auuuu!' },
  { id: 'mariposa', dato: '¡Una polilla! Es como una mariposa, pero vuela de noche y le gusta la luz.' },
];

// LINTERNA: las reglas: cuántos animales según la edad, cuántos escondites hay, el brillo de los ojos según la edad, el
// radio de la luz, cuánto hay que alumbrar a un animal para encontrarlo (segundos) y cada cuánto pasa una estrella
// fugaz (segundos).
export const LINTERNA = {
  animales: { 3: 3, 4: 4, 5: 5 } as Readonly<Record<number, number>>,
  escondites: 8,
  brillo: { 3: 'mucho', 4: 'poco', 5: 'nada' } as Readonly<Record<number, Brillo>>,
  radio: 150,
  alumbrar: 0.5,
  fugazCada: 9,
  fugazDura: 2.2,
} as const;

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));
// barajar(lista, azar): la lista en otro orden, con el azar dado (sin cambiar la de antes).
const barajar = <X>(lista: readonly X[], azar: () => number): X[] =>
  lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.x);

// planLinterna(edad, azar): una noche: 3, 4 o 5 animales distintos, cada uno en un escondite distinto, y el brillo de
// sus ojos según la edad.
export function planLinterna(edad: number, azar: () => number): PlanLinterna {
  const e = edadDe(edad),
    n = LINTERNA.animales[e]!,
    sitios = barajar(
      Array.from({ length: LINTERNA.escondites }, (_, i) => i),
      azar,
    );
  return {
    animales: barajar(ANIMALES_NOCHE, azar)
      .slice(0, n)
      .map((a, i) => ({ id: a.id, sitio: sitios[i]! })),
    brillo: LINTERNA.brillo[e]!,
  };
}

// enLaLuz(luz, punto): ¿está el punto dentro del círculo de la linterna (un poco más pequeño que la luz, para que se vea
// bien el animal)?
export function enLaLuz(luz: { x: number; y: number }, punto: { x: number; y: number }): boolean {
  return Math.hypot(luz.x - punto.x, luz.y - punto.y) < LINTERNA.radio * 0.6;
}

// hayFugaz(t): ¿está cruzando el cielo una estrella fugaz en el segundo t de la noche? Pasa una cada LINTERNA.fugazCada
// segundos (la primera, a los 5) y dura LINTERNA.fugazDura. Devuelve cuánto lleva (de 0 a 1) o null.
export function hayFugaz(t: number): number | null {
  if (t < 5) return null;
  const k = (t - 5) % LINTERNA.fugazCada;
  return k < LINTERNA.fugazDura ? k / LINTERNA.fugazDura : null;
}
