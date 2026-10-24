// Prueba de la fase 2 (docs/PLAN-MIGRACION.md): ningún archivo del juego reasigna una variable o función global de
// otro archivo. Lo que se comparte y cambia va en VIVO (core.js) o se cambia con su función pon* (ponS, ponGo...),
// porque al pasar a módulos un archivo no podrá reasignar lo que importa. Ver herramientas/analisis/globales.mts.
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { escriturasCruzadas } from '../../herramientas/analisis/globales.mts';
import { ARCHIVOS } from '../../herramientas/vite/curiolandia.mts';

const SRC = join(import.meta.dirname, '..', '..', 'src');

describe('globales', () => {
  test('ningún archivo reasigna las globales de otro', () => {
    expect(escriturasCruzadas(SRC, ARCHIVOS)).toEqual([]);
  });
});
