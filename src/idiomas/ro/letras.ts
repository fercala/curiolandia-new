/*
 * idiomas/ro/letras.ts: la Isla de las Letras en rumano (fase ID6 de docs/PLAN-IDIOMAS.md, por partes). Desde la ID6a,
 * las casitas de cada letra (conocer, buscar, escribir, atrapar, unir, el tren de las sílabas y las huellas), el libro
 * de letras y lo que dice Tito de cada letra; desde la ID6b, los demás juegos de la playa y del bosque (palmas, eco,
 * ¿cómo empieza?, mi nombre, repasos y fiestas), y desde la ID6c, el pueblo (las palabras, la máquina de sílabas, las
 * frases, los cuentos para leer y la fiesta del abecedario); las letras mismas, con sus palabras, están en contenido/letrasRo.ts.
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
  // el pueblo de las palabras (ID6c): leer palabras y sílabas
  'Fábrica de sílabas': 'Fabrica de silabe',
  '¡Bienvenido a la fábrica de sílabas!': 'Bine ai venit la fabrica de silabe!',
  'La máquina de sílabas': 'Mașina de silabe',
  'Globos de sílabas': 'Baloane cu silabe',
  '¿Con qué trozo empieza?': 'Cu ce silabă începe?',
  'Palabras de dos sílabas': 'Cuvinte cu două silabe',
  '¡Vamos a leer palabras cortas!': 'Hai să citim cuvinte scurte!',
  'Leo y elijo': 'Citesc și aleg',
  'Armo la palabra': 'Construiesc cuvântul',
  'La sílaba que falta': 'Silaba care lipsește',
  'Une la palabra con su dibujo': 'Unește cuvântul cu desenul',
  'Palabras de tres sílabas': 'Cuvinte cu trei silabe',
  '¡Ahora, palabras más largas!': 'Acum, cuvinte mai lungi!',
  'Frases que se mueven': 'Propoziții care se mișcă',
  '¡Vamos a leer frases!': 'Hai să citim propoziții!',
  'Ordena la frase': 'Ordonează propoziția',
  'Más frases': 'Mai multe propoziții',
  'Cuentos para leer': 'Povești de citit',
  '¡Vamos a leer cuentos! Tú lees la palabra amarilla.': 'Hai să citim povești! Tu citești cuvântul galben.',
  'Fiesta del abecedario': 'Petrecerea alfabetului',
  '¡Es la fiesta del abecedario!': 'E petrecerea alfabetului!',
  'La canción del abecedario': 'Cântecul alfabetului',
  'Esa es {cosa}.': 'Aceea e {cosa}.',
  'Pone {palabra}.': 'Scrie {palabra}.',
  '¿Qué pone? Lee la palabra y toca su dibujo.': 'Ce scrie? Citește cuvântul și atinge desenul lui.',
  'Esa es {cosa}. Si tocas la palabra, te la leo a trozos.':
    'Aceea e {cosa}. Dacă atingi cuvântul, ți-l citesc pe silabe.',
  'Esto es {cosa}. ¿Con qué trozo empieza?': 'Aceasta e {cosa}. Cu ce silabă începe?',
  'Esto es {cosa}. ¿Qué trozo falta?': 'Aceasta e {cosa}. Ce silabă lipsește?',
  '{trozos}: {palabra}.': '{trozos}: {palabra}.',
  'Con {trozo} no pone {palabra}.': 'Cu {trozo} nu scrie {palabra}.',
  'Mmm, ese trozo no va ahí. Escucha: {oye}.': 'Mmm, silaba aceea nu merge acolo. Ascultă: {oye}.',
  'Esto es {cosa}. Arrastra los trozos en orden para escribir {palabra}.':
    'Aceasta e {cosa}. Trage silabele în ordine ca să scrii {palabra}.',
  'Aquí no pone {palabra}.': 'Aici nu scrie {palabra}.',
  '¡Atrapa los globos que dicen {silaba}!': 'Prinde baloanele pe care scrie {silaba}!',
  'Une cada palabra con su dibujo. Lee la palabra y arrastra una línea hasta su dibujo.':
    'Unește fiecare cuvânt cu desenul lui. Citește cuvântul și trage o linie până la desen.',
  '¡Las frases se mueven!': 'Propozițiile se mișcă!',
  // la máquina de sílabas
  '¡Esta es la máquina de las sílabas!': 'Aceasta este mașina de silabe!',
  'Haz la sílaba {silaba}. Toca las ruedas para cambiar las letras y después pulsa el botón rojo.':
    'Fă silaba {silaba}. Atinge roțile ca să schimbi literele și apoi apasă butonul roșu.',
  'Haz la sílaba {silaba}.': 'Fă silaba {silaba}.',
  'Ha salido {hecha}. Queremos {silaba}.': 'A ieșit {hecha}. Vrem {silaba}.',
  'Haz:': 'Fă:',
  // las frases que se mueven
  'Lee la frase y toca el dibujo que dice. Si tocas una palabra, te la leo.':
    'Citește propoziția și atinge desenul potrivit. Dacă atingi un cuvânt, ți-l citesc.',
  'Lee la frase y toca el dibujo que dice.': 'Citește propoziția și atinge desenul potrivit.',
  'Mmm, no es ese. Mira bien la frase.': 'Mmm, nu e acela. Uită-te bine la propoziție.',
  'Te la leo:': 'Ți-o citesc:',
  'Mira el dibujo. Arrastra las palabras en orden para escribir lo que pasa.':
    'Uită-te la desen. Trage cuvintele în ordine ca să scrii ce se întâmplă.',
  // los cuentos para leer: cada página va en trozos, y la palabra sin artículo encaja entre el de antes y el de después
  'Vamos a leer un cuento: {titulo}.': 'Hai să citim o poveste: {titulo}.',
  '{antes}... ¿Qué pone en la palabra amarilla? Toca su dibujo.':
    '{antes}... Ce scrie în cuvântul galben? Atinge desenul lui.',
  'Y colorín, colorado, este cuento se ha acabado.': 'Și-am încălecat pe-o șa și v-am spus povestea așa.',
  'Esa es {cosa}. Lee la palabra amarilla.': 'Aceea e {cosa}. Citește cuvântul galben.',
  'El pato y la luna': 'Rața și luna',
  'Había una vez un': 'A fost odată o',
  'que vivía en un lago.': 'care trăia pe un lac.',
  'Una noche, el pato miró al cielo y vio la': 'Într-o noapte, rața s-a uitat la cer și a văzut o',
  'La luna estaba sola. El pato le llevó una': 'Luna era singură. Rața i-a adus un',
  'para que jugaran.': 'ca să se joace împreună.',
  'Y la luna, la nube y el pato jugaron con una': 'Și luna, norul și rața s-au jucat cu o',
  'toda la noche.': 'toată noaptea.',
  'La vaca que quería volar': 'Vaca ce voia să zboare',
  'En el pueblo vivía una': 'În sat trăia o',
  'muy curiosa.': 'foarte curioasă.',
  'Un día, la vaca vio una': 'Într-o zi, vaca a văzut un',
  'en el cielo.': 'pe cer.',
  'Quería volar tan alto como ella, así que subió a un': 'Voia să zboare la fel de sus ca el, așa că s-a urcat într-o',
  'Y desde arriba saludó a la': 'Și sus, sus de tot, a întâlnit o',
  '. ¡Hola, luna!': '. Bună, lună!',
  // la fiesta del abecedario
  '¡Vamos a cantar la canción del abecedario! Escucha.': 'Hai să cântăm cântecul alfabetului! Ascultă.',
  // las palabras de los carteles del pueblo de la isla: no se traducen, son palabras cortas del rumano para leer
  PAN: 'PÂINE',
  LUZ: 'LUNĂ',
  MAR: 'MARE',
  PIE: 'PAS',
};
