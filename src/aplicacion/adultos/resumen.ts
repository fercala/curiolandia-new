// adultos/resumen.ts: página «Resumen» de la zona de adultos, la que se ve al entrar (fases A1 y A2 de
// docs/PLAN-MENU-ADULTOS.md): quién juega, lo de hoy (minutos, monedas, estrellas y temas), los avisos que piden algo a la
// familia (cada uno con un botón a su página), lo que sigue en el camino (suggestTema, escenas/zonas.ts) y los atajos
// más usados. Las reglas (vales por entregar) están en dominio/zonaAdultos.ts.
import { S, STARS, temasDone, today } from '../../nucleo/indice.ts';
import { suggestTema } from '../../escenas/zonas.ts';
import { valesPorEntregar } from '../../dominio/zonaAdultos.ts';
import { copiaPendiente } from './copia.ts';
import { esc } from './comun.ts';
import type { IdPagina, PaginaAdultos } from './tipos.ts';

/** Un aviso del Resumen: el texto (HTML ya escapado) y la página a la que lleva su botón. */
interface AvisoResumen {
  readonly texto: string;
  readonly ir: IdPagina;
}

// hayVozInglesa(): ¿tiene este aparato alguna voz inglesa? Si speechSynthesis no existe o aún no ha cargado las voces,
// se da por buena (para no avisar sin motivo).
function hayVozInglesa(): boolean {
  if (!('speechSynthesis' in window)) return true;
  const v = speechSynthesis.getVoices();
  return !v.length || v.some((x) => /^en/i.test(x.lang));
}

// avisosResumen(): lo que pide algo a la familia, en orden de importancia: vales comprados por entregar, la copia de
// seguridad (desde la fase A6: nunca hecha o de hace 30 días o más) y que falte la voz inglesa (la Isla del Inglés la necesita).
function avisosResumen(): AvisoResumen[] {
  const r: AvisoResumen[] = [];
  const n = valesPorEntregar(S.valesLog || []);
  if (n)
    r.push({
      texto: n === 1 ? 'Hay <b>1 vale</b> por entregar.' : `Hay <b>${n} vales</b> por entregar.`,
      ir: 'premios',
    });
  if (copiaPendiente())
    r.push({
      texto: S.bkFecha
        ? 'Hace más de un mes de la última copia de seguridad: conviene hacer otra.'
        : 'Todavía no hay ninguna copia de seguridad del progreso: si se borran los datos del navegador, se pierde.',
      ir: 'copia',
    });
  if (!hayVozInglesa())
    r.push({
      texto: 'Este aparato no tiene voz inglesa: Polly dirá las palabras de la Isla del Inglés con acento castellano.',
      ir: 'titoYSonido',
    });
  return r;
}

export const RESUMEN: PaginaAdultos = {
  id: 'resumen',
  titulo: 'Resumen',
  corto: 'Resumen',
  icono: '🏠',
  // html(): «Hoy», «Avisos» (si hay; sus botones data-ir los conecta el panel), «Lo que sigue» (si queda algún tema en
  // el camino) y los atajos (data-go, también del panel).
  html() {
    const sug = suggestTema(),
      min = Math.round((S.days && S.days[today()]) || 0),
      avisos = avisosResumen();
    return `
  <section><h3>Hoy</h3>
   <p><b>${S.name ? esc(S.name) : 'Sin nombre'}</b> · ${S.age} años · <b>${min}</b> ${min === 1 ? 'minuto' : 'minutos'} de juego hoy${S.limit ? ` (límite: ${S.limit} min por sesión)` : ''}</p>
   <div class="cifras"><span>🪙 <b>${S.coins}</b> monedas</span><span>⭐ <b>${STARS()}</b> estrellas</span><span>🌼 <b>${temasDone()}</b> temas terminados</span></div></section>
  ${avisos.length ? `<section><h3>Avisos</h3>${avisos.map((a) => `<div class="aviso"><span>${a.texto}</span><button type="button" data-ir="${a.ir}">Ver</button></div>`).join('')}</section>` : ''}
  ${sug ? `<section><h3>Lo que sigue</h3><p class="tip">Próximo tema del camino: <b>${esc(sug.n)}</b>. Para seguir fuera de la pantalla: ${esc(sug.tip || 'nombrar juntos las cosas del tema que encuentren en casa o en la calle.')}</p></section>` : ''}
  <section><h3>Ir a</h3><div class="row"><button data-go="map">Mapa</button><button data-go="asamblea">Asamblea</button><button data-go="tienda">Tienda</button><button data-go="casaTito">Casa de Tito</button><button data-go="album">Álbum</button></div><p class="note">Más sitios y cualquier tema, en «Copia y aparato».</p></section>`;
  },
  // conectar(): los atajos y los botones de los avisos los conecta el panel; no hay nada más.
  conectar() {},
};
