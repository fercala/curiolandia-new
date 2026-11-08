// adultos/quienJuega.ts: página «Quién juega» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md): nombre,
// edad y cumpleaños (antes, la sección «Perfil» de aplicacion/adultos.ts). Guarda en S.name, S.age, S.bday y S.bdayDone.
import { MESES, S, VIVO, save } from '../../nucleo/indice.ts';
import { buscador, esc, radios } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

export const QUIEN_JUEGA: PaginaAdultos = {
  id: 'quienJuega',
  titulo: 'Quién juega',
  corto: 'Quién',
  icono: '🧒',
  // html(): el perfil (nombre de hasta 20 letras, edad 3, 4 o 5 y cumpleaños con día y mes).
  html: () => `
  <section><h3>Perfil</h3>
   <label>Nombre de quien juega <input id="a-name" maxlength="20" value="${esc(S.name || '')}" placeholder="Opcional"></label>
   <div class="row"><span>Edad</span>${[3, 4, 5].map((n) => `<label class="opt"><input type="radio" name="a-age" value="${n}" ${S.age === n ? 'checked' : ''}> ${n} años</label>`).join('')}</div>
   <div class="row"><span>Cumpleaños</span><select id="a-bd">${['—', ...Array.from({ length: 31 }, (_, i) => i + 1)].map((d, i) => `<option value="${i}" ${S.bday && S.bday.d === i ? 'selected' : ''}>${d}</option>`).join('')}</select><select id="a-bm">${['—', ...MESES].map((m, i) => `<option value="${i}" ${S.bday && S.bday.m === i - 1 ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
   <p class="note">El día del cumpleaños, la Asamblea lo celebra con una tarta y velitas.</p></section>`,
  // conectar(el): nombre (máx. 20 letras), edad (al cambiarla se reinicia la dificultad adaptativa, VIVO.ADAPT) y
  // cumpleaños (S.bday con el mes de 0 a 11, o null si falta el día o el mes; S.bdayDone='' para poder celebrarlo hoy).
  conectar(el) {
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
  },
};
