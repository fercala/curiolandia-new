// Catálogo de frases (fase 5g de docs/PLAN-MIGRACION.md): saca del código de src/ cada texto que dice Tito o que se ve
// en el juego, con un identificador estable, y con eso se escribe dialogos/todos.csv (`npm run dialogos`). La prueba
// tests/unidad/dialogos.test.ts falla si todos.csv no está al día con el código.
// Lee el código con el analizador de rolldown (el de Vite) y decide qué literal es un texto mirando dónde está:
//   - Se quedan fuera las rutas de import, las claves (obj['k'], comparaciones, nombres de propiedad), los argumentos
//     de las funciones que no reciben textos (NO_TEXTO: dibujar, colores, DOM...), los colores y tamaños de letra, y
//     los dibujos (src/dibujos/) y la zona de adultos (HTML para los mayores, no es diálogo de Tito).
//   - Una palabra suelta en minúsculas ('nene', 'map') casi siempre es una clave: solo cuenta si va donde se pone un
//     texto (una propiedad de PROPS_TEXTO, una tabla de TABLAS_TEXTO o el texto de say() o text()).
// Cada texto sale una vez, con su tipo (frase entera, trozo de una frase que se compone, nombre de un dibujo o inglés)
// y dónde está (los archivos, sin la línea: así el catálogo solo cambia cuando cambian los textos, no al mover código).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseSync } from 'rolldown/utils';

/** Un nodo del árbol de sintaxis (ESTree): tipo, posición y el resto de campos según el tipo. */
interface Nodo {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly [campo: string]: unknown;
}

/** Una fila del catálogo: id (md5 del texto, 12 letras), texto, tipo y dónde aparece. */
export interface Frase {
  readonly id: string;
  readonly texto: string;
  readonly tipo: 'frase' | 'trozo' | 'nombre' | 'inglés';
  readonly donde: readonly string[];
}

// Carpetas y archivos de src/ que no tienen diálogos: los dibujos y la zona de adultos.
const FUERA = ['dibujos', join('aplicacion', 'adultos.ts')];
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
function esNodo(x: unknown): x is Nodo {
  return typeof x === 'object' && x !== null && typeof (x as { type?: unknown }).type === 'string';
}

// hijosDe(n): todos los nodos hijos de n, en el orden del código.
function hijosDe(n: Nodo): Nodo[] {
  const r: Nodo[] = [];
  for (const [k, v] of Object.entries(n)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    if (Array.isArray(v)) r.push(...v.filter(esNodo));
    else if (esNodo(v)) r.push(v);
  }
  return r;
}

// nombreDe(n): el nombre de un identificador, de una propiedad (x.nombre) o de una clave literal; '' si no tiene.
function nombreDe(n: unknown): string {
  if (!esNodo(n)) return '';
  if (n.type === 'Identifier') return String(n['name']);
  if (n.type === 'MemberExpression') return nombreDe(n['property']);
  if (n.type === 'Literal') return String(n['value']);
  return '';
}

// archivos(dir): los .ts de dir (y subcarpetas), salvo los de FUERA, ordenados para que el catálogo sea estable.
function archivos(src: string, dir = src): string[] {
  const r: string[] = [];
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    if (FUERA.includes(relative(src, p))) continue;
    if (statSync(p).isDirectory()) r.push(...archivos(src, p));
    else if (p.endsWith('.ts') && !p.endsWith('.d.ts')) r.push(p);
  }
  return r;
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
const pareceClave = (t: string): boolean => /^[\p{Ll}\d_][\p{L}\d_:.\-/]*$/u.test(t) || t.trim().length < 2;
// noEsTexto(t): colores, tamaños de letra, unidades, trozos de HTML, SVG o CSS, idiomas de las voces ('es-ES') e ids de
// temas y juegos ('3A-T1', 'EN-HELLO', 'F-libro#2').
const noEsTexto = (t: string): boolean => /rgba?\(|hsla?\(|^#[\da-f]{3,8}$|\d(px|em|%)\b|^\s*px\s*$|=\s*$|="|<\/?[a-z]|^[\w-]+:[\w#-]+;?$/iu.test(t)
  || /^[a-z]{2}(-[A-Z\d]{2,3})?$|^\d?[A-Z]+-[\w#-]+$|^\d+D$/u.test(t);
// esFrase(t): una frase entera: empieza en mayúscula (o con ¡ ¿) y acaba en . ! ? o …
const esFrase = (t: string): boolean => /^[¡¿"«]*\p{Lu}.*[.!?…»"]$/su.test(t.trim());

// tipoDe(t, camino): el tipo de un texto del catálogo.
function tipoDe(t: string, camino: readonly Nodo[]): Frase['tipo'] {
  if (t.startsWith('@')) return 'inglés';
  if (camino.some((p) => (p.type === 'VariableDeclarator' && nombreDe(p['id']) === 'LEX') || (p.type === 'CallExpression' && nombreDe(p['callee']) === 'assign' && nombreDe((p['arguments'] as unknown[])[0]) === 'LEX'))) return 'nombre';
  return esFrase(t) ? 'frase' : 'trozo';
}

/** catalogo(raiz): las frases del código de raiz/src, en el orden en que aparecen por primera vez. */
export function catalogo(raiz: string): Frase[] {
  const src = join(raiz, 'src');
  const porTexto = new Map<string, { tipo: Frase['tipo']; donde: string[] }>();
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
        if (vale) {
          const fila = porTexto.get(t) ?? { tipo: tipoDe(t, camino), donde: [] };
          if (fila.donde.length < DONDE_MAX && !fila.donde.includes(rel)) fila.donde.push(rel);
          porTexto.set(t, fila);
        }
        return;
      }
      for (const h of hijosDe(n)) visita(h, [n, ...camino]);
    };
    visita(ast, []);
  }
  return [...porTexto].map(([texto, { tipo, donde }]) => ({ id: createHash('md5').update(texto).digest('hex').slice(0, LARGO_ID), texto, tipo, donde }));
}

// campoCsv(v): un campo del CSV, entre comillas si lleva coma, comillas o salto de línea.
const campoCsv = (v: string): string => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** csv(frases): el texto de dialogos/todos.csv: cabecera id,texto,tipo,donde y una fila por frase. */
export function csv(frases: readonly Frase[]): string {
  return ['id,texto,tipo,donde', ...frases.map((f) => [f.id, f.texto, f.tipo, f.donde.join(' ')].map(campoCsv).join(','))].join('\n') + '\n';
}
