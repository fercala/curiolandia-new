/*
 * juegos/lectura.ts: los componentes nuevos de la Isla de las Letras (fase L3 de docs/PLAN-LECTURA.md), con la misma
 * interfaz que los de juegos/comps.ts (léela allí): Nombre(cfg, onDone) devuelve un Juego con total, done, enter, draw,
 * down/move/up, prompt y hint; informa con rec(), onRight(), this.done++ y scene.starPop = T, y llama a onDone() al
 * terminar.
 * COMPONENTES: Palmas (dar una palmada en el tambor por cada sílaba de una palabra), Pizarra (pintar libre con el dedo
 * sobre una letra grande en gris) y MiNombre (el nombre del niño en letras grandes: se tocan una a una y suenan); desde
 * la fase L4, Tren (la locomotora de una consonante y los vagones de las vocales forman sílabas: M + A = MA) y Huellas
 * (tocar en orden las huellas que forman una letra); desde la fase L5, Maquina (dos ruedas, una de consonantes y otra
 * de vocales, para fabricar la sílaba que pide Tito) y Frase (leer una frase corta y tocar la escena que dice).
 * Exporta además nombreDeLetra (cómo se dice cualquier letra: 'la be', 'la hache'...) y, desde la fase L5, ACCIONES y
 * drawEscena (un animal haciendo una acción, para las frases).
 * Importa: los tipos de juegos/tipos.ts, el núcleo (dibujo, voz, sonido, premios), thing, nameT y las tarjetas de elegir
 * (layoutChoice, drawChoice, hitItem) de juegos/comps.ts, picF de juegos/comps2.ts y, desde la fase ID6c de
 * docs/PLAN-IDIOMAS.md, VERBOS_RO de contenido/lecturaRo.ts (los verbos de las frases en rumano). Desde la ID6c, todo lo
 * que dicen la máquina de sílabas y las frases son plantillas de fmt, y las sílabas y las palabras escritas no se
 * traducen (juntar).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900 y tiempos de las
   animaciones, como en el resto de componentes. */
import type { AlTerminar, Config, Cosa, Juego, Libre } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  IDIOMA,
  LF,
  PI,
  SFX,
  T,
  back,
  burst,
  cap,
  card,
  circ,
  clamp,
  cloud,
  ctx,
  dist,
  ell,
  fmt,
  juntar,
  later,
  onRight,
  onWrongTwice,
  praise,
  rec,
  say,
  sayQ,
  scene,
  shuffle,
  sparkles,
  text,
  tone,
  tr,
  whenQuiet,
} from '../nucleo/indice.ts';
import { NUM, drawChoice, hitItem, layoutChoice, nameT, nombreCosa, thing } from './comps.ts';
import { picF } from './comps2.ts';
import { VERBOS_RO } from '../contenido/lecturaRo.ts';

// NOMBRES: cómo se dice cada letra (sin tilde ni diéresis: quien llama las quita con sinTilde).
const NOMBRES: Readonly<Record<string, string>> = {
  A: 'a',
  B: 'be',
  C: 'ce',
  D: 'de',
  E: 'e',
  F: 'efe',
  G: 'ge',
  H: 'hache',
  I: 'i',
  J: 'jota',
  K: 'ka',
  L: 'ele',
  M: 'eme',
  N: 'ene',
  Ñ: 'eñe',
  O: 'o',
  P: 'pe',
  Q: 'cu',
  R: 'erre',
  S: 'ese',
  T: 'te',
  U: 'u',
  V: 'uve',
  W: 'uve doble',
  X: 'equis',
  Y: 'i griega',
  Z: 'zeta',
};
// sinTilde(l): la letra mayúscula l sin tilde ni diéresis (Á -> A, Ü -> U); la Ñ se queda como está.
const sinTilde = (l: string): string => (l === 'Ñ' ? l : l.normalize('NFD').replace(/[̀-ͯ]/g, ''));
// nombreDeLetra(l): cómo se dice la letra l con su artículo ('la be'); si no es una letra, ella misma. En rumano (fase
// ID6a de docs/PLAN-IDIOMAS.md), «litera b», con su signo si lo tiene («litera ș»), ya traducido (juntar).
export function nombreDeLetra(l: string): string {
  if (IDIOMA === 'ro') return /^\p{L}$/u.test(l) ? juntar(`litera ${l.toLowerCase()}`) : l;
  const n = NOMBRES[sinTilde(l.toUpperCase())];
  return n ? `la ${n}` : l;
}

/* ---------- Palmas: una palmada por sílaba ---------- */
// TAMBOR: dónde está el tambor de las palmas (centro y radio).
const TAMBOR = { x: 900, y: 735, r: 95 };
// drawTambor(x, y, r, golpe): el tambor; golpe = instante del último toque (la piel se hunde y sale un aro).
function drawTambor(x: number, y: number, r: number, golpe: number): void {
  const k = clamp((T - golpe) * 4, 0, 1),
    h = (1 - k) * 8;
  ctx.save();
  ctx.translate(x, y);
  card(-r, -r * 0.2, r * 2, r * 0.9, '#E8554E', 7, 18);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-r + 10 + i * r * 0.45, -r * 0.15);
    ctx.lineTo(-r + 10 + i * r * 0.45 + r * 0.22, r * 0.65);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#FFC93C';
    ctx.stroke();
  }
  ell(0, -r * 0.2 + h, r, r * 0.32, '#FFF3D6', 7);
  if (k < 1) {
    ctx.globalAlpha = 1 - k;
    ell(0, -r * 0.2, r * (1 + k * 0.5), r * 0.32 * (1 + k * 0.5), null, 6, '#FFC93C');
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// COMPONENTE Palmas: sale un dibujo y, debajo, un hueco por sílaba; cada toque en el tambor da una palmada, enciende la
// sílaba siguiente y Tito la dice. Al completar la palabra, una estrella y Tito cuenta las palmas. No hay fallos: es
// para aprender a partir las palabras (3 años).
// cfg: words ([{k: dibujo, syl: ['a', 'be', 'ja']}]: las rondas, en orden), bg, key (para rec), intro (consigna de la
// primera ronda).
export function Palmas(cfg: Config, onDone: AlTerminar): Juego {
  const W: Array<{ k: Cosa; syl: string[] }> = cfg.words;
  return {
    total: W.length,
    done: 0,
    i: 0,
    n: 0,
    golpe: -9,
    busy: false,
    t0: 0,
    // Empieza la primera ronda.
    enter() {
      this.ronda(true);
    },
    // Prepara la ronda this.i: ninguna sílaba encendida y la consigna (la larga, solo la primera vez).
    ronda(primera?: boolean) {
      this.w = W[this.i];
      this.n = 0;
      this.busy = false;
      this.t0 = T;
      const nom = nameT(this.w.k);
      later(350, () =>
        sayQ(
          primera
            ? fmt('{intro} {Cosa}. Toca el tambor una vez por cada trozo.', {
                intro: tr(cfg.intro || 'Vamos a dar palmas.'),
                cosa: nom,
              })
            : fmt('Ahora: {cosa}. Toca el tambor.', { cosa: nom }),
        ),
      );
    },
    // Repite la palabra y la consigna.
    prompt() {
      say(fmt('{Cosa}. Toca el tambor una vez por cada trozo.', { cosa: nameT(this.w.k) }));
    },
    // Ayuda: el tambor.
    hint() {
      return this.busy ? null : { x: TAMBOR.x, y: TAMBOR.y - 20, r: TAMBOR.r };
    },
    // Dibuja el fondo, el dibujo (que aparece con rebote), los huecos de las sílabas (encendidos los ya dados) y el tambor.
    draw() {
      cfg.bg();
      const w = this.w,
        n = w.syl.length,
        ap = clamp((T - this.t0) * 3, 0, 1);
      ctx.save();
      ctx.translate(900, 300);
      const s = ap < 1 ? back(ap) : 1;
      ctx.scale(s, s);
      card(-150, -150, 300, 300, '#fff', 7, 40);
      thing(w.k, 0, 0, 240);
      ctx.restore();
      const cw = 180,
        gap = 24,
        x0 = 900 - ((n - 1) * (cw + gap)) / 2;
      w.syl.forEach((sy: string, j: number) => {
        const x = x0 + j * (cw + gap),
          on = j < this.n;
        card(x - cw / 2, 500, cw, 100, on ? '#FFF3B0' : 'rgba(255,255,255,.6)', on ? 7 : 4, 30, on ? K : '#C9BFAF');
        // la sílaba ya está en el idioma del juego (juntar la da por traducida; fase ID6b)
        if (on) text(juntar(sy.toUpperCase()), x, 572, 58, '#5B8DEF', { f: LF });
        else circ(x, 550, 10, '#C9BFAF', 0);
      });
      drawTambor(TAMBOR.x, TAMBOR.y, TAMBOR.r, this.golpe);
    },
    // Toque en el tambor: palmada y sílaba siguiente; con la última, estrella, frase y siguiente ronda (u onDone).
    down(x: number, y: number) {
      if (dist(x, y, TAMBOR.x, TAMBOR.y - 20) > TAMBOR.r + 30) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (this.busy) return;
      const w = this.w,
        j = this.n;
      this.golpe = T;
      this.n++;
      tone(330 + j * 60, 0.12, 'triangle', 0.14);
      SFX.pop();
      const x0 = 900 - ((w.syl.length - 1) * 204) / 2;
      sparkles(x0 + j * 204, 550, 6);
      if (this.n < w.syl.length) {
        say(juntar(w.syl[j]!));
        return;
      }
      this.busy = true;
      rec(cfg.key || 'palmas', true);
      onRight(true);
      this.done++;
      scene!.starPop = T;
      SFX.good();
      burst(900, 300, 30);
      const n = w.syl.length;
      say(juntar(w.syl[j]!), () =>
        later(250, () =>
          say(
            juntar(
              praise(),
              fmt('{Palabra} tiene {palmas}.', {
                palabra: IDIOMA === 'ro' ? nombreCosa(w.k).sin : nameT(w.k).replace(/^(el|la|los|las) /, ''),
                palmas: n === 1 ? tr('una palma') : n === 2 ? tr('dos palmas') : fmt('{n} palmas', { n: NUM[n] }),
              }),
            ),
            () =>
              later(450, () => {
                this.i++;
                if (this.i >= W.length) onDone();
                else this.ronda();
              }),
          ),
        ),
      );
    },
  };
}

/* ---------- Pizarra: pintar libre sobre la letra ---------- */
// COMPONENTE Pizarra: una letra enorme en gris sobre una pizarra; el niño la repasa y la pinta como quiera con el dedo.
// Cuando ha pintado bastante (need píxeles de tinta, por defecto 2200), una estrella y se acaba. No hay fallos.
// cfg: letra (la mayúscula), c (color de la tiza), bg, ask (consigna), ok (frase al terminar), path (puntos por los
// que la ayuda pasa el dedo: un zigzag por encima de la letra si no se da), need.
export function Pizarra(cfg: Config, onDone: AlTerminar): Juego {
  const need = cfg.need || 2200;
  const camino: Array<[number, number]> =
    cfg.path || Array.from({ length: 13 }, (_, i): [number, number] => [700 + i * 34, i % 2 ? 300 : 680]);
  return {
    total: 1,
    done: 0,
    rayas: [] as Array<Array<[number, number]>>,
    tinta: 0,
    on: false,
    fin: 0,
    // Dice la consigna.
    enter() {
      later(300, () => sayQ(cfg.ask));
    },
    // Repite la consigna.
    prompt() {
      say(cfg.ask);
    },
    // Ayuda: el dedo hace un zigzag sobre la letra (camino).
    hint() {
      if (this.fin) return null;
      const p = camino[0]!;
      return { x: p[0], y: p[1], r: 50, path: camino };
    },
    // Dibuja el fondo, la pizarra verde con marco, la letra en gris, la tinta del niño y, al acabar, «¡Muy bien!».
    draw() {
      cfg.bg();
      card(470, 150, 860, 660, '#3E7A5A', 10, 24, '#8A5A34');
      text(cfg.letra, 900, 700, 560, 'rgba(255,255,255,.22)', { f: LF });
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 26;
      ctx.strokeStyle = cfg.c || '#FFE08A';
      for (const r of this.rayas as Array<Array<[number, number]>>) {
        ctx.beginPath();
        r.forEach(([x, y]: [number, number], j: number) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        if (r.length === 1) ctx.lineTo(r[0]![0] + 0.1, r[0]![1]);
        ctx.stroke();
      }
      if (this.fin) {
        const k = clamp((T - this.fin) * 2, 0, 1);
        ctx.globalAlpha = k;
        text('¡Muy bien!', 900, 130, 72, '#7CC86E', { f: LF, st: 8, sc: '#fff' });
        ctx.globalAlpha = 1;
      }
    },
    // dentro(x, y): ¿está el punto dentro de la pizarra?
    dentro(x: number, y: number) {
      return x > 480 && x < 1320 && y > 160 && y < 800;
    },
    // Toque: empieza una raya nueva si es dentro de la pizarra.
    down(x: number, y: number) {
      if (this.fin) return;
      if (!this.dentro(x, y)) {
        SFX.tap();
        return;
      }
      this.on = true;
      this.rayas.push([[x, y]]);
    },
    // Al mover: alarga la raya y suma la tinta; con bastante tinta, termina.
    move(x: number, y: number) {
      if (!this.on || this.fin || !this.dentro(x, y)) return;
      const r = this.rayas[this.rayas.length - 1]!,
        p = r[r.length - 1]!,
        d = dist(x, y, p[0], p[1]);
      if (d < 6) return;
      r.push([x, y]);
      this.tinta += d;
      if (Math.floor(this.tinta / 300) > Math.floor((this.tinta - d) / 300))
        tone(420 + (this.tinta % 900) / 3, 0.05, 'sine', 0.08);
      if (this.tinta >= need) this.terminar();
    },
    // Soltar: deja de pintar.
    up() {
      this.on = false;
    },
    // Terminado: estrella, chispas y la frase final; después, onDone.
    terminar() {
      if (this.fin) return;
      this.fin = T;
      this.on = false;
      SFX.good();
      burst(900, 480, 50);
      rec(cfg.key || 'trazos', true);
      onRight(true);
      this.done++;
      scene!.starPop = T;
      say(cfg.ok || praise(), () => later(600, onDone));
    },
  };
}

/* ---------- MiNombre: el nombre en letras grandes ---------- */
// COMPONENTE MiNombre: el nombre en letras grandes, cada una en su tarjeta. La que toca bota; al tocarla, Tito dice
// cómo se llama («la ele») y se enciende. Una estrella por letra; al acabar, Tito lee el nombre entero.
// cfg: nombre (como se escribe: 'Lucía'), dice (cómo lo lee Tito; por defecto, el nombre), intro, bg, key.
export function MiNombre(cfg: Config, onDone: AlTerminar): Juego {
  const letras = [...String(cfg.nombre).toUpperCase()].filter((l) => /\p{L}/u.test(l)).slice(0, 10);
  const n = letras.length,
    s = Math.min(190, 1300 / n - 20),
    x0 = 900 - ((n - 1) * (s + 20)) / 2;
  const cartas: Libre[] = letras.map((l, i) => ({ l, x: x0 + i * (s + 20), y: 470, on: 0 }));
  return {
    total: n,
    done: 0,
    cur: 0,
    busy: false,
    // Dice la consigna.
    enter() {
      later(300, () => sayQ(cfg.intro));
    },
    // Repite la consigna.
    prompt() {
      say('Toca la letra que salta.');
    },
    // Ayuda: la letra que toca.
    hint() {
      const c = cartas[this.cur];
      return c && !this.busy ? { x: c.x, y: c.y, r: s * 0.6 } : null;
    },
    // Dibuja el fondo y las tarjetas: la que toca bota con borde dorado; las ya tocadas, de color.
    draw() {
      cfg.bg();
      cartas.forEach((c, i) => {
        const toca = i === this.cur && !this.busy,
          b = toca ? Math.abs(Math.sin(T * 4)) * 18 : 0;
        const sc = c.on ? 1 + Math.max(0, 1 - (T - c.on) * 3) * 0.15 : 1;
        ctx.save();
        ctx.translate(c.x, c.y - b);
        ctx.scale(sc, sc);
        card(-s / 2, -s * 0.65, s, s * 1.3, c.on ? '#FFF3B0' : '#fff', toca ? 9 : 6, 26, toca ? '#FFC93C' : K);
        text(c.l, 0, s * 0.3, s * 0.85, c.on ? '#E8554E' : '#5B8DEF', { f: LF });
        ctx.restore();
      });
      // el nombre de quien juega no se traduce (juntar; fase ID6b)
      text(juntar(String(cfg.nombre)), 900, 760, 64, K, { f: LF });
    },
    // Toque en una letra: si es la que toca, se dice, se enciende y avanza (con la última, se lee el nombre y acaba);
    // si es otra, solo se dice cómo se llama.
    down(x: number, y: number) {
      const c = cartas.find((q) => Math.abs(x - q.x) < s / 2 + 8 && Math.abs(y - q.y) < s * 0.65 + 8);
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (this.busy) return;
      if (c !== cartas[this.cur]) {
        SFX.tap();
        say(cap(nombreDeLetra(c.l)));
        return;
      }
      c.on = T;
      SFX.pop();
      tone(400 + this.cur * 50, 0.1, 'triangle', 0.12);
      sparkles(c.x, c.y, 10);
      this.cur++;
      this.done++;
      scene!.starPop = T;
      if (this.cur < n) {
        say(cap(nombreDeLetra(c.l)));
        return;
      }
      this.busy = true;
      rec(cfg.key || 'letras', true);
      onRight(true);
      SFX.good();
      burst(900, 470, 50);
      say(cap(nombreDeLetra(c.l)), () =>
        later(300, () =>
          say(juntar(praise(), fmt('Así se escribe {nombre}.', { nombre: cfg.dice || cfg.nombre })), () =>
            later(600, onDone),
          ),
        ),
      );
    },
  };
}

/* ---------- Tren: la locomotora y los vagones de las sílabas (fase L4) ---------- */
// drawLoco(x, y, l, c, humo): la locomotora en (x, y) con la letra l de color c en la cabina; humo = sale humo.
function drawLoco(x: number, y: number, l: string, c: string, humo: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  card(-110, -60, 220, 120, '#E8554E', 7, 18);
  card(-30, -150, 120, 100, '#E8554E', 7, 14);
  card(-10, -135, 80, 70, '#fff', 5, 10);
  text(l, 30, -78, 66, c, { f: LF });
  card(-100, -110, 40, 50, K, 0, 6);
  for (const wx of [-70, 0, 70]) {
    circ(wx, 70, 30, '#3B3B4F', 6);
    circ(wx, 70, 9, '#FFC93C', 0);
  }
  if (humo)
    for (let i = 0; i < 3; i++) {
      const k = (T * 0.8 + i / 3) % 1;
      ctx.globalAlpha = 0.7 * (1 - k);
      circ(-80 - k * 40, -130 - k * 90, 18 + k * 20, '#fff', 0);
      ctx.globalAlpha = 1;
    }
  ctx.restore();
}
// drawVagon(x, y, l, c, s): un vagón con la vocal l de color c, de tamaño s (1 = normal).
function drawVagon(x: number, y: number, l: string, c: string, s = 1): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  card(-75, -70, 150, 120, '#FFF3B0', 7, 16);
  text(l, 0, 28, 92, c, { f: LF, st: 6, sc: '#fff' });
  for (const wx of [-42, 42]) {
    circ(wx, 62, 22, '#3B3B4F', 5);
    circ(wx, 62, 7, '#FFC93C', 0);
  }
  ctx.restore();
}
// COMPONENTE Tren: arriba esperan los vagones de las vocales; abajo, la locomotora de la consonante. Al tocar un vagón,
// se engancha a la locomotora, sale la sílaba escrita (MA) y Tito la dice («La eme con la a: ma.»). Una estrella por
// vagón; con todos, el tren se va. No hay fallos.
// cfg: letra ({l, nombre, c}: la consonante), vocales ([{l, c}]), bg, key.
export function Tren(cfg: Config, onDone: AlTerminar): Juego {
  const V: Array<{ l: string; c: string }> = cfg.vocales,
    L = cfg.letra;
  const vag: Libre[] = V.map((v, i) => ({ ...v, x: 900 - ((V.length - 1) * 190) / 2 + i * 190, y: 250, usado: 0 }));
  return {
    total: V.length,
    done: 0,
    busy: false,
    ultimo: null as Libre | null,
    t1: 0,
    fin: 0,
    // Dice la consigna.
    enter() {
      later(300, () => sayQ(fmt('¡Llega el tren de {letra}! Toca un vagón para engancharlo.', { letra: L.nombre })));
    },
    // Repite la consigna.
    prompt() {
      say('Toca un vagón para engancharlo a la locomotora.');
    },
    // Ayuda: el primer vagón que falta.
    hint() {
      const v = vag.find((q) => !q.usado);
      return v && !this.busy ? { x: v.x, y: v.y, r: 90 } : null;
    },
    // Dibuja el fondo, la vía, los vagones que esperan, la locomotora (que se va al final) con el último vagón
    // enganchado y la sílaba que forman.
    draw() {
      cfg.bg();
      const sale = this.fin ? (T - this.fin) * 600 : 0;
      ctx.fillStyle = '#B98A5B';
      ctx.fillRect(0, 718, 1600, 14);
      for (let x = 20; x < 1600; x += 60) {
        ctx.fillStyle = '#8A5A34';
        ctx.fillRect(x, 708, 22, 34);
      }
      for (const v of vag)
        if (!v.usado) {
          const toca = !this.busy && v === vag.find((q) => !q.usado);
          drawVagon(v.x, v.y + (toca ? Math.sin(T * 4) * 6 : 0), v.l, v.c);
        }
      drawLoco(620 + sale, 620, L.l, L.c, true);
      const u = this.ultimo;
      if (u) {
        const k = clamp((T - this.t1) * 3, 0, 1);
        drawVagon(lerpN(u.x, 830, k) + sale, lerpN(u.y, 630, k), u.l, u.c);
        if (k >= 1 && !this.fin) {
          card(700, 420, 330, 120, '#fff', 7, 30);
          // la sílaba no se traduce: es la del idioma del juego (juntar la da por traducida; fase ID6a)
          text(juntar((L.l + u.l).toUpperCase()), 865, 512, 96, '#5B8DEF', { f: LF });
        }
      }
    },
    // Toque en un vagón que espera: se engancha, se dice la sílaba y, con el último, el tren se va y acaba.
    down(x: number, y: number) {
      if (this.busy) return;
      const v = vag.find((q) => !q.usado && Math.abs(x - q.x) < 85 && Math.abs(y - q.y) < 80);
      if (!v) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      v.usado = T;
      this.ultimo = v;
      this.t1 = T;
      this.busy = true;
      SFX.pop();
      tone(300 + this.done * 70, 0.15, 'triangle', 0.14);
      this.done++;
      scene!.starPop = T;
      rec(cfg.key || 'letras', true);
      onRight(true);
      const sil = (L.l + v.l).toLowerCase();
      say(fmt('{Letra} con {vocal}: {silaba}.', { letra: L.nombre, vocal: nombreDeLetra(v.l), silaba: sil }), () =>
        later(400, () => {
          if (this.done < V.length) {
            this.busy = false;
            return;
          }
          this.fin = T;
          SFX.good();
          burst(830, 600, 40);
          say(juntar(praise(), tr('¡Chu, chu! El tren se va.')), () => later(500, onDone));
        }),
      );
    },
  };
}
// lerpN(a, b, k): de a a b según k (0 a 1).
const lerpN = (a: number, b: number, k: number): number => a + (b - a) * k;

/* ---------- Huellas: tocar en orden las huellas de la letra (fase L4) ---------- */
// drawHuella(x, y, s, llena, c): una huella de pata (almohadilla y cuatro dedos) en (x, y); llena = ya pisada, de color c.
function drawHuella(x: number, y: number, s: number, llena: boolean, c: string): void {
  const f = llena ? c : 'rgba(255,255,255,.75)',
    b = llena ? K : '#B8A890';
  ell(x, y + s * 0.15, s * 0.32, s * 0.26, f, 4, b);
  for (let i = 0; i < 4; i++) {
    const a = -PI / 2 + (i - 1.5) * 0.5;
    circ(x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.38 - s * 0.05, s * 0.12, f, 3, b);
  }
}
// COMPONENTE Huellas: las huellas de un animal forman la letra; hay que tocarlas en orden (la que toca late). El
// animal salta de huella en huella. Una estrella por trazo; al acabar, onDone.
// cfg: trazos (cada trazo, una lista de puntos [x, y] ya en la pantalla), paso (distancia entre huellas, 110), c (color
// de las huellas pisadas), who (dibujo del animal), bg, ask, ok, key.
export function Huellas(cfg: Config, onDone: AlTerminar): Juego {
  // las huellas, una cada `paso` píxeles del trazo (cfg.paso, 110 por defecto) y siempre una al final
  const paso = cfg.paso || 110;
  const tr: Array<Array<[number, number]>> = cfg.trazos.map((t: Array<[number, number]>) => {
    const out: Array<[number, number]> = [];
    let d = 999;
    t.forEach((p, i) => {
      if (i === 0) {
        out.push(p);
        d = 0;
        return;
      }
      const q = t[i - 1]!;
      d += dist(p[0], p[1], q[0], q[1]);
      if (d >= paso || i === t.length - 1) {
        out.push(p);
        d = 0;
      }
    });
    return out;
  });
  return {
    total: tr.length,
    done: 0,
    ti: 0,
    pi: 0,
    busy: false,
    salto: 0,
    // Dice la consigna.
    enter() {
      later(300, () => sayQ(cfg.ask));
    },
    // Repite la consigna.
    prompt() {
      say('Toca la huella que brilla.');
    },
    // Ayuda: la huella que toca.
    hint() {
      const p = tr[this.ti]?.[this.pi];
      return p && !this.busy ? { x: p[0], y: p[1], r: 40 } : null;
    },
    // Dibuja el fondo, todas las huellas (pisadas o no; la que toca, latiendo) y el animal sobre la última pisada.
    draw() {
      cfg.bg();
      tr.forEach((t, a) =>
        t.forEach(([x, y], b) => {
          const hecha = a < this.ti || (a === this.ti && b < this.pi),
            toca = a === this.ti && b === this.pi && !this.busy;
          drawHuella(x, y, toca ? 56 + Math.sin(T * 6) * 6 : 50, hecha, cfg.c || '#7CC86E');
          if (toca) {
            ctx.globalAlpha = 0.4 + 0.3 * Math.sin(T * 6);
            circ(x, y, 44, null, 6, '#FFC93C');
            ctx.globalAlpha = 1;
          }
        }),
      );
      const p =
        this.pi > 0 ? tr[this.ti]![this.pi - 1]! : this.ti > 0 ? tr[this.ti - 1]![tr[this.ti - 1]!.length - 1]! : null;
      if (p && cfg.who) {
        const h = Math.max(0, 1 - (T - this.salto) * 4) * 30;
        thing(cfg.who, p[0] + 40, p[1] - 50 - h, 110);
      }
    },
    // Toque: si es la huella que toca, se pisa (y al final del trazo, estrella); si no, nada.
    down(x: number, y: number) {
      if (this.busy) return;
      const t = tr[this.ti]!,
        p = t[this.pi]!;
      if (dist(x, y, p[0], p[1]) > 55) {
        SFX.tap();
        return;
      }
      this.pi++;
      this.salto = T;
      tone(420 + this.pi * 25, 0.07, 'sine', 0.12);
      sparkles(p[0], p[1], 5);
      if (this.pi < t.length) return;
      this.busy = true;
      this.done++;
      scene!.starPop = T;
      SFX.good();
      rec(cfg.key || 'trazos', true);
      onRight(true);
      const ultimo = this.ti === tr.length - 1;
      say(ultimo ? cfg.ok || praise() : praise(), () =>
        later(400, () => {
          if (ultimo) {
            onDone();
            return;
          }
          this.ti++;
          this.pi = 0;
          this.busy = false;
        }),
      );
    },
  };
}

/* ---------- Maquina: la fábrica de sílabas (fase L5) ---------- */
// MAQ: dónde están las piezas de la máquina: las dos ventanas de las ruedas (centro), el botón rojo y la salida del
// papel con la sílaba.
const MAQ = {
  izq: { x: 760, y: 440 },
  der: { x: 1000, y: 440 },
  boton: { x: 1340, y: 470, r: 78 },
  papel: { x: 880, y: 720 },
};
// drawRueda(x, y, l, c, giro): la ventana de una rueda con la letra l de color c; giro = instante del último toque (la
// letra baja rodando desde arriba).
function drawRueda(x: number, y: number, l: string, c: string, giro: number): void {
  const k = clamp((T - giro) * 5, 0, 1);
  card(x - 100, y - 120, 200, 240, '#fff', 7, 26);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 94, y - 114, 188, 228);
  ctx.clip();
  ctx.globalAlpha = k;
  text(l, x, y + 62 - (1 - k) * 90, 170, c, { f: LF });
  ctx.restore();
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x - 22, y + d * 150);
    ctx.lineTo(x + 22, y + d * 150);
    ctx.lineTo(x, y + d * 172);
    ctx.closePath();
    ctx.fillStyle = '#FFC93C';
    ctx.fill();
  }
}
// COMPONENTE Maquina: la fábrica de sílabas. Tito pide una sílaba («Haz la sílaba ma.»), que sale escrita arriba; la
// máquina tiene una rueda de consonantes y otra de vocales: cada toque en una rueda pasa a la letra siguiente, y el
// botón rojo imprime la sílaba que forman. Si es la que se pedía, sale el papel con la sílaba y una estrella; si no,
// Tito dice qué sílaba ha salido y cuál quería. Al segundo fallo, onWrongTwice.
// cfg: rondas (las sílabas que se piden, en mayúsculas: ['MA', 'PE']), consonantes ([{l, c}]: las letras que puede
// tener la rueda de la izquierda; en cada ronda salen la buena y tres más), vocales ([{l, c}]), bg, key.
export function Maquina(cfg: Config, onDone: AlTerminar): Juego {
  const R: string[] = cfg.rondas,
    V: Array<{ l: string; c: string }> = cfg.vocales,
    C: Array<{ l: string; c: string }> = cfg.consonantes;
  const sil = (s: string): string => s.toLowerCase();
  return {
    total: R.length,
    done: 0,
    i: 0,
    ci: 0,
    vi: 0,
    cons: [] as Array<{ l: string; c: string }>,
    busy: false,
    errs: 0,
    giroI: -9,
    giroD: -9,
    papel: null as null | { s: string; t: number; ok: boolean },
    // Empieza la primera ronda.
    enter() {
      this.ronda(true);
    },
    // Prepara la ronda this.i: la rueda de consonantes (la buena y tres más, barajadas) y las dos ruedas en letras que
    // no son las buenas; después, la consigna.
    ronda(primera?: boolean) {
      const s = R[this.i]!;
      this.obj = s;
      this.errs = 0;
      this.busy = false;
      this.papel = null;
      const buena = C.find((c) => c.l === s[0]) ?? { l: s[0]!, c: '#5B8DEF' };
      this.cons = shuffle([buena, ...shuffle(C.filter((c) => c.l !== s[0])).slice(0, 3)]);
      this.ci = this.cons.findIndex((c: { l: string }) => c.l !== s[0]);
      this.vi = V.findIndex((v) => v.l !== s[1]);
      const i0 = this.i;
      later(350, () =>
        whenQuiet(() => {
          if (this.i === i0 && !this.busy)
            sayQ(
              juntar(
                primera ? tr('¡Esta es la máquina de las sílabas!') : '',
                fmt('Haz la sílaba {silaba}. Toca las ruedas para cambiar las letras y después pulsa el botón rojo.', {
                  silaba: sil(s),
                }),
              ),
            );
        }),
      );
    },
    // Repite la sílaba que se pide.
    prompt() {
      say(fmt('Haz la sílaba {silaba}.', { silaba: sil(this.obj) }));
    },
    // Ayuda: la rueda que no tiene la letra buena o, si las dos la tienen, el botón.
    hint() {
      if (this.busy) return null;
      if (this.cons[this.ci]!.l !== this.obj[0]) return { x: MAQ.izq.x, y: MAQ.izq.y, r: 110 };
      if (V[this.vi]!.l !== this.obj[1]) return { x: MAQ.der.x, y: MAQ.der.y, r: 110 };
      return { x: MAQ.boton.x, y: MAQ.boton.y, r: MAQ.boton.r + 10 };
    },
    // Dibuja el fondo, el cartel con la sílaba pedida, la máquina con sus dos ruedas y sus engranajes, el botón rojo
    // (late cuando las dos letras son las buenas) y el papel que sale con la sílaba impresa.
    draw() {
      cfg.bg();
      card(690, 40, 380, 150, '#FFFBF2', 6, 30);
      text('Haz:', 790, 132, 44, K);
      text(juntar(this.obj), 950, 152, 110, '#5B8DEF', { f: LF });
      const p = this.papel;
      if (p) {
        const k = clamp((T - p.t) * 3, 0, 1);
        card(MAQ.papel.x - 130, 600 + k * 70, 260, 150, p.ok ? '#FFF3B0' : '#fff', 6, 14);
        text(juntar(p.s), MAQ.papel.x, 715 + k * 70, 96, p.ok ? '#E8554E' : '#9A9086', { f: LF });
      }
      card(560, 250, 640, 400, '#7A8CA8', 8, 40);
      for (const [gx, gy] of [
        [610, 300],
        [1150, 600],
      ] as const) {
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(T * (gx > 900 ? -1 : 1));
        for (let a = 0; a < 8; a++) {
          ctx.rotate(PI / 4);
          card(-8, -46, 16, 22, '#FFC93C', 3, 4);
        }
        circ(0, 0, 34, '#FFC93C', 4);
        circ(0, 0, 10, '#7A8CA8', 3);
        ctx.restore();
      }
      const c = this.cons[this.ci]!,
        v = V[this.vi]!;
      drawRueda(MAQ.izq.x, MAQ.izq.y, c.l, c.c, this.giroI);
      drawRueda(MAQ.der.x, MAQ.der.y, v.l, v.c, this.giroD);
      const listo = c.l === this.obj[0] && v.l === this.obj[1] && !this.busy,
        b = MAQ.boton,
        sc = listo ? 1 + Math.sin(T * 6) * 0.06 : 1;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(sc, sc);
      card(-30, -10, 60, 120, '#5A5A5A', 5, 10);
      circ(0, -10, b.r * 0.8, '#E8554E', 8);
      circ(-14, -26, 14, 'rgba(255,255,255,.5)', 0);
      ctx.restore();
    },
    // Toque: en una rueda, la letra siguiente (y Tito dice cuál es); en el botón, se imprime la sílaba: acierto →
    // estrella y la ronda siguiente (u onDone); fallo → Tito dice qué ha salido y qué quería.
    down(x: number, y: number) {
      if (this.busy) return;
      const enRueda = (r: { x: number; y: number }) => Math.abs(x - r.x) < 110 && Math.abs(y - r.y) < 180;
      if (enRueda(MAQ.izq)) {
        this.ci = (this.ci + 1) % this.cons.length;
        this.giroI = T;
        tone(500, 0.06, 'square', 0.08);
        say(cap(nombreDeLetra(this.cons[this.ci]!.l)));
        return;
      }
      if (enRueda(MAQ.der)) {
        this.vi = (this.vi + 1) % V.length;
        this.giroD = T;
        tone(600, 0.06, 'square', 0.08);
        say(cap(nombreDeLetra(V[this.vi]!.l)));
        return;
      }
      if (dist(x, y, MAQ.boton.x, MAQ.boton.y) > MAQ.boton.r + 20) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      const c = this.cons[this.ci]!,
        v = V[this.vi]!,
        hecha = c.l + v.l,
        ok = hecha === this.obj;
      this.papel = { s: hecha, t: T, ok };
      SFX.pop();
      if (ok) {
        this.busy = true;
        rec(cfg.key || 'silabas', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        SFX.good();
        burst(MAQ.papel.x, 760, 30);
        say(
          juntar(
            praise(),
            fmt('{Letra} con {vocal}: {silaba}.', {
              letra: nombreDeLetra(c.l),
              vocal: nombreDeLetra(v.l),
              silaba: sil(hecha),
            }),
          ),
          () =>
            later(500, () => {
              this.i++;
              if (this.i >= R.length) onDone();
              else this.ronda();
            }),
        );
        return;
      }
      SFX.bad();
      if (this.errs === 0) rec(cfg.key || 'silabas', false);
      this.errs++;
      if (this.errs === 2) onWrongTwice();
      say(fmt('Ha salido {hecha}. Queremos {silaba}.', { hecha: sil(hecha), silaba: sil(this.obj) }));
    },
  };
}

/* ---------- Frase: leer una frase y elegir la escena (fase L5) ---------- */
// ACCIONES: lo que saben hacer los animales de las frases (el verbo, como se escribe en la frase).
export const ACCIONES = ['salta', 'duerme', 'nada', 'vuela', 'baila', 'corre'] as const;
// drawEscena(k, acc, x, y, s): el dibujo k haciendo la acción acc (una de ACCIONES), dentro de un cuadrado de lado s
// centrado en (x, y): salta (bota con su sombra), duerme (tumbado, con zetas), nada (en el agua), vuela (entre nubes),
// baila (se balancea con notas) y corre (va y viene con rayas de velocidad).
export function drawEscena(k: Cosa, acc: string, x: number, y: number, s: number): void {
  const a = s * 0.58;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.rect(-s / 2, -s / 2, s, s);
  ctx.clip();
  if (acc === 'salta') {
    const h = Math.abs(Math.sin(T * 4)) * s * 0.22;
    ctx.globalAlpha = 0.18;
    ell(0, s * 0.4, a * 0.4, 10, K, 0);
    ctx.globalAlpha = 1;
    thing(k, 0, s * 0.12 - h, a);
  } else if (acc === 'duerme') {
    ctx.save();
    ctx.translate(0, s * 0.14);
    ctx.rotate(-0.35);
    thing(k, 0, 0, a);
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const q = (T * 0.5 + i / 3) % 1;
      ctx.globalAlpha = 1 - q;
      text('z', s * 0.18 + q * s * 0.16, -s * 0.05 - q * s * 0.3, s * (0.12 + q * 0.08), '#5B8DEF', { f: LF });
      ctx.globalAlpha = 1;
    }
  } else if (acc === 'nada') {
    thing(k, Math.sin(T * 1.5) * s * 0.14, s * 0.06 + Math.sin(T * 3) * s * 0.02, a);
    ctx.fillStyle = 'rgba(91,180,239,.6)';
    ctx.fillRect(-s / 2, s * 0.16, s, s * 0.4);
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const px = -s / 2 + (i * s) / 8,
        py = s * 0.16 + Math.sin(T * 4 + i) * 5;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  } else if (acc === 'vuela') {
    cloud(-s * 0.42, s * 0.3, s * 0.0022);
    cloud(s * 0.08, s * 0.38, s * 0.0018);
    thing(k, Math.sin(T * 1.2) * s * 0.14, -s * 0.1 + Math.sin(T * 3) * s * 0.04, a * 0.9);
  } else if (acc === 'baila') {
    ctx.save();
    ctx.translate(0, s * 0.1);
    ctx.rotate(Math.sin(T * 5) * 0.3);
    thing(k, 0, 0, a);
    ctx.restore();
    for (let i = 0; i < 2; i++) {
      const q = (T * 0.6 + i / 2) % 1;
      ctx.globalAlpha = 1 - q;
      text('♪', (i ? 1 : -1) * s * 0.32, s * 0.1 - q * s * 0.4, s * 0.16, '#9B6FD0');
      ctx.globalAlpha = 1;
    }
  } else {
    const dx = Math.sin(T * 2.5) * s * 0.2,
      va = Math.cos(T * 2.5) < 0;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const lx = dx + (va ? 1 : -1) * a * 0.55;
      ctx.beginPath();
      ctx.moveTo(lx, s * (0.0 + i * 0.1));
      ctx.lineTo(lx + (va ? 1 : -1) * s * 0.12, s * (0.0 + i * 0.1));
      ctx.stroke();
    }
    picF(k, dx, s * 0.1 - Math.abs(Math.sin(T * 12)) * s * 0.03, a, va);
  }
  ctx.restore();
}
// FRASE_Y: altura de las tarjetas de las palabras de la frase.
const FRASE_Y = 250;
// COMPONENTE Frase: arriba, una frase corta escrita (EL GATO DUERME), cada palabra en su tarjeta; abajo, dos a cuatro
// escenas (el animal haciendo algo, drawEscena). Hay que leer la frase y tocar la escena que dice. Tocar una palabra
// hace que Tito la lea. Al acertar, Tito lee la frase entera (cada palabra se enciende al decirla) y una estrella; al
// segundo fallo, la lee también y quita una escena equivocada.
// cfg: frases ([{texto: 'EL GATO DUERME', escenas: [{k, acc}] (la primera es la buena)}]), bg, key, intro.
export function Frase(cfg: Config, onDone: AlTerminar): Juego {
  const F: Array<{ texto: string; escenas: Array<{ k: Cosa; acc: string }> }> = cfg.frases;
  // escena(e): la escena e como cosa de las tarjetas de elegir (con su nombre para la voz: 'el gato duerme'; en rumano,
  // desde la ID6c, con el verbo de VERBOS_RO: 'pisica doarme').
  const escena = (e: { k: Cosa; acc: string }): Libre => ({
    name: IDIOMA === 'ro' ? juntar(nameT(e.k), VERBOS_RO[e.acc] ?? e.acc) : `${nameT(e.k)} ${e.acc}`,
    draw: (x: number, y: number, s: number) => drawEscena(e.k, e.acc, x, y, (s / 0.78) * 0.92),
  });
  return {
    total: F.length,
    done: 0,
    i: 0,
    busy: false,
    errs: 0,
    lee: -1,
    pal: [] as Libre[],
    items: [] as Libre[],
    // Empieza la primera ronda.
    enter() {
      this.ronda(true);
    },
    // Prepara la ronda this.i: las tarjetas de las palabras (de ancho según lo que mide cada una, centradas) y las escenas
    // barajadas; después, la consigna.
    ronda(primera?: boolean) {
      const f = F[this.i]!;
      this.errs = 0;
      this.busy = false;
      this.lee = -1;
      ctx.font = `700 82px ${LF}`;
      const ws = f.texto.split(' '),
        an = ws.map((w) => Math.max(150, ctx.measureText(w).width + 70)),
        tot = an.reduce((a, b) => a + b, 0) + (ws.length - 1) * 30;
      let x = 900 - tot / 2;
      this.pal = ws.map((w, j) => {
        const o = { w: juntar(w), x: x + an[j]! / 2, an: an[j]! };
        x += an[j]! + 30;
        return o;
      });
      const es = f.escenas.map(escena);
      this.items = layoutChoice(shuffle(es), [es[0]!], 610, true);
      const i0 = this.i;
      later(400, () =>
        whenQuiet(() => {
          if (this.i === i0 && !this.busy)
            sayQ(
              juntar(
                primera && cfg.intro ? tr(cfg.intro) : '',
                tr('Lee la frase y toca el dibujo que dice. Si tocas una palabra, te la leo.'),
              ),
            );
        }),
      );
    },
    // Repite la consigna.
    prompt() {
      say('Lee la frase y toca el dibujo que dice.');
    },
    // Ayuda: la escena buena.
    hint() {
      const it = this.items.find((q: Libre) => q.ok && !q.win);
      return it && !this.busy ? { x: it.x, y: it.y, r: it.s * 0.62 } : null;
    },
    // leer(fin): Tito lee la frase palabra a palabra; la que dice se enciende (this.lee). Al acabar, fin().
    leer(fin?: () => void) {
      const ps = this.pal,
        paso = (j: number): void => {
          if (j >= ps.length) {
            this.lee = -1;
            fin?.();
            return;
          }
          this.lee = j;
          say(juntar(ps[j]!.w.toLowerCase()), () => later(80, () => paso(j + 1)));
        };
      paso(0);
    },
    // Dibuja el fondo, las palabras de la frase (la que se lee, en amarillo) y las escenas.
    draw() {
      cfg.bg();
      this.pal.forEach((p: Libre, j: number) => {
        const on = j === this.lee;
        card(p.x - p.an / 2, FRASE_Y - 70, p.an, 140, on ? '#FFF3B0' : '#fff', on ? 8 : 6, 26, on ? '#FFC93C' : K);
        text(p.w, p.x, FRASE_Y + 30, 82, '#3B3B4F', { f: LF });
      });
      drawChoice(this.items);
    },
    // Toque: en una palabra, Tito la lee; en una escena, acierto (estrella, Tito lee la frase y sigue) o fallo
    // (temblor; al segundo, Tito lee la frase y quita una escena equivocada).
    down(x: number, y: number) {
      const p = this.pal.find((q: Libre) => Math.abs(x - q.x) < q.an / 2 && Math.abs(y - FRASE_Y) < 75);
      if (p) {
        if (!this.busy) {
          SFX.tap();
          say(juntar(p.w.toLowerCase()));
        }
        return;
      }
      const it = hitItem(this.items, x, y);
      if (!it) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (it.win || this.busy) return;
      if (it.ok) {
        this.busy = true;
        it.win = T;
        SFX.good();
        burst(it.x, it.y, 30);
        rec(cfg.key || 'frases', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        say(praise(), () =>
          this.leer(() =>
            later(500, () => {
              this.i++;
              if (this.i >= F.length) onDone();
              else this.ronda();
            }),
          ),
        );
        return;
      }
      SFX.bad();
      it.shake = T;
      if (this.errs === 0) rec(cfg.key || 'frases', false);
      this.errs++;
      if (this.errs < 2) {
        say('Mmm, no es ese. Mira bien la frase.');
        return;
      }
      onWrongTwice();
      const w = this.items.find((q: Libre) => !q.ok && !q.gone && q !== it);
      if (w && this.items.filter((q: Libre) => !q.gone && !q.ok).length > 1) w.gone = T;
      this.busy = true;
      say('Te la leo:', () =>
        this.leer(() => {
          this.busy = false;
        }),
      );
    },
  };
}
