// Experimento del cole: predecir, observar y repetir con cuatro objetos, sin estado de partida.
import { SCENES, atHome, card, drawHome, go, pic, say, sky, text } from '../nucleo/indice.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';

const OBJETOS = [
  { icono: 'hoja', flota: true },
  { icono: 'piedra', flota: false },
  { icono: 'pelotaPlaya', flota: true },
  { icono: 'moneda', flota: false },
];
let ronda = 0;
let prediccion: boolean | null = null;
let comprobado = false;

SCENES.flotaCole = {
  // enter(): inicia el experimento con el primer objeto.
  enter() {
    ronda = 0;
    prediccion = null;
    comprobado = false;
  },
  // prompt(): plantea la pregunta del experimento.
  prompt() {
    say('¿Flota o se hunde?');
  },
  // draw(): dibuja el barreño, el objeto y los botones de predicción o comprobación.
  draw() {
    const objeto = OBJETOS[ronda]!;
    sky('#D3EDFF', '#EEFBE9');
    botonExtra({ x: 560, y: 75, w: 480, h: 74 }, '¿Flota o se hunde?');
    drawHome();
    card(450, 400, 700, 280, '#95CDE9', 7, 55);
    card(475, 460, 650, 185, '#5CBCEF', 0, 32);
    pic(objeto.icono, 800, comprobado ? (objeto.flota ? 457 : 596) : 300, 125);
    if (prediccion === null) {
      botonExtra(FLOTA, 'Flota');
      botonExtra(HUNDE, 'Se hunde');
    } else {
      if (comprobado) text(objeto.flota ? 'Flota' : 'Se hunde', 800, 715, 45);
      botonExtra(ACCION, comprobado ? 'Otro objeto' : 'Soltar en el agua');
    }
  },
  // down(x, y): registra una predicción, suelta el objeto o pasa al siguiente.
  down(x, y) {
    if (atHome(x, y)) {
      go('cole');
      return;
    }
    if (prediccion === null) {
      if (tocaExtra(FLOTA, x, y)) prediccion = true;
      else if (tocaExtra(HUNDE, x, y)) prediccion = false;
      return;
    }
    if (!tocaExtra(ACCION, x, y)) return;
    if (!comprobado) {
      comprobado = true;
      const flota = OBJETOS[ronda]!.flota;
      const resultado = flota === prediccion ? '¡Lo has adivinado!' : '¡Ahora ya lo sabemos!';
      say(resultado);
    } else {
      ronda = (ronda + 1) % OBJETOS.length;
      prediccion = null;
      comprobado = false;
    }
  },
};

const FLOTA = { x: 430, y: 760, w: 330, h: 80 };
const HUNDE = { x: 840, y: 760, w: 330, h: 80 };
const ACCION = { x: 580, y: 760, w: 440, h: 80 };
