// Pruebas de las reglas del escondite del patio (src/dominio/escondite.ts, fase P13a de docs/IDEAS-MEJORA.md): los
// sitios y sus pistas, dónde se esconde cada amigo según la edad y dónde mira Lupi. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  ESCONDITE,
  SITIOS_ESCONDITE,
  busquedaLupi,
  planEscondite,
  sitioEscondite,
} from '../../src/dominio/escondite.ts';

// azarDe(semilla): un azar de prueba que siempre da la misma serie para la misma semilla.
const azarDe = (semilla: number) => {
  let s = semilla;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

describe('el escondite', () => {
  test('seis sitios con ids distintos: dos detrás, dos debajo y dos dentro, cada uno con su pista entera', () => {
    const ids = SITIOS_ESCONDITE.map((s) => s.id);
    expect(new Set(ids).size).toBe(6);
    (['detras', 'debajo', 'dentro'] as const).forEach((p) =>
      expect(SITIOS_ESCONDITE.filter((s) => s.posicion === p)).toHaveLength(2),
    );
    // la pista es una frase entera con su posición: acepta "¡Está detrás del árbol!" y rechaza "Detrás del árbol"
    // (probar en https://regex101.com/?regex=%5E%C2%A1Est%C3%A1%20(detr%C3%A1s%20del%7Cdebajo%20del%7Cdentro%20de%20la)%20.%2B!%24)
    SITIOS_ESCONDITE.forEach((s) => expect(s.pista).toMatch(/^¡Está (detrás del|debajo del|dentro de la) .+!$/));
    expect(sitioEscondite('tobogan')?.posicion).toBe('debajo');
    expect(sitioEscondite('nada')).toBeUndefined();
  });

  test('se esconden los amigos de la edad, cada uno en un sitio distinto y sin repetir posición seguida', () => {
    [3, 4, 5].forEach((edad) =>
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((semilla) => {
        const plan = planEscondite(edad, azarDe(semilla));
        const n = ESCONDITE.amigos[edad] ?? 0;
        expect(plan).toHaveLength(n);
        expect(new Set(plan.map((e) => e.sitio)).size).toBe(n);
        expect(plan.map((e) => e.amigo).sort()).toEqual(Array.from({ length: n }, (_, i) => i));
        plan.forEach((e, i) => {
          expect(sitioEscondite(e.sitio)).toBeDefined();
          const antes = plan[i - 1];
          if (antes) expect(sitioEscondite(e.sitio)?.posicion).not.toBe(sitioEscondite(antes.sitio)?.posicion);
        });
      }),
    );
  });

  test('con 3 años asoman más que con 4, y con 5 no se les ve', () => {
    expect(ESCONDITE.asoma[3]).toBeGreaterThan(ESCONDITE.asoma[4] ?? 1);
    expect(ESCONDITE.asoma[5]).toBe(0);
  });

  test('Lupi mira antes en otros sitios y encuentra a Tito al final', () => {
    [1, 2, 3].forEach((semilla) => {
      const ruta = busquedaLupi('casita', azarDe(semilla));
      expect(ruta).toHaveLength(ESCONDITE.fallosLupi + 1);
      expect(ruta[ruta.length - 1]).toBe('casita');
      expect(ruta.slice(0, -1)).not.toContain('casita');
      expect(new Set(ruta).size).toBe(ruta.length);
    });
  });
});
