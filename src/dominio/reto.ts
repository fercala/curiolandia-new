/*
 * dominio/reto.ts: las reglas del modo reto de las casitas (idea 32 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.180). Cuando se han terminado todos los juegos de una casita, se puede activar el modo reto: cada
 * juego sale con la dificultad más alta (el máximo de opciones y una ronda más que al repetir) y sin ayudas, y al
 * terminarlo da una estrella dorada (la primera vez de cada juego, con 3 monedas más).
 * Lo guardado va en S.reto ({ [tema]: [juegos con estrella dorada] }): opcional, sin migración.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/reto.test.ts.
 * Exporta: el tipo RegistroReto, RETO_MONEDAS, retoAbierto, opcionesReto, rondasReto, registroReto, doradasDe y
 * apuntarReto.
 * Importa: opciones y rondas (dominio/dificultad.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas, en constantes con nombre. */
import { opciones, rondas } from './dificultad.ts';

/** Las estrellas doradas: por tema, los números de los juegos superados en modo reto. */
export type RegistroReto = Readonly<Record<string, readonly number[]>>;
// RETO_MONEDAS: las monedas de más por la primera estrella dorada de cada juego.
export const RETO_MONEDAS = 3;

// retoAbierto(hechos, n): ¿se puede jugar en modo reto? Solo si los n juegos de la casita están terminados (hechos son
// las veces que se ha terminado cada uno, S.temas[id].g).
export const retoAbierto = (hechos: Readonly<Record<number, number>> | undefined, n: number): boolean =>
  n > 0 && [...Array(n).keys()].every((j) => (hechos?.[j] ?? 0) > 0);
// opcionesReto(edad): las opciones de cada pregunta en modo reto: las de la dificultad más alta.
export const opcionesReto = (edad: number): number => opciones(edad, 1, 2);
// rondasReto(edad): las rondas en modo reto: una más que en la segunda repetición.
export const rondasReto = (edad: number): number => rondas(edad, 2) + 1;

// registroReto(x): lee lo guardado (S.reto); si falta o está roto, vacío.
export function registroReto(x: unknown): RegistroReto {
  if (!x || typeof x !== 'object') return {};
  return Object.fromEntries(
    Object.entries(x as Record<string, unknown>)
      .filter(([, v]) => Array.isArray(v))
      .map(([t, v]) => [t, (v as unknown[]).filter((n): n is number => Number.isInteger(n) && (n as number) >= 0)]),
  );
}
// doradasDe(reg, tema): los juegos del tema con estrella dorada.
export const doradasDe = (reg: RegistroReto, tema: string): readonly number[] => reg[tema] ?? [];
// apuntarReto(reg, tema, juego): apunta la estrella dorada del juego; devuelve el registro nuevo, si es nueva y las
// monedas de más (RETO_MONEDAS si es nueva).
export function apuntarReto(
  reg: RegistroReto,
  tema: string,
  juego: number,
): { reg: RegistroReto; nueva: boolean; monedas: number } {
  const antes = doradasDe(reg, tema);
  if (antes.includes(juego)) return { reg, nueva: false, monedas: 0 };
  return { reg: { ...reg, [tema]: [...antes, juego].sort((a, b) => a - b) }, nueva: true, monedas: RETO_MONEDAS };
}
