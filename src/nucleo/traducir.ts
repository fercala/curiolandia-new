/*
 * nucleo/traducir.ts: la traducción de lo que el juego dice y escribe (fase ID1 de docs/PLAN-IDIOMAS.md).
 * El código está escrito en castellano; tr(texto) da ese texto en el idioma con el que se juega (IDIOMA), buscándolo en
 * la tabla del idioma (src/idiomas/). Se traduce en los pocos sitios por donde sale todo: say() y sayTTS() (voz.ts),
 * text() (dibujo.ts) y el HTML de las ventanas y de la zona de adultos (trHtml). En castellano tr no hace nada.
 * Lo que no está en la tabla sale en castellano y se apunta en sinTraducir (las pruebas lo leen en window.__cl).
 * Cambiar de idioma guarda la partida y recarga la página (ponIdioma): así no quedan tablas ni rótulos a medio traducir.
 * El idioma se decide al cargar este módulo (justo después de guardado.ts, antes que el resto del juego), así que las
 * tablas que se calculan al cargar (NUM, los días...) ya pueden salir en su idioma.
 * Desde la fase ID2: fmt(plantilla, huecos), para las frases con partes que cambian, y nombreEn(frase), las formas de
 * un nombre en el idioma del juego. Lo que ya sale traducido de fmt y de nombreEn se recuerda (yaTraducido), para que
 * say() y text() no lo vuelvan a traducir.
 * Desde la ID2b, juntar(...trozos): frases que se dicen seguidas, cada una ya traducida.
 * Desde la ID4 (el rumano): tr encuentra también un texto con un dibujo o signos delante («🏠 Resumen») o puntuación
 * detrás («iPhone o iPad:»), y hecho(html) y fmtHtml(plantilla, huecos) marcan un trozo de HTML ya traducido, para las
 * frases de la zona de adultos con números o negritas dentro, que trHtml ya no toca.
 * Exporta: IDIOMA, sinTraducir, iniciarIdioma, tr, fmt, juntar, nombreEn, hecho, fmtHtml, trHtml, ponIdioma.
 * Importa: S y save (guardado.ts), las reglas de dominio/idiomas.ts y las tablas de src/idiomas/.
 */
import { S, save } from './guardado.ts';
import {
  IDIOMA_BASE,
  PARAMETRO_IDIOMA,
  idioma,
  idiomaActivo,
  idiomaDelNavegador,
  formasEs,
  pseudo,
  rellena,
  type IdIdioma,
  type Nombre,
  type IdiomaGuardado,
} from '../dominio/idiomas.ts';
import { TEXTOS_RO } from '../idiomas/ro/textos.ts';
import { NOMBRES_RO } from '../idiomas/ro/nombres.ts';

// TABLAS: la tabla de cada idioma que tiene (el castellano no la necesita y el pseudoidioma se calcula).
const TABLAS: Partial<Record<IdIdioma, Readonly<Record<string, string>>>> = { ro: TEXTOS_RO };
// NOMBRES: los nombres con sus formas, de cada idioma que los tiene.
const NOMBRES: Partial<Record<IdIdioma, Readonly<Record<string, Nombre>>>> = { ro: NOMBRES_RO };
// Cuántos textos ya traducidos se recuerdan como mucho (yaTraducido): al pasar de aquí se empieza de cero.
const MAX_RECORDADOS = 2000;
// Atributos del HTML que se leen o que dice el lector de pantalla: también se traducen.
const ATRIBUTOS = ['title', 'aria-label', 'placeholder', 'alt'] as const;
// Las etiquetas cuyo texto no se traduce: código, estilos y lo que escribe quien juega.
const SIN_TRADUCIR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);

/** El idioma con el que se juega. Lo pone iniciarIdioma() al cargar este módulo y no cambia hasta recargar. */
export let IDIOMA: IdIdioma = IDIOMA_BASE;
/** Los textos que se han pedido en otro idioma y no tienen traducción (sin repetir). */
export const sinTraducir = new Set<string>();
// Los nodos de texto ya traducidos por trHtml: si se vuelve a pasar por la misma página, no se traducen dos veces.
const hechos = new WeakSet<Node>();
// Los textos que ya salen traducidos de fmt y de nombreEn: tr los deja como están.
const yaTraducido = new Set<string>();
// Atributo que marca el HTML ya traducido (hecho): trHtml no entra en él.
const HECHO = 'data-traducido';
// Un texto con un dibujo o signos delante y puntuación detrás: casa '🏠 Resumen' (delante '🏠 ', el texto 'Resumen') e
// 'iPhone o iPad:' (detrás ':'); lo de delante no lleva letras, números ni ¿ ¡ « (, que son parte de la frase.
const ENVOLTURA = /^([^\p{L}\p{N}¿¡«(]*)(.*?)([\s:.,;]*)$/u;

// iniciarIdioma(): decide el idioma al cargar este módulo, con idiomaActivo: el de la dirección
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
  if (typeof document === 'object' && document?.documentElement)
    document.documentElement.lang = idioma(IDIOMA).lang.split('-')[0] ?? IDIOMA_BASE;
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
  if (IDIOMA === IDIOMA_BASE || t.trim().length < 2 || t.startsWith('@') || !/\p{L}/u.test(t) || yaTraducido.has(t))
    return t;
  if (IDIOMA === 'xx') return pseudo(t);
  const tabla = TABLAS[IDIOMA],
    r = tabla?.[t];
  if (r !== undefined) return r;
  // si no está tal cual, se busca sin lo de delante (un dibujo, signos) ni la puntuación de detrás (desde la ID4)
  const m = ENVOLTURA.exec(t);
  const dentro = m?.[2] && (m[1] || m[3]) ? tabla?.[m[2]] : undefined;
  if (m && dentro !== undefined) return (m[1] ?? '') + dentro + (m[3] ?? '');
  // lo de dentro ya está traducido (un nombre con su punto: «Mărul.», desde la ID5b): se deja como está
  if (m?.[2] && (m[1] || m[3]) && yaTraducido.has(m[2])) return t;
  sinTraducir.add(t);
  return t;
}

// recuerda(t): apunta t como ya traducido (si se juega en otro idioma) y lo devuelve.
function recuerda(t: string): string {
  if (IDIOMA === IDIOMA_BASE) return t;
  if (yaTraducido.size >= MAX_RECORDADOS) yaTraducido.clear();
  yaTraducido.add(t);
  return t;
}

// fmt(plantilla, huecos): una frase con partes que cambian (fase ID2 de docs/PLAN-IDIOMAS.md): traduce la plantilla
// entera ('Tienes {n} monedas.') y después rellena sus huecos (rellena, de dominio/idiomas.ts). Los huecos ya van en el
// idioma del juego (números, nombres de nombreEn...). El resultado no se vuelve a traducir al decirlo o escribirlo.
export const fmt = (plantilla: string, huecos: Readonly<Record<string, string | number>>): string =>
  recuerda(rellena(tr(plantilla), huecos));

// juntar(...trozos): las frases trozos, ya traducidas (con tr o fmt), seguidas y separadas por un espacio; las vacías
// se saltan. Para cuando se dicen varias frases juntas y alguna depende de algo (un saludo, el nombre del tema...): cada
// una se traduce entera y el resultado no se vuelve a traducir. En castellano sale lo mismo que pegarlas con espacios.
export const juntar = (...trozos: readonly string[]): string => recuerda(trozos.filter(Boolean).join(' '));

// estaTraducido(t): true si t ya salió traducido (de fmt, juntar o nombreEn) y no hay que volver a traducirlo. En
// castellano, siempre false. Desde la ID5b, para que cap() (nucleo/voz.ts) conserve la marca al poner la mayúscula.
export const estaTraducido = (t: string): boolean => yaTraducido.has(t);

// nombreEn(frase): las formas (Nombre) del nombre frase, que es el nombre en castellano con su artículo ('el gato'), en
// el idioma del juego. En castellano salen de su artículo (formasEs); en el pseudoidioma, marcadas; en otro idioma, de su
// tabla (src/idiomas/ro/nombres.ts) o, si no está, en castellano (y la frase se apunta en sinTraducir).
export function nombreEn(frase: string): Nombre {
  const es = formasEs(frase);
  if (IDIOMA === IDIOMA_BASE) return es;
  const n: Nombre =
    IDIOMA === 'xx'
      ? { ...es, art: pseudo(es.art), sin: pseudo(es.sin), de: pseudo(es.de), a: pseudo(es.a) }
      : (NOMBRES[IDIOMA]?.[frase] ?? (sinTraducir.add(frase), es));
  [n.art, n.sin, n.de, n.a, n.plu ?? ''].forEach((f) => f && recuerda(f));
  return n;
}

// hecho(html): el trozo de HTML html, que ya está traducido (con tr o fmt), marcado para que trHtml no lo vuelva a
// traducir (desde la fase ID4). En castellano, el mismo html, sin marca: la página queda igual que antes.
export const hecho = (html: string): string => (IDIOMA === IDIOMA_BASE ? html : `<span ${HECHO}>${html}</span>`);

// fmtHtml(plantilla, huecos): fmt para el HTML de la zona de adultos: la frase con sus huecos (que pueden llevar HTML,
// como un número en negrita) ya traducida y marcada con hecho. Los huecos con palabras se traducen antes, con tr o fmt.
export const fmtHtml = (plantilla: string, huecos: Readonly<Record<string, string | number>>): string =>
  hecho(fmt(plantilla, huecos));

// trTrozo(t): tr de un texto con espacios alrededor (los del HTML): traduce lo de dentro y deja los espacios.
function trTrozo(t: string): string {
  const dentro = t.trim();
  if (!dentro) return t;
  const i = t.indexOf(dentro);
  return t.slice(0, i) + tr(dentro) + t.slice(i + dentro.length);
}

// trHtml(raiz): traduce el HTML de raiz (una ventana de head.html o una página de la zona de adultos) después de
// pintarlo: cada nodo de texto y los ATRIBUTOS que se leen. Los nodos ya traducidos se saltan (hechos) y los atributos
// se marcan con data-tr; lo marcado con hecho() (desde la ID4) no se toca. En castellano no hace nada.
export function trHtml(raiz: ParentNode): void {
  if (IDIOMA === IDIOMA_BASE) return;
  const paseo = document.createTreeWalker(raiz as Node, NodeFilter.SHOW_TEXT);
  for (let n = paseo.nextNode(); n; n = paseo.nextNode()) {
    if (hechos.has(n) || SIN_TRADUCIR.has(n.parentElement?.tagName ?? '') || n.parentElement?.closest(`[${HECHO}]`))
      continue;
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

// Se decide el idioma al cargar el módulo (ver la cabecera).
iniciarIdioma();
