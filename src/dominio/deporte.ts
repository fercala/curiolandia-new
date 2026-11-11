/*
 * dominio/deporte.ts: las reglas del gran día del deporte del patio del cole (idea 17 de docs/IDEAS-MEJORA.md, fase
 * P11). Es una jornada larga: cinco pruebas seguidas (la carrera, el salto de longitud, la puntería, el equilibrio y los
 * relevos), cada una con su medalla (oro, plata o bronce: siempre hay medalla) y, al terminarlas todas, el medallero y
 * la copa. La copa se gana una vez por semana (la primera jornada terminada de cada semana); las demás jornadas de la
 * semana se juegan igual, con sus medallas. Lo guardado, en S.deporte (las copas y la semana de la última).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/deporte.test.ts.
 * Exporta: los tipos Medalla, PruebaDeporte y RegistroDeporte, MEDALLAS, PRUEBAS_DEPORTE, medallaDe, semanaDe,
 * registroDeporte, ganarCopa y fraseMedallero.
 * Importa: rellena, de dominio/idiomas.ts (desde la fase ID2f).
 */
import { rellena } from './idiomas.ts';
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (lo que pide cada medalla según la
   edad y las cuentas del calendario), en tablas con nombre. */

/** Una medalla: oro, plata o bronce. */
export type Medalla = 'oro' | 'plata' | 'bronce';
/** Una prueba de la jornada: su id, su nombre, la escena que la juega y lo que pide cada medalla según la edad (los
 * puntos de la prueba para el oro y para la plata; menos, bronce). */
export interface PruebaDeporte {
  readonly id: string;
  readonly nombre: string;
  readonly escena: string;
  readonly oro: Readonly<Record<number, number>>;
  readonly plata: Readonly<Record<number, number>>;
}
/** Lo que se guarda del día del deporte (S.deporte): cuántas copas se han ganado y la semana de la última. */
export interface RegistroDeporte {
  readonly copas: number;
  readonly semana: string;
}

// MEDALLAS: las medallas, de la mejor a la peor.
export const MEDALLAS: readonly Medalla[] = ['oro', 'plata', 'bronce'];

// PRUEBAS_DEPORTE: las cinco pruebas, en el orden en que se hacen. Los puntos de cada una: la carrera, 4 menos el
// lugar en el que llega Tito (3 si gana); el salto, los palmos que salta (el mejor de tres saltos); la puntería, las
// canastas de cinco tiros; el equilibrio, las cuentas aguantadas a la pata coja (siempre todas: es de confianza); los
// relevos, los pases buenos del testigo (de tres).
export const PRUEBAS_DEPORTE: readonly PruebaDeporte[] = [
  { id: 'carrera', nombre: 'la carrera', escena: 'carreras', oro: { 3: 3, 4: 3, 5: 3 }, plata: { 3: 2, 4: 2, 5: 2 } },
  {
    id: 'salto',
    nombre: 'el salto de longitud',
    escena: 'deporteSalto',
    oro: { 3: 7, 4: 8, 5: 9 },
    plata: { 3: 5, 4: 6, 5: 7 },
  },
  {
    id: 'punteria',
    nombre: 'la puntería',
    escena: 'deportePunteria',
    oro: { 3: 2, 4: 3, 5: 4 },
    plata: { 3: 1, 4: 2, 5: 2 },
  },
  {
    id: 'equilibrio',
    nombre: 'el equilibrio',
    escena: 'deporteEquilibrio',
    oro: { 3: 2, 4: 2, 5: 2 },
    plata: { 3: 1, 4: 1, 5: 1 },
  },
  {
    id: 'relevos',
    nombre: 'los relevos',
    escena: 'deporteRelevos',
    oro: { 3: 2, 4: 3, 5: 3 },
    plata: { 3: 1, 4: 2, 5: 2 },
  },
];

// medallaDe(id, puntos, edad): la medalla de la prueba id con esos puntos y esa edad (3, 4 o 5; otra edad cuenta como
// la más cercana). Si la prueba no existe, bronce.
export function medallaDe(id: string, puntos: number, edad: number): Medalla {
  const p = PRUEBAS_DEPORTE.find((x) => x.id === id),
    e = Math.min(5, Math.max(3, Math.round(edad)));
  if (!p) return 'bronce';
  if (puntos >= (p.oro[e] ?? 0)) return 'oro';
  if (puntos >= (p.plata[e] ?? 0)) return 'plata';
  return 'bronce';
}

// semanaDe(hoy): la semana del día hoy ('AAAA-MM-DD') como texto 'AAAA-MM-DD' de su lunes. Dos días de la misma semana
// (de lunes a domingo) dan lo mismo. Usa la hora UTC para no depender del cambio de hora.
export function semanaDe(hoy: string): string {
  const [a, m, d] = hoy.split('-').map(Number),
    t = Date.UTC(a ?? 2000, (m ?? 1) - 1, d ?? 1),
    // getUTCDay: 0 domingo ... 6 sábado; días desde el lunes
    desdeLunes = (new Date(t).getUTCDay() + 6) % 7;
  return new Date(t - desdeLunes * 86400000).toISOString().slice(0, 10);
}

// registroDeporte(r): lo guardado si tiene la forma buena; si no (partidas de antes o algo roto), sin copas.
export function registroDeporte(r: unknown): RegistroDeporte {
  const x = r as Partial<RegistroDeporte> | null | undefined;
  if (!x || typeof x !== 'object') return { copas: 0, semana: '' };
  return {
    copas: typeof x.copas === 'number' && x.copas > 0 ? Math.floor(x.copas) : 0,
    semana: typeof x.semana === 'string' ? x.semana : '',
  };
}

// ganarCopa(r, hoy): al terminar una jornada el día hoy. Si esta semana aún no se había ganado la copa, se gana: una
// copa más y la semana apuntada. Devuelve el registro nuevo y si la copa es nueva. No cambia r.
export function ganarCopa(r: unknown, hoy: string): { registro: RegistroDeporte; nueva: boolean } {
  const reg = registroDeporte(r),
    semana = semanaDe(hoy);
  if (reg.semana === semana) return { registro: reg, nueva: false };
  return { registro: { copas: reg.copas + 1, semana }, nueva: true };
}

// NOMBRES_NUMERO: cómo se dicen en castellano los números de medallas de una clase, de 2 a 5 (el 1 va en la plantilla).
const NOMBRES_NUMERO: Readonly<Record<number, string>> = { 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco' };

// fraseMedallero(medallas, t): lo que dice Tito en el medallero: cuántas medallas de cada clase («Tienes tres medallas
// de oro, una de plata...»), solo las que hay. medallas: id de la prueba -> medalla. t: cómo se traduce cada texto
// (desde la fase ID2f de docs/PLAN-IDIOMAS.md, tr de nucleo/traducir.ts; sin t, en castellano): la frase se hace con
// plantillas enteras, rellenas con rellena. numero: cómo se dice el
// número de 2 a 5 (desde la fase ID3, en femenino en el idioma del juego: «două medalii»; sin él, NOMBRES_NUMERO con t).
export function fraseMedallero(
  medallas: Readonly<Record<string, Medalla>>,
  t: (texto: string) => string = (x) => x,
  numero: (n: number) => string | number = (n) => (NOMBRES_NUMERO[n] ? t(NOMBRES_NUMERO[n]) : n),
): string {
  const cuenta = (m: Medalla) => Object.values(medallas).filter((x) => x === m).length,
    // la primera clase lleva la palabra medalla («dos medallas de oro»); las demás no («una de plata»)
    partes = MEDALLAS.map((m) => [m, cuenta(m)] as const)
      .filter(([, n]) => n > 0)
      .map(([m, n], i) =>
        n === 1
          ? rellena(t(i === 0 ? 'una medalla de {medalla}' : 'una de {medalla}'), { medalla: t(m) })
          : rellena(t(i === 0 ? '{n} medallas de {medalla}' : '{n} de {medalla}'), {
              n: numero(n),
              medalla: t(m),
            }),
      );
  if (!partes.length) return '';
  const lista =
    partes.length === 1
      ? partes[0]!
      : rellena(t('{lista} y {ultimo}'), { lista: partes.slice(0, -1).join(', '), ultimo: partes[partes.length - 1]! });
  return rellena(t('Tienes {lista}.'), { lista });
}
