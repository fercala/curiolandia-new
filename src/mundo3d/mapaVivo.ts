/*
 * mundo3d/mapaVivo.ts: detalles que dan vida a los mundos 3D (mejoras gráficas 36 a 40 de docs/MEJORAS-GRAFICAS.md,
 * v0.2.185):
 *   - espumaOrilla3: la espuma de las olas alrededor de la isla del mapa (dos aros con su forma que se abren y se
 *     desvanecen, como en las islas de las Letras y del Inglés);
 *   - sombrasNubes3: de día, las sombras de las nubes que pasan despacio por el suelo del mapa, de las islas y de las
 *     zonas;
 *   - chispasSuben3: chispitas doradas que suben desde el aro de la casita que toca y se desvanecen;
 *   - huellas3: Tito deja huellas al pasear, que se borran poco a poco.
 * (La mejora 39, las islas de noche con luces, usa farolas3 y resplandores3 de mundo3d/lucesNoche.ts desde
 * mundo3d/islaAdornos.ts.)
 * Como las luces de lucesNoche.ts, son planos y sprites baratos (sin luces de three.js) que no se pueden tocar.
 * Exporta: espumaOrilla3, sombrasNubes3, chispasSuben3 y huellas3.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- posiciones, tamaños, colores y
   tiempos de las piezas 3D, y bucles que las reparten. */
import * as THREE from 'three';
import type { Mundo, PuntoSuelo } from './tipos.ts';
import { T } from '../nucleo/indice.ts';
import { ribbon, softTex } from './decorado.ts';

// sinToque(o): o ya no se puede tocar (para que no le quite el toque a lo que está debajo).
function sinToque<O extends THREE.Object3D>(o: O): O {
  o.raycast = () => {};
  return o;
}

// espumaOrilla3(w, borde, salir): dos aros de espuma blanca con la forma de la orilla (borde: los puntos del contorno de
// la isla en el suelo, x y z), un poco hacia fuera (salir, en unidades del mundo), que crecen y se desvanecen uno detrás
// de otro. Los llama island3 (mundo3d/mapa3d.ts).
export function espumaOrilla3(w: Mundo, borde: readonly PuntoSuelo[], salir: number): void {
  const cx = borde.reduce((s, p) => s + p[0], 0) / borde.length,
    cz = borde.reduce((s, p) => s + p[1], 0) / borde.length,
    pts: PuntoSuelo[] = borde.map(([x, z]) => {
      const dx = x - cx,
        dz = z - cz,
        l = Math.hypot(dx, dz) || 1;
      return [dx + (dx / l) * salir, dz + (dz / l) * salir];
    });
  pts.push(pts[0]!);
  [0, 0.5].forEach((fase) => {
    const g = new THREE.Group();
    g.position.set(cx, -0.86, cz);
    w.sc.add(g);
    const m: THREE.Mesh = sinToque(ribbon(g, pts, 0.28, '#FFFFFF', 0));
    const mat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    m.material = mat;
    w.upd.push(() => {
      const k = (T * 0.3 + fase) % 1;
      g.scale.set(1 + k * 0.06, 1, 1 + k * 0.08);
      mat.opacity = 0.7 * (1 - k);
    });
  });
}

// sombrasNubes3(w): tres sombras de nube (manchas suaves y oscuras, tumbadas en el suelo) que cruzan despacio de
// izquierda a derecha el suelo del mundo (w.ground, por encima de su punto más alto). Solo de día (quien llama lo mira).
export function sombrasNubes3(w: Mundo): void {
  if (!w.ground) return;
  const caja = new THREE.Box3().setFromObject(w.ground),
    x0 = caja.min.x,
    z0 = caja.min.z,
    ancho = caja.max.x - caja.min.x,
    fondo = caja.max.z - caja.min.z,
    alto = caja.max.y + 0.03;
  for (let i = 0; i < 3; i++) {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    const m = sinToque(
      new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({
          map: softTex(),
          color: '#22324A',
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
        }),
      ),
    );
    m.scale.set(9 + i * 2, 1, 5 + i);
    m.renderOrder = 2;
    const z = z0 + ((i * 0.37 + 0.2) % 1) * fondo,
      v = 0.5 + i * 0.15;
    w.sc.add(m);
    w.upd.push(() => {
      m.position.set(x0 + ((((T * v + i * ancho * 0.4) % (ancho + 20)) + ancho + 20) % (ancho + 20)) - 10, alto, z);
    });
  }
}

// chispasSuben3(w, x, z, r): seis chispitas doradas que suben despacio desde un aro de radio r en el suelo, en (x, z),
// girando alrededor y desvaneciéndose arriba, una detrás de otra (para la casita que toca en las zonas).
export function chispasSuben3(w: Mundo, x: number, z: number, r: number): void {
  const ss: THREE.Sprite[] = [];
  for (let i = 0; i < 6; i++) {
    const s = sinToque(
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: softTex(),
          color: '#FFD45A',
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    s.scale.setScalar(0.35);
    w.sc.add(s);
    ss.push(s);
  }
  w.upd.push(() => {
    ss.forEach((s, i) => {
      const k = (T * 0.4 + i / 6) % 1,
        a = (i / 6) * Math.PI * 2 + T * 0.8;
      s.position.set(x + Math.cos(a) * r, 0.2 + k * 3, z + Math.sin(a) * r);
      s.material.opacity = Math.min(1, k * 4) * (1 - k);
    });
  });
}

// huellas3(w): Tito (w.tito) deja huellas al pasear: cada 0,55 de camino, una huella pequeña y oscura en el suelo, a un
// lado y a otro por turnos, que se borra en 3 segundos (como mucho 14 a la vez, que se reutilizan). Va a la altura del
// suelo donde estaba Tito al montar el mundo.
export function huellas3(w: Mundo): void {
  if (!w.tito) return;
  const t = w.tito,
    y = t.position.y + 0.07,
    hs: { m: THREE.Mesh; t: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.CircleGeometry(0.12, 12);
    g.rotateX(-Math.PI / 2);
    const m = sinToque(
      new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({
          color: '#5A4632',
          transparent: true,
          opacity: 0,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
        }),
      ),
    );
    m.scale.set(1, 1, 1.5);
    m.visible = false;
    w.sc.add(m);
    hs.push({ m, t: -9 });
  }
  let ux = t.position.x,
    uz = t.position.z,
    n = 0;
  w.upd.push(() => {
    const dx = t.position.x - ux,
      dz = t.position.z - uz,
      d = Math.hypot(dx, dz);
    if (d > 3) {
      ux = t.position.x;
      uz = t.position.z;
    } else if (d > 0.55 && t.position.y < y + 0.2) {
      const h = hs[n % hs.length]!,
        lado = n % 2 ? 0.14 : -0.14;
      h.m.position.set(t.position.x - (dz / d) * lado, y, t.position.z + (dx / d) * lado);
      h.m.rotation.y = Math.atan2(dx, dz);
      h.m.visible = true;
      h.t = T;
      n++;
      ux = t.position.x;
      uz = t.position.z;
    }
    hs.forEach((h) => {
      const k = (T - h.t) / 3;
      (h.m.material as THREE.MeshBasicMaterial).opacity = k < 1 ? 0.3 * (1 - k) : 0;
      if (k >= 1) h.m.visible = false;
    });
  });
}
