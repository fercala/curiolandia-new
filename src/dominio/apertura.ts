/*
 * dominio/apertura.ts: las reglas de qué está abierto en Curiolandia (fase 3a de docs/PLAN-MIGRACION.md). Zonas,
 * casitas (temas), juegos de una casita y sitios del mapa, y qué toca ahora: la casita que brilla en cada zona y la del
 * botón «seguir el camino».
 * Es DOMINIO: no sabe nada de lienzos, sonido, voz ni localStorage, y no escribe nada. Cada regla recibe la partida
 * (Partida: modo libre, edad, mes de hoy y progreso de cada tema) y el mapa (Mapa: los temas de cada zona y los temas
 * sueltos). escenas/zonas.ts le pasa los de verdad (S, AGE(), la fecha y ZONES) y conserva los nombres de antes
 * (zoneOpen, temaOpen, gameOpen...); tests/unidad/apertura.test.ts prueba las reglas con partidas inventadas.
 * Desde la fase L1 de docs/PLAN-LECTURA.md también sabe de la Isla de las Letras: sus tres zonas (ZONAS_LETRAS) se
 * abren como las principales (por edad o con 6 flores en la anterior) y tienen su propio «seguir» (siguienteLetra),
 * pero sus casitas no cuentan para abrir nada del mapa grande (terminadasPrincipales solo mira MAINZ).
 * Desde la fase I1 de docs/PLAN-INGLES.md hay una segunda isla, la Isla del Inglés (ZONAS_INGLES), con las mismas
 * reglas: las islas están en la tabla ISLAS y las reglas de isla (zonaDeIslaDeLaEdad, siguienteDeIsla) sirven para las
 * dos; zonaDeLetrasDeLaEdad y siguienteLetra son las de la Isla de las Letras.
 * Exporta: ZAGE, MAINZ, ZONAS_LETRAS, ZONAS_INGLES, ISLAS y NEED (los números de las reglas), los tipos TemaAbrible, Progreso, Partida y
 * Mapa, y las reglas: flores, camino, terminadasEnCamino, terminadasPrincipales, zonaAbierta, fiestaDelMes, empezado,
 * temaAbierto, juegoAbierto, siguienteJuego, zonaDeLaEdad, temaQueToca, siguienteTema, zonaDeIslaDeLaEdad,
 * siguienteDeIsla, zonaDeLetrasDeLaEdad, siguienteLetra, sitioAbierto y sitioNecesita.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de este archivo son las reglas mismas, en tablas con nombre
   (edades, casitas que pide cada cosa, meses); sacarlos a otra constante solo repetiría el nombre de la tabla. */

/** Lo que miran las reglas de un tema: su id, su zona, si es el Rincón de los Conceptos y sus juegos. */
export interface TemaAbrible {
  readonly id: string;
  readonly zone?: string;
  readonly concepts?: unknown;
  readonly games: readonly unknown[];
}

/** Progreso guardado de un tema (S.temas[id]): juegos terminados por número (g) y si el tema está terminado (done). */
export interface Progreso {
  readonly g: Readonly<Record<number, unknown>>;
  readonly done?: unknown;
}

/** La partida, como la ven las reglas. */
export interface Partida {
  /** Modo libre (zona de adultos, S.unlockAll): todo abierto. */
  readonly libre: boolean;
  /** Edad del niño: 3, 4 o 5. */
  readonly edad: number;
  /** Mes de hoy, de 0 (enero) a 11 (diciembre): decide la fiesta del mes. Es una función para leer la fecha solo si hace falta. */
  mes(): number;
  /** Progreso del tema id; uno vacío ({g: {}}) si aún no se ha jugado. */
  progreso(id: string): Progreso;
}

/** El mapa de Curiolandia, como lo ven las reglas. */
export interface Mapa<T extends TemaAbrible> {
  /** Temas de cada zona con camino, en el orden del camino (ZONES[z].temas): jardin, bosque, montana, fiestas
   * y, desde la fase L1, las zonas de la Isla de las Letras (ZONAS_LETRAS) y, desde la fase I1, las de la Isla del
   * Inglés (ZONAS_INGLES); si aún no están, cuentan como vacías. */
  readonly zonas: Readonly<Record<string, readonly T[]>>;
  /** Temas sueltos del mapa: canciones (CAN), rutinas (RUT) y trazos (TRZ). */
  readonly can: T;
  readonly rut: T;
  readonly trz: T;
}

// ZAGE: edad de cada zona por edades (las principales y las de las islas). Si el niño tiene esa edad o más, la zona
// está abierta desde el principio.
export const ZAGE: Readonly<Record<string, number>> = {
  jardin: 3, bosque: 4, montana: 5, playaSonidos: 3, bosqueLetras: 4, puebloPalabras: 5,
  playaHello: 3, parqueLondres: 4, puebloCuentos: 5,
};

// MAINZ: las tres zonas principales por edad, en orden.
export const MAINZ: readonly string[] = ['jardin', 'bosque', 'montana'];

// ZONAS_LETRAS: las tres zonas de la Isla de las Letras por edad, en orden: la Playa de los Sonidos (3 años), el
// Bosque de las Letras (4) y el Pueblo de las Palabras (5). Sus letras están en contenido/letras.ts.
export const ZONAS_LETRAS: readonly string[] = ['playaSonidos', 'bosqueLetras', 'puebloPalabras'];

// ZONAS_INGLES: las tres zonas de la Isla del Inglés por edad, en orden (fase I1 de docs/PLAN-INGLES.md): la Playa
// Hello (3 años), el Parque de Londres (4) y el Pueblo de los Cuentos (5). Sus palabras están en contenido/ingles.ts.
export const ZONAS_INGLES: readonly string[] = ['playaHello', 'parqueLondres', 'puebloCuentos'];

// ISLAS: las zonas de cada isla, en el orden de las edades. Cada isla tiene su propio «seguir» (siguienteDeIsla) y
// no abre nada del mapa grande, ni el mapa grande la abre a ella.
export const ISLAS: Readonly<Record<'letras' | 'ingles', readonly string[]>> = { letras: ZONAS_LETRAS, ingles: ZONAS_INGLES };

/** Una de las islas de ISLAS: 'letras' o 'ingles'. */
export type Isla = keyof typeof ISLAS;

// ZONA_ANTERIOR: de qué zona hacen falta las flores para abrir cada zona antes de tener su edad (zonaAbierta).
const ZONA_ANTERIOR: Readonly<Record<string, string>> = {
  bosque: 'jardin', montana: 'bosque', bosqueLetras: 'playaSonidos', puebloPalabras: 'bosqueLetras',
  parqueLondres: 'playaHello', puebloCuentos: 'parqueLondres',
};

// NEED: cuántas casitas del camino (terminadasPrincipales) hay que terminar para abrir cada cosa:
// 'X-CAN' canciones, 'X-RUT' rutinas, 'X-TRZ' trazos, fiestas; concepts = casitas de ESA zona
// (terminadasEnCamino) para el Rincón de los Conceptos. OJO: lockMsg (escenas/zonas.ts) y algunas frases dicen el
// número con palabras ("tres", "cuatro", "dos"): si cambia aquí, cambian allí.
export const NEED: Readonly<Record<string, number>> = { 'X-CAN': 1, 'X-RUT': 2, 'X-TRZ': 3, fiestas: 4, concepts: 3 };
// (Hasta la fase I2 de docs/PLAN-INGLES.md, el Rincón del inglés pedía 2 casitas; la Isla del Inglés está abierta desde
// el principio, como la de las Letras.)

// Flores (temas terminados) que hace falta tener en una zona para abrir la siguiente sin tener la edad.
const FLORES_PARA_SEGUIR = 6;

// Zona de cada edad (zonaDeLaEdad): la de 3 años es el jardín.
const ZONA_DE_EDAD: Readonly<Record<number, string>> = { 3: 'jardin', 4: 'bosque', 5: 'montana' };

// Primera edad de las islas: la zona de 3 años de cada isla es la primera de su lista (zonaDeIslaDeLaEdad).
const EDAD_MINIMA = 3;

// terminado(p, t): true si el tema t está terminado.
const terminado = (p: Partida, t: TemaAbrible): boolean => !!p.progreso(t.id).done;

// flores(p, m, z): temas terminados en la zona z (cada tema terminado es una flor de Tito). Cuenta también el Rincón
// de los Conceptos.
export function flores<T extends TemaAbrible>(p: Partida, m: Mapa<T>, z: string): number {
  return (m.zonas[z] ?? []).filter((t) => terminado(p, t)).length;
}

// camino(m, z): los temas del camino de la zona z, en orden, sin el Rincón de los Conceptos.
export function camino<T extends TemaAbrible>(m: Mapa<T>, z: string): T[] {
  return (m.zonas[z] ?? []).filter((t) => !t.concepts);
}

// terminadasEnCamino(p, m, z): cuántas casitas del camino de la zona z están terminadas.
export function terminadasEnCamino<T extends TemaAbrible>(p: Partida, m: Mapa<T>, z: string): number {
  return camino(m, z).filter((t) => terminado(p, t)).length;
}

// terminadasPrincipales(p, m): casitas del camino terminadas sumando las tres zonas principales. Es lo que miran los
// NEED de canciones, rutinas, trazos y fiestas.
export function terminadasPrincipales<T extends TemaAbrible>(p: Partida, m: Mapa<T>): number {
  return MAINZ.reduce((a, z) => a + terminadasEnCamino(p, m, z), 0);
}

// zonaAbierta(p, m, z): ¿está abierta la zona z? Las primeras de cada lista (jardín, Playa de los Sonidos, Playa
// Hello) y las
// zonas sin edad, siempre. Las demás (bosque, montaña y las otras de cada isla): en modo libre o
// si la edad del niño llega (ZAGE[z] <= edad); si no, cuando la zona anterior (ZONA_ANTERIOR) está abierta y tiene 6
// flores (bosque <- jardín, montaña <- bosque, y lo mismo en la isla; es recursiva).
export function zonaAbierta<T extends TemaAbrible>(p: Partida, m: Mapa<T>, z: string): boolean {
  const edad = ZAGE[z];
  const antes = ZONA_ANTERIOR[z];
  if (!edad || !antes) return true;
  if (p.libre || edad <= p.edad) return true;
  return zonaAbierta(p, m, antes) && flores(p, m, antes) >= FLORES_PARA_SEGUIR;
}

// fiestaDelMes(mes): id de la fiesta del mes (diciembre y enero, Navidad; febrero y marzo, Carnaval; abril, Día del
// Libro) o null si ese mes no hay.
export function fiestaDelMes(mes: number): string | null {
  if (mes === 11 || mes === 0) return 'F-navidad';
  if (mes === 1 || mes === 2) return 'F-carnaval';
  return mes === 3 ? 'F-libro' : null;
}

// empezado(p, t): true si el tema t ya está terminado o tiene algún juego jugado (lo empezado nunca se vuelve a cerrar).
export function empezado(p: Partida, t: TemaAbrible): boolean {
  const s = p.progreso(t.id);
  return !!s.done || Object.keys(s.g).length > 0;
}

// anteriorTerminado(p, lista, t): true si t es el primero de la lista (o no está) o si el anterior está terminado.
function anteriorTerminado(p: Partida, lista: readonly TemaAbrible[], t: TemaAbrible): boolean {
  const i = lista.indexOf(t);
  const antes = lista[i - 1];
  return i <= 0 || !antes || terminado(p, antes);
}

// temaAbierto(p, m, t): ¿se puede entrar en la casita del tema t? Reglas, en orden:
// 1) sin tema, no; en modo libre o ya empezado, sí.
// 2) temas de zonas principales y de las islas (de las Letras y del Inglés): la zona tiene que estar abierta; el Rincón de los
//    Conceptos pide NEED.concepts casitas terminadas en su zona; el resto, que la casita anterior del camino esté
//    terminada (la primera, siempre).
// 3) fiestas: hacen falta NEED.fiestas casitas del camino y, además, la anterior terminada (en fiestas vale
//    también que sea la fiesta del mes, que se salta el orden).
// 4) temas sueltos con NEED[t.id] (canciones, rutinas, trazos): NEED[t.id] casitas del camino.
// 5) cualquier otro: abierto.
export function temaAbierto<T extends TemaAbrible>(p: Partida, m: Mapa<T>, t: T | null | undefined): boolean {
  if (!t) return false;
  if (p.libre || empezado(p, t)) return true;
  const z = t.zone ?? '';
  if (MAINZ.includes(z) || ZONAS_LETRAS.includes(z) || ZONAS_INGLES.includes(z)) {
    if (!zonaAbierta(p, m, z)) return false;
    if (t.concepts) return terminadasEnCamino(p, m, z) >= (NEED['concepts'] ?? 0);
    return anteriorTerminado(p, camino(m, z), t);
  }
  if (z === 'fiestas') {
    if (terminadasPrincipales(p, m) < (NEED[z] ?? 0)) return false;
    return anteriorTerminado(p, m.zonas[z] ?? [], t) || fiestaDelMes(p.mes()) === t.id;
  }
  const necesita = NEED[t.id];
  if (necesita != null) return terminadasPrincipales(p, m) >= necesita;
  return true;
}

// juegoAbierto(p, t, j): ¿está abierto el juego j del tema t? El primero, siempre; los demás, si se terminó el
// anterior; los ya jugados, siempre (se pueden repetir). En modo libre, todos.
export function juegoAbierto(p: Partida, t: TemaAbrible, j: number): boolean {
  const g = p.progreso(t.id).g;
  return p.libre || j === 0 || !!g[j] || !!g[j - 1];
}

// siguienteJuego(p, t): número del siguiente juego que toca en el tema t (abierto y sin terminar), o -1 si ya están
// todos.
export function siguienteJuego(p: Partida, t: TemaAbrible): number {
  return t.games.findIndex((_g, j) => !p.progreso(t.id).g[j] && juegoAbierto(p, t, j));
}

// zonaDeLaEdad(p, m): la zona de la edad del niño si está abierta; si no, el jardín.
export function zonaDeLaEdad<T extends TemaAbrible>(p: Partida, m: Mapa<T>): string {
  const z = ZONA_DE_EDAD[p.edad] ?? 'jardin';
  return zonaAbierta(p, m, z) ? z : 'jardin';
}

// pendiente(p, m, t): true si el tema t existe, no está terminado y está abierto (es una casita que se puede hacer ya).
function pendiente<T extends TemaAbrible>(p: Partida, m: Mapa<T>, t: T | undefined): t is T {
  return !!t && !terminado(p, t) && temaAbierto(p, m, t);
}

// temaQueToca(p, m, z): la casita que toca ahora en la zona z (la que brilla y lleva flecha): la primera del camino
// abierta y sin terminar; si no queda, el Rincón de los Conceptos si está abierto y sin terminar; si no, null (camino
// terminado). En fiestas, la primera abierta y sin terminar.
export function temaQueToca<T extends TemaAbrible>(p: Partida, m: Mapa<T>, z: string): T | null {
  if (z === 'fiestas') return (m.zonas['fiestas'] ?? []).find((t) => pendiente(p, m, t)) ?? null;
  const t = camino(m, z).find((t) => pendiente(p, m, t));
  if (t) return t;
  const rincon = (m.zonas[z] ?? []).find((t) => t.concepts);
  return pendiente(p, m, rincon) ? rincon : null;
}

// siguienteTema(p, m): el tema del botón «seguir el camino» del mapa. Busca primero en la zona de su edad, luego en
// las otras zonas principales abiertas; después en los extras, por este orden: canciones, rutinas, trazos,
// rincones de los conceptos y fiestas. null si ya no queda nada.
export function siguienteTema<T extends TemaAbrible>(p: Partida, m: Mapa<T>): T | null {
  const z0 = zonaDeLaEdad(p, m);
  const zonas = [z0, ...MAINZ.filter((z) => z !== z0)].filter((z) => zonaAbierta(p, m, z));
  // La primera casita pendiente de la primera zona que tenga una (en cuanto aparece, no se mira más).
  const enCamino = zonas.reduce<T | undefined>((hallado, z) => hallado ?? camino(m, z).find((t) => pendiente(p, m, t)), undefined);
  if (enCamino) return enCamino;
  const rincones = MAINZ.map((z) => (m.zonas[z] ?? []).find((t) => t.concepts));
  const extras = [m.can, m.rut, m.trz, ...rincones, ...(m.zonas['fiestas'] ?? [])];
  return extras.find((t) => pendiente(p, m, t)) ?? null;
}

// zonaDeIslaDeLaEdad(p, m, isla): la zona de la isla de la edad del niño (la de 3 años es la primera de ISLAS[isla], la
// de 4 la segunda y la de 5 la tercera) si está abierta; si no, la primera de la isla (que siempre lo está).
export function zonaDeIslaDeLaEdad<T extends TemaAbrible>(p: Partida, m: Mapa<T>, isla: Isla): string {
  const zonas = ISLAS[isla];
  const primera = zonas[0] ?? '';
  const z = zonas[p.edad - EDAD_MINIMA] ?? primera;
  return zonaAbierta(p, m, z) ? z : primera;
}

// siguienteDeIsla(p, m, isla): el tema del botón «seguir» de la isla: la primera casita pendiente de la zona de la isla
// de su edad y, si no queda, la de las otras zonas abiertas de la isla, por orden. null si ya no queda nada. No mira el
// mapa grande ni la otra isla, igual que siguienteTema no mira las islas.
export function siguienteDeIsla<T extends TemaAbrible>(p: Partida, m: Mapa<T>, isla: Isla): T | null {
  const z0 = zonaDeIslaDeLaEdad(p, m, isla);
  const zonas = [z0, ...ISLAS[isla].filter((z) => z !== z0)].filter((z) => zonaAbierta(p, m, z));
  return zonas.reduce<T | null>((hallado, z) => hallado ?? camino(m, z).find((t) => pendiente(p, m, t)) ?? null, null);
}

// zonaDeLetrasDeLaEdad(p, m): la zona de la Isla de las Letras de la edad del niño si está abierta; si no, la Playa
// de los Sonidos (zonaDeIslaDeLaEdad de la isla 'letras').
export function zonaDeLetrasDeLaEdad<T extends TemaAbrible>(p: Partida, m: Mapa<T>): string {
  return zonaDeIslaDeLaEdad(p, m, 'letras');
}

// siguienteLetra(p, m): el tema del botón «seguir» de la Isla de las Letras (siguienteDeIsla de la isla 'letras').
export function siguienteLetra<T extends TemaAbrible>(p: Partida, m: Mapa<T>): T | null {
  return siguienteDeIsla(p, m, 'letras');
}

// sitioAbierto(p, m, id): ¿está abierto el sitio id del mapa? Canciones, rutinas y trazos, si su tema está abierto;
// fiestas, según NEED; bosque y montaña, según zonaAbierta; el resto (plaza, jardín, álbum, tienda, casa),
// siempre. En modo libre, todos.
export function sitioAbierto<T extends TemaAbrible>(p: Partida, m: Mapa<T>, id: string): boolean {
  if (p.libre) return true;
  if (id === 'canciones') return temaAbierto(p, m, m.can);
  if (id === 'rutinas') return temaAbierto(p, m, m.rut);
  if (id === 'trazos') return temaAbierto(p, m, m.trz);
  if (id === 'fiestas') return terminadasPrincipales(p, m) >= (NEED[id] ?? 0);
  if (ZAGE[id]) return zonaAbierta(p, m, id);
  return true;
}

// Casitas que pide cada sitio del mapa con candado (sitioNecesita).
const NEED_SITIO: Readonly<Record<string, number | undefined>> = {
  canciones: NEED['X-CAN'], rutinas: NEED['X-RUT'], trazos: NEED['X-TRZ'], fiestas: NEED['fiestas'],
};

// sitioNecesita(id): casitas del camino que hacen falta para abrir el sitio id (el número del cartel de su candado), o
// undefined si no tiene.
export function sitioNecesita(id: string): number | undefined {
  return NEED_SITIO[id];
}
