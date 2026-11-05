/*
 * escenas/casaReacciones.ts: Tito camina por su casa y juega con cada objeto (fase C2 de docs/PLAN-CASA.md). La
 * escena casaTito (escenas/tienda.ts) guarda el paseo de Tito (de dónde a dónde va y cuándo salió) y la acción que
 * está haciendo, y en cada cuadro le pide a este módulo dónde está Tito, cómo se pone (sentado, tumbado, bailando...),
 * cómo se mueve el objeto con el que juega y qué partículas salen (notas, corazones, zetas, gotas). Todo depende de la
 * hora T y del momento en que empezó cada cosa: no hay que ir sumando nada cuadro a cuadro.
 * Qué hace Tito con cada objeto (su AccionTito) está en dominio/casa.ts (REACCIONES); lo que dice, en
 * contenido/casa.ts (FRASES_CASA).
 * Exporta: TITO_CASA (ancho de Tito en la casa), DURACION_ACCION, los tipos Paseo, AccionEnCurso y Pose y las
 * funciones paseoQuieto, posTito, andando, andar, destinoJunto, poseTito, animObjeto, efectosAccion y dibujaTitoCasa.
 * Importa del núcleo (T, la hora; parts, las partículas; ctx, drawTito, sparkles, rnd, PI), del puerto azar y de
 * dominio/casa.ts el tipo AccionTito.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son la coreografía de cada acción (cuánto se sube,
   cuánto gira, a qué velocidad): darles nombre a todos haría la tabla imposible de leer. */
import { PI, T, ctx, drawTito, parts, rnd, sparkles } from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import type { AccionTito } from '../dominio/casa.ts';

// TITO_CASA: ancho de Tito dentro de casa (antes 380, quieto): más pequeño para que quepa andando entre las cosas.
// Su dibujo es de 240x200, así que su alto es TITO_CASA*200/240.
export const TITO_CASA = 230;
const ALTO_TITO = (TITO_CASA * 200) / 240;
// DURACION_ACCION: segundos que dura una reacción (lo que tarda Tito en jugar con el objeto antes de quedarse quieto).
export const DURACION_ACCION = 2.6;
// VELOCIDAD: píxeles por segundo a los que anda Tito. SUELO: entre qué alturas pisa (los pies; el suelo de las
// habitaciones empieza en 600 y el armario está debajo de 790). Se queda dentro de BORDE a los lados.
const VELOCIDAD = 520,
  SUELO: readonly [number, number] = [630, 790],
  BORDE: readonly [number, number] = [150, 1490];

/** Un paseo de Tito: de (x0, y0) a (x1, y1), los pies; empezó en t0 (hora T) y dura dur segundos; flip = va a la izquierda. */
export interface Paseo {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly t0: number;
  readonly dur: number;
  readonly flip: boolean;
}

/** La acción que está haciendo Tito: con qué objeto (id, en x, y, de tamaño s), cuál y desde cuándo (t0, hora T). */
export interface AccionEnCurso {
  readonly id: string;
  readonly accion: AccionTito;
  readonly t0: number;
  readonly x: number;
  readonly y: number;
  readonly s: number;
}

/** Cómo se pone algo en un momento: desplazamiento, giro (radianes), escala, aplastado (sq) y si duerme. */
export interface Pose {
  readonly dx: number;
  readonly dy: number;
  readonly rot: number;
  readonly sc: number;
  readonly sq: number;
  readonly sleep: boolean;
}

// QUIETO: la pose sin mover nada.
const QUIETO: Pose = { dx: 0, dy: 0, rot: 0, sc: 1, sq: 0, sleep: false };
// limita(v, a, b): v dentro de [a, b].
const limita = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

// paseoQuieto(x, y, flip): Tito parado con los pies en (x, y).
export function paseoQuieto(x: number, y: number, flip = false): Paseo {
  return { x0: x, y0: y, x1: x, y1: y, t0: 0, dur: 0, flip };
}

// posTito(p, ahora): dónde están los pies de Tito a la hora ahora (en línea recta de un punto al otro).
export function posTito(p: Paseo, ahora: number = T): [number, number] {
  const u = p.dur > 0 ? limita((ahora - p.t0) / p.dur, 0, 1) : 1;
  return [p.x0 + (p.x1 - p.x0) * u, p.y0 + (p.y1 - p.y0) * u];
}

// andando(p, ahora): ¿sigue andando?
export function andando(p: Paseo, ahora: number = T): boolean {
  return ahora < p.t0 + p.dur;
}

// andar(p, x, y, ahora): un paseo nuevo desde donde está Tito ahora hasta (x, y), dentro del suelo y de los bordes.
// Si el sitio está casi en el mismo punto, mira hacia donde estaba mirando.
export function andar(p: Paseo, x: number, y: number, ahora: number = T): Paseo {
  const [x0, y0] = posTito(p, ahora),
    x1 = limita(x, BORDE[0], BORDE[1]),
    y1 = limita(y, SUELO[0], SUELO[1]);
  const d = Math.hypot(x1 - x0, y1 - y0);
  return { x0, y0, x1, y1, t0: ahora, dur: d / VELOCIDAD, flip: Math.abs(x1 - x0) < 8 ? p.flip : x1 < x0 };
}

// ENCIMA: acciones en las que Tito se pone sobre el objeto (se sienta en él, se mete, se tumba...), no a su lado.
const ENCIMA: readonly AccionTito[] = ['sentarse', 'tumbarse', 'columpiarse', 'tirarse', 'bañarse', 'croqueta'];

// destinoJunto(p, x, y, s, accion): a dónde va Tito para jugar con un objeto con la base en (x, y) y de tamaño s:
// encima (ENCIMA), debajo si cuelga de la pared (y < 600), o a su lado, por el lado por el que llega.
export function destinoJunto(p: Paseo, x: number, y: number, s: number, accion: AccionTito): [number, number] {
  if (ENCIMA.includes(accion)) return [x, y + 4];
  if (y < 600) return [x, SUELO[0] + 20];
  const [tx] = posTito(p),
    lado = tx < x ? -1 : 1;
  return [x + lado * (s * 0.42 + TITO_CASA * 0.42), y + 6];
}

// fase(a, ahora): segundos desde que empezó la acción a, o -1 si no hay acción o ya terminó.
function fase(a: AccionEnCurso | null, ahora: number): number {
  if (!a) return -1;
  const u = ahora - a.t0;
  return u >= 0 && u < DURACION_ACCION ? u : -1;
}

// arco(u): de 0 a 1 y vuelta a 0 a lo largo de la acción (para lo que sale y vuelve: el cohete, la pelota, el tren).
const arco = (u: number): number => Math.sin(Math.min(1, u / DURACION_ACCION) * PI);
// saltito(u, v, h): botes hacia arriba de altura h, v veces por segundo (negativo: hacia arriba).
const saltito = (u: number, v: number, h: number): number => -Math.abs(Math.sin(u * v)) * h;

// POSE_TITO: cómo se pone Tito en cada acción, en el segundo u de la acción. Las que no están, un saltito.
const POSE_TITO: Partial<Record<AccionTito, (u: number) => Partial<Pose>>> = {
  sentarse: () => ({ dy: 28, sq: 0.12 }),
  tumbarse: (u) => ({ rot: -0.18, dy: -20 + Math.sin(u * 2) * 3, sq: 0.26, sleep: true }),
  croqueta: (u) => ({ rot: u * PI * 3, dx: Math.sin(u * 2.4) * 90, dy: -20 }),
  columpiarse: (u) => ({ rot: Math.sin(u * 5) * 0.45, dy: -40 }),
  tirarse: (u) => ({ dx: Math.min(1, u) * 200 - 100, dy: -90 + Math.min(1, u) * 90, rot: u < 1 ? 0.35 : 0 }),
  bañarse: (u) => ({ dy: 40 + Math.sin(u * 4) * 6 }),
  bailar: (u) => ({ rot: Math.sin(u * 10) * 0.22, dy: saltito(u, 10, 18) }),
  mirar: () => ({ rot: -0.12, dy: -8 }),
  secarse: (u) => ({ rot: Math.sin(u * 22) * 0.12 }),
  abrazar: (u) => ({ sq: 0.06 + Math.sin(u * 6) * 0.03 }),
};

// poseTito(a, ahora, paseo): cómo se pone Tito: andando, un saltito al paso; jugando, la pose de su acción.
export function poseTito(a: AccionEnCurso | null, paseo: Paseo, ahora: number = T): Pose {
  if (andando(paseo, ahora))
    return { ...QUIETO, dy: saltito(ahora, 14, 12), sq: Math.abs(Math.sin(ahora * 14)) * 0.05 };
  const u = fase(a, ahora);
  if (u < 0 || !a) return QUIETO;
  const f = POSE_TITO[a.accion];
  return { ...QUIETO, ...(f ? f(u) : { dy: saltito(u, 8, 16) }) };
}

// POSE_OBJETO: cómo se mueve el objeto en cada acción, en el segundo u. Las que no están, late un poco.
const POSE_OBJETO: Partial<Record<AccionTito, (u: number) => Partial<Pose>>> = {
  girar: (u) => ({ rot: u * PI * 1.5 }),
  volar: (u) => ({ dy: -arco(u) * 420, rot: Math.sin(u * 3) * 0.15 }),
  chutar: (u) => ({ dx: arco(u) * 320, dy: saltito(u, 6, 70) }),
  empujar: (u) => ({ dx: arco(u) * 240, rot: Math.sin(u * 12) * 0.04 }),
  bailar: (u) => ({ rot: Math.sin(u * 10 + 1) * 0.2, dy: saltito(u, 10, 14) }),
  abrazar: () => ({ sc: 1.06 }),
  sentarse: () => ({ sq: 0.04 }),
  tumbarse: () => ({}),
  croqueta: () => ({}),
  columpiarse: (u) => ({ rot: Math.sin(u * 5) * 0.12 }),
};

// animObjeto(a, id, ahora): cómo se mueve el objeto id: solo si es el de la acción en curso; si no, quieto.
export function animObjeto(a: AccionEnCurso | null, id: string, ahora: number = T): Pose {
  const u = fase(a, ahora);
  if (u < 0 || !a || a.id !== id) return QUIETO;
  const f = POSE_OBJETO[a.accion];
  return { ...QUIETO, ...(f ? f(u) : { sc: 1 + Math.abs(Math.sin(u * 8)) * 0.08 }) };
}

// gota(x, y, c, k, vy, g): una partícula pequeña de tipo k (ver PARTÍCULAS en nucleo/escenas.ts).
function gota(x: number, y: number, c: string, k: string, vy: number, g: number): void {
  parts.push({
    x: x + rnd(-30, 30),
    y,
    vx: rnd(-50, 50),
    vy,
    life: rnd(0.7, 1.2),
    t: 0,
    c,
    r: rnd(8, 14),
    rot: 0,
    k,
    g,
  });
}

// EFECTOS: qué sale de cada acción y con qué probabilidad por cuadro: notas al tocar, zetas al dormir, corazones al
// abrazar, gotas y ondas en el agua, vapor de la olla, burbujas al soplar y brillos al mirar.
const EFECTOS: Partial<Record<AccionTito, { p: number; f: (x: number, y: number) => void }>> = {
  tocar: { p: 0.12, f: (x, y) => gota(x, y - 120, '#9B8AD9', 'n', -120, 0) },
  tumbarse: { p: 0.05, f: (x, y) => gota(x + 40, y - 120, '#5B8DEF', 'z', -60, 0) },
  abrazar: { p: 0.1, f: (x, y) => gota(x, y - 140, '#F58BB4', 'h', -90, 0) },
  bañarse: { p: 0.15, f: (x, y) => gota(x, y - 60, '#7FD3F0', 'd', -300, 900) },
  tirarse: { p: 0.08, f: (x, y) => gota(x, y - 40, '#7FD3F0', 'o', 0, 0) },
  regar: { p: 0.15, f: (x, y) => gota(x, y - 100, '#5BB8E6', 'd', 60, 600) },
  remover: { p: 0.1, f: (x, y) => gota(x, y - 140, '#FFFFFF', 'd', -80, -30) },
  soplar: { p: 0.1, f: (x, y) => gota(x, y - 120, '#BDEBFA', 'o', -100, -20) },
  mirar: { p: 0.06, f: (x, y) => sparkles(x, y - 150, 2) },
  encender: { p: 0.06, f: (x, y) => sparkles(x, y - 150, 2) },
  girar: { p: 0.06, f: (x, y) => sparkles(x, y - 100, 2) },
  volar: { p: 0.08, f: (x, y) => sparkles(x, y - 60, 2) },
  pintar: {
    p: 0.15,
    f: (x, y) =>
      gota(x, y - 100, ['#FF6B5E', '#FFC93C', '#7CC86E', '#5B8DEF'][Math.floor(rnd(0, 4))] as string, 'd', -40, 0),
  },
};

// efectosAccion(a, ahora): echa, de vez en cuando, las partículas de la acción en curso alrededor del objeto.
export function efectosAccion(a: AccionEnCurso | null, ahora: number = T): void {
  if (fase(a, ahora) < 0 || !a) return;
  const e = EFECTOS[a.accion];
  if (e && azar() < e.p) e.f(a.x, a.y);
}

// dibujaTitoCasa(paseo, a, extra, ahora): dibuja a Tito con los pies donde está en su paseo, mirando hacia donde va,
// con la pose de lo que hace (los giros, alrededor del centro de su cuerpo). extra: un salto más (el de tocarle).
export function dibujaTitoCasa(paseo: Paseo, a: AccionEnCurso | null, extra: number, ahora: number = T): void {
  const [x, y] = posTito(paseo, ahora),
    p = poseTito(a, paseo, ahora);
  ctx.save();
  ctx.translate(x + p.dx, y - ALTO_TITO / 2 + p.dy + extra);
  ctx.rotate(p.rot);
  drawTito(-TITO_CASA / 2, -ALTO_TITO / 2, TITO_CASA, { flip: paseo.flip, sq: p.sq, sleep: p.sleep });
  ctx.restore();
}
