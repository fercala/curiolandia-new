/*
 * escenas/sillas.ts: las sillas musicales, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12d), la
 * escena SCENES.sillas, sin eliminar a nadie. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts).
 * Tito y sus amigos bailan en corro alrededor de las sillas mientras suena la música (y el niño baila con ellos). Cuando
 * para (a los segundos de planSillas, dominio/juegosCortos.ts, distintos en cada ronda), los amigos corren a sentarse y
 * se toca la silla libre para que se siente Tito. En cada ronda hay una silla menos, pero nadie se va: los que se quedan
 * sin silla se sientan encima de otro (repartoSillas), y al final todos caben en dos sillas. Si se toca mientras suena
 * la música, Tito recuerda que hay que seguir bailando (sin quitar nada). Al final, como en los demás juegos del patio,
 * se apunta en S.cole con sus monedas (terminarEnElPatio) y salen el cartel y el botón «Otra vez». La casa vuelve al
 * menú de los juegos cortos. Practica escuchar y moverse con la música, y compartir.
 * Exporta: SILLAS_ST (el estado de la partida, para las pruebas), sitioSilla y pone SCENES.sillas.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de
 * dominio/juegosCortos.ts, el fondo del patio y lo común del patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, notas y tiempos en la pantalla de 1600x900, como
   en el resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  SCENES,
  SFX,
  T,
  VIVO,
  W,
  atHome,
  card,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  easeOut,
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
import { planSillas, repartoSillas, type RondaSillas } from '../dominio/juegosCortos.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Las fases: Tito explica, suena la música (se baila), se para (a sentarse), todos sentados (pausa) o se acaba. */
type FaseSillas = 'intro' | 'suena' | 'sientate' | 'sentados' | 'fin';
/** Un punto de la pantalla. */
type Sitio = { x: number; y: number };

// MEDIDAS: el centro del corro, los radios del óvalo de las sillas y del de los que bailan, lo rápido que gira el corro
// (vueltas por segundo), lo que tardan en sentarse, lo alto que queda uno encima de otro, el tamaño de las sillas, de
// los amigos y de Tito, y lo que toca una silla.
const MEDIDAS = {
  c: { x: 800, y: 560 },
  sillas: { rx: 250, ry: 110 },
  corro: { rx: 430, ry: 210 },
  giro: 0.09,
  sentarse: 0.7,
  encima: 42,
  silla: 110,
  amigo: 100,
  tito: 130,
  toca: 75,
};
// AMIGOS: los dibujos de los amigos que juegan con Tito (hasta seis).
const AMIGOS = ['conejo', 'ardilla', 'erizo', 'pinguino', 'cerdito', 'pollito'];
// MELODIA: las notas (en hercios) de la música del corro, en bucle, y lo que dura cada una.
const MELODIA = {
  notas: [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 988, 784, 659, 587],
  paso: 0.26,
};
// FRASES_SENTADOS: lo que dice Tito cuando ya están todos sentados, por turnos (desde la segunda ronda, alguno encima de
// otro).
const FRASES_SENTADOS = [
  '¡Nadie se queda sin silla! Nos sentamos unos encima de otros.',
  '¡Aquí cabemos todos! Qué risa.',
  '¡Una silla menos, pero cabemos todos!',
];

// SILLAS_ST: el estado de la partida: la fase y cuándo empezó, los amigos, las rondas, la ronda, el giro del corro
// (vueltas), la nota que suena y cuándo sonó, dónde estaba cada uno al parar la música (Tito el primero), si Tito ya se
// ha sentado (y cuándo) y cuándo avisó Tito de seguir bailando.
export const SILLAS_ST = {
  fase: 'intro' as FaseSillas,
  t0: 0,
  amigos: 0,
  rondas: [] as RondaSillas[],
  ronda: 0,
  giro: 0,
  nota: 0,
  notaT: 0,
  parados: [] as Sitio[],
  tito: 0,
  aviso: -9,
};

// sigue(): ¿se sigue en la escena de las sillas? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'sillas';
// ronda(): la ronda de ahora.
const ronda = (): RondaSillas | undefined => SILLAS_ST.rondas[SILLAS_ST.ronda];
// sillas(): las sillas que hay en esta ronda.
const sillas = (): number => ronda()?.sillas ?? 2;

// sitioSilla(i, n): dónde está la silla i de n, en el óvalo del medio (la primera, arriba).
export function sitioSilla(i: number, n: number): Sitio {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(1, n);
  return { x: MEDIDAS.c.x + Math.cos(a) * MEDIDAS.sillas.rx, y: MEDIDAS.c.y + Math.sin(a) * MEDIDAS.sillas.ry };
}

// enCorro(j): dónde está, bailando, el que va en el puesto j del corro (Tito es el 0), con el giro de ahora.
function enCorro(j: number): Sitio {
  const total = SILLAS_ST.amigos + 1,
    a = (SILLAS_ST.giro + j / total) * Math.PI * 2;
  return { x: MEDIDAS.c.x + Math.cos(a) * MEDIDAS.corro.rx, y: MEDIDAS.c.y + Math.sin(a) * MEDIDAS.corro.ry };
}

// mezcla(a, b, k): el punto que hay de a a b en la parte k (de 0 a 1).
const mezcla = (a: Sitio, b: Sitio, k: number): Sitio => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

// sentado(silla, encima): dónde queda alguien sentado en una silla de su reparto (más arriba cuanto más encima).
function sentado(silla: number, encima: number): Sitio {
  const s = sitioSilla(silla, sillas());
  return { x: s.x, y: s.y - 10 - encima * MEDIDAS.encima };
}

// empezarRonda(): empieza a sonar la música de la ronda de ahora: todos bailan en corro.
function empezarRonda(): void {
  Object.assign(SILLAS_ST, { fase: 'suena', t0: T, nota: 0, notaT: 0, tito: 0 });
}

// parar(): se para la música: cada uno se queda donde estaba y los amigos corren a sentarse; Tito espera a que se toque
// su silla.
function parar(): void {
  const s = SILLAS_ST;
  Object.assign(s, {
    fase: 'sientate',
    t0: T,
    parados: Array.from({ length: s.amigos + 1 }, (_, j) => enCorro(j)),
  });
  SFX.whoosh();
  say('¡Se para la música! ¡Toca la silla libre para que me siente!');
}

// tocarSilla(x, y): mientras hay que sentarse, si se toca la silla libre, Tito corre a sentarse; después, todos
// sentados: Tito lo celebra y sigue la ronda siguiente (con una silla menos) o se acaba.
function tocarSilla(x: number, y: number): boolean {
  const s = SILLAS_ST,
    libre = sitioSilla(sillas() - 1, sillas());
  if (s.tito || dist(x, y, libre.x, libre.y - 20) > MEDIDAS.toca) return false;
  Object.assign(s, { tito: T, fase: 'sentados' });
  SFX.good();
  sparkles(libre.x, libre.y - 40, 12);
  s.ronda++;
  if (s.ronda >= s.rondas.length) {
    later(MEDIDAS.sentarse * 1000, () => {
      if (sigue() && s.fase === 'sentados') acabar();
    });
    return true;
  }
  const frase =
    s.ronda === 1 ? '¡Ya estamos todos sentados!' : (FRASES_SENTADOS[(s.ronda - 2) % FRASES_SENTADOS.length] ?? '');
  sayQ(frase, () => {
    if (sigue() && s.fase === 'sentados')
      sayQ('Quito una silla. ¡Otra vez música!', () => {
        if (sigue() && s.fase === 'sentados') empezarRonda();
      });
  });
  return true;
}

// acabar(): se han hecho todas las rondas: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  SILLAS_ST.fase = 'fin';
  terminarEnElPatio('sillas', W / 2, 400);
  say('¡Siempre hay sitio para todos! Ha sido muy divertido. ¿Jugamos otra vez?');
}

// musica(): mientras suena, la nota siguiente de la melodía cuando le toca (y al pasar su tiempo, para).
function musica(): void {
  const s = SILLAS_ST,
    r = ronda();
  if (!r) return;
  if (T - s.t0 > r.musica) {
    parar();
    return;
  }
  if (T - s.notaT < MELODIA.paso) return;
  const f = MELODIA.notas[s.nota % MELODIA.notas.length] ?? 523;
  tone(f, MELODIA.paso * 0.85, 'triangle', 0.22);
  Object.assign(s, { nota: s.nota + 1, notaT: T });
}

// donde(j): dónde está ahora el que va en el puesto j (Tito, el 0): bailando en el corro, corriendo a su silla o
// sentado; y si está sentado (para dibujarlo encima de la silla) y encima de cuántos.
function donde(j: number): { p: Sitio; sentado: boolean; encima: number } {
  const s = SILLAS_ST;
  if (s.fase === 'suena' || s.fase === 'intro' || !s.parados.length)
    return { p: enCorro(j), sentado: false, encima: 0 };
  const desde = s.parados[j] ?? enCorro(j);
  if (j === 0) {
    if (!s.tito) return { p: desde, sentado: false, encima: 0 };
    const k = easeOut(Math.min(1, (T - s.tito) / MEDIDAS.sentarse));
    return { p: mezcla(desde, sentado(sillas() - 1, 0), k), sentado: k >= 1, encima: 0 };
  }
  const r = repartoSillas(s.amigos, sillas())[j - 1] ?? { silla: 0, encima: 0 },
    k = easeOut(Math.min(1, (T - s.t0) / MEDIDAS.sentarse));
  return { p: mezcla(desde, sentado(r.silla, r.encima), k), sentado: k >= 1, encima: r.encima };
}

// dibujaJugador(j, d): dibuja al del puesto j (Tito, el 0) donde esté; bailando, da saltitos.
function dibujaJugador(j: number, d: { p: Sitio; sentado: boolean }): void {
  const salto = SILLAS_ST.fase === 'suena' ? Math.abs(Math.sin(T * 7 + j)) * 18 : 0;
  if (!d.sentado) sombra(d.p.x, d.p.y + 4, 36);
  if (j === 0) {
    const h = (MEDIDAS.tito * 200) / 240;
    drawTito(d.p.x - MEDIDAS.tito / 2, d.p.y - h - salto + (d.sentado ? 30 : 0), MEDIDAS.tito, { bubble: false });
    return;
  }
  pic(AMIGOS[(j - 1) % AMIGOS.length] ?? 'conejo', d.p.x, d.p.y - MEDIDAS.amigo / 2 - salto, MEDIDAS.amigo);
}

// dibujaCorro(): las sillas y los que juegan, de atrás adelante (por su altura en la pantalla); la silla libre brilla
// mientras Tito espera para sentarse.
function dibujaCorro(): void {
  const s = SILLAS_ST,
    n = sillas(),
    jugadores = Array.from({ length: s.amigos + 1 }, (_, j) => ({ j, d: donde(j) })),
    cosas = [
      ...Array.from({ length: n }, (_, i) => ({ y: sitioSilla(i, n).y - 1, dibuja: () => dibujaSilla(i, n) })),
      ...jugadores.map(({ j, d }) => ({
        y: d.p.y + (d.sentado ? d.encima * MEDIDAS.encima + 10 : 0),
        dibuja: () => dibujaJugador(j, d),
      })),
    ].sort((a, b) => a.y - b.y);
  cosas.forEach((c) => c.dibuja());
}

// dibujaSilla(i, n): la silla i de n; si es la libre y Tito espera, con un círculo que brilla.
function dibujaSilla(i: number, n: number): void {
  const p = sitioSilla(i, n),
    libre = SILLAS_ST.fase === 'sientate' && i === n - 1;
  if (libre) {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(T * 6) * 0.25;
    ctx.fillStyle = '#FFE27A';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 20, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  sombra(p.x, p.y + 50, 44);
  pic('silla', p.x, p.y, MEDIDAS.silla);
}

SCENES['sillas'] = {
  music: null,
  // enter(): una partida nueva con sus amigos y rondas (planSillas); Tito lo explica y empieza la música.
  enter(_o: OpcionesEscena) {
    const plan = planSillas(AGE(), azar);
    Object.assign(SILLAS_ST, { fase: 'intro', t0: T, amigos: plan.amigos, rondas: plan.rondas, ronda: 0, giro: 0 });
    Object.assign(SILLAS_ST, { nota: 0, notaT: 0, parados: [], tito: 0, aviso: -9 });
    later(400, () =>
      sayQ(
        '¡Las sillas musicales! Baila con nosotros mientras suena la música. Cuando pare, toca la silla libre para que me siente. ¡Aquí nadie se queda fuera!',
        () => {
          if (sigue()) empezarRonda();
        },
      ),
    );
  },
  // update(dt): mientras suena la música, el corro gira y suenan sus notas (hasta que para). La ayuda automática no sale
  // mientras Tito explica, suena la música o se sientan.
  update(dt: number) {
    const s = SILLAS_ST;
    if (s.fase !== 'sientate' && s.fase !== 'fin') VIVO.idle = 0;
    if (s.fase !== 'suena') return;
    s.giro += MEDIDAS.giro * dt;
    musica();
  },
  // prompt(): repite lo que toca.
  prompt() {
    const f = SILLAS_ST.fase;
    if (f === 'fin') say('Toca la flecha para jugar otra vez.');
    else if (f === 'sientate') say('Toca la silla libre para que me siente.');
    else if (f === 'suena') say('¡Baila mientras suena la música!');
  },
  // hint(): cuando para la música, la silla libre; al final, el botón de otra vez.
  hint() {
    const s = SILLAS_ST;
    if (s.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    if (s.fase !== 'sientate' || s.tito) return null;
    const p = sitioSilla(sillas() - 1, sillas());
    return { x: p.x, y: p.y - 20, r: MEDIDAS.toca };
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, las sillas y el corro, las rondas, el cartel del juego (con una nota mientras suena la música) y,
  // al final, el botón de otra vez.
  draw() {
    fondoPatio();
    const s = SILLAS_ST;
    dibujaCorro();
    dibujaRondas(s.rondas.length, s.ronda);
    card(W / 2 - 200, 110, 400, 70, '#fff', 6, 35);
    text('Las sillas', W / 2, 160, 40);
    if (s.fase === 'suena') pic('notas', W / 2 + 250, 140 + Math.sin(T * 6) * 8, 80);
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; cuando para la música, la silla libre;
  // mientras suena, Tito recuerda que hay que bailar (como mucho cada 3 segundos); si no, chispas.
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
    const s = SILLAS_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    if (s.fase === 'sientate' && tocarSilla(x, y)) return;
    if (s.fase === 'suena' && T - s.aviso > 3) {
      s.aviso = T;
      SFX.boing();
      say('¡Todavía suena la música! Sigue bailando.');
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
