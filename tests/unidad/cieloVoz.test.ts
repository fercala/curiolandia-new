// Contrato de la voz del paisaje: al silenciarla, las continuaciones usan el temporizador de escena.
// Se aíslan dibujo y WebGL para probar las funciones exportadas sin arrancar el navegador.
import { beforeEach, expect, test, vi } from 'vitest';

vi.mock('../../src/nucleo/indice.ts', () => ({
  PI: Math.PI,
  S: { quiet3: 1 },
  SCENES: {},
  T: 0,
  later: vi.fn(),
  noise: vi.fn(),
  parts: [],
  rnd: vi.fn(),
  say: vi.fn(),
  sceneName: 'map',
  tone: vi.fn(),
}));
vi.mock('../../src/nucleo/traducir.ts', () => ({ tr: (texto: string) => texto }));
vi.mock('../../src/temas/indice.ts', () => ({ sayMix: vi.fn() }));
vi.mock('../../src/escenas/zonas.ts', () => ({ enIslaIngles: vi.fn() }));
vi.mock('../../src/mundo3d/motor.ts', () => ({ RC: {}, proj: vi.fn() }));
vi.mock('../../src/mundo3d/materiales.ts', () => ({
  Box: vi.fn(),
  Cone: vi.fn(),
  Cyl: vi.fn(),
  M: vi.fn(),
  Sph: vi.fn(),
  gcache: vi.fn(),
  mg: vi.fn(),
  mk: vi.fn(),
}));
vi.mock('../../src/mundo3d/decorado.ts', () => ({ fhit: vi.fn(), softTex: vi.fn() }));
vi.mock('../../src/mundo3d/objetos.ts', () => ({ cloud3: vi.fn(), hitS: vi.fn() }));

import { S, later, say } from '../../src/nucleo/indice.ts';
import { sayMix } from '../../src/temas/indice.ts';
import { say3, sayMix3 } from '../../src/mundo3d/cielo.ts';

beforeEach(() => {
  vi.clearAllMocks();
  S.quiet3 = 1;
});

test('la voz silenciosa registra sus continuaciones con el reloj de la escena', () => {
  const continuar = vi.fn();
  say3('El sol.', continuar);
  sayMix3(['@One'], continuar);
  expect(later).toHaveBeenCalledTimes(2);
  expect(later).toHaveBeenNthCalledWith(1, 500, continuar);
  expect(later).toHaveBeenNthCalledWith(2, 500, continuar);
  expect(say).not.toHaveBeenCalled();
  expect(sayMix).not.toHaveBeenCalled();
});

test('sin continuación no se programa un temporizador vacío', () => {
  say3('El sol.');
  sayMix3(['@One']);
  expect(later).not.toHaveBeenCalled();
});

test('con comentarios activos se conserva la voz y su continuación', () => {
  S.quiet3 = 0;
  const continuar = vi.fn();
  say3('El sol.', continuar);
  sayMix3(['@One'], continuar);
  expect(say).toHaveBeenCalledWith('El sol.', continuar, undefined);
  expect(sayMix).toHaveBeenCalledWith(['@One'], continuar);
  expect(later).not.toHaveBeenCalled();
});
