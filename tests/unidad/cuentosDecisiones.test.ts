// Pruebas de los cuentos en los que el niño decide (src/dominio/cuentosDecisiones.ts y src/contenido/cuentosDecisiones.ts,
// fase P33 de docs/IDEAS-MEJORA.md): que cada cuento está bien hecho y cómo se apuntan los finales y sus monedas.
import { describe, expect, test } from 'vitest';
import { CUENTOS_DECISION } from '../../src/contenido/cuentosDecisiones.ts';
import {
  CUENTOS_DEC_MONEDAS,
  apuntarFinal,
  erroresCuento,
  finalesDe,
  registroCuentos,
  vistosDe,
} from '../../src/dominio/cuentosDecisiones.ts';

describe('cuentos con decisiones', () => {
  test('cada cuento está bien hecho: empieza, cada opción lleva a una página y se llega a todo', () => {
    CUENTOS_DECISION.forEach((c) => expect(erroresCuento(c)).toEqual([]));
    expect(new Set(CUENTOS_DECISION.map((c) => c.id)).size).toBe(CUENTOS_DECISION.length);
  });

  test('un cuento roto se detecta', () => {
    const c = CUENTOS_DECISION[1]!;
    const roto = {
      ...c,
      paginas: {
        ...c.paginas,
        suelta: { frase: 'x', dibujos: [] },
        inicio: {
          ...c.paginas.inicio!,
          opciones: [c.paginas.inicio!.opciones![0], { texto: 'y', dibujo: 'flor', va: 'nada' }] as const,
        },
      },
    };
    expect(erroresCuento(roto).length).toBeGreaterThan(0);
  });

  test('apuntar finales: el primero da monedas, el repetido no; lo guardado roto se lee vacío', () => {
    const c = CUENTOS_DECISION.find((x) => x.id === 'regalo')!;
    expect(finalesDe(c)).toHaveLength(4);
    const a = apuntarFinal({}, c, 'velas');
    expect(a.nuevo).toBe(true);
    expect(a.monedas).toBe(CUENTOS_DEC_MONEDAS);
    const b = apuntarFinal(a.reg, c, 'velas');
    expect(b.monedas).toBe(0);
    expect(apuntarFinal(a.reg, c, 'tarta').monedas).toBe(0);
    expect(vistosDe(apuntarFinal(a.reg, c, 'globo').reg, c)).toEqual(['velas', 'globo']);
    expect(registroCuentos('roto')).toEqual({});
    expect(registroCuentos({ regalo: ['velas', 3], x: 5 })).toEqual({ regalo: ['velas'] });
  });
});
