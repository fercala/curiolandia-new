/*
 * escenas/cometa.ts: la cometa, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12c), la escena
 * SCENES.cometa. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts). Tito está en el prado con la
 * cuerda y la cometa vuela hacia donde se toca o se arrastra el dedo. Hay que llevarla hasta las estrellas del cielo, de
 * una en una (planCometa, dominio/juegosCortos.ts), sin que toque los árboles. El viento la empuja hacia un lado y
 * cambia cada pocos segundos (vientoEn: más fuerte con los mayores); se ve en las rayas del cielo y Tito lo avisa. Si
 * la cometa toca un árbol, rebota hacia fuera y Tito avisa, sin quitar nada. Con todas las estrellas, como en los demás
 * juegos del patio, se apunta en S.cole con sus monedas (terminarEnElPatio) y salen el cartel y el botón «Otra vez». La
 * casa vuelve al menú de los juegos cortos. Practica llevar el dedo con cuidado (motricidad fina).
 * Exporta: COMETA_ST (el estado de la partida, para las pruebas) y pone SCENES.cometa.
 * Importa: el núcleo (dibujo, voz, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de
 * dominio/juegosCortos.ts y lo común del patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, velocidades y tiempos en la pantalla de
   1600x900, como en el resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  H,
  SCENES,
  SFX,
  T,
  VIVO,
  W,
  atHome,
  card,
  cloud,
  ctx,
  dist,
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
  sky,
  sparkles,
  star,
  text,
  tone,
  tree,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { ARBOLES_COMETA, COMETA, planCometa, tocaArbol, vientoEn, type Punto } from '../dominio/juegosCortos.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, terminarEnElPatio } from './patioComun.ts';

/** Las fases: Tito explica, la cometa vuela o se acaba. */
type FaseCometa = 'intro' | 'vuela' | 'fin';

// MEDIDAS: dónde está Tito (esquina de arriba a la izquierda y ancho) y su mano con la cuerda, lo rápido que va la
// cometa hacia el dedo, por dónde puede volar, lo que se aparta de un árbol al tocarlo, el tamaño de la cometa y dónde
// empieza.
const MEDIDAS = {
  tito: { x: 700, y: 650, w: 190 },
  mano: { x: 860, y: 730 },
  rapido: 520,
  zona: { x0: 70, x1: W - 70, y0: 120, y1: 660 },
  rebota: 40,
  cometa: 140,
  inicio: { x: 800, y: 380 },
};
// FRASES_ESTRELLA: lo que dice Tito al coger cada estrella, por turnos.
const FRASES_ESTRELLA = ['¡Una estrella!', '¡Qué bien vuela!', '¡Otra más!', '¡Muy bien llevada!'];

// COMETA_ST: el estado de la partida: la fase, el reloj del viento, las estrellas y las cogidas, dónde está la cometa
// y hacia dónde va (el dedo), si se está arrastrando, los lados del viento, el tramo de viento de ahora y cuándo avisó
// Tito de un árbol.
export const COMETA_ST = {
  fase: 'intro' as FaseCometa,
  reloj: 0,
  estrellas: [] as Punto[],
  cogidas: 0,
  x: MEDIDAS.inicio.x,
  y: MEDIDAS.inicio.y,
  tx: MEDIDAS.inicio.x,
  ty: MEDIDAS.inicio.y,
  arrastra: false,
  lados: [1] as number[],
  tramo: 0,
  aviso: -9,
};

// sigue(): ¿se sigue en la escena de la cometa? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'cometa';
// estrella(): la estrella que hay que coger ahora.
const estrella = (): Punto | undefined => COMETA_ST.estrellas[COMETA_ST.cogidas];
// viento(): el viento de ahora (píxeles por segundo; positivo, hacia la derecha).
const viento = (): number => vientoEn(COMETA_ST.reloj, AGE(), COMETA_ST.lados);

// fuera(p, holgura): el punto p, dentro de la zona de vuelo y, si cae en un árbol, apartado de su copa hasta su borde
// (más holgura).
function fuera(p: Punto, holgura: number): Punto {
  const z = MEDIDAS.zona,
    q = { x: Math.min(z.x1, Math.max(z.x0, p.x)), y: Math.min(z.y1, Math.max(z.y0, p.y)) },
    a = tocaArbol(q, holgura);
  if (!a) return q;
  const d = Math.max(1, Math.hypot(q.x - a.x, q.y - a.y)),
    r = a.r + holgura + 1;
  return { x: a.x + ((q.x - a.x) / d) * r, y: a.y + ((q.y - a.y) / d) * r };
}

// apuntar(x, y): la cometa va hacia (x, y) (apartado de los árboles, para que no se meta en ellos).
function apuntar(x: number, y: number): void {
  const p = fuera({ x, y }, MEDIDAS.rebota);
  Object.assign(COMETA_ST, { tx: p.x, ty: p.y });
}

// volar(dt): la cometa va hacia el dedo y el viento la empuja (sin el dedo encima, el viento se la va llevando); si toca
// un árbol, rebota hacia fuera y Tito avisa (como mucho cada 3 segundos). Al cambiar el viento de lado, Tito lo dice.
function volar(dt: number): void {
  const s = COMETA_ST;
  s.reloj += dt;
  const tramo = Math.floor(s.reloj / COMETA.cambia);
  if (tramo !== s.tramo) {
    s.tramo = tramo;
    say(viento() > 0 ? '¡El viento sopla hacia la derecha!' : '¡El viento sopla hacia la izquierda!');
  }
  if (!s.arrastra) apuntar(s.tx + viento() * dt * 0.6, s.ty);
  const d = Math.hypot(s.tx - s.x, s.ty - s.y),
    paso = Math.min(d, MEDIDAS.rapido * dt),
    k = d > 0 ? paso / d : 0,
    libre = { x: s.x + (s.tx - s.x) * k + viento() * dt, y: s.y + (s.ty - s.y) * k },
    toca = tocaArbol(libre, 30),
    p = fuera(libre, toca ? MEDIDAS.rebota : 0);
  Object.assign(s, { x: p.x, y: p.y });
  if (toca) {
    if (T - s.aviso > 3) {
      s.aviso = T;
      SFX.boing();
      say('¡Cuidado con el árbol!');
    }
    apuntar(s.tx, s.ty - 60);
  }
  coger();
}

// coger(): si la cometa pasa por la estrella de ahora, la coge (con todas, se acaba).
function coger(): void {
  const s = COMETA_ST,
    e = estrella();
  if (!e || dist(s.x, s.y, e.x, e.y) > COMETA.coge) return;
  s.cogidas++;
  SFX.good();
  tone(700 + s.cogidas * 70, 0.12, 'sine', 0.3);
  sparkles(e.x, e.y, 14);
  if (s.cogidas < s.estrellas.length) {
    say(FRASES_ESTRELLA[(s.cogidas - 1) % FRASES_ESTRELLA.length] ?? '¡Una estrella!');
    return;
  }
  acabar();
}

// acabar(): se han cogido todas las estrellas: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  COMETA_ST.fase = 'fin';
  COMETA_ST.arrastra = false;
  terminarEnElPatio('cometa', W / 2, 420);
  say('¡Qué bien has llevado la cometa! Has cogido todas las estrellas. ¿Jugamos otra vez?');
}

// dibujaFondo(): el cielo con nubes que van con el viento, las rayas del viento, el prado y los árboles (sus copas son
// las de ARBOLES_COMETA).
function dibujaFondo(): void {
  sky('#A9DBFA', '#E9F7FF');
  const v = viento(),
    mueve = COMETA_ST.reloj * v * 0.25;
  [
    [120, 140, 0.9],
    [620, 90, 0.7],
    [1150, 160, 1],
  ].forEach(([x, y, s]) => cloud((((((x ?? 0) + mueve) % (W + 300)) + W + 300) % (W + 300)) - 150, y ?? 0, s ?? 1));
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.75)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  [230, 330, 430, 520].forEach((y, i) => {
    const x = ((((i * 410 + COMETA_ST.reloj * v * 2.2) % (W + 200)) + W + 200) % (W + 200)) - 100;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.sign(v || 1) * 110, y);
    ctx.stroke();
  });
  ctx.restore();
  ctx.fillStyle = '#9ED67F';
  ctx.beginPath();
  ctx.moveTo(0, 700);
  ctx.quadraticCurveTo(W / 2, 600, W, 700);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ARBOLES_COMETA.forEach((a, i) => {
    const s = a.r / 74;
    tree(a.x, a.y + 80 * s, s, i % 2 ? 'primavera' : 'verano');
  });
}

// dibujaCometa(): la cuerda desde la mano de Tito y la cometa, que se inclina con el viento y se mece un poco.
function dibujaCometa(): void {
  const s = COMETA_ST,
    m = MEDIDAS.mano;
  ctx.save();
  ctx.strokeStyle = '#6B5B4B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.quadraticCurveTo((m.x + s.x) / 2, Math.max(m.y, s.y) + 40, s.x, s.y + 30);
  ctx.stroke();
  ctx.translate(s.x, s.y);
  ctx.rotate(viento() / 500 + Math.sin(T * 2.5) * 0.06);
  pic('cometa', 0, 0, MEDIDAS.cometa);
  ctx.restore();
}

SCENES['cometa'] = {
  music: 'jardin',
  // enter(): una partida nueva con sus estrellas (planCometa) y el viento, que empieza hacia un lado al azar y va
  // cambiando; Tito lo explica y la cometa empieza a volar.
  enter(_o: OpcionesEscena) {
    const primero = azar() < 0.5 ? 1 : -1;
    Object.assign(COMETA_ST, { fase: 'intro', reloj: 0, estrellas: planCometa(AGE(), azar), cogidas: 0 });
    Object.assign(COMETA_ST, { x: MEDIDAS.inicio.x, y: MEDIDAS.inicio.y, tx: MEDIDAS.inicio.x, ty: MEDIDAS.inicio.y });
    Object.assign(COMETA_ST, {
      arrastra: false,
      lados: Array.from({ length: 12 }, (_, i) => (i % 2 ? -primero : primero)),
      tramo: 0,
      aviso: -9,
    });
    later(400, () =>
      sayQ(
        '¡Vamos a volar la cometa! Llévala con el dedo hasta las estrellas, sin que toque los árboles. ¡Cuidado con el viento!',
        () => {
          if (sigue()) COMETA_ST.fase = 'vuela';
        },
      ),
    );
  },
  // update(dt): mientras se juega, la cometa vuela; si no, solo se mece. La ayuda automática no sale mientras Tito
  // explica.
  update(dt: number) {
    if (COMETA_ST.fase === 'intro') VIVO.idle = 0;
    if (COMETA_ST.fase === 'vuela') volar(dt);
  },
  // prompt(): repite lo que toca.
  prompt() {
    if (COMETA_ST.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else say('Lleva la cometa con el dedo hasta la estrella.');
  },
  // hint(): mientras vuela, la estrella de ahora; al final, el botón de otra vez.
  hint() {
    if (COMETA_ST.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    const e = estrella();
    return COMETA_ST.fase === 'vuela' && e ? { x: e.x, y: e.y, r: 70 } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el prado con el viento, la estrella de ahora (que brilla), Tito con la cuerda y la cometa, las estrellas
  // cogidas y, al final, el botón de otra vez.
  draw() {
    dibujaFondo();
    const s = COMETA_ST,
      e = estrella();
    if (e && s.fase !== 'fin') star(e.x, e.y, 42 + Math.sin(T * 4) * 5, '#FFD23F', 5);
    drawTito(MEDIDAS.tito.x, MEDIDAS.tito.y, MEDIDAS.tito.w, { bubble: false });
    dibujaCometa();
    dibujaRondas(s.estrellas.length, s.cogidas);
    card(W / 2 - 170, 110, 340, 70, '#fff', 6, 35);
    text('La cometa', W / 2, 160, 40);
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; mientras vuela, la cometa va hacia el
  // dedo (y lo sigue si se arrastra); si no, chispas.
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
    const s = COMETA_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    if (s.fase === 'vuela') {
      s.arrastra = true;
      apuntar(x, y);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
  // move(x, y): mientras se arrastra, la cometa sigue al dedo.
  move(x: number, y: number) {
    if (COMETA_ST.arrastra && COMETA_ST.fase === 'vuela') apuntar(x, y);
  },
  // up(): se suelta el dedo (la cometa se queda donde iba).
  up() {
    COMETA_ST.arrastra = false;
  },
};
