// adultos/quienJuega.ts: página «Quién juega» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md): nombre,
// edad y cumpleaños (antes, la sección «Perfil» de aplicacion/adultos.ts). Guarda en S.name, S.age, S.bday y S.bdayDone.
// Desde la v0.2.180 (idea 38 de docs/IDEAS-MEJORA.md), también «Varios niños»: los perfiles (aplicacion/perfiles.ts).
import { MESES, S, VIVO, fmtHtml, save } from '../../nucleo/indice.ts';
import { buscador, esc, radios } from './comun.ts';
import type { AccionesPagina, PaginaAdultos } from './tipos.ts';
import { anadirNino, cambiarAPerfil, leerPerfiles } from '../perfiles.ts';
import { MAX_PERFILES } from '../../dominio/perfiles.ts';

// htmlPerfiles(): la sección «Varios niños» (idea 38 de docs/IDEAS-MEJORA.md, v0.2.180): los perfiles, con un botón
// para jugar con cada uno de los que no juegan, y, si caben más, el formulario para añadir otro (nombre y edad).
function htmlPerfiles(): string {
  const ind = leerPerfiles();
  return `<section><h3>Varios niños</h3>
   <p class="note">Hasta tres niños pueden jugar en este móvil, cada uno con su partida. Al empezar a jugar, Tito pregunta quién juega.</p>
   ${ind.lista
     .map(
       (p) =>
         `<div class="row"><span>${esc(p.nombre || '—')}${p.edad ? ' · ' + fmtHtml('{n} años', { n: p.edad }) : ''}</span>${
           p.id === ind.activo
             ? '<b>Juega ahora</b>'
             : `<button class="btn" data-perfil="${p.id}">Jugar con este perfil</button>`
         }</div>`,
     )
     .join('')}
   ${
     ind.lista.length < MAX_PERFILES
       ? `<label>Nombre del niño nuevo <input id="a-pnombre" maxlength="20" placeholder="Opcional"></label>
   <div class="row"><span>Edad</span>${[3, 4, 5].map((n) => `<label class="opt"><input type="radio" name="a-pedad" value="${n}" ${n === 3 ? 'checked' : ''}> ${fmtHtml('{n} años', { n })}</label>`).join('')}</div>
   <button class="btn" id="a-panadir">Añadir un niño</button>`
       : ''
   }</section>`;
}
// conectarPerfiles(el): los botones de jugar con otro perfil (cambia y recarga) y de añadir uno (lo añade y vuelve a
// pintar la página).
function conectarPerfiles(el: HTMLElement, acciones: AccionesPagina): void {
  el.querySelectorAll<HTMLButtonElement>('[data-perfil]').forEach((b) => {
    b.onclick = () => cambiarAPerfil(b.dataset['perfil'] || '');
  });
  const anadir = el.querySelector<HTMLButtonElement>('#a-panadir');
  if (!anadir) return;
  anadir.onclick = () => {
    const nombre = el.querySelector<HTMLInputElement>('#a-pnombre')?.value.trim() || '',
      edad = +(el.querySelector<HTMLInputElement>('[name=a-pedad]:checked')?.value || 3);
    if (!anadirNino(nombre, edad)) return;
    el.innerHTML = QUIEN_JUEGA.html();
    QUIEN_JUEGA.conectar(el, acciones);
  };
}

export const QUIEN_JUEGA: PaginaAdultos = {
  id: 'quienJuega',
  titulo: 'Quién juega',
  corto: 'Quién',
  icono: '🧒',
  // html(): el perfil (nombre de hasta 20 letras, edad 3, 4 o 5 y cumpleaños con día y mes).
  html: () => `
  <section><h3>Perfil</h3>
   <label>Nombre de quien juega <input id="a-name" maxlength="20" value="${esc(S.name || '')}" placeholder="Opcional"></label>
   <div class="row"><span>Edad</span>${[3, 4, 5].map((n) => `<label class="opt"><input type="radio" name="a-age" value="${n}" ${S.age === n ? 'checked' : ''}> ${fmtHtml('{n} años', { n })}</label>`).join('')}</div>
   <div class="row"><span>Cumpleaños</span><select id="a-bd">${['—', ...Array.from({ length: 31 }, (_, i) => i + 1)].map((d, i) => `<option value="${i}" ${S.bday && S.bday.d === i ? 'selected' : ''}>${d}</option>`).join('')}</select><select id="a-bm">${['—', ...MESES].map((m, i) => `<option value="${i}" ${S.bday && S.bday.m === i - 1 ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
   <p class="note">El día del cumpleaños, la Asamblea lo celebra con una tarta y velitas.</p></section>
  ${htmlPerfiles()}`,
  // conectar(el): nombre (máx. 20 letras), edad (al cambiarla se reinicia la dificultad adaptativa, VIVO.ADAPT) y
  // cumpleaños (S.bday con el mes de 0 a 11, o null si falta el día o el mes; S.bdayDone='' para poder celebrarlo hoy).
  conectar(el, acciones) {
    const q = buscador(el);
    q('#a-name').oninput = (e) => {
      S.name = (e.target as HTMLInputElement).value.trim().slice(0, 20);
      save();
    };
    radios(el, 'a-age', (v) => {
      S.age = +v;
      VIVO.ADAPT = 0;
      save();
    });
    // bdc(): guarda el cumpleaños leyendo las dos listas.
    const bdc = () => {
      const d = +q('#a-bd').value,
        m = +q('#a-bm').value;
      S.bday = d && m ? { d, m: m - 1 } : null;
      S.bdayDone = '';
      save();
    };
    q('#a-bd').onchange = bdc;
    q('#a-bm').onchange = bdc;
    conectarPerfiles(el, acciones);
  },
};
