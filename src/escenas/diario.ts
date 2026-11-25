/*
 * escenas/diario.ts: el diario de Tito (idea 35 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes,
 * v0.2.180). apuntarDiario(clave) apunta en el día de hoy lo que el niño y Tito acaban de hacer juntos (lo llaman al
 * terminar un juego de una casita, una excursión, un cuento, los juegos del cole, el corral...); SCENES.diario es el
 * libro (desde su botón en la casa de Tito, escenas/casaExtras.ts): una página por día, de la más nueva a la más
 * vieja, con un dibujo y una frase por cosa, que Tito lee. Al entrar en el mapa el primer día después de haber jugado,
 * Tito recuerda lo de ayer (recuerdoDeAyer, lo llama el mapa). Las reglas, en dominio/diario.ts.
 * Exporta: apuntarDiario, recuerdoDeAyer y, para las pruebas, DIARIO (la página que se ve) y FLECHAS_DIARIO; pone
 * SCENES.diario al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, S, la fecha y escenas) y las reglas de dominio/diario.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  S,
  SCENES,
  SFX,
  atHome,
  card,
  dist,
  drawCoinHUD,
  drawHome,
  go,
  hR,
  inCoinHUD,
  pic,
  save,
  say,
  sayQ,
  sky,
  text,
  today,
} from '../nucleo/indice.ts';
import { COSAS_DIARIO, apuntar, paginasDiario, registroDiario, type ClaveDiario } from '../dominio/diario.ts';

/** La página del diario que se ve (0, la más nueva) y la última fecha en que Tito recordó lo de ayer. */
export const DIARIO = { pagina: 0, recordado: '' };
// FLECHAS_DIARIO: las flechas para pasar a la página de antes (más vieja) y a la de después.
export const FLECHAS_DIARIO = { antes: { x: 1450, y: 470 }, despues: { x: 150, y: 470 } };

// apuntarDiario(clave): apunta en el diario que hoy se ha hecho esa cosa (S.diario) y lo guarda.
export function apuntarDiario(clave: ClaveDiario): void {
  const reg = apuntar(registroDiario(S.diario), today(), clave);
  S.diario = Object.fromEntries(Object.entries(reg).map(([d, v]) => [d, [...v]]));
  save();
}

// ayer(hoy): la fecha del día de antes de hoy ('AAAA-MM-DD').
function ayer(hoy: string): string {
  const [a, m, d] = hoy.split('-').map(Number),
    f = new Date(Date.UTC(a!, m! - 1, d! - 1));
  return f.toISOString().slice(0, 10);
}
// recuerdoDeAyer(): la primera vez que se entra en el mapa cada día, si ayer se apuntó algo, Tito lo recuerda (lo
// primero que se hizo) e invita a mirar el diario. Lo llama el mapa (mundo3d/mapa3d.ts).
export function recuerdoDeAyer(): void {
  const hoy = today();
  if (DIARIO.recordado === hoy) return;
  DIARIO.recordado = hoy;
  const cosas = registroDiario(S.diario)[ayer(hoy)];
  if (!cosas?.length) return;
  sayQ('¿Te acuerdas de ayer? Mira lo que hicimos:');
  sayQ(COSAS_DIARIO[cosas[0]!].frase);
  sayQ('Lo tienes todo en el diario de mi casa.');
}

// fechaBonita(fecha): la fecha como «24 / 11» para el título de la página.
const fechaBonita = (fecha: string): string => fecha.slice(8, 10) + ' / ' + fecha.slice(5, 7);

// lee(): Tito lee la página de ahora (o dice que el diario aún está vacío).
function lee(): void {
  const p = paginasDiario(registroDiario(S.diario))[DIARIO.pagina];
  if (!p) {
    say('Mi diario aún está vacío. ¡Vamos a jugar juntos y lo llenamos!');
    return;
  }
  p.cosas.forEach((c, i) => (i ? sayQ(COSAS_DIARIO[c].frase) : say(COSAS_DIARIO[c].frase)));
}

SCENES.diario = {
  // enter(): la página más nueva, que Tito lee.
  enter(_o: OpcionesEscena) {
    DIARIO.pagina = 0;
    lee();
  },
  // prompt(): vuelve a leer la página.
  prompt() {
    lee();
  },
  // draw(): el libro abierto con la fecha de la página y una línea por cosa (su dibujo y su frase), y las flechas para
  // pasar de página.
  draw() {
    sky('#FFF4E0', '#F6E3C4');
    const paginas = paginasDiario(registroDiario(S.diario)),
      p = paginas[DIARIO.pagina];
    card(240, 120, 1120, 720, '#FFFDF6', 7, 30);
    lineasCuaderno();
    text('El diario de Tito', 800, 200, 54, K, { max: 900 });
    if (!p)
      text('Mi diario aún está vacío. ¡Vamos a jugar juntos y lo llenamos!', 800, 480, 38, '#6B5A48', { max: 1000 });
    else {
      text(fechaBonita(p.fecha), 800, 260, 36, '#C0504D');
      p.cosas.slice(0, 6).forEach((c, i) => {
        const y = 330 + i * 85;
        pic(COSAS_DIARIO[c].dibujo, 360, y, 70);
        text(COSAS_DIARIO[c].frase, 420, y + 13, 32, '#3A2E2A', { al: 'left', max: 880 });
      });
    }
    const { antes, despues } = FLECHAS_DIARIO;
    if (DIARIO.pagina < paginas.length - 1) {
      hR(antes.x - 60, antes.y - 60, 120, 120);
      card(antes.x - 55, antes.y - 55, 110, 110, '#FFFFFF', 5, 55);
      text('›', antes.x, antes.y + 25, 90, K);
    }
    if (DIARIO.pagina > 0) {
      hR(despues.x - 60, despues.y - 60, 120, 120);
      card(despues.x - 55, despues.y - 55, 110, 110, '#FFFFFF', 5, 55);
      text('‹', despues.x, despues.y + 25, 90, K);
    }
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> la casa de Tito; monedas -> la tienda; las flechas pasan de página (y Tito la lee).
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
    const n = paginasDiario(registroDiario(S.diario)).length,
      { antes, despues } = FLECHAS_DIARIO;
    if (DIARIO.pagina < n - 1 && dist(x, y, antes.x, antes.y) < 60) {
      SFX.pop();
      DIARIO.pagina++;
      lee();
    } else if (DIARIO.pagina > 0 && dist(x, y, despues.x, despues.y) < 60) {
      SFX.pop();
      DIARIO.pagina--;
      lee();
    }
  },
} satisfies Escena;

// lineasCuaderno(): las líneas del cuaderno, finas, en la página.
function lineasCuaderno(): void {
  [0, 1, 2, 3, 4, 5].forEach((i) => card(320, 370 + i * 85, 960, 2, '#E8DCC6', 0, 0, '#E8DCC6'));
}
