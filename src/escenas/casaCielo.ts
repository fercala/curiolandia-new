/*
 * escenas/casaCielo.ts: «El cielo de noche» (fase C3 de docs/PLAN-CASA.md), la escena SCENES.casaCielo. Se abre
 * cuando Tito mira por el telescopio de su casa (REACCIONES en dominio/casa.ts: escena 'cielo'). Se ve el cielo por el
 * círculo del telescopio: estrellas que se encienden al tocarlas (cada una con su nota), dos constelaciones escondidas
 * que se dibujan con líneas al encender todas sus estrellas (la Osa Mayor, que parece un carro, y un caracol), estrellas
 * fugaces que cruzan de vez en cuando y se cuentan al tocarlas, la Luna con su cara, Marte y, si Tito tiene Saturno en
 * su casa, también Saturno. De noche de verdad (de las 20 a las 7) hay más estrellas. No hay fallos ni tiempo: la casa
 * (arriba a la izquierda) vuelve a la casa de Tito, a la torre.
 * Exporta: CIELO (el centro y el radio del círculo del telescopio y las constelaciones) y pone SCENES.casaCielo.
 * Importa: el núcleo (dibujo, voz, sonido, toque), NOTE de juegos/ y el reloj de los puertos (ahora).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  PI,
  S,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  circ,
  ctx,
  dist,
  drawHome,
  drawTito,
  go,
  later,
  pic,
  rnd,
  say,
  sayQ,
  sparkles,
  star,
  tone,
} from '../nucleo/indice.ts';
import { NOTE } from '../juegos/indice.ts';
import { ahora } from '../aplicacion/puertos.ts';

/** Una constelación: su nombre (para el registro), sus estrellas [x, y] y qué dice Tito al encontrarla. */
interface Constelacion {
  readonly id: string;
  readonly pts: readonly (readonly [number, number])[];
  readonly lineas: readonly (readonly [number, number])[];
  readonly frase: string;
}

// CIELO: el círculo del telescopio (centro cx, cy y radio r) y las dos constelaciones: la Osa Mayor (el carro: el
// mango y la caja) y el caracol (una espiral). lineas: qué estrellas se unen al encontrarla.
export const CIELO: {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly constelaciones: readonly Constelacion[];
} = {
  cx: 800,
  cy: 450,
  r: 410,
  constelaciones: [
    {
      id: 'osa',
      pts: [
        [520, 300],
        [600, 280],
        [680, 300],
        [745, 345],
        [760, 430],
        [865, 440],
        [855, 350],
      ],
      lineas: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 3],
      ],
      frase: '¡Has encontrado la Osa Mayor! ¿A que parece un carro?',
    },
    {
      id: 'caracol',
      pts: [
        [1000, 610],
        [1040, 585],
        [1068, 625],
        [1035, 668],
        [972, 655],
        [950, 595],
        [992, 540],
      ],
      lineas: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
      ],
      frase: '¡Has dibujado un caracol con estrellas!',
    },
  ],
};
// LUNA y MARTE: dónde están y su radio. SATURNO: dónde sale si Tito lo tiene en su casa. FUGAZ: cada cuántos segundos
// sale una estrella fugaz (entre los dos números) y cuánto tarda en cruzar.
const LUNA = { x: 1090, y: 250, r: 58 },
  MARTE = { x: 590, y: 650, r: 24 },
  SATURNO = { x: 1040, y: 520, s: 120 };
const FUGAZ = { min: 4, max: 7, dura: 1.6 };

/** Una estrella del cielo: dónde está, su tamaño, si está encendida y a qué constelación pertenece (-1 si a ninguna). */
interface Estrella {
  x: number;
  y: number;
  r: number;
  on: boolean;
  grupo: number;
  brillo: number;
}
/** La estrella fugaz que cruza: cuándo salió (hora T) y desde dónde. */
interface Fugaz {
  t0: number;
  x0: number;
  y0: number;
}

// esNoche(): ¿es de noche de verdad (de las 20 a las 7)?
const esNoche = (): boolean => {
  const h = ahora().getHours();
  return h >= 20 || h < 7;
};
// dentro(x, y, m): ¿el punto está dentro del círculo del telescopio, a m píxeles del borde?
const dentro = (x: number, y: number, m: number): boolean => dist(x, y, CIELO.cx, CIELO.cy) < CIELO.r - m;
// cabeza(f): dónde está ahora la cabeza de la estrella fugaz f.
const cabeza = (f: Fugaz): [number, number] => {
  const u = (T - f.t0) / FUGAZ.dura;
  return [f.x0 + u * 560, f.y0 + u * 260];
};

// estrellasNuevas(n): las estrellas de las constelaciones y n más al azar dentro del círculo, lejos de la Luna.
function estrellasNuevas(n: number): Estrella[] {
  const grupos = CIELO.constelaciones.flatMap((c, g) =>
    c.pts.map(([x, y]) => ({ x, y, r: 11, on: false, grupo: g, brillo: rnd(0, 6) })),
  );
  const sueltas = Array.from({ length: n * 3 }, () => ({
    x: rnd(420, 1180),
    y: rnd(70, 830),
    r: rnd(5, 9),
    on: false,
    grupo: -1,
    brillo: rnd(0, 6),
  }))
    .filter(
      (e) =>
        dentro(e.x, e.y, 30) &&
        dist(e.x, e.y, LUNA.x, LUNA.y) > 100 &&
        grupos.every((g) => dist(e.x, e.y, g.x, g.y) > 45),
    )
    .slice(0, n);
  return [...grupos, ...sueltas];
}

// drawLuna(): la Luna con su cara sonriente y sus manchas.
function drawLuna(): void {
  circ(LUNA.x, LUNA.y, LUNA.r + 14, 'rgba(255,243,176,.18)', 0);
  circ(LUNA.x, LUNA.y, LUNA.r, '#FFF3B0', 4, '#E8C95A');
  circ(LUNA.x + 22, LUNA.y - 24, 9, '#F2DE86', 0);
  circ(LUNA.x - 26, LUNA.y + 22, 7, '#F2DE86', 0);
  circ(LUNA.x - 16, LUNA.y - 6, 5, '#5A4630', 0);
  circ(LUNA.x + 14, LUNA.y - 6, 5, '#5A4630', 0);
  ctx.beginPath();
  ctx.arc(LUNA.x, LUNA.y + 8, 14, 0.2, PI - 0.2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#5A4630';
  ctx.stroke();
}

// drawMarco(): lo de fuera del círculo del telescopio, oscuro, y el borde del tubo.
function drawMarco(): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 1600, 900);
  ctx.arc(CIELO.cx, CIELO.cy, CIELO.r, 0, PI * 2, true);
  ctx.fillStyle = '#100E22';
  ctx.fill('evenodd');
  ctx.restore();
  circ(CIELO.cx, CIELO.cy, CIELO.r, null, 18, '#B9824B');
  circ(CIELO.cx, CIELO.cy, CIELO.r + 12, null, 6, '#5A3B20');
}

// EL CIELO DE NOCHE: estado: est (las estrellas), fug (la estrella fugaz que cruza o null), prox (hora T de la
// siguiente), fugaces (cuántas ha tocado), hechas (constelaciones encontradas) y noche (si es de noche de verdad).
SCENES.casaCielo = {
  music: null,
  // enter(): prepara el cielo (más estrellas de noche) y Tito explica qué hacer.
  enter() {
    this.noche = esNoche();
    this.est = estrellasNuevas(this.noche ? 45 : 28);
    this.fug = null;
    this.prox = T + 2;
    this.fugaces = 0;
    this.hechas = [];
    later(400, () =>
      sayQ(
        this.noche
          ? '¡Qué noche tan bonita! Toca las estrellas para encenderlas.'
          : 'De día casi no se ven, pero con mi telescopio mágico, ¡sí! Toca las estrellas para encenderlas.',
      ),
    );
  },
  // prompt(): qué hacer.
  prompt() {
    say('Toca las estrellas para encenderlas. ¿Ves alguna estrella fugaz? ¡Tócala!');
  },
  // hint(): la primera estrella apagada de una constelación sin encontrar.
  hint() {
    const e = (this.est as Estrella[]).find((s) => s.grupo >= 0 && !s.on);
    return e ? { x: e.x, y: e.y, r: 30 } : null;
  },
  // draw(): el cielo, las líneas de las constelaciones encontradas, las estrellas (las encendidas, grandes y
  // brillantes), la Luna, Marte, Saturno si lo tiene, la estrella fugaz, el marco del telescopio, Tito y la casa.
  draw() {
    const g = ctx.createRadialGradient(CIELO.cx, CIELO.cy - 100, 50, CIELO.cx, CIELO.cy, CIELO.r);
    g.addColorStop(0, this.noche ? '#2B2A6B' : '#3A4A9A');
    g.addColorStop(1, '#151436');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1600, 900);
    const est = this.est as Estrella[];
    (this.hechas as number[]).forEach((gi) => {
      const c = CIELO.constelaciones[gi],
        pts = est.filter((e) => e.grupo === gi);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,224,138,.8)';
      ctx.beginPath();
      c.lineas.forEach(([a, b]) => {
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
      });
      ctx.stroke();
    });
    est.forEach((e) => {
      const tw = 0.6 + 0.4 * Math.sin(T * 3 + e.brillo);
      if (e.on) {
        circ(e.x, e.y, e.r * 2.2, 'rgba(255,243,176,.25)', 0);
        star(e.x, e.y, e.r * 1.6, '#FFE08A', 0);
      } else {
        ctx.globalAlpha = e.grupo >= 0 ? 0.75 : 0.35 + 0.35 * tw;
        star(e.x, e.y, e.r, '#DCD6FF', 0);
        ctx.globalAlpha = 1;
      }
    });
    drawLuna();
    circ(MARTE.x, MARTE.y, MARTE.r, '#E0603C', 3, '#A8401F');
    circ(MARTE.x - 7, MARTE.y - 6, 5, '#C9502E', 0);
    if (S.owned?.['saturno']) pic('saturno', SATURNO.x, SATURNO.y, SATURNO.s);
    if (!this.fug && T > this.prox) this.fug = { t0: T, x0: rnd(450, 800), y0: rnd(120, 260) };
    const f = this.fug as Fugaz | null;
    if (f) {
      if (T - f.t0 > FUGAZ.dura) {
        this.fug = null;
        this.prox = T + rnd(FUGAZ.min, FUGAZ.max);
      } else {
        const [hx, hy] = cabeza(f);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        const gr = ctx.createLinearGradient(hx - 180, hy - 84, hx, hy);
        gr.addColorStop(0, 'rgba(255,255,255,0)');
        gr.addColorStop(1, '#FFFFFF');
        ctx.strokeStyle = gr;
        ctx.beginPath();
        ctx.moveTo(hx - 180, hy - 84);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        star(hx, hy, 16, '#FFF6C8', 0);
      }
    }
    drawMarco();
    drawTito(20, 660, 230);
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; la estrella fugaz se cuenta; la Luna, Marte y Saturno dicen algo;
  // una estrella se enciende con su nota y, si completa una constelación, se dibuja y Tito la nombra.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const f = this.fug as Fugaz | null;
    if (f) {
      const [hx, hy] = cabeza(f);
      if (dist(x, y, hx, hy) < 90) {
        this.fugaces++;
        this.fug = null;
        this.prox = T + rnd(FUGAZ.min, FUGAZ.max);
        SFX.sparkle();
        burst(hx, hy, 20);
        say(
          this.fugaces === 1
            ? '¡Una estrella fugaz! ¡Pide un deseo!'
            : '¡Otra estrella fugaz! Ya van ' + this.fugaces + '.',
        );
        return;
      }
    }
    if (dist(x, y, LUNA.x, LUNA.y) < LUNA.r + 10) {
      SFX.pop();
      sparkles(LUNA.x, LUNA.y, 8);
      say('¡Hola, Luna! La Luna brilla de noche.');
      return;
    }
    if (dist(x, y, MARTE.x, MARTE.y) < MARTE.r + 25) {
      SFX.pop();
      sparkles(MARTE.x, MARTE.y, 6);
      say('Marte es el planeta rojo.');
      return;
    }
    if (S.owned?.['saturno'] && dist(x, y, SATURNO.x, SATURNO.y) < 70) {
      SFX.pop();
      sparkles(SATURNO.x, SATURNO.y, 6);
      say('¡Saturno! Es el planeta de los anillos.');
      return;
    }
    const est = this.est as Estrella[],
      e = est
        .filter((s) => !s.on && dist(x, y, s.x, s.y) < 38)
        .sort((a, b) => dist(x, y, a.x, a.y) - dist(x, y, b.x, b.y))[0];
    if (!e) {
      SFX.tap();
      return;
    }
    e.on = true;
    tone(NOTE(72 + (est.filter((s) => s.on).length % 12)), 0.4, 'sine', 0.25);
    sparkles(e.x, e.y, 5);
    const gi = e.grupo,
      hechas = this.hechas as number[];
    if (gi >= 0 && !hechas.includes(gi) && est.filter((s) => s.grupo === gi).every((s) => s.on)) {
      hechas.push(gi);
      SFX.tada();
      burst(e.x, e.y, 30);
      say(CIELO.constelaciones[gi].frase);
      if (hechas.length === CIELO.constelaciones.length)
        later(3500, () => sayQ('¡Has encontrado todas las constelaciones! ¡Qué bien miras el cielo!'));
    }
  },
};

// Comprobación al cargar: todas las estrellas de las constelaciones caen dentro del telescopio (si no, no se verían).
if (!CIELO.constelaciones.every((c) => c.pts.every(([x, y]) => dentro(x, y, 20))))
  console.warn('casaCielo: una constelación se sale del telescopio');
