/*
 * escenas/albumExcursiones.ts: el álbum de excursiones (base B1 de docs/IDEAS-MEJORA.md, fase P7), la escena
 * SCENES.albumExcursiones. Se abre con el botón del álbum del autobús (ALBUM_EXC_BOTON, escenas/excursion.ts). Tiene un
 * marco de foto por excursión (EXCURSIONES): si ya se ha terminado alguna visita (S.exc, con la foto de grupo), sale la
 * foto de recuerdo con cuántas veces se ha ido y el día de la última, y debajo los dibujos de sus estaciones; si no, el
 * marco vacío con una interrogación. Al tocar un marco, Tito lo cuenta. La casa (arriba a la izquierda) vuelve al autobús.
 * Exporta: MARCOS_ALBUM (dónde está cada marco, para las pruebas) y pone SCENES.albumExcursiones.
 * Importa: el núcleo (dibujo, voz, sonido, toque, meses), las reglas y las fechas de dominio/excursiones.ts, los datos de
 * contenido/excursiones.ts y, de escenas/excursion.ts, fondoDe y GRUPO_FOTO (desde la P17).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  MESES,
  S,
  SCENES,
  SFX,
  T,
  W,
  atHome,
  card,
  circ,
  ctx,
  drawCoinHUD,
  drawHome,
  drawTito,
  go,
  hR,
  hv,
  later,
  pic,
  say,
  sparkles,
  text,
  fmt,
  juntar,
  tr,
} from '../nucleo/indice.ts';
import { type Excursion, diaYMes, vecesTexto, visitaDe } from '../dominio/excursiones.ts';
import { EXCURSIONES } from '../contenido/excursiones.ts';
import { GRUPO_FOTO, fondoDe, nombreExcursion } from './excursion.ts';

/** Un marco del álbum: de qué excursión es y dónde está (esquina de arriba a la izquierda, ancho y alto). */
interface MarcoAlbum {
  readonly e: Excursion;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
// DOS_FILAS: con más de ocho excursiones (desde la P24), los marcos van en dos filas y son más bajos.
const DOS_FILAS = EXCURSIONES.length > 8;
// MARCOS_ALBUM: un marco por excursión, en fila y centrados.
export const MARCOS_ALBUM: readonly MarcoAlbum[] = EXCURSIONES.map((e, i, todas) => {
  // desde la P18 caben cuatro: los marcos se estrechan para que quepan todos con 40 de margen (desde la P22, con más de
  // seis, se separan menos, y desde la P23 dejan 70 de margen, para que el marco torcido de las puntas no se salga);
  // desde la P24, con más de ocho, en dos filas (arriba, la mitad y una más), con 120 de margen para no tapar a Tito
  const muchos = todas.length > 6,
    porFila = DOS_FILAS ? Math.ceil(todas.length / 2) : todas.length,
    fila = Math.floor(i / porFila),
    enFila = fila === 0 ? porFila : todas.length - porFila,
    sep = muchos ? 26 : 50,
    margen = DOS_FILAS ? 240 : muchos ? 140 : 80,
    w = Math.min(420, (W - margen - (porFila - 1) * sep) / porFila),
    ancho = enFila * w + (enFila - 1) * sep;
  return {
    e,
    x: (W - ancho) / 2 + (i - fila * porFila) * (w + sep),
    y: DOS_FILAS ? 165 + fila * 360 : 190,
    w,
    h: DOS_FILAS ? 335 : 560,
  };
});
// FOTO: el hueco de la foto dentro del marco (separación por los lados y por arriba, y su alto; desde la P24, con dos
// filas, más bajo).
const FOTO = { m: DOS_FILAS ? 18 : 24, alto: DOS_FILAS ? 170 : 300 };
// ESCALA_FOTO: lo que se encoge lo de dentro de la foto de recuerdo (los animales, el guía y Tito) con el hueco más bajo.
const ESCALA_FOTO = FOTO.alto / 300;

// enMarco(m, x, y): ¿se ha tocado el marco m?
const enMarco = (m: MarcoAlbum, x: number, y: number): boolean => x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h;

// dibujaFotoRecuerdo(m): la foto de grupo de la excursión del marco m, en pequeño: su fondo (fondoDe), sus animales
// (GRUPO_FOTO; desde la P17, también los del zoo), el guía y Tito.
function dibujaFotoRecuerdo(m: MarcoAlbum): void {
  const fx = m.x + FOTO.m,
    fy = m.y + FOTO.m,
    fw = m.w - FOTO.m * 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, FOTO.alto);
  ctx.clip();
  ctx.translate(fx, fy);
  ctx.scale(fw / W, fw / W);
  ctx.translate(0, -150);
  fondoDe(m.e);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, FOTO.alto);
  ctx.clip();
  const cx = fx + fw / 2,
    e = ESCALA_FOTO;
  (GRUPO_FOTO[m.e.id] ?? GRUPO_FOTO['granja']!).forEach(([k, x, y, t]) =>
    pic(k, cx + x * 0.55 * e, fy + (165 + y * 0.55) * e, t * 0.55 * e),
  );
  pic(m.e.guia, cx + 15 * e, fy + 160 * e, 170 * e);
  drawTito(cx - 140 * e, fy + 140 * e, 110 * e);
  ctx.restore();
}

// dibujaMarco(m, i): el marco m (el i-ésimo), un poco torcido: con la foto, el nombre, cuántas veces y cuándo, y las estaciones; o, si
// aún no se ha ido, vacío con una interrogación.
function dibujaMarco(m: MarcoAlbum, i: number): void {
  const v = visitaDe(S.exc, m.e.id),
    hecha = v.veces > 0,
    k = hv('alb:' + m.e.id, hR(m.x, m.y, m.w, m.h));
  ctx.save();
  ctx.translate(m.x + m.w / 2, m.y + m.h / 2);
  // torcido un poco a un lado o al otro (desde la P24, según su sitio en la fila, para que los de la punta no se
  // tuerzan cada vez más)
  ctx.rotate(((i % 3) - 1) * 0.03);
  ctx.scale(k, k);
  ctx.translate(-m.x - m.w / 2, -m.y - m.h / 2);
  card(m.x, m.y, m.w, m.h, hecha ? '#fff' : '#EEE8DE', 6, 14);
  if (hecha) dibujaFotoRecuerdo(m);
  else {
    card(m.x + FOTO.m, m.y + FOTO.m, m.w - FOTO.m * 2, FOTO.alto, '#D9D2C6', 0, 6);
    text('?', m.x + m.w / 2, m.y + FOTO.m + FOTO.alto / 2 + 40, 140, '#fff');
  }
  const cx = m.x + m.w / 2,
    y0 = m.y + FOTO.m + FOTO.alto,
    // desde la P24, en los marcos bajos de dos filas, las líneas van más juntas
    dy = DOS_FILAS ? [38, 70, 112] : [60, 105, 165],
    peq = m.w < 200 || DOS_FILAS;
  // los textos se encogen si no caben en el marco (desde la P19, con cinco marcos y nombres largos)
  text(m.e.nombre, cx, y0 + dy[0]!, peq ? 26 : 32, hecha ? '#4A3B2A' : '#9A9086', { max: m.w - 30 });
  // las veces y la fecha, cada una en el idioma del juego (juntar: no se vuelven a traducir)
  if (hecha)
    text(juntar(vecesTexto(v.veces, tr), '·', fechaDe(v.d)), cx, y0 + dy[1]!, peq ? 20 : 26, '#7A6A5A', {
      max: m.w - 30,
    });
  else text('Aún no hemos ido', cx, y0 + dy[1]!, peq ? 20 : 26, '#9A9086', { max: m.w - 30 });
  const est = m.e.estaciones,
    paso = Math.min(DOS_FILAS ? 46 : 62, (m.w - 40) / Math.max(1, est.length));
  est.forEach((s, j) => {
    const x = cx + (j - (est.length - 1) / 2) * paso;
    circ(x, y0 + dy[2]!, paso / 2 - 3, '#fff', 3);
    pic(s.icono, x, y0 + dy[2]!, paso * 0.8, hecha ? 1 : 0.3);
  });
  ctx.restore();
}

// fechaDe(d): la fecha d de una visita («9 de noviembre») en el idioma del juego: la plantilla y el mes traducidos.
const fechaDe = (d: string): string =>
  diaYMes(
    d,
    MESES.map((m) => tr(m)),
    tr,
  );

// recuerdo(e): lo que cuenta Tito al tocar el marco de la excursión e, en el idioma del juego (desde la fase ID2f de
// docs/PLAN-IDIOMAS.md: plantillas de fmt; el nombre de la excursión, de nombreExcursion; los meses, traducidos).
function recuerdo(e: Excursion): string {
  const v = visitaDe(S.exc, e.id),
    excursion = nombreExcursion(e);
  if (!v.veces) return fmt('Aquí irá la foto {excursion}, cuando vayamos de excursión.', { excursion: excursion.de });
  const huecos = {
    excursion: excursion.art,
    n: v.veces,
    fecha: fechaDe(v.d),
    guia: e.nombreGuia,
  };
  return fmt(
    v.veces === 1
      ? '¡{Excursion}! Hemos ido una vez; la última, el {fecha}. ¿Te acuerdas de {guia}?'
      : '¡{Excursion}! Hemos ido {n} veces; la última, el {fecha}. ¿Te acuerdas de {guia}?',
    huecos,
  );
}

SCENES['albumExcursiones'] = {
  music: 'map',
  // enter(): Tito presenta el álbum.
  enter() {
    later(400, () => say('Este es el álbum de excursiones. Aquí se guardan las fotos de grupo. Toca una foto.'));
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca una foto del álbum.');
  },
  // hint(): sin mano de ayuda (es para mirar).
  hint() {
    return null;
  },
  // dwell(id): dice el nombre de la excursión del marco bajo el ratón.
  dwell(id: string) {
    const m = MARCOS_ALBUM.find((z) => 'alb:' + z.e.id === id);
    if (m) say(m.e.nombre + '.');
  },
  // draw(): el fondo de papel, el título, los marcos y Tito.
  draw() {
    ctx.fillStyle = '#F6EBD9';
    ctx.fillRect(0, 0, W, 900);
    ctx.fillStyle = 'rgba(180,150,110,0.15)';
    Array.from({ length: 12 }, (_, i) => i).forEach((i) => ctx.fillRect(0, 60 + i * 75, W, 3));
    text('Mis excursiones', W / 2, 120, 64, '#8C3B2E');
    MARCOS_ALBUM.forEach((m, i) => dibujaMarco(m, i));
    drawTito(30, 760, 150 + Math.sin(T * 2) * 3);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el autobús; un marco -> Tito lo cuenta; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('autobus');
      return;
    }
    const m = MARCOS_ALBUM.find((z) => enMarco(z, x, y));
    if (m) {
      SFX.pop();
      say(recuerdo(m.e));
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
