// Pruebas del motor de excursiones (src/dominio/excursiones.ts) y de sus datos (src/contenido/excursiones.ts), fase P5
// de docs/IDEAS-MEJORA.md (desde la P17, también el zoo). Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  EXCURSION,
  diaYMes,
  vecesTexto,
  estacionesJugables,
  siguienteEstacion,
  terminarEstacion,
  terminarVisita,
  visitaCompleta,
  visitaDe,
} from '../../src/dominio/excursiones.ts';
import { EXCURSIONES, excursionPorId } from '../../src/contenido/excursiones.ts';

const granja = excursionPorId('granja')!;

describe('las excursiones', () => {
  test('ids distintos, y la granja tiene ya estaciones jugables con ids distintos', () => {
    const ids = EXCURSIONES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const est = granja.estaciones.map((s) => s.id);
    expect(new Set(est).size).toBe(est.length);
    expect(estacionesJugables(granja).map((s) => s.id)).toEqual([
      'comer',
      'huevos',
      'queso',
      'cepillar',
      'huerto',
      'tractor',
    ]);
  });

  test('lo guardado roto o de antes se lee como una visita vacía', () => {
    expect(visitaDe(undefined, 'granja')).toEqual({ vistas: [], veces: 0, foto: false, d: '' });
    expect(visitaDe({ granja: { vistas: ['comer', 3] } }, 'granja').vistas).toEqual(['comer']);
  });

  test('las estaciones se hacen de una en una hasta completar la visita', () => {
    const v0 = visitaDe(undefined, 'granja');
    expect(siguienteEstacion(granja, v0)?.id).toBe('comer');
    const v1 = terminarEstacion(v0, 'comer');
    expect(terminarEstacion(v1, 'comer')).toBe(v1);
    expect(visitaCompleta(granja, v1)).toBe(false);
    expect(siguienteEstacion(granja, v1)?.id).toBe('huevos');
    const v2 = terminarEstacion(v1, 'huevos');
    expect(visitaCompleta(granja, v2)).toBe(false);
    expect(siguienteEstacion(granja, v2)?.id).toBe('queso');
    const v3 = ['queso', 'cepillar', 'huerto', 'tractor'].reduce(terminarEstacion, v2);
    expect(visitaCompleta(granja, v3)).toBe(true);
    expect(siguienteEstacion(granja, v3)).toBeUndefined();
  });

  test('terminar la visita da la foto y monedas la primera vez del día, y la siguiente empieza de cero', () => {
    const v = terminarEstacion(terminarEstacion(visitaDe(undefined, 'granja'), 'comer'), 'huevos');
    const a = terminarVisita(v, '2026-11-09');
    expect(a.monedas).toBe(EXCURSION.monedasVisita);
    expect(a.visita).toEqual({ vistas: [], veces: 1, foto: true, d: '2026-11-09' });
    expect(terminarVisita(a.visita, '2026-11-09').monedas).toBe(0);
    expect(terminarVisita(a.visita, '2026-11-10').monedas).toBe(EXCURSION.monedasVisita);
  });

  test('el álbum dice el día y el mes de la última visita y cuántas veces', () => {
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    expect(diaYMes('2026-11-09', meses)).toBe('9 de noviembre');
    expect(diaYMes('2027-01-31', meses)).toBe('31 de enero');
    expect(diaYMes('', meses)).toBe('');
    expect(diaYMes('2026-13-01', meses)).toBe('');
    expect(vecesTexto(1)).toBe('una vez');
    expect(vecesTexto(3)).toBe('3 veces');
    // desde la fase ID3 de docs/PLAN-IDIOMAS.md, con la función que traduce: las plantillas pasan por ella
    const t = (x: string) => ({ '{dia} de {mes}': '{mes} {dia}', 'una vez': 'once', '{n} veces': '{n} times' })[x] ?? x;
    expect(diaYMes('2026-11-09', meses, t)).toBe('noviembre 9');
    expect(vecesTexto(1, t)).toBe('once');
    expect(vecesTexto(3, t)).toBe('3 times');
  });

  test('la granja tiene animales que pasean, sin repetir', () => {
    expect(granja.animales?.length).toBeGreaterThan(3);
    expect(new Set(granja.animales).size).toBe(granja.animales?.length);
  });

  test('una excursión sin estaciones nunca está completa', () => {
    expect(visitaCompleta(excursionPorId('bosque')!, visitaDe(undefined, 'bosque'))).toBe(false);
  });

  // desde la fase P17: el zoo, con Nico el cuidador, sus cinco recintos y sus animales que pasean
  test('el zoo tiene cinco recintos jugables y se completa al hacerlos todos', () => {
    const zoo = excursionPorId('zoo')!;
    expect(zoo.nombreGuia).toBe('Nico');
    expect(estacionesJugables(zoo).map((s) => s.id)).toEqual(['sabana', 'selva', 'polar', 'reptiles', 'pajarera']);
    expect(new Set(zoo.animales).size).toBe(zoo.animales?.length);
    let v = visitaDe(undefined, 'zoo');
    zoo.estaciones.forEach((s) => {
      expect(visitaCompleta(zoo, v)).toBe(false);
      v = terminarEstacion(v, s.id);
    });
    expect(visitaCompleta(zoo, v)).toBe(true);
  });

  // desde la fase P18: el acuario, con Marina la buceadora y sus cinco salas
  test('el acuario tiene cinco salas jugables con ids distintos', () => {
    const acuario = excursionPorId('acuario')!;
    expect(acuario.nombreGuia).toBe('Marina');
    expect(estacionesJugables(acuario).map((s) => s.id)).toEqual([
      'burbujas',
      'estrellas',
      'delfines',
      'tamanos',
      'ballena',
    ]);
  });

  // desde la fase P19: el museo de los dinosaurios, con Pablo el paleontólogo y sus cinco salas
  test('el museo tiene cinco salas jugables con ids distintos', () => {
    const museo = excursionPorId('museo')!;
    expect(museo.nombreGuia).toBe('Pablo');
    expect(estacionesJugables(museo).map((s) => s.id)).toEqual(['excavacion', 'montar', 'medir', 'comida', 'nido']);
  });

  // desde la fase P20: la ciudad, con Lucía la bombera y sus cinco paradas; el bosque sigue el último
  test('la ciudad tiene cinco paradas jugables y va después del museo y antes del bosque', () => {
    const ciudad = excursionPorId('ciudad')!;
    expect(ciudad.nombreGuia).toBe('Lucía');
    expect(estacionesJugables(ciudad).map((s) => s.id)).toEqual(['vestir', 'fuego', 'pan', 'salud', 'calle']);
    expect(EXCURSIONES.map((e) => e.id).slice(-3)).toEqual(['museo', 'ciudad', 'bosque']);
  });
});
