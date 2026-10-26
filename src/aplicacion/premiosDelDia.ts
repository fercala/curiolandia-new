/*
 * aplicacion/premiosDelDia.ts: los casos de uso de los premios del día (fase 4m de docs/PLAN-MIGRACION.md): el regalo
 * del día (regaloDelDia), soplar las velas del cumpleaños (premioDelCumple), terminar el repaso del día
 * (premioDelRepaso) y terminar la asamblea (terminarAsamblea). Antes estaban escritos a mano en el mapa
 * (escenas/zonas.ts), en la asamblea y el cumpleaños (escenas/escenas2d.ts) y en la escena del repaso (escenas/repaso.ts).
 * No cambian la partida que reciben ni dibujan, hablan o guardan: devuelven los campos nuevos de la partida y las monedas
 * que tocan. Quien llama pone los campos en S, suma las monedas con creditCoins (para que luego giveCoins las anime sin
 * volver a sumarlas), guarda y hace lo de pantalla (la figurita con giveSticker, la celebración, la voz).
 * Pruebas: tests/unidad/premiosDelDia.test.ts (sin navegador: cada prueba inventa la partida).
 * Exporta: los tipos Premio, DiaDeAsamblea y AsambleaTerminada, las constantes DIAS_DE_ASAMBLEA y
 * ASAMBLEAS_POR_SEMANA y los casos de uso regaloDelDia, premioDelCumple, premioDelRepaso y terminarAsamblea.
 * Importa: solo cuántas monedas da cada cosa (MONEDAS, de dominio/monedas.ts).
 */
import { MONEDAS } from '../dominio/monedas.ts';

/** Lo que devuelve un premio: los campos nuevos de la partida (P) y las monedas que da (las suma quien llama). */
export interface Premio<P> {
  readonly partida: P;
  readonly monedas: number;
}

/** Lo que se guarda de la asamblea de un día (S.asam[fecha]). */
export interface DiaDeAsamblea {
  done?: number | boolean;
  age?: number;
  dia?: unknown;
  tiempo?: string;
  emo?: string;
}

/** Lo que devuelve terminarAsamblea. */
export interface AsambleaTerminada {
  /** Los campos nuevos de la partida: las asambleas guardadas y, si hay figurita de la semana, S.first con la semana. */
  readonly partida: { readonly asam: Record<string, DiaDeAsamblea>; readonly first?: Record<string, number | boolean | string> };
  /** Lo guardado de la asamblea de hoy (con done y la edad). */
  readonly hoy: DiaDeAsamblea;
  /** Si es la tercera asamblea de la semana y aún no se había dado la figurita de esta semana. */
  readonly figurita: boolean;
  /** Las monedas: solo la primera asamblea terminada de cada día. */
  readonly monedas: number;
}

/** Cuántos días de asamblea se guardan como mucho (se borran los más antiguos). */
export const DIAS_DE_ASAMBLEA = 120;
/** Cuántas asambleas terminadas en una semana (desde el lunes) dan la figurita de la semana. */
export const ASAMBLEAS_POR_SEMANA = 3;

// regaloDelDia(p, hoy): el regalo del día, la primera vez que se entra en el mapa cada día: apunta hoy en gift y da
// MONEDAS.regaloDelDia. Si hoy ya se dio, null. No cambia p.
export function regaloDelDia(p: { readonly gift?: string }, hoy: string): Premio<{ gift: string }> | null {
  return p.gift === hoy ? null : { partida: { gift: hoy }, monedas: MONEDAS.regaloDelDia };
}

// premioDelCumple(p, hoy): el niño ha soplado todas las velas: apunta hoy en bdayDone (no vuelve a salir hasta el año
// que viene), una figurita más de la tarta y MONEDAS.cumple. No cambia p.
export function premioDelCumple(p: { readonly stk: Readonly<Record<string, number>> }, hoy: string): Premio<{ bdayDone: string; stk: Record<string, number> }> {
  return { partida: { bdayDone: hoy, stk: { ...p.stk, tarta: (p.stk['tarta'] || 0) + 1 } }, monedas: MONEDAS.cumple };
}

// premioDelRepaso(p): el repaso del día está terminado: una figurita más de la lupa y MONEDAS.repaso. Que ya se cobró
// (S.rep.paid) lo apunta quien llama, en el repaso de hoy. No cambia p.
export function premioDelRepaso(p: { readonly stk: Readonly<Record<string, number>> }): Premio<{ stk: Record<string, number> }> {
  return { partida: { stk: { ...p.stk, lupa: (p.stk['lupa'] || 0) + 1 } }, monedas: MONEDAS.repaso };
}

// terminarAsamblea(p, hoy, lunes, rec, edad): se termina la asamblea de hoy: guarda rec en asam[hoy] con done y la
// edad, borra las más antiguas (se quedan DIAS_DE_ASAMBLEA) y cuenta las terminadas desde el lunes de esta semana
// (lunes, 'AAAA-MM-DD'): con ASAMBLEAS_POR_SEMANA o más, la figurita de la semana, una sola vez por semana (first.wk).
// La primera asamblea terminada de cada día da además MONEDAS.asamblea. No cambia p ni rec.
export function terminarAsamblea(p: { readonly asam: Readonly<Record<string, DiaDeAsamblea>>; readonly first: Readonly<Record<string, number | boolean | string>> },
  hoy: string, lunes: string, rec: DiaDeAsamblea, edad: number): AsambleaTerminada {
  const primera = !p.asam[hoy]?.done;
  const deHoy: DiaDeAsamblea = { ...rec, done: 1, age: edad };
  const asam: Record<string, DiaDeAsamblea> = { ...p.asam, [hoy]: deHoy };
  // las claves son fechas 'AAAA-MM-DD': ordenadas como texto, las primeras son las más antiguas
  const dias = Object.keys(asam).sort();
  for (const d of dias.slice(0, Math.max(0, dias.length - DIAS_DE_ASAMBLEA))) delete asam[d];
  const enLaSemana = Object.keys(asam).filter(k => k >= lunes && asam[k]?.done).length;
  const figurita = enLaSemana >= ASAMBLEAS_POR_SEMANA && p.first['wk'] !== lunes;
  return { partida: figurita ? { asam, first: { ...p.first, wk: lunes } } : { asam }, hoy: deHoy, figurita, monedas: primera ? MONEDAS.asamblea : 0 };
}
