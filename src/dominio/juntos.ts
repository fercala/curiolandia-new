/*
 * dominio/juntos.ts: las reglas de «Jugar juntos», el juego de las parejas por turnos para dos (idea 39 de
 * docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes, v0.2.180): un niño y un adulto, o dos hermanos. Las
 * cartas están boca abajo; cada jugador da la vuelta a dos: si son pareja, se quedan boca arriba, se las apunta y sigue;
 * si no, se vuelven a tapar y le toca al otro. Cuando no quedan cartas, han terminado juntos.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/juntos.test.ts.
 * Exporta: el tipo Partida, planParejas, nuevaPartida, voltear, tapar y terminada.
 * Importa: el tipo Azar (dominio/logica.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- cuántas parejas según la edad: la regla misma, en una tabla. */
import type { Azar } from './logica.ts';

// DIBUJOS_PAREJAS: los dibujos de las cartas.
const DIBUJOS_PAREJAS = ['gato', 'perro', 'pato', 'conejo', 'pez', 'mariposa', 'sol', 'flor', 'manzana', 'pelota'];
// PAREJAS_POR_EDAD: cuántas parejas hay según la edad.
const PAREJAS_POR_EDAD: Readonly<Record<number, number>> = { 3: 4, 4: 6, 5: 8 };

/** Una partida: las cartas (sus dibujos), las ya encontradas, las que están boca arriba ahora, a quién le toca (0 o 1)
 * y las parejas de cada jugador. */
export interface Partida {
  readonly cartas: readonly string[];
  readonly halladas: readonly number[];
  readonly arriba: readonly number[];
  readonly turno: number;
  readonly puntos: readonly [number, number];
}

// planParejas(edad, azar): las cartas desordenadas (4, 6 u 8 parejas según la edad).
export function planParejas(edad: number, azar: Azar): string[] {
  const n = PAREJAS_POR_EDAD[Math.min(5, Math.max(3, Math.round(edad)))]!,
    dibujos = DIBUJOS_PAREJAS.map((k) => ({ k, r: azar() }))
      .sort((a, b) => a.r - b.r)
      .slice(0, n)
      .map((o) => o.k);
  return [...dibujos, ...dibujos]
    .map((k) => ({ k, r: azar() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.k);
}
// nuevaPartida(cartas): la partida al empezar (le toca al jugador 0).
export const nuevaPartida = (cartas: readonly string[]): Partida => ({
  cartas,
  halladas: [],
  arriba: [],
  turno: 0,
  puntos: [0, 0],
});

// voltear(p, i): da la vuelta a la carta i. Devuelve la partida y qué ha pasado: 'nada' (no se puede: ya está arriba,
// encontrada o hay dos arriba), 'primera', 'pareja' (se apunta al jugador, que sigue) o 'fallo' (se quedan arriba hasta
// tapar, y luego le toca al otro).
export function voltear(p: Partida, i: number): { partida: Partida; pasa: 'nada' | 'primera' | 'pareja' | 'fallo' } {
  if (i < 0 || i >= p.cartas.length || p.halladas.includes(i) || p.arriba.includes(i) || p.arriba.length >= 2)
    return { partida: p, pasa: 'nada' };
  if (!p.arriba.length) return { partida: { ...p, arriba: [i] }, pasa: 'primera' };
  const a = p.arriba[0]!;
  if (p.cartas[a] !== p.cartas[i]) return { partida: { ...p, arriba: [a, i] }, pasa: 'fallo' };
  const puntos: [number, number] = [p.puntos[0], p.puntos[1]];
  puntos[p.turno] = puntos[p.turno]! + 1;
  return { partida: { ...p, halladas: [...p.halladas, a, i], arriba: [], puntos }, pasa: 'pareja' };
}
// tapar(p): tras un fallo, tapa las dos cartas y le toca al otro jugador.
export const tapar = (p: Partida): Partida => ({ ...p, arriba: [], turno: 1 - p.turno });
// terminada(p): ¿se han encontrado todas las parejas?
export const terminada = (p: Partida): boolean => p.halladas.length === p.cartas.length;
