// Puesto de fruta del autobús: una lista, una cesta y fichas temporales. No usa el saldo de Tito.
import { AGE, SCENES, atHome, card, drawHome, go, pic, say, sky, text } from '../nucleo/indice.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';

export const BOTON_MERCADO = { x: 650, y: 635, w: 310, h: 84 };
const PUESTO = [
  { icono: 'manzana', precio: 1 },
  { icono: 'pera', precio: 1 },
  { icono: 'naranja', precio: 2 },
];
const PAGA = { x: 590, y: 740, w: 420, h: 84 };
let lista: number[] = [];
let cesta = 0;
let fichas = 0;
let pagado = false;

// zonaFruta(i): devuelve la tarjeta del producto i.
const zonaFruta = (i: number) => ({ x: 395 + 280 * i, y: 340, w: 245, h: 255 });

SCENES.mercadoCole = {
  // enter(): prepara la lista y las fichas del puesto según la edad.
  enter() {
    lista = AGE() === 3 ? [0, 1] : [0, 2, 1];
    cesta = 0;
    fichas = lista.reduce((suma, i) => suma + PUESTO[i]!.precio, 0);
    pagado = false;
    this.prompt!();
  },
  // prompt(): explica que hay que seguir la lista ilustrada.
  prompt() {
    say('Pon en la cesta la fruta de la lista.');
  },
  // draw(): muestra los productos, la lista y las fichas de la compra.
  draw() {
    sky('#FFE3BA', '#FFF6DE');
    drawHome();
    text('El mercado', 800, 130, 60);
    lista.forEach((i, pos) => {
      const x = 680 + pos * 120;
      card(x - 48, 188, 96, 105, pos < cesta ? '#B9E2A5' : '#FFFFFF', 3, 18);
      pic(PUESTO[i]!.icono, x, 239, 80);
    });
    PUESTO.forEach((producto, i) => {
      const r = zonaFruta(i);
      card(r.x, r.y, r.w, r.h, '#FFF9E8', 6, 30);
      pic(producto.icono, r.x + r.w / 2, r.y + 112, 160);
      for (let k = 0; k < producto.precio; k++) pic('moneda', r.x + 100 + k * 55, r.y + 208, 43);
    });
    for (let i = 0; i < fichas; i++) pic('moneda', 690 + i * 65, 660, 50);
    if (cesta === lista.length) botonExtra(PAGA, pagado ? 'Otra vez' : 'Pagar con una ficha');
  },
  // down(x, y): recoge el siguiente producto, paga una ficha o vuelve al autobús.
  down(x, y) {
    if (atHome(x, y)) {
      go('autobus');
      return;
    }
    if (cesta === lista.length && tocaExtra(PAGA, x, y)) {
      if (pagado) go('mercadoCole');
      else if (--fichas === 0) {
        pagado = true;
        say('¡Compra hecha!');
      }
      return;
    }
    if (cesta === lista.length) return;
    const i = PUESTO.findIndex((_producto, pos) => tocaExtra(zonaFruta(pos), x, y));
    if (i === lista[cesta]) cesta++;
    else if (i >= 0) say('Mira el siguiente dibujo de la lista.');
  },
};
