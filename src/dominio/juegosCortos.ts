/*
 * dominio/juegosCortos.ts: las reglas de los juegos cortos del patio del cole (idea 16 de docs/IDEAS-MEJORA.md, fase
 * P12, que se hace de dos en dos juegos: P12a, P12b...). Son juegos pequeños que se abren desde el botón «Juegos cortos»
 * del patio (escenas/juegosCortos.ts): la rayuela, los columpios, los penaltis, las pompas de jabón, la cometa, el
 * pañuelo y las sillas musicales. Los que aún no tienen escena salen «¡Muy pronto!».
 *   - La rayuela: Tito dice un número, se toca su casilla para tirar la piedra y Tito va saltando a la pata coja,
 *     contando, hasta la piedra (el niño salta con él). Las casillas, como en la tiza del patio: 1, 2 y 3 sueltas, 4 y 5
 *     juntas, 6 suelta, 7 y 8 juntas, 9 y 10 sueltas; con 3 años hasta el 5 y con 4 hasta el 8.
 *   - Los columpios: Tito se columpia y se toca para empujarle cuando vuelve hacia atrás (el columpio arriba, de este
 *     lado); cada empujón a tiempo le sube más. Un empujón a destiempo no quita nada.
 * Al terminar cada juego, como las demás actividades del patio, 3 monedas la primera vez de cada día (dominio/cole.ts,
 * con el id del juego).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/juegosCortos.test.ts.
 * Exporta: los tipos JuegoCorto y CasillaRayuela, JUEGOS_CORTOS, RAYUELA, COLUMPIO, juegoCorto, casillasRayuela,
 * planRayuela y empujonBueno.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántas casillas y rondas según la
   edad, el momento bueno del columpio), en tablas con nombre. */

/** Un juego corto del patio: su id (el de S.cole), su nombre, la escena que lo juega (sin escena: «muy pronto») y el
 * dibujo de su tarjeta. */
export interface JuegoCorto {
  readonly id: string;
  readonly nombre: string;
  readonly escena?: string;
  readonly icono: string;
}

/** Una casilla de la rayuela: su número, su columna (de la salida a la meta, desde 0) y su sitio en la columna (sola,
 * o arriba y abajo cuando van dos juntas). */
export interface CasillaRayuela {
  readonly n: number;
  readonly col: number;
  readonly fila: 'sola' | 'abajo' | 'arriba';
}

// JUEGOS_CORTOS: los siete juegos cortos, en el orden de sus tarjetas (el de la idea 16). Se van haciendo de dos en dos.
export const JUEGOS_CORTOS: readonly JuegoCorto[] = [
  { id: 'rayuela', nombre: 'La rayuela', escena: 'rayuela', icono: 'piedra' },
  { id: 'columpios', nombre: 'Los columpios', escena: 'columpios', icono: 'columpio' },
  { id: 'penaltis', nombre: 'Los penaltis', icono: 'pelota' },
  { id: 'pompas', nombre: 'Las pompas', icono: 'pelotaPlaya' },
  { id: 'cometa', nombre: 'La cometa', icono: 'cometa' },
  { id: 'panuelo', nombre: 'El pañuelo', icono: 'manos' },
  { id: 'sillas', nombre: 'Las sillas', icono: 'silla' },
];

// RAYUELA: las reglas de la rayuela: la casilla más alta según la edad y las rondas (tiradas) de una partida.
export const RAYUELA = {
  hasta: { 3: 5, 4: 8, 5: 10 } as Readonly<Record<number, number>>,
  rondas: 3,
} as const;

// COLUMPIO: las reglas de los columpios: los empujones a tiempo que hacen falta para llegar arriba del todo y lo ancho
// que es el momento bueno (la parte de cada vaivén, alrededor de cuando el columpio está atrás del todo), según la edad.
export const COLUMPIO = {
  empujones: { 3: 5, 4: 6, 5: 7 } as Readonly<Record<number, number>>,
  ventana: { 3: 0.34, 4: 0.28, 5: 0.22 } as Readonly<Record<number, number>>,
} as const;

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));

// juegoCorto(id): el juego corto con ese id, o undefined.
export function juegoCorto(id: string): JuegoCorto | undefined {
  return JUEGOS_CORTOS.find((j) => j.id === id);
}

// FORMA_RAYUELA: cómo van las diez casillas, columna a columna: un número es una casilla sola y dos son una pareja (el
// primero, abajo).
const FORMA_RAYUELA: readonly (readonly number[])[] = [[1], [2], [3], [4, 5], [6], [7, 8], [9], [10]];

// filaDe(cuantas, i): la fila de la casilla i de una columna con cuantas casillas: sola, o la primera abajo y la
// segunda arriba.
function filaDe(cuantas: number, i: number): CasillaRayuela['fila'] {
  if (cuantas === 1) return 'sola';
  return i === 0 ? 'abajo' : 'arriba';
}

// casillasRayuela(edad): las casillas de la rayuela para esa edad (hasta RAYUELA.hasta), con su columna y su fila.
export function casillasRayuela(edad: number): CasillaRayuela[] {
  const max = RAYUELA.hasta[edadDe(edad)] ?? 10;
  return FORMA_RAYUELA.flatMap((ns, col) =>
    ns.map((n, i): CasillaRayuela => ({ n, col, fila: filaDe(ns.length, i) })),
  ).filter((c) => c.n <= max);
}

// planRayuela(edad, azar): los números a los que se tira la piedra en una partida: RAYUELA.rondas números distintos de
// la rayuela de esa edad; el primero, de los fáciles (1 a 3), para empezar con éxito. azar() da un número en [0, 1).
export function planRayuela(edad: number, azar: () => number): number[] {
  const max = RAYUELA.hasta[edadDe(edad)] ?? 10,
    primero = 1 + Math.floor(azar() * 3),
    resto = Array.from({ length: max }, (_, i) => i + 1)
      .filter((n) => n !== primero)
      .map((n) => ({ n, k: azar() }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.n);
  return [primero, ...resto].slice(0, RAYUELA.rondas);
}

// empujonBueno(fase, edad): ¿es a tiempo un empujón en ese punto del vaivén? fase va de 0 a 1 en cada vaivén y el
// columpio está atrás del todo (de este lado, donde se empuja) en 0,25; vale si está a menos de media ventana de ahí.
export function empujonBueno(fase: number, edad: number): boolean {
  const f = ((fase % 1) + 1) % 1,
    medio = (COLUMPIO.ventana[edadDe(edad)] ?? 0.28) / 2;
  return Math.abs(f - 0.25) <= medio;
}
