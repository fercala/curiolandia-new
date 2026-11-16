/*
 * contenido/excursiones.ts: las excursiones del autobús del cole (base B1 de docs/IDEAS-MEJORA.md, fase P5) y sus
 * estaciones. La granja escuela (idea 1) es la primera: la granjera Rosa enseña la granja; desde la P5 se puede dar de
 * comer a los animales y recoger huevos, y desde la P6 también hacer queso, cepillar al caballo, el huerto y el paseo en
 * tractor (escenas/granjaTalleres.ts). Desde la P17, el zoo (idea 2), con Nico el cuidador y cinco recintos
 * (escenas/zoo.ts): la sabana, la selva, la zona polar, la casa de los reptiles y la gran pajarera; sus animales pasean
 * por el plano y se les puede hacer fotos (el safari fotográfico). Desde la P18, el acuario (idea 3), con Marina la
 * buceadora, el túnel debajo del agua y cinco salas (escenas/acuario.ts). Desde la P19, el museo de los dinosaurios
 * (idea 4), con Pablo el paleontólogo y cinco salas (escenas/museo.ts). Desde la P20, la ciudad (idea 5), con
 * Lucía la bombera: el parque de bomberos, la panadería, el centro de salud y la calle (escenas/ciudad.ts). El bosque, sin estaciones todavía, sale en el autobús
 * como «¡Muy pronto!».
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
  {
    id: 'zoo',
    nombre: 'El zoo',
    icono: 'leon',
    guia: 'cuidador',
    nombreGuia: 'Nico',
    animales: ['leon', 'elefante', 'jirafa', 'cebra', 'tigre', 'mono', 'cocodrilo', 'pinguino'],
    estaciones: [
      { id: 'sabana', nombre: 'La sabana', escena: 'zooSabana', icono: 'jirafa', x: 330, y: 560 },
      { id: 'selva', nombre: 'La selva', escena: 'zooSelva', icono: 'mono', x: 640, y: 700 },
      { id: 'polar', nombre: 'La zona polar', escena: 'zooPolar', icono: 'pinguino', x: 960, y: 700 },
      { id: 'reptiles', nombre: 'La casa de los reptiles', escena: 'zooReptiles', icono: 'cocodrilo', x: 1260, y: 560 },
      { id: 'pajarera', nombre: 'La gran pajarera', escena: 'zooPajarera', icono: 'buho', x: 1180, y: 330 },
    ],
  },
  {
    id: 'acuario',
    nombre: 'El acuario',
    icono: 'delfin',
    guia: 'buceadora',
    nombreGuia: 'Marina',
    estaciones: [
      { id: 'burbujas', nombre: 'Las burbujas', escena: 'acuarioBurbujas', icono: 'pez', x: 330, y: 560 },
      {
        id: 'estrellas',
        nombre: 'Las estrellas de mar',
        escena: 'acuarioEstrellas',
        icono: 'estrellaMar',
        x: 640,
        y: 700,
      },
      {
        id: 'delfines',
        nombre: 'La piscina de los delfines',
        escena: 'acuarioDelfines',
        icono: 'delfin',
        x: 960,
        y: 700,
      },
      { id: 'tamanos', nombre: 'La sala de los tamaños', escena: 'acuarioTamanos', icono: 'pulpo', x: 1260, y: 560 },
      { id: 'ballena', nombre: 'La cueva de la ballena', escena: 'acuarioBallena', icono: 'ballena', x: 1180, y: 330 },
    ],
  },
  {
    id: 'museo',
    nombre: 'El museo de los dinosaurios',
    icono: 'tiranosaurio',
    guia: 'paleontologo',
    nombreGuia: 'Pablo',
    estaciones: [
      { id: 'excavacion', nombre: 'La excavación', escena: 'museoExcavacion', icono: 'fosil', x: 330, y: 560 },
      {
        id: 'montar',
        nombre: 'Montar los dinosaurios',
        escena: 'museoMontar',
        icono: 'triceratops',
        x: 640,
        y: 700,
      },
      { id: 'medir', nombre: 'La sala de medir', escena: 'museoMedir', icono: 'diplodoco', x: 960, y: 700 },
      { id: 'comida', nombre: '¿Qué comían?', escena: 'museoComida', icono: 'tiranosaurio', x: 1260, y: 560 },
      { id: 'nido', nombre: 'El nido de los dinosaurios', escena: 'museoNido', icono: 'huevoDino', x: 1180, y: 330 },
    ],
  },
  {
    id: 'ciudad',
    nombre: 'La ciudad',
    icono: 'camionBomberos',
    guia: 'bombera',
    nombreGuia: 'Lucía',
    estaciones: [
      { id: 'vestir', nombre: 'Vestirse de bombero', escena: 'ciudadVestir', icono: 'bombera', x: 330, y: 560 },
      { id: 'fuego', nombre: 'Apagar el fuego', escena: 'ciudadFuego', icono: 'manguera', x: 640, y: 700 },
      { id: 'pan', nombre: 'La panadería', escena: 'ciudadPan', icono: 'pan', x: 960, y: 700 },
      { id: 'salud', nombre: 'El centro de salud', escena: 'ciudadSalud', icono: 'medico', x: 1260, y: 560 },
      { id: 'calle', nombre: 'Cruzar la calle', escena: 'ciudadCalle', icono: 'semaforo', x: 1180, y: 330 },
    ],
  },
  { id: 'bosque', nombre: 'El bosque', icono: 'arbol', guia: 'granjera', nombreGuia: '', estaciones: [] },
];

// excursionPorId(id): la excursión con ese id, o undefined.
export function excursionPorId(id: string): Excursion | undefined {
  return EXCURSIONES.find((e) => e.id === id);
}
