// tardias.d.ts: lo que un módulo usa de algo que se carga DESPUÉS que él: los fondos BG de temas/temas.ts (en
// juegos/comps2.ts: los temas usan los componentes, así que van detrás), lo de escenas/escenas2d.ts (antes scenes.js),
// que usa los temas y por eso va detrás de ellos, lo de escenas/tienda.ts, que va detrás de escenas/zonas.ts, los diálogos
// de aplicacion/adultos.ts y R3frame de mundo3d/mundo3d.ts. Solo se usan al jugar o al dibujar, cuando ya está
// todo cargado, y el nombre suelto se encuentra en el ámbito global (lo de los módulos llega por el puente). Importarlos
// crearía un ciclo de imports: un módulo que va antes no puede importar de uno que va después.

/** Fondos de los temas (temas/temas.ts y temas4.ts): BG.aula(), BG.conceptos()... pintan el fondo entero. */
declare const BG: Record<string, () => void>;

/** Dibuja la carita de la emoción m (clave de EMO) en (x, y) con radio r (escenas/escenas2d.ts). */
declare function drawFace(x: number, y: number, r: number, m: string): void;

/** Dibuja un árbol en (x, y) con escala s y el aspecto de la estación season (escenas/escenas2d.ts). */
declare function tree(x: number, y: number, s: number, season: string): void;

/** Las emociones de la asamblea (escenas/escenas2d.ts): color c y nombre n (texto o par rioplatense/España). */
declare const EMO: Record<string, { c: string; n: string | readonly string[] }>;

// De aplicacion/adultos.ts (antes adult.js, el último módulo), con el tipo que tienen allí: los diálogos del nombre y
// de empezar de nuevo.
declare const openNameDlg: typeof import('./aplicacion/adultos.ts').openNameDlg;
declare const openResetDlg: typeof import('./aplicacion/adultos.ts').openResetDlg;

// De escenas/tienda.ts (después de escenas/zonas.ts): artículos de la tienda y casa de Tito (las monedas, desde la fase
// 4a tienen su módulo, desde la 4b nucleo/monedas.ts, y STARS e inR están en el núcleo),
// con el tipo que tienen allí (ver sus comentarios).
declare const SHELLC: typeof import('./escenas/tienda.ts').SHELLC;
declare const SHOP: typeof import('./escenas/tienda.ts').SHOP;
declare const itemName: typeof import('./escenas/tienda.ts').itemName;
declare const wear: typeof import('./escenas/tienda.ts').wear;
declare const drawItemPic: typeof import('./escenas/tienda.ts').drawItemPic;
declare const placeHome: typeof import('./escenas/tienda.ts').placeHome;

// De mundo3d/mundo3d.ts (el último módulo).
/** Dibuja el mundo 3D de la escena en el lienzo #gl; null si no hay WebGL. Lo llama frame() (aplicacion/adultos.ts). */
declare const R3frame: typeof import('./mundo3d/mundo3d.ts').R3frame;
