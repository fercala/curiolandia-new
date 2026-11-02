/*
 * contenido/casa.ts: lo que dice Tito al jugar con cada objeto de su casa (fase C2 de docs/PLAN-CASA.md). Una frase
 * corta por objeto, la que dice cuando llega hasta él y hace su reacción (REACCIONES en dominio/casa.ts). Habla Tito,
 * en castellano de España. Las mascotas no están: al tocarlas, Tito dice su nombre (y desde la fase C6, se cuidan).
 * Es CONTENIDO: solo datos, sin dibujo ni S. El catálogo de frases (npm run dialogos) las recoge de aquí.
 * Pruebas: tests/unidad/casa.test.ts (que cada objeto con reacción tiene su frase).
 * Exporta: FRASES_CASA.
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
