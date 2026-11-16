/*
 * idiomas/ro/zoo.ts: los textos en rumano de la excursión al zoo (fase P17 de docs/IDEAS-MEJORA.md, desde la v0.2.161,
 * por la regla de Fernando del 15 de noviembre de 2026: toda funcionalidad nueva es multiidioma): los recintos, lo que
 * dice Nico el cuidador (la bienvenida, las presentaciones y los datos curiosos), las frases de dar de comer y la página
 * del zoo del álbum de fotos (el safari fotográfico); desde la P18 (v0.2.162), también la excursión al acuario, con Marina
 * la buceadora. Lo común de las excursiones está en cole.ts. Borrador de Claude
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
};
