/*
 * nucleo/texturas.ts: texturas dibujadas para las superficies 2D (mejora gráfica 9 de docs/MEJORAS-GRAFICAS.md,
 * v0.2.183): la arena (granitos), la tierra (terrones y piedrecitas), la hierba (matitas), la madera (vetas y nudos) y el
 * agua (ondas). Cada una es un dibujo de 160x160 transparente que se repite (CanvasPattern) y se pinta encima del color
 * de siempre, así una superficie lisa pasa a parecer de verdad sin cambiar su color.
 * Los dibujos son fijos (un pseudoazar con semilla, no azar()): se ven igual en cada cuadro y en cada partida.
 * Exporta: el tipo TipoTextura y textura().
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements, ts-patterns/no-param-reassign -- es código
   de dibujo en un lienzo de 160x160 (se cambia el pincel g, no un dato): posiciones,
   tamaños y colores, y bucles que reparten granitos, terrones y vetas. */
import { ctx } from './pantalla.ts';
import { PI } from './utilidades.ts';

/** Las texturas que hay. */
export type TipoTextura = 'arena' | 'tierra' | 'hierba' | 'madera' | 'agua';

// LADO: el lado, en píxeles, del dibujo que se repite.
const LADO = 160;
// PATRONES: los patrones ya hechos (se hacen la primera vez que se piden).
const PATRONES: Partial<Record<TipoTextura, CanvasPattern | null>> = {};

// semilla(n): un pseudoazar fijo: devuelve una función que da números de 0 a 1, siempre los mismos para la misma n.
function semilla(n: number): () => number {
  let s = n;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// DIBUJOS: cómo se dibuja cada textura en el lienzo g de LADO x LADO (con su pseudoazar r).
const DIBUJOS: Readonly<Record<TipoTextura, (g: CanvasRenderingContext2D, r: () => number) => void>> = {
  // arena: granitos claros y oscuros y alguna conchita
  arena(g, r) {
    for (let i = 0; i < 90; i++) {
      g.fillStyle = i % 3 ? 'rgba(160,110,50,.22)' : 'rgba(255,255,255,.45)';
      g.beginPath();
      g.arc(r() * LADO, r() * LADO, 0.8 + r() * 1.8, 0, PI * 2);
      g.fill();
    }
    g.strokeStyle = 'rgba(160,110,50,.25)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(40 + r() * 80, 40 + r() * 80, 5, PI, 0);
    g.stroke();
  },
  // tierra: terrones oscuros, piedrecitas con su borde y algún granito claro
  tierra(g, r) {
    for (let i = 0; i < 26; i++) {
      g.fillStyle = 'rgba(80,45,20,.22)';
      g.beginPath();
      g.ellipse(r() * LADO, r() * LADO, 4 + r() * 7, 2 + r() * 4, r() * PI, 0, PI * 2);
      g.fill();
    }
    for (let i = 0; i < 5; i++) {
      g.fillStyle = 'rgba(190,180,165,.9)';
      g.strokeStyle = 'rgba(74,52,40,.5)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(r() * LADO, r() * LADO, 3 + r() * 4, 2 + r() * 3, r() * PI, 0, PI * 2);
      g.fill();
      g.stroke();
    }
    for (let i = 0; i < 30; i++) {
      g.fillStyle = 'rgba(255,240,210,.35)';
      g.fillRect(r() * LADO, r() * LADO, 2, 2);
    }
  },
  // hierba: matitas de tres briznas, unas más oscuras y otras más claras
  hierba(g, r) {
    g.lineCap = 'round';
    g.lineWidth = 2.5;
    for (let i = 0; i < 22; i++) {
      const x = r() * LADO,
        y = r() * LADO;
      g.strokeStyle = i % 2 ? 'rgba(40,110,40,.28)' : 'rgba(255,255,220,.35)';
      g.beginPath();
      g.moveTo(x - 5, y);
      g.lineTo(x - 7, y - 9);
      g.moveTo(x, y);
      g.lineTo(x, y - 12);
      g.moveTo(x + 5, y);
      g.lineTo(x + 7, y - 9);
      g.stroke();
    }
  },
  // madera: vetas onduladas a lo largo y un par de nudos
  madera(g, r) {
    g.strokeStyle = 'rgba(110,60,25,.18)';
    g.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = i * (LADO / 9) + r() * 6;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(LADO * 0.3, y + 6 - r() * 12, LADO * 0.7, y + 6 - r() * 12, LADO, y);
      g.stroke();
    }
    for (let i = 0; i < 2; i++) {
      g.beginPath();
      g.ellipse(20 + r() * 120, 20 + r() * 120, 8, 4, 0, 0, PI * 2);
      g.stroke();
    }
  },
  // agua: ondas blancas pequeñas
  agua(g, r) {
    g.strokeStyle = 'rgba(255,255,255,.4)';
    g.lineWidth = 3;
    g.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = r() * LADO,
        y = r() * LADO;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 9, y - 6, x + 18, y);
      g.stroke();
    }
  },
};

// patron(t): el patrón de la textura t (se dibuja una sola vez); null si el navegador no puede hacer lienzos.
function patron(t: TipoTextura): CanvasPattern | null {
  if (PATRONES[t] !== undefined) return PATRONES[t] ?? null;
  const c = document.createElement('canvas');
  c.width = LADO;
  c.height = LADO;
  const g = c.getContext('2d');
  if (g) DIBUJOS[t](g, semilla(t.length * 977 + t.charCodeAt(0)));
  PATRONES[t] = g ? ctx.createPattern(c, 'repeat') : null;
  return PATRONES[t] ?? null;
}

// textura(t, x, y, w, h, alfa): pinta la textura t encima del rectángulo (x, y, w, h), con la opacidad alfa (1 por
// defecto). Si se quiere solo dentro de una forma, se recorta antes (ctx.clip) y se pinta el rectángulo que la cubre.
export function textura(t: TipoTextura, x: number, y: number, w: number, h: number, alfa = 1): void {
  const p = patron(t);
  if (!p) return;
  ctx.save();
  ctx.globalAlpha *= alfa;
  ctx.fillStyle = p;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
