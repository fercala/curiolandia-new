/*
 * dominio/casaSitios.ts: dónde puede ir cada cosa de la casa de Tito (fase M1 de docs/PLAN-CASA-MEJORA.md). Cada
 * habitación tiene una lista fija de sitios con nombre (en el suelo, en la pared, la alfombra) y los muebles que
 * sostienen cosas (la mesa, la estantería, el baúl, la cama, la bañera y el sofá) añaden sitios encima de ellos. Cada
 * objeto tiene un tamaño (grande, mediano, pequeño, de pared o la alfombra) que dice en qué sitios cabe. En un sitio
 * solo hay un objeto: así las cosas nunca se pisan. Lo que no está en ningún sitio se guarda en el baúl de Tito.
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia lo que recibe. Trabaja con la
 * casa tal como se guarda (S.home: {id: {x, y, r, h?}}, donde h es el id del sitio) y devuelve una casa nueva.
 * Las tablas (los sitios de cada habitación, los sitios encima de cada mueble y el tamaño de cada objeto) están aquí,
 * como REACCIONES en dominio/casa.ts, para que la migración de la partida (dominio/partida.ts, 4 → 5) las pueda usar.
 * Las posiciones son las de la pantalla 2D de 1600×900 (el pie del objeto, como S.home); las de la casa 3D vendrán con
 * la fase M4. La escena de la casa las usará desde la fase M2 (el baúl).
 * Pruebas: tests/unidad/casaSitios.test.ts.
 * Exporta: los tipos TamanoObjeto, TipoSitio, Sitio, PosCasa, Casa y Plano; las tablas EN_BAUL, TAMANOS, SITIOS_FIJOS,
 * ENCIMA y PLANO; y las reglas tamanoDe, cabe, sitiosDe, sitioDe, quienEsta, libres, sitioMasCercano, colocar,
 * guardar, asignarSitios y ordenar.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de este archivo son las posiciones de los sitios en la
   pantalla de 1600×900, en tablas con nombre; sacarlos a otra constante solo repetiría el nombre. */

/** El tamaño de un objeto de la casa: dice en qué sitios cabe (cabe). */
export type TamanoObjeto = 'grande' | 'mediano' | 'pequeno' | 'pared' | 'alfombra';

/** El tipo de un sitio: en el suelo (grande o normal), en la pared, la alfombra o encima de un mueble. */
export type TipoSitio = 'suelo-grande' | 'suelo' | 'pared' | 'alfombra' | 'encima';

/** Un sitio de una habitación: id ('salon:suelo2', 'cocina:mesa:1'), habitación, tipo y posición 2D (el pie). */
export interface Sitio {
  readonly id: string;
  readonly r: string;
  readonly tipo: TipoSitio;
  readonly x: number;
  readonly y: number;
  /** Los sitios encima de un mueble: el id del mueble que los sostiene. */
  readonly mueble?: string;
}

/** Dónde está un objeto de la casa (lo que guarda S.home): posición 2D, habitación (o EN_BAUL) y sitio (h). */
export interface PosCasa {
  readonly x: number;
  readonly y: number;
  readonly r?: string;
  readonly h?: string;
}

/** La casa como se guarda: id del objeto → dónde está. */
export type Casa = Readonly<Record<string, PosCasa>>;

/** Un sitio fijo de las tablas, sin habitación: su nombre (el final de su id), su tipo y su posición. */
interface SitioFijo {
  readonly nombre: string;
  readonly tipo: Exclude<TipoSitio, 'encima'>;
  readonly x: number;
  readonly y: number;
}

/** Lo que necesitan las reglas: los sitios fijos de cada habitación, los de encima de cada mueble y los tamaños. */
export interface Plano {
  readonly habitaciones: Readonly<Record<string, readonly SitioFijo[]>>;
  readonly encima: Readonly<Record<string, readonly (readonly [number, number])[]>>;
  readonly tamanos: Readonly<Record<string, TamanoObjeto>>;
}

// EN_BAUL: el valor de r de un objeto guardado en el baúl de Tito (sin sitio). Se usará desde la fase M2.
export const EN_BAUL = 'baul';

// TAMANOS: el tamaño de cada uno de los 55 objetos de la casa (los de la tienda sin slot, también las mascotas). Los
// grandes son los muebles y lo que mide 240 o más en HSIZE (escenas/tienda.ts); los pequeños, lo que puede ir encima
// de una mesa o una balda; los de pared, los que hoy van colgados (WALLITEMS). Lo comprueba casaSitios.test.ts.
export const TAMANOS: Readonly<Record<string, TamanoObjeto>> = {
  // grandes: solo caben en los sitios grandes del suelo
  piano: 'grande',
  estanteria: 'grande',
  fuente: 'grande',
  banco: 'grande',
  columpio: 'grande',
  sofa: 'grande',
  cama: 'grande',
  mesa: 'grande',
  nevera: 'grande',
  banera: 'grande',
  tobogan: 'grande',
  arbol: 'grande',
  piscina: 'grande',
  cohete: 'grande',
  // de pared
  cuadro: 'pared',
  reloj: 'pared',
  pizarra: 'pared',
  estrellas: 'pared',
  saturno: 'pared',
  // la alfombra
  alfombra: 'alfombra',
  // pequeños: caben encima de los muebles y también en el suelo
  hamster: 'pequeno',
  cuento: 'pequeno',
  olla: 'pequeno',
  jabon: 'pequeno',
  pato: 'pequeno',
  pinturas: 'pequeno',
  pelotaPlaya: 'pequeno',
  regadera: 'pequeno',
  tarta: 'pequeno',
  pecera: 'pequeno',
  // medianos: en el suelo
  farol: 'mediano',
  plantaInterior: 'mediano',
  lampara: 'mediano',
  casitaPerro: 'mediano',
  telescopio: 'mediano',
  guitarra: 'mediano',
  robot: 'mediano',
  trenJuguete: 'mediano',
  muneca: 'mediano',
  cometa: 'mediano',
  xilofono: 'mediano',
  bloques: 'mediano',
  peluche: 'mediano',
  tele: 'mediano',
  baul: 'mediano',
  silla: 'mediano',
  toalla: 'mediano',
  tambor: 'mediano',
  globo: 'mediano',
  plantaFlor: 'mediano',
  castillo: 'mediano',
  tierra: 'mediano',
  gato: 'mediano',
  pajaro: 'mediano',
  conejo: 'mediano',
};

// SITIOS_FIJOS: los sitios de una habitación, los mismos en las 7 por ahora (la fase M2 los ajustará al dibujo de cada
// una): 3 grandes al fondo del suelo, 5 normales delante, 4 en la pared y la alfombra en el centro. El suelo empieza
// en y = 600; Tito anda por y = 700, entre las dos filas; a la izquierda (x < 400) están Tito y Pipo.
export const SITIOS_FIJOS: readonly SitioFijo[] = [
  { nombre: 'grande1', tipo: 'suelo-grande', x: 640, y: 650 },
  { nombre: 'grande2', tipo: 'suelo-grande', x: 1000, y: 650 },
  { nombre: 'grande3', tipo: 'suelo-grande', x: 1360, y: 650 },
  { nombre: 'suelo1', tipo: 'suelo', x: 500, y: 780 },
  { nombre: 'suelo2', tipo: 'suelo', x: 760, y: 790 },
  { nombre: 'suelo3', tipo: 'suelo', x: 1040, y: 790 },
  { nombre: 'suelo4', tipo: 'suelo', x: 1320, y: 790 },
  { nombre: 'suelo5', tipo: 'suelo', x: 1510, y: 760 },
  { nombre: 'pared1', tipo: 'pared', x: 800, y: 330 },
  { nombre: 'pared2', tipo: 'pared', x: 1030, y: 330 },
  { nombre: 'pared3', tipo: 'pared', x: 580, y: 320 },
  { nombre: 'pared4', tipo: 'pared', x: 380, y: 300 },
  { nombre: 'alfombra', tipo: 'alfombra', x: 960, y: 760 },
];

// ENCIMA: los muebles que sostienen cosas pequeñas → posición de cada sitio encima, relativa al pie del mueble
// ([dx, dy] en píxeles de 1600×900). Si el mueble se guarda, lo que tenía encima se guarda con él (guardar).
export const ENCIMA: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
  mesa: [
    [-60, -130],
    [60, -130],
  ],
  estanteria: [
    [0, -95],
    [0, -180],
  ],
  baul: [[0, -140]],
  cama: [[-70, -135]],
  banera: [[50, -105]],
  sofa: [[-80, -125]],
};

// HABITACIONES: los ids de las 7 habitaciones de la casa (ROOMS en escenas/tienda.ts), en su orden.
const HABITACIONES = ['salon', 'dormitorio', 'cocina', 'bano', 'juegos', 'jardin', 'torre'];

// PLANO: el plano de la casa de siempre: las 7 habitaciones con SITIOS_FIJOS, ENCIMA y TAMANOS.
export const PLANO: Plano = {
  habitaciones: Object.fromEntries(HABITACIONES.map((r) => [r, SITIOS_FIJOS])),
  encima: ENCIMA,
  tamanos: TAMANOS,
};

// QUE_CABE: en qué tipos de sitio cabe cada tamaño, del que se prefiere al que menos (los pequeños, primero encima de
// un mueble; los medianos, antes en un sitio normal que en uno grande).
const QUE_CABE: Readonly<Record<TamanoObjeto, readonly TipoSitio[]>> = {
  grande: ['suelo-grande'],
  mediano: ['suelo', 'suelo-grande'],
  pequeno: ['encima', 'suelo', 'suelo-grande'],
  pared: ['pared'],
  alfombra: ['alfombra'],
};

// tamanoDe(plano, id): el tamaño del objeto id; mediano si no está en la tabla (un objeto nuevo sin apuntar).
export function tamanoDe(plano: Plano, id: string): TamanoObjeto {
  return Object.hasOwn(plano.tamanos, id) ? plano.tamanos[id] : 'mediano';
}

// cabe(tamano, tipo): ¿un objeto de ese tamaño cabe en un sitio de ese tipo?
export function cabe(tamano: TamanoObjeto, tipo: TipoSitio): boolean {
  return QUE_CABE[tamano].includes(tipo);
}

// enHabitacion(casa, id, r): ¿el objeto id está en la habitación r? (sin r cuenta como el salón, como las partidas de
// antes de la v1.590).
function enHabitacion(casa: Casa, id: string, r: string): boolean {
  const p = casa[id];
  return !!p && (p.r || 'salon') === r;
}

// sitiosDe(plano, r, casa): los sitios de la habitación r: los fijos y, por cada mueble de ENCIMA que esté en r en un
// sitio, los de encima de él (con su posición: la del sitio del mueble más el desplazamiento de ENCIMA). Una
// habitación que no está en el plano no tiene sitios.
export function sitiosDe(plano: Plano, r: string, casa: Casa): Sitio[] {
  const fijos = plano.habitaciones[r];
  if (!fijos) return [];
  const base: Sitio[] = fijos.map((s) => ({ id: r + ':' + s.nombre, r, tipo: s.tipo, x: s.x, y: s.y }));
  const encima: Sitio[] = Object.entries(plano.encima).flatMap(([mueble, huecos]) => {
    const p = casa[mueble];
    const donde = p && enHabitacion(casa, mueble, r) && base.find((s) => s.id === p.h);
    if (!donde) return [];
    return huecos.map(([dx, dy], i) => ({
      id: r + ':' + mueble + ':' + (i + 1),
      r,
      tipo: 'encima' as const,
      x: donde.x + dx,
      y: donde.y + dy,
      mueble,
    }));
  });
  return [...base, ...encima];
}

// sitioDe(plano, casa, h): el sitio con id h ('salon:suelo2'), mirando la habitación que dice su id; undefined si no
// existe (un id viejo o el del encima de un mueble que ya no está ahí).
export function sitioDe(plano: Plano, casa: Casa, h: string): Sitio | undefined {
  const r = h.split(':')[0];
  return sitiosDe(plano, r, casa).find((s) => s.id === h);
}

// quienEsta(casa, h, excepto?): el id del objeto que ocupa el sitio h (sin contar excepto), o undefined si está libre.
export function quienEsta(casa: Casa, h: string, excepto?: string): string | undefined {
  return Object.keys(casa).find((id) => id !== excepto && casa[id]?.h === h);
}

// libres(plano, r, casa, id): los sitios de la habitación r donde cabe el objeto id y que están libres (o los ocupa él
// mismo), en el orden de preferencia de su tamaño (QUE_CABE). Un objeto no puede ir encima de sí mismo.
export function libres(plano: Plano, r: string, casa: Casa, id: string): Sitio[] {
  const orden = QUE_CABE[tamanoDe(plano, id)];
  return sitiosDe(plano, r, casa)
    .filter((s) => orden.includes(s.tipo) && s.mueble !== id && !quienEsta(casa, s.id, id))
    .sort((a, b) => orden.indexOf(a.tipo) - orden.indexOf(b.tipo));
}

// sitioMasCercano(plano, r, casa, id, x, y): el sitio libre de r donde cabe id más cercano a (x, y), dentro del tipo
// que prefiere su tamaño; si no hay de ese tipo, del siguiente. undefined si no cabe en ninguno.
export function sitioMasCercano(plano: Plano, r: string, casa: Casa, id: string, x: number, y: number) {
  const ls = libres(plano, r, casa, id);
  if (!ls.length) return undefined;
  const tipo = ls[0].tipo,
    d = (s: Sitio) => (s.x - x) ** 2 + (s.y - y) ** 2;
  return ls.filter((s) => s.tipo === tipo).sort((a, b) => d(a) - d(b))[0];
}

// colocar(plano, casa, id, h): la casa con el objeto id en el sitio h (su habitación, su sitio y la posición 2D del
// sitio). Si el sitio no existe, el objeto no cabe o está ocupado por otro, devuelve la misma casa sin cambios. Lo que
// el objeto llevaba encima (si es un mueble y cambia de sitio) se guarda en el baúl.
export function colocar(plano: Plano, casa: Casa, id: string, h: string): Casa {
  const s = sitioDe(plano, casa, h);
  if (!s || s.mueble === id || !cabe(tamanoDe(plano, id), s.tipo) || quienEsta(casa, h, id)) return casa;
  if (casa[id] && casa[id].h === h) return casa;
  return { ...guardaEncima(plano, casa, id, h), [id]: { x: s.x, y: s.y, r: s.r, h } };
}

// guardaEncima(plano, casa, mueble, nuevoH?): la casa con lo que hay encima del mueble guardado en el baúl (si el
// mueble no se queda en nuevoH). Si no es un mueble con sitios encima, la casa tal cual.
function guardaEncima(plano: Plano, casa: Casa, mueble: string, nuevoH?: string): Casa {
  const p = casa[mueble];
  if (!p || !p.h || p.h === nuevoH || !Object.hasOwn(plano.encima, mueble)) return casa;
  const r = p.r || 'salon',
    prefijo = r + ':' + mueble + ':';
  const fuera = Object.keys(casa).filter((k) => (casa[k].h || '').startsWith(prefijo));
  if (!fuera.length) return casa;
  return { ...casa, ...Object.fromEntries(fuera.map((k) => [k, alBaul(casa[k])])) };
}

// alBaul(p): la posición p guardada en el baúl: r = EN_BAUL y sin sitio (x e y se quedan, por si algo las lee).
function alBaul(p: PosCasa): PosCasa {
  return { x: p.x, y: p.y, r: EN_BAUL };
}

// guardar(plano, casa, id): la casa con el objeto id guardado en el baúl, y con él lo que tuviera encima. Si id no
// está en la casa, la misma casa.
export function guardar(plano: Plano, casa: Casa, id: string): Casa {
  const p = casa[id];
  if (!p) return casa;
  return { ...guardaEncima(plano, casa, id), [id]: alBaul(p) };
}

// ORDEN_ASIGNAR: en qué orden se buscan sitios al asignarlos: primero los muebles con sitios encima (para que existan
// esos sitios), luego lo grande, la pared y la alfombra, lo mediano y al final lo pequeño.
const ORDEN_ASIGNAR: readonly TamanoObjeto[] = ['grande', 'pared', 'alfombra', 'mediano', 'pequeno'];

// asignarSitios(plano, casa): la casa con un sitio (h) para cada objeto que no lo tiene o lo tiene mal (no existe, no
// cabe o está repetido), en su misma habitación y lo más cerca posible de donde estaba (x, y). Lo que no quepa se
// queda como estaba, sin sitio (la escena decidirá qué hacer con ello: desde la fase M2, guardarlo en el baúl). No
// mueve x ni y ni la habitación de nadie, y no toca lo que está en el baúl ni lo que ya tiene un sitio bueno. Volver a
// llamarla con su resultado no cambia nada. La usa la migración 4 → 5 (dominio/partida.ts).
export function asignarSitios(plano: Plano, casa: Casa): Casa {
  const nueva: Record<string, PosCasa> = {};
  // los que ya tienen un sitio bueno se quedan (el primero que lo tenga, si hay dos con el mismo)
  // (lo que no es una posición, con x e y numéricas, se deja tal cual: la partida puede venir rota y la arregla sanoHondo)
  const pendientes = Object.keys(casa).filter((id) => {
    const p = casa[id];
    nueva[id] = p;
    return esPosicion(p) && p.r !== EN_BAUL;
  });
  const buenos = new Set<string>();
  const sinSitio: string[] = [];
  for (const id of pendientes) {
    const p = nueva[id],
      s = p.h ? sitioDe(plano, nueva, p.h) : undefined;
    const ok =
      s &&
      s.r === (p.r || 'salon') &&
      s.mueble !== id &&
      cabe(tamanoDe(plano, id), s.tipo) &&
      !usado(buenos, nueva, s.id);
    if (ok) buenos.add(id);
    else sinSitio.push(id);
  }
  // los que quedan, por orden (muebles con sitios encima primero; luego por tamaño y, dentro, de atrás hacia delante)
  const conEncima = (id: string) => (Object.hasOwn(plano.encima, id) ? 0 : 1);
  sinSitio.sort(
    (a, b) =>
      conEncima(a) - conEncima(b) ||
      ORDEN_ASIGNAR.indexOf(tamanoDe(plano, a)) - ORDEN_ASIGNAR.indexOf(tamanoDe(plano, b)) ||
      nueva[a].y - nueva[b].y,
  );
  for (const id of sinSitio) {
    const p = nueva[id],
      r = p.r || 'salon';
    const { h: _viejo, ...sinH } = p;
    nueva[id] = sinH;
    const vista: Casa = Object.fromEntries(Object.entries(nueva).filter(([k]) => buenos.has(k)));
    const s = sitioMasCercano(plano, r, vista, id, p.x, p.y);
    if (s) {
      nueva[id] = { ...sinH, h: s.id };
      buenos.add(id);
    }
  }
  return nueva;
}

// esPosicion(p): ¿p es una posición de la casa con x e y numéricas? (una partida rota puede traer cualquier cosa)
function esPosicion(p: unknown): p is PosCasa {
  const o = p as PosCasa | null;
  return !!o && typeof o === 'object' && Number.isFinite(o.x) && Number.isFinite(o.y);
}

// usado(buenos, casa, h): ¿algún objeto de buenos ocupa ya el sitio h?
function usado(buenos: ReadonlySet<string>, casa: Casa, h: string): boolean {
  return [...buenos].some((id) => casa[id].h === h);
}

// ordenar(plano, casa, habitual, abiertas): «¡Ordena, Tito!» (se usará desde la fase M2): la casa con cada objeto que
// no está en el baúl en su habitación habitual (habitual(id); si no está abierta, el salón), en el sitio libre que
// prefiera su tamaño. Lo que no quepa se guarda en el baúl. Los objetos se colocan en el orden de asignarSitios.
export function ordenar(
  plano: Plano,
  casa: Casa,
  habitual: (id: string) => string | undefined,
  abiertas: readonly string[],
): Casa {
  const fuera = Object.keys(casa).filter((id) => casa[id] && casa[id].r !== EN_BAUL);
  const conEncima = (id: string) => (Object.hasOwn(plano.encima, id) ? 0 : 1);
  fuera.sort(
    (a, b) =>
      conEncima(a) - conEncima(b) ||
      ORDEN_ASIGNAR.indexOf(tamanoDe(plano, a)) - ORDEN_ASIGNAR.indexOf(tamanoDe(plano, b)),
  );
  let nueva: Record<string, PosCasa> = { ...casa, ...Object.fromEntries(fuera.map((id) => [id, alBaul(casa[id])])) };
  for (const id of fuera) {
    const quiere = habitual(id),
      r = quiere && abiertas.includes(quiere) ? quiere : 'salon';
    const s = sitioMasCercano(plano, r, nueva, id, 0, 0);
    if (s) nueva = { ...nueva, [id]: { x: s.x, y: s.y, r, h: s.id } };
  }
  return nueva;
}
