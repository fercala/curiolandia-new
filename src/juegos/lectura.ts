/*
 * juegos/lectura.ts: los componentes nuevos de la Isla de las Letras (fase L3 de docs/PLAN-LECTURA.md), con la misma
 * interfaz que los de juegos/comps.ts (léela allí): Nombre(cfg, onDone) devuelve un Juego con total, done, enter, draw,
 * down/move/up, prompt y hint; informa con rec(), onRight(), this.done++ y scene.starPop = T, y llama a onDone() al
 * terminar.
 * COMPONENTES: Palmas (dar una palmada en el tambor por cada sílaba de una palabra), Pizarra (pintar libre con el dedo
 * sobre una letra grande en gris) y MiNombre (el nombre del niño en letras grandes: se tocan una a una y suenan); desde
 * la fase L4, Tren (la locomotora de una consonante y los vagones de las vocales forman sílabas: M + A = MA) y Huellas
 * (tocar en orden las huellas que forman una letra).
 * Exporta además nombreDeLetra (cómo se dice cualquier letra: 'la be', 'la hache'...).
 * Importa: los tipos de juegos/tipos.ts, el núcleo (dibujo, voz, sonido, premios) y thing y nameT de juegos/comps.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900 y tiempos de las
   animaciones, como en el resto de componentes. */
import type { AlTerminar, Config, Cosa, Juego, Libre } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { LF, PI, SFX, T, back, burst, cap, card, circ, clamp, ctx, dist, ell, later, onRight, praise, rec, say, sayQ, scene, sparkles, text, tone } from '../nucleo/indice.ts';
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

/* ---------- Tren: la locomotora y los vagones de las sílabas (fase L4) ---------- */
// drawLoco(x, y, l, c, humo): la locomotora en (x, y) con la letra l de color c en la cabina; humo = sale humo.
function drawLoco(x: number, y: number, l: string, c: string, humo: boolean): void {
  ctx.save(); ctx.translate(x, y);
  card(-110, -60, 220, 120, '#E8554E', 7, 18); card(-30, -150, 120, 100, '#E8554E', 7, 14); card(-10, -135, 80, 70, '#fff', 5, 10);
  text(l, 30, -78, 66, c, { f: LF }); card(-100, -110, 40, 50, K, 0, 6);
  for (const wx of [-70, 0, 70]) { circ(wx, 70, 30, '#3B3B4F', 6); circ(wx, 70, 9, '#FFC93C', 0); }
  if (humo) for (let i = 0; i < 3; i++) { const k = (T * .8 + i / 3) % 1; ctx.globalAlpha = .7 * (1 - k); circ(-80 - k * 40, -130 - k * 90, 18 + k * 20, '#fff', 0); ctx.globalAlpha = 1; }
  ctx.restore();
}
// drawVagon(x, y, l, c, s): un vagón con la vocal l de color c, de tamaño s (1 = normal).
function drawVagon(x: number, y: number, l: string, c: string, s = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  card(-75, -70, 150, 120, '#FFF3B0', 7, 16); text(l, 0, 28, 92, c, { f: LF, st: 6, sc: '#fff' });
  for (const wx of [-42, 42]) { circ(wx, 62, 22, '#3B3B4F', 5); circ(wx, 62, 7, '#FFC93C', 0); }
  ctx.restore();
}
// COMPONENTE Tren: arriba esperan los vagones de las vocales; abajo, la locomotora de la consonante. Al tocar un vagón,
// se engancha a la locomotora, sale la sílaba escrita (MA) y Tito la dice («La eme con la a: ma.»). Una estrella por
// vagón; con todos, el tren se va. No hay fallos.
// cfg: letra ({l, nombre, c}: la consonante), vocales ([{l, c}]), bg, key.
export function Tren(cfg: Config, onDone: AlTerminar): Juego {
  const V: Array<{ l: string; c: string }> = cfg.vocales, L = cfg.letra;
  const vag: Libre[] = V.map((v, i) => ({ ...v, x: 900 - ((V.length - 1) * 190) / 2 + i * 190, y: 250, usado: 0 }));
  return { total: V.length, done: 0, busy: false, ultimo: null as Libre | null, t1: 0, fin: 0,
    // Dice la consigna.
    enter() { later(300, () => sayQ(`¡Llega el tren de ${L.nombre}! Toca un vagón para engancharlo.`)); },
    // Repite la consigna.
    prompt() { say('Toca un vagón para engancharlo a la locomotora.'); },
    // Ayuda: el primer vagón que falta.
    hint() { const v = vag.find((q) => !q.usado); return v && !this.busy ? { x: v.x, y: v.y, r: 90 } : null; },
    // Dibuja el fondo, la vía, los vagones que esperan, la locomotora (que se va al final) con el último vagón
    // enganchado y la sílaba que forman.
    draw() { cfg.bg(); const sale = this.fin ? (T - this.fin) * 600 : 0;
      ctx.fillStyle = '#B98A5B'; ctx.fillRect(0, 718, 1600, 14); for (let x = 20; x < 1600; x += 60) { ctx.fillStyle = '#8A5A34'; ctx.fillRect(x, 708, 22, 34); }
      for (const v of vag) if (!v.usado) { const toca = !this.busy && v === vag.find((q) => !q.usado); drawVagon(v.x, v.y + (toca ? Math.sin(T * 4) * 6 : 0), v.l, v.c); }
      drawLoco(620 + sale, 620, L.l, L.c, true);
      const u = this.ultimo; if (u) { const k = clamp((T - this.t1) * 3, 0, 1); drawVagon(lerpN(u.x, 830, k) + sale, lerpN(u.y, 630, k), u.l, u.c);
        if (k >= 1 && !this.fin) { card(700, 420, 330, 120, '#fff', 7, 30); text((L.l + u.l).toUpperCase(), 865, 512, 96, '#5B8DEF', { f: LF }); } } },
    // Toque en un vagón que espera: se engancha, se dice la sílaba y, con el último, el tren se va y acaba.
    down(x: number, y: number) { if (this.busy) return; const v = vag.find((q) => !q.usado && Math.abs(x - q.x) < 85 && Math.abs(y - q.y) < 80);
      if (!v) { SFX.tap(); sparkles(x, y, 3); return; }
      v.usado = T; this.ultimo = v; this.t1 = T; this.busy = true; SFX.pop(); tone(300 + this.done * 70, .15, 'triangle', .14);
      this.done++; scene!.starPop = T; rec(cfg.key || 'letras', true); onRight(true);
      const sil = (L.l + v.l).toLowerCase();
      say(`${cap(L.nombre)} con ${nombreDeLetra(v.l)}: ${sil}.`, () => later(400, () => {
        if (this.done < V.length) { this.busy = false; return; }
        this.fin = T; SFX.good(); burst(830, 600, 40); say(`${praise()} ¡Chu, chu! El tren se va.`, () => later(500, onDone)); })); },
  };
}
// lerpN(a, b, k): de a a b según k (0 a 1).
const lerpN = (a: number, b: number, k: number): number => a + (b - a) * k;

/* ---------- Huellas: tocar en orden las huellas de la letra (fase L4) ---------- */
// drawHuella(x, y, s, llena, c): una huella de pata (almohadilla y cuatro dedos) en (x, y); llena = ya pisada, de color c.
function drawHuella(x: number, y: number, s: number, llena: boolean, c: string): void {
  const f = llena ? c : 'rgba(255,255,255,.75)', b = llena ? K : '#B8A890';
  ell(x, y + s * .15, s * .32, s * .26, f, 4, b);
  for (let i = 0; i < 4; i++) { const a = -PI / 2 + (i - 1.5) * .5; circ(x + Math.cos(a) * s * .42, y + Math.sin(a) * s * .38 - s * .05, s * .12, f, 3, b); }
}
// COMPONENTE Huellas: las huellas de un animal forman la letra; hay que tocarlas en orden (la que toca late). El
// animal salta de huella en huella. Una estrella por trazo; al acabar, onDone.
// cfg: trazos (cada trazo, una lista de puntos [x, y] ya en la pantalla), paso (distancia entre huellas, 110), c (color
// de las huellas pisadas), who (dibujo del animal), bg, ask, ok, key.
export function Huellas(cfg: Config, onDone: AlTerminar): Juego {
  // las huellas, una cada `paso` píxeles del trazo (cfg.paso, 110 por defecto) y siempre una al final
  const paso = cfg.paso || 110;
  const tr: Array<Array<[number, number]>> = cfg.trazos.map((t: Array<[number, number]>) => {
    const out: Array<[number, number]> = []; let d = 999;
    t.forEach((p, i) => { if (i === 0) { out.push(p); d = 0; return; } const q = t[i - 1]!; d += dist(p[0], p[1], q[0], q[1]); if (d >= paso || i === t.length - 1) { out.push(p); d = 0; } });
    return out;
  });
  return { total: tr.length, done: 0, ti: 0, pi: 0, busy: false, salto: 0,
    // Dice la consigna.
    enter() { later(300, () => sayQ(cfg.ask)); },
    // Repite la consigna.
    prompt() { say('Toca la huella que brilla.'); },
    // Ayuda: la huella que toca.
    hint() { const p = tr[this.ti]?.[this.pi]; return p && !this.busy ? { x: p[0], y: p[1], r: 40 } : null; },
    // Dibuja el fondo, todas las huellas (pisadas o no; la que toca, latiendo) y el animal sobre la última pisada.
    draw() { cfg.bg();
      tr.forEach((t, a) => t.forEach(([x, y], b) => { const hecha = a < this.ti || (a === this.ti && b < this.pi), toca = a === this.ti && b === this.pi && !this.busy;
        drawHuella(x, y, toca ? 56 + Math.sin(T * 6) * 6 : 50, hecha, cfg.c || '#7CC86E'); if (toca) { ctx.globalAlpha = .4 + .3 * Math.sin(T * 6); circ(x, y, 44, null, 6, '#FFC93C'); ctx.globalAlpha = 1; } }));
      const p = this.pi > 0 ? tr[this.ti]![this.pi - 1]! : this.ti > 0 ? tr[this.ti - 1]![tr[this.ti - 1]!.length - 1]! : null;
      if (p && cfg.who) { const h = Math.max(0, 1 - (T - this.salto) * 4) * 30; thing(cfg.who, p[0] + 40, p[1] - 50 - h, 110); } },
    // Toque: si es la huella que toca, se pisa (y al final del trazo, estrella); si no, nada.
    down(x: number, y: number) { if (this.busy) return; const t = tr[this.ti]!, p = t[this.pi]!;
      if (dist(x, y, p[0], p[1]) > 55) { SFX.tap(); return; }
      this.pi++; this.salto = T; tone(420 + this.pi * 25, .07, 'sine', .12); sparkles(p[0], p[1], 5);
      if (this.pi < t.length) return;
      this.busy = true; this.done++; scene!.starPop = T; SFX.good(); rec(cfg.key || 'trazos', true); onRight(true);
      const ultimo = this.ti === tr.length - 1;
      say(ultimo ? cfg.ok || praise() : praise(), () => later(400, () => { if (ultimo) { onDone(); return; } this.ti++; this.pi = 0; this.busy = false; })); },
  };
}
