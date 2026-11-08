// adultos/paginas.ts: las páginas de la zona de adultos en el orden del menú (fase A1 de docs/PLAN-MENU-ADULTOS.md).
// Para añadir una categoría: un módulo nuevo con su PaginaAdultos (adultos/tipos.ts), su id en IdPagina y una fila aquí.
// Para añadir una opción: en la página que toque (docs/COMO-AGREGAR.md, «Una opción en la zona de adultos»).
import { COMO_SE_JUEGA } from './comoSeJuega.ts';
import { COPIA } from './copia.ts';
import { PREMIOS } from './premios.ts';
import { PROGRESO } from './progreso.ts';
import { QUIEN_JUEGA } from './quienJuega.ts';
import { RESUMEN } from './resumen.ts';
import { TITO_Y_SONIDO } from './titoYSonido.ts';
import type { IdPagina, PaginaAdultos } from './tipos.ts';

/** Las 7 páginas, en el orden del menú. La primera (Resumen) es la que se abre al entrar. */
export const PAGINAS_ADULTOS: readonly PaginaAdultos[] = [
  RESUMEN,
  QUIEN_JUEGA,
  COMO_SE_JUEGA,
  TITO_Y_SONIDO,
  PROGRESO,
  PREMIOS,
  COPIA,
];

// esPagina(id): ¿es id el de alguna página? (openAdult recibe un texto desde las pruebas o la consola).
export const esPagina = (id: unknown): id is IdPagina => PAGINAS_ADULTOS.some((p) => p.id === id);
