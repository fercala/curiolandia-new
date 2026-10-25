// Pruebas de los puertos Reloj y Azar (src/aplicacion/puertos.ts, fase 3g): sin conectar avisan, con unos adaptadores
// de prueba dan lo que estos digan, y en src/ solo los adaptadores del navegador (src/infraestructura/) usan new Date(),
// Date.now() y Math.random(). Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso (fechas, azar): leerlos tal
   cual en la prueba es más claro que darles un nombre. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';
import { ahora, azar, ponPuertos } from '../../src/aplicacion/puertos.ts';
import { azarDelNavegador, relojDelNavegador } from '../../src/infraestructura/navegador.ts';

const SRC = join(import.meta.dirname, '..', '..', 'src');

// archivosTs(dir): los .ts de dir y sus carpetas, con la ruta desde src/.
const archivosTs = (dir: string): string[] => readdirSync(dir, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && e.name.endsWith('.ts'))
  .map((e) => relative(SRC, join(e.parentPath, e.name)));

describe('puertos', () => {
  // Va la primera: en este archivo, nadie ha conectado aún los puertos.
  test('sin conectar, ahora() y azar() avisan', () => {
    expect(() => ahora()).toThrow(/sin conectar/);
    expect(() => azar()).toThrow(/sin conectar/);
  });

  test('dan lo que digan los adaptadores conectados', () => {
    const fecha = new Date(2026, 11, 25, 9, 30);
    ponPuertos({ reloj: { ahora: () => fecha }, azar: { numero: () => 0.25 } });
    expect(ahora()).toBe(fecha);
    expect(azar()).toBe(0.25);
  });

  test('los del navegador dan la hora del aparato y un número de 0 a 1', () => {
    ponPuertos({ reloj: relojDelNavegador, azar: azarDelNavegador });
    expect(Math.abs(ahora().getTime() - Date.now())).toBeLessThan(1000);
    const n = azar();
    expect(n >= 0 && n < 1).toBe(true);
  });

  test('en src/, solo infraestructura/ usa new Date(), Date.now() y Math.random()', () => {
    const directo = /new Date\(\)|Date\.now\(\)|Math\.random\(\)/;
    // codigo(f): las líneas de f que no son comentarios.
    const codigo = (f: string): string[] => readFileSync(join(SRC, f), 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l));
    const usan = archivosTs(SRC).filter((f) => codigo(f).some((l) => directo.test(l)));
    expect(usan).toEqual([join('infraestructura', 'navegador.ts')]);
  });
});
