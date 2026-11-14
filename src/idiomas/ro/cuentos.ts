/*
 * idiomas/ro/cuentos.ts: los cuentos en rumano (fase ID5e de docs/PLAN-IDIOMAS.md): el título, las páginas que lee Tito,
 * las preguntas y las respuestas de los 37 cuentos de contenido/cuentos.ts (uno por tema de 3, 4 y 5 años). Borrador de
 * Claude para que lo revise una persona que hable rumano (ID9). Va del texto en castellano, tal como está en el código, a
 * su traducción; textos.ts junta esta tabla con las demás. Los nombres de los niños de los cuentos se quedan como están.
 * Exporta: CUENTOS_RO. No importa nada.
 */

/** Los textos de los cuentos, del castellano al rumano. */
export const CUENTOS_RO: Readonly<Record<string, string>> = {
  // 3 años
  'La mochila de Teo': 'Ghiozdanul lui Teo',
  'Teo llegó al cole con su mochila nueva. ¡Era azul y tenía un bolsillo secreto!':
    'Teo a venit la grădiniță cu ghiozdanul nou. Era albastru și avea un buzunar secret!',
  'Teo sacó todo: el lápiz, las pinturas y el cuento. ¡Y lo dejó todo tirado por la mesa! ¡Qué lío!':
    'Teo a scos tot: creionul, creioanele colorate și povestea. Și a lăsat totul împrăștiat pe masă! Ce dezordine!',
  'La profe le ayudó a ordenar: el lápiz, las pinturas y el cuento... ¡dentro de la mochila!':
    'Doamna educatoare l-a ajutat să facă ordine: creionul, creioanele colorate și povestea... în ghiozdan!',
  'La pelota se quedó fuera, ¡para el recreo! Y en el recreo, Teo se tiró por el tobogán. ¡Uiii!':
    'Mingea a rămas afară, pentru pauză! Și în pauză, Teo s-a dat pe tobogan. Uiii!',
  '¿Qué guardó Teo dentro de la mochila?': 'Ce a pus Teo în ghiozdan?',
  '¡El lápiz! La pelota se quedó fuera.': 'Creionul! Mingea a rămas afară.',
  '¿Dónde jugó Teo en el recreo?': 'Unde s-a jucat Teo în pauză?',
  '¡En el tobogán! ¡Uiii!': 'Pe tobogan! Uiii!',
  'Lola, de la cabeza a los pies': 'Lola, din cap până-n picioare',
  'Lola se despertó y abrió los ojos. Con los ojos vio el sol, que ya entraba por la ventana.':
    'Lola s-a trezit și a deschis ochii. Cu ochii a văzut soarele, care intra deja pe fereastră.',
  'Con la nariz olió algo rico: ¡pan calentito! Y con la boca, ñam, ñam, se lo comió todo.':
    'Cu nasul a mirosit ceva bun: pâine caldă! Și cu gura, ham, ham, a mâncat-o toată.',
  'Con las orejas escuchó: ¡miau, miau! Era el gato, que quería jugar con ella.':
    'Cu urechile a auzit: miau, miau! Era pisica, care voia să se joace cu ea.',
  'Con las manos aplaudió y con los pies bailó. ¡Y el gato también bailó, pero con cuatro patas!':
    'Cu mâinile a bătut din palme și cu picioarele a dansat. Și pisica a dansat, dar pe patru lăbuțe!',
  '¿Con qué olió Lola el pan?': 'Cu ce a mirosit Lola pâinea?',
  '¡Con la nariz! La nariz sirve para oler.': 'Cu nasul! Nasul e pentru mirosit.',
  '¿Con qué escuchó Lola al gato?': 'Cu ce a auzit-o Lola pe pisică?',
  '¡Con las orejas! Miau, miau.': 'Cu urechile! Miau, miau.',
  'Las pinturas de Nico': 'Creioanele colorate ale lui Nico',
  'Nico tenía cuatro pinturas: roja, azul, amarilla y verde. ¿Qué iba a pintar?':
    'Nico avea patru creioane colorate: roșu, albastru, galben și verde. Ce o să deseneze?',
  'Con el rojo pintó una fresa y un tomate. Con el azul, ¡una ballena enorme!':
    'Cu roșul a desenat o căpșună și o roșie. Cu albastrul, o balenă uriașă!',
  'Con el amarillo pintó el sol y un plátano. Con el verde, una rana y una hoja.':
    'Cu galbenul a desenat soarele și o banană. Cu verdele, o broscuță și o frunză.',
  '¡Sorpresa! La rana verde saltó del papel, ¡croac!, y se fue a pasear. ¡Nico se rió un montón!':
    'Surpriză! Broscuța verde a sărit de pe hârtie, oac!, și a plecat la plimbare. Nico a râs cu poftă!',
  '¿Qué pintó Nico con el azul?': 'Ce a desenat Nico cu albastrul?',
  '¡La ballena! Una ballena azul.': 'Balena! O balenă albastră.',
  '¿Qué pintó Nico con el verde?': 'Ce a desenat Nico cu verdele?',
  '¡La rana verde! Croac.': 'Broscuța verde! Oac.',
  'Leo y la ardilla': 'Leo și veverița',
  'Leo salió a pasear. Sopló el viento, fiuuu, ¡y las hojas se cayeron de los árboles!':
    'Leo a ieșit la plimbare. A suflat vântul, fiuuu, și frunzele au căzut din copaci!',
  'Debajo de un árbol, Leo encontró una castaña. ¡Y una ardilla la miraba con muchas ganas!':
    'Sub un copac, Leo a găsit o castană. Și o veveriță se uita la ea cu mare poftă!',
  'Leo le regaló la castaña a la ardilla. ¡Y ella la escondió debajo de una seta, para el invierno!':
    'Leo i-a dăruit castana veveriței. Și ea a ascuns-o sub o ciupercă, pentru iarnă!',
  'Después empezó a llover. Leo abrió el paraguas, se puso las botas de agua y... ¡splash, a saltar en los charcos!':
    'Apoi a început să plouă. Leo a deschis umbrela, și-a pus cizmele de cauciuc și... pleosc, a sărit în bălți!',
  '¿Qué se cayó de los árboles con el viento?': 'Ce a căzut din copaci din cauza vântului?',
  '¡Las hojas! En otoño se caen de los árboles.': 'Frunzele! Toamna cad din copaci.',
  '¿Qué le regaló Leo a la ardilla?': 'Ce i-a dăruit Leo veveriței?',
  '¡Una castaña! La ardilla la guardó.': 'O castană! Veverița a păstrat-o.',
  'Familias de todos los tamaños': 'Familii de toate mărimile',
  'La profe dijo: hoy vamos a dibujar a nuestra familia. ¡Y todos sacaron las pinturas!':
    'Doamna educatoare a zis: azi o să ne desenăm familia. Și toți au scos creioanele colorate!',
  'La familia de Sofi es grande: mamá, papá, la abuela, Sofi... ¡y un bebé que llora muy fuerte! Buaaa.':
    'Familia lui Sofi e mare: mama, tata, bunica, Sofi... și un bebeluș care plânge foarte tare! Uaaa.',
  'La familia de Juan es pequeñita: Juan y su papá. ¡Y juntos juegan a la pelota todas las tardes!':
    'Familia lui Juan e micuță: Juan și tatăl lui. Și împreună se joacă cu mingea în fiecare după-amiază!',
  'Y Omar vive con su abuela y un gato. Todas las familias son distintas... ¡y en todas se quieren mucho!':
    'Iar Omar locuiește cu bunica lui și cu o pisică. Toate familiile sunt diferite... și în toate se iubesc mult!',
  '¿Quién lloraba muy fuerte en la familia de Sofi?': 'Cine plângea foarte tare în familia lui Sofi?',
  '¡El bebé! Buaaa.': 'Bebelușul! Uaaa.',
  '¿Con quién vive Omar?': 'Cu cine locuiește Omar?',
  '¡Con su abuela! Y con un gato.': 'Cu bunica lui! Și cu o pisică.',
  'Mía y el muñeco de nieve': 'Mía și omul de zăpadă',
  '¡Nevó! Mía quería salir corriendo a la nieve... ¡pero en camiseta hacía muuucho frío! Brrr.':
    'A nins! Mía voia să iasă în fugă în zăpadă... dar în tricou era tare, tare frig! Brrr.',
  'Mamá la ayudó a abrigarse: primero el abrigo, después el gorro, la bufanda... ¡y los guantes en las manos!':
    'Mama a ajutat-o să se îmbrace gros: întâi haina, apoi căciula, fularul... și mănușile pe mâini!',
  'Mía quedó tan abrigada que solo se le veía la nariz. ¡Y así salió a hacer un muñeco de nieve!':
    'Mía era atât de înfofolită că i se vedea doar nasul. Și așa a ieșit să facă un om de zăpadă!',
  'Pero el muñeco tenía frío en el cuello. ¡Entonces Mía le prestó su bufanda! Qué buena amiga.':
    'Dar omului de zăpadă îi era frig la gât. Atunci Mía i-a împrumutat fularul ei! Ce prietenă bună.',
  '¿Qué se puso Mía en las manos?': 'Ce și-a pus Mía pe mâini?',
  '¡Los guantes! Para las manos.': 'Mănușile! Pentru mâini.',
  '¿Qué le prestó Mía al muñeco de nieve?': 'Ce i-a împrumutat Mía omului de zăpadă?',
  '¡Su bufanda! Para el cuello.': 'Fularul ei! Pentru gât.',
  'El desayuno de Pablo': 'Micul dejun al lui Pablo',
  'Pablo se despertó con mucha hambre. ¡Le sonaba la tripa: grrr! Y el abuelo dijo: ¡a desayunar!':
    'Pablo s-a trezit foarte flămând. Îi chiorăia burtica: grrr! Și bunicul a zis: la micul dejun!',
  'El abuelo exprimió unas naranjas e hizo zumo. ¡Y puso en la mesa pan y leche!':
    'Bunicul a stors niște portocale și a făcut suc. Și a pus pe masă pâine și lapte!',
  'Después hicieron una macedonia con plátano, fresa, uvas y pera. ¡Cuántos colores!':
    'Apoi au făcut o salată de fructe cu banană, căpșune, struguri și pară. Câte culori!',
  'Pablo se comió todo. ¡Y salió a jugar con energía de superhéroe! El abuelo no lo podía alcanzar.':
    'Pablo a mâncat tot. Și a ieșit la joacă cu energie de supererou! Bunicul nu-l putea prinde.',
  '¿Qué hizo el abuelo con las naranjas?': 'Ce a făcut bunicul cu portocalele?',
  '¡Zumo de naranja! Mmm.': 'Suc de portocale! Mmm.',
  '¿Qué fruta había en la macedonia?': 'Ce fruct era în salata de fructe?',
  '¡Las uvas! Y también plátano, fresa y pera.': 'Strugurii! Și, de asemenea, banană, căpșune și pară.',
  'Coco, el perro escondedor': 'Coco, cățelul care ascundea lucruri',
  'Coco, el perro de Clara, era muy travieso: ¡escondía las cosas en lugares rarísimos!':
    'Coco, cățelul Clarei, era foarte năzdrăvan: ascundea lucrurile în locuri foarte ciudate!',
  'Clara abrió la nevera y... ¡el cepillo de dientes estaba dentro, al lado de la leche! ¡Qué frío!':
    'Clara a deschis frigiderul și... periuța de dinți era înăuntru, lângă lapte! Ce frig!',
  'Y en la cama, tapadita con la manta, ¡estaba la olla durmiendo la siesta!':
    'Și în pat, învelită cu pătura, oala își făcea somnul de după-amiază!',
  'Clara puso cada cosa en su lugar: el cepillo en el baño y la olla en la cocina. ¡Y a Coco le dio un abrazo!':
    'Clara a pus fiecare lucru la locul lui: periuța în baie și oala în bucătărie. Și pe Coco l-a îmbrățișat!',
  '¿Qué encontró Clara en la nevera?': 'Ce a găsit Clara în frigider?',
  '¡El cepillo de dientes! Pero va en el baño.': 'Periuța de dinți! Dar locul ei e în baie.',
  '¿Quién dormía la siesta en la cama?': 'Cine dormea în pat după-amiaza?',
  '¡La olla! Pero la olla va en la cocina.': 'Oala! Dar locul oalei e în bucătărie.',
  '¿Dónde está mi mamá?': 'Unde e mama mea?',
  'Un pollito salió a pasear solito y se perdió. ¡Pío, pío! ¿Dónde está mi mamá?':
    'Un puișor a ieșit singur la plimbare și s-a pierdut. Piu, piu! Unde e mama mea?',
  'Le preguntó a la vaca: ¿Eres mi mamá? Y la vaca dijo: ¡Muuu! No, yo soy la mamá del ternerito.':
    'A întrebat-o pe vacă: Tu ești mama mea? Și vaca a zis: Muuu! Nu, eu sunt mama vițelușului.',
  'Después le preguntó al cerdo, ¡oinc, oinc!, y a la oveja, ¡beee! Pero ninguno hacía pío, pío.':
    'Apoi l-a întrebat pe porc, oinc, oinc!, și pe oaie, beee! Dar niciunul nu făcea piu, piu.',
  'De pronto escuchó: ¡clo, clo! Era la gallina, ¡su mamá! Y le dio un abrazo bien calentito, de plumas.':
    'Deodată a auzit: cot, cot! Era găina, mama lui! Și l-a îmbrățișat călduros, cu penele ei.',
  '¿Qué animal hacía muuu?': 'Ce animal făcea muuu?',
  '¡La vaca! Muuu.': 'Vaca! Muuu.',
  '¿Quién era la mamá del pollito?': 'Cine era mama puișorului?',
  '¡La gallina! Clo, clo.': 'Găina! Cot, cot.',
  'Alba y la primavera': 'Alba și primăvara',
  'Llegó la primavera. El sol calentó el jardín de Alba y, ¡pop, pop, pop!, salieron flores por todos lados.':
    'A venit primăvara. Soarele a încălzit grădina Albei și, pop, pop, pop!, au ieșit flori peste tot.',
  'Una mariposa vino a visitar las flores. Y una mariquita paseaba por una hoja, despacito.':
    'Un fluture a venit să viziteze florile. Și o buburuză se plimba pe o frunză, încetișor.',
  'Bzzz... una abeja pasó tan cerquita de la nariz de Alba que le hizo cosquillas. ¡Achís!':
    'Bzzz... o albină a trecut atât de aproape de nasul Albei că a gâdilat-o. Hapciu!',
  'Y en el árbol, un pájaro armaba su nido, cantando. ¡La primavera estaba llena de vida!':
    'Și în copac, o pasăre își făcea cuibul, cântând. Primăvara era plină de viață!',
  '¿Qué salió por todos lados en primavera?': 'Ce a ieșit peste tot primăvara?',
  '¡Las flores! En primavera salen flores.': 'Florile! Primăvara ies flori.',
  '¿Qué le hizo cosquillas a Alba en la nariz?': 'Ce a gâdilat-o pe Alba la nas?',
  '¡La abeja! Bzzz... ¡achís!': 'Albina! Bzzz... hapciu!',
  'Rafa va a la isla': 'Rafa merge pe insulă',
  'Rafa y mamá se iban de viaje a visitar a la abuela. Primero subieron al autobús. ¡Bip, bip!':
    'Rafa și mama plecau în călătorie s-o viziteze pe bunica. Întâi au urcat în autobuz. Bip, bip!',
  'Después subieron al tren, ¡chu, chu! Por la ventana, Rafa vio coches, motos y bicis.':
    'Apoi au urcat în tren, ciu, ciu! Pe fereastră, Rafa a văzut mașini, motociclete și biciclete.',
  'La abuela vivía en una isla, así que subieron a un barco. ¡El barco iba por el agua, sobre las olas!':
    'Bunica locuia pe o insulă, așa că au urcat pe o barcă. Barca mergea pe apă, peste valuri!',
  '¡Por fin, la isla! La abuela les dio un abrazo gigante. Y en el cielo, un avión y un helicóptero pasaron a saludar.':
    'În sfârșit, insula! Bunica i-a îmbrățișat strâns. Și pe cer, un avion și un elicopter au trecut să-i salute.',
  '¿En qué viajaron por el agua?': 'Cu ce au călătorit pe apă?',
  '¡En barco! El barco va por el agua.': 'Cu barca! Barca merge pe apă.',
  '¿Qué pasó volando por el cielo?': 'Ce a trecut zburând pe cer?',
  '¡El avión! Vuela por el cielo.': 'Avionul! Zboară pe cer.',
  'El castillo de Nora': 'Castelul Norei',
  '¡Qué calor! Antes de jugar, mamá le puso a Nora crema solar, la gorra y las gafas de sol.':
    'Ce cald! Înainte de joacă, mama i-a pus Norei cremă de soare, șapca și ochelarii de soare.',
  'Con el cubo y la pala, Nora hizo un castillo de arena. ¡Con torres y todo!':
    'Cu găletușa și lopățica, Nora a făcut un castel de nisip. Cu turnuri și tot!',
  'Encima del castillo puso una concha, como si fuera una corona. ¡Era el castillo de la reina Nora!':
    'Deasupra castelului a pus o scoică, de parcă ar fi fost o coroană. Era castelul reginei Nora!',
  'Al final, ¡un helado! Pero hacía tanto calor que se derretía... ¡y Nora se lo comió rapidísimo!':
    'La sfârșit, o înghețată! Dar era atât de cald că se topea... și Nora a mâncat-o foarte repede!',
  '¿Qué le puso mamá a Nora para cuidarse del sol?': 'Ce i-a pus mama Norei ca s-o apere de soare?',
  '¡La crema solar! Y la gorra y las gafas.': 'Crema de soare! Și șapca și ochelarii.',
  '¿Qué puso Nora encima del castillo?': 'Ce a pus Nora deasupra castelului?',
  '¡Una concha, como una corona!': 'O scoică, ca o coroană!',

  // 4 años
  'La semana de Hugo': 'Săptămâna lui Hugo',
  'El lunes empezó la semana. Hugo se puso la mochila ¡y fue al cole!':
    'Luni a început săptămâna. Hugo și-a pus ghiozdanul și a mers la grădiniță!',
  'Martes, miércoles, jueves... ¡días de cole! Hugo pintó, escuchó cuentos y cantó con la profe.':
    'Marți, miercuri, joi... zile de grădiniță! Hugo a desenat, a ascultat povești și a cântat cu doamna educatoare.',
  'El viernes, Hugo contó con los dedos: ¡mañana no hay cole! Llegaba el fin de semana.':
    'Vineri, Hugo a numărat pe degete: mâine nu e grădiniță! Venea weekendul.',
  'El sábado fue a la piscina con papá. ¡Hugo nadó como un pececito... con manguitos!':
    'Sâmbătă a mers la piscină cu tata. Hugo a înotat ca un peștișor... cu aripioare!',
  'El domingo almorzaron en la casa de los abuelos. Y después del domingo... ¡otra vez lunes! La semana vuelve a empezar.':
    'Duminică au luat prânzul la bunici. Și după duminică... iar luni! Săptămâna începe din nou.',
  '¿Adónde fue Hugo el lunes?': 'Unde a mers Hugo luni?',
  '¡Al cole! De lunes a viernes hay cole.': 'La grădiniță! De luni până vineri e grădiniță.',
  '¿Adónde fue Hugo el sábado?': 'Unde a mers Hugo sâmbătă?',
  '¡A la piscina! A nadar con papá.': 'La piscină! Să înoate cu tata.',
  '¿A quiénes visitó Hugo el domingo?': 'Pe cine a vizitat Hugo duminică?',
  '¡A los abuelos! El domingo es fin de semana.': 'Pe bunici! Duminica e weekend.',
  'El juego de los sentidos': 'Jocul simțurilor',
  'Inés y su abuelo jugaron al juego de los sentidos. Primero, con los ojos, Inés vio una mariposa en la ventana.':
    'Inés și bunicul ei s-au jucat jocul simțurilor. Întâi, cu ochii, Inés a văzut un fluture la fereastră.',
  'Después cerró los ojos y escuchó: ¡din, don! Con las orejas descubrió que era una campana.':
    'Apoi a închis ochii și a ascultat: ding, dong! Cu urechile a descoperit că era un clopot.',
  'Con la nariz olió unas flores: ¡mmm, qué perfume! Y con la boca probó algo dulce: ¡miel!':
    'Cu nasul a mirosit niște flori: mmm, ce parfum! Și cu gura a gustat ceva dulce: miere!',
  'Con las manos tocó algo suave y peludito... ¿Un peluche? ¡No! Era el gato, que se había metido en el juego.':
    'Cu mâinile a atins ceva moale și pufos... O jucărie de pluș? Nu! Era pisica, care intrase în joc.',
  'Inés se rió tanto que bailó doblando los codos y las rodillas. Ver, oír, oler, saborear y tocar: ¡cinco sentidos!':
    'Inés a râs atât de mult că a dansat îndoind coatele și genunchii. Văz, auz, miros, gust și pipăit: cinci simțuri!',
  '¿Qué escuchó Inés con las orejas?': 'Ce a auzit Inés cu urechile?',
  '¡La campana! Din, don.': 'Clopotul! Ding, dong.',
  '¿Qué probó Inés con la boca?': 'Ce a gustat Inés cu gura?',
  '¡Miel! Con la boca sentimos los sabores.': 'Miere! Cu gura simțim gusturile.',
  '¿Qué tocó Inés con las manos?': 'Ce a atins Inés cu mâinile?',
  '¡El gato! Suave y peludito.': 'Pisica! Moale și pufoasă.',
  'La despensa de Bruna': 'Cămara lui Bruna',
  'En otoño, la ardilla Bruna juntaba comida para el invierno: bellotas, nueces y castañas. ¡Una, dos y tres!':
    'Toamna, veverița Bruna strângea mâncare pentru iarnă: ghinde, nuci și castane. Unu, doi și trei!',
  'Las guardaba en un agujero del árbol, su despensa secreta. ¡Así, en invierno, cuando no hay comida, no iba a pasar hambre!':
    'Le păstra într-o scorbură din copac, cămara ei secretă. Așa, iarna, când nu e mâncare, n-avea să-i fie foame!',
  'Cerca de ahí, en la huerta de la abuela Rosa, también había frutos de otoño: uvas, granadas ¡y una calabaza gigante!':
    'Aproape de acolo, în grădina bunicii Rosa, erau și fructe de toamnă: struguri, rodii și un dovleac uriaș!',
  'Pero Bruna era muy olvidadiza. ¿Dónde había guardado las nueces? Buscó debajo de una seta y encontró... ¡un erizo dormido!':
    'Dar Bruna era foarte uitucă. Unde pusese nucile? A căutat sub o ciupercă și a găsit... un arici adormit!',
  'Entonces la abuela Rosa le dejó unas nueces en la ventana. ¡Y Bruna las guardó en su árbol, contentísima!':
    'Atunci bunica Rosa i-a lăsat niște nuci la fereastră. Și Bruna le-a dus în copacul ei, foarte fericită!',
  '¿Qué juntaba Bruna para el invierno?': 'Ce strângea Bruna pentru iarnă?',
  '¡Bellotas, nueces y castañas!': 'Ghinde, nuci și castane!',
  '¿Dónde guardaba Bruna su comida?': 'Unde își păstra Bruna mâncarea?',
  '¡En un agujero del árbol!': 'Într-o scorbură din copac!',
  '¿Qué fruto gigante había en la huerta?': 'Ce fruct uriaș era în grădină?',
  '¡La calabaza! Un fruto de otoño.': 'Dovleacul! Un fruct de toamnă.',
  'Un día de emociones': 'O zi plină de emoții',
  'Martín se despertó contento: había sol y era sábado. ¡Sonreía de oreja a oreja!':
    'Martín s-a trezit vesel: era soare și era sâmbătă. Zâmbea până la urechi!',
  'En el parque, a Martín se le cayó el helado al suelo. ¡Plaf! Y se puso triste, muy triste.':
    'În parc, lui Martín i-a căzut înghețata pe jos. Plaf! Și s-a întristat, foarte tare.',
  'Después armó una torre altísima con bloques... ¡y el bebé la tiró! Martín se enojó mucho. ¡Grrr!':
    'Apoi a construit un turn foarte înalt din cuburi... și bebelușul l-a dărâmat! Martín s-a supărat foarte tare. Grrr!',
  'Por la noche hubo tormenta. ¡Brrrum! Martín tuvo miedo y abrazó fuerte a papá.':
    'Noaptea a fost furtună. Brrrum! Lui Martín i-a fost frică și l-a îmbrățișat strâns pe tata.',
  'Antes de dormir, papá le dio una caja. ¡Boing! Salió un muñeco saltarín. ¡Qué sorpresa! Y Martín volvió a reírse.':
    'Înainte de culcare, tata i-a dat o cutie. Boing! A sărit afară o jucărie cu arc. Ce surpriză! Și Martín a râs din nou.',
  '¿Cómo se sintió Martín cuando se le cayó el helado?': 'Cum s-a simțit Martín când i-a căzut înghețata?',
  'Triste. ¡Pobre Martín, su helado!': 'Trist. Bietul Martín, înghețata lui!',
  '¿Qué hizo enojar a Martín?': 'Ce l-a supărat pe Martín?',
  '¡El bebé le tiró la torre!': 'Bebelușul i-a dărâmat turnul!',
  '¿Cómo se sintió Martín con la tormenta?': 'Cum s-a simțit Martín când a fost furtună?',
  'Miedo. Y papá lo abrazó fuerte.': 'I-a fost frică. Și tata l-a îmbrățișat strâns.',
  'Paula come de todo': 'Paula mănâncă de toate',
  'En el desayuno, Paula probó un kiwi. ¡Por fuera era marrón y peludito, y por dentro verde!':
    'La micul dejun, Paula a gustat un kiwi. Pe dinafară era maro și pufos, iar pe dinăuntru verde!',
  'En el almuerzo comió ensalada de verduras: lechuga, tomate y zanahoria. ¡Crunch, crunch!':
    'La prânz a mâncat salată de legume: salată verde, roșie și morcov. Crunci, crunci!',
  'A la hora de la merienda, una fruta fresquita: ¡sandía! Paula terminó con la cara toda roja.':
    'La gustare, un fruct răcoros: pepene verde! Paula a terminat cu fața toată roșie.',
  'En la cena, papá hizo puré de patatas y brócoli. Paula dijo: ¡el brócoli parece un arbolito!':
    'La cină, tata a făcut piure de cartofi și broccoli. Paula a zis: broccoli seamănă cu un copăcel!',
  'Se comió el bosque de brócoli entero. Y aprendió: el kiwi y la sandía son frutas; el brócoli y la zanahoria, verduras.':
    'A mâncat toată pădurea de broccoli. Și a învățat: kiwi și pepenele verde sunt fructe; broccoli și morcovul, legume.',
  '¿Qué fruta probó Paula en el desayuno?': 'Ce fruct a gustat Paula la micul dejun?',
  '¡El kiwi! Verde por dentro.': 'Kiwi! Verde pe dinăuntru.',
  '¿Qué verdura parecía un arbolito?': 'Ce legumă semăna cu un copăcel?',
  '¡El brócoli! Un arbolito para comer.': 'Broccoli! Un copăcel de mâncat.',
  '¿Con qué fruta se manchó Paula la cara?': 'Cu ce fruct și-a murdărit Paula fața?',
  '¡Con la sandía! Roja y jugosa.': 'Cu pepenele verde! Roșu și zemos.',
  'Nilo y Pipo, amigos por carta': 'Nilo și Pipo, prieteni prin scrisori',
  'Nilo, el osito polar, vivía en el Polo Norte, donde todo es nieve y hielo. ¡Su pelo blanco y espeso lo tenía calentito!':
    'Nilo, ursulețul polar, trăia la Polul Nord, unde totul e zăpadă și gheață. Blana lui albă și deasă îl ținea la căldură!',
  'Sus vecinos eran una foca muy juguetona y una morsa de dientes larguísimos que roncaba muy fuerte. ¡Rrrrr!':
    'Vecinii lui erau o focă foarte jucăușă și o morsă cu colți foarte lungi care sforăia foarte tare. Rrrrr!',
  'Un día, Nilo le escribió una carta a su amigo Pipo, un pingüino que vivía lejísimos: en el Polo Sur.':
    'Într-o zi, Nilo i-a scris o scrisoare prietenului său Pipo, un pinguin care trăia foarte departe: la Polul Sud.',
  'Pipo le contestó: ¡Aquí también hace frío! Pero mis plumas me abrigan. ¡Y me tiro de barriga por el hielo!':
    'Pipo i-a răspuns: Și aici e frig! Dar penele mele mă țin de cald. Și alunec pe burtă pe gheață!',
  'Nilo se rió tanto que también se tiró de barriga por el hielo, ¡fiuuu! Dos amigos bien abrigados, en los dos extremos del mundo.':
    'Nilo a râs atât de tare că a alunecat și el pe burtă pe gheață, fiuuu! Doi prieteni bine îmbrăcați, la cele două capete ale lumii.',
  '¿Quién roncaba muy fuerte?': 'Cine sforăia foarte tare?',
  '¡La morsa! Rrrrr.': 'Morsa! Rrrrr.',
  '¿Qué le mandó Nilo a Pipo?': 'Ce i-a trimis Nilo lui Pipo?',
  '¡Una carta! Porque Pipo vivía lejísimos.': 'O scrisoare! Pentru că Pipo trăia foarte departe.',
  '¿Qué abriga a Pipo del frío?': 'Ce îl apără pe Pipo de frig?',
  '¡Sus plumas! Lo tienen calentito.': 'Penele lui! Îl țin la căldură.',
  'Toby, el perro travieso': 'Toby, cățelul năzdrăvan',
  'Toby era un perro muy travieso. Una mañana, ¡se llevó la carta del cartero y salió corriendo!':
    'Toby era un cățel foarte năzdrăvan. Într-o dimineață, a luat scrisoarea poștașului și a fugit!',
  'Después pasó por la panadería y se llevó un pan calentito. ¡El panadero lo persiguió, todo lleno de harina!':
    'Apoi a trecut pe la brutărie și a luat o pâine caldă. Brutarul a fugit după el, plin de făină!',
  'Después le quitó el fonendo al médico, que estaba escuchando el corazón de una niña. ¡Pum, pum!':
    'Apoi i-a luat stetoscopul doctorului, care asculta inima unei fetițe. Bum, bum!',
  '¡Y le tiró de la manguera a la bombera! ¡Splash! Toby quedó empapado de la cabeza a la cola.':
    'Și a tras de furtunul pompierei! Pleosc! Toby s-a udat leoarcă din cap până-n coadă.',
  'Entonces la policía tocó el silbato: ¡priiip! Toby se sentó, devolvió todo y movió la cola. ¡Y todos se rieron!':
    'Atunci polițista a suflat în fluier: priiip! Toby s-a așezat, a dat totul înapoi și a dat din coadă. Și toți au râs!',
  '¿A quién le quitó Toby el pan?': 'De la cine a luat Toby pâinea?',
  '¡Al panadero! El panadero hace el pan.': 'De la brutar! Brutarul face pâinea.',
  '¿Qué usa el médico para escuchar el corazón?': 'Ce folosește doctorul ca să asculte inima?',
  '¡El fonendo! Pum, pum.': 'Stetoscopul! Bum, bum.',
  '¿Qué tocó la policía para que Toby se quedara quieto?': 'În ce a suflat polițista ca Toby să stea cuminte?',
  '¡El silbato! Priiip.': 'În fluier! Priiip.',
  'Bruno cruza la calle': 'Bruno traversează strada',
  'Bruno y mamá iban al parque caminando por la acera. Pasaron por la tienda y por el hospital.':
    'Bruno și mama mergeau în parc pe trotuar. Au trecut pe lângă magazin și pe lângă spital.',
  'En la esquina, el semáforo estaba en rojo. Se quedaron quietitos, esperando. ¡Ni un pasito!':
    'La colț, semaforul era pe roșu. Au stat pe loc, așteptând. Niciun pășel!',
  'De repente, la pelota de Bruno rodó hasta la calle. Bruno quiso correr a buscarla, pero se acordó: ¡nunca hay que correr a la calle!':
    'Deodată, mingea lui Bruno s-a rostogolit în stradă. Bruno a vrut să fugă după ea, dar și-a amintit: niciodată nu fugim în stradă!',
  'Cuando el semáforo se puso en verde, miraron a los dos lados y cruzaron por el paso de cebra, de la mano.':
    'Când semaforul s-a făcut verde, s-au uitat în ambele părți și au traversat pe trecerea de pietoni, de mână.',
  'Del otro lado, la pelota los esperaba quietita. ¡Y en el parque jugaron toda la tarde!':
    'De partea cealaltă, mingea îi aștepta cuminte. Și în parc s-au jucat toată după-amiaza!',
  '¿Qué se le escapó a Bruno?': 'Ce i-a scăpat lui Bruno?',
  '¡La pelota! Y Bruno no corrió a la calle.': 'Mingea! Și Bruno n-a fugit în stradă.',
  '¿Por dónde cruzaron la calle?': 'Pe unde au traversat strada?',
  '¡Por el paso de cebra, de la mano!': 'Pe trecerea de pietoni, de mână!',
  '¿Adónde iban Bruno y mamá?': 'Unde mergeau Bruno și mama?',
  '¡Al parque! A jugar toda la tarde.': 'În parc! Să se joace toată după-amiaza.',
  'El sueño de Zoe': 'Visul lui Zoe',
  'Zoe vivía con un perro, un gato y un conejo. ¡Eran animales domésticos: vivían en casa, con ella!':
    'Zoe locuia cu un câine, o pisică și un iepuraș. Erau animale domestice: locuiau în casă, cu ea!',
  'Una noche, Zoe soñó que viajaba a la sabana. ¡Allí vivían animales salvajes: el león, la jirafa y la cebra!':
    'Într-o noapte, Zoe a visat că mergea în savană. Acolo trăiau animale sălbatice: leul, girafa și zebra!',
  'Después llegó a la selva. Un mono se colgaba de las ramas, y un tigre dormía la siesta. ¡Shhh!':
    'Apoi a ajuns în junglă. O maimuță se agăța de crengi, iar un tigru dormea. Șșșt!',
  'En el río, un cocodrilo abrió una boca enorme... ¡pero solo estaba bostezando! Uaaah, qué sueño.':
    'În râu, un crocodil a deschis o gură uriașă... dar doar căsca! Uaaah, ce somn.',
  'Zoe se despertó y ahí estaban sus animales. Los salvajes viven en la selva y la sabana; ¡los domésticos, en casa con ella!':
    'Zoe s-a trezit și animalele ei erau acolo. Cele sălbatice trăiesc în junglă și în savană; cele domestice, acasă cu ea!',
  '¿Qué animal vivía en la casa de Zoe?': 'Ce animal locuia în casa lui Zoe?',
  '¡El conejo! Es un animal doméstico.': 'Iepurașul! E un animal domestic.',
  '¿Quién dormía la siesta en la selva?': 'Cine dormea în junglă?',
  '¡El tigre! Shhh.': 'Tigrul! Șșșt.',
  '¿Quién bostezaba en el río?': 'Cine căsca în râu?',
  '¡El cocodrilo! Uaaah.': 'Crocodilul! Uaaah.',
  'La plantita de Tomás': 'Plantuța lui Tomás',
  'Tomás plantó una semilla en una maceta. ¡Era pequeñita, como una miguita de pan!':
    'Tomás a plantat o sămânță într-un ghiveci. Era micuță, ca o firimitură de pâine!',
  'Todos los días la regaba con la regadera y la ponía al sol. ¡Las plantas necesitan agua y sol para crecer!':
    'În fiecare zi o uda cu stropitoarea și o punea la soare. Plantele au nevoie de apă și soare ca să crească!',
  'Debajo de la tierra le crecieron raíces para beber agua. Y arriba salió un tallo con dos hojitas. ¡Hola!':
    'Sub pământ i-au crescut rădăcini ca să bea apă. Și deasupra a ieșit o tulpină cu două frunzulițe. Bună!',
  'Tomás la saludaba cada mañana: ¡buenos días, plantita! Y la planta creció y creció... ¡y le salió una flor amarilla!':
    'Tomás o saluta în fiecare dimineață: bună dimineața, plantuțo! Și planta a crescut și a crescut... și i-a ieșit o floare galbenă!',
  'Un día, donde estaba la flor, apareció un fruto rojo y redondo: ¡un tomate! Tomás lo compartió con toda su familia.':
    'Într-o zi, unde era floarea, a apărut un fruct roșu și rotund: o roșie! Tomás a împărțit-o cu toată familia.',
  '¿Qué plantó Tomás en la maceta?': 'Ce a plantat Tomás în ghiveci?',
  '¡Una semilla pequeñita!': 'O sămânță micuță!',
  '¿Qué necesita la planta, además de agua?': 'De ce mai are nevoie planta, pe lângă apă?',
  '¡El sol! Agua y sol para crecer.': 'De soare! Apă și soare ca să crească.',
  '¿Qué fruto le salió a la planta?': 'Ce fruct i-a ieșit plantei?',
  '¡Un tomate rojo y redondo!': 'O roșie roșie și rotundă!',
  '¡Uiu, uiu! Un día de vehículos': 'Nino-nino! O zi cu vehicule',
  'Dani y su abuela cogieron el metro. ¡Iba por debajo de la tierra, por un túnel larguísimo!':
    'Dani și bunica lui au luat metroul. Mergea pe sub pământ, printr-un tunel foarte lung!',
  'Al salir, escucharon: ¡uiu, uiu! Pasó un camión de bomberos. ¡Iba a rescatar a un gatito que no podía bajar de un árbol!':
    'Când au ieșit, au auzit: nino-nino! A trecut o mașină de pompieri. Mergea să salveze un pisoi care nu putea coborî dintr-un copac!',
  'Después pasó una ambulancia, también con sirena. Las ambulancias llevan a las personas enfermas al hospital, para curarlas.':
    'Apoi a trecut o ambulanță, tot cu sirenă. Ambulanțele duc oamenii bolnavi la spital, ca să fie vindecați.',
  'En el cielo, un helicóptero hacía ¡taca, taca, taca! Y más arriba, un globo de colores flotaba despacito.':
    'Pe cer, un elicopter făcea taca, taca, taca! Și mai sus, un balon colorat plutea încetișor.',
  'Por la noche, en la bañera, Dani jugó con su submarino de juguete: ¡glu, glu, a rescatar al patito!':
    'Seara, în cadă, Dani s-a jucat cu submarinul lui de jucărie: glu, glu, să salveze rățușca!',
  '¿En qué viajaron por debajo de la tierra?': 'Cu ce au călătorit pe sub pământ?',
  '¡En metro! Por un túnel.': 'Cu metroul! Printr-un tunel.',
  '¿Qué vehículo fue a rescatar al gatito?': 'Ce vehicul a mers să salveze pisoiul?',
  '¡El camión de bomberos! Uiu, uiu.': 'Mașina de pompieri! Nino-nino.',
  '¿Qué lleva a las personas enfermas al hospital?': 'Ce duce oamenii bolnavi la spital?',
  '¡La ambulancia! Para que las curen.': 'Ambulanța! Ca să fie vindecați.',
  'La oruga de Iván': 'Omida lui Iván',
  'Con su lupa, Iván descubrió una oruga verde comiéndose una hoja: ñam, ñam, ñam. ¡Qué hambre tenía!':
    'Cu lupa lui, Iván a descoperit o omidă verde care mânca o frunză: ham, ham, ham. Ce foame avea!',
  'También vio hormigas que llevaban miguitas en fila, una araña tejiendo su tela y un caracol que paseaba despacito.':
    'A mai văzut furnici care duceau firimituri în șir, un păianjen care își țesea pânza și un melc care se plimba încetișor.',
  'Iván quería llevarse la oruga a casa. Pero el abuelo le explicó: los bichitos viven mejor en su jardín. ¡Hay que cuidarlos!':
    'Iván voia să ia omida acasă. Dar bunicul i-a explicat: gâzele trăiesc mai bine în grădina lor. Trebuie să avem grijă de ele!',
  'Iván iba a mirarla todos los días. Un día, la oruga se envolvió en un capullo y se quedó quietita, durmiendo.':
    'Iván mergea s-o vadă în fiecare zi. Într-o zi, omida s-a învelit într-un cocon și a rămas nemișcată, dormind.',
  '¡Y una mañana el capullo se abrió y salió una mariposa! Voló hasta la nariz de Iván, como diciendo: ¡gracias!':
    'Și într-o dimineață coconul s-a deschis și a ieșit un fluture! A zburat până la nasul lui Iván, de parcă ar fi zis: mulțumesc!',
  '¿Qué descubrió Iván con su lupa?': 'Ce a descoperit Iván cu lupa?',
  '¡Una oruga verde! Ñam, ñam.': 'O omidă verde! Ham, ham.',
  '¿Quién llevaba miguitas en fila?': 'Cine ducea firimituri în șir?',
  '¡Las hormigas! Una detrás de la otra.': 'Furnicile! Una după alta.',
  '¿En qué se convirtió la oruga?': 'În ce s-a transformat omida?',
  '¡En una mariposa! Qué bonita.': 'Într-un fluture! Ce frumos.',

  // 5 años
  'El calendario de Vera': 'Calendarul Verei',
  'Vera colgó un calendario nuevo. Tenía doce meses: enero, febrero, marzo... ¡hasta diciembre! Más que los dedos de las dos manos.':
    'Vera a agățat un calendar nou. Avea douăsprezece luni: ianuarie, februarie, martie... până la decembrie! Mai multe decât degetele de la ambele mâini.',
  'En agosto llegaron las vacaciones de verano. Vera fue a la playa con su maleta. ¡Qué calor!':
    'În august a venit vacanța de vară. Vera a mers la plajă cu valiza ei. Ce cald!',
  'En septiembre, ¡vuelta al cole! Vera estrenó mochila y abrazó a sus amigos. ¡Los echaba mucho de menos!':
    'În septembrie, înapoi la grădiniță! Vera a avut ghiozdan nou și și-a îmbrățișat prietenii. Îi fusese foarte dor de ei!',
  'En noviembre, ¡su cumpleaños! Vera cumplió cinco y sopló las velitas de la tarta. ¡Feliz cumple!':
    'În noiembrie, ziua ei de naștere! Vera a împlinit cinci ani și a suflat în lumânărelele de pe tort. La mulți ani!',
  'Y en diciembre, el último mes, llegó la Navidad. ¡Pusieron el árbol todos juntos!':
    'Și în decembrie, ultima lună, a venit Crăciunul. Au împodobit bradul toți împreună!',
  'Cuando terminó diciembre, el calendario volvió a empezar: ¡otra vez enero! Un año nuevo, lleno de aventuras.':
    'Când s-a terminat decembrie, calendarul a început din nou: iar ianuarie! Un an nou, plin de aventuri.',
  '¿Qué llegó antes: el cumpleaños de Vera o la Navidad?': 'Ce a venit mai întâi: ziua Verei sau Crăciunul?',
  '¡El cumpleaños! Noviembre viene antes que diciembre.': 'Ziua de naștere! Noiembrie vine înainte de decembrie.',
  '¿Qué estrenó Vera en la vuelta al cole?': 'Ce a avut Vera nou când s-a întors la grădiniță?',
  '¡Una mochila nueva!': 'Un ghiozdan nou!',
  '¿Qué llegó en diciembre, el último mes del año?': 'Ce a venit în decembrie, ultima lună a anului?',
  '¡La Navidad! Con el árbol.': 'Crăciunul! Cu bradul.',
  'Una carrera por dentro': 'O cursă pe dinăuntru',
  'Sara se preparó para una carrera en el parque. ¡Y dentro de su cuerpo, todo se preparó también!':
    'Sara s-a pregătit pentru o cursă în parc. Și înăuntrul corpului ei, totul s-a pregătit și el!',
  'Primero, su cerebro dio la orden: ¡a correr! El cerebro es el jefe: piensa y le dice al cuerpo qué hacer.':
    'Întâi, creierul ei a dat comanda: la fugă! Creierul e șeful: gândește și îi spune corpului ce să facă.',
  'Los músculos tiraron de los huesos, y las piernas se movieron rapidísimo. ¡Sin huesos, Sara sería blandita como una gelatina!':
    'Mușchii au tras de oase, și picioarele s-au mișcat foarte repede. Fără oase, Sara ar fi moale ca o jeleu!',
  'Su corazón latía fuerte, ¡pum, pum, pum!, para llevar sangre a todo el cuerpo. Y los pulmones se inflaban como globos para tomar aire.':
    'Inima îi bătea tare, bum, bum, bum!, ca să ducă sânge în tot corpul. Și plămânii se umflau ca baloanele ca să ia aer.',
  '¡Sara llegó a la meta! Después comió un plátano, y su estómago lo convirtió en energía.':
    'Sara a ajuns la linia de sosire! Apoi a mâncat o banană, și stomacul ei a transformat-o în energie.',
  'Esa noche, Sara durmió como un tronco. Pero su corazón y sus pulmones siguieron trabajando, despacito. ¡Nunca se toman vacaciones!':
    'În noaptea aceea, Sara a dormit buștean. Dar inima și plămânii au lucrat mai departe, încetișor. Nu-și iau niciodată vacanță!',
  '¿Qué parte del cuerpo dio la orden de correr?': 'Ce parte a corpului a dat comanda să alerge?',
  '¡El cerebro! Piensa y manda.': 'Creierul! Gândește și comandă.',
  '¿Qué se infla como un globo para tomar aire?': 'Ce se umflă ca un balon ca să ia aer?',
  '¡Los pulmones! Sirven para respirar.': 'Plămânii! Sunt pentru respirat.',
  '¿Qué convirtió el plátano en energía?': 'Ce a transformat banana în energie?',
  'La golondrina de Lucía': 'Rândunica Luciei',
  'Debajo del techo de la casa de Lucía vivía una golondrina, en su nido de barro. ¡Todo el verano cantó, pío, pío!':
    'Sub acoperișul casei Luciei trăia o rândunică, în cuibul ei de noroi. Toată vara a cântat, piu, piu!',
  'Pero llegó el otoño. Los días se hicieron más cortos y empezó a hacer fresco. Lucía sacó la bufanda.':
    'Dar a venit toamna. Zilele s-au scurtat și a început să fie răcoare. Lucía și-a scos fularul.',
  'Las hojas de los árboles se pusieron amarillas, naranjas y rojas. Y con el viento, fiuuu, ¡se cayeron! En otoño, los árboles descansan.':
    'Frunzele copacilor s-au făcut galbene, portocalii și roșii. Și cu vântul, fiuuu, au căzut! Toamna, copacii se odihnesc.',
  'Hubo días de lluvia y mañanas de niebla, tan espesa que Lucía casi no veía a su perro. ¿Dónde estás, Rulo?':
    'Au fost zile cu ploaie și dimineți cu ceață, atât de deasă că Lucía aproape nu-și vedea cățelul. Unde ești, Rulo?',
  'Un día, la golondrina se despidió. Con el frío hay pocos bichitos para comer, ¡así que voló a un lugar calentito!':
    'Într-o zi, rândunica și-a luat rămas-bun. Când e frig sunt puține gâze de mâncat, așa că a zburat într-un loc călduț!',
  'Lucía la echó un poquito de menos. Pero mamá le contó: ¡en primavera, la golondrina volverá a su nido!':
    'Luciei i s-a făcut puțin dor de ea. Dar mama i-a spus: primăvara, rândunica se va întoarce la cuibul ei!',
  '¿Qué hizo que se cayeran las hojas?': 'Ce a făcut frunzele să cadă?',
  '¡El viento! Fiuuu, y las hojas se cayeron.': 'Vântul! Fiuuu, și frunzele au căzut.',
  '¿Qué no dejaba ver al perro Rulo?': 'Ce nu lăsa să se vadă cățelul Rulo?',
  '¡La niebla! Era muy espesa.': 'Ceața! Era foarte deasă.',
  '¿Quién se fue a un lugar calentito?': 'Cine a plecat într-un loc călduț?',
  '¡La golondrina! Y en primavera vuelve.': 'Rândunica! Și primăvara se întoarce.',
  'Max y el plato de colores': 'Max și farfuria colorată',
  'Max quería comer solo chucherías: ¡caramelos en el desayuno, en la comida y en la cena! Pero la abuela tuvo una idea.':
    'Max voia să mănânce numai dulciuri: bomboane la micul dejun, la prânz și la cină! Dar bunica a avut o idee.',
  'Primero fueron a la granja. La gallina les regaló un huevo, y la vaca les dio leche para hacer queso. ¡Muuu!':
    'Întâi au mers la fermă. Găina le-a dăruit un ou, iar vaca le-a dat lapte ca să facă brânză. Muuu!',
  'En el campo vieron el trigo, que se hace harina y después pan. ¡Y las aceitunas, que se convierten en aceite!':
    'La câmp au văzut grâul, din care se face făină și apoi pâine. Și măslinele, care se transformă în ulei!',
  'En el puerto, los pescadores volvían del mar con pescado fresquito. ¡Del mar a la mesa!':
    'În port, pescarii se întorceau de pe mare cu pește proaspăt. De pe mare, direct pe masă!',
  'En casa prepararon un plato con un poquito de todo: arroz, pescado, legumbres y verduras. ¡Y una manzana de postre!':
    'Acasă au pregătit o farfurie cu câte puțin din toate: orez, pește, leguminoase și legume. Și un măr la desert!',
  '¡Max se comió todo y quedó lleno de energía! ¿Y las chucherías? A veces, de postre, y solo un poquito.':
    'Max a mâncat tot și s-a umplut de energie! Și dulciurile? Uneori, la desert, și doar puțin.',
  '¿Qué les regaló la gallina?': 'Ce le-a dăruit găina?',
  '¡Un huevo! Los huevos vienen de la gallina.': 'Un ou! Ouăle vin de la găină.',
  '¿De qué se hace el aceite?': 'Din ce se face uleiul?',
  '¡De las aceitunas!': 'Din măsline!',
  '¿Qué hay que comer solo un poquito, a veces?': 'Ce trebuie să mâncăm doar puțin, din când în când?',
  '¡Las chucherías! Solo un poquito, de vez en cuando.': 'Dulciurile! Doar puțin, din când în când.',
  'El baúl de las fiestas': 'Cufărul sărbătorilor',
  'Ana tenía un baúl de recuerdos. En cada fiesta del año guardaba algo dentro, ¡como un tesoro!':
    'Ana avea un cufăr cu amintiri. La fiecare sărbătoare a anului punea ceva înăuntru, ca pe o comoară!',
  'El seis de enero llegaron los Reyes Magos. Ana había dejado sus zapatos y agua para los camellos. ¡Le trajeron una corona!':
    'Pe șase ianuarie au venit cei trei Magi. Ana își lăsase pantofii și apă pentru cămile. I-au adus o coroană!',
  'En carnaval, Ana se disfrazó con un antifaz y una capa, y bailó entre serpentinas. ¡El antifaz fue directo al baúl!':
    'La carnaval, Ana s-a costumat cu o mască și o pelerină, și a dansat printre serpentine. Masca a mers direct în cufăr!',
  'En el Día del Libro, la abuela le regaló un cuento de dragones y una rosa. ¡El libro también fue al baúl!':
    'De Ziua Cărții, bunica i-a dăruit o poveste cu dragoni și un trandafir. Și cartea a mers în cufăr!',
  'En la fiesta del pueblo hubo música, tambores y fuegos artificiales en el cielo. ¡Pum, pum, cuántos colores!':
    'La sărbătoarea satului a fost muzică, tobe și artificii pe cer. Bum, bum, câte culori!',
  'Para su cumpleaños, Ana abrió el baúl y recordó todas sus fiestas. ¡Y guardó una vela de su tarta, como recuerdo!':
    'De ziua ei, Ana a deschis cufărul și și-a amintit toate sărbătorile. Și a pus o lumânare de pe tort, ca amintire!',
  '¿Qué le trajeron los Reyes Magos a Ana?': 'Ce i-au adus cei trei Magi Anei?',
  '¡Una corona!': 'O coroană!',
  '¿Qué se puso Ana en carnaval?': 'Ce și-a pus Ana la carnaval?',
  '¡Un antifaz! Y una capa.': 'O mască! Și o pelerină.',
  '¿Qué guardó Ana de su cumpleaños?': 'Ce a păstrat Ana de la ziua ei?',
  '¡Una vela de la tarta!': 'O lumânare de pe tort!',
  'Luz, la astronauta': 'Luz, astronauta',
  'La astronauta Luz subió a su cohete. Tres, dos, uno... ¡despegue! ¡Fiuuum, hacia el espacio!':
    'Astronauta Luz a urcat în racheta ei. Trei, doi, unu... decolare! Fiuuum, spre spațiu!',
  'Desde allí arriba, Luz vio la Tierra: redonda como una pelota gigante, azul y verde. ¡Qué bonita!':
    'De acolo, de sus, Luz a văzut Pământul: rotund ca o minge uriașă, albastru și verde. Ce frumos!',
  'Y descubrió un secreto: la Tierra gira y gira, despacito, como un trompo. ¡Pero nadie se marea!':
    'Și a descoperit un secret: Pământul se învârte și se învârte, încetișor, ca un titirez. Dar nu amețește nimeni!',
  'Del lado que mira al Sol es de día, y los niños van al cole. Del otro lado es de noche, ¡y todos duermen!':
    'În partea care se uită spre Soare e zi, și copiii merg la grădiniță. În partea cealaltă e noapte, și toți dorm!',
  'Luz también saludó a otros planetas: Marte, rojo; Júpiter, el más grande; y Saturno, ¡con su anillo!':
    'Luz a salutat și alte planete: Marte, roșu; Jupiter, cel mai mare; și Saturn, cu inelul lui!',
  'Cuando volvió a casa ya era de noche: su lado de la Tierra ya no miraba al Sol. Su hija Noa la esperaba con un abrazo.':
    'Când s-a întors acasă era deja noapte: partea ei de Pământ nu mai privea spre Soare. Fiica ei, Noa, o aștepta cu o îmbrățișare.',
  '¿En qué viajó Luz al espacio?': 'Cu ce a călătorit Luz în spațiu?',
  '¡En cohete! Tres, dos, uno... ¡despegue!': 'Cu racheta! Trei, doi, unu... decolare!',
  '¿Qué gira y gira como un trompo?': 'Ce se învârte și se învârte ca un titirez?',
  '¡La Tierra! Gira despacito.': 'Pământul! Se învârte încetișor.',
  '¿Qué hace que sea de día?': 'Ce face să fie zi?',
  '¡El Sol! Del lado que mira al Sol es de día.': 'Soarele! În partea care privește spre Soare e zi.',
  'El fósil de Simón': 'Fosila lui Simón',
  'Cavando en el arenero del parque, Simón encontró una piedra rara, con forma de hueso. ¡Era un fósil!':
    'Săpând în nisipul din parc, Simón a găsit o piatră ciudată, în formă de os. Era o fosilă!',
  'El abuelo le contó: hace muchísimo tiempo, antes de que existieran las personas, en la Tierra vivían los dinosaurios.':
    'Bunicul i-a povestit: acum foarte, foarte mult timp, înainte să existe oamenii, pe Pământ trăiau dinozaurii.',
  'El diplodoco y el triceratops comían plantas: ¡eran herbívoros! El diplodoco, con su cuello larguísimo, llegaba a las hojas más altas.':
    'Diplodocul și triceratopsul mâncau plante: erau ierbivori! Diplodocul, cu gâtul lui foarte lung, ajungea la frunzele cele mai înalte.',
  'El tiranosaurio, en cambio, comía carne: ¡era carnívoro! Tenía dientes enormes... y unos bracitos tan cortos que no se podía rascar la nariz.':
    'Tiranozaurul, în schimb, mânca carne: era carnivor! Avea dinți uriași... și niște mânuțe atât de scurte că nu se putea scărpina la nas.',
  'En el cielo volaba un pterodáctilo, y a lo lejos humeaba un volcán. De pronto, un huevo enorme hizo ¡crac!, y salió un dinosaurio bebé.':
    'Pe cer zbura un pterodactil, și în depărtare fumega un vulcan. Deodată, un ou uriaș a făcut crac!, și a ieșit un pui de dinozaur.',
  'Simón guardó su fósil como un tesoro. ¿Sería un huesito de aquel dinosaurio bebé? ¡Quién sabe!':
    'Simón și-a păstrat fosila ca pe o comoară. O fi fost un oscior al acelui pui de dinozaur? Cine știe!',
  '¿Qué encontró Simón en el arenero?': 'Ce a găsit Simón în nisip?',
  '¡Un fósil! Una piedra muy, muy antigua.': 'O fosilă! O piatră foarte, foarte veche.',
  '¿Qué dinosaurio comía carne?': 'Ce dinozaur mânca carne?',
  '¡El tiranosaurio! Era carnívoro.': 'Tiranozaurul! Era carnivor.',
  '¿De dónde salió el dinosaurio bebé?': 'De unde a ieșit puiul de dinozaur?',
  '¡De un huevo enorme! Crac.': 'Dintr-un ou uriaș! Crac.',
  'El viaje en globo de Olivia': 'Călătoria Oliviei cu balonul',
  'Olivia y su papá subieron a un globo, con un mapa. Querían conocer las casas de los animales. ¡Arriba!':
    'Olivia și tatăl ei au urcat într-un balon, cu o hartă. Voiau să cunoască casele animalelor. Sus!',
  'Primero llegaron al desierto: arena y mucho calor. Allí vivía el camello, que aguanta muchos días sin beber agua.':
    'Întâi au ajuns în deșert: nisip și multă căldură. Acolo trăia cămila, care rezistă multe zile fără să bea apă.',
  'Después volaron sobre el mar. Una ballena les tiró un chorro de agua, ¡fsss!, y un pulpo los saludó con sus ocho brazos.':
    'Apoi au zburat peste mare. O balenă le-a aruncat un jet de apă, fsss!, și o caracatiță i-a salutat cu cele opt brațe.',
  'En el Polo Sur todo era hielo. Allí vivían los pingüinos, abrigados con plumas y una capa de grasa. ¡Ni se enteraban del frío!':
    'La Polul Sud totul era gheață. Acolo trăiau pinguinii, îmbrăcați cu pene și un strat de grăsime. Nici nu simțeau frigul!',
  'Ya de noche, pasaron por el bosque. Un búho de ojos enormes veía todo en la oscuridad, y un lobo le aullaba a la luna: ¡auuu!':
    'Când se făcuse noapte, au trecut pe deasupra pădurii. O bufniță cu ochi uriași vedea totul în întuneric, și un lup urla la lună: auuu!',
  'Olivia volvió a casa feliz. Cada animal vive donde encuentra comida y está a gusto. ¿Y Olivia? ¡En su camita!':
    'Olivia s-a întors acasă fericită. Fiecare animal trăiește unde găsește mâncare și se simte bine. Și Olivia? În pătucul ei!',
  '¿Quién vivía en el desierto?': 'Cine trăia în deșert?',
  '¡El camello! Aguanta sin beber agua.': 'Cămila! Rezistă fără să bea apă.',
  '¿Quién los saludó con sus ocho brazos?': 'Cine i-a salutat cu cele opt brațe?',
  '¡El pulpo! Vive en el mar.': 'Caracatița! Trăiește în mare.',
  '¿Quién veía todo en la oscuridad del bosque?': 'Cine vedea totul în întunericul pădurii?',
  '¡El búho! Ve muy bien de noche.': 'Bufnița! Vede foarte bine noaptea.',
  'El pronóstico de Lucas': 'Prognoza lui Lucas',
  'Lucas jugaba a dar el pronóstico del tiempo. Cada mañana miraba el cielo y su termómetro, ¡como un científico!':
    'Lucas se juca de-a prognoza meteo. În fiecare dimineață se uita la cer și la termometrul lui, ca un om de știință!',
  'El lunes, sol y mucho calor: el termómetro subió y subió. Pronóstico de Lucas: ¡gorra, agua fresquita y a la sombra!':
    'Luni, soare și foarte cald: termometrul a urcat și a urcat. Prognoza lui Lucas: șapcă, apă rece și la umbră!',
  'El martes sopló un viento fuertísimo. ¡Ideal para volar la cometa! Subió tan alto que casi tocaba las nubes.':
    'Marți a bătut un vânt foarte puternic. Perfect pentru zmeu! S-a înălțat atât de sus că aproape atingea norii.',
  'El miércoles, nubes negras, rayos y truenos: ¡tormenta! Lucas se quedó en casa jugando, bien sequito.':
    'Miercuri, nori negri, fulgere și tunete: furtună! Lucas a rămas acasă jucându-se, la uscat.',
  'El jueves, una niebla espesa tapó todo. ¡Lucas no se veía ni la punta de la nariz!':
    'Joi, o ceață deasă a acoperit totul. Lucas nu-și vedea nici vârful nasului!',
  'El viernes llovió un ratito y enseguida salió el sol... ¡y apareció un arcoíris enorme! El mejor pronóstico de la semana.':
    'Vineri a plouat puțin și imediat a ieșit soarele... și a apărut un curcubeu uriaș! Cea mai bună prognoză a săptămânii.',
  '¿Qué voló Lucas el día de viento?': 'Ce a înălțat Lucas în ziua cu vânt?',
  '¡La cometa! Con el viento vuela alto.': 'Zmeul! Cu vântul zboară sus.',
  '¿Por qué se quedó Lucas en casa el miércoles?': 'De ce a rămas Lucas acasă miercuri?',
  '¡Por la tormenta! Con rayos y truenos.': 'Din cauza furtunii! Cu fulgere și tunete.',
  '¿Qué apareció cuando salió el sol después de la lluvia?': 'Ce a apărut când a ieșit soarele după ploaie?',
  '¡El arcoíris! Sale cuando hay sol y lluvia.': 'Curcubeul! Apare când e soare și ploaie.',
  'La sandía de Julia': 'Pepenele Juliei',
  'Julia y su abuela hicieron un pocito en la tierra y pusieron una semilla de sandía. ¡A dormir, semillita!':
    'Julia și bunica ei au făcut o gropiță în pământ și au pus o sămânță de pepene. La culcare, sămânțo!',
  'Le dieron agua con la regadera, y el sol le dio luz y calorcito. ¡Las plantas necesitan agua, luz y tierra!':
    'I-au dat apă cu stropitoarea, iar soarele i-a dat lumină și căldură. Plantele au nevoie de apă, lumină și pământ!',
  'A los pocos días, ¡pip!, asomó un brote verde. Y el brote fue creciendo hasta convertirse en una planta con hojas grandes.':
    'După câteva zile, pip!, a ieșit un mugur verde. Și mugurul a tot crescut până s-a făcut o plantă cu frunze mari.',
  'Un día de mucho calor, Julia se olvidó de regarla, ¡y la planta se puso caída y triste! Julia corrió con la regadera.':
    'Într-o zi foarte caldă, Julia a uitat s-o ude, și planta s-a ofilit și s-a întristat! Julia a alergat cu stropitoarea.',
  'Con agua otra vez, la planta se puso contenta. Le salieron flores amarillas, y las abejas vinieron a visitarlas. ¡Bzzz!':
    'Cu apă din nou, planta s-a înveselit. I-au ieșit flori galbene, și albinele au venit să le viziteze. Bzzz!',
  'Las flores se convirtieron en frutos: ¡sandías! Y dentro había un montón de semillas... ¡para plantar otra vez!':
    'Florile s-au transformat în fructe: pepeni! Și înăuntru erau o mulțime de semințe... ca să plantăm din nou!',
  '¿Qué salió primero de la semilla?': 'Ce a ieșit întâi din sămânță?',
  '¡El brote! Después vinieron la planta, la flor y el fruto.': 'Mugurul! Apoi au venit planta, floarea și fructul.',
  '¿Qué le faltó a la planta el día de calor?': 'Ce i-a lipsit plantei în ziua caldă?',
  '¡Agua! Sin agua, la planta se pone triste.': 'Apa! Fără apă, planta se întristează.',
  '¿Qué había dentro de la sandía?': 'Ce era înăuntrul pepenelui?',
  '¡Semillas! Para plantar otra vez.': 'Semințe! Ca să plantăm din nou.',
  'Martina, superheroína del planeta': 'Martina, supereroina planetei',
  'Martina se puso su capa: ¡era la superheroína del planeta! Su misión: separar la basura y no desperdiciar nada.':
    'Martina și-a pus pelerina: era supereroina planetei! Misiunea ei: să sorteze gunoiul și să nu risipească nimic.',
  'Las botellas de plástico, las latas y los briks, ¡al contenedor amarillo! Ahí van los envases.':
    'Sticlele de plastic, dozele și cutiile de lapte, în containerul galben! Acolo merg ambalajele.',
  'El periódico y las cajas de cartón, al contenedor azul. Los frascos y las botellas de vidrio, al verde. ¡Con cuidado!':
    'Ziarul și cutiile de carton, în containerul albastru. Borcanele și sticlele de geam, în cel verde. Cu grijă!',
  'La piel del plátano y el corazón de la manzana, al marrón. ¡Se convierten en abono para las plantas!':
    'Coaja de banană și cotorul de măr, în cel maro. Se transformă în îngrășământ pentru plante!',
  'Cuando se lavaba los dientes, Martina cerraba el grifo. ¡Así no se escapa el agua que no usamos!':
    'Când se spăla pe dinți, Martina închidea robinetul. Așa nu se risipește apa pe care n-o folosim!',
  'Y al salir de un cuarto, ¡clic!, apagaba la luz. El planeta Tierra estaba feliz con su superheroína.':
    'Și când ieșea dintr-o cameră, clic!, stingea lumina. Planeta Pământ era fericită cu supereroina ei.',
  '¿Qué tiró Martina al contenedor verde?': 'Ce a aruncat Martina în containerul verde?',
  '¡La botella de vidrio! El vidrio va al verde.': 'Sticla de geam! Sticla merge în cel verde.',
  '¿Qué fue al contenedor marrón?': 'Ce a mers în containerul maro?',
  '¡La piel del plátano! Se convierte en abono.': 'Coaja de banană! Se transformă în îngrășământ.',
  '¿Qué cerraba Martina para ahorrar agua?': 'Ce închidea Martina ca să economisească apa?',
  '¡El grifo! Así cuidamos el agua.': 'Robinetul! Așa avem grijă de apă.',
  'El viaje de Mateo': 'Călătoria lui Mateo',
  'La familia de Mateo se iba de viaje a la montaña. Mateo hizo su maleta: abrigo, gorro... ¡y su peluche, claro!':
    'Familia lui Mateo pleca în călătorie la munte. Mateo și-a făcut valiza: haină, căciulă... și jucăria lui de pluș, desigur!',
  'Antes de arrancar, todos se pusieron el cinturón de seguridad. ¡Clic! Mateo, en su sillita. Y mamá miró el mapa.':
    'Înainte de plecare, toți și-au pus centura de siguranță. Clic! Mateo, în scaunul lui. Și mama s-a uitat pe hartă.',
  'En la carretera apareció una señal roja de stop. Papá paró, miró bien a los dos lados... y siguió.':
    'Pe drum a apărut un semn roșu de stop. Tata a oprit, s-a uitat bine în ambele părți... și a mers mai departe.',
  'Pararon a comer en un pueblo. Para cruzar la calle, esperaron el semáforo en verde y cruzaron por el paso de cebra.':
    'S-au oprit să mănânce într-un sat. Ca să traverseze strada, au așteptat semaforul verde și au trecut pe trecerea de pietoni.',
  '¡Por fin, la montaña! Mateo montó en bici por un caminito, con el casco bien puesto. ¡Qué aire tan fresco!':
    'În sfârșit, muntele! Mateo a mers cu bicicleta pe o cărare, cu casca bine pusă. Ce aer proaspăt!',
  'Por la noche, Mateo miró las estrellas abrazado a su peluche. ¡Qué bonito es viajar... y viajar seguros!':
    'Seara, Mateo s-a uitat la stele îmbrățișându-și jucăria de pluș. Ce frumos e să călătorești... și să călătorești în siguranță!',
  '¿Qué se pusieron todos antes de arrancar?': 'Ce și-au pus toți înainte de plecare?',
  '¡El cinturón de seguridad! Clic.': 'Centura de siguranță! Clic.',
  '¿Qué hizo parar a papá en la carretera?': 'Ce l-a făcut pe tata să oprească pe drum?',
  '¡La señal de stop! Hay que parar y mirar.': 'Semnul de stop! Trebuie să oprim și să ne uităm.',
  '¿Qué se puso Mateo para montar en bici?': 'Ce și-a pus Mateo ca să meargă cu bicicleta?',
  '¡El casco! Cuida la cabeza.': 'Casca! Apără capul.',
};
