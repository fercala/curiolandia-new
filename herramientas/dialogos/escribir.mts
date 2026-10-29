// Rehace dialogos/todos.csv con el catálogo de frases que sale del código (catalogo.mts). Uso: npm run dialogos
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogo, csv } from './catalogo.mts';

const raiz = join(import.meta.dirname, '..', '..');
const frases = catalogo(raiz);
writeFileSync(join(raiz, 'dialogos', 'todos.csv'), csv(frases));
console.log(`dialogos/todos.csv: ${frases.length} frases`);
