/*
 * escenas/arte.ts: el estudio de arte de las clases del cole (idea 31 de docs/IDEAS-MEJORA.md, en la PR de todas las
 * ideas pendientes, v0.2.180). SCENES.estudioArte es su menú (desde el rincón del arte de escenas/clases.ts) con dos
 * juegos:
 * - arteSimetria: la pintura simétrica: se elige un color y se pintan casillas (tocando o arrastrando); la otra mitad
 *   sale igual, como en un espejo. «Colgar en la casa» lo guarda (S.arte.cuadro) y se ve en la pared del salón de la
 *   casa de Tito (dibujaCuadroCasa).
 * - arteCancion: se compone una canción de ocho notas tocando las láminas del xilófono; «Escuchar» la toca y «Guardar»
 *   la guarda (S.arte.cancion): suena al tocar el cuadro del salón (tocaCuadroCasa).
 * Cada juego terminado da 2 monedas y se apunta en el diario (menuRincon.ts). Las reglas, en dominio/arte.ts.
 * Exporta: dibujaCuadroCasa y tocaCuadroCasa (los usa la casa, escenas/casa.ts) y, para las pruebas, ARTE (el estado),
 * casillaArte, COLOR_EN, BOTONES_ARTE, laminaEn y BOTONES_CANCION; pone las escenas al cargarse.
 * Importa: el núcleo, playTune y NOTE (juegos/), las reglas de dominio/arte.ts, botonExtra y tocaExtra y lo común de
 * escenas/menuRincon.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import {
  S,
  SCENES,
  SFX,
  T,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  later,
  pic,
  save,
  say,
  sky,
  tone,
} from '../nucleo/indice.ts';
import { NOTE, playTune } from '../juegos/indice.ts';
import {
  COLORES_ARTE,
  CUADRO_VACIO,
  HUECOS,
  LADO,
  NOTAS,
  cancionDe,
  cuadroDe,
  cuadroPintado,
  melodia,
  pintar,
  ponerNota,
} from '../dominio/arte.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';
import { comunesRincon, hacerMenu, terminarRincon, tituloRincon } from './menuRincon.ts';

/** El estado del estudio: el cuadro que se pinta, el color elegido, si se está arrastrando, la canción y la nota que
 * suena al escuchar. */
export const ARTE = {
  cuadro: CUADRO_VACIO,
  color: 1,
  pintando: false,
  cancion: [] as number[],
  suena: -1,
  hecho: false,
};

hacerMenu({
  escena: 'estudioArte',
  titulo: 'El estudio de arte',
  consigna: '¡El estudio de arte! ¿Pintamos o hacemos música?',
  volver: 'clases',
  cielo: ['#FFF0F5', '#FFF6DE'],
  juegos: [
    { escena: 'arteSimetria', titulo: 'Pintura de espejo', dibujo: 'pinturas' },
    { escena: 'arteCancion', titulo: 'Compón una canción', dibujo: 'xilofono' },
  ],
});

// ── La pintura simétrica ──
// CUADRICULA: dónde está la cuadrícula y lo que mide cada casilla.
const CUADRICULA = { x: 330, y: 160, c: 80 };
// casillaArte(f, c): el centro de la casilla (f, c).
export const casillaArte = (f: number, c: number): { x: number; y: number } => ({
  x: CUADRICULA.x + c * CUADRICULA.c + CUADRICULA.c / 2,
  y: CUADRICULA.y + f * CUADRICULA.c + CUADRICULA.c / 2,
});
// COLOR_EN: el centro del bote de cada color de la paleta (a la derecha, en dos columnas; sin el blanco, que va el
// último como goma).
export const COLOR_EN = (i: number): { x: number; y: number } => ({
  x: 1130 + (i % 2) * 120,
  y: 200 + Math.floor(i / 2) * 100,
});
// BOTONES_ARTE: «Colgar en la casa» y «Borrar».
export const BOTONES_ARTE = { colgar: { x: 1060, y: 700, w: 400, h: 90 }, borrar: { x: 1060, y: 590, w: 400, h: 80 } };

// casillaEn(x, y): la casilla (f, c) que hay en (x, y), o null.
function casillaEn(x: number, y: number): { f: number; c: number } | null {
  const f = Math.floor((y - CUADRICULA.y) / CUADRICULA.c),
    c = Math.floor((x - CUADRICULA.x) / CUADRICULA.c);
  return f >= 0 && f < LADO && c >= 0 && c < LADO ? { f, c } : null;
}
// pintaEn(x, y): pinta la casilla de (x, y) y su espejo con el color elegido.
function pintaEn(x: number, y: number): void {
  const k = casillaEn(x, y);
  if (!k) return;
  const nuevo = pintar(ARTE.cuadro, k.f, k.c, ARTE.color);
  if (nuevo !== ARTE.cuadro) tone(NOTE(60 + ARTE.color * 2), 0.06, 'sine', 0.12);
  ARTE.cuadro = nuevo;
}
// cuadro(x, y, lado, celdas): dibuja un cuadro (sus casillas pintadas) en un cuadrado de ese lado.
function cuadro(x: number, y: number, lado: number, celdas: string): void {
  const c = lado / LADO;
  [...celdas].forEach((v, i) => {
    ctx.fillStyle = COLORES_ARTE[Number(v)]!;
    ctx.fillRect(x + (i % LADO) * c, y + Math.floor(i / LADO) * c, c + 0.5, c + 0.5);
  });
}

SCENES.arteSimetria = {
  // enter(): el cuadro que ya estaba colgado (si lo hay) para seguir pintándolo.
  enter(_o: OpcionesEscena) {
    Object.assign(ARTE, { cuadro: cuadroDe(S.arte?.cuadro), color: 1, pintando: false, hecho: false });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('Elige un color y pinta en el cuadro. ¡Lo que pintes en un lado sale también en el otro, como en un espejo!');
  },
  // draw(): la cuadrícula con su línea del espejo, la paleta y los botones.
  draw() {
    sky('#FFF0F5', '#FFF6DE');
    tituloRincon('Pintura de espejo');
    const lado = LADO * CUADRICULA.c;
    card(CUADRICULA.x - 14, CUADRICULA.y - 14, lado + 28, lado + 28, '#C9A06B', 6, 12);
    cuadro(CUADRICULA.x, CUADRICULA.y, lado, ARTE.cuadro);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    [...Array(LADO + 1).keys()].forEach((i) => {
      ctx.beginPath();
      ctx.moveTo(CUADRICULA.x + i * CUADRICULA.c, CUADRICULA.y);
      ctx.lineTo(CUADRICULA.x + i * CUADRICULA.c, CUADRICULA.y + lado);
      ctx.moveTo(CUADRICULA.x, CUADRICULA.y + i * CUADRICULA.c);
      ctx.lineTo(CUADRICULA.x + lado, CUADRICULA.y + i * CUADRICULA.c);
      ctx.stroke();
    });
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = '#8E5AC8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CUADRICULA.x + lado / 2, CUADRICULA.y - 10);
    ctx.lineTo(CUADRICULA.x + lado / 2, CUADRICULA.y + lado + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    COLORES_ARTE.forEach((c, i) => {
      const p = COLOR_EN(i === 0 ? COLORES_ARTE.length - 1 : i - 1);
      circ(p.x, p.y, 46, c, 5);
      if (ARTE.color === i) circ(p.x, p.y, 58, null, 6, '#FFC93C');
    });
    botonExtra(BOTONES_ARTE.borrar, 'Borrar');
    botonExtra(BOTONES_ARTE.colgar, 'Colgar en la casa');
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): un color de la paleta, los botones o empezar a pintar.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'estudioArte') || ARTE.hecho) return;
    const i = COLORES_ARTE.findIndex((_, j) => {
      const p = COLOR_EN(j === 0 ? COLORES_ARTE.length - 1 : j - 1);
      return dist(x, y, p.x, p.y) < 52;
    });
    if (i >= 0) {
      SFX.pop();
      ARTE.color = i;
      return;
    }
    if (tocaExtra(BOTONES_ARTE.borrar, x, y)) {
      SFX.whoosh();
      ARTE.cuadro = CUADRO_VACIO;
      return;
    }
    if (tocaExtra(BOTONES_ARTE.colgar, x, y)) {
      if (!cuadroPintado(ARTE.cuadro)) {
        SFX.boing();
        say('Primero pinta algo en el cuadro.');
        return;
      }
      ARTE.hecho = true;
      S.arte = { ...S.arte, cuadro: ARTE.cuadro };
      save();
      terminarRincon('arte', 'estudioArte', '¡Qué cuadro tan bonito! Lo colgamos en la pared del salón de mi casa.');
      return;
    }
    ARTE.pintando = true;
    pintaEn(x, y);
  },
  // move(x, y): si se está arrastrando, sigue pintando.
  move(x: number, y: number) {
    if (ARTE.pintando && !ARTE.hecho) pintaEn(x, y);
  },
  // up(): deja de pintar.
  up() {
    ARTE.pintando = false;
  },
} satisfies Escena;

// ── La canción ──
// laminaEn(i): el rectángulo de la lámina i del xilófono (de más larga a más corta).
export const laminaEn = (i: number): { x: number; y: number; w: number; h: number } => ({
  x: 330 + i * 200,
  y: 520 + i * 18,
  w: 150,
  h: 300 - i * 36,
});
// HUECO_EN: el centro del hueco i de la canción.
const huecoEn = (i: number): { x: number; y: number } => ({ x: 380 + i * 120, y: 330 });
// BOTONES_CANCION: «Escuchar», «Borrar» y «Guardar».
export const BOTONES_CANCION = {
  escuchar: { x: 1330, y: 470, w: 230, h: 90 },
  borrar: { x: 1330, y: 590, w: 230, h: 90 },
  guardar: { x: 1330, y: 710, w: 230, h: 90 },
};

// escuchar(cancion): toca la canción y va encendiendo cada hueco al sonar.
function escuchar(cancion: readonly number[]): void {
  playTune(melodia(cancion), 150);
  cancion.forEach((_, i) =>
    later(i * 400, () => {
      ARTE.suena = i;
    }),
  );
  later(cancion.length * 400 + 400, () => {
    ARTE.suena = -1;
  });
}

SCENES.arteCancion = {
  // enter(): la canción guardada (si la hay) para seguir con ella.
  enter(_o: OpcionesEscena) {
    Object.assign(ARTE, { cancion: cancionDe(S.arte?.cancion), suena: -1, hecho: false });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca las láminas del xilófono para hacer tu canción. Luego toca «Escuchar».');
  },
  // draw(): los ocho huecos (con las notas puestas), el xilófono y los botones.
  draw() {
    sky('#FFF0F5', '#FFF6DE');
    tituloRincon('Compón una canción');
    [...Array(HUECOS).keys()].forEach((i) => {
      const p = huecoEn(i),
        n = ARTE.cancion[i];
      circ(p.x, p.y + (ARTE.suena === i ? -12 : 0), 44, n === undefined ? '#FFFFFF' : NOTAS[n]!.color, 5);
    });
    NOTAS.forEach((n, i) => {
      const r = laminaEn(i);
      card(r.x, r.y, r.w, r.h, n.color, 6, 18);
      circ(r.x + r.w / 2, r.y + 30, 10, '#C9CED6', 4);
      circ(r.x + r.w / 2, r.y + r.h - 30, 10, '#C9CED6', 4);
    });
    botonExtra(BOTONES_CANCION.escuchar, 'Escuchar');
    botonExtra(BOTONES_CANCION.borrar, 'Borrar');
    botonExtra(BOTONES_CANCION.guardar, 'Guardar');
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): una lámina (suena y se pone en la canción), o los botones de escuchar, borrar y guardar.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'estudioArte') || ARTE.hecho) return;
    const i = NOTAS.findIndex((_, j) => tocaExtra(laminaEn(j), x, y));
    if (i >= 0) {
      tone(NOTE(NOTAS[i]!.nota), 0.5, 'triangle', 0.3);
      if (ARTE.cancion.length >= HUECOS) say('La canción ya está llena. Toca «Escuchar» o «Borrar».');
      ARTE.cancion = ponerNota(ARTE.cancion, i);
      return;
    }
    if (tocaExtra(BOTONES_CANCION.borrar, x, y)) {
      SFX.whoosh();
      ARTE.cancion = [];
      return;
    }
    if (!tocaExtra(BOTONES_CANCION.escuchar, x, y) && !tocaExtra(BOTONES_CANCION.guardar, x, y)) return;
    if (!ARTE.cancion.length) {
      SFX.boing();
      say('Primero toca unas notas del xilófono.');
      return;
    }
    escuchar(ARTE.cancion);
    if (tocaExtra(BOTONES_CANCION.guardar, x, y)) {
      ARTE.hecho = true;
      S.arte = { ...S.arte, cancion: [...ARTE.cancion] };
      save();
      terminarRincon('arte', 'estudioArte', '¡Qué canción tan bonita! Sonará cuando toques el cuadro de mi salón.');
    }
  },
} satisfies Escena;

// ── En la casa de Tito ──
// CUADRO_CASA: dónde se cuelga el cuadro en el salón (debajo de la ventana).
const CUADRO_CASA = { x: 1350, y: 470, lado: 130 };

// dibujaCuadroCasa(room): en el salón, el cuadro pintado en el estudio de arte con su marco (si hay uno).
export function dibujaCuadroCasa(room: string): void {
  const c = S.arte?.cuadro;
  if (room !== 'salon' || !c) return;
  const { x, y, lado } = CUADRO_CASA;
  card(x - lado / 2 - 14, y - lado / 2 - 14, lado + 28, lado + 28, '#C9A06B', 5, 8);
  cuadro(x - lado / 2, y - lado / 2, lado, cuadroDe(c));
  if (S.arte?.cancion?.length) pic('xilofono', x + lado / 2 + 10, y - lado / 2 + Math.sin(T * 3) * 4, 60);
}
// tocaCuadroCasa(room, x, y): si se toca el cuadro del salón, Tito lo comenta y suena la canción (si la hay); devuelve
// si se ha tocado.
export function tocaCuadroCasa(room: string, x: number, y: number): boolean {
  if (room !== 'salon' || !S.arte?.cuadro) return false;
  const { x: cx, y: cy, lado } = CUADRO_CASA;
  if (Math.abs(x - cx) > lado / 2 + 14 || Math.abs(y - cy) > lado / 2 + 14) return false;
  const cancion = cancionDe(S.arte.cancion);
  if (cancion.length) {
    say('¡Nuestro cuadro y nuestra canción del estudio de arte!');
    escuchar(cancion);
  } else say('Este cuadro lo pintamos en el estudio de arte.');
  return true;
}
