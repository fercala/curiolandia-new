/*
 * dominio/programa.ts: las reglas de «Programa a Tito» (idea 28 de docs/IDEAS-MEJORA.md, fase P32), el pensamiento
 * computacional del rincón de la lógica del cole. En un tablero de casillas están Tito (mirando hacia un lado) y una
 * fresa; el niño pone tarjetas en orden (avanzar una casilla, girar a la izquierda, girar a la derecha y, con 5 años,
 * «por dos», que repite la tarjeta de antes) y Tito las sigue. Si choca con una roca, se saldría del tablero o se queda
 * corto, se sabe en qué tarjeta ha fallado para arreglarlo. Con 3 años solo hay que avanzar; con 4, hay giros; con 5,
 * rocas y la tarjeta «por dos». Tres tableros por partida.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/programa.test.ts.
 * Exporta: los tipos Orden, Casilla, Posicion, NivelPrograma, PasoPrograma y Resultado, PROGRAMA, NIVELES_PROGRAMA,
 * nivelesDe, ordenesDe, expandir, ejecutar, siguienteOrden y solucion.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (tableros, casillas y cuántas
   tarjetas caben), en tablas con nombre. */

/** Una tarjeta: avanzar una casilla, girar a la izquierda, girar a la derecha o repetir la de antes. */
export type Orden = 'av' | 'iz' | 'de' | 'x2';
/** Una casilla del tablero: columna (x, de izquierda a derecha) y fila (y, de arriba abajo). */
export interface Casilla {
  readonly x: number;
  readonly y: number;
}
/** Dónde está Tito y hacia dónde mira: 0 arriba, 1 derecha, 2 abajo, 3 izquierda. */
export interface Posicion extends Casilla {
  readonly dir: number;
}
/** Un tablero: su tamaño (casillas por lado), dónde empieza Tito, dónde está la fresa y las rocas. */
export interface NivelPrograma {
  readonly tam: number;
  readonly inicio: Posicion;
  readonly meta: Casilla;
  readonly rocas: readonly Casilla[];
}
/** Un paso de la ejecución: dónde queda Tito y qué tarjeta del programa (su número) lo ha movido. */
export interface PasoPrograma extends Posicion {
  readonly i: number;
}
/** Cómo acaba el programa: llega a la fresa, choca con una roca, se sale del tablero o se queda corto. */
export type Resultado = 'meta' | 'roca' | 'fuera' | 'corto';

// PROGRAMA: las reglas: cuántas tarjetas caben en el programa según la edad.
export const PROGRAMA = {
  caben: { 3: 4, 4: 8, 5: 8 } as Readonly<Record<number, number>>,
} as const;

// NIVELES_PROGRAMA: los tres tableros de cada edad, de más fácil a más difícil.
export const NIVELES_PROGRAMA: Readonly<Record<number, readonly NivelPrograma[]>> = {
  3: [
    { tam: 3, inicio: { x: 1, y: 2, dir: 0 }, meta: { x: 1, y: 1 }, rocas: [] },
    { tam: 3, inicio: { x: 1, y: 2, dir: 0 }, meta: { x: 1, y: 0 }, rocas: [] },
    { tam: 3, inicio: { x: 0, y: 1, dir: 1 }, meta: { x: 2, y: 1 }, rocas: [] },
  ],
  4: [
    { tam: 4, inicio: { x: 0, y: 3, dir: 0 }, meta: { x: 0, y: 1 }, rocas: [] },
    { tam: 4, inicio: { x: 0, y: 3, dir: 0 }, meta: { x: 1, y: 2 }, rocas: [] },
    { tam: 4, inicio: { x: 0, y: 3, dir: 1 }, meta: { x: 2, y: 1 }, rocas: [] },
  ],
  5: [
    { tam: 5, inicio: { x: 0, y: 4, dir: 0 }, meta: { x: 0, y: 1 }, rocas: [] },
    { tam: 5, inicio: { x: 0, y: 4, dir: 0 }, meta: { x: 2, y: 2 }, rocas: [{ x: 0, y: 2 }] },
    {
      tam: 5,
      inicio: { x: 1, y: 4, dir: 0 },
      meta: { x: 3, y: 0 },
      rocas: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
      ],
    },
  ],
};

// DX, DY: lo que se mueve al avanzar según hacia dónde mira (arriba, derecha, abajo, izquierda).
const DX = [0, 1, 0, -1],
  DY = [-1, 0, 1, 0];

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));

// nivelesDe(edad): los tableros de esa edad.
export const nivelesDe = (edad: number): readonly NivelPrograma[] => NIVELES_PROGRAMA[edadDe(edad)]!;

// ordenesDe(edad): las tarjetas que se pueden usar con esa edad.
export function ordenesDe(edad: number): readonly Orden[] {
  const e = edadDe(edad);
  if (e === 3) return ['av'];
  return e === 4 ? ['av', 'iz', 'de'] : ['av', 'iz', 'de', 'x2'];
}

// expandir(programa): el programa con cada «por dos» cambiado por la tarjeta de antes (un «por dos» al principio o
// detrás de otro no hace nada); cada orden, con el número de la tarjeta del programa de donde sale.
export function expandir(programa: readonly Orden[]): { o: Exclude<Orden, 'x2'>; i: number }[] {
  return programa.reduce<{ o: Exclude<Orden, 'x2'>; i: number }[]>((acc, o, i) => {
    if (o !== 'x2') return [...acc, { o, i }];
    const antes = programa[i - 1];
    return antes && antes !== 'x2' ? [...acc, { o: antes, i }] : acc;
  }, []);
}

// paso(p, o): dónde queda Tito al hacer la orden o desde p.
const paso = (p: Posicion, o: Exclude<Orden, 'x2'>): Posicion => {
  if (o === 'iz') return { ...p, dir: (p.dir + 3) % 4 };
  if (o === 'de') return { ...p, dir: (p.dir + 1) % 4 };
  return { ...p, x: p.x + DX[p.dir]!, y: p.y + DY[p.dir]! };
};
// mal(n, c): ¿la casilla c se sale del tablero o tiene una roca? Devuelve cuál de las dos, o null si se puede pisar.
const mal = (n: NivelPrograma, c: Casilla): 'fuera' | 'roca' | null => {
  if (c.x < 0 || c.y < 0 || c.x >= n.tam || c.y >= n.tam) return 'fuera';
  return n.rocas.some((r) => r.x === c.x && r.y === c.y) ? 'roca' : null;
};
// enMeta(n, c): ¿está c en la fresa?
const enMeta = (n: NivelPrograma, c: Casilla): boolean => c.x === n.meta.x && c.y === n.meta.y;

// ejecutar(n, programa): Tito sigue el programa en el tablero n: los pasos que da (sin el que falla), cómo acaba y en
// qué tarjeta ha fallado (-1 si no falla ninguna; si se queda corto, la última). Al llegar a la fresa se para.
export function ejecutar(
  n: NivelPrograma,
  programa: readonly Orden[],
): { pasos: PasoPrograma[]; fin: Resultado; fallo: number } {
  const ordenes = expandir(programa);
  const r = ordenes.reduce<{ p: Posicion; pasos: PasoPrograma[]; fin: Resultado | null; fallo: number }>(
    (acc, { o, i }) => {
      if (acc.fin) return acc;
      const q = paso(acc.p, o),
        m = mal(n, q);
      if (m) return { ...acc, fin: m, fallo: i };
      const pasos = [...acc.pasos, { ...q, i }];
      return { p: q, pasos, fin: enMeta(n, q) ? 'meta' : null, fallo: -1 };
    },
    { p: n.inicio, pasos: [], fin: null, fallo: -1 },
  );
  if (r.fin) return { pasos: r.pasos, fin: r.fin, fallo: r.fallo };
  return { pasos: r.pasos, fin: 'corto', fallo: programa.length - 1 };
}

// clave(p): una posición como texto, para no visitarla dos veces al buscar.
const clave = (p: Posicion): string => `${p.x},${p.y},${p.dir}`;

// desde(n, p, ordenes): el programa más corto (con esas tarjetas, sin «por dos») que lleva a Tito de p a la fresa, o
// null si no hay. Busca primero los programas más cortos (a lo ancho).
function desde(n: NivelPrograma, p: Posicion, ordenes: readonly Orden[]): Orden[] | null {
  const usar = ordenes.filter((o): o is Exclude<Orden, 'x2'> => o !== 'x2');
  const busca = (
    cola: readonly { p: Posicion; prog: Orden[] }[],
    vistos: ReadonlySet<string>,
    vueltas: number,
  ): Orden[] | null => {
    const [h, ...resto] = cola;
    if (!h || vueltas > 400) return null;
    if (enMeta(n, h.p)) return h.prog;
    const nuevos = usar
      .map((o) => ({ p: paso(h.p, o), prog: [...h.prog, o] }))
      .filter((x) => !mal(n, x.p) && !vistos.has(clave(x.p)));
    return busca([...resto, ...nuevos], new Set([...vistos, ...nuevos.map((x) => clave(x.p))]), vueltas + 1);
  };
  return busca([{ p, prog: [] }], new Set([clave(p)]), 0);
}

// solucion(n, edad): el programa más corto que lleva a Tito a la fresa en el tablero n con las tarjetas de esa edad.
export function solucion(n: NivelPrograma, edad: number): Orden[] {
  return desde(n, n.inicio, ordenesDe(edad)) ?? [];
}

// siguienteOrden(n, programa, edad): la tarjeta que conviene poner ahora (para la ayuda): la primera del camino más
// corto desde donde dejaría a Tito el programa de ahora; null si el programa ya falla (hay que quitar) o ya llega.
export function siguienteOrden(n: NivelPrograma, programa: readonly Orden[], edad: number): Orden | null {
  const r = ejecutar(n, programa);
  if (r.fin !== 'corto') return null;
  const p = r.pasos[r.pasos.length - 1] ?? n.inicio;
  return desde(n, p, ordenesDe(edad))?.[0] ?? null;
}
