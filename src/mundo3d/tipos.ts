/*
 * mundo3d/tipos.ts: los tipos de la capa 3D (mundo3d/mundo3d.ts, antes world3d.js). Solo tipos: no genera código.
 * Three.js r128 llega como variable global THREE desde three.min.js (ver mundo3d/three.d.ts); sus tipos son los de
 * @types/three 0.128, que aquí se importan como Tres para usarlos en las anotaciones (Tres.Mesh, Tres.Group...).
 * userData de los objetos de Three.js es libre ({[clave]: any}) en esos tipos: las marcas de cada objeto (tree, frog,
 * wob, dur, anim...) siguen sin tipo, como en el resto del código que habla con Three.js.
 */
import type * as Tres from 'three';
import type { Tema } from '../juegos/tipos.ts';

/** Un trío [x, y, z] (posición, giro o escala de una pieza). */
export type Trio = [number, number, number];
/** Un punto [x, z] sobre el suelo (caminos, casitas, estaciones). */
export type PuntoSuelo = [number, number];

/** Opciones de mk(geo, c, o): posición, giro, escala, dónde se añade, sombras y grosor del contorno (0 = sin contorno). */
export interface OpcionesPieza {
  p?: Trio;
  r?: Trio;
  s?: number | Trio;
  to?: Tres.Object3D;
  /** false: no proyecta sombra. */
  cs?: boolean;
  /** false: no recibe sombra. */
  rs?: boolean;
  ol?: number;
}

/** Una pieza para mg(): geometría, posición, escala (número o trío) y giro. */
export type PiezaUnida = [Tres.BufferGeometry, Trio?, (number | Trio | null)?, Trio?];

/** Opciones de newWorld(): ángulo de visión, color de fondo, tipo de mundo, niebla [cerca, lejos] y tamaño de la sombra. */
export interface OpcionesMundo {
  fov?: number;
  bg?: string;
  kind?: TipoMundo;
  fog?: [number, number];
  shadow?: number;
}

/** Opciones de ribbon(): empujar la cinta hacia delante (no parpadea con el suelo) y piedrecitas cada dash puntos, de color dashC. */
export interface OpcionesCinta {
  polygonOffset?: number;
  dash?: number;
  dashC?: string;
}

/** Opciones de spr() y pillSpr(): posición, dónde se añade, dt=false (siempre encima), opacidad, orden y ancho. */
export interface OpcionesSprite {
  p?: Trio;
  to?: Tres.Object3D;
  dt?: boolean;
  op?: number;
  ro?: number;
  /** Ancho del cartel de pillSpr (2,4 por defecto). */
  w?: number;
}

/** Opciones de plane(): posición, giro, dónde se añade y ds (se ve por las dos caras). */
export interface OpcionesPlano {
  p?: Trio;
  r?: Trio;
  to?: Tres.Object3D;
  ds?: boolean;
}

/** Textura dibujada con las funciones 2D (canvasTex): redraw() la vuelve a dibujar. */
export interface TexturaDibujada extends Tres.CanvasTexture {
  redraw(): void;
}

/**
 * Un objeto cualquiera al recorrer la escena (traverse, children, rayos): malla, luz, sprite o grupo. El código pregunta
 * qué es (isMesh, isLight, isSprite) y toca su material, geometría, brillo o sombra según el caso.
 */
export type Nodo = Tres.Object3D & {
  castShadow: boolean;
  isMesh?: boolean;
  isLight?: boolean;
  isSprite?: boolean;
  intensity?: number;
  // any: material, geometría y sombra son de un tipo u otro según el objeto (frontera con Three.js, como userData).
  material?: any;
  geometry?: any;
  shadow?: any;
};

/** Una estación de juego de la casita: su grupo, el cartel (sp) y dónde cae en la pantalla 1600x900 (p2). */
export interface Estacion3 {
  g: Tres.Group;
  sp: Tres.Sprite;
  p2: [number, number];
}

/** Una malla con material básico (sin luces): huellas de Tito, anillos del agua, gotas, vapor... */
export type MallaBasica = Tres.Mesh<Tres.BufferGeometry, Tres.MeshBasicMaterial>;

/** Opciones de walkTo(): velocidad, duración máxima, paseo libre (por el suelo) y acercar la cámara (zoom, desde Tito). */
export interface OpcionesPaseo {
  speed?: number;
  max?: number;
  free?: boolean;
  zoom?: Tres.Vector3;
}

/** Tipo de mundo: portada, mapa (la isla), zona, casita de tema o cofre. */
export type TipoMundo = 'title' | 'map' | 'zone' | 'casita' | 'cofre';

/** Posición y punto de mira de la cámara (camRig, walkTo). */
export interface Encuadre {
  pos: Tres.Vector3;
  look: Tres.Vector3;
}

/** Paseo de Tito en curso (walkTo lo crea y walkTick lo avanza): inicio, duración, de dónde a dónde y qué hacer al llegar. */
export interface Paseo {
  t0: number;
  dur: number;
  from: Tres.Vector3;
  to: Tres.Vector3;
  cb?: (() => void) | null;
  /** Paseo libre (por el suelo), sin lugar al que llegar. */
  free: boolean;
  /** Segundos desde el último paso (walkTick). */
  st?: number;
}

/**
 * El mundo 3D activo (W3; en las funciones, `w`). newWorld() crea los campos fijos; cada escena añade los suyos al
 * construirse y los juegos del cielo y del paisaje guardan aquí su estado mientras dura la visita (desaparecen al
 * cambiar de mundo). Los campos …T guardan el momento T de algo (toque, fugaz, arcoíris…) y los …F, banderas para no
 * repetir una frase.
 */
export interface Mundo {
  /** Escena y cámara de Three.js, y el ángulo de visión base (fitCam lo abre en pantallas estrechas). */
  sc: Tres.Scene;
  cam: Tres.PerspectiveCamera;
  fov: number;
  /** Objetos que pickAt puede tocar (lugares, casitas, estaciones, cofre). */
  pick: Tres.Object3D[];
  /** Funciones que se llaman en cada cuadro (animaciones). */
  upd: ((dt: number) => void)[];
  kind?: TipoMundo;
  sun?: Tres.DirectionalLight;
  /** Tito en 3D y su paseo en curso. */
  tito?: Tres.Group;
  walk?: Paseo | null;
  /** Objetos que reaccionan al tocarlos (wobInit) y los que vuelan (flyTap). */
  trees?: Tres.Object3D[];
  fly?: Tres.Object3D[];
  /** Mapa: los lugares por id. Zona: las casitas por id de tema, la zona y su suelo. Casita: el tema y las estaciones. */
  spots?: Record<string, Tres.Group>;
  cas?: Record<string, Tres.Group>;
  z?: string;
  ground?: Tres.Mesh;
  t?: Tema;
  st?: Estacion3[];
  chest?: Tres.Group;
  sea?: Tres.Mesh;
  /** Cámara: posición base (cb, con el paralaje par), destino (camT) y punto al que mira ahora (camL). */
  cb?: Encuadre & { par: number };
  camT?: Encuadre;
  camL?: Tres.Vector3;
  /** Círculos [x, z, radio] que Tito esquiva al pasear y límites [x0, x1, z0, z1] del suelo por el que puede ir. */
  avoid?: [number, number, number][];
  gb?: [number, number, number, number];
  /** Huella de Tito: último punto marcado y tiempo desde la última huella; pasos dados. */
  trL?: Tres.Vector3;
  trT?: number;
  steps?: number;
  /** Juegos del cielo: estrellas tocadas (myS, myC, myL, myN, myN2, myRb), arcoíris y anillos del mar (spl). */
  myS?: Tres.Points<Tres.BufferGeometry, Tres.PointsMaterial>;
  myC?: Tres.Object3D[];
  myL?: Tres.Object3D[];
  myN?: number;
  myN2?: number;
  myRb?: number;
  rainbow?: Tres.Group;
  spl?: MallaBasica[];
  /** Pájaros ya tocados (por objeto) y burbujas contadas. */
  brdT?: Set<Tres.Object3D>;
  bubN?: number;
  /** Nombres ya dichos en la visita (1 = una vez, 2 = con sílabas), por marca. */
  nmD?: Record<string, number>;
  /** Letras y abecedario tocados en orden. */
  hseq?: number;
  aseq?: number;
  starT?: number;
  monT?: number;
  jupT?: number;
  dayT?: number;
  bdT?: number;
  shootT?: number;
  rainT?: number;
  satT?: number;
  flgT?: number;
  splT?: number;
  nmT?: number;
  stF?: number;
  snF?: number;
  nmStar?: number;
  monF?: number;
  jupF?: number;
  sunF?: number;
  chF?: number;
  /** Zona: posición [x, z] de cada casita, por id de tema. */
  base?: Record<string, PuntoSuelo>;
  /** allTap: objetos de cada tipo ya tocados en la visita ('_all' + marca); null tras celebrarlo. */
  [todos: `_all${string}`]: Set<Tres.Object3D> | null | undefined;
}
