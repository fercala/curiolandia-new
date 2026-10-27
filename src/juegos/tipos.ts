// juegos/tipos.ts: los tipos que comparten los componentes de juego (comps.ts y comps2.ts).
// Un componente es una función Nombre(cfg, onDone) que devuelve un objeto Juego (ver la cabecera de comps.ts).
// Los campos propios de cada componente (rondas, tarjetas, fichas...) y su cfg aún son de forma libre: son la frontera
// con los temas, que vienen del juego viejo (eran globales y sin tipos).
import type { Par } from '../nucleo/idioma.ts';
import type { Libre, Pista } from '../nucleo/tipos.ts';

export type { Libre };

/** Configuración de un componente: sus campos dependen del componente (ver la cabecera de cada uno). */
export type Config = Libre;

/** Lo que el componente llama una vez cuando el niño termina el juego. */
export type AlTerminar = () => void;

/**
 * Una «cosa» que se dibuja: una clave de dibujo de PICS (texto) o un objeto con nombre y su propio draw(x, y, s). Viene
 * de los temas, que vienen del juego viejo sin tipos, y el código la usa también como índice (SOUNDS[k], ONO[k]...), así
 * que de momento es libre, como Libre. Se le dará un tipo cerrado cuando los temas sean datos (fase 5 del plan).
 */
export type Cosa = any;

/**
 * El objeto que devuelve un componente y que usa la escena del juego (SCENES.juego en escenas/escenas2d.ts): los métodos que la
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
  /** Recuerda qué hay que hacer; la escena lo llama sin cb, y el propio componente puede pasarle qué hacer después. */
  prompt?(cb?: () => void): void;
  hint?(): Pista | null | undefined;
  [campo: string]: any;
}



/** Un juego de un tema (en games): tipo t, dibujo del botón, nombre y, si no es de los que crea makeGame solo, make. */
export interface JuegoTema {
  /** Tipo de juego: 'conocer', 'busca', 'memoria'... (makeGame en temas/hacerJuego.ts) o uno propio con make. */
  t: string;
  /** Dibujo (clave de PICS) del botón del juego en la casita; si falta, el del tipo. */
  icon?: string;
  /** Nombre del botón; si falta, el del tipo (GNAME en escenas/escenas2d.ts). */
  name?: string | Par;
  /** Crea el juego cuando no basta con el tipo: recibe qué hacer al terminar y el tema. */
  make?: (onDone: AlTerminar, t: Tema) => Juego;
  /** Solo en los juegos 'cancion': clave de SONGS (temas/extras.ts). */
  song?: string;
}

/**
 * Un tema (T3, T4, T5 y los Rincones C3, C4, C5 en temas/, y los de extras.ts e ingles.ts): una casita del mapa. Desde la
 * fase 5a el tipo está cerrado: un campo nuevo se añade aquí, con su comentario.
 */
export interface Tema {
  /** Identificador único: '3A-T1', '4A-C', 'X-CAN', 'F-cumple', 'EN-HELLO'... Es la clave de su progreso en la partida (S.temas[id]). */
  id: string;
  /** Nombre del tema, o el par [rioplatense, España]. */
  n: string | Par;
  /** Dibujo (clave de PICS) del tejado de la casita. */
  icon: string;
  /** Color de la casita. */
  c: string;
  /** Trimestre del curso (0 = sin trimestre). Informativo: el código no lo lee. */
  trim?: number;
  /** Pinta el fondo del tema (una función de BG, juegos/fondos.ts). */
  bg: () => void;
  /** Las palabras del tema, que enseñan 'conocer' y 'busca': {k: clave de PICS, say?, label?...} o cosas dibujadas. */
  words?: Cosa[];
  /** Los juegos de la casita, en orden. */
  games: JuegoTema[];
  /**
   * Zona del mapa: 'jardin', 'bosque' y 'montana' (los del camino de 3, 4 y 5 años), 'extras', 'fiestas' o 'ingles'.
   * Desde la fase 5a cada tema la trae escrita; antes la ponía escenas/escenas2d.ts al cargar.
   */
  zone: string;
  /** Estación del tema ('otoño', 'invierno'...). Informativo: el código no lo lee. */
  season?: string;
  /** true en el Rincón de los Conceptos de cada zona, que se abre de otra manera (dominio/apertura.ts). */
  concepts?: boolean;
  /** Lo que dice Tito al empezar el juego 'conocer' (y al repetir la consigna de la casita si no hay words). */
  intro?: string | Par;
  /** Idea para seguir en casa que da la zona de adultos (aplicacion/adultos.ts). */
  tip?: string;
  /** Solo en el Rincón del inglés: grupo de palabras en inglés (enItems en temas/ingles.ts). */
  en?: string;
  /** Los trazos: sus juegos se abren en orden. Informativo: todos los temas abren sus juegos en orden (juegoAbierto, dominio/apertura.ts). */
  seq?: boolean;
  /** Los días especiales. Informativo: lo que cuenta es zone 'fiestas'. */
  fiesta?: boolean;
}
