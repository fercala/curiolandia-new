/*
 * escenas/zoo.ts: los recintos del zoo (idea 2 de docs/IDEAS-MEJORA.md, fase P17), las estaciones de la excursión del
 * zoo. Se llega desde el plano de la excursión (escenas/excursion.ts, con Nico el cuidador) y, al terminar, se vuelve a
 * él con volverDeEstacion, que la apunta. Cada recinto es un juego de los de siempre con su fondo; al empezar, Nico lo
 * presenta, y al terminar cuenta un dato curioso de uno de sus animales (con el dibujo del animal en grande):
 * - La sabana (SCENES.zooSabana): unir cada animal con su comida (Une): el león, la carne; la jirafa, las hojas; el
 *   mono, el plátano; el elefante, la calabaza; el pingüino, el pescado.
 * - La selva (SCENES.zooSelva): ¿quién hace este sonido? (Sonido) con el mono, el tigre, la rana, el elefante, el león y
 *   el cocodrilo.
 * - La zona polar (SCENES.zooPolar): contar las crías (Cuenta) de pingüino, foca, oso polar y morsa.
 * - La casa de los reptiles (SCENES.zooReptiles): el cartel se ha roto (Puzzle con el cocodrilo y la tortuga).
 * - La gran pajarera (SCENES.zooPajarera): ¿dónde está...? (Busca) con el búho, el pájaro, la golondrina, el pato, el
 *   pingüino y la gallina.
 * Los animales que pasean por el plano del zoo y sus fotos (el safari fotográfico) están en escenas/granjaAnimales.ts y
 * dominio/fotos.ts. La casa (arriba a la izquierda) vuelve al plano sin terminar el recinto.
 * Exporta: el tipo RecintoZoo, RECINTOS_ZOO (cada recinto: su escena, su dibujo, lo que dice Nico y su juego), ZOO (el
 * estado, para las pruebas), escenaRecinto (desde la P18, también para las salas del acuario) y pone SCENES.zooSabana, SCENES.zooSelva, SCENES.zooPolar, SCENES.zooReptiles y SCENES.zooPajarera.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito), los componentes Une, Sonido, Cuenta, Puzzle y Busca y los
 * fondos BG de juegos/, y volverDeEstacion de escenas/excursion.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  SCENES,
  SFX,
  T,
  TITO,
  VIVO,
  alEmpezarJuego,
  atHome,
  burst,
  card,
  circ,
  ctx,
  drawCoinHUD,
  drawHome,
  drawRounds,
  drawTito,
  fmt,
  go,
  inTito,
  later,
  pic,
  say,
  star,
} from '../nucleo/indice.ts';
import type { AlTerminar, Juego } from '../juegos/tipos.ts';
import { BG, Busca, Cuenta, Puzzle, Sonido, Une, nameT } from '../juegos/indice.ts';
import { volverDeEstacion } from './excursion.ts';

/** Un recinto del zoo: su id (el de su estación en contenido/excursiones.ts), su escena, el animal del dato curioso, lo
 * que dice el guía al empezar (intro) y al terminar (dato), su juego (que llama a onDone al acabar) y, si hace falta,
 * algo más al empezar (alEmpezar: la canción de la ballena del acuario). */
export interface RecintoZoo {
  readonly id: string;
  readonly escena: string;
  readonly animal: string;
  readonly intro: string;
  readonly dato: string;
  readonly juego: (onDone: AlTerminar) => Juego;
  readonly alEmpezar?: () => void;
}

// COMIDAS_ZOO: qué come cada animal de la sabana (las parejas de Une: animal y comida).
const COMIDAS_ZOO: [string, string][] = [
  ['leon', 'carne'],
  ['jirafa', 'hoja'],
  ['mono', 'banana'],
  ['elefante', 'calabaza'],
  ['pinguino', 'pescado'],
];

// RECINTOS_ZOO: los cinco recintos, en el orden del plano.
export const RECINTOS_ZOO: readonly RecintoZoo[] = [
  {
    id: 'sabana',
    escena: 'zooSabana',
    animal: 'jirafa',
    intro: '¡Esto es la sabana! Los animales tienen mucha hambre.',
    dato: '¿Sabes una cosa? La jirafa es el animal más alto del mundo. ¡Llega a las hojas de lo alto de los árboles!',
    juego: (onDone) =>
      Une(
        {
          pairs: COMIDAS_ZOO,
          bg: BG['sabana'],
          key: 'zoo',
          ask: 'Une cada animal con su comida. Arrastra del animal a lo que come.',
          okSay: (a: string, b: string) => fmt('{Cosa} come {otra}.', { cosa: nameT(a), otra: nameT(b) }),
          why: (a: string, b: string) => fmt('Mmm, {cosa} no come {otra}.', { cosa: nameT(a), otra: nameT(b) }),
        },
        onDone,
      ),
  },
  {
    id: 'selva',
    escena: 'zooSelva',
    animal: 'mono',
    intro: '¡Esto es la selva! Aquí se oyen muchos ruidos. ¿Sabes quién los hace?',
    dato: '¿Sabes una cosa? Los monos viven en los árboles y saltan de rama en rama. ¡Son unos grandes trepadores!',
    juego: (onDone) =>
      Sonido({ items: ['mono', 'tigre', 'rana', 'elefante', 'leon', 'cocodrilo'], bg: BG['selva'] }, onDone),
  },
  {
    id: 'polar',
    escena: 'zooPolar',
    animal: 'pinguino',
    intro: '¡Qué frío hace en la zona polar! Las crías están jugando en el hielo. ¡Vamos a contarlas!',
    dato: '¿Sabes una cosa? Los pingüinos no saben volar, ¡pero nadan rapidísimo!',
    juego: (onDone) => Cuenta({ pool: ['pinguino', 'foca', 'osoPolar', 'morsa'], bg: BG['polo'] }, onDone),
  },
  {
    id: 'reptiles',
    escena: 'zooReptiles',
    animal: 'tortuga',
    intro: '¡Oh, no! El cartel de la casa de los reptiles se ha roto. ¿Me ayudas a arreglarlo?',
    dato: '¿Sabes una cosa? La tortuga lleva su casa a cuestas: ¡es su caparazón!',
    juego: (onDone) => Puzzle({ list: ['cocodrilo', 'tortuga'], bg: BG['desierto'] }, onDone),
  },
  {
    id: 'pajarera',
    escena: 'zooPajarera',
    animal: 'buho',
    intro: 'En la gran pajarera viven muchos pájaros. ¡Vamos a buscarlos!',
    dato: '¿Sabes una cosa? El búho duerme de día y por la noche sale a volar.',
    juego: (onDone) =>
      Busca({ items: ['buho', 'pajaro', 'golondrina', 'pato', 'pinguino', 'gallina'], bg: BG['bosque'] }, onDone),
  },
];

/** El estado del recinto en pantalla (desde la P18, también el de las salas del acuario): de qué excursión es, cuál, la fase (jugando o el dato curioso), desde cuándo (T) está en ella, si ya ha
 * vuelto al plano y su juego. */
export const ZOO = {
  exc: 'zoo',
  guia: 'cuidador',
  recinto: 'sabana',
  fase: 'juego' as 'juego' | 'dato',
  desde: 0,
  vuelto: false,
  g: null as Juego | null,
};

// juegoActual(): el juego del recinto en pantalla (siempre lo hay: enter lo pone antes de dibujar).
const juegoActual = (): Juego => ZOO.g!;

// alTerminar(r): el juego del recinto r ha terminado: Nico cuenta el dato curioso (con el animal en grande y una lluvia
// de chispas) y, al acabar de hablar, se vuelve al plano.
function alTerminar(r: RecintoZoo): void {
  if (ZOO.fase !== 'juego' || ZOO.recinto !== r.id) return;
  Object.assign(ZOO, { fase: 'dato', desde: T });
  VIVO.drag = null;
  later(300, () => SFX.tada());
  burst(1000, 430, 40);
  say(r.dato, () => volver(r));
}

// volver(r): del dato curioso del recinto r al plano de su excursión, que lo apunta como hecho (solo una vez).
function volver(r: RecintoZoo): void {
  if (ZOO.fase !== 'dato' || ZOO.recinto !== r.id || ZOO.vuelto) return;
  ZOO.vuelto = true;
  volverDeEstacion(ZOO.exc, r.id);
}

// dibujaDato(r): el dato curioso del recinto r: un velo, una estrella que late y, en una tarjeta, el guía (Nico el
// cuidador o, en el acuario, Marina la buceadora) y el animal del dato, que entra creciendo.
function dibujaDato(r: RecintoZoo): void {
  const k = Math.min(1, (T - ZOO.desde) / 0.5);
  ctx.save();
  ctx.fillStyle = 'rgba(255,246,230,0.82)';
  ctx.fillRect(0, 0, 1600, 900);
  ctx.restore();
  card(420, 170, 1000, 560, '#FFFFFF', 6, 40);
  star(1050, 450, 210 + Math.sin(T * 3) * 10, '#FFE38A', 0);
  pic(ZOO.guia, 640, 470, 360);
  circ(1050, 450, 170 * k, '#FFF8E8', 0);
  pic(r.animal, 1050, 450, 300 * k);
}

// escenaRecinto(r, exc): la escena del recinto r de la excursión exc: el guía lo presenta y empieza su juego (con sus
// monedas de acierto, como en cualquier juego); al terminarlo, el dato curioso y vuelta al plano. Desde la fase P18, la
// usan también las salas del acuario (escenas/acuario.ts), con exc 'acuario' y su propio guía (guia: su dibujo).
export function escenaRecinto(r: RecintoZoo, exc = 'zoo', guia = 'cuidador') {
  return {
    music: 'game',
    // enter(): el juego del recinto, después de que Nico lo presente.
    enter() {
      Object.assign(ZOO, { exc, guia, recinto: r.id, fase: 'juego', desde: T, vuelto: false });
      r.alEmpezar?.();
      alEmpezarJuego();
      ZOO.g = r.juego(() => alTerminar(r));
      say(r.intro);
      juegoActual().enter?.();
    },
    // update(dt): pasa el tiempo al juego (no durante el dato).
    update(dt: number) {
      if (ZOO.fase === 'juego') juegoActual().update?.(dt);
    },
    // draw(): el juego (con sus rondas) y, encima, el dato curioso; la casa, Tito y las monedas.
    draw() {
      const g = juegoActual();
      g.draw();
      if (ZOO.fase === 'juego' && g.total) drawRounds(Math.min(g.done, g.total), g.total);
      if (ZOO.fase === 'dato') dibujaDato(r);
      drawHome();
      drawTito(TITO.x, TITO.y, TITO.w);
      drawCoinHUD();
    },
    // down(x, y): la casa vuelve al plano del zoo (sin terminar el recinto); en el dato, un toque vuelve ya; Tito repite
    // la consigna; si no, al juego.
    down(x: number, y: number) {
      if (atHome(x, y)) {
        SFX.tap();
        go('excursion', { exc });
        return;
      }
      if (ZOO.fase === 'dato') {
        volver(r);
        return;
      }
      if (inTito(x, y)) {
        juegoActual().prompt?.();
        return;
      }
      juegoActual().down?.(x, y);
    },
    // move(x, y): los arrastres, para el juego.
    move(x: number, y: number) {
      if (ZOO.fase === 'juego') juegoActual().move?.(x, y);
    },
    // up(x, y): soltar, para el juego.
    up(x: number, y: number) {
      if (ZOO.fase === 'juego') juegoActual().up?.(x, y);
    },
    // hint(): la ayuda del juego (nada durante el dato).
    hint() {
      return ZOO.fase === 'juego' ? (juegoActual().hint?.() ?? null) : null;
    },
    // prompt(): la consigna del juego, o el dato otra vez.
    prompt() {
      if (ZOO.fase === 'juego') juegoActual().prompt?.();
      else say(r.dato, () => volver(r));
    },
  };
}

RECINTOS_ZOO.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r);
});
