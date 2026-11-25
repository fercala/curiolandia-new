/*
 * aplicacion/perfiles.ts: los casos de uso de los perfiles, varios niños en el mismo móvil (idea 38 de
 * docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes, v0.2.181). Lee y guarda el índice de perfiles y las
 * partidas de los que no juegan con el puerto de guardado (leerGuardado, escribirGuardado); las reglas, en
 * dominio/perfiles.ts.
 * Cambiar de perfil: la partida de ahora se guarda en la clave de su perfil, la del otro (o una nueva, si nunca ha
 * jugado) pasa a la clave de siempre (KEY), se para el guardado (pararGuardado, para que nada la pise) y se recarga la
 * página, que la carga como cualquier partida (con sus migraciones). Nunca se borra ninguna partida.
 * Exporta: leerPerfiles, hayVariosPerfiles, anadirNino, cambiarAPerfil y yaElegido.
 * Importa: S, KEY, KEY_COPIA, save y pararGuardado (nucleo/guardado.ts), los puertos de guardado y las reglas de
 * dominio/perfiles.ts.
 */
import { KEY, KEY_COPIA, S, pararGuardado, save } from '../nucleo/guardado.ts';
import { escribirGuardado, leerGuardado } from './puertos.ts';
import {
  CLAVE_PERFILES,
  activar,
  anadirPerfil,
  claveDePerfil,
  indiceDe,
  partidaNueva,
  type IndicePerfiles,
} from '../dominio/perfiles.ts';

// leerJson(clave): lo guardado en la clave, leído como JSON (null si no hay o está roto).
function leerJson(clave: string): unknown {
  try {
    return JSON.parse(leerGuardado(clave) || 'null');
  } catch (e) {
    return null;
  }
}
// guardaIndice(ind): guarda el índice de perfiles.
const guardaIndice = (ind: IndicePerfiles): boolean => escribirGuardado(CLAVE_PERFILES, JSON.stringify(ind));

// leerPerfiles(): el índice de perfiles, con el nombre y la edad del que juega al día.
export const leerPerfiles = (): IndicePerfiles =>
  indiceDe(leerJson(CLAVE_PERFILES), { nombre: S.name || '', edad: S.age || 0 });
// hayVariosPerfiles(): ¿hay más de un perfil?
export const hayVariosPerfiles = (): boolean => leerPerfiles().lista.length > 1;

// anadirNino(nombre, edad): añade un perfil (sin cambiar al nuevo); devuelve si se ha podido (caben tres).
export function anadirNino(nombre: string, edad: number): boolean {
  const r = anadirPerfil(leerPerfiles(), nombre, edad);
  return !!r && guardaIndice(r.indice);
}

// cambiarAPerfil(id): cambia al perfil id y recarga la página (si ya juega o no existe, no hace nada).
export function cambiarAPerfil(id: string): void {
  const antes = leerPerfiles(),
    ind = activar(antes, id);
  if (!ind) return;
  save();
  escribirGuardado(claveDePerfil(antes.activo), JSON.stringify(S));
  const otra = leerGuardado(claveDePerfil(id)),
    p = ind.lista.find((x) => x.id === id)!;
  // KEY_COPIA: que el perfil nuevo no traiga la partida de curiolandia-3d como si fuera suya
  escribirGuardado(KEY_COPIA, '1');
  escribirGuardado(KEY, otra || JSON.stringify(partidaNueva(p)));
  guardaIndice(ind);
  pararGuardado();
  globalThis.location?.reload();
}

// yaElegido(): al empezar a jugar, ¿ya se ha elegido quién juega? Sí, si se acaba de cambiar de perfil (y entonces se
// olvida, para preguntar la próxima vez) o si solo hay uno.
export function yaElegido(): boolean {
  const ind = leerPerfiles();
  if (ind.lista.length <= 1) return true;
  if (!ind.recien) return false;
  guardaIndice({ ...ind, recien: false });
  return true;
}
