// escenas/indice.ts: las escenas que ya son módulos, en su orden: escenas2d.ts (antes scenes.js, fase 2j), zonas.ts
// (antes zonas.js, fase 2k), que cambia parte de las de escenas2d.ts al cargarse (SCENES.map, SCENES.casita, la
// asamblea, suggestTema y stationPos), y tienda.ts (antes tienda.js, fase 2l), que añade a S los campos de la tienda y
// las escenas tienda y casaTito, y repaso.ts (antes repaso.js, fase 2m), que añade a S los campos del repaso, la
// escena repaso y el botón de la lupa del mapa, y envuelve rec, go, goSeguir y la casita. Las monedas en pantalla
// (fase 4a) están desde la fase 4b en el núcleo (nucleo/monedas.ts), y terminar un juego, en finishGame
// (escenas2d.ts) y su caso de uso aplicacion/terminarJuego.ts. src/modulos.ts pasa todo lo que exportan al puente.
export * from './escenas2d.ts';
export * from './zonas.ts';
export * from './tienda.ts';
export * from './repaso.ts';
