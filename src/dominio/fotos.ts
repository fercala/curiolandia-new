/*
 * dominio/fotos.ts: las reglas de la cámara de fotos de Tito (idea 20 de docs/IDEAS-MEJORA.md, fase P15). En el mapa,
 * las zonas y la granja escuela, el niño enciende la cámara y toca animales y cosas para hacerles una foto; cada foto
 * nueva va al álbum de fotos, que tiene una página por grupo (PAGINAS_FOTOS: los bichos y animales del campo, el mar y
 * la playa, la nieve, la granja y las plantas y cosas), con el nombre en castellano y en inglés. Una foto nueva da una moneda, y
 * completar una página, tres más. Repetir una foto no da nada, pero se cuenta.
 * Lo guardado va en S.fotos ({vistas: {id: n}}): opcional, sin migración (un registro ausente o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/fotos.test.ts.
 * Exporta: los tipos Foto, PaginaFotos y RegistroFotos, FOTOS_REGLAS, PAGINAS_FOTOS, FOTOS, foto, fotoDeMarca,
 * fotosDePagina, registroFotos, cuantasFotos y hacerFoto.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (las monedas), en una tabla con
   nombre. */

/** Una foto del álbum: su id (el de su dibujo), su página, su nombre en castellano (con artículo, como lo dice Tito) y
 * en inglés, y de qué se hace: la marca de los objetos 3D (userData de mundo3d) o el animal de la granja escuela. */
export interface Foto {
  readonly id: string;
  readonly pagina: string;
  readonly nombre: string;
  readonly en: string;
  readonly marcas: readonly string[];
}

/** Una página del álbum: su id y su título. */
export interface PaginaFotos {
  readonly id: string;
  readonly titulo: string;
}

/** Lo guardado: cuántas veces se ha hecho cada foto. */
export interface RegistroFotos {
  readonly vistas: Readonly<Record<string, number>>;
}

// FOTOS_REGLAS: las monedas de una foto nueva y las de completar una página.
export const FOTOS_REGLAS = { nueva: 1, pagina: 3 } as const;

// PAGINAS_FOTOS: las páginas del álbum, en orden.
export const PAGINAS_FOTOS: readonly PaginaFotos[] = [
  { id: 'campo', titulo: 'Bichos y animales del campo' },
  { id: 'mar', titulo: 'Del mar y de la playa' },
  { id: 'nieve', titulo: 'De la nieve y del frío' },
  { id: 'granja', titulo: 'Animales de la granja' },
  { id: 'cosas', titulo: 'Plantas y cosas' },
];

// FOTOS: todas las fotos que se pueden hacer. En la página de la granja, la marca es la clave del animal que pasea
// (escenas/granjaAnimales.ts); en las demás, las marcas de userData de los objetos 3D. Cuando un objeto tiene varias
// marcas gana la primera foto de la lista que tenga una (la abeja lleva también la de la mariposa: va antes).
export const FOTOS: readonly Foto[] = [
  { id: 'rana', pagina: 'campo', nombre: 'La rana', en: 'frog', marcas: ['frog'] },
  { id: 'abeja', pagina: 'campo', nombre: 'La abeja', en: 'bee', marcas: ['bee'] },
  { id: 'mariposa', pagina: 'campo', nombre: 'La mariposa', en: 'butterfly', marcas: ['bfly'] },
  { id: 'mariquita', pagina: 'campo', nombre: 'La mariquita', en: 'ladybird', marcas: ['lady'] },
  { id: 'hormiga', pagina: 'campo', nombre: 'La hormiga', en: 'ant', marcas: ['ants'] },
  { id: 'conejo', pagina: 'campo', nombre: 'El conejo', en: 'rabbit', marcas: ['burrow'] },
  { id: 'ardilla', pagina: 'campo', nombre: 'La ardilla', en: 'squirrel', marcas: ['squir'] },
  { id: 'buho', pagina: 'campo', nombre: 'El búho', en: 'owl', marcas: ['owl'] },
  { id: 'ballena', pagina: 'mar', nombre: 'La ballena', en: 'whale', marcas: ['whale'] },
  { id: 'delfin', pagina: 'mar', nombre: 'El delfín', en: 'dolphin', marcas: ['dolph'] },
  { id: 'cangrejo', pagina: 'mar', nombre: 'El cangrejo', en: 'crab', marcas: ['crab'] },
  { id: 'pajaro', pagina: 'mar', nombre: 'El pájaro', en: 'bird', marcas: ['gull', 'bird', 'skyb'] },
  { id: 'barco', pagina: 'mar', nombre: 'El barco', en: 'boat', marcas: ['boat'] },
  { id: 'castillo', pagina: 'mar', nombre: 'El castillo de arena', en: 'sandcastle', marcas: ['sandc'] },
  { id: 'pinguino', pagina: 'nieve', nombre: 'El pingüino', en: 'penguin', marcas: ['peng'] },
  { id: 'iglu', pagina: 'nieve', nombre: 'El iglú', en: 'igloo', marcas: ['igloo'] },
  { id: 'muneco', pagina: 'nieve', nombre: 'El muñeco de nieve', en: 'snowman', marcas: ['snowman'] },
  { id: 'reno', pagina: 'nieve', nombre: 'El reno', en: 'reindeer', marcas: ['sleigh'] },
  { id: 'vaca', pagina: 'granja', nombre: 'La vaca', en: 'cow', marcas: ['vaca'] },
  { id: 'caballo', pagina: 'granja', nombre: 'El caballo', en: 'horse', marcas: ['caballo'] },
  { id: 'cerdo', pagina: 'granja', nombre: 'El cerdo', en: 'pig', marcas: ['cerdo'] },
  { id: 'oveja', pagina: 'granja', nombre: 'La oveja', en: 'sheep', marcas: ['oveja'] },
  { id: 'gallina', pagina: 'granja', nombre: 'La gallina', en: 'hen', marcas: ['gallina'] },
  { id: 'pollito', pagina: 'granja', nombre: 'El pollito', en: 'chick', marcas: ['pollito'] },
  { id: 'pato', pagina: 'granja', nombre: 'El pato', en: 'duck', marcas: ['pato'] },
  { id: 'arbol', pagina: 'cosas', nombre: 'El árbol', en: 'tree', marcas: ['tree', 'palm', 'xtree'] },
  { id: 'flor', pagina: 'cosas', nombre: 'La flor', en: 'flower', marcas: ['flower'] },
  { id: 'seta', pagina: 'cosas', nombre: 'La seta', en: 'mushroom', marcas: ['mush'] },
  { id: 'calabaza', pagina: 'cosas', nombre: 'La calabaza', en: 'pumpkin', marcas: ['pump'] },
  { id: 'hoja', pagina: 'cosas', nombre: 'La hoja', en: 'leaf', marcas: ['leafs'] },
  { id: 'nido', pagina: 'cosas', nombre: 'El nido', en: 'nest', marcas: ['nest'] },
  { id: 'cometa', pagina: 'cosas', nombre: 'La cometa', en: 'kite', marcas: ['kite'] },
  { id: 'globoAire', pagina: 'cosas', nombre: 'El globo', en: 'balloon', marcas: ['hab'] },
];

// foto(id): la foto con ese id, o undefined.
export function foto(id: string): Foto | undefined {
  return FOTOS.find((f) => f.id === id);
}

// fotoDeMarca(tiene): la foto de un objeto, según sus marcas: la primera de FOTOS con una marca que el objeto tenga
// (tiene(marca) dice si la tiene), o undefined si no se le puede hacer foto.
export function fotoDeMarca(tiene: (marca: string) => boolean): Foto | undefined {
  return FOTOS.find((f) => f.marcas.some(tiene));
}

// fotosDePagina(pagina): las fotos de esa página, en orden.
export function fotosDePagina(pagina: string): Foto[] {
  return FOTOS.filter((f) => f.pagina === pagina);
}

// registroFotos(raw): lee lo guardado en S.fotos; si falta o está roto, un registro vacío (las partidas de antes no lo
// tienen). Solo se quedan las fotos que existen, con un número mayor que cero.
export function registroFotos(raw: unknown): RegistroFotos {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>,
    v = (r.vistas && typeof r.vistas === 'object' ? r.vistas : {}) as Record<string, unknown>;
  return {
    vistas: Object.fromEntries(
      Object.entries(v).filter((e): e is [string, number] => typeof e[1] === 'number' && e[1] > 0 && !!foto(e[0])),
    ),
  };
}

// cuantasFotos(reg, pagina?): cuántas fotos distintas hay en el álbum (o en esa página).
export function cuantasFotos(reg: RegistroFotos, pagina?: string): number {
  return Object.keys(reg.vistas).filter((id) => !pagina || foto(id)?.pagina === pagina).length;
}

// hacerFoto(reg, id): se hace la foto id: el registro nuevo (con la foto una vez más), si es nueva, las monedas (una si
// es nueva, y tres más si con ella se completa su página) y si la página queda completa con esta foto. Una foto que no
// existe no cambia nada.
export function hacerFoto(
  reg: RegistroFotos,
  id: string,
): { registro: RegistroFotos; nueva: boolean; monedas: number; pagina: boolean } {
  const f = foto(id);
  if (!f) return { registro: reg, nueva: false, monedas: 0, pagina: false };
  const nueva = !reg.vistas[id],
    registro = { vistas: { ...reg.vistas, [id]: (reg.vistas[id] ?? 0) + 1 } },
    pagina = nueva && cuantasFotos(registro, f.pagina) === fotosDePagina(f.pagina).length;
  return {
    registro,
    nueva,
    monedas: nueva ? FOTOS_REGLAS.nueva + (pagina ? FOTOS_REGLAS.pagina : 0) : 0,
    pagina,
  };
}
