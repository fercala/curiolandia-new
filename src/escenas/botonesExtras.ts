// Botones de las actividades nuevas: dibujan y comprueban el mismo rectángulo.
import { card, hR, text } from '../nucleo/indice.ts';

interface RectExtra {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

// botonExtra(r, titulo): dibuja el botón traducible dentro del rectángulo r.
export function botonExtra(r: RectExtra, titulo: string): void {
  hR(r.x, r.y, r.w, r.h);
  card(r.x, r.y, r.w, r.h, '#FFF1B2', 4, 24);
  text(titulo, r.x + r.w / 2, r.y + r.h * 0.7, 38, '#293C31', { max: r.w - 28 });
}

// tocaExtra(r, x, y): devuelve si el toque está dentro del rectángulo r.
export const tocaExtra = (r: RectExtra, x: number, y: number): boolean =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
