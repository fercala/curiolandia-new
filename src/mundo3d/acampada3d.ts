/*
 * mundo3d/acampada3d.ts: la tienda de campaña del mapa 3D, al pie del monte (idea 24 de docs/IDEAS-MEJORA.md, fase
 * P29). Es una tienda naranja con una hoguera que chisporrotea; al tocarla, Tito va andando hasta ella y empieza la
 * linterna de noche (SCENES.linterna, escenas/linterna.ts).
 * Exporta: acampada3 (la pone en el mapa), tocarAcampada (desde el down del mapa) y acampadaEnPantalla (para las
 * pruebas; mundo3d.ts la vuelve a exportar).
 * Importa: del núcleo, T, go y sceneName; el motor, las piezas y walkTo.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas de la tienda y de la hoguera son el dibujo mismo. */
import type { Mundo } from './tipos.ts';
import { PI, T, go, sceneName } from '../nucleo/indice.ts';
import { W3, projO } from './motor.ts';
import { Box, Cone, Cyl, Sph, V3, grp, mk } from './materiales.ts';
import { walkTo } from './interaccion.ts';

// acampada3(w, x, z): la tienda de campaña en (x, z) del mapa, con la hoguera y unos troncos para sentarse; se puede
// tocar (userData.id 'acampada'). La llama buildMap (mundo3d/mapa3d.ts).
export function acampada3(w: Mundo, x: number, z: number): void {
  const g = grp(w.sc, [x, 0, z], 0.7);
  g.rotation.y = -0.5;
  mk(Cone(1.7, 2.4, 4), '#E8833A', { p: [0, 1.2, 0], r: [0, PI / 4, 0], to: g, ol: 0.04 });
  mk(Cone(0.6, 1.3, 3), '#7A3E1C', { p: [0, 0.65, 1.05], r: [0, PI, 0], to: g, ol: 0.02 });
  [-0.5, 0.5].forEach((d) =>
    mk(Cyl(0.12, 0.12, 0.9, 8), '#6E4B33', { p: [2.2 + d * 0.4, 0.12, 1.6 + d], r: [0, 0, PI / 2], to: g, ol: 0.02 }),
  );
  mk(Box(0.9, 0.2, 0.3), '#6E4B33', { p: [2.2, 0.1, 1.6], to: g, ol: 0.02 });
  const fuego = mk(Sph(0.32, 10, 8), '#FFB43C', { p: [2.2, 0.45, 1.6], to: g, ol: 0, cs: false }),
    llama = mk(Cone(0.22, 0.6, 8), '#FFE27A', { p: [2.2, 0.7, 1.6], to: g, ol: 0, cs: false });
  Object.assign(g.userData, { id: 'acampada' });
  w.pick.push(g);
  w.upd.push(() => {
    const f = 1 + Math.sin(T * 12) * 0.15;
    fuego.scale.setScalar(f);
    llama.scale.set(1, f * 1.1, 1);
  });
}

// tocarAcampada(w): se ha tocado la tienda de campaña: Tito va andando hasta ella y, al llegar, empieza la linterna.
export function tocarAcampada(w: Mundo): void {
  const g = w.pick.find((o) => o.userData.id === 'acampada');
  if (!w.tito || !g) return;
  const p = g.position;
  walkTo(
    w,
    w.tito,
    V3(p.x - 1.6, w.tito.position.y, p.z + 1.6),
    () => {
      if (sceneName === 'map') go('linterna', { hello: true });
    },
    { speed: 8, max: 2.2 },
  );
}

// acampadaEnPantalla(): dónde se ve la tienda de campaña en el mapa 3D, o null si no está (para las pruebas).
export function acampadaEnPantalla(): { x: number; y: number } | null {
  const g = W3?.kind === 'map' ? W3.pick.find((o) => o.userData.id === 'acampada') : undefined;
  if (!g) return null;
  const [x, y] = projO(g, 0.8);
  return { x, y };
}
