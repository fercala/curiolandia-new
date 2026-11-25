// Recorre las ideas de la PR de todas las ideas pendientes (v0.2.181, docs/IDEAS-MEJORA.md, ideas 29 a 47) en
// castellano y rumano con una partida de prueba: entra en cada escena nueva sin errores (el diario, el rincón de la
// lógica, el taller, el estudio de arte, el corral, las misiones, «Jugar juntos» y los primeros pasos), juega una
// partida de «Jugar juntos» entera, hace el primer paso de los primeros pasos, mira el informe semanal y la fluidez del
// 3D en la zona de adultos, imprime la ficha de trazos y comprueba que la partida sigue bien guardada.
const L = require('./lib');
const assert = require('node:assert/strict');
const [raiz] = process.argv.slice(2);
const R = L.registro('ideas');

// ESCENAS: las escenas nuevas en las que se entra.
const ESCENAS = [
  'diario',
  'rinconLogica',
  'logicaSudoku',
  'logicaFalta',
  'logicaDiferencias',
  'logicaBalanza',
  'logicaTangram',
  'taller',
  'expColores',
  'expImanes',
  'expSombras',
  'expAgua',
  'expSemilla',
  'estudioArte',
  'arteSimetria',
  'arteCancion',
  'corral',
  'misiones',
];

// caso(p, idioma): el recorrido en un idioma.
async function caso(p, idioma) {
  const escena = async (esperada) => {
    try {
      await p.waitForFunction((n) => __cl.name === n && VIVO.fade < 0.3, esperada, { timeout: 15000 });
    } catch (e) {
      throw new Error('Esperaba ' + esperada + ', escena actual: ' + (await p.evaluate(() => __cl.name)), { cause: e });
    }
  };
  const ir = async (nombre) => {
    await p.evaluate((n) => __cl.go(n, {}), nombre);
    await escena(nombre);
    await p.waitForTimeout(300);
  };
  await p.evaluate(() => {
    Object.assign(__cl.S, { age: 4, intro: true, coins: 30, exc: { granja: { veces: 1 } } });
    save();
  });
  for (const e of ESCENAS) await ir(e);
  assert.deepEqual(p.errs, [], 'errores al entrar en las escenas nuevas');

  // «Jugar juntos»: se dan la vuelta a las parejas en orden hasta terminar; al final, 2 monedas y el diario
  await ir('juntos');
  const monedas = await p.evaluate(() => __cl.S.coins);
  const cartas = await p.evaluate(() => JUNTOS.p.cartas);
  const hechas = new Set();
  for (let i = 0; i < cartas.length; i++) {
    if (hechas.has(i)) continue;
    const j = cartas.findIndex((k, n) => n !== i && k === cartas[i]);
    for (const n of [i, j]) {
      const r = await p.evaluate(([n, total]) => cartaJuntos(n, total), [n, cartas.length]);
      await p.waitForFunction(() => !JUNTOS.tapando);
      await L.clic(p, r.x + r.w / 2, r.y + r.h / 2);
    }
    hechas.add(i).add(j);
  }
  await p.waitForFunction(() => JUNTOS.fin, null, { timeout: 10000 });
  await p.waitForFunction((m) => __cl.S.coins >= m + 2, monedas, { timeout: 10000 });
  assert(await p.evaluate(() => (__cl.S.diario[today()] || []).includes('juntos')), 'el diario apunta «juntos»');

  // los primeros pasos: el primer paso (la estrella) pasa al segundo; su frase, en el idioma del juego
  await ir('primerosPasos');
  await L.clic(p, 1050, 430);
  await p.waitForFunction(() => ESTADO_PASOS.paso === 1, null, { timeout: 15000 });
  assert(
    await p.evaluate(
      (ro) => window.__said.some((s) => s.includes(ro ? 'Atinge steaua' : 'Toca la estrella')),
      idioma === 'ro',
    ),
    'Tito explica el primer paso en el idioma del juego',
  );

  // la zona de adultos: el informe semanal, la fluidez del 3D y la ficha de trazos
  await p.evaluate(() => openAdult('resumen'));
  assert(await p.locator('#a-informe').isVisible(), 'el Resumen tiene el botón de compartir el informe');
  assert(
    await p.locator('section', { hasText: idioma === 'ro' ? 'Săptămâna' : 'La semana' }).count(),
    'el Resumen tiene «La semana»',
  );
  await p.evaluate(() => openAdult('copia'));
  assert(
    await p.locator('section', { hasText: idioma === 'ro' ? 'Fluiditatea 3D' : 'Fluidez del 3D' }).count(),
    '«Copia y aparato» tiene la fluidez del 3D',
  );
  await p.evaluate(() => openAdult('progreso'));
  await p.locator('[data-ficha="trazos"]').click();
  const hoja = await (await p.waitForFunction(() => window.__fichaImpresa, null, { timeout: 15000 })).jsonValue();
  assert.equal(hoja.titulo, idioma === 'ro' ? 'Fișă cu trasee' : 'Ficha de trazos');
  assert(hoja.dibujos >= 5, 'la ficha de trazos tiene sus líneas');
  await p.evaluate(() => closeAdult());

  // la partida guardada sigue siendo buena (con el diario)
  const guardada = await p.evaluate(() => JSON.parse(localStorage.getItem(KEY) || '{}'));
  assert(guardada.diario && guardada.coins >= monedas + 2, 'la partida guardada tiene el diario y las monedas');
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
                titulo: document.title,
              };
            };
          }
        },
      });
      try {
        await caso(p, idioma);
        R.bien(idioma, 'Las escenas nuevas, «Jugar juntos», los primeros pasos y la zona de adultos');
      } catch (e) {
        R.apuntar(idioma, 'alta', 'No se pudo completar el recorrido de las ideas', String(e));
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
