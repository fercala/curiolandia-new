// Prueba del puente de src/modulos.ts: deja en globalThis, con su nombre, lo que exportan los módulos del juego (para
// las pruebas y para los módulos que usan algo de uno que se carga después, ver src/tardias.d.ts). Comprueba que pasa
// por él cada entrada y que dos módulos no exportan el mismo nombre: el puente daría error al cargar la página. Ver
// herramientas/analisis/globales.mts. Hasta la fase 2p también comprobaba que ningún archivo global reasignara lo de
// otro (antes de pasarlo a módulo) y que src/tipos/puente.d.ts diera tipo a todo lo del puente.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { exportadas } from '../../herramientas/analisis/globales.mts';

const SRC = join(import.meta.dirname, '..', '..', 'src');
// Lo que src/modulos.ts pasa al puente, en el mismo orden.
const ENTRADAS = ['dibujos/todos.ts', 'nucleo/indice.ts', 'juegos/indice.ts', 'temas/indice.ts', 'contenido/cuentos.ts', 'escenas/indice.ts', 'aplicacion/adultos.ts', 'mundo3d/mundo3d.ts'] as const;

describe('globales', () => {
  test('el puente pasa lo que exportan los módulos y nada se repite', () => {
    const nombres = ENTRADAS.flatMap((e) => exportadas(SRC, e)).map((x) => x.nombre);
    expect(nombres).toContain('S');
    expect(nombres).toContain('PICS');
    expect(new Set(nombres).size).toBe(nombres.length);
    const modulos = readFileSync(join(SRC, 'modulos.ts'), 'utf8');
    for (const e of ENTRADAS) expect(modulos).toContain(`'./${e}'`);
  });

  test('el juego arranca al final, con el puente ya puesto', () => {
    const modulos = readFileSync(join(SRC, 'modulos.ts'), 'utf8');
    expect(modulos.trimEnd().endsWith('arrancar();')).toBe(true);
    expect(modulos.lastIndexOf('puente(')).toBeLessThan(modulos.lastIndexOf('arrancar();'));
  });
});
