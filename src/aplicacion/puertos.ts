/*
 * aplicacion/puertos.ts: los puertos del juego (fase 3g de docs/PLAN-MIGRACION.md): lo que el juego necesita de fuera,
 * dicho como interfaces. Reloj da la fecha y la hora de ahora; Azar, números al azar. El juego los pide con ahora() y
 * azar() (nunca con new Date(), Date.now() ni Math.random()), sin saber de dónde salen: los adaptadores de verdad, los
 * del navegador, están en src/infraestructura/navegador.ts, e infraestructura/conectar.ts los conecta antes que nada
 * (src/modulos.ts lo importa el primero). Una prueba puede conectar otros con ponPuertos: un reloj parado en una fecha,
 * un azar que siempre da lo mismo.
 * Exporta: los tipos Reloj, Azar y Puertos y las funciones ponPuertos, ahora y azar.
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

/** Los adaptadores conectados a los puertos. */
export interface Puertos {
  readonly reloj: Reloj;
  readonly azar: Azar;
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
