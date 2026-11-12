/*
 * escenas/circuito.ts: el circuito de psicomotricidad del patio (idea 15 de docs/IDEAS-MEJORA.md, fase P13b), la escena
 * SCENES.circuito. Se abre desde su botón del patio (escenas/patio.ts). En el patio están los aros, el túnel, el banco,
 * los conos y la colchoneta. En cada vuelta (planCircuito, dominio/circuito.ts):
 *   1. La profe dice el orden («Primero, el túnel. Después, el banco. Y al final, los aros.»); mientras lo nombra, cada
 *      obstáculo brilla.
 *   2. El niño programa a Tito: toca los obstáculos en ese orden y cada uno llena su ficha numerada de la tira de
 *      arriba. Con 3 años las fichas se ven antes, flojitas (CIRCUITO.fichasHasta); con 4 y 5 se recuerda. Si toca uno
 *      que no va, se le dice y la profe repite el orden; la oreja de la tira también lo repite.
 *   3. Tito hace el recorrido: va a cada obstáculo y lo hace (salta dentro de los aros, pasa por dentro del túnel, anda
 *      por encima del banco, da la vuelta alrededor de los conos y da una voltereta en la colchoneta), diciendo cómo.
 * Tras CIRCUITO.vueltas vueltas, como en los demás juegos del patio, se apunta en S.cole con sus monedas
 * (terminarEnElPatio) y salen el cartel y el botón «Otra vez». La casa vuelve al patio. Practica los conceptos
 * espaciales (dentro, encima, alrededor), la memoria de órdenes y las secuencias. Es en 2D, como el resto del patio
 * (las carreras son las únicas en 3D).
 * Exporta: CIRCUITO_ST (el estado de la partida, para las pruebas), PUESTOS (dónde está cada obstáculo en la pantalla)
 * y pone SCENES.circuito.
 * Importa: el núcleo (dibujo, voz, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de dominio/circuito.ts, el
 * fondo del patio y lo común del patio.
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
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  easeOut,
  ell,
  go,
  inCoinHUD,
  later,
  pic,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { CIRCUITO, frasesDelOrden, obstaculo, planCircuito } from '../dominio/circuito.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Las fases: Tito explica, la profe dice el orden, el niño programa, Tito recorre, se celebra la vuelta o se acaba. */
type FaseCircuito = 'intro' | 'orden' | 'programa' | 'recorre' | 'bien' | 'fin';
/** Un punto de la pantalla. */
type Punto = { x: number; y: number };
/** Dónde está un obstáculo en la pantalla: su centro (donde lo hace Tito) y lo que mide la zona que se toca. */
interface Puesto extends Punto {
  readonly id: string;
  readonly w: number;
  readonly h: number;
}

// PUESTOS: dónde está cada obstáculo en el patio (dos filas, para que quepan la profe a la derecha y Tito a la
// izquierda, abajo).
export const PUESTOS: readonly Puesto[] = [
  { id: 'aros', x: 360, y: 480, w: 330, h: 170 },
  { id: 'tunel', x: 790, y: 470, w: 330, h: 190 },
  { id: 'banco', x: 1210, y: 480, w: 330, h: 170 },
  { id: 'conos', x: 560, y: 720, w: 330, h: 170 },
  { id: 'colchoneta', x: 1000, y: 720, w: 330, h: 170 },
];
// SALIDA: dónde espera Tito (los pies) antes de empezar el recorrido y adonde vuelve.
const SALIDA: Punto = { x: 170, y: 800 };
// MEDIDAS: lo que tarda Tito en ir a un obstáculo y en hacerlo, el tamaño de Tito al recorrer, la tira de fichas
// (centro y alto, y ancho de cada ficha) y la oreja que repite el orden.
const MEDIDAS = { va: 1.1, hace: 1.8, tito: 150, tira: { y: 165, h: 110, ficha: 120 }, oreja: 46 };
// COLORES: los colores de los obstáculos.
const COLORES = { aros: ['#E8574F', '#FFC93C', '#5DADE2'], tunel: '#9B7FD4', banco: '#C98B4F', cono: '#FF8A3D' };

// CIRCUITO_ST: el estado de la partida: la fase y cuándo empezó, las vueltas y en cuál va, lo que ha programado el niño,
// qué obstáculo nombra ahora la profe (-1: ninguno), por qué paso del recorrido va Tito y desde cuándo (y si ya ha
// dicho lo de ese paso) y cuándo se avisó de un toque que no iba.
export const CIRCUITO_ST = {
  fase: 'intro' as FaseCircuito,
  t0: 0,
  plan: [] as string[][],
  v: 0,
  prog: [] as string[],
  nombra: -1,
  paso: 0,
  pasoT: 0,
  dicho: -1,
  aviso: -9,
};

// sigue(): ¿se sigue en la escena del circuito? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'circuito';
// puesto(id): dónde está en la pantalla el obstáculo con ese id.
const puesto = (id: string): Puesto => PUESTOS.find((p) => p.id === id) ?? PUESTOS[0]!;
// vuelta(): los obstáculos de la vuelta de ahora, en orden.
const vuelta = (): readonly string[] => CIRCUITO_ST.plan[CIRCUITO_ST.v] ?? [];
// toca(): el obstáculo que tiene que tocar ahora el niño.
const toca = (): string | undefined => vuelta()[CIRCUITO_ST.prog.length];
// enPuesto(x, y): el obstáculo que hay en (x, y), o undefined.
const enPuesto = (x: number, y: number): Puesto | undefined =>
  PUESTOS.find((p) => Math.abs(x - p.x) < p.w / 2 && Math.abs(y - p.y) < p.h / 2);
// mezcla(a, b, k): el punto que hay de a a b en la parte k (de 0 a 1).
const mezcla = (a: Punto, b: Punto, k: number): Punto => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
// fichaX(i, n): el centro de la ficha i de la tira cuando hay n.
const fichaX = (i: number, n: number): number => W / 2 - ((n - 1) * MEDIDAS.tira.ficha) / 2 + i * MEDIDAS.tira.ficha;
// orejaEn(): dónde está la oreja que repite el orden, a la derecha de la tira.
const orejaEn = (): Punto => ({
  x: fichaX(vuelta().length - 1, vuelta().length) + MEDIDAS.tira.ficha / 2 + 55,
  y: MEDIDAS.tira.y,
});

// decir(frases, fin, i): la profe dice las frases una tras otra (marcando qué obstáculo nombra) y después llama a fin.
function decir(frases: readonly string[], fin: () => void, i = 0): void {
  const st = CIRCUITO_ST;
  if (i >= frases.length) {
    st.nombra = -1;
    fin();
    return;
  }
  sayQ(frases[i] ?? '', () => {
    if (sigue() && st.fase === 'orden') decir(frases, fin, i + 1);
  });
  later(300, () => {
    if (sigue() && st.fase === 'orden') st.nombra = i;
  });
}

// decirOrden(nueva): la profe dice el orden de la vuelta; con nueva, empieza a programarse de cero; si no (repetir),
// se queda lo ya programado. Después, le toca al niño.
function decirOrden(nueva: boolean): void {
  const st = CIRCUITO_ST;
  Object.assign(st, { fase: 'orden', t0: T, nombra: -1 });
  if (nueva) st.prog = [];
  decir(frasesDelOrden(vuelta()), () => {
    Object.assign(st, { fase: 'programa', t0: T });
    if (nueva) sayQ('¡Te toca! Toca los obstáculos en orden.');
  });
}

// tocarPrograma(p): mientras el niño programa, ha tocado el obstáculo p: si es el que va, llena su ficha (y, con la
// última, Tito empieza el recorrido); si no, se le dice y la profe repite el orden (como mucho cada 2,5 segundos).
function tocarPrograma(p: Puesto): void {
  const st = CIRCUITO_ST;
  if (p.id !== toca()) {
    SFX.boing();
    if (T - st.aviso > 2.5) {
      st.aviso = T;
      st.fase = 'orden';
      sayQ('¡Ese no toca ahora! Escucha otra vez.', () => {
        if (sigue()) decirOrden(false);
      });
    }
    return;
  }
  SFX.good();
  sparkles(p.x, p.y - 40, 10);
  st.prog = [...st.prog, p.id];
  if (st.prog.length < vuelta().length) return;
  Object.assign(st, { fase: 'recorre', t0: T, paso: -1, dicho: -1 });
  sayQ('¡Ya está! Allá voy.', () => {
    if (sigue() && st.fase === 'recorre') Object.assign(st, { paso: 0, pasoT: T });
  });
}

// recorrer(): Tito va de obstáculo en obstáculo; al llegar a cada uno dice qué hace y lo hace; después del último,
// vuelve a la salida y se celebra la vuelta.
function recorrer(): void {
  const st = CIRCUITO_ST;
  if (st.paso < 0) return;
  const t = T - st.pasoT,
    o = obstaculo(vuelta()[st.paso] ?? '');
  if (t >= MEDIDAS.va && st.dicho !== st.paso && o) {
    st.dicho = st.paso;
    SFX.whoosh();
    say(o.accion);
  }
  if (t < MEDIDAS.va + MEDIDAS.hace) return;
  if (st.paso < vuelta().length - 1) {
    Object.assign(st, { paso: st.paso + 1, pasoT: T });
    return;
  }
  terminarVuelta();
}

// terminarVuelta(): Tito ha hecho la vuelta entera: chispas y, si quedan vueltas, la siguiente; si no, se acaba.
function terminarVuelta(): void {
  const st = CIRCUITO_ST;
  SFX.good();
  sparkles(W / 2, 400, 20);
  Object.assign(st, { fase: 'bien', t0: T, v: st.v + 1, paso: -1 });
  if (st.v >= st.plan.length) {
    acabar();
    return;
  }
  sayQ('¡Muy bien! Vamos con otra vuelta.', () => {
    if (sigue() && st.fase === 'bien') decirOrden(true);
  });
}

// acabar(): se han hecho todas las vueltas: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  CIRCUITO_ST.fase = 'fin';
  terminarEnElPatio('circuito', W / 2, 400);
  say('¡Qué buen circuito hemos hecho! ¿Lo hacemos otra vez?');
}

// dibujaAros(x, y, k): tres aros en el suelo, de colores.
function dibujaAros(x: number, y: number, k: number): void {
  COLORES.aros.forEach((c, i) => ell(x + (i - 1) * 105 * k, y + 20 * k, 48 * k, 20 * k, null, 10 * k, c));
}

// dibujaTunel(x, y, k): el túnel de tela, un medio tubo a rayas con la boca oscura.
function dibujaTunel(x: number, y: number, k: number): void {
  card(x - 140 * k, y - 70 * k, 280 * k, 110 * k, COLORES.tunel, 6 * k, 55 * k);
  [-80, -25, 30, 85].forEach((dx) => card(x + (dx - 8) * k, y - 66 * k, 16 * k, 102 * k, '#B9A4E8', 0, 6 * k));
  ell(x - 128 * k, y - 15 * k, 26 * k, 52 * k, '#4A3A6B', 6 * k);
}

// dibujaBanco(x, y, k): el banco sueco del gimnasio: una tabla larga con patas.
function dibujaBanco(x: number, y: number, k: number): void {
  [-110, 110].forEach((dx) => card(x + (dx - 10) * k, y - 10 * k, 20 * k, 45 * k, '#8A5A2B', 5 * k, 4 * k));
  card(x - 145 * k, y - 32 * k, 290 * k, 30 * k, COLORES.banco, 6 * k, 10 * k);
}

// dibujaCono(x, y, k): un cono naranja con su raya blanca.
function dibujaCono(x: number, y: number, k: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y - 60 * k);
  ctx.lineTo(x + 28 * k, y + 20 * k);
  ctx.lineTo(x - 28 * k, y + 20 * k);
  ctx.closePath();
  ctx.fillStyle = COLORES.cono;
  ctx.fill();
  ctx.lineWidth = 5 * k;
  ctx.strokeStyle = '#3B2A1A';
  ctx.lineJoin = 'round';
  ctx.stroke();
  card(x - 18 * k, y - 22 * k, 36 * k, 10 * k, '#fff', 0, 4 * k);
  card(x - 40 * k, y + 16 * k, 80 * k, 12 * k, COLORES.cono, 5 * k, 5 * k);
}

// dibujaColchoneta(x, y, k): la colchoneta azul con sus costuras.
function dibujaColchoneta(x: number, y: number, k: number): void {
  card(x - 140 * k, y - 20 * k, 280 * k, 55 * k, '#5DADE2', 6 * k, 16 * k);
  [-47, 47].forEach((dx) => card(x + (dx - 2) * k, y - 16 * k, 4 * k, 47 * k, '#3C8DC4', 0, 2 * k));
}

// dibujaObstaculo(id, x, y, k): el dibujo del obstáculo id con su centro en (x, y) y escala k (1 en el patio, más
// pequeño en las fichas).
function dibujaObstaculo(id: string, x: number, y: number, k: number): void {
  if (id === 'aros') dibujaAros(x, y, k);
  else if (id === 'tunel') dibujaTunel(x, y, k);
  else if (id === 'banco') dibujaBanco(x, y, k);
  else if (id === 'conos') [-95, 0, 95].forEach((dx) => dibujaCono(x + dx * k, y, k));
  else dibujaColchoneta(x, y, k);
}

// dibujaPuesto(p): un obstáculo del patio con su sombra y su nombre; brilla mientras la profe lo nombra.
function dibujaPuesto(p: Puesto): void {
  const st = CIRCUITO_ST,
    nombrado = st.fase === 'orden' && st.nombra >= 0 && vuelta()[st.nombra] === p.id;
  if (nombrado) ell(p.x, p.y, p.w / 2, p.h / 2, 'rgba(255,233,140,.75)', 0);
  sombra(p.x, p.y + 40, 130);
  dibujaObstaculo(p.id, p.x, p.y, 1);
  text(obstaculo(p.id)?.nombre ?? '', p.x, p.y + 82, 30, '#3B2A1A', { max: p.w - 20 });
}

// dibujaTira(): la tira de fichas del programa, arriba: las ya tocadas con su obstáculo y su número; las que faltan,
// vacías (con 3 años, con el obstáculo flojito); a la derecha, la oreja que repite el orden.
function dibujaTira(): void {
  const st = CIRCUITO_ST,
    v = vuelta(),
    n = v.length,
    m = MEDIDAS.tira,
    conFichas = AGE() <= CIRCUITO.fichasHasta,
    o = orejaEn();
  if (!n) return;
  card(fichaX(0, n) - m.ficha / 2 - 15, m.y - m.h / 2, n * m.ficha + 135, m.h, '#fff', 6, 30);
  v.forEach((id, i) => {
    const x = fichaX(i, n),
      hecha = i < st.prog.length;
    card(x - 50, m.y - 45, 100, 90, hecha ? '#E6F6DD' : '#F4F1EA', 4, 18);
    if (hecha || conFichas) {
      ctx.save();
      ctx.globalAlpha *= hecha ? 1 : 0.3;
      dibujaObstaculo(id, x, m.y + 5, 0.3);
      ctx.restore();
    }
    circ(x - 42, m.y - 40, 17, '#FFC93C', 4);
    text(i + 1, x - 42, m.y - 31, 24);
  });
  circ(o.x, o.y, MEDIDAS.oreja, '#FFF4D6', 5);
  pic('oreja', o.x, o.y, 64);
}

// dibujaTitoQuieto(): Tito esperando en la salida (en la vuelta celebra con un saltito).
function dibujaTitoQuieto(): void {
  const st = CIRCUITO_ST,
    salto = st.fase === 'bien' ? Math.abs(Math.sin((T - st.t0) * 6)) * 30 : 0;
  sombra(SALIDA.x, SALIDA.y, 60);
  drawTito(SALIDA.x - MEDIDAS.tito / 2, SALIDA.y - MEDIDAS.tito * 0.8 - salto, MEDIDAS.tito, { bubble: false });
}

// titoHaciendo(id, p, k): dónde está Tito (los pies) haciendo el obstáculo id del puesto p, en la parte k (de 0 a 1), y
// cuánto va girado (la voltereta).
function titoHaciendo(id: string, p: Puesto, k: number): { x: number; y: number; giro: number } {
  if (id === 'aros') return { x: p.x - 105 + 210 * k, y: p.y + 20 - Math.abs(Math.sin(k * Math.PI * 3)) * 60, giro: 0 };
  if (id === 'banco') return { x: p.x - 120 + 240 * k, y: p.y - 30, giro: 0 };
  if (id === 'conos') {
    const a = Math.PI + k * Math.PI * 2;
    return { x: p.x + Math.cos(a) * 150, y: p.y + 30 + Math.sin(a) * 45, giro: 0 };
  }
  if (id === 'colchoneta') return { x: p.x - 90 + 180 * k, y: p.y + 10, giro: easeOut(k) * Math.PI * 2 };
  return { x: p.x - 140 + 280 * k, y: p.y + 30, giro: 0 };
}

// dibujaTitoRecorre(): Tito en el recorrido: yendo al obstáculo (desde la salida o el anterior) o haciéndolo; dentro
// del túnel no se ve (el túnel se vuelve a dibujar encima).
function dibujaTitoRecorre(): void {
  const st = CIRCUITO_ST;
  if (st.paso < 0) {
    dibujaTitoQuieto();
    return;
  }
  const id = vuelta()[st.paso] ?? '',
    p = puesto(id),
    t = T - st.pasoT,
    desde = st.paso === 0 ? SALIDA : titoHaciendo(vuelta()[st.paso - 1] ?? '', puesto(vuelta()[st.paso - 1] ?? ''), 1),
    inicio = titoHaciendo(id, p, 0),
    pos =
      t < MEDIDAS.va
        ? { ...mezcla(desde, inicio, easeOut(t / MEDIDAS.va)), giro: 0 }
        : titoHaciendo(id, p, Math.min(1, (t - MEDIDAS.va) / MEDIDAS.hace)),
    w = MEDIDAS.tito,
    andando = t < MEDIDAS.va ? Math.abs(Math.sin(T * 10)) * 12 : 0;
  sombra(pos.x, Math.max(pos.y, p.y + 20), 50);
  ctx.save();
  ctx.translate(pos.x, pos.y - w * 0.4 - andando);
  ctx.rotate(pos.giro);
  drawTito(-w / 2, -w * 0.4, w, { bubble: false });
  ctx.restore();
  if (id === 'tunel' && t >= MEDIDAS.va) dibujaTunel(p.x, p.y, 1);
}

SCENES['circuito'] = {
  music: 'jardin',
  // enter(): una partida nueva con sus vueltas (planCircuito); Tito lo explica y la profe dice el primer orden.
  enter(_o: OpcionesEscena) {
    Object.assign(CIRCUITO_ST, { fase: 'intro', t0: T, plan: planCircuito(AGE(), azar), v: 0, prog: [], nombra: -1 });
    Object.assign(CIRCUITO_ST, { paso: -1, pasoT: 0, dicho: -1, aviso: -9 });
    later(400, () =>
      sayQ('¡Vamos a hacer el circuito! Escucha a la profe y toca los obstáculos en el orden que diga.', () => {
        if (sigue()) decirOrden(true);
      }),
    );
  },
  // update(): en el recorrido, Tito avanza. La ayuda automática no sale mientras se explica, se dice el orden o Tito
  // recorre.
  update() {
    const st = CIRCUITO_ST;
    if (st.fase !== 'programa' && st.fase !== 'fin') VIVO.idle = 0;
    if (st.fase === 'recorre') recorrer();
  },
  // prompt(): repite lo que toca.
  prompt() {
    const f = CIRCUITO_ST.fase;
    if (f === 'fin') say('Toca la flecha para jugar otra vez.');
    else if (f === 'programa') decirOrden(false);
  },
  // hint(): mientras el niño programa, el obstáculo que va; al final, el botón de otra vez.
  hint() {
    const st = CIRCUITO_ST;
    if (st.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    const id = toca();
    if (st.fase !== 'programa' || !id) return null;
    const p = puesto(id);
    return { x: p.x, y: p.y, r: 120 };
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, los obstáculos, la profe, Tito (quieto o recorriendo), las vueltas y la tira del programa y, al
  // final, el cartel y el botón de otra vez.
  draw() {
    fondoPatio();
    const st = CIRCUITO_ST;
    PUESTOS.forEach(dibujaPuesto);
    sombra(1430, 860, 70);
    pic('maestra', 1430, 720, 260);
    if (st.fase === 'recorre') dibujaTitoRecorre();
    else dibujaTitoQuieto();
    dibujaRondas(st.plan.length, st.v);
    if (st.fase === 'fin') dibujaFinal();
    else if (st.fase !== 'intro') dibujaTira();
    else {
      card(W / 2 - 200, 130, 400, 70, '#fff', 6, 35);
      text('El circuito', W / 2, 180, 40);
    }
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el patio; monedas -> tienda; al final, otra vez; la oreja repite el orden; mientras el niño
  // programa, un obstáculo; si no, chispas.
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
    const st = CIRCUITO_ST;
    if (st.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    const o = orejaEn();
    if (st.fase === 'programa' && dist(x, y, o.x, o.y) < MEDIDAS.oreja + 10) {
      SFX.pop();
      decirOrden(false);
      return;
    }
    const p = enPuesto(x, y);
    if (p && st.fase === 'programa') {
      tocarPrograma(p);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
