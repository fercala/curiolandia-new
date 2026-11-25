/*
 * dominio/cuentosDecisiones.ts: las reglas de los cuentos en los que el niño decide (idea 27 de docs/IDEAS-MEJORA.md,
 * fase P33). Un cuento es un árbol de páginas: unas tienen dos opciones (cada una lleva a otra página) y otras son
 * finales, todos buenos. Cada final que se descubre por primera vez da 2 monedas y queda apuntado, para que el niño
 * quiera volver a leerlo y encontrar los demás.
 * Lo guardado va en S.cuentosDec ({ [cuento]: [finales vistos] }): opcional, sin migración (ausente o roto se lee vacío).
 * Es una regla pura, sin dibujo ni S. Pruebas: tests/unidad/cuentosDecisiones.test.ts.
 * Exporta: los tipos OpcionCuento, PaginaDecision, CuentoDecision y RegistroCuentos, CUENTOS_DEC_MONEDAS, finalesDe,
 * erroresCuento, registroCuentos, vistosDe y apuntarFinal.
 * No importa nada.
 */

/** Una opción de una página: lo que pone en el botón (frase entera), su dibujo y la página adonde lleva. */
export interface OpcionCuento {
  readonly texto: string;
  readonly dibujo: string;
  readonly va: string;
}
/** Una página: lo que lee Tito, sus dibujos y, si no es un final, sus dos opciones. */
export interface PaginaDecision {
  readonly frase: string;
  readonly dibujos: readonly string[];
  readonly opciones?: readonly [OpcionCuento, OpcionCuento];
}
/** Un cuento: su id, su título, el dibujo de su portada, los dos colores de su cielo y sus páginas (empieza en
 * 'inicio'). */
export interface CuentoDecision {
  readonly id: string;
  readonly titulo: string;
  readonly portada: string;
  readonly cielo: readonly [string, string];
  readonly paginas: Readonly<Record<string, PaginaDecision>>;
}
/** Los finales vistos de cada cuento. */
export type RegistroCuentos = Readonly<Record<string, readonly string[]>>;

// CUENTOS_DEC_MONEDAS: las monedas de cada final descubierto por primera vez.
export const CUENTOS_DEC_MONEDAS = 2;

// finalesDe(c): las páginas del cuento c que son finales (sin opciones), en orden.
export const finalesDe = (c: CuentoDecision): string[] => Object.keys(c.paginas).filter((k) => !c.paginas[k]!.opciones);

// alcanzables(c): las páginas a las que se llega desde 'inicio' siguiendo las opciones.
function alcanzables(c: CuentoDecision): Set<string> {
  const visita = (pend: readonly string[], vistas: ReadonlySet<string>): Set<string> => {
    const [h, ...resto] = pend;
    if (h === undefined) return new Set(vistas);
    if (vistas.has(h) || !c.paginas[h]) return visita(resto, vistas);
    const hijos = (c.paginas[h]!.opciones ?? []).map((o) => o.va);
    return visita([...resto, ...hijos], new Set([...vistas, h]));
  };
  return visita(['inicio'], new Set());
}

// erroresCuento(c): lo que está mal en el cuento c, como códigos (vacío si está bien): 'inicio' si no tiene página
// 'inicio', 'opcion:página>destino' si una opción lleva a una página que no existe, 'suelta:página' si a una página no se
// llega y 'finales' si tiene menos de dos finales.
export function erroresCuento(c: CuentoDecision): string[] {
  const llega = alcanzables(c),
    paginas = Object.keys(c.paginas);
  return [
    ...(c.paginas.inicio ? [] : ['inicio']),
    ...paginas.flatMap((k) =>
      (c.paginas[k]!.opciones ?? []).filter((o) => !c.paginas[o.va]).map((o) => ['opcion', k + '>' + o.va].join(':')),
    ),
    ...paginas.filter((k) => !llega.has(k)).map((k) => ['suelta', k].join(':')),
    ...(finalesDe(c).length < 2 ? ['finales'] : []),
  ];
}

// registroCuentos(x): lee lo guardado (S.cuentosDec); si falta o está roto, vacío. Solo se quedan listas de textos.
export function registroCuentos(x: unknown): RegistroCuentos {
  if (!x || typeof x !== 'object') return {};
  return Object.fromEntries(
    Object.entries(x as Record<string, unknown>)
      .filter(([, v]) => Array.isArray(v))
      .map(([k, v]) => [k, (v as unknown[]).filter((f): f is string => typeof f === 'string')]),
  );
}

// vistosDe(reg, c): los finales del cuento c que ya se han visto (solo los que siguen existiendo).
export const vistosDe = (reg: RegistroCuentos, c: CuentoDecision): string[] =>
  finalesDe(c).filter((f) => (reg[c.id] ?? []).includes(f));

// apuntarFinal(reg, c, final): apunta que se ha llegado al final del cuento c: el registro nuevo, si era nuevo y las
// monedas que da (las de un final nuevo; si no es un final del cuento o ya se había visto, nada).
export function apuntarFinal(
  reg: RegistroCuentos,
  c: CuentoDecision,
  final: string,
): { reg: RegistroCuentos; nuevo: boolean; monedas: number } {
  const vistos = reg[c.id] ?? [];
  if (!finalesDe(c).includes(final) || vistos.includes(final)) return { reg, nuevo: false, monedas: 0 };
  return { reg: { ...reg, [c.id]: [...vistos, final] }, nuevo: true, monedas: CUENTOS_DEC_MONEDAS };
}
