/*
 * escenas/playa.ts: las paradas del día de playa (idea 9 de docs/IDEAS-MEJORA.md, fase P24), la novena excursión. Se
 * llega desde el plano de la excursión (escenas/excursion.ts: la playa, con Leo el socorrista) y, al terminar, se vuelve
 * a él. Como los recintos del zoo, cada parada es un juego de los de siempre; Leo la presenta y al terminar cuenta un dato
 * curioso (la escena común es escenaRecinto de escenas/zoo.ts):
 * - Ponerse la crema (SCENES.playaCrema): extender la crema por los brazos, las piernas y la cara del niño (Frota).
 * - El castillo de arena (SCENES.playaCastillo): ordenar cómo se hace: la pala, el cubo lleno y el castillo (Secuencia).
 * - Buscar conchas (SCENES.playaConchas): frotar la arena para encontrar las conchas y lo que hay escondido (Excava).
 * - La playa limpia (SCENES.playaBasura): meter la basura en la papelera; las conchas y las estrellas de mar se quedan
 *   en la arena (Arrastra, con las que no son basura como 'no').
 * - Mirar el mar (SCENES.playaMar): contar los barcos, las lanchas y los peces que se ven desde la orilla (Cuenta).
 * Exporta: RECINTOS_PLAYA (cada parada, con la forma de RecintoZoo), BASURA_PLAYA, papelera, gotaCrema y fondoMar; pone
 * SCENES.playaCrema, SCENES.playaCastillo, SCENES.playaConchas, SCENES.playaBasura y SCENES.playaMar.
 * Importa: el núcleo (dibujo, el reloj T, azar y la edad), los componentes Frota, Secuencia, Excava, Arrastra y Cuenta y los fondos
 * BG de juegos/, el contorno K de los dibujos, escenaRecinto y el tipo RecintoZoo de escenas/zoo.ts y el fondo de la
 * playa, fondoPlaya, de escenas/excursion.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y colores en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { AGE, H, SCENES, T, W, card, ctx, pic, shuffle } from '../nucleo/indice.ts';
import type { Libre } from '../juegos/tipos.ts';
import { Arrastra, BG, Cuenta, Excava, Frota, Secuencia } from '../juegos/indice.ts';
import { K } from '../dibujos/todos.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';
import { fondoPlaya } from './excursion.ts';

/** La basura que se recoge en la playa (va a la papelera) y lo que es de la playa y se queda en la arena. */
export const BASURA_PLAYA = {
  basura: ['lata', 'botellaPlastico', 'brik', 'restoManzana', 'cascara'],
  seQueda: ['concha', 'estrellaMar'],
} as const;

// gotaCrema(s): un pegote de crema sin extender, la mancha de Frota que desaparece al frotar (s.r, su radio).
export function gotaCrema(s: Libre): void {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#B8C4CF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, s.r, s.r * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EAF6FF';
  ctx.beginPath();
  ctx.ellipse(-s.r * 0.25, -s.r * 0.2, s.r * 0.35, s.r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// papelera(z, hl): la papelera verde de la playa (la zona de Arrastra), con su bolsa y el dibujo de una lata en la
// tapa; brilla si se lleva algo encima (hl).
export function papelera(z: Libre, hl: boolean): void {
  const { x, y } = z;
  ctx.save();
  if (hl) {
    ctx.shadowColor = '#FFC93C';
    ctx.shadowBlur = 40;
  }
  ctx.fillStyle = '#5FA84E';
  ctx.strokeStyle = K;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x - 110, y - 100);
  ctx.lineTo(x + 110, y - 100);
  ctx.lineTo(x + 90, y + 130);
  ctx.lineTo(x - 90, y + 130);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  card(x - 126, y - 130, 252, 40, '#3F8A3A', 6, 14);
  card(x - 56, y - 50, 112, 112, '#FFFFFF', 5, 22);
  pic('lata', x, y + 6, 90);
}

// fondoMar(): el mar visto desde la orilla, para contar lo que hay en él: el cielo, mucho mar con olas que se mueven
// (con T) y una franja de arena abajo.
export function fondoMar(): void {
  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, '#9ED9F5');
  g.addColorStop(1, '#E9F7FC');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 160);
  ctx.fillStyle = '#5BB8E6';
  ctx.fillRect(0, 160, W, 560);
  ctx.save();
  ctx.strokeStyle = '#B9E9F8';
  ctx.lineWidth = 6;
  [220, 330, 440, 550, 660].forEach((y, j) =>
    Array.from({ length: 9 }, (_, i) => i).forEach((i) => {
      const x = ((i * 200 + j * 70 + T * 25) % 1800) - 100;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 30, y - 16, x + 60, y);
      ctx.stroke();
    }),
  );
  ctx.restore();
  ctx.fillStyle = '#FFE6A8';
  ctx.fillRect(0, 720, W, H - 720);
}

// RECINTOS_PLAYA: las cinco paradas, en el orden del plano.
export const RECINTOS_PLAYA: readonly RecintoZoo[] = [
  {
    id: 'crema',
    escena: 'playaCrema',
    animal: 'crema',
    intro: '¡Qué sol hace! Antes de jugar, hay que ponerse crema para no quemarse.',
    dato: '¿Sabes una cosa? En la playa también hay que beber mucha agua y ponerse la gorra.',
    juego: (onDone) =>
      Frota(
        {
          spots: [
            [800, 410, 36],
            [665, 560, 36],
            [935, 560, 36],
            [750, 700, 34],
            [850, 700, 34],
          ].slice(0, AGE() <= 3 ? 3 : 5),
          bg: BG['playa'],
          base: () => pic('nene', 800, 480, 620),
          spot: gotaCrema,
          tool: () => pic('crema', 0, 0, 120),
          key: 'playa',
          intro: 'Extiende la crema: frota cada pegote blanco hasta que no se vea.',
          okAll: '¡Ya tenemos la crema puesta! Ahora, a jugar.',
        },
        onDone,
      ),
  },
  {
    id: 'castillo',
    escena: 'playaCastillo',
    animal: 'castillo',
    intro: '¡Vamos a hacer un castillo de arena! ¿Te acuerdas de cómo se hace?',
    dato: '¿Sabes una cosa? La arena mojada se pega mejor: por eso los castillos se hacen cerca del agua.',
    juego: (onDone) =>
      Secuencia(
        {
          bg: BG['playa'],
          key: 'playa',
          panels: ['pala', 'cubo', 'castillo'],
          ask: 'Ordena el castillo: primero cavamos con la pala, después llenamos el cubo de arena y al final le damos la vuelta.',
          okAll: '¡Qué castillo tan bonito!',
        },
        onDone,
      ),
  },
  {
    id: 'conchas',
    escena: 'playaConchas',
    animal: 'concha',
    intro: 'En la orilla, el mar deja muchas conchas. ¡Vamos a buscarlas!',
    dato: '¿Sabes una cosa? Las conchas eran la casa de animalitos del mar, como las almejas y los caracoles.',
    juego: (onDone) =>
      Excava(
        {
          pool: ['concha', 'estrellaMar', 'cangrejo', 'caracol', 'piedra', 'pelotaPlaya'],
          bg: BG['playa'],
          intro: 'En la arena hay conchas y otros tesoros escondidos. Frota con el dedo para encontrarlos.',
        },
        onDone,
      ),
  },
  {
    id: 'basura',
    escena: 'playaBasura',
    animal: 'botellaPlastico',
    intro: 'Oh, oh. Alguien ha dejado basura en la arena. ¡Vamos a dejar la playa limpia!',
    dato: '¿Sabes una cosa? La basura que se queda en la playa llega al mar y les hace daño a los peces y a las tortugas.',
    juego: (onDone) => {
      const basura = shuffle([...BASURA_PLAYA.basura]);
      return Arrastra(
        {
          rounds: AGE() <= 3 ? 1 : 2,
          key: 'playa',
          bg: fondoPlaya,
          why: () => 'No, eso no es basura: es de la playa y se queda en la arena.',
          gen(i: number) {
            return {
              ask: 'Mete la basura en la papelera. Las conchas y las estrellas de mar se quedan en la playa.',
              zones: [
                {
                  id: 'papelera',
                  x: 900,
                  y: 440,
                  w: 260,
                  h: 280,
                  draw: papelera,
                  slot: (n: number) => [840 + (n % 3) * 60, 360],
                  ps: 0.45,
                },
              ],
              items: [
                ...basura.slice(i * 3, i * 3 + 3).map((k) => ({ k, zone: 'papelera' })),
                { k: BASURA_PLAYA.seQueda[i % 2]!, zone: 'no' },
              ],
              tray: { x0: 380, x1: 1440, y: 790 },
              okAll: '¡Qué limpia ha quedado la playa!',
            };
          },
        },
        onDone,
      );
    },
  },
  {
    id: 'mar',
    escena: 'playaMar',
    animal: 'barco',
    intro: 'Desde la orilla se ve el mar, con los barcos y el faro. ¡Vamos a contar lo que hay!',
    dato: '¿Sabes una cosa? Por la noche, el faro se enciende y su luz da vueltas para que los barcos no choquen con las rocas.',
    juego: (onDone) => Cuenta({ pool: ['barco', 'lancha', 'pez'], bg: fondoMar }, onDone),
  },
];

RECINTOS_PLAYA.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'playa', 'socorrista');
});
