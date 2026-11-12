// Comprueba que todo lo que el niño oye y ve pasa por la traducción (fase ID3 de docs/PLAN-IDIOMAS.md). Juega con el
// pseudoidioma de prueba (?idioma=xx), que marca cada texto traducido con ⟦...⟧ y lo alarga, y recorre todas las
// escenas, los tres primeros juegos de cada casita y cada página de la zona de adultos. Apunta un hallazgo si:
//   I1: Tito dice algo sin traducir (lo que se dice en inglés, __saidEn, no se traduce y se salta);
//   I2: se pinta en el lienzo un texto con letras sin traducir;
//   I3: un texto pintado se sale de la pantalla;
//   I4: la zona de adultos o las ventanas de la página enseñan un texto sin traducir;
//   I5: (desde la fase ID4) lo que ya está en rumano (?idioma=ro) deja algo sin traducir: la zona de adultos (ID4a) y,
//       desde la ID4b, la portada, el mapa y sus zonas, la casita, la asamblea, el álbum, la tienda, el cofre, el repaso
//       y las islas, y desde la ID4c la casa de Tito y sus escenas; menos las casitas de la Isla de las Letras (ID6), el nombre del niño y las palabras sueltas de los
//       carteles de las islas (de la ID6 y del inglés, que no se traduce);
//   I0: hay errores de JavaScript.
// La Isla de las Letras (sus letras, sílabas y palabras para leer) tendrá su versión rumana en la ID6: no se mira aquí.
// Uso: node tests/regresion/idiomas.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('idiomas');
// FUERA: escenas que no se miran: la de juego (se abre con cada casita) y la casa en 3D de prueba (solo para medir FPS).
const FUERA = new Set(['juego', 'casa3dPrueba']);
// ESCENAS_RO: las escenas que ya están en rumano (I5), desde la fase ID4b; «escena:inst» la abre con ese inst.
const ESCENAS_RO = [
  'portada',
  'map',
  'asamblea',
  'album',
  'tienda',
  'cofre',
  'repaso',
  'isla',
  'islaIngles',
  'diccionario',
  'jardin',
  'bosque',
  'montana',
  'fiestas',
  'casita',
  // desde la ID4c, la casa de Tito y sus escenas
  'casaTito',
  'sorpresasCasa',
  'casaBano',
  'casaCielo',
  'casaMerienda',
  'casaSopa',
  'casaHuerto',
  'casaMundo',
  'casaMusica',
  'casaNoches',
  'casaPizarra',
  'casaTele',
  // cada mascota (escena:inst), con su nombre por elegir
  'casaMascota:casitaPerro',
  'casaMascota:gato',
  'casaMascota:pajaro',
  'casaMascota:conejo',
  'casaMascota:hamster',
  'casaMascota:pecera',
  'casaMascota:pipo',
];
// LETRAS: las casitas de la Isla de las Letras (L3-..., L4-..., L5-...) y sus escenas: su contenido es del castellano
// y sus juegos de letras y sonidos no funcionan con otras palabras hasta su versión rumana (ID6).
const LETRAS = /^L\d-|lectura|letras/i;
(async () => {
  const srv = L.servir(raiz),
    b = await L.navegador();
  const p = await L.abrir(b, srv.port, {
    rapido: true,
    parametros: '?idioma=xx',
    // espía del lienzo: cada texto que se pinta con letras y sin la marca del pseudoidioma (I2), y los que se salen
    // de la pantalla (I3), con la escena en que salieron
    antes: () => {
      window.__said = [];
      window.__saidEn = [];
      window.__sinMarca = {};
      window.__fuera = {};
      const original = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (t, x, y, ...resto) {
        try {
          const s = String(t),
            esc = (window.__cl && window.__cl.name) || '?';
          if (/\p{L}{2}/u.test(s) && !s.includes('⟦') && !s.includes('⟧')) window.__sinMarca[esc + ': ' + s] = 1;
          const m = this.getTransform();
          if (this.canvas.width >= 1000 && m.b === 0 && m.c === 0) {
            const w = this.measureText(s).width,
              al = this.textAlign,
              x0 = al === 'center' ? x - w / 2 : al === 'right' || al === 'end' ? x - w : x,
              a = m.a * x0 + m.e,
              z = m.a * (x0 + w) + m.e;
            if (a < -4 || z > this.canvas.width + 4) window.__fuera[esc + ': ' + s.slice(0, 60)] = 1;
          }
        } catch (e) {}
        return original.call(this, t, x, y, ...resto);
      };
    },
  });
  try {
    await p.evaluate(() => {
      const S = __cl.S;
      S.intro = true;
      S.age = 5;
      S.name = 'Ana';
      S.first.askedName = 1;
      S.coins = 7;
      save();
    });
    // todas las escenas, con lo que piden las que necesitan algo (la excursión, la casita), y lo que dice Tito al entrar
    const escenas = await p.evaluate(() => Object.keys(SCENES));
    for (const e of escenas) {
      if (FUERA.has(e)) continue;
      await p.evaluate((e) => {
        try {
          __cl.go(e, { exc: 'granja', hello: true, t: TEMAS[0].id });
        } catch (x) {}
      }, e);
      await p.waitForTimeout(700);
      await p.evaluate(() => {
        try {
          SCENES[__cl.name]?.prompt?.();
        } catch (x) {}
      });
      await p.waitForTimeout(250);
    }
    // los tres primeros juegos de cada casita, menos los de la Isla de las Letras
    const temas = await p.evaluate(
      (re) => TEMAS.map((t) => t.id).filter((id) => !new RegExp(re, 'i').test(id)),
      LETRAS.source,
    );
    for (const t of temas)
      for (const g of [0, 1, 2]) {
        await p.evaluate(
          ([t, g]) => {
            try {
              __cl.go('juego', { t, g });
            } catch (x) {}
          },
          [t, g],
        );
        await p.waitForTimeout(350);
      }
    await p.evaluate(() => __cl.go('map', {}));
    const r = await p.evaluate(() => {
      const en = new Set(window.__saidEn);
      return {
        dicho: [...new Set(window.__said.filter((s) => !s.includes('⟦') && !en.has(s) && /\p{L}{2}/u.test(s)))],
        pinta: Object.keys(window.__sinMarca),
        fuera: Object.keys(window.__fuera),
      };
    });
    if (r.dicho.length) R.apuntar('I1', 'alta', 'Tito dice frases sin traducir', r.dicho.slice(0, 10));
    else R.bien('I1', 'todo lo que dice Tito pasa por la traducción (' + escenas.length + ' escenas)');
    // en las casitas de las letras se escriben letras y sílabas sueltas: fuera de la cuenta
    const pinta = r.pinta.filter((s) => !LETRAS.test(s));
    if (pinta.length) R.apuntar('I2', 'alta', 'textos pintados sin traducir', pinta.slice(0, 10));
    else R.bien('I2', 'todo lo que se pinta en el lienzo pasa por la traducción');
    if (r.fuera.length) R.apuntar('I3', 'media', 'textos que se salen de la pantalla', r.fuera.slice(0, 10));
    else R.bien('I3', 'ningún texto se sale de la pantalla, aunque sea más largo');
    // la zona de adultos, página a página, y lo que tiene escrito: cada texto con letras, marcado
    const sinMarca = await p.evaluate(async () => {
      const malos = new Set();
      const mira = (raiz) => {
        const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          const t = n.textContent.trim(),
            el = n.parentElement;
          if (!el || el.closest('script,style') || !el.offsetParent) continue;
          if (/\p{L}{2}/u.test(t) && !t.includes('⟦') && !t.includes('⟧')) malos.add(t.slice(0, 60));
        }
      };
      openAdult();
      await new Promise((ok) => setTimeout(ok, 150));
      const paginas = [...document.querySelectorAll('#adult nav button[data-pag]')].map((x) => x.dataset.pag);
      for (const pg of paginas) {
        openAdult(pg);
        await new Promise((ok) => setTimeout(ok, 150));
        mira(document.getElementById('adult'));
      }
      closeAdult();
      return [...malos];
    });
    // el nombre del niño y los números con letras de medida no se traducen
    const adultos = sinMarca.filter((t) => t !== 'Ana');
    if (adultos.length) R.apuntar('I4', 'alta', 'la zona de adultos enseña textos sin traducir', adultos.slice(0, 10));
    else R.bien('I4', 'la zona de adultos está traducida entera');
    // la zona de adultos en rumano: cada página, con sus partes plegadas abiertas, sin nada en sinTraducir
    const pr = await L.abrir(b, srv.port, { rapido: true, parametros: '?idioma=ro' });
    const faltan = await pr.evaluate(async (ESCENAS_RO) => {
      const S = __cl.S;
      S.intro = true;
      S.age = 5;
      S.name = 'Ana';
      S.first.askedName = 1;
      save();
      const antes = new Set(__cl.sinTraducir());
      openAdult();
      await new Promise((ok) => setTimeout(ok, 150));
      const paginas = [...document.querySelectorAll('#adult nav button[data-pag]')].map((x) => x.dataset.pag);
      for (const pg of paginas) {
        openAdult(pg);
        await new Promise((ok) => setTimeout(ok, 150));
        document.querySelectorAll('#adult details').forEach((d) => (d.open = true));
      }
      closeAdult();
      // las escenas que ya están en rumano (desde la ID4b), con lo que dice Tito al entrar
      for (const e of ESCENAS_RO) {
        const [escena, inst] = e.split(':');
        try {
          __cl.go(escena, { hello: true, t: TEMAS[0].id, inst });
        } catch (x) {}
        await new Promise((ok) => setTimeout(ok, 700));
        try {
          SCENES[__cl.name]?.prompt?.();
        } catch (x) {}
        await new Promise((ok) => setTimeout(ok, 250));
      }
      // las casitas de la Isla de las Letras («La A», «(abeja)»...) se traducen en la ID6
      const temas = new Set(TEMAS.filter((t) => /^L\d-/.test(t.id)).map((t) => t.n));
      return __cl
        .sinTraducir()
        .filter(
          (t) => !antes.has(t) && !temas.has(t) && !/^ana$/i.test(t) && !/^La \p{Lu}$|^\(.*\)$|^\p{Lu}{2,4}$/u.test(t),
        );
    }, ESCENAS_RO);
    if (faltan.length) R.apuntar('I5', 'alta', 'lo hecho en rumano deja textos sin traducir', faltan.slice(0, 10));
    else R.bien('I5', 'la zona de adultos y las escenas de la ID4 están en rumano');
    p.errs.push(...pr.errs);
    if (p.errs.length) R.apuntar('I0', 'alta', 'errores de JavaScript', p.errs.slice(0, 3));
    else R.bien('I0', 'sin errores de JavaScript');
  } catch (e) {
    R.apuntar('IX', 'alta', 'la prueba no pudo terminar', String(e).split('\n')[0]);
  } finally {
    R.guardar();
    await b.close();
    srv.close();
  }
})();
