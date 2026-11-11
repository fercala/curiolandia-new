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
  /** Cómo salen las letras de la isla: solo mayúsculas ('mayus') o también minúsculas ('ambas'). Desde la fase L7b. */
  tipoLetra: 'mayus' | 'ambas';
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
  home?: Record<string, { x: number; y: number; r?: string; h?: string }>;
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
  /** Fichas de las mascotas que crecen (dominio/casa.ts, FichaMascota), por id de la tienda. Desde la fase C1. */
  mascotas?: Record<string, { nombre: string; dias: number; dia: FechaDia | ''; hechos: string[] }>;
  /** Sorpresas descubiertas en la casa de Tito: {idObjeto o 'a+b': 1}. Desde la fase C1. */
  sorpresas?: Record<string, number>;
  /** La flor del huerto: días regados y el último día que se regó. Desde la fase C1. */
  huerto?: { dias: number; dia: FechaDia | '' };
  /** Lo que ya se colocó alguna vez en la casa de Tito: {id: 1} (lo del baúl que no está es nuevo). null hasta la
   * primera visita a la casa desde la fase M2 de docs/PLAN-CASA-MEJORA.md (aplicacion/casa.ts). */
  casaVistos?: Record<string, number> | null;
  /** Los estados guardados de las cosas de la casa de Tito: {id: número}, 0 = el normal (dominio/casaToques.ts: la
   * lámpara, la tele, la cama, la torre de bloques...). Desde la fase M3 de docs/PLAN-CASA-MEJORA.md. */
  casaEst?: Record<string, number>;
  /** El cole (dominio/cole.ts, RegistroCole): el último día que se jugó en el patio, lo hecho ese día y cuántas veces
   * se ha hecho cada actividad. Desde la fase P1 de docs/IDEAS-MEJORA.md; opcional, sin migración. */
  cole?: { d: string; hechas: string[]; veces: Record<string, number> };
  /** Los retos para hacer en casa (dominio/retos.ts, RegistroRetos): el último propuesto (día e id), si la familia lo
   * marcó como hecho, si Tito ya lo celebró y cuántos se han hecho. Desde la fase P4 de docs/IDEAS-MEJORA.md; opcional. */
  retos?: { d: string; id: string; hecho: boolean; celebrado: boolean; n: number };
  /** true: la familia ha quitado los juegos de moverse (el patio del cole y la pausa activa), en la zona de adultos.
   * Desde la fase P4 de docs/IDEAS-MEJORA.md; opcional (sin el campo, están puestos). */
  sinMoverse?: boolean;
  /** Las excursiones del autobús del cole (dominio/excursiones.ts, VisitaExcursion), por id: las estaciones hechas en la
   * visita de ahora, las visitas terminadas, si hay foto de grupo y el último día. Desde la fase P5 de
   * docs/IDEAS-MEJORA.md; opcional, sin migración. */
  exc?: Record<string, { vistas: string[]; veces: number; foto: boolean; d: string }>;
  /** Los seres vivos que crecen por días (dominio/crecer.ts, Crecimiento), por id ('granja:manzano'): los días que se
   * les ha cuidado y el último día que contó. Desde la fase P8 de docs/IDEAS-MEJORA.md; opcional, sin migración. */
  crece?: Record<string, { dias: number; dia: string }>;
  /** Las crías nacidas en la granja escuela (dominio/crias.ts, CriaNacida), por id ('pollito'...): el nombre que les
   * puso el niño y el día de granja en que nacieron. Desde la fase P9 de docs/IDEAS-MEJORA.md; opcional, sin migración. */
  crias?: Record<string, { nombre: string; d: number }>;
  /** El gran día del deporte (dominio/deporte.ts, RegistroDeporte): las copas ganadas (una por semana) y la semana (su
   * lunes, 'AAAA-MM-DD') de la última. Desde la fase P11 de docs/IDEAS-MEJORA.md; opcional, sin migración. */
  deporte?: { copas: number; semana: string };
  // escenas/repaso.ts
  kg?: Record<string, string[]>;
  gs?: Record<string, Cuenta & { d?: FechaDia }>;
  rep?: Repaso;
  // sueltos
  voz?: 'nav' | '' | 'fer';
  vozNav?: string;
  /** Idioma del juego (fase ID1 de docs/PLAN-IDIOMAS.md): 'es' o 'ro'. Sin él, el del navegador la primera vez. */
  idioma?: 'es' | 'ro';
  quiet3?: number;
  /** Día de la última copia de seguridad descargada, vista o copiada ('AAAA-MM-DD'); desde la fase A6 de docs/PLAN-MENU-ADULTOS.md. */
  bkFecha?: FechaDia;
  last?: string;
  ses?: { t: number; at: number } | null;
}

/** Un objeto de forma libre (lo que se arrastra, avisos...): sus campos dependen de quién lo crea. */
// any: frontera con el código del juego viejo, sin tipos (ver la cabecera).
export type Libre = { [campo: string]: any };

/**
 * Las opciones de un cambio de escena: lo que se pasa a go(nombre, o), llega a enter(o) de la escena y queda en
 * sceneArg. Todo es opcional: cada escena lee solo lo suyo. Antes de la mejora 10 era Libre.
 */
export interface OpcionesEscena {
  /** Saludar al llegar (mapa, zonas, islas, casita, repaso, casa de Tito); false al rehacer la escena sin saludo. */
  hello?: boolean;
  /** Id del tema (casita, juego, cofre). */
  t?: string;
  /** Número del juego dentro del tema (juego; en la casita, el juego del que se vuelve, donde aparece Tito). */
  g?: number;
  /** En la casita: true la primera vez que se terminan todos los juegos del tema (lleva al cofre). */
  fin?: boolean;
  /** En la zona 3D: id del tema del que se viene (ahí aparece Tito). */
  from?: string;
  /** En el repaso: 1 = se sigue con el repaso de hoy (lo marca visto). */
  seguir?: number;
  /** En el repaso: 1 = se vuelve de un juego del repaso sin terminar el tema. */
  back?: number;
  /** En la casa de Tito: 1 = se vuelve de una de sus escenas (Tito sale del objeto, sin saludo). */
  volver?: number;
  /** En la casa de Tito: id del objeto recién comprado o regalado, para estrenarlo. */
  nuevo?: string | null;
  /** En la música y en las mascotas: id del instrumento o de la mascota que se tocó. */
  inst?: string;
  /** En el yoga (fase P3 de docs/IDEAS-MEJORA.md): true = la pausa activa, corta, que vuelve sola al mapa. */
  pausa?: boolean;
  /** En las excursiones (fase P5 de docs/IDEAS-MEJORA.md): id de la excursión (excursion y sus estaciones). */
  exc?: string;
  /** En la excursión: id de la estación que se acaba de terminar (se apunta al volver). */
  hecha?: string;
  /** En el gran día del deporte (fase P11 de docs/IDEAS-MEJORA.md): en una prueba, true = es parte de la jornada (al
   * acabar vuelve a SCENES.deporte); al volver a la jornada, la prueba hecha y sus puntos. */
  deporte?: boolean;
  prueba?: string;
  puntos?: number;
}

/** Las opciones de las escenas que siempre se abren con un tema (la casita y el cofre): t es obligatorio. */
export type OpcionesTema = OpcionesEscena & { t: string };
/** Las opciones de la escena del juego: el tema (t) y el número del juego (g), siempre. */
export type OpcionesJuego = OpcionesTema & { g: number };

/** Lo que se programa con later(): cuándo (segundos que faltan), qué hacer y en qué escena (sceneTok) se pidió. */
export interface Temporizador {
  t: number;
  fn: () => void;
  tok: number;
  /** Ya se ejecutó (frame() en aplicacion/bucle.ts lo marca y lo quita de la lista). */
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
 * Cartel de monedas ganadas, «+N» con un dibujo (VIVO.coinBanner, nucleo/monedas.ts): cuántas (n), momento T en que
 * salió (t), dibujo (icon; sin él, 'monedas') y sitio (x, y; sin ellos, el centro: el cofre lo mueve a la derecha).
 * Antes de la mejora 10c era Libre.
 */
export interface CartelMonedas {
  n: number;
  t: number;
  icon?: string;
  x?: number;
  y?: number;
}

/**
 * Opciones al dibujar una casita o una estación de juego (drawCasita y drawStation, escenas/escenas2d.ts): escala (s;
 * sin ella, 1) y, solo en la casita, el halo amarillo de la recomendada (glow). Antes de la mejora 10e era Libre.
 */
export interface OpcionesDibujo {
  s?: number;
  glow?: boolean;
}

/**
 * Lo que se está arrastrando (VIVO.drag, nucleo/escenas.ts; null si nada). Siempre lleva la pieza (it) y, según el
 * juego, cómo se arrastra: con la distancia del dedo a la pieza (dx, dy: juegos/comps.ts y el de llevar a la zona de
 * juegos/comps2.ts), un objeto de la casa (home: escenas/tienda.ts), una línea de unir (une) o la rueda que se gira
 * (gira), ambas en juegos/comps2.ts. Mientras no es null, no salen las ayudas ni el brillo de ratón encima.
 * Antes de la mejora 10d era Libre.
 */
export type Arrastre =
  { it: Libre; dx: number; dy: number } | { it: Libre; home: 1 } | { it: Libre; une: 1 } | { it: Libre; gira: 1 };

/**
 * Aviso del navegador para instalar el juego como app (evento 'beforeinstallprompt', VIVO.deferredInstall en
 * escenas/escenas2d.ts). TypeScript no trae su tipo: aquí está lo que usa el juego, prompt() enseña el aviso y
 * userChoice termina cuando el adulto contesta. Antes de la mejora 10c era Libre.
 */
export interface AvisoInstalar extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<unknown>;
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
  /** Lo que se está arrastrando, o null (ver Arrastre). */
  drag: Arrastre | null;
  /** Candado de la zona de adultos: segundos pulsado, si se está pulsando y la hora del cuadro anterior. */
  lockHold: number;
  lockDown: boolean;
  lockPrev: number;
  /** Dificultad adaptativa (-1 a 1) y veces que ya se jugó este juego (0 a 2). */
  ADAPT: number;
  REP: number;
  /** Tiempo de juego: segundos de la sesión, si ya se propuso descansar y segundos sin apuntar en S.days. pausaHecha
   * (desde la fase P3 de docs/IDEAS-MEJORA.md): ya se propuso la pausa activa del yoga en esta sesión. */
  sessionT: number;
  restAsked: boolean;
  pausaHecha: boolean;
  minuteAcc: number;
  /** Aviso de pegatina nueva, o null. */
  toast: AvisoPegatina | null;
  /** Aviso del navegador para instalar la app, guardado para usarlo después (escenas/escenas2d.ts). */
  deferredInstall: AvisoInstalar | null;
  /** Cartel de monedas ganadas, o null (escenas/tienda.ts). */
  coinBanner: CartelMonedas | null;
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
  enter?(o: OpcionesEscena): void;
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
  go(nombre: string, opciones?: OpcionesEscena): void;
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
    /** Lo que se dice en inglés (también está en __said), si la prueba lo pide (fase ID3 de docs/PLAN-IDIOMAS.md). */
    __saidEn?: string[];
    /** Puerta para las pruebas automáticas (aplicacion/adultos.ts; docs/CONTRATO-PRUEBAS.md). */
    __cl: PuertaPruebas;
    /** Lo que la capa 3D ofrece al resto del juego (lo pone montarInteraccion, en mundo3d/interaccion.ts). */
    __w3: { ok?: boolean; retito?: () => void; [dato: string]: unknown };
  }
}
