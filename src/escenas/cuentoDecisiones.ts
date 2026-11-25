/*
 * escenas/cuentoDecisiones.ts: los cuentos en los que el niño decide, SCENES.cuentoDecisiones. Empezó como el cuento
 * opcional de las casitas (v0.2.167: «La bellota perdida», dos decisiones y dos finales, con el botón «Cuento con
 * decisiones» de la casita, BOTON_CUENTO); desde la fase P33 de docs/IDEAS-MEJORA.md (idea 27) es una biblioteca de
 * cuentos (contenido/cuentosDecisiones.ts). Se elige un cuento por su portada; en cada página Tito lee y, si hay que
 * decidir, salen dos tarjetas con su dibujo (para los que aún no leen) y lo que dicen. Todos los finales son buenos:
 * el primero que se descubre de cada uno da 2 monedas y queda apuntado (S.cuentosDec), y en la biblioteca y en el final
 * se ven los finales encontrados, para animar a leer otra vez y elegir otras cosas. Las reglas, en
 * dominio/cuentosDecisiones.ts.
 * La casa vuelve de una página a la biblioteca y de la biblioteca a la casita de la que se vino (o al mapa).
 * Exporta: BOTON_CUENTO (lo dibuja la casita) y, para las pruebas, CDEC (el estado), tarjetaCuento, OPCIONES_CUENTO y
 * BOTONES_FIN; pone SCENES.cuentoDecisiones al cargarse.
 * Importa: del núcleo, lo que dibuja, suena y habla, S y las monedas; botonExtra y tocaExtra; los cuentos y sus reglas.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  S,
  SCENES,
  SFX,
  atHome,
  card,
  circ,
  drawCoinHUD,
  drawHome,
  giveCoins,
  go,
  hR,
  inCoinHUD,
  pic,
  save,
  say,
  sayQ,
  sky,
  text,
} from '../nucleo/indice.ts';
import { botonExtra, tocaExtra } from './botonesExtras.ts';
import { CUENTOS_DECISION } from '../contenido/cuentosDecisiones.ts';
import {
  apuntarFinal,
  finalesDe,
  registroCuentos,
  vistosDe,
  type CuentoDecision,
  type PaginaDecision,
} from '../dominio/cuentosDecisiones.ts';
import { apuntarDiario } from './diario.ts';

// BOTON_CUENTO: el botón «Cuento con decisiones» de la casita (escenas/zonas.ts y mundo3d/casita3d.ts).
export const BOTON_CUENTO = { x: 1120, y: 68, w: 285, h: 68 };
// OPCIONES_CUENTO: las dos tarjetas de una decisión; BOTONES_FIN: «Leer de nuevo» y «Otro cuento» en un final.
export const OPCIONES_CUENTO = [
  { x: 330, y: 610, w: 440, h: 220 },
  { x: 830, y: 610, w: 440, h: 220 },
] as const;
export const BOTONES_FIN = [
  { x: 380, y: 700, w: 390, h: 95 },
  { x: 830, y: 700, w: 390, h: 95 },
] as const;

/** El estado: la casita de la que se vino, la biblioteca o el cuento abierto (su número) y la página. */
export const CDEC = { tema: '', cuento: -1, pagina: 'inicio' };

// tarjetaCuento(i): el rectángulo de la portada del cuento i en la biblioteca (en fila).
export function tarjetaCuento(i: number): { x: number; y: number; w: number; h: number } {
  const n = CUENTOS_DECISION.length;
  return { x: 800 + (i - (n - 1) / 2) * 460 - 200, y: 230, w: 400, h: 450 };
}

// cuento(): el cuento abierto (o null en la biblioteca); pagina(): su página de ahora.
const cuento = (): CuentoDecision | null => CUENTOS_DECISION[CDEC.cuento] ?? null;
const pagina = (): PaginaDecision | null => cuento()?.paginas[CDEC.pagina] ?? null;
// vistos(c): los finales del cuento c que ya se han descubierto.
const vistos = (c: CuentoDecision): string[] => vistosDe(registroCuentos(S.cuentosDec), c);

// puntos(c, x, y): un círculo por final del cuento c, relleno si ya se ha descubierto, centrados en (x, y).
function puntos(c: CuentoDecision, x: number, y: number): void {
  const finales = finalesDe(c),
    v = vistos(c);
  finales.forEach((f, i) =>
    circ(x + (i - (finales.length - 1) / 2) * 44, y, 15, v.includes(f) ? '#FFC93C' : '#FFFFFF', 4),
  );
}

// abre(i): abre el cuento i por el principio.
function abre(i: number): void {
  Object.assign(CDEC, { cuento: i, pagina: 'inicio' });
  say(pagina()!.frase);
}

// biblioteca(): vuelve a la biblioteca, con su consigna.
function biblioteca(): void {
  CDEC.cuento = -1;
  say('¿Qué cuento leemos? Toca uno.');
}

// llega(clave): pasa a la página clave; si es un final, lo apunta (con sus monedas si es nuevo) y Tito lo celebra.
function llega(clave: string): void {
  const c = cuento();
  if (!c) return;
  CDEC.pagina = clave;
  const p = pagina()!;
  if (p.opciones) {
    say(p.frase);
    return;
  }
  apuntarDiario('cuento'); // el diario de Tito (idea 35, escenas/diario.ts)
  const r = apuntarFinal(registroCuentos(S.cuentosDec), c, clave);
  if (!r.nuevo) {
    say(p.frase);
    return;
  }
  S.cuentosDec = Object.fromEntries(Object.entries(r.reg).map(([k, v]) => [k, [...v]]));
  save();
  SFX.tada();
  giveCoins(r.monedas, 800, 320);
  const todos = vistos(c).length === finalesDe(c).length;
  say(p.frase, () =>
    sayQ(
      todos
        ? '¡Has descubierto todos los finales de este cuento!'
        : '¡Un final nuevo! Lee otra vez y elige otras cosas para descubrir los demás.',
    ),
  );
}

// dibujaBiblioteca(): la biblioteca: una portada por cuento, con su título y los finales descubiertos.
function dibujaBiblioteca(): void {
  sky('#D1F0FF', '#EDF6CE');
  card(500, 50, 600, 100, '#FFFFFF', 5, 40);
  text('Elige un cuento', 800, 120, 54, K, { max: 560 });
  CUENTOS_DECISION.forEach((c, i) => {
    const r = tarjetaCuento(i);
    hR(r.x, r.y, r.w, r.h);
    card(r.x, r.y, r.w, r.h, '#FFFFFF', 6, 34);
    pic(c.portada, r.x + r.w / 2, r.y + 160, 220);
    text(c.titulo, r.x + r.w / 2, r.y + 340, 38, K, { max: r.w - 40 });
    puntos(c, r.x + r.w / 2, r.y + 400);
  });
}

// dibujaPagina(c, p): una página: el título, sus dibujos, lo que lee Tito y, si hay que decidir, las dos tarjetas; si
// es un final, los finales descubiertos y los botones de leer otra vez y de otro cuento.
function dibujaPagina(c: CuentoDecision, p: PaginaDecision): void {
  sky(c.cielo[0], c.cielo[1]);
  text(c.titulo, 800, 120, 58, K, { max: 900 });
  p.dibujos.forEach((d, i) => pic(d, 800 + (i - (p.dibujos.length - 1) / 2) * 300, 320, 250));
  text(p.frase, 800, 540, 44, '#293C31', { max: 1300 });
  if (p.opciones) {
    p.opciones.forEach((o, i) => {
      const r = OPCIONES_CUENTO[i]!;
      hR(r.x, r.y, r.w, r.h);
      card(r.x, r.y, r.w, r.h, '#FFF1B2', 5, 30);
      pic(o.dibujo, r.x + r.w / 2, r.y + 88, 130);
      text(o.texto, r.x + r.w / 2, r.y + 195, 36, '#293C31', { max: r.w - 30 });
    });
    return;
  }
  puntos(c, 800, 640);
  botonExtra(BOTONES_FIN[0], 'Leer de nuevo');
  botonExtra(BOTONES_FIN[1], 'Otro cuento');
}

SCENES.cuentoDecisiones = {
  // enter(o): recuerda la casita de la que se viene y abre la biblioteca.
  enter(o: OpcionesEscena) {
    CDEC.tema = o.t ?? '';
    biblioteca();
  },
  // prompt(): la consigna de la biblioteca o lo que dice la página de ahora.
  prompt() {
    const p = pagina();
    if (p) say(p.frase);
    else say('¿Qué cuento leemos? Toca uno.');
  },
  // hint(): en la biblioteca, el primer cuento con finales por descubrir; en un final al que le quedan otros, «Leer de
  // nuevo». Al decidir no hay ayuda: todas las opciones valen.
  hint() {
    const c = cuento();
    if (!c) {
      const i = CUENTOS_DECISION.findIndex((x) => vistos(x).length < finalesDe(x).length);
      const r = tarjetaCuento(Math.max(0, i));
      return { x: r.x + r.w / 2, y: r.y + r.h / 2, r: 200 };
    }
    if (pagina()?.opciones || vistos(c).length >= finalesDe(c).length) return null;
    const b = BOTONES_FIN[0];
    return { x: b.x + b.w / 2, y: b.y + b.h / 2, r: 110 };
  },
  // draw(): la biblioteca o la página; la casa y las monedas.
  draw() {
    const c = cuento(),
      p = pagina();
    if (c && p) dibujaPagina(c, p);
    else dibujaBiblioteca();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> la biblioteca (o, desde ella, la casita o el mapa); monedas -> la tienda; en la biblioteca, un
  // cuento; en una página, una opción; en un final, leer otra vez u otro cuento.
  down(x: number, y: number) {
    const c = cuento(),
      p = pagina();
    if (atHome(x, y)) {
      SFX.whoosh();
      if (c) biblioteca();
      else if (CDEC.tema) go('casita', { t: CDEC.tema });
      else go('map');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (!c || !p) {
      const i = CUENTOS_DECISION.findIndex((_, j) => tocaExtra(tarjetaCuento(j), x, y));
      if (i >= 0) {
        SFX.pop();
        abre(i);
      }
      return;
    }
    if (p.opciones) {
      const i = OPCIONES_CUENTO.findIndex((r) => tocaExtra(r, x, y));
      if (i >= 0) {
        SFX.pop();
        llega(p.opciones[i]!.va);
      }
      return;
    }
    if (tocaExtra(BOTONES_FIN[0], x, y)) {
      SFX.pop();
      abre(CDEC.cuento);
    } else if (tocaExtra(BOTONES_FIN[1], x, y)) {
      SFX.pop();
      biblioteca();
    }
  },
} satisfies Escena;
