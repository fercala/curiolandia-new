/*
 * dominio/idiomas.ts: las reglas de los idiomas del juego (fase ID1 de docs/PLAN-IDIOMAS.md): qué idiomas hay, con qué
 * idioma se juega (el guardado en la partida, el de la dirección ?idioma= para probar o, la primera vez, el del
 * navegador), cuáles se pueden elegir en la zona de adultos, cómo se rellenan los huecos de una plantilla y cómo se
 * escribe un texto en el pseudoidioma de prueba.
 * El castellano de España es el idioma del código: los textos se escriben en castellano y cada idioma es una tabla que
 * va del texto en castellano a su traducción (src/idiomas/). El rumano es el primero que se añade.
 * Es DOMINIO: no sabe nada de pantalla, de navegador ni de S; quien traduce (nucleo/traducir.ts) le pregunta.
 * Pruebas: tests/unidad/idiomas.test.ts.
 * Exporta: los tipos IdIdioma, IdiomaGuardado e Idioma, IDIOMAS, IDIOMA_BASE, PARAMETRO_IDIOMA, esIdioma, idioma,
 * idiomaDelNavegador, idiomaActivo, idiomasElegibles, rellena y pseudo.
 * No importa nada.
 */

/** Los idiomas que conoce el juego: castellano, rumano y el pseudoidioma de prueba ('xx'). */
export type IdIdioma = 'es' | 'ro' | 'xx';
/** Los que se pueden guardar en la partida (S.idioma): el pseudoidioma solo se usa con ?idioma=xx. */
export type IdiomaGuardado = Exclude<IdIdioma, 'xx'>;

/** Un idioma: su id, su nombre escrito en ese idioma (para el selector), su bandera, el código de idioma de la página y
 * de la voz (lang), los prefijos de las voces del navegador que valen, de más a menos preferida, y si está completo (si
 * no, no se ofrece en la zona de adultos y solo se puede probar con ?idioma=). */
export interface Idioma {
  readonly id: IdIdioma;
  readonly nombre: string;
  readonly bandera: string;
  readonly lang: string;
  readonly voces: readonly string[];
  readonly completo: boolean;
}

/** Los idiomas, en el orden del selector. El rumano no está completo hasta la fase ID9. El pseudoidioma habla con las
 * voces del castellano. */
export const IDIOMAS: readonly Idioma[] = [
  {
    id: 'es',
    nombre: 'Español',
    bandera: '🇪🇸',
    lang: 'es-ES',
    voces: ['es-ES', 'es-MX', 'es-US', 'es-419', 'es-AR', 'es'],
    completo: true,
  },
  { id: 'ro', nombre: 'Română', bandera: '🇷🇴', lang: 'ro-RO', voces: ['ro-RO', 'ro-MD', 'ro'], completo: false },
  { id: 'xx', nombre: 'Pseudoidioma', bandera: '🧪', lang: 'es-ES', voces: ['es-ES', 'es'], completo: false },
];

/** El idioma del código y el que sale si no se sabe otro. */
export const IDIOMA_BASE: IdiomaGuardado = 'es';
/** El parámetro de la dirección para probar un idioma sin guardarlo: index.html?idioma=ro. */
export const PARAMETRO_IDIOMA = 'idioma';

// esIdioma(x): true si x es el id de un idioma que conoce el juego.
export const esIdioma = (x: unknown): x is IdIdioma => IDIOMAS.some((i) => i.id === x);

// idioma(id): los datos del idioma id (el castellano si no existe).
export const idioma = (id: IdIdioma): Idioma => IDIOMAS.find((i) => i.id === id) ?? (IDIOMAS[0] as Idioma);

// idiomasElegibles(actual): los idiomas que se ofrecen en la zona de adultos: los completos y, si no lo es, el que se
// está usando (para que el selector lo enseñe marcado). El pseudoidioma nunca.
export const idiomasElegibles = (actual: IdIdioma): Idioma[] =>
  IDIOMAS.filter((i) => i.id !== 'xx' && (i.completo || i.id === actual));

// idiomaDelNavegador(langs): el idioma de la primera vez, según los idiomas del navegador (navigator.languages, del
// preferido al último): el primero que sea un idioma completo del juego; si ninguno, el castellano.
export function idiomaDelNavegador(langs: readonly string[]): IdiomaGuardado {
  // El prefijo de un código de idioma: corta en el primer - o _ ('ro-RO' → 'ro', 'es_ES' → 'es'; 'ro' se queda igual).
  const prefijos = langs.map((l) => l.toLowerCase().split(/[-_]/u)[0]);
  const id = prefijos.find((pre) => IDIOMAS.some((x) => x.id !== 'xx' && x.completo && x.id === pre));
  return (id as IdiomaGuardado | undefined) ?? IDIOMA_BASE;
}

// idiomaActivo(guardado, parametro, langs): el idioma con el que se juega. Manda el de la dirección (?idioma=ro, para
// probar, aunque no esté completo; no se guarda); si no, el guardado en la partida; si la partida no tiene (la primera
// vez), el del navegador.
export function idiomaActivo(guardado: unknown, parametro: string | null, langs: readonly string[]): IdIdioma {
  if (esIdioma(parametro)) return parametro;
  if (esIdioma(guardado) && guardado !== 'xx') return guardado;
  return idiomaDelNavegador(langs);
}

// rellena(plantilla, huecos): la plantilla con cada {nombre} cambiado por huecos[nombre]. Un hueco que no está se deja
// como estaba, para que se vea el fallo. Es lo que usarán las frases compuestas desde la fase ID2.
// La regla de un hueco: {nombre} con letras, números o _ ('{cosa}' vale; '{ }' y '{la cosa}' no).
export const rellena = (plantilla: string, huecos: Readonly<Record<string, string | number>>): string =>
  plantilla.replace(/\{(\w+)\}/gu, (todo, n: string) => (n in huecos ? String(huecos[n]) : todo));

// Cuánto alarga el pseudoidioma cada texto: un 30 %, lo que puede crecer al traducirlo.
const ALARGA = 0.3;

// pseudo(t): t en el pseudoidioma de prueba: entre ⟦ ⟧ y un 30 % más largo (con ·), para ver en pantalla lo que se
// traduce, lo que se escapa sin traducir (sale sin corchetes) y lo que no cabe. Los espacios del principio y del final
// se quedan fuera de los corchetes (los trozos que se pegan los llevan).
export function pseudo(t: string): string {
  // Parte t en espacios del principio, el texto y espacios del final (' monedas. ' → ' ', 'monedas.', ' '; casa cualquier texto).
  const m = /^(\s*)([\s\S]*?)(\s*)$/u.exec(t);
  const [, antes = '', medio = '', despues = ''] = m ?? [];
  if (!medio) return t;
  return `${antes}⟦${medio}${'·'.repeat(Math.ceil(medio.length * ALARGA))}⟧${despues}`;
}
