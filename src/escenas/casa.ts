// ARCHIVO: escenas/casa.ts — la casa de Tito por dentro (SCENES.casaTito), en 2D: las habitaciones con sus objetos,
//   Tito que anda y juega con ellos, el armario con su ropa, Pipo y los botones de las habitaciones, de la tienda y del
//   álbum de sorpresas.
// Cómo encaja: hasta la fase M1 de docs/PLAN-CASA-MEJORA.md estaba al final de escenas/tienda.ts; se sacó aquí sin
//   cambiar nada. Desde la fase M2 la casa está ordenada: cada cosa en un sitio (dominio/casaSitios.ts) y lo demás en el
//   baúl de Tito, con los casos de uso de aplicacion/casa.ts y la bandeja de escenas/casaBaul.ts. Lo de la tienda que
//   usa la casa (SHOP, ROOMS, HSIZE, homeItems, homeRoom, habitualDe, casaEnS...) sigue en escenas/tienda.ts. Las
//   reacciones de Tito están en escenas/casaReacciones.ts y las escenas pequeñas en los escenas/casa*.ts (ESCENA_CASA).
//   Desde la fase M3 (M3a y M3b) los objetos responden al tocarlos (escenas/casaToques.ts), Tito juega de varias formas
//   (VARIANTES), se le puede coger y llevar hasta una cosa, y las parejas de una combinación guiñan al acercarlas.
//   escenas/indice.ts lo carga después de tienda.ts y el puente deja lo que exporta en globalThis para las pruebas.
// Define: homeAction (sonido y frase al jugar con un objeto), ESCENA_CASA (la escena pequeña de cada objeto), homeLight
//   (la luz de la lámpara), roomBg (el fondo de cada habitación), roomBtns, baulItems, baulNuevos, catDe, dibujaCosa, cosasDe,
//   sitioCerca, sitioLibre y SCENES.casaTito.
// Exporta: roomBtns, baulItems y baulNuevos (los usan las pruebas).
// Importa: el núcleo, src/nucleo/ (S, save, say, T, ctx, pic, card, text, circ, SFX, tone, hv...), juegos/ (playTune,
//   TUNES, NOTE), temas/ (floor, bunting), escenas/zonas.ts (houseLevel, drawPet, petStage, PET_NEXT, HOUSE_NEXT,
//   arrowAt), azar() (aplicacion/puertos.ts), las reglas de la casa (dominio/casa.ts), sus frases (contenido/casa.ts),
//   escenas/casaAlbum.ts, casaMascotas.ts, casaReacciones.ts, lo de la casa de escenas/tienda.ts y, desde la fase M2,
//   aplicacion/casa.ts (los casos de uso de la casa ordenada), dominio/casaSitios.ts y escenas/casaBaul.ts.
import { K } from '../dibujos/todos.ts';
import {
  FLC,
  H,
  PI,
  S,
  SCENES,
  sceneName,
  SFX,
  STARS,
  T,
  VIVO,
  W,
  W_,
  atHome,
  burst,
  cap,
  card,
  circ,
  clamp,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  fillStroke,
  flower,
  fmt,
  go,
  hC,
  hv,
  inCoinHUD,
  inR,
  juntar,
  later,
  nombreEn,
  noise,
  parts,
  pic,
  pick,
  playSound,
  rnd,
  save,
  say,
  sayQ,
  setCursor,
  sky,
  sparkles,
  star,
  temasDone,
  text,
  today,
  tone,
  giveSticker,
  tr,
} from '../nucleo/indice.ts';
import { NOTE, TUNES, playTune } from '../juegos/indice.ts';
import { bunting, floor } from '../temas/indice.ts';
import { HOUSE_NEXT, PET_NEXT, arrowAt, drawPet, houseLevel, petStage } from './zonas.ts';
// azar(): el azar del juego (puerto de aplicacion/puertos.ts, desde la fase 3g; antes Math.random()).
import { ahora, azar } from '../aplicacion/puertos.ts';
import { cumple, hacerRutina, hechaHoy, momentoDe, rutinaDe, type Momento, type Rutina } from '../dominio/casaDia.ts';
import {
  MASCOTAS,
  combinacion,
  cuantasSorpresas,
  descubrir,
  idSorpresa,
  reaccionDe,
  varianteDe,
  type EscenaCasa,
} from '../dominio/casa.ts';
import { ALBUM_CASA_BOTON } from './casaAlbum.ts';
import { bocadillo, dibujaMascota, pideAlgo } from './casaMascotas.ts';
import { FRASES_CASA, FRASES_COMBINACION, FRASES_HORA, FRASES_RUTINA, FRASES_VARIANTES } from '../contenido/casa.ts';
import {
  DURACION_ACCION,
  TITO_CASA,
  andar,
  andando,
  animObjeto,
  destinoJunto,
  dibujaTitoCasa,
  efectosAccion,
  paseoQuieto,
  posTito,
} from './casaReacciones.ts';
import type { Casilla, Flecha } from './tienda.ts';
import {
  HSIZE,
  ROOMS,
  SHOP,
  WALLITEMS,
  casaEnS,
  drawItemPic,
  habitualDe,
  homeItems,
  homeRoom,
  isWorn,
  itemName,
  roomOf,
  roomOpen,
  roomsOpen,
  titoHouseIc,
  wear,
} from './tienda.ts';
import {
  arreglarCasa,
  colocarObjeto,
  enBaul,
  guardarObjeto,
  nuevosEnBaul,
  ordenarCasa,
  type Colocado,
} from '../aplicacion/casa.ts';
import { femenino } from '../dominio/idiomas.ts';
import { EN_BAUL, PLANO, libres, sitioMasCercano, type Sitio } from '../dominio/casaSitios.ts';
import {
  BANDEJA,
  BAUL,
  ORDENA,
  casillasBaul,
  dibujaBandeja,
  dibujaBotonBaul,
  dibujaSitios,
  flechasBaul,
  pestanasDe,
} from './casaBaul.ts';
import { ESTADOS, estadoDe, siguienteEstado, toqueDe } from '../dominio/casaToques.ts';
import { dibujaEstado, poseToque } from './casaToques.ts';

// Al jugar con un objeto de la casa (cuando Tito llega hasta él, desde la fase C2): chispitas, su sonido o acción
// propia (tabla A) y Tito dice su frase (FRASES_CASA, contenido/casa.ts) o, si no tiene (las mascotas), su nombre.
// Desde la fase M3b, frase: lo que dice en otra forma de jugar (FRASES_VARIANTES), si no es la primera.
function homeAction(id: string, x: number, y: number, frase?: string) {
  SFX.pop();
  sparkles(x, y, 8);
  sonidoDe(id);
  say(frase ?? FRASES_CASA[id] ?? cap(W_(id)) + '.');
}
// sonidoDe(id): el sonido propio de un objeto de la casa (tabla A), si tiene. Lo usan homeAction (cuando Tito juega) y,
// desde la fase M3 de docs/PLAN-CASA-MEJORA.md, el toque directo del niño (toca). La luz de la lámpara ya no la cambia
// aquí: es su estado guardado (S.casaEst, dominio/casaToques.ts).
function sonidoDe(id: string) {
  // A: id del objeto → función que hace al tocarlo (música y sonidos).
  const A: Record<string, () => unknown> = {
    piano: () => playTune(TUNES.colores, 180),
    xilofono: () => playTune(TUNES.meses, 220),
    guitarra: () => [0, 4, 7, 12].forEach((n, i) => tone(NOTE(55 + n), 0.5, 'triangle', 0.18, 0, i * 0.06)),
    trenJuguete: () => playSound('tren'),
    reloj: () => {
      tone(1200, 0.05, 'square', 0.1);
      tone(900, 0.05, 'square', 0.1, 0, 0.5);
    },
    robot: () => [0, 1, 2].forEach((i) => tone(600 + i * 200, 0.1, 'square', 0.1, 0, i * 0.12)),
    casitaPerro: () => playSound('perro'),
    hamster: () => tone(2400, 0.08, 'sine', 0.15),
    fuente: () => SFX.splash(),
    pecera: () => SFX.drip(),
    // v1.590
    tele: () => playTune(TUNES.colores, 240),
    tambor: () => [0, 1, 2].forEach((i) => noise(0.12, 0.5, 180, i * 0.18)),
    pato: () => playSound('pato'),
    gato: () => playSound('gato'),
    pajaro: () => playSound('pajaro'),
    conejo: () => SFX.boing(),
    globo: () => SFX.pop(),
    piscina: () => SFX.splash(),
    banera: () => SFX.splash(),
    jabon: () => SFX.sparkle(),
    regadera: () => SFX.drip(),
    columpio: () => SFX.whoosh(),
    tobogan: () => SFX.whoosh(),
    cohete: () => {
      SFX.whoosh();
      SFX.sparkle();
    },
    nevera: () => tone(180, 0.4, 'sine', 0.15),
    olla: () => SFX.munch(),
    cama: () => playTune(TUNES.meses, 300),
    cometa: () => SFX.whoosh(),
    pelotaPlaya: () => SFX.boing(),
    bloques: () => SFX.snap(),
    telescopio: () => SFX.sparkle(),
    lampara: () => SFX.snap(),
  };
  (A[id] || (() => {}))();
}
// ESCENA_CASA: la escena (SCENES) de cada escena pequeña de la casa que ya está hecha: desde la fase C3, el cielo de
// noche (telescopio, escenas/casaCielo.ts) y la vuelta al mundo (globo terráqueo, escenas/casaMundo.ts); desde la C4,
// los instrumentos (escenas/casaMusica.ts, que recibe cuál se tocó), la pizarra (casaPizarra.ts) y la tele (casaTele.ts);
// desde la C5, la merienda y la sopa (casaCocina.ts), el baño (casaBano.ts), buenas noches (casaNoches.ts) y el huerto.
const ESCENA_CASA: Partial<Record<EscenaCasa, string>> = {
  cielo: 'casaCielo',
  mundo: 'casaMundo',
  instrumentos: 'casaMusica',
  pizarra: 'casaPizarra',
  tele: 'casaTele',
  merienda: 'casaMerienda',
  sopa: 'casaSopa',
  bano: 'casaBano',
  buenasNoches: 'casaNoches',
  huerto: 'casaHuerto',
};
// Luz de la habitación que se dibuja: desde la fase M3, apagada si en ella está la lámpara y su estado guardado es
// «apagada» (S.casaEst, dominio/casaToques.ts); la calcula draw() en cada cuadro. Antes no se guardaba.
let homeLight = true;
// Momento del día que se dibuja (desde la fase M6, dominio/casaDia.ts): por la ventana se ve la mañana, la tarde o la
// noche según la hora de verdad; lo calcula draw() en cada cuadro.
let homeMomento: Momento = 'manana';
// horaCasa(): la hora de ahora con sus minutos, como número (8.5 son las ocho y media), del reloj del juego (ahora()).
const horaCasa = (): number => {
  const d = ahora();
  return d.getHours() + d.getMinutes() / 60;
};
// roomBg(id, hl): dibuja el fondo fijo de la habitación id de la casa de Tito (pared, ventana, suelo y adornos propios);
// hl es el nivel de la casa (houseLevel): en el salón añade flores, banderines y arcoíris como antes. El suelo empieza
// siempre en y = 600 (los objetos se colocan del 420 al 780). Con la luz apagada (homeLight) se ve la noche; desde la
// fase M6, por la ventana (y en el cielo del jardín) se ve también el momento del día (homeMomento): la mañana, la
// tarde (cielo naranja y el sol bajo) o la noche (luna, y la habitación un poco más oscura).
function roomBg(id: string, hl: number) {
  const noche = !homeLight || homeMomento === 'noche',
    tarde = !noche && homeMomento === 'tarde';
  const win = (x: number, y: number, w: number, h: number, cort?: string) => {
    card(x, y, w, h, noche ? '#2E3F7A' : tarde ? '#FFC98A' : '#BFEAF7', 8, 16);
    if (noche) pic('luna', x + w / 3, y + 70, 80);
    else pic('sol', x + w / 3, y + (tarde ? h - 60 : 70), tarde ? 80 : 90);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = K;
    ctx.stroke();
    if (cort) {
      ctx.fillStyle = cort;
      for (const sd of [0, 1]) {
        ctx.beginPath();
        const cx = sd ? x + w + 10 : x - 10;
        ctx.moveTo(cx, y - 14);
        ctx.lineTo(cx + (sd ? -70 : 70), y - 14);
        ctx.quadraticCurveTo(cx + (sd ? -30 : 30), y + h / 2, cx + (sd ? -50 : 50), y + h + 20);
        ctx.lineTo(cx, y + h + 20);
        ctx.closePath();
        fillStroke(cort, 5);
      }
    }
  };
  const wood = (c: string) => {
    floor(600, c);
    ctx.strokeStyle = 'rgba(74,52,40,.15)';
    ctx.lineWidth = 4;
    for (let y = 640; y < 900; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    card(-10, 588, W + 20, 24, '#C98A4B', 5, 6);
  };
  const checker = (a: string, b: string, z: number) => {
    for (let y = 600; y < H; y += z)
      for (let x = 0; x < W; x += z) {
        ctx.fillStyle = (Math.floor(x / z) + Math.floor((y - 600) / z)) % 2 ? a : b;
        ctx.fillRect(x, y, z, z);
      }
    card(-10, 588, W + 20, 20, '#fff', 5, 6);
  };
  if (id === 'salon') {
    sky('#FFEFD9', '#FFE6C6');
    ctx.fillStyle = 'rgba(255,201,60,.12)';
    for (let x = 0; x < W; x += 80) ctx.fillRect(x, 0, 40, 600);
    win(1200, 130, 300, 230);
    wood('#E2B98A');
    if (hl >= 1) for (let i = 0; i < 20; i++) flower(40 + i * 80, 592, 12, FLC[i % 7], 2.5);
    if (hl >= 3) bunting(16, 14);
    if (hl >= 4) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(1200, 130, 300, 230);
      ctx.clip();
      ['#FF6B5E', '#FFA94D', '#FFD66B', '#7CC86E', '#5BB8E6', '#9B8AD9'].forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(1350, 400, 200 - i * 14, PI, 0);
        ctx.lineWidth = 14;
        ctx.strokeStyle = c;
        ctx.stroke();
      });
      ctx.restore();
    }
  } else if (id === 'dormitorio') {
    sky('#EDE6FB', '#E2D8F7');
    for (let y = 180; y < 600; y += 90)
      for (let x = ((y / 90) % 2) * 60; x < W; x += 120) star(x, y, 9, 'rgba(155,138,217,.35)', 0);
    win(1210, 160, 280, 210, '#9B8AD9');
    wood('#D9B58A');
  } else if (id === 'cocina') {
    sky('#FFF9EC', '#FFF4DC');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 380, W, 220);
    ctx.strokeStyle = '#BFE3F0';
    ctx.lineWidth = 3;
    for (let y = 380; y <= 600; y += 55) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let x = 0; x < W; x += 55) {
      ctx.beginPath();
      ctx.moveTo(x, 380);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    win(1210, 160, 280, 190, '#FF8A7A');
    checker('#F2E1C8', '#E0C49E', 75);
  } else if (id === 'bano') {
    sky('#DDF4FA', '#CDEFF7');
    ctx.strokeStyle = 'rgba(91,184,230,.35)';
    ctx.lineWidth = 3;
    for (let y = 150; y < 600; y += 70) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let x = 0; x < W; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    circ(1350, 260, 110, '#E8FAFF', 8);
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(1290, 220);
    ctx.lineTo(1330, 180);
    ctx.moveTo(1300, 260);
    ctx.lineTo(1360, 200);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
    checker('#FFFFFF', '#BDE8F2', 70);
  } else if (id === 'juegos') {
    sky('#FFF6C9', '#FFEFA8');
    const C = ['#FF8A7A', '#7CC86E', '#5BB8E6', '#FFA94D', '#9B8AD9'];
    for (let i = 0; i < 26; i++) circ((i * 263) % W, 170 + ((i * 137) % 400), 14 + (i % 3) * 6, C[i % 5], 0);
    bunting(150, 12);
    for (let y = 600; y < H; y += 100)
      for (let x = 0; x < W; x += 100) {
        ctx.fillStyle = C[((x + y) / 100) % 5];
        ctx.fillRect(x, y, 100, 100);
      }
    ctx.strokeStyle = 'rgba(74,52,40,.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-2, 600, W + 4, H);
    card(-10, 588, W + 20, 20, '#fff', 5, 6);
  } else if (id === 'jardin') {
    sky(noche ? '#2E3F7A' : tarde ? '#FFA56B' : '#9FDDF5', noche ? '#55639A' : tarde ? '#FFE2C2' : '#E2F6FF');
    if (!noche) {
      pic('sol', 1430, tarde ? 330 : 190, 130);
      pic('nube', 300, 220, 180);
      pic('nube', 820, 170, 140);
    } else pic('luna', 1430, 190, 110);
    floor(520, '#A6DC7F');
    for (let x = 0; x < W; x += 60) {
      card(x + 8, 430, 40, 150, '#fff', 4, 10);
    }
    card(-10, 470, W + 20, 22, '#fff', 4, 6);
    card(-10, 530, W + 20, 22, '#fff', 4, 6);
    floor(600, '#9BD67A');
    for (let i = 0; i < 14; i++) flower(60 + i * 115, 620 + (i % 3) * 90, 10, FLC[i % 7], 2);
  } else if (id === 'torre') {
    sky('#1E2A55', '#34417A');
    for (let i = 0; i < 60; i++) {
      const x = (i * 397) % W,
        y = 40 + ((i * 211) % 520);
      star(x, y, 3 + (i % 4) * 2, 'rgba(255,230,140,' + (0.5 + 0.5 * Math.sin(T * 2 + i)) + ')', 0);
    }
    circ(1330, 280, 150, '#0F1838', 10, '#C98A4B');
    pic('luna', 1290, 240, 90);
    for (let i = 0; i < 8; i++) star(1220 + ((i * 53) % 220), 180 + ((i * 71) % 200), 5, '#FFE08A', 0);
    wood('#8C6A4E');
  }
  if (noche && id !== 'torre') {
    ctx.fillStyle = homeLight ? 'rgba(30,30,70,.12)' : 'rgba(30,30,70,.25)';
    ctx.fillRect(0, 0, W, H);
  }
}
// Botones de las habitaciones (arriba, entre el título y la tienda): x, y y la habitación.
export const roomBtns = () => ROOMS.map((R, i) => ({ R, x: 660 + i * 76, y: 94 }));

/* ---------- la casa ordenada: el baúl y los sitios (fase M2 de docs/PLAN-CASA-MEJORA.md) ---------- */
// baulItems(): los ids de lo guardado en el baúl de Tito (lo usan la bandeja y las pruebas).
export const baulItems = () => enBaul(S);
// baulNuevos(): lo del baúl que aún no se ha colocado nunca (el número rojo del botón del baúl; lo miran las pruebas).
export const baulNuevos = () => nuevosEnBaul(S);
// catDe(id): la categoría de la tienda de un objeto de la casa (para las pestañas del baúl).
const catDe = (id: string) => SHOP.find((i) => i.id === id)?.cat || 'casa';
// dibujaCosa(id, x, y, s): el dibujo de un objeto de la casa centrado en (x, y), como en la tienda (para el baúl).
function dibujaCosa(id: string, x: number, y: number, s: number) {
  const it = SHOP.find((i) => i.id === id);
  if (it) drawItemPic(it, x, y, s);
}
// ESCALA_ENCIMA: lo que está encima de un mueble se dibuja un poco más pequeño.
const ESCALA_ENCIMA = 0.75;
// cosasDe(r): los objetos de la habitación r para dibujarlos y tocarlos: los de homeItems con su tamaño (más pequeño
// si están encima de un mueble: enc) y z, el orden de dibujo: primero la alfombra, luego lo de la pared y después de
// atrás hacia delante por su sitio; lo de encima de un mueble, justo después del mueble.
function cosasDe(r: string) {
  return homeItems(r).map((o) => {
    const partes = (S.home![o.id].h || '').split(':'),
      enc = partes.length === 3,
      mueble = enc ? S.home![partes[1]] : undefined;
    let z = o.y;
    if (o.id === 'alfombra') z = -2000;
    else if (WALLITEMS.includes(o.id)) z = o.y - 1000;
    else if (mueble) z = mueble.y + 0.5;
    return { ...o, s: enc ? o.s * ESCALA_ENCIMA : o.s, enc, z };
  });
}
// ESPERA_TITO: segundos que Tito se queda listo para jugar después de tocarlo (desde la fase M3).
const ESPERA_TITO = 6;
// RADIO_SOLTAR: a cuánto (en píxeles) del sitio hay que soltar una cosa para que salte a él.
const RADIO_SOLTAR = 420;
// PENA_GRANDE: lo que «aleja» un sitio grande al elegir dónde cae una cosa: así lo mediano y lo pequeño prefieren los
// sitios normales, y los grandes se quedan para los muebles (a los grandes les da igual: todos sus sitios lo son).
const PENA_GRANDE = 150;
// sitioCerca(id, r, x, y): el sitio libre de la habitación r donde cabe id más cercano a (x, y), si está a menos de
// RADIO_SOLTAR; si no, undefined. Los sitios grandes cuentan como si estuvieran PENA_GRANDE más lejos.
function sitioCerca(id: string, r: string, x: number, y: number): Sitio | undefined {
  const d = (s: Sitio) => Math.hypot(s.x - x, s.y - y),
    pesa = (s: Sitio) => d(s) + (s.tipo === 'suelo-grande' ? PENA_GRANDE : 0);
  return libres(PLANO, r, S.home!, id)
    .filter((s) => d(s) < RADIO_SOLTAR)
    .sort((a, b) => pesa(a) - pesa(b))[0];
}
// sitioLibre(id, r): el sitio libre de r que prefiere id (el de su tipo más cerca del centro del suelo), o undefined.
const sitioLibre = (id: string, r: string) => sitioMasCercano(PLANO, r, S.home!, id, 1000, 700);
// Escena de la casa de Tito por dentro (2D), con habitaciones (ROOMS) que se abren al terminar casitas: arriba,
// un botón por habitación; los objetos comprados se pueden arrastrar, tocar y llevar a otra habitación soltándolos
// en su botón. Abajo está el armario con la ropa de Tito y la mascota Pipo. Estado: room (habitación que se ve; se
// recuerda entre visitas), drag (objeto que se arrastra), newRoom (cuándo se abrió una habitación, para que brille).
// Desde la fase C2 de docs/PLAN-CASA.md, Tito anda por la habitación (escenas/casaReacciones.ts): paseo (de dónde a
// dónde va), paseoTok (cuenta los paseos: al llegar solo juega si no ha salido otro después) y acc (la acción que
// está haciendo con un objeto, AccionEnCurso). Al tocar un objeto, Tito va hasta él y juega (irA); al tocar el
// suelo, va allí. Entra andando por la izquierda.
// Desde la fase M2 de docs/PLAN-CASA-MEJORA.md, la casa está ordenada: cada cosa está en un sitio (dominio/casaSitios.ts)
// y lo que no cabe o se acaba de comprar está en el baúl (abajo a la derecha). Al entrar se arregla la casa
// (arreglarCasa, aplicacion/casa.ts). Al arrastrar una cosa se iluminan los sitios libres donde cabe y, al soltarla,
// salta al más cercano; soltada en el baúl se guarda. Estado nuevo: baul (la bandeja está abierta), pest y bpag (la
// pestaña y la página de la bandeja), ordenaT (cuándo se tocó «¡Ordena, Tito!» por primera vez: el segundo toque, antes
// de 5 s, ordena) y, en drag, desde ('sala' o 'baul'), px y py (dónde se dibuja la cosa) y cerca (el sitio donde caería).
SCENES.casaTito = {
  music: 'casita',
  room: 'salon',
  // Al entrar (Tito entra andando por la izquierda; o.volver: vuelve de una escena pequeña, como la del telescopio, y
  // Tito ya está dentro, en la misma habitación, sin decir nada). o.nuevo: id de lo recién comprado (se va a su habitación y se resalta con brillo y flecha durante 12 s;
  // si es ropa, Tito salta). Si no, si se abrió una habitación desde la última visita (S.rooms cuenta las que ya se
  // vieron), se va a ella y Tito lo anuncia. Si no, Tito saluda según haya cosas o la casa esté vacía.
  enter(o) {
    // desde la fase M2: cada cosa en su sitio y lo que no cabe, al baúl (guardadas: cuántas se han guardado ahora)
    const antes = baulItems().length;
    casaEnS(arreglarCasa(S));
    save();
    const guardadas = baulItems().length - antes;
    this.baul = false;
    this.pest = 'todo';
    this.bpag = 0;
    this.ordenaT = -9;
    this.drag = null;
    this.wpg = 0;
    this.jump = -9;
    this.petJump = -9;
    this.newRoom = -9;
    this.acc = null;
    this.paseoTok = 0;
    // desde la fase M3: cuándo se tocó cada objeto (toques), cuándo se tocó a Tito (titoListo), el último objeto tocado
    // (ultimo: para los dos toques seguidos) y el botón de la escena que está a la vista (escena)
    this.toques = {};
    this.titoListo = -9;
    this.ultimo = null;
    this.escena = null;
    // desde la fase M3b: cuántas veces ha jugado Tito con cada objeto en esta visita (veces: para la forma de jugar
    // siguiente, VARIANTES), Tito cogido con el dedo (dragTito) y la pareja que guiña al arrastrar una cosa (pareja)
    this.veces = {};
    this.dragTito = null;
    this.pareja = '';
    this.paseo = o.volver ? paseoQuieto(440, 700) : andar(paseoQuieto(-120, 700), 440, 700);
    if (o.volver) return;
    const nv = o.nuevo && SHOP.find((i) => i.id === o.nuevo);
    this.nuevo = nv && S.owned![nv.id] ? nv : null;
    this.t0 = T;
    if (!roomOpen(this.room)) this.room = 'salon';
    const n = homeItems().length,
      op = roomsOpen();
    if (this.nuevo) {
      const it = this.nuevo;
      if (it.slot) this.jump = T + 0.3;
      else if (homeRoom(it.id) === EN_BAUL) this.abreBaulCon!(it.id);
      else this.room = homeRoom(it.id);
      later(300, () => {
        SFX.sparkle();
        say(
          juntar(
            fmt('¡Aquí está {cosa}!', { cosa: itemName(it) }),
            tr(
              it.slot
                ? '¡Mira qué bonito me queda!'
                : this.baul
                  ? '¿Dónde lo ponemos? Arrástralo a un sitio que brille.'
                  : 'Puedes cambiar las cosas de lugar arrastrándolas.',
            ),
          ),
        );
      });
      return;
    }
    if (op.length > (S.rooms || 1)) {
      const R = op[op.length - 1];
      S.rooms = op.length;
      save();
      this.room = R.id;
      this.newRoom = T;
      later(300, () => {
        SFX.tada();
        burst(800, 400, 50);
        sayQ(
          fmt('¡Mi casa creció! Tiene una habitación nueva: {sala}. Arriba puedes elegir a qué habitación ir.', {
            sala: nombreEn(R.n).art,
          }),
        );
      });
      return;
    }
    const enElBaul = baulItems().length;
    // desde la fase M6: después de saludar, Tito propone la rutina de la hora, si se puede hacer y no está hecha
    later(3500, () => {
      const b = sceneName === 'casaTito' && this.bocadilloRutina!();
      if (b) sayQ(FRASES_RUTINA[b.rutina.id]?.pide ?? '');
    });
    later(300, () => {
      if (guardadas > 0) sayQ('¡He ordenado mi casa! Lo que no cabía está guardado en mi baúl.');
      else if (n) sayQ('¡Esta es mi casa! Puedes mover las cosas arrastrándolas, y tocarlas para jugar.');
      else if (enElBaul) sayQ('¡Esta es mi casa! Mis cosas están en el baúl. Tócalo para sacarlas.');
      else sayQ('¡Esta es mi casa! Está vacía. En la tienda puedes comprar cosas con tus monedas.');
    });
  },
  // abreBaulCon(id): abre la bandeja del baúl en la pestaña y la página donde está id (lo recién comprado) y va a su
  // habitación habitual, si está abierta, para que se iluminen allí los sitios donde cabe.
  abreBaulCon(id: string) {
    const quiere = habitualDe(id);
    if (quiere && roomOpen(quiere)) this.room = quiere;
    this.baul = true;
    this.pest = 'todo';
    this.bpag = Math.floor(baulItems().indexOf(id) / 7);
  },
  // Armario: la ropa y colores que tiene el niño, con su posición en la fila de abajo. Caben 10; si hay más, se ven
  // de 9 en 9 (página this.wpg) y aparecen flechas a los lados (wardArrows) para pasar de página, que dan la vuelta.
  wardrobe(): Casilla[] {
    const L = SHOP.filter((i) => i.slot && S.owned![i.id]);
    if (L.length <= 10) return L.map((it, i) => ({ it, x: 470 + i * 100, y: 845 }));
    const n = Math.ceil(L.length / 9),
      pg = (((this.wpg || 0) % n) + n) % n;
    return L.slice(pg * 9, pg * 9 + 9).map((it, i) => ({ it, x: 530 + i * 100, y: 845 }));
  },
  // Flechas del armario [x, y, dirección]: solo si la ropa no cabe en una fila (más de 10 prendas).
  wardArrows(): Flecha[] {
    return SHOP.filter((i) => i.slot && S.owned![i.id]).length > 10
      ? [
          [445, 845, -1],
          [1415, 845, 1],
        ]
      : [];
  },
  // Tito explica qué hacer en la casa.
  // Desde la fase M2: si la habitación está vacía y hay cosas en el baúl, invita a abrirlo.
  prompt() {
    if (!homeItems(this.room).length && baulItems().length) {
      say('Abre mi baúl y saca cosas para esta habitación.');
      return;
    }
    say(
      homeItems().length
        ? 'Arrastra las cosas para acomodar la casa. Abajo está mi ropa: tócala para ponérmela.'
        : 'Toca el carrito para ir a la tienda.',
    );
  },
  // Pista: si la habitación está vacía y hay cosas guardadas, señala el baúl (cerrado); si la casa está vacía, la tienda.
  hint() {
    if (!this.baul && !homeItems(this.room).length && baulItems().length) return { x: BAUL.x, y: BAUL.y, r: 64 };
    return homeItems().length || baulItems().length ? null : { x: 1240, y: 70, r: 60 };
  },
  // Dedo encima de un objeto (en la habitación o en el baúl): dice su nombre; encima del botón de una habitación, su
  // nombre; encima del baúl o de «¡Ordena, Tito!», qué es.
  dwell(id) {
    if (id.startsWith('h:') || id.startsWith('b:')) say(cap(W_(id.slice(2))) + '.');
    else if (id === 'baul') say('Mi baúl.');
    else if (id === 'ordena') say('¡Ordena, Tito!');
    else if (id.startsWith('room:')) say(cap(roomOf(id.slice(5)).n) + '.');
  },
  // Dibuja la habitación (roomBg), el título con su nombre, los botones de las habitaciones (la actual en amarillo,
  // las cerradas con candado, la recién abierta brillando), el botón de la tienda, los objetos, Tito, la mascota y el armario.
  draw() {
    const hl = houseLevel(),
      R = roomOf(this.room);
    homeLight = !(homeRoom('lampara') === R.id && S.owned!.lampara && estadoDe(S.casaEst, 'lampara') === 1);
    homeMomento = momentoDe(horaCasa());
    roomBg(R.id, hl);
    card(170, 44, 450, 100, '#fff', 6, 50);
    titoHouseIc(230, 94, 80);
    {
      const nm = cap(R.n),
        fs = nm.length > 16 ? 28 : nm.length > 11 ? 36 : 46;
      text(nm, 425, 94 + fs * 0.36, fs, K, { w: 600 });
    }
    for (const b of roomBtns()) {
      // mientras se arrastra una cosa, los botones de las otras habitaciones abiertas crecen (desde la fase M2)
      const op = roomOpen(b.R.id),
        on = b.R.id === R.id,
        s = on ? 1 : this.drag && this.drag.moved && op ? 1.2 : hv('room:' + b.R.id, hC(b.x, b.y, 34));
      ctx.save();
      ctx.translate(b.x, b.y - (on ? 4 : 0));
      ctx.scale(s, s);
      if (this.newRoom > 0 && b.R.id === R.id && T - this.newRoom < 8) {
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(T * 6);
        circ(0, 0, 46, null, 10, '#FFC93C');
        ctx.globalAlpha = 1;
      }
      if (this.drag && this.drag.moved && op && !on && dist(this.drag.x || 0, this.drag.y || 0, b.x, b.y) < 44) {
        circ(0, 0, 44, '#FFE08A', 0);
      }
      circ(0, 0, 34, on ? '#FFE08A' : op ? '#fff' : '#EADFCF', on ? 7 : 5, on ? '#D9962A' : K);
      if (op) pic(b.R.ic, 0, 0, 50);
      else {
        ctx.globalAlpha = 0.35;
        pic(b.R.ic, 0, 0, 46);
        ctx.globalAlpha = 1;
        pic('candado', 0, 4, 36);
      }
      ctx.restore();
    }
    {
      const s = hv('btn:tienda', hC(1240, 70, 52));
      ctx.save();
      ctx.translate(1240, 70);
      ctx.scale(s, s);
      circ(0, 0, 50, '#fff', 6);
      pic('tienda', 0, 0, 84);
      ctx.restore();
    }
    // los sitios libres donde cabe lo que se arrastra (o lo recién comprado que espera en el baúl), desde la fase M2
    {
      const d = this.drag,
        cual =
          d && d.moved ? d.id : this.baul && this.nuevo && homeRoom(this.nuevo.id) === EN_BAUL ? this.nuevo.id : '';
      if (cual) dibujaSitios(libres(PLANO, R.id, S.home!, cual), (d && d.cerca) || '');
    }
    const nv = this.nuevo;
    if (nv && !nv.slot && S.home![nv.id] && homeRoom(nv.id) === R.id && T - this.t0 < 12) {
      const p = S.home![nv.id],
        hs = HSIZE[nv.id] || 160;
      ctx.globalAlpha = 0.45 + 0.2 * Math.sin(T * 5);
      circ(p.x, p.y - hs * 0.4, hs * 0.62, '#FFE08A', 0);
      ctx.globalAlpha = 1;
    }
    // Orden de dibujo (z de cosasDe): primero la alfombra, luego lo de la pared y después de atrás hacia delante; lo de
    // encima de un mueble, después del mueble.
    // pide: la mascota de la habitación que enseña su bocadillo ahora: de una en una, cada 4 segundos, entre las que aún
    // piden algo hoy (desde la fase C6), para no llenar la habitación de bocadillos
    const pidenHoy = homeItems(R.id).filter((o) => MASCOTAS.includes(o.id) && pideAlgo(o.id)),
      pide = pidenHoy.length ? pidenHoy[Math.floor(T / 4) % pidenHoy.length].id : '';
    const its = cosasDe(R.id).sort((a, b) => a.z - b.z);
    for (const o of its) {
      // lo que se arrastra se dibuja donde está el dedo (drag.px, drag.py) sin cambiar S.home hasta soltarlo
      const dr = this.drag && this.drag.moved && this.drag.id === o.id;
      if (dr) {
        o.x = this.drag.px;
        o.y = this.drag.py;
      }
      const ox = o.id === 'hamster' && !dr && !o.enc ? Math.sin(T * 0.9) * 110 : 0,
        b = o.id === 'hamster' ? Math.abs(Math.sin(T * 8)) * -6 : 0,
        s = dr ? 1.08 : hv('h:' + o.id, hC(o.x, o.y - o.s * 0.2, o.s * 0.45));
      // el movimiento: el de la acción de Tito con este objeto o, si no, el del toque directo del niño (desde la M3)
      const pa = animObjeto(this.acc, o.id);
      const po = { ...(this.acc && this.acc.id === o.id ? pa : poseToque(toqueDe(o.id), this.toques[o.id] ?? -9)) };
      if (!dr && !this.acc && !andando(this.paseo) && this.cerca === o.id) {
        ctx.globalAlpha = 0.16 + 0.08 * Math.sin(T * 4);
        circ(o.x, o.y - o.s * 0.4, o.s * 0.55, '#FFF3B0', 0);
        ctx.globalAlpha = 1;
      }
      // desde la fase M3b: la pista de pareja (lo que se arrastra cerca de su pareja de una combinación: la pareja brilla
      // y se mueve, guiña) y la cosa que tiene debajo Tito cogido (con ella jugará al soltarlo)
      const guina = !dr && this.pareja === o.id,
        bajoTito = this.dragTito && this.dragTito.sobre === o.id;
      if (guina || bajoTito) {
        ctx.globalAlpha = 0.35 + 0.2 * Math.sin(T * 9);
        circ(o.x, o.y - o.s * 0.4, o.s * 0.6, guina ? '#FFB3D1' : '#FFE08A', 0);
        ctx.globalAlpha = 1;
        if (guina) po.rot += Math.sin(T * 12) * 0.08;
      }
      ctx.save();
      ctx.translate(o.x + ox + po.dx, o.y + b + po.dy);
      ctx.scale(s * po.sc, s * (po.sc - po.sq));
      if (po.rot) {
        ctx.translate(0, -o.s * 0.42);
        ctx.rotate(po.rot);
        ctx.translate(0, o.s * 0.42);
      }
      if (o.id === 'lampara' && estadoDe(S.casaEst, 'lampara') === 0) {
        ctx.globalAlpha = 0.25 + 0.05 * Math.sin(T * 3);
        circ(0, -o.s * 0.3, o.s * 0.5, '#FFE08A', 0);
        ctx.globalAlpha = 1;
      }
      if (o.id === 'hamster' && Math.cos(T * 0.9) < 0) ctx.scale(-1, 1);
      // las mascotas (desde la fase C6) se dibujan según su etapa (dibujaMascota); el perro, junto a su casita
      if (o.id === 'casitaPerro') {
        pic(o.id, 0, -o.s * 0.42, o.s);
        dibujaMascota(o.id, o.s * 0.62, Math.abs(Math.sin(T * 3)) * -6, o.s * 0.55);
      } else if (MASCOTAS.includes(o.id)) dibujaMascota(o.id, 0, 0, o.s);
      else pic(o.id, 0, -o.s * 0.42, o.s);
      // lo de su estado guardado (desde la fase M3): la tele encendida, el fuego de la olla, la torre de bloques...
      dibujaEstado(o.id, estadoDe(S.casaEst, o.id), o.s);
      ctx.restore();
      // y, si le toca enseñar lo que pide hoy (pide), su bocadillo (no mientras se arrastra ni mientras Tito juega)
      if (o.id === pide && !dr && !this.acc)
        bocadillo(
          o.id,
          o.x + ox + (o.id === 'casitaPerro' ? o.s * 0.62 : o.s * 0.25),
          o.y - o.s * (o.id === 'casitaPerro' ? 0.55 : 0.75),
        );
    }
    if (nv && !nv.slot && S.home![nv.id] && homeRoom(nv.id) === R.id && T - this.t0 < 12) {
      const p = S.home![nv.id],
        hs = HSIZE[nv.id] || 160;
      arrowAt(p.x, p.y - hs * 0.9 - 30);
    }
    const tb =
      this.jump > 0 && T > this.jump
        ? Math.max(0, 1 - (T - this.jump) * 2) * Math.abs(Math.sin((T - this.jump) * 10)) * -60
        : 0;
    // Tito, listo para jugar (se le tocó: desde la fase M3), con un aro que brilla bajo sus pies
    if (T - this.titoListo < ESPERA_TITO) {
      const [tx, ty] = posTito(this.paseo);
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(T * 8);
      ctx.beginPath();
      ctx.ellipse(tx, ty, 110, 30, 0, 0, PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FFC93C';
      ctx.stroke();
      ctx.restore();
    }
    dibujaTitoCasa(this.paseo, this.acc, tb);
    efectosAccion(this.acc);
    // el bocadillo de la rutina de la hora (desde la fase M6): lo que Tito quiere hacer ahora, si aún no se ha hecho hoy
    {
      const b = this.bocadilloRutina!();
      if (b) {
        const sube = Math.sin(T * 2.5) * 5;
        circ(b.x - 34, b.y + 50 + sube, 10, '#FFFFFF', 3);
        circ(b.x - 50, b.y + 70 + sube, 6, '#FFFFFF', 3);
        circ(b.x, b.y + sube, b.r, '#FFFFFF', 4);
        pic(b.rutina.icono, b.x, b.y + sube, b.r * 1.3);
      }
    }
    // el objeto más cercano a Tito parado brilla un poco, para invitar a tocarlo (decisión 1 del plan)
    {
      const [tx, ty] = posTito(this.paseo),
        c = homeItems(R.id)
          .filter((o) => dist(tx, ty, o.x, o.y) < o.s * 0.5 + 150)
          .sort((a, b) => dist(tx, ty, a.x, a.y) - dist(tx, ty, b.x, b.y))[0];
      this.cerca = c ? c.id : '';
    }
    if (nv && nv.slot && T - this.t0 < 6 && azar() < 0.15) sparkles(440 + rnd(-120, 120), 420 + rnd(-80, 80), 2);
    drawPet(190, 872, 150, { jump: this.petJump });
    // el armario (si la bandeja del baúl está abierta, la bandeja lo tapa)
    const wd = this.baul ? [] : this.wardrobe(),
      wa = this.baul ? [] : this.wardArrows();
    if (wd.length) {
      card(400, 795, wa.length ? 1060 : Math.min(1080, wd.length * 100 + 40), 100, 'rgba(255,255,255,.8)', 5, 50);
      for (const [ax, ay, d] of wa) {
        const s = hv('wpg' + d, hC(ax, ay, 34));
        ctx.save();
        ctx.translate(ax, ay);
        ctx.scale(s * d, s);
        circ(0, 0, 32, '#fff', 5);
        ctx.beginPath();
        ctx.moveTo(-8, -15);
        ctx.lineTo(10, 0);
        ctx.lineTo(-8, 15);
        ctx.lineWidth = 8;
        ctx.strokeStyle = K;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      }
      for (const w of wd) {
        const on = isWorn(w.it),
          s = hv('w:' + w.it.id, hC(w.x, w.y, 44));
        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.scale(s, s);
        circ(0, 0, 42, on ? '#FFF3B0' : '#fff', on ? 7 : 4, on ? '#FFC93C' : K);
        drawItemPic(w.it, 0, 0, 72);
        ctx.restore();
      }
    }
    // el botón del álbum «Sorpresas de la casa» (desde la fase C7), con cuántas lleva
    {
      const B = ALBUM_CASA_BOTON,
        s = hv('albumCasa', hC(B.x, B.y, B.r));
      ctx.save();
      ctx.translate(B.x, B.y);
      ctx.scale(s, s);
      circ(0, 0, B.r, '#fff', 5);
      pic('cuento', 0, 0, B.r * 1.3);
      circ(B.r * 0.7, -B.r * 0.7, 24, '#FFC93C', 4);
      text(String(cuantasSorpresas(S.sorpresas || {})), B.r * 0.7, -B.r * 0.7 + 9, 24, K);
      ctx.restore();
    }
    // el botón grande de la escena (desde la fase M3), tras dos toques seguidos a un objeto que tiene escena
    const eb = this.botonEscena!();
    if (eb) {
      const sb = 1 + 0.06 * Math.sin(T * 6);
      ctx.save();
      ctx.translate(eb.x, eb.y);
      ctx.scale(sb, sb);
      circ(0, 0, eb.r + 10, '#FFE08A', 0);
      circ(0, 0, eb.r, '#fff', 7, '#D9962A');
      pic(eb.id, -10, 0, eb.r * 1.25);
      ctx.beginPath();
      ctx.moveTo(eb.r * 0.45, -18);
      ctx.lineTo(eb.r * 0.8, 0);
      ctx.lineTo(eb.r * 0.45, 18);
      ctx.closePath();
      ctx.fillStyle = '#7CC86E';
      ctx.fill();
      ctx.restore();
    }
    // el baúl (desde la fase M2): la bandeja, si está abierta (más clara mientras se saca una cosa), y su botón, que
    // brilla si se arrastra encima una cosa de la habitación
    const d = this.drag;
    if (this.baul) {
      ctx.globalAlpha = d && d.moved && d.desde === 'baul' ? 0.35 : 1;
      dibujaBandeja({
        ids: baulItems(),
        pestana: this.pest,
        pag: this.bpag,
        sacando: d && d.desde === 'baul' ? d.id : '',
        nuevo: this.nuevo && !this.nuevo.slot ? this.nuevo.id : '',
        nuevos: nuevosEnBaul(S),
        ordenaPide: T - this.ordenaT < 5,
        catDe,
        dibuja: dibujaCosa,
      });
      ctx.globalAlpha = 1;
    }
    dibujaBotonBaul(
      this.baul,
      nuevosEnBaul(S).length,
      !!d && d.moved && d.desde === 'sala' && dist(d.x, d.y, BAUL.x, BAUL.y) < BAUL.r + 40,
    );
    // lo que se saca del baúl va pegado al dedo, por encima de todo
    if (d && d.moved && d.desde === 'baul') {
      const hs = (HSIZE[d.id] || 160) * 0.8;
      ctx.save();
      ctx.translate(d.px, d.py);
      ctx.scale(1.08, 1.08);
      pic(d.id, 0, -hs * 0.42, hs);
      ctx.restore();
    }
    drawHome();
    drawCoinHUD();
  },
  // Objeto de la habitación que hay bajo el toque (x,y), mirando primero los de delante (z de cosasDe); el hámster
  // se mueve solo (si no está encima de un mueble).
  itemAt(x: number, y: number) {
    return cosasDe(this.room)
      .sort((a, b) => b.z - a.z)
      .find((o) => {
        const ox = o.id === 'hamster' && !o.enc ? Math.sin(T * 0.9) * 110 : 0;
        return Math.abs(x - o.x - ox) < o.s * 0.45 && y < o.y + 10 && y > o.y - o.s * 0.85;
      });
  },
  // Toques: casa (mapa), tienda, monedas, mascota (dice cuánto le falta para crecer), botón de una habitación (abierta:
  // va a ella; cerrada: dice cuántas casitas faltan), el título (cuánto falta para que la casa crezca), las flechas
  // del armario (otra página de ropa), un objeto (empieza a arrastrarlo; va antes que Tito para que uno soltado delante
  // de él se pueda volver a coger), Tito (salta y dice algo) o una prenda del armario (se la pone o quita).
  down(x, y) {
    if (atHome(x, y)) {
      SFX.tap();
      go('map');
      return;
    }
    if (dist(x, y, 1240, 70) < 56) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (dist(x, y, ALBUM_CASA_BOTON.x, ALBUM_CASA_BOTON.y) < ALBUM_CASA_BOTON.r + 6) {
      SFX.whoosh();
      go('sorpresasCasa');
      return;
    }
    if (inCoinHUD(x, y)) {
      say(fmt('Tienes {n} monedas.', { n: S.coins! }));
      return;
    }
    if (dist(x, y, 190, 790) < 85) {
      this.petJump = T;
      SFX.boing();
      const ps = petStage();
      // desde la fase C6, Pipo ya nacido también se cuida: se abre su escena (escenas/casaMascotas.ts)
      if (ps >= 2) {
        later(400, () => {
          if (sceneName === 'casaTito') go('casaMascota', { inst: 'pipo' });
        });
        return;
      }
      const f = ps < 4 ? PET_NEXT[ps] - STARS() : 0;
      say(
        ps === 0
          ? f === 1
            ? 'Es el huevo de Pipo. Le falta un juego para abrirse.'
            : fmt('Es el huevo de Pipo. Le faltan {n} juegos para abrirse.', { n: f })
          : ps < 4
            ? pick([
                '¡Pipo te quiere mucho!',
                'Pipo dice: ¡grrr! Así saludan los dinosaurios.',
                f === 1
                  ? '¡Pipo crece cuando juegas! Le falta un juego para crecer.'
                  : fmt('¡Pipo crece cuando juegas! Le faltan {n} juegos para crecer.', { n: f }),
              ])
            : '¡Pipo es el dinosaurio más grande del mundo!',
      );
      return;
    }
    const rb = roomBtns().find((b) => dist(x, y, b.x, b.y) < 38);
    if (rb) {
      const R = rb.R;
      if (!roomOpen(R.id)) {
        SFX.boing();
        const f = R.need - temasDone();
        // cerrada o cerrado, por el género del nombre de la habitación en el idioma del juego
        const nombre = nombreEn(R.n),
          sala = nombre.art,
          fem = femenino(nombre);
        say(
          f === 1
            ? fmt(
                fem
                  ? '{Sala} todavía está cerrada. Se abre cuando termines una casita más.'
                  : '{Sala} todavía está cerrado. Se abre cuando termines una casita más.',
                { sala },
              )
            : fmt(
                fem
                  ? '{Sala} todavía está cerrada. Se abre cuando termines {n} casitas más.'
                  : '{Sala} todavía está cerrado. Se abre cuando termines {n} casitas más.',
                { sala, n: f },
              ),
        );
        return;
      }
      if (R.id !== this.room) {
        SFX.pop();
        this.room = R.id;
        this.newRoom = -9;
      }
      say(fmt('{Sala}.', { sala: nombreEn(R.n).art }));
      return;
    }
    if (inR(x, y, 395, 94, 450, 100)) {
      SFX.pop();
      const hl = houseLevel(),
        f = hl < 4 ? HOUSE_NEXT[hl] - temasDone() : 0;
      say(
        hl < 4
          ? f === 1
            ? 'La casa de Tito crece cuando terminas casitas. Falta una para que crezca.'
            : fmt('La casa de Tito crece cuando terminas casitas. Faltan {n} para que crezca.', { n: f })
          : '¡La casa de Tito ya es un castillo!',
      );
      return;
    }
    // el baúl (desde la fase M2): su botón abre o cierra la bandeja; con la bandeja abierta, lo que se toca en ella
    // (toqueBandeja) va antes que los objetos, que asoman por detrás
    if (dist(x, y, BAUL.x, BAUL.y) < BAUL.r + 6) {
      SFX.whoosh();
      this.baul = !this.baul;
      if (this.baul) say(baulItems().length ? '¡Mi baúl! Saca lo que quieras.' : 'Mi baúl está vacío.');
      return;
    }
    if (this.baul && inR(x, y, BANDEJA.x + BANDEJA.w / 2, BANDEJA.y + BANDEJA.h / 2, BANDEJA.w, BANDEJA.h)) {
      this.toqueBandeja!(x, y);
      return;
    }
    const wa = this.wardArrows().find(([ax, ay]: Flecha) => dist(x, y, ax, ay) < 40);
    if (wa) {
      SFX.whoosh();
      this.wpg = (this.wpg || 0) + wa[2];
      return;
    }
    // el botón grande de la escena (desde la fase M3): Tito va a jugar con el objeto y luego se abre su escena
    const eb = this.botonEscena!();
    if (eb && dist(x, y, eb.x, eb.y) < eb.r + 10) {
      this.escena = null;
      this.irA!(eb.id, true);
      return;
    }
    // el bocadillo de la rutina (desde la fase M6): Tito dice lo que quiere hacer
    {
      const b = this.bocadilloRutina!();
      if (b && dist(x, y, b.x, b.y) < b.r + 10) {
        SFX.pop();
        say(FRASES_RUTINA[b.rutina.id]?.pide ?? '');
        return;
      }
    }
    // la cabeza de Tito va antes que los objetos (desde la fase M3b): así se le puede coger aunque esté encima del sofá
    // o de la cama; el resto de su cuerpo, después
    {
      const [tx, ty] = posTito(this.paseo);
      if (inR(x, y, tx, ty - TITO_CASA * 0.7, TITO_CASA * 0.6, TITO_CASA * 0.4)) {
        this.dragTito = { sx: x, sy: y, dy: ty - y, moved: false, sobre: '' };
        setCursor('grab');
        return;
      }
    }
    // los objetos se miran antes que el resto de Tito: uno soltado delante de él tiene que poder volver a moverse
    const o = this.itemAt(x, y);
    if (o) {
      this.drag = {
        id: o.id,
        desde: 'sala',
        dx: x - o.x,
        dy: y - o.y,
        sx: x,
        sy: y,
        x,
        y,
        px: o.x,
        py: o.y,
        moved: false,
      };
      VIVO.drag = { it: o, home: 1 };
      setCursor('grab');
      return;
    }
    {
      const [tx, ty] = posTito(this.paseo);
      // desde la fase M3b, a Tito se le puede coger: si se le suelta encima de una cosa, juega con ella; si solo se le
      // toca, se queda listo para jugar (tocaTito, al soltar)
      if (inR(x, y, tx, ty - TITO_CASA * 0.42, TITO_CASA * 0.9, TITO_CASA * 0.8)) {
        this.dragTito = { sx: x, sy: y, dy: ty - y, moved: false, sobre: '' };
        setCursor('grab');
        return;
      }
    }
    const w = this.wardrobe().find((w: Casilla) => dist(x, y, w.x, w.y) < 46);
    if (w) {
      const it = w.it,
        on = it.slot === 'shell' || it.slot === 'scarf' ? true : !isWorn(it);
      wear(it, on);
      SFX.pop();
      this.jump = T;
      say(fmt(on ? '¡Me puse {cosa}!' : 'Me quité {cosa}.', { cosa: itemName(it) }));
      return;
    }
    // el suelo (desde la fase C2): Tito anda hasta allí; en otro sitio, unos brillos
    if (y > 600 && y < 790 && x > 300) {
      SFX.tap();
      this.paseoTok++;
      this.acc = null;
      this.paseo = andar(this.paseo, x, y);
      return;
    }
    SFX.tap();
    sparkles(x, y, 3);
  },
  // irA(id, conEscena): Tito anda hasta el objeto id de la habitación (al lado, encima o debajo, según su acción:
  // destinoJunto) y, al llegar, juega con él con homeAction (sonido y frase) y apunta la sorpresa descubierta
  // (S.sorpresas, para el álbum de la fase C7). Desde la fase M3b de docs/PLAN-CASA-MEJORA.md, cada vez que juega con
  // el mismo objeto en la visita lo hace de otra forma (varianteDe de dominio/casa.ts, con su frase de
  // FRASES_VARIANTES; las mascotas, un saltito), y la escena pequeña (ESCENA_CASA) o la de cuidados de una mascota solo
  // se abre si conEscena (el botón grande de la escena, que juega de la primera forma). Sin escena, si la pareja de una
  // combinación aún sin descubrir está en la habitación, al acabar la descubre. Si antes de llegar (o de que se abra
  // la escena) se le manda a otro sitio, ya no juega (paseoTok). va: a qué objeto va, qué hará al llegar y de qué forma
  // (n; lo miran las pruebas, tests/regresion/casa.js).
  irA(id: string, conEscena = false) {
    const o = homeItems(this.room).find((i) => i.id === id);
    if (!o) return;
    const r = reaccionDe(id),
      vez = conEscena ? 0 : (this.veces[id] ?? 0),
      v = varianteDe(id, vez),
      accion = v ? v.accion : 'tocar',
      n = v ? v.n : 0,
      frase = n > 0 ? FRASES_VARIANTES[id]?.[n - 1] : undefined,
      [dx, dy] = destinoJunto(this.paseo, o.x, o.y, o.s, accion);
    if (!conEscena) this.veces[id] = vez + 1;
    SFX.pop();
    this.acc = null;
    this.va = { id, accion, n };
    this.paseo = andar(this.paseo, dx, dy);
    const tok = ++this.paseoTok,
      llega = this.paseo.dur;
    later(llega * 1000, () => {
      if (tok !== this.paseoTok) return;
      const p = S.home![id];
      if (!p) return;
      this.acc = { id, accion, t0: T, x: p.x, y: p.y, s: o.s };
      homeAction(id, p.x, p.y - 80, frase);
      S.sorpresas = descubrir(S.sorpresas || {}, id).sorpresas;
      save();
      const esc = conEscena
        ? (r && r.escena && ESCENA_CASA[r.escena]) || (MASCOTAS.includes(id) ? 'casaMascota' : null)
        : null;
      if (esc) {
        later(DURACION_ACCION * 1000, () => {
          if (tok === this.paseoTok && sceneName === 'casaTito') go(esc, { inst: id });
        });
        return;
      }
      // desde la fase M6: si con este objeto se hace la rutina de la hora, Tito la celebra con su pegatina
      if (this.haceRutina!(id, tok)) return;
      // sin escena: si su pareja de una combinación aún sin descubrir está en la misma habitación, al acabar la descubre
      const pareja = homeItems(this.room).find(
        (i) => i.id !== id && combinacion(id, i.id) && !Object.hasOwn(S.sorpresas || {}, idSorpresa(id, i.id)),
      );
      if (pareja)
        later(DURACION_ACCION * 1000, () => {
          if (tok === this.paseoTok && sceneName === 'casaTito')
            this.combina!(id, pareja.id, (p.x + pareja.x) / 2, Math.min(p.y, pareja.y) - 120);
        });
    });
  },
  // bocadilloRutina(): el bocadillo de la rutina de la hora (desde la fase M6, dominio/casaDia.ts), junto a la cabeza
  // de Tito: su centro, su radio y la rutina; null si ya se hizo hoy, si Tito anda cogido con el dedo o si en la casa
  // no hay nada con que hacerla (para no pedir lo que no se tiene).
  bocadilloRutina(): { x: number; y: number; r: number; rutina: Rutina } | null {
    const rutina = rutinaDe(horaCasa());
    if (this.dragTito || hechaHoy(S.casaDia, today(), rutina.id)) return null;
    if (!homeItems().some((o) => cumple(rutina, o.id))) return null;
    const [tx, ty] = posTito(this.paseo);
    return { x: clamp(tx + 130, 80, 1520), y: clamp(ty - TITO_CASA - 40, 200, 760), r: 46, rutina };
  },
  // haceRutina(id, tok): Tito acaba de llegar a id; si con él se hace la rutina de la hora y aún no se ha hecho hoy, se
  // apunta (S.casaDia), se suma la pegatina (S.stk, la del dibujo de la rutina) y se guarda al momento; al acabar de
  // jugar, Tito lo celebra (FRASES_RUTINA) y sale el aviso de la pegatina. Devuelve si la ha hecho.
  haceRutina(id: string, tok: number): boolean {
    const rutina = rutinaDe(horaCasa());
    if (!cumple(rutina, id)) return false;
    const h = hacerRutina(S.casaDia, today(), rutina.id);
    if (!h.nueva) return false;
    S.casaDia = h.dia;
    S.stk[rutina.icono] = (S.stk[rutina.icono] || 0) + 1;
    save();
    later(DURACION_ACCION * 1000, () => {
      if (tok !== this.paseoTok || sceneName !== 'casaTito') return;
      this.jump = T;
      SFX.tada();
      sayQ(FRASES_RUTINA[rutina.id]?.hecha ?? '', () => giveSticker(rutina.icono, true));
    });
    return true;
  },
  // combina(a, b, x, y): la sorpresa de juntar a y b (desde la fase C7): brillos y corazones en (x, y), Tito dice su
  // frase (FRASES_COMBINACION) y se apunta en S.sorpresas; si es nueva, Tito avisa de que va al álbum.
  combina(a: string, b: string, x: number, y: number) {
    const id = idSorpresa(a, b),
      d = descubrir(S.sorpresas || {}, id);
    S.sorpresas = d.sorpresas;
    save();
    SFX.sparkle();
    burst(x, y, 40);
    [0, 1, 2].forEach((i) =>
      parts.push({
        x: x + (i - 1) * 60,
        y,
        vx: rnd(-20, 20),
        vy: -80,
        life: 1.6,
        t: 0,
        c: '#FF6B8A',
        r: 26,
        rot: 0,
        k: 'h',
        g: 0,
      }),
    );
    this.jump = T;
    say(FRASES_COMBINACION[id] || '¡Sorpresa!', d.nueva ? () => say('¡Sorpresa nueva para el álbum!') : undefined);
  },
  // tocaTito(): tocar a Tito (desde la fase M3): salta y se queda listo para jugar unos segundos (titoListo, con un aro
  // bajo los pies); el siguiente objeto que se toque, Tito va y juega con él (irA).
  tocaTito() {
    this.jump = T;
    this.titoListo = T;
    SFX.boing();
    say(pick(['¿A qué jugamos? Toca una cosa.', '¡Vamos a jugar! ¿Con qué?', '¡Me encanta mi casa! ¿A qué jugamos?']));
  },
  // toca(id): el toque directo del niño en un objeto (desde la fase M3, capas 1 y 2): el objeto se mueve (su Toque de
  // dominio/casaToques.ts), suena, y si tiene estado pasa al siguiente y se guarda (S.casaEst); la torre de bloques,
  // al llegar arriba, se cae. La primera vez en cada visita, Tito dice su nombre. Si se toca dos veces seguidas (en
  // menos de 3 s) un objeto con escena o una mascota, sale el botón grande de su escena (this.escena).
  toca(id: string) {
    this.toques[id] = T;
    const o = homeItems(this.room).find((i) => i.id === id);
    if (Object.hasOwn(ESTADOS, id)) {
      S.casaEst = { ...siguienteEstado(S.casaEst, id) };
      save();
    }
    const e = estadoDe(S.casaEst, id);
    if (id === 'bloques' && e === 0) {
      SFX.boing();
      if (o) burst(o.x, o.y - 120, 16);
    } else if (!(id === 'tele' && e === 0)) sonidoDe(id);
    SFX.pop();
    if (o) sparkles(o.x, o.y - o.s * 0.5, 4);
    const r = reaccionDe(id),
      conEscena = (r && r.escena && ESCENA_CASA[r.escena]) || MASCOTAS.includes(id);
    const doble = this.ultimo && this.ultimo.id === id && T - this.ultimo.t < 3;
    this.ultimo = { id, t: T };
    if (doble && conEscena && o) {
      this.escena = { id, t: T };
      SFX.sparkle();
      return;
    }
    // el reloj dice la hora de verdad (desde la fase M6)
    if (id === 'reloj') {
      say(FRASES_HORA[Math.floor(horaCasa()) % 12] ?? '');
      return;
    }
    this.dichos = this.dichos || {};
    if (!this.dichos[id]) {
      this.dichos[id] = 1;
      say(cap(W_(id)) + '.');
    }
  },
  // botonEscena(): el botón grande de la escena que está a la vista (dura 6 s), con su centro y radio, encima del
  // objeto; null si no hay o el objeto ya no está en la habitación.
  botonEscena() {
    const e = this.escena;
    if (!e || T - e.t > 6) return null;
    const o = cosasDe(this.room).find((i) => i.id === e.id);
    if (!o) return null;
    return { id: e.id, x: clamp(o.x, 120, 1480), y: clamp(o.y - o.s - 50, 210, 640), r: 62 };
  },
  // toqueBandeja(x, y): un toque en la bandeja del baúl abierta (desde la fase M2): una pestaña (enseña solo esas cosas),
  // una flecha (otra página), «¡Ordena, Tito!» (ordena) o una cosa guardada (empieza a sacarla: si se arrastra, va al
  // sitio donde se suelte; si solo se toca, saca la pone en un sitio libre).
  toqueBandeja(x: number, y: number) {
    const ids = baulItems();
    const pe = pestanasDe(ids, catDe).find((p) => dist(x, y, p.x, p.y) < 26);
    if (pe) {
      SFX.pop();
      this.pest = pe.id;
      this.bpag = 0;
      return;
    }
    const f = flechasBaul(ids, this.pest, catDe).find((f) => dist(x, y, f.x, f.y) < 36);
    if (f) {
      SFX.whoosh();
      this.bpag += f.d;
      return;
    }
    if (dist(x, y, ORDENA.x, ORDENA.y) < ORDENA.r + 6) {
      this.ordena!();
      return;
    }
    const c = casillasBaul(ids, this.pest, this.bpag, catDe).find((c) => dist(x, y, c.x, c.y) < 48);
    if (c) {
      this.drag = { id: c.id, desde: 'baul', dx: 0, dy: -40, sx: x, sy: y, x, y, px: x, py: y + 40, moved: false };
      VIVO.drag = { it: c, home: 1 };
      setCursor('grab');
    }
  },
  // ordena(): «¡Ordena, Tito!» (desde la fase M2). El primer toque pregunta (para que no se ordene sin querer); el
  // segundo, antes de 5 s, pone cada cosa que no está en el baúl en su habitación habitual (ordenarCasa,
  // aplicacion/casa.ts), con brillos, y Tito lo celebra.
  ordena() {
    if (T - this.ordenaT > 5) {
      this.ordenaT = T;
      SFX.pop();
      say('¿Ordeno la casa? Toca la varita otra vez.');
      return;
    }
    this.ordenaT = -9;
    this.paseoTok++;
    this.acc = null;
    casaEnS(
      ordenarCasa(
        S,
        habitualDe,
        roomsOpen().map((R) => R.id),
      ),
    );
    save();
    SFX.tada();
    burst(900, 600, 40);
    this.jump = T;
    say('¡Ya está! Cada cosa en su habitación.');
  },
  // trasColocar(c): pone en S la casa que devuelve colocarObjeto o guardarObjeto y guarda; si algo que estaba encima
  // de un mueble se ha ido al baúl, Tito lo dice. Devuelve si se pudo (c no es null).
  trasColocar(c: Colocado | null) {
    if (!c) return false;
    casaEnS(c);
    save();
    if (c.alBaul.length) later(900, () => say('Lo que había encima está en el baúl.'));
    return true;
  },
  // colocar(id, h): pone el objeto id en el sitio h (desde la fase M2; lo usan el arrastre y las pruebas). Devuelve si
  // se pudo (el sitio existe, está libre y el objeto cabe).
  colocar(id: string, h: string) {
    return this.trasColocar!(colocarObjeto(S, id, h));
  },
  // guardar(id): guarda el objeto id en el baúl, con un ruidito y Tito lo dice (desde la fase M2). Devuelve si se pudo.
  guardar(id: string) {
    const ok = this.trasColocar!(guardarObjeto(S, id));
    if (ok) {
      SFX.whoosh();
      sparkles(BAUL.x, BAUL.y - 30, 10);
      say('¡Guardado en el baúl!');
    }
    return ok;
  },
  // saca(id): sacar del baúl con un toque (desde la fase M2): el objeto va al sitio libre que prefiere en esta
  // habitación (sitioLibre); si no hay, Tito lo dice y se queda guardado.
  saca(id: string) {
    const s = sitioLibre(id, this.room);
    if (s && this.colocar!(id, s.id)) {
      SFX.snap();
      sparkles(s.x, s.y - 60, 10);
      say('¡Aquí queda bien!');
      return;
    }
    SFX.boing();
    say('Aquí no hay sitio. Prueba en otra habitación.');
  },
  // Arrastrar: a partir de 12 px se considera que se mueve y la cosa sigue al dedo (drag.px, drag.py: dónde se
  // dibuja; S.home no cambia hasta soltarla). Desde la fase M2, drag.cerca es el sitio libre donde caería (el que más
  // brilla). Puede subir hasta los botones de las habitaciones (para llevarla a otra) o bajar hasta el baúl.
  // Desde la fase M3b, con Tito cogido (dragTito) Tito sigue al dedo y sobre es la cosa que tiene debajo.
  move(x, y) {
    const dt = this.dragTito;
    if (dt) {
      if (Math.abs(x - dt.sx) + Math.abs(y - dt.sy) > 12 && !dt.moved) {
        dt.moved = true;
        this.paseoTok++;
        this.acc = null;
        this.titoListo = -9;
      }
      if (!dt.moved) return;
      this.paseo = paseoQuieto(clamp(x, 60, 1540), clamp(y + dt.dy, 300, 860), this.paseo.flip);
      const o = this.itemAt(x, y);
      dt.sobre = o ? o.id : '';
      return;
    }
    const d = this.drag;
    if (!d) return;
    d.x = x;
    d.y = y;
    if (Math.abs(x - d.sx) + Math.abs(y - d.sy) > 12) d.moved = true;
    if (!d.moved) return;
    d.px = clamp(x - d.dx, 40, 1560);
    d.py = clamp(y - d.dy, 60, 880);
    const s = sitioCerca(d.id, this.room, d.px, d.py);
    d.cerca = s ? s.id : '';
    // la pista de pareja (desde la fase M3b): la pareja de una combinación más cercana, si está a menos de 320 px
    const pj = homeItems(this.room)
      .filter((o) => o.id !== d.id && combinacion(d.id, o.id) && dist(d.px, d.py, o.x, o.y) < o.s * 0.5 + 320)
      .sort((a, b) => dist(d.px, d.py, a.x, a.y) - dist(d.px, d.py, b.x, b.y))[0];
    this.pareja = pj ? pj.id : '';
  },
  // Al soltar (desde la fase M2, con sitios): si no se movió, era un toque: Tito va a jugar con el objeto (irA) o, si
  // venía del baúl, se saca a un sitio libre (saca). Soltado en el baúl (su botón o la bandeja abierta), se guarda.
  // Sobre el botón de otra habitación abierta, va allí, a su sitio libre preferido (si no hay, Tito lo dice); sobre una
  // cerrada, se queda donde estaba. Si no, salta al sitio libre más cercano (sitioCerca); si no hay ninguno cerca, se
  // queda donde estaba (o en el baúl). Soltado al lado de su pareja de una combinación, la sorpresa.
  // Desde la fase M3b, al soltar a Tito (dragTito): si no se movió, era un toque (tocaTito); encima de una cosa, juega
  // con ella (irA); si no, baja andando al suelo.
  up(x, y) {
    const dt = this.dragTito;
    if (dt) {
      this.dragTito = null;
      setCursor('pt');
      if (!dt.moved) this.tocaTito!();
      else if (dt.sobre) this.irA!(dt.sobre);
      else {
        const [tx, ty] = posTito(this.paseo);
        this.paseo = andar(this.paseo, tx, ty);
        SFX.tap();
      }
      return;
    }
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    this.pareja = '';
    VIVO.drag = null;
    setCursor('pt');
    if (!d.moved) {
      if (d.desde === 'baul') {
        this.saca!(d.id);
        return;
      }
      // desde la fase M3: si Tito está listo (se le acaba de tocar), va a jugar; si no, el objeto responde solo
      save();
      if (T - this.titoListo < ESPERA_TITO) {
        this.titoListo = -9;
        this.irA!(d.id);
      } else this.toca!(d.id);
      return;
    }
    const enElBaul =
      dist(x, y, BAUL.x, BAUL.y) < BAUL.r + 40 ||
      (this.baul && inR(x, y, BANDEJA.x + BANDEJA.w / 2, BANDEJA.y + BANDEJA.h / 2, BANDEJA.w, BANDEJA.h));
    if (enElBaul) {
      if (d.desde === 'sala') this.guardar!(d.id);
      return;
    }
    const rb = roomBtns().find((b) => dist(x, y, b.x, b.y) < 50 && b.R.id !== this.room);
    if (rb) {
      if (!roomOpen(rb.R.id)) {
        SFX.boing();
        return;
      }
      const s = sitioLibre(d.id, rb.R.id);
      if (s && this.colocar!(d.id, s.id)) {
        SFX.whoosh();
        sparkles(rb.x, rb.y, 10);
        say(fmt('¡Listo! Ya está en {sala}.', { sala: nombreEn(rb.R.n).art }));
        return;
      }
      SFX.boing();
      say(fmt('En {sala} ya no hay sitio para eso.', { sala: nombreEn(rb.R.n).art }));
      return;
    }
    const s = sitioCerca(d.id, this.room, d.px, d.py);
    if (!s || !this.colocar!(d.id, s.id)) {
      SFX.boing();
      // si en esta habitación ya no cabe en ningún sitio, Tito lo dice
      if (!libres(PLANO, this.room, S.home!, d.id).some((l) => l.id !== S.home![d.id]?.h))
        say('Aquí no hay sitio. Prueba en otra habitación.');
      return;
    }
    SFX.snap();
    sparkles(s.x, s.y - 40, 6);
    // soltado al lado de su pareja de una combinación (desde la fase C7): la sorpresa. Desde la fase M3b, también si se
    // deja encima de un mueble que es su pareja (la tarta en la mesa, el peluche en la cama), aunque quede lejos.
    const cosas = homeItems(this.room),
      mueble = s.mueble && combinacion(d.id, s.mueble) ? cosas.find((o) => o.id === s.mueble) : undefined;
    const pj =
      mueble ||
      cosas.find((o) => o.id !== d.id && combinacion(d.id, o.id) && dist(s.x, s.y, o.x, o.y) < o.s * 0.5 + 200);
    if (pj) this.combina!(d.id, pj.id, (s.x + pj.x) / 2, Math.min(s.y, pj.y) - 120);
  },
};
