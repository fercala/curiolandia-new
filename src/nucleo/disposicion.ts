/*
 * nucleo/disposicion.ts (desde la fase 4i; hasta la 4k, en escenas/): DÓNDE ESTÁ CADA COSA EN LA PANTALLA LÓGICA
 * ---------------------------------------------------------------------
 * La lógica de las escenas (tocar, pistas, carteles) trabaja en la pantalla lógica de 1600x900. Dónde cae cada cosa
 * depende de la vista: la 2D tiene posiciones fijas (en escenas/zonas.ts) y la 3D, las de sus objetos proyectados a la
 * pantalla en cada cuadro. Disposicion es la interfaz que las une: la vista 3D pone la suya (ponDisposicion) al
 * montarse, y la lógica pregunta aquí antes de usar la posición 2D. Cada método devuelve null cuando la vista no sabe
 * dónde está esa cosa (por ejemplo, otra escena en pantalla), y entonces vale la posición 2D.
 * Preguntan aquí stationPos (los puestos de la casita, desde la fase 4i), mzOf (los sitios del mapa, MZ2) y casitaPos
 * (las casitas de cada zona, ZPOS), estos dos desde la 4j, y desde la 4k titoPos (Tito, TITO; lo usa inTito) y casaPos
 * (la casa de Tito en el mapa, HOUSE_AT). Cada parte de la vista 3D pone lo suyo (mundo3d/casita3d.ts, mapa3d.ts,
 * zonas3d.ts e interaccion.ts): ponDisposicion junta las partes. Está en el núcleo desde la fase 4k porque inTito
 * (nucleo/tito.ts) también pregunta aquí.
 * Exporta: el tipo Disposicion, disposicion y ponDisposicion. No importa nada del juego (solo el tipo Tema, de juegos/).
 */
import type { Tema } from '../juegos/tipos.ts';

// Disposicion: dónde está cada cosa tocable en la pantalla lógica, según la vista. Cada método puede faltar (esa parte
// de la vista no lo pone) o devolver null (no lo sabe ahora); en los dos casos vale la posición 2D.
//   puesto(t, j): [x, y] del puesto del juego j en la casita del tema t.
//   lugar(id): {x, y, r} del sitio id del mapa (MZ2).
//   casita(z, id): {x, y} de la casita del tema id en la zona z (ZPOS).
//   tito(): {x, y, w}, el rectángulo de Tito (TITO): donde se toca y donde sale su bocadillo.
//   casa(): [x, y] del suelo de la casa de Tito en el mapa (HOUSE_AT); Pipo está a su lado.
export interface Disposicion {
  puesto(t: Tema, j: number): number[] | null;
  lugar(id: string): { x: number; y: number; r: number } | null;
  casita(z: string, id: string): { x: number; y: number } | null;
  tito(): { x: number; y: number; w: number } | null;
  casa(): number[] | null;
}

// Lo que ha puesto la vista que no es la 2D (vacío: solo hay vista 2D, por ejemplo sin WebGL).
let actual: Partial<Disposicion> = {};
// disposicion(): lo que ha puesto la vista 3D de la disposición (sin nada si no hay vista 3D).
export function disposicion(): Partial<Disposicion> {
  return actual;
}
// ponDisposicion(d): cada parte de la vista 3D pone la suya al montarse; se junta con lo que ya había.
export function ponDisposicion(d: Partial<Disposicion>): void {
  actual = { ...actual, ...d };
}
