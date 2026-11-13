/*
 * idiomas/ro/temas4.ts: los textos en rumano de los temas de 4 años (fase ID5c de docs/PLAN-IDIOMAS.md), los de
 * temas/temas4.ts: los días de la semana, los cinco sentidos, el otoño, las emociones, las frutas y verduras, el polo,
 * los oficios, la ciudad, los animales salvajes, las plantas, los transportes, los bichitos y el Rincón de los
 * Conceptos de 4 años (formas, más y menos, alto y bajo, posiciones, mañana, tarde y noche, series y estaciones).
 * Borrador de Claude para que lo revise una persona que hable rumano (ID9). Va del texto en castellano, tal como está en
 * el código, a su traducción; textos.ts junta esta tabla con las demás. Los nombres de las cosas (con sus formas) van en
 * nombres.ts. Las emociones van en masculino («vesel», «speriat»), y las plantillas las ponen tras «cineva» o «se
 * simte», para no tener que concordarlas con «fețișoara».
 * Exporta: TEMAS4_RO. No importa nada.
 */

/** Los textos de los temas de 4 años, del castellano al rumano. */
export const TEMAS4_RO: Readonly<Record<string, string>> = {
  // nombres de los juegos y trozos
  'El tren de los días': 'Trenul zilelor',
  'Escuela o fin de semana': 'Grădiniță sau weekend',
  'La despensa de la ardilla': 'Cămara veveriței',
  'Cada emoción en su frasco': 'Fiecare emoție în borcanul ei',
  'Fruta o verdura': 'Fruct sau legumă',
  'Una sopa de verduras': 'O supă de legume',
  'Las comidas del día': 'Mesele zilei',
  'Contar pingüinos': 'Numărăm pinguinii',
  'Cada cosa en su lugar': 'Fiecare lucru la locul lui',
  'Las partes de la planta': 'Părțile plantei',
  'Del más corto al más largo': 'De la cel mai scurt la cel mai lung',
  'Busca con la lupa': 'Caută cu lupa',
  'Más colores': 'Mai multe culori',
  'Las formas': 'Formele',
  'Más y menos': 'Mai mult și mai puțin',
  'Alto, bajo, largo y corto': 'Înalt, scund, lung și scurt',
  'Delante, detrás, cerca y lejos': 'În față, în spate, aproape și departe',
  'Mañana, tarde y noche': 'Dimineață, după-amiază și noapte',
  'Series': 'Șiruri',
  'El árbol de las estaciones': 'Copacul anotimpurilor',
  'con miedo': 'speriat',
  'con vergüenza': 'rușinat',
  'contento': 'vesel',
  'triste': 'trist',
  'enfadado': 'supărat',
  'sorprendido': 'surprins',
  'tranquilo': 'liniștit',
  'al cole': 'la grădiniță',
  'al hospital': 'la spital',
  'al parque': 'în parc',
  'a la tienda': 'la magazin',
  'gris': 'gri',
  'blanco': 'alb',
  'negro': 'negru',
  'celeste': 'bleu',
  'grises': 'gri',
  'blanca': 'alb',
  'blancos': 'alb',
  'blancas': 'alb',
  'negra': 'negru',
  'negros': 'negru',
  'negras': 'negru',
  'celestes': 'bleu',
  'la raíz': 'rădăcina',
  'las hojas': 'frunzele',
  'la flor': 'floarea',
  'el fruto': 'fructul',
  'mmm...': 'mmm...',
  'delante': 'în față',
  'detrás': 'în spate',
  'encima': 'deasupra',
  'debajo': 'dedesubt',
  'cerca': 'aproape',
  'lejos': 'departe',

  // conocer: los bichos y cosas sueltas de varios temas
  'El pingüino. Es un pájaro que no vuela, ¡pero nada muy bien!':
    'Pinguinul. E o pasăre care nu zboară, dar înoată foarte bine!',
  'La abeja. Hace miel con las flores.': 'Albina. Face miere din flori.',
  'La calabaza. Es grande y naranja.': 'Dovleacul. E mare și portocaliu.',
  'La ardilla. Guarda comida para el invierno.': 'Veverița. Păstrează mâncare pentru iarnă.',
  'La bellota. Es el fruto del roble. ¡A las ardillas les encanta!':
    'Ghinda. E fructul stejarului. Veverițelor le place mult!',
  'La hormiga. Trabaja en equipo y es muy fuerte.': 'Furnica. Lucrează în echipă și e foarte puternică.',
  'La mariquita. Tiene puntitos negros.': 'Buburuza. Are bulinuțe negre.',
  'El conejo. Come zanahorias y salta.': 'Iepurașul. Mănâncă morcovi și sare.',
  'El iglú. Es una casa hecha con bloques de nieve.': 'Iglul. E o casă făcută din blocuri de zăpadă.',
  'La foca. Nada en el agua helada.': 'Foca. Înoată în apa înghețată.',
  'El globo aerostático. Vuela con aire caliente.': 'Balonul cu aer cald. Zboară cu aer fierbinte.',
  'La planta. Tiene raíz, tallo y hojas.': 'Planta. Are rădăcină, tulpină și frunze.',
  'La regadera. Las plantas necesitan agua.': 'Stropitoarea. Plantele au nevoie de apă.',
  'La flor. Muchas plantas tienen flores.': 'Floarea. Multe plante au flori.',
  'La nieve. Es agua congelada que cae del cielo.': 'Zăpada. E apă înghețată care cade din cer.',

  // los días de la semana
  'El lunes. Es el primer día de la semana. ¡Volvemos al cole!':
    'Luni. E prima zi a săptămânii. Ne întoarcem la grădiniță!',
  'El martes. Viene después del lunes.': 'Marți. Vine după luni.',
  'El miércoles. Estamos en la mitad de la semana.': 'Miercuri. Suntem la jumătatea săptămânii.',
  'El jueves. ¡Ya falta poquito para el fin de semana!': 'Joi. Mai e puțin până la weekend!',
  'El viernes. Es el último día de escuela de la semana.': 'Vineri. E ultima zi de grădiniță din săptămână.',
  'El sábado. ¡Es fin de semana! No hay escuela.': 'Sâmbătă. E weekend! Nu mergem la grădiniță.',
  'El domingo. Descansamos y estamos en familia.': 'Duminică. Ne odihnim și stăm cu familia.',
  'La semana tiene siete días. Toca cada vagón para conocerlo.':
    'Săptămâna are șapte zile. Atinge fiecare vagon ca să-l cunoști.',
  'Ese lugar es para otro día. Mira el color del vagón.':
    'Locul acela e pentru altă zi. Uită-te la culoarea vagonului.',
  'Al tren de los días le faltan vagones. Lleva cada día a su lugar, en orden.':
    'Trenului zilelor îi lipsesc vagoane. Du fiecare zi la locul ei, în ordine.',
  '¡El tren está completo! Lunes, martes, miércoles, jueves, viernes, sábado y domingo.':
    'Trenul e complet! Luni, marți, miercuri, joi, vineri, sâmbătă și duminică.',
  '¿Qué día falta?': 'Ce zi lipsește?',
  '¡Sí! Falta el {dia}.': 'Da! Lipsește {dia}.',
  'El {dia} no hay escuela. ¡Es fin de semana!': '{Dia} nu mergem la grădiniță. E weekend!',
  'El {dia} es día de escuela.': '{Dia} e zi de grădiniță.',
  'El {dia} vamos al cole.': '{Dia} mergem la grădiniță.',
  'El {dia} es fin de semana.': '{Dia} e weekend.',
  'Los días de escuela van con el cole. Los días del fin de semana van con el parque.':
    'Zilele de grădiniță merg la grădiniță. Zilele de weekend merg la parc.',

  // los cinco sentidos
  'Con los ojos vemos.': 'Cu ochii vedem.',
  'Con las orejas oímos.': 'Cu urechile auzim.',
  'Con la nariz olemos.': 'Cu nasul mirosim.',
  'Con la boca saboreamos.': 'Cu gura gustăm.',
  'Con las manos tocamos.': 'Cu mâinile atingem.',
  '¿Con qué escuchamos la campana?': 'Cu ce auzim clopoțelul?',
  '¿Con qué oímos el tambor?': 'Cu ce auzim toba?',
  '¿Con qué olemos el perfume?': 'Cu ce mirosim parfumul?',
  '¿Con qué olemos la flor?': 'Cu ce mirosim floarea?',
  '¿Con qué sentimos que el helado es dulce?': 'Cu ce simțim că înghețata e dulce?',
  '¿Con qué sentimos que el limón es ácido?': 'Cu ce simțim că lămâia e acră?',
  '¿Con qué sentimos que el cactus pincha?': 'Cu ce simțim că un cactus înțeapă?',
  '¿Con qué sentimos que el peluche es suave?': 'Cu ce simțim că jucăria de pluș e moale?',
  '¿Con qué vemos los colores del arcoíris?': 'Cu ce vedem culorile curcubeului?',
  '¿Con qué vemos las estrellas?': 'Cu ce vedem stelele?',
  'Los ojos. Con los ojos vemos los colores y las formas.': 'Ochii. Cu ochii vedem culorile și formele.',
  'Las orejas. Con las orejas oímos los sonidos.': 'Urechile. Cu urechile auzim sunetele.',
  'La nariz. Con la nariz olemos las flores y la comida.': 'Nasul. Cu nasul mirosim florile și mâncarea.',
  'La boca. Con la boca saboreamos lo dulce, lo salado y lo ácido.': 'Gura. Cu gura gustăm ce e dulce, sărat și acru.',
  'Las manos. Con las manos tocamos: suave, áspero, frío y caliente.':
    'Mâinile. Cu mâinile atingem: moale, aspru, rece și cald.',
  'Tenemos cinco sentidos. Toca cada uno para conocerlo.': 'Avem cinci simțuri. Atinge-le pe fiecare ca să le cunoști.',
  '¿Con qué lo sabemos?': 'Cu ce ne dăm seama?',

  // el otoño
  'La castaña. Se come asada en otoño.': 'Castana. Toamna se mănâncă coaptă.',
  'La nuez. Tiene una cáscara muy dura.': 'Nuca. Are o coajă foarte tare.',
  'La granada. Adentro tiene muchas semillitas rojas.': 'Rodia. Înăuntru are multe semințe roșii.',
  'Las uvas. Se cosechan al empezar el otoño.': 'Strugurii. Se culeg la începutul toamnei.',
  'La seta. Sale en el bosque cuando llueve.': 'Ciuperca. Răsare în pădure când plouă.',
  'El erizo. Se esconde entre las hojas secas.': 'Ariciul. Se ascunde printre frunzele uscate.',
  '¡Se caen los frutos del otoño! Atrapa las bellotas.': 'Cad fructele toamnei! Prinde ghindele.',
  '¡Y ahora las nueces!': 'Și acum nucile!',
  'La ardilla necesita {n} frutos para el invierno. Lleva {n} a su casita del árbol.':
    'Veverița are nevoie de {n} {n:de}fructe pentru iarnă. Du {n} la căsuța ei din copac.',
  '¡La ardilla tiene {n} frutos! Gracias.': 'Veverița are {n} {n:de}fructe! Mulțumesc.',

  // las emociones
  'Contento. Cuando algo nos gusta mucho, sentimos alegría y sonreímos.':
    'Vesel. Când ceva ne place mult, simțim bucurie și zâmbim.',
  'Triste. Cuando perdemos algo o extrañamos a alguien, sentimos tristeza.':
    'Trist. Când pierdem ceva sau ne e dor de cineva, simțim tristețe.',
  'Enfadado. Cuando algo nos parece injusto, nos enfadamos.': 'Supărat. Când ceva ni se pare nedrept, ne supărăm.',
  'Con miedo. Cuando algo nos asusta, sentimos miedo.': 'Speriat. Când ceva ne sperie, simțim frică.',
  'Sorprendido. Cuando pasa algo que no esperábamos, sentimos sorpresa.':
    'Surprins. Când se întâmplă ceva la care nu ne așteptam, simțim surpriză.',
  'Al niño se le cayó el helado al piso. ¿Cómo se siente?': 'Copilului i-a căzut înghețata pe jos. Cum se simte?',
  'La niña recibió un regalo que quería mucho. ¿Cómo se siente?':
    'Fetița a primit un cadou pe care și-l dorea mult. Cum se simte?',
  'Hay una tormenta con truenos muy fuertes. ¿Cómo se siente el niño?':
    'E o furtună cu tunete foarte puternice. Cum se simte copilul?',
  'Alguien le tiró la torre que había hecho con mucho trabajo. ¿Cómo se siente?':
    'Cineva i-a dărâmat turnul pe care îl construise cu multă muncă. Cum se simte?',
  '¡Abrió la caja y saltó un payaso! ¿Cómo se siente?': 'A deschis cutia și a sărit un clovn! Cum se simte?',
  'Todos sentimos emociones. Toca cada carita.': 'Toți simțim emoții. Atinge fiecare fețișoară.',
  '¿Cómo se siente?': 'Cum se simte?',
  '¿Quién está {emocion}? Toca la carita.': 'Cine e {emocion}? Atinge fețișoara.',
  '¡Sí! Esa carita está {emocion}.': 'Da! Acolo e cineva {emocion}.',
  'Esa carita está {esa}. Busca la que está {emocion}.': 'Acolo e cineva {esa}. Caută pe cineva {emocion}.',
  '¿Qué le pasa?': 'Ce s-a întâmplat?',
  '¡Sí! Se siente {emocion}.': 'Da! Se simte {emocion}.',
  'Mmm, piensa cómo te sentirías tú.': 'Mmm, gândește-te cum te-ai simți tu.',
  'Ese frasco es de {emocion}.': 'Borcanul acela e pentru {emocion}.',
  '{Emocion}.': '{Emocion}.',
  'Cada emoción tiene su color. Lleva cada carita a su frasco.':
    'Fiecare emoție are culoarea ei. Du fiecare fețișoară la borcanul ei.',

  // frutas y verduras
  'La zanahoria. Es una verdura naranja que crece bajo la tierra.':
    'Morcovul. E o legumă portocalie care crește sub pământ.',
  'El tomate. Rojo y jugoso, para la ensalada.': 'Roșia. Roșie și zemoasă, pentru salată.',
  'La lechuga. Sus hojas verdes van en la ensalada.': 'Salata verde. Frunzele ei verzi merg în salată.',
  'La patata. Crece escondida bajo la tierra.': 'Cartoful. Crește ascuns sub pământ.',
  'El brócoli. Parece un arbolito verde.': 'Broccoli. Seamănă cu un copăcel verde.',
  'El pimiento. Puede ser rojo, verde o amarillo.': 'Ardeiul. Poate fi roșu, verde sau galben.',
  'La piña. Es una fruta con corona.': 'Ananasul. E un fruct cu coroană.',
  'La sandía. Una fruta grande y fresquita para el verano.': 'Pepenele verde. Un fruct mare și răcoros pentru vară.',
  'El kiwi. Por fuera es marrón y por dentro es verde.': 'Kiwi. Pe dinafară e maro și pe dinăuntru e verde.',
  '{Cosa} es una verdura.': '{Cosa} e o legumă.',
  '{Cosa} es una fruta.': '{Cosa} e un fruct.',
  'Las frutas van en la canasta de las frutas. Las verduras, en la de las verduras.':
    'Fructele merg în coșul fructelor. Legumele, în coșul legumelor.',
  '¡Hagamos una sopa de verduras! Escucha qué verdura va en la olla.':
    'Hai să facem o supă de legume! Ascultă ce legumă merge în oală.',
  'Pon {cosa} en la olla.': 'Pune {cosa} în oală.',
  'Ordena las comidas del día. ¿Cuál comemos primero, cuando nos levantamos?':
    'Pune în ordine mesele zilei. Care e prima, când ne trezim?',
  '¡Muy bien! Desayuno, comida, merienda y cena.': 'Foarte bine! Micul dejun, prânzul, gustarea și cina.',

  // el polo
  'El hielo. Es agua muy fría que se puso dura.': 'Gheața. E apă foarte rece care s-a întărit.',
  'El oso polar. Tiene pelo blanco y grueso para no tener frío.':
    'Ursul polar. Are blana albă și groasă ca să nu-i fie frig.',
  'La morsa. Tiene dos colmillos largos.': 'Morsa. Are doi colți lungi.',
  '¡Hace muchísimo frío! Viste al niño para jugar en la nieve.':
    'E tare, tare frig! Îmbracă copilul ca să se joace în zăpadă.',
  'Las gafas de sol no abrigan.': 'Ochelarii de soare nu țin de cald.',
  'Con camiseta tenemos frío.': 'În tricou ne e frig.',
  'La gorra es para el sol. Para el frío, el gorro de lana.': 'Șapca e pentru soare. Pentru frig, căciula de lână.',
  '¿Frío o calor?': 'Frig sau cald?',
  '{Cosa} vive donde hace calor.': '{Cosa} trăiește unde e cald.',
  '{Cosa} vive donde hace frío.': '{Cosa} trăiește unde e frig.',
  '¿Dónde vive cada animal? Los del frío van con la nieve. Los del calor van con el sol.':
    'Unde trăiește fiecare animal? Cele de la frig merg la zăpadă. Cele de la cald merg la soare.',

  // los oficios
  'Uso casco y manguera. Apago los incendios. ¿Quién soy?':
    'Port cască și folosesc furtunul. Sting incendiile. Cine sunt?',
  'Uso un estetoscopio y te curo cuando estás enfermo. ¿Quién soy?':
    'Folosesc un stetoscop și te vindec când ești bolnav. Cine sunt?',
  'Cuido la calle y ayudo a la gente. Uso silbato. ¿Quién soy?':
    'Am grijă de stradă și ajut oamenii. Folosesc fluierul. Cine sunt?',
  'Me levanto muy temprano para hacer pan. ¿Quién soy?': 'Mă trezesc foarte devreme ca să fac pâine. Cine sunt?',
  'Llevo las cartas a todas las casas. ¿Quién soy?': 'Duc scrisorile la toate casele. Cine sunt?',
  'Corto el pelo con tijeras y peine. ¿Quién soy?': 'Tund părul cu foarfeca și pieptenele. Cine sunt?',
  'Cocino comidas ricas en la cocina. ¿Quién soy?': 'Gătesc mâncăruri gustoase în bucătărie. Cine sunt?',
  'Cuido los animales y planto verduras en el campo. ¿Quién soy?':
    'Am grijă de animale și plantez legume la câmp. Cine sunt?',
  'La bombera. Apaga incendios con la manguera.': 'Pompiera. Stinge incendiile cu furtunul.',
  'El médico. Nos cura cuando estamos enfermos.': 'Doctorul. Ne vindecă atunci când suntem bolnavi.',
  'La policía. Cuida la calle y nos ayuda.': 'Polițista. Are grijă de stradă și ne ajută.',
  'La maestra. Nos enseña en el cole.': 'Educatoarea. Ne învață la grădiniță.',
  'El panadero. Hace el pan muy temprano.': 'Brutarul. Face pâinea foarte devreme.',
  'La cocinera. Prepara comidas ricas.': 'Bucătăreasa. Pregătește mâncăruri gustoase.',
  'El cartero. Lleva las cartas a las casas.': 'Poștașul. Duce scrisorile la case.',
  'La granjera. Cuida los animales y el campo.': 'Fermiera. Are grijă de animale și de câmp.',
  'El peluquero. Nos corta el pelo.': 'Frizerul. Ne tunde părul.',
  '¿Con qué trabaja?': 'Cu ce lucrează?',
  'Une a cada persona con lo que usa para trabajar. Arrastra de una a la otra.':
    'Unește fiecare persoană cu ce folosește la lucru. Trage de la una la cealaltă.',
  '{Cosa} usa {otra}.': '{Cosa} folosește {otra}.',
  'Mmm, {cosa} no usa {otra}.': 'Mmm, {cosa} nu folosește {otra}.',
  '¿Quién soy?': 'Cine sunt?',
  '¡Sí! Soy {cosa}.': 'Da! Sunt {cosa}.',

  // la ciudad
  'El semáforo. Rojo para frenar y verde para pasar.': 'Semaforul. Roșu ca să ne oprim și verde ca să trecem.',
  'El paso de cebra. Por aquí cruzamos la calle.': 'Trecerea de pietoni. Pe aici traversăm strada.',
  'La tienda. Ahí compramos cosas.': 'Magazinul. Acolo cumpărăm lucruri.',
  'El parque. Para jugar al aire libre.': 'Parcul. Ca să ne jucăm afară.',
  'El hospital. Ahí curan a las personas.': 'Spitalul. Acolo sunt îngrijiți oamenii.',
  'El cole. Ahí aprendemos y jugamos.': 'Grădinița. Acolo învățăm și ne jucăm.',
  'El autobús. Lleva a mucha gente por la ciudad.': 'Autobuzul. Duce mulți oameni prin oraș.',
  '¿Cruzamos?': 'Traversăm?',
  '¿Adónde va cada cosa? Llévala a su lugar de la ciudad.': 'Unde merge fiecare lucru? Du-l la locul lui din oraș.',

  // los animales salvajes
  'El león. Es el rey de la sabana. ¡Grrr!': 'Leul. E regele savanei. Grrr!',
  'El elefante. Tiene una trompa muy larga.': 'Elefantul. Are o trompă foarte lungă.',
  'La jirafa. Su cuello largo llega a las hojas más altas.':
    'Girafa. Gâtul ei lung ajunge la frunzele cele mai înalte.',
  'El mono. Salta de árbol en árbol.': 'Maimuța. Sare din copac în copac.',
  'La cebra. Tiene rayas blancas y negras.': 'Zebra. Are dungi albe și negre.',
  'El cocodrilo. Vive en el río.': 'Crocodilul. Trăiește în râu.',
  'El tigre. Tiene rayas negras y corre muy rápido.': 'Tigrul. Are dungi negre și aleargă foarte repede.',
  'El perro. Vive con nosotros en casa.': 'Câinele. Trăiește cu noi în casă.',
  'El gato. Le gusta dormir al sol.': 'Pisica. Îi place să doarmă la soare.',
  '¿Dónde vive?': 'Unde trăiește?',
  '{Cosa} es un animal salvaje. Vive en la selva o en la sabana.':
    '{Cosa} e un animal sălbatic. Trăiește în junglă sau în savană.',
  '{Cosa} vive en casa o en la granja, con las personas.': '{Cosa} trăiește în casă sau la fermă, cu oamenii.',
  'Los animales que viven con las personas van a la casa. Los animales salvajes van a la selva.':
    'Animalele care trăiesc cu oamenii merg la casă. Animalele sălbatice merg în junglă.',
  '¿De quién es la sombra?': 'A cui e umbra?',
  '¿De quién es esta sombra?': 'A cui e umbra aceasta?',
  '¡Sí! Es la sombra {deCosa}.': 'Da! E umbra {deCosa}.',
  'Mira bien la forma de la sombra.': 'Uită-te bine la forma umbrei.',

  // las plantas
  'Toma el agua de la tierra.': 'Ia apa din pământ.',
  'Sostiene la planta.': 'Ține planta.',
  'Toman la luz del sol.': 'Iau lumina soarelui.',
  '¡Qué bonita!': 'Ce frumoasă!',
  'Adentro tiene las semillas.': 'Înăuntru are semințele.',
  'La semilla. Si la plantamos y la regamos, ¡crece una planta!': 'Sămânța. Dacă o plantăm și o udăm, crește o plantă!',
  'El brote. Es la plantita recién nacida.': 'Mugurașul. E plantuța abia născută.',
  'El fruto. Adentro tiene semillas nuevas.': 'Fructul. Înăuntru are semințe noi.',
  'El sol. Las plantas necesitan luz para crecer.': 'Soarele. Plantele au nevoie de lumină ca să crească.',
  'Esta es una planta. Vamos a conocer sus partes.': 'Aceasta e o plantă. Hai să-i cunoaștem părțile.',
  '¿Cómo crece?': 'Cum crește?',
  '¿Cómo crece una planta? Ordena del primero al último.':
    'Cum crește o plantă? Pune în ordine, de la primul la ultimul.',
  '¡Muy bien! Primero la semilla, después crece la planta y al final sale la flor.':
    'Foarte bine! Mai întâi sămânța, apoi crește planta și la sfârșit iese floarea.',

  // los transportes
  'La ambulancia. Lleva a los enfermos al hospital. ¡Niinoo!': 'Ambulanța. Duce bolnavii la spital. Nino-nino!',
  'El camión de bomberos. Va rápido a apagar el fuego.': 'Mașina de pompieri. Merge repede să stingă focul.',
  'El coche de policía. Lo usa la policía.': 'Mașina de poliție. O folosește poliția.',
  'El helicóptero. Vuela y puede quedarse quieto en el aire.': 'Elicopterul. Zboară și poate sta nemișcat în aer.',
  'El submarino. Navega debajo del agua.': 'Submarinul. Merge pe sub apă.',
  'El tractor. Trabaja en el campo.': 'Tractorul. Lucrează la câmp.',
  'El metro. Es un tren que va por debajo de la ciudad.': 'Metroul. E un tren care merge pe sub oraș.',
  '{Cosa} no va por la tierra.': '{Cosa} nu merge pe pământ.',
  '¿Por dónde va cada uno? Por tierra, por el aire o por el agua.':
    'Pe unde merge fiecare? Pe pământ, prin aer sau pe apă.',
  '¿Quién suena así?': 'Cine sună așa?',
  'Ordena del más corto al más largo. El más corto va primero.':
    'Pune în ordine de la cel mai scurt la cel mai lung. Cel mai scurt merge primul.',
  '¡Muy bien! Del más corto al más largo.': 'Foarte bine! De la cel mai scurt la cel mai lung.',

  // los bichitos
  'El caracol. Lleva su casa en la espalda, ¡como yo!': 'Melcul. Își poartă casa în spate, ca mine!',
  'La mariposa. Antes fue una oruga.': 'Fluturele. Înainte a fost o omidă.',
  'La araña. Tiene ocho patas y teje su tela.': 'Păianjenul. Are opt picioare și își țese pânza.',
  'El gusano. Vive bajo la tierra y la ayuda a estar sana.': 'Râma. Trăiește sub pământ și îl ajută să fie sănătos.',
  'La oruga. Come hojas y un día será mariposa.': 'Omida. Mănâncă frunze și într-o zi va fi fluture.',
  'Hay bichitos escondidos en el pasto. Mira con la lupa y tócalos.':
    'Sunt gâze ascunse în iarbă. Uită-te cu lupa și atinge-le.',
  'Busca {cosa}.': 'Caută {cosa}.',

  // el Rincón de los Conceptos de 4 años
  'Mmm, esa forma no es {forma}.': 'Mmm, forma aceea nu e {forma}.',
  '{Forma}.': '{Forma}.',
  'Cada forma va con su forma. Arrástralas.': 'Fiecare formă merge la forma ei. Trage-le.',
  '¿Dónde hay más? Toca el plato.': 'Unde sunt mai multe? Atinge farfuria.',
  '¿Dónde hay menos? Toca el plato.': 'Unde sunt mai puține? Atinge farfuria.',
  '¡Sí! Ahí hay {n}, es más.': 'Da! Acolo sunt {n}, sunt mai multe.',
  '¡Sí! Ahí hay {n}, es menos.': 'Da! Acolo sunt {n}, sunt mai puține.',
  'Ahí hay menos. Cuenta y busca donde hay más.': 'Acolo sunt mai puține. Numără și caută unde sunt mai multe.',
  'Ahí hay más. Cuenta y busca donde hay menos.': 'Acolo sunt mai multe. Numără și caută unde sunt mai puține.',
  '¿Cuál es la torre más alta?': 'Care e turnul cel mai înalt?',
  '¿Cuál es la torre más baja?': 'Care e turnul cel mai scund?',
  '¡Sí! Esa es la más alta.': 'Da! Acela e cel mai înalt.',
  '¡Sí! Esa es la más baja.': 'Da! Acela e cel mai scund.',
  'Mira bien cuántos bloques tiene cada torre.': 'Uită-te bine câte cuburi are fiecare turn.',
  '¿Cuál es el lápiz más largo?': 'Care e creionul cel mai lung?',
  '¿Cuál es el lápiz más corto?': 'Care e creionul cel mai scurt?',
  '¡Sí! Ese es el más largo.': 'Da! Acela e cel mai lung.',
  '¡Sí! Ese es el más corto.': 'Da! Acela e cel mai scurt.',
  'Mira bien el tamaño de cada lápiz.': 'Uită-te bine la mărimea fiecărui creion.',
  '¿Dónde está el gato delante de la caja?': 'Unde e pisica în fața cutiei?',
  '¿Dónde está el gato detrás de la caja?': 'Unde e pisica în spatele cutiei?',
  '¿Dónde está la pelota encima de la mesa?': 'Unde e mingea pe masă?',
  '¿Dónde está la pelota debajo de la mesa?': 'Unde e mingea sub masă?',
  '¿Dónde está el perro cerca de la casa?': 'Unde e câinele aproape de casă?',
  '¿Dónde está el perro lejos de la casa?': 'Unde e câinele departe de casă?',
  '¡Sí! {Sitio}.': 'Da! {Sitio}.',
  'Ahí está {sitio}.': 'Acolo e {sitio}.',
  '¿Cuándo desayunamos?': 'Când luăm micul dejun?',
  '¿Cuándo merendamos?': 'Când luăm gustarea?',
  '¿Cuándo se ven las estrellas?': 'Când se văd stelele?',
  '¿Cuándo jugamos en el parque después de comer?': 'Când ne jucăm în parc după prânz?',
  '¡Sí! {Momento}.': 'Da! {Momento}.',
  'Esa es {momento}.': 'Aceea e {momento}.',
  'Las hojas se ponen naranjas y se caen.': 'Frunzele se fac portocalii și cad.',
  'Hace frío y a veces nieva.': 'E frig și uneori ninge.',
  'Hace calor y hay frutas.': 'E cald și sunt fructe.',
  '¿Cuál es el árbol {estacion}?': 'Care e copacul {estacion}?',
  '¡Sí! Es el árbol {estacion}.': 'Da! E copacul {estacion}.',
  'Ese es el árbol {estacion}.': 'Acela e copacul {estacion}.',
};
