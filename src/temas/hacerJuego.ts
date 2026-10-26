/*
 * temas/hacerJuego.ts: makeGame, la fábrica que convierte cada juego de un tema (una entrada de t.games) en su
 * componente (juegos/), el que maneja la escena del juego (SCENES.juego en escenas/escenas2d.ts).
 * Desde la fase 4f está aquí entera, con todos los tipos de juego: antes estaba en temas/temas.ts y la envolvían
 * temas/extras.ts (el cuento y la canción) y temas/ingles.ts (los juegos de inglés) con ponMakeGame. Va en
 * temas/indice.ts después de ingles.ts, porque usa lo de todos los temas.
 * Mira, en este orden (el mismo que tenían las envolturas, de la última a la primera):
 *   1. los juegos de inglés (tipo en..., en un tema con en): EnConocer, EnEscucha, EnGlobos y EnCuenta;
 *   2. el cuento del tema (Story, con CUENTOS) y la canción (Song, con SONGS);
 *   3. los que traen su propia fábrica (g.make) y los que se arman con las palabras del tema: Conocer, Busca y
 *      Memoria.
 * Exporta: makeGame. El puente la deja en globalThis para las pruebas.
 * Importa: los componentes Conocer, Busca, Memoria, Story y Song de juegos/, CUENTOS de contenido/cuentos.ts, SONGS
 * de temas/extras.ts y los juegos de inglés y enItems de temas/ingles.ts.
 */
import type { AlTerminar, Cosa, Juego, Libre } from '../juegos/tipos.ts';
import { Busca, Conocer, Memoria, Song, Story } from '../juegos/indice.ts';
import { CUENTOS } from '../contenido/cuentos.ts';
import { SONGS } from './extras.ts';
import { EnConocer, EnCuenta, EnEscucha, EnGlobos, enItems } from './ingles.ts';

// juegoDeIngles(g, t, onDone): el juego de inglés g (tipo en...) del tema t, con las palabras de su rincón que van con
// la edad (enItems); undefined si g no es un juego de inglés que se conozca.
function juegoDeIngles(g: Libre, t: Libre, onDone: AlTerminar): Juego | undefined {
  const items = enItems(t.en);
  const bg = t.bg;
  if (g.t === 'enConocer') return EnConocer({ items, bg }, onDone);
  if (g.t === 'enEscucha') return EnEscucha({ items, bg, key: `ingles-${t.en}` }, onDone);
  if (g.t === 'enGlobos') return EnGlobos({ items, bg, key: `ingles-${t.en}` }, onDone);
  if (g.t === 'enCuenta') return EnCuenta({ bg }, onDone);
  return undefined;
}

// juegoDePalabras(g, t, onDone): el juego g que trae su propia fábrica (g.make) o que se arma con las palabras del tema
// t (t.words): Conocer, Busca o Memoria; undefined si no es ninguno de ellos.
function juegoDePalabras(g: Libre, t: Libre, onDone: AlTerminar): Juego | undefined {
  if (g.make) return g.make(onDone, t);
  const ks = t.words.map((w: Cosa) => w.k).filter(Boolean);
  if (g.t === 'conocer') return Conocer({ items: t.words, bg: t.bg, intro: t.intro }, onDone);
  if (g.t === 'busca') return Busca({ items: ks, bg: t.bg, key: t.id }, onDone);
  if (g.t === 'memoria') return Memoria({ pool: ks, bg: t.bg }, onDone);
  return undefined;
}

// makeGame(g, t, onDone): crea el componente del juego g del tema t; onDone se llama al terminarlo. Primero los juegos
// de inglés, después el cuento y la canción y al final los de palabras (ver la cabecera). undefined si no sabe hacerlo.
export function makeGame(g: Libre, t: Libre, onDone: AlTerminar): Juego | undefined {
  const ingles = t.en && g.t.startsWith('en') ? juegoDeIngles(g, t, onDone) : undefined;
  if (ingles) return ingles;
  if (g.t === 'cuento') return Story(CUENTOS[t.id], {}, onDone);
  if (g.t === 'cancion') return Song(Object.assign({ bg: t.bg, key: 'cancion' }, SONGS[g.song]()), onDone);
  return juegoDePalabras(g, t, onDone);
}
