/*
 * escenas/diccionario.ts: «Mi diccionario de inglés» (fase I7 de docs/PLAN-INGLES.md), la escena SCENES.diccionario.
 * Se abre desde el álbum (el botón de Polly, arriba a la derecha, junto al del libro de letras) y es como el libro de
 * letras: unas páginas con las palabras en inglés que el niño ya ha visto. Una palabra entra en el diccionario cuando
 * se termina algún juego de su casita (un tema de la Isla del Inglés con su conjunto de palabras, t.en); salen las de
 * su edad (enItems), como en los juegos. Cada palabra es una tarjeta con su dibujo y la palabra escrita; al tocarla,
 * se oye en inglés y después qué quiere decir en castellano («Cat... quiere decir gato»).
 * Exporta: DICCIONARIO (dónde están las tarjetas, las flechas y el botón para volver al álbum), palabrasDe (las
 * palabras ya vistas de una lista de temas; también la usa la zona de adultos) y pone SCENES.diccionario al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito), las palabras y la tarjeta del inglés (temas/ingles.ts: EN, enItems,
 * enCard y sayMix), las casitas de la isla (ING, ING_PARQUE, ING_PUEBLO) y tst de escenas/escenas2d.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import { K } from '../dibujos/todos.ts';
import type { Tema } from '../juegos/tipos.ts';
import { SCENES, SFX, TITO, atHome, card, circ, ctx, dist, drawHome, drawTito, go, hC, hv, later, pic, sayQ, sky, sparkles, star, text } from '../nucleo/indice.ts';
import { EN, ING, ING_PARQUE, enCard, enItems, sayMix, type PalabraEn } from '../temas/ingles.ts';
import { ING_PUEBLO } from '../temas/inglesPueblo.ts';
import { tst } from './escenas2d.ts';

// DICCIONARIO: la cuadrícula de tarjetas (5 columnas y 3 filas: la primera, centrada en x0, y0; cada una a dx y dy de
// la anterior, de lado lado), las flechas de página y el botón para volver al álbum (arriba a la derecha).
export const DICCIONARIO = { x0: 430, y0: 270, dx: 230, dy: 190, cols: 5, porPagina: 15, lado: 160, ant: { x: 170, y: 450 }, sig: { x: 1530, y: 450 }, album: { x: 1440, y: 110, r: 60 } };

// palabrasDe(temas): las palabras en inglés que el niño ya ha visto en esos temas: las de su edad (enItems) de cada
// tema con conjunto de palabras (t.en) y algún juego terminado, en el orden de los temas, sin repetir y solo las que se
// pueden dibujar.
export function palabrasDe(temas: readonly Tema[]): PalabraEn[] {
  const vistas = temas.filter((t) => t.en && EN[t.en] && Object.keys(tst(t.id).g ?? {}).length > 0).flatMap((t) => enItems(t.en!));
  return vistas.filter((w, i) => (w.k || w.draw) && vistas.findIndex((o) => o.en === w.en) === i);
}

// palabras(): las del diccionario, las de toda la isla.
const palabras = (): PalabraEn[] => palabrasDe([...ING, ...ING_PARQUE, ...ING_PUEBLO]);

// pos(i): el centro [x, y] de la tarjeta número i de la página.
const pos = (i: number): [number, number] => [DICCIONARIO.x0 + (i % DICCIONARIO.cols) * DICCIONARIO.dx, DICCIONARIO.y0 + Math.floor(i / DICCIONARIO.cols) * DICCIONARIO.dy];

// drawFlecha(x, y, s, sig): una flecha de página en un círculo blanco (sig: hacia la derecha).
function drawFlecha(x: number, y: number, s: number, sig: boolean): void {
  const d = sig ? 1 : -1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circ(0, 0, 56, '#fff', 6);
  ctx.beginPath(); ctx.moveTo(-14 * d, -24); ctx.lineTo(18 * d, 0); ctx.lineTo(-14 * d, 24); ctx.lineWidth = 10; ctx.strokeStyle = K; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
}

// drawBotonAlbum(x, y, s): el botón para volver al álbum: un libro morado con una estrella, como el del libro de letras.
function drawBotonAlbum(x: number, y: number, s: number): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circ(0, 0, 56, '#fff', 6); card(-38, -32, 76, 64, '#9B8AD9', 5, 10); card(-29, -24, 58, 48, '#FFF6E6', 3, 7); star(0, 0, 16, '#FFC93C', 3);
  ctx.restore();
}

// DICCIONARIO DE INGLÉS: las palabras ya vistas, 15 por página.
SCENES.diccionario = { music: 'book',
  // enter(): primera página; Tito dice cuántas palabras hay ya en el diccionario.
  enter() {
    this.pg = 0; const n = palabras().length;
    later(300, () => sayQ(n ? `Este es tu diccionario de inglés. Ya conoces ${n} ${n === 1 ? 'palabra' : 'palabras'}.` : 'Tu diccionario de inglés está vacío. ¡Polly te espera en la Isla del Inglés!'));
  },
  // draw(): el título, las tarjetas de la página (o, si no hay ninguna, Polly esperando), el número de página, las
  // flechas, el botón del álbum, la casa y Tito.
  draw() {
    sky('#E3F4FF', '#FFF6E6'); card(240, 40, 1300, 800, '#FFFBF2', 8, 40); text('Mi diccionario de inglés', 890, 110, 52, K, { w: 600 });
    const P = palabras(), pags = Math.max(1, Math.ceil(P.length / DICCIONARIO.porPagina)), pg = Math.min(this.pg as number, pags - 1);
    if (!P.length) { pic('polly', 890, 450, 300); text('Juega en la Isla del Inglés y aquí saldrán tus palabras', 890, 680, 36, '#7A6252', { w: 600 }); }
    P.slice(pg * DICCIONARIO.porPagina, (pg + 1) * DICCIONARIO.porPagina).forEach((w, i) => {
      const [x, y] = pos(i); enCard(w, x, y, DICCIONARIO.lado, { label: true, s: hv('d' + i, hC(x, y, DICCIONARIO.lado / 2)) });
    });
    if (pags > 1) text(`${pg + 1} / ${pags}`, 890, 820, 30, '#7A6252');
    if (pg > 0) drawFlecha(DICCIONARIO.ant.x, DICCIONARIO.ant.y, hv('prev', hC(DICCIONARIO.ant.x, DICCIONARIO.ant.y, 60)), false);
    if (pg < pags - 1) drawFlecha(DICCIONARIO.sig.x, DICCIONARIO.sig.y, hv('next', hC(DICCIONARIO.sig.x, DICCIONARIO.sig.y, 60)), true);
    drawBotonAlbum(DICCIONARIO.album.x, DICCIONARIO.album.y, hv('album', hC(DICCIONARIO.album.x, DICCIONARIO.album.y, DICCIONARIO.album.r)));
    drawHome(); drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): la casa lleva al mapa y el botón, al álbum; las flechas cambian de página; tocar una palabra la dice en
  // inglés y luego qué quiere decir («Cat... quiere decir gato»).
  down(x: number, y: number) {
    if (atHome(x, y)) { SFX.tap(); go('map'); return; }
    if (dist(x, y, DICCIONARIO.album.x, DICCIONARIO.album.y) < DICCIONARIO.album.r) { SFX.whoosh(); go('album'); return; }
    const P = palabras(), pags = Math.max(1, Math.ceil(P.length / DICCIONARIO.porPagina));
    if (this.pg > 0 && dist(x, y, DICCIONARIO.ant.x, DICCIONARIO.ant.y) < 70) { this.pg--; SFX.whoosh(); return; }
    if (this.pg < pags - 1 && dist(x, y, DICCIONARIO.sig.x, DICCIONARIO.sig.y) < 70) { this.pg++; SFX.whoosh(); return; }
    P.slice(this.pg * DICCIONARIO.porPagina, (this.pg + 1) * DICCIONARIO.porPagina).forEach((w, i) => {
      const [px, py] = pos(i);
      if (Math.abs(x - px) > DICCIONARIO.lado / 2 || Math.abs(y - py) > DICCIONARIO.lado / 2) return;
      SFX.pop(); sparkles(px, py, 6); sayMix(['@' + w.en, `quiere decir ${w.es.toLowerCase()}.`]);
    });
  },
};
