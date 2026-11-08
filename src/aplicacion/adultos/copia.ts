// adultos/copia.ts: página «Copia y aparato» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md): copia de
// seguridad (bkWire, adultos/copiaSeguridad.ts), instalar el juego, «Ir a» con todos los sitios y temas y, al final,
// «Empezar de cero» (doReset, aplicacion/dialogos.ts). Antes eran las últimas secciones de aplicacion/adultos.ts.
import { VIVO, go } from '../../nucleo/indice.ts';
import { TEMAS, standalone } from '../../escenas/escenas2d.ts';
import { doReset } from '../dialogos.ts';
import { bkWire } from './copiaSeguridad.ts';
import { buscador, esc } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

// installHTML(): HTML de la sección "Instalar": si ya está instalado, lo dice; si el navegador ofreció instalar
// (deferredInstall, de escenas/escenas2d.ts), un botón; y siempre las instrucciones para iPhone, Android y ordenador.
function installHTML() {
  if (standalone()) return '<p class="note">El juego ya está instalado en este dispositivo.</p>';
  const ios =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return (
    (VIVO.deferredInstall
      ? '<p><button id="a-install" style="background:#FFE08A">Instalar Curiolandia</button></p>'
      : '') +
    `<ul><li><b>iPhone o iPad (Safari):</b> toca el botón Compartir (el cuadrado con la flecha) y elige «Añadir a pantalla de inicio».</li>
   <li><b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».</li>
   <li><b>Ordenador (Chrome o Edge):</b> el icono de instalar en la barra de direcciones.</li></ul>
   <p class="note">Una vez instalado, se abre a pantalla completa y funciona sin internet. ${ios ? 'En iPhone la voz depende de las voces en español instaladas en Ajustes → Accesibilidad → Contenido leído.' : ''}</p>`
  );
}

export const COPIA: PaginaAdultos = {
  id: 'copia',
  titulo: 'Copia y aparato',
  corto: 'Copia',
  icono: '💾',
  // html(): copia de seguridad, instalar, ir a (los atajos data-go los conecta el panel) y empezar de cero.
  html: () => `
  <section><h3>Copia de seguridad</h3>
   <p class="note">Guarda todo el progreso (el camino, las monedas, la casa de Tito, las pegatinas y los ajustes) para pasarlo a otro dispositivo o recuperarlo si se borran los datos del navegador. Conviene hacer una copia de vez en cuando.</p>
   <div class="row"><button id="a-bk-dl">⬇️ Descargar copia</button><button id="a-bk-code">🔑 Ver código de copia</button><label class="opt" style="cursor:pointer">📂 Cargar archivo de copia<input type="file" id="a-bk-file" accept=".json,.txt,application/json,text/plain" hidden></label></div>
   <textarea id="a-bk-txt" rows="3" style="width:100%;box-sizing:border-box;font:13px/1.3 monospace;border:2px solid var(--ink);border-radius:12px;padding:8px;background:#fff" placeholder="Aquí aparece el código para copiar, o pega aquí un código para recuperar una copia."></textarea>
   <div class="row"><button id="a-bk-copy">📋 Copiar código</button><button id="a-bk-load">♻️ Recuperar con este código</button></div>
   <div id="a-bk-msg" class="note"></div></section>
  <section><h3>Instalar en el móvil o la tableta</h3>${installHTML()}</section>
  <section><h3>Ir a</h3><div class="row"><button data-go="map">Mapa</button><button data-go="asamblea">Asamblea</button><button data-go="jardin">Jardín de 3 años</button><button data-go="bosque">Bosque de 4 años</button><button data-go="montana">Montaña de 5 años</button><button data-go="fiestas">Días especiales</button><button data-go="tienda">Tienda</button><button data-go="casaTito">Casa de Tito</button><button data-go="album">Álbum</button><button data-go="intro">Ver el cuento del inicio</button></div>
   <div class="row"><select id="a-tema">${TEMAS.map((t) => `<option value="${t.id}">${esc(t.n)}</option>`).join('')}</select><button id="a-gotema">Ir al tema</button></div></section>
  <section><h3>Empezar de cero</h3><button id="a-reset" class="danger">Borrar todo el progreso</button><span id="a-confirm" hidden> ¿Seguro? <button id="a-yes" class="danger">Sí, borrar</button> <button id="a-no">No</button></span></section>`,
  // conectar(el, acciones): los botones de la copia, «Ir al tema», «Instalar» (lanza el aviso que guardó el navegador
  // y vuelve a pintar la página) y «Borrar todo», que pide confirmación en la propia página antes de doReset().
  conectar(el, acciones) {
    const q = buscador(el);
    bkWire(q);
    q('#a-gotema').onclick = () => {
      const id = q('#a-tema').value;
      acciones.cerrar();
      go('casita', { t: id, hello: true });
    };
    const ib = el.querySelector<HTMLButtonElement>('#a-install');
    if (ib)
      ib.onclick = () => {
        if (!VIVO.deferredInstall) return;
        VIVO.deferredInstall.prompt();
        VIVO.deferredInstall.userChoice.finally(() => {
          VIVO.deferredInstall = null;
          acciones.rehacer();
        });
      };
    q('#a-reset').onclick = () => {
      q('#a-confirm').hidden = false;
    };
    q('#a-no').onclick = () => {
      q('#a-confirm').hidden = true;
    };
    q('#a-yes').onclick = () => {
      acciones.cerrar();
      doReset();
    };
  },
};
