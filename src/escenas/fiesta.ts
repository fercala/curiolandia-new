/*
 * escenas/fiesta.ts: la fiesta al abrir el cofre del tesoro (idea 42 de docs/IDEAS-MEJORA.md, en la PR de todas las
 * ideas pendientes, v0.2.181): durante los primeros segundos después de abrirlo caen confeti y serpentinas por toda la
 * pantalla, y Lupi y Polly vienen a los lados a aplaudir dando saltitos. Es solo dibujo, sin estado: lo pinta el cofre 2D
 * (escenas/cofre.ts) y el 3D (mundo3d/cofre3d.ts) a partir del momento en que se abrió (openT).
 * Exporta: DURA_FIESTA y dibujaFiesta.
 * Importa: el dibujo del núcleo (ctx, T, pic).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos del dibujo en la pantalla de 1600x900. */
import { T, ctx, pic } from '../nucleo/indice.ts';

// DURA_FIESTA: cuántos segundos dura la fiesta; PIEZAS: cuántos trozos de confeti; COLORES_FIESTA: sus colores.
export const DURA_FIESTA = 6;
const PIEZAS = 90;
const COLORES_FIESTA = ['#FF6B6B', '#FFC93C', '#7CC86E', '#5BC0EB', '#B07CE8', '#F58BB4'];

// dibujaFiesta(abierto): si el cofre se abrió hace menos de DURA_FIESTA segundos (abierto: el T de cuando se abrió; 0 si
// sigue cerrado), el confeti que cae girando y los amigos que aplauden; al final se desvanece.
export function dibujaFiesta(abierto: number): void {
  const k = T - abierto;
  if (!abierto || k < 0 || k > DURA_FIESTA) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (DURA_FIESTA - k) / 1.2);
  for (let i = 0; i < PIEZAS; i++) {
    // cada trozo tiene su sitio, su velocidad y su giro, sacados de su número (siempre los mismos, sin azar)
    const x = (i * 211) % 1600,
      v = 260 + ((i * 37) % 200),
      y = -40 - ((i * 53) % 400) + k * v,
      giro = k * (3 + (i % 5)) + i;
    if (y > 920) continue;
    ctx.save();
    ctx.translate(x + Math.sin(k * 2 + i) * 30, y);
    ctx.rotate(giro);
    ctx.fillStyle = COLORES_FIESTA[i % COLORES_FIESTA.length]!;
    ctx.fillRect(-9, -5, 18, i % 3 ? 10 : 4);
    ctx.restore();
  }
  // Lupi y Polly entran desde los lados y saltan como si aplaudieran
  const entra = Math.min(1, k / 0.8),
    salto = Math.abs(Math.sin(k * 7)) * 30;
  pic('lupi', -120 + entra * 300, 690 - salto, 200);
  pic('polly', 1720 - entra * 300, 690 - Math.abs(Math.sin(k * 7 + 1.5)) * 30, 180);
  ctx.restore();
}
