/*
 * dominio/casa.ts: las reglas de la casa de Tito interactiva y de las mascotas que crecen (fase C1 de
 * docs/PLAN-CASA.md). Qué hace Tito con cada objeto de la casa (REACCIONES: su acción y, si la tiene, la escena
 * pequeña que abre), qué dos objetos juntos dan una sorpresa (COMBINACIONES), cómo se apuntan las sorpresas
 * descubiertas para el álbum, cómo se cuidan y crecen las mascotas de la tienda (bebé, joven y mayor, por días
 * cuidados; nunca enferman ni pierden lo crecido) y cómo crece la flor del huerto al regarla.
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de pantalla ni de S y no cambia lo que recibe. Recibe lo
 * guardado (S.sorpresas, S.mascotas, S.huerto) y la fecha de hoy ('AAAA-MM-DD') y devuelve la respuesta o la ficha
 * nueva. La escena de la casa (escenas/tienda.ts) la usará desde la fase C2; dominio/partida.ts usa MASCOTAS y
 * fichaComprada en la migración 3 → 4.
 * Pruebas: tests/unidad/casa.test.ts.
 * Desde la fase M3b de docs/PLAN-CASA-MEJORA.md, las otras formas de jugar de Tito con cada objeto (VARIANTES,
 * variantesDe y varianteDe) y 13 combinaciones más.
 * Exporta: los tipos AccionTito, EscenaCasa, Reaccion, Combinacion, Cuidado, FichaMascota, Huerto y Cuidar; las
 * tablas REACCIONES, VARIANTES, COMBINACIONES, MASCOTAS, CUIDADOS, CUIDADOS_POR_DIA, DIAS_ETAPA, FLOR_DIAS y TOTAL_SORPRESAS; y
 * las reglas reaccionDe, variantesDe, varianteDe, combinacion, idSorpresa, descubrir, cuantasSorpresas, fichaNueva, fichaComprada,
 * fichaDe, etapaMascota, cuidadosDe, cuidar, quiereHoy, huertoNuevo, regar y etapaFlor.
 * Importa: contarDia y etapaPorDias de dominio/crecer.ts (desde la fase P8 de docs/IDEAS-MEJORA.md, la regla común de
 * crecer por días).
 */
import { contarDia, etapaPorDias } from './crecer.ts';
/* eslint-disable ts-patterns/no-magic-numbers -- los números de este archivo son las reglas mismas (días que pide
   cada etapa, cuidados por día), en tablas con nombre; sacarlos a otra constante solo repetiría el nombre. */

/** Lo que hace Tito cuando llega a un objeto (la animación la dibuja la escena, desde la fase C2). */
export type AccionTito =
  | 'mirar'
  | 'sentarse'
  | 'tumbarse'
  | 'abrir'
  | 'tocar'
  | 'empujar'
  | 'abrazar'
  | 'chutar'
  | 'bailar'
  | 'girar'
  | 'soplar'
  | 'bañarse'
  | 'secarse'
  | 'regar'
  | 'columpiarse'
  | 'tirarse'
  | 'comer'
  | 'remover'
  | 'pintar'
  | 'volar'
  | 'encender'
  | 'croqueta'
  | 'saltar';

/** Las escenas pequeñas que abren los objetos grandes (fases C3 a C5). */
export type EscenaCasa =
  'cielo' | 'mundo' | 'tele' | 'instrumentos' | 'pizarra' | 'buenasNoches' | 'merienda' | 'sopa' | 'bano' | 'huerto';

/** Qué pasa al tocar un objeto: lo que hace Tito y, en los objetos grandes, la escena que se abre después. */
export interface Reaccion {
  readonly tito: AccionTito;
  readonly escena?: EscenaCasa;
}

// REACCIONES: id del objeto de la casa (el de la tienda, SHOP) → su reacción. Están los 49 objetos que no son
// mascotas, por habitación como en la tabla de docs/PLAN-CASA.md. Las mascotas no están: al tocarlas se cuidan.
export const REACCIONES: Readonly<Record<string, Reaccion>> = {
  // torre de las estrellas
  telescopio: { tito: 'mirar', escena: 'cielo' },
  tierra: { tito: 'girar', escena: 'mundo' },
  saturno: { tito: 'girar' },
  cohete: { tito: 'volar' },
  // salón
  sofa: { tito: 'sentarse' },
  tele: { tito: 'encender', escena: 'tele' },
  alfombra: { tito: 'croqueta' },
  cuadro: { tito: 'mirar' },
  plantaInterior: { tito: 'mirar' },
  lampara: { tito: 'encender' },
  banco: { tito: 'sentarse' },
  estanteria: { tito: 'abrir' },
  reloj: { tito: 'mirar' },
  farol: { tito: 'encender' },
  piano: { tito: 'tocar', escena: 'instrumentos' },
  fuente: { tito: 'mirar' },
  // dormitorio
  cama: { tito: 'tumbarse', escena: 'buenasNoches' },
  baul: { tito: 'abrir' },
  cuento: { tito: 'abrir' },
  estrellas: { tito: 'mirar' },
  // cocina
  mesa: { tito: 'sentarse' },
  silla: { tito: 'sentarse' },
  nevera: { tito: 'abrir', escena: 'merienda' },
  olla: { tito: 'remover', escena: 'sopa' },
  tarta: { tito: 'soplar' },
  // baño
  banera: { tito: 'bañarse', escena: 'bano' },
  toalla: { tito: 'secarse' },
  jabon: { tito: 'soplar' },
  pato: { tito: 'tocar' },
  // cuarto de juegos
  pelotaPlaya: { tito: 'chutar' },
  bloques: { tito: 'empujar' },
  peluche: { tito: 'abrazar' },
  cometa: { tito: 'volar' },
  xilofono: { tito: 'tocar', escena: 'instrumentos' },
  muneca: { tito: 'bailar' },
  robot: { tito: 'bailar' },
  trenJuguete: { tito: 'empujar' },
  guitarra: { tito: 'tocar', escena: 'instrumentos' },
  tambor: { tito: 'tocar', escena: 'instrumentos' },
  pizarra: { tito: 'pintar', escena: 'pizarra' },
  pinturas: { tito: 'pintar' },
  globo: { tito: 'soplar' },
  tobogan: { tito: 'tirarse' },
  // jardín
  arbol: { tito: 'empujar' },
  plantaFlor: { tito: 'regar', escena: 'huerto' },
  regadera: { tito: 'regar' },
  columpio: { tito: 'columpiarse' },
  castillo: { tito: 'tocar' },
  piscina: { tito: 'tirarse' },
};

// reaccionDe(id): la reacción del objeto id, o null si no tiene (una mascota, un id desconocido).
export function reaccionDe(id: string): Reaccion | null {
  return Object.hasOwn(REACCIONES, id) ? REACCIONES[id] : null;
}

// VARIANTES: las otras formas de jugar de Tito con un objeto (capa 3 de docs/PLAN-CASA-MEJORA.md, desde la fase M3b),
// además de la de REACCIONES, que es la primera. Cada vez que Tito juega con el mismo objeto hace la siguiente: se
// sienta en el sofá, luego salta en él y luego se echa la siesta. Solo usan acciones de AccionTito que ya se dibujan;
// lo que dice en cada una está en FRASES_VARIANTES (contenido/casa.ts), en el mismo orden.
export const VARIANTES: Readonly<Record<string, readonly AccionTito[]>> = {
  // torre de las estrellas
  telescopio: ['girar'],
  tierra: ['tocar'],
  cohete: ['tocar'],
  // salón
  sofa: ['saltar', 'tumbarse'],
  tele: ['bailar'],
  alfombra: ['tumbarse'],
  cuadro: ['tocar'],
  plantaInterior: ['regar'],
  estanteria: ['mirar'],
  reloj: ['bailar'],
  piano: ['bailar'],
  fuente: ['secarse'],
  // dormitorio
  cama: ['saltar', 'tocar'],
  cuento: ['tumbarse'],
  estrellas: ['tocar'],
  // cocina
  mesa: ['tocar'],
  nevera: ['comer'],
  olla: ['soplar'],
  // baño
  banera: ['soplar'],
  // cuarto de juegos
  pelotaPlaya: ['empujar'],
  bloques: ['tocar'],
  peluche: ['bailar', 'tumbarse'],
  xilofono: ['bailar'],
  muneca: ['abrazar'],
  robot: ['empujar'],
  trenJuguete: ['tocar'],
  guitarra: ['bailar'],
  globo: ['volar'],
  // jardín
  arbol: ['mirar'],
  columpio: ['bailar'],
  castillo: ['empujar'],
  piscina: ['bañarse'],
};

// variantesDe(id): todas las formas de jugar de Tito con id, la de REACCIONES primero; vacía si no tiene reacción.
export function variantesDe(id: string): readonly AccionTito[] {
  const r = reaccionDe(id);
  if (!r) return [];
  return [r.tito, ...(Object.hasOwn(VARIANTES, id) ? VARIANTES[id] : [])];
}

// varianteDe(id, vez): la forma de jugar que toca la vez número vez (0, 1, 2...) que Tito juega con id: su acción y su
// número (n, 0 = la de REACCIONES), dando la vuelta al acabar. null si id no tiene reacción.
export function varianteDe(id: string, vez: number): { accion: AccionTito; n: number } | null {
  const v = variantesDe(id);
  if (!v.length) return null;
  const n = ((Math.floor(vez) % v.length) + v.length) % v.length;
  return { accion: v[n], n };
}

/** Dos objetos que, si se juntan (uno arrastrado encima del otro, o los dos en la misma habitación), dan una sorpresa. */
export interface Combinacion {
  readonly a: string;
  readonly b: string;
}

// COMBINACIONES: las parejas de objetos con sorpresa (la tabla de docs/PLAN-CASA.md). El orden de a y b no importa.
export const COMBINACIONES: readonly Combinacion[] = [
  { a: 'pato', b: 'banera' },
  { a: 'jabon', b: 'banera' },
  { a: 'toalla', b: 'banera' },
  { a: 'regadera', b: 'plantaFlor' },
  { a: 'regadera', b: 'plantaInterior' },
  { a: 'pelotaPlaya', b: 'casitaPerro' },
  { a: 'cuento', b: 'cama' },
  { a: 'sofa', b: 'tele' },
  { a: 'robot', b: 'muneca' },
  { a: 'lampara', b: 'estrellas' },
  { a: 'telescopio', b: 'saturno' },
  { a: 'mesa', b: 'silla' },
  { a: 'pinturas', b: 'pizarra' },
  { a: 'trenJuguete', b: 'tobogan' },
  // desde la fase M3b de docs/PLAN-CASA-MEJORA.md: 13 más; las de un objeto pequeño y un mueble (la tarta y la mesa,
  // el peluche y la cama...) salen también al dejarlo encima del mueble
  { a: 'tarta', b: 'mesa' },
  { a: 'olla', b: 'mesa' },
  { a: 'peluche', b: 'cama' },
  { a: 'cuento', b: 'sofa' },
  { a: 'pato', b: 'piscina' },
  { a: 'pelotaPlaya', b: 'piscina' },
  { a: 'guitarra', b: 'tambor' },
  { a: 'xilofono', b: 'piano' },
  { a: 'cometa', b: 'arbol' },
  { a: 'reloj', b: 'cama' },
  { a: 'pajaro', b: 'arbol' },
  { a: 'regadera', b: 'arbol' },
  { a: 'globo', b: 'tarta' },
];

// combinacion(x, y): la combinación de esos dos objetos (en cualquier orden), o null si no tienen.
export function combinacion(x: string, y: string): Combinacion | null {
  return COMBINACIONES.find((c) => (c.a === x && c.b === y) || (c.a === y && c.b === x)) ?? null;
}

// idSorpresa(x, y): cómo se apunta una sorpresa: el id del objeto (su reacción) o 'a+b' para una combinación
// (siempre en el orden de COMBINACIONES, para que se apunte una sola vez).
export function idSorpresa(x: string, y?: string): string {
  if (y === undefined) return x;
  const c = combinacion(x, y);
  return c ? c.a + '+' + c.b : x + '+' + y;
}

// TOTAL_SORPRESAS: cuántas sorpresas hay en el álbum: una por objeto con reacción y una por combinación.
export const TOTAL_SORPRESAS = Object.keys(REACCIONES).length + COMBINACIONES.length;

// descubrir(sorpresas, id): las sorpresas con id apuntada (S.sorpresas: {id: 1}) y si es nueva. No cambia la que recibe.
export function descubrir(
  sorpresas: Readonly<Record<string, number>>,
  id: string,
): { sorpresas: Record<string, number>; nueva: boolean } {
  const nueva = !Object.hasOwn(sorpresas, id);
  return { sorpresas: nueva ? { ...sorpresas, [id]: 1 } : { ...sorpresas }, nueva };
}

// cuantasSorpresas(sorpresas): cuántas de las sorpresas que existen están descubiertas (ignora ids que ya no existen).
export function cuantasSorpresas(sorpresas: Readonly<Record<string, number>>): number {
  const validas = new Set([...Object.keys(REACCIONES), ...COMBINACIONES.map((c) => c.a + '+' + c.b)]);
  return Object.keys(sorpresas).filter((id) => validas.has(id)).length;
}

/* ---------- mascotas ---------- */

// MASCOTAS: los ids de la tienda (SHOP) que son mascotas que crecen. Pipo no está: crece con las estrellas.
export const MASCOTAS: readonly string[] = ['casitaPerro', 'gato', 'pajaro', 'conejo', 'hamster', 'pecera'];

/** Un cuidado: los botones que salen al tocar una mascota. */
export type Cuidado = 'comer' | 'agua' | 'jugar' | 'lavar' | 'mirar';

// CUIDADOS: los cuidados de cada mascota, en el orden de los botones. Los peces solo comen y se miran.
export const CUIDADOS: Readonly<Record<string, readonly Cuidado[]>> = {
  casitaPerro: ['comer', 'agua', 'jugar', 'lavar'],
  gato: ['comer', 'agua', 'jugar', 'lavar'],
  pajaro: ['comer', 'agua', 'jugar', 'lavar'],
  conejo: ['comer', 'agua', 'jugar', 'lavar'],
  hamster: ['comer', 'agua', 'jugar', 'lavar'],
  pecera: ['comer', 'mirar'],
};

// cuidadosDe(id): los cuidados de esa mascota (los cuatro de siempre si no está en CUIDADOS).
export function cuidadosDe(id: string): readonly Cuidado[] {
  return Object.hasOwn(CUIDADOS, id) ? CUIDADOS[id] : ['comer', 'agua', 'jugar', 'lavar'];
}

// CUIDADOS_POR_DIA: cuidados distintos en un día para que ese día cuente.
export const CUIDADOS_POR_DIA = 2;

// DIAS_ETAPA: días cuidados (en total, no seguidos) para ser joven y para ser mayor.
export const DIAS_ETAPA: readonly number[] = [3, 8];

/**
 * La ficha de una mascota (S.mascotas[id]): nombre ('' hasta que el niño lo elige), días cuidados, el día de los
 * cuidados de hoy ('AAAA-MM-DD' o '') y qué cuidados se hicieron ese día.
 */
export interface FichaMascota {
  readonly nombre: string;
  readonly dias: number;
  readonly dia: string;
  readonly hechos: readonly Cuidado[];
}

// fichaNueva(): una mascota recién comprada: bebé, sin nombre y sin cuidados.
export function fichaNueva(): FichaMascota {
  return { nombre: '', dias: 0, dia: '', hechos: [] };
}

// fichaComprada(): una mascota comprada antes de que crecieran (migración 3 → 4 y fichaDe): ya es joven, así se ve
// casi como antes y aún crece una vez (decisión 5 del plan).
export function fichaComprada(): FichaMascota {
  return { nombre: '', dias: DIAS_ETAPA[0], dia: '', hechos: [] };
}

// fichaDe(fichas, id): la ficha de la mascota id; si no tiene (comprada antes de la fase C6) cuenta como fichaComprada.
// Arregla una ficha rota (campos que faltan o de otro tipo) sin perder los días cuidados.
export function fichaDe(fichas: Readonly<Record<string, unknown>>, id: string): FichaMascota {
  const f = Object.hasOwn(fichas, id) ? fichas[id] : null;
  if (!f || typeof f !== 'object' || Array.isArray(f)) return fichaComprada();
  const c = f as Record<string, unknown>;
  const dias =
    typeof c['dias'] === 'number' && Number.isFinite(c['dias']) && c['dias'] >= 0
      ? Math.floor(c['dias'])
      : DIAS_ETAPA[0];
  const hechos = Array.isArray(c['hechos']) ? (c['hechos'].filter((h) => typeof h === 'string') as Cuidado[]) : [];
  return {
    nombre: typeof c['nombre'] === 'string' ? c['nombre'] : '',
    dias,
    dia: typeof c['dia'] === 'string' ? c['dia'] : '',
    hechos,
  };
}

// etapaMascota(dias): 0 bebé, 1 joven, 2 mayor: cuántos escalones de DIAS_ETAPA alcanza. Nunca baja.
export function etapaMascota(dias: number): number {
  return etapaPorDias(dias, DIAS_ETAPA);
}

/** Lo que devuelve cuidar: la ficha nueva, si el día acaba de contar y si la mascota acaba de crecer. */
export interface Cuidar {
  readonly ficha: FichaMascota;
  readonly cuenta: boolean;
  readonly crece: boolean;
}

// cuidar(ficha, cuidado, hoy): la ficha tras hacer ese cuidado hoy. Si es el primer cuidado de hoy, empieza la lista
// del día; un cuidado repetido no suma. Al llegar a CUIDADOS_POR_DIA distintos, el día cuenta (dias + 1) y, si con
// eso pasa de etapa, crece. Nunca resta nada: si un día no se cuida, ese día no cuenta y ya está.
export function cuidar(ficha: FichaMascota, cuidado: Cuidado, hoy: string): Cuidar {
  const previos = ficha.dia === hoy ? ficha.hechos : [];
  if (previos.includes(cuidado))
    return { ficha: { ...ficha, dia: hoy, hechos: [...previos] }, cuenta: false, crece: false };
  const hechos = [...previos, cuidado];
  const cuenta = hechos.length === CUIDADOS_POR_DIA;
  const dias = ficha.dias + (cuenta ? 1 : 0);
  return { ficha: { ...ficha, dias, dia: hoy, hechos }, cuenta, crece: etapaMascota(dias) > etapaMascota(ficha.dias) };
}

// quiereHoy(ficha, id, hoy): lo que la mascota pide hoy en su bocadillo: el primer cuidado suyo que aún no se ha hecho
// hoy, o null si hoy ya está cuidada (ya contó el día).
export function quiereHoy(ficha: FichaMascota, id: string, hoy: string): Cuidado | null {
  const hechos = ficha.dia === hoy ? ficha.hechos : [];
  if (hechos.length >= CUIDADOS_POR_DIA) return null;
  return cuidadosDe(id).find((c) => !hechos.includes(c)) ?? null;
}

/* ---------- el huerto ---------- */

/** La flor del huerto (S.huerto): días regados (en total) y el último día que se regó ('AAAA-MM-DD' o ''). */
export interface Huerto {
  readonly dias: number;
  readonly dia: string;
}

// huertoNuevo(): el huerto sin regar.
export function huertoNuevo(): Huerto {
  return { dias: 0, dia: '' };
}

// FLOR_DIAS: días regados para cada etapa de la flor (1 brote, 2 hojas, 3 capullo, 4 flor abierta).
export const FLOR_DIAS: readonly number[] = [1, 3, 5, 8];

// regar(huerto, hoy): el huerto tras regarlo hoy. Cuenta una vez al día; regar otra vez el mismo día no suma.
export function regar(huerto: Huerto, hoy: string): { huerto: Huerto; cuenta: boolean } {
  const r = contarDia(huerto, hoy);
  return { huerto: r.crecimiento, cuenta: r.cuenta };
}

// etapaFlor(dias): etapa de la flor (0 semilla a 4 flor abierta) con esos días regados.
export function etapaFlor(dias: number): number {
  return etapaPorDias(dias, FLOR_DIAS);
}
