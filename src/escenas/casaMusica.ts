/*
 * escenas/casaMusica.ts: «Los instrumentos» (fase C4 de docs/PLAN-CASA.md), la escena SCENES.casaMusica. Se abre
 * cuando Tito acaba de tocar el piano, el xilófono, la guitarra o el tambor de su casa (REACCIONES en dominio/casa.ts:
 * escena 'instrumentos'). Arriba, un botón por cada instrumento que tiene Tito (se empieza por el que se tocó); en el
 * centro, el instrumento en grande para tocarlo con el dedo: 8 teclas en el piano y en el xilófono (do a do), 6 cuerdas
 * en la guitarra y 2 tambores. Reto opcional y sin fallos, «¡Repite la canción!» (el botón de la nota): Tito toca unas
 * notas que se iluminan y el niño las repite; si acierta, la siguiente es una nota más larga (de 3 a 5), y si se
 * equivoca, Tito la vuelve a tocar. La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: INSTRUMENTOS (los instrumentos y dónde están sus teclas) y pone SCENES.casaMusica.
 * Importa: el núcleo (dibujo, voz, sonido, toque), NOTE de juegos/ y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, notas y tiempos en la pantalla de 1600x900, como
   en el resto de las escenas. */
import { K } from '../dibujos/todos.ts';
import { S, SCENES, SFX, T, atHome, burst, card, circ, ctx, dist, drawHome, drawTito, go, hC, hv, later, noise, pic, say, sayQ, sparkles, text, tone } from '../nucleo/indice.ts';
import { NOTE } from '../juegos/indice.ts';
import { azar } from '../aplicacion/puertos.ts';

/** Una tecla (o cuerda o tambor): su rectángulo (centro x, y, ancho w, alto h), su color y su nota MIDI. */
interface Tecla { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly c: string; readonly n: number }

// ESCALA: do re mi fa sol la si do (notas MIDI desde el do central). COLORES: un color por nota, como en el xilófono.
const ESCALA = [60, 62, 64, 65, 67, 69, 71, 72];
const COLORES = ['#FF6B5E', '#FFA94D', '#FFD66B', '#7CC86E', '#5BB8E6', '#5B8DEF', '#9B8AD9', '#F58BB4'];

// INSTRUMENTOS: los cuatro instrumentos (id de la tienda) con sus teclas. Piano: 8 teclas blancas con una franja de
// color; xilófono: 8 láminas de colores, de larga a corta; guitarra: 6 cuerdas; tambor: un tambor grande y uno pequeño.
export const INSTRUMENTOS: Readonly<Record<string, readonly Tecla[]>> = {
  piano: ESCALA.map((n, i) => ({ x: 380 + i * 120, y: 560, w: 112, h: 380, c: COLORES[i], n })),
  xilofono: ESCALA.map((n, i) => ({ x: 380 + i * 120, y: 560, w: 96, h: 360 - i * 22, c: COLORES[i], n })),
  guitarra: [52, 57, 62, 67, 71, 76].map((n, i) => ({ x: 940, y: 380 + i * 64, w: 1080, h: 56, c: '#C9A56A', n })),
  tambor: [{ x: 620, y: 600, w: 300, h: 300, c: '#FF6B5E', n: 0 }, { x: 1000, y: 620, w: 220, h: 220, c: '#5BB8E6', n: 1 }],
};
// ORDEN: el orden de los botones de arriba. BOTONES: su altura y su separación. JUEGO: el botón del reto.
const ORDEN = ['piano', 'xilofono', 'guitarra', 'tambor'], BOTONES = { y: 120, dx: 150, x0: 575 }, JUEGO = { x: 1430, y: 120, r: 60 };

// suena(inst, i): toca la tecla i del instrumento inst: el piano, con onda triangular; el xilófono, una campanita; la
// guitarra, una cuerda pulsada (dos ondas que se apagan); el tambor, un golpe (ruido grave o agudo).
function suena(inst: string, i: number): void {
  const t = INSTRUMENTOS[inst][i];
  if (inst === 'tambor') { noise(0.18, 0.6, t.n ? 400 : 140); tone(t.n ? 180 : 90, 0.2, 'sine', 0.5, -0.5); return; }
  if (inst === 'xilofono') { tone(NOTE(t.n + 12), 0.6, 'sine', 0.4); tone(NOTE(t.n + 24), 0.2, 'sine', 0.1); return; }
  if (inst === 'guitarra') { tone(NOTE(t.n), 0.9, 'triangle', 0.3); tone(NOTE(t.n + 12), 0.5, 'sawtooth', 0.04); return; }
  tone(NOTE(t.n), 0.5, 'triangle', 0.35); tone(NOTE(t.n - 12), 0.4, 'sine', 0.12);
}

// teclaEn(inst, x, y): el número de la tecla del instrumento inst que hay en (x, y), o -1.
function teclaEn(inst: string, x: number, y: number): number {
  return INSTRUMENTOS[inst].findIndex((t) => inst === 'tambor' ? dist(x, y, t.x, t.y) < t.w / 2 : Math.abs(x - t.x) < t.w / 2 && Math.abs(y - t.y) < t.h / 2);
}

// drawInstrumento(inst, luz): dibuja el instrumento inst; luz[i] es la hora T a la que se tocó la tecla i (brilla un
// momento después).
function drawInstrumento(inst: string, luz: readonly number[]): void {
  const teclas = INSTRUMENTOS[inst];
  if (inst === 'guitarra') {
    ctx.save(); ctx.beginPath(); ctx.ellipse(420, 540, 260, 230, 0, 0, Math.PI * 2); ctx.fillStyle = '#E8A55A'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = K; ctx.stroke(); ctx.restore();
    circ(520, 540, 90, '#5A3B20', 5); card(700, 340, 800, 400, '#B07A4F', 6, 20);
  }
  teclas.forEach((t, i) => {
    const b = Math.max(0, 1 - (T - (luz[i] ?? -9)) * 3);
    if (inst === 'tambor') {
      circ(t.x, t.y + 40, t.w / 2, t.c, 6); circ(t.x, t.y, t.w / 2, '#FFF6E6', 6); if (b) { ctx.globalAlpha = b; circ(t.x, t.y, t.w / 2, '#FFE08A', 0); ctx.globalAlpha = 1; }
      return;
    }
    if (inst === 'guitarra') { ctx.lineWidth = 4 + i; ctx.strokeStyle = b ? '#FFE08A' : '#EDE3D0'; ctx.beginPath(); ctx.moveTo(400, t.y + Math.sin(T * 60) * 6 * b); ctx.lineTo(1480, t.y); ctx.stroke(); return; }
    const top = t.y - t.h / 2 + (b ? 6 : 0);
    if (inst === 'piano') { card(t.x - t.w / 2, top, t.w, t.h, b ? '#FFF3B0' : '#FFFFFF', 5, 14); card(t.x - t.w / 2 + 10, top + t.h - 60, t.w - 20, 44, t.c, 0, 10); }
    else { card(t.x - t.w / 2, top, t.w, t.h, t.c, 5, 16); circ(t.x, top + 26, 9, '#FFF6E6', 3); circ(t.x, top + t.h - 26, 9, '#FFF6E6', 3); if (b) { ctx.globalAlpha = b * 0.6; card(t.x - t.w / 2, top, t.w, t.h, '#FFFFFF', 0, 16); ctx.globalAlpha = 1; } }
  });
}

// cancion(n, inst): una canción al azar de n notas (números de tecla) del instrumento inst, sin repetir la misma tecla
// dos veces seguidas.
function cancion(n: number, inst: string): number[] {
  const k = INSTRUMENTOS[inst].length;
  const otra = (prev: number): number => { const m = Math.floor(azar() * (k - 1)); return m >= prev ? m + 1 : m; };
  return Array.from({ length: n }).reduce<number[]>((a) => [...a, a.length ? otra(a[a.length - 1]) : Math.floor(azar() * k)], []);
}

// LOS INSTRUMENTOS: estado: tiene (los instrumentos de Tito, en ORDEN), inst (el que se ve), luz (cuándo se tocó cada
// tecla) y el reto: seq (la canción, o null), pos (cuántas notas lleva el niño), oye (Tito la está tocando) y largo
// (notas de la siguiente canción, de 3 a 5).
SCENES.casaMusica = { music: null,
  // enter(o): o.inst es el instrumento que se tocó; si no lo tiene (o no viene), el primero que tenga, o el piano.
  enter(o) {
    const tiene = ORDEN.filter((id) => S.owned?.[id]); this.tiene = tiene.length ? tiene : ['piano'];
    this.inst = (this.tiene as string[]).includes(o.inst) ? o.inst : (this.tiene as string[])[0];
    this.luz = []; this.seq = null; this.pos = 0; this.oye = false; this.largo = 3;
    later(400, () => sayQ('¡Vamos a tocar música! Toca las teclas. Si quieres jugar, toca la nota de arriba.'));
  },
  // prompt(): qué hacer: en el reto, repetir; si no, tocar.
  prompt() { say(this.seq ? 'Repite la canción: toca las mismas notas.' : '¡Toca las teclas! Si quieres jugar, toca la nota de arriba.'); },
  // tocar(i): toca la tecla i y la ilumina.
  tocar(i: number) { suena(this.inst, i); (this.luz as number[])[i] = T; const t = INSTRUMENTOS[this.inst][i]; sparkles(t.x, t.y - 80, 3); },
  // escucha(): Tito toca la canción del reto, una nota cada 0,6 s, y después le toca al niño.
  escucha() {
    this.oye = true; this.pos = 0; const seq = this.seq as number[];
    seq.forEach((i, j) => later(700 + j * 600, () => { if (this.seq === seq) this.tocar!(i); }));
    later(700 + seq.length * 600, () => { if (this.seq === seq) this.oye = false; });
  },
  // draw(): el fondo, los botones de los instrumentos (el que se ve en amarillo), el del reto, el instrumento, Tito y la casa.
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#FFE9D6'); g.addColorStop(1, '#F7D1B5'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1600, 900);
    (this.tiene as string[]).forEach((id, i) => {
      const x = BOTONES.x0 + i * BOTONES.dx, on = id === this.inst, s = on ? 1 : hv('i:' + id, hC(x, BOTONES.y, 56));
      ctx.save(); ctx.translate(x, BOTONES.y); ctx.scale(s, s); circ(0, 0, 56, on ? '#FFE08A' : '#fff', on ? 7 : 5, on ? '#D9962A' : K); pic(id, 0, 0, 84); ctx.restore();
    });
    { const s = hv('juego', hC(JUEGO.x, JUEGO.y, JUEGO.r)); ctx.save(); ctx.translate(JUEGO.x, JUEGO.y); ctx.scale(s, s); circ(0, 0, JUEGO.r, this.seq ? '#FFE08A' : '#fff', 6); text('♪', 0, 26, 76, '#9B8AD9', { w: 700 }); ctx.restore(); }
    drawInstrumento(this.inst, this.luz as number[]);
    if (this.seq) text(this.oye ? '¡Escucha!' : '¡Ahora tú!', 800, 230, 48, K, { w: 600 });
    drawTito(20, 680, 200); drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; un botón de arriba cambia de instrumento (y deja el reto); el de la
  // nota empieza el reto; una tecla suena y, en el reto, se compara con la canción: bien → sigue; toda bien → ¡bravo! y
  // la siguiente, más larga; mal → Tito la vuelve a tocar (sin fallos ni castigo).
  down(x: number, y: number) {
    if (atHome(x, y)) { SFX.tap(); go('casaTito', { volver: 1 }); return; }
    const b = (this.tiene as string[]).findIndex((_id, i) => dist(x, y, BOTONES.x0 + i * BOTONES.dx, BOTONES.y) < 58);
    if (b >= 0) { SFX.pop(); this.inst = (this.tiene as string[])[b]; this.seq = null; this.luz = []; return; }
    if (dist(x, y, JUEGO.x, JUEGO.y) < JUEGO.r) { SFX.pop(); this.seq = cancion(this.largo, this.inst); say('¡Escucha y repite la canción!', () => this.escucha!()); return; }
    const i = teclaEn(this.inst, x, y);
    if (i < 0 || this.oye) return;
    this.tocar!(i);
    const seq = this.seq as number[] | null;
    if (!seq) return;
    if (seq[this.pos] !== i) { this.oye = true; say('¡Casi! Escucha otra vez.', () => this.escucha!()); return; }
    this.pos++;
    if (this.pos < seq.length) return;
    SFX.tada(); burst(800, 400, 40); this.largo = Math.min(5, this.largo + 1); this.seq = null;
    say(this.largo === 5 && seq.length === 5 ? '¡Bravo! ¡Qué bien tocas!' : '¡Bravo! ¡Lo has tocado igual!');
  },
};
