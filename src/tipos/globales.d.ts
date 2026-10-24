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

/** Un objeto de forma libre (lo que se arrastra, avisos...): sus campos dependen de quién lo crea. */
type Libre = { [campo: string]: any };

/**
 * VIVO (core.js): estado de la partida en curso que no se guarda y que cambian varios archivos. Cada campo está
 * explicado donde se rellena (core.js, scenes.js y tienda.js).
 */
interface Vivo {
  /** Puntero en la pantalla lógica de 1600x900; -9 si no hay. */
  MX: number;
  MY: number;
  /** true solo con ratón (con el dedo no hay «pasar por encima»). */
  mouseOn: boolean;
  /** Lo que hay bajo el ratón en este cuadro y en el anterior, cuánto lleva ahí y si ya se dijo su nombre. */
  hovNow: string | null;
  hovPrev: string | null;
  hovT: number;
  dwellDone: boolean;
  /** true mientras Tito habla; sayTok numera las frases. */
  talking: boolean;
  sayTok: number;
  /** Velo de transición entre escenas (de 1 a 0). */
  fade: number;
  /** Lo pendiente de later() en la escena actual. */
  timers: Libre[];
  /** Segundos sin tocar (activa las ayudas) y si ya se repitió la consigna. */
  idle: number;
  hintSaid: boolean;
  /** Lo que se está arrastrando, o null. */
  drag: Libre | null;
  /** Candado de la zona de adultos: segundos pulsado, si se está pulsando y la hora del cuadro anterior. */
  lockHold: number;
  lockDown: boolean;
  lockPrev: number;
  /** Dificultad adaptativa (-1 a 1) y veces que ya se jugó este juego (0 a 2). */
  ADAPT: number;
  REP: number;
  /** Tiempo de juego: segundos de la sesión, si ya se propuso descansar y segundos sin apuntar en S.days. */
  sessionT: number;
  restAsked: boolean;
  minuteAcc: number;
  /** Aviso de pegatina nueva, o null. */
  toast: Libre | null;
  /** Aviso del navegador para instalar la app, guardado para usarlo después (scenes.js). */
  deferredInstall: Libre | null;
  /** Cartel de monedas ganadas, o null (tienda.js). */
  coinBanner: Libre | null;
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
