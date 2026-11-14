/*
 * idiomas/ro/letras.ts: la Isla de las Letras en rumano (fase ID6 de docs/PLAN-IDIOMAS.md, por partes). Desde la ID6a,
 * las casitas de cada letra (conocer, buscar, escribir, atrapar, unir, el tren de las sílabas y las huellas), el libro
 * de letras y lo que dice Tito de cada letra; desde la ID6b, los demás juegos de la playa y del bosque (palmas, eco,
 * ¿cómo empieza?, mi nombre, repasos y fiestas); las letras mismas, con sus palabras, están en contenido/letrasRo.ts.
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
  // la playa y el bosque: palmas, eco, ¿cómo empieza?, mi nombre, repasos y fiestas (desde la ID6b)
  'Vamos a dar palmas.': 'Hai să batem din palme.',
  '{intro} {Cosa}. Toca el tambor una vez por cada trozo.':
    '{intro} {Cosa}. Bate în tobă o dată pentru fiecare bucată.',
  'Ahora: {cosa}. Toca el tambor.': 'Acum: {cosa}. Bate în tobă.',
  '{Cosa}. Toca el tambor una vez por cada trozo.': '{Cosa}. Bate în tobă o dată pentru fiecare bucată.',
  '{Palabra} tiene {palmas}.': '{Palabra} are {palmas}.',
  'una palma': 'o bătaie din palme',
  'dos palmas': 'două bătăi din palme',
  '{n} palmas': '{n} bătăi din palme',
  'Toca la letra que salta.': 'Atinge litera care sare.',
  'Así se escribe {nombre}.': 'Așa se scrie {nombre}.',
  '{Palabra} empieza por {letra}.': '{Palabra} începe cu {letra}.',
  'otra letra': 'altă literă',
  'Escucha: {silabas}. ¿Qué es?': 'Ascultă: {silabas}. Ce este?',
  '¿Cuál es más larga: {a} o {b}? Da palmas con cada una.': 'Care e mai lung: {a} sau {b}? Bate din palme la fiecare.',
  '{Palabra} tiene {palmas}. ¿Cuál tiene más?': '{Palabra} are {palmas}. Care are mai multe?',
  '¿Qué empieza por {letra}?': 'Ce începe cu {letra}?',
  'Une cada dibujo con la letra por la que empieza.': 'Unește fiecare desen cu litera cu care începe.',
  '{Palabra} no empieza por {letra}.': '{Palabra} nu începe cu {letra}.',
  'Escarba en la arena con el dedo. ¡Hay letras escondidas!': 'Scormonește în nisip cu degetul. Sunt litere ascunse!',
  'Juego de memoria con las letras. Toca dos cartas y busca dos letras iguales.':
    'Joc de memorie cu litere. Atinge două cărți și caută două litere la fel.',
  '¡Es la fiesta de las vocales! Toca cada una.': 'E petrecerea vocalelor! Atinge-le pe fiecare.',
  'Este es tu nombre: {nombre}. Toca sus letras, una a una.':
    'Acesta e numele tău: {nombre}. Atinge-i literele, una câte una.',
  'Este es el nombre de Tito. Toca sus letras, una a una.':
    'Acesta e numele lui Tito. Atinge-i literele, una câte una.',
  'Esta es {letra}, la primera letra de tu nombre. Píntala con el dedo como tú quieras.':
    'Aceasta este {letra}, prima literă din numele tău. Colorează-o cu degetul cum vrei tu.',
  'Esta es {letra}, la primera letra del nombre de Tito. Píntala con el dedo como tú quieras.':
    'Aceasta este {letra}, prima literă din numele lui Tito. Colorează-o cu degetul cum vrei tu.',
  '¡Qué bonita te ha quedado {letra}!': 'Ce frumos ți-a ieșit {letra}!',
  'Con {letra} empieza tu nombre.': 'Cu {letra} începe numele tău.',
  'Con {letra} empieza Tito.': 'Cu {letra} începe Tito.',
  'Las palmas': 'Bătăile din palme',
  '¡Vamos a dar palmas con las palabras!': 'Hai să batem din palme cu cuvintele!',
  'Da palmas': 'Bate din palme',
  'Vamos a dar una palmada por cada trozo de la palabra.':
    'Hai să batem o dată din palme pentru fiecare bucată a cuvântului.',
  'El eco de Tito': 'Ecoul lui Tito',
  'Más palmas': 'Mai multe bătăi din palme',
  'La palabra larga': 'Cuvântul lung',
  '¿Cómo empieza?': 'Cum începe?',
  '¡Vamos a escuchar cómo empiezan las palabras!': 'Hai să ascultăm cum încep cuvintele!',
  'Une cada dibujo con su letra': 'Unește fiecare desen cu litera lui',
  'Letras en la arena': 'Litere în nisip',
  'Memoria de letras': 'Memoria literelor',
  'Mi nombre': 'Numele meu',
  '¡Vamos a jugar con las letras de tu nombre!': 'Hai să ne jucăm cu literele numelui tău!',
  'La pizarra': 'Tabla',
  'Mi primera letra': 'Prima mea literă',
  'Las vocales mezcladas': 'Vocalele amestecate',
  '¡Las vocales se han mezclado! Vamos a encontrarlas.': 'Vocalele s-au amestecat! Hai să le găsim.',
  'Atrapa las vocales': 'Prinde vocalele',
  'Fiesta de las vocales': 'Petrecerea vocalelor',
  '¡Es la fiesta de las vocales!': 'E petrecerea vocalelor!',
  'Las cinco vocales': 'Vocalele',
  'Palmas con los amigos': 'Bătăi din palme cu prietenii',
  'Escribe una vocal': 'Scrie o vocală',
  'Repaso de vocales': 'Recapitularea vocalelor',
  '¡Vamos a repasar las vocales antes de entrar en el bosque!':
    'Hai să recapitulăm vocalele înainte să intrăm în pădure!',
  'Escribo mi nombre': 'Îmi scriu numele',
  '¡Vamos a escribir las letras de tu nombre!': 'Hai să scriem literele numelui tău!',
  'Escribe mi primera letra': 'Scrie prima mea literă',
  'Huellas de mi letra': 'Urmele literei mele',
  'Fiesta de las letras': 'Petrecerea literelor',
  '¡Es la fiesta de las letras del bosque!': 'E petrecerea literelor din pădure!',
  'El tren de las sílabas': 'Trenul silabelor',
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
