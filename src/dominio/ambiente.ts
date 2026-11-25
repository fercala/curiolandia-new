/*
 * dominio/ambiente.ts: qué suena de fondo en cada sitio (idea 43 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.181): los sonidos de ambiente (pájaros en el mapa, la granja, el zoo y el bosque; olas en la playa y en
 * el acuario; viento en el bosque) y la música propia de los sitios que la tienen (el mar y el bosque). Se elige por el
 * principio del nombre de la escena (las estaciones de cada excursión empiezan por su nombre: playaCastillo, bosqueHojas...).
 * Es una regla pura, sin sonido ni S: lo hace sonar nucleo/sonido.ts (ponAmbiente) desde escenas/ambiente.ts.
 * Pruebas: tests/unidad/ambiente.test.ts.
 * Exporta: el tipo Ambiente, ambienteDe y musicaDe.
 * No importa nada.
 */

/** Un sonido de ambiente. */
export type Ambiente = 'pajaros' | 'olas' | 'viento';

// LUGARES: por el principio del nombre de la escena, sus ambientes y su música propia (vacía: la de la escena).
const LUGARES: readonly {
  readonly prefijo: string;
  readonly ambientes: readonly Ambiente[];
  readonly musica: string;
}[] = [
  { prefijo: 'map', ambientes: ['pajaros'], musica: '' },
  { prefijo: 'granja', ambientes: ['pajaros'], musica: '' },
  { prefijo: 'zoo', ambientes: ['pajaros'], musica: '' },
  { prefijo: 'bosque', ambientes: ['pajaros', 'viento'], musica: 'bosque' },
  { prefijo: 'playa', ambientes: ['olas'], musica: 'mar' },
  { prefijo: 'acuario', ambientes: ['olas'], musica: 'mar' },
];

// lugarDe(escena): el sitio de la escena (por el principio de su nombre), o undefined. 'map' solo vale entero, para que
// otras escenas que empiecen igual no suenen como el mapa.
const lugarDe = (escena: string) =>
  LUGARES.find((l) => (l.prefijo === 'map' ? escena === 'map' : escena.startsWith(l.prefijo)));

// ambienteDe(escena): los sonidos de ambiente de la escena (vacío si no tiene).
export const ambienteDe = (escena: string): readonly Ambiente[] => lugarDe(escena)?.ambientes ?? [];
// musicaDe(escena): la música propia del sitio de la escena, o '' si suena la de la escena.
export const musicaDe = (escena: string): string => lugarDe(escena)?.musica ?? '';
