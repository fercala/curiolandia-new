// Catálogo de frases (fase 5g de docs/PLAN-MIGRACION.md): saca del código de src/ cada texto que dice Tito o que se ve
// en el juego, con un identificador estable, y con eso se escribe dialogos/todos.csv (`npm run dialogos`). La prueba
// tests/unidad/dialogos.test.ts falla si todos.csv no está al día con el código.
// Lee el código con el analizador de rolldown (el de Vite) y decide qué literal es un texto mirando dónde está:
//   - Se quedan fuera las rutas de import, las claves (obj['k'], comparaciones, nombres de propiedad), los argumentos
//     de las funciones que no reciben textos (NO_TEXTO: dibujar, colores, DOM...), los colores y tamaños de letra, y
//     los dibujos (src/dibujos/).
//   - La zona de adultos (src/aplicacion/adultos.ts y su carpeta) y las ventanas de src/head.html no son diálogo de
//     Tito, pero se ven y hay que traducirlas (fase ID0 de docs/PLAN-IDIOMAS.md): salen al final, con el tipo
//     'adultos', y de su HTML se sacan los textos que se leen (entre etiquetas y en title, aria-label, placeholder y alt).
//   - Una palabra suelta en minúsculas ('nene', 'map') casi siempre es una clave: solo cuenta si va donde se pone un
//     texto (una propiedad de PROPS_TEXTO, una tabla de TABLAS_TEXTO o el texto de say() o text()).
// Cada texto sale una vez, con su tipo (frase entera, trozo de una frase que se compone, nombre de un dibujo o inglés)
// y dónde está (los archivos, sin la línea: así el catálogo solo cambia cuando cambian los textos, no al mover código).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseSync } from 'rolldown/utils';

/** Un nodo del árbol de sintaxis (ESTree): tipo, posición y el resto de campos según el tipo. */
export interface Nodo {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly [campo: string]: unknown;
}

/** Una fila del catálogo: id (md5 del texto, 12 letras), texto, tipo y dónde aparece. */
export interface Frase {
  readonly id: string;
  readonly texto: string;
  readonly tipo: 'frase' | 'trozo' | 'nombre' | 'inglés' | 'adultos';
  readonly donde: readonly string[];
}

// Carpetas y archivos de src/ que no tienen diálogos: los dibujos y la zona de adultos (desde la fase A1 de
// docs/PLAN-MENU-ADULTOS.md, adultos.ts y su carpeta). La zona de adultos se lee aparte (ADULTOS), con el tipo 'adultos'.
const ADULTOS = [join('aplicacion', 'adultos.ts'), join('aplicacion', 'adultos')];
// Tampoco las tablas de los otros idiomas (src/idiomas/), los nombres de los idiomas (dominio/idiomas.ts) ni el código
// que traduce (nucleo/traducir.ts), desde la fase ID1 de docs/PLAN-IDIOMAS.md: no se traducen.
export const FUERA = ['dibujos', 'idiomas', join('dominio', 'idiomas.ts'), join('nucleo', 'traducir.ts'), ...ADULTOS];
// Atributos del HTML cuyo valor se lee (o lo dice el lector de pantalla): también hay que traducirlos.
const ATRIBUTOS_TEXTO = /\b(?:title|aria-label|placeholder|alt)="([^"]*)"/g;
// Entidades del HTML que salen en los textos de la zona de adultos y de head.html.
const ENTIDADES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ', apos: "'" };
// Funciones cuyos argumentos nunca son textos del juego: dibujo, colores, sonido, DOM, errores y depuración.
const NO_TEXTO = new Set(['circ', 'card', 'ell', 'rr', 'fillStroke', 'pic', 'picG', 'thing', 'nameT', 'W_', 'Wn', 'dela', 'ala',
  'esta', 'eseEs', 'isPl', 'tree', 'flower', 'cloud', 'sky', 'star', 'go', 'later', 'playSound', 'playTune', 'getElementById',
  'querySelector', 'querySelectorAll', 'createElement', 'addEventListener', 'removeEventListener', 'getItem', 'setItem',
  'removeItem', 'load', 'encodeURIComponent', 'RegExp', 'Error', 'TypeError', 'RangeError', 'log', 'warn', 'error', 'getContext', 'fetch', 'postMessage',
  'createLinearGradient', 'createRadialGradient', 'addColorStop', 'M', 'mat', 'gcache', 'canvasTex', 'pillTex', 'svgImg', 'mk']);
// Propiedades cuyo valor es un texto (aunque sea una palabra suelta en minúsculas: n:'rojo').
const PROPS_TEXTO = new Set(['say', 'q', 'okSay', 'badSay', 'intro', 'ask', 'ask2', 'okAll', 'why', 'placeSay', 'n', 'n2', 'name',
  'label', 'title', 'tip', 'es', 'en', 'nm', 'txt', 's']);
// Tablas de textos: sus valores son textos aunque sean una palabra suelta (los días, los meses, los nombres de LEX...).
const TABLAS_TEXTO = new Set(['LEX', 'ONO', 'GNAME', 'DIASL', 'MESES', 'NUM', 'EMO_SAY', 'EMO_TIP', 'PET_SAY', 'DLYR', 'PRAISE']);
// Funciones cuyo primer argumento es el texto que se dice o se escribe.
const DICE = new Set(['say', 'sayQ', 'say3', 'sayMix', 'sayMix3', 'text']);
// Operadores que comparan: sus literales son claves, no textos.
const COMPARA = new Set(['===', '!==', '==', '!=', 'in', 'instanceof']);
// Cuántos archivos se apuntan en la columna donde (para que el CSV no crezca sin fin con los textos repetidos).
const DONDE_MAX = 3;
// Largo del id: las 12 primeras letras del md5 del texto (como en curiolandia-3d).
const LARGO_ID = 12;

// esNodo(x): true si x es un nodo del árbol (objeto con type).
export function esNodo(x: unknown): x is Nodo {
  return typeof x === 'object' && x !== null && typeof (x as { type?: unknown }).type === 'string';
}

// hijosDe(n): todos los nodos hijos de n, en el orden del código.
export function hijosDe(n: Nodo): Nodo[] {
  const r: Nodo[] = [];
  for (const [k, v] of Object.entries(n)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    if (Array.isArray(v)) r.push(...v.filter(esNodo));
    else if (esNodo(v)) r.push(v);
  }
  return r;
}

// nombreDe(n): el nombre de un identificador, de una propiedad (x.nombre) o de una clave literal; '' si no tiene.
export function nombreDe(n: unknown): string {
  if (!esNodo(n)) return '';
  if (n.type === 'Identifier') return String(n['name']);
  if (n.type === 'MemberExpression') return nombreDe(n['property']);
  if (n.type === 'Literal') return String(n['value']);
  return '';
}

// archivos(src, dir, fuera): los .ts de dir (y subcarpetas), salvo los de fuera (rutas desde src), ordenados para que
// el catálogo sea estable. Si dir es un archivo, solo ese.
export function archivos(src: string, dir = src, fuera: readonly string[] = FUERA): string[] {
  if (!statSync(dir).isDirectory()) return [dir];
  const r: string[] = [];
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    if (fuera.includes(relative(src, p))) continue;
    if (statSync(p).isDirectory()) r.push(...archivos(src, p, fuera));
    else if (p.endsWith('.ts') && !p.endsWith('.d.ts')) r.push(p);
  }
  return r;
}

// sinEntidades(t): t con las entidades del HTML (&amp; &nbsp; &#8212;...) cambiadas por su letra.
const sinEntidades = (t: string): string =>
  t.replace(/&(#x?[\da-f]+|\w+);/giu, (e, n: string) => {
    if (n.startsWith('#')) return String.fromCodePoint(n[1]?.toLowerCase() === 'x' ? parseInt(n.slice(2), 16) : Number(n.slice(1)));
    return ENTIDADES[n] ?? e;
  });

// textosHtml(t): los textos que se leen de un trozo de HTML: los valores de ATRIBUTOS_TEXTO y lo que hay entre
// etiquetas, sin <style> ni <script>, con los espacios juntados. Si t no lleva etiquetas, es él mismo.
function textosHtml(t: string): string[] {
  if (!/<\/?[a-z]/iu.test(t)) return [t];
  const limpio = t.replace(/<(style|script)\b[\s\S]*?<\/\1>/giu, ' ');
  const r = [...limpio.matchAll(ATRIBUTOS_TEXTO)].map((m) => m[1] ?? '');
  // Entre etiquetas; un trozo que empieza o acaba a medio abrir una etiqueta (en una plantilla con huecos) se corta ahí.
  for (const trozo of limpio.replace(/<[^>]*>/gu, '\uE000').replace(/^[^<\uE000]*>|<[^>]*$/gu, '\uE000').split('\uE000')) r.push(trozo);
  return r.map((x) => sinEntidades(x).replace(/\s+/gu, ' ').trim()).filter((x) => x !== '');
}

/** Cómo es un literal según dónde está: fuera (no es texto), texto, o palabra suelta que es texto solo en su sitio. */
type Sitio = 'fuera' | 'texto' | 'textoSiempre';

// sitio(camino): mira los antepasados del literal (camino, del más cercano al más lejano) y dice si está donde va un
// texto. Sube mientras el texto se pueda estar componiendo (+, ?:, ||, plantillas, listas, paréntesis, as).
function sitio(camino: readonly Nodo[]): Sitio {
  let hijo = camino[0];
  for (const p of camino.slice(1)) {
    switch (p.type) {
      case 'ImportDeclaration': case 'ExportNamedDeclaration': case 'ExportAllDeclaration': case 'ImportExpression':
      case 'SwitchCase': case 'TSLiteralType': case 'TSPropertySignature':
        return 'fuera';
      case 'MemberExpression':
        return 'fuera'; // obj['clave'] o 'texto'.metodo(): las claves no son textos
      case 'BinaryExpression':
        if (COMPARA.has(String(p['operator']))) return 'fuera';
        break;
      case 'Property':
        if (p['key'] === hijo) return 'fuera';
        return PROPS_TEXTO.has(nombreDe(p['key'])) ? 'textoSiempre' : 'texto';
      case 'CallExpression': case 'NewExpression': {
        if (p['callee'] === hijo) return 'texto';
        const f = nombreDe(p['callee']);
        if (NO_TEXTO.has(f)) return 'fuera';
        if (DICE.has(f) && (p['arguments'] as unknown[])[0] === hijo) return 'textoSiempre';
        if (f === 'assign' && TABLAS_TEXTO.has(nombreDe((p['arguments'] as unknown[])[0]))) return 'textoSiempre';
        return 'texto';
      }
      case 'VariableDeclarator':
        return TABLAS_TEXTO.has(nombreDe(p['id'])) ? 'textoSiempre' : 'texto';
      case 'ReturnStatement': case 'ExpressionStatement': case 'ArrowFunctionExpression': case 'AssignmentExpression':
        return 'texto';
      default:
        break;
    }
    hijo = p;
  }
  return 'texto';
}

// pareceClave(t): una palabra suelta que empieza en minúscula, sin espacios ni signos ('nene', 'hojaNaranja',
// 'emo:alegria'), o una sola letra.
export const pareceClave = (t: string): boolean => /^[\p{Ll}\d_][\p{L}\d_:.\-/]*$/u.test(t) || t.trim().length < 2;
// noEsTexto(t): colores, tamaños de letra, unidades, trozos de HTML, SVG o CSS, idiomas de las voces ('es-ES') e ids de
// temas y juegos ('3A-T1', 'EN-HELLO', 'F-libro#2').
export const noEsTexto = (t: string): boolean => /rgba?\(|hsla?\(|^#[\da-f]{3,8}$|\d(px|em|%)\b|^\s*px\s*$|=\s*$|="|<\/?[a-z]|^[\w-]+:[\w#-]+;?$/iu.test(t)
  || /^[a-z]{2}(-[A-Z\d]{2,3})?$|^\d?[A-Z]+-[\w#-]+$|^\d+D$/u.test(t);
// esFrase(t): una frase entera: empieza en mayúscula (o con ¡ ¿) y acaba en . ! ? o …
const esFrase = (t: string): boolean => /^[¡¿"«]*\p{Lu}.*[.!?…»"]$/su.test(t.trim());

// tipoDe(t, camino): el tipo de un texto del catálogo.
function tipoDe(t: string, camino: readonly Nodo[]): Frase['tipo'] {
  if (t.startsWith('@')) return 'inglés';
  if (camino.some((p) => (p.type === 'VariableDeclarator' && nombreDe(p['id']) === 'LEX') || (p.type === 'CallExpression' && nombreDe(p['callee']) === 'assign' && nombreDe((p['arguments'] as unknown[])[0]) === 'LEX'))) return 'nombre';
  return esFrase(t) ? 'frase' : 'trozo';
}

// textosAdultos(raiz, src): los textos de la zona de adultos (los .ts de ADULTOS) y de src/head.html, como pares
// [archivo, texto]. De cada literal con HTML salen los textos que se leen (textosHtml); un literal sin HTML cuenta si
// está donde va un texto y no parece una clave, un color o un trozo de CSS, como en el resto del catálogo.
function textosAdultos(raiz: string, src: string): [string, string][] {
  const r: [string, string][] = [];
  // mete(rel, t, s): apunta los textos de t que valen (s: el sitio del literal; los de head.html valen siempre).
  const mete = (rel: string, t: string, s: Sitio): void => {
    if (s === 'fuera') return;
    const html = /<\/?[a-z]/iu.test(t);
    for (const x of textosHtml(t)) {
      // Fuera también los selectores ('#a-reset', '.ad-card'), las entidades sueltas ('&amp;', de la función esc), las
      // consultas de CSS ('(prefers-reduced-motion: reduce)') y los prefijos del código de copia ('CURIO1.').
      if (/^[#.][\w-]+/u.test(x) || /^&#?\w+;$/u.test(x) || /^\(prefers-/u.test(x) || /^[A-Z]{3,}\d*\.?$/u.test(x)) continue;
      if (/\p{L}/u.test(x) && !noEsTexto(x) && (html || s === 'textoSiempre' || !pareceClave(x))) r.push([rel, x]);
    }
  };
  for (const f of ADULTOS.flatMap((a) => archivos(src, join(src, a), []))) {
    const rel = relative(raiz, f);
    // visita(n, camino): como en catalogo, pero cada literal pasa por mete.
    const visita = (n: Nodo, camino: Nodo[]): void => {
      if (n.type === 'Literal' && typeof n['value'] === 'string') return mete(rel, n['value'], sitio([n, ...camino]));
      if (n.type === 'TemplateElement') return mete(rel, String((n['value'] as { cooked?: string }).cooked ?? ''), sitio([n, ...camino]));
      for (const h of hijosDe(n)) visita(h, [n, ...camino]);
    };
    visita(parseSync(f, readFileSync(f, 'utf8')).program as unknown as Nodo, []);
  }
  const cabeza = join(src, 'head.html');
  mete(relative(raiz, cabeza), readFileSync(cabeza, 'utf8'), 'texto');
  return r;
}

/** catalogo(raiz): las frases del código de raiz/src, en el orden en que aparecen por primera vez. */
export function catalogo(raiz: string): Frase[] {
  const src = join(raiz, 'src');
  const porTexto = new Map<string, { tipo: Frase['tipo']; donde: string[] }>();
  // apunta(t, tipo, rel): añade el texto t (o un archivo más donde sale, hasta DONDE_MAX).
  const apunta = (t: string, tipo: Frase['tipo'], rel: string): void => {
    const fila = porTexto.get(t) ?? { tipo, donde: [] };
    if (fila.donde.length < DONDE_MAX && !fila.donde.includes(rel)) fila.donde.push(rel);
    porTexto.set(t, fila);
  };
  for (const f of archivos(src)) {
    const codigo = readFileSync(f, 'utf8');
    const ast = parseSync(f, codigo).program as unknown as Nodo;
    const rel = relative(raiz, f);
    // visita(n, camino): recorre el árbol; camino son los antepasados de n, el padre primero.
    const visita = (n: Nodo, camino: Nodo[]): void => {
      let t: string | null = null;
      if (n.type === 'Literal' && typeof n['value'] === 'string') t = n['value'];
      else if (n.type === 'TemplateElement') t = String((n['value'] as { cooked?: string }).cooked ?? '');
      if (t !== null) {
        const s = sitio([n, ...camino]);
        const vale = /\p{L}/u.test(t) && !noEsTexto(t) && s !== 'fuera' && (s === 'textoSiempre' || !pareceClave(t));
        if (vale) apunta(t, tipoDe(t, camino), rel);
        return;
      }
      for (const h of hijosDe(n)) visita(h, [n, ...camino]);
    };
    visita(ast, []);
  }
  for (const [rel, t] of textosAdultos(raiz, src)) apunta(t, 'adultos', rel);
  return [...porTexto].map(([texto, { tipo, donde }]) => ({ id: createHash('md5').update(texto).digest('hex').slice(0, LARGO_ID), texto, tipo, donde }));
}

// campoCsv(v): un campo del CSV, entre comillas si lleva coma, comillas o salto de línea.
const campoCsv = (v: string): string => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** csv(frases): el texto de dialogos/todos.csv: cabecera id,texto,tipo,donde y una fila por frase. */
export function csv(frases: readonly Frase[]): string {
  return ['id,texto,tipo,donde', ...frases.map((f) => [f.id, f.texto, f.tipo, f.donde.join(' ')].map(campoCsv).join(','))].join('\n') + '\n';
}
