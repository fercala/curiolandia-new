/*
 * escenas/granjaTalleres.ts: el resto de las estaciones de la granja escuela (idea 1 de docs/IDEAS-MEJORA.md, fase P6),
 * las que se hacen con las manos: hacer queso (SCENES.granjaQueso), cepillar al caballo (SCENES.granjaCepillar), el
 * huerto (SCENES.granjaHuerto) y el paseo en tractor (SCENES.granjaTractor). Como las de escenas/granja.ts, se llega
 * desde el plano de la excursión (escenas/excursion.ts) y, al terminar, se vuelve a él con volverDeEstacion. Sin fallos
 * ni prisa: lo que no toca, no pasa nada.
 * - Hacer queso: tres pasos seguidos. Ordeñar a la vaca (tocar la ubre, la leche cae al cubo), remover la leche en la
 *   olla (dar vueltas con el dedo) hasta que se pone espesa y apretarla en el molde (tocar la prensa) hasta que sale el queso.
 * - Cepillar al caballo: el caballo tiene manchas de barro (4, 6 u 8 según la edad); se frota cada una con el cepillo
 *   (el dedo) hasta que se va. Limpio, relincha contento.
 * - El huerto: unos hoyos en la tierra (3, 4 o 5 según la edad). Primero se siembra (tocar cada hoyo), luego se riega
 *   (tocar cada uno otra vez), pasa el tiempo, crecen y se arrancan las zanahorias, que van a la cesta y se cuentan.
 * - El paseo en tractor: por el campo hay balas de paja (3, 4 o 5 según la edad); se toca una y el tractor va hasta
 *   ella y la sube al remolque. Con todas, el tractor se las lleva al granero.
 * Exporta: QUESO (dónde está cada cosa del queso) y ESTADO_TALLERES (el estado de las cuatro, para las pruebas,
 * docs/CONTRATO-PRUEBAS.md); pone SCENES.granjaQueso, granjaCepillar, granjaHuerto y granjaTractor al cargarse.
 * Importa: el núcleo (dibujo, voz, sonido, toque), NUM de juegos/, fondoGranja y volverDeEstacion de
 * escenas/excursion.ts, dibujaCuerpo de escenas/granjaAnimales.ts (desde la P7) y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  SCENES,
  SFX,
  T,
  W,
  atHome,
  burst,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  go,
  later,
  noise,
  pic,
  playSound,
  say,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { NUM } from '../juegos/indice.ts';
import { fondoGranja, volverDeEstacion } from './excursion.ts';
import { dibujaCuerpo } from './granjaAnimales.ts';
import { azar } from '../aplicacion/puertos.ts';

// edad35(): la edad del niño entre 3 y 5 (para elegir cuántas cosas hay en cada estación).
const edad35 = (): number => Math.min(5, Math.max(3, AGE()));

// alPlano(x, y): si se ha tocado la casa (arriba a la izquierda), vuelve al plano de la excursión. Devuelve si ha vuelto.
function alPlano(x: number, y: number): boolean {
  if (!atHome(x, y)) return false;
  SFX.whoosh();
  go('excursion', { exc: 'granja' });
  return true;
}

// dibujaMarco(): lo común de encima de cada estación: Tito, la casa y las monedas.
function dibujaMarco(): void {
  drawTito(14, 720, 170);
  drawHome();
  drawCoinHUD();
}

// toqueSuelto(x, y): un toque donde no hay nada: un clic suave y chispas.
function toqueSuelto(x: number, y: number): void {
  SFX.tap();
  sparkles(x, y);
}

/* ---------- hacer queso ---------- */

// QUESO: dónde está cada cosa: la vaca, su ubre (lo que se toca para ordeñar), el cubo, la olla y el molde con su prensa.
export const QUESO = {
  vaca: { x: 520, y: 440 },
  ubre: { x: 560, y: 560 },
  cubo: { x: 560, y: 770 },
  olla: { x: 1080, y: 620 },
  molde: { x: 1080, y: 640 },
};
// ORDENOS: cuántos chorros de leche llenan el cubo; VUELTAS_QUESO: cuánto hay que remover (en radianes, 3 vueltas);
// PRENSADOS: cuántas veces se aprieta el molde.
const ORDENOS = 5,
  VUELTAS_QUESO = Math.PI * 2 * 3,
  PRENSADOS = 4;
// PASOS_QUESO: lo que dice Tito al empezar cada paso (0 ordeñar, 1 remover, 2 apretar).
const PASOS_QUESO: readonly string[] = [
  'Primero, ordeñamos a la vaca. Toca la ubre para que caiga la leche en el cubo.',
  '¡El cubo está lleno de leche! Ahora la echamos en la olla. Remueve: da vueltas con el dedo dentro de la olla.',
  '¡La leche se ha puesto espesa! La metemos en el molde. Toca la prensa para apretar.',
];
// queso: el estado de la estación: el paso (0 a 2, y 3 al terminar), los chorros, lo removido, el ángulo del dedo al
// remover (null si no remueve), las veces apretado y cuándo se ha tocado lo último (para animarlo).
const queso = { paso: 0, chorros: 0, giro: 0, ang: null as number | null, prensa: 0, toque: -9, fin: false };

// pasoQueso(n): pasa al paso n del queso y lo explica (con el paso 3, el queso está hecho y se vuelve al plano).
function pasoQueso(n: number): void {
  queso.paso = n;
  queso.toque = -9;
  if (n < 3) {
    later(500, () => say(PASOS_QUESO[n] ?? ''));
    return;
  }
  queso.fin = true;
  SFX.tada();
  burst(QUESO.molde.x, QUESO.molde.y - 80, 40);
  later(600, () =>
    say('¡Ya tenemos queso! La leche de la vaca se ha convertido en queso. ¡Qué rico!', () =>
      volverDeEstacion('granja', 'queso'),
    ),
  );
}

// dibujaUbre(x, y, k): la ubre rosa de la vaca con sus cuatro pezones (se encoge un poco al tocarla, k de 0 a 1).
function dibujaUbre(x: number, y: number, k: number): void {
  ctx.save();
  ctx.fillStyle = '#F6A9B8';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, y, 60 - k * 6, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  [-36, -12, 12, 36].forEach((d) => {
    ctx.beginPath();
    ctx.ellipse(x + d, y + 36 + k * 6, 8, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

// dibujaRecipiente(x, y, w, h, color, nivel): un recipiente redondo visto de lado (el cubo o la olla) con su leche
// dentro hasta el nivel (0 a 1).
function dibujaRecipiente(x: number, y: number, w: number, h: number, color: string, nivel: number): void {
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h / 2);
  ctx.lineTo(x + w / 2, y - h / 2);
  ctx.lineTo(x + w * 0.42, y + h / 2);
  ctx.lineTo(x - w * 0.42, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (nivel > 0) {
    ctx.fillStyle = '#FFFDF3';
    ctx.beginPath();
    ctx.ellipse(x, y - h / 2 + h * (1 - nivel) * 0.8 + 12, w * 0.44, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(x, y - h / 2, w / 2, 20, 0, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
}

// dibujaOrdenar(): el paso de ordeñar: la vaca, su ubre, el chorro que cae si se acaba de tocar y el cubo llenándose.
function dibujaOrdenar(): void {
  const t = T - queso.toque,
    k = Math.max(0, 1 - t * 3);
  dibujaCuerpo(QUESO.vaca.x, QUESO.vaca.y, 380, 170, '#FFFFFF', 'vaca', 240);
  dibujaUbre(QUESO.ubre.x, QUESO.ubre.y, k);
  if (t < 0.5) {
    ctx.save();
    ctx.strokeStyle = '#FFFDF3';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(QUESO.ubre.x, QUESO.ubre.y + 55);
    ctx.lineTo(QUESO.ubre.x, QUESO.ubre.y + 55 + Math.min(1, t * 4) * 120);
    ctx.stroke();
    ctx.restore();
  }
  dibujaRecipiente(QUESO.cubo.x, QUESO.cubo.y, 170, 140, '#B8C4D0', queso.chorros / ORDENOS);
  text(`${queso.chorros} / ${ORDENOS}`, QUESO.cubo.x + 160, QUESO.cubo.y + 20, 44, '#4A3B2A');
}

// dibujaRemover(): el paso de remover: la olla con la leche, que da vueltas con el dedo, y la cuchara; mientras no se
// remueve, una flecha en círculo enseña el gesto.
function dibujaRemover(): void {
  const o = QUESO.olla,
    hecho = Math.min(1, queso.giro / VUELTAS_QUESO);
  card(o.x - 230, o.y + 90, 460, 40, '#7A5A3A', 0, 10);
  dibujaRecipiente(o.x, o.y, 340, 220, '#8C97A6', 0.85);
  // La leche se va poniendo espesa y amarillenta al remover.
  ctx.save();
  ctx.fillStyle = `rgba(250,226,150,${hecho * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(o.x, o.y - 110 + 0.15 * 220 * 0.8 + 12, 340 * 0.44, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const a = queso.ang ?? T * 2;
  ctx.save();
  ctx.strokeStyle = '#9C6B3E';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(o.x + Math.cos(a) * 90, o.y - 80 + Math.sin(a) * 12);
  ctx.lineTo(o.x + Math.cos(a) * 60, o.y - 260);
  ctx.stroke();
  ctx.restore();
  if (queso.ang === null) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 8;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.ellipse(o.x, o.y - 80, 150, 50, 0, T * 2, T * 2 + Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();
  }
  card(o.x - 160, o.y + 150, 320, 26, '#fff', 4, 13);
  card(o.x - 156, o.y + 154, 312 * hecho, 18, '#FFD54A', 0, 9);
}

// dibujaPrensar(): el paso de apretar: el molde de madera con la cuajada, la prensa que baja al tocarla y, al final, el queso.
function dibujaPrensar(): void {
  const m = QUESO.molde,
    k = Math.max(0, 1 - (T - queso.toque) * 3),
    baja = (queso.prensa / PRENSADOS) * 50 + k * 30;
  if (queso.fin) {
    pic('queso', m.x, m.y - 60, 300 + Math.sin(T * 4) * 8);
    return;
  }
  card(m.x - 150, m.y - 60, 300, 140, '#C8935A', 6, 16);
  card(m.x - 120, m.y - 50 + baja * 0.6, 240, 110 - baja * 0.6, '#FFF3C4', 4, 12);
  // La prensa: una tabla con su mango, que baja un poco con cada apretón.
  card(m.x - 130, m.y - 120 + baja, 260, 40, '#9C6B3E', 6, 10);
  card(m.x - 16, m.y - 250 + baja, 32, 140, '#7A5A3A', 6, 10);
  circ(m.x, m.y - 260 + baja, 34, '#E8554E', 6);
  text(`${queso.prensa} / ${PRENSADOS}`, m.x + 230, m.y, 44, '#4A3B2A');
}

SCENES['granjaQueso'] = {
  music: 'jardin',
  // enter(): empieza por ordeñar.
  enter(_o: OpcionesEscena) {
    Object.assign(queso, { chorros: 0, giro: 0, ang: null, prensa: 0, fin: false });
    later(300, () => say('¡Vamos a hacer queso con la leche de la vaca!'));
    pasoQueso(0);
  },
  // prompt(): la consigna del paso en el que se está.
  prompt() {
    if (!queso.fin) say(PASOS_QUESO[queso.paso] ?? '');
  },
  // hint(): lo que hay que tocar en cada paso: la ubre, la olla (con el gesto de dar vueltas) o la prensa.
  hint() {
    if (queso.fin) return null;
    const sitios = [
      { x: QUESO.ubre.x, y: QUESO.ubre.y, r: 80 },
      { x: QUESO.olla.x, y: QUESO.olla.y - 80, r: 150 },
      { x: QUESO.molde.x, y: QUESO.molde.y - 200, r: 90 },
    ];
    return sitios[queso.paso] ?? null;
  },
  // draw(): la granja y el paso en el que se está.
  draw() {
    fondoGranja();
    const pasos = [dibujaOrdenar, dibujaRemover, dibujaPrensar, dibujaPrensar];
    pasos[queso.paso]?.();
    dibujaMarco();
  },
  // down(x, y): casa -> el plano; en cada paso, lo suyo: la ubre da un chorro, en la olla se empieza a remover y la prensa aprieta.
  down(x: number, y: number) {
    if (alPlano(x, y) || queso.fin) return;
    if (queso.paso === 0 && dist(x, y, QUESO.ubre.x, QUESO.ubre.y + 20) < 110) {
      queso.chorros++;
      queso.toque = T;
      SFX.drip();
      if (queso.chorros === 1) playSound('vaca');
      if (queso.chorros >= ORDENOS) pasoQueso(1);
      return;
    }
    if (queso.paso === 1 && Math.abs(x - QUESO.olla.x) < 200 && Math.abs(y - (QUESO.olla.y - 80)) < 160) {
      queso.ang = Math.atan2(y - (QUESO.olla.y - 80), x - QUESO.olla.x);
      return;
    }
    if (queso.paso === 2 && Math.abs(x - QUESO.molde.x) < 160 && y > QUESO.molde.y - 300 && y < QUESO.molde.y + 80) {
      queso.prensa++;
      queso.toque = T;
      SFX.pop();
      noise(0.15, 0.2, 600);
      if (queso.prensa >= PRENSADOS) pasoQueso(3);
      return;
    }
    toqueSuelto(x, y);
  },
  // move(x, y): removiendo, suma lo que gira el dedo alrededor del centro de la olla; con tres vueltas, al molde.
  move(x: number, y: number) {
    if (queso.paso !== 1 || queso.ang === null) return;
    const a = Math.atan2(y - (QUESO.olla.y - 80), x - QUESO.olla.x),
      d = a - queso.ang,
      // el salto de -π a π (o al revés) no es una vuelta entera: se corrige
      dd = d - Math.round(d / (Math.PI * 2)) * Math.PI * 2;
    queso.giro += Math.abs(dd);
    queso.ang = a;
    if (queso.giro < VUELTAS_QUESO) return;
    queso.ang = null;
    SFX.good();
    pasoQueso(2);
  },
  // up(): deja de remover.
  up() {
    queso.ang = null;
  },
};

/* ---------- cepillar al caballo ---------- */

/** Una mancha de barro del caballo: dónde está y cuánto barro le queda (de 1 a 0). */
interface Mancha {
  readonly x: number;
  readonly y: number;
  barro: number;
}
// CABALLO: dónde está el caballo (centro) y su tamaño.
const CABALLO = { x: 900, y: 500 };
// MANCHAS_POR_EDAD: cuántas manchas de barro tiene el caballo según la edad (3, 4 y 5 años).
const MANCHAS_POR_EDAD: Readonly<Record<number, number>> = { 3: 4, 4: 6, 5: 8 };
// FROTE: cuánto hay que mover el dedo sobre una mancha para quitarla (en puntos de la pantalla).
const FROTE = 420;
// cepillo: el estado de la estación: las manchas, si se está cepillando, dónde está el cepillo y si ya se ha terminado.
const cepillo = { manchas: [] as Mancha[], frota: false, x: 0, y: 0, fin: false, finT: -9 };

// prepararCepillar(): pone las manchas de barro repartidas por el cuerpo del caballo, sin amontonarse.
function prepararCepillar(): void {
  const n = MANCHAS_POR_EDAD[edad35()] ?? 6;
  cepillo.manchas = Array.from({ length: n }, (_, i) => ({
    x: CABALLO.x - 150 + (i % 4) * 100 + (azar() - 0.5) * 30,
    y: CABALLO.y - 35 + Math.floor(i / 4) * 75 + (azar() - 0.5) * 20,
    barro: 1,
  }));
  Object.assign(cepillo, { frota: false, fin: false, finT: -9 });
}

// frotar(x, y, d): el cepillo pasa por (x, y) habiendo recorrido d: quita barro de la mancha que haya debajo; si se
// queda limpia, chispas; con todas limpias, el caballo relincha y se vuelve al plano.
function frotar(x: number, y: number, d: number): void {
  Object.assign(cepillo, { x, y });
  const m = cepillo.manchas.find((z) => z.barro > 0 && dist(x, y, z.x, z.y) < 75);
  if (!m) return;
  m.barro = Math.max(0, m.barro - d / FROTE);
  if (azar() < 0.15) noise(0.08, 0.12, 3000);
  if (m.barro > 0) return;
  SFX.sparkle();
  sparkles(m.x, m.y, 10);
  if (cepillo.manchas.some((z) => z.barro > 0)) return;
  Object.assign(cepillo, { fin: true, finT: T, frota: false });
  playSound('caballo');
  burst(CABALLO.x, CABALLO.y - 100, 30);
  later(900, () =>
    say('¡Qué limpio y brillante está el caballo! Le ha encantado que lo cepilles.', () =>
      volverDeEstacion('granja', 'cepillar'),
    ),
  );
}

SCENES['granjaCepillar'] = {
  music: 'jardin',
  // enter(): ensucia al caballo y explica qué hay que hacer.
  enter(_o: OpcionesEscena) {
    prepararCepillar();
    later(400, () =>
      say('¡Oh! El caballo se ha revolcado en el barro. Frota las manchas con el cepillo para dejarlo limpio.'),
    );
  },
  // prompt(): la consigna.
  prompt() {
    say('Frota las manchas de barro con el dedo.');
  },
  // hint(): una mancha que aún tiene barro, con el gesto de frotar (ir y venir).
  hint() {
    const m = cepillo.manchas.find((z) => z.barro > 0);
    return m && !cepillo.fin ? { x: m.x - 40, y: m.y, r: 70, dx: 80, dy: 0 } : null;
  },
  // draw(): el caballo (que da un saltito de contento al final), sus manchas (más claras cuanto menos barro) y el
  // cepillo en el dedo mientras se frota.
  draw() {
    fondoGranja();
    const salto = cepillo.fin ? Math.abs(Math.sin((T - cepillo.finT) * 6)) * 20 : 0;
    ctx.save();
    ctx.translate(0, -salto);
    dibujaCuerpo(CABALLO.x, CABALLO.y, 420, 190, '#B9773E', 'caballo', 330);
    ctx.restore();
    cepillo.manchas
      .filter((m) => m.barro > 0)
      .forEach((m) => {
        ctx.save();
        ctx.globalAlpha = 0.25 + m.barro * 0.75;
        circ(m.x, m.y, 38, '#7A5230', 0);
        circ(m.x + 22, m.y - 14, 20, '#7A5230', 0);
        circ(m.x - 20, m.y + 16, 16, '#7A5230', 0);
        ctx.restore();
      });
    if (cepillo.fin) sparkles(CABALLO.x + (azar() - 0.5) * 300, CABALLO.y + (azar() - 0.5) * 200, 1);
    if (cepillo.frota) pic('cepillo', cepillo.x, cepillo.y, 130);
    else pic('cepillo', 1400, 760, 130);
    dibujaMarco();
  },
  // down(x, y): casa -> el plano; si no, se empieza a cepillar donde está el dedo.
  down(x: number, y: number) {
    if (alPlano(x, y) || cepillo.fin) return;
    cepillo.frota = true;
    frotar(x, y, 0);
  },
  // move(x, y): cepillando, frota lo que haya debajo del dedo según lo que se ha movido.
  move(x: number, y: number) {
    if (!cepillo.frota) return;
    frotar(x, y, dist(x, y, cepillo.x, cepillo.y));
  },
  // up(): deja de cepillar.
  up() {
    cepillo.frota = false;
  },
};

/* ---------- el huerto ---------- */

/** Un hoyo del huerto: dónde está, cómo va (0 hoyo, 1 sembrado, 2 regado, 3 crecido, 4 recogido) y cuándo se tocó. */
interface Hoyo {
  readonly x: number;
  readonly y: number;
  etapa: number;
  t: number;
}
// CESTA_HUERTO: dónde está la cesta de las zanahorias.
const CESTA_HUERTO = { x: 1380, y: 770 };
// FASES_HUERTO: lo que dice Tito al empezar cada fase (0 sembrar, 1 regar, 3 recoger; en la 2 crecen solas).
const FASES_HUERTO: Readonly<Record<number, string>> = {
  0: 'Vamos a plantar zanahorias. Toca cada hoyo para echar una semilla.',
  1: '¡Ya está todo sembrado! Ahora hay que regar. Toca cada hoyo para echarle agua.',
  3: '¡Mira cuánto han crecido! Toca las zanahorias para arrancarlas.',
};
// huerto: el estado de la estación: los hoyos, la fase (la etapa a la que se lleva ahora cada hoyo menos uno), las
// zanahorias recogidas y si ya se ha terminado.
const huerto = { hoyos: [] as Hoyo[], fase: 0, cogidas: 0, fin: false };

// prepararHuerto(): hace los hoyos (3, 4 o 5 según la edad) en un surco.
function prepararHuerto(): void {
  const n = edad35(),
    paso = 1100 / n;
  huerto.hoyos = Array.from({ length: n }, (_, i) => ({ x: 280 + paso * (i + 0.5), y: 600, etapa: 0, t: -9 }));
  Object.assign(huerto, { fase: 0, cogidas: 0, fin: false });
}

// faseHuerto(n): pasa a la fase n y la explica. Al acabar de regar (fase 2), pasa un rato y las zanahorias crecen solas
// (fase 3); al recoger todas, a casa.
function faseHuerto(n: number): void {
  huerto.fase = n;
  if (n === 2) {
    later(700, () =>
      say('Ahora el sol las calienta y el agua las alimenta. Esperamos un poquito...', () => {
        huerto.hoyos.forEach((h) => Object.assign(h, { etapa: 3, t: T }));
        SFX.sparkle();
        faseHuerto(3);
      }),
    );
    return;
  }
  if (n === 4) {
    huerto.fin = true;
    SFX.tada();
    later(800, () =>
      say(`¡Hemos recogido ${NUM[huerto.cogidas]} zanahorias del huerto! ¡Qué buena cosecha!`, () =>
        volverDeEstacion('granja', 'huerto'),
      ),
    );
    return;
  }
  say(FASES_HUERTO[n] ?? '');
}

// dibujaHoyo(h): el hoyo según su etapa: tierra, el montoncito con la semilla, el brote regado (con gotas si se acaba
// de regar), las hojas de la zanahoria crecida y, recogida, la zanahoria volando a la cesta.
function dibujaHoyo(h: Hoyo): void {
  const t = T - h.t;
  ctx.save();
  ctx.fillStyle = '#6B4A2E';
  ctx.beginPath();
  ctx.ellipse(h.x, h.y, 80, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (h.etapa === 1) circ(h.x, h.y - 8, 18, '#8A5A3A', 4);
  if (h.etapa === 1 && t < 0.6) pic('semilla', h.x, h.y - 120 + Math.min(1, t * 2) * 100, 50);
  if (h.etapa === 2) {
    pic('brote', h.x, h.y - 40, 90);
    if (t < 1) pic('regadera', h.x - 70, h.y - 150, 140);
    if (t < 1)
      Array.from({ length: 4 }, (_, i) => i).forEach((i) =>
        pic('gota', h.x + 20 - i * 14, h.y - 70 + ((t * 300 + i * 40) % 80), 30),
      );
  }
  if (h.etapa === 3) {
    const crece = Math.min(1, t * 2);
    pic('zanahoria', h.x, h.y - 30 - crece * 20, 90 + crece * 50);
  }
  if (h.etapa === 4 && t < 0.8) {
    const k = t / 0.8;
    pic(
      'zanahoria',
      h.x + (CESTA_HUERTO.x - h.x) * k,
      h.y - 60 + (CESTA_HUERTO.y - 60 - h.y) * k - Math.sin(k * Math.PI) * 220,
      110,
    );
  }
}

// dibujaCestaHuerto(): la cesta con las zanahorias recogidas y su número.
function dibujaCestaHuerto(): void {
  Array.from({ length: huerto.cogidas }, (_, i) => i).forEach((i) =>
    pic('zanahoria', CESTA_HUERTO.x - 80 + (i % 3) * 70, CESTA_HUERTO.y - 50 - Math.floor(i / 3) * 40, 90),
  );
  card(CESTA_HUERTO.x - 140, CESTA_HUERTO.y - 30, 280, 100, '#C8935A', 6, 18);
  if (huerto.cogidas) text(String(huerto.cogidas), CESTA_HUERTO.x, CESTA_HUERTO.y + 42, 56, '#fff');
}

SCENES['granjaHuerto'] = {
  music: 'jardin',
  // enter(): hace los hoyos y empieza por sembrar.
  enter(_o: OpcionesEscena) {
    prepararHuerto();
    later(400, () => faseHuerto(0));
  },
  // prompt(): la consigna de la fase.
  prompt() {
    if (!huerto.fin && huerto.fase !== 2) say(FASES_HUERTO[huerto.fase] ?? '');
  },
  // hint(): un hoyo que aún no ha pasado por lo que toca ahora (sembrar, regar o recoger).
  hint() {
    const h = huerto.hoyos.find((z) => z.etapa === huerto.fase);
    return h && !huerto.fin && huerto.fase !== 2 ? { x: h.x, y: h.y - 30, r: 90 } : null;
  },
  // draw(): la granja con la tierra del huerto, el sol (que brilla más mientras crecen), los hoyos y la cesta.
  draw() {
    fondoGranja();
    card(180, 500, 1240, 200, '#8A6440', 0, 30);
    pic('sol', 1120, 130, huerto.fase === 2 ? 200 + Math.sin(T * 6) * 20 : 150);
    huerto.hoyos.forEach(dibujaHoyo);
    dibujaCestaHuerto();
    dibujaMarco();
  },
  // down(x, y): casa -> el plano; un hoyo al que le toca lo de ahora -> se siembra, se riega o se arranca su zanahoria.
  down(x: number, y: number) {
    if (alPlano(x, y) || huerto.fin || huerto.fase === 2) return;
    const h = huerto.hoyos.find((z) => z.etapa === huerto.fase && dist(x, y, z.x, z.y - 30) < 100);
    if (!h) {
      toqueSuelto(x, y);
      return;
    }
    Object.assign(h, { etapa: h.etapa + 1, t: T });
    const sonidos = [SFX.dig, SFX.drip, SFX.drip, SFX.pop];
    sonidos[huerto.fase]?.();
    if (huerto.fase === 3) {
      huerto.cogidas++;
      say(NUM[huerto.cogidas] ?? String(huerto.cogidas));
    }
    if (huerto.hoyos.every((z) => z.etapa > huerto.fase)) faseHuerto(huerto.fase === 3 ? 4 : huerto.fase + 1);
  },
};

/* ---------- el paseo en tractor ---------- */

/** Una bala de paja del campo: dónde está y si ya está en el remolque (y en qué puesto). */
interface Bala {
  readonly x: number;
  readonly y: number;
  subida: number;
}
// CAMINO_Y: la altura del camino por el que va el tractor; REMOLQUE: cuánto queda el remolque detrás del tractor.
const CAMINO_Y = 560,
  REMOLQUE = 230;
// tractor: el estado de la estación: dónde está el tractor y a dónde va, la bala a la que va, las balas, las subidas y
// si ya se ha terminado (entonces se va hacia la derecha).
const tractor = {
  x: 380,
  meta: 380,
  va: null as Bala | null,
  balas: [] as Bala[],
  subidas: 0,
  fin: false,
  ultimo: 0,
};

// prepararTractor(): pone el tractor a la izquierda y las balas (3, 4 o 5 según la edad) por el campo, a la derecha.
function prepararTractor(): void {
  const n = edad35(),
    paso = 900 / n;
  tractor.balas = Array.from({ length: n }, (_, i) => ({
    x: 640 + paso * i + azar() * 60,
    y: CAMINO_Y + 150 + (i % 2) * 40,
    subida: -1,
  }));
  Object.assign(tractor, { x: 380, meta: 380, va: null, subidas: 0, fin: false, ultimo: T });
}

// subirBala(b): el tractor ha llegado a la bala b: sube al remolque y se cuenta; con todas, el tractor se va al granero.
function subirBala(b: Bala): void {
  Object.assign(b, { subida: tractor.subidas });
  tractor.subidas++;
  tractor.va = null;
  SFX.good();
  say(NUM[tractor.subidas] ?? String(tractor.subidas));
  if (tractor.balas.some((z) => z.subida < 0)) return;
  tractor.fin = true;
  later(900, () => {
    playSound('tractor');
    tractor.meta = W + 500;
    say(`¡${NUM[tractor.subidas]} balas de paja! Nos las llevamos al granero para los animales.`, () =>
      volverDeEstacion('granja', 'tractor'),
    );
  });
}

// dibujaRemolque(x): el remolque detrás del tractor (que está en x) con las balas subidas apiladas.
function dibujaRemolque(x: number): void {
  const rx = x - REMOLQUE;
  card(rx - 110, CAMINO_Y - 20, 220, 60, '#B5643C', 6, 8);
  circ(rx - 60, CAMINO_Y + 50, 28, '#5B5F6B', 6);
  circ(rx + 60, CAMINO_Y + 50, 28, '#5B5F6B', 6);
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(rx + 110, CAMINO_Y + 10);
  ctx.lineTo(x - 70, CAMINO_Y + 10);
  ctx.stroke();
  ctx.restore();
  tractor.balas
    .filter((b) => b.subida >= 0)
    .forEach((b) => dibujaBala(rx - 60 + (b.subida % 3) * 60, CAMINO_Y - 50 - Math.floor(b.subida / 3) * 50, 0.6));
}

// dibujaBala(x, y, k): una bala de paja (k, su tamaño: 1 en el campo, más pequeña en el remolque).
function dibujaBala(x: number, y: number, k: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  card(-60, -42, 120, 84, '#F2C94C', 6, 14);
  ctx.strokeStyle = '#B98A2E';
  ctx.lineWidth = 6;
  [-25, 25].forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(d, -42);
    ctx.lineTo(d, 42);
    ctx.stroke();
  });
  ctx.restore();
}

SCENES['granjaTractor'] = {
  music: 'jardin',
  // enter(): pone el tractor y las balas y explica qué hay que hacer.
  enter(_o: OpcionesEscena) {
    prepararTractor();
    later(400, () => {
      playSound('tractor');
      say('¡Subimos al tractor! Toca las balas de paja y el tractor irá a recogerlas.');
    });
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca una bala de paja para que el tractor vaya a por ella.');
  },
  // hint(): una bala que aún está en el campo (si el tractor no va ya a por otra).
  hint() {
    const b = tractor.balas.find((z) => z.subida < 0);
    return b && !tractor.va && !tractor.fin ? { x: b.x, y: b.y, r: 80 } : null;
  },
  // update(): el tractor avanza hacia su meta (más o menos deprisa según lo lejos que esté); si va a por una bala y
  // llega, la sube.
  update() {
    const dt = Math.min(0.05, T - tractor.ultimo);
    tractor.ultimo = T;
    const d = tractor.meta - tractor.x,
      v = Math.sign(d) * Math.min(Math.abs(d), 420 * dt);
    tractor.x += v;
    if (tractor.va && Math.abs(tractor.meta - tractor.x) < 2) subirBala(tractor.va);
  },
  // draw(): la granja con el camino, las balas que quedan en el campo, el remolque, el tractor (que traquetea si anda)
  // y el humo del tubo.
  draw() {
    fondoGranja();
    card(0, CAMINO_Y + 40, W, 70, '#C9A16B', 0, 0);
    tractor.balas.filter((b) => b.subida < 0).forEach((b) => dibujaBala(b.x, b.y, 1));
    dibujaRemolque(tractor.x);
    const anda = Math.abs(tractor.meta - tractor.x) > 2;
    pic('tractor', tractor.x, CAMINO_Y - (anda ? Math.abs(Math.sin(T * 20)) * 6 : 0), 220);
    if (anda) circ(tractor.x + 60 - ((T * 120) % 60), CAMINO_Y - 150 - ((T * 80) % 40), 16, 'rgba(230,236,244,0.8)', 0);
    dibujaMarco();
  },
  // down(x, y): casa -> el plano; una bala del campo (con el tractor parado) -> el tractor va hasta ella.
  down(x: number, y: number) {
    if (alPlano(x, y) || tractor.fin || tractor.va) return;
    const b = tractor.balas.find((z) => z.subida < 0 && dist(x, y, z.x, z.y) < 90);
    if (!b) {
      toqueSuelto(x, y);
      return;
    }
    SFX.pop();
    playSound('tractor');
    tractor.va = b;
    tractor.meta = b.x;
  },
};

// ESTADO_TALLERES: el estado de las cuatro estaciones, para que las pruebas sepan dónde está cada cosa
// (docs/CONTRATO-PRUEBAS.md). Solo se lee.
export const ESTADO_TALLERES = { queso, cepillo, huerto, tractor, CABALLO };
