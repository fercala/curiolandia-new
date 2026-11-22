/*
 * dominio/bloques.ts: las reglas del rincón de construcciones (idea 23 de docs/IDEAS-MEJORA.md, fase P27). En las clases
 * del cole, con bloques de colores (cubo, cilindro, arco, cono y esfera) que se apilan en tres montones. Encima del cono
 * y de la esfera no se sostiene nada (lo que se pone rueda y se cae: el equilibrio), y cada montón tiene un alto máximo.
 * Los retos:
 * - Copiar la torre del modelo, de abajo arriba (planCopiar: 2, 3 o 4 bloques según la edad; el cono o la esfera, si
 *   salen, van arriba del todo).
 * - La casa para un animal: dos paredes rectas (con cubos o cilindros) a los lados, del alto que toque (planCasa), y el
 *   tejado encima.
 * - Contar los bloques de una torre (con 5 años, solo los de una forma: planContar), eligiendo entre tres números.
 * - Construcción libre, que se puede llevar al jardín de Tito (S.bloques.jardin: leeJardin la lee sana).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/bloques.test.ts.
 * Exporta: los tipos Forma, Torres, PlanCasa y PlanContar, FORMAS, BLOQUES, sostiene, poner, planCopiar,
 * siguienteCopia, planCasa, paredes, casaLista, planContar y leeJardin.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (altos y cuántos bloques según la
   edad), en tablas con nombre. */

/** Una forma de bloque (y el tejado de la casa, que solo sale en ese reto). */
export type Forma = 'cubo' | 'cilindro' | 'arco' | 'cono' | 'esfera' | 'tejado';
/** Los tres montones de la mesa, de izquierda a derecha; cada uno, de abajo arriba. */
export type Torres = readonly (readonly Forma[])[];

/** Una forma: si se sostiene algo encima. */
interface DatoForma {
  readonly sostiene: boolean;
}

// FORMAS: las formas de los bloques y si encima se sostiene algo (en el cono y la esfera, no). Sus nombres, en las
// frases enteras de mundo3d/bloques3d.ts (para traducirlas bien).
export const FORMAS: Readonly<Record<Forma, DatoForma>> = {
  cubo: { sostiene: true },
  cilindro: { sostiene: true },
  arco: { sostiene: true },
  cono: { sostiene: false },
  esfera: { sostiene: false },
  tejado: { sostiene: false },
};

// BLOQUES: las reglas: las formas de la bandeja, el alto máximo de un montón y cuántos montones hay.
export const BLOQUES = {
  bandeja: ['cubo', 'cilindro', 'arco', 'cono', 'esfera'] as readonly Forma[],
  alto: 6,
  montones: 3,
  copiar: { 3: 2, 4: 3, 5: 4 } as Readonly<Record<number, number>>,
  casa: { 3: 1, 4: 2, 5: 3 } as Readonly<Record<number, number>>,
} as const;

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));
// unoDe(lista, azar): un elemento de la lista con el azar dado.
const unoDe = <X>(lista: readonly X[], azar: () => number): X => lista[Math.floor(azar() * lista.length)]!;

// sostiene(torre): ¿se puede poner algo encima de esta torre? Sí si está vacía o arriba hay una forma que sostiene.
export function sostiene(torre: readonly Forma[]): boolean {
  const arriba = torre[torre.length - 1];
  return !arriba || FORMAS[arriba].sostiene;
}

/** Lo que pasa al poner un bloque: se pone, rueda y se cae (arriba hay un cono o una esfera) o no cabe (montón lleno). */
export type Resultado = 'puesto' | 'rueda' | 'lleno';

// poner(torres, m, f): pone la forma f en el montón m; devuelve las torres nuevas (sin cambiar las de antes) y lo que
// ha pasado. Si rueda o no cabe, las torres no cambian.
export function poner(torres: Torres, m: number, f: Forma): { torres: Torres; r: Resultado } {
  const t = torres[m] ?? [];
  if (t.length >= BLOQUES.alto) return { torres, r: 'lleno' };
  if (!sostiene(t)) return { torres, r: 'rueda' };
  return { torres: torres.map((x, i) => (i === m ? [...x, f] : x)), r: 'puesto' };
}

// planCopiar(edad, azar): la torre del modelo, de abajo arriba: 2, 3 o 4 bloques según la edad, sin dos iguales
// seguidos; la de arriba, a veces, un cono o una esfera.
export function planCopiar(edad: number, azar: () => number): Forma[] {
  const n = BLOQUES.copiar[edadDe(edad)]!,
    base: readonly Forma[] = ['cubo', 'cilindro', 'arco'];
  return Array.from({ length: n }, (_, i) => i).reduce<Forma[]>((t, i) => {
    const antes = t[i - 1],
      lista = i === n - 1 && azar() < 0.5 ? (['cono', 'esfera'] as const) : base.filter((f) => f !== antes);
    return [...t, unoDe(lista, azar)];
  }, []);
}

// siguienteCopia(modelo, torre): la forma que va ahora para copiar el modelo, o null si ya está copiado.
export function siguienteCopia(modelo: readonly Forma[], torre: readonly Forma[]): Forma | null {
  return modelo[torre.length] ?? null;
}

/** El reto de la casa: para qué animal y el alto de cada pared. */
export interface PlanCasa {
  readonly animal: string;
  readonly alto: number;
}
// ANIMALES_CASA: los animales que necesitan una casa.
const ANIMALES_CASA = ['conejo', 'perro', 'gato', 'pollito'];

// planCasa(edad, azar): un animal y el alto de las paredes (1, 2 o 3 bloques según la edad).
export function planCasa(edad: number, azar: () => number): PlanCasa {
  return { animal: unoDe(ANIMALES_CASA, azar), alto: BLOQUES.casa[edadDe(edad)]! };
}

// paredes(torres): dónde va el siguiente bloque de pared en la casa: el montón de la izquierda (0) o el de la derecha
// (2), el más bajo (si son iguales, el de la izquierda).
export function paredes(torres: Torres): 0 | 2 {
  return (torres[2]?.length ?? 0) < (torres[0]?.length ?? 0) ? 2 : 0;
}

// casaLista(torres, alto): ¿están las dos paredes con el alto que toca y el tejado encima?
export function casaLista(torres: Torres, alto: number): boolean {
  return (
    [0, 2].every((m) => torres[m]?.filter((f) => f !== 'tejado').length === alto) && !!torres[1]?.includes('tejado')
  );
}

/** El reto de contar: la torre, qué se cuenta (todos los bloques o los de una forma), la respuesta y los tres números
 * para elegir (en orden). */
export interface PlanContar {
  readonly torre: readonly Forma[];
  readonly cuenta: Forma | 'todos';
  readonly respuesta: number;
  readonly opciones: readonly number[];
}
// CONTAR_EDAD: cuántos bloques tiene la torre de contar según la edad (de cuántos a cuántos).
const CONTAR_EDAD: Readonly<Record<number, readonly [number, number]>> = { 3: [2, 4], 4: [3, 6], 5: [4, 6] };

// planContar(edad, azar): una torre de bloques que se sostienen (cubos, cilindros y arcos) y qué se cuenta: con 3 y 4
// años, todos los bloques; con 5, los de una forma que esté en la torre. Las opciones: la respuesta y dos números
// cerca, de 1 a 6, en orden.
export function planContar(edad: number, azar: () => number): PlanContar {
  const e = edadDe(edad),
    [min, max] = CONTAR_EDAD[e]!,
    n = min + Math.floor(azar() * (max - min + 1)),
    torre = Array.from({ length: n }, () => unoDe(['cubo', 'cilindro', 'arco'] as const, azar)),
    cuenta: Forma | 'todos' = e >= 5 ? unoDe(torre, azar) : 'todos',
    respuesta = cuenta === 'todos' ? n : torre.filter((f) => f === cuenta).length,
    cerca = [respuesta - 2, respuesta - 1, respuesta + 1, respuesta + 2].filter((x) => x >= 1 && x <= 6),
    otros = [...cerca].sort(() => azar() - 0.5).slice(0, 2);
  return { torre, cuenta, respuesta, opciones: [respuesta, ...otros].sort((a, b) => a - b) };
}

// leeJardin(raw): lee lo construido que se llevó al jardín (S.bloques.jardin): tres montones de formas conocidas, cada
// uno de BLOQUES.alto como mucho; si falta o está roto, null (no hay nada en el jardín).
export function leeJardin(raw: unknown): Torres | null {
  const j = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).jardin : null;
  if (!Array.isArray(j) || j.length !== BLOQUES.montones) return null;
  const torres = j.map((t) =>
    Array.isArray(t)
      ? t.filter((f): f is Forma => typeof f === 'string' && f in FORMAS).slice(0, BLOQUES.alto)
      : ([] as Forma[]),
  );
  return torres.some((t) => t.length) ? torres : null;
}
