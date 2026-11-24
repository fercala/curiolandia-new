/*
 * idiomas/ro/programa.ts: los textos en rumano de «Programa a Tito», el rincón de la lógica del cole (fase P32 de
 * docs/IDEAS-MEJORA.md: mundo3d/programa3d.ts). Borrador de Claude para que lo revise una persona que hable rumano
 * (docs/PLAN-IDIOMAS.md, ID9). Va del texto en castellano, tal como está en el código, a su traducción; textos.ts junta
 * esta tabla con las demás.
 * Exporta: PROGRAMA_RO. No importa nada.
 */

/** Los textos de «Programa a Tito», del castellano al rumano. */
export const PROGRAMA_RO: Readonly<Record<string, string>> = {
  'Programa a Tito': 'Programează-l pe Tito',
  '¡Vamos!': 'Hai!',
  Borrar: 'Șterge',
  '¡Vamos a programar a Tito! Pon flechas para llevarlo hasta la fresa y pulsa «¡Vamos!».':
    'Hai să-l programăm pe Tito! Pune săgeți ca să-l duci până la căpșună și apasă «Hai!».',
  'Las flechas curvas hacen que Tito se gire, sin moverse de su casilla.':
    'Săgețile curbe îl fac pe Tito să se întoarcă, fără să plece din pătrățelul lui.',
  'La tarjeta «por dos» repite la tarjeta de antes. ¡Cuidado con las rocas!':
    'Cartonașul «de două ori» repetă cartonașul de dinainte. Atenție la pietre!',
  'Adelante.': 'Înainte.',
  'Gira a la izquierda.': 'Întoarce-te la stânga.',
  'Gira a la derecha.': 'Întoarce-te la dreapta.',
  'Otra vez la de antes.': 'Încă o dată cel de dinainte.',
  '¡Ay! Tito se ha chocado con una roca. Toca la tarjeta roja para quitarla.':
    'Au! Tito s-a lovit de o piatră. Atinge cartonașul roșu ca să-l scoți.',
  '¡Uy! Por ahí Tito se sale del tablero. Toca la tarjeta roja para quitarla.':
    'Uf! Pe acolo Tito iese de pe tablă. Atinge cartonașul roșu ca să-l scoți.',
  'Tito no ha llegado a la fresa todavía. Pon más tarjetas.': 'Tito n-a ajuns încă la căpșună. Mai pune cartonașe.',
  'Ya no caben más tarjetas. Pulsa «¡Vamos!».': 'Nu mai încap cartonașe. Apasă «Hai!».',
  'Primero pon alguna flecha para Tito.': 'Mai întâi pune o săgeată pentru Tito.',
  '¡Muy bien! Tito ha llegado a la fresa. ¡Vamos con otra!': 'Foarte bine! Tito a ajuns la căpșună. Hai cu încă una!',
  '¡Qué bien programas! Tito se ha comido todas las fresas.': 'Ce bine programezi! Tito a mâncat toate căpșunile.',
};
