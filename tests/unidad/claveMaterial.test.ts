// Pruebas de claveMaterial y M (src/mundo3d/materiales.ts, mejora 7 del issue #55): la clave nueva de la caché de
// materiales es la de antes (color + JSON.stringify de las opciones) cuando no hay texturas, agrupa las llamadas igual
// que antes también con ellas, así que M devuelve el mismo material en los mismos casos; y una textura ya no se
// serializa: solo se usa su uuid.
import { beforeAll, describe, expect, test, vi } from 'vitest';
import * as THREE from 'three';

type Materiales = typeof import('../../src/mundo3d/materiales.ts');
let M: Materiales['M'];
let claveMaterial: Materiales['claveMaterial'];

// materiales.ts importa el núcleo, que al cargarse busca el lienzo de la página y escucha la ventana: se le da un
// navegador de mentira con lo justo (como tests/unidad/juegoEnVm.ts, pero sin node:vm).
beforeAll(async () => {
  const lienzo = { width: 0, height: 0, style: {}, getContext: () => ({}), addEventListener: () => undefined };
  vi.stubGlobal('document', { getElementById: () => lienzo, createElement: () => lienzo, addEventListener: () => undefined });
  vi.stubGlobal('addEventListener', () => undefined);
  vi.stubGlobal('innerWidth', 1600);
  vi.stubGlobal('innerHeight', 900);
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined });
  vi.stubGlobal('Image', class { src = ''; complete = false; });
  vi.stubGlobal('location', { protocol: 'file:' });
  vi.stubGlobal('setTimeout', () => 0);
  vi.stubGlobal('window', globalThis);
  // el núcleo lee la partida al cargarse: sin nada guardado, empieza una nueva
  const { ponPuertos } = await import('../../src/aplicacion/puertos.ts');
  ponPuertos({
    reloj: { ahora: () => new Date(0) },
    azar: { numero: () => 0.5 },
    guardado: { leer: () => null, escribir: () => true, alCambiarFuera: () => undefined },
  });
  ({ M, claveMaterial } = await import('../../src/mundo3d/materiales.ts'));
});

// claveVieja(c,o): la clave que usaba M hasta la v0.2.59, para comparar.
const claveVieja = (c: string, o?: THREE.MeshToonMaterialParameters): string => c + (o ? JSON.stringify(o) : '');

// Las formas de llamar a M que hay en src/mundo3d/ (y algunas parecidas), sin texturas.
const LLAMADAS: ReadonlyArray<readonly [string, THREE.MeshToonMaterialParameters | undefined]> = [
  ['#FFC93C', undefined],
  ['#FFC93C', {}],
  ['#FFC93C', { emissive: '#C98A00' }],
  ['#FFC93C', { emissive: '#C9A000' }],
  ['#FFF3B0', { emissive: '#C98A00' }],
  ['#FFC93C', { side: THREE.DoubleSide }],
  ['#FFC93C', { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }],
  ['#FFC93C', { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -8 }],
  ['#FFC93C', { polygonOffset: true, side: THREE.DoubleSide, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }],
  ['#FFFFFF', { transparent: true, opacity: 0.75 }],
  ['#FFFFFF', { transparent: true, opacity: 0.5 }],
  ['#FFFFFF', { transparent: false, opacity: 0.75 }],
  ['#FFFFFF', { emissive: undefined }],
  ['#FFFFFF', { opacity: Number.NaN }],
];

describe('claveMaterial', () => {
  test('sin opciones, la clave es el color', () => {
    expect(claveMaterial('#9BDB82')).toBe('#9BDB82');
  });

  test('sin texturas, la clave es la de antes, letra a letra', () => {
    for (const [c, o] of LLAMADAS) expect(claveMaterial(c, o)).toBe(claveVieja(c, o));
  });

  test('dos llamadas comparten clave justo cuando la compartían con la clave vieja', () => {
    for (const [c1, o1] of LLAMADAS) {
      for (const [c2, o2] of LLAMADAS) {
        const igualesAntes = claveVieja(c1, o1) === claveVieja(c2, o2);
        expect(claveMaterial(c1, o1) === claveMaterial(c2, o2)).toBe(igualesAntes);
      }
    }
  });

  test('una textura cuenta por quién es (su uuid), sin serializarla', () => {
    const rayas = new THREE.Texture();
    const otra = new THREE.Texture();
    rayas.toJSON = () => {
      throw new Error('no debe serializarse');
    };
    expect(claveMaterial('#fff', { map: rayas })).toBe(claveMaterial('#fff', { map: rayas }));
    expect(claveMaterial('#fff', { map: rayas })).not.toBe(claveMaterial('#fff', { map: otra }));
    expect(claveMaterial('#fff', { map: rayas })).not.toBe(claveMaterial('#fff'));
    expect(claveMaterial('#fff', { map: rayas, side: THREE.DoubleSide })).not.toBe(claveMaterial('#fff', { map: rayas }));
    const opciones = { map: rayas };
    claveMaterial('#fff', opciones);
    expect(opciones.map).toBe(rayas);
  });
});

describe('M', () => {
  test('reutiliza el material con el mismo color y opciones, y crea otro si cambian', () => {
    const a = M('#123456', { emissive: '#000011' });
    expect(M('#123456', { emissive: '#000011' })).toBe(a);
    expect(M('#123456', { emissive: '#000022' })).not.toBe(a);
    expect(M('#123456')).not.toBe(a);
    expect(M('#123456')).toBe(M('#123456'));
    const rayas = new THREE.Texture();
    const conRayas = M('#fff', { map: rayas });
    expect(M('#fff', { map: rayas })).toBe(conRayas);
    expect(conRayas.map).toBe(rayas);
    expect(conRayas.color.getHexString()).toBe('ffffff');
  });
});
