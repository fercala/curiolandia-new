/*
 * escenas/titoDice.ts: «Tito dice» (idea 12 de docs/IDEAS-MEJORA.md, fase P2), la escena SCENES.titoDice, el segundo
 * juego del patio del cole. Otro juego para moverse de verdad: Tito da una orden («Tito dice: ¡salta tres veces!»,
 * «Tito dice: ¡tócate la nariz!») y el niño la hace; a la derecha, un niño dibujado (drawKid) la hace a la vez, con la
 * parte del cuerpo iluminada, y las órdenes de contar cuentan en grande. Desde los 4 años hay trampas: si Tito no dice
 * «Tito dice» antes, no hay que hacerlo (el niño dibujado se queda quieto con una interrogación y Tito se ríe: «¡Te
 * pillé!»). Las trampas nunca son las dos primeras órdenes ni van seguidas. Son 6 órdenes con 3 años (sin trampas), 8
 * con 4 (2 trampas) y 8 con 5 (3 trampas). No se comprueba nada: se confía y se celebra. Al acabar, monedas la primera
 * vez de cada día (terminarEnElPatio, escenas/patioComun.ts) y los botones «Otra vez» y la casa (vuelve al patio).
 * Exporta: ORDENES y planDeOrdenes, y pone SCENES.titoDice al cargarse.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito), drawKid de juegos/, fondoPatio de escenas/patio.ts, lo común de
 * escenas/patioComun.ts, el azar de los puertos y las reglas del plan (planTitoDice, dominio/titoDice.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  S,
  SCENES,
  SFX,
  T,
  VIVO,
  atHome,
  burst,
  card,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  go,
  inCoinHUD,
  later,
  save,
  say,
  sparkles,
  text,
  tone,
  fmt,
  juntar,
  tr,
} from '../nucleo/indice.ts';
import { drawKid } from '../juegos/indice.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';
import { azar } from '../aplicacion/puertos.ts';
import { planTitoDice } from '../dominio/titoDice.ts';

/** Cómo se mueve el niño dibujado (y Tito) al hacer una orden. */
type Gesto = 'salta' | 'aplaude' | 'toca' | 'agacha' | 'gira' | 'estira' | 'marcha' | 'pata';
/** Una orden: lo que dice Tito (sin «Tito dice», con signos de exclamación y en minúscula), el gesto, la parte del
 * cuerpo que se ilumina (id de las partes de drawKid) y cuántas veces se cuenta (0: no se cuenta). */
interface Orden {
  readonly id: string;
  readonly frase: string;
  readonly gesto: Gesto;
  readonly parte?: string;
  readonly veces: number;
}
/** Una orden del plan de una partida: cuál es y si es trampa (sin «Tito dice»). */
interface PasoPlan {
  readonly orden: Orden;
  readonly trampa: boolean;
}

// ORDENES: todas las órdenes; cada partida coge unas cuantas al azar, sin repetir.
export const ORDENES: readonly Orden[] = [
  { id: 'salta', frase: '¡salta tres veces!', gesto: 'salta', veces: 3 },
  { id: 'palmas', frase: '¡da cuatro palmadas!', gesto: 'aplaude', parte: 'manos', veces: 4 },
  { id: 'nariz', frase: '¡tócate la nariz!', gesto: 'toca', parte: 'nariz', veces: 0 },
  { id: 'cabeza', frase: '¡tócate la cabeza!', gesto: 'toca', parte: 'cabeza', veces: 0 },
  { id: 'orejas', frase: '¡tócate las orejas!', gesto: 'toca', parte: 'orejas', veces: 0 },
  { id: 'barriga', frase: '¡tócate la barriga!', gesto: 'toca', parte: 'barriga', veces: 0 },
  { id: 'pies', frase: '¡tócate los pies!', gesto: 'agacha', parte: 'pies', veces: 0 },
  { id: 'bolita', frase: '¡agáchate como una bolita!', gesto: 'agacha', veces: 0 },
  { id: 'vuelta', frase: '¡da una vuelta!', gesto: 'gira', veces: 0 },
  { id: 'brazos', frase: '¡levanta los brazos!', gesto: 'estira', parte: 'brazos', veces: 0 },
  { id: 'marcha', frase: '¡marcha como un soldado!', gesto: 'marcha', parte: 'piernas', veces: 0 },
  { id: 'pataCoja', frase: '¡ponte a la pata coja!', gesto: 'pata', parte: 'piernas', veces: 0 },
  { id: 'ojos', frase: '¡cierra los ojos!', gesto: 'toca', parte: 'ojos', veces: 0 },
  { id: 'boca', frase: '¡abre mucho la boca!', gesto: 'toca', parte: 'boca', veces: 0 },
  { id: 'pisotones', frase: '¡da cinco pisotones!', gesto: 'marcha', parte: 'pies', veces: 5 },
];
// BIEN: lo que dice Tito después de una orden de verdad. PILLADO: después de una trampa.
const BIEN = ['¡Eso es!', '¡Muy bien!', '¡Genial!', '¡Así se hace!'];
const PILLADO = '¡Je, je! No he dicho «Tito dice». Si no te has movido, ¡muy bien!';
// INTRO: cómo explica Tito el juego: con 3 años (sin trampas), la primera vez con trampas, y las demás.
const INTRO = {
  peque: '¡Vamos a jugar a «Tito dice»! Escucha bien y haz lo que diga Tito. ¡Yo lo hago contigo!',
  primera:
    '¡Vamos a jugar a «Tito dice»! Haz lo que yo diga, pero solo si antes digo «Tito dice». Si no lo digo, ¡no te muevas! ¡Atento, que a veces hago trampa!',
  otra: '¡A jugar a «Tito dice»! Solo vale si digo «Tito dice».',
};
// Tito, a la izquierda (pies, ancho); el niño dibujado, a la derecha (pies, escala). TIEMPOS: segundos para hacer cada
// orden (con 3 años, un poco más) y entre cuenta y cuenta.
const TITO_D = { x: 470, y: 780, w: 300 };
const ALTO_D = (TITO_D.w * 200) / 240;
const NINO = { x: 1150, y: 830, s: 0.92 };
const TIEMPOS = { orden: 3.2, orden3: 4, cuenta: 0.8 };

// planDeOrdenes(edad, r): el plan de una partida para esa edad (las reglas, en dominio/titoDice.ts): las órdenes que
// salen y cuáles son trampa. r() da números al azar entre 0 y 1.
export function planDeOrdenes(edad: number, r: () => number): PasoPlan[] {
  return planTitoDice(ORDENES.length, edad, r).map((p) => ({ orden: ORDENES[p.orden]!, trampa: p.trampa }));
}

// conMayuscula(f): la frase de una orden con la primera letra en mayúscula (después del «¡»), para cuando Tito la dice
// sin «Tito dice» delante.
const conMayuscula = (f: string): string => f.charAt(0) + f.charAt(1).toUpperCase() + f.slice(2);

/** Lo que está pasando: presentación, Tito dice la orden, se hace, se celebra, o el final. */
type Fase = 'intro' | 'dice' | 'hace' | 'bien' | 'fin';
/** El estado de la partida en curso. */
interface EstadoTitoDice {
  fase: Fase;
  plan: PasoPlan[];
  i: number;
  t0: number;
  dur: number;
  salto: number;
  cuenta: number;
}
// st: el estado de la partida en curso (se rehace en enter).
const st: EstadoTitoDice = { fase: 'intro', plan: [], i: 0, t0: 0, dur: 9e9, salto: -9, cuenta: -1 };

// paso(): la orden que toca ahora (o undefined si ya no quedan).
const paso = (): PasoPlan | undefined => st.plan[st.i];

// decir(): Tito dice la orden que toca («Tito dice: ...» o, si es trampa, solo la orden) y, al acabar de hablar, se
// hace: el niño dibujado la hace durante unos segundos (si es trampa, se queda quieto).
function decir(): void {
  const p = paso()!;
  Object.assign(st, { fase: 'dice', t0: T, dur: 9e9 });
  // la orden, en el idioma del juego; juntar la apunta como ya traducida (con su mayúscula, no se vuelve a traducir)
  const orden = tr(p.orden.frase);
  say(p.trampa ? juntar(conMayuscula(orden)) : fmt('Tito dice: {orden}', { orden }), () => {
    const cuenta = p.orden.veces * TIEMPOS.cuenta + 0.6;
    Object.assign(st, {
      fase: 'hace',
      t0: T,
      dur: p.trampa ? 2.2 : Math.max(AGE() <= 3 ? TIEMPOS.orden3 : TIEMPOS.orden, cuenta),
    });
  });
}

// celebrar(): después de hacer la orden, Tito celebra (o, si era trampa, se ríe porque no dijo «Tito dice») y pasa a la
// siguiente orden o al final.
function celebrar(): void {
  const p = paso()!;
  Object.assign(st, { fase: 'bien', t0: T, dur: 9e9 });
  if (p.trampa) tone(700, 0.3, 'triangle', 0.2, 0.6);
  else SFX.good();
  burst(TITO_D.x, TITO_D.y - ALTO_D, 20);
  say(p.trampa ? PILLADO : BIEN[st.i % BIEN.length]!, () => {
    st.i++;
    if (paso()) decir();
    else fin();
  });
}

// fin(): la partida ha terminado: se apunta en S.cole con sus monedas y Tito se despide.
function fin(): void {
  Object.assign(st, { fase: 'fin', t0: T });
  terminarEnElPatio('titoDice', TITO_D.x, TITO_D.y - ALTO_D);
  say('¡Qué bien escuchas! Has hecho todo lo que dice Tito. ¿Jugamos otra vez?');
}

/** Cómo está el niño dibujado en un momento: desplazamiento, giro, escalas y la parte que brilla. */
interface PoseNino {
  dx: number;
  dy: number;
  rot: number;
  sx: number;
  sy: number;
}

// poseNino(g, t): cómo se mueve el niño dibujado con el gesto g en el segundo t desde que empezó.
function poseNino(g: Gesto, t: number): PoseNino {
  const q = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 },
    b = t * Math.PI * 2 * (1 / TIEMPOS.cuenta);
  if (g === 'salta') return { ...q, dy: -Math.abs(Math.sin(b / 2)) * 120 };
  if (g === 'aplaude') return { ...q, dy: -Math.abs(Math.sin(b / 2)) * 10, sx: 1 + Math.abs(Math.sin(b / 2)) * 0.04 };
  if (g === 'agacha') return { ...q, sy: 0.72, sx: 1.08 };
  if (g === 'gira') return { ...q, sx: Math.cos(Math.min(1, t / 1.6) * Math.PI * 2) };
  if (g === 'estira') return { ...q, sy: 1.06, dy: -10 };
  if (g === 'marcha') return { ...q, dy: -Math.abs(Math.sin(b / 2)) * 25, rot: Math.sin(b / 2) * 0.05 };
  if (g === 'pata') return { ...q, rot: 0.12 + Math.sin(t * 5) * 0.04 };
  return q; // toca: quieto, con la parte iluminada
}

// dibujaNino(): el niño dibujado a la derecha: mientras se hace una orden de verdad, la hace (con la parte del cuerpo
// iluminada y, si se cuenta, el número en grande); si es trampa, quieto con una interrogación; si no, quieto.
function dibujaNino(): void {
  const p = paso(),
    haciendo = st.fase === 'hace' && p && !p.trampa,
    t = T - st.t0,
    pose = haciendo ? poseNino(p.orden.gesto, t) : { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
  sombra(NINO.x, NINO.y, 110 * (1 + pose.dy / 600));
  ctx.save();
  ctx.translate(NINO.x + pose.dx, NINO.y + pose.dy);
  ctx.rotate(pose.rot);
  ctx.scale(pose.sx, pose.sy);
  drawKid(0, 0, NINO.s, { hl: haciendo || st.fase === 'dice' ? p?.orden.parte : undefined, shirt: '#FFD66B' });
  ctx.restore();
  if (haciendo && p.orden.veces) {
    const n = Math.min(p.orden.veces, Math.floor(t / TIEMPOS.cuenta) + 1);
    card(NINO.x + 170, 300, 150, 150, '#fff', 6, 75);
    text(String(n), NINO.x + 245, 410, 110, '#E8554E');
  }
  if (st.fase === 'hace' && p?.trampa) {
    card(NINO.x + 150, 260, 120, 120, '#fff', 6, 60);
    text('?', NINO.x + 210, 355, 100, '#5B8DEF');
  }
}

// dibujaTito(): Tito a la izquierda: hace la orden a la vez que el niño (salta, se agacha, gira...), se queda quieto en
// las trampas, y salta de contento al celebrar.
function dibujaTito(): void {
  const p = paso();
  let pose = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
  if (st.fase === 'hace' && p && !p.trampa) pose = poseNino(p.orden.gesto, T - st.t0);
  else if (st.fase === 'bien' || st.fase === 'fin') pose.dy = -Math.abs(Math.sin((T - st.t0) * 7)) * 40;
  const salto = Math.max(0, 1 - (T - st.salto) * 3);
  pose.dy -= Math.sin(salto * Math.PI) * 60;
  sombra(TITO_D.x + pose.dx, TITO_D.y, TITO_D.w * 0.42 * (1 + pose.dy / 600));
  ctx.save();
  ctx.translate(TITO_D.x + pose.dx, TITO_D.y - ALTO_D / 2 + pose.dy);
  ctx.rotate(pose.rot);
  ctx.scale(pose.sx, pose.sy);
  drawTito(-TITO_D.w / 2, -ALTO_D / 2, TITO_D.w, {
    sleep: st.fase === 'hace' && p?.orden.id === 'ojos' && !p.trampa,
    bubble: false,
  });
  ctx.restore();
}

// dibujaCartel(): arriba, lo que se está diciendo: «Tito dice» en verde si la orden es de verdad (en las trampas no sale,
// para que el niño tenga que escuchar).
function dibujaCartel(): void {
  const p = paso();
  if (!p || (st.fase !== 'dice' && st.fase !== 'hace') || p.trampa) return;
  card(TITO_D.x - 150, 200, 300, 70, '#7CC86E', 6, 35);
  text('Tito dice', TITO_D.x, 250, 40, '#fff');
}

SCENES['titoDice'] = {
  music: null,
  // enter(): empieza una partida nueva con su plan de órdenes (planDeOrdenes, con la edad); Tito explica el juego (la
  // explicación larga, la primera vez, S.first.titoDice; con 3 años, sin trampas, otra más corta) y empieza.
  enter(_o: OpcionesEscena) {
    Object.assign(st, {
      fase: 'intro',
      plan: planDeOrdenes(AGE(), azar),
      i: 0,
      t0: T,
      dur: 9e9,
      salto: -9,
      cuenta: -1,
    });
    const primera = !S.first['titoDice'];
    if (primera) {
      S.first['titoDice'] = 1;
      save();
    }
    const conTrampas = primera ? INTRO.primera : INTRO.otra,
      intro = AGE() <= 3 ? INTRO.peque : conTrampas;
    later(400, () => say(intro, () => decir()));
  },
  // update(): cuando se acaba el tiempo de hacer la orden, se celebra; las órdenes de contar hacen un pitido en cada
  // número. La ayuda automática no sale: el juego avanza solo (VIVO.idle a 0).
  update() {
    VIVO.idle = 0;
    if (st.fase !== 'hace') return;
    const p = paso()!,
      t = T - st.t0;
    if (!p.trampa && p.orden.veces) {
      const n = Math.floor(t / TIEMPOS.cuenta);
      if (n < p.orden.veces && n !== st.cuenta) {
        st.cuenta = n;
        tone(523 + n * 80, 0.12, 'triangle', 0.25);
      }
    }
    if (t > st.dur) {
      st.cuenta = -1;
      celebrar();
    }
  },
  // prompt(): repite lo que toca hacer.
  prompt() {
    if (st.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else say('Escucha bien a Tito.');
  },
  // hint(): al final, el botón de otra vez; mientras se juega, nada.
  hint() {
    return st.fase === 'fin' ? { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, las rondas, el cartel «Tito dice», Tito, el niño dibujado y, al final, el botón de otra vez.
  draw() {
    fondoPatio();
    dibujaRondas(st.plan.length, st.i);
    dibujaCartel();
    dibujaTito();
    dibujaNino();
    if (st.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el patio; monedas -> tienda; al final, otra vez -> otra partida; Tito -> saltito; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('patio');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (st.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    if (dist(x, y, TITO_D.x, TITO_D.y - ALTO_D / 2) < TITO_D.w / 2) {
      SFX.boing();
      st.salto = T;
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
