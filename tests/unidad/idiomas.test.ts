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
  // desde la fase ID6c (el pueblo de la Isla de las Letras), no queda ninguna frase compuesta en todo el juego: solo
  // los trucos de gramática castellana que tienen al lado su versión rumana
  expect(todos.filter((s) => s.tipo === 'compuesta').map((s) => s.archivo + ':' + s.linea)).toEqual([]);
  // desde la fase ID2e, las de los temas de 5 años son plantillas de fmt
  expect(todos.some((s) => s.archivo === join('src', 'temas', 'temas5.ts'))).toBe(false);
  // desde la fase ID2f, fuera de la Isla de las Letras (letras.ts y lectura.ts) ya no queda ninguna
  const fueraDeLetras = (s: { archivo: string }) =>
    s.archivo !== join('src', 'temas', 'letras.ts') && s.archivo !== join('src', 'juegos', 'lectura.ts');
  expect(todos.filter(fueraDeLetras).map((s) => s.archivo + ':' + s.linea)).toEqual([]);
  // desde la fase ID2b, las de la tienda son plantillas de fmt
  expect(hay(join('src', 'escenas', 'tienda.ts'), 'compuesta', "'Tienes ' + S.coins")).toBe(false);
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
