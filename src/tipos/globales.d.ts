// Lo que el juego pone en window o recibe de fuera, para que `npm run tipos:js` lo conozca. Three.js r128 llega como
// variable global THREE desde three.min.js; sus tipos son los de @types/three 0.128 (misma versión).
// Formato de un tema y de una escena: ver los comentarios de TEMAS y SCENES en src/scenes.js.

/** Un juego de un tema: t es el tipo (conocer, busca, viste...); el resto depende del tipo. */
interface JuegoTema {
  t?: string;
  [dato: string]: unknown;
}

/** Un tema (temas.js, temas4.js, temas5.js...): su id es la clave de S.temas. */
interface Tema {
  id: string;
  n: string;
  zone?: string;
  games: JuegoTema[];
  [dato: string]: unknown;
}

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
  /** Modo rápido de las pruebas: say() no habla. */
  __fast?: number;
  /** Frases que dice Tito en modo rápido. */
  __said?: string[];
  /** Voces de mentira de las pruebas. */
  __voces?: SpeechSynthesisVoice[];
}
