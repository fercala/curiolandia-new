/*
 * temas/letras.ts: las casitas de la Isla de las Letras (fases L2 a L5 de docs/PLAN-LECTURA.md): las diez de la Playa
 * de los Sonidos (TL3), las doce del Bosque de las Letras (TL4, fase L4) y las doce del Pueblo de las Palabras (TL5,
 * fase L5: las letras R, C, G, J, V y Ñ, la fábrica de sílabas, las palabras de dos y de tres sílabas, las frases, los
 * cuentos para leer y la fiesta del abecedario). Primero las cinco vocales (fase L2), cada una con sus juegos hechos con componentes que ya
 * existen: conocer la letra y a sus amigos (Conocer), buscarla entre otras (ChoiceGame), trazarla con el dedo (Tracer),
 * atrapar sus burbujas (Atrapa) y, desde la E, unir cada letra aprendida con su amigo con una flecha (Une). Detrás
 * (fase L3), las palmas (Palmas, el eco de Tito, la palabra larga), ¿cómo empieza?, mi nombre (MiNombre, Pizarra), las
 * vocales mezcladas y la fiesta de las vocales (Excava, Memoria...). Palmas, Pizarra y MiNombre son de juegos/lectura.ts.
 * Las letras salen de LETRAS (contenido/letras.ts). Cada letra se dibuja como una «cosa» (cosaLetra: un objeto con
 * name y draw) para que los componentes la traten como a un dibujo más.
 * Los ids de los temas ('L3-A'...) son definitivos (son la clave del progreso guardado), y los juegos se guardan por
 * posición: añade juegos al final y casitas al final de su zona, para no cambiar las casitas abiertas de los niños que
 * ya juegan.
 * Exporta: BG.letras, BG.letrasBosque y BG.letrasPueblo (al cargarse), cosaLetra, dibujaLetra, densificar, (desde la
 * fase L7b, para las minúsculas) ambas, dibujaMinus y cosaMinus, TL3, TL4 y
 * TL5 (los temas de cada zona), PALABRAS_LEER (las palabras partidas en sílabas del pueblo, para las pruebas) y
 * TEMAS_LETRAS (todos los de la isla, para TEMAS en escenas/escenas2d.ts) y, desde la fase L7, casitaDeLetra (el id de la
 * casita de cada letra, para el libro de letras y la zona de adultos).
 * Importa: los tipos de juegos/tipos.ts, LETRAS de contenido/letras.ts, el núcleo (dibujo, voz, dificultad) y los
 * componentes de juegos/.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   los temas. */
import type { AlTerminar, Cosa, JuegoTema, Libre, Palabra, Tema } from '../juegos/tipos.ts';
import { LETRAS, letraEnPantalla, type Letra, type Trazo } from '../contenido/letras.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  DF,
  LF,
  S,
  W_,
  cap,
  card,
  ctx,
  nOpts,
  nRounds,
  pick,
  praise,
  say,
  sky,
  shuffle,
  text,
} from '../nucleo/indice.ts';
import {
  ACCIONES,
  Arrastra,
  Atrapa,
  BG,
  ChoiceGame,
  Conocer,
  Excava,
  Frase,
  Huellas,
  Maquina,
  Memoria,
  MiNombre,
  NUM,
  Palmas,
  Pizarra,
  Song,
  Tracer,
  Tren,
  Une,
  drawEscena,
  nameT,
  nombreDeLetra,
  thing,
} from '../juegos/indice.ts';

// BG.letras: el fondo de los juegos de letras: cielo claro, arena y letras grandes muy suaves al fondo.
Object.assign(BG, {
  letras(): void {
    sky('#E3F4FB', '#FFF6E0');
    ctx.fillStyle = '#FFE9B8';
    ctx.fillRect(0, 760, 1600, 140);
    ctx.save();
    ctx.globalAlpha = 0.08;
    'AEIOUMPLS'.split('').forEach((l, i) => text(l, 140 + i * 170, 200 + (i % 3) * 230, 150, '#5B8DEF', { f: LF }));
    ctx.restore();
  },
});

// dibujaLetra(L, x, y, s): pinta la letra L (mayúscula, letra de palo) centrada en (x, y) con alto s, de su color y
// con borde blanco, en Andika (LF), la fuente para los que empiezan a leer.
export function dibujaLetra(L: Letra, x: number, y: number, s: number): void {
  text(L.l, x, y + s * 0.36, s, L.c, { f: LF, st: Math.max(4, s * 0.06), sc: '#fff' });
}

// ambas(): ¿enseña la isla también las minúsculas? (S.tipoLetra 'ambas', que elige el adulto; desde la fase L7b).
export const ambas = (): boolean => S.tipoLetra === 'ambas';

// dibujaMinus(L, x, y, s): pinta la minúscula de la letra L como dibujaLetra la mayúscula (fase L7b).
export function dibujaMinus(L: Letra, x: number, y: number, s: number): void {
  text(L.l.toLowerCase(), x, y + s * 0.3, s, L.c, { f: LF, st: Math.max(4, s * 0.06), sc: '#fff' });
}

// COSAS: una «cosa» por letra, creada una sola vez (los componentes comparan las cosas por identidad: así la A de
// las burbujas es la misma que la del objetivo).
const COSAS = new Map<string, Libre>();
// cosaLetra(L): la letra L como cosa de los componentes: {l, name (cómo se dice: 'la a'), draw(x, y, s)}.
export function cosaLetra(L: Letra): Libre {
  let c = COSAS.get(L.l);
  if (!c) {
    c = { l: L.l, name: L.nombre, draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * 0.95) };
    COSAS.set(L.l, c);
  }
  return c;
}
// COSAS_MIN y cosaMinus(L): lo mismo para la minúscula de L (fase L7b): se llama igual que la mayúscula ('la a').
const COSAS_MIN = new Map<string, Libre>();
export function cosaMinus(L: Letra): Libre {
  let c = COSAS_MIN.get(L.l);
  if (!c) {
    c = {
      l: L.l,
      minus: true,
      name: L.nombre,
      draw: (x: number, y: number, s: number) => dibujaMinus(L, x, y, s * 1.05),
    };
    COSAS_MIN.set(L.l, c);
  }
  return c;
}

// densificar(pts, paso): el trazo pts con puntos cada `paso` píxeles como mucho (Tracer avanza mirando los 12 puntos
// siguientes, así que un trazo recto de solo dos puntos no se podría seguir).
export function densificar(pts: ReadonlyArray<readonly [number, number]>, paso = 12): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  pts.forEach(([x, y], i) => {
    const prev = pts[i - 1];
    if (prev) {
      const n = Math.max(1, Math.ceil(Math.hypot(x - prev[0], y - prev[1]) / paso));
      for (let k = 1; k <= n; k++) out.push([prev[0] + ((x - prev[0]) * k) / n, prev[1] + ((y - prev[1]) * k) / n]);
    } else out.push([x, y]);
  });
  return out;
}

// sinArticulo(k): el nombre del dibujo k sin el artículo ('la abeja' -> 'abeja').
const sinArticulo = (k: string): string => W_(k).replace(/^(el|la|los|las) /, '');

// CAJA: dónde va la letra grande al trazarla: esquina de arriba a la izquierda, ancho y alto (pantalla de 1600x900).
const CAJA = { x: 690, y: 200, w: 420, h: 560 };

// CAJAS2: con las minúsculas (fase L7b), dónde van la mayúscula y la minúscula, una al lado de la otra. La caja de la
// minúscula es más alta (alto / 0,8) para que las dos se apoyen en la misma línea (MINUS_CAJA en contenido/letras.ts).
const CAJAS2 = { mayus: { x: 380, y: 220, w: 330, h: 440 }, minus: { x: 900, y: 220, w: 330, h: 550 } };
type Caja = { x: number; y: number; w: number; h: number };

// enCaja(t, c): el trazo t (en su caja de 1 x 1) en la caja c de la pantalla.
const enCaja = (t: Trazo, c: Caja) => letraEnPantalla(t, c.x, c.y, c.w, c.h);

// fondoTrazo(L): el fondo del juego de trazar la letra L: BG.letras y la letra entera muy suave, para ver la forma. Con
// las minúsculas (ambas()), la mayúscula y la minúscula, cada una en su caja de CAJAS2.
const fondoTrazo = (L: Letra) => (): void => {
  BG['letras']!();
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = L.c;
  const grupos: Array<[readonly Trazo[], Caja, number]> = ambas()
    ? [
        [L.trazos, CAJAS2.mayus, 70],
        [L.minus, CAJAS2.minus, 70],
      ]
    : [[L.trazos, CAJA, 90]];
  for (const [trazos, c, ancho] of grupos)
    for (const t of trazos) {
      const p = enCaja(t, c);
      ctx.lineWidth = ancho;
      ctx.beginPath();
      p.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
  ctx.restore();
};

// distractoras(L): las letras que pueden salir con L como opciones equivocadas: en la playa, las otras vocales; en el
// bosque y en el pueblo, las ya vistas (las que van antes en LETRAS: las vocales, las del bosque y, en el pueblo, las
// suyas anteriores); desde los 5 años, todas las demás de la isla.
const distractoras = (L: Letra): Letra[] => {
  if (AGE() >= 5) return LETRAS.filter((x) => x !== L);
  if (L.zona === 'playaSonidos') return LETRAS.filter((x) => x !== L && x.zona === L.zona);
  // a los 3 y 4 años, las ya vistas: las que van antes en LETRAS (las vocales van primero y el bosque antes que el pueblo)
  return LETRAS.filter((x) => LETRAS.indexOf(x) < LETRAS.indexOf(L));
};

// empiezaPor(L, k): si el nombre del dibujo k empieza por la letra L (la Ñ casi nunca va al principio: piña la lleva
// dentro). Compara sin tildes, pero la Ñ no es una N.
const empiezaPor = (L: Letra, k: string): boolean => {
  const c = [...sinArticulo(k).toUpperCase()][0] ?? '';
  return (c === 'Ñ' ? c : c.normalize('NFD').replace(/[̀-ͯ]/g, '')) === L.l;
};
// comoLleva(L, k): cómo dice Tito que la palabra k tiene la letra L: «empieza por la a» o, si la lleva dentro (piña y la
// eñe), «lleva la eñe».
const comoLleva = (L: Letra, k: string): string => (empiezaPor(L, k) ? `empieza por ${L.nombre}` : `lleva ${L.nombre}`);

// conocerLetra(L, bg): el juego de conocer la letra: su tarjeta (se dice «Esta es la a. La a de abeja.»), con las
// minúsculas (fase L7b) la de la minúscula («Y esta es la a minúscula.»), y las de su amigo y sus palabras («La abeja.
// Abeja empieza por la a.»; desde la fase L5, «Piña lleva la eñe.» si no empieza por ella).
function conocerLetra(L: Letra, bg: () => void, d: AlTerminar) {
  const tarjeta = {
    draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * 0.9),
    label: L.l,
    say: `Esta es ${L.nombre}. ${cap(L.nombre)} de ${L.amigoDice}.`,
  };
  const palabras = [L.amigo, ...L.palabras].map((k) => ({
    k,
    say: `${cap(W_(k))}. ${cap(sinArticulo(k))} ${comoLleva(L, k)}.`,
  }));
  // con las minúsculas (fase L7b), una tarjeta más, la de la minúscula, detrás de la de la mayúscula
  const minus = {
    draw: (x: number, y: number, s: number) => dibujaMinus(L, x, y, s),
    label: L.l.toLowerCase(),
    say: `Y esta es ${L.nombre} minúscula.`,
  };
  return Conocer(
    {
      items: ambas() ? [tarjeta, minus, ...palabras] : [tarjeta, ...palabras],
      bg,
      intro: `¡Vamos a conocer ${L.nombre}! Toca cada tarjeta.`,
    },
    d,
  );
}

// buscaLetra(L, bg): «¿Dónde está la a?» entre nOpts() letras (la buena y distractoras), nRounds() rondas. Con las
// minúsculas (ambas(), fase L7b), en cada ronda salen al azar todas en mayúscula o todas en minúscula.
function buscaLetra(L: Letra, bg: () => void, d: AlTerminar) {
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'letras',
      y: 560,
      big: true,
      gen: () => {
        const forma = ambas() && pick([true, false]) ? cosaMinus : cosaLetra,
          buena = forma(L);
        const otras = shuffle(distractoras(L))
          .slice(0, Math.max(1, nOpts() - 1))
          .map(forma);
        const ask = `¿Dónde está ${L.nombre}?`;
        return {
          words: [buena, ...otras],
          ok: [buena],
          ask,
          okSay: () => `${praise()} ${cap(L.nombre)} de ${L.amigoDice}.`,
          badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}`,
        };
      },
    },
    d,
  );
}

// trazaLetra(L, d): trazar la letra L trazo a trazo con el dedo; su amigo avanza por el camino. Una estrella por trazo.
// Con las minúsculas (ambas(), fase L7b), primero la mayúscula y después la minúscula, al lado.
function trazaLetra(L: Letra, d: AlTerminar) {
  const dos = ambas(),
    m = L.trazos.length;
  const todos: Array<[Trazo, Caja]> = dos
    ? [
        ...L.trazos.map((t): [Trazo, Caja] => [t, CAJAS2.mayus]),
        ...L.minus.map((t): [Trazo, Caja] => [t, CAJAS2.minus]),
      ]
    : L.trazos.map((t): [Trazo, Caja] => [t, CAJA]);
  const n = todos.length;
  const paths = todos.map(([t, c], i: number) => ({
    pts: densificar(enCaja(t, c)),
    who: L.amigo,
    ws: dos ? 90 : 110,
    c: L.c,
    say:
      i === 0
        ? `Vamos a escribir ${L.nombre}. Empieza en el punto verde y sigue el camino con el dedo.`
        : dos && i === m
          ? `Ahora, ${L.nombre} minúscula. Empieza en el punto verde.`
          : 'Ahora, el siguiente trazo. Empieza en el punto verde.',
    ok: i === n - 1 ? `¡Muy bien! ¡Ya sabes escribir ${L.nombre}!` : praise(),
  }));
  return Tracer({ paths, bg: fondoTrazo(L), ask: `Sigue el camino de ${L.nombre} con el dedo.` }, d);
}

// atrapaLetra(L, bg): burbujas con letras; hay que atrapar las de L. Con las minúsculas (ambas(), fase L7b), también
// salen las minúsculas, y valen la mayúscula y la minúscula de L.
function atrapaLetra(L: Letra, bg: () => void, d: AlTerminar) {
  const buena = cosaLetra(L),
    dos = ambas(),
    buenas = dos ? [buena, cosaMinus(L)] : [buena];
  const otras = distractoras(L).slice(0, 4);
  const pool = [...buenas, ...otras.map(cosaLetra), ...(dos ? otras.slice(0, 2).map(cosaMinus) : [])];
  return Atrapa(
    {
      bg,
      pool,
      key: 'letras',
      ring: (k: Libre) => LETRAS.find((x) => x.l === k.l)?.c ?? '#5B8DEF',
      targets: [
        {
          ask: `¡Atrapa las burbujas de ${L.nombre}!`,
          is: (k: Cosa) => buenas.includes(k),
          label: 'Atrapa',
          icon: (x: number, y: number, s: number) => {
            if (dos) {
              dibujaLetra(L, x - s * 0.32, y, s * 0.8);
              dibujaMinus(L, x + s * 0.32, y, s * 0.8);
            } else dibujaLetra(L, x, y, s);
          },
        },
      ],
    },
    d,
  );
}

// uneLetras(hasta, bg): unir con una flecha cada letra aprendida hasta `hasta` (incluida) con su amigo.
function uneLetras(hasta: Letra, bg: () => void, d: AlTerminar) {
  const vistas = LETRAS.slice(0, LETRAS.indexOf(hasta) + 1).filter((x) => x.zona === hasta.zona);
  const pairs = vistas.map((x) => [cosaLetra(x), x.amigo]);
  const deLetra = (a: Libre) => LETRAS.find((x) => x.l === a.l)!;
  return Une(
    {
      pairs,
      n: Math.min(pairs.length, AGE() <= 3 ? 3 : 4),
      rounds: pairs.length > 3 ? 2 : 1,
      bg,
      key: 'letras',
      ask: 'Une cada letra con su amigo. Arrastra una línea desde la letra hasta su dibujo.',
      okSay: (a: Libre) => `${praise()} ${cap(a.name)} de ${deLetra(a).amigoDice}.`,
      why: (a: Libre, b: string) => `${cap(W_(b))} no empieza por ${a.name}.`,
    },
    d,
  );
}

// temaVocal(L, i): la casita de la vocal L (i = su número en el camino): conocer, buscar, trazar, atrapar y, desde la
// segunda (i > 0), unir las letras aprendidas con sus amigos.
function temaVocal(L: Letra, i: number): Tema {
  return temaLetra(L, i, 'L3', BG['letras']!);
}

// temaLetra(L, i, pre, bg): la casita de la letra L (id `${pre}-${L.l}`, en la zona de L, con el fondo bg): conocer,
// buscar, trazar, atrapar y, desde la segunda (i > 0), unir. Fuera de la playa (desde la fase L4), además, el tren de
// las sílabas y las huellas de la letra, al final (los juegos se guardan por posición).
function temaLetra(L: Letra, i: number, pre: string, bg: () => void): Tema {
  const games: JuegoTema[] = [
    { t: 'conocerLetra', icon: L.amigo, name: `Conoce ${L.nombre}`, make: (d: AlTerminar) => conocerLetra(L, bg, d) },
    { t: 'buscaLetra', icon: 'lupa', name: `¿Dónde está ${L.nombre}?`, make: (d: AlTerminar) => buscaLetra(L, bg, d) },
    { t: 'trazaLetra', icon: 'lapiz', name: `Escribe ${L.nombre}`, make: (d: AlTerminar) => trazaLetra(L, d) },
    { t: 'atrapaLetra', icon: 'globo', name: `Atrapa ${L.nombre}`, make: (d: AlTerminar) => atrapaLetra(L, bg, d) },
  ];
  if (i > 0)
    games.push({
      t: 'uneLetras',
      icon: 'pizarra',
      name: 'Une cada letra con su amigo',
      make: (d: AlTerminar) => uneLetras(L, bg, d),
    });
  if (L.zona !== 'playaSonidos')
    games.push(
      { t: 'trenLetra', icon: 'tren', name: `El tren de ${L.nombre}`, make: (d: AlTerminar) => trenLetra(L, bg, d) },
      {
        t: 'huellasLetra',
        icon: L.amigo,
        name: `Las huellas de ${L.nombre}`,
        make: (d: AlTerminar) => huellasLetra(L, bg, d),
      },
    );
  const words: Palabra[] = [L.amigo, ...L.palabras].map((k) => ({ k }));
  return {
    id: `${pre}-${L.l}`,
    zone: L.zona,
    n: `La ${L.l}`,
    icon: L.amigo,
    c: L.c,
    bg,
    words,
    games,
    intro: `¡Vamos a conocer ${L.nombre}!`,
  };
}

/* ---------- fase L3: el resto de la Playa de los Sonidos ---------- */
// VOCALES: las cinco letras de la playa, en orden.
const VOCALES: Letra[] = LETRAS.filter((x) => x.zona === 'playaSonidos');
// SILABAS: cómo se parten en sílabas (para dar palmas y para el eco de Tito) las palabras con dibujo que usan los juegos.
const SILABAS: Readonly<Record<string, readonly string[]>> = {
  sol: ['sol'],
  flor: ['flor'],
  tren: ['tren'],
  pez: ['pez'],
  luna: ['lu', 'na'],
  casa: ['ca', 'sa'],
  pato: ['pa', 'to'],
  mono: ['mo', 'no'],
  rana: ['ra', 'na'],
  vaca: ['va', 'ca'],
  foca: ['fo', 'ca'],
  nube: ['nu', 'be'],
  oso: ['o', 'so'],
  uva: ['u', 'va'],
  mesa: ['me', 'sa'],
  iglu: ['i', 'glú'],
  abeja: ['a', 'be', 'ja'],
  pelota: ['pe', 'lo', 'ta'],
  tortuga: ['tor', 'tu', 'ga'],
  gallina: ['ga', 'lli', 'na'],
  jirafa: ['ji', 'ra', 'fa'],
  ballena: ['ba', 'lle', 'na'],
  manzana: ['man', 'za', 'na'],
  caracol: ['ca', 'ra', 'col'],
  estrella: ['es', 'tre', 'lla'],
  elefante: ['e', 'le', 'fan', 'te'],
  mariposa: ['ma', 'ri', 'po', 'sa'],
};
// silabas(k): las sílabas de la palabra k (copia, para el componente).
const silabas = (k: string): string[] => [...(SILABAS[k] ?? [sinArticulo(k)])];
// rondasPalmas(ks): las rondas de Palmas con las palabras ks, en ese orden.
const rondasPalmas = (ks: readonly string[]) => ks.map((k) => ({ k, syl: silabas(k) }));
// vocalDe(k): la letra de LETRAS por la que empieza la palabra con dibujo k (su amigo o una de sus palabras), o undefined.
const vocalDe = (k: string): Letra | undefined =>
  LETRAS.find((v) => (v.amigo === k || v.palabras.includes(k)) && empiezaPor(v, k));
// palabrasVocal(L): el amigo y las palabras de la letra L que empiezan por ella (desde la fase L5 se quitan las que solo
// la llevan dentro, como piña con la eñe).
const palabrasVocal = (L: Letra): string[] => [L.amigo, ...L.palabras].filter((k) => empiezaPor(L, k));

// ecoTito(bg): «el eco de Tito»: Tito dice una palabra a trozos («ma... ri... po... sa») y hay que tocar su dibujo.
function ecoTito(bg: () => void, d: AlTerminar) {
  const pool = Object.keys(SILABAS).filter((k) => SILABAS[k]!.length > 1);
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'palmas',
      y: 560,
      big: true,
      gen: () => {
        const t = pick(pool),
          otras = shuffle(pool.filter((k) => k !== t)).slice(0, Math.max(1, nOpts() - 1));
        const ask = `Escucha: ${silabas(t).join('... ')}. ¿Qué es?`;
        return {
          words: [t, ...otras],
          ok: [t],
          ask,
          okSay: () => `${praise()} ${cap(nameT(t))}.`,
          badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}`,
        };
      },
    },
    d,
  );
}

// palabraLarga(bg): «la palabra larga»: dos dibujos, uno de una o dos palmas y otro de tres o cuatro; hay que tocar el
// que tiene más palmas.
function palabraLarga(bg: () => void, d: AlTerminar) {
  const cortas = Object.keys(SILABAS).filter((k) => SILABAS[k]!.length <= 2),
    largas = Object.keys(SILABAS).filter((k) => SILABAS[k]!.length >= 3);
  const palmas = (k: Cosa) => {
    const n = silabas(String(k)).length;
    return n === 1 ? 'una palma' : `${NUM[n]} palmas`;
  };
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'palmas',
      y: 560,
      big: true,
      gen: () => {
        const l = pick(largas),
          c = pick(cortas.filter((k) => SILABAS[k]!.length <= SILABAS[l]!.length - 1));
        const [a, b] = shuffle([l, c]);
        const ask = `¿Cuál es más larga: ${sinArticulo(a!)} o ${sinArticulo(b!)}? Da palmas con cada una.`;
        return {
          words: [l, c],
          ok: [l],
          ask,
          okSay: () => `${praise()} ${cap(sinArticulo(l))} tiene ${palmas(l)}.`,
          badSay: (w: Cosa) => `${cap(sinArticulo(String(w)))} tiene ${palmas(w)}. ¿Cuál tiene más?`,
        };
      },
    },
    d,
  );
}

// comoEmpieza(bg, d, set): «¿cómo empieza?»: Tito dice una letra de set (las vocales, si no se da) y hay que tocar el
// dibujo que empieza por ella, entre dibujos que empiezan por otras letras de set.
function comoEmpieza(bg: () => void, d: AlTerminar, set: Letra[] = VOCALES) {
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'letras',
      y: 560,
      big: true,
      gen: () => {
        const L = pick(set),
          t = pick(palabrasVocal(L));
        const otras = shuffle(set.filter((v) => v !== L))
          .slice(0, Math.max(1, nOpts() - 1))
          .map((v) => pick(palabrasVocal(v)));
        const ask = `¿Qué empieza por ${L.nombre}?`;
        return {
          words: [t, ...otras],
          ok: [t],
          ask,
          okSay: () => `${praise()} ${cap(sinArticulo(t))} empieza por ${L.nombre}.`,
          badSay: (w: Cosa) =>
            `${cap(sinArticulo(String(w)))} empieza por ${vocalDe(String(w))?.nombre ?? 'otra letra'}. ${ask}`,
        };
      },
    },
    d,
  );
}

// uneDibujoLetra(bg): unir cada dibujo con la vocal por la que empieza (al revés que uneLetras: del dibujo a la letra).
function uneDibujoLetra(bg: () => void, d: AlTerminar) {
  const pairs = VOCALES.map((x) => [x.amigo, cosaLetra(x)]);
  return Une(
    {
      pairs,
      n: AGE() <= 3 ? 3 : 4,
      rounds: 2,
      bg,
      key: 'letras',
      ask: 'Une cada dibujo con la letra por la que empieza.',
      okSay: (a: string, b: Libre) => `${praise()} ${cap(sinArticulo(a))} empieza por ${b.name}.`,
      why: (a: string, b: Libre) => `${cap(sinArticulo(a))} no empieza por ${b.name}.`,
    },
    d,
  );
}

// excavaVocales(bg): escarbar en la arena para encontrar las vocales escondidas (Excava).
function excavaVocales(bg: () => void, d: AlTerminar) {
  return Excava(
    {
      pool: VOCALES.map(cosaLetra),
      n: AGE() <= 3 ? 4 : 5,
      bg,
      intro: 'Escarba en la arena con el dedo. ¡Hay letras escondidas!',
    },
    d,
  );
}

// memoriaVocales(bg, d, set): memoria con las letras de set (las vocales, si no se da): dos cartas iguales.
function memoriaVocales(bg: () => void, d: AlTerminar, set: Letra[] = VOCALES) {
  return Memoria(
    {
      pool: set.map(cosaLetra),
      pairs: AGE() <= 3 ? 3 : 4,
      bg,
      intro: 'Juego de memoria con las letras. Toca dos cartas y busca dos letras iguales.',
    },
    d,
  );
}

// buscaVocales(bg, d, set): «¿dónde está…?» con una letra de set (las vocales, si no se da) distinta en cada ronda.
function buscaVocales(bg: () => void, d: AlTerminar, set: Letra[] = VOCALES) {
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'letras',
      y: 560,
      big: true,
      gen: () => {
        const L = pick(set),
          buena = cosaLetra(L),
          otras = shuffle(set.filter((v) => v !== L))
            .slice(0, Math.max(1, nOpts() - 1))
            .map(cosaLetra);
        const ask = `¿Dónde está ${L.nombre}?`;
        return {
          words: [buena, ...otras],
          ok: [buena],
          ask,
          okSay: () => `${praise()} ${cap(L.nombre)} de ${L.amigoDice}.`,
          badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}`,
        };
      },
    },
    d,
  );
}

// atrapaVocales(bg): burbujas con las vocales: primero hay que atrapar las de una y después las de otra.
function atrapaVocales(bg: () => void, d: AlTerminar) {
  const [a, b] = shuffle(VOCALES).slice(0, 2) as [Letra, Letra];
  const pool = VOCALES.map(cosaLetra),
    obj = (L: Letra) => ({
      ask: `¡Atrapa las burbujas de ${L.nombre}!`,
      is: (k: Cosa) => k === cosaLetra(L),
      label: 'Atrapa',
      icon: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s),
    });
  return Atrapa(
    {
      bg,
      pool,
      key: 'letras',
      ring: (k: Libre) => LETRAS.find((x) => x.l === k.l)?.c ?? '#5B8DEF',
      targets: [obj(a), obj(b)],
    },
    d,
  );
}

// conocerVocales(bg): las cinco vocales en tarjetas, para repasarlas («Esta es la a. La a de abeja.»).
function conocerVocales(bg: () => void, d: AlTerminar) {
  const items = VOCALES.map((L) => ({
    draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * 0.9),
    label: L.l,
    say: `Esta es ${L.nombre}. ${cap(L.nombre)} de ${L.amigoDice}.`,
  }));
  return Conocer({ items, bg, intro: '¡Es la fiesta de las vocales! Toca cada una.' }, d);
}

// cosaLetraLibre(l): cualquier letra (también las que no están en LETRAS) como cosa de los componentes, en azul.
function cosaLetraLibre(l: string): Libre {
  const L = LETRAS.find((x) => x.l === l);
  return L
    ? cosaLetra(L)
    : {
        l,
        name: nombreDeLetra(l),
        draw: (x: number, y: number, s: number) =>
          text(l, x, y + s * 0.34, s * 0.95, '#5B8DEF', { f: LF, st: Math.max(4, s * 0.06), sc: '#fff' }),
      };
}
// miNombre(): el nombre del niño (S.name) en mayúsculas para escribirlo y cómo lo dice Tito; si no hay, el de Tito.
function miNombre(): { escrito: string; dice: string; suyo: boolean } {
  const n = String(S.name || '').trim();
  return n ? { escrito: n.toUpperCase(), dice: n, suyo: true } : { escrito: 'TITO', dice: 'Tito', suyo: false };
}
// inicial(): la primera letra del nombre (sin tilde: É -> E).
const inicial = (): string => {
  const l = [...miNombre().escrito].find((c) => /\p{L}/u.test(c)) ?? 'T';
  return l === 'Ñ' ? l : l.normalize('NFD').replace(/[̀-ͯ]/g, '');
};

// juegoMiNombre(bg): el nombre del niño en letras grandes, que se tocan una a una (MiNombre).
function juegoMiNombre(bg: () => void, d: AlTerminar) {
  const n = miNombre();
  return MiNombre(
    {
      nombre: n.escrito,
      dice: n.dice,
      bg,
      key: 'letras',
      intro: n.suyo
        ? `Este es tu nombre: ${n.dice}. Toca sus letras, una a una.`
        : 'Este es el nombre de Tito. Toca sus letras, una a una.',
    },
    d,
  );
}

// pizarraInicial(bg): pintar con el dedo la primera letra del nombre (Pizarra), con su camino de ayuda si es de LETRAS.
function pizarraInicial(bg: () => void, d: AlTerminar) {
  const l = inicial(),
    L = LETRAS.find((x) => x.l === l),
    de = miNombre().suyo ? 'de tu nombre' : 'del nombre de Tito';
  const path = L
    ? densificar(
        L.trazos.flatMap((t) => letraEnPantalla(t, 700, 220, 400, 520)),
        30,
      )
    : undefined;
  return Pizarra(
    {
      letra: l,
      c: '#FFE08A',
      bg,
      path,
      key: 'trazos',
      ask: `Esta es ${nombreDeLetra(l)}, la primera letra ${de}. Píntala con el dedo como tú quieras.`,
      ok: `¡Qué bonita te ha quedado ${nombreDeLetra(l)}!`,
    },
    d,
  );
}

// buscaInicial(bg): «¿dónde está…?» con la primera letra del nombre entre vocales.
function buscaInicial(bg: () => void, d: AlTerminar) {
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'letras',
      y: 560,
      big: true,
      gen: () => {
        const l = inicial(),
          buena = cosaLetraLibre(l),
          otras = shuffle(VOCALES.filter((v) => v.l !== l))
            .slice(0, Math.max(1, nOpts() - 1))
            .map(cosaLetra);
        const ask = `¿Dónde está ${nombreDeLetra(l)}?`;
        return {
          words: [buena, ...otras],
          ok: [buena],
          ask,
          okSay: () => `${praise()} Con ${nombreDeLetra(l)} empieza ${miNombre().suyo ? 'tu nombre' : 'Tito'}.`,
          badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}`,
        };
      },
    },
    d,
  );
}

// trazaVocal(d): trazar una vocal elegida al azar (trazaLetra).
const trazaVocal = (d: AlTerminar) => trazaLetra(pick(VOCALES), d);

// temaPlaya(id, n, icon, c, intro, games): una casita de la playa que no es de una sola letra (fase L3).
function temaPlaya(id: string, n: string, icon: string, c: string, intro: string, games: JuegoTema[]): Tema {
  const bg = BG['letras']!;
  return { id, zone: 'playaSonidos', n, icon, c, bg, words: VOCALES.map((L) => ({ k: L.amigo })), games, intro };
}

// juegosPlaya(): las cinco casitas que van detrás de la U (fase L3). Sus ids y el orden de sus juegos son definitivos.
function juegosPlaya(): Tema[] {
  const bg = BG['letras']!;
  return [
    temaPlaya('L3-PAL', 'Las palmas', 'tambor', '#E8554E', '¡Vamos a dar palmas con las palabras!', [
      {
        t: 'palmas',
        icon: 'tambor',
        name: 'Da palmas',
        make: (d: AlTerminar) =>
          Palmas(
            {
              words: rondasPalmas(['sol', 'luna', 'pato', 'abeja', 'mariposa']),
              bg,
              key: 'palmas',
              intro: 'Vamos a dar una palmada por cada trozo de la palabra.',
            },
            d,
          ),
      },
      { t: 'ecoTito', icon: 'oreja', name: 'El eco de Tito', make: (d: AlTerminar) => ecoTito(bg, d) },
      {
        t: 'palmas',
        icon: 'tambor',
        name: 'Más palmas',
        make: (d: AlTerminar) =>
          Palmas({ words: rondasPalmas(['flor', 'casa', 'oso', 'pelota', 'elefante']), bg, key: 'palmas' }, d),
      },
      { t: 'palabraLarga', icon: 'manos', name: 'La palabra larga', make: (d: AlTerminar) => palabraLarga(bg, d) },
    ]),
    temaPlaya('L3-EMP', '¿Cómo empieza?', 'oreja', '#F08A3C', '¡Vamos a escuchar cómo empiezan las palabras!', [
      { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d) },
      {
        t: 'uneDibujoLetra',
        icon: 'pizarra',
        name: 'Une cada dibujo con su letra',
        make: (d: AlTerminar) => uneDibujoLetra(bg, d),
      },
      { t: 'excavaVocales', icon: 'pala', name: 'Letras en la arena', make: (d: AlTerminar) => excavaVocales(bg, d) },
      {
        t: 'memoriaVocales',
        icon: 'concha',
        name: 'Memoria de letras',
        make: (d: AlTerminar) => memoriaVocales(bg, d),
      },
    ]),
    temaPlaya('L3-NOM', 'Mi nombre', 'pizarra', '#4BA3E0', '¡Vamos a jugar con las letras de tu nombre!', [
      { t: 'miNombre', icon: 'pizarra', name: 'Mi nombre', make: (d: AlTerminar) => juegoMiNombre(bg, d) },
      { t: 'pizarra', icon: 'lapiz', name: 'La pizarra', make: (d: AlTerminar) => pizarraInicial(bg, d) },
      { t: 'buscaInicial', icon: 'lupa', name: 'Mi primera letra', make: (d: AlTerminar) => buscaInicial(bg, d) },
    ]),
    temaPlaya(
      'L3-MEZ',
      'Las vocales mezcladas',
      'globo',
      '#4FB477',
      '¡Las vocales se han mezclado! Vamos a encontrarlas.',
      [
        { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d) },
        {
          t: 'atrapaVocales',
          icon: 'globo',
          name: 'Atrapa las vocales',
          make: (d: AlTerminar) => atrapaVocales(bg, d),
        },
        {
          t: 'uneLetras',
          icon: 'pizarra',
          name: 'Une cada letra con su amigo',
          make: (d: AlTerminar) => uneLetras(VOCALES[VOCALES.length - 1]!, bg, d),
        },
        {
          t: 'memoriaVocales',
          icon: 'concha',
          name: 'Memoria de letras',
          make: (d: AlTerminar) => memoriaVocales(bg, d),
        },
      ],
    ),
    temaPlaya('L3-FIE', 'Fiesta de las vocales', 'tarta', '#9B6FD0', '¡Es la fiesta de las vocales!', [
      {
        t: 'conocerVocales',
        icon: 'regalo',
        name: 'Las cinco vocales',
        make: (d: AlTerminar) => conocerVocales(bg, d),
      },
      {
        t: 'palmas',
        icon: 'tambor',
        name: 'Palmas con los amigos',
        make: (d: AlTerminar) => Palmas({ words: rondasPalmas(VOCALES.map((L) => L.amigo)), bg, key: 'palmas' }, d),
      },
      { t: 'trazaLetra', icon: 'lapiz', name: 'Escribe una vocal', make: (d: AlTerminar) => trazaVocal(d) },
      { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d) },
      { t: 'excavaVocales', icon: 'pala', name: 'Letras en la arena', make: (d: AlTerminar) => excavaVocales(bg, d) },
    ]),
  ];
}

// TL3: las casitas de la Playa de los Sonidos (3 años), en el orden del camino: A, E, I, O, U (fase L2) y, detrás, las
// palmas, ¿cómo empieza?, mi nombre, las vocales mezcladas y la fiesta de las vocales (fase L3).
export const TL3: Tema[] = [...VOCALES.map(temaVocal), ...juegosPlaya()];

/* ---------- fase L4: el Bosque de las Letras ---------- */
// BG.letrasBosque: el fondo de los juegos del bosque: cielo verde claro, hierba y letras suaves al fondo.
Object.assign(BG, {
  letrasBosque(): void {
    sky('#DDF2D2', '#F4FBEA');
    ctx.fillStyle = '#C9E7A8';
    ctx.fillRect(0, 760, 1600, 140);
    ctx.save();
    ctx.globalAlpha = 0.08;
    'MPLSTNDFB'.split('').forEach((l, i) => text(l, 140 + i * 170, 200 + (i % 3) * 230, 150, '#3E7A5A', { f: LF }));
    ctx.restore();
  },
});
// BOSQUE: las nueve consonantes del bosque, en orden (M, P, L, S, T, N, D, F, B).
const BOSQUE: Letra[] = LETRAS.filter((x) => x.zona === 'bosqueLetras');

// trenLetra(L, bg): el tren de las sílabas de L con las cinco vocales (MA, ME, MI, MO, MU), con el componente Tren.
function trenLetra(L: Letra, bg: () => void, d: AlTerminar) {
  return Tren(
    {
      letra: { l: L.l, nombre: L.nombre, c: L.c },
      vocales: VOCALES.map((v) => ({ l: v.l, c: v.c })),
      bg,
      key: 'letras',
    },
    d,
  );
}

// huellasLetra(L, bg): las huellas del amigo de L forman la letra; hay que tocarlas en orden (Huellas).
function huellasLetra(L: Letra, bg: () => void, d: AlTerminar) {
  return Huellas(
    {
      trazos: L.trazos.map((t) => densificar(letraEnPantalla(t, 680, 190, 440, 560), 10)),
      c: L.c,
      who: L.amigo,
      bg,
      key: 'trazos',
      ask: `Las huellas de ${W_(L.amigo)} forman ${L.nombre}. Tócalas en orden, empezando por la que brilla.`,
      ok: `${praise()} Las huellas forman ${L.nombre}.`,
    },
    d,
  );
}

// letraDelNombre(): la primera letra del nombre si está en LETRAS (si no, la de Tito, la T), para trazarla.
const letraDelNombre = (): Letra => LETRAS.find((x) => x.l === inicial()) ?? LETRAS.find((x) => x.l === 'T')!;

// juegosBosque(): las doce casitas del bosque (4 años): repaso de vocales, M, P, L, S, T, N, D, F, B, escribo mi nombre
// y la fiesta de las letras. Sus ids y el orden de sus juegos son definitivos.
function juegosBosque(): Tema[] {
  const bg = BG['letrasBosque']!;
  const tema = (id: string, n: string, icon: string, c: string, intro: string, games: JuegoTema[]): Tema => ({
    id,
    zone: 'bosqueLetras',
    n,
    icon,
    c,
    bg,
    words: BOSQUE.map((L) => ({ k: L.amigo })),
    games,
    intro,
  });
  return [
    tema(
      'L4-VOC',
      'Repaso de vocales',
      'abeja',
      '#E8554E',
      '¡Vamos a repasar las vocales antes de entrar en el bosque!',
      [
        {
          t: 'conocerVocales',
          icon: 'regalo',
          name: 'Las cinco vocales',
          make: (d: AlTerminar) => conocerVocales(bg, d),
        },
        { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d) },
        { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d) },
        {
          t: 'uneDibujoLetra',
          icon: 'pizarra',
          name: 'Une cada dibujo con su letra',
          make: (d: AlTerminar) => uneDibujoLetra(bg, d),
        },
      ],
    ),
    ...BOSQUE.map((L, i) => temaLetra(L, i, 'L4', bg)),
    tema('L4-NOM', 'Escribo mi nombre', 'lapiz', '#4BA3E0', '¡Vamos a escribir las letras de tu nombre!', [
      { t: 'miNombre', icon: 'pizarra', name: 'Mi nombre', make: (d: AlTerminar) => juegoMiNombre(bg, d) },
      {
        t: 'trazaLetra',
        icon: 'lapiz',
        name: 'Escribe mi primera letra',
        make: (d: AlTerminar) => trazaLetra(letraDelNombre(), d),
      },
      {
        t: 'huellasLetra',
        icon: 'tortuga',
        name: 'Huellas de mi letra',
        make: (d: AlTerminar) => huellasLetra(letraDelNombre(), bg, d),
      },
      { t: 'buscaInicial', icon: 'lupa', name: 'Mi primera letra', make: (d: AlTerminar) => buscaInicial(bg, d) },
    ]),
    tema('L4-FIE', 'Fiesta de las letras', 'tarta', '#9B6FD0', '¡Es la fiesta de las letras del bosque!', [
      { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d, BOSQUE) },
      { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d, BOSQUE) },
      {
        t: 'trenLetra',
        icon: 'tren',
        name: 'El tren de las sílabas',
        make: (d: AlTerminar) => trenLetra(pick(BOSQUE), bg, d),
      },
      {
        t: 'uneLetras',
        icon: 'pizarra',
        name: 'Une cada letra con su amigo',
        make: (d: AlTerminar) => uneLetras(BOSQUE[BOSQUE.length - 1]!, bg, d),
      },
      {
        t: 'memoriaVocales',
        icon: 'concha',
        name: 'Memoria de letras',
        make: (d: AlTerminar) => memoriaVocales(bg, d, BOSQUE),
      },
    ]),
  ];
}

// TL4: las casitas del Bosque de las Letras (4 años), en el orden del camino (fase L4).
export const TL4: Tema[] = juegosBosque();

/* ---------- fase L5: el Pueblo de las Palabras ---------- */
// BG.letrasPueblo: el fondo de los juegos del pueblo: cielo de tarde, una calle de tierra y letras suaves al fondo.
Object.assign(BG, {
  letrasPueblo(): void {
    sky('#FDE7D6', '#FFF8EE');
    ctx.fillStyle = '#EBD9B6';
    ctx.fillRect(0, 760, 1600, 140);
    ctx.save();
    ctx.globalAlpha = 0.08;
    'RCGJVÑSOL'.split('').forEach((l, i) => text(l, 140 + i * 170, 200 + (i % 3) * 230, 150, '#C9673A', { f: LF }));
    ctx.restore();
  },
});
// PUEBLO: las seis consonantes del pueblo, en orden (R, C, G, J, V, Ñ).
const PUEBLO: Letra[] = LETRAS.filter((x) => x.zona === 'puebloPalabras');
// CONSONANTES: las consonantes de la isla (bosque y pueblo) con su color, para la máquina de sílabas y los globos.
const CONSONANTES = LETRAS.filter((x) => x.zona !== 'playaSonidos').map((x) => ({ l: x.l, c: x.c }));

/** Una palabra con dibujo para leer: su clave de dibujo y sus sílabas. */
interface PalabraLeer {
  readonly k: string;
  readonly syl: readonly string[];
}
// pl(k, s): la palabra del dibujo k con sus sílabas separadas por guiones ('pa-to').
const pl = (k: string, s: string): PalabraLeer => ({ k, syl: s.split('-') });
// DOS y TRES: las palabras que se leen en el pueblo, de dos y de tres sílabas, todas de consonante y vocal y sin sílabas
// repetidas (para que al ordenarlas no haya dos trozos iguales). tests/unidad/contenido.test.ts comprueba que se
// escriben como su dibujo se llama.
const DOS: readonly PalabraLeer[] = [
  pl('pato', 'pa-to'),
  pl('gato', 'ga-to'),
  pl('mesa', 'me-sa'),
  pl('casa', 'ca-sa'),
  pl('bota', 'bo-ta'),
  pl('mono', 'mo-no'),
  pl('luna', 'lu-na'),
  pl('foca', 'fo-ca'),
  pl('nube', 'nu-be'),
  pl('vaca', 'va-ca'),
  pl('cama', 'ca-ma'),
  pl('pera', 'pe-ra'),
  pl('rana', 'ra-na'),
  pl('mano', 'ma-no'),
  pl('pino', 'pi-no'),
  pl('moto', 'mo-to'),
  pl('pala', 'pa-la'),
  pl('lobo', 'lo-bo'),
  pl('cubo', 'cu-bo'),
  pl('seta', 'se-ta'),
  pl('lupa', 'lu-pa'),
  pl('vela', 've-la'),
];
const TRES: readonly PalabraLeer[] = [
  pl('pelota', 'pe-lo-ta'),
  pl('tomate', 'to-ma-te'),
  pl('cohete', 'co-he-te'),
  pl('maceta', 'ma-ce-ta'),
  pl('conejo', 'co-ne-jo'),
  pl('gusano', 'gu-sa-no'),
  pl('jirafa', 'ji-ra-fa'),
  pl('zapato', 'za-pa-to'),
  pl('helado', 'he-la-do'),
  pl('cometa', 'co-me-ta'),
  pl('pijama', 'pi-ja-ma'),
];
// PALABRAS_LEER: las dos listas, para las pruebas.
export const PALABRAS_LEER = { dos: DOS, tres: TRES };
// escrita(w): cómo se escribe la palabra w en los juegos: en mayúsculas ('PATO').
const escrita = (w: PalabraLeer): string => w.syl.join('').toUpperCase();
// trozos(w): las sílabas de w como las dice Tito, despacio: 'pa... to'.
const trozos = (w: PalabraLeer): string => w.syl.join('... ');

// TEXTOS: una «cosa» por texto (sílaba o palabra), creada una sola vez: los componentes comparan las cosas por identidad.
const TEXTOS = new Map<string, Libre>();
// cosaTexto(t): el texto t (una sílaba o una palabra, en mayúsculas) como cosa de los componentes: se escribe en Andika
// tan grande como quepa en su tarjeta (lo mide con measureText) y Tito lo lee en minúsculas.
function cosaTexto(t: string): Libre {
  let c = TEXTOS.get(t);
  if (!c) {
    c = {
      t,
      name: t.toLowerCase(),
      draw: (x: number, y: number, s: number) => {
        let z = s * 0.55;
        ctx.font = `700 ${z}px ${LF}`;
        const an = ctx.measureText(t).width;
        if (an > s * 0.9) z *= (s * 0.9) / an;
        text(t, x, y + z * 0.36, z, '#3B3B4F', { f: LF });
      },
    };
    TEXTOS.set(t, c);
  }
  return c;
}
// cartelPalabra(t, y): el cartel con el texto t en grande, centrado en x = 900 y en la altura y. Devuelve su medio ancho.
function cartelPalabra(t: string, y: number): number {
  const an = t.length * 86 + 120;
  card(900 - an / 2, y - 100, an, 200, '#fff', 7, 36);
  text(t, 900, y + 50, 140, '#3B3B4F', { f: LF });
  return an / 2;
}

// leoYElijo(lista, bg): «leo y elijo»: sale una palabra escrita y hay que tocar su dibujo. Tito no la dice: al tocar el
// cartel, la lee a trozos («pa... to») para ayudar.
function leoYElijo(lista: readonly PalabraLeer[], bg: () => void, d: AlTerminar) {
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'palabras',
      y: 640,
      big: false,
      gen: () => {
        const w = pick(lista),
          otras = shuffle(lista.filter((x) => x !== w))
            .slice(0, Math.max(1, nOpts() - 1))
            .map((x) => x.k);
        return {
          words: [w.k, ...otras],
          ok: [w.k],
          palabra: w,
          ask: '¿Qué pone? Lee la palabra y toca su dibujo.',
          okSay: () => `${praise()} Pone ${sinArticulo(w.k)}.`,
          badSay: (x: Cosa) => `Esa es ${nameT(x)}. Si tocas la palabra, te la leo a trozos.`,
        };
      },
      ref: (r: Libre) => {
        cartelPalabra(escrita(r.palabra), 230);
      },
      refTap: (g: Libre, x: number, y: number) => {
        const an = (escrita(g.r.palabra).length * 86 + 120) / 2;
        if (Math.abs(x - 900) > an || Math.abs(y - 230) > 100) return false;
        say(trozos(g.r.palabra));
        return true;
      },
    },
    d,
  );
}

// silabaFalta(lista, bg, d, primera): «la sílaba que falta»: el dibujo y su palabra con un hueco (LU _ ) y, debajo,
// sílabas para elegir la que falta. Con primera = true el hueco es siempre la primera sílaba («¿con qué trozo empieza?»).
function silabaFalta(lista: readonly PalabraLeer[], bg: () => void, d: AlTerminar, primera = false) {
  return ChoiceGame(
    {
      rounds: nRounds(),
      bg,
      key: () => 'silabas',
      y: 660,
      big: false,
      gen: () => {
        const w = pick(lista),
          j = primera ? 0 : pick([...w.syl.keys()]),
          falta = w.syl[j]!.toUpperCase();
        const otras = shuffle(
          [...new Set([...DOS, ...TRES].flatMap((x) => x.syl.map((y) => y.toUpperCase())))].filter(
            (y) => !w.syl.map((q) => q.toUpperCase()).includes(y),
          ),
        ).slice(0, Math.max(1, nOpts() - 1));
        const ask = primera
          ? `Esto es ${nameT(w.k)}. ¿Con qué trozo empieza?`
          : `Esto es ${nameT(w.k)}. ¿Qué trozo falta?`;
        return {
          words: [cosaTexto(falta), ...otras.map(cosaTexto)],
          ok: [cosaTexto(falta)],
          palabra: w,
          hueco: j,
          ask,
          okSay: () => `${praise()} ${trozos(w)}: ${sinArticulo(w.k)}.`,
          badSay: (x: Cosa) => `Con ${nameT(x)} no pone ${sinArticulo(w.k)}. ${ask}`,
        };
      },
      ref: (r: Libre, g: Libre) => {
        const w: PalabraLeer = r.palabra,
          n = w.syl.length,
          an = 190,
          x0 = 1060 - ((n - 1) * (an + 20)) / 2,
          hecho = g.items?.some((it: Libre) => it.win);
        card(330, 120, 280, 280, '#fff', 6, 36);
        thing(w.k, 470, 260, 230);
        w.syl.forEach((sy, j) => {
          const x = x0 + j * (an + 20),
            hueco = j === r.hueco && !hecho;
          if (hueco) ctx.setLineDash([16, 12]);
          card(x - an / 2, 180, an, 160, hueco ? 'rgba(255,255,255,.6)' : '#fff', 6, 26, hueco ? '#B8A890' : K);
          ctx.setLineDash([]);
          text(hueco ? '?' : sy.toUpperCase(), x, 300, 100, hueco ? '#B8A890' : '#3B3B4F', { f: LF });
        });
      },
    },
    d,
  );
}

// ordenaPiezas(gen, bg, d, key): ordenar piezas (sílabas o palabras) arrastrándolas a sus huecos, con Arrastra. Cada
// ronda, gen() da {piezas (en orden, en mayúsculas), dibujo(x, y, s) (lo que se escribe, arriba), ask, ok, oye (cómo
// se dice despacio)}. Tres rondas; una estrella por ronda.
function ordenaPiezas(
  gen: () => {
    piezas: string[];
    dibujo: (x: number, y: number, s: number) => void;
    ask: string;
    ok: string;
    oye: string;
  },
  bg: () => void,
  d: AlTerminar,
  key: string,
) {
  let oye = '';
  return Arrastra(
    {
      rounds: 3,
      key,
      bg,
      rect: true,
      why: () => `Mmm, ese trozo no va ahí. Escucha: ${oye}.`,
      gen: () => {
        const r = gen(),
          n = r.piezas.length,
          an = 220,
          x0 = 900 - ((n - 1) * (an + 24)) / 2;
        oye = r.oye;
        const zones = r.piezas.map((_p, j) => ({
          id: 's' + j,
          x: x0 + j * (an + 24),
          y: 480,
          w: an,
          h: 190,
          ps: 1,
          slot: (): [number, number] => [x0 + j * (an + 24), 480],
          draw: (z: Libre, hl: boolean) => {
            ctx.setLineDash([16, 12]);
            card(z.x - an / 2, z.y - 95, an, 190, hl ? '#FFF3B0' : 'rgba(255,255,255,.7)', 5, 26, '#B8A890');
            ctx.setLineDash([]);
          },
        }));
        const items = r.piezas.map((p, j) => ({ k: cosaTexto(p), zone: 's' + j, s: 190 }));
        return {
          ask: r.ask,
          zones,
          items,
          tray: { x0: 420, x1: 1380, y: 770 },
          okAll: r.ok,
          drawExtra: () => {
            card(760, 40, 280, 280, '#fff', 6, 36);
            r.dibujo(900, 180, 240);
          },
        };
      },
    },
    d,
  );
}
// armaPalabra(lista, bg): «armo la palabra»: el dibujo arriba y sus sílabas desordenadas para ponerlas en orden.
function armaPalabra(lista: readonly PalabraLeer[], bg: () => void, d: AlTerminar) {
  const orden = shuffle(lista);
  let i = 0;
  return ordenaPiezas(
    () => {
      const w = orden[i++ % orden.length]!;
      return {
        piezas: w.syl.map((y) => y.toUpperCase()),
        dibujo: (x, y, s) => thing(w.k, x, y, s),
        oye: trozos(w),
        ask: `Esto es ${nameT(w.k)}. Arrastra los trozos en orden para escribir ${sinArticulo(w.k)}.`,
        ok: `${praise()} ${trozos(w)}: ${sinArticulo(w.k)}.`,
      };
    },
    bg,
    d,
    'palabras',
  );
}

// unePalabraDibujo(lista, bg): unir cada palabra escrita con su dibujo (Une).
function unePalabraDibujo(lista: readonly PalabraLeer[], bg: () => void, d: AlTerminar) {
  const pairs = lista.map((w) => [cosaTexto(escrita(w)), w.k]);
  return Une(
    {
      pairs,
      n: AGE() <= 4 ? 3 : 4,
      rounds: 2,
      bg,
      key: 'palabras',
      ask: 'Une cada palabra con su dibujo. Lee la palabra y arrastra una línea hasta su dibujo.',
      okSay: (a: Libre) => `${praise()} Pone ${a.name}.`,
      why: (_a: Libre, b: string) => `Aquí no pone ${sinArticulo(b)}.`,
    },
    d,
  );
}

// globosSilabas(bg): «globos de sílabas»: burbujas con sílabas de una consonante (y dos de otra); hay que atrapar las
// de una sílaba (Atrapa). Un solo objetivo: con dos, las estrellas de arriba taparían el cartel con la sílaba.
function globosSilabas(bg: () => void, d: AlTerminar) {
  const L = pick(CONSONANTES.filter((c) => c.l !== 'Ñ')),
    [a, b] = shuffle(VOCALES).slice(0, 2) as [Letra, Letra];
  const sil = (v: Letra) => cosaTexto(L.l + v.l),
    otra = pick(CONSONANTES.filter((c) => c.l !== L.l));
  const pool = [...VOCALES.map(sil), cosaTexto(otra.l + a.l), cosaTexto(otra.l + b.l)];
  const obj = (v: Letra) => ({
    ask: `¡Atrapa los globos que dicen ${(L.l + v.l).toLowerCase()}!`,
    is: (k: Cosa) => k === sil(v),
    label: 'Atrapa',
    icon: (x: number, y: number, s: number) => sil(v).draw(x, y, s),
  });
  return Atrapa({ bg, pool, key: 'silabas', ring: () => L.c, targets: [obj(a)] }, d);
}

// maquinaSilabas(bg, set): la máquina de sílabas (Maquina) con nRounds() sílabas de las consonantes de set (todas las de
// la isla si no se da) y las cinco vocales.
function maquinaSilabas(bg: () => void, d: AlTerminar, set = CONSONANTES) {
  const rondas = Array.from({ length: nRounds() }, () => pick(set).l + pick(VOCALES).l);
  return Maquina(
    { rondas, consonantes: CONSONANTES, vocales: VOCALES.map((v) => ({ l: v.l, c: v.c })), bg, key: 'silabas' },
    d,
  );
}

// FRASES: lo que hacen los animales en las frases ([dibujo, acción de ACCIONES]); las de cada ronda salen de aquí.
const FRASES: ReadonlyArray<readonly [string, string]> = [
  ['gato', 'duerme'],
  ['gato', 'salta'],
  ['pez', 'nada'],
  ['pato', 'nada'],
  ['rana', 'salta'],
  ['mono', 'baila'],
  ['pajaro', 'vuela'],
  ['perro', 'corre'],
  ['vaca', 'duerme'],
  ['oso', 'baila'],
  ['foca', 'nada'],
  ['mono', 'salta'],
  ['perro', 'salta'],
  ['pato', 'vuela'],
  ['oso', 'duerme'],
  ['vaca', 'corre'],
];
// ANIMALES: los dibujos que salen en FRASES.
const ANIMALES = [...new Set(FRASES.map((f) => f[0]))];
// textoFrase(k, acc): cómo se escribe la frase: 'EL GATO DUERME'.
const textoFrase = (k: string, acc: string): string => `${W_(k)} ${acc}`.toUpperCase();
// rondasFrase(n): n frases distintas de FRASES, cada una con sus escenas: la buena, el mismo animal haciendo otra cosa y
// otro animal haciendo lo mismo (así hay que leer las dos palabras) y, con cuatro opciones, otra más.
function rondasFrase(n: number) {
  return shuffle(FRASES)
    .slice(0, n)
    .map(([k, acc]) => {
      const otraAcc = pick(ACCIONES.filter((a) => a !== acc)),
        otroK = pick(ANIMALES.filter((a) => a !== k));
      const escenas = [
        { k, acc },
        { k, acc: otraAcc },
        { k: otroK, acc },
      ];
      if (nOpts() >= 4)
        escenas.push({
          k: pick(ANIMALES.filter((a) => a !== k && a !== otroK)),
          acc: pick(ACCIONES.filter((a) => a !== acc && a !== otraAcc)),
        });
      return { texto: textoFrase(k, acc), escenas };
    });
}
// armaFrase(bg): ordenar las palabras de una frase (EL GATO DUERME) con la escena arriba.
function armaFrase(bg: () => void, d: AlTerminar) {
  const orden = shuffle(FRASES.filter(([k]) => /^(el|la) \S+$/.test(W_(k))));
  let i = 0;
  return ordenaPiezas(
    () => {
      const [k, acc] = orden[i++ % orden.length]!,
        t = textoFrase(k, acc);
      return {
        piezas: t.split(' '),
        dibujo: (x, y, s) => drawEscena(k, acc, x, y, s),
        oye: t.toLowerCase().split(' ').join('... '),
        ask: 'Mira el dibujo. Arrastra las palabras en orden para escribir lo que pasa.',
        ok: `${praise()} ${cap(t.toLowerCase())}.`,
      };
    },
    bg,
    d,
    'frases',
  );
}

/** Una página de los cuentos para leer: el texto de antes y de después de la palabra que lee el niño (con su dibujo). */
interface PaginaLeer {
  readonly antes: string;
  readonly k: string;
  readonly despues: string;
}
// CUENTOS_LEER: los cuentos del pueblo. En cada página, la palabra k sale escrita en mayúsculas dentro del texto y el niño
// la lee y toca su dibujo; después, Tito lee la página entera.
const CUENTOS_LEER: ReadonlyArray<{ titulo: string; paginas: readonly PaginaLeer[] }> = [
  {
    titulo: 'El pato y la luna',
    paginas: [
      { antes: 'Había una vez un', k: 'pato', despues: 'que vivía en un lago.' },
      { antes: 'Una noche, el pato miró al cielo y vio la', k: 'luna', despues: '.' },
      { antes: 'La luna estaba sola. El pato le llevó una', k: 'nube', despues: 'para que jugaran.' },
      { antes: 'Y la luna, la nube y el pato jugaron con una', k: 'pelota', despues: 'toda la noche.' },
    ],
  },
  {
    titulo: 'La vaca que quería volar',
    paginas: [
      { antes: 'En el pueblo vivía una', k: 'vaca', despues: 'muy curiosa.' },
      { antes: 'Un día, la vaca vio una', k: 'cometa', despues: 'en el cielo.' },
      { antes: 'Quería volar tan alto como ella, así que subió a un', k: 'cohete', despues: '.' },
      { antes: 'Y desde arriba saludó a la', k: 'luna', despues: '. ¡Hola, luna!' },
    ],
  },
];
// textoConPalabra(p, y): escribe la página p centrada desde la altura y, en líneas de 960 px como mucho, con la palabra
// que se lee en mayúsculas, en Andika y sobre un recuadro amarillo.
function textoConPalabra(p: PaginaLeer, y: number): void {
  const z = 46,
    pz = 58,
    palabra = sinArticulo(p.k).toUpperCase();
  const toks = [
    ...p.antes.split(' ').map((t) => ({ t, p: false })),
    { t: palabra, p: true },
    ...p.despues
      .split(' ')
      .filter(Boolean)
      .map((t) => ({ t, p: false })),
  ];
  const ancho = (t: { t: string; p: boolean }): number => {
    ctx.font = t.p ? `700 ${pz}px ${LF}` : `700 ${z}px ${DF}`;
    return ctx.measureText(t.t).width + (t.p ? 36 : 0);
  };
  // los signos sueltos (el punto final) van pegados a la palabra de antes
  const lineas: Array<Array<{ t: string; p: boolean; w: number; pega: boolean }>> = [[]];
  let w = 0;
  for (const t of toks) {
    const tw = ancho(t),
      pega = /^[.,;:!?¡¿]/.test(t.t) && !t.p,
      sp = pega ? 0 : 14;
    if (w + sp + tw > 960 && lineas[lineas.length - 1]!.length) {
      lineas.push([]);
      w = 0;
    }
    lineas[lineas.length - 1]!.push({ ...t, w: tw, pega });
    w += sp + tw;
  }
  lineas.forEach((ln, i) => {
    const tot = ln.reduce((a, t, j) => a + t.w + (j && !t.pega ? 14 : 0), 0);
    let x = 800 - tot / 2;
    const ly = y + i * 76;
    ln.forEach((t, j) => {
      if (j && !t.pega) x += 14;
      if (t.p) {
        card(x, ly - 56, t.w, 76, '#FFF3B0', 5, 18, '#FFC93C');
        text(t.t, x + t.w / 2, ly + 2, pz, '#E8554E', { f: LF });
      } else text(t.t, x, ly, z, '#3B3B4F', { al: 'left' });
      x += t.w;
    });
  });
}
// cuentoLeer(c, bg): un cuento para leer (ChoiceGame, una ronda por página): arriba, el libro con los dibujos que ya se
// han leído y el texto con la palabra escrita; abajo, dibujos para elegir el de la palabra.
function cuentoLeer(c: { titulo: string; paginas: readonly PaginaLeer[] }, bg: () => void, d: AlTerminar) {
  const hechos: string[] = [],
    todas = [...DOS, ...TRES].map((w) => w.k);
  return ChoiceGame(
    {
      rounds: c.paginas.length,
      bg,
      key: () => 'cuentos',
      y: 700,
      big: false,
      gen: (i: number) => {
        const p = c.paginas[i]!,
          otras = shuffle(todas.filter((k) => k !== p.k && !c.paginas.some((q) => q.k === k))).slice(
            0,
            Math.max(1, nOpts() - 1),
          );
        const ultima = i === c.paginas.length - 1,
          frase = `${p.antes} ${sinArticulo(p.k)}${/^[.,;:!?]/.test(p.despues) ? '' : ' '}${p.despues}`;
        return {
          words: [p.k, ...otras],
          ok: [p.k],
          pagina: p,
          ask: `${i === 0 ? `Vamos a leer un cuento: ${c.titulo}. ` : ''}${p.antes}... ¿Qué pone en la palabra amarilla? Toca su dibujo.`,
          okSay: () => {
            hechos.push(p.k);
            return `${praise()} ${frase}${ultima ? ' Y colorín, colorado, este cuento se ha acabado.' : ''}`;
          },
          badSay: (x: Cosa) => `Esa es ${nameT(x)}. Lee la palabra amarilla.`,
        };
      },
      ref: (r: Libre) => {
        card(290, 140, 1020, 410, '#FFFBF2', 6, 36);
        text(c.titulo, 800, 196, 40, '#8A5A34');
        hechos.forEach((k, j) => thing(k, 800 - ((hechos.length - 1) * 170) / 2 + j * 170, 300, 130));
        if (!hechos.length) thing('libro', 800, 300, 130);
        textoConPalabra(r.pagina, 450);
      },
    },
    d,
  );
}

// cancionAbecedario(bg): la canción del abecedario (Song, sin segunda parte): Tito canta las veinte letras de la isla en
// orden («La a de abeja...») y su tarjeta salta.
function cancionAbecedario(bg: () => void, d: AlTerminar) {
  const ABC = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
    orden = [...LETRAS].sort((a, b) => ABC.indexOf(a.l) - ABC.indexOf(b.l));
  const lines = orden.map((L) => ({
    say: `${cap(L.nombre)} de ${L.amigoDice}.`,
    n: L.nombre,
    draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * 0.8),
  }));
  return Song(
    {
      lines,
      tune: 'meses',
      cols: 7,
      s: 150,
      part2: false,
      bg,
      key: 'letras',
      intro: '¡Vamos a cantar la canción del abecedario! Escucha.',
    },
    d,
  );
}

// juegosPueblo(): las doce casitas del pueblo (5 años): R, C, G, J, V, Ñ, la fábrica de sílabas, las palabras de dos y
// de tres sílabas, las frases que se mueven, los cuentos para leer y la fiesta del abecedario. Sus ids y el orden de sus
// juegos son definitivos.
function juegosPueblo(): Tema[] {
  const bg = BG['letrasPueblo']!;
  const tema = (
    id: string,
    n: string,
    icon: string,
    c: string,
    intro: string,
    words: string[],
    games: JuegoTema[],
  ): Tema => ({ id, zone: 'puebloPalabras', n, icon, c, bg, words: words.map((k) => ({ k })), games, intro });
  const dos = DOS.map((w) => w.k),
    tres = TRES.map((w) => w.k);
  return [
    ...PUEBLO.map((L, i) => temaLetra(L, i, 'L5', bg)),
    tema('L5-FAB', 'Fábrica de sílabas', 'robot', '#7A8CA8', '¡Bienvenido a la fábrica de sílabas!', dos, [
      { t: 'maquina', icon: 'robot', name: 'La máquina de sílabas', make: (d: AlTerminar) => maquinaSilabas(bg, d) },
      { t: 'globosSilabas', icon: 'globo', name: 'Globos de sílabas', make: (d: AlTerminar) => globosSilabas(bg, d) },
      {
        t: 'trenLetra',
        icon: 'tren',
        name: 'El tren de las sílabas',
        make: (d: AlTerminar) => trenLetra(pick(PUEBLO), bg, d),
      },
      {
        t: 'silabaInicial',
        icon: 'oreja',
        name: '¿Con qué trozo empieza?',
        make: (d: AlTerminar) => silabaFalta(DOS, bg, d, true),
      },
    ]),
    tema('L5-DOS', 'Palabras de dos sílabas', 'pato', '#E8554E', '¡Vamos a leer palabras cortas!', dos, [
      { t: 'leoYElijo', icon: 'lupa', name: 'Leo y elijo', make: (d: AlTerminar) => leoYElijo(DOS, bg, d) },
      { t: 'armaPalabra', icon: 'pizarra', name: 'Armo la palabra', make: (d: AlTerminar) => armaPalabra(DOS, bg, d) },
      {
        t: 'silabaFalta',
        icon: 'oreja',
        name: 'La sílaba que falta',
        make: (d: AlTerminar) => silabaFalta(DOS, bg, d),
      },
      {
        t: 'unePalabra',
        icon: 'lapiz',
        name: 'Une la palabra con su dibujo',
        make: (d: AlTerminar) => unePalabraDibujo(DOS, bg, d),
      },
    ]),
    tema('L5-TRE', 'Palabras de tres sílabas', 'pelota', '#4FB477', '¡Ahora, palabras más largas!', tres, [
      { t: 'leoYElijo', icon: 'lupa', name: 'Leo y elijo', make: (d: AlTerminar) => leoYElijo(TRES, bg, d) },
      { t: 'armaPalabra', icon: 'pizarra', name: 'Armo la palabra', make: (d: AlTerminar) => armaPalabra(TRES, bg, d) },
      {
        t: 'silabaFalta',
        icon: 'oreja',
        name: 'La sílaba que falta',
        make: (d: AlTerminar) => silabaFalta(TRES, bg, d),
      },
      {
        t: 'unePalabra',
        icon: 'lapiz',
        name: 'Une la palabra con su dibujo',
        make: (d: AlTerminar) => unePalabraDibujo(TRES, bg, d),
      },
    ]),
    tema('L5-FRA', 'Frases que se mueven', 'rana', '#4BA3E0', '¡Vamos a leer frases!', ANIMALES, [
      {
        t: 'frase',
        icon: 'rana',
        name: 'Frases que se mueven',
        make: (d: AlTerminar) =>
          Frase({ frases: rondasFrase(nRounds()), bg, key: 'frases', intro: '¡Las frases se mueven!' }, d),
      },
      { t: 'armaFrase', icon: 'pizarra', name: 'Ordena la frase', make: (d: AlTerminar) => armaFrase(bg, d) },
      {
        t: 'frase',
        icon: 'pajaro',
        name: 'Más frases',
        make: (d: AlTerminar) => Frase({ frases: rondasFrase(nRounds()), bg, key: 'frases' }, d),
      },
    ]),
    tema(
      'L5-CUE',
      'Cuentos para leer',
      'cuento',
      '#9B6FD0',
      '¡Vamos a leer cuentos! Tú lees la palabra amarilla.',
      [...dos, ...tres],
      [
        {
          t: 'cuentoLeer',
          icon: 'pato',
          name: CUENTOS_LEER[0]!.titulo,
          make: (d: AlTerminar) => cuentoLeer(CUENTOS_LEER[0]!, bg, d),
        },
        {
          t: 'cuentoLeer',
          icon: 'vaca',
          name: CUENTOS_LEER[1]!.titulo,
          make: (d: AlTerminar) => cuentoLeer(CUENTOS_LEER[1]!, bg, d),
        },
        {
          t: 'leoYElijo',
          icon: 'lupa',
          name: 'Leo y elijo',
          make: (d: AlTerminar) => leoYElijo([...DOS, ...TRES], bg, d),
        },
      ],
    ),
    tema(
      'L5-FIE',
      'Fiesta del abecedario',
      'tarta',
      '#F08A3C',
      '¡Es la fiesta del abecedario!',
      PUEBLO.map((L) => L.amigo),
      [
        {
          t: 'cancionAbc',
          icon: 'regalo',
          name: 'La canción del abecedario',
          make: (d: AlTerminar) => cancionAbecedario(bg, d),
        },
        { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d, PUEBLO) },
        {
          t: 'comoEmpieza',
          icon: 'oreja',
          name: '¿Cómo empieza?',
          make: (d: AlTerminar) => comoEmpieza(bg, d, PUEBLO),
        },
        {
          t: 'maquina',
          icon: 'robot',
          name: 'La máquina de sílabas',
          make: (d: AlTerminar) =>
            maquinaSilabas(
              bg,
              d,
              PUEBLO.filter((L) => L.l !== 'Ñ').map((L) => ({ l: L.l, c: L.c })),
            ),
        },
        {
          t: 'memoriaVocales',
          icon: 'concha',
          name: 'Memoria de letras',
          make: (d: AlTerminar) => memoriaVocales(bg, d, PUEBLO),
        },
      ],
    ),
  ];
}

// TL5: las casitas del Pueblo de las Palabras (5 años), en el orden del camino (fase L5).
export const TL5: Tema[] = juegosPueblo();

// TEMAS_LETRAS: todos los temas de la isla, para TEMAS (escenas/escenas2d.ts).
export const TEMAS_LETRAS: Tema[] = [...TL3, ...TL4, ...TL5];

// PREFIJO: el prefijo de las casitas de cada zona de la isla ('L3-A', 'L4-M', 'L5-R').
const PREFIJO: Readonly<Record<string, string>> = { playaSonidos: 'L3', bosqueLetras: 'L4', puebloPalabras: 'L5' };
// casitaDeLetra(L): el id de la casita de la letra L (fase L7: el libro de letras y el progreso por letra lo miran).
export const casitaDeLetra = (L: Letra): string => `${PREFIJO[L.zona] ?? 'L3'}-${L.l}`;
