/*
 * idiomas/ro/paseo.ts: los textos en rumano de lo que se hace paseando por el mapa (docs/PLAN-IDIOMAS.md; desde la
 * v0.2.156, por la regla de Fernando del 15 de noviembre de 2026: toda funcionalidad nueva llega ya en todos los
 * idiomas): los tesoros escondidos y la vitrina (fase P14 de docs/IDEAS-MEJORA.md), la cámara de fotos y el álbum de
 * fotos (P15) y la gran aventura de Tito con sus capítulos (P16). Borrador de Claude para que lo revise una persona que
 * hable rumano (ID9). Va del texto en castellano, tal como está en el código, a su traducción; textos.ts junta esta
 * tabla con las demás. Las plantillas llevan sus huecos ({n}, {total}, {nombre}) y, entre un número y lo que cuenta,
 * {n:de}. Las palabras inglesas de las fotos no se traducen (se dicen en inglés).
 * Exporta: PASEO_RO. No importa nada.
 */

/** Los textos de los tesoros, la cámara de fotos y la gran aventura, del castellano al rumano. */
export const PASEO_RO: Readonly<Record<string, string>> = {
  // los tesoros escondidos (P14)
  'La pluma': 'Pana',
  'La concha': 'Scoica',
  'La piña': 'Conul de brad',
  'La bellota': 'Ghinda',
  'La estrella de mar': 'Steaua de mare',
  'La piedra bonita': 'Piatra frumoasă',
  'La hoja': 'Frunza',
  'La castaña': 'Castana',
  '¡Una pluma! La guardo en mi vitrina.': 'O pană! O pun în vitrina mea.',
  '¡Una concha! La guardo en mi vitrina.': 'O scoică! O pun în vitrina mea.',
  '¡Una piña! La guardo en mi vitrina.': 'Un con de brad! Îl pun în vitrina mea.',
  '¡Una bellota! La guardo en mi vitrina.': 'O ghindă! O pun în vitrina mea.',
  '¡Una estrella de mar! La guardo en mi vitrina.': 'O stea de mare! O pun în vitrina mea.',
  '¡Una piedra bonita! La guardo en mi vitrina.': 'O piatră frumoasă! O pun în vitrina mea.',
  '¡Una hoja preciosa! La guardo en mi vitrina.': 'O frunză minunată! O pun în vitrina mea.',
  '¡Una castaña! La guardo en mi vitrina.': 'O castană! O pun în vitrina mea.',
  '¡Hay un tesoro cerca del jardín!': 'E o comoară lângă grădină!',
  '¡Hay un tesoro cerca del bosque!': 'E o comoară lângă pădure!',
  '¡Hay un tesoro cerca de la montaña!': 'E o comoară lângă munte!',
  '¡Hay un tesoro cerca de la plaza!': 'E o comoară lângă piață!',
  '¡Hay un tesoro cerca del muelle!': 'E o comoară lângă debarcader!',
  '¡Hay un tesoro cerca del cole!': 'E o comoară lângă grădiniță!',
  '¡Hay un tesoro cerca de la casa de las fiestas!': 'E o comoară lângă casa sărbătorilor!',
  '¡Hay un tesoro cerca del globo!': 'E o comoară lângă balon!',
  '¡Algo brilla por aquí!': 'Ceva strălucește pe aici!',
  '¡Has encontrado los tres tesoros de hoy! Mañana habrá otros.':
    'Ai găsit cele trei comori de azi! Mâine vor fi altele.',
  '¡Mi vitrina de tesoros! Ya tengo {n} de {total}. Toca uno para verlo.':
    'Vitrina mea cu comori! Am deja {n} din {total}. Atinge una ca s-o vezi.',
  '¡Mi vitrina de tesoros! Está vacía. Pasea por el mapa para encontrar tesoros escondidos.':
    'Vitrina mea cu comori! E goală. Plimbă-te pe hartă ca să găsești comori ascunse.',
  'Cada día hay tres tesoros escondidos en el mapa. Pasea con Tito para encontrarlos.':
    'În fiecare zi sunt trei comori ascunse pe hartă. Plimbă-te cu Tito ca să le găsești.',
  'Mi vitrina de tesoros': 'Vitrina mea cu comori',
  'Este tesoro aún no lo has encontrado.': 'Comoara asta n-ai găsit-o încă.',
  '{nombre}. La has encontrado una vez.': '{nombre}. Ai găsit-o o dată.',
  '{nombre}. La has encontrado {n} veces.': '{nombre}. Ai găsit-o de {n} ori.',
  // la cámara de fotos y el álbum (P15)
  'Bichos y animales del campo': 'Gâze și animale de la câmp',
  'Del mar y de la playa': 'De la mare și de la plajă',
  'De la nieve y del frío': 'De la zăpadă și de la frig',
  'Animales de la granja': 'Animale de la fermă',
  'Plantas y cosas': 'Plante și lucruri',
  'La rana': 'Broasca',
  'La abeja': 'Albina',
  'La mariposa': 'Fluturele',
  'La mariquita': 'Buburuza',
  'La hormiga': 'Furnica',
  'El conejo': 'Iepurele',
  'La ardilla': 'Veverița',
  'El búho': 'Bufnița',
  'La ballena': 'Balena',
  'El delfín': 'Delfinul',
  'El cangrejo': 'Crabul',
  'El pájaro': 'Pasărea',
  'El barco': 'Barca',
  'El castillo de arena': 'Castelul de nisip',
  'El pingüino': 'Pinguinul',
  'El iglú': 'Igluul',
  'El muñeco de nieve': 'Omul de zăpadă',
  'La vaca': 'Vaca',
  'El caballo': 'Calul',
  'El cerdo': 'Porcul',
  'La oveja': 'Oaia',
  'La gallina': 'Găina',
  'El pollito': 'Puiul',
  'El pato': 'Rața',
  'El árbol': 'Copacul',
  'La flor': 'Floarea',
  'La seta': 'Ciuperca',
  'La calabaza': 'Dovleacul',
  'El nido': 'Cuibul',
  'El globo': 'Balonul',
  EN: 'EN',
  'Guardo la cámara.': 'Pun aparatul foto deoparte.',
  '¡La cámara! Toca un animal o una cosa para hacerle una foto.':
    'Aparatul foto! Atinge un animal sau un lucru ca să-i faci o poză.',
  '{nombre}. Esta foto ya la tenías.': '{nombre}. Poza asta o aveai deja.',
  '¡Foto nueva! {nombre}.': 'Poză nouă! {nombre}.',
  '¡Has completado una página del álbum de fotos!': 'Ai completat o pagină din albumul cu poze!',
  'Ahí no hay nada para la foto. Busca un animal o una cosa.':
    'Acolo nu e nimic de pozat. Caută un animal sau un lucru.',
  '¡Mi álbum de fotos! Ya tengo {n} de {total}. Toca una foto para oír su nombre.':
    'Albumul meu cu poze! Am deja {n} din {total}. Atinge o poză ca să-i auzi numele.',
  '¡Mi álbum de fotos! Está vacío. Saca la cámara en el mapa para hacer fotos.':
    'Albumul meu cu poze! E gol. Scoate aparatul foto pe hartă ca să faci poze.',
  'Toca una foto para oír su nombre. La bandera dice cómo se llama en inglés.':
    'Atinge o poză ca să-i auzi numele. Steagul îți spune cum se numește în engleză.',
  'Esta foto aún no la has hecho. ¡Busca con la cámara!': 'Poza asta n-ai făcut-o încă. Caută cu aparatul foto!',
  '{nombre}. Esta foto la has hecho una vez.': '{nombre}. Ai făcut poza asta o dată.',
  '{nombre}. Esta foto la has hecho {n} veces.': '{nombre}. Ai făcut poza asta de {n} ori.',
  // la gran aventura de Tito (P16)
  'El mapa del tesoro perdido': 'Harta comorii pierdute',
  'La botella del mar': 'Sticla din mare',
  'Las parejas del bosque': 'Perechile din pădure',
  'Polly y los animales': 'Polly și animalele',
  'Una mañana, Tito paseaba por la playa. ¡Y las olas le trajeron una botella!':
    'Într-o dimineață, Tito se plimba pe plajă. Și valurile i-au adus o sticlă!',
  'Dentro había un trozo de papel. ¡Era un mapa del tesoro! Pero estaba roto en seis trozos.':
    'Înăuntru era o bucată de hârtie. Era o hartă a comorii! Dar era ruptă în șase bucăți.',
  'Una nota decía: «Cuenta las cosas del mar y el primer trozo será tuyo». ¡Vamos a contar!':
    'Un bilet spunea: „Numără lucrurile din mare și prima bucată va fi a ta.” Hai să numărăm!',
  '¡El primer trozo del mapa! ¡Qué emoción!': 'Prima bucată din hartă! Ce emoție!',
  'El trozo del mapa llevó a Tito hasta el bosque. Allí lo esperaba la ardilla.':
    'Bucata de hartă l-a dus pe Tito până în pădure. Acolo îl aștepta veverița.',
  '¡Tengo el segundo trozo! Pero se me han mezclado las cartas de mis amigos del bosque.':
    'Eu am a doua bucată! Dar mi s-au amestecat cărțile cu prietenii mei din pădure.',
  'Ayuda a la ardilla a juntar las parejas. ¡Hay que acordarse de dónde está cada carta!':
    'Ajut-o pe veveriță să găsească perechile. Trebuie să ții minte unde e fiecare carte!',
  '¡El segundo trozo del mapa! Gracias, ardilla.': 'A doua bucată din hartă! Mulțumesc, veveriță.',
  'Con dos trozos, el mapa señalaba una isla lejana. ¡Tito voló hasta allí en globo!':
    'Cu două bucăți, harta arăta o insulă îndepărtată. Tito a zburat până acolo cu balonul!',
  'Era la isla de Polly, la lorita. ¡Hello, Tito! Yo guardo el tercer trozo.':
    'Era insula lui Polly, papagalul. Hello, Tito! Eu păstrez a treia bucată.',
  'Polly dirá animales en inglés. Escucha bien y toca el animal que dice.':
    'Polly va spune animale în engleză. Ascultă bine și atinge animalul pe care îl spune.',
  '¡El tercer trozo del mapa! Thank you, Polly.': 'A treia bucată din hartă! Thank you, Polly.',
  '¡La gran aventura de Tito! Un mapa del tesoro se ha roto en seis trozos. Toca el primer capítulo para empezar.':
    'Marea aventură a lui Tito! O hartă a comorii s-a rupt în șase bucăți. Atinge primul capitol ca să începi.',
  '¡Ya tenemos {n} de {total} trozos del mapa!': 'Avem deja {n} din {total} bucăți din hartă!',
  'Hoy hay un capítulo nuevo. ¡Tócalo para seguir la aventura!':
    'Azi e un capitol nou. Atinge-l ca să continui aventura!',
  'El próximo capítulo se abre mañana.': 'Capitolul următor se deschide mâine.',
  'El próximo capítulo llegará muy pronto.': 'Capitolul următor va veni foarte curând.',
  'Toca un capítulo para jugarlo. Cada día se abre uno nuevo.':
    'Atinge un capitol ca să-l joci. În fiecare zi se deschide unul nou.',
  'Este capítulo se abre mañana. ¡Vuelve mañana para seguir la aventura!':
    'Capitolul acesta se deschide mâine. Vino înapoi mâine ca să continui aventura!',
  'Primero hay que terminar el capítulo de antes.': 'Mai întâi trebuie terminat capitolul dinainte.',
  '¡Este capítulo llegará muy pronto!': 'Capitolul acesta va veni foarte curând!',
  '¡Lo pongo en el mapa del tesoro!': 'O pun pe harta comorii!',
  'Este trozo ya lo tenías. ¡Muy bien jugado!': 'Bucata asta o aveai deja. Foarte bine jucat!',
};
