/*
 * aplicacion/terminarJuego.ts: el caso de uso «terminar un juego» (fase 4b de docs/PLAN-MIGRACION.md): todo lo que
 * cambia en la partida cuando el niño acaba un juego, en un solo sitio. Antes estaba repartido entre finishGame
 * (escenas/escenas2d.ts) y las envolturas que le ponían escenas/tienda.ts (las monedas) y escenas/repaso.ts (el día en
 * que se jugó y el repaso del día).
 * Aplica a la partida que recibe (en el juego, S) las reglas del dominio: el progreso del tema (trasTerminarJuego, de
 * dominio/progreso.ts), el último día jugado y el juego del repaso hecho (conFecha y conHecho, de dominio/repaso.ts), y
 * dice cuántas monedas da (monedasAlTerminar, de dominio/monedas.ts). No cambia la partida que recibe ni dibuja, habla
 * o guarda: devuelve los campos nuevos de la partida y lo que hay que celebrar. finishGame (escenas/escenas2d.ts) lo
 * llama, pone esos campos en S, guarda y celebra (figurita la primera vez, monedas y vuelta a la casita, que manda al
 * cofre si el tema se acaba de terminar).
 * Pruebas: tests/unidad/terminarJuego.test.ts (sin navegador: cada prueba inventa la partida).
 * Exporta: los tipos PartidaDeJuegos, JuegoDeTema, AlTerminar y JuegoTerminado y el caso de uso terminarJuego.
 * Importa: solo reglas del dominio.
 */
import type { ProgresoDeTema } from '../dominio/progreso.ts';
import { trasTerminarJuego } from '../dominio/progreso.ts';
import type { RepasoDelDia, Resultado } from '../dominio/repaso.ts';
import { conFecha, conHecho } from '../dominio/repaso.ts';
import { monedasAlTerminar } from '../dominio/monedas.ts';

/** Lo que terminar un juego mira y cambia de la partida (S): el progreso de los temas, cómo le va en cada juego y el
 * repaso del día. */
export interface PartidaDeJuegos {
  /** Progreso de cada tema, por id (S.temas). */
  readonly temas: Readonly<Record<string, ProgresoDeTema>>;
  /** Aciertos, fallos y último día jugado de cada juego, por 'temaId#número' (S.gs; si falta, empieza vacío). */
  readonly gs?: Readonly<Record<string, Resultado>>;
  /** El repaso del día (S.rep), si ya se ha preparado alguno. */
  readonly rep?: RepasoDelDia | null;
}

/** El tema del juego terminado, como lo mira el caso de uso: su id y sus juegos (solo cuenta cuántos tiene). */
export interface JuegoDeTema {
  readonly id: string;
  readonly games: readonly unknown[];
}

/** Cuándo se terminó: el día de hoy ('AAAA-MM-DD', today()) y si el juego se lanzó desde el repaso (REP_ON). */
export interface AlTerminar {
  readonly hoy: string;
  readonly delRepaso: boolean;
}

/** Lo que devuelve terminarJuego: los campos nuevos de la partida y lo que la escena tiene que celebrar. */
export interface JuegoTerminado {
  /** Los campos de la partida que cambian, ya nuevos (temas y gs; rep solo si el juego era del repaso del día). */
  readonly partida: { readonly temas: Record<string, ProgresoDeTema>; readonly gs: Record<string, Resultado>; readonly rep?: RepasoDelDia };
  /** true si era la primera vez que se terminaba ese juego (regala una figurita). */
  readonly primera: boolean;
  /** true si con este juego se acaba de terminar el tema (la casita manda al cofre). */
  readonly fin: boolean;
  /** Monedas que da: 3 la primera vez y 2 si se repite. */
  readonly monedas: number;
}

// terminarJuego(p, tema, juego, al): el niño acaba de terminar el juego número juego del tema. Devuelve la partida p
// puesta al día (solo los campos que cambian): hoy como último día jugado de ese juego (gs['temaId#juego'].d); si se
// lanzó desde el repaso y está en el repaso del día, hecho (rep.done); y 1 más en las veces de ese juego en el progreso
// del tema (temas[id].g), que queda terminado (done = 1) si con este ya están todos. Devuelve también si era la primera
// vez, si el tema se acaba de terminar y las monedas que da. No cambia p ni guarda: lo hace quien llama.
export function terminarJuego(p: PartidaDeJuegos, tema: JuegoDeTema, juego: number, al: AlTerminar): JuegoTerminado {
  const id = `${tema.id}#${juego}`;
  const gs = { ...p.gs, [id]: conFecha(p.gs?.[id], al.hoy) };
  const rep = al.delRepaso && p.rep ? { rep: conHecho(p.rep, id) } : {};
  const tras = trasTerminarJuego(p.temas[tema.id], juego, tema.games.length);
  const temas = { ...p.temas, [tema.id]: tras.tema };
  return { partida: { temas, gs, ...rep }, primera: tras.primera, fin: tras.fin, monedas: monedasAlTerminar(tras.primera) };
}
