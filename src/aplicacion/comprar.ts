/*
 * aplicacion/comprar.ts: el caso de uso «comprar en la tienda» (fase 4m de docs/PLAN-MIGRACION.md): lo que cambia en la
 * partida al comprar un artículo o un vale. Antes estaba escrito a mano en buy, de la escena de la tienda
 * (escenas/tienda.ts), que ahora lo llama.
 * No cambia la partida que recibe ni dibuja, habla o guarda: devuelve los campos nuevos. Quien llama gasta las monedas
 * con spendCoins (que las anima saliendo del marcador), pone los campos en S, guarda y, si es un artículo, se lo pone a
 * Tito (wear) o lo coloca en su casa (placeHome), que son cosas de la tienda.
 * Pruebas: tests/unidad/comprar.test.ts (sin navegador: cada prueba inventa la partida).
 * Exporta: los tipos PartidaDeCompra, ArticuloEnVenta y Compra y el caso de uso comprar.
 * Importa: solo el tipo Vale (nucleo/tipos.ts).
 */
import type { Vale } from '../nucleo/tipos.ts';

/** Lo que la compra mira y cambia de la partida (S). */
export interface PartidaDeCompra {
  /** Los vales que ha puesto la familia, con si se ofrecen (S.vales). */
  readonly vales?: readonly (Vale | null | undefined)[];
  /** Los vales comprados, para que un adulto los canjee (S.valesLog). */
  readonly valesLog?: readonly Vale[];
  /** Los artículos que ya son del niño (S.owned). */
  readonly owned?: Readonly<Record<string, number>>;
}

/** Lo que la compra necesita del artículo: su id y, si es un vale, el vale. */
export interface ArticuloEnVenta {
  readonly id: string;
  readonly vale?: Vale;
}

/** El resultado de comprar: 'desactivado' (un vale que ya no se ofrece: no se compra ni se cobra), 'vale' (con el
 * valesLog nuevo) o 'articulo' (con el owned nuevo). */
export type Compra =
  | { readonly tipo: 'desactivado' }
  | { readonly tipo: 'vale'; readonly partida: { readonly valesLog: Vale[] } }
  | { readonly tipo: 'articulo'; readonly partida: { readonly owned: Record<string, number> } };

// comprar(p, it, hoy): compra el artículo it. Un vale que un adulto desactivó o borró (mientras se preguntaba si
// comprarlo) ya no se vende: 'desactivado'. Un vale se apunta en valesLog con la fecha de hoy y sin dar (given 0);
// lo demás pasa a ser del niño (owned). Las monedas las gasta quien llama. No cambia p.
export function comprar(p: PartidaDeCompra, it: ArticuloEnVenta, hoy: string): Compra {
  const vale = it.vale;
  if (vale) {
    if (!(p.vales || []).some(v => v && v.id === vale.id && v.on)) return { tipo: 'desactivado' };
    return { tipo: 'vale', partida: { valesLog: [...(p.valesLog || []), { id: vale.id, txt: vale.txt, d: hoy, given: 0 }] } };
  }
  return { tipo: 'articulo', partida: { owned: { ...p.owned, [it.id]: 1 } } };
}
