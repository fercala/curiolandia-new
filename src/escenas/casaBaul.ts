// ARCHIVO: escenas/casaBaul.ts — el baúl de Tito y los sitios que se iluminan, en la casa 2D (fase M2 de
//   docs/PLAN-CASA-MEJORA.md).
// Cómo encaja: la escena de la casa (SCENES.casaTito, escenas/casa.ts) dibuja con esto el botón del baúl (abajo a la
//   derecha, con un número si hay cosas nuevas), la bandeja que se abre al tocarlo (abajo, donde está el armario:
//   pestañas por tipo a la izquierda, una fila de cosas guardadas con flechas si no caben y el botón «¡Ordena, Tito!») y, mientras se arrastra una cosa, los sitios
//   libres donde cabe (círculos en el suelo, marcos en la pared). Aquí solo se dibuja y se calcula dónde está cada
//   casilla; lo que pasa al tocar y soltar lo decide la escena con los casos de uso de aplicacion/casa.ts.
// Exporta: BAUL (el botón), BANDEJA (el rectángulo de la bandeja), ORDENA (el botón «¡Ordena, Tito!»), los tipos
//   CasillaBaul y FlechaBaul, pestanasDe, casillasBaul, flechasBaul, dibujaBotonBaul, dibujaBandeja y dibujaSitios.
// Importa: el núcleo (ctx, card, circ, pic, text, T, hv, hC), K (el color de las líneas) y el tipo Sitio
//   (dominio/casaSitios.ts).
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600×900, como el resto de src/escenas/: los números son posiciones y tamaños en píxeles y los bucles dibujan. */
import { K } from '../dibujos/todos.ts';
import { T, card, circ, ctx, hC, hv, pic, text } from '../nucleo/indice.ts';
import type { Sitio } from '../dominio/casaSitios.ts';

/** El botón del baúl (abajo a la derecha de la casa): centro y radio. */
export const BAUL = { x: 1530, y: 845, r: 54 };
/** La bandeja del baúl abierta: esquina de arriba a la izquierda, ancho y alto (tapa el armario mientras está abierta). */
export const BANDEJA = { x: 290, y: 795, w: 1170, h: 105 };
/** El botón «¡Ordena, Tito!», dentro de la bandeja, a la derecha. */
export const ORDENA = { x: 1392, y: 848, r: 42 };

// PESTANAS: las pestañas de la bandeja: todas las cosas y una por categoría de la tienda que va a la casa (SHOPCAT en
// escenas/tienda.ts), con su dibujo.
const PESTANAS = [
  { id: 'todo', ic: 'baul' },
  { id: 'casa', ic: 'lampara' },
  { id: 'juguetes', ic: 'peluche' },
  { id: 'jardin', ic: 'columpio' },
  { id: 'mascotas', ic: 'hamster' },
];
// POR_FILA: cuántas cosas caben en la fila de la bandeja (con flechas, si hay más, se ven de POR_FILA en POR_FILA).
const POR_FILA = 7;
// FILA_Y: la altura de la fila de cosas de la bandeja. Las pestañas van a la izquierda, en dos filas de tres.
const FILA_Y = 848;

/** Una casilla de la bandeja: la cosa guardada (id) y su centro. */
export interface CasillaBaul {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}
/** Una flecha de la bandeja: centro y dirección (-1 a la izquierda, 1 a la derecha). */
export interface FlechaBaul {
  readonly x: number;
  readonly y: number;
  readonly d: -1 | 1;
}

// pestanasDe(ids, catDe): las pestañas que se ven, con su centro: «todo» siempre y las de las categorías que tienen
// alguna cosa guardada (catDe(id): la categoría de la tienda de cada una).
export function pestanasDe(ids: readonly string[], catDe: (id: string) => string) {
  const hay = new Set(ids.map(catDe));
  return PESTANAS.filter((p) => p.id === 'todo' || hay.has(p.id)).map((p, i) => ({
    ...p,
    x: 330 + (i % 3) * 50,
    y: FILA_Y - 25 + Math.floor(i / 3) * 50,
  }));
}

// deLaPestana(ids, pestana, catDe): las cosas guardadas de esa pestaña.
function deLaPestana(ids: readonly string[], pestana: string, catDe: (id: string) => string) {
  return pestana === 'todo' ? [...ids] : ids.filter((id) => catDe(id) === pestana);
}

// paginas(n): cuántas páginas hacen falta para n cosas (al menos una).
const paginas = (n: number) => Math.max(1, Math.ceil(n / POR_FILA));

// casillasBaul(ids, pestana, pag, catDe): las casillas de la fila de la bandeja: las cosas de la pestaña en la página
// pag (que da la vuelta), centradas si son pocas.
export function casillasBaul(
  ids: readonly string[],
  pestana: string,
  pag: number,
  catDe: (id: string) => string,
): CasillaBaul[] {
  const L = deLaPestana(ids, pestana, catDe),
    n = paginas(L.length),
    p = ((pag % n) + n) % n,
    trozo = L.slice(p * POR_FILA, p * POR_FILA + POR_FILA);
  return trozo.map((id, i) => ({ id, x: 560 + i * 98, y: FILA_Y }));
}

// flechasBaul(ids, pestana, catDe): las flechas de la bandeja, solo si las cosas de la pestaña no caben en una fila.
export function flechasBaul(ids: readonly string[], pestana: string, catDe: (id: string) => string): FlechaBaul[] {
  return deLaPestana(ids, pestana, catDe).length > POR_FILA
    ? [
        { x: 492, y: FILA_Y, d: -1 },
        { x: 1250, y: FILA_Y, d: 1 },
      ]
    : [];
}

// dibujaBotonBaul(abierto, nuevos, brilla): el botón del baúl: un círculo con el baúl dibujado (más grande y amarillo si
// está abierto o si se arrastra una cosa encima: brilla) y, si hay cosas nuevas sin colocar, un círculo rojo con
// cuántas.
export function dibujaBotonBaul(abierto: boolean, nuevos: number, brilla: boolean) {
  const B = BAUL,
    s = brilla ? 1.18 : hv('baul', hC(B.x, B.y, B.r));
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  if (brilla) {
    ctx.globalAlpha = 0.45 + 0.25 * Math.sin(T * 8);
    circ(0, 0, B.r + 14, '#FFE08A', 0);
    ctx.globalAlpha = 1;
  }
  circ(0, 0, B.r, abierto || brilla ? '#FFE08A' : '#fff', 6, abierto ? '#D9962A' : K);
  pic('baul', 0, abierto ? -4 : 0, B.r * 1.5);
  if (nuevos > 0) {
    const b = 1 + 0.12 * Math.abs(Math.sin(T * 4));
    circ(B.r * 0.72, -B.r * 0.72, 22 * b, '#FF6B5E', 4);
    text(String(nuevos), B.r * 0.72, -B.r * 0.72 + 9, 26, '#fff');
  }
  ctx.restore();
}

// Lo que dibujaBandeja necesita saber de la escena.
interface EstadoBandeja {
  /** Las cosas guardadas en el baúl (ids). */
  readonly ids: readonly string[];
  /** La pestaña y la página que se ven. */
  readonly pestana: string;
  readonly pag: number;
  /** La cosa que se está sacando (no se dibuja en la bandeja) y la que acaba de llegar (brilla). */
  readonly sacando: string;
  readonly nuevo: string;
  /** Las cosas nuevas (sin colocar nunca): llevan una estrellita. */
  readonly nuevos: readonly string[];
  /** Si «¡Ordena, Tito!» espera el segundo toque (el botón late). */
  readonly ordenaPide: boolean;
  /** La categoría de la tienda de cada cosa y cómo dibujarla. */
  readonly catDe: (id: string) => string;
  readonly dibuja: (id: string, x: number, y: number, s: number) => void;
}

// dibujaBandeja(e): la bandeja del baúl abierta: el fondo de madera, las pestañas (la elegida, amarilla), la fila de
// cosas guardadas (o, si está vacío, un baúl abierto vacío), las flechas y el botón «¡Ordena, Tito!» (la varita).
export function dibujaBandeja(e: EstadoBandeja) {
  const B = BANDEJA;
  card(B.x, B.y, B.w, B.h, '#F4D9A8', 6, 34);
  card(B.x + 175, B.y + 8, B.w - 300, B.h - 16, 'rgba(255,255,255,.6)', 0, 26);
  for (const p of pestanasDe(e.ids, e.catDe)) {
    const on = p.id === e.pestana,
      s = hv('pest:' + p.id, hC(p.x, p.y, 24));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(s, s);
    circ(0, 0, 23, on ? '#FFE08A' : '#fff', on ? 5 : 3, on ? '#D9962A' : K);
    pic(p.ic, 0, 0, 34);
    ctx.restore();
  }
  const cs = casillasBaul(e.ids, e.pestana, e.pag, e.catDe);
  if (!cs.length) {
    ctx.globalAlpha = 0.5;
    pic('baul', 850, FILA_Y + 4, 80);
    ctx.globalAlpha = 1;
  }
  for (const c of cs) {
    if (c.id === e.sacando) {
      circ(c.x, c.y, 38, 'rgba(74,52,40,.08)', 0);
      continue;
    }
    const nv = c.id === e.nuevo,
      s = hv('b:' + c.id, hC(c.x, c.y, 44)) * (nv ? 1 + 0.08 * Math.sin(T * 6) : 1);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(s, s);
    if (nv) {
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(T * 6);
      circ(0, 0, 52, '#FFE08A', 0);
      ctx.globalAlpha = 1;
    }
    circ(0, 0, 43, '#fff', nv ? 7 : 4, nv ? '#FFC93C' : K);
    e.dibuja(c.id, 0, 0, 70);
    if (e.nuevos.includes(c.id)) circ(30, -30, 11, '#FF6B5E', 3);
    ctx.restore();
  }
  for (const f of flechasBaul(e.ids, e.pestana, e.catDe)) {
    const s = hv('bpg' + f.d, hC(f.x, f.y, 30));
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(s * f.d, s);
    circ(0, 0, 28, '#fff', 5);
    ctx.beginPath();
    ctx.moveTo(-7, -13);
    ctx.lineTo(9, 0);
    ctx.lineTo(-7, 13);
    ctx.lineWidth = 7;
    ctx.strokeStyle = K;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
  {
    const O = ORDENA,
      s = hv('ordena', hC(O.x, O.y, O.r)) * (e.ordenaPide ? 1 + 0.1 * Math.abs(Math.sin(T * 7)) : 1);
    ctx.save();
    ctx.translate(O.x, O.y);
    ctx.scale(s, s);
    circ(0, 0, O.r, e.ordenaPide ? '#FFE08A' : '#E6F4FF', 6, e.ordenaPide ? '#D9962A' : K);
    pic('varita', 0, 0, O.r * 1.4);
    ctx.restore();
  }
}

// RADIO_SITIO: el radio horizontal del óvalo que marca un sitio libre en el suelo, según su tipo.
const RADIO_SITIO: Readonly<Record<Sitio['tipo'], number>> = {
  'suelo-grande': 130,
  alfombra: 130,
  suelo: 80,
  encima: 46,
  pared: 70,
};
// dibujaSitios(sitios, cerca): mientras se arrastra una cosa, los sitios libres donde cabe: un óvalo amarillo en el
// suelo (más pequeño encima de un mueble) o un marco en la pared; el más cercano al dedo (cerca), más fuerte.
export function dibujaSitios(sitios: readonly Sitio[], cerca: string) {
  const a = 0.35 + 0.15 * Math.sin(T * 6);
  for (const s of sitios) {
    const on = s.id === cerca;
    ctx.save();
    ctx.globalAlpha = on ? 0.85 : a;
    ctx.strokeStyle = on ? '#FF9F1C' : '#FFC93C';
    ctx.fillStyle = on ? 'rgba(255,224,138,.6)' : 'rgba(255,224,138,.3)';
    ctx.lineWidth = on ? 8 : 5;
    ctx.beginPath();
    if (s.tipo === 'pared') ctx.roundRect(s.x - 70, s.y - 150, 140, 140, 18);
    else {
      const rx = RADIO_SITIO[s.tipo];
      ctx.ellipse(s.x, s.y, rx, rx * 0.3, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
