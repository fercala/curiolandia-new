/*
 * escenas/albumExcursiones.ts: el álbum de excursiones (base B1 de docs/IDEAS-MEJORA.md, fase P7), la escena
 * SCENES.albumExcursiones. Se abre con el botón del álbum del autobús (ALBUM_EXC_BOTON, escenas/excursion.ts). Tiene un
 * marco de foto por excursión (EXCURSIONES): si ya se ha terminado alguna visita (S.exc, con la foto de grupo), sale la
 * foto de recuerdo con cuántas veces se ha ido y el día de la última, y debajo los dibujos de sus estaciones; si no, el
 * marco vacío con una interrogación. Al tocar un marco, Tito lo cuenta. La casa (arriba a la izquierda) vuelve al autobús.
 * Exporta: MARCOS_ALBUM (dónde está cada marco, para las pruebas) y pone SCENES.albumExcursiones.
 * Importa: el núcleo (dibujo, voz, sonido, toque, meses), las reglas y las fechas de dominio/excursiones.ts, los datos de
 * contenido/excursiones.ts y fondoGranja de escenas/excursion.ts.
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
} from '../nucleo/indice.ts';
import { type Excursion, diaYMes, vecesTexto, visitaDe } from '../dominio/excursiones.ts';
import { EXCURSIONES } from '../contenido/excursiones.ts';
import { fondoGranja } from './excursion.ts';

/** Un marco del álbum: de qué excursión es y dónde está (esquina de arriba a la izquierda, ancho y alto). */
interface MarcoAlbum {
  readonly e: Excursion;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
// MARCOS_ALBUM: un marco por excursión, en fila y centrados.
export const MARCOS_ALBUM: readonly MarcoAlbum[] = EXCURSIONES.map((e, i, todas) => {
  const w = 420,
    sep = 50,
    ancho = todas.length * w + (todas.length - 1) * sep;
  return { e, x: (W - ancho) / 2 + i * (w + sep), y: 190, w, h: 560 };
});
// FOTO: el hueco de la foto dentro del marco (separación por los lados y por arriba, y su alto).
const FOTO = { m: 24, alto: 300 };

// enMarco(m, x, y): ¿se ha tocado el marco m?
const enMarco = (m: MarcoAlbum, x: number, y: number): boolean => x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h;

// dibujaFotoRecuerdo(m): la foto de grupo de la excursión del marco m, en pequeño: el fondo de la granja, sus animales,
// el guía y Tito.
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
  fondoGranja();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, FOTO.alto);
  ctx.clip();
  const cx = fx + fw / 2;
  pic('vaca', cx - 120, fy + 200, 120);
  pic('cerdo', cx + 125, fy + 220, 90);
  pic('gallina', cx + 70, fy + 175, 70);
  pic(m.e.guia, cx + 15, fy + 160, 170);
  drawTito(cx - 140, fy + 140, 110);
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
  ctx.rotate((i - 1) * 0.03);
  ctx.scale(k, k);
  ctx.translate(-m.x - m.w / 2, -m.y - m.h / 2);
  card(m.x, m.y, m.w, m.h, hecha ? '#fff' : '#EEE8DE', 6, 14);
  if (hecha) dibujaFotoRecuerdo(m);
  else {
    card(m.x + FOTO.m, m.y + FOTO.m, m.w - FOTO.m * 2, FOTO.alto, '#D9D2C6', 0, 6);
    text('?', m.x + m.w / 2, m.y + FOTO.m + FOTO.alto / 2 + 40, 140, '#fff');
  }
  const cx = m.x + m.w / 2,
    y0 = m.y + FOTO.m + FOTO.alto;
  text(m.e.nombre, cx, y0 + 60, 32, hecha ? '#4A3B2A' : '#9A9086');
  if (hecha) text(`${vecesTexto(v.veces)} · ${diaYMes(v.d, MESES)}`, cx, y0 + 105, 26, '#7A6A5A');
  else text('Aún no hemos ido', cx, y0 + 105, 26, '#9A9086');
  const est = m.e.estaciones,
    paso = Math.min(62, (m.w - 40) / Math.max(1, est.length));
  est.forEach((s, j) => {
    const x = cx + (j - (est.length - 1) / 2) * paso;
    circ(x, y0 + 165, paso / 2 - 3, '#fff', 3);
    pic(s.icono, x, y0 + 165, paso * 0.8, hecha ? 1 : 0.3);
  });
  ctx.restore();
}

// deNombre(n): «de» delante del nombre de la excursión con su artículo, en minúscula: «del zoo», «de la granja escuela».
const deNombre = (n: string): string => (n.startsWith('El ') ? 'del ' + n.slice(3) : 'de ' + n.toLowerCase());

// recuerdo(e): lo que cuenta Tito al tocar el marco de la excursión e.
function recuerdo(e: Excursion): string {
  const v = visitaDe(S.exc, e.id);
  if (!v.veces) return `Aquí irá la foto ${deNombre(e.nombre)}, cuando vayamos de excursión.`;
  return `¡${e.nombre}! Hemos ido ${vecesTexto(v.veces)}; la última, el ${diaYMes(v.d, MESES)}. ¿Te acuerdas de ${e.nombreGuia}?`;
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
