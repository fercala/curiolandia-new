// escenas/indice.ts: las escenas que ya son módulos, en su orden: escenas2d.ts (antes scenes.js, fase 2j) y zonas.ts
// (antes escenas/zonas.ts, fase 2k), que cambia parte de las de escenas2d.ts al cargarse (SCENES.map, SCENES.casita, la
// asamblea, suggestTema y stationPos). src/modulos.ts pasa todo lo que exportan al puente, para el código global.
export * from './escenas2d.ts';
export * from './zonas.ts';
