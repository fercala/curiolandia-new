// Pruebas de los puertos Reloj, Azar y Guardado (src/aplicacion/puertos.ts, fases 3g y 3h): sin conectar avisan, con
// unos adaptadores de prueba dan lo que estos digan, el guardado del navegador nunca da error, y en src/ solo los
// adaptadores del navegador (src/infraestructura/) usan new Date(), Date.now(), Math.random() y localStorage. Sin
// navegador (localStorage y addEventListener son de mentira).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (fechas, azar): leerlos tal
   cual en la prueba es más claro que darles un nombre. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';
import type { Guardado } from '../../src/aplicacion/puertos.ts';
import { ahora, alGuardarFuera, azar, escribirGuardado, leerGuardado, ponPuertos } from '../../src/aplicacion/puertos.ts';
import { azarDelNavegador, guardadoDelNavegador, relojDelNavegador } from '../../src/infraestructura/navegador.ts';

const SRC = join(import.meta.dirname, '..', '..', 'src');

// archivosTs(dir): los .ts de dir y sus carpetas, con la ruta desde src/.
const archivosTs = (dir: string): string[] => readdirSync(dir, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && e.name.endsWith('.ts'))
  .map((e) => relative(SRC, join(e.parentPath, e.name)));

// enMemoria(): un guardado de prueba en memoria; avisar(clave, texto) hace como si otra pestaña guardara.
function enMemoria(): Guardado & { avisar(clave: string, texto: string | null): void } {
  const datos = new Map<string, string>();
  const oyentes: ((clave: string, texto: string | null) => void)[] = [];
  return {
    leer: (clave) => datos.get(clave) ?? null,
    escribir: (clave, texto) => { datos.set(clave, texto); return true; },
    alCambiarFuera: (fn) => { oyentes.push(fn); },
    avisar: (clave, texto) => { oyentes.forEach((fn) => fn(clave, texto)); },
  };
}

describe('puertos', () => {
  // Va la primera: en este archivo, nadie ha conectado aún los puertos.
  test('sin conectar, ahora() y azar() avisan', () => {
    expect(() => ahora()).toThrow(/sin conectar/);
    expect(() => azar()).toThrow(/sin conectar/);
    expect(() => leerGuardado('x')).toThrow(/sin conectar/);
  });

  test('dan lo que digan los adaptadores conectados', () => {
    const fecha = new Date(2026, 11, 25, 9, 30);
    const guardado = enMemoria();
    ponPuertos({ reloj: { ahora: () => fecha }, azar: { numero: () => 0.25 }, guardado });
    expect(ahora()).toBe(fecha);
    expect(azar()).toBe(0.25);
    expect(leerGuardado('partida')).toBeNull();
    expect(escribirGuardado('partida', '{"age":4}')).toBe(true);
    expect(leerGuardado('partida')).toBe('{"age":4}');
    const avisos: [string, string | null][] = [];
    alGuardarFuera((clave, texto) => avisos.push([clave, texto]));
    guardado.avisar('partida', '{}');
    expect(avisos).toEqual([['partida', '{}']]);
  });

  test('los del navegador dan la hora del aparato y un número de 0 a 1', () => {
    ponPuertos({ reloj: relojDelNavegador, azar: azarDelNavegador, guardado: guardadoDelNavegador });
    expect(Math.abs(ahora().getTime() - Date.now())).toBeLessThan(1000);
    const n = azar();
    expect(n >= 0 && n < 1).toBe(true);
  });

  test('el guardado del navegador nunca da error: sin localStorage lee null y no escribe', () => {
    // Aquí no hay navegador: nombrar localStorage da error, como cuando el navegador lo bloquea.
    expect(guardadoDelNavegador.leer('partida')).toBeNull();
    expect(guardadoDelNavegador.escribir('partida', '{}')).toBe(false);
    // Con un localStorage de mentira, lee y escribe en él.
    const datos: Record<string, string> = {};
    const g = globalThis as Record<string, unknown>;
    g['localStorage'] = { getItem: (k: string) => datos[k] ?? null, setItem: (k: string, v: string) => { datos[k] = v; } };
    try {
      expect(guardadoDelNavegador.escribir('partida', '{}')).toBe(true);
      expect(guardadoDelNavegador.leer('partida')).toBe('{}');
    } finally {
      delete g['localStorage'];
    }
  });

  test('en src/, solo infraestructura/ usa new Date(), Date.now(), Math.random() y localStorage', () => {
    const directo = /new Date\(\)|Date\.now\(\)|Math\.random\(\)|\blocalStorage\./;
    // codigo(f): las líneas de f que no son comentarios.
    const codigo = (f: string): string[] => readFileSync(join(SRC, f), 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l));
    const usan = archivosTs(SRC).filter((f) => codigo(f).some((l) => directo.test(l)));
    expect(usan).toEqual([join('infraestructura', 'navegador.ts')]);
  });
});
