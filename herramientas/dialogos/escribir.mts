// Rehace dialogos/todos.csv con el catálogo de frases que sale del código (catalogo.mts) y, desde la fase ID4 de
// docs/PLAN-IDIOMAS.md, la hoja de revisión del rumano, dialogos/ro.csv (hojaIdioma). Desde la ID9a, también la lista
// de lo que se acepta sin traducir, dialogos/ro-sin-traducir.txt: quita lo que ya está traducido y avisa de los textos
// nuevos sin rumano (la prueba tests/unidad/dialogos.test.ts falla hasta que se traducen o, si no son castellano, se
// apuntan a mano en esa lista). Uso: npm run dialogos
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogo, csv, csvIdioma, hojaIdioma, leerSinTraducir, sinTraducirTexto } from './catalogo.mts';
import { TEXTOS_RO } from '../../src/idiomas/ro/textos.ts';
import { NOMBRES_RO } from '../../src/idiomas/ro/nombres.ts';

const raiz = join(import.meta.dirname, '..', '..');
const frases = catalogo(raiz);
writeFileSync(join(raiz, 'dialogos', 'todos.csv'), csv(frases));
console.log(`dialogos/todos.csv: ${frases.length} frases`);
const hoja = hojaIdioma(frases, TEXTOS_RO, NOMBRES_RO);
writeFileSync(join(raiz, 'dialogos', 'ro.csv'), csvIdioma(hoja, 'rumano'));
console.log(`dialogos/ro.csv: ${hoja.filter((f) => f.estado === 'borrador').length} de ${hoja.length} traducidos`);
const rutaSin = join(raiz, 'dialogos', 'ro-sin-traducir.txt'),
  aceptados = leerSinTraducir(readFileSync(rutaSin, 'utf8')),
  faltan = hoja.filter((f) => f.estado === 'falta');
writeFileSync(rutaSin, sinTraducirTexto(faltan.filter((f) => aceptados.has(f.id))));
const nuevos = faltan.filter((f) => !aceptados.has(f.id));
if (nuevos.length) {
  console.log(`\nOjo: ${nuevos.length} textos nuevos sin rumano. Tradúcelos en src/idiomas/ro/ o, si no son castellano`);
  console.log('(inglés, código), apunta su línea en dialogos/ro-sin-traducir.txt:');
  console.log(sinTraducirTexto(nuevos));
}
