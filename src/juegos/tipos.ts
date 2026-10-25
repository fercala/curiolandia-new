// juegos/tipos.ts: los tipos que comparten los componentes de juego (comps.ts y comps2.ts).
// Un componente es una función Nombre(cfg, onDone) que devuelve un objeto Juego (ver la cabecera de comps.ts).
// Los campos propios de cada componente (rondas, tarjetas, fichas...) y su cfg aún son de forma libre: son la frontera
// con los temas, que todavía son código global sin tipos.
import type { Par } from '../nucleo/idioma.ts';
import type { Libre, Pista } from '../nucleo/tipos.ts';

export type { Libre };

/** Configuración de un componente: sus campos dependen del componente (ver la cabecera de cada uno). */
export type Config = Libre;

/** Lo que el componente llama una vez cuando el niño termina el juego. */
export type AlTerminar = () => void;

/**
 * Una «cosa» que se dibuja: una clave de dibujo de PICS (texto) o un objeto con nombre y su propio draw(x, y, s). Viene
 * de los temas, que aún son código global sin tipos, y el código la usa también como índice (SOUNDS[k], ONO[k]...), así
 * que de momento es libre, como Libre. Se le dará un tipo cerrado cuando los temas sean datos (fase 5 del plan).
 */
export type Cosa = any;

/**
 * El objeto que devuelve un componente y que usa la escena del juego (SCENES.juego en scenes.js): los métodos que la
 * escena llama si existen. Las estrellas (total y done, que el componente sube con this.done++) y el resto de campos
 * son propios de cada componente y van por el índice libre.
 */
export interface Juego {
  enter?(): void;
  update?(dt: number): void;
  draw(): void;
  down?(x: number, y: number): void;
  move?(x: number, y: number): void;
  up?(x: number, y: number): void;
  prompt?(): void;
  hint?(): Pista | null | undefined;
  [campo: string]: any;
}

/** Lo que dibuja una cosa k centrada en (x, y) con tamaño s (thing en comps.ts). */
export type DibujaCosa = (k: Cosa, x: number, y: number, s: number) => void;

/** Crea el juego g del tema t (makeGame en temas/temas.ts; extras.js e ingles.js lo amplían con ponMakeGame). */
export type HaceJuego = (g: Libre, t: Libre, onDone: AlTerminar) => Juego;

/** Un juego de un tema (en games): tipo t, dibujo del botón, nombre y, si no es de los que crea makeGame solo, make. */
export interface JuegoTema {
  t: string;
  icon?: string;
  name?: string | Par;
  make?: (onDone: AlTerminar, t: Tema) => Juego;
  [campo: string]: any;
}

/**
 * Un tema (T3, T4, T5 y los Rincones C3, C4, C5 en temas/): id, nombre, dibujo, colores, fondo, palabras y juegos. El
 * resto de campos (zone, intro, season, tip...) depende del tema.
 */
export interface Tema {
  id: string;
  n: string | Par;
  icon: string;
  c: string;
  trim: number;
  bg: () => void;
  words?: Cosa[];
  games: JuegoTema[];
  [campo: string]: any;
}
