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
  // .replace(/^(el|la|los|las) /, ''): un truco de gramática (en la Isla de las Letras, que tendrá su versión rumana)
  expect(hay(join('src', 'juegos', 'lectura.ts'), 'truco', '/^(el|la|los|las) /')).toBe(true);
  // desde la fase ID2a, el «de el» → «del» del cofre es una plantilla con el nombre en su forma «de»
  expect(todos.some((s) => s.codigo.includes('/ de el /'))).toBe(false);
});

test('deja fuera el inglés, el CSS y los mensajes de error', () => {
  const todos = sitios(RAIZ);
  expect(todos.some((s) => s.codigo.startsWith("'@"))).toBe(false);
  expect(todos.some((s) => s.codigo.includes('url('))).toBe(false);
  expect(todos.some((s) => s.archivo === join('src', 'modulos.ts'))).toBe(false);
});
