/*
 * escenas/estatuas.ts: «¡Estatuas!» (idea 11 de docs/IDEAS-MEJORA.md, fase P1), la escena SCENES.estatuas, el primer
 * juego del patio del cole. Un juego para moverse de verdad: suena la música y Tito baila (como un pingüino, una rana,
 * un mono...) y el niño baila con él; cuando la música para, «¡Estatua!»: todos quietos con la postura que dice Tito
 * (como un árbol, una estrella, un gato dormido...), que se ve en grande en un bocadillo. Tito espera quieto unos
 * segundos, celebra y vuelve la música. No se puede comprobar si el niño se ha movido: se confía y se celebra, como en
 * el patio de verdad. Son 4 rondas con 3 años y 5 con 4 o 5; al acabar, monedas la primera vez de cada día (reglas en
 * dominio/cole.ts, guardadas en S.cole) y los botones «Otra vez» y la casa (vuelve al patio).
 * La música es propia (una melodía alegre con bajo, en el bus de efectos), para que suene aunque la música de fondo
 * esté quitada en la zona de adultos.
 * Exporta: BAILES y POSES_ESTATUA, y pone SCENES.estatuas al cargarse.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito), fondoPatio de escenas/patio.ts, lo común de los juegos del
 * patio de escenas/patioComun.ts (el final, las rondas, la sombra y terminarEnElPatio, que apunta S.cole y da las
 * monedas; desde la fase P2) y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, notas y tiempos en la pantalla de 1600x900, como
   en el resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  S,
  SCENES,
  SFX,
  T,
  VIVO,
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
  inCoinHUD,
  later,
  noise,
  pic,
  save,
  say,
  sparkles,
  text,
  tone,
} from '../nucleo/indice.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';
import { azar } from '../aplicacion/puertos.ts';

/** Un baile: el animal que se imita (dibujo de PICS), lo que dice Tito y cómo se mueve Tito. */
interface Baile {
  readonly k: string;
  readonly frase: string;
  readonly mov: 'balanceo' | 'saltos' | 'mono' | 'vuelo' | 'robot';
}
/** Una postura de estatua: el dibujo de PICS, lo que dice Tito y cómo se queda Tito (más alto, más ancho, aplastado,
 * dormido o inclinado). */
interface PoseEstatua {
  readonly k: string;
  readonly frase: string;
  readonly sx: number;
  readonly sy: number;
  readonly rot: number;
  readonly sleep?: boolean;
}
/** Lo que está pasando: presentación, baile, quietos, celebración de la ronda o fin. */
type Fase = 'intro' | 'baile' | 'quieto' | 'bien' | 'fin';

// BAILES: cómo se baila en cada ronda (en orden y, si hay más rondas, se repiten).
export const BAILES: readonly Baile[] = [
  { k: 'pinguino', frase: '¡A bailar como un pingüino!', mov: 'balanceo' },
  { k: 'rana', frase: '¡Ahora saltamos como las ranas!', mov: 'saltos' },
  { k: 'mono', frase: '¡A bailar como un mono!', mov: 'mono' },
  { k: 'mariposa', frase: '¡Volamos como una mariposa!', mov: 'vuelo' },
  { k: 'robot', frase: '¡A bailar como un robot!', mov: 'robot' },
];
// POSES_ESTATUA: las posturas de estatua, una por ronda en orden.
export const POSES_ESTATUA: readonly PoseEstatua[] = [
  { k: 'arbol', frase: '¡Estatua! Quietos como un árbol.', sx: 0.88, sy: 1.16, rot: 0 },
  { k: 'estrella', frase: '¡Estatua! Quietos como una estrella.', sx: 1.14, sy: 1.08, rot: 0 },
  { k: 'gato', frase: '¡Estatua! Quietos como un gato dormido.', sx: 1.08, sy: 0.86, rot: 0, sleep: true },
  { k: 'tortuga', frase: '¡Estatua! Hechos una bola, como una tortuga.', sx: 1.12, sy: 0.74, rot: 0 },
  { k: 'robot', frase: '¡Estatua! Quietos como un robot.', sx: 1, sy: 1, rot: 0.12 },
];
// BIEN: lo que dice Tito al acabar cada estatua (se va alternando).
const BIEN = ['¡Muy bien! ¡Qué quietos!', '¡Genial! Una estatua perfecta.', '¡Bravo! Ni te has movido.'];
// Tito en grande: dónde tiene los pies (x, y) y su ancho; el alto sale de la proporción del dibujo (200 de 240).
const TITO_E = { x: 640, y: 760, w: 330 };
const ALTO_E = (TITO_E.w * 200) / 240;
// BOCADILLO: el bocadillo con el animal o la postura que hay que imitar (centro y tamaño).
const BOCADILLO = { x: 1150, y: 360, w: 360, h: 330 };
// MELODIA: la música del baile, en pasos de PASO segundos: notas MIDI (0 = silencio). BAJO: una nota grave cada 4 pasos.
const MELODIA = [
  72, 0, 76, 79, 76, 0, 72, 74, 76, 0, 74, 72, 74, 0, 67, 0, 72, 0, 76, 79, 81, 79, 76, 74, 72, 0, 74, 76, 72, 0, 0, 0,
];
const BAJO = [48, 55, 53, 55, 48, 53, 55, 48];
const PASO = 0.2;
// TIEMPOS: segundos de baile (mínimo y lo que se suma al azar) y de estatua, más cortos con 3 años.
const TIEMPOS = { baile: 4, baileAzar: 4, quieto: 3.5, quieto3: 2.5 };

const PI2 = Math.PI * 2;
// midi(n): la frecuencia en Hz de la nota MIDI n.
const midi = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);
// rondas(): cuántas rondas tiene el juego: 4 con 3 años y 5 con 4 o 5.
const rondas = (): number => (AGE() <= 3 ? 4 : 5);

// paso(i): toca el paso i de la música: la nota de la melodía (si no es silencio), el bajo cada 4 pasos y un golpe de
// tambor suave en cada tiempo.
function paso(i: number): void {
  const n = MELODIA[i % MELODIA.length] ?? 0;
  if (n) tone(midi(n), 0.18, 'square', 0.08);
  if (i % 4 === 0) tone(midi(BAJO[(i / 4) % BAJO.length] ?? 48), 0.5, 'triangle', 0.22);
  if (i % 2 === 0) noise(0.05, i % 4 === 0 ? 0.14 : 0.06, i % 4 === 0 ? 160 : 3000);
}

// movimiento(mov, t): cómo se mueve Tito al bailar en el segundo t: desplazamiento (dx, dy), giro y aplastamiento.
function movimiento(mov: Baile['mov'], t: number): { dx: number; dy: number; rot: number; sq: number } {
  const b = t * PI2 * 1.25; // un tiempo de la música (4 pasos de 0,2 s = 0,8 s por vuelta)
  if (mov === 'balanceo') return { dx: Math.sin(b) * 30, dy: 0, rot: Math.sin(b) * 0.22, sq: 0 };
  if (mov === 'saltos')
    return { dx: 0, dy: -Math.abs(Math.sin(b)) * 110, rot: 0, sq: Math.max(0, Math.cos(b * 2)) * 0.12 };
  if (mov === 'mono')
    return { dx: Math.sin(b / 2) * 60, dy: -Math.abs(Math.sin(b)) * 50, rot: Math.sin(b) * 0.15, sq: 0 };
  if (mov === 'vuelo')
    return { dx: Math.sin(b / 2) * 90, dy: -60 - Math.sin(b) * 40, rot: Math.sin(b / 2) * 0.12, sq: 0 };
  return { dx: 0, dy: 0, rot: (Math.round(Math.sin(b) * 2) / 2) * 0.25, sq: 0 }; // robot: a golpes
}
/** El estado de la escena mientras se juega. */
interface EstadoEstatuas {
  fase: Fase;
  ronda: number;
  t0: number;
  dur: number;
  sig: number;
  n: number;
  hablando: boolean;
  salto: number;
}

// st: el estado de la partida en curso (se rehace en enter).
const st: EstadoEstatuas = { fase: 'intro', ronda: 0, t0: 0, dur: 0, sig: 0, n: 0, hablando: false, salto: -9 };

// bailar(): empieza el baile de la ronda: la música suena desde ya y Tito dice cómo se baila. Dura entre 4 y 8 segundos
// (con 3 años, uno menos) contados desde que Tito acaba de hablar.
function bailar(): void {
  const b = BAILES[st.ronda % BAILES.length]!;
  Object.assign(st, { fase: 'baile', t0: T, dur: 9e9, sig: T, hablando: true });
  say(b.frase, () => {
    st.hablando = false;
    st.t0 = T;
    st.dur = TIEMPOS.baile + azar() * TIEMPOS.baileAzar - (AGE() <= 3 ? 1 : 0);
  });
}

// estatua(): para la música de golpe (un rasguño de disco) y Tito dice la postura; cuando acaba de hablar, aguanta
// quieto unos segundos y luego celebra.
function estatua(): void {
  const p = POSES_ESTATUA[st.ronda % POSES_ESTATUA.length]!;
  Object.assign(st, { fase: 'quieto', t0: T, dur: 9e9, hablando: true });
  noise(0.25, 0.3, 900);
  tone(500, 0.25, 'sawtooth', 0.12, 0.4);
  say(p.frase, () => {
    st.hablando = false;
    st.t0 = T;
    st.dur = AGE() <= 3 ? TIEMPOS.quieto3 : TIEMPOS.quieto;
  });
}

// muyBien(): celebra la estatua de la ronda y pasa a la siguiente o, si era la última, al final.
function muyBien(): void {
  Object.assign(st, { fase: 'bien', t0: T, dur: 9e9 });
  SFX.good();
  burst(TITO_E.x, TITO_E.y - ALTO_E, 30);
  say(BIEN[st.ronda % BIEN.length]!, () => {
    st.ronda++;
    if (st.ronda < rondas()) bailar();
    else fin();
  });
}

// fin(): el juego ha terminado: lo apunta en S.cole y da las monedas si es la primera vez de hoy
// (terminarEnElPatio, escenas/patioComun.ts).
function fin(): void {
  Object.assign(st, { fase: 'fin', t0: T });
  terminarEnElPatio('estatuas', TITO_E.x, TITO_E.y - ALTO_E);
  say('¡Qué bien bailas! Has sido una estatua estupenda. ¿Jugamos otra vez?');
}

// dibujaTito(): Tito en grande: bailando (con el movimiento del baile de la ronda), quieto como estatua (con la postura,
// sin moverse nada) o contento (saltando).
function dibujaTito(): void {
  let dx = 0,
    dy = 0,
    rot = 0,
    sx = 1,
    sy = 1,
    sleep = false;
  if (st.fase === 'baile') {
    const m = movimiento(BAILES[st.ronda % BAILES.length]!.mov, T - st.t0);
    ({ dx, dy, rot } = m);
    sy = 1 - m.sq;
    sx = 1 + m.sq;
  } else if (st.fase === 'quieto') {
    const p = POSES_ESTATUA[st.ronda % POSES_ESTATUA.length]!;
    ({ sx, sy, rot } = p);
    sleep = !!p.sleep;
  } else if (st.fase === 'bien' || st.fase === 'fin') dy = -Math.abs(Math.sin((T - st.t0) * 7)) * 50;
  const salto = Math.max(0, 1 - (T - st.salto) * 3);
  dy -= Math.sin(salto * Math.PI) * 60;
  ctx.save();
  sombra(TITO_E.x + dx, TITO_E.y, TITO_E.w * 0.42 * (1 + dy / 600));
  ctx.translate(TITO_E.x + dx, TITO_E.y - ALTO_E / 2 + dy);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  drawTito(-TITO_E.w / 2, -ALTO_E / 2, TITO_E.w, { sleep, bubble: false });
  ctx.restore();
}

// dibujaBocadillo(): el bocadillo con lo que hay que imitar: bailando, el animal que se mueve al ritmo y notas; en la
// estatua, la postura y una cuenta de puntos que se van apagando mientras se aguanta quieto.
function dibujaBocadillo(): void {
  if (st.fase !== 'baile' && st.fase !== 'quieto') return;
  const B = BOCADILLO,
    baile = st.fase === 'baile';
  card(B.x - B.w / 2, B.y - B.h / 2, B.w, B.h, baile ? '#FFF6E6' : '#E8F4FF', 7, 40);
  ctx.beginPath();
  ctx.moveTo(B.x - B.w / 2 + 30, B.y + 60);
  ctx.lineTo(B.x - B.w / 2 - 70, B.y + 150);
  ctx.lineTo(B.x - B.w / 2 + 20, B.y + 120);
  ctx.closePath();
  ctx.fillStyle = baile ? '#FFF6E6' : '#E8F4FF';
  ctx.fill();
  if (baile) {
    const b = BAILES[st.ronda % BAILES.length]!,
      m = movimiento(b.mov, T - st.t0);
    pic(b.k, B.x + m.dx * 0.4, B.y - 20 + m.dy * 0.4, 220);
    text('¡A bailar!', B.x, B.y + B.h / 2 - 26, 38, '#E8554E');
  } else {
    const p = POSES_ESTATUA[st.ronda % POSES_ESTATUA.length]!;
    pic(p.k, B.x, B.y - 30, 210);
    text('¡Estatua!', B.x, B.y + B.h / 2 - 60, 44, '#5B8DEF');
    // la cuenta: puntos que se apagan mientras se aguanta (solo cuando Tito ya ha dicho la postura)
    const k = st.hablando ? 0 : Math.min(1, (T - st.t0) / st.dur);
    [0, 1, 2, 3, 4].forEach((i) =>
      circ(B.x - 80 + i * 40, B.y + B.h / 2 - 30, 12, i / 5 < 1 - k ? '#FFC93C' : '#E4DED6', 4),
    );
  }
}

// dibujaNotas(): notas musicales que suben desde Tito mientras suena la música.
function dibujaNotas(): void {
  if (st.fase !== 'baile') return;
  [0, 1, 2, 3].forEach((i) => {
    const k = (T * 0.7 + i / 4) % 1;
    ctx.globalAlpha = 1 - k;
    text(
      i % 2 ? '♪' : '♫',
      TITO_E.x - 180 + i * 120 + Math.sin(T * 3 + i) * 20,
      TITO_E.y - ALTO_E - k * 200,
      54,
      ['#FF6B5E', '#5B8DEF', '#7CC86E', '#9B8AD9'][i]!,
    );
  });
  ctx.globalAlpha = 1;
}

SCENES['estatuas'] = {
  music: null,
  // enter(): empieza una partida nueva: Tito explica el juego (la explicación larga solo la primera vez, S.first.estatuas)
  // y al acabar de hablar empieza el primer baile.
  enter(_o: OpcionesEscena) {
    Object.assign(st, { fase: 'intro', ronda: 0, t0: T, dur: 9e9, sig: T, n: 0, hablando: true, salto: -9 });
    const primera = !S.first['estatuas'];
    if (primera) {
      S.first['estatuas'] = 1;
      save();
    }
    later(400, () =>
      say(
        primera
          ? '¡Vamos a jugar a las estatuas! Cuando suene la música, baila conmigo. Cuando pare, ¡nos quedamos quietos como estatuas!'
          : '¡A las estatuas! Baila con la música y, cuando pare, ¡quieto!',
        () => bailar(),
      ),
    );
  },
  // update(): la música del baile (un paso cada PASO segundos, recuperando si se atrasa mucho) y el paso de una fase a
  // otra cuando se acaba su tiempo. La ayuda automática no sale: el juego avanza solo (VIVO.idle a 0).
  update() {
    VIVO.idle = 0;
    if (st.fase === 'baile') {
      if (st.sig < T - 0.5) st.sig = T;
      // los pasos que ya tocan (normalmente 0 o 1 por cuadro)
      const k = st.sig <= T ? Math.floor((T - st.sig) / PASO) + 1 : 0;
      Array.from({ length: k }, () => paso(st.n++));
      st.sig += k * PASO;
      if (T - st.t0 > st.dur) estatua();
    } else if (st.fase === 'quieto' && T - st.t0 > st.dur) muyBien();
  },
  // prompt(): repite lo que toca hacer.
  prompt() {
    if (st.fase === 'quieto') say('¡Quietos como estatuas!');
    else if (st.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else say('¡Baila con la música!');
  },
  // hint(): al final, el botón de otra vez; mientras se juega, nada (el juego avanza solo).
  hint() {
    return st.fase === 'fin' ? { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, las rondas, Tito, las notas, el bocadillo y, al final, el botón de otra vez; la casa y las monedas.
  draw() {
    fondoPatio();
    dibujaRondas(rondas(), st.ronda);
    dibujaTito();
    dibujaNotas();
    dibujaBocadillo();
    if (st.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el patio; monedas -> tienda; al final, otra vez -> otra partida; Tito -> da un saltito; en
  // cualquier otro sitio, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('patio');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (st.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    if (dist(x, y, TITO_E.x, TITO_E.y - ALTO_E / 2) < TITO_E.w / 2 && st.fase !== 'quieto') {
      SFX.boing();
      st.salto = T;
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
