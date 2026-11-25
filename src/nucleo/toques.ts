/*
 * nucleo/toques.ts: la respuesta visual común a todos los juegos (mejora gráfica 8 de docs/MEJORAS-GRAFICAS.md,
 * v0.2.183). Así el niño sabe siempre que su toque ha contado, en cualquier escena, sin que cada juego lo tenga que
 * dibujar:
 *   - cada toque deja una onda (dos aros que se abren y se desvanecen) en el sitio del dedo;
 *   - un acierto (cuando suena SFX.good) hace saltar estrellitas y un aro verde donde se tocó, y Tito da un saltito de
 *     alegría (titoContento, nucleo/tito.ts);
 *   - un fallo (SFX.bad) hace temblar la escena un momento, suave, de lado a lado.
 * Se engancha a los sonidos con ponRespuestaVisual (nucleo/sonido.ts) al cargarse; el bucle (aplicacion/bucle.ts)
 * llama a ondaToque al tocar, a sacudida antes de dibujar la escena y a dibujaToques después.
 * Exporta: ondaToque, sacudida y dibujaToques.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- tamaños, tiempos y colores del dibujo en la pantalla de 1600x900. */
import { ctx, T, VIVO } from './pantalla.ts';
import { PI } from './utilidades.ts';
import { ponRespuestaVisual } from './sonido.ts';
import { sparkles } from './escenas.ts';
import { titoContento } from './tito.ts';

/** Una onda en pantalla: dónde, cuándo empezó (T) y de qué color. */
interface Onda {
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly color: string;
  readonly grande: boolean;
}

// DURA: lo que dura una onda (segundos); TIEMBLA: lo que dura el temblor de un fallo.
const DURA = 0.5,
  TIEMBLA = 0.35;
// ondas: las ondas que se están viendo (como mucho 8: las más viejas se van).
let ondas: readonly Onda[] = [];
// falloT: el momento (T) del último fallo, para el temblor.
let falloT = -9;

// ondaToque(x, y): una onda blanca donde se ha tocado.
export function ondaToque(x: number, y: number): void {
  ondas = [...ondas.slice(-7), { x, y, t: T, color: '255,255,255', grande: false }];
}

// alAcertar(): estrellitas y una onda verde grande donde está el puntero, y Tito salta de alegría.
function alAcertar(): void {
  const x = VIVO.MX ?? 800,
    y = VIVO.MY ?? 450;
  ondas = [...ondas.slice(-7), { x, y, t: T, color: '124,200,110', grande: true }];
  sparkles(x, y, 8);
  titoContento();
}

// alFallar(): empieza el temblor suave de la escena.
function alFallar(): void {
  falloT = T;
}

ponRespuestaVisual(alAcertar, alFallar);

// sacudida(): cuánto se mueve ahora la escena a los lados por el último fallo (en píxeles; 0 si no tiembla).
export function sacudida(): number {
  const e = T - falloT;
  if (e < 0 || e > TIEMBLA) return 0;
  return Math.sin(e * 55) * 7 * (1 - e / TIEMBLA);
}

// dibujaToques(): dibuja las ondas que siguen vivas: dos aros que crecen y se desvanecen (los de acierto, más grandes
// y verdes), con un borde oscuro fino para que se vean también sobre fondos claros.
export function dibujaToques(): void {
  ondas = ondas.filter((o) => T - o.t < DURA);
  if (!ondas.length) return;
  ctx.save();
  ondas.forEach((o) => {
    const k = (T - o.t) / DURA,
      r = (o.grande ? 30 : 16) + k * (o.grande ? 80 : 46),
      a = 1 - k;
    [0, 0.45].forEach((d) => {
      const rr = r * (1 - d);
      if (rr <= 0) return;
      ctx.beginPath();
      ctx.arc(o.x, o.y, rr, 0, PI * 2);
      ctx.lineWidth = 7;
      ctx.strokeStyle = `rgba(74,52,40,${(a * 0.25).toFixed(3)})`;
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(${o.color},${(a * 0.9).toFixed(3)})`;
      ctx.stroke();
    });
  });
  ctx.restore();
}
