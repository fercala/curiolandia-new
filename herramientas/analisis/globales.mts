// Sabe qué exporta cada módulo del juego (exportadas): el puente de src/modulos.ts lo deja en globalThis con su nombre,
// para las pruebas (hasta la fase 4q, también para los módulos que usaban algo de uno que se carga después). Lo usa
// tests/unidad/globales.test.ts para comprobar que dos módulos no exportan el mismo nombre (el puente daría error al
// cargar).
// Hasta la fase 2p también buscaba las globales que un archivo global reasignaba de otro (antes de pasarlo a módulo no
// podía quedar ninguna) y generaba src/tipos/puente.d.ts; ya no queda código global.
// Lee el código con el analizador de rolldown (el de Vite).
import { readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { parseSync } from 'rolldown/utils';

/** Un nodo del árbol de sintaxis (ESTree): tipo, posición y el resto de campos según el tipo. */
interface Nodo {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly [campo: string]: unknown;
}

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

/** Algo con valor (no un tipo) que exporta un módulo: su nombre y el archivo de src/ donde se declara. */
export interface Exportada {
  readonly nombre: string;
  readonly archivo: string;
}

// exportadas(src, archivo): lo que exporta con valor (constantes, variables y funciones; no los tipos) el módulo
// src/archivo, en orden. Sigue `export * from` y `export {…} from` hasta el archivo que lo declara. Es lo que el puente
// de src/modulos.ts deja en globalThis.
export function exportadas(src: string, archivo: string): Exportada[] {
  const r = parseSync(archivo, readFileSync(join(src, archivo), 'utf8'));
  if (r.errors.length) throw new Error(`${archivo}: ${r.errors[0]?.message ?? 'no se puede leer'}`);
  const desde = (n: Nodo): string => {
    const fuente = hijos(n, 'source')[0];
    return normalize(join(dirname(archivo), String(fuente?.['value'])));
  };
  const lista: Exportada[] = [];
  for (const n of hijos(r.program as unknown as Nodo, 'body')) {
    if (n.type === 'ExportAllDeclaration') lista.push(...exportadas(src, desde(n)));
    if (n.type !== 'ExportNamedDeclaration' || n['exportKind'] === 'type') continue;
    const d = hijos(n, 'declaration')[0];
    if (d) for (const nombre of declaradas([d], true)) lista.push({ nombre, archivo });
    for (const e of hijos(n, 'specifiers')) {
      if (e['exportKind'] === 'type') continue;
      const nombre = String(hijos(e, 'exported')[0]?.['name']);
      const origen = hijos(n, 'source').length ? desde(n) : archivo;
      lista.push({ nombre, archivo: origen === archivo ? archivo : exportadas(src, origen).find((x) => x.nombre === nombre)?.archivo ?? origen });
    }
  }
  return lista;
}
