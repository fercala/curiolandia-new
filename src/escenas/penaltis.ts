/*
 * escenas/penaltis.ts: los penaltis, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12b), la escena
 * SCENES.penaltis. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts). En la portería del patio está
 * Lupi, de portera. En cada tiro se toca un lado de la portería (izquierda o derecha; con 5 años, también arriba:
 * ladosPenalti) y Tito chuta hacia allí; Lupi se tira a un lado (paradaDe, dominio/juegosCortos.ts: casi nunca acierta)
 * y es gol o parada. Cinco tiros; cuentan los goles. Al final, como en los demás juegos del patio, se apunta en S.cole
 * con sus monedas (terminarEnElPatio) y salen el cartel y el botón «Otra vez». La casa vuelve al menú de los juegos
 * cortos. Practica izquierda, derecha y arriba.
 * Exporta: PENALTIS_ST (el estado de la partida, para las pruebas), DIANAS (dónde está cada lado de la portería) y pone
 * SCENES.penaltis.
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
  burst,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  fmt,
  go,
  hC,
  hv,
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
import { PENALTIS, ladosPenalti, paradaDe, type LadoPenalti } from '../dominio/juegosCortos.ts';
import { NUM } from '../juegos/comps.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Las fases de un tiro: Tito explica, se elige el lado, Tito chuta (el balón vuela), se ve si es gol o se acaba. */
type FasePenaltis = 'intro' | 'elige' | 'chuta' | 'resultado' | 'fin';

// PORTERIA: la portería (izquierda, arriba, ancho y alto), dónde está el balón, dónde espera Lupi y su tamaño, el tamaño
// de Tito y lo que tarda el balón en llegar.
const PORTERIA = { x: 470, y: 230, w: 660, h: 330, balon: { x: 800, y: 790 }, lupi: { x: 800, y: 450, s: 210 } };
const TITO_P = { x: 600, y: 820, w: 170 };
const VUELO = 0.7;

// DIANAS: dónde se toca para chutar a cada lado (centro y radio), dentro de la portería.
export const DIANAS: Readonly<Record<LadoPenalti, { x: number; y: number; r: number }>> = {
  izquierda: { x: 600, y: 420, r: 95 },
  derecha: { x: 1000, y: 420, r: 95 },
  arriba: { x: 800, y: 300, r: 75 },
};
// DICE: lo que dice Tito al chutar hacia cada lado (frases enteras, para traducirlas).
const DICE: Readonly<Record<LadoPenalti, string>> = {
  izquierda: '¡A la izquierda!',
  derecha: '¡A la derecha!',
  arriba: '¡Arriba!',
};
// GOL y PARADA: lo que dice Tito con cada gol y cada parada, por turnos.
const GOL = ['¡Gol!', '¡Golazo!', '¡Gol, gol, gol!'];
const PARADA = ['¡Uy, lo ha parado Lupi!', '¡Qué parada! Otra vez será.'];

// PENALTIS_ST: el estado de la partida: la fase y cuándo empezó, los tiros hechos, los goles, hacia dónde va el balón
// y hacia dónde se tira Lupi en el tiro de ahora.
export const PENALTIS_ST = {
  fase: 'intro' as FasePenaltis,
  t0: 0,
  tiros: 0,
  goles: 0,
  chute: 'izquierda' as LadoPenalti,
  portera: 'izquierda' as LadoPenalti,
};

// sigue(): ¿se sigue en la escena de los penaltis? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'penaltis';

// elegir(): empieza un tiro: Tito pregunta hacia dónde chuta.
function elegir(): void {
  Object.assign(PENALTIS_ST, { fase: 'elige', t0: T });
  say(AGE() >= 5 ? '¿Hacia dónde chuto? ¿Izquierda, derecha o arriba?' : '¿Hacia dónde chuto? ¿Izquierda o derecha?');
}

// chutar(lado): Tito chuta hacia lado y Lupi se tira a donde le toque (paradaDe).
function chutar(lado: LadoPenalti): void {
  Object.assign(PENALTIS_ST, { fase: 'chuta', t0: T, chute: lado, portera: paradaDe(lado, AGE(), azar) });
  SFX.whoosh();
  say(DICE[lado]);
}

// llega(): el balón llega a la portería: gol (si Lupi se ha tirado a otro lado) o parada; luego, otro tiro o el final.
function llega(): void {
  const s = PENALTIS_ST,
    gol = s.chute !== s.portera,
    tiros = s.tiros + 1,
    goles = s.goles + (gol ? 1 : 0),
    d = DIANAS[s.chute];
  Object.assign(s, { fase: 'resultado', t0: T, tiros, goles });
  if (gol) {
    SFX.tada();
    burst(d.x, d.y, 30);
  } else SFX.boing();
  const frase = gol ? GOL[(goles - 1) % GOL.length] : PARADA[(tiros - goles - 1) % PARADA.length];
  sayQ(frase ?? '¡Gol!', () => {
    if (!sigue()) return;
    if (tiros < PENALTIS.tiros) later(400, elegir);
    else acabar();
  });
}

// fraseGoles(n): lo que dice Tito al final según los goles.
function fraseGoles(n: number): string {
  if (n === 0) return '¡Lupi lo ha parado todo! La próxima vez seguro que metemos gol.';
  if (n === 1) return '¡Has metido un gol! ¿Jugamos otra vez?';
  return fmt('¡Has metido {n} goles! ¿Jugamos otra vez?', { n: NUM[n] ?? String(n) });
}

// acabar(): se acaban los tiros: se apunta en S.cole con sus monedas y Tito dice los goles.
function acabar(): void {
  const s = PENALTIS_ST;
  Object.assign(s, { fase: 'fin', t0: T });
  terminarEnElPatio('penaltis', PORTERIA.balon.x, PORTERIA.balon.y - 60);
  say(fraseGoles(s.goles));
}

// dondeBalon(): dónde está el balón: en el punto de penalti o volando hacia su lado (más pequeño cuanto más lejos).
function dondeBalon(): { x: number; y: number; s: number } {
  const s = PENALTIS_ST,
    b = PORTERIA.balon;
  if (s.fase !== 'chuta' && s.fase !== 'resultado') return { x: b.x, y: b.y, s: 90 };
  const d = DIANAS[s.chute],
    k = Math.min(1, (T - s.t0) / VUELO);
  return { x: b.x + (d.x - b.x) * k, y: b.y + (d.y - b.y) * k - Math.sin(k * Math.PI) * 60, s: 90 - k * 35 };
}

// dondeLupi(): dónde está Lupi: en el centro de la portería o tirándose hacia su lado.
function dondeLupi(): { x: number; y: number; giro: number } {
  const s = PENALTIS_ST,
    l = PORTERIA.lupi;
  if (s.fase !== 'chuta' && s.fase !== 'resultado') return { x: l.x + Math.sin(T * 2) * 20, y: l.y, giro: 0 };
  const k = Math.min(1, (T - s.t0) / (VUELO * 0.9)),
    d = DIANAS[s.portera],
    giro = { izquierda: -0.9, derecha: 0.9, arriba: 0 }[s.portera];
  return { x: l.x + (d.x - l.x) * k * 0.8, y: l.y + (d.y - l.y) * k * 0.8, giro: giro * k };
}

// dibujaPorteria(): la portería con su red.
function dibujaPorteria(): void {
  const p = PORTERIA;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.strokeStyle = 'rgba(120,120,120,.35)';
  ctx.lineWidth = 2;
  Array.from({ length: 16 }, (_, i) => i).forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(p.x + (i * p.w) / 16, p.y);
    ctx.lineTo(p.x + (i * p.w) / 16, p.y + p.h);
    ctx.stroke();
  });
  Array.from({ length: 8 }, (_, i) => i).forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + (i * p.h) / 8);
    ctx.lineTo(p.x + p.w, p.y + (i * p.h) / 8);
    ctx.stroke();
  });
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + p.h);
  ctx.lineTo(p.x, p.y);
  ctx.lineTo(p.x + p.w, p.y);
  ctx.lineTo(p.x + p.w, p.y + p.h);
  ctx.stroke();
  ctx.restore();
}

// dibujaDianas(): mientras se elige, un círculo con su flecha en cada lado al que se puede chutar.
function dibujaDianas(): void {
  ladosPenalti(AGE()).forEach((lado) => {
    const d = DIANAS[lado],
      s = hv('diana:' + lado, hC(d.x, d.y, d.r)),
      giro = { izquierda: Math.PI, derecha: 0, arriba: -Math.PI / 2 }[lado];
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(s, s);
    ctx.globalAlpha = 0.85;
    circ(0, 0, d.r * 0.75, '#FFD66B', 6);
    ctx.rotate(giro);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-6, -30);
    ctx.lineTo(-6, -12);
    ctx.lineTo(-32, -12);
    ctx.lineTo(-32, 12);
    ctx.lineTo(-6, 12);
    ctx.lineTo(-6, 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

SCENES['penaltis'] = {
  music: 'jardin',
  // enter(): una partida nueva; Tito lo explica y pregunta hacia dónde chuta.
  enter(_o: OpcionesEscena) {
    Object.assign(PENALTIS_ST, { fase: 'intro', t0: T, tiros: 0, goles: 0 });
    later(400, () =>
      sayQ('¡A los penaltis! Lupi es la portera. Tú eliges hacia dónde chuto: toca un lado de la portería.', () => {
        if (sigue()) elegir();
      }),
    );
  },
  // update(): el balón llega a la portería. La ayuda automática no sale mientras el balón vuela o Tito habla.
  update() {
    const s = PENALTIS_ST;
    if (s.fase !== 'elige') VIVO.idle = 0;
    if (s.fase === 'chuta' && T - s.t0 >= VUELO) llega();
  },
  // prompt(): repite lo que toca.
  prompt() {
    if (PENALTIS_ST.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else say('Toca un lado de la portería para chutar.');
  },
  // hint(): mientras se elige, un lado de la portería (el primero); al final, el botón de otra vez.
  hint() {
    const s = PENALTIS_ST;
    if (s.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    const lado = ladosPenalti(AGE())[s.tiros % ladosPenalti(AGE()).length] ?? 'izquierda',
      d = DIANAS[lado];
    return s.fase === 'elige' ? { x: d.x, y: d.y, r: d.r } : null;
  },
  // dwell(id): dice el lado que hay bajo el ratón, o qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
    const lado = ladosPenalti(AGE()).find((l) => 'diana:' + l === id);
    if (lado) say({ izquierda: 'Izquierda.', derecha: 'Derecha.', arriba: 'Arriba.' }[lado]);
  },
  // draw(): el patio, la portería con Lupi, las dianas (mientras se elige), el balón, Tito, los tiros y los goles y, al
  // final, el botón de otra vez.
  draw() {
    fondoPatio();
    const s = PENALTIS_ST;
    dibujaPorteria();
    const l = dondeLupi();
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.giro);
    pic('lupi', 0, 0, PORTERIA.lupi.s);
    ctx.restore();
    if (s.fase === 'elige') dibujaDianas();
    const b = dondeBalon();
    sombra(b.x, PORTERIA.balon.y + 30, b.s * 0.6);
    pic('pelota', b.x, b.y, b.s);
    const corre = s.fase === 'chuta' ? Math.min(1, (T - s.t0) / 0.25) : 0;
    drawTito(TITO_P.x - TITO_P.w / 2 + corre * 90, TITO_P.y - (TITO_P.w * 200) / 240, TITO_P.w, { bubble: false });
    dibujaRondas(PENALTIS.tiros, s.tiros);
    card(1250, 130, 220, 80, '#fff', 6, 40);
    pic('pelota', 1300, 170, 54);
    text(fmt('× {n}', { n: String(s.goles) }), 1400, 186, 44);
    if (s.fase === 'resultado' && s.chute !== s.portera) text('¡GOL!', W / 2, 210, 90, '#E8554E');
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; mientras se elige, un lado de la
  // portería chuta hacia allí; si no, chispas.
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
    const s = PENALTIS_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    const lado = ladosPenalti(AGE()).find((l) => dist(x, y, DIANAS[l].x, DIANAS[l].y) < DIANAS[l].r);
    if (s.fase === 'elige' && lado) {
      chutar(lado);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
