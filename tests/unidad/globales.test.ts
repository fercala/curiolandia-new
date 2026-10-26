// Prueba de la fase 2 (docs/PLAN-MIGRACION.md): ningún archivo del juego reasigna una variable o función global de
// otro archivo ni de un módulo. Lo que se comparte y cambia va en VIVO (src/nucleo/pantalla.ts) o se cambia con su
// función pon* (ponS, ponGo...), porque un módulo no puede reasignar lo que importa. Además, src/tipos/puente.d.ts
// da tipo a todo lo que el puente de src/modulos.ts deja en globalThis, y a nada más. Ver herramientas/analisis/globales.mts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { escriturasCruzadas, exportadas, lineasPuente } from '../../herramientas/analisis/globales.mts';
import { ARCHIVOS } from '../../herramientas/vite/curiolandia.mts';

const SRC = join(import.meta.dirname, '..', '..', 'src');
// Lo que src/modulos.ts pasa al puente, en el mismo orden.
const ENTRADAS = ['dibujos/todos.ts', 'nucleo/indice.ts', 'juegos/indice.ts', 'temas/indice.ts', 'contenido/cuentos.ts', 'escenas/indice.ts', 'aplicacion/adultos.ts', 'mundo3d/mundo3d.ts'] as const;

describe('globales', () => {
  test('ningún archivo reasigna las globales de otro ni las de los módulos', () => {
    const deModulos = ENTRADAS.flatMap((e) => exportadas(SRC, e));
    expect(escriturasCruzadas(SRC, ARCHIVOS, deModulos)).toEqual([]);
  });

  test('el puente pasa lo que exportan los módulos y nada se repite', () => {
    const nombres = ENTRADAS.flatMap((e) => exportadas(SRC, e)).map((x) => x.nombre);
    expect(nombres).toContain('S');
    expect(nombres).toContain('PICS');
    expect(new Set(nombres).size).toBe(nombres.length);
    const modulos = readFileSync(join(SRC, 'modulos.ts'), 'utf8');
    for (const e of ENTRADAS) expect(modulos).toContain(`'./${e}'`);
  });

  test('src/tipos/puente.d.ts da tipo a cada cosa del puente', () => {
    const lineas = readFileSync(join(SRC, 'tipos', 'puente.d.ts'), 'utf8').split('\n').filter((l) => l.startsWith('declare const '));
    expect(lineas).toEqual(lineasPuente(SRC, ENTRADAS));
  });
});
