/*
 * escenas/ciudad.ts: las paradas de la excursión a la ciudad (idea 5 de docs/IDEAS-MEJORA.md, fase P20): el parque de
 * bomberos, la panadería, el centro de salud y la calle. Se llega desde el plano de la excursión (escenas/excursion.ts:
 * la calle de la ciudad, con Lucía la bombera) y, al terminar, se vuelve a él. Como los recintos del zoo, cada parada es
 * un juego de los de siempre; Lucía la presenta y al terminar cuenta un dato curioso (la escena común es escenaRecinto de
 * escenas/zoo.ts):
 * - Vestirse de bombero (SCENES.ciudadVestir): ordenar la ropa del traje: las botas, la chaqueta, el casco y los guantes
 *   (Secuencia).
 * - Apagar el fuego (SCENES.ciudadFuego): frotar las llamas de la casa con la manguera hasta apagarlas (Frota).
 * - La panadería (SCENES.ciudadPan): ¿cómo se hace el pan? Del trigo al panadero y al pan (Secuencia).
 * - El centro de salud (SCENES.ciudadSalud): curar las pupas del conejito con la crema (Frota).
 * - Cruzar la calle (SCENES.ciudadCalle): ¿cruzamos o esperamos? Mirar el semáforo (Semaforo).
 * Exporta: RECINTOS_CIUDAD (cada parada, con la forma de RecintoZoo), llama y pupa (las manchas de Frota); pone
 * SCENES.ciudadVestir, SCENES.ciudadFuego, SCENES.ciudadPan, SCENES.ciudadSalud y SCENES.ciudadCalle.
 * Importa: el núcleo (dibujo), los componentes Secuencia, Frota y Semaforo y los fondos BG de juegos/, el contorno K de
 * los dibujos y escenaRecinto y el tipo RecintoZoo de escenas/zoo.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y colores en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { AGE, SCENES, T, ctx, pic } from '../nucleo/indice.ts';
import type { Libre } from '../juegos/tipos.ts';
import { BG, Frota, Secuencia, Semaforo } from '../juegos/indice.ts';
import { K } from '../dibujos/todos.ts';
import { escenaRecinto, type RecintoZoo } from './zoo.ts';

// llama(s): una llama de fuego (la mancha s de Frota: s.r es su tamaño y s.ph, su fase): roja por fuera y amarilla
// por dentro, que se mueve con T.
export function llama(s: Libre): void {
  const r = s.r as number,
    m = Math.sin(T * 9 + (s.ph as number)) * 0.12;
  [
    ['#FF6B3D', 1],
    ['#FFC93C', 0.55],
  ].forEach(([c, k]) => {
    const q = r * (k as number);
    ctx.beginPath();
    ctx.moveTo(0, q * 0.8);
    ctx.quadraticCurveTo(-q * 1.1, q * 0.4, -q * 0.5, -q * 0.4);
    ctx.quadraticCurveTo(-q * 0.2, -q * 0.9, q * m * 4, -q * 1.6);
    ctx.quadraticCurveTo(q * 0.3, -q * 0.7, q * 0.6, -q * 0.5);
    ctx.quadraticCurveTo(q * 1.1, q * 0.3, 0, q * 0.8);
    ctx.closePath();
    ctx.fillStyle = c as string;
    ctx.strokeStyle = K;
    ctx.lineWidth = k === 1 ? 4 : 0;
    ctx.fill();
    if (k === 1) ctx.stroke();
  });
}

// pupa(s): una pupa del conejito (la mancha s de Frota): un rasguño rojo con tres rayitas.
export function pupa(s: Libre): void {
  const r = s.r as number;
  ctx.fillStyle = '#FF8A7A';
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#D9473A';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  [-0.4, 0, 0.4].forEach((d) => {
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * d - r * 0.15);
    ctx.lineTo(r * 0.5, r * d + r * 0.15);
    ctx.stroke();
  });
}

// casaEnLlamas(): la casa que hay que apagar (el dibujo de la casa de ladrillo, grande, con humo que sube).
function casaEnLlamas(): void {
  pic('casaLadrillo', 800, 470, 620);
  ctx.save();
  ctx.fillStyle = 'rgba(120,120,120,0.35)';
  [0, 1, 2].forEach((i) => {
    const k = (T * 0.4 + i / 3) % 1;
    ctx.beginPath();
    ctx.arc(900 + Math.sin(k * 6) * 20, 160 - k * 140, 30 + k * 40, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// CASCO_BOMBERO: el casco rojo de bombero (con su visera y su escudo dorado), una viñeta de Secuencia con su nombre:
// el dibujo «casco» es el de la bici.
const CASCO_BOMBERO = {
  name: 'el casco',
  // draw(x, y, s): el casco en (x, y), de tamaño s.
  draw(x: number, y: number, s: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 200, s / 200);
    ctx.strokeStyle = K;
    ctx.lineWidth = 8;
    ctx.fillStyle = '#E2574C';
    ctx.beginPath();
    ctx.ellipse(0, 30, 95, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-70, 30);
    ctx.quadraticCurveTo(-72, -70, 0, -72);
    ctx.quadraticCurveTo(72, -70, 70, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFC93C';
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(24, -26);
    ctx.lineTo(18, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(-18, 6);
    ctx.lineTo(-24, -26);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  },
};

// manguera(): la manguera, la herramienta de Frota que va con el dedo al apagar el fuego.
const manguera = (): void => pic('manguera', 0, 0, 140);

// crema(): el bote de crema, la herramienta de Frota que va con el dedo al curar al conejito.
function crema(): void {
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = K;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-22, -40, 44, 70, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5BB8E6';
  ctx.beginPath();
  ctx.roundRect(-14, -54, 28, 16, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FF6B5E';
  ctx.fillRect(-4, -18, 8, 26);
  ctx.fillRect(-13, -9, 26, 8);
}

// RECINTOS_CIUDAD: las cinco paradas, en el orden del plano.
export const RECINTOS_CIUDAD: readonly RecintoZoo[] = [
  {
    id: 'vestir',
    escena: 'ciudadVestir',
    animal: 'camionBomberos',
    intro:
      'Para apagar fuegos, primero hay que ponerse el traje. Primero las botas, después la chaqueta, luego el casco y al final los guantes.',
    dato: '¿Sabes una cosa? El traje de los bomberos los protege del fuego y del calor.',
    juego: (onDone) =>
      Secuencia(
        {
          bg: BG['ciudad'],
          key: 'ciudad',
          panels: ['botasAgua', 'abrigo', CASCO_BOMBERO, 'guantes'],
          first: true,
          ask: 'Ordena la ropa del bombero: primero las botas, después la chaqueta, luego el casco y al final los guantes.',
          okAll: '¡Muy bien! Ya estamos listos para salir.',
        },
        onDone,
      ),
  },
  {
    id: 'fuego',
    escena: 'ciudadFuego',
    animal: 'manguera',
    intro: '¡Hay un fuego en una casa! Subimos al camión de bomberos y... ¡a apagarlo!',
    dato: '¿Sabes una cosa? Si hay un fuego, hay que avisar a un mayor y llamar al ciento doce.',
    juego: (onDone) =>
      Frota(
        {
          spots: [
            [650, 400, 55],
            [950, 400, 55],
            [800, 580, 60],
            [700, 260, 45],
            [920, 250, 45],
          ].slice(0, AGE() <= 3 ? 3 : 5),
          bg: BG['ciudad'],
          base: casaEnLlamas,
          spot: llama,
          tool: manguera,
          key: 'ciudad',
          intro: 'Echa agua con la manguera: frota las llamas hasta que no quede ninguna.',
          okAll: '¡Fuego apagado! Eres un bombero estupendo.',
        },
        onDone,
      ),
  },
  {
    id: 'pan',
    escena: 'ciudadPan',
    animal: 'pan',
    intro: '¡Qué bien huele! Estamos en la panadería. ¿Sabes cómo se hace el pan?',
    dato: '¿Sabes una cosa? Los panaderos se levantan muy temprano, cuando todavía es de noche, para que el pan esté listo por la mañana.',
    juego: (onDone) =>
      Secuencia(
        {
          bg: BG['cocina'],
          key: 'ciudad',
          panels: ['trigo', 'panadero', 'pan'],
          ask: '¿Cómo se hace el pan? Ordena del primero al último.',
          okAll: '¡Muy bien! Del trigo sale la harina, el panadero hace la masa y la mete en el horno. ¡Y sale el pan!',
        },
        onDone,
      ),
  },
  {
    id: 'salud',
    escena: 'ciudadSalud',
    animal: 'medico',
    intro: 'Esto es el centro de salud. Aquí nos cuidan cuando estamos malitos.',
    dato: '¿Sabes una cosa? Para no ponernos malos, nos lavamos las manos, comemos fruta y dormimos mucho.',
    juego: (onDone) =>
      Frota(
        {
          spots: [
            [700, 420, 34],
            [900, 540, 34],
            [760, 640, 30],
            [880, 330, 28],
          ].slice(0, AGE() <= 3 ? 3 : 4),
          bg: BG['casa'],
          base: () => pic('peluche', 800, 480, 560),
          spot: pupa,
          tool: crema,
          key: 'ciudad',
          intro: '¡Ay! El conejito se ha caído y tiene pupas. Frota con la crema para curarlo.',
          okAll: '¡Ya está curado! El conejito está muy contento.',
        },
        onDone,
      ),
  },
  {
    id: 'calle',
    escena: 'ciudadCalle',
    animal: 'semaforo',
    intro: 'Para volver al cole hay que cruzar la calle. ¡Mira bien el semáforo!',
    dato: '¿Sabes una cosa? Cruzamos la calle por el paso de cebra, con el semáforo en verde y de la mano de un mayor.',
    juego: (onDone) => Semaforo({ rounds: AGE() <= 3 ? 4 : 5 }, onDone),
  },
];

RECINTOS_CIUDAD.forEach((r) => {
  SCENES[r.escena] = escenaRecinto(r, 'ciudad', 'bombera');
});
