// tardias.d.ts: lo que un módulo usa de algo que se carga DESPUÉS que él: el código global (scenes.js) y, en
// juegos/comps2.ts, los fondos BG de temas/temas.ts (los temas usan los componentes, así que van detrás). Solo se usan
// al jugar o al dibujar, cuando ya está todo cargado, y el nombre suelto se encuentra en el ámbito global (BG llega por
// el puente). Cuando scenes.js sea módulo, sus líneas se cambian por un import.

/** Fondos de los temas (temas/temas.ts y temas4.ts): BG.aula(), BG.conceptos()... pintan el fondo entero. */
declare const BG: Record<string, () => void>;

/** true si (x, y) está dentro del rectángulo de centro (cx, cy) y tamaño w x h (scenes.js). */
declare function inR(x: number, y: number, cx: number, cy: number, w: number, h: number): boolean;

/** Dibuja la carita de la emoción m (clave de EMO) en (x, y) con radio r (scenes.js). */
declare function drawFace(x: number, y: number, r: number, m: string): void;

/** Dibuja un árbol en (x, y) con escala s y el aspecto de la estación season (scenes.js). */
declare function tree(x: number, y: number, s: number, season: string): void;

/** Las emociones de la asamblea (scenes.js): color c y nombre n (texto o par rioplatense/España). */
declare const EMO: Record<string, { c: string; n: string | readonly string[] }>;
