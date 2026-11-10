// Las reglas de los idiomas (dominio/idiomas.ts, fase ID1 de docs/PLAN-IDIOMAS.md): con qué idioma se juega, cuáles se
// ofrecen, las plantillas y el pseudoidioma de prueba.
import { describe, expect, test } from 'vitest';
import {
  IDIOMAS,
  esIdioma,
  idioma,
  idiomaActivo,
  idiomaDelNavegador,
  idiomasElegibles,
  formasEs,
  femenino,
  pseudo,
  rellena,
} from '../../src/dominio/idiomas.ts';

describe('idiomas', () => {
  test('hay castellano (completo), rumano y el pseudoidioma', () => {
    expect(IDIOMAS.map((i) => i.id)).toEqual(['es', 'ro', 'xx']);
    expect(idioma('es').completo).toBe(true);
    expect(idioma('ro').lang).toBe('ro-RO');
    expect(esIdioma('ro')).toBe(true);
    expect(esIdioma('fr')).toBe(false);
  });

  test('la primera vez, el idioma del navegador si está completo; si no, el castellano', () => {
    expect(idiomaDelNavegador(['es-ES'])).toBe('es');
    // el rumano aún no está completo (hasta la fase ID9)
    expect(idiomaDelNavegador(['ro-RO', 'en-GB'])).toBe('es');
    expect(idiomaDelNavegador(['en-GB', 'es_AR'])).toBe('es');
    expect(idiomaDelNavegador([])).toBe('es');
  });

  test('manda la dirección, luego lo guardado y luego el navegador', () => {
    expect(idiomaActivo('es', 'ro', ['es-ES'])).toBe('ro');
    expect(idiomaActivo('es', 'xx', [])).toBe('xx');
    expect(idiomaActivo('ro', null, ['es-ES'])).toBe('ro');
    expect(idiomaActivo('ro', 'fr', ['es-ES'])).toBe('ro');
    expect(idiomaActivo(undefined, null, ['ro-RO'])).toBe('es');
    // el pseudoidioma no vale como guardado
    expect(idiomaActivo('xx', null, [])).toBe('es');
  });

  test('se ofrecen los completos y el que se usa, nunca el pseudoidioma', () => {
    expect(idiomasElegibles('es').map((i) => i.id)).toEqual(['es']);
    expect(idiomasElegibles('ro').map((i) => i.id)).toEqual(['es', 'ro']);
    expect(idiomasElegibles('xx').map((i) => i.id)).toEqual(['es']);
  });

  test('rellena los huecos de una plantilla y deja a la vista los que faltan', () => {
    expect(rellena('Tienes {n} monedas, {nombre}.', { n: 3, nombre: 'Ana' })).toBe('Tienes 3 monedas, Ana.');
    expect(rellena('Busca {cosa}.', {})).toBe('Busca {cosa}.');
    // {Cosa}: el hueco cosa con mayúscula, para empezar la frase
    expect(rellena('{Cosa} es para {sala}.', { cosa: 'el gorro', sala: 'la cocina' })).toBe(
      'El gorro es para la cocina.',
    );
  });

  test('las formas de un nombre en castellano salen de su artículo, como antes', () => {
    expect(formasEs('el gato')).toEqual({
      art: 'el gato',
      sin: 'gato',
      g: 'm',
      pl: false,
      de: 'del gato',
      a: 'al gato',
    });
    expect(formasEs('las uvas')).toMatchObject({ sin: 'uvas', g: 'f', pl: true, de: 'de las uvas', a: 'a las uvas' });
    expect(formasEs('elefante')).toMatchObject({ art: 'elefante', sin: 'elefante', g: 'm', de: 'de elefante' });
  });

  test('el neutro del rumano va en masculino en singular y en femenino en plural', () => {
    const scaun = { art: 'scaunul', sin: 'scaun', g: 'n', pl: false, de: 'scaunului', a: 'scaunului' } as const;
    expect(femenino(scaun)).toBe(false);
    expect(femenino(scaun, true)).toBe(true);
    expect(femenino(formasEs('la luna'))).toBe(true);
  });

  test('el pseudoidioma marca el texto, lo alarga y deja fuera los espacios', () => {
    expect(pseudo('Hola')).toBe('⟦Hola··⟧');
    expect(pseudo(' monedas.')).toBe(' ⟦monedas.···⟧');
    expect(pseudo('  ')).toBe('  ');
  });
});
