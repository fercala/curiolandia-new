// Pruebas de las reglas de la cámara de fotos (src/dominio/fotos.ts, fase P15 de docs/IDEAS-MEJORA.md): las fotos y
// sus páginas, lo guardado (S.fotos) y lo que pasa al hacer una foto. Sin navegador.
/* eslint-disable ts-patterns/no-magic-numbers -- los números son los datos de cada caso: leerlos tal cual es más claro. */
import { describe, expect, test } from 'vitest';
import {
  FOTOS,
  PAGINAS_FOTOS,
  cuantasFotos,
  foto,
  fotoDeMarca,
  fotosDePagina,
  hacerFoto,
  registroFotos,
} from '../../src/dominio/fotos.ts';

describe('la cámara de fotos', () => {
  test('fotos con ids distintos, en páginas que existen, con nombre y palabra en inglés', () => {
    expect(new Set(FOTOS.map((f) => f.id)).size).toBe(FOTOS.length);
    const paginas = PAGINAS_FOTOS.map((p) => p.id);
    FOTOS.forEach((f) => {
      expect(paginas).toContain(f.pagina);
      // el nombre lleva su artículo: acepta "La rana" y rechaza "rana"
      // (probar en https://regex101.com/?regex=%5E(El%7CLa)%20)
      expect(f.nombre).toMatch(/^(El|La) /);
      expect(f.en.length).toBeGreaterThan(1);
      expect(f.marcas.length).toBeGreaterThan(0);
    });
    // cada página cabe en el álbum (dos filas de cuatro)
    PAGINAS_FOTOS.forEach((p) => expect(fotosDePagina(p.id).length).toBeLessThanOrEqual(8));
  });

  test('la foto de un objeto sale de sus marcas; la abeja, aunque lleve la de la mariposa', () => {
    expect(fotoDeMarca((m) => m === 'frog')?.id).toBe('rana');
    expect(fotoDeMarca((m) => m === 'bee' || m === 'bfly')?.id).toBe('abeja');
    expect(fotoDeMarca((m) => m === 'gull')?.id).toBe('pajaro');
    expect(fotoDeMarca((m) => m === 'vaca')?.id).toBe('vaca');
    expect(fotoDeMarca((m) => m === 'rock')).toBeUndefined();
  });

  test('un registro roto o de una partida de antes se lee vacío', () => {
    expect(registroFotos(undefined)).toEqual({ vistas: {} });
    expect(registroFotos({ vistas: { rana: 2, nada: 1, vaca: 'x', pato: 0 } })).toEqual({ vistas: { rana: 2 } });
  });

  test('una foto nueva da una moneda; repetirla, ninguna; completar la página, tres más', () => {
    let reg = registroFotos({});
    const r1 = hacerFoto(reg, 'vaca');
    expect(r1).toMatchObject({ nueva: true, monedas: 1, pagina: false });
    const r2 = hacerFoto(r1.registro, 'vaca');
    expect(r2).toMatchObject({ nueva: false, monedas: 0, pagina: false });
    expect(r2.registro.vistas.vaca).toBe(2);
    expect(hacerFoto(reg, 'nada').monedas).toBe(0);
    reg = r2.registro;
    const granja = fotosDePagina('granja').map((f) => f.id);
    granja.slice(1, -1).forEach((id) => {
      reg = hacerFoto(reg, id).registro;
    });
    const ultima = hacerFoto(reg, granja[granja.length - 1]!);
    expect(ultima).toMatchObject({ nueva: true, monedas: 4, pagina: true });
    expect(cuantasFotos(ultima.registro, 'granja')).toBe(granja.length);
    expect(cuantasFotos(ultima.registro)).toBe(granja.length);
    expect(foto('pato')?.en).toBe('duck');
  });
});
