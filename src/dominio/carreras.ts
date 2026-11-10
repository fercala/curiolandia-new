/*
 * dominio/carreras.ts: las reglas de las carreras de Tito en el patio del cole (idea 10 de docs/IDEAS-MEJORA.md, fase
 * P10). Tito corre por la pista del patio contra sus amigos: corre solo hacia delante y el niño toca para que salte los
 * charcos y las piedras; si no salta, tropieza y va más despacio un momento (nunca se pierde). Por el camino hay
 * estrellas (las de arriba se cogen saltando). Desde los 4 años hay un cruce donde se elige por dónde seguir (izquierda
 * o derecha: por un lado hay más estrellas) y a los 5 años, además, los números del 1 al 5 flotan sobre la pista, en
 * orden, para cogerlos saltando. Todos llegan a la meta y todos tienen medalla; el podio dice el lugar de cada uno.
 * Es una regla pura, sin dibujo ni S: la escena (mundo3d/carreras3d.ts) le pide el plan y le pregunta qué pasa.
 * Pruebas: tests/unidad/carreras.test.ts.
 * Exporta: los tipos Obstaculo, Premio, Cruce, PlanCarrera y Corredor, CARRERA (los números de las reglas),
 * CORREDORES, LUGARES, planCarrera, enElAire, choca, velocidad, podio y lugaresDelPodio.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (largo de la pista, velocidades,
   tiempos del salto y del tropiezo), en tablas con nombre. */

/** Un obstáculo de la pista: qué es y a qué distancia de la salida está. */
export interface Obstaculo {
  readonly tipo: 'charco' | 'piedra';
  readonly d: number;
}
/** Algo que se coge por el camino: una estrella o un número (n), a la distancia d, en el suelo o arriba (se coge
 * saltando), y en el carril del cruce (lado) si está en uno de sus dos caminos. */
export interface Premio {
  readonly tipo: 'estrella' | 'numero';
  readonly d: number;
  readonly arriba: boolean;
  readonly n?: number;
  readonly lado?: 'izquierda' | 'derecha';
}
/** El cruce: dónde está, el lado con más estrellas y hasta dónde llegan sus dos caminos. */
export interface Cruce {
  readonly d: number;
  readonly fin: number;
  readonly bueno: 'izquierda' | 'derecha';
}
/** El plan de una carrera: el largo de la pista, los obstáculos, lo que se coge, el cruce (desde los 4 años) y si hay
 * números (a los 5). */
export interface PlanCarrera {
  readonly largo: number;
  readonly obstaculos: readonly Obstaculo[];
  readonly premios: readonly Premio[];
  readonly cruce: Cruce | null;
  readonly numeros: boolean;
}
/** Un corredor: su id, su nombre para la voz y lo rápido que corre (unidades por segundo; el de Tito, sin tropiezos). */
export interface Corredor {
  readonly id: string;
  readonly nombre: string;
  readonly vel: number;
}

// CARRERA: los números de las reglas.
export const CARRERA = {
  /** Largo de la pista, de la salida a la meta. */
  largo: 170,
  /** Lo que dura un salto (segundos) y lo que dura el tropiezo (segundos, corriendo a velTropiezo de la velocidad). */
  salto: 0.75,
  tropiezo: 1.4,
  velTropiezo: 0.35,
  /** Distancia (adelante o atrás) a la que un obstáculo o un premio toca a Tito. */
  alcance: 1.3,
  /** Dónde empieza el primer obstáculo, y la separación mínima entre dos. */
  primero: 18,
  separacion: 16,
  /** Dónde está el cruce y lo largos que son sus dos caminos. */
  cruce: 70,
  largoCruce: 22,
} as const;

// CORREDORES: Tito y sus amigos, con su velocidad. Tito, sin tropezar, gana; con dos tropiezos ya no.
export const CORREDORES: readonly Corredor[] = [
  { id: 'tito', nombre: 'Tito', vel: 10 },
  { id: 'polly', nombre: 'Polly', vel: 9.4 },
  { id: 'lupi', nombre: 'Lupi', vel: 9 },
  { id: 'pipo', nombre: 'Pipo', vel: 8.6 },
];
// LUGARES: cómo se dice cada lugar del podio (los ordinales que se aprenden), del primero al cuarto.
export const LUGARES: readonly string[] = ['primer lugar', 'segundo lugar', 'tercer lugar', 'cuarto lugar'];
// OBSTACULOS_POR_EDAD: cuántos obstáculos hay en la pista según la edad.
const OBSTACULOS_POR_EDAD: Readonly<Record<number, number>> = { 3: 6, 4: 6, 5: 5 };

// huecos(cruce): los tramos de la pista donde pueden ir los obstáculos: de CARRERA.primero hasta la meta (dejando 12
// para llegar), sin pisar el cruce si lo hay. Devuelve las distancias posibles, separadas CARRERA.separacion.
function huecos(cruce: boolean): number[] {
  const n = Math.floor((CARRERA.largo - 12 - CARRERA.primero) / CARRERA.separacion) + 1;
  return Array.from({ length: n }, (_, i) => CARRERA.primero + i * CARRERA.separacion).filter(
    (d) => !cruce || d < CARRERA.cruce - 6 || d > CARRERA.cruce + CARRERA.largoCruce + 4,
  );
}

// planCarrera(edad, azar): el plan de una carrera para la edad (3, 4 o 5) con el azar dado (función que da números de
// 0 a 1). Obstáculos en los huecos (cuántos, según la edad), cada uno charco o piedra, con una estrella arriba (se coge
// saltándolo) y otra en el suelo un poco antes; desde los 4 años, el cruce, con tres estrellas en su lado bueno y una en
// el otro; a los 5, los números del 1 al 5 arriba, en orden y lejos de los obstáculos.
export function planCarrera(edad: number, azar: () => number): PlanCarrera {
  const conCruce = edad >= 4,
    numeros = edad >= 5,
    posibles = huecos(conCruce),
    quiero = Math.min(posibles.length, OBSTACULOS_POR_EDAD[edad] ?? 6),
    // se quitan huecos al azar hasta dejar los que hacen falta (sin cambiar el orden)
    quitar = new Set(
      posibles
        .map((d) => [d, azar()] as const)
        .sort((a, b) => a[1] - b[1])
        .slice(0, posibles.length - quiero)
        .map(([d]) => d),
    ),
    obstaculos: Obstaculo[] = posibles
      .filter((d) => !quitar.has(d))
      .map((d) => ({ tipo: azar() < 0.5 ? 'charco' : 'piedra', d })),
    estrellas: Premio[] = obstaculos.flatMap((o) => [
      { tipo: 'estrella', d: o.d, arriba: true },
      { tipo: 'estrella', d: o.d - 6, arriba: false },
    ]),
    cruce: Cruce | null = conCruce
      ? { d: CARRERA.cruce, fin: CARRERA.cruce + CARRERA.largoCruce, bueno: azar() < 0.5 ? 'izquierda' : 'derecha' }
      : null,
    delCruce: Premio[] = cruce
      ? [
          ...[6, 11, 16].map((k) => ({ tipo: 'estrella' as const, d: cruce.d + k, arriba: false, lado: cruce.bueno })),
          {
            tipo: 'estrella' as const,
            d: cruce.d + 11,
            arriba: false,
            lado: cruce.bueno === 'izquierda' ? ('derecha' as const) : ('izquierda' as const),
          },
        ]
      : [],
    // los números van entre dos huecos (a media separación de cada hueco, así nunca encima de un obstáculo), fuera del
    // cruce y antes de la meta
    sitiosNumeros = numeros
      ? numerosEn(
          huecos(conCruce).map((d) => d + CARRERA.separacion / 2),
          conCruce,
        )
      : [],
    nums: Premio[] = sitiosNumeros.map((d, i) => ({ tipo: 'numero', d, arriba: true, n: i + 1 }));
  return {
    largo: CARRERA.largo,
    obstaculos,
    premios: [...estrellas, ...delCruce, ...nums].sort((a, b) => a.d - b.d),
    cruce,
    numeros,
  };
}

// numerosEn(sitios, cruce): cinco distancias repartidas entre los sitios posibles para los números del 1 al 5 (los que
// no caen en el cruce, si lo hay, ni pasada la meta menos 12), de menor a mayor.
function numerosEn(sitios: readonly number[], cruce: boolean): number[] {
  const validos = sitios.filter(
    (d) => d < CARRERA.largo - 12 && (!cruce || d < CARRERA.cruce - 6 || d > CARRERA.cruce + CARRERA.largoCruce + 4),
  );
  return validos.length <= 5
    ? validos
    : Array.from({ length: 5 }, (_, i) => validos[Math.round((i * (validos.length - 1)) / 4)] ?? 0);
}

// enElAire(t, salto): ¿está Tito en el aire en el instante t si saltó en salto (o nunca, null)?
export function enElAire(t: number, salto: number | null): boolean {
  return salto !== null && t - salto >= 0 && t - salto < CARRERA.salto;
}

// choca(d, o): ¿está Tito, a la distancia d, encima del obstáculo (o del premio) que está en o.d?
export function choca(d: number, o: { readonly d: number }): boolean {
  return Math.abs(d - o.d) < CARRERA.alcance;
}

// velocidad(vel, t, tropiezo): lo rápido que corre un corredor de velocidad vel en el instante t si tropezó en tropiezo
// (o nunca, null): mientras dura el tropiezo, más despacio.
export function velocidad(vel: number, t: number, tropiezo: number | null): number {
  const tropezando = tropiezo !== null && t - tropiezo >= 0 && t - tropiezo < CARRERA.tropiezo;
  return tropezando ? vel * CARRERA.velTropiezo : vel;
}

// podio(ids, llegadas): los ids de los corredores que corren en el orden en que han llegado (llegadas: id -> instante
// de llegada; los que aún no han llegado, sin instante, van detrás en el orden de ids). No cambia ids.
export function podio(ids: readonly string[], llegadas: Readonly<Record<string, number>>): string[] {
  const orden = (id: string) => ids.indexOf(id);
  return [...ids].sort((a, b) => {
    const ta = llegadas[a] ?? Infinity,
      tb = llegadas[b] ?? Infinity;
    return ta === tb ? orden(a) - orden(b) : ta - tb;
  });
}

// lugaresDelPodio(ids): el lugar de cada corredor del podio, en orden: [{ lugar: 'primer lugar', nombre: 'Polly' }...],
// para que Tito lo diga con los ordinales (fraseLugar, en mundo3d/carreras3d.ts: la frase se traduce allí, fase ID2f de
// docs/PLAN-IDIOMAS.md). Los ids que no son corredores no salen; desde el quinto, 'último lugar'.
export function lugaresDelPodio(ids: readonly string[]): { lugar: string; nombre: string }[] {
  return ids
    .map((id) => CORREDORES.find((c) => c.id === id))
    .filter((c): c is Corredor => !!c)
    .map((c, i) => ({ lugar: LUGARES[i] ?? 'último lugar', nombre: c.nombre }));
}
