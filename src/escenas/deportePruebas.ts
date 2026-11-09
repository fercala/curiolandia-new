/*
 * escenas/deportePruebas.ts: cuatro pruebas del gran día del deporte (fase P11 de docs/IDEAS-MEJORA.md), en 2D, sobre
 * el fondo del patio. La quinta, la carrera, es la de la fase P10 (mundo3d/carreras3d.ts). Se abren desde la jornada
 * (SCENES.deporte, escenas/deporte.ts) y, al acabar, vuelven a ella con sus puntos ({prueba, puntos}), que dan la
 * medalla (medallaDe, dominio/deporte.ts). La casa vuelve a la jornada.
 *   - SCENES.deporteSalto, el salto de longitud: Tito coge carrerilla hacia la raya blanca y se toca para que salte;
 *     cuanto más cerca de la raya, más lejos cae (en palmos, contados en la arena). Tres saltos; cuenta el mejor. Si no
 *     se toca, salta solo en la raya, poquito.
 *   - SCENES.deportePunteria, la puntería: una canasta se mueve de lado a lado y se toca para lanzar la pelota hacia
 *     arriba. Cinco tiros; cuentan las canastas.
 *   - SCENES.deporteEquilibrio, el equilibrio: un juego de moverse de verdad, como los del patio. Tito se pone a la pata
 *     coja en la barra y cuenta en voz alta mientras el niño aguanta con un pie; luego, con el otro. Es de confianza:
 *     siempre cuenta las dos.
 *   - SCENES.deporteRelevos, los relevos: Polly, Lupi, Pipo (o Erizo, si Pipo no ha nacido) y Tito se pasan el testigo.
 *     Cuando el que corre llega cerca del siguiente, este brilla: se toca para pasarle el testigo a tiempo (pase bueno).
 *     Si no, espera un momento y lo coge solo. Cuentan los pases buenos.
 * Exporta: SALTO, CANASTA y RELEVOS (medidas y estado, para las pruebas automáticas) y pone las cuatro escenas.
 * Importa: el núcleo (dibujo, voz, toque, Tito), NUM de juegos/comps.ts, el fondo del patio, lo común del patio y la
 * etapa de Pipo de escenas/zonas.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, velocidades y tiempos en la pantalla de 1600x900,
   como en el resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
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
  drawHome,
  drawTito,
  go,
  later,
  pic,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { NUM } from '../juegos/comps.ts';
import { fondoPatio } from './patio.ts';
import { sombra } from './patioComun.ts';
import { drawPet, petStage } from './zonas.ts';

// volverAJornada(id, puntos, frase): la prueba id ha acabado con esos puntos: Tito dice la frase y se vuelve a la
// jornada (SCENES.deporte), que da la medalla. Solo si se sigue en la misma escena.
function volverAJornada(id: string, puntos: number, frase: string): void {
  const aqui = sceneName;
  sayQ(frase, () => {
    if (sceneName === aqui) later(500, () => go('deporte', { prueba: id, puntos }));
  });
}

// cartel(titulo, hechos, total): arriba, el nombre de la prueba y unos puntos con los intentos (llenos los hechos).
function cartel(titulo: string, hechos: number, total: number): void {
  card(W / 2 - 300, 40, 600, 80, '#fff', 6, 40);
  text(titulo, W / 2, 96, 42);
  Array.from({ length: total }, (_, i) => i).forEach((i) =>
    circ(W / 2 - ((total - 1) * 44) / 2 + i * 44, 150, 14, i < hechos ? '#FFC93C' : '#fff', 4),
  );
}

/* ---------- el salto de longitud ---------- */

// SALTO: las medidas del salto: de dónde sale Tito, dónde está la raya, lo que mide un palmo en la arena, la velocidad
// de la carrerilla (por edad), la altura del suelo, los intentos y el estado del salto en marcha (fase, x de Tito, cuándo
// saltó, palmos de este salto, mejor salto, intentos hechos).
export const SALTO = {
  x0: 150,
  raya: 720,
  palmo: 75,
  suelo: 700,
  intentos: 3,
  vel: { 3: 300, 4: 360, 5: 420 } as Readonly<Record<number, number>>,
  st: { fase: 'intro', x: 150, t0: 0, palmos: 0, mejor: 0, hechos: 0 },
};

// palmosDe(hueco): los palmos que se saltan despegando a hueco píxeles antes de la raya: 10 justo en la raya, uno menos
// por cada 35 píxeles de más; como poco, 2.
const palmosDe = (hueco: number): number => Math.max(2, Math.min(10, Math.round(10 - hueco / 35)));

// carrerilla(): empieza un intento: Tito vuelve a la salida y empieza a correr.
function carrerilla(): void {
  Object.assign(SALTO.st, { fase: 'corre', x: SALTO.x0, t0: T });
}

// saltar(hueco): Tito despega a hueco píxeles de la raya y vuela hasta caer en la arena (palmosDe).
function saltar(hueco: number): void {
  const palmos = palmosDe(hueco);
  Object.assign(SALTO.st, { fase: 'vuela', t0: T, palmos, x: SALTO.raya - hueco });
  SFX.boing();
}

// aterrizar(): Tito cae en la arena: se dicen los palmos, se apunta el mejor y se pasa al siguiente intento o se acaba.
function aterrizar(): void {
  const s = SALTO.st,
    hechos = s.hechos + 1,
    mejor = Math.max(s.mejor, s.palmos);
  Object.assign(s, { fase: 'cae', hechos, mejor, t0: T });
  SFX.good();
  burst(SALTO.raya + s.palmos * SALTO.palmo, SALTO.suelo - 20, 18);
  const frase = `¡${NUM[s.palmos] ?? s.palmos} palmos!`;
  if (hechos >= SALTO.intentos)
    volverAJornada('salto', mejor, `${frase} Tu mejor salto: ${NUM[mejor] ?? mejor} palmos.`);
  else
    sayQ(frase, () => {
      if (sceneName === 'deporteSalto') carrerilla();
    });
}

// xVuelo(): dónde está Tito en el aire (de la x del despegue a la de la arena) y a qué altura.
function xVuelo(): { x: number; y: number } {
  const s = SALTO.st,
    k = Math.min(1, (T - s.t0) / 0.8),
    fin = SALTO.raya + s.palmos * SALTO.palmo;
  return { x: s.x + (fin - s.x) * k, y: -Math.sin(k * Math.PI) * 170 };
}

SCENES['deporteSalto'] = {
  music: 'jardin',
  // enter(): un salto de longitud nuevo; Tito lo explica y empieza la carrerilla.
  enter(_o: OpcionesEscena) {
    Object.assign(SALTO.st, { fase: 'intro', x: SALTO.x0, t0: T, palmos: 0, mejor: 0, hechos: 0 });
    later(400, () =>
      sayQ('¡El salto de longitud! Tito corre hacia la raya blanca. Toca para saltar justo antes de la raya.', () => {
        if (sceneName === 'deporteSalto') carrerilla();
      }),
    );
  },
  // update(dt): la carrerilla (si llega a la raya sin tocar, salta solo, poquito) y el vuelo hasta la arena.
  update(dt: number) {
    VIVO.idle = 0;
    const s = SALTO.st;
    if (s.fase === 'corre') {
      s.x += (SALTO.vel[Math.min(5, Math.max(3, AGE()))] ?? 360) * dt;
      if (s.x >= SALTO.raya) saltar(280);
    } else if (s.fase === 'vuela' && T - s.t0 >= 0.8) aterrizar();
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca para saltar justo antes de la raya blanca.');
  },
  // hint(): saltar cuando Tito está muy cerca de la raya (a menos de 40 píxeles).
  hint() {
    const s = SALTO.st;
    return s.fase === 'corre' && SALTO.raya - s.x < 40 ? { x: 800, y: 450, r: 120 } : null;
  },
  // draw(): el patio, la pista de la carrerilla, la raya, la arena con los palmos contados, la marca del mejor salto,
  // Tito (corriendo, en el aire o en la arena) y el cartel.
  draw() {
    fondoPatio();
    const s = SALTO.st,
      y = SALTO.suelo;
    card(SALTO.x0 - 80, y - 10, SALTO.raya - SALTO.x0 + 80, 40, '#E0785A', 4, 10);
    card(SALTO.raya, y - 14, 11 * SALTO.palmo, 50, '#F7D9A6', 4, 20);
    ctx.fillStyle = '#fff';
    ctx.fillRect(SALTO.raya - 6, y - 12, 12, 46);
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) =>
      text(String(n), SALTO.raya + n * SALTO.palmo, y + 80, 30, n === s.mejor ? '#E8554E' : '#8A7A66'),
    );
    if (s.mejor) pic('estrellas', SALTO.raya + s.mejor * SALTO.palmo, y - 40, 50);
    const v = s.fase === 'vuela' ? xVuelo() : { x: s.fase === 'cae' ? SALTO.raya + s.palmos * SALTO.palmo : s.x, y: 0 },
      paso = s.fase === 'corre' ? Math.abs(Math.sin(T * 14)) * 12 : 0;
    sombra(v.x, y + 8, 70 * (1 + v.y / 400));
    drawTito(v.x - 90, y - 150 + v.y - paso, 180, { bubble: false });
    cartel('El salto de longitud', s.hechos, SALTO.intentos);
    drawHome();
  },
  // down(x, y): casa -> la jornada; corriendo, salta (desde donde esté).
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('deporte');
      return;
    }
    const s = SALTO.st;
    if (s.fase === 'corre') saltar(Math.max(0, SALTO.raya - s.x));
    else sparkles(x, y, 4);
  },
};

/* ---------- la puntería ---------- */

// CANASTA: las medidas de la puntería: el centro y lo que se mueve la canasta, su velocidad (por edad), la altura de la
// canasta y de la pelota, lo que tarda en subir la pelota, el ancho que entra, los tiros y el estado (fase, cuándo se
// lanzó, tiros hechos, canastas y si el último entró).
export const CANASTA = {
  cx: 800,
  amplitud: 420,
  vel: { 3: 0.9, 4: 1.2, 5: 1.5 } as Readonly<Record<number, number>>,
  y: 380,
  yPelota: 780,
  subida: 0.6,
  entra: 75,
  tiros: 5,
  st: { fase: 'intro', t0: 0, hechos: 0, canastas: 0, dentro: false, reloj: 0 },
};

// xCanasta(t): dónde está la canasta en el instante t del reloj de la prueba.
const xCanasta = (t: number): number =>
  CANASTA.cx + Math.sin(t * (CANASTA.vel[Math.min(5, Math.max(3, AGE()))] ?? 1.2)) * CANASTA.amplitud;

// lanzar(): la pelota sale hacia arriba; al llegar, se mira si la canasta está encima (llegaPelota).
function lanzar(): void {
  Object.assign(CANASTA.st, { fase: 'sube', t0: CANASTA.st.reloj });
  SFX.whoosh();
}

// llegaPelota(): la pelota ha llegado arriba: canasta si la canasta está encima. Luego, otro tiro o el final.
function llegaPelota(): void {
  const s = CANASTA.st,
    dentro = Math.abs(xCanasta(s.reloj) - CANASTA.cx) < CANASTA.entra,
    canastas = s.canastas + (dentro ? 1 : 0),
    hechos = s.hechos + 1;
  Object.assign(s, { fase: 'cae', t0: s.reloj, dentro, canastas, hechos });
  if (dentro) {
    SFX.good();
    burst(CANASTA.cx, CANASTA.y, 24);
  } else SFX.boing();
  const frase = dentro ? '¡Canasta!' : '¡Casi!';
  if (hechos >= CANASTA.tiros)
    volverAJornada(
      'punteria',
      canastas,
      `${frase} Has metido ${canastas === 1 ? 'una canasta' : (NUM[canastas] ?? canastas) + ' canastas'}.`,
    );
  else
    say(frase, () => {
      if (sceneName === 'deportePunteria') Object.assign(s, { fase: 'listo' });
    });
}

SCENES['deportePunteria'] = {
  music: 'jardin',
  // enter(): una puntería nueva; Tito la explica.
  enter(_o: OpcionesEscena) {
    Object.assign(CANASTA.st, { fase: 'intro', t0: 0, hechos: 0, canastas: 0, dentro: false, reloj: 0 });
    later(400, () =>
      sayQ('¡La puntería! La canasta se mueve. Toca para lanzar la pelota cuando la canasta esté justo encima.', () => {
        if (sceneName === 'deportePunteria') CANASTA.st.fase = 'listo';
      }),
    );
  },
  // update(dt): el reloj de la prueba (mueve la canasta) y la pelota que sube.
  update(dt: number) {
    VIVO.idle = 0;
    const s = CANASTA.st;
    s.reloj += dt;
    if (s.fase === 'sube' && s.reloj - s.t0 >= CANASTA.subida) llegaPelota();
  },
  // prompt(): la consigna.
  prompt() {
    say('Toca para lanzar cuando la canasta esté encima de la pelota.');
  },
  // hint(): lanzar cuando la canasta va a estar encima al llegar la pelota.
  hint() {
    const s = CANASTA.st;
    if (s.fase !== 'listo') return null;
    return Math.abs(xCanasta(s.reloj + CANASTA.subida) - CANASTA.cx) < CANASTA.entra * 0.5
      ? { x: 800, y: 600, r: 120 }
      : null;
  },
  // draw(): el patio, el poste con el tablero y la canasta que se mueve, la pelota (abajo, subiendo o cayendo) y el
  // cartel con los tiros.
  draw() {
    fondoPatio();
    const s = CANASTA.st,
      cx = xCanasta(s.reloj);
    card(cx - 110, CANASTA.y - 150, 220, 140, '#fff', 6, 12);
    ctx.strokeStyle = '#E8554E';
    ctx.lineWidth = 5;
    ctx.strokeRect(cx - 50, CANASTA.y - 110, 100, 70);
    ctx.save();
    ctx.strokeStyle = '#E8554E';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(cx, CANASTA.y, 80, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = 3;
    [-60, -30, 0, 30, 60].forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(cx + d, CANASTA.y + 10);
      ctx.lineTo(cx + d * 0.6, CANASTA.y + 80);
      ctx.stroke();
    });
    ctx.restore();
    const k = Math.min(1, (s.reloj - s.t0) / CANASTA.subida),
      yP = s.fase === 'sube' ? CANASTA.yPelota - (CANASTA.yPelota - CANASTA.y) * k : CANASTA.yPelota,
      yC = s.fase === 'cae' && s.reloj - s.t0 < 0.6 ? CANASTA.y + ((s.reloj - s.t0) / 0.6) * 400 : null;
    if (yC !== null) pic('pelotaPlaya', s.dentro ? cx : CANASTA.cx + 60, yC, 90);
    else pic('pelotaPlaya', CANASTA.cx, yP, 100);
    drawTito(CANASTA.cx - 330, CANASTA.yPelota - 130, 200, { bubble: false });
    cartel('La puntería', s.hechos, CANASTA.tiros);
    pic('pelotaPlaya', 1360, 82, 56);
    text(`× ${s.canastas}`, 1440, 96, 44);
    drawHome();
  },
  // down(x, y): casa -> la jornada; si está lista, lanza.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('deporte');
      return;
    }
    if (CANASTA.st.fase === 'listo') lanzar();
    else sparkles(x, y, 4);
  },
};

/* ---------- el equilibrio ---------- */

// CUENTA_EQUILIBRIO: hasta cuánto cuenta Tito con cada pie, según la edad.
const CUENTA_EQUILIBRIO: Readonly<Record<number, number>> = { 3: 5, 4: 8, 5: 10 };
// EQUILIBRIO: el estado: fase, el pie (0 el primero, 1 el otro), el número por el que va la cuenta y los pies hechos.
export const EQUILIBRIO = { fase: 'intro', pie: 0, n: 0, hechos: 0 };

// contar(): dice el número siguiente de la cuenta (uno cada segundo y algo) hasta el de la edad; al acabar, el otro pie
// o el final.
function contar(): void {
  if (sceneName !== 'deporteEquilibrio') return;
  const tope = CUENTA_EQUILIBRIO[Math.min(5, Math.max(3, AGE()))] ?? 8,
    n = EQUILIBRIO.n + 1;
  Object.assign(EQUILIBRIO, { n });
  SFX.pop();
  say(NUM[n] ?? String(n), () => {
    if (sceneName !== 'deporteEquilibrio') return;
    if (n < tope) later(600, contar);
    else pieHecho();
  });
}

// pieHecho(): se ha aguantado con un pie: con el primero, ahora el otro; con los dos, se acaba (siempre los dos: es
// de confianza).
function pieHecho(): void {
  const hechos = EQUILIBRIO.hechos + 1;
  Object.assign(EQUILIBRIO, { hechos, fase: 'bien', n: 0 });
  SFX.good();
  burst(800, 400, 30);
  if (hechos >= 2) volverAJornada('equilibrio', 2, '¡Qué equilibrio! Has aguantado con los dos pies.');
  else
    sayQ('¡Muy bien! Ahora, con el otro pie. ¿Preparados?', () => {
      Object.assign(EQUILIBRIO, { pie: 1, fase: 'cuenta' });
      later(500, contar);
    });
}

SCENES['deporteEquilibrio'] = {
  music: 'jardin',
  // enter(): el equilibrio: Tito explica que hay que ponerse a la pata coja de verdad y empieza a contar.
  enter(_o: OpcionesEscena) {
    Object.assign(EQUILIBRIO, { fase: 'intro', pie: 0, n: 0, hechos: 0 });
    later(400, () =>
      sayQ('¡El equilibrio! Ponte de pie, levanta un pie y aguanta a la pata coja mientras yo cuento.', () => {
        if (sceneName !== 'deporteEquilibrio') return;
        EQUILIBRIO.fase = 'cuenta';
        later(500, contar);
      }),
    );
  },
  // update(): el juego avanza solo (sin la mano de ayuda).
  update() {
    VIVO.idle = 0;
  },
  // prompt(): la consigna.
  prompt() {
    say('¡A la pata coja! Aguanta mientras cuento.');
  },
  // draw(): el patio, la barra de equilibrio, Tito a la pata coja balanceándose con los brazos abiertos, el número de la
  // cuenta en grande, el letrero con el pie y el cartel con los dos pies.
  draw() {
    fondoPatio();
    card(400, 690, 800, 40, '#C98A4B', 5, 12);
    card(440, 730, 30, 70, '#8C5A34', 4, 6);
    card(1130, 730, 30, 70, '#8C5A34', 4, 6);
    const giro = Math.sin(T * 2.2) * 0.12;
    ctx.save();
    ctx.translate(800, 690);
    ctx.rotate(giro);
    ctx.strokeStyle = '#4A3B2A';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-170, -140);
    ctx.lineTo(170, -140);
    ctx.stroke();
    drawTito(-120, -220, 240, { bubble: false });
    ctx.restore();
    const n = EQUILIBRIO.n;
    if (EQUILIBRIO.fase === 'cuenta' && n) {
      circ(1300, 420, 110, '#FFD66B', 7);
      text(String(n), 1300, 455, 110);
    }
    card(160, 360, 340, 110, '#fff', 6, 30);
    text(EQUILIBRIO.pie ? '¡Con el otro pie!' : '¡A la pata coja!', 330, 430, 34);
    cartel('El equilibrio', EQUILIBRIO.hechos, 2);
    drawHome();
  },
  // down(x, y): casa -> la jornada; en otro sitio, chispas (el juego va solo).
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('deporte');
      return;
    }
    sparkles(x, y, 5);
  },
};

/* ---------- los relevos ---------- */

/** Un corredor de los relevos: su dibujo (o 'tito' o 'pipo') y dónde espera. */
interface Relevista {
  readonly k: string;
  readonly x: number;
}
// RELEVOS: las medidas y el estado de los relevos: la meta, la altura de la pista, la velocidad, cuándo brilla el
// siguiente (a cuántos píxeles), cuánto espera si no se toca, los corredores y el estado (quién corre, por dónde va,
// si el siguiente brilla, si está esperando y desde cuándo, y los pases buenos).
export const RELEVOS = {
  meta: 1520,
  y: 640,
  vel: 330,
  aviso: 150,
  espera: 1,
  corredores: [] as Relevista[],
  st: { fase: 'intro', i: 0, x: 0, brilla: false, espera: 0, buenos: 0, t0: 0 },
};

// relevistas(): los cuatro de los relevos: Polly, Lupi, Pipo (o Erizo, si Pipo no ha salido del huevo) y Tito, que
// corre el último.
const relevistas = (): Relevista[] => [
  { k: 'polly', x: 140 },
  { k: 'lupi', x: 480 },
  { k: petStage() >= 2 ? 'pipo' : 'erizo', x: 820 },
  { k: 'tito', x: 1160 },
];

// pasar(bueno): el testigo pasa al siguiente: si es bueno (se tocó a tiempo), cuenta y se celebra.
function pasar(bueno: boolean): void {
  const s = RELEVOS.st,
    sig = RELEVOS.corredores[s.i + 1];
  if (!sig) return;
  Object.assign(s, { i: s.i + 1, x: sig.x, brilla: false, espera: 0, buenos: s.buenos + (bueno ? 1 : 0) });
  if (bueno) {
    SFX.good();
    sparkles(sig.x, RELEVOS.y - 120, 10);
    say('¡Pase perfecto!');
  } else SFX.pop();
}

// llegaMeta(): el último (Tito) cruza la meta: se acaba, con los pases buenos.
function llegaMeta(): void {
  const s = RELEVOS.st;
  Object.assign(s, { fase: 'meta', t0: T });
  SFX.tada();
  burst(RELEVOS.meta, RELEVOS.y - 100, 30);
  volverAJornada(
    'relevos',
    s.buenos,
    `¡Meta! Has hecho ${s.buenos === 1 ? 'un pase perfecto' : (NUM[s.buenos] ?? s.buenos) + ' pases perfectos'}.`,
  );
}

SCENES['deporteRelevos'] = {
  music: 'jardin',
  // enter(): unos relevos nuevos; Tito los explica y sale Polly con el testigo.
  enter(_o: OpcionesEscena) {
    RELEVOS.corredores = relevistas();
    Object.assign(RELEVOS.st, {
      fase: 'intro',
      i: 0,
      x: RELEVOS.corredores[0]?.x ?? 140,
      brilla: false,
      espera: 0,
      buenos: 0,
    });
    later(400, () =>
      sayQ(
        '¡Los relevos! Cada uno corre un trozo y le pasa el testigo al siguiente. Cuando el siguiente brille, tócalo para pasarle el testigo.',
        () => {
          if (sceneName === 'deporteRelevos') RELEVOS.st.fase = 'corre';
        },
      ),
    );
  },
  // update(dt): el que tiene el testigo corre hacia el siguiente (o hacia la meta, si es Tito); cerca, el siguiente
  // brilla; si llega sin que se toque, espera un momento y el testigo pasa solo.
  update(dt: number) {
    VIVO.idle = 0;
    const s = RELEVOS.st,
      sig = RELEVOS.corredores[s.i + 1];
    if (s.fase !== 'corre') return;
    if (!sig) {
      s.x = Math.min(RELEVOS.meta, s.x + RELEVOS.vel * dt);
      if (s.x >= RELEVOS.meta) llegaMeta();
      return;
    }
    const hasta = sig.x - 70;
    s.brilla = hasta - s.x < RELEVOS.aviso;
    if (s.x < hasta) s.x = Math.min(hasta, s.x + RELEVOS.vel * dt);
    else {
      s.espera += dt;
      if (s.espera >= RELEVOS.espera) pasar(false);
    }
  },
  // prompt(): la consigna.
  prompt() {
    say('Cuando el siguiente brille, tócalo para pasarle el testigo.');
  },
  // hint(): tocar al siguiente cuando brilla.
  hint() {
    const s = RELEVOS.st,
      sig = RELEVOS.corredores[s.i + 1];
    return s.fase === 'corre' && s.brilla && sig ? { x: sig.x, y: RELEVOS.y - 90, r: 110 } : null;
  },
  // draw(): el patio, la pista con la meta, los corredores (el del testigo, corriendo con el testigo en alto; el
  // siguiente, brillando cuando toca) y el cartel con los pases.
  draw() {
    fondoPatio();
    const s = RELEVOS.st;
    card(60, RELEVOS.y + 10, RELEVOS.meta - 20, 46, '#E0785A', 4, 12);
    Array.from({ length: 6 }, (_, i) => i).forEach((i) =>
      card(RELEVOS.meta, RELEVOS.y + 10 + i * 8 - 4, 14, 8, i % 2 ? '#222' : '#fff', 0, 0),
    );
    RELEVOS.corredores.forEach((c, i) => {
      const corre = i === s.i,
        x = corre ? s.x : c.x,
        bota = corre && s.fase === 'corre' ? Math.abs(Math.sin(T * 12)) * 16 : 0,
        y = RELEVOS.y - bota;
      if (i === s.i + 1 && s.brilla) circ(x, y - 80, 100 + Math.sin(T * 10) * 8, 'rgba(255,214,107,.55)', 0);
      sombra(x, RELEVOS.y + 8, 60);
      if (c.k === 'tito') drawTito(x - 75, y - 130, 150, { bubble: false });
      else if (c.k === 'pipo') drawPet(x, y, 150);
      else pic(c.k, x, y - 70, 150);
      if (corre) {
        card(x + 40, y - 150, 16, 70, '#E8554E', 4, 6);
      }
    });
    cartel('Los relevos', s.buenos, 3);
    drawHome();
  },
  // down(x, y): casa -> la jornada; si el siguiente brilla (o el corredor espera), pasa el testigo a tiempo.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('deporte');
      return;
    }
    const s = RELEVOS.st;
    if (s.fase === 'corre' && s.brilla && RELEVOS.corredores[s.i + 1]) pasar(true);
    else sparkles(x, y, 4);
  },
};
