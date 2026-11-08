// adultos/titoYSonido.ts: página «Tito y el sonido» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md):
// personaje de Tito, voz del navegador (con «Probar» y la guía de voces) y volúmenes. Antes, las secciones «Personaje de
// Tito» e «Idioma y voz» de aplicacion/adultos.ts. Guarda en S.tito.kind, S.vozNav y S.vol.
import type { Tito, Volumenes } from '../../nucleo/tipos.ts';
import { S, VOICE, pickVoice, save, setVol, vocesES, vozCalidad, vozProbar } from '../../nucleo/indice.ts';
import { buscador, esc, radios } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

// vozGuiaHTML(): HTML de «Cómo conseguir voces más naturales»: los pasos para instalar o usar voces mejores en iPhone/iPad,
// Mac, Android y Windows. El aparato en el que se está jugando va primero y marcado. Una web no puede instalar voces:
// son las del sistema, así que solo se explica dónde se descargan y, después, se eligen en la lista de arriba.
function vozGuiaHTML() {
  const ua = navigator.userAgent,
    ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    yo = ios ? 'ios' : /android/i.test(ua) ? 'and' : /mac/i.test(ua) ? 'mac' : /windows/i.test(ua) ? 'win' : '';
  const P = [
    [
      'ios',
      'iPhone o iPad',
      'Ajustes → Accesibilidad → Contenido leído → Voces → Español → España. Descarga una voz «mejorada» o «prémium» (por ejemplo Mónica o Jorge).',
    ],
    [
      'mac',
      'Mac',
      'Ajustes del Sistema → Accesibilidad → Contenido leído → Voz del sistema → Gestionar voces → Español. Marca una voz mejorada o prémium y espera a que se descargue.',
    ],
    [
      'and',
      'Android',
      'Ajustes → Sistema → Idiomas → Salida de texto a voz. Elige el motor de Google, toca su rueda ⚙ → Instalar datos de voz → Español (España) y elige la voz que más te guste. Si no aparece, instala «Servicios de voz de Google» desde Google Play.',
    ],
    [
      'win',
      'Windows',
      'Lo más fácil es abrir el juego en Microsoft Edge: trae voces naturales sin instalar nada (por ejemplo «Elvira» o «Álvaro», de España), aunque necesitan internet. En Chrome aparece «Google español». Para más voces de Windows: Configuración → Hora e idioma → Voz → Agregar voces → Español (España).',
    ],
  ];
  P.sort((a, b) => +(b[0] === yo) - +(a[0] === yo));
  return `<ul>${P.map(([k, n, t]) => `<li><b>${n}${k === yo ? ' (este aparato)' : ''}:</b> ${t}</li>`).join('')}</ul>
   <p class="note">Después de instalar una voz, cierra el navegador y vuelve a abrir el juego: la voz nueva aparece en la lista «Voz del navegador». Las marcadas con ★ son las más naturales.</p>`;
}

export const TITO_Y_SONIDO: PaginaAdultos = {
  id: 'titoYSonido',
  titulo: 'Tito y el sonido',
  corto: 'Tito',
  icono: '🐌',
  // html(): personaje, voz y volumen. vname: la voz que se está usando; vopts: las voces en español de este aparato
  // (la primera, «Automática», deja que elija pickVoice).
  html() {
    // vname: voz del navegador que se está usando (para el texto informativo).
    const vname = VOICE ? `${VOICE.name} (${VOICE.lang})` : 'no se encontró una voz en español en este dispositivo';
    // vopts: la lista de voces en español de este aparato para elegir (la primera opción, «Automática», deja que elija pickVoice).
    const vopts =
      '<option value="">Automática (la mejor que haya)</option>' +
      vocesES()
        .map((v) => {
          const id = v.voiceURI || v.name;
          return `<option value="${esc(id)}" ${S.vozNav === id ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})${vozCalidad(v) >= 3 ? ' ★' : ''}</option>`;
        })
        .join('');
    return `
  <section><h3>Personaje de Tito</h3>
   <div class="row">${[
     ['caracol', '🐌 Caracol'],
     ['erizo', '🦔 Erizo'],
     ['tortuga', '🐢 Tortuga'],
     ['conejo', '🐰 Conejo'],
   ]
     .map(
       ([k, l]) =>
         `<label class="opt"><input type="radio" name="a-kind" value="${k}" ${((S.tito && S.tito.kind) || 'caracol') === k ? 'checked' : ''}> ${l}</label>`,
     )
     .join('')}</div>
   <p class="note">Tito sigue llamándose Tito. La ropa y los colores de la tienda le quedan igual (en el erizo el color va en las púas, en la tortuga en el caparazón y en el conejo en la mochila).</p></section>
  <section><h3>Voz</h3>
   <div class="row"><span>Voz del navegador</span><select id="a-vnav" style="max-width:100%">${vopts}</select><button id="a-vprueba" type="button">▶ Probar</button></div>
   <details class="guia-voces"><summary>Cómo conseguir voces más naturales</summary>${vozGuiaHTML()}</details>
   <p class="note">Tito habla con la voz del navegador. Voz del navegador: ${esc(vname)}.</p></section>
  <section><h3>Volumen</h3>
   ${(['voz', 'mus', 'fx'] as (keyof Volumenes)[]).map((k) => `<label class="rng">${{ voz: 'Voz', mus: 'Música', fx: 'Efectos' }[k]} <input type="range" id="a-${k}" min="0" max="1" step="0.05" value="${S.vol[k]}"></label>`).join('')}</section>`;
  },
  // conectar(el): personaje (y se pide a la capa 3D que rehaga a Tito, __w3.retito), voz elegida (se aplica con
  // pickVoice y se oye un saludo de prueba) y volúmenes (se aplican al momento con setVol).
  conectar(el) {
    const q = buscador(el);
    radios(el, 'a-kind', (v) => {
      S.tito = S.tito || {};
      S.tito.kind = v as Tito['kind'];
      save();
      try {
        if (window.__w3 && window.__w3.retito) window.__w3.retito();
      } catch (e) {
        console.error(e);
      }
    });
    q('#a-vnav').onchange = (e) => {
      S.vozNav = (e.target as HTMLInputElement).value;
      save();
      pickVoice();
      vozProbar();
    };
    q('#a-vprueba').onclick = () => {
      pickVoice();
      vozProbar();
    };
    (['voz', 'mus', 'fx'] as (keyof Volumenes)[]).forEach(
      (k) =>
        (q('#a-' + k).oninput = (e) => {
          S.vol[k] = +(e.target as HTMLInputElement).value;
          save();
          setVol();
        }),
    );
  },
};
