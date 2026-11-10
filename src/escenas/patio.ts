/*
 * escenas/patio.ts: el patio del cole (fase P1 de docs/IDEAS-MEJORA.md), la escena SCENES.patio. Se llega desde el cole
 * (escenas/cole.ts). Tiene un botón grande por cada actividad del patio (ACTIVIDADES_PATIO, dominio/cole.ts): las que
 * ya tienen escena se juegan al tocarlas; las demás salen «¡Muy pronto!» (también las carreras, que son en 3D, si no
 * hay WebGL). Las actividades del patio son sobre todo
 * juegos para moverse de verdad: Tito pone la música y las consignas, el niño se mueve y la pantalla lo acompaña.
 * Exporta: fondoPatio (el fondo del patio, que usan también las actividades), BOTONES_PATIO (dónde está cada botón) y
 * pone SCENES.patio al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito) y las actividades de dominio/cole.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  H,
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
  ell,
  go,
  hR,
  hv,
  inCoinHUD,
  inTito,
  kid,
  later,
  pic,
  save,
  say,
  sayQ,
  sky,
  sparkles,
  text,
  tree,
} from '../nucleo/indice.ts';
import { ACTIVIDADES_PATIO, type ActividadPatio } from '../dominio/cole.ts';

/** El rectángulo de un botón del patio (esquina de arriba a la izquierda, ancho y alto) con su actividad. */
interface BotonPatio {
  readonly a: ActividadPatio;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

// Medidas de los botones: ancho (como mucho; desde la fase P11, con cinco botones o más, algo menos para que quepan), alto,
// separación y altura de su borde de arriba. Se centran en la pantalla.
const BOTON = { w: 290, h: 320, sep: 32, y: 330 };
// anchoBoton: el ancho de cada botón, para que quepan todos con 80 de margen a cada lado.
const anchoBoton = Math.min(BOTON.w, (W - 160 - (ACTIVIDADES_PATIO.length - 1) * BOTON.sep) / ACTIVIDADES_PATIO.length);
// COLORES: el color de cada botón, en orden.
const COLORES = ['#FF8A7A', '#5BB8E6', '#9B8AD9', '#7CC86E', '#FFA94D', '#E07BB5'];

// BOTONES_PATIO: un botón por actividad del patio, en fila y centrados.
export const BOTONES_PATIO: readonly BotonPatio[] = ACTIVIDADES_PATIO.map((a, i, todas) => {
  const ancho = todas.length * anchoBoton + (todas.length - 1) * BOTON.sep;
  return { a, x: (W - ancho) / 2 + i * (anchoBoton + BOTON.sep), y: BOTON.y, w: anchoBoton, h: BOTON.h };
});

// fondoPatio(): el patio: el cielo, la valla, la hierba, el suelo de arena con la pista de colores y dos árboles. Lo
// usan el patio y sus actividades (escenas/estatuas.ts, titoDice.ts y yoga.ts).
export function fondoPatio(): void {
  sky('#D6EFFB', '#F3FAEC');
  ctx.fillStyle = '#B5E29A';
  ctx.fillRect(0, 300, W, H - 300);
  // la valla del fondo
  Array.from({ length: Math.ceil(W / 70) }, (_, i) => card(20 + i * 70, 250, 22, 110, '#F7E6C4', 4, 8));
  card(0, 280, W, 18, '#E8CFA0', 4, 4);
  card(0, 330, W, 18, '#E8CFA0', 4, 4);
  ell(W / 2, 760, 900, 170, '#F7D9A6', 0);
  ['#FF8A7A', '#FFD66B', '#7CC86E'].forEach((c, i) => {
    ctx.beginPath();
    ctx.ellipse(W / 2, 760, 820 - i * 70, 130 - i * 22, 0, 0, Math.PI * 2);
    ctx.lineWidth = 7;
    ctx.strokeStyle = c;
    ctx.stroke();
  });
  tree(70, 470, 1, 'verano');
  tree(1540, 450, 0.9, 'primavera');
}

// sePuede(a): ¿se puede jugar ya la actividad a? Si tiene escena y la escena existe (las carreras son en 3D: sin WebGL,
// SCENES.carreras no existe y salen «¡Muy pronto!», como lo que aún no está hecho).
const sePuede = (a: ActividadPatio): boolean => !!a.escena && !!SCENES[a.escena];

// drawBoton(b, i): un botón del patio: tarjeta de color con el dibujo de la actividad que se mueve un poco y su nombre;
// si aún no tiene escena, gris y con el cartel «¡Muy pronto!».
function drawBoton(b: BotonPatio, i: number): void {
  const lista = sePuede(b.a),
    s = hv('patio:' + b.a.id, hR(b.x, b.y, b.w, b.h)),
    cx = b.x + b.w / 2,
    cy = b.y + b.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  card(b.x, b.y, b.w, b.h, lista ? (COLORES[i % COLORES.length] ?? '#FFA94D') : '#D8D2C8', 7, 36);
  card(b.x + 24, b.y + 24, b.w - 48, b.h - 120, '#fff', 5, 26);
  ctx.globalAlpha = lista ? 1 : 0.45;
  pic(b.a.icono, cx, b.y + 24 + (b.h - 120) / 2 - (lista ? Math.abs(Math.sin(T * 3 + i)) * 10 : 0), 150);
  ctx.globalAlpha = 1;
  text(b.a.nombre, cx, b.y + b.h - 44, b.a.nombre.length > 12 ? 26 : 34, '#fff', { st: 6, sc: 'rgba(0,0,0,.25)' });
  if (!lista) {
    card(cx - 100, b.y - 26, 200, 48, '#FFD66B', 5, 24);
    text('¡Muy pronto!', cx, b.y + 8, 26);
  }
  ctx.restore();
}

SCENES['patio'] = {
  music: 'jardin',
  // enter(o): la primera vez, Tito presenta el patio (S.first.patio); si no, la consigna si viene del cole (o.hello).
  enter(o: OpcionesEscena) {
    if (!S.first['patio']) {
      S.first['patio'] = 1;
      save();
      later(500, () =>
        sayQ(
          `¡Al patio${kid()}! Aquí jugamos a juegos para movernos de verdad. Busca un sitio con espacio a tu alrededor. ¿Empezamos con las estatuas?`,
        ),
      );
    } else if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna del patio.
  prompt() {
    say('Elige un juego del patio.');
  },
  // hint(): el primer juego que ya se puede jugar.
  hint() {
    const b = BOTONES_PATIO.find((x) => sePuede(x.a));
    return b ? { x: b.x + b.w / 2, y: b.y + b.h / 2, r: b.w / 2 } : null;
  },
  // dwell(id): dice el nombre del juego que hay bajo el ratón.
  dwell(id: string) {
    const b = BOTONES_PATIO.find((x) => 'patio:' + x.a.id === id);
    if (b) say(b.a.nombre);
  },
  // draw(): el fondo del patio, el cartel, los botones, la casa, las monedas y Tito.
  draw() {
    fondoPatio();
    card(W / 2 - 170, 120, 340, 80, '#fff', 6, 40);
    text('El patio', W / 2, 178, 50);
    BOTONES_PATIO.forEach(drawBoton);
    drawHome();
    drawCoinHUD();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): casa -> el cole; Tito -> consigna; monedas -> tienda; un juego con escena -> se juega; sin escena -> pronto.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('cole');
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
    const b = BOTONES_PATIO.find((q) => x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h);
    if (b) {
      if (!b.a.escena || !sePuede(b.a)) {
        SFX.boing();
        burst(b.x + b.w / 2, b.y + 40, 10);
        say(`${b.a.nombre}: ¡muy pronto podrás jugar!`);
        return;
      }
      SFX.pop();
      go(b.a.escena, { hello: true });
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
