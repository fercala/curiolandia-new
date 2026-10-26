// Three.js r128 llega como variable global THREE desde three.min.js (antes que el juego); tipos de @types/three 0.128.
declare const THREE: typeof import('three');
interface Window {
  /** Three.js, si three.min.js ha cargado. */
  THREE?: typeof import('three');
}
