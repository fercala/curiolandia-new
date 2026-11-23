/*
 * escenas/amigos.ts: lo que dicen y guardan los amigos de Tito en el mapa (idea 25 de docs/IDEAS-MEJORA.md, fase P31).
 * Lupi y Polly pasean por el mapa 3D (mundo3d/amigos3d.ts); al hablar con ellos, saludan o, si es el amigo del encargo
 * de hoy (encargoDelDia, dominio/amigos.ts), piden ayuda para buscar lo que han perdido y dicen cerca de dónde. Al
 * recogerlo Tito, se lo devuelve: se apunta en S.amigos, el amigo da las gracias y se ganan 2 monedas.
 * Exporta: registroAmigosHoy, encargoHoy, faseHoy, hablarConAmigo y devolverPerdido.
 * Importa: el núcleo (S, voz, sonido, monedas, guardado y el día) y las reglas de dominio/amigos.ts.
 */
import { S, SFX, creditCoins, giveCoins, later, save, say, sayQ, sparkles, today } from '../nucleo/indice.ts';
import {
  AMIGOS,
  CERCA_DE,
  PERDIDOS,
  devolver,
  encargoDelDia,
  faseEncargo,
  pedirAyuda,
  registroAmigos,
  type Encargo,
  type FaseEncargo,
  type RegistroAmigos,
} from '../dominio/amigos.ts';

// registroAmigosHoy(): lo guardado de los amigos (S.amigos), leído con registroAmigos (vacío si falta o está roto).
export const registroAmigosHoy = (): RegistroAmigos => registroAmigos(S.amigos);
// encargoHoy(): el encargo de hoy (qué amigo, qué ha perdido y dónde).
export const encargoHoy = (): Encargo => encargoDelDia(today());
// faseHoy(): en qué va el encargo de hoy: sin pedir, buscando o hecho.
export const faseHoy = (): FaseEncargo => faseEncargo(registroAmigosHoy(), today());

// guarda(r): apunta el registro r en S.amigos y guarda la partida.
function guarda(r: RegistroAmigos): void {
  S.amigos = { d: r.d, pedido: r.pedido, hecho: r.hecho, ayudas: r.ayudas };
  save();
}

// hablarConAmigo(id): Tito habla con el amigo id: si es el del encargo de hoy y aún no lo había pedido, pide ayuda
// (se apunta) y dice dónde lo perdió; si ya lo había pedido, lo recuerda; si no, saluda. Devuelve true si acaba de
// pedir ayuda (para que el mapa ponga lo perdido).
export function hablarConAmigo(id: string): boolean {
  const e = encargoHoy(),
    f = faseHoy(),
    p = PERDIDOS.find((x) => x.id === e.perdido);
  if (id === e.amigo && p && f !== 'hecho') {
    if (f === 'sinPedir') guarda(pedirAyuda(registroAmigosHoy(), today()));
    SFX.pop();
    say(p.pide);
    sayQ(CERCA_DE[e.rincon] ?? '');
    return f === 'sinPedir';
  }
  say(AMIGOS.find((a) => a.id === id)?.hola ?? '');
  return false;
}

// devolverPerdido(x, y): Tito ha recogido lo perdido y se lo devuelve a su amigo: se apunta en S.amigos (devolver), se
// abonan las monedas y se guarda; el amigo da las gracias, chispas y las monedas salen de (x, y). Devuelve las monedas
// (0 si no había nada que devolver).
export function devolverPerdido(x: number, y: number): number {
  const r = devolver(registroAmigosHoy(), today());
  if (!r.monedas) return 0;
  guarda(r.registro);
  creditCoins(r.monedas);
  SFX.tada();
  sparkles(x, y, 24);
  later(700, () => giveCoins(r.monedas, x, y, undefined, true));
  say(PERDIDOS.find((p) => p.id === encargoHoy().perdido)?.gracias ?? '');
  return r.monedas;
}
