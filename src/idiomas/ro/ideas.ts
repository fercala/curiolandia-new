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
};
