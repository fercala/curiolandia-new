// tardias.d.ts: lo que un módulo usa de algo que se carga DESPUÉS que él: los fondos BG de temas/temas.ts (en
// juegos/comps2.ts: los temas usan los componentes, así que van detrás), lo de escenas/escenas2d.ts (antes scenes.js),
// que usa los temas y por eso va detrás de ellos, y los diálogos de adult.js (código global). Solo se usan al jugar o
// al dibujar, cuando ya está todo cargado, y el nombre suelto se encuentra en el ámbito global (lo de los módulos llega
// por el puente). Importarlos crearía un ciclo de imports: un módulo que va antes no puede importar de uno que va después.

/** Fondos de los temas (temas/temas.ts y temas4.ts): BG.aula(), BG.conceptos()... pintan el fondo entero. */
declare const BG: Record<string, () => void>;

/** true si (x, y) está dentro del rectángulo de centro (cx, cy) y tamaño w x h (escenas/escenas2d.ts). */
declare function inR(x: number, y: number, cx: number, cy: number, w: number, h: number): boolean;

/** Dibuja la carita de la emoción m (clave de EMO) en (x, y) con radio r (escenas/escenas2d.ts). */
declare function drawFace(x: number, y: number, r: number, m: string): void;

/** Dibuja un árbol en (x, y) con escala s y el aspecto de la estación season (escenas/escenas2d.ts). */
declare function tree(x: number, y: number, s: number, season: string): void;

/** Las emociones de la asamblea (escenas/escenas2d.ts): color c y nombre n (texto o par rioplatense/España). */
declare const EMO: Record<string, { c: string; n: string | readonly string[] }>;

/** Abre el diálogo del nombre del niño; after(nombre) se llama al cerrarlo (adult.js). */
declare function openNameDlg(after?: (nombre?: string) => void): void;

/** Abre el diálogo de empezar de nuevo (adult.js). */
declare function openResetDlg(): void;
