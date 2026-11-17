// Laberintos del patio: tres tableros por edad, con recorrido por casillas vecinas y estado temporal.
import { AGE, SCENES, atHome, card, drawHome, drawTito, go, pic, say, sky, text } from '../nucleo/indice.ts';

const MAPAS = [
  ['...#', '##.#', '##.*'],
  ['....#', '.##.#', '..#.#', '###.*'],
  ['.....#', '.##..#', '..#.#*', '#...#.', '###...'],
] as const;
const CASILLA = 125;
const TOP = 225;
let mapa: readonly string[] = MAPAS[0];
let fila = 0;
let columna = 0;
let meta = false;
let arrastrando = false;

// izquierda(): devuelve el borde izquierdo del tablero centrado según su ancho.
const izquierda = () => (1600 - mapa[0]!.length * CASILLA) / 2;

// mueveLaberinto(x, y): avanza a una casilla vecina abierta; funciona al tocar y al arrastrar.
function mueveLaberinto(x: number, y: number) {
  const f = Math.floor((y - TOP) / CASILLA);
  const c = Math.floor((x - izquierda()) / CASILLA);
  const celda = mapa[f]?.[c];
  if (meta || !celda || celda === '#' || Math.abs(f - fila) + Math.abs(c - columna) !== 1) return;
  fila = f;
  columna = c;
  if (celda === '*') {
    meta = true;
    say('¡Llegaste a la meta!');
  }
}

SCENES.laberintoPatio = {
  // enter(): elige un tablero por edad y coloca a Tito en la salida.
  enter() {
    mapa = MAPAS[AGE() - 3] ?? MAPAS[0];
    fila = columna = 0;
    meta = false;
    arrastrando = false;
    this.prompt!();
  },
  // prompt(): explica cómo mover a Tito.
  prompt() {
    say('Lleva a Tito hasta la estrella. Toca la casilla de al lado o arrastra el dedo.');
  },
  // draw(): muestra el camino, sus paredes y el botón para repetir al llegar.
  draw() {
    sky('#CDEEFF', '#F9F4D6');
    drawHome();
    if (!meta) text('El laberinto', 800, 130, 62);
    mapa.forEach((linea, f) =>
      [...linea].forEach((celda, c) => {
        const x = izquierda() + c * CASILLA,
          y = TOP + f * CASILLA;
        card(x + 3, y + 3, CASILLA - 6, CASILLA - 6, celda === '#' ? '#327158' : '#FFF8D8', 3, 18);
        if (celda === '*') pic('estrella', x + CASILLA / 2, y + CASILLA / 2, 80);
      }),
    );
    drawTito(izquierda() + (columna + 0.5) * CASILLA, TOP + (fila + 0.5) * CASILLA, 80);
    if (meta) {
      card(600, 90, 400, 70, '#FFE285', 4, 24);
      text('Otra vez', 800, 141, 42);
    }
  },
  // down(x, y): vuelve al menú, repite el tablero o mueve la ficha.
  down(x, y) {
    if (atHome(x, y)) go('juegosCortos');
    else if (meta && x > 600 && x < 1000 && y > 90 && y < 160) go('laberintoPatio');
    else {
      arrastrando = true;
      mueveLaberinto(x, y);
    }
  },
  // move(x, y): mueve a Tito solo mientras el niño mantiene el toque.
  move(x, y) {
    if (arrastrando) mueveLaberinto(x, y);
  },
  // up(): termina el arrastre al soltar o cancelar el toque.
  up() {
    arrastrando = false;
  },
};
