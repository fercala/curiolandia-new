// juegos/indice.ts: los componentes de juego (antes comps.js y comps2.js, desde la fase 2e módulos). Se cargan en este
// orden porque comps2.ts usa lo de comps.ts (hasta la fase 4f, además, ampliaba thing con ponThing para las caritas «emo:»).
// Desde la fase L3 de docs/PLAN-LECTURA.md, lectura.ts: los componentes de la Isla de las Letras (Palmas, Pizarra y
// MiNombre), que usan comps.ts.
// src/modulos.ts pasa todo lo que exportan al puente.
export * from './caras.ts';
export * from './fondos.ts';
export * from './comps.ts';
export * from './comps2.ts';
export * from './lectura.ts';
