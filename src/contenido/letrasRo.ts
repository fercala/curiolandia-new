/*
 * contenido/letrasRo.ts: las letras de la Isla de las Letras en rumano (fase ID6a de docs/PLAN-IDIOMAS.md). Son 23, en
 * el orden de la isla: las vocales en la Playa de los Sonidos (3 años), con la Ă y la Î detrás de las cinco de siempre;
 * las mismas nueve consonantes del bosque que en castellano (M P L S T N D F B, 4 años), y en el Pueblo de las Palabras
 * (5 años) R C G V y las propias del rumano: Ș, Ț y Â (la Â suena como la Î, pero va en medio de la palabra).
 * Las letras que también tiene el castellano toman de contenido/letras.ts sus trazos (mayúscula y minúscula) y su color;
 * las nuevas son la letra base con su signo: la breve de la Ă, el circunflejo de la Î y la Â y la coma de abajo de la Ș
 * y la Ț. Cada letra trae su nombre para la voz («litera a»), su amigo y sus palabras: dibujos de PICS cuyo nombre en
 * rumano (idiomas/ro/lex.ts) empieza por ella o, para la Ă, la Ț y la Â, que casi nunca van al principio, la llevan
 * dentro. Las palabras de la C y la G no empiezan por ce, ci, ge ni gi, que suenan de otra manera (son de la ID6c).
 * Borrador de Claude para que lo revise alguien que conozca cómo se enseña a leer en Rumanía (el abecedar).
 * Es CONTENIDO: solo datos, sin dibujo ni S. Pruebas: tests/unidad/letras.test.ts.
 * Exporta: LETRAS_RO. Importa los tipos, letra y arco de contenido/letras.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las coordenadas de los signos son su dibujo: darles nombre no lo haría
   más claro. */
import { ZONA_DE_LETRA, arco, letra, type Letra, type Trazo } from './letras.ts';

const { playa, bosque, pueblo } = ZONA_DE_LETRA;

// base(l): la letra l del castellano (contenido/letras.ts), que tiene que estar.
const base = (l: string): Letra => {
  const x = letra(l);
  if (!x) throw new Error(`falta la letra ${l} en contenido/letras.ts`);
  return x;
};

// Los signos del rumano, en la caja de 1 x 1 de la letra (la y crece hacia abajo). En la mayúscula, la breve y el
// circunflejo van por encima (y negativa, como la tilde de la Ñ) y la coma, por debajo (y un poco mayor que 1); en la
// minúscula, dentro de su caja (MINUS_CAJA: lo alto de las letras pequeñas en 0,4 y la línea de abajo en 0,8).
// BREVE y BREVE_MIN: la breve de la Ă y la ă, una u pequeña de izquierda a derecha.
const BREVE: Trazo = arco(0.5, -0.3, 0.18, 0.12, Math.PI, 0, 12);
const BREVE_MIN: Trazo = arco(0.45, 0.2, 0.14, 0.08, Math.PI, 0, 12);
// CIRCUNFLEJO(x): el sombrerito de la Î y la Â mayúsculas, centrado en x.
const CIRCUNFLEJO = (x: number): Trazo => [
  [x - 0.2, -0.12],
  [x, -0.32],
  [x + 0.2, -0.12],
];
// CIRCUNFLEJO_MIN(x): el de la î y la â minúsculas, por encima de lo alto de las letras pequeñas.
const CIRCUNFLEJO_MIN = (x: number): Trazo => [
  [x - 0.15, 0.32],
  [x, 0.18],
  [x + 0.15, 0.32],
];
// COMA(x): la coma de abajo de la Ș y la Ț mayúsculas, bajo x.
const COMA = (x: number): Trazo => [
  [x + 0.03, 1.05],
  [x - 0.04, 1.17],
];
// COMA_MIN(x): la de la ș y la ț minúsculas, bajo la línea en la que se apoyan.
const COMA_MIN = (x: number): Trazo => [
  [x + 0.03, 0.87],
  [x - 0.04, 0.98],
];

// igual(l, datos): la letra l del castellano, con su nombre, amigo y palabras en rumano y en su zona de la isla rumana.
const igual = (l: string, datos: Pick<Letra, 'nombre' | 'amigo' | 'amigoDice' | 'palabras' | 'zona'>): Letra => ({
  ...base(l),
  ...datos,
});
// conSigno(l, deBase, c, signo, signoMin, datos): la letra nueva l, que es la letra deBase con un signo más en la
// mayúscula (signo) y en la minúscula (signoMin); la î pequeña pierde el punto de la i (su segundo trazo).
const conSigno = (
  l: string,
  deBase: string,
  c: string,
  signo: Trazo,
  signoMin: Trazo,
  datos: Pick<Letra, 'nombre' | 'amigo' | 'amigoDice' | 'palabras' | 'zona'>,
): Letra => {
  const b = base(deBase);
  const minus = deBase === 'I' ? b.minus.slice(0, 1) : b.minus;
  return { ...b, ...datos, l, c, trazos: [...b.trazos, signo], minus: [...minus, signoMin] };
};

// LETRAS_RO: las 23 letras de la isla en rumano, en su orden. No cambies el orden ni la letra de una entrada publicada:
// las casitas de la isla en rumano ('RO-L3-A'...) salen de esta lista.
export const LETRAS_RO: readonly Letra[] = [
  igual('A', {
    nombre: 'litera a',
    amigo: 'abeja',
    amigoDice: 'albină',
    palabras: ['avion', 'autobus', 'pina'],
    zona: playa,
  }),
  igual('E', { nombre: 'litera e', amigo: 'elefante', amigoDice: 'elefant', palabras: ['helicoptero'], zona: playa }),
  igual('I', { nombre: 'litera i', amigo: 'conejo', amigoDice: 'iepuraș', palabras: ['iglu', 'corazon'], zona: playa }),
  igual('O', {
    nombre: 'litera o',
    amigo: 'oveja',
    amigoDice: 'oaie',
    palabras: ['ojo', 'huevo', 'hueso'],
    zona: playa,
  }),
  igual('U', { nombre: 'litera u', amigo: 'oso', amigoDice: 'urs', palabras: ['paraguas', 'oreja'], zona: playa }),
  conSigno('Ă', 'A', '#D9488F', BREVE, BREVE_MIN, {
    nombre: 'litera ă',
    amigo: 'manzana',
    amigoDice: 'măr',
    palabras: ['pato', 'pera'],
    zona: playa,
  }),
  conSigno('Î', 'I', '#3FA7A0', CIRCUNFLEJO(0.5), CIRCUNFLEJO_MIN(0.5), {
    nombre: 'litera î',
    amigo: 'helado',
    amigoDice: 'înghețată',
    palabras: [],
    zona: playa,
  }),
  igual('M', {
    nombre: 'litera m',
    amigo: 'mono',
    amigoDice: 'maimuță',
    palabras: ['mesa', 'caracol', 'zanahoria'],
    zona: bosque,
  }),
  igual('P', {
    nombre: 'litera p',
    amigo: 'pez',
    amigoDice: 'pește',
    palabras: ['pan', 'pinguino', 'cerdo'],
    zona: bosque,
  }),
  igual('L', {
    nombre: 'litera l',
    amigo: 'luna',
    amigoDice: 'lună',
    palabras: ['leon', 'lupa', 'limon'],
    zona: bosque,
  }),
  igual('S', {
    nombre: 'litera s',
    amigo: 'sol',
    amigoDice: 'soare',
    palabras: ['silla', 'estrella', 'trineo'],
    zona: bosque,
  }),
  igual('T', {
    nombre: 'litera t',
    amigo: 'tren',
    amigoDice: 'tren',
    palabras: ['tambor', 'tigre', 'tractor'],
    zona: bosque,
  }),
  igual('N', { nombre: 'litera n', amigo: 'nube', amigoDice: 'nor', palabras: ['nariz', 'nuez'], zona: bosque }),
  igual('D', {
    nombre: 'litera d',
    amigo: 'dinosaurio',
    amigoDice: 'dinozaur',
    palabras: ['calabaza', 'medico'],
    zona: bosque,
  }),
  igual('F', {
    nombre: 'litera f',
    amigo: 'mariposa',
    amigoDice: 'fluture',
    palabras: ['flor', 'foca', 'hoja'],
    zona: bosque,
  }),
  igual('B', {
    nombre: 'litera b',
    amigo: 'banana',
    amigoDice: 'banană',
    palabras: ['globo', 'ballena', 'barco'],
    zona: bosque,
  }),
  igual('R', {
    nombre: 'litera r',
    amigo: 'cohete',
    amigoDice: 'rachetă',
    palabras: ['tomate', 'robot', 'reno'],
    zona: pueblo,
  }),
  igual('C', {
    nombre: 'litera c',
    amigo: 'casa',
    amigoDice: 'casă',
    palabras: ['caballo', 'arbol', 'regalo'],
    zona: pueblo,
  }),
  igual('G', { nombre: 'litera g', amigo: 'gallina', amigoDice: 'găină', palabras: ['cubo', 'boca'], zona: pueblo }),
  igual('V', {
    nombre: 'litera v',
    amigo: 'vaca',
    amigoDice: 'vacă',
    palabras: ['ardilla', 'volcan', 'maleta'],
    zona: pueblo,
  }),
  conSigno('Ș', 'S', '#7A5BC7', COMA(0.5), COMA_MIN(0.5), {
    nombre: 'litera ș',
    amigo: 'gorra',
    amigoDice: 'șapcă',
    palabras: ['auto'],
    zona: pueblo,
  }),
  conSigno('Ț', 'T', '#C0563B', COMA(0.5), COMA_MIN(0.45), {
    nombre: 'litera ț',
    amigo: 'cara',
    amigoDice: 'față',
    palabras: ['ambulancia'],
    zona: pueblo,
  }),
  conSigno('Â', 'A', '#5C8A2E', CIRCUNFLEJO(0.5), CIRCUNFLEJO_MIN(0.45), {
    nombre: 'litera â',
    amigo: 'perro',
    amigoDice: 'câine',
    palabras: ['mano'],
    zona: pueblo,
  }),
];
