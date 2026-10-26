/*
 * dominio/dificultad.ts: las reglas de la dificultad (fase 3e de docs/PLAN-MIGRACION.md): la edad que cuenta, cuántas
 * opciones y cuántas rondas tiene un juego y la dificultad adaptativa (sube con 4 aciertos seguidos a la primera y
 * baja al fallar dos veces).
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia nada. Recibe la edad, la
 * dificultad adaptativa (Adaptacion) y las veces que ya se ha terminado el juego, y devuelve la respuesta o la
 * dificultad nueva. nucleo/guardado.ts (AGE), nucleo/interfaz.ts (nOpts, nRounds, onRight, onWrongTwice, que guardan la
 * dificultad adaptativa en VIVO.ADAPT y en su racha) y escenas/escenas2d.ts (VIVO.REP al entrar en un juego) las usan.
 * Pruebas: tests/unidad/dificultad.test.ts.
 * Exporta: EDAD_POR_DEFECTO, el tipo Adaptacion, SIN_ADAPTAR y las reglas
 * edadDe, repeticion, opciones, rondas, trasAcierto y trasDosFallos. DIFICULTAD (los números de las reglas) es interna
 * desde la fase 4n.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de DIFICULTAD son las reglas mismas, cada uno con su
   nombre. */

// EDAD_POR_DEFECTO: la edad que cuenta si aún no se ha elegido (S.age es 0 o no está).
export const EDAD_POR_DEFECTO = 3;

// DIFICULTAD: los números de las reglas de la dificultad.
const DIFICULTAD = {
  /** Hasta esta edad, los juegos son de «pequeños»: menos opciones y menos rondas. */
  edadPequenos: 3,
  /** Opciones de cada pregunta: de pequeños... */
  opcionesPequenos: 2,
  /** ...y de mayores (4 y 5 años). */
  opcionesMayores: 3,
  /** Nunca menos opciones que estas... */
  minOpciones: 2,
  /** ...ni más que estas. */
  maxOpciones: 4,
  /** Rondas de cada juego: de pequeños... */
  rondasPequenos: 4,
  /** ...y de mayores. */
  rondasMayores: 5,
  /** Aciertos seguidos a la primera que suben la dificultad adaptativa. */
  racha: 4,
  /** Lo más fácil de la dificultad adaptativa (una opción menos)... */
  facil: -1,
  /** ...y lo más difícil (una opción más). */
  dificil: 1,
  /** Repeticiones de un juego que cuentan: con 1, una opción más; con 2, además una ronda más. */
  repeticiones: 2,
} as const;

/** La dificultad adaptativa (no se guarda en S): adapt va de -1 a 1; racha cuenta los aciertos seguidos a la primera. */
export interface Adaptacion {
  readonly adapt: number;
  readonly racha: number;
}

// SIN_ADAPTAR: la dificultad adaptativa al empezar: ni más fácil ni más difícil, sin racha.
export const SIN_ADAPTAR: Adaptacion = { adapt: 0, racha: 0 };

// edadDe(guardada): la edad que cuenta (3, 4 o 5): la guardada (S.age) o, si aún no se eligió, EDAD_POR_DEFECTO.
export function edadDe(guardada: number | undefined): number {
  return guardada || EDAD_POR_DEFECTO;
}

// repeticion(veces): cuántas repeticiones de un juego cuentan para la dificultad (0, 1 o 2), con las veces que ya se
// ha terminado (S.temas[id].g[juego]; nada si nunca). Es VIVO.REP mientras se juega.
export function repeticion(veces: number | undefined): number {
  return Math.min(DIFICULTAD.repeticiones, veces || 0);
}

// opciones(edad, adapt, rep): cuántas opciones enseñar en cada pregunta (de 2 a 4): 2 de pequeños y 3 de mayores, más
// la dificultad adaptativa, y una más si el juego ya se ha repetido.
export function opciones(edad: number, adapt: number, rep: number): number {
  const base = edad <= DIFICULTAD.edadPequenos ? DIFICULTAD.opcionesPequenos : DIFICULTAD.opcionesMayores;
  const n = base + adapt + Number(rep >= 1);
  return Math.max(DIFICULTAD.minOpciones, Math.min(DIFICULTAD.maxOpciones, n));
}

// rondas(edad, rep): rondas de cada juego: 4 de pequeños y 5 de mayores; una más desde la segunda repetición.
export function rondas(edad: number, rep: number): number {
  const base = edad <= DIFICULTAD.edadPequenos ? DIFICULTAD.rondasPequenos : DIFICULTAD.rondasMayores;
  return base + Number(rep >= DIFICULTAD.repeticiones);
}

// trasAcierto(a, aLaPrimera): la dificultad adaptativa después de un acierto. Si fue a la primera, la racha sube; al
// llegar a 4, la dificultad sube un punto (como mucho hasta 1) y la racha vuelve a 0. Un acierto que no fue a la
// primera no cambia nada (tampoco corta la racha).
export function trasAcierto(a: Adaptacion, aLaPrimera: unknown): Adaptacion {
  if (!aLaPrimera) return { ...a };
  const racha = a.racha + 1;
  if (racha < DIFICULTAD.racha) return { adapt: a.adapt, racha };
  return { adapt: Math.min(DIFICULTAD.dificil, a.adapt + 1), racha: 0 };
}

// trasDosFallos(a): la dificultad adaptativa después de fallar dos veces la misma pregunta: baja un punto (como poco
// hasta -1) y la racha vuelve a 0.
export function trasDosFallos(a: Adaptacion): Adaptacion {
  return { adapt: Math.max(DIFICULTAD.facil, a.adapt - 1), racha: 0 };
}
