/*
 * dominio/diario.ts: las reglas del diario de Tito (idea 35 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.181). Cada cosa que el niño y Tito hacen juntos (terminar un juego de una casita, una excursión, un
 * cuento, un juego del cole...) se apunta con una clave en el día de hoy; el diario lo enseña como un libro, una página
 * por día, con una frase entera y un dibujo por cosa. Se guardan los últimos 14 días con algo apuntado. Las mismas
 * claves sirven para las misiones del día (dominio/misiones.ts).
 * Lo guardado va en S.diario ({ [fecha]: [claves] }): opcional, sin migración (ausente o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/diario.test.ts.
 * Exporta: los tipos ClaveDiario y RegistroDiario, COSAS_DIARIO, DIAS_DIARIO, registroDiario, apuntar, paginasDiario y
 * hechoHoy.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- cuántos días se guardan, en una constante con nombre. */

/** Lo que se puede apuntar en el diario. */
export type ClaveDiario =
  | 'casita'
  | 'excursion'
  | 'cuento'
  | 'programa'
  | 'bloques'
  | 'logica'
  | 'ciencias'
  | 'arte'
  | 'corral'
  | 'juntos'
  | 'encargo'
  | 'patio';
/** Lo apuntado: por cada día ('AAAA-MM-DD'), las claves de lo que se hizo, en orden. */
export type RegistroDiario = Readonly<Record<string, readonly ClaveDiario[]>>;

// COSAS_DIARIO: lo que cuenta Tito en el diario de cada cosa (frase entera, en pasado) y su dibujo.
export const COSAS_DIARIO: Readonly<Record<ClaveDiario, { frase: string; dibujo: string }>> = {
  casita: { frase: 'Terminamos un juego en una casita y ganamos una estrella.', dibujo: 'estrella' },
  excursion: { frase: 'Fuimos de excursión en el autobús del cole.', dibujo: 'autobus' },
  cuento: { frase: 'Leímos un cuento y elegimos qué pasaba.', dibujo: 'libro' },
  programa: { frase: 'Programamos a Tito para llegar hasta la fresa.', dibujo: 'fresa' },
  bloques: { frase: 'Construimos con bloques en el cole.', dibujo: 'bloques' },
  logica: { frase: 'Resolvimos un juego del rincón de la lógica.', dibujo: 'lupa' },
  ciencias: { frase: 'Hicimos un experimento en el taller de ciencias.', dibujo: 'lupa' },
  arte: { frase: 'Pintamos y tocamos música en el estudio de arte.', dibujo: 'pinturas' },
  corral: { frase: 'Cuidamos a los animales del corral de Tito.', dibujo: 'gallina' },
  juntos: { frase: 'Jugamos juntos a las parejas, por turnos.', dibujo: 'corazon' },
  encargo: { frase: 'Ayudamos a un vecino con su encargo.', dibujo: 'carta' },
  patio: { frase: 'Jugamos en el patio del cole.', dibujo: 'pelota' },
};
// DIAS_DIARIO: cuántos días con algo apuntado se guardan.
export const DIAS_DIARIO = 14;

// esClave(x): ¿es x una clave del diario?
const esClave = (x: unknown): x is ClaveDiario => typeof x === 'string' && x in COSAS_DIARIO;

// registroDiario(x): lee lo guardado (S.diario); si falta o está roto, vacío. Solo se quedan las fechas con claves.
export function registroDiario(x: unknown): RegistroDiario {
  if (!x || typeof x !== 'object') return {};
  return Object.fromEntries(
    Object.entries(x as Record<string, unknown>)
      .filter(([d, v]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && Array.isArray(v))
      .map(([d, v]) => [d, (v as unknown[]).filter(esClave)])
      .filter(([, v]) => (v as ClaveDiario[]).length),
  );
}

// apuntar(reg, fecha, clave): el registro con la clave apuntada en esa fecha (una vez por día) y solo los últimos
// DIAS_DIARIO días.
export function apuntar(reg: RegistroDiario, fecha: string, clave: ClaveDiario): RegistroDiario {
  const hoy = reg[fecha] ?? [];
  if (hoy.includes(clave)) return reg;
  const todo = { ...reg, [fecha]: [...hoy, clave] },
    dias = Object.keys(todo).sort().slice(-DIAS_DIARIO);
  return Object.fromEntries(dias.map((d) => [d, todo[d]!]));
}

// paginasDiario(reg): las páginas del diario, de la más nueva a la más vieja: la fecha y lo que se hizo.
export const paginasDiario = (reg: RegistroDiario): { fecha: string; cosas: readonly ClaveDiario[] }[] =>
  Object.keys(reg)
    .sort()
    .reverse()
    .map((fecha) => ({ fecha, cosas: reg[fecha]! }));

// hechoHoy(reg, fecha, clave): ¿se ha hecho hoy esa cosa?
export const hechoHoy = (reg: RegistroDiario, fecha: string, clave: ClaveDiario): boolean =>
  (reg[fecha] ?? []).includes(clave);
