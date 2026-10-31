/*
 * contenido/letras.ts: las letras de la Isla de las Letras (fase L1 de docs/PLAN-LECTURA.md). Las 20 letras que se
 * enseñan, en el orden en que salen en la isla: las cinco vocales en la Playa de los Sonidos (3 años), M P L S T N D F B
 * en el Bosque de las Letras (4 años) y R C G J V Ñ en el Pueblo de las Palabras (5 años).
 * Cada letra trae su nombre para la voz, su amigo (un dibujo de PICS cuyo nombre empieza por ella), otras palabras con
 * dibujo que empiezan igual, su color, su zona y los trazos de la mayúscula (letra de palo), con su orden y dirección.
 * Los trazos están en una caja de 1 x 1 (x a la derecha, y hacia abajo; la tilde de la Ñ sube por encima, con y
 * negativa): quien los pinte o los use en Tracer los escala a su sitio con letraEnPantalla. Las minúsculas llegan en una
 * fase posterior (L5).
 * Es CONTENIDO: solo datos y cálculo, sin dibujo ni S. Pruebas: tests/unidad/letras.test.ts (que existan los dibujos,
 * que no se repitan, que cada palabra empiece por su letra y que los trazos estén dentro de la caja).
 * Exporta: los tipos Punto, Trazo y Letra, ZONA_DE_LETRA, LETRAS, letra, letrasDeZona y letraEnPantalla.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las coordenadas de los trazos son el dibujo de cada letra: darles
   nombre no lo haría más claro. */

/** Un punto de un trazo, en la caja de 1 x 1 de la letra: [x, y]. */
export type Punto = readonly [x: number, y: number];

/** Un trazo: los puntos por los que pasa el dedo, en orden (del primero al último es la dirección del trazo). */
export type Trazo = readonly Punto[];

/** Una letra de la isla. */
export interface Letra {
  /** La letra en mayúscula, como se escribe: 'A', 'M', 'Ñ'. */
  readonly l: string;
  /** Cómo la nombra la voz: 'la a', 'la eme'. */
  readonly nombre: string;
  /** Su amigo: clave de PICS de un dibujo cuyo nombre empieza por ella (la A de abeja). */
  readonly amigo: string;
  /** Cómo se dice el amigo, sin artículo: 'abeja'. Sirve para «la a de abeja». */
  readonly amigoDice: string;
  /** Otras palabras con dibujo (claves de PICS) que empiezan por la letra, para los juegos de buscar y clasificar. */
  readonly palabras: readonly string[];
  /** Color de la letra en los juegos. */
  readonly c: string;
  /** Zona de la isla donde se aprende (ZONAS_LETRAS en dominio/apertura.ts). */
  readonly zona: string;
  /** Trazos de la mayúscula, en el orden en que se escriben. */
  readonly trazos: readonly Trazo[];
}

// ZONA_DE_LETRA: la zona de la isla de cada grupo de letras, por nombre, para no repetir la cadena en cada letra.
export const ZONA_DE_LETRA = { playa: 'playaSonidos', bosque: 'bosqueLetras', pueblo: 'puebloPalabras' } as const;

// Puntos de un arco de elipse para los trazos curvos (O, U, S, C...): centro (cx, cy), radios (rx, ry) y ángulos de
// a0 a a1 en radianes (0 = a la derecha, PI/2 = abajo, porque la y crece hacia abajo; si a1 < a0, gira al revés).
// n = número de tramos.
function arco(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 16): Punto[] {
  return Array.from({ length: n + 1 }, (_x, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [Math.round((cx + rx * Math.cos(a)) * 1000) / 1000, Math.round((cy + ry * Math.sin(a)) * 1000) / 1000] as const;
  });
}

const PI = Math.PI;
const { playa, bosque, pueblo } = ZONA_DE_LETRA;

// LETRAS: las 20 letras, en el orden de la isla. No cambies el orden ni la letra de una entrada publicada: los temas de
// la isla (fases L3 a L5) se crearán a partir de esta lista.
export const LETRAS: readonly Letra[] = [
  { l: 'A', nombre: 'la a', amigo: 'abeja', amigoDice: 'abeja', palabras: ['arbol', 'avion'], c: '#E8554E', zona: playa,
    trazos: [[[0.5, 0], [0, 1]], [[0.5, 0], [1, 1]], [[0.2, 0.62], [0.8, 0.62]]] },
  { l: 'E', nombre: 'la e', amigo: 'elefante', amigoDice: 'elefante', palabras: ['estrella'], c: '#F08A3C', zona: playa,
    trazos: [[[0.1, 0], [0.1, 1]], [[0.1, 0], [0.9, 0]], [[0.1, 0.5], [0.75, 0.5]], [[0.1, 1], [0.9, 1]]] },
  { l: 'I', nombre: 'la i', amigo: 'iglu', amigoDice: 'iglú', palabras: [], c: '#E8B92E', zona: playa,
    trazos: [[[0.5, 0], [0.5, 1]]] },
  { l: 'O', nombre: 'la o', amigo: 'oso', amigoDice: 'oso', palabras: ['oveja', 'ojo'], c: '#4FB477', zona: playa,
    trazos: [arco(0.5, 0.5, 0.5, 0.5, -PI / 2, -PI / 2 - 2 * PI, 32)] },
  { l: 'U', nombre: 'la u', amigo: 'uva', amigoDice: 'uva', palabras: [], c: '#9B6FD0', zona: playa,
    trazos: [[[0.05, 0], ...arco(0.5, 0.6, 0.45, 0.4, PI, 0), [0.95, 0]]] },
  { l: 'M', nombre: 'la eme', amigo: 'mono', amigoDice: 'mono', palabras: ['mesa', 'manzana'], c: '#4BA3E0', zona: bosque,
    trazos: [[[0, 1], [0, 0], [0.5, 0.6], [1, 0], [1, 1]]] },
  { l: 'P', nombre: 'la pe', amigo: 'pato', amigoDice: 'pato', palabras: ['perro', 'pera', 'pina'], c: '#E67FB0', zona: bosque,
    trazos: [[[0.1, 0], [0.1, 1]], [[0.1, 0], [0.5, 0], ...arco(0.5, 0.27, 0.4, 0.27, -PI / 2, PI / 2), [0.1, 0.54]]] },
  { l: 'L', nombre: 'la ele', amigo: 'leon', amigoDice: 'león', palabras: ['luna', 'lapiz'], c: '#D9962A', zona: bosque,
    trazos: [[[0.15, 0], [0.15, 1], [0.85, 1]]] },
  { l: 'S', nombre: 'la ese', amigo: 'sol', amigoDice: 'sol', palabras: ['seta', 'sandia', 'silla'], c: '#3FB8AF', zona: bosque,
    trazos: [[...arco(0.5, 0.26, 0.42, 0.26, -0.3, -1.5 * PI), ...arco(0.5, 0.74, 0.42, 0.26, -PI / 2, PI - 0.3).slice(1)]] },
  { l: 'T', nombre: 'la te', amigo: 'tortuga', amigoDice: 'tortuga', palabras: ['tomate', 'tren'], c: '#2BB0C4', zona: bosque,
    trazos: [[[0, 0], [1, 0]], [[0.5, 0], [0.5, 1]]] },
  { l: 'N', nombre: 'la ene', amigo: 'nube', amigoDice: 'nube', palabras: ['nido', 'nariz'], c: '#6FB6F0', zona: bosque,
    trazos: [[[0.05, 1], [0.05, 0], [0.95, 1], [0.95, 0]]] },
  { l: 'D', nombre: 'la de', amigo: 'dinosaurio', amigoDice: 'dinosaurio', palabras: [], c: '#A86B43', zona: bosque,
    trazos: [[[0.1, 0], [0.1, 1]], [[0.1, 0], [0.4, 0], ...arco(0.4, 0.5, 0.5, 0.5, -PI / 2, PI / 2), [0.1, 1]]] },
  { l: 'F', nombre: 'la efe', amigo: 'foca', amigoDice: 'foca', palabras: ['flor', 'fresa'], c: '#7A8CA8', zona: bosque,
    trazos: [[[0.15, 0], [0.15, 1]], [[0.15, 0], [0.9, 0]], [[0.15, 0.5], [0.7, 0.5]]] },
  { l: 'B', nombre: 'la be', amigo: 'ballena', amigoDice: 'ballena', palabras: ['barco'], c: '#3D7CC9', zona: bosque,
    trazos: [[[0.1, 0], [0.1, 1]],
      [[0.1, 0], [0.5, 0], ...arco(0.5, 0.25, 0.35, 0.25, -PI / 2, PI / 2), [0.1, 0.5], [0.55, 0.5],
        ...arco(0.55, 0.75, 0.4, 0.25, -PI / 2, PI / 2).slice(1), [0.1, 1]]] },
  { l: 'R', nombre: 'la erre', amigo: 'rana', amigoDice: 'rana', palabras: ['reloj', 'robot'], c: '#5CB85C', zona: pueblo,
    trazos: [[[0.1, 0], [0.1, 1]], [[0.1, 0], [0.5, 0], ...arco(0.5, 0.25, 0.4, 0.25, -PI / 2, PI / 2), [0.1, 0.5]],
      [[0.45, 0.5], [0.95, 1]]] },
  { l: 'C', nombre: 'la ce', amigo: 'casa', amigoDice: 'casa', palabras: ['conejo', 'cama', 'cohete'], c: '#C9673A', zona: pueblo,
    trazos: [arco(0.55, 0.5, 0.45, 0.5, -0.6, 0.6 - 2 * PI, 28)] },
  { l: 'G', nombre: 'la ge', amigo: 'gallina', amigoDice: 'gallina', palabras: ['gusano', 'gorro', 'gafas'], c: '#E07B28', zona: pueblo,
    trazos: [[...arco(0.55, 0.5, 0.45, 0.5, -0.6, -2 * PI, 28), [0.6, 0.5]]] },
  { l: 'J', nombre: 'la jota', amigo: 'jirafa', amigoDice: 'jirafa', palabras: ['jabon'], c: '#C9A227', zona: pueblo,
    trazos: [[[0.7, 0], [0.7, 0.7], ...arco(0.4, 0.7, 0.3, 0.3, 0, PI).slice(1)]] },
  { l: 'V', nombre: 'la uve', amigo: 'vaca', amigoDice: 'vaca', palabras: ['vela'], c: '#5A5A5A', zona: pueblo,
    trazos: [[[0, 0], [0.5, 1], [1, 0]]] },
  { l: 'Ñ', nombre: 'la eñe', amigo: 'nu', amigoDice: 'ñu', palabras: ['pina'], c: '#8B5E3C', zona: pueblo,
    trazos: [[[0.05, 1], [0.05, 0], [0.95, 1], [0.95, 0]], [[0.15, -0.2], [0.35, -0.3], [0.65, -0.15], [0.85, -0.25]]] },
];

// letra(l): la letra l de LETRAS ('A', 'Ñ'...), o undefined si no está.
export function letra(l: string): Letra | undefined {
  return LETRAS.find((x) => x.l === l);
}

// letrasDeZona(z): las letras que se aprenden en la zona z de la isla, en orden.
export function letrasDeZona(z: string): Letra[] {
  return LETRAS.filter((x) => x.zona === z);
}

// letraEnPantalla(t, x, y, ancho, alto): el trazo t pasado de la caja de 1 x 1 a la pantalla de 1600x900, con la
// esquina de arriba a la izquierda en (x, y) y ese ancho y alto. Es lo que necesita Tracer (pts) o quien pinte la letra.
export function letraEnPantalla(t: Trazo, x: number, y: number, ancho: number, alto: number): Array<[number, number]> {
  return t.map(([px, py]) => [x + px * ancho, y + py * alto]);
}
