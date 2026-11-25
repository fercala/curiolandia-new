/*
 * escenas/primerosPasos.ts: los primeros pasos guiados (idea 45 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.180), SCENES.primerosPasos. La primera vez, cuando el cuento del principio (SCENES.intro,
 * escenas/escenas2d.ts) termina entero, Tito enseña a jugar en cuatro pasos cortos antes de ir al mapa: tocar (la
 * estrella), arrastrar (la manzana al cubo), el botón verde de seguir y tocar a Tito para que repita lo que hay que
 * hacer. Cada paso se celebra y pasa solo al siguiente; el botón de abajo a la derecha (como el del cuento) lo salta.
 * No guarda nada en S: solo se llega desde el final del cuento, que ya se apunta en S.intro.
 * Exporta, para las pruebas: PASOS_TUTORIAL, ESTADO_PASOS y las posiciones (ESTRELLA_PASOS, MANZANA_PASOS, CESTA_PASOS,
 * VERDE_PASOS, TITO_PASOS); pone SCENES.primerosPasos al cargarse.
 * Importa: el núcleo (dibujo, voz, escenas y S).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  SCENES,
  SFX,
  T,
  burst,
  card,
  circ,
  ctx,
  drawTito,
  fillStroke,
  go,
  later,
  pic,
  say,
  sky,
  star,
} from '../nucleo/indice.ts';

/** Los pasos, en orden: lo que dice Tito en cada uno. */
export const PASOS_TUTORIAL = [
  { id: 'tocar', frase: 'Para jugar, toca las cosas con el dedo. ¡Toca la estrella!' },
  { id: 'arrastrar', frase: 'Algunas cosas se arrastran. Pon el dedo en la manzana y llévala al cubo.' },
  { id: 'verde', frase: 'El botón verde sirve para seguir. ¡Tócalo!' },
  { id: 'tito', frase: 'Si no sabes qué hacer, tócame y te lo repito. ¡Tócame!' },
] as const;
// las posiciones de lo que se toca en cada paso
export const ESTRELLA_PASOS = { x: 1050, y: 430, r: 110 };
export const MANZANA_PASOS = { x: 820, y: 560, r: 80 };
export const CESTA_PASOS = { x: 1300, y: 600, r: 120 };
export const VERDE_PASOS = { x: 1050, y: 560, r: 90 };
export const TITO_PASOS = { x: 120, y: 330, w: 360 };

/** El paso de ahora, la manzana (dónde está y si se arrastra), si se está celebrando (no se puede tocar) y si ya acabó. */
export const ESTADO_PASOS = { paso: 0, mx: 0, my: 0, arrastra: false, celebra: false, fin: false };

// COLOR_PUNTO: el color de los puntos de los pasos: ya hecho, el de ahora y los que faltan.
const COLOR_PUNTO = ['#FFC93C', '#FFF1B2', '#fff'];

// cerca(x, y, o): ¿el punto (x, y) toca el círculo o?
const cerca = (x: number, y: number, o: { x: number; y: number; r: number }): boolean =>
  Math.hypot(x - o.x, y - o.y) <= o.r;
// enTito(x, y): ¿el punto toca a Tito (el rectángulo de su dibujo)?
const enTito = (x: number, y: number): boolean =>
  x >= TITO_PASOS.x && x <= TITO_PASOS.x + TITO_PASOS.w && y >= TITO_PASOS.y && y <= TITO_PASOS.y + TITO_PASOS.w;

// alMapa(): termina los primeros pasos y va al mapa (con el saludo de siempre).
function alMapa(): void {
  ESTADO_PASOS.fin = true;
  go('map', { hello: true });
}

// bien(x, y): el paso de ahora está hecho: lo celebra y, al rato, pasa al siguiente (o, tras el último, al mapa).
function bien(x: number, y: number): void {
  ESTADO_PASOS.celebra = true;
  SFX.good();
  burst(x, y, 30);
  const ultimo = ESTADO_PASOS.paso >= PASOS_TUTORIAL.length - 1;
  say(ultimo ? '¡Muy bien! Ya sabes jugar. ¡Vamos al mapa!' : '¡Muy bien!', () =>
    later(500, () => {
      ESTADO_PASOS.celebra = false;
      if (ultimo) {
        alMapa();
        return;
      }
      ESTADO_PASOS.paso++;
      say(PASOS_TUTORIAL[ESTADO_PASOS.paso]!.frase);
    }),
  );
}

SCENES.primerosPasos = {
  music: 'title',
  // enter(): el primer paso, con la manzana en su sitio.
  enter(_o: OpcionesEscena) {
    Object.assign(ESTADO_PASOS, {
      paso: 0,
      mx: MANZANA_PASOS.x,
      my: MANZANA_PASOS.y,
      arrastra: false,
      celebra: false,
      fin: false,
    });
    say(PASOS_TUTORIAL[0].frase);
  },
  // prompt(): repite lo que hay que hacer en el paso de ahora.
  prompt() {
    say(PASOS_TUTORIAL[ESTADO_PASOS.paso]!.frase);
  },
  // hint(): señala lo que hay que tocar en el paso de ahora.
  hint() {
    const id = PASOS_TUTORIAL[ESTADO_PASOS.paso]!.id;
    if (id === 'tocar') return ESTRELLA_PASOS;
    if (id === 'arrastrar') return { x: ESTADO_PASOS.mx, y: ESTADO_PASOS.my, r: MANZANA_PASOS.r };
    if (id === 'verde') return VERDE_PASOS;
    return { x: TITO_PASOS.x + TITO_PASOS.w / 2, y: TITO_PASOS.y + TITO_PASOS.w * 0.4, r: 170 };
  },
  // draw(): el prado, Tito, lo del paso de ahora (la estrella, la manzana y el cubo, o el botón verde), los puntos de
  // los pasos y el botón de saltar.
  draw() {
    sky('#BFEAF7', '#FFF6E6');
    ctx.fillStyle = '#9FDC8F';
    ctx.beginPath();
    ctx.ellipse(800, 980, 1100, 260, 0, 0, Math.PI * 2);
    ctx.fill();
    const id = PASOS_TUTORIAL[ESTADO_PASOS.paso]!.id,
      late = 1 + Math.sin(T * 4) * 0.06;
    drawTito(TITO_PASOS.x, TITO_PASOS.y, TITO_PASOS.w, { sq: id === 'tito' ? Math.sin(T * 6) * 0.02 : 0 });
    if (id === 'tocar') star(ESTRELLA_PASOS.x, ESTRELLA_PASOS.y, 95 * late, '#FFC93C', 7);
    if (id === 'arrastrar') {
      pic('cubo', CESTA_PASOS.x, CESTA_PASOS.y, 230);
      pic('manzana', ESTADO_PASOS.mx, ESTADO_PASOS.my, ESTADO_PASOS.arrastra ? 150 : 140 * late);
    }
    if (id === 'verde') {
      ctx.save();
      ctx.translate(VERDE_PASOS.x, VERDE_PASOS.y);
      ctx.scale(late, late);
      circ(0, 0, 84, '#7CC86E', 8);
      ctx.beginPath();
      ctx.moveTo(-24, -38);
      ctx.lineTo(40, 0);
      ctx.lineTo(-24, 38);
      ctx.closePath();
      fillStroke('#fff', 6);
      ctx.restore();
    }
    PASOS_TUTORIAL.forEach((_, i) =>
      circ(710 + i * 60, 830, 18, COLOR_PUNTO[Math.sign(i - ESTADO_PASOS.paso) + 1]!, 5),
    );
    // el botón de saltar, en el mismo sitio que el del cuento
    card(1440, 770, 120, 100, '#fff', 6, 34);
    ctx.beginPath();
    ctx.moveTo(1478, 795);
    ctx.lineTo(1520, 820);
    ctx.lineTo(1478, 845);
    ctx.closePath();
    fillStroke(K, 0);
  },
  // down(x, y): saltar -> al mapa; si no, lo del paso de ahora: la estrella, coger la manzana, el botón verde o Tito.
  down(x: number, y: number) {
    if (x > 1420 && y > 750) {
      SFX.whoosh();
      alMapa();
      return;
    }
    if (ESTADO_PASOS.celebra) return;
    const id = PASOS_TUTORIAL[ESTADO_PASOS.paso]!.id;
    if (id === 'tocar' && cerca(x, y, ESTRELLA_PASOS)) bien(ESTRELLA_PASOS.x, ESTRELLA_PASOS.y);
    else if (id === 'arrastrar' && cerca(x, y, { x: ESTADO_PASOS.mx, y: ESTADO_PASOS.my, r: MANZANA_PASOS.r })) {
      ESTADO_PASOS.arrastra = true;
      SFX.pop();
    } else if (id === 'verde' && cerca(x, y, VERDE_PASOS)) bien(VERDE_PASOS.x, VERDE_PASOS.y);
    else if (id === 'tito' && enTito(x, y)) bien(TITO_PASOS.x + TITO_PASOS.w / 2, TITO_PASOS.y + 120);
    else if (enTito(x, y)) this.prompt!();
  },
  // move(x, y): la manzana sigue al dedo mientras se arrastra.
  move(x: number, y: number) {
    if (!ESTADO_PASOS.arrastra) return;
    ESTADO_PASOS.mx = x;
    ESTADO_PASOS.my = y;
  },
  // up(x, y): al soltar la manzana, si está en el cubo, paso hecho; si no, vuelve a su sitio.
  up(x: number, y: number) {
    if (!ESTADO_PASOS.arrastra) return;
    ESTADO_PASOS.arrastra = false;
    if (cerca(x, y, CESTA_PASOS)) {
      ESTADO_PASOS.mx = CESTA_PASOS.x;
      ESTADO_PASOS.my = CESTA_PASOS.y - 40;
      bien(CESTA_PASOS.x, CESTA_PASOS.y);
      return;
    }
    ESTADO_PASOS.mx = MANZANA_PASOS.x;
    ESTADO_PASOS.my = MANZANA_PASOS.y;
  },
} satisfies Escena;
