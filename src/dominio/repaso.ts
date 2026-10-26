/*
 * dominio/repaso.ts: las reglas del repaso diario (fase 3d de docs/PLAN-MIGRACION.md). Cada habilidad recuerda en qué
 * juegos sale (S.kg) y cada juego cómo le fue al niño (S.gs). Todos los días Tito arma un repaso de 3 juegos: primero
 * lo que cuesta, después lo que hace más tiempo que no se juega.
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia nada. Recibe lo que mira
 * (DatosRepaso: estadísticas, juegos por habilidad, resultados por juego, los temas y lo jugado) y devuelve listas
 * nuevas. escenas/repaso.ts le pasa los datos de verdad, guarda lo que devuelve en S y dibuja la escena del repaso.
 * Un juego se nombra 'temaId#número' (por ejemplo '3A-T1#2'). Pruebas: tests/unidad/repaso.test.ts.
 * Exporta: NOREP, REPASO (los números de las reglas), los tipos Resultado, TemaRepasable, DatosRepaso y RepasoDelDia, y
 * las reglas repasable, queCuestan, masAntiguos, elegirRepaso, caducado, terminado, toca y conJuegoReciente.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de REPASO son las reglas mismas, cada uno con su nombre. */

/** Aciertos y fallos (S.stats[habilidad] o S.gs[juego]); en S.gs, también el último día jugado (d). */
export interface Resultado {
  readonly ok: number;
  readonly err: number;
  readonly d?: string;
}

/** Lo que mira el repaso de un tema: su id y el tipo (t) de cada juego. */
export interface TemaRepasable {
  readonly id: string;
  readonly games: readonly { readonly t: string }[];
}

/** Los datos de la partida que mira el repaso. */
export interface DatosRepaso {
  /** Aciertos y fallos por habilidad (S.stats). */
  readonly stats: Readonly<Record<string, Resultado>>;
  /** Últimos juegos donde salió cada habilidad, el más reciente primero (S.kg). */
  readonly kg: Readonly<Record<string, readonly string[]>>;
  /** Aciertos, fallos y último día de cada juego (S.gs). */
  readonly gs: Readonly<Record<string, Resultado>>;
  /** Todos los temas, en orden (TEMAS). */
  readonly temas: readonly TemaRepasable[];
  /** El tema id (TEMA[id]), o undefined si no existe. */
  tema(id: string): TemaRepasable | undefined;
  /** Juegos terminados del tema id, por número (S.temas[id].g). */
  jugados(id: string): Readonly<Record<string, unknown>>;
}

/** El repaso de un día (S.rep): los juegos (list), los hechos (done) y cuántos salieron por «cuesta» (weak). */
export interface RepasoDelDia {
  readonly d?: string;
  readonly list: readonly string[];
  readonly done: Readonly<Record<string, unknown>>;
  readonly weak?: number;
}

// NOREP: tipos de juego que no sirven para repasar (no tienen acierto ni fallo, o son solo de mirar o escuchar).
export const NOREP: readonly string[] = ['conocer', 'enConocer', 'cuento', 'cancion', 'trazo', 'decora', 'mifamilia', 'velas'];

// REPASO: los números de las reglas del repaso.
export const REPASO = {
  /** Juegos de cada repaso. */
  juegos: 3,
  /** Por debajo de esta parte de aciertos (70 %), algo «cuesta». */
  aciertos: 0.7,
  /** Intentos que hacen falta para juzgar una habilidad... */
  intentosHabilidad: 4,
  /** ...y un juego. */
  intentosJuego: 3,
  /** Juegos recientes que recuerda cada habilidad (S.kg). */
  recientes: 6,
  /** Estrellas que hacen falta para que Tito proponga repasar. */
  estrellas: 6,
} as const;

// partes(id): el id del tema y el número de juego de un juego 'temaId#número'.
const partes = (id: string): [string, string] => {
  const [tema = '', juego = ''] = id.split('#');
  return [tema, juego];
};

// repasable(d, id): ¿se puede usar el juego id en el repaso? Tiene que existir, no ser de un tipo de NOREP y estar ya
// jugado al menos una vez.
export function repasable(d: DatosRepaso, id: string): boolean {
  const [tid, j] = partes(id);
  const g = d.tema(tid)?.games[+j];
  return !!(g && !NOREP.includes(g.t) && d.jugados(tid)[j]);
}

// conAciertos(id, r): el id con sus intentos (n) y su parte de aciertos (1 si no hay intentos).
const conAciertos = (id: string, r: Resultado): { id: string; n: number; parte: number } => {
  const n = r.ok + r.err;
  return { id, n, parte: n ? r.ok / n : 1 };
};

// queCuestan(d): los juegos «que cuestan», sin repetir: primero, por cada habilidad con 4 intentos o más y menos del
// 70 % de aciertos (de peor a mejor), el juego más reciente donde salió que se pueda repasar; después, los juegos con 3
// intentos o más y menos del 70 % (de peor a mejor).
export function queCuestan(d: DatosRepaso): string[] {
  const habilidades = Object.keys(d.stats)
    .map((k) => conAciertos(k, d.stats[k] ?? { ok: 0, err: 0 }))
    .filter((o) => o.n >= REPASO.intentosHabilidad && o.parte < REPASO.aciertos)
    .sort((a, b) => a.parte - b.parte);
  const porHabilidad = habilidades.reduce<string[]>((out, o) => {
    const id = (d.kg[o.id] ?? []).find((x) => repasable(d, x) && !out.includes(x));
    return id ? [...out, id] : out;
  }, []);
  const juegos = Object.keys(d.gs)
    .map((id) => conAciertos(id, d.gs[id] ?? { ok: 0, err: 0 }))
    .filter((o) => o.n >= REPASO.intentosJuego && o.parte < REPASO.aciertos && repasable(d, o.id))
    .sort((a, b) => a.parte - b.parte);
  return juegos.reduce((out, o) => (out.includes(o.id) ? out : [...out, o.id]), porHabilidad);
}

// masAntiguos(d): todos los juegos que se pueden repasar, del que hace más tiempo que no se juega (o nunca se apuntó
// la fecha) al más reciente; con la misma fecha, en el orden de los temas.
export function masAntiguos(d: DatosRepaso): string[] {
  const lista = d.temas.flatMap((t) => Object.keys(d.jugados(t.id)).map((j) => `${t.id}#${j}`)).filter((id) => repasable(d, id));
  const fecha = (id: string): string => d.gs[id]?.d || '';
  // -1, 0 o 1 según la fecha, comparando los textos 'AAAA-MM-DD' ('' va antes que cualquier fecha).
  const porFecha = (a: { f: string }, b: { f: string }): number => Number(a.f > b.f) - Number(a.f < b.f);
  return lista.map((id) => ({ id, f: fecha(id) })).sort(porFecha).map((o) => o.id);
}

// elegirRepaso(cuestan, antiguos): los juegos del repaso (3 como mucho) y cuántos salen por «cuesta» (weak): hasta 3
// que cuestan; si faltan, los más antiguos de temas distintos; si aún faltan, cualquiera de los antiguos.
export function elegirRepaso(cuestan: readonly string[], antiguos: readonly string[]): { list: string[]; weak: number } {
  const w = cuestan.slice(0, REPASO.juegos);
  const tema = (id: string): string => partes(id)[0];
  const deTemasDistintos = antiguos.reduce(
    (L, id) => (L.length < REPASO.juegos && !L.includes(id) && !L.some((x) => tema(x) === tema(id)) ? [...L, id] : L), w);
  const list = antiguos.reduce((L, id) => (L.length < REPASO.juegos && !L.includes(id) ? [...L, id] : L), deTemasDistintos);
  return { list, weak: w.length };
}

// caducado(R, hoy, d): ¿hay que volver a armar el repaso R? Sí si no hay, si es de otro día, si no tenía juegos «que
// cuestan» pero ahora los hay (y aún no se ha hecho ninguno), o si estaba vacío y ya hay juegos para repasar.
export function caducado(R: RepasoDelDia | null | undefined, hoy: string, d: DatosRepaso): boolean {
  if (!R || R.d !== hoy) return true;
  if (!R.weak && !Object.keys(R.done).length && queCuestan(d).length) return true;
  return !R.list.length && masAntiguos(d).length > 0;
}

// terminado(R, hoy): ¿están hechos todos los juegos del repaso de hoy? (false si R es de otro día o está vacío).
export function terminado(R: RepasoDelDia | null | undefined, hoy: string): boolean {
  return !!(R && R.d === hoy && R.list.length && R.list.every((id) => R.done[id]));
}

// toca(estrellas, R, hoy, d): ¿toca repasar? Con 6 estrellas o más, si el repaso de hoy no está terminado y hay algo
// que cuesta (en el mapa sale el «!» rojo en la lupa).
export function toca(estrellas: number, R: RepasoDelDia | null | undefined, hoy: string, d: DatosRepaso): boolean {
  return estrellas >= REPASO.estrellas && !terminado(R, hoy) && queCuestan(d).length > 0;
}

// conJuegoReciente(lista, id): la lista nueva de juegos recientes de una habilidad (S.kg[habilidad]) después de jugar
// id: id pasa al principio (sin repetirse) y se guardan como mucho 6. Si id ya era el primero, una copia igual.
export function conJuegoReciente(lista: readonly string[], id: string): string[] {
  if (lista[0] === id) return [...lista];
  const i = lista.indexOf(id);
  const sin = i >= 0 ? [...lista.slice(0, i), ...lista.slice(i + 1)] : lista;
  return [id, ...sin].slice(0, REPASO.recientes);
}
