/*
 * escenas/libroLetras.ts: «Mi libro de letras» (fase L7 de docs/PLAN-LECTURA.md), la escena SCENES.libroLetras. Se
 * abre desde el álbum (el botón del libro, arriba a la derecha) y es una página con las 20 letras de la isla: las que
 * el niño ya ha empezado salen en color, con su amigo y un punto por cada juego terminado de su casita; las aprendidas
 * llevan una estrella dorada; las demás, en sombra. Al tocar una letra, Tito la nombra con su amigo («La a de abeja»).
 * Lo que lleva el niño de cada letra lo calculan las reglas de dominio/letras.ts (datosLetra, estadoLetra) con su
 * casita (casitaDeLetra de temas/letras.ts).
 * Exporta: LIBRO (dónde están las casillas y el botón para volver al álbum) y pone SCENES.libroLetras al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito), LETRAS de contenido/letras.ts, dibujaLetra, casitaDeLetra y (fase L7b)
 * ambas de
 * temas/letras.ts, TEMA y tst de escenas/escenas2d.ts y las reglas de dominio/letras.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import { K } from '../dibujos/todos.ts';
import { LETRAS, type Letra } from '../contenido/letras.ts';
import {
  LF,
  S,
  SCENES,
  SFX,
  TITO,
  atHome,
  cap,
  card,
  circ,
  ctx,
  dist,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  later,
  pic,
  picG,
  say,
  sayQ,
  sky,
  sparkles,
  star,
  text,
} from '../nucleo/indice.ts';
import { ambas, casitaDeLetra, dibujaLetra } from '../temas/letras.ts';
import { TEMA, tst } from './escenas2d.ts';
import { datosLetra, estadoLetra, type DatosLetra } from '../dominio/letras.ts';

// LIBRO: la cuadrícula de letras (5 columnas de 240 de ancho y 4 filas de 150 de alto, desde la casilla de arriba a la
// izquierda en x0, y0) y el botón para volver al álbum (arriba a la derecha).
export const LIBRO = { x0: 410, y0: 250, dx: 240, dy: 150, cols: 5, album: { x: 1440, y: 110, r: 60 } };

// pos(i): el centro [x, y] de la casilla de la letra número i.
const pos = (i: number): [number, number] => [
  LIBRO.x0 + (i % LIBRO.cols) * LIBRO.dx,
  LIBRO.y0 + Math.floor(i / LIBRO.cols) * LIBRO.dy,
];

// datos(L): lo que lleva el niño de la letra L, mirando su casita (juegos terminados y aciertos de S.gs).
function datos(L: Letra): DatosLetra {
  const id = casitaDeLetra(L);
  return datosLetra(id, TEMA[id]?.games.length ?? 0, tst(id).g, S.gs ?? {});
}

// drawBotonAlbum(x, y, s): el botón para volver al álbum: un libro morado con una estrella, como el del mapa.
function drawBotonAlbum(x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  circ(0, 0, 56, '#fff', 6);
  card(-38, -32, 76, 64, '#9B8AD9', 5, 10);
  card(-29, -24, 58, 48, '#FFF6E6', 3, 7);
  star(0, 0, 16, '#FFC93C', 3);
  ctx.restore();
}

// drawCasilla(L, i): la casilla de la letra L: en color con su amigo y los puntos de los juegos hechos si ya la ha
// empezado (con estrella si está aprendida); si no, la letra y su amigo en sombra. Con las minúsculas (ambas(), fase
// L7b), la mayúscula y la minúscula.
function drawCasilla(L: Letra, i: number): void {
  const [x, y] = pos(i),
    d = datos(L),
    e = estadoLetra(d),
    s = hv('l' + i, hC(x, y, 100));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (e === 'sinEmpezar') {
    card(-105, -62, 210, 124, '#F1E9DC', 4, 24, '#E4D3B8');
    text(ambas() ? L.l + L.l.toLowerCase() : L.l, -52, -6 + (ambas() ? 76 : 92) * 0.36, ambas() ? 76 : 92, '#D9CDB8', {
      f: LF,
      w: 100,
    });
    ctx.globalAlpha = 0.22;
    picG(L.amigo, 52, -6, 84);
    ctx.globalAlpha = 1;
  } else {
    card(-105, -62, 210, 124, '#fff', 5, 24);
    if (ambas()) text(L.l + L.l.toLowerCase(), -52, -6 + 76 * 0.36, 76, L.c, { f: LF, st: 5, sc: '#fff', w: 100 });
    else dibujaLetra(L, -50, -6, 92);
    pic(L.amigo, 52, -8, 84);
    const w = 16,
      x0 = -((d.total - 1) * w) / 2;
    for (let j = 0; j < d.total; j++) circ(x0 + j * w, 46, 5, j < d.hechos ? L.c : '#E4D3B8', 0);
    if (e === 'aprendida') star(92, -52, 22, '#FFC93C', 3);
  }
  ctx.restore();
}

// LIBRO DE LETRAS: las 20 letras de la isla en una página del álbum.
SCENES.libroLetras = {
  music: 'book',
  // enter(): Tito dice cuántas letras conoce ya el niño (las que tienen algún juego terminado).
  enter() {
    const n = LETRAS.filter((L) => estadoLetra(datos(L)) !== 'sinEmpezar').length;
    later(300, () =>
      sayQ(
        n
          ? `Este es tu libro de letras. Ya conoces ${n} ${n === 1 ? 'letra' : 'letras'}.`
          : 'Este es tu libro de letras. ¡Las letras te esperan en la Isla de las Letras!',
      ),
    );
  },
  // draw(): el título, las casillas de las letras, el botón del álbum, la casa y Tito.
  draw() {
    sky('#EDE7FF', '#FFF6E6');
    card(240, 40, 1300, 800, '#FFFBF2', 8, 40);
    text('Mi libro de letras', 890, 110, 52, K, { w: 600 });
    LETRAS.forEach(drawCasilla);
    drawBotonAlbum(LIBRO.album.x, LIBRO.album.y, hv('album', hC(LIBRO.album.x, LIBRO.album.y, LIBRO.album.r)));
    drawHome();
    drawTito(TITO.x, TITO.y, TITO.w);
  },
  // down(x, y): la casa lleva al mapa y el botón, al álbum; tocar una letra empezada la nombra con su amigo («La a de
  // abeja»); una sin empezar, Tito dice que aún no la conoce.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('map');
      return;
    }
    if (dist(x, y, LIBRO.album.x, LIBRO.album.y) < LIBRO.album.r) {
      SFX.whoosh();
      go('album');
      return;
    }
    LETRAS.forEach((L, i) => {
      const [px, py] = pos(i);
      if (Math.abs(x - px) > 105 || Math.abs(y - py) > 62) return;
      if (estadoLetra(datos(L)) === 'sinEmpezar') {
        SFX.tap();
        say('Esta letra todavía no la conoces. ¡La aprenderás en la Isla de las Letras!');
        return;
      }
      SFX.pop();
      sparkles(px, py, 6);
      say(`${cap(L.nombre)} de ${L.amigoDice}.`);
    });
  },
};
