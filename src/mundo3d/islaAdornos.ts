/*
 * mundo3d/islaAdornos.ts: lo que hace más rica la isla 3D de las Letras y la del Inglés (mejora gráfica 5 de
 * docs/MEJORAS-GRAFICAS.md, v0.2.183). Las dos islas eran una elipse de arena y otra de hierba casi vacías; ahora tienen:
 *   - caminos de arena desde el centro (Lupi o Polly) hasta cada una de las tres zonas, con sus piedrecitas;
 *   - olas en la orilla: dos aros de espuma que se abren y se desvanecen alrededor de la isla, a destiempo;
 *   - rocas y conchas en la arena, palmeras en la orilla, arbustos y flores en la hierba entre las zonas;
 *   - de noche, luciérnagas.
 * Todo va lejos de las zonas, del barco o el globo y de donde empieza Tito, para no tapar nada que se toque.
 * Exporta: adornarIsla. La llaman buildIsla (mundo3d/isla3d.ts) y buildIslaIngles (mundo3d/islaIngles3d.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, colores y tiempos de las piezas 3D. */
import * as THREE from 'three';
import type { Mundo, PuntoSuelo } from './tipos.ts';
import { FLC, T } from '../nucleo/indice.ts';
import { grp } from './materiales.ts';
import { bez, bush3, fireflies, flower3, ribbon, rock3 } from './decorado.ts';
import { palm3 } from './objetos.ts';
import { destellosSol3, farolas3, resplandores3 } from './lucesNoche.ts';
import { ballena3, delfines3, mariposasIsla3, sombrasNubes3, velero3 } from './mapaVivo.ts';

// ROCAS, PALMERAS, ARBUSTOS y FLORES: dónde va cada adorno ([x, z]; las rocas y conchas en la arena, a ras de la
// orilla; las palmeras en el borde de la hierba; los arbustos y las flores entre las zonas).
const ROCAS: readonly PuntoSuelo[] = [
  [-15.2, -2.5],
  [-12.5, -6.4],
  [6.5, -8.4],
  [15.6, -1.5],
  [-6, 9.4],
  [4.5, 9.6],
];
const PALMERAS: readonly PuntoSuelo[] = [
  [-13.4, -3.8],
  [12.8, -4.6],
  [-11.6, 5.6],
];
const ARBUSTOS: readonly PuntoSuelo[] = [
  [-4.6, -5.6],
  [4.8, -5.8],
  [-12.2, 0.4],
  [12.6, 0.2],
  [5.2, 6.8],
];
const FLORES: readonly PuntoSuelo[] = [
  [-4.4, -1.2],
  [-3.6, -0.4],
  [4.2, -1],
  [3.4, -0.2],
  [-5.6, 6.6],
  [3, 6.4],
  [-9.8, -3.4],
  [9.6, -3.8],
];

// olas3(w): las dos olas de la orilla: aros de espuma blancos (con la forma de la isla) que crecen un poco y se
// desvanecen, uno detrás de otro.
function olas3(w: Mundo): void {
  [0, 0.5].forEach((fase) => {
    const g = new THREE.TorusGeometry(1, 0.012, 4, 72);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.6, depthWrite: false }),
    );
    m.raycast = () => {};
    m.position.set(0, -0.86, 0.6);
    w.sc.add(m);
    w.upd.push(() => {
      const k = (T * 0.35 + fase) % 1;
      m.scale.set(17 + k * 1.6, 1, 10.1 + k * 1.1);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - k);
    });
  });
}

// adornarIsla(w, zonas, centro, noche): pone en la isla del mundo w los caminos (del centro a cada zona), las olas, las
// rocas, las palmeras, los arbustos, las flores y, de noche, las luciérnagas, las farolas de los caminos y las ventanas
// encendidas (mejora 39); de día, los destellos del sol en el mar, las sombras de las nubes (mejora 37) y mariposas
// (mejora 60); y siempre, delfines, una ballena y un velero en el mar (mejoras 55 a 57).
export function adornarIsla(w: Mundo, zonas: readonly PuntoSuelo[], centro: PuntoSuelo, noche: boolean): void {
  zonas.forEach((z) => {
    const c: PuntoSuelo = [(centro[0] + z[0]) / 2, (centro[1] + z[1]) / 2 + 1.2];
    ribbon(w.sc, bez(centro, c, z, 20), 1.1, '#F4DFA8', 0.02, { dash: 3, polygonOffset: 1 });
  });
  olas3(w);
  const arena = grp(w.sc, [0, -0.6, 0]);
  ROCAS.forEach(([x, z], i) => rock3(arena, x, z, 0.8 + (i % 3) * 0.25, i % 2 ? '#C9C0B3' : '#B9B2A8'));
  PALMERAS.forEach(([x, z], i) => palm3(w, x, z, 0.75 + (i % 2) * 0.15));
  ARBUSTOS.forEach(([x, z], i) => bush3(w.sc, x, z, 0.7 + (i % 2) * 0.2));
  FLORES.forEach(([x, z], i) => flower3(w.sc, x, z, FLC[i % FLC.length]!, 0.6, 0));
  // delfines que saltan y una ballena a lo lejos (mejoras gráficas 55 y 56)
  delfines3(w, [
    [-22, -4],
    [21, -5],
  ]);
  ballena3(w, -10, -14);
  velero3(w, 21, 13, noche); // un velero que da la vuelta a la isla (mejora gráfica 57)
  if (noche) {
    fireflies(w, 26, 14, 1.8);
    // de noche, una farola junto a cada camino y las ventanas encendidas de las zonas (mejora gráfica 39)
    farolas3(
      w,
      zonas.map(([x, z]): PuntoSuelo => {
        const dx = x - centro[0],
          dz = z - centro[1],
          l = Math.hypot(dx, dz) || 1;
        return [centro[0] + dx * 0.55 - (dz / l) * 1.1, centro[1] + dz * 0.55 + (dx / l) * 1.1];
      }),
      true,
    );
    resplandores3(w, zonas);
  } else {
    sombrasNubes3(w); // las sombras de las nubes (mejora gráfica 37)
    mariposasIsla3(w, zonas); // mariposas (mejora gráfica 60)
    // de día, el sol brilla en el mar a los dos lados de la isla (mejora gráfica 17)
    destellosSol3(w, -26, 2, 7, 6);
    destellosSol3(w, 19, 2, 7, 6);
  }
}
