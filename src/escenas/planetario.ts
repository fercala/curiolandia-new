/*
 * escenas/planetario.ts: las paradas de la excursión al planetario y el viaje a la Luna (idea 8 de docs/IDEAS-MEJORA.md,
 * fase P23). Se llega desde el plano de la excursión (escenas/excursion.ts: el cielo del planetario, con Sara la
 * astronauta) y, al terminar, se vuelve a él. Como los recintos del zoo, cada parada es un juego de los de siempre;
 * Sara la presenta y al terminar cuenta un dato curioso (la escena común es escenaRecinto de escenas/zoo.ts):
 * - La cuenta atrás (SCENES.planetarioCuenta): ¿qué número viene ahora? Contar hacia atrás hasta el cero y despegar
 *   (ChoiceGame con tarjetas de números; con 3 años, desde el 5, y con 4 y 5, desde el 10).
 * - Los planetas (SCENES.planetarioPlanetas): ¿dónde está la Tierra, Marte, Júpiter...? (Busca).
 * - El día y la noche (SCENES.planetarioDia): girar la Tierra para que sea de día o de noche (Gira).
 * - Pisar la Luna (SCENES.planetarioLuna): seguir las huellas de la astronauta por la Luna hasta la bandera (Huellas).
 * - Volver a casa (SCENES.planetarioViaje): ordenar el viaje: el cohete, la Luna y la vuelta a la Tierra (Secuencia).
 * Exporta: RECINTOS_PLANETARIO (cada parada, con la forma de RecintoZoo), CAMINO_LUNA y fondoLuna; pone
 * SCENES.planetarioCuenta, SCENES.planetarioPlanetas, SCENES.planetarioDia, SCENES.planetarioLuna y
 * SCENES.planetarioViaje.
 * Importa: el núcleo (dibujo, azar, la edad y las plantillas), los componentes ChoiceGame, Busca, Gira, Huellas y
 * Secuencia, los fondos BG, NUM y numCard de juegos/, el contorno K de los dibujos y escenaRecinto y el tipo RecintoZoo
 * de escenas/zoo.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y colores en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { AGE, H, SCENES, W, card, ctx, fmt, pic, ri, shuffle, text } from '../nucleo/indice.ts';
import type { AlTerminar, Juego } from '../juegos/tipos.ts';
import { BG, Busca, ChoiceGame, Gira, Huellas, NUM, Secuencia, numCard } from '../juegos/indice.ts';
import { K } from '../dibujos/todos.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';

/** El camino de huellas de la astronauta por la Luna hasta la bandera: dos tramos (con 3 años, solo el primero). */
export const CAMINO_LUNA: Array<Array<[number, number]>> = [
  [
    [300, 800],
    [460, 730],
    [620, 780],
    [780, 700],
  ],
  [
    [780, 700],
    [940, 640],
    [1100, 700],
    [1250, 620],
    [1340, 660],
  ],
];

// fondoLuna(): la Luna: el cielo negro con estrellas, la Tierra a lo lejos, el suelo gris con cráteres y, al final del
// camino de huellas, la bandera que plantamos.
export function fondoLuna(): void {
  BG['espacio']!();
  pic('tierra', 300, 180, 160);
  ctx.save();
  ctx.fillStyle = '#C9CCD3';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(W / 2, 440, W, 520);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = K;
  ctx.lineWidth = 6;
  ctx.stroke();
  [
    [200, 620, 60],
    [560, 600, 40],
    [880, 820, 70],
    [1200, 780, 50],
    [1450, 590, 45],
  ].forEach(([x, y, r]) => {
    ctx.fillStyle = '#A9ADB6';
    ctx.beginPath();
    ctx.ellipse(x!, y!, r!, r! * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // la bandera
  ctx.fillStyle = '#7A7A7A';
  ctx.fillRect(1440, 470, 10, 210);
  ctx.strokeRect(1440, 470, 10, 210);
  card(1450, 470, 120, 80, '#FF6B5E', 5, 6);
  ctx.restore();
  pic('estrella', 1510, 510, 50);
}

// cuentaAtras(onDone): la cuenta atrás: salen tres números seguidos hacia atrás y hay que tocar el que viene; en la
// última ronda se llega al cero y despega el cohete (ChoiceGame con tarjetas de números).
function cuentaAtras(onDone: AlTerminar): Juego {
  const R = 3,
    desde = AGE() <= 3 ? 5 : 10;
  const tarjeta = (n: number) => ({ name: NUM[n]!, draw: (x: number, y: number, s: number) => numCard(n, x, y, s) });
  return ChoiceGame(
    {
      rounds: R,
      bg: BG['espacio'],
      key: () => 'planetario',
      y: 680,
      // ref(r): los tres números que ya han salido y una tarjeta con la interrogación, y el cohete esperando
      ref(r: { seq: number[] }) {
        r.seq.forEach((n, q) => numCard(n, 420 + q * 220, 300, 170));
        card(1000, 215, 170, 170, '#FFF3B0', 6, 27);
        text('?', 1085, 330, 90, '#FFA94D');
        pic('cohete', 1340, 300, 240);
      },
      gen(i: number) {
        const st = i === R - 1 ? 3 : ri(4, desde),
          seq = [st, st - 1, st - 2],
          ok = st - 3,
          otros = shuffle(
            Array.from({ length: desde + 1 }, (_, n) => n).filter((n) => n !== ok && !seq.includes(n)),
          ).slice(0, 2);
        const A = tarjeta(ok);
        return {
          seq,
          words: [A, ...otros.map(tarjeta)],
          ok: [A],
          ask: fmt('{a}, {b}, {c}... ¿Qué número viene ahora?', { a: NUM[st]!, b: NUM[st - 1]!, c: NUM[st - 2]! }),
          okSay: () => (ok === 0 ? '¡Cero! ¡Despegamos!' : fmt('¡Sí! {N}.', { n: NUM[ok]! })),
          badSay: () => 'No. Cuenta hacia atrás: ¿qué número va antes?',
        };
      },
    },
    onDone,
  );
}

// RECINTOS_PLANETARIO: las cinco paradas, en el orden del plano.
export const RECINTOS_PLANETARIO: readonly RecintoZoo[] = [
  {
    id: 'cuenta',
    escena: 'planetarioCuenta',
    animal: 'cohete',
    intro: '¡Subimos al cohete! Antes de despegar hay que hacer la cuenta atrás, hasta el cero.',
    dato: '¿Sabes una cosa? Los cohetes echan mucho fuego por abajo para subir muy deprisa hasta el espacio.',
    juego: cuentaAtras,
  },
  {
    id: 'planetas',
    escena: 'planetarioPlanetas',
    animal: 'saturno',
    intro: '¡Ya estamos en el espacio! Mira por la ventana: se ven los planetas.',
    dato: '¿Sabes una cosa? Los planetas dan vueltas alrededor del sol, y la Tierra es nuestro planeta.',
    juego: (onDone) =>
      Busca(
        { items: ['tierra', 'marte', 'jupiter', 'saturno', 'sol', 'luna'], bg: BG['espacio'], key: 'planetario' },
        onDone,
      ),
  },
  {
    id: 'dia',
    escena: 'planetarioDia',
    animal: 'tierra',
    intro: 'Desde aquí se ve la Tierra dando vueltas. Por eso hay día y noche.',
    dato: '¿Sabes una cosa? Cuando aquí es de día, al otro lado de la Tierra es de noche.',
    juego: (onDone) => Gira({ rounds: AGE() <= 3 ? 2 : 4 }, onDone),
  },
  {
    id: 'luna',
    escena: 'planetarioLuna',
    animal: 'luna',
    intro: '¡Hemos llegado a la Luna! Aquí todo pesa muy poco y se camina dando saltitos.',
    dato: '¿Sabes una cosa? En la Luna no hay viento, así que las huellas de los astronautas siguen allí.',
    juego: (onDone) =>
      Huellas(
        {
          trazos: CAMINO_LUNA.slice(0, AGE() <= 3 ? 1 : 2),
          paso: 90,
          who: 'astronauta',
          c: '#8E96A3',
          bg: fondoLuna,
          key: 'planetario',
          ask: 'Pisa la Luna: toca las huellas una a una hasta la bandera.',
          ok: '¡Hemos plantado la bandera en la Luna!',
        },
        onDone,
      ),
  },
  {
    id: 'viaje',
    escena: 'planetarioViaje',
    animal: 'astronauta',
    intro: 'Es hora de volver a casa. ¿Te acuerdas de cómo ha sido el viaje?',
    dato: '¿Sabes una cosa? Cuando vuelven, los astronautas caen al mar con paracaídas y los recoge un barco.',
    juego: (onDone) =>
      Secuencia(
        {
          bg: BG['espacio'],
          key: 'planetario',
          panels: ['cohete', 'luna', 'tierra'],
          ask: 'Ordena el viaje: primero despegamos en el cohete, después llegamos a la Luna y al final volvemos a la Tierra.',
          okAll: '¡Muy bien! Ya estamos otra vez en casa.',
        },
        onDone,
      ),
  },
];

RECINTOS_PLANETARIO.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'planetario', 'astronauta');
});
