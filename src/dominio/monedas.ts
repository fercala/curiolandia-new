/*
 * dominio/monedas.ts: las reglas de las monedas (fase 3c de docs/PLAN-MIGRACION.md): cuántas da cada cosa, cuándo da
 * monedas un acierto y cómo se suman y se gastan.
 * Es DOMINIO, como dominio/apertura.ts y dominio/progreso.ts: no sabe nada de pantalla, sonido ni localStorage. ganar
 * y gastar devuelven el monedero nuevo sin cambiar el que reciben; quien llama lo copia en S (S.coins y S.coinsTot) y
 * guarda.
 * La animación de las monedas que vuelan al marcador está en escenas/monedas.ts (creditCoins, giveCoins, spendCoins;
 * antes de la fase 4a, en escenas/tienda.ts), que usa estas reglas, igual que escenas/zonas.ts (regalo del día, cofre, cumpleaños, asamblea) y
 * escenas/repaso.ts. Pruebas: tests/unidad/monedas.test.ts.
 * Exporta: MONEDAS (cuántas da cada cosa), el tipo Monedero y las reglas monedasPorAcierto, monedasAlTerminar,
 * monedasDelCofre, ganar, gastar y alcanza.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de MONEDAS son las reglas mismas, cada uno con su nombre. */

/** Las monedas de la partida (S.coins: las que tiene ahora; S.coinsTot: todas las que ha ganado). */
export interface Monedero {
  coins?: number;
  coinsTot?: number;
}

// MONEDAS: cuántas monedas da cada cosa. OJO: algunas frases dicen el número con palabras ("¡tres monedas!" del
// regalo del día, "diez monedas" del cumpleaños): si cambia aquí, cambian allí.
export const MONEDAS = {
  /** Primer acierto de una ronda en un juego... */
  acierto: 1,
  /** ...como mucho estas veces por juego. */
  aciertosPorJuego: 5,
  /** Terminar un juego por primera vez. */
  juegoNuevo: 3,
  /** Terminar un juego que ya se había terminado. */
  juegoRepetido: 2,
  /** El regalo del día, la primera vez que se entra en el mapa cada día. */
  regaloDelDia: 3,
  /** El cofre del tesoro al terminar un tema, si trae regalo... */
  cofreConRegalo: 10,
  /** ...y si ya no quedan regalos. */
  cofreSinRegalo: 20,
  /** Soplar las velas el día del cumpleaños. */
  cumple: 10,
  /** Terminar la asamblea del día por primera vez. */
  asamblea: 5,
  /** Terminar el repaso del día. */
  repaso: 5,
} as const;

// monedasPorAcierto(primero, yaDadas): monedas por un acierto en un juego: MONEDAS.acierto si es el primer intento de
// la ronda y aún no se han dado MONEDAS.aciertosPorJuego en este juego; si no, 0.
export function monedasPorAcierto(primero: unknown, yaDadas: number): number {
  return primero && yaDadas < MONEDAS.aciertosPorJuego ? MONEDAS.acierto : 0;
}

// monedasAlTerminar(primeraVez): monedas por terminar un juego: más la primera vez que al repetirlo.
export function monedasAlTerminar(primeraVez: boolean): number {
  return primeraVez ? MONEDAS.juegoNuevo : MONEDAS.juegoRepetido;
}

// monedasDelCofre(conRegalo): monedas del cofre de un tema: menos si trae regalo; más si ya no quedan regalos.
export function monedasDelCofre(conRegalo: boolean): number {
  return conRegalo ? MONEDAS.cofreConRegalo : MONEDAS.cofreSinRegalo;
}

// ganar(m, n): el monedero después de ganar n monedas: n más en las que tiene (coins) y en las ganadas en total
// (coinsTot). No cambia m: quien llama lo copia en S (Object.assign) y guarda. Si n no es mayor que 0, no suma nada.
export function ganar(m: Readonly<Monedero>, n: number): Required<Monedero> {
  const suma = n > 0 ? n : 0;
  return { coins: (m.coins || 0) + suma, coinsTot: (m.coinsTot || 0) + suma };
}

// gastar(m, n): el monedero después de gastar n monedas (solo cambian las que tiene). No comprueba si hay bastantes
// (eso es alcanza) ni cambia m.
export function gastar(m: Readonly<Monedero>, n: number): Pick<Required<Monedero>, 'coins'> {
  return { coins: (m.coins ?? 0) - n };
}

// alcanza(monedas, precio): ¿llegan las monedas para pagar el precio?
export function alcanza(monedas: number, precio: number): boolean {
  return !(monedas < precio);
}
