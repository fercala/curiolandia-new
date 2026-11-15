/*
 * escenas/fotos.ts: la cámara de fotos de Tito y el álbum de fotos (idea 20 de docs/IDEAS-MEJORA.md, fase P15). En el
 * mapa 3D, las zonas 3D y la granja escuela hay un botón con una cámara (CAMARA_BOTON, debajo de las monedas): al
 * tocarlo, la cámara se enciende (se ve el visor con sus esquinas) y un toque a un animal o a una cosa le hace una foto
 * (hacerFotoDe: el destello, el clic, la foto que sale un momento y Tito que dice qué es); en la granja, a los animales
 * que pasean. Mientras la cámara está encendida, los toques no llevan a ningún sitio (no se sale sin querer); otro
 * toque al botón la guarda, y al cambiar de escena se apaga sola. Lo que se puede fotografiar y lo que da está en
 * dominio/fotos.ts; mundo3d/camara3d.ts busca qué hay bajo el dedo en 3D. Las fotos van al álbum, la escena
 * SCENES.albumFotos: una página por grupo (PAGINAS_FOTOS), con dos filas de cuatro fotos; las hechas, con su dibujo, su
 * nombre y una bandera que dice la palabra en inglés; las que faltan, en gris con una interrogación. Se abre con su
 * botón de la casa de Tito (ALBUM_FOTOS_BOTON, debajo de la vitrina) y la casa vuelve a la casa de Tito. Sin WebGL el
 * mapa es 2D y no tiene cámara, pero la granja y el álbum, sí.
 * Exporta: CAMARA_BOTON, ALBUM_FOTOS_BOTON, CAMARA (el estado, para las pruebas), CASILLAS_FOTOS, registroDeFotos,
 * camaraActiva, tocarBotonCamara, hacerFotoDe, disparoVacio, dibujaCamara, dibujaBotonAlbumFotos y pone
 * SCENES.albumFotos.
 * Importa: el núcleo (dibujo, voz, sonido, toque, monedas, guardado, traducción) y las reglas de dominio/fotos.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, tiempos y sonidos en la pantalla de 1600x900,
   como en el resto de las escenas. */
import {
  S,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  drawHome,
  drawTito,
  fmt,
  giveCoins,
  go,
  hC,
  hv,
  later,
  noise,
  pic,
  save,
  say,
  sayQ,
  sceneName,
  sparkles,
  star,
  text,
  tr,
} from '../nucleo/indice.ts';
import {
  FOTOS,
  PAGINAS_FOTOS,
  cuantasFotos,
  foto,
  fotosDePagina,
  hacerFoto,
  registroFotos,
  type Foto,
  type RegistroFotos,
} from '../dominio/fotos.ts';

// CAMARA_BOTON: el botón de la cámara en el mapa, las zonas y la granja (a la derecha, debajo de las monedas).
export const CAMARA_BOTON = { x: 1490, y: 200, r: 50 };
// ALBUM_FOTOS_BOTON: el botón del álbum de fotos en la casa de Tito (a la izquierda, debajo del de la vitrina).
export const ALBUM_FOTOS_BOTON = { x: 80, y: 440, r: 52 };
// CAMARA: el estado de la cámara: si está encendida y en qué escena, cuándo fue el último destello, la última foto
// (y cuándo) y si ya se ha dicho que allí no había nada (una vez cada vez que se enciende).
export const CAMARA = { activa: false, escena: '', flash: -9, foto: '', fotoT: -9, avisada: false };
// MEDIDAS: lo que duran el destello y la foto que sale en la pantalla.
const MEDIDAS = { flash: 0.35, foto: 2.4 };
// VISOR: dónde van las esquinas del visor (sin tapar la casa, las monedas, el botón de la cámara ni el de seguir).
const VISOR = { x0: 190, y0: 150, x1: 1410, y1: 840 };
// ALBUM: las fotos de la página del álbum (dos filas de cuatro: dónde empieza, el paso y el tamaño de cada una) y las
// flechas para pasar de página.
const ALBUM = { x0: 425, y0: 330, dx: 250, dy: 300, w: 210, h: 250, col: 4 };
const FLECHAS = { izq: 140, der: 1460, y: 480, r: 50 };
// CASILLAS_FOTOS(pagina): el centro de cada foto de esa página (y dónde está su bandera del inglés), en el orden de
// FOTOS (para dibujar, tocar y las pruebas).
export const CASILLAS_FOTOS = (pagina: string): { id: string; x: number; y: number; bx: number; by: number }[] =>
  fotosDePagina(pagina).map((f, i) => {
    const x = ALBUM.x0 + (i % ALBUM.col) * ALBUM.dx,
      y = ALBUM.y0 + Math.floor(i / ALBUM.col) * ALBUM.dy;
    return { id: f.id, x, y, bx: x + ALBUM.w / 2 - 22, by: y - ALBUM.h / 2 + 22 };
  });

// registroDeFotos(): lo guardado de las fotos (S.fotos), leído con registroFotos (vacío si falta o está roto).
export const registroDeFotos = (): RegistroFotos => registroFotos(S.fotos);
// camaraActiva(): si la cámara está encendida en la escena de ahora (al cambiar de escena se apaga sola).
export const camaraActiva = (): boolean => CAMARA.activa && CAMARA.escena === sceneName;

// clic(): el sonido de la cámara al hacer una foto (un clic y el obturador).
function clic(): void {
  noise(0.04, 0.45, 3200);
  noise(0.07, 0.3, 1400, 0.07);
}

// tocarBotonCamara(x, y): si (x, y) es el botón de la cámara, la enciende o la guarda (y Tito lo dice) y devuelve true.
export function tocarBotonCamara(x: number, y: number): boolean {
  if (dist(x, y, CAMARA_BOTON.x, CAMARA_BOTON.y) > CAMARA_BOTON.r + 8) return false;
  if (camaraActiva()) {
    CAMARA.activa = false;
    SFX.tap();
    say('Guardo la cámara.');
    return true;
  }
  Object.assign(CAMARA, { activa: true, escena: sceneName, avisada: false });
  SFX.pop();
  say('¡La cámara! Toca un animal o una cosa para hacerle una foto.');
  return true;
}

// hacerFotoDe(id, x, y): se hace la foto id tocada en (x, y): se apunta en S.fotos (hacerFoto), se abonan las monedas y
// se guarda; luego el destello, el clic, la foto en la pantalla y Tito dice qué es (si es nueva, con chispas y monedas;
// si con ella se completa una página, lo celebra).
export function hacerFotoDe(id: string, x: number, y: number): void {
  const f = foto(id);
  if (!f) return;
  const r = hacerFoto(registroDeFotos(), id);
  S.fotos = { vistas: { ...r.registro.vistas } };
  if (r.monedas) creditCoins(r.monedas);
  save();
  clic();
  Object.assign(CAMARA, { flash: T, foto: id, fotoT: T });
  const nombre = tr(f.nombre);
  if (!r.nueva) {
    say(fmt('{nombre}. Esta foto ya la tenías.', { nombre }));
    return;
  }
  later(300, () => SFX.tada());
  sparkles(x, y, 20);
  if (r.pagina) burst(x, y, 50);
  later(900, () => giveCoins(r.monedas, x, y, undefined, true));
  say(fmt('¡Foto nueva! {nombre}.', { nombre }));
  if (r.pagina) sayQ('¡Has completado una página del álbum de fotos!');
}

// disparoVacio(x, y): con la cámara encendida, un toque donde no hay nada que fotografiar: suena el clic con un destello
// flojito y, la primera vez, Tito dice que busque un animal o una cosa.
export function disparoVacio(x: number, y: number): void {
  clic();
  CAMARA.flash = T - MEDIDAS.flash / 2;
  sparkles(x, y, 4);
  if (CAMARA.avisada) return;
  CAMARA.avisada = true;
  say('Ahí no hay nada para la foto. Busca un animal o una cosa.');
}

// dibujaIconoCamara(x, y, s): una cámara de fotos centrada en (x, y), de ancho s: el cuerpo, el visor, el objetivo y el
// botón de disparar.
function dibujaIconoCamara(x: number, y: number, s: number): void {
  const k = s / 100;
  card(x - 22 * k, y - 38 * k, 34 * k, 16 * k, '#5B6A7A', 4 * k, 5 * k);
  card(x - 50 * k, y - 26 * k, 100 * k, 64 * k, '#7C8C9C', 5 * k, 14 * k);
  circ(x + 30 * k, y - 32 * k, 7 * k, '#E2574C', 3 * k);
  circ(x, y + 6 * k, 24 * k, '#2E3A46', 5 * k);
  circ(x, y + 6 * k, 12 * k, '#7FD3E8', 3 * k);
  circ(x - 5 * k, y + 1 * k, 4 * k, '#FFFFFF', 0);
}

// dibujaVisor(): con la cámara encendida, el visor: un borde oscuro flojito y las cuatro esquinas blancas.
function dibujaVisor(): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 60;
  ctx.strokeRect(0, 0, 1600, 900);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  const l = 70;
  [
    [VISOR.x0, VISOR.y0, 1, 1],
    [VISOR.x1, VISOR.y0, -1, 1],
    [VISOR.x0, VISOR.y1, 1, -1],
    [VISOR.x1, VISOR.y1, -1, -1],
  ].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x!, y! + sy! * l);
    ctx.lineTo(x!, y!);
    ctx.lineTo(x! + sx! * l, y!);
    ctx.stroke();
  });
  ctx.restore();
  circ(800, 860, 12 + Math.sin(T * 5) * 2, '#E2574C', 0);
}

// dibujaFotoHecha(): la última foto, un momento, en la pantalla: un marco blanco con el dibujo y su nombre, que entra
// girando un poco y se va apagando.
function dibujaFotoHecha(): void {
  const t = T - CAMARA.fotoT,
    f = foto(CAMARA.foto);
  if (!f || t > MEDIDAS.foto) return;
  const a = Math.min(1, (MEDIDAS.foto - t) / 0.5),
    s = Math.min(1, t / 0.25);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(1250, 560);
  ctx.rotate(0.08 * s);
  ctx.scale(s, s);
  card(-120, -140, 240, 290, '#FFFFFF', 5, 12);
  card(-100, -120, 200, 200, '#EAF7FB', 0, 6);
  pic(f.id, 0, -20, 170);
  text(f.nombre, 0, 122, 28, '#3A281E', { max: 220 });
  ctx.restore();
}

// dibujaCamara(): el botón de la cámara (crece bajo el ratón, id 'camara'; con un aro rojo si está encendida) y, si lo
// está, el visor; además, el destello de la última foto y la foto que sale un momento.
export function dibujaCamara(): void {
  const B = CAMARA_BOTON,
    on = camaraActiva(),
    s = hv('camara', hC(B.x, B.y, B.r));
  if (on) dibujaVisor();
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  circ(0, 0, B.r + (on ? 6 : 0), on ? '#E2574C' : '#FFFFFF', 5);
  if (on) circ(0, 0, B.r - 4, '#FFFFFF', 0);
  dibujaIconoCamara(0, 0, B.r * 1.5);
  ctx.restore();
  if (CAMARA.escena === sceneName) dibujaFotoHecha();
  const fl = T - CAMARA.flash;
  if (fl >= 0 && fl < MEDIDAS.flash) {
    ctx.save();
    ctx.globalAlpha = 0.85 * (1 - fl / MEDIDAS.flash);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1600, 900);
    ctx.restore();
  }
}

// dibujaBotonAlbumFotos(): el botón del álbum de fotos en la casa de Tito: una cámara en un círculo, con cuántas fotos
// distintas hay ya (crece un poco bajo el ratón, id 'albumFotos').
export function dibujaBotonAlbumFotos(): void {
  const B = ALBUM_FOTOS_BOTON,
    s = hv('albumFotos', hC(B.x, B.y, B.r));
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  circ(0, 0, B.r, '#fff', 5);
  dibujaIconoCamara(0, 4, B.r * 1.15);
  circ(B.r * 0.7, -B.r * 0.7, 24, '#FFC93C', 4);
  text(cuantasFotos(registroDeFotos()), B.r * 0.7, -B.r * 0.7 + 9, 24);
  ctx.restore();
}

// dibujaFotoAlbum(c, f, n): una foto del álbum: hecha (n veces), en su marco blanco con el dibujo, el nombre y la
// bandera del inglés; si aún no, el marco gris con una interrogación.
function dibujaFotoAlbum(c: { x: number; y: number; bx: number; by: number }, f: Foto, n: number): void {
  const A = ALBUM;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(((c.x * 7 + c.y) % 5) * 0.012 - 0.024);
  card(-A.w / 2, -A.h / 2, A.w, A.h, n ? '#FFFFFF' : '#E6E0D8', 5, 10);
  if (!n) {
    text('?', 0, 22, 80, '#B5AA9C');
    ctx.restore();
    return;
  }
  card(-A.w / 2 + 14, -A.h / 2 + 14, A.w - 28, A.w - 40, '#EAF7FB', 0, 6);
  pic(f.id, 0, -A.h / 2 + 14 + (A.w - 40) / 2, 150);
  text(f.nombre, 0, A.h / 2 - 22, 24, '#3A281E', { max: A.w - 20 });
  ctx.restore();
  circ(c.bx, c.by, 22, '#2E5AAC', 4);
  text('EN', c.bx, c.by + 8, 20, '#FFFFFF');
}

// pagina(pag): el id de la página del álbum número pag.
const pagina = (pag: unknown): string => PAGINAS_FOTOS[(pag as number) || 0]?.id ?? 'campo';

// ÁLBUM DE FOTOS: estado: pag (la página que se ve).
SCENES.albumFotos = {
  music: null,
  // enter(): primera página; Tito dice cuántas fotos lleva, o que el álbum aún está vacío.
  enter() {
    this.pag = 0;
    const n = cuantasFotos(registroDeFotos());
    later(400, () =>
      sayQ(
        n
          ? fmt('¡Mi álbum de fotos! Ya tengo {n} de {total}. Toca una foto para oír su nombre.', {
              n,
              total: FOTOS.length,
            })
          : '¡Mi álbum de fotos! Está vacío. Saca la cámara en el mapa para hacer fotos.',
      ),
    );
  },
  // prompt(): qué hacer.
  prompt() {
    say('Toca una foto para oír su nombre. La bandera dice cómo se llama en inglés.');
  },
  // draw(): el fondo, el título de la página con su cuenta, las fotos, las flechas, los puntos de las páginas, Tito y la
  // casa.
  draw() {
    const pg = PAGINAS_FOTOS[this.pag as number]!,
      reg = registroDeFotos();
    ctx.fillStyle = '#FDF1DC';
    ctx.fillRect(0, 0, 1600, 900);
    card(330, 30, 940, 100, '#FFFFFF', 5, 40);
    text(pg.titulo, 760, 96, 44, '#3A281E', { max: 700 });
    star(1150, 80, 26, '#FFC93C', 4);
    text(cuantasFotos(reg, pg.id) + ' / ' + fotosDePagina(pg.id).length, 1215, 94, 30, '#3A281E');
    CASILLAS_FOTOS(pg.id).forEach((c) => dibujaFotoAlbum(c, foto(c.id)!, reg.vistas[c.id] ?? 0));
    const flecha = (x: number, dir: number, id: string) => {
      const s = hv(id, hC(x, FLECHAS.y, FLECHAS.r));
      ctx.save();
      ctx.translate(x, FLECHAS.y);
      ctx.scale(dir * s, s);
      circ(0, 0, FLECHAS.r, '#FFFFFF', 5);
      text('▶', 4, 14, 44, '#3A281E');
      ctx.restore();
    };
    if (this.pag > 0) flecha(FLECHAS.izq, -1, 'fot-i');
    if (this.pag < PAGINAS_FOTOS.length - 1) flecha(FLECHAS.der, 1, 'fot-d');
    PAGINAS_FOTOS.forEach((_p, i) => circ(740 + i * 40, 860, 10, i === this.pag ? '#3A281E' : '#D8CBB8', 0));
    drawTito(20, 720, 170 + Math.sin(T * 2) * 4);
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; las flechas cambian de página; la bandera de una foto hecha dice la
  // palabra en inglés; la foto, su nombre y cuántas veces se ha hecho; una que falta, que aún está por hacer.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    if (this.pag > 0 && dist(x, y, FLECHAS.izq, FLECHAS.y) < FLECHAS.r + 10) {
      SFX.whoosh();
      this.pag = (this.pag as number) - 1;
      return;
    }
    if (this.pag < PAGINAS_FOTOS.length - 1 && dist(x, y, FLECHAS.der, FLECHAS.y) < FLECHAS.r + 10) {
      SFX.whoosh();
      this.pag = (this.pag as number) + 1;
      return;
    }
    const reg = registroDeFotos(),
      casillas = CASILLAS_FOTOS(pagina(this.pag)),
      b = casillas.find((c) => reg.vistas[c.id] && dist(x, y, c.bx, c.by) < 30);
    if (b) {
      SFX.pop();
      say(foto(b.id)!.en, null, { en: true });
      return;
    }
    const c = casillas.find((q) => Math.abs(x - q.x) < ALBUM.w / 2 && Math.abs(y - q.y) < ALBUM.h / 2);
    if (!c) return;
    const n = reg.vistas[c.id] ?? 0;
    if (!n) {
      SFX.boing();
      say('Esta foto aún no la has hecho. ¡Busca con la cámara!');
      return;
    }
    SFX.pop();
    sparkles(c.x, c.y, 8);
    const nombre = tr(foto(c.id)!.nombre);
    say(
      n === 1
        ? fmt('{nombre}. Esta foto la has hecho una vez.', { nombre })
        : fmt('{nombre}. Esta foto la has hecho {n} veces.', { nombre, n }),
    );
  },
};
