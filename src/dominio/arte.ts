/*
 * dominio/arte.ts: las reglas del estudio de arte del cole (idea 31 de docs/IDEAS-MEJORA.md, en la PR de todas las
 * ideas pendientes, v0.2.181): la pintura simétrica (una cuadrícula de LADO x LADO: lo que se pinta en una mitad sale
 * igual, como en un espejo, en la otra) y la canción (ocho huecos con notas de un xilófono de cinco láminas). El cuadro
 * terminado se cuelga en el salón de la casa de Tito y la canción suena al tocarlo. Las escenas, en escenas/arte.ts.
 * Lo guardado va en S.arte ({ cuadro?: texto de LADO*LADO cifras, cancion?: notas }): opcional, sin migración (ausente
 * o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/arte.test.ts.
 * Exporta: LADO, COLORES_ARTE, CUADRO_VACIO, cuadroDe, pintar, cuadroPintado, NOTAS, HUECOS, cancionDe, ponerNota y
 * melodia.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (tamaño de la cuadrícula, notas
   MIDI), en constantes con nombre. */

// LADO: las casillas de cada lado de la cuadrícula del cuadro.
export const LADO = 8;
// COLORES_ARTE: los colores de la paleta; el 0 es el blanco (sin pintar).
export const COLORES_ARTE: readonly string[] = [
  '#FFFFFF',
  '#E8463C',
  '#FF9A2E',
  '#FFD23F',
  '#5BBF4A',
  '#3A7BD5',
  '#8E5AC8',
  '#4A3B33',
];
// CUADRO_VACIO: el cuadro sin pintar (todo blanco).
export const CUADRO_VACIO = '0'.repeat(LADO * LADO);

// cuadroDe(x): lee un cuadro guardado; si falta o está roto, vacío.
export function cuadroDe(x: unknown): string {
  return typeof x === 'string' && x.length === LADO * LADO && [...x].every((ch) => '01234567'.includes(ch))
    ? x
    : CUADRO_VACIO;
}
// pintar(cuadro, f, c, color): el cuadro con la casilla (f, c) y la de su espejo (la misma fila, la columna del otro
// lado) pintadas de ese color.
export function pintar(cuadro: string, f: number, c: number, color: number): string {
  if (f < 0 || f >= LADO || c < 0 || c >= LADO) return cuadro;
  const espejo = LADO - 1 - c;
  return [...cuadro].map((v, i) => (i === f * LADO + c || i === f * LADO + espejo ? String(color) : v)).join('');
}
// cuadroPintado(cuadro): ¿tiene alguna casilla pintada?
export const cuadroPintado = (cuadro: string): boolean => [...cuadro].some((ch) => ch !== '0');

// NOTAS: las láminas del xilófono: su nota (MIDI) y su color.
export const NOTAS: readonly { nota: number; color: string }[] = [
  { nota: 60, color: '#E8463C' },
  { nota: 62, color: '#FF9A2E' },
  { nota: 64, color: '#FFD23F' },
  { nota: 67, color: '#5BBF4A' },
  { nota: 69, color: '#3A7BD5' },
];
// HUECOS: cuántas notas tiene la canción.
export const HUECOS = 8;

// cancionDe(x): lee una canción guardada (índices de NOTAS); si falta o está rota, vacía. Como mucho, HUECOS notas.
export function cancionDe(x: unknown): number[] {
  if (!Array.isArray(x)) return [];
  return x.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < NOTAS.length).slice(0, HUECOS);
}
// ponerNota(cancion, n): la canción con la nota n añadida al final (si aún cabe).
export const ponerNota = (cancion: readonly number[], n: number): number[] =>
  cancion.length >= HUECOS ? [...cancion] : [...cancion, n];
// melodia(cancion): la canción como melodía para playTune ([nota MIDI, tiempos]); la última nota, más larga.
export const melodia = (cancion: readonly number[]): number[][] =>
  cancion.map((n, i) => [NOTAS[n]!.nota, i === cancion.length - 1 ? 2 : 1]);
