/*
 * idiomas/ro/letras.ts: la Isla de las Letras en rumano (fase ID6 de docs/PLAN-IDIOMAS.md, por partes). Desde la ID6a,
 * las casitas de cada letra (conocer, buscar, escribir, atrapar, unir, el tren de las sílabas y las huellas), el libro
 * de letras y lo que dice Tito de cada letra; las letras mismas, con sus palabras, están en contenido/letrasRo.ts.
 * Borrador de Claude para que lo revise alguien que conozca cómo se enseña a leer en Rumanía (ID9). Va del texto en
 * castellano, tal como está en el código, a su traducción; textos.ts la junta con las demás tablas. El nombre de cada
 * letra («litera a») va en {letra} ({Letra}, con mayúscula), y {deCosa} es el amigo tras «urmele» («urmele albinei»).
 * Exporta: LETRAS_TEXTOS_RO. No importa nada.
 */

/** Los textos de la Isla de las Letras, del castellano al rumano. */
export const LETRAS_TEXTOS_RO: Readonly<Record<string, string>> = {
  // conocer la letra
  'Esta es {letra}. {Letra} de {amigo}.': 'Aceasta este {letra}. {Letra}, ca în {amigo}.',
  '{Cosa}. {Palabra} empieza por {letra}.': '{Cosa}. {Palabra} începe cu {letra}.',
  '{Cosa}. {Palabra} lleva {letra}.': '{Cosa}. În {palabra} se aude {letra}.',
  '{Letra} de {amigo}.': '{Letra}, ca în {amigo}.',
  'Y esta es {letra} minúscula.': 'Și aceasta este {letra} mică.',
  '¡Vamos a conocer {letra}! Toca cada tarjeta.': 'Hai să cunoaștem {letra}! Atinge fiecare cartonaș.',
  '¡Vamos a conocer {letra}!': 'Hai să cunoaștem {letra}!',
  'La {l}': 'Litera {l}',
  'Conoce {letra}': 'Cunoaște {letra}',
  // buscarla y atraparla
  '¿Dónde está {letra}?': 'Unde este {letra}?',
  '¡Atrapa las burbujas de {letra}!': 'Prinde bulele cu {letra}!',
  'Atrapa {letra}': 'Prinde {letra}',
  Atrapa: 'Prinde',
  // escribirla
  'Escribe {letra}': 'Scrie {letra}',
  'Vamos a escribir {letra}. Empieza en el punto verde y sigue el camino con el dedo.':
    'Hai să scriem {letra}. Începe de la punctul verde și urmează drumul cu degetul.',
  'Ahora, {letra} minúscula. Empieza en el punto verde.': 'Acum, {letra} mică. Începe de la punctul verde.',
  'Ahora, el siguiente trazo. Empieza en el punto verde.': 'Acum, linia următoare. Începe de la punctul verde.',
  '¡Muy bien! ¡Ya sabes escribir {letra}!': 'Foarte bine! Acum știi să scrii {letra}!',
  'Sigue el camino de {letra} con el dedo.': 'Urmează cu degetul drumul pentru {letra}.',
  // unir cada letra con su amigo
  'Une cada letra con su amigo': 'Unește fiecare literă cu prietenul ei',
  'Une cada letra con su amigo. Arrastra una línea desde la letra hasta su dibujo.':
    'Unește fiecare literă cu prietenul ei. Trage o linie de la literă până la desenul ei.',
  '{Cosa} no empieza por {letra}.': '{Cosa} nu începe cu {letra}.',
  // el tren de las sílabas
  'El tren de {letra}': 'Trenul cu {letra}',
  '¡Llega el tren de {letra}! Toca un vagón para engancharlo.':
    'Vine trenul cu {letra}! Atinge un vagon ca să-l agăți.',
  'Toca un vagón para engancharlo a la locomotora.': 'Atinge un vagon ca să-l agăți de locomotivă.',
  '{Letra} con {vocal}: {silaba}.': '{Letra} cu {vocal}: {silaba}.',
  '¡Chu, chu! El tren se va.': 'Ciu, ciu! Trenul pleacă.',
  // las huellas
  'Las huellas de {letra}': 'Urmele pentru {letra}',
  'Las huellas de {cosa} forman {letra}. Tócalas en orden, empezando por la que brilla.':
    'Urmele {deCosa} formează {letra}. Atinge-le pe rând, începând cu cea care strălucește.',
  'Las huellas forman {letra}.': 'Urmele formează {letra}.',
  'Toca la huella que brilla.': 'Atinge urma care strălucește.',
  // el libro de letras del álbum
  'Mi libro de letras': 'Cartea mea cu litere',
  'Este es tu libro de letras. Ya conoces 1 letra.': 'Aceasta este cartea ta cu litere. Știi deja o literă.',
  'Este es tu libro de letras. Ya conoces {n} letras.': 'Aceasta este cartea ta cu litere. Știi deja {n} {n:de}litere.',
  'Este es tu libro de letras. ¡Las letras te esperan en la Isla de las Letras!':
    'Aceasta este cartea ta cu litere. Literele te așteaptă pe Insula Literelor!',
  'Esta letra todavía no la conoces. ¡La aprenderás en la Isla de las Letras!':
    'Litera aceasta încă n-o știi. O vei învăța pe Insula Literelor!',
  // las palabras de los carteles del pueblo de la isla: no se traducen, son palabras cortas del rumano para leer
  PAN: 'PÂINE',
  LUZ: 'LUNĂ',
  MAR: 'MARE',
  PIE: 'PAS',
};
