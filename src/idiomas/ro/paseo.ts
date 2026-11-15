/*
 * idiomas/ro/paseo.ts: los textos en rumano de la gran aventura de Tito (fase P16 de docs/IDEAS-MEJORA.md, desde la
 * v0.2.157, por la regla de Fernando del 15 de noviembre de 2026: toda funcionalidad nueva es multiidioma): el título,
 * los capítulos con sus cuentos y lo que dice Tito en el mapa del tesoro (desde la P16b, también los capítulos 4 a 6 y el
 * gran tesoro). Los tesoros y la cámara de fotos, que también
 * se hacen paseando, están en escenas.ts (fase ID9a). Borrador de Claude para que lo revise una persona que hable rumano
 * (ID9b). Va del texto en castellano, tal como está en el código, a su traducción; textos.ts junta esta tabla con las
 * demás. Las plantillas llevan sus huecos ({n}, {total}).
 * Exporta: PASEO_RO. No importa nada.
 */

/** Los textos de la gran aventura de Tito, del castellano al rumano. */
export const PASEO_RO: Readonly<Record<string, string>> = {
  // la gran aventura de Tito (P16)
  'El mapa del tesoro perdido': 'Harta comorii pierdute',
  'La botella del mar': 'Sticla din mare',
  'Las parejas del bosque': 'Perechile din pădure',
  'Polly y los animales': 'Polly și animalele',
  'Una mañana, Tito paseaba por la playa. ¡Y las olas le trajeron una botella!':
    'Într-o dimineață, Tito se plimba pe plajă. Și valurile i-au adus o sticlă!',
  'Dentro había un trozo de papel. ¡Era un mapa del tesoro! Pero estaba roto en seis trozos.':
    'Înăuntru era o bucată de hârtie. Era o hartă a comorii! Dar era ruptă în șase bucăți.',
  'Una nota decía: «Cuenta las cosas del mar y el primer trozo será tuyo». ¡Vamos a contar!':
    'Un bilet spunea: „Numără lucrurile din mare și prima bucată va fi a ta.” Hai să numărăm!',
  '¡El primer trozo del mapa! ¡Qué emoción!': 'Prima bucată din hartă! Ce emoție!',
  'El trozo del mapa llevó a Tito hasta el bosque. Allí lo esperaba la ardilla.':
    'Bucata de hartă l-a dus pe Tito până în pădure. Acolo îl aștepta veverița.',
  '¡Tengo el segundo trozo! Pero se me han mezclado las cartas de mis amigos del bosque.':
    'Eu am a doua bucată! Dar mi s-au amestecat cărțile cu prietenii mei din pădure.',
  'Ayuda a la ardilla a juntar las parejas. ¡Hay que acordarse de dónde está cada carta!':
    'Ajut-o pe veveriță să găsească perechile. Trebuie să ții minte unde e fiecare carte!',
  '¡El segundo trozo del mapa! Gracias, ardilla.': 'A doua bucată din hartă! Mulțumesc, veveriță.',
  'Con dos trozos, el mapa señalaba una isla lejana. ¡Tito voló hasta allí en globo!':
    'Cu două bucăți, harta arăta o insulă îndepărtată. Tito a zburat până acolo cu balonul!',
  'Era la isla de Polly, la lorita. ¡Hello, Tito! Yo guardo el tercer trozo.':
    'Era insula lui Polly, papagalul. Hello, Tito! Eu păstrez a treia bucată.',
  'Polly dirá animales en inglés. Escucha bien y toca el animal que dice.':
    'Polly va spune animale în engleză. Ascultă bine și atinge animalul pe care îl spune.',
  '¡El tercer trozo del mapa! Thank you, Polly.': 'A treia bucată din hartă! Thank you, Polly.',
  '¡La gran aventura de Tito! Un mapa del tesoro se ha roto en seis trozos. Toca el primer capítulo para empezar.':
    'Marea aventură a lui Tito! O hartă a comorii s-a rupt în șase bucăți. Atinge primul capitol ca să începi.',
  '¡Ya tenemos {n} de {total} trozos del mapa!': 'Avem deja {n} din {total} bucăți din hartă!',
  'Hoy hay un capítulo nuevo. ¡Tócalo para seguir la aventura!':
    'Azi e un capitol nou. Atinge-l ca să continui aventura!',
  'El próximo capítulo se abre mañana.': 'Capitolul următor se deschide mâine.',
  'El próximo capítulo llegará muy pronto.': 'Capitolul următor va veni foarte curând.',
  'Toca un capítulo para jugarlo. Cada día se abre uno nuevo.':
    'Atinge un capitol ca să-l joci. În fiecare zi se deschide unul nou.',
  'Este capítulo se abre mañana. ¡Vuelve mañana para seguir la aventura!':
    'Capitolul acesta se deschide mâine. Vino înapoi mâine ca să continui aventura!',
  'Primero hay que terminar el capítulo de antes.': 'Mai întâi trebuie terminat capitolul dinainte.',
  '¡Este capítulo llegará muy pronto!': 'Capitolul acesta va veni foarte curând!',
  '¡Lo pongo en el mapa del tesoro!': 'O pun pe harta comorii!',
  'Este trozo ya lo tenías. ¡Muy bien jugado!': 'Bucata asta o aveai deja. Foarte bine jucat!',
  // desde la P16b: los capítulos 4 a 6 y el gran tesoro
  'Los dibujos de Lupi': 'Desenele lui Lupi',
  'La montaña nevada': 'Muntele înzăpezit',
  'El tesoro escondido': 'Comoara ascunsă',
  'Con tres trozos, el mapa llevaba al parque. Allí estaba Lupi, muy triste.':
    'Cu trei bucăți, harta ducea în parc. Acolo era Lupi, foarte tristă.',
  'Lupi dijo: «¡El viento ha roto mis dibujos en pedazos!»': 'Lupi a zis: „Vântul mi-a rupt desenele în bucăți!”',
  'Ayuda a Lupi a juntar las piezas de sus dibujos. ¡El cuarto trozo es para quien lo consiga!':
    'Ajut-o pe Lupi să pună la loc piesele desenelor ei. A patra bucată e pentru cine reușește!',
  '¡El cuarto trozo del mapa! Gracias, Lupi.': 'A patra bucată din hartă! Mulțumesc, Lupi.',
  'Con su mochila, Tito subió a la montaña nevada. ¡Qué frío hacía!':
    'Cu rucsacul în spate, Tito a urcat pe muntele înzăpezit. Ce frig era!',
  'Arriba, un muñeco de nieve guardaba una puerta de piedra con formas dibujadas.':
    'Sus, un om de zăpadă păzea o ușă de piatră cu forme desenate.',
  'Para abrir la puerta hay que seguir las series de formas. ¿Qué forma va después?':
    'Ca să deschizi ușa, trebuie să continui șirurile de forme. Ce formă urmează?',
  '¡El quinto trozo del mapa! La puerta se ha abierto.': 'A cincea bucată din hartă! Ușa s-a deschis.',
  'Con cinco trozos, Tito navegó en barco hasta la isla de la cruz roja.':
    'Cu cinci bucăți, Tito a navigat cu barca până la insula cu crucea roșie.',
  'Allí estaba la cruz del mapa. ¡El tesoro tenía que estar enterrado debajo!':
    'Acolo era crucea de pe hartă. Comoara trebuia să fie îngropată dedesubt!',
  'Cava en la arena y encuentra todo lo que hay escondido. ¡Seguro que el último trozo está ahí!':
    'Sapă în nisip și găsește tot ce e ascuns. Sigur ultima bucată e acolo!',
  '¡El último trozo del mapa! ¡Ya está completo!': 'Ultima bucată din hartă! Acum e completă!',
  '¡El mapa del tesoro está completo! Y mira lo que hay en la cruz roja...':
    'Harta comorii e completă! Și uite ce e la crucea roșie...',
  '¡El tesoro! Hay un sombrero de pirata. ¡Me lo pongo!': 'Comoara! E o pălărie de pirat. Mi-o pun!',
  '¡El tesoro! Está lleno de monedas de oro.': 'Comoara! E plină de monede de aur.',
  '¡Encontramos el gran tesoro! Puedes volver a jugar los capítulos cuando quieras.':
    'Am găsit marea comoară! Poți juca din nou capitolele când vrei.',
  '¡Nuestro gran tesoro! Lo encontramos con el mapa completo.': 'Marea noastră comoară! Am găsit-o cu harta completă.',
};
