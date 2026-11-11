// temas/ingles.ts (antes ingles.js): las casitas de inglés. Eran el Rincón del inglés (zona 'ingles' del mapa); desde
// la fase I2 de docs/PLAN-INGLES.md son las primeras casitas de la Playa Hello (zona 'playaHello' de la Isla del
// Inglés), con los mismos ids, así que lo ya jugado no se pierde.
// Para qué sirve: define las palabras en inglés (EN), los tipos de juego en inglés (EnConocer, EnEscucha,
//   EnGlobos, EnCuenta y, desde la fase I3, EnRepite y EnTelefono) y las casitas de la Playa Hello (ING: las 4 del
//   rincón y, desde la fase I3, otras 6 detrás). Esos juegos los crea makeGame (temas/hacerJuego.ts).
// Desde la fase 2i es un módulo (temas/indice.ts lo carga después de extras.ts) y exporta: sayMix, ENC, enBlob,
//   enNum, enFace, EN, enItems, enEs, enDraw, enCard, enGrid, EnConocer, EnEscucha, EnGlobos, EnCuenta, EnRepite,
//   EnTelefono, ENG, ING y
//   los tipos PalabraEn y OpcionesTarjeta. El puente de src/modulos.ts los deja en globalThis. ING se añade a TEMAS en
//   escenas/escenas2d.ts y a la zona 'playaHello' en escenas/zonas.ts.
// Hasta la fase 4f, al cargarse envolvía makeGame (temas/temas.ts, ya envuelta por temas/extras.ts) con ponMakeGame.
// Importa: PALABRAS_INGLES (contenido/ingles.ts, desde la fase I3), el núcleo, src/nucleo/ (say con la opción {en:1}, ctx y funciones de dibujo, AGE, rec, onRight,
//   onWrongTwice, praise, SFX, later, shuffle, pick, nRounds, nOpts, DIAC, cap), juegos/ (NUM, BG y,
//   desde la fase 4o, drawFace: antes era de escenas/escenas2d.ts y se usaba como global tardía).
// Voz: say(texto, cb, {en:1, rate:.8}) dice el texto con voz inglesa (el texto en inglés tal cual).
import type { AlTerminar, Config, Juego, JuegoTema, Libre, Tema } from '../juegos/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  DF,
  DIAC,
  H,
  LF,
  PI,
  SFX,
  T,
  W,
  back,
  burst,
  cap,
  card,
  circ,
  clamp,
  ctx,
  dist,
  ell,
  fillStroke,
  hR,
  hv,
  inR,
  later,
  nOpts,
  nRounds,
  onRight,
  onWrongTwice,
  pic,
  pick,
  praise,
  rec,
  rnd,
  say,
  sayQ,
  scene,
  shuffle,
  sparkles,
  speaker,
  star,
  text,
  tone,
  fmt,
} from '../nucleo/indice.ts';
import { BG, NUM, drawFace } from '../juegos/indice.ts';
// azar(): el azar del juego (puerto de aplicacion/puertos.ts, desde la fase 3g; antes Math.random()).
import { azar } from '../aplicacion/puertos.ts';
// Las palabras nuevas de la isla (fase I1): la familia, el cuerpo, los juguetes y la fruta salen de aquí (fase I3).
import { PALABRAS_INGLES } from '../contenido/ingles.ts';
// SONGS (temas/extras.ts, que se carga antes): aquí se le añaden las canciones en inglés del Parque de Londres (fase I4).
import { SONGS } from './extras.ts';

/** Una palabra en inglés de EN: en (en inglés), es (traducción al castellano), a (edad mínima) y su
 * dibujo: k (clave de PICS) o draw(x, y, s). Los colores llevan además col y los números n. */
export interface PalabraEn {
  en: string;
  es: string;
  a: number;
  k?: string;
  draw?: (x: number, y: number, s: number) => void;
  col?: string;
  n?: number;
  /** Solo los animales de la granja (desde la fase I4): lo que dicen en inglés ('Moo'). */
  dice?: string;
}

/** Opciones de enCard: escala, temblor, brillo, color de fondo, palabra escrita debajo y estrella de ya vista. */
export interface OpcionesTarjeta {
  s?: number;
  shake?: number;
  glow?: boolean;
  bg?: string | null;
  label?: boolean;
  star?: unknown;
}
/* ================= EL RINCÓN DEL INGLÉS ================= */
// Las palabras en inglés las dice una voz en inglés (say con {en:1}); las explicaciones, Tito en castellano.
// sayMix(['Tocá','@red'],cb): las partes con @ van en inglés.
// Dice una frase mezclando castellano e inglés, trozo a trozo y en orden. parts: lista de textos; los que
// empiezan por '@' se dicen en inglés (más despacio). Los vacíos se saltan. cb: se llama al terminar el último trozo.
export function sayMix(parts: readonly string[], cb?: (() => void) | null) {
  const P = parts.filter(Boolean);
  const step = (i: number) => {
    if (i >= P.length) {
      cb && cb();
      return;
    }
    const p = P[i],
      en = p[0] === '@';
    say(en ? p.slice(1) : p, () => step(i + 1), en ? { en: 1, rate: 0.8 } : {});
  };
  step(0);
}
// Colores de la lista de colores en inglés: nombre inglés en minúsculas → color.
export const ENC: Record<string, string> = {
  red: '#FF5A5A',
  blue: '#5B8DEF',
  yellow: '#FFD66B',
  green: '#7CC86E',
  orange: '#FFA94D',
  pink: '#F58BB4',
  purple: '#9B8AD9',
  brown: '#A86B43',
  black: '#3B3330',
  white: '#FFFFFF',
};
// Devuelve una función de dibujo (x,y,s) de una mancha de pintura del color c (para las tarjetas de colores).
function enBlob(c: string) {
  return (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    const r = s * 0.34;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * PI * 2,
        q = r * (1 + 0.12 * Math.sin(a * 5));
      ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q);
    }
    ctx.closePath();
    fillStroke(c, Math.max(4, s * 0.03));
    for (const [a, b, q] of [
      [0.95, -0.6, 0.12],
      [-0.9, 0.7, 0.09],
      [0.7, 0.85, 0.07],
    ])
      circ(a * r, b * r, q * s, c, Math.max(3, s * 0.02));
    ctx.restore();
  };
}
// Devuelve una función de dibujo (x,y,s) del número n en un círculo con n puntitos debajo (filas de 5).
export function enNum(n: number) {
  return (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    circ(0, -s * 0.06, s * 0.3, DIAC[(n - 1) % 7], Math.max(4, s * 0.03));
    text(String(n), 0, s * 0.06, s * 0.34, '#fff', { f: LF, st: Math.max(4, s * 0.03), sc: K });
    const per = 5;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / per),
        c = i % per,
        inRow = Math.min(per, n - r * per);
      circ((c - (inRow - 1) / 2) * s * 0.12, s * 0.33 + r * s * 0.1, s * 0.04, '#FFC93C', Math.max(2, s * 0.012));
    }
    ctx.restore();
  };
}
// Devuelve una función de dibujo (x,y,s) de una carita con la emoción m (drawFace de juegos/caras.ts).
const enFace = (m: string) => (x: number, y: number, s: number) => drawFace(x, y, s * 0.36, m);
// enForma(f, c): devuelve una función de dibujo (x,y,s) de la forma f ('circle', 'square', 'triangle', 'star', 'heart',
// 'rectangle', 'oval' o 'diamond') pintada del color c, para las tarjetas de Las formas en inglés (fase I3).
function enForma(f: string, c: string) {
  return (x: number, y: number, s: number) => {
    const r = s * 0.34,
      lw = Math.max(4, s * 0.03);
    ctx.save();
    ctx.translate(x, y);
    if (f === 'circle') circ(0, 0, r, c, lw);
    else if (f === 'oval') ell(0, 0, r, r * 0.66, c, lw);
    else if (f === 'square') card(-r * 0.9, -r * 0.9, r * 1.8, r * 1.8, c, lw, 4);
    else if (f === 'rectangle') card(-r * 1.1, -r * 0.62, r * 2.2, r * 1.24, c, lw, 4);
    else if (f === 'star') star(0, 0, r * 1.1, c, lw);
    else if (f === 'heart') pic('corazon', 0, 0, s * 0.8);
    else {
      ctx.beginPath();
      if (f === 'triangle') {
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 1.05, r * 0.8);
        ctx.lineTo(-r * 1.05, r * 0.8);
      } else {
        ctx.moveTo(0, -r * 1.1);
        ctx.lineTo(r * 0.8, 0);
        ctx.lineTo(0, r * 1.1);
        ctx.lineTo(-r * 0.8, 0);
      }
      ctx.closePath();
      fillStroke(c, lw);
    }
    ctx.restore();
  };
}
// enDeIsla(conjunto): las palabras de un conjunto de la isla (PALABRAS_INGLES de contenido/ingles.ts) con el formato de EN.
export const enDeIsla = (c: string): PalabraEn[] =>
  (PALABRAS_INGLES[c] ?? []).map((w) => ({ en: w.en, es: w.es, a: w.a, k: w.k, ...(w.dice ? { dice: w.dice } : {}) }));
// enAccion(k, m): devuelve una función de dibujo (x,y,s) de una acción (fase I4, Lo que hacemos): el dibujo k de PICS
// que se mueve según la acción m ('run' corre con rayas de velocidad, 'jump' salta con su sombra, 'sleep' duerme con
// zetas, 'swim' nada entre olas, 'fly' vuela junto a una nube, 'eat' come una zanahoria, 'sing' canta con notas y
// 'dance' baila balanceándose). Se mueve con el reloj T, así que en las tarjetas está siempre en marcha.
function enAccion(k: string, m: string) {
  return (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    const lw = Math.max(3, s * 0.02);
    ctx.lineCap = 'round';
    ctx.strokeStyle = K;
    ctx.lineWidth = lw;
    if (m === 'run') {
      const dx = Math.sin(T * 8) * s * 0.04;
      for (const [a, b] of [
        [-0.12, 0.28],
        [0.04, 0.22],
        [0.2, 0.3],
      ]) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.46 + dx, a * s);
        ctx.lineTo(-s * (0.46 - b) + dx, a * s);
        ctx.stroke();
      }
      pic(k, s * 0.08 + dx, 0, s * 0.66);
    } else if (m === 'jump') {
      const h = Math.abs(Math.sin(T * 4)) * s * 0.2;
      ell(0, s * 0.36, s * 0.2 * (1 - h / s), s * 0.04, 'rgba(0,0,0,.15)', 0);
      pic(k, 0, s * 0.1 - h, s * 0.56);
    } else if (m === 'sleep') {
      const b = 1 + Math.sin(T * 2) * 0.03;
      ctx.save();
      ctx.scale(b, b);
      pic(k, -s * 0.06, s * 0.1, s * 0.62);
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        const q = (T * 0.5 + i / 3) % 1;
        ctx.globalAlpha = 1 - q;
        text('Z', s * 0.22 + q * s * 0.12, -s * 0.08 - q * s * 0.3, s * (0.1 + i * 0.03), '#5B8DEF', { f: LF });
        ctx.globalAlpha = 1;
      }
    } else if (m === 'swim') {
      const dx = Math.sin(T * 2) * s * 0.06;
      pic(k, dx, -s * 0.04, s * 0.56);
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const xx = -s * 0.42 + j * s * 0.042;
          ctx.lineTo(xx, s * (0.26 + i * 0.1) + Math.sin(j * 0.9 + T * 4) * s * 0.025);
        }
        ctx.strokeStyle = '#5BB8E6';
        ctx.stroke();
      }
    } else if (m === 'fly') {
      pic('nube', -s * 0.24, s * 0.24, s * 0.34);
      pic(k, s * 0.06, -s * 0.06 + Math.sin(T * 3) * s * 0.07, s * 0.56);
    } else if (m === 'eat') {
      const w = 1 + Math.abs(Math.sin(T * 7)) * 0.06;
      ctx.save();
      ctx.scale(w, 1 / w);
      pic(k, -s * 0.12, 0, s * 0.6);
      ctx.restore();
      pic('zanahoria', s * 0.26, s * 0.12, s * 0.32);
    } else if (m === 'sing') {
      pic(k, -s * 0.08, s * 0.06, s * 0.6);
      for (let i = 0; i < 3; i++) {
        const q = (T * 0.4 + i / 3) % 1;
        ctx.globalAlpha = 1 - q;
        text('♪', s * 0.2 + Math.sin(T * 2 + i) * s * 0.05, -s * 0.04 - q * s * 0.34, s * 0.14, DIAC[i] ?? K, {
          f: LF,
        });
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.rotate(Math.sin(T * 5) * 0.2);
      pic(k, 0, Math.abs(Math.sin(T * 5)) * -s * 0.05, s * 0.66);
    }
    ctx.restore();
  };
}
// enOpuesto(m): devuelve una función de dibujo (x,y,s) de un contrario (fase I4, Grande y pequeño): 'big' y 'small' (la
// misma pelota grande o pequeña), 'hot' (el sol y un termómetro), 'cold' (el hielo y un copo), 'fast' (el conejo con
// rayas de velocidad), 'slow' (la tortuga), 'up' (el globo arriba, con flecha) y 'down' (la pelota abajo, con flecha).
function enOpuesto(m: string) {
  return (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    const lw = Math.max(3, s * 0.025);
    ctx.lineCap = 'round';
    ctx.lineWidth = lw;
    ctx.strokeStyle = K;
    // flecha(y0, y1): una flecha vertical gruesa a la derecha, de y0 a y1.
    const flecha = (y0: number, y1: number) => {
      ctx.beginPath();
      ctx.moveTo(s * 0.32, y0);
      ctx.lineTo(s * 0.32, y1);
      const d = y1 > y0 ? -1 : 1;
      ctx.moveTo(s * 0.24, y1 + d * s * 0.08);
      ctx.lineTo(s * 0.32, y1);
      ctx.lineTo(s * 0.4, y1 + d * s * 0.08);
      ctx.stroke();
    };
    if (m === 'big') pic('pelota', 0, 0, s * 0.8);
    else if (m === 'small') pic('pelota', 0, s * 0.22, s * 0.28);
    else if (m === 'hot') {
      pic('sol', -s * 0.1, -s * 0.04, s * 0.62);
      pic('termometro', s * 0.26, s * 0.14, s * 0.36);
    } else if (m === 'cold') {
      pic('hielo', -s * 0.08, s * 0.06, s * 0.56);
      pic('copo', s * 0.24, -s * 0.22, s * 0.3);
    } else if (m === 'fast') {
      for (const a of [-0.1, 0.06, 0.2]) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.44, a * s);
        ctx.lineTo(-s * 0.24, a * s);
        ctx.stroke();
      }
      pic('conejo', s * 0.08 + Math.sin(T * 9) * s * 0.03, 0, s * 0.6);
    } else if (m === 'slow') pic('tortuga', Math.sin(T * 0.8) * s * 0.03, s * 0.04, s * 0.66);
    else if (m === 'up') {
      pic('globoAire', -s * 0.08, -s * 0.16, s * 0.5);
      flecha(s * 0.3, -s * 0.34);
    } else {
      pic('pelota', -s * 0.08, s * 0.26, s * 0.34);
      flecha(-s * 0.34, s * 0.3);
    }
    ctx.restore();
  };
}
// a: edad desde la que aparece la palabra
// Palabras de cada tema de inglés: EN[conjunto] = lista de {en (palabra en inglés), es (traducción al
// castellano), a (edad mínima: 3, 4 o 5), y para dibujarla k (id de dibujo de PICS) o draw(x,y,s)}.
// Los colores llevan además col (su color) y los números n (su valor). Conjuntos: hello, colors, numbers, animals y,
// desde la fase I3, family, body, toys, fruit, shapes y beach (la fiesta de la playa).
export const EN: Record<string, PalabraEn[]> = {
  hello: [
    { en: 'Hello', es: 'Hola', k: 'mano', a: 3 },
    { en: 'Happy', es: 'Contento', draw: enFace('alegria'), a: 3 },
    { en: 'Sad', es: 'Triste', draw: enFace('tristeza'), a: 3 },
    { en: 'Good night', es: 'Buenas noches', k: 'luna', a: 3 },
    { en: 'Good morning', es: 'Buenos días', k: 'sol', a: 4 },
    { en: 'Thank you', es: 'Gracias', k: 'regalo', a: 4 },
    { en: 'I love you', es: 'Te quiero', k: 'corazon', a: 5 },
    { en: 'Angry', es: 'Enfadado', draw: enFace('enojo'), a: 5 },
  ],
  colors: (
    [
      ['red', 'Rojo', 3],
      ['blue', 'Azul', 3],
      ['yellow', 'Amarillo', 3],
      ['green', 'Verde', 3],
      ['orange', 'Naranja', 4],
      ['pink', 'Rosa', 4],
      ['purple', 'Morado', 4],
      ['brown', 'Marrón', 5],
      ['black', 'Negro', 5],
      ['white', 'Blanco', 5],
    ] as [string, string, number][]
  ).map(([en, es, a]) => ({ en: en[0].toUpperCase() + en.slice(1), es, a, col: ENC[en], draw: enBlob(ENC[en]) })),
  numbers: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'].map((en, i) => ({
    en,
    es: cap(NUM[i + 1]),
    n: i + 1,
    a: i < 5 ? 3 : i < 8 ? 4 : 5,
    draw: enNum(i + 1),
  })),
  animals: (
    [
      ['Dog', 'Perro', 'perro', 3],
      ['Cat', 'Gato', 'gato', 3],
      ['Cow', 'Vaca', 'vaca', 3],
      ['Duck', 'Pato', 'pato', 3],
      ['Fish', 'Pez', 'pez', 4],
      ['Horse', 'Caballo', 'caballo', 4],
      ['Pig', 'Cerdo', 'cerdo', 4],
      ['Sheep', 'Oveja', 'oveja', 4],
      ['Lion', 'León', 'leon', 5],
      ['Elephant', 'Elefante', 'elefante', 5],
      ['Monkey', 'Mono', 'mono', 5],
      ['Frog', 'Rana', 'rana', 5],
    ] as [string, string, string, number][]
  ).map(([en, es, k, a]) => ({ en, es, k, a })),
  // Desde la fase I3, los conjuntos nuevos de la Playa Hello (la familia, el cuerpo, los juguetes, la fruta y las formas).
  family: enDeIsla('family'),
  body: enDeIsla('body'),
  toys: enDeIsla('toys'),
  fruit: enDeIsla('fruit'),
  shapes: (
    [
      ['Circle', 'Círculo', 'circle', '#FF5A5A', 3],
      ['Square', 'Cuadrado', 'square', '#5B8DEF', 3],
      ['Triangle', 'Triángulo', 'triangle', '#FFD66B', 3],
      ['Star', 'Estrella', 'star', '#FFA94D', 3],
      ['Heart', 'Corazón', 'heart', '#F58BB4', 4],
      ['Rectangle', 'Rectángulo', 'rectangle', '#7CC86E', 4],
      ['Oval', 'Óvalo', 'oval', '#9B8AD9', 5],
      ['Diamond', 'Rombo', 'diamond', '#4FC3C7', 5],
    ] as [string, string, string, string, number][]
  ).map(([en, es, f, c, a]) => ({ en, es, a, draw: enForma(f, c) })),
};
// EN.beach: la Fiesta de la playa (fase I3), un repaso con palabras de todas las casitas de la Playa Hello (las tres
// primeras de cada una que salen a los 3 o 4 años; los saludos no, porque Hello y Hand tienen el mismo dibujo).
// Desde la fase I4, los conjuntos del Parque de Londres: los de contenido/ingles.ts (la ropa, la comida, la casa, el
// tiempo, los transportes y la granja) y los que se dibujan con una función (las acciones, los contrarios y cómo me siento).
Object.assign(EN, {
  clothes: enDeIsla('clothes'),
  food: enDeIsla('food'),
  house: enDeIsla('house'),
  weather: enDeIsla('weather'),
  transport: enDeIsla('transport'),
  farm: enDeIsla('farm'),
  actions: (
    [
      ['Run', 'Correr', 'perro', 'run', 3],
      ['Jump', 'Saltar', 'rana', 'jump', 3],
      ['Sleep', 'Dormir', 'gato', 'sleep', 3],
      ['Eat', 'Comer', 'conejo', 'eat', 3],
      ['Swim', 'Nadar', 'pez', 'swim', 4],
      ['Fly', 'Volar', 'pajaro', 'fly', 4],
      ['Sing', 'Cantar', 'pollito', 'sing', 5],
      ['Dance', 'Bailar', 'oso', 'dance', 5],
    ] as [string, string, string, string, number][]
  ).map(([en, es, k, m, a]) => ({ en, es, a, draw: enAccion(k, m) })),
  opposites: (
    [
      ['Big', 'Grande', 'big', 3],
      ['Small', 'Pequeño', 'small', 3],
      ['Hot', 'Caliente', 'hot', 3],
      ['Cold', 'Frío', 'cold', 3],
      ['Fast', 'Rápido', 'fast', 4],
      ['Slow', 'Lento', 'slow', 4],
      ['Up', 'Arriba', 'up', 5],
      ['Down', 'Abajo', 'down', 5],
    ] as [string, string, string, number][]
  ).map(([en, es, m, a]) => ({ en, es, a, draw: enOpuesto(m) })),
  feelings: (
    [
      ['Happy', 'Contento', 'alegria', 3],
      ['Sad', 'Triste', 'tristeza', 3],
      ['Angry', 'Enfadado', 'enojo', 3],
      ['Scared', 'Asustado', 'miedo', 3],
      ['Surprised', 'Sorprendido', 'sorpresa', 4],
      ['Calm', 'Tranquilo', 'calma', 4],
      ['Shy', 'Vergonzoso', 'verguenza', 5],
    ] as [string, string, string, number][]
  ).map(([en, es, m, a]) => ({ en, es, a, draw: enFace(m) })),
});
// EN.park: la Fiesta del parque (fase I4), un repaso con las tres primeras palabras de los 3 o 4 años de cada casita
// del Parque de Londres.
EN.park = ['clothes', 'food', 'house', 'weather', 'transport', 'farm', 'actions', 'opposites', 'feelings'].flatMap(
  (c) => EN[c].filter((w) => w.a <= 4).slice(0, 3),
);
EN.beach = ['colors', 'animals', 'family', 'body', 'toys', 'fruit', 'shapes'].flatMap((c) =>
  EN[c].filter((w) => w.a <= 4).slice(0, 3),
);
// Palabras del conjunto set que tocan a la edad del niño (AGE()).
export const enItems = (set: string) => EN[set].filter((i) => i.a <= Math.max(3, AGE()));
// Traducción al castellano de la palabra.
const enEs = (it: PalabraEn) => it.es;
// Dibuja la palabra it centrada en (x,y) con tamaño s (su draw propio o su dibujo pic).
export function enDraw(it: PalabraEn, x: number, y: number, s: number) {
  if (it.draw) it.draw(x, y, s);
  else pic(it.k!, x, y, s);
}
// Dibuja una tarjeta cuadrada de lado s con la palabra it. Opciones o: s (escala), shake (instante en que empezó
// a temblar), glow (brillo amarillo), bg (color de fondo), label (escribe la palabra en inglés debajo), star (estrella de ya vista).
export function enCard(it: PalabraEn, x: number, y: number, s: number, o: OpcionesTarjeta = {}) {
  const hs = o.s || 1,
    sh = o.shake ? Math.sin((T - o.shake) * 40) * 10 * Math.max(0, 1 - (T - o.shake) * 2.5) : 0;
  ctx.save();
  ctx.translate(x + sh, y);
  ctx.scale(hs, hs);
  if (o.glow) {
    ctx.globalAlpha = 0.5;
    circ(0, 0, s * 0.62, '#FFE08A', 0);
    ctx.globalAlpha = 1;
  }
  card(-s / 2, -s / 2, s, s, o.bg || '#fff', 7, 36);
  enDraw(it, 0, o.label ? -s * 0.07 : 0, s * (o.label ? 0.66 : 0.8));
  if (o.label) {
    ctx.font = `600 ${Math.round(s * 0.13)}px ${DF}`;
    text(
      it.en,
      0,
      s * 0.42,
      Math.min(s * 0.13, (s * 0.85) / Math.max(1, ctx.measureText(it.en).width / (s * 0.13))),
      K,
      { w: 600 },
    );
  }
  if (o.star) star(s / 2 - 18, -s / 2 + 18, 22, '#FFC93C', 3.5);
  ctx.restore();
}
// Reparte las tarjetas en una cuadrícula centrada en la zona (cx, top, w, h): elige columnas según cuántas hay
// y pone a cada elemento x, y, s (tamaño) e in (cuándo aparece, escalonado).
export function enGrid(items: Libre[], top = 180, h = 660, w = 1220, cx = 900) {
  const n = items.length,
    cols = n <= 3 ? n : n === 4 ? 4 : n <= 6 ? 3 : n <= 8 ? 4 : 5,
    rows = Math.ceil(n / cols),
    s = Math.min(w / cols - 34, h / rows - 34, 290);
  items.forEach((it, i) => {
    const r = Math.floor(i / cols),
      c = i % cols,
      inRow = Math.min(cols, n - r * cols);
    it.x = cx - ((inRow - 1) * (s + 34)) / 2 + c * (s + 34);
    it.y = top + (h - rows * (s + 34)) / 2 + (s + 34) / 2 + r * (s + 34);
    it.s = s;
    it.in = T + i * 0.08;
  });
}

// 1) Escuchá y repetí: tocar cada dibujo para oír la palabra en inglés
// Juego "Escuchá y repetí" (tipo enConocer). cfg: {items (palabras), bg (fondo), intro (frase opcional)}.
// Al tocar una tarjeta se abre en grande y suena inglés-castellano-inglés; se cierra sola o tocando.
// Termina (onDone) cuando se han visto todas. No cuenta aciertos ni fallos.
export function EnConocer(cfg: Config, onDone: AlTerminar): Juego {
  const items: (PalabraEn & Libre)[] = cfg.items.map((o: PalabraEn) => Object.assign({}, o));
  enGrid(items);
  const n = items.length;
  return {
    total: n,
    done: 0,
    open: null,
    // Al empezar: explica el juego.
    enter() {
      later(300, () => sayQ(cfg.intro || 'Toca cada dibujo y escucha cómo se dice en inglés. ¡Repítelo en voz alta!'));
    },
    // Recuerda qué hacer.
    prompt() {
      say(this.open ? 'Toca para cerrar.' : 'Toca un dibujo que todavía no tenga estrella.');
    },
    // Pista: la tarjeta abierta (cuando ya habló) o la primera sin ver.
    hint() {
      if (this.open) return this.spoke ? { x: 900, y: 450, r: 200 } : null;
      const it = items.find((i) => !i.seen);
      return it ? { x: it.x, y: it.y, r: it.s * 0.6 } : null;
    },
    // Abre la tarjeta it en grande, dice la palabra y, si es nueva, suma una estrella.
    show(it: PalabraEn & Libre) {
      this.open = it;
      this.ot = T;
      this.spoke = 0;
      SFX.pop();
      later(200, () =>
        sayMix(['@' + it.en, enEs(it) + '.', '@' + it.en], () => {
          this.spoke = T;
        }),
      );
      if (!it.seen) {
        it.seen = T;
        this.done++;
        scene!.starPop = T;
      }
    },
    // Cierra la tarjeta abierta; si ya se han visto todas, termina el juego.
    close() {
      this.open = null;
      SFX.tap();
      if (this.done >= n && !this.fin) {
        this.fin = true;
        later(400, onDone);
      }
    },
    // Cada cuadro: cierra sola la tarjeta 2,2 s después de terminar de hablar.
    update() {
      if (this.open && this.spoke && T - this.spoke > 2.2) this.close();
    },
    // Dibuja las tarjetas (aparecen con rebote) y, encima, la tarjeta abierta en grande.
    draw() {
      cfg.bg();
      for (const it of items) {
        const ap = clamp((T - it.in) * 3, 0, 1);
        enCard(it, it.x, it.y, it.s, {
          s: (ap < 1 ? back(ap) : 1) * (this.open ? 1 : hv(it, hR(it.x, it.y, it.s, it.s))),
          star: it.seen,
          bg: it.col === '#FFFFFF' ? '#E9F3FA' : null,
        });
      }
      if (this.open) {
        const it = this.open,
          k = clamp((T - this.ot) * 4, 0, 1);
        ctx.fillStyle = `rgba(46,36,32,${0.45 * k})`;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.translate(900, 430);
        ctx.scale(back(k), back(k));
        card(-280, -290, 560, 580, it.col === '#FFFFFF' ? '#E9F3FA' : '#FFF6E6', 8, 50);
        enDraw(it, 0, -60, 330);
        text(it.en.toUpperCase(), 0, 190, it.en.length > 9 ? 60 : 76, '#5B8DEF', { f: LF });
        text(enEs(it), 0, 252, 40, '#7A6252');
        ctx.restore();
      }
    },
    // Toque: con una tarjeta abierta la cierra (cuando ya habló o tras 4 s); si no, abre la tarjeta tocada.
    down(x: number, y: number) {
      if (this.open) {
        if (this.spoke || T - this.ot > 4) this.close();
        return;
      }
      const it = items.find((i) => inR(x, y, i.x, i.y, i.s, i.s));
      if (it) this.show(it);
      else {
        SFX.tap();
        sparkles(x, y, 3);
      }
    },
  };
}

// 2) ¿Dónde está? Tito dice la palabra en inglés y hay que tocar el dibujo
// Juego "¿Dónde está?" (tipo enEscucha): Tito dice una palabra en inglés y hay que tocar su dibujo.
// cfg: {items, bg, key (habilidad para rec), rounds, dice}. Cada ronda tiene 3-4 opciones; dos fallos quitan una opción.
// Con dice (fase I4, Sonidos de la granja; tipo enDice) Polly pregunta quién dice el sonido («Moo!») en vez de nombrarlo.
export function EnEscucha(cfg: Config, onDone: AlTerminar): Juego {
  const pool: PalabraEn[] = cfg.items,
    R = cfg.rounds || Math.min(nRounds(), pool.length + 1);
  let order = shuffle(pool.slice());
  return {
    total: R,
    done: 0,
    i: 0,
    // Al empezar: primera ronda.
    enter() {
      this.round();
    },
    // Prepara una ronda: la palabra buscada (en orden barajado) y otras al azar. Durante la frase inicial (lock)
    // tocar una opción equivocada solo dice su nombre, sin contar como fallo.
    round() {
      const t = order[this.i % order.length],
        n = clamp(nOpts() + 1, 3, Math.min(4, pool.length)),
        others = shuffle(pool.filter((w) => w !== t)).slice(0, n - 1);
      this.t = t;
      this.items = shuffle([t, ...others]).map((o) => ({ it: o, ok: o === t }));
      enGrid(this.items, 240, 560, 1200);
      this.errs = 0;
      this.busy = false;
      this.lock = true;
      later(400, () =>
        this.prompt!(() => {
          this.lock = false;
        }),
      );
      later(2800, () => {
        this.lock = false;
      });
    },
    // Dice "Tocá" + la palabra en inglés.
    prompt(cb?: () => void) {
      if (cfg.dice && this.t.dice) sayMix(['¿Quién dice', '@' + this.t.dice + '?'], cb);
      else sayMix(['Toca', '@' + this.t.en], cb);
    },
    // Pista: la tarjeta correcta (cuando ya ha terminado de hablar).
    hint() {
      const c = this.items.find((c: Libre) => c.ok && !c.win);
      return c && !this.lock ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja el botón de volver a escuchar y las tarjetas (la correcta late y muestra la palabra).
    draw() {
      cfg.bg();
      {
        const s = hv('en:spk', hR(800, 160, 300, 84));
        ctx.save();
        ctx.translate(800, 160);
        ctx.scale(s, s);
        card(-150, -42, 300, 84, '#fff', 6, 42);
        speaker(-60, 0, 64);
        pic('oreja', 60, 0, 64);
        ctx.restore();
      }
      for (const c of this.items) {
        if (c.gone && T - c.gone > 0.4) continue;
        ctx.save();
        if (c.gone) ctx.globalAlpha = Math.max(0, 1 - (T - c.gone) * 2.5);
        enCard(c.it, c.x, c.y, c.s, {
          s: c.win ? 1 + 0.1 * Math.sin((T - c.win) * 12) : hv(c, hR(c.x, c.y, c.s, c.s)),
          shake: c.shake,
          glow: !!c.win,
          bg: c.it.col === '#FFFFFF' ? '#E9F3FA' : null,
          label: !!c.win,
        });
        ctx.restore();
      }
    },
    // Toque: altavoz (repite), tarjeta correcta (acierto: rec, onRight, siguiente ronda) o equivocada
    // (dice qué es y vuelve a pedir; solo el primer fallo de la ronda cuenta en rec).
    down(x: number, y: number) {
      if (inR(x, y, 800, 160, 300, 84)) {
        this.prompt!();
        return;
      }
      const c = this.items.find((c: Libre) => !c.gone && inR(x, y, c.x, c.y, c.s, c.s));
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (c.win || this.busy) return;
      if (this.lock && !c.ok) {
        sayMix(['@' + c.it.en]);
        return;
      }
      if (c.ok) {
        this.busy = true;
        c.win = T;
        SFX.good();
        burst(c.x, c.y, 30);
        rec(cfg.key || 'ingles', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        sayMix(
          [
            cfg.dice && c.it.dice
              ? '@The ' + c.it.en.toLowerCase() + ' says ' + c.it.dice.toLowerCase() + '!'
              : '@' + c.it.en + '!',
            praise(),
          ],
          () =>
            later(400, () => {
              this.i++;
              if (this.i >= R) onDone();
              else this.round();
            }),
        );
      } else {
        SFX.bad();
        c.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles', false);
        this.errs++;
        sayMix(
          cfg.dice && c.it.dice
            ? ['Ese es', '@' + c.it.en, '. Dice', '@' + c.it.dice]
            : ['Ese es', '@' + c.it.en, '. Busca', '@' + this.t.en],
        );
        if (this.errs === 2) {
          onWrongTwice();
          c.gone = T;
        }
      }
    },
  };
}

// 3) Los globos: reventar los globos de la palabra que dice Tito
// Juego "Reventá los globos" (tipo enGlobos): suben globos con dibujos y hay que reventar los de la palabra
// que dice Tito. cfg: {items, bg, key}. 3 aciertos (3 años) o 4; la velocidad sube con la edad.
export function EnGlobos(cfg: Config, onDone: AlTerminar): Juego {
  const pool: PalabraEn[] = cfg.items,
    R = AGE() <= 3 ? 3 : 4,
    sp = AGE() <= 3 ? 70 : AGE() === 4 ? 85 : 100;
  return {
    total: R,
    done: 0,
    bs: [],
    nx: 0,
    // Al empezar: elige la palabra y la dice.
    enter() {
      this.pickT();
      later(400, () => this.prompt!());
    },
    // Elige una palabra objetivo nueva (distinta de la anterior si se puede).
    pickT() {
      const prev = this.t;
      const L = pool.filter((p) => p !== prev);
      this.t = pick(L.length ? L : pool);
      this.tn = 0;
    },
    // Dice qué globos hay que reventar.
    prompt() {
      sayMix(['Revienta los globos de', '@' + this.t.en]);
    },
    // Lanza un globo nuevo desde abajo en un carril libre. tn cuenta cuántos globos "de relleno" pueden salir
    // antes de forzar uno correcto (así siempre aparecen correctos a menudo).
    spawn() {
      const lanes = [340, 560, 780, 1000, 1220, 1440].filter(
        (x) => !this.bs.some((b: Libre) => Math.abs(b.x - x) < 60 && b.y > 620),
      );
      if (!lanes.length) return;
      const isT = this.tn <= 0 || azar() < 0.45,
        it = isT ? this.t : pick(pool.filter((p) => p !== this.t)) || this.t;
      if (it === this.t) this.tn = 2;
      else this.tn--;
      this.bs.push({
        x: pick(lanes),
        y: 980,
        it,
        ph: rnd(0, 6),
        c: it.col || pick(['#FF8A7A', '#7FD3F0', '#FFD66B', '#B9A6F0', '#9FDC8F', '#F58BB4']),
      });
    },
    // Cada cuadro: saca un globo cada 1,15 s, sube los globos con un vaivén y quita los que salen o ya explotaron.
    update(dt: number) {
      if (this.fin) return;
      this.nx -= dt;
      if (this.nx <= 0) {
        this.spawn();
        this.nx = 1.15;
      }
      for (const b of this.bs) {
        if (!b.pop) b.y -= sp * dt;
        b.x += Math.sin(T * 1.5 + b.ph) * 0.4;
      }
      this.bs = this.bs.filter((b: Libre) => b.y > -140 && !(b.pop && T - b.pop > 0.5));
    },
    // Pista: el globo correcto más alto que esté en pantalla.
    hint() {
      const b = this.bs
        .filter((b: Libre) => !b.pop && b.it === this.t && b.y < 820 && b.y > 120)
        .sort((a: Libre, c: Libre) => a.y - c.y)[0];
      return b ? { x: b.x, y: b.y, r: 80 } : null;
    },
    // Dibuja el botón con la palabra buscada y los globos (los colores se pintan del propio color; el resto con su dibujo).
    draw() {
      cfg.bg();
      {
        const s = hv('en:spk', hR(800, 160, 300, 84));
        ctx.save();
        ctx.translate(800, 160);
        ctx.scale(s, s);
        card(-150, -42, 300, 84, '#fff', 6, 42);
        speaker(-60, 0, 64);
        enDraw(this.t, 60, 0, 66);
        ctx.restore();
      }
      for (const b of this.bs) {
        ctx.save();
        ctx.translate(b.x, b.y);
        if (b.pop) {
          const k = (T - b.pop) * 2;
          ctx.globalAlpha = Math.max(0, 1 - k);
          ctx.scale(1 + k, 1 + k);
        }
        ctx.beginPath();
        ctx.moveTo(0, 78);
        ctx.quadraticCurveTo(12, 110, -6, 150);
        ctx.lineWidth = 3;
        ctx.strokeStyle = K;
        ctx.stroke();
        ell(0, 0, 74, 86, b.c, 6);
        ctx.beginPath();
        ctx.moveTo(-10, 84);
        ctx.lineTo(10, 84);
        ctx.lineTo(0, 72);
        ctx.closePath();
        fillStroke(b.c, 4);
        ell(-28, -36, 12, 20, 'rgba(255,255,255,.6)', 0);
        if (!b.it.col) {
          circ(0, 4, 50, '#fff', 4);
          enDraw(b.it, 0, 4, 82);
        }
        ctx.restore();
      }
    },
    // Toque: altavoz (repite) o el globo más cercano: si es el bueno explota y cuenta; si no, dice cuál es.
    down(x: number, y: number) {
      if (this.fin) return;
      if (inR(x, y, 800, 160, 300, 84)) {
        this.prompt!();
        return;
      }
      const b = this.bs
        .filter((b: Libre) => !b.pop && dist(x, y, b.x, b.y) < 90)
        .sort((a: Libre, c: Libre) => dist(x, y, a.x, a.y) - dist(x, y, c.x, c.y))[0];
      if (!b) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (b.it === this.t) {
        b.pop = T;
        SFX.pop();
        SFX.good();
        burst(b.x, b.y, 24);
        rec(cfg.key || 'ingles', true);
        onRight(true);
        this.done++;
        scene!.starPop = T;
        if (this.done >= R) {
          this.fin = true;
          sayMix(['@' + b.it.en + '!', praise()], () => later(300, onDone));
        } else {
          this.pickT();
          sayMix(['@' + b.it.en + '!', 'Ahora, los globos de', '@' + this.t.en]);
        }
      } else {
        SFX.boing();
        b.ph += 3;
        rec(cfg.key || 'ingles', false);
        sayMix(['Ese es', '@' + b.it.en]);
      }
    },
  };
}

// 4) Contar en inglés: tocar cada cosa y Tito cuenta
// Juego "Contar en inglés" (tipo enCuenta): 3 rondas con entre 2 y 5/8/10 cosas (según la edad); al tocar cada
// una Tito dice el número en inglés. cfg: {bg}. La habilidad que se apunta es siempre 'ingles-numeros'.
export function EnCuenta(cfg: Config, onDone: AlTerminar): Juego {
  const max = AGE() <= 3 ? 5 : AGE() === 4 ? 8 : 10,
    R = 3,
    ks = ['manzana', 'estrella', 'pelota', 'pato', 'flor', 'globo'];
  return {
    total: R,
    done: 0,
    i: 0,
    // Al empezar: primera ronda.
    enter() {
      this.round();
    },
    // Prepara una ronda: cuántas cosas (distinto de la anterior), qué dibujo, y las coloca en una o dos filas.
    round() {
      const prev = this.n;
      let n;
      do {
        n = Math.floor(rnd(2, max + 1));
      } while (n === prev);
      this.n = n;
      this.c = 0;
      this.k = ks[this.i % ks.length];
      this.busy = false;
      const per = n <= 5 ? n : Math.ceil(n / 2),
        s = Math.min(200, 1100 / per - 30);
      this.os = Array.from({ length: n }, (_, j) => {
        const r = j < per ? 0 : 1,
          c = r ? j - per : j,
          inRow = r ? n - per : per;
        return {
          x: 900 - ((inRow - 1) * (s + 30)) / 2 + c * (s + 30),
          y: (n <= 5 ? 470 : 360) + r * (s + 60),
          s,
          on: 0,
        };
      });
      later(400, () =>
        sayQ(
          this.i === 0
            ? '¡Contamos en inglés! Toca cada dibujo, de uno en uno.'
            : 'Otra vez: toca cada dibujo y contamos.',
        ),
      );
    },
    // Recuerda qué hacer.
    prompt() {
      say('Toca cada dibujo y contamos en inglés.');
    },
    // Pista: la primera cosa sin contar.
    hint() {
      const o = this.os.find((o: Libre) => !o.on);
      return o && !this.busy ? { x: o.x, y: o.y, r: o.s * 0.6 } : null;
    },
    // Dibuja las cosas (las contadas con su número) y, al terminar la ronda, el total en cifra y en inglés.
    draw() {
      cfg.bg();
      for (const o of this.os) {
        const b = o.on ? Math.max(0, 1 - (T - o.on) * 3) * 0.25 : 0;
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.scale(1 + b, 1 + b);
        card(-o.s / 2, -o.s / 2, o.s, o.s, o.on ? '#FFF3B0' : '#fff', 6, 30);
        pic(this.k, 0, 0, o.s * 0.78);
        if (o.on) {
          circ(o.s / 2 - 8, -o.s / 2 + 8, 26, '#5B8DEF', 4);
          text(String(o.num), o.s / 2 - 8, -o.s / 2 + 20, 30, '#fff', { f: LF });
        }
        ctx.restore();
      }
      if (this.busy && this.c === this.n) {
        card(700, 110, 400, 120, '#fff', 7, 60);
        text(String(this.n), 760, 196, 80, '#5B8DEF', { f: LF });
        text(EN.numbers[this.n - 1].en, 950, 190, 56, K, { w: 600 });
      }
    },
    // Toque: cuenta la cosa tocada (dice su número en inglés); al llegar al total, acierto y siguiente ronda.
    down(x: number, y: number) {
      if (this.busy) return;
      const o = this.os.find((o: Libre) => !o.on && inR(x, y, o.x, o.y, o.s, o.s));
      if (!o) {
        const d = this.os.find((o: Libre) => o.on && inR(x, y, o.x, o.y, o.s, o.s));
        if (d) sayMix(['@' + EN.numbers[d.num - 1].en]);
        else {
          SFX.tap();
          sparkles(x, y, 3);
        }
        return;
      }
      this.c++;
      o.on = T;
      o.num = this.c;
      SFX.count(this.c);
      sparkles(o.x, o.y, 6);
      sayMix(['@' + EN.numbers[this.c - 1].en]);
      if (this.c === this.n) {
        this.busy = true;
        rec(cfg.key || 'ingles-numeros', true);
        onRight(true);
        this.done++;
        scene!.starPop = T;
        burst(900, 300, 40);
        later(900, () =>
          sayMix(['@' + EN.numbers[this.n - 1].en + '!', fmt('{N}. ¡Hay {n}!', { n: NUM[this.n]! })], () =>
            later(500, () => {
              this.i++;
              if (this.i >= R) onDone();
              else this.round();
            }),
          ),
        );
      }
    },
  };
}

// 5) Repite conmigo (fase I3 de docs/PLAN-INGLES.md): Polly dice la palabra y el niño la repite en voz alta.
// Juego "Repite conmigo" (tipo enRepite). cfg: {items, bg, key}. En cada ronda sale una palabra en grande; Polly la dice
// dos veces y se enciende el botón de la boca: el niño la repite en voz alta y lo toca. No escucha el micrófono (no
// se graba nada): el botón solo marca que ya lo ha dicho. Tocar la tarjeta o a Polly la vuelve a decir. Siempre acierta.
export function EnRepite(cfg: Config, onDone: AlTerminar): Juego {
  const R = Math.min(nRounds(), cfg.items.length),
    order = shuffle(cfg.items.slice()).slice(0, R) as PalabraEn[];
  return {
    total: R,
    done: 0,
    i: 0,
    // Al empezar: explica el juego y saca la primera palabra.
    enter() {
      later(300, () =>
        sayQ('Escucha a Polly y repite en voz alta. Cuando lo hayas dicho, toca la boca.', () => this.round!()),
      );
    },
    // Prepara una ronda: la palabra nueva aparece y Polly la dice dos veces (la segunda, más despacio); después se
    // enciende el botón (ready).
    round() {
      this.t = order[this.i];
      this.in = T;
      this.ready = 0;
      this.busy = false;
      later(300, () => this.prompt!());
    },
    // Polly dice la palabra (y se enciende el botón cuando termina).
    prompt() {
      this.ready = 0;
      sayMix(['Repite conmigo:', '@' + this.t.en], () =>
        later(250, () =>
          say(
            this.t.en,
            () => {
              this.ready = T;
            },
            { en: 1, rate: 0.6 },
          ),
        ),
      );
    },
    // Pista: el botón de la boca cuando ya está encendido.
    hint() {
      return this.ready && !this.busy ? { x: 1240, y: 640, r: 120 } : null;
    },
    // Dibuja a Polly (se balancea mientras habla), la tarjeta de la palabra con su nombre y el botón de la boca.
    draw() {
      cfg.bg();
      const it = this.t;
      if (!it) return;
      ctx.save();
      ctx.translate(380, 560);
      ctx.rotate(this.ready ? 0 : Math.sin(T * 6) * 0.06);
      pic('polly', 0, 0, 360);
      ctx.restore();
      const ap = clamp((T - this.in) * 3, 0, 1);
      enCard(it, 860, 420, 420, {
        s: (ap < 1 ? back(ap) : 1) * hv('en:rep', hR(860, 420, 420, 420)),
        label: true,
        bg: it.col === '#FFFFFF' ? '#E9F3FA' : null,
      });
      const on = this.ready && !this.busy,
        b = on ? hv('en:boca', hR(1240, 640, 220, 220)) * (1 + 0.05 * Math.sin(T * 5)) : 1;
      ctx.save();
      ctx.translate(1240, 640);
      ctx.scale(b, b);
      ctx.globalAlpha = on ? 1 : 0.45;
      circ(0, 0, 110, on ? '#FFD66B' : '#fff', 6);
      pic('boca', 0, -10, 130);
      ctx.restore();
    },
    // Toque: la tarjeta o Polly repiten la palabra; el botón encendido cuenta la ronda (Polly felicita) y pasa a la siguiente.
    down(x: number, y: number) {
      if (this.busy || !this.t) return;
      if (inR(x, y, 860, 420, 420, 420) || dist(x, y, 380, 560) < 170) {
        this.prompt!();
        return;
      }
      if (dist(x, y, 1240, 640) < 115) {
        if (!this.ready) {
          SFX.tap();
          return;
        }
        this.busy = true;
        SFX.good();
        burst(1240, 640, 26);
        rec(cfg.key || 'ingles', true);
        onRight(true);
        this.done++;
        scene!.starPop = T;
        sayMix(['@' + this.t.en + '!', praise()], () =>
          later(400, () => {
            this.i++;
            if (this.i >= R) onDone();
            else this.round();
          }),
        );
        return;
      }
      SFX.tap();
      sparkles(x, y, 3);
    },
  };
}

// 6) El teléfono rojo (fase I3 de docs/PLAN-INGLES.md): suena el teléfono, el niño lo coge y Polly pide una cosa.
// Juego "El teléfono rojo" (tipo enTelefono). cfg: {items, bg, key}. Cada ronda el teléfono suena y tiembla hasta que
// el niño lo toca; entonces Polly pide una cosa en inglés («The ball, please!») y hay que tocarla entre 3 o 4 tarjetas.
// Dos fallos quitan la tarjeta equivocada, como en ¿Dónde está?; solo el primer fallo de la ronda cuenta en rec.
export function EnTelefono(cfg: Config, onDone: AlTerminar): Juego {
  const pool: PalabraEn[] = cfg.items,
    R = Math.min(nRounds(), pool.length);
  let order = shuffle(pool.slice());
  return {
    total: R,
    done: 0,
    i: 0,
    items: [],
    // Al empezar: explica el juego y hace sonar el teléfono.
    enter() {
      later(300, () =>
        sayQ('¡Suena el teléfono rojo! Cógelo tocándolo y escucha lo que pide Polly.', () => this.round!()),
      );
    },
    // Prepara una ronda: el teléfono suena (ring) y las tarjetas esperan escondidas hasta que se coge.
    round() {
      const t = order[this.i % order.length],
        n = clamp(nOpts() + 1, 3, Math.min(4, pool.length)),
        others = shuffle(pool.filter((w) => w !== t)).slice(0, n - 1);
      this.t = t;
      this.items = shuffle([t, ...others]).map((o) => ({ it: o, ok: o === t }));
      enGrid(this.items, 200, 620, 860, 1110);
      this.errs = 0;
      this.busy = false;
      this.ring = T;
      this.nr = 0;
      this.call = 0;
    },
    // Polly pide la cosa por teléfono (solo cuando ya se ha cogido).
    prompt() {
      if (this.call) sayMix(['@' + cap(this.t.en.toLowerCase()) + ', please!']);
      else say('Toca el teléfono para cogerlo.');
    },
    // Cada cuadro, mientras suena: el timbre (dos notas) cada 1,4 s.
    update(dt: number) {
      if (!this.ring) return;
      this.nr -= dt;
      if (this.nr <= 0) {
        this.nr = 1.4;
        for (let k = 0; k < 6; k++) tone(k % 2 ? 1320 : 1180, 0.07, 'square', 0.12, 0, k * 0.08);
      }
    },
    // Pista: el teléfono si suena; si no, la tarjeta pedida (cuando ya se ha dicho).
    hint() {
      if (this.ring) return { x: 330, y: 560, r: 150 };
      const c = this.items.find((c: Libre) => c.ok && !c.win);
      return c && this.call && T - this.call > 1.5 ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja el teléfono (tiembla mientras suena; cogido, con Polly al lado) y, si ya se ha cogido, las tarjetas.
    draw() {
      cfg.bg();
      const sh = this.ring ? Math.sin(T * 40) * 6 : 0;
      ctx.save();
      ctx.translate(330 + sh, 600);
      ctx.scale(hv('en:tel', hR(330, 560, 300, 300)), hv('en:tel', hR(330, 560, 300, 300)));
      card(-130, -60, 260, 150, '#E8554E', 6, 30);
      circ(0, 20, 52, '#fff', 5);
      for (let k = 0; k < 10; k++) {
        const a = -PI / 2 + (k * PI * 2) / 10;
        circ(Math.cos(a) * 36, 20 + Math.sin(a) * 36, 6, '#3B3330', 0);
      }
      ctx.beginPath();
      ctx.moveTo(-120, 0);
      ctx.bezierCurveTo(
        -200,
        -40,
        this.ring ? -170 : -90,
        this.ring ? -100 : -240,
        this.ring ? -130 : -40,
        this.ring ? -110 : -250,
      );
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#3B3330';
      ctx.stroke();
      ctx.save();
      ctx.translate(this.ring ? 0 : 20, this.ring ? -110 - Math.abs(Math.sin(T * 20)) * 10 : -250);
      if (!this.ring) ctx.rotate(-0.35);
      card(-150, -28, 300, 56, '#C9443A', 6, 28);
      circ(-130, 0, 36, '#C9443A', 6);
      circ(130, 0, 36, '#C9443A', 6);
      ctx.restore();
      ctx.restore();
      if (this.ring) {
        for (const k of [0, 1, 2]) {
          ctx.globalAlpha = 0.6 - k * 0.18;
          ctx.beginPath();
          ctx.arc(330, 470, 90 + k * 34 + ((T * 60) % 34), -PI * 0.85, -PI * 0.15);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#E8554E';
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        return;
      }
      ctx.save();
      ctx.translate(200, 250);
      ctx.rotate(Math.sin(T * 2) * 0.05);
      pic('polly', 0, 0, 190);
      ctx.restore();
      for (const c of this.items) {
        if (c.gone && T - c.gone > 0.4) continue;
        const ap = clamp((T - this.call) * 3, 0, 1);
        ctx.save();
        if (c.gone) ctx.globalAlpha = Math.max(0, 1 - (T - c.gone) * 2.5);
        enCard(c.it, c.x, c.y, c.s, {
          s: (ap < 1 ? back(ap) : 1) * (c.win ? 1 + 0.1 * Math.sin((T - c.win) * 12) : hv(c, hR(c.x, c.y, c.s, c.s))),
          shake: c.shake,
          glow: !!c.win,
          label: !!c.win,
          bg: c.it.col === '#FFFFFF' ? '#E9F3FA' : null,
        });
        ctx.restore();
      }
    },
    // Toque: el teléfono que suena se coge (Polly pide); cogido, vuelve a pedir. La tarjeta pedida es acierto (rec,
    // onRight y otra llamada); una equivocada dice qué es y vuelve a pedir.
    down(x: number, y: number) {
      if (this.busy) return;
      if (dist(x, y, 330, 560) < 170) {
        if (this.ring) {
          this.ring = 0;
          SFX.pop();
          this.call = T;
          later(300, () => this.prompt!());
        } else this.prompt!();
        return;
      }
      if (this.ring) {
        SFX.tap();
        return;
      }
      const c = this.items.find((c: Libre) => !c.gone && inR(x, y, c.x, c.y, c.s, c.s));
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (c.win) return;
      if (c.ok) {
        this.busy = true;
        c.win = T;
        SFX.good();
        burst(c.x, c.y, 30);
        rec(cfg.key || 'ingles', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        sayMix(['@' + c.it.en + '!', '@Thank you!', praise()], () =>
          later(400, () => {
            this.i++;
            if (this.i >= R) onDone();
            else {
              if (this.i % order.length === 0) order = shuffle(pool.slice());
              this.round();
            }
          }),
        );
      } else {
        SFX.bad();
        c.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles', false);
        this.errs++;
        sayMix(['Ese es', '@' + c.it.en, '. Polly pide', '@' + this.t.en]);
        if (this.errs === 2) {
          onWrongTwice();
          c.gone = T;
        }
      }
    },
  };
}

// 7) Viste a Polly (fase I4 de docs/PLAN-INGLES.md): Polly pide una prenda de un color y el niño se la pone.
// PRENDAS: las cuatro prendas del juego, con su nombre en inglés y en castellano y su centro en el dibujo de Polly
// (POLLY_SVG, de 200x230): el gorro, las gafas, la bufanda y las botas.
const PRENDAS = [
  { id: 'hat', en: 'Hat', es: 'el gorro', cx: 100, cy: 26 },
  { id: 'glasses', en: 'Glasses', es: 'las gafas', cx: 100, cy: 64 },
  { id: 'scarf', en: 'Scarf', es: 'la bufanda', cx: 100, cy: 124 },
  { id: 'boots', en: 'Boots', es: 'las botas', cx: 100, cy: 204 },
];
// COLORES_ROPA: los colores de las prendas (de ENC), los de los 3 años primero.
const COLORES_ROPA = ['red', 'blue', 'yellow', 'green', 'pink', 'orange', 'purple'];
// drawPrenda(id, c): dibuja la prenda id de color c (clave de ENC) en las coordenadas del dibujo de Polly (200x230);
// quien llama ya ha movido y escalado el lienzo (sobre Polly o en una tarjeta).
function drawPrenda(id: string, c: string) {
  const f = ENC[c] ?? '#fff';
  ctx.lineJoin = 'round';
  if (id === 'hat') {
    ctx.beginPath();
    ctx.ellipse(100, 48, 48, 44, 0, PI, PI * 2);
    ctx.closePath();
    fillStroke(f, 5);
    card(50, 36, 100, 20, '#fff', 5, 10);
    circ(100, 2, 13, '#fff', 5);
  } else if (id === 'glasses') {
    for (const x of [80, 120]) {
      circ(x, 64, 21, 'rgba(255,255,255,.35)', 0);
      circ(x, 64, 21, null, 7, f);
      circ(x, 64, 24, null, 2.5);
    }
    ctx.beginPath();
    ctx.moveTo(99, 62);
    ctx.lineTo(101, 62);
    ctx.lineWidth = 7;
    ctx.strokeStyle = f;
    ctx.stroke();
  } else if (id === 'scarf') {
    card(116, 118, 22, 48, f, 5, 8);
    card(56, 108, 88, 22, f, 5, 11);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (const x of [74, 96, 118]) ctx.fillRect(x, 112, 6, 14);
    ctx.fillRect(119, 140, 16, 5);
  } else {
    for (const x of [80, 120]) {
      card(x - 18, 184, 36, 30, f, 5, 9);
      card(x - 20, 206, 46, 14, f, 5, 7);
    }
  }
}
// Juego "Viste a Polly" (tipo enViste). cfg: {bg, key}. Cuatro rondas, una por prenda (en orden barajado): Polly pide
// «Put on the red hat!» y hay que tocar esa prenda entre 3 tarjetas (3 años) o 4 del mismo tipo y distinto color; a los
// 5 años, una de las tarjetas es otra prenda del mismo color. Lo acertado se le queda puesto a Polly. Dos fallos
// quitan la tarjeta equivocada.
export function EnViste(cfg: Config, onDone: AlTerminar): Juego {
  const orden = shuffle(PRENDAS.slice()) as typeof PRENDAS,
    R = orden.length,
    puesto: { id: string; c: string }[] = [];
  const nc = AGE() <= 3 ? 4 : 7;
  return {
    total: R,
    done: 0,
    i: 0,
    items: [],
    // Al empezar: explica el juego y saca la primera prenda.
    enter() {
      later(300, () => sayQ('¡Vamos a vestir a Polly! Escucha qué se quiere poner y tócalo.', () => this.round!()));
    },
    // Prepara una ronda: la prenda y el color pedidos, y las tarjetas (mismo tipo y otros colores; a los 5 años,
    // también otra prenda del mismo color).
    round() {
      const p = orden[this.i],
        c = pick(COLORES_ROPA.slice(0, nc)),
        n = AGE() <= 3 ? 3 : 4;
      const otros = shuffle(COLORES_ROPA.slice(0, nc).filter((x) => x !== c)).map((x) => ({ p, c: x }));
      const lista = [{ p, c }, ...otros.slice(0, n - 1)];
      if (AGE() >= 5) {
        const q = pick(PRENDAS.filter((x) => x !== p));
        lista[n - 1] = { p: q, c };
      }
      this.t = { p, c };
      this.items = shuffle(lista).map((o) => ({ ...o, ok: o.p === p && o.c === c }));
      enGrid(this.items, 200, 620, 900, 1120);
      this.errs = 0;
      this.busy = false;
      this.lock = true;
      later(300, () =>
        this.prompt!(() => {
          this.lock = false;
        }),
      );
      later(3000, () => {
        this.lock = false;
      });
    },
    // Polly pide la prenda en inglés: «Put on the red hat!».
    prompt(cb?: () => void) {
      sayMix(['@Put on the ' + this.t.c + ' ' + this.t.p.en.toLowerCase() + '!'], cb);
    },
    // Pista: la tarjeta buena (cuando ya ha terminado de pedirla).
    hint() {
      const c = this.items.find((c: Libre) => c.ok && !c.win);
      return c && !this.lock ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja a Polly con lo que ya lleva puesto, el botón de volver a escuchar y las tarjetas de las prendas.
    draw() {
      cfg.bg();
      const PS = 420,
        PX = 330,
        PY = 520;
      ctx.save();
      ctx.translate(PX, PY);
      ctx.rotate(Math.sin(T * 1.6) * 0.03);
      pic('polly', 0, 0, PS);
      ctx.translate(-PS / 2, -PS / 2);
      ctx.scale(PS / 200, PS / 230);
      for (const r of puesto) drawPrenda(r.id, r.c);
      ctx.restore();
      {
        const s = hv('en:spk', hR(330, 170, 220, 84));
        ctx.save();
        ctx.translate(330, 170);
        ctx.scale(s, s);
        card(-110, -42, 220, 84, '#fff', 6, 42);
        speaker(-40, 0, 60);
        pic('oreja', 40, 0, 60);
        ctx.restore();
      }
      if (!this.t) return;
      for (const c of this.items) {
        if (c.gone && T - c.gone > 0.4) continue;
        const sh = c.shake ? Math.sin((T - c.shake) * 40) * 10 * Math.max(0, 1 - (T - c.shake) * 2.5) : 0,
          k = c.win ? 1 + 0.1 * Math.sin((T - c.win) * 12) : hv(c, hR(c.x, c.y, c.s, c.s));
        ctx.save();
        if (c.gone) ctx.globalAlpha = Math.max(0, 1 - (T - c.gone) * 2.5);
        ctx.translate(c.x + sh, c.y);
        ctx.scale(k, k);
        card(-c.s / 2, -c.s / 2, c.s, c.s, c.win ? '#FFF3B0' : '#fff', 7, 36);
        const z = c.s / (c.p.id === 'hat' || c.p.id === 'glasses' ? 120 : 110);
        ctx.scale(z, z);
        ctx.translate(-c.p.cx, -c.p.cy);
        drawPrenda(c.p.id, c.c);
        ctx.restore();
      }
    },
    // Toque: el altavoz repite; la tarjeta buena se le pone a Polly (acierto, rec y siguiente prenda; al final, Polly
    // vestida); una equivocada dice qué es y vuelve a pedir (solo el primer fallo de la ronda cuenta en rec).
    down(x: number, y: number) {
      if (inR(x, y, 330, 170, 220, 84)) {
        this.prompt!();
        return;
      }
      if (this.busy || !this.t) return;
      const c = this.items.find((c: Libre) => !c.gone && inR(x, y, c.x, c.y, c.s, c.s));
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (c.win) return;
      const nombre = (o: Libre) => '@The ' + o.c + ' ' + o.p.en.toLowerCase();
      if (this.lock && !c.ok) {
        sayMix([nombre(c)]);
        return;
      }
      if (c.ok) {
        this.busy = true;
        c.win = T;
        puesto.push({ id: c.p.id, c: c.c });
        SFX.good();
        burst(330, 520, 30);
        rec(cfg.key || 'ingles-clothes', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        sayMix([nombre(c) + '!', praise()], () =>
          later(400, () => {
            this.i++;
            if (this.i >= R) {
              SFX.tada();
              say('¡Qué guapa está Polly!', () => later(300, onDone));
            } else this.round();
          }),
        );
      } else {
        SFX.bad();
        c.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles-clothes', false);
        this.errs++;
        sayMix(['Ese es', nombre(c), '. Polly quiere', nombre(this.t)]);
        if (this.errs === 2) {
          onWrongTwice();
          c.gone = T;
        }
      }
    },
  };
}

// Las canciones en inglés del Parque de Londres (fase I4 de docs/PLAN-INGLES.md), para Song (juegos/comps2.ts): Polly
// canta cada palabra en inglés (en:1) y después hay que tocar la que pide (3 años) o todas en orden. n es lo que se
// pide, en castellano; n2, lo que se dice al acertar, en inglés.
// cancionIngles(lineas, tune): la configuración de Song para las palabras lineas, cada una con su verso.
export function cancionIngles(lineas: [PalabraEn, string][], tune: string): Config {
  const a3 = AGE() <= 3;
  return {
    tune,
    s: 200,
    mode: a3 ? 'pedido' : 'orden',
    key: 'cancion',
    intro: '¡Vamos a cantar en inglés con Polly! Escucha.',
    ask2: a3
      ? '¡Ahora jugamos! Toca lo que te digo.'
      : '¡Ahora te toca a ti! Toca los dibujos en el orden de la canción.',
    okAll: '¡Bravo! ¡Qué bien cantas en inglés!',
    lines: lineas.map(([w, verso]) => ({
      say: verso,
      draw: w.draw || ((x: number, y: number, s: number) => enDraw(w, x, y, s)),
      n: w.es.toLowerCase(),
      n2: w.en + '!',
      en: 1,
    })),
  };
}
Object.assign(SONGS, {
  // Los saludos: hola, buenos días, gracias y buenas noches.
  enHello: () =>
    cancionIngles(
      ['Hello', 'Good morning', 'Thank you', 'Good night'].map((e) => {
        const w = EN.hello.find((x) => x.en === e)!;
        return [w, `${e}, ${e.toLowerCase()}!`] as [PalabraEn, string];
      }),
      'dias',
    ),
  // Los colores: 4, 5 o 6 según la edad.
  enColors: () =>
    cancionIngles(
      EN.colors
        .slice(0, AGE() <= 3 ? 4 : AGE() === 4 ? 5 : 6)
        .map((w) => [w, `${w.en}, ${w.en.toLowerCase()}, ${w.en.toLowerCase()}!`] as [PalabraEn, string]),
      'colores',
    ),
  // Los números: del 1 al 5 (3 años), al 7 (4) o al 10 (5).
  enNumbers: () =>
    cancionIngles(
      EN.numbers.slice(0, AGE() <= 3 ? 5 : AGE() === 4 ? 7 : 10).map((w) => [w, w.en + '!'] as [PalabraEn, string]),
      'dias',
    ),
});

// Juegos del inglés para usar en los temas: t (tipo de juego que reconoce makeGame), icon y name (nombre en el camino).
export const ENG: Record<string, JuegoTema> = {
  conocer: { t: 'enConocer', icon: 'oreja', name: 'Escucha y repite' },
  escucha: { t: 'enEscucha', icon: 'busca', name: '¿Dónde está?' },
  globos: { t: 'enGlobos', icon: 'globo', name: 'Revienta los globos' },
  cuenta: { t: 'enCuenta', icon: 'manzana', name: 'Contar en inglés' },
  // Desde la fase I3: los dos juegos nuevos de la Playa Hello.
  repite: { t: 'enRepite', icon: 'boca', name: 'Repite conmigo' },
  telefono: { t: 'enTelefono', icon: 'oreja', name: 'El teléfono rojo' },
  // Desde la fase I4: los juegos nuevos del Parque de Londres y sus canciones en inglés (SONGS de temas/extras.ts).
  viste: { t: 'enViste', icon: 'gorro', name: 'Viste a Polly' },
  dice: { t: 'enDice', icon: 'vaca', name: 'Sonidos de la granja' },
  cantaHola: { t: 'cancion', song: 'enHello', icon: 'notas', name: 'Canta los saludos' },
  cantaColores: { t: 'cancion', song: 'enColors', icon: 'pinturas', name: 'Canta los colores' },
  cantaNumeros: { t: 'cancion', song: 'enNumbers', icon: 'bloques', name: 'Canta los números' },
};
// Temas de inglés (casitas de la Playa Hello, zona 'playaHello' desde la fase I2; antes, del Rincón del inglés, zona
// 'ingles'; se abren en orden). Campos: id, n (nombre), icon, c (color),
// bg (fondo de los juegos), zone, en (conjunto de palabras de EN), tip (consejo para la familia en la zona de adultos),
// games (lista de juegos de ENG).
export const ING: Tema[] = [
  {
    id: 'EN-HELLO',
    n: 'Los saludos en inglés',
    icon: 'mano',
    c: '#5BB8E6',
    bg: BG.aula,
    zone: 'playaHello',
    en: 'hello',
    tip: 'saludarse en inglés al llegar y al irse: hello, good morning, good night.',
    games: [ENG.conocer, ENG.escucha, ENG.globos],
  },
  {
    id: 'EN-COLORS',
    n: 'Los colores en inglés',
    icon: 'pinturas',
    c: '#FF5A5A',
    bg: BG.colores,
    zone: 'playaHello',
    en: 'colors',
    tip: 'jugar a "I spy": buscar en casa cosas red, blue, yellow...',
    games: [ENG.conocer, ENG.escucha, ENG.globos],
  },
  {
    id: 'EN-NUMBERS',
    n: 'Los números en inglés',
    icon: 'bloques',
    c: '#7CC86E',
    bg: BG.aula,
    zone: 'playaHello',
    en: 'numbers',
    tip: 'contar en inglés los escalones o los juguetes: one, two, three...',
    games: [ENG.conocer, ENG.cuenta, ENG.escucha],
  },
  {
    id: 'EN-ANIMALS',
    n: 'Los animales en inglés',
    icon: 'perro',
    c: '#FFA94D',
    bg: BG.granja,
    zone: 'playaHello',
    en: 'animals',
    tip: 'mirar un libro de animales y nombrarlos en inglés.',
    games: [ENG.conocer, ENG.escucha, ENG.globos],
  },
  // Desde la fase I3, las otras 6 casitas de la Playa Hello (van detrás de las 4 del rincón, con ids nuevos).
  {
    id: 'EN-FAMILY',
    n: 'La familia en inglés',
    icon: 'mama',
    c: '#F58BB4',
    bg: BG.casa,
    zone: 'playaHello',
    en: 'family',
    tip: 'nombrar en inglés a la familia en las fotos de casa: mum, dad, baby...',
    games: [ENG.conocer, ENG.escucha, ENG.repite],
  },
  {
    id: 'EN-BODY',
    n: 'Mi cuerpo en inglés',
    icon: 'nariz',
    c: '#FFA94D',
    bg: BG.cuerpo,
    zone: 'playaHello',
    en: 'body',
    tip: 'jugar a tocarse la nariz, los ojos o las manos diciéndolo en inglés.',
    games: [ENG.conocer, ENG.repite, ENG.escucha],
  },
  {
    id: 'EN-TOYS',
    n: 'Los juguetes en inglés',
    icon: 'pelota',
    c: '#5B8DEF',
    bg: BG.aula,
    zone: 'playaHello',
    en: 'toys',
    tip: 'al recoger, pedir los juguetes en inglés: the ball, please.',
    games: [ENG.conocer, ENG.telefono, ENG.globos],
  },
  {
    id: 'EN-FRUIT',
    n: 'La fruta en inglés',
    icon: 'manzana',
    c: '#7CC86E',
    bg: BG.huerta,
    zone: 'playaHello',
    en: 'fruit',
    tip: 'en la compra o en la merienda, decir la fruta en inglés: apple, banana...',
    games: [ENG.conocer, ENG.globos, ENG.telefono],
  },
  {
    id: 'EN-SHAPES',
    n: 'Las formas en inglés',
    icon: 'formas',
    c: '#9B8AD9',
    bg: BG.colores,
    zone: 'playaHello',
    en: 'shapes',
    tip: 'buscar formas por la calle: a circle, a square, a triangle.',
    games: [ENG.conocer, ENG.escucha, ENG.globos],
  },
  {
    id: 'EN-BEACH',
    n: 'Fiesta de la playa',
    icon: 'globo',
    c: '#FFD66B',
    bg: BG.mar,
    zone: 'playaHello',
    en: 'beach',
    tip: 'repasar con la familia las palabras en inglés que ya sabe.',
    games: [ENG.escucha, ENG.repite, ENG.telefono],
  },
];
// ING_PARQUE: las 12 casitas del Parque de Londres (zona 'parqueLondres', 4 años; fase I4 de docs/PLAN-INGLES.md), con
// los mismos campos que ING. La primera repasa la playa y la última es la fiesta del parque.
export const ING_PARQUE: Tema[] = [
  {
    id: 'EN-REVIEW',
    n: 'Repaso de la playa',
    icon: 'pelotaPlaya',
    c: '#5BB8E6',
    bg: BG.playa,
    zone: 'parqueLondres',
    en: 'beach',
    tip: 'preguntar en inglés por lo que ya sabe: what colour is it?',
    games: [ENG.escucha, ENG.globos, ENG.telefono],
  },
  {
    id: 'EN-CLOTHES',
    n: 'La ropa en inglés',
    icon: 'gorro',
    c: '#E8554E',
    bg: BG.dormitorio,
    zone: 'parqueLondres',
    en: 'clothes',
    tip: 'al vestirse, nombrar la ropa en inglés: put on your coat!',
    games: [ENG.conocer, ENG.escucha, ENG.viste],
  },
  {
    id: 'EN-FOOD',
    n: 'La comida en inglés',
    icon: 'helado',
    c: '#FFA94D',
    bg: BG.cocina,
    zone: 'parqueLondres',
    en: 'food',
    tip: 'en la mesa, pedir las cosas en inglés: milk, please.',
    games: [ENG.conocer, ENG.telefono, ENG.globos],
  },
  {
    id: 'EN-HOUSE',
    n: 'Mi casa en inglés',
    icon: 'sofa',
    c: '#9B8AD9',
    bg: BG.casa,
    zone: 'parqueLondres',
    en: 'house',
    tip: 'buscar por casa la bed, la table o el sofa.',
    games: [ENG.conocer, ENG.escucha, ENG.repite],
  },
  {
    id: 'EN-WEATHER',
    n: 'El tiempo en inglés',
    icon: 'nublado',
    c: '#7FB0FF',
    bg: BG.lluvia,
    zone: 'parqueLondres',
    en: 'weather',
    tip: 'mirar por la ventana y decir qué tiempo hace: sunny, rainy...',
    games: [ENG.conocer, ENG.escucha, ENG.repite],
  },
  {
    id: 'EN-TRANSPORT',
    n: 'Los transportes en inglés',
    icon: 'autobus',
    c: '#E8554E',
    bg: BG.ciudad,
    zone: 'parqueLondres',
    en: 'transport',
    tip: 'por la calle, nombrar los coches, autobuses y bicis en inglés.',
    games: [ENG.conocer, ENG.globos, ENG.telefono],
  },
  {
    id: 'EN-FARM',
    n: 'La granja en inglés',
    icon: 'vaca',
    c: '#7CC86E',
    bg: BG.granja,
    zone: 'parqueLondres',
    en: 'farm',
    tip: 'imitar a los animales en inglés: the cow says moo.',
    games: [ENG.conocer, ENG.dice, ENG.escucha],
  },
  {
    id: 'EN-ACTIONS',
    n: 'Lo que hacemos',
    icon: 'rana',
    c: '#4FC3C7',
    bg: BG.parque,
    zone: 'parqueLondres',
    en: 'actions',
    tip: 'jugar a hacer lo que se dice en inglés: run, jump, sleep.',
    games: [ENG.conocer, ENG.repite, ENG.escucha],
  },
  {
    id: 'EN-OPPOSITES',
    n: 'Grande y pequeño',
    icon: 'elefante',
    c: '#FFD66B',
    bg: BG.conceptos,
    zone: 'parqueLondres',
    en: 'opposites',
    tip: 'buscar cosas big y small en casa.',
    games: [ENG.conocer, ENG.escucha, ENG.globos],
  },
  {
    id: 'EN-FEELINGS',
    n: 'Cómo me siento',
    icon: 'emociones',
    c: '#F58BB4',
    bg: BG.aula,
    zone: 'parqueLondres',
    en: 'feelings',
    tip: 'preguntar cada día en inglés: are you happy?',
    games: [ENG.conocer, ENG.escucha, ENG.repite],
  },
  {
    id: 'EN-SONGS',
    n: 'Canciones del parque',
    icon: 'notas',
    c: '#5B8DEF',
    bg: BG.fiesta,
    zone: 'parqueLondres',
    en: 'colors',
    tip: 'cantar juntos en inglés los colores y los números.',
    games: [ENG.cantaHola, ENG.cantaColores, ENG.cantaNumeros],
  },
  {
    id: 'EN-PARK',
    n: 'Fiesta del parque',
    icon: 'globo',
    c: '#FFD66B',
    bg: BG.parque,
    zone: 'parqueLondres',
    en: 'park',
    tip: 'repasar con la familia las palabras en inglés del parque.',
    games: [ENG.escucha, ENG.viste, ENG.telefono],
  },
];
// Los juegos de inglés (tipo en..., en un tema con en) los crea makeGame (temas/hacerJuego.ts), con las palabras de su edad.
