/*
 * idiomas/ro/temas3.ts: los textos en rumano de los temas de 3 años (fase ID5b de docs/PLAN-IDIOMAS.md): los temas de
 * temas/temas.ts (mi cole, los colores, el otoño, mi familia, el invierno, las frutas, mi casa, la granja, la primavera,
 * los transportes, el verano y el Rincón de los Conceptos) y los de temas/extras.ts (las canciones, las rutinas, los
 * trazos, el cumpleaños, la Navidad, el carnaval y el Día del Libro con los tres cerditos). Borrador de Claude para que lo
 * revise una persona que hable rumano (ID9). Va del texto en castellano, tal como está en el código, a su traducción;
 * textos.ts junta esta tabla con las demás. Los nombres de las cosas (con sus formas) van en nombres.ts.
 * Lleva también lo que el código compone y el catálogo no ve: los días y los colores de las canciones con su artículo
 * ('el lunes', 'el rojo'), los días y los meses con mayúscula ('Lunes', 'Febrero') y los versos de la canción de los
 * colores.
 * Exporta: TEMAS3_RO. No importa nada.
 */

/** Los textos de los temas de 3 años y de los temas especiales, del castellano al rumano. */
export const TEMAS3_RO: Readonly<Record<string, string>> = {
  // nombres de los juegos (los que aún no estaban)
  'Lavarse las manos': 'Spălatul pe mâini',
  'Lavarse los dientes': 'Spălatul pe dinți',
  'Dientes limpitos': 'Dinți curați',
  'Ordenar los juguetes': 'Strângem jucăriile',
  'Antes de dormir': 'Înainte de culcare',
  'Líneas acostadas': 'Linii culcate',
  'Líneas paradas': 'Linii în picioare',
  'Líneas inclinadas': 'Linii înclinate',
  'Curvas': 'Curbe',
  'Olas': 'Valuri',
  'Zigzag': 'Zigzag',
  'Bucles': 'Bucle',
  'Espiral': 'Spirală',
  'Las estaciones': 'Anotimpurile',
  'Decorar la tarta': 'Decorăm tortul',
  'Contar regalos': 'Numărăm cadourile',
  'Preparamos la fiesta': 'Pregătim petrecerea',
  'Decorar el árbol': 'Decorăm bradul',
  'Disfrazarse': 'Ne costumăm',
  'Los tres cerditos': 'Cei trei purceluși',
  'Preguntas del cuento': 'Întrebări despre poveste',
  'Arriba y abajo': 'Sus și jos',
  'Círculo y cuadrado': 'Cerc și pătrat',
  'Mucho y poco': 'Mult și puțin',
  'Día y noche': 'Zi și noapte',
  'hoja': 'frunză',
  'tierra': 'pământ',
  'cielo': 'cer',
  'agua': 'apă',
  'en la cocina': 'în bucătărie',
  'en el baño': 'în baie',
  'en el dormitorio': 'în dormitor',
  'en el salón': 'în sufragerie',

  // las canciones (temas/extras.ts)
  'El viento. ¡Sopla y se llevan las hojas! Fiuuu.': 'Vântul. Suflă și ia frunzele cu el! Fiuuu.',
  'La mariposa. Vuela de flor en flor.': 'Fluturele. Zboară din floare în floare.',
  'El castillo de arena.': 'Castelul de nisip.',
  'La pelota. En el recreo jugamos a la pelota.': 'Mingea. În pauză ne jucăm cu mingea.',
  'La seta. Crece cuando llueve.': 'Ciuperca. Crește când plouă.',
  'El nido. La casita de los pájaros.': 'Cuibul. Căsuța păsărelelor.',
  'La mariquita. Es roja con puntitos.': 'Buburuza. E roșie cu bulinuțe.',
  'El barco. Navega por el agua.': 'Barca. Plutește pe apă.',
  'Lunes, empieza la semana.': 'Luni, începe săptămâna.',
  'Martes, jugamos con ganas.': 'Marți, ne jucăm cu poftă.',
  'Miércoles, ¡ya estamos en la mitad!': 'Miercuri, am ajuns la jumătate!',
  'Jueves, ¡qué bien se está!': 'Joi, ce bine ne e!',
  'Viernes, último día de cole.': 'Vineri, ultima zi de grădiniță.',
  'Sábado, ¡a jugar y a pasear!': 'Sâmbătă, la joacă și la plimbare!',
  'Domingo, en familia a descansar.': 'Duminică, ne odihnim în familie.',
  'el lunes': 'luni',
  'el martes': 'marți',
  'el miércoles': 'miercuri',
  'el jueves': 'joi',
  'el viernes': 'vineri',
  'el sábado': 'sâmbătă',
  'el domingo': 'duminică',
  'Lunes': 'Luni',
  'Martes': 'Marți',
  'Miércoles': 'Miercuri',
  'Jueves': 'Joi',
  'Viernes': 'Vineri',
  'Sábado': 'Sâmbătă',
  'Domingo': 'Duminică',
  '¡Vamos a cantar la canción de los días de la semana! Escucha.':
    'Hai să cântăm cântecul zilelor săptămânii! Ascultă.',
  '¡Ahora te toca a ti! Toca los días en orden, empezando por el lunes.':
    'Acum e rândul tău! Atinge zilele în ordine, începând cu luni.',
  '¡Bravo! ¡Los siete días de la semana!': 'Bravo! Cele șapte zile ale săptămânii!',
  '¡La canción de las estaciones! Escucha.': 'Cântecul anotimpurilor! Ascultă.',
  '¡Ahora jugamos! Toca la estación que te digo.': 'Acum ne jucăm! Atinge anotimpul pe care ți-l spun.',
  '¡Ahora te toca a ti! Toca las estaciones en orden, como en la canción.':
    'Acum e rândul tău! Atinge anotimpurile în ordine, ca în cântec.',
  'En otoño, las hojas se caen. ¡Chas, chas!': 'Toamna cad frunzele. Fâș, fâș!',
  'En invierno hace frío. ¡Brrr, brrr!': 'Iarna e frig. Brrr, brrr!',
  'En primavera salen las flores. ¡Qué bonito olor!': 'Primăvara ies florile. Ce miros frumos!',
  'En verano hace calor. ¡A la piscina!': 'Vara e cald. La piscină!',
  '¡Qué bien! Otoño, invierno, primavera y verano.': 'Ce bine! Toamna, iarna, primăvara și vara.',
  '¡La canción de los colores! Escucha.': 'Cântecul culorilor! Ascultă.',
  '¡Ahora jugamos! Toca el color que te digo.': 'Acum ne jucăm! Atinge culoarea pe care ți-o spun.',
  '¡Qué bien! ¡Sabes un montón de colores!': 'Ce bine! Știi o mulțime de culori!',
  'Rojo como la fresa.': 'Roșu ca o căpșună.',
  'Amarillo como el sol.': 'Galben ca soarele.',
  'Azul como el mar.': 'Albastru ca marea.',
  'Verde como la rana.': 'Verde ca broscuța.',
  'Naranja como la zanahoria.': 'Portocaliu ca morcovul.',
  'Rosa como el cerdito.': 'Roz ca purcelușul.',
  'Morado como las uvas.': 'Mov ca strugurii.',
  'Marrón como el chocolate.': 'Maro ca ciocolata.',
  'el rojo': 'roșul',
  'el azul': 'albastrul',
  'el amarillo': 'galbenul',
  'el verde': 'verdele',
  'el naranja': 'portocaliul',
  'el rosa': 'rozul',
  'el morado': 'movul',
  'el marrón': 'maroul',
  '¡La canción de los meses del año! Escucha.': 'Cântecul lunilor anului! Ascultă.',
  '¡Ahora te toca a ti! Toca los meses en orden, empezando por enero.':
    'Acum e rândul tău! Atinge lunile în ordine, începând cu ianuarie.',
  '¡Bravo! ¡Los doce meses del año!': 'Bravo! Cele douăsprezece luni ale anului!',
  'Enero, ¡empieza el año!': 'Ianuarie, începe anul!',
  'Y diciembre, ¡termina el año!': 'Și decembrie, se termină anul!',
  'Enero': 'Ianuarie',
  'Febrero': 'Februarie',
  'Marzo': 'Martie',
  'Abril': 'Aprilie',
  'Mayo': 'Mai',
  'Junio': 'Iunie',
  'Julio': 'Iulie',
  'Agosto': 'August',
  'Septiembre': 'Septembrie',
  'Octubre': 'Octombrie',
  'Noviembre': 'Noiembrie',
  'Diciembre': 'Decembrie',

  // rutinas y hábitos
  'Las cosas que hacemos todos los días.': 'Lucrurile pe care le facem în fiecare zi.',
  '¿Cómo nos lavamos las manos? Ordena del primero al último.':
    'Cum ne spălăm pe mâini? Pune în ordine, de la primul la ultimul.',
  '¡Muy bien! Mojamos, ponemos jabón, frotamos y secamos. ¡Manos limpitas!':
    'Foarte bine! Udăm, punem săpun, frecăm și ștergem. Mânuțe curate!',
  '¡Chau, bichitos!': 'Pa, microbi!',
  '¡Las manos tienen bichitos! Frota con el jabón hasta que no quede ninguno.':
    'Mâinile au microbi! Freacă cu săpun până nu mai rămâne niciunul.',
  '¡Manos limpitas! Antes de comer y después de ir al baño, nos lavamos las manos.':
    'Mânuțe curate! Înainte de masă și după ce mergem la baie, ne spălăm pe mâini.',
  '¿Cómo nos lavamos los dientes? Ordena del primero al último.':
    'Cum ne spălăm pe dinți? Pune în ordine, de la primul la ultimul.',
  '¡Muy bien! Pasta, cepillo, agua... ¡y una sonrisa brillante!':
    'Foarte bine! Pastă, periuță, apă... și un zâmbet strălucitor!',
  '¡Hay bichitos en los dientes! Cepilla arriba y abajo hasta que se vayan.':
    'Sunt microbi pe dinți! Periază sus și jos până pleacă.',
  '¡Dientes limpitos! Nos cepillamos después de comer y antes de dormir.':
    'Dinți curați! Ne periem după masă și înainte de culcare.',
  '¡Qué lío! Guardemos los juguetes en el baúl.': 'Ce dezordine! Hai să punem jucăriile în cufăr.',
  '¡Todo ordenado! ¡Qué bonito queda el cuarto!': 'Totul e în ordine! Ce frumoasă e camera!',
  '¿Qué hacemos antes de dormir? Ordena del primero al último.':
    'Ce facem înainte de culcare? Pune în ordine, de la primul la ultimul.',
  '¡Muy bien! Y al final, a la cama. ¡Buenas noches!': 'Foarte bine! Și la sfârșit, la culcare. Noapte bună!',

  // los trazos
  '¡Otra abeja! Llévala a su flor.': 'Încă o albină! Du-o la floarea ei.',
  'La abeja quiere llegar a la flor. Empieza en el punto verde y sigue el camino.':
    'Albina vrea să ajungă la floare. Începe de la punctul verde și urmează drumul.',
  'Otra gota. ¡De arriba para abajo!': 'Încă o picătură. De sus în jos!',
  '¡Hagamos llover! Lleva la gota desde la nube hasta la maceta, de arriba para abajo.':
    'Hai să facem să plouă! Du picătura de la nor până la ghiveci, de sus în jos.',
  '¡Otra vez! Lleva la pelota hasta el perro.': 'Încă o dată! Du mingea până la cățel.',
  'La pelota baja por el tobogán. Llévala hasta el perro.': 'Mingea coboară pe tobogan. Du-o până la cățel.',
  '¡Otro color del arcoíris!': 'Încă o culoare a curcubeului!',
  '¡Pintemos un arcoíris! Sigue la curva de un lado al otro.':
    'Hai să pictăm un curcubeu! Urmează curba de la o parte la alta.',
  '¡Otra ola!': 'Încă un val!',
  'El barco navega sobre las olas. Sigue el camino que sube y baja.':
    'Barca plutește pe valuri. Urmează drumul care urcă și coboară.',
  '¡Otra montaña!': 'Încă un munte!',
  'El conejo salta las montañas. Sube y baja, en zigzag.': 'Iepurașul sare peste munți. Urcă și coboară, în zigzag.',
  '¡Otra vez, con muchas vueltas!': 'Încă o dată, cu multe ture!',
  'La mariposa vuela dando vueltitas. Sigue el camino con rulos.':
    'Fluturele zboară făcând cerculețe. Urmează drumul cu bucle.',
  'El caracol va dando vueltas hasta la lechuga del medio. Sigue la espiral.':
    'Melcul se tot învârte până la salata din mijloc. Urmează spirala.',
  '¡Lo lograste! Con estos trazos tu mano ya está lista para escribir letras. ¡Pruébalas en Letrilandia!':
    'Ai reușit! Cu aceste linii mâna ta e gata să scrie litere. Încearcă-le în Letrilandia!',
  'Con los trazos preparamos la mano para escribir. Se juegan en orden: cuando terminas uno, se abre el siguiente.':
    'Cu liniile ne pregătim mâna pentru scris. Se joacă în ordine: când termini unul, se deschide următorul.',
  'Sigue el camino con el dedo.': 'Urmează drumul cu degetul.',

  // el cumpleaños, la Navidad y el carnaval
  '¡Es una fiesta de cumpleaños! Sopla las velitas: toca cada una y contamos.':
    'E o petrecere de ziua de naștere! Suflă în lumânărele: atinge-le pe fiecare și numărăm.',
  '¡Decoremos la tarta! Pon encima lo que más te guste. Cuando termines, toca el botón verde.':
    'Hai să decorăm tortul! Pune deasupra ce-ți place cel mai mult. Când termini, atinge butonul verde.',
  '¿Cómo preparamos la fiesta? Primero invitamos a los amigos con una carta. Ordena lo que viene después.':
    'Cum pregătim petrecerea? Mai întâi îi invităm pe prieteni cu o scrisoare. Pune în ordine ce urmează.',
  '¡Muy bien! Invitamos, decoramos con globos, soplamos las velas y abrimos los regalos.':
    'Foarte bine! Invităm, decorăm cu baloane, suflăm în lumânări și deschidem cadourile.',
  '¡Decoremos el árbol de Navidad! Pon los adornos donde quieras. Cuando termines, toca el botón verde.':
    'Hai să decorăm bradul de Crăciun! Pune podoabele unde vrei. Când termini, atinge butonul verde.',
  '¡Es carnaval! Disfraza al niño como quieras. Cuando termines, toca el botón verde.':
    'E carnaval! Costumează copilul cum vrei. Când termini, atinge butonul verde.',
  '¡Atrápalos!': 'Prinde-i!',
  '¡Atrapa los antifaces!': 'Prinde măștile!',
  '¡Ahora las narices de payaso!': 'Acum nasurile de clovn!',

  // el Día del Libro: los tres cerditos
  '¿Te acuerdas del cuento de los tres cerditos? El lobo sopló las casas. Ordénalas como en el cuento: primero la de paja.':
    'Îți amintești povestea celor trei purceluși? Lupul a suflat în căsuțe. Pune-le în ordine ca în poveste: mai întâi cea de paie.',
  '¡Muy bien! Paja, madera y ladrillo. ¡La casa de ladrillo no se cayó!':
    'Foarte bine! Paie, lemn și cărămidă. Casa de cărămidă nu a căzut!',
  '¿Quién sopló y sopló?': 'Cine a suflat și a suflat?',
  '¿Qué casa no se cayó?': 'Care casă nu a căzut?',
  '¿Qué casa se voló con un soplido?': 'Care casă a zburat dintr-o suflare?',
  '¿Quiénes construyeron las casas?': 'Cine a construit căsuțele?',
  '¡Sí! {Cosa}.': 'Da! {Cosa}.',

  // mi cole
  '¡Listo! ¡Quedó muy bien vestido!': 'Gata! E foarte bine îmbrăcat!',
  'La mochila. Aquí llevo mis cosas al cole.': 'Ghiozdanul. În el îmi duc lucrurile la grădiniță.',
  'La mesa. En la mesa pintamos y comemos.': 'Masa. La masă desenăm și mâncăm.',
  'La silla. Me siento en la silla.': 'Scaunul. Mă așez pe scaun.',
  'El lápiz. Con el lápiz dibujo.': 'Creionul. Cu creionul desenez.',
  'Las pinturas. ¡Pintamos de colores!': 'Creioanele colorate. Colorăm în multe culori!',
  'El cuento. La profe nos lee cuentos.': 'Povestea. Doamna educatoare ne citește povești.',
  'El tobogán. ¡Me tiro por el tobogán! ¡Uiii!': 'Toboganul. Mă dau pe tobogan! Uiii!',
  'La profe. Nos enseña y nos cuida.': 'Doamna educatoare. Ne învață și are grijă de noi.',
  'Vamos a ordenar. Escucha bien dónde va cada cosa.': 'Hai să facem ordine. Ascultă bine unde merge fiecare lucru.',
  'Guarda {cosa} dentro de la mochila.': 'Pune {cosa} în ghiozdan.',
  'Deja {cosa} fuera de la mochila, en la mesa.': 'Lasă {cosa} afară din ghiozdan, pe masă.',
  '¡Muy bien! Está dentro de la mochila.': 'Foarte bine! E în ghiozdan.',
  '¡Muy bien! Está fuera de la mochila.': 'Foarte bine! E afară din ghiozdan.',

  // los colores, también concordados con la cosa (colorAdj, de juegos/comps.ts): en rumano va el nombre del color
  // detrás de «culoarea» («are culoarea roșu»)
  'roja': 'roșu',
  'rojos': 'roșu',
  'rojas': 'roșu',
  'azules': 'albastru',
  'amarilla': 'galben',
  'amarillos': 'galben',
  'amarillas': 'galben',
  'verdes': 'verde',
  'naranjas': 'portocaliu',
  'rosas': 'roz',
  'morada': 'mov',
  'morados': 'mov',
  'moradas': 'mov',
  'marrones': 'maro',
  'Rojo. Rojo como la fresa y el tomate.': 'Roșu. Roșu ca o căpșună și ca roșia.',
  'Azul. Azul como el mar y la ballena.': 'Albastru. Albastru ca marea și ca balena.',
  'Amarillo. Amarillo como el sol y el plátano.': 'Galben. Galben ca soarele și ca banana.',
  'Verde. Verde como la rana y las hojas.': 'Verde. Verde ca broscuța și ca frunzele.',
  'Estos son los colores. Toca cada uno para conocerlo.':
    'Acestea sunt culorile. Atinge-le pe fiecare ca să le cunoști.',
  'Mmm, {cosa} no es {color}. ¿De qué color es?': 'Mmm, {cosa} nu are culoarea {color}. Ce culoare are?',
  '{Cosa} son {color}.': '{Cosa} au culoarea {color}.',
  '{Cosa} es {color}.': '{Cosa} are culoarea {color}.',
  'Pon cada cosa en la canasta de su color.': 'Pune fiecare lucru în coșul culorii lui.',
  '¡Atrapa las burbujas de color {color}!': 'Prinde bulele de culoare {color}!',

  // el otoño
  'Las hojas. En otoño se ponen naranjas, rojas y marrones, ¡y se caen de los árboles!':
    'Frunzele. Toamna se fac portocalii, roșii și maro, și cad din copaci!',
  'La castaña. Es un fruto del otoño.': 'Castana. E un fruct al toamnei.',
  'La lluvia. En otoño llueve mucho.': 'Ploaia. Toamna plouă mult.',
  'El paraguas. Nos tapa de la lluvia.': 'Umbrela. Ne apără de ploaie.',
  'Las botas de agua. ¡Para saltar en los charcos!': 'Cizmele de cauciuc. Ca să sărim în bălți!',
  'La ardilla. Junta comida para el invierno.': 'Veverița. Strânge mâncare pentru iarnă.',
  '¡Se caen las hojas! Atrapa las hojas.': 'Cad frunzele! Prinde frunzele.',
  '¡Ahora atrapa las castañas!': 'Acum prinde castanele!',
  '¡Está lloviendo! Viste al niño para salir con lluvia. Arrastra la ropa hasta el niño.':
    'Plouă! Îmbracă copilul ca să iasă pe ploaie. Trage hainele până la copil.',
  'Las gafas de sol son para cuando hay sol, no para la lluvia.':
    'Ochelarii de soare sunt pentru când e soare, nu pentru ploaie.',
  'Con camiseta nos mojamos y tenemos frío.': 'În tricou ne udăm și ne e frig.',
  'La gorra es para el sol. Con lluvia mejor el paraguas.': 'Șapca e pentru soare. Pe ploaie e mai bună umbrela.',
  'Eso no va.': 'Asta nu merge.',

  // mi familia
  'Mamá.': 'Mama.',
  'Papá.': 'Tata.',
  'El hermano.': 'Fratele.',
  'La hermana.': 'Sora.',
  'El bebé. Es pequeñito y toma leche.': 'Bebelușul. E micuț și bea lapte.',
  'El abuelo. Es el papá de papá o de mamá.': 'Bunicul. E tatăl lui tata sau al mamei.',
  'La abuela. Es la mamá de mamá o de papá.': 'Bunica. E mama mamei sau a lui tata.',
  'Esta es una familia. Todas las familias son distintas, ¡y todas son bonitas! Toca a cada uno.':
    'Aceasta e o familie. Toate familiile sunt diferite, și toate sunt frumoase! Atinge-i pe fiecare.',
  'Mmm, ese lugar es de otro tamaño. Mira bien los cuadros.':
    'Mmm, locul acela e de altă mărime. Uită-te bine la pătrate.',
  'Ordena de más pequeñito a más grande. El más pequeñito va primero.':
    'Pune în ordine de la cel mai mic la cel mai mare. Cel mai mic merge primul.',
  '¡Muy bien! Del más pequeñito al más grande.': 'Foarte bine! De la cel mai mic la cel mai mare.',
  '¡Arma tu familia! Lleva a la casa a las personas que viven con tú. Cuando termines, toca el botón verde.':
    'Fă-ți familia! Du în casă persoanele care locuiesc cu tine. Când termini, atinge butonul verde.',

  // el invierno y la ropa
  'La nieve. En invierno hace mucho frío y a veces nieva.': 'Zăpada. Iarna e foarte frig și uneori ninge.',
  'El muñeco de nieve. ¡Lo hacemos con nieve!': 'Omul de zăpadă. Îl facem din zăpadă!',
  'El abrigo. Nos da calorcito.': 'Haina. Ne ține de cald.',
  'El gorro. Para la cabeza.': 'Căciula. Pentru cap.',
  'La bufanda. Para el cuello.': 'Fularul. Pentru gât.',
  'Los guantes. Para las manos.': 'Mănușile. Pentru mâini.',
  'Las botas. Para los pies.': 'Cizmele. Pentru picioare.',
  '¡Hace mucho frío! Viste al niño para salir a la nieve.': 'E foarte frig! Îmbracă copilul ca să iasă în zăpadă.',
  'Las gafas de sol son para el verano.': 'Ochelarii de soare sunt pentru vară.',
  'Con camiseta tenemos frío. Busquemos ropa abrigada.': 'În tricou ne e frig. Hai să căutăm haine groase.',
  'La gorra es para el sol. Para el frío mejor el gorro.': 'Șapca e pentru soare. Pentru frig e mai bună căciula.',
  '{Cosa} es para cuando hace calor.': '{Cosa} e pentru când e cald.',
  '{Cosa} es para cuando hace frío.': '{Cosa} e pentru când e frig.',
  '¿Frío o calor? Las cosas del frío van con la nieve. Las del calor van con el sol.':
    'Frig sau cald? Lucrurile pentru frig merg la zăpadă. Cele pentru cald merg la soare.',
  'Esa pieza va en otro lugar. ¡Mira la sombra!': 'Bucata aceea merge în alt loc. Uită-te la umbră!',
  '¡Hagamos un muñeco de nieve! Arrastra cada parte a su sombra.':
    'Hai să facem un om de zăpadă! Trage fiecare parte la umbra ei.',
  '¡Qué bonito muñeco de nieve!': 'Ce om de zăpadă frumos!',

  // las frutas y el desayuno
  'La manzana. ¡Crunch!': 'Mărul. Crunci!',
  'El plátano. Se pela y se come.': 'Banana. Se curăță de coajă și se mănâncă.',
  'La naranja. Con la naranja hacemos zumo.': 'Portocala. Din portocală facem suc.',
  'La pera. Es dulce y jugosa.': 'Para. E dulce și zemoasă.',
  'La fresa. Es roja y pequeñita.': 'Căpșuna. E roșie și micuță.',
  'Las uvas. Crecen en racimos.': 'Strugurii. Cresc în ciorchini.',
  'La leche. Para el desayuno.': 'Laptele. Pentru micul dejun.',
  'El pan. Rico en el desayuno.': 'Pâinea. Gustoasă la micul dejun.',
  'El zumo de naranja. ¡Mmm!': 'Sucul de portocale. Mmm!',
  '¡Hagamos una ensalada de frutas! Te digo qué fruta va en el bol.':
    'Hai să facem o salată de fructe! Îți spun ce fruct merge în bol.',
  'Pon {cosa} en el bol.': 'Pune {cosa} în bol.',
  '¡Mmm, qué rico!': 'Mmm, ce bun!',

  // mi casa
  'La cama. Aquí dormimos.': 'Patul. Aici dormim.',
  'El sofá. Para sentarnos todos juntos.': 'Canapeaua. Ca să stăm toți împreună.',
  'La mesa. Aquí comemos.': 'Masa. Aici mâncăm.',
  'La bañera. Para bañarnos con burbujas.': 'Cada. Ca să facem baie cu spumă.',
  'El inodoro. Para hacer pis y caca.': 'Toaleta. Ca să facem pipi și caca.',
  'El cepillo de dientes. ¡A lavarse los dientes!': 'Periuța de dinți. Hai la spălat pe dinți!',
  'La nevera. Guarda la comida fresquita.': 'Frigiderul. Ține mâncarea rece.',
  'La olla. Para cocinar.': 'Oala. Pentru gătit.',
  'La tele. Para ver dibujitos un ratito.': 'Televizorul. Ca să ne uităm puțin la desene.',
  '{Cosa} no va {sitio}.': '{Cosa} nu merge {sitio}.',
  '{Cosa} va {sitio}.': '{Cosa} merge {sitio}.',
  'Cada cosa va en su lugar de la casa. ¡Llévalas a su cuarto!':
    'Fiecare lucru are locul lui în casă. Du-le în camera lor!',

  // los animales de la granja
  'La vaca. Nos da leche. ¡Muuu!': 'Vaca. Ne dă lapte. Muuu!',
  'El cerdo. Le encanta el barro. ¡Oinc, oinc!': 'Porcul. Îi place mult noroiul. Oinc, oinc!',
  'La gallina. Pone huevos. ¡Clo, clo!': 'Găina. Face ouă. Cot, cot!',
  'La oveja. Tiene lana. ¡Beee!': 'Oaia. Are lână. Beee!',
  'El caballo. Corre muy rápido. ¡Iiiii!': 'Calul. Aleargă foarte repede. Iiiii!',
  'El pato. Nada en el agua. ¡Cuac, cuac!': 'Rața. Înoată în apă. Mac, mac!',
  'El perro. Cuida la granja. ¡Guau!': 'Câinele. Păzește ferma. Ham!',
  'El gato. ¡Miau!': 'Pisica. Miau!',
  'El pollito. Es el bebé de la gallina. ¡Pío, pío!': 'Puișorul. E puiul găinii. Piu, piu!',
  'Es de noche y los animales van a dormir. Escucha bien.': 'E noapte și animalele merg la culcare. Ascultă bine.',
  'Lleva {cosa} dentro del corral.': 'Du {cosa} în țarc.',
  'Deja {cosa} fuera del corral, en el pasto.': 'Lasă {cosa} afară din țarc, pe pășune.',
  '¡Eso! Dentro del corral.': 'Așa! În țarc.',
  '¡Eso! Fuera del corral.': 'Așa! Afară din țarc.',

  // la primavera
  'La flor. En primavera salen muchas flores.': 'Floarea. Primăvara ies multe flori.',
  'La abeja. Hace miel. ¡Bzzz!': 'Albina. Face miere. Bzzz!',
  'El pájaro. Canta en primavera.': 'Pasărea. Cântă primăvara.',
  'El sol. En primavera hay más sol.': 'Soarele. Primăvara e mai mult soare.',

  // los transportes
  'El coche. Va por la calle. ¡Bip, bip!': 'Mașina. Merge pe stradă. Bip, bip!',
  'El autobús. Lleva a mucha gente.': 'Autobuzul. Duce mulți oameni.',
  'El tren. Va por las vías. ¡Chu, chu!': 'Trenul. Merge pe șine. Ciu, ciu!',
  'El avión. Vuela por el cielo.': 'Avionul. Zboară pe cer.',
  'La bici. ¡Pedaleamos! ¡Rin, rin!': 'Bicicleta. Pedalăm! Cling, cling!',
  'La moto. ¡Brum, brum!': 'Motocicleta. Brum, brum!',
  'El helicóptero. Vuela y hace mucho ruido.': 'Elicopterul. Zboară și face mult zgomot.',
  '{Cosa} no vuela.': '{Cosa} nu zboară.',
  '{Cosa} no va por el agua.': '{Cosa} nu merge pe apă.',
  '{Cosa} no va por la calle.': '{Cosa} nu merge pe stradă.',
  '¿Por dónde va? Por la calle, por el cielo o por el agua.': 'Pe unde merge? Pe stradă, pe cer sau pe apă.',
  '¿Va por la calle o vuela por el cielo?': 'Merge pe stradă sau zboară pe cer?',
  '¿Va por la calle o por el agua?': 'Merge pe stradă sau pe apă?',

  // el verano y la playa
  'El sol. En verano hace mucho calor.': 'Soarele. Vara e foarte cald.',
  'El cubo. Para llevar arena y agua.': 'Găletușa. Ca să cărăm nisip și apă.',
  'La pala. Para cavar en la arena.': 'Lopățica. Ca să săpăm în nisip.',
  'La toalla. Para secarnos.': 'Prosopul. Ca să ne ștergem.',
  'Las gafas de sol. Cuidan los ojos del sol.': 'Ochelarii de soare. Ne apără ochii de soare.',
  'La gorra. Nos tapa la cabeza del sol.': 'Șapca. Ne apără capul de soare.',
  'La crema solar. ¡Para no quemarnos!': 'Crema de soare. Ca să nu ne ardem!',
  'El helado. ¡Fresquito!': 'Înghețata. Răcoroasă!',
  'La concha. La encontramos en la arena.': 'Scoica. O găsim în nisip.',
  '¡Hace mucho calor! Preparemos al niño para ir a la playa.': 'E foarte cald! Hai să pregătim copilul pentru plajă.',
  '¡Con abrigo en la playa tendríamos mucho calor!': 'Cu haina groasă la plajă ne-ar fi foarte cald!',
  'El gorro de lana es para el frío. Mejor la gorra.': 'Căciula de lână e pentru frig. Mai bună e șapca.',
  'La bufanda es para el invierno.': 'Fularul e pentru iarnă.',
  'Los guantes son para el frío.': 'Mănușile sunt pentru frig.',

  // el Rincón de los Conceptos
  '¿Cuál es el más grande? Tócalo.': 'Care e cel mai mare? Atinge-l.',
  '¿Cuál es el más pequeño? Tócalo.': 'Care e cel mai mic? Atinge-l.',
  '¡Ese es el grande!': 'Acela e cel mare!',
  '¡Ese es el pequeño!': 'Acela e cel mic!',
  'Ese es pequeñito. Busca el grande.': 'Acela e micuț. Caută-l pe cel mare.',
  'Ese es grande. Busca el pequeño.': 'Acela e mare. Caută-l pe cel mic.',
  'Escucha dónde va cada cosa: arriba o abajo de la mesa.': 'Ascultă unde merge fiecare lucru: pe masă sau sub masă.',
  'Pon {cosa} arriba de la mesa.': 'Pune {cosa} pe masă.',
  'Pon {cosa} abajo de la mesa.': 'Pune {cosa} sub masă.',
  '¡Muy bien! Arriba de la mesa.': 'Foarte bine! Pe masă.',
  '¡Muy bien! Abajo de la mesa.': 'Foarte bine! Sub masă.',
  'Mmm, esa forma no es redonda.': 'Mmm, forma aceea nu e rotundă.',
  'Mmm, esa forma no es un cuadrado.': 'Mmm, forma aceea nu e un pătrat.',
  'Círculo.': 'Cerc.',
  'Cuadrado.': 'Pătrat.',
  'Los círculos van con el círculo. Los cuadrados van con el cuadrado.':
    'Cercurile merg la cerc. Pătratele merg la pătrat.',
  '¿Dónde hay muchas galletas?': 'Unde sunt mulți biscuiți?',
  '¿Dónde hay pocas galletas?': 'Unde sunt puțini biscuiți?',
  '¡Ahí hay muchas!': 'Acolo sunt mulți!',
  '¡Ahí hay poquitas!': 'Acolo sunt puțini!',
  'Ahí hay pocas. Busca donde hay muchas.': 'Acolo sunt puțini. Caută unde sunt mulți.',
  'Ahí hay muchas. Busca donde hay pocas.': 'Acolo sunt mulți. Caută unde sunt puțini.',
  '¿Cuándo sale el sol?': 'Când răsare soarele?',
  '¿Cuándo salen las estrellas y la luna?': 'Când ies stelele și luna?',
  '¿Cuándo dormimos?': 'Când dormim?',
  '¿Cuándo vamos al cole?': 'Când mergem la grădiniță?',
  '¿Cuándo jugamos en el parque?': 'Când ne jucăm în parc?',
  '¿Cuándo está oscuro?': 'Când e întuneric?',
  '¡De día!': 'Ziua!',
  '¡De noche!': 'Noaptea!',
  'Ese es de noche. Mira el otro.': 'Acela e noaptea. Uită-te la celălalt.',
  'Ese es de día. Mira el otro.': 'Acela e ziua. Uită-te la celălalt.',
};
