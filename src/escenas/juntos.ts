/*
 * escenas/juntos.ts: «Jugar juntos», las parejas por turnos para dos en el mismo móvil (idea 39 de docs/IDEAS-MEJORA.md,
 * en la PR de todas las ideas pendientes, v0.2.180), SCENES.juntos. Se entra desde su botón en la casa de Tito
 * (escenas/casaExtras.ts). Un jugador va con Tito y el otro con Lupi: a cada lado, su dibujo y sus parejas, y el que
 * tiene el turno brilla y Tito dice a quién le toca. Al terminar, Tito celebra que lo han hecho juntos (2 monedas y el
 * diario). Las reglas, en dominio/juntos.ts.
 * Exporta, para las pruebas: JUNTOS (la partida), cartaJuntos; pone SCENES.juntos al cargarse.
 * Importa: el núcleo, azar(), las reglas de dominio/juntos.ts, MONEDAS y apuntarDiario.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  SCENES,
  SFX,
  atHome,
  burst,
  card,
  drawCoinHUD,
  drawHome,
  drawTito,
  giveCoins,
  go,
  hR,
  inCoinHUD,
  later,
  pic,
  say,
  sayQ,
  sky,
  text,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import { nuevaPartida, planParejas, tapar, terminada, voltear, type Partida } from '../dominio/juntos.ts';
import { apuntarDiario } from './diario.ts';

/** La partida de ahora y si se están tapando dos cartas (no se puede tocar). */
export const JUNTOS = { p: nuevaPartida([]) as Partida, tapando: false, fin: false };
// FRASES_TURNO: a quién le toca.
const FRASES_TURNO = ['Le toca al jugador de Tito.', 'Le toca al jugador de Lupi.'];
// COLORES_TURNO: el color de cada jugador.
const COLORES_TURNO = ['#7CC86E', '#F58BB4'];

// cartaJuntos(i, n): el rectángulo de la carta i de n (en filas de 4, en el centro).
export function cartaJuntos(i: number, n: number): { x: number; y: number; w: number; h: number } {
  const cols = 4,
    filas = Math.ceil(n / cols),
    w = 170,
    h = filas > 3 ? 150 : 180,
    g = 20;
  return {
    x: 800 - (cols * (w + g) - g) / 2 + (i % cols) * (w + g),
    y: 170 + Math.floor(i / cols) * (h + g),
    w,
    h,
  };
}

SCENES.juntos = {
  music: 'game',
  // enter(): una partida nueva y la consigna.
  enter(_o: OpcionesEscena) {
    Object.assign(JUNTOS, { p: nuevaPartida(planParejas(AGE(), azar)), tapando: false, fin: false });
    say('¡Vamos a jugar juntos a las parejas! Uno juega con Tito y el otro con Lupi, por turnos.', () =>
      sayQ(FRASES_TURNO[0]!),
    );
  },
  // prompt(): a quién le toca.
  prompt() {
    say(FRASES_TURNO[JUNTOS.p.turno]!);
  },
  // draw(): los dos jugadores a los lados (con sus parejas; el del turno, resaltado) y las cartas.
  draw() {
    sky('#FFF0F5', '#E8F4FF');
    const p = JUNTOS.p;
    [0, 1].forEach((j) => {
      const x = j ? 1400 : 60,
        activo = p.turno === j && !JUNTOS.fin;
      card(x, 300, 160, 300, activo ? COLORES_TURNO[j]! : '#FFFFFF', activo ? 8 : 5, 30);
      if (j) pic('lupi', x + 80, 400, 140);
      else drawTito(x + 10, 340, 140);
      text(p.puntos[j]!, x + 80, 560, 60, K);
    });
    p.cartas.forEach((k, i) => {
      const r = cartaJuntos(i, p.cartas.length),
        boca = p.halladas.includes(i) || p.arriba.includes(i);
      if (!boca) hR(r.x, r.y, r.w, r.h);
      card(r.x, r.y, r.w, r.h, boca ? '#FFFFFF' : '#9B8AD9', 5, 20);
      if (boca) pic(k, r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.75);
      else text('?', r.x + r.w / 2, r.y + r.h / 2 + 22, 64, '#FFFFFF');
    });
    if (JUNTOS.fin) {
      card(450, 760, 700, 100, '#FFF1B2', 5, 40);
      text('¡Lo habéis hecho juntos!', 800, 825, 46, K, { max: 660 });
    }
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> la casa de Tito; monedas -> la tienda; una carta -> se le da la vuelta.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('casaTito', { volver: 1 });
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (JUNTOS.tapando || JUNTOS.fin) return;
    const p = JUNTOS.p,
      i = p.cartas.findIndex((_, j) => {
        const r = cartaJuntos(j, p.cartas.length);
        return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      });
    const r = voltear(p, i);
    if (r.pasa === 'nada') return;
    JUNTOS.p = r.partida;
    SFX.pop();
    if (r.pasa === 'fallo') {
      JUNTOS.tapando = true;
      later(1300, () => {
        JUNTOS.p = tapar(JUNTOS.p);
        JUNTOS.tapando = false;
        say(FRASES_TURNO[JUNTOS.p.turno]!);
      });
      return;
    }
    if (r.pasa !== 'pareja') return;
    SFX.good();
    if (!terminada(JUNTOS.p)) {
      say('¡Pareja! Sigue jugando el mismo.');
      return;
    }
    JUNTOS.fin = true;
    SFX.tada();
    burst(800, 450, 60);
    apuntarDiario('juntos');
    say('¡Habéis encontrado todas las parejas! Jugar juntos es más divertido.');
    later(900, () => giveCoins(MONEDAS.juegoRepetido, 800, 450));
  },
} satisfies Escena;
