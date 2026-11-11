/*
 * escenas/panuelo.ts: el pañuelo, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12c), la escena
 * SCENES.panuelo. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts). Tito está en el medio con el
 * pañuelo en alto y hay dos equipos de amigos, uno a cada lado, cada amigo con su número en la camiseta (planPanuelo,
 * dominio/juegosCortos.ts: con 3 años, tres amigos; con 5, cinco y descolocados). Tito dice un número y se toca al
 * amigo de nuestro equipo (el de la izquierda) que lo lleva: corre, coge el pañuelo antes que el del otro equipo y
 * vuelve con él: punto. Si se toca a otro amigo, dice su número y Tito repite el que toca. Cuatro rondas. Al final, como
 * en los demás juegos del patio, se apunta en S.cole con sus monedas (terminarEnElPatio) y salen el cartel y el botón
 * «Otra vez». La casa vuelve al menú de los juegos cortos. Practica reconocer los números.
 * Exporta: PANUELO_ST (el estado de la partida, para las pruebas), sitioAmigo y pone SCENES.panuelo.
 * Importa: el núcleo (dibujo, voz, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de
 * dominio/juegosCortos.ts, NUM de juegos/comps.ts, el fondo del patio y lo común del patio.
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
  fmt,
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
import { planPanuelo } from '../dominio/juegosCortos.ts';
import { NUM } from '../juegos/comps.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Las fases: Tito explica, pide un número, el amigo corre a por el pañuelo y vuelve, o se acaba. */
type FasePanuelo = 'intro' | 'pide' | 'corre' | 'fin';

// MEDIDAS: dónde está cada equipo (x de nuestra fila y de la del otro equipo), la y del primer amigo y la separación, el
// tamaño de los amigos y lo que tocan, dónde está el pañuelo (delante de Tito), lo que tarda en ir y en volver el
// amigo que corre y hasta dónde llega el del otro equipo (la parte del camino).
const MEDIDAS = {
  nuestro: 330,
  otro: W - 330,
  y0: 370,
  sep: 110,
  tam: 105,
  toca: 62,
  panuelo: { x: 800, y: 470 },
  ida: 0.9,
  vuelta: 0.9,
  rival: 0.55,
};
// AMIGOS: los dibujos de los amigos de nuestro equipo y del otro, por su número (del 1 al 5).
const AMIGOS = {
  nuestro: ['conejo', 'ardilla', 'erizo', 'pinguino', 'cerdito'],
  otro: ['pollito', 'gallina', 'caballo', 'cerdo', 'pajaro'],
};
// FRASES_PUNTO: lo que dice Tito con cada punto, por turnos.
const FRASES_PUNTO = ['¡Punto para nuestro equipo!', '¡Qué rápido! ¡Otro punto!', '¡Lo has cogido! ¡Muy bien!'];

// PANUELO_ST: el estado de la partida: la fase y cuándo empezó, los números de nuestra fila (en orden de arriba
// abajo), los que pide Tito, la ronda, los puntos, el amigo que corre (su número) y cuándo avisó Tito de un número
// equivocado y cuál dijo el amigo tocado (y cuándo, para que salte).
export const PANUELO_ST = {
  fase: 'intro' as FasePanuelo,
  t0: 0,
  fila: [] as number[],
  pedidos: [] as number[],
  ronda: 0,
  puntos: 0,
  corre: 0,
  aviso: -9,
  salta: 0,
  saltaT: -9,
};

// sigue(): ¿se sigue en la escena del pañuelo? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'panuelo';
// pedido(): el número que pide Tito en esta ronda.
const pedido = (): number => PANUELO_ST.pedidos[PANUELO_ST.ronda] ?? 1;
// numeroDicho(n): el número n dicho en palabras (en el idioma del juego).
const numeroDicho = (n: number): string => NUM[n] ?? String(n);

// sitioAmigo(n, lado): dónde está el amigo con el número n de un equipo ('nuestro': a la izquierda, en el orden de la
// fila; 'otro': a la derecha, en el orden al revés, para que no estén enfrente).
export function sitioAmigo(n: number, lado: 'nuestro' | 'otro'): { x: number; y: number } {
  const fila = lado === 'nuestro' ? PANUELO_ST.fila : [...PANUELO_ST.fila].reverse(),
    i = Math.max(0, fila.indexOf(n)),
    alto = (fila.length - 1) * MEDIDAS.sep,
    y = MEDIDAS.y0 + (4 * MEDIDAS.sep - alto) / 2 + i * MEDIDAS.sep;
  return { x: lado === 'nuestro' ? MEDIDAS.nuestro : MEDIDAS.otro, y };
}

// pedir(): empieza la ronda: Tito dice el número.
function pedir(): void {
  Object.assign(PANUELO_ST, { fase: 'pide', t0: T, corre: 0 });
  say(fmt('¡El número {n}!', { n: numeroDicho(pedido()) }));
}

// tocar(n): se ha tocado al amigo n de nuestro equipo: si es el que pide Tito, sale corriendo a por el pañuelo; si no,
// salta, dice su número y Tito repite el que toca (como mucho cada 2,5 segundos).
function tocar(n: number): void {
  const s = PANUELO_ST;
  if (n !== pedido()) {
    SFX.boing();
    Object.assign(s, { salta: n, saltaT: T });
    if (T - s.aviso > 2.5) {
      s.aviso = T;
      say(fmt('Yo llevo el {n}. Busca el {m}.', { n: numeroDicho(n), m: numeroDicho(pedido()) }));
    }
    return;
  }
  SFX.whoosh();
  Object.assign(s, { fase: 'corre', t0: T, corre: n });
  later((MEDIDAS.ida + MEDIDAS.vuelta) * 1000 + 100, () => {
    if (sigue() && s.fase === 'corre') punto();
  });
}

// punto(): el amigo ha vuelto con el pañuelo: punto, y la ronda siguiente o el final.
function punto(): void {
  const s = PANUELO_ST,
    p = sitioAmigo(s.corre, 'nuestro');
  s.puntos++;
  s.ronda++;
  SFX.good();
  sparkles(p.x, p.y, 14);
  if (s.ronda >= s.pedidos.length) {
    acabar();
    return;
  }
  Object.assign(s, { fase: 'intro', corre: 0 });
  sayQ(FRASES_PUNTO[(s.puntos - 1) % FRASES_PUNTO.length] ?? '¡Punto para nuestro equipo!', () => {
    if (sigue()) later(300, pedir);
  });
}

// acabar(): se han hecho todas las rondas: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  Object.assign(PANUELO_ST, { fase: 'fin', corre: 0 });
  terminarEnElPatio('panuelo', W / 2, 450);
  say('¡Hemos ganado todos los puntos! Conoces muy bien los números. ¿Jugamos otra vez?');
}

// carrera(): mientras corre, cuánto lleva el amigo (de 0 a 1 la ida y de 1 a 2 la vuelta) y si ya lleva el pañuelo.
function carrera(): { k: number; lleva: boolean } {
  const t = T - PANUELO_ST.t0;
  if (t < MEDIDAS.ida) return { k: easeOut(t / MEDIDAS.ida), lleva: false };
  return { k: 1 + Math.min(1, (t - MEDIDAS.ida) / MEDIDAS.vuelta), lleva: true };
}

// dondeCorre(desde, k, alcance): dónde está un amigo que corre desde su sitio hacia el pañuelo: k de 0 a 1 es la ida
// (hasta alcance de la parte del camino) y de 1 a 2, la vuelta.
function dondeCorre(desde: { x: number; y: number }, k: number, alcance: number): { x: number; y: number } {
  const ida = Math.min(1, k) * alcance,
    f = k <= 1 ? ida : alcance * (2 - k),
    meta = { x: MEDIDAS.panuelo.x + (desde.x < W / 2 ? -40 : 40), y: MEDIDAS.panuelo.y + 40 };
  return { x: desde.x + (meta.x - desde.x) * f, y: desde.y + (meta.y - desde.y) * f };
}

// dibujaAmigo(n, lado, p, salto): un amigo de un equipo en p, con su número en la camiseta (un círculo de su equipo)
// y, si salta, un poco más arriba.
function dibujaAmigo(n: number, lado: 'nuestro' | 'otro', p: { x: number; y: number }, salto: number): void {
  const k = AMIGOS[lado][(n - 1) % 5] ?? 'conejo',
    y = p.y - salto;
  sombra(p.x, p.y + MEDIDAS.tam / 2, 40);
  pic(k, p.x, y, MEDIDAS.tam);
  circ(p.x + (lado === 'nuestro' ? 52 : -52), y + 30, 28, lado === 'nuestro' ? '#5BB8E6' : '#FF8A7A', 5);
  text(n, p.x + (lado === 'nuestro' ? 52 : -52), y + 42, 34, '#fff');
}

// dibujaPanuelo(x, y): el pañuelo rojo, que ondea un poco.
function dibujaPanuelo(x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(T * 5) * 0.12);
  ctx.fillStyle = '#FF5A5A';
  ctx.strokeStyle = '#3A2A20';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(20, 10, 14, 52);
  ctx.quadraticCurveTo(-4, 60, -22, 50);
  ctx.quadraticCurveTo(-18, 20, -6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// dibujaEquipos(): los dos equipos, cada amigo en su sitio salvo los que corren (el nuestro y el del otro equipo con el
// mismo número), que van hacia el pañuelo; el del otro equipo se queda a medio camino.
function dibujaEquipos(): void {
  const s = PANUELO_ST,
    c = s.fase === 'corre' ? carrera() : null;
  s.fila.forEach((n) => {
    const p = sitioAmigo(n, 'nuestro'),
      q = sitioAmigo(n, 'otro'),
      corre = !!c && n === s.corre,
      salto = n === s.salta && T - s.saltaT < 0.4 ? Math.sin(((T - s.saltaT) / 0.4) * Math.PI) * 40 : 0;
    dibujaAmigo(n, 'otro', corre && c ? dondeCorre(q, c.k, MEDIDAS.rival) : q, 0);
    const yo = corre && c ? dondeCorre(p, c.k, 1) : p;
    dibujaAmigo(n, 'nuestro', yo, salto);
    if (corre && c?.lleva) dibujaPanuelo(yo.x + 30, yo.y - 60);
  });
}

SCENES['panuelo'] = {
  music: 'jardin',
  // enter(): una partida nueva con sus amigos y números (planPanuelo); Tito lo explica y dice el primer número.
  enter(_o: OpcionesEscena) {
    const plan = planPanuelo(AGE(), azar);
    Object.assign(PANUELO_ST, { fase: 'intro', t0: T, fila: plan.fila, pedidos: plan.pedidos, ronda: 0, puntos: 0 });
    Object.assign(PANUELO_ST, { corre: 0, aviso: -9, salta: 0, saltaT: -9 });
    later(400, () =>
      sayQ(
        '¡A jugar al pañuelo! Cuando diga un número, toca al amigo de tu equipo que lo lleva, y correrá a por el pañuelo.',
        () => {
          if (sigue()) pedir();
        },
      ),
    );
  },
  // update(): la ayuda automática no sale mientras Tito explica o el amigo corre.
  update() {
    if (PANUELO_ST.fase === 'intro' || PANUELO_ST.fase === 'corre') VIVO.idle = 0;
  },
  // prompt(): repite el número que se pide.
  prompt() {
    if (PANUELO_ST.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else if (PANUELO_ST.fase === 'pide') say(fmt('¡El número {n}!', { n: numeroDicho(pedido()) }));
  },
  // hint(): mientras Tito pide un número, el amigo que lo lleva; al final, el botón de otra vez.
  hint() {
    if (PANUELO_ST.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    if (PANUELO_ST.fase !== 'pide') return null;
    const p = sitioAmigo(pedido(), 'nuestro');
    return { x: p.x, y: p.y, r: MEDIDAS.toca };
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio con la raya del medio, Tito con el pañuelo (si nadie lo ha cogido), los dos equipos, el número que
  // se pide, las rondas y, al final, el botón de otra vez.
  draw() {
    fondoPatio();
    const s = PANUELO_ST,
      c = s.fase === 'corre' ? carrera() : null;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 8;
    ctx.setLineDash([24, 18]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 560);
    ctx.lineTo(W / 2, 860);
    ctx.stroke();
    ctx.restore();
    drawTito(W / 2 - 90, 290, 180, { bubble: false });
    if (!c?.lleva) dibujaPanuelo(MEDIDAS.panuelo.x, MEDIDAS.panuelo.y);
    dibujaEquipos();
    dibujaRondas(s.pedidos.length, s.puntos);
    if (s.fase === 'pide' || s.fase === 'corre') {
      card(W / 2 - 70, 120, 140, 110, '#fff', 6, 30);
      text(pedido(), W / 2, 205, 84);
    }
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; mientras Tito pide, un amigo de
  // nuestro equipo; si no, chispas.
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
    const s = PANUELO_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    const n =
      s.fase === 'pide'
        ? s.fila.find((k) => {
            const p = sitioAmigo(k, 'nuestro');
            return dist(x, y, p.x, p.y) < MEDIDAS.toca;
          })
        : undefined;
    if (n !== undefined) {
      tocar(n);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
