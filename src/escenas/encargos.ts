/*
 * escenas/encargos.ts: los encargos de los vecinos (idea 34 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.180). La primera vez que se entra en el mapa cada día, Tito cuenta el encargo del día (anunciarEncargo,
 * lo llama el mapa); mientras está por hacer, en el mapa sale un botón redondo con la cosa que hay que llevar
 * (dibujaEncargo; al tocarlo, Tito lo repite, tocaEncargo). Al entrar en la escena de destino (AL_ENTRAR, de
 * nucleo/escenas.ts) el encargo está hecho: Tito da las gracias, 3 monedas y se apunta en el diario. Las reglas, en
 * dominio/encargos.ts; lo guardado, en S.encargos.
 * Exporta: ENCARGO_BOTON, anunciarEncargo, dibujaEncargo y tocaEncargo (los usa el mapa, 2D y 3D).
 * Importa: el núcleo (S, AL_ENTRAR, dibujo, voz y monedas), las reglas de dominio/encargos.ts y apuntarDiario.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import {
  AL_ENTRAR,
  S,
  SFX,
  circ,
  ctx,
  dist,
  giveCoins,
  hC,
  hv,
  later,
  pic,
  save,
  sayQ,
  creditCoins,
  today,
} from '../nucleo/indice.ts';
import { decirEncargo, encargoDeHoy, estadoEncargos, llegarA, type EstadoEncargos } from '../dominio/encargos.ts';
import { apuntarDiario } from './diario.ts';

// ENCARGO_BOTON: el botón del encargo en el mapa, debajo del de la gran aventura.
export const ENCARGO_BOTON = { x: 1490, y: 440, r: 50 };

// estado(): el estado de hoy; guarda(e): lo guarda en S.encargos.
const estado = (): EstadoEncargos => estadoEncargos(S.encargos, today());
function guarda(e: EstadoEncargos): void {
  S.encargos = { ...e };
  save();
}

// anunciarEncargo(): la primera vez de cada día, Tito cuenta el encargo del día (en cola, detrás de lo que diga).
export function anunciarEncargo(): void {
  const e = decirEncargo(estado());
  if (!e) return;
  guarda(e);
  sayQ(encargoDeHoy(today()).pide);
}

// pendiente(): ¿hay un encargo dicho y sin hacer?
const pendiente = (): boolean => {
  const e = estado();
  return e.dicho && !e.hecho;
};

// dibujaEncargo(): si hay encargo por hacer, su botón: la cosa que hay que llevar y, pequeño, quién la ha dado.
export function dibujaEncargo(): void {
  if (!pendiente()) return;
  const B = ENCARGO_BOTON,
    enc = encargoDeHoy(today()),
    s = hv('encargo', hC(B.x, B.y, B.r));
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  circ(0, 0, B.r, '#FFF1B2', 5);
  pic(enc.cosa, 0, 0, B.r * 1.3);
  circ(-B.r * 0.75, B.r * 0.7, 26, '#FFFFFF', 4);
  pic(enc.quien, -B.r * 0.75, B.r * 0.7, 46);
  ctx.restore();
}

// tocaEncargo(x, y): si se toca el botón del encargo, Tito lo repite; devuelve si se ha tocado.
export function tocaEncargo(x: number, y: number): boolean {
  if (!pendiente() || dist(x, y, ENCARGO_BOTON.x, ENCARGO_BOTON.y) > ENCARGO_BOTON.r + 6) return false;
  SFX.pop();
  sayQ(encargoDeHoy(today()).pide);
  return true;
}

// al entrar en una escena: si es el destino del encargo, se entrega (las gracias, las monedas y el diario).
AL_ENTRAR.push((nombre) => {
  const r = llegarA(estado(), nombre, today());
  if (!r) return;
  guarda(r.estado);
  creditCoins(r.monedas);
  apuntarDiario('encargo');
  save();
  later(1200, () => {
    SFX.tada();
    sayQ(encargoDeHoy(today()).hecho);
    giveCoins(r.monedas, 800, 450, undefined, true);
  });
});
