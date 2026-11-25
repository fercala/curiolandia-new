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
  // el estudio de arte (idea 31)
  'El estudio de arte': 'Atelierul de artă',
  '¡El estudio de arte! ¿Pintamos o hacemos música?': 'Atelierul de artă! Pictăm sau facem muzică?',
  'Pintura de espejo': 'Pictura în oglindă',
  'Compón una canción': 'Compune un cântec',
  'Elige un color y pinta en el cuadro. ¡Lo que pintes en un lado sale también en el otro, como en un espejo!':
    'Alege o culoare și pictează în tablou. Ce pictezi într-o parte apare și în cealaltă, ca într-o oglindă!',
  'Colgar en la casa': 'Agață-l în căsuță',
  'Primero pinta algo en el cuadro.': 'Mai întâi pictează ceva în tablou.',
  '¡Qué cuadro tan bonito! Lo colgamos en la pared del salón de mi casa.':
    'Ce tablou frumos! Îl agățăm pe peretele din sufrageria căsuței mele.',
  'Toca las láminas del xilófono para hacer tu canción. Luego toca «Escuchar».':
    'Atinge lamelele xilofonului ca să-ți faci cântecul. Apoi atinge «Ascultă».',
  'Escuchar': 'Ascultă',
  'Guardar': 'Păstrează',
  'La canción ya está llena. Toca «Escuchar» o «Borrar».': 'Cântecul e plin. Atinge «Ascultă» sau «Șterge».',
  'Primero toca unas notas del xilófono.': 'Mai întâi cântă câteva note la xilofon.',
  '¡Qué canción tan bonita! Sonará cuando toques el cuadro de mi salón.':
    'Ce cântec frumos! Va suna când atingi tabloul din sufrageria mea.',
  '¡Nuestro cuadro y nuestra canción del estudio de arte!': 'Tabloul și cântecul nostru din atelierul de artă!',
  'Este cuadro lo pintamos en el estudio de arte.': 'Tabloul acesta l-am pictat în atelierul de artă.',
  // el modo reto (idea 32)
  'Modo reto': 'Modul provocare',
  'Volvemos a jugar como siempre.': 'Ne jucăm din nou ca de obicei.',
  '¡Modo reto! Más opciones, más rondas y sin ayudas. Cada juego superado da una estrella dorada.':
    'Modul provocare! Mai multe variante, mai multe runde și fără ajutor. Fiecare joc reușit îți dă o stea de aur.',
  'Reto': 'Provocare',
  '¡Reto superado! Has ganado una estrella dorada.': 'Provocare reușită! Ai câștigat o stea de aur.',
  // el corral de Tito (idea 33)
  'Tiene hambre. Dale trigo.': 'Îi e foame. Dă-i grâu.',
  'Tiene sed. Dale el cubo de agua.': 'Îi e sete. Dă-i găleata cu apă.',
  'Quiere que lo cepilles.': 'Vrea să-l periezi.',
  '¡Hoy ya están todos contentos! Puedes vender los productos en el mercado.':
    'Azi sunt toți mulțumiți! Poți vinde produsele la piață.',
  '¡Este es mi corral! Mira qué pide cada animal: toca la cosa de abajo y luego el animal.':
    'Aceasta e curtea mea! Uită-te ce cere fiecare animal: atinge lucrul de jos și apoi animalul.',
  'Vender': 'Vinde',
  '¡Hemos vendido todo en el mercado! Cada cosa vale una moneda.':
    'Am vândut totul la piață! Fiecare lucru valorează o monedă.',
  'Este ya está contento. Mañana pedirá otra cosa.': 'Acesta e deja mulțumit. Mâine va cere altceva.',
  'Para traer la vaca al corral hacen falta {n} monedas.': 'Ca să aducem vaca în curte, e nevoie de {n} monede.',
  '¡Ya tenemos una vaca en el corral!': 'Avem o vacă în curte!',
  'Para traer la oveja al corral hacen falta {n} monedas.': 'Ca să aducem oaia în curte, e nevoie de {n} monede.',
  '¡Ya tenemos una oveja en el corral!': 'Avem o oaie în curte!',
  '¡Gracias! La gallina ha puesto un huevo.': 'Mulțumesc! Găina a făcut un ou.',
  '¡Gracias! La vaca nos da leche.': 'Mulțumesc! Vaca ne dă lapte.',
  '¡Gracias! Con la leche de la oveja hacemos queso.': 'Mulțumesc! Din laptele oii facem brânză.',
  // los encargos de los vecinos (idea 34)
  'El cartero nos ha dado una carta para el cole. ¿La llevamos? Toca el cole en el mapa.':
    'Poștașul ne-a dat o scrisoare pentru grădiniță. O ducem? Atinge grădinița pe hartă.',
  '¡Ya hemos dejado la carta en el cole! Gracias por ayudar al cartero.':
    'Am lăsat scrisoarea la grădiniță! Mulțumesc că l-ai ajutat pe poștaș.',
  'El panadero nos ha dado pan para la merienda. ¿Lo llevamos a mi casa?':
    'Brutarul ne-a dat pâine pentru gustare. O ducem la căsuța mea?',
  '¡Ya tenemos el pan en casa! Gracias por ayudar al panadero.':
    'Avem pâinea acasă! Mulțumesc că l-ai ajutat pe brutar.',
  'La granjera quiere vender zanahorias en la tienda. ¿Se las llevamos?':
    'Fermiera vrea să vândă morcovi la magazin. I-i ducem?',
  '¡Las zanahorias ya están en la tienda! Gracias por ayudar a la granjera.':
    'Morcovii sunt deja la magazin! Mulțumesc că ai ajutat-o pe fermieră.',
  'La maestra se ha dejado un libro. ¿Se lo llevamos a las clases del cole?':
    'Educatoarea și-a uitat o carte. I-o ducem la clasele grădiniței?',
  '¡La maestra ya tiene su libro! Gracias por ayudarla.': 'Educatoarea are cartea ei! Mulțumesc că ai ajutat-o.',
  'La frutera nos ha regalado fresas. ¿Las llevamos a mi casa?':
    'Vânzătoarea de fructe ne-a dăruit căpșuni. Le ducem la căsuța mea?',
  '¡Qué ricas las fresas en casa! Gracias por ayudar a la frutera.':
    'Ce gustoase sunt căpșunile acasă! Mulțumesc că ai ajutat-o pe vânzătoarea de fructe.',
  // las misiones del día (idea 36)
  'Termina un juego en una casita.': 'Termină un joc într-o căsuță.',
  'Juega en el patio del cole.': 'Joacă-te în curtea grădiniței.',
  'Resuelve un juego del rincón de la lógica.': 'Rezolvă un joc din colțul logicii.',
  'Haz un experimento en el taller de ciencias.': 'Fă un experiment în atelierul de științe.',
  'Pinta o haz música en el estudio de arte.': 'Pictează sau fă muzică în atelierul de artă.',
  'Lee un cuento y elige qué pasa.': 'Citește o poveste și alege ce se întâmplă.',
  'Ve de excursión en el autobús del cole.': 'Mergi în excursie cu autobuzul grădiniței.',
  'Esta semana es la semana del mar.': 'Săptămâna aceasta e săptămâna mării.',
  'Esta semana es la semana de los bichos.': 'Săptămâna aceasta e săptămâna gâzelor.',
  'Esta semana es la semana de la granja.': 'Săptămâna aceasta e săptămâna fermei.',
  'Esta semana es la semana del espacio.': 'Săptămâna aceasta e săptămâna spațiului.',
  '¡Has cumplido las tres misiones de hoy! ¡Muy bien!': 'Ai îndeplinit cele trei misiuni de azi! Foarte bine!',
  'Estas son las misiones de hoy:': 'Acestea sunt misiunile de azi:',
  'Las misiones de hoy': 'Misiunile de azi',
  '¡Has cumplido las tres misiones de hoy! Te doy cinco monedas.':
    'Ai îndeplinit cele trei misiuni de azi! Îți dau cinci monede.',
  '¡Y como es viernes, la pegatina de la semana!': 'Și pentru că e vineri, abțibildul săptămânii!',
  // los perfiles (idea 38)
  '¿Quién juega hoy? Toca tu nombre.': 'Cine se joacă azi? Atinge-ți numele.',
  'Varios niños': 'Mai mulți copii',
  'Hasta tres niños pueden jugar en este móvil, cada uno con su partida. Al empezar a jugar, Tito pregunta quién juega.':
    'Până la trei copii se pot juca pe acest telefon, fiecare cu jocul lui. La început, Tito întreabă cine se joacă.',
  'Juega ahora': 'Se joacă acum',
  'Jugar con este perfil': 'Joacă cu acest profil',
  'Nombre del niño nuevo': 'Numele copilului nou',
  'Añadir un niño': 'Adaugă un copil',
  // jugar juntos (idea 39)
  'Le toca al jugador de Tito.': 'E rândul celui care joacă cu Tito.',
  'Le toca al jugador de Lupi.': 'E rândul celui care joacă cu Lupi.',
  '¡Vamos a jugar juntos a las parejas! Uno juega con Tito y el otro con Lupi, por turnos.':
    'Hai să ne jucăm împreună cu perechile! Unul joacă cu Tito și celălalt cu Lupi, pe rând.',
  '¡Lo habéis hecho juntos!': 'Ați reușit împreună!',
  '¡Pareja! Sigue jugando el mismo.': 'Pereche! Joacă tot el, mai departe.',
  '¡Habéis encontrado todas las parejas! Jugar juntos es más divertido.':
    'Ați găsit toate perechile! E mai distractiv să vă jucați împreună.',
  'Ficha de trazos': 'Fișă cu trasee',
  'Ficha para recortar y pegar': 'Fișă de decupat și lipit',
  'Repasa las líneas de puntos con el lápiz, sin levantarlo.':
    'Trage cu creionul peste liniile punctate, fără să-l ridici.',
  'Recorta los dibujos por la línea de puntos y pégalos encima de su sombra.':
    'Decupează desenele pe linia punctată și lipește-le peste umbra lor.',
  'Juegos de las casitas': 'Jocurile din căsuțe',
  'Cuentos con decisiones': 'Povești în care alegi',
  'Construir con bloques': 'Construcții cu cuburi',
  'Rincón de la lógica': 'Colțul logicii',
  'Taller de ciencias': 'Atelierul de științe',
  'Estudio de arte': 'Atelierul de artă',
  'Corral de la granja': 'Ograda fermei',
  'Jugar juntos': 'Joacă împreună',
  'Encargos de los vecinos': 'Comisioanele vecinilor',
  'Juegos del patio': 'Jocurile din curte',
  'La semana': 'Săptămâna',
  'Compartir con la profe': 'Trimite educatoarei',
  'Esta semana todavía no ha jugado.': 'Săptămâna aceasta nu s-a jucat încă.',
  'Minutos de juego en los últimos 7 días: {n}.': 'Minute de joacă în ultimele 7 zile: {n}.',
  'Días que ha jugado: {n} de 7.': 'Zile în care s-a jucat: {n} din 7.',
  'Lo que mejor se le da: {h}.': 'Ce îi iese cel mai bine: {h}.',
  'Lo que más le cuesta: {h}. Para reforzarlo en casa, jugad juntos a lo mismo con cosas de casa, sin pantalla.':
    'Ce îi vine cel mai greu: {h}. Ca să exersați acasă, jucați-vă împreună la fel, cu lucruri din casă, fără ecran.',
  'Lo que ha hecho esta semana:': 'Ce a făcut săptămâna aceasta:',
  'Informe semanal de {nombre} en Curiolandia': 'Raportul săptămânal al lui {nombre} în Curiolandia',
  'Informe copiado: ya se puede pegar en un mensaje.': 'Raport copiat: acum îl puteți lipi într-un mesaj.',
  'No se ha podido copiar el informe.': 'Raportul nu a putut fi copiat.',
  'Para jugar, toca las cosas con el dedo. ¡Toca la estrella!':
    'Ca să te joci, atinge lucrurile cu degetul. Atinge steaua!',
  'Algunas cosas se arrastran. Pon el dedo en la manzana y llévala al cubo.':
    'Unele lucruri se trag cu degetul. Pune degetul pe măr și du-l în găleată.',
  'El botón verde sirve para seguir. ¡Tócalo!': 'Butonul verde e ca să mergem mai departe. Atinge-l!',
  'Si no sabes qué hacer, tócame y te lo repito. ¡Tócame!':
    'Dacă nu știi ce să faci, atinge-mă și îți spun din nou. Atinge-mă!',
  '¡Muy bien! Ya sabes jugar. ¡Vamos al mapa!': 'Foarte bine! Acum știi să te joci. Hai la hartă!',
  'Fluidez del 3D': 'Fluiditatea 3D',
  'Este aparato juega sin 3D.': 'Acest dispozitiv se joacă fără 3D.',
  'Última medida: {n} cuadros por segundo. Nitidez: {p} %.':
    'Ultima măsurătoare: {n} cadre pe secundă. Claritate: {p} %.',
  'Todavía no hay medida: se mide sola al jugar en el mapa o en otra escena en 3D.':
    'Încă nu există o măsurătoare: se face singură când vă jucați pe hartă sau în altă scenă 3D.',
  'Las sombras van en modo ligero para que el juego vaya más fluido.':
    'Umbrele sunt în modul ușor, ca jocul să meargă mai fluid.',
  'Si el aparato va lento, el juego baja la nitidez y, si hace falta, aligera las sombras él solo.':
    'Dacă dispozitivul merge greu, jocul scade singur claritatea și, dacă e nevoie, simplifică umbrele.',
};
