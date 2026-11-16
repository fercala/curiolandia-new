/*
 * escenas/bosque.ts: las paradas del paseo por el bosque de otoño (idea 6 de docs/IDEAS-MEJORA.md, fase P21), la
 * excursión del bosque. Se llega desde el plano de la excursión (escenas/excursion.ts: el sendero del bosque, con Hugo
 * el guardabosques) y, al terminar, se vuelve a él. Como los recintos del zoo, cada parada es un juego de los de siempre;
 * Hugo la presenta y al terminar cuenta un dato curioso (la escena común es escenaRecinto de escenas/zoo.ts):
 * - Las hojas de colores (SCENES.bosqueHojas): caen hojas, castañas y bellotas; hay que atrapar las hojas rojas y
 *   después las naranjas (Atrapa).
 * - Las huellas del conejo (SCENES.bosqueHuellas): seguir las huellas, una a una, hasta su madriguera (Huellas).
 * - Los sonidos del bosque (SCENES.bosqueSonidos): ¿quién hace este sonido? El búho, el lobo, el pájaro... (Sonido).
 * - La despensa de la ardilla (SCENES.bosqueArdilla): contar las bellotas, castañas, piñas y setas que guarda (Cuenta).
 * - El mural del otoño (SCENES.bosqueMural): pintar lo que hemos visto con sus colores (Pinta).
 * Exporta: RECINTOS_BOSQUE (cada parada, con la forma de RecintoZoo), CAMINO_HUELLAS y fondoMadriguera; pone
 * SCENES.bosqueHojas, SCENES.bosqueHuellas, SCENES.bosqueSonidos, SCENES.bosqueArdilla y SCENES.bosqueMural.
 * Importa: el núcleo (el lienzo y la edad), los componentes Atrapa, Huellas, Sonido, Cuenta y Pinta y los fondos BG de
 * juegos/, escenaRecinto y el tipo RecintoZoo de escenas/zoo.ts y el fondo del bosque, fondoBosque, de
 * escenas/excursion.ts (las huellas y los sonidos se juegan en él).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import { AGE, SCENES, ctx } from '../nucleo/indice.ts';
import { Atrapa, BG, Cuenta, Huellas, Pinta, Sonido } from '../juegos/indice.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';
import { fondoBosque } from './excursion.ts';

/** El camino de huellas del conejo hasta su madriguera: dos tramos (con 3 años, solo el primero), con los puntos ya en
 * la pantalla. */
export const CAMINO_HUELLAS: Array<Array<[number, number]>> = [
  [
    [300, 800],
    [460, 740],
    [620, 790],
    [780, 720],
  ],
  [
    [780, 720],
    [940, 660],
    [1100, 720],
    [1250, 650],
    [1350, 690],
  ],
];

// fondoMadriguera(): el bosque de otoño (fondoBosque) y, al final del camino de huellas, la madriguera del conejo (un
// montoncito de tierra con su agujero).
export function fondoMadriguera(): void {
  fondoBosque();
  ctx.save();
  ctx.fillStyle = '#A86B43';
  ctx.beginPath();
  ctx.ellipse(1460, 700, 120, 70, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#3B2A1E';
  ctx.beginPath();
  ctx.ellipse(1460, 700, 66, 44, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

// RECINTOS_BOSQUE: las cinco paradas, en el orden del plano.
export const RECINTOS_BOSQUE: readonly RecintoZoo[] = [
  {
    id: 'hojas',
    escena: 'bosqueHojas',
    animal: 'hojaRoja',
    intro: '¡Mira cómo caen las hojas! En otoño se ponen de muchos colores.',
    dato: '¿Sabes una cosa? En otoño, muchos árboles se quedan sin hojas para descansar durante el invierno.',
    juego: (onDone) =>
      Atrapa(
        {
          targets: [
            { ask: '¡Atrapa las hojas rojas!', is: (k: string) => k === 'hojaRoja' },
            { ask: '¡Ahora, las hojas naranjas!', is: (k: string) => k === 'hojaNaranja' },
          ],
          pool: ['hojaRoja', 'hojaNaranja', 'hojaMarron', 'hoja', 'castana', 'bellota'],
          bg: BG['otono'],
          key: 'bosque',
        },
        onDone,
      ),
  },
  {
    id: 'huellas',
    escena: 'bosqueHuellas',
    animal: 'conejo',
    intro: '¡Mira! Aquí hay huellas. Son de un conejo. ¿Adónde irá?',
    dato: '¿Sabes una cosa? Los conejos viven en madrigueras, unas casas con túneles debajo de la tierra.',
    juego: (onDone) =>
      Huellas(
        {
          trazos: CAMINO_HUELLAS.slice(0, AGE() <= 3 ? 1 : 2),
          paso: 90,
          who: 'conejo',
          c: '#A86B43',
          bg: fondoMadriguera,
          key: 'bosque',
          ask: 'Sigue las huellas del conejo. Toca las huellas una a una.',
          ok: '¡Hemos llegado a la madriguera del conejo!',
        },
        onDone,
      ),
  },
  {
    id: 'sonidos',
    escena: 'bosqueSonidos',
    animal: 'buho',
    intro: '¡Silencio! Si escuchamos bien, oiremos a los animales del bosque.',
    dato: '¿Sabes una cosa? El búho puede girar la cabeza casi del todo para mirar hacia atrás.',
    juego: (onDone) => Sonido({ items: ['buho', 'lobo', 'pajaro', 'rana', 'conejo'], bg: fondoBosque }, onDone),
  },
  {
    id: 'ardilla',
    escena: 'bosqueArdilla',
    animal: 'ardilla',
    intro: 'La ardilla guarda comida para el invierno. ¡Vamos a contar lo que tiene!',
    dato: '¿Sabes una cosa? La ardilla esconde bellotas en muchos sitios, ¡y a veces se le olvida dónde las ha puesto!',
    juego: (onDone) => Cuenta({ pool: ['bellota', 'castana', 'pina', 'seta'], bg: BG['otono'] }, onDone),
  },
  {
    id: 'mural',
    escena: 'bosqueMural',
    animal: 'hojaNaranja',
    intro: 'Para acabar, vamos a hacer un mural con todo lo que hemos visto en el bosque.',
    dato: '¿Sabes una cosa? Con las hojas secas del otoño se pueden hacer dibujos muy bonitos.',
    juego: (onDone) =>
      Pinta(
        {
          items: [
            ['hojaRoja', 'rojo'],
            ['hojaNaranja', 'naranja'],
            ['castana', 'marron'],
            ['seta', 'rojo'],
            ['ardilla', 'naranja'],
            ['bellota', 'marron'],
            ['pina', 'marron'],
            ['rana', 'verde'],
          ],
          bg: BG['otono'],
        },
        onDone,
      ),
  },
];

RECINTOS_BOSQUE.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'bosque', 'guardabosques');
});
