/*
 * escenas/corral.ts: el corral de Tito, su granja propia junto a la casa (idea 33 de docs/IDEAS-MEJORA.md, en la PR de
 * todas las ideas pendientes, v0.2.180), SCENES.corral. Se entra desde su botón en la casa de Tito
 * (escenas/casaExtras.ts), que sale después de ir a la granja escuela. Cada animal tiene un bocadillo con lo que pide
 * hoy; se toca la cosa (abajo: el trigo, el cubo de agua o el cepillo) y luego el animal. Si era lo que pedía, da su
 * producto, que va a la cesta. Con «Vender» se venden los productos (1 moneda cada uno) y con monedas se compran la
 * vaca y la oveja (su sitio vacío lleva el precio). Las reglas, en dominio/corral.ts; lo guardado, en S.corral.
 * Exporta, para las pruebas: CORRAL (la cosa elegida), animalCorral, COSAS_CORRAL y BOTON_VENDER; pone SCENES.corral al
 * cargarse.
 * Importa: el núcleo, las reglas de dominio/corral.ts, apuntarDiario (escenas/diario.ts), botonExtra y tocaExtra.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  S,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  fmt,
  giveCoins,
  go,
  hR,
  inCoinHUD,
  pic,
  save,
  say,
  sky,
  spendCoins,
  text,
  today,
} from '../nucleo/indice.ts';
import {
  ANIMALES_CORRAL,
  NECESIDADES,
  comprar,
  corralDe,
  cuidar,
  pedidoDe,
  totalProductos,
  vender,
  type Corral,
  type Necesidad,
} from '../dominio/corral.ts';
import { apuntarDiario } from './diario.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';

/** La cosa elegida para dársela a un animal (o null) y el momento en que el último animal dio su producto. */
export const CORRAL = { cosa: null as Necesidad | null, salto: '', t: 0 };
// animalCorral(i): dónde está el animal i del corral.
export const animalCorral = (i: number): { x: number; y: number } => ({ x: 380 + i * 420, y: 520 });
// COSAS_CORRAL: las cosas para dar (abajo).
export const COSAS_CORRAL = (Object.keys(NECESIDADES) as Necesidad[]).map((n, i) => ({ n, x: 580 + i * 220, y: 800 }));
// BOTON_VENDER: vender los productos de la cesta.
export const BOTON_VENDER = { x: 1180, y: 160, w: 300, h: 80 };
// FRASES_PEDIDO: lo que dice Tito de lo que pide un animal.
const FRASES_PEDIDO: Readonly<Record<Necesidad, string>> = {
  comida: 'Tiene hambre. Dale trigo.',
  agua: 'Tiene sed. Dale el cubo de agua.',
  cepillo: 'Quiere que lo cepilles.',
};

// corral(): el corral de hoy; guarda(c): lo guarda en S.corral.
const corral = (): Corral => corralDe(S.corral, today());
function guarda(c: Corral): void {
  S.corral = { animales: [...c.animales], d: c.d, cuidados: [...c.cuidados], productos: { ...c.productos } };
  save();
}

SCENES.corral = {
  music: 'map',
  // enter(): la consigna, sin cosa elegida.
  enter(_o: OpcionesEscena) {
    CORRAL.cosa = null;
    this.prompt!();
  },
  // prompt(): lo que hay que hacer (o que hoy ya están todos cuidados).
  prompt() {
    const c = corral();
    if (c.animales.every((a) => c.cuidados.includes(a)))
      say('¡Hoy ya están todos contentos! Puedes vender los productos en el mercado.');
    else say('¡Este es mi corral! Mira qué pide cada animal: toca la cosa de abajo y luego el animal.');
  },
  // hint(): la cosa que pide el primer animal sin cuidar o, si ya hay cosa elegida, ese animal.
  hint() {
    const c = corral(),
      i = c.animales.findIndex((a) => !c.cuidados.includes(a));
    if (i < 0) return null;
    const pide = pedidoDe(c.animales[i]!, today());
    if (CORRAL.cosa === pide) return { ...animalCorral(i), r: 160 };
    const k = COSAS_CORRAL.find((o) => o.n === pide)!;
    return { x: k.x, y: k.y, r: 90 };
  },
  // draw(): el prado con la valla, cada animal (con su bocadillo si aún pide algo, o su producto), los sitios para
  // comprar, la cesta con los productos, el botón de vender y las cosas para dar.
  draw() {
    sky('#BFE6F8', '#E9F7D8');
    ctx.fillStyle = '#9ED36A';
    ctx.fillRect(0, 380, 1600, 520);
    ctx.fillStyle = '#C08A4C';
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => ctx.fillRect(40 + i * 190, 330, 18, 120));
    ctx.fillRect(30, 350, 1540, 14);
    ctx.fillRect(30, 400, 1540, 14);
    const c = corral(),
      hoy = today();
    ANIMALES_CORRAL.forEach((a, i) => {
      const p = animalCorral(i);
      if (!c.animales.includes(a.id)) {
        pic(a.id, p.x, p.y, 200, 0.3);
        card(p.x - 80, p.y + 110, 160, 56, '#FFFFFF', 5, 28);
        pic('moneda', p.x - 40, p.y + 138, 40);
        text(a.precio, p.x + 20, p.y + 150, 34, K);
        return;
      }
      const salta = CORRAL.salto === a.id && T - CORRAL.t < 0.6 ? Math.sin(((T - CORRAL.t) / 0.6) * Math.PI) * 40 : 0;
      hR(p.x - 130, p.y - 130, 260, 260);
      pic(a.id, p.x, p.y - salta, 240);
      if (c.cuidados.includes(a.id)) pic(a.producto, p.x + 110, p.y + 90, 80);
      else {
        card(p.x + 40, p.y - 230, 130, 110, '#FFFFFF', 5, 30);
        pic(NECESIDADES[pedidoDe(a.id, hoy)], p.x + 105, p.y - 175, 80);
      }
    });
    card(120, 150, 520, 100, '#F6E3C4', 5, 30);
    ANIMALES_CORRAL.forEach((a, i) => {
      pic(a.producto, 190 + i * 160, 200, 64);
      text(c.productos[a.producto] ?? 0, 250 + i * 160, 215, 36, K);
    });
    if (totalProductos(c)) botonExtra(BOTON_VENDER, 'Vender');
    COSAS_CORRAL.forEach((k) => {
      hR(k.x - 85, k.y - 85, 170, 170);
      circ(k.x, k.y, 80, CORRAL.cosa === k.n ? '#FFF1B2' : '#FFFFFF', CORRAL.cosa === k.n ? 8 : 5);
      pic(NECESIDADES[k.n], k.x, k.y, 110);
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> la casa de Tito; monedas -> tienda; vender; una cosa (se elige); un animal (se le da la cosa, o
  // Tito dice qué pide); un sitio vacío (se compra el animal si hay monedas).
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('casaTito', { volver: 1 });
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    const c = corral(),
      hoy = today();
    if (totalProductos(c) && tocaExtra(BOTON_VENDER, x, y)) {
      const r = vender(c);
      guarda(r.corral);
      SFX.tada();
      giveCoins(r.monedas, BOTON_VENDER.x + 150, BOTON_VENDER.y + 40);
      say('¡Hemos vendido todo en el mercado! Cada cosa vale una moneda.');
      return;
    }
    const k = COSAS_CORRAL.find((o) => dist(x, y, o.x, o.y) < 85);
    if (k) {
      SFX.pop();
      CORRAL.cosa = k.n;
      return;
    }
    const i = ANIMALES_CORRAL.findIndex((_, j) => dist(x, y, animalCorral(j).x, animalCorral(j).y) < 140);
    if (i < 0) return;
    const a = ANIMALES_CORRAL[i]!;
    if (!c.animales.includes(a.id)) {
      const r = comprar(c, a.id, S.coins || 0);
      if (!r.precio) {
        SFX.boing();
        say(fmt(COMPRA[a.id]!.falta, { n: a.precio }));
        return;
      }
      guarda(r.corral);
      spendCoins(r.precio, animalCorral(i).x, animalCorral(i).y);
      SFX.tada();
      burst(animalCorral(i).x, animalCorral(i).y, 40);
      say(COMPRA[a.id]!.ya);
      return;
    }
    if (!CORRAL.cosa) {
      SFX.tap();
      if (c.cuidados.includes(a.id)) say('Este ya está contento. Mañana pedirá otra cosa.');
      else say(FRASES_PEDIDO[pedidoDe(a.id, hoy)]);
      return;
    }
    const r = cuidar(c, a.id, CORRAL.cosa, hoy);
    CORRAL.cosa = null;
    if (r.pasa === 'ya') {
      say('Este ya está contento. Mañana pedirá otra cosa.');
      return;
    }
    if (r.pasa === 'otra') {
      SFX.boing();
      say(FRASES_PEDIDO[pedidoDe(a.id, hoy)]);
      return;
    }
    guarda(r.corral);
    apuntarDiario('corral');
    Object.assign(CORRAL, { salto: a.id, t: T });
    SFX.tada();
    burst(animalCorral(i).x, animalCorral(i).y - 60, 24);
    say(FRASES_PRODUCTO[a.producto] ?? '');
  },
} satisfies Escena;

// COMPRA: lo que dice Tito de los animales que se compran: si faltan monedas y al traerlo.
const COMPRA: Readonly<Record<string, { falta: string; ya: string }>> = {
  vaca: { falta: 'Para traer la vaca al corral hacen falta {n} monedas.', ya: '¡Ya tenemos una vaca en el corral!' },
  oveja: { falta: 'Para traer la oveja al corral hacen falta {n} monedas.', ya: '¡Ya tenemos una oveja en el corral!' },
};
// FRASES_PRODUCTO: lo que dice Tito cuando un animal da su producto.
const FRASES_PRODUCTO: Readonly<Record<string, string>> = {
  huevo: '¡Gracias! La gallina ha puesto un huevo.',
  leche: '¡Gracias! La vaca nos da leche.',
  queso: '¡Gracias! Con la leche de la oveja hacemos queso.',
};
