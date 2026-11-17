// Cuento opcional de las casitas: dos decisiones, dos finales y regreso al tema de origen.
import { SCENES, atHome, drawHome, go, pic, say, sky, text } from '../nucleo/indice.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';

export const BOTON_CUENTO = { x: 1120, y: 68, w: 285, h: 68 };
const IZQUIERDA = { x: 380, y: 660, w: 390, h: 95 };
const DERECHA = { x: 830, y: 660, w: 390, h: 95 };
let tema = '';
let paso = 0;

const HISTORIA = [
  {
    frase: 'Tito oye un ruido cerca del árbol. ¿Por dónde va?',
    dibujo: 'arbol',
    opciones: ['Por el camino', 'Por el prado'],
    siguiente: [1, 2],
  },
  {
    frase: 'Una ardilla busca su bellota. ¿Cómo la ayudas?',
    dibujo: 'ardilla',
    opciones: ['Buscar en el suelo', 'Mirar en el árbol'],
    siguiente: [3, 4],
  },
  {
    frase: 'Una ardilla mira una pila de hojas. ¿Cómo la ayudas?',
    dibujo: 'ardilla',
    opciones: ['Apartar las hojas', 'Mirar en el árbol'],
    siguiente: [3, 4],
  },
  {
    frase: '¡La bellota estaba escondida! La ardilla le da las gracias a Tito.',
    dibujo: 'bellota',
    opciones: [],
    siguiente: [],
  },
  {
    frase: 'Desde el árbol ven la bellota. Tito y la ardilla la recogen juntos.',
    dibujo: 'bellota',
    opciones: [],
    siguiente: [],
  },
];

SCENES.cuentoDecisiones = {
  // enter(o): recuerda el tema de origen y vuelve a la primera página.
  enter(o) {
    tema = o.t ?? '';
    paso = 0;
    this.prompt!();
  },
  // prompt(): lee la página actual.
  prompt() {
    say(HISTORIA[paso]!.frase);
  },
  // draw(): ilustra la página y presenta sus opciones o la posibilidad de releer.
  draw() {
    const pagina = HISTORIA[paso]!;
    sky('#D1F0FF', '#EDF6CE');
    drawHome();
    text('La bellota perdida', 800, 135, 60);
    pic(pagina.dibujo, 800, 345, 265);
    text(pagina.frase, 800, 570, 45, '#293C31', { max: 1200 });
    botonExtra(IZQUIERDA, pagina.opciones[0] ?? 'Leer de nuevo');
    botonExtra(DERECHA, pagina.opciones[1] ?? 'Volver a la casita');
  },
  // down(x, y): elige una rama, vuelve a la casita o relee desde el principio.
  down(x, y) {
    const pagina = HISTORIA[paso]!;
    const izquierda = tocaExtra(IZQUIERDA, x, y);
    const derecha = tocaExtra(DERECHA, x, y);
    if (atHome(x, y) || (derecha && !pagina.siguiente.length)) {
      if (tema) go('casita', { t: tema });
      else go('map');
      return;
    }
    if (izquierda || derecha) {
      paso = pagina.siguiente[izquierda ? 0 : 1] ?? 0;
      this.prompt!();
    }
  },
};
