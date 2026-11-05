// temas/inglesPueblo.ts: el Pueblo de los Cuentos, la tercera zona de la Isla del Inglés (5 años; fase I5 de
// docs/PLAN-INGLES.md).
// Para qué sirve: añade a EN (temas/ingles.ts) las palabras del pueblo (los días, las estaciones, dónde está, me gusta,
//   cosas de colores, los números del 11 al 20, los oficios, la tienda, los cuentos y la gran fiesta), define sus
//   juegos nuevos (EnPollySays, EnMeGusta, EnQueEs, EnBingo, EnAutobus y EnCuento) con sus dos cuentos (CUENTOS_INGLES),
//   la canción de los días en inglés (SONGS.enDays) y las 12 casitas del pueblo (ING_PUEBLO). Los juegos los crea
//   makeGame (temas/hacerJuego.ts).
// Va en temas/indice.ts después de ingles.ts. Exporta: EnPollySays, EnMeGusta, EnQueEs, EnBingo, EnAutobus, EnCuento,
//   CUENTOS_INGLES, ING_PUEBLO y el tipo CuentoIngles. ING_PUEBLO se añade a TEMAS en escenas/escenas2d.ts y a la zona
//   'puebloCuentos' en escenas/zonas.ts.
// Importa: de temas/ingles.ts (EN, ENG, sayMix, enDraw, enCard, enGrid, enNum, enDeIsla, enItems y
//   cancionIngles), SONGS (temas/extras.ts), el núcleo (dibujo, voz, sonidos, AGE, rec, onRight...) y de juegos/ BG y
//   drawFace.
// Voz: las palabras en inglés van con '@' en sayMix (la voz inglesa del navegador); lo demás, en castellano.
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements, ts-patterns/no-nested-ternary,
   ts-patterns/no-param-reassign -- posiciones y tamaños en la pantalla de 1600x900 y edades de las palabras, con el mismo
   estilo que los juegos de inglés de temas/ingles.ts (bucles de dibujo y componentes con estado). */
import type { AlTerminar, Config, Juego, JuegoTema, Libre, Tema } from '../juegos/tipos.ts';
import {
  DIAC,
  LF,
  PI,
  SFX,
  T,
  W,
  H,
  back,
  burst,
  card,
  circ,
  clamp,
  ctx,
  dist,
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
  sayQ,
  scene,
  shuffle,
  sparkles,
  speaker,
  text,
} from '../nucleo/indice.ts';
import { BG, drawFace } from '../juegos/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { SONGS } from './extras.ts';
import { EN, ENG, cancionIngles, enCard, enDeIsla, enDraw, enGrid, enItems, enNum, sayMix } from './ingles.ts';
import type { PalabraEn } from './ingles.ts';

/* ================= LAS PALABRAS DEL PUEBLO ================= */
// enDia(i, c): devuelve una función de dibujo (x,y,s) de una hoja de calendario del día i (0 = lunes) con su
// abreviatura en inglés ('MON') y el color c.
function enDia(i: number, c: string) {
  return (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    card(-s * 0.36, -s * 0.34, s * 0.72, s * 0.7, '#fff', Math.max(4, s * 0.025), s * 0.08);
    card(-s * 0.36, -s * 0.34, s * 0.72, s * 0.2, c, Math.max(4, s * 0.025), s * 0.08);
    text(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i] ?? '', 0, -s * 0.19, s * 0.13, '#fff', { f: LF });
    text(String(i + 1), 0, s * 0.24, s * 0.3, c, { f: LF });
    ctx.restore();
  };
}
// mesa(x, y, w): una mesa sencilla de ancho w (el tablero arriba, en y - w*.1, y dos patas), sin nada encima (el dibujo
// 'mesa' de PICS trae cosas encima y confundiría con la pelota).
function mesa(x: number, y: number, w: number) {
  const lw = Math.max(3, w * 0.03);
  card(x - w / 2, y - w * 0.1, w, w * 0.08, '#C98A4B', lw, w * 0.03);
  for (const d of [-0.38, 0.38]) card(x + w * d - w * 0.03, y - w * 0.03, w * 0.06, w * 0.36, '#A86B43', lw, w * 0.02);
}
// enDonde(m): devuelve una función de dibujo (x,y,s) de una pelota y un sitio (dónde está): 'in' (dentro de la caja), 'on'
// (encima de la mesa), 'under' (debajo), 'next' (al lado), 'behind' (detrás: se ve un poco por encima de la mesa) y
// 'front' (delante de la mesa, tapándola).
function enDonde(m: string) {
  return (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    const b = s * 0.26;
    if (m === 'in') {
      pic('pelota', 0, -s * 0.08, b);
      pic('cajaCarton', 0, s * 0.12, s * 0.62);
    } else if (m === 'behind') {
      pic('pelota', s * 0.08, -s * 0.04, b);
      mesa(0, s * 0.08, s * 0.7);
    } else {
      mesa(m === 'next' ? -s * 0.12 : 0, s * 0.06, m === 'next' ? s * 0.56 : s * 0.7);
      if (m === 'on') pic('pelota', 0, -s * 0.1, b);
      else if (m === 'under') pic('pelota', 0, s * 0.22, b * 0.9);
      else if (m === 'next') pic('pelota', s * 0.3, s * 0.22, b);
      else pic('pelota', -s * 0.1, s * 0.3, b * 1.2);
    }
    ctx.restore();
  };
}
// Los conjuntos del pueblo. Cada uno tiene al menos cuatro palabras para los 3 años, para que sus juegos funcionen a
// cualquier edad en modo libre.
Object.assign(EN, {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((en, i) => ({
    en,
    es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i]!,
    a: i < 4 ? 3 : i < 6 ? 4 : 5,
    draw: enDia(i, DIAC[i % DIAC.length] ?? '#5B8DEF'),
  })),
  seasons: enDeIsla('seasons'),
  jobs: enDeIsla('jobs'),
  shop: enDeIsla('shop'),
  where: (
    [
      ['In', 'Dentro', 'in', 3],
      ['On', 'Encima', 'on', 3],
      ['Under', 'Debajo', 'under', 3],
      ['Next to', 'Al lado', 'next', 3],
      ['Behind', 'Detrás', 'behind', 4],
      ['In front of', 'Delante', 'front', 5],
    ] as [string, string, string, number][]
  ).map(([en, es, m, a]) => ({ en, es, a, draw: enDonde(m) })),
  likes: (
    [
      ['Apples', 'Manzanas', 'manzana', 3],
      ['Bananas', 'Plátanos', 'banana', 3],
      ['Ice cream', 'Helado', 'helado', 3],
      ['Cake', 'Tarta', 'tarta', 3],
      ['Milk', 'Leche', 'leche', 4],
      ['Cheese', 'Queso', 'queso', 4],
      ['Carrots', 'Zanahorias', 'zanahoria', 4],
      ['Chocolate', 'Chocolate', 'chocolate', 5],
      ['Biscuits', 'Galletas', 'galleta', 5],
    ] as [string, string, string, number][]
  ).map(([en, es, k, a]) => ({ en, es, a, k })),
  colourThings: (
    [
      ['A red apple', 'Una manzana roja', 'manzana', 3],
      ['A yellow banana', 'Un plátano amarillo', 'banana', 3],
      ['A green frog', 'Una rana verde', 'rana', 3],
      ['A blue whale', 'Una ballena azul', 'ballena', 3],
      ['An orange carrot', 'Una zanahoria naranja', 'zanahoria', 4],
      ['A pink pig', 'Un cerdo rosa', 'cerdo', 4],
      ['Purple grapes', 'Uvas moradas', 'uva', 5],
      ['A brown bear', 'Un oso marrón', 'oso', 5],
    ] as [string, string, string, number][]
  ).map(([en, es, k, a]) => ({ en, es, a, k })),
  numbers20: [
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
    'Twenty',
  ].map((en, i) => ({
    en,
    es: ['Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve', 'Veinte'][
      i
    ]!,
    n: i + 11,
    a: i < 4 ? 3 : i < 7 ? 4 : 5,
    draw: enNum(i + 11),
  })),
  story: (
    [
      ['Sun', 'Sol', 'sol'],
      ['Dog', 'Perro', 'perro'],
      ['Cat', 'Gato', 'gato'],
      ['Ball', 'Pelota', 'pelota'],
      ['Umbrella', 'Paraguas', 'paraguas'],
      ['Fridge', 'Nevera', 'nevera'],
      ['Milk', 'Leche', 'leche'],
      ['Egg', 'Huevo', 'huevo'],
      ['Apple', 'Manzana', 'manzana'],
    ] as [string, string, string][]
  ).map(([en, es, k], i) => ({ en, es, a: i < 5 ? 3 : 4, k })),
});
// EN.whatis: las cosas de ¿Qué es? (de los animales, los juguetes y la fruta, solo las que tienen dibujo de PICS).
EN.whatis = ['animals', 'toys', 'fruit'].flatMap((c) => EN[c].filter((w) => w.k && w.a <= 4).slice(0, 4));
// EN.town: la Gran fiesta del inglés, con tres palabras de los 3 o 4 años de cada casita del pueblo que tienen dibujo
// de PICS (el bingo y la fiesta usan dibujos).
EN.town = ['seasons', 'likes', 'colourThings', 'jobs', 'shop', 'story']
  .flatMap((c) => EN[c].filter((w) => w.k && w.a <= 4).slice(0, 3))
  .filter((w, i, L) => L.findIndex((v) => v.k === w.k) === i);

// La canción de los días de la semana en inglés (para Song, con cancionIngles de temas/ingles.ts).
Object.assign(SONGS, {
  enDays: () =>
    cancionIngles(
      EN.days.map((w) => [w, w.en + '!'] as [PalabraEn, string]),
      'dias',
    ),
});

// boton(x, y, w, h, id, dibuja): pinta un botón redondeado (crece con el ratón encima, id para hv) y dentro lo que
// dibuja dibuja(); para los botones de volver a escuchar y los de sí/no.
function boton(x: number, y: number, w: number, h: number, id: string, dibuja: () => void, fondo = '#fff') {
  const s = hv(id, hR(x, y, w, h));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  card(-w / 2, -h / 2, w, h, fondo, 6, Math.min(w, h) / 2);
  dibuja();
  ctx.restore();
}
// botonOir(x, y): el botón de volver a escuchar (altavoz y oreja), de 220x84.
const botonOir = (x: number, y: number) =>
  boton(x, y, 220, 84, 'en:spk', () => {
    speaker(-40, 0, 60);
    pic('oreja', 40, 0, 60);
  });
// nombreDe(w): la palabra w en minúsculas para meterla en una frase inglesa ('the dog').
const nombreDe = (w: PalabraEn) => w.en.toLowerCase();

/* ================= LOS JUEGOS NUEVOS ================= */
// 1) Polly says (como «Simón dice»). Juego tipo enPollySays. cfg: {items, bg, key}. En cada ronda hay 3 tarjetas y la
// señal de stop. Polly dice «Polly says: touch the dog!» (hay que tocarlo) o solo «Touch the dog!» (no hay que hacerlo:
// se toca el stop). La primera ronda siempre lleva «Polly says». Solo el primer fallo de la ronda cuenta en rec.
export function EnPollySays(cfg: Config, onDone: AlTerminar): Juego {
  const pool: PalabraEn[] = cfg.items,
    R = nRounds();
  return {
    total: R,
    done: 0,
    i: 0,
    items: [],
    // Al empezar: explica el juego y saca la primera ronda.
    enter() {
      later(300, () =>
        sayQ(
          'Haz lo que diga Polly, pero solo si empieza con «Polly says». Si no lo dice, toca la señal de stop.',
          () => this.round!(),
        ),
      );
    },
    // Prepara una ronda: la cosa pedida, si Polly lo dice de verdad (dice) y las tarjetas.
    round() {
      const t = pick(pool),
        others = shuffle(pool.filter((w) => w !== t)).slice(0, 2);
      this.t = t;
      this.dice = this.i === 0 || azar() < 0.6;
      this.items = shuffle([t, ...others]).map((o) => ({ it: o, ok: o === t }));
      enGrid(this.items, 260, 520, 1000, 820);
      this.errs = 0;
      this.busy = false;
      later(300, () => this.prompt!());
    },
    // Polly da la orden (con o sin «Polly says»).
    prompt() {
      sayMix([(this.dice ? '@Polly says: touch the ' : '@Touch the ') + nombreDe(this.t) + '!']);
    },
    // Pista: la tarjeta (si Polly lo ha dicho) o el stop.
    hint() {
      if (!this.t || this.busy) return null;
      if (!this.dice) return { x: 1460, y: 520, r: 120 };
      const c = this.items.find((c: Libre) => c.ok);
      return c ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja el botón de volver a escuchar, a Polly, las tarjetas y la señal de stop.
    draw() {
      cfg.bg();
      botonOir(330, 160);
      ctx.save();
      ctx.translate(240, 560);
      ctx.rotate(Math.sin(T * 1.6) * 0.05);
      pic('polly', 0, 0, 280);
      ctx.restore();
      for (const c of this.items)
        enCard(c.it, c.x, c.y, c.s, {
          s: c.win ? 1 + 0.1 * Math.sin((T - c.win) * 12) : hv(c, hR(c.x, c.y, c.s, c.s)),
          shake: c.shake,
          glow: !!c.win,
          label: !!c.win,
        });
      const s = this.stopT ? 1 + 0.1 * Math.sin((T - this.stopT) * 12) : hv('en:stop', hC2(1460, 520, 110));
      ctx.save();
      ctx.translate(1460, 520);
      ctx.scale(s, s);
      senalStop();
      ctx.restore();
    },
    // fin(ok): cuenta la ronda (acierto o no, según los fallos) y pasa a la siguiente o termina.
    fin(frase: string[]) {
      this.busy = true;
      rec(cfg.key || 'ingles', this.errs === 0);
      onRight(this.errs === 0);
      this.done++;
      scene!.starPop = T;
      sayMix(frase, () =>
        later(400, () => {
          this.i++;
          if (this.i >= R) onDone();
          else this.round!();
        }),
      );
    },
    // Toque: el altavoz repite; el stop acierta si Polly no lo ha dicho; la tarjeta pedida acierta si lo ha dicho.
    down(x: number, y: number) {
      if (inR(x, y, 330, 160, 220, 84)) {
        this.prompt!();
        return;
      }
      if (this.busy || !this.t) return;
      const fallo = (frase: string[]) => {
        SFX.bad();
        if (this.errs === 0) rec(cfg.key || 'ingles', false);
        this.errs++;
        if (this.errs >= 2) onWrongTwice();
        sayMix(frase);
      };
      if (dist(x, y, 1460, 520) < 115) {
        if (!this.dice) {
          this.stopT = T;
          SFX.good();
          burst(1460, 520, 24);
          this.fin!(['¡Muy bien! Polly no ha dicho «Polly says».']);
        } else
          fallo([
            '¡Sí lo ha dicho! Escucha otra vez:',
            (this.dice ? '@Polly says: touch the ' : '@Touch the ') + nombreDe(this.t) + '!',
          ]);
        return;
      }
      const c = this.items.find((c: Libre) => inR(x, y, c.x, c.y, c.s, c.s));
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (c.ok && this.dice) {
        c.win = T;
        SFX.good();
        burst(c.x, c.y, 26);
        this.fin!(['@' + c.it.en + '!', praise()]);
        return;
      }
      c.shake = T;
      if (c.ok) fallo(['¡Cuidado! Polly no ha dicho «Polly says». Toca la señal de stop.']);
      else fallo(['Ese es', '@' + c.it.en]);
    },
  };
}
// senalStop(): la señal de stop (octógono rojo con STOP, sobre su poste), centrada en (0, 0).
function senalStop() {
  card(-8, 40, 16, 190, '#BDBDC6', 5, 6);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = PI / 8 + (i * PI) / 4;
    ctx.lineTo(Math.cos(a) * 100, Math.sin(a) * 100);
  }
  ctx.closePath();
  ctx.fillStyle = '#E8554E';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#3B3330';
  ctx.stroke();
  text('STOP', 0, 22, 58, '#fff', { f: LF });
}
// hC2(x, y, r): ¿el ratón está dentro del círculo (x, y, r)? (como hC de nucleo/puntero.ts, con la distancia al ratón).
function hC2(x: number, y: number, r: number) {
  return hR(x, y, r * 2, r * 2);
}

// 2) Me gusta (I like). Juego tipo enMeGusta. cfg: {items, bg, key}. Polly dice «I like apples!» o «I don't like
// apples!» y el niño toca la carita contenta o la triste. Siempre hay un dibujo grande de la cosa.
export function EnMeGusta(cfg: Config, onDone: AlTerminar): Juego {
  const pool: PalabraEn[] = shuffle(cfg.items.slice()) as PalabraEn[],
    R = Math.min(nRounds(), pool.length);
  return {
    total: R,
    done: 0,
    i: 0,
    // Al empezar: explica el juego.
    enter() {
      later(300, () =>
        sayQ('Escucha a Polly. Si le gusta, toca la carita contenta. Si no le gusta, la triste.', () => this.round!()),
      );
    },
    // Prepara una ronda: la cosa y si le gusta (le gusta).
    round() {
      this.t = pool[this.i];
      this.legusta = azar() < 0.5;
      this.in = T;
      this.errs = 0;
      this.busy = false;
      this.res = null;
      later(300, () => this.prompt!());
    },
    // Polly dice si le gusta.
    prompt() {
      sayMix([(this.legusta ? '@I like ' : "@I don't like ") + nombreDe(this.t) + '!']);
    },
    // Pista: la carita buena.
    hint() {
      return this.t && !this.busy ? { x: this.legusta ? 1080 : 1360, y: 620, r: 110 } : null;
    },
    // Dibuja a Polly, la cosa grande, el botón de volver a escuchar y las dos caritas.
    draw() {
      cfg.bg();
      botonOir(330, 160);
      ctx.save();
      ctx.translate(300, 560);
      ctx.rotate(Math.sin(T * 1.6) * 0.05);
      pic('polly', 0, 0, 300);
      ctx.restore();
      if (!this.t) return;
      const ap = clamp((T - this.in) * 3, 0, 1);
      ctx.save();
      ctx.translate(760, 440);
      ctx.scale(ap < 1 ? back(ap) : 1, ap < 1 ? back(ap) : 1);
      card(-180, -180, 360, 360, '#fff', 7, 40);
      enDraw(this.t, 0, 0, 290);
      ctx.restore();
      for (const [x, m, ok] of [
        [1080, 'alegria', true],
        [1360, 'tristeza', false],
      ] as [number, string, boolean][]) {
        const s = this.res === ok ? 1 + 0.1 * Math.sin(T * 12) : hv('en:cara' + m, hR(x, 620, 220, 220));
        ctx.save();
        ctx.translate(x, 620);
        ctx.scale(s, s);
        drawFace(0, 0, 100, m);
        ctx.restore();
      }
    },
    // Toque: el altavoz o la cosa repiten; la carita buena cuenta la ronda, la otra explica qué ha dicho Polly.
    down(x: number, y: number) {
      if (inR(x, y, 330, 160, 220, 84) || inR(x, y, 760, 440, 360, 360)) {
        this.prompt!();
        return;
      }
      if (this.busy || !this.t) return;
      for (const [cx, ok] of [
        [1080, true],
        [1360, false],
      ] as [number, boolean][]) {
        if (dist(x, y, cx, 620) > 110) continue;
        if (ok === this.legusta) {
          this.busy = true;
          this.res = ok;
          SFX.good();
          burst(cx, 620, 26);
          rec(cfg.key || 'ingles', this.errs === 0);
          onRight(this.errs === 0);
          this.done++;
          scene!.starPop = T;
          sayMix([ok ? '¡Sí! A Polly le gusta.' : '¡Eso es! A Polly no le gusta.', praise()], () =>
            later(400, () => {
              this.i++;
              if (this.i >= R) onDone();
              else this.round!();
            }),
          );
        } else {
          SFX.bad();
          if (this.errs === 0) rec(cfg.key || 'ingles', false);
          this.errs++;
          if (this.errs >= 2) onWrongTwice();
          sayMix(['Escucha bien:', (this.legusta ? '@I like ' : "@I don't like ") + nombreDe(this.t) + '!']);
        }
        return;
      }
      SFX.tap();
      sparkles(x, y, 3);
    },
  };
}

// 3) What is it? Juego tipo enQueEs. cfg: {items, bg, key}. Un dibujo sale escondido detrás de una ventana redonda que
// se abre poco a poco; Polly pregunta «What is it?» y hay que tocar ese dibujo entre 3 tarjetas. Al acertar, Polly
// dice «It's a dog!». Dos fallos quitan la tarjeta equivocada.
export function EnQueEs(cfg: Config, onDone: AlTerminar): Juego {
  const pool: PalabraEn[] = cfg.items,
    R = Math.min(nRounds(), pool.length);
  let order = shuffle(pool.slice()) as PalabraEn[];
  return {
    total: R,
    done: 0,
    i: 0,
    items: [],
    // Al empezar: primera ronda.
    enter() {
      later(300, () => sayQ('Hay algo escondido. Mira bien y toca lo que es.', () => this.round!()));
    },
    // Prepara una ronda: la cosa escondida (y dónde se asoma: dx, dy) y las tarjetas.
    round() {
      const t = order[this.i % order.length]!,
        n = clamp(nOpts() + 1, 3, Math.min(4, pool.length)),
        others = shuffle(pool.filter((w) => w !== t)).slice(0, n - 1);
      this.t = t;
      this.in = T;
      this.dx = (azar() - 0.5) * 120;
      this.dy = (azar() - 0.5) * 120;
      this.items = shuffle([t, ...others]).map((o) => ({ it: o, ok: o === t }));
      enGrid(this.items, 560, 300, 1100, 960);
      this.errs = 0;
      this.busy = false;
      later(300, () => this.prompt!());
    },
    // Polly pregunta qué es.
    prompt() {
      sayMix(['@What is it?']);
    },
    // Pista: la tarjeta buena, cuando la ventana ya está bastante abierta.
    hint() {
      const c = this.items.find((c: Libre) => c.ok && !c.win);
      return c && T - this.in > 3 ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja la ventana (un círculo que crece y deja ver un trozo del dibujo grande), a Polly y las tarjetas.
    draw() {
      cfg.bg();
      botonOir(330, 160);
      ctx.save();
      ctx.translate(250, 600);
      pic('polly', 0, 0, 260);
      ctx.restore();
      if (!this.t) return;
      const r = this.busy ? 190 : clamp(40 + (T - this.in) * 22, 40, 150);
      ctx.save();
      ctx.translate(900, 290);
      card(-200, -200, 400, 400, '#3B3330', 7, 40);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, PI * 2);
      ctx.clip();
      ctx.fillStyle = '#FFF6E6';
      ctx.fillRect(-200, -200, 400, 400);
      enDraw(this.t, this.busy ? 0 : this.dx, this.busy ? 0 : this.dy, this.busy ? 330 : 620);
      ctx.restore();
      for (const c of this.items) {
        if (c.gone && T - c.gone > 0.4) continue;
        ctx.save();
        if (c.gone) ctx.globalAlpha = Math.max(0, 1 - (T - c.gone) * 2.5);
        enCard(c.it, c.x, c.y, c.s, {
          s: c.win ? 1 + 0.1 * Math.sin((T - c.win) * 12) : hv(c, hR(c.x, c.y, c.s, c.s)),
          shake: c.shake,
          glow: !!c.win,
          label: !!c.win,
        });
        ctx.restore();
      }
    },
    // Toque: el altavoz repite; la tarjeta buena abre la ventana del todo (acierto); otra dice qué es.
    down(x: number, y: number) {
      if (inR(x, y, 330, 160, 220, 84)) {
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
      if (c.ok) {
        this.busy = true;
        c.win = T;
        SFX.good();
        burst(900, 290, 30);
        rec(cfg.key || 'ingles', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        // /^[aeiou]/i: ¿la palabra empieza por vocal? (acepta «Apple» y «egg»; rechaza «Dog»): «an apple», «a dog».
        sayMix(["@It's " + (/^[aeiou]/i.test(c.it.en) ? 'an ' : 'a ') + nombreDe(c.it) + '!', praise()], () =>
          later(500, () => {
            this.i++;
            if (this.i >= R) onDone();
            else {
              if (this.i % order.length === 0) order = shuffle(pool.slice()) as PalabraEn[];
              this.round!();
            }
          }),
        );
      } else {
        SFX.bad();
        c.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles', false);
        this.errs++;
        sayMix(['Ese es', '@' + c.it.en]);
        if (this.errs === 2) {
          onWrongTwice();
          c.gone = T;
        }
      }
    },
  };
}

// 4) Bingo. Juego tipo enBingo. cfg: {items, bg, key}. Un cartón de 6 dibujos (2 filas de 3). Polly canta los dibujos
// de uno en uno, en desorden, y el niño tapa con una ficha el que ha cantado. Con los 6 tapados: «Bingo!». Cada ficha
// es una estrella; solo el primer fallo de cada palabra cuenta en rec.
export function EnBingo(cfg: Config, onDone: AlTerminar): Juego {
  const carton = (shuffle(cfg.items.filter((w: PalabraEn) => w.k || w.draw)) as PalabraEn[])
    .slice(0, 6)
    .map((it) => ({ it, on: 0, x: 0, y: 0, s: 0, shake: 0 }));
  carton.forEach((c, i) => {
    c.s = 220;
    c.x = 750 + (i % 3) * 270;
    c.y = 350 + Math.floor(i / 3) * 250;
  });
  const orden = shuffle(carton.slice()) as typeof carton;
  const R = carton.length;
  return {
    total: R,
    done: 0,
    k: 0,
    // Al empezar: explica el juego y canta el primero.
    enter() {
      later(300, () =>
        sayQ('¡Jugamos al bingo! Polly dice una palabra en inglés y tú tapas ese dibujo.', () => {
          this.errs = 0;
          this.prompt!();
        }),
      );
    },
    // Polly canta la palabra que toca.
    prompt() {
      const c = orden[this.k];
      if (c) sayMix(['@' + c.it.en + '!']);
    },
    // Pista: el dibujo cantado.
    hint() {
      const c = orden[this.k];
      return c && !this.busy ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja el cartón (las casillas tapadas llevan una ficha de color), a Polly y el botón de volver a escuchar.
    draw() {
      cfg.bg();
      botonOir(330, 160);
      ctx.save();
      ctx.translate(250, 600);
      ctx.rotate(Math.sin(T * 1.6) * 0.05);
      pic('polly', 0, 0, 280);
      ctx.restore();
      card(570, 190, 900, 590, '#FFE9C2', 7, 40);
      text('BINGO', 1020, 245, 50, '#E8554E', { f: LF });
      for (const [i, c] of carton.entries()) {
        ctx.save();
        if (c.shake) ctx.translate(Math.sin((T - c.shake) * 40) * 10 * Math.max(0, 1 - (T - c.shake) * 2.5), 0);
        enCard(c.it, c.x, c.y + 30, c.s, { s: c.on ? 1 : hv(c, hR(c.x, c.y + 30, c.s, c.s)) });
        ctx.restore();
        if (c.on) {
          const k = clamp((T - c.on) * 4, 0, 1);
          ctx.globalAlpha = 0.85;
          circ(c.x, c.y + 30, c.s * 0.36 * back(k), DIAC[i % DIAC.length] ?? '#FFC93C', 6);
          ctx.globalAlpha = 1;
        }
      }
      if (this.fin) {
        const k = clamp((T - this.fin) * 3, 0, 1);
        ctx.save();
        ctx.translate(1020, 480);
        ctx.scale(back(k), back(k));
        card(-260, -90, 520, 180, '#fff', 8, 60);
        text('BINGO!', 0, 30, 100, '#E8554E', { f: LF });
        ctx.restore();
      }
    },
    // Toque: el altavoz repite; el dibujo cantado se tapa (acierto y el siguiente); otro dice qué es.
    down(x: number, y: number) {
      if (inR(x, y, 330, 160, 220, 84)) {
        this.prompt!();
        return;
      }
      if (this.busy || this.fin) return;
      const c = carton.find((c) => inR(x, y, c.x, c.y + 30, c.s, c.s));
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (c.on) return;
      const want = orden[this.k]!;
      if (c === want) {
        c.on = T;
        SFX.pop();
        SFX.good();
        burst(c.x, c.y + 30, 20);
        rec(cfg.key || 'ingles', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        this.k++;
        this.errs = 0;
        this.busy = true;
        if (this.k >= R) {
          later(500, () => {
            this.fin = T;
            SFX.tada();
            burst(1020, 480, 60);
            sayMix(['@Bingo!', '¡Has tapado todo el cartón!'], () => later(500, onDone));
          });
        } else
          sayMix(['@' + c.it.en + '!'], () =>
            later(500, () => {
              this.busy = false;
              this.prompt!();
            }),
          );
      } else {
        SFX.bad();
        c.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles', false);
        this.errs++;
        if (this.errs >= 2) onWrongTwice();
        sayMix(['Ese es', '@' + c.it.en, '. Polly ha dicho', '@' + want.it.en]);
      }
    },
  };
}

// 5) El autobús de Londres. Juego tipo enAutobus. cfg: {bg, key}. En la parada esperan animales; Polly dice cuál sube
// («The cat gets on the bus!») y, al tocarlo, se sienta en una ventana del autobús rojo de dos pisos. Con las 4
// ventanas llenas, el autobús se va. Las palabras son los animales (EN.animals) de la edad del niño.
export function EnAutobus(cfg: Config, onDone: AlTerminar): Juego {
  const pool = (shuffle(enItems('animals').slice()) as PalabraEn[]).slice(0, 5),
    R = 4;
  const espera = pool.map((it, i) => ({ it, x: 240 + i * 140, y: 700, s: 130, bus: -1, shake: 0 }));
  // ventana(i): el centro de la ventana i del piso de arriba del autobús.
  const ventana = (i: number, bx: number) => ({ x: bx - 250 + i * 150, y: 300 });
  return {
    total: R,
    done: 0,
    i: 0,
    bx: 1270,
    // Al empezar: explica el juego y pide el primero.
    enter() {
      later(300, () => sayQ('¡El autobús de Londres! Escucha qué animal sube y tócalo.', () => this.round!()));
    },
    // Elige el animal que sube ahora (uno de los que esperan).
    round() {
      this.t = pick(espera.filter((p) => p.bus < 0));
      this.errs = 0;
      this.busy = false;
      later(200, () => this.prompt!());
    },
    // Polly dice quién sube.
    prompt() {
      if (this.t) sayMix(['@The ' + nombreDe(this.t.it) + ' gets on the bus!']);
    },
    // Pista: el animal que sube.
    hint() {
      return this.t && !this.busy ? { x: this.t.x, y: this.t.y, r: 90 } : null;
    },
    // Cada cuadro: al final, el autobús se va hacia la derecha.
    update(dt: number) {
      if (this.fin) this.bx += dt * 420;
    },
    // Dibuja la parada, el autobús rojo de dos pisos (con los animales en sus ventanas) y los que esperan.
    draw() {
      cfg.bg();
      botonOir(330, 160);
      const bx = this.bx;
      ctx.fillStyle = '#8A8A92';
      ctx.fillRect(0, 790, W, H - 790);
      card(80, 520, 24, 270, '#5B8DEF', 5, 8);
      card(40, 470, 104, 70, '#fff', 5, 20);
      text('BUS', 92, 518, 32, '#E8554E', { f: LF });
      card(bx - 380, 190, 700, 520, '#E8554E', 7, 40);
      ctx.fillStyle = '#C9443A';
      ctx.fillRect(bx - 374, 440, 688, 14);
      for (let i = 0; i < 4; i++) {
        const v = ventana(i, bx);
        card(v.x - 60, v.y - 70, 120, 130, '#CDEBFA', 5, 16);
        const p = espera.find((p) => p.bus === i);
        if (p) enDraw(p.it, v.x, v.y - 5, 110);
      }
      for (let i = 0; i < 3; i++) card(bx - 330 + i * 150, 490, 110, 110, '#CDEBFA', 5, 16);
      card(bx + 170, 480, 100, 200, '#F3D9A0', 5, 12);
      for (const x of [bx - 230, bx + 190]) {
        circ(x, 720, 58, '#3B3330', 6);
        circ(x, 720, 24, '#BDBDC6', 4);
      }
      for (const p of espera) {
        if (p.bus >= 0) continue;
        ctx.save();
        if (p.shake) ctx.translate(Math.sin((T - p.shake) * 40) * 10 * Math.max(0, 1 - (T - p.shake) * 2.5), 0);
        const s = hv(p, hR(p.x, p.y, p.s, p.s));
        ctx.translate(p.x, p.y + Math.sin(T * 3 + p.x) * 4);
        ctx.scale(s, s);
        enDraw(p.it, 0, 0, p.s);
        ctx.restore();
      }
    },
    // Toque: el altavoz repite; el animal pedido sube al autobús (acierto); otro dice qué animal es.
    down(x: number, y: number) {
      if (inR(x, y, 330, 160, 220, 84)) {
        this.prompt!();
        return;
      }
      if (this.busy || this.fin || !this.t) return;
      const p = espera.find((p) => p.bus < 0 && inR(x, y, p.x, p.y, p.s, p.s));
      if (!p) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (p === this.t) {
        this.busy = true;
        p.bus = this.i;
        SFX.pop();
        SFX.good();
        const v = ventana(this.i, this.bx);
        burst(v.x, v.y, 24);
        rec(cfg.key || 'ingles-animals', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        sayMix(['@' + p.it.en + '!', praise()], () =>
          later(300, () => {
            this.i++;
            if (this.i >= R) {
              this.fin = T;
              SFX.whoosh();
              sayMix(['@Goodbye, bus!'], () => later(600, onDone));
            } else this.round!();
          }),
        );
      } else {
        SFX.bad();
        p.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles-animals', false);
        this.errs++;
        if (this.errs >= 2) onWrongTwice();
        sayMix(['Ese es', '@' + p.it.en, '. Sube', '@' + nombreDe(this.t.it)]);
      }
    },
  };
}

// 6) Cuentos en inglés. Un cuento corto en castellano con las palabras importantes en inglés.
/** Un cuento de la isla: título, páginas (fondo de BG, trozos para sayMix y dibujos [clave, x, y, tamaño]) y las
 * palabras de las preguntas del final ([inglés, clave de PICS]). */
export interface CuentoIngles {
  titulo: string;
  paginas: { bg: string; partes: string[]; cosas: [string, number, number, number][] }[];
  preguntas: [string, string][];
}
// CUENTOS_INGLES: los cuentos del Pueblo de los Cuentos, por nombre (el de su juego en la casita EN-STORIES).
export const CUENTOS_INGLES: Record<string, CuentoIngles> = {
  paseo: {
    titulo: 'El paseo de Polly',
    paginas: [
      {
        bg: 'parque',
        partes: ['Un día de', '@sun', ', Polly salió a pasear por el parque.'],
        cosas: [
          ['sol', 1340, 220, 220],
          ['polly', 800, 560, 320],
        ],
      },
      {
        bg: 'parque',
        partes: ['En el parque vio un', '@dog', 'y un', '@cat', '.'],
        cosas: [
          ['perro', 620, 600, 280],
          ['gato', 1000, 600, 260],
        ],
      },
      {
        bg: 'parque',
        partes: ['El', '@dog', 'jugaba con una', '@ball', '.'],
        cosas: [
          ['perro', 700, 600, 300],
          ['pelota', 1050, 640, 180],
        ],
      },
      {
        bg: 'parque',
        partes: ['Entonces empezó a llover. Polly abrió su', '@umbrella', '.'],
        cosas: [
          ['lluvia', 1200, 260, 240],
          ['paraguas', 800, 420, 280],
          ['polly', 800, 640, 260],
        ],
      },
      {
        bg: 'parque',
        partes: ['Y volvió a casa muy contenta.', '@Goodbye!'],
        cosas: [
          ['casa', 1100, 540, 360],
          ['polly', 660, 600, 280],
        ],
      },
    ],
    preguntas: [
      ['Dog', 'perro'],
      ['Ball', 'pelota'],
      ['Umbrella', 'paraguas'],
      ['Sun', 'sol'],
    ],
  },
  merienda: {
    titulo: 'La merienda de Tito',
    paginas: [
      {
        bg: 'cocina',
        partes: ['Tito tenía mucha hambre y abrió la', '@fridge', '.'],
        cosas: [
          ['nevera', 1060, 500, 380],
          ['tito', 620, 620, 300],
        ],
      },
      {
        bg: 'cocina',
        partes: ['Dentro había', '@milk', ', un', '@egg', 'y una', '@apple', '.'],
        cosas: [
          ['leche', 640, 520, 220],
          ['huevo', 900, 560, 180],
          ['manzana', 1160, 540, 200],
        ],
      },
      {
        bg: 'cocina',
        partes: ['Tito se comió la', '@apple', '. ¡Ñam, ñam!'],
        cosas: [
          ['manzana', 1040, 500, 240],
          ['tito', 680, 620, 300],
        ],
      },
      {
        bg: 'cocina',
        partes: ['Después se bebió la', '@milk', 'y le dijo a Polly:', '@Thank you, Polly!'],
        cosas: [
          ['vaso', 1000, 520, 200],
          ['polly', 1300, 560, 260],
          ['tito', 640, 620, 300],
        ],
      },
    ],
    preguntas: [
      ['Fridge', 'nevera'],
      ['Milk', 'leche'],
      ['Egg', 'huevo'],
      ['Apple', 'manzana'],
    ],
  },
};
// Juego "Cuentos en inglés" (tipo enCuento). cfg: {cuento (clave de CUENTOS_INGLES), bg, key}. Fase 'leer': cada página
// se cuenta sola con sayMix (castellano e inglés) y la flecha pasa a la siguiente. Fase 'preguntas': Polly pide las
// palabras del cuento («Toca the dog») entre 3 dibujos; una estrella por pregunta acertada.
export function EnCuento(cfg: Config, onDone: AlTerminar): Juego {
  const C = CUENTOS_INGLES[cfg.cuento] ?? CUENTOS_INGLES.paseo!,
    P = C.paginas,
    Q = C.preguntas;
  return {
    total: Q.length,
    done: 0,
    fase: 'leer',
    pg: 0,
    q: 0,
    items: [],
    // Al empezar: dice el título y cuenta la primera página.
    enter() {
      later(300, () => sayQ(C.titulo + '.', () => this.leer!()));
    },
    // Cuenta la página actual y después enseña la flecha (listo).
    leer() {
      this.listo = 0;
      this.inP = T;
      sayMix(P[this.pg]!.partes, () => {
        this.listo = T;
      });
    },
    // Prepara la pregunta q: la palabra pedida y otras dos del cuento.
    pregunta() {
      const [en, k] = Q[this.q]!,
        otros = shuffle(Q.filter((x) => x[1] !== k)).slice(0, 2) as [string, string][];
      this.items = shuffle([[en, k], ...otros]).map(([e, kk]) => ({
        it: { en: e, es: '', a: 3, k: kk },
        ok: kk === k,
      }));
      enGrid(this.items, 240, 560, 1200);
      this.errs = 0;
      this.busy = false;
      this.prompt!();
    },
    // Repite: la página (leyendo) o la pregunta.
    prompt() {
      if (this.fase === 'leer')
        sayMix(P[this.pg]!.partes, () => {
          this.listo = T;
        });
      else sayMix(['Toca', '@' + (Q[this.q]?.[0] ?? '')]);
    },
    // Pista: la flecha (leyendo, cuando ya ha terminado la página) o el dibujo pedido.
    hint() {
      if (this.fase === 'leer') return this.listo ? { x: 1480, y: 780, r: 80 } : null;
      const c = this.items.find((c: Libre) => c.ok && !c.win);
      return c && !this.busy ? { x: c.x, y: c.y, r: c.s * 0.6 } : null;
    },
    // Dibuja la página (fondo, dibujos y la flecha) o las tarjetas de la pregunta.
    draw() {
      if (this.fase === 'leer') {
        const p = P[this.pg]!;
        (BG[p.bg] ?? cfg.bg)();
        const ap = clamp((T - this.inP) * 3, 0, 1);
        for (const [k, x, y, s] of p.cosas) {
          ctx.save();
          ctx.translate(x, y + Math.sin(T * 2 + x) * 4);
          ctx.scale(ap < 1 ? back(ap) : 1, ap < 1 ? back(ap) : 1);
          pic(k, 0, 0, s);
          ctx.restore();
        }
        if (this.listo) {
          const s = hv('en:flecha', hR(1480, 780, 150, 150)) * (1 + 0.05 * Math.sin(T * 5));
          ctx.save();
          ctx.translate(1480, 780);
          ctx.scale(s, s);
          circ(0, 0, 70, '#7CC86E', 6);
          ctx.beginPath();
          ctx.moveTo(-26, -30);
          ctx.lineTo(30, 0);
          ctx.lineTo(-26, 30);
          ctx.closePath();
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.restore();
        }
        return;
      }
      cfg.bg();
      botonOir(800, 140);
      for (const c of this.items) {
        if (c.gone && T - c.gone > 0.4) continue;
        ctx.save();
        if (c.gone) ctx.globalAlpha = Math.max(0, 1 - (T - c.gone) * 2.5);
        enCard(c.it, c.x, c.y, c.s, {
          s: c.win ? 1 + 0.1 * Math.sin((T - c.win) * 12) : hv(c, hR(c.x, c.y, c.s, c.s)),
          shake: c.shake,
          glow: !!c.win,
          label: !!c.win,
        });
        ctx.restore();
      }
    },
    // Toque: leyendo, la flecha pasa de página (al final, empiezan las preguntas); en las preguntas, como ¿Dónde está?.
    down(x: number, y: number) {
      if (this.fase === 'leer') {
        if (this.listo && dist(x, y, 1480, 780) < 80) {
          SFX.tap();
          this.pg++;
          if (this.pg >= P.length) {
            this.fase = 'preguntas';
            sayQ('¿Te has fijado? Ahora te pregunto.', () => this.pregunta!());
          } else this.leer!();
        } else {
          SFX.tap();
          sparkles(x, y, 3);
        }
        return;
      }
      if (inR(x, y, 800, 140, 220, 84)) {
        this.prompt!();
        return;
      }
      if (this.busy) return;
      const c = this.items.find((c: Libre) => !c.gone && inR(x, y, c.x, c.y, c.s, c.s));
      if (!c) {
        SFX.tap();
        sparkles(x, y, 3);
        return;
      }
      if (c.ok) {
        this.busy = true;
        c.win = T;
        SFX.good();
        burst(c.x, c.y, 26);
        rec(cfg.key || 'ingles', this.errs === 0);
        onRight(this.errs === 0);
        this.done++;
        scene!.starPop = T;
        sayMix(['@' + c.it.en + '!', praise()], () =>
          later(400, () => {
            this.q++;
            if (this.q >= Q.length) onDone();
            else this.pregunta!();
          }),
        );
      } else {
        SFX.bad();
        c.shake = T;
        if (this.errs === 0) rec(cfg.key || 'ingles', false);
        this.errs++;
        sayMix(['Ese es', '@' + c.it.en]);
        if (this.errs === 2) {
          onWrongTwice();
          c.gone = T;
        }
      }
    },
  };
}

/* ================= LAS CASITAS DEL PUEBLO ================= */
// Los juegos nuevos del pueblo, para las casitas (como ENG de temas/ingles.ts; se le añaden).
Object.assign(ENG, {
  pollySays: { t: 'enPollySays', icon: 'stop', name: 'Polly says' },
  meGusta: { t: 'enMeGusta', icon: 'corazon', name: 'Me gusta' },
  queEs: { t: 'enQueEs', icon: 'lupa', name: 'What is it?' },
  bingo: { t: 'enBingo', icon: 'estrella', name: 'Bingo' },
  autobus: { t: 'enAutobus', icon: 'autobus', name: 'El autobús de Londres' },
  cantaDias: { t: 'cancion', song: 'enDays', icon: 'calendario', name: 'Canta los días' },
  cuentoPaseo: { t: 'enCuento', cuento: 'paseo', icon: 'paraguas', name: 'El paseo de Polly' },
  cuentoMerienda: { t: 'enCuento', cuento: 'merienda', icon: 'nevera', name: 'La merienda de Tito' },
} as Record<string, JuegoTema>);
// ING_PUEBLO: las 12 casitas del Pueblo de los Cuentos (zona 'puebloCuentos', 5 años), con los campos de ING.
export const ING_PUEBLO: Tema[] = [
  {
    id: 'EN-DAYS',
    n: 'Los días de la semana',
    icon: 'calendario',
    c: '#5B8DEF',
    bg: BG.semana,
    zone: 'puebloCuentos',
    en: 'days',
    tip: 'decir cada mañana qué día es en inglés: today is Monday.',
    games: [ENG.conocer!, ENG.cantaDias!, ENG.escucha!],
  },
  {
    id: 'EN-SEASONS',
    n: 'Las estaciones en inglés',
    icon: 'hojaNaranja',
    c: '#FFA94D',
    bg: BG.otono,
    zone: 'puebloCuentos',
    en: 'seasons',
    tip: 'al salir a la calle, decir en qué estación estamos: autumn, winter...',
    games: [ENG.conocer!, ENG.escucha!, ENG.repite!],
  },
  {
    id: 'EN-WHERE',
    n: '¿Dónde está? In, on, under',
    icon: 'cajaCarton',
    c: '#A86B43',
    bg: BG.casa,
    zone: 'puebloCuentos',
    en: 'where',
    tip: 'esconder un juguete y decir dónde está: in the box, under the table.',
    games: [ENG.conocer!, ENG.escucha!, ENG.repite!],
  },
  {
    id: 'EN-SIMON',
    n: 'Polly says',
    icon: 'stop',
    c: '#E8554E',
    bg: BG.parque,
    zone: 'puebloCuentos',
    en: 'animals',
    tip: 'jugar a «Polly says» en casa: Polly says touch your nose!',
    games: [ENG.pollySays!, ENG.escucha!, ENG.pollySays!],
  },
  {
    id: 'EN-ILIKE',
    n: 'Me gusta: I like',
    icon: 'corazon',
    c: '#F58BB4',
    bg: BG.cocina,
    zone: 'puebloCuentos',
    en: 'likes',
    tip: 'en la comida, decir lo que nos gusta: I like apples!',
    games: [ENG.conocer!, ENG.meGusta!, ENG.telefono!],
  },
  {
    id: 'EN-WHAT',
    n: 'What is it?',
    icon: 'lupa',
    c: '#9B8AD9',
    bg: BG.aula,
    zone: 'puebloCuentos',
    en: 'whatis',
    tip: 'tapar un dibujo con la mano, enseñar un trozo y preguntar: what is it?',
    games: [ENG.queEs!, ENG.escucha!, ENG.queEs!],
  },
  {
    id: 'EN-COLOURTHINGS',
    n: 'Cosas de colores',
    icon: 'pinturas',
    c: '#7CC86E',
    bg: BG.colores,
    zone: 'puebloCuentos',
    en: 'colourThings',
    tip: 'nombrar las cosas con su color en inglés: a red apple, a yellow banana.',
    games: [ENG.conocer!, ENG.escucha!, ENG.repite!],
  },
  {
    id: 'EN-COUNT20',
    n: 'Contar hasta 20',
    icon: 'bloques',
    c: '#FFD66B',
    bg: BG.aula,
    zone: 'puebloCuentos',
    en: 'numbers20',
    tip: 'contar en inglés más allá del diez: eleven, twelve, thirteen...',
    games: [ENG.conocer!, ENG.escucha!, ENG.globos!],
  },
  {
    id: 'EN-JOBS',
    n: 'Los oficios en inglés',
    icon: 'medico',
    c: '#4FC3C7',
    bg: BG.ciudad,
    zone: 'puebloCuentos',
    en: 'jobs',
    tip: 'al ver a alguien trabajando, decir su oficio: a doctor, a farmer...',
    games: [ENG.conocer!, ENG.escucha!, ENG.telefono!],
  },
  {
    id: 'EN-SHOP',
    n: 'La tienda de Polly',
    icon: 'tienda',
    c: '#FF8A7A',
    bg: BG.ciudad,
    zone: 'puebloCuentos',
    en: 'shop',
    tip: 'jugar a las tiendas pidiendo en inglés: an apple, please.',
    games: [ENG.conocer!, ENG.telefono!, ENG.bingo!],
  },
  {
    id: 'EN-STORIES',
    n: 'Cuentos en inglés',
    icon: 'cuento',
    c: '#B9A6F0',
    bg: BG.parque,
    zone: 'puebloCuentos',
    en: 'story',
    tip: 'contar cuentos de siempre metiendo alguna palabra en inglés.',
    games: [ENG.cuentoPaseo!, ENG.cuentoMerienda!, ENG.escucha!],
  },
  {
    id: 'EN-TOWN',
    n: 'Gran fiesta del inglés',
    icon: 'globo',
    c: '#FFD66B',
    bg: BG.fiesta,
    zone: 'puebloCuentos',
    en: 'town',
    tip: 'celebrar todo lo aprendido: repasar juntos las palabras en inglés.',
    games: [ENG.bingo!, ENG.autobus!, ENG.escucha!],
  },
];
