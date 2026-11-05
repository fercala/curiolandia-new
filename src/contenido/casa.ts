/*
 * contenido/casa.ts: lo que dice Tito al jugar con cada objeto de su casa (fase C2 de docs/PLAN-CASA.md). Una frase
 * corta por objeto, la que dice cuando llega hasta él y hace su reacción (REACCIONES en dominio/casa.ts). Habla Tito,
 * en castellano de España. Las mascotas no están: al tocarlas, Tito dice su nombre (y desde la fase C6, se cuidan).
 * Es CONTENIDO: solo datos, sin dibujo ni S. El catálogo de frases (npm run dialogos) las recoge de aquí.
 * Pruebas: tests/unidad/casa.test.ts (que cada objeto con reacción tiene su frase).
 * Desde la fase C3, también los sitios de la escena Vuelta al mundo (LUGARES), con sus dibujos y su frase.
 * Desde la fase C7, lo que dice Tito al descubrir cada combinación de dos objetos (FRASES_COMBINACION).
 * Exporta: FRASES_CASA, el tipo LugarMundo, LUGARES y FRASES_COMBINACION.
 * No importa nada.
 */

// FRASES_CASA: id del objeto (el de la tienda, SHOP) → lo que dice Tito al jugar con él. Por habitación, como en la
// tabla de docs/PLAN-CASA.md.
export const FRASES_CASA: Readonly<Record<string, string>> = {
  // torre de las estrellas
  telescopio: '¡Cuántas estrellas se ven por mi telescopio!',
  tierra: '¡Mira cómo gira la Tierra! Aquí vivimos todos.',
  saturno: 'Saturno es un planeta con anillos. ¡Cómo giran!',
  cohete: '¡Tres, dos, uno... despegamos!',
  // salón
  sofa: '¡Qué blandito es mi sofá!',
  tele: '¡Vamos a ver dibujos!',
  alfombra: '¡Voy a hacer la croqueta!',
  cuadro: '¡Qué cuadro tan bonito!',
  plantaInterior: 'Mi planta está muy verde. ¡Le ha salido una hoja!',
  lampara: '¡Luz! ¿Encendida o apagada?',
  banco: 'Me siento un ratito a descansar.',
  estanteria: '¡Cuántos libros! Me encanta leer.',
  reloj: 'Tic, tac, tic, tac. ¡Cuco!',
  farol: '¡El farol ya da luz!',
  piano: '¡Escucha mi canción!',
  fuente: '¡Los pajaritos vienen a beber agua!',
  // dormitorio
  cama: 'Uaaah... ¡Qué sueño! Me echo una siesta.',
  baul: '¿Qué habrá dentro del baúl? ¡Una sorpresa!',
  cuento: '¡Me encanta este cuento!',
  estrellas: '¡Mis estrellas brillan en el techo!',
  // cocina
  mesa: '¡A la mesa! Ya tengo hambre.',
  silla: 'Me siento en mi silla.',
  nevera: '¡Qué fresquita está la fruta!',
  olla: 'Remuevo la sopa. ¡Qué bien huele!',
  tarta: '¡Soplo las velas! ¡Fiuuu!',
  // baño
  banera: '¡Al agua! ¡Me encanta bañarme!',
  toalla: '¡Ya estoy sequito!',
  jabon: '¡Cuántas burbujas!',
  pato: '¡Cuac, cuac! Hola, patito.',
  // cuarto de juegos
  pelotaPlaya: '¡Chuto la pelota! ¡Goool!',
  bloques: '¡Una torre muy alta! ¡Oh, se cae!',
  peluche: '¡Un abrazo muy fuerte!',
  cometa: '¡Mi cometa vuela muy alto!',
  xilofono: '¡Do, re, mi, fa, sol!',
  muneca: '¡Vamos a bailar!',
  robot: 'Bip, bup. ¡El robot baila conmigo!',
  trenJuguete: '¡Chu, chu! ¡Viajeros al tren!',
  guitarra: '¡Toco la guitarra!',
  tambor: '¡Pum, pum, pum!',
  pizarra: '¡Dibujo un caracol en la pizarra!',
  pinturas: '¡Pinto de muchos colores!',
  globo: 'Lo inflo, lo inflo... ¡Pum!',
  tobogan: '¡Allá voy! ¡Yupi!',
  // jardín
  arbol: '¡Mira cómo caen las hojas!',
  plantaFlor: '¡Riego mi flor para que crezca!',
  regadera: '¡A regar el jardín!',
  columpio: '¡Más alto, más alto!',
  castillo: '¡Mi castillo ya tiene bandera!',
  piscina: '¡Al agua, patos!',
};

/** Un sitio del mundo de la escena Vuelta al mundo (el globo terráqueo): su nombre, sus dibujos (claves de PICS), el
 *  color de su tarjeta y lo que dice Tito. */
export interface LugarMundo {
  readonly id: string;
  readonly n: string;
  readonly pics: readonly string[];
  readonly color: string;
  readonly frase: string;
}

// LUGARES: los sitios que salen al girar el globo terráqueo (fase C3), en orden; España, la primera.
export const LUGARES: readonly LugarMundo[] = [
  {
    id: 'espana',
    n: 'España',
    pics: ['castillo', 'sol'],
    color: '#FFE08A',
    frase: '¡España! Aquí vivimos nosotros. Hay castillos y hace mucho sol.',
  },
  {
    id: 'poloNorte',
    n: 'El Polo Norte',
    pics: ['osoPolar', 'iglu'],
    color: '#DDF3FB',
    frase: '¡El Polo Norte! Hace mucho frío. Aquí vive el oso polar.',
  },
  {
    id: 'africa',
    n: 'África',
    pics: ['leon', 'jirafa', 'elefante'],
    color: '#FFD9A0',
    frase: '¡África! Aquí viven el león, la jirafa y el elefante.',
  },
  {
    id: 'mar',
    n: 'El mar',
    pics: ['ballena'],
    color: '#BDE6F7',
    frase: '¡El mar! Casi toda la Tierra es agua. Aquí vive la ballena.',
  },
  {
    id: 'desierto',
    n: 'El desierto',
    pics: ['camello', 'cactus'],
    color: '#FBE3B4',
    frase: '¡El desierto! Hay mucha arena y muy poca agua. Aquí vive el camello.',
  },
  {
    id: 'poloSur',
    n: 'El Polo Sur',
    pics: ['pinguino'],
    color: '#E6F0FA',
    frase: '¡El Polo Sur! También hace mucho frío. Aquí viven los pingüinos.',
  },
];

// FRASES_COMBINACION: lo que dice Tito al juntar dos objetos con sorpresa (COMBINACIONES en dominio/casa.ts), por el id
// de la sorpresa ('a+b', como lo da idSorpresa). Desde la fase C7.
export const FRASES_COMBINACION: Readonly<Record<string, string>> = {
  'pato+banera': '¡El patito nada en la bañera! Cuac, cuac.',
  'jabon+banera': '¡Cuántas burbujas de jabón en la bañera!',
  'toalla+banera': '¡La toalla, para secarme al salir del baño!',
  'regadera+plantaFlor': '¡Riego la flor y se pone muy contenta!',
  'regadera+plantaInterior': '¡La planta tenía sed! Ya está regada.',
  'pelotaPlaya+casitaPerro': '¡El perrito va a por la pelota! ¡Qué rápido corre!',
  'cuento+cama': '¡Un cuento en la cama, antes de dormir!',
  'sofa+tele': '¡A ver la tele desde el sofá!',
  'robot+muneca': '¡El robot y la muñeca bailan juntos!',
  'lampara+estrellas': '¡Apago la lámpara y las estrellas brillan en la oscuridad!',
  'telescopio+saturno': '¡Con el telescopio veo los anillos de Saturno!',
  'mesa+silla': '¡Me siento a la mesa! ¿Qué hay de comer?',
  'pinturas+pizarra': '¡Con las pinturas, la pizarra se llena de colores!',
  'trenJuguete+tobogan': '¡El tren baja por el tobogán! ¡Chuuu!',
};
