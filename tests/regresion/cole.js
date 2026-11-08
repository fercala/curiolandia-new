// Comprueba el cole y su patio (fase P1 de docs/IDEAS-MEJORA.md) con el ratón de verdad: desde el mapa (3D) se llega al
// cole tocando su sitio (Tito anda hasta él y entra); del cole al patio; lo que está en obras (el autobús) no lleva a ninguna parte y Tito lo dice;
// del patio a «¡Estatuas!», que se juega sola hasta el final (Tito baila, para la música, estatua... en todas las rondas)
// y da 3 monedas y apunta la actividad en S.cole; y la casa vuelve de cada escena a la de antes (estatuas -> patio ->
// cole -> mapa).
// Uso: node tests/regresion/cole.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('cole');
(async () => {
  const srv = L.servir(raiz),
    b = await L.navegador();
  const p = await L.abrir(b, srv.port, { rapido: true });
  await p.evaluate(() => {
    const S = __cl.S;
    S.intro = true;
    S.age = 3;
    S.first.askedName = 1;
    save();
  });
  const escena = () => p.evaluate(() => __cl.name);
  // caso(id, titulo, fn): ejecuta fn; fn devuelve un texto si algo falla.
  const caso = async (id, titulo, fn) => {
    try {
      const prob = await fn();
      if (prob) {
        R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) });
        await R.captura(p, id + '.png');
      } else R.bien(id, titulo);
    } catch (e) {
      R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]);
    }
  };
  try {
    await caso('P1', 'el sitio del cole del mapa lleva al cole', async () => {
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2500);
      const z = await p.evaluate(() => mzOf('cole'));
      await L.clic(p, z.x, z.y);
      // en 3D, Tito anda primero hasta el sitio y luego se entra
      let e = 'map';
      for (let i = 0; i < 20 && e === 'map'; i++) {
        await p.waitForTimeout(500);
        e = await escena();
      }
      return e === 'cole' ? null : 'escena ' + e;
    });
    await caso('P2', 'el autobús está en obras y el patio lleva al patio', async () => {
      if ((await escena()) !== 'cole') await p.evaluate(() => __cl.go('cole', {}));
      await p.waitForTimeout(1200);
      const [bus, patio] = await p.evaluate(() => [COLE_SITIOS[2], COLE_SITIOS[0]]);
      await L.clic(p, bus.x, bus.y);
      await p.waitForTimeout(600);
      if ((await escena()) !== 'cole') return 'el autobús en obras ha cambiado de escena';
      await L.clic(p, patio.x, patio.y);
      await p.waitForTimeout(1200);
      const e = await escena();
      return e === 'patio' ? null : 'escena ' + e;
    });
    await caso('P3', '«¡Estatuas!» se juega hasta el final, da 3 monedas y apunta la actividad', async () => {
      if ((await escena()) !== 'patio') await p.evaluate(() => __cl.go('patio', {}));
      await p.waitForTimeout(1200);
      const antes = await p.evaluate(() => __cl.S.coins || 0);
      const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'estatuas'));
      await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
      await p.waitForTimeout(800);
      if ((await escena()) !== 'estatuas') return 'no se ha abierto el juego';
      // 4 rondas (3 años) de hasta 7 s de baile y 2,5 s de estatua, más lo que se tarda en hablar: menos de 90 s
      let cole = null;
      for (let i = 0; i < 120 && !cole; i++) {
        await p.waitForTimeout(1000);
        cole = await p.evaluate(() => __cl.S.cole || null);
      }
      if (!cole) return 'el juego no ha terminado en 2 minutos';
      await p.waitForTimeout(2500);
      const despues = await p.evaluate(() => __cl.S.coins || 0);
      if (despues - antes !== 3) return `monedas ${antes} -> ${despues}`;
      if (!(cole.veces && cole.veces.estatuas === 1 && cole.hechas.includes('estatuas')))
        return 'S.cole ' + JSON.stringify(cole);
      return null;
    });
    await caso('P4', 'la casa vuelve: estatuas -> patio -> cole -> mapa', async () => {
      const visto = [];
      for (let i = 0; i < 3; i++) {
        await L.clic(p, 85, 82); // el botón de la casa (HOME)
        await p.waitForTimeout(1200);
        visto.push(await escena());
      }
      return visto.join(',') === 'patio,cole,map' ? null : visto.join(' -> ');
    });
    if (p.errs.length) R.apuntar('P0', 'alta', 'errores de JavaScript', p.errs.slice(0, 3));
    else R.bien('P0', 'sin errores de JavaScript');
  } finally {
    R.guardar();
    await b.close();
    srv.close();
  }
})();
