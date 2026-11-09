/*
 * contenido/excursiones.ts: las excursiones del autobús del cole (base B1 de docs/IDEAS-MEJORA.md, fase P5) y sus
 * estaciones. La granja escuela (idea 1) es la primera: la granjera Rosa enseña la granja; desde la P5 se puede dar de
 * comer a los animales y recoger huevos, y desde la P6 también hacer queso, cepillar al caballo, el huerto y el paseo en
 * tractor (escenas/granjaTalleres.ts); las crías llegarán en su fase. El zoo y el bosque, sin estaciones todavía, salen en el
 * autobús como «¡Muy pronto!».
 * Es CONTENIDO: solo datos, sin dibujo ni S. Las reglas, en dominio/excursiones.ts. Pruebas: tests/unidad/excursiones.test.ts.
 * Exporta: EXCURSIONES y excursionPorId.
 * Importa: el tipo Excursion de dominio/excursiones.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las posiciones de las estaciones en la pantalla de 1600x900. */
import type { Excursion } from '../dominio/excursiones.ts';

// EXCURSIONES: las excursiones, en el orden de sus carteles en el autobús.
export const EXCURSIONES: readonly Excursion[] = [
  {
    id: 'granja',
    nombre: 'La granja escuela',
    icono: 'vaca',
    guia: 'granjera',
    nombreGuia: 'Rosa',
    animales: ['vaca', 'caballo', 'cerdo', 'oveja', 'gallina', 'pollito', 'pato'],
    estaciones: [
      { id: 'comer', nombre: 'Dar de comer a los animales', escena: 'granjaComer', icono: 'zanahoria', x: 330, y: 560 },
      { id: 'huevos', nombre: 'Recoger huevos', escena: 'granjaHuevos', icono: 'huevo', x: 640, y: 690 },
      { id: 'queso', nombre: 'Ordeñar y hacer queso', escena: 'granjaQueso', icono: 'queso', x: 950, y: 690 },
      { id: 'cepillar', nombre: 'Cepillar al caballo', escena: 'granjaCepillar', icono: 'caballo', x: 1260, y: 560 },
      { id: 'huerto', nombre: 'El huerto', escena: 'granjaHuerto', icono: 'lechuga', x: 1180, y: 330 },
      { id: 'tractor', nombre: 'Paseo en tractor', escena: 'granjaTractor', icono: 'tractor', x: 420, y: 330 },
    ],
  },
  { id: 'zoo', nombre: 'El zoo', icono: 'leon', guia: 'granjera', nombreGuia: '', estaciones: [] },
  { id: 'bosque', nombre: 'El bosque', icono: 'arbol', guia: 'granjera', nombreGuia: '', estaciones: [] },
];

// excursionPorId(id): la excursión con ese id, o undefined.
export function excursionPorId(id: string): Excursion | undefined {
  return EXCURSIONES.find((e) => e.id === id);
}
