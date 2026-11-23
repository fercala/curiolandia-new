/*
 * mundo3d/amigos3d.ts: los amigos de Tito en el mapa 3D (idea 25 de docs/IDEAS-MEJORA.md, fase P31). Lupi y Polly son
 * recortables (su dibujo, picTex) que pasean despacio por el mapa, cada uno por su camino, parándose un poco en cada
 * punto. Cuando Tito pasa cerca, saludan (una vez cada vez que se entra al mapa). El amigo del encargo de hoy, mientras
 * no lo ha pedido, lleva encima una exclamación amarilla que bota. Al tocar a un amigo, Tito va hasta él y hablan
 * (hablarConAmigo, escenas/amigos.ts); si acaba de pedir ayuda, lo que ha perdido aparece en su rincón del mapa, con un
 * corro de luz. Al tocarlo (o si Tito pasa por encima), Tito lo recoge y se lo devuelve (devolverPerdido): el amigo da
 * las gracias y se ganan 2 monedas.
 * Exporta: amigos3 (la llama buildMap, mundo3d/mapa3d.ts), tocarAmigo y tocarPerdido (desde el down del mapa), y, para
 * las pruebas (mundo3d.ts las vuelve a exportar), amigoEnPantalla y perdidoEnPantalla.
 * Importa: three; del núcleo, T, PI, sceneName y sayQ; las reglas de dominio/amigos.ts y lo que dicen y guardan, de
 * escenas/amigos.ts; RINCON_POS de los tesoros, el motor, las piezas, fhit y walkTo.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los caminos de los amigos (en píxeles del mapa 2D), los tamaños y las
   velocidades son el dibujo mismo. */
import * as THREE from 'three';
import type { Mundo, PuntoSuelo } from './tipos.ts';
import { PI, T, sayQ, sceneName } from '../nucleo/indice.ts';
import { AMIGOS, AMIGOS_MAPA } from '../dominio/amigos.ts';
import { devolverPerdido, encargoHoy, faseHoy, hablarConAmigo } from '../escenas/amigos.ts';
import { RINCON_POS } from './tesoros3d.ts';
import { W3, projO } from './motor.ts';
import { Box, Sph, V3, grp, mk, picTex, spr } from './materiales.ts';
import { fhit } from './decorado.ts';
import { walkTo } from './interaccion.ts';

// CAMINOS: por dónde pasea cada amigo, en píxeles del mapa 2D (como MAPPOS de mundo3d/mapa3d.ts): de un punto al
// siguiente y, desde el último, vuelta al primero; por el césped libre, lejos de los lugares (que se tocan antes).
const CAMINOS: Readonly<Record<string, readonly PuntoSuelo[]>> = {
  lupi: [
    [680, 400],
    [940, 420],
    [950, 610],
  ],
  polly: [
    [470, 400],
    [472, 690],
  ],
};
// PASEO: lo que anda por segundo un amigo y lo que se para en cada punto (segundos), y lo que se queda quieto al
// hablar con Tito.
const PASEO = { velocidad: 1.1, parada: 2.5, habla: 6 };
// mp(x, y): pasa un punto del mapa 2D a [x, z] del suelo 3D (la misma cuenta que MP de mundo3d/mapa3d.ts).
const mp = (x: number, y: number): PuntoSuelo => [(x - 800) / 40, (y - 500) / 40];

// El mapa de ahora, sus amigos (por id) y lo perdido que hay en el mapa (o null).
let mapa: Mundo | null = null,
  amigos: Record<string, THREE.Group> = {},
  perdido: THREE.Group | null = null;

// pasea(g, dt): el amigo g anda hacia el siguiente punto de su camino (o espera en el que está, o se queda quieto si
// está hablando) y bota un poco al andar.
function pasea(g: THREE.Group, dt: number): void {
  const u = g.userData,
    camino = CAMINOS[u.amigo as string] ?? [];
  if (T < (u.quieto as number) || !camino.length) return;
  const [tx, tz] = mp(...camino[u.i as number]!),
    dx = tx - g.position.x,
    dz = tz - g.position.z,
    d = Math.hypot(dx, dz);
  if (d < 0.1) {
    u.i = ((u.i as number) + 1) % camino.length;
    u.quieto = T + PASEO.parada;
    return;
  }
  const paso = Math.min(d, PASEO.velocidad * dt);
  g.position.set(g.position.x + (dx / d) * paso, 0, g.position.z + (dz / d) * paso);
  (u.dibujo as THREE.Sprite).position.setY(0.85 + Math.abs(Math.sin(T * 6)) * 0.15);
}

// marca(g): la exclamación amarilla que bota encima del amigo que tiene un encargo sin pedir.
function marca(g: THREE.Group): THREE.Group {
  const m = grp(g, [0, 2.1, 0]);
  mk(Box(0.16, 0.5, 0.16), '#FFC93C', { p: [0, 0.3, 0], to: m, ol: 0.03 });
  mk(Sph(0.11, 10, 8), '#FFC93C', { p: [0, -0.1, 0], to: m, ol: 0.03 });
  return m;
}

// amigos3(w): pone en el mapa a Lupi y a Polly, cada uno al principio de su camino, tocables (userData.id 'amigo'),
// con su animación de pasear, saludar cuando Tito pasa cerca y la exclamación del encargo; y lo perdido, si ya se ha
// pedido hoy y aún no se ha devuelto.
export function amigos3(w: Mundo): void {
  mapa = w;
  amigos = {};
  perdido = null;
  AMIGOS.forEach((a) => {
    const camino = CAMINOS[a.id];
    if (!camino?.length) return;
    const [x, z] = mp(...camino[0]!),
      g = grp(w.sc, [x, 0, z]),
      dibujo = spr(picTex(a.id), 1.7, 1.7, { p: [0, 0.85, 0], to: g }),
      caja = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 1.6), fhit()),
      excl = marca(g);
    caja.position.y = 1;
    g.add(caja);
    Object.assign(g.userData, { id: 'amigo', amigo: a.id, i: 1, quieto: T + 1, saludado: false, dibujo });
    w.pick.push(g);
    amigos[a.id] = g;
    w.upd.push((dt: number) => {
      pasea(g, dt);
      excl.visible = encargoHoy().amigo === a.id && faseHoy() === 'sinPedir';
      excl.position.setY(2.1 + Math.abs(Math.sin(T * 4)) * 0.25);
      excl.rotation.y = T * 2;
      const d = w.tito ? Math.hypot(w.tito.position.x - g.position.x, w.tito.position.z - g.position.z) : 99;
      if (d < AMIGOS_MAPA.saluda && !g.userData.saludado && sceneName === 'map' && w.walk == null) {
        g.userData.saludado = true;
        sayQ(a.hola);
      }
    });
  });
  if (faseHoy() === 'buscando') ponPerdido(w);
}

// ponPerdido(w): pone en su rincón del mapa lo que ha perdido el amigo del encargo de hoy, tocable (userData.id
// 'perdido'), con un corro de luz, botando un poco; si Tito pasa por encima, lo recoge.
function ponPerdido(w: Mundo): void {
  if (perdido) return;
  const e = encargoHoy(),
    pos = RINCON_POS[e.rincon];
  if (!pos) return;
  const [x, z] = mp(pos[0] + 45, pos[1] + 20),
    g = grp(w.sc, [x, 0, z]),
    dibujo = spr(picTex(e.perdido), 1.2, 1.2, { p: [0, 0.6, 0], to: g }),
    corro = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.75, 24),
      new THREE.MeshBasicMaterial({ color: '#FFE38A', transparent: true, opacity: 0.5, depthWrite: false }),
    ),
    caja = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), fhit());
  corro.rotation.x = -PI / 2;
  corro.position.y = 0.06;
  caja.position.y = 0.8;
  g.add(corro, caja);
  Object.assign(g.userData, { id: 'perdido', cogido: 0 });
  w.pick.push(g);
  perdido = g;
  w.upd.push(() => {
    if (g.userData.cogido) {
      const k = Math.min(1, (T - (g.userData.cogido as number)) / 1.2);
      dibujo.position.setY(0.9 + k * 4);
      dibujo.material.opacity = 1 - k;
      corro.visible = false;
      g.visible = k < 1;
      return;
    }
    dibujo.position.setY(0.6 + Math.abs(Math.sin(T * 3)) * 0.25);
    corro.scale.setScalar(1 + Math.sin(T * 5) * 0.1);
    const d = w.tito ? Math.hypot(w.tito.position.x - x, w.tito.position.z - z) : 99;
    if (d < AMIGOS_MAPA.recoge && w.walk == null) recoge(g);
  });
}

// recoge(g): Tito recoge lo perdido (si no lo había recogido ya): se devuelve a su amigo (devolverPerdido: las gracias
// y las monedas, que salen de donde se ve) y se va volando.
function recoge(g: THREE.Group): void {
  if (g.userData.cogido) return;
  Object.assign(g.userData, { cogido: T });
  const [x, y] = projO(g, 1);
  devolverPerdido(x, y);
}

// tocarAmigo(w, id): se ha tocado al amigo id: se queda quieto, Tito va hasta él y hablan; si acaba de pedir ayuda,
// aparece lo perdido.
export function tocarAmigo(w: Mundo, id: string): void {
  const g = amigos[id];
  if (!w.tito || !g) return;
  g.userData.quieto = T + PASEO.habla;
  g.userData.saludado = true;
  const p = g.position;
  walkTo(
    w,
    w.tito,
    V3(p.x - 1.3, w.tito.position.y, p.z + 0.9),
    () => {
      if (sceneName !== 'map') return;
      g.userData.quieto = T + PASEO.habla;
      if (hablarConAmigo(id)) ponPerdido(w);
    },
    { speed: 8, max: 2.2 },
  );
}

// tocarPerdido(w): se ha tocado lo perdido: Tito va hasta ello y, al llegar, lo recoge.
export function tocarPerdido(w: Mundo): void {
  const g = perdido;
  if (!w.tito || !g || g.userData.cogido) return;
  const p = g.position;
  walkTo(
    w,
    w.tito,
    V3(p.x + 0.6, w.tito.position.y, p.z + 0.6),
    () => {
      if (sceneName === 'map') recoge(g);
    },
    { speed: 8, max: 2.2 },
  );
}

// amigoEnPantalla(id): dónde se ve el amigo id en el mapa 3D, o null si no está (para las pruebas).
export function amigoEnPantalla(id: string): { x: number; y: number } | null {
  const g = amigos[id];
  if (!g || W3 !== mapa || W3?.kind !== 'map') return null;
  const [x, y] = projO(g, 0.9);
  return { x, y };
}

// perdidoEnPantalla(): dónde se ve lo perdido en el mapa 3D, o null si no está (para las pruebas).
export function perdidoEnPantalla(): { x: number; y: number } | null {
  if (!perdido || perdido.userData.cogido || W3 !== mapa || W3?.kind !== 'map') return null;
  const [x, y] = projO(perdido, 0.6);
  return { x, y };
}
