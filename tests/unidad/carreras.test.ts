// Pruebas de las carreras de Tito en el patio (src/dominio/carreras.ts), fase P10 de docs/IDEAS-MEJORA.md. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  CARRERA,
  CORREDORES,
  choca,
  enElAire,
  lugaresDelPodio,
  planCarrera,
  podio,
  velocidad,
} from '../../src/dominio/carreras.ts';

// azarFijo(semilla): un azar repetible (siempre la misma serie para la misma semilla), para que las pruebas no cambien.
function azarFijo(semilla: number): () => number {
  const estado = { s: semilla };
  return () => {
    estado.s = (estado.s * 9301 + 49297) % 233280;
    return estado.s / 233280;
  };
}

describe('carreras de Tito', () => {
  test('con 3 años: 6 obstáculos separados, sin cruce ni números, y una estrella arriba en cada uno', () => {
    [1, 2, 3, 4, 5].forEach((sem) => {
      const p = planCarrera(3, azarFijo(sem));
      expect(p.obstaculos).toHaveLength(6);
      expect(p.cruce).toBeNull();
      expect(p.numeros).toBe(false);
      p.obstaculos.slice(1).forEach((o, i) => expect(o.d - (p.obstaculos[i]?.d ?? 0)).toBeGreaterThanOrEqual(16));
      p.obstaculos.forEach((o) => {
        expect(o.d).toBeLessThan(p.largo - 10);
        expect(p.premios.some((x) => x.arriba && x.d === o.d)).toBe(true);
      });
    });
  });

  test('desde los 4 años hay cruce, sin obstáculos en él, con 3 estrellas en el lado bueno y 1 en el otro', () => {
    [1, 2, 3, 4, 5, 6].forEach((sem) => {
      const p = planCarrera(4, azarFijo(sem)),
        c = p.cruce;
      expect(c).not.toBeNull();
      if (!c) return;
      p.obstaculos.forEach((o) => expect(o.d < c.d - 4 || o.d > c.fin + 4).toBe(true));
      expect(p.premios.filter((x) => x.lado === c.bueno)).toHaveLength(3);
      expect(p.premios.filter((x) => x.lado && x.lado !== c.bueno)).toHaveLength(1);
    });
  });

  test('a los 5 años, los números del 1 al 5 arriba, en orden y lejos de los obstáculos', () => {
    [1, 2, 3, 4, 5, 6, 7].forEach((sem) => {
      const p = planCarrera(5, azarFijo(sem)),
        nums = p.premios.filter((x) => x.tipo === 'numero');
      expect(nums.map((x) => x.n)).toEqual([1, 2, 3, 4, 5]);
      nums.slice(1).forEach((x, i) => expect(x.d).toBeGreaterThan(nums[i]?.d ?? 0));
      nums.forEach((x) => {
        expect(x.arriba).toBe(true);
        p.obstaculos.forEach((o) => expect(Math.abs(o.d - x.d)).toBeGreaterThan(CARRERA.alcance * 2));
      });
    });
  });

  test('el salto, el choque y el tropiezo', () => {
    expect(enElAire(1, null)).toBe(false);
    expect(enElAire(1.2, 1)).toBe(true);
    expect(enElAire(1 + CARRERA.salto, 1)).toBe(false);
    expect(choca(40, { d: 40.5 })).toBe(true);
    expect(choca(40, { d: 45 })).toBe(false);
    expect(velocidad(10, 5, null)).toBe(10);
    expect(velocidad(10, 5.5, 5)).toBeLessThan(10);
    expect(velocidad(10, 5 + CARRERA.tropiezo, 5)).toBe(10);
  });

  test('Tito sin tropezar gana; con un tropiezo, también; con tres ya no', () => {
    const tiempo = (vel: number, tropiezos: number) =>
      CARRERA.largo / vel + tropiezos * CARRERA.tropiezo * (1 - CARRERA.velTropiezo);
    const [tito, ...amigos] = CORREDORES,
      mejorAmigo = Math.min(...amigos.map((c) => tiempo(c.vel, 0)));
    expect(tiempo(tito?.vel ?? 0, 0)).toBeLessThan(mejorAmigo);
    expect(tiempo(tito?.vel ?? 0, 1)).toBeLessThan(mejorAmigo);
    expect(tiempo(tito?.vel ?? 0, 3)).toBeGreaterThan(mejorAmigo);
  });

  test('el podio ordena por llegada y lo dice con los ordinales', () => {
    const ids = ['tito', 'polly', 'lupi'];
    expect(podio(ids, { tito: 17, polly: 16, lupi: 19 })).toEqual(['polly', 'tito', 'lupi']);
    expect(podio(ids, { lupi: 3 })).toEqual(['lupi', 'tito', 'polly']);
    expect(lugaresDelPodio(['polly', 'tito', 'nadie'])).toEqual([
      { lugar: 'primer lugar', nombre: 'Polly' },
      { lugar: 'segundo lugar', nombre: 'Tito' },
    ]);
  });
});
