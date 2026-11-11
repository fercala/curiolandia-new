/*
 * escenas/yoga.ts: el yoga de los animales y el rincón de la calma (idea 13 de docs/IDEAS-MEJORA.md, fase P3), la
 * escena SCENES.yoga, el tercer juego del patio del cole. Tito hace posturas de animales (el gato, el perro, la rana, el
 * árbol...) sobre una esterilla y el niño las imita; el animal se ve en grande en una tarjeta, y un círculo que crece y
 * mengua marca cuándo tomar aire y cuándo soltarlo. Al final, respiraciones guiadas: inflar un globo en la barriga y
 * oler la flor y soplar la vela. Las reglas (qué sale según la edad, cuánto dura cada respiro), en dominio/yoga.ts.
 * Dos modos: desde el patio, la sesión entera (la casa vuelve al patio); y la pausa activa ({pausa: true}), corta, que
 * propone el mapa a los 20 minutos de juego seguido (escenas/zonas.ts) y que al acabar vuelve sola al mapa. Las dos
 * dan monedas la primera vez de cada día (terminarEnElPatio, escenas/patioComun.ts).
 * Exporta: nada; pone SCENES.yoga al cargarse.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito), fondoPatio de escenas/patio.ts, lo común de
 * escenas/patioComun.ts, el azar de los puertos y las reglas de dominio/yoga.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  H,
  S,
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
  inCoinHUD,
  later,
  pic,
  save,
  say,
  sceneName,
  sparkles,
  text,
  tone,
  juntar,
  tr,
  fmt,
} from '../nucleo/indice.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';
import { azar } from '../aplicacion/puertos.ts';
import { type ModoYoga, type PasoYoga, YOGA, planYoga } from '../dominio/yoga.ts';

// Tito, a la izquierda, sobre la esterilla (pies, ancho); la tarjeta con el animal, a la derecha (centro y lado).
const TITO_Y = { x: 470, y: 760, w: 300 };
const ALTO_Y = (TITO_Y.w * 200) / 240;
const TARJETA = { x: 1130, y: 430, lado: 400 };
// BIEN: lo que dice Tito al acabar cada postura.
const BIEN = ['¡Muy bien!', '¡Qué bien lo haces!', '¡Genial! Respiras muy tranquilo.', '¡Estupendo!'];
// CICLO: segundos de un respiro entero (tomar aire y soltarlo).
const CICLO = YOGA.tomarAire + YOGA.soltarAire;

/** Lo que está pasando: presentación, Tito explica el paso, se respira, se celebra, o el final. */
type Fase = 'intro' | 'explica' | 'respira' | 'bien' | 'fin';
/** El estado de la sesión en curso. */
interface EstadoYoga {
  fase: Fase;
  modo: ModoYoga;
  plan: PasoYoga[];
  i: number;
  t0: number;
  respiro: number;
  salto: number;
}
// st: el estado de la sesión en curso (se rehace en enter).
const st: EstadoYoga = { fase: 'intro', modo: 'patio', plan: [], i: 0, t0: 0, respiro: -1, salto: -9 };

// paso(): el paso que toca ahora (o undefined si ya no quedan).
const paso = (): PasoYoga | undefined => st.plan[st.i];

// aire(t): cuánto aire hay en el segundo t del respiro (0 vacío, 1 lleno): sube suave al tomar aire y baja al soltarlo.
function aire(t: number): number {
  const c = t % CICLO,
    subida = Math.min(1, c / YOGA.tomarAire),
    bajada = Math.max(0, (c - YOGA.tomarAire) / YOGA.soltarAire);
  const x = c < YOGA.tomarAire ? subida : 1 - bajada;
  return 0.5 - Math.cos(x * Math.PI) / 2;
}

// tomando(): ¿se está tomando aire ahora (y no soltándolo)?
const tomando = (): boolean => st.fase === 'respira' && (T - st.t0) % CICLO < YOGA.tomarAire;

// explicar(): Tito explica el paso que toca (la postura o la respiración) y, al acabar de hablar, se respira.
function explicar(): void {
  const p = paso()!;
  Object.assign(st, { fase: 'explica', t0: T, respiro: -1 });
  const frase = p.tipo === 'postura' ? p.postura.frase : p.respiracion.frase;
  say(juntar(tr(frase), tr('Respira conmigo.')), () => Object.assign(st, { fase: 'respira', t0: T, respiro: -1 }));
}

// siguiente(): Tito celebra el paso hecho y pasa al siguiente o al final.
function siguiente(): void {
  Object.assign(st, { fase: 'bien', t0: T });
  SFX.good();
  say(BIEN[st.i % BIEN.length]!, () => {
    st.i++;
    if (paso()) explicar();
    else fin();
  });
}

// fin(): la sesión ha terminado: se apunta en S.cole con sus monedas y Tito se despide; en la pausa activa, luego se
// vuelve solo al mapa.
function fin(): void {
  Object.assign(st, { fase: 'fin', t0: T });
  terminarEnElPatio('yoga', TITO_Y.x, TITO_Y.y - ALTO_Y);
  if (st.modo === 'pausa') {
    say('¡Qué bien! Ya tenemos energía para seguir jugando.', () =>
      later(800, () => {
        if (sceneName === 'yoga') go('map');
      }),
    );
  } else say('¡Qué tranquilos estamos! Has hecho yoga como los animales. ¿Lo hacemos otra vez?');
}

// dibujaCalma(): el rincón de la calma: el patio con un velo azul suave y la esterilla debajo de Tito.
function dibujaCalma(): void {
  fondoPatio();
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#9EC9F5';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(TITO_Y.x, TITO_Y.y + 10, 260, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#B98CE0';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#5A3B7A';
  ctx.stroke();
  ctx.restore();
}

/** Cómo está Tito: desplazamiento, giro y escalas. */
interface PoseTito {
  dy: number;
  rot: number;
  sx: number;
  sy: number;
}
// FORMAS: cómo se pone Tito en cada forma de postura (se agacha, se estira, se inclina, a la pata coja, hecho una bola).
const FORMAS: Readonly<Record<string, PoseTito>> = {
  agacha: { dy: 0, rot: 0, sx: 1.1, sy: 0.8 },
  estira: { dy: -8, rot: -0.06, sx: 0.96, sy: 1.08 },
  inclina: { dy: 0, rot: 0.28, sx: 1, sy: 0.95 },
  pata: { dy: -30, rot: 0.08, sx: 1, sy: 1.02 },
  bola: { dy: 0, rot: 0, sx: 1.12, sy: 0.66 },
};

// dibujaTito(): Tito en la esterilla: con la postura puesta mientras se respira (y se hincha un poco al tomar aire), y
// dando saltitos al celebrar.
function dibujaTito(): void {
  const p = paso(),
    enPostura = p?.tipo === 'postura' && (st.fase === 'respira' || st.fase === 'explica'),
    base = enPostura ? FORMAS[p.postura.forma]! : { dy: 0, rot: 0, sx: 1, sy: 1 },
    a = st.fase === 'respira' ? aire(T - st.t0) : 0,
    tambaleo = enPostura && p.postura.forma === 'pata' ? Math.sin(T * 2.4) * 0.03 : 0,
    salto = Math.max(0, 1 - (T - st.salto) * 3),
    contento = st.fase === 'bien' || st.fase === 'fin' ? Math.abs(Math.sin((T - st.t0) * 6)) * 30 : 0,
    dy = base.dy - contento - Math.sin(salto * Math.PI) * 60;
  sombra(TITO_Y.x, TITO_Y.y, TITO_Y.w * 0.42);
  ctx.save();
  ctx.translate(TITO_Y.x, TITO_Y.y + dy);
  ctx.rotate(base.rot + tambaleo);
  ctx.scale(base.sx * (1 + a * 0.04), base.sy * (1 + a * 0.05));
  drawTito(-TITO_Y.w / 2, -ALTO_Y, TITO_Y.w, { sleep: st.fase === 'respira' && !tomando(), bubble: false });
  ctx.restore();
}

// dibujaTarjeta(): la tarjeta de la derecha: el animal de la postura (con un aro que crece al tomar aire y mengua al
// soltarlo), el globo que se hincha, o la flor (al tomar aire, con su olor) y la vela (al soltarlo, la llama se dobla).
function dibujaTarjeta(): void {
  const p = paso();
  if (!p || st.fase === 'intro' || st.fase === 'fin') return;
  const { x, y, lado } = TARJETA,
    a = st.fase === 'respira' ? aire(T - st.t0) : 0;
  card(x - lado / 2, y - lado / 2, lado, lado, '#fff', 7, 40);
  if (st.fase === 'respira') {
    ctx.save();
    ctx.globalAlpha = 0.35;
    circ(x, y, 90 + a * 90, '#9EC9F5', 0);
    ctx.restore();
  }
  if (p.tipo === 'postura') pic(p.postura.dibujo, x, y, 280);
  else if (p.respiracion.dibujo === 'globo') pic('globo', x, y - 10, 150 + a * 170);
  else if (tomando() || st.fase !== 'respira') dibujaFlor(x, y);
  else dibujaVela(x, y, a);
  if (st.fase === 'respira') {
    const n = Math.floor((T - st.t0) / CICLO) + 1;
    text(tomando() ? 'Toma aire...' : 'Suelta el aire...', x, y + lado / 2 + 70, 46, '#3E5C8A');
    text(fmt('{n} de {total}', { n, total: p.respiros }), x, y - lado / 2 - 24, 34, '#3E5C8A');
  }
}

// dibujaFlor(x, y): la flor de oler, con su olor subiendo en curvitas.
function dibujaFlor(x: number, y: number): void {
  pic('flor', x, y + 20, 260);
  ctx.save();
  ctx.strokeStyle = '#E58CC0';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  [-50, 0, 50].forEach((dx, i) => {
    const s = (T * 0.6 + i * 0.33) % 1;
    ctx.globalAlpha = 1 - s;
    ctx.beginPath();
    ctx.moveTo(x + dx, y - 90 - s * 80);
    ctx.quadraticCurveTo(x + dx + 18, y - 110 - s * 80, x + dx, y - 130 - s * 80);
    ctx.stroke();
  });
  ctx.restore();
}

// dibujaVela(x, y, a): la vela de soplar: la llama se dobla más cuanto más aire se suelta (a baja de 1 a 0), sin
// apagarse, y salen rayitas de viento.
function dibujaVela(x: number, y: number, a: number): void {
  const fuerza = 1 - a;
  ctx.save();
  ctx.fillStyle = '#FFE7A8';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 6;
  ctx.fillRect(x - 30, y - 20, 60, 160);
  ctx.strokeRect(x - 30, y - 20, 60, 160);
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y - 40);
  ctx.stroke();
  ctx.translate(x, y - 40);
  ctx.rotate(fuerza * 0.9);
  ctx.beginPath();
  ctx.ellipse(0, -30, 18 - fuerza * 4, 34 - fuerza * 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFB13B';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#9EC9F5';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.globalAlpha = fuerza;
  [-30, 0, 30].forEach((dy) => {
    ctx.beginPath();
    ctx.moveTo(x - 170, y - 70 + dy);
    ctx.lineTo(x - 90, y - 70 + dy);
    ctx.stroke();
  });
  ctx.restore();
}

SCENES['yoga'] = {
  music: null,
  // enter(o): empieza una sesión nueva: entera desde el patio, o corta si o.pausa (la pausa activa); Tito la presenta
  // (la primera vez, con la explicación larga, S.first.yoga) y empieza el primer paso.
  enter(o: OpcionesEscena) {
    const modo: ModoYoga = o?.pausa ? 'pausa' : 'patio';
    Object.assign(st, { fase: 'intro', modo, plan: planYoga(AGE(), modo, azar), i: 0, t0: T, respiro: -1, salto: -9 });
    const primera = !S.first['yoga'];
    if (primera) {
      S.first['yoga'] = 1;
      save();
    }
    const intro =
      modo === 'pausa'
        ? '¡Vamos a estirarnos como los animales! Ponte de pie, con espacio a tu alrededor.'
        : '¡Bienvenido al rincón de la calma! Vamos a hacer yoga como los animales. Despacito y respirando tranquilos.';
    later(400, () =>
      say(primera ? juntar(tr(intro), tr('Mira lo que hago y hazlo conmigo.')) : intro, () => explicar()),
    );
  },
  // update(): mientras se respira, un sonido suave al empezar a tomar aire y otro al soltarlo; al acabar los respiros
  // del paso, se celebra. La ayuda automática no sale (VIVO.idle a 0).
  update() {
    VIVO.idle = 0;
    if (st.fase !== 'respira') return;
    const p = paso()!,
      t = T - st.t0,
      medio = Math.floor((t / CICLO) * 2);
    if (medio !== st.respiro) {
      st.respiro = medio;
      if (medio < p.respiros * 2) tone(medio % 2 ? 330 : 440, 0.6, 'sine', 0.12, 0.8);
    }
    if (t >= p.respiros * CICLO) siguiente();
  },
  // prompt(): repite lo que toca hacer.
  prompt() {
    if (st.fase === 'fin')
      say(st.modo === 'pausa' ? 'Ahora volvemos al mapa.' : 'Toca la flecha para hacerlo otra vez.');
    else say('Mira a Tito y respira despacito.');
  },
  // hint(): al final de la sesión del patio, el botón de otra vez; mientras tanto, nada.
  hint() {
    return st.fase === 'fin' && st.modo === 'patio' ? { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el rincón de la calma, los pasos, Tito, la tarjeta y, al final del patio, el botón de otra vez.
  draw() {
    dibujaCalma();
    dibujaRondas(st.plan.length, st.i);
    dibujaTito();
    dibujaTarjeta();
    if (st.fase === 'fin' && st.modo === 'patio') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el patio (en la pausa activa, el mapa); monedas -> tienda; al final, otra vez -> otra sesión;
  // Tito -> saltito; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go(st.modo === 'pausa' ? 'map' : 'patio');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (st.fase === 'fin' && st.modo === 'patio' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    if (dist(x, y, TITO_Y.x, TITO_Y.y - ALTO_Y / 2) < TITO_Y.w / 2) {
      SFX.boing();
      st.salto = T;
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
