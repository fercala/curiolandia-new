/*
 * dominio/letras.ts: las reglas del progreso por letra de la Isla de las Letras (fase L7 de docs/PLAN-LECTURA.md).
 * Cada letra tiene su casita ('L3-A', 'L4-M', 'L5-R'...): lo que el niño lleva de una letra es lo que lleva de su
 * casita, los juegos terminados (S.temas[id].g) y los aciertos y fallos de esos juegos (S.gs['id#número']). Con eso,
 * cada letra está sin empezar, en camino, aprendida o le cuesta. Lo usan el libro de letras del álbum
 * (escenas/libroLetras.ts) y la zona de adultos (aplicacion/adultos.ts).
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia nada.
 * Pruebas: tests/unidad/letrasProgreso.test.ts.
 * Exporta: PROGRESO_LETRA (los números de las reglas), los tipos DatosLetra y EstadoLetra, y las reglas datosLetra,
 * aciertosLetra y estadoLetra.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de PROGRESO_LETRA son las reglas mismas, cada uno con su
   nombre. */

/** Lo que lleva el niño de una letra: juegos de su casita terminados (hechos) de cuántos (total), aciertos y fallos. */
export interface DatosLetra {
  readonly hechos: number;
  readonly total: number;
  readonly ok: number;
  readonly err: number;
}

/** Cómo va una letra: sin empezar, en camino, aprendida o le cuesta. */
export type EstadoLetra = 'sinEmpezar' | 'enCamino' | 'aprendida' | 'cuesta';

// PROGRESO_LETRA: los números de las reglas (los mismos que la tabla «Cómo le va» de la zona de adultos).
export const PROGRESO_LETRA = {
  /** Intentos que hacen falta para juzgar los aciertos de una letra. */
  intentos: 5,
  /** Con esta parte de aciertos o más (80 %), y la casita terminada, la letra está aprendida. */
  aprendida: 0.8,
  /** Por debajo de esta parte de aciertos (60 %), la letra cuesta. */
  cuesta: 0.6,
} as const;

// datosLetra(id, total, jugados, gs): lo que lleva el niño de la letra cuya casita es id, con total juegos: cuántos
// están terminados (jugados = S.temas[id].g, por número de juego) y la suma de aciertos y fallos de sus juegos en gs
// (S.gs, con las claves 'id#número').
export function datosLetra(
  id: string,
  total: number,
  jugados: Readonly<Record<string, unknown>>,
  gs: Readonly<Record<string, { readonly ok: number; readonly err: number } | undefined>>,
): DatosLetra {
  let hechos = 0,
    ok = 0,
    err = 0;
  for (let j = 0; j < total; j++) {
    if (jugados[j]) hechos++;
    const r = gs[`${id}#${j}`];
    if (r) {
      ok += r.ok;
      err += r.err;
    }
  }
  return { hechos, total, ok, err };
}

// aciertosLetra(d): el porcentaje de aciertos de la letra (0 a 100, redondeado), o null si aún no tiene intentos.
export function aciertosLetra(d: DatosLetra): number | null {
  const n = d.ok + d.err;
  return n ? Math.round((d.ok / n) * 100) : null;
}

// estadoLetra(d): cómo va la letra. Sin juegos terminados, sin empezar; con 5 intentos o más y menos del 60 % de
// aciertos, le cuesta; con la casita terminada y (pocos intentos o el 80 % de aciertos o más), aprendida; si no, en
// camino.
export function estadoLetra(d: DatosLetra): EstadoLetra {
  if (!d.hechos) return 'sinEmpezar';
  const n = d.ok + d.err,
    parte = n ? d.ok / n : 1;
  if (n >= PROGRESO_LETRA.intentos && parte < PROGRESO_LETRA.cuesta) return 'cuesta';
  if (d.hechos >= d.total && (n < PROGRESO_LETRA.intentos || parte >= PROGRESO_LETRA.aprendida)) return 'aprendida';
  return 'enCamino';
}
