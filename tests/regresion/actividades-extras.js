// Recorre las cinco actividades opcionales en castellano y rumano con una partida de prueba.
const L = require('./lib');
const assert = require('node:assert/strict');
const [raiz] = process.argv.slice(2);
const R = L.registro('actividades-extras');

// caso(p, idioma): abre las entradas normales y comprueba el contenido y la vuelta de cada actividad.
async function caso(p, idioma) {
  const ir = async (nombre, opciones) => {
    await p.evaluate(([n, o]) => __cl.go(n, o), [nombre, opciones]);
    await escena(nombre);
  };
  const tocar = (x, y) => L.clic(p, x, y);
  const escena = async (esperada) => {
    try {
      await p.waitForFunction((n) => __cl.name === n && VIVO.fade < 0.3, esperada, { timeout: 15000 });
    } catch (e) {
      throw new Error('Esperaba ' + esperada + ', escena actual: ' + (await p.evaluate(() => __cl.name)), { cause: e });
    }
  };
  await p.evaluate(() => {
    Object.assign(__cl.S, { age: 3, intro: true, coins: 71 });
    save();
  });
  const antes = await p.evaluate(() => JSON.stringify([__cl.S.coins, __cl.S.temas, __cl.S.cole, __cl.S.exc]));
  await ir('juegosCortos');
  const tarjeta = await p.evaluate(() => {
    const t = TARJETAS_CORTOS.find(({ j }) => j.id === 'laberinto');
    return [t.x + t.w / 2, t.y + t.h / 2];
  });
  await tocar(...tarjeta);
  await escena('laberintoPatio');
  for (const [x, y] of [
    [737, 287],
    [862, 287],
    [862, 412],
    [862, 537],
    [987, 537],
  ])
    await tocar(x, y);
  assert(
    await p.evaluate(
      (ro) => window.__said.some((s) => s.includes(ro ? 'Ai ajuns la țintă!' : '¡Llegaste a la meta!')),
      idioma === 'ro',
    ),
  );
  await tocar(90, 90);
  await escena('juegosCortos');

  await ir('cole');
  await tocar(825, 665);
  await escena('flotaCole');
  await tocar(590, 795);
  await tocar(800, 795);
  assert(
    await p.evaluate(
      (ro) => window.__said.some((s) => s.includes(ro ? 'Ai ghicit!' : '¡Lo has adivinado!')),
      idioma === 'ro',
    ),
  );
  await tocar(90, 90);
  await escena('cole');

  const tema = await p.evaluate(() => TEMAS[0].id);
  await ir('casita', { t: tema, hello: true });
  await tocar(1260, 100);
  await escena('cuentoDecisiones');
  await tocar(575, 705);
  await tocar(1025, 705);
  assert(
    await p.evaluate(
      (ro) => window.__said.some((s) => s.includes(ro ? 'Din copac văd ghinda.' : 'Desde el árbol ven la bellota.')),
      idioma === 'ro',
    ),
  );
  await tocar(1025, 705);
  await escena('casita');

  await p.evaluate(() => openAdult('progreso'));
  await p.locator('[data-ficha="contar"]').click();
  const ficha = await p.waitForFunction(() => window.__fichaImpresa, null, { timeout: 15000 });
  const hoja = await ficha.jsonValue();
  assert.equal(hoja.dibujos, 3);
  assert(hoja.tema.length > 0);
  assert.equal(hoja.titulo, idioma === 'ro' ? 'Fișă de numărat' : 'Ficha para contar');
  await p.locator('[data-ficha="color"]').click();
  await p.waitForFunction(() => window.__fichaImpresa?.dibujos === 1, null, { timeout: 15000 });
  await p.evaluate(() => closeAdult());

  await ir('autobus');
  await tocar(800, 670);
  await escena('mercadoCole');
  await tocar(520, 465);
  await tocar(800, 465);
  await tocar(800, 785);
  await tocar(800, 785);
  assert(
    await p.evaluate(
      (ro) => window.__said.some((s) => s.includes(ro ? 'Ai terminat cumpărăturile!' : '¡Compra hecha!')),
      idioma === 'ro',
    ),
  );
  await tocar(90, 90);
  await escena('autobus');

  assert.equal(await p.evaluate(() => JSON.stringify([__cl.S.coins, __cl.S.temas, __cl.S.cole, __cl.S.exc])), antes);
  assert.deepEqual(p.errs, []);
}

(async () => {
  const servidor = L.servir(raiz);
  const navegador = await L.navegador();
  try {
    for (const idioma of ['es', 'ro']) {
      const p = await L.abrir(navegador, servidor.port, {
        rapido: true,
        parametros: '?idioma=' + idioma,
        antes: () => {
          window.__said = [];
          if (window !== window.parent) {
            window.print = () => {
              window.parent.__fichaImpresa = {
                dibujos: document.querySelectorAll('svg').length,
                tema: document.querySelector('h2').textContent,
                titulo: document.title,
              };
            };
          }
        },
      });
      try {
        await caso(p, idioma);
        R.bien(idioma, 'Cinco actividades, regreso y partida intacta');
      } catch (e) {
        R.apuntar(idioma, 'alta', 'No se pudo completar el recorrido', String(e));
      } finally {
        await p.context().close();
      }
    }
  } finally {
    R.guardar();
    await navegador.close();
    servidor.close();
  }
})();
