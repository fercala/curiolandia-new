/*
 * escenas/menuRincon.ts: lo común de los rincones con varios juegos pequeños de la PR de todas las ideas pendientes
 * (v0.2.181, docs/IDEAS-MEJORA.md): el taller de experimentos (escenas/experimentos.ts) y el estudio de arte
 * (escenas/arte.ts). hacerMenu() pone la escena del menú (una tarjeta por juego, en dos filas de tres); cada juego usa
 * tituloRincon (su cartel), comunesRincon (la casa y las monedas) y terminarRincon (lo celebra, da 2 monedas, lo apunta
 * en el diario y vuelve al menú).
 * Exporta: el tipo JuegoRincon, tarjetaRincon, dentroRect, tituloRincon, comunesRincon, terminarRincon y hacerMenu.
 * Importa: del núcleo, lo que dibuja, suena y habla, las monedas y las escenas; MONEDAS (dominio/monedas.ts);
 * apuntarDiario (escenas/diario.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  SCENES,
  SFX,
  atHome,
  burst,
  card,
  drawCoinHUD,
  drawHome,
  giveCoins,
  go,
  hR,
  inCoinHUD,
  later,
  pic,
  say,
  sceneName,
  sky,
  text,
} from '../nucleo/indice.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import type { ClaveDiario } from '../dominio/diario.ts';
import { apuntarDiario } from './diario.ts';

/** Un juego del menú de un rincón: su escena, su título y su dibujo. */
export interface JuegoRincon {
  readonly escena: string;
  readonly titulo: string;
  readonly dibujo: string;
}
/** Un rectángulo de la pantalla. */
type Rect = { x: number; y: number; w: number; h: number };

// tarjetaRincon(i): el rectángulo de la tarjeta del juego i en el menú (dos filas de tres).
export const tarjetaRincon = (i: number): Rect => ({
  x: 230 + (i % 3) * 400,
  y: 200 + Math.floor(i / 3) * 330,
  w: 340,
  h: 290,
});
// dentroRect(x, y, r): ¿está (x, y) dentro del rectángulo r?
export const dentroRect = (x: number, y: number, r: Rect): boolean =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// tituloRincon(t): el cartel con el nombre del juego, arriba.
export function tituloRincon(t: string): void {
  card(520, 30, 560, 96, '#FFFFFF', 5, 36);
  text(t, 800, 96, 48, K, { max: 520 });
}
// comunesRincon(x, y, volver): la casa (vuelve a volver) y las monedas (la tienda); devuelve si se ha tocado alguna.
export function comunesRincon(x: number, y: number, volver: string): boolean {
  if (atHome(x, y)) {
    SFX.whoosh();
    go(volver);
    return true;
  }
  if (inCoinHUD(x, y)) {
    SFX.pop();
    go('tienda');
    return true;
  }
  return false;
}
// terminarRincon(clave, menu, frase): el juego ha terminado: Tito lo celebra con la frase, da 2 monedas, se apunta en
// el diario con la clave y, un rato después, se vuelve al menú (si se sigue en la misma escena).
export function terminarRincon(clave: ClaveDiario, menu: string, frase: string): void {
  const escena = sceneName;
  SFX.tada();
  burst(800, 420, 30);
  say(frase);
  apuntarDiario(clave);
  later(900, () => giveCoins(MONEDAS.juegoRepetido, 800, 420));
  later(4200, () => {
    if (sceneName === escena) go(menu);
  });
}

// hacerMenu(o): pone SCENES[o.escena], el menú de un rincón: su título, su consigna, sus juegos y adónde vuelve la casa.
export function hacerMenu(o: {
  escena: string;
  titulo: string;
  consigna: string;
  volver: string;
  juegos: readonly JuegoRincon[];
  cielo: [string, string];
}): void {
  SCENES[o.escena] = {
    // enter(): el menú, con su consigna.
    enter(_o: OpcionesEscena) {
      say(o.consigna);
    },
    // prompt(): la consigna del menú.
    prompt() {
      say(o.consigna);
    },
    // hint(): el primer juego.
    hint() {
      const r = tarjetaRincon(0);
      return { x: r.x + r.w / 2, y: r.y + r.h / 2, r: 150 };
    },
    // draw(): una tarjeta por juego, la casa y las monedas.
    draw() {
      sky(o.cielo[0], o.cielo[1]);
      tituloRincon(o.titulo);
      o.juegos.forEach((j, i) => {
        const r = tarjetaRincon(i);
        hR(r.x, r.y, r.w, r.h);
        card(r.x, r.y, r.w, r.h, '#FFFFFF', 6, 30);
        pic(j.dibujo, r.x + r.w / 2, r.y + 115, 150);
        text(j.titulo, r.x + r.w / 2, r.y + 250, 34, K, { max: r.w - 30 });
      });
      drawHome();
      drawCoinHUD();
    },
    // down(x, y): casa -> volver; un juego -> su escena.
    down(x: number, y: number) {
      if (comunesRincon(x, y, o.volver)) return;
      const j = o.juegos.find((_, i) => dentroRect(x, y, tarjetaRincon(i)));
      if (j) {
        SFX.pop();
        go(j.escena, { hello: true });
      }
    },
  } satisfies Escena;
}
