/*
 * idiomas/ro/escenas.ts: los textos en rumano de la portada, el mapa y sus zonas, la casita de cada tema, la asamblea,
 * el álbum, la tienda, el cofre, el repaso, las dos islas y la capa 3D de esas escenas, y los nombres de los temas (fase
 * ID4b de docs/PLAN-IDIOMAS.md). Borrador de Claude para que lo revise una persona que hable rumano (ID9). Va del texto
 * en castellano, tal como está en el código, a su traducción; textos.ts junta esta tabla con las demás. Las plantillas
 * llevan sus huecos ({n}, {cosa}...) y, entre un número y lo que cuenta, {n:de} (la «de» del rumano: «20 de monede»).
 * Las casitas de la Isla de las Letras («La A», «Las palmas»...) se traducen en la ID6, con su versión rumana.
 * Exporta: ESCENAS_RO y TEMAS_RO. No importa nada.
 */

/** Los nombres de los temas (los de las casitas: t.n), del castellano al rumano. nombres.ts saca de aquí sus formas. */
export const TEMAS_RO: Readonly<Record<string, string>> = {
  'Mi cole': 'Grădinița mea',
  'Mi cuerpo': 'Corpul meu',
  'Los colores': 'Culorile',
  'El otoño': 'Toamna',
  'Mi familia': 'Familia mea',
  'El invierno y la ropa': 'Iarna și hainele',
  'Las frutas y el desayuno': 'Fructele și micul dejun',
  'Mi casa': 'Casa mea',
  'Los animales de la granja': 'Animalele de la fermă',
  'La primavera': 'Primăvara',
  'Los transportes': 'Mijloacele de transport',
  'El verano y la playa': 'Vara și plaja',
  'Rincón de los Conceptos': 'Colțul noțiunilor',
  'Los días de la semana': 'Zilele săptămânii',
  'Mi cuerpo y los sentidos': 'Corpul meu și simțurile',
  'El otoño y sus frutos': 'Toamna și roadele ei',
  'Las emociones': 'Emoțiile',
  'Frutas y verduras': 'Fructe și legume',
  'El invierno y el polo': 'Iarna și polul',
  'Los oficios': 'Meseriile',
  'La calle y la ciudad': 'Strada și orașul',
  'Animales domésticos y salvajes': 'Animale domestice și sălbatice',
  'Las plantas': 'Plantele',
  'Los transportes por tierra, mar y aire': 'Transportul pe uscat, pe mare și în aer',
  'Los bichitos y el verano': 'Gâzele și vara',
  'Los meses del año': 'Lunile anului',
  'Mi cuerpo por dentro': 'Corpul meu pe dinăuntru',
  'El otoño y los cambios': 'Toamna și schimbările',
  'Comer sano': 'Mâncăm sănătos',
  'Las fiestas del año': 'Sărbătorile anului',
  'El universo': 'Universul',
  'Los dinosaurios': 'Dinozaurii',
  'Los animales y dónde viven': 'Animalele și unde trăiesc',
  'El tiempo y el clima': 'Vremea și clima',
  'Los seres vivos': 'Ființele vii',
  'Cuidamos el planeta': 'Avem grijă de planetă',
  'De viaje con cuidado': 'Călătorim cu grijă',
  'Las canciones': 'Cântecele',
  'Rutinas y hábitos': 'Rutine și obiceiuri',
  'Los trazos': 'Liniile',
  'El cumpleaños': 'Ziua de naștere',
  'La Navidad': 'Crăciunul',
  'El carnaval': 'Carnavalul',
  'El Día del Libro': 'Ziua Cărții',
  // la Isla del Inglés: lo que se explica en rumano (lo que dice Polly en inglés no se traduce)
  'Los saludos en inglés': 'Salutul în engleză',
  'Los colores en inglés': 'Culorile în engleză',
  'Los números en inglés': 'Numerele în engleză',
  'Los animales en inglés': 'Animalele în engleză',
  'La familia en inglés': 'Familia în engleză',
  'Mi cuerpo en inglés': 'Corpul meu în engleză',
  'Los juguetes en inglés': 'Jucăriile în engleză',
  'La fruta en inglés': 'Fructele în engleză',
  'Las formas en inglés': 'Formele în engleză',
  'Fiesta de la playa': 'Petrecerea de pe plajă',
  'Repaso de la playa': 'Recapitularea de pe plajă',
  'La ropa en inglés': 'Hainele în engleză',
  'La comida en inglés': 'Mâncarea în engleză',
  'Mi casa en inglés': 'Casa mea în engleză',
  'El tiempo en inglés': 'Vremea în engleză',
  'Los transportes en inglés': 'Transportul în engleză',
  'La granja en inglés': 'Ferma în engleză',
  'Lo que hacemos': 'Ce facem',
  'Grande y pequeño': 'Mare și mic',
  'Cómo me siento': 'Cum mă simt',
  'Canciones del parque': 'Cântecele parcului',
  'Fiesta del parque': 'Petrecerea din parc',
  'Las estaciones en inglés': 'Anotimpurile în engleză',
  '¿Dónde está? In, on, under': 'Unde este? In, on, under',
  'Polly says': 'Polly says',
  'Me gusta: I like': 'Îmi place: I like',
  'What is it?': 'What is it?',
  'Cosas de colores': 'Lucruri colorate',
  'Contar hasta 20': 'Numărăm până la 20',
  'Los oficios en inglés': 'Meseriile în engleză',
  'La tienda de Polly': 'Magazinul lui Polly',
  'Cuentos en inglés': 'Povești în engleză',
  'Gran fiesta del inglés': 'Marea petrecere a englezei',
};

/** Los textos de la portada, el mapa, la asamblea, la tienda, el cofre, el repaso y las islas, del castellano al rumano. */
export const ESCENAS_RO: Readonly<Record<string, string>> = {
  ...TEMAS_RO,
  // escenas/escenas2d.ts: la portada, la edad, el nombre y el cuento del principio
  Curiolandia: 'Curiolandia',
  'Tito y las preguntas escondidas': 'Tito și întrebările ascunse',
  'Instalar el juego': 'Instalează jocul',
  '¡Hola! Para empezar, un mayor tiene que tocar la edad de quien va a jugar.':
    'Bună! Ca să începem, un adult trebuie să atingă vârsta celui care se va juca.',
  '¿Cuántos años tiene quien va a jugar?': 'Câți ani are cel care se va juca?',
  '(Lo elige un adulto. Se puede cambiar después.)': '(Alege un adult. Se poate schimba după aceea.)',
  años: 'ani',
  '¡Hola! Yo soy Tito. ¿Cómo te llamas? Pídele a un mayor que escriba tu nombre.':
    'Bună! Eu sunt Tito. Cum te cheamă? Roagă un adult să-ți scrie numele.',
  'Pídele a un mayor que escriba tu nombre.': 'Roagă un adult să-ți scrie numele.',
  '¡Hola, {nombre}! ¡Qué bonito nombre!': 'Bună, {nombre}! Ce nume frumos!',
  '¿Cómo te llamas?': 'Cum te cheamă?',
  'Escribir el nombre': 'Scrie numele',
  Saltar: 'Sari peste',
  '¡Hola! Yo soy Tito, el erizo curioso. En mi mochila guardo un montón de preguntas.':
    'Bună! Eu sunt Tito, ariciul curios. În rucsacul meu țin o mulțime de întrebări.',
  '¡Hola! Yo soy Tito, la tortuga curiosa. En mi mochila guardo un montón de preguntas.':
    'Bună! Eu sunt Tito, broasca țestoasă curioasă. În rucsacul meu țin o mulțime de întrebări.',
  '¡Hola! Yo soy Tito, el conejo curioso. En mi mochila guardo un montón de preguntas.':
    'Bună! Eu sunt Tito, iepurașul curios. În rucsacul meu țin o mulțime de întrebări.',
  '¡Hola! Yo soy Tito, el caracol curioso. En mi mochila guardo un montón de preguntas.':
    'Bună! Eu sunt Tito, melcul curios. În rucsacul meu țin o mulțime de întrebări.',
  'Pero hoy la mochila se abrió... ¡y las preguntas se escaparon por todo el pueblo!':
    'Dar azi rucsacul s-a deschis... și întrebările au fugit prin tot orășelul!',
  '¿Qué día es hoy? ¿De qué color es el cielo? ¿Qué come la vaca?':
    'Ce zi e azi? Ce culoare are cerul? Ce mănâncă vaca?',
  '¿Me ayudas a encontrar las respuestas{nino}? ¡Vamos a Curiolandia!':
    'Mă ajuți să găsesc răspunsurile{nino}? Hai în Curiolandia!',
  // los nombres de los tipos de juego (en la casita) y los avisos al terminar
  Conocer: 'Cunoaște',
  '¿Quién hace este sonido?': 'Cine face sunetul acesta?',
  Pintar: 'Colorează',
  'Las canastas': 'Coșurile',
  'Burbujas de colores': 'Baloane de săpun colorate',
  '¡Atrápalas!': 'Prinde-le!',
  'Vestir al niño': 'Îmbracă copilul',
  Ordenar: 'Ordonează',
  'Arma tu familia': 'Fă-ți familia',
  'Hacer un muñeco de nieve': 'Facem un om de zăpadă',
  'Ensalada de frutas': 'Salată de fructe',
  'Dentro y fuera del corral': 'Înăuntrul și în afara țarcului',
  'Dentro y fuera': 'Înăuntru și afară',
  'Regar las flores': 'Udăm florile',
  'La canción': 'Cântecul',
  Trazos: 'Linii',
  '¿Qué va primero?': 'Ce vine mai întâi?',
  Decorar: 'Decorează',
  '¡Lo lograste! ¡Ganaste una estrella!': 'Ai reușit! Ai câștigat o stea!',
  '¡Muy bien{nino}! ¡Una estrella más!': 'Foarte bine{nino}! Încă o stea!',
  '¡Bravo! ¡Terminaste el juego!': 'Bravo! Ai terminat jocul!',
  'Nivel {n}': 'Nivelul {n}',
  // la asamblea: emociones, tiempo, días, calendario y estaciones
  '¡Qué bueno! Hoy sientes alegría. ¡Yo también estoy feliz de verte!':
    'Ce bine! Azi simți bucurie. Și eu sunt fericit să te văd!',
  'Hoy sientes tristeza. Está bien estar triste a veces. Un abrazo ayuda mucho.':
    'Azi simți tristețe. E în regulă să fii trist uneori. O îmbrățișare ajută mult.',
  'Hoy sientes enojo. Cuando me enojo, respiro como un globo: inflo, inflo... y suelto despacito.':
    'Azi simți furie. Când mă supăr, respir ca un balon: umflu, umflu... și dau drumul încet.',
  'Hoy sientes miedo. Si tienes miedo, busca a un mayor que te cuide.':
    'Azi simți frică. Dacă ți-e frică, caută un adult care să aibă grijă de tine.',
  '¡Hoy sientes sorpresa! ¡Qué emocionante!': 'Azi simți surpriză! Ce emoționant!',
  'Hoy sientes calma. ¡Qué bonito sentirse así!': 'Azi simți liniște. Ce frumos e să te simți așa!',
  'Hoy sientes vergüenza. Nos pasa a todos. Respira hondo y sonríe.':
    'Azi simți rușine. Ni se întâmplă tuturor. Respiră adânc și zâmbește.',
  'Puedes contarle a alguien lo que te pasa.': 'Poți să-i spui cuiva ce simți.',
  'Y después cuenta lo que te enojó con palabras.': 'Și apoi spune în cuvinte ce te-a supărat.',
  'Hablar de lo que da miedo lo hace más pequeñito.': 'Când vorbești despre ce te sperie, frica se face mai mică.',
  '¡Hoy hace sol!': 'Azi e soare!',
  '¡Hoy está nublado!': 'Azi e înnorat!',
  '¡Hoy llueve!': 'Azi plouă!',
  '¡Hoy hay viento!': 'Azi bate vântul!',
  '¡Hoy nieva!': 'Azi ninge!',
  '¡Hoy hay tormenta!': 'Azi e furtună!',
  '¡Hoy hay niebla!': 'Azi e ceață!',
  '¡Buen día{nino}! Empieza la asamblea. ¿Estás aquí? ¡Toca tu foto!':
    'Bună dimineața{nino}! Începe întâlnirea de dimineață. Ești aici? Atinge-ți poza!',
  '¡Hoy es un día muy especial... ¡es tu cumpleaños! ¡Feliz cumpleaños{nino}! Sopla las velitas: toca cada una.':
    'Azi e o zi foarte specială... e ziua ta de naștere! La mulți ani{nino}! Suflă în lumânări: atinge-le pe fiecare.',
  '¿Ahora es de día o de noche?': 'Acum e zi sau noapte?',
  'Cantemos los días de la semana.': 'Hai să cântăm zilele săptămânii.',
  'Hoy es {dia}. ¡Toca el vagón de hoy, el que salta!': 'Azi este {dia}. Atinge vagonul de azi, cel care sare!',
  'Ayer fue {dia}. ¿Qué día es hoy? Toca el vagón.': 'Ieri a fost {dia}. Ce zi e azi? Atinge vagonul.',
  'Hoy es {dia}. ¿Y mañana qué día será? Toca el vagón de mañana.':
    'Azi este {dia}. Și mâine ce zi va fi? Atinge vagonul de mâine.',
  'Estamos en {mes}. Hoy es {n}. Toca el número {n} en el calendario.':
    'Suntem în luna {mes}. Azi este {n}. Atinge numărul {n} din calendar.',
  '¿Qué tiempo hace hoy? Mira por la ventana de tu casa y toca el dibujo.':
    'Cum e vremea azi? Uită-te pe fereastra casei tale și atinge desenul.',
  'Con este tiempo, ¿qué nos ponemos para salir?': 'Pe vremea asta, ce ne punem ca să ieșim afară?',
  '¿En qué estación estamos? Toca el árbol.': 'În ce anotimp suntem? Atinge copacul.',
  'Ahora es {estacion}. ¿Qué estación viene después?': 'Acum e {estacion}. Ce anotimp vine după?',
  '¿Cómo te sientes hoy? Toca la carita.': 'Cum te simți azi? Atinge fețișoara.',
  '¡Terminamos la asamblea{nino}! ¡Ahora a jugar!': 'Am terminat întâlnirea{nino}! Acum, la joacă!',
  '¡Tres asambleas esta semana! ¡Ganaste una pegatina! Ahora, ¡a jugar!':
    'Trei întâlniri săptămâna asta! Ai câștigat un abțibild! Acum, la joacă!',
  '¡Toca tu foto!': 'Atinge-ți poza!',
  'Toca el vagón que salta.': 'Atinge vagonul care sare.',
  'Ayer fue {dia}. ¿Qué día es hoy?': 'Ieri a fost {dia}. Ce zi e azi?',
  '¿Qué día será mañana?': 'Ce zi va fi mâine?',
  'Toca el número {n}.': 'Atinge numărul {n}.',
  '¿Qué tiempo hace hoy?': 'Cum e vremea azi?',
  '¿En qué estación estamos?': 'În ce anotimp suntem?',
  '¿Qué estación viene después?': 'Ce anotimp vine după?',
  '¿Cómo te sientes hoy?': 'Cum te simți azi?',
  ASAMBLEA: 'ÎNTÂLNIREA',
  '¡PRESENTE!': 'PREZENT!',
  HOY: 'AZI',
  'HOY: {dia}': 'AZI: {dia}',
  'MAÑANA: {dia}': 'MÂINE: {dia}',
  '¡FELIZ CUMPLE!': 'LA MULȚI ANI!',
  'Calendario del tiempo de {mes}': 'Calendarul vremii din {mes}',
  'Hoy es {dia}, el que salta.': 'Azi este {dia}, cel care sare.',
  'Ayer fue {dia}. Hoy es el que viene después.': 'Ieri a fost {dia}. Azi este cel care vine după.',
  'Mañana es el que viene después de hoy.': 'Mâine este cel care vine după azi.',
  '¡Que los cumplas feliz! Tito te regala diez monedas.': 'La mulți ani! Tito îți dăruiește zece monede.',
  '¡Presente! Y hoy eres el encargado de la asamblea. ¡Te ganaste la gorra!':
    'Prezent! Și azi tu ești responsabilul întâlnirii. Ai câștigat șapca!',
  '¡Presente! ¡Qué bueno que estás aquí!': 'Prezent! Ce bine că ești aici!',
  'Hoy es {dia}.': 'Azi este {dia}.',
  'Mañana será {dia}.': 'Mâine va fi {dia}.',
  '¡Es fin de semana, no hay escuela!': 'E weekend, nu mergem la grădiniță!',
  'Es día de escuela.': 'E zi de grădiniță.',
  'Hoy es {dia} {n} de {mes}.': 'Azi este {dia}, {n} {mes}.',
  'Ese es el {n}. Busca el {m}.': 'Acela e {n}. Caută-l pe {m}.',
  'Lo anotamos en el calendario del tiempo.': 'Îl notăm în calendarul vremii.',
  '¡Sí! Ahora es de día.': 'Da! Acum e zi.',
  '¡Sí! Ahora es de noche.': 'Da! Acum e noapte.',
  '¡Sí! Nos ponemos {cosa}.': 'Da! Ne punem {cosa}.',
  '¡Sí! Estamos en {estacion}.': 'Da! Acum e {estacion}.',
  'Las hojas se caen.': 'Frunzele cad.',
  'Salen las flores.': 'Ies florile.',
  'Hace frío.': 'E frig.',
  'Hace calor.': 'E cald.',
  '¡Sí! Después viene {estacion}.': 'Da! După aceea vine {estacion}.',
  'Mira por la ventana.': 'Uită-te pe fereastră.',
  'Ahora no hay sol.': 'Acum nu e soare.',
  'Ahora hay luz.': 'Acum e lumină.',
  '{Cosa} no va con este tiempo.': '{Cosa} nu se potrivește cu vremea asta.',
  'Ese es el árbol {estacion}. Prueba con otro.': 'Acela e copacul {estacion}. Încearcă altul.',
  'Mmm, después de {antes} no viene {estacion}.': 'Mmm, după {antes} nu vine {estacion}.',
  'Prueba otra vez.': 'Mai încearcă o dată.',
  // las estaciones sueltas (la asamblea las dice sin artículo: «Acum e toamnă»)
  otoño: 'toamnă',
  invierno: 'iarnă',
  primavera: 'primăvară',
  verano: 'vară',
  // el álbum de pegatinas y el aviso de descansar
  'Este es tu álbum. Tienes 1 pegatina.': 'Acesta e albumul tău. Ai un abțibild.',
  'Este es tu álbum. Tienes {n} pegatinas.': 'Acesta e albumul tău. Ai {n} {n:de}abțibilduri.',
  'Todavía no tienes pegatinas. ¡Las ganas terminando juegos!':
    'Încă nu ai abțibilduri. Le câștigi când termini jocuri!',
  'Mi álbum de pegatinas': 'Albumul meu cu abțibilduri',
  'Esta todavía no la tienes.': 'Pe acesta încă nu-l ai.',
  '¡Qué bonito jugamos{nino}! Ahora Tito se va a descansar. ¡Hasta mañana!':
    'Ce frumos ne-am jucat{nino}! Acum Tito se duce să se odihnească. Pe mâine!',
  'Es hora de descansar': 'E timpul să ne odihnim',
  // escenas/diccionario.ts: el diccionario de inglés
  'Este es tu diccionario de inglés. Ya conoces 1 palabra.':
    'Acesta e dicționarul tău de engleză. Știi deja un cuvânt.',
  'Este es tu diccionario de inglés. Ya conoces {n} palabras.':
    'Acesta e dicționarul tău de engleză. Știi deja {n} {n:de}cuvinte.',
  'Tu diccionario de inglés está vacío. ¡Polly te espera en la Isla del Inglés!':
    'Dicționarul tău de engleză e gol. Polly te așteaptă pe Insula Englezei!',
  'Mi diccionario de inglés': 'Dicționarul meu de engleză',
  'Juega en la Isla del Inglés y aquí saldrán tus palabras':
    'Joacă-te pe Insula Englezei și aici vor apărea cuvintele tale',
  'quiere decir {palabra}.': 'înseamnă {palabra}.',
  // escenas/cofre.ts: el cofre del tesoro
  '¡Terminaste todos los juegos {tema}{nino}! ¡Ganaste un cofre del tesoro! Tócalo tres veces para abrirlo.':
    'Ai terminat toate jocurile {tema}{nino}! Ai câștigat un cufăr cu comori! Atinge-l de trei ori ca să-l deschizi.',
  'Toca el cofre para abrirlo. ¡Te falta un toque!': 'Atinge cufărul ca să-l deschizi. Mai trebuie o atingere!',
  'Toca el cofre para abrirlo. ¡Te faltan {n} toques!': 'Atinge cufărul ca să-l deschizi. Mai trebuie {n} atingeri!',
  'Toca la casa para ver tu regalo, o la flecha verde para seguir el camino.':
    'Atinge casa ca să-ți vezi cadoul sau săgeata verde ca să mergi mai departe pe drum.',
  'La casa de Tito.': 'Casa lui Tito.',
  'Seguir el camino.': 'Mergi mai departe pe drum.',
  '¡Mira lo que había{nino}: {cosa}! ¡Tito ya se lo puso! ¡Y diez monedas!':
    'Uite ce era înăuntru{nino}: {cosa}! Tito și l-a pus deja! Și zece monede!',
  '¡Mira lo que había{nino}: {cosa}! Ya está en la casa de Tito. ¡Y diez monedas!':
    'Uite ce era înăuntru{nino}: {cosa}! E deja în casa lui Tito. Și zece monede!',
  '¡Mira cuántas monedas{nino}! ¡Veinte monedas!': 'Uite câte monede{nino}! Douăzeci de monede!',
  'Toca la casa para verlo, o la flecha verde para seguir el camino.':
    'Atinge casa ca să-l vezi sau săgeata verde ca să mergi mai departe pe drum.',
  '¡Una vez más!': 'Încă o dată!',
  // escenas/repaso.ts: el repaso con Tito
  'Toca la flecha verde para seguir el camino.': 'Atinge săgeata verde ca să mergi mai departe pe drum.',
  '¡Terminaste el repaso de hoy{nino}! Tito te regala cinco monedas.':
    'Ai terminat recapitularea de azi{nino}! Tito îți dăruiește cinci monede.',
  '¡Muy bien! Ahora el número {n}.': 'Foarte bine! Acum numărul {n}.',
  'Todavía no hay nada para repasar. ¡Primero juega algunos juegos del camino!':
    'Încă nu e nimic de recapitulat. Mai întâi joacă niște jocuri de pe drum!',
  '¡Ya hiciste el repaso de hoy! Mañana Tito prepara otro. Toca la flecha verde para seguir el camino.':
    'Ai făcut deja recapitularea de azi! Mâine Tito pregătește alta. Atinge săgeata verde ca să mergi mai departe pe drum.',
  '¡Hora de repasar! Tito eligió juegos que todavía cuestan un poquito. ¡Practicando salen cada vez mejor!':
    'E timpul să recapitulăm! Tito a ales jocuri care încă îți vin puțin greu. Cu exercițiu ies tot mai bine!',
  '¡Hora de repasar! Tito eligió juegos que jugaste hace tiempo.':
    'E timpul să recapitulăm! Tito a ales jocuri pe care le-ai jucat demult.',
  'Repaso con Tito': 'Recapitulare cu Tito',
  // escenas/isla.ts: la Isla de las Letras (la isla; sus casitas, en la ID6)
  '¡Llegamos a la Isla de las Letras{nino}! Mira, es Lupi, la lechuza que cuida las letras. Aquí vamos a aprender a leer. Toca el botón verde para empezar.':
    'Am ajuns pe Insula Literelor{nino}! Uite, e Lupi, bufnița care are grijă de litere. Aici o să învățăm să citim. Atinge butonul verde ca să începem.',
  'Toca el botón verde para seguir con las letras. O toca una zona de la isla.':
    'Atinge butonul verde ca să continui cu literele. Sau atinge o zonă a insulei.',
  'Lupi, la lechuza.': 'Lupi, bufnița.',
  'Seguir con las letras.': 'Continuăm cu literele.',
  '¡Terminaste todas las letras que hay por ahora! Puedes repetir las que quieras.':
    'Ai terminat toate literele care există deocamdată! Le poți repeta pe care vrei.',
  '¡Hola! Soy Lupi, la lechuza. Cuido las letras de esta isla. ¡Vamos a aprenderlas juntos!':
    'Bună! Sunt Lupi, bufnița. Am grijă de literele acestei insule. Hai să le învățăm împreună!',
  'Lupi está preparando {zona}. ¡Muy pronto podrás jugar aquí!':
    'Lupi pregătește {zona}. Foarte curând te vei putea juca aici!',
  '{Zona} todavía no se ha abierto.': '{Zona} încă nu s-a deschis.',
  // escenas/islaIngles.ts: la Isla del Inglés
  '¡Llegamos a la Isla del Inglés{nino}! Mira, es Polly, la lorita. Polly habla inglés y nos va a enseñar muchas palabras. Toca el botón verde para empezar.':
    'Am ajuns pe Insula Englezei{nino}! Uite, e Polly, papagalul. Polly vorbește engleză și ne va învăța multe cuvinte. Atinge butonul verde ca să începem.',
  'Toca el botón verde para seguir con el inglés. O toca una zona de la isla.':
    'Atinge butonul verde ca să continui cu engleza. Sau atinge o zonă a insulei.',
  'Polly, la lorita.': 'Polly, papagalul.',
  'Seguir con el inglés.': 'Continuăm cu engleza.',
  '¡Terminaste todo el inglés que hay por ahora! Puedes repetir lo que quieras.':
    'Ai terminat toată engleza care există deocamdată! Poți repeta ce vrei.',
  'Hello! Soy Polly, la lorita. Vivo en esta isla y hablo inglés. ¡Vamos a aprender juntos!':
    'Hello! Sunt Polly, papagalul. Locuiesc pe această insulă și vorbesc engleză. Hai să învățăm împreună!',
  'Polly está preparando {zona}. ¡Muy pronto podrás jugar aquí!':
    'Polly pregătește {zona}. Foarte curând te vei putea juca aici!',
  // escenas/zonas.ts: el mapa, las zonas y las casitas
  'Empieza por el primero.': 'Începe cu primul.',
  'Este todavía está cerrado. Primero termina el número {n}.': 'Acesta încă e închis. Mai întâi termină numărul {n}.',
  '¡Bienvenido al Jardín de los 3 años! Sigue el camino: las casitas se abren de a una.':
    'Bine ai venit în Grădina de 3 ani! Urmează drumul: căsuțele se deschid pe rând.',
  '¡Bienvenido al Bosque de los 4 años! Sigue el camino: las casitas se abren de a una.':
    'Bine ai venit în Pădurea de 4 ani! Urmează drumul: căsuțele se deschid pe rând.',
  '¡Bienvenido a la Montaña de los 5 años! Sigue el camino: las casitas se abren de a una.':
    'Bine ai venit pe Muntele de 5 ani! Urmează drumul: căsuțele se deschid pe rând.',
  '¡Los días especiales! Se abren de a una, como un camino.': 'Zilele speciale! Se deschid pe rând, ca un drum.',
  '¡Bienvenido a la Playa de los Sonidos! Aquí conocemos las letras. Las casitas se abren de una en una.':
    'Bine ai venit pe Plaja Sunetelor! Aici cunoaștem literele. Căsuțele se deschid pe rând.',
  '¡Bienvenido al Bosque de las Letras! Aquí aprendemos letras nuevas. Las casitas se abren de una en una.':
    'Bine ai venit în Pădurea Literelor! Aici învățăm litere noi. Căsuțele se deschid pe rând.',
  '¡Bienvenido al Pueblo de las Palabras! Aquí juntamos las letras para leer palabras. Las casitas se abren de una en una.':
    'Bine ai venit în Satul Cuvintelor! Aici unim literele ca să citim cuvinte. Căsuțele se deschid pe rând.',
  '¡Bienvenido a la Playa Hello! Aquí aprendemos palabras en inglés con Polly. Las casitas se abren de una en una.':
    'Bine ai venit pe Plaja Hello! Aici învățăm cuvinte în engleză cu Polly. Căsuțele se deschid pe rând.',
  '¡Bienvenido al Parque de Londres! Aquí aprendemos más palabras en inglés con Polly. Las casitas se abren de una en una.':
    'Bine ai venit în Parcul Londrei! Aici învățăm mai multe cuvinte în engleză cu Polly. Căsuțele se deschid pe rând.',
  '¡Bienvenido al Pueblo de los Cuentos! Aquí jugamos con frases y cuentos en inglés. Las casitas se abren de una en una.':
    'Bine ai venit în Satul Poveștilor! Aici ne jucăm cu propoziții și povești în engleză. Căsuțele se deschid pe rând.',
  'El Rincón de los Conceptos se abre cuando termines tres casitas del camino. ¡Ya terminaste {n}!':
    'Colțul noțiunilor se deschide când termini trei căsuțe de pe drum. Ai terminat deja {n}!',
  'Los días especiales se abren cuando termines cuatro casitas del camino.':
    'Zilele speciale se deschid când termini patru căsuțe de pe drum.',
  'Esta casita todavía está cerrada. Primero termina {tema}. ¡Sigue el camino!':
    'Căsuța aceasta încă e închisă. Mai întâi termină căsuța {tema}. Urmează drumul!',
  'Esta casita todavía está cerrada. Primero termina la anterior. ¡Sigue el camino!':
    'Căsuța aceasta încă e închisă. Mai întâi termin-o pe cea dinainte. Urmează drumul!',
  '¡Mira! ¡Se abrió el Rincón de los Conceptos! Tócala para jugar.':
    'Uite! S-a deschis Colțul noțiunilor! Atinge-l ca să te joci.',
  '¡Mira! ¡Se abrió una casita nueva: {tema}! Tócala para jugar.':
    'Uite! S-a deschis o căsuță nouă: {tema}! Atinge-o ca să te joci.',
  '¡Terminaste todo el camino{nino}! ¡Increíble! Puedes repetir la casita que quieras.':
    'Ai terminat tot drumul{nino}! Incredibil! Poți repeta căsuța pe care o vrei.',
  'Toca la casita que brilla: {tema}.': 'Atinge căsuța care strălucește: {tema}.',
  '¡Terminaste todo el camino! Puedes repetir la casita que quieras.':
    'Ai terminat tot drumul! Poți repeta căsuța pe care o vrei.',
  '¡La casa de Tito creció! Ahora tiene un jardín con cerca y flores.':
    'Casa lui Tito a crescut! Acum are o grădină cu gard și flori.',
  '¡La casa de Tito creció! Ahora tiene un piso más, con balcón.':
    'Casa lui Tito a crescut! Acum are încă un etaj, cu balcon.',
  '¡La casa de Tito creció! Ahora tiene una torre con bandera.': 'Casa lui Tito a crescut! Acum are un turn cu steag.',
  '¡La casa de Tito es un castillo! Tiene estrella y arcoíris.': 'Casa lui Tito e un castel! Are stea și curcubeu.',
  '¡Mira! En el jardín de Tito apareció un huevo misterioso. ¡Si juegas, se va a abrir!':
    'Uite! În grădina lui Tito a apărut un ou misterios. Dacă te joci, o să se deschidă!',
  '¡El huevo se abrió! ¡Nació Pipo, un dinosaurio bebé!': 'Oul s-a deschis! S-a născut Pipo, un pui de dinozaur!',
  '¡Pipo salió del cascarón y ya camina!': 'Pipo a ieșit din găoace și deja merge!',
  '¡Pipo está creciendo un montón!': 'Pipo crește foarte mult!',
  '¡Pipo es un dinosaurio grandote! ¡Y tiene corona!': 'Pipo e un dinozaur mare de tot! Și are coroană!',
  '¡Terminaste todos los caminos{nino}! Puedes repetir lo que más te guste.':
    'Ai terminat toate drumurile{nino}! Poți repeta ce îți place cel mai mult.',
  'El cole': 'Grădinița',
  // los títulos de las zonas (con mayúscula, arriba de cada zona)
  'El Jardín de los 3 años': 'Grădina de 3 ani',
  'El Bosque de los 4 años': 'Pădurea de 4 ani',
  'La Montaña de los 5 años': 'Muntele de 5 ani',
  'Los días especiales': 'Zilele speciale',
  'La Playa de los Sonidos': 'Plaja Sunetelor',
  'El Bosque de las Letras': 'Pădurea Literelor',
  'El Pueblo de las Palabras': 'Satul Cuvintelor',
  'La Playa Hello': 'Plaja Hello',
  'El Parque de Londres': 'Parcul Londrei',
  'El Pueblo de los Cuentos': 'Satul Poveștilor',
  'El Rincón de los Conceptos': 'Colțul noțiunilor',
  'A  B  C  1  2  3': 'A  B  C  1  2  3',
  'Isla del Inglés': 'Insula Englezei',
  '3 años': '3 ani',
  '4 años': '4 ani',
  '5 años': '5 ani',
  '¡Mira{nino}! ¡Se despertó {zona}! Ahora puedes jugar ahí también.':
    'Uite{nino}! S-a trezit {zona}! Acum te poți juca și acolo.',
  '¡Mira{nino}! ¡Se abrieron {zona}! Toca para jugar.': 'Uite{nino}! S-au deschis {zona}! Atinge ca să te joci.',
  '¡Mira{nino}! ¡Se abrió {zona}! Toca para jugar.': 'Uite{nino}! S-a deschis {zona}! Atinge ca să te joci.',
  '¡Mira{nino}! ¡Tito tiene una flor en su caparazón!': 'Uite{nino}! Tito are o floare pe căsuța lui!',
  '¡Mira{nino}! ¡Tito tiene {n} flores en su caparazón!': 'Uite{nino}! Tito are {n} {n:de}flori pe căsuța lui!',
  '¡Hola{nino}! Te he guardado un regalito: ¡tres monedas!': 'Bună{nino}! Ți-am păstrat un cădouaș: trei monede!',
  'Jugamos un montón. ¿Descansamos un ratito? Tito te espera cuando quieras.':
    'Ne-am jucat foarte mult. Ne odihnim puțin? Tito te așteaptă când vrei.',
  '¡Llevamos un buen rato jugando! Vamos a hacer una pausa para estirarnos como los animales.':
    'Ne jucăm de mult timp! Hai să facem o pauză ca să ne întindem ca animalele.',
  '¡Buen día{nino}!': 'Bună dimineața{nino}!',
  '¡Buenas tardes{nino}!': 'Bună ziua{nino}!',
  '¡Buenas noches{nino}!': 'Bună seara{nino}!',
  'Vamos a la plaza a hacer la asamblea. Toca la plaza.': 'Hai în piață la întâlnirea de dimineață. Atinge piața.',
  'Toca el botón verde para seguir el camino. También puedes ir a la tienda o a la casa de Tito.':
    'Atinge butonul verde ca să mergi mai departe pe drum. Poți merge și la magazin sau la casa lui Tito.',
  'Es un huevo misterioso. Le falta un juego para abrirse.': 'E un ou misterios. Mai trebuie un joc ca să se deschidă.',
  'Es un huevo misterioso. Le faltan {n} juegos para abrirse.':
    'E un ou misterios. Mai trebuie {n} {n:de}jocuri ca să se deschidă.',
  '¡Hola! Soy Pipo, el dinosaurio de Tito.': 'Bună! Sunt Pipo, dinozaurul lui Tito.',
  'El repaso con Tito.': 'Recapitularea cu Tito.',
  '{Zona}.': '{Zona}.',
  '{Zona}. Todavía está cerrado.': '{Zona}. Încă e închis.',
  '{Zona}. Todavía está dormida.': '{Zona}. Încă doarme.',
  '{Zona}. Todavía está dormido.': '{Zona}. Încă doarme.',
  '{Zona} todavía está dormida. Se despierta cuando Tito tenga seis flores del jardín.':
    '{Zona} încă doarme. Se trezește când Tito are șase flori din grădină.',
  '{Zona} todavía está dormida. Se despierta cuando Tito tenga seis flores del bosque.':
    '{Zona} încă doarme. Se trezește când Tito are șase flori din pădure.',
  '{Zona} todavía está dormido. Se despierta cuando Tito tenga seis flores del jardín.':
    '{Zona} încă doarme. Se trezește când Tito are șase flori din grădină.',
  '{Zona} todavía está dormido. Se despierta cuando Tito tenga seis flores del bosque.':
    '{Zona} încă doarme. Se trezește când Tito are șase flori din pădure.',
  '¡Ya tiene una!': 'Are deja una!',
  '¡Ya tiene {n}!': 'Are deja {n}!',
  '{Zona} se abren cuando termines una casita del camino.': '{Zona} se deschid când termini o căsuță de pe drum.',
  '{Zona} se abren cuando termines {n} casitas del camino.':
    '{Zona} se deschid când termini {n} {n:de}căsuțe de pe drum.',
  '{Zona} se abre cuando termines una casita del camino.': '{Zona} se deschide când termini o căsuță de pe drum.',
  '{Zona} se abre cuando termines {n} casitas del camino.':
    '{Zona} se deschide când termini {n} {n:de}căsuțe de pe drum.',
  '¡Ya terminaste una!': 'Ai terminat deja una!',
  '¡Ya terminaste {n}!': 'Ai terminat deja {n}!',
  '¡Se abrió el juego número {n}! Tócalo para seguir.': 'S-a deschis jocul numărul {n}! Atinge-l ca să continui.',
  'Empieza por el primero: ¡vamos a conocer!': 'Începe cu primul: hai să cunoaștem!',
  'Toca el que brilla, el número {n}.': 'Atinge-l pe cel care strălucește, numărul {n}.',
  '¡Ya jugaste todos! Puedes repetir el que más te guste.':
    'Le-ai jucat pe toate! Îl poți repeta pe cel care îți place.',
  // escenas/tienda.ts: la tienda
  'Un cuento extra antes de dormir': 'O poveste în plus înainte de culcare',
  'Ir a jugar al parque': 'Mergem să ne jucăm în parc',
  'Elegir a qué jugamos juntos': 'Alegi cu ce ne jucăm împreună',
  'Cocinar algo rico juntos': 'Gătim ceva bun împreună',
  'Elegir la película del fin de semana': 'Alegi filmul de weekend',
  'Un abrazo de oso gigante': 'O îmbrățișare uriașă de urs',
  'Ropa para Tito': 'Haine pentru Tito',
  'Colores para Tito': 'Culori pentru Tito',
  'Cosas para la casa': 'Lucruri pentru casă',
  Juguetes: 'Jucării',
  'Cosas para el jardín': 'Lucruri pentru grădină',
  Mascotas: 'Animăluțe',
  'Vales para canjear': 'Tichete de folosit',
  'el vale: {vale}': 'tichetul: {vale}',
  '¡La tienda! Tienes {n} monedas. Toca algo para ver cuánto cuesta.':
    'Magazinul! Ai {n} {n:de}monede. Atinge ceva ca să vezi cât costă.',
  '¡Bienvenido a la tienda! Con las monedas que ganas jugando, puedes comprar cosas para mí y para mi casa. Arriba eliges qué mirar.':
    'Bine ai venit la magazin! Cu monedele pe care le câștigi jucându-te poți cumpăra lucruri pentru mine și pentru casa mea. Sus alegi ce să vezi.',
  '¿Lo compras? Toca el verde para comprar o la cruz para volver.':
    'Îl cumperi? Atinge verdele ca să cumperi sau crucea ca să te întorci.',
  'Toca algo para ver cuánto cuesta. Tienes {n} monedas.': 'Atinge ceva ca să vezi cât costă. Ai {n} {n:de}monede.',
  '{Cosa}. Ya es tuyo.': '{Cosa}. E deja al tău.',
  '{Cosa}. Cuesta {n} monedas.': '{Cosa}. Costă {n} {n:de}monede.',
  'La tienda': 'Magazinul',
  'Bueno, ¡otra vez será!': 'Bine, altă dată!',
  'Tienes {n} estrellas. Las ganas terminando juegos.': 'Ai {n} {n:de}stele. Le câștigi când termini jocuri.',
  '{Cosa} se abre cuando tengas {n} estrellas. ¡Ya tienes {m}! Ganas estrellas terminando juegos.':
    '{Cosa} se deschide când ai {n} {n:de}stele. Ai deja {m}! Câștigi stele când termini jocuri.',
  '{Cosa} son para {sala}. {Sala} se abre cuando termines una casita.':
    '{Cosa} sunt pentru {sala}. {Sala} se deschide când termini o căsuță.',
  '{Cosa} es para {sala}. {Sala} se abre cuando termines una casita.':
    '{Cosa} este pentru {sala}. {Sala} se deschide când termini o căsuță.',
  '{Cosa} son para {sala}. {Sala} se abre cuando termines {n} casitas.':
    '{Cosa} sunt pentru {sala}. {Sala} se deschide când termini {n} {n:de}căsuțe.',
  '{Cosa} es para {sala}. {Sala} se abre cuando termines {n} casitas.':
    '{Cosa} este pentru {sala}. {Sala} se deschide când termini {n} {n:de}căsuțe.',
  '¡Tito se puso {cosa}!': 'Tito și-a pus {cosa}!',
  'Tito se quitó {cosa}.': 'Tito și-a scos {cosa}.',
  '{Cosa} ya es tuyo. Está en la casa de Tito.': '{Cosa} e deja al tău. E în casa lui Tito.',
  '{Cosa} cuesta {n} monedas. Te falta una. ¡Jugando ganas más!':
    '{Cosa} costă {n} {n:de}monede. Îți mai trebuie una. Jucându-te câștigi mai multe!',
  '{Cosa} cuesta {n} monedas. Te faltan {f}. ¡Jugando ganas más!':
    '{Cosa} costă {n} {n:de}monede. Îți mai trebuie {f}. Jucându-te câștigi mai multe!',
  '¿Quieres comprar {cosa} por {n} monedas? Toca el verde para comprar.':
    'Vrei să cumperi {cosa} cu {n} {n:de}monede? Atinge verdele ca să cumperi.',
  '¡Compraste el vale! {vale}. Enséñaselo a un adulto de tu familia para canjearlo.':
    'Ai cumpărat tichetul! {vale}. Arată-l unui adult din familie ca să-l folosești.',
  '¡Es tuyo! ¡Mira qué bonito le queda a Tito!': 'E al tău! Uite ce frumos îi stă lui Tito!',
  '¡Es tuyo! Ya está en la casa de Tito. Toca la casita de arriba para verlo.':
    'E al tău! E deja în casa lui Tito. Atinge căsuța de sus ca să-l vezi.',
  // mundo3d: los carteles y lo que se dice al tocar el cielo
  SOL: 'SOARE',
  'Buenos días.': 'Bună dimineața.',
  SATURNO: 'SATURN',
  'Júpiter.': 'Jupiter.',
  JÚPITER: 'JUPITER',
  LUNA: 'LUNA',
  'Buenas noches.': 'Noapte bună.',
  CONTENTO: 'VESEL',
};
