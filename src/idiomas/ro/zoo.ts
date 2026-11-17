/*
 * idiomas/ro/zoo.ts: los textos en rumano de la excursión al zoo (fase P17 de docs/IDEAS-MEJORA.md, desde la v0.2.161,
 * por la regla de Fernando del 15 de noviembre de 2026: toda funcionalidad nueva es multiidioma): los recintos, lo que
 * dice Nico el cuidador (la bienvenida, las presentaciones y los datos curiosos), las frases de dar de comer y la página
 * del zoo del álbum de fotos (el safari fotográfico); desde la P18 (v0.2.162), también la excursión al acuario, con Marina
 * la buceadora, y desde la P19 (v0.2.163), el museo de los dinosaurios, con Pablo el paleontólogo, y desde la P20 (v0.2.164), la ciudad, con
 * Lucía la bombera, y desde la P21 (v0.2.165), el bosque de otoño, con Hugo el guardabosques, y desde
 * la P22 (v0.2.166), el mercado, con Carmen la frutera, y desde la P23 (v0.2.169), el planetario, con Sara la astronauta. Lo común de las excursiones está en cole.ts. Borrador de Claude
 * para que lo revise una persona que hable rumano. Va del texto en castellano, tal como está en el código, a su
 * traducción; textos.ts junta esta tabla con las demás. Las plantillas llevan sus huecos ({nino}, {guia}, {cosa}...).
 * Exporta: ZOO_RO. No importa nada.
 */

/** Los textos de la excursión al zoo, del castellano al rumano. */
export const ZOO_RO: Readonly<Record<string, string>> = {
  // el plano y los recintos
  Nico: 'Nico',
  'La sabana': 'Savana',
  'La selva': 'Jungla',
  'La zona polar': 'Zona polară',
  'La casa de los reptiles': 'Casa reptilelor',
  'La gran pajarera': 'Marea volieră',
  '¡Hola{nino}! Soy {guia}, el cuidador del zoo. ¡Bienvenido al zoo! Hoy vamos a visitar a los animales salvajes.':
    'Bună{nino}! Eu sunt {guia}, îngrijitorul de la grădina zoologică. Bine ai venit! Azi vizităm animalele sălbatice.',
  // lo que dice Nico en cada recinto
  '¡Esto es la sabana! Los animales tienen mucha hambre.': 'Aceasta e savana! Animalele sunt foarte flămânde.',
  '¿Sabes una cosa? La jirafa es el animal más alto del mundo. ¡Llega a las hojas de lo alto de los árboles!':
    'Știi ceva? Girafa e cel mai înalt animal din lume. Ajunge la frunzele din vârful copacilor!',
  'Une cada animal con su comida. Arrastra del animal a lo que come.':
    'Unește fiecare animal cu mâncarea lui. Trage de la animal la ce mănâncă.',
  '{Cosa} come {otra}.': '{Cosa} mănâncă {otra}.',
  'Mmm, {cosa} no come {otra}.': 'Mmm, {cosa} nu mănâncă {otra}.',
  '¡Esto es la selva! Aquí se oyen muchos ruidos. ¿Sabes quién los hace?':
    'Aceasta e jungla! Aici se aud multe zgomote. Știi cine le face?',
  '¿Sabes una cosa? Los monos viven en los árboles y saltan de rama en rama. ¡Son unos grandes trepadores!':
    'Știi ceva? Maimuțele trăiesc în copaci și sar din ramură în ramură. Se cațără grozav!',
  '¡Qué frío hace en la zona polar! Las crías están jugando en el hielo. ¡Vamos a contarlas!':
    'Ce frig e în zona polară! Puii se joacă pe gheață. Hai să-i numărăm!',
  '¿Sabes una cosa? Los pingüinos no saben volar, ¡pero nadan rapidísimo!':
    'Știi ceva? Pinguinii nu știu să zboare, dar înoată foarte repede!',
  '¡Oh, no! El cartel de la casa de los reptiles se ha roto. ¿Me ayudas a arreglarlo?':
    'Oh, nu! Panoul casei reptilelor s-a rupt. Mă ajuți să-l repar?',
  '¿Sabes una cosa? La tortuga lleva su casa a cuestas: ¡es su caparazón!':
    'Știi ceva? Broasca țestoasă își poartă casa în spate: e carapacea ei!',
  'En la gran pajarera viven muchos pájaros. ¡Vamos a buscarlos!':
    'În marea volieră trăiesc multe păsări. Hai să le căutăm!',
  '¿Sabes una cosa? El búho duerme de día y por la noche sale a volar.':
    'Știi ceva? Bufnița doarme ziua, iar noaptea iese să zboare.',
  // el safari fotográfico: la página del zoo del álbum de fotos
  'Animales del zoo': 'Animalele de la grădina zoologică',
  'El león': 'Leul',
  'El elefante': 'Elefantul',
  'La jirafa': 'Girafa',
  'La cebra': 'Zebra',
  'El tigre': 'Tigrul',
  'El mono': 'Maimuța',
  'El cocodrilo': 'Crocodilul',
  // desde la P18 (v0.2.162): la excursión al acuario, con Marina la buceadora
  'El acuario': 'Acvariul',
  Marina: 'Marina',
  'Las burbujas': 'Bulele',
  'Las estrellas de mar': 'Stelele de mare',
  'La piscina de los delfines': 'Piscina delfinilor',
  'La sala de los tamaños': 'Sala mărimilor',
  'La cueva de la ballena': 'Peștera balenei',
  '¡Hola{nino}! Soy {guia}, la buceadora del acuario. ¡Bienvenido al acuario! Vamos a pasear por un túnel debajo del agua.':
    'Bună{nino}! Eu sunt {guia}, scafandra de la acvariu. Bine ai venit la acvariu! Ne plimbăm printr-un tunel pe sub apă.',
  '¡Mira cuántas burbujas! Dentro hay animales del mar.': 'Uite câte bule! Înăuntru sunt animale din mare.',
  '¿Sabes una cosa? Los peces respiran debajo del agua con las branquias.':
    'Știi ceva? Peștii respiră sub apă cu branhiile.',
  '¡Atrapa los peces!': 'Prinde peștii!',
  '¡Ahora, los cangrejos!': 'Acum, crabii!',
  'En el fondo del acuario hay estrellas de mar escondidas. ¡Vamos a contarlas!':
    'Pe fundul acvariului sunt stele de mare ascunse. Hai să le numărăm!',
  '¿Sabes una cosa? Las estrellas de mar tienen cinco brazos, ¡y si pierden uno les vuelve a crecer!':
    'Știi ceva? Stelele de mare au cinci brațe și, dacă pierd unul, le crește la loc!',
  '¡Los delfines saltan en fila! Fíjate bien en el orden.': 'Delfinii sar în șir! Uită-te bine la ordine.',
  '¿Sabes una cosa? Los delfines hablan entre ellos con silbidos y chasquidos.':
    'Știi ceva? Delfinii vorbesc între ei prin fluierături și pocnituri.',
  'En esta sala hay animales pequeños y grandes. ¿Los ordenamos?':
    'În sala asta sunt animale mici și mari. Le punem în ordine?',
  '¿Sabes una cosa? La ballena azul es el animal más grande del mundo. ¡Es más larga que un autobús!':
    'Știi ceva? Balena albastră e cel mai mare animal din lume. E mai lungă decât un autobuz!',
  '¡Escucha! La ballena está cantando. Sus amigos se han escondido de dos en dos. ¡Busca las parejas!':
    'Ascultă! Balena cântă. Prietenii ei s-au ascuns câte doi. Caută perechile!',
  '¿Sabes una cosa? Las ballenas cantan canciones muy largas que se oyen desde muy lejos.':
    'Știi ceva? Balenele cântă cântece foarte lungi, care se aud de foarte departe.',
  // desde la P19 (v0.2.163): la excursión al museo de los dinosaurios, con Pablo el paleontólogo
  'El museo de los dinosaurios': 'Muzeul dinozaurilor',
  Pablo: 'Pablo',
  'La excavación': 'Săpătura',
  'Montar los dinosaurios': 'Montăm dinozaurii',
  'La sala de medir': 'Sala de măsurat',
  '¿Qué comían?': 'Ce mâncau?',
  'El nido de los dinosaurios': 'Cuibul dinozaurilor',
  '¡Hola{nino}! Soy {guia}, el paleontólogo del museo. ¡Bienvenido al museo de los dinosaurios! Los paleontólogos buscamos huesos de dinosaurio.':
    'Bună{nino}! Eu sunt {guia}, paleontologul muzeului. Bine ai venit la muzeul dinozaurilor! Noi, paleontologii, căutăm oase de dinozaur.',
  'Vamos a medir {cosa} con los pasos de Tito. Toca las huellas una a una.':
    'Hai să măsurăm {cosa} cu pașii lui Tito. Atinge urmele una câte una.',
  'Toca las huellas una a una para contar los pasos.': 'Atinge urmele una câte una ca să numeri pașii.',
  '¿Cuál es el más largo? Tócalo.': 'Care e cel mai lung? Atinge-l.',
  'Ya los hemos medido todos. ¿Cuál es el más largo? Tócalo.': 'I-am măsurat pe toți. Care e cel mai lung? Atinge-l.',
  '¡{Cosa} mide {n} pasos de Tito!': '{Cosa} măsoară {n} pași de-ai lui Tito!',
  '{Cosa} es el más largo.': '{Cosa} e cel mai lung.',
  '{Cosa} mide {n} pasos. Busca el que tiene más pasos.':
    '{Cosa} măsoară {n} pași. Caută-l pe cel cu cei mai mulți pași.',
  '¡Ha nacido un triceratops bebé!': 'S-a născut un pui de triceratops!',
  '¡Ha nacido un tiranosaurio bebé!': 'S-a născut un pui de tiranozaur!',
  '¡Ha nacido un diplodoco bebé!': 'S-a născut un pui de diplodocus!',
  '¡Ha nacido un pterodáctilo bebé!': 'S-a născut un pui de pterodactil!',
  'Toca los huevos para ayudar a los dinosaurios a salir.': 'Atinge ouăle ca să-i ajuți pe dinozauri să iasă.',
  '¡Han nacido todos los bebés!': 'S-au născut toți puii!',
  '¡Esto es la excavación! Aquí trabajamos los paleontólogos.': 'Aceasta e săpătura! Aici lucrăm noi, paleontologii.',
  '¿Sabes una cosa? Los fósiles son huesos y huellas que se quedaron guardados en la piedra durante millones de años.':
    'Știi ceva? Fosilele sunt oase și urme care au rămas păstrate în piatră milioane de ani.',
  '¡Oh, no! Los cuadros de los dinosaurios se han caído y se han roto. ¿Me ayudas a montarlos?':
    'Vai! Tablourile cu dinozauri au căzut și s-au rupt. Mă ajuți să le refacem?',
  '¿Sabes una cosa? El triceratops tenía tres cuernos en la cabeza para defenderse.':
    'Știi ceva? Triceratopsul avea trei coarne pe cap ca să se apere.',
  'En esta sala medimos a los dinosaurios. ¡Tito nos presta sus pasos!':
    'În sala aceasta măsurăm dinozaurii. Tito ne împrumută pașii lui!',
  '¿Sabes una cosa? El diplodoco era tan largo como tres autobuses, ¡y tenía la cabeza pequeñita!':
    'Știi ceva? Diplodocusul era lung cât trei autobuze și avea capul foarte mic!',
  'Unos dinosaurios comían plantas y otros comían carne. ¿Los separamos?':
    'Unii dinozauri mâncau plante, iar alții mâncau carne. Îi despărțim?',
  '¿Sabes una cosa? El tiranosaurio tenía los dientes tan grandes como plátanos.':
    'Știi ceva? Tiranozaurul avea dinții mari cât niște banane.',
  '¡Mira este nido! Los huevos se están moviendo. ¡Van a nacer!':
    'Uite cuibul acesta! Ouăle se mișcă. Puii sunt gata să iasă!',
  '¿Sabes una cosa? Las mamás dinosaurio ponían los huevos en nidos, como los pájaros.':
    'Știi ceva? Mamele dinozaur își puneau ouăle în cuiburi, ca păsările.',
  // desde la P20 (v0.2.164): la excursión a la ciudad, con Lucía la bombera
  'La ciudad': 'Orașul',
  Lucía: 'Lucía',
  'Vestirse de bombero': 'Ne îmbrăcăm ca pompierii',
  'Apagar el fuego': 'Stingem focul',
  'La panadería': 'Brutăria',
  'El centro de salud': 'Centrul medical',
  'Cruzar la calle': 'Traversăm strada',
  '¡Hola{nino}! Soy {guia}, la bombera. ¡Bienvenido a la ciudad! Vamos a ver el parque de bomberos, la panadería y el centro de salud.':
    'Bună{nino}! Eu sunt {guia}, pompiera. Bine ai venit în oraș! Vom vedea remiza de pompieri, brutăria și centrul medical.',
  'Para apagar fuegos, primero hay que ponerse el traje. Primero las botas, después la chaqueta, luego el casco y al final los guantes.':
    'Ca să stingem focul, mai întâi ne punem costumul. Întâi cizmele, apoi geaca, pe urmă casca și la sfârșit mănușile.',
  '¿Sabes una cosa? El traje de los bomberos los protege del fuego y del calor.':
    'Știi ceva? Costumul pompierilor îi apără de foc și de căldură.',
  'Ordena la ropa del bombero: primero las botas, después la chaqueta, luego el casco y al final los guantes.':
    'Pune în ordine hainele pompierului: întâi cizmele, apoi geaca, pe urmă casca și la sfârșit mănușile.',
  '¡Muy bien! Ya estamos listos para salir.': 'Foarte bine! Suntem gata de plecare.',
  '¡Hay un fuego en una casa! Subimos al camión de bomberos y... ¡a apagarlo!':
    'Arde o casă! Urcăm în mașina de pompieri și... hai să stingem focul!',
  '¿Sabes una cosa? Si hay un fuego, hay que avisar a un mayor y llamar al ciento doce.':
    'Știi ceva? Dacă vezi un foc, spune-i unui adult și sunați la o sută doisprezece.',
  'Echa agua con la manguera: frota las llamas hasta que no quede ninguna.':
    'Aruncă apă cu furtunul: freacă flăcările până nu mai rămâne niciuna.',
  '¡Fuego apagado! Eres un bombero estupendo.': 'Focul s-a stins! Ești un pompier grozav.',
  '¡Qué bien huele! Estamos en la panadería. ¿Sabes cómo se hace el pan?':
    'Ce bine miroase! Suntem la brutărie. Știi cum se face pâinea?',
  '¿Sabes una cosa? Los panaderos se levantan muy temprano, cuando todavía es de noche, para que el pan esté listo por la mañana.':
    'Știi ceva? Brutarii se trezesc foarte devreme, când încă e noapte, ca pâinea să fie gata dimineața.',
  '¿Cómo se hace el pan? Ordena del primero al último.': 'Cum se face pâinea? Pune în ordine, de la primul la ultimul.',
  '¡Muy bien! Del trigo sale la harina, el panadero hace la masa y la mete en el horno. ¡Y sale el pan!':
    'Foarte bine! Din grâu se face făina, brutarul face aluatul și îl pune în cuptor. Și iese pâinea!',
  'Esto es el centro de salud. Aquí nos cuidan cuando estamos malitos.':
    'Acesta e centrul medical. Aici avem grijă de noi când suntem bolnavi.',
  '¿Sabes una cosa? Para no ponernos malos, nos lavamos las manos, comemos fruta y dormimos mucho.':
    'Știi ceva? Ca să nu ne îmbolnăvim, ne spălăm pe mâini, mâncăm fructe și dormim mult.',
  '¡Ay! El conejito se ha caído y tiene pupas. Frota con la crema para curarlo.':
    'Vai! Iepurașul a căzut și s-a julit. Freacă cu crema ca să-l vindeci.',
  '¡Ya está curado! El conejito está muy contento.': 'S-a vindecat! Iepurașul e foarte bucuros.',
  'Para volver al cole hay que cruzar la calle. ¡Mira bien el semáforo!':
    'Ca să ne întoarcem la grădiniță, trebuie să traversăm strada. Uită-te bine la semafor!',
  '¿Sabes una cosa? Cruzamos la calle por el paso de cebra, con el semáforo en verde y de la mano de un mayor.':
    'Știi ceva? Traversăm strada pe trecerea de pietoni, când semaforul e verde, și ținem de mână un adult.',
  // desde la P21 (v0.2.165): el bosque de otoño, con Hugo el guardabosques
  'El bosque de otoño': 'Pădurea de toamnă',
  'Hugo': 'Hugo',
  'Las hojas de colores': 'Frunzele colorate',
  'Las huellas del conejo': 'Urmele iepurelui',
  'Los sonidos del bosque': 'Sunetele pădurii',
  'La despensa de la ardilla': 'Cămara veveriței',
  'El mural del otoño': 'Pictura toamnei',
  '¡Hola{nino}! Soy {guia}, el guardabosques. ¡Bienvenido al bosque de otoño! Vamos a ver los árboles, las hojas y los animales del bosque.':
    'Bună{nino}! Eu sunt {guia}, pădurarul. Bine ai venit în pădurea de toamnă! Vom vedea copacii, frunzele și animalele pădurii.',
  '¡Mira cómo caen las hojas! En otoño se ponen de muchos colores.':
    'Uite cum cad frunzele! Toamna se fac de multe culori.',
  '¿Sabes una cosa? En otoño, muchos árboles se quedan sin hojas para descansar durante el invierno.':
    'Știi ceva? Toamna, mulți copaci rămân fără frunze ca să se odihnească peste iarnă.',
  '¡Atrapa las hojas rojas!': 'Prinde frunzele roșii!',
  '¡Ahora, las hojas naranjas!': 'Acum, frunzele portocalii!',
  '¡Mira! Aquí hay huellas. Son de un conejo. ¿Adónde irá?':
    'Uite! Aici sunt urme. Sunt ale unui iepure. Unde o fi mergând?',
  '¿Sabes una cosa? Los conejos viven en madrigueras, unas casas con túneles debajo de la tierra.':
    'Știi ceva? Iepurii trăiesc în vizuini, niște căsuțe cu tuneluri sub pământ.',
  'Sigue las huellas del conejo. Toca las huellas una a una.': 'Urmează urmele iepurelui. Atinge urmele una câte una.',
  '¡Hemos llegado a la madriguera del conejo!': 'Am ajuns la vizuina iepurelui!',
  '¡Silencio! Si escuchamos bien, oiremos a los animales del bosque.':
    'Liniște! Dacă ascultăm bine, o să auzim animalele pădurii.',
  '¿Sabes una cosa? El búho puede girar la cabeza casi del todo para mirar hacia atrás.':
    'Știi ceva? Bufnița își poate întoarce capul aproape de tot, ca să se uite în spate.',
  'La ardilla guarda comida para el invierno. ¡Vamos a contar lo que tiene!':
    'Veverița strânge mâncare pentru iarnă. Hai să numărăm ce are!',
  '¿Sabes una cosa? La ardilla esconde bellotas en muchos sitios, ¡y a veces se le olvida dónde las ha puesto!':
    'Știi ceva? Veverița ascunde ghinde în multe locuri și uneori uită unde le-a pus!',
  'Para acabar, vamos a hacer un mural con todo lo que hemos visto en el bosque.':
    'La sfârșit, facem o pictură mare cu tot ce am văzut în pădure.',
  '¿Sabes una cosa? Con las hojas secas del otoño se pueden hacer dibujos muy bonitos.':
    'Știi ceva? Din frunzele uscate de toamnă se pot face desene foarte frumoase.',
  // desde la P22 (v0.2.166): el mercado, con Carmen la frutera
  'El mercado': 'Piața',
  'Carmen': 'Carmen',
  'La lista de la compra': 'Lista de cumpărături',
  'La báscula': 'Cântarul',
  'Comprar el pan': 'Cumpărăm pâine',
  'La pescadería': 'Pescăria',
  'Pagar en la caja': 'Plătim la casă',
  '¡Hola{nino}! Soy {guia}, la frutera. ¡Bienvenido al mercado! Vamos a hacer la compra y a pagar con monedas.':
    'Bună{nino}! Eu sunt {guia}, vânzătoarea de fructe. Bine ai venit la piață! Facem cumpărăturile și plătim cu monede.',
  'Aquí tenemos la lista de la compra. ¡Vamos a buscar la fruta en la frutería!':
    'Aici avem lista de cumpărături. Hai să căutăm fructele la tarabă!',
  '¿Sabes una cosa? La fruta de cada estación es la más rica: en otoño, las uvas, y en verano, la sandía.':
    'Știi ceva? Fructele fiecărui anotimp sunt cele mai gustoase: toamna, strugurii, iar vara, pepenele.',
  'Con la báscula sabemos lo que pesa la fruta. ¿Qué pesa más?':
    'Cu cântarul aflăm cât cântăresc fructele. Ce cântărește mai mult?',
  '¿Sabes una cosa? Lo grande no siempre pesa más: ¡un globo es grande y no pesa casi nada!':
    'Știi ceva? Ce e mare nu cântărește mereu mai mult: un balon e mare și nu cântărește aproape nimic!',
  '¿Qué pesa más?': 'Ce cântărește mai mult?',
  '¡Sí! {Cosa} pesa más.': 'Da! {Cosa} cântărește mai mult.',
  'No, esa pesa menos. ¿Qué pesa más?': 'Nu, aceea cântărește mai puțin. Ce cântărește mai mult?',
  '¡Qué bien huele la panadería! Vamos a comprar pan. Hay que pagar con monedas.':
    'Ce bine miroase la brutărie! Hai să cumpărăm pâine. Plătim cu monede.',
  '¿Sabes una cosa? Cuando pagamos, damos el dinero y nos llevamos lo que compramos.':
    'Știi ceva? Când plătim, dăm banii și luăm ce am cumpărat.',
  'El pan cuesta {n} euros. Mete {n} monedas en la caja.':
    'Pâinea costă {n} {n:de}euro. Pune {n} {n:de}monede în casa de marcat.',
  'Has pagado {n} euros. ¡Aquí tienes el pan!': 'Ai plătit {n} {n:de}euro. Poftim pâinea!',
  'En la pescadería, el pescado está en el hielo para que esté fresquito. ¡Vamos a contarlo!':
    'La pescărie, peștele stă pe gheață ca să fie proaspăt. Hai să-l numărăm!',
  '¿Sabes una cosa? El pescado viene del mar en barcos de pesca, muy temprano por la mañana.':
    'Știi ceva? Peștele vine de pe mare cu bărcile pescarilor, foarte devreme dimineața.',
  'Ya tenemos toda la compra. Ahora vamos a pagar. ¡Hay que contar bien el dinero!':
    'Avem toate cumpărăturile. Acum plătim. Trebuie să numărăm bine banii!',
  '¿Sabes una cosa? Si pagamos con más dinero del que cuesta, nos devuelven lo que sobra: es la vuelta.':
    'Știi ceva? Dacă plătim cu mai mulți bani decât costă, ni se dă înapoi ce e în plus: acesta e restul.',
  'Cuesta {p} euros y pagamos con cinco euros. ¿Cuántos euros nos devuelven?':
    'Costă {p} euro și plătim cu cinci euro. Câți euro primim rest?',
  '¡Sí! Nos devuelven {n}.': 'Da! Primim rest {n}.',
  'No. Cuenta las monedas que sobran.': 'Nu. Numără monedele care rămân.',
  // desde la P23 (v0.2.169): el planetario y el viaje a la Luna, con Sara la astronauta
  'El planetario': 'Planetariul',
  'Sara': 'Sara',
  'La cuenta atrás': 'Numărătoarea inversă',
  'Los planetas': 'Planetele',
  'El día y la noche': 'Ziua și noaptea',
  'Pisar la Luna': 'Pășim pe Lună',
  'Volver a casa': 'Ne întoarcem acasă',
  '¡Hola{nino}! Soy {guia}, la astronauta. ¡Bienvenido al planetario! Hoy vamos a viajar a la Luna.':
    'Bună{nino}! Eu sunt {guia}, astronauta. Bine ai venit la planetariu! Astăzi călătorim pe Lună.',
  '¡Subimos al cohete! Antes de despegar hay que hacer la cuenta atrás, hasta el cero.':
    'Urcăm în rachetă! Înainte de decolare numărăm invers, până la zero.',
  '¿Sabes una cosa? Los cohetes echan mucho fuego por abajo para subir muy deprisa hasta el espacio.':
    'Știi ceva? Rachetele scot mult foc pe dedesubt ca să urce foarte repede în spațiu.',
  '{a}, {b}, {c}... ¿Qué número viene ahora?': '{a}, {b}, {c}... Ce număr urmează acum?',
  '¡Cero! ¡Despegamos!': 'Zero! Decolăm!',
  '¡Sí! {N}.': 'Da! {N}.',
  'No. Cuenta hacia atrás: ¿qué número va antes?': 'Nu. Numără invers: ce număr e înainte?',
  '¡Ya estamos en el espacio! Mira por la ventana: se ven los planetas.':
    'Suntem în spațiu! Uită-te pe geam: se văd planetele.',
  '¿Sabes una cosa? Los planetas dan vueltas alrededor del sol, y la Tierra es nuestro planeta.':
    'Știi ceva? Planetele se învârt în jurul Soarelui, iar Pământul este planeta noastră.',
  'Desde aquí se ve la Tierra dando vueltas. Por eso hay día y noche.':
    'De aici se vede Pământul cum se învârte. De aceea există zi și noapte.',
  '¿Sabes una cosa? Cuando aquí es de día, al otro lado de la Tierra es de noche.':
    'Știi ceva? Când aici e zi, pe partea cealaltă a Pământului e noapte.',
  '¡Hemos llegado a la Luna! Aquí todo pesa muy poco y se camina dando saltitos.':
    'Am ajuns pe Lună! Aici totul cântărește foarte puțin și mergem țopăind.',
  '¿Sabes una cosa? En la Luna no hay viento, así que las huellas de los astronautas siguen allí.':
    'Știi ceva? Pe Lună nu bate vântul, așa că urmele astronauților sunt încă acolo.',
  'Pisa la Luna: toca las huellas una a una hasta la bandera.':
    'Pășește pe Lună: atinge urmele una câte una până la steag.',
  '¡Hemos plantado la bandera en la Luna!': 'Am înfipt steagul pe Lună!',
  'Es hora de volver a casa. ¿Te acuerdas de cómo ha sido el viaje?':
    'E timpul să ne întoarcem acasă. Îți amintești cum a fost călătoria?',
  '¿Sabes una cosa? Cuando vuelven, los astronautas caen al mar con paracaídas y los recoge un barco.':
    'Știi ceva? Când se întorc, astronauții cad în mare cu parașuta și îi ia o navă.',
  'Ordena el viaje: primero despegamos en el cohete, después llegamos a la Luna y al final volvemos a la Tierra.':
    'Pune călătoria în ordine: întâi decolăm cu racheta, apoi ajungem pe Lună și la sfârșit ne întoarcem pe Pământ.',
  '¡Muy bien! Ya estamos otra vez en casa.': 'Foarte bine! Suntem din nou acasă.',
};
