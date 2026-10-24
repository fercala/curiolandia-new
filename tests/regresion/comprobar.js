// Para la integración continua: lee los resultados de las pruebas de regresión (tests/regresion/salida/<prueba>.json)
// y termina con código 1 si alguna tiene hallazgos o no dejó resultado. Las pruebas terminan siempre con 0 (están
// pensadas para apuntar hallazgos, no para parar), así que el workflow las ejecuta y luego pasa por aquí.
// Uso: node tests/regresion/comprobar.js informe-b voces casa juegos-0
const fs = require('fs'), path = require('path');
const SAL = path.join(__dirname, 'salida');
let mal = 0;
for (const nombre of process.argv.slice(2)) {
  const f = path.join(SAL, nombre + '.json');
  if (!fs.existsSync(f)) { console.log(`✗ ${nombre}: no dejó resultado (${f})`); mal++; continue }
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const h of r.hallazgos) console.log(`✗ ${nombre}: ${h.id} ${h.titulo}`);
  console.log(`${r.hallazgos.length ? '✗' : '✓'} ${nombre}: ${r.bien.length} bien, ${r.hallazgos.length} hallazgos`);
  if (r.hallazgos.length) mal++;
}
process.exit(mal ? 1 : 0);
