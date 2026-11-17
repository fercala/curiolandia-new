/*
 * escenas/mercado.ts: las paradas de la excursión al mercado (idea 7 de docs/IDEAS-MEJORA.md, fase P22): la frutería,
 * la báscula, la panadería, la pescadería y la caja. Se llega desde el plano de la excursión (escenas/excursion.ts: los
 * puestos del mercado, con Carmen la frutera) y, al terminar, se vuelve a él. Como los recintos del zoo, cada parada es
 * un juego de los de siempre; Carmen la presenta y al terminar cuenta un dato curioso (la escena común es escenaRecinto
 * de escenas/zoo.ts):
 * - La lista de la compra (SCENES.mercadoLista): buscar en la frutería la fruta que pide la lista (Busca).
 * - La báscula (SCENES.mercadoBascula): ¿qué pesa más? De dos frutas, la más pesada (ChoiceGame).
 * - La panadería (SCENES.mercadoPan): pagar el pan metiendo en la caja tantas monedas de un euro como cuesta (Llena).
 * - La pescadería (SCENES.mercadoPescado): contar el pescado que hay en el hielo (Cuenta).
 * - La caja (SCENES.mercadoCaja): con 3 y 4 años, contar los euros; con 5, pagar con cinco euros y decir cuánto nos
 *   devuelven (la vuelta, con ChoiceGame).
 * Exporta: RECINTOS_MERCADO (cada parada, con la forma de RecintoZoo), PESOS_BASCULA y cajaRegistradora; pone
 * SCENES.mercadoLista, SCENES.mercadoBascula, SCENES.mercadoPan, SCENES.mercadoPescado y SCENES.mercadoCaja.
 * Importa: el núcleo (dibujo, azar, la edad y las plantillas), los componentes Busca, ChoiceGame, Llena y Cuenta, NUM,
 * nameT, numCard y thing de juegos/, escenaRecinto y el tipo RecintoZoo de escenas/zoo.ts y el fondo del mercado,
 * fondoMercado, de escenas/excursion.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y colores en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { AGE, SCENES, card, circ, ctx, fmt, pic, ri, shuffle, text } from '../nucleo/indice.ts';
import type { AlTerminar, Juego } from '../juegos/tipos.ts';
import { Busca, ChoiceGame, Cuenta, Llena, NUM, nameT, numCard, thing } from '../juegos/indice.ts';
import { K } from '../dibujos/todos.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';
import { fondoMercado } from './excursion.ts';

/** Las parejas de la báscula: [la que pesa más, la que pesa menos]. */
export const PESOS_BASCULA: readonly (readonly [string, string])[] = [
  ['sandia', 'uva'],
  ['pina', 'fresa'],
  ['calabaza', 'limon'],
  ['sandia', 'fresa'],
  ['pina', 'uva'],
  ['calabaza', 'fresa'],
];

// bascula(): la báscula de la frutería, en un cartel blanco arriba: el pie, el brazo y los dos platos vacíos, con una
// interrogación en medio (¿qué pesa más?).
function bascula(): void {
  card(500, 160, 800, 300, '#FFFFFF', 6, 24);
  ctx.save();
  ctx.strokeStyle = K;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(900, 230);
  ctx.lineTo(900, 410);
  ctx.moveTo(640, 250);
  ctx.lineTo(1160, 250);
  [660, 1140].forEach((x) => {
    ctx.moveTo(x, 250);
    ctx.lineTo(x - 50, 340);
    ctx.moveTo(x, 250);
    ctx.lineTo(x + 50, 340);
  });
  ctx.stroke();
  ctx.restore();
  [660, 1140].forEach((x) => card(x - 80, 335, 160, 24, '#9AA3AD', 5, 12));
  card(820, 400, 160, 34, '#5B8DEF', 5, 12);
  circ(900, 230, 16, '#FFC93C', 5);
  text('?', 900, 340, 70, '#FFA94D');
}

// cajaRegistradora(hl, c): la caja de la panadería, donde se meten las monedas (la zona de Llena): brilla si hay una
// moneda encima (hl) y enseña el pan que se paga; c, las monedas que ya hay dentro (no hace falta: Llena las cuenta).
export function cajaRegistradora(hl: boolean, _c: number): void {
  ctx.save();
  if (hl) {
    ctx.shadowColor = '#FFC93C';
    ctx.shadowBlur = 40;
  }
  card(380, 380, 360, 240, '#E2574C', 7, 24);
  ctx.restore();
  card(420, 300, 280, 100, '#BFEAF7', 6, 12);
  card(470, 470, 180, 40, '#3B2A1E', 0, 10);
  pic('pan', 330, 700, 200);
}

// QUE_CUESTA: lo que se compra en la caja de los 5 años, según su precio en euros.
const QUE_CUESTA: Readonly<Record<number, string>> = { 2: 'manzana', 3: 'pan', 4: 'pez' };

// vuelta(onDone): la caja con 5 años: algo cuesta de dos a cuatro euros, pagamos con cinco y hay que decir cuánto nos
// devuelven (ChoiceGame con tarjetas de números).
function vuelta(onDone: AlTerminar): Juego {
  const tarjeta = (n: number) => ({ name: NUM[n]!, draw: (x: number, y: number, s: number) => numCard(n, x, y, s) });
  return ChoiceGame(
    {
      rounds: 3,
      bg: fondoMercado,
      key: () => 'mercado',
      y: 680,
      // ref(r): la etiqueta con el precio y las cinco monedas con las que pagamos
      ref(r: { p: number }) {
        card(200, 190, 1200, 240, '#FFFFFF', 6, 24);
        card(230, 210, 290, 200, '#FFF3DC', 5, 20);
        thing(QUE_CUESTA[r.p] ?? 'pez', 300, 310, 130);
        numCard(r.p, 440, 310, 120, { dots: false });
        [0, 1, 2, 3, 4].forEach((j) => thing('euro', 680 + j * 150, 310, 120));
      },
      gen() {
        const p = ri(2, 4),
          ok = 5 - p,
          otros = shuffle([1, 2, 3, 4].filter((n) => n !== ok)).slice(0, 2);
        const A = tarjeta(ok);
        return {
          p,
          words: [A, ...otros.map(tarjeta)],
          ok: [A],
          ask: fmt('Cuesta {p} euros y pagamos con cinco euros. ¿Cuántos euros nos devuelven?', { p: NUM[p]! }),
          okSay: () => fmt('¡Sí! Nos devuelven {n}.', { n: NUM[ok]! }),
          badSay: () => 'No. Cuenta las monedas que sobran.',
        };
      },
    },
    onDone,
  );
}

// RECINTOS_MERCADO: las cinco paradas, en el orden del plano.
export const RECINTOS_MERCADO: readonly RecintoZoo[] = [
  {
    id: 'lista',
    escena: 'mercadoLista',
    animal: 'manzana',
    intro: 'Aquí tenemos la lista de la compra. ¡Vamos a buscar la fruta en la frutería!',
    dato: '¿Sabes una cosa? La fruta de cada estación es la más rica: en otoño, las uvas, y en verano, la sandía.',
    juego: (onDone) =>
      Busca(
        {
          items: ['manzana', 'pera', 'banana', 'fresa', 'uva', 'sandia', 'naranja', 'limon'],
          bg: fondoMercado,
          key: 'mercado',
        },
        onDone,
      ),
  },
  {
    id: 'bascula',
    escena: 'mercadoBascula',
    animal: 'sandia',
    intro: 'Con la báscula sabemos lo que pesa la fruta. ¿Qué pesa más?',
    dato: '¿Sabes una cosa? Lo grande no siempre pesa más: ¡un globo es grande y no pesa casi nada!',
    juego: (onDone) => {
      const parejas = shuffle([...PESOS_BASCULA]);
      return ChoiceGame(
        {
          rounds: AGE() <= 3 ? 3 : 4,
          bg: fondoMercado,
          key: () => 'mercado',
          y: 640,
          ref: bascula,
          gen(i: number) {
            const [mas, menos] = parejas[i % parejas.length]!;
            return {
              words: [mas, menos],
              ok: [mas],
              ask: '¿Qué pesa más?',
              okSay: () => fmt('¡Sí! {Cosa} pesa más.', { cosa: nameT(mas) }),
              badSay: () => 'No, esa pesa menos. ¿Qué pesa más?',
            };
          },
        },
        onDone,
      );
    },
  },
  {
    id: 'pan',
    escena: 'mercadoPan',
    animal: 'pan',
    intro: '¡Qué bien huele la panadería! Vamos a comprar pan. Hay que pagar con monedas.',
    dato: '¿Sabes una cosa? Cuando pagamos, damos el dinero y nos llevamos lo que compramos.',
    juego: (onDone) =>
      Llena(
        {
          pool: ['euro'],
          bg: fondoMercado,
          zone: { x: 560, y: 470, r: 170 },
          drawZone: cajaRegistradora,
          min: 2,
          max: { 3: 3, 4: 4, 5: 5 }[AGE()],
          ask: (n: number) => fmt('El pan cuesta {n} euros. Mete {n} monedas en la caja.', { n: NUM[n]! }),
          okSay: (n: number) => fmt('Has pagado {n} euros. ¡Aquí tienes el pan!', { n: NUM[n]! }),
        },
        onDone,
      ),
  },
  {
    id: 'pescado',
    escena: 'mercadoPescado',
    animal: 'pez',
    intro: 'En la pescadería, el pescado está en el hielo para que esté fresquito. ¡Vamos a contarlo!',
    dato: '¿Sabes una cosa? El pescado viene del mar en barcos de pesca, muy temprano por la mañana.',
    juego: (onDone) => Cuenta({ pool: ['pez', 'pulpo', 'cangrejo'], bg: fondoMercado }, onDone),
  },
  {
    id: 'caja',
    escena: 'mercadoCaja',
    animal: 'euro',
    intro: 'Ya tenemos toda la compra. Ahora vamos a pagar. ¡Hay que contar bien el dinero!',
    dato: '¿Sabes una cosa? Si pagamos con más dinero del que cuesta, nos devuelven lo que sobra: es la vuelta.',
    juego: (onDone) =>
      AGE() >= 5 ? vuelta(onDone) : Cuenta({ pool: ['euro'], bg: fondoMercado, max: AGE() <= 3 ? 3 : 5 }, onDone),
  },
];

RECINTOS_MERCADO.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'mercado', 'frutera');
});
