/*
 * escenas/rayuela.ts: la rayuela, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12a), la escena
 * SCENES.rayuela. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts). En el suelo del patio está la
 * rayuela pintada con tiza (casillasRayuela: hasta el 5 con 3 años, el 8 con 4 y el 10 con 5). En cada ronda Tito dice
 * un número y se toca su casilla para tirar la piedra; si cae en otra casilla, Tito dice qué número es y se prueba otra
 * vez. Con la piedra en su sitio, Tito va saltando a la pata coja de casilla en casilla y cuenta en voz alta hasta la
 * piedra (el niño salta y cuenta con él, en casa), la recoge y vuelve de un salto a la salida. Tres rondas
 * (planRayuela); al final, como en los demás juegos del patio, se apunta en S.cole con sus monedas (terminarEnElPatio)
 * y salen el cartel y el botón «Otra vez». La casa vuelve al menú de los juegos cortos.
 * Exporta: RAYUELA_ST (el estado de la partida y dónde está cada casilla, para las pruebas) y pone SCENES.rayuela.
 * Importa: el núcleo (dibujo, voz, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de
 * dominio/juegosCortos.ts, NUM de juegos/comps.ts, el fondo del patio y lo común del patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  SCENES,
  SFX,
  T,
  VIVO,
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
  inCoinHUD,
  later,
  pic,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
  tone,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { casillasRayuela, planRayuela, type CasillaRayuela } from '../dominio/juegosCortos.ts';
import { NUM } from '../juegos/comps.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Una casilla de la rayuela en la pantalla: la casilla, su rectángulo y su centro. */
interface CasillaEnPantalla extends CasillaRayuela {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly cx: number;
  readonly cy: number;
}

/** Las fases de una ronda: Tito explica, pide un número, la piedra vuela, Tito habla (espera), salta, vuelve a la
 * salida o se acaba. */
type FaseRayuela = 'intro' | 'pide' | 'tira' | 'espera' | 'salta' | 'vuelve' | 'fin';

// MEDIDAS: dónde se pinta la rayuela (la x de la primera columna, lo que ocupa cada columna, el ancho de una casilla,
// la altura de arriba y el alto de una columna), dónde espera Tito, su tamaño, lo que dura cada salto, el vuelo de la
// piedra y la vuelta a la salida.
const MEDIDAS = { x0: 330, paso: 140, ancho: 128, y: 470, alto: 230, salida: 175, tito: 150 };
const TIEMPO = { salto: 0.7, vuelo: 0.6, vuelta: 0.9 };

// RAYUELA_ST: el estado de la partida: la fase y cuándo empezó, los números de las rondas, la ronda, la casilla donde
// está Tito (0: la salida), la casilla donde ha caído la piedra (0: en la mano) y las casillas pintadas.
export const RAYUELA_ST = {
  fase: 'intro' as FaseRayuela,
  t0: 0,
  plan: [] as number[],
  ronda: 0,
  en: 0,
  piedra: 0,
  casillas: [] as CasillaEnPantalla[],
};

// enPantalla(c): dónde se pinta la casilla c: las sueltas ocupan toda la columna; las parejas, media cada una (la
// primera abajo).
function enPantalla(c: CasillaRayuela): CasillaEnPantalla {
  const x = MEDIDAS.x0 + c.col * MEDIDAS.paso,
    medio = MEDIDAS.alto / 2,
    y = MEDIDAS.y + (c.fila === 'abajo' ? medio : 0),
    h = c.fila === 'sola' ? MEDIDAS.alto : medio;
  return { ...c, x, y, w: MEDIDAS.ancho, h, cx: x + MEDIDAS.ancho / 2, cy: y + h / 2 };
}

// casilla(n): la casilla del número n (undefined si no está pintada).
const casilla = (n: number): CasillaEnPantalla | undefined => RAYUELA_ST.casillas.find((c) => c.n === n);
// objetivo(): el número de la ronda.
const objetivo = (): number => RAYUELA_ST.plan[RAYUELA_ST.ronda] ?? 1;
// sigue(): ¿sigue la partida en la escena de la rayuela? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'rayuela';

// pedir(): empieza una ronda: Tito pide el número y espera a que se toque una casilla.
function pedir(): void {
  Object.assign(RAYUELA_ST, { fase: 'pide', t0: T, en: 0, piedra: 0 });
  say(fmt('Tira la piedra a la casilla del {n}.', { n: NUM[objetivo()]! }));
}

// tirar(c): se ha tocado la casilla c: la piedra vuela hasta ella.
function tirar(c: CasillaEnPantalla): void {
  Object.assign(RAYUELA_ST, { fase: 'tira', t0: T, piedra: c.n });
  SFX.whoosh();
}

// caePiedra(): la piedra cae en su casilla. Si es la buena, Tito empieza a saltar; si no, dice qué número es y la
// piedra vuelve a la mano para probar otra vez.
function caePiedra(): void {
  const s = RAYUELA_ST,
    c = casilla(s.piedra);
  if (c) burst(c.cx, c.cy, 12);
  Object.assign(s, { fase: 'espera', t0: T });
  if (s.piedra === objetivo()) {
    SFX.good();
    sayQ(fmt('¡Muy bien, en el {n}! ¡A la pata coja, salta conmigo y cuenta!', { n: NUM[s.piedra]! }), () => {
      if (sigue()) Object.assign(s, { fase: 'salta', t0: T, en: 0 });
    });
    return;
  }
  SFX.boing();
  sayQ(
    fmt('Esa es la casilla del {n}. Busca la del {objetivo}.', { n: NUM[s.piedra]!, objetivo: NUM[objetivo()]! }),
    () => {
      if (sigue()) Object.assign(s, { fase: 'pide', t0: T, piedra: 0 });
    },
  );
}

// saltito(): Tito salta a la casilla siguiente y la cuenta en voz alta; en la de la piedra, la recoge y vuelve.
function saltito(): void {
  const s = RAYUELA_ST,
    en = s.en + 1;
  Object.assign(s, { en, t0: T });
  tone(440 + en * 50, 0.1, 'triangle', 0.25);
  say(NUM[en] ?? String(en));
  if (en < s.piedra) return;
  later(700, () => {
    if (!sigue()) return;
    SFX.good();
    say('¡La piedra!');
    Object.assign(s, { fase: 'vuelve', t0: T, piedra: 0 });
  });
}

// llegaSalida(): Tito ha vuelto a la salida con la piedra: siguiente ronda o se acaba.
function llegaSalida(): void {
  const s = RAYUELA_ST,
    ronda = s.ronda + 1;
  Object.assign(s, { ronda, en: 0, t0: T });
  if (ronda >= s.plan.length) {
    s.fase = 'fin';
    terminarEnElPatio('rayuela', MEDIDAS.salida, 560);
    say('¡Qué bien saltas a la pata coja! Hemos jugado a la rayuela. ¿Jugamos otra vez?');
    return;
  }
  s.fase = 'intro';
  later(500, () => {
    if (sigue()) pedir();
  });
}

// dondeTito(): dónde está Tito (los pies): en la salida, en su casilla, en el aire entre dos casillas o volviendo.
function dondeTito(): { x: number; y: number } {
  const s = RAYUELA_ST,
    k = Math.min(1, (T - s.t0) / (s.fase === 'vuelve' ? TIEMPO.vuelta : TIEMPO.salto * 0.6)),
    pie = (n: number) => {
      const c = casilla(n);
      return c ? { x: c.cx, y: c.cy + 40 } : { x: MEDIDAS.salida, y: MEDIDAS.y + MEDIDAS.alto / 2 + 40 };
    };
  if (s.fase === 'vuelve') {
    const de = pie(s.en),
      a = pie(0);
    return { x: de.x + (a.x - de.x) * k, y: de.y + (a.y - de.y) * k - Math.sin(k * Math.PI) * 160 };
  }
  if (s.fase !== 'salta' || s.en === 0) return pie(s.en);
  const de = pie(s.en - 1),
    a = pie(s.en);
  return { x: de.x + (a.x - de.x) * k, y: de.y + (a.y - de.y) * k - Math.sin(k * Math.PI) * 70 };
}

// dibujaCasilla(c): una casilla de tiza con su número; la del número pedido brilla mientras se pide.
function dibujaCasilla(c: CasillaEnPantalla): void {
  const s = RAYUELA_ST,
    pedida = s.fase === 'pide' && c.n === objetivo() && AGE() <= 3,
    pisada = s.fase === 'salta' && c.n === s.en;
  card(c.x, c.y, c.w, c.h, pisada ? '#FFF3B0' : '#F2E2C2', 6, 6);
  ctx.save();
  ctx.strokeStyle = pedida ? `rgba(255,201,60,${0.6 + Math.sin(T * 6) * 0.4})` : 'rgba(255,255,255,.9)';
  ctx.lineWidth = 6;
  ctx.strokeRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
  ctx.restore();
  text(String(c.n), c.cx, c.cy + 18, c.fila === 'sola' ? 60 : 46, '#8A6E50');
}

// dibujaPiedra(): la piedra: en la mano de Tito, volando hacia su casilla o en ella.
function dibujaPiedra(): void {
  const s = RAYUELA_ST,
    c = casilla(s.piedra);
  if (!c || s.fase === 'vuelve') return;
  if (s.fase !== 'tira') {
    pic('piedra', c.cx + 26, c.cy - 20, 50);
    return;
  }
  const k = Math.min(1, (T - s.t0) / TIEMPO.vuelo),
    x0 = MEDIDAS.salida,
    y0 = MEDIDAS.y + 40;
  pic('piedra', x0 + (c.cx + 26 - x0) * k, y0 + (c.cy - 20 - y0) * k - Math.sin(k * Math.PI) * 180, 50);
}

SCENES['rayuela'] = {
  music: 'jardin',
  // enter(): una partida nueva: las casillas de la edad y los números de las rondas (planRayuela); Tito lo explica y
  // pide el primero.
  enter(_o: OpcionesEscena) {
    Object.assign(RAYUELA_ST, {
      fase: 'intro',
      t0: T,
      plan: planRayuela(AGE(), azar),
      ronda: 0,
      en: 0,
      piedra: 0,
      casillas: casillasRayuela(AGE()).map(enPantalla),
    });
    later(400, () =>
      sayQ(
        '¡A la rayuela! Tira la piedra a la casilla que te diga y luego saltamos a la pata coja, contando. ¡Salta tú también!',
        () => {
          if (sigue()) pedir();
        },
      ),
    );
  },
  // update(): la piedra llega a su casilla; Tito salta de casilla en casilla y vuelve a la salida. La ayuda automática
  // no sale mientras Tito salta (VIVO.idle a 0).
  update() {
    const s = RAYUELA_ST,
      t = T - s.t0;
    if (s.fase !== 'pide') VIVO.idle = 0;
    if (s.fase === 'tira' && t >= TIEMPO.vuelo) caePiedra();
    else if (s.fase === 'salta' && t >= TIEMPO.salto && s.en < s.piedra) saltito();
    else if (s.fase === 'vuelve' && t >= TIEMPO.vuelta) llegaSalida();
  },
  // prompt(): repite lo que toca.
  prompt() {
    const s = RAYUELA_ST;
    if (s.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else if (s.fase === 'pide') say(fmt('Toca la casilla del {n}.', { n: NUM[objetivo()]! }));
    else say('¡Salta a la pata coja y cuenta conmigo!');
  },
  // hint(): mientras se pide, la casilla buena; al final, el botón de otra vez.
  hint() {
    const s = RAYUELA_ST,
      c = casilla(objetivo());
    if (s.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    return s.fase === 'pide' && c ? { x: c.cx, y: c.cy, r: Math.min(c.w, c.h) / 2 } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, la rayuela, la piedra, Tito (en la salida, saltando o volviendo), el número pedido, las rondas y,
  // al final, el botón de otra vez.
  draw() {
    fondoPatio();
    const s = RAYUELA_ST;
    s.casillas.forEach(dibujaCasilla);
    dibujaPiedra();
    const p = dondeTito();
    sombra(p.x, p.y, 50);
    drawTito(p.x - MEDIDAS.tito / 2, p.y - (MEDIDAS.tito * 200) / 240 + 6, MEDIDAS.tito, { bubble: false });
    dibujaRondas(s.plan.length, s.ronda);
    if (s.fase === 'pide' || s.fase === 'tira') {
      card(W / 2 - 170, 130, 340, 120, '#fff', 6, 30);
      text(String(objetivo()), W / 2, 225, 96, '#E8554E');
    }
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; mientras se pide, una casilla tira la
  // piedra; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('juegosCortos');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    const s = RAYUELA_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    const c = s.casillas.find((q) => x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h);
    if (s.fase === 'pide' && c) {
      tirar(c);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
