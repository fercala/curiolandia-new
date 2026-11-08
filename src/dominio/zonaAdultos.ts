/*
 * dominio/zonaAdultos.ts: las reglas de lo que enseña la zona de adultos (fases A2, A3 y A6 de
 * docs/PLAN-MENU-ADULTOS.md): cuántos vales quedan por entregar, si toca recordar la copia de seguridad, la etiqueta de
 * cada habilidad de «Cómo le va» (lo sabe, en camino, le cuesta o recién empieza), el orden de la tabla (primero lo que
 * cuesta) y el resumen de una zona (temas terminados y juegos hechos).
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia nada; las páginas de
 * aplicacion/adultos/ le pasan los datos.
 * Pruebas: tests/unidad/zonaAdultos.test.ts.
 * Exporta: ZONA_ADULTOS (los números de las reglas), los tipos EtiquetaHabilidad, AciertosHabilidad y ResumenZona, y
 * valesPorEntregar, diasEntre, tocaCopia, etiquetaHabilidad, ordenHabilidades y resumenZona.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de ZONA_ADULTOS son las reglas mismas, cada uno con su
   nombre; 100 es un porcentaje y 86400000, los milisegundos de un día. */

// ZONA_ADULTOS: los números de las reglas. Los de las habilidades son los de siempre de la tabla «Cómo le va».
export const ZONA_ADULTOS = {
  /** Intentos que hacen falta para juzgar una habilidad (con menos, «Recién empieza»). */
  intentos: 5,
  /** Porcentaje de aciertos desde el que una habilidad «Lo sabe». */
  sabe: 80,
  /** Porcentaje de aciertos desde el que una habilidad va «En camino» (por debajo, «Le cuesta»). */
  camino: 60,
  /** Días sin copia de seguridad a partir de los que el Resumen lo recuerda (fase A6). */
  diasCopia: 30,
  /** Habilidades que enseña la tabla «Cómo le va» antes de «Ver todas» (fase A3). */
  habilidadesVisibles: 10,
} as const;

/** La etiqueta de una habilidad en «Cómo le va». */
export type EtiquetaHabilidad = 'empieza' | 'sabe' | 'camino' | 'cuesta';

/** Aciertos y fallos de una habilidad (S.stats[clave]). */
export interface AciertosHabilidad {
  readonly ok: number;
  readonly err: number;
}

/** Lo que lleva el niño de una zona: temas terminados de cuántos y juegos hechos de cuántos. */
export interface ResumenZona {
  readonly terminados: number;
  readonly temas: number;
  readonly hechos: number;
  readonly juegos: number;
}

// valesPorEntregar(log): los vales comprados en la tienda que la familia aún no ha marcado como entregados.
export const valesPorEntregar = (log: readonly { readonly given?: number | boolean }[]): number =>
  log.filter((v) => !v.given).length;

// diasEntre(desde, hasta): días enteros que van de la fecha desde a la fecha hasta ('AAAA-MM-DD'; a mediodía, para que
// el cambio de hora no reste un día). Si hasta es anterior, da un número negativo.
export function diasEntre(desde: string, hasta: string): number {
  const a = new Date(desde + 'T12:00').getTime(),
    b = new Date(hasta + 'T12:00').getTime();
  return Math.round((b - a) / 86400000);
}

// tocaCopia(ultima, hoy, hayProgreso): ¿recuerda el Resumen que conviene hacer una copia de seguridad? Solo si ya hay
// algo que perder (hayProgreso) y nunca se ha hecho (ultima vacía) o la última es de hace ZONA_ADULTOS.diasCopia días o más.
export function tocaCopia(ultima: string | undefined, hoy: string, hayProgreso: boolean): boolean {
  if (!hayProgreso) return false;
  if (!ultima) return true;
  return diasEntre(ultima, hoy) >= ZONA_ADULTOS.diasCopia;
}

// etiquetaHabilidad(s): con menos de ZONA_ADULTOS.intentos intentos, 'empieza'; si no, según el porcentaje de aciertos:
// 'sabe' (80 % o más), 'camino' (60 % o más) o 'cuesta'.
export function etiquetaHabilidad(s: AciertosHabilidad): EtiquetaHabilidad {
  const n = s.ok + s.err;
  if (n < ZONA_ADULTOS.intentos) return 'empieza';
  const r = Math.round((s.ok / n) * 100);
  return r >= ZONA_ADULTOS.sabe ? 'sabe' : r >= ZONA_ADULTOS.camino ? 'camino' : 'cuesta';
}

// ordenHabilidades(stats): las claves de las habilidades con algún intento, primero las que cuestan y, dentro de cada
// grupo, de más a menos practicadas (a igualdad, por orden alfabético, para que el orden sea siempre el mismo).
export function ordenHabilidades(stats: Readonly<Record<string, AciertosHabilidad>>): string[] {
  const n = (k: string) => stats[k].ok + stats[k].err,
    cuesta = (k: string) => (etiquetaHabilidad(stats[k]) === 'cuesta' ? 0 : 1);
  return Object.keys(stats)
    .filter((k) => n(k) > 0)
    .sort((a, b) => cuesta(a) - cuesta(b) || n(b) - n(a) || a.localeCompare(b));
}

// resumenZona(temas): suma lo de cada tema de una zona (juegos hechos, cuántos tiene y si está terminado).
export function resumenZona(
  temas: readonly { readonly hechos: number; readonly juegos: number; readonly terminado: boolean }[],
): ResumenZona {
  return {
    terminados: temas.filter((t) => t.terminado).length,
    temas: temas.length,
    hechos: temas.reduce((a, t) => a + t.hechos, 0),
    juegos: temas.reduce((a, t) => a + t.juegos, 0),
  };
}
