/*
 * escenas/islaIngles.ts: la Isla del Inglés (fase I2 de docs/PLAN-INGLES.md), la escena SCENES.islaIngles. Sustituye al
 * Rincón del inglés: se llega desde el globo del mapa (MZ2 en escenas/zonas.ts, en el sitio del rincón). Es un mapa
 * pequeño, como el de la Isla de las Letras (escenas/isla.ts), con las tres zonas de la isla, Polly (la lorita que
 * enseña palabras en inglés), el globo para volver y su propio botón verde de «seguir», que lleva a la casita de inglés
 * que toca (nextIngles, con la regla siguienteDeIsla de dominio/apertura.ts).
 * Las zonas que ya tienen casitas son zonas de ZONES (desde la fase I2, la Playa Hello) y se abren como las principales
 * (zoneOpen). Las que aún no tienen salen «en obras»: al tocarlas, Tito dice que Polly las está preparando.
 * Es una escena 2D; con WebGL, desde la fase I6, mundo3d/islaIngles3d.ts la convierte en 3D (como mundo3d/isla3d.ts hizo
 * con la de las letras), y para eso usa ISLA_INGLES, POLLY y GLOBO.
 * Exporta: ISLA_INGLES (los sitios de la isla), POLLY y GLOBO, y pone SCENES.islaIngles al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito), las reglas y ayudas de escenas/zonas.ts (ZONES, zoneOpen, nextIngles,
 * drawSeguir y SEGUIR) y el mar y la valla de las obras de escenas/isla.ts (fondo, drawObras).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Libre } from '../juegos/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  DIAC,
  FLC,
  LF,
  PI,
  S,
  SCENES,
  SFX,
  T,
  TITO,
  atHome,
  burst,
  cap,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  ell,
  fillStroke,
  go,
  hC,
  hv,
  inCoinHUD,
  inTito,
  kid,
  later,
  pic,
  save,
  say,
  sayQ,
  sparkles,
  text,
  tree,
} from '../nucleo/indice.ts';
import { SEGUIR, ZONES, drawSeguir, nextIngles, zoneOpen } from './zonas.ts';
import { drawObras, fondo } from './isla.ts';

/** Un sitio de la isla: zona (id de ZONAS_INGLES), dónde está, radio tocable, nombre para la voz y su edad. */
interface SitioIsla {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly name: string;
  readonly edad: number;
}

// ISLA_INGLES: las tres zonas de la isla, en el orden de las edades (las mismas posiciones que la Isla de las Letras).
export const ISLA_INGLES: readonly SitioIsla[] = [
  { id: 'playaHello', x: 430, y: 560, r: 150, name: 'la Playa Hello', edad: 3 },
  { id: 'parqueLondres', x: 860, y: 330, r: 150, name: 'el Parque de Londres', edad: 4 },
  { id: 'puebloCuentos', x: 1240, y: 560, r: 150, name: 'el Pueblo de los Cuentos', edad: 5 },
];
// GLOBO: el globo para volver al mapa grande (abajo a la derecha). POLLY: dónde está Polly, en el centro de la isla.
export const GLOBO = { x: 1440, y: 760, r: 100 };
export const POLLY = { x: 860, y: 640, s: 170 };

// hecha(id): ¿tiene ya casitas la zona id? (si no, sale «en obras»).
const hecha = (id: string): boolean => !!ZONES[id];

// drawGloboIsla(x, y): el globo aerostático de rayas rojas, blancas y azules con su cesta, que sube y baja despacio.
function drawGloboIsla(x: number, y: number): void {
  const b = Math.sin(T * 1.6) * 6;
  ctx.save();
  ctx.translate(x, y + b);
  ctx.lineWidth = 4;
  ctx.strokeStyle = K;
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(d * 40, -10);
    ctx.lineTo(d * 20, 36);
    ctx.stroke();
  }
  card(-28, 34, 56, 38, '#C98A4B', 5, 8);
  ctx.beginPath();
  ctx.ellipse(0, -62, 64, 70, 0, 0, PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ['#E8554E', '#fff', '#5B8DEF', '#fff', '#E8554E'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(-64 + i * 25.6, -134, 25.6, 144);
  });
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, -62, 64, 70, 0, 0, PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = K;
  ctx.stroke();
  ctx.restore();
}

// drawPlaya(x, y): la Playa Hello: arena, una pelota de playa, una concha y el bocadillo «Hello!», que bota.
function drawPlaya(x: number, y: number): void {
  ell(x, y + 20, 170, 110, '#FFE6A8', 7);
  pic('pelotaPlaya', x - 80, y + 30, 90);
  pic('concha', x + 90, y + 60, 60);
  const b = Math.abs(Math.sin(T * 3)) * 12;
  card(x - 70, y - 120 - b, 140, 64, '#fff', 6, 30);
  text('Hello!', x, y - 76 - b, 38, '#5B8DEF', { f: LF });
}

// drawParque(x, y, abierta): el Parque de Londres: hierba, árboles, el autobús rojo y el reloj (en gris si está cerrado).
function drawParque(x: number, y: number, abierta: boolean): void {
  ell(x, y + 30, 170, 100, abierta ? '#A8DC8F' : '#D8D2C8', 7);
  for (const [a, b, s] of [
    [-100, 30, 0.6],
    [100, 30, 0.6],
  ] as const)
    tree(x + a, y + b, s, abierta ? 'verano' : 'gris');
  pic('autobus', x - 10, y + 30, 120, abierta ? 1 : 0.45);
  pic('reloj', x + 40, y - 60, 70, abierta ? 1 : 0.45);
}

// drawPueblo(x, y, abierta): el Pueblo de los Cuentos: tres casitas con libros de cuentos en el tejado.
function drawPueblo(x: number, y: number, abierta: boolean): void {
  ell(x, y + 30, 170, 100, abierta ? '#C9E7A8' : '#D8D2C8', 7);
  [
    [-90, 30],
    [0, -10],
    [90, 30],
  ].forEach(([a, b], i) => {
    const hx = x + (a as number),
      hy = y + (b as number);
    card(hx - 38, hy - 20, 76, 60, abierta ? '#FFF3D6' : '#E4DED6', 5, 6);
    ctx.beginPath();
    ctx.moveTo(hx - 48, hy - 20);
    ctx.lineTo(hx, hy - 62);
    ctx.lineTo(hx + 48, hy - 20);
    ctx.closePath();
    fillStroke(abierta ? (FLC[i] ?? '#FF8A7A') : '#B8B0A6', 5);
    pic('libro', hx, hy + 12, 40, abierta ? 1 : 0.45);
  });
}

// drawSitio(z, brilla): pinta el sitio z de la isla (con halo si es el de la casita que toca, «en obras» si aún no tiene
// casitas) y debajo su nombre corto con la edad.
function drawSitio(z: SitioIsla, brilla: boolean): void {
  const abierta = hecha(z.id) && zoneOpen(z.id),
    s = hv('ii:' + z.id, hC(z.x, z.y, z.r));
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.scale(s, s);
  ctx.translate(-z.x, -z.y);
  if (brilla) {
    const p = (Math.sin(T * 4) + 1) / 2;
    ctx.globalAlpha = 0.4 + 0.3 * p;
    circ(z.x, z.y, z.r + 10 + p * 10, null, 12, '#FFC93C');
    ctx.globalAlpha = 1;
  }
  if (z.id === 'playaHello') drawPlaya(z.x, z.y);
  else if (z.id === 'parqueLondres') drawParque(z.x, z.y, abierta);
  else drawPueblo(z.x, z.y, abierta);
  if (!hecha(z.id)) drawObras(z.x, z.y);
  card(z.x - 60, z.y + 104, 120, 46, abierta ? (['#FF8A7A', '#7CC86E', '#5B8DEF'][z.edad - 3] ?? K) : '#B8B0A6', 5, 23);
  text(z.edad + ' años', z.x, z.y + 137, 26, '#fff');
  ctx.restore();
}

// drawPolly(): Polly, la lorita, que se balancea y, de vez en cuando, dice «Hello!» en un bocadillo.
function drawPolly(): void {
  const s = hv('polly', hC(POLLY.x, POLLY.y, POLLY.s / 2));
  ctx.save();
  ctx.translate(POLLY.x, POLLY.y);
  ctx.rotate(Math.sin(T * 1.5) * 0.06);
  ctx.scale(s, s);
  pic('polly', 0, 0, POLLY.s);
  ctx.restore();
  if (Math.sin(T * 0.7) > 0.6) {
    card(POLLY.x + 60, POLLY.y - 140, 120, 52, '#fff', 5, 26);
    text('Hello!', POLLY.x + 120, POLLY.y - 104, 30, DIAC[3] ?? K, { f: LF });
  }
}

SCENES['islaIngles'] = {
  music: 'map',
  // enter(o): la primera vez, Tito presenta la isla y a Polly (S.first.islaIngles); si no, saluda corto si viene del mapa
  // (o.hello).
  enter(o: Libre) {
    if (!S.first['islaIngles']) {
      S.first['islaIngles'] = 1;
      save();
      later(500, () =>
        sayQ(
          `¡Llegamos a la Isla del Inglés${kid()}! Mira, es Polly, la lorita. Polly habla inglés y nos va a enseñar muchas palabras. Toca el botón verde para empezar.`,
        ),
      );
    } else if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna de la isla.
  prompt() {
    say('Toca el botón verde para seguir con el inglés. O toca una zona de la isla.');
  },
  // hint(): el botón de seguir.
  hint() {
    return { x: SEGUIR.x, y: SEGUIR.y, r: SEGUIR.r + 10 };
  },
  // dwell(id): dice el nombre de lo que hay bajo el ratón.
  dwell(id: string) {
    if (id === 'polly') {
      say('Polly, la lorita.');
      return;
    }
    if (id === 'seguir') {
      say('Seguir con el inglés.');
      return;
    }
    const z = ISLA_INGLES.find((x) => 'ii:' + x.id === id);
    if (z) say(cap(z.name) + '.');
  },
  // draw(): el mar y la isla, las zonas, Polly, el globo, el botón de seguir, la casa, las monedas y Tito.
  draw() {
    fondo();
    const t = nextIngles();
    for (const z of ISLA_INGLES) drawSitio(z, !!t && t.zone === z.id);
    drawPolly();
    {
      const s = hv('globoIsla', hC(GLOBO.x, GLOBO.y - 50, GLOBO.r));
      ctx.save();
      ctx.translate(GLOBO.x, GLOBO.y);
      ctx.scale(s, s);
      drawGloboIsla(0, 0);
      ctx.restore();
    }
    drawSeguir();
    drawHome();
    drawCoinHUD();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): casa o globo -> el mapa grande; Tito -> consigna; monedas -> tienda; seguir -> la casita de inglés que
  // toca; Polly -> se presenta (en inglés y en castellano); una zona hecha y abierta -> la zona; cerrada -> cuándo se
  // abre; en obras -> pronto.
  down(x: number, y: number) {
    if (atHome(x, y) || dist(x, y, GLOBO.x, GLOBO.y - 50) < GLOBO.r) {
      SFX.whoosh();
      go('map');
      return;
    }
    if (inTito(x, y)) {
      this.prompt!();
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (dist(x, y, SEGUIR.x, SEGUIR.y) < SEGUIR.r + 10) {
      SFX.pop();
      const t = nextIngles();
      if (t) go('casita', { t: t.id, hello: true });
      else say('¡Terminaste todo el inglés que hay por ahora! Puedes repetir lo que quieras.');
      return;
    }
    if (dist(x, y, POLLY.x, POLLY.y) < POLLY.s / 2) {
      SFX.boing();
      burst(POLLY.x, POLLY.y - 60, 16);
      say('Hello! Soy Polly, la lorita. Vivo en esta isla y hablo inglés. ¡Vamos a aprender juntos!');
      return;
    }
    const z = ISLA_INGLES.find((s) => dist(x, y, s.x, s.y) < s.r);
    if (z) {
      if (!hecha(z.id)) {
        SFX.boing();
        say(`Polly está preparando ${z.name}. ¡Muy pronto podrás jugar aquí!`);
        return;
      }
      if (!zoneOpen(z.id)) {
        SFX.boing();
        say(`${cap(z.name)} todavía no se ha abierto.`);
        return;
      }
      SFX.pop();
      go(z.id, { hello: true });
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
