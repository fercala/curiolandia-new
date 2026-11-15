/*
 * dominio/aventura.ts: las reglas de la gran aventura de Tito (idea 26 de docs/IDEAS-MEJORA.md, fase P16): una historia
 * por capítulos, «El mapa del tesoro perdido». Cada capítulo (un cuento corto y un reto) da un trozo del mapa del tesoro;
 * se juegan en orden y uno nuevo cada día (el primero, siempre; después, el siguiente se abre el día después de terminar
 * el anterior). Los terminados se pueden repetir cuando se quiera, pero solo la primera vez dan monedas y trozo.
 * Los capítulos (sus cuentos y retos) están en contenido/aventura.ts; aquí, solo cuántos son y en qué orden van.
 * Lo guardado va en S.aventura ({hechos, d}): opcional, sin migración (un registro ausente o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/aventura.test.ts.
 * Exporta: los tipos RegistroAventura y EstadoCapitulo, AVENTURA, registroAventura, estadoCapitulo y terminarCapitulo.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (los trozos y las monedas), en una
   tabla con nombre. */

/** Lo guardado: los capítulos terminados, en orden (sus ids), y el día en que se terminó el último por primera vez. */
export interface RegistroAventura {
  readonly hechos: readonly string[];
  readonly d: string;
}

/** Cómo está un capítulo: terminado, abierto (se puede jugar hoy), para mañana (el siguiente, pero hoy ya se ha
 * terminado uno) o cerrado (falta terminar los de antes). */
export type EstadoCapitulo = 'hecho' | 'abierto' | 'manana' | 'cerrado';

// AVENTURA: las reglas: cuántos capítulos (y trozos del mapa) tiene la temporada y las monedas de terminar uno.
export const AVENTURA = { capitulos: 6, monedas: 3 } as const;

// registroAventura(raw): lee lo guardado en S.aventura; si falta o está roto, un registro vacío (las partidas de antes no
// lo tienen). Los ids repetidos se quitan.
export function registroAventura(raw: unknown): RegistroAventura {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>,
    hechos = Array.isArray(r.hechos) ? r.hechos.filter((x): x is string => typeof x === 'string') : [];
  return { hechos: [...new Set(hechos)], d: typeof r.d === 'string' ? r.d : '' };
}

// estadoCapitulo(reg, orden, id, dia): cómo está el capítulo id (orden: los ids de todos, en orden) el día dia. El
// siguiente por hacer está abierto si es el primero o si el último se terminó otro día; si no, es para mañana.
export function estadoCapitulo(
  reg: RegistroAventura,
  orden: readonly string[],
  id: string,
  dia: string,
): EstadoCapitulo {
  if (reg.hechos.includes(id)) return 'hecho';
  const i = orden.indexOf(id),
    siguiente = orden.findIndex((c) => !reg.hechos.includes(c));
  if (i < 0 || i !== siguiente) return 'cerrado';
  return reg.hechos.length === 0 || reg.d !== dia ? 'abierto' : 'manana';
}

// terminarCapitulo(reg, orden, id, dia): se termina el capítulo id el día dia. Si estaba abierto: el registro nuevo
// (con el capítulo apuntado y el día), es nuevo, da sus monedas y dice si con él está toda la temporada. Si ya estaba
// hecho (se repite) o no tocaba, nada cambia y no da monedas.
export function terminarCapitulo(
  reg: RegistroAventura,
  orden: readonly string[],
  id: string,
  dia: string,
): { registro: RegistroAventura; nuevo: boolean; monedas: number; completa: boolean } {
  if (estadoCapitulo(reg, orden, id, dia) !== 'abierto')
    return { registro: reg, nuevo: false, monedas: 0, completa: orden.every((c) => reg.hechos.includes(c)) };
  const registro = { hechos: [...reg.hechos, id], d: dia };
  return {
    registro,
    nuevo: true,
    monedas: AVENTURA.monedas,
    completa: orden.every((c) => registro.hechos.includes(c)),
  };
}
