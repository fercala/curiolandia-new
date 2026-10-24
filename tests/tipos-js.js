// Revisa los tipos del código JavaScript del juego (tsconfig.js.json: src/*.js con los tipos de src/tipos/) y cuenta
// los avisos de TypeScript. Todavía hay muchos (el código es global y sin tipos): falla solo si hay MÁS que el límite
// de tests/tipos-js-limite.txt, para que ningún cambio añada avisos nuevos. Si hay menos, pide bajar el límite.
// Uso: node tests/tipos-js.js            (npm run tipos:js)
//      node tests/tipos-js.js --lista    (además muestra todos los avisos)
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const LIMITE = path.join(__dirname, 'tipos-js-limite.txt');

const tsc = path.join(RAIZ, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const r = spawnSync(tsc, ['-p', 'tsconfig.js.json'], { cwd: RAIZ, encoding: 'utf8', shell: process.platform === 'win32' });
const avisos = (r.stdout + r.stderr).split('\n').filter(l => / error TS\d+/.test(l));
if (process.argv.includes('--lista')) avisos.forEach(l => console.log(l));
const limite = +fs.readFileSync(LIMITE, 'utf8').trim();
// Resumen por código de aviso: así se ve de un vistazo qué tipo de problema domina.
const porCodigo = avisos.reduce((m, l) => { const c = l.match(/error (TS\d+)/)[1]; m[c] = (m[c] || 0) + 1; return m }, {});
console.log(Object.entries(porCodigo).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`).join(', '));
if (avisos.length > limite) {
  console.log(`✗ ${avisos.length} avisos de tipos en src/*.js, más que el límite (${limite}). Mira los nuevos con: node tests/tipos-js.js --lista`);
  process.exit(1);
}
console.log(avisos.length < limite
  ? `✓ ${avisos.length} avisos (límite ${limite}). Han bajado: pon ${avisos.length} en tests/tipos-js-limite.txt.`
  : `✓ ${avisos.length} avisos, igual que el límite.`);
