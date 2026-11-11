/*
 * escenas/pompas.ts: las pompas de jabón, un juego corto del patio (idea 16 de docs/IDEAS-MEJORA.md, fase P12b), la
 * escena SCENES.pompas. Se abre desde el menú de los juegos cortos (escenas/juegosCortos.ts). Tito sopla con el pompero
 * (y el niño sopla con él, de verdad) y suben pompas de colores (los de su edad, planPompas, dominio/juegosCortos.ts).
 * En cada ronda Tito pide un color y se explotan solo las pompas de ese color, tocándolas; si se toca una de otro
 * color, Tito dice de qué color es. Tres rondas, cada una con su color. Al final, como en los demás juegos del patio,
 * se apunta en S.cole con sus monedas (terminarEnElPatio) y salen el cartel y el botón «Otra vez». La casa vuelve al
 * menú de los juegos cortos. Practica los colores y la atención.
 * Exporta: POMPAS_ST (el estado de la partida, con las pompas en pantalla, para las pruebas) y pone SCENES.pompas.
 * Importa: el núcleo (dibujo, voz, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de
 * dominio/juegosCortos.ts, el fondo del patio y lo común del patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, velocidades y tiempos en la pantalla de
   1600x900, como en el resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  SCENES,
  SFX,
  T,
  VIVO,
  W,
  atHome,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  fmt,
  go,
  inCoinHUD,
  later,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
  tone,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { COLORES_POMPAS, planPompas, type RondaPompas } from '../dominio/juegosCortos.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, terminarEnElPatio } from './patioComun.ts';

/** Una pompa en pantalla: dónde está, su radio, su color, lo que sube por segundo, su vaivén y si ya ha explotado
 * (cuándo). */
interface Pompa {
  x: number;
  y: number;
  readonly r: number;
  readonly color: string;
  readonly vy: number;
  readonly fase: number;
  explota: number;
}

/** Las fases: Tito explica, se juega una ronda, Tito pide el color siguiente (espera) o se acaba. */
type FasePompas = 'intro' | 'juega' | 'espera' | 'fin';

// MEDIDAS: de dónde salen las pompas (la boca del pompero), cada cuánto sale una, dónde se pierden por arriba, cuántas
// puede haber a la vez y cuántas de cada cinco son del color que se pide (para que siempre haya).
const MEDIDAS = { x: 330, y: 640, cada: 0.55, techo: 90, maximo: 14, buenas: 2 };

// POMPAS_ST: el estado de la partida: la fase, los colores que salen, las rondas, la ronda, las explotadas en la ronda,
// las pompas en pantalla, cuándo salió la última, cuántas han salido y cuándo avisó Tito de un color equivocado.
export const POMPAS_ST = {
  fase: 'intro' as FasePompas,
  colores: [] as string[],
  rondas: [] as RondaPompas[],
  ronda: 0,
  explotadas: 0,
  pompas: [] as Pompa[],
  ultima: 0,
  salidas: 0,
  aviso: -9,
};

// sigue(): ¿se sigue en la escena de las pompas? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'pompas';
// ronda(): la ronda de ahora.
const ronda = (): RondaPompas | undefined => POMPAS_ST.rondas[POMPAS_ST.ronda];
// colorDe(id): el color con ese id.
const colorDe = (id: string) => COLORES_POMPAS.find((c) => c.id === id) ?? COLORES_POMPAS[0]!;

// pedir(): empieza la ronda de ahora: Tito pide su color.
function pedir(): void {
  const r = ronda();
  POMPAS_ST.fase = 'juega';
  POMPAS_ST.explotadas = 0;
  if (r) say(colorDe(r.color).pide);
}

// soltar(): sale una pompa nueva del pompero: de cada cinco, MEDIDAS.buenas son del color que se pide; las demás, de
// otro color de los que salen.
function soltar(): void {
  const s = POMPAS_ST,
    r = ronda(),
    otros = s.colores.filter((c) => c !== r?.color),
    buena = !otros.length || s.salidas % 5 < MEDIDAS.buenas,
    color = buena ? (r?.color ?? s.colores[0]!) : (otros[Math.floor(azar() * otros.length)] ?? otros[0]!);
  s.salidas++;
  s.ultima = T;
  s.pompas.push({
    x: MEDIDAS.x + 40,
    y: MEDIDAS.y - 40,
    r: 48 + azar() * 26,
    color,
    vy: 55 + azar() * 35,
    fase: azar() * 6,
    explota: 0,
  });
}

// mover(p, dt): la pompa p sube, se va hacia la derecha y se balancea; si sale por arriba, se pierde.
function mover(p: Pompa, dt: number): void {
  Object.assign(p, {
    y: p.y - p.vy * dt,
    x: p.x + (175 + Math.sin(T * 1.6 + p.fase) * 90) * dt,
  });
}

// explotar(p): se ha tocado la pompa p. Si es del color pedido, explota y cuenta (con todas las de la ronda, la ronda
// siguiente o el final); si no, Tito dice de qué color es (como mucho cada 2,5 segundos).
function explotar(p: Pompa): void {
  const s = POMPAS_ST,
    r = ronda();
  if (!r) return;
  if (p.color !== r.color) {
    SFX.boing();
    if (T - s.aviso > 2.5) {
      s.aviso = T;
      say(colorDe(p.color).es);
    }
    return;
  }
  Object.assign(p, { explota: T });
  s.explotadas++;
  tone(600 + s.explotadas * 60, 0.08, 'sine', 0.3);
  SFX.pop();
  sparkles(p.x, p.y, 10);
  if (s.explotadas < r.cuantas) return;
  s.fase = 'espera';
  s.ronda++;
  if (s.ronda < s.rondas.length)
    sayQ('¡Muy bien! Ahora, otro color.', () => {
      if (sigue()) later(300, pedir);
    });
  else acabar();
}

// acabar(): se han hecho las tres rondas: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  POMPAS_ST.fase = 'fin';
  terminarEnElPatio('pompas', W / 2, 400);
  say('¡Cuántas pompas has explotado! Conoces muy bien los colores. ¿Jugamos otra vez?');
}

// buscar(x, y): la pompa (sin explotar) que hay en (x, y), la de más arriba si hay varias.
const buscar = (x: number, y: number): Pompa | undefined =>
  [...POMPAS_ST.pompas].reverse().find((p) => !p.explota && dist(x, y, p.x, p.y) < p.r + 10);

// dibujaPompa(p): una pompa: transparente, con el borde y el brillo de su color; al explotar, un aro que crece y se va.
function dibujaPompa(p: Pompa): void {
  const c = colorDe(p.color).hex;
  ctx.save();
  if (p.explota) {
    const k = Math.min(1, (T - p.explota) / 0.3);
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = c;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1 + k * 0.6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.globalAlpha = 0.35;
  circ(p.x, p.y, p.r, c, 0);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.9)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r * 0.7, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
}

// dibujaPompero(): el aro del pompero en la mano de Tito.
function dibujaPompero(): void {
  ctx.save();
  ctx.strokeStyle = '#E07BB5';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(MEDIDAS.x - 40, MEDIDAS.y + 50);
  ctx.lineTo(MEDIDAS.x + 10, MEDIDAS.y - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(MEDIDAS.x + 26, MEDIDAS.y - 28, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

SCENES['pompas'] = {
  music: 'jardin',
  // enter(): una partida nueva con sus colores y rondas (planPompas); Tito lo explica (y pide soplar de verdad) y pide
  // el primer color.
  enter(_o: OpcionesEscena) {
    const plan = planPompas(AGE(), azar);
    Object.assign(POMPAS_ST, { fase: 'intro', colores: plan.colores, rondas: plan.rondas, ronda: 0, explotadas: 0 });
    Object.assign(POMPAS_ST, { pompas: [], ultima: T, salidas: 0, aviso: -9 });
    later(400, () =>
      sayQ(
        '¡Pompas de jabón! Sopla conmigo, fuerte, para hacer muchas pompas. Explota solo las del color que te diga.',
        () => {
          if (sigue()) pedir();
        },
      ),
    );
  },
  // update(dt): salen pompas del pompero (mientras se juega o se espera), suben y se balancean; se quitan las que han
  // explotado o se han ido por arriba. La ayuda automática no sale mientras Tito explica.
  update(dt: number) {
    const s = POMPAS_ST;
    if (s.fase === 'intro' || s.fase === 'espera') VIVO.idle = 0;
    const vivas = s.pompas.filter((p) => !p.explota).length;
    if (s.fase !== 'fin' && T - s.ultima > MEDIDAS.cada && vivas < MEDIDAS.maximo) soltar();
    s.pompas.forEach((p) => mover(p, dt));
    s.pompas = s.pompas.filter((p) => (p.explota ? T - p.explota < 0.3 : p.y > MEDIDAS.techo && p.x < W + 80));
  },
  // prompt(): repite el color que se pide.
  prompt() {
    const r = ronda();
    if (POMPAS_ST.fase === 'fin') say('Toca la flecha para jugar otra vez.');
    else if (r) say(colorDe(r.color).pide);
  },
  // hint(): mientras se juega, una pompa del color pedido (la más baja, que durará más); al final, el botón de otra vez.
  hint() {
    const s = POMPAS_ST,
      r = ronda();
    if (s.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    if (s.fase !== 'juega' || !r) return null;
    const p = s.pompas
      .filter((q) => !q.explota && q.color === r.color && q.y > 160 && q.x > MEDIDAS.x + 80)
      .sort((a, b) => b.y - a.y)[0];
    return p ? { x: p.x, y: p.y, r: p.r } : null;
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, Tito con el pompero, las pompas, el color que se pide, las rondas y, al final, el botón de otra
  // vez.
  draw() {
    fondoPatio();
    const s = POMPAS_ST,
      r = ronda();
    drawTito(MEDIDAS.x - 260, MEDIDAS.y - 150, 240, { bubble: false });
    dibujaPompero();
    s.pompas.forEach(dibujaPompa);
    dibujaRondas(s.rondas.length, s.ronda);
    if (r && s.fase !== 'fin') {
      card(W / 2 - 150, 110, 300, 90, '#fff', 6, 45);
      circ(W / 2 - 80, 155, 32, colorDe(r.color).hex, 5);
      text(fmt('{a} / {b}', { a: String(s.explotadas), b: String(r.cuantas) }), W / 2 + 40, 172, 46);
    }
    if (s.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> los juegos cortos; monedas -> tienda; al final, otra vez; mientras se juega, una pompa se
  // explota (si es del color pedido); si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('juegosCortos');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    const s = POMPAS_ST;
    if (s.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    const p = s.fase === 'juega' ? buscar(x, y) : undefined;
    if (p) {
      explotar(p);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
