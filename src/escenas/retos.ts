/*
 * escenas/retos.ts: los retos para hacer en casa, sin pantalla (idea 37 de docs/IDEAS-MEJORA.md, fase P4), en el juego:
 * proponer el reto de hoy (lo dice Tito al despedirse: cuando se va a dormir, SCENES.dormir, y cuando propone descansar
 * en el mapa) y celebrarlo con una pegatina cuando la familia lo ha marcado como hecho en la zona de adultos (al volver
 * al mapa). Las reglas (qué reto toca, hecho, celebrado), en dominio/retos.ts; lo guardado, en S.retos.
 * Exporta: retoDeHoy, fraseReto y celebrarRetoSiToca.
 * Importa: el núcleo (S, guardar, fecha, voz, pegatinas) y las reglas de dominio/retos.ts y el azar de los puertos.
 */
import { S, giveSticker, kid, save, sayQ, today, fmt, tr } from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { proponerReto, retoCelebrado, retoPorId, tocaCelebrarReto } from '../dominio/retos.ts';

// PEGATINA_RETO: la pegatina que da Tito por cada reto hecho (la casa: es un reto en casa).
const PEGATINA_RETO = 'casa';

// retoDeHoy(): el reto de hoy (el mismo todo el día; uno nuevo cada día, proponerReto), apuntado en S.retos. Devuelve
// lo que dice Tito para proponerlo, sin «Un reto:» delante («busca en casa tres cosas rojas.»).
export function retoDeHoy(): string {
  const r = proponerReto(S.retos, today(), azar, !!S.sinMoverse);
  if (!S.retos || S.retos.d !== r.d || S.retos.id !== r.id) {
    S.retos = { ...r };
    save();
  }
  return retoPorId(r.id)!.frase;
}

// fraseReto(): lo que dice Tito para proponer el reto de hoy al despedirse.
export const fraseReto = (): string =>
  fmt('Te dejo un reto para hacer en casa, sin pantalla: {reto}', { reto: tr(retoDeHoy()) });

// celebrarRetoSiToca(): si la familia ha marcado el reto como hecho y Tito aún no lo ha celebrado, lo celebra (con la
// pegatina de la casa, S.stk, que se ve cuando Tito acaba de hablar) y lo apunta como celebrado. Devuelve si lo ha celebrado.
export function celebrarRetoSiToca(): boolean {
  if (!tocaCelebrarReto(S.retos)) return false;
  // la pegatina se apunta ya (si otra frase corta a Tito, no se pierde) y su aviso sale cuando Tito acaba de hablar
  S.retos = { ...retoCelebrado(S.retos) };
  S.stk[PEGATINA_RETO] = (S.stk[PEGATINA_RETO] || 0) + 1;
  save();
  sayQ(fmt('¡Me han contado que has hecho el reto en casa{nino}! ¡Qué bien! Toma una pegatina.', { nino: kid() }), () =>
    giveSticker(PEGATINA_RETO, true),
  );
  return true;
}
