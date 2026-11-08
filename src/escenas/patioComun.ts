/*
 * escenas/patioComun.ts: lo que comparten los juegos del patio del cole (desde la fase P2 de docs/IDEAS-MEJORA.md; en la
 * P1 estaba dentro de escenas/estatuas.ts): el botón «Otra vez» del final con su cartel, las estrellas de las rondas,
 * la sombra de Tito y terminar una actividad (apuntarla en S.cole y dar sus monedas).
 * Exporta: OTRA_VEZ, enOtraVez, dibujaFinal, dibujaRondas, sombra y terminarEnElPatio.
 * Importa: el núcleo (dibujo, toque, monedas, guardado) y terminarActividad de dominio/cole.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import {
  S,
  SFX,
  W,
  burst,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  giveCoins,
  hC,
  hv,
  later,
  save,
  star,
  text,
  today,
} from '../nucleo/indice.ts';
import { terminarActividad } from '../dominio/cole.ts';

// OTRA_VEZ: el botón de volver a jugar que sale al final (centro y radio).
export const OTRA_VEZ = { x: 1000, y: 700, r: 80 };

// enOtraVez(x, y): ¿se ha tocado el botón «Otra vez»?
export const enOtraVez = (x: number, y: number): boolean => dist(x, y, OTRA_VEZ.x, OTRA_VEZ.y) < OTRA_VEZ.r;

// dibujaFinal(): lo que se ve al acabar un juego del patio: el cartel «¡Lo has hecho genial!» y el botón verde con la
// flecha de volver a empezar (crece un poco bajo el ratón, id 'otraVez').
export function dibujaFinal(): void {
  const s = hv('otraVez', hC(OTRA_VEZ.x, OTRA_VEZ.y, OTRA_VEZ.r));
  ctx.save();
  ctx.translate(OTRA_VEZ.x, OTRA_VEZ.y);
  ctx.scale(s, s);
  circ(0, 0, OTRA_VEZ.r, '#7CC86E', 7);
  ctx.beginPath();
  ctx.arc(0, 0, 38, -2.6, 2.2);
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#fff';
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-40, -50);
  ctx.lineTo(-30, -14);
  ctx.lineTo(-66, -20);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();
  card(W / 2 - 260, 150, 520, 90, '#fff', 6, 45);
  text('¡Lo has hecho genial!', W / 2, 212, 44);
}

// dibujaRondas(n, hechas): las n estrellas de las rondas, arriba en el centro; llenas las hechas.
export function dibujaRondas(n: number, hechas: number): void {
  Array.from({ length: n }, (_, i) =>
    star(W / 2 - ((n - 1) * 70) / 2 + i * 70, 70, 28, i < hechas ? '#FFC93C' : '#fff', 5),
  );
}

// sombra(x, y, r): una sombra redonda en el suelo (la de Tito, más pequeña cuanto más alto salta).
export function sombra(x: number, y: number, r: number): void {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(20, r), Math.max(8, r * 0.22), 0, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();
}

// terminarEnElPatio(id, x, y): el juego del patio id ha terminado: lo apunta en S.cole (terminarActividad,
// dominio/cole.ts) y, si es la primera vez de hoy, abona sus monedas ya (creditCoins) y guarda; luego, con la fanfarria,
// las anima saliendo de (x, y). Devuelve las monedas que ha dado (0 si hoy ya se había jugado).
export function terminarEnElPatio(id: string, x: number, y: number): number {
  const r = terminarActividad(S.cole, id, today());
  S.cole = { ...r.registro, hechas: [...r.registro.hechas], veces: { ...r.registro.veces } };
  if (r.monedas) creditCoins(r.monedas);
  save();
  SFX.tada();
  burst(W / 2, 400, 70);
  if (r.monedas) later(900, () => giveCoins(r.monedas, x, y, undefined, true));
  return r.monedas;
}
