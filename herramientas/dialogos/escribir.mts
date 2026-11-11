// Rehace dialogos/todos.csv con el catálogo de frases que sale del código (catalogo.mts) y, desde la fase ID4 de
// docs/PLAN-IDIOMAS.md, la hoja de revisión del rumano, dialogos/ro.csv (hojaIdioma). Uso: npm run dialogos
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogo, csv, csvIdioma, hojaIdioma } from './catalogo.mts';
import { TEXTOS_RO } from '../../src/idiomas/ro/textos.ts';
import { NOMBRES_RO } from '../../src/idiomas/ro/nombres.ts';

const raiz = join(import.meta.dirname, '..', '..');
const frases = catalogo(raiz);
writeFileSync(join(raiz, 'dialogos', 'todos.csv'), csv(frases));
console.log(`dialogos/todos.csv: ${frases.length} frases`);
const hoja = hojaIdioma(frases, TEXTOS_RO, NOMBRES_RO);
writeFileSync(join(raiz, 'dialogos', 'ro.csv'), csvIdioma(hoja, 'rumano'));
console.log(`dialogos/ro.csv: ${hoja.filter((f) => f.estado === 'borrador').length} de ${hoja.length} traducidos`);
