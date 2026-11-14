/*
 * mundo3d/tesoros3d.ts: los tesoros escondidos en el mapa 3D (idea 18 de docs/IDEAS-MEJORA.md, fase P14). tesoros3(w)
 * (la llama buildMap, mundo3d/mapa3d.ts) pone en su rincón cada tesoro de hoy que aún no se ha encontrado
 * (tesorosPendientes, escenas/tesoros.ts): su dibujo pequeñito y medio escondido, con un corro de luz en el suelo.
 * Cuando Tito pasa cerca, el tesoro sube, crece y brilla (y Tito dice que algo brilla, una vez por tesoro). Si se toca
 * (tocarTesoro, desde el down del mapa), Tito va hasta él y lo recoge: recogerTesoro (escenas/tesoros.ts) lo apunta y da
 * las monedas, y el tesoro se va volando hacia arriba. También se recoge solo si Tito pasea justo por encima.
 * Exporta: RINCON_POS (dónde está cada rincón, en píxeles del mapa 2D), tesoros3 y tocarTesoro.
 * Importa: three, el núcleo (T, sceneName, sayQ), las piezas de mundo3d/materiales.ts, fhit de mundo3d/decorado.ts,
 * walkTo de mundo3d/interaccion.ts, projO de mundo3d/motor.ts y lo de los tesoros de escenas/tesoros.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en unidades del mundo 3D y tiempos de las
   animaciones, como en el resto de la capa 3D. */
import * as THREE from 'three';
import type { Mundo, PuntoSuelo } from './tipos.ts';
import { PI, T, sayQ, sceneName } from '../nucleo/indice.ts';
import { V3, grp, picTex, spr } from './materiales.ts';
import { fhit } from './decorado.ts';
import { walkTo } from './interaccion.ts';
import { projO } from './motor.ts';
import { recogerTesoro, tesorosPendientes } from '../escenas/tesoros.ts';

// RINCON_POS: dónde está cada rincón de dominio/tesoros.ts (RINCONES), en píxeles del mapa 2D (como MAPPOS de
// mundo3d/mapa3d.ts): en el suelo libre que hay junto a su lugar.
export const RINCON_POS: Readonly<Record<string, PuntoSuelo>> = {
  jardin: [430, 680],
  bosque: [990, 370],
  montana: [1330, 680],
  plaza: [680, 440],
  muelle: [1150, 830],
  cole: [470, 500],
  fiestas: [680, 760],
  globo: [1190, 560],
};
// MEDIDAS: a qué distancia de Tito brilla un tesoro y a cuál lo recoge solo, y lo que tarda en irse volando.
const MEDIDAS = { brilla: 4.2, recoge: 1.1, vuela: 1.2 };
// mp(x, y): pasa un punto del mapa 2D a [x, z] del suelo 3D (la misma cuenta que MP de mundo3d/mapa3d.ts).
const mp = (x: number, y: number): PuntoSuelo => [(x - 800) / 40, (y - 500) / 40];

// recoger(g): el tesoro g se recoge (si no se había recogido ya): se apunta y da monedas (recogerTesoro, con las
// monedas saliendo de donde se ve en la pantalla) y empieza a irse volando.
function recoger(g: THREE.Group): void {
  const u = g.userData;
  if (u.cogido) return;
  u.cogido = T;
  const [x, y] = projO(g, 1);
  recogerTesoro(u.rincon as string, x, y);
}

// tesoros3(w): pone en el mapa los tesoros de hoy que faltan, cada uno en un grupo tocable (userData.id 'tesoro' y su
// rincón) con su dibujo, un corro de luz y una caja invisible para tocarlo mejor; y su animación: medio escondido y
// quieto lejos de Tito, más alto, grande y brillante cerca, y volando hacia arriba al recogerlo.
export function tesoros3(w: Mundo): void {
  tesorosPendientes().forEach((e) => {
    const pos = RINCON_POS[e.rincon];
    if (!pos) return;
    const [x, z] = mp(pos[0], pos[1]),
      g = grp(w.sc, [x, 0, z]);
    Object.assign(g.userData, { id: 'tesoro', rincon: e.rincon, tesoro: e.tesoro, dicho: false, cogido: 0 });
    const dibujo = spr(picTex(e.tesoro), 1.1, 1.1, { p: [0, 0.45, 0], to: g }),
      corro = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.75, 24),
        new THREE.MeshBasicMaterial({ color: '#FFE38A', transparent: true, opacity: 0.4, depthWrite: false }),
      ),
      caja = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), fhit());
    corro.rotation.x = -PI / 2;
    corro.position.y = 0.06;
    caja.position.y = 0.8;
    g.add(corro, caja);
    w.pick.push(g);
    w.upd.push(() => {
      const u = g.userData;
      if (u.cogido) {
        const k = Math.min(1, (T - u.cogido) / MEDIDAS.vuela);
        dibujo.position.y = 0.9 + k * 4;
        dibujo.material.opacity = 1 - k;
        corro.visible = false;
        if (k >= 1) g.visible = false;
        return;
      }
      const d = w.tito ? Math.hypot(w.tito.position.x - x, w.tito.position.z - z) : 99,
        cerca = Math.max(0, 1 - d / MEDIDAS.brilla);
      dibujo.position.y = 0.45 + cerca * 0.6 + Math.sin(T * 3 + x) * 0.08 * cerca;
      dibujo.scale.setScalar(1.1 + cerca * 0.6);
      corro.material.opacity = 0.25 + cerca * 0.5 + Math.sin(T * 6) * 0.1 * cerca;
      corro.scale.setScalar(1 + cerca * 0.5 + Math.sin(T * 5) * 0.08);
      if (cerca > 0.3 && !u.dicho && sceneName === 'map') {
        u.dicho = true;
        sayQ('¡Algo brilla por aquí!');
      }
      if (d < MEDIDAS.recoge && w.walk == null) recoger(g);
    });
  });
}

// tocarTesoro(w, rinconId): se ha tocado en el mapa el tesoro del rincón rinconId (pickAt da su userData): Tito va
// hasta él y, al llegar, lo recoge.
export function tocarTesoro(w: Mundo, rinconId: string): void {
  const g = w.pick.find((o) => o.userData.id === 'tesoro' && o.userData.rincon === rinconId) as THREE.Group | undefined;
  if (!w.tito || !g || g.userData.cogido) return;
  const p = g.position;
  walkTo(
    w,
    w.tito,
    V3(p.x + 0.6, w.tito.position.y, p.z + 0.6),
    () => {
      if (sceneName === 'map') recoger(g);
    },
    { speed: 8, max: 2.2 },
  );
}
