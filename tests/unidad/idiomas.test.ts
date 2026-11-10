// La lista de trabajo para traducir el juego (fase ID0 de docs/PLAN-IDIOMAS.md): herramientas/idiomas/compuestas.mts
// encuentra las frases que se componen pegando trozos y los trucos de gramática castellana (npm run idiomas:compuestas).
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { sitios } from '../../herramientas/idiomas/compuestas.mts';

const RAIZ = join(import.meta.dirname, '..', '..');

test('encuentra las frases compuestas y los trucos de gramática conocidos', () => {
  const todos = sitios(RAIZ);
  const hay = (archivo: string, tipo: string, trozo: string): boolean =>
    todos.some((s) => s.archivo === archivo && s.tipo === tipo && s.codigo.includes(trozo));
  // 'Tienes ' + S.coins + ' monedas.': una frase compuesta (una sola, aunque tenga dos +)
  expect(hay(join('src', 'escenas', 'tienda.ts'), 'compuesta', "'Tienes ' + S.coins")).toBe(true);
  expect(todos.filter((s) => s.codigo.startsWith("' monedas.'")).length).toBe(0);
  // .replace(/ de el /, ' del ') y fem(k): trucos de gramática
  expect(hay(join('src', 'escenas', 'cofre.ts'), 'truco', '/ de el /')).toBe(true);
  expect(hay(join('src', 'juegos', 'comps.ts'), 'truco', 'fem(')).toBe(true);
});

test('deja fuera el inglés, el CSS y los mensajes de error', () => {
  const todos = sitios(RAIZ);
  expect(todos.some((s) => s.codigo.startsWith("'@"))).toBe(false);
  expect(todos.some((s) => s.codigo.includes('url('))).toBe(false);
  expect(todos.some((s) => s.archivo === join('src', 'modulos.ts'))).toBe(false);
});
