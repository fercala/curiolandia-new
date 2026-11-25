/*
 * dominio/experimentos.ts: las reglas del taller de experimentos del cole (idea 30 de docs/IDEAS-MEJORA.md, en la PR de
 * todas las ideas pendientes, v0.2.181): mezclar colores, los imanes, las sombras, el ciclo del agua y la semilla que
 * crece con los días de verdad (con la regla común de dominio/crecer.ts y lo guardado en S.crece, con el id de
 * SEMILLA). Las escenas, en escenas/experimentos.ts.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/experimentos.test.ts.
 * Exporta: el tipo Color, COLORES_BASE, MEZCLAS, mezcla, OBJETOS_IMAN, planImanes, planSombras, PASOS_AGUA, SEMILLA y
 * etapaSemilla.
 * Importa: etapaPorDias (dominio/crecer.ts) y el tipo Azar (dominio/logica.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (cuántos objetos, días de cada etapa),
   en tablas con nombre. */
import { etapaPorDias } from './crecer.ts';
import type { Azar } from './logica.ts';

// elige(lista, n, azar): n elementos distintos de la lista, al azar.
function elige<T>(lista: readonly T[], n: number, azar: Azar): T[] {
  return lista
    .map((x) => ({ x, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((o) => o.x);
}

// ── Mezclar colores ──
/** Un color del taller. */
export type Color = 'rojo' | 'amarillo' | 'azul' | 'naranja' | 'verde' | 'morado';
// COLORES_BASE: los tres botes de pintura.
export const COLORES_BASE: readonly Color[] = ['rojo', 'amarillo', 'azul'];
// MEZCLAS: lo que sale de mezclar dos colores base distintos, con la frase entera que dice Tito.
export const MEZCLAS: readonly { a: Color; b: Color; sale: Color; frase: string }[] = [
  { a: 'rojo', b: 'amarillo', sale: 'naranja', frase: '¡El rojo y el amarillo hacen el naranja!' },
  { a: 'amarillo', b: 'azul', sale: 'verde', frase: '¡El amarillo y el azul hacen el verde!' },
  { a: 'rojo', b: 'azul', sale: 'morado', frase: '¡El rojo y el azul hacen el morado!' },
];
// mezcla(a, b): la mezcla de dos colores base (en cualquier orden), o null si son el mismo.
export const mezcla = (a: Color, b: Color): (typeof MEZCLAS)[number] | null =>
  MEZCLAS.find((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a)) ?? null;

// ── Los imanes ──
// OBJETOS_IMAN: los objetos que se prueban con el imán y si son de metal (el imán los atrae).
export const OBJETOS_IMAN: readonly { k: string; metal: boolean }[] = [
  { k: 'tijeras', metal: true },
  { k: 'moneda', metal: true },
  { k: 'campana', metal: true },
  { k: 'olla', metal: true },
  { k: 'pluma', metal: false },
  { k: 'hoja', metal: false },
  { k: 'pelota', metal: false },
  { k: 'zapato', metal: false },
  { k: 'libro', metal: false },
];
// planImanes(azar): seis objetos, tres de metal y tres que no, en orden al azar.
export function planImanes(azar: Azar): { k: string; metal: boolean }[] {
  const si = elige(
      OBJETOS_IMAN.filter((o) => o.metal),
      3,
      azar,
    ),
    no = elige(
      OBJETOS_IMAN.filter((o) => !o.metal),
      3,
      azar,
    );
  return elige([...si, ...no], 6, azar);
}

// ── Las sombras ──
// DIBUJOS_SOMBRA: los dibujos de las sombras (de formas muy distintas).
const DIBUJOS_SOMBRA = ['elefante', 'jirafa', 'conejo', 'caracol', 'arbol', 'casa', 'cohete', 'pato', 'estrella'];
// planSombras(edad, azar): cuatro rondas; en cada una, un objeto y sus sombras para elegir (2 con 3 años, 3 con más),
// con la buena entre ellas.
export function planSombras(edad: number, azar: Azar): { objeto: string; sombras: string[] }[] {
  const n = edad <= 3 ? 2 : 3;
  return elige(DIBUJOS_SOMBRA, 4, azar).map((objeto) => ({
    objeto,
    sombras: elige(
      [
        objeto,
        ...elige(
          DIBUJOS_SOMBRA.filter((k) => k !== objeto),
          n - 1,
          azar,
        ),
      ],
      n,
      azar,
    ),
  }));
}

// ── El ciclo del agua ──
// PASOS_AGUA: los pasos del ciclo del agua, en orden, con su dibujo y la frase que dice Tito.
export const PASOS_AGUA: readonly { dibujo: string; frase: string }[] = [
  { dibujo: 'sol', frase: 'El sol calienta el agua del mar.' },
  { dibujo: 'nube', frase: 'El agua sube al cielo y forma las nubes.' },
  { dibujo: 'lluvia', frase: 'De las nubes cae la lluvia.' },
  { dibujo: 'pez', frase: 'La lluvia baja por el río y vuelve al mar.' },
];

// ── La semilla ──
// SEMILLA: la semilla del taller: su id en S.crece y los días regados que pide cada etapa (semilla, brote, planta,
// flor).
export const SEMILLA = { id: 'taller:semilla', dias: [1, 2, 4] } as const;
// etapaSemilla(dias): la etapa de la semilla con esos días regados: 0 (semilla), 1 (brote), 2 (planta) o 3 (flor).
export const etapaSemilla = (dias: number): number => etapaPorDias(dias, SEMILLA.dias);
