/*
 * aplicacion/casa.ts: los casos de uso de la casa de Tito ordenada (fase M2 de docs/PLAN-CASA-MEJORA.md): arreglar la
 * casa al entrar (cada cosa en su sitio y lo que no cabe, al baúl), guardar lo que se compra en el baúl, colocar una
 * cosa en un sitio, guardarla y «¡Ordena, Tito!». Usan las reglas de los sitios (dominio/casaSitios.ts, con PLANO).
 * Como los demás casos de uso de src/aplicacion/, no cambian la partida que reciben ni dibujan, hablan o guardan:
 * devuelven los campos nuevos (home y casaVistos). La escena de la casa (escenas/casa.ts) y la tienda los llaman, ponen
 * esos campos en S y guardan.
 * casaVistos ({id: 1}) apunta lo que ya se ha colocado alguna vez en la casa: lo del baúl que no está ahí es «nuevo»
 * (el número del botón del baúl). Las partidas de antes de la M2 no lo tienen (null): la primera vez que se arregla la
 * casa, todo lo que ya había cuenta como visto.
 * Pruebas: tests/unidad/casaAplicacion.test.ts (sin navegador: cada prueba inventa la partida).
 * Exporta: los tipos PartidaDeCasa, CasaArreglada y Colocado y los casos de uso arreglarCasa, nuevoAlBaul,
 * colocarObjeto, guardarObjeto, ordenarCasa, enBaul y nuevosEnBaul.
 * Importa: las reglas y el plano de dominio/casaSitios.ts.
 */
import {
  EN_BAUL,
  PLANO,
  asignarSitios,
  colocar,
  guardar,
  ordenar,
  sitioDe,
  type Casa,
  type PosCasa,
} from '../dominio/casaSitios.ts';

/** Lo que miran los casos de uso de la casa en la partida (S). */
export interface PartidaDeCasa {
  /** Dónde está cada cosa (S.home). */
  readonly home?: Casa;
  /** Lo que es del niño (S.owned): lo comprado de la casa que no está en home va al baúl. */
  readonly owned?: Readonly<Record<string, number>>;
  /** Lo que ya se colocó alguna vez (S.casaVistos; null o ausente en las partidas de antes de la fase M2). */
  readonly casaVistos?: Readonly<Record<string, number>> | null;
}

/** La casa nueva y lo visto. */
export interface CasaArreglada {
  readonly home: Casa;
  readonly casaVistos: Record<string, number>;
}

/** El resultado de colocar o guardar: la casa nueva, lo visto y lo que se ha ido al baúl de rebote (lo que había
 * encima de un mueble que se mueve o se guarda). */
export interface Colocado extends CasaArreglada {
  readonly alBaul: string[];
}

// vistosDe(p): lo visto de la partida; si aún no se ha apuntado nunca (partida de antes de la M2), todo lo que ya
// está en la casa.
function vistosDe(p: PartidaDeCasa): Record<string, number> {
  const v = p.casaVistos;
  if (v && typeof v === 'object') return { ...v };
  return Object.fromEntries(Object.keys(p.home || {}).map((id) => [id, 1]));
}

// enSuSitio(casa, id): la posición de id con x e y las de su sitio (si lo tiene y existe), o la misma si no.
function enSuSitio(casa: Casa, id: string): PosCasa {
  const p = casa[id],
    s = p.h ? sitioDe(PLANO, casa, p.h) : undefined;
  return s && (s.x !== p.x || s.y !== p.y) ? { ...p, x: s.x, y: s.y } : p;
}

// arreglarCasa(p): la casa ordenada al entrar en ella: lo comprado de la casa (lo que tiene tamaño en PLANO) que no está
// en home va al baúl; cada objeto sin sitio busca uno libre en su habitación (asignarSitios) y, si no cabe, va al baúl;
// y cada uno se pone en la posición de su sitio (x e y), para que nunca se pisen. Lo que ya estaba bien no cambia, y
// llamarla otra vez con su resultado tampoco. Lo que no es del niño ni un objeto de la casa se deja como está.
export function arreglarCasa(p: PartidaDeCasa): CasaArreglada {
  const casaVistos = vistosDe(p),
    owned = p.owned || {};
  const faltan = Object.keys(owned).filter(
    (id) => owned[id] && Object.hasOwn(PLANO.tamanos, id) && !Object.hasOwn(p.home || {}, id),
  );
  const conTodo: Casa = { ...p.home, ...Object.fromEntries(faltan.map((id) => [id, { x: 0, y: 0, r: EN_BAUL }])) };
  const conSitio = asignarSitios(PLANO, conTodo);
  const sinSitio = Object.keys(conSitio).filter((id) => {
    const q = conSitio[id];
    return q && Number.isFinite(q.x) && q.r !== EN_BAUL && !q.h;
  });
  const guardada = sinSitio.reduce((c, id) => guardar(PLANO, c, id), conSitio);
  const home = Object.fromEntries(Object.keys(guardada).map((id) => [id, guardada[id] && enSuSitio(guardada, id)]));
  return { home, casaVistos };
}

// nuevoAlBaul(p, id): lo recién comprado (o regalado) id se guarda en el baúl, sin apuntarlo como visto, para que el
// niño elija dónde ponerlo (decisión 2 del plan). Si ya estaba en la casa, no cambia.
export function nuevoAlBaul(p: PartidaDeCasa, id: string): CasaArreglada {
  const casaVistos = vistosDe(p),
    home = p.home || {};
  if (Object.hasOwn(home, id)) return { home, casaVistos };
  return { home: { ...home, [id]: { x: 0, y: 0, r: EN_BAUL } }, casaVistos };
}

// mandadosAlBaul(antes, despues, id): lo que estaba fuera del baúl en antes y está en él en despues, sin contar id.
function mandadosAlBaul(antes: Casa, despues: Casa, id: string): string[] {
  return Object.keys(despues).filter(
    (k) => k !== id && antes[k] && antes[k].r !== EN_BAUL && despues[k] && despues[k].r === EN_BAUL,
  );
}

// colocarObjeto(p, id, h): pone id en el sitio h (colocar de dominio/casaSitios.ts) y lo apunta como visto. Si no se
// puede (el sitio no existe, está ocupado o no cabe), null. alBaul: lo que el mueble llevaba encima y se ha guardado.
export function colocarObjeto(p: PartidaDeCasa, id: string, h: string): Colocado | null {
  const antes = p.home || {},
    home = colocar(PLANO, antes, id, h);
  if (!home[id] || home[id].h !== h) return null;
  return { home, casaVistos: { ...vistosDe(p), [id]: 1 }, alBaul: mandadosAlBaul(antes, home, id) };
}

// guardarObjeto(p, id): guarda id en el baúl (y lo que llevara encima, que va en alBaul). Si no está en la casa, null.
export function guardarObjeto(p: PartidaDeCasa, id: string): Colocado | null {
  const antes = p.home || {};
  if (!antes[id]) return null;
  const home = guardar(PLANO, antes, id);
  return { home, casaVistos: vistosDe(p), alBaul: mandadosAlBaul(antes, home, id) };
}

// ordenarCasa(p, habitual, abiertas): «¡Ordena, Tito!»: cada cosa que no está en el baúl va a su habitación habitual
// (habitual(id), si está entre las abiertas; si no, al salón), al sitio que prefiere su tamaño; lo que no cabe, al baúl.
export function ordenarCasa(
  p: PartidaDeCasa,
  habitual: (id: string) => string | undefined,
  abiertas: readonly string[],
): CasaArreglada {
  return { home: ordenar(PLANO, p.home || {}, habitual, abiertas), casaVistos: vistosDe(p) };
}

// enBaul(p): los ids de lo que hay en el baúl que es del niño, en el orden de home.
export function enBaul(p: PartidaDeCasa): string[] {
  const home = p.home || {},
    owned = p.owned || {};
  return Object.keys(home).filter((id) => home[id] && home[id].r === EN_BAUL && owned[id]);
}

// nuevosEnBaul(p): lo del baúl que aún no se ha colocado nunca (el número del botón del baúl).
export function nuevosEnBaul(p: PartidaDeCasa): string[] {
  const v = vistosDe(p);
  return enBaul(p).filter((id) => !v[id]);
}
