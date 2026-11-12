// Huecos de cobertura: guardado y recuperación, varias pestañas, salidas del repaso, reloj, PWA y recompensas.
// node tests/regresion/lanzar.js cobertura.js . [filtro]
const L = require('./lib'),
  fs = require('fs'),
  path = require('path');
const [root = '.', filter = ''] = process.argv.slice(2),
  name = 'cobertura' + (filter ? '-' + filter : '');
let repositoryCommit = null;
try {
  repositoryCommit = require('child_process')
    .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .trim();
} catch {}
const webSha256 = require('crypto')
  .createHash('sha256')
  .update(fs.readFileSync(path.join(root, 'index.html')))
  .digest('hex');
const gameVersion =
  (fs.readFileSync(path.join(root, 'sw.js'), 'utf8').match(/curiolandia-new-v([\d.]+)/) || [])[1] || null;
const report = {
  date: new Date().toISOString(),
  repositoryCommit,
  gameVersion,
  webSha256,
  note: 'Fixtures sintéticos. Ratón/teclado/DOM reales donde se indica; __fast omite audio. No certifica escucha ni móvil físico.',
  results: [],
};
const base = {
  age: 4,
  name: 'QA',
  variant: 'es',
  intro: true,
  first: { askedName: 1 },
  unlockAll: true,
  coins: 100,
  coinsTot: 100,
  gift: '2026-10-24',
  seenFl: 0,
  houseSeen: 0,
  petSeen: 0,
  woke: { jardin: 1, bosque: 1, montana: 1 },
  seenOpen: {},
};
fs.mkdirSync(L.SAL, { recursive: true });
const checkpoint = () => fs.writeFileSync(path.join(L.SAL, name + '.json'), JSON.stringify(report, null, 2));
(async () => {
  const server = L.servir(root);
  let browser;
  try {
    browser = await L.navegador();
    async function test(id, title, fn, options = {}) {
      if (filter && !filter.split(',').some((f) => id.includes(f))) return;
      let p;
      const start = Date.now();
      try {
        p = await L.abrir(browser, server.port, {
          guardado: base,
          rapido: true,
          fecha: '2026-10-24',
          hora: 11,
          espera: 350,
          ...options,
        });
        await p.waitForFunction(() => window.__cl && __cl.name === 'title');
        const detail = await fn(p),
          errors = [...new Set(p.errs)];
        const status = detail.fail || errors.length ? 'FAIL' : 'PASS';
        report.results.push({ id, title, status, detail, errors, ms: Date.now() - start });
        console.log(status, id, JSON.stringify(detail).slice(0, 700));
        if (status === 'FAIL' && !p.isClosed())
          await p.screenshot({ path: path.join(L.SAL, name + '-' + id + '.png') });
      } catch (e) {
        report.results.push({ id, title, status: 'ERROR_HARNESS', error: String(e), ms: Date.now() - start });
        console.log('ERROR_HARNESS', id, String(e).slice(0, 300));
      } finally {
        if (p) await p.context().close();
        checkpoint();
      }
    }
    await test(
      'dos-pestanas',
      'Guardar ajustes en una segunda pestaña no debe borrar una actividad terminada en la primera',
      async (p) => {
        const other = await p.context().newPage();
        await other.goto(`http://localhost:${server.port}/index.html`);
        await other.waitForFunction(() => window.__cl && sceneName === 'title');
        await p.evaluate(() => __cl.go('juego', { t: '3A-T1', g: 1 }));
        if (!(await L.conducir(p, () => sceneName !== 'juego', 35000, { real: true, azar: 0 })))
          throw new Error('El juego de búsqueda no terminó');
        const before = await p.evaluate(() => ({
          played: S.temas['3A-T1'].g[1],
          coins: S.coins,
          stats: JSON.parse(JSON.stringify(S.stats)),
        }));
        await other.evaluate(() => openAdult());
        await other.locator('#a-mus').evaluate((el) => {
          el.value = '.2';
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const disk = await p.evaluate(() => JSON.parse(localStorage.getItem(KEY)));
        await p.reload();
        await p.waitForFunction(() => window.__cl && sceneName === 'title');
        const after = await p.evaluate(() => ({
          played: S.temas['3A-T1']?.g?.[1] || 0,
          coins: S.coins,
          volume: S.vol.mus,
        }));
        await other.close();
        return {
          fail: !after.played || after.coins !== before.coins,
          before,
          after,
          persistedGame: disk.temas?.['3A-T1']?.g?.[1] || 0,
        };
      },
    );
    await test(
      'una-pestana-control',
      'Control: completar, cambiar volumen y recargar en una sola pestaña conserva la actividad',
      async (p) => {
        await p.evaluate(() => __cl.go('juego', { t: '3A-T1', g: 1 }));
        if (!(await L.conducir(p, () => sceneName !== 'juego', 35000, { real: true, azar: 0 })))
          throw new Error('No terminó el juego');
        const before = await p.evaluate(() => ({ played: S.temas['3A-T1'].g[1], coins: S.coins }));
        await p.evaluate(() => openAdult());
        await p.locator('#a-mus').evaluate((el) => {
          el.value = '.2';
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await p.reload();
        await p.waitForFunction(() => window.__cl && sceneName === 'title');
        const after = await p.evaluate(() => ({ played: S.temas['3A-T1']?.g?.[1] || 0, coins: S.coins }));
        return { fail: after.played !== before.played || after.coins !== before.coins, before, after };
      },
    );
    // Abre otra página con la partida del mismo contexto, sin volver a sembrar el almacenamiento.
    async function abrirOtra(contexto, errores) {
      const otra = await contexto.newPage();
      otra.on('pageerror', (e) => errores.push(String(e).split('\n')[0]));
      await otra.addInitScript(() => {
        window.__fast = 1;
      });
      await otra.goto(`http://localhost:${server.port}/index.html`);
      await otra.waitForFunction(() => window.__cl && sceneName === 'title');
      return otra;
    }

    // Lee el saldo y el total ganado del estado activo para comparar antes y después de recargar.
    const monedero = (p) => p.evaluate(() => ({ saldo: S.coins, total: S.coinsTot }));

    await test(
      'guardado-cierre-moneda',
      'Cerrar la pestaña tras ganar una moneda conserva saldo y total',
      async (p) => {
        const contexto = p.context();
        await p.evaluate(() => __cl.go('juego', { t: '3A-T1', g: 1 }));
        if (!(await L.conducir(p, () => S.coins > 100, 35000, { real: true, azar: 0 })))
          throw new Error('No se ganó ninguna moneda en el juego');
        const antes = await monedero(p);
        await p.close({ runBeforeUnload: false });
        const nueva = await abrirOtra(contexto, p.errs);
        const despues = await monedero(nueva);
        return { fail: despues.saldo !== antes.saldo || despues.total !== antes.total, antes, despues };
      },
    );

    await test('guardado-compra-doble', 'Confirmar el mismo artículo en dos pestañas cobra una sola vez', async (p) => {
      const otra = await abrirOtra(p.context(), p.errs);
      for (const pagina of [p, otra]) {
        await pagina.evaluate(() => __cl.go('tienda', {}));
        await pagina.waitForFunction(() => sceneName === 'tienda' && VIVO.fade < 0.5);
        const casilla = await pagina.evaluate(() => {
          const casilla = scene.grid().find((g) => g.it.id === 'gorroFiesta');
          return casilla && { x: casilla.x, y: casilla.y, precio: casilla.it.p };
        });
        if (!casilla) throw new Error('El gorro de fiesta no está en la primera página');
        await L.clic(pagina, casilla.x, casilla.y);
        await pagina.waitForFunction(() => scene.conf?.id === 'gorroFiesta' && T - scene.confT >= 0.3);
      }
      const precio = await p.evaluate(() => scene.conf.p);
      await L.clic(p, 680, 690);
      // Espera a que la segunda pestaña reciba el evento real de almacenamiento antes de confirmar.
      await otra.waitForFunction(() => S.owned.gorroFiesta && S.coins < 100);
      const primera = await monedero(otra);
      if (primera.saldo !== 100 - precio) throw new Error('La primera compra no cobró el precio esperado');
      await L.clic(otra, 680, 690);
      await otra.waitForFunction(() => !scene.conf);
      await otra.reload();
      await otra.waitForFunction(() => window.__cl && sceneName === 'title');
      const despues = await otra.evaluate(() => ({ saldo: S.coins, tieneGorro: !!S.owned.gorroFiesta }));
      return { fail: despues.saldo !== 100 - precio || !despues.tieneGorro, precio, primera, despues };
    });

    await test(
      'guardado-escritura-fallida',
      'Si falla la escritura queda la última partida válida y se recupera el guardado al volver a escribir',
      async (p) => {
        const antes = await monedero(p);
        await p.evaluate(() => {
          const escribir = Storage.prototype.setItem;
          window.__restaurarGuardado = () => {
            Storage.prototype.setItem = escribir;
          };
          window.__escriturasRechazadas = 0;
          Storage.prototype.setItem = function (clave, valor) {
            if (this === localStorage && clave === KEY) {
              window.__escriturasRechazadas++;
              throw new DOMException('Sin espacio (prueba)', 'QuotaExceededError');
            }
            return escribir.call(this, clave, valor);
          };
          __cl.go('juego', { t: '3A-T1', g: 1 });
        });
        if (!(await L.conducir(p, () => S.coins > 100, 35000, { real: true, azar: 0 })))
          throw new Error('No se ganó ninguna moneda con el guardado bloqueado');
        const memoria = await monedero(p);
        const rechazadas = await p.evaluate(() => window.__escriturasRechazadas);
        if (!rechazadas) throw new Error('No se provocó ningún fallo de escritura');
        const nueva = await abrirOtra(p.context(), p.errs);
        const durante = await monedero(nueva);
        await p.evaluate(() => {
          window.__restaurarGuardado();
          openAdult();
        });
        await p.locator('#a-mus').evaluate((el) => {
          el.value = '.2';
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await nueva.reload();
        await nueva.waitForFunction(() => window.__cl && sceneName === 'title');
        const recuperado = await monedero(nueva);
        return {
          fail:
            durante.saldo !== antes.saldo ||
            durante.total !== antes.total ||
            recuperado.saldo !== memoria.saldo ||
            recuperado.total !== memoria.total,
          antes,
          memoria,
          durante,
          recuperado,
          rechazadas,
        };
      },
    );

    const prepareReview = (p) =>
      p.evaluate(() => {
        S.temas['3A-T1'] = { g: { 1: 1 }, done: 0 };
        S.rep = { d: today(), list: ['3A-T1#1'], done: {}, weak: 1, paid: 0, seen: 1 };
        __cl.go('repaso', {});
      });
    await test('repaso-atajo', 'Salir del juego de repaso al mapa debe limpiar su contexto', async (p) => {
      await prepareReview(p);
      await p.waitForFunction(() => VIVO.fade < 0.5);
      const station = await p.evaluate(() => scene.pos(0));
      await L.clic(p, ...station);
      await p.waitForFunction(() => sceneName === 'juego');
      await p.evaluate(() => openAdult());
      await p.getByRole('button', { name: 'Mapa', exact: true }).click();
      await p.waitForFunction(() => sceneName === 'map');
      await p.evaluate(() => openAdult('copia'));
      await p.locator('#a-tema').selectOption('3A-T2');
      await p.locator('#a-gotema').click();
      const result = await p.evaluate(() => ({ scene: sceneName, theme: scene.t?.id || null, reviewFlag: REP_ON }));
      return { fail: result.scene !== 'casita' || result.theme !== '3A-T2', requested: '3A-T2', result };
    });
    await test(
      'repaso-casa-control',
      'Control: la casa del juego de repaso vuelve al repaso y limpia el contexto',
      async (p) => {
        await prepareReview(p);
        await p.waitForFunction(() => VIVO.fade < 0.5);
        const station = await p.evaluate(() => scene.pos(0));
        await L.clic(p, ...station);
        await p.waitForFunction(() => sceneName === 'juego' && VIVO.fade < 0.5);
        await L.clic(p, 80, 80);
        return p.evaluate(() => ({ fail: sceneName !== 'repaso' || REP_ON, scene: sceneName, reviewFlag: REP_ON }));
      },
    );
    const prepareGift = (p) =>
      p.evaluate(() => {
        S.gift = '';
        S.coins = 0;
        S.seenFl = temasDone();
        S.houseSeen = houseLevel();
        S.petSeen = petStage();
        for (const z of MAINZ) S.woke[z] = 1;
        newlyOpen(
          'map',
          MZ2.filter((z) => spotNeed(z.id) && spotOpen(z.id)).map((z) => z.id),
        );
        __cl.go('map', {});
      });
    await test('diario-salida', 'El regalo diario debe entregarse aunque se salga pronto del mapa', async (p) => {
      await prepareGift(p);
      await p.waitForFunction(() => VIVO.fade < 0.5);
      await L.clic(p, 80, 80);
      await p.waitForFunction(() => sceneName === 'title');
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2000);
      return p.evaluate(() => ({
        fail: S.gift === today() && S.coins === 0,
        claimed: S.gift,
        coins: S.coins,
        date: today(),
      }));
    });
    await test(
      'diario-espera-control',
      'Control: permanecer en el mapa entrega una sola vez las tres monedas',
      async (p) => {
        await prepareGift(p);
        await p.waitForFunction(() => S.coins === 3);
        await p.evaluate(() => __cl.go('map', {}));
        await p.waitForTimeout(1600);
        return p.evaluate(() => ({ fail: S.coins !== 3, coins: S.coins, claimed: S.gift }));
      },
    );
    await test(
      'reloj-10fps',
      'El reloj de sesión no debe contar la mitad del tiempo a 10 FPS',
      async (p) => {
        await p.evaluate(() => {
          VIVO.sessionT = 0;
          VIVO.minuteAcc = 0;
          __cl.go('juego', { t: '3A-T1', g: 1 });
        });
        const before = await p.evaluate(() => ({
          elapsed: performance.now(),
          counted: VIVO.sessionT,
          frames: window.__qaFrames || 0,
        }));
        await p.waitForTimeout(3000);
        const after = await p.evaluate(() => ({
          elapsed: performance.now(),
          counted: VIVO.sessionT,
          frames: window.__qaFrames || 0,
        }));
        const elapsed = (after.elapsed - before.elapsed) / 1000,
          counted = after.counted - before.counted,
          frames = after.frames - before.frames;
        return { fail: counted < elapsed * 0.75, elapsed, counted, frames, ratio: counted / elapsed };
      },
      {
        antes: () => {
          window.__qaFrames = 0;
          window.requestAnimationFrame = (cb) =>
            setTimeout(() => {
              window.__qaFrames++;
              cb(performance.now());
            }, 100);
          window.cancelAnimationFrame = clearTimeout;
        },
      },
    );
    await test(
      'reloj-normal-control',
      'Control: el reloj cuenta el tiempo de la pestaña sin ralentización artificial',
      async (p) => {
        await p.evaluate(() => {
          VIVO.sessionT = 0;
          VIVO.minuteAcc = 0;
          __cl.go('juego', { t: '3A-T1', g: 1 });
        });
        const before = await p.evaluate(() => ({ elapsed: performance.now(), counted: VIVO.sessionT }));
        await p.waitForTimeout(3000);
        const after = await p.evaluate(() => ({ elapsed: performance.now(), counted: VIVO.sessionT }));
        const elapsed = (after.elapsed - before.elapsed) / 1000,
          counted = after.counted - before.counted;
        return { fail: counted < elapsed * 0.8, elapsed, counted, ratio: counted / elapsed };
      },
    );
    await test(
      'teclado-cofre-control',
      'Escape desde el cofre entrega una sola vez el premio como el botón de casa',
      async (p) => {
        await p.evaluate(() => {
          S.coins = 0;
          S.owned = {};
          __cl.go('cofre', { t: '3A-T1' });
        });
        await p.waitForFunction(() => VIVO.fade < 0.5);
        await p.keyboard.press('Escape');
        await p.waitForFunction(() => sceneName !== 'cofre');
        return p.evaluate(() => ({
          fail: S.coins !== 10 || !S.owned.gorroFiesta,
          coins: S.coins,
          gift: S.owned.gorroFiesta,
        }));
      },
    );
    await test('pwa-sin-conexion', 'La PWA cargada y cacheada debe arrancar de nuevo sin conexión', async (p) => {
      await p.evaluate(async () => {
        await navigator.serviceWorker.register('./sw.js');
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('El worker no se activó en el servidor de pruebas')), 12000),
          ),
        ]);
      });
      await p.reload();
      await p.waitForFunction(() => !!navigator.serviceWorker.controller && window.__cl && sceneName === 'title');
      await p.context().setOffline(true);
      await p.reload({ waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => window.__cl && sceneName === 'title');
      const result = await p.evaluate(() => ({
        scene: sceneName,
        worker: !!navigator.serviceWorker.controller,
        three: !!(window.__w3 && window.__w3.ok),
      }));
      await p.context().setOffline(false);
      return { fail: result.scene !== 'title' || !result.worker || !result.three, ...result };
    });
    const prepareVoucher = async (p) => {
      await p.evaluate(() => {
        S.coins = 100;
        S.first.tienda = 1;
        __cl.go('tienda', {});
      });
      await p.waitForFunction(() => VIVO.fade < 0.5);
      const tab = await p.evaluate(() => scene.tabs().find((t) => t.id === 'vales'));
      await L.clic(p, tab.x, tab.y);
      const it = await p.evaluate(() => {
        const g = scene.grid().find((g) => g.it.vale?.id === 'v1');
        return { x: g.x, y: g.y };
      });
      await L.clic(p, it.x, it.y);
      await p.waitForFunction(() => scene.conf && T - scene.confT > 0.3);
    };
    await test(
      'vale-desactivado',
      'Desactivar un vale debe impedir confirmar una compra pendiente de ese vale',
      async (p) => {
        await prepareVoucher(p);
        await p.evaluate(() => openAdult('premios'));
        await p.locator('[data-von="0"]').uncheck();
        await p.locator('#a-close').click();
        await L.clic(p, 680, 690);
        return p.evaluate(() => ({
          fail: !S.vales[0].on && S.valesLog.some((v) => v.id === 'v1'),
          enabled: S.vales[0].on,
          coins: S.coins,
          purchases: S.valesLog,
        }));
      },
    );
    await test(
      'vale-canje-control',
      'Control: comprar y marcar un vale entregado persiste sin cobro doble',
      async (p) => {
        await prepareVoucher(p);
        await L.clic(p, 680, 690);
        await p.evaluate(() => openAdult('premios'));
        await p.locator('[data-vgive="0"]').click();
        await p.reload();
        await p.waitForFunction(() => window.__cl && sceneName === 'title');
        return p.evaluate(() => ({
          fail: S.coins !== 70 || S.valesLog.length !== 1 || S.valesLog[0].given !== 1,
          coins: S.coins,
          purchases: S.valesLog,
        }));
      },
    );
    const candles = async (p) => {
      await p.evaluate(() => {
        S.coins = 0;
        S.bday = { m: 9, d: 24 };
        S.bdayDone = '';
        __cl.go('asamblea', {});
      });
      if (!(await L.conducir(p, () => scene.s === 'cumple', 12000, { real: true, azar: 0 })))
        throw new Error('No se alcanzó el cumpleaños');
      const total = await p.evaluate(() => scene.vs.length);
      for (let i = 0; i < total; i++) {
        const h = await p.evaluate(() => scene.hint());
        if (!h) throw new Error('Falta la vela ' + i);
        await L.clic(p, h.x, h.y);
      }
    };
    await test(
      'cumple-salida',
      'No perder las diez monedas del cumpleaños al salir tras apagar la última vela',
      async (p) => {
        await candles(p);
        await L.clic(p, 80, 80);
        await p.waitForFunction(() => sceneName === 'map');
        await p.evaluate(() => __cl.go('asamblea', {}));
        await p.waitForTimeout(1200);
        return p.evaluate(() => ({
          fail: S.bdayDone === today() && S.coins === 0 && !scene.steps.includes('cumple'),
          claimed: S.bdayDone,
          coins: S.coins,
          birthdayStep: scene.steps.includes('cumple'),
          sticker: !!S.stk.tarta,
        }));
      },
    );
    await test(
      'cumple-espera-control',
      'Control: apagar las velas y esperar entrega diez monedas y la pegatina',
      async (p) => {
        await candles(p);
        await p.waitForFunction(() => S.coins === 10);
        return p.evaluate(() => ({
          fail: S.coins !== 10 || !S.stk.tarta,
          claimed: S.bdayDone,
          coins: S.coins,
          sticker: !!S.stk.tarta,
        }));
      },
    );
    await test(
      'cumple-bisiesto-control',
      'El cumpleaños del 29 de febrero se activa con el formato de fecha correcto',
      async (p) => {
        await p.evaluate(() => {
          S.bday = { m: 1, d: 29 };
          S.bdayDone = '';
          __cl.go('asamblea', {});
        });
        return p.evaluate(() => ({
          fail: !isBday() || !scene.steps.includes('cumple'),
          date: today(),
          birthday: isBday(),
          steps: scene.steps,
        }));
      },
      { fecha: '2028-02-29' },
    );
    report.summary = {
      cases: report.results.length,
      pass: report.results.filter((r) => r.status === 'PASS').length,
      fail: report.results.filter((r) => r.status === 'FAIL').length,
      harnessErrors: report.results.filter((r) => r.status === 'ERROR_HARNESS').length,
    };
    checkpoint();
    console.log('RESUMEN', JSON.stringify(report.summary));
    process.exitCode = report.summary.harnessErrors ? 2 : report.summary.fail ? 1 : 0;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 2;
});
