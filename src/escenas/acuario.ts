/*
 * escenas/acuario.ts: las salas del acuario (idea 3 de docs/IDEAS-MEJORA.md, fase P18), las estaciones de la excursión
 * del acuario. Se llega desde el plano de la excursión (escenas/excursion.ts: el túnel debajo del agua, con Marina la
 * buceadora) y, al terminar, se vuelve a él. Como los recintos del zoo, cada sala es un juego de los de siempre; Marina la
 * presenta y al terminar cuenta un dato curioso (la escena común es escenaRecinto de escenas/zoo.ts):
 * - Las burbujas (SCENES.acuarioBurbujas): suben burbujas con animales del mar; hay que atrapar los peces y después los
 *   cangrejos (Atrapa).
 * - Las estrellas de mar (SCENES.acuarioEstrellas): contar estrellas de mar, conchas, cangrejos y peces (Cuenta).
 * - La piscina de los delfines (SCENES.acuarioDelfines): los delfines saltan en fila; ¿quién va después? (Series).
 * - La sala de los tamaños (SCENES.acuarioTamanos): ordenar del más pequeño al más grande (Arrastra con los huecos de
 *   sizeSlot).
 * - La cueva de la ballena (SCENES.acuarioBallena): la ballena canta (cantaBallena) y hay que encontrar las parejas de
 *   sus amigos (Memoria).
 * Exporta: RECINTOS_ACUARIO (cada sala, con la forma de RecintoZoo) y cantaBallena; pone SCENES.acuarioBurbujas,
 * SCENES.acuarioEstrellas, SCENES.acuarioDelfines, SCENES.acuarioTamanos y SCENES.acuarioBallena.
 * Importa: el núcleo (sonido y voz), los componentes Atrapa, Cuenta, Series, Arrastra y Memoria y los fondos BG de
 * juegos/, sizeSlot de temas/temas.ts y escenaRecinto y el tipo RecintoZoo de escenas/zoo.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- notas, tiempos y posiciones en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { SCENES, later, tone } from '../nucleo/indice.ts';
import { Arrastra, Atrapa, BG, Cuenta, Memoria, Series } from '../juegos/indice.ts';
import { sizeSlot } from '../temas/temas.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';

// SERIES_TAMANOS: los animales de cada ronda de la sala de los tamaños, del más pequeño al más grande.
const SERIES_TAMANOS = [
  ['pez', 'delfin', 'ballena'],
  ['cangrejo', 'pulpo', 'delfin'],
];

// cantaBallena(): la canción de la ballena: cinco notas graves y largas que suben y bajan, como un canto en el mar.
export function cantaBallena(): void {
  [110, 147, 131, 98, 123].forEach((f, i) => later(i * 650, () => tone(f, 0.9, 'sine', 0.2)));
}

// RECINTOS_ACUARIO: las cinco salas, en el orden del plano.
export const RECINTOS_ACUARIO: readonly RecintoZoo[] = [
  {
    id: 'burbujas',
    escena: 'acuarioBurbujas',
    animal: 'pez',
    intro: '¡Mira cuántas burbujas! Dentro hay animales del mar.',
    dato: '¿Sabes una cosa? Los peces respiran debajo del agua con las branquias.',
    juego: (onDone) =>
      Atrapa(
        {
          targets: [
            { ask: '¡Atrapa los peces!', is: (k: string) => k === 'pez' },
            { ask: '¡Ahora, los cangrejos!', is: (k: string) => k === 'cangrejo' },
          ],
          pool: ['pez', 'cangrejo', 'pulpo', 'estrellaMar', 'concha'],
          bg: BG['mar'],
          key: 'acuario',
        },
        onDone,
      ),
  },
  {
    id: 'estrellas',
    escena: 'acuarioEstrellas',
    animal: 'estrellaMar',
    intro: 'En el fondo del acuario hay estrellas de mar escondidas. ¡Vamos a contarlas!',
    dato: '¿Sabes una cosa? Las estrellas de mar tienen cinco brazos, ¡y si pierden uno les vuelve a crecer!',
    juego: (onDone) => Cuenta({ pool: ['estrellaMar', 'concha', 'cangrejo', 'pez'], bg: BG['playa'] }, onDone),
  },
  {
    id: 'delfines',
    escena: 'acuarioDelfines',
    animal: 'delfin',
    intro: '¡Los delfines saltan en fila! Fíjate bien en el orden.',
    dato: '¿Sabes una cosa? Los delfines hablan entre ellos con silbidos y chasquidos.',
    juego: (onDone) => Series({ pool: ['delfin', 'pez', 'pulpo', 'cangrejo'], bg: BG['mar'] }, onDone),
  },
  {
    id: 'tamanos',
    escena: 'acuarioTamanos',
    animal: 'ballena',
    intro: 'En esta sala hay animales pequeños y grandes. ¿Los ordenamos?',
    dato: '¿Sabes una cosa? La ballena azul es el animal más grande del mundo. ¡Es más larga que un autobús!',
    juego: (onDone) =>
      Arrastra(
        {
          rounds: 2,
          key: 'tamanos',
          bg: BG['mar'],
          why: () => 'Mmm, ese lugar es de otro tamaño. Mira bien los cuadros.',
          gen(i: number) {
            const set = SERIES_TAMANOS[i % SERIES_TAMANOS.length]!;
            return {
              ask: 'Ordena de más pequeñito a más grande. El más pequeñito va primero.',
              zones: [sizeSlot('s0', 560, 190), sizeSlot('s1', 900, 260), sizeSlot('s2', 1300, 330)],
              items: set.map((k, j) => ({ k, zone: 's' + j, s: 170 })),
              tray: { x0: 460, x1: 1400, y: 790 },
              okAll: '¡Muy bien! Del más pequeñito al más grande.',
            };
          },
        },
        onDone,
      ),
  },
  {
    id: 'ballena',
    escena: 'acuarioBallena',
    animal: 'ballena',
    intro: '¡Escucha! La ballena está cantando. Sus amigos se han escondido de dos en dos. ¡Busca las parejas!',
    dato: '¿Sabes una cosa? Las ballenas cantan canciones muy largas que se oyen desde muy lejos.',
    alEmpezar: cantaBallena,
    juego: (onDone) =>
      Memoria(
        { pool: ['ballena', 'delfin', 'pulpo', 'cangrejo', 'estrellaMar', 'pez', 'concha', 'tortuga'], bg: BG['mar'] },
        onDone,
      ),
  },
];

RECINTOS_ACUARIO.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'acuario', 'buceadora');
});
