/*
 * escenas/casaNoches.ts: «Buenas noches» (fase C5 de docs/PLAN-CASA.md), la escena SCENES.casaNoches. Se abre cuando
 * Tito acaba de tumbarse en la cama de su casa (REACCIONES en dominio/casa.ts: escena 'buenasNoches'). Tito está en la
 * cama. Si tiene el cuento, al tocarlo Tito cuenta uno cortito (CUENTO_NOCHE); al tocar la lámpara se apaga la luz,
 * suena una nana, brillan las estrellas del techo y Tito se duerme (salen zetas); la ventana trae la mañana: se
 * enciende la luz y Tito dice «¡Buenos días!». Sin fallos ni tiempo. La casa (arriba a la izquierda) vuelve a la casa.
 * Exporta: NOCHES (la cama, la lámpara, el cuento y la ventana) y CUENTO_NOCHE, y pone SCENES.casaNoches.
 * Importa: el núcleo (dibujo, voz, sonido, toque) y TUNES y playTune de juegos/.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  S,
  SCENES,
  SFX,
  T,
  atHome,
  card,
  circ,
  ctx,
  dist,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  later,
  parts,
  pic,
  rnd,
  say,
  sayQ,
  sparkles,
  star,
} from '../nucleo/indice.ts';
import { TUNES, playTune } from '../juegos/indice.ts';

// NOCHES: la cama (centro), la lámpara, el cuento y la ventana.
export const NOCHES = {
  cama: { x: 760, y: 620 },
  lampara: { x: 1300, y: 520 },
  cuento: { x: 1300, y: 760 },
  ventana: { x: 380, y: 230 },
};
// CUENTO_NOCHE: el cuento de buenas noches, frase a frase.
export const CUENTO_NOCHE: readonly string[] = [
  'Había una vez una estrella pequeñita que no podía dormir.',
  'La Luna le cantó una nana muy bajito.',
  'La estrella cerró los ojos, brilló un poquito y se quedó dormida.',
  'Y colorín colorado, este cuento se ha acabado.',
];
// ESTRELLAS_TECHO: dónde están las estrellas del techo.
const ESTRELLAS_TECHO: readonly (readonly [number, number])[] = [
  [620, 90],
  [760, 140],
  [900, 80],
  [1040, 150],
  [1180, 90],
  [700, 220],
  [980, 230],
];

// BUENAS NOCHES: estado: noche (luz apagada), duerme (hora T a la que se durmió, o -1) y cuenta (si está contando el cuento).
SCENES.casaNoches = {
  music: null,
  // enter(): de día, con la luz encendida y Tito en la cama.
  enter() {
    this.noche = false;
    this.duerme = -1;
    this.cuenta = false;
    later(400, () =>
      sayQ(
        S.owned?.['cuento']
          ? '¿Me cuentas un cuento? Toca el libro. Luego, apaga la lámpara.'
          : 'Cuando quieras, apaga la lámpara para dormir.',
      ),
    );
  },
  // prompt(): qué hacer, según sea de día o de noche.
  prompt() {
    say(this.noche ? 'Toca la ventana para que se haga de día.' : 'Toca la lámpara para apagar la luz.');
  },
  // contar(i): cuenta la frase i del cuento y sigue con la siguiente.
  contar(i: number) {
    if (i >= CUENTO_NOCHE.length || this.noche) {
      this.cuenta = false;
      return;
    }
    say(CUENTO_NOCHE[i], () => this.contar!(i + 1));
  },
  // draw(): la habitación (oscura de noche), la ventana (sol o luna), las estrellas del techo (brillan de noche), la
  // cama con Tito (dormido de noche, con zetas), la lámpara, el cuento si lo tiene y la casa.
  draw() {
    const n = this.noche as boolean;
    ctx.fillStyle = n ? '#2B2A55' : '#EDE7FF';
    ctx.fillRect(0, 0, 1600, 900);
    ctx.fillStyle = n ? '#3A3666' : '#E6D3B8';
    ctx.fillRect(0, 700, 1600, 200);
    const v = NOCHES.ventana;
    card(v.x - 160, v.y - 130, 320, 260, n ? '#141236' : '#BFEAF7', 6, 12);
    if (n) pic('luna', v.x, v.y, 120);
    else pic('sol', v.x, v.y, 130);
    ESTRELLAS_TECHO.forEach(([x, y], i) => {
      if (n) circ(x, y, 26, 'rgba(255,243,176,.25)', 0);
      star(x, y, n ? 20 + Math.sin(T * 3 + i) * 3 : 14, n ? '#FFE08A' : '#D9D2F0', 0);
    });
    const c = NOCHES.cama;
    card(c.x - 330, c.y - 140, 60, 280, '#8A5A3A', 5, 14);
    card(c.x - 300, c.y - 20, 620, 120, '#5B8DEF', 6, 24);
    drawTito(c.x - 180, c.y - 200, 300, { sleep: n, sq: n ? 0.08 : 0 });
    card(c.x - 300, c.y - 10, 620, 130, '#7FA8F0', 6, 24);
    card(c.x - 270, c.y - 60, 150, 70, '#FFFFFF', 5, 30);
    if (n && T - this.duerme > 1 && Math.floor(T * 30) % 45 === 0)
      parts.push({
        x: c.x,
        y: c.y - 200,
        vx: rnd(10, 30),
        vy: -50,
        life: 2.5,
        t: 0,
        c: '#BFD3FF',
        r: 26,
        rot: 0,
        k: 'z',
        g: 0,
      });
    const l = NOCHES.lampara,
      sl = hv('lamp', hC(l.x, l.y, 80));
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.scale(sl, sl);
    if (!n) circ(0, -70, 110, 'rgba(255,224,138,.3)', 0);
    pic('lampara', 0, 0, 200);
    ctx.restore();
    if (S.owned?.['cuento']) {
      const k = NOCHES.cuento,
        s = hv('cuento', hC(k.x, k.y, 70));
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.scale(s, s);
      pic('cuento', 0, 0, 130);
      ctx.restore();
    }
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; el cuento lo cuenta Tito (de día); la lámpara apaga la luz y Tito se
  // duerme con la nana; la ventana (de noche) trae la mañana.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    if (S.owned?.['cuento'] && !this.noche && !this.cuenta && dist(x, y, NOCHES.cuento.x, NOCHES.cuento.y) < 80) {
      SFX.pop();
      this.cuenta = true;
      this.contar!(0);
      return;
    }
    if (!this.noche && dist(x, y, NOCHES.lampara.x, NOCHES.lampara.y - 40) < 110) {
      SFX.tap();
      this.noche = true;
      this.duerme = T;
      this.cuenta = false;
      say('Buenas noches. ¡Hasta mañana!', () => playTune(TUNES.meses, 70, 0.18));
      return;
    }
    if (this.noche && Math.abs(x - NOCHES.ventana.x) < 170 && Math.abs(y - NOCHES.ventana.y) < 140) {
      SFX.sparkle();
      this.noche = false;
      this.duerme = -1;
      sparkles(NOCHES.ventana.x, NOCHES.ventana.y, 10);
      say('¡Buenos días! ¡Qué bien he dormido!');
    }
  },
};
