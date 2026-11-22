/*
 * idiomas/ro/clases.ts: los textos en rumano de las clases del cole y del rincón de las construcciones (fase P27 de
 * docs/IDEAS-MEJORA.md: escenas/clases.ts y mundo3d/bloques3d.ts). Borrador de Claude para que lo revise una persona
 * que hable rumano (docs/PLAN-IDIOMAS.md, ID9). Va del texto en castellano, tal como está en el código, a su traducción;
 * textos.ts junta esta tabla con las demás. Las plantillas llevan sus huecos ({n}).
 * Exporta: CLASES_RO. No importa nada.
 */

/** Los textos de las clases y de los bloques, del castellano al rumano. */
export const CLASES_RO: Readonly<Record<string, string>> = {
  // las clases (escenas/clases.ts)
  '¡Estas son las clases! Toca el rincón de las construcciones para jugar con los bloques.':
    'Acestea sunt clasele! Atinge colțul construcțiilor ca să te joci cu cuburile.',
  'El rincón de las construcciones.': 'Colțul construcțiilor.',
  'El rincón de la lógica.': 'Colțul logicii.',
  'El rincón del arte.': 'Colțul artei.',
  'El rincón de las construcciones estará listo muy pronto.': 'Colțul construcțiilor va fi gata în curând.',
  'El rincón de la lógica estará listo muy pronto.': 'Colțul logicii va fi gata în curând.',
  'El rincón del arte estará listo muy pronto.': 'Colțul artei va fi gata în curând.',
  'Construcciones': 'Construcții',
  'Lógica': 'Logică',
  'Arte': 'Artă',
  // los bloques (mundo3d/bloques3d.ts): las formas
  'Cubo': 'Cub',
  'Cilindro': 'Cilindru',
  'Arco': 'Arc',
  'Cono': 'Con',
  'Esfera': 'Sferă',
  'Tejado': 'Acoperiș',
  // los juegos del rincón
  'Copia la torre': 'Copiază turnul',
  'Una casa': 'O casă',
  '¿Cuántos hay?': 'Câte sunt?',
  'Libre': 'Liber',
  '¡Al jardín!': 'În grădină!',
  '¡El rincón de las construcciones! Elige un juego.': 'Colțul construcțiilor! Alege un joc.',
  '¡Vamos a copiar la torre! Mira el modelo y pon los bloques en el mismo orden, de abajo arriba.':
    'Hai să copiem turnul! Uită-te la model și pune piesele în aceeași ordine, de jos în sus.',
  '¡Nuestro amigo necesita una casa! Haz las dos paredes con cubos o cilindros, y después pon el tejado.':
    'Prietenul nostru are nevoie de o casă! Fă cei doi pereți cu cuburi sau cilindri, apoi pune acoperișul.',
  '¡Construye lo que quieras! Toca dónde poner los bloques y elige las formas. Cuando acabes, llévalo al jardín de Tito.':
    'Construiește ce vrei! Atinge unde să pui piesele și alege formele. Când termini, du-l în grădina lui Tito.',
  // pedir la forma que va al copiar
  'Mira el modelo: ahora va el cubo.': 'Uită-te la model: acum vine cubul.',
  'Mira el modelo: ahora va el cilindro.': 'Uită-te la model: acum vine cilindrul.',
  'Mira el modelo: ahora va el arco.': 'Uită-te la model: acum vine arcul.',
  'Mira el modelo: ahora va el cono.': 'Uită-te la model: acum vine conul.',
  'Mira el modelo: ahora va la esfera.': 'Uită-te la model: acum vine sfera.',
  'Mira el modelo.': 'Uită-te la model.',
  // contar
  '¿Cuántos bloques hay en la torre? Cuéntalos y toca el número.':
    'Câte piese sunt în turn? Numără-le și atinge numărul.',
  '¿Cuántos cubos hay en la torre? Cuéntalos y toca el número.':
    'Câte cuburi sunt în turn? Numără-le și atinge numărul.',
  '¿Cuántos cilindros hay en la torre? Cuéntalos y toca el número.':
    'Câți cilindri sunt în turn? Numără-i și atinge numărul.',
  '¿Cuántos arcos hay en la torre? Cuéntalos y toca el número.':
    'Câte arcuri sunt în turn? Numără-le și atinge numărul.',
  '¡Cuéntalos otra vez, despacito!': 'Mai numără o dată, încetișor!',
  '¡Muy bien! Son {n}.': 'Foarte bine! Sunt {n}.',
  // lo que pasa al poner bloques
  '¡Esta torre ya está muy alta!': 'Turnul ăsta e deja foarte înalt!',
  'Encima de la esfera no se sostiene nada: ¡ha rodado!': 'Pe sferă nu stă nimic: s-a rostogolit!',
  'Encima del cono no se sostiene nada: ¡se ha caído!': 'Pe con nu stă nimic: a căzut!',
  '¡Igualita que el modelo! ¡Qué bien copiada!': 'Exact ca modelul! Ce bine l-ai copiat!',
  'Primero hay que terminar las dos paredes.': 'Întâi trebuie terminați cei doi pereți.',
  '¡Qué casa tan bonita! Ya tiene dónde vivir.': 'Ce casă frumoasă! Acum are unde să locuiască.',
  'Para las paredes, mejor cubos o cilindros: son rectos.': 'Pentru pereți, mai bine cuburi sau cilindri: sunt drepți.',
  'Las paredes ya están. ¡Ahora el tejado!': 'Pereții sunt gata. Acum acoperișul!',
  'Primero construye algo.': 'Întâi construiește ceva.',
  '¡Lo llevamos al jardín de Tito! Míralo en el mapa, al lado de su casa.':
    'Îl ducem în grădina lui Tito! Uită-te pe hartă, lângă casa lui.',
};
