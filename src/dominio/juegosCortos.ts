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
 *   - Los penaltis (P12b): se elige hacia dónde chuta Tito (izquierda o derecha; con 5 años, también arriba) y Lupi, la
 *     portera, se tira a un lado; casi siempre es gol (paradaDe: la portera acierta pocas veces, menos con los
 *     pequeños). Cinco tiros; cuentan los goles.
 *   - Las pompas de jabón (P12b): suben pompas de colores y Tito pide un color; se explotan solo las de ese color.
 *     Tres rondas, cada una con su color (planPompas).
 *   - La cometa (P12c): Tito sujeta la cometa y se lleva con el dedo hasta las estrellas del cielo, sin que toque los
 *     árboles; el viento sopla hacia un lado y cambia de vez en cuando (más fuerte con los mayores). Tocar un árbol no
 *     quita nada: la cometa rebota hacia arriba (planCometa da las estrellas, lejos de los árboles).
 *   - El pañuelo (P12c): Tito está en el medio con el pañuelo y hay dos equipos de amigos con números. Tito dice un
 *     número y se toca al amigo de nuestro equipo que lo lleva: corre, coge el pañuelo y gana el punto. Con 3 años, 3
 *     amigos; con 5, cinco y descolocados (planPanuelo).
 * Al terminar cada juego, como las demás actividades del patio, 3 monedas la primera vez de cada día (dominio/cole.ts,
 * con el id del juego).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/juegosCortos.test.ts.
 * Exporta: los tipos JuegoCorto, CasillaRayuela, LadoPenalti, ColorPompa, RondaPompas, Punto y ArbolCometa,
 * JUEGOS_CORTOS, RAYUELA, COLUMPIO, PENALTIS, POMPAS, COLORES_POMPAS, COMETA, ARBOLES_COMETA, PANUELO, juegoCorto,
 * casillasRayuela, planRayuela, empujonBueno, ladosPenalti, paradaDe, planPompas, tocaArbol, planCometa, vientoEn y
 * planPanuelo.
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
  { id: 'penaltis', nombre: 'Los penaltis', escena: 'penaltis', icono: 'pelota' },
  { id: 'pompas', nombre: 'Las pompas', escena: 'pompas', icono: 'pelotaPlaya' },
  { id: 'cometa', nombre: 'La cometa', escena: 'cometa', icono: 'cometa' },
  { id: 'panuelo', nombre: 'El pañuelo', escena: 'panuelo', icono: 'manos' },
  { id: 'sillas', nombre: 'Las sillas', icono: 'silla' },
];

/** Hacia dónde se chuta un penalti (y hacia dónde se tira la portera). */
export type LadoPenalti = 'izquierda' | 'derecha' | 'arriba';
/** Un color de las pompas: su id (en femenino, como «pompa»), su color en pantalla y las frases enteras que lo dicen
 * (para que se puedan traducir enteras). */
export interface ColorPompa {
  readonly id: string;
  readonly hex: string;
  readonly pide: string;
  readonly es: string;
}
/** Una ronda de las pompas: el color que se pide y cuántas hay que explotar. */
export interface RondaPompas {
  readonly color: string;
  readonly cuantas: number;
}

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

// PENALTIS: las reglas de los penaltis: los tiros de una partida y cuántas veces de cada cien acierta la portera según
// la edad (pocas: es para meter goles).
export const PENALTIS = {
  tiros: 5,
  para: { 3: 15, 4: 22, 5: 30 } as Readonly<Record<number, number>>,
} as const;

// ladosPenalti(edad): hacia dónde se puede chutar: izquierda y derecha; con 5 años, también arriba.
export function ladosPenalti(edad: number): LadoPenalti[] {
  return edadDe(edad) >= 5 ? ['izquierda', 'arriba', 'derecha'] : ['izquierda', 'derecha'];
}

// paradaDe(chute, edad, azar): hacia dónde se tira la portera cuando Tito chuta hacia chute. Acierta (se tira al mismo
// lado: parada) PENALTIS.para veces de cada cien según la edad; si no, se tira a otro lado de los que hay (gol).
export function paradaDe(chute: LadoPenalti, edad: number, azar: () => number): LadoPenalti {
  const lados = ladosPenalti(edad),
    acierta = azar() * 100 < (PENALTIS.para[edadDe(edad)] ?? 22),
    otros = lados.filter((l) => l !== chute);
  if (acierta || !otros.length) return chute;
  return otros[Math.floor(azar() * otros.length)] ?? otros[0]!;
}

// POMPAS: las reglas de las pompas: las rondas de una partida, cuántas hay que explotar en cada ronda y cuántos colores
// salen a la vez según la edad (con 3 años, dos colores; con 5, cuatro).
export const POMPAS = {
  rondas: 3,
  cuantas: { 3: 3, 4: 4, 5: 5 } as Readonly<Record<number, number>>,
  colores: { 3: 2, 4: 3, 5: 4 } as Readonly<Record<number, number>>,
} as const;

// COLORES_POMPAS: los colores de las pompas, con lo que dice Tito para pedirlo y al tocar una de otro color.
export const COLORES_POMPAS: readonly ColorPompa[] = [
  { id: 'roja', hex: '#FF6B6B', pide: '¡Explota las pompas rojas!', es: 'Esa pompa es roja.' },
  { id: 'azul', hex: '#4DA6FF', pide: '¡Explota las pompas azules!', es: 'Esa pompa es azul.' },
  { id: 'amarilla', hex: '#FFD23F', pide: '¡Explota las pompas amarillas!', es: 'Esa pompa es amarilla.' },
  { id: 'verde', hex: '#5CC96B', pide: '¡Explota las pompas verdes!', es: 'Esa pompa es verde.' },
];

// planPompas(edad, azar): las rondas de una partida de pompas: los colores que salen (POMPAS.colores, al azar) y, en
// cada ronda, uno de ellos que no se repite seguido, con las pompas que hay que explotar. Devuelve los colores que salen
// y las rondas.
export function planPompas(edad: number, azar: () => number): { colores: string[]; rondas: RondaPompas[] } {
  const e = edadDe(edad),
    colores = COLORES_POMPAS.map((c) => ({ id: c.id, k: azar() }))
      .sort((a, b) => a.k - b.k)
      .slice(0, POMPAS.colores[e] ?? 3)
      .map((c) => c.id),
    cuantas = POMPAS.cuantas[e] ?? 4,
    rondas = Array.from({ length: POMPAS.rondas }, (_, i) => colores[i % colores.length]!).map(
      (color): RondaPompas => ({ color, cuantas }),
    );
  return { colores, rondas };
}

/** Un punto de la pantalla (de 1600x900). */
export interface Punto {
  readonly x: number;
  readonly y: number;
}
/** La copa de un árbol de la cometa: su centro y su radio. */
export interface ArbolCometa extends Punto {
  readonly r: number;
}

// COMETA: las reglas de la cometa: las estrellas que hay que coger según la edad, lo fuerte que sopla el viento (en
// píxeles por segundo), cada cuántos segundos cambia, lo cerca que hay que pasar de una estrella para cogerla, la zona
// del cielo donde salen las estrellas y lo lejos que sale cada una de la anterior y de los árboles.
export const COMETA = {
  estrellas: { 3: 4, 4: 5, 5: 6 } as Readonly<Record<number, number>>,
  viento: { 3: 45, 4: 75, 5: 105 } as Readonly<Record<number, number>>,
  cambia: 5,
  coge: 80,
  cielo: { x0: 220, x1: 1380, y0: 190, y1: 470 },
  lejos: 320,
  margen: 70,
} as const;

// ARBOLES_COMETA: las copas de los árboles del prado de la cometa (abajo, a los lados y en medio).
export const ARBOLES_COMETA: readonly ArbolCometa[] = [
  { x: 170, y: 560, r: 130 },
  { x: 560, y: 650, r: 95 },
  { x: 1070, y: 640, r: 100 },
  { x: 1440, y: 545, r: 135 },
];

// tocaArbol(p, holgura): el árbol que toca el punto p (con holgura píxeles de más), o undefined.
export function tocaArbol(p: Punto, holgura = 0): ArbolCometa | undefined {
  return ARBOLES_COMETA.find((a) => Math.hypot(p.x - a.x, p.y - a.y) < a.r + holgura);
}

// sitioEstrella(azar): un sitio al azar de la zona del cielo de la cometa.
function sitioEstrella(azar: () => number): Punto {
  const c = COMETA.cielo;
  return { x: Math.round(c.x0 + azar() * (c.x1 - c.x0)), y: Math.round(c.y0 + azar() * (c.y1 - c.y0)) };
}

// planCometa(edad, azar): las estrellas de una partida de la cometa, en orden: COMETA.estrellas según la edad, cada
// una lejos de la anterior (para que haya que llevar la cometa de un lado a otro) y de los árboles. Prueba hasta 30
// sitios por estrella y, si ninguno vale, se queda con el último que no toca un árbol (o el centro del cielo).
export function planCometa(edad: number, azar: () => number): Punto[] {
  const n = COMETA.estrellas[edadDe(edad)] ?? 5,
    centro = { x: (COMETA.cielo.x0 + COMETA.cielo.x1) / 2, y: COMETA.cielo.y0 };
  return Array.from({ length: n }).reduce<Punto[]>((hechas) => {
    const antes = hechas[hechas.length - 1],
      sitios = Array.from({ length: 30 }, () => sitioEstrella(azar)).filter((p) => !tocaArbol(p, COMETA.margen)),
      bueno = sitios.find((p) => !antes || Math.hypot(p.x - antes.x, p.y - antes.y) >= COMETA.lejos);
    return [...hechas, bueno ?? sitios[sitios.length - 1] ?? centro];
  }, []);
}

// vientoEn(t, edad, lados): el viento en el segundo t de la partida, en píxeles por segundo (positivo: hacia la
// derecha). Cambia cada COMETA.cambia segundos, hacia el lado que diga la lista lados (1 o -1, en bucle).
export function vientoEn(t: number, edad: number, lados: readonly number[]): number {
  const tramo = Math.floor(Math.max(0, t) / COMETA.cambia),
    lado = lados.length ? (lados[tramo % lados.length] ?? 1) : 1;
  return lado * (COMETA.viento[edadDe(edad)] ?? 75);
}

// PANUELO: las reglas del pañuelo: las rondas (números que dice Tito) de una partida y los amigos de cada equipo
// según la edad (cada uno con un número, del 1 al que haya).
export const PANUELO = {
  rondas: 4,
  equipo: { 3: 3, 4: 4, 5: 5 } as Readonly<Record<number, number>>,
} as const;

// planPanuelo(edad, azar): una partida del pañuelo: los números de los amigos de nuestro equipo, en su orden en la
// fila (con 3 y 4 años, en orden; con 5, descolocados), y los números que dice Tito en cada ronda (PANUELO.rondas, sin
// repetir el de justo antes). azar() da un número en [0, 1).
export function planPanuelo(edad: number, azar: () => number): { fila: number[]; pedidos: number[] } {
  const e = edadDe(edad),
    n = PANUELO.equipo[e] ?? 4,
    numeros = Array.from({ length: n }, (_, i) => i + 1),
    fila =
      e >= 5
        ? numeros
            .map((k) => ({ k, a: azar() }))
            .sort((a, b) => a.a - b.a)
            .map((x) => x.k)
        : numeros,
    pedidos = Array.from({ length: PANUELO.rondas }).reduce<number[]>((hechos) => {
      const antes = hechos[hechos.length - 1],
        otros = numeros.filter((k) => k !== antes);
      return [...hechos, otros[Math.floor(azar() * otros.length)] ?? otros[0] ?? 1];
    }, []);
  return { fila, pedidos };
}
