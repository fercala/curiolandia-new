/*
 * dominio/cole.ts: las reglas del cole y su patio (docs/IDEAS-MEJORA.md, fase P1): qué actividades tiene el patio, cuáles
 * están ya hechas y cuáles salen «muy pronto», y lo que pasa al terminar una (monedas la primera vez de cada día y la
 * cuenta de veces que se ha hecho, para la zona de adultos).
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia nada; las escenas del cole
 * (escenas/patio.ts y las de cada actividad) le pasan el registro guardado (S.cole) y guardan lo que devuelve.
 * Pruebas: tests/unidad/cole.test.ts.
 * Exporta: los tipos ActividadPatio, RegistroCole y FinActividad, ACTIVIDADES_PATIO, COLE (los números de las reglas),
 * registroCole, actividadDelPatio y terminarActividad.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de COLE son las reglas mismas, cada uno con su nombre. */

/** Una actividad del patio: su id, su nombre para la voz y la pantalla, la escena que la juega (sin escena: aún «muy
 * pronto») y el dibujo de su botón. */
export interface ActividadPatio {
  readonly id: string;
  readonly nombre: string;
  readonly escena?: string;
  readonly icono: string;
}

/** Lo que se guarda del cole (S.cole): el último día que se jugó, lo hecho ese día y cuántas veces se ha hecho cada
 * actividad desde siempre. */
export interface RegistroCole {
  readonly d: string;
  readonly hechas: readonly string[];
  readonly veces: Readonly<Record<string, number>>;
}

/** Lo que devuelve terminar una actividad: el registro nuevo, las monedas que da y si es la primera vez que se hace. */
export interface FinActividad {
  readonly registro: RegistroCole;
  readonly monedas: number;
  readonly primeraVez: boolean;
}

// COLE: los números de las reglas.
export const COLE = {
  /** Monedas por terminar una actividad del patio, la primera vez de cada día. Las demás veces no da. */
  monedasActividad: 3,
} as const;

// ACTIVIDADES_PATIO: las actividades del patio, en el orden de sus botones. Las que no tienen escena salen con un cartel
// de «¡Muy pronto!» (se irán haciendo de una en una, en el orden de docs/IDEAS-MEJORA.md). Las carreras (fase P10) son
// en 3D: sin WebGL su escena no existe y el patio también las enseña como «¡Muy pronto!» (escenas/patio.ts). El gran
// día del deporte (fase P11) junta en una jornada la carrera y cuatro pruebas más (escenas/deporte.ts). «Juegos cortos»
// (fase P12) no es un juego: abre el menú de los juegos cortos (dominio/juegosCortos.ts), que se apuntan cada uno con
// su id. El escondite (fase P13a, dominio/escondite.ts) y el circuito de psicomotricidad (fase P13b, aún «muy pronto»).
export const ACTIVIDADES_PATIO: readonly ActividadPatio[] = [
  { id: 'estatuas', nombre: '¡Estatuas!', escena: 'estatuas', icono: 'notas' },
  { id: 'titoDice', nombre: 'Tito dice', escena: 'titoDice', icono: 'manos' },
  { id: 'yoga', nombre: 'Yoga de los animales', escena: 'yoga', icono: 'gato' },
  { id: 'carreras', nombre: 'Carreras', escena: 'carreras', icono: 'estrella' },
  { id: 'deporte', nombre: 'Día del deporte', escena: 'deporte', icono: 'silbato' },
  { id: 'juegosCortos', nombre: 'Juegos cortos', escena: 'juegosCortos', icono: 'columpio' },
  { id: 'escondite', nombre: 'El escondite', escena: 'escondite', icono: 'lupa' },
  { id: 'circuito', nombre: 'El circuito', icono: 'bloques' },
];

// registroCole(r): el registro guardado si tiene la forma buena; si no (partidas de antes o algo roto), uno vacío.
export function registroCole(r: unknown): RegistroCole {
  const x = r as Partial<RegistroCole> | null | undefined;
  if (!x || typeof x !== 'object' || typeof x.d !== 'string' || !Array.isArray(x.hechas)) {
    return { d: '', hechas: [], veces: {} };
  }
  const veces = x.veces && typeof x.veces === 'object' ? x.veces : {};
  return { d: x.d, hechas: x.hechas.filter((h) => typeof h === 'string'), veces };
}

// actividadDelPatio(id): la actividad del patio con ese id, o undefined si no hay ninguna.
export function actividadDelPatio(id: string): ActividadPatio | undefined {
  return ACTIVIDADES_PATIO.find((a) => a.id === id);
}

// terminarActividad(r, id, hoy): lo que pasa al terminar la actividad id el día hoy ('AAAA-MM-DD'). Si el registro es
// de otro día, se empieza un día nuevo (lo hecho ayer no cuenta). Da COLE.monedasActividad monedas si hoy aún no se
// había hecho, y suma una vez en veces. No cambia r: devuelve el registro nuevo.
export function terminarActividad(r: unknown, id: string, hoy: string): FinActividad {
  const reg = registroCole(r),
    hechas = reg.d === hoy ? reg.hechas : [],
    yaHoy = hechas.includes(id),
    antes = reg.veces[id] ?? 0;
  return {
    registro: {
      d: hoy,
      hechas: yaHoy ? hechas : [...hechas, id],
      veces: { ...reg.veces, [id]: antes + 1 },
    },
    monedas: yaHoy ? 0 : COLE.monedasActividad,
    primeraVez: antes === 0,
  };
}
