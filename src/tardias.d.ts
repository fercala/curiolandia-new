// tardias.d.ts: lo que un módulo usa de algo que se carga DESPUÉS que él: los fondos BG de temas/temas.ts (en
// juegos/comps2.ts: los temas usan los componentes, así que van detrás), lo de escenas/escenas2d.ts (antes scenes.js),
// que usa los temas y por eso va detrás de ellos, y lo de tienda.js y los diálogos de adult.js (código global). Solo se usan al jugar o
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

// De tienda.js (código global que va después de escenas/zonas.ts): monedas, artículos de la tienda y casa de Tito.
/** Suma n monedas a S sin animación (se ven luego en el contador). */
declare function creditCoins(n: number): void;
/** Estrellas ganadas: juegos distintos terminados en todos los temas. */
declare function STARS(): number;
/** Dibuja el contador de monedas de arriba. */
declare function drawCoinHUD(): void;
/** true si (x, y) está sobre el contador de monedas. */
declare function inCoinHUD(x: number, y: number): boolean;
/** Da n monedas con animación desde (x, y); ya = true si ya se habían sumado con creditCoins. */
declare function giveCoins(n: number, x?: number, y?: number, icon?: string, ya?: boolean): void;
/** Colores [relleno, borde] de cada caparazón de Tito. */
declare const SHELLC: Record<string, string[]>;
/** Los artículos de la tienda. */
declare const SHOP: import('./nucleo/tipos.ts').Libre[];
/** Nombre de un artículo para la voz. */
declare function itemName(it: import('./nucleo/tipos.ts').Libre): string;
/** Pone (on) o quita un artículo de ropa a Tito. */
declare function wear(it: import('./nucleo/tipos.ts').Libre, on?: boolean): void;
/** Dibuja el artículo it en (x, y) con tamaño s. */
declare function drawItemPic(it: import('./nucleo/tipos.ts').Libre, x: number, y: number, s: number): void;
/** Coloca en la casa de Tito el artículo con ese id. */
declare function placeHome(id: string): void;
