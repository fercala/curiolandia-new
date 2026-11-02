/*
 * escenas/isla.ts: la Isla de las Letras (fase L2 de docs/PLAN-LECTURA.md), la escena SCENES.isla. Se llega desde el
 * muelle del mapa (MZ2 en escenas/zonas.ts) en barco. Es un mapa pequeño con las tres zonas de la isla, Lupi (la
 * lechuza de Letrilandia, que cuida las letras), el barco para volver y su propio botón verde de «seguir», que lleva a la
 * casita de letras que toca (nextLetra, con la regla siguienteLetra de dominio/apertura.ts).
 * Las zonas de la isla que ya tienen casitas son zonas de ZONES (la Playa de los Sonidos y, desde las fases L4 y L5, el
 * Bosque de las Letras y el Pueblo de las Palabras) y se abren como las principales (zoneOpen). Una zona que todavía no
 * tuviera casitas saldría «en obras»: al tocarla, Tito diría que Lupi la está preparando.
 * Es una escena 2D (la isla en 3D es la fase L6).
 * Exporta: ISLA (los sitios de la isla) y pone SCENES.isla al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito), las reglas y ayudas de escenas/zonas.ts (ZONES, zoneOpen, nextLetra,
 * drawSeguir y SEGUIR).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Libre } from '../juegos/tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DIAC, FLC, H, LF, PI, S, SCENES, SFX, T, TITO, W, atHome, burst, cap, card, circ, ctx, dist, drawCoinHUD, drawHome, drawTito, ell, fillStroke, go, hC, hv, inCoinHUD, inTito, kid, later, pic, save, say, sayQ, sparkles, text, tree } from '../nucleo/indice.ts';
import { SEGUIR, ZONES, drawSeguir, nextLetra, zoneOpen } from './zonas.ts';

/** Un sitio de la isla: zona (id de ZONAS_LETRAS), dónde está, radio tocable, nombre para la voz y su edad. */
interface SitioIsla {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly name: string;
  readonly edad: number;
}

// ISLA: las tres zonas de la isla, en el orden de las edades.
export const ISLA: readonly SitioIsla[] = [
  { id: 'playaSonidos', x: 430, y: 560, r: 150, name: 'la Playa de los Sonidos', edad: 3 },
  { id: 'bosqueLetras', x: 860, y: 330, r: 150, name: 'el Bosque de las Letras', edad: 4 },
  { id: 'puebloPalabras', x: 1240, y: 560, r: 150, name: 'el Pueblo de las Palabras', edad: 5 },
];
// BARCO: el barco para volver al mapa grande (abajo a la derecha). LUPI: dónde está Lupi, en el centro de la isla.
const BARCO = { x: 1440, y: 800, r: 90 };
const LUPI = { x: 860, y: 640, s: 170 };

// hecha(id): ¿tiene ya casitas la zona id? (si no, sale «en obras»).
const hecha = (id: string): boolean => !!ZONES[id];

// drawBarco(x, y, s): el barco de vela con la A, meciéndose en el agua.
function drawBarco(x: number, y: number, s: number): void {
  const b = Math.sin(T * 2) * 4;
  ctx.save(); ctx.translate(x, y + b); ctx.scale(s, s); ctx.rotate(Math.sin(T * 1.6) * .04);
  ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(80, 0); ctx.lineTo(56, 40); ctx.lineTo(-56, 40); ctx.closePath(); fillStroke('#C98A4B', 6);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.lineWidth = 6; ctx.strokeStyle = K; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -114); ctx.lineTo(70, -20); ctx.lineTo(6, -20); ctx.closePath(); fillStroke('#fff', 5);
  text('A', 30, -36, 52, '#E8554E', { f: LF });
  ctx.restore();
}

// drawPlaya(x, y): la Playa de los Sonidos: arena, una sombrilla, un castillo y las vocales que saltan.
function drawPlaya(x: number, y: number): void {
  ell(x, y + 20, 170, 110, '#FFE6A8', 7);
  pic('castillo', x - 70, y + 10, 120); pic('concha', x + 90, y + 60, 60);
  'AEIOU'.split('').forEach((l, i) => text(l, x - 100 + i * 50, y - 70 - Math.abs(Math.sin(T * 3 + i)) * 16, 46, DIAC[i] ?? K, { f: LF, st: 6, sc: '#fff' }));
}

// drawBosque(x, y, abierta): el Bosque de las Letras: árboles con letras colgando como frutas.
function drawBosque(x: number, y: number, abierta: boolean): void {
  ell(x, y + 30, 170, 100, abierta ? '#A8DC8F' : '#D8D2C8', 7);
  for (const [a, b, s] of [[-80, 50, .7], [0, 20, .85], [80, 50, .7]] as const) tree(x + a, y + b, s, abierta ? 'verano' : 'gris');
  'MPL'.split('').forEach((l, i) => text(l, x - 80 + i * 80, y - 30 + (i % 2) * 20, 36, abierta ? '#E8554E' : '#9A9086', { f: LF, st: 5, sc: '#fff' }));
}

// drawPueblo(x, y, abierta): el Pueblo de las Palabras: tres casitas con letras en el tejado.
function drawPueblo(x: number, y: number, abierta: boolean): void {
  ell(x, y + 30, 170, 100, abierta ? '#C9E7A8' : '#D8D2C8', 7);
  [[-90, 30, 'SOL'], [0, -10, 'PAN'], [90, 30, 'LUZ']].forEach(([a, b, w], i) => {
    const hx = x + (a as number), hy = y + (b as number);
    card(hx - 38, hy - 20, 76, 60, abierta ? '#FFF3D6' : '#E4DED6', 5, 6);
    ctx.beginPath(); ctx.moveTo(hx - 48, hy - 20); ctx.lineTo(hx, hy - 62); ctx.lineTo(hx + 48, hy - 20); ctx.closePath(); fillStroke(abierta ? FLC[i] ?? '#FF8A7A' : '#B8B0A6', 5);
    text(w as string, hx, hy + 22, 22, K, { f: LF });
  });
}

// drawObras(x, y): lo que aún está «en obras»: una valla de rayas y un cartel de «¡Muy pronto!».
function drawObras(x: number, y: number): void {
  for (let i = 0; i < 4; i++) card(x - 110 + i * 56, y + 70, 48, 26, i % 2 ? '#fff' : '#FFA94D', 4, 6);
  card(x - 90, y - 150, 180, 50, '#FFD66B', 5, 25); text('¡Muy pronto!', x, y - 114, 28, K);
}

// drawSitio(z): pinta el sitio z de la isla (con halo si es el de su edad y está abierto, candado si está cerrado,
// «en obras» si aún no tiene casitas) y debajo su nombre corto con la edad.
function drawSitio(z: SitioIsla, brilla: boolean): void {
  const abierta = hecha(z.id) && zoneOpen(z.id), s = hv('is:' + z.id, hC(z.x, z.y, z.r));
  ctx.save(); ctx.translate(z.x, z.y); ctx.scale(s, s); ctx.translate(-z.x, -z.y);
  if (brilla) { const p = (Math.sin(T * 4) + 1) / 2; ctx.globalAlpha = .4 + .3 * p; circ(z.x, z.y, z.r + 10 + p * 10, null, 12, '#FFC93C'); ctx.globalAlpha = 1; }
  if (z.id === 'playaSonidos') drawPlaya(z.x, z.y);
  else if (z.id === 'bosqueLetras') drawBosque(z.x, z.y, abierta);
  else drawPueblo(z.x, z.y, abierta);
  if (!hecha(z.id)) drawObras(z.x, z.y);
  card(z.x - 60, z.y + 104, 120, 46, abierta ? ['#FF8A7A', '#7CC86E', '#5B8DEF'][z.edad - 3] ?? K : '#B8B0A6', 5, 23);
  text(z.edad + ' años', z.x, z.y + 137, 26, '#fff');
  ctx.restore();
}

// fondo(): el mar con olas y la isla de arena y hierba.
function fondo(): void {
  ctx.fillStyle = '#7FD3F0'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) {
    const x = (i * 263) % 1600, y = 60 + (i * 151) % 800;
    ctx.beginPath(); ctx.moveTo(x + Math.sin(T + i) * 10, y); ctx.quadraticCurveTo(x + 20, y - 14, x + 40, y); ctx.quadraticCurveTo(x + 60, y + 14, x + 80, y);
    ctx.lineWidth = 6; ctx.strokeStyle = '#B9E9F8'; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(830, 500, 640, 370, 0, 0, PI * 2); ctx.fillStyle = '#FFE9B8'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(830, 480, 580, 320, 0, 0, PI * 2); fillStroke('#C8EBAA', 7);
}

// drawLupi(): Lupi, la lechuza, que se balancea un poco y parpadea con su libro.
function drawLupi(): void {
  const s = hv('lupi', hC(LUPI.x, LUPI.y, LUPI.s / 2));
  ctx.save(); ctx.translate(LUPI.x, LUPI.y); ctx.rotate(Math.sin(T * 1.5) * .05); ctx.scale(s, s); pic('lupi', 0, 0, LUPI.s); ctx.restore();
}

SCENES['isla'] = {
  music: 'map',
  // enter(o): la primera vez, Tito presenta la isla y a Lupi (S.first.isla); si no, saluda corto si viene del mapa
  // (o.hello).
  enter(o: Libre) {
    if (!S.first['isla']) { S.first['isla'] = 1; save(); later(500, () => sayQ(`¡Llegamos a la Isla de las Letras${kid()}! Mira, es Lupi, la lechuza que cuida las letras. Aquí vamos a aprender a leer. Toca el botón verde para empezar.`)); }
    else if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna de la isla.
  prompt() { say('Toca el botón verde para seguir con las letras. O toca una zona de la isla.'); },
  // hint(): el botón de seguir.
  hint() { return { x: SEGUIR.x, y: SEGUIR.y, r: SEGUIR.r + 10 }; },
  // dwell(id): dice el nombre de lo que hay bajo el ratón.
  dwell(id: string) {
    if (id === 'lupi') { say('Lupi, la lechuza.'); return; }
    if (id === 'seguir') { say('Seguir con las letras.'); return; }
    const z = ISLA.find((x) => 'is:' + x.id === id); if (z) say(cap(z.name) + '.');
  },
  // draw(): el mar y la isla, las zonas, Lupi, el barco, el botón de seguir, la casa, las monedas y Tito.
  draw() {
    fondo();
    const t = nextLetra();
    for (const z of ISLA) drawSitio(z, !!t && t.zone === z.id);
    drawLupi();
    { const s = hv('barco', hC(BARCO.x, BARCO.y, BARCO.r)); drawBarco(BARCO.x, BARCO.y, s); }
    drawSeguir(); drawHome(); drawCoinHUD(); drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): casa o barco -> el mapa grande; Tito -> consigna; monedas -> tienda; seguir -> la casita de letras
  // que toca; Lupi -> se presenta; una zona hecha y abierta -> la zona; cerrada -> cuándo se abre; en obras -> pronto.
  down(x: number, y: number) {
    if (atHome(x, y) || dist(x, y, BARCO.x, BARCO.y) < BARCO.r) { SFX.whoosh(); go('map'); return; }
    if (inTito(x, y)) { this.prompt!(); return; }
    if (inCoinHUD(x, y)) { SFX.pop(); go('tienda'); return; }
    if (dist(x, y, SEGUIR.x, SEGUIR.y) < SEGUIR.r + 10) {
      SFX.pop(); const t = nextLetra();
      if (t) go('casita', { t: t.id, hello: true }); else say('¡Terminaste todas las letras que hay por ahora! Puedes repetir las que quieras.');
      return;
    }
    if (dist(x, y, LUPI.x, LUPI.y) < LUPI.s / 2) { SFX.boing(); burst(LUPI.x, LUPI.y - 60, 16); say('¡Hola! Soy Lupi, la lechuza. Cuido las letras de esta isla. ¡Vamos a aprenderlas juntos!'); return; }
    const z = ISLA.find((s) => dist(x, y, s.x, s.y) < s.r);
    if (z) {
      if (!hecha(z.id)) { SFX.boing(); say(`Lupi está preparando ${z.name}. ¡Muy pronto podrás jugar aquí!`); return; }
      if (!zoneOpen(z.id)) { SFX.boing(); say(`${cap(z.name)} todavía no se ha abierto.`); return; }
      SFX.pop(); go(z.id, { hello: true }); return;
    }
    SFX.tap(); sparkles(x, y);
  },
};
