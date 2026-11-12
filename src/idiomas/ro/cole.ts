/*
 * idiomas/ro/cole.ts: los textos en rumano del cole y lo que sale de él (fase ID4d de docs/PLAN-IDIOMAS.md): el cole,
 * el patio y sus juegos (estatuas, «Tito dice», yoga, retos en casa, las carreras 3D, el gran día del deporte y sus
 * pruebas, los juegos cortos y el escondite), el autobús, las excursiones y su álbum, la granja escuela con sus
 * estaciones, el manzano y las crías; y lo poco que quedaba de otras escenas (nombres de juegos del repaso, emociones,
 * los planetas del cielo 3D). Borrador de Claude para que lo revise una persona que hable rumano (ID9). Va del texto en
 * castellano, tal como está en el código, a su traducción; textos.ts junta esta tabla con las demás. Las plantillas
 * llevan sus huecos ({n}, {prueba}, {madre}...) y, entre un número y lo que cuenta, {n:de}.
 * Exporta: COLE_RO. No importa nada.
 */

/** Los textos del cole, el patio, las excursiones y el deporte, del castellano al rumano. */
export const COLE_RO: Readonly<Record<string, string>> = {
  // cole
  'El patio': 'Curtea',
  'Las clases': 'Clasele',
  'Excursiones': 'Excursii',
  'Cerrado': 'Închis',
  '¡Muy pronto!': 'În curând!',
  '¡Bienvenido al cole{nino}! Aquí está el patio, para jugar y moverse, y el autobús, para ir de excursión. Muy pronto vendrán las clases. ¡Toca el patio!':
    'Bine ai venit la grădiniță{nino}! Aici e curtea, ca să te joci și să te miști, și autobuzul, ca să mergem în excursie. În curând vor veni și clasele. Atinge curtea!',
  'El patio está cerrado por ahora. Toca la casa para volver al mapa.':
    'Curtea e închisă deocamdată. Atinge căsuța ca să te întorci pe hartă.',
  'Toca el patio para jugar, o el autobús para ir de excursión.':
    'Atinge curtea ca să te joci sau autobuzul ca să mergem în excursie.',
  '{Sitio} están en obras. ¡Muy pronto podrás jugar aquí!': '{Sitio} sunt în lucru. În curând te vei putea juca aici!',
  '{Sitio} está en obras. ¡Muy pronto podrás jugar aquí!': '{Sitio} e în lucru. În curând te vei putea juca aici!',
  'El patio está cerrado por ahora. ¡Hay muchas cosas más para jugar en el mapa!':
    'Curtea e închisă deocamdată. Pe hartă sunt multe alte lucruri cu care să te joci!',
  '¡Estatuas!': 'Statuile!',
  'Tito dice': 'Tito zice',
  'Yoga de los animales': 'Yoga animalelor',
  'Carreras': 'Curse',
  'Día del deporte': 'Ziua sportului',
  'Juegos cortos': 'Jocuri scurte',
  'El escondite': 'De-a v-ați ascunselea',
  'El circuito': 'Circuitul',
  // patio
  '¡Al patio{nino}! Aquí jugamos a juegos para movernos de verdad. Busca un sitio con espacio a tu alrededor. ¿Empezamos con las estatuas?':
    'În curte{nino}! Aici ne jucăm jocuri în care ne mișcăm de-adevăratelea. Caută un loc cu spațiu în jurul tău. Începem cu statuile?',
  'Elige un juego del patio.': 'Alege un joc din curte.',
  '¡Lo has hecho genial!': 'Ai făcut-o grozav!',
  '{juego}: ¡muy pronto podrás jugar!': '{juego}: în curând te vei putea juca!',
  '¡Juegos cortos del patio! Son juegos pequeñitos, para jugar un ratito. Elige uno.':
    'Jocurile scurte din curte! Sunt jocuri mici, pentru puțină joacă. Alege unul.',
  'Elige un juego corto.': 'Alege un joc scurt.',
  'La rayuela': 'Șotronul',
  'Los columpios': 'Leagănele',
  'Los penaltis': 'Penaltyurile',
  'Las pompas': 'Baloanele de săpun',
  'La cometa': 'Zmeul',
  'El pañuelo': 'Batista',
  'Las sillas': 'Scaunele',
  '¡Otra vez!': 'Încă o dată!',
  'Toca la flecha para jugar otra vez.': 'Atinge săgeata ca să ne jucăm din nou.',
  'Otra vez.': 'Încă o dată.',
  // estatuas
  '¡A bailar como un pingüino!': 'Dansăm ca un pinguin!',
  '¡Ahora saltamos como las ranas!': 'Acum sărim ca broscuțele!',
  '¡A bailar como un mono!': 'Dansăm ca o maimuță!',
  '¡Volamos como una mariposa!': 'Zburăm ca un fluture!',
  '¡A bailar como un robot!': 'Dansăm ca un robot!',
  '¡Estatua! Quietos como un árbol.': 'Statuia! Nemișcați ca un copac.',
  '¡Estatua! Quietos como una estrella.': 'Statuia! Nemișcați ca o stea.',
  '¡Estatua! Quietos como un gato dormido.': 'Statuia! Nemișcați ca o pisică adormită.',
  '¡Estatua! Hechos una bola, como una tortuga.': 'Statuia! Strânși ghem, ca o broască țestoasă.',
  '¡Estatua! Quietos como un robot.': 'Statuia! Nemișcați ca un robot.',
  '¡Muy bien! ¡Qué quietos!': 'Foarte bine! Ce nemișcați!',
  '¡Genial! Una estatua perfecta.': 'Grozav! O statuie perfectă.',
  '¡Bravo! Ni te has movido.': 'Bravo! Nici nu te-ai mișcat.',
  '¡Qué bien bailas! Has sido una estatua estupenda. ¿Jugamos otra vez?':
    'Ce frumos dansezi! Ai fost o statuie minunată. Ne mai jucăm o dată?',
  '¡A bailar!': 'La dans!',
  '¡Estatua!': 'Statuia!',
  '¡Vamos a jugar a las estatuas! Cuando suene la música, baila conmigo. Cuando pare, ¡nos quedamos quietos como estatuas!':
    'Hai să ne jucăm de-a statuile! Când se aude muzica, dansează cu mine. Când se oprește, rămânem nemișcați ca niște statui!',
  '¡A las estatuas! Baila con la música y, cuando pare, ¡quieto!':
    'De-a statuile! Dansează pe muzică și, când se oprește, stai nemișcat!',
  '¡Quietos como estatuas!': 'Nemișcați ca statuile!',
  '¡Baila con la música!': 'Dansează pe muzică!',
  // titoDice
  '¡salta tres veces!': 'sari de trei ori!',
  '¡da cuatro palmadas!': 'bate din palme de patru ori!',
  '¡tócate la nariz!': 'atinge-ți nasul!',
  '¡tócate la cabeza!': 'atinge-ți capul!',
  '¡tócate las orejas!': 'atinge-ți urechile!',
  '¡tócate la barriga!': 'atinge-ți burtica!',
  '¡tócate los pies!': 'atinge-ți picioarele!',
  '¡agáchate como una bolita!': 'ghemuiește-te ca o biluță!',
  '¡da una vuelta!': 'învârte-te o dată!',
  '¡levanta los brazos!': 'ridică brațele!',
  '¡marcha como un soldado!': 'mărșăluiește ca un soldat!',
  '¡ponte a la pata coja!': 'stai într-un picior!',
  '¡cierra los ojos!': 'închide ochii!',
  '¡abre mucho la boca!': 'deschide gura mare!',
  '¡da cinco pisotones!': 'bate din picior de cinci ori!',
  '¡Así se hace!': 'Așa se face!',
  '¡Je, je! No he dicho «Tito dice». Si no te has movido, ¡muy bien!':
    'Hi, hi! Nu am zis «Tito zice». Dacă nu te-ai mișcat, foarte bine!',
  '¡Vamos a jugar a «Tito dice»! Escucha bien y haz lo que diga Tito. ¡Yo lo hago contigo!':
    'Hai să ne jucăm «Tito zice»! Ascultă bine și fă ce zice Tito. Eu o fac cu tine!',
  '¡Vamos a jugar a «Tito dice»! Haz lo que yo diga, pero solo si antes digo «Tito dice». Si no lo digo, ¡no te muevas! ¡Atento, que a veces hago trampa!':
    'Hai să ne jucăm «Tito zice»! Fă ce spun eu, dar doar dacă înainte spun «Tito zice». Dacă nu spun, nu te mișca! Fii atent, că uneori trișez!',
  '¡A jugar a «Tito dice»! Solo vale si digo «Tito dice».':
    'Ne jucăm «Tito zice»! Contează doar dacă spun «Tito zice».',
  'Tito dice: {orden}': 'Tito zice: {orden}',
  '¡Qué bien escuchas! Has hecho todo lo que dice Tito. ¿Jugamos otra vez?':
    'Ce bine asculți! Ai făcut tot ce a zis Tito. Ne mai jucăm o dată?',
  'Escucha bien a Tito.': 'Ascultă-l bine pe Tito.',
  // yoga
  'Somos gatos: a cuatro patas, arqueamos la espalda hacia arriba, como un gato que se despierta.':
    'Suntem pisici: în patru labe, ne arcuim spatele în sus, ca o pisică ce se trezește.',
  'Somos perros: manos y pies en el suelo y el culete bien alto, como una montaña.':
    'Suntem câini: mâinile și picioarele pe jos și fundulețul sus, ca un munte.',
  'Somos ranas: nos agachamos con las rodillas abiertas y las manos en el suelo.':
    'Suntem broscuțe: ne ghemuim cu genunchii depărtați și mâinile pe jos.',
  'Somos árboles: un pie apoyado en la otra pierna y los brazos arriba, como ramas.':
    'Suntem copaci: o talpă sprijinită pe celălalt picior și brațele sus, ca niște crengi.',
  'Somos pájaros: a la pata coja, con los brazos abiertos como alas.':
    'Suntem păsări: într-un picior, cu brațele deschise ca niște aripi.',
  'Somos mariposas: sentados, juntamos las plantas de los pies y movemos las rodillas como alas.':
    'Suntem fluturi: așezați, lipim tălpile și mișcăm genunchii ca pe niște aripi.',
  'Somos tortugas: de rodillas, nos hacemos una bola y escondemos la cabeza en el caparazón.':
    'Suntem broaște țestoase: în genunchi, ne facem ghem și ne ascundem capul în carapace.',
  'Somos leones: de rodillas, las manos como garras, sacamos la lengua y rugimos sin hacer ruido.':
    'Suntem lei: în genunchi, cu mâinile ca niște gheare, scoatem limba și răgim fără zgomot.',
  'Ahora inflamos un globo en la barriga: tomamos aire despacito y la barriga se hincha. Luego lo soltamos.':
    'Acum umflăm un balon în burtică: tragem aer încet și burtica se umflă. Apoi îl dăm drumul.',
  'Olemos una flor tomando aire por la nariz, y soplamos una vela despacito, sin apagarla.':
    'Mirosim o floare trăgând aer pe nas și suflăm încet într-o lumânare, fără s-o stingem.',
  '¡Qué bien lo haces!': 'Ce bine faci!',
  '¡Genial! Respiras muy tranquilo.': 'Grozav! Respiri foarte liniștit.',
  '¡Estupendo!': 'Minunat!',
  'Respira conmigo.': 'Respiră cu mine.',
  '¡Qué bien! Ya tenemos energía para seguir jugando.': 'Ce bine! Acum avem energie să ne jucăm mai departe.',
  '¡Qué tranquilos estamos! Has hecho yoga como los animales. ¿Lo hacemos otra vez?':
    'Ce liniștiți suntem! Ai făcut yoga ca animalele. Mai facem o dată?',
  'Toma aire...': 'Trage aer...',
  'Suelta el aire...': 'Dă aerul afară...',
  '{n} de {total}': '{n} din {total}',
  '¡Vamos a estirarnos como los animales! Ponte de pie, con espacio a tu alrededor.':
    'Hai să ne întindem ca animalele! Ridică-te în picioare, cu spațiu în jurul tău.',
  '¡Bienvenido al rincón de la calma! Vamos a hacer yoga como los animales. Despacito y respirando tranquilos.':
    'Bine ai venit în colțul liniștii! Facem yoga ca animalele. Încet și respirând liniștit.',
  'Mira lo que hago y hazlo conmigo.': 'Uită-te ce fac și fă și tu cu mine.',
  'Ahora volvemos al mapa.': 'Acum ne întoarcem pe hartă.',
  'Toca la flecha para hacerlo otra vez.': 'Atinge săgeata ca s-o facem din nou.',
  'Mira a Tito y respira despacito.': 'Uită-te la Tito și respiră încet.',
  // retos
  'busca en casa tres cosas rojas.': 'caută prin casă trei lucruri roșii.',
  'Buscar en casa tres cosas rojas.': 'Să caute prin casă trei lucruri roșii.',
  'salta como una rana hasta la cocina.': 'sari ca o broscuță până la bucătărie.',
  'Ir saltando como una rana hasta la cocina.': 'Să meargă sărind ca o broscuță până la bucătărie.',
  'ayuda a poner la mesa.': 'ajută la pusul mesei.',
  'Ayudar a poner la mesa.': 'Să ajute la pusul mesei.',
  'cuenta las ventanas de tu casa.': 'numără ferestrele casei tale.',
  'Contar las ventanas de casa.': 'Să numere ferestrele casei.',
  'busca cosas redondas, como una pelota.': 'caută lucruri rotunde, ca o minge.',
  'Buscar cosas redondas por casa.': 'Să caute lucruri rotunde prin casă.',
  'anda como un cangrejo, de lado, por el pasillo.': 'mergi ca un crab, într-o parte, pe hol.',
  'Andar de lado como un cangrejo por el pasillo.': 'Să meargă într-o parte ca un crab pe hol.',
  'guarda tus juguetes en su sitio.': 'pune-ți jucăriile la locul lor.',
  'Recoger los juguetes y guardarlos en su sitio.': 'Să-și strângă jucăriile și să le pună la locul lor.',
  'cuenta los zapatos que hay en casa.': 'numără pantofii din casă.',
  'Contar los zapatos que hay en casa.': 'Să numere pantofii din casă.',
  'baila una canción con tu familia.': 'dansează un cântec cu familia ta.',
  'Bailar una canción en familia.': 'Să danseze un cântec în familie.',
  'imita a tu animal favorito y que tu familia lo adivine.':
    'imită animalul tău preferat și lasă-ți familia să ghicească.',
  'Imitar un animal para que la familia lo adivine.': 'Să imite un animal ca familia să-l ghicească.',
  'riega una planta o mira cómo ha crecido.': 'udă o plantă sau uită-te cât a crescut.',
  'Regar una planta (o mirar juntos cómo crece).': 'Să ude o plantă (sau să vă uitați împreună cum crește).',
  'busca la primera letra de tu nombre en un libro o un cartel.':
    'caută prima literă a numelui tău într-o carte sau pe un afiș.',
  'Buscar la primera letra de su nombre en un libro o un cartel.':
    'Să caute prima literă a numelui său într-o carte sau pe un afiș.',
  'empareja los calcetines de la ropa limpia.': 'pune perechi șosetele din rufele curate.',
  'Emparejar calcetines de la ropa limpia.': 'Să pună perechi șosetele din rufele curate.',
  'da un abrazo a cada persona de tu casa y cuéntalos.': 'îmbrățișează fiecare persoană din casă și numără-i.',
  'Dar un abrazo a cada persona de casa y contarlos.': 'Să îmbrățișeze fiecare persoană din casă și să-i numere.',
  'ponte a la pata coja mientras cuentas hasta cinco.': 'stai într-un picior cât numeri până la cinci.',
  'Aguantar a la pata coja contando hasta cinco.': 'Să stea într-un picior numărând până la cinci.',
  'busca algo de cada color del arcoíris.': 'caută ceva din fiecare culoare a curcubeului.',
  'Buscar algo de cada color del arcoíris.': 'Să caute ceva din fiecare culoare a curcubeului.',
  'Te dejo un reto para hacer en casa, sin pantalla: {reto}': 'Îți las o provocare de făcut acasă, fără ecran: {reto}',
  '¡Me han contado que has hecho el reto en casa{nino}! ¡Qué bien! Toma una pegatina.':
    'Mi s-a spus că ai făcut provocarea acasă{nino}! Ce bine! Ia un abțibild.',
  // columpios
  '¡Más alto!': 'Mai sus!',
  '¡Uy, qué alto!': 'Uau, ce sus!',
  '¡Qué bien empujas!': 'Ce bine împingi!',
  '¡Espera a que vuelva hacia ti!': 'Așteaptă să vin înapoi spre tine!',
  '¡Estoy tocando el cielo! ¡Gracias por empujarme tan alto!': 'Ating cerul! Mulțumesc că m-ai împins atât de sus!',
  '¡Qué bien me has columpiado! ¿Jugamos otra vez?': 'Ce bine m-ai dat în leagăn! Ne mai jucăm o dată?',
  '¡A los columpios! Empújame cuando el columpio llegue hasta la mano. Mueve los brazos, como si empujaras de verdad.':
    'La leagăne! Împinge-mă când leagănul ajunge la mână. Mișcă brațele, ca și cum ai împinge de-adevăratelea.',
  'Toca la mano para empujar cuando el columpio llegue hasta ella.':
    'Atinge mâna ca să împingi când leagănul ajunge la ea.',
  // cometa
  '¡Una estrella!': 'O stea!',
  '¡Qué bien vuela!': 'Ce frumos zboară!',
  '¡Otra más!': 'Încă una!',
  '¡Muy bien llevada!': 'Foarte bine condus!',
  '¡El viento sopla hacia la derecha!': 'Vântul bate spre dreapta!',
  '¡El viento sopla hacia la izquierda!': 'Vântul bate spre stânga!',
  '¡Cuidado con el árbol!': 'Atenție la copac!',
  '¡Qué bien has llevado la cometa! Has cogido todas las estrellas. ¿Jugamos otra vez?':
    'Ce bine ai condus zmeul! Ai prins toate stelele. Ne mai jucăm o dată?',
  '¡Vamos a volar la cometa! Llévala con el dedo hasta las estrellas, sin que toque los árboles. ¡Cuidado con el viento!':
    'Hai să înălțăm zmeul! Du-l cu degetul până la stele, fără să atingă copacii. Atenție la vânt!',
  'Lleva la cometa con el dedo hasta la estrella.': 'Du zmeul cu degetul până la stea.',
  // penaltis
  '× {n}': '× {n}',
  '¡A la izquierda!': 'La stânga!',
  '¡A la derecha!': 'La dreapta!',
  '¡Arriba!': 'Sus!',
  '¡Gol!': 'Gol!',
  '¡Golazo!': 'Ce gol!',
  '¡Gol, gol, gol!': 'Gol, gol, gol!',
  '¡Uy, lo ha parado Lupi!': 'Uf, a apărat Lupi!',
  '¡Qué parada! Otra vez será.': 'Ce paradă! Data viitoare.',
  '¿Hacia dónde chuto? ¿Izquierda, derecha o arriba?': 'Încotro șutez? Stânga, dreapta sau sus?',
  '¿Hacia dónde chuto? ¿Izquierda o derecha?': 'Încotro șutez? Stânga sau dreapta?',
  '¡Lupi lo ha parado todo! La próxima vez seguro que metemos gol.': 'Lupi a apărat tot! Data viitoare sigur dăm gol.',
  '¡Has metido un gol! ¿Jugamos otra vez?': 'Ai dat un gol! Ne mai jucăm o dată?',
  '¡Has metido {n} goles! ¿Jugamos otra vez?': 'Ai dat {n} {n:de}goluri! Ne mai jucăm o dată?',
  '¡A los penaltis! Lupi es la portera. Tú eliges hacia dónde chuto: toca un lado de la portería.':
    'La penaltyuri! Lupi e portarul. Tu alegi încotro șutez: atinge o parte a porții.',
  'Toca un lado de la portería para chutar.': 'Atinge o parte a porții ca să șutez.',
  'Izquierda.': 'Stânga.',
  'Derecha.': 'Dreapta.',
  'Arriba.': 'Sus.',
  '¡GOL!': 'GOL!',
  // pompas
  '¡Explota las pompas rojas!': 'Sparge baloanele roșii!',
  'Esa pompa es roja.': 'Balonul acela e roșu.',
  '¡Explota las pompas azules!': 'Sparge baloanele albastre!',
  'Esa pompa es azul.': 'Balonul acela e albastru.',
  '¡Explota las pompas amarillas!': 'Sparge baloanele galbene!',
  'Esa pompa es amarilla.': 'Balonul acela e galben.',
  '¡Explota las pompas verdes!': 'Sparge baloanele verzi!',
  'Esa pompa es verde.': 'Balonul acela e verde.',
  '¡Muy bien! Ahora, otro color.': 'Foarte bine! Acum, altă culoare.',
  '¡Cuántas pompas has explotado! Conoces muy bien los colores. ¿Jugamos otra vez?':
    'Câte baloane ai spart! Știi foarte bine culorile. Ne mai jucăm o dată?',
  '¡Pompas de jabón! Sopla conmigo, fuerte, para hacer muchas pompas. Explota solo las del color que te diga.':
    'Baloane de săpun! Suflă cu mine, tare, ca să facem multe baloane. Sparge doar baloanele de culoarea pe care ți-o spun.',
  // rayuela
  'Tira la piedra a la casilla del {n}.': 'Aruncă pietricica în căsuța cu {n}.',
  '¡Muy bien, en el {n}! ¡A la pata coja, salta conmigo y cuenta!':
    'Foarte bine, pe {n}! Într-un picior, sari cu mine și numără!',
  'Esa es la casilla del {n}. Busca la del {objetivo}.': 'Aceea e căsuța cu {n}. Caută-o pe cea cu {objetivo}.',
  '¡La piedra!': 'Pietricica!',
  '¡Qué bien saltas a la pata coja! Hemos jugado a la rayuela. ¿Jugamos otra vez?':
    'Ce bine sari într-un picior! Ne-am jucat șotron. Ne mai jucăm o dată?',
  '¡A la rayuela! Tira la piedra a la casilla que te diga y luego saltamos a la pata coja, contando. ¡Salta tú también!':
    'La șotron! Aruncă pietricica în căsuța pe care ți-o spun și apoi sărim într-un picior, numărând. Sari și tu!',
  'Toca la casilla del {n}.': 'Atinge căsuța cu {n}.',
  '¡Salta a la pata coja y cuenta conmigo!': 'Sari într-un picior și numără cu mine!',
  // panuelo
  '¡Punto para nuestro equipo!': 'Punct pentru echipa noastră!',
  '¡Qué rápido! ¡Otro punto!': 'Ce repede! Încă un punct!',
  '¡Lo has cogido! ¡Muy bien!': 'Ai prins-o! Foarte bine!',
  '¡El número {n}!': 'Numărul {n}!',
  'Yo llevo el {n}. Busca el {m}.': 'Eu am numărul {n}. Caută numărul {m}.',
  '¡Hemos ganado todos los puntos! Conoces muy bien los números. ¿Jugamos otra vez?':
    'Am câștigat toate punctele! Știi foarte bine numerele. Ne mai jucăm o dată?',
  '¡A jugar al pañuelo! Cuando diga un número, toca al amigo de tu equipo que lo lleva, y correrá a por el pañuelo.':
    'Hai să ne jucăm de-a batista! Când spun un număr, atinge prietenul din echipa ta care îl are și va fugi după batistă.',
  // sillas
  '¡Nadie se queda sin silla! Nos sentamos unos encima de otros.':
    'Nimeni nu rămâne fără scaun! Ne așezăm unii peste alții.',
  '¡Aquí cabemos todos! Qué risa.': 'Aici încăpem toți! Ce de râs.',
  '¡Una silla menos, pero cabemos todos!': 'Un scaun mai puțin, dar încăpem toți!',
  '¡Se para la música! ¡Toca la silla libre para que me siente!':
    'Se oprește muzica! Atinge scaunul liber ca să mă așez!',
  '¡Ya estamos todos sentados!': 'Gata, stăm toți jos!',
  'Quito una silla. ¡Otra vez música!': 'Scot un scaun. Din nou muzică!',
  '¡Siempre hay sitio para todos! Ha sido muy divertido. ¿Jugamos otra vez?':
    'Mereu e loc pentru toți! A fost foarte distractiv. Ne mai jucăm o dată?',
  '¡Las sillas musicales! Baila con nosotros mientras suena la música. Cuando pare, toca la silla libre para que me siente. ¡Aquí nadie se queda fuera!':
    'Scaunele muzicale! Dansează cu noi cât se aude muzica. Când se oprește, atinge scaunul liber ca să mă așez. Aici nimeni nu rămâne pe dinafară!',
  'Toca la silla libre para que me siente.': 'Atinge scaunul liber ca să mă așez.',
  '¡Baila mientras suena la música!': 'Dansează cât se aude muzica!',
  '¡Todavía suena la música! Sigue bailando.': 'Încă se aude muzica! Dansează mai departe.',
  // escondite
  '¡Está detrás del árbol!': 'E după copac!',
  '¡Está debajo del tobogán!': 'E sub tobogan!',
  '¡Está dentro de la casita!': 'E în căsuță!',
  '¡Está detrás del arbusto!': 'E după tufiș!',
  '¡Está debajo del banco!': 'E sub bancă!',
  '¡Está dentro de la caja!': 'E în cutie!',
  '¡Te encontré!': 'Te-am găsit!',
  '¡Aquí estás!': 'Aici erai!',
  '¡Pillado!': 'Prins!',
  '¡Ya te he visto!': 'Te-am văzut!',
  '¡Aquí no hay nadie!': 'Aici nu e nimeni!',
  '¡Os he encontrado a todos! Ahora me escondo yo. Toca dónde quieres que me esconda.':
    'V-am găsit pe toți! Acum mă ascund eu. Atinge unde vrei să mă ascund.',
  '¡Chis! Lupi cuenta y viene a buscarme.': 'Ssst! Lupi numără și vine să mă caute.',
  '¡Lupi me ha encontrado!': 'Lupi m-a găsit!',
  '¿Estará aquí? ¡No!': 'Oare e aici? Nu!',
  '¡Qué bien nos lo hemos pasado jugando al escondite! ¿Jugamos otra vez?':
    'Ce bine ne-am jucat de-a v-ați ascunselea! Ne mai jucăm o dată?',
  '¡Vamos a jugar al escondite! Mis amigos se esconden y yo cuento hasta diez. Cuenta conmigo.':
    'Hai să ne jucăm de-a v-ați ascunselea! Prietenii mei se ascund și eu număr până la zece. Numără cu mine.',
  '¡Allá voy! ¿Dónde se habrán escondido?': 'Iată-mă! Unde s-or fi ascuns?',
  'Toca dónde quieres que me esconda.': 'Atinge unde vrei să mă ascund.',
  // carreras
  META: 'SOSIRE',
  'Polly': 'Polly',
  'Lupi': 'Lupi',
  'primer lugar': 'primul loc',
  'segundo lugar': 'al doilea loc',
  'tercer lugar': 'al treilea loc',
  'cuarto lugar': 'al patrulea loc',
  'último lugar': 'ultimul loc',
  'En {lugar}, {nombre}.': 'Pe {lugar}, {nombre}.',
  '¡Meta!': 'Linia de sosire!',
  '¡Un cruce! ¿Vamos por la izquierda o por la derecha? Las estrellas están a la izquierda.':
    'O răscruce! Mergem la stânga sau la dreapta? Stelele sunt la stânga.',
  '¡Un cruce! ¿Vamos por la izquierda o por la derecha? Las estrellas están a la derecha.':
    'O răscruce! Mergem la stânga sau la dreapta? Stelele sunt la dreapta.',
  '¡Por la izquierda!': 'Pe la stânga!',
  '¡Por la derecha!': 'Pe la dreapta!',
  '¡Y has cogido todos los números, del uno al cinco!': 'Și ai prins toate numerele, de la unu la cinci!',
  'Has cogido un número.': 'Ai prins un număr.',
  'Has cogido {n} números.': 'Ai prins {n} {n:de}numere.',
  '¡Todos tenemos medalla!': 'Toți avem medalie!',
  'Has cogido una estrella{nino}.': 'Ai prins o stea{nino}.',
  'Has cogido {n} estrellas{nino}.': 'Ai prins {n} {n:de}stele{nino}.',
  'Preparados, listos...': 'Pe locuri, fiți gata...',
  '¡Ya!': 'Start!',
  '¡Vamos a hacer una carrera! Toca la pantalla para que Tito salte los charcos y las piedras.':
    'Hai să facem o cursă! Atinge ecranul ca Tito să sară peste bălți și pietre.',
  '¡Y coge los números del uno al cinco, saltando!': 'Și prinde numerele de la unu la cinci, sărind!',
  '¿Por dónde vamos? ¿Por la izquierda o por la derecha?': 'Pe unde mergem? Pe la stânga sau pe la dreapta?',
  '¿Otra carrera? Toca la flecha verde.': 'Încă o cursă? Atinge săgeata verde.',
  'Toca la pantalla para que Tito salte.': 'Atinge ecranul ca Tito să sară.',
  '¿Por la izquierda o por la derecha? Toca una flecha.': 'Pe la stânga sau pe la dreapta? Atinge o săgeată.',
  // deporte
  'La carrera': 'Cursa',
  'la carrera': 'cursa',
  'el salto de longitud': 'săritura în lungime',
  'la puntería': 'aruncarea la țintă',
  'el equilibrio': 'echilibrul',
  'los relevos': 'ștafeta',
  'oro': 'aur',
  'plata': 'argint',
  'bronce': 'bronz',
  'una medalla de {medalla}': 'o medalie de {medalla}',
  'una de {medalla}': 'una de {medalla}',
  '{n} medallas de {medalla}': '{n} medalii de {medalla}',
  '{n} de {medalla}': '{n} de {medalla}',
  '{lista} y {ultimo}': '{lista} și {ultimo}',
  'Tienes {lista}.': 'Ai {lista}.',
  '¡Medallero!': 'Clasamentul medaliilor!',
  '¡Copa nueva!': 'O cupă nouă!',
  '¡Y ganas la copa de esta semana! Ya tienes una copa.': 'Și câștigi cupa săptămânii! Acum ai o cupă.',
  '¡Y ganas la copa de esta semana! Ya tienes {n} copas.': 'Și câștigi cupa săptămânii! Acum ai {n} {n:de}cupe.',
  'La copa de esta semana ya es tuya. ¡Vuelve la semana que viene a por otra!':
    'Cupa săptămânii e deja a ta. Revino săptămâna viitoare pentru încă una!',
  '¡Has terminado el gran día del deporte{nino}!': 'Ai terminat marea zi a sportului{nino}!',
  '¡Medalla de {medalla} en {prueba}!': '{Prueba}: medalie de {medalla}!',
  'la prueba': 'proba',
  'Ahora, {prueba}. Toca su tarjeta.': 'Acum urmează {prueba}. Atinge-i cartonașul.',
  '¡Hoy es el gran día del deporte! Hay cinco pruebas y en cada una ganas una medalla. ¡Empezamos con {prueba}! Toca su tarjeta.':
    'Azi e marea zi a sportului! Sunt cinci probe și la fiecare câștigi o medalie. Începem cu {prueba}! Atinge-i cartonașul.',
  '¡Hoy es el gran día del deporte! Hay cuatro pruebas y en cada una ganas una medalla. ¡Empezamos con {prueba}! Toca su tarjeta.':
    'Azi e marea zi a sportului! Sunt patru probe și la fiecare câștigi o medalie. Începem cu {prueba}! Atinge-i cartonașul.',
  'la primera': 'prima',
  '¿Otra jornada? Toca la flecha verde.': 'Încă o zi de sport? Atinge săgeata verde.',
  'Ahora toca {prueba}. Toca su tarjeta.': 'Acum e rândul probei: {prueba}. Atinge-i cartonașul.',
  'Gran día del deporte': 'Marea zi a sportului',
  'En {prueba} has ganado la medalla de {medalla}.': '{Prueba}: ai câștigat medalia de {medalla}.',
  'Las pruebas van en orden. Ahora toca {prueba}.': 'Probele merg în ordine. Acum e rândul probei: {prueba}.',
  'la siguiente': 'următoarea',
  '¡{n} palmos!': '{n} {n:de}palme!',
  'Tu mejor salto: {n} palmos.': 'Cea mai bună săritură a ta: {n} {n:de}palme.',
  '¡El salto de longitud! Tito corre hacia la raya blanca. Toca para saltar justo antes de la raya.':
    'Săritura în lungime! Tito aleargă spre linia albă. Atinge ca să sară chiar înainte de linie.',
  'Toca para saltar justo antes de la raya blanca.': 'Atinge ca să sară chiar înainte de linia albă.',
  'El salto de longitud': 'Săritura în lungime',
  '¡Canasta!': 'Coș!',
  '¡Casi!': 'Aproape!',
  'Has metido una canasta.': 'Ai dat un coș.',
  'Has metido {n} canastas.': 'Ai dat {n} {n:de}coșuri.',
  '¡La puntería! La canasta se mueve. Toca para lanzar la pelota cuando la canasta esté justo encima.':
    'Aruncarea la țintă! Coșul se mișcă. Atinge ca să arunci mingea când coșul e chiar deasupra.',
  'Toca para lanzar cuando la canasta esté encima de la pelota.': 'Atinge ca să arunci când coșul e deasupra mingii.',
  'La puntería': 'Aruncarea la țintă',
  '¡Qué equilibrio! Has aguantado con los dos pies.': 'Ce echilibru! Ai rezistat pe amândouă picioarele.',
  '¡Muy bien! Ahora, con el otro pie. ¿Preparados?': 'Foarte bine! Acum, pe celălalt picior. Gata?',
  '¡El equilibrio! Ponte de pie, levanta un pie y aguanta a la pata coja mientras yo cuento.':
    'Echilibrul! Ridică-te, ridică un picior și stai într-un picior cât număr eu.',
  '¡A la pata coja! Aguanta mientras cuento.': 'Într-un picior! Rezistă cât număr.',
  '¡Con el otro pie!': 'Pe celălalt picior!',
  '¡A la pata coja!': 'Într-un picior!',
  'El equilibrio': 'Echilibrul',
  '¡Pase perfecto!': 'Pasă perfectă!',
  '¡Meta! Has hecho un pase perfecto.': 'Sosirea! Ai făcut o pasă perfectă.',
  '¡Meta! Has hecho {n} pases perfectos.': 'Sosirea! Ai făcut {n} {n:de}pase perfecte.',
  '¡Los relevos! Cada uno corre un trozo y le pasa el testigo al siguiente. Cuando el siguiente brille, tócalo para pasarle el testigo.':
    'Ștafeta! Fiecare aleargă o bucată și îi dă bățul următorului. Când următorul strălucește, atinge-l ca să-i dai bățul.',
  'Cuando el siguiente brille, tócalo para pasarle el testigo.':
    'Când următorul strălucește, atinge-l ca să-i dai bățul.',
  'Los relevos': 'Ștafeta',
  // excursiones
  'La granja escuela': 'Ferma-școală',
  'Rosa': 'Rosa',
  'Dar de comer a los animales': 'Hrănim animalele',
  'Recoger huevos': 'Strângem ouăle',
  'Ordeñar y hacer queso': 'Mulgem și facem brânză',
  'Cepillar al caballo': 'Țesălăm calul',
  'El huerto': 'Grădina de legume',
  'Paseo en tractor': 'Plimbare cu tractorul',
  'El zoo': 'Grădina zoologică',
  'El bosque': 'Pădurea',
  '{dia} de {mes}': '{dia} {mes}',
  'una vez': 'o dată',
  '{n} veces': 'de {n} {n:de}ori',
  'Aún no hemos ido': 'Încă n-am fost',
  'Aquí irá la foto {excursion}, cuando vayamos de excursión.': 'Aici va fi poza {excursion}, când mergem în excursie.',
  '¡{Excursion}! Hemos ido una vez; la última, el {fecha}. ¿Te acuerdas de {guia}?':
    '{Excursion}! Am fost o dată; ultima oară, pe {fecha}. Ți-o amintești pe {guia}?',
  '¡{Excursion}! Hemos ido {n} veces; la última, el {fecha}. ¿Te acuerdas de {guia}?':
    '{Excursion}! Am fost de {n} {n:de}ori; ultima oară, pe {fecha}. Ți-o amintești pe {guia}?',
  'Este es el álbum de excursiones. Aquí se guardan las fotos de grupo. Toca una foto.':
    'Acesta e albumul de excursii. Aici se păstrează pozele de grup. Atinge o poză.',
  'Toca una foto del álbum.': 'Atinge o poză din album.',
  'Mis excursiones': 'Excursiile mele',
  '¡Sube al autobús{nino}! ¿Adónde nos vamos de excursión? Toca un cartel.':
    'Urcă în autobuz{nino}! Unde mergem în excursie? Atinge un indicator.',
  'El álbum de excursiones.': 'Albumul de excursii.',
  '¡Nos vamos de excursión!': 'Plecăm în excursie!',
  '¡{Excursion} está en obras! Muy pronto podremos ir.': '{Excursion} e în lucru! În curând vom putea merge.',
  '¡Nos vamos {excursion}! ¡Brum, brum!': 'Mergem {excursion}! Brum, brum!',
  '¡Patata!': 'Zâmbiți!',
  '¡Una foto de grupo! ¡Patata! Ha sido una excursión estupenda. {guia} nos espera otro día en {excursion}. La foto se queda en el álbum de excursiones. Toca la casa para volver al cole.':
    'O poză de grup! Zâmbiți! A fost o excursie minunată. {guia} ne așteaptă altă dată: {excursion}. Poza rămâne în albumul de excursii. Atinge căsuța ca să ne întoarcem la grădiniță.',
  '¡Hola{nino}! Soy {guia}, la granjera. ¡Bienvenido a la granja escuela! Hoy vas a ayudarme a cuidar a los animales.':
    'Bună{nino}! Eu sunt {guia}, fermiera. Bine ai venit la ferma-școală! Azi mă ajuți să am grijă de animale.',
  'Toca la casa para volver al cole.': 'Atinge căsuța ca să ne întoarcem la grădiniță.',
  '¡Vamos a {estacion}! Toca su dibujo.': 'Acum: {estacion}! Atinge-i desenul.',
  '{estacion}: ¡muy pronto podremos hacerlo!': '{estacion}: în curând vom putea face asta!',
  // granja
  'el cerdo': 'porcul',
  'el caballo': 'calul',
  'la gallina': 'găina',
  'la vaca': 'vaca',
  'la oveja': 'oaia',
  'hierba': 'iarbă',
  'trigo': 'grâu',
  'zanahorias': 'morcovi',
  'manzanas': 'mere',
  'heno': 'fân',
  '¡Todos los animales tienen la barriga llena! ¡Muchas gracias por ayudar!':
    'Toate animalele au burtica plină! Mulțumesc mult că m-ai ajutat!',
  '¡Ñam, ñam! ¡Muy bien!': 'Mmm, ce bun! Foarte bine!',
  '¡Puaj! {AlAnimal} no le gusta eso. {Animal} come {comida}.':
    'Bleah! {AlAnimal} nu-i place asta. {Animal} mănâncă {comida}.',
  'Cada animal come una cosa. Arrastra su comida hasta su comedero.':
    'Fiecare animal mănâncă altceva. Trage mâncarea lui până la iesle.',
  'Arrastra la comida de cada animal hasta su comedero.': 'Trage mâncarea fiecărui animal până la ieslea lui.',
  'Las gallinas han puesto huevos escondidos en la paja. ¡Toca la paja para buscarlos y los guardamos en la cesta!':
    'Găinile au ouat ouă ascunse în paie. Atinge paiele ca să le cauți și le punem în coș!',
  'Toca la paja para buscar los huevos.': 'Atinge paiele ca să cauți ouăle.',
  '¡{n} huevos!': '{n} {n:de}ouă!',
  'Aquí no hay ninguno.': 'Aici nu e niciunul.',
  '¡Hemos recogido {n} huevos! Las gallinas están muy contentas.': 'Am strâns {n} ouă! Găinile sunt foarte mulțumite.',
  // crias
  'el pollito': 'puișorul',
  'Plumita': 'Pufuleț',
  'Amarillo': 'Gălbior',
  'el corderito': 'mieluțul',
  'Algodón': 'Bumbăcel',
  'Rizos': 'Cârlionț',
  'Copo': 'Fulg',
  'el ternero': 'vițelul',
  'Manchitas': 'Pătățel',
  'Lucero': 'Luceafăr',
  'el lechón': 'purcelușul',
  'la cerda': 'scroafa',
  'Rosita': 'Roza',
  'Trufa': 'Trufa',
  'Bellota': 'Ghinduța',
  'el potro': 'mânzul',
  'la yegua': 'iapa',
  'Rayo': 'Fulger',
  'Galope': 'Galop',
  'Estrella': 'Steluța',
  '¡Es {nombre}, {cria}! Va siempre con su mamá.': 'E {nombre}, {cria}! Merge mereu cu mama lui.',
  '¡Tengo una sorpresa! Algo se mueve en la paja. Toca la estrella para verlo.':
    'Am o surpriză! Ceva se mișcă în paie. Atinge steaua ca să vezi.',
  '¡Ha nacido {cria}! Es la cría {madre}. ¿Cómo lo llamamos? ¿{a}, {b} o {c}? Toca un nombre.':
    'S-a născut {cria}! E puiul {madre}. Cum îi spunem? {a}, {b} sau {c}? Atinge un nume.',
  '¡Hola, {nombre}! Ya vive en la granja con su mamá. Cada día que vengas, {nombre} estará más grande.':
    'Bună, {nombre}! Acum locuiește la fermă cu mama lui. În fiecare zi când vii, {nombre} va fi mai mare.',
  '¡El huevo {madre} se mueve! Tócalo para ayudar al pollito a salir.':
    'Oul {madre} se mișcă! Atinge-l ca să-l ajuți pe puișor să iasă.',
  '¡Algo se mueve en la paja, al lado de {madre}! Toca la paja para ver qué es.':
    'Ceva se mișcă în paie, lângă {madre}! Atinge paiele ca să vezi ce e.',
  'Toca el huevo.': 'Atinge oul.',
  'Toca la paja.': 'Atinge paiele.',
  'Elige un nombre: ¿{a}, {b} o {c}?': 'Alege un nume: {a}, {b} sau {c}?',
  '¡Cada cría está con su mamá! ¡Muy bien{nino}!': 'Fiecare pui e cu mama lui! Foarte bine{nino}!',
  '¡{nombre} está con {madre}!': '{nombre} e cu {madre}!',
  'Esa no es su mamá. La mamá {cria} es {madre}.': 'Aceea nu e mama lui. Mama {cria} e {madre}.',
  'Las crías se han despistado. Arrastra cada cría hasta su mamá.':
    'Puii s-au rătăcit. Trage fiecare pui până la mama lui.',
  'Arrastra cada cría hasta su mamá.': 'Trage fiecare pui până la mama lui.',
  // manzano
  '¡Mira el manzano! De la semilla ha salido un brote.': 'Uite mărul! Din sămânță a ieșit un mugur.',
  '¡El manzano ya es un arbolito! Sigue creciendo.': 'Mărul e acum un copăcel! Crește mai departe.',
  '¡El manzano está lleno de flores! Pronto saldrán manzanas.': 'Mărul e plin de flori! În curând vor ieși mere.',
  '¡El manzano ya tiene manzanas! Tócalo para que caigan.': 'Mărul are deja mere! Atinge-l ca să cadă.',
  'Aquí hemos plantado la semilla del manzano. Cada día que vengas a la granja crecerá un poco.':
    'Aici am plantat sămânța de măr. În fiecare zi când vii la fermă va crește puțin.',
  'Es un brote de manzano. Vuelve otro día y estará más grande.':
    'E un mugur de măr. Revino altă zi și va fi mai mare.',
  'Es un arbolito. Cada día que vienes, crece un poco más.':
    'E un copăcel. În fiecare zi când vii, crește puțin mai mult.',
  '¡Qué flores tan bonitas! De las flores saldrán las manzanas.': 'Ce flori frumoase! Din flori vor ieși merele.',
  '¡Manzanas! Se las llevamos a los animales.': 'Mere! Le ducem animalelor.',
  'Hoy plantamos una semilla de manzano junto al granero. Cada día que vuelvas, crecerá un poco.':
    'Azi plantăm o sămânță de măr lângă hambar. În fiecare zi când revii, va crește puțin.',
  // talleres
  'Primero, ordeñamos a la vaca. Toca la ubre para que caiga la leche en el cubo.':
    'Mai întâi, mulgem vaca. Atinge ugerul ca să curgă laptele în găleată.',
  '¡El cubo está lleno de leche! Ahora la echamos en la olla. Remueve: da vueltas con el dedo dentro de la olla.':
    'Găleata e plină cu lapte! Acum îl turnăm în oală. Amestecă: învârte degetul în oală.',
  '¡La leche se ha puesto espesa! La metemos en el molde. Toca la prensa para apretar.':
    'Laptele s-a îngroșat! Îl punem în formă. Atinge presa ca să apeși.',
  '¡Ya tenemos queso! La leche de la vaca se ha convertido en queso. ¡Qué rico!':
    'Avem brânză! Laptele vacii s-a făcut brânză. Ce bună!',
  '¡Vamos a hacer queso con la leche de la vaca!': 'Hai să facem brânză din laptele vacii!',
  '¡Qué limpio y brillante está el caballo! Le ha encantado que lo cepilles.':
    'Ce curat și strălucitor e calul! I-a plăcut mult să-l țesăli.',
  '¡Oh! El caballo se ha revolcado en el barro. Frota las manchas con el cepillo para dejarlo limpio.':
    'Oh! Calul s-a tăvălit în noroi. Freacă petele cu peria ca să-l faci curat.',
  'Frota las manchas de barro con el dedo.': 'Freacă petele de noroi cu degetul.',
  'Vamos a plantar zanahorias. Toca cada hoyo para echar una semilla.':
    'Hai să plantăm morcovi. Atinge fiecare groapă ca să pui o sămânță.',
  '¡Ya está todo sembrado! Ahora hay que regar. Toca cada hoyo para echarle agua.':
    'Gata, totul e semănat! Acum trebuie udat. Atinge fiecare groapă ca să-i dai apă.',
  '¡Mira cuánto han crecido! Toca las zanahorias para arrancarlas.':
    'Uite cât au crescut! Atinge morcovii ca să-i scoți.',
  'Ahora el sol las calienta y el agua las alimenta. Esperamos un poquito...':
    'Acum soarele îi încălzește și apa îi hrănește. Așteptăm puțin...',
  '¡Hemos recogido {n} zanahorias del huerto! ¡Qué buena cosecha!':
    'Am cules {n} morcovi din grădină! Ce recoltă bună!',
  '¡{N} balas de paja! Nos las llevamos al granero para los animales.':
    '{N} baloți de paie! Îi ducem la hambar pentru animale.',
  '¡Subimos al tractor! Toca las balas de paja y el tractor irá a recogerlas.':
    'Urcăm în tractor! Atinge baloții de paie și tractorul se va duce să-i strângă.',
  'Toca una bala de paja para que el tractor vaya a por ella.':
    'Atinge un balot de paie ca tractorul să meargă după el.',
  // varios
  'Bebé': 'Bebeluș',
  'Otoño': 'Toamnă',
  'Memoria': 'Memorie',
  'Toca la parte del cuerpo': 'Atinge partea corpului',
  'Rompecabezas': 'Puzzle',
  'Contar': 'Numărăm',
  'Cavar en la arena': 'Săpăm în nisip',
  'El cuento': 'Povestea',
  '¿Qué viene después?': 'Ce urmează?',
  'Soplar las velitas': 'Suflăm în lumânări',
  'Toca las velitas para soplarlas.': 'Atinge lumânările ca să sufli în ele.',
  '¿Qué nos ponemos?': 'Ce ne punem?',
  'Ese es el {dia}.': 'Aceea e {dia}.',
  '¿Dónde está?': 'Unde e?',
  'alegría': 'bucurie',
  'tristeza': 'tristețe',
  'enfado': 'furie',
  'miedo': 'frică',
  'sorpresa': 'surpriză',
  'calma': 'calm',
  'vergüenza': 'rușine',
  'El sol. Es una estrella gigante que nos da luz y calor.': 'Soarele. E o stea uriașă care ne dă lumină și căldură.',
  'Saturno. Tiene unos anillos enormes.': 'Saturn. Are niște inele uriașe.',
  'Júpiter. Es el planeta más grande de todos.': 'Jupiter. E cea mai mare planetă dintre toate.',
  'La luna. Gira alrededor de la Tierra. De noche la vemos brillar.':
    'Luna. Se învârte în jurul Pământului. Noaptea o vedem strălucind.',
  '{a} / {b}': '{a} / {b}',
};
