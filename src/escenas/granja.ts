/*
 * escenas/granja.ts: las estaciones de la granja escuela (idea 1 de docs/IDEAS-MEJORA.md, fase P5) que ya se pueden
 * jugar: dar de comer a los animales (SCENES.granjaComer) y recoger huevos (SCENES.granjaHuevos). Se llega desde el
 * plano de la excursión (escenas/excursion.ts) y, al terminar, se vuelve a él con volverDeEstacion, que la apunta.
 * - Dar de comer: cada animal come una cosa (la vaca, hierba; la gallina, trigo; el conejo, zanahorias; el cerdo,
 *   manzanas; el caballo, heno). Se arrastra la comida hasta su comedero; si no es la suya, el animal la huele, pone
 *   cara rara y la comida vuelve (sin castigo). 3 animales con 3 años, 4 con 4 y 5 con 5.
 * - Recoger huevos: en la paja del gallinero hay montones; en algunos hay un huevo. Se tocan los montones, los huevos
 *   van a la cesta y se cuentan. 3 huevos con 3 años, 5 con 4 y 7 con 5 (y 3 montones vacíos más).
 * Exporta: COMIDAS_GRANJA (qué come cada animal), ESTADO_GRANJA (para las pruebas) y pone SCENES.granjaComer y SCENES.granjaHuevos al cargarse.
 * Importa: el núcleo (dibujo, voz, sonido, toque), NUM de juegos/, fondoGranja y volverDeEstacion de
 * escenas/excursion.ts y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  SCENES,
  SFX,
  T,
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
  go,
  later,
  noise,
  pic,
  playSound,
  say,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { NUM } from '../juegos/indice.ts';
import { fondoGranja, volverDeEstacion } from './excursion.ts';
import { azar } from '../aplicacion/puertos.ts';

/* ---------- dar de comer ---------- */

/** Un animal de la granja y su comida: el dibujo del animal, el de la comida (o 'hierba' y 'heno', que se dibujan
 * aquí), cómo se llaman (con artículo) para la voz. */
interface ComidaGranja {
  readonly animal: string;
  readonly nombre: string;
  readonly comida: string;
  readonly nombreComida: string;
}
// COMIDAS_GRANJA: qué come cada animal, en el orden en que salen (con 3 años, los tres primeros).
export const COMIDAS_GRANJA: readonly ComidaGranja[] = [
  { animal: 'vaca', nombre: 'la vaca', comida: 'hierba', nombreComida: 'hierba' },
  { animal: 'gallina', nombre: 'la gallina', comida: 'trigo', nombreComida: 'trigo' },
  { animal: 'conejo', nombre: 'el conejo', comida: 'zanahoria', nombreComida: 'zanahorias' },
  { animal: 'cerdo', nombre: 'el cerdo', comida: 'manzana', nombreComida: 'manzanas' },
  { animal: 'caballo', nombre: 'el caballo', comida: 'heno', nombreComida: 'heno' },
];

/** Un animal en pantalla: cuál, dónde está (centro), si ya ha comido y desde cuándo pone cara rara (o come). */
interface AnimalEnPantalla {
  readonly c: ComidaGranja;
  readonly x: number;
  readonly y: number;
  comido: boolean;
  raro: number;
  come: number;
}
/** Una comida en pantalla: de qué animal es, su sitio de partida y dónde está ahora (si se arrastra, se mueve). */
interface ComidaEnPantalla {
  readonly c: ComidaGranja;
  readonly x0: number;
  readonly y0: number;
  x: number;
  y: number;
  puesta: boolean;
}
// comer: el estado de la estación: los animales, las comidas, la que se arrastra y si ya se ha terminado.
const comer = {
  animales: [] as AnimalEnPantalla[],
  comidas: [] as ComidaEnPantalla[],
  arrastra: null as ComidaEnPantalla | null,
  fin: false,
};

// dibujaComida(k, x, y, s): la comida k: la hierba y el heno se dibujan aquí (un manojo verde y una bala amarilla); las
// demás son dibujos de PICS.
function dibujaComida(k: string, x: number, y: number, s: number): void {
  ctx.save();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#4A3B2A';
  if (k === 'hierba') {
    ctx.fillStyle = '#5DBB4A';
    [-0.5, -0.25, 0, 0.25, 0.5].forEach((a, i) => {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.15 + i * s * 0.075, y + s * 0.35);
      ctx.quadraticCurveTo(x + a * s * 0.6, y - s * 0.1, x + a * s * 0.8, y - s * 0.4);
      ctx.quadraticCurveTo(x + a * s * 0.2, y, x - s * 0.05 + i * s * 0.075, y + s * 0.35);
      ctx.fill();
      ctx.stroke();
    });
  } else if (k === 'heno') {
    ctx.fillStyle = '#F2C94C';
    ctx.fillRect(x - s * 0.4, y - s * 0.25, s * 0.8, s * 0.5);
    ctx.strokeRect(x - s * 0.4, y - s * 0.25, s * 0.8, s * 0.5);
    ctx.strokeStyle = '#B98A2E';
    [-0.15, 0.15].forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(x + d * s, y - s * 0.25);
      ctx.lineTo(x + d * s, y + s * 0.25);
      ctx.stroke();
    });
  } else pic(k, x, y, s);
  ctx.restore();
}

// comedero(a): el centro del comedero del animal a (debajo de él).
const comedero = (a: AnimalEnPantalla) => ({ x: a.x, y: a.y + 150 });

// prepararComer(): coloca los animales (3, 4 o 5 según la edad) en fila y sus comidas, barajadas, abajo.
function prepararComer(): void {
  const n = Math.min(COMIDAS_GRANJA.length, Math.max(3, AGE())),
    elegidos = COMIDAS_GRANJA.slice(0, n),
    paso = W / (n + 1);
  comer.animales = elegidos.map((c, i) => ({ c, x: paso * (i + 1), y: 380, comido: false, raro: -9, come: -9 }));
  comer.comidas = elegidos
    .map((c) => ({ c, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map(({ c }, i) => ({ c, x0: paso * (i + 1), y0: 790, x: paso * (i + 1), y: 790, puesta: false }));
  comer.arrastra = null;
  comer.fin = false;
}

// soltarComida(f): se suelta la comida f: si está sobre el comedero de su animal, come (sonido del animal); si está sobre
// el de otro, ese lo huele y pone cara rara, y la comida vuelve; si no, vuelve sin más. Con todos comidos, se termina.
function soltarComida(f: ComidaEnPantalla): void {
  const a = comer.animales.find((x) => !x.comido && dist(f.x, f.y, comedero(x).x, comedero(x).y - 60) < 140);
  if (a && a.c.animal === f.c.animal) {
    Object.assign(f, { puesta: true, x: comedero(a).x, y: comedero(a).y - 20 });
    Object.assign(a, { comido: true, come: T });
    SFX.good();
    playSound(a.c.animal);
    burst(a.x, a.y, 14);
    if (comer.animales.every((x) => x.comido)) {
      comer.fin = true;
      later(900, () =>
        say('¡Todos los animales tienen la barriga llena! ¡Muchas gracias por ayudar!', () =>
          volverDeEstacion('granja', 'comer'),
        ),
      );
    } else say('¡Ñam, ñam! ¡Muy bien!');
    return;
  }
  if (a) {
    a.raro = T;
    SFX.boing();
    say(`¡Puaj! ${cap1(alAnimal(a.c.nombre))} no le gusta eso. ${cap1(a.c.nombre)} come ${a.c.nombreComida}.`);
  }
  Object.assign(f, { x: f.x0, y: f.y0 });
}

// alAnimal(n): «a» delante del nombre del animal con su artículo: «a la vaca», «al conejo».
const alAnimal = (n: string): string => (n.startsWith('el ') ? 'al ' + n.slice(3) : 'a ' + n);

// cap1(t): t con la primera letra en mayúscula.
const cap1 = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

SCENES['granjaComer'] = {
  music: 'jardin',
  // enter(): coloca los animales y sus comidas y explica qué hay que hacer.
  enter(_o: OpcionesEscena) {
    prepararComer();
    later(400, () => say('Cada animal come una cosa. Arrastra su comida hasta su comedero.'));
  },
  // prompt(): la consigna.
  prompt() {
    say('Arrastra la comida de cada animal hasta su comedero.');
  },
  // hint(): la comida del primer animal que aún no ha comido.
  hint() {
    const f = comer.comidas.find((x) => !x.puesta);
    return f && !comer.fin ? { x: f.x0, y: f.y0, r: 80 } : null;
  },
  // draw(): la granja, cada animal (que mastica si ha comido o tiembla si pone cara rara) con su comedero, las comidas y
  // la que se arrastra encima de todo.
  draw() {
    fondoGranja();
    comer.animales.forEach((a) => {
      const raro = Math.max(0, 1 - (T - a.raro) * 1.5),
        mastica = a.comido ? Math.abs(Math.sin((T - a.come) * 8)) * 0.04 : 0;
      ctx.save();
      ctx.translate(a.x + Math.sin(T * 40) * 10 * raro, a.y);
      ctx.scale(1 + mastica, 1 - mastica);
      pic(a.c.animal, 0, 0, 220);
      ctx.restore();
      if (raro > 0) text('?', a.x + 110, a.y - 90, 60, '#E8554E');
      const cm = comedero(a);
      ctx.save();
      ctx.fillStyle = '#9C6B3E';
      ctx.strokeStyle = '#4A3B2A';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cm.x - 90, cm.y - 30);
      ctx.lineTo(cm.x + 90, cm.y - 30);
      ctx.lineTo(cm.x + 70, cm.y + 20);
      ctx.lineTo(cm.x - 70, cm.y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    comer.comidas
      .filter((f) => f !== comer.arrastra)
      .forEach((f) => {
        if (!f.puesta) circ(f.x0, f.y0, 75, 'rgba(255,255,255,0.7)', 0);
        dibujaComida(f.c.comida, f.x, f.y, f.puesta ? 90 : 120);
      });
    if (comer.arrastra) dibujaComida(comer.arrastra.c.comida, comer.arrastra.x, comer.arrastra.y, 130);
    drawTito(14, 720, 170);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el plano de la excursión; una comida sin poner -> se coge; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('excursion', { exc: 'granja' });
      return;
    }
    if (comer.fin) return;
    const f = comer.comidas.find((z) => !z.puesta && dist(x, y, z.x, z.y) < 80);
    if (f) {
      SFX.pop();
      comer.arrastra = f;
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
  // move(x, y): la comida que se arrastra sigue al dedo.
  move(x: number, y: number) {
    if (comer.arrastra) Object.assign(comer.arrastra, { x, y });
  },
  // up(): se suelta la comida que se arrastraba (soltarComida).
  up() {
    const f = comer.arrastra;
    comer.arrastra = null;
    if (f) soltarComida(f);
  },
};

/* ---------- recoger huevos ---------- */

/** Un montón de paja del gallinero: dónde está, si tiene huevo y si ya se ha mirado (desde cuándo). */
interface Monton {
  readonly x: number;
  readonly y: number;
  readonly huevo: boolean;
  mirado: number;
}
// huevos: el estado de la estación: los montones, cuántos huevos hay y cuántos se han recogido.
const huevos = { montones: [] as Monton[], total: 0, cogidos: 0, fin: false };
// HUEVOS_POR_EDAD: cuántos huevos hay escondidos según la edad (3, 4 y 5 años).
const HUEVOS_POR_EDAD: Readonly<Record<number, number>> = { 3: 3, 4: 5, 5: 7 };
// CESTA: dónde está la cesta de los huevos (centro).
const CESTA = { x: 1330, y: 760 };

// prepararHuevos(): coloca los montones de paja (los huevos de la edad, 3, 5 o 7, y 3 vacíos más) en dos filas, con los
// huevos escondidos al azar.
function prepararHuevos(): void {
  const total = HUEVOS_POR_EDAD[Math.min(5, Math.max(3, AGE()))] ?? 5,
    n = total + 3,
    porFila = Math.ceil(n / 2),
    conHuevo = Array.from({ length: n }, (_, i) => ({ i, k: azar() }))
      .sort((a, b) => a.k - b.k)
      .slice(0, total)
      .map((x) => x.i);
  huevos.montones = Array.from({ length: n }, (_, i) => {
    const fila = Math.floor(i / porFila),
      col = i % porFila;
    return {
      x: 180 + col * (1000 / porFila) + fila * 60,
      y: 470 + fila * 200,
      huevo: conHuevo.includes(i),
      mirado: -1,
    };
  });
  Object.assign(huevos, { total, cogidos: 0, fin: false });
}

// dibujaMonton(m): un montón de paja (se aplana un poco al mirarlo) y, si tenía huevo y ya se ha cogido, nada más.
function dibujaMonton(m: Monton): void {
  const aplanado = m.mirado >= 0 ? 0.6 : 1;
  ctx.save();
  ctx.fillStyle = '#F2D06B';
  ctx.strokeStyle = '#B98A2E';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(m.x, m.y, 85, 60 * aplanado, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  Array.from({ length: 6 }, (_, i) => i).forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(m.x - 60 + i * 24, m.y);
    ctx.lineTo(m.x - 52 + i * 24 + ((i % 2) * 2 - 1) * 10, m.y - 45 * aplanado);
    ctx.stroke();
  });
  ctx.restore();
}

// dibujaCesta(): la cesta con los huevos recogidos dentro y el número en grande.
function dibujaCesta(): void {
  Array.from({ length: huevos.cogidos }, (_, i) => i).forEach((i) =>
    pic('huevo', CESTA.x - 90 + (i % 4) * 60, CESTA.y - 40 - Math.floor(i / 4) * 40, 70),
  );
  ctx.save();
  ctx.fillStyle = '#C8935A';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(CESTA.x - 150, CESTA.y - 30);
  ctx.lineTo(CESTA.x + 150, CESTA.y - 30);
  ctx.lineTo(CESTA.x + 120, CESTA.y + 70);
  ctx.lineTo(CESTA.x - 120, CESTA.y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  if (huevos.cogidos) text(String(huevos.cogidos), CESTA.x, CESTA.y + 45, 60, '#fff');
}

// ESTADO_GRANJA: el estado de las dos estaciones, para que las pruebas sepan dónde están los animales, las comidas y los
// montones (docs/CONTRATO-PRUEBAS.md). Solo se lee.
export const ESTADO_GRANJA = { comer, huevos };

SCENES['granjaHuevos'] = {
  music: 'jardin',
  // enter(): esconde los huevos en la paja y explica qué hay que hacer.
  enter(_o: OpcionesEscena) {
    prepararHuevos();
    later(400, () =>
      say(
        'Las gallinas han puesto huevos escondidos en la paja. ¡Toca la paja para buscarlos y los guardamos en la cesta!',
      ),
    );
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca la paja para buscar los huevos.');
  },
  // hint(): un montón con huevo que aún no se ha mirado.
  hint() {
    const m = huevos.montones.find((x) => x.huevo && x.mirado < 0);
    return m && !huevos.fin ? { x: m.x, y: m.y - 30, r: 90 } : null;
  },
  // draw(): el gallinero (la granja con la gallina en su nido), los montones, el huevo que vuela a la cesta y la cesta.
  draw() {
    fondoGranja();
    pic('gallina', 1330, 420, 200 + Math.abs(Math.sin(T * 3)) * 8);
    huevos.montones.forEach((m) => {
      dibujaMonton(m);
      const t = T - m.mirado;
      if (m.huevo && m.mirado >= 0 && t < 0.8) {
        const k = t / 0.8;
        pic('huevo', m.x + (CESTA.x - m.x) * k, m.y - 40 + (CESTA.y - 60 - m.y) * k - Math.sin(k * Math.PI) * 200, 80);
      }
    });
    dibujaCesta();
    if (huevos.fin) {
      card(W / 2 - 260, 150, 520, 90, '#fff', 6, 45);
      text(`¡${huevos.total} huevos!`, W / 2, 212, 50);
    }
    drawTito(14, 720, 170);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el plano de la excursión; un montón sin mirar -> se mira: si tiene huevo, va a la cesta y se
  // cuenta en voz alta; con todos, se termina.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('excursion', { exc: 'granja' });
      return;
    }
    if (huevos.fin) return;
    const m = huevos.montones.find((z) => z.mirado < 0 && dist(x, y, z.x, z.y - 30) < 100);
    if (!m) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    m.mirado = T;
    noise(0.25, 0.3, 2500);
    if (!m.huevo) {
      say('Aquí no hay ninguno.');
      return;
    }
    huevos.cogidos++;
    SFX.good();
    say(NUM[huevos.cogidos] ?? String(huevos.cogidos));
    if (huevos.cogidos === huevos.total) {
      huevos.fin = true;
      playSound('gallina');
      later(1000, () =>
        say(`¡Hemos recogido ${NUM[huevos.total]} huevos! Las gallinas están muy contentas.`, () =>
          volverDeEstacion('granja', 'huevos'),
        ),
      );
    }
  },
};
