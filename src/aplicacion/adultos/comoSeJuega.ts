// adultos/comoSeJuega.ts: página «Cómo se juega» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md): modo de
// juego (camino o libre), límite de tiempo, letras de la isla, estaciones (hemisferio) y paisaje. Antes estaban en las
// secciones «Modo de juego», «Tiempo de juego» e «Idioma y voz» de aplicacion/adultos.ts. Guarda en S.unlockAll (con
// S.seenOpen y S.woke), S.limit, S.tipoLetra, S.hemi y S.quiet3.
import type { Estado } from '../../nucleo/tipos.ts';
import { S, save } from '../../nucleo/indice.ts';
import { zoneOpen } from '../../escenas/zonas.ts';
import { radios } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

export const COMO_SE_JUEGA: PaginaAdultos = {
  id: 'comoSeJuega',
  titulo: 'Cómo se juega',
  corto: 'Juego',
  icono: '🎮',
  // html(): una sección por ajuste, con sus radios marcados según S.
  html: () => `
  <section><h3>Modo de juego</h3>
   <div class="row">${[
     ['camino', '<b>Camino</b> (recomendado): todo se abre de uno en uno'],
     ['libre', '<b>Libre</b> (todo abierto)'],
   ]
     .map(
       ([k, l]) =>
         `<label class="opt"><input type="radio" name="a-mode" value="${k}" ${(k === 'libre') === !!S.unlockAll ? 'checked' : ''}> ${l}</label>`,
     )
     .join('')}</div>
   <p class="note"><b>Camino:</b> los temas son un camino y se abren de a uno; dentro de cada tema, los juegos también se abren en orden. El botón verde del mapa lleva siempre al que sigue y lo ya jugado se puede repetir. El Bosque de 4 años y la Montaña de 5 años se abren con la edad elegida o al juntar 6 flores en la zona anterior. Las canciones se abren al terminar 1 tema del camino; las rutinas, al terminar 2; los trazos, 3, y los días especiales, 4. Las islas de las Letras y del Inglés están abiertas desde el principio.</p>
   <p class="note"><b>Libre:</b> se puede elegir cualquier tema, cualquier juego y cualquier zona, también las de 4 y 5 años, sin importar la edad. Se puede cambiar en cualquier momento y no se pierde nada de lo jugado.</p></section>
  <section><h3>Tiempo de juego</h3>
   <div class="row">${[
     [0, 'Sin límite'],
     [10, '10 min'],
     [15, '15 min'],
     [20, '20 min'],
   ]
     .map(
       ([k, l]) =>
         `<label class="opt"><input type="radio" name="a-lim" value="${k}" ${S.limit === k ? 'checked' : ''}> ${l}</label>`,
     )
     .join('')}</div>
   <p class="note">Al llegar al límite, Tito se despide y se va a dormir. Para seguir, hay que abrir esta zona.</p></section>
  <section><h3>Isla de las Letras</h3>
   <div class="row"><span>Letras de la isla</span>${[
     ['mayus', 'Solo MAYÚSCULAS (para empezar)'],
     ['ambas', 'Mayúsculas y minúsculas'],
   ]
     .map(
       ([k, l]) =>
         `<label class="opt"><input type="radio" name="a-tletra" value="${k}" ${(S.tipoLetra === 'ambas' ? 'ambas' : 'mayus') === k ? 'checked' : ''}> ${l}</label>`,
     )
     .join('')}</div>
   <p class="note">Con minúsculas, en la Isla de las Letras se conoce, se busca, se atrapa y se escribe también la letra pequeña, y el libro de letras las enseña juntas.</p></section>
  <section><h3>Estaciones del año</h3>
   <div class="row"><span>Estaciones</span>${[
     ['N', 'Hemisferio norte (España)'],
     ['S', 'Hemisferio sur (Argentina, Uruguay)'],
   ]
     .map(
       ([k, l]) =>
         `<label class="opt"><input type="radio" name="a-hemi" value="${k}" ${S.hemi === k ? 'checked' : ''}> ${l}</label>`,
     )
     .join('')}</div></section>
  <section><h3>Paisaje</h3>
   <div class="row"><span>Paisaje</span>${[
     ['', 'Tito cuenta y nombra lo que se toca'],
     ['q', 'Sin comentarios en el paisaje'],
   ]
     .map(
       ([k, l]) =>
         `<label class="opt"><input type="radio" name="a-q3" value="${k}" ${(S.quiet3 ? 'q' : '') === k ? 'checked' : ''}> ${l}</label>`,
     )
     .join('')}</div></section>`,
  // conectar(el): cada grupo de radios guarda su campo de S al momento.
  conectar(el) {
    // Modo de juego: libre (S.unlockAll) o camino. Se olvida lo que ya se avisó como recién abierto (S.seenOpen) y, al
    // volver al camino, las zonas que quedan cerradas vuelven a "dormir" (S.woke) para celebrar otra vez su apertura.
    radios(el, 'a-mode', (v) => {
      S.unlockAll = v === 'libre';
      S.seenOpen = {};
      if (!S.unlockAll) for (const z of ['bosque', 'montana']) if (!zoneOpen(z)) delete S.woke![z];
      save();
    });
    // Límite de tiempo en minutos (0 = sin límite).
    radios(el, 'a-lim', (v) => {
      S.limit = +v;
      save();
    });
    // Letras de la isla (fase L7b): S.tipoLetra 'mayus' (solo mayúsculas) o 'ambas' (también minúsculas).
    radios(el, 'a-tletra', (v) => {
      S.tipoLetra = v === 'ambas' ? 'ambas' : 'mayus';
      save();
    });
    // Hemisferio de las estaciones.
    radios(el, 'a-hemi', (v) => {
      S.hemi = v as Estado['hemi'];
      save();
    });
    // Paisaje: S.quiet3=1 hace callar los comentarios de Tito en el mundo 3D (say3 en mundo3d/cielo.ts).
    radios(el, 'a-q3', (v) => {
      S.quiet3 = v === 'q' ? 1 : 0;
      save();
    });
  },
};
