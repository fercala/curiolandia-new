/*
 * dominio/casaToques.ts: lo que hace cada cosa de la casa de Tito cuando el niño la toca (fase M3 de
 * docs/PLAN-CASA-MEJORA.md, capas 1 y 2): un movimiento corto (el toque directo: la pelota bota, el robot gira, el
 * peluche se aplasta) y, en algunas, un estado que cambia con cada toque y se queda guardado (la lámpara encendida o
 * apagada, el canal de la tele, la torre de bloques...). Lo que hace Tito (capa 3) sigue en REACCIONES de dominio/casa.ts.
 * Es DOMINIO: no dibuja ni sabe de S. Trabaja con los estados tal como se guardan (S.casaEst: {id: número}, donde 0 es
 * el estado normal, el que tiene una cosa recién comprada) y devuelve unos nuevos, sin cambiar los que recibe.
 * Pruebas: tests/unidad/casaToques.test.ts.
 * Exporta: los tipos Toque y Estados, las tablas TOQUES y ESTADOS y las reglas toqueDe, estadoDe y siguienteEstado.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son cuántos estados tiene cada cosa, en una tabla con
   nombre; sacarlos a otra constante solo repetiría el nombre. */

/** Cómo se mueve una cosa al tocarla (la escena dibuja cada uno): botar, saltar, girar, sacudirse, balancearse,
 * aplastarse, latir, temblar, subir (y bajar) o rodar. */
export type Toque =
  'bota' | 'salta' | 'gira' | 'sacude' | 'balancea' | 'aplasta' | 'late' | 'tiembla' | 'sube' | 'rueda';

/** Los estados guardados: id del objeto → su estado (0 = el normal). */
export type Estados = Readonly<Record<string, number>>;

// TOQUES: cómo se mueve cada cosa de la casa al tocarla (las 49 de REACCIONES y las 6 mascotas). Sigue la tabla del
// apartado 3.2 de docs/PLAN-CASA-MEJORA.md; lo que no tiene un movimiento propio, late.
export const TOQUES: Readonly<Record<string, Toque>> = {
  // torre de las estrellas
  telescopio: 'gira',
  tierra: 'gira',
  saturno: 'gira',
  cohete: 'tiembla',
  // salón
  sofa: 'aplasta',
  tele: 'late',
  alfombra: 'sacude',
  cuadro: 'balancea',
  plantaInterior: 'sacude',
  lampara: 'late',
  banco: 'aplasta',
  estanteria: 'sacude',
  reloj: 'balancea',
  farol: 'late',
  piano: 'salta',
  fuente: 'late',
  // dormitorio
  cama: 'aplasta',
  baul: 'salta',
  cuento: 'salta',
  estrellas: 'late',
  // cocina
  mesa: 'sacude',
  silla: 'balancea',
  nevera: 'tiembla',
  olla: 'tiembla',
  tarta: 'late',
  // baño
  banera: 'sacude',
  toalla: 'balancea',
  jabon: 'salta',
  pato: 'bota',
  // cuarto de juegos
  pelotaPlaya: 'bota',
  bloques: 'sacude',
  peluche: 'aplasta',
  cometa: 'sube',
  xilofono: 'salta',
  muneca: 'balancea',
  robot: 'gira',
  trenJuguete: 'rueda',
  guitarra: 'balancea',
  tambor: 'aplasta',
  pizarra: 'sacude',
  pinturas: 'salta',
  globo: 'sube',
  tobogan: 'sacude',
  // jardín
  arbol: 'sacude',
  plantaFlor: 'sacude',
  regadera: 'balancea',
  columpio: 'balancea',
  castillo: 'tiembla',
  piscina: 'sacude',
  // mascotas
  casitaPerro: 'salta',
  gato: 'salta',
  pajaro: 'salta',
  conejo: 'bota',
  hamster: 'salta',
  pecera: 'late',
};

// ESTADOS: las cosas que tienen estado → cuántos estados tienen (con cada toque se pasa al siguiente y se vuelve al 0).
//   lampara y farol: 0 encendida, 1 apagada (la lámpara apagada oscurece su habitación);
//   tele: 0 apagada, 1 a 3 el canal (globos, peces o Tito bailando, como la escena de la tele);
//   cama: 0 hecha, 1 deshecha; olla: 0 sin fuego, 1 con fuego; tarta: 0 sin velas encendidas, 1 encendidas;
//   banera: 0 vacía, 1 con agua; regadera: 0 vacía, 1 llena; fuente: 0 tranquila, 1 echando chorros;
//   estrellas: 0 apagadas, 1 brillando; bloques: la altura de la torre, de 0 a 5 (el toque siguiente la tira).
export const ESTADOS: Readonly<Record<string, number>> = {
  lampara: 2,
  farol: 2,
  tele: 4,
  cama: 2,
  olla: 2,
  tarta: 2,
  banera: 2,
  regadera: 2,
  fuente: 2,
  estrellas: 2,
  bloques: 6,
};

// toqueDe(id): cómo se mueve id al tocarlo; 'late' si no está en la tabla (un objeto nuevo sin apuntar).
export function toqueDe(id: string): Toque {
  return Object.hasOwn(TOQUES, id) ? TOQUES[id] : 'late';
}

// estadoDe(est, id): el estado de id (0 si no tiene, si no está apuntado o si lo apuntado no vale: un número fuera de
// sus estados o algo que no es un número, de una partida rota).
export function estadoDe(est: Estados | null | undefined, id: string): number {
  const n = Object.hasOwn(ESTADOS, id) ? ESTADOS[id] : 0,
    v = est && Object.hasOwn(est, id) ? est[id] : 0;
  return Number.isInteger(v) && v >= 0 && v < n ? v : 0;
}

// siguienteEstado(est, id): los estados con id en su estado siguiente (el último vuelve al 0). Si id no tiene estado,
// los mismos estados.
export function siguienteEstado(est: Estados | null | undefined, id: string): Estados {
  const base = est || {};
  if (!Object.hasOwn(ESTADOS, id)) return base;
  return { ...base, [id]: (estadoDe(base, id) + 1) % ESTADOS[id] };
}
