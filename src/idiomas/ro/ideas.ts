/*
 * idiomas/ro/ideas.ts: los textos en rumano de la PR de todas las ideas pendientes (v0.2.180, docs/IDEAS-MEJORA.md):
 * el rincón de la lógica, el diario de Tito, el taller de experimentos, el estudio de arte, el modo reto, el corral de
 * Tito, los encargos de los vecinos, las misiones del día, los perfiles, «Jugar juntos» y lo demás. Borrador de Claude
 * para que lo revise una persona que hable rumano (docs/PLAN-IDIOMAS.md, ID9). Va del texto en castellano, tal como
 * está en el código, a su traducción; textos.ts junta esta tabla con las demás.
 * Exporta: IDEAS_RO. No importa nada.
 */

/** Los textos de las ideas de la v0.2.180, del castellano al rumano. */
export const IDEAS_RO: Readonly<Record<string, string>> = {
  // el diario de Tito (idea 35)
  'Terminamos un juego en una casita y ganamos una estrella.':
    'Am terminat un joc într-o căsuță și am câștigat o stea.',
  'Fuimos de excursión en el autobús del cole.': 'Am fost în excursie cu autobuzul grădiniței.',
  'Leímos un cuento y elegimos qué pasaba.': 'Am citit o poveste și am ales ce se întâmplă.',
  'Programamos a Tito para llegar hasta la fresa.': 'L-am programat pe Tito să ajungă la căpșună.',
  'Construimos con bloques en el cole.': 'Am construit cu cuburi la grădiniță.',
  'Resolvimos un juego del rincón de la lógica.': 'Am rezolvat un joc din colțul logicii.',
  'Hicimos un experimento en el taller de ciencias.': 'Am făcut un experiment în atelierul de științe.',
  'Pintamos y tocamos música en el estudio de arte.': 'Am pictat și am cântat în atelierul de artă.',
  'Cuidamos a los animales del corral de Tito.': 'Am avut grijă de animalele din curtea lui Tito.',
  'Jugamos juntos a las parejas, por turnos.': 'Ne-am jucat împreună cu perechile, pe rând.',
  'Ayudamos a un vecino con su encargo.': 'Am ajutat un vecin cu o treabă.',
  'Jugamos en el patio del cole.': 'Ne-am jucat în curtea grădiniței.',
  '¿Te acuerdas de ayer? Mira lo que hicimos:': 'Îți amintești de ieri? Uite ce am făcut:',
  'Lo tienes todo en el diario de mi casa.': 'Ai totul în jurnalul din căsuța mea.',
  'Mi diario aún está vacío. ¡Vamos a jugar juntos y lo llenamos!':
    'Jurnalul meu e încă gol. Hai să ne jucăm împreună și îl umplem!',
  'El diario de Tito': 'Jurnalul lui Tito',
  // el rincón de la lógica (idea 29)
  'Sudoku de dibujos': 'Sudoku cu desene',
  '¿Qué falta?': 'Ce lipsește?',
  'Las diferencias': 'Diferențele',
  'La balanza': 'Balanța',
  'El tangram': 'Tangramul',
  '¡Muy bien! Lo has resuelto.': 'Foarte bine! L-ai rezolvat.',
  '¡El rincón de la lógica! Elige un juego.': 'Colțul logicii! Alege un joc.',
  'Pon cada fruta en un hueco. En cada fila y en cada columna, una de cada.':
    'Pune fiecare fruct într-un loc gol. Pe fiecare rând și pe fiecare coloană, câte unul din fiecare.',
  'Primero toca una fruta de abajo.': 'Mai întâi atinge un fruct de jos.',
  'Esa fruta ya está en esa fila o en esa columna. Prueba otra.':
    'Fructul acesta e deja pe rândul sau pe coloana aceea. Încearcă altul.',
  'Mira bien los dibujos. ¡Voy a esconder uno!': 'Uită-te bine la desene. Ascund unul!',
  '¿Qué dibujo falta?': 'Ce desen lipsește?',
  'No, ese sí estaba. Mira otra vez.': 'Nu, acela era. Mai uită-te o dată.',
  'Los dos dibujos parecen iguales, pero no lo son. Toca en el de la derecha lo que es distinto.':
    'Cele două desene par la fel, dar nu sunt. Atinge în cel din dreapta ce e diferit.',
  '¡Una diferencia!': 'O diferență!',
  'Pon bloques en el otro platillo hasta que la balanza quede recta.':
    'Pune cuburi pe celălalt taler până când balanța stă dreaptă.',
  '¿Qué pesa más? Toca el lado que pesa más.': 'Ce cântărește mai mult? Atinge partea mai grea.',
  '¡Mira la balanza! Pesa más el otro lado.': 'Uită-te la balanță! Cealaltă parte e mai grea.',
  'Toca una pieza y luego su sitio en la figura.': 'Atinge o piesă și apoi locul ei în figură.',
  'Esa pieza no va ahí. Mira la forma.': 'Piesa aceasta nu merge acolo. Uită-te la formă.',
  // el taller de experimentos (idea 30)
  '¡El rojo y el amarillo hacen el naranja!': 'Roșul și galbenul fac portocaliul!',
  '¡El amarillo y el azul hacen el verde!': 'Galbenul și albastrul fac verdele!',
  '¡El rojo y el azul hacen el morado!': 'Roșul și albastrul fac movul!',
  'El sol calienta el agua del mar.': 'Soarele încălzește apa mării.',
  'El agua sube al cielo y forma las nubes.': 'Apa urcă la cer și formează norii.',
  'De las nubes cae la lluvia.': 'Din nori cade ploaia.',
  'La lluvia baja por el río y vuelve al mar.': 'Ploaia coboară pe râu și se întoarce în mare.',
  'Ciencias': 'Științe',
  'El taller de ciencias.': 'Atelierul de științe.',
  'El taller de ciencias estará listo muy pronto.': 'Atelierul de științe va fi gata foarte curând.',
  'El taller de ciencias': 'Atelierul de științe',
  '¡El taller de ciencias! Elige un experimento.': 'Atelierul de științe! Alege un experiment.',
  'Los imanes': 'Magneții',
  'Se pega': 'Se lipește',
  'No se pega': 'Nu se lipește',
  'Las sombras': 'Umbrele',
  'El ciclo del agua': 'Circuitul apei',
  'La semilla': 'Sămânța',
  'Toca dos botes de pintura para mezclarlos. ¿Qué color saldrá?':
    'Atinge două borcane cu vopsea ca să le amesteci. Ce culoare iese?',
  'Con el mismo color sale el mismo color. Prueba con otro.':
    'Din aceeași culoare iese aceeași culoare. Încearcă alta.',
  '¡Se pega! Es de metal y el imán lo atrae.': 'Se lipește! E din metal și magnetul îl atrage.',
  'No se pega. El imán solo atrae el metal.': 'Nu se lipește. Magnetul atrage doar metalul.',
  '¡Sorpresa! Se pega, porque es de metal y el imán lo atrae.':
    'Surpriză! Se lipește, pentru că e din metal și magnetul îl atrage.',
  '¡Sorpresa! No se pega, porque el imán solo atrae el metal.':
    'Surpriză! Nu se lipește, pentru că magnetul atrage doar metalul.',
  '¿El imán atraerá este objeto? Toca «Se pega» o «No se pega» y lo probamos.':
    'Magnetul va atrage obiectul acesta? Atinge «Se lipește» sau «Nu se lipește» și încercăm.',
  '¡Muy bien! Ya sabes qué cosas atrae el imán.': 'Foarte bine! Acum știi ce lucruri atrage magnetul.',
  'La lámpara da sombra al objeto. ¿Cuál es su sombra? Tócala en la pared.':
    'Lampa face umbră obiectului. Care e umbra lui? Atinge-o pe perete.',
  'Esa sombra tiene otra forma. Mira bien el objeto.': 'Umbra aceea are altă formă. Uită-te bine la obiect.',
  '¡Muy bien! La sombra tiene la misma forma que el objeto.': 'Foarte bine! Umbra are aceeași formă ca obiectul.',
  '¡Esa es! La sombra tiene su misma forma.': 'Asta e! Umbra are aceeași formă.',
  '¿Cómo viaja el agua? Toca los dibujos en orden, empezando por el sol.':
    'Cum călătorește apa? Atinge desenele în ordine, începând cu soarele.',
  'Eso pasa más tarde. ¿Qué pasa antes?': 'Asta se întâmplă mai târziu. Ce se întâmplă înainte?',
  '¡Y vuelta a empezar! El agua siempre da la vuelta.': 'Și o ia de la capăt! Apa face mereu înconjurul.',
  '¡Ha salido un brote! Mañana la regamos otra vez.': 'A ieșit un mugur! Mâine o udăm din nou.',
  '¡Ya es una plantita con hojas! Sigue regándola otros días.': 'Acum e o plăntuță cu frunze! Ud-o și în alte zile.',
  '¡Ha salido una flor! Las plantas crecen con agua, sol y tiempo.':
    'A ieșit o floare! Plantele cresc cu apă, soare și timp.',
  '¡Nuestra planta ya tiene flor! Puedes seguir regándola.':
    'Planta noastră are deja floare! Poți s-o uzi în continuare.',
  'Esta es nuestra semilla. Riégala con la regadera y vuelve otros días para ver cómo crece.':
    'Aceasta e sămânța noastră. Ud-o cu stropitoarea și vino și în alte zile să vezi cum crește.',
  'Hoy ya la hemos regado. Vuelve mañana para ver cómo crece.': 'Azi am udat-o deja. Vino mâine să vezi cum crește.',
  '¡Glu, glu! Ya tiene agua. Mañana la regamos otra vez.': 'Glu, glu! Are apă. Mâine o udăm din nou.',
};
