/* ================= ZONA DE ADULTOS ================= */
/*
 * aplicacion/adultos.ts (antes adult.js): la entrada de la ZONA DE ADULTOS (el menú de los padres), un panel HTML (#adult,
 * definido en head.html) que se abre manteniendo pulsado 3 s el candado de abajo a la derecha.
 * Desde la fase A1 de docs/PLAN-MENU-ADULTOS.md el panel está partido en la carpeta aplicacion/adultos/:
 *   - panel.ts: openAdult(pagina?), closeAdult() y la navegación (menú lateral, menú de iconos o portada de tarjetas
 *     según el ancho, cabecera fija y Escape);
 *   - paginas.ts: PAGINAS_ADULTOS, las 7 páginas en el orden del menú: resumen.ts, quienJuega.ts, comoSeJuega.ts,
 *     titoYSonido.ts, progreso.ts, premios.ts y copia.ts (cada una con su html() y su conectar(), tipos.ts);
 *   - copiaSeguridad.ts: bkEncode/bkDecode/bkWire (la COPIA DE SEGURIDAD: S a un código de texto o un archivo JSON y al revés);
 *   - comun.ts: esc, buscador y radios.
 * Aquí queda window.__cl (la puerta de las pruebas automáticas) y lo que el puente de src/modulos.ts deja en globalThis:
 * openAdult, closeAdult, bkEncode y bkDecode, y openNameDlg, openResetDlg y doReset (de aplicacion/dialogos.ts, desde la
 * fase 4p). El BUCLE DEL JUEGO y la ENTRADA están desde la v0.2.51 en aplicacion/bucle.ts, que importa openAdult de aquí
 * para el candado.
 * Importa: el núcleo, src/nucleo/ (S, go, say, SCENES, T, VIVO, scene, sceneName) y TEMA y TEMAS de escenas/escenas2d.ts.
 */
import type { Libre } from '../nucleo/tipos.ts';
import { IDIOMA, S, SCENES, T, VIVO, go, say, scene, sceneName, sinTraducir } from '../nucleo/indice.ts';
import { TEMA, TEMAS } from '../escenas/escenas2d.ts';
import { closeAdult, openAdult } from './adultos/panel.ts';
export { closeAdult, openAdult } from './adultos/panel.ts';
export { bkDecode, bkEncode } from './adultos/copiaSeguridad.ts';
// Los diálogos del nombre y de empezar de nuevo están desde la fase 4p en aplicacion/dialogos.ts; se exportan también
// desde aquí para que el puente los siga dejando en globalThis (las pruebas llaman a doReset, openNameDlg...).
export { doReset, openNameDlg, openResetDlg } from './dialogos.ts';

// window.__cl: puerta para las pruebas automáticas (y para depurar desde la consola): ir a escenas, leer S y la escena,
// simular toques (tap), arrastres (drag) y ratón encima (hover), y abrir/cerrar la zona de adultos. Desde la fase ID1
// de docs/PLAN-IDIOMAS.md, también el idioma del juego (idioma) y los textos pedidos que no tienen traducción
// (sinTraducir()).
window.__cl = {
  go: (n: string, o?: Libre) => go(n, o),
  get S() {
    return S;
  },
  get scene() {
    return scene;
  },
  get name() {
    return sceneName;
  },
  get idioma() {
    return IDIOMA;
  },
  sinTraducir: () => [...sinTraducir],
  SCENES,
  TEMA,
  TEMAS,
  tap(x: number, y: number) {
    scene!.down && scene!.down(x, y);
    scene!.up && scene!.up(x, y);
  },
  drag(a: number, b: number, c: number, d: number) {
    scene!.down!(a, b);
    scene!.move && scene!.move(c, d);
    scene!.up && scene!.up(c, d);
  },
  hover(x: number, y: number) {
    VIVO.MX = x;
    VIVO.MY = y;
    VIVO.mouseOn = true;
  },
  T: () => T,
  say,
  openAdult,
  closeAdult,
};
