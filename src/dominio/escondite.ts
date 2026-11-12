/*
 * dominio/escondite.ts: las reglas del escondite del patio (idea 14 de docs/IDEAS-MEJORA.md, fase P13a). Tito cuenta
 * hasta diez (el niño cuenta con él) y busca a sus amigos, que se han escondido en los sitios del patio; para cada uno
 * dice una pista de posición («está detrás del árbol», «debajo del tobogán», «dentro de la casita») y el niño toca el
 * sitio. Con 3 años se les ve un poco (asoman más), con 4 menos y con 5 no se les ve: solo vale la pista. Después se
 * cambian los papeles: el niño elige dónde se esconde Tito y Lupi lo busca, mirando antes en otros sitios.
 * Al terminar, como las demás actividades del patio, 3 monedas la primera vez de cada día (dominio/cole.ts, id
 * 'escondite').
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/escondite.test.ts.
 * Exporta: los tipos Posicion, SitioEscondite y Escondido, ESCONDITE, SITIOS_ESCONDITE, sitioEscondite, planEscondite
 * y busquedaLupi.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos se esconden y cuánto asoman
   según la edad), en tablas con nombre. */

/** Dónde está alguien respecto a una cosa: los conceptos espaciales que practica el juego. */
export type Posicion = 'detras' | 'debajo' | 'dentro';

/** Un sitio del patio donde esconderse: su id, el dibujo que lo pinta, dónde se queda el escondido y la pista entera que
 * lo dice (para traducirla entera). */
export interface SitioEscondite {
  readonly id: string;
  readonly dibujo: string;
  readonly posicion: Posicion;
  readonly pista: string;
}

/** Un amigo escondido: cuál es (su número, desde 0) y en qué sitio. */
export interface Escondido {
  readonly amigo: number;
  readonly sitio: string;
}

// ESCONDITE: las reglas: hasta cuánto cuenta Tito, los amigos que se esconden según la edad y cuánto asoman (de 0, nada,
// a 1, medio cuerpo), y en cuántos sitios mira Lupi antes de encontrar a Tito.
export const ESCONDITE = {
  cuenta: 10,
  amigos: { 3: 2, 4: 3, 5: 4 } as Readonly<Record<number, number>>,
  asoma: { 3: 0.5, 4: 0.3, 5: 0 } as Readonly<Record<number, number>>,
  fallosLupi: 2,
} as const;

// SITIOS_ESCONDITE: los sitios del patio donde esconderse, con su pista (detrás, debajo y dentro: dos de cada).
export const SITIOS_ESCONDITE: readonly SitioEscondite[] = [
  { id: 'arbol', dibujo: 'arbol', posicion: 'detras', pista: '¡Está detrás del árbol!' },
  { id: 'tobogan', dibujo: 'tobogan', posicion: 'debajo', pista: '¡Está debajo del tobogán!' },
  { id: 'casita', dibujo: 'casaMadera', posicion: 'dentro', pista: '¡Está dentro de la casita!' },
  { id: 'arbusto', dibujo: 'arbusto', posicion: 'detras', pista: '¡Está detrás del arbusto!' },
  { id: 'banco', dibujo: 'banco', posicion: 'debajo', pista: '¡Está debajo del banco!' },
  { id: 'caja', dibujo: 'cajaCarton', posicion: 'dentro', pista: '¡Está dentro de la caja!' },
];

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));

// sitioEscondite(id): el sitio con ese id, o undefined.
export function sitioEscondite(id: string): SitioEscondite | undefined {
  return SITIOS_ESCONDITE.find((s) => s.id === id);
}

// barajar(lista, azar): la lista en otro orden, al azar (sin cambiar la de entrada).
function barajar<T>(lista: readonly T[], azar: () => number): T[] {
  return lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map((p) => p.x);
}

// planEscondite(edad, azar): dónde se esconde cada amigo (ESCONDITE.amigos según la edad, en sitios distintos) y en
// qué orden los busca Tito; cuánto asoman se mira aparte (ESCONDITE.asoma). Los sitios se reparten de forma que no
// salgan dos seguidos con la misma posición (para que cada pista enseñe algo nuevo), si se puede.
export function planEscondite(edad: number, azar: () => number): Escondido[] {
  const n = ESCONDITE.amigos[edadDe(edad)] ?? 3,
    sitios = barajar(SITIOS_ESCONDITE, azar),
    elegidos = sitios.reduce<SitioEscondite[]>((hechos, s) => {
      const antes = hechos[hechos.length - 1];
      return hechos.length < n && (!antes || antes.posicion !== s.posicion) ? [...hechos, s] : hechos;
    }, []),
    faltan = sitios.filter((s) => !elegidos.includes(s)).slice(0, n - elegidos.length),
    todos = [...elegidos, ...faltan];
  return barajar(
    Array.from({ length: n }, (_, i) => i),
    azar,
  ).map((amigo, i): Escondido => ({ amigo, sitio: todos[i]?.id ?? SITIOS_ESCONDITE[0]!.id }));
}

// busquedaLupi(sitioTito, azar): los sitios en los que mira Lupi, en orden, cuando Tito se esconde en sitioTito: antes,
// ESCONDITE.fallosLupi sitios donde no está (al azar) y, al final, el de Tito.
export function busquedaLupi(sitioTito: string, azar: () => number): string[] {
  const otros = barajar(
    SITIOS_ESCONDITE.filter((s) => s.id !== sitioTito).map((s) => s.id),
    azar,
  ).slice(0, ESCONDITE.fallosLupi);
  return [...otros, sitioTito];
}
