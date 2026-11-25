/*
 * dominio/variedad.ts: el estilo de los juegos más repetidos, «conocer» y «busca», en cada tema (idea 46 de
 * docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes, v0.2.180), para que no parezcan iguales de un tema a otro:
 * cómo entran las tarjetas (con un rebote, cayendo, girando o desde el lado), qué adorno flota por el fondo (burbujas,
 * hojas, estrellas, corazones o notas) y el color de las tarjetas. Sale siempre el mismo para el mismo tema (se saca del
 * id del tema, sin azar), así cada tema tiene su cara.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/variedad.test.ts. Lo pintan juegos/comps.ts (Conocer y
 * Busca) y juegos/adornos.ts.
 * Exporta: los tipos Entrada, Adorno y EstiloJuego, ENTRADAS, ADORNOS y estiloDe.
 * No importa nada.
 */

/** Cómo entran las tarjetas. */
export type Entrada = 'rebote' | 'caida' | 'giro' | 'lado';
/** Lo que flota por el fondo. */
export type Adorno = 'burbujas' | 'hojas' | 'estrellas' | 'corazones' | 'notas';
/** El estilo de un tema. */
export interface EstiloJuego {
  readonly entrada: Entrada;
  readonly adorno: Adorno;
  readonly color: string;
}

export const ENTRADAS: readonly Entrada[] = ['rebote', 'caida', 'giro', 'lado'];
export const ADORNOS: readonly Adorno[] = ['burbujas', 'hojas', 'estrellas', 'corazones', 'notas'];
// COLORES_TARJETA: los colores claros de las tarjetas.
const COLORES_TARJETA = ['#FFFFFF', '#FFF6E0', '#EAF6FF', '#F0FFF0', '#FFF0F6', '#F5F0FF'];

// numeroDe(id): un número sacado de las letras del id (siempre el mismo para el mismo id).
const numeroDe = (id: string): number => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7);

// estiloDe(id): el estilo del tema id. Sin id (un juego suelto), el de siempre: rebote, sin cambiar el color, burbujas.
export function estiloDe(id: string | undefined): EstiloJuego {
  if (!id) return { entrada: 'rebote', adorno: 'burbujas', color: COLORES_TARJETA[0]! };
  const n = numeroDe(id);
  return {
    entrada: ENTRADAS[n % ENTRADAS.length]!,
    adorno: ADORNOS[Math.floor(n / ENTRADAS.length) % ADORNOS.length]!,
    color: COLORES_TARJETA[Math.floor(n / (ENTRADAS.length * ADORNOS.length)) % COLORES_TARJETA.length]!,
  };
}
