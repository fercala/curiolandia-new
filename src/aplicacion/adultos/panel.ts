// adultos/panel.ts: el panel de la zona de adultos y su navegación (fase A1 de docs/PLAN-MENU-ADULTOS.md). El panel
// (#adult, en head.html) tiene una cabecera fija (‹ Categorías, el título y «Volver al juego»), el menú de categorías
// (nav.menu) y el cuerpo (.body) con una página por categoría (PAGINAS_ADULTOS, adultos/paginas.ts).
// Al abrir se pintan TODAS las páginas (así las pruebas encuentran cualquier control con querySelector) y solo se ve la
// elegida. El aspecto según el ancho lo deciden los estilos de head.html:
//   - tableta u ordenador: menú lateral con icono y nombre, y la página a la derecha;
//   - móvil en horizontal (poca altura): menú lateral estrecho, solo iconos con el nombre corto debajo;
//   - móvil en vertical (MODO_PAGINAS): una portada con las categorías como tarjetas (clase .portada en el panel, sin
//     página elegida); al tocar una, se entra en ella y arriba sale «‹ Categorías».
// La página abierta solo se recuerda mientras el panel está abierto: no se guarda en S.
// Exporta openAdult(pagina?) y closeAdult(), que aplicacion/adultos.ts vuelve a exportar para el puente y __cl.
import { S, VIVO, go, save, scene, sceneArg, sceneName } from '../../nucleo/indice.ts';
import { esPagina, PAGINAS_ADULTOS } from './paginas.ts';
import type { AccionesPagina, IdPagina, PaginaAdultos } from './tipos.ts';

// MODO_PAGINAS: la consulta de los estilos (head.html) en la que el menú es una portada de tarjetas (móvil en vertical).
// Tiene que ser la misma que la del @media de head.html.
const MODO_PAGINAS = '(max-width: 719px) and (min-height: 501px)';
// actual: la página que se ve (null = la portada de tarjetas, solo en MODO_PAGINAS). adultWas: edad y modo libre al abrir
// el panel, para saber al cerrar si cambiaron (closeAdult).
let actual: IdPagina | null = 'resumen';
let adultWas = '';
// vigilado: si ya se escucha el cambio de tamaño (girar el móvil) para no dejar el panel sin página.
let vigilado = false;

// panel(): el elemento #adult.
const panel = () => document.getElementById('adult')!;
// modoPaginas(): ¿se ve como portada de tarjetas (móvil en vertical)?
const modoPaginas = () => typeof matchMedia === 'function' && matchMedia(MODO_PAGINAS).matches;
// ACCIONES: lo que las páginas pueden pedir al panel; rehacer se crea para cada página (pintarPagina).
const cerrar = () => closeAdult();

// pintarPagina(p): vuelve a hacer el HTML de la página p dentro de su caja (div.pag) y conecta sus controles y sus
// atajos «Ir a» (data-go: cierran el panel y van a esa escena con saludo).
function pintarPagina(p: PaginaAdultos) {
  const caja = panel().querySelector<HTMLElement>(`.pag[data-pag="${p.id}"]`)!;
  caja.innerHTML = `<h2 class="pag-t" tabindex="-1">${p.icono} ${p.titulo}</h2>` + p.html();
  const acciones: AccionesPagina = { rehacer: () => pintarPagina(p), cerrar };
  p.conectar(caja, acciones);
  caja.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(
    (b) =>
      (b.onclick = () => {
        closeAdult();
        go(b.dataset.go!, { hello: true });
      }),
  );
}

// irA(id, enfocar): enseña la página id (o la portada, con null): esconde las demás, marca su botón del menú con
// aria-current y, si enfocar, lleva el foco a su título (para el teclado y los lectores de pantalla) y sube al principio.
function irA(id: IdPagina | null, enfocar = true) {
  actual = id;
  const el = panel();
  el.querySelector('.panel')!.classList.toggle('portada', id === null);
  el.querySelectorAll<HTMLElement>('.pag').forEach((c) => (c.hidden = c.dataset.pag !== id));
  el.querySelectorAll<HTMLButtonElement>('nav.menu button').forEach((b) => {
    if (b.dataset.pag === id) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  const cuerpo = el.querySelector<HTMLElement>('.body')!;
  cuerpo.scrollTop = 0;
  if (enfocar && id) el.querySelector<HTMLElement>(`.pag[data-pag="${id}"] .pag-t`)?.focus({ preventScroll: true });
}

/* openAdult(pagina?): abre la zona de adultos. Corta la voz, pinta el menú y TODAS las páginas a partir de S (cada vez
   que se abre, así siempre están al día) y enseña la página pedida; sin pagina, el Resumen, o la portada de tarjetas en
   el móvil en vertical. Las pruebas pueden abrir una página concreta: openAdult('premios').
   CÓMO AÑADIR UNA OPCIÓN NUEVA (por ejemplo, un ajuste de sí/no):
     1. Elige un campo nuevo de S (p. ej. S.miAjuste) y recuerda que en las partidas viejas no existe: léelo con un valor por
        defecto ((S.miAjuste||0)) o añádelo a DEF2 en escenas/tienda.ts. No cambies campos existentes.
     2. En html() de la página que toque (adultos/*.ts), añade una fila igual que la de "Paisaje" (adultos/comoSeJuega.ts):
        <div class="row"><span>Título</span> + radios con name="a-mi" y checked según S.miAjuste.
     3. En conectar(el) de esa página: radios(el, 'a-mi', (v) => { S.miAjuste = ...; save(); }).
     4. Usa S.miAjuste donde haga falta en el juego. Si debe sobrevivir a "Borrar todo el progreso", añádelo a keep en doReset().
     5. Los estilos (.row, .opt, .note...) están en head.html. Los textos del panel no se dicen con say(), se pueden cambiar. */
export function openAdult(pagina?: string) {
  adultWas = S.age + '|' + !!S.unlockAll;
  VIVO.lockDown = false;
  VIVO.lockHold = 0;
  try {
    speechSynthesis.cancel();
  } catch (e) {}
  const el = panel();
  el.hidden = false;
  // El menú: un botón por página (icono, nombre y nombre corto; los estilos enseñan uno u otro según el ancho).
  el.querySelector('nav.menu')!.innerHTML = PAGINAS_ADULTOS.map(
    (p) =>
      `<button type="button" data-pag="${p.id}"><span class="ico" aria-hidden="true">${p.icono}</span><span class="nom">${p.titulo}</span><span class="corto" aria-hidden="true">${p.corto}</span></button>`,
  ).join('');
  el.querySelector('.body')!.innerHTML = PAGINAS_ADULTOS.map(
    (p) => `<div class="pag" data-pag="${p.id}" hidden></div>`,
  ).join('');
  PAGINAS_ADULTOS.forEach(pintarPagina);
  el.querySelectorAll<HTMLButtonElement>('nav.menu button').forEach(
    (b) => (b.onclick = () => irA(b.dataset.pag as IdPagina)),
  );
  // Al girar el móvil de vertical a horizontal con la portada abierta, se pasa al Resumen (si no, no se vería nada).
  if (!vigilado && typeof matchMedia === 'function') {
    vigilado = true;
    matchMedia(MODO_PAGINAS).addEventListener('change', () => {
      if (!panel().hidden && actual === null && !modoPaginas()) irA('resumen', false);
    });
  }
  irA(esPagina(pagina) ? pagina : modoPaginas() ? null : 'resumen', false);
  el.querySelector<HTMLElement>('#a-titulo')?.focus({ preventScroll: true });
}

// closeAdult(): cierra el panel y pone a cero el tiempo de la sesión (también el guardado en S.ses); si Tito estaba
// dormido (límite de tiempo), vuelve al mapa; si cambió la edad o el modo libre, vuelve a abrir la escena 3D actual (B3
// del informe de pruebas jugadas).
export function closeAdult() {
  panel().hidden = true;
  VIVO.sessionT = 0;
  S.ses = null;
  save();
  if (sceneName === 'dormir') {
    go('map', { hello: true });
    return;
  }
  // Si cambió la edad o el modo libre, el mapa, el camino o la casita se vuelven a abrir para que candados y colores
  // cuadren con lo que se puede jugar. El cofre no (cuenta y premia al entrar) y las demás escenas no muestran candados.
  if (adultWas !== S.age + '|' + !!S.unlockAll && scene && scene.three && !['cofre', 'title'].includes(sceneName))
    go(sceneName, Object.assign({}, sceneArg, { hello: false, from: null, fin: false }));
}

// Botones de la cabecera: «Volver al juego» cierra y «‹ Categorías» (solo en el móvil en vertical) vuelve a la portada.
document.getElementById('a-close')!.onclick = () => closeAdult();
document.getElementById('a-atras')!.onclick = () => irA(null);
// Escape cierra la zona de adultos (el teclado del juego, en aplicacion/bucle.ts, no actúa con el panel abierto).
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !panel().hidden) closeAdult();
});
