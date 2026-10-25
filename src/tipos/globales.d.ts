// Lo que el juego pone en window o recibe de fuera, para que `npm run tipos:js` lo conozca. Three.js r128 llega como
// variable global THREE desde three.min.js; sus tipos son los de @types/three 0.128 (misma versión).
// Formato de un tema y de una escena: ver los comentarios de TEMAS y SCENES en src/escenas/escenas2d.ts.

/** Un juego de un tema y un tema (su id es la clave de S.temas): están en src/juegos/tipos.ts, con los temas de src/temas/. */
type JuegoTema = import('../juegos/tipos.ts').JuegoTema;
type Tema = import('../juegos/tipos.ts').Tema;

/** Un objeto de forma libre y VIVO (el estado de la partida en curso): están en src/nucleo/tipos.ts. */
type Libre = import('../nucleo/tipos.ts').Libre;
type Vivo = import('../nucleo/tipos.ts').Vivo;

/** Lo que las pruebas automáticas leen del juego (adult.js; ver docs/CONTRATO-PRUEBAS.md). */
interface PuertaPruebas {
  go(nombre: string, opciones?: object): void;
  readonly S: Estado;
  readonly scene: unknown;
  readonly name: string;
  [dato: string]: unknown;
}

interface Window {
  /** Puerta para las pruebas automáticas (adult.js). */
  __cl: PuertaPruebas;
  /** Lo que la capa 3D ofrece al resto del juego (world3d.js). */
  __w3: { ok?: boolean; retito?: () => void; [dato: string]: unknown };
  /** Voces de mentira de las pruebas. */
  __voces?: SpeechSynthesisVoice[];
}
