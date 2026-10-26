// indice.ts: todo el núcleo (lo que antes era core.js) en el orden en que se evalúa, que es el de las secciones del
// core.js de antes salvo escenas, que va antes que voz (say necesita sceneTok). src/modulos.ts lo deja entero en
// globalThis (el «puente», para las pruebas y src/tardias.d.ts): cada nombre exportado aquí es una global de solo lectura.
export * from './pantalla.ts';
export * from './utilidades.ts';
export * from './guardado.ts';
export * from './idioma.ts';
export * from './imagenes.ts';
export * from './dibujo.ts';
export * from './puntero.ts';
export * from './tito.ts';
export * from './sonido.ts';
export * from './escenas.ts';
export * from './voz.ts';
export * from './interfaz.ts';
