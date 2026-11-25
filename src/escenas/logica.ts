/*
 * escenas/logica.ts: el rincón de la lógica de las clases del cole (idea 29 de docs/IDEAS-MEJORA.md, en la PR de todas
 * las ideas pendientes, v0.2.181). SCENES.rinconLogica es su menú (desde el rincón de la lógica de escenas/clases.ts):
 * «Programa a Tito» (mundo3d/programa3d.ts, si hay 3D) y cinco juegos en 2D, cada uno su escena:
 * - logicaSudoku: el sudoku de dibujos (3x3 o 4x4): se toca una fruta de abajo y luego su hueco.
 * - logicaFalta: ¿qué falta?: se miran unos dibujos, una cortina los tapa, se quita uno y se elige cuál falta.
 * - logicaDiferencias: dos dibujos casi iguales: se tocan en el de la derecha las diferencias.
 * - logicaBalanza: ¿qué pesa más? (tres rondas) y, con 5 años, equilibrar con bloques.
 * - logicaTangram: se completa una figura tocando una pieza y luego su sitio.
 * Cada juego terminado da 2 monedas (MONEDAS.juegoRepetido), se apunta en el diario de Tito y vuelve al menú. Las
 * reglas, en dominio/logica.ts.
 * Exporta, para las pruebas: LOGICA (el estado de los juegos), JUEGOS_LOGICA y tarjetaLogica; pone las escenas al
 * cargarse.
 * Importa: el núcleo (dibujo, voz, toque, monedas y escenas), azar() de aplicacion/puertos.ts, las reglas de
 * dominio/logica.ts y dominio/monedas.ts y apuntarDiario (escenas/diario.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  PI,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  giveCoins,
  go,
  hR,
  inCoinHUD,
  later,
  pic,
  say,
  sceneName,
  sky,
  text,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import {
  difEn,
  figuraTangram,
  mayorPeso,
  pesoDe,
  planBalanza,
  planDiferencias,
  planFalta,
  planSudoku,
  puedePoner,
  sudokuHecho,
  type FiguraTangram,
  type PlanBalanza,
  type PlanDiferencias,
  type PlanFalta,
  type Pieza,
  type Sudoku,
} from '../dominio/logica.ts';
import { apuntarDiario } from './diario.ts';

/** El estado de los juegos de la lógica (uno a la vez): el sudoku, ¿qué falta?, las diferencias, la balanza y el
 * tangram, con lo elegido, lo encontrado y si ya se ha terminado. */
export const LOGICA = {
  hecho: false,
  sudoku: null as Sudoku | null,
  elegido: -1,
  falta: null as PlanFalta | null,
  tapado: 0,
  dif: null as PlanDiferencias | null,
  halladas: [] as number[],
  balanza: [] as PlanBalanza[],
  ronda: 0,
  bloques: 0,
  inclina: null as null | 'izq' | 'der' | 'igual',
  figura: null as FiguraTangram | null,
  puestas: [] as number[],
  pieza: -1,
};

// JUEGOS_LOGICA: los juegos del menú (la escena y su título), en orden; «Programa a Tito», solo si hay 3D.
export const JUEGOS_LOGICA: readonly { escena: string; titulo: string; dibujo: string }[] = [
  { escena: 'programa', titulo: 'Programa a Tito', dibujo: 'fresa' },
  { escena: 'logicaSudoku', titulo: 'Sudoku de dibujos', dibujo: 'manzana' },
  { escena: 'logicaFalta', titulo: '¿Qué falta?', dibujo: 'gorro' },
  { escena: 'logicaDiferencias', titulo: 'Las diferencias', dibujo: 'mariposa' },
  { escena: 'logicaBalanza', titulo: 'La balanza', dibujo: 'elefante' },
  { escena: 'logicaTangram', titulo: 'El tangram', dibujo: 'casa' },
];
// tarjetaLogica(i): el rectángulo de la tarjeta del juego i en el menú (dos filas de tres).
export function tarjetaLogica(i: number): { x: number; y: number; w: number; h: number } {
  return { x: 230 + (i % 3) * 400, y: 200 + Math.floor(i / 3) * 330, w: 340, h: 290 };
}
// abierto(j): ¿se puede jugar al juego j? (su escena existe: «Programa a Tito» necesita el 3D).
const abierto = (j: { escena: string }): boolean => !!SCENES[j.escena];
// dentro(x, y, r): ¿está (x, y) dentro del rectángulo r?
const dentro = (x: number, y: number, r: { x: number; y: number; w: number; h: number }): boolean =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// terminar(): el juego está resuelto: Tito lo celebra, da las monedas, se apunta en el diario y, un rato después,
// se vuelve al menú.
function terminar(): void {
  if (LOGICA.hecho) return;
  LOGICA.hecho = true;
  const escena = sceneName;
  SFX.tada();
  burst(800, 420, 30);
  say('¡Muy bien! Lo has resuelto.');
  apuntarDiario('logica');
  later(900, () => giveCoins(MONEDAS.juegoRepetido, 800, 420));
  later(3800, () => {
    if (sceneName === escena) go('rinconLogica');
  });
}
// comunes(x, y, volver): la casa (vuelve a volver) y las monedas (la tienda); devuelve si se ha tocado alguna.
function comunes(x: number, y: number, volver: string): boolean {
  if (atHome(x, y)) {
    SFX.whoosh();
    go(volver);
    return true;
  }
  if (inCoinHUD(x, y)) {
    SFX.pop();
    go('tienda');
    return true;
  }
  return false;
}
// titulo(t): el cartel con el nombre del juego, arriba.
function titulo(t: string): void {
  card(520, 30, 560, 96, '#FFFFFF', 5, 36);
  text(t, 800, 96, 48, K, { max: 520 });
}

SCENES.rinconLogica = {
  // enter(): el menú, con su consigna.
  enter(_o: OpcionesEscena) {
    this.prompt!();
  },
  // prompt(): la consigna del menú.
  prompt() {
    say('¡El rincón de la lógica! Elige un juego.');
  },
  // hint(): el primer juego que se puede jugar.
  hint() {
    const i = JUEGOS_LOGICA.findIndex(abierto),
      r = tarjetaLogica(Math.max(0, i));
    return { x: r.x + r.w / 2, y: r.y + r.h / 2, r: 150 };
  },
  // draw(): una tarjeta por juego (las que no se pueden jugar, en gris), la casa y las monedas.
  draw() {
    sky('#E8F4FF', '#FFF6DE');
    titulo('Lógica');
    JUEGOS_LOGICA.forEach((j, i) => {
      const r = tarjetaLogica(i),
        si = abierto(j);
      if (si) hR(r.x, r.y, r.w, r.h);
      card(r.x, r.y, r.w, r.h, si ? '#FFFFFF' : '#E4DED4', 6, 30);
      pic(j.dibujo, r.x + r.w / 2, r.y + 115, 150, si ? 1 : 0.4);
      text(j.titulo, r.x + r.w / 2, r.y + 250, 34, K, { max: r.w - 30 });
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> las clases; un juego -> su escena.
  down(x: number, y: number) {
    if (comunes(x, y, 'clases')) return;
    const j = JUEGOS_LOGICA.find((g, i) => abierto(g) && dentro(x, y, tarjetaLogica(i)));
    if (j) {
      SFX.pop();
      go(j.escena, { hello: true });
    }
  },
} satisfies Escena;

// ── Sudoku ──
// celdaSudoku(f, c): el centro de la casilla (f, c) del sudoku; FRUTA_Y: la fila de frutas para elegir.
const celdaSudoku = (f: number, c: number): { x: number; y: number } => {
  const n = LOGICA.sudoku?.tablero.length ?? 3,
    t = n === 4 ? 120 : 140;
  return { x: 800 + (c - (n - 1) / 2) * t, y: 400 + (f - (n - 1) / 2) * t };
};
const FRUTA_Y = 790;
// frutaSudoku(i): el centro de la fruta i de la fila de abajo.
const frutaSudoku = (i: number): { x: number; y: number } => {
  const n = LOGICA.sudoku?.dibujos.length ?? 3;
  return { x: 800 + (i - (n - 1) / 2) * 160, y: FRUTA_Y };
};
// huecoSudoku(): el primer hueco y la fruta que va en él (para la ayuda), o null.
function huecoSudoku(): { f: number; c: number; v: number } | null {
  const s = LOGICA.sudoku;
  if (!s) return null;
  const i = s.tablero.flat().findIndex((v) => v === null);
  if (i < 0) return null;
  const n = s.tablero.length,
    f = Math.floor(i / n),
    c = i % n;
  return { f, c, v: s.solucion[f]![c]! };
}

SCENES.logicaSudoku = {
  // enter(): un sudoku nuevo para la edad.
  enter(_o: OpcionesEscena) {
    Object.assign(LOGICA, { hecho: false, sudoku: planSudoku(AGE(), azar), elegido: -1 });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('Pon cada fruta en un hueco. En cada fila y en cada columna, una de cada.');
  },
  // hint(): la fruta que va en el primer hueco (si no está elegida) o el hueco.
  hint() {
    const h = huecoSudoku();
    if (!h || LOGICA.hecho) return null;
    return LOGICA.elegido === h.v ? { ...celdaSudoku(h.f, h.c), r: 60 } : { ...frutaSudoku(h.v), r: 60 };
  },
  // draw(): el tablero con las frutas puestas y los huecos, y la fila de frutas para elegir (la elegida, más grande).
  draw() {
    sky('#E8F4FF', '#FFF6DE');
    titulo('Sudoku de dibujos');
    const s = LOGICA.sudoku!,
      t = s.tablero.length === 4 ? 120 : 140;
    s.tablero.forEach((fila, f) =>
      fila.forEach((v, c) => {
        const p = celdaSudoku(f, c);
        card(p.x - t / 2 + 4, p.y - t / 2 + 4, t - 8, t - 8, v === null ? '#FFF8D8' : '#FFFFFF', 4, 18);
        if (v !== null) pic(s.dibujos[v]!, p.x, p.y, t * 0.7);
      }),
    );
    s.dibujos.forEach((d, i) => {
      const p = frutaSudoku(i),
        sel = i === LOGICA.elegido;
      hR(p.x - 65, p.y - 65, 130, 130);
      card(p.x - 65, p.y - 65, 130, 130, sel ? '#FFE27A' : '#FFFFFF', sel ? 7 : 5, 24);
      pic(d, p.x, p.y, sel ? 105 : 90);
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el menú; una fruta de abajo -> se elige; un hueco -> se pone la elegida si va ahí.
  down(x: number, y: number) {
    if (comunes(x, y, 'rinconLogica') || LOGICA.hecho) return;
    const s = LOGICA.sudoku!,
      i = s.dibujos.findIndex((_, j) => dist(x, y, frutaSudoku(j).x, frutaSudoku(j).y) < 68);
    if (i >= 0) {
      SFX.tap();
      LOGICA.elegido = i;
      return;
    }
    const n = s.tablero.length,
      celda = [...Array(n * n).keys()].find((k) => {
        const p = celdaSudoku(Math.floor(k / n), k % n);
        return Math.abs(x - p.x) < 60 && Math.abs(y - p.y) < 60;
      });
    if (celda === undefined) return;
    const f = Math.floor(celda / n),
      c = celda % n;
    if (s.tablero[f]![c] !== null) return;
    if (LOGICA.elegido < 0) {
      say('Primero toca una fruta de abajo.');
      return;
    }
    if (!puedePoner(s, f, c, LOGICA.elegido)) {
      SFX.bad();
      say('Esa fruta ya está en esa fila o en esa columna. Prueba otra.');
      return;
    }
    SFX.good();
    LOGICA.sudoku = {
      ...s,
      tablero: s.tablero.map((fila, ff) => fila.map((v, cc) => (ff === f && cc === c ? LOGICA.elegido : v))),
    };
    if (sudokuHecho(LOGICA.sudoku)) terminar();
  },
} satisfies Escena;

// ── ¿Qué falta? ──
// dibujoFalta(i, n): el centro del dibujo i de n en la fila; opcionFalta(i): el centro de la opción i.
const dibujoFalta = (i: number, n: number): { x: number; y: number } => ({ x: 800 + (i - (n - 1) / 2) * 230, y: 360 });
const opcionFalta = (i: number): { x: number; y: number } => ({ x: 800 + (i - 1) * 260, y: 720 });
// TAPA: lo que se ve la escena antes de taparla y lo que dura la cortina (segundos).
const TAPA = { mira: 4, cortina: 1.6 };

SCENES.logicaFalta = {
  // enter(): unos dibujos nuevos; al rato se tapan y se quita uno.
  enter(_o: OpcionesEscena) {
    Object.assign(LOGICA, { hecho: false, falta: planFalta(AGE(), azar), tapado: T + TAPA.mira });
    say('Mira bien los dibujos. ¡Voy a esconder uno!');
    later(TAPA.mira * 1000 + TAPA.cortina * 1000, () => {
      if (sceneName === 'logicaFalta') say('¿Qué dibujo falta?');
    });
  },
  // prompt(): la pregunta (o, mientras se miran, que se miren bien).
  prompt() {
    say(T < LOGICA.tapado + TAPA.cortina ? 'Mira bien los dibujos. ¡Voy a esconder uno!' : '¿Qué dibujo falta?');
  },
  // hint(): la opción que falta, cuando ya se puede elegir.
  hint() {
    const p = LOGICA.falta;
    if (!p || LOGICA.hecho || T < LOGICA.tapado + TAPA.cortina) return null;
    return { ...opcionFalta(p.opciones.indexOf(p.falta)), r: 90 };
  },
  // draw(): los dibujos (sin el que falta, cuando ya se ha tapado), la cortina que baja y sube y las opciones.
  draw() {
    sky('#E8F4FF', '#FFF6DE');
    titulo('¿Qué falta?');
    const p = LOGICA.falta!,
      t = T - LOGICA.tapado,
      quitado = t > TAPA.cortina / 2;
    card(150, 200, 1300, 320, '#FFFFFF', 5, 30);
    p.dibujos.forEach((d, i) => {
      if (quitado && d === p.falta && !LOGICA.hecho) return;
      const q = dibujoFalta(i, p.dibujos.length);
      pic(d, q.x, q.y, 170);
    });
    if (t > 0 && t < TAPA.cortina) {
      const k = Math.sin((t / TAPA.cortina) * PI);
      ctx.fillStyle = '#C0504D';
      ctx.fillRect(150, 200, 1300, 320 * k);
    }
    if (t >= TAPA.cortina)
      p.opciones.forEach((d, i) => {
        const q = opcionFalta(i);
        hR(q.x - 100, q.y - 100, 200, 200);
        card(q.x - 100, q.y - 100, 200, 200, '#FFF1B2', 5, 30);
        pic(d, q.x, q.y, 150);
      });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el menú; una opción: la que falta, resuelto; otra, Tito lo dice.
  down(x: number, y: number) {
    if (comunes(x, y, 'rinconLogica') || LOGICA.hecho) return;
    const p = LOGICA.falta!;
    if (T < LOGICA.tapado + TAPA.cortina) return;
    const i = p.opciones.findIndex((_, j) => dist(x, y, opcionFalta(j).x, opcionFalta(j).y) < 100);
    if (i < 0) return;
    if (p.opciones[i] === p.falta) terminar();
    else {
      SFX.bad();
      say('No, ese sí estaba. Mira otra vez.');
    }
  },
} satisfies Escena;

// ── Las diferencias ──
// CUADROS: los dos cuadros (izquierda, el modelo; derecha, donde se buscan las diferencias).
const CUADROS = [
  { x: 110, y: 180, w: 660, h: 560 },
  { x: 830, y: 180, w: 660, h: 560 },
];
// enCuadro(c, ox, oy): el punto del cuadro c para (ox, oy) de 0 a 1.
const enCuadro = (c: number, ox: number, oy: number): { x: number; y: number } => {
  const q = CUADROS[c]!;
  return { x: q.x + ox * q.w, y: q.y + oy * q.h };
};

SCENES.logicaDiferencias = {
  // enter(): dos dibujos nuevos con sus diferencias.
  enter(_o: OpcionesEscena) {
    Object.assign(LOGICA, { hecho: false, dif: planDiferencias(AGE(), azar), halladas: [] });
    this.prompt!();
  },
  // prompt(): la consigna, con cuántas diferencias hay.
  prompt() {
    say('Los dos dibujos parecen iguales, pero no lo son. Toca en el de la derecha lo que es distinto.');
  },
  // hint(): la primera diferencia que falta por encontrar, en el cuadro de la derecha.
  hint() {
    const p = LOGICA.dif;
    const d = p?.difs.find((x) => !LOGICA.halladas.includes(x.i));
    if (!p || !d || LOGICA.hecho) return null;
    const o = p.objetos[d.i]!;
    return { ...enCuadro(1, o.x, o.y), r: 70 };
  },
  // draw(): los dos cuadros (en el de la derecha, lo que falta o es otro) y un aro en cada diferencia encontrada; abajo,
  // un círculo por diferencia.
  draw() {
    sky('#E8F4FF', '#FFF6DE');
    titulo('Las diferencias');
    const p = LOGICA.dif!;
    CUADROS.forEach((q, c) => {
      card(q.x, q.y, q.w, q.h, '#F4FBEA', 5, 26);
      p.objetos.forEach((o, i) => {
        const d = p.difs.find((x) => x.i === i),
          k = c === 1 && d ? d.otro : o.k,
          s = enCuadro(c, o.x, o.y);
        if (k) pic(k, s.x, s.y, 120);
        if (c === 1 && LOGICA.halladas.includes(i)) {
          ctx.lineWidth = 7;
          ctx.strokeStyle = '#FF6B6B';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 75, 0, PI * 2);
          ctx.stroke();
        }
      });
    });
    p.difs.forEach((d, i) => {
      ctx.beginPath();
      ctx.arc(800 + (i - (p.difs.length - 1) / 2) * 50, 800, 16, 0, PI * 2);
      ctx.fillStyle = LOGICA.halladas.includes(d.i) ? '#FF6B6B' : '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = K;
      ctx.stroke();
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el menú; en el cuadro de la derecha, una diferencia nueva se marca (con todas, resuelto).
  down(x: number, y: number) {
    if (comunes(x, y, 'rinconLogica') || LOGICA.hecho) return;
    const q = CUADROS[1]!,
      p = LOGICA.dif!;
    if (!dentro(x, y, q)) return;
    const d = difEn(p, (x - q.x) / q.w, (y - q.y) / q.h, 0.14);
    if (!d) {
      SFX.tap();
      return;
    }
    if (LOGICA.halladas.includes(d.i)) return;
    SFX.good();
    LOGICA.halladas = [...LOGICA.halladas, d.i];
    say('¡Una diferencia!');
    if (LOGICA.halladas.length === p.difs.length) terminar();
  },
} satisfies Escena;

// ── La balanza ──
// PLATILLOS: el centro de cada platillo (sin inclinar); BLOQUES_BOTON: el montón de bloques para equilibrar.
const PLATILLOS = { izq: { x: 520, y: 520 }, der: { x: 1080, y: 520 } };
export const BLOQUES_BOTON = { x: 1300, y: 690, w: 220, h: 150 };
// rondaBalanza(): la ronda de ahora.
const rondaBalanza = (): PlanBalanza | null => LOGICA.balanza[LOGICA.ronda] ?? null;
// platilloEn(lado): dónde está el platillo lado ahora, según cómo esté inclinada la balanza.
function platilloEn(lado: 'izq' | 'der'): { x: number; y: number } {
  const p = PLATILLOS[lado],
    i = LOGICA.inclina,
    baja = i === lado ? 60 : 0,
    sube = i && i !== 'igual' && i !== lado ? -60 : 0;
  return { x: p.x, y: p.y + baja + sube };
}
// siguienteBalanza(): pasa a la ronda siguiente (o, tras la última, resuelto).
function siguienteBalanza(): void {
  later(1800, () => {
    if (sceneName !== 'logicaBalanza') return;
    LOGICA.ronda++;
    LOGICA.inclina = null;
    LOGICA.bloques = 0;
    const r = rondaBalanza();
    if (!r) {
      terminar();
      return;
    }
    say(
      r.equilibrar
        ? 'Pon bloques en el otro platillo hasta que la balanza quede recta.'
        : '¿Qué pesa más? Toca el lado que pesa más.',
    );
  });
}

SCENES.logicaBalanza = {
  // enter(): las rondas nuevas para la edad.
  enter(_o: OpcionesEscena) {
    Object.assign(LOGICA, { hecho: false, balanza: planBalanza(AGE(), azar), ronda: 0, bloques: 0, inclina: null });
    this.prompt!();
  },
  // prompt(): la consigna de la ronda.
  prompt() {
    say(
      rondaBalanza()?.equilibrar
        ? 'Pon bloques en el otro platillo hasta que la balanza quede recta.'
        : '¿Qué pesa más? Toca el lado que pesa más.',
    );
  },
  // hint(): el lado que pesa más o, al equilibrar, el montón de bloques.
  hint() {
    const r = rondaBalanza();
    if (!r || LOGICA.hecho || LOGICA.inclina) return null;
    if (r.equilibrar) return { x: BLOQUES_BOTON.x + BLOQUES_BOTON.w / 2, y: BLOQUES_BOTON.y + 75, r: 100 };
    return { ...PLATILLOS[mayorPeso(r) ?? 'izq'], r: 150 };
  },
  // draw(): la balanza (el palo, que se inclina cuando se ha contestado) con lo que hay en cada platillo; al equilibrar,
  // los bloques puestos y el montón.
  draw() {
    sky('#E8F4FF', '#FFF6DE');
    titulo('La balanza');
    const r = rondaBalanza();
    if (!r) {
      drawHome();
      drawCoinHUD();
      return;
    }
    const a = platilloEn('izq'),
      b = platilloEn('der');
    ctx.fillStyle = '#8A5A33';
    ctx.fillRect(785, 300, 30, 420);
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#8A5A33';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - 150);
    ctx.lineTo(b.x, b.y - 150);
    ctx.stroke();
    [
      { p: a, cosas: r.izq },
      { p: b, cosas: r.equilibrar ? Array.from({ length: LOGICA.bloques }, () => 'bloque') : r.der },
    ].forEach(({ p, cosas }) => {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 150);
      ctx.lineTo(p.x - 150, p.y);
      ctx.moveTo(p.x, p.y - 150);
      ctx.lineTo(p.x + 150, p.y);
      ctx.stroke();
      card(p.x - 170, p.y, 340, 30, '#C9A06A', 4, 14);
      cosas.forEach((k, i) => {
        if (k === 'bloque') card(p.x - 140 + (i % 6) * 48, p.y - 46 - Math.floor(i / 6) * 46, 44, 44, '#5B8DEF', 3, 8);
        else pic(k, p.x + (i - (cosas.length - 1) / 2) * 120, p.y - 70, 140);
      });
    });
    if (r.equilibrar) {
      const q = BLOQUES_BOTON;
      hR(q.x, q.y, q.w, q.h);
      card(q.x, q.y, q.w, q.h, '#FFFFFF', 5, 24);
      [0, 1, 2].forEach((i) => card(q.x + 40 + i * 50, q.y + 50, 44, 44, '#5B8DEF', 3, 8));
    }
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el menú; un platillo -> se contesta y la balanza se inclina (si no era, Tito lo dice y se
  // repite); al equilibrar, cada toque al montón pone un bloque, y con el peso igual la balanza queda recta.
  down(x: number, y: number) {
    if (comunes(x, y, 'rinconLogica') || LOGICA.hecho || LOGICA.inclina) return;
    const r = rondaBalanza();
    if (!r) return;
    if (r.equilibrar) {
      if (!dentro(x, y, BLOQUES_BOTON)) return;
      SFX.tap();
      LOGICA.bloques++;
      if (LOGICA.bloques >= pesoDe(r.izq)) {
        LOGICA.inclina = 'igual';
        SFX.good();
        siguienteBalanza();
      }
      return;
    }
    const lado = (['izq', 'der'] as const).find((l) => Math.abs(x - PLATILLOS[l].x) < 220 && y > 250 && y < 700);
    if (!lado) return;
    const bueno = mayorPeso(r);
    LOGICA.inclina = bueno ?? 'igual';
    if (lado === bueno) {
      SFX.good();
      siguienteBalanza();
      return;
    }
    SFX.bad();
    say('¡Mira la balanza! Pesa más el otro lado.');
    later(1800, () => {
      LOGICA.inclina = null;
    });
  },
} satisfies Escena;

// ── Tangram ──
// BANDEJA_Y: la fila de piezas para elegir; piezaBandeja(i): el centro de la pieza i en ella.
const BANDEJA_Y = 790;
const piezaBandeja = (i: number): { x: number; y: number } => {
  const n = LOGICA.figura?.piezas.length ?? 2;
  return { x: 800 + (i - (n - 1) / 2) * 200, y: BANDEJA_Y };
};
// forma(p, x, y, s, relleno, borde): dibuja la forma de la pieza p en (x, y) con el tamaño s; sin relleno, solo el
// contorno a rayas (el sitio donde va).
function forma(p: Pieza, x: number, y: number, s: number, relleno: string | null): void {
  ctx.save();
  ctx.beginPath();
  if (p.forma === 'circulo') ctx.arc(x, y, s / 2, 0, PI * 2);
  else if (p.forma === 'triangulo') {
    ctx.moveTo(x, y - s / 2);
    ctx.lineTo(x + s / 2, y + s / 2);
    ctx.lineTo(x - s / 2, y + s / 2);
    ctx.closePath();
  } else if (p.forma === 'rectangulo') ctx.rect(x - s * 0.3, y - s / 2, s * 0.6, s);
  else ctx.rect(x - s / 2, y - s / 2, s, s);
  if (relleno) {
    ctx.fillStyle = relleno;
    ctx.fill();
  }
  ctx.lineWidth = 5;
  ctx.strokeStyle = relleno ? K : '#8C7E6A';
  ctx.setLineDash(relleno ? [] : [14, 10]);
  ctx.stroke();
  ctx.restore();
}
// siguientePieza(): la primera pieza sin poner (para la ayuda), o -1.
const siguientePieza = (): number => LOGICA.figura?.piezas.findIndex((_, i) => !LOGICA.puestas.includes(i)) ?? -1;

SCENES.logicaTangram = {
  // enter(): la figura de la edad, sin piezas puestas.
  enter(_o: OpcionesEscena) {
    Object.assign(LOGICA, { hecho: false, figura: figuraTangram(AGE()), puestas: [], pieza: -1 });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca una pieza y luego su sitio en la figura.');
  },
  // hint(): la pieza que va (si no está elegida) o su sitio.
  hint() {
    const f = LOGICA.figura,
      i = siguientePieza();
    if (!f || i < 0 || LOGICA.hecho) return null;
    const p = f.piezas[i]!;
    return LOGICA.pieza === i ? { x: p.x, y: p.y, r: 80 } : { ...piezaBandeja(i), r: 80 };
  },
  // draw(): la figura (los sitios a rayas y las piezas puestas), el dibujo de lo que es y la bandeja con las piezas que
  // quedan (la elegida, levantada).
  draw() {
    sky('#E8F4FF', '#FFF6DE');
    titulo('El tangram');
    const f = LOGICA.figura!;
    card(450, 160, 700, 520, '#FFFFFF', 5, 30);
    pic(f.dibujo, 1300, 300, 160);
    f.piezas.forEach((p, i) => forma(p, p.x, p.y, p.s, LOGICA.puestas.includes(i) ? p.color : null));
    f.piezas.forEach((p, i) => {
      if (LOGICA.puestas.includes(i)) return;
      const q = piezaBandeja(i),
        sel = LOGICA.pieza === i;
      hR(q.x - 80, q.y - 80, 160, 160);
      forma(p, q.x, q.y - (sel ? 16 : 0), Math.min(p.s, 120), p.color);
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el menú; una pieza de la bandeja -> se elige; su sitio -> se pone (con todas, resuelto); otro
  // sitio -> Tito lo dice.
  down(x: number, y: number) {
    if (comunes(x, y, 'rinconLogica') || LOGICA.hecho) return;
    const f = LOGICA.figura!,
      b = f.piezas.findIndex(
        (_, i) => !LOGICA.puestas.includes(i) && dist(x, y, piezaBandeja(i).x, piezaBandeja(i).y) < 80,
      );
    if (b >= 0) {
      SFX.tap();
      LOGICA.pieza = b;
      return;
    }
    const sitio = f.piezas.findIndex(
      (p, i) => !LOGICA.puestas.includes(i) && dist(x, y, p.x, p.y) < Math.max(50, p.s / 2),
    );
    if (sitio < 0) return;
    if (LOGICA.pieza < 0) {
      say('Toca una pieza y luego su sitio en la figura.');
      return;
    }
    const elegida = f.piezas[LOGICA.pieza]!,
      va = f.piezas.findIndex(
        (p, i) =>
          !LOGICA.puestas.includes(i) && p.forma === elegida.forma && dist(x, y, p.x, p.y) < Math.max(50, p.s / 2),
      );
    if (va < 0) {
      SFX.bad();
      say('Esa pieza no va ahí. Mira la forma.');
      return;
    }
    SFX.good();
    LOGICA.puestas = [...LOGICA.puestas, va === LOGICA.pieza ? va : LOGICA.pieza];
    LOGICA.pieza = -1;
    if (LOGICA.puestas.length === f.piezas.length) terminar();
  },
} satisfies Escena;
