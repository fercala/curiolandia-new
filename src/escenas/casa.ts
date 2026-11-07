// ARCHIVO: escenas/casa.ts — la casa de Tito por dentro (SCENES.casaTito), en 2D: las habitaciones con sus objetos,
//   Tito que anda y juega con ellos, el armario con su ropa, Pipo y los botones de las habitaciones, de la tienda y del
//   álbum de sorpresas.
// Cómo encaja: hasta la fase M1 de docs/PLAN-CASA-MEJORA.md estaba al final de escenas/tienda.ts; se sacó aquí sin
//   cambiar nada, antes de las fases que la cambian (el baúl y los sitios, M2). Lo de la tienda que usa la casa (SHOP,
//   ROOMS, HSIZE, homeItems, homeRoom, homeSpot, placeHome...) sigue en escenas/tienda.ts y se importa de allí. Las
//   reacciones de Tito están en escenas/casaReacciones.ts y las escenas pequeñas en los escenas/casa*.ts (ESCENA_CASA).
//   escenas/indice.ts lo carga después de tienda.ts y el puente deja lo que exporta en globalThis para las pruebas.
// Define: homeAction (sonido y frase al jugar con un objeto), ESCENA_CASA (la escena pequeña de cada objeto), homeLight
//   (la luz de la lámpara), roomBg (el fondo de cada habitación), roomBtns y SCENES.casaTito.
// Exporta: roomBtns (lo usan las pruebas).
// Importa: el núcleo, src/nucleo/ (S, save, say, T, ctx, pic, card, text, circ, SFX, tone, hv...), juegos/ (playTune,
//   TUNES, NOTE), temas/ (floor, bunting), escenas/zonas.ts (houseLevel, drawPet, petStage, PET_NEXT, HOUSE_NEXT,
//   arrowAt), azar() (aplicacion/puertos.ts), las reglas de la casa (dominio/casa.ts), sus frases (contenido/casa.ts),
//   escenas/casaAlbum.ts, casaMascotas.ts, casaReacciones.ts y lo de la casa de escenas/tienda.ts.
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
  go,
  hC,
  hv,
  inCoinHUD,
  inR,
  later,
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
  tone,
} from '../nucleo/indice.ts';
import { NOTE, TUNES, playTune } from '../juegos/indice.ts';
import { bunting, floor } from '../temas/indice.ts';
import { HOUSE_NEXT, PET_NEXT, arrowAt, drawPet, houseLevel, petStage } from './zonas.ts';
// azar(): el azar del juego (puerto de aplicacion/puertos.ts, desde la fase 3g; antes Math.random()).
import { azar } from '../aplicacion/puertos.ts';
import {
  MASCOTAS,
  combinacion,
  cuantasSorpresas,
  descubrir,
  idSorpresa,
  reaccionDe,
  type EscenaCasa,
} from '../dominio/casa.ts';
import { ALBUM_CASA_BOTON } from './casaAlbum.ts';
import { bocadillo, dibujaMascota, pideAlgo } from './casaMascotas.ts';
import { FRASES_CASA, FRASES_COMBINACION } from '../contenido/casa.ts';
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
  drawItemPic,
  homeItems,
  homeRoom,
  homeSpot,
  isWorn,
  itemName,
  roomOf,
  roomOpen,
  roomsOpen,
  titoHouseIc,
  wear,
} from './tienda.ts';

// Al jugar con un objeto de la casa (cuando Tito llega hasta él, desde la fase C2): chispitas, su sonido o acción
// propia (tabla A) y Tito dice su frase (FRASES_CASA, contenido/casa.ts) o, si no tiene (las mascotas), su nombre.
function homeAction(id: string, x: number, y: number) {
  SFX.pop();
  sparkles(x, y, 8);
  // A: id del objeto → función que hace al tocarlo (música, sonidos, la lámpara enciende/apaga la luz).
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
    lampara: () => {
      homeLight = !homeLight;
    },
  };
  (A[id] || (() => {}))();
  say(FRASES_CASA[id] ?? cap(W_(id)) + '.');
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
// Luz de la casa de Tito (la lámpara la cambia: de noche se oscurece la habitación). No se guarda.
let homeLight = true;
// roomBg(id, hl): dibuja el fondo fijo de la habitación id de la casa de Tito (pared, ventana, suelo y adornos propios);
// hl es el nivel de la casa (houseLevel): en el salón añade flores, banderines y arcoíris como antes. El suelo empieza
// siempre en y = 600 (los objetos se colocan del 420 al 780). Con la luz apagada (homeLight) se ve la noche.
function roomBg(id: string, hl: number) {
  const win = (x: number, y: number, w: number, h: number, cort?: string) => {
    card(x, y, w, h, homeLight ? '#BFEAF7' : '#2E3F7A', 8, 16);
    if (homeLight) pic('sol', x + w / 3, y + 70, 90);
    else pic('luna', x + w / 3, y + 70, 80);
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
    sky(homeLight ? '#9FDDF5' : '#2E3F7A', homeLight ? '#E2F6FF' : '#55639A');
    if (homeLight) {
      pic('sol', 1430, 190, 130);
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
  if (!homeLight && id !== 'torre') {
    ctx.fillStyle = 'rgba(30,30,70,.25)';
    ctx.fillRect(0, 0, W, H);
  }
}
// Botones de las habitaciones (arriba, entre el título y la tienda): x, y y la habitación.
export const roomBtns = () => ROOMS.map((R, i) => ({ R, x: 660 + i * 76, y: 94 }));
// Escena de la casa de Tito por dentro (2D), con habitaciones (ROOMS) que se abren al terminar casitas: arriba,
// un botón por habitación; los objetos comprados se pueden arrastrar, tocar y llevar a otra habitación soltándolos
// en su botón. Abajo está el armario con la ropa de Tito y la mascota Pipo. Estado: room (habitación que se ve; se
// recuerda entre visitas), drag (objeto que se arrastra), newRoom (cuándo se abrió una habitación, para que brille).
// Desde la fase C2 de docs/PLAN-CASA.md, Tito anda por la habitación (escenas/casaReacciones.ts): paseo (de dónde a
// dónde va), paseoTok (cuenta los paseos: al llegar solo juega si no ha salido otro después) y acc (la acción que
// está haciendo con un objeto, AccionEnCurso). Al tocar un objeto, Tito va hasta él y juega (irA); al tocar el
// suelo, va allí. Entra andando por la izquierda.
SCENES.casaTito = {
  music: 'casita',
  room: 'salon',
  // Al entrar (Tito entra andando por la izquierda; o.volver: vuelve de una escena pequeña, como la del telescopio, y
  // Tito ya está dentro, en la misma habitación, sin decir nada). o.nuevo: id de lo recién comprado (se va a su habitación y se resalta con brillo y flecha durante 12 s;
  // si es ropa, Tito salta). Si no, si se abrió una habitación desde la última visita (S.rooms cuenta las que ya se
  // vieron), se va a ella y Tito lo anuncia. Si no, Tito saluda según haya cosas o la casa esté vacía.
  enter(o) {
    this.drag = null;
    this.wpg = 0;
    this.jump = -9;
    this.petJump = -9;
    this.newRoom = -9;
    this.acc = null;
    this.paseoTok = 0;
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
      else this.room = homeRoom(it.id);
      later(300, () => {
        SFX.sparkle();
        say(
          '¡Aquí está ' +
            itemName(it) +
            '! ' +
            (it.slot ? '¡Mira qué bonito me queda!' : 'Puedes cambiar las cosas de lugar arrastrándolas.'),
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
        sayQ('¡Mi casa creció! Tiene una habitación nueva: ' + R.n + '. Arriba puedes elegir a qué habitación ir.');
      });
      return;
    }
    later(300, () =>
      sayQ(
        n
          ? '¡Esta es mi casa! Puedes mover las cosas arrastrándolas, y tocarlas para jugar.'
          : '¡Esta es mi casa! Está vacía. En la tienda puedes comprar cosas con tus monedas.',
      ),
    );
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
  prompt() {
    say(
      homeItems().length
        ? 'Arrastra las cosas para acomodar la casa. Abajo está mi ropa: tócala para ponérmela.'
        : 'Toca el carrito para ir a la tienda.',
    );
  },
  // Pista: si la casa está vacía señala el botón de la tienda.
  hint() {
    return homeItems().length ? null : { x: 1240, y: 70, r: 60 };
  },
  // Dedo encima de un objeto: dice su nombre; encima del botón de una habitación, su nombre.
  dwell(id) {
    if (id.startsWith('h:')) say(cap(W_(id.slice(2))) + '.');
    else if (id.startsWith('room:')) say(cap(roomOf(id.slice(5)).n) + '.');
  },
  // Dibuja la habitación (roomBg), el título con su nombre, los botones de las habitaciones (la actual en amarillo,
  // las cerradas con candado, la recién abierta brillando), el botón de la tienda, los objetos, Tito, la mascota y el armario.
  draw() {
    const hl = houseLevel(),
      R = roomOf(this.room);
    roomBg(R.id, hl);
    card(170, 44, 450, 100, '#fff', 6, 50);
    titoHouseIc(230, 94, 80);
    {
      const nm = cap(R.n),
        fs = nm.length > 16 ? 28 : nm.length > 11 ? 36 : 46;
      text(nm, 425, 94 + fs * 0.36, fs, K, { w: 600 });
    }
    for (const b of roomBtns()) {
      const op = roomOpen(b.R.id),
        on = b.R.id === R.id,
        s = on ? 1 : hv('room:' + b.R.id, hC(b.x, b.y, 34));
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
    const nv = this.nuevo;
    if (nv && !nv.slot && S.home![nv.id] && homeRoom(nv.id) === R.id && T - this.t0 < 12) {
      const p = S.home![nv.id],
        hs = HSIZE[nv.id] || 160;
      ctx.globalAlpha = 0.45 + 0.2 * Math.sin(T * 5);
      circ(p.x, p.y - hs * 0.4, hs * 0.62, '#FFE08A', 0);
      ctx.globalAlpha = 1;
    }
    // Orden de dibujo: primero la alfombra, luego lo de la pared y después de atrás (y pequeña) hacia delante.
    // pide: la mascota de la habitación que enseña su bocadillo ahora: de una en una, cada 4 segundos, entre las que aún
    // piden algo hoy (desde la fase C6), para no llenar la habitación de bocadillos
    const pidenHoy = homeItems(R.id).filter((o) => MASCOTAS.includes(o.id) && pideAlgo(o.id)),
      pide = pidenHoy.length ? pidenHoy[Math.floor(T / 4) % pidenHoy.length].id : '';
    const its = homeItems(R.id).sort(
      (a, b) =>
        (a.id === 'alfombra' ? -1 : b.id === 'alfombra' ? 1 : 0) ||
        (WALLITEMS.includes(a.id) ? -1 : WALLITEMS.includes(b.id) ? 1 : 0) ||
        a.y - b.y,
    );
    for (const o of its) {
      const dr = this.drag && this.drag.id === o.id,
        ox = o.id === 'hamster' && !dr ? Math.sin(T * 0.9) * 110 : 0,
        b = o.id === 'hamster' ? Math.abs(Math.sin(T * 8)) * -6 : 0,
        s = dr ? 1.08 : hv('h:' + o.id, hC(o.x, o.y - o.s * 0.2, o.s * 0.45));
      const po = animObjeto(this.acc, o.id);
      if (!dr && !this.acc && !andando(this.paseo) && this.cerca === o.id) {
        ctx.globalAlpha = 0.16 + 0.08 * Math.sin(T * 4);
        circ(o.x, o.y - o.s * 0.4, o.s * 0.55, '#FFF3B0', 0);
        ctx.globalAlpha = 1;
      }
      ctx.save();
      ctx.translate(o.x + ox + po.dx, o.y + b + po.dy);
      ctx.scale(s * po.sc, s * (po.sc - po.sq));
      if (po.rot) {
        ctx.translate(0, -o.s * 0.42);
        ctx.rotate(po.rot);
        ctx.translate(0, o.s * 0.42);
      }
      if (o.id === 'lampara' && homeLight) {
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
    dibujaTitoCasa(this.paseo, this.acc, tb);
    efectosAccion(this.acc);
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
    const wd = this.wardrobe(),
      wa = this.wardArrows();
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
    drawHome();
    drawCoinHUD();
  },
  // Objeto de la habitación que hay bajo el toque (x,y), mirando primero los de delante; el hámster se mueve solo.
  itemAt(x: number, y: number) {
    return homeItems(this.room)
      .sort((a, b) => b.y - a.y)
      .find((o) => {
        const ox = o.id === 'hamster' ? Math.sin(T * 0.9) * 110 : 0;
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
      say('Tienes ' + S.coins + ' monedas.');
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
          ? 'Es el huevo de Pipo. Le ' + (f === 1 ? 'falta un juego' : 'faltan ' + f + ' juegos') + ' para abrirse.'
          : ps < 4
            ? pick([
                '¡Pipo te quiere mucho!',
                'Pipo dice: ¡grrr! Así saludan los dinosaurios.',
                '¡Pipo crece cuando juegas! Le ' +
                  (f === 1 ? 'falta un juego' : 'faltan ' + f + ' juegos') +
                  ' para crecer.',
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
        say(
          cap(R.n) +
            ' todavía está ' +
            R.cer +
            '. Se abre cuando termines ' +
            (f === 1 ? 'una casita más.' : f + ' casitas más.'),
        );
        return;
      }
      if (R.id !== this.room) {
        SFX.pop();
        this.room = R.id;
        this.newRoom = -9;
      }
      say(cap(R.n) + '.');
      return;
    }
    if (inR(x, y, 395, 94, 450, 100)) {
      SFX.pop();
      const hl = houseLevel(),
        f = hl < 4 ? HOUSE_NEXT[hl] - temasDone() : 0;
      say(
        hl < 4
          ? 'La casa de Tito crece cuando terminas casitas. ' +
              (f === 1 ? 'Falta una' : 'Faltan ' + f) +
              ' para que crezca.'
          : '¡La casa de Tito ya es un castillo!',
      );
      return;
    }
    const wa = this.wardArrows().find(([ax, ay]: Flecha) => dist(x, y, ax, ay) < 40);
    if (wa) {
      SFX.whoosh();
      this.wpg = (this.wpg || 0) + wa[2];
      return;
    }
    // los objetos se miran antes que Tito: uno soltado delante de él tiene que poder volver a moverse
    const o = this.itemAt(x, y);
    if (o) {
      const p = S.home![o.id];
      this.drag = { id: o.id, dx: x - o.x, dy: y - o.y, sx: x, sy: y, ox: p.x, oy: p.y, moved: false };
      VIVO.drag = { it: o, home: 1 };
      setCursor('grab');
      return;
    }
    {
      const [tx, ty] = posTito(this.paseo);
      if (inR(x, y, tx, ty - TITO_CASA * 0.42, TITO_CASA * 0.9, TITO_CASA * 0.8)) {
        this.jump = T;
        SFX.boing();
        say(
          pick([
            '¡Me encanta mi casa!',
            '¡Gracias por jugar conmigo!',
            '¡Qué bonito día!',
            '¿Has visto mi ropa nueva?',
          ]),
        );
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
      say(on ? '¡Me puse ' + itemName(it) + '!' : 'Me quité ' + itemName(it) + '.');
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
  // irA(id): Tito anda hasta el objeto id de la habitación (al lado, encima o debajo, según su acción: destinoJunto)
  // y, al llegar, juega con él: la acción de REACCIONES (dominio/casa.ts; las mascotas, un saltito) y homeAction
  // (sonido y frase), y apunta la sorpresa descubierta (S.sorpresas, para el álbum de la fase C7). Si el objeto tiene
  // escena pequeña ya hecha (ESCENA_CASA), al acabar de jugar se abre; si es una mascota (desde la fase C6), su escena
  // de cuidados (casaMascota). Si antes de llegar (o de que se abra la escena)
  // se le manda a otro sitio, ya no juega (paseoTok). va: a qué objeto va y
  // qué hará al llegar (lo miran las pruebas, tests/regresion/casa.js).
  irA(id: string) {
    const o = homeItems(this.room).find((i) => i.id === id);
    if (!o) return;
    const r = reaccionDe(id),
      accion = r ? r.tito : 'tocar',
      [dx, dy] = destinoJunto(this.paseo, o.x, o.y, o.s, accion);
    SFX.pop();
    this.acc = null;
    this.va = { id, accion };
    this.paseo = andar(this.paseo, dx, dy);
    const tok = ++this.paseoTok,
      llega = this.paseo.dur;
    later(llega * 1000, () => {
      if (tok !== this.paseoTok) return;
      const p = S.home![id];
      if (!p) return;
      this.acc = { id, accion, t0: T, x: p.x, y: p.y, s: o.s };
      homeAction(id, p.x, p.y - 80);
      S.sorpresas = descubrir(S.sorpresas || {}, id).sorpresas;
      save();
      const esc = (r && r.escena && ESCENA_CASA[r.escena]) || (MASCOTAS.includes(id) ? 'casaMascota' : null);
      if (esc) {
        later(DURACION_ACCION * 1000, () => {
          if (tok === this.paseoTok && sceneName === 'casaTito') go(esc, { inst: id });
        });
        return;
      }
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
  // Arrastrar: a partir de 12 px se considera que se mueve y el objeto sigue al dedo. Mientras se arrastra puede subir
  // hasta los botones de las habitaciones (para llevarlo a otra); al soltar se vuelve a encajar en el suelo o la pared.
  move(x, y) {
    const d = this.drag;
    if (!d) return;
    d.x = x;
    d.y = y;
    if (Math.abs(x - d.sx) + Math.abs(y - d.sy) > 12) d.moved = true;
    if (d.moved) {
      const p = S.home![d.id];
      p.x = clamp(x - d.dx, 40, 1560);
      p.y = clamp(y - d.dy, 60, 780);
    }
  },
  // Al soltar: si se soltó sobre el botón de otra habitación abierta, el objeto se va a esa habitación (a un hueco
  // libre) y Tito lo dice; sobre una cerrada, vuelve a su sitio. Si no, se encaja en los límites y se guarda. Si no se
  // movió, era un toque: Tito va a jugar con el objeto (irA).
  up(x, y) {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    VIVO.drag = null;
    setCursor('pt');
    const p = S.home![d.id];
    if (!d.moved) {
      save();
      this.irA!(d.id);
      return;
    }
    const rb = roomBtns().find((b) => dist(x, y, b.x, b.y) < 44 && b.R.id !== this.room);
    if (rb) {
      if (roomOpen(rb.R.id)) {
        const sp = homeSpot(d.id, rb.R.id);
        Object.assign(p, { x: sp[0], y: sp[1], r: rb.R.id });
        save();
        SFX.whoosh();
        sparkles(rb.x, rb.y, 10);
        say('¡Listo! Ya está en ' + rb.R.n + '.');
        return;
      }
      SFX.boing();
      p.x = d.ox;
      p.y = d.oy;
      save();
      return;
    }
    const hs = HSIZE[d.id] || 160;
    p.x = clamp(p.x, 300 + hs * 0.3, W - hs / 2 - 10);
    p.y = clamp(p.y, WALLITEMS.includes(d.id) ? 300 : 420, 780);
    save();
    SFX.snap();
    // soltado encima de su pareja de una combinación (desde la fase C7): la sorpresa
    const pj = homeItems(this.room).find(
      (o) => o.id !== d.id && combinacion(d.id, o.id) && dist(p.x, p.y, o.x, o.y) < o.s * 0.5 + 60,
    );
    if (pj) this.combina!(d.id, pj.id, (p.x + pj.x) / 2, Math.min(p.y, pj.y) - 120);
  }, // como homeSpot: lo grande no se sale por la derecha
};
