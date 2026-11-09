/*
 * dominio/yoga.ts: las reglas del yoga de los animales y el rincón de la calma (idea 13 de docs/IDEAS-MEJORA.md, fase
 * P3): las posturas de animales y las respiraciones guiadas, cuántas salen según la edad (y en la pausa activa, menos),
 * cuánto dura cada respiración y cuándo toca proponer la pausa activa (a los 20 minutos de juego seguido).
 * Es DOMINIO: no sabe nada de pantalla ni de S; la escena (escenas/yoga.ts) y el mapa (escenas/zonas.ts) le preguntan.
 * Pruebas: tests/unidad/yoga.test.ts.
 * Exporta: los tipos Postura, Respiracion, PasoYoga y ModoYoga, POSTURAS, RESPIRACIONES, YOGA (los números de las
 * reglas), planYoga y tocaPausaActiva.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números de YOGA son las reglas mismas, cada uno con su nombre. */

/** Una postura de animal: su id, el dibujo que se ve en grande (clave de PICS), cómo la explica Tito y cómo se pone
 * Tito (forma: se agacha, se estira, se inclina, a la pata coja o hecho una bola). */
export interface Postura {
  readonly id: string;
  readonly dibujo: string;
  readonly frase: string;
  readonly forma: 'agacha' | 'estira' | 'inclina' | 'pata' | 'bola';
}
/** Una respiración guiada: su id, cómo la explica Tito y lo que se ve (un globo que se hincha o la flor y la vela). */
export interface Respiracion {
  readonly id: string;
  readonly frase: string;
  readonly dibujo: 'globo' | 'florVela';
}
/** Un paso del plan: una postura o una respiración, con cuántas veces se respira en él. */
export type PasoYoga =
  | { readonly tipo: 'postura'; readonly postura: Postura; readonly respiros: number }
  | { readonly tipo: 'respiracion'; readonly respiracion: Respiracion; readonly respiros: number };
/** Para qué se hace: entera, desde el patio; corta, la pausa activa que sale sola a los 20 minutos. */
export type ModoYoga = 'patio' | 'pausa';

// POSTURAS: las posturas de animales; cada partida coge unas cuantas al azar.
export const POSTURAS: readonly Postura[] = [
  {
    id: 'gato',
    dibujo: 'gato',
    frase: 'Somos gatos: a cuatro patas, arqueamos la espalda hacia arriba, como un gato que se despierta.',
    forma: 'estira',
  },
  {
    id: 'perro',
    dibujo: 'perro',
    frase: 'Somos perros: manos y pies en el suelo y el culete bien alto, como una montaña.',
    forma: 'inclina',
  },
  {
    id: 'rana',
    dibujo: 'rana',
    frase: 'Somos ranas: nos agachamos con las rodillas abiertas y las manos en el suelo.',
    forma: 'agacha',
  },
  {
    id: 'arbol',
    dibujo: 'arbol',
    frase: 'Somos árboles: un pie apoyado en la otra pierna y los brazos arriba, como ramas.',
    forma: 'pata',
  },
  {
    id: 'pajaro',
    dibujo: 'pajaro',
    frase: 'Somos pájaros: a la pata coja, con los brazos abiertos como alas.',
    forma: 'pata',
  },
  {
    id: 'mariposa',
    dibujo: 'mariposa',
    frase: 'Somos mariposas: sentados, juntamos las plantas de los pies y movemos las rodillas como alas.',
    forma: 'agacha',
  },
  {
    id: 'tortuga',
    dibujo: 'tortuga',
    frase: 'Somos tortugas: de rodillas, nos hacemos una bola y escondemos la cabeza en el caparazón.',
    forma: 'bola',
  },
  {
    id: 'leon',
    dibujo: 'leon',
    frase: 'Somos leones: de rodillas, las manos como garras, sacamos la lengua y rugimos sin hacer ruido.',
    forma: 'estira',
  },
];

// RESPIRACIONES: las respiraciones guiadas del rincón de la calma.
export const RESPIRACIONES: readonly Respiracion[] = [
  {
    id: 'globo',
    frase: 'Ahora inflamos un globo en la barriga: tomamos aire despacito y la barriga se hincha. Luego lo soltamos.',
    dibujo: 'globo',
  },
  {
    id: 'florVela',
    frase: 'Olemos una flor tomando aire por la nariz, y soplamos una vela despacito, sin apagarla.',
    dibujo: 'florVela',
  },
];

// YOGA: los números de las reglas.
export const YOGA = {
  /** Posturas por partida, según la edad (3, 4 y 5 años) y en la pausa activa. */
  posturas: { 3: 3, 4: 4, 5: 4 } as Readonly<Record<number, number>>,
  posturasPausa: 2,
  /** Respiros en cada paso: con 3 años, 2; con 4 o 5, 3. */
  respiros: { 3: 2, 4: 3, 5: 3 } as Readonly<Record<number, number>>,
  /** Segundos de tomar aire y de soltarlo en cada respiro. */
  tomarAire: 3,
  soltarAire: 3,
  /** Minutos de juego seguido a los que se propone la pausa activa. */
  minutosPausa: 20,
} as const;

// planYoga(edad, modo, r): el plan de una sesión: unas posturas al azar (sin repetir) y, al final, las respiraciones
// (las dos en el patio, una en la pausa activa). La edad se ajusta entre 3 y 5. r() da números al azar entre 0 y 1.
export function planYoga(edad: number, modo: ModoYoga, r: () => number): PasoYoga[] {
  const e = Math.min(5, Math.max(3, Math.round(edad))),
    nPosturas = modo === 'pausa' ? YOGA.posturasPausa : (YOGA.posturas[e] ?? 4),
    respiros = YOGA.respiros[e] ?? 3,
    posturas = POSTURAS.map((p) => ({ p, k: r() }))
      .sort((a, b) => a.k - b.k)
      .slice(0, nPosturas)
      .map((x): PasoYoga => ({ tipo: 'postura', postura: x.p, respiros })),
    respiraciones = (modo === 'pausa' ? [RESPIRACIONES[Math.floor(r() * RESPIRACIONES.length)]!] : RESPIRACIONES).map(
      (x): PasoYoga => ({ tipo: 'respiracion', respiracion: x, respiros }),
    );
  return [...posturas, ...respiraciones];
}

// tocaPausaActiva(segundos, yaPropuesta, limite): ¿hay que proponer ya la pausa activa? Sí cuando se llevan
// YOGA.minutosPausa minutos de juego seguido, aún no se ha propuesto en esta sesión y no hay límite de tiempo puesto
// (con límite, al acabar el tiempo ya se va a dormir).
export function tocaPausaActiva(segundos: number, yaPropuesta: boolean, limite: number): boolean {
  return segundos >= YOGA.minutosPausa * 60 && !yaPropuesta && !limite;
}
