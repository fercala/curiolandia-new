/*
 * contenido/aventura.ts: los capítulos de la gran aventura de Tito (idea 26 de docs/IDEAS-MEJORA.md, fase P16), la
 * primera temporada: «El mapa del tesoro perdido». Solo datos. Cada capítulo tiene un cuento corto (sus páginas, con el
 * mismo formato que los cuentos de contenido/cuentos.ts: fondo, dibujos y lo que lee Tito; sin preguntas), un reto (uno
 * de los juegos de siempre, con lo que necesita: ver RetoAventura) y la frase de Tito al ganar su trozo del mapa. Los
 * juega la escena SCENES.aventuraCap (escenas/aventura.ts); las reglas (en qué orden, uno al día) están en
 * dominio/aventura.ts.
 * Desde la P16a: los capítulos 1 a 3 (la playa, el bosque y la Isla del Inglés); desde la P16b, los 4 a 6 (los dibujos
 * de Lupi, la montaña nevada y el tesoro escondido), con los que la temporada está completa.
 * Exporta: los tipos RetoAventura y Capitulo, TITULO_AVENTURA y CAPITULOS.
 * Importa: el tipo PaginaCuento de contenido/tipos.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los dibujos de cada página llevan su posición y su tamaño en la
   pantalla de 1600x900, como en contenido/cuentos.ts. */
import type { PaginaCuento } from './tipos.ts';

/** El reto de un capítulo: contar (Cuenta, con los dibujos que se cuentan), las parejas (Memoria, con sus dibujos),
 * escuchar en inglés (EnEscucha, con un grupo de palabras de temas/ingles.ts) o, desde la P16b, el puzle (Puzzle, con
 * los dibujos que se montan), las series de formas (Series, con las formas de temas/temas4.ts: 'circulo',
 * 'triangulo'...) o excavar (Excava, con los dibujos que hay enterrados). bg: el fondo (un nombre de BG). */
export type RetoAventura =
  | { readonly t: 'cuenta'; readonly pool: readonly string[]; readonly bg: string }
  | { readonly t: 'memoria'; readonly pool: readonly string[]; readonly bg: string }
  | { readonly t: 'ingles'; readonly grupo: string; readonly bg: string }
  | { readonly t: 'puzle'; readonly pool: readonly string[]; readonly bg: string }
  | { readonly t: 'formas'; readonly pool: readonly string[]; readonly bg: string }
  | { readonly t: 'excava'; readonly pool: readonly string[]; readonly bg: string };

/** Un capítulo: su id, su título, el dibujo de su medalla, las páginas de su cuento, su reto y lo que dice Tito al
 * ganar el trozo del mapa (frase entera). */
export interface Capitulo {
  readonly id: string;
  readonly titulo: string;
  readonly dibujo: string;
  readonly paginas: readonly PaginaCuento[];
  readonly reto: RetoAventura;
  readonly pieza: string;
}

// TITULO_AVENTURA: el título de la temporada.
export const TITULO_AVENTURA = 'El mapa del tesoro perdido';

// CAPITULOS: los capítulos de la temporada, en orden (dominio/aventura.ts dice que son AVENTURA.capitulos; los que
// faltan salen como «¡Muy pronto!»).
export const CAPITULOS: readonly Capitulo[] = [
  {
    id: 'botella',
    titulo: 'La botella del mar',
    dibujo: 'concha',
    paginas: [
      {
        bg: 'playa',
        items: [
          ['botellaVidrio', 1000, 600, 170],
          ['concha', 760, 690, 90],
        ],
        say: 'Una mañana, Tito paseaba por la playa. ¡Y las olas le trajeron una botella!',
      },
      {
        bg: 'playa',
        items: [
          ['botellaVidrio', 720, 600, 150],
          ['mapa', 1040, 540, 260],
        ],
        say: 'Dentro había un trozo de papel. ¡Era un mapa del tesoro! Pero estaba roto en seis trozos.',
      },
      {
        bg: 'playa',
        items: [
          ['concha', 760, 620, 120],
          ['estrellaMar', 960, 650, 120],
          ['pez', 1160, 600, 120],
        ],
        say: 'Una nota decía: «Cuenta las cosas del mar y el primer trozo será tuyo». ¡Vamos a contar!',
      },
    ],
    reto: { t: 'cuenta', pool: ['concha', 'estrellaMar', 'pez'], bg: 'playa' },
    pieza: '¡El primer trozo del mapa! ¡Qué emoción!',
  },
  {
    id: 'bosque',
    titulo: 'Las parejas del bosque',
    dibujo: 'ardilla',
    paginas: [
      {
        bg: 'bosque',
        items: [
          ['mapa', 760, 560, 200],
          ['ardilla', 1080, 600, 190],
        ],
        say: 'El trozo del mapa llevó a Tito hasta el bosque. Allí lo esperaba la ardilla.',
      },
      {
        bg: 'bosque',
        items: [
          ['ardilla', 760, 600, 170],
          ['buho', 980, 540, 150],
          ['erizo', 1180, 640, 150],
        ],
        say: '¡Tengo el segundo trozo! Pero se me han mezclado las cartas de mis amigos del bosque.',
      },
      {
        bg: 'bosque',
        items: [
          ['seta', 820, 640, 120],
          ['bellota', 1000, 620, 110],
          ['hojaNaranja', 1180, 600, 120],
        ],
        say: 'Ayuda a la ardilla a juntar las parejas. ¡Hay que acordarse de dónde está cada carta!',
      },
    ],
    reto: {
      t: 'memoria',
      pool: ['ardilla', 'buho', 'erizo', 'seta', 'bellota', 'hojaNaranja', 'oso', 'lobo'],
      bg: 'bosque',
    },
    pieza: '¡El segundo trozo del mapa! Gracias, ardilla.',
  },
  {
    id: 'polly',
    titulo: 'Polly y los animales',
    dibujo: 'polly',
    paginas: [
      {
        bg: 'selva',
        items: [
          ['globoAire', 900, 420, 260],
          ['mapa', 1180, 640, 150],
        ],
        say: 'Con dos trozos, el mapa señalaba una isla lejana. ¡Tito voló hasta allí en globo!',
      },
      {
        bg: 'selva',
        items: [['polly', 1000, 560, 260]],
        say: 'Era la isla de Polly, la lorita. ¡Hello, Tito! Yo guardo el tercer trozo.',
      },
      {
        bg: 'selva',
        items: [
          ['polly', 760, 560, 200],
          ['leon', 1060, 600, 150],
          ['elefante', 1260, 610, 150],
        ],
        say: 'Polly dirá animales en inglés. Escucha bien y toca el animal que dice.',
      },
    ],
    reto: { t: 'ingles', grupo: 'animals', bg: 'selva' },
    pieza: '¡El tercer trozo del mapa! Thank you, Polly.',
  },
  {
    id: 'lupi',
    titulo: 'Los dibujos de Lupi',
    dibujo: 'lupi',
    paginas: [
      {
        bg: 'parque',
        items: [
          ['mapa', 760, 600, 180],
          ['lupi', 1060, 600, 200],
        ],
        say: 'Con tres trozos, el mapa llevaba al parque. Allí estaba Lupi, muy triste.',
      },
      {
        bg: 'parque',
        items: [
          ['lupi', 820, 600, 180],
          ['oso', 1120, 620, 170],
        ],
        say: 'Lupi dijo: «¡El viento ha roto mis dibujos en pedazos!»',
      },
      {
        bg: 'parque',
        items: [['lupi', 1000, 600, 200]],
        say: 'Ayuda a Lupi a juntar las piezas de sus dibujos. ¡El cuarto trozo es para quien lo consiga!',
      },
    ],
    reto: { t: 'puzle', pool: ['lupi', 'oso'], bg: 'parque' },
    pieza: '¡El cuarto trozo del mapa! Gracias, Lupi.',
  },
  {
    id: 'montana',
    titulo: 'La montaña nevada',
    dibujo: 'pino',
    paginas: [
      {
        bg: 'invierno',
        items: [
          ['mochila', 820, 640, 150],
          ['pino', 1100, 560, 260],
        ],
        say: 'Con su mochila, Tito subió a la montaña nevada. ¡Qué frío hacía!',
      },
      {
        bg: 'invierno',
        items: [
          ['muneco', 900, 600, 220],
          ['piedra', 1160, 660, 150],
        ],
        say: 'Arriba, un muñeco de nieve guardaba una puerta de piedra con formas dibujadas.',
      },
      {
        bg: 'invierno',
        items: [['piedra', 1000, 620, 220]],
        say: 'Para abrir la puerta hay que seguir las series de formas. ¿Qué forma va después?',
      },
    ],
    reto: { t: 'formas', pool: ['circulo', 'cuadrado', 'triangulo', 'rectangulo', 'ovalo', 'rombo'], bg: 'invierno' },
    pieza: '¡El quinto trozo del mapa! La puerta se ha abierto.',
  },
  {
    id: 'tesoro',
    titulo: 'El tesoro escondido',
    dibujo: 'cofre',
    paginas: [
      {
        bg: 'playa',
        items: [
          ['barco', 1000, 560, 260],
          ['mapa', 760, 660, 150],
        ],
        say: 'Con cinco trozos, Tito navegó en barco hasta la isla de la cruz roja.',
      },
      {
        bg: 'playa',
        items: [
          ['mapa', 820, 640, 160],
          ['pala', 1080, 640, 170],
        ],
        say: 'Allí estaba la cruz del mapa. ¡El tesoro tenía que estar enterrado debajo!',
      },
      {
        bg: 'playa',
        items: [
          ['pala', 820, 640, 150],
          ['moneda', 1020, 660, 100],
          ['corona', 1200, 640, 120],
        ],
        say: 'Cava en la arena y encuentra todo lo que hay escondido. ¡Seguro que el último trozo está ahí!',
      },
    ],
    reto: { t: 'excava', pool: ['moneda', 'corona', 'cofre', 'estrella', 'concha', 'piedra'], bg: 'playa' },
    pieza: '¡El último trozo del mapa! ¡Ya está completo!',
  },
];
