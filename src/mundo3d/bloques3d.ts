/*
 * mundo3d/bloques3d.ts: el rincón de las construcciones, en 3D (idea 23 de docs/IDEAS-MEJORA.md, fase P27). Es la escena
 * SCENES.bloques, que se abre desde las clases del cole (escenas/clases.ts). En la alfombra del aula hay tres sitios
 * para apilar bloques de colores (cubo, cilindro, arco, cono y esfera), que se eligen en la bandeja de abajo y caen en
 * su montón. Encima del cono y de la esfera no se sostiene nada: lo que se pone rueda y se cae. Los cuatro juegos, que
 * se eligen al entrar (las reglas, en dominio/bloques.ts):
 * - Copia la torre: a la derecha está el modelo, y se copia de abajo arriba en el centro (la ayuda señala la forma que
 *   va; otra no se pone).
 * - Una casa: un animal necesita una casa; las paredes (cubos o cilindros) se levantan solas a los dos lados, una y
 *   otra, hasta el alto que toque, y luego el tejado.
 * - ¿Cuántos hay?: una torre ya hecha y tres números; dos rondas.
 * - Libre: se toca el sitio donde se quiere poner y se eligen las formas; el botón del jardín lo lleva al jardín de Tito
 *   (S.bloques.jardin), donde se ve en el mapa (bloquesJardin3, que llama buildMap de mundo3d/mapa3d.ts).
 * Cada juego terminado (y lo llevado al jardín) da 2 monedas (MONEDAS.juegoRepetido) y se vuelve a elegir juego. La casa
 * vuelve a la elección y, desde ella, a las clases.
 * montarBloques3D() la llama mundo3d/mundo3d.ts al montar la capa 3D: sin WebGL no hay escena y las clases enseñan el
 * rincón como «¡Muy pronto!».
 * Exporta: montarBloques3D, bloquesJardin3 y, para las pruebas (mundo3d.ts las vuelve a exportar), BLOQ (el estado),
 * casillaForma, sitioPila, botonJuego, opcionNumero y BOTON_JARDIN.
 * Importa: three, del núcleo lo que dibuja, suena y habla, S y las monedas; azar() de aplicacion/puertos.ts; las reglas
 * de dominio/bloques.ts y de dominio/monedas.ts; el motor y las piezas 3D.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas del aula y de los bloques, las posiciones en la pantalla de
   1600x900 y los colores son el dibujo mismo. */
import * as THREE from 'three';
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import type { Mundo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  PI,
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
  later,
  save,
  say,
  sceneName,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import {
  BLOQUES,
  casaLista,
  leeJardin,
  paredes,
  planCasa,
  planContar,
  planCopiar,
  poner,
  siguienteCopia,
  type Forma,
  type PlanCasa,
  type PlanContar,
  type Torres,
} from '../dominio/bloques.ts';
import { camRig, newWorld, projO, setWorld } from './motor.ts';
import { Box, Cone, Cyl, Sph, V3, grp, mk, picTex, spr } from './materiales.ts';

/** Los juegos del rincón. */
type Juego = 'copiar' | 'casa' | 'contar' | 'libre';

/** El estado del rincón: la fase (elegir juego, jugar o acabado), el juego, los montones, el montón elegido (libre), el
 * modelo (copiar), la casa, la torre de contar y la ronda, y lo que cae o rueda ahora. */
export const BLOQ = {
  fase: 'menu' as 'menu' | 'juego' | 'hecho',
  juego: 'libre' as Juego,
  torres: [[], [], []] as Torres,
  pila: 1,
  modelo: [] as Forma[],
  casa: null as PlanCasa | null,
  contar: null as PlanContar | null,
  ronda: 0,
  cae: null as null | { m: number; t: number },
  rueda: null as null | { m: number; f: Forma; t: number },
};

// X_PILA: la x de cada montón en la alfombra (izquierda, centro y derecha); X_MODELO: la del modelo de copiar.
const X_PILA = [-3.2, 0, 3.2];
const X_MODELO = 5.6;
// COLOR: el color de cada forma.
const COLOR: Readonly<Record<Forma, string>> = {
  cubo: '#E8554E',
  cilindro: '#5B8DEF',
  arco: '#FFC93C',
  cono: '#5DBB55',
  esfera: '#9B6BD6',
  tejado: '#D9603B',
};
// NOMBRE: lo que pone debajo de cada forma en la bandeja.
const NOMBRE: Readonly<Record<Forma, string>> = {
  cubo: 'Cubo',
  cilindro: 'Cilindro',
  arco: 'Arco',
  cono: 'Cono',
  esfera: 'Esfera',
  tejado: 'Tejado',
};
// PIDE_FORMA: lo que dice Tito en copiar cuando se elige otra forma: la que va (frases enteras, para traducirlas).
const PIDE_FORMA: Readonly<Record<Forma, string>> = {
  cubo: 'Mira el modelo: ahora va el cubo.',
  cilindro: 'Mira el modelo: ahora va el cilindro.',
  arco: 'Mira el modelo: ahora va el arco.',
  cono: 'Mira el modelo: ahora va el cono.',
  esfera: 'Mira el modelo: ahora va la esfera.',
  tejado: 'Mira el modelo.',
};
// PREGUNTA_CONTAR: la pregunta de contar, según lo que se cuenta.
const PREGUNTA_CONTAR: Readonly<Record<string, string>> = {
  todos: '¿Cuántos bloques hay en la torre? Cuéntalos y toca el número.',
  cubo: '¿Cuántos cubos hay en la torre? Cuéntalos y toca el número.',
  cilindro: '¿Cuántos cilindros hay en la torre? Cuéntalos y toca el número.',
  arco: '¿Cuántos arcos hay en la torre? Cuéntalos y toca el número.',
};
// CONSIGNA: lo que dice Tito al empezar cada juego.
const CONSIGNA: Readonly<Record<Juego, string>> = {
  copiar: '¡Vamos a copiar la torre! Mira el modelo y pon los bloques en el mismo orden, de abajo arriba.',
  casa: '¡Nuestro amigo necesita una casa! Haz las dos paredes con cubos o cilindros, y después pon el tejado.',
  contar: '¿Cuántos bloques hay en la torre? Cuéntalos y toca el número.',
  libre:
    '¡Construye lo que quieras! Toca dónde poner los bloques y elige las formas. Cuando acabes, llévalo al jardín de Tito.',
};

// JUEGOS: los botones para elegir juego (centro en la pantalla) con su título.
const JUEGOS: readonly { id: Juego; x: number; titulo: string }[] = [
  { id: 'copiar', x: 380, titulo: 'Copia la torre' },
  { id: 'casa', x: 660, titulo: 'Una casa' },
  { id: 'contar', x: 940, titulo: '¿Cuántos hay?' },
  { id: 'libre', x: 1220, titulo: 'Libre' },
];
// botonJuego(j): el centro del botón del juego j en la elección.
export function botonJuego(j: Juego): { x: number; y: number } {
  return { x: JUEGOS.find((b) => b.id === j)!.x, y: 470 };
}
// BOTON_JARDIN: el botón «¡Al jardín!» del juego libre.
export const BOTON_JARDIN = { x: 1190, y: 770, w: 300, h: 90 };

// bandeja(): las formas que salen en la bandeja (en la casa, también el tejado; contando, ninguna).
const bandeja = (): readonly Forma[] => {
  if (BLOQ.juego === 'contar') return [];
  return BLOQ.juego === 'casa' ? [...BLOQUES.bandeja, 'tejado'] : BLOQUES.bandeja;
};
// casillaForma(f): el centro de la casilla de la forma f en la bandeja (abajo, en fila), o null si no está.
export function casillaForma(f: Forma): { x: number; y: number } | null {
  const b = bandeja(),
    i = b.indexOf(f);
  return i < 0 ? null : { x: 800 + (i - (b.length - 1) / 2) * 150 - (BLOQ.juego === 'libre' ? 110 : 0), y: 815 };
}
// opcionNumero(i): el centro del número i de contar (abajo, en fila).
export function opcionNumero(i: number): { x: number; y: number } {
  const n = BLOQ.contar?.opciones.length ?? 3;
  return { x: 800 + (i - (n - 1) / 2) * 220, y: 800 };
}

// mundo: el mundo 3D del rincón mientras está abierto (para proyectar los montones y rehacer los bloques).
let mundo: Mundo | null = null;
// bloquesG: el grupo con los bloques de los montones (se rehace cuando cambian); pads: las alfombrillas de cada montón.
let bloquesG: THREE.Group | null = null;
let pads: THREE.Object3D[] = [];

// sitioPila(m): dónde se ve en la pantalla el montón m (un poco por encima de la alfombrilla), para tocarlo.
export function sitioPila(m: number): { x: number; y: number } {
  const p = pads[m];
  if (!p) return { x: 800 + (m - 1) * 300, y: 520 };
  const [x, y] = projO(p, 1);
  return { x, y };
}

// bloque3(to, f, x, y, s): un bloque de la forma f en el grupo to, con su base en (x, y) y el tamaño s (1, el de la
// mesa; alto de un bloque, s). El tejado es un prisma tumbado que va de pared a pared.
export function bloque3(to: THREE.Object3D, f: Forma, x: number, y: number, s = 1): THREE.Group {
  const g = grp(to, [x, y, 0], s),
    c = COLOR[f];
  if (f === 'cubo') mk(Box(0.95, 0.95, 0.95), c, { p: [0, 0.475, 0], to: g, ol: 0.03 });
  else if (f === 'cilindro') mk(Cyl(0.47, 0.47, 0.95, 20), c, { p: [0, 0.475, 0], to: g, ol: 0.03 });
  else if (f === 'cono') mk(Cone(0.5, 1, 20), c, { p: [0, 0.5, 0], to: g, ol: 0.03 });
  else if (f === 'esfera') mk(Sph(0.48, 18, 14), c, { p: [0, 0.48, 0], to: g, ol: 0.03 });
  else if (f === 'tejado')
    mk(Cyl(0.85, 0.85, X_PILA[2]! - X_PILA[0]! + 1.6, 3), c, { p: [0, 0.42, 0], r: [0, 0, PI / 2], to: g, ol: 0.03 });
  else {
    [-0.33, 0.33].forEach((dx) => mk(Box(0.3, 0.68, 0.95), c, { p: [dx, 0.34, 0], to: g, ol: 0.03 }));
    mk(Box(0.96, 0.28, 0.95), c, { p: [0, 0.82, 0], to: g, ol: 0.03 });
  }
  return g;
}

// torre3(to, torre, x, s, cae): los bloques de una torre de abajo arriba, en la x dada; el de arriba, si cae (tiempo
// desde que se puso), baja desde arriba.
function torre3(to: THREE.Object3D, torre: readonly Forma[], x: number, s: number, cae: number | null): void {
  torre.forEach((f, i) => {
    const arriba = i === torre.length - 1 && cae !== null,
      dy = arriba ? Math.max(0, 1 - cae / 0.35) * 3 : 0;
    bloque3(to, f, f === 'tejado' ? 0 : x, (i + dy) * s, s);
  });
}

// rehaz(): vuelve a hacer los bloques de la mesa (los montones; el modelo de copiar; la torre de contar; en la casa,
// el tejado encima de las paredes) con lo que cae ahora.
function rehaz(): void {
  if (!mundo) return;
  if (bloquesG) mundo.sc.remove(bloquesG);
  const g = grp(mundo.sc, [0, 0, 0]),
    c = BLOQ.cae,
    cae = (m: number) => (c && c.m === m ? T - c.t : null);
  bloquesG = g;
  if (BLOQ.fase === 'menu') return;
  if (BLOQ.juego === 'contar' && BLOQ.contar) {
    torre3(g, BLOQ.contar.torre, 0, 1, null);
    return;
  }
  BLOQ.torres.forEach((t, m) => {
    const tejado = BLOQ.juego === 'casa' && m === 1;
    if (tejado) {
      if (t.length) bloque3(g, 'tejado', 0, (BLOQ.casa?.alto ?? 1) - 0.05);
      return;
    }
    torre3(g, t, X_PILA[m]!, 1, cae(m));
  });
  if (BLOQ.juego === 'copiar') torre3(grp(g, [0, 0.4, 0]), BLOQ.modelo, X_MODELO, 0.7, null); // encima del pedestal
}

// construye(): el aula en 3D: el suelo de madera, la alfombra con las tres alfombrillas de los montones, la pared con
// la pizarra, el pedestal del modelo (solo al copiar), el animal de la casa (si toca) y la cámara. En cada cuadro, lo que cae y lo que
// rueda.
function construye(): Mundo {
  const w = newWorld({ fov: 40, bg: '#FFF2D9', kind: 'bloques', shadow: 12 });
  mk(Box(40, 0.2, 24), '#E9C48E', { p: [0, -0.1, 0], ol: 0, to: w.sc });
  mk(Box(40, 14, 0.4), '#FFF2D9', { p: [0, 7, -6], ol: 0, to: w.sc });
  mk(Box(8, 3.4, 0.2), '#3F6B4E', { p: [0, 6.2, -5.7], ol: 0.03, to: w.sc });
  mk(Box(12, 0.06, 5), '#9ED2F5', { p: [0, 0.03, 0], ol: 0.02, to: w.sc });
  pads = X_PILA.map((x) => mk(Cyl(0.75, 0.75, 0.05, 24), '#FFFFFF', { p: [x, 0.08, 0], ol: 0.02, to: w.sc }));
  if (BLOQ.juego === 'copiar' && BLOQ.fase !== 'menu')
    mk(Box(1.4, 0.4, 1.4), '#C98A4B', { p: [X_MODELO, 0.2, 0], ol: 0.03, to: w.sc });
  if (BLOQ.juego === 'casa' && BLOQ.casa && BLOQ.fase !== 'menu')
    spr(picTex(BLOQ.casa.animal), 1.5, 1.5, { p: [0, 0.8, 0.3], to: w.sc });
  mundo = w;
  rehaz();
  const marca = mk(new THREE.RingGeometry(0.85, 1, 32), '#FFC93C', { r: [-PI / 2, 0, 0], ol: 0, cs: false, to: w.sc });
  w.upd.push(() => {
    if (sceneName !== 'bloques') return;
    marca.visible = BLOQ.fase === 'juego' && BLOQ.juego === 'libre';
    marca.position.set(X_PILA[BLOQ.pila]!, 0.12, 0);
    marca.scale.setScalar(1 + Math.sin(T * 5) * 0.05);
    if (BLOQ.cae) {
      if (T - BLOQ.cae.t > 0.4) BLOQ.cae = null;
      rehaz();
    }
    ruedaTick();
  });
  camRig(w, V3(0, 6.5, 12), V3(0.6, 2.2, 0), 0);
  return w;
}

// ruedaG: el bloque que rueda y se cae ahora (el que se puso encima de un cono o una esfera).
let ruedaG: THREE.Group | null = null;
// ruedaTick(): el bloque que rueda sale de lo alto de su montón, gira hacia un lado y cae al suelo; al acabar, se quita.
function ruedaTick(): void {
  const r = BLOQ.rueda;
  if (!mundo) return;
  if (!r) {
    if (ruedaG) mundo.sc.remove(ruedaG);
    ruedaG = null;
    return;
  }
  const k = Math.min(1, (T - r.t) / 0.9),
    alto = BLOQ.torres[r.m]?.length ?? 0;
  if (!ruedaG) ruedaG = bloque3(mundo.sc, r.f, X_PILA[r.m]!, alto);
  ruedaG.position.set(X_PILA[r.m]! + k * 1.8, Math.max(0, alto + Math.sin(k * PI) * 0.6 - k * k * alto), 0);
  ruedaG.rotation.z = -k * PI * 1.5;
  if (k >= 1) BLOQ.rueda = null;
}

// empieza(j): empieza el juego j: los montones vacíos y su plan (el modelo, la casa o la torre de contar).
function empieza(j: Juego): void {
  const e = AGE();
  Object.assign(BLOQ, {
    fase: 'juego',
    juego: j,
    torres: [[], [], []],
    pila: 1,
    modelo: j === 'copiar' ? planCopiar(e, azar) : [],
    casa: j === 'casa' ? planCasa(e, azar) : null,
    contar: j === 'contar' ? planContar(e, azar) : null,
    ronda: 0,
    cae: null,
    rueda: null,
  });
  setWorld(construye());
  say(j === 'contar' ? PREGUNTA_CONTAR[BLOQ.contar!.cuenta]! : CONSIGNA[j]);
}

// acaba(frase): el juego se ha terminado: Tito lo celebra (frase), da las monedas y, un rato después, se vuelve a
// elegir juego.
function acaba(frase: string): void {
  BLOQ.fase = 'hecho';
  SFX.tada();
  burst(800, 350, 30);
  say(frase);
  later(1000, () => giveCoins(MONEDAS.juegoRepetido, 800, 350));
  later(4500, () => {
    if (sceneName === 'bloques' && BLOQ.fase === 'hecho') alMenu();
  });
}

// alMenu(): vuelve a la elección de juego (la mesa vacía).
function alMenu(): void {
  BLOQ.fase = 'menu';
  setWorld(construye());
  say('¡El rincón de las construcciones! Elige un juego.');
}

// pon(m, f): pone la forma f en el montón m (cae desde arriba); si rueda o no cabe, Tito lo dice. Devuelve si se ha
// puesto.
function pon(m: number, f: Forma): boolean {
  const { torres, r } = poner(BLOQ.torres, m, f);
  if (r === 'lleno') {
    SFX.bad();
    say('¡Esta torre ya está muy alta!');
    return false;
  }
  if (r === 'rueda') {
    SFX.boing();
    BLOQ.rueda = { m, f, t: T };
    const arriba = BLOQ.torres[m]![BLOQ.torres[m]!.length - 1];
    say(
      arriba === 'esfera'
        ? 'Encima de la esfera no se sostiene nada: ¡ha rodado!'
        : 'Encima del cono no se sostiene nada: ¡se ha caído!',
    );
    return false;
  }
  BLOQ.torres = torres;
  BLOQ.cae = { m, t: T };
  SFX.pop();
  rehaz();
  return true;
}

// tocaForma(f): se ha elegido la forma f en la bandeja: según el juego, se pone donde toca (o Tito dice por qué no).
function tocaForma(f: Forma): void {
  if (BLOQ.juego === 'libre') {
    pon(BLOQ.pila, f);
    return;
  }
  if (BLOQ.juego === 'copiar') {
    const va = siguienteCopia(BLOQ.modelo, BLOQ.torres[1]!);
    if (f !== va) {
      SFX.bad();
      say(PIDE_FORMA[va ?? 'tejado']);
      return;
    }
    pon(1, f);
    if (!siguienteCopia(BLOQ.modelo, BLOQ.torres[1]!))
      later(500, () => acaba('¡Igualita que el modelo! ¡Qué bien copiada!'));
    return;
  }
  tocaCasa(f);
}

// tocaCasa(f): en la casa: el tejado, solo con las paredes acabadas (y la casa queda lista); las paredes, solo con cubos
// o cilindros, hasta el alto que toca.
function tocaCasa(f: Forma): void {
  const alto = BLOQ.casa?.alto ?? 1,
    listas = [0, 2].every((m) => BLOQ.torres[m]!.length >= alto);
  if (f === 'tejado') {
    if (!listas) {
      SFX.bad();
      say('Primero hay que terminar las dos paredes.');
      return;
    }
    BLOQ.torres = BLOQ.torres.map((t, i) => (i === 1 ? ['tejado'] : t));
    BLOQ.cae = { m: 1, t: T };
    SFX.pop();
    rehaz();
    if (casaLista(BLOQ.torres, alto)) later(500, () => acaba('¡Qué casa tan bonita! Ya tiene dónde vivir.'));
    return;
  }
  if (f !== 'cubo' && f !== 'cilindro') {
    SFX.bad();
    say('Para las paredes, mejor cubos o cilindros: son rectos.');
    return;
  }
  if (listas) {
    say('Las paredes ya están. ¡Ahora el tejado!');
    return;
  }
  pon(paredes(BLOQ.torres), f);
}

// tocaNumero(i): contando, se ha elegido el número i: si es el bueno, otra ronda (o se acaba); si no, otra vez.
function tocaNumero(i: number): void {
  const c = BLOQ.contar!;
  if (c.opciones[i] !== c.respuesta) {
    SFX.bad();
    say('¡Cuéntalos otra vez, despacito!');
    return;
  }
  SFX.good();
  sparkles(opcionNumero(i).x, opcionNumero(i).y, 12);
  if (BLOQ.ronda >= 1) {
    acaba(fmt('¡Muy bien! Son {n}.', { n: c.respuesta }));
    return;
  }
  BLOQ.ronda = 1;
  BLOQ.contar = planContar(AGE(), azar);
  rehaz();
  say(fmt('¡Muy bien! Son {n}.', { n: c.respuesta }), () => {
    if (sceneName === 'bloques' && BLOQ.contar) say(PREGUNTA_CONTAR[BLOQ.contar.cuenta]!);
  });
}

// alJardin(): lleva lo construido al jardín de Tito (S.bloques), si hay algo.
function alJardin(): void {
  if (!BLOQ.torres.some((t) => t.length)) {
    SFX.bad();
    say('Primero construye algo.');
    return;
  }
  S.bloques = { jardin: BLOQ.torres.map((t) => [...t]) };
  save();
  acaba('¡Lo llevamos al jardín de Tito! Míralo en el mapa, al lado de su casa.');
}

// formaIcono(f, x, y, s): el dibujo plano de la forma f (para la bandeja), con el centro en (x, y) y el tamaño s.
function formaIcono(f: Forma, x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = COLOR[f];
  ctx.strokeStyle = K;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (f === 'cubo') ctx.rect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
  else if (f === 'esfera') ctx.arc(0, 0, s * 0.42, 0, PI * 2);
  else if (f === 'cono') {
    ctx.moveTo(0, -s * 0.45);
    ctx.lineTo(s * 0.4, s * 0.4);
    ctx.lineTo(-s * 0.4, s * 0.4);
    ctx.closePath();
  } else if (f === 'tejado') {
    ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(s * 0.5, s * 0.3);
    ctx.lineTo(-s * 0.5, s * 0.3);
    ctx.closePath();
  } else if (f === 'cilindro') {
    ctx.rect(-s * 0.32, -s * 0.32, s * 0.64, s * 0.7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.32, s * 0.32, s * 0.12, 0, 0, PI * 2);
  } else {
    ctx.moveTo(-s * 0.42, s * 0.4);
    ctx.lineTo(-s * 0.42, -s * 0.4);
    ctx.lineTo(s * 0.42, -s * 0.4);
    ctx.lineTo(s * 0.42, s * 0.4);
    ctx.lineTo(s * 0.18, s * 0.4);
    ctx.arc(0, s * 0.4, s * 0.18, 0, PI, true);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// dibujaBandeja(): la bandeja de formas (la que va en copiar, con un brillo) o, contando, los tres números.
function dibujaBandeja(): void {
  if (BLOQ.juego === 'contar') {
    BLOQ.contar?.opciones.forEach((n, i) => {
      const o = opcionNumero(i);
      hR(o.x - 90, o.y - 70, 180, 140);
      card(o.x - 90, o.y - 70, 180, 140, '#FFFFFF', 5, 26);
      text(String(n), o.x, o.y + 32, 96, '#5B8DEF');
    });
    return;
  }
  bandeja().forEach((f) => {
    const o = casillaForma(f)!;
    hR(o.x - 66, o.y - 70, 132, 140);
    card(o.x - 66, o.y - 70, 132, 140, '#FFFFFF', 5, 22);
    formaIcono(f, o.x, o.y - 14, 70);
    text(NOMBRE[f], o.x, o.y + 52, 24, '#3A2E2A', { max: 120 });
  });
}

// dibujaMenu(): la elección de juego: un botón por juego, con su dibujo y su título.
function dibujaMenu(): void {
  card(500, 150, 600, 90, '#FFFFFF', 5, 40);
  text('Construcciones', 800, 215, 54, '#3A2E2A', { max: 560 });
  const iconos: Readonly<Record<Juego, readonly Forma[]>> = {
    copiar: ['cubo', 'cilindro'],
    casa: ['tejado', 'cubo'],
    contar: ['arco', 'cubo'],
    libre: ['esfera', 'cono'],
  };
  JUEGOS.forEach((b) => {
    const { x, y } = botonJuego(b.id);
    hR(x - 125, y - 140, 250, 280);
    card(x - 125, y - 140, 250, 280, '#FFFFFF', 6, 30);
    iconos[b.id].forEach((f, i) => formaIcono(f, x, y - 70 + i * 80, 80));
    if (b.id === 'contar') text('?', x + 70, y - 30, 70, '#5B8DEF');
    text(b.titulo, x, y + 115, 30, '#3A2E2A', { max: 230 });
  });
}

// montarBloques3D(): pone la escena SCENES.bloques. La llama mundo3d/mundo3d.ts al montar la capa 3D.
export function montarBloques3D(): void {
  SCENES.bloques = {
    three: true,
    music: 'map',
    // enter(): la elección de juego, con la mesa vacía.
    enter(_o: OpcionesEscena) {
      BLOQ.fase = 'menu';
      setWorld(construye());
      later(300, () => this.prompt!());
    },
    // prompt(): la consigna: elegir juego, la del juego o, contando, la pregunta.
    prompt() {
      if (BLOQ.fase === 'menu') say('¡El rincón de las construcciones! Elige un juego.');
      else if (BLOQ.juego === 'contar' && BLOQ.contar) say(PREGUNTA_CONTAR[BLOQ.contar.cuenta]!);
      else if (BLOQ.fase === 'juego') say(CONSIGNA[BLOQ.juego]);
    },
    // hint(): lo que hay que tocar: en la elección, copiar la torre; copiando, la forma que va; en la casa, la pared o
    // el tejado; contando, el número bueno.
    hint() {
      if (BLOQ.fase === 'menu') return { ...botonJuego('copiar'), r: 130 };
      if (BLOQ.fase !== 'juego') return null;
      if (BLOQ.juego === 'copiar') {
        const o = casillaForma(siguienteCopia(BLOQ.modelo, BLOQ.torres[1]!) ?? 'cubo');
        return o && { ...o, r: 70 };
      }
      if (BLOQ.juego === 'casa') {
        const listas = [0, 2].every((m) => BLOQ.torres[m]!.length >= (BLOQ.casa?.alto ?? 1));
        return { ...casillaForma(listas ? 'tejado' : 'cubo')!, r: 70 };
      }
      if (BLOQ.juego === 'contar' && BLOQ.contar) {
        const c = BLOQ.contar;
        return { ...opcionNumero(c.opciones.indexOf(c.respuesta)), r: 90 };
      }
      return null;
    },
    // draw(): encima del 3D: la elección de juego o la bandeja (y en el juego libre, el botón del jardín); la casa y las
    // monedas.
    draw() {
      if (BLOQ.fase === 'menu') dibujaMenu();
      else if (BLOQ.fase === 'juego') {
        dibujaBandeja();
        if (BLOQ.juego === 'libre') {
          const b = BOTON_JARDIN;
          hR(b.x, b.y, b.w, b.h);
          card(b.x, b.y, b.w, b.h, '#7CC86E', 5, 30);
          text('¡Al jardín!', b.x + b.w / 2, b.y + 60, 40, '#FFFFFF', { max: b.w - 30 });
        }
      } else circ(800, 350, 60 + Math.sin(T * 6) * 6, '#FFD66B', 6);
      drawHome();
      drawCoinHUD();
    },
    // down(x, y): casa -> la elección (o, desde ella, las clases); monedas -> la tienda; en la elección, un juego; en el
    // juego, una forma, un número, el botón del jardín o (libre) el montón donde poner.
    down(x: number, y: number) {
      if (atHome(x, y)) {
        SFX.whoosh();
        if (BLOQ.fase === 'menu') go('clases');
        else alMenu();
        return;
      }
      if (inCoinHUD(x, y)) {
        SFX.pop();
        go('tienda');
        return;
      }
      if (BLOQ.fase === 'menu') {
        const b = JUEGOS.find((j) => Math.abs(x - j.x) < 125 && Math.abs(y - botonJuego(j.id).y) < 140);
        if (b) {
          SFX.pop();
          empieza(b.id);
        }
        return;
      }
      if (BLOQ.fase !== 'juego' || BLOQ.rueda) return;
      if (BLOQ.juego === 'contar') {
        const i = (BLOQ.contar?.opciones ?? []).findIndex(
          (_, j) => dist(x, y, opcionNumero(j).x, opcionNumero(j).y) < 90,
        );
        if (i >= 0) tocaNumero(i);
        return;
      }
      const f = bandeja().find((g) => {
        const o = casillaForma(g)!;
        return Math.abs(x - o.x) < 66 && Math.abs(y - o.y) < 70;
      });
      if (f) {
        tocaForma(f);
        return;
      }
      if (BLOQ.juego !== 'libre') return;
      const b = BOTON_JARDIN;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        alJardin();
        return;
      }
      const m = [0, 1, 2].find((i) => Math.abs(x - sitioPila(i).x) < 150 && y > 150 && y < 700);
      if (m !== undefined) {
        SFX.tap();
        BLOQ.pila = m;
      }
    },
  } satisfies Escena;
}

// bloquesJardin3(w, x, z): lo construido que se llevó al jardín (S.bloques), en pequeño y con los montones más juntos
// que en la mesa (para que quepa en el césped), en el suelo del mapa en (x, z); si no hay nada, nada.
export function bloquesJardin3(w: Mundo, x: number, z: number): void {
  const torres = leeJardin(S.bloques);
  if (!torres) return;
  const g = grp(w.sc, [x, 0, z], 0.7);
  torres.forEach((t, m) => torre3(g, t, (m - 1) * 1.5, 1, null));
}
