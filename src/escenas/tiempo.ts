/*
 * escenas/tiempo.ts: los juegos del tiempo de verdad (idea 21 de docs/IDEAS-MEJORA.md, fase P26). Lo que el niño dice
 * en la asamblea sobre el tiempo de hoy (S.asam[fecha].tiempo) lo muestra el mapa 3D (mundo3d/tiempo3d.ts) y, con lluvia
 * o nieve, en el mapa hay un juego:
 * - Saltar los charcos (SCENES.charcos): llueve, Tito lleva las botas de agua y salta en cada charco que toca el niño
 *   (cuantosCharcos, según la edad). Al acabar, deja de llover y sale el arcoíris, y Tito nombra sus siete colores.
 * - El muñeco de nieve (SCENES.muneco): se hace por partes, en orden (partesMuneco: las dos bolas, la nariz, el gorro, la
 *   bufanda y los botones, según la edad), tocando en la bandeja la que pide Tito. Después, la guerra de bolas de nieve:
 *   los amigos asoman detrás de los montones de nieve y hay que acertarles (bolasDeNieve, según la edad).
 * Al terminar, 2 monedas (MONEDAS.juegoRepetido) y se vuelve al mapa. La casa (arriba a la izquierda) vuelve al mapa.
 * Exporta: tiempoHoy (lo que muestra hoy el mapa), fraseTiempoMapa (lo que dice Tito en el mapa, una vez al día), CHARCOS
 * y MUNECO (el estado de cada juego, para las pruebas), sitioCharco, sitioParte y sitioMonton (dónde tocar); pone
 * SCENES.charcos y SCENES.muneco.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito, monedas, S y la fecha), las reglas de dominio/tiempo.ts y de
 * dominio/monedas.ts, y el contorno K de los dibujos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, tiempos y sonidos en la pantalla de 1600x900,
   como en el resto de las escenas. */
import {
  AGE,
  H,
  S,
  SCENES,
  SFX,
  T,
  VIVO,
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
  giveCoins,
  go,
  inCoinHUD,
  juntar,
  later,
  pic,
  pick,
  say,
  sceneName,
  shuffle,
  sparkles,
  today,
  tone,
  tr,
} from '../nucleo/indice.ts';
import { K } from '../dibujos/todos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import {
  COLORES_ARCOIRIS,
  bolasDeNieve,
  cuantosCharcos,
  partesMuneco,
  tiempoDelMapa,
  type ParteMuneco,
  type TiempoMapa,
} from '../dominio/tiempo.ts';

// tiempoHoy(): lo que muestra hoy el mapa: el tiempo que se dijo en la asamblea de hoy (null si no se ha dicho).
export const tiempoHoy = (): TiempoMapa | null => tiempoDelMapa(S.asam[today()]?.tiempo);

// FRASE_MAPA: lo que dice Tito en el mapa con cada tiempo (con sol, nada: es el mapa de siempre).
const FRASE_MAPA: Readonly<Partial<Record<TiempoMapa, string>>> = {
  lluvia: '¡Está lloviendo en Curiolandia! Toca los charcos para saltar con Tito.',
  nieve: '¡Ha nevado en Curiolandia! Toca el montón de nieve para hacer un muñeco.',
  viento: '¡Cuánto viento hace hoy en Curiolandia! Mira cómo vuelan las hojas.',
  nubes: 'Hoy hay muchas nubes en el cielo de Curiolandia.',
  niebla: '¡Qué niebla hay hoy! Casi no se ve el mar.',
};
// dichoMapa: el día en que Tito ya ha dicho en el mapa qué tiempo hace (lo dice una vez al día).
let dichoMapa = '';

// fraseTiempoMapa(): la frase del tiempo de hoy para el mapa, la primera vez de cada día que se pide; si no, o si no
// hay nada que decir, ''.
export function fraseTiempoMapa(): string {
  const t = tiempoHoy(),
    f = (t && FRASE_MAPA[t]) || '';
  if (!f || dichoMapa === today()) return '';
  dichoMapa = today();
  return f;
}

// acabar(x, y): al terminar un juego del tiempo: las monedas (desde x, y) y, un rato después, de vuelta al mapa.
function acabar(x: number, y: number, escena: string): void {
  later(1200, () => giveCoins(MONEDAS.juegoRepetido, x, y));
  later(7000, () => {
    if (sceneName === escena) go('map');
  });
}

// tocarArriba(x, y): la casa vuelve al mapa y las monedas van a la tienda; true si se ha tocado alguna.
function tocarArriba(x: number, y: number): boolean {
  if (atHome(x, y)) {
    SFX.whoosh();
    go('map');
    return true;
  }
  if (inCoinHUD(x, y)) {
    SFX.pop();
    go('tienda');
    return true;
  }
  return false;
}

/* ---------- Saltar los charcos ---------- */

/** Un charco: dónde está y si Tito ya ha saltado en él. */
interface Charco {
  readonly x: number;
  readonly y: number;
  saltado: boolean;
}

/** El estado de los charcos: los charcos, dónde está Tito (y de dónde salta, adónde y cuándo) y cuándo sale el arcoíris. */
export const CHARCOS = {
  charcos: [] as Charco[],
  tito: { x: 180, y: 700 },
  salto: null as null | { x0: number; y0: number; i: number; t: number },
  arcoiris: 0,
};
// DURA_SALTO: lo que tarda Tito en un salto, en segundos.
const DURA_SALTO = 0.6;

// sitioCharco(i): el centro del charco i (para tocarlo).
export const sitioCharco = (i: number): { x: number; y: number } => CHARCOS.charcos[i]!;

// colocaCharcos(n): n charcos repartidos por el suelo, en zigzag de izquierda a derecha.
function colocaCharcos(n: number): Charco[] {
  return Array.from({ length: n }, (_, i) => ({
    x: 420 + (i * 1000) / Math.max(1, n - 1),
    y: i % 2 ? 640 : 770,
    saltado: false,
  }));
}

// fondoLluvia(): el cielo gris con nubes y la lluvia que cae o, con el arcoíris, el cielo azul con el sol y el arcoíris
// (que se pinta poco a poco); abajo, la hierba.
function fondoLluvia(): void {
  const sale = CHARCOS.arcoiris ? Math.min(1, (T - CHARCOS.arcoiris) / 2) : 0,
    g = ctx.createLinearGradient(0, 0, 0, 520);
  g.addColorStop(0, sale ? '#8FD0F2' : '#8A97A6');
  g.addColorStop(1, sale ? '#E2F4FC' : '#C9D2DB');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 520);
  if (sale) {
    circ(1400, 240, 60, '#FFD66B', 6);
    ctx.save();
    ctx.globalAlpha = sale;
    COLORES_ARCOIRIS.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(800, 560, 440 - i * 26, Math.PI, Math.PI + Math.PI * sale);
      ctx.stroke();
    });
    ctx.restore();
  }
  ctx.fillStyle = '#7CC86E';
  ctx.fillRect(0, 520, W, H - 520);
  [
    [200, 110],
    [620, 80],
    [1050, 130],
  ].forEach(([x, y], j) => {
    ctx.save();
    ctx.globalAlpha = 1 - sale;
    [
      [0, 0, 70],
      [70, -24, 58],
      [130, 6, 62],
    ].forEach(([dx, dy, r]) => circ(x! + dx! + Math.sin(T * 0.4 + j) * 20, y! + dy!, r!, '#9AA6B4', 0));
    ctx.restore();
  });
  if (sale) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(220,235,250,0.8)';
  ctx.lineWidth = 3;
  Array.from({ length: 70 }, (_, i) => i).forEach((i) => {
    const x = (i * 97) % W,
      y = (((i * 53 + T * 700) % (H + 80)) + H + 80) % (H + 80);
    ctx.beginPath();
    ctx.moveTo(x, y - 80);
    ctx.lineTo(x - 8, y - 50);
    ctx.stroke();
  });
  ctx.restore();
}

// charco(c): un charco (azul con brillo) en el suelo; si ya se ha saltado, con ondas que se van abriendo.
function charco(c: Charco): void {
  ctx.save();
  ctx.fillStyle = '#5BA7E0';
  ctx.strokeStyle = '#3C7FB5';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, 130, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(c.x - 40, c.y - 12, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (c.saltado) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    const r = (T * 50) % 90;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 20 + r, (20 + r) / 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// sitioTito(): dónde está Tito (sus pies): quieto, o en el aire, en arco, si está saltando.
function sitioTito(): { x: number; y: number } {
  const s = CHARCOS.salto;
  if (!s) return CHARCOS.tito;
  const c = CHARCOS.charcos[s.i]!,
    k = Math.min(1, (T - s.t) / DURA_SALTO);
  return { x: s.x0 + (c.x - s.x0) * k, y: s.y0 + (c.y - s.y0) * k - Math.sin(k * Math.PI) * 180 };
}

// aterriza(): Tito cae en el charco: ¡plof!, salpica, y si era el último deja de llover y sale el arcoíris.
function aterriza(): void {
  const s = CHARCOS.salto!,
    c = CHARCOS.charcos[s.i]!;
  CHARCOS.salto = null;
  CHARCOS.tito = { x: c.x, y: c.y };
  c.saltado = true;
  tone(300, 0.15, 'sine', 0.25);
  SFX.pop();
  burst(c.x, c.y - 10, 26, ['#5BA7E0', '#9ED2F5', '#FFFFFF']);
  const quedan = CHARCOS.charcos.filter((o) => !o.saltado).length;
  if (quedan) {
    say(quedan % 2 ? '¡Plof!' : '¡Chof! ¡Qué salpicón!');
    return;
  }
  later(600, () => {
    if (sceneName !== 'charcos') return;
    CHARCOS.arcoiris = T;
    SFX.tada();
    say(
      juntar(
        tr('¡Ha dejado de llover! Mira: ha salido el arcoíris.'),
        tr('Tiene siete colores: rojo, naranja, amarillo, verde, azul, añil y violeta.'),
      ),
    );
    acabar(800, 300, 'charcos');
  });
}

SCENES['charcos'] = {
  music: 'map',
  // enter(): los charcos de la edad, Tito a la izquierda con sus botas, y la explicación.
  enter() {
    Object.assign(CHARCOS, {
      charcos: colocaCharcos(cuantosCharcos(AGE())),
      tito: { x: 180, y: 720 },
      salto: null,
      arcoiris: 0,
    });
    later(300, () => this.prompt!());
  },
  // prompt(): qué hay que hacer.
  prompt() {
    say('¡Está lloviendo! Tito se ha puesto las botas de agua. Toca los charcos para saltar en ellos.');
  },
  // hint(): la mano señala el primer charco que falta.
  hint() {
    const c = CHARCOS.charcos.find((o) => !o.saltado);
    return c && !CHARCOS.salto ? { x: c.x, y: c.y, r: 110 } : null;
  },
  // update(): Tito aterriza al acabar el salto.
  update() {
    if (CHARCOS.arcoiris) VIVO.idle = 0;
    if (CHARCOS.salto && T - CHARCOS.salto.t >= DURA_SALTO) aterriza();
  },
  // draw(): la lluvia (o el arcoíris), los charcos y Tito con las botas de agua.
  draw() {
    fondoLluvia();
    CHARCOS.charcos.forEach(charco);
    const p = sitioTito();
    drawTito(p.x - 90, p.y - 175, 180);
    pic('botasAgua', p.x, p.y - 8, 80);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa y monedas; un charco sin saltar -> Tito salta en él; si no, chispas.
  down(x: number, y: number) {
    if (tocarArriba(x, y)) return;
    if (CHARCOS.salto || CHARCOS.arcoiris) return;
    const i = CHARCOS.charcos.findIndex((c) => !c.saltado && Math.abs(x - c.x) < 140 && Math.abs(y - c.y) < 70);
    if (i < 0) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    SFX.boing();
    CHARCOS.salto = { x0: CHARCOS.tito.x, y0: CHARCOS.tito.y, i, t: T };
  },
};

/* ---------- El muñeco de nieve y la guerra de bolas ---------- */

/** Un amigo que asoma por detrás de un montón de nieve: en cuál, quién y desde cuándo. */
interface Asoma {
  readonly m: number;
  readonly k: string;
  readonly t: number;
}

/** El estado del muñeco: las partes que tocan, cuántas se han puesto y la bandeja (el orden en que se ven); la fase
 * (hacer el muñeco, el muñeco hecho, la guerra de bolas y el final); y
 * en la guerra de bolas, quién asoma, la bola que vuela y los aciertos. */
export const MUNECO = {
  partes: [] as readonly ParteMuneco[],
  puestas: 0,
  bandeja: [] as string[],
  fase: 'muneco' as 'muneco' | 'hecho' | 'bolas' | 'fin',
  asoma: null as Asoma | null,
  libre: 0,
  bola: null as null | { x: number; y: number; t: number; m: number },
  aciertos: 0,
  hacen: 0,
};
// MUNECO_POS: dónde se hace el muñeco (el centro de la bola grande, en el suelo) y su tamaño.
const MUNECO_POS = { x: 800, y: 560 };
// MONTONES: dónde están los montones de nieve de la guerra de bolas.
const MONTONES = [
  { x: 460, y: 600 },
  { x: 840, y: 520 },
  { x: 1220, y: 600 },
];
// AMIGOS_NIEVE: los amigos que asoman en la guerra de bolas.
const AMIGOS_NIEVE = ['conejo', 'ardilla', 'pinguino', 'erizo'];
// ASOMA_DURA: lo que se deja ver un amigo según la edad (más con 3 años), en segundos.
const ASOMA_DURA: Readonly<Record<number, number>> = { 3: 2.6, 4: 2.1, 5: 1.7 };
// LANZA: de dónde sale la bola de nieve (la mano de Tito) y lo que tarda en llegar.
const LANZA = { x: 230, y: 640, dura: 0.45 };

// sitioParte(i): el centro de la casilla i de la bandeja (abajo, en fila).
export function sitioParte(i: number): { x: number; y: number } {
  const n = MUNECO.bandeja.length;
  return { x: 800 + (i - (n - 1) / 2) * 190, y: 820 };
}
// sitioMonton(m): el centro del amigo que asoma por detrás del montón m (para acertarle).
export const sitioMonton = (m: number): { x: number; y: number } => ({ x: MONTONES[m]!.x, y: MONTONES[m]!.y - 90 });

// parteDibujo(id, x, y, s): una parte del muñeco, para la bandeja (en (x, y), con el tamaño s).
function parteDibujo(id: string, x: number, y: number, s: number): void {
  if (id === 'bolaGrande' || id === 'bolaPequena') {
    circ(x, y, (id === 'bolaGrande' ? 0.42 : 0.3) * s, '#FFFFFF', 5);
    return;
  }
  if (id === 'botones') {
    [-0.22, 0, 0.22].forEach((d) => circ(x, y + d * s, 0.08 * s, K, 0));
    return;
  }
  pic(id === 'nariz' ? 'zanahoria' : id, x, y, s);
}

// muneco(x, y, s, n): el muñeco de nieve con sus n primeras partes puestas, con la bola grande en (x, y) y el tamaño s
// (1, el de la escena).
function muneco(x: number, y: number, s: number, n: number): void {
  const puesta = (id: string) => MUNECO.partes.slice(0, n).some((p) => p.id === id);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (puesta('bolaGrande')) circ(0, 0, 130, '#FFFFFF', 6);
  if (puesta('botones')) [-50, 0, 50].forEach((d) => circ(0, d, 12, K, 0));
  if (puesta('bolaPequena')) {
    circ(0, -200, 90, '#FFFFFF', 6);
    circ(-30, -220, 10, K, 0);
    circ(30, -220, 10, K, 0);
    ctx.strokeStyle = K;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -190, 30, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  if (puesta('nariz')) {
    ctx.fillStyle = '#FF8A3D';
    ctx.strokeStyle = K;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, -212);
    ctx.lineTo(70, -198);
    ctx.lineTo(-6, -190);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (puesta('bufanda')) pic('bufanda', 0, -110, 190);
  if (puesta('gorro')) pic('gorro', 0, -300, 170);
  ctx.restore();
}

// fondoNieve(): el cielo de invierno, la nieve que cae y el suelo blanco.
function fondoNieve(): void {
  const g = ctx.createLinearGradient(0, 0, 0, 480);
  g.addColorStop(0, '#A9CBE8');
  g.addColorStop(1, '#EAF4FC');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 480);
  ctx.fillStyle = '#FAFDFF';
  ctx.fillRect(0, 480, W, H - 480);
  ctx.save();
  ctx.globalAlpha = 0.9;
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const x = (((i * 131 + Math.sin(T + i) * 30) % W) + W) % W,
      y = ((i * 71 + T * 60) % (H + 20)) - 10;
    circ(x, y, 5 + (i % 3) * 2, '#FFFFFF', 0);
  });
  ctx.restore();
}

// monton(x, y): un montón de nieve (por detrás asoman los amigos en la guerra de bolas).
function monton(x: number, y: number): void {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#B8CDE0';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, y, 170, 90, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// pideParte(): Tito pide la parte que toca.
function pideParte(): void {
  const p = MUNECO.partes[MUNECO.puestas];
  if (p) say(p.pide);
}

// empiezaBolas(): el muñeco está hecho: Tito lo celebra y empieza la guerra de bolas de nieve.
function empiezaBolas(): void {
  SFX.tada();
  burst(MUNECO_POS.x, MUNECO_POS.y - 200, 30, ['#FFFFFF', '#CFE6FA', '#FFC93C']);
  MUNECO.fase = 'hecho';
  say('¡Qué muñeco de nieve tan bonito! Ahora, ¡guerra de bolas de nieve! Toca a los amigos cuando asomen.');
  // el muñeco hecho se ve un rato antes de empezar la guerra de bolas
  later(3500, () => {
    if (sceneName !== 'muneco' || MUNECO.fase !== 'hecho') return;
    MUNECO.fase = 'bolas';
    MUNECO.libre = T + 0.5;
  });
}

// pasaBolas(): en la guerra de bolas, cada cuadro: la bola que vuela llega (acierta si el amigo sigue asomado), el
// amigo se esconde al pasar su tiempo y, al rato, asoma otro en otro montón.
function pasaBolas(): void {
  const b = MUNECO.bola;
  if (b && T - b.t >= LANZA.dura) {
    MUNECO.bola = null;
    const s = sitioMonton(b.m);
    burst(s.x, s.y, 20, ['#FFFFFF', '#DCEBF8']);
    if (MUNECO.asoma && MUNECO.asoma.m === b.m) {
      MUNECO.aciertos++;
      MUNECO.asoma = null;
      MUNECO.libre = T + 0.6;
      SFX.good();
      if (MUNECO.aciertos >= MUNECO.hacen) {
        MUNECO.fase = 'fin';
        say('¡Qué divertido! Nos lo hemos pasado en grande con la nieve.');
        acabar(800, 400, 'muneco');
        return;
      }
      say(MUNECO.aciertos % 2 ? '¡Toma! ¡Le has dado!' : '¡Plaf! ¡Otra vez!');
    }
  }
  const a = MUNECO.asoma;
  if (a && T - a.t > ASOMA_DURA[AGE()]!) {
    MUNECO.asoma = null;
    MUNECO.libre = T + 0.5;
  }
  if (!MUNECO.asoma && T >= MUNECO.libre) {
    const antes = a ? a.m : -1,
      m = pick([0, 1, 2].filter((i) => i !== antes));
    MUNECO.asoma = { m, k: pick(AGE() <= 3 ? AMIGOS_NIEVE.slice(0, 2) : AMIGOS_NIEVE), t: T };
  }
}

// dibujaBolas(): la guerra de bolas: el muñeco pequeño a la derecha, el amigo que asoma, los montones y la bola que vuela.
function dibujaBolas(): void {
  muneco(1490, 740, 0.42, MUNECO.partes.length);
  const a = MUNECO.asoma;
  if (a) {
    // el amigo sube por detrás del montón: lo que queda por debajo de su base no se ve
    const s = sitioMonton(a.m),
      k = Math.min(1, (T - a.t) / 0.25);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, MONTONES[a.m]!.y - 4);
    ctx.clip();
    pic(a.k, s.x, s.y + 110 - 110 * k, 170);
    ctx.restore();
  }
  MONTONES.forEach((m) => monton(m.x, m.y));
  const b = MUNECO.bola;
  if (b) {
    const k = Math.min(1, (T - b.t) / LANZA.dura),
      s = sitioMonton(b.m);
    circ(LANZA.x + (s.x - LANZA.x) * k, LANZA.y + (s.y - LANZA.y) * k - Math.sin(k * Math.PI) * 160, 26, '#FFFFFF', 4);
  }
  card(620, 40, 360, 70, '#FFFFFF', 5, 30);
  Array.from({ length: MUNECO.hacen }, (_, i) => i).forEach((i) =>
    circ(800 + (i - (MUNECO.hacen - 1) / 2) * 60, 75, 22, i < MUNECO.aciertos ? '#FFFFFF' : '#DCE6EF', 4),
  );
}

SCENES['muneco'] = {
  music: 'map',
  // enter(): las partes de la edad, la bandeja mezclada y Tito pide la primera.
  enter() {
    const partes = partesMuneco(AGE());
    Object.assign(MUNECO, {
      partes,
      puestas: 0,
      bandeja: shuffle(partes.map((p) => p.id)),
      fase: 'muneco',
      asoma: null,
      libre: 0,
      bola: null,
      aciertos: 0,
      hacen: bolasDeNieve(AGE()),
    });
    later(300, () => this.prompt!());
  },
  // prompt(): en el muñeco, qué hay que hacer y la parte que toca; en la guerra de bolas, qué hay que hacer.
  prompt() {
    if (MUNECO.fase === 'bolas') say('Toca a los amigos cuando asomen detrás de la nieve.');
    else if (MUNECO.fase === 'muneco' && !MUNECO.puestas)
      say(juntar(tr('¡Vamos a hacer un muñeco de nieve! Toca las partes en orden.'), tr(MUNECO.partes[0]!.pide)));
    else pideParte();
  },
  // hint(): en el muñeco, la mano señala la parte que toca en la bandeja; en la guerra de bolas, al amigo que asoma.
  hint() {
    if (MUNECO.fase === 'bolas') return MUNECO.asoma ? { ...sitioMonton(MUNECO.asoma.m), r: 90 } : null;
    if (MUNECO.fase !== 'muneco') return null;
    const i = MUNECO.bandeja.indexOf(MUNECO.partes[MUNECO.puestas]?.id ?? '');
    return i < 0 ? null : { ...sitioParte(i), r: 85 };
  },
  // update(): la guerra de bolas.
  update() {
    if (MUNECO.fase === 'bolas') {
      VIVO.idle = 0;
      pasaBolas();
    }
  },
  // draw(): la nieve; el muñeco con lo que lleva y la bandeja con lo que falta, o la guerra de bolas; y Tito a la
  // izquierda.
  draw() {
    fondoNieve();
    if (MUNECO.fase === 'muneco' || MUNECO.fase === 'hecho') {
      muneco(MUNECO_POS.x, MUNECO_POS.y, 1, MUNECO.puestas);
      MUNECO.bandeja.forEach((id, i) => {
        if (MUNECO.partes.slice(0, MUNECO.puestas).some((p) => p.id === id)) return;
        const s = sitioParte(i);
        card(s.x - 80, s.y - 70, 160, 140, '#EAF4FC', 5, 24);
        parteDibujo(id, s.x, s.y, 120);
      });
    } else dibujaBolas();
    drawTito(40, 520, 220);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa y monedas; en el muñeco, la parte que toca se pone (otra: Tito repite cuál toca); en la guerra
  // de bolas, Tito lanza una bola al montón tocado.
  down(x: number, y: number) {
    if (tocarArriba(x, y)) return;
    if (MUNECO.fase === 'bolas') {
      const m = MONTONES.findIndex((_, i) => dist(x, y, sitioMonton(i).x, sitioMonton(i).y + 40) < 150);
      if (m < 0 || MUNECO.bola) {
        SFX.tap();
        sparkles(x, y);
        return;
      }
      SFX.whoosh();
      MUNECO.bola = { x, y, t: T, m };
      return;
    }
    if (MUNECO.fase !== 'muneco') return;
    const i = MUNECO.bandeja.findIndex((id, j) => {
      const s = sitioParte(j);
      return !MUNECO.partes.slice(0, MUNECO.puestas).some((p) => p.id === id) && dist(x, y, s.x, s.y) < 85;
    });
    if (i < 0) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    if (MUNECO.bandeja[i] !== MUNECO.partes[MUNECO.puestas]!.id) {
      SFX.bad();
      say(juntar(tr('Esa todavía no.'), tr(MUNECO.partes[MUNECO.puestas]!.pide)));
      return;
    }
    MUNECO.puestas++;
    SFX.good();
    sparkles(MUNECO_POS.x, MUNECO_POS.y - 150, 12);
    if (MUNECO.puestas >= MUNECO.partes.length) empiezaBolas();
    else later(500, pideParte);
  },
};
