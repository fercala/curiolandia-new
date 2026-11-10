/*
 * escenas/casaMundo.ts: «Vuelta al mundo» (fase C3 de docs/PLAN-CASA.md), la escena SCENES.casaMundo. Se abre cuando
 * Tito hace girar el globo terráqueo de su casa (REACCIONES en dominio/casa.ts: escena 'mundo'). La Tierra gira
 * despacio; al tocarla, da vueltas muy deprisa y se para en un sitio del mundo (LUGARES de contenido/casa.ts, en orden:
 * España, el Polo Norte, África, el mar, el desierto y el Polo Sur), que sale en una tarjeta con sus animales y Tito
 * lo cuenta. Después del tercer sitio, un reto pequeño y sin fallos: «¿Dónde está España?», con tres tarjetas (si se
 * toca otra, Tito dice cuál es y da una pista). La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: MUNDO (dónde están la Tierra y las tarjetas) y pone SCENES.casaMundo.
 * Importa: el núcleo (dibujo, voz, sonido, toque), LUGARES de contenido/casa.ts y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { K } from '../dibujos/todos.ts';
import {
  PI,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  circ,
  ctx,
  dist,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  juntar,
  later,
  pic,
  say,
  sayQ,
  sky,
  sparkles,
  text,
  tr,
} from '../nucleo/indice.ts';
import { LUGARES, type LugarMundo } from '../contenido/casa.ts';
import { azar } from '../aplicacion/puertos.ts';

// MUNDO: la Tierra (centro x, y y radio r), la tarjeta del sitio (centro) y las tres tarjetas del reto (sus x, a la
// altura y). GIRO: segundos que da vueltas deprisa al tocarla. RETO_TRAS: sitios vistos antes del reto.
export const MUNDO = { x: 560, y: 480, r: 290, tarjeta: { x: 1170, y: 430 }, reto: { xs: [1000, 1205, 1410], y: 470 } };
const GIRO = 1.4,
  RETO_TRAS = 3,
  RETO = ['espana', 'poloNorte', 'africa'];

// TIERRAS: manchas de tierra del globo: longitud (radianes), latitud (de -1 a 1), ancho y alto, color. ESPANA: la
// longitud de España, donde se pone la banderita cuando sale España.
const TIERRAS: readonly (readonly [number, number, number, number, string])[] = [
  [0.1, -0.45, 70, 55, '#7CC86E'],
  [0.35, 0.1, 85, 120, '#C9B26A'],
  [1.3, -0.4, 150, 80, '#7CC86E'],
  [1.9, 0.35, 60, 50, '#7CC86E'],
  [3.4, -0.35, 110, 90, '#7CC86E'],
  [3.9, 0.35, 70, 120, '#7CC86E'],
  [5.2, -0.6, 80, 50, '#7CC86E'],
  [0, -0.92, 160, 30, '#FFFFFF'],
  [0, 0.92, 200, 34, '#FFFFFF'],
];
const ESPANA = 0.05;

// giro(spin): cuánto ha girado la Tierra (radianes): despacio siempre y, durante GIRO segundos tras tocarla, muy deprisa.
function giro(spin: number): number {
  const u = Math.max(0, Math.min(GIRO, T - spin));
  return T * 0.25 + (u > 0 ? u * 9 - u * u * 3 : 0);
}

// drawTierra(rot, bandera): la Tierra girada rot radianes: el mar, las manchas de tierra que se ven por delante
// (más estrechas cerca del borde) y, si bandera, una banderita roja y amarilla en España.
function drawTierra(rot: number, bandera: boolean): void {
  const { x, y, r } = MUNDO;
  circ(x, y, r + 16, 'rgba(91,184,230,.18)', 0);
  circ(x, y, r, '#5BB8E6', 6);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r - 3, 0, PI * 2);
  ctx.clip();
  TIERRAS.forEach(([lon, lat, w, h, c]) => {
    const a = lon - rot,
      fr = Math.cos(a);
    if (fr <= 0) return;
    ctx.beginPath();
    ctx.ellipse(x + Math.sin(a) * r * Math.cos((lat * PI) / 2), y + lat * r, w * fr, h, 0, 0, PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(58,40,30,.35)';
    ctx.stroke();
  });
  ctx.restore();
  circ(x, y, r, null, 6, K);
  const a = ESPANA - rot;
  if (bandera && Math.cos(a) > 0.2) {
    const bx = x + Math.sin(a) * r * Math.cos((-0.35 * PI) / 2),
      by = y - 0.35 * r;
    ctx.lineWidth = 4;
    ctx.strokeStyle = K;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - 60);
    ctx.stroke();
    card(bx, by - 60, 44, 30, '#C8102E', 3, 3);
    ctx.fillStyle = '#FFC400';
    ctx.fillRect(bx + 2, by - 52, 40, 14);
  }
  // la cara de la Tierra: siempre mirando al niño
  circ(x - 60, y + 10, 10, K, 0);
  circ(x + 60, y + 10, 10, K, 0);
  ctx.beginPath();
  ctx.arc(x, y + 34, 26, 0.2, PI - 0.2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = K;
  ctx.stroke();
}

// drawLugar(L, x, y, w, h, s): la tarjeta del sitio L: su color, su nombre y sus dibujos en fila.
function drawLugar(L: LugarMundo, x: number, y: number, w: number, h: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  card(-w / 2, -h / 2, w, h, L.color, 6, 30);
  text(L.n, 0, -h / 2 + 62, Math.min(48, w / 7), K, { w: 600 });
  const n = L.pics.length,
    ps = Math.min(150, (w - 40) / n);
  L.pics.forEach((k, i) => pic(k, (i - (n - 1) / 2) * ps, 30, ps * 0.9));
  ctx.restore();
}

// baraja(lista): la lista en otro orden, al azar.
const baraja = <A>(lista: readonly A[]): A[] =>
  lista
    .map((v) => [azar(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
// lugar(id): el sitio de LUGARES con ese id.
const lugar = (id: string): LugarMundo => LUGARES.find((L) => L.id === id) ?? LUGARES[0];

// VUELTA AL MUNDO: estado: spin (hora T del último toque), i (siguiente sitio de LUGARES), visto (el sitio que se ve o
// null), vistos (cuántos ha visto), reto (ids de las tres tarjetas del reto, o null) y retoHecho.
SCENES.casaMundo = {
  music: null,
  // enter(): la Tierra girando despacio y Tito explica qué hacer.
  enter() {
    this.spin = -9;
    this.i = 0;
    this.visto = null;
    this.vistos = 0;
    this.reto = null;
    this.retoHecho = false;
    later(400, () => sayQ('¡Es la Tierra, nuestro planeta! Tócala para hacerla girar.'));
  },
  // prompt(): qué hacer; en el reto, la pregunta.
  prompt() {
    say(this.reto ? '¿Dónde está España? Toca su tarjeta.' : 'Toca la Tierra para hacerla girar.');
  },
  // hint(): la Tierra, o la tarjeta de España en el reto.
  hint() {
    if (this.reto) {
      const i = (this.reto as string[]).indexOf('espana');
      return { x: MUNDO.reto.xs[i], y: MUNDO.reto.y, r: 100 };
    }
    return { x: MUNDO.x, y: MUNDO.y, r: MUNDO.r * 0.6 };
  },
  // draw(): el cielo, la Tierra (si se ve España, parada con su banderita delante), la tarjeta del sitio o las del reto, Tito y la casa.
  draw() {
    sky('#1D2B5E', '#3A4A9A');
    const espana = (this.visto as LugarMundo | null)?.id === 'espana' && T - this.spin > GIRO;
    drawTierra(espana ? ESPANA - 0.3 : giro(this.spin as number), espana);
    if (this.reto) {
      text('¿Dónde está España?', 1180, 210, 52, '#fff', { w: 600 });
      (this.reto as string[]).forEach((id, i) =>
        drawLugar(
          lugar(id),
          MUNDO.reto.xs[i],
          MUNDO.reto.y,
          190,
          260,
          hv('r' + i, hC(MUNDO.reto.xs[i], MUNDO.reto.y, 100)),
        ),
      );
    } else if (this.visto && T - this.spin > GIRO)
      drawLugar(this.visto as LugarMundo, MUNDO.tarjeta.x, MUNDO.tarjeta.y, 520, 380, 1);
    drawTito(1160, 680, 210);
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; en el reto, una tarjeta (España: ¡bien!; otra: Tito dice cuál es y
  // da una pista); la Tierra gira deprisa y, al pararse, sale el siguiente sitio. Tras RETO_TRAS sitios, el reto.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const reto = this.reto as string[] | null;
    if (reto) {
      const i = MUNDO.reto.xs.findIndex((rx) => Math.abs(x - rx) < 95 && Math.abs(y - MUNDO.reto.y) < 130);
      if (i < 0) return;
      if (reto[i] === 'espana') {
        SFX.tada();
        burst(MUNDO.reto.xs[i], MUNDO.reto.y, 40);
        this.reto = null;
        this.retoHecho = true;
        this.visto = lugar('espana');
        say('¡Muy bien! Esa es España, donde vivimos.');
      } else {
        SFX.boing();
        say(juntar(tr(lugar(reto[i]).n) + '.', tr('¡Busca el castillo y el sol!')));
      }
      return;
    }
    if (dist(x, y, MUNDO.x, MUNDO.y) > MUNDO.r || T - this.spin < GIRO) return;
    this.spin = T;
    SFX.whoosh();
    sparkles(MUNDO.x, MUNDO.y - MUNDO.r, 8);
    const L = LUGARES[this.i % LUGARES.length];
    this.i++;
    this.visto = L;
    later(GIRO * 1000, () => {
      SFX.pop();
      this.vistos++;
      say(L.frase, () => {
        if (this.vistos >= RETO_TRAS && !this.retoHecho && !this.reto) {
          this.reto = baraja(RETO);
          say('¿Dónde está España? Toca su tarjeta.');
        }
      });
    });
  },
};
