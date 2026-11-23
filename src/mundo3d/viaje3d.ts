/*
 * mundo3d/viaje3d.ts: los viajes en barco y en globo en 3D (resto de la idea 19 de docs/IDEAS-MEJORA.md, fase P30).
 * Con WebGL, SCENES.viaje pasa a 3D: el barco de vela navega por el mar, con olas que pasan, o el globo de rayas vuela
 * entre nubes con el mar muy abajo; Tito va dentro, la isla de destino (con Lupi, Polly o la casa de Tito) se acerca y
 * pasan los animales (delfines, tortugas, pájaros, mariposas, un avión...), que se pueden saludar tocándolos.
 * La lógica es la de la escena 2D (escenas/viaje.ts: VIAJE, enter, update, hint, prompt y down); aquí solo cambia el
 * dibujo, y ponProyeccionViaje dice dónde se ven en la pantalla los que pasan. La cámara está quieta y el vehículo se ve
 * donde estaba el de 2D (CENTRO, en 640x520), así que tocarlo funciona igual. Sin WebGL sigue la escena 2D.
 * Exporta: montarViaje3D (la llama mundo3d/mundo3d.ts) y vehiculoEnPantalla (para las pruebas; mundo3d.ts la vuelve a
 * exportar).
 * Importa: three; del núcleo, SCENES, T, PI, sceneName, la casa y las monedas; de escenas/viaje.ts, VIAJE,
 * DURACION_VIAJE, QUIEN_ESPERA y ponProyeccionViaje; el motor, las piezas y Tito en 3D.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas del barco, el globo, la isla, las olas y las nubes, y la
   cámara, son el dibujo mismo. */
import * as THREE from 'three';
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import type { Mundo } from './tipos.ts';
import { PI, SCENES, T, drawCoinHUD, drawHome, sceneName } from '../nucleo/indice.ts';
import { DURACION_VIAJE, QUIEN_ESPERA, VIAJE, ponProyeccionViaje, type Pasajero } from '../escenas/viaje.ts';
import { W3, camRig, newWorld, proj, projO, setWorld } from './motor.ts';
import { Box, Cone, Cyl, Sph, V3, grp, mk, picTex, spr } from './materiales.ts';
import { makeTito } from './personajes.ts';

// VELOCIDAD: lo que avanzan por segundo, de derecha a izquierda, los que pasan (unidades 3D).
const VELOCIDAD = 5;
// SALIDA: dónde aparecen los que pasan (a la derecha, fuera de la pantalla).
const SALIDA = 24;
// BAJO_GLOBO: a qué altura queda el mar en el viaje en globo (abajo, y la isla de destino aún se ve al llegar).
const BAJO_GLOBO = -5;

// El mundo del viaje de ahora, el vehículo (con Tito), su fuego (el globo), la isla de destino y los que pasan.
let mundo: Mundo | null = null,
  vehiculo: THREE.Group | null = null,
  fuego: THREE.Mesh | null = null,
  isla: THREE.Group | null = null,
  titoViaje: THREE.Object3D | null = null,
  sprites: THREE.Sprite[] = [];

// donde3(p): dónde va p en el mundo 3D en este momento: sale por la derecha y va hacia la izquierda; su altura y su
// distancia salen de la altura que tenía en 2D (p.y), y salta si se le ha tocado hace menos de un segundo.
function donde3(p: Pasajero): THREE.Vector3 {
  const t = T - VIAJE.t0 - p.t,
    salto = T - p.salto < 1 ? Math.sin((T - p.salto) * PI) * 1.6 : 0,
    vaiven = Math.sin(T * 3 + p.t) * 0.15,
    x = SALIDA - t * VELOCIDAD;
  if (VIAJE.veh === 'globo') return V3(x, (520 - p.y) / 55 + salto + vaiven, p.y < 200 ? -3 : 0);
  // en el barco: lo de abajo (y grande en 2D) va en el agua, delante; lo de arriba, en el cielo, detrás
  // (los del agua asoman dando saltitos, como los delfines)
  const brinco = Math.max(0, Math.sin(T * 2.2 + p.t * 2)) * 0.9;
  return p.y > 600 ? V3(x, 0.4 + brinco + salto, (p.y - 600) / 40) : V3(x, (650 - p.y) / 85 + 1.2 + salto + vaiven, -6);
}

// barco3(to): el barco de vela con su casco rosa, el mástil y la vela blanca, y Tito en la cubierta.
function barco3(to: THREE.Object3D): void {
  // el casco, visto de lado, es un trapecio (más largo arriba, con la proa en punta) estirado a lo ancho
  const casco = new THREE.Shape();
  casco.moveTo(-2.3, 0.85);
  casco.lineTo(2.8, 0.85);
  casco.lineTo(1.7, -0.15);
  casco.lineTo(-1.9, -0.15);
  casco.closePath();
  mk(new THREE.ExtrudeGeometry(casco, { depth: 1.9, bevelEnabled: false }), '#FF8A7A', {
    p: [0, 0, -0.95],
    to,
    ol: 0.04,
  });
  mk(Box(5, 0.16, 2), '#FFFFFF', { p: [0.25, 0.9, 0], to, ol: 0.02 });
  mk(Cyl(0.08, 0.08, 4, 8), '#6E4B33', { p: [0.4, 2.8, 0], to, ol: 0.02 });
  const vela = new THREE.Shape();
  vela.moveTo(0, 0);
  vela.lineTo(2.2, 0);
  vela.lineTo(0, 3.2);
  vela.closePath();
  const m = mk(new THREE.ShapeGeometry(vela), '#FFFFFF', { p: [0.5, 1.2, 0], to, ol: 0, cs: false });
  (m.material as THREE.Material).side = THREE.DoubleSide;
  const tito = makeTito();
  tito.scale.setScalar(0.55);
  // en un asiento propio: la animación de Tito mueve su posición
  grp(to, [-1.2, 0.95, 0.2]).add(tito);
  titoViaje = tito;
}

// globo3(to): el globo de rayas rojas, blancas y azules, la cesta con sus cuerdas, el fuego y Tito dentro de la cesta.
function globo3(to: THREE.Object3D): void {
  const colores = ['#E8554E', '#FFFFFF', '#5B8DEF', '#FFFFFF'];
  Array.from({ length: 12 }, (_, i) => i).forEach((i) =>
    mk(new THREE.SphereGeometry(2.2, 6, 16, (i * PI) / 6, PI / 6), colores[i % 4]!, {
      p: [0, 4.3, 0],
      s: [1, 1.12, 1],
      to,
      ol: 0,
      cs: false,
    }),
  );
  mk(Cyl(0.7, 0.5, 0.5, 16), '#E8554E', { p: [0, 2, 0], to, ol: 0.02 });
  [-1, 1].forEach((a) =>
    [-1, 1].forEach((b) =>
      mk(Cyl(0.03, 0.03, 1.7, 4), '#6E4B33', { p: [a * 0.6, 1.1, b * 0.6], r: [b * 0.25, 0, -a * 0.25], to, ol: 0 }),
    ),
  );
  mk(Box(1.5, 0.9, 1.5), '#C98A4B', { p: [0, 0, 0], to, ol: 0.03 });
  fuego = mk(Cone(0.25, 0.8, 10), '#FFB43C', { p: [0, 1.7, 0], r: [PI, 0, 0], to, ol: 0, cs: false });
  const tito = makeTito();
  tito.scale.setScalar(0.4);
  grp(to, [0, 0.2, 0.1]).add(tito);
  titoViaje = tito;
}

// isla3(w, y): la isla de destino, que se acerca por la derecha: arena, hierba, unas palmeras y quien espera (Lupi,
// Polly o, al volver a Curiolandia, la casa de Tito). y, la altura del mar.
function isla3(w: Mundo, y: number): THREE.Group {
  const g = grp(w.sc, [SALIDA + 16, y, y < 0 ? -9 : -4]);
  mk(Cyl(6, 7, 1.2, 32), '#FFE6A8', { p: [0, 0, 0], to: g, ol: 0.02 });
  mk(Cyl(4.6, 5.2, 1, 32), '#8FD16A', { p: [0, 0.5, 0], to: g, ol: 0.02 });
  [-3, 3].forEach((x) => {
    mk(Cyl(0.15, 0.2, 2.6, 8), '#A86B43', { p: [x, 2.2, -2], to: g, ol: 0.02 });
    mk(Sph(1, 10, 8), '#3FA35B', { p: [x, 3.5, -2], s: [1.4, 0.5, 1.4], to: g, ol: 0.02 });
  });
  spr(picTex(QUIEN_ESPERA[VIAJE.a] ?? 'casa'), 4.4, 4.4, { p: [0, 3.1, 0], to: g });
  return g;
}

// olas3(w): las olas del mar (manchas blancas que corren hacia la izquierda y vuelven a salir por la derecha).
function olas3(w: Mundo): void {
  const olas = Array.from({ length: 26 }, (_, i) =>
    mk(Cyl(0.6, 0.6, 0.06, 12), '#E6F7FD', {
      p: [((i * 7.3) % 52) - 26, 0.03, ((i * 3.7) % 14) - 8],
      s: [1.6, 1, 0.5],
      to: w.sc,
      ol: 0,
      cs: false,
    }),
  );
  w.upd.push((dt: number) =>
    olas.forEach((o, i) => {
      const x = o.position.x - dt * (3 + (i % 3));
      o.position.setX(x < -28 ? x + 56 : x);
    }),
  );
}

// nubes3(w, y0): las nubes que pasan hacia la izquierda (a la altura y0 y más arriba), y vuelven a salir por la derecha.
function nubes3(w: Mundo, y0: number): void {
  const nubes = Array.from({ length: 8 }, (_, i) => {
    const g = grp(w.sc, [((i * 9.1) % 56) - 28, y0 + ((i * 2.3) % 7), -4 - ((i * 3.1) % 10)]);
    [
      [0, 0, 1.4],
      [1.3, 0.3, 1.1],
      [2.4, -0.1, 1.2],
      [1.1, -0.4, 1],
    ].forEach(([x, y, r]) => mk(Sph(r!, 12, 10), '#FFFFFF', { p: [x!, y!, 0], to: g, ol: 0, cs: false }));
    return g;
  });
  w.upd.push((dt: number) =>
    nubes.forEach((g, i) => {
      const x = g.position.x - dt * (1.5 + (i % 3) * 0.6);
      g.position.setX(x < -32 ? x + 64 : x);
    }),
  );
}

// construye(): el mundo del viaje: el mar (cerca en barco, muy abajo en globo), las olas o las nubes, la isla de destino,
// los que pasan y el vehículo con Tito. En cada cuadro se mueven la isla, los que pasan, el vehículo y Tito.
function construye(): Mundo {
  const globo = VIAJE.veh === 'globo',
    w = newWorld({ fov: 45, bg: globo ? '#8FD0F4' : '#BFE9F8', fog: [40, 120], kind: 'viaje', shadow: 20 }),
    mar = globo ? BAJO_GLOBO : 0;
  w.sun!.castShadow = false;
  mk(Box(400, 0.2, 400), '#5BB8E6', { p: [0, mar - 0.1, 0], to: w.sc, ol: 0, cs: false });
  if (globo) nubes3(w, 3);
  else {
    olas3(w);
    nubes3(w, 9);
  }
  mk(Sph(2, 16, 12), '#FFD66B', { p: [18, 16, -40], to: w.sc, ol: 0, cs: false });
  isla = isla3(w, mar);
  sprites = VIAJE.pasan.map((q) => spr(picTex(q.k), 2.6, 2.6, { p: [SALIDA + 10, 0, 0], to: w.sc }));
  vehiculo = grp(w.sc, [0, 0, 0]);
  fuego = null;
  if (globo) globo3(vehiculo);
  else barco3(vehiculo);
  w.upd.push((dt: number) => {
    if (sceneName !== 'viaje') return;
    coloca(dt);
  });
  coloca(0);
  return w;
}

// coloca(dt): pone en este cuadro la isla (se acerca según lo que va de viaje), los que pasan, el vehículo (el barco se
// mece; el globo sube con el fuego) y anima a Tito.
function coloca(dt: number): void {
  if (!vehiculo || !isla) return;
  const p = Math.min(1, (T - VIAJE.t0) / DURACION_VIAJE);
  isla.position.setX(SALIDA + 16 - p * 29);
  VIAJE.pasan.forEach((q, i) => sprites[i]?.position.copy(donde3(q)));
  if (VIAJE.veh === 'globo') {
    vehiculo.position.setY(VIAJE.alto / 40 + Math.sin(T * 1.6) * 0.15);
    fuego?.scale.setScalar(VIAJE.alto > 1 ? 1 + Math.sin(T * 20) * 0.2 : 0.4);
  } else {
    vehiculo.position.setY(Math.sin(T * 2) * 0.12);
    vehiculo.rotation.set(Math.sin(T * 1.3) * 0.05, 0, Math.sin(T * 1.6) * 0.04);
  }
  titoViaje?.userData.anim?.(dt, { walk: 0, hop: 0 });
}

// montarViaje3D(): con WebGL, pone la versión 3D de SCENES.viaje: la misma escena de escenas/viaje.ts (lo que pasa al
// entrar, cada cuadro, al tocar...) con el mundo 3D detrás; encima solo se pintan la casa y las monedas.
export function montarViaje3D(): void {
  const base = SCENES['viaje'];
  if (!base) return;
  ponProyeccionViaje((q) => {
    const [x, y] = proj(donde3(q));
    return { x, y };
  });
  SCENES['viaje'] = {
    ...base,
    three: true,
    // enter(o): el viaje de la escena 2D (o.a, el destino; o.veh, el vehículo) y su mundo 3D, con la cámara quieta de
    // lado, con el vehículo un poco a la izquierda (donde estaba el de 2D).
    enter(o: OpcionesEscena = {}) {
      base.enter?.call(this, o);
      mundo = construye();
      setWorld(mundo);
      if (VIAJE.veh === 'globo') camRig(mundo, V3(0, 3.6, 15), V3(2.7, 2.3, 0), 0);
      else camRig(mundo, V3(0, 3, 13.5), V3(2.9, 1.5, 0), 0);
    },
    // draw(): encima del 3D, la casa y las monedas.
    draw() {
      drawHome();
      drawCoinHUD();
    },
  };
}

// vehiculoEnPantalla(): dónde se ve el barco o el globo (con Tito) en la pantalla, o null si no hay viaje en 3D (para
// las pruebas).
export function vehiculoEnPantalla(): { x: number; y: number } | null {
  if (!vehiculo || W3?.kind !== 'viaje') return null;
  const [x, y] = projO(vehiculo, VIAJE.veh === 'globo' ? 3 : 0.8);
  return { x, y };
}
