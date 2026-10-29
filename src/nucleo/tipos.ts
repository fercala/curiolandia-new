// tipos.ts: los tipos del núcleo (src/nucleo/), que usan también los demás módulos del juego. Solo tipos: este módulo
// no tiene código.
//   - El estado guardado S (Estado y sus partes). docs/ESTADO-GUARDADO.md manda: si cambia un campo, se cambia allí
//     y aquí. Solo describen lo que ya hay: no cambian nada del juego ni de las partidas guardadas.
//   - VIVO (Vivo): el estado de la partida en curso que no se guarda.
//   - Escena, partículas, temporizadores y avisos.
// Libre y los campos con `any` son la frontera con el código que viene del juego viejo (era global y sin tipos): cada
// escena y cada cosa que se arrastra lleva sus propios campos. Se irán cerrando en las fases 3 y 4 de
// docs/PLAN-MIGRACION.md, al ordenar las reglas y las escenas.

/** Fecha local en formato 'AAAA-MM-DD' (ymd() en guardado.ts). */
export type FechaDia = string;

/** Aciertos y fallos de una habilidad o de un juego. */
export interface Cuenta {
  ok: number;
  err: number;
}

/** Progreso de un tema: cuántas veces se terminó cada juego (por posición en games) y si el tema está terminado. */
export interface ProgresoTema {
  g: Record<number, number>;
  done?: number | boolean;
}

/** Volúmenes de 0 a 1. */
export interface Volumenes {
  voz: number;
  mus: number;
  fx: number;
}

/** Colores, ropa y animal de Tito (escenas/tienda.ts). */
export interface Tito {
  shell?: string;
  scarf?: string;
  hat?: string;
  glasses?: string;
  bow?: string;
  kind?: 'caracol' | 'erizo' | 'tortuga' | 'conejo';
}

/** Un vale de la familia (escenas/tienda.ts, VALES_DEF): texto, dibujo, precio en monedas y si se ofrece; en valesLog,
 *  además, cuándo se compró y si ya se dio. */
export interface Vale {
  id: string;
  txt?: string;
  ic?: string;
  p?: number;
  on?: number | boolean;
  d?: FechaDia;
  given?: boolean | number;
}

/** El repaso del día (escenas/repaso.ts). */
export interface Repaso {
  d?: FechaDia;
  list: string[];
  done: Record<string, number>;
  weak?: number;
  paid?: number | boolean;
  seen?: number | boolean;
}

/** El estado guardado completo: DEF (guardado.ts) + DEF2 (escenas/tienda.ts) + escenas/repaso.ts + campos sueltos. */
export interface Estado {
  // DEF (guardado.ts)
  age: number;
  name: string;
  variant: 'es';
  hemi: 'N' | 'S';
  vol: Volumenes;
  limit: number;
  temas: Record<string, ProgresoTema>;
  stats: Record<string, Cuenta>;
  days: Record<FechaDia, number>;
  asam: Record<FechaDia, { done?: number | boolean; age?: number; dia?: unknown; tiempo?: string; emo?: string }>;
  stk: Record<string, number>;
  album: unknown[];
  intro: boolean;
  first: Record<string, number | boolean | string>;
  seenFl: number;
  /** Versión del formato de la partida (dominio/partida.ts, desde la fase 3f). */
  ver: number;
  // DEF2 (escenas/tienda.ts)
  coins?: number;
  coinsTot?: number;
  gift?: FechaDia;
  woke?: Record<string, number>;
  home?: Record<string, { x: number; y: number; r?: string }>;
  rooms?: number;
  tito?: Tito;
  owned?: Record<string, number>;
  vales?: Vale[];
  valesLog?: Vale[];
  bday?: { d: number; m: number } | null;
  bdayDone?: FechaDia;
  unlockAll?: boolean;
  seenOpen?: Record<string, (string | number)[]>;
  houseSeen?: number;
  petSeen?: number;
  cofres?: number;
  cofreP?: Record<string, number>;
  // escenas/repaso.ts
  kg?: Record<string, string[]>;
  gs?: Record<string, Cuenta & { d?: FechaDia }>;
  rep?: Repaso;
  // sueltos
  voz?: 'nav' | '' | 'fer';
  vozNav?: string;
  quiet3?: number;
  last?: string;
  ses?: { t: number; at: number } | null;
}

/** Un objeto de forma libre (lo que se arrastra, avisos...): sus campos dependen de quién lo crea. */
// any: frontera con el código del juego viejo, sin tipos (ver la cabecera).
export type Libre = { [campo: string]: any };

/** Lo que se programa con later(): cuándo (segundos que faltan), qué hacer y en qué escena (sceneTok) se pidió. */
export interface Temporizador {
  t: number;
  fn: () => void;
  tok: number;
  /** Ya se ejecutó (frame() en aplicacion/adultos.ts lo marca y lo quita de la lista). */
  done?: boolean | number;
}

/** Aviso de pegatina nueva: dibujo, momento T en que salió y dónde (si no, arriba en el centro). */
export interface AvisoPegatina {
  k: string;
  t: number;
  x?: number;
  y?: number;
}

/**
 * Una partícula (ver PARTÍCULAS en escenas.ts): posición, velocidad (px/s), vida y edad (s), color, tamaño, giro,
 * gravedad (900 si no se da) y tipo k. Las de texto ('t') llevan tx y, si acaso, hl y dots.
 */
export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  t: number;
  c: string;
  r: number;
  rot?: number;
  g?: number;
  k?: string;
  tx?: string;
  hl?: boolean | number;
  dots?: number;
}

/** Lo que devuelve hint() de una escena: dónde dibujar la ayuda (círculo de radio r, o un camino que sigue la manita). */
export interface Pista {
  x: number;
  y: number;
  r?: number;
  dx?: number;
  dy?: number;
  path?: number[][];
}

/**
 * VIVO (pantalla.ts): estado de la partida en curso que no se guarda y que cambian varios archivos. Cada campo está
 * explicado donde se rellena (puntero.ts, voz.ts, escenas.ts, interfaz.ts, escenas/escenas2d.ts y escenas/tienda.ts).
 */
export interface Vivo {
  /** Puntero en la pantalla lógica de 1600x900; -9 si no hay. */
  MX: number;
  MY: number;
  /** true solo con ratón (con el dedo no hay «pasar por encima»). */
  mouseOn: boolean;
  /** Lo que hay bajo el ratón en este cuadro y en el anterior (el id que se le dio a hv(): casi siempre un texto,
   *  pero algunos juegos usan el objeto mismo), cuánto lleva ahí y si ya se dijo su nombre. */
  hovNow: unknown;
  hovPrev: unknown;
  hovT: number;
  dwellDone: boolean;
  /** true mientras Tito habla; sayTok numera las frases. */
  talking: boolean;
  sayTok: number;
  /** Velo de transición entre escenas (de 1 a 0). */
  fade: number;
  /** Lo pendiente de later() en la escena actual. */
  timers: Temporizador[];
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
  toast: AvisoPegatina | null;
  /** Aviso del navegador para instalar la app, guardado para usarlo después (escenas/escenas2d.ts). */
  deferredInstall: Libre | null;
  /** Cartel de monedas ganadas, o null (escenas/tienda.ts). */
  coinBanner: Libre | null;
}

/**
 * Una escena (ver SISTEMA DE ESCENAS en escenas.ts). Todo es opcional salvo draw. Además de lo de aquí, cada escena
 * guarda sus propios campos (this.t, this.items...): de ahí el índice libre.
 */
export interface Escena {
  /** Clave de música de la escena; null = sin música. */
  music?: string | null;
  three?: boolean;
  /** Momento T del último acierto, para el «pop» de la última estrella de drawRounds. */
  starPop?: number;
  enter?(o: Libre): void;
  update?(dt: number): void;
  draw(): void;
  down?(x: number, y: number): void;
  move?(x: number, y: number): void;
  up?(x: number, y: number): void;
  hint?(): Pista | null | undefined;
  /** Repite la consigna; entera (en algunas escenas) la dice con la presentación. */
  prompt?(entera?: boolean): void;
  dwell?(id: string): void;
  // any: frontera con el código del juego viejo, sin tipos (ver la cabecera).
  [campo: string]: any;
}

/** window.__cl: lo que las pruebas automáticas leen y hacen en el juego (aplicacion/adultos.ts). */
export interface PuertaPruebas {
  go(nombre: string, opciones?: Libre): void;
  readonly S: Estado;
  readonly scene: Escena | null;
  readonly name: string;
  [dato: string]: unknown;
}

declare global {
  interface Window {
    /** Modo rápido de las pruebas: say() no habla (voz.ts). */
    __fast?: number;
    /** Frases que dice Tito en modo rápido. */
    __said?: string[];
    /** Puerta para las pruebas automáticas (aplicacion/adultos.ts; docs/CONTRATO-PRUEBAS.md). */
    __cl: PuertaPruebas;
    /** Lo que la capa 3D ofrece al resto del juego (lo pone montarInteraccion, en mundo3d/interaccion.ts). */
    __w3: { ok?: boolean; retito?: () => void; [dato: string]: unknown };
  }
}
