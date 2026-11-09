/*
 * escenas/cole.ts: el cole (fase P1 de docs/IDEAS-MEJORA.md), la escena SCENES.cole. Se llega desde el sitio nuevo del
 * mapa, «El cole» (MZ2 en escenas/zonas.ts). Es el sitio que junta todo lo nuevo del banco de ideas sin llenar más el
 * mapa: el patio (juegos de moverse y, más adelante, las carreras), el autobús de las excursiones y las clases (los
 * rincones de lógica, experimentos y arte). Lo que aún no está hecho sale con el cartel «¡Muy pronto!» y, al tocarlo,
 * Tito dice que está en obras. Desde la fase P5, el autobús lleva a las excursiones (escenas/excursion.ts).
 * Es una escena 2D, como la Isla de las Letras antes de su fase 3D.
 * Exporta: COLE_SITIOS (los sitios del cole) y pone SCENES.cole al cargarse.
 * Desde la fase P4, si la familia ha quitado los juegos de moverse en la zona de adultos (S.sinMoverse), el patio sale
 * cerrado (con su cartel) y, al tocarlo, Tito lo dice (moverseActivo, dominio/retos.ts).
 * Importa: el núcleo (dibujo, voz, toque, Tito) y moverseActivo de dominio/retos.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import { moverseActivo } from '../dominio/retos.ts';
import {
  H,
  S,
  SCENES,
  SFX,
  T,
  TITO,
  W,
  atHome,
  burst,
  cap,
  card,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  ell,
  go,
  hC,
  hv,
  inCoinHUD,
  inTito,
  kid,
  later,
  pic,
  save,
  say,
  sayQ,
  sky,
  sparkles,
  text,
  tree,
} from '../nucleo/indice.ts';

/** Un sitio del cole: su id, dónde está, su radio tocable, su nombre para la voz, el cartel y la escena a la que lleva
 * (sin escena: «en obras»). */
interface SitioCole {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly name: string;
  readonly cartel: string;
  readonly escena?: string;
}

// COLE_SITIOS: los sitios del cole. El patio, a la izquierda, y desde la fase P5 el autobús de las excursiones
// (SCENES.autobus, escenas/excursion.ts) ya se pueden jugar; las clases llegan en las fases siguientes de
// docs/IDEAS-MEJORA.md.
export const COLE_SITIOS: readonly SitioCole[] = [
  { id: 'patio', x: 400, y: 600, r: 170, name: 'el patio', cartel: 'El patio', escena: 'patio' },
  { id: 'clases', x: 830, y: 390, r: 170, name: 'las clases', cartel: 'Las clases' },
  {
    id: 'autobus',
    x: 1250,
    y: 620,
    r: 160,
    name: 'el autobús de las excursiones',
    cartel: 'Excursiones',
    escena: 'autobus',
  },
];

// fondoCole(): el cielo, la hierba y el suelo de arena del cole, con dos árboles a los lados.
function fondoCole(): void {
  sky('#DDF2FB', '#F4FBEA');
  ctx.fillStyle = '#BDE6A2';
  ctx.fillRect(0, 470, W, H - 470);
  ell(820, 700, 760, 170, '#F1DDB4', 0);
  tree(90, 560, 1.1, 'verano');
  tree(1520, 520, 1, 'primavera');
}

// drawPatio(x, y): el patio en pequeño: la pista de colores, el tobogán y la pelota que bota.
function drawPatio(x: number, y: number): void {
  ell(x, y + 40, 190, 110, '#F7C98B', 6);
  ['#FF8A7A', '#FFD66B', '#7CC86E', '#5B8DEF'].forEach((c, i) => {
    ctx.beginPath();
    ctx.ellipse(x, y + 40, 160 - i * 26, 84 - i * 15, 0, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = c;
    ctx.stroke();
  });
  pic('tobogan', x - 40, y - 20, 170);
  pic('pelota', x + 110, y + 40 - Math.abs(Math.sin(T * 4)) * 40, 70);
}

// drawClases(x, y): el edificio del cole, con su bandera que ondea.
function drawClases(x: number, y: number): void {
  pic('escuela', x, y, 330);
  ctx.save();
  ctx.translate(x + 150, y - 150);
  card(-3, 0, 6, 90, '#8A5A34', 0, 3);
  ctx.beginPath();
  ctx.moveTo(3, 4);
  ctx.quadraticCurveTo(30, 4 + Math.sin(T * 5) * 6, 56, 10);
  ctx.lineTo(56, 38);
  ctx.quadraticCurveTo(30, 34 + Math.sin(T * 5 + 1) * 6, 3, 34);
  ctx.closePath();
  ctx.fillStyle = '#FF6B5E';
  ctx.fill();
  ctx.restore();
}

// drawAutobus(x, y): el autobús amarillo de las excursiones, que tiembla como si tuviera el motor en marcha.
function drawAutobus(x: number, y: number): void {
  pic('autobus', x, y + Math.sin(T * 30) * 1.5, 280);
}

// cerrado(z): ¿está cerrado el sitio z? El patio, si la familia ha quitado los juegos de moverse (S.sinMoverse).
const cerrado = (z: SitioCole): boolean => z.id === 'patio' && !moverseActivo(S.sinMoverse);

// drawSitio(z): pinta el sitio z del cole (el patio, las clases o el autobús), con «¡Muy pronto!» si aún no tiene escena
// (o «Cerrado» si la familia ha cerrado el patio), y debajo su cartel.
function drawSitio(z: SitioCole): void {
  const s = hv('cole:' + z.id, hC(z.x, z.y, z.r));
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.scale(s, s);
  ctx.translate(-z.x, -z.y);
  if (z.id === 'patio') drawPatio(z.x, z.y);
  else if (z.id === 'clases') drawClases(z.x, z.y);
  else drawAutobus(z.x, z.y);
  if (!z.escena || cerrado(z)) {
    card(z.x - 100, z.y - 190, 200, 50, '#FFD66B', 5, 25);
    text(cerrado(z) ? 'Cerrado' : '¡Muy pronto!', z.x, z.y - 155, 28);
  }
  card(z.x - 110, z.y + 124, 220, 50, z.escena && !cerrado(z) ? '#FFA94D' : '#B8B0A6', 5, 25);
  text(z.cartel, z.x, z.y + 160, 30, '#fff');
  ctx.restore();
}

SCENES['cole'] = {
  music: 'map',
  // enter(o): la primera vez, Tito presenta el cole (S.first.cole); si no, saluda corto si viene del mapa (o.hello).
  enter(o: OpcionesEscena) {
    if (!S.first['cole']) {
      S.first['cole'] = 1;
      save();
      later(500, () =>
        sayQ(
          `¡Bienvenido al cole${kid()}! Aquí está el patio, para jugar y moverse, y el autobús, para ir de excursión. Muy pronto vendrán las clases. ¡Toca el patio!`,
        ),
      );
    } else if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna del cole (con el patio cerrado, S.sinMoverse, que se vuelve al mapa).
  prompt() {
    if (cerrado(COLE_SITIOS[0]!)) say('El patio está cerrado por ahora. Toca la casa para volver al mapa.');
    else say('Toca el patio para jugar, o el autobús para ir de excursión.');
  },
  // hint(): el patio, lo único que ya se puede jugar (con el patio cerrado, nada).
  hint() {
    const p = COLE_SITIOS[0]!;
    return cerrado(p) ? null : { x: p.x, y: p.y, r: p.r };
  },
  // dwell(id): dice el nombre de lo que hay bajo el ratón.
  dwell(id: string) {
    const z = COLE_SITIOS.find((x) => 'cole:' + x.id === id);
    if (z) say(cap(z.name) + '.');
  },
  // draw(): el fondo, los sitios, la casa, las monedas y Tito.
  draw() {
    fondoCole();
    COLE_SITIOS.forEach(drawSitio);
    drawHome();
    drawCoinHUD();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): casa -> el mapa; Tito -> consigna; monedas -> tienda; un sitio hecho -> su escena; en obras -> pronto;
  // el patio cerrado (S.sinMoverse) -> Tito lo dice.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('map');
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
    const z = COLE_SITIOS.find((s) => dist(x, y, s.x, s.y) < s.r);
    if (z) {
      if (!z.escena) {
        SFX.boing();
        burst(z.x, z.y - 60, 12);
        say(`${cap(z.name)} ${z.id === 'clases' ? 'están' : 'está'} en obras. ¡Muy pronto podrás jugar aquí!`);
        return;
      }
      if (cerrado(z)) {
        SFX.boing();
        say('El patio está cerrado por ahora. ¡Hay muchas cosas más para jugar en el mapa!');
        return;
      }
      SFX.pop();
      go(z.escena, { hello: true });
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
