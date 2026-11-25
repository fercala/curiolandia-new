/*
 * escenas/perfiles.ts: «¿Quién juega?» con varios niños (idea 38 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas
 * pendientes, v0.2.181), SCENES.perfiles. Si hay más de un perfil, al empezar a jugar desde la portada sale una
 * tarjeta por niño (Tito, su nombre y su edad); al tocar la del que ya juega se sigue, y al tocar otra se cambia de
 * perfil (la página se recarga con su partida, aplicacion/perfiles.ts). Los perfiles se añaden en la zona de adultos
 * («Quién juega»).
 * Exporta, para las pruebas, tarjetaPerfil; pone SCENES.perfiles al cargarse.
 * Importa: el núcleo (dibujo, voz, escenas y S) y los casos de uso de aplicacion/perfiles.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños en la pantalla de 1600x900, como en el resto de
   las escenas. */
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import { S, SCENES, SFX, card, drawTito, fmt, go, hR, say, sky, text } from '../nucleo/indice.ts';
import { cambiarAPerfil, leerPerfiles } from '../aplicacion/perfiles.ts';

// tarjetaPerfil(i, n): el rectángulo de la tarjeta del perfil i de n, en fila.
export const tarjetaPerfil = (i: number, n: number): { x: number; y: number; w: number; h: number } => ({
  x: 800 + (i - (n - 1) / 2) * 420 - 180,
  y: 250,
  w: 360,
  h: 460,
});

SCENES.perfiles = {
  music: 'title',
  // enter(): Tito pregunta quién juega.
  enter(_o: OpcionesEscena) {
    say('¿Quién juega hoy? Toca tu nombre.');
  },
  // prompt(): la misma pregunta.
  prompt() {
    say('¿Quién juega hoy? Toca tu nombre.');
  },
  // draw(): una tarjeta por perfil, con Tito, el nombre y la edad.
  draw() {
    sky('#FFF6E6', '#FCE3C0');
    text('¿Quién juega?', 800, 170, 64, K, { max: 900 });
    const lista = leerPerfiles().lista;
    lista.forEach((p, i) => {
      const r = tarjetaPerfil(i, lista.length);
      hR(r.x, r.y, r.w, r.h);
      card(r.x, r.y, r.w, r.h, '#FFFFFF', 6, 36);
      drawTito(r.x + 70, r.y + 60, 220);
      text(p.nombre || 'Sin nombre', r.x + r.w / 2, r.y + 340, 44, K, { max: r.w - 30 });
      if (p.edad) text(fmt('{n} años', { n: p.edad }), r.x + r.w / 2, r.y + 400, 32, '#7A6252');
    });
  },
  // down(x, y): el que ya juega -> sigue (la intro o el mapa); otro -> cambia de perfil.
  down(x: number, y: number) {
    const ind = leerPerfiles(),
      i = ind.lista.findIndex((_, j) => {
        const r = tarjetaPerfil(j, ind.lista.length);
        return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      });
    if (i < 0) return;
    SFX.pop();
    const p = ind.lista[i]!;
    if (p.id !== ind.activo) {
      cambiarAPerfil(p.id);
      return;
    }
    if (!S.age) go('edad');
    else go(S.intro ? 'map' : 'intro', { hello: true });
  },
} satisfies Escena;
