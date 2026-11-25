/*
 * dominio/informe.ts: las reglas del informe semanal para la familia (idea 41 de docs/IDEAS-MEJORA.md, en la PR de todas
 * las ideas pendientes, v0.2.181). Con lo que ya guarda la partida (los minutos de cada día, S.days; el diario de Tito,
 * S.diario; y los aciertos de cada habilidad, S.stats) resume los últimos siete días: minutos jugados, días que ha
 * jugado, qué ha hecho (cuántas veces cada cosa del diario), lo que mejor se le da y lo que más le cuesta. La página la
 * pinta en el Resumen de la zona de adultos (aplicacion/adultos/informe.ts), con un botón para compartirlo con la profe.
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/informe.test.ts.
 * Exporta: el tipo InformeSemana, DIAS_INFORME e informeSemana.
 * Importa: diasEntre, etiquetaHabilidad y ordenHabilidades (dominio/zonaAdultos.ts), y los tipos del diario.
 */
import { diasEntre, etiquetaHabilidad, ordenHabilidades, type AciertosHabilidad } from './zonaAdultos.ts';
import { registroDiario, type ClaveDiario } from './diario.ts';

// DIAS_INFORME: cuántos días mira el informe (hoy y los seis anteriores).
export const DIAS_INFORME = 7;

/** El informe de la semana: minutos, días jugados, cuántas veces cada cosa del diario, la habilidad que mejor se le da y
 * la que más le cuesta (vacías si no hay ninguna). */
export interface InformeSemana {
  readonly minutos: number;
  readonly dias: number;
  readonly cosas: readonly { readonly clave: ClaveDiario; readonly veces: number }[];
  readonly sabe: string;
  readonly cuesta: string;
}

// enLaSemana(fecha, hoy): ¿es fecha uno de los DIAS_INFORME últimos días (hoy incluido)?
const enLaSemana = (fecha: string, hoy: string): boolean => {
  const d = diasEntre(fecha, hoy);
  return d >= 0 && d < DIAS_INFORME;
};

// informeSemana(days, diario, stats, hoy): el informe de los últimos siete días. Las cosas del diario van de la más
// repetida a la menos; «sabe» es la habilidad más practicada que ya sabe y «cuesta», la que más le cuesta.
export function informeSemana(
  days: Readonly<Record<string, number>> | undefined,
  diario: unknown,
  stats: Readonly<Record<string, AciertosHabilidad>> | undefined,
  hoy: string,
): InformeSemana {
  const semana = Object.entries(days ?? {}).filter(([f, m]) => enLaSemana(f, hoy) && Number(m) > 0),
    veces = new Map<ClaveDiario, number>();
  Object.entries(registroDiario(diario))
    .filter(([f]) => enLaSemana(f, hoy))
    .forEach(([, cosas]) => cosas.forEach((c) => veces.set(c, (veces.get(c) ?? 0) + 1)));
  const orden = ordenHabilidades(stats ?? {}),
    etiqueta = (k: string) => etiquetaHabilidad((stats ?? {})[k]!);
  return {
    minutos: Math.round(semana.reduce((a, [, m]) => a + Number(m), 0)),
    dias: semana.length,
    cosas: [...veces.entries()]
      .map(([clave, n]) => ({ clave, veces: n }))
      .sort((a, b) => b.veces - a.veces || a.clave.localeCompare(b.clave)),
    sabe: orden.find((k) => etiqueta(k) === 'sabe') ?? '',
    cuesta: orden.find((k) => etiqueta(k) === 'cuesta') ?? '',
  };
}
