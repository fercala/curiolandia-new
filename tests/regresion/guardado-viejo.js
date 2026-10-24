// Comprueba la clave de guardado propia (curiolandia-new.v1) y la copia única de la partida de curiolandia-3d
// (curiolandia.v1), que comparte localStorage porque las dos webs están en fercala.github.io:
//   G1 solo hay partida vieja: se copia (nombre, edad, temas) y la vieja queda igual;
//   G2 hay partida propia y vieja: manda la propia;
//   G3 después de "Borrar todo" y recargar, la vieja no vuelve;
//   G4 la partida vieja con la Voz de Fer pasa a voz del navegador (esta versión no tiene voces grabadas);
//   G5 una partida vieja rota no impide jugar (queda una partida nueva).
// Uso: node tests/regresion/guardado-viejo.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('guardado-viejo');
const VIEJA = { age: 4, name: 'Lucía', variant: 'es', voz: 'fer', intro: true, coins: 37, temas: { '4A-T1': { done: true, g: { 0: 1, 1: 1 } } } };

// poner(vieja, propia): script que escribe las partidas antes de que cargue el juego, solo la primera vez en la
// pestaña (sessionStorage), para que recargar no las vuelva a poner. Un texto se escribe tal cual (partida rota).
// Va como texto (no como función) porque addInitScript no lleva consigo las variables de fuera.
const poner = (vieja, propia) => `(([v, n]) => { if (sessionStorage.getItem('__gv')) return; sessionStorage.setItem('__gv', '1');
    if (v != null) localStorage.setItem('curiolandia.v1', typeof v === 'string' ? v : JSON.stringify(v));
    if (n != null) localStorage.setItem('curiolandia-new.v1', JSON.stringify(n)) })(${JSON.stringify([vieja, propia])})`;

(async () => {
  const srv = L.servir(raiz), b = await L.navegador();
  // caso(id, titulo, partidas, fn): abre el juego con esas partidas y pasa la página a fn, que devuelve el problema
  // encontrado (o nada si todo va bien).
  const caso = async (id, titulo, partidas, fn) => {
    let p;
    try {
      p = await L.abrir(b, srv.port, { antes: partidas });
      const prob = await fn(p);
      if (prob) { R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) }); await R.captura(p, id + '.png') }
      else if (p.errs.length) R.apuntar(id, 'alta', titulo + ' (errores de JavaScript)', p.errs.slice(0, 3));
      else R.bien(id, titulo);
    } catch (e) { R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]) }
    finally { p && await p.context().close() }
  };
  const leer = p => p.evaluate(() => ({ S: { name: __cl.S.name, age: __cl.S.age, coins: __cl.S.coins, voz: __cl.S.voz, temas: Object.keys(__cl.S.temas) },
    propia: localStorage.getItem('curiolandia-new.v1'), vieja: localStorage.getItem('curiolandia.v1'), copiada: localStorage.getItem('curiolandia-new.copiada') }));

  await caso('G1', 'La partida de curiolandia-3d se copia y la vieja no cambia', poner(VIEJA, null), async p => {
    const e = await leer(p);
    if (e.S.name !== 'Lucía' || e.S.age !== 4 || e.S.coins !== 37 || !e.S.temas.includes('4A-T1')) return { copiado: e.S };
    if (e.vieja !== JSON.stringify(VIEJA)) return 'la partida vieja ha cambiado';
    await p.evaluate(() => save());
    const g = JSON.parse(await p.evaluate(() => localStorage.getItem('curiolandia-new.v1')) || 'null');
    if (!g || g.name !== 'Lucía') return 'save() no escribe en la clave nueva';
  });
  await caso('G2', 'Con partida propia, manda la propia', poner(VIEJA, { age: 5, name: 'Pablo', intro: true, temas: {} }), async p => {
    const e = await leer(p);
    if (e.S.name !== 'Pablo' || e.S.age !== 5) return { cargado: e.S };
  });
  await caso('G3', 'Después de Borrar todo, la partida vieja no vuelve', poner(VIEJA, null), async p => {
    await p.evaluate(() => doReset());
    await p.waitForTimeout(500);
    await p.reload(); await p.waitForTimeout(2000);
    const e = await leer(p);
    if (e.S.name === 'Lucía' || e.S.coins === 37) return { cargado: e.S };
    if (e.copiada !== '1') return 'no queda la marca de copia';
  });
  await caso('G4', 'La Voz de Fer de la partida vieja pasa a voz del navegador', poner(VIEJA, null), async p => {
    const e = await leer(p);
    if (e.S.voz !== 'nav') return { voz: e.S.voz };
    const pide = await p.evaluate(() => performance.getEntriesByType('resource').filter(r => /voz(-fer)?\//.test(r.name)).map(r => r.name));
    if (pide.length) return { pide };
  });
  await caso('G5', 'Una partida vieja rota no impide jugar', poner('{esto no es json', null), async p => {
    const e = await leer(p);
    if (e.S.name || e.S.temas.length) return { cargado: e.S };
    await p.evaluate(() => __cl.go('map'));
    await p.waitForTimeout(800);
    if (await p.evaluate(() => __cl.name) !== 'map') return 'no llega al mapa';
  });

  const n = R.guardar(); await b.close(); srv.close();
  console.log(n ? `${n} hallazgos` : 'TODO BIEN'); process.exit(n ? 1 : 0);
})();
