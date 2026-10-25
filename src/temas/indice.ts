// temas/indice.ts: los temas de 3, 4 y 5 años (antes temas.js, temas4.js y temas5.js; desde la fase 2f, módulos). Se
// cargan en este orden porque temas4.ts usa lo de temas.ts y, al cargarse, añade fondos a BG; temas5.ts usa los dos.
// src/modulos.ts pasa todo lo que exportan al puente, para los cuentos, escenas y zonas, que aún son código global.
export * from './temas.ts';
export * from './temas4.ts';
export * from './temas5.ts';
