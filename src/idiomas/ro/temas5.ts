/*
 * idiomas/ro/temas5.ts: los textos en rumano de los temas de 5 años (fase ID5d de docs/PLAN-IDIOMAS.md), los de
 * temas/temas5.ts: los meses, el cuerpo por dentro, el otoño, la comida sana, las fiestas del año, el espacio, los
 * dinosaurios, los animales y sus casas, el tiempo, los seres vivos, el reciclaje, los viajes y el Rincón de los
 * Conceptos de 5 años (mezclar colores, formas, sumar, restar, primero y último, derecha e izquierda, pesado y ligero).
 * Borrador de Claude para que lo revise una persona que hable rumano (ID9). Va del texto en castellano, tal como está en
 * el código, a su traducción; textos.ts junta esta tabla con las demás. Los nombres de las cosas (con sus formas) van en
 * nombres.ts. Los hábitats («el mar») se traducen con su preposición («în mare», «la pol»), porque solo se usan tras
 * «vive en»; y «viene de» usa el nombre sin artículo ({origen}: «vine de la vacă»).
 * Exporta: TEMAS5_RO. No importa nada.
 */

/** Los textos de los temas de 5 años, del castellano al rumano. */
export const TEMAS5_RO: Readonly<Record<string, string>> = {
  // nombres de los juegos y trozos
  'Los meses en orden': 'Lunile în ordine',
  'Los rayos X': 'Razele X',
  'El árbol durante el año': 'Copacul de-a lungul anului',
  'Todos los días o a veces': 'În fiecare zi sau uneori',
  'Las fiestas en orden': 'Sărbătorile în ordine',
  'El día y la noche': 'Ziua și noaptea',
  'Contar estrellas': 'Numărăm stelele',
  'Del más chico al más grande': 'De la cel mai mic la cel mai mare',
  'Buscar fósiles': 'Căutăm fosile',
  'Los colores del arcoíris': 'Culorile curcubeului',
  'El ciclo de la vida': 'Ciclul vieții',
  'A reciclar': 'La reciclat',
  'Ahorramos agua y luz': 'Economisim apă și lumină',
  'Limpiamos el parque': 'Curățăm parcul',
  'Armamos la maleta': 'Facem bagajul',
  'Mezclar colores': 'Amestecăm culori',
  'Sumar': 'Adunăm',
  'Restar': 'Scădem',
  'Primero y último': 'Primul și ultimul',
  'Derecha, izquierda y entre': 'Dreapta, stânga și între',
  'Pesado, liviano, grueso y delgado': 'Greu, ușor, gros și subțire',
  'Series difíciles': 'Șiruri grele',
  'el mar': 'în mare',
  'el polo': 'la pol',
  'la selva': 'în junglă',
  'el bosque': 'în pădure',
  'el desierto': 'în deșert',
  'ENERO': 'IANUARIE',
  'FEBRERO': 'FEBRUARIE',
  'ABRIL': 'APRILIE',
  'DICIEMBRE': 'DECEMBRIE',
  'más pesado': 'mai greu',
  'más ligero': 'mai ușor',
  'más grueso': 'mai gros',
  'más delgado': 'mai subțire',

  // conocer: cosas sueltas
  '¡El estómago! Ahí va la comida.': 'Stomacul! Acolo merge mâncarea.',
  'Nieva. Caen copos de nieve cuando hace mucho frío.': 'Ninge. Cad fulgi de zăpadă când e foarte frig.',
  'La ballena. Vive en el mar, pero respira aire.': 'Balena. Trăiește în mare, dar respiră aer.',
  'La tarta. En el cumpleaños soplamos las velas.': 'Tortul. La ziua de naștere suflăm în lumânări.',
  'Las hojas. En otoño se ponen naranjas y amarillas, y se caen.':
    'Frunzele. Toamna se fac portocalii și galbene, și cad.',
  'El arcoíris. Sale cuando hay sol y lluvia a la vez.': 'Curcubeul. Apare când e soare și plouă în același timp.',
  'El búho. Vive en el bosque y sale de noche.': 'Bufnița. Trăiește în pădure și iese noaptea.',
  'El regalo. ¡Qué bonito es regalar!': 'Cadoul. Ce frumos e să dăruim!',
  'La semilla. De ella nace una planta nueva.': 'Sămânța. Din ea se naște o plantă nouă.',
  'Las estrellas. Están muy, muy lejos. ¡Por eso las vemos pequeñitas!':
    'Stelele. Sunt foarte, foarte departe. De aceea le vedem micuțe!',

  // los meses
  'Enero. Es el primer mes del año.': 'Ianuarie. E prima lună a anului.',
  'Febrero. Es el mes más cortito.': 'Februarie. E luna cea mai scurtă.',
  'Marzo.': 'Martie.',
  'Abril.': 'Aprilie.',
  'Mayo.': 'Mai.',
  'Junio.': 'Iunie.',
  'Julio.': 'Iulie.',
  'Agosto.': 'August.',
  'Septiembre.': 'Septembrie.',
  'Octubre.': 'Octombrie.',
  'Noviembre.': 'Noiembrie.',
  'Diciembre. Es el último mes del año.': 'Decembrie. E ultima lună a anului.',
  'El año tiene doce meses. Toca cada uno para conocerlo.':
    'Anul are douăsprezece luni. Atinge-le pe fiecare ca să le cunoști.',
  'Ese lugar es para otro mes. Piensa cuál viene antes y cuál después.':
    'Locul acela e pentru altă lună. Gândește-te care vine înainte și care după.',
  'A la fila de los meses le faltan algunos. Lleva cada mes a su lugar.':
    'Din șirul lunilor lipsesc câteva. Du fiecare lună la locul ei.',
  '¡Muy bien! Enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre y diciembre.':
    'Foarte bine! Ianuarie, februarie, martie, aprilie, mai, iunie, iulie, august, septembrie, octombrie, noiembrie și decembrie.',
  '¿Qué mes viene después?': 'Ce lună vine după?',
  '{Meses}... ¿Qué mes viene después?': '{Meses}... Ce lună vine după?',
  '¡Sí! Después de {mes} viene {otro}.': 'Da! După {mes} vine {otro}.',
  '{Mes} no. {Meses}... ¿y después?': '{Mes} nu. {Meses}... și după?',

  // el cuerpo por dentro
  'El esqueleto. Son todos los huesos juntos. Nos sostiene, ¡como el palo de una tienda de campaña!':
    'Scheletul. Sunt toate oasele împreună. Ne ține drepți, ca bățul unui cort!',
  'El hueso. Es duro y fuerte. Tomar leche ayuda a que crezca.':
    'Osul. E tare și puternic. Laptele îl ajută să crească.',
  'El músculo. Nos ayuda a movernos. Se pone fuerte cuando jugamos y corremos.':
    'Mușchiul. Ne ajută să ne mișcăm. Se face puternic când ne jucăm și alergăm.',
  'El corazón. Late, pum pum, y lleva la sangre por todo el cuerpo.':
    'Inima. Bate, bum bum, și duce sângele prin tot corpul.',
  'Los pulmones. Se llenan de aire cuando respiramos. ¡Infla la panza!':
    'Plămânii. Se umplu cu aer când respirăm. Umflă burtica!',
  'El estómago. Ahí va la comida cuando la tragamos.': 'Stomacul. Acolo merge mâncarea când o înghițim.',
  'El cerebro. Está adentro de la cabeza. Con él pensamos, aprendemos y soñamos.':
    'Creierul. E înăuntrul capului. Cu el gândim, învățăm și visăm.',
  'Esta es una máquina de rayos X. Mira adentro del cuerpo con la pantalla.':
    'Acesta e un aparat cu raze X. Uită-te înăuntrul corpului cu ecranul.',
  '¡El cerebro! Con él pensamos.': 'Creierul! Cu el gândim.',
  '¡El corazón! Pum, pum.': 'Inima! Bum, bum.',
  '¡Los pulmones! Se llenan de aire.': 'Plămânii! Se umplu cu aer.',
  '¡Un hueso de la pierna! Es duro y fuerte.': 'Un os de la picior! E tare și puternic.',
  '¿Para qué sirve?': 'La ce folosește?',
  '¿Con qué pensamos y aprendemos?': 'Cu ce gândim și învățăm?',
  '¿Qué late y lleva la sangre por el cuerpo?': 'Ce bate și duce sângele prin corp?',
  '¿Con qué respiramos el aire?': 'Cu ce respirăm aerul?',
  '¿Adónde va la comida cuando la tragamos?': 'Unde merge mâncarea când o înghițim?',
  '¿Qué se pone fuerte cuando corremos y saltamos?': 'Ce se face puternic când alergăm și sărim?',
  '¿Qué es duro y crece fuerte si tomamos leche?': 'Ce e tare și crește puternic dacă bem lapte?',

  // el otoño de 5 años
  'La golondrina. En otoño se va volando a un lugar más calentito.': 'Rândunica. Toamna zboară într-un loc mai călduț.',
  'El erizo. Duerme todo el invierno escondido entre las hojas.': 'Ariciul. Doarme toată iarna ascuns printre frunze.',
  'La seta. Sale con la lluvia de otoño.': 'Ciuperca. Răsare după ploaia de toamnă.',
  'El paraguas. En otoño llueve más.': 'Umbrela. Toamna plouă mai mult.',
  'El viento. Sopla fuerte y hace volar las hojas.': 'Vântul. Suflă tare și face frunzele să zboare.',
  'Así cambia el árbol durante el año. Empezamos en otoño. Ordena lo que viene después.':
    'Așa se schimbă copacul de-a lungul anului. Începem cu toamna. Pune în ordine ce urmează.',
  '¡Muy bien! Otoño, invierno, primavera y verano. ¡Y después vuelve el otoño!':
    'Foarte bine! Toamna, iarna, primăvara și vara. Și apoi vine iar toamna!',
  '¿Qué hacen los animales?': 'Ce fac animalele?',
  '¿Quién se va volando a un lugar calentito?': 'Cine zboară într-un loc călduț?',
  '¿Quién guarda bellotas para el invierno?': 'Cine păstrează ghinde pentru iarnă?',
  '¿Quién duerme todo el invierno?': 'Cine doarme toată iarna?',
  '¿Quién lleva comida a su casa bajo la tierra?': 'Cine duce mâncare în casa lui de sub pământ?',
  'Llueve y hace fresquito. Viste al niño para salir en otoño.':
    'Plouă și e răcoare. Îmbracă copilul ca să iasă toamna.',
  'Las gafas de sol no hacen falta: está nublado.': 'Nu e nevoie de ochelari de soare: e înnorat.',
  'Con camiseta vamos a tener frío.': 'În tricou o să ne fie frig.',
  'El bañador es para la piscina.': 'Costumul de baie e pentru piscină.',

  // la comida sana
  'El pescado. Nos da proteínas y viene del mar.': 'Peștele. Ne dă proteine și vine din mare.',
  'La carne. Nos ayuda a crecer.': 'Carnea. Ne ajută să creștem.',
  'El huevo. Lo pone la gallina.': 'Oul. Îl face găina.',
  'Las legumbres: lentejas y garbanzos. ¡Dan mucha energía!': 'Leguminoasele: linte și năut. Dau multă energie!',
  'El arroz. Es una semilla que crece en el agua.': 'Orezul. E o sămânță care crește în apă.',
  'El queso. Se hace con leche.': 'Brânza. Se face din lapte.',
  'La miel. La hacen las abejas.': 'Mierea. O fac albinele.',
  'El aceite de oliva. Se hace con aceitunas.': 'Uleiul de măsline. Se face din măsline.',
  'Las chucherías. Son ricas, pero son para de vez en cuando.':
    'Dulciurile. Sunt bune, dar sunt doar din când în când.',
  '¿Animal o planta?': 'Animal sau plantă?',
  '{Cosa} viene de una planta.': '{Cosa} vine de la o plantă.',
  '{Cosa} viene de un animal.': '{Cosa} vine de la un animal.',
  '¿De dónde viene cada comida? Lo que viene de los animales va con la vaca. Lo que viene de las plantas va con la planta.':
    'De unde vine fiecare mâncare? Ce vine de la animale merge la vacă. Ce vine de la plante merge la plantă.',
  '¿Quién nos lo da?': 'Cine ne-o dă?',
  'Une cada comida con quién nos la da. Arrastra de una a la otra.':
    'Unește fiecare mâncare cu cine ne-o dă. Trage de la una la cealaltă.',
  '{Cosa} viene {deOtra}.': '{Cosa} vine de la {origen}.',
  'Mmm, {cosa} no viene {deOtra}.': 'Mmm, {cosa} nu vine de la {origen}.',
  '{Cosa} es rico, pero tiene mucha azúcar. Es para de vez en cuando.':
    '{Cosa} are gust bun, dar are mult zahăr. E doar din când în când.',
  '{Cosa} es sano. ¡Lo podemos comer todos los días!': '{Cosa} face bine la sănătate. Putem mânca asta în fiecare zi!',
  '¡Sí! {Cosa} nos hace crecer sanos.': 'Da! {Cosa} ne ajută să creștem sănătoși.',
  '¡Sí! {Cosa}, solo de vez en cuando.': 'Da! {Cosa}, doar din când în când.',
  'Lo sano lo comemos todos los días. Los dulces, solo de vez en cuando. Lleva cada comida a su lugar.':
    'Ce e sănătos mâncăm în fiecare zi. Dulciurile, doar din când în când. Du fiecare mâncare la locul ei.',

  // las fiestas del año
  'La corona. En enero llegan los Reyes Magos con regalos.': 'Coroana. În ianuarie vin cei trei Magi cu cadouri.',
  'El antifaz. En carnaval nos disfrazamos.': 'Masca. La carnaval ne costumăm.',
  'El libro. El Día del Libro regalamos cuentos.': 'Cartea. De Ziua Cărții dăruim povești.',
  'La rosa. En Sant Jordi se regala una rosa y un libro.':
    'Trandafirul. De Sant Jordi se dăruiesc un trandafir și o carte.',
  'El árbol de Navidad. En diciembre lo decoramos con luces.':
    'Bradul de Crăciun. În decembrie îl decorăm cu luminițe.',
  'Los fuegos artificiales. Iluminan el cielo en las fiestas.': 'Artificiile. Luminează cerul de sărbători.',
  'Ordena las fiestas del año. Empezamos en enero con los Reyes Magos.':
    'Pune în ordine sărbătorile anului. Începem în ianuarie cu cei trei Magi.',
  '¡Muy bien! Los Reyes en enero, el carnaval en febrero, el Día del Libro en abril y la Navidad en diciembre.':
    'Foarte bine! Magii în ianuarie, carnavalul în februarie, Ziua Cărții în aprilie și Crăciunul în decembrie.',
  '¿Qué usamos en la fiesta?': 'Ce folosim la sărbătoare?',
  '¿Qué nos ponemos en carnaval?': 'Ce ne punem la carnaval?',
  '¿Qué decoramos en Navidad?': 'Ce decorăm de Crăciun?',
  '¿Qué regalamos el Día del Libro?': 'Ce dăruim de Ziua Cărții?',
  '¿Qué tiene velitas en el cumpleaños?': 'Ce are lumânărele la ziua de naștere?',
  '¿Qué llevan los Reyes Magos en la cabeza?': 'Ce poartă Magii pe cap?',

  // el espacio
  'La Tierra. Es nuestro planeta. Gira y gira alrededor del sol.':
    'Pământul. E planeta noastră. Se tot învârte în jurul soarelui.',
  'Marte. Es el planeta rojo.': 'Marte. E planeta roșie.',
  'El cohete. Lleva a los astronautas al espacio.': 'Racheta. Îi duce pe astronauți în spațiu.',
  'La astronauta. Viaja al espacio con un traje especial.': 'Astronauta. Călătorește în spațiu cu un costum special.',
  'El telescopio. Sirve para mirar las estrellas de cerca.': 'Telescopul. Ne ajută să vedem stelele de aproape.',
  '{Cosa}.': '{Cosa}.',
  'Ordena los planetas del más chico al más grande.': 'Pune planetele în ordine, de la cea mai mică la cea mai mare.',
  '¡Muy bien! La luna es más chica que la Tierra, y Júpiter es el más grande.':
    'Foarte bine! Luna e mai mică decât Pământul, iar Jupiter e cea mai mare.',
  '¡Muy bien! Marte es pequeñito, la Tierra es mediana y Júpiter es enorme.':
    'Foarte bine! Marte e micuț, Pământul e mijlociu și Jupiter e uriaș.',

  // los dinosaurios
  'El tiranosaurio. Tenía dientes enormes y comía carne.': 'Tiranozaurul. Avea dinți uriași și mânca carne.',
  'El diplodoco. Tenía un cuello larguísimo y comía hojas.': 'Diplodocul. Avea un gât foarte lung și mânca frunze.',
  'El triceratops. Tenía tres cuernos en la cabeza y comía plantas.':
    'Triceratopsul. Avea trei coarne pe cap și mânca plante.',
  'El pterodáctilo. Volaba por el cielo con sus alas grandes.': 'Pterodactilul. Zbura pe cer cu aripile lui mari.',
  'El huevo de dinosaurio. Los dinosaurios nacían de huevos.': 'Oul de dinozaur. Dinozaurii ieșeau din ouă.',
  'El fósil. Es una huella de hace muchísimo tiempo, guardada en la piedra.':
    'Fosila. E o urmă de acum foarte, foarte mult timp, păstrată în piatră.',
  'El volcán. En la época de los dinosaurios había muchos.': 'Vulcanul. Pe vremea dinozaurilor erau mulți.',
  'Somos paleontólogos. Frota la tierra para descubrir lo que dejaron los dinosaurios.':
    'Suntem paleontologi. Freacă pământul ca să descoperi ce au lăsat dinozaurii.',
  '¿Qué comía?': 'Ce mânca?',
  '{Cosa} comía carne.': '{Cosa} mânca carne.',
  '{Cosa} comía plantas.': '{Cosa} mânca plante.',
  '¿Qué comía cada dinosaurio? Los que comían plantas van con las hojas. Los que comían carne van con la carne.':
    'Ce mânca fiecare dinozaur? Cei care mâncau plante merg la frunze. Cei care mâncau carne merg la carne.',
  '¡Muy bien! El diplodoco y el triceratops comían plantas. El tiranosaurio y el pterodáctilo comían carne.':
    'Foarte bine! Diplodocul și triceratopsul mâncau plante. Tiranozaurul și pterodactilul mâncau carne.',

  // los animales y sus casas
  'El pulpo. Vive en el mar y tiene ocho brazos.': 'Caracatița. Trăiește în mare și are opt brațe.',
  'El camello. Vive en el desierto y aguanta mucho sin tomar agua.':
    'Cămila. Trăiește în deșert și rezistă mult fără să bea apă.',
  'El lobo. Vive en el bosque y aúlla a la luna.': 'Lupul. Trăiește în pădure și urlă la lună.',
  'El pingüino. Vive donde hace mucho frío.': 'Pinguinul. Trăiește unde e foarte frig.',
  'El mono. Vive en la selva, entre los árboles.': 'Maimuța. Trăiește în junglă, printre copaci.',
  'El cocodrilo. Vive en los ríos de la selva.': 'Crocodilul. Trăiește în râurile din junglă.',
  '{Cosa} no vive en {sitio}.': '{Cosa} nu trăiește {sitio}.',
  '{Cosa} vive en {sitio}.': '{Cosa} trăiește {sitio}.',
  '¿Dónde vive cada animal? Llévalo a su casa.': 'Unde trăiește fiecare animal? Du-l la casa lui.',
  '¿Huevo o panza?': 'Ou sau burtică?',
  '{Cosa} crece en la panza de su mamá.': '{Cosa} crește în burtica mamei.',
  '{Cosa} nace de un huevo.': '{Cosa} iese dintr-un ou.',
  '{Cosa} crece en la tripa de su mamá.': '{Cosa} crește în burtica mamei.',
  '¿Cómo nacen? Algunos animales nacen de un huevo. Otros crecen en la tripa de su mamá.':
    'Cum se nasc? Unele animale ies dintr-un ou. Altele cresc în burtica mamei.',
  'Mira bien la forma.': 'Uită-te bine la formă.',

  // el tiempo
  'Hace sol. Hace calor y el cielo está despejado.': 'E soare. E cald și cerul e senin.',
  'Está nublado. Las nubes tapan el sol.': 'E înnorat. Norii acoperă soarele.',
  'Llueve. Caen gotas de agua de las nubes.': 'Plouă. Cad picături de apă din nori.',
  'Hay viento. El aire sopla fuerte.': 'E vânt. Aerul suflă tare.',
  'La tormenta. Hay rayos, truenos y mucha lluvia.': 'Furtuna. Sunt fulgere, tunete și multă ploaie.',
  'El termómetro. Nos dice si hace frío o calor.': 'Termometrul. Ne spune dacă e frig sau cald.',
  'Hace mucho sol. ¿Qué nos ponemos en la cabeza?': 'E mult soare. Ce ne punem pe cap?',
  'Llueve. ¿Qué llevamos para no mojarnos?': 'Plouă. Ce luăm ca să nu ne udăm?',
  'Nieva. ¿Qué nos ponemos en las manos?': 'Ninge. Ce ne punem pe mâini?',
  'Hay viento frío. ¿Qué nos ponemos en el cuello?': 'E vânt rece. Ce ne punem la gât?',
  'Hay mucha luz de sol. ¿Qué nos ponemos en los ojos?': 'E multă lumină de soare. Ce ne punem la ochi?',
  'Llueve y hay charcos. ¿Qué nos ponemos en los pies?': 'Plouă și sunt bălți. Ce ne punem în picioare?',
  'Ordena los colores del arcoíris. Arriba de todo va el rojo.':
    'Pune în ordine culorile curcubeului. Cel mai sus e roșul.',
  '¡Muy bien! Rojo, naranja, amarillo, verde y azul.': 'Foarte bine! Roșu, portocaliu, galben, verde și albastru.',
  '¡Muy bien! Rojo, naranja, amarillo, verde, celeste, azul y violeta.':
    'Foarte bine! Roșu, portocaliu, galben, verde, bleu, albastru și violet.',
  'En la playa hace calor. ¿Cómo está el termómetro?': 'La plajă e cald. Cum e termometrul?',
  'Hicimos un muñeco de nieve. ¿Cómo está el termómetro?': 'Am făcut un om de zăpadă. Cum e termometrul?',
  'Tomamos helado porque hace calor. ¿Cómo está el termómetro?':
    'Mâncăm înghețată pentru că e cald. Cum e termometrul?',
  'En el polo hace mucho frío. ¿Cómo está el termómetro?': 'La pol e foarte frig. Cum e termometrul?',
  'Nos ponemos el bañador porque hace calor. ¿Cómo está el termómetro?':
    'Ne punem costumul de baie pentru că e cald. Cum e termometrul?',
  'Nos ponemos guantes porque hace frío. ¿Cómo está el termómetro?':
    'Ne punem mănușile pentru că e frig. Cum e termometrul?',
  '¡Sí! Cuando hace calor, el rojo sube.': 'Da! Când e cald, roșul urcă.',
  '¡Sí! Cuando hace frío, el rojo baja.': 'Da! Când e frig, roșul coboară.',
  'Ese termómetro marca frío. Cuando hace calor, el rojo sube.':
    'Termometrul acela arată frig. Când e cald, roșul urcă.',
  'Ese termómetro marca calor. Cuando hace frío, el rojo baja.':
    'Termometrul acela arată cald. Când e frig, roșul coboară.',

  // los seres vivos
  'La planta con frutos. Los frutos guardan semillas.': 'Planta cu fructe. Fructele păstrează semințe.',
  'El huevo. Adentro crece el pollito.': 'Oul. Înăuntru crește puișorul.',
  'El pollito. Sale del huevo y crece hasta ser gallina.': 'Puișorul. Iese din ou și crește până devine găină.',
  'La gallina. Pone huevos, y así empieza otra vez.': 'Găina. Face ouă, și așa începe din nou.',
  'La oruga. Come hojas, come y come, y después hace un capullo.':
    'Omida. Mănâncă frunze, mănâncă și iar mănâncă, și apoi își face un cocon.',
  'La mariposa. Sale del capullo con sus alas nuevas.': 'Fluturele. Iese din cocon cu aripile lui noi.',
  '¿Cómo crece? Ordena del primero al último.': 'Cum crește? Pune în ordine, de la primul la ultimul.',
  '¡Muy bien! Así crecen los seres vivos.': 'Foarte bine! Așa cresc ființele vii.',
  '¿Está vivo?': 'E viu?',
  '{Cosa} no está vivo: no nace, no crece y no come.':
    '{Cosa} nu e o ființă vie: nu se naște, nu crește și nu mănâncă.',
  '{Cosa} es un ser vivo: nace, crece y se alimenta.': '{Cosa} e o ființă vie: se naște, crește și se hrănește.',
  '{Cosa} es un ser vivo.': '{Cosa} e o ființă vie.',
  '{Cosa} no está vivo.': '{Cosa} nu e o ființă vie.',
  'Los seres vivos nacen, crecen y se alimentan. Lleva los seres vivos con el corazón y las cosas con la piedra.':
    'Ființele vii se nasc, cresc și se hrănesc. Du ființele vii la inimă și lucrurile la piatră.',
  '¿Qué necesita para vivir?': 'De ce are nevoie ca să trăiască?',
  '¡Sí!': 'Da!',
  '{Cosa} no hace falta para vivir.': '{Cosa} nu e necesar pentru viață.',
  '¿Qué necesita la planta para vivir?': 'De ce are nevoie planta ca să trăiască?',
  'La planta necesita agua y sol.': 'Planta are nevoie de apă și soare.',
  '¿Qué necesita el perro para vivir?': 'De ce are nevoie câinele ca să trăiască?',
  'El perro necesita comida y agua.': 'Câinele are nevoie de mâncare și apă.',
  '¿Qué necesita el pez para vivir?': 'De ce are nevoie peștele ca să trăiască?',
  'El pez necesita agua limpia y comida.': 'Peștele are nevoie de apă curată și mâncare.',
  '¿Qué necesitamos las personas para vivir?': 'De ce avem nevoie noi, oamenii, ca să trăim?',
  'Necesitamos comer y dormir.': 'Avem nevoie să mâncăm și să dormim.',

  // el reciclaje
  'En el amarillo van los envases: botellas de plástico, latas y cartones de leche.':
    'În cel galben merg ambalajele: sticle de plastic, doze și cutii de lapte.',
  'En el azul va el papel y el cartón.': 'În cel albastru merg hârtia și cartonul.',
  'En el verde va el vidrio.': 'În cel verde merge sticla.',
  'En el marrón van los restos de comida.': 'În cel maro merg resturile de mâncare.',
  'La botella de plástico. Va al contenedor amarillo.': 'Sticla de plastic. Merge în containerul galben.',
  'La lata. También va al amarillo.': 'Doza. Merge tot în cel galben.',
  'El periódico. El papel va al contenedor azul.': 'Ziarul. Hârtia merge în containerul albastru.',
  'La caja de cartón. Va al azul.': 'Cutia de carton. Merge în cel albastru.',
  'La botella de vidrio. Va al contenedor verde.': 'Sticla de geam. Merge în containerul verde.',
  'Los restos de comida van al contenedor marrón.': 'Resturile de mâncare merg în containerul maro.',
  'El grifo. Hay que cerrarlo para no gastar agua.': 'Robinetul. Trebuie închis ca să nu risipim apa.',
  'La bombilla. Apagamos la luz cuando no la usamos.': 'Becul. Stingem lumina când nu o folosim.',
  'Mmm, {cosa} no va en {cubo}.': 'Mmm, {cosa} nu merge în {cubo}.',
  '{Cosa} va en {cubo}.': '{Cosa} merge în {cubo}.',
  'Vamos a reciclar.': 'Hai să reciclăm.',
  '¡Ahora con los cuatro contenedores! Lleva cada cosa a su lugar.':
    'Acum cu toate cele patru containere! Du fiecare lucru la locul lui.',
  'Nadie está usando estas cosas. ¡Apaguémoslas para cuidar el planeta! Toca cada una.':
    'Nimeni nu folosește lucrurile astea. Hai să le oprim ca să avem grijă de planetă! Atinge-le pe fiecare.',
  '¡Luz apagada!': 'Lumina e stinsă!',
  '¡Grifo cerrado! Así no se gasta el agua.': 'Robinetul e închis! Așa nu se risipește apa.',
  '¡Tele apagada!': 'Televizorul e oprit!',
  '¡Muy bien! Así ahorramos agua y luz.': 'Foarte bine! Așa economisim apă și lumină.',
  '{Cosa} es parte del parque. ¡Se queda!': '{Cosa} face parte din parc. Rămâne aici!',
  'Eso va a la papelera.': 'Asta merge la coșul de gunoi.',
  '¡Alguien dejó basura en el parque! Lleva la basura a la papelera. Las flores y los animales se quedan.':
    'Cineva a lăsat gunoi în parc! Du gunoiul la coș. Florile și animalele rămân.',
  '¡El parque quedó limpito! Gracias por cuidar el planeta.': 'Parcul a rămas curat! Mulțumesc că ai grijă de planetă.',

  // los viajes
  'El semáforo. Verde, podemos cruzar. Rojo, esperamos.': 'Semaforul. Verde, putem trece. Roșu, așteptăm.',
  'El paso de cebra. Cruzamos por aquí, de la mano de un adulto.':
    'Trecerea de pietoni. Traversăm pe aici, de mână cu un adult.',
  'La señal de stop. Los coches tienen que parar.': 'Semnul de stop. Mașinile trebuie să oprească.',
  'El casco. Lo usamos para andar en bici.': 'Casca. O purtăm când mergem cu bicicleta.',
  'El cinturón. En el coche siempre lo abrochamos.': 'Centura. În mașină o punem mereu.',
  'La maleta. Guardamos la ropa para el viaje.': 'Valiza. Punem în ea hainele pentru călătorie.',
  'El mapa. Nos muestra el camino.': 'Harta. Ne arată drumul.',
  '¿Derecha o izquierda?': 'Dreapta sau stânga?',
  '¿Qué nos cuida?': 'Ce ne protejează?',
  'Vamos en bici. ¿Qué nos ponemos en la cabeza?': 'Mergem cu bicicleta. Ce ne punem pe cap?',
  'Subimos al coche. ¿Qué nos abrochamos?': 'Urcăm în mașină. Ce ne punem?',
  'Queremos cruzar la calle. ¿Por dónde cruzamos?': 'Vrem să traversăm strada. Pe unde traversăm?',
  'Vamos en moto. ¿Qué nos protege la cabeza?': 'Mergem cu motocicleta. Ce ne protejează capul?',
  '¡Sí! {Cosa}. ¡Así viajamos seguros!': 'Da! {Cosa}. Așa călătorim în siguranță!',
  '{Cosa} es para la nieve.': '{Cosa} e pentru zăpadă.',
  '{Cosa} es para la playa.': '{Cosa} e pentru plajă.',
  '{Cosa}, para la playa.': '{Cosa}, pentru plajă.',
  '{Cosa}, para la nieve.': '{Cosa}, pentru zăpadă.',
  'Nos vamos de vacaciones. ¿Qué llevamos a la playa y qué llevamos a la nieve? Lleva cada cosa a su maleta.':
    'Plecăm în vacanță. Ce luăm la plajă și ce luăm la zăpadă? Du fiecare lucru la valiza lui.',

  // el Rincón de los Conceptos de 5 años
  '{Uno} y {otro} mezclados... ¿qué color hacen?': '{Uno} și {otro} amestecate... ce culoare fac?',
  '¡Sí! {Uno} y {otro} hacen {mezcla}.': 'Da! {Uno} și {otro} fac {mezcla}.',
  'Ese es el {color}. Piensa: {uno} y {otro}.': 'Aceea e culoarea {color}. Gândește-te: {uno} și {otro}.',
  '¿Qué forma tiene?': 'Ce formă are?',
  '¿Qué forma tiene el huevo?': 'Ce formă are oul?',
  '¿Qué forma tiene la cometa?': 'Ce formă are zmeul?',
  '¿Qué forma tiene la pelota?': 'Ce formă are mingea?',
  '¿Qué forma tiene el reloj?': 'Ce formă are ceasul?',
  '¿Qué forma tiene el libro?': 'Ce formă are cartea?',
  '¿Qué forma tiene el gorro de fiesta?': 'Ce formă are coiful de petrecere?',
  '¿Qué forma tiene el cuadro?': 'Ce formă are tabloul?',
  '¿Qué forma tiene la sandía?': 'Ce formă are pepenele verde?',
  '¡Sí! {Forma}.': 'Da! {Forma}.',
  'Ese es {forma}.': 'Acela e {forma}.',
  '{A} y {b}. ¿Cuántas hay en total?': '{A} și {b}. Câte sunt în total?',
  '{A} y {b}. ¿Cuántos hay en total?': '{A} și {b}. Câți sunt în total?',
  '¡Sí! {A} más {b} son {n}.': 'Da! {A} plus {b} fac {n}.',
  'Mmm, cuenta todos juntos: {numeros}.': 'Mmm, numără-le pe toate: {numeros}.',
  'Teníamos {a} globos y se volaron {b}. ¿Cuántos quedan?': 'Aveam {a} {a:de}baloane și au zburat {b}. Câte au rămas?',
  '¡Sí! Quedan {n}.': 'Da! Au rămas {n}.',
  'Mmm, cuenta solo los globos que quedaron.': 'Mmm, numără doar baloanele care au rămas.',
  'Los animales hacen fila para entrar a la casa. ¿Quién es {puesto} de la fila?':
    'Animalele stau la rând ca să intre în casă. Cine e {puesto} din rând?',
  '¡Sí! {Cosa} es {puesto}.': 'Da! {Cosa} e {puesto}.',
  '{Cosa} no es {puesto}. El primero es el que está más cerca de la casa.':
    '{Cosa} nu e {puesto}. Primul e cel care e cel mai aproape de casă.',
  '¿Quién está entre {uno} y {otro}?': 'Cine e între {uno} și {otro}?',
  '¿Quién está a la derecha {deCosa}?': 'Cine e în dreapta {deCosa}?',
  '¿Quién está a la izquierda {deCosa}?': 'Cine e în stânga {deCosa}?',
  '¿Qué es {cual}?': 'Ce e {cual}?',
  '¡Sí! {Cosa} es {cual}.': 'Da! {Cosa} e {cual}.',
  '{Cosa} no es {cual}. ¿Qué es {cual}?': '{Cosa} nu e {cual}. Ce e {cual}?',
  '¿Cuál es {cual}?': 'Care e {cual}?',
  '¡Sí! Ese es {cual}.': 'Da! Acela e {cual}.',
  'Mira bien el ancho de cada uno. ¿Cuál es {cual}?': 'Uită-te bine cât de lat e fiecare. Care e {cual}?',
};
