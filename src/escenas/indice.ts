// escenas/indice.ts: las escenas que ya son módulos, en su orden: escenas2d.ts (antes scenes.js, fase 2j), zonas.ts
// (antes zonas.js, fase 2k), con el mapa, las zonas y la casita (desde la fase 4d solo aquí) y el paso de cumpleaños
// de la asamblea, y tienda.ts (antes tienda.js, fase 2l), que añade a S los campos de la tienda y las escenas tienda y
// casaTito, y repaso.ts (antes repaso.js, fase 2m), que añade a S los campos del repaso y la escena repaso (el botón de
// la lupa del mapa y lo que apunta cada acierto están desde la fase 4c en zonas.ts y en el núcleo). Las monedas en pantalla
// (fase 4a) están desde la fase 4b en el núcleo (nucleo/monedas.ts), y terminar un juego, en finishGame
// (escenas2d.ts) y su caso de uso aplicacion/terminarJuego.ts. Desde la fase L2 (docs/PLAN-LECTURA.md), isla.ts: la
// Isla de las Letras (SCENES.isla), desde la fase I2 (docs/PLAN-INGLES.md), islaIngles.ts: la Isla del Inglés
// (SCENES.islaIngles), desde la fase L7, libroLetras.ts: «Mi libro de letras» (SCENES.libroLetras), y desde la fase
// I7, diccionario.ts: «Mi diccionario de inglés» (SCENES.diccionario), que se abren desde el álbum. Desde la fase C3
// (docs/PLAN-CASA.md), las escenas pequeñas de la casa de Tito: casaCielo.ts (el telescopio) y casaMundo.ts (el globo
// terráqueo); desde la C4, casaMusica.ts (los instrumentos), casaPizarra.ts y casaTele.ts; desde la C5, casaCocina.ts (la merienda y la
// sopa), casaBano.ts, casaNoches.ts (buenas noches) y casaHuerto.ts; desde la C6, casaMascotas.ts (las
// mascotas que crecen); desde la C7, casaAlbum.ts (el álbum «Sorpresas de la casa»); desde la fase M1 de
// docs/PLAN-CASA-MEJORA.md, casa.ts (la casa por dentro) y desde la M2, casaBaul.ts (el baúl y los sitios que se
// iluminan). Desde la fase P1 de docs/IDEAS-MEJORA.md, cole.ts (el cole, SCENES.cole), patio.ts (su patio,
// SCENES.patio) y estatuas.ts (el juego «¡Estatuas!»); desde la P2, patioComun.ts (lo
// que comparten los juegos del patio) y titoDice.ts (el juego «Tito dice»); desde la P3, yoga.ts (el yoga de los animales
// y el rincón de la calma), y desde la P4, retos.ts (los retos para hacer en casa); desde la P5, excursion.ts (el
// autobús y el motor de excursiones) y granja.ts (las estaciones de la granja escuela), y desde la P6,
// granjaTalleres.ts (las demás estaciones: queso, cepillar, huerto y tractor), y desde la P7, granjaAnimales.ts (los
// animales recortables que pasean por la granja) y albumExcursiones.ts (el álbum de excursiones); desde la P8,
// granjaManzano.ts (el manzano de la granja, que crece por días), y desde la P9, granjaCrias.ts (las crías y familias);
// desde la P11, deporte.ts (el gran día del deporte) y deportePruebas.ts (sus pruebas en 2D); desde la P12,
// juegosCortos.ts (el menú de los juegos cortos del patio), rayuela.ts y columpios.ts (P12a), penaltis.ts y pompas.ts
// (P12b), cometa.ts y panuelo.ts (P12c) y sillas.ts (P12d).
// src/modulos.ts pasa todo lo que exportan al puente.
export * from './escenas2d.ts';
export * from './zonas.ts';
export * from './tienda.ts';
export * from './casa.ts';
export * from './casaBaul.ts';
export * from './cofre.ts';
export * from './repaso.ts';
export * from './isla.ts';
export * from './islaIngles.ts';
export * from './libroLetras.ts';
export * from './diccionario.ts';
export * from './casaCielo.ts';
export * from './casaMundo.ts';
export * from './casaMusica.ts';
export * from './casaPizarra.ts';
export * from './casaTele.ts';
export * from './casaCocina.ts';
export * from './casaBano.ts';
export * from './casaNoches.ts';
export * from './casaHuerto.ts';
export * from './casaMascotas.ts';
export * from './casaAlbum.ts';
export * from './cole.ts';
export * from './patio.ts';
export * from './patioComun.ts';
export * from './estatuas.ts';
export * from './titoDice.ts';
export * from './yoga.ts';
export * from './retos.ts';
export * from './excursion.ts';
export * from './granja.ts';
export * from './granjaAnimales.ts';
export * from './granjaManzano.ts';
export * from './granjaCrias.ts';
export * from './granjaTalleres.ts';
export * from './albumExcursiones.ts';
export * from './deporte.ts';
export * from './deportePruebas.ts';
export * from './juegosCortos.ts';
export * from './rayuela.ts';
export * from './columpios.ts';
export * from './penaltis.ts';
export * from './pompas.ts';
export * from './cometa.ts';
export * from './panuelo.ts';
export * from './sillas.ts';
