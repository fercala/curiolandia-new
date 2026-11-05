/*
 * escenas/casaCocina.ts: las dos escenas pequeñas de la cocina de Tito (fase C5 de docs/PLAN-CASA.md).
 * - «La merienda» (SCENES.casaMerienda), desde la nevera: en la balda hay fruta; al tocarla, va al plato. Tito pide
 *   una cantidad de una fruta («¿Me das tres fresas?», de 2 a 4); cuando el plato la tiene, se la come. Una fruta que no
 *   es la que pidió vuelve a su sitio y Tito dice cuál quería. Después, cada fruta del plato se la come al momento.
 * - «Sopa de Tito» (SCENES.casaSopa), desde la olla: las verduras saltan a la olla al tocarlas; con tres dentro, Tito
 *   pide removerla, y al dar vueltas con el dedo dentro de la olla la sopa se hace y cambia de color. Luego, otra.
 * Ninguna tiene fallos ni tiempo. La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: COCINA (dónde están la fruta, el plato, las verduras y la olla) y pone SCENES.casaMerienda y SCENES.casaSopa.
 * Importa: el núcleo (dibujo, voz, sonido, toque, nombres de los dibujos) y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  PI,
  SCENES,
  SFX,
  T,
  W_,
  atHome,
  burst,
  card,
  ctx,
  dist,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  later,
  parts,
  pic,
  rnd,
  say,
  sayQ,
  sparkles,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';

// COCINA: la fruta de la merienda (en la balda, desde x0 cada dx), el plato, las verduras de la sopa y la olla.
export const COCINA = {
  frutas: ['fresa', 'manzana', 'pera', 'naranja', 'sandia'],
  balda: { x0: 470, dx: 165, y: 230 },
  plato: { x: 800, y: 640, r: 210 },
  verduras: ['zanahoria', 'patata', 'tomate', 'pimiento', 'brocoli', 'calabaza'],
  cesta: { x0: 410, dx: 160, y: 230 },
  olla: { x: 800, y: 640, r: 230 },
};
// NUMEROS: cómo se dicen las cantidades que pide Tito. PLURAL: el plural de cada fruta (sin artículo). Todas las
// frutas de COCINA son femeninas: «una fresa», «una manzana».
const NUMEROS = ['', 'una', 'dos', 'tres', 'cuatro'];
const SINGULAR: Readonly<Record<string, string>> = {
  fresa: 'fresa',
  manzana: 'manzana',
  pera: 'pera',
  naranja: 'naranja',
  sandia: 'sandía',
};
const PLURAL: Readonly<Record<string, string>> = {
  fresa: 'fresas',
  manzana: 'manzanas',
  pera: 'peras',
  naranja: 'naranjas',
  sandia: 'sandías',
};
// COLOR_SOPA: de qué color se pone la sopa al removerla, según la primera verdura que se echó.
const COLOR_SOPA: Readonly<Record<string, string>> = {
  zanahoria: '#FFA94D',
  patata: '#F2DFA0',
  tomate: '#FF6B5E',
  pimiento: '#F06A4A',
  brocoli: '#8CCB6A',
  calabaza: '#FFB347',
};
// VUELTAS: cuánto hay que remover (en radianes recorridos alrededor del centro de la olla).
const VUELTAS = PI * 6;

// fondoCocina(): la pared de azulejos y la encimera.
function fondoCocina(): void {
  ctx.fillStyle = '#FFF6E6';
  ctx.fillRect(0, 0, 1600, 900);
  ctx.strokeStyle = 'rgba(155,138,217,.18)';
  ctx.lineWidth = 3;
  Array.from({ length: 16 }, (_v, i) => i * 100).forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 470);
    ctx.stroke();
  });
  Array.from({ length: 5 }, (_v, i) => i * 100).forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1600, y);
    ctx.stroke();
  });
  card(-20, 470, 1640, 450, '#E2B983', 6, 0);
  card(300, 160, 1000, 150, '#C99A68', 5, 16);
}

// cuantas(n, fruta): «tres fresas», «una manzana».
const cuantas = (n: number, f: string): string => NUMEROS[n] + ' ' + (n === 1 ? SINGULAR[f] : PLURAL[f]);
// mayuscula(t): t con la primera letra en mayúscula.
const mayuscula = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

// LA MERIENDA: estado: plato (las frutas que hay), pide ({f: fruta, n: cuántas} o null cuando ya merendó) y come (hora
// T a la que empezó a comer, para la animación).
SCENES.casaMerienda = {
  music: null,
  // enter(): plato vacío y Tito pide una cantidad de una fruta.
  enter() {
    this.plato = [];
    this.come = -9;
    this.pedir!();
  },
  // pedir(): elige qué pide Tito (de 2 a 4 de una fruta) y lo dice.
  pedir() {
    const f = COCINA.frutas[Math.floor(azar() * COCINA.frutas.length)],
      n = 2 + Math.floor(azar() * 3);
    this.pide = { f, n };
    later(400, () => sayQ('¡Qué hambre! ¿Me das ' + cuantas(n, f) + '?'));
  },
  // prompt(): lo que pide, o qué hacer si ya merendó.
  prompt() {
    const p = this.pide as { f: string; n: number } | null;
    say(p ? '¿Me das ' + cuantas(p.n, p.f) + '? Tócalas en la balda.' : 'Toca la fruta y me la como.');
  },
  // hint(): la fruta que pide, en la balda.
  hint() {
    const p = this.pide as { f: string } | null;
    if (!p) return null;
    const i = COCINA.frutas.indexOf(p.f);
    return { x: COCINA.balda.x0 + i * COCINA.balda.dx, y: COCINA.balda.y, r: 70 };
  },
  // draw(): la cocina, la fruta de la balda, el plato con lo que hay, Tito (masticando si come) y la casa.
  draw() {
    fondoCocina();
    const b = COCINA.balda,
      pl = COCINA.plato;
    COCINA.frutas.forEach((f, i) => {
      const x = b.x0 + i * b.dx,
        s = hv('f' + i, hC(x, b.y, 70));
      ctx.save();
      ctx.translate(x, b.y);
      ctx.scale(s, s);
      pic(f, 0, 0, 120);
      ctx.restore();
    });
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pl.x, pl.y, pl.r, pl.r * 0.45, 0, 0, PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#3A281E';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(pl.x, pl.y, pl.r * 0.7, pl.r * 0.3, 0, 0, PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#9BC6E6';
    ctx.stroke();
    ctx.restore();
    (this.plato as string[]).forEach((f, i) =>
      pic(f, pl.x - 120 + (i % 4) * 80, pl.y - 30 - Math.floor(i / 4) * 50, 100),
    );
    const ch = T - this.come < 1.2 ? Math.abs(Math.sin((T - this.come) * 14)) * 0.08 : 0;
    drawTito(1130, 470, 330, { sq: ch });
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; una fruta de la balda va al plato. Si Tito pidió algo: la que pidió
  // se queda (y al llegar a la cantidad, se la come todo); otra, vuelve y Tito dice cuál quería. Si ya merendó, se la
  // come al momento.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const i = COCINA.frutas.findIndex(
      (_f, j) => dist(x, y, COCINA.balda.x0 + j * COCINA.balda.dx, COCINA.balda.y) < 70,
    );
    if (i < 0) return;
    const f = COCINA.frutas[i],
      p = this.pide as { f: string; n: number } | null,
      plato = this.plato as string[];
    if (!p) {
      SFX.munch();
      this.come = T;
      sparkles(1280, 600, 6);
      say(['¡Qué rica!', '¡Mmm, me encanta!', '¡Ñam, ñam!'][Math.floor(azar() * 3)]);
      return;
    }
    if (f !== p.f) {
      SFX.boing();
      say('Eso es ' + W_(f) + '. ¡Yo quería ' + PLURAL[p.f] + '!');
      return;
    }
    SFX.pop();
    plato.push(f);
    sparkles(COCINA.plato.x, COCINA.plato.y - 40, 4);
    if (plato.length < p.n) return;
    this.pide = null;
    SFX.tada();
    burst(COCINA.plato.x, COCINA.plato.y - 60, 30);
    say('¡' + mayuscula(cuantas(p.n, p.f)) + '! ¡Gracias!', () => {
      this.come = T;
      SFX.munch();
      this.plato = [];
      say('¡Qué rica la merienda! Si quieres, dame más fruta.');
    });
  },
};

// SOPA DE TITO: estado: dentro (las verduras echadas), giro (cuánto se ha removido), ang (ángulo del último toque, o
// null si no se está removiendo), lista (si ya está hecha).
SCENES.casaSopa = {
  music: null,
  // enter(): la olla vacía.
  enter() {
    this.dentro = [];
    this.giro = 0;
    this.ang = null;
    this.lista = false;
    later(400, () => sayQ('¡Vamos a hacer sopa! Echa tres verduras a la olla.'));
  },
  // prompt(): qué toca hacer ahora.
  prompt() {
    const n = (this.dentro as string[]).length;
    say(
      n < 3
        ? 'Toca las verduras para echarlas a la olla.'
        : 'Remueve la sopa: da vueltas con el dedo dentro de la olla.',
    );
  },
  // draw(): la cocina, las verduras, la olla con el caldo (del color de la sopa cuanto más se remueve) y el vapor,
  // Tito y la casa.
  draw() {
    fondoCocina();
    const c = COCINA.cesta,
      o = COCINA.olla,
      dentro = this.dentro as string[];
    COCINA.verduras.forEach((v, i) => {
      const x = c.x0 + i * c.dx,
        s = hv('v' + i, hC(x, c.y, 70));
      ctx.save();
      ctx.translate(x, c.y);
      ctx.scale(s, s);
      pic(v, 0, 0, 115);
      ctx.restore();
    });
    card(o.x - o.r, o.y - 60, o.r * 2, 260, '#8C8FA3', 6, 40);
    card(o.x - o.r - 50, o.y - 30, 60, 30, '#5A5D70', 5, 12);
    card(o.x + o.r - 10, o.y - 30, 60, 30, '#5A5D70', 5, 12);
    const u = Math.min(1, (this.giro as number) / VUELTAS),
      base = dentro.length ? COLOR_SOPA[dentro[0]] : '#CFE8F5';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y - 60, o.r - 14, 46, 0, 0, PI * 2);
    ctx.fillStyle = u > 0.05 ? base : '#CFE8F5';
    ctx.globalAlpha = 0.4 + 0.6 * Math.max(u, dentro.length ? 0.3 : 0);
    ctx.fill();
    ctx.globalAlpha = 1;
    dentro.forEach((v, i) => {
      const a = (this.giro as number) * 0.5 + i * 2.1;
      pic(v, o.x + Math.cos(a) * 110, o.y - 64 + Math.sin(a) * 18, 70);
    });
    if (dentro.length && azar() < 0.15)
      parts.push({
        x: o.x + rnd(-120, 120),
        y: o.y - 90,
        vx: rnd(-10, 10),
        vy: -70,
        life: 1.6,
        t: 0,
        c: '#FFFFFF',
        r: rnd(12, 20),
        rot: 0,
        k: 'd',
        g: -20,
      });
    drawTito(1180, 470, 320);
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; una verdura salta a la olla (hasta tres); con tres, tocar la olla
  // empieza a remover.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const dentro = this.dentro as string[],
      o = COCINA.olla;
    const i = COCINA.verduras.findIndex(
      (_v, j) => dist(x, y, COCINA.cesta.x0 + j * COCINA.cesta.dx, COCINA.cesta.y) < 70,
    );
    if (i >= 0) {
      if (this.lista || dentro.length >= 3) return;
      SFX.splash();
      dentro.push(COCINA.verduras[i]);
      sparkles(o.x, o.y - 80, 6);
      if (dentro.length === 3) say('¡Ya está todo! Ahora remueve la sopa: da vueltas con el dedo dentro de la olla.');
      return;
    }
    if (dentro.length === 3 && !this.lista && Math.abs(x - o.x) < o.r && Math.abs(y - (o.y - 60)) < 120)
      this.ang = Math.atan2(y - (o.y - 60), x - o.x);
  },
  // move(x, y): removiendo, suma lo que gira el dedo alrededor del centro de la olla; al llegar a VUELTAS, la sopa está.
  move(x: number, y: number) {
    if (this.ang === null || this.lista) return;
    const o = COCINA.olla,
      a = Math.atan2(y - (o.y - 60), x - o.x);
    let d = a - (this.ang as number);
    if (d > PI) d -= PI * 2;
    if (d < -PI) d += PI * 2;
    this.giro = (this.giro as number) + Math.abs(d);
    this.ang = a;
    if ((this.giro as number) < VUELTAS) return;
    this.lista = true;
    this.ang = null;
    SFX.tada();
    burst(o.x, o.y - 100, 40);
    say('¡La sopa está lista! ¡Mmm, qué bien huele!', () =>
      later(1500, () => {
        this.dentro = [];
        this.giro = 0;
        this.lista = false;
        say('¿Hacemos otra sopa? Echa tres verduras.');
      }),
    );
  },
  // up(): deja de remover.
  up() {
    this.ang = null;
  },
};
