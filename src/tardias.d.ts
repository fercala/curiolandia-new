// tardias.d.ts: lo que un módulo usa de algo que se carga DESPUÉS que él: lo de escenas/tienda.ts, que va detrás de
// escenas/zonas.ts. Solo se usan al jugar o al dibujar, cuando ya está
// todo cargado, y el nombre suelto se encuentra en el ámbito global (lo de los módulos llega por el puente). Importarlos
// crearía un ciclo de imports: un módulo que va antes no puede importar de uno que va después.
// Desde la fase 4o, BG (juegos/fondos.ts), EMO y drawFace (juegos/caras.ts) y tree (nucleo/dibujo.ts) ya no están
// aquí: se cargan antes de quien las usa y se importan. Desde la 4p, tampoco los diálogos del nombre y de empezar de
// nuevo (aplicacion/dialogos.ts) ni R3frame (mundo3d/mundo3d.ts, que ahora se carga antes que aplicacion/adultos.ts).

// De escenas/tienda.ts (después de escenas/zonas.ts): artículos de la tienda y casa de Tito (las monedas, desde la fase
// 4a tienen su módulo, desde la 4b nucleo/monedas.ts, y STARS e inR están en el núcleo),
// con el tipo que tienen allí (ver sus comentarios).
declare const SHELLC: typeof import('./escenas/tienda.ts').SHELLC;
declare const SHOP: typeof import('./escenas/tienda.ts').SHOP;
declare const itemName: typeof import('./escenas/tienda.ts').itemName;
declare const wear: typeof import('./escenas/tienda.ts').wear;
declare const drawItemPic: typeof import('./escenas/tienda.ts').drawItemPic;
declare const placeHome: typeof import('./escenas/tienda.ts').placeHome;

