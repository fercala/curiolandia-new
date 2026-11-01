/*
 * juegos/lectura.ts: los componentes nuevos de la Isla de las Letras (fase L3 de docs/PLAN-LECTURA.md), con la misma
 * interfaz que los de juegos/comps.ts (léela allí): Nombre(cfg, onDone) devuelve un Juego con total, done, enter, draw,
 * down/move/up, prompt y hint; informa con rec(), onRight(), this.done++ y scene.starPop = T, y llama a onDone() al
 * terminar.
 * COMPONENTES: Palmas (dar una palmada en el tambor por cada sílaba de una palabra), Pizarra (pintar libre con el dedo
 * sobre una letra grande en gris) y MiNombre (el nombre del niño en letras grandes: se tocan una a una y suenan).
 * Exporta además nombreDeLetra (cómo se dice cualquier letra: 'la be', 'la hache'...).
 * Importa: los tipos de juegos/tipos.ts, el núcleo (dibujo, voz, sonido, premios) y thing y nameT de juegos/comps.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900 y tiempos de las
   animaciones, como en el resto de componentes. */
import type { AlTerminar, Config, Cosa, Juego, Libre } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { LF, SFX, T, back, burst, cap, card, circ, clamp, ctx, dist, ell, later, onRight, praise, rec, say, sayQ, scene, sparkles, text, tone } from '../nucleo/indice.ts';
import { NUM, nameT, thing } from './comps.ts';

// NOMBRES: cómo se dice cada letra (sin tilde ni diéresis: quien llama las quita con sinTilde).
const NOMBRES: Readonly<Record<string, string>> = {
  A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'efe', G: 'ge', H: 'hache', I: 'i', J: 'jota', K: 'ka', L: 'ele', M: 'eme',
  N: 'ene', Ñ: 'eñe', O: 'o', P: 'pe', Q: 'cu', R: 'erre', S: 'ese', T: 'te', U: 'u', V: 'uve', W: 'uve doble', X: 'equis',
  Y: 'i griega', Z: 'zeta',
};
// sinTilde(l): la letra mayúscula l sin tilde ni diéresis (Á -> A, Ü -> U); la Ñ se queda como está.
const sinTilde = (l: string): string => (l === 'Ñ' ? l : l.normalize('NFD').replace(/[̀-ͯ]/g, ''));
// nombreDeLetra(l): cómo se dice la letra l con su artículo ('la be'); si no es una letra, ella misma.
export function nombreDeLetra(l: string): string {
  const n = NOMBRES[sinTilde(l.toUpperCase())];
  return n ? `la ${n}` : l;
}

/* ---------- Palmas: una palmada por sílaba ---------- */
// TAMBOR: dónde está el tambor de las palmas (centro y radio).
const TAMBOR = { x: 900, y: 735, r: 95 };
// drawTambor(x, y, r, golpe): el tambor; golpe = instante del último toque (la piel se hunde y sale un aro).
function drawTambor(x: number, y: number, r: number, golpe: number): void {
  const k = clamp((T - golpe) * 4, 0, 1), h = (1 - k) * 8;
  ctx.save(); ctx.translate(x, y);
  card(-r, -r * .2, r * 2, r * .9, '#E8554E', 7, 18);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-r + 10 + i * r * .45, -r * .15); ctx.lineTo(-r + 10 + i * r * .45 + r * .22, r * .65); ctx.lineWidth = 5; ctx.strokeStyle = '#FFC93C'; ctx.stroke(); }
  ell(0, -r * .2 + h, r, r * .32, '#FFF3D6', 7);
  if (k < 1) { ctx.globalAlpha = 1 - k; ell(0, -r * .2, r * (1 + k * .5), r * .32 * (1 + k * .5), null, 6, '#FFC93C'); ctx.globalAlpha = 1; }
  ctx.restore();
}
// COMPONENTE Palmas: sale un dibujo y, debajo, un hueco por sílaba; cada toque en el tambor da una palmada, enciende la
// sílaba siguiente y Tito la dice. Al completar la palabra, una estrella y Tito cuenta las palmas. No hay fallos: es
// para aprender a partir las palabras (3 años).
// cfg: words ([{k: dibujo, syl: ['a', 'be', 'ja']}]: las rondas, en orden), bg, key (para rec), intro (consigna de la
// primera ronda).
export function Palmas(cfg: Config, onDone: AlTerminar): Juego {
  const W: Array<{ k: Cosa; syl: string[] }> = cfg.words;
  return { total: W.length, done: 0, i: 0, n: 0, golpe: -9, busy: false, t0: 0,
    // Empieza la primera ronda.
    enter() { this.ronda(true); },
    // Prepara la ronda this.i: ninguna sílaba encendida y la consigna (la larga, solo la primera vez).
    ronda(primera?: boolean) { this.w = W[this.i]; this.n = 0; this.busy = false; this.t0 = T;
      const nom = nameT(this.w.k);
      later(350, () => sayQ(primera ? `${cfg.intro || 'Vamos a dar palmas.'} ${cap(nom)}. Toca el tambor una vez por cada trozo.` : `Ahora: ${nom}. Toca el tambor.`)); },
    // Repite la palabra y la consigna.
    prompt() { say(`${cap(nameT(this.w.k))}. Toca el tambor una vez por cada trozo.`); },
    // Ayuda: el tambor.
    hint() { return this.busy ? null : { x: TAMBOR.x, y: TAMBOR.y - 20, r: TAMBOR.r }; },
    // Dibuja el fondo, el dibujo (que aparece con rebote), los huecos de las sílabas (encendidos los ya dados) y el tambor.
    draw() { cfg.bg(); const w = this.w, n = w.syl.length, ap = clamp((T - this.t0) * 3, 0, 1);
      ctx.save(); ctx.translate(900, 300); const s = ap < 1 ? back(ap) : 1; ctx.scale(s, s); card(-150, -150, 300, 300, '#fff', 7, 40); thing(w.k, 0, 0, 240); ctx.restore();
      const cw = 180, gap = 24, x0 = 900 - ((n - 1) * (cw + gap)) / 2;
      w.syl.forEach((sy: string, j: number) => { const x = x0 + j * (cw + gap), on = j < this.n;
        card(x - cw / 2, 500, cw, 100, on ? '#FFF3B0' : 'rgba(255,255,255,.6)', on ? 7 : 4, 30, on ? K : '#C9BFAF');
        if (on) text(sy.toUpperCase(), x, 572, 58, '#5B8DEF', { f: LF }); else circ(x, 550, 10, '#C9BFAF', 0); });
      drawTambor(TAMBOR.x, TAMBOR.y, TAMBOR.r, this.golpe); },
    // Toque en el tambor: palmada y sílaba siguiente; con la última, estrella, frase y siguiente ronda (u onDone).
    down(x: number, y: number) {
      if (dist(x, y, TAMBOR.x, TAMBOR.y - 20) > TAMBOR.r + 30) { SFX.tap(); sparkles(x, y, 3); return; }
      if (this.busy) return;
      const w = this.w, j = this.n; this.golpe = T; this.n++; tone(330 + j * 60, .12, 'triangle', .14); SFX.pop();
      const x0 = 900 - ((w.syl.length - 1) * 204) / 2; sparkles(x0 + j * 204, 550, 6);
      if (this.n < w.syl.length) { say(w.syl[j]!); return; }
      this.busy = true; rec(cfg.key || 'palmas', true); onRight(true); this.done++; scene!.starPop = T; SFX.good(); burst(900, 300, 30);
      const n = w.syl.length;
      say(w.syl[j]!, () => later(250, () => say(`${praise()} ${cap(nameT(w.k).replace(/^(el|la|los|las) /, ''))} tiene ${n === 1 ? 'una palma' : `${NUM[n]} palmas`}.`,
        () => later(450, () => { this.i++; if (this.i >= W.length) onDone(); else this.ronda(); })))); },
  };
}

/* ---------- Pizarra: pintar libre sobre la letra ---------- */
// COMPONENTE Pizarra: una letra enorme en gris sobre una pizarra; el niño la repasa y la pinta como quiera con el dedo.
// Cuando ha pintado bastante (need píxeles de tinta, por defecto 2200), una estrella y se acaba. No hay fallos.
// cfg: letra (la mayúscula), c (color de la tiza), bg, ask (consigna), ok (frase al terminar), path (puntos por los
// que la ayuda pasa el dedo: un zigzag por encima de la letra si no se da), need.
export function Pizarra(cfg: Config, onDone: AlTerminar): Juego {
  const need = cfg.need || 2200;
  const camino: Array<[number, number]> = cfg.path || Array.from({ length: 13 }, (_, i): [number, number] => [700 + i * 34, i % 2 ? 300 : 680]);
  return { total: 1, done: 0, rayas: [] as Array<Array<[number, number]>>, tinta: 0, on: false, fin: 0,
    // Dice la consigna.
    enter() { later(300, () => sayQ(cfg.ask)); },
    // Repite la consigna.
    prompt() { say(cfg.ask); },
    // Ayuda: el dedo hace un zigzag sobre la letra (camino).
    hint() { if (this.fin) return null; const p = camino[0]!; return { x: p[0], y: p[1], r: 50, path: camino }; },
    // Dibuja el fondo, la pizarra verde con marco, la letra en gris, la tinta del niño y, al acabar, «¡Muy bien!».
    draw() { cfg.bg();
      card(470, 150, 860, 660, '#3E7A5A', 10, 24, '#8A5A34');
      text(cfg.letra, 900, 700, 560, 'rgba(255,255,255,.22)', { f: LF });
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = cfg.c || '#FFE08A';
      for (const r of this.rayas as Array<Array<[number, number]>>) { ctx.beginPath(); r.forEach(([x, y]: [number, number], j: number) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (r.length === 1) ctx.lineTo(r[0]![0] + .1, r[0]![1]); ctx.stroke(); }
      if (this.fin) { const k = clamp((T - this.fin) * 2, 0, 1); ctx.globalAlpha = k; text('¡Muy bien!', 900, 130, 72, '#7CC86E', { f: LF, st: 8, sc: '#fff' }); ctx.globalAlpha = 1; } },
    // dentro(x, y): ¿está el punto dentro de la pizarra?
    dentro(x: number, y: number) { return x > 480 && x < 1320 && y > 160 && y < 800; },
    // Toque: empieza una raya nueva si es dentro de la pizarra.
    down(x: number, y: number) { if (this.fin) return; if (!this.dentro(x, y)) { SFX.tap(); return; } this.on = true; this.rayas.push([[x, y]]); },
    // Al mover: alarga la raya y suma la tinta; con bastante tinta, termina.
    move(x: number, y: number) { if (!this.on || this.fin || !this.dentro(x, y)) return; const r = this.rayas[this.rayas.length - 1]!, p = r[r.length - 1]!, d = dist(x, y, p[0], p[1]);
      if (d < 6) return; r.push([x, y]); this.tinta += d; if (Math.floor(this.tinta / 300) > Math.floor((this.tinta - d) / 300)) tone(420 + (this.tinta % 900) / 3, .05, 'sine', .08);
      if (this.tinta >= need) this.terminar(); },
    // Soltar: deja de pintar.
    up() { this.on = false; },
    // Terminado: estrella, chispas y la frase final; después, onDone.
    terminar() { if (this.fin) return; this.fin = T; this.on = false; SFX.good(); burst(900, 480, 50); rec(cfg.key || 'trazos', true); onRight(true); this.done++; scene!.starPop = T;
      say(cfg.ok || praise(), () => later(600, onDone)); },
  };
}

/* ---------- MiNombre: el nombre en letras grandes ---------- */
// COMPONENTE MiNombre: el nombre en letras grandes, cada una en su tarjeta. La que toca bota; al tocarla, Tito dice
// cómo se llama («la ele») y se enciende. Una estrella por letra; al acabar, Tito lee el nombre entero.
// cfg: nombre (como se escribe: 'Lucía'), dice (cómo lo lee Tito; por defecto, el nombre), intro, bg, key.
export function MiNombre(cfg: Config, onDone: AlTerminar): Juego {
  const letras = [...String(cfg.nombre).toUpperCase()].filter((l) => /\p{L}/u.test(l)).slice(0, 10);
  const n = letras.length, s = Math.min(190, 1300 / n - 20), x0 = 900 - ((n - 1) * (s + 20)) / 2;
  const cartas: Libre[] = letras.map((l, i) => ({ l, x: x0 + i * (s + 20), y: 470, on: 0 }));
  return { total: n, done: 0, cur: 0, busy: false,
    // Dice la consigna.
    enter() { later(300, () => sayQ(cfg.intro)); },
    // Repite la consigna.
    prompt() { say('Toca la letra que salta.'); },
    // Ayuda: la letra que toca.
    hint() { const c = cartas[this.cur]; return c && !this.busy ? { x: c.x, y: c.y, r: s * .6 } : null; },
    // Dibuja el fondo y las tarjetas: la que toca bota con borde dorado; las ya tocadas, de color.
    draw() { cfg.bg(); cartas.forEach((c, i) => { const toca = i === this.cur && !this.busy, b = toca ? Math.abs(Math.sin(T * 4)) * 18 : 0;
      const sc = c.on ? 1 + Math.max(0, 1 - (T - c.on) * 3) * .15 : 1;
      ctx.save(); ctx.translate(c.x, c.y - b); ctx.scale(sc, sc);
      card(-s / 2, -s * .65, s, s * 1.3, c.on ? '#FFF3B0' : '#fff', toca ? 9 : 6, 26, toca ? '#FFC93C' : K);
      text(c.l, 0, s * .3, s * .85, c.on ? '#E8554E' : '#5B8DEF', { f: LF }); ctx.restore(); });
      text(String(cfg.nombre), 900, 760, 64, K, { f: LF }); },
    // Toque en una letra: si es la que toca, se dice, se enciende y avanza (con la última, se lee el nombre y acaba);
    // si es otra, solo se dice cómo se llama.
    down(x: number, y: number) { const c = cartas.find((q) => Math.abs(x - q.x) < s / 2 + 8 && Math.abs(y - q.y) < s * .65 + 8);
      if (!c) { SFX.tap(); sparkles(x, y, 3); return; }
      if (this.busy) return;
      if (c !== cartas[this.cur]) { SFX.tap(); say(cap(nombreDeLetra(c.l))); return; }
      c.on = T; SFX.pop(); tone(400 + this.cur * 50, .1, 'triangle', .12); sparkles(c.x, c.y, 10); this.cur++; this.done++; scene!.starPop = T;
      if (this.cur < n) { say(cap(nombreDeLetra(c.l))); return; }
      this.busy = true; rec(cfg.key || 'letras', true); onRight(true); SFX.good(); burst(900, 470, 50);
      say(cap(nombreDeLetra(c.l)), () => later(300, () => say(`${praise()} Así se escribe ${cfg.dice || cfg.nombre}.`, () => later(600, onDone)))); },
  };
}
