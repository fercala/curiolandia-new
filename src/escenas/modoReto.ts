/*
 * escenas/modoReto.ts: el modo reto de las casitas (idea 32 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.180). En una casita con todos los juegos terminados sale el botón «Modo reto» (debajo del de los
 * cuentos, BOTON_RETO); al activarlo, VIVO.RETO es el id del tema y los juegos salen más difíciles (nOpts y nRounds,
 * nucleo/interfaz.ts) y sin ayudas (la escena 'juego', escenas/escenas2d.ts). Cada juego superado en modo reto da una
 * estrella dorada (S.reto), que se ve en la casita junto a su número. Las reglas, en dominio/reto.ts.
 * Exporta: BOTON_RETO, casitaConReto, alEntrarCasita, dibujaBotonReto, tocaBotonReto, dibujaDorada, dibujaCartelReto y
 * terminarReto (los usan la casita 2D y 3D, escenas/zonas.ts y mundo3d/casita3d.ts, y la escena 'juego').
 * Importa: del núcleo, S, VIVO, lo que dibuja y habla y las monedas; las reglas de dominio/reto.ts; botonExtra y
 * tocaExtra.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Tema } from '../juegos/tipos.ts';
import { K } from '../dibujos/todos.ts';
import { S, SFX, VIVO, card, circ, creditCoins, save, say, sayQ, star, text } from '../nucleo/indice.ts';
import { apuntarReto, doradasDe, registroReto, retoAbierto } from '../dominio/reto.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';

// BOTON_RETO: el botón «Modo reto» de la casita, debajo del de los cuentos con decisiones.
export const BOTON_RETO = { x: 1120, y: 150, w: 285, h: 68 };

// casitaConReto(t): ¿se puede jugar ya la casita t en modo reto? (todos sus juegos terminados).
export const casitaConReto = (t: Tema): boolean => retoAbierto(S.temas?.[t.id]?.g, t.games.length);

// alEntrarCasita(t): al entrar en una casita, el modo reto sigue solo si era el de esta casita.
export function alEntrarCasita(t: Tema): void {
  if (VIVO.RETO !== t.id) VIVO.RETO = '';
}

// dibujaBotonReto(t): el botón (solo si la casita está completa), dorado cuando está activado.
export function dibujaBotonReto(t: Tema): void {
  if (!casitaConReto(t)) return;
  const b = BOTON_RETO;
  if (VIVO.RETO === t.id) {
    card(b.x, b.y, b.w, b.h, '#FFC93C', 5, 24);
    text('Modo reto', b.x + b.w / 2 + 20, b.y + b.h * 0.7, 38, K, { max: b.w - 80 });
    star(b.x + 40, b.y + b.h / 2, 22, '#FFFFFF', 4);
  } else botonExtra(b, 'Modo reto');
}

// tocaBotonReto(t, x, y): si se toca el botón, activa o quita el modo reto (o dice cuándo se abre) y devuelve true.
export function tocaBotonReto(t: Tema, x: number, y: number): boolean {
  if (!tocaExtra(BOTON_RETO, x, y) || !casitaConReto(t)) return false;
  SFX.pop();
  if (VIVO.RETO === t.id) {
    VIVO.RETO = '';
    say('Volvemos a jugar como siempre.');
  } else {
    VIVO.RETO = t.id;
    say('¡Modo reto! Más opciones, más rondas y sin ayudas. Cada juego superado da una estrella dorada.');
  }
  return true;
}

// dibujaDorada(t, j, x, y): la estrella dorada del juego j de la casita t, si la tiene, en (x, y).
export function dibujaDorada(t: Tema, j: number, x: number, y: number): void {
  if (!doradasDe(registroReto(S.reto), t.id).includes(j)) return;
  circ(x, y, 34, '#FFF4C2', 4, '#E0A100');
  star(x, y, 26, '#FFB000', 4);
}

// dibujaCartelReto(): en un juego en modo reto, el cartel dorado «Reto» (en lugar del de «Nivel»); devuelve si lo ha
// dibujado.
export function dibujaCartelReto(): boolean {
  if (!VIVO.RETO) return false;
  card(1400, 140, 160, 56, '#FFC93C', 5, 28);
  text('Reto', 1480, 180, 30, K);
  return true;
}

// terminarReto(t, gi): al terminar un juego en modo reto: apunta su estrella dorada (con sus monedas la primera vez) y
// Tito lo celebra.
export function terminarReto(t: Tema, gi: number): void {
  if (VIVO.RETO !== t.id) return;
  const r = apuntarReto(registroReto(S.reto), t.id, gi);
  if (!r.nueva) return;
  S.reto = Object.fromEntries(Object.entries(r.reg).map(([k, v]) => [k, [...v]]));
  creditCoins(r.monedas);
  save();
  sayQ('¡Reto superado! Has ganado una estrella dorada.');
}
