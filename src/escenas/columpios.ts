/*
 * escenas/columpios.ts: los columpios, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12a), la escena
 * SCENES.columpios. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts). Tito está sentado en el
 * columpio, que va y viene. Cuando el columpio llega atrás del todo, a este lado (donde está la mano, que brilla), se
 * toca para empujarle: cada empujón a tiempo (empujonBueno, dominio/juegosCortos.ts) le sube un poco más; uno a
 * destiempo no quita nada (Tito avisa de que hay que esperar a que vuelva). Un empujón por vaivén. Con los empujones de
 * su edad (COLUMPIO.empujones) Tito llega arriba del todo, lo celebra y el columpio va frenando; al final, como en los
 * demás juegos del patio, se apunta en S.cole con sus monedas (terminarEnElPatio) y salen el cartel y el botón «Otra
 * vez». La casa vuelve al menú de los juegos cortos.
 * Exporta: COLUMPIO_ST (el estado del columpio, para las pruebas), faseColumpio y pone SCENES.columpios.
 * Importa: el núcleo (dibujo, voz, toque, Tito), las reglas de dominio/juegosCortos.ts, el fondo del patio y lo común del
 * patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, ángulos y tiempos en la pantalla de 1600x900,
   como en el resto de las escenas. */
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
  drawCoinHUD,
  drawHome,
  drawTito,
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
import { COLUMPIO, empujonBueno } from '../dominio/juegosCortos.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Las fases del juego: Tito explica, se empuja, Tito llega arriba (y el columpio frena) o se acaba. */
type FaseColumpio = 'intro' | 'empuja' | 'arriba' | 'fin';

// MEDIDAS: el columpio: dónde cuelga (x e y del palo de arriba), lo largo de las cuerdas, lo que dura un vaivén, el
// ángulo al empezar y arriba del todo, lo que tarda en subir tras un empujón, lo que tarda en frenar al final y el
// tamaño de Tito.
const MEDIDAS = { x: 800, y: 190, cuerda: 420, periodo: 2.2, a0: 0.18, aMax: 1.05, sube: 0.45, frena: 4, tito: 170 };
// FRASES_EMPUJON: lo que dice Tito con cada empujón a tiempo, por turnos.
const FRASES_EMPUJON = ['¡Más alto!', '¡Uy, qué alto!', '¡Otra vez!', '¡Qué bien empujas!'];

// COLUMPIO_ST: el estado del juego: la fase y cuándo empezó, el reloj del vaivén, el ángulo de ahora y al que se va
// (crece poco a poco tras un empujón), los empujones a tiempo, el vaivén del último empujón (uno por vaivén) y cuándo
// avisó Tito por última vez de que había que esperar.
export const COLUMPIO_ST = {
  fase: 'intro' as FaseColumpio,
  t0: 0,
  reloj: 0,
  a: MEDIDAS.a0,
  meta: MEDIDAS.a0,
  hechos: 0,
  vaiven: -1,
  aviso: -9,
};

// faseColumpio(): en qué punto del vaivén está el columpio (de 0 a 1; atrás del todo, a este lado, en 0,25).
export const faseColumpio = (): number => (COLUMPIO_ST.reloj / MEDIDAS.periodo) % 1;
// angulo(): el ángulo del columpio ahora (positivo: hacia la derecha, donde se empuja).
const angulo = (): number => COLUMPIO_ST.a * Math.sin(faseColumpio() * Math.PI * 2);
// asiento(): dónde está el asiento del columpio.
function asiento(): { x: number; y: number } {
  const g = angulo();
  return { x: MEDIDAS.x + Math.sin(g) * MEDIDAS.cuerda, y: MEDIDAS.y + Math.cos(g) * MEDIDAS.cuerda };
}
// empujones(): los empujones que hacen falta con la edad de ahora.
const empujones = (): number => COLUMPIO.empujones[Math.min(5, Math.max(3, AGE()))] ?? 6;
// aTiempo(): ¿es buen momento para empujar ahora (y aún no se ha empujado en este vaivén)?
const aTiempo = (): boolean =>
  COLUMPIO_ST.fase === 'empuja' &&
  empujonBueno(faseColumpio(), AGE()) &&
  Math.floor(COLUMPIO_ST.reloj / MEDIDAS.periodo) !== COLUMPIO_ST.vaiven;
// mano(): dónde está la mano que empuja: donde llega el asiento atrás del todo, con el ángulo de arriba de ahora.
function mano(): { x: number; y: number } {
  const g = COLUMPIO_ST.meta;
  return { x: MEDIDAS.x + Math.sin(g) * MEDIDAS.cuerda + 110, y: MEDIDAS.y + Math.cos(g) * MEDIDAS.cuerda - 30 };
}

// empujar(): se ha tocado para empujar: a tiempo, el columpio sube (y con todos los empujones, Tito llega arriba); a
// destiempo, no pasa nada y Tito avisa (como mucho cada 3 segundos).
function empujar(): void {
  const s = COLUMPIO_ST;
  if (!aTiempo()) {
    SFX.boing();
    if (T - s.aviso > 3) {
      s.aviso = T;
      say('¡Espera a que vuelva hacia ti!');
    }
    return;
  }
  const hechos = s.hechos + 1,
    meta = MEDIDAS.a0 + ((MEDIDAS.aMax - MEDIDAS.a0) * hechos) / empujones();
  Object.assign(s, { hechos, meta, vaiven: Math.floor(s.reloj / MEDIDAS.periodo) });
  SFX.good();
  const m = mano();
  sparkles(m.x, m.y, 10);
  if (hechos < empujones()) {
    say(FRASES_EMPUJON[(hechos - 1) % FRASES_EMPUJON.length] ?? '¡Más alto!');
    return;
  }
  Object.assign(s, { fase: 'arriba', t0: T });
  sayQ('¡Estoy tocando el cielo! ¡Gracias por empujarme tan alto!', () => {
    later(1500, () => {
      if (sceneName === 'columpios' && s.fase === 'arriba') acabar();
    });
  });
}

// acabar(): el columpio ha frenado: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  Object.assign(COLUMPIO_ST, { fase: 'fin', t0: T });
  terminarEnElPatio('columpios', MEDIDAS.x, 500);
  say('¡Qué bien me has columpiado! ¿Jugamos otra vez?');
}

// dibujaColumpio(): el columpio: los postes y el palo de arriba, las cuerdas, el asiento y Tito sentado, que se inclina
// con el vaivén.
function dibujaColumpio(): void {
  const p = asiento(),
    g = angulo();
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#C0533F';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(MEDIDAS.x - 380, 760);
  ctx.lineTo(MEDIDAS.x - 300, MEDIDAS.y);
  ctx.lineTo(MEDIDAS.x + 300, MEDIDAS.y);
  ctx.lineTo(MEDIDAS.x + 380, 760);
  ctx.stroke();
  ctx.strokeStyle = '#7A5A40';
  ctx.lineWidth = 6;
  [-60, 60].forEach((dx) => {
    ctx.beginPath();
    ctx.moveTo(MEDIDAS.x + dx, MEDIDAS.y);
    ctx.lineTo(p.x + dx * Math.cos(g), p.y - dx * Math.sin(g));
    ctx.stroke();
  });
  ctx.restore();
  sombra(p.x, 770, 70);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-g);
  drawTito(-MEDIDAS.tito / 2, -(MEDIDAS.tito * 200) / 240 + 30, MEDIDAS.tito, { bubble: false });
  card(-80, 10, 160, 26, '#8B5E3C', 5, 10);
  ctx.restore();
}

SCENES['columpios'] = {
  music: 'jardin',
  // enter(): una partida nueva: el columpio casi quieto; Tito lo explica y se empieza a empujar.
  enter(_o: OpcionesEscena) {
    Object.assign(COLUMPIO_ST, { fase: 'intro', t0: T, reloj: 0, a: MEDIDAS.a0, meta: MEDIDAS.a0, hechos: 0 });
    Object.assign(COLUMPIO_ST, { vaiven: -1, aviso: -9 });
    later(400, () =>
      sayQ(
        '¡A los columpios! Empújame cuando el columpio llegue hasta la mano. Mueve los brazos, como si empujaras de verdad.',
        () => {
          if (sceneName === 'columpios') COLUMPIO_ST.fase = 'empuja';
        },
      ),
    );
  },
  // update(dt): el vaivén; el ángulo sube poco a poco hasta el de la meta y, arriba del todo, va frenando. La ayuda
  // automática no sale mientras Tito habla o frena (VIVO.idle a 0).
  update(dt: number) {
    const s = COLUMPIO_ST;
    s.reloj += dt;
    if (s.fase === 'arriba') {
      VIVO.idle = 0;
      s.meta = Math.max(MEDIDAS.a0 / 2, s.meta - (MEDIDAS.aMax * dt) / MEDIDAS.frena);
    }
    if (s.fase === 'intro') VIVO.idle = 0;
    s.a += (s.meta - s.a) * Math.min(1, dt / MEDIDAS.sube);
  },
  // prompt(): repite lo que toca.
  prompt() {
    const s = COLUMPIO_ST;
    if (s.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else say('Toca la mano para empujar cuando el columpio llegue hasta ella.');
  },
  // hint(): cuando es buen momento para empujar, la mano; al final, el botón de otra vez.
  hint() {
    if (COLUMPIO_ST.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    const m = mano();
    return aTiempo() ? { x: m.x, y: m.y, r: 90 } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, el columpio con Tito, la mano que empuja (brilla cuando es el momento), los empujones hechos y,
  // al final, el botón de otra vez.
  draw() {
    fondoPatio();
    const s = COLUMPIO_ST;
    dibujaColumpio();
    if (s.fase === 'empuja') {
      const m = mano(),
        brilla = aTiempo();
      circ(m.x, m.y, 70, brilla ? '#FFE27A' : 'rgba(255,255,255,.6)', brilla ? 6 : 0);
      pic('manos', m.x, m.y, brilla ? 110 : 90);
    }
    dibujaRondas(empujones(), s.hechos);
    card(W / 2 - 200, 110, 400, 70, '#fff', 6, 35);
    text('Los columpios', W / 2, 160, 40);
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; mientras se empuja, cualquier toque
  // empuja (a tiempo o no); si no, chispas.
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
    const s = COLUMPIO_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    if (s.fase === 'empuja') {
      empujar();
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
