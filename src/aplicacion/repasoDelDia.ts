/*
 * aplicacion/repasoDelDia.ts: el caso de uso «el repaso del día» (fase 4c de docs/PLAN-MIGRACION.md): apuntar cada
 * acierto o fallo (por habilidad y por juego), preparar el repaso de hoy, saber si toca repasar o si ya está hecho y si
 * el botón verde de seguir pasa hoy por el repaso. Antes estaba en escenas/repaso.ts, que lo añadía envolviendo rec,
 * goSeguir y el mapa; ahora lo llaman directamente rec (nucleo/interfaz.ts), goSeguir y el mapa (escenas/zonas.ts) y la
 * escena del repaso (escenas/repaso.ts).
 * Junta las reglas de dominio/repaso.ts con los datos de la partida que recibe (en el juego, S) y con los temas del
 * juego (CATALOGO, de escenas/escenas2d.ts). No cambia la partida, no dibuja, no habla y no guarda: devuelve las
 * respuestas o los campos nuevos de la partida, y quien llama los pone en S y guarda.
 * Pruebas: tests/unidad/repasoDelDia.test.ts (sin navegador: cada prueba inventa la partida y los temas).
 * Exporta: los tipos RepasoGuardado, PartidaDeRepaso, CatalogoDeTemas, RepasoNuevo y Apuntado y los casos de uso
 * apuntarResultado, repasoCaducado, nuevoRepaso, tocaRepasar, repasoTerminado y seguirPorElRepaso.
 * Importa: solo reglas y tipos de dominio/repaso.ts.
 */
import type { DatosRepaso, RepasoDelDia, Resultado, TemaRepasable } from '../dominio/repaso.ts';
import { caducado, conIntento, conJuegoReciente, elegirRepaso, masAntiguos, queCuestan, terminado, toca } from '../dominio/repaso.ts';

/** El repaso del día tal como se guarda (S.rep): además de los juegos y los hechos, si ya se cobró el premio (paid) y
 * si el botón verde ya pasó hoy por el repaso (seen). */
export interface RepasoGuardado extends RepasoDelDia {
  readonly paid?: number | boolean;
  readonly seen?: number | boolean;
}

/** Lo que el repaso mira de la partida (S). */
export interface PartidaDeRepaso {
  /** Aciertos y fallos por habilidad (S.stats). */
  readonly stats: Readonly<Record<string, Resultado>>;
  /** Últimos juegos donde salió cada habilidad (S.kg; si falta, vacío). */
  readonly kg?: Readonly<Record<string, readonly string[]>>;
  /** Aciertos, fallos y último día de cada juego (S.gs; si falta, vacío). */
  readonly gs?: Readonly<Record<string, Resultado>>;
  /** Progreso de cada tema (S.temas): lo que mira el repaso son los juegos terminados (g). */
  readonly temas: Readonly<Record<string, { readonly g?: Readonly<Record<string, unknown>> } | undefined>>;
  /** El repaso del día (S.rep), si ya se ha preparado alguno. */
  readonly rep?: RepasoGuardado | null;
}

/** Los temas del juego: todos en orden (TEMAS) y cada uno por su id (TEMA). */
export interface CatalogoDeTemas {
  readonly lista: readonly TemaRepasable[];
  tema(id: string): TemaRepasable | undefined;
}

/** Un repaso del día recién preparado (lo que nuevoRepaso pone en S.rep). */
export interface RepasoNuevo {
  readonly d: string;
  readonly list: string[];
  readonly done: Record<string, number>;
  readonly weak: number;
  readonly paid: number;
  readonly seen: number;
}

/** Los campos nuevos de la partida después de apuntar un acierto o un fallo (kg y gs, solo si era en un juego). */
export interface Apuntado {
  readonly stats: Record<string, Resultado>;
  readonly kg?: Record<string, readonly string[]>;
  readonly gs?: Record<string, Resultado>;
}

// datos(p, cat): lo que miran las reglas del repaso (DatosRepaso), sacado de la partida p y de los temas cat.
function datos(p: PartidaDeRepaso, cat: CatalogoDeTemas): DatosRepaso {
  return {
    stats: p.stats, kg: p.kg ?? {}, gs: p.gs ?? {}, temas: cat.lista,
    tema: (id) => cat.tema(id), jugados: (id) => p.temas[id]?.g ?? {},
  };
}

// apuntarResultado(p, habilidad, juego, ok): los campos nuevos de la partida p después de un acierto (ok verdadero) o un
// fallo en la habilidad: uno más en stats[habilidad] y, si se estaba jugando un juego (juego = 'temaId#número'; null
// si no), también en gs[juego], y el juego pasa a ser el más reciente de esa habilidad (kg[habilidad], como mucho 6).
export function apuntarResultado(p: PartidaDeRepaso, habilidad: string, juego: string | null, ok: unknown): Apuntado {
  const stats = { ...p.stats, [habilidad]: conIntento(p.stats[habilidad] ?? { ok: 0, err: 0 }, ok) };
  if (juego === null) return { stats };
  const kg = { ...p.kg, [habilidad]: conJuegoReciente(p.kg?.[habilidad] ?? [], juego) };
  const gs = { ...p.gs, [juego]: conIntento(p.gs?.[juego] ?? { ok: 0, err: 0, d: '' }, ok) };
  return { stats, kg, gs };
}

// repasoCaducado(p, cat, hoy): ¿hay que preparar otra vez el repaso? Sí si no hay, si es de otro día, si no tenía juegos
// «que cuestan» pero ahora los hay (y aún no se ha hecho ninguno), o si estaba vacío y ya hay juegos (caducado).
export function repasoCaducado(p: PartidaDeRepaso, cat: CatalogoDeTemas, hoy: string): boolean {
  return caducado(p.rep, hoy, datos(p, cat));
}

// nuevoRepaso(p, cat, hoy): el repaso de hoy, recién preparado (3 juegos como máximo): hasta 3 que cuestan; si faltan,
// los más antiguos de temas distintos; si aún faltan, cualquier antiguo (elegirRepaso). Sin hechos ni premio cobrado.
export function nuevoRepaso(p: PartidaDeRepaso, cat: CatalogoDeTemas, hoy: string): RepasoNuevo {
  const d = datos(p, cat);
  const { list, weak } = elegirRepaso(queCuestan(d), masAntiguos(d));
  return { d: hoy, list, done: {}, weak, paid: 0, seen: 0 };
}

// tocaRepasar(p, cat, hoy, estrellas): ¿toca repasar? Con 6 estrellas o más, si el repaso de hoy no está terminado y hay
// algo que cuesta (en el mapa sale el «!» rojo en la lupa; toca).
export function tocaRepasar(p: PartidaDeRepaso, cat: CatalogoDeTemas, hoy: string, estrellas: number): boolean {
  return toca(estrellas, p.rep, hoy, datos(p, cat));
}

// repasoTerminado(p, hoy): ¿están hechos todos los juegos del repaso de hoy? (en el mapa, punto verde en la lupa).
export function repasoTerminado(p: PartidaDeRepaso, hoy: string): boolean {
  return terminado(p.rep, hoy);
}

// seguirPorElRepaso(p, cat, hoy, estrellas): ¿el botón verde de seguir lleva hoy al repaso? Una vez al día (hasta que
// el repaso de hoy apunta seen), si toca repasar. goSeguir lo pregunta después de comprobar que ya se hizo la asamblea.
export function seguirPorElRepaso(p: PartidaDeRepaso, cat: CatalogoDeTemas, hoy: string, estrellas: number): boolean {
  return tocaRepasar(p, cat, hoy, estrellas) && !(p.rep && p.rep.d === hoy && p.rep.seen);
}
