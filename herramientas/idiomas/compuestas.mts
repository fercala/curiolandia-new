// Lista de lo que hay que cambiar en el código para poder traducir el juego (fase ID0 de docs/PLAN-IDIOMAS.md): las
// frases que se componen pegando trozos y los trucos de gramática castellana. Es la lista de trabajo de la fase ID2.
// Uso: npm run idiomas:compuestas (resumen por archivo) o npm run idiomas:compuestas -- --todo (cada sitio, con su línea).
//   - Frase compuesta: un `'texto ' + algo` o una plantilla `` `texto ${algo}` `` con al menos un trozo de texto (lo que el
//     catálogo de dialogos/todos.csv también contaría como texto). Se cuenta la de más fuera: 'a' + x + 'b' es una.
//   - Truco de gramática: una llamada a las funciones que adivinan el artículo, el género o el número por el texto en
//     castellano (TRUCOS), una expresión regular que mira los artículos (/^(el|la|los|las) /...) o un replace que arregla
//     la gramática (' de el ' → ' del ', 'Cuántos' → 'Cuántas').
// Lee src/ menos los dibujos y la zona de adultos (FUERA del catálogo): la zona de adultos tiene sus propias plantillas
// de HTML, que se traducen en la fase ID3.
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseSync } from 'rolldown/utils';
import { archivos, hijosDe, noEsTexto, nombreDe, pareceClave, type Nodo } from '../dialogos/catalogo.mts';

// Funciones que adivinan la gramática por el texto en castellano. Desde la fase ID2a, dela, ala, isPl, fem, esta y eseEs
// (nucleo/idioma.ts y juegos/comps.ts) ya miran las formas del nombre en el idioma del juego: no son trucos.
const TRUCOS = new Set<string>([]);
// Una expresión regular que mira los artículos del castellano.
const REGEX_ARTICULO = /\b(el|la|los|las|l\[ao\]s?|l\[oa\]s?|un|una)\b/u;
// Un replace que arregla la gramática del texto: contracciones (de el, a el) o género (Cuántos/Cuántas...).
const REPLACE_GRAMATICA = /\b(de el|a el|Cuántos|Cuántas|abiertos|abiertas|un|una|el|la)\b/u;

/** Un sitio que hay que cambiar: archivo, línea, tipo y el código (en una línea, recortado). */
export interface Sitio {
  readonly archivo: string;
  readonly linea: number;
  readonly tipo: 'compuesta' | 'truco';
  readonly codigo: string;
}

// LARGO_CODIGO: cuántas letras del código se enseñan de cada sitio.
const LARGO_CODIGO = 110;

// esTexto(n): true si n es un literal (o un trozo de plantilla) que el catálogo contaría como texto del juego.
function esTexto(n: Nodo): boolean {
  let t: string | null = null;
  if (n.type === 'Literal' && typeof n['value'] === 'string') t = n['value'];
  else if (n.type === 'TemplateElement') t = String((n['value'] as { cooked?: string }).cooked ?? '');
  // Fuera también el inglés de Polly y Tito ('@Touch the ', no se traduce), las direcciones de datos y de CSS y la
  // medida de FPS de la casa 3D de prueba.
  if (t === null || t.startsWith('@') || /^data:|url\(|\bFPS\b/u.test(t)) return false;
  return /\p{L}/u.test(t) && !noEsTexto(t) && !pareceClave(t.trim());
}

// llevaTexto(n): true si n o algo dentro de n (sin entrar en funciones) es un texto del juego.
function llevaTexto(n: Nodo): boolean {
  if (esTexto(n)) return true;
  if (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') return false;
  return hijosDe(n).some(llevaTexto);
}

// textoDelPrincipio(n): el primer trozo de texto de una suma o una plantilla ('' si empieza por otra cosa).
function textoDelPrincipio(n: Nodo): string {
  if (n.type === 'Literal' && typeof n['value'] === 'string') return n['value'];
  if (n.type === 'BinaryExpression') return textoDelPrincipio(n['left'] as Nodo);
  if (n.type === 'ParenthesizedExpression') return textoDelPrincipio(n['expression'] as Nodo);
  if (n.type === 'TemplateLiteral')
    return String(((n['quasis'] as Nodo[])[0]?.['value'] as { cooked?: string } | undefined)?.cooked ?? '');
  return '';
}

// esComposicion(n): true si n compone una frase: un + con algún texto, o una plantilla con huecos y algún texto.
function esComposicion(n: Nodo): boolean {
  // Lo que empieza por '@' es inglés y lo que empieza por url( es CSS: no se traducen.
  const primero = textoDelPrincipio(n);
  if (primero.startsWith('@') || primero.startsWith('url(')) return false;
  if (n.type === 'BinaryExpression' && n['operator'] === '+') return llevaTexto(n);
  if (n.type === 'TemplateLiteral') return (n['expressions'] as unknown[]).length > 0 && llevaTexto(n);
  return false;
}

// esTruco(n): true si n es una llamada a TRUCOS, una expresión regular con artículos o un replace de gramática.
function esTruco(n: Nodo): boolean {
  if (n.type === 'CallExpression') {
    const f = nombreDe(n['callee']);
    if (TRUCOS.has(f)) return true;
    const a0 = (n['arguments'] as Nodo[])[0];
    if (f === 'replace' && a0?.type === 'Literal' && typeof a0['value'] === 'string')
      return REPLACE_GRAMATICA.test(a0['value']);
    if (f === 'replace' && a0?.type === 'Literal' && a0['regex'])
      return REPLACE_GRAMATICA.test(String((a0['regex'] as { pattern: string }).pattern));
  }
  if (n.type === 'Literal' && n['regex'])
    return REGEX_ARTICULO.test(String((n['regex'] as { pattern: string }).pattern));
  return false;
}

/** sitios(raiz): las frases compuestas y los trucos de gramática de raiz/src, en el orden del código. */
export function sitios(raiz: string): Sitio[] {
  const r: Sitio[] = [];
  for (const f of archivos(join(raiz, 'src'))) {
    const codigo = readFileSync(f, 'utf8');
    const archivo = relative(raiz, f);
    // apunta(n, tipo): añade el sitio de n con su línea y su código en una línea.
    const apunta = (n: Nodo, tipo: Sitio['tipo']): void => {
      const linea = codigo.slice(0, n.start).split('\n').length;
      r.push({
        archivo,
        linea,
        tipo,
        codigo: codigo.slice(n.start, n.end).replace(/\s+/gu, ' ').slice(0, LARGO_CODIGO),
      });
    };
    // visita(n, dentro): recorre el árbol (sin entrar en los new Error); dentro es true dentro de una composición ya apuntada (no se cuenta dos veces).
    const visita = (n: Nodo, dentro: boolean): void => {
      // Los mensajes de error son para quien programa, no se traducen.
      if (n.type === 'NewExpression' && /Error$/u.test(nombreDe(n['callee']))) return;
      if (esTruco(n)) apunta(n, 'truco');
      const compone = !dentro && esComposicion(n);
      if (compone) apunta(n, 'compuesta');
      // Dentro de una función se empieza de cero: su frase es otra.
      const nuevo = n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression' ? false : dentro || compone;
      for (const h of hijosDe(n)) visita(h, nuevo);
    };
    visita(parseSync(f, codigo).program as unknown as Nodo, false);
  }
  return r;
}

// Al ejecutarlo (npm run idiomas:compuestas), escribe el resumen por archivo o, con --todo, cada sitio.
if (import.meta.main) {
  const raiz = join(import.meta.dirname, '..', '..');
  const todos = sitios(raiz);
  if (process.argv.includes('--todo'))
    for (const s of todos) console.log(`${s.archivo}:${s.linea}\t${s.tipo}\t${s.codigo}`);
  else {
    const porArchivo = new Map<string, { compuesta: number; truco: number }>();
    for (const s of todos) {
      const c = porArchivo.get(s.archivo) ?? { compuesta: 0, truco: 0 };
      c[s.tipo]++;
      porArchivo.set(s.archivo, c);
    }
    console.log('archivo\tcompuestas\ttrucos');
    for (const [a, c] of [...porArchivo].sort((x, y) => y[1].compuesta + y[1].truco - x[1].compuesta - x[1].truco))
      console.log(`${a}\t${c.compuesta}\t${c.truco}`);
    const n = (t: Sitio['tipo']): number => todos.filter((s) => s.tipo === t).length;
    console.log(`TOTAL\t${n('compuesta')}\t${n('truco')}`);
  }
}
