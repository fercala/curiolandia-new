/*
 * escenas/viaje.ts: los viajes en vehículo entre lugares (idea 19 de docs/IDEAS-MEJORA.md, fase P25), la escena
 * SCENES.viaje. En vez de pasar de golpe, se va en barco a la Isla de las Letras (desde el muelle del mapa) y en globo a
 * la Isla del Inglés (desde el globo del mapa), y se vuelve igual desde el barco o el globo de cada isla. El viaje dura
 * unos segundos (DURACION_VIAJE): el vehículo se mece en el centro, el paisaje pasa (el mar con sus olas o las nubes) y la
 * isla de destino se acerca por la derecha. Mientras, el niño puede tocar el barco (la bocina) o el globo (el fuego, que
 * lo hace subir) y saludar a los animales que pasan (dan un salto). Al llegar, va a la escena de destino. La casa
 * (arriba a la izquierda) vuelve al mapa sin esperar.
 * Se entra con go('viaje', {a, veh}): a, la escena de destino ('isla', 'islaIngles' o 'map'); veh, 'barco' o 'globo'.
 * Es 2D, como el viaje del autobús de las excursiones (escenas/excursion.ts). Desde la fase P30, con WebGL la capa 3D
 * (mundo3d/viaje3d.ts) pone su versión 3D, que usa esta misma lógica (enter, update, hint, prompt y down) y solo cambia
 * el dibujo y dónde se ven los que pasan (ponProyeccionViaje).
 * Exporta: VIAJE (el estado: vehículo, destino, inicio, los que pasan y cuántas veces se ha tocado), DURACION_VIAJE,
 * PASAN_VIAJE (quién pasa en cada vehículo), QUIEN_ESPERA, el tipo Pasajero, sitioPasajero (dónde está uno de los que
 * pasan, para las pruebas) y ponProyeccionViaje (desde la P30, para la versión 3D); pone SCENES.viaje.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito, monedas y escenas, y el tipo OpcionesEscena) y el contorno K de
 * los dibujos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, tiempos y sonidos en la pantalla de 1600x900,
   como en el resto de las escenas. */
import {
  H,
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
  go,
  hC,
  hv,
  inCoinHUD,
  later,
  noise,
  pic,
  say,
  sceneName,
  sparkles,
  tone,
} from '../nucleo/indice.ts';
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';

/** Un vehículo de viaje. */
export type Vehiculo = 'barco' | 'globo';
/** Uno de los que pasan durante el viaje: su dibujo, cuándo empieza a pasar (segundos desde que sale), a qué altura y
 * cuándo se le ha tocado (salta). */
export interface Pasajero {
  readonly k: string;
  readonly t: number;
  readonly y: number;
  salto: number;
}

/** Cuánto dura un viaje, en segundos. */
export const DURACION_VIAJE = 8;
// VELOCIDAD: lo que avanza por segundo lo que pasa, de derecha a izquierda.
const VELOCIDAD = 380;
// CENTRO: dónde va el vehículo (centro de la pantalla, un poco a la izquierda).
const CENTRO = { x: 640, y: 520 };

/** Quién pasa en cada vehículo: el dibujo, cuándo empieza a pasar y a qué altura. */
export const PASAN_VIAJE: Readonly<Record<Vehiculo, readonly (readonly [string, number, number])[]>> = {
  barco: [
    ['delfin', 0.6, 700],
    ['pajaro', 1.8, 220],
    ['tortuga', 3.0, 760],
    ['ballena', 4.4, 690],
    ['pez', 5.4, 780],
  ],
  globo: [
    ['pajaro', 0.6, 260],
    ['mariposa', 1.8, 420],
    ['avion', 3.0, 150],
    ['pajaro', 4.4, 330],
    ['cometa', 5.4, 240],
  ],
};

/** El estado del viaje de ahora. */
export const VIAJE = {
  veh: 'barco' as Vehiculo,
  a: 'isla',
  t0: 0,
  pasan: [] as Pasajero[],
  toques: 0,
  alto: 0,
  llegado: false,
};

// proyeccion: con el viaje en 3D (desde la P30), dónde se ve en la pantalla cada uno de los que pasan; null en 2D.
let proyeccion: ((p: Pasajero) => { x: number; y: number }) | null = null;
// ponProyeccionViaje(f): la versión 3D del viaje (mundo3d/viaje3d.ts) dice cómo se ven en la pantalla los que pasan.
export function ponProyeccionViaje(f: (p: Pasajero) => { x: number; y: number }): void {
  proyeccion = f;
}

// sitioPasajero(p): dónde está ahora p (centro): entra por la derecha y va hacia la izquierda; con un saltito si se le
// ha tocado hace menos de un segundo. Con el viaje en 3D, dónde se ve (proyeccion).
export function sitioPasajero(p: Pasajero): { x: number; y: number } {
  if (proyeccion) return proyeccion(p);
  const t = T - VIAJE.t0 - p.t,
    s = T - p.salto < 1 ? Math.sin((T - p.salto) * Math.PI) * 90 : 0;
  return { x: W + 120 - t * VELOCIDAD, y: p.y - s + Math.sin(T * 3 + p.t) * 10 };
}

// progreso(): lo que va de viaje, de 0 (salir) a 1 (llegar).
const progreso = (): number => Math.min(1, (T - VIAJE.t0) / DURACION_VIAJE);

// frase(): lo que dice Tito al salir: adónde va y en qué.
function frase(): string {
  const { veh, a } = VIAJE;
  if (a === 'isla') return '¡Todos al barco! Nos vamos a la Isla de las Letras. Toca el barco para tocar la bocina.';
  if (a === 'islaIngles') return '¡Subimos al globo! Nos vamos volando a la Isla del Inglés. Toca el globo para subir.';
  return veh === 'barco'
    ? 'Volvemos en barco a Curiolandia. ¡Saluda a los animales del mar!'
    : 'Volvemos en globo a Curiolandia. ¡Saluda a los pájaros!';
}

// barcoVela(x, y, s): el barco de vela con la A (como el del muelle del mapa), con el centro de la cubierta en (x, y) y
// el tamaño s (1, el del mapa), meciéndose con T.
function barcoVela(x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y + Math.sin(T * 2) * 6);
  ctx.rotate(Math.sin(T * 1.6) * 0.05);
  ctx.scale(s, s);
  ctx.fillStyle = '#FF8A7A';
  ctx.strokeStyle = K;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-56, 0);
  ctx.lineTo(56, 0);
  ctx.lineTo(38, 28);
  ctx.lineTo(-38, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -86);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(5, -80);
  ctx.lineTo(52, -14);
  ctx.lineTo(5, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// globoRayas(x, y, s): el globo aerostático de rayas rojas, blancas y azules (como el del mapa), con el centro de la
// cesta en (x, y) y el tamaño s, subiendo y bajando despacio con T.
function globoRayas(x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y + Math.sin(T * 1.6) * 8);
  ctx.scale(s, s);
  ctx.lineWidth = 4;
  ctx.strokeStyle = K;
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(d * 36, -12);
    ctx.lineTo(d * 18, 30);
    ctx.stroke();
  });
  card(-24, 28, 48, 34, '#C98A4B', 5, 8);
  ctx.beginPath();
  ctx.ellipse(0, -58, 58, 64, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ['#E8554E', '#FFFFFF', '#5B8DEF', '#FFFFFF', '#E8554E'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(-58 + i * 23.2, -124, 23.2, 132);
  });
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, -58, 58, 64, 0, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();
}

// QUIEN_ESPERA: quién espera en cada isla de destino (en el mapa, al volver, la casa de Tito).
export const QUIEN_ESPERA: Readonly<Record<string, string>> = { isla: 'lupi', islaIngles: 'polly' };

// islaDestino(x, y): la isla adonde se va, con su centro en (x, y): un montículo de arena y hierba con quien espera allí
// (Lupi en la Isla de las Letras, Polly en la del Inglés y la casa de Tito al volver a Curiolandia).
function islaDestino(x: number, y: number): void {
  ctx.save();
  ctx.fillStyle = '#FFE6A8';
  ctx.strokeStyle = K;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, y, 260, 70, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8FD16A';
  ctx.beginPath();
  ctx.ellipse(x, y - 14, 200, 52, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();
  pic(QUIEN_ESPERA[VIAJE.a] ?? 'casa', x, y - 110, 170);
}

// fondoMar(p): el viaje en barco: el cielo, el sol, el mar con olas que corren hacia la izquierda y, al acercarse (p, lo
// que va de viaje), la isla de destino por la derecha.
function fondoMar(p: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, 420);
  g.addColorStop(0, '#9ED9F5');
  g.addColorStop(1, '#E9F7FC');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 420);
  circ(1180, 110, 54, '#FFD66B', 6);
  islaDestino(W + 360 - p * 640, 430);
  ctx.fillStyle = '#5BB8E6';
  ctx.fillRect(0, 420, W, H - 420);
  ctx.save();
  ctx.strokeStyle = '#B9E9F8';
  ctx.lineWidth = 6;
  [480, 580, 680, 780, 860].forEach((y, j) =>
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      const x = ((((i * 190 + j * 60 - T * (90 + j * 25)) % 1900) + 1900) % 1900) - 150;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 30, y - 16, x + 60, y);
      ctx.stroke();
    }),
  );
  ctx.restore();
}

// fondoCielo(p): el viaje en globo: el cielo, nubes que pasan hacia la izquierda, el mar abajo, a lo lejos, y, al
// acercarse (p), la isla de destino abajo a la derecha.
function fondoCielo(p: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#7CC6F2');
  g.addColorStop(1, '#DFF3FC');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#5BB8E6';
  ctx.fillRect(0, 760, W, H - 760);
  islaDestino(W + 360 - p * 640, 800);
  [
    [0, 180, 1],
    [600, 320, 0.8],
    [1100, 120, 1.2],
    [300, 560, 0.9],
    [1400, 480, 1],
  ].forEach(([x0, y, s]) => {
    const x = ((((x0! - T * 70 * s!) % 1900) + 1900) % 1900) - 150;
    ctx.save();
    ctx.globalAlpha = 0.9;
    [
      [0, 0, 60],
      [55, -20, 48],
      [100, 4, 52],
      [50, 18, 50],
    ].forEach(([dx, dy, r]) => circ(x + dx! * s!, y! + dy! * s!, r! * s!, '#FFFFFF', 0));
    ctx.restore();
  });
}

// enVehiculo(x, y): ¿se ha tocado el barco o el globo (con Tito dentro)?
function enVehiculo(x: number, y: number): boolean {
  const cy = VIAJE.veh === 'globo' ? CENTRO.y - 120 - VIAJE.alto : CENTRO.y;
  return dist(x, y, CENTRO.x, cy) < 170;
}

// bocina(): al tocar el vehículo: el barco toca la bocina (dos notas graves) y el globo echa fuego y sube un poco.
function bocina(): void {
  VIAJE.toques++;
  if (VIAJE.veh === 'barco') {
    tone(196, 0.5, 'triangle', 0.25);
    tone(196, 0.6, 'triangle', 0.25, 0, 0.6);
    if (VIAJE.toques === 1) say('¡Piiii! ¡Allá vamos!');
  } else {
    noise(0.6, 0.2, 700);
    VIAJE.alto = Math.min(140, VIAJE.alto + 40);
    if (VIAJE.toques === 1) say('¡Fuego! ¡El globo sube más alto!');
  }
  sparkles(CENTRO.x, CENTRO.y - 120, 10);
}

SCENES['viaje'] = {
  music: 'map',
  // enter(o): prepara el viaje (o.a, el destino; o.veh, el vehículo; si no se dice, el de la isla de destino) y Tito
  // dice adónde vamos.
  enter(o: OpcionesEscena = {}) {
    const a = o.a || 'isla',
      veh: Vehiculo = o.veh || (a === 'islaIngles' ? 'globo' : 'barco');
    Object.assign(VIAJE, {
      veh,
      a,
      t0: T,
      toques: 0,
      alto: 0,
      llegado: false,
      pasan: PASAN_VIAJE[veh].map(([k, t, y]) => ({ k, t, y, salto: -9 })),
    });
    later(300, () => say(frase()));
  },
  // prompt(): repite adónde vamos.
  prompt() {
    say(frase());
  },
  // hint(): la mano señala el vehículo (hasta que se toque una vez).
  hint() {
    if (VIAJE.toques) return null;
    return { x: CENTRO.x, y: VIAJE.veh === 'globo' ? CENTRO.y - 120 : CENTRO.y, r: 150 };
  },
  // update(): el globo baja poco a poco a su altura; al acabar el viaje, se llega al destino.
  update(dt: number) {
    VIVO.idle = 0;
    VIAJE.alto = Math.max(0, VIAJE.alto - dt * 20);
    if (!VIAJE.llegado && T - VIAJE.t0 > DURACION_VIAJE && sceneName === 'viaje') {
      VIAJE.llegado = true;
      go(VIAJE.a, { hello: true });
    }
  },
  // draw(): el paisaje (el mar o el cielo) con la isla que se acerca, los que pasan, el vehículo con Tito y, encima, la
  // casa y las monedas.
  draw() {
    const p = progreso(),
      globo = VIAJE.veh === 'globo';
    if (globo) fondoCielo(p);
    else fondoMar(p);
    VIAJE.pasan.forEach((q) => {
      const s = sitioPasajero(q);
      if (s.x > -150 && s.x < W + 150) pic(q.k, s.x, s.y, 130);
    });
    const k = hv('viaje:veh', hC(CENTRO.x, globo ? CENTRO.y - 120 - VIAJE.alto : CENTRO.y, 170));
    if (globo) {
      const y = CENTRO.y - VIAJE.alto;
      // Tito va dentro de la cesta: se pinta después del globo y la cesta se vuelve a pintar delante de él
      const s = 2.6 * k,
        yb = y + Math.sin(T * 1.6) * 8;
      globoRayas(CENTRO.x, y, s);
      drawTito(CENTRO.x - 70, yb + 28 * s - 95, 140);
      card(CENTRO.x - 24 * s, yb + 28 * s + 30, 48 * s, 34 * s - 30, '#C98A4B', 5, 8);
    } else {
      drawTito(CENTRO.x - 175, CENTRO.y - 118, 150);
      barcoVela(CENTRO.x, CENTRO.y, 2.6 * k);
    }
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el mapa; monedas -> la tienda; el vehículo -> la bocina o el fuego; uno de los que pasan ->
  // salta y saluda; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('map');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (enVehiculo(x, y)) {
      bocina();
      return;
    }
    const q = VIAJE.pasan.find((o) => {
      const s = sitioPasajero(o);
      return dist(x, y, s.x, s.y) < 90;
    });
    if (q) {
      q.salto = T;
      SFX.pop();
      say('¡Hola! ¡Adiós!');
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
