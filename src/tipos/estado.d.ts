// Tipos del estado guardado S (ver docs/ESTADO-GUARDADO.md, que manda: si cambia un campo, se cambia allí y aquí).
// Solo describen lo que ya hay: no cambian nada del juego ni de las partidas guardadas. core.js los usa con JSDoc
// (`/** @type {Estado} */ let S`), así `npm run tipos:js` avisa si el código usa un campo que no existe.

/** Fecha local en formato 'AAAA-MM-DD' (ymd() en core.js). */
type FechaDia = string;

/** Aciertos y fallos de una habilidad o de un juego. */
interface Cuenta {
  ok: number;
  err: number;
}

/** Progreso de un tema: cuántas veces se terminó cada juego (por posición en games) y si el tema está terminado. */
interface ProgresoTema {
  g: Record<number, number>;
  done?: number | boolean;
}

/** Volúmenes de 0 a 1. */
interface Volumenes {
  voz: number;
  mus: number;
  fx: number;
}

/** Colores, ropa y animal de Tito (tienda.js). */
interface Tito {
  shell?: string;
  scarf?: string;
  hat?: string;
  glasses?: string;
  bow?: string;
  kind?: 'caracol' | 'erizo' | 'tortuga' | 'conejo';
}

/** Un vale de la familia (tienda.js, VALES_DEF): texto, dibujo, precio en monedas y si se ofrece; en valesLog,
 *  además, cuándo se compró y si ya se dio. */
interface Vale {
  id: string;
  txt?: string;
  ic?: string;
  p?: number;
  on?: number | boolean;
  d?: FechaDia;
  given?: boolean | number;
}

/** El repaso del día (repaso.js). */
interface Repaso {
  d?: FechaDia;
  list: string[];
  done: Record<string, number>;
  weak?: string[];
  paid?: number | boolean;
  seen?: number | boolean;
}

/** El estado guardado completo: DEF (core.js) + DEF2 (tienda.js) + repaso.js + campos sueltos. */
interface Estado {
  // DEF (core.js)
  age: number;
  name: string;
  variant: '' | 'ar' | 'es';
  hemi: 'N' | 'S';
  vol: Volumenes;
  limit: number;
  temas: Record<string, ProgresoTema>;
  stats: Record<string, Cuenta>;
  days: Record<FechaDia, number>;
  asam: Record<FechaDia, { done?: number | boolean; age?: number; dia?: unknown; tiempo?: unknown; emo?: unknown }>;
  stk: Record<string, number>;
  album: unknown[];
  intro: boolean;
  first: Record<string, number | boolean>;
  seenFl: number;
  // DEF2 (tienda.js)
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
  seenOpen?: Record<string, string[]>;
  houseSeen?: number;
  petSeen?: number;
  cofres?: number;
  cofreP?: Record<string, number>;
  // repaso.js
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
