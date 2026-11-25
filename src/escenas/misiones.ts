/*
 * escenas/misiones.ts: las misiones del día y la semana temática (idea 36 de docs/IDEAS-MEJORA.md, en la PR de todas las
 * ideas pendientes, v0.2.180). En el mapa hay un botón con una lista (MISIONES_BOTON, debajo del encargo) que abre
 * SCENES.misiones: el tema de la semana y las tres misiones de hoy, con una marca verde en las cumplidas (se cumplen
 * solas con lo que se apunta en el diario de Tito). Al volver al mapa con las tres cumplidas, Tito lo celebra con 5
 * monedas (y los viernes, la pegatina de la semana), una vez al día. Las reglas, en dominio/misiones.ts; lo guardado,
 * en S.misiones.
 * Exporta: MISIONES_BOTON, dibujaBotonMisiones y tocaBotonMisiones (los usa el mapa, 2D y 3D); pone SCENES.misiones al
 * cargarse.
 * Importa: el núcleo, las reglas de dominio/misiones.ts y dominio/diario.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AL_ENTRAR,
  S,
  SCENES,
  SFX,
  atHome,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  giveCoins,
  giveSticker,
  go,
  hC,
  hv,
  inCoinHUD,
  later,
  pic,
  save,
  say,
  sayQ,
  sky,
  text,
  today,
} from '../nucleo/indice.ts';
import { cumplidas, misionesDeHoy, premioMisiones, semanaDe } from '../dominio/misiones.ts';
import { registroDiario } from '../dominio/diario.ts';

// MISIONES_BOTON: el botón de las misiones en el mapa, debajo del del encargo.
export const MISIONES_BOTON = { x: 1490, y: 560, r: 50 };

// hechas(): cuáles de las misiones de hoy están cumplidas.
const hechas = (): boolean[] => cumplidas(registroDiario(S.diario), today());

// dibujaBotonMisiones(): el botón con la lista y cuántas misiones van cumplidas.
export function dibujaBotonMisiones(): void {
  const B = MISIONES_BOTON,
    s = hv('misiones', hC(B.x, B.y, B.r)),
    n = hechas().filter(Boolean).length;
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  circ(0, 0, B.r, n === 3 ? '#C8F0B8' : '#FFFFFF', 5);
  pic('carta', 0, 0, B.r * 1.2);
  circ(B.r * 0.7, -B.r * 0.7, 24, '#7CC86E', 4);
  text(n, B.r * 0.7, -B.r * 0.7 + 9, 24, '#FFFFFF');
  ctx.restore();
}
// tocaBotonMisiones(x, y): si se toca el botón, va a las misiones; devuelve si se ha tocado.
export function tocaBotonMisiones(x: number, y: number): boolean {
  if (dist(x, y, MISIONES_BOTON.x, MISIONES_BOTON.y) > MISIONES_BOTON.r + 6) return false;
  SFX.whoosh();
  go('misiones');
  return true;
}

// lee(): Tito dice el tema de la semana y las misiones que faltan (o que ya están todas).
function lee(): void {
  const hoy = today(),
    h = hechas();
  say(semanaDe(hoy).frase);
  if (h.every(Boolean)) sayQ('¡Has cumplido las tres misiones de hoy! ¡Muy bien!');
  else {
    sayQ('Estas son las misiones de hoy:');
    misionesDeHoy(hoy).forEach((m, i) => !h[i] && sayQ(m.frase));
  }
}

SCENES.misiones = {
  // enter(): Tito lee las misiones.
  enter(_o: OpcionesEscena) {
    lee();
  },
  // prompt(): las vuelve a leer.
  prompt() {
    lee();
  },
  // draw(): el cartel de la semana (con su dibujo) y una tarjeta por misión, con su marca si está cumplida.
  draw() {
    const hoy = today(),
      sem = semanaDe(hoy),
      h = hechas();
    sky('#E8F4FF', '#FFF6DE');
    card(400, 40, 800, 110, '#FFFFFF', 6, 40);
    text('Las misiones de hoy', 800, 112, 54, K, { max: 740 });
    card(470, 175, 660, 90, '#FFF1B2', 5, 36);
    pic(sem.dibujo, 530, 220, 70);
    text(sem.frase, 590, 232, 30, K, { al: 'left', max: 520 });
    misionesDeHoy(hoy).forEach((m, i) => {
      const y = 310 + i * 180;
      card(300, y, 1000, 150, h[i] ? '#E4F7DC' : '#FFFFFF', 6, 34);
      pic(m.dibujo, 390, y + 75, 110);
      text(m.frase, 470, y + 88, 36, K, { al: 'left', max: 680 });
      circ(1220, y + 75, 44, h[i] ? '#7CC86E' : '#FFFFFF', 5);
      if (h[i]) text('✓', 1220, y + 92, 54, '#FFFFFF');
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el mapa; monedas -> la tienda; en otro sitio, Tito las vuelve a leer.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('map');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    lee();
  },
} satisfies Escena;

// al entrar en el mapa con las tres misiones cumplidas (y sin premio hoy): Tito lo celebra con las monedas y, los
// viernes, la pegatina de la semana.
AL_ENTRAR.push((nombre) => {
  if (nombre !== 'map') return;
  const hoy = today(),
    p = premioMisiones(S.misiones, registroDiario(S.diario), hoy);
  if (!p) return;
  S.misiones = { d: hoy, premio: true };
  creditCoins(p.monedas);
  save();
  later(1500, () => {
    SFX.tada();
    sayQ('¡Has cumplido las tres misiones de hoy! Te doy cinco monedas.');
    giveCoins(p.monedas, MISIONES_BOTON.x, MISIONES_BOTON.y, undefined, true);
    if (p.pegatina) {
      sayQ('¡Y como es viernes, la pegatina de la semana!');
      giveSticker(p.pegatina);
    }
  });
});
