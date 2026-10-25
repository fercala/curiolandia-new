/*
 * dominio/progreso.ts: las reglas de lo que el niño va consiguiendo al jugar (fase 3b de docs/PLAN-MIGRACION.md):
 * estrellas y temas terminados, cómo crecen la casa de Tito y Pipo, qué habitaciones de la casa y qué niveles de la
 * tienda se abren, el siguiente regalo del cofre y si hoy es su cumpleaños.
 * Es DOMINIO, como dominio/apertura.ts: no sabe nada de pantalla ni de S y no escribe nada. Recibe lo que mira (el
 * progreso de los temas, lo que ya tiene el niño, la fecha) y devuelve la respuesta. Los archivos de siempre conservan
 * sus nombres y les pasan S: temasDone y STARS (nucleo/tito.ts), roomOpen (escenas/tienda.ts), houseLevel, petStage,
 * nextGift e isBday (escenas/zonas.ts). Pruebas: tests/unidad/progreso.test.ts.
 * Exporta: HOUSE_NEXT, PET_NEXT, TIER_NEED y GIFTS (los números y el orden de las reglas), el tipo TemaGuardado y las
 * reglas estrellas, temasTerminados, nivelCasa, etapaPipo, habitacionAbierta, nivelAbierto, siguienteRegalo y esCumple.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de este archivo son las reglas mismas, en tablas con
   nombre (temas o estrellas que pide cada cosa); sacarlos a otra constante solo repetiría el nombre de la tabla. */

/** Progreso guardado de un tema (S.temas[id]), como lo miran estas reglas: juegos terminados (g) y si está terminado. */
export type TemaGuardado = { readonly g?: Readonly<Record<number, unknown>>; readonly done?: unknown } | null | undefined;

// HOUSE_NEXT: temas terminados que hacen falta para cada nivel de la casa de Tito (1: jardín con cerca, 2: un piso más,
// 3: torre con bandera, 4: castillo). Con menos de 2, nivel 0.
export const HOUSE_NEXT: readonly number[] = [2, 5, 9, 14];

// PET_NEXT: estrellas que hacen falta para cada etapa de Pipo (1: el huevo se abre, 2 a 4: el dinosaurio crece). Con
// menos de 4, etapa 0 (el huevo).
export const PET_NEXT: readonly number[] = [4, 15, 35, 70];

// TIER_NEED: estrellas que hacen falta para cada nivel de artículos de la tienda: el 1 siempre, el 2 con 8, el 3 con 20.
export const TIER_NEED: Readonly<Record<number, number>> = { 1: 0, 2: 8, 3: 20 };

// GIFTS: los regalos del cofre (ids de artículos de la tienda), en orden fijo: sorpresa para el niño, pero sin azar.
// Lo demás se queda en la tienda.
export const GIFTS: readonly string[] = [
  'gorroFiesta', 'pelotaPlaya', 'cuadro', 'bufanda:azul', 'peluche', 'plantaInterior', 'monio', 'cometa', 'alfombra',
  'caparazon:azul', 'xilofono', 'farol', 'gorra', 'bloques', 'lampara', 'pecera', 'gafas', 'banco', 'robot',
  'caparazon:rosa', 'trenJuguete', 'hamster', 'sombreroPirata', 'fuente', 'telescopio', 'corona',
];

// estrellas(temas): estrellas ganadas: una por cada juego distinto terminado al menos una vez, en todos los temas.
export function estrellas(temas: Readonly<Record<string, TemaGuardado>>): number {
  return Object.values(temas).reduce((a, t) => a + Object.keys(t?.g ?? {}).length, 0);
}

// temasTerminados(temas): cuántos temas están terminados; es el número de flores del caparazón de Tito.
export function temasTerminados(temas: Readonly<Record<string, TemaGuardado>>): number {
  return Object.values(temas).filter((t) => t?.done).length;
}

// nivelCasa(terminados): nivel de la casa de Tito (0 a 4) con esos temas terminados: cuántos escalones de HOUSE_NEXT
// alcanza (0 con menos de 2, 1 de 2 a 4, 2 de 5 a 8, 3 de 9 a 13, 4 con 14 o más).
export function nivelCasa(terminados: number): number {
  return HOUSE_NEXT.filter((n) => terminados >= n).length;
}

// etapaPipo(estrellas): etapa de Pipo (0 a 4) con esas estrellas: cuántos escalones de PET_NEXT alcanza (0 con menos
// de 4, 1 de 4 a 14, 2 de 15 a 34, 3 de 35 a 69, 4 con 70 o más).
export function etapaPipo(estrellas: number): number {
  return PET_NEXT.filter((n) => estrellas >= n).length;
}

// habitacionAbierta(need, terminados): ¿está abierta una habitación de la casa de Tito que pide need temas terminados?
// Las de need 0 (el salón), siempre.
export function habitacionAbierta(need: number, terminados: number): boolean {
  return need === 0 || terminados >= need;
}

// nivelAbierto(tier, estrellas): ¿se pueden comprar los artículos del nivel tier con esas estrellas (TIER_NEED)? Un
// nivel sin número en TIER_NEED, siempre.
export function nivelAbierto(tier: number, estrellas: number): boolean {
  const need = TIER_NEED[tier];
  return need === undefined || estrellas >= need;
}

// siguienteRegalo(catalogo, tiene): el siguiente regalo del cofre: el primero de GIFTS que está en el catálogo de la
// tienda y que el niño aún no tiene (tiene[id]), o null si ya los tiene todos.
export function siguienteRegalo<A extends { readonly id: string }>(catalogo: readonly A[], tiene: Readonly<Record<string, unknown>>): A | null {
  return GIFTS.map((id) => catalogo.find((a) => a.id === id)).find((a) => a && !tiene[a.id]) ?? null;
}

// esCumple(cumple, mes, dia): true si el día (mes de 0 a 11 y día del mes) es el cumpleaños guardado (S.bday); false
// si no hay cumpleaños guardado.
export function esCumple(cumple: { readonly m: number; readonly d: number } | null | undefined, mes: number, dia: number): boolean {
  return !!cumple && cumple.m === mes && cumple.d === dia;
}
