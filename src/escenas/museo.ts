/*
 * escenas/museo.ts: las salas del museo de los dinosaurios (idea 4 de docs/IDEAS-MEJORA.md, fase P19), las estaciones
 * de la excursión del museo. Se llega desde el plano de la excursión (escenas/excursion.ts: el gran salón del museo, con
 * Pablo el paleontólogo) y, al terminar, se vuelve a él. Como los recintos del zoo, cada sala es un juego; Pablo la
 * presenta y al terminar cuenta un dato curioso (la escena común es escenaRecinto de escenas/zoo.ts):
 * - La excavación (SCENES.museoExcavacion): frotar la tierra para descubrir fósiles y huesos (el juego «Buscar fósiles»
 *   del tema de los dinosaurios, 5A-T7: Excava).
 * - Montar los dinosaurios (SCENES.museoMontar): el puzle del tema de los dinosaurios (Puzzle).
 * - La sala de medir (SCENES.museoMedir): medir cada dinosaurio con los pasos de Tito y decir cuál es el más largo
 *   (Mide, componente propio de este archivo).
 * - ¿Qué comían? (SCENES.museoComida): separar los que comían plantas de los que comían carne (el juego «¿Qué comía?»
 *   del tema: Arrastra).
 * - El nido de los dinosaurios (SCENES.museoNido): tocar los huevos hasta que se abren y nacen los bebés (Eclosiona,
 *   componente propio de este archivo).
 * Los juegos que ya tenía el tema de los dinosaurios se reutilizan tal cual (juegoDelTema), con sus frases.
 * Exporta: RECINTOS_MUSEO (cada sala, con la forma de RecintoZoo), PASOS_DINO, dinosParaMedir, Mide y Eclosiona; pone
 * SCENES.museoExcavacion, SCENES.museoMontar, SCENES.museoMedir, SCENES.museoComida y SCENES.museoNido.
 * Importa: el núcleo (dibujo, voz, sonido, aciertos), BG, thing, nameT y NUM de juegos/, el tema T5 de temas/temas5.ts
 * y escenaRecinto y el tipo RecintoZoo de escenas/zoo.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  AGE,
  SFX,
  SCENES,
  T,
  burst,
  cap,
  card,
  ctx,
  dist,
  fmt,
  hC,
  hv,
  juntar,
  later,
  onRight,
  praise,
  rec,
  say,
  scene,
  shuffle,
  text,
  tr,
} from '../nucleo/indice.ts';
import type { AlTerminar, Config, Juego } from '../juegos/tipos.ts';
import { BG, NUM, nameT, thing } from '../juegos/indice.ts';
import { T5 } from '../temas/temas5.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';

// juegoDelTema(t, onDone): el juego t ('excava', 'puzzle', 'comen') del tema de los dinosaurios (5A-T7), con su fondo.
function juegoDelTema(t: string, onDone: AlTerminar): Juego {
  const tema = T5.find((x) => x.id === '5A-T7')!;
  return tema.games.find((g) => g.t === t)!.make!(onDone, tema);
}

/* ---------- la sala de medir ---------- */

/** Cuántos pasos de Tito mide cada dinosaurio (siempre lo mismo, para que se puedan comparar). */
export const PASOS_DINO: Readonly<Record<string, number>> = {
  pterodactilo: 2,
  triceratops: 3,
  tiranosaurio: 4,
  diplodoco: 6,
};

// dinosParaMedir(edad): los dinosaurios que se miden, en orden: con 3 años, dos cortos (hasta 3 pasos); con 4, tres;
// con 5, los cuatro.
export function dinosParaMedir(edad: number): string[] {
  if (edad <= 3) return ['pterodactilo', 'triceratops'];
  if (edad === 4) return ['triceratops', 'tiranosaurio', 'diplodoco'];
  return ['pterodactilo', 'triceratops', 'tiranosaurio', 'diplodoco'];
}

// MIDE: dónde va la fila de huellas (el suelo), lo que mide un paso y el tamaño de los dinosaurios al medir y al comparar.
const MIDE = { y: 650, paso: 150, dino: 400, cmpY: 450, cmpS: 260 };

// huella(x, y, s, hecha): una huella de Tito (la planta y tres deditos), naranja si ya se ha pisado.
function huella(x: number, y: number, s: number, hecha: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = hecha ? '#FF9F43' : '#FFFFFF';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 10, 26, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  [-22, 0, 22].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(dx, -36, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

// regla(x0, x1, y): la regla de la cabeza a la cola del dinosaurio: una línea con sus dos topes.
function regla(x0: number, x1: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.moveTo(x0, y - 20);
  ctx.lineTo(x0, y + 20);
  ctx.moveTo(x1, y - 20);
  ctx.lineTo(x1, y + 20);
  ctx.stroke();
  ctx.restore();
}

/** Un sitio en la pantalla (una huella o un dinosaurio al comparar). */
interface Sitio {
  readonly x: number;
  readonly y: number;
}

// huellasDe(k): dónde va cada huella para medir al dinosaurio k (centradas debajo, un poco en zigzag, como al andar).
function huellasDe(k: string): Sitio[] {
  const n = PASOS_DINO[k]!,
    x0 = 800 - ((n - 1) * MIDE.paso) / 2;
  return Array.from({ length: n }, (_, j) => ({ x: x0 + j * MIDE.paso, y: MIDE.y + (j % 2 ? 20 : -20) }));
}

// comparadosDe(dinos): dónde va cada dinosaurio en la ronda de comparar (en fila, centrados).
function comparadosDe(dinos: readonly string[]): (Sitio & { k: string })[] {
  const sep = Math.min(340, 1300 / dinos.length);
  return dinos.map((k, j) => ({ k, x: 800 - ((dinos.length - 1) * sep) / 2 + j * sep, y: MIDE.cmpY }));
}

// masLargoDe(dinos): la clave del dinosaurio con más pasos.
const masLargoDe = (dinos: readonly string[]): string =>
  dinos.reduce((a, b) => (PASOS_DINO[b]! > PASOS_DINO[a]! ? b : a));

/**
 * COMPONENTE Mide (fase P19): medir dinosaurios con los pasos de Tito. Cada ronda, un dinosaurio con una fila de huellas
 * debajo, de la cabeza a la cola; se tocan en orden y Tito las cuenta. Al final, una ronda de comparar: ¿cuál es el más
 * largo? cfg: bg (fondo) y, si se quiere, dinos (las claves; si no, dinosParaMedir según la edad). Una estrella por
 * dinosaurio medido y otra por acertar el más largo.
 */
export function Mide(cfg: Config, onDone: AlTerminar): Juego {
  const dinos: string[] = cfg.dinos ?? dinosParaMedir(AGE());
  return {
    total: dinos.length + 1,
    done: 0,
    i: 0,
    fase: 'medir' as 'medir' | 'comparar',
    c: 0,
    busy: false,
    errs: 0,
    pasado: 0,
    // enter(): la primera ronda.
    enter() {
      this.ronda();
    },
    // ronda(): el dinosaurio de esta ronda, sin huellas pisadas, y la consigna.
    ronda() {
      Object.assign(this, { c: 0, busy: false, pasado: T });
      later(400, () =>
        say(fmt('Vamos a medir {cosa} con los pasos de Tito. Toca las huellas una a una.', { cosa: nameT(this.k()) })),
      );
    },
    // k(): la clave del dinosaurio de esta ronda.
    k(): string {
      return dinos[this.i]!;
    },
    // prompt(): repite la consigna de la fase.
    prompt() {
      say(
        this.fase === 'medir' ? 'Toca las huellas una a una para contar los pasos.' : '¿Cuál es el más largo? Tócalo.',
      );
    },
    // hint(): la siguiente huella sin pisar o, al comparar, el más largo.
    hint() {
      if (this.busy) return null;
      if (this.fase === 'medir') {
        const h = huellasDe(this.k())[this.c];
        return h ? { x: h.x, y: h.y, r: 70 } : null;
      }
      const d = comparadosDe(dinos).find((o) => o.k === masLargoDe(dinos));
      return d ? { x: d.x, y: d.y, r: MIDE.cmpS / 2 } : null;
    },
    // acierto(texto, luego): estrella, monedas de acierto y lo que dice Tito; después, luego.
    acierto(texto: string, luego: () => void) {
      this.busy = true;
      SFX.good();
      rec('museo', this.errs === 0);
      onRight(this.errs === 0);
      this.done++;
      scene!.starPop = T;
      say(texto, () => later(500, luego));
    },
    // siguiente(): la siguiente ronda de medir o, después de la última, la de comparar.
    siguiente() {
      this.i++;
      if (this.i < dinos.length) {
        this.ronda();
        return;
      }
      Object.assign(this, { fase: 'comparar', busy: false, errs: 0, pasado: T });
      say('Ya los hemos medido todos. ¿Cuál es el más largo? Tócalo.');
    },
    // down(x, y): al medir, la huella siguiente (las demás no cuentan) y Tito cuenta; con la última, cuánto mide. Al
    // comparar, el dinosaurio tocado: el más largo es el acierto; otro, Tito dice cuánto mide.
    down(x: number, y: number) {
      if (this.busy) return;
      if (this.fase === 'medir') {
        const h = huellasDe(this.k())[this.c];
        if (!h || dist(x, y, h.x, h.y) > 80) {
          SFX.tap();
          return;
        }
        this.c++;
        SFX.count(this.c);
        burst(h.x, h.y, 10);
        const n = PASOS_DINO[this.k()]!;
        if (this.c < n) {
          say(cap(NUM[this.c]!));
          return;
        }
        this.acierto(fmt('¡{Cosa} mide {n} pasos de Tito!', { cosa: nameT(this.k()), n: NUM[n]! }), () =>
          this.siguiente(),
        );
        return;
      }
      const d = comparadosDe(dinos).find((o) => dist(x, y, o.x, o.y) < MIDE.cmpS / 2);
      if (!d) {
        SFX.tap();
        return;
      }
      if (d.k === masLargoDe(dinos)) {
        burst(d.x, d.y, 30);
        this.acierto(juntar(tr(praise()), fmt('{Cosa} es el más largo.', { cosa: nameT(d.k) })), () => onDone());
        return;
      }
      SFX.bad();
      this.errs++;
      say(fmt('{Cosa} mide {n} pasos. Busca el que tiene más pasos.', { cosa: nameT(d.k), n: NUM[PASOS_DINO[d.k]!]! }));
    },
    // draw(): el fondo y, al medir, el dinosaurio con la regla de la cabeza a la cola, su fila de huellas y el número de
    // cada pisada; al comparar, los dinosaurios en fila con sus pasos.
    draw() {
      cfg.bg();
      const ap = Math.min(1, (T - this.pasado) * 3);
      if (this.fase === 'medir') {
        const hs = huellasDe(this.k()),
          x0 = hs[0]!.x - MIDE.paso / 2,
          x1 = hs[hs.length - 1]!.x + MIDE.paso / 2;
        card(x0 - 30, 150, x1 - x0 + 60, 600, 'rgba(255,255,255,0.55)', 0, 30);
        thing(this.k(), 800, 350, Math.min(MIDE.dino, x1 - x0) * ap);
        regla(x0, x1, 560);
        hs.forEach((h, j) => huella(h.x, h.y, 70, j < this.c));
        hs.slice(0, this.c).forEach((h, j) => text(String(j + 1), h.x, h.y + 80, 40, '#4A3B2A'));
        return;
      }
      comparadosDe(dinos).forEach((o) => {
        const s = hv('mide:' + o.k, hC(o.x, o.y, MIDE.cmpS / 2)) * ap;
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.scale(s, s);
        thing(o.k, 0, 0, MIDE.cmpS);
        ctx.restore();
        huella(o.x - 30, o.y + 190, 50, true);
        text(String(PASOS_DINO[o.k]), o.x + 25, o.y + 205, 44, '#4A3B2A');
      });
    },
  };
}

/* ---------- el nido ---------- */

// NACE: lo que dice Tito cuando nace cada bebé (frases enteras, para traducirlas bien).
const NACE: Readonly<Record<string, string>> = {
  triceratops: '¡Ha nacido un triceratops bebé!',
  tiranosaurio: '¡Ha nacido un tiranosaurio bebé!',
  diplodoco: '¡Ha nacido un diplodoco bebé!',
  pterodactilo: '¡Ha nacido un pterodáctilo bebé!',
};
// GOLPES: los toques que hacen falta para que se abra un huevo.
const GOLPES = 3;

// grietas(n, s): las grietas de un huevo de tamaño s con n toques (cada toque, un zigzag más), sobre el huevo en (0, 0).
function grietas(n: number, s: number): void {
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  [-0.1, 0.05, 0.18].slice(0, n).forEach((dy) => {
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * dy);
    [-0.11, 0, 0.11, 0.22].forEach((dx, m) => ctx.lineTo(s * dx, s * (dy + (m % 2 ? 0.05 : -0.05))));
    ctx.stroke();
  });
  ctx.restore();
}

// huevoCerrado(s): un huevo de dinosaurio entero (crema con manchas verdes) de alto s, centrado en (0, 0). El dibujo
// huevoDino ya tiene la cría asomando: este es el de antes de abrirse.
function huevoCerrado(s: number): void {
  ctx.save();
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = '#FFF6E2';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.bezierCurveTo(30, -48, 38, 0, 38, 14);
  ctx.bezierCurveTo(38, 36, 20, 48, 0, 48);
  ctx.bezierCurveTo(-20, 48, -38, 36, -38, 14);
  ctx.bezierCurveTo(-38, 0, -30, -48, 0, -48);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#9ED88F';
  [
    [-14, -20, 7],
    [12, -8, 9],
    [-18, 18, 8],
    [14, 26, 6],
    [2, 6, 4],
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x!, y!, r!, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// cascara(x, y): la cáscara de abajo de un huevo ya abierto, con el borde en zigzag.
function cascara(x: number, y: number): void {
  ctx.save();
  ctx.fillStyle = '#F4EBD0';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 80, y);
  [-50, -25, 0, 25, 50, 80].forEach((dx, m) => ctx.lineTo(x + dx, y + (m % 2 ? 0 : -22)));
  ctx.quadraticCurveTo(x + 80, y + 90, x, y + 90);
  ctx.quadraticCurveTo(x - 80, y + 90, x - 80, y);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * COMPONENTE Eclosiona (fase P19): un nido con huevos de dinosaurio (2 con 3 años, 3 con 4 y 5). Cada huevo se toca tres
 * veces: tiembla y se agrieta, y al tercero se abre y sale un dinosaurio bebé (Tito dice cuál, NACE). cfg: bg. Una
 * estrella por bebé.
 */
export function Eclosiona(cfg: Config, onDone: AlTerminar): Juego {
  const n = AGE() <= 3 ? 2 : 3,
    sep = 380,
    huevos = shuffle(Object.keys(NACE))
      .slice(0, n)
      .map((k, j) => ({ k, x: 800 - ((n - 1) * sep) / 2 + j * sep, y: 450, golpes: 0, toque: -9, nace: 0 }));
  return {
    total: n,
    done: 0,
    fin: false,
    // prompt(): la consigna.
    prompt() {
      say('Toca los huevos para ayudar a los dinosaurios a salir.');
    },
    // hint(): el primer huevo sin abrir.
    hint() {
      const h = huevos.find((o) => !o.nace);
      return h ? { x: h.x, y: h.y, r: 120 } : null;
    },
    // down(x, y): un toque a un huevo sin abrir lo agrieta; al tercero, nace el bebé (estrella y monedas). Con todos,
    // onDone.
    down(x: number, y: number) {
      const h = huevos.find((o) => !o.nace && dist(x, y, o.x, o.y) < 130);
      if (!h) {
        SFX.tap();
        return;
      }
      Object.assign(h, { golpes: h.golpes + 1, toque: T });
      if (h.golpes < GOLPES) {
        SFX.pop();
        return;
      }
      h.nace = T;
      SFX.good();
      burst(h.x, h.y, 34);
      rec('museo', true);
      onRight(true);
      this.done++;
      scene!.starPop = T;
      say(NACE[h.k]!, () => {
        if (this.done < n || this.fin) return;
        this.fin = true;
        say('¡Han nacido todos los bebés!', () => later(400, onDone));
      });
    },
    // draw(): el fondo, el nido de paja y cada huevo (temblando y con sus grietas) o, si ya se ha abierto, el bebé, que
    // sale creciendo de la cáscara de abajo.
    draw() {
      cfg.bg();
      ctx.save();
      ctx.fillStyle = '#C9A06B';
      ctx.strokeStyle = '#8A6236';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(800, 580, 640, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      huevos.forEach((h) => {
        if (h.nace) {
          const k = Math.min(1, (T - h.nace) * 2.5);
          thing(h.k, h.x, h.y - 60 * k, 260 * (0.4 + 0.6 * k));
          cascara(h.x, h.y + 60);
          return;
        }
        const tiembla = T - h.toque < 0.4 ? Math.sin((T - h.toque) * 60) * 0.12 : 0,
          s = hv('huevo:' + h.k, hC(h.x, h.y, 130));
        ctx.save();
        ctx.translate(h.x, h.y + 100);
        ctx.rotate(tiembla);
        ctx.translate(0, -100);
        ctx.scale(s, s);
        huevoCerrado(240);
        grietas(h.golpes, 220);
        ctx.restore();
      });
    },
  };
}

/* ---------- las salas ---------- */

// RECINTOS_MUSEO: las cinco salas, en el orden del plano.
export const RECINTOS_MUSEO: readonly RecintoZoo[] = [
  {
    id: 'excavacion',
    escena: 'museoExcavacion',
    animal: 'fosil',
    intro: '¡Esto es la excavación! Aquí trabajamos los paleontólogos.',
    dato: '¿Sabes una cosa? Los fósiles son huesos y huellas que se quedaron guardados en la piedra durante millones de años.',
    juego: (onDone) => juegoDelTema('excava', onDone),
  },
  {
    id: 'montar',
    escena: 'museoMontar',
    animal: 'triceratops',
    intro: '¡Oh, no! Los cuadros de los dinosaurios se han caído y se han roto. ¿Me ayudas a montarlos?',
    dato: '¿Sabes una cosa? El triceratops tenía tres cuernos en la cabeza para defenderse.',
    juego: (onDone) => juegoDelTema('puzzle', onDone),
  },
  {
    id: 'medir',
    escena: 'museoMedir',
    animal: 'diplodoco',
    intro: 'En esta sala medimos a los dinosaurios. ¡Tito nos presta sus pasos!',
    dato: '¿Sabes una cosa? El diplodoco era tan largo como tres autobuses, ¡y tenía la cabeza pequeñita!',
    juego: (onDone) => Mide({ bg: BG['prehistoria'] }, onDone),
  },
  {
    id: 'comida',
    escena: 'museoComida',
    animal: 'tiranosaurio',
    intro: 'Unos dinosaurios comían plantas y otros comían carne. ¿Los separamos?',
    dato: '¿Sabes una cosa? El tiranosaurio tenía los dientes tan grandes como plátanos.',
    juego: (onDone) => juegoDelTema('comen', onDone),
  },
  {
    id: 'nido',
    escena: 'museoNido',
    animal: 'huevoDino',
    intro: '¡Mira este nido! Los huevos se están moviendo. ¡Van a nacer!',
    dato: '¿Sabes una cosa? Las mamás dinosaurio ponían los huevos en nidos, como los pájaros.',
    juego: (onDone) => Eclosiona({ bg: BG['prehistoria'] }, onDone),
  },
];

RECINTOS_MUSEO.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'museo', 'paleontologo');
});
