/*
 * escenas/casaBano.ts: «El baño» (fase C5 de docs/PLAN-CASA.md), la escena SCENES.casaBano. Se abre cuando Tito acaba
 * de meterse en la bañera de su casa (REACCIONES en dominio/casa.ts: escena 'bano'). Tito está en la bañera; suben
 * burbujas que se explotan al tocarlas (y se cuentan); con el jabón (si Tito lo tiene, o una pastilla de la bañera),
 * al tocar a Tito le sale espuma; el patito de goma flota si Tito lo tiene; y la toalla (si la tiene) lo seca al final:
 * «¡Ya estoy limpito!». Sin fallos ni tiempo. La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: BANO (la bañera, Tito y los botones) y pone SCENES.casaBano.
 * Importa: el núcleo (dibujo, voz, sonido, toque) y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { PI, S, SCENES, SFX, T, atHome, burst, card, circ, ctx, dist, drawHome, drawTito, go, hC, hv, later, pic, rnd, say, sayQ, sparkles } from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';

// BANO: la bañera (centro x, borde de arriba y, ancho w), dónde está Tito, el jabón y la toalla. ESPUMA: cuánta espuma
// hace falta (toques) para que esté enjabonado.
export const BANO = { x: 760, y: 520, w: 900, tito: { x: 760, y: 470 }, jabon: { x: 1390, y: 300 }, toalla: { x: 1390, y: 560 } };
const ESPUMA = 6;

/** Una burbuja: dónde está, su tamaño y cuándo salió. */
interface Burbuja { x: number; y: number; r: number; t0: number }

// EL BAÑO: estado: burbujas (las que suben), explotadas (cuántas), jabon (si el jabón está cogido), espuma (manchas de
// espuma [x, y] sobre Tito) y seco (si ya se secó).
SCENES.casaBano = { music: null,
  // enter(): Tito en el agua, sin espuma.
  enter() { this.burbujas = []; this.explotadas = 0; this.jabon = false; this.espuma = []; this.seco = false; later(400, () => sayQ('¡Al agua! Explota las burbujas. Con el jabón, me lavas.')); },
  // prompt(): qué hacer.
  prompt() { say(this.jabon ? 'Toca a Tito para enjabonarlo.' : 'Explota las burbujas, o coge el jabón y lávame.'); },
  // draw(): el baño de azulejos, la bañera con agua, Tito con su espuma, las burbujas que suben, el patito, el jabón,
  // la toalla y la casa.
  draw() {
    ctx.fillStyle = '#DDF3FB'; ctx.fillRect(0, 0, 1600, 900); ctx.fillStyle = '#BFE6F5'; ctx.fillRect(0, 700, 1600, 200);
    const b = BANO, tt = b.tito;
    drawTito(tt.x - 160, tt.y - 230 + Math.sin(T * 2) * 6, 320, { sq: this.seco ? 0 : 0.05 });
    (this.espuma as [number, number][]).forEach(([x, y], i) => { circ(x, y + Math.sin(T * 3 + i) * 3, 34, '#FFFFFF', 3, '#CFE8F5'); circ(x + 22, y - 14, 20, '#FFFFFF', 0); });
    ctx.save(); ctx.beginPath(); ctx.ellipse(b.x, b.y, b.w / 2, 60, 0, 0, PI * 2); ctx.fillStyle = '#7FD3F0'; ctx.fill(); ctx.restore();
    card(b.x - b.w / 2, b.y, b.w, 220, '#FFFFFF', 6, 80);
    card(b.x - b.w / 2 + 60, b.y + 210, 40, 50, '#C9CED8', 4, 8); card(b.x + b.w / 2 - 100, b.y + 210, 40, 50, '#C9CED8', 4, 8);
    if (S.owned?.['pato']) pic('pato', b.x + 260 + Math.sin(T) * 40, b.y - 30 + Math.sin(T * 2) * 6, 110);
    if (azar() < 0.05) (this.burbujas as Burbuja[]).push({ x: rnd(b.x - 380, b.x + 380), y: b.y - 20, r: rnd(26, 46), t0: T });
    this.burbujas = (this.burbujas as Burbuja[]).filter((u) => T - u.t0 < 7);
    (this.burbujas as Burbuja[]).forEach((u) => { const y = u.y - (T - u.t0) * 80, x = u.x + Math.sin((T - u.t0) * 2) * 20; ctx.globalAlpha = 0.75; circ(x, y, u.r, 'rgba(255,255,255,.35)', 4, '#9BD3EE'); circ(x - u.r * 0.35, y - u.r * 0.35, u.r * 0.2, '#FFFFFF', 0); ctx.globalAlpha = 1; });
    { const j = b.jabon, s = this.jabon ? 1.15 : hv('jabon', hC(j.x, j.y, 70)); ctx.save(); ctx.translate(j.x, j.y); ctx.scale(s, s); circ(0, 0, 76, this.jabon ? '#FFE08A' : '#FFFFFF', 5); if (S.owned?.['jabon']) pic('jabon', 0, 0, 110); else card(-50, -30, 100, 60, '#F58BB4', 5, 24); ctx.restore(); }
    if (S.owned?.['toalla']) { const t = b.toalla, s = hv('toalla', hC(t.x, t.y, 70)); ctx.save(); ctx.translate(t.x, t.y); ctx.scale(s, s); circ(0, 0, 76, '#FFFFFF', 5); pic('toalla', 0, 0, 110); ctx.restore(); }
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; una burbuja explota (y se cuenta); el jabón se coge o se deja; con el
  // jabón, tocar a Tito le pone espuma (con ESPUMA manchas, Tito lo dice); la toalla lo seca (quita la espuma).
  down(x: number, y: number) {
    if (atHome(x, y)) { SFX.tap(); go('casaTito', { volver: 1 }); return; }
    const bs = this.burbujas as Burbuja[], i = bs.findIndex((u) => dist(x, y, u.x + Math.sin((T - u.t0) * 2) * 20, u.y - (T - u.t0) * 80) < u.r + 14);
    if (i >= 0) {
      SFX.pop(); sparkles(x, y, 4); bs.splice(i, 1); this.explotadas++;
      if (this.explotadas % 10 === 0) say('¡Ya has explotado ' + this.explotadas + ' burbujas!');
      return;
    }
    if (dist(x, y, BANO.jabon.x, BANO.jabon.y) < 80) { SFX.pop(); this.jabon = !this.jabon; return; }
    if (S.owned?.['toalla'] && dist(x, y, BANO.toalla.x, BANO.toalla.y) < 80) {
      if (!(this.espuma as unknown[]).length) { say('¡Primero hay que enjabonarme!'); return; }
      SFX.whoosh(); this.espuma = []; this.seco = true; this.jabon = false; burst(BANO.tito.x, BANO.tito.y - 100, 30); say('¡Ya estoy limpito y sequito! ¡Gracias!'); return;
    }
    if (this.jabon && dist(x, y, BANO.tito.x, BANO.tito.y - 100) < 190) {
      SFX.splash(); (this.espuma as [number, number][]).push([x, y]); this.seco = false; sparkles(x, y, 3);
      if ((this.espuma as unknown[]).length === ESPUMA) say(S.owned?.['toalla'] ? '¡Cuánta espuma! Ahora sécame con la toalla.' : '¡Cuánta espuma! ¡Qué limpito estoy!');
    }
  },
};
