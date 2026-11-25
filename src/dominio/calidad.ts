/*
 * dominio/calidad.ts: la calidad automática del 3D (idea 47 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.180). Cada cuatro segundos la capa 3D mide los cuadros por segundo (mundo3d/motor.ts, fpsTick) y esta
 * regla dice qué hacer: si va lento (menos de 24), primero baja la nitidez (la resolución, PRK, hasta la mitad) y, si ya
 * está al mínimo y sigue lento, pasa a sombras ligeras (se recalculan de vez en cuando, no en cada cuadro). Si va
 * sobrado (55 o más) y nunca volvió a ir lento tras subir, la nitidez vuelve a subir; las sombras ligeras se quedan.
 * Antes de esta idea la regla estaba dentro de fpsTick y solo cambiaba la nitidez.
 * Es una regla pura, sin Three.js ni S. Pruebas: tests/unidad/calidad.test.ts.
 * Exporta: el tipo Calidad, CALIDAD (los límites) y ajustarCalidad.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los límites de la regla, en una tabla con nombre. */

/** La calidad de ahora: la nitidez (1 = completa), si van las sombras ligeras, si ya se subió alguna vez y si ya no se
 * vuelve a subir. */
export interface Calidad {
  readonly prk: number;
  readonly ligeras: boolean;
  readonly up: boolean;
  readonly noUp: boolean;
}

// CALIDAD: lento y sobrado (cuadros por segundo), la nitidez mínima y cuánto se baja o se sube cada vez.
export const CALIDAD = { lento: 24, sobrado: 55, minimo: 0.5, paso: 0.75 };

// ajustarCalidad(c, fps): la calidad nueva después de medir fps cuadros por segundo.
export function ajustarCalidad(c: Calidad, fps: number): Calidad {
  if (fps < CALIDAD.lento) {
    if (c.prk > CALIDAD.minimo)
      return { ...c, prk: Math.max(CALIDAD.minimo, c.prk * CALIDAD.paso), noUp: c.noUp || c.up };
    return { ...c, ligeras: true };
  }
  if (fps >= CALIDAD.sobrado && c.prk < 1 && !c.noUp) return { ...c, prk: Math.min(1, c.prk / CALIDAD.paso), up: true };
  return c;
}
