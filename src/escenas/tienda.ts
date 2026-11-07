// ARCHIVO: escenas/tienda.ts (antes tienda.js) — las recompensas: monedas, la tienda, la ropa y colores de Tito, la casa
//   de Tito y los vales.
// Cómo encaja: se ganan monedas al acertar en los juegos (onRight, en nucleo/interfaz.ts) y al terminar un juego
//   (finishGame, en escenas/escenas2d.ts); se gastan en SCENES.tienda; lo comprado se ve en Tito (titoImg,
//   drawTitoWear) o en SCENES.casaTito (escenas/casa.ts, desde la fase M1 de docs/PLAN-CASA-MEJORA.md).
//   Los regalos del cofre (GIFTS, nextGift, grantGift) NO están aquí sino en escenas/cofre.ts (desde la fase 4q; antes
//   en escenas/zonas.ts), que se carga después e importa SHOP, wear y placeHome.
//   Los vales los configura un adulto en aplicacion/adultos.ts (S.vales) y se compran aquí (quedan apuntados en S.valesLog).
// Desde la fase 2l es un módulo: escenas/indice.ts lo carga después de zonas.ts, y el puente deja lo que exporta en
//   globalThis para las pruebas (escenas/repaso.ts, aplicacion/adultos.ts y los módulos de mundo3d/ lo importan, y desde la fase 4q
//   también escenas/cofre.ts). Hasta la fase 4q, escenas/zonas.ts, que va antes, usaba parte de lo de aquí como global
//   tardía; ahora el cofre está en escenas/cofre.ts y los colores de Tito, SHELLC y SCARFC, en el núcleo (nucleo/tito.ts).
// Define: DEF2, VALES_DEF, HATPOS, titoHouseIc,
//   SHOPCAT, shopItems, isWorn, WALLITEMS, ROOMS (habitaciones de la casa), habitualDe y la escena
//   SCENES.tienda. La casa de Tito por dentro (SCENES.casaTito, homeAction, homeLight, roomBg y roomBtns) está desde la
//   fase M1 de docs/PLAN-CASA-MEJORA.md en escenas/casa.ts, que importa de aquí lo de la casa.
// Exporta (lo usan otros archivos o las pruebas): SHELLC, SCARFC, SHOP, itemName, wear, drawItemPic, roomOf, roomOpen, roomsOpen, homeRoom,
//   placeHome, HSIZE y homeItems, y los tipos Articulo y Vale; para escenas/casa.ts (desde la fase M1), también ROOMS,
//   WALLITEMS, isWorn, titoHouseIc y los tipos Casilla y Flecha; desde la fase M2, habitualDe y casaEnS. Desde la M2,
//   los huecos fijos HOMESPOT y WALLSPOT y homeSpot ya no existen: las cosas van a los sitios de dominio/casaSitios.ts.
//   titoImg y drawTitoWear (Tito con su ropa) son internas desde la fase 4n: se pasan al núcleo con ponRopaTito.
// Envuelve: nada desde la fase 4b (antes onRight, finishGame y SCENES.juego, para las monedas: ahora las da el juego).
// Importa: el núcleo, src/nucleo/ (S, DEF, save, say, T, ctx, pic, card, text, circ, SFX, tone, hv, TITO, drawTito, titoKind,
//   TITO_EYES..., STARS, inR, copiaProfunda, sanoS y rellenaS (arreglar y completar la partida con DEF2) y las
//   monedas: spendCoins, drawCoinHUD, inCoinHUD), los dibujos de Tito
//   (TITO_SVG...), escenas/zonas.ts (houseLevel, drawTitoHouse, shellIcon), temas/ (floor), el caso de uso comprar
//   (aplicacion/comprar.ts), los de la casa ordenada (aplicacion/casa.ts, desde la fase M2), los sitios
//   (dominio/casaSitios.ts), las mascotas que crecen (dominio/casa.ts: MASCOTAS y fichaNueva), las reglas de
//   dominio/progreso.ts (TIER_NEED, nivelAbierto, habitacionAbierta)
//   y de dominio/monedas.ts (alcanza).
import type { Tito, Vale } from '../nucleo/tipos.ts';
import { CONEJO_SVG, ERIZO_SVG, K, TITO_SVG, TORTUGA_SVG } from '../dibujos/todos.ts';
import {
  DEF,
  H,
  IMG,
  LF,
  PI,
  S,
  SCARFC,
  SCENES,
  SFX,
  SHELLC,
  STARS,
  T,
  TITO,
  TITO_EYES,
  W,
  W_,
  atHome,
  back,
  burst,
  cap,
  card,
  circ,
  clamp,
  copiaProfunda,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  go,
  hC,
  hR,
  hv,
  inCoinHUD,
  inR,
  inTito,
  later,
  pic,
  ponRopaTito,
  rellenaS,
  sanoS,
  save,
  say,
  sayQ,
  sky,
  sparkles,
  spendCoins,
  star,
  svgImg,
  temasDone,
  text,
  titoKind,
  today,
} from '../nucleo/indice.ts';
import { floor } from '../temas/indice.ts';
import { drawTitoHouse, houseLevel, shellIcon } from './zonas.ts';
import { TIER_NEED, habitacionAbierta, nivelAbierto } from '../dominio/progreso.ts';
import { alcanza } from '../dominio/monedas.ts';
import { comprar } from '../aplicacion/comprar.ts';
import { MASCOTAS, fichaNueva } from '../dominio/casa.ts';
import { nuevoAlBaul, type CasaArreglada } from '../aplicacion/casa.ts';
import { EN_BAUL, PLANO, sitioMasCercano } from '../dominio/casaSitios.ts';

/** Dónde se pone una prenda o color en Tito (S.tito): sombrero, gafas, moño, caparazón o bufanda. */
export type Ranura = 'hat' | 'glasses' | 'bow' | 'shell' | 'scarf';

/** Un artículo de la tienda (SHOP) o un vale hecho artículo (shopItems). Ver el comentario de SHOP. */
export interface Articulo {
  id: string;
  cat: string;
  p: number;
  tier: number;
  slot?: Ranura;
  v?: string;
  n?: string;
  draw?(x: number, y: number, s: number): void;
  room?: string;
  pref?: string;
  vale?: Vale;
}

/** Una habitación de la casa de Tito (ROOMS). */
interface Habitacion {
  id: string;
  n: string;
  need: number;
  ic: string;
  cer: string;
}

/** Un artículo en la cuadrícula de la tienda o en el armario de la casa, con su posición. */
export interface Casilla {
  x: number;
  y: number;
  it: Articulo;
}

/** Una pestaña de la tienda (SHOPCAT) con su posición y ancho. */
interface Pestana {
  id: string;
  n: string;
  ic: string;
  x: number;
  y: number;
  w: number;
}

/** Una flecha de página: [x, y, dirección -1 o 1]. */
export type Flecha = [number, number, number];

/* ================= MONEDAS, TIENDA Y CASA DE TITO ================= */
// Campos del estado guardado S que añade este archivo (valores por defecto):
//   coins: monedas que tiene ahora; coinsTot: monedas ganadas en total; gift: (antiguo) regalo pendiente;
//   home: {idObjeto:{x,y,r,h}} dónde está cada cosa en la casa de Tito (r: habitación de ROOMS; sin r, el salón; h:
//   su sitio, desde la partida versión 5, dominio/casaSitios.ts);
//   rooms: cuántas habitaciones ya se vieron abiertas (para anunciar la nueva; ausente = 1); tito: {shell, scarf, hat, glasses, bow} lo que lleva
//   puesto (color del caparazón, color de la bufanda, id del sombrero, 'gafas' o '', 'monio' o '');
//   owned: {idArtículo:1} lo comprado o regalado; vales: lista de vales (ver VALES_DEF); valesLog: vales comprados
//   [{id, txt, d:fecha, given:0/1}]; cofres: cofres abiertos. El resto (woke, bday, bdayDone, unlockAll, seenOpen,
//   houseSeen, petSeen) lo usan otros archivos (escenas/, dominio/apertura.ts y aplicacion/adultos.ts).
//   Desde la fase C1 de docs/PLAN-CASA.md (partida versión 4; reglas en dominio/casa.ts): mascotas: {idMascota:
//   {nombre, dias, dia, hechos}} fichas de las mascotas que crecen; sorpresas: {idSorpresa:1} lo descubierto en la casa
//   (el id del objeto o 'a+b'); huerto: {dias, dia} días regados de la flor del huerto.
//   Desde la fase M2 de docs/PLAN-CASA-MEJORA.md: casaVistos: {id:1} lo que ya se colocó alguna vez en la casa (lo del
//   baúl que no está es nuevo); null hasta la primera vez que se entra en la casa (aplicacion/casa.ts).
// OJO: no cambies el formato de estos campos, hay partidas guardadas en los móviles.
const DEF2 = {
  coins: 0,
  coinsTot: 0,
  gift: '',
  woke: {},
  home: {},
  tito: { shell: 'naranja', scarf: 'roja', hat: '', glasses: '', bow: '' },
  owned: { 'caparazon:naranja': 1, 'bufanda:roja': 1 },
  vales: null,
  valesLog: [],
  bday: null,
  bdayDone: '',
  unlockAll: false,
  seenOpen: {},
  houseSeen: null,
  petSeen: null,
  cofres: 0,
  mascotas: {},
  sorpresas: {},
  huerto: { dias: 0, dia: '' },
  casaVistos: null,
};
// Se añaden a DEF (copia profunda) y se rellenan en S los que falten en partidas antiguas.
Object.assign(DEF, copiaProfunda(DEF2));
const _oldSave = S.coins === undefined && Object.keys(S.temas || {}).length > 0;
sanoS(S, DEF2); // campos de una partida rota (null o de otro tipo) → valor por defecto, como los que faltan
rellenaS(S, DEF2); // y los que faltan, con una copia de su valor por defecto
// quien ya jugaba la versión 1 recibe monedas por lo que ya había jugado
if (_oldSave) {
  const n = Object.values(S.temas).reduce((a, t) => a + Object.keys((t && t.g) || {}).length, 0) * 2;
  S.coins = S.coinsTot = n;
  save();
}
// Vales por defecto que un adulto puede activar en la zona de adultos: id, txt (lo que se promete),
// ic (dibujo), p (precio en monedas), on (1 = se ve en la tienda). Se copian a S.vales la primera vez.
const VALES_DEF: Vale[] = [
  { id: 'v1', txt: 'Un cuento extra antes de dormir', ic: 'libro', p: 30, on: 1 },
  { id: 'v2', txt: 'Ir a jugar al parque', ic: 'parque', p: 50, on: 1 },
  { id: 'v3', txt: 'Elegir a qué jugamos juntos', ic: 'bloques', p: 40, on: 1 },
  { id: 'v4', txt: 'Cocinar algo rico juntos', ic: 'olla', p: 60, on: 0 },
  { id: 'v5', txt: 'Elegir la película del fin de semana', ic: 'tele', p: 60, on: 0 },
  { id: 'v6', txt: 'Un abrazo de oso gigante', ic: 'oso', p: 10, on: 0 },
];
if (!S.vales) S.vales = copiaProfunda(VALES_DEF);

// Las monedas en pantalla (marcador, animación, creditCoins, giveCoins...) están desde la fase 4a en su propio módulo,
// desde la 4b en el núcleo (nucleo/monedas.ts). Las de cada acierto las da onRight (nucleo/interfaz.ts) y las de
// terminar un juego, finishGame (escenas/escenas2d.ts): este archivo ya no envuelve ninguna de las dos.

/* ---------- Tito con ropa y colores ---------- */
// SHELLC y SCARFC (los colores del caparazón y de la bufanda) están desde la fase 4q en el núcleo (nucleo/tito.ts).
// Caché de imágenes de Tito ya coloreadas, por clave "animal|caparazón|bufanda".
const TITOIMG: Record<string, HTMLImageElement> = {};
// Devuelve la imagen de Tito con los colores elegidos en S.tito. Crea (una sola vez) un SVG cambiando los
// colores originales por los de SHELLC/SCARFC; mientras la imagen nueva no ha cargado devuelve la de siempre.
function titoImg() {
  const t: Tito = S.tito || {},
    sh = SHELLC[t.shell!] ? t.shell! : 'naranja',
    sc = SCARFC[t.scarf!] ? t.scarf! : 'roja',
    tk = titoKind(),
    er = tk === 'erizo',
    key = (tk === 'caracol' ? '' : tk + '|') + sh + '|' + sc;
  if (key === 'naranja|roja') return IMG.tito;
  // el erizo lleva el color de la tienda en las púas (con el naranja de siempre, púas marrones); la tortuga en el caparazón y el conejo en la mochila
  if (!TITOIMG[key])
    TITOIMG[key] = er
      ? svgImg(
          ERIZO_SVG.replace('fill="#B07A4F"', 'fill="' + (sh === 'naranja' ? '#B07A4F' : SHELLC[sh][0]) + '"')
            .replace('stroke="#7A5030"', 'stroke="' + (sh === 'naranja' ? '#7A5030' : SHELLC[sh][1]) + '"')
            .replace('fill="#FF6B5E"', 'fill="' + SCARFC[sc] + '"'),
          '0 0 240 200',
          480,
        )
      : svgImg(
          ({ caracol: TITO_SVG, tortuga: TORTUGA_SVG, conejo: CONEJO_SVG } as Record<string, string>)[tk]
            .replace('fill="#FFA94D"', 'fill="' + SHELLC[sh][0] + '"')
            .replace('stroke="#D9762A"', 'stroke="' + SHELLC[sh][1] + '"')
            .replace('fill="#FF6B5E"', 'fill="' + SCARFC[sc] + '"'),
          '0 0 240 200',
          480,
        );
  const i = TITOIMG[key];
  return i.complete ? i : IMG[tk === 'caracol' ? 'tito' : tk] || IMG.tito;
}
// Dónde va cada sombrero sobre el dibujo de Tito: id → [x, y, tamaño] en coordenadas del dibujo (240x200).
const HATPOS: Record<string, [number, number, number]> = {
  gorroFiesta: [198, 28, 86],
  gorra: [204, 44, 84],
  gorro: [198, 40, 84],
  gorroNavidad: [202, 32, 92],
  sombreroCopa: [198, 34, 78],
  sombreroPirata: [198, 38, 100],
  corona: [198, 42, 72],
};
// Dibuja encima de Tito lo que lleva puesto (moño, sombrero, gafas). k = escala del dibujo de Tito.
// Las posiciones dependen del animal (titoKind); TITO_EYES da dónde están los ojos.
function drawTitoWear(k: number) {
  const t = S.tito || {};
  const tk = titoKind(),
    E = TITO_EYES[tk],
    BW = (
      { caracol: [126, 42], erizo: [104, 66], tortuga: [100, 70], conejo: [66, 104] } as Record<
        string,
        [number, number]
      >
    )[tk],
    HY = ({ caracol: 0, erizo: 4, tortuga: 10, conejo: 4 } as Record<string, number>)[tk];
  if (t.bow) pic('monio', BW[0] * k, BW[1] * k, 56 * k);
  // en el caracol el sombrero tapa los ojos (están en las antenas) y se vuelven a dibujar encima; en los demás no hace falta
  if (t.hat && HATPOS[t.hat]) {
    const [x, y, s] = HATPOS[t.hat];
    pic(t.hat, x * k, (y + HY) * k, s * k);
    if (tk === 'caracol')
      for (const ex of [174, 222]) {
        circ(ex * k, 20 * k, 15 * k, '#fff', 5 * k);
        circ((ex + 3) * k, 22 * k, 7 * k, K, 0);
        circ((ex + 5) * k, 19 * k, 2.5 * k, '#fff', 0);
      }
  }
  if (t.glasses) {
    for (const [ex, ey, er_] of E) circ(ex * k, ey * k, (er_ + 3) * k, 'rgba(40,40,70,.38)', 6 * k);
    const [a, b] = E;
    ctx.beginPath();
    ctx.moveTo((a[0] + a[2] + 3) * k, (a[1] - 2) * k);
    ctx.lineTo((b[0] - b[2] - 3) * k, (b[1] - 2) * k);
    ctx.lineWidth = 4 * k;
    ctx.strokeStyle = K;
    ctx.stroke();
    for (const [ex, ey] of E) {
      ctx.beginPath();
      ctx.arc((ex - 4) * k, (ey - 6) * k, 6 * k, PI * 1.1, PI * 1.6);
      ctx.lineWidth = 3 * k;
      ctx.strokeStyle = 'rgba(255,255,255,.8)';
      ctx.stroke();
    }
  }
}
// tito.ts dibuja a Tito con su imagen de colores (titoImg) y su ropa (drawTitoWear): se las damos con ponRopaTito.
ponRopaTito(titoImg, drawTitoWear);

/* ---------- catálogo ---------- */
// icono de la casa de Tito: la casita con caparazón para el caracol; para los otros animales, su casa en pequeño (con el emblema de su animal)
export function titoHouseIc(x: number, y: number, s: number) {
  if (titoKind() === 'caracol') return pic('casaCaracol', x, y, s);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 280, s / 280);
  drawTitoHouse(0, 110, Math.min(1, houseLevel()));
  ctx.restore();
}
// Pestañas de la tienda: id de categoría, n (nombre que dice Tito) e ic (dibujo de la pestaña).
const SHOPCAT = [
  { id: 'ropa', n: 'Ropa para Tito', ic: 'gorroFiesta' },
  { id: 'colores', n: 'Colores para Tito', ic: 'caracol' },
  { id: 'casa', n: 'Cosas para la casa', ic: 'lampara' },
  { id: 'juguetes', n: 'Juguetes', ic: 'peluche' },
  { id: 'jardin', n: 'Cosas para el jardín', ic: 'columpio' },
  { id: 'mascotas', n: 'Mascotas', ic: 'hamster' },
  { id: 'vales', n: 'Vales para canjear', ic: 'vale' },
];
// Catálogo de la tienda. Cada artículo: {id, cat, p (precio), tier (nivel 1-3, ver TIER_NEED),
//   slot (solo ropa/colores: 'hat', 'glasses', 'bow', 'shell' o 'scarf'), v (color para shell/scarf),
//   n (nombre que dice Tito, si no se usa W_(id)), draw(x,y,s) (dibujo propio, si no se usa pic(id)),
//   room (habitación de ROOMS a la que va; mientras esté cerrada, el artículo sale con candado en la tienda) o
//   pref (habitación preferida, sin candado: si está cerrada, va al salón)}.
// Los artículos sin slot van a la casa de Tito (necesitan dibujo en PICS y tamaño en HSIZE).
// Se escriben como listas cortas [id, precio, nivel, slot] que .map convierte en objetos.
export const SHOP: Articulo[] = [
  ...(
    [
      ['gorroFiesta', 6, 1],
      ['gorra', 8, 1],
      ['monio', 6, 1, 'bow'],
      ['gafas', 10, 1, 'glasses'],
      ['gorro', 10, 1],
      ['gorroNavidad', 12, 2],
      ['sombreroCopa', 18, 2],
      ['sombreroPirata', 18, 2],
      ['corona', 30, 3],
    ] as [string, number, number, Ranura?][]
  ).map(([id, p, tier, slot]) => ({ id, cat: 'ropa', slot: slot || 'hat', p, tier })),
  ...(
    [
      ['naranja', 0, 1],
      ['azul', 15, 1],
      ['rosa', 15, 2],
      ['verde', 20, 2],
      ['violeta', 25, 3],
      ['dorado', 40, 3],
    ] as [string, number, number][]
  ).map(([c, p, tier]) => ({
    id: 'caparazon:' + c,
    cat: 'colores',
    slot: 'shell',
    v: c,
    p,
    tier,
    n: 'el caparazón ' + (c === 'rosa' ? 'rosa' : c === 'verde' ? 'verde' : c),
    draw: (x: number, y: number, s: number) => {
      if (titoKind() !== 'caracol') return shellIcon(x, y, s * 0.36, c);
      circ(x, y, s * 0.36, SHELLC[c][0], 6);
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * PI * 4.4,
          r = 4 + (i / 40) * s * 0.26;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      ctx.lineWidth = s * 0.05;
      ctx.strokeStyle = SHELLC[c][1];
      ctx.lineCap = 'round';
      ctx.stroke();
    },
  })),
  ...(
    [
      ['roja', 0, 1],
      ['azul', 8, 1],
      ['amarilla', 8, 1],
      ['violeta', 10, 2],
    ] as [string, number, number][]
  ).map(([c, p, tier]) => ({
    id: 'bufanda:' + c,
    cat: 'colores',
    slot: 'scarf',
    v: c,
    p,
    tier,
    n: 'la bufanda ' + c,
    draw: (x: number, y: number, s: number) => {
      ctx.save();
      ctx.translate(x, y);
      card(-s * 0.38, -s * 0.16, s * 0.76, s * 0.2, SCARFC[c], 6, s * 0.1);
      card(s * 0.08, -s * 0.04, s * 0.16, s * 0.38, SCARFC[c], 6, s * 0.06);
      ctx.restore();
    },
  })),
  ...(
    [
      ['alfombra', 10, 1],
      ['cuadro', 8, 1],
      ['plantaInterior', 8, 1],
      ['lampara', 12, 1],
      ['banco', 12, 2],
      ['estanteria', 15, 2],
      ['reloj', 15, 2],
      ['farol', 15, 2],
      ['piano', 30, 3],
      ['fuente', 35, 3],
    ] as [string, number, number][]
  ).map(([id, p, tier]) => ({ id, cat: 'casa', p, tier })),
  ...(
    [
      ['pelotaPlaya', 6, 1],
      ['bloques', 8, 1],
      ['peluche', 10, 1],
      ['cometa', 10, 1],
      ['xilofono', 12, 1],
      ['muneca', 15, 2],
      ['robot', 18, 2],
      ['trenJuguete', 18, 2],
      ['guitarra', 20, 2],
      ['telescopio', 30, 3],
    ] as [string, number, number][]
  ).map(([id, p, tier]) => ({ id, cat: 'juguetes', p, tier })),
  ...(
    [
      ['pecera', 20, 1],
      ['hamster', 25, 2],
      ['casitaPerro', 40, 3],
    ] as [string, number, number][]
  ).map(([id, p, tier]) => ({ id, cat: 'mascotas', p, tier })),
  // v1.590: cosas para cada habitación nueva de la casa (room) y más juguetes y mascotas.
  // [id, precio, nivel, habitación, categoría, nombre (si W_ no lo dice bien)]
  ...(
    [
      ['sofa', 15, 1, 'salon'],
      ['tele', 20, 2, 'salon'],
      ['cama', 15, 1, 'dormitorio'],
      ['baul', 12, 1, 'dormitorio'],
      ['cuento', 6, 1, 'dormitorio'],
      ['estrellas', 15, 2, 'dormitorio', 'casa', 'las estrellas que brillan'],
      ['mesa', 10, 1, 'cocina'],
      ['silla', 6, 1, 'cocina'],
      ['nevera', 18, 1, 'cocina'],
      ['olla', 8, 1, 'cocina'],
      ['tarta', 12, 2, 'cocina'],
      ['banera', 18, 1, 'bano'],
      ['toalla', 6, 1, 'bano'],
      ['jabon', 4, 1, 'bano'],
      ['pato', 6, 1, 'bano', 'casa', 'el patito de goma'],
      ['tambor', 12, 1, 'juegos', 'juguetes'],
      ['pizarra', 15, 1, 'juegos', 'juguetes', 'la pizarra'],
      ['pinturas', 10, 1, 'juegos', 'juguetes'],
      ['globo', 6, 1, 'juegos', 'juguetes'],
      ['tobogan', 25, 2, 'juegos', 'juguetes'],
      ['arbol', 15, 1, 'jardin', 'jardin'],
      ['plantaFlor', 8, 1, 'jardin', 'jardin'],
      ['regadera', 6, 1, 'jardin', 'jardin'],
      ['columpio', 25, 2, 'jardin', 'jardin'],
      ['castillo', 20, 2, 'jardin', 'jardin'],
      ['piscina', 30, 3, 'jardin', 'jardin'],
      ['tierra', 20, 2, 'torre', 'casa', 'el globo terráqueo'],
      ['saturno', 25, 2, 'torre', 'casa', 'Saturno'],
      ['cohete', 40, 3, 'torre', 'juguetes'],
    ] as [string, number, number, string, string?, string?][]
  ).map(([id, p, tier, room, cat, n]) => Object.assign({ id, cat: cat || 'casa', p, tier, room }, n ? { n } : {})),
  ...(
    [
      ['gato', 30, 2],
      ['pajaro', 25, 2],
      ['conejo', 35, 3],
    ] as [string, number, number][]
  ).map(([id, p, tier]) => ({ id, cat: 'mascotas', p, tier, pref: 'jardin' })),
];
// Habitación preferida de los artículos de antes (sin candado): los juguetes, al cuarto de juegos (el telescopio, a la
// torre); las mascotas, al jardín.
SHOP.forEach((it) => {
  if (!it.room && !it.slot && !it.pref && (it.cat === 'juguetes' || it.cat === 'mascotas'))
    it.pref = it.cat === 'juguetes' ? 'juegos' : 'jardin';
});
SHOP.find((i) => i.id === 'telescopio')!.pref = 'torre'; // el telescopio, a la torre de las estrellas
// Artículos de una categoría. Para "vales" crea artículos a partir de los vales activos de S.vales (máx. 10).
const shopItems = (cat: string): Articulo[] =>
  cat === 'vales'
    ? S.vales!.filter((v) => v.on)
        .slice(0, 10)
        .map((v) => ({ id: 'vale:' + v.id, cat: 'vales', p: v.p!, tier: 1, vale: v, n: 'el vale: ' + v.txt }))
    : SHOP.filter((i) => i.cat === cat);
// Nombre de un artículo para decirlo en voz alta (it.n o el nombre del diccionario W_).
export const itemName = (it: Articulo) => (it.n ? it.n : W_(it.id));
// ¿Tito lleva puesto ahora este artículo de ropa o color?
export const isWorn = (it: Articulo) => {
  const t = S.tito!;
  return it.slot === 'hat'
    ? t.hat === it.id
    : it.slot === 'glasses'
      ? !!t.glasses
      : it.slot === 'bow'
        ? !!t.bow
        : it.slot === 'shell'
          ? t.shell === it.v
          : it.slot === 'scarf'
            ? t.scarf === it.v
            : false;
};
// Pone (on=true) o quita la prenda it a Tito en S.tito y guarda. Los colores siempre se ponen (no se quitan).
export function wear(it: Articulo, on: boolean) {
  const t = S.tito!;
  if (it.slot === 'hat') t.hat = on ? it.id : '';
  if (it.slot === 'glasses') t.glasses = on ? 'gafas' : '';
  if (it.slot === 'bow') t.bow = on ? 'monio' : '';
  if (it.slot === 'shell') t.shell = it.v;
  if (it.slot === 'scarf') t.scarf = it.v;
  save();
}
// Dibuja el artículo en (x,y) con tamaño s: su draw propio, un vale (con su icono en un circulito) o su dibujo pic.
export function drawItemPic(it: Articulo, x: number, y: number, s: number) {
  if (it.draw) it.draw(x, y, s);
  else if (it.vale) {
    pic('vale', x, y, s);
    circ(x + s * 0.26, y - s * 0.24, s * 0.2, '#fff', 4);
    pic(it.vale.ic!, x + s * 0.26, y - s * 0.24, s * 0.32);
  } else pic(it.id, x, y, s);
}
// Cosas que van colgadas en la pared (se dibujan detrás y no bajan al suelo). Desde la fase M2 de
// docs/PLAN-CASA-MEJORA.md, dónde puede ir cada cosa lo dicen los sitios (dominio/casaSitios.ts: los de pared tienen
// tamaño 'pared'); ya no hay huecos fijos (HOMESPOT y WALLSPOT).
export const WALLITEMS = ['cuadro', 'reloj', 'pizarra', 'estrellas', 'saturno'];
// ROOMS: habitaciones de la casa de Tito (v1.590). Cada una: id, n (nombre con artículo, lo dice Tito), need (casitas
// —temas— terminadas para que se abra; 0 = siempre), ic (dibujo de su botón) y cer (cómo se dice "cerrado/a").
// Las cosas de la casa guardan su habitación en S.home[id].r (sin r = el salón, como en las partidas de antes).
export const ROOMS: Habitacion[] = [
  { id: 'salon', n: 'el salón', need: 0, ic: 'sofa', cer: 'cerrado' },
  { id: 'dormitorio', n: 'el dormitorio', need: 1, ic: 'cama', cer: 'cerrado' },
  { id: 'cocina', n: 'la cocina', need: 3, ic: 'olla', cer: 'cerrada' },
  { id: 'bano', n: 'el baño', need: 5, ic: 'banera', cer: 'cerrado' },
  { id: 'juegos', n: 'el cuarto de juegos', need: 8, ic: 'bloques', cer: 'cerrado' },
  { id: 'jardin', n: 'el jardín', need: 11, ic: 'arbol', cer: 'cerrado' },
  { id: 'torre', n: 'la torre de las estrellas', need: 14, ic: 'telescopio', cer: 'cerrada' },
];
// roomOf(id de habitación) → la habitación; roomOpen(id): ¿está abierta? (temas terminados, temasDone de nucleo/tito.ts;
// regla habitacionAbierta de dominio/progreso.ts);
// roomsOpen(): las abiertas, en orden; homeRoom(id de objeto): habitación donde está ese objeto.
export const roomOf = (r: string) => ROOMS.find((x) => x.id === r) || ROOMS[0],
  roomOpen = (r: string) => habitacionAbierta(roomOf(r).need, temasDone()),
  roomsOpen = () => ROOMS.filter((R) => roomOpen(R.id)),
  homeRoom = (id: string) => (S.home![id] && S.home![id].r) || 'salon';
// habitualDe(id): la habitación habitual del objeto id (la room o la pref de la tienda), o undefined si no tiene. La
// usan placeHome y «¡Ordena, Tito!» (escenas/casa.ts, desde la fase M2).
export function habitualDe(id: string): string | undefined {
  const it = SHOP.find((i) => i.id === id);
  return it && (it.room || it.pref);
}
// Coloca un objeto en la casa (S.home[id]) si no estaba: desde la fase M2 de docs/PLAN-CASA-MEJORA.md, en el sitio
// libre que prefiera su tamaño (dominio/casaSitios.ts) de su habitación habitual (habitualDe) si está abierta, o del
// salón; si no cabe, al baúl. Lo nuevo que se compra ya no pasa por aquí (va al baúl: nuevoAlBaul); lo usan los
// regalos del cofre y las pruebas. No guarda.
export function placeHome(id: string) {
  if (S.home![id]) return;
  const want = habitualDe(id),
    r = want && roomOpen(want) ? want : 'salon',
    s = sitioMasCercano(PLANO, r, S.home!, id, 1000, 700);
  S.home![id] = s ? { x: s.x, y: s.y, r, h: s.id } : { x: 0, y: 0, r: EN_BAUL };
}
// casaEnS(c): pone en S la casa que devuelve un caso de uso de aplicacion/casa.ts (home y casaVistos). No guarda.
export function casaEnS(c: CasaArreglada) {
  S.home = c.home as typeof S.home;
  S.casaVistos = c.casaVistos;
}

/* ---------- la tienda ---------- */
// Escena de la tienda: pestañas de categorías, cuadrícula de artículos (5 por fila, 10 por página, con flechas si
// hay más), ventana de confirmación (this.conf) y botón para ir a la casa de Tito. Estado: cat (pestaña), page
// (página de la pestaña), conf/confT (artículo a confirmar y cuándo), newHome/newId (se acaba de comprar algo
// para la casa: el botón de la casa salta).
SCENES.tienda = {
  music: 'casita',
  // Al entrar: Tito saluda (la primera vez explica cómo funciona; S.first.tienda lo recuerda).
  enter() {
    this.cat = this.cat || 'ropa';
    this.page = this.page || 0;
    this.conf = null;
    this.newHome = 0;
    const seen = S.first.tienda;
    later(300, () =>
      sayQ(
        seen
          ? '¡La tienda! Tienes ' + S.coins + ' monedas. Toca algo para ver cuánto cuesta.'
          : '¡Bienvenido a la tienda! Con las monedas que ganas jugando, puedes comprar cosas para mí y para mi casa. Arriba eliges qué mirar.',
      ),
    );
    S.first.tienda = 1;
    save();
  },
  // Pestañas visibles con su posición y ancho w (la de vales solo si hay algún vale activo). Con muchas pestañas se
  // juntan un poco para que quepan.
  tabs(): Pestana[] {
    const a = SHOPCAT.filter((c) => c.id !== 'vales' || S.vales!.some((v) => v.on)),
      st = Math.min(204, 1330 / a.length);
    return a.map((c, i) =>
      Object.assign({ x: 900 - ((a.length - 1) * st) / 2 + i * st, y: 215, w: Math.min(184, st - 12) }, c),
    );
  },
  // Número de páginas de la pestaña actual (10 artículos por página).
  pages() {
    return Math.max(1, Math.ceil(shopItems(this.cat).length / 10));
  },
  // Artículos de la página actual con su posición en la cuadrícula.
  grid(): Casilla[] {
    const pg = Math.min(this.page || 0, this.pages() - 1),
      L = shopItems(this.cat).slice(pg * 10, pg * 10 + 10);
    return L.map((it, i) => Object.assign({ x: 400 + (i % 5) * 240, y: i < 5 ? 440 : 700, it }));
  },
  // Flechas para cambiar de página: [x, y, dirección] de las que se pueden usar.
  arrows(): Flecha[] {
    const pg = this.page || 0,
      n = this.pages(),
      A: Flecha[] = [];
    if (pg > 0) A.push([170, 570, -1]);
    if (pg < n - 1) A.push([1550, 570, 1]);
    return A;
  },
  // Tito repite qué hay que hacer (al tocar a Tito o tras un rato sin tocar).
  prompt() {
    if (this.conf) say('¿Lo compras? Toca el verde para comprar o la cruz para volver.');
    else say('Toca algo para ver cuánto cuesta. Tienes ' + S.coins + ' monedas.');
  },
  // Pista: en la confirmación señala el botón verde de comprar.
  hint() {
    if (this.conf) return { x: 680, y: 690, r: 80 };
    return null;
  },
  // Dedo encima de algo: dice el nombre de la pestaña, o el del artículo y su precio, o las monedas.
  dwell(id) {
    if (id.startsWith('tab:')) {
      const c = SHOPCAT.find((c) => c.id === id.slice(4));
      if (c) say(c.n + '.');
    } else if (id.startsWith('it:')) {
      const g = this.grid().find((g: Casilla) => g.it.id === id.slice(3));
      if (g)
        say(
          cap(itemName(g.it)) +
            '.' +
            (S.owned![g.it.id] && !g.it.vale ? ' Ya es tuyo.' : ' Cuesta ' + g.it.p + ' monedas.'),
        );
    } else if (id === 'coins') say('Tienes ' + S.coins + ' monedas.');
  },
  // Dibuja la tienda: toldo, título, botón de la casa, estrellas, pestañas y artículos.
  // Cada artículo muestra check verde (ya es tuyo), precio (fondo amarillo si llegan las monedas) o candado con
  // las estrellas que faltan. Encima, si hay, la ventana de confirmación con los botones verde y rojo.
  draw() {
    sky('#FFF6E6', '#FDE6C6');
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 ? '#FF8A7A' : '#FFF6E6';
      ctx.beginPath();
      ctx.moveTo(i * 100, 0);
      ctx.lineTo(i * 100 + 100, 0);
      ctx.lineTo(i * 100 + 100, 26);
      ctx.quadraticCurveTo(i * 100 + 50, 62, i * 100, 26);
      ctx.closePath();
      ctx.fill();
    }
    floor(820, '#E9C99A');
    card(170, 44, 520, 100, '#fff', 6, 50);
    pic('tienda', 230, 94, 80);
    text('La tienda', 470, 112, 54, K, { w: 600 });
    {
      const s = hv('btn:casa', hC(1240, 70, 52)),
        j = this.newHome ? Math.abs(Math.sin((T - this.newHome) * 6)) * -14 : 0;
      ctx.save();
      ctx.translate(1240, 70 + j);
      ctx.scale(s, s);
      if (this.newHome) {
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(T * 6);
        circ(0, 0, 64, null, 10, '#FFC93C');
        ctx.globalAlpha = 1;
      }
      circ(0, 0, 50, '#fff', 6);
      titoHouseIc(0, 0, 84);
      ctx.restore();
    }
    card(1012, 40, 150, 60, '#fff', 5, 30);
    star(1050, 70, 20, '#FFC93C', 3);
    text(String(STARS()), 1110, 84, 36, K, { f: LF });
    for (const tb of this.tabs()) {
      const on = tb.id === this.cat,
        s = on ? 1 : hv('tab:' + tb.id, hR(tb.x, tb.y, tb.w, 110));
      ctx.save();
      ctx.translate(tb.x, tb.y - (on ? 8 : 0));
      ctx.scale(s, s);
      card(-tb.w / 2, -52, tb.w, 104, on ? '#FFE08A' : '#fff', on ? 8 : 5, 30, on ? '#D9962A' : K);
      if (tb.id === 'colores' && titoKind() !== 'caracol') shellIcon(0, 0, 32, 'naranja');
      else pic(tb.ic, 0, 0, 80);
      ctx.restore();
    }
    // flechas de página y puntitos con la página actual
    for (const [ax, ay, d] of this.arrows()) {
      const s = hv('pg' + d, hC(ax, ay, 50));
      ctx.save();
      ctx.translate(ax, ay);
      ctx.scale(s * d, s);
      circ(0, 0, 46, '#fff', 6);
      ctx.beginPath();
      ctx.moveTo(-12, -22);
      ctx.lineTo(14, 0);
      ctx.lineTo(-12, 22);
      ctx.lineWidth = 10;
      ctx.strokeStyle = K;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }
    {
      const n = this.pages();
      if (n > 1)
        for (let i = 0; i < n; i++)
          circ(
            880 - (n - 1) * 18 + i * 36,
            850,
            i === (this.page || 0) ? 12 : 8,
            i === (this.page || 0) ? '#FFC93C' : '#fff',
            4,
          );
    }
    // own = ya es suyo, lk = bloqueado por estrellas, lr = su habitación de la casa aún está cerrada, w = lo lleva puesto.
    for (const g of this.grid()) {
      const it = g.it,
        own = S.owned![it.id] && !it.vale,
        lk = !nivelAbierto(it.tier, STARS()),
        lr = !own && !lk && it.room && !roomOpen(it.room),
        w = own && it.slot && isWorn(it),
        s = lk ? 1 : hv('it:' + it.id, hR(g.x, g.y, 210, 230));
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.scale(s, s);
      card(-105, -115, 210, 230, w ? '#FFF6D6' : '#fff', w ? 9 : 6, 32, w ? '#FFC93C' : K);
      drawItemPic(it, 0, -22, 150);
      if (own) {
        circ(0, 82, 26, '#7CC86E', 5);
        ctx.beginPath();
        ctx.moveTo(-11, 82);
        ctx.lineTo(-2, 92);
        ctx.lineTo(13, 72);
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#fff';
        ctx.lineCap = 'round';
        ctx.stroke();
      } else if (lr) {
        ctx.globalAlpha = 0.7;
        card(-105, -115, 210, 230, '#F4EDE2', 0, 32);
        ctx.globalAlpha = 1;
        pic('candado', 0, -30, 110);
        card(-62, 40, 124, 50, '#fff', 4, 25);
        pic('casa', -30, 65, 40);
        text(String(roomOf(it.room).need), 22, 78, 30, K, { f: LF });
      } else if (!lk) {
        card(-62, 62, 124, 44, S.coins! >= it.p ? '#FFF3B0' : '#F4EDE2', 4, 22);
        pic('moneda', -36, 84, 40);
        text(String(it.p), 18, 98, 34, K, { f: LF });
      }
      if (lk) {
        ctx.globalAlpha = 0.7;
        card(-105, -115, 210, 230, '#F4EDE2', 0, 32);
        ctx.globalAlpha = 1;
        pic('candado', 0, -30, 110);
        card(-56, 40, 112, 50, '#fff', 4, 25);
        star(-24, 65, 16, '#FFC93C', 3);
        text(String(TIER_NEED[it.tier]), 20, 78, 30, K, { f: LF });
      }
      ctx.restore();
    }
    if (this.conf) {
      const it = this.conf,
        k = clamp((T - this.confT) * 4, 0, 1);
      ctx.fillStyle = `rgba(46,36,32,${0.45 * k})`;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(800, 450);
      ctx.scale(back(k), back(k));
      card(-300, -300, 600, 600, '#FFF6E6', 8, 50);
      drawItemPic(it, 0, -90, 300);
      card(-90, 90, 180, 64, '#FFF3B0', 5, 32);
      pic('moneda', -46, 122, 54);
      text(String(it.p), 30, 140, 44, K, { f: LF });
      ctx.restore();
      if (k >= 1) {
        for (const [x, c, ok] of [
          [680, '#7CC86E', 1],
          [920, '#FF6B5E', 0],
        ] as [number, string, number][]) {
          const s = hv('cf' + ok, hC(x, 690, 70));
          ctx.save();
          ctx.translate(x, 690);
          ctx.scale(s, s);
          circ(0, 0, 66, c, 7);
          ctx.lineWidth = 14;
          ctx.strokeStyle = '#fff';
          ctx.lineCap = 'round';
          ctx.beginPath();
          if (ok) {
            ctx.moveTo(-26, 2);
            ctx.lineTo(-6, 24);
            ctx.lineTo(30, -20);
          } else {
            ctx.moveTo(-22, -22);
            ctx.lineTo(22, 22);
            ctx.moveTo(22, -22);
            ctx.lineTo(-22, 22);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    drawHome();
    drawCoinHUD();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // Toques. Con la confirmación abierta: verde compra, rojo o fuera cierra. Si no: casa (mapa), Tito, botón de
  // la casa de Tito, monedas, estrellas, pestañas o un artículo. Al tocar un artículo: si está bloqueado dice cuántas
  // estrellas faltan; si ya es suyo y es ropa se lo pone o quita; si no llegan las monedas dice cuántas faltan; si llegan
  // abre la confirmación.
  down(x, y) {
    if (this.conf) {
      if (T - this.confT < 0.3) return;
      if (dist(x, y, 680, 690) < 75) {
        this.buy(this.conf);
        return;
      }
      if (dist(x, y, 920, 690) < 75 || !inR(x, y, 800, 450, 600, 600)) {
        SFX.tap();
        this.conf = null;
        say('Bueno, ¡otra vez será!');
      }
      return;
    }
    if (atHome(x, y)) {
      SFX.tap();
      go('map');
      return;
    }
    if (inTito(x, y)) {
      this.prompt!();
      return;
    }
    if (dist(x, y, 1240, 70) < 56) {
      SFX.pop();
      go('casaTito', { hello: true, nuevo: this.newHome ? this.newId : null });
      return;
    }
    if (inCoinHUD(x, y)) {
      say('Tienes ' + S.coins + ' monedas.');
      return;
    }
    if (inR(x, y, 1087, 70, 150, 60)) {
      say('Tienes ' + STARS() + ' estrellas. Las ganas terminando juegos.');
      return;
    }
    const tb = this.tabs().find((t: Pestana) => inR(x, y, t.x, t.y, t.w, 110));
    if (tb) {
      SFX.pop();
      this.cat = tb.id;
      this.page = 0;
      say(tb.n + '.');
      return;
    }
    const ar = this.arrows().find(([ax, ay]: Flecha) => dist(x, y, ax, ay) < 56);
    if (ar) {
      SFX.whoosh();
      this.page = (this.page || 0) + ar[2];
      return;
    }
    const g = this.grid().find((g: Casilla) => inR(x, y, g.x, g.y, 210, 230));
    if (!g) {
      SFX.tap();
      sparkles(x, y, 3);
      return;
    }
    const it = g.it,
      need = TIER_NEED[it.tier];
    if (!nivelAbierto(it.tier, STARS())) {
      SFX.boing();
      say(
        cap(itemName(it)) +
          ' se abre cuando tengas ' +
          need +
          ' estrellas. ¡Ya tienes ' +
          STARS() +
          '! Ganas estrellas terminando juegos.',
      );
      return;
    }
    // su habitación de la casa aún está cerrada: se abre al terminar casitas (ROOMS)
    if (it.room && !roomOpen(it.room) && !S.owned![it.id]) {
      SFX.boing();
      const R = roomOf(it.room);
      say(
        cap(itemName(it)) +
          (/^(las|los) /.test(itemName(it)) ? ' son para ' : ' es para ') +
          R.n +
          '. ' +
          cap(R.n) +
          ' se abre cuando termines ' +
          (R.need === 1 ? 'una casita.' : R.need + ' casitas.'),
      );
      return;
    }
    if (S.owned![it.id] && !it.vale) {
      if (it.slot) {
        const on = it.slot === 'shell' || it.slot === 'scarf' ? true : !isWorn(it);
        wear(it, on);
        SFX.pop();
        sparkles(TITO.x + 150, TITO.y + 40, 12);
        say(on ? '¡Tito se puso ' + itemName(it) + '!' : 'Tito se quitó ' + itemName(it) + '.');
        return;
      }
      SFX.pop();
      say(cap(itemName(it)) + ' ya es tuyo. Está en la casa de Tito.');
      return;
    }
    if (!alcanza(S.coins!, it.p)) {
      SFX.boing();
      const f = it.p - S.coins!;
      say(
        cap(itemName(it)) +
          ' cuesta ' +
          it.p +
          ' monedas. Te ' +
          (f === 1 ? 'falta una' : 'faltan ' + f) +
          '. ¡Jugando ganas más!',
      );
      return;
    }
    SFX.pop();
    this.conf = it;
    this.confT = T;
    say('¿Quieres comprar ' + itemName(it) + ' por ' + it.p + ' monedas? Toca el verde para comprar.');
  },
  // Compra el artículo con el caso de uso comprar (aplicacion/comprar.ts): gasta las monedas, celebra y lo da. Un vale
  // se apunta en S.valesLog (para que el adulto lo canjee); la ropa se pone a Tito; lo demás se coloca en la casa y hace
  // saltar el botón de la casa. Si es un vale que el adulto desactivó mientras la confirmación estaba abierta, no se
  // compra (suena boing y no se cobra).
  buy(it: Articulo) {
    this.conf = null;
    // lo que cambia en la partida lo decide el caso de uso comprar (aplicacion/comprar.ts); aquí, la pantalla
    const c = comprar(S, it, today());
    if (c.tipo === 'desactivado') {
      SFX.boing();
      return;
    }
    spendCoins(it.p, 800, 400);
    SFX.tada();
    burst(800, 420, 60);
    Object.assign(S, c.partida);
    if (c.tipo === 'vale') {
      save();
      say('¡Compraste el vale! ' + it.vale!.txt + '. Enséñaselo a un adulto de tu familia para canjearlo.');
      return;
    }
    // desde la fase C6, una mascota nueva nace bebé y sin nombre (fichaNueva)
    if (MASCOTAS.includes(it.id)) S.mascotas = { ...S.mascotas, [it.id]: { ...fichaNueva(), hechos: [] } };
    // desde la fase M2 de docs/PLAN-CASA-MEJORA.md, lo de la casa va al baúl: el niño elige dónde ponerlo
    if (it.slot) wear(it, true);
    else casaEnS(nuevoAlBaul(S, it.id));
    save();
    if (!it.slot) {
      this.newHome = T;
      this.newId = it.id;
    }
    say(
      it.slot
        ? '¡Es tuyo! ¡Mira qué bonito le queda a Tito!'
        : '¡Es tuyo! Ya está en la casa de Tito. Toca la casita de arriba para verlo.',
    );
  },
};

/* ---------- la casa de Tito ---------- */
// Tamaño con el que se dibuja cada objeto en la casa de Tito (160 si no está en la lista).
export const HSIZE: Record<string, number> = {
  alfombra: 360,
  piano: 240,
  estanteria: 250,
  fuente: 240,
  farol: 240,
  banco: 250,
  plantaInterior: 180,
  lampara: 220,
  reloj: 140,
  cuadro: 170,
  casitaPerro: 230,
  pecera: 170,
  hamster: 110,
  telescopio: 200,
  guitarra: 170,
  robot: 170,
  trenJuguete: 170,
  muneca: 160,
  cometa: 170,
  xilofono: 170,
  bloques: 150,
  peluche: 160,
  pelotaPlaya: 130,
  columpio: 240,
  sofa: 280,
  tele: 200,
  cama: 300,
  baul: 200,
  cuento: 120,
  estrellas: 150,
  mesa: 240,
  silla: 160,
  nevera: 260,
  olla: 130,
  tarta: 150,
  banera: 300,
  toalla: 150,
  jabon: 100,
  pato: 110,
  tambor: 150,
  pizarra: 200,
  pinturas: 130,
  globo: 170,
  tobogan: 280,
  arbol: 320,
  plantaFlor: 150,
  regadera: 130,
  castillo: 220,
  piscina: 330,
  tierra: 180,
  saturno: 170,
  cohete: 260,
  gato: 140,
  pajaro: 120,
  conejo: 140,
};
// Objetos de la casa: los de S.home que además son del niño, con su posición y tamaño. Con r, solo los de esa habitación
// (con r = EN_BAUL, 'baul', lo guardado en el baúl); sin r, todos los que están en alguna habitación (desde la fase M2,
// lo del baúl no cuenta).
export const homeItems = (r?: string) =>
  Object.keys(S.home!)
    .filter((id) => S.owned![id] && (r ? homeRoom(id) === r : homeRoom(id) !== EN_BAUL))
    .map((id) => ({ id, x: S.home![id].x, y: S.home![id].y, s: HSIZE[id] || 160 }));
