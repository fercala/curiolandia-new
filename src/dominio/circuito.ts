/*
 * dominio/circuito.ts: las reglas del circuito de psicomotricidad del patio (idea 15 de docs/IDEAS-MEJORA.md, fase
 * P13b). En el patio hay cinco obstáculos (los aros, el túnel, el banco, los conos y la colchoneta); la profe dice en
 * qué orden se recorren («Primero, el túnel. Después, el banco. Y al final, los aros.»), el niño los toca en ese orden
 * (programa a Tito) y Tito hace el recorrido, diciendo lo que hace en cada uno («¡Por dentro del túnel!»). Con 3 años
 * son dos obstáculos por vuelta, con 4 tres y con 5 cuatro; con 3 años, además, se ven las fichas del orden (con 4 y 5
 * se recuerda, y se puede volver a oír). Son tres vueltas.
 * Al terminar, como las demás actividades del patio, 3 monedas la primera vez de cada día (dominio/cole.ts, id
 * 'circuito').
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/circuito.test.ts.
 * Exporta: el tipo Obstaculo, CIRCUITO, OBSTACULOS, obstaculo, planCircuito y frasesDelOrden.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos obstáculos por vuelta según
   la edad), en tablas con nombre. */

/** Un obstáculo del circuito: su id, su nombre en pantalla, lo que hace Tito en él (el concepto que practica) y las
 * frases enteras con las que la profe lo pone en el orden: primero, después o al final (enteras, para traducirlas). */
export interface Obstaculo {
  readonly id: string;
  readonly nombre: string;
  readonly accion: string;
  readonly primero: string;
  readonly despues: string;
  readonly alFinal: string;
}

// CIRCUITO: las reglas: cuántos obstáculos hay en cada vuelta según la edad, cuántas vueltas son y con qué edades se
// ven las fichas del orden (con las demás, se recuerda).
export const CIRCUITO = {
  largo: { 3: 2, 4: 3, 5: 4 } as Readonly<Record<number, number>>,
  vueltas: 3,
  fichasHasta: 3,
} as const;

// OBSTACULOS: los cinco obstáculos del circuito, con lo que se hace en cada uno (dentro, por encima, alrededor...).
export const OBSTACULOS: readonly Obstaculo[] = [
  {
    id: 'aros',
    nombre: 'Los aros',
    accion: '¡Saltando dentro de los aros!',
    primero: 'Primero, los aros.',
    despues: 'Después, los aros.',
    alFinal: 'Y al final, los aros.',
  },
  {
    id: 'tunel',
    nombre: 'El túnel',
    accion: '¡Por dentro del túnel!',
    primero: 'Primero, el túnel.',
    despues: 'Después, el túnel.',
    alFinal: 'Y al final, el túnel.',
  },
  {
    id: 'banco',
    nombre: 'El banco',
    accion: '¡Por encima del banco!',
    primero: 'Primero, el banco.',
    despues: 'Después, el banco.',
    alFinal: 'Y al final, el banco.',
  },
  {
    id: 'conos',
    nombre: 'Los conos',
    accion: '¡Alrededor de los conos!',
    primero: 'Primero, los conos.',
    despues: 'Después, los conos.',
    alFinal: 'Y al final, los conos.',
  },
  {
    id: 'colchoneta',
    nombre: 'La colchoneta',
    accion: '¡Una voltereta en la colchoneta!',
    primero: 'Primero, la colchoneta.',
    despues: 'Después, la colchoneta.',
    alFinal: 'Y al final, la colchoneta.',
  },
];

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));

// obstaculo(id): el obstáculo con ese id, o undefined.
export function obstaculo(id: string): Obstaculo | undefined {
  return OBSTACULOS.find((o) => o.id === id);
}

// barajar(lista, azar): la lista en otro orden, al azar (sin cambiar la de entrada).
function barajar<T>(lista: readonly T[], azar: () => number): T[] {
  return lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map((p) => p.x);
}

// planCircuito(edad, azar): las vueltas de una partida (CIRCUITO.vueltas), cada una con los ids de sus obstáculos en
// orden (CIRCUITO.largo según la edad, sin repetir dentro de la vuelta). Una vuelta no empieza por el mismo obstáculo
// que la anterior, para que cada orden se escuche de verdad.
export function planCircuito(edad: number, azar: () => number): string[][] {
  const n = CIRCUITO.largo[edadDe(edad)] ?? 3,
    ids = OBSTACULOS.map((o) => o.id);
  return Array.from({ length: CIRCUITO.vueltas }).reduce<string[][]>((vueltas) => {
    const antes = vueltas[vueltas.length - 1]?.[0],
      orden = barajar(ids, azar),
      // si empieza como la anterior, el primero pasa al final (hay cinco y se cogen como mucho cuatro: así cambia)
      vuelta = orden[0] === antes ? [...orden.slice(1), orden[0]!] : orden;
    return [...vueltas, vuelta.slice(0, n)];
  }, []);
}

// frasesDelOrden(vuelta): lo que dice la profe para una vuelta: una frase entera por obstáculo: el primero con
// «Primero», el último con «Y al final» y los de en medio con «Después».
export function frasesDelOrden(vuelta: readonly string[]): string[] {
  return vuelta.map((id, i) => {
    const o = obstaculo(id);
    if (!o) return '';
    if (i === 0) return o.primero;
    return i === vuelta.length - 1 ? o.alFinal : o.despues;
  });
}
