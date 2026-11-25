/*
 * dominio/luz.ts: la luz de las escenas 2D según la hora (mejora gráfica 1 de docs/MEJORAS-GRAFICAS.md, v0.2.183).
 * El mapa 3D ya cambia con la hora (mundo3d/cielo.ts, skyNow); con esto, también el cole, el patio y las excursiones:
 * cuatro momentos de luz (el amanecer, el día, la tarde y la noche, con las mismas horas que el mapa), el cielo de cada
 * momento, el velo que oscurece o calienta el suelo y la mezcla de dos colores.
 * Es DOMINIO: no dibuja ni sabe de la hora del reloj; recibe la hora (0 a 23) y devuelve colores.
 * Pruebas: tests/unidad/luz.test.ts.
 * Exporta: el tipo MomentoLuz; las tablas CIELO_LUZ y VELO_LUZ y las reglas momentoLuz, mezcla y cieloDe.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las horas y los colores van en tablas con nombre; sacarlos a otra
   constante solo repetiría el nombre. */

/** El momento de luz: el amanecer (de 7 a 9), el día (de 9 a 18), la tarde (de 18 a 20) y la noche (de 20 a 7). */
export type MomentoLuz = 'amanecer' | 'dia' | 'tarde' | 'noche';

/** El velo de un momento: un color y cuánto tapa (de 0 a 1). */
export interface Velo {
  readonly color: string;
  readonly alfa: number;
}

// momentoLuz(h): el momento de luz de la hora h (0 a 23), con las mismas horas que el cielo del mapa (skyNow).
export function momentoLuz(h: number): MomentoLuz {
  if (h >= 20 || h < 7) return 'noche';
  if (h >= 18) return 'tarde';
  if (h < 9) return 'amanecer';
  return 'dia';
}

// CIELO_LUZ: hacia qué colores (arriba y abajo) va el cielo de cada momento; de día, el de la escena tal cual.
export const CIELO_LUZ: Readonly<Record<MomentoLuz, readonly [string, string] | null>> = {
  amanecer: ['#FFC9D9', '#FFEFD8'],
  dia: null,
  tarde: ['#FFA36E', '#FFE0BC'],
  noche: ['#1C275C', '#3E4E8C'],
};

// VELO_LUZ: el velo que se pone encima del suelo y del paisaje de cada momento (no encima de los botones ni de Tito).
export const VELO_LUZ: Readonly<Record<MomentoLuz, Velo>> = {
  amanecer: { color: '#FF9EB5', alfa: 0.08 },
  dia: { color: '#FFFFFF', alfa: 0 },
  tarde: { color: '#FF8A3C', alfa: 0.14 },
  noche: { color: '#1A2257', alfa: 0.4 },
};

// canal(c, i): el canal i (0 rojo, 1 verde, 2 azul) del color c en «#RRGGBB», de 0 a 255.
const canal = (c: string, i: number): number => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);

// hex2(n): el número n (0 a 255) en dos cifras hexadecimales.
const hex2 = (n: number): string =>
  Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');

// mezcla(a, b, t): el color que hay entre a y b («#RRGGBB»): t = 0 es a, t = 1 es b.
export function mezcla(a: string, b: string, t: number): string {
  return '#' + [0, 1, 2].map((i) => hex2(canal(a, i) + (canal(b, i) - canal(a, i)) * t)).join('');
}

// cieloDe(m, arriba, abajo): los dos colores del cielo de una escena en el momento m: de día, los suyos; en los demás,
// tres cuartos del camino hacia los del momento (CIELO_LUZ), para que cada sitio siga teniendo su color.
export function cieloDe(m: MomentoLuz, arriba: string, abajo: string): readonly [string, string] {
  const c = CIELO_LUZ[m];
  if (!c) return [arriba, abajo];
  return [mezcla(arriba, c[0], 0.75), mezcla(abajo, c[1], 0.75)];
}
