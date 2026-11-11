// adultos/resumen.ts: página «Resumen» de la zona de adultos, la que se ve al entrar (fases A1 y A2 de
// docs/PLAN-MENU-ADULTOS.md): quién juega, lo de hoy (minutos, monedas, estrellas y temas), los avisos que piden algo a la
// familia (cada uno con un botón a su página), lo que sigue en el camino (suggestTema, escenas/zonas.ts) y los atajos
// más usados. Las reglas (vales por entregar) están en dominio/zonaAdultos.ts. Desde la fase P4 de docs/IDEAS-MEJORA.md,
// «Reto en casa»: el reto sin pantalla que propuso Tito (S.retos, dominio/retos.ts) y el botón para marcarlo como hecho
// (Tito lo celebra con una pegatina al volver al mapa).
import { IDIOMA, S, STARS, fmt, fmtHtml, hecho, save, temasDone, today, tr } from '../../nucleo/indice.ts';
import { suggestTema } from '../../escenas/zonas.ts';
import { valesPorEntregar } from '../../dominio/zonaAdultos.ts';
import { marcarRetoHecho, registroRetos, retoPorId } from '../../dominio/retos.ts';
import { IDIOMA_BASE, idioma } from '../../dominio/idiomas.ts';
import { copiaPendiente } from './copia.ts';
import { buscador, esc } from './comun.ts';
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

// hayVozDelIdioma(): ¿tiene este aparato alguna voz en el idioma del juego (idioma().voces: 'ro-RO', 'ro'...)? En
// castellano no se mira (fase ID4 de docs/PLAN-IDIOMAS.md: el aviso es para la voz rumana). Como hayVozInglesa, sin
// speechSynthesis o sin voces cargadas se da por buena.
function hayVozDelIdioma(): boolean {
  if (IDIOMA === IDIOMA_BASE || !('speechSynthesis' in window)) return true;
  const v = speechSynthesis.getVoices(),
    prefijos = idioma(IDIOMA).voces.map((p) => p.toLowerCase());
  return !v.length || v.some((x) => prefijos.some((p) => x.lang.replace('_', '-').toLowerCase().startsWith(p)));
}

// avisosResumen(): lo que pide algo a la familia, en orden de importancia: vales comprados por entregar, la copia de
// seguridad (desde la fase A6: nunca hecha o de hace 30 días o más), que falte la voz del idioma del juego (desde la fase
// ID4: la rumana; sin ella Tito habla con una voz de otro idioma) y que falte la voz inglesa (la Isla del Inglés la necesita).
function avisosResumen(): AvisoResumen[] {
  const r: AvisoResumen[] = [];
  const n = valesPorEntregar(S.valesLog || []);
  if (n)
    r.push({
      texto:
        n === 1
          ? 'Hay <b>1 vale</b> por entregar.'
          : fmtHtml('Hay {vales} por entregar.', { vales: `<b>${fmt('{n} vales', { n })}</b>` }),
      ir: 'premios',
    });
  if (copiaPendiente())
    r.push({
      texto: S.bkFecha
        ? 'Hace más de un mes de la última copia de seguridad: conviene hacer otra.'
        : 'Todavía no hay ninguna copia de seguridad del progreso: si se borran los datos del navegador, se pierde.',
      ir: 'copia',
    });
  if (!hayVozDelIdioma())
    r.push({
      texto:
        'Este aparato no tiene voz en el idioma del juego: Tito hablará con otra voz. En «Tito y el sonido» se explica cómo instalarla.',
      ir: 'titoYSonido',
    });
  if (!hayVozInglesa())
    r.push({
      texto: 'Este aparato no tiene voz inglesa: Polly dirá las palabras de la Isla del Inglés con acento castellano.',
      ir: 'titoYSonido',
    });
  return r;
}

// retoHTML(): la sección «Reto en casa»: el último reto que propuso Tito (con su día), si ya se hizo o el botón para
// marcarlo, y cuántos retos se han hecho. Sin reto propuesto todavía, explica cuándo sale.
function retoHTML(): string {
  const r = registroRetos(S.retos),
    reto = retoPorId(r.id);
  const cuenta = r.n ? ` Retos hechos hasta ahora: <b>${r.n}</b>.` : '';
  if (!reto)
    return `<section><h3>Reto en casa</h3><p class="note">Cuando Tito se despide (al acabar el tiempo de juego o al proponer descansar), deja un reto para hacer en casa sin pantalla. Saldrá aquí para marcarlo cuando lo hagáis.</p></section>`;
  const estado = r.hecho
    ? `<span>✅ Hecho.${r.celebrado ? '' : ' Tito lo celebrará con una pegatina al volver al mapa.'}</span>`
    : `<button type="button" id="a-reto-hecho">¡Lo ha hecho!</button>`;
  return `<section><h3>Reto en casa</h3><p><b>${esc(reto.adultos)}</b> <span class="note">${fmtHtml('(propuesto el {fecha})', { fecha: esc(r.d.split('-').reverse().join('/')) })}</span></p><div class="row">${estado}</div><p class="note">Un reto sin pantalla para llevar el juego a casa.${cuenta}</p></section>`;
}

export const RESUMEN: PaginaAdultos = {
  id: 'resumen',
  titulo: 'Resumen',
  corto: 'Resumen',
  icono: '🏠',
  // html(): «Hoy», «Avisos» (si hay; sus botones data-ir los conecta el panel), «Reto en casa» (desde la fase P4),
  // «Lo que sigue» (si queda algún tema en el camino) y los atajos (data-go, también del panel).
  html() {
    const sug = suggestTema(),
      min = Math.round((S.days && S.days[today()]) || 0),
      avisos = avisosResumen();
    return `
  <section><h3>Hoy</h3>
   <p><b>${S.name ? esc(S.name) : 'Sin nombre'}</b> · ${hecho(S.age ? fmt('{n} años', { n: S.age }) : tr('edad sin elegir'))} · ${fmtHtml(min === 1 ? '{n} minuto de juego hoy' : '{n} minutos de juego hoy', { n: `<b>${min}</b>` })}${S.limit ? ' ' + fmtHtml('(límite: {n} min por sesión)', { n: S.limit }) : ''}</p>
   <div class="cifras"><span>🪙 <b>${S.coins}</b> monedas</span><span>⭐ <b>${STARS()}</b> estrellas</span><span>🌼 <b>${temasDone()}</b> temas terminados</span></div></section>
  ${avisos.length ? `<section><h3>Avisos</h3>${avisos.map((a) => `<div class="aviso"><span>${a.texto}</span><button type="button" data-ir="${a.ir}">Ver</button></div>`).join('')}</section>` : ''}
  ${retoHTML()}
  ${sug ? `<section><h3>Lo que sigue</h3><p class="tip">Próximo tema del camino: <b>${esc(sug.n)}</b>. ${fmtHtml('Para seguir fuera de la pantalla: {tip}', { tip: esc(tr(sug.tip || 'nombrar juntos las cosas del tema que encuentren en casa o en la calle.')) })}</p></section>` : ''}
  <section><h3>Ir a</h3><div class="row"><button data-go="map">Mapa</button><button data-go="asamblea">Asamblea</button><button data-go="tienda">Tienda</button><button data-go="casaTito">Casa de Tito</button><button data-go="album">Álbum</button></div><p class="note">Más sitios y cualquier tema, en «Copia y aparato».</p></section>`;
  },
  // conectar(el, acciones): los atajos y los botones de los avisos los conecta el panel; aquí, el botón «¡Lo ha hecho!»
  // del reto en casa: lo marca como hecho (marcarRetoHecho), guarda y vuelve a pintar la página.
  conectar(el, acciones) {
    const b = buscador(el)('#a-reto-hecho');
    if (b)
      b.onclick = () => {
        S.retos = { ...marcarRetoHecho(S.retos) };
        save();
        acciones.rehacer();
      };
  },
};
