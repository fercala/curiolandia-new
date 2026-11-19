/*
 * mundo3d/tiempo3d.ts: el tiempo de verdad en el mapa 3D (idea 21 de docs/IDEAS-MEJORA.md, fase P26). tiempo3(w) (la
 * llama buildMap, mundo3d/mapa3d.ts) pinta el tiempo que el niño dijo en la asamblea de hoy (tiempoHoy, escenas/tiempo.ts):
 * - lluvia (o tormenta): el cielo gris, menos luz, la lluvia que cae y tres charcos junto a la casa de Tito; al tocarlos,
 *   Tito va y se salta en ellos (SCENES.charcos).
 * - nieve: la nieve que cae (si no nieva ya por ser invierno), manchas blancas en el suelo y un montón de nieve junto a
 *   la casa; al tocarlo, Tito va y se hace el muñeco (SCENES.muneco).
 * - viento: hojas que cruzan volando el mapa.
 * - nubes: más nubes y menos luz. niebla: la niebla, que tapa lo lejano.
 * Con sol, o si hoy no se ha dicho, nada: el mapa de siempre. La primera vez de cada día, Tito dice el tiempo que hace
 * (fraseTiempoMapa).
 * Exporta: SITIO_TIEMPO (dónde están los charcos y el montón, junto a la casa de Tito), tiempo3, tocarJuegoTiempo y
 * juegoTiempoEnPantalla (para las pruebas).
 * Importa: three, el núcleo (T, go, sceneName, sayQ, la fecha), las piezas de mundo3d/materiales.ts, cloud3 de
 * mundo3d/objetos.ts, fallPts y fhit de mundo3d/decorado.ts, walkTo de mundo3d/interaccion.ts, projO y W3 de
 * mundo3d/motor.ts, ahora() de aplicacion/puertos.ts, juegoDelTiempo de dominio/tiempo.ts y tiempoHoy y
 * fraseTiempoMapa de escenas/tiempo.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, colores y velocidades en unidades del mundo 3D,
   como en el resto de la capa 3D. */
import * as THREE from 'three';
import type { Mundo, Nodo, PuntoSuelo } from './tipos.ts';
import { PI, T, go, sayQ, sceneName } from '../nucleo/indice.ts';
import { V3, canvasTex, grp, mk } from './materiales.ts';
import { cloud3 } from './objetos.ts';
import { fallPts, fhit } from './decorado.ts';
import { walkTo } from './interaccion.ts';
import { W3, projO } from './motor.ts';
import { ahora } from '../aplicacion/puertos.ts';
import { juegoDelTiempo, type JuegoTiempo } from '../dominio/tiempo.ts';
import { fraseTiempoMapa, tiempoHoy } from '../escenas/tiempo.ts';

// SITIO_TIEMPO: dónde están los charcos y el montón de nieve respecto a la casa de Tito ([x, z] en unidades del mundo
// 3D): en el césped de delante, entre la casa y la tienda (a la izquierda de la casa van el árbol de Navidad, el muñeco
// de invierno y la calabaza).
export const SITIO_TIEMPO: Readonly<Record<JuegoTiempo, PuntoSuelo>> = {
  charcos: [-4.4, 2.2],
  muneco: [-4.4, 2.2],
};
// sitioJunto(w, id): el sitio en el suelo de los charcos o del montón ([x, z]), junto a la casa de Tito.
function sitioJunto(w: Mundo, id: JuegoTiempo): PuntoSuelo {
  const c = w.spots?.casaTito?.position,
    [dx, dz] = SITIO_TIEMPO[id];
  return [(c?.x ?? 0) + dx, (c?.z ?? 0) + dz];
}
// ZONA: dónde caen la lluvia y la nieve y por dónde pasan las hojas del viento (el mapa entero).
const ZONA = { h: 12, wx: 42, wz: 24 };

// menosLuz(w, k): baja la luz de todas las luces del mundo (k, lo que se queda: 0.7, el 70 %).
function menosLuz(w: Mundo, k: number): void {
  w.sc.children.forEach((o: Nodo) => {
    if (o.isLight) o.intensity! *= k;
  });
}

// cieloDe(w, c): pone el color c al cielo (el fondo del mundo).
function cieloDe(w: Mundo, c: string): void {
  if (w.sc.background instanceof THREE.Color) w.sc.background.set(c);
}

// gotaTex(): la textura de una gota de lluvia (una raya azul clarita).
const gotaTex = () =>
  canvasTex(
    16,
    64,
    (g) => {
      Object.assign(g, { strokeStyle: '#fff', lineWidth: 4, lineCap: 'round' });
      g.beginPath();
      g.moveTo(8, 6);
      g.lineTo(8, 58);
      g.stroke();
    },
    'gotaLluvia',
  );

// bolaTex(): la textura de un copo de nieve (un círculo blanco con borde azul, como la nieve de seasonFx).
const bolaTex = () =>
  canvasTex(
    64,
    64,
    (g) => {
      g.beginPath();
      g.arc(32, 32, 20, 0, PI * 2);
      Object.assign(g, { fillStyle: '#fff' }).fill();
      Object.assign(g, { lineWidth: 5, strokeStyle: '#9DBFE3' }).stroke();
    },
    'snow',
  );

// hojaTex(): la textura de una hoja (una elipse blanca que se tiñe con el color de cada una).
const hojaTex = () =>
  canvasTex(
    32,
    32,
    (g) => {
      g.beginPath();
      g.ellipse(16, 16, 13, 7, 0.6, 0, PI * 2);
      Object.assign(g, { fillStyle: '#fff' }).fill();
    },
    'leaf',
  );

// jugable(w, id, [x, z]): un grupo tocable en el suelo (userData.id id, como los tesoros) con una caja invisible para
// tocarlo mejor; devuelve el grupo.
function jugable(w: Mundo, id: JuegoTiempo, [x, z]: PuntoSuelo): THREE.Group {
  const g = grp(w.sc, [x, 0, z]),
    caja = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 2.4), fhit());
  g.userData.id = id;
  caja.position.y = 0.6;
  g.add(caja);
  w.pick.push(g);
  return g;
}

// charcos3(w): los tres charcos de la lluvia junto a la casa, con ondas que se abren y se cierran.
function charcos3(w: Mundo): void {
  const g = jugable(w, 'charcos', sitioJunto(w, 'charcos'));
  [
    [-1, 0.2, 1],
    [0.4, -0.5, 0.8],
    [1.1, 0.6, 0.7],
  ].forEach(([x, z, s], i) => {
    const c = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 24),
      new THREE.MeshLambertMaterial({ color: '#5BA7E0', transparent: true, opacity: 0.85 }),
    );
    c.rotation.x = -PI / 2;
    c.position.set(x!, 0.05 + i * 0.002, z!);
    c.scale.set(s! * 1.4, s!, 1);
    g.add(c);
    const onda = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.36, 24),
      new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.6, depthWrite: false }),
    );
    onda.rotation.x = -PI / 2;
    onda.position.set(x!, 0.07, z!);
    g.add(onda);
    w.upd.push(() => {
      const k = (T * 0.8 + i * 0.33) % 1;
      onda.scale.setScalar((0.5 + k * 1.5) * s!);
      onda.material.opacity = 0.6 * (1 - k);
    });
  });
}

// montonNieve3(w): el montón de nieve junto a la casa, con una zanahoria clavada (para hacer el muñeco) y manchas de
// nieve por el césped.
function montonNieve3(w: Mundo): void {
  const g = jugable(w, 'muneco', sitioJunto(w, 'muneco'));
  mk(new THREE.SphereGeometry(1.1, 18, 12, 0, PI * 2, 0, PI / 2), '#FFFFFF', { s: [1.3, 0.7, 1], to: g, ol: 0.03 });
  mk(new THREE.SphereGeometry(0.5, 14, 10, 0, PI * 2, 0, PI / 2), '#FFFFFF', { p: [1.3, 0, 0.5], to: g, ol: 0.03 });
  mk(new THREE.ConeGeometry(0.09, 0.6, 8), '#FF8A3D', { p: [0.1, 0.95, 0.2], r: [0.5, 0, 0.3], to: g, ol: 0.02 });
  [
    [-6, 2],
    [4, 5],
    [8, -3],
    [-10, -2],
    [0, 7],
  ].forEach(([x, z]) => {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(1.4, 20),
      new THREE.MeshLambertMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.8 }),
    );
    m.rotation.x = -PI / 2;
    m.position.set(x!, 0.04, z!);
    w.sc.add(m);
  });
  w.upd.push(() => {
    g.scale.setScalar(1 + Math.sin(T * 2) * 0.03);
  });
}

// hojasAlViento(w): hojas de colores que cruzan el mapa volando de izquierda a derecha, subiendo y bajando (un solo
// objeto Points).
function hojasAlViento(w: Mundo): void {
  const n = 40,
    pos = new Float32Array(n * 3),
    col = new Float32Array(n * 3),
    c = new THREE.Color(),
    cols = ['#F28C38', '#7CC86E', '#F2C14E', '#C9772E'],
    ids = Array.from({ length: n }, (_, i) => i);
  ids.forEach((i) => {
    pos.set([(i / n - 0.5) * ZONA.wx, 1 + (i % 7), ((i * 37) % 24) - 12], i * 3);
    c.set(cols[i % cols.length]!);
    col.set([c.r, c.g, c.b], i * 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 1.6, map: hojaTex(), vertexColors: true, transparent: true, depthWrite: false }),
  );
  p.raycast = () => {};
  w.sc.add(p);
  w.upd.push((dt: number) => {
    ids.forEach((i) => {
      const k = i * 3,
        x = pos[k]! + dt * (7 + (i % 4) * 1.5);
      pos[k] = x > ZONA.wx / 2 ? -ZONA.wx / 2 : x;
      pos[k + 1] = 1.5 + (i % 7) + Math.sin(T * 2 + i) * 0.8;
    });
    geo.attributes.position!.needsUpdate = true;
  });
}

// PINTA: cómo se pinta en el mapa cada tiempo (con sol, nada).
const PINTA: Readonly<Record<string, (w: Mundo) => void>> = {
  lluvia: (w) => {
    cieloDe(w, '#9AA8B6');
    menosLuz(w, 0.72);
    fallPts(w, 180, ['#DCEBFA', '#BFD8F0'], { ...ZONA, size: 0.9, sp: 13, sw: 0, map: gotaTex(), op: 0.8 });
    charcos3(w);
  },
  nieve: (w) => {
    cieloDe(w, '#C9DCEC');
    menosLuz(w, 0.9);
    const m = ahora().getMonth();
    if (!(m === 11 || m <= 1))
      fallPts(w, 80, ['#FFFFFF', '#F4FAFF'], { ...ZONA, size: 1.1, sp: 0.9, sw: 0.5, map: bolaTex() });
    montonNieve3(w);
  },
  viento: (w) => hojasAlViento(w),
  nubes: (w) => {
    cieloDe(w, '#B4C4D2');
    menosLuz(w, 0.85);
    [-20, -6, 8, 22].forEach((x, i) => {
      const c = cloud3(w.sc, x, 8 + (i % 2), -10 + i * 2, 1.6);
      w.upd.push((dt: number) => {
        c.position.x = c.position.x > 40 ? -40 : c.position.x + 0.5 * dt;
      });
    });
  },
  niebla: (w) => {
    cieloDe(w, '#DCE3E8');
    Object.assign(w.sc, { fog: new THREE.Fog('#DCE3E8', 22, 48) });
  },
};

// tiempo3(w): pinta en el mapa el tiempo de hoy (PINTA) y, la primera vez del día, Tito dice qué tiempo hace.
export function tiempo3(w: Mundo): void {
  const t = tiempoHoy();
  if (!t || !PINTA[t]) return;
  PINTA[t](w);
  const f = fraseTiempoMapa();
  if (f) sayQ(f);
}

// tocarJuegoTiempo(w, id): se han tocado en el mapa los charcos o el montón de nieve: Tito va hasta allí y, al llegar,
// empieza el juego (SCENES.charcos o SCENES.muneco).
export function tocarJuegoTiempo(w: Mundo, id: JuegoTiempo): void {
  const g = w.pick.find((o) => o.userData.id === id);
  if (!w.tito || !g) return;
  const p = g.position;
  walkTo(
    w,
    w.tito,
    V3(p.x - 2, w.tito.position.y, p.z + 1.2),
    () => {
      if (sceneName === 'map') go(id);
    },
    { speed: 8, max: 2.2 },
  );
}

// juegoTiempoEnPantalla(): dónde se ven en la pantalla los charcos o el montón de nieve de hoy ({x, y} en la pantalla
// de 1600x900), o null si hoy no hay juego del tiempo o no está el mapa 3D (para las pruebas).
export function juegoTiempoEnPantalla(): { x: number; y: number } | null {
  const id = juegoDelTiempo(tiempoHoy()),
    g = id && W3?.kind === 'map' ? W3.pick.find((o) => o.userData.id === id) : undefined;
  if (!g) return null;
  const [x, y] = projO(g, 0.3);
  return { x, y };
}
