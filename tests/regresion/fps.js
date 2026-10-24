// Mide los fotogramas por segundo de las escenas principales (para docs/LINEA-BASE.md): en cada escena espera 1,5 s y
// cuenta los requestAnimationFrame durante 4 s. Partida de 3 años con la introducción vista.
// Uso: node tests/regresion/fps.js <carpeta web>
// Mide solo si no hay otras pruebas en marcha: varias a la vez bajan los FPS de todas.
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const ESCENAS = [['map'], ['casita', { t: '3A-T1' }], ['intro', {}], ['juego', { t: '3A-T1', g: 0 }]];

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  const p = await L.abrir(b, srv.port, { hora: 11, fecha: '2026-10-21' });
  await p.evaluate(() => { const S = __cl.S; S.intro = true; S.age = 3; S.first.askedName = 1 });
  for (const [n, o] of ESCENAS) {
    await p.evaluate(([n, o]) => __cl.go(n, o || {}), [n, o]); await p.waitForTimeout(1500);
    const fps = await p.evaluate(() => new Promise(r => { let k = 0; const t0 = performance.now();
      const paso = () => { k++; if (performance.now() - t0 < 4000) requestAnimationFrame(paso); else r(k / ((performance.now() - t0) / 1000)) };
      requestAnimationFrame(paso) }));
    console.log(n + (o && o.t ? ' ' + o.t : ''), fps.toFixed(1), 'FPS');
  }
  await b.close(); srv.close(); process.exit(0);
})();
