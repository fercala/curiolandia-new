/*
 * escenas/juegosCortos.ts: el menú de los juegos cortos del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12), la escena
 * SCENES.juegosCortos. Se abre con el botón «Juegos cortos» del patio (escenas/patio.ts). Tiene una tarjeta por juego
 * corto (JUEGOS_CORTOS, dominio/juegosCortos.ts), en dos filas: los que ya tienen escena se juegan al tocarlos y los
 * demás salen «¡Muy pronto!», como en el patio. Los juegos se van haciendo de dos en dos (P12a: la rayuela y los
 * columpios, escenas/rayuela.ts y escenas/columpios.ts). La casa vuelve al patio; desde cada juego, la casa vuelve aquí.
 * Exporta: TARJETAS_CORTOS (dónde está cada tarjeta, para las pruebas) y pone SCENES.juegosCortos al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito), los juegos de dominio/juegosCortos.ts y el fondo del patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  S,
  SCENES,
  SFX,
  T,
  TITO,
  W,
  atHome,
  burst,
  card,
  ctx,
  drawCoinHUD,
  drawHome,
  drawTito,
  fmt,
  go,
  hR,
  hv,
  inCoinHUD,
  inTito,
  later,
  pic,
  save,
  say,
  sayQ,
  sparkles,
  text,
  tr,
} from '../nucleo/indice.ts';
import { JUEGOS_CORTOS, type JuegoCorto } from '../dominio/juegosCortos.ts';
import { fondoPatio } from './patio.ts';

/** Una tarjeta del menú: el juego y su rectángulo (esquina de arriba a la izquierda, ancho y alto). */
interface TarjetaCorto {
  readonly j: JuegoCorto;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

// TARJETA: las medidas de las tarjetas: ancho, alto, separación, cuántas van en la primera fila y la altura de cada fila.
const TARJETA = { w: 250, h: 250, sep: 34, porFila: 4, y: [250, 560] };
// COLORES_CORTOS: el color de cada tarjeta, en orden.
const COLORES_CORTOS = ['#FF8A7A', '#5BB8E6', '#7CC86E', '#9B8AD9', '#FFA94D', '#E07BB5', '#4DB6AC'];

// TARJETAS_CORTOS: una tarjeta por juego corto: cuatro en la primera fila y el resto en la segunda, centradas.
export const TARJETAS_CORTOS: readonly TarjetaCorto[] = JUEGOS_CORTOS.map((j, i) => {
  const fila = i < TARJETA.porFila ? 0 : 1,
    enFila = fila === 0 ? Math.min(TARJETA.porFila, JUEGOS_CORTOS.length) : JUEGOS_CORTOS.length - TARJETA.porFila,
    pos = fila === 0 ? i : i - TARJETA.porFila,
    ancho = enFila * TARJETA.w + (enFila - 1) * TARJETA.sep;
  return {
    j,
    x: (W - ancho) / 2 + pos * (TARJETA.w + TARJETA.sep),
    y: TARJETA.y[fila] ?? 250,
    w: TARJETA.w,
    h: TARJETA.h,
  };
});

// sePuedeCorto(j): ¿se puede jugar ya el juego j? Si tiene escena y la escena existe.
const sePuedeCorto = (j: JuegoCorto): boolean => !!j.escena && !!SCENES[j.escena];

// dibujaTarjeta(t, i): una tarjeta del menú: de color con el dibujo del juego, que se mueve un poco, y su nombre; si
// aún no se puede jugar, gris y con el cartel «¡Muy pronto!».
function dibujaTarjeta(t: TarjetaCorto, i: number): void {
  const lista = sePuedeCorto(t.j),
    s = hv('corto:' + t.j.id, hR(t.x, t.y, t.w, t.h)),
    cx = t.x + t.w / 2,
    cy = t.y + t.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  card(t.x, t.y, t.w, t.h, lista ? (COLORES_CORTOS[i % COLORES_CORTOS.length] ?? '#FFA94D') : '#D8D2C8', 7, 32);
  card(t.x + 20, t.y + 20, t.w - 40, t.h - 90, '#fff', 5, 22);
  ctx.globalAlpha = lista ? 1 : 0.45;
  pic(t.j.icono, cx, t.y + 20 + (t.h - 90) / 2 - (lista ? Math.abs(Math.sin(T * 3 + i)) * 8 : 0), 120);
  ctx.globalAlpha = 1;
  text(t.j.nombre, cx, t.y + t.h - 34, 30, '#fff', { st: 6, sc: 'rgba(0,0,0,.25)' });
  if (!lista) {
    card(cx - 95, t.y - 22, 190, 44, '#FFD66B', 5, 22);
    text('¡Muy pronto!', cx, t.y + 9, 24);
  }
  ctx.restore();
}

SCENES['juegosCortos'] = {
  music: 'jardin',
  // enter(o): la primera vez, Tito presenta los juegos cortos (S.first.juegosCortos); si no, la consigna si viene del
  // patio (o.hello).
  enter(o: OpcionesEscena) {
    if (!S.first['juegosCortos']) {
      S.first['juegosCortos'] = 1;
      save();
      later(500, () => sayQ('¡Juegos cortos del patio! Son juegos pequeñitos, para jugar un ratito. Elige uno.'));
    } else if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna.
  prompt() {
    say('Elige un juego corto.');
  },
  // hint(): el primer juego que ya se puede jugar.
  hint() {
    const t = TARJETAS_CORTOS.find((x) => sePuedeCorto(x.j));
    return t ? { x: t.x + t.w / 2, y: t.y + t.h / 2, r: t.w / 2 } : null;
  },
  // dwell(id): dice el nombre del juego que hay bajo el ratón.
  dwell(id: string) {
    const t = TARJETAS_CORTOS.find((x) => 'corto:' + x.j.id === id);
    if (t) say(t.j.nombre);
  },
  // draw(): el fondo del patio, el cartel, las tarjetas, la casa, las monedas y Tito.
  draw() {
    fondoPatio();
    card(W / 2 - 220, 100, 440, 80, '#fff', 6, 40);
    text('Juegos cortos', W / 2, 158, 48);
    TARJETAS_CORTOS.forEach(dibujaTarjeta);
    drawHome();
    drawCoinHUD();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): casa -> el patio; Tito -> consigna; monedas -> tienda; un juego que se puede jugar -> se juega; si no,
  // «muy pronto».
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('patio');
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
    const t = TARJETAS_CORTOS.find((q) => x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h);
    if (t) {
      if (!t.j.escena || !sePuedeCorto(t.j)) {
        SFX.boing();
        burst(t.x + t.w / 2, t.y + 40, 10);
        say(fmt('{juego}: ¡muy pronto podrás jugar!', { juego: tr(t.j.nombre) }));
        return;
      }
      SFX.pop();
      go(t.j.escena, { hello: true });
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
