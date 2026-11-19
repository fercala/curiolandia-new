/*
 * dominio/tiempo.ts: las reglas del tiempo de verdad en el mapa (idea 21 de docs/IDEAS-MEJORA.md, fase P26). En la
 * asamblea, el niño dice qué tiempo hace hoy (S.asam[fecha].tiempo, que ya se guardaba) y el mapa lo muestra: lluvia (y
 * charcos donde saltar con Tito), nieve (y un montón de nieve para hacer un muñeco), viento, nubes o niebla. Si hoy no
 * se ha dicho, el mapa sigue como siempre (con las hojas, la nieve o los pétalos de cada estación).
 * Los juegos del tiempo: saltar los charcos (cuántos, según la edad; al acabar sale el arcoíris) y el muñeco de nieve
 * por partes, en orden (cuántas, según la edad), con la guerra de bolas de nieve al final.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/tiempo.test.ts.
 * Exporta: los tipos TiempoMapa y JuegoTiempo, TIEMPO_MAPA, JUEGO_DEL_TIEMPO, tiempoDelMapa, juegoDelTiempo,
 * cuantosCharcos, PARTES_MUNECO, partesMuneco, bolasDeNieve y COLORES_ARCOIRIS.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos charcos, partes y bolas
   según la edad), en tablas con nombre. */

/** Lo que muestra el mapa: cada tiempo de la asamblea se pinta con uno de estos. */
export type TiempoMapa = 'sol' | 'nubes' | 'lluvia' | 'nieve' | 'viento' | 'niebla';
/** Los juegos del tiempo: saltar los charcos (con lluvia) y el muñeco de nieve (con nieve). */
export type JuegoTiempo = 'charcos' | 'muneco';

// TIEMPO_MAPA: cómo se pinta en el mapa cada tiempo de la asamblea (WX de escenas/escenas2d.ts): la tormenta, como la
// lluvia, y lo nublado, con nubes.
export const TIEMPO_MAPA: Readonly<Record<string, TiempoMapa>> = {
  sol: 'sol',
  nublado: 'nubes',
  lluvia: 'lluvia',
  tormenta: 'lluvia',
  nieve: 'nieve',
  viento: 'viento',
  niebla: 'niebla',
};

// JUEGO_DEL_TIEMPO: el juego que hay en el mapa con cada tiempo (con los demás, ninguno).
export const JUEGO_DEL_TIEMPO: Readonly<Partial<Record<TiempoMapa, JuegoTiempo>>> = {
  lluvia: 'charcos',
  nieve: 'muneco',
};

// edadDe(edad): la edad entre 3 y 5 (otra cuenta como la más cercana).
const edadDe = (edad: number): number => Math.min(5, Math.max(3, Math.round(edad)));

// tiempoDelMapa(apuntado): lo que muestra hoy el mapa según el tiempo apuntado en la asamblea de hoy (undefined si no
// se ha dicho, o si no se conoce): null, y el mapa sigue como siempre.
export function tiempoDelMapa(apuntado: string | undefined): TiempoMapa | null {
  return (apuntado && TIEMPO_MAPA[apuntado]) || null;
}

// juegoDelTiempo(t): el juego del tiempo que hay en el mapa con el tiempo t, o null.
export function juegoDelTiempo(t: TiempoMapa | null): JuegoTiempo | null {
  return (t && JUEGO_DEL_TIEMPO[t]) || null;
}

// cuantosCharcos(edad): los charcos donde salta Tito: 3 con 3 años, 4 con 4 y 5 con 5.
export function cuantosCharcos(edad: number): number {
  return edadDe(edad);
}

/** Una parte del muñeco de nieve: su id y lo que dice Tito para pedirla (frase entera, para traducirla entera). */
export interface ParteMuneco {
  readonly id: string;
  readonly pide: string;
}

// PARTES_MUNECO: las partes del muñeco de nieve, en el orden en que se ponen.
export const PARTES_MUNECO: readonly ParteMuneco[] = [
  { id: 'bolaGrande', pide: 'Primero, la bola grande de abajo.' },
  { id: 'bolaPequena', pide: 'Ahora, la bola pequeña: la cabeza.' },
  { id: 'nariz', pide: 'Le falta la nariz: ¡una zanahoria!' },
  { id: 'gorro', pide: 'Para que no tenga frío, el gorro.' },
  { id: 'bufanda', pide: 'Y una bufanda calentita.' },
  { id: 'botones', pide: 'Por último, los botones.' },
];

// PARTES_EDAD: cuántas partes del muñeco se ponen según la edad (las primeras de PARTES_MUNECO).
const PARTES_EDAD: Readonly<Record<number, number>> = { 3: 3, 4: 4, 5: 6 };

// partesMuneco(edad): las partes que se ponen, en orden: 3 con 3 años (las bolas y la nariz), 4 con 4 (y el gorro) y
// todas con 5.
export function partesMuneco(edad: number): readonly ParteMuneco[] {
  return PARTES_MUNECO.slice(0, PARTES_EDAD[edadDe(edad)]);
}

// BOLAS_EDAD: cuántas bolas de nieve hay que acertar en la guerra de bolas según la edad.
const BOLAS_EDAD: Readonly<Record<number, number>> = { 3: 3, 4: 4, 5: 5 };

// bolasDeNieve(edad): las bolas que hay que acertar a los amigos que asoman en la guerra de bolas.
export function bolasDeNieve(edad: number): number {
  return BOLAS_EDAD[edadDe(edad)]!;
}

// COLORES_ARCOIRIS: los siete colores del arcoíris, de fuera adentro (los que nombra Tito al salir).
export const COLORES_ARCOIRIS = ['#E8504A', '#FF9A3C', '#FFD23C', '#5DBB55', '#4FA8E8', '#4A5BD0', '#8E5CC9'] as const;
