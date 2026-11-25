/*
 * escenas/clases.ts: las clases del cole (fase P27 de docs/IDEAS-MEJORA.md), la escena SCENES.clases. Se llega desde el
 * cole (escenas/cole.ts: las clases, que hasta ahora estaban en obras). Es el aula de Infantil con sus rincones, como en
 * el cole de verdad: el rincón de las construcciones (los bloques en 3D, SCENES.bloques de mundo3d/bloques3d.ts), el
 * de la lógica (desde la fase P32, «Programa a Tito» en 3D, SCENES.programa de mundo3d/programa3d.ts; desde la v0.2.180,
 * su menú con los juegos de lógica en 2D, SCENES.rinconLogica de escenas/logica.ts), el taller de ciencias (desde la
 * v0.2.180, SCENES.taller de escenas/experimentos.ts) y el del arte (desde la v0.2.180, SCENES.estudioArte de
 * escenas/arte.ts). Sin WebGL no hay 3D y las construcciones salen «¡Muy pronto!».
 * Es una escena 2D, como el cole.
 * Exporta: RINCONES_CLASE (los rincones del aula) y pone SCENES.clases al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito, monedas y escenas).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import {
  H,
  SCENES,
  SFX,
  T,
  TITO,
  W,
  atHome,
  burst,
  card,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  inCoinHUD,
  inTito,
  later,
  pic,
  say,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import type { OpcionesEscena } from '../nucleo/tipos.ts';

/** Un rincón del aula: su id, dónde está, el dibujo, el cartel, lo que dice Tito al pasar por encima, lo que dice si
 * aún no está y la escena a la que lleva (sin escena, o si la escena no existe: «¡Muy pronto!»). */
interface RinconClase {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly dibujo: string;
  readonly cartel: string;
  readonly dice: string;
  readonly pronto: string;
  readonly escena?: string;
}

// RINCONES_CLASE: los rincones del aula, de izquierda a derecha.
export const RINCONES_CLASE: readonly RinconClase[] = [
  {
    id: 'construcciones',
    x: 410,
    y: 560,
    dibujo: 'bloques',
    cartel: 'Construcciones',
    dice: 'El rincón de las construcciones.',
    pronto: 'El rincón de las construcciones estará listo muy pronto.',
    escena: 'bloques',
  },
  {
    id: 'logica',
    x: 710,
    y: 560,
    dibujo: 'lupa',
    cartel: 'Lógica',
    dice: 'El rincón de la lógica.',
    pronto: 'El rincón de la lógica estará listo muy pronto.',
    escena: 'rinconLogica',
  },
  {
    id: 'ciencias',
    x: 1010,
    y: 560,
    dibujo: 'bombilla',
    cartel: 'Ciencias',
    dice: 'El taller de ciencias.',
    pronto: 'El taller de ciencias estará listo muy pronto.',
    escena: 'taller',
  },
  {
    id: 'arte',
    x: 1310,
    y: 560,
    dibujo: 'pinturas',
    cartel: 'Arte',
    dice: 'El rincón del arte.',
    pronto: 'El rincón del arte estará listo muy pronto.',
  },
];
// RADIO: lo que mide cada rincón para tocarlo.
const RADIO = 140;

// abierto(r): ¿se puede jugar ya en el rincón r? Si tiene escena y la escena existe (los bloques son en 3D).
const abierto = (r: RinconClase): boolean => !!r.escena && !!SCENES[r.escena];

// fondoAula(): la pared del aula con la pizarra y las ventanas (sin tapar la casa ni las monedas), y el suelo.
function fondoAula(): void {
  ctx.fillStyle = '#FFF2D9';
  ctx.fillRect(0, 0, W, 470);
  ctx.fillStyle = '#E9C48E';
  ctx.fillRect(0, 470, W, H - 470);
  card(560, 70, 480, 230, '#3F6B4E', 10, 18);
  text('Las clases', 800, 205, 64, '#FFFFFF', { max: 440 });
  [310, 1290].forEach((x) => {
    card(x - 110, 130, 220, 200, '#BFE6F8', 8, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 4, 134, 8, 192);
    ctx.fillRect(x - 106, 226, 212, 8);
  });
}

// drawRincon(r): pinta el rincón r: su alfombra, su dibujo (que se mueve un poco), «¡Muy pronto!» si aún no está y su
// cartel debajo.
function drawRincon(r: RinconClase): void {
  const s = hv('clases:' + r.id, hC(r.x, r.y, RADIO));
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.scale(s, s);
  ctx.translate(-r.x, -r.y);
  ctx.fillStyle = abierto(r) ? '#9ED2F5' : '#D6CFC4';
  ctx.beginPath();
  ctx.ellipse(r.x, r.y + 90, 140, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  pic(r.dibujo, r.x, r.y - 10 + Math.sin(T * 2 + r.x) * 6, 190);
  if (!abierto(r)) {
    card(r.x - 100, r.y - 190, 200, 50, '#FFD66B', 5, 25);
    text('¡Muy pronto!', r.x, r.y - 155, 28, undefined, { max: 184 });
  }
  card(r.x - 135, r.y + 140, 270, 56, abierto(r) ? '#FFA94D' : '#B8B0A6', 5, 28);
  text(r.cartel, r.x, r.y + 180, 32, '#fff', { max: 250 });
  ctx.restore();
}

SCENES['clases'] = {
  music: 'map',
  // enter(o): si viene del cole (o.hello), Tito dice la consigna.
  enter(o: OpcionesEscena) {
    if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna de las clases.
  prompt() {
    say('¡Estas son las clases! Toca el rincón de las construcciones para jugar con los bloques.');
  },
  // hint(): el rincón de las construcciones, si está abierto.
  hint() {
    const r = RINCONES_CLASE[0]!;
    return abierto(r) ? { x: r.x, y: r.y, r: RADIO } : null;
  },
  // dwell(id): dice el nombre del rincón que hay bajo el ratón.
  dwell(id: string) {
    const r = RINCONES_CLASE.find((x) => 'clases:' + x.id === id);
    if (r) say(r.dice);
  },
  // draw(): el aula, los rincones, la casa, las monedas y Tito.
  draw() {
    fondoAula();
    RINCONES_CLASE.forEach(drawRincon);
    drawHome();
    drawCoinHUD();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): casa -> el cole; Tito -> consigna; monedas -> tienda; un rincón abierto -> su escena; si no, Tito dice
  // que estará listo muy pronto.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('cole');
      return;
    }
    if (inTito(x, y)) {
      this.prompt!();
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    const r = RINCONES_CLASE.find((z) => dist(x, y, z.x, z.y) < RADIO);
    if (!r) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    if (!abierto(r)) {
      SFX.boing();
      burst(r.x, r.y - 60, 12);
      say(r.pronto);
      return;
    }
    SFX.pop();
    go(r.escena!, { hello: true });
  },
};
