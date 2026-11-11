// Pruebas de las reglas de los juegos cortos del patio (src/dominio/juegosCortos.ts, fase P12 de docs/IDEAS-MEJORA.md):
// la lista de juegos, las casillas y el plan de la rayuela, el momento bueno del columpio, la portera de los penaltis y el
// plan de las pompas, las estrellas y el viento de la cometa y el plan del pañuelo. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  ARBOLES_COMETA,
  COMETA,
  JUEGOS_CORTOS,
  PANUELO,
  PENALTIS,
  POMPAS,
  RAYUELA,
  casillasRayuela,
  empujonBueno,
  juegoCorto,
  ladosPenalti,
  paradaDe,
  planCometa,
  planPanuelo,
  planPompas,
  planRayuela,
  tocaArbol,
  vientoEn,
} from '../../src/dominio/juegosCortos.ts';

// azarFijo(valores): un azar de prueba que va dando esos valores, en bucle.
const azarFijo = (valores: readonly number[]) => {
  let i = 0;
  return () => valores[i++ % valores.length] ?? 0;
};

describe('los juegos cortos del patio', () => {
  test('son siete con ids distintos; todos menos las sillas ya tienen escena', () => {
    const ids = JUEGOS_CORTOS.map((j) => j.id);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
    expect(juegoCorto('rayuela')?.escena).toBe('rayuela');
    expect(juegoCorto('columpios')?.escena).toBe('columpios');
    expect(juegoCorto('penaltis')?.escena).toBe('penaltis');
    expect(juegoCorto('pompas')?.escena).toBe('pompas');
    expect(juegoCorto('cometa')?.escena).toBe('cometa');
    expect(juegoCorto('panuelo')?.escena).toBe('panuelo');
    expect(juegoCorto('sillas')?.escena).toBeUndefined();
    expect(juegoCorto('nada')).toBeUndefined();
  });

  test('la rayuela tiene sus casillas como en la tiza: sueltas y por parejas, hasta el número de cada edad', () => {
    const diez = casillasRayuela(5);
    expect(diez.map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(diez.find((c) => c.n === 4)).toEqual({ n: 4, col: 3, fila: 'abajo' });
    expect(diez.find((c) => c.n === 5)).toEqual({ n: 5, col: 3, fila: 'arriba' });
    expect(diez.find((c) => c.n === 10)).toEqual({ n: 10, col: 7, fila: 'sola' });
    expect(casillasRayuela(3).map((c) => c.n)).toEqual([1, 2, 3, 4, 5]);
    expect(casillasRayuela(4)).toHaveLength(8);
    expect(casillasRayuela(9)).toHaveLength(10);
  });

  test('el plan de la rayuela: números distintos de su rayuela, empezando por uno fácil', () => {
    [3, 4, 5].forEach((edad) =>
      [0, 0.3, 0.7, 0.99].forEach((a) => {
        const plan = planRayuela(edad, azarFijo([a, 0.5, 0.1, 0.9, 0.2]));
        expect(plan).toHaveLength(RAYUELA.rondas);
        expect(new Set(plan).size).toBe(plan.length);
        expect(plan[0]).toBeGreaterThanOrEqual(1);
        expect(plan[0]).toBeLessThanOrEqual(3);
        plan.forEach((n) => expect(n).toBeLessThanOrEqual(RAYUELA.hasta[edad] ?? 10));
      }),
    );
  });

  test('el columpio se empuja cuando está atrás del todo; con 3 años hay más margen', () => {
    expect(empujonBueno(0.25, 5)).toBe(true);
    expect(empujonBueno(0.35, 5)).toBe(true);
    expect(empujonBueno(0.37, 5)).toBe(false);
    expect(empujonBueno(0.4, 3)).toBe(true);
    expect(empujonBueno(0.75, 3)).toBe(false);
    expect(empujonBueno(1.25, 4)).toBe(true);
    expect(empujonBueno(-0.75, 4)).toBe(true);
  });

  test('los penaltis: izquierda y derecha (con 5 años, también arriba) y la portera para pocas veces', () => {
    expect(ladosPenalti(3)).toEqual(['izquierda', 'derecha']);
    expect(ladosPenalti(5)).toEqual(['izquierda', 'arriba', 'derecha']);
    // azar por debajo de lo que para con 4 años (22 de 100): se tira al mismo lado
    expect(paradaDe('izquierda', 4, azarFijo([0.1]))).toBe('izquierda');
    // si no, se tira al otro lado: gol
    expect(paradaDe('izquierda', 4, azarFijo([0.9, 0]))).toBe('derecha');
    expect(paradaDe('arriba', 5, azarFijo([0.5, 0.99]))).not.toBe('arriba');
    // contando muchas veces, la portera para menos que lo que dice PENALTIS.para (con un poco de margen)
    let semilla = 7;
    const azar = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;
    const paradas = Array.from({ length: 1000 }, () => paradaDe('derecha', 3, azar)).filter((l) => l === 'derecha');
    expect(paradas.length).toBeLessThan((PENALTIS.para[3] ?? 15) * 10 + 50);
  });

  test('las pompas: los colores de la edad, una ronda por color sin repetir seguido', () => {
    [3, 4, 5].forEach((edad) => {
      const { colores, rondas } = planPompas(edad, azarFijo([0.3, 0.8, 0.1, 0.6]));
      expect(colores).toHaveLength(POMPAS.colores[edad] ?? 0);
      expect(rondas).toHaveLength(POMPAS.rondas);
      rondas.forEach((r, i) => {
        expect(colores).toContain(r.color);
        expect(r.cuantas).toBe(POMPAS.cuantas[edad]);
        if (i > 0) expect(r.color).not.toBe(rondas[i - 1]!.color);
      });
    });
  });

  test('la cometa: las estrellas de la edad, en el cielo, lejos de los árboles y de la anterior', () => {
    let semilla = 3;
    const azar = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;
    [3, 4, 5].forEach((edad) =>
      Array.from({ length: 20 }).forEach(() => {
        const plan = planCometa(edad, azar);
        expect(plan).toHaveLength(COMETA.estrellas[edad] ?? 0);
        plan.forEach((p, i) => {
          expect(tocaArbol(p, COMETA.margen)).toBeUndefined();
          expect(p.y).toBeGreaterThanOrEqual(COMETA.cielo.y0);
          expect(p.y).toBeLessThanOrEqual(COMETA.cielo.y1);
          const antes = plan[i - 1];
          if (antes) expect(Math.hypot(p.x - antes.x, p.y - antes.y)).toBeGreaterThanOrEqual(COMETA.lejos);
        });
      }),
    );
    // un azar que siempre da lo mismo: no puede alejarse, pero no se queda sin estrellas
    expect(planCometa(4, () => 0.5)).toHaveLength(5);
  });

  test('la cometa: los árboles se tocan cerca de su copa; el viento cambia de lado y sopla más con 5 años', () => {
    const a = ARBOLES_COMETA[0]!;
    expect(tocaArbol({ x: a.x, y: a.y })).toBe(a);
    expect(tocaArbol({ x: 800, y: 250 })).toBeUndefined();
    expect(vientoEn(0, 3, [1, -1])).toBe(COMETA.viento[3]);
    expect(vientoEn(COMETA.cambia + 0.1, 3, [1, -1])).toBe(-(COMETA.viento[3] ?? 0));
    expect(vientoEn(COMETA.cambia * 2 + 0.1, 5, [1, -1])).toBe(COMETA.viento[5]);
    expect(Math.abs(vientoEn(1, 5, [1]))).toBeGreaterThan(Math.abs(vientoEn(1, 3, [1])));
    expect(vientoEn(-3, 4, [])).toBe(COMETA.viento[4]);
  });

  test('el pañuelo: los amigos de la edad (con 5 años, descolocados) y números que no se repiten seguidos', () => {
    [3, 4, 5].forEach((edad) =>
      [0.1, 0.5, 0.9].forEach((a) => {
        const { fila, pedidos } = planPanuelo(edad, azarFijo([a, 0.7, 0.2, 0.95, 0.4]));
        const n = PANUELO.equipo[edad] ?? 0;
        expect([...fila].sort()).toEqual(Array.from({ length: n }, (_, i) => i + 1));
        expect(pedidos).toHaveLength(PANUELO.rondas);
        pedidos.forEach((k, i) => {
          expect(fila).toContain(k);
          if (i > 0) expect(k).not.toBe(pedidos[i - 1]);
        });
      }),
    );
    expect(planPanuelo(3, () => 0.5).fila).toEqual([1, 2, 3]);
    expect(planPanuelo(5, azarFijo([0.9, 0.1, 0.5, 0.3, 0.7])).fila).toEqual([2, 4, 3, 5, 1]);
  });
});
