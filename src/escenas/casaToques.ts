// ARCHIVO: escenas/casaToques.ts — cómo se ven en la casa 2D los toques directos y los estados de las cosas (fase M3
//   de docs/PLAN-CASA-MEJORA.md, capas 1 y 2).
// Cómo encaja: la escena de la casa (SCENES.casaTito, escenas/casa.ts) apunta cuándo se tocó cada cosa y, al
//   dibujarla, le pide aquí su movimiento (poseToque, con el Toque de dominio/casaToques.ts) y le dibuja encima lo de su
//   estado guardado (dibujaEstado: la luz del farol, la tele encendida con su canal, el fuego de la olla, la torre de
//   bloques...). Todo depende de la hora T: no hay física ni motor, para que vaya bien en los móviles.
// Desde la fase M3b, los otros 2 dibujos del cuadro.
// Exporta: DURACION_TOQUE, poseToque y dibujaEstado.
// Importa: el núcleo (T, PI, ctx, circ, star) y los tipos Pose (escenas/casaReacciones.ts) y Toque.
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600×900, como el resto de src/escenas/: los números son posiciones, tamaños y ritmos, y los bucles dibujan. */
import { PI, T, circ, ctx, star } from '../nucleo/indice.ts';
import type { Pose } from './casaReacciones.ts';
import type { Toque } from '../dominio/casaToques.ts';

/** Segundos que dura el movimiento de un toque directo. */
export const DURACION_TOQUE = 0.9;

// QUIETO: la pose sin mover nada.
const QUIETO: Pose = { dx: 0, dy: 0, rot: 0, sc: 1, sq: 0, sleep: false };
// baja(u): de 1 a 0 a lo largo del toque (para que todo se calme al final).
const baja = (u: number) => Math.max(0, 1 - u / DURACION_TOQUE);

// POSES: el movimiento de cada toque en el segundo u desde que se tocó.
const POSES: Readonly<Record<Toque, (u: number) => Partial<Pose>>> = {
  bota: (u) => ({ dy: -Math.abs(Math.sin(u * 10)) * 60 * baja(u) }),
  salta: (u) => ({ dy: -Math.sin(Math.min(1, u / 0.45) * PI) * 40 }),
  gira: (u) => ({ rot: Math.sin(u * 7) * 0.35 * baja(u) }),
  sacude: (u) => ({ dx: Math.sin(u * 40) * 10 * baja(u) }),
  balancea: (u) => ({ rot: Math.sin(u * 9) * 0.22 * baja(u) }),
  aplasta: (u) => ({ sq: Math.abs(Math.sin(u * 9)) * 0.16 * baja(u) }),
  late: (u) => ({ sc: 1 + Math.abs(Math.sin(u * 9)) * 0.1 * baja(u) }),
  tiembla: (u) => ({ dx: Math.sin(u * 70) * 5 * baja(u), dy: Math.sin(u * 55) * 3 * baja(u) }),
  sube: (u) => ({ dy: -Math.sin(Math.min(1, u / DURACION_TOQUE) * PI) * 120 }),
  rueda: (u) => ({ dx: Math.sin(Math.min(1, u / DURACION_TOQUE) * PI) * 120 }),
};

// poseToque(t, t0, ahora): cómo se mueve una cosa que se tocó a la hora t0 con el toque t; quieta si ya pasó.
export function poseToque(t: Toque, t0: number, ahora: number = T): Pose {
  const u = ahora - t0;
  if (u < 0 || u > DURACION_TOQUE) return QUIETO;
  return { ...QUIETO, ...POSES[t](u) };
}

// llama(x, y, h): una llamita que se mueve, con la base en (x, y) y alto h.
function llama(x: number, y: number, h: number) {
  const b = Math.sin(T * 14 + x) * h * 0.12;
  ctx.beginPath();
  ctx.moveTo(x - h * 0.3, y);
  ctx.quadraticCurveTo(x - h * 0.35, y - h * 0.5, x + b, y - h);
  ctx.quadraticCurveTo(x + h * 0.35, y - h * 0.5, x + h * 0.3, y);
  ctx.closePath();
  ctx.fillStyle = '#FF9F1C';
  ctx.fill();
  circ(x, y - h * 0.25, h * 0.16, '#FFE08A', 0);
}
// brillo(x, y, r): un círculo amarillo que late (luz).
function brillo(x: number, y: number, r: number) {
  ctx.globalAlpha = 0.28 + 0.06 * Math.sin(T * 3);
  circ(x, y, r, '#FFE08A', 0);
  ctx.globalAlpha = 1;
}
// gotas(x, y, n, alto): n gotas azules que caen de (x, y), una detrás de otra.
function gotas(x: number, y: number, n: number, alto: number) {
  for (let i = 0; i < n; i++) {
    const f = (T * 1.4 + i / n) % 1;
    circ(x + Math.sin(i * 3) * 8, y + f * alto, 6, '#5BB8E6', 0);
  }
}
// COLORES_BLOQUES: los colores de los bloques de la torre, de abajo arriba.
const COLORES_BLOQUES = ['#FF6B5E', '#FFC93C', '#7CC86E', '#5BB8E6', '#9B8AD9'];
// CANALES: lo que se ve en la pantalla de cada canal de la tele (1 globos, 2 peces, 3 estrellas que bailan).
const CANALES = ['', '#BFEAF7', '#5BB8E6', '#2E3F7A'];

// pantalla(s, canal): la pantalla encendida de la tele, con un dibujo que se mueve según el canal.
function pantalla(s: number, canal: number) {
  const w = s * 0.52,
    h = s * 0.32,
    x = -w / 2,
    y = -s * 0.66;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fillStyle = CANALES[canal];
  ctx.fill();
  ctx.clip();
  for (let i = 0; i < 3; i++) {
    const px = x + ((T * 40 + i * w * 0.4) % w),
      py = y + h * 0.5 + Math.sin(T * 3 + i) * h * 0.25;
    if (canal === 1) circ(px, py, h * 0.16, ['#FF6B5E', '#FFC93C', '#7CC86E'][i], 0);
    else if (canal === 2) circ(px, py, h * 0.12, '#FFA94D', 0);
    else star(px, py, h * 0.14, '#FFE08A', 0);
  }
  ctx.restore();
}

// ESTADO_DIBUJO: lo que se dibuja encima de cada cosa según su estado (e > 0, o e = 0 en la lámpara y el farol, que
// están encendidos al principio). Se llama con el origen en el pie del objeto y su tamaño s.
const ESTADO_DIBUJO: Readonly<Record<string, (e: number, s: number) => void>> = {
  farol: (e, s) => {
    if (e === 0) brillo(0, -s * 0.8, s * 0.32);
  },
  tele: (e, s) => {
    if (e > 0) pantalla(s, e);
  },
  cama: (e, s) => {
    if (e !== 1) return;
    // la manta, arrugada y torcida encima de la cama
    ctx.save();
    ctx.translate(s * 0.08, -s * 0.36);
    ctx.rotate(-0.12);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.3, s * 0.08, 0, 0, PI * 2);
    ctx.fillStyle = '#9B8AD9';
    ctx.fill();
    ctx.restore();
  },
  olla: (e, s) => {
    if (e !== 1) return;
    for (const dx of [-0.2, 0, 0.2]) llama(dx * s, 4, s * 0.22);
  },
  tarta: (e, s) => {
    if (e !== 1) return;
    for (const dx of [-0.18, 0, 0.18]) llama(dx * s, -s * 0.78, s * 0.12);
  },
  banera: (e, s) => {
    if (e !== 1) return;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.4, s * 0.36, s * 0.06, 0, 0, PI * 2);
    ctx.fillStyle = '#7FD3F0';
    ctx.fill();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++)
      circ(-s * 0.25 + i * s * 0.16, -s * 0.44 - Math.abs(Math.sin(T * 2 + i)) * 8, 10, '#fff', 3);
  },
  regadera: (e, s) => {
    if (e === 1) gotas(s * 0.36, -s * 0.5, 3, s * 0.4);
  },
  fuente: (e, s) => {
    if (e !== 1) return;
    gotas(-s * 0.12, -s * 1.0, 4, s * 0.5);
    gotas(s * 0.12, -s * 1.0, 4, s * 0.5);
  },
  estrellas: (e, s) => {
    if (e !== 1) return;
    for (let i = 0; i < 5; i++)
      star(
        Math.cos(i * 1.3) * s * 0.5,
        -s * 0.45 + Math.sin(i * 2.1) * s * 0.35,
        8 + 4 * Math.abs(Math.sin(T * 3 + i)),
        '#FFE08A',
        0,
      );
  },
  // el cuadro (desde la fase M3b): encima del campo con el sol de su dibujo, el mar con un barco (1) o la noche (2)
  cuadro: (e, s) => {
    if (e === 0) return;
    const u = s / 124,
      x = -43 * u,
      y = -91 * u,
      w = 86 * u,
      h = 64 * u;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    if (e === 1) {
      ctx.fillStyle = '#BFEAF7';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#3D8FD1';
      ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
      // el barco, que se mece
      ctx.save();
      ctx.translate(Math.sin(T * 1.5) * 4 * u, y + h * 0.6);
      ctx.rotate(Math.sin(T * 2) * 0.06);
      ctx.fillStyle = '#C0392B';
      ctx.beginPath();
      ctx.moveTo(-18 * u, 0);
      ctx.lineTo(18 * u, 0);
      ctx.lineTo(12 * u, 8 * u);
      ctx.lineTo(-12 * u, 8 * u);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(0, -2 * u);
      ctx.lineTo(0, -26 * u);
      ctx.lineTo(14 * u, -4 * u);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = '#2E3F7A';
      ctx.fillRect(x, y, w, h);
      circ(x + w * 0.72, y + h * 0.3, 10 * u, '#FFF3B0', 0);
      circ(x + w * 0.76, y + h * 0.26, 9 * u, '#2E3F7A', 0);
      for (let i = 0; i < 5; i++)
        star(
          x + w * (0.12 + i * 0.13),
          y + h * (0.25 + (i % 2) * 0.35),
          (3 + Math.abs(Math.sin(T * 3 + i)) * 2) * u,
          '#FFE08A',
          0,
        );
      ctx.fillStyle = '#1F2B57';
      ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
    }
    ctx.restore();
  },
  bloques: (e, s) => {
    for (let i = 0; i < e; i++) {
      ctx.fillStyle = COLORES_BLOQUES[i];
      ctx.fillRect(-s * 0.12, -s * 0.62 - (i + 1) * s * 0.17, s * 0.24, s * 0.16);
      ctx.strokeStyle = 'rgba(74,52,40,.6)';
      ctx.lineWidth = 3;
      ctx.strokeRect(-s * 0.12, -s * 0.62 - (i + 1) * s * 0.17, s * 0.24, s * 0.16);
    }
  },
};

// dibujaEstado(id, e, s): dibuja encima de la cosa id (con el origen en su pie y tamaño s) lo de su estado e, si
// tiene algo que dibujar (la lámpara no: su luz la dibuja la escena, que además oscurece la habitación).
export function dibujaEstado(id: string, e: number, s: number) {
  const f = ESTADO_DIBUJO[id];
  if (f) f(e, s);
}
