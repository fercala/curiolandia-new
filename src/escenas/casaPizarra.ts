/*
 * escenas/casaPizarra.ts: «Mi pizarra» (fase C4 de docs/PLAN-CASA.md), la escena SCENES.casaPizarra. Se abre cuando
 * Tito acaba de dibujar en la pizarra de su casa (REACCIONES en dominio/casa.ts: escena 'pizarra'). Una pizarra verde
 * grande donde se pinta con el dedo, con tizas de colores abajo (blanca, amarilla, rosa, azul y verde; si Tito tiene las
 * pinturas, también roja, naranja y morada) y el borrador, que lo borra todo. Lo dibujado no se guarda. Tito anima de
 * vez en cuando, sin juzgar el dibujo. La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: PIZARRA (el rectángulo de la pizarra y dónde están las tizas y el borrador) y pone SCENES.casaPizarra.
 * Importa: el núcleo (dibujo, voz, sonido, toque).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  S,
  SCENES,
  SFX,
  atHome,
  card,
  ctx,
  dist,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  later,
  noise,
  pick,
  say,
  sayQ,
  sparkles,
} from '../nucleo/indice.ts';

// PIZARRA: el rectángulo donde se pinta (x, y de arriba a la izquierda, ancho w y alto h), la fila de tizas (y, desde
// x0 cada dx) y el borrador. TIZAS: los colores de siempre; MAS_TIZAS: los que se añaden con las pinturas.
export const PIZARRA = {
  x: 220,
  y: 60,
  w: 1300,
  h: 660,
  tizas: { y: 800, x0: 330, dx: 120 },
  borrador: { x: 1380, y: 800 },
};
const TIZAS = ['#FFFFFF', '#FFE08A', '#F58BB4', '#7FD3F0', '#9BE07A'],
  MAS_TIZAS = ['#FF6B5E', '#FFA94D', '#B79CF0'];
// ANIMA: cada cuántos trazos anima Tito.
const ANIMA = 6;

/** Un trazo: su color y sus puntos. */
interface Trazo {
  readonly c: string;
  readonly p: [number, number][];
}

// dentro(x, y): ¿el punto está dentro de la pizarra?
const dentro = (x: number, y: number): boolean =>
  x > PIZARRA.x + 20 && x < PIZARRA.x + PIZARRA.w - 20 && y > PIZARRA.y + 20 && y < PIZARRA.y + PIZARRA.h - 20;

// drawTrazo(t): un trazo de tiza, grueso y redondeado.
function drawTrazo(t: Trazo): void {
  if (!t.p.length) return;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = t.c;
  ctx.beginPath();
  ctx.moveTo(t.p[0][0], t.p[0][1]);
  t.p.forEach(([x, y]) => ctx.lineTo(x, y + (t.p.length === 1 ? 0.1 : 0)));
  ctx.stroke();
}

// MI PIZARRA: estado: trazos (lo pintado), tiza (el color elegido), pinta (si el dedo está pintando) y colores (las
// tizas que hay).
SCENES.casaPizarra = {
  music: null,
  // enter(): pizarra limpia, tiza blanca; con las pinturas de la tienda, más colores.
  enter() {
    this.trazos = [];
    this.tiza = TIZAS[0];
    this.pinta = false;
    this.colores = S.owned?.['pinturas'] ? [...TIZAS, ...MAS_TIZAS] : TIZAS;
    later(400, () => sayQ('¡Dibuja lo que quieras con el dedo! Abajo puedes cambiar de color.'));
  },
  // prompt(): qué hacer.
  prompt() {
    say('Dibuja con el dedo en la pizarra. Abajo están las tizas y el borrador.');
  },
  // draw(): la pared, la pizarra con su marco, los trazos, las tizas (la elegida, más grande), el borrador, Tito y la casa.
  draw() {
    ctx.fillStyle = '#F4E3C8';
    ctx.fillRect(0, 0, 1600, 900);
    card(PIZARRA.x - 24, PIZARRA.y - 24, PIZARRA.w + 48, PIZARRA.h + 48, '#B07A4F', 6, 24);
    card(PIZARRA.x, PIZARRA.y, PIZARRA.w, PIZARRA.h, '#2F5D46', 4, 10);
    ctx.save();
    ctx.beginPath();
    ctx.rect(PIZARRA.x, PIZARRA.y, PIZARRA.w, PIZARRA.h);
    ctx.clip();
    (this.trazos as Trazo[]).forEach(drawTrazo);
    ctx.restore();
    (this.colores as string[]).forEach((c, i) => {
      const x = PIZARRA.tizas.x0 + i * PIZARRA.tizas.dx,
        on = c === this.tiza,
        s = (on ? 1.2 : 1) * hv('t' + i, hC(x, PIZARRA.tizas.y, 44));
      ctx.save();
      ctx.translate(x, PIZARRA.tizas.y);
      ctx.scale(s, s);
      ctx.rotate(-0.3);
      card(-40, -16, 80, 32, c, 4, 10);
      ctx.restore();
    });
    {
      const b = PIZARRA.borrador,
        s = hv('borra', hC(b.x, b.y, 60));
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(s, s);
      card(-70, -34, 140, 68, '#5B8DEF', 5, 12);
      card(-70, 6, 140, 28, '#EDE3D0', 4, 8);
      ctx.restore();
    }
    drawTito(20, 700, 190);
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; una tiza cambia el color; el borrador lo borra todo; en la pizarra
  // empieza un trazo.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const t = (this.colores as string[]).findIndex(
      (_c, i) => dist(x, y, PIZARRA.tizas.x0 + i * PIZARRA.tizas.dx, PIZARRA.tizas.y) < 50,
    );
    if (t >= 0) {
      SFX.pop();
      this.tiza = (this.colores as string[])[t];
      return;
    }
    if (dist(x, y, PIZARRA.borrador.x, PIZARRA.borrador.y) < 75) {
      if ((this.trazos as Trazo[]).length) {
        noise(0.5, 0.25, 900);
        sparkles(800, 400, 10);
        this.trazos = [];
        say('¡Pizarra limpia! A dibujar otra vez.');
      }
      return;
    }
    if (!dentro(x, y)) return;
    this.pinta = true;
    (this.trazos as Trazo[]).push({ c: this.tiza, p: [[x, y]] });
    noise(0.05, 0.08, 2500);
  },
  // move(x, y): con el dedo pintando, el trazo sigue al dedo (dentro de la pizarra).
  move(x: number, y: number) {
    if (!this.pinta || !dentro(x, y)) return;
    const tr = this.trazos as Trazo[],
      t = tr[tr.length - 1],
      [lx, ly] = t.p[t.p.length - 1];
    if (dist(x, y, lx, ly) > 4) t.p.push([x, y]);
  },
  // up(): termina el trazo; cada ANIMA trazos, Tito anima.
  up() {
    if (!this.pinta) return;
    this.pinta = false;
    const n = (this.trazos as Trazo[]).length;
    if (n % ANIMA === 0)
      say(pick(['¡Qué bonito!', '¡Me encanta tu dibujo!', '¡Qué colores tan alegres!', '¡Sigue, sigue!']));
  },
};
