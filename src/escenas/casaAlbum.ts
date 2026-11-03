/*
 * escenas/casaAlbum.ts: el álbum «Sorpresas de la casa» (fase C7 de docs/PLAN-CASA.md, decisión 9), la escena
 * SCENES.sorpresasCasa. Se abre con el botón del libro de la casa de Tito (ALBUM_CASA_BOTON, en escenas/tienda.ts) y
 * tiene una casilla por sorpresa (ENTRADAS_ALBUM): una por objeto con reacción (REACCIONES) y una por combinación de
 * dos objetos (COMBINACIONES), TOTAL_SORPRESAS en total. Las descubiertas (S.sorpresas: al jugar con el objeto o al
 * juntar los dos) salen con su dibujo; las demás, escondidas con una interrogación. Al tocar una descubierta, Tito
 * dice su frase (FRASES_CASA o FRASES_COMBINACION de contenido/casa.ts). Por páginas, con flechas. La casa (arriba a
 * la izquierda) vuelve a la casa de Tito.
 * Exporta: ALBUM_CASA_BOTON, ENTRADAS_ALBUM, POR_PAGINA y pone SCENES.sorpresasCasa.
 * Importa: el núcleo (dibujo, voz, sonido, toque), las reglas de las sorpresas de dominio/casa.ts y las frases de
 * contenido/casa.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { S, SCENES, SFX, T, atHome, card, circ, ctx, dist, drawHome, drawTito, go, hC, hv, later, pic, say, sayQ, sparkles, star, text } from '../nucleo/indice.ts';
import { COMBINACIONES, REACCIONES, TOTAL_SORPRESAS, cuantasSorpresas } from '../dominio/casa.ts';
import { FRASES_CASA, FRASES_COMBINACION } from '../contenido/casa.ts';

// ALBUM_CASA_BOTON: el botón del álbum en la casa de Tito (a la izquierda, debajo del de la casa).
export const ALBUM_CASA_BOTON = { x: 80, y: 200, r: 52 };
// ENTRADAS_ALBUM: las sorpresas del álbum, en orden: los objetos (por habitación, como en REACCIONES) y después las
// combinaciones ('a+b').
export const ENTRADAS_ALBUM: readonly string[] = [...Object.keys(REACCIONES), ...COMBINACIONES.map((c) => c.a + '+' + c.b)];
// POR_PAGINA: casillas por página (8 columnas y 4 filas). REJILLA: dónde empieza y cuánto mide cada casilla.
export const POR_PAGINA = 32;
const REJILLA = { x0: 230, y0: 230, dx: 163, dy: 160, w: 146, h: 146, col: 8 };
// FLECHAS: las flechas para pasar de página (x de la izquierda y de la derecha, y).
const FLECHAS = { izq: 110, der: 1490, y: 470 };

// casilla(i): el centro de la casilla i de la página.
const casilla = (i: number): [number, number] => [REJILLA.x0 + (i % REJILLA.col) * REJILLA.dx, REJILLA.y0 + Math.floor(i / REJILLA.col) * REJILLA.dy];
// paginas(): cuántas páginas tiene el álbum.
const paginas = (): number => Math.ceil(ENTRADAS_ALBUM.length / POR_PAGINA);
// frase(id): lo que dice Tito de esa sorpresa.
const frase = (id: string): string => FRASES_CASA[id] || FRASES_COMBINACION[id] || '';

// dibujaEntrada(id, x, y, vista): la casilla de la sorpresa id centrada en (x, y): descubierta, con el dibujo del objeto
// (o los dos de la combinación, con un «+»); escondida, gris con una interrogación.
function dibujaEntrada(id: string, x: number, y: number, vista: boolean): void {
  const R = REJILLA, combi = id.includes('+'), fondo = combi ? '#FFF3B0' : '#FFFFFF';
  card(x - R.w / 2, y - R.h / 2, R.w, R.h, vista ? fondo : '#E6E0D8', 5, 24);
  if (!vista) { text('?', x, y + 16, 64, '#B5AA9C'); return; }
  if (!combi) { pic(id, x, y, 110); return; }
  const [a, b] = id.split('+');
  pic(a, x - 34, y - 8, 74); pic(b, x + 34, y + 10, 74); text('+', x, y + 52, 36, '#3A281E');
}

// SORPRESAS DE LA CASA: estado: pag (la página que se ve).
SCENES.sorpresasCasa = { music: null,
  // enter(): primera página; Tito dice cuántas sorpresas lleva.
  enter() {
    this.pag = 0; const n = cuantasSorpresas(S.sorpresas || {});
    later(400, () => sayQ(n ? '¡Mi álbum de sorpresas! Ya has encontrado ' + n + ' de ' + TOTAL_SORPRESAS + '. Toca una para recordarla.' : '¡Mi álbum de sorpresas! Juega con las cosas de mi casa para llenarlo.'));
  },
  // prompt(): qué hacer.
  prompt() { say('Toca una sorpresa para recordarla. Las que tienen interrogación aún están escondidas.'); },
  // draw(): el fondo, el título con la cuenta, las casillas de la página, las flechas (si hay más páginas), Tito y la casa.
  draw() {
    ctx.fillStyle = '#FDF1DC'; ctx.fillRect(0, 0, 1600, 900);
    card(420, 40, 760, 100, '#FFFFFF', 5, 40); text('Sorpresas de la casa', 800, 104, 48, '#3A281E');
    star(1240, 90, 30, '#FFC93C', 4); text(cuantasSorpresas(S.sorpresas || {}) + ' / ' + TOTAL_SORPRESAS, 1330, 104, 36, '#3A281E');
    const sp = S.sorpresas || {}, desde = (this.pag as number) * POR_PAGINA;
    ENTRADAS_ALBUM.slice(desde, desde + POR_PAGINA).forEach((id, i) => { const [x, y] = casilla(i); dibujaEntrada(id, x, y, Object.hasOwn(sp, id)); });
    if (this.pag > 0) { const s = hv('alb-i', hC(FLECHAS.izq, FLECHAS.y, 50)); ctx.save(); ctx.translate(FLECHAS.izq, FLECHAS.y); ctx.scale(-s, s); circ(0, 0, 50, '#FFFFFF', 5); text('▶', 4, 14, 44, '#3A281E'); ctx.restore(); }
    if (this.pag < paginas() - 1) { const s = hv('alb-d', hC(FLECHAS.der, FLECHAS.y, 50)); ctx.save(); ctx.translate(FLECHAS.der, FLECHAS.y); ctx.scale(s, s); circ(0, 0, 50, '#FFFFFF', 5); text('▶', 4, 14, 44, '#3A281E'); ctx.restore(); }
    drawTito(20, 720, 170 + Math.sin(T * 2) * 4); drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; las flechas cambian de página; una casilla descubierta, Tito dice su
  // frase; una escondida, que aún está por encontrar.
  down(x: number, y: number) {
    if (atHome(x, y)) { SFX.tap(); go('casaTito', { volver: 1 }); return; }
    if (this.pag > 0 && dist(x, y, FLECHAS.izq, FLECHAS.y) < 60) { SFX.whoosh(); this.pag = (this.pag as number) - 1; return; }
    if (this.pag < paginas() - 1 && dist(x, y, FLECHAS.der, FLECHAS.y) < 60) { SFX.whoosh(); this.pag = (this.pag as number) + 1; return; }
    const desde = (this.pag as number) * POR_PAGINA, i = ENTRADAS_ALBUM.slice(desde, desde + POR_PAGINA).findIndex((_id, k) => { const [cx, cy] = casilla(k); return Math.abs(x - cx) < REJILLA.w / 2 && Math.abs(y - cy) < REJILLA.h / 2; });
    if (i < 0) return;
    const id = ENTRADAS_ALBUM[desde + i];
    if (!Object.hasOwn(S.sorpresas || {}, id)) { SFX.boing(); say('Esta sorpresa aún está escondida. ¡Juega en mi casa para encontrarla!'); return; }
    SFX.pop(); sparkles(...casilla(i), 6); say(frase(id));
  },
};
