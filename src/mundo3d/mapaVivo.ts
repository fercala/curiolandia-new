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
 * Desde la v0.2.186 (mejoras 55 a 60): delfines3 (delfines que saltan en el mar), ballena3 (una ballena a lo lejos que
 * echa agua), velero3 (un velero que navega alrededor de la isla, con su farol de noche), pajaros3 (pájaros que cruzan
 * el cielo de las zonas), nubecitas de polvo en las huellas de Tito (huellas3) y mariposasIsla3 (mariposas en las
 * islas, que no se pueden tocar para no quitarle el toque a las zonas).
 * Desde la v0.2.187 (mejoras 77 a 80): cometa3 (una cometa sobre la plaza del mapa), pecesSaltan3 (peces que saltan
 * en el mar), las salpicaduras de los delfines (en delfines3 y pecesSaltan3, con salpicadura) y tintarNubes3 (las nubes
 * rosadas al amanecer y anaranjadas por la tarde). (La 76, las gaviotas de las islas, usa gull3 en islaAdornos.ts.)
 * Exporta: espumaOrilla3, sombrasNubes3, chispasSuben3, huellas3, delfines3, ballena3, velero3, pajaros3,
 * mariposasIsla3, cometa3, pecesSaltan3 y tintarNubes3.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- posiciones, tamaños, colores y
   tiempos de las piezas 3D, y bucles que las reparten. */
import * as THREE from 'three';
import type { Mundo, PuntoSuelo } from './tipos.ts';
import { T } from '../nucleo/indice.ts';
import { ahora } from '../aplicacion/puertos.ts';
import { butterfly3, ribbon, softTex } from './decorado.ts';
import { Box, Cone, Cyl, Sph, grp, mk } from './materiales.ts';

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
// suelo donde estaba Tito al montar el mundo. Desde la mejora gráfica 59, cada paso levanta una nubecita de polvo.
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
  // las nubecitas de polvo que levanta cada paso (mejora gráfica 59): sprites blancos que crecen y se desvanecen
  const ps: { s: THREE.Sprite; t: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const sp = sinToque(
      new THREE.Sprite(
        new THREE.SpriteMaterial({ map: softTex(), color: '#FFF6E6', transparent: true, depthWrite: false }),
      ),
    );
    sp.visible = false;
    w.sc.add(sp);
    ps.push({ s: sp, t: -9 });
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
      const p = ps[n % ps.length]!;
      p.s.position.set(t.position.x, y + 0.15, t.position.z);
      p.s.visible = true;
      p.t = T;
      n++;
      ux = t.position.x;
      uz = t.position.z;
    }
    hs.forEach((h) => {
      const k = (T - h.t) / 3;
      (h.m.material as THREE.MeshBasicMaterial).opacity = k < 1 ? 0.3 * (1 - k) : 0;
      if (k >= 1) h.m.visible = false;
    });
    ps.forEach((p) => {
      const k = (T - p.t) / 0.6;
      p.s.scale.setScalar(0.25 + Math.min(1, k) * 0.45);
      p.s.material.opacity = k < 1 ? 0.6 * (1 - k) : 0;
      if (k >= 1) p.s.visible = false;
    });
  });
}

// sinToqueTodo(o): quita el toque a una pieza y a todo lo que lleva dentro.
function sinToqueTodo(o: THREE.Object3D): void {
  o.traverse((h) => {
    h.raycast = () => {};
  });
}

// salpicadura(w, x, z): un aro de espuma en el agua en (x, z) y unas gotas; devuelve la función que lo anima en cada
// cuadro con el momento t del salto (de 0 a dura): salpica al principio (al salir) y al final (al entrar). Mejora 79.
function salpicadura(w: Mundo, x: number, z: number): (t: number, dura: number) => void {
  const g = new THREE.TorusGeometry(0.5, 0.06, 4, 24);
  g.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }),
    aro = sinToque(new THREE.Mesh(g, mat));
  aro.position.set(x, -0.9, z);
  w.sc.add(aro);
  return (t, dura) => {
    const a = t < 0.5 ? t / 0.5 : t > dura - 0.1 && t < dura + 0.4 ? (t - dura + 0.1) / 0.5 : -1;
    aro.visible = a >= 0 && a <= 1;
    if (!aro.visible) return;
    aro.position.z = z + (t < 0.5 ? -1.5 : 1.5) * (dura > 1 ? 1 : 0.4);
    aro.scale.setScalar(0.6 + a * 1.6);
    mat.opacity = 0.8 * (1 - a);
  };
}

// delfines3(w, sitios): un delfín en cada sitio del mar (x, z): cada 9 segundos (cada uno a destiempo) salta del agua
// en un arco de 2 segundos, girando el cuerpo como el arco, y vuelve a meterse; el resto del tiempo está escondido.
// Desde la mejora gráfica 79, al salir y al entrar en el agua salpica (salpicadura).
export function delfines3(w: Mundo, sitios: readonly PuntoSuelo[]): void {
  sitios.forEach(([x, z], i) => {
    const g = grp(w.sc, [x, -3, z]);
    mk(Sph(0.35, 14, 10), '#7FA8C9', { s: [1, 0.8, 2.6], ol: 0.03, cs: false, to: g });
    mk(Cone(0.18, 0.45, 8), '#7FA8C9', { p: [0, 0.35, 0.05], r: [-0.4, 0, 0], ol: 0.03, cs: false, to: g });
    mk(Box(0.7, 0.06, 0.25), '#7FA8C9', { p: [0, 0, -0.95], ol: 0.03, cs: false, to: g });
    sinToqueTodo(g);
    const chof = salpicadura(w, x, z);
    w.upd.push(() => {
      const t = (T + i * 4.5) % 9;
      chof(t, 2);
      if (t > 2) {
        g.visible = false;
        return;
      }
      const k = t / 2;
      g.visible = true;
      g.position.set(x, -1.4 + Math.sin(k * Math.PI) * 1.8, z + (k - 0.5) * 3);
      g.rotation.x = (k - 0.5) * 1.8;
    });
  });
}

// ballena3(w, x, z): una ballena azul a lo lejos en el mar, en (x, z): el lomo que asoma y se mece con las olas y, cada
// 7 segundos, un chorro de agua (unas gotas blancas que suben y caen) que sale de su espiráculo.
export function ballena3(w: Mundo, x: number, z: number): void {
  const g = grp(w.sc, [x, -1.15, z]);
  mk(Sph(1, 18, 12), '#4F6E9E', { s: [2.6, 0.7, 1.2], ol: 0.04, cs: false, to: g });
  mk(Box(1.2, 0.08, 0.5), '#4F6E9E', { p: [-2.6, 0.25, 0], r: [0, 0, 0.5], ol: 0.03, cs: false, to: g });
  sinToqueTodo(g);
  const gotas: THREE.Sprite[] = [];
  for (let i = 0; i < 8; i++) {
    const s = sinToque(
      new THREE.Sprite(
        new THREE.SpriteMaterial({ map: softTex(), color: '#FFFFFF', transparent: true, depthWrite: false }),
      ),
    );
    s.scale.setScalar(0.5);
    g.add(s);
    gotas.push(s);
  }
  w.upd.push(() => {
    g.position.y = -1.15 + Math.sin(T * 0.8) * 0.12;
    g.rotation.z = Math.sin(T * 0.5) * 0.04;
    const t = T % 7;
    gotas.forEach((s, i) => {
      const k = (t - i * 0.06) / 1.4,
        a = (i / 8) * Math.PI * 2;
      s.visible = k > 0 && k < 1;
      if (!s.visible) return;
      s.position.set(1.2 + Math.cos(a) * k * 0.6, 0.7 + Math.sin(k * Math.PI) * 2.2, Math.sin(a) * k * 0.6);
      s.material.opacity = 0.9 * (1 - k);
    });
  });
}

// velero3(w, R, Rz, noche): un velero de vela blanca y casco rojo que navega despacio alrededor de la isla, en una
// elipse de radios R por Rz, meciéndose con las olas; de noche lleva un farol encendido en lo alto del mástil.
export function velero3(w: Mundo, R: number, Rz: number, noche: boolean): void {
  const g = grp(w.sc, [R, -1, 0]);
  mk(Box(0.6, 0.35, 1.6), '#E2574C', { p: [0, 0.1, 0], ol: 0.03, cs: false, to: g });
  mk(Cyl(0.04, 0.04, 2, 6), '#8A5A3C', { p: [0, 1.2, 0], ol: 0.02, cs: false, to: g });
  const vela = new THREE.Shape();
  vela.moveTo(0, 0);
  vela.lineTo(0, 1.7);
  vela.lineTo(0.9, 0);
  vela.closePath();
  mk(new THREE.ShapeGeometry(vela), new THREE.MeshBasicMaterial({ color: '#FFFFFF', side: THREE.DoubleSide }), {
    p: [0.02, 0.35, 0.1],
    r: [0, -Math.PI / 2, 0],
    ol: 0,
    cs: false,
    to: g,
  });
  if (noche) {
    const f = sinToque(
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: softTex(),
          color: '#FFD27A',
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    f.position.set(0, 2.25, 0);
    f.scale.setScalar(1.4);
    g.add(f);
  }
  sinToqueTodo(g);
  w.upd.push(() => {
    const t = T * 0.03,
      x = Math.cos(t) * R,
      z = Math.sin(t) * Rz;
    g.position.set(x, -1 + Math.sin(T * 1.3) * 0.08, z);
    g.rotation.y = Math.atan2(-Math.sin(t) * R, Math.cos(t) * Rz) + Math.PI;
    g.rotation.z = Math.sin(T * 1.1) * 0.06;
  });
}

// pajaros3(w, h, z, ancho): tres pajaritos oscuros que cruzan el cielo de una zona en fila, de izquierda a derecha, a la
// altura h y en el fondo z, aleteando; al salir por un lado vuelven a entrar por el otro (ancho: de cuánto es la vuelta).
export function pajaros3(w: Mundo, h: number, z: number, ancho: number): void {
  for (let i = 0; i < 3; i++) {
    const g = grp(w.sc, [0, h, z]),
      alas: THREE.Mesh[] = [-1, 1].map((sd) =>
        mk(Box(0.55, 0.04, 0.18), '#4A3428', { p: [sd * 0.27, 0, 0], ol: 0, cs: false, to: g }),
      );
    sinToqueTodo(g);
    w.upd.push(() => {
      const x = ((T * 1.6 + i * 1.4) % ancho) - ancho / 2;
      g.position.set(x, h + i * 0.5 + Math.sin(T + i) * 0.3, z + i * 0.8);
      const a = Math.sin(T * 9 + i) * 0.5;
      alas[0]!.rotation.z = a;
      alas[1]!.rotation.z = -a;
    });
  }
}

// MARIPOSA_COLOR: los colores de las mariposas de las islas.
const MARIPOSA_COLOR = ['#FF8A7A', '#FFD66B', '#B9A6F0'];

// mariposasIsla3(w, sitios): una mariposa revoloteando alrededor de cada sitio de la isla (x, z), sin toque, para que no
// le quite el toque a las zonas ni a Lupi o Polly.
export function mariposasIsla3(w: Mundo, sitios: readonly PuntoSuelo[]): void {
  sitios.forEach(([x, z], i) => sinToqueTodo(butterfly3(w, x, z, MARIPOSA_COLOR[i % MARIPOSA_COLOR.length]!, i * 1.7)));
}

// cometa3(w, x, z): una cometa de colores que vuela sobre (x, z) a 5 de altura, dando bandazos con el viento, con su
// cola de lazos que ondea y la cuerda que baja hasta el suelo.
export function cometa3(w: Mundo, x: number, z: number): void {
  const g = grp(w.sc, [x, 5, z]),
    forma = new THREE.Shape();
  forma.moveTo(0, 0.9);
  forma.lineTo(0.6, 0);
  forma.lineTo(0, -1.1);
  forma.lineTo(-0.6, 0);
  forma.closePath();
  mk(new THREE.ShapeGeometry(forma), new THREE.MeshBasicMaterial({ color: '#FF6B5E', side: THREE.DoubleSide }), {
    ol: 0,
    cs: false,
    to: g,
  });
  mk(Box(1.2, 0.04, 0.02), '#FFD66B', { ol: 0, cs: false, to: g });
  const lazos = [0, 1, 2, 3].map((i) =>
    mk(Box(0.28, 0.14, 0.02), ['#FFD66B', '#7CC86E', '#5BB8E6', '#B9A6F0'][i]!, { ol: 0, cs: false, to: g }),
  );
  const cuerda = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    linea = new THREE.Line(cuerda, new THREE.LineBasicMaterial({ color: '#6B5A4A' }));
  linea.raycast = () => {};
  w.sc.add(linea);
  sinToqueTodo(g);
  const pos = cuerda.attributes.position as THREE.BufferAttribute;
  w.upd.push(() => {
    g.position.set(x + Math.sin(T * 0.7) * 0.6, 5 + Math.sin(T * 1.1) * 0.4, z);
    g.rotation.z = Math.sin(T * 1.3) * 0.25;
    lazos.forEach((l, i) => l.position.set(Math.sin(T * 3 + i) * 0.15 * (i + 1), -1.4 - i * 0.4, 0));
    pos.setXYZ(0, g.position.x, g.position.y - 0.9, g.position.z);
    pos.setXYZ(1, x - 1.5, 0.2, z + 2);
    pos.needsUpdate = true;
  });
}

// pecesSaltan3(w, sitios): en cada sitio del mar (x, z), un pececito naranja que salta del agua en un arco corto cada 5
// segundos (cada uno a destiempo) y salpica al salir y al entrar.
export function pecesSaltan3(w: Mundo, sitios: readonly PuntoSuelo[]): void {
  sitios.forEach(([x, z], i) => {
    const g = grp(w.sc, [x, -3, z]);
    mk(Sph(0.16, 10, 8), '#FF9A3C', { s: [1, 0.8, 1.8], ol: 0.02, cs: false, to: g });
    mk(Cone(0.12, 0.2, 6), '#FF9A3C', { p: [0, 0, -0.32], r: [-Math.PI / 2, 0, 0], ol: 0.02, cs: false, to: g });
    sinToqueTodo(g);
    const chof = salpicadura(w, x, z);
    w.upd.push(() => {
      const t = (T + i * 1.7) % 5;
      chof(t, 0.8);
      if (t > 0.8) {
        g.visible = false;
        return;
      }
      const k = t / 0.8;
      g.visible = true;
      g.position.set(x, -1.1 + Math.sin(k * Math.PI) * 0.9, z + (k - 0.5) * 1.2);
      g.rotation.x = (k - 0.5) * 2;
    });
  });
}

// tintarNubes3(w): al amanecer (de 7 a 9) las nubes del mundo (las que marca cloud3 con userData.nube) se vuelven
// rosadas, y por la tarde (de 18 a 20), anaranjadas; de día y de noche se quedan como están. Cambia una copia del
// material, porque los materiales se comparten.
export function tintarNubes3(w: Mundo): void {
  const h = ahora().getHours(),
    color = h >= 7 && h < 9 ? '#FFDCE8' : h >= 18 && h < 20 ? '#FFD2AE' : null;
  if (!color) return;
  w.sc.traverse((o) => {
    if (!o.userData.nube) return;
    o.traverse((m) => {
      const mesh = m as THREE.Mesh;
      if (!mesh.isMesh || !(mesh.material instanceof THREE.MeshToonMaterial)) return;
      const copia = mesh.material.clone();
      copia.color.set(color);
      mesh.material = copia;
    });
  });
}
