/*
 * idiomas/ro/zoo.ts: los textos en rumano de la excursión al zoo (fase P17 de docs/IDEAS-MEJORA.md, desde la v0.2.161,
 * por la regla de Fernando del 15 de noviembre de 2026: toda funcionalidad nueva es multiidioma): los recintos, lo que
 * dice Nico el cuidador (la bienvenida, las presentaciones y los datos curiosos), las frases de dar de comer y la página
 * del zoo del álbum de fotos (el safari fotográfico); desde la P18 (v0.2.162), también la excursión al acuario, con Marina
 * la buceadora, y desde la P19 (v0.2.163), el museo de los dinosaurios, con Pablo el paleontólogo. Lo común de las excursiones está en cole.ts. Borrador de Claude
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
};
