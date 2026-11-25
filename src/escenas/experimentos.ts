/*
 * escenas/experimentos.ts: el taller de experimentos de las clases del cole (idea 30 de docs/IDEAS-MEJORA.md, en la PR
 * de todas las ideas pendientes, v0.2.181). SCENES.taller es su menú (desde el rincón de las ciencias de
 * escenas/clases.ts) con cinco experimentos, cada uno su escena:
 * - expColores: se tocan dos botes de pintura y se mezclan en el cuenco; hay que descubrir las tres mezclas.
 * - expImanes: con cada objeto, se dice antes si el imán lo atraerá («se pega» o «no se pega») y luego se prueba.
 * - expSombras: la lámpara da sombra al objeto: se toca, en la pared, su sombra.
 * - expAgua: el ciclo del agua: se tocan los pasos en orden (el sol, las nubes, la lluvia y el río).
 * - expSemilla: la semilla del taller crece con los días de verdad en que se riega (S.crece, dominio/crecer.ts).
 * Cada experimento terminado da 2 monedas y se apunta en el diario (menuRincon.ts). Las reglas, en
 * dominio/experimentos.ts.
 * Exporta, para las pruebas: EXP (el estado), BOTES, BOTON_SE_PEGA, BOTON_NO_SE_PEGA, sombraEn, pasoAgua, REGADERA y
 * etapaSemillaHoy; pone las escenas al cargarse.
 * Importa: el núcleo, picS (juegos/), azar(), las reglas de dominio/experimentos.ts y dominio/crecer.ts y lo común de
 * escenas/menuRincon.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
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
  giveCoins,
  hR,
  pic,
  save,
  say,
  sky,
  text,
  today,
} from '../nucleo/indice.ts';
import { picS } from '../juegos/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import { contarDia, creceAl, crecimientoDe } from '../dominio/crecer.ts';
import {
  COLORES_BASE,
  MEZCLAS,
  PASOS_AGUA,
  SEMILLA,
  etapaSemilla,
  mezcla,
  planImanes,
  planSombras,
  type Color,
} from '../dominio/experimentos.ts';
import { comunesRincon, dentroRect, hacerMenu, terminarRincon, tituloRincon } from './menuRincon.ts';
import { apuntarDiario } from './diario.ts';

// PINTURA: el color de cada pintura en la pantalla.
const PINTURA: Readonly<Record<Color, string>> = {
  rojo: '#E8463C',
  amarillo: '#FFD23F',
  azul: '#3A7BD5',
  naranja: '#FF9A2E',
  verde: '#5BBF4A',
  morado: '#8E5AC8',
};

/** El estado del experimento de ahora. */
export const EXP = {
  hecho: false,
  bote: null as Color | null,
  mezcla: null as Color | null,
  vistas: [] as Color[],
  imanes: [] as { k: string; metal: boolean }[],
  objeto: 0,
  prueba: 0,
  sombras: [] as { objeto: string; sombras: string[] }[],
  ronda: 0,
  agua: [] as number[],
  orden: 0,
  riego: 0,
};

hacerMenu({
  escena: 'taller',
  titulo: 'El taller de ciencias',
  consigna: '¡El taller de ciencias! Elige un experimento.',
  volver: 'clases',
  cielo: ['#E6F7F1', '#FFF6DE'],
  juegos: [
    { escena: 'expColores', titulo: 'Mezclar colores', dibujo: 'pinturas' },
    { escena: 'expImanes', titulo: 'Los imanes', dibujo: 'tijeras' },
    { escena: 'expSombras', titulo: 'Las sombras', dibujo: 'bombilla' },
    { escena: 'expAgua', titulo: 'El ciclo del agua', dibujo: 'lluvia' },
    { escena: 'expSemilla', titulo: 'La semilla', dibujo: 'brote' },
  ],
});

// fin(frase): el experimento ha terminado (una sola vez).
function fin(frase: string): void {
  if (EXP.hecho) return;
  EXP.hecho = true;
  terminarRincon('ciencias', 'taller', frase);
}

// ── Mezclar colores ──
// BOTES: los tres botes de pintura (abajo); CUENCO: donde se mezclan.
export const BOTES = COLORES_BASE.map((c, i) => ({ c, x: 500 + i * 300, y: 740 }));
const CUENCO = { x: 800, y: 430 };

SCENES.expColores = {
  // enter(): los botes limpios y ninguna mezcla vista.
  enter(_o: OpcionesEscena) {
    Object.assign(EXP, { hecho: false, bote: null, mezcla: null, vistas: [] });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca dos botes de pintura para mezclarlos. ¿Qué color saldrá?');
  },
  // hint(): un bote que aún no se ha mezclado.
  hint() {
    const falta = MEZCLAS.find((m) => !EXP.vistas.includes(m.sale)),
      b = BOTES.find((o) => o.c === (EXP.bote === falta?.a ? falta?.b : falta?.a)) ?? BOTES[0]!;
    return { x: b.x, y: b.y, r: 100 };
  },
  // draw(): las mezclas que faltan por descubrir (arriba), el cuenco con la mezcla y los botes.
  draw() {
    sky('#E6F7F1', '#FFF6DE');
    tituloRincon('Mezclar colores');
    MEZCLAS.forEach((m, i) =>
      circ(650 + i * 150, 190, 40, EXP.vistas.includes(m.sale) ? PINTURA[m.sale] : '#FFFFFF', 5),
    );
    ctx.fillStyle = '#FFFFFF';
    circ(CUENCO.x, CUENCO.y, 150, '#F2F2F2', 7);
    const dentro = EXP.mezcla ?? EXP.bote;
    if (dentro) circ(CUENCO.x, CUENCO.y + 10, 115 + Math.sin(T * 4) * 3, PINTURA[dentro], 0);
    BOTES.forEach((b) => {
      hR(b.x - 90, b.y - 100, 180, 200);
      card(b.x - 70, b.y - 70, 140, 150, '#FFFFFF', 6, 20);
      circ(b.x, b.y + 5, 52, PINTURA[b.c], 5);
      if (EXP.bote === b.c) circ(b.x, b.y + 5, 70, null, 6, '#FFC93C');
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): un bote: si es el primero, va al cuenco; si es el segundo, se mezcla y Tito dice qué sale.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'taller') || EXP.hecho) return;
    const b = BOTES.find((o) => dist(x, y, o.x, o.y) < 100);
    if (!b) return;
    SFX.pop();
    if (!EXP.bote || EXP.mezcla) {
      Object.assign(EXP, { bote: b.c, mezcla: null });
      return;
    }
    const m = mezcla(EXP.bote, b.c);
    if (!m) {
      SFX.boing();
      say('Con el mismo color sale el mismo color. Prueba con otro.');
      return;
    }
    EXP.mezcla = m.sale;
    if (!EXP.vistas.includes(m.sale)) EXP.vistas.push(m.sale);
    SFX.sparkle();
    if (EXP.vistas.length === MEZCLAS.length) fin(m.frase);
    else say(m.frase);
  },
} satisfies Escena;

// ── Los imanes ──
// BOTON_SE_PEGA y BOTON_NO_SE_PEGA: las dos respuestas; IMAN: dónde está el imán.
export const BOTON_SE_PEGA = { x: 330, y: 650, w: 400, h: 150 };
export const BOTON_NO_SE_PEGA = { x: 870, y: 650, w: 400, h: 150 };
const IMAN = { x: 800, y: 270 };
// FRASES_IMAN: lo que dice Tito al probar: se pega o no, y si se había acertado o es una sorpresa.
const FRASES_IMAN = [
  '¡Se pega! Es de metal y el imán lo atrae.',
  'No se pega. El imán solo atrae el metal.',
  '¡Sorpresa! Se pega, porque es de metal y el imán lo atrae.',
  '¡Sorpresa! No se pega, porque el imán solo atrae el metal.',
];

// iman(x, y): el imán de herradura, rojo con las puntas grises.
function iman(x: number, y: number): void {
  ctx.lineCap = 'butt';
  ctx.strokeStyle = K;
  ctx.lineWidth = 64;
  ctx.beginPath();
  ctx.arc(x, y, 70, Math.PI, 0, false);
  ctx.stroke();
  ctx.strokeStyle = '#E8463C';
  ctx.lineWidth = 52;
  ctx.stroke();
  [-70, 70].forEach((dx) => card(x + dx - 26, y, 52, 40, '#C9CED6', 5, 4));
}

SCENES.expImanes = {
  // enter(): seis objetos para probar.
  enter(_o: OpcionesEscena) {
    Object.assign(EXP, { hecho: false, imanes: planImanes(azar), objeto: 0, prueba: 0 });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('¿El imán atraerá este objeto? Toca «Se pega» o «No se pega» y lo probamos.');
  },
  // draw(): el imán, el objeto (que sube hasta el imán si es de metal, mientras se prueba) y las dos respuestas.
  draw() {
    sky('#E6F7F1', '#FFF6DE');
    iman(IMAN.x, IMAN.y);
    const o = EXP.imanes[EXP.objeto];
    if (o) {
      const p = EXP.prueba ? Math.min(1, (T - EXP.prueba) / 0.6) : 0,
        y = o.metal ? 470 - p * 140 : 470 + Math.sin(p * Math.PI) * 10;
      pic(o.k, 800, y, 170);
    }
    [
      [BOTON_SE_PEGA, 'Se pega'],
      [BOTON_NO_SE_PEGA, 'No se pega'],
    ].forEach(([r, t]) => {
      const b = r as typeof BOTON_SE_PEGA;
      hR(b.x, b.y, b.w, b.h);
      card(b.x, b.y, b.w, b.h, '#FFF1B2', 6, 30);
      text(t as string, b.x + b.w / 2, b.y + 92, 44, K, { max: b.w - 30 });
    });
    text(EXP.objeto + 1 + ' / ' + EXP.imanes.length, 800, 110, 34, '#6B5A48');
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): una respuesta: se prueba con el imán, Tito dice si se pega y por qué, y se pasa al objeto siguiente.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'taller') || EXP.hecho || EXP.prueba) return;
    const o = EXP.imanes[EXP.objeto],
      boton = [BOTON_SE_PEGA, BOTON_NO_SE_PEGA].findIndex((b) => dentroRect(x, y, b));
    if (!o || boton < 0) return;
    SFX.pop();
    EXP.prueba = T;
    const acierta = (boton === 0) === o.metal;
    if (acierta) SFX.sparkle();
    say(FRASES_IMAN[(o.metal ? 0 : 1) + (acierta ? 0 : 2)]!, () => {
      EXP.prueba = 0;
      EXP.objeto++;
      if (EXP.objeto >= EXP.imanes.length) fin('¡Muy bien! Ya sabes qué cosas atrae el imán.');
    });
  },
} satisfies Escena;

// ── Las sombras ──
// sombraEn(i, n): el centro de la sombra i de n en la pared.
export const sombraEn = (i: number, n: number): { x: number; y: number } => ({
  x: 800 + (i - (n - 1) / 2) * 330,
  y: 330,
});

SCENES.expSombras = {
  // enter(): cuatro rondas según la edad.
  enter(_o: OpcionesEscena) {
    Object.assign(EXP, { hecho: false, sombras: planSombras(AGE(), azar), ronda: 0 });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('La lámpara da sombra al objeto. ¿Cuál es su sombra? Tócala en la pared.');
  },
  // hint(): la sombra buena.
  hint() {
    const r = EXP.sombras[EXP.ronda];
    if (!r) return null;
    const p = sombraEn(r.sombras.indexOf(r.objeto), r.sombras.length);
    return { x: p.x, y: p.y, r: 130 };
  },
  // draw(): la pared con las sombras, la lámpara y el objeto en la mesa.
  draw() {
    sky('#5A5470', '#2E2A3E');
    ctx.fillStyle = '#EDE6D6';
    ctx.fillRect(140, 160, 1320, 360);
    ctx.fillStyle = 'rgba(255, 236, 150, 0.25)';
    ctx.beginPath();
    ctx.moveTo(1300, 690);
    ctx.lineTo(140, 160);
    ctx.lineTo(140, 520);
    ctx.fill();
    const r = EXP.sombras[EXP.ronda];
    if (r)
      r.sombras.forEach((k, i) => {
        const p = sombraEn(i, r.sombras.length);
        hR(p.x - 130, p.y - 130, 260, 260);
        picS(k, p.x, p.y, 230);
      });
    ctx.fillStyle = '#A0703C';
    ctx.fillRect(560, 760, 480, 30);
    if (r) pic(r.objeto, 800, 670, 170);
    pic('bombilla', 1300, 690, 130);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): una sombra: si es la del objeto, siguiente ronda (o se termina); si no, Tito anima a mirar la forma.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'taller') || EXP.hecho) return;
    const r = EXP.sombras[EXP.ronda];
    if (!r) return;
    const i = r.sombras.findIndex((_, j) => {
      const p = sombraEn(j, r.sombras.length);
      return dist(x, y, p.x, p.y) < 130;
    });
    if (i < 0) return;
    if (r.sombras[i] !== r.objeto) {
      SFX.boing();
      say('Esa sombra tiene otra forma. Mira bien el objeto.');
      return;
    }
    SFX.sparkle();
    EXP.ronda++;
    if (EXP.ronda >= EXP.sombras.length) fin('¡Muy bien! La sombra tiene la misma forma que el objeto.');
    else say('¡Esa es! La sombra tiene su misma forma.');
  },
} satisfies Escena;

// ── El ciclo del agua ──
// pasoAgua(i): el centro de la tarjeta i (las tarjetas están desordenadas en EXP.agua).
export const pasoAgua = (i: number): { x: number; y: number } => ({ x: 260 + i * 360, y: 640 });

SCENES.expAgua = {
  // enter(): las cuatro tarjetas desordenadas.
  enter(_o: OpcionesEscena) {
    Object.assign(EXP, {
      hecho: false,
      agua: [0, 1, 2, 3]
        .map((i) => ({ i, k: azar() }))
        .sort((a, b) => a.k - b.k)
        .map((o) => o.i),
      orden: 0,
    });
    this.prompt!();
  },
  // prompt(): la consigna.
  prompt() {
    say('¿Cómo viaja el agua? Toca los dibujos en orden, empezando por el sol.');
  },
  // hint(): la tarjeta que toca ahora.
  hint() {
    const p = pasoAgua(EXP.agua.indexOf(EXP.orden));
    return { x: p.x, y: p.y, r: 140 };
  },
  // draw(): arriba, el ciclo con los pasos ya puestos y flechas; abajo, las tarjetas que faltan.
  draw() {
    sky('#BFE6F8', '#E6F7F1');
    tituloRincon('El ciclo del agua');
    PASOS_AGUA.forEach((p, i) => {
      const x = 380 + i * 280;
      circ(x, 300, 95, i < EXP.orden ? '#FFFFFF' : '#E4EEF4', 5);
      if (i < EXP.orden) pic(p.dibujo, x, 300, 140);
      if (i < PASOS_AGUA.length - 1) text('→', x + 140, 318, 54, '#3A7BD5');
    });
    EXP.agua.forEach((paso, i) => {
      if (paso < EXP.orden) return;
      const c = pasoAgua(i);
      hR(c.x - 140, c.y - 140, 280, 280);
      card(c.x - 130, c.y - 130, 260, 260, '#FFFFFF', 6, 30);
      pic(PASOS_AGUA[paso]!.dibujo, c.x, c.y, 200);
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): una tarjeta: si es la que toca, sube al ciclo y Tito lo explica; si no, piensa qué va antes.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'taller') || EXP.hecho) return;
    const i = EXP.agua.findIndex((paso, j) => paso >= EXP.orden && dist(x, y, pasoAgua(j).x, pasoAgua(j).y) < 140);
    if (i < 0) return;
    if (EXP.agua[i] !== EXP.orden) {
      SFX.boing();
      say('Eso pasa más tarde. ¿Qué pasa antes?');
      return;
    }
    SFX.sparkle();
    const frase = PASOS_AGUA[EXP.orden]!.frase;
    EXP.orden++;
    if (EXP.orden < PASOS_AGUA.length) say(frase);
    else say(frase, () => fin('¡Y vuelta a empezar! El agua siempre da la vuelta.'));
  },
} satisfies Escena;

// ── La semilla ──
// REGADERA: el botón de regar; etapaSemillaHoy(): la etapa de la semilla del taller.
export const REGADERA = { x: 1150, y: 520, r: 110 };
export const etapaSemillaHoy = (): number => etapaSemilla(crecimientoDe(S.crece, SEMILLA.id).dias);
// FRASES_SEMILLA: lo que dice Tito al crecer a cada etapa.
const FRASES_SEMILLA = [
  '',
  '¡Ha salido un brote! Mañana la regamos otra vez.',
  '¡Ya es una plantita con hojas! Sigue regándola otros días.',
  '¡Ha salido una flor! Las plantas crecen con agua, sol y tiempo.',
];

// planta(x, y, etapa): la maceta con la semilla, el brote, la planta o la flor.
function planta(x: number, y: number, etapa: number): void {
  if (etapa === 0) pic('semilla', x, y - 20, 70);
  if (etapa >= 1) {
    ctx.strokeStyle = '#4FAF5E';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - [0, 80, 170, 230][etapa]!);
    ctx.stroke();
  }
  if (etapa === 1) pic('brote', x, y - 90, 110);
  if (etapa >= 2) {
    pic('hoja', x - 50, y - 100, 90);
    pic('hoja', x + 50, y - 140, 90);
  }
  if (etapa >= 3) pic('flor', x, y - 250, 150);
  pic('maceta', x, y + 60, 230);
}

SCENES.expSemilla = {
  // enter(): la semilla como esté.
  enter(_o: OpcionesEscena) {
    Object.assign(EXP, { hecho: false, riego: 0 });
    this.prompt!();
  },
  // prompt(): según la etapa.
  prompt() {
    if (etapaSemillaHoy() >= 3) say('¡Nuestra planta ya tiene flor! Puedes seguir regándola.');
    else say('Esta es nuestra semilla. Riégala con la regadera y vuelve otros días para ver cómo crece.');
  },
  // hint(): la regadera.
  hint() {
    return { x: REGADERA.x, y: REGADERA.y, r: REGADERA.r };
  },
  // draw(): la maceta con la planta, el sol, la regadera (con gotas al regar) y los días regados.
  draw() {
    sky('#BFE6F8', '#FFF6DE');
    tituloRincon('La semilla');
    pic('sol', 300, 250, 160);
    const c = crecimientoDe(S.crece, SEMILLA.id);
    planta(760, 600, etapaSemilla(c.dias));
    hR(REGADERA.x - REGADERA.r, REGADERA.y - REGADERA.r, REGADERA.r * 2, REGADERA.r * 2);
    pic('regadera', REGADERA.x, REGADERA.y, 200);
    if (EXP.riego && T - EXP.riego < 1.5)
      [0, 1, 2, 3].forEach((i) => circ(900 - i * 25, 420 + ((T * 300 + i * 40) % 120), 8, '#6EC6F0', 0));
    [0, 1, 2, 3].forEach((i) => circ(1150 + i * 60, 760, 20, i < c.dias ? '#6EC6F0' : '#FFFFFF', 4));
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): la regadera: riega; si hoy no se había regado, cuenta el día (y, si crece, Tito lo celebra con 2
  // monedas); si ya se regó hoy, Tito dice que vuelva mañana.
  down(x: number, y: number) {
    if (comunesRincon(x, y, 'taller')) return;
    if (dist(x, y, REGADERA.x, REGADERA.y) > REGADERA.r) return;
    EXP.riego = T;
    SFX.pop();
    const antes = crecimientoDe(S.crece, SEMILLA.id),
      r = contarDia(antes, today());
    if (!r.cuenta) {
      say('Hoy ya la hemos regado. Vuelve mañana para ver cómo crece.');
      return;
    }
    S.crece = { ...S.crece, [SEMILLA.id]: { ...r.crecimiento } };
    apuntarDiario('ciencias');
    save();
    if (!creceAl(antes.dias, r.crecimiento.dias, SEMILLA.dias)) {
      say('¡Glu, glu! Ya tiene agua. Mañana la regamos otra vez.');
      return;
    }
    SFX.tada();
    say(FRASES_SEMILLA[etapaSemilla(r.crecimiento.dias)]!);
    giveCoins(MONEDAS.juegoRepetido, 760, 450);
  },
} satisfies Escena;
