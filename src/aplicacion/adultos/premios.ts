// adultos/premios.ts: página «Premios y vales» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md): monedas,
// estrellas, cómo se ganan, los vales para canjear en la vida real (activar, texto y precio: S.vales) y los vales por
// entregar (S.valesLog). Antes, la sección «Monedas y premios» de aplicacion/adultos.ts. Desde la fase A4, los vales por
// entregar van arriba y la explicación de las monedas, plegada.
import type { Vale } from '../../nucleo/tipos.ts';
import { S, STARS, save } from '../../nucleo/indice.ts';
import { valesPorEntregar } from '../../dominio/zonaAdultos.ts';
import { esc } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

export const PREMIOS: PaginaAdultos = {
  id: 'premios',
  titulo: 'Premios y vales',
  corto: 'Premios',
  icono: '🎟️',
  // aviso(): los vales comprados que faltan por entregar (fase A2).
  aviso: () => valesPorEntregar(S.valesLog || []),
  // html(): vales (una fila por vale para editarlo) y pend (los comprados que aún no se han dado, con «Entregado»).
  html() {
    // vales: una fila por vale (casilla de activo, texto y precio en monedas) para editarlos.
    const vales = S.vales!.map(
      (v, i) =>
        `<div class="row vale"><label class="opt"><input type="checkbox" data-von="${i}" ${v.on ? 'checked' : ''}></label><input data-vtxt="${i}" maxlength="60" value="${esc(v.txt)}" style="flex:1;min-width:180px"><label>🪙 <input type="number" data-vp="${i}" min="5" max="500" value="${v.p}" style="width:70px"></label></div>`,
    ).join('');
    // pend: vales que el niño compró en la tienda y aún no se le dieron (con botón "Entregado").
    const pend = S.valesLog!.map((v, i) => [v, i] as [Vale, number])
      .filter(([v]) => !v.given)
      .map(
        ([v, i]) =>
          `<div class="row"><span>🎟️ ${esc(v.txt)} <small>(${v.d!.slice(5).split('-').reverse().join('/')})</small></span><button data-vgive="${i}">Entregado ✔</button></div>`,
      )
      .join('');
    return `
  ${pend ? `<section><h3>Vales por entregar</h3><p class="note">Los ha comprado en la tienda: cuando se los des, toca «Entregado».</p>${pend}</section>` : ''}
  <section><h3>Monedas y estrellas</h3>
   <div class="cifras"><span>🪙 <b>${S.coins}</b> monedas</span><span>Ha ganado <b>${S.coinsTot}</b> en total</span><span>⭐ <b>${STARS()}</b> estrellas</span><span>🎁 <b>${S.cofres || 0}</b> cofres abiertos</span></div>
   <details><summary>Cómo se ganan y en qué se gastan</summary><p class="note">Gana 1 moneda por cada acierto a la primera (hasta 5 por juego), 3 al terminar un juego nuevo, 2 al repetirlo, 10 en el cofre del tesoro al completar un tema (que además trae un regalo sorpresa para Tito o su casa), 3 de regalo al entrar cada día y 5 al terminar la Asamblea. Con las monedas compra ropa y colores para Tito, cosas para su casa, juguetes y mascotas. Las cosas más especiales se abren con estrellas (una por cada juego terminado). La casa de Tito crece en el mapa al terminar 2, 5, 9 y 14 temas; por dentro tiene siete habitaciones que se abren al terminar 1, 3, 5, 8, 11 y 14 temas (dormitorio, cocina, baño, cuarto de juegos, jardín y torre de las estrellas), y las cosas se llevan de una a otra arrastrándolas hasta el botón de la habitación; y Pipo, su dinosaurio, nace y crece con las estrellas (4, 15, 35 y 70). No hay compras con dinero real ni premios al azar.</p></details></section>
  <section><h3>Vales para canjear en la vida real</h3><p class="note">Los vales marcados aparecen en la tienda. Cuando compre uno, sale arriba, en «Vales por entregar».</p>${vales}</section>`;
  },
  // conectar(el, acciones): activar/desactivar un vale, cambiar su texto (no vacío) y su precio (de 1 a 500), y
  // «Entregado», que lo quita de pendientes y vuelve a pintar la página.
  conectar(el, acciones) {
    el.querySelectorAll<HTMLInputElement>('[data-von]').forEach(
      (c) =>
        (c.onchange = () => {
          S.vales![+c.dataset.von!].on = c.checked ? 1 : 0;
          save();
        }),
    );
    el.querySelectorAll<HTMLInputElement>('[data-vtxt]').forEach(
      (c) =>
        (c.oninput = () => {
          const t = c.value.trim();
          if (t) {
            S.vales![+c.dataset.vtxt!].txt = t;
            save();
          }
        }),
    );
    el.querySelectorAll<HTMLInputElement>('[data-vp]').forEach(
      (c) =>
        (c.onchange = () => {
          const n = Math.round(+c.value);
          if (n >= 1) {
            S.vales![+c.dataset.vp!].p = Math.min(500, n);
            save();
          }
        }),
    );
    el.querySelectorAll<HTMLInputElement>('[data-vgive]').forEach(
      (b) =>
        (b.onclick = () => {
          S.valesLog![+b.dataset.vgive!].given = 1;
          save();
          acciones.rehacer();
          acciones.menu();
        }),
    );
  },
};
