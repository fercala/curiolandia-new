// juegos/indice.ts: los componentes de juego (antes comps.js y comps2.js, desde la fase 2e módulos). Se cargan en este
// orden porque comps2.ts usa lo de comps.ts y, al cargarse, amplía thing (con ponThing) para las caritas «emo:».
// src/modulos.ts pasa todo lo que exportan al puente, para los temas y escenas que aún son código global.
export * from './comps.ts';
export * from './comps2.ts';
