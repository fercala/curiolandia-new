/*
 * temas/letras.ts: las casitas de la Isla de las Letras (fases L2 y L3 de docs/PLAN-LECTURA.md): las diez de la Playa
 * de los Sonidos (TL3). Primero las cinco vocales (fase L2), cada una con sus juegos hechos con componentes que ya
 * existen: conocer la letra y a sus amigos (Conocer), buscarla entre otras (ChoiceGame), trazarla con el dedo (Tracer),
 * atrapar sus burbujas (Atrapa) y, desde la E, unir cada letra aprendida con su amigo con una flecha (Une). Detrás
 * (fase L3), las palmas (Palmas, el eco de Tito, la palabra larga), ¿cómo empieza?, mi nombre (MiNombre, Pizarra), las
 * vocales mezcladas y la fiesta de las vocales (Excava, Memoria...). Palmas, Pizarra y MiNombre son de juegos/lectura.ts.
 * Las letras salen de LETRAS (contenido/letras.ts). Cada letra se dibuja como una «cosa» (cosaLetra: un objeto con
 * name y draw) para que los componentes la traten como a un dibujo más.
 * Los ids de los temas ('L3-A'...) son definitivos (son la clave del progreso guardado), y los juegos se guardan por
 * posición: añade juegos al final y casitas al final de su zona, para no cambiar las casitas abiertas de los niños que
 * ya juegan.
 * Exporta: BG.letras (al cargarse), cosaLetra, dibujaLetra, densificar, TL3 (los temas de la Playa de los Sonidos) y
 * TEMAS_LETRAS (todos los de la isla, para TEMAS en escenas/escenas2d.ts).
 * Importa: los tipos de juegos/tipos.ts, LETRAS de contenido/letras.ts, el núcleo (dibujo, voz, dificultad) y los
 * componentes de juegos/.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   los temas. */
import type { AlTerminar, Cosa, JuegoTema, Libre, Palabra, Tema } from '../juegos/tipos.ts';
import { LETRAS, letraEnPantalla, type Letra, type Trazo } from '../contenido/letras.ts';
import { AGE, LF, S, W_, cap, ctx, nOpts, nRounds, pick, praise, sky, shuffle, text } from '../nucleo/indice.ts';
import { Atrapa, BG, ChoiceGame, Conocer, Excava, Memoria, Huellas, MiNombre, NUM, Palmas, Pizarra, Tracer, Tren, Une, nameT, nombreDeLetra } from '../juegos/indice.ts';

// BG.letras: el fondo de los juegos de letras: cielo claro, arena y letras grandes muy suaves al fondo.
Object.assign(BG, {
  letras(): void {
    sky('#E3F4FB', '#FFF6E0');
    ctx.fillStyle = '#FFE9B8'; ctx.fillRect(0, 760, 1600, 140);
    ctx.save(); ctx.globalAlpha = .08;
    'AEIOUMPLS'.split('').forEach((l, i) => text(l, 140 + i * 170, 200 + (i % 3) * 230, 150, '#5B8DEF', { f: LF }));
    ctx.restore();
  },
});

// dibujaLetra(L, x, y, s): pinta la letra L (mayúscula, letra de palo) centrada en (x, y) con alto s, de su color y
// con borde blanco, en Andika (LF), la fuente para los que empiezan a leer.
export function dibujaLetra(L: Letra, x: number, y: number, s: number): void {
  text(L.l, x, y + s * .36, s, L.c, { f: LF, st: Math.max(4, s * .06), sc: '#fff' });
}

// COSAS: una «cosa» por letra, creada una sola vez (los componentes comparan las cosas por identidad: así la A de
// las burbujas es la misma que la del objetivo).
const COSAS = new Map<string, Libre>();
// cosaLetra(L): la letra L como cosa de los componentes: {l, name (cómo se dice: 'la a'), draw(x, y, s)}.
export function cosaLetra(L: Letra): Libre {
  let c = COSAS.get(L.l);
  if (!c) { c = { l: L.l, name: L.nombre, draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * .95) }; COSAS.set(L.l, c); }
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

// fondoTrazo(L): el fondo del juego de trazar la letra L: BG.letras y la letra entera muy suave, para ver la forma.
const fondoTrazo = (L: Letra) => (): void => {
  BG['letras']!();
  ctx.save(); ctx.globalAlpha = .18; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 90; ctx.strokeStyle = L.c;
  for (const t of L.trazos) {
    const p = letraEnPantalla(t, CAJA.x, CAJA.y, CAJA.w, CAJA.h);
    ctx.beginPath(); p.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  ctx.restore();
};

// distractoras(L): las letras que pueden salir con L como opciones equivocadas: en la playa, las otras vocales; en el
// bosque, las ya vistas (las vocales y las del bosque anteriores); desde los 5 años, todas las demás de la isla.
const distractoras = (L: Letra): Letra[] => {
  if (AGE() >= 5) return LETRAS.filter((x) => x !== L);
  if (L.zona === 'playaSonidos') return LETRAS.filter((x) => x !== L && x.zona === L.zona);
  // en el bosque, a los 3 y 4 años, las ya vistas: las vocales y las del bosque que van antes (desde la fase L4)
  return LETRAS.filter((x) => x.zona === 'playaSonidos' || (x.zona === L.zona && LETRAS.indexOf(x) < LETRAS.indexOf(L)));
};

// conocerLetra(L, bg): el juego de conocer la letra: su tarjeta (se dice «Esta es la a. La a de abeja.») y las de su
// amigo y sus palabras («La abeja. Abeja empieza por la a.»).
function conocerLetra(L: Letra, bg: () => void, d: AlTerminar) {
  const tarjeta = { draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * .9), label: L.l, say: `Esta es ${L.nombre}. ${cap(L.nombre)} de ${L.amigoDice}.` };
  const palabras = [L.amigo, ...L.palabras].map((k) => ({ k, say: `${cap(W_(k))}. ${cap(sinArticulo(k))} empieza por ${L.nombre}.` }));
  return Conocer({ items: [tarjeta, ...palabras], bg, intro: `¡Vamos a conocer ${L.nombre}! Toca cada tarjeta.` }, d);
}

// buscaLetra(L, bg): «¿Dónde está la a?» entre nOpts() letras (la buena y distractoras), nRounds() rondas.
function buscaLetra(L: Letra, bg: () => void, d: AlTerminar) {
  const buena = cosaLetra(L);
  return ChoiceGame({ rounds: nRounds(), bg, key: () => 'letras', y: 560, big: true,
    gen: () => {
      const otras = shuffle(distractoras(L)).slice(0, Math.max(1, nOpts() - 1)).map(cosaLetra);
      const ask = `¿Dónde está ${L.nombre}?`;
      return { words: [buena, ...otras], ok: [buena], ask,
        okSay: () => `${praise()} ${cap(L.nombre)} de ${L.amigoDice}.`,
        badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}` };
    } }, d);
}

// trazaLetra(L, d): trazar la letra L trazo a trazo con el dedo; su amigo avanza por el camino. Una estrella por trazo.
function trazaLetra(L: Letra, d: AlTerminar) {
  const n = L.trazos.length;
  const paths = L.trazos.map((t: Trazo, i: number) => ({
    pts: densificar(letraEnPantalla(t, CAJA.x, CAJA.y, CAJA.w, CAJA.h)), who: L.amigo, ws: 110, c: L.c,
    say: i === 0 ? `Vamos a escribir ${L.nombre}. Empieza en el punto verde y sigue el camino con el dedo.` : 'Ahora, el siguiente trazo. Empieza en el punto verde.',
    ok: i === n - 1 ? `¡Muy bien! ¡Ya sabes escribir ${L.nombre}!` : praise(),
  }));
  return Tracer({ paths, bg: fondoTrazo(L), ask: `Sigue el camino de ${L.nombre} con el dedo.` }, d);
}

// atrapaLetra(L, bg): burbujas con letras; hay que atrapar las de L.
function atrapaLetra(L: Letra, bg: () => void, d: AlTerminar) {
  const buena = cosaLetra(L);
  const pool = [buena, ...distractoras(L).slice(0, 4).map(cosaLetra)];
  return Atrapa({ bg, pool, key: 'letras', ring: (k: Libre) => LETRAS.find((x) => x.l === k.l)?.c ?? '#5B8DEF',
    targets: [{ ask: `¡Atrapa las burbujas de ${L.nombre}!`, is: (k: Cosa) => k === buena, label: 'Atrapa', icon: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s) }] }, d);
}

// uneLetras(hasta, bg): unir con una flecha cada letra aprendida hasta `hasta` (incluida) con su amigo.
function uneLetras(hasta: Letra, bg: () => void, d: AlTerminar) {
  const vistas = LETRAS.slice(0, LETRAS.indexOf(hasta) + 1).filter((x) => x.zona === hasta.zona);
  const pairs = vistas.map((x) => [cosaLetra(x), x.amigo]);
  const deLetra = (a: Libre) => LETRAS.find((x) => x.l === a.l)!;
  return Une({ pairs, n: Math.min(pairs.length, AGE() <= 3 ? 3 : 4), rounds: pairs.length > 3 ? 2 : 1, bg, key: 'letras',
    ask: 'Une cada letra con su amigo. Arrastra una línea desde la letra hasta su dibujo.',
    okSay: (a: Libre) => `${praise()} ${cap(a.name)} de ${deLetra(a).amigoDice}.`,
    why: (a: Libre, b: string) => `${cap(W_(b))} no empieza por ${a.name}.` }, d);
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
  if (i > 0) games.push({ t: 'uneLetras', icon: 'pizarra', name: 'Une cada letra con su amigo', make: (d: AlTerminar) => uneLetras(L, bg, d) });
  if (L.zona !== 'playaSonidos') games.push(
    { t: 'trenLetra', icon: 'tren', name: `El tren de ${L.nombre}`, make: (d: AlTerminar) => trenLetra(L, bg, d) },
    { t: 'huellasLetra', icon: L.amigo, name: `Las huellas de ${L.nombre}`, make: (d: AlTerminar) => huellasLetra(L, bg, d) });
  const words: Palabra[] = [L.amigo, ...L.palabras].map((k) => ({ k }));
  return { id: `${pre}-${L.l}`, zone: L.zona, n: `La ${L.l}`, icon: L.amigo, c: L.c, bg, words, games,
    intro: `¡Vamos a conocer ${L.nombre}!` };
}

/* ---------- fase L3: el resto de la Playa de los Sonidos ---------- */
// VOCALES: las cinco letras de la playa, en orden.
const VOCALES: Letra[] = LETRAS.filter((x) => x.zona === 'playaSonidos');
// SILABAS: cómo se parten en sílabas (para dar palmas y para el eco de Tito) las palabras con dibujo que usan los juegos.
const SILABAS: Readonly<Record<string, readonly string[]>> = {
  sol: ['sol'], flor: ['flor'], tren: ['tren'], pez: ['pez'], luna: ['lu', 'na'], casa: ['ca', 'sa'], pato: ['pa', 'to'],
  mono: ['mo', 'no'], rana: ['ra', 'na'], vaca: ['va', 'ca'], foca: ['fo', 'ca'], nube: ['nu', 'be'], oso: ['o', 'so'],
  uva: ['u', 'va'], mesa: ['me', 'sa'], iglu: ['i', 'glú'], abeja: ['a', 'be', 'ja'], pelota: ['pe', 'lo', 'ta'],
  tortuga: ['tor', 'tu', 'ga'], gallina: ['ga', 'lli', 'na'], jirafa: ['ji', 'ra', 'fa'], ballena: ['ba', 'lle', 'na'],
  manzana: ['man', 'za', 'na'], caracol: ['ca', 'ra', 'col'], estrella: ['es', 'tre', 'lla'], elefante: ['e', 'le', 'fan', 'te'],
  mariposa: ['ma', 'ri', 'po', 'sa'],
};
// silabas(k): las sílabas de la palabra k (copia, para el componente).
const silabas = (k: string): string[] => [...(SILABAS[k] ?? [sinArticulo(k)])];
// rondasPalmas(ks): las rondas de Palmas con las palabras ks, en ese orden.
const rondasPalmas = (ks: readonly string[]) => ks.map((k) => ({ k, syl: silabas(k) }));
// vocalDe(k): la letra de LETRAS por la que empieza la palabra con dibujo k (su amigo o una de sus palabras), o undefined.
const vocalDe = (k: string): Letra | undefined => LETRAS.find((v) => v.amigo === k || v.palabras.includes(k));
// palabrasVocal(L): el amigo y las palabras de la vocal L.
const palabrasVocal = (L: Letra): string[] => [L.amigo, ...L.palabras];

// ecoTito(bg): «el eco de Tito»: Tito dice una palabra a trozos («ma... ri... po... sa») y hay que tocar su dibujo.
function ecoTito(bg: () => void, d: AlTerminar) {
  const pool = Object.keys(SILABAS).filter((k) => SILABAS[k]!.length > 1);
  return ChoiceGame({ rounds: nRounds(), bg, key: () => 'palmas', y: 560, big: true,
    gen: () => {
      const t = pick(pool), otras = shuffle(pool.filter((k) => k !== t)).slice(0, Math.max(1, nOpts() - 1));
      const ask = `Escucha: ${silabas(t).join('... ')}. ¿Qué es?`;
      return { words: [t, ...otras], ok: [t], ask, okSay: () => `${praise()} ${cap(nameT(t))}.`, badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}` };
    } }, d);
}

// palabraLarga(bg): «la palabra larga»: dos dibujos, uno de una o dos palmas y otro de tres o cuatro; hay que tocar el
// que tiene más palmas.
function palabraLarga(bg: () => void, d: AlTerminar) {
  const cortas = Object.keys(SILABAS).filter((k) => SILABAS[k]!.length <= 2), largas = Object.keys(SILABAS).filter((k) => SILABAS[k]!.length >= 3);
  const palmas = (k: Cosa) => { const n = silabas(String(k)).length; return n === 1 ? 'una palma' : `${NUM[n]} palmas`; };
  return ChoiceGame({ rounds: nRounds(), bg, key: () => 'palmas', y: 560, big: true,
    gen: () => {
      const l = pick(largas), c = pick(cortas.filter((k) => SILABAS[k]!.length <= SILABAS[l]!.length - 1));
      const [a, b] = shuffle([l, c]);
      const ask = `¿Cuál es más larga: ${sinArticulo(a!)} o ${sinArticulo(b!)}? Da palmas con cada una.`;
      return { words: [l, c], ok: [l], ask, okSay: () => `${praise()} ${cap(sinArticulo(l))} tiene ${palmas(l)}.`,
        badSay: (w: Cosa) => `${cap(sinArticulo(String(w)))} tiene ${palmas(w)}. ¿Cuál tiene más?` };
    } }, d);
}

// comoEmpieza(bg, d, set): «¿cómo empieza?»: Tito dice una letra de set (las vocales, si no se da) y hay que tocar el
// dibujo que empieza por ella, entre dibujos que empiezan por otras letras de set.
function comoEmpieza(bg: () => void, d: AlTerminar, set: Letra[] = VOCALES) {
  return ChoiceGame({ rounds: nRounds(), bg, key: () => 'letras', y: 560, big: true,
    gen: () => {
      const L = pick(set), t = pick(palabrasVocal(L));
      const otras = shuffle(set.filter((v) => v !== L)).slice(0, Math.max(1, nOpts() - 1)).map((v) => pick(palabrasVocal(v)));
      const ask = `¿Qué empieza por ${L.nombre}?`;
      return { words: [t, ...otras], ok: [t], ask, okSay: () => `${praise()} ${cap(sinArticulo(t))} empieza por ${L.nombre}.`,
        badSay: (w: Cosa) => `${cap(sinArticulo(String(w)))} empieza por ${vocalDe(String(w))?.nombre ?? 'otra letra'}. ${ask}` };
    } }, d);
}

// uneDibujoLetra(bg): unir cada dibujo con la vocal por la que empieza (al revés que uneLetras: del dibujo a la letra).
function uneDibujoLetra(bg: () => void, d: AlTerminar) {
  const pairs = VOCALES.map((x) => [x.amigo, cosaLetra(x)]);
  return Une({ pairs, n: AGE() <= 3 ? 3 : 4, rounds: 2, bg, key: 'letras',
    ask: 'Une cada dibujo con la letra por la que empieza.',
    okSay: (a: string, b: Libre) => `${praise()} ${cap(sinArticulo(a))} empieza por ${b.name}.`,
    why: (a: string, b: Libre) => `${cap(sinArticulo(a))} no empieza por ${b.name}.` }, d);
}

// excavaVocales(bg): escarbar en la arena para encontrar las vocales escondidas (Excava).
function excavaVocales(bg: () => void, d: AlTerminar) {
  return Excava({ pool: VOCALES.map(cosaLetra), n: AGE() <= 3 ? 4 : 5, bg, intro: 'Escarba en la arena con el dedo. ¡Hay letras escondidas!' }, d);
}

// memoriaVocales(bg, d, set): memoria con las letras de set (las vocales, si no se da): dos cartas iguales.
function memoriaVocales(bg: () => void, d: AlTerminar, set: Letra[] = VOCALES) {
  return Memoria({ pool: set.map(cosaLetra), pairs: AGE() <= 3 ? 3 : 4, bg, intro: 'Juego de memoria con las letras. Toca dos cartas y busca dos letras iguales.' }, d);
}

// buscaVocales(bg, d, set): «¿dónde está…?» con una letra de set (las vocales, si no se da) distinta en cada ronda.
function buscaVocales(bg: () => void, d: AlTerminar, set: Letra[] = VOCALES) {
  return ChoiceGame({ rounds: nRounds(), bg, key: () => 'letras', y: 560, big: true,
    gen: () => {
      const L = pick(set), buena = cosaLetra(L), otras = shuffle(set.filter((v) => v !== L)).slice(0, Math.max(1, nOpts() - 1)).map(cosaLetra);
      const ask = `¿Dónde está ${L.nombre}?`;
      return { words: [buena, ...otras], ok: [buena], ask, okSay: () => `${praise()} ${cap(L.nombre)} de ${L.amigoDice}.`, badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}` };
    } }, d);
}

// atrapaVocales(bg): burbujas con las vocales: primero hay que atrapar las de una y después las de otra.
function atrapaVocales(bg: () => void, d: AlTerminar) {
  const [a, b] = shuffle(VOCALES).slice(0, 2) as [Letra, Letra];
  const pool = VOCALES.map(cosaLetra), obj = (L: Letra) => ({ ask: `¡Atrapa las burbujas de ${L.nombre}!`, is: (k: Cosa) => k === cosaLetra(L), label: 'Atrapa', icon: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s) });
  return Atrapa({ bg, pool, key: 'letras', ring: (k: Libre) => LETRAS.find((x) => x.l === k.l)?.c ?? '#5B8DEF', targets: [obj(a), obj(b)] }, d);
}

// conocerVocales(bg): las cinco vocales en tarjetas, para repasarlas («Esta es la a. La a de abeja.»).
function conocerVocales(bg: () => void, d: AlTerminar) {
  const items = VOCALES.map((L) => ({ draw: (x: number, y: number, s: number) => dibujaLetra(L, x, y, s * .9), label: L.l, say: `Esta es ${L.nombre}. ${cap(L.nombre)} de ${L.amigoDice}.` }));
  return Conocer({ items, bg, intro: '¡Es la fiesta de las vocales! Toca cada una.' }, d);
}

// cosaLetraLibre(l): cualquier letra (también las que no están en LETRAS) como cosa de los componentes, en azul.
function cosaLetraLibre(l: string): Libre {
  const L = LETRAS.find((x) => x.l === l);
  return L ? cosaLetra(L) : { l, name: nombreDeLetra(l), draw: (x: number, y: number, s: number) => text(l, x, y + s * .34, s * .95, '#5B8DEF', { f: LF, st: Math.max(4, s * .06), sc: '#fff' }) };
}
// miNombre(): el nombre del niño (S.name) en mayúsculas para escribirlo y cómo lo dice Tito; si no hay, el de Tito.
function miNombre(): { escrito: string; dice: string; suyo: boolean } {
  const n = String(S.name || '').trim();
  return n ? { escrito: n.toUpperCase(), dice: n, suyo: true } : { escrito: 'TITO', dice: 'Tito', suyo: false };
}
// inicial(): la primera letra del nombre (sin tilde: É -> E).
const inicial = (): string => { const l = [...miNombre().escrito].find((c) => /\p{L}/u.test(c)) ?? 'T'; return l === 'Ñ' ? l : l.normalize('NFD').replace(/[̀-ͯ]/g, ''); };

// juegoMiNombre(bg): el nombre del niño en letras grandes, que se tocan una a una (MiNombre).
function juegoMiNombre(bg: () => void, d: AlTerminar) {
  const n = miNombre();
  return MiNombre({ nombre: n.escrito, dice: n.dice, bg, key: 'letras',
    intro: n.suyo ? `Este es tu nombre: ${n.dice}. Toca sus letras, una a una.` : 'Este es el nombre de Tito. Toca sus letras, una a una.' }, d);
}

// pizarraInicial(bg): pintar con el dedo la primera letra del nombre (Pizarra), con su camino de ayuda si es de LETRAS.
function pizarraInicial(bg: () => void, d: AlTerminar) {
  const l = inicial(), L = LETRAS.find((x) => x.l === l), de = miNombre().suyo ? 'de tu nombre' : 'del nombre de Tito';
  const path = L ? densificar(L.trazos.flatMap((t) => letraEnPantalla(t, 700, 220, 400, 520)), 30) : undefined;
  return Pizarra({ letra: l, c: '#FFE08A', bg, path, key: 'trazos',
    ask: `Esta es ${nombreDeLetra(l)}, la primera letra ${de}. Píntala con el dedo como tú quieras.`,
    ok: `¡Qué bonita te ha quedado ${nombreDeLetra(l)}!` }, d);
}

// buscaInicial(bg): «¿dónde está…?» con la primera letra del nombre entre vocales.
function buscaInicial(bg: () => void, d: AlTerminar) {
  return ChoiceGame({ rounds: nRounds(), bg, key: () => 'letras', y: 560, big: true,
    gen: () => {
      const l = inicial(), buena = cosaLetraLibre(l), otras = shuffle(VOCALES.filter((v) => v.l !== l)).slice(0, Math.max(1, nOpts() - 1)).map(cosaLetra);
      const ask = `¿Dónde está ${nombreDeLetra(l)}?`;
      return { words: [buena, ...otras], ok: [buena], ask, okSay: () => `${praise()} Con ${nombreDeLetra(l)} empieza ${miNombre().suyo ? 'tu nombre' : 'Tito'}.`, badSay: (w: Cosa) => `Esa es ${nameT(w)}. ${ask}` };
    } }, d);
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
      { t: 'palmas', icon: 'tambor', name: 'Da palmas', make: (d: AlTerminar) => Palmas({ words: rondasPalmas(['sol', 'luna', 'pato', 'abeja', 'mariposa']), bg, key: 'palmas', intro: 'Vamos a dar una palmada por cada trozo de la palabra.' }, d) },
      { t: 'ecoTito', icon: 'oreja', name: 'El eco de Tito', make: (d: AlTerminar) => ecoTito(bg, d) },
      { t: 'palmas', icon: 'tambor', name: 'Más palmas', make: (d: AlTerminar) => Palmas({ words: rondasPalmas(['flor', 'casa', 'oso', 'pelota', 'elefante']), bg, key: 'palmas' }, d) },
      { t: 'palabraLarga', icon: 'manos', name: 'La palabra larga', make: (d: AlTerminar) => palabraLarga(bg, d) },
    ]),
    temaPlaya('L3-EMP', '¿Cómo empieza?', 'oreja', '#F08A3C', '¡Vamos a escuchar cómo empiezan las palabras!', [
      { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d) },
      { t: 'uneDibujoLetra', icon: 'pizarra', name: 'Une cada dibujo con su letra', make: (d: AlTerminar) => uneDibujoLetra(bg, d) },
      { t: 'excavaVocales', icon: 'pala', name: 'Letras en la arena', make: (d: AlTerminar) => excavaVocales(bg, d) },
      { t: 'memoriaVocales', icon: 'concha', name: 'Memoria de letras', make: (d: AlTerminar) => memoriaVocales(bg, d) },
    ]),
    temaPlaya('L3-NOM', 'Mi nombre', 'pizarra', '#4BA3E0', '¡Vamos a jugar con las letras de tu nombre!', [
      { t: 'miNombre', icon: 'pizarra', name: 'Mi nombre', make: (d: AlTerminar) => juegoMiNombre(bg, d) },
      { t: 'pizarra', icon: 'lapiz', name: 'La pizarra', make: (d: AlTerminar) => pizarraInicial(bg, d) },
      { t: 'buscaInicial', icon: 'lupa', name: 'Mi primera letra', make: (d: AlTerminar) => buscaInicial(bg, d) },
    ]),
    temaPlaya('L3-MEZ', 'Las vocales mezcladas', 'globo', '#4FB477', '¡Las vocales se han mezclado! Vamos a encontrarlas.', [
      { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d) },
      { t: 'atrapaVocales', icon: 'globo', name: 'Atrapa las vocales', make: (d: AlTerminar) => atrapaVocales(bg, d) },
      { t: 'uneLetras', icon: 'pizarra', name: 'Une cada letra con su amigo', make: (d: AlTerminar) => uneLetras(VOCALES[VOCALES.length - 1]!, bg, d) },
      { t: 'memoriaVocales', icon: 'concha', name: 'Memoria de letras', make: (d: AlTerminar) => memoriaVocales(bg, d) },
    ]),
    temaPlaya('L3-FIE', 'Fiesta de las vocales', 'tarta', '#9B6FD0', '¡Es la fiesta de las vocales!', [
      { t: 'conocerVocales', icon: 'regalo', name: 'Las cinco vocales', make: (d: AlTerminar) => conocerVocales(bg, d) },
      { t: 'palmas', icon: 'tambor', name: 'Palmas con los amigos', make: (d: AlTerminar) => Palmas({ words: rondasPalmas(VOCALES.map((L) => L.amigo)), bg, key: 'palmas' }, d) },
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
    ctx.fillStyle = '#C9E7A8'; ctx.fillRect(0, 760, 1600, 140);
    ctx.save(); ctx.globalAlpha = .08;
    'MPLSTNDFB'.split('').forEach((l, i) => text(l, 140 + i * 170, 200 + (i % 3) * 230, 150, '#3E7A5A', { f: LF }));
    ctx.restore();
  },
});
// BOSQUE: las nueve consonantes del bosque, en orden (M, P, L, S, T, N, D, F, B).
const BOSQUE: Letra[] = LETRAS.filter((x) => x.zona === 'bosqueLetras');

// trenLetra(L, bg): el tren de las sílabas de L con las cinco vocales (MA, ME, MI, MO, MU), con el componente Tren.
function trenLetra(L: Letra, bg: () => void, d: AlTerminar) {
  return Tren({ letra: { l: L.l, nombre: L.nombre, c: L.c }, vocales: VOCALES.map((v) => ({ l: v.l, c: v.c })), bg, key: 'letras' }, d);
}

// huellasLetra(L, bg): las huellas del amigo de L forman la letra; hay que tocarlas en orden (Huellas).
function huellasLetra(L: Letra, bg: () => void, d: AlTerminar) {
  return Huellas({ trazos: L.trazos.map((t) => densificar(letraEnPantalla(t, 680, 190, 440, 560), 10)), c: L.c, who: L.amigo, bg, key: 'trazos',
    ask: `Las huellas de ${W_(L.amigo)} forman ${L.nombre}. Tócalas en orden, empezando por la que brilla.`,
    ok: `${praise()} Las huellas forman ${L.nombre}.` }, d);
}

// letraDelNombre(): la primera letra del nombre si está en LETRAS (si no, la de Tito, la T), para trazarla.
const letraDelNombre = (): Letra => LETRAS.find((x) => x.l === inicial()) ?? LETRAS.find((x) => x.l === 'T')!;

// juegosBosque(): las doce casitas del bosque (4 años): repaso de vocales, M, P, L, S, T, N, D, F, B, escribo mi nombre
// y la fiesta de las letras. Sus ids y el orden de sus juegos son definitivos.
function juegosBosque(): Tema[] {
  const bg = BG['letrasBosque']!;
  const tema = (id: string, n: string, icon: string, c: string, intro: string, games: JuegoTema[]): Tema =>
    ({ id, zone: 'bosqueLetras', n, icon, c, bg, words: BOSQUE.map((L) => ({ k: L.amigo })), games, intro });
  return [
    tema('L4-VOC', 'Repaso de vocales', 'abeja', '#E8554E', '¡Vamos a repasar las vocales antes de entrar en el bosque!', [
      { t: 'conocerVocales', icon: 'regalo', name: 'Las cinco vocales', make: (d: AlTerminar) => conocerVocales(bg, d) },
      { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d) },
      { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d) },
      { t: 'uneDibujoLetra', icon: 'pizarra', name: 'Une cada dibujo con su letra', make: (d: AlTerminar) => uneDibujoLetra(bg, d) },
    ]),
    ...BOSQUE.map((L, i) => temaLetra(L, i, 'L4', bg)),
    tema('L4-NOM', 'Escribo mi nombre', 'lapiz', '#4BA3E0', '¡Vamos a escribir las letras de tu nombre!', [
      { t: 'miNombre', icon: 'pizarra', name: 'Mi nombre', make: (d: AlTerminar) => juegoMiNombre(bg, d) },
      { t: 'trazaLetra', icon: 'lapiz', name: 'Escribe mi primera letra', make: (d: AlTerminar) => trazaLetra(letraDelNombre(), d) },
      { t: 'huellasLetra', icon: 'tortuga', name: 'Huellas de mi letra', make: (d: AlTerminar) => huellasLetra(letraDelNombre(), bg, d) },
      { t: 'buscaInicial', icon: 'lupa', name: 'Mi primera letra', make: (d: AlTerminar) => buscaInicial(bg, d) },
    ]),
    tema('L4-FIE', 'Fiesta de las letras', 'tarta', '#9B6FD0', '¡Es la fiesta de las letras del bosque!', [
      { t: 'buscaVocales', icon: 'lupa', name: '¿Dónde está?', make: (d: AlTerminar) => buscaVocales(bg, d, BOSQUE) },
      { t: 'comoEmpieza', icon: 'oreja', name: '¿Cómo empieza?', make: (d: AlTerminar) => comoEmpieza(bg, d, BOSQUE) },
      { t: 'trenLetra', icon: 'tren', name: 'El tren de las sílabas', make: (d: AlTerminar) => trenLetra(pick(BOSQUE), bg, d) },
      { t: 'uneLetras', icon: 'pizarra', name: 'Une cada letra con su amigo', make: (d: AlTerminar) => uneLetras(BOSQUE[BOSQUE.length - 1]!, bg, d) },
      { t: 'memoriaVocales', icon: 'concha', name: 'Memoria de letras', make: (d: AlTerminar) => memoriaVocales(bg, d, BOSQUE) },
    ]),
  ];
}

// TL4: las casitas del Bosque de las Letras (4 años), en el orden del camino (fase L4).
export const TL4: Tema[] = juegosBosque();

// TEMAS_LETRAS: todos los temas de la isla, para TEMAS (escenas/escenas2d.ts). Crecerá con las fases L3 a L5.
export const TEMAS_LETRAS: Tema[] = [...TL3, ...TL4];
