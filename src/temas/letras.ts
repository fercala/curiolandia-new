/*
 * temas/letras.ts: las casitas de la Isla de las Letras (fase L2 de docs/PLAN-LECTURA.md). De momento, las cinco
 * vocales de la Playa de los Sonidos (TL3), cada una con sus juegos hechos con componentes que ya existen: conocer la
 * letra y a sus amigos (Conocer), buscarla entre otras (ChoiceGame), trazarla con el dedo (Tracer), atrapar sus burbujas
 * (Atrapa) y, desde la E, unir cada letra aprendida con su amigo con una flecha (Une).
 * Las letras salen de LETRAS (contenido/letras.ts). Cada letra se dibuja como una «cosa» (cosaLetra: un objeto con
 * name y draw) para que los componentes la traten como a un dibujo más.
 * Los ids de los temas ('L3-A'...) son definitivos (son la clave del progreso guardado), y los juegos se guardan por
 * posición: añade juegos al final. Las demás casitas de la playa (las palmas, ¿cómo empieza?, mi nombre...) irán DETRÁS
 * de la U, en la fase L3, para no cambiar las casitas abiertas de los niños que ya juegan.
 * Exporta: BG.letras (al cargarse), cosaLetra, dibujaLetra, densificar, TL3 (los temas de la Playa de los Sonidos) y
 * TEMAS_LETRAS (todos los de la isla, para TEMAS en escenas/escenas2d.ts).
 * Importa: los tipos de juegos/tipos.ts, LETRAS de contenido/letras.ts, el núcleo (dibujo, voz, dificultad) y los
 * componentes de juegos/.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   los temas. */
import type { AlTerminar, Cosa, JuegoTema, Libre, Palabra, Tema } from '../juegos/tipos.ts';
import { LETRAS, letraEnPantalla, type Letra, type Trazo } from '../contenido/letras.ts';
import { AGE, LF, W_, cap, ctx, nOpts, nRounds, praise, sky, shuffle, text } from '../nucleo/indice.ts';
import { Atrapa, BG, ChoiceGame, Conocer, Tracer, Une, nameT } from '../juegos/indice.ts';

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

// distractoras(L): las letras que pueden salir con L como opciones equivocadas: las de su zona (las vocales, en la
// playa) y, desde los 5 años, también todas las demás de la isla.
const distractoras = (L: Letra): Letra[] => LETRAS.filter((x) => x !== L && (x.zona === L.zona || AGE() >= 5));

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
  const bg = BG['letras']!;
  const games: JuegoTema[] = [
    { t: 'conocerLetra', icon: L.amigo, name: `Conoce ${L.nombre}`, make: (d: AlTerminar) => conocerLetra(L, bg, d) },
    { t: 'buscaLetra', icon: 'lupa', name: `¿Dónde está ${L.nombre}?`, make: (d: AlTerminar) => buscaLetra(L, bg, d) },
    { t: 'trazaLetra', icon: 'lapiz', name: `Escribe ${L.nombre}`, make: (d: AlTerminar) => trazaLetra(L, d) },
    { t: 'atrapaLetra', icon: 'globo', name: `Atrapa ${L.nombre}`, make: (d: AlTerminar) => atrapaLetra(L, bg, d) },
  ];
  if (i > 0) games.push({ t: 'uneLetras', icon: 'pizarra', name: 'Une cada letra con su amigo', make: (d: AlTerminar) => uneLetras(L, bg, d) });
  const words: Palabra[] = [L.amigo, ...L.palabras].map((k) => ({ k }));
  return { id: `L3-${L.l}`, zone: 'playaSonidos', n: `La ${L.l}`, icon: L.amigo, c: L.c, bg, words, games,
    intro: `¡Vamos a conocer ${L.nombre}!` };
}

// TL3: las casitas de la Playa de los Sonidos (3 años), en el orden del camino: A, E, I, O, U.
export const TL3: Tema[] = LETRAS.filter((x) => x.zona === 'playaSonidos').map(temaVocal);

// TEMAS_LETRAS: todos los temas de la isla, para TEMAS (escenas/escenas2d.ts). Crecerá con las fases L3 a L5.
export const TEMAS_LETRAS: Tema[] = [...TL3];
