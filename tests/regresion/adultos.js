// Comprueba la zona de adultos reorganizada (fase A1 de docs/PLAN-MENU-ADULTOS.md) en tres tamaños: móvil en vertical
// (portada de tarjetas y páginas), móvil en horizontal (menú de iconos) y tableta (menú lateral). En cada uno: se abre
// en su sitio (portada o Resumen), cada categoría enseña solo su página, no hay desplazamiento de lado, «Volver al
// juego» se ve siempre (también al bajar hasta el final de la página), Escape cierra, y openAdult(pagina) abre esa
// página. Además, cada control de la zona guarda en su campo de S y sigue tras recargar.
// Uso: node tests/regresion/adultos.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('adultos');
// TAMANOS: nombre, ancho y alto de la ventana, si es táctil y si el menú es una portada de tarjetas (móvil en vertical).
const TAMANOS = [
  ['movil', 390, 844, true, true],
  ['apaisado', 844, 390, true, false],
  ['tableta', 1024, 768, true, false],
];
(async () => {
  const srv = L.servir(raiz),
    b = await L.navegador();
  // nuevo(o): una partida nueva sin cuento ni pregunta del nombre, abierta con las opciones o (tamaño).
  const nuevo = async (o = {}) => {
    const p = await L.abrir(b, srv.port, Object.assign({ rapido: true }, o));
    await p.evaluate(() => {
      const S = __cl.S;
      S.intro = true;
      S.age = 3;
      S.first.askedName = 1;
      save();
    });
    return p;
  };
  // caso(id, titulo, o, fn): ejecuta fn en una página nueva; fn devuelve un texto si algo falla.
  const caso = async (id, titulo, o, fn) => {
    let p;
    try {
      p = await nuevo(o);
      const prob = await fn(p);
      if (prob) {
        R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) });
        await R.captura(p, id + '.png');
      } else if (p.errs.length) R.apuntar(id, 'alta', titulo + ' (errores de JavaScript)', p.errs.slice(0, 3));
      else R.bien(id, titulo);
    } catch (e) {
      R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]);
    } finally {
      p && (await p.context().close());
    }
  };
  // estado(p): lo que se ve del panel: páginas visibles, si hay desplazamiento de lado, si «Volver al juego» está en
  // pantalla, si se ve el menú y si es la portada.
  const estado = (p) =>
    p.evaluate(() => {
      const el = document.querySelector('#adult'),
        c = document.querySelector('#a-close').getBoundingClientRect(),
        menu = document.querySelector('#adult nav.menu');
      return {
        abierto: !el.hidden,
        visibles: [...el.querySelectorAll('.pag')].filter((x) => !x.hidden).map((x) => x.dataset.pag),
        deLado:
          document.documentElement.scrollWidth > innerWidth ||
          el.querySelector('.body').scrollWidth > el.querySelector('.body').clientWidth + 1,
        cerrarVisible: c.top >= 0 && c.bottom <= innerHeight && c.width > 0,
        menuVisible: menu.getBoundingClientRect().width > 0,
        portada: el.querySelector('.panel').classList.contains('portada'),
      };
    });

  for (const [nom, ancho, alto, tactil, tarjetas] of TAMANOS) {
    await caso(
      `Z1-${nom}`,
      `Zona de adultos en ${nom} (${ancho}×${alto}): se abre, navega y cierra`,
      { ancho, alto, tactil },
      async (p) => {
        await p.evaluate(() => openAdult());
        let e = await estado(p);
        if (!e.abierto) return 'no se abrió';
        if (tarjetas && (!e.portada || e.visibles.length))
          return 'en el móvil en vertical debe abrirse la portada: ' + JSON.stringify(e);
        if (!tarjetas && e.visibles.join() !== 'resumen') return 'debe abrirse el Resumen: ' + JSON.stringify(e);
        const ids = await p.evaluate(() =>
          [...document.querySelectorAll('#adult nav.menu button')].map((b) => b.dataset.pag),
        );
        if (ids.length !== 7) return 'el menú tiene ' + ids.length + ' categorías';
        for (const id of ids) {
          if (tarjetas && !(await estado(p)).portada) await p.locator('#a-atras').click();
          await p.locator(`#adult nav.menu button[data-pag="${id}"]`).click();
          e = await estado(p);
          if (e.visibles.join() !== id) return `al tocar ${id} se ven: ${e.visibles.join()}`;
          if (e.deLado) return `${id}: hay desplazamiento de lado`;
          if (tarjetas && e.menuVisible)
            return `${id}: en el móvil en vertical el menú debe esconderse dentro de una página`;
          if (!tarjetas && !e.menuVisible) return `${id}: el menú lateral debe verse`;
          await p.evaluate(() => {
            const c = document.querySelector('#adult .body');
            c.scrollTop = c.scrollHeight;
          });
          if (!(await estado(p)).cerrarVisible) return `${id}: «Volver al juego» no se ve al bajar`;
        }
        await p.evaluate(() => openAdult('premios'));
        e = await estado(p);
        if (e.visibles.join() !== 'premios') return "openAdult('premios') enseña " + e.visibles.join();
        await p.keyboard.press('Escape');
        if ((await estado(p)).abierto) return 'Escape no cierra la zona';
      },
    );
  }

  await caso('Z2', 'Cada control de la zona de adultos guarda en S y sigue tras recargar', {}, async (p) => {
    // Con Playwright, como lo haría una persona: cada control en su página.
    await p.evaluate(() => openAdult('quienJuega'));
    await p.locator('#a-name').fill('Lola');
    await p.locator('[name=a-age][value="5"]').check();
    await p.locator('#a-bd').selectOption('7');
    await p.locator('#a-bm').selectOption('3');
    await p.evaluate(() => openAdult('comoSeJuega'));
    await p.locator('[name=a-mode][value=libre]').check();
    await p.locator('[name=a-lim][value="15"]').check();
    await p.locator('[name=a-tletra][value=ambas]').check();
    await p.locator('[name=a-hemi][value=S]').check();
    await p.locator('[name=a-q3][value=q]').check();
    await p.evaluate(() => openAdult('titoYSonido'));
    await p.locator('[name=a-kind][value=erizo]').check();
    await p.locator('#a-mus').evaluate((el) => {
      el.value = '0.3';
      el.dispatchEvent(new Event('input'));
    });
    await p.evaluate(() => openAdult('premios'));
    await p.locator('[data-vp="0"]').fill('42');
    await p.locator('[data-vp="0"]').dispatchEvent('change');
    await p.locator('[data-von="3"]').check();
    await p.locator('#a-close').click();
    await p.reload();
    await p.waitForFunction(() => window.__cl && __cl.S);
    const s = await p.evaluate(() => {
      const S = __cl.S;
      return {
        name: S.name,
        age: S.age,
        bday: S.bday,
        libre: !!S.unlockAll,
        limit: S.limit,
        letra: S.tipoLetra,
        hemi: S.hemi,
        quiet: S.quiet3,
        kind: S.tito && S.tito.kind,
        mus: S.vol.mus,
        precio: S.vales[0].p,
        vale3: S.vales[3].on,
      };
    });
    const esperado = {
      name: 'Lola',
      age: 5,
      bday: { d: 7, m: 2 },
      libre: true,
      limit: 15,
      letra: 'ambas',
      hemi: 'S',
      quiet: 1,
      kind: 'erizo',
      mus: 0.3,
      precio: 42,
      vale3: 1,
    };
    if (JSON.stringify(s) !== JSON.stringify(esperado)) return 'guardado: ' + JSON.stringify(s);
  });

  R.guardar();
  await b.close();
  srv.close();
  process.exit(0);
})();
