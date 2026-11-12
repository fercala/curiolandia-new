// Prueba de humo de Curiolandia 3D.
// Abre el juego en un Chromium sin ventana, pasa por las escenas principales de día y de noche,
// guarda una captura de cada una en tests/capturas/ y avisa de cualquier error de JavaScript.
//
// Uso (desde la raíz del repo, después de montar la web; ver docs/COMO-AGREGAR.md):
//   node tests/humo.js            -> prueba la web de la raíz (index.html)
//   node tests/humo.js src/web    -> prueba otra carpeta con un index.html montado
// Necesita Playwright con Chromium: `npm install -g playwright && npx playwright install chromium`.
// Termina con código 0 si no hubo errores y 1 si los hubo.
const path = require('path'),
  fs = require('fs'),
  http = require('http');
let pw;
try {
  pw = require('playwright');
} catch (e) {
  pw = require('/opt/node22/lib/node_modules/playwright');
}

const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });

// Servidor web mínimo: el juego necesita servirse por http (no vale abrir el archivo con file://).
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};
const srv = http
  .createServer((q, r) => {
    let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
    if (f.endsWith(path.sep) || f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => {
      if (e) {
        r.writeHead(404);
        r.end();
        return;
      }
      r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
      r.end(d);
    });
  })
  .listen(0);

// Escenas que se visitan: [nombre de la escena, opciones que recibe go()].
const ESCENAS = [
  ['title'],
  ['map'],
  ['jardin'],
  ['bosque'],
  ['montana'],
  ['fiestas'],
  ['casita', { t: '3A-T1' }],
  ['cofre', { t: '3A-T1' }],
  ['tienda'],
  ['casaTito'],
  ['album'],
  ['isla'],
  ['playaSonidos'],
  ['casita', { t: 'L3-A' }],
  ['libroLetras'], // la Isla de las Letras (fase L2) y el libro de letras (L7)
  ['bosqueLetras'],
  ['puebloPalabras'],
  ['casita', { t: 'L5-FAB' }], // el bosque y el pueblo (fases L4 y L5)
  ['islaIngles'],
  ['playaHello'],
  ['casita', { t: 'EN-HELLO' }],
  ['casita', { t: 'EN-BEACH' }],
  ['parqueLondres'],
  ['casita', { t: 'EN-CLOTHES' }],
  ['puebloCuentos'],
  ['casita', { t: 'EN-STORIES' }],
  ['diccionario'], // la Isla del Inglés (fases I2 a I5 de docs/PLAN-INGLES.md) y su diccionario (I7)
  ['cole'],
  ['patio'],
  ['estatuas'], // el cole, su patio y «¡Estatuas!» (fase P1 de docs/IDEAS-MEJORA.md)
  ['titoDice'], // «Tito dice» (fase P2)
  ['yoga'], // el yoga de los animales (fase P3)
  ['yoga', { pausa: true }], // y la pausa activa
  ['autobus'], // el autobús de las excursiones (fase P5)
  ['excursion', { exc: 'granja' }], // la granja escuela
  ['granjaComer', { exc: 'granja' }],
  ['granjaHuevos', { exc: 'granja' }],
  ['granjaQueso', { exc: 'granja' }],
  ['granjaCepillar', { exc: 'granja' }],
  ['granjaHuerto', { exc: 'granja' }],
  ['granjaTractor', { exc: 'granja' }],
  ['albumExcursiones', {}], // el álbum de excursiones (P7)
  ['granjaNace', { exc: 'granja' }], // el nacimiento de una cría (P9)
  ['granjaFamilias', { exc: 'granja' }],
  ['carreras'], // las carreras del patio, en 3D (P10)
  ['deporte', {}], // el día del deporte y sus pruebas (P11)
  ['deporteSalto', { deporte: true }],
  ['deportePunteria', { deporte: true }],
  ['deporteEquilibrio', { deporte: true }],
  ['deporteRelevos', { deporte: true }],
  ['juegosCortos', {}], // los juegos cortos del patio (P12)
  ['rayuela', {}],
  ['columpios', {}],
  ['penaltis', {}], // P12b
  ['pompas', {}],
  ['cometa', {}],
  ['panuelo', {}],
  ['sillas', {}],
];

(async () => {
  const port = srv.address().port;
  const b = await pw.chromium.launch({
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  let fallos = 0;
  for (const hora of [11, 22]) {
    // de día y de noche (a partir de las 20 h el mundo usa la paleta nocturna)
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    p.on('console', (m) => {
      if (m.type() === 'error' && !/404|ERR_/.test(m.text())) errs.push(m.text());
    });
    // Fija la hora del reloj y activa el modo rápido de pruebas (__fast: la voz no espera al audio; __said guarda lo que dice Tito).
    await p.addInitScript((h) => {
      Date.prototype.getHours = function () {
        return h;
      };
      window.__fast = 1;
      window.__said = [];
    }, hora);
    await p.goto(`http://localhost:${port}/index.html`);
    await p.waitForTimeout(2500);
    const tiene3D = await p.evaluate(() => !!(window.__w3 && window.__w3.ok));
    // Partida de prueba: 5 años, introducción vista y todo abierto (modo libre), para poder entrar en todas las zonas.
    await p.evaluate(() => {
      const S = __cl.S;
      S.age = 5;
      S.intro = 1;
      S.unlockAll = true;
    });
    for (const [n, o] of ESCENAS) {
      await p.evaluate(([n, o]) => __cl.go(n, o || {}), [n, o]);
      await p.waitForTimeout(1500);
      const ahora = await p.evaluate(() => __cl.name);
      await p.screenshot({ path: path.join(OUT, `${hora}h-${n}.png`) });
      if (ahora !== n) console.log(`  aviso: al ir a "${n}" la escena actual es "${ahora}"`);
    }
    console.log(
      `${hora} h: 3D ${tiene3D ? 'sí' : 'NO'}, errores ${errs.length}${errs.length ? '\n  ' + errs.slice(0, 5).join('\n  ') : ''}`,
    );
    if (errs.length || !tiene3D) fallos++;
    await p.close();
  }
  await b.close();
  srv.close();
  console.log(fallos ? 'HAY ERRORES' : 'TODO BIEN', '- capturas en', OUT);
  process.exit(fallos ? 1 : 0);
})();
