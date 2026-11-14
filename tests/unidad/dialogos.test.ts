// El catálogo de frases (dialogos/todos.csv) tiene que estar al día con el código: lo saca de src/
// herramientas/dialogos/catalogo.mts (fase 5g de docs/PLAN-MIGRACION.md). Si falla, rehazlo con `npm run dialogos`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { catalogo, csv, csvIdioma, hojaIdioma } from '../../herramientas/dialogos/catalogo.mts';
import { TEXTOS_RO } from '../../src/idiomas/ro/textos.ts';
import { NOMBRES_RO } from '../../src/idiomas/ro/nombres.ts';

const RAIZ = join(import.meta.dirname, '..', '..');
// Por debajo de este número de frases, el catálogo ha dejado de encontrar textos (hoy hay unas 2500).
const MIN_FRASES = 2000;

test('dialogos/todos.csv está al día con el código (si no: npm run dialogos)', () => {
  const frases = catalogo(RAIZ);
  expect(frases.length).toBeGreaterThan(MIN_FRASES);
  expect(readFileSync(join(RAIZ, 'dialogos', 'todos.csv'), 'utf8')).toBe(csv(frases));
});

test('dialogos/ro.csv, la hoja de revisión del rumano, está al día con el catálogo y las tablas (fase ID4)', () => {
  const hoja = hojaIdioma(catalogo(RAIZ), TEXTOS_RO, NOMBRES_RO);
  expect(readFileSync(join(RAIZ, 'dialogos', 'ro.csv'), 'utf8')).toBe(csvIdioma(hoja, 'rumano'));
  expect(hoja.find((f) => f.texto === 'Zona de adultos')?.traduccion).toBe('Zona adulților');
});

test('cada id es único y los textos conocidos están (frase, trozo, nombre)', () => {
  const frases = catalogo(RAIZ);
  expect(new Set(frases.map((f) => f.id)).size).toBe(frases.length);
  const tipo = (t: string): string | undefined => frases.find((f) => f.texto === t)?.tipo;
  expect(tipo('¿Cómo te llamas?')).toBe('frase');
  expect(tipo('Gira el móvil')).toBe('trozo');
  expect(tipo('el gato')).toBe('nombre');
  // las claves de dibujo no son textos
  expect(tipo('hojaNaranja')).toBeUndefined();
  expect(tipo('nene')).toBeUndefined();
});

test('la zona de adultos y las ventanas de head.html también salen, con el tipo adultos (fase ID0)', () => {
  const frases = catalogo(RAIZ);
  const tipo = (t: string): string | undefined => frases.find((f) => f.texto === t)?.tipo;
  expect(tipo('Zona de adultos')).toBe('adultos');
  expect(tipo('¿Empezar de nuevo?')).toBe('adultos');
  expect(tipo('Copia de seguridad')).toBe('adultos');
  // del HTML solo salen los textos: ni etiquetas, ni selectores, ni entidades
  expect(frases.some((f) => f.tipo === 'adultos' && /<\/?[a-z]|^#[a-z]|^&\w+;$/u.test(f.texto))).toBe(false);
});
