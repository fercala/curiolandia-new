/*
 * dominio/corral.ts: las reglas del corral de Tito, la granja propia junto a su casa (idea 33 de docs/IDEAS-MEJORA.md,
 * en la PR de todas las ideas pendientes, v0.2.180). Se abre después de la excursión a la granja escuela y empieza con
 * una gallina; con monedas se compran la vaca y la oveja. Cada día, cada animal pide una cosa (comida, agua o que lo
 * cepillen: sale de la fecha, para que sea la misma todo el día); al dársela, da su producto (un huevo, leche o queso),
 * una vez al día. Los productos se venden en el mercado del corral por 1 moneda cada uno.
 * Lo guardado va en S.corral: opcional, sin migración (ausente o roto se lee con solo la gallina).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/corral.test.ts.
 * Exporta: los tipos Necesidad y Corral, ANIMALES_CORRAL, NECESIDADES, corralDe, pedidoDe, cuidar, comprar, vender y
 * totalProductos.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- precios y monedas: las reglas mismas, en tablas con nombre. */

/** Lo que puede pedir un animal. */
export type Necesidad = 'comida' | 'agua' | 'cepillo';
// NECESIDADES: lo que piden los animales y el dibujo de cada cosa.
export const NECESIDADES: Readonly<Record<Necesidad, string>> = { comida: 'trigo', agua: 'cubo', cepillo: 'cepillo' };
// ANIMALES_CORRAL: los animales del corral, en orden: su producto y lo que cuesta comprarlo (la gallina viene de
// regalo).
export const ANIMALES_CORRAL: readonly { id: string; producto: string; precio: number }[] = [
  { id: 'gallina', producto: 'huevo', precio: 0 },
  { id: 'vaca', producto: 'leche', precio: 10 },
  { id: 'oveja', producto: 'queso', precio: 10 },
];

/** Lo guardado del corral: los animales que hay, el día de los cuidados, a quién se ha cuidado hoy y los productos. */
export interface Corral {
  readonly animales: readonly string[];
  readonly d: string;
  readonly cuidados: readonly string[];
  readonly productos: Readonly<Record<string, number>>;
}

// corralDe(x, hoy): lo guardado (S.corral), con los cuidados de hoy (si es otro día, ninguno). Si falta o está roto,
// el corral con la gallina.
export function corralDe(x: unknown, hoy: string): Corral {
  const c = (x && typeof x === 'object' ? x : {}) as Partial<Corral>,
    ids = ANIMALES_CORRAL.map((a) => a.id),
    animales = Array.isArray(c.animales) ? c.animales.filter((a) => ids.includes(a)) : [];
  return {
    animales: animales.includes('gallina') ? animales : ['gallina', ...animales],
    d: hoy,
    cuidados: c.d === hoy && Array.isArray(c.cuidados) ? c.cuidados.filter((a) => typeof a === 'string') : [],
    productos: Object.fromEntries(
      ANIMALES_CORRAL.map((a) => [a.producto, Math.max(0, Math.floor(Number(c.productos?.[a.producto]) || 0))]),
    ),
  };
}

// pedidoDe(animal, hoy): lo que pide hoy el animal (sale de la fecha y del animal: el mismo todo el día).
export function pedidoDe(animal: string, hoy: string): Necesidad {
  const n = [...(animal + hoy)].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) % 9973, 7),
    lista = Object.keys(NECESIDADES) as Necesidad[];
  return lista[n % lista.length]!;
}

// cuidar(c, animal, cosa, hoy): el animal recibe la cosa. Si es lo que pide y hoy aún no se le ha cuidado, da su
// producto. Devuelve el corral nuevo y qué ha pasado: 'bien' (da el producto), 'otra' (pide otra cosa) o 'ya' (ya se le
// cuidó hoy).
export function cuidar(
  c: Corral,
  animal: string,
  cosa: Necesidad,
  hoy: string,
): { corral: Corral; pasa: 'bien' | 'otra' | 'ya' } {
  if (c.cuidados.includes(animal)) return { corral: c, pasa: 'ya' };
  if (pedidoDe(animal, hoy) !== cosa) return { corral: c, pasa: 'otra' };
  const p = ANIMALES_CORRAL.find((a) => a.id === animal)!.producto;
  return {
    corral: { ...c, cuidados: [...c.cuidados, animal], productos: { ...c.productos, [p]: (c.productos[p] ?? 0) + 1 } },
    pasa: 'bien',
  };
}

// comprar(c, animal, monedas): compra el animal si aún no está y hay monedas; devuelve el corral nuevo y lo que cuesta
// (0 si no se ha podido).
export function comprar(c: Corral, animal: string, monedas: number): { corral: Corral; precio: number } {
  const a = ANIMALES_CORRAL.find((x) => x.id === animal);
  if (!a || c.animales.includes(animal) || monedas < a.precio) return { corral: c, precio: 0 };
  return { corral: { ...c, animales: [...c.animales, animal] }, precio: a.precio };
}

// totalProductos(c): cuántos productos hay guardados.
export const totalProductos = (c: Corral): number => Object.values(c.productos).reduce((s, n) => s + n, 0);
// vender(c): vende todos los productos (1 moneda cada uno); devuelve el corral sin productos y las monedas.
export function vender(c: Corral): { corral: Corral; monedas: number } {
  return {
    corral: { ...c, productos: Object.fromEntries(Object.keys(c.productos).map((k) => [k, 0])) },
    monedas: totalProductos(c),
  };
}
