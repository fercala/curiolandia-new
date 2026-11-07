/*
 * dominio/partida.ts: la versión de la partida guardada y sus migraciones (fase 3f de docs/PLAN-MIGRACION.md). Cada
 * partida lleva su versión (S.ver). Si un día cambia el formato de un campo, se sube VERSION_PARTIDA y se añade a
 * MIGRACIONES el paso que pasa una partida de la versión anterior a la nueva: así las partidas de los móviles se
 * ponen al día al cargarlas, sin perder nada (receta en docs/ESTADO-GUARDADO.md).
 * La versión 1 es el formato de curiolandia-3d v1.592, el de las partidas de antes de esta fase, que no llevan versión
 * (cuentan como versión 0) y solo necesitan apuntarla. La versión 2 (fase 5d) es la de solo castellano de España. La 3
 * (fase L7b de docs/PLAN-LECTURA.md) trae tipoLetra, la opción de mayúsculas y minúsculas de la Isla de las Letras. La 4
 * (fase C1 de docs/PLAN-CASA.md) trae la casa interactiva: mascotas (fichas de las mascotas que crecen), sorpresas y huerto.
 * La 5 (fase M1 de docs/PLAN-CASA-MEJORA.md) da a cada objeto de la casa su sitio (home[id].h).
 * Es DOMINIO, como el resto de src/dominio/: no sabe nada de localStorage ni de S y no cambia lo que recibe: migrar
 * devuelve una partida nueva. nucleo/guardado.ts la usa al cargar la partida y cuando otra pestaña guarda, antes de
 * arreglar lo que venga roto (sanoS y sanoHondo). Pruebas: tests/unidad/partida.test.ts.
 * Exporta: VERSION_PARTIDA, MIGRACIONES, los tipos PartidaCruda y Migracion y las reglas esPartida, versionDe y migrar.
 * Importa de dominio/casa.ts las mascotas que crecen y su ficha (para la migración 3 → 4) y de dominio/casaSitios.ts el
 * plano de la casa y asignarSitios (para la 4 → 5).
 */
import { MASCOTAS, fichaComprada, huertoNuevo } from './casa.ts';
import { PLANO, asignarSitios, type Casa } from './casaSitios.ts';

/** Una partida tal como se lee (de localStorage, de otra pestaña o de una copia): cualquier campo puede traer cualquier cosa. */
export type PartidaCruda = Record<string, unknown>;

/** Un paso de migración: recibe una partida de una versión y devuelve otra nueva, con el formato de la siguiente. */
export type Migracion = (d: Readonly<PartidaCruda>) => PartidaCruda;

// VERSION_PARTIDA: la versión del formato de la partida que entiende este juego (S.ver de una partida nueva).
export const VERSION_PARTIDA = 5;

// MIGRACIONES: el paso que pasa una partida de cada versión (la clave) a la siguiente. Tiene que haber uno por cada
// versión, de 0 a VERSION_PARTIDA - 1 (lo comprueba tests/unidad/partida.test.ts). Cada paso recibe la partida tal
// como venga, quizá rota: no puede fallar con nada (sanoS y sanoHondo la arreglan después) y no cambia la que recibe.
export const MIGRACIONES: Readonly<Record<number, Migracion>> = {
  // 0 → 1: las partidas sin versión (curiolandia-3d y este juego antes de la fase 3f) ya tienen el formato de la
  // versión 1: no cambia nada, solo se apunta la versión (migrar pone ver).
  0: (d) => ({ ...d }),
  // 1 → 2 (fase 5d): el juego es solo en castellano de España. Una partida que eligió rioplatense ('ar'), o que no
  // eligió todavía (''), pasa a 'es'; lo demás no cambia.
  1: (d) => ({ ...d, variant: 'es' }),
  // 2 → 3 (fase L7b): la Isla de las Letras puede enseñar también las minúsculas. Las partidas de antes siguen con solo
  // mayúsculas (tipoLetra 'mayus'), salvo si ya traen 'ambas'.
  2: (d) => ({ ...d, tipoLetra: d['tipoLetra'] === 'ambas' ? 'ambas' : 'mayus' }),
  // 3 → 4 (fase C1 de docs/PLAN-CASA.md): la casa interactiva. Solo añade campos: mascotas (cada mascota que crece y
  // ya estaba comprada en owned recibe su ficha de joven, fichaComprada; las fichas que ya hubiera se quedan),
  // sorpresas ({} si no había) y huerto (sin regar si no había).
  3: (d) => ({
    ...d,
    mascotas: mascotasDe(d),
    sorpresas: objeto(d['sorpresas']) ?? {},
    huerto: objeto(d['huerto']) ?? huertoNuevo(),
  }),
  // 4 → 5 (fase M1 de docs/PLAN-CASA-MEJORA.md): los sitios de la casa de Tito. Cada objeto de home recibe su sitio (h)
  // en su habitación, el libre más cercano a donde estaba (asignarSitios de dominio/casaSitios.ts). Solo añade h: x, y y
  // la habitación no cambian, y lo que no cabe se queda sin sitio (desde la fase M2, la escena lo guarda en el baúl).
  4: (d) => {
    const home = objeto(d['home']);
    return home ? { ...d, home: asignarSitios(PLANO, home as Casa) } : { ...d };
  },
};

// objeto(v): v si es un objeto (no null ni una lista); si no, undefined.
function objeto(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
}

// mascotasDe(d): las fichas de mascotas de la partida d para la versión 4: las que ya tenga, más una de joven
// (fichaComprada) por cada mascota que crece comprada en owned y sin ficha.
function mascotasDe(d: Readonly<PartidaCruda>): Record<string, unknown> {
  const tiene = objeto(d['owned']) ?? {};
  const fichas: Record<string, unknown> = { ...objeto(d['mascotas']) };
  const nuevas = MASCOTAS.filter((id) => tiene[id] && !objeto(fichas[id])).map((id) => [id, fichaComprada()]);
  return { ...fichas, ...Object.fromEntries(nuevas) };
}

// esPartida(d): ¿parece una partida? Tiene que ser un objeto, no null ni una lista. Lo demás (un número, un texto, un
// JSON roto que dio null) se ignora y el juego sigue con la partida que tenga.
export function esPartida(d: unknown): d is PartidaCruda {
  return !!d && typeof d === 'object' && !Array.isArray(d);
}

// versionDe(d): la versión de la partida d (su campo ver). Si no tiene o no es un número entero de 0 en adelante, 0:
// las partidas de antes de la fase 3f no la llevan.
export function versionDe(d: Readonly<PartidaCruda>): number {
  const v = d['ver'];
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : 0;
}

// igual: el paso que no cambia nada (para una versión sin paso en MIGRACIONES).
const igual: Migracion = (d) => ({ ...d });

// migrar(d, hasta, pasos): la partida d puesta al día: aplica en orden los pasos de su versión hasta la versión hasta
// (VERSION_PARTIDA si no se dice otra) y apunta la versión nueva en ver. Una partida que ya está en esa versión, o en
// una más nueva (de un juego más moderno), sale igual. Si faltara un paso, esa versión se salta sin cambiar nada (las
// pruebas comprueban que no falta ninguno). No cambia d: devuelve una partida nueva (copia de primer nivel: lo que hay
// dentro de cada campo se comparte, como en los pasos que no lo tocan).
export function migrar(
  d: Readonly<PartidaCruda>,
  hasta: number = VERSION_PARTIDA,
  pasos: Readonly<Record<number, Migracion>> = MIGRACIONES,
): PartidaCruda {
  const desde = versionDe(d);
  const versiones = Array.from({ length: Math.max(0, hasta - desde) }, (_x, i) => desde + i);
  return versiones.reduce<PartidaCruda>((p, v) => ({ ...(pasos[v] ?? igual)(p), ver: v + 1 }), { ...d });
}
