/*
 * aplicacion/puertos.ts: los puertos del juego (fases 3g y 3h de docs/PLAN-MIGRACION.md): lo que el juego necesita de
 * fuera, dicho como interfaces. Reloj da la fecha y la hora de ahora; Azar, números al azar; Guardado, el sitio donde
 * se guardan la partida y sus marcas (textos por clave). El juego los pide con ahora(), azar(), leerGuardado(),
 * escribirGuardado() y alGuardarFuera() (nunca con new Date(), Date.now(), Math.random() ni localStorage), sin saber de
 * dónde salen: los adaptadores de verdad, los del navegador, están en src/infraestructura/navegador.ts, e
 * infraestructura/conectar.ts los conecta antes que nada (src/modulos.ts lo importa el primero). Una prueba puede
 * conectar otros con ponPuertos: un reloj parado en una fecha, un azar que siempre da lo mismo, un guardado en memoria.
 * Otro día, una base de datos en la nube sería otro adaptador del puerto Guardado.
 * Exporta: los tipos Reloj, Azar, Guardado y Puertos y las funciones ponPuertos, ahora, azar, leerGuardado,
 * escribirGuardado y alGuardarFuera.
 * No importa nada.
 */

/** El reloj: la fecha y la hora de ahora (hora local). */
export interface Reloj {
  ahora(): Date;
}

/** El azar: un número de 0 (incluido) a 1 (sin incluir), como Math.random. */
export interface Azar {
  numero(): number;
}

/** El guardado: textos guardados por clave (en el navegador, localStorage). Nunca da error: si no se puede leer o
 * escribir (modo privado, sin espacio, almacenamiento bloqueado), leer da null y escribir, false. */
export interface Guardado {
  /** El texto guardado con la clave, o null si no hay o no se puede leer. */
  leer(clave: string): string | null;
  /** Guarda el texto con la clave; false si no se pudo. */
  escribir(clave: string, texto: string): boolean;
  /** Llama a fn(clave, texto) cada vez que otra pestaña con el juego guarda algo (texto null si lo borró). */
  alCambiarFuera(fn: (clave: string, texto: string | null) => void): void;
}

/** Los adaptadores conectados a los puertos. */
export interface Puertos {
  readonly reloj: Reloj;
  readonly azar: Azar;
  readonly guardado: Guardado;
}

// conectados: los adaptadores de ahora (null hasta que infraestructura/conectar.ts los pone).
let conectados: Puertos | null = null;

// ponPuertos(p): conecta los adaptadores p (infraestructura/conectar.ts al cargar; una prueba, los suyos).
export function ponPuertos(p: Puertos): void {
  conectados = p;
}

// puertos(): los adaptadores conectados. Si aún no hay (un módulo que pide la hora antes de conectar), da un error que
// lo dice, en vez de seguir con una hora o un azar que no son.
function puertos(): Puertos {
  if (!conectados) throw new Error('Puertos sin conectar: src/modulos.ts tiene que importar primero infraestructura/conectar.ts');
  return conectados;
}

// ahora(): la fecha y la hora de ahora, del reloj conectado (en el juego, el del navegador: new Date()).
export function ahora(): Date {
  return puertos().reloj.ahora();
}

// azar(): un número al azar de 0 (incluido) a 1 (sin incluir), del azar conectado (en el juego, Math.random()).
export function azar(): number {
  return puertos().azar.numero();
}

// leerGuardado(clave): el texto guardado con la clave (en el juego, de localStorage), o null si no hay o no se puede.
export function leerGuardado(clave: string): string | null {
  return puertos().guardado.leer(clave);
}

// escribirGuardado(clave, texto): guarda el texto con la clave; devuelve false si no se pudo (y el juego sigue).
export function escribirGuardado(clave: string, texto: string): boolean {
  return puertos().guardado.escribir(clave, texto);
}

// alGuardarFuera(fn): llama a fn(clave, texto) cuando otra pestaña con el juego guarda algo (en el navegador, el evento
// storage). nucleo/guardado.ts lo usa para adoptar la partida que guardó la otra pestaña.
export function alGuardarFuera(fn: (clave: string, texto: string | null) => void): void {
  puertos().guardado.alCambiarFuera(fn);
}
