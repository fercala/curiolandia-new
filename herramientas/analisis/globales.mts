// Busca en el código del juego (src/*.js, en el orden de ARCHIVOS) las variables y funciones globales que un archivo
// declara y otro reasigna (x = ..., x += ..., x++). Un módulo no puede reasignar lo que importa, así que antes de pasar
// a módulos (fase 2 de docs/PLAN-MIGRACION.md) no puede quedar ninguna: lo comprueba tests/unidad/globales.test.ts.
// Lo que se comparte y cambia está en VIVO (core.js) o se cambia con su función pon* (ponS, ponGo...).
// Lee el código con el analizador de rolldown (el de Vite) y sigue los ámbitos de JavaScript (funciones, bloques,
// for, catch, switch) para no confundir una variable local con la global del mismo nombre.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSync } from 'rolldown/utils';

/** Un nodo del árbol de sintaxis (ESTree): tipo, posición y el resto de campos según el tipo. */
interface Nodo {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly [campo: string]: unknown;
}

/** Una global escrita desde un archivo que no es el suyo. */
export interface EscrituraCruzada {
  readonly nombre: string;
  readonly declaradaEn: string;
  readonly escritaEn: string;
  readonly veces: number;
}

type Ambitos = readonly ReadonlySet<string>[];

// esNodo(x): true si x es un nodo del árbol (objeto con type).
function esNodo(x: unknown): x is Nodo {
  return typeof x === 'object' && x !== null && typeof (x as { type?: unknown }).type === 'string';
}

// hijos(n, campo): el campo de n como lista de nodos (vacía si no hay).
function hijos(n: Nodo, campo: string): Nodo[] {
  const v = n[campo];
  if (Array.isArray(v)) return v.filter(esNodo);
  return esNodo(v) ? [v] : [];
}

// nombres(patrón): los nombres que declara un patrón (x, {a, b: c}, [d, ...e], f = 1).
function nombres(p: Nodo | undefined): string[] {
  if (!p) return [];
  switch (p.type) {
    case 'Identifier': return [String(p['name'])];
    case 'ObjectPattern': return hijos(p, 'properties').flatMap((x) => nombres(hijos(x, x.type === 'RestElement' ? 'argument' : 'value')[0]));
    case 'ArrayPattern': return hijos(p, 'elements').flatMap((x) => nombres(x));
    case 'AssignmentPattern': return nombres(hijos(p, 'left')[0]);
    case 'RestElement': return nombres(hijos(p, 'argument')[0]);
    default: return [];
  }
}

// declaradas(instrucciones, conVar): lo que declaran let, const, function y class de una lista de instrucciones
// (y var si conVar, para el nivel de arriba del archivo).
function declaradas(instrucciones: readonly Nodo[], conVar: boolean): string[] {
  const r: string[] = [];
  for (const s of instrucciones) {
    if (s.type === 'VariableDeclaration' && (conVar || s['kind'] !== 'var')) {
      for (const d of hijos(s, 'declarations')) r.push(...nombres(hijos(d, 'id')[0]));
    } else if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && esNodo(s['id'])) {
      r.push(String(s['id']['name']));
    }
  }
  return r;
}

// varsDeFuncion(cuerpo): los var de un cuerpo de función, sin entrar en las funciones de dentro (se elevan a la función).
function varsDeFuncion(cuerpo: Nodo): Set<string> {
  const r = new Set<string>();
  const ver = (n: Nodo): void => {
    if (n !== cuerpo && /Function/.test(n.type)) return;
    if (n.type === 'VariableDeclaration' && n['kind'] === 'var') {
      for (const d of hijos(n, 'declarations')) for (const x of nombres(hijos(d, 'id')[0])) r.add(x);
    }
    for (const k of Object.keys(n)) for (const h of hijos(n, k)) ver(h);
  };
  ver(cuerpo);
  return r;
}

// escrituras(programa, globales): cuántas veces escribe el archivo cada global que no tapa una variable local.
// Recorre el árbol llevando la lista de ámbitos abiertos (cada uno con sus nombres declarados).
function escrituras(programa: Nodo, globales: ReadonlySet<string>): Map<string, number> {
  const cuenta = new Map<string, number>();
  const apunta = (p: Nodo | undefined, amb: Ambitos): void => {
    // Solo cuenta la escritura de una variable suelta (x = ...), no la de un campo (x.y = ...).
    if (p?.type !== 'Identifier') return;
    const n = String(p['name']);
    if (globales.has(n) && !amb.some((s) => s.has(n))) cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
  };
  const ver = (n: Nodo, amb: Ambitos): void => {
    let dentro = amb;
    if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
      const cuerpo = hijos(n, 'body')[0];
      const s = new Set<string>(hijos(n, 'params').flatMap((p) => nombres(p)));
      if (n.type === 'FunctionExpression' && esNodo(n['id'])) s.add(String(n['id']['name']));
      if (cuerpo) {
        for (const x of varsDeFuncion(cuerpo)) s.add(x);
        if (cuerpo.type === 'BlockStatement') for (const x of declaradas(hijos(cuerpo, 'body'), false)) s.add(x);
      }
      dentro = [...amb, s];
      for (const p of hijos(n, 'params')) ver(p, dentro);
      if (cuerpo) for (const h of cuerpo.type === 'BlockStatement' ? hijos(cuerpo, 'body') : [cuerpo]) ver(h, dentro);
      return;
    }
    if (n.type === 'BlockStatement' || n.type === 'StaticBlock') dentro = [...amb, new Set(declaradas(hijos(n, 'body'), false))];
    if (/^For(In|Of)?Statement$/.test(n.type)) {
      const ini = hijos(n, n.type === 'ForStatement' ? 'init' : 'left')[0];
      if (ini?.type === 'VariableDeclaration') dentro = [...amb, new Set(declaradas([ini], false))];
    }
    if (n.type === 'CatchClause') dentro = [...amb, new Set(nombres(hijos(n, 'param')[0]))];
    if (n.type === 'SwitchStatement') {
      dentro = [...amb, new Set(hijos(n, 'cases').flatMap((c) => declaradas(hijos(c, 'consequent'), false)))];
    }
    if (n.type === 'AssignmentExpression') apunta(hijos(n, 'left')[0], dentro);
    if (n.type === 'UpdateExpression') apunta(hijos(n, 'argument')[0], dentro);
    for (const k of Object.keys(n)) for (const h of hijos(n, k)) ver(h, dentro);
  };
  for (const h of hijos(programa, 'body')) ver(h, []);
  return cuenta;
}

// escriturasCruzadas(src, archivos): las globales de cada archivo que otro archivo reasigna. Vacía = se puede pasar
// a módulos sin que nadie reasigne lo que importa.
export function escriturasCruzadas(src: string, archivos: readonly string[]): EscrituraCruzada[] {
  const programas = archivos.map((f) => {
    const r = parseSync(f, readFileSync(join(src, f), 'utf8'));
    if (r.errors.length) throw new Error(`${f}: ${r.errors[0]?.message ?? 'no se puede leer'}`);
    return { f, programa: r.program as unknown as Nodo };
  });
  // De quién es cada global: del primer archivo que la declara arriba del todo.
  const duenno = new Map<string, string>();
  for (const { f, programa } of programas) for (const n of declaradas(hijos(programa, 'body'), true)) if (!duenno.has(n)) duenno.set(n, f);
  const globales = new Set(duenno.keys());
  const r: EscrituraCruzada[] = [];
  for (const { f, programa } of programas) {
    for (const [nombre, veces] of escrituras(programa, globales)) {
      const declaradaEn = duenno.get(nombre);
      if (declaradaEn && declaradaEn !== f) r.push({ nombre, declaradaEn, escritaEn: f, veces });
    }
  }
  return r;
}
