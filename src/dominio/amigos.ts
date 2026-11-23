/*
 * dominio/amigos.ts: las reglas de los amigos de Tito en el mapa (idea 25 de docs/IDEAS-MEJORA.md, fase P31). Lupi y
 * Polly pasean por el mapa 3D y saludan cuando Tito se acerca. Cada día, uno de los dos ha perdido algo (la pelota, la
 * bufanda, las gafas o el gorro) cerca de un sitio del mapa, distinto de los rincones de los tesoros de ese día: al
 * tocarlo, pide ayuda; entonces lo perdido aparece en el mapa y, cuando Tito lo recoge, se lo devuelve y gana 2
 * monedas. Un encargo al día; el mismo día da siempre el mismo.
 * Lo guardado va en S.amigos ({d, pedido, hecho, ayudas}): opcional, sin migración (ausente o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/amigos.test.ts.
 * Exporta: los tipos Amigo, Perdido, Encargo, RegistroAmigos y FaseEncargo, AMIGOS, PERDIDOS, CERCA_DE, AMIGOS_MAPA,
 * registroAmigos, encargoDelDia, faseEncargo, pedirAyuda y devolver.
 * Importa: RINCONES y tesorosDelDia de dominio/tesoros.ts (los rincones del mapa y los de los tesoros de hoy).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- los números son las reglas mismas (monedas y distancias), en una
   tabla con nombre, y las constantes del cálculo del día. */
import { RINCONES, tesorosDelDia } from './tesoros.ts';

/** Un amigo de Tito que pasea por el mapa: su id (el de su dibujo) y lo que dice al saludar (frase entera). */
export interface Amigo {
  readonly id: string;
  readonly hola: string;
}
/** Algo que un amigo puede perder: su id (el de su dibujo), de quién es, cómo lo pide y cómo da las gracias (frases
 * enteras). */
export interface Perdido {
  readonly id: string;
  readonly amigo: string;
  readonly pide: string;
  readonly gracias: string;
}
/** El encargo de un día: qué amigo, qué ha perdido y en qué rincón del mapa está. */
export interface Encargo {
  readonly amigo: string;
  readonly perdido: string;
  readonly rincon: string;
}
/** Lo guardado: el día del encargo de hoy, si ya lo ha pedido, si ya se ha devuelto y cuántas veces se ha ayudado. */
export interface RegistroAmigos {
  readonly d: string;
  readonly pedido: boolean;
  readonly hecho: boolean;
  readonly ayudas: number;
}
/** En qué va el encargo de hoy: aún sin pedir, buscando lo perdido o ya devuelto. */
export type FaseEncargo = 'sinPedir' | 'buscando' | 'hecho';

// AMIGOS: los amigos que pasean por el mapa, con su saludo.
export const AMIGOS: readonly Amigo[] = [
  { id: 'lupi', hola: '¡Hola, Tito! Soy Lupi. ¡Qué día tan bonito para pasear!' },
  { id: 'polly', hola: '¡Hola, Tito! Soy Polly. ¡Hello, hello!' },
];

// PERDIDOS: lo que puede perder cada amigo, con lo que dice al pedir ayuda y al recuperarlo.
export const PERDIDOS: readonly Perdido[] = [
  {
    id: 'pelota',
    amigo: 'lupi',
    pide: '¡Tito, he perdido mi pelota! ¿Me ayudas a buscarla?',
    gracias: '¡Mi pelota! ¡Muchas gracias, Tito! Eres un buen amigo.',
  },
  {
    id: 'bufanda',
    amigo: 'lupi',
    pide: '¡Tito, he perdido mi bufanda! ¿Me ayudas a buscarla?',
    gracias: '¡Mi bufanda! ¡Muchas gracias, Tito! Ya no tendré frío.',
  },
  {
    id: 'gafas',
    amigo: 'polly',
    pide: '¡Tito, he perdido mis gafas! ¿Me ayudas a buscarlas?',
    gracias: '¡Mis gafas! ¡Muchas gracias, Tito! Ahora lo veo todo.',
  },
  {
    id: 'gorro',
    amigo: 'polly',
    pide: '¡Tito, he perdido mi gorro! ¿Me ayudas a buscarlo?',
    gracias: '¡Mi gorro! ¡Muchas gracias, Tito! ¡Thank you!',
  },
];

// CERCA_DE: la pista de dónde se perdió, según el rincón (frases enteras).
export const CERCA_DE: Readonly<Record<string, string>> = {
  jardin: 'Creo que se me cayó cerca del jardín.',
  bosque: 'Creo que se me cayó cerca del bosque.',
  montana: 'Creo que se me cayó cerca de la montaña.',
  plaza: 'Creo que se me cayó cerca de la plaza.',
  muelle: 'Creo que se me cayó cerca del muelle.',
  cole: 'Creo que se me cayó cerca del cole.',
  fiestas: 'Creo que se me cayó cerca de la casa de las fiestas.',
  globo: 'Creo que se me cayó cerca del globo.',
};

// AMIGOS_MAPA: las reglas: las monedas de devolver lo perdido, a qué distancia (unidades del mapa 3D) saluda un amigo
// a Tito y a cuál se recoge solo lo perdido si Tito pasa por encima.
export const AMIGOS_MAPA = { monedas: 2, saluda: 3.2, recoge: 1.1 } as const;

// semilla(dia): un número que sale de la fecha ('AAAA-MM-DD'), el mismo todo el día; con otra base que la de los
// tesoros, para que no salga lo mismo.
const semilla = (dia: string): number =>
  dia.split('').reduce((h, c) => (Math.imul(h, 33) + c.charCodeAt(0)) >>> 0, 5381);

// registroAmigos(raw): lee lo guardado en S.amigos (vacío si falta o está roto).
export function registroAmigos(raw: unknown): RegistroAmigos {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    d: typeof r.d === 'string' ? r.d : '',
    pedido: r.pedido === true,
    hecho: r.hecho === true,
    ayudas: typeof r.ayudas === 'number' && r.ayudas > 0 ? Math.floor(r.ayudas) : 0,
  };
}

// encargoDelDia(dia): el encargo de ese día: qué se ha perdido (y de quién es) y en qué rincón está, que no es ninguno
// de los rincones de los tesoros de ese día. El mismo día da siempre el mismo.
export function encargoDelDia(dia: string): Encargo {
  const s = semilla(dia),
    p = PERDIDOS[s % PERDIDOS.length]!,
    ocupados = tesorosDelDia(dia).map((e) => e.rincon),
    libres = RINCONES.filter((r) => !ocupados.includes(r.id)),
    r = libres[Math.floor(s / PERDIDOS.length) % libres.length] ?? RINCONES[0]!;
  return { amigo: p.amigo, perdido: p.id, rincon: r.id };
}

// deHoy(reg, dia): el registro con lo de hoy al día: si es de otro día, sin pedir ni hecho (las ayudas se quedan).
const deHoy = (reg: RegistroAmigos, dia: string): RegistroAmigos =>
  reg.d === dia ? reg : { ...reg, d: dia, pedido: false, hecho: false };

// faseEncargo(reg, dia): en qué va el encargo de ese día.
export function faseEncargo(reg: RegistroAmigos, dia: string): FaseEncargo {
  const r = deHoy(reg, dia);
  if (r.hecho) return 'hecho';
  return r.pedido ? 'buscando' : 'sinPedir';
}

// pedirAyuda(reg, dia): el amigo del encargo pide ayuda: el registro nuevo (con el encargo pedido).
export function pedirAyuda(reg: RegistroAmigos, dia: string): RegistroAmigos {
  return { ...deHoy(reg, dia), pedido: true };
}

// devolver(reg, dia): Tito ha encontrado lo perdido y se lo devuelve: el registro nuevo (hecho, una ayuda más) y las
// monedas que da. Si no se había pedido o ya estaba hecho, no cambia nada y no da monedas.
export function devolver(reg: RegistroAmigos, dia: string): { registro: RegistroAmigos; monedas: number } {
  const r = deHoy(reg, dia);
  if (!r.pedido || r.hecho) return { registro: r, monedas: 0 };
  return { registro: { ...r, hecho: true, ayudas: r.ayudas + 1 }, monedas: AMIGOS_MAPA.monedas };
}
