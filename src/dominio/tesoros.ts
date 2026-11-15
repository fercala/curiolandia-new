/*
 * dominio/tesoros.ts: las reglas de los tesoros escondidos del mapa (idea 18 de docs/IDEAS-MEJORA.md, fase P14). Cada
 * día se esconden tres tesoros (una pluma, una concha, una piña...) en tres rincones del mapa, siempre los mismos ese
 * día; Tito los encuentra paseando y van a la vitrina de su casa, que cuenta cuántas veces se ha encontrado cada uno.
 * Cada tesoro da una moneda y, al encontrar los tres del día, dos más. Pipo da pistas de dónde buscar.
 * Lo guardado va en S.tesoros ({d, hoy, vitrina}): opcional, sin migración (un registro ausente o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/tesoros.test.ts.
 * Exporta: los tipos Tesoro, Rincon, Escondite y RegistroTesoros, TESOROS_MAPA, TESOROS, RINCONES, tesoro, rincon,
 * registroTesoros, tesorosDelDia, pendientesHoy y hallarTesoro.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos tesoros y monedas), en una
   tabla con nombre, y las constantes del cálculo del día. */

/** Un tesoro: su id (el de su dibujo), su nombre en la vitrina y lo que dice Tito al encontrarlo (frase entera). */
export interface Tesoro {
  readonly id: string;
  readonly nombre: string;
  readonly frase: string;
}

/** Un rincón del mapa donde se puede esconder un tesoro: su id (el del lugar del mapa que tiene cerca) y la pista que da
 * Pipo (frase entera). */
export interface Rincon {
  readonly id: string;
  readonly pista: string;
}

/** Un tesoro del día y el rincón donde está. */
export interface Escondite {
  readonly tesoro: string;
  readonly rincon: string;
}

/** Lo guardado: el día de lo de hoy, los rincones ya encontrados hoy y cuántas veces se ha encontrado cada tesoro. */
export interface RegistroTesoros {
  readonly d: string;
  readonly hoy: readonly string[];
  readonly vitrina: Readonly<Record<string, number>>;
}

// TESOROS_MAPA: las reglas: cuántos tesoros se esconden cada día, las monedas de cada uno y las de encontrar todos.
export const TESOROS_MAPA = { porDia: 3, moneda: 1, todos: 2 } as const;

// TESOROS: los tesoros que se pueden esconder; la vitrina tiene un sitio para cada uno.
export const TESOROS: readonly Tesoro[] = [
  { id: 'pluma', nombre: 'La pluma', frase: '¡Una pluma! La guardo en mi vitrina.' },
  { id: 'concha', nombre: 'La concha', frase: '¡Una concha! La guardo en mi vitrina.' },
  { id: 'pina', nombre: 'La piña', frase: '¡Una piña! La guardo en mi vitrina.' },
  { id: 'bellota', nombre: 'La bellota', frase: '¡Una bellota! La guardo en mi vitrina.' },
  { id: 'estrellaMar', nombre: 'La estrella de mar', frase: '¡Una estrella de mar! La guardo en mi vitrina.' },
  { id: 'piedra', nombre: 'La piedra bonita', frase: '¡Una piedra bonita! La guardo en mi vitrina.' },
  { id: 'hoja', nombre: 'La hoja', frase: '¡Una hoja preciosa! La guardo en mi vitrina.' },
  { id: 'castana', nombre: 'La castaña', frase: '¡Una castaña! La guardo en mi vitrina.' },
];

// RINCONES: los rincones del mapa donde se esconden, cada uno junto a un lugar, con su pista.
export const RINCONES: readonly Rincon[] = [
  { id: 'jardin', pista: '¡Hay un tesoro cerca del jardín!' },
  { id: 'bosque', pista: '¡Hay un tesoro cerca del bosque!' },
  { id: 'montana', pista: '¡Hay un tesoro cerca de la montaña!' },
  { id: 'plaza', pista: '¡Hay un tesoro cerca de la plaza!' },
  { id: 'muelle', pista: '¡Hay un tesoro cerca del muelle!' },
  { id: 'cole', pista: '¡Hay un tesoro cerca del cole!' },
  { id: 'fiestas', pista: '¡Hay un tesoro cerca de la casa de las fiestas!' },
  { id: 'globo', pista: '¡Hay un tesoro cerca del globo!' },
];

// tesoro(id): el tesoro con ese id, o undefined.
export function tesoro(id: string): Tesoro | undefined {
  return TESOROS.find((t) => t.id === id);
}

// rincon(id): el rincón con ese id, o undefined.
export function rincon(id: string): Rincon | undefined {
  return RINCONES.find((r) => r.id === id);
}

// registroTesoros(raw): lee lo guardado en S.tesoros; si falta o está roto, un registro vacío (las partidas de antes no
// lo tienen).
export function registroTesoros(raw: unknown): RegistroTesoros {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>,
    v = (r.vitrina && typeof r.vitrina === 'object' ? r.vitrina : {}) as Record<string, unknown>;
  return {
    d: typeof r.d === 'string' ? r.d : '',
    hoy: Array.isArray(r.hoy) ? r.hoy.filter((x): x is string => typeof x === 'string') : [],
    vitrina: Object.fromEntries(
      Object.entries(v).filter((e): e is [string, number] => typeof e[1] === 'number' && e[1] > 0),
    ),
  };
}

// semilla(dia): un número que sale de la fecha ('AAAA-MM-DD'), el mismo todo el día (un hash sencillo de sus letras).
const semilla = (dia: string): number =>
  dia.split('').reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 2166136261);

// azarDelDia(dia): una serie de números entre 0 y 1 que siempre es la misma para el mismo día.
function azarDelDia(dia: string): () => number {
  let s = semilla(dia) || 1;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return s / 4294967296;
  };
}

// barajar(lista, azar): la lista en otro orden, al azar (sin cambiar la de entrada).
function barajar<T>(lista: readonly T[], azar: () => number): T[] {
  return lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map((p) => p.x);
}

// tesorosDelDia(dia): los tesoros escondidos ese día y dónde: TESOROS_MAPA.porDia, distintos y en rincones distintos;
// el mismo día da siempre lo mismo (aunque se recargue el juego).
export function tesorosDelDia(dia: string): Escondite[] {
  const azar = azarDelDia(dia),
    ts = barajar(TESOROS, azar),
    rs = barajar(RINCONES, azar);
  return ts.slice(0, TESOROS_MAPA.porDia).map((t, i) => ({ tesoro: t.id, rincon: rs[i]?.id ?? RINCONES[0]!.id }));
}

// deHoy(reg, dia): el registro con lo de hoy al día: si es de otro día, sin rincones encontrados (la vitrina se queda).
const deHoy = (reg: RegistroTesoros, dia: string): RegistroTesoros =>
  reg.d === dia ? reg : { ...reg, d: dia, hoy: [] };

// pendientesHoy(reg, dia): los tesoros de ese día que aún no se han encontrado.
export function pendientesHoy(reg: RegistroTesoros, dia: string): Escondite[] {
  const r = deHoy(reg, dia);
  return tesorosDelDia(dia).filter((e) => !r.hoy.includes(e.rincon));
}

// hallarTesoro(reg, rinconId, dia): Tito encuentra el tesoro del rincón rinconId ese día: el registro nuevo (con el
// rincón apuntado y el tesoro una vez más en la vitrina), cuál era, las monedas que da (una, y dos más si era el último
// del día) y si ya están todos. Si en ese rincón no hay tesoro hoy, o ya se encontró, no cambia nada y no da monedas.
export function hallarTesoro(
  reg: RegistroTesoros,
  rinconId: string,
  dia: string,
): { registro: RegistroTesoros; tesoro: string; monedas: number; todos: boolean } {
  const r = deHoy(reg, dia),
    e = pendientesHoy(r, dia).find((x) => x.rincon === rinconId);
  if (!e) return { registro: r, tesoro: '', monedas: 0, todos: pendientesHoy(r, dia).length === 0 };
  const hoy = [...r.hoy, rinconId],
    todos = hoy.length >= TESOROS_MAPA.porDia,
    vitrina = { ...r.vitrina, [e.tesoro]: (r.vitrina[e.tesoro] ?? 0) + 1 };
  return {
    registro: { d: dia, hoy, vitrina },
    tesoro: e.tesoro,
    monedas: TESOROS_MAPA.moneda + (todos ? TESOROS_MAPA.todos : 0),
    todos,
  };
}
