/*
 * escenas/linterna.ts: la linterna de noche (idea 24 de docs/IDEAS-MEJORA.md, fase P29), la escena SCENES.linterna. Se
 * llega desde la tienda de campaña del mapa 3D, al pie del monte (mundo3d/acampada3d.ts). Tito se ha ido de acampada y
 * es de noche: el bosque está a oscuras y el niño mueve la linterna (con el dedo o el ratón) para buscar a los animales
 * de la noche escondidos detrás de los árboles, los arbustos y las piedras. Al alumbrar uno un momento (o tocarlo con la
 * luz encima) sale y Tito dice su dato curioso. Con 3 años les brillan mucho los ojos en la oscuridad; con 4, poco; con
 * 5, nada. Las luciérnagas brillan solas y, de vez en cuando, cruza el cielo una estrella fugaz que se puede tocar. Al
 * encontrarlos a todos, 2 monedas (MONEDAS.juegoRepetido) y de vuelta al mapa. Las reglas, en dominio/linterna.ts.
 * Es una escena 2D.
 * Exporta: LINTERNA_ST (la noche de ahora) y, para las pruebas, sitioAnimalNoche y fugazEnPantalla; pone
 * SCENES.linterna al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, Tito, monedas y escenas) y las reglas de dominio/linterna.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y colores en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  AGE,
  H,
  PI,
  SCENES,
  SFX,
  T,
  VIVO,
  W,
  atHome,
  burst,
  card,
  circ,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  giveCoins,
  go,
  inCoinHUD,
  later,
  pic,
  say,
  sceneName,
  sparkles,
  star,
} from '../nucleo/indice.ts';
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import { azar } from '../aplicacion/puertos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import { ANIMALES_NOCHE, LINTERNA, enLaLuz, hayFugaz, planLinterna, type PlanLinterna } from '../dominio/linterna.ts';

/** Un escondite del bosque: dónde está el animal y qué lo tapa (en una rama no lo tapa nada). */
interface Escondite {
  readonly x: number;
  readonly y: number;
  readonly tapa: 'rama' | 'arbusto' | 'roca' | 'tronco';
}
// ESCONDITES: los escondites del bosque (los mismos números que dominio/linterna.ts reparte), lejos de la tienda de
// campaña (abajo a la izquierda) y de los botones de arriba.
const ESCONDITES: readonly Escondite[] = [
  { x: 470, y: 300, tapa: 'rama' },
  { x: 660, y: 640, tapa: 'arbusto' },
  { x: 900, y: 720, tapa: 'roca' },
  { x: 1190, y: 290, tapa: 'rama' },
  { x: 1260, y: 680, tapa: 'tronco' },
  { x: 1460, y: 560, tapa: 'arbusto' },
  { x: 800, y: 460, tapa: 'roca' },
  { x: 1050, y: 520, tapa: 'arbusto' },
];

// FRASES: lo que dice Tito (frases enteras, para traducirlas bien).
const INTRO = '¡Nos vamos de acampada! Ya es de noche. Mueve la linterna para buscar a los animales de la noche.',
  AYUDA = 'Mueve la linterna por el bosque para buscar a los animales de la noche.',
  FIN = '¡Has encontrado a todos los animales de la noche! ¡Qué buena vista tienes!',
  FUGAZ = '¡Una estrella fugaz! Cierra los ojos y pide un deseo.';

/** La noche de ahora: el plan, dónde está la luz, cuánto lleva alumbrado cada animal, cuándo se encontró cada uno, la
 * fase, cuándo empezó y la última estrella fugaz tocada. */
export const LINTERNA_ST = {
  plan: null as PlanLinterna | null,
  luz: { x: 800, y: 450 },
  alumbrado: [] as number[],
  encontrados: [] as number[],
  fase: 'busca' as 'busca' | 'fin',
  inicio: 0,
  fugazTocada: -100,
};

// ESTRELLAS: las estrellas fijas del cielo (siempre las mismas).
const ESTRELLAS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 397) % W,
  y: 20 + ((i * 131) % 220),
  r: 1.5 + (i % 3),
}));
// LUCIERNAGAS: dónde revolotea cada luciérnaga (alrededor de su sitio).
const LUCIERNAGAS = Array.from({ length: 14 }, (_, i) => ({ x: 380 + ((i * 263) % 1150), y: 360 + ((i * 89) % 380) }));

// sitioAnimalNoche(i): dónde está el animal i de esta noche (su centro en la pantalla), o null (para las pruebas y la
// ayuda).
export function sitioAnimalNoche(i: number): { x: number; y: number } | null {
  const a = LINTERNA_ST.plan?.animales[i],
    e = a && ESCONDITES[a.sitio];
  return e ? { x: e.x, y: e.y - 30 } : null;
}

// fugazEnPantalla(): dónde está ahora la estrella fugaz, o null si no está cruzando el cielo.
export function fugazEnPantalla(): { x: number; y: number } | null {
  const k = hayFugaz(T - LINTERNA_ST.inicio);
  return k === null ? null : { x: 1200 - k * 900, y: 150 + k * 130 };
}

// fondoNoche(): el cielo de noche, el monte al fondo y el suelo del bosque (la luna y las estrellas, en cielo()).
function fondoNoche(): void {
  const g = ctx.createLinearGradient(0, 0, 0, 420);
  g.addColorStop(0, '#0E1638');
  g.addColorStop(1, '#2B3C6E');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 420);
  ctx.fillStyle = '#26365C';
  ctx.beginPath();
  ctx.moveTo(250, 420);
  ctx.lineTo(620, 170);
  ctx.lineTo(980, 420);
  ctx.fill();
  ctx.fillStyle = '#2E4A3A';
  ctx.fillRect(0, 400, W, H - 400);
}

// cielo(): la luna y las estrellas que titilan, encima de la oscuridad (se ven aunque no las alumbre la linterna).
function cielo(): void {
  ESTRELLAS.forEach((s, i) => circ(s.x, s.y, s.r * (0.8 + 0.3 * Math.sin(T * 2 + i)), '#FFF7D6', 0));
  const g = ctx.createRadialGradient(1300, 150, 40, 1300, 150, 110);
  g.addColorStop(0, 'rgba(255, 247, 214, 0.25)');
  g.addColorStop(1, 'rgba(255, 247, 214, 0)');
  circ(1300, 150, 110, g, 0);
  pic('luna', 1300, 150, 130);
}

// arbol(x): un árbol del bosque con su rama (donde se posan el búho o el murciélago).
function arbol(x: number): void {
  card(x - 30, 230, 60, 380, '#5A3E2B', 0, 12);
  ctx.fillStyle = '#5A3E2B';
  ctx.fillRect(x - 10, 320, 150, 22);
  circ(x, 180, 120, '#2F6B45');
  circ(x - 80, 230, 80, '#2F6B45');
  circ(x + 80, 230, 80, '#2F6B45');
}

// tapa(e): lo que tapa un escondite (un arbusto, una roca o un tronco caído), delante del animal.
function tapa(e: Escondite): void {
  if (e.tapa === 'arbusto') {
    [-60, 0, 60].forEach((d, i) => circ(e.x + d, e.y + 30 - (i === 1 ? 20 : 0), 62, '#3E8A55'));
  }
  if (e.tapa === 'roca') {
    ctx.fillStyle = '#8D8A86';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + 40, 110, 60, 0, PI, 0);
    ctx.fill();
  }
  if (e.tapa === 'tronco') card(e.x - 120, e.y + 10, 240, 64, '#6E4B33', 4, 32);
}

// murcielago(x, y, s): un murciélago colgado cabeza abajo, con las alas plegadas que se mueven un poco.
function murcielago(x: number, y: number, s: number): void {
  const k = s / 120,
    a = Math.sin(T * 3) * 0.15;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#5B4A7A';
  [-1, 1].forEach((l) => {
    ctx.save();
    ctx.scale(l, 1);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(55, -30);
    ctx.lineTo(40, 10);
    ctx.lineTo(20, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 42, 0, 0, PI * 2);
  ctx.fill();
  circ(0, 38, 24, '#5B4A7A');
  [-1, 1].forEach((l) => {
    circ(l * 9, 40, 6, '#FFFFFF');
    circ(l * 9, 42, 3, '#1A1A1A');
  });
  ctx.restore();
}

// animal(i, x, y): pinta el animal i de esta noche en (x, y) (el murciélago, dibujado aquí; los demás, con su dibujo).
function animal(id: string, x: number, y: number): void {
  if (id === 'murcielago') murcielago(x, y, 120);
  else pic(id, x, y, 130);
}

// ojos(x, y, fuerza): los ojos que brillan en la oscuridad (fuerza de 0 a 1).
function ojos(x: number, y: number, fuerza: number): void {
  const parpadeo = Math.sin(T * 1.3 + x) > 0.95 ? 0.1 : 1;
  [-14, 14].forEach((d) => circ(x + d, y - 10, 7, `rgba(255, 230, 120, ${fuerza * parpadeo})`, 0));
}

// oscuridad(): la noche encima de todo menos el círculo de la linterna, con el borde de la luz suave.
function oscuridad(): void {
  const { x, y } = LINTERNA_ST.luz,
    r = LINTERNA.radio;
  ctx.save();
  ctx.fillStyle = 'rgba(4, 8, 24, 0.86)';
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.arc(x, y, r, 0, PI * 2);
  ctx.fill('evenodd');
  const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r + 2);
  g.addColorStop(0, 'rgba(4, 8, 24, 0)');
  g.addColorStop(1, 'rgba(4, 8, 24, 0.86)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r + 2, 0, PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 244, 190, 0.12)';
  ctx.fill();
  ctx.restore();
}

// acampada(): la tienda de campaña con la hoguera y Tito, abajo a la izquierda (los alumbra la hoguera).
function acampada(): void {
  ctx.fillStyle = '#E8833A';
  ctx.beginPath();
  ctx.moveTo(60, 860);
  ctx.lineTo(190, 640);
  ctx.lineTo(320, 860);
  ctx.fill();
  ctx.fillStyle = '#7A3E1C';
  ctx.beginPath();
  ctx.moveTo(150, 860);
  ctx.lineTo(190, 760);
  ctx.lineTo(230, 860);
  ctx.fill();
  const f = 1 + Math.sin(T * 12) * 0.12,
    g = ctx.createRadialGradient(420, 830, 10, 420, 830, 260);
  g.addColorStop(0, 'rgba(255, 170, 60, 0.35)');
  g.addColorStop(1, 'rgba(255, 170, 60, 0)');
  circ(420, 830, 260, g, 0);
  [-0.4, 0.4].forEach((a) => {
    ctx.save();
    ctx.translate(420, 860);
    ctx.rotate(a);
    card(-50, -9, 100, 18, '#6E4B33', 0, 9);
    ctx.restore();
  });
  circ(420, 832, 30 * f, '#FF8A3C', 0);
  circ(420, 826, 20 * f, '#FFB43C', 0);
  circ(420, 822, 10 * f, '#FFE27A', 0);
  drawTito(580, 735, 170);
}

// encuentra(i): se ha encontrado el animal i: sale con estrellas y Tito dice su dato; si ya están todos, el final.
function encuentra(i: number): void {
  const st = LINTERNA_ST,
    a = st.plan?.animales[i];
  if (!a || st.encontrados[i]) return;
  st.encontrados[i] = T;
  const p = sitioAnimalNoche(i)!;
  SFX.good();
  burst(p.x, p.y, 18);
  const todos = st.plan!.animales.every((_, j) => st.encontrados[j]);
  say(ANIMALES_NOCHE.find((x) => x.id === a.id)!.dato, () => {
    if (todos && sceneName === 'linterna' && st.fase === 'busca') fin();
  });
}

// fin(): todos encontrados: Tito lo celebra, 2 monedas y, al poco, de vuelta al mapa.
function fin(): void {
  LINTERNA_ST.fase = 'fin';
  SFX.tada();
  say(FIN);
  later(1000, () => giveCoins(MONEDAS.juegoRepetido, 800, 380));
  later(5000, () => {
    if (sceneName === 'linterna' && LINTERNA_ST.fase === 'fin') go('map');
  });
}

// mueveLuz(x, y): la linterna va adonde está el dedo.
function mueveLuz(x: number, y: number): void {
  Object.assign(LINTERNA_ST.luz, { x, y });
}

SCENES['linterna'] = {
  music: 'map',
  // enter(): una noche nueva con el plan de la edad; la luz, en el centro; Tito explica.
  enter(_o: OpcionesEscena) {
    Object.assign(LINTERNA_ST, {
      plan: planLinterna(AGE(), azar),
      luz: { x: 800, y: 450 },
      alumbrado: [],
      encontrados: [],
      fase: 'busca',
      inicio: T,
      fugazTocada: -100,
    });
    later(400, () => this.prompt!());
  },
  // prompt(): la primera vez, la explicación; después, la ayuda.
  prompt() {
    say(T - LINTERNA_ST.inicio < 3 ? INTRO : AYUDA);
  },
  // hint(): el primer animal que falta por encontrar.
  hint() {
    const i = (LINTERNA_ST.plan?.animales ?? []).findIndex((_, j) => !LINTERNA_ST.encontrados[j]);
    const p = i >= 0 ? sitioAnimalNoche(i) : null;
    return p ? { ...p, r: 90 } : null;
  },
  // update(dt): con ratón, la luz sigue al puntero; el animal alumbrado un momento sale.
  update(dt: number) {
    const st = LINTERNA_ST;
    if (VIVO.mouseOn) mueveLuz(st.luz.x + (VIVO.MX - st.luz.x) * 0.5, st.luz.y + (VIVO.MY - st.luz.y) * 0.5);
    if (st.fase !== 'busca') return;
    (st.plan?.animales ?? []).forEach((_, i) => {
      const p = sitioAnimalNoche(i);
      if (!p || st.encontrados[i]) return;
      st.alumbrado[i] = enLaLuz(st.luz, p) ? (st.alumbrado[i] ?? 0) + dt : 0;
      if ((st.alumbrado[i] ?? 0) > LINTERNA.alumbrar) encuentra(i);
    });
  },
  // draw(): el bosque de noche con los animales escondidos, la oscuridad con el círculo de la linterna, los ojos que
  // brillan, los animales encontrados, las luciérnagas, la estrella fugaz, la acampada, la casa y las monedas.
  draw() {
    const st = LINTERNA_ST,
      plan = st.plan;
    fondoNoche();
    [470, 1190].forEach(arbol);
    (plan?.animales ?? []).forEach((a, i) => {
      const e = ESCONDITES[a.sitio]!;
      if (!st.encontrados[i]) animal(a.id, e.x, e.y - 30);
    });
    ESCONDITES.forEach(tapa);
    oscuridad();
    const fuerza = { mucho: 0.9, poco: 0.35, nada: 0 }[plan?.brillo ?? 'nada'];
    (plan?.animales ?? []).forEach((a, i) => {
      const e = ESCONDITES[a.sitio]!;
      if (st.encontrados[i]) {
        const b = 1 + 0.15 * Math.max(0, 1 - (T - st.encontrados[i]!) * 2);
        ctx.save();
        ctx.translate(e.x, e.y - 30);
        ctx.scale(b, b);
        animal(a.id, 0, 0);
        ctx.restore();
        star(e.x + 60, e.y - 90, 18, '#FFC93C', 3);
      } else if (fuerza) ojos(e.x, e.y - 30, fuerza);
    });
    cielo();
    LUCIERNAGAS.forEach((l, i) => {
      const brilla = 0.5 + 0.5 * Math.sin(T * 3 + i * 1.7);
      const lx = l.x + Math.sin(T + i) * 30,
        ly = l.y + Math.cos(T * 0.8 + i) * 20;
      circ(lx, ly, 14, `rgba(220, 255, 120, ${brilla * 0.25})`, 0);
      circ(lx, ly, 5, `rgba(240, 255, 160, ${brilla})`, 0);
    });
    const f = fugazEnPantalla();
    if (f) {
      ctx.strokeStyle = 'rgba(255, 255, 220, 0.8)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(f.x + 160, f.y - 26);
      ctx.stroke();
      star(f.x, f.y, 22, '#FFF7C2', 3);
    }
    acampada();
    // cuántos faltan: un hueco por animal, arriba, que se llena al encontrarlo
    (plan?.animales ?? []).forEach((a, i) => {
      const x = 800 + (i - ((plan?.animales.length ?? 1) - 1) / 2) * 110;
      card(x - 45, 30, 90, 90, st.encontrados[i] ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)', 4, 20);
      if (st.encontrados[i]) {
        ctx.save();
        ctx.translate(x, 75);
        ctx.scale(0.55, 0.55);
        animal(a.id, 0, 0);
        ctx.restore();
      }
    });
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el mapa; monedas -> la tienda; Tito -> la ayuda; la estrella fugaz -> el deseo; si no, la luz va
  // ahí (y si hay un animal debajo, sale).
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('map');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (dist(x, y, 580, 735) < 80) {
      this.prompt!();
      return;
    }
    const f = fugazEnPantalla();
    if (f && dist(x, y, f.x, f.y) < 110 && T - LINTERNA_ST.fugazTocada > 3) {
      LINTERNA_ST.fugazTocada = T;
      SFX.sparkle();
      sparkles(f.x, f.y);
      say(FUGAZ);
      return;
    }
    mueveLuz(x, y);
    const i = (LINTERNA_ST.plan?.animales ?? []).findIndex((_, j) => {
      const p = sitioAnimalNoche(j);
      return !!p && !LINTERNA_ST.encontrados[j] && dist(x, y, p.x, p.y) < 80;
    });
    if (i >= 0 && LINTERNA_ST.fase === 'busca') encuentra(i);
    else SFX.tap();
  },
  // move(x, y): mientras se arrastra, la luz sigue al dedo.
  move(x: number, y: number) {
    mueveLuz(x, y);
  },
};
