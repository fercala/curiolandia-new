// Huecos de cobertura: guardado y recuperación, varias pestañas, salidas del repaso, reloj, PWA y recompensas.
// node tests/regresion/lanzar.js cobertura.js . [filtro]
// Los filtros largos o no válidos como nombre de archivo usan una huella corta y quedan completos dentro del JSON.
const L = require('./lib'),
  fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');
const [root = '.', filter = ''] = process.argv.slice(2),
  filtroArchivo =
    filter &&
    (/^[\w,-]{1,80}$/.test(filter)
      ? filter
      : 'filtro-' + crypto.createHash('sha256').update(filter).digest('hex').slice(0, 16)),
  name = 'cobertura' + (filtroArchivo ? '-' + filtroArchivo : '');
let repositoryCommit = null;
try {
  repositoryCommit = require('child_process')
    .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .trim();
} catch {}
const webSha256 = crypto
  .createHash('sha256')
  .update(fs.readFileSync(path.join(root, 'index.html')))
  .digest('hex');
const gameVersion =
  (fs.readFileSync(path.join(root, 'sw.js'), 'utf8').match(/curiolandia-new-v([\d.]+)/) || [])[1] || null;
const report = {
  date: new Date().toISOString(),
  filter,
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

    await test(
      'guardado-volumenes',
      'Carga y sincronización reparan el audio y conservan la lista de vales vacía',
      async (p) => {
        const antes = await p.evaluate(() => ({ vol: S.vol, vales: S.vales }));
        const otra = await abrirOtra(p.context(), p.errs);
        await otra.evaluate(() => {
          S.vol = { voz: '0.6', mus: null, fx: 'roto' };
          save();
        });
        await p.waitForFunction(() => S.vol.voz === 0.6);
        const despues = await p.evaluate(() => {
          initAudio();
          setVol();
          return { vol: S.vol, vales: S.vales };
        });
        return {
          fail:
            antes.vol.voz !== 0 ||
            antes.vol.mus !== 0.2 ||
            antes.vol.fx !== 1 ||
            despues.vol.voz !== 0.6 ||
            despues.vol.mus !== 0.45 ||
            despues.vol.fx !== 0.8 ||
            antes.vales.length !== 0 ||
            despues.vales.length !== 0,
          antes,
          despues,
        };
      },
      {
        guardado: { ...base, vol: { voz: -1, mus: '0.2', fx: 5 }, vales: [] },
      },
    );

    await test(
      'candado-interrumpido',
      'Ocultar la pestaña o perder la captura cancela la pulsación del candado',
      async (p) => {
        await p.evaluate(() => __cl.go('casaTito', {}));
        await p.waitForFunction(() => VIVO.fade === 0);
        const [x, y] = await p.evaluate(() => [OX + 1546 * SC, OY + 852 * SC]);
        await p.mouse.move(x, y);
        await p.mouse.down();
        await p.waitForTimeout(500);
        const oculto = await p.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
          document.dispatchEvent(new Event('visibilitychange'));
          const cancelado = !VIVO.lockDown && VIVO.lockHold === 0;
          delete document.hidden;
          document.dispatchEvent(new Event('visibilitychange'));
          return cancelado;
        });
        await p.mouse.up();
        await p.mouse.down();
        await p.waitForTimeout(500);
        const sinCaptura = await p.evaluate(() => {
          document.getElementById('cv').dispatchEvent(new PointerEvent('lostpointercapture'));
          return !VIVO.lockDown && VIVO.lockHold === 0;
        });
        await p.waitForTimeout(3100);
        const cerrado = await p.evaluate(() => document.getElementById('adult').hidden);
        await p.mouse.up();
        return { fail: !oculto || !sinCaptura || !cerrado, oculto, sinCaptura, cerrado };
      },
    );

    for (const idioma of ['es', 'ro'])
      await test(
        'copia-archivo-reintento-' + idioma,
        'Un archivo que no se puede leer avisa y permite reintentar sin reemplazar el progreso (' + idioma + ')',
        async (p) => {
          await p.evaluate(() => openAdult('copia'));
          const antes = await p.evaluate(() => {
            save();
            const leer = File.prototype.text;
            // Solo falla la primera lectura; el segundo intento usa el mismo archivo y el lector real.
            File.prototype.text = function () {
              File.prototype.text = leer;
              return Promise.reject(new Error('Lectura interrumpida para la prueba'));
            };
            return [JSON.stringify(S), localStorage.getItem(KEY)];
          });
          const archivo = {
            name: 'copia-prueba.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify({ name: 'Copia de prueba', age: 4, temas: {}, coins: 37 })),
          };
          const entrada = p.locator('#a-bk-file');
          await entrada.setInputFiles(archivo);
          await p.waitForFunction(
            (texto) => document.getElementById('a-bk-msg').textContent.includes(texto),
            idioma === 'ro' ? 'Nu s-a putut citi' : 'No se pudo leer',
          );
          const falloSeguro = await p.evaluate(() => ({
            selectorVacio: document.getElementById('a-bk-file').value === '',
            sinConfirmacion: !document.getElementById('a-bk-ok'),
          }));
          await entrada.setInputFiles(archivo);
          await p.locator('#a-bk-ok').waitFor();
          const despues = await p.evaluate(() => ({
            partida: [JSON.stringify(S), localStorage.getItem(KEY)],
            selectorVacio: document.getElementById('a-bk-file').value === '',
            resumen: document.getElementById('a-bk-msg').textContent,
          }));
          const intacta = antes.every((v, i) => v === despues.partida[i]);
          return {
            fail:
              !intacta ||
              !falloSeguro.selectorVacio ||
              !falloSeguro.sinConfirmacion ||
              !despues.selectorVacio ||
              !despues.resumen.includes('Copia de prueba'),
            intacta,
            falloSeguro,
            reintento: despues.selectorVacio,
            resumen: despues.resumen,
          };
        },
        { guardado: { ...base, idioma } },
      );

    for (const idioma of ['es', 'ro'])
      await test(
        'copia-archivo-teclado-' + idioma,
        'El teclado abre el selector de copias y el resumen tiene una región de estado accesible (' + idioma + ')',
        async (p) => {
          await p.evaluate(() => openAdult('copia'));
          const boton = p.getByRole('button', {
            name: idioma === 'ro' ? '📂 Încarcă fișierul copiei' : '📂 Cargar archivo de copia',
            exact: true,
          });
          await boton.focus();
          const [selector] = await Promise.all([p.waitForEvent('filechooser'), boton.press('Enter')]);
          await selector.setFiles({
            name: 'copia-teclado.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify({ name: 'Copia por teclado', temas: {}, coins: 37 })),
          });
          await p.locator('#a-bk-ok').waitFor();
          await p
            .getByRole('textbox', {
              name: idioma === 'ro' ? 'Codul copiei de siguranță' : 'Código de copia de seguridad',
              exact: true,
            })
            .waitFor();
          const resultado = await p.evaluate(() => {
            const mensaje = document.getElementById('a-bk-msg');
            return {
              resumen: mensaje.textContent.includes('Copia por teclado'),
              estado:
                mensaje.getAttribute('role') === 'status' &&
                mensaje.getAttribute('aria-live') === 'polite' &&
                mensaje.getAttribute('aria-atomic') === 'true',
              sinRecuperar: S.name === 'QA' && S.coins === 100,
            };
          });
          return { fail: !resultado.resumen || !resultado.estado || !resultado.sinRecuperar, ...resultado };
        },
        { guardado: { ...base, idioma } },
      );

    for (const idioma of ['es', 'ro'])
      for (const falla of [false, true])
        await test(
          'copia-archivo-orden-' + idioma + (falla ? '-fallida' : '-tardia'),
          'La última copia elegida prevalece sobre una lectura anterior (' +
            idioma +
            ', ' +
            (falla ? 'error' : 'tardía') +
            ')',
          async (p) => {
            await p.evaluate(() => openAdult('copia'));
            const entrada = p.locator('#a-bk-file');
            const archivo = (name) => ({
              name: name + '.json',
              mimeType: 'application/json',
              buffer: Buffer.from(JSON.stringify({ name, age: 4, temas: {}, coins: 37 })),
            });
            await entrada.setInputFiles(archivo('Copia previa'));
            await p.locator('#a-bk-ok').waitFor();
            await p.evaluate(() => {
              const leer = File.prototype.text;
              File.prototype.text = function () {
                if (this.name === 'Primera lenta.json')
                  return new Promise((resolver, rechazar) => {
                    window.__finalizarLectura = (error) =>
                      error
                        ? rechazar(new Error('Lectura anterior interrumpida'))
                        : resolver(JSON.stringify({ name: 'Primera lenta', temas: {}, coins: 11 }));
                  });
                return leer.call(this);
              };
            });
            await entrada.setInputFiles(archivo('Primera lenta'));
            await p.waitForFunction(() => typeof window.__finalizarLectura === 'function');
            const sinConfirmacionAntigua = (await p.locator('#a-bk-ok').count()) === 0;
            const leyendo = await p.locator('#a-bk-msg').innerText();
            await entrada.setInputFiles(archivo('Última copia'));
            await p.locator('#a-bk-ok').waitFor();
            const resumen = await p.locator('#a-bk-msg').innerText();
            await p.evaluate(async (error) => {
              window.__finalizarLectura(error);
              await new Promise((r) => setTimeout(r, 0));
            }, falla);
            const sigueUltima =
              resumen === (await p.locator('#a-bk-msg').innerText()) && resumen.includes('Última copia');
            await p.locator('#a-bk-ok').click();
            await p.waitForFunction(() => window.__cl && S.name === 'Última copia' && S.coins === 37);
            return {
              fail:
                !sinConfirmacionAntigua ||
                !sigueUltima ||
                !leyendo.includes(idioma === 'ro' ? 'Se citește' : 'Leyendo'),
              sinConfirmacionAntigua,
              sigueUltima,
              restaurada: await p.evaluate(() => ({ nombre: S.name, monedas: S.coins })),
            };
          },
          { guardado: { ...base, idioma } },
        );

    for (const accion of ['entrega', 'texto', 'precio', 'activar'])
      await test(
        'vales-panel-antiguo-' + accion,
        'Un panel antiguo no modifica un vale distinto recibido de otra pestaña (' + accion + ')',
        async (p) => {
          await p.evaluate(() => {
            S.vales = [{ id: 'v-original', txt: 'Vale original', p: 20, on: 1 }];
            S.valesLog = [{ id: 'log-original', txt: 'Entrega original', d: '2026-10-24' }];
            save();
            openAdult('premios');
          });
          const otra = await p.context().newPage();
          await otra.goto(`http://localhost:${server.port}/index.html`);
          await otra.waitForFunction(() => window.__cl && sceneName === 'title');
          await otra.evaluate(() => {
            S.vales = [{ id: 'v-nuevo', txt: 'Vale nuevo', p: 35, on: 1 }];
            S.valesLog = [{ id: 'log-nuevo', txt: 'Entrega nueva', d: '2026-10-24' }];
            save();
          });
          await p.waitForFunction(() => S.vales[0].id === 'v-nuevo');
          const antes = await p.evaluate(() => [JSON.stringify([S.vales, S.valesLog]), localStorage.getItem(KEY)]);
          if (accion === 'entrega') await p.locator('[data-vgive="0"]').click();
          else if (accion === 'texto') await p.locator('[data-vtxt="0"]').fill('Edición desde el panel antiguo');
          else if (accion === 'precio') {
            await p.locator('[data-vp="0"]').fill('60');
            await p.locator('[data-vp="0"]').press('Tab');
          } else {
            // Un único clic físico: no se reintenta sobre el control nuevo que reemplaza al antiguo.
            const caja = await p.locator('[data-von="0"]').boundingBox();
            if (!caja) throw new Error('No se ve la casilla del vale');
            await p.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
          }
          const despues = await p.evaluate(() => ({
            datos: [JSON.stringify([S.vales, S.valesLog]), localStorage.getItem(KEY)],
            texto: document.querySelector('[data-vtxt="0"]').value,
          }));
          await otra.close();
          const intacto = antes.every((v, i) => v === despues.datos[i]);
          return {
            fail: !intacto || despues.texto !== 'Vale nuevo',
            intacto,
            textoVisible: despues.texto,
            valesAntes: JSON.parse(antes[0]),
            valesDespues: JSON.parse(despues.datos[0]),
            camposGuardadosDistintos: Object.keys(JSON.parse(antes[1])).filter(
              (k) => JSON.stringify(JSON.parse(antes[1])[k]) !== JSON.stringify(JSON.parse(despues.datos[1])[k]),
            ),
          };
        },
      );

    for (const idioma of ['es', 'ro'])
      await test(
        'vales-accesibles-' + idioma,
        'Los controles de cada vale tienen nombre accesible traducido y conservan el texto de la familia (' +
          idioma +
          ')',
        async (p) => {
          const nombre = 'Un cuento "especial" <de Tito>';
          await p.evaluate((txt) => {
            S.vales = [{ id: 'vale-accesible', txt, p: 20, on: 1 }];
            S.valesLog = [{ id: 'vale-accesible', txt, d: '2026-10-24' }];
            save();
            openAdult('premios');
          }, nombre);
          const nombres =
            idioma === 'ro'
              ? ['Activează tichetul: ', 'Textul tichetului: ', 'Prețul tichetului în monede: ', 'Marchează ca dat: ']
              : ['Activar el vale: ', 'Texto del vale: ', 'Precio del vale en monedas: ', 'Marcar como entregado: '];
          const roles = ['checkbox', 'textbox', 'spinbutton', 'button'];
          for (let i = 0; i < roles.length; i++)
            await p.getByRole(roles[i], { name: nombres[i] + nombre, exact: true }).waitFor();
          await p.getByRole('checkbox', { name: nombres[0] + nombre, exact: true }).uncheck();
          await p.getByRole('textbox', { name: nombres[1] + nombre, exact: true }).fill('Texto nuevo de la familia');
          const precio = p.getByRole('spinbutton', { name: nombres[2] + nombre, exact: true });
          await precio.fill('40');
          await precio.press('Tab');
          await p.getByRole('button', { name: nombres[3] + nombre, exact: true }).click();
          const datos = await p.evaluate(() => ({ vale: S.vales[0], entregado: S.valesLog[0].given }));
          return {
            fail:
              datos.vale.on !== 0 ||
              datos.vale.txt !== 'Texto nuevo de la familia' ||
              datos.vale.p !== 40 ||
              datos.entregado !== 1,
            nombresEncontrados: roles.length,
            datos,
          };
        },
        { guardado: { ...base, idioma } },
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
      'candado-2fps',
      'El candado exige tres segundos continuos también a dos FPS',
      async (p) => {
        await p.evaluate(() => __cl.go('casaTito', {}));
        await p.waitForFunction(() => VIVO.fade === 0);
        const [x, y] = await p.evaluate(() => [OX + 1546 * SC, OY + 852 * SC]);
        await p.mouse.move(x, y);
        await p.mouse.down();
        await p.waitForTimeout(1200);
        await p.mouse.up();
        await p.mouse.down();
        await p.waitForTimeout(1800);
        const antes = await p.evaluate(() => document.getElementById('adult').hidden);
        await p.waitForFunction(() => !document.getElementById('adult').hidden, null, { timeout: 2700 });
        await p.mouse.up();
        return { fail: !antes, cerradoAntesDeTresSegundos: antes };
      },
      {
        antes: () => {
          window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 500);
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
    await test('vale-fecha-incompleta', 'Premios muestra y permite entregar vales importados sin fecha', async (p) => {
      await p.evaluate(() => {
        S.valesLog = [
          { id: 'sin-fecha', txt: 'Un abrazo', given: 0 },
          { id: 'fecha-rota', txt: 'Un cuento', given: 0, d: '2026-<b id="fecha-inyectada">texto</b>' },
        ];
        save();
        openAdult('premios');
      });
      const botones = await p.locator('[data-vgive]').count();
      const inyectado = await p.locator('#fecha-inyectada').count();
      await p.locator('[data-vgive="0"]').click();
      const entregado = await p.evaluate(() => S.valesLog[0].given === 1);
      return { fail: botones !== 2 || inyectado !== 0 || !entregado, botones, inyectado, entregado };
    });

    await test('vale-editado', 'Editar el texto de un vale invalida su confirmación anterior', async (p) => {
      await prepareVoucher(p);
      await p.evaluate(() => {
        S.vales[0].txt = 'Otra recompensa';
        save();
      });
      await L.clic(p, 680, 690);
      return p.evaluate(() => ({
        fail: S.coins !== 100 || S.valesLog.length !== 0,
        coins: S.coins,
        purchases: S.valesLog,
      }));
    });
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
    // Un filtro equivocado no puede dar verde sin haber ejecutado ninguna comprobación.
    if (!report.results.length)
      report.results.push({
        id: 'sin-casos',
        title: 'El filtro debe seleccionar al menos un caso',
        status: 'ERROR_HARNESS',
        error: 'Ningún caso coincide con el filtro: ' + filter,
        ms: 0,
      });
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
