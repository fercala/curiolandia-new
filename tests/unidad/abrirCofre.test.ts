// Pruebas de los casos de uso del cofre del tesoro (src/aplicacion/abrirCofre.ts, fase 4l): ganarlo (un cofre más,
// apuntado como pendiente) y abrirlo (deja de estar pendiente, una figurita más y las monedas, menos si trae regalo),
// sin cambiar la partida que reciben. Sin navegador: cada prueba inventa la partida.
import { describe, expect, test } from 'vitest';
import type { PartidaDelCofre } from '../../src/aplicacion/abrirCofre.ts';
import { abrirCofre, ganarCofre, sinPendiente } from '../../src/aplicacion/abrirCofre.ts';
import { MONEDAS } from '../../src/dominio/monedas.ts';

describe('el cofre del tesoro', () => {
  test('ganar el primer cofre: cuenta uno y lo apunta como pendiente', () => {
    const p: PartidaDelCofre = { stk: {} };
    expect(ganarCofre(p, '3A-T1')).toEqual({ cofres: 1, cofreP: { '3A-T1': 1 } });
    expect(p).toEqual({ stk: {} });
  });

  test('ganar otro: suma a los que había y deja los pendientes de antes', () => {
    const p: PartidaDelCofre = { cofres: 4, cofreP: { '3A-T2': 1 }, stk: {} };
    expect(ganarCofre(p, '3A-T1')).toEqual({ cofres: 5, cofreP: { '3A-T2': 1, '3A-T1': 1 } });
    expect(p.cofreP).toEqual({ '3A-T2': 1 });
  });

  test('abrirlo con regalo: deja de estar pendiente, una figurita más y las monedas del cofre con regalo', () => {
    const p: PartidaDelCofre = { cofreP: { '3A-T1': 1, '3A-T2': 1 }, stk: { sol: 2 } };
    expect(abrirCofre(p, '3A-T1', 'sol', true)).toEqual({ partida: { cofreP: { '3A-T2': 1 }, stk: { sol: 3 } }, monedas: MONEDAS.cofreConRegalo });
    expect(p).toEqual({ cofreP: { '3A-T1': 1, '3A-T2': 1 }, stk: { sol: 2 } });
  });

  test('abrirlo sin regalo (ya los tiene todos): la primera figurita de ese tema y más monedas', () => {
    const p: PartidaDelCofre = { cofreP: { '3A-T1': 1 }, stk: {} };
    expect(abrirCofre(p, '3A-T1', 'sol', false)).toEqual({ partida: { cofreP: {}, stk: { sol: 1 } }, monedas: MONEDAS.cofreSinRegalo });
  });

  test('sinPendiente: quita solo ese tema, también si no había ninguno', () => {
    expect(sinPendiente({ a: 1, b: 1 }, 'a')).toEqual({ b: 1 });
    expect(sinPendiente(undefined, 'a')).toEqual({});
  });
});
