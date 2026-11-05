// juegos/caras.ts: las caritas de las emociones (fase 4o de docs/PLAN-MIGRACION.md): EMO (color y nombre de cada
// emoción) y drawFace, que dibuja la carita. Las usan la asamblea (escenas/escenas2d.ts: «¿cómo te sentís hoy?»), los
// componentes de juego (juegos/comps.ts y comps2.ts: canciones y cuentos) y los temas de las emociones (temas/temas4.ts
// y temas/ingles.ts). Hasta la fase 4o estaban en escenas/escenas2d.ts, que se carga después de todos ellos, y los
// demás las usaban como globales tardías (src/tardias.d.ts).
// Exporta: EMO y drawFace. Importa: del núcleo, src/nucleo/, ctx, PI y el dibujo básico (circ, ell,
// fillStroke), y K de los dibujos.
import { K } from '../dibujos/todos.ts';
import { PI, circ, ctx, ell, fillStroke } from '../nucleo/indice.ts';

// EMO: emociones de la asamblea. {clave: {c: color de la carita, n: nombre}}.
export const EMO: Record<string, { c: string; n: string }> = {
  alegria: { c: '#FFD66B', n: 'alegría' },
  tristeza: { c: '#7FB0FF', n: 'tristeza' },
  enojo: { c: '#FF6B5E', n: 'enfado' },
  miedo: { c: '#9B8AD9', n: 'miedo' },
  sorpresa: { c: '#FFA94D', n: 'sorpresa' },
  calma: { c: '#7CC86E', n: 'calma' },
  verguenza: { c: '#F58BB4', n: 'vergüenza' },
};
// drawFace(x, y, r, m): dibuja la carita de la emoción m (clave de EMO) de radio r en (x, y). Solo dibuja.
export function drawFace(x: number, y: number, r: number, m: string) {
  const e = EMO[m];
  ctx.save();
  ctx.translate(x, y);
  circ(0, 0, r, e.c, 6);
  const ey = -r * 0.12,
    ex = r * 0.34,
    L = r * 0.07;
  ctx.lineCap = 'round';
  ctx.lineWidth = L;
  ctx.strokeStyle = K;
  // eyes(rr): dos ojos de radio rr con brillo blanco.
  const eyes = (rr: number) => {
    circ(-ex, ey, rr, K, 0);
    circ(ex, ey, rr, K, 0);
    circ(-ex + rr * 0.35, ey - rr * 0.35, rr * 0.35, '#fff', 0);
    circ(ex + rr * 0.35, ey - rr * 0.35, rr * 0.35, '#fff', 0);
  };
  // mouth(a, b, c): boca curva; a y c = altura de las comisuras, b = altura del centro (en fracciones de r).
  const mouth = (a: number, b: number, c: number) => {
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, r * a);
    ctx.quadraticCurveTo(0, r * b, r * 0.32, r * c);
    ctx.stroke();
  };
  if (m === 'alegria') {
    eyes(r * 0.1);
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, r * 0.2);
    ctx.quadraticCurveTo(0, r * 0.75, r * 0.4, r * 0.2);
    ctx.closePath();
    fillStroke('#C0473C', L);
  }
  if (m === 'tristeza') {
    eyes(r * 0.09);
    mouth(0.48, 0.2, 0.48);
    ell(-ex - r * 0.06, ey + r * 0.22, r * 0.06, r * 0.1, '#5BB8E6', 0);
  }
  if (m === 'enojo') {
    eyes(r * 0.09);
    ctx.beginPath();
    ctx.moveTo(-ex - r * 0.18, ey - r * 0.26);
    ctx.lineTo(-ex + r * 0.14, ey - r * 0.12);
    ctx.moveTo(ex + r * 0.18, ey - r * 0.26);
    ctx.lineTo(ex - r * 0.14, ey - r * 0.12);
    ctx.stroke();
    mouth(0.5, 0.28, 0.5);
  }
  if (m === 'miedo') {
    circ(-ex, ey, r * 0.16, '#fff', L * 0.6);
    circ(ex, ey, r * 0.16, '#fff', L * 0.6);
    circ(-ex, ey, r * 0.07, K, 0);
    circ(ex, ey, r * 0.07, K, 0);
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.42);
    for (let i = 1; i <= 6; i++) ctx.lineTo(-r * 0.3 + i * r * 0.1, r * 0.42 + (i % 2 ? -1 : 1) * r * 0.06);
    ctx.stroke();
  }
  if (m === 'sorpresa') {
    eyes(r * 0.11);
    ctx.beginPath();
    ctx.arc(-ex, ey - r * 0.24, r * 0.14, PI * 1.15, PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey - r * 0.24, r * 0.14, PI * 1.15, PI * 1.85);
    ctx.stroke();
    ell(0, r * 0.4, r * 0.13, r * 0.17, '#C0473C', L);
  }
  if (m === 'calma') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * ex, ey, r * 0.1, PI * 0.1, PI * 0.9);
      ctx.stroke();
    }
    mouth(0.3, 0.5, 0.3);
  }
  if (m === 'verguenza') {
    eyes(r * 0.08);
    circ(-r * 0.5, r * 0.18, r * 0.13, '#FF5A8A', 0);
    circ(r * 0.5, r * 0.18, r * 0.13, '#FF5A8A', 0);
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, r * 0.42);
    ctx.quadraticCurveTo(0, r * 0.5, r * 0.16, r * 0.42);
    ctx.stroke();
  }
  ctx.restore();
}
