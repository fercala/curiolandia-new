/*
 * escenas/disposicion.ts (desde la fase 4i): DÓNDE ESTÁ CADA COSA EN LA PANTALLA LÓGICA
 * ---------------------------------------------------------------------
 * La lógica de las escenas (tocar, pistas, carteles) trabaja en la pantalla lógica de 1600x900. Dónde cae cada cosa
 * depende de la vista: la 2D tiene posiciones fijas (en escenas/zonas.ts) y la 3D, las de sus objetos proyectados a la
 * pantalla en cada cuadro. Disposicion es la interfaz que las une: la vista 3D pone la suya (ponDisposicion) al
 * montarse, y la lógica pregunta aquí antes de usar la posición 2D. Cada método devuelve null cuando la vista no sabe
 * dónde está esa cosa (por ejemplo, otra escena en pantalla), y entonces vale la posición 2D.
 * Hoy solo pregunta stationPos (los puestos de la casita); en la fase 4j pasarán aquí las zonas del mapa y las casitas
 * de cada zona (MZ2, ZPOS), y en la 4k, Tito y su casa (TITO, HOUSE_AT).
 * Exporta: el tipo Disposicion, disposicion y ponDisposicion. No importa nada del juego (solo el tipo Tema).
 */
import type { Tema } from '../juegos/tipos.ts';

// Disposicion: dónde está cada cosa tocable en la pantalla lógica, según la vista.
//   puesto(t, j): [x, y] del puesto del juego j en la casita del tema t, o null si la vista no lo sabe.
export interface Disposicion {
  puesto(t: Tema, j: number): number[] | null;
}

// La disposición de la vista que no es la 2D (null: solo hay vista 2D, por ejemplo sin WebGL).
let actual: Disposicion | null = null;
// disposicion(): la disposición puesta por la vista 3D, o null si no hay.
export function disposicion(): Disposicion | null {
  return actual;
}
// ponDisposicion(d): la vista 3D pone la suya al montarse (mundo3d/casita3d.ts).
export function ponDisposicion(d: Disposicion | null): void {
  actual = d;
}
