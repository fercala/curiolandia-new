// adultos/resumen.ts: página «Resumen» de la zona de adultos, la que se ve al entrar (fase A1 de
// docs/PLAN-MENU-ADULTOS.md): lo que sigue en el camino (suggestTema, escenas/zonas.ts) y los atajos más usados. La
// fase A2 le sumará quién juega, los minutos de hoy, las monedas y los avisos.
import { suggestTema } from '../../escenas/zonas.ts';
import { esc } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

export const RESUMEN: PaginaAdultos = {
  id: 'resumen',
  titulo: 'Resumen',
  corto: 'Resumen',
  icono: '🏠',
  // html(): «Lo que sigue» (si queda algún tema en el camino) y los atajos (data-go, los conecta el panel).
  html() {
    const sug = suggestTema();
    return `
  ${sug ? `<section><h3>Lo que sigue</h3><p class="tip">Próximo tema del camino: <b>${esc(sug.n)}</b>. Para seguir fuera de la pantalla: ${esc(sug.tip || 'nombrar juntos las cosas del tema que encuentren en casa o en la calle.')}</p></section>` : ''}
  <section><h3>Ir a</h3><div class="row"><button data-go="map">Mapa</button><button data-go="asamblea">Asamblea</button><button data-go="tienda">Tienda</button><button data-go="casaTito">Casa de Tito</button><button data-go="album">Álbum</button></div><p class="note">Más sitios y cualquier tema, en «Copia y aparato».</p></section>`;
  },
  // conectar(): los atajos los conecta el panel; no hay nada más.
  conectar() {},
};
