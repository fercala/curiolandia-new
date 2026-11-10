/*
 * nucleo/traducir.ts: la traducción de lo que el juego dice y escribe (fase ID1 de docs/PLAN-IDIOMAS.md).
 * El código está escrito en castellano; tr(texto) da ese texto en el idioma con el que se juega (IDIOMA), buscándolo en
 * la tabla del idioma (src/idiomas/). Se traduce en los pocos sitios por donde sale todo: say() y sayTTS() (voz.ts),
 * text() (dibujo.ts) y el HTML de las ventanas y de la zona de adultos (trHtml). En castellano tr no hace nada.
 * Lo que no está en la tabla sale en castellano y se apunta en sinTraducir (las pruebas lo leen en window.__cl).
 * Cambiar de idioma guarda la partida y recarga la página (ponIdioma): así no quedan tablas ni rótulos a medio traducir.
 * Exporta: IDIOMA, sinTraducir, iniciarIdioma, tr, trHtml, ponIdioma.
 * Importa: S y save (guardado.ts), las reglas de dominio/idiomas.ts y las tablas de src/idiomas/.
 */
import { S, save } from './guardado.ts';
import {
  IDIOMA_BASE,
  PARAMETRO_IDIOMA,
  idioma,
  idiomaActivo,
  idiomaDelNavegador,
  pseudo,
  type IdIdioma,
  type IdiomaGuardado,
} from '../dominio/idiomas.ts';
import { TEXTOS_RO } from '../idiomas/ro/textos.ts';

// TABLAS: la tabla de cada idioma que tiene (el castellano no la necesita y el pseudoidioma se calcula).
const TABLAS: Partial<Record<IdIdioma, Readonly<Record<string, string>>>> = { ro: TEXTOS_RO };
// Atributos del HTML que se leen o que dice el lector de pantalla: también se traducen.
const ATRIBUTOS = ['title', 'aria-label', 'placeholder', 'alt'] as const;
// Las etiquetas cuyo texto no se traduce: código, estilos y lo que escribe quien juega.
const SIN_TRADUCIR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);

/** El idioma con el que se juega. Lo pone iniciarIdioma() al arrancar y no cambia hasta recargar. */
export let IDIOMA: IdIdioma = IDIOMA_BASE;
/** Los textos que se han pedido en otro idioma y no tienen traducción (sin repetir). */
export const sinTraducir = new Set<string>();
// Los nodos de texto ya traducidos por trHtml: si se vuelve a pasar por la misma página, no se traducen dos veces.
const hechos = new WeakSet<Node>();

// iniciarIdioma(): decide el idioma al arrancar (aplicacion/arranque.ts), con idiomaActivo: el de la dirección
// (?idioma=ro), el guardado o, la primera vez, el del navegador. La primera vez se guarda en S.idioma el del navegador
// (el de la dirección no se guarda nunca: es para probar). Pone el lang de la página. Mira si hay location, navigator y
// documentElement: en las pruebas que cargan el juego en node:vm pueden faltar.
export function iniciarIdioma(): void {
  const parametro = parametroIdioma(typeof location === 'object' && location ? location.search || '' : '');
  const nav = typeof navigator === 'object' && navigator ? navigator : null;
  const langs = nav?.languages?.length ? nav.languages : [nav?.language || IDIOMA_BASE];
  IDIOMA = idiomaActivo(S.idioma, parametro, langs);
  if (!S.idioma) {
    S.idioma = idiomaDelNavegador(langs);
    save();
  }
  if (document.documentElement) document.documentElement.lang = idioma(IDIOMA).lang.split('-')[0] ?? IDIOMA_BASE;
}

// parametroIdioma(busqueda): el valor de ?idioma= en la parte de búsqueda de la dirección, o null. Sin URLSearchParams,
// para que funcione también en las pruebas que cargan el juego en node:vm.
function parametroIdioma(busqueda: string): string | null {
  // El parámetro idioma con su valor: casa '?idioma=ro' y '?x=1&idioma=xx' (da 'ro', 'xx'); no casa '?midioma=ro'.
  const m = new RegExp(`[?&]${PARAMETRO_IDIOMA}=([^&#]*)`, 'u').exec(busqueda);
  return m ? decodeURIComponent(m[1] ?? '') : null;
}

// tr(t): el texto t (en castellano) en el idioma con el que se juega. En castellano, el mismo; en el pseudoidioma,
// marcado con pseudo(); en otro idioma, el de su tabla o, si no lo tiene, el castellano (y se apunta en sinTraducir).
// No se traducen nunca: lo que empieza por @, que es inglés (Polly, la Isla del Inglés), lo que no tiene letras (números,
// signos) ni las letras sueltas (las de la Isla de las Letras, las del título que se pinta letra a letra).
export function tr(t: string): string {
  if (IDIOMA === IDIOMA_BASE || t.trim().length < 2 || t.startsWith('@') || !/\p{L}/u.test(t)) return t;
  if (IDIOMA === 'xx') return pseudo(t);
  const r = TABLAS[IDIOMA]?.[t];
  if (r !== undefined) return r;
  sinTraducir.add(t);
  return t;
}

// trTrozo(t): tr de un texto con espacios alrededor (los del HTML): traduce lo de dentro y deja los espacios.
function trTrozo(t: string): string {
  const dentro = t.trim();
  if (!dentro) return t;
  const i = t.indexOf(dentro);
  return t.slice(0, i) + tr(dentro) + t.slice(i + dentro.length);
}

// trHtml(raiz): traduce el HTML de raiz (una ventana de head.html o una página de la zona de adultos) después de
// pintarlo: cada nodo de texto y los ATRIBUTOS que se leen. Los nodos ya traducidos se saltan (hechos) y los atributos
// se marcan con data-tr. En castellano no hace nada.
export function trHtml(raiz: ParentNode): void {
  if (IDIOMA === IDIOMA_BASE) return;
  const paseo = document.createTreeWalker(raiz as Node, NodeFilter.SHOW_TEXT);
  for (let n = paseo.nextNode(); n; n = paseo.nextNode()) {
    if (hechos.has(n) || SIN_TRADUCIR.has(n.parentElement?.tagName ?? '')) continue;
    hechos.add(n);
    n.nodeValue = trTrozo(n.nodeValue ?? '');
  }
  raiz.querySelectorAll<HTMLElement>(ATRIBUTOS.map((a) => `[${a}]:not([data-tr])`).join(',')).forEach((el) => {
    el.dataset['tr'] = '1';
    ATRIBUTOS.forEach((a) => {
      const v = el.getAttribute(a);
      if (v) el.setAttribute(a, trTrozo(v));
    });
  });
}

// ponIdioma(id): cambia el idioma de la partida (desde la zona de adultos), lo guarda y recarga la página para que todo
// salga ya en el idioma nuevo. Si se jugaba con ?idioma= en la dirección, se quita (si no, mandaría ese).
export function ponIdioma(id: IdiomaGuardado): void {
  S.idioma = id;
  save();
  const u = new URL(location.href);
  u.searchParams.delete(PARAMETRO_IDIOMA);
  location.replace(u.href);
}
