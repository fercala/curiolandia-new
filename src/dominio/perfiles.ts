/*
 * dominio/perfiles.ts: las reglas de los perfiles, varios niños en el mismo móvil (idea 38 de docs/IDEAS-MEJORA.md, en
 * la PR de todas las ideas pendientes, v0.2.181). Hasta tres perfiles (A, B y C), cada uno con su nombre, su edad y su
 * partida entera. La partida del perfil que juega sigue siempre en la clave de guardado de siempre (nucleo/guardado.ts,
 * KEY), así que la partida de hoy pasa a ser el perfil A sin migrar nada; las de los demás esperan en su propia clave
 * (claveDePerfil). El índice de perfiles va aparte, en CLAVE_PERFILES. Si no hay índice, hay un solo perfil: el de hoy.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/perfiles.test.ts.
 * Exporta: los tipos Perfil e IndicePerfiles, MAX_PERFILES, CLAVE_PERFILES, claveDePerfil, indiceDe, anadirPerfil,
 * activar y partidaNueva.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- cuántos perfiles caben: la regla misma, en una constante con nombre. */

/** Un perfil: su id, el nombre y la edad de quien juega. */
export interface Perfil {
  readonly id: string;
  readonly nombre: string;
  readonly edad: number;
}
/** El índice de perfiles: el que juega, la lista y si se acaba de cambiar (para no volver a preguntar «¿Quién juega?»). */
export interface IndicePerfiles {
  readonly activo: string;
  readonly lista: readonly Perfil[];
  readonly recien: boolean;
}

// MAX_PERFILES: cuántos perfiles caben; IDS: sus ids, en orden.
export const MAX_PERFILES = 3;
const IDS = ['A', 'B', 'C'];
// CLAVE_PERFILES: la clave de guardado del índice; claveDePerfil(id): la de la partida de un perfil que no juega.
export const CLAVE_PERFILES = 'curiolandia-new.perfiles';
export const claveDePerfil = (id: string): string => 'curiolandia-new.perfil.' + id;

// perfilDe(x): un perfil guardado con la forma buena, o null.
function perfilDe(x: unknown): Perfil | null {
  const p = (x && typeof x === 'object' ? x : null) as Partial<Perfil> | null;
  if (!p || typeof p.id !== 'string' || !IDS.includes(p.id)) return null;
  return {
    id: p.id,
    nombre: typeof p.nombre === 'string' ? p.nombre.slice(0, 20) : '',
    edad: [3, 4, 5].includes(Number(p.edad)) ? Number(p.edad) : 0,
  };
}

// indiceDe(x, actual): el índice guardado (leído de CLAVE_PERFILES), con el nombre y la edad del perfil que juega al
// día (los de la partida de ahora, actual). Si falta o está roto, un solo perfil, el A, el de la partida de ahora.
export function indiceDe(x: unknown, actual: { nombre: string; edad: number }): IndicePerfiles {
  const i = (x && typeof x === 'object' ? x : {}) as Partial<IndicePerfiles>,
    lista = (Array.isArray(i.lista) ? i.lista.map(perfilDe) : [])
      .filter((p): p is Perfil => !!p)
      .filter((p, k, todos) => todos.findIndex((q) => q.id === p.id) === k)
      .slice(0, MAX_PERFILES),
    activo = lista.some((p) => p.id === i.activo) ? i.activo! : 'A',
    conActivo = lista.some((p) => p.id === activo) ? lista : [{ id: activo, nombre: '', edad: 0 }, ...lista];
  return {
    activo,
    lista: conActivo.map((p) => (p.id === activo ? { ...p, nombre: actual.nombre, edad: actual.edad } : p)),
    recien: !!i.recien,
  };
}

// anadirPerfil(ind, nombre, edad): el índice con un perfil nuevo (el primer id libre) y su id; null si ya no caben.
export function anadirPerfil(
  ind: IndicePerfiles,
  nombre: string,
  edad: number,
): { indice: IndicePerfiles; id: string } | null {
  const id = IDS.find((x) => !ind.lista.some((p) => p.id === x));
  if (!id) return null;
  return { indice: { ...ind, lista: [...ind.lista, { id, nombre: nombre.slice(0, 20), edad }] }, id };
}

// activar(ind, id): el índice con el perfil id como el que juega (recién cambiado); null si no existe o ya juega.
export function activar(ind: IndicePerfiles, id: string): IndicePerfiles | null {
  if (id === ind.activo || !ind.lista.some((p) => p.id === id)) return null;
  return { ...ind, activo: id, recien: true };
}

// partidaNueva(p): la partida con la que empieza un perfil nuevo: solo su nombre y su edad (el resto lo pone el juego
// al cargarla, como en una partida vieja).
export const partidaNueva = (p: Perfil): { name: string; age: number } => ({ name: p.nombre, age: p.edad });
