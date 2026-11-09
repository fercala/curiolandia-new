/*
 * dominio/retos.ts: las reglas de los retos para hacer en casa, sin pantalla (idea 37 de docs/IDEAS-MEJORA.md, fase
 * P4): la lista de retos (moverse, buscar, contar, ayudar en casa), cuál toca proponer hoy (uno por día, sin repetir el
 * anterior), marcarlo como hecho desde la zona de adultos y cuándo lo celebra Tito (al volver, con una pegatina). Y el
 * interruptor de los juegos de moverse: si la familia los quita, el patio del cole se cierra y no sale la pausa activa.
 * Es DOMINIO: no sabe nada de pantalla ni de S y no cambia nada; las escenas y la zona de adultos le pasan lo guardado
 * (S.retos, S.sinMoverse) y guardan lo que devuelve. Pruebas: tests/unidad/retos.test.ts.
 * Exporta: los tipos Reto y RegistroRetos, RETOS, registroRetos, retoPorId, proponerReto, marcarRetoHecho,
 * tocaCelebrarReto, retoCelebrado y moverseActivo.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son índices y fechas de cada caso. */

/** Un reto: su id, lo que dice Tito para proponerlo (sin «Un reto:» delante), lo que lee la familia en la zona de
 * adultos y de qué tipo es (moverse, buscar, contar o ayudar). */
export interface Reto {
  readonly id: string;
  readonly frase: string;
  readonly adultos: string;
  readonly tipo: 'moverse' | 'buscar' | 'contar' | 'ayudar';
}

/** Lo que se guarda de los retos (S.retos): el día en que se propuso el último, cuál era, si la familia ha marcado que
 * se hizo, si Tito ya lo ha celebrado y cuántos retos se han hecho desde siempre. */
export interface RegistroRetos {
  readonly d: string;
  readonly id: string;
  readonly hecho: boolean;
  readonly celebrado: boolean;
  readonly n: number;
}

// RETOS: los retos para hacer en casa; se proponen de uno en uno, uno cada día.
export const RETOS: readonly Reto[] = [
  {
    id: 'rojas',
    frase: 'busca en casa tres cosas rojas.',
    adultos: 'Buscar en casa tres cosas rojas.',
    tipo: 'buscar',
  },
  {
    id: 'rana',
    frase: 'salta como una rana hasta la cocina.',
    adultos: 'Ir saltando como una rana hasta la cocina.',
    tipo: 'moverse',
  },
  { id: 'mesa', frase: 'ayuda a poner la mesa.', adultos: 'Ayudar a poner la mesa.', tipo: 'ayudar' },
  { id: 'ventanas', frase: 'cuenta las ventanas de tu casa.', adultos: 'Contar las ventanas de casa.', tipo: 'contar' },
  {
    id: 'redondas',
    frase: 'busca cosas redondas, como una pelota.',
    adultos: 'Buscar cosas redondas por casa.',
    tipo: 'buscar',
  },
  {
    id: 'cangrejo',
    frase: 'anda como un cangrejo, de lado, por el pasillo.',
    adultos: 'Andar de lado como un cangrejo por el pasillo.',
    tipo: 'moverse',
  },
  {
    id: 'juguetes',
    frase: 'guarda tus juguetes en su sitio.',
    adultos: 'Recoger los juguetes y guardarlos en su sitio.',
    tipo: 'ayudar',
  },
  {
    id: 'zapatos',
    frase: 'cuenta los zapatos que hay en casa.',
    adultos: 'Contar los zapatos que hay en casa.',
    tipo: 'contar',
  },
  {
    id: 'baile',
    frase: 'baila una canción con tu familia.',
    adultos: 'Bailar una canción en familia.',
    tipo: 'moverse',
  },
  {
    id: 'animal',
    frase: 'imita a tu animal favorito y que tu familia lo adivine.',
    adultos: 'Imitar un animal para que la familia lo adivine.',
    tipo: 'moverse',
  },
  {
    id: 'plantas',
    frase: 'riega una planta o mira cómo ha crecido.',
    adultos: 'Regar una planta (o mirar juntos cómo crece).',
    tipo: 'ayudar',
  },
  {
    id: 'letra',
    frase: 'busca la primera letra de tu nombre en un libro o un cartel.',
    adultos: 'Buscar la primera letra de su nombre en un libro o un cartel.',
    tipo: 'buscar',
  },
  {
    id: 'calcetines',
    frase: 'empareja los calcetines de la ropa limpia.',
    adultos: 'Emparejar calcetines de la ropa limpia.',
    tipo: 'ayudar',
  },
  {
    id: 'abrazos',
    frase: 'da un abrazo a cada persona de tu casa y cuéntalos.',
    adultos: 'Dar un abrazo a cada persona de casa y contarlos.',
    tipo: 'contar',
  },
  {
    id: 'pataCoja',
    frase: 'ponte a la pata coja mientras cuentas hasta cinco.',
    adultos: 'Aguantar a la pata coja contando hasta cinco.',
    tipo: 'moverse',
  },
  {
    id: 'colores',
    frase: 'busca algo de cada color del arcoíris.',
    adultos: 'Buscar algo de cada color del arcoíris.',
    tipo: 'buscar',
  },
];

// registroRetos(r): el registro guardado si tiene la forma buena; si no (partidas de antes o algo roto), uno vacío.
export function registroRetos(r: unknown): RegistroRetos {
  const x = r as Partial<RegistroRetos> | null | undefined;
  if (!x || typeof x !== 'object' || typeof x.d !== 'string' || typeof x.id !== 'string') {
    return { d: '', id: '', hecho: false, celebrado: false, n: 0 };
  }
  return { d: x.d, id: x.id, hecho: !!x.hecho, celebrado: !!x.celebrado, n: typeof x.n === 'number' ? x.n : 0 };
}

// retoPorId(id): el reto con ese id, o undefined.
export function retoPorId(id: string): Reto | undefined {
  return RETOS.find((x) => x.id === id);
}

// proponerReto(r, hoy, azar, sinMoverse): el reto de hoy. Si hoy ya se propuso uno, el mismo; si no, uno nuevo al azar
// distinto del anterior (y, si la familia ha quitado los juegos de moverse, que no sea de moverse). Un reto nuevo
// sustituye al anterior aunque no se marcara como hecho. No cambia r: devuelve el registro nuevo.
export function proponerReto(r: unknown, hoy: string, azar: () => number, sinMoverse = false): RegistroRetos {
  const reg = registroRetos(r);
  if (reg.d === hoy && retoPorId(reg.id)) return reg;
  const posibles = RETOS.filter((x) => x.id !== reg.id && !(sinMoverse && x.tipo === 'moverse')),
    elegido = posibles[Math.min(posibles.length - 1, Math.floor(azar() * posibles.length))]!;
  return { d: hoy, id: elegido.id, hecho: false, celebrado: false, n: reg.n };
}

// marcarRetoHecho(r): la familia dice que el reto se ha hecho (desde la zona de adultos): queda hecho, sin celebrar, y
// suma uno a la cuenta. Si ya estaba hecho o no hay reto, no cambia nada.
export function marcarRetoHecho(r: unknown): RegistroRetos {
  const reg = registroRetos(r);
  if (reg.hecho || !retoPorId(reg.id)) return reg;
  return { ...reg, hecho: true, celebrado: false, n: reg.n + 1 };
}

// tocaCelebrarReto(r): ¿tiene Tito que celebrar un reto hecho (con una pegatina)? Sí si está hecho y aún no se celebró.
export function tocaCelebrarReto(r: unknown): boolean {
  const reg = registroRetos(r);
  return reg.hecho && !reg.celebrado && !!retoPorId(reg.id);
}

// retoCelebrado(r): Tito ya ha celebrado el reto hecho.
export function retoCelebrado(r: unknown): RegistroRetos {
  return { ...registroRetos(r), celebrado: true };
}

// moverseActivo(sinMoverse): ¿están puestos los juegos de moverse (el patio del cole y la pausa activa)? Sí, salvo que
// la familia los haya quitado en la zona de adultos (S.sinMoverse).
export function moverseActivo(sinMoverse: unknown): boolean {
  return !sinMoverse;
}
