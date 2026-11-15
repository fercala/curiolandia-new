/*
 * escenas/aventura.ts: la gran aventura de Tito (idea 26 de docs/IDEAS-MEJORA.md, fase P16), «El mapa del tesoro
 * perdido»: una historia por capítulos, uno nuevo cada día. En el mapa 3D hay un botón con un mapa del tesoro
 * (AVENTURA_BOTON, debajo del de la cámara; con una exclamación cuando hoy hay un capítulo por jugar) que abre
 * SCENES.aventura: el mapa del tesoro roto en seis trozos (los que ya se tienen, en su sitio; los que faltan, con su
 * número) y debajo una medalla por capítulo: hecho (con su marca), abierto (salta un poco), para mañana (con la luna),
 * cerrado (con el candado) o «¡Muy pronto!» si aún no existe. Al tocar uno abierto o hecho se juega en
 * SCENES.aventuraCap: primero su cuento (Story, con las páginas de contenido/aventura.ts), después su reto (uno de los
 * juegos de siempre, retoDe) y al final el trozo del mapa (con monedas, solo la primera vez; dominio/aventura.ts). La
 * casa de la aventura vuelve al mapa; la del capítulo, a la aventura (sin terminarlo).
 * Lo guardado va en S.aventura.
 * Exporta: AVENTURA_BOTON, MEDALLAS (dónde está la medalla de cada capítulo, para tocar y las pruebas),
 * registroDeAventura, estadoDe, hayCapituloHoy, retoDe, dibujaBotonAventura, tocarBotonAventura y pone SCENES.aventura y
 * SCENES.aventuraCap.
 * Importa: el núcleo (dibujo, voz, sonido, toque, monedas, guardado), los componentes Story, Cuenta y Memoria y los
 * fondos BG de juegos/, EnEscucha y enItems de temas/ingles.ts, las reglas de dominio/aventura.ts y los capítulos de
 * contenido/aventura.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, colores y tiempos en la pantalla de 1600x900,
   como en el resto de las escenas. */
import {
  S,
  SCENES,
  SFX,
  T,
  alEmpezarJuego,
  atHome,
  burst,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawRounds,
  drawTito,
  fmt,
  giveCoins,
  go,
  hC,
  hv,
  inTito,
  later,
  pic,
  save,
  say,
  sayQ,
  sparkles,
  star,
  text,
  today,
  TITO,
  VIVO,
} from '../nucleo/indice.ts';
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import type { AlTerminar, Juego } from '../juegos/tipos.ts';
import { BG, Cuenta, Memoria, Story } from '../juegos/indice.ts';
import { EnEscucha, enItems } from '../temas/ingles.ts';
import {
  AVENTURA,
  estadoCapitulo,
  registroAventura,
  terminarCapitulo,
  type EstadoCapitulo,
  type RegistroAventura,
} from '../dominio/aventura.ts';
import { CAPITULOS, TITULO_AVENTURA, type Capitulo, type RetoAventura } from '../contenido/aventura.ts';

// AVENTURA_BOTON: el botón de la aventura en el mapa 3D (a la derecha, debajo del de la cámara).
export const AVENTURA_BOTON = { x: 1490, y: 320, r: 50 };
// TABLERO: el mapa del tesoro en la pantalla (esquina, tamaño, y sus trozos: tres columnas y dos filas).
const TABLERO = { x: 470, y: 150, w: 660, h: 440, col: 3, fil: 2 };
// MEDALLAS: el centro de la medalla de cada capítulo (uno por trozo del mapa), debajo del tablero.
export const MEDALLAS: readonly { i: number; x: number; y: number; r: number }[] = Array.from(
  { length: AVENTURA.capitulos },
  (_, i) => ({ i, x: 800 + (i - (AVENTURA.capitulos - 1) / 2) * 170, y: 740, r: 62 }),
);
// ORDEN: los ids de los capítulos, en orden (los que aún no existen no cuentan).
const ORDEN = CAPITULOS.map((c) => c.id);

// registroDeAventura(): lo guardado de la aventura (S.aventura), leído con registroAventura (vacío si falta o está roto).
export const registroDeAventura = (): RegistroAventura => registroAventura(S.aventura);
// estadoDe(i): cómo está hoy el capítulo número i; 'pronto' si aún no existe.
export const estadoDe = (i: number): EstadoCapitulo | 'pronto' => {
  const c = CAPITULOS[i];
  return c ? estadoCapitulo(registroDeAventura(), ORDEN, c.id, today()) : 'pronto';
};
// hayCapituloHoy(): si hoy hay un capítulo abierto por jugar (el botón del mapa lo avisa).
export const hayCapituloHoy = (): boolean => MEDALLAS.some((m) => estadoDe(m.i) === 'abierto');

// retoDe(r, onDone): el componente del reto r de un capítulo: contar (Cuenta), las parejas (Memoria) o escuchar en
// inglés (EnEscucha con las palabras de su grupo que van con la edad); onDone se llama al terminarlo.
export function retoDe(r: RetoAventura, onDone: AlTerminar): Juego {
  const bg = BG[r.bg];
  if (r.t === 'cuenta') return Cuenta({ pool: [...r.pool], bg }, onDone);
  if (r.t === 'memoria') return Memoria({ pool: [...r.pool], bg }, onDone);
  return EnEscucha({ items: enItems(r.grupo), bg, key: `ingles-${r.grupo}` }, onDone);
}

// PERGAMINO: el dibujo del mapa del tesoro entero, hecho una vez en un lienzo aparte (pergaminoHecho) para cortarlo en
// trozos al dibujarlo.
let PERGAMINO: HTMLCanvasElement | null = null;
// pergaminoHecho(): el lienzo del mapa del tesoro (del tamaño del tablero): el papel viejo, el mar, la isla con sus
// palmeras y montañas, el camino de puntos y la cruz roja del tesoro.
function pergaminoHecho(): HTMLCanvasElement {
  if (PERGAMINO) return PERGAMINO;
  const c = document.createElement('canvas');
  c.width = TABLERO.w;
  c.height = TABLERO.h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#F3DFB0';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#9ED3E8';
  g.beginPath();
  g.ellipse(330, 220, 300, 190, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#9BCB6A';
  g.strokeStyle = '#5B4636';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(120, 240);
  g.bezierCurveTo(110, 120, 260, 70, 360, 100);
  g.bezierCurveTo(470, 60, 580, 150, 540, 250);
  g.bezierCurveTo(560, 350, 400, 380, 300, 350);
  g.bezierCurveTo(190, 380, 120, 330, 120, 240);
  g.fill();
  g.stroke();
  g.fillStyle = '#B8A48C';
  [
    [250, 170],
    [300, 150],
  ].forEach(([x, y]) => {
    g.beginPath();
    g.moveTo(x! - 40, y! + 40);
    g.lineTo(x!, y! - 30);
    g.lineTo(x! + 40, y! + 40);
    g.closePath();
    g.fill();
    g.stroke();
  });
  g.strokeStyle = '#D9534F';
  g.lineWidth = 7;
  g.setLineDash([4, 16]);
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(160, 290);
  g.bezierCurveTo(260, 330, 330, 220, 420, 260);
  g.bezierCurveTo(470, 280, 470, 200, 470, 190);
  g.stroke();
  g.setLineDash([]);
  g.lineWidth = 12;
  g.beginPath();
  g.moveTo(450, 170);
  g.lineTo(490, 210);
  g.moveTo(490, 170);
  g.lineTo(450, 210);
  g.stroke();
  g.strokeStyle = '#5B4636';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(590, 70, 38, 0, Math.PI * 2);
  g.moveTo(590, 22);
  g.lineTo(590, 118);
  g.moveTo(542, 70);
  g.lineTo(638, 70);
  g.stroke();
  PERGAMINO = c;
  return c;
}

// trozo(i): dónde va el trozo i del mapa en el tablero (esquina y tamaño).
const trozo = (i: number) => {
  const w = TABLERO.w / TABLERO.col,
    h = TABLERO.h / TABLERO.fil;
  return { x: (i % TABLERO.col) * w, y: Math.floor(i / TABLERO.col) * h, w, h };
};

// dibujaTrozo(i, cx, cy, s): el trozo i del mapa del tesoro con su centro en (cx, cy), a escala s, con su borde.
function dibujaTrozo(i: number, cx: number, cy: number, s: number): void {
  const t = trozo(i);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.drawImage(pergaminoHecho(), t.x, t.y, t.w, t.h, -t.w / 2, -t.h / 2, t.w, t.h);
  ctx.strokeStyle = '#5B4636';
  ctx.lineWidth = 3;
  ctx.strokeRect(-t.w / 2, -t.h / 2, t.w, t.h);
  ctx.restore();
}

// dibujaTablero(nuevo, desde): el tablero con los trozos que ya se tienen (los primeros hechos, en orden) y el número
// de los que faltan; el trozo nuevo (si lo hay) entra creciendo desde el tiempo desde.
function dibujaTablero(nuevo: number, desde: number): void {
  const n = registroDeAventura().hechos.length,
    B = TABLERO;
  card(B.x - 24, B.y - 24, B.w + 48, B.h + 48, '#B07A4A', 6, 20);
  card(B.x, B.y, B.w, B.h, '#E8D3A6', 0, 4);
  Array.from({ length: AVENTURA.capitulos }, (_, i) => {
    const t = trozo(i),
      cx = B.x + t.x + t.w / 2,
      cy = B.y + t.y + t.h / 2;
    if (i < n) {
      const k = i === nuevo ? Math.min(1, (T - desde) / 0.8) : 1;
      dibujaTrozo(i, cx, cy, 1 + (1 - k) * 0.6);
      return;
    }
    ctx.save();
    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = '#B5946A';
    ctx.lineWidth = 4;
    ctx.strokeRect(B.x + t.x + 10, B.y + t.y + 10, t.w - 20, t.h - 20);
    ctx.restore();
    text(i + 1, cx, cy + 22, 64, '#B5946A');
  });
}

// dibujaMedalla(m): la medalla del capítulo m.i según su estado: hecho, con su dibujo y una marca verde; abierto, con
// su dibujo, saltando y con un aro dorado; para mañana, con la luna; cerrado, con el candado; pronto, en gris con
// puntos suspensivos.
function dibujaMedalla(m: { i: number; x: number; y: number; r: number }): void {
  const e = estadoDe(m.i),
    c = CAPITULOS[m.i],
    abierto = e === 'abierto',
    y = m.y + (abierto ? Math.sin(T * 4) * 6 : 0),
    s = hv('cap' + String(m.i), hC(m.x, m.y, m.r));
  ctx.save();
  ctx.translate(m.x, y);
  ctx.scale(s, s);
  if (abierto) circ(0, 0, m.r + 10, '#FFC93C', 0);
  circ(0, 0, m.r, e === 'pronto' || e === 'cerrado' ? '#E6E0D8' : '#FFFFFF', 5);
  if (c && (e === 'hecho' || abierto)) pic(c.dibujo, 0, 0, m.r * 1.4);
  if (e === 'manana') pic('luna', 0, 0, m.r * 1.2);
  if (e === 'cerrado') pic('candado', 0, 0, m.r * 1.1);
  if (e === 'pronto') text('…', 0, 10, 50, '#B5AA9C');
  circ(-m.r * 0.72, -m.r * 0.72, 22, '#B07A4A', 4);
  text(m.i + 1, -m.r * 0.72, -m.r * 0.72 + 9, 24, '#FFFFFF');
  if (e === 'hecho') {
    circ(m.r * 0.72, m.r * 0.72, 22, '#7CC86E', 4);
    text('✓', m.r * 0.72, m.r * 0.72 + 9, 26, '#FFFFFF');
  }
  ctx.restore();
}

// dibujaBotonAventura(): el botón de la aventura en el mapa: un mapa del tesoro en un círculo (crece bajo el ratón, id
// 'aventura'), con una exclamación que salta si hoy hay un capítulo por jugar.
export function dibujaBotonAventura(): void {
  const B = AVENTURA_BOTON,
    s = hv('aventura', hC(B.x, B.y, B.r));
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  circ(0, 0, B.r, '#FFFFFF', 5);
  pic('mapa', 0, 0, B.r * 1.5);
  if (hayCapituloHoy()) {
    const b = Math.sin(T * 5) * 4;
    circ(B.r * 0.72, -B.r * 0.72 + b, 22, '#E2574C', 4);
    text('!', B.r * 0.72, -B.r * 0.72 + b + 10, 30, '#FFFFFF');
  }
  ctx.restore();
}

// tocarBotonAventura(x, y): si (x, y) es el botón de la aventura, la abre y devuelve true.
export function tocarBotonAventura(x: number, y: number): boolean {
  if (dist(x, y, AVENTURA_BOTON.x, AVENTURA_BOTON.y) > AVENTURA_BOTON.r + 8) return false;
  SFX.whoosh();
  go('aventura');
  return true;
}

// LA AVENTURA (el mapa del tesoro y los capítulos): estado: nuevo (el trozo que acaba de llegar, o -1) y desde (cuándo).
SCENES.aventura = {
  music: null,
  // enter(o): con o.pieza, el trozo que se acaba de ganar entra en el tablero; Tito dice cuántos trozos hay y si hoy hay
  // un capítulo nuevo, si el siguiente es para mañana o si llegará pronto (o, al empezar, de qué va la aventura).
  enter(o?: OpcionesEscena) {
    this.nuevo = o?.pieza ?? -1;
    this.desde = T;
    if (this.nuevo >= 0) later(300, () => SFX.tada());
    const n = registroDeAventura().hechos.length,
      sig = MEDALLAS.map((m) => estadoDe(m.i)).find((e) => e !== 'hecho');
    later(this.nuevo >= 0 ? 900 : 400, () => {
      if (!n) {
        sayQ(
          '¡La gran aventura de Tito! Un mapa del tesoro se ha roto en seis trozos. Toca el primer capítulo para empezar.',
        );
        return;
      }
      sayQ(fmt('¡Ya tenemos {n} de {total} trozos del mapa!', { n, total: AVENTURA.capitulos }));
      if (sig === 'abierto') sayQ('Hoy hay un capítulo nuevo. ¡Tócalo para seguir la aventura!');
      if (sig === 'manana') sayQ('El próximo capítulo se abre mañana.');
      if (sig === 'pronto') sayQ('El próximo capítulo llegará muy pronto.');
    });
  },
  // prompt(): qué hacer.
  prompt() {
    say('Toca un capítulo para jugarlo. Cada día se abre uno nuevo.');
  },
  // hint(): la medalla del capítulo abierto, si lo hay.
  hint() {
    const m = MEDALLAS.find((q) => estadoDe(q.i) === 'abierto');
    return m ? { x: m.x, y: m.y, r: m.r } : null;
  },
  // draw(): el fondo, el título, el tablero con los trozos, las medallas de los capítulos, Tito, la casa y las monedas.
  draw() {
    ctx.fillStyle = '#FDF1DC';
    ctx.fillRect(0, 0, 1600, 900);
    card(450, 24, 700, 84, '#FFFFFF', 5, 40);
    text(TITULO_AVENTURA, 800, 80, 40, '#3A281E', { max: 640 });
    dibujaTablero(this.nuevo as number, this.desde as number);
    MEDALLAS.forEach(dibujaMedalla);
    drawTito(TITO.x, TITO.y, TITO.w);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): la casa vuelve al mapa; una medalla: abierta o hecha, se juega su capítulo; para mañana, cerrada o aún
  // por llegar, Tito lo explica; Tito repite qué hacer.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('map');
      return;
    }
    if (inTito(x, y)) {
      this.prompt!();
      return;
    }
    const m = MEDALLAS.find((q) => dist(x, y, q.x, q.y) < q.r + 6);
    if (!m) return;
    const e = estadoDe(m.i);
    if (e === 'abierto' || e === 'hecho') {
      SFX.pop();
      go('aventuraCap', { cap: m.i });
      return;
    }
    SFX.boing();
    if (e === 'manana') say('Este capítulo se abre mañana. ¡Vuelve mañana para seguir la aventura!');
    if (e === 'cerrado') say('Primero hay que terminar el capítulo de antes.');
    if (e === 'pronto') say('¡Este capítulo llegará muy pronto!');
  },
};

// UN CAPÍTULO: estado: cap (el capítulo), i (su número), fase ('cuento', 'reto' o 'pieza'), g (el componente de la
// fase: el cuento o el reto), fin (el reto ya terminó), nuevo (si el trozo se ganó ahora) y desde (cuándo empezó la
// pieza).
SCENES.aventuraCap = {
  music: 'game',
  // enter(o): empieza el capítulo número o.cap por su cuento (las páginas, sin preguntas).
  enter(o: OpcionesEscena) {
    const i = o.cap ?? 0,
      cap: Capitulo = CAPITULOS[i] ?? CAPITULOS[0]!;
    Object.assign(this, { cap, i, fase: 'cuento', fin: false, nuevo: false, desde: 0 });
    this.g = Story({ title: cap.titulo, pages: cap.paginas, qs: [] }, {}, () => this.alReto!());
    this.g.enter && this.g.enter();
  },
  // alReto(): tras el cuento, el reto del capítulo (retoDe), con sus monedas de acierto como en cualquier juego.
  alReto() {
    if (this.fase !== 'cuento') return;
    this.fase = 'reto';
    alEmpezarJuego();
    this.g = retoDe(this.cap.reto, () => this.alTerminar!());
    this.g.enter && this.g.enter();
  },
  // alTerminar(): con el reto hecho, el trozo del mapa: se apunta (terminarCapitulo; la primera vez, con sus monedas) y
  // Tito lo celebra; al rato, vuelve a la aventura con el trozo nuevo entrando en el tablero.
  alTerminar() {
    if (this.fin) return;
    this.fin = true;
    VIVO.drag = null;
    const cap = this.cap as Capitulo,
      r = terminarCapitulo(registroDeAventura(), ORDEN, cap.id, today());
    Object.assign(this, { fase: 'pieza', nuevo: r.nuevo, desde: T });
    if (r.nuevo) {
      S.aventura = { hechos: [...r.registro.hechos], d: r.registro.d };
      creditCoins(r.monedas);
      save();
      later(400, () => SFX.tada());
      burst(800, 420, 50);
      later(1000, () => giveCoins(r.monedas, 800, 420, undefined, true));
      say(cap.pieza);
      sayQ('¡Lo pongo en el mapa del tesoro!', () => this.volver!());
      return;
    }
    sparkles(800, 420, 20);
    say('Este trozo ya lo tenías. ¡Muy bien jugado!', () => this.volver!());
  },
  // volver(): de la pieza a la aventura (con el trozo nuevo, si lo es); solo una vez.
  volver() {
    if (this.fase !== 'pieza' || this.vuelto === this.desde) return;
    this.vuelto = this.desde;
    go('aventura', this.nuevo ? { pieza: registroDeAventura().hechos.length - 1 } : {});
  },
  // update(dt): pasa el tiempo al cuento o al reto.
  update(dt: number) {
    if (this.fase !== 'pieza') this.g.update && this.g.update(dt);
  },
  // draw(): el cuento o el reto (con sus rondas), y en la fase de la pieza, el trozo del mapa grande que gira al
  // llegar, con un velo; Tito, la casa y las monedas.
  draw() {
    this.g.draw();
    if (this.fase === 'reto' && this.g.total) drawRounds(Math.min(this.g.done, this.g.total), this.g.total);
    if (this.fase === 'pieza') {
      const k = Math.min(1, (T - this.desde) / 0.6),
        n = registroDeAventura().hechos.indexOf((this.cap as Capitulo).id);
      ctx.save();
      ctx.fillStyle = 'rgba(255,246,230,0.8)';
      ctx.fillRect(0, 0, 1600, 900);
      ctx.restore();
      star(800, 420, 230 + Math.sin(T * 3) * 10, '#FFE38A', 0);
      ctx.save();
      ctx.translate(800, 420);
      ctx.rotate((1 - k) * 2 * Math.PI);
      dibujaTrozo(Math.max(0, n), 0, 0, 1.4 * k);
      ctx.restore();
    }
    drawHome();
    drawTito(TITO.x, TITO.y, TITO.w);
    drawCoinHUD();
  },
  // down(x, y): la casa vuelve a la aventura (sin terminar el capítulo); en la pieza, un toque vuelve ya; Tito repite la
  // consigna; si no, se pasa al cuento o al reto.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('aventura');
      return;
    }
    if (this.fase === 'pieza') {
      this.volver!();
      return;
    }
    if (inTito(x, y)) {
      this.g.prompt && this.g.prompt();
      return;
    }
    this.g.down && this.g.down(x, y);
  },
  // move(x, y) / up(x, y): los arrastres, para el reto.
  move(x: number, y: number) {
    if (this.fase !== 'pieza') this.g.move && this.g.move(x, y);
  },
  /* up(x, y): soltar, para el reto. */ up(x: number, y: number) {
    if (this.fase !== 'pieza') this.g.up && this.g.up(x, y);
  },
  // hint(): la ayuda del cuento o del reto (nada en la pieza).
  hint() {
    return this.fase === 'pieza' ? null : this.g.hint && this.g.hint();
  },
  /* prompt(): la consigna del cuento o del reto. */ prompt() {
    if (this.fase !== 'pieza') this.g.prompt && this.g.prompt();
  },
};
