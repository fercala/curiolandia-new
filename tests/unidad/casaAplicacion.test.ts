// Pruebas de los casos de uso de la casa ordenada (src/aplicacion/casa.ts, fase M2 de docs/PLAN-CASA-MEJORA.md):
// arreglar la casa al entrar, guardar lo comprado en el baúl, colocar, guardar, «¡Ordena, Tito!» y lo nuevo del baúl;
// sin cambiar la partida que reciben. Sin navegador: cada prueba inventa la partida.
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- los números son las posiciones de
   cada caso: leerlas tal cual en la prueba es más claro que darles nombre. */
import { describe, expect, test } from 'vitest';
import {
  arreglarCasa,
  colocarObjeto,
  enBaul,
  guardarObjeto,
  nuevoAlBaul,
  nuevosEnBaul,
  ordenarCasa,
} from '../../src/aplicacion/casa.ts';
import { EN_BAUL, PLANO, sitioDe, type Casa } from '../../src/dominio/casaSitios.ts';

// sitiosRepetidos(casa): los sitios que ocupan dos o más objetos (debe estar vacío).
const sitiosRepetidos = (casa: Casa) => {
  const hs = Object.values(casa)
    .map((p) => p.h)
    .filter(Boolean);
  return hs.filter((h, i) => hs.indexOf(h) !== i);
};

describe('arreglar la casa al entrar', () => {
  test('cada cosa va a un sitio, en la posición del sitio, y nunca dos en el mismo', () => {
    const home = {
      piano: { x: 930, y: 720 },
      robot: { x: 930, y: 720 },
      tambor: { x: 940, y: 725 },
      cuadro: { x: 800, y: 560 },
    };
    const p = { home, owned: { piano: 1, robot: 1, tambor: 1, cuadro: 1 } };
    const r = arreglarCasa(p);
    expect(sitiosRepetidos(r.home)).toEqual([]);
    for (const id of Object.keys(home)) {
      const q = r.home[id],
        s = sitioDe(PLANO, r.home, q.h!);
      expect(s && [s.x, s.y]).toEqual([q.x, q.y]);
    }
    // el cuadro va a un sitio de pared del salón: 'salon:pared1' sí, 'salon:suelo1' no
    expect(r.home.cuadro.h).toMatch(/^salon:pared/);
    expect(p.home.robot).toEqual({ x: 930, y: 720 });
  });

  test('lo que no cabe en su habitación va al baúl', () => {
    const grandes = ['piano', 'sofa', 'cama', 'mesa', 'nevera'];
    const home = Object.fromEntries(grandes.map((id, i) => [id, { x: 600 + i * 100, y: 650, r: 'salon' }]));
    const owned = Object.fromEntries(grandes.map((id) => [id, 1]));
    const r = arreglarCasa({ home, owned });
    expect(grandes.filter((id) => r.home[id].r === EN_BAUL).length).toBe(2);
    expect(grandes.filter((id) => r.home[id].h).length).toBe(3);
  });

  test('lo comprado que no estaba en la casa va al baúl; la ropa no', () => {
    const r = arreglarCasa({ home: {}, owned: { robot: 1, gorra: 1 } });
    expect(r.home).toEqual({ robot: { x: 0, y: 0, r: EN_BAUL } });
  });

  test('la primera vez (casaVistos null) todo lo que había cuenta como visto; después se respeta', () => {
    const home = { robot: { x: 930, y: 720 } };
    expect(arreglarCasa({ home, owned: { robot: 1 }, casaVistos: null }).casaVistos).toEqual({ robot: 1 });
    expect(arreglarCasa({ home, owned: { robot: 1 }, casaVistos: {} }).casaVistos).toEqual({});
  });

  test('arreglar dos veces no cambia nada más', () => {
    const p = {
      home: { piano: { x: 930, y: 720 }, robot: { x: 900, y: 700 }, pato: { x: 1000, y: 600 } },
      owned: { piano: 1, robot: 1, pato: 1 },
    };
    const una = arreglarCasa(p);
    expect(arreglarCasa({ ...p, ...una })).toEqual(una);
  });

  test('una casa rota (entradas que no son posiciones) no falla', () => {
    const home = { robot: null, piano: { x: 'a' } } as unknown as Casa;
    expect(() => arreglarCasa({ home, owned: { robot: 1, piano: 1 } })).not.toThrow();
  });
});

describe('lo nuevo va al baúl', () => {
  test('nuevoAlBaul guarda lo comprado sin verlo y sale entre los nuevos', () => {
    const p = { home: { piano: { x: 640, y: 650, r: 'salon', h: 'salon:grande1' } }, owned: { piano: 1, robot: 1 } };
    const r = nuevoAlBaul(p, 'robot');
    expect(r.home.robot).toEqual({ x: 0, y: 0, r: EN_BAUL });
    expect(r.casaVistos).toEqual({ piano: 1 });
    expect(enBaul({ ...p, ...r })).toEqual(['robot']);
    expect(nuevosEnBaul({ ...p, ...r })).toEqual(['robot']);
    expect(p.home).not.toHaveProperty('robot');
  });

  test('si ya estaba en la casa no cambia', () => {
    const home = { robot: { x: 760, y: 775, r: 'salon', h: 'salon:suelo2' } };
    expect(nuevoAlBaul({ home, casaVistos: {} }, 'robot').home).toBe(home);
  });
});

describe('colocar y guardar', () => {
  const base = {
    home: {
      mesa: { x: 640, y: 650, r: 'salon', h: 'salon:grande1' },
      pato: { x: 580, y: 520, r: 'salon', h: 'salon:mesa:1' },
      robot: { x: 0, y: 0, r: EN_BAUL },
    },
    owned: { mesa: 1, pato: 1, robot: 1 },
    casaVistos: { mesa: 1, pato: 1 },
  };

  test('sacar del baúl a un sitio libre lo coloca y lo apunta como visto', () => {
    const r = colocarObjeto(base, 'robot', 'salon:suelo2');
    expect(r && r.home.robot).toEqual({ x: 760, y: 775, r: 'salon', h: 'salon:suelo2' });
    expect(r && r.casaVistos.robot).toBe(1);
    expect(r && r.alBaul).toEqual([]);
  });

  test('a un sitio ocupado, donde no cabe o que no existe, no se puede', () => {
    expect(colocarObjeto(base, 'robot', 'salon:mesa:1')).toBeNull();
    expect(colocarObjeto(base, 'robot', 'salon:pared1')).toBeNull();
    expect(colocarObjeto(base, 'robot', 'salon:nada')).toBeNull();
  });

  test('mover un mueble guarda en el baúl lo que tenía encima', () => {
    const r = colocarObjeto(base, 'mesa', 'cocina:grande2');
    expect(r && r.home.mesa.r).toBe('cocina');
    expect(r && r.home.pato.r).toBe(EN_BAUL);
    expect(r && r.alBaul).toEqual(['pato']);
  });

  test('guardar un mueble guarda también lo de encima; guardar lo que no está, null', () => {
    const r = guardarObjeto(base, 'mesa');
    expect(r && [r.home.mesa.r, r.home.pato.r]).toEqual([EN_BAUL, EN_BAUL]);
    expect(r && r.alBaul).toEqual(['pato']);
    expect(guardarObjeto(base, 'piano')).toBeNull();
    expect(base.home.mesa.r).toBe('salon');
  });
});

describe('¡Ordena, Tito!', () => {
  test('cada cosa a su habitación habitual si está abierta; si no, al salón; el baúl no se toca', () => {
    const p = {
      home: {
        cama: { x: 640, y: 650, r: 'salon', h: 'salon:grande1' },
        nevera: { x: 1000, y: 650, r: 'juegos', h: 'juegos:grande2' },
        robot: { x: 0, y: 0, r: EN_BAUL },
      },
      owned: { cama: 1, nevera: 1, robot: 1 },
      casaVistos: {},
    };
    const habitual = (id: string) => ({ cama: 'dormitorio', nevera: 'cocina' })[id];
    const r = ordenarCasa(p, habitual, ['salon', 'dormitorio']);
    expect(r.home.cama.r).toBe('dormitorio');
    expect(r.home.nevera.r).toBe('salon');
    expect(r.home.robot.r).toBe(EN_BAUL);
    expect(sitiosRepetidos(r.home)).toEqual([]);
  });
});
