/*
 * escenas/casaExtras.ts: los botones nuevos de la casa de Tito de la PR de todas las ideas pendientes (v0.2.181,
 * docs/IDEAS-MEJORA.md): el diario (idea 35), el corral de Tito (idea 33, cuando ya se ha ido a la granja escuela) y
 * «Jugar juntos» (idea 39). Cada botón es un círculo con su dibujo; solo sale si su escena existe y, si tiene condición,
 * cuando se cumple. La casa (escenas/casa.ts) los dibuja con dibujaBotonesCasa() y los mira al tocar con
 * tocaBotonCasa(x, y).
 * Exporta: BOTONES_CASA_EXTRA (para las pruebas), botonesCasaVisibles, dibujaBotonesCasa y tocaBotonCasa.
 * Importa: del núcleo, lo que dibuja, el puntero, S, SFX, SCENES y go; visitaDe (dominio/excursiones.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import { S, SCENES, SFX, circ, ctx, dist, go, hC, hv, pic } from '../nucleo/indice.ts';
import { visitaDe } from '../dominio/excursiones.ts';

/** Un botón extra de la casa: su id, dónde está, su dibujo, la escena que abre y, si la tiene, cuándo sale. */
export interface BotonCasa {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly dibujo: string;
  readonly escena: string;
  readonly sale?: () => boolean;
}

// BOTONES_CASA_EXTRA: el diario a la izquierda, debajo del álbum de fotos; el corral y «Jugar juntos» a la derecha.
export const BOTONES_CASA_EXTRA: readonly BotonCasa[] = [
  { id: 'diario', x: 80, y: 560, r: 52, dibujo: 'libro', escena: 'diario' },
  {
    id: 'corral',
    x: 1520,
    y: 440,
    r: 52,
    dibujo: 'gallina',
    escena: 'corral',
    sale: () => visitaDe(S.exc, 'granja').veces > 0,
  },
  { id: 'juntos', x: 1520, y: 560, r: 52, dibujo: 'corazon', escena: 'juntos' },
];

// botonesCasaVisibles(): los botones que salen ahora (su escena existe y se cumple su condición).
export const botonesCasaVisibles = (): BotonCasa[] =>
  BOTONES_CASA_EXTRA.filter((b) => !!SCENES[b.escena] && (!b.sale || b.sale()));

// dibujaBotonesCasa(): dibuja los botones que salen, con el mismo aspecto que los de la vitrina y el álbum de fotos.
export function dibujaBotonesCasa(): void {
  botonesCasaVisibles().forEach((b) => {
    const s = hv('casaExtra:' + b.id, hC(b.x, b.y, b.r));
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(s, s);
    circ(0, 0, b.r, '#fff', 5);
    pic(b.dibujo, 0, 0, b.r * 1.3);
    ctx.restore();
  });
}

// tocaBotonCasa(x, y): si se toca un botón que sale, va a su escena y devuelve true.
export function tocaBotonCasa(x: number, y: number): boolean {
  const b = botonesCasaVisibles().find((o) => dist(x, y, o.x, o.y) < o.r + 6);
  if (!b) return false;
  SFX.whoosh();
  go(b.escena);
  return true;
}
