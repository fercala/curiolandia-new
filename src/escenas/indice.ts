// escenas/indice.ts: las escenas que ya son módulos, en su orden: escenas2d.ts (antes scenes.js, fase 2j), zonas.ts
// (antes zonas.js, fase 2k), que cambia parte de las de escenas2d.ts al cargarse (SCENES.map, SCENES.casita, la
// asamblea, suggestTema y stationPos), y tienda.ts (antes tienda.js, fase 2l), que añade a S los campos de la tienda,
// las escenas tienda y casaTito y envuelve onRight, finishGame y SCENES.juego para dar monedas. src/modulos.ts pasa todo
// lo que exportan al puente, para el código global.
export * from './escenas2d.ts';
export * from './zonas.ts';
export * from './tienda.ts';
