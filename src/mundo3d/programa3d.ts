/*
 * mundo3d/programa3d.ts: «Programa a Tito», el rincón de la lógica del cole en 3D (idea 28 de docs/IDEAS-MEJORA.md,
 * fase P32). Es la escena SCENES.programa, que se abre desde las clases del cole (escenas/clases.ts). En la alfombra
 * hay un tablero de casillas visto desde arriba, con Tito, una fresa y (con 5 años) unas rocas. El niño elige tarjetas
 * en la columna de la izquierda (avanzar, girar a la izquierda, girar a la derecha y, con 5 años, «por dos»), que se
 * ponen en orden en la tira de abajo, y pulsa «¡Vamos!»: Tito las sigue una a una. Si choca con una roca o se saldría
 * del tablero, la tarjeta que falla se pone roja (se toca para quitarla); si se queda corto, se ponen más. Al llegar a
 * la fresa, el tablero siguiente; tras los tres, 2 monedas (MONEDAS.juegoRepetido) y vuelta a empezar. Las reglas, en
 * dominio/programa.ts.
 * montarPrograma3D() la llama mundo3d/mundo3d.ts al montar la capa 3D: sin WebGL no hay escena y las clases enseñan el
 * rincón como «¡Muy pronto!».
 * Exporta: montarPrograma3D y, para las pruebas (mundo3d.ts las vuelve a exportar), PROG (el estado), botonOrden,
 * casillaPrograma, BOTON_VAMOS, BOTON_BORRAR, solucionPrograma y titoProgramaEnPantalla.
 * Importa: three, del núcleo lo que dibuja, suena y habla y las monedas; las reglas de dominio/programa.ts y de
 * dominio/monedas.ts; el motor, las piezas 3D y a Tito.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas del tablero, las posiciones en la pantalla de 1600x900, los
   tiempos y los colores son el dibujo mismo. */
import * as THREE from 'three';
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import type { Mundo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  PI,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  ctx,
  drawCoinHUD,
  drawHome,
  giveCoins,
  go,
  hR,
  inCoinHUD,
  later,
  say,
  sayQ,
  sceneName,
  text,
} from '../nucleo/indice.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import {
  PROGRAMA,
  ejecutar,
  nivelesDe,
  ordenesDe,
  siguienteOrden,
  solucion,
  type NivelPrograma,
  type Orden,
  type PasoPrograma,
  type Posicion,
  type Resultado,
} from '../dominio/programa.ts';
import { camRig, newWorld, projO, setWorld } from './motor.ts';
import { Box, Sph, V3, grp, mk, picTex, spr } from './materiales.ts';
import { makeTito } from './personajes.ts';

/** La ejecución que se ve ahora: los pasos, cómo acaba, la tarjeta que falla y cuándo empezó. */
interface Corre {
  pasos: PasoPrograma[];
  fin: Resultado;
  fallo: number;
  t0: number;
}

/** El estado del rincón: el tablero (0 a 2), el programa, la fase (poner tarjetas, Tito andando, tablero hecho), la
 * tarjeta roja (-1 si ninguna), dónde se ha quedado Tito y la ejecución que se ve. */
export const PROG = {
  nivel: 0,
  programa: [] as Orden[],
  fase: 'editar' as 'editar' | 'corre' | 'bien',
  fallo: -1,
  donde: null as Posicion | null,
  corre: null as Corre | null,
};

// CELDA: lo que mide una casilla del tablero (en 3D); PASO_T: lo que tarda Tito en cada tarjeta (segundos).
const CELDA = 1.3,
  PASO_T = 0.55;
// BOTON_VAMOS, BOTON_BORRAR: los botones de la derecha (esquina de arriba a la izquierda y tamaño).
export const BOTON_VAMOS = { x: 1330, y: 420, w: 240, h: 130 };
export const BOTON_BORRAR = { x: 1330, y: 600, w: 240, h: 100 };
// LO_QUE_DICE: lo que dice Tito al poner cada tarjeta (para los que aún no leen).
const LO_QUE_DICE: Readonly<Record<Orden, string>> = {
  av: 'Adelante.',
  iz: 'Gira a la izquierda.',
  de: 'Gira a la derecha.',
  x2: 'Otra vez la de antes.',
};
// FALLA: lo que dice Tito cuando el programa no llega a la fresa, según cómo acaba.
const FALLA: Readonly<Record<Exclude<Resultado, 'meta'>, string>> = {
  roca: '¡Ay! Tito se ha chocado con una roca. Toca la tarjeta roja para quitarla.',
  fuera: '¡Uy! Por ahí Tito se sale del tablero. Toca la tarjeta roja para quitarla.',
  corto: 'Tito no ha llegado a la fresa todavía. Pon más tarjetas.',
};
// AYUDA_EDAD: lo que se explica al empezar, además de la consigna, según la edad (con 3 años, nada más).
const AYUDA_EDAD: Readonly<Record<number, string>> = {
  4: 'Las flechas curvas hacen que Tito se gire, sin moverse de su casilla.',
  5: 'La tarjeta «por dos» repite la tarjeta de antes. ¡Cuidado con las rocas!',
};
const INTRO = '¡Vamos a programar a Tito! Pon flechas para llevarlo hasta la fresa y pulsa «¡Vamos!».';

// edad(): la edad del niño entre 3 y 5 (la que usan las reglas).
const edad = (): number => Math.min(5, Math.max(3, AGE()));
// nivel(): el tablero de ahora.
const nivel = (): NivelPrograma => nivelesDe(edad())[PROG.nivel] ?? nivelesDe(edad())[0]!;
// caben(): cuántas tarjetas caben en el programa con esta edad.
const caben = (): number => PROGRAMA.caben[edad()] ?? 8;

// botonOrden(o): el centro de la tarjeta o en la columna de la izquierda (o null si no se usa con esta edad).
export function botonOrden(o: Orden): { x: number; y: number } | null {
  const i = ordenesDe(edad()).indexOf(o);
  return i < 0 ? null : { x: 150, y: 270 + i * 150 };
}
// casillaPrograma(i): el centro del hueco i de la tira del programa, abajo.
export function casillaPrograma(i: number): { x: number; y: number } {
  return { x: 760 + (i - (caben() - 1) / 2) * 122, y: 812 };
}
// solucionPrograma(): un programa que resuelve el tablero de ahora (para las pruebas).
export const solucionPrograma = (): Orden[] => solucion(nivel(), edad());

// enCaja(x, y, b): ¿está (x, y) dentro del botón b?
const enCaja = (x: number, y: number, b: { x: number; y: number; w: number; h: number }): boolean =>
  x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

// en3D(c): dónde está en 3D (x, z) el centro de la casilla c del tablero de ahora (centrado en el origen).
const en3D = (c: { x: number; y: number }): [number, number] => {
  const m = (nivel().tam - 1) / 2;
  return [(c.x - m) * CELDA, (c.y - m) * CELDA];
};
// angulo(dir): el giro de Tito para mirar hacia dir (0 arriba, que es hacia el fondo; Tito sin girar mira a la derecha).
const angulo = (dir: number): number => PI / 2 - (dir * PI) / 2;
// giro(a, b, k): el ángulo a camino de b (fracción k), por el lado más corto.
const giro = (a: number, b: number, k: number): number =>
  a + (((((b - a + 3 * PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI) * k;

// El mundo 3D del rincón mientras está abierto, Tito (en su grupo) y la fresa.
let mundo: Mundo | null = null,
  titoG: THREE.Group | null = null,
  fresa: THREE.Sprite | null = null;

// coloca(t, p, q, k, salto): pone a Tito entre la posición p y la q (fracción k), con un saltito si anda.
function coloca(t: THREE.Group, p: Posicion, q: Posicion, k: number, salto: boolean): void {
  const [x0, z0] = en3D(p),
    [x1, z1] = en3D(q);
  t.position.set(x0 + (x1 - x0) * k, 0.12 + (salto ? Math.sin(k * PI) * 0.35 : 0), z0 + (z1 - z0) * k);
  t.rotation.set(0, giro(angulo(p.dir), angulo(q.dir), k), 0);
}

// anima(t): en cada cuadro, Tito sigue la ejecución de ahora (paso a paso; si falla, un topetazo hacia delante) o se
// queda donde está; al acabar la ejecución, termina().
function anima(t: THREE.Group): void {
  const c = PROG.corre,
    ini = nivel().inicio;
  if (!c) {
    const p = PROG.donde ?? ini;
    coloca(t, p, p, 0, false);
    return;
  }
  const lista: Posicion[] = [ini, ...c.pasos],
    u = (T - c.t0) / PASO_T,
    k = Math.floor(u);
  if (k < c.pasos.length) {
    const p = lista[k]!,
      q = lista[k + 1]!;
    coloca(t, p, q, u - k, p.x !== q.x || p.y !== q.y);
    return;
  }
  const ultimo = lista[lista.length - 1]!,
    f = Math.min(1, u - k),
    choca = c.fin === 'roca' || c.fin === 'fuera';
  const delante = {
    ...ultimo,
    x: ultimo.x + [0, 1, 0, -1][ultimo.dir]! * 0.3,
    y: ultimo.y + [-1, 0, 1, 0][ultimo.dir]! * 0.3,
  };
  coloca(t, ultimo, choca ? delante : ultimo, choca ? Math.sin(f * PI) : 0, false);
  if (u >= c.pasos.length + 1) termina(c, ultimo);
}

// construye(): el aula en 3D con el tablero de ahora: el suelo, la alfombra, las casillas (a cuadros), las rocas, la
// fresa y Tito, y la cámara desde arriba y un poco delante.
function construye(): Mundo {
  const w = newWorld({ fov: 40, bg: '#FFF2D9', kind: 'programa', shadow: 10 }),
    n = nivel();
  mk(Box(40, 0.2, 30), '#E9C48E', { p: [0, -0.1, 0], ol: 0, to: w.sc });
  mk(Box(n.tam * CELDA + 1, 0.08, n.tam * CELDA + 1), '#9ED2F5', { p: [0, 0.04, 0], ol: 0.02, to: w.sc });
  Array.from({ length: n.tam * n.tam }, (_, i) => ({ x: i % n.tam, y: Math.floor(i / n.tam) })).forEach((c) => {
    const [x, z] = en3D(c);
    mk(Box(CELDA * 0.94, 0.1, CELDA * 0.94), (c.x + c.y) % 2 ? '#BFE6A8' : '#E4F5D6', {
      p: [x, 0.1, z],
      ol: 0.015,
      to: w.sc,
    });
  });
  n.rocas.forEach((r) => {
    const [x, z] = en3D(r);
    mk(Sph(0.5, 12, 10), '#A39C93', { p: [x, 0.3, z], s: [1, 0.7, 1], ol: 0.03, to: w.sc });
  });
  const [fx, fz] = en3D(n.meta),
    f = spr(picTex('fresa'), 1, 1, { p: [fx, 0.75, fz], to: w.sc }),
    t = grp(w.sc, [0, 0, 0]),
    tito = makeTito();
  tito.scale.setScalar(0.42);
  t.add(tito);
  Object.assign(t.userData, { id: 'programaTito' });
  mundo = w;
  titoG = t;
  fresa = f;
  w.upd.push(() => {
    if (sceneName !== 'programa') return;
    anima(t);
    const comida = PROG.fase === 'bien';
    f.position.setY(0.75 + (comida ? 0 : Math.abs(Math.sin(T * 3)) * 0.15));
    f.scale.setScalar(comida ? Math.max(0.01, f.scale.x - 0.03) : 1);
  });
  camRig(w, V3(0, 12, 7.4), V3(0, 0, 0.9), 0);
  return w;
}

// empiezaNivel(i): el tablero i (0 a 2), con el programa vacío y Tito en su sitio.
function empiezaNivel(i: number): void {
  Object.assign(PROG, { nivel: i, programa: [], fase: 'editar', fallo: -1, donde: null, corre: null });
  setWorld(construye());
}

// limpia(): al cambiar el programa, se quita la tarjeta roja y Tito vuelve a su sitio.
function limpia(): void {
  PROG.fallo = -1;
  PROG.donde = null;
}

// ponOrden(o): pone la tarjeta o al final del programa (si cabe) y Tito dice qué hace.
function ponOrden(o: Orden): void {
  if (PROG.programa.length >= caben()) {
    SFX.bad();
    say('Ya no caben más tarjetas. Pulsa «¡Vamos!».');
    return;
  }
  SFX.tap();
  limpia();
  PROG.programa = [...PROG.programa, o];
  say(LO_QUE_DICE[o]);
}

// quita(i): quita la tarjeta i del programa.
function quita(i: number): void {
  SFX.pop();
  limpia();
  PROG.programa = PROG.programa.filter((_, j) => j !== i);
}

// vamos(): Tito sigue el programa (si hay tarjetas).
function vamos(): void {
  if (!PROG.programa.length) {
    SFX.bad();
    say('Primero pon alguna flecha para Tito.');
    return;
  }
  SFX.whoosh();
  limpia();
  PROG.fase = 'corre';
  PROG.corre = { ...ejecutar(nivel(), PROG.programa), t0: T };
}

// termina(c, ultimo): Tito ha hecho el programa: si ha llegado a la fresa, se la come y (tras los tres tableros, con
// las monedas) se pasa al siguiente; si no, lo dice y se arregla el programa (la tarjeta que falla, en rojo).
function termina(c: Corre, ultimo: Posicion): void {
  PROG.corre = null;
  PROG.donde = ultimo;
  if (c.fin !== 'meta') {
    PROG.fase = 'editar';
    PROG.fallo = c.fin === 'corto' ? -1 : c.fallo;
    SFX.bad();
    say(FALLA[c.fin]);
    return;
  }
  PROG.fase = 'bien';
  SFX.munch();
  later(300, () => SFX.tada());
  const [x, y] = fresa ? projO(fresa, 0) : [800, 400],
    ultimoNivel = PROG.nivel >= nivelesDe(edad()).length - 1;
  burst(x, y, 30);
  if (ultimoNivel) {
    say('¡Qué bien programas! Tito se ha comido todas las fresas.');
    later(1000, () => giveCoins(MONEDAS.juegoRepetido, x, y));
  } else say('¡Muy bien! Tito ha llegado a la fresa. ¡Vamos con otra!');
  later(ultimoNivel ? 5000 : 3500, () => {
    if (sceneName === 'programa' && PROG.fase === 'bien') empiezaNivel(ultimoNivel ? 0 : PROG.nivel + 1);
  });
}

// icono(o, x, y, s, color): el dibujo de la tarjeta o (flecha recta, flecha curva a un lado o «×2»), centrado en (x, y).
function icono(o: Orden, x: number, y: number, s: number, color: string): void {
  if (o === 'x2') {
    text('×2', x, y + s * 0.22, s * 0.62, color);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (o === 'av') {
    ctx.moveTo(0, s * 0.38);
    ctx.lineTo(0, -s * 0.12);
  } else {
    const lado = o === 'iz' ? -1 : 1;
    ctx.moveTo(-lado * s * 0.2, s * 0.38);
    ctx.quadraticCurveTo(-lado * s * 0.2, -s * 0.22, lado * s * 0.1, -s * 0.22);
  }
  ctx.stroke();
  ctx.beginPath();
  if (o === 'av') {
    ctx.moveTo(0, -s * 0.42);
    ctx.lineTo(s * 0.26, -s * 0.1);
    ctx.lineTo(-s * 0.26, -s * 0.1);
  } else {
    const lado = o === 'iz' ? -1 : 1;
    ctx.moveTo(lado * s * 0.42, -s * 0.22);
    ctx.lineTo(lado * s * 0.08, -s * 0.48);
    ctx.lineTo(lado * s * 0.08, s * 0.04);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// dibuja(): encima del 3D: el título con los tableros hechos, las tarjetas para elegir, la tira del programa (la que
// hace Tito ahora, con brillo; la que falla, roja) y los botones «¡Vamos!» y «Borrar».
function dibuja(): void {
  card(560, 20, 480, 124, '#FFFFFF', 5, 36);
  text('Programa a Tito', 800, 80, 50, '#3A2E2A', { max: 420 });
  nivelesDe(edad()).forEach((_, i) => {
    const hecho = i < PROG.nivel || (i === PROG.nivel && PROG.fase === 'bien');
    ctx.beginPath();
    ctx.arc(760 + i * 40, 116, 12, 0, PI * 2);
    ctx.fillStyle = hecho ? '#FF6B6B' : '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = K;
    ctx.stroke();
  });
  ordenesDe(edad()).forEach((o) => {
    const b = botonOrden(o)!;
    hR(b.x - 62, b.y - 62, 124, 124);
    card(b.x - 62, b.y - 62, 124, 124, '#FFFFFF', 5, 26);
    icono(o, b.x, b.y, 92, '#5B8DEF');
  });
  const ahora = PROG.corre ? PROG.corre.pasos[Math.floor((T - PROG.corre.t0) / PASO_T)]?.i : undefined;
  Array.from({ length: caben() }, (_, i) => i).forEach((i) => {
    const c = casillaPrograma(i),
      o = PROG.programa[i];
    if (!o) {
      card(c.x - 52, c.y - 52, 104, 104, 'rgba(255,255,255,0.55)', 4, 22, '#B9A98F');
      return;
    }
    const roja = i === PROG.fallo,
      brilla = i === ahora;
    hR(c.x - 52, c.y - 52, 104, 104);
    const fondo = [
      { si: roja, c: '#FF8A8A' },
      { si: brilla, c: '#FFE27A' },
    ].find((q) => q.si)?.c;
    card(c.x - 52, c.y - 52, 104, 104, fondo ?? '#FFFFFF', 5, 22);
    icono(o, c.x, c.y, 78, roja ? '#FFFFFF' : '#5B8DEF');
  });
  const v = BOTON_VAMOS,
    b = BOTON_BORRAR;
  hR(v.x, v.y, v.w, v.h);
  card(v.x, v.y, v.w, v.h, '#7CC86E', 6, 34);
  text('¡Vamos!', v.x + v.w / 2, v.y + 85, 50, '#FFFFFF', { max: v.w - 30 });
  hR(b.x, b.y, b.w, b.h);
  card(b.x, b.y, b.w, b.h, '#FFFFFF', 5, 30);
  text('Borrar', b.x + b.w / 2, b.y + 66, 40, '#3A2E2A', { max: b.w - 30 });
}

// montarPrograma3D(): pone la escena SCENES.programa. La llama mundo3d/mundo3d.ts al montar la capa 3D.
export function montarPrograma3D(): void {
  SCENES.programa = {
    three: true,
    music: 'map',
    // enter(): el primer tablero, con la consigna (y, con 4 y 5 años, lo que hacen las tarjetas nuevas).
    enter(_o: OpcionesEscena) {
      empiezaNivel(0);
      later(300, () => {
        const mas = AYUDA_EDAD[edad()];
        say(INTRO, mas ? () => sayQ(mas) : null);
      });
    },
    // leave(): suelta el mundo del rincón.
    leave() {
      mundo = null;
      titoG = null;
      fresa = null;
    },
    // prompt(): la consigna.
    prompt() {
      say(INTRO);
    },
    // hint(): lo que hay que tocar: la tarjeta roja (para quitarla), la tarjeta que va o, si el programa ya llega,
    // «¡Vamos!».
    hint() {
      if (PROG.fase !== 'editar') return null;
      if (PROG.fallo >= 0) return { ...casillaPrograma(PROG.fallo), r: 60 };
      const r = ejecutar(nivel(), PROG.programa);
      if (r.fin === 'meta')
        return { x: BOTON_VAMOS.x + BOTON_VAMOS.w / 2, y: BOTON_VAMOS.y + BOTON_VAMOS.h / 2, r: 90 };
      const o = siguienteOrden(nivel(), PROG.programa, edad());
      const b = o ? botonOrden(o) : null;
      return b ? { ...b, r: 70 } : { x: BOTON_BORRAR.x + BOTON_BORRAR.w / 2, y: BOTON_BORRAR.y + 50, r: 80 };
    },
    // draw(): las tarjetas, el programa y los botones encima del 3D; la casa y las monedas.
    draw() {
      dibuja();
      drawHome();
      drawCoinHUD();
    },
    // down(x, y): casa -> las clases; monedas -> la tienda; mientras Tito no anda: una tarjeta para ponerla, una del
    // programa para quitarla, «¡Vamos!» o «Borrar».
    down(x: number, y: number) {
      if (atHome(x, y)) {
        SFX.whoosh();
        go('clases');
        return;
      }
      if (inCoinHUD(x, y)) {
        SFX.pop();
        go('tienda');
        return;
      }
      if (PROG.fase !== 'editar') return;
      const o = ordenesDe(edad()).find((q) => {
        const b = botonOrden(q)!;
        return Math.abs(x - b.x) < 66 && Math.abs(y - b.y) < 66;
      });
      if (o) {
        ponOrden(o);
        return;
      }
      const i = PROG.programa.findIndex((_, j) => {
        const c = casillaPrograma(j);
        return Math.abs(x - c.x) < 58 && Math.abs(y - c.y) < 58;
      });
      if (i >= 0) {
        quita(i);
        return;
      }
      if (enCaja(x, y, BOTON_VAMOS)) vamos();
      else if (enCaja(x, y, BOTON_BORRAR) && PROG.programa.length) {
        SFX.pop();
        limpia();
        PROG.programa = [];
      }
    },
  } satisfies Escena;
}

// titoProgramaEnPantalla(): dónde se ve Tito en el tablero (para las pruebas y para depurar), o null si no está.
export function titoProgramaEnPantalla(): { x: number; y: number } | null {
  if (!titoG || !mundo || sceneName !== 'programa') return null;
  const [x, y] = projO(titoG, 0.5);
  return { x, y };
}
