// Pruebas de las reglas de los perfiles, varios niños en el mismo móvil (src/dominio/perfiles.ts, idea 38 de
// docs/IDEAS-MEJORA.md).
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  MAX_PERFILES,
  activar,
  anadirPerfil,
  claveDePerfil,
  indiceDe,
  partidaNueva,
} from '../../src/dominio/perfiles.ts';

const AHORA = { nombre: 'Lucía', edad: 4 };
describe('los perfiles', () => {
  test('sin índice hay un solo perfil, el A, con la partida de ahora', () => {
    expect(indiceDe(null, AHORA)).toEqual({ activo: 'A', lista: [{ id: 'A', ...AHORA }], recien: false });
  });
  test('se añaden hasta tres, con el primer id libre', () => {
    let ind = indiceDe(null, AHORA);
    for (let i = 1; i < MAX_PERFILES; i++) ind = anadirPerfil(ind, 'Niño ' + i, 3)!.indice;
    expect(ind.lista.map((p) => p.id)).toEqual(['A', 'B', 'C']);
    expect(anadirPerfil(ind, 'Otro', 5)).toBeNull();
  });
  test('activar cambia el que juega (no al que ya juega ni a uno que no existe)', () => {
    const ind = anadirPerfil(indiceDe(null, AHORA), 'Mateo', 5)!.indice;
    expect(activar(ind, 'A')).toBeNull();
    expect(activar(ind, 'C')).toBeNull();
    expect(activar(ind, 'B')).toMatchObject({ activo: 'B', recien: true });
  });
  test('el índice guardado se limpia y el que juega lleva el nombre de la partida de ahora', () => {
    const ind = indiceDe(
      { activo: 'B', lista: [{ id: 'A', nombre: 'Ana', edad: 3 }, { id: 'B', nombre: 'viejo', edad: 9 }, { id: 'Z' }] },
      AHORA,
    );
    expect(ind.lista).toEqual([
      { id: 'A', nombre: 'Ana', edad: 3 },
      { id: 'B', ...AHORA },
    ]);
    expect(claveDePerfil('B')).not.toBe(claveDePerfil('A'));
    expect(partidaNueva({ id: 'B', nombre: 'Mateo', edad: 5 })).toEqual({ name: 'Mateo', age: 5 });
  });
});
