/*
 * dominio/logica.ts: las reglas de los juegos del rincón de la lógica (idea 29 de docs/IDEAS-MEJORA.md, en la PR de
 * todas las ideas pendientes, v0.2.180): el sudoku de dibujos, ¿qué falta?, las diferencias, la balanza y el tangram.
 * Cada juego se prepara con la edad y un azar (para que las pruebas lo repitan) y se comprueba aquí; las escenas, en
 * escenas/logica.ts. Cada juego terminado da 2 monedas (MONEDAS.juegoRepetido).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/logica.test.ts.
 * Exporta: los tipos Azar, Sudoku, PlanFalta, PlanDiferencias, Diferencia, Platillo, PlanBalanza, Pieza y FiguraTangram,
 * PESOS, planSudoku, puedePoner, sudokuHecho, planFalta, planDiferencias, difEn, planBalanza, pesoDe, mayorPeso,
 * FIGURAS_TANGRAM y figuraTangram.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (tamaños por edad, pesos y medidas
   de las figuras), en tablas con nombre. */

/** Un azar entre 0 y 1 (azar() de aplicacion/puertos.ts, o uno fijo en las pruebas). */
export type Azar = () => number;

// edad3a5(e): la edad entre 3 y 5.
const edad3a5 = (e: number): number => Math.min(5, Math.max(3, Math.round(e)));
// elige(lista, n, azar): n elementos distintos de la lista, al azar.
function elige<T>(lista: readonly T[], n: number, azar: Azar): T[] {
  return lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((o) => o.x);
}

// ── Sudoku de dibujos ──
/** Un sudoku: los dibujos que se usan, la solución (fila a fila, índices de dibujo) y lo que ya está puesto (null, hueco). */
export interface Sudoku {
  readonly dibujos: readonly string[];
  readonly solucion: readonly (readonly number[])[];
  readonly tablero: readonly (readonly (number | null)[])[];
}
// DIBUJOS_SUDOKU: los dibujos del sudoku (frutas fáciles de distinguir).
const DIBUJOS_SUDOKU = ['manzana', 'pera', 'naranja', 'fresa'];

// planSudoku(edad, azar): un sudoku de 3x3 (3 y 4 años) o de 4x4 (5 años), con huecos: 3, 4 o 6.
export function planSudoku(edad: number, azar: Azar): Sudoku {
  const e = edad3a5(edad),
    n = e === 5 ? 4 : 3,
    huecos = { 3: 3, 4: 4, 5: 6 }[e]!,
    filas = elige([...Array(n).keys()], n, azar),
    cols = elige([...Array(n).keys()], n, azar),
    solucion = filas.map((f) => cols.map((c) => (f + c) % n)),
    quitar = new Set(elige([...Array(n * n).keys()], huecos, azar));
  return {
    dibujos: elige(DIBUJOS_SUDOKU, n, azar),
    solucion,
    tablero: solucion.map((fila, f) => fila.map((v, c) => (quitar.has(f * n + c) ? null : v))),
  };
}
// puedePoner(s, f, c, v): ¿se puede poner el dibujo v en el hueco (f, c)? Solo si es el que va (no se repite en su fila
// ni en su columna).
export const puedePoner = (s: Sudoku, f: number, c: number, v: number): boolean =>
  s.tablero[f]?.[c] === null && s.solucion[f]?.[c] === v;
// sudokuHecho(s): ¿ya no quedan huecos?
export const sudokuHecho = (s: Sudoku): boolean => s.tablero.every((fila) => fila.every((v) => v !== null));

// ── ¿Qué falta? ──
/** ¿Qué falta?: los dibujos que se ven, el que se quita y las tres opciones (con él). */
export interface PlanFalta {
  readonly dibujos: readonly string[];
  readonly falta: string;
  readonly opciones: readonly string[];
}
// DIBUJOS_FALTA: los dibujos de ¿qué falta?
const DIBUJOS_FALTA = ['pelota', 'zapato', 'gorro', 'libro', 'reloj', 'flor', 'estrella', 'pez', 'sol', 'casa'];

// planFalta(edad, azar): 3, 4 o 5 dibujos según la edad, uno que se quita y tres opciones (el que falta y dos que no
// estaban), en orden al azar.
export function planFalta(edad: number, azar: Azar): PlanFalta {
  const n = { 3: 3, 4: 4, 5: 5 }[edad3a5(edad)]!,
    todos = elige(DIBUJOS_FALTA, n + 2, azar),
    dibujos = todos.slice(0, n),
    falta = dibujos[Math.floor(azar() * n)]!;
  return { dibujos, falta, opciones: elige([falta, ...todos.slice(n)], 3, azar) };
}

// ── Las diferencias ──
/** Una diferencia: el objeto (su número) que en el dibujo de la derecha falta o es otro dibujo. */
export interface Diferencia {
  readonly i: number;
  readonly otro: string | null;
}
/** Las diferencias: los objetos del dibujo (dibujo y sitio, de 0 a 1 dentro del cuadro) y las diferencias. */
export interface PlanDiferencias {
  readonly objetos: readonly { k: string; x: number; y: number }[];
  readonly difs: readonly Diferencia[];
}
// SITIOS_DIF: dónde van los objetos en cada cuadro (de 0 a 1); DIBUJOS_DIF: los que pueden salir.
const SITIOS_DIF = [
  [0.2, 0.25],
  [0.5, 0.2],
  [0.8, 0.28],
  [0.25, 0.65],
  [0.55, 0.6],
  [0.8, 0.72],
];
const DIBUJOS_DIF = ['sol', 'arbol', 'casa', 'flor', 'mariposa', 'caracol', 'pato', 'conejo', 'nube', 'pelota'];

// planDiferencias(edad, azar): seis objetos y 2, 3 o 4 diferencias según la edad (la mitad, que falta; la otra mitad,
// cambiada por otro dibujo).
export function planDiferencias(edad: number, azar: Azar): PlanDiferencias {
  const n = { 3: 2, 4: 3, 5: 4 }[edad3a5(edad)]!,
    dibujos = elige(DIBUJOS_DIF, SITIOS_DIF.length + n, azar),
    objetos = SITIOS_DIF.map(([x, y], i) => ({ k: dibujos[i]!, x: x!, y: y! })),
    cuales = elige([...SITIOS_DIF.keys()], n, azar);
  return { objetos, difs: cuales.map((i, j) => ({ i, otro: j % 2 ? dibujos[SITIOS_DIF.length + j]! : null })) };
}
// difEn(p, x, y, radio): la diferencia que hay en el punto (x, y) del cuadro (de 0 a 1), o null; radio: lo que se
// acepta alrededor (de 0 a 1).
export const difEn = (p: PlanDiferencias, x: number, y: number, radio = 0.12): Diferencia | null =>
  p.difs.find((d) => Math.hypot(p.objetos[d.i]!.x - x, p.objetos[d.i]!.y - y) < radio) ?? null;

// ── La balanza ──
// PESOS: lo que pesa cada dibujo de la balanza (en bloques).
export const PESOS: Readonly<Record<string, number>> = {
  pluma: 1,
  fresa: 1,
  manzana: 2,
  pelota: 2,
  libro: 3,
  gato: 4,
  perro: 5,
  oveja: 6,
  caballo: 8,
  elefante: 10,
};
/** Un platillo de la balanza: lo que hay encima. */
export type Platillo = readonly string[];
/** Una ronda de la balanza: los dos platillos; equilibrar: true si hay que poner bloques en el de la derecha (5 años). */
export interface PlanBalanza {
  readonly izq: Platillo;
  readonly der: Platillo;
  readonly equilibrar: boolean;
}
// pesoDe(p): lo que pesa un platillo (los bloques, 'bloque', pesan 1).
export const pesoDe = (p: Platillo): number => p.reduce((s, k) => s + (k === 'bloque' ? 1 : (PESOS[k] ?? 0)), 0);
// mayorPeso(r): el platillo que pesa más ('izq' o 'der'); si pesan igual, null.
export function mayorPeso(r: PlanBalanza): 'izq' | 'der' | null {
  const a = pesoDe(r.izq),
    b = pesoDe(r.der);
  if (a === b) return null;
  return a > b ? 'izq' : 'der';
}
// planBalanza(edad, azar): tres rondas de «¿qué pesa más?» con dos dibujos de peso distinto; con 5 años, una cuarta
// para equilibrar: un dibujo a la izquierda y la derecha vacía (se ponen bloques hasta que pesen igual).
export function planBalanza(edad: number, azar: Azar): PlanBalanza[] {
  const claves = Object.keys(PESOS),
    rondas = [0, 1, 2].map(() => {
      const [a, b] = elige(
        claves.filter((k) => k !== 'pluma' || edad3a5(edad) > 3),
        2,
        azar,
      );
      return { izq: [a!], der: [b!], equilibrar: false };
    });
  if (edad3a5(edad) < 5) return rondas;
  const ligero = elige(['manzana', 'libro', 'gato', 'perro'], 1, azar)[0]!;
  return [...rondas, { izq: [ligero], der: [], equilibrar: true }];
}

// ── Tangram ──
/** Una pieza del tangram: su forma, su color y dónde va en la figura (centro y tamaño, en píxeles de la pantalla). */
export interface Pieza {
  readonly forma: 'cuadrado' | 'triangulo' | 'circulo' | 'rectangulo';
  readonly color: string;
  readonly x: number;
  readonly y: number;
  readonly s: number;
}
/** Una figura del tangram: su id, el dibujo que la nombra y sus piezas. */
export interface FiguraTangram {
  readonly id: string;
  readonly dibujo: string;
  readonly piezas: readonly Pieza[];
}
// FIGURAS_TANGRAM: las figuras, por edad: con 3 años, dos piezas; con 4, tres; con 5, cuatro.
export const FIGURAS_TANGRAM: Readonly<Record<number, readonly FiguraTangram[]>> = {
  3: [
    {
      id: 'casa',
      dibujo: 'casa',
      piezas: [
        { forma: 'cuadrado', color: '#FFB15C', x: 800, y: 470, s: 160 },
        { forma: 'triangulo', color: '#FF6B6B', x: 800, y: 320, s: 160 },
      ],
    },
  ],
  4: [
    {
      id: 'arbol',
      dibujo: 'arbol',
      piezas: [
        { forma: 'circulo', color: '#7CC86E', x: 800, y: 290, s: 170 },
        { forma: 'triangulo', color: '#4FAF5E', x: 800, y: 410, s: 150 },
        { forma: 'rectangulo', color: '#A0703C', x: 800, y: 520, s: 90 },
      ],
    },
  ],
  5: [
    {
      id: 'cohete',
      dibujo: 'cohete',
      piezas: [
        { forma: 'triangulo', color: '#FF6B6B', x: 800, y: 260, s: 130 },
        { forma: 'rectangulo', color: '#9ED2F5', x: 800, y: 400, s: 130 },
        { forma: 'circulo', color: '#FFC93C', x: 800, y: 380, s: 60 },
        { forma: 'cuadrado', color: '#5B8DEF', x: 800, y: 540, s: 90 },
      ],
    },
  ],
};
// figuraTangram(edad): la figura de esa edad.
export const figuraTangram = (edad: number): FiguraTangram => FIGURAS_TANGRAM[edad3a5(edad)]![0]!;
