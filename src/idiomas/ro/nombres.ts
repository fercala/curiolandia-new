/*
 * idiomas/ro/nombres.ts: los nombres de los dibujos y de las cosas en rumano (fase ID2 de docs/PLAN-IDIOMAS.md), con las
 * formas que piden las frases (Nombre, de dominio/idiomas.ts). Va del nombre en castellano con su artículo (el de LEX o
 * el name de una cosa: 'el gato', 'la cabeza') a sus formas en rumano:
 *   'el gato': { art: 'pisica', sin: 'pisică', g: 'f', pl: false, plu: 'pisici', de: 'pisicii', a: 'pisicii' }
 * art es la forma con artículo (el rumano lo lleva detrás: «pisica»), sin la forma sin artículo, de y a la del genitivo y
 * dativo (en rumano son la misma: «pisicii»), y plu el plural sin artículo. Las plantillas rumanas ponen delante lo que
 * haga falta («copacul {estacion}» con de: «copacul toamnei»).
 * Desde la fase ID4b: las cosas de la tienda y la ropa de la asamblea, las estaciones, las zonas del mapa, las
 * habitaciones de la casa y los temas (sus formas salen de TEMAS_RO, de escenas.ts). Lo que aún no está sale en
 * castellano (nucleo/traducir.ts lo apunta en sinTraducir). Desde la ID4c, las frutas de la merienda de la casa, y desde la
 * ID4d, el cole, las pruebas del deporte, las excursiones y los animales de la granja con sus crías.
 * Desde la ID5a, junta también los nombres de los dibujos (LEX_RO, de lex.ts), y desde la ID5b, los de los temas de 3
 * años (las piezas del muñeco de nieve, las formas, las viñetas de las rutinas...), y desde la ID5c, los de 4 años (las
 * formas, las partes de la planta, las torres y los lápices, la mañana, la tarde y la noche), y desde la ID5d, los de
 * 5 años (los contenedores, los puestos de la fila, los termómetros, los troncos y los libros...).
 * Exporta: NOMBRES_RO. Importa el tipo Nombre (dominio/idiomas.ts), TEMAS_RO (escenas.ts), LEX_RO (lex.ts) y NUM_RO
 * (numeros.ts).
 */
import type { Nombre } from '../../dominio/idiomas.ts';
import { TEMAS_RO } from './escenas.ts';
import { LEX_RO } from './lex.ts';
import { NUM_RO } from './numeros.ts';

// N(art, sin, g, de, plu, pl): un nombre con sus formas; el dativo es igual que el genitivo (de). pl si el nombre está en
// plural (las gafas: «ochelarii»).
const N = (art: string, sin: string, g: Nombre['g'], de: string, plu?: string, pl = false): Nombre => ({
  art,
  sin,
  g,
  pl,
  de,
  a: de,
  ...(plu ? { plu } : {}),
});

// minuscula(t): t con la primera letra en minúscula, como la clave de un tema en las frases (claveTema, escenas/zonas.ts).
const minuscula = (t: string): string => t.charAt(0).toLowerCase() + t.slice(1);

// DE_TEMAS: las formas de cada tema, sacadas de su nombre en rumano (TEMAS_RO): el nombre tal cual, y «din căsuța ...»
// para «de» («toate jocurile din căsuța Culorile»). Las estaciones y las zonas de abajo van después y mandan.
const DE_TEMAS: Record<string, Nombre> = Object.fromEntries(
  Object.entries(TEMAS_RO).map(([es, ro]) => [
    minuscula(es),
    { art: ro, sin: ro, g: 'f', pl: false, de: `din căsuța ${ro}`, a: `la ${ro}` } satisfies Nombre,
  ]),
);

// DE_NUMEROS: las tarjetas de número (temas/temas5.ts) se llaman como el número, que en rumano ya es rumano («zece»):
// cada uno es su propio nombre (desde la ID5d).
const DE_NUMEROS: Record<string, Nombre> = Object.fromEntries(NUM_RO.map((n) => [n, N(n, n, 'm', n)]));

// MESES_RO: las tarjetas de mes (temas/temas5.ts) se llaman como el mes en castellano: su nombre en rumano (desde la ID5d).
const MESES_RO: Record<string, Nombre> = Object.fromEntries(
  (
    [
      ['enero', 'ianuarie'],
      ['febrero', 'februarie'],
      ['marzo', 'martie'],
      ['abril', 'aprilie'],
      ['mayo', 'mai'],
      ['junio', 'iunie'],
      ['julio', 'iulie'],
      ['agosto', 'august'],
      ['septiembre', 'septembrie'],
      ['octubre', 'octombrie'],
      ['noviembre', 'noiembrie'],
      ['diciembre', 'decembrie'],
    ] as const
  ).map(([es, ro]) => [es, N(ro, ro, 'f', `lunii ${ro}`)]),
);

// DE_LETRAS: las letras de la Isla de las Letras en rumano (contenido/letrasRo.ts, desde la fase ID6a) se llaman
// «litera a»: cada una es su propio nombre, para cuando un juego dice la letra como dice un dibujo («Aceea e litera e»).
const DE_LETRAS: Record<string, Nombre> = Object.fromEntries(
  [...'aăâbcdefghiîjklmnopqrsștțuvwxyz'].map((l) => [
    `litera ${l}`,
    N(`litera ${l}`, `litera ${l}`, 'f', `literei ${l}`),
  ]),
);

/** Del nombre en castellano con artículo a sus formas en rumano. */
export const NOMBRES_RO: Readonly<Record<string, Nombre>> = {
  ...DE_TEMAS,
  // los nombres de los dibujos (desde la fase ID5a; lo de aquí abajo manda)
  ...LEX_RO,
  ...DE_NUMEROS,
  ...MESES_RO,
  ...DE_LETRAS,
  // el tema «Rincón de los Conceptos» y las zonas y sitios del mapa (zonas.ts: ZONES y los sitios del mapa)
  'el Rincón de los Conceptos': N('Colțul noțiunilor', 'Colțul noțiunilor', 'n', 'din Colțul noțiunilor'),
  'el Jardín de los 3 años': N('Grădina de 3 ani', 'Grădina de 3 ani', 'f', 'Grădinii de 3 ani'),
  'el Bosque de los 4 años': N('Pădurea de 4 ani', 'Pădurea de 4 ani', 'f', 'Pădurii de 4 ani'),
  'la Montaña de los 5 años': N('Muntele de 5 ani', 'Muntele de 5 ani', 'm', 'Muntelui de 5 ani'),
  'los días especiales': N('zilele speciale', 'zile speciale', 'f', 'zilelor speciale', 'zile speciale', true),
  'la Playa de los Sonidos': N('Plaja Sunetelor', 'Plaja Sunetelor', 'f', 'Plajei Sunetelor'),
  'el Bosque de las Letras': N('Pădurea Literelor', 'Pădurea Literelor', 'f', 'Pădurii Literelor'),
  'el Pueblo de las Palabras': N('Satul Cuvintelor', 'Satul Cuvintelor', 'n', 'Satului Cuvintelor'),
  'la Playa Hello': N('Plaja Hello', 'Plaja Hello', 'f', 'Plajei Hello'),
  'el Parque de Londres': N('Parcul Londrei', 'Parcul Londrei', 'n', 'Parcului Londrei'),
  'el Pueblo de los Cuentos': N('Satul Poveștilor', 'Satul Poveștilor', 'n', 'Satului Poveștilor'),
  'la plaza de la asamblea': N('piața întâlnirii', 'piața întâlnirii', 'f', 'pieței întâlnirii'),
  'las canciones': N('cântecele', 'cântece', 'n', 'cântecelor', 'cântece', true),
  'los trazos': N('liniile', 'linii', 'f', 'liniilor', 'linii', true),
  'las rutinas y los hábitos': N(
    'rutinele și obiceiurile',
    'rutine și obiceiuri',
    'f',
    'rutinelor și obiceiurilor',
    '',
    true,
  ),
  'el álbum': N('albumul', 'album', 'n', 'albumului', 'albume'),
  'el globo de la Isla del Inglés': N(
    'balonul Insulei Englezei',
    'balonul Insulei Englezei',
    'n',
    'balonului Insulei Englezei',
  ),
  'la tienda': N('magazinul', 'magazin', 'n', 'magazinului', 'magazine'),
  'la casa de Tito': N('casa lui Tito', 'casa lui Tito', 'f', 'casei lui Tito'),
  'el barco de la Isla de las Letras': N(
    'barca Insulei Literelor',
    'barca Insulei Literelor',
    'f',
    'bărcii Insulei Literelor',
  ),
  'el cole': N('grădinița', 'grădiniță', 'f', 'grădiniței', 'grădinițe'),
  // las habitaciones de la casa de Tito (tienda.ts: ROOMS)
  'el salón': N('sufrageria', 'sufragerie', 'f', 'sufrageriei', 'sufragerii'),
  'el dormitorio': N('dormitorul', 'dormitor', 'n', 'dormitorului', 'dormitoare'),
  'la cocina': N('bucătăria', 'bucătărie', 'f', 'bucătăriei', 'bucătării'),
  'el baño': N('baia', 'baie', 'f', 'băii', 'băi'),
  'el cuarto de juegos': N('camera de joacă', 'cameră de joacă', 'f', 'camerei de joacă', 'camere de joacă'),
  'el jardín': N('grădina', 'grădină', 'f', 'grădinii', 'grădini'),
  'la torre de las estrellas': N('turnul stelelor', 'turnul stelelor', 'n', 'turnului stelelor'),
  // las estaciones (escenas2d.ts: ESTACION_ART)
  'el otoño': N('toamna', 'toamnă', 'f', 'toamnei', 'toamne'),
  'el invierno': N('iarna', 'iarnă', 'f', 'iernii', 'ierni'),
  'la primavera': N('primăvara', 'primăvară', 'f', 'primăverii', 'primăveri'),
  'el verano': N('vara', 'vară', 'f', 'verii', 'veri'),
  // la ropa de la asamblea (escenas2d.ts: WX_ROPA)
  'el abrigo': N('haina groasă', 'haină groasă', 'f', 'hainei groase', 'haine groase'),
  'los guantes': N('mănușile', 'mănuși', 'f', 'mănușilor', 'mănuși', true),
  'el paraguas': N('umbrela', 'umbrelă', 'f', 'umbrelei', 'umbrele'),
  'las botas de lluvia': N(
    'cizmele de cauciuc',
    'cizme de cauciuc',
    'f',
    'cizmelor de cauciuc',
    'cizme de cauciuc',
    true,
  ),
  'las botas de agua': N(
    'cizmele de cauciuc',
    'cizme de cauciuc',
    'f',
    'cizmelor de cauciuc',
    'cizme de cauciuc',
    true,
  ),
  'la camiseta': N('tricoul', 'tricou', 'n', 'tricoului', 'tricouri'),
  'las gafas de sol': N(
    'ochelarii de soare',
    'ochelari de soare',
    'm',
    'ochelarilor de soare',
    'ochelari de soare',
    true,
  ),
  // las cosas de la tienda (tienda.ts: SHOP), en su orden
  'el gorrito de fiesta': N(
    'coifulețul de petrecere',
    'coifuleț de petrecere',
    'n',
    'coifulețului de petrecere',
    'coifulețe de petrecere',
  ),
  'la gorra': N('șapca', 'șapcă', 'f', 'șepcii', 'șepci'),
  'el lazo': N('fundița', 'fundiță', 'f', 'fundiței', 'fundițe'),
  'el gorro': N('căciula', 'căciulă', 'f', 'căciulii', 'căciuli'),
  'el gorro de Navidad': N(
    'căciula de Crăciun',
    'căciulă de Crăciun',
    'f',
    'căciulii de Crăciun',
    'căciuli de Crăciun',
  ),
  'el sombrero de copa': N('jobenul', 'joben', 'n', 'jobenului', 'jobene'),
  'el sombrero de pirata': N('pălăria de pirat', 'pălărie de pirat', 'f', 'pălăriei de pirat', 'pălării de pirat'),
  'la corona': N('coroana', 'coroană', 'f', 'coroanei', 'coroane'),
  'el caparazón naranja': N('căsuța portocalie', 'căsuță portocalie', 'f', 'căsuței portocalii', 'căsuțe portocalii'),
  'el caparazón azul': N('căsuța albastră', 'căsuță albastră', 'f', 'căsuței albastre', 'căsuțe albastre'),
  'el caparazón rosa': N('căsuța roz', 'căsuță roz', 'f', 'căsuței roz', 'căsuțe roz'),
  'el caparazón verde': N('căsuța verde', 'căsuță verde', 'f', 'căsuței verzi', 'căsuțe verzi'),
  'el caparazón violeta': N('căsuța mov', 'căsuță mov', 'f', 'căsuței mov', 'căsuțe mov'),
  'el caparazón dorado': N('căsuța aurie', 'căsuță aurie', 'f', 'căsuței aurii', 'căsuțe aurii'),
  'la bufanda': N('fularul', 'fular', 'n', 'fularului', 'fulare'),
  'la bufanda roja': N('fularul roșu', 'fular roșu', 'n', 'fularului roșu', 'fulare roșii'),
  'la bufanda azul': N('fularul albastru', 'fular albastru', 'n', 'fularului albastru', 'fulare albastre'),
  'la bufanda amarilla': N('fularul galben', 'fular galben', 'n', 'fularului galben', 'fulare galbene'),
  'la bufanda violeta': N('fularul mov', 'fular mov', 'n', 'fularului mov', 'fulare mov'),
  'la alfombra': N('covorul', 'covor', 'n', 'covorului', 'covoare'),
  'el cuadro': N('tabloul', 'tablou', 'n', 'tabloului', 'tablouri'),
  'la planta': N('planta', 'plantă', 'f', 'plantei', 'plante'),
  'la lámpara': N('lampa', 'lampă', 'f', 'lămpii', 'lămpi'),
  'el banco': N('banca', 'bancă', 'f', 'băncii', 'bănci'),
  'la estantería': N('raftul', 'raft', 'n', 'raftului', 'rafturi'),
  'el reloj': N('ceasul', 'ceas', 'n', 'ceasului', 'ceasuri'),
  'el farol': N('felinarul', 'felinar', 'n', 'felinarului', 'felinare'),
  'el piano': N('pianul', 'pian', 'n', 'pianului', 'piane'),
  'la fuente': N('fântâna', 'fântână', 'f', 'fântânii', 'fântâni'),
  'la pelota de playa': N('mingea de plajă', 'minge de plajă', 'f', 'mingii de plajă', 'mingi de plajă'),
  'los bloques': N('cuburile', 'cuburi', 'n', 'cuburilor', 'cuburi', true),
  'el peluche': N('ursulețul de pluș', 'ursuleț de pluș', 'm', 'ursulețului de pluș', 'ursuleți de pluș'),
  'la cometa': N('zmeul', 'zmeu', 'n', 'zmeului', 'zmeie'),
  'el xilófono': N('xilofonul', 'xilofon', 'n', 'xilofonului', 'xilofoane'),
  'la muñeca': N('păpușa', 'păpușă', 'f', 'păpușii', 'păpuși'),
  'el robot': N('robotul', 'robot', 'm', 'robotului', 'roboți'),
  'el trenecito': N('trenulețul', 'trenuleț', 'n', 'trenulețului', 'trenulețe'),
  'la guitarra': N('chitara', 'chitară', 'f', 'chitarei', 'chitare'),
  'el telescopio': N('telescopul', 'telescop', 'n', 'telescopului', 'telescoape'),
  'la pecera': N('acvariul', 'acvariu', 'n', 'acvariului', 'acvarii'),
  'el hámster': N('hamsterul', 'hamster', 'm', 'hamsterului', 'hamsteri'),
  'la casita del perro': N('cușca cățelului', 'cușcă de cățel', 'f', 'cuștii cățelului', 'cuști de cățel'),
  'el sofá': N('canapeaua', 'canapea', 'f', 'canapelei', 'canapele'),
  'la tele': N('televizorul', 'televizor', 'n', 'televizorului', 'televizoare'),
  'la cama': N('patul', 'pat', 'n', 'patului', 'paturi'),
  'el baúl de los juguetes': N('lada cu jucării', 'ladă cu jucării', 'f', 'lăzii cu jucării', 'lăzi cu jucării'),
  'el cuento': N('povestea', 'poveste', 'f', 'poveștii', 'povești'),
  'las estrellas que brillan': N(
    'stelele care strălucesc',
    'stele care strălucesc',
    'f',
    'stelelor care strălucesc',
    'stele care strălucesc',
    true,
  ),
  'la mesa': N('masa', 'masă', 'f', 'mesei', 'mese'),
  'la silla': N('scaunul', 'scaun', 'n', 'scaunului', 'scaune'),
  'la nevera': N('frigiderul', 'frigider', 'n', 'frigiderului', 'frigidere'),
  'la olla': N('oala', 'oală', 'f', 'oalei', 'oale'),
  'la tarta de cumpleaños': N('tortul aniversar', 'tort aniversar', 'n', 'tortului aniversar', 'torturi aniversare'),
  'la bañera': N('cada', 'cadă', 'f', 'căzii', 'căzi'),
  'la toalla': N('prosopul', 'prosop', 'n', 'prosopului', 'prosoape'),
  'el jabón': N('săpunul', 'săpun', 'n', 'săpunului', 'săpunuri'),
  'el patito de goma': N('rățușca de cauciuc', 'rățușcă de cauciuc', 'f', 'rățuștii de cauciuc', 'rățuște de cauciuc'),
  'el tambor': N('toba', 'tobă', 'f', 'tobei', 'tobe'),
  'la pizarra': N('tabla', 'tablă', 'f', 'tablei', 'table'),
  'las pinturas': N('creioanele colorate', 'creioane colorate', 'n', 'creioanelor colorate', 'creioane colorate', true),
  'el globo': N('balonul', 'balon', 'n', 'balonului', 'baloane'),
  'el tobogán': N('toboganul', 'tobogan', 'n', 'toboganului', 'tobogane'),
  'el árbol': N('copacul', 'copac', 'm', 'copacului', 'copaci'),
  'la flor': N('floarea', 'floare', 'f', 'florii', 'flori'),
  'la regadera': N('stropitoarea', 'stropitoare', 'f', 'stropitorii', 'stropitori'),
  'el columpio': N('leagănul', 'leagăn', 'n', 'leagănului', 'leagăne'),
  'el castillo de arena': N('castelul de nisip', 'castel de nisip', 'n', 'castelului de nisip', 'castele de nisip'),
  'la piscina': N('piscina', 'piscină', 'f', 'piscinei', 'piscine'),
  'el globo terráqueo': N('globul pământesc', 'glob pământesc', 'n', 'globului pământesc', 'globuri pământești'),
  Saturno: N('Saturn', 'Saturn', 'm', 'lui Saturn'),
  'el cohete': N('racheta', 'rachetă', 'f', 'rachetei', 'rachete'),
  'el gato': N('pisica', 'pisică', 'f', 'pisicii', 'pisici'),
  'el pájaro': N('pasărea', 'pasăre', 'f', 'păsării', 'păsări'),
  'el conejo': N('iepurașul', 'iepuraș', 'm', 'iepurașului', 'iepurași'),
  // las frutas de la merienda de la casa (escenas/casaCocina.ts: COCINA.frutas), desde la fase ID4c
  'la fresa': N('căpșuna', 'căpșună', 'f', 'căpșunii', 'căpșuni'),
  'la manzana': N('mărul', 'măr', 'n', 'mărului', 'mere'),
  'la pera': N('para', 'pară', 'f', 'perei', 'pere'),
  'la naranja': N('portocala', 'portocală', 'f', 'portocalei', 'portocale'),
  'la sandía': N('pepenele verde', 'pepene verde', 'm', 'pepenelui verde', 'pepeni verzi'),
  // desde la fase ID4d: los sitios del cole (escenas/cole.ts), las pruebas del deporte (dominio/deporte.ts), las
  // excursiones (contenido/excursiones.ts; a, tras «Mergem»: «la ferma-școală»), los animales de la granja y sus crías
  // (escenas/granja.ts, dominio/crias.ts) y Júpiter
  'el patio': N('curtea', 'curte', 'f', 'curții', 'curți'),
  'las clases': N('clasele', 'clase', 'f', 'claselor', 'clase', true),
  'el autobús de las excursiones': N('autobuzul de excursii', 'autobuz de excursii', 'n', 'autobuzului de excursii'),
  'la carrera': N('cursa', 'cursă', 'f', 'cursei', 'curse'),
  'el salto de longitud': N('săritura în lungime', 'săritură în lungime', 'f', 'săriturii în lungime'),
  'la puntería': N('aruncarea la țintă', 'aruncare la țintă', 'f', 'aruncării la țintă'),
  'el equilibrio': N('echilibrul', 'echilibru', 'n', 'echilibrului'),
  'los relevos': N('ștafeta', 'ștafetă', 'f', 'ștafetei', 'ștafete'),
  'la prueba': N('proba', 'probă', 'f', 'probei', 'probe'),
  'la granja escuela': { ...N('ferma-școală', 'fermă-școală', 'f', 'de la ferma-școală'), a: 'la ferma-școală' },
  'el zoo': {
    ...N('grădina zoologică', 'grădină zoologică', 'f', 'de la grădina zoologică'),
    a: 'la grădina zoologică',
  },
  'el bosque': { ...N('pădurea', 'pădure', 'f', 'din pădure'), a: 'în pădure' },
  'la gallina': N('găina', 'găină', 'f', 'găinii', 'găini'),
  'la vaca': N('vaca', 'vacă', 'f', 'vacii', 'vaci'),
  'la oveja': N('oaia', 'oaie', 'f', 'oii', 'oi'),
  'la cerda': N('scroafa', 'scroafă', 'f', 'scroafei', 'scroafe'),
  'la yegua': N('iapa', 'iapă', 'f', 'iepei', 'iepe'),
  'el cerdo': N('porcul', 'porc', 'm', 'porcului', 'porci'),
  'el caballo': N('calul', 'cal', 'm', 'calului', 'cai'),
  'el pollito': N('puișorul', 'puișor', 'm', 'puișorului', 'puișori'),
  'el corderito': N('mieluțul', 'mieluț', 'm', 'mieluțului', 'mieluți'),
  'el ternero': N('vițelul', 'vițel', 'm', 'vițelului', 'viței'),
  'el lechón': N('purcelușul', 'purceluș', 'm', 'purcelușului', 'purceluși'),
  'el potro': N('mânzul', 'mânz', 'm', 'mânzului', 'mânji'),
  // los temas de 3 años (desde la fase ID5b): transportes, las piezas del muñeco de nieve, las formas, las viñetas de
  // las rutinas y las opciones del Rincón de los Conceptos
  'mamá': N('mama', 'mamă', 'f', 'mamei', 'mame'),
  'papá': N('tata', 'tată', 'm', 'tatălui', 'tați'),
  'la lancha': N('barca cu motor', 'barcă cu motor', 'f', 'bărcii cu motor', 'bărci cu motor'),
  'el helicóptero': N('elicopterul', 'elicopter', 'n', 'elicopterului', 'elicoptere'),
  'la bola grande': N('bulgărele mare', 'bulgăre mare', 'm', 'bulgărelui mare', 'bulgări mari'),
  'la bola mediana': N('bulgărele mijlociu', 'bulgăre mijlociu', 'm', 'bulgărelui mijlociu', 'bulgări mijlocii'),
  'el sombrero': N('pălăria', 'pălărie', 'f', 'pălăriei', 'pălării'),
  'la nariz de zanahoria': N('nasul de morcov', 'nas de morcov', 'n', 'nasului de morcov', 'nasuri de morcov'),
  'el círculo': N('cercul', 'cerc', 'n', 'cercului', 'cercuri'),
  'el cuadrado': N('pătratul', 'pătrat', 'n', 'pătratului', 'pătrate'),
  'muchas galletas': N('mulți biscuiți', 'mulți biscuiți', 'm', 'multor biscuiți', undefined, true),
  'pocas galletas': N('puțini biscuiți', 'puțini biscuiți', 'm', 'puținilor biscuiți', undefined, true),
  'de día': N('ziua', 'zi', 'f', 'zilei', 'zile'),
  'de noche': N('noaptea', 'noapte', 'f', 'nopții', 'nopți'),
  'el grande': N('cel mare', 'cel mare', 'm', 'celui mare'),
  'el pequeño': N('cel mic', 'cel mic', 'm', 'celui mic'),
  'mojamos las manos': N('ne udăm mâinile', 'ne udăm mâinile', 'f', 'ne udăm mâinile'),
  'frotamos': N('frecăm', 'frecăm', 'f', 'frecăm'),
  'secamos': N('ne ștergem', 'ne ștergem', 'f', 'ne ștergem'),
  'cepillamos': N('periem', 'periem', 'f', 'periem'),
  'nos enjuagamos': N('ne clătim', 'ne clătim', 'f', 'ne clătim'),
  'la sonrisa': N('zâmbetul', 'zâmbet', 'n', 'zâmbetului', 'zâmbete'),
  // los temas de 4 años (desde la fase ID5c)
  'el triángulo': N('triunghiul', 'triunghi', 'n', 'triunghiului', 'triunghiuri'),
  'el rectángulo': N('dreptunghiul', 'dreptunghi', 'n', 'dreptunghiului', 'dreptunghiuri'),
  'el óvalo': N('ovalul', 'oval', 'n', 'ovalului', 'ovale'),
  'el rombo': N('rombul', 'romb', 'n', 'rombului', 'romburi'),
  'la raíz': N('rădăcina', 'rădăcină', 'f', 'rădăcinii', 'rădăcini'),
  'el tallo': N('tulpina', 'tulpină', 'f', 'tulpinii', 'tulpini'),
  'las hojas': N('frunzele', 'frunze', 'f', 'frunzelor', 'frunze', true),
  'la torre alta': N('turnul înalt', 'turn înalt', 'n', 'turnului înalt', 'turnuri înalte'),
  'la torre baja': N('turnul scund', 'turn scund', 'n', 'turnului scund', 'turnuri scunde'),
  'el lápiz largo': N('creionul lung', 'creion lung', 'n', 'creionului lung', 'creioane lungi'),
  'el lápiz corto': N('creionul scurt', 'creion scurt', 'n', 'creionului scurt', 'creioane scurte'),
  'la mañana': N('dimineața', 'dimineață', 'f', 'dimineții', 'dimineți'),
  'la tarde': N('după-amiaza', 'după-amiază', 'f', 'după-amiezii', 'după-amiezi'),
  'la noche': N('noaptea', 'noapte', 'f', 'nopții', 'nopți'),
  // los días (las tarjetas del tren de los días), los colores (las series) y las posiciones, como nombres (ID5c)
  'el lunes': N('luni', 'luni', 'f', 'zilei de luni'),
  'el martes': N('marți', 'marți', 'f', 'zilei de marți'),
  'el miércoles': N('miercuri', 'miercuri', 'f', 'zilei de miercuri'),
  'el jueves': N('joi', 'joi', 'f', 'zilei de joi'),
  'el viernes': N('vineri', 'vineri', 'f', 'zilei de vineri'),
  'el sábado': N('sâmbătă', 'sâmbătă', 'f', 'zilei de sâmbătă'),
  'el domingo': N('duminică', 'duminică', 'f', 'zilei de duminică'),
  'rojo': N('roșu', 'roșu', 'm', 'culorii roșu'),
  'azul': N('albastru', 'albastru', 'm', 'culorii albastru'),
  'amarillo': N('galben', 'galben', 'm', 'culorii galben'),
  'verde': N('verde', 'verde', 'm', 'culorii verde'),
  'naranja': N('portocaliu', 'portocaliu', 'm', 'culorii portocaliu'),
  'rosa': N('roz', 'roz', 'm', 'culorii roz'),
  'morado': N('mov', 'mov', 'm', 'culorii mov'),
  'marrón': N('maro', 'maro', 'm', 'culorii maro'),
  'gris': N('gri', 'gri', 'm', 'culorii gri'),
  'blanco': N('alb', 'alb', 'm', 'culorii alb'),
  'negro': N('negru', 'negru', 'm', 'culorii negru'),
  'celeste': N('bleu', 'bleu', 'm', 'culorii bleu'),
  'delante': N('în față', 'în față', 'm', 'în față'),
  'detrás': N('în spate', 'în spate', 'm', 'în spate'),
  'encima': N('deasupra', 'deasupra', 'm', 'deasupra'),
  'debajo': N('dedesubt', 'dedesubt', 'm', 'dedesubt'),
  'cerca': N('aproape', 'aproape', 'm', 'aproape'),
  'lejos': N('departe', 'departe', 'm', 'departe'),
  // los temas de 5 años (desde la fase ID5d)
  'el termómetro alto': N(
    'termometrul care arată cald',
    'termometru care arată cald',
    'n',
    'termometrului care arată cald',
  ),
  'el termómetro bajo': N(
    'termometrul care arată frig',
    'termometru care arată frig',
    'n',
    'termometrului care arată frig',
  ),
  'el contenedor amarillo': N('containerul galben', 'container galben', 'n', 'containerului galben'),
  'el contenedor azul': N('containerul albastru', 'container albastru', 'n', 'containerului albastru'),
  'el contenedor verde': N('containerul verde', 'container verde', 'n', 'containerului verde'),
  'el contenedor marrón': N('containerul maro', 'container maro', 'n', 'containerului maro'),
  'el capullo': N('coconul', 'cocon', 'm', 'coconului', 'coconi'),
  'los huevitos en la hoja': N('ouăle de pe frunză', 'ouă pe frunză', 'n', 'ouălor de pe frunză', undefined, true),
  'el primero': N('primul', 'primul', 'm', 'primului'),
  'el segundo': N('al doilea', 'al doilea', 'm', 'celui de-al doilea'),
  'el tercero': N('al treilea', 'al treilea', 'm', 'celui de-al treilea'),
  'el cuarto': N('al patrulea', 'al patrulea', 'm', 'celui de-al patrulea'),
  'el quinto': N('al cincilea', 'al cincilea', 'm', 'celui de-al cincilea'),
  'el último': N('ultimul', 'ultimul', 'm', 'ultimului'),
  'el tronco grueso': N('trunchiul gros', 'trunchi gros', 'n', 'trunchiului gros'),
  'el tronco delgado': N('trunchiul subțire', 'trunchi subțire', 'n', 'trunchiului subțire'),
  'el libro grueso': N('cartea groasă', 'carte groasă', 'f', 'cărții groase'),
  'el libro delgado': N('cartea subțire', 'carte subțire', 'f', 'cărții subțiri'),
  'los Reyes': N('Magii', 'Magi', 'm', 'Magilor', 'Magi', true),
  Júpiter: N('Jupiter', 'Jupiter', 'm', 'lui Jupiter'),
};
