/*
 * mundo3d/lucesNoche.ts: las luces del mapa 3D (mejora gráfica 6 de docs/MEJORAS-GRAFICAS.md, v0.2.183). Antes, de
 * noche el mapa solo se teñía de azul y tenía luciérnagas; ahora:
 *   - farolas a lo largo de los caminos (de día, apagadas; de noche, con la bombilla encendida, su halo y un charco de
 *     luz cálida en el suelo, que respiran despacio);
 *   - un resplandor cálido en los sitios con casas (las ventanas encendidas: la casa de Tito, la tienda, el cole...);
 *   - el reflejo de la luna en el mar: unos destellos que brillan a destiempo sobre las olas.
 * Las luces no son luces de verdad de three.js (costarían mucho en el móvil): son sprites y planos con la textura suave
 * (softTex) y mezcla aditiva, y no se pueden tocar (raycast vacío).
 *   - de día, los destellos del sol en el mar (desde la mejora gráfica 17, destellosSol3).
 * Exporta: farolas3, resplandores3, reflejoLuna3 y destellosSol3. Las llama buildMap (mundo3d/mapa3d.ts); las dos primeras, desde
 * la mejora gráfica 16, también lucesZona (mundo3d/zonas3d.ts), en los caminos de casitas de noche.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- posiciones, tamaños, colores y
   tiempos de las piezas 3D, y bucles que las reparten. */
import * as THREE from 'three';
import type { Mundo, PuntoSuelo } from './tipos.ts';
import { T } from '../nucleo/indice.ts';
import { Cone, Cyl, M, Sph, grp, mk } from './materiales.ts';
import { softTex } from './decorado.ts';

// brillo(color, opacidad): un sprite redondo y difuminado que suma luz (para halos), que no se puede tocar.
function brillo(color: string, opacidad: number): THREE.Sprite {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: softTex(),
      color,
      transparent: true,
      opacity: opacidad,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  s.raycast = () => {};
  return s;
}

// charco(color, opacidad, lado): un plano tumbado en el suelo con la luz suave (el charco de luz de una farola o el
// destello de la luna en el mar), que no se puede tocar.
function charco(color: string, opacidad: number, lado: number): THREE.Mesh {
  const g = new THREE.PlaneGeometry(lado, lado);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({
      map: softTex(),
      color,
      transparent: true,
      opacity: opacidad,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  m.raycast = () => {};
  return m;
}

// farolas3(w, puntos, noche): una farola en cada punto del suelo: el poste oscuro, el sombrerito y la bombilla; de
// noche, la bombilla encendida, su halo y el charco de luz, que respiran despacio (cada una a su ritmo).
export function farolas3(w: Mundo, puntos: readonly PuntoSuelo[], noche: boolean): void {
  puntos.forEach(([x, z], i) => {
    const f = grp(w.sc, [x, 0, z]);
    mk(Cyl(0.06, 0.09, 2.2, 8), '#4A4E66', { p: [0, 1.1, 0], to: f, ol: 0.02 });
    mk(Cyl(0.16, 0.16, 0.1, 10), '#4A4E66', { p: [0, 0.05, 0], to: f, ol: 0.02 });
    mk(Cone(0.3, 0.22, 8), '#4A4E66', { p: [0, 2.55, 0], to: f, ol: 0.02 });
    mk(Sph(0.17, 12, 10), noche ? M('#FFF3B0', { emissive: '#FFC94A' }) : '#F4F0E0', {
      p: [0, 2.32, 0],
      to: f,
      ol: 0.015,
      cs: false,
    });
    if (!noche) return;
    const h = brillo('#FFD27A', 0.75);
    h.position.set(0, 2.32, 0);
    h.scale.setScalar(2.2);
    f.add(h);
    const c = charco('#FFC86A', 0.35, 3.4);
    c.position.y = 0.06;
    f.add(c);
    w.upd.push(() => {
      const k = 0.88 + 0.12 * Math.sin(T * 1.7 + i * 1.3);
      h.material.opacity = 0.75 * k;
      (c.material as THREE.MeshBasicMaterial).opacity = 0.35 * k;
    });
  });
}

// resplandores3(w, puntos): de noche, un resplandor cálido en cada punto (donde hay casas con las ventanas encendidas).
export function resplandores3(w: Mundo, puntos: readonly PuntoSuelo[]): void {
  puntos.forEach(([x, z]) => {
    const r = brillo('#FFB85A', 0.3);
    r.position.set(x, 1.4, z);
    r.scale.setScalar(5.5);
    w.sc.add(r);
  });
}

// reflejoLuna3(w, x, z): el reflejo de la luna en el mar, de noche: una fila de destellos alargados que va de (x, z)
// hacia la derecha, detrás de la isla, y brilla a destiempo, como si la luz bailara sobre las olas.
export function reflejoLuna3(w: Mundo, x: number, z: number): void {
  const ds: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const d = charco('#FFF3B8', 0.4, 1.6);
    d.position.set(x + i * 1.1, -0.8, z + i * 0.25);
    d.scale.set(1.6 - i * 0.12, 1, 0.45);
    w.sc.add(d);
    ds.push(d);
  }
  w.upd.push(() => {
    ds.forEach((d, i) => {
      (d.material as THREE.MeshBasicMaterial).opacity = 0.18 + 0.3 * Math.abs(Math.sin(T * 1.6 + i * 0.9));
    });
  });
}

// destellosSol3(w, x, z, ancho, fondo): de día (mejora gráfica 17 de docs/MEJORAS-GRAFICAS.md), los destellos del sol en
// el mar: 14 chispitas blancas repartidas (siempre igual, sin azar) por el rectángulo de mar que empieza en (x, z) y mide
// ancho por fondo; cada una se enciende y se apaga a su ritmo, como el sol que brilla en las olas.
export function destellosSol3(w: Mundo, x: number, z: number, ancho: number, fondo: number): void {
  const ds: THREE.Sprite[] = [];
  for (let i = 0; i < 14; i++) {
    const d = brillo('#FFFFFF', 0);
    d.position.set(x + ((i * 0.618) % 1) * ancho, -0.85, z + ((i * 0.377) % 1) * fondo);
    d.scale.set(0.9, 0.35, 1);
    w.sc.add(d);
    ds.push(d);
  }
  w.upd.push(() => {
    ds.forEach((d, i) => {
      const k = Math.sin(T * (1.3 + (i % 4) * 0.35) + i * 2.1);
      d.material.opacity = k > 0.55 ? (k - 0.55) * 2 : 0;
    });
  });
}
