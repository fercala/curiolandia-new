// temas/indice.ts: los temas de 3, 4 y 5 años (antes temas.js, temas4.js y temas5.js; desde la fase 2f, módulos),
// los temas extra (extras.ts, antes extras.js; desde la fase 2h) y el Rincón del inglés (ingles.ts, antes ingles.js;
// desde la 2i). Se cargan en este orden porque temas4.ts usa lo de temas.ts y, al cargarse, añade fondos a BG;
// temas5.ts usa los dos. Al final, hacerJuego.ts (desde la fase 4f), con makeGame, que usa lo de todos (antes extras.ts y
// luego ingles.ts envolvían la de temas.ts). src/modulos.ts pasa todo lo que exportan al puente.
export * from './temas.ts';
export * from './temas4.ts';
export * from './temas5.ts';
export * from './extras.ts';
export * from './ingles.ts';
export * from './hacerJuego.ts';
