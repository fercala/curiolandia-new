/*
 * mundo3d/tren3d.ts: el tren de Curiolandia, en 3D (resto de la idea 19 de docs/IDEAS-MEJORA.md, fase P28). En el mapa
 * hay una estación con su trenecito (estacionTren3, a la izquierda de la isla); al tocarla, Tito va andando y empieza el
 * viaje: la escena SCENES.tren.
 * El viaje: una isla con una vía cerrada alrededor, y el tren (la locomotora con Tito y dos vagones) que da la vuelta
 * entera con la cámara detrás. Por el camino pasa por túneles (dentro, la pantalla se pone oscura) que el niño cuenta;
 * para en el bosque, la montaña y la playa, donde suben Lupi, Polly y el pato; y junto a la vía hay animales a los que
 * decir adiós tocándolos. Tocar la locomotora toca la bocina y echa humo. Al volver a la estación, Tito pregunta
 * cuántos túneles han pasado y se elige entre tres números; el bueno da 2 monedas (MONEDAS.juegoRepetido) y se vuelve
 * al mapa. Las reglas (los túneles según la edad, las paradas y los animales), en dominio/tren.ts.
 * montarTren3D() la llama mundo3d/mundo3d.ts al montar la capa 3D: sin WebGL no hay mapa 3D ni estación.
 * Exporta: TREN_ST (el viaje de ahora), montarTren3D, estacionTren3, tocarEstacion y, para las pruebas (mundo3d.ts las
 * vuelve a exportar), numeroTren, animalEnPantalla, locoEnPantalla y estacionEnPantalla.
 * Importa: three; del núcleo lo que dibuja, suena y habla; las reglas de dominio/tren.ts; el motor, las piezas, el
 * decorado, Tito en 3D y walkTo para ir a la estación.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas de la isla, la vía y el tren, la cámara y las posiciones
   en la pantalla de 1600x900 son el dibujo mismo. */
import * as THREE from 'three';
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import type { Mundo } from './tipos.ts';
import {
  AGE,
  PI,
  SCENES,
  SFX,
  T,
  W,
  H,
  atHome,
  burst,
  card,
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
  say,
  sceneName,
  sparkles,
  text,
  tone,
  playSound,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import { TREN, paradaEn, planTren, tunelEn, type PlanTren } from '../dominio/tren.ts';
import { W3, camRig, newWorld, pickAt, projO, setWorld } from './motor.ts';
import { Box, Cone, Cyl, V3, grp, mk, picTex, spr } from './materiales.ts';
import { tree3 } from './decorado.ts';
import { makeTito } from './personajes.ts';
import { walkTo } from './interaccion.ts';

/** En qué momento va el viaje: saliendo, andando, parado en una parada, preguntando los túneles o terminado. */
type FaseTren = 'sale' | 'viaje' | 'parada' | 'pregunta' | 'fin';

/** El viaje de ahora: la fase, el plan, por dónde va (u, de 0 a 1), la parada en curso, las paradas hechas, quién ha
 * subido, el túnel en el que está (-1 fuera), el número elegido que estaba mal y cuándo se tocó la bocina. */
export const TREN_ST = {
  fase: 'sale' as FaseTren,
  plan: null as PlanTren | null,
  u: 0,
  parada: null as { id: string; t: number } | null,
  hechas: [] as string[],
  suben: [] as string[],
  tunel: -1,
  mal: -1,
  bocina: -10,
};

// RX, RZ: los radios de la vía (una elipse alrededor de la isla). LARGO: lo que mide la vuelta, más o menos.
const RX = 22,
  RZ = 14,
  LARGO = 2 * PI * Math.sqrt((RX * RX + RZ * RZ) / 2);
// VEL: la velocidad del tren (unidades por segundo). VAGONES: a cuánto va cada vagón detrás de la locomotora.
const VEL = 6.5,
  VAGONES = [2.9, 5.6];
// ASIENTOS: dónde se sienta cada pasajero, a un lado o al otro del vagón (para no tapar a Tito).
const ASIENTOS = [-0.42, 0.42, 0];

// FRASES: lo que dice Tito en el viaje (frases enteras, para traducirlas bien).
const INTRO =
    '¡Viajeros, al tren! Vamos a dar la vuelta a Curiolandia. Cuenta los túneles por los que pasamos. Toca el tren para tocar la bocina.',
  AYUDA = 'Cuenta los túneles por los que pasamos. Toca el tren para tocar la bocina.',
  LLEGADA = '¡Ya hemos dado la vuelta a Curiolandia! ¿Cuántos túneles hemos pasado?',
  CASI = '¡Casi! Piensa otra vez: ¿cuántos túneles hemos pasado?';
const FRASE_PARADA: Readonly<Record<string, string>> = {
  bosque: '¡Parada del bosque! Sube Lupi.',
  montana: '¡Parada de la montaña! Sube Polly.',
  playa: '¡Parada de la playa! Sube el pato.',
};
const ADIOS: Readonly<Record<string, string>> = {
  vaca: '¡Adiós, vaca!',
  oveja: '¡Adiós, oveja!',
  cerdo: '¡Adiós, cerdito!',
  caballo: '¡Adiós, caballo!',
  gallina: '¡Adiós, gallina!',
};

// punto(u, fuera): el punto de la vía en el sitio u de la vuelta (fuera: cuánto se separa hacia fuera de la elipse).
function punto(u: number, fuera = 0): THREE.Vector3 {
  const a = 2 * PI * u,
    s = Math.sin(a),
    c = Math.cos(a),
    n = normal(u);
  return V3(RX * s + n.x * fuera, 0, RZ * c + n.z * fuera);
}
// tangente(u): hacia dónde va la vía en el sitio u (vector de largo 1).
function tangente(u: number): THREE.Vector3 {
  const a = 2 * PI * u;
  return V3(RX * Math.cos(a), 0, -RZ * Math.sin(a)).normalize();
}
// normal(u): hacia fuera de la elipse en el sitio u (vector de largo 1).
function normal(u: number): THREE.Vector3 {
  const t = tangente(u);
  return V3(t.z, 0, -t.x);
}
// angulo(u): el giro (alrededor de y) de algo que mira hacia donde va la vía en u.
const angulo = (u: number): number => {
  const t = tangente(u);
  return Math.atan2(t.x, t.z);
};

// mundo, loco, vagones, humo, pasajeros, animales y Tito: las piezas del viaje de ahora (para moverlas en cada cuadro y para
// las pruebas).
let mundo: Mundo | null = null,
  loco: THREE.Group | null = null,
  vagones: THREE.Group[] = [],
  humo: THREE.Mesh[] = [],
  esperan: Record<string, THREE.Sprite> = {},
  animales: THREE.Group[] = [],
  titoTren: THREE.Group | null = null;

// rueda(to, x, z): una rueda negra del tren en (x, z) del vagón.
function rueda(to: THREE.Object3D, x: number, z: number): void {
  mk(Cyl(0.36, 0.36, 0.22, 16), '#3A2E2A', { p: [x, 0.36, z], r: [0, 0, PI / 2], to, ol: 0.02 });
}

// hazLoco(to, s): la locomotora roja con su caldera, la cabina abierta (para que se vea Tito), la chimenea y las ruedas, a escala s, mirando hacia +z.
function hazLoco(to: THREE.Object3D, s: number): THREE.Group {
  const g = grp(to, [0, 0, 0], s);
  mk(Box(1.6, 0.5, 2.8), '#E25B4B', { p: [0, 0.75, 0], to: g, ol: 0.03 });
  mk(Cyl(0.62, 0.62, 1.7, 18), '#E25B4B', { p: [0, 1.35, 0.45], r: [PI / 2, 0, 0], to: g, ol: 0.03 });
  mk(Box(1.6, 0.55, 1.1), '#FFD66B', { p: [0, 1.27, -0.85], to: g, ol: 0.03 });
  [-0.72, 0.72].forEach((x) =>
    [-1.33, -0.37].forEach((z) => mk(Cyl(0.07, 0.07, 1.15, 8), '#FFD66B', { p: [x, 2.1, z], to: g, ol: 0.02 })),
  );
  mk(Box(1.8, 0.16, 1.4), '#3F6B4E', { p: [0, 2.7, -0.85], to: g, ol: 0.03 });
  mk(Cyl(0.22, 0.32, 0.8, 12), '#3A2E2A', { p: [0, 2.2, 0.95], to: g, ol: 0.03 });
  mk(Cone(0.5, 0.4, 12), '#3A2E2A', { p: [0, 0.6, 1.55], r: [PI / 2, 0, 0], to: g, ol: 0.03 });
  [-0.8, 0.8].forEach((x) => [-0.9, 0.1, 0.9].forEach((z) => rueda(g, x, z)));
  return g;
}
// hazVagon(to, color): un vagón abierto del color dado, con sus ruedas, mirando hacia +z.
function hazVagon(to: THREE.Object3D, color: string): THREE.Group {
  const g = grp(to, [0, 0, 0]);
  mk(Box(1.6, 0.8, 2.2), color, { p: [0, 1, 0], to: g, ol: 0.03 });
  mk(Box(1.3, 0.1, 1.9), '#8B5E3C', { p: [0, 1.42, 0], to: g, ol: 0 });
  [-0.8, 0.8].forEach((x) => [-0.7, 0.7].forEach((z) => rueda(g, x, z)));
  return g;
}

// via(w): la vía: las traviesas de madera y los dos raíles, todo alrededor.
function via(w: Mundo): void {
  Array.from({ length: 150 }, (_, i) => i / 150).forEach((u) => {
    const p = punto(u);
    mk(Box(1.6, 0.12, 0.36), '#8B5E3C', { p: [p.x, 0.06, p.z], r: [0, angulo(u), 0], to: w.sc, ol: 0, cs: false });
  });
  [-0.5, 0.5].forEach((d) => {
    const pts = Array.from({ length: 96 }, (_, i) => punto(i / 96, d).setY(0.16)),
      curva = new THREE.CatmullRomCurve3(pts, true);
    mk(new THREE.TubeGeometry(curva, 300, 0.07, 6, true), '#9AA3AD', { to: w.sc, ol: 0, cs: false });
  });
}

// tunel3(w, u): un túnel que empieza en el sitio u: una loma verde encima de la vía y un arco de piedra a cada lado.
function tunel3(w: Mundo, u: number): void {
  const m = u + TREN.largoTunel / 2,
    p = punto(m),
    largo = TREN.largoTunel * LARGO;
  mk(new THREE.SphereGeometry(1, 24, 12, 0, 2 * PI, 0, PI / 2), '#6FBF5E', {
    p: [p.x, 0, p.z],
    r: [0, angulo(m), 0],
    s: [3.2, 3, largo / 2 + 0.8],
    to: w.sc,
    ol: 0.02,
  });
  [u, u + TREN.largoTunel].forEach((v) => {
    const q = punto(v);
    mk(new THREE.TorusGeometry(1.45, 0.28, 8, 18, PI), '#B9AFA3', {
      p: [q.x, 0, q.z],
      r: [0, angulo(v), 0],
      to: w.sc,
      ol: 0.02,
    });
  });
}

// parada3(w, p): una parada: el andén con su tejadito, lo que hay alrededor (árboles en el bosque, la montaña, la
// castillo de arena y el cangrejo de la playa) y el pasajero esperando.
function parada3(w: Mundo, u: number, id: string, pasajero: string): void {
  const q = punto(u, -2.6),
    g = grp(w.sc, [q.x, 0, q.z]);
  g.rotation.y = angulo(u);
  mk(Box(2, 0.4, 3.4), '#E9C48E', { p: [0, 0.2, 0], to: g, ol: 0.03 });
  [-1.4, 1.4].forEach((z) => mk(Cyl(0.08, 0.08, 2, 8), '#FFFFFF', { p: [-0.7, 1.3, z], to: g, ol: 0.02 }));
  mk(Box(2.2, 0.14, 3.6), '#5BB8E6', { p: [-0.3, 2.3, 0], to: g, ol: 0.03 });
  const f = punto(u, -7);
  if (id === 'bosque')
    [-3, 0, 3].forEach((d, i) => tree3(w.sc, f.x + d * 0.7, f.z + (i - 1) * 1.5, 1.1, 'verano', i === 1));
  if (id === 'montana') {
    mk(Cone(5, 7, 7), '#A7A29A', { p: [f.x, 3.5, f.z], to: w.sc, ol: 0.04 });
    mk(Cone(1.9, 2.4, 7), '#FFFFFF', { p: [f.x, 6, f.z], to: w.sc, ol: 0.03 });
  }
  if (id === 'playa') {
    spr(picTex('castillo'), 3, 3, { p: [f.x, 1.5, f.z], to: w.sc });
    spr(picTex('cangrejo'), 1.4, 1.4, { p: [f.x + 2.4, 0.7, f.z + 1], to: w.sc });
  }
  esperan[pasajero] = spr(picTex(pasajero), 1.3, 1.3, { p: [q.x, 1.2, q.z], to: w.sc });
}

// estacion3(to, x, z, giro): la estación de Curiolandia: un andén con su casita y el reloj.
function estacion3(to: THREE.Object3D, x: number, z: number, giro: number): THREE.Group {
  const g = grp(to, [x, 0, z]);
  g.rotation.y = giro;
  mk(Box(2.2, 0.4, 5), '#E9C48E', { p: [0, 0.2, 0], to: g, ol: 0.03 });
  mk(Box(1.6, 1.8, 2.6), '#FFF2D9', { p: [-0.3, 1.3, 0], to: g, ol: 0.03 });
  mk(Box(2.2, 0.2, 3.4), '#E25B4B', { p: [-0.3, 2.3, 0], to: g, ol: 0.03 });
  mk(Cyl(0.4, 0.4, 0.1, 20), '#FFFFFF', { p: [0.52, 1.6, 0], r: [0, 0, PI / 2], to: g, ol: 0.02 });
  return g;
}

// construye(): el mundo del viaje: el mar, la isla, la vía, los túneles, las paradas, los animales, la estación y el
// tren con Tito. En cada cuadro (si la escena sigue siendo esta) avanza el viaje y pone el tren, el humo y la cámara.
function construye(plan: PlanTren): Mundo {
  const w = newWorld({ fov: 50, bg: '#BFE9F8', fog: [45, 130], kind: 'tren', shadow: 30 });
  w.sun!.castShadow = false;
  esperan = {};
  mk(Box(400, 0.2, 400), '#5BB8E6', { p: [0, -1.2, 0], to: w.sc, ol: 0, cs: false });
  mk(Cyl(1, 1, 1, 64), '#FFE9B8', { p: [0, -0.9, 0], s: [RX + 9, 1, RZ + 9], to: w.sc, ol: 0, cs: false });
  mk(Cyl(1, 1, 1.2, 64), '#9BDB82', { p: [0, -0.6, 0], s: [RX + 7, 1, RZ + 7], to: w.sc, ol: 0.01, cs: false });
  via(w);
  plan.tuneles.forEach((u) => tunel3(w, u));
  plan.paradas.forEach((p) => parada3(w, p.u, p.id, p.pasajero));
  animales = plan.animales.map((a, i) => {
    const q = punto(a.u, 3.4),
      g = grp(w.sc, [q.x, 0, q.z]);
    spr(picTex(a.animal), 2.4, 2.4, { p: [0, 1.2, 0], to: g });
    Object.assign(g.userData, { id: 'animal', animal: a.animal, i, salto: -10 });
    w.pick.push(g);
    return g;
  });
  const e = punto(0, -2.8);
  estacion3(w.sc, e.x, e.z, angulo(0));
  // el tren: la locomotora con Tito en la cabina y dos vagones, donde se sientan los que suben
  loco = grp(w.sc, [0, 0, 0]);
  hazLoco(loco, 1);
  const tito = makeTito();
  tito.scale.setScalar(0.5);
  // en un asiento propio: la animación de Tito mueve su posición, y así sigue en la cabina
  grp(loco, [0, 1.3, -0.85]).add(tito);
  // no es w.tito: el motor pondría a Tito en el suelo; aquí va sentado en la cabina
  titoTren = tito;
  Object.assign(loco.userData, { id: 'loco' });
  w.pick.push(loco);
  vagones = ['#FFA94D', '#5BB8E6'].map((c) => {
    const g = grp(w.sc, [0, 0, 0]);
    hazVagon(g, c);
    return g;
  });
  humo = Array.from({ length: 5 }, () =>
    mk(new THREE.SphereGeometry(0.3, 10, 8), '#FFFFFF', { to: w.sc, ol: 0, cs: false }),
  );
  w.upd.push((dt: number) => {
    if (sceneName !== 'tren') return;
    avanza(dt);
    coloca(dt);
  });
  coloca(0);
  return w;
}

// coloca(dt): pone el tren, los pasajeros, el humo, los animales que saltan y la cámara donde toca en este cuadro.
function coloca(dt: number): void {
  if (!loco || !mundo) return;
  const u = TREN_ST.u,
    p = punto(u);
  loco.position.copy(p);
  loco.rotation.y = angulo(u);
  const anda = TREN_ST.fase === 'viaje';
  titoTren?.userData.anim?.(dt, { walk: 0, hop: 0 });
  vagones.forEach((g, i) => {
    const v = u - VAGONES[i]! / LARGO;
    g.position.copy(punto(v));
    g.rotation.set(0, angulo(v), 0);
  });
  // los que han subido van sentados en los vagones (dos en el primero, uno al lado del otro, y uno en el segundo)
  TREN_ST.suben.forEach((k, i) => {
    const s = esperan[k],
      parada = TREN_ST.parada,
      vg = vagones[i < 2 ? 0 : 1];
    if (!s || !vg) return;
    const sitio = vg.position
        .clone()
        .add(V3(0, 1.7, 0))
        .add(normal(u).multiplyScalar(ASIENTOS[i] ?? 0)),
      subiendo = parada && k === TREN_ST.suben[TREN_ST.suben.length - 1] ? Math.min(1, (T - parada.t) / 1.2) : 1;
    s.position.lerp(sitio, subiendo);
  });
  // el humo sale de la chimenea y sube; más fuerte justo después de la bocina
  const fuerte = T - TREN_ST.bocina < 1.2 ? 1.8 : 1,
    chimenea = p.clone().add(tangente(u).multiplyScalar(0.95)).setY(2.7);
  humo.forEach((h, i) => {
    const k = (T * (anda ? 0.7 : 0.35) + i / humo.length) % 1;
    h.position
      .copy(chimenea)
      .add(tangente(u).multiplyScalar(-k * 4))
      .setY(2.7 + k * 3.6);
    h.scale.setScalar((0.5 + k * 1.6) * fuerte);
  });
  animales.forEach((g) => {
    const k = (T - (g.userData.salto as number)) / 0.6;
    g.position.setY(k >= 0 && k < 1 ? Math.sin(k * PI) * 1.2 : 0);
  });
  // la cámara, detrás de la locomotora, por encima y un poco hacia fuera
  const t = tangente(u),
    n = normal(u),
    cam = p.clone().add(t.clone().multiplyScalar(-11)).add(n.clone().multiplyScalar(1.5)).setY(7),
    mira = p.clone().add(t.clone().multiplyScalar(6)).setY(1.2);
  mundo.camT = { pos: cam, look: mira };
  mundo.cam.position.copy(cam);
  mundo.camL = mira.clone();
}

// avanza(dt): un paso del viaje: al salir, espera; andando, avanza el tren (y mira si entra en un túnel o llega a una
// parada o a la estación); en una parada, espera a que suba el pasajero y sigue.
function avanza(dt: number): void {
  const e = TREN_ST,
    plan = e.plan;
  if (!plan) return;
  if (e.fase === 'parada' && e.parada && T - e.parada.t > TREN.paradaSeg) {
    e.parada = null;
    e.fase = 'viaje';
  }
  if (e.fase !== 'viaje') return;
  const antes = e.u,
    ahora = Math.min(1, antes + (VEL * dt) / LARGO);
  e.u = ahora;
  const t = tunelEn(ahora, plan.tuneles);
  if (t >= 0 && e.tunel < 0) SFX.whoosh();
  e.tunel = t;
  const p = paradaEn(antes, ahora, e.hechas);
  if (p) {
    e.fase = 'parada';
    e.parada = { id: p.id, t: T };
    e.hechas.push(p.id);
    e.suben.push(p.pasajero);
    SFX.pop();
    say(FRASE_PARADA[p.id]!);
    return;
  }
  if (ahora >= 1) {
    e.fase = 'pregunta';
    e.tunel = -1;
    SFX.good();
    say(LLEGADA);
  }
}

// bocina(): al tocar la locomotora: dos pitidos y una nube de humo.
function bocina(): void {
  TREN_ST.bocina = T;
  tone(660, 0.25, 'square', 0.18);
  tone(523, 0.35, 'square', 0.18, 0, 0.28);
}

// numeroTren(i): el centro del número i de la pregunta de los túneles (abajo, en fila).
export function numeroTren(i: number): { x: number; y: number } {
  const n = TREN_ST.plan?.opciones.length ?? 3;
  return { x: 800 + (i - (n - 1) / 2) * 220, y: 760 };
}

// tocaNumero(i): se ha elegido el número i: si es el de los túneles, 2 monedas y al mapa; si no, otra vez.
function tocaNumero(i: number): void {
  const plan = TREN_ST.plan;
  if (!plan) return;
  const n = plan.opciones[i]!;
  if (n !== plan.tuneles.length) {
    SFX.bad();
    TREN_ST.mal = i;
    say(CASI);
    return;
  }
  TREN_ST.fase = 'fin';
  SFX.tada();
  burst(numeroTren(i).x, numeroTren(i).y, 30);
  say(fmt('¡Muy bien! Hemos pasado {n} túneles.', { n }));
  later(1000, () => giveCoins(MONEDAS.juegoRepetido, 800, 420));
  later(4500, () => {
    if (sceneName === 'tren' && TREN_ST.fase === 'fin') go('map');
  });
}

// dibujaPregunta(): la pregunta de los túneles con sus tres números (el que estaba mal, en gris).
function dibujaPregunta(): void {
  const plan = TREN_ST.plan;
  if (!plan) return;
  card(520, 560, 560, 90, '#FFFFFF', 5, 40);
  text('¿Cuántos túneles?', 800, 622, 50, '#3A2E2A', { max: 520 });
  plan.opciones.forEach((n, i) => {
    const { x, y } = numeroTren(i);
    hR(x - 90, y - 75, 180, 150);
    card(x - 90, y - 75, 180, 150, i === TREN_ST.mal ? '#DDD6CC' : '#FFFFFF', 6, 26);
    text(String(n), x, y + 32, 96, '#5B8DEF');
  });
}

// montarTren3D(): pone la escena SCENES.tren. La llama mundo3d/mundo3d.ts al montar la capa 3D.
export function montarTren3D(): void {
  SCENES.tren = {
    three: true,
    music: 'map',
    // enter(): un viaje nuevo con el plan de la edad: el tren en la estación, Tito explica y, al poco, sale.
    enter(_o: OpcionesEscena) {
      Object.assign(TREN_ST, {
        fase: 'sale',
        plan: planTren(AGE(), azar),
        u: 0,
        parada: null,
        hechas: [],
        suben: [],
        tunel: -1,
        mal: -1,
        bocina: -10,
      });
      mundo = construye(TREN_ST.plan!);
      setWorld(mundo);
      camRig(mundo, mundo.cam.position.clone(), mundo.camL ?? V3(0, 0, 0), 0);
      later(300, () => this.prompt!());
      later(4200, () => {
        if (sceneName === 'tren' && TREN_ST.fase === 'sale') {
          TREN_ST.fase = 'viaje';
          bocina();
        }
      });
    },
    // prompt(): al salir, la explicación; andando, la ayuda; al llegar, la pregunta.
    prompt() {
      if (TREN_ST.fase === 'sale') say(INTRO);
      else if (TREN_ST.fase === 'pregunta') say(LLEGADA);
      else if (TREN_ST.fase !== 'fin') say(AYUDA);
    },
    // hint(): en la pregunta, el número bueno; andando, la locomotora.
    hint() {
      const plan = TREN_ST.plan;
      if (TREN_ST.fase === 'pregunta' && plan)
        return { ...numeroTren(plan.opciones.indexOf(plan.tuneles.length)), r: 90 };
      const l = locoEnPantalla();
      return TREN_ST.fase === 'viaje' && l ? { ...l, r: 90 } : null;
    },
    // draw(): encima del 3D: la oscuridad del túnel, la pregunta, la casa y las monedas.
    draw() {
      if (TREN_ST.tunel >= 0) {
        ctx.fillStyle = 'rgba(20, 16, 40, 0.78)';
        ctx.fillRect(0, 0, W, H);
      }
      if (TREN_ST.fase === 'pregunta') dibujaPregunta();
      drawHome();
      drawCoinHUD();
    },
    // down(x, y): casa -> el mapa; monedas -> la tienda; en la pregunta, un número; si no, la locomotora (la bocina) o
    // un animal (decirle adiós).
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
      if (TREN_ST.fase === 'pregunta') {
        const i = (TREN_ST.plan?.opciones ?? []).findIndex((_, j) => dist(x, y, numeroTren(j).x, numeroTren(j).y) < 90);
        if (i >= 0) tocaNumero(i);
        return;
      }
      const u = pickAt(x, y);
      // Tito va en la cabina: tocarlo es tocar el tren
      if (u?.id === 'loco' || u?.id === 'tito') {
        bocina();
        return;
      }
      if (u?.id === 'animal') {
        const g = animales[u.i as number];
        if (g) g.userData.salto = T;
        playSound(u.animal as string);
        say(ADIOS[u.animal as string]!);
        return;
      }
      SFX.tap();
      sparkles(x, y);
    },
  };
}

// locoEnPantalla(): dónde se ve la locomotora en la pantalla de 1600x900, o null si no está el viaje (para las pruebas).
export function locoEnPantalla(): { x: number; y: number } | null {
  if (!loco || W3?.kind !== 'tren') return null;
  const [x, y] = projO(loco, 1.4);
  return { x, y };
}
// animalEnPantalla(i): dónde se ve el animal i de la vía, o null si no está el viaje (para las pruebas).
export function animalEnPantalla(i: number): { x: number; y: number } | null {
  const g = animales[i];
  if (!g || W3?.kind !== 'tren') return null;
  const [x, y] = projO(g, 1.2);
  return { x, y };
}

// estacionTren3(w, x, z): la estación del mapa en (x, z): el andén con su casita, un trozo de vía y el trenecito, que
// se puede tocar (userData.id 'tren') para ir de viaje.
export function estacionTren3(w: Mundo, x: number, z: number): void {
  const g = grp(w.sc, [x, 0, z], 0.55);
  estacion3(g, -1.6, 0, 0);
  Array.from({ length: 9 }, (_, i) => i - 4).forEach((k) =>
    mk(Box(1.6, 0.12, 0.36), '#8B5E3C', { p: [0.4, 0.06, k * 0.8], to: g, ol: 0, cs: false }),
  );
  const t = grp(g, [0.4, 0, 0.6]);
  hazLoco(t, 1);
  const v = grp(g, [0.4, 0, -2.4]);
  hazVagon(v, '#FFA94D');
  Object.assign(g.userData, { id: 'tren' });
  w.pick.push(g);
  g.userData.anim = () => {
    t.position.y = Math.abs(Math.sin(T * 3)) * 0.06;
  };
  w.upd.push(() => g.userData.anim());
}

// tocarEstacion(w): se ha tocado la estación del mapa: Tito va andando hasta ella y, al llegar, empieza el viaje.
export function tocarEstacion(w: Mundo): void {
  const g = w.pick.find((o) => o.userData.id === 'tren');
  if (!w.tito || !g) return;
  const p = g.position;
  walkTo(
    w,
    w.tito,
    V3(p.x + 1.8, w.tito.position.y, p.z + 1.4),
    () => {
      if (sceneName === 'map') go('tren', { hello: true });
    },
    { speed: 8, max: 2.2 },
  );
}

// estacionEnPantalla(): dónde se ve la estación en el mapa 3D, o null si no está (para las pruebas).
export function estacionEnPantalla(): { x: number; y: number } | null {
  const g = W3?.kind === 'map' ? W3.pick.find((o) => o.userData.id === 'tren') : undefined;
  if (!g) return null;
  const [x, y] = projO(g, 0.6);
  return { x, y };
}
