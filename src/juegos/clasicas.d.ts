// juegos/clasicas.d.ts: lo que los componentes usan del código global que se carga DESPUÉS de los módulos (scenes.js
// y temas.js). Los módulos van antes, pero estas cosas solo se usan al jugar, cuando ya está todo cargado, así que el
// nombre suelto se encuentra en el ámbito global. Cuando esos archivos sean módulos, esto se cambia por un import.

/** Fondos de los temas (temas.js): BG.aula(), BG.conceptos()... pintan el fondo entero. */
declare const BG: Record<string, () => void>;

/** true si (x, y) está dentro del rectángulo de centro (cx, cy) y tamaño w x h (scenes.js). */
declare function inR(x: number, y: number, cx: number, cy: number, w: number, h: number): boolean;

/** Dibuja la carita de la emoción m (clave de EMO) en (x, y) con radio r (scenes.js). */
declare function drawFace(x: number, y: number, r: number, m: string): void;
