/*
 * aplicacion/abrirCofre.ts: los casos de uso del cofre del tesoro (fase 4l de docs/PLAN-MIGRACION.md): lo que cambia en
 * la partida al ganar el cofre de un tema (ganarCofre) y al abrirlo (abrirCofre). Antes estaba repartido entre el enter
 * y el reward de la escena del cofre (escenas/zonas.ts) y cofrePend, que entrega al arrancar los cofres que se quedaron
 * sin abrir y repetía lo de reward a mano.
 * No cambian la partida que reciben ni dibujan, hablan o guardan: devuelven los campos nuevos de la partida. Quien llama
 * los pone en S y hace lo de pantalla: la escena del cofre (escenas/zonas.ts) y cofrePend, en el mismo archivo. El
 * regalo (el artículo de la tienda) lo sigue dando grantGift (escenas/zonas.ts), porque ponérselo a Tito o colocarlo en
 * su casa son cosas de la tienda; las monedas, giveCoins (con la animación) o ganar (sin ella).
 * Pruebas: tests/unidad/abrirCofre.test.ts (sin navegador: cada prueba inventa la partida).
 * Exporta: los tipos PartidaDelCofre y CofreAbierto y los casos de uso ganarCofre, abrirCofre y sinPendiente.
 * Importa: solo la regla de las monedas del cofre (monedasDelCofre, de dominio/monedas.ts).
 */
import { monedasDelCofre } from '../dominio/monedas.ts';

/** Lo que el cofre mira y cambia de la partida (S). */
export interface PartidaDelCofre {
  /** Cuántos cofres ha ganado (S.cofres; si falta, 0). */
  readonly cofres?: number;
  /** Cofres ganados sin abrir aún, por id del tema (S.cofreP): si se cierra el juego, se entregan al arrancar. */
  readonly cofreP?: Readonly<Record<string, number>>;
  /** Figuritas del álbum: cuántas de cada una (S.stk). */
  readonly stk: Readonly<Record<string, number>>;
}

/** Lo que devuelve abrirCofre: los campos nuevos de la partida y las monedas que da (las suma quien llama). */
export interface CofreAbierto {
  readonly partida: { readonly cofreP: Record<string, number>; readonly stk: Record<string, number> };
  readonly monedas: number;
}

// sinPendiente(cofreP, id): los cofres pendientes sin el del tema id (un objeto nuevo; no cambia cofreP).
export function sinPendiente(cofreP: Readonly<Record<string, number>> | undefined, id: string): Record<string, number> {
  const { [id]: _quitado, ...resto } = cofreP ?? {};
  return resto;
}

// ganarCofre(p, id): el niño acaba de terminar el tema id y gana su cofre: uno más en cofres y el cofre apuntado como
// pendiente (cofreP[id] = 1) hasta que se abra. Devuelve los dos campos nuevos; no cambia p.
export function ganarCofre(p: PartidaDelCofre, id: string): { cofres: number; cofreP: Record<string, number> } {
  return { cofres: (p.cofres || 0) + 1, cofreP: { ...p.cofreP, [id]: 1 } };
}

// abrirCofre(p, id, icono, conRegalo): se abre el cofre del tema id (o se entrega sin abrir): deja de estar pendiente
// y da la figurita del tema (una más de icono en stk). Devuelve esos campos nuevos y las monedas del cofre
// (monedasDelCofre: menos si trae regalo). El regalo lo da quien llama (grantGift). No cambia p.
export function abrirCofre(p: PartidaDelCofre, id: string, icono: string, conRegalo: boolean): CofreAbierto {
  const stk = { ...p.stk, [icono]: (p.stk[icono] || 0) + 1 };
  return { partida: { cofreP: sinPendiente(p.cofreP, id), stk }, monedas: monedasDelCofre(conRegalo) };
}
