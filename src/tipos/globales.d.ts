// Lo que el juego pone en window o recibe de fuera, para que `npm run tipos:js` lo conozca. Three.js r128 llega como
// variable global THREE desde three.min.js; sus tipos son los de @types/three 0.128 (misma versión).
// Formato de un tema y de una escena: ver los comentarios de TEMAS y SCENES en src/escenas/escenas2d.ts.

/** Un juego de un tema y un tema (su id es la clave de S.temas): están en src/juegos/tipos.ts, con los temas de src/temas/. */
type JuegoTema = import('../juegos/tipos.ts').JuegoTema;
type Tema = import('../juegos/tipos.ts').Tema;

/** Un objeto de forma libre y VIVO (el estado de la partida en curso): están en src/nucleo/tipos.ts. */
type Libre = import('../nucleo/tipos.ts').Libre;
type Vivo = import('../nucleo/tipos.ts').Vivo;

// window.__cl (la puerta de las pruebas, tipo PuertaPruebas) está en src/nucleo/tipos.ts, con window.__w3.
interface Window {
  /** Voces de mentira de las pruebas. */
  __voces?: SpeechSynthesisVoice[];
}
