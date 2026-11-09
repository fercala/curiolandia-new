/*
 * dominio/excursiones.ts: las reglas del motor de excursiones (base B1 de docs/IDEAS-MEJORA.md, fase P5): una excursión
 * es un sitio al que se va en el autobús del cole (la granja escuela, más adelante el zoo...) con varias estaciones, cada
 * una un juego. Aquí se decide qué estaciones están hechas en la visita de ahora, cuál toca después, cuándo se ha
 * terminado la visita (todas las estaciones que ya se pueden jugar) y lo que da terminarla: la foto de grupo y monedas
 * la primera vez de cada día. Los datos de cada excursión están en contenido/excursiones.ts.
 * Es DOMINIO: no sabe nada de pantalla ni de S y no cambia nada; las escenas (escenas/excursion.ts y las estaciones) le
 * pasan lo guardado (S.exc) y guardan lo que devuelve. Pruebas: tests/unidad/excursiones.test.ts.
 * Exporta: los tipos Estacion, Excursion, VisitaExcursion y RegistroExcursiones, EXCURSION (los números de las reglas),
 * visitaDe, estacionesJugables, siguienteEstacion, terminarEstacion, visitaCompleta y terminarVisita, y desde la P7,
 * para el álbum de excursiones, diaYMes y vecesTexto; desde la P8, MANZANO (el manzano de la granja que crece por días).
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de EXCURSION son las reglas mismas, cada uno con su nombre. */

/** Una estación de una excursión: su id, su nombre (lo dice el guía), la escena que la juega (sin escena: «¡Muy
 * pronto!»), el dibujo de su sitio y dónde está en el plano de la excursión (centro, en la pantalla de 1600x900). */
export interface Estacion {
  readonly id: string;
  readonly nombre: string;
  readonly escena?: string;
  readonly icono: string;
  readonly x: number;
  readonly y: number;
}
/** Una excursión: su id, su nombre, el dibujo de su cartel, quién guía (el dibujo y su nombre), sus estaciones y
 * (desde la fase P7) los animales que pasean por su plano. Sin estaciones jugables, sale en el autobús como «¡Muy pronto!». */
export interface Excursion {
  readonly id: string;
  readonly nombre: string;
  readonly icono: string;
  readonly guia: string;
  readonly nombreGuia: string;
  readonly estaciones: readonly Estacion[];
  readonly animales?: readonly string[];
}
/** Lo que se guarda de una excursión: las estaciones hechas en la visita de ahora, cuántas visitas se han terminado,
 * si ya hay foto de grupo y el último día que se terminó una visita. */
export interface VisitaExcursion {
  readonly vistas: readonly string[];
  readonly veces: number;
  readonly foto: boolean;
  readonly d: string;
}
/** S.exc: lo guardado de cada excursión, por su id. */
export type RegistroExcursiones = Readonly<Record<string, VisitaExcursion>>;

// EXCURSION: los números de las reglas.
export const EXCURSION = {
  /** Monedas por terminar una visita, la primera vez de cada día. */
  monedasVisita: 5,
} as const;

// visitaDe(r, id): lo guardado de la excursión id en r si tiene la forma buena; si no (partidas de antes o algo roto),
// una visita vacía.
export function visitaDe(r: unknown, id: string): VisitaExcursion {
  const v = (r && typeof r === 'object' ? (r as Record<string, unknown>)[id] : undefined) as
    Partial<VisitaExcursion> | undefined;
  if (!v || typeof v !== 'object' || !Array.isArray(v.vistas)) return { vistas: [], veces: 0, foto: false, d: '' };
  return {
    vistas: v.vistas.filter((x) => typeof x === 'string'),
    veces: typeof v.veces === 'number' ? v.veces : 0,
    foto: !!v.foto,
    d: typeof v.d === 'string' ? v.d : '',
  };
}

// estacionesJugables(e): las estaciones de la excursión e que ya tienen escena (las demás salen «¡Muy pronto!»).
export function estacionesJugables(e: Excursion): Estacion[] {
  return e.estaciones.filter((s) => !!s.escena);
}

// siguienteEstacion(e, v): la primera estación jugable que aún no se ha hecho en la visita v (para la mano de ayuda y
// lo que dice el guía), o undefined si ya están todas.
export function siguienteEstacion(e: Excursion, v: VisitaExcursion): Estacion | undefined {
  return estacionesJugables(e).find((s) => !v.vistas.includes(s.id));
}

// terminarEstacion(v, id): la estación id se ha hecho en esta visita (si ya estaba, no cambia nada). No cambia v.
export function terminarEstacion(v: VisitaExcursion, id: string): VisitaExcursion {
  return v.vistas.includes(id) ? v : { ...v, vistas: [...v.vistas, id] };
}

// visitaCompleta(e, v): ¿se han hecho en esta visita todas las estaciones que ya se pueden jugar?
export function visitaCompleta(e: Excursion, v: VisitaExcursion): boolean {
  const j = estacionesJugables(e);
  return j.length > 0 && j.every((s) => v.vistas.includes(s.id));
}

// terminarVisita(v, hoy): la visita se ha terminado (con la foto de grupo): se suma una vez, hay foto, la próxima
// visita empieza sin estaciones hechas y da EXCURSION.monedasVisita si hoy aún no se había terminado ninguna. Devuelve
// la visita nueva y las monedas.
export function terminarVisita(v: VisitaExcursion, hoy: string): { visita: VisitaExcursion; monedas: number } {
  return {
    visita: { vistas: [], veces: v.veces + 1, foto: true, d: hoy },
    monedas: v.d === hoy ? 0 : EXCURSION.monedasVisita,
  };
}

// diaYMes(d, meses): la fecha d ('2026-11-09') dicha como en el álbum, «9 de noviembre», con los nombres de los meses
// meses (de enero a diciembre). Si d no es una fecha, ''.
export function diaYMes(d: string, meses: readonly string[]): string {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(d),
    mes = m ? meses[Number(m[1]) - 1] : undefined;
  return m && mes ? `${Number(m[2])} de ${mes}` : '';
}

// vecesTexto(n): cuántas veces, para decirlo: «una vez», «2 veces».
export const vecesTexto = (n: number): string => (n === 1 ? 'una vez' : `${n} veces`);

// MANZANO: el manzano de la granja escuela (desde la fase P8, crecer por días, dominio/crecer.ts): de qué excursión es,
// con qué id se guarda en S.crece y los días de visita que pide cada etapa (0 semilla recién plantada, 1 brote,
// 2 arbolito, 3 árbol en flor y 4 árbol con manzanas).
export const MANZANO = { exc: 'granja', id: 'granja:manzano', dias: [2, 3, 5, 7] } as const;
