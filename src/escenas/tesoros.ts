/*
 * escenas/tesoros.ts: los tesoros escondidos del mapa y la vitrina de la casa de Tito (idea 18 de docs/IDEAS-MEJORA.md,
 * fase P14). Cada día hay tres tesoros escondidos en rincones del mapa 3D (tesorosDelDia, dominio/tesoros.ts); los
 * pone y los hace brillar mundo3d/tesoros3d.ts, y al tocarlos (o al llegar Tito) se llama a recogerTesoro, que los
 * apunta en S.tesoros, da sus monedas y Tito dice qué ha encontrado. Pipo da pistas (pistaTesoro). Lo encontrado va a
 * la vitrina, la escena SCENES.vitrina: un mueble con un sitio por tesoro (TESOROS), que se abre con su botón de la casa
 * de Tito (VITRINA_BOTON, debajo del álbum de sorpresas) y cuenta cuántas veces se ha encontrado cada uno; los que
 * faltan salen en sombra con una interrogación. La casa vuelve a la casa de Tito. Sin WebGL el mapa es 2D y no tiene
 * tesoros, pero la vitrina se ve igual.
 * Exporta: VITRINA_BOTON, CASILLAS_VITRINA, registroHoy, tesorosPendientes, recogerTesoro, pistaTesoro,
 * dibujaBotonVitrina y pone SCENES.vitrina.
 * Importa: el núcleo (dibujo, voz, sonido, toque, monedas, guardado) y las reglas de dominio/tesoros.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  S,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  drawHome,
  drawTito,
  fmt,
  giveCoins,
  go,
  hC,
  hv,
  later,
  pic,
  save,
  say,
  sayQ,
  sparkles,
  text,
  today,
  tr,
} from '../nucleo/indice.ts';
import {
  TESOROS,
  hallarTesoro,
  pendientesHoy,
  registroTesoros,
  rincon,
  tesoro,
  type Escondite,
  type RegistroTesoros,
} from '../dominio/tesoros.ts';

// VITRINA_BOTON: el botón de la vitrina en la casa de Tito (a la izquierda, debajo del del álbum de sorpresas).
export const VITRINA_BOTON = { x: 80, y: 320, r: 52 };
// MUEBLE: el mueble de la vitrina (esquina, ancho y alto) y sus baldas: dos, con cuatro sitios cada una.
const MUEBLE = { x: 300, y: 170, w: 1000, h: 640, filas: 2, porFila: 4 };
// CASILLAS_VITRINA: el centro de cada sitio de la vitrina, en el orden de TESOROS (para dibujar, tocar y las pruebas).
export const CASILLAS_VITRINA: readonly { id: string; x: number; y: number }[] = TESOROS.map((t, i) => ({
  id: t.id,
  x: MUEBLE.x + (MUEBLE.w / MUEBLE.porFila) * ((i % MUEBLE.porFila) + 0.5),
  y: MUEBLE.y + (MUEBLE.h / MUEBLE.filas) * (Math.floor(i / MUEBLE.porFila) + 0.5) - 20,
}));

// registroHoy(): lo guardado de los tesoros (S.tesoros), leído con registroTesoros (vacío si falta o está roto).
export const registroHoy = (): RegistroTesoros => registroTesoros(S.tesoros);
// tesorosPendientes(): los tesoros de hoy que aún no se han encontrado (los que pone el mapa 3D).
export const tesorosPendientes = (): Escondite[] => pendientesHoy(registroHoy(), today());
// totalVitrina(): cuántos tesoros distintos hay ya en la vitrina.
const totalVitrina = (): number => Object.keys(registroHoy().vitrina).length;

// recogerTesoro(rinconId, x, y): Tito encuentra el tesoro del rincón rinconId: se apunta en S.tesoros (hallarTesoro),
// se abonan sus monedas y se guarda; luego chispas, Tito dice qué es y las monedas salen de (x, y). Con el último del
// día, Tito lo celebra. Devuelve el id del tesoro, o '' si allí no había ninguno pendiente.
export function recogerTesoro(rinconId: string, x: number, y: number): string {
  const r = hallarTesoro(registroHoy(), rinconId, today());
  if (!r.tesoro) return '';
  S.tesoros = { d: r.registro.d, hoy: [...r.registro.hoy], vitrina: { ...r.registro.vitrina } };
  creditCoins(r.monedas);
  save();
  SFX.tada();
  sparkles(x, y, 24);
  if (r.todos) burst(x, y, 50);
  later(700, () => giveCoins(r.monedas, x, y, undefined, true));
  say(tesoro(r.tesoro)?.frase ?? '');
  if (r.todos) sayQ('¡Has encontrado los tres tesoros de hoy! Mañana habrá otros.');
  return r.tesoro;
}

// pistaTesoro(): la pista de un tesoro de hoy que falta (la de uno al azar, para no repetir siempre la misma), o '' si
// ya están todos.
export function pistaTesoro(): string {
  const p = tesorosPendientes();
  if (!p.length) return '';
  return rincon(p[Math.floor(T * 7) % p.length]?.rincon ?? '')?.pista ?? '';
}

// dibujaBotonVitrina(): el botón de la vitrina en la casa de Tito: una concha en un círculo, con cuántos tesoros
// distintos hay ya (crece un poco bajo el ratón, id 'vitrina').
export function dibujaBotonVitrina(): void {
  const B = VITRINA_BOTON,
    s = hv('vitrina', hC(B.x, B.y, B.r));
  ctx.save();
  ctx.translate(B.x, B.y);
  ctx.scale(s, s);
  circ(0, 0, B.r, '#fff', 5);
  pic('concha', 0, 0, B.r * 1.3);
  circ(B.r * 0.7, -B.r * 0.7, 24, '#7FD3E8', 4);
  text(totalVitrina(), B.r * 0.7, -B.r * 0.7 + 9, 24);
  ctx.restore();
}

// dibujaMueble(): el mueble de madera de la vitrina con su cristal y sus baldas.
function dibujaMueble(): void {
  const m = MUEBLE;
  card(m.x - 30, m.y - 30, m.w + 60, m.h + 60, '#B07A4A', 7, 30);
  card(m.x, m.y, m.w, m.h, '#EAF7FB', 5, 18);
  Array.from({ length: m.filas }, (_, i) =>
    card(m.x + 10, m.y + (m.h / m.filas) * (i + 1) - 34, m.w - 20, 22, '#C98B4F', 4, 8),
  );
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(m.x + 60, m.y + 40);
  ctx.lineTo(m.x + 160, m.y + 240);
  ctx.stroke();
  ctx.restore();
}

// dibujaCasilla(c): un sitio de la vitrina: el tesoro con su nombre y cuántas veces se ha encontrado; si aún no, en
// sombra y con una interrogación.
function dibujaCasilla(c: { id: string; x: number; y: number }): void {
  const n = registroHoy().vitrina[c.id] ?? 0,
    t = tesoro(c.id);
  if (!n) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    pic(c.id, c.x, c.y, 150);
    ctx.restore();
    text('?', c.x, c.y + 24, 80, '#9AB7C0');
    return;
  }
  pic(c.id, c.x, c.y + Math.sin(T * 2 + c.x) * 4, 150);
  text(t?.nombre ?? '', c.x, c.y + 108, 28, '#3A281E', { max: 230 });
  circ(c.x + 70, c.y - 70, 26, '#FFC93C', 4);
  text(n, c.x + 70, c.y - 60, 26);
}

// enCasilla(x, y): el sitio de la vitrina que hay en (x, y), o undefined.
const enCasilla = (x: number, y: number) => CASILLAS_VITRINA.find((c) => dist(x, y, c.x, c.y) < 100);

// LA VITRINA: sin estado propio (lo lee todo de S.tesoros).
SCENES.vitrina = {
  music: null,
  // enter(): Tito presenta su vitrina: cuántos tesoros lleva, o que aún está vacía.
  enter() {
    const n = totalVitrina();
    later(400, () =>
      sayQ(
        n
          ? fmt('¡Mi vitrina de tesoros! Ya tengo {n} de {total}. Toca uno para verlo.', { n, total: TESOROS.length })
          : '¡Mi vitrina de tesoros! Está vacía. Pasea por el mapa para encontrar tesoros escondidos.',
      ),
    );
  },
  // prompt(): qué hacer.
  prompt() {
    say('Cada día hay tres tesoros escondidos en el mapa. Pasea con Tito para encontrarlos.');
  },
  // draw(): el fondo, el título, el mueble con sus tesoros, Tito y la casa.
  draw() {
    ctx.fillStyle = '#FDF1DC';
    ctx.fillRect(0, 0, 1600, 900);
    card(500, 30, 600, 100, '#FFFFFF', 5, 40);
    text('Mi vitrina de tesoros', 800, 96, 48, '#3A281E', { max: 560 });
    dibujaMueble();
    CASILLAS_VITRINA.forEach(dibujaCasilla);
    drawTito(20, 720, 170 + Math.sin(T * 2) * 4);
    drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; un tesoro encontrado, Tito dice cuál es y cuántas veces lo ha
  // encontrado (su nombre, traducido desde la v0.2.156); uno que falta, que aún está por encontrar.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const c = enCasilla(x, y);
    if (!c) return;
    const n = registroHoy().vitrina[c.id] ?? 0;
    if (!n) {
      SFX.tap();
      say('Este tesoro aún no lo has encontrado.');
      return;
    }
    SFX.pop();
    sparkles(c.x, c.y, 10);
    say(
      n === 1
        ? fmt('{nombre}. La has encontrado una vez.', { nombre: tr(tesoro(c.id)?.nombre ?? '') })
        : fmt('{nombre}. La has encontrado {n} veces.', { nombre: tr(tesoro(c.id)?.nombre ?? ''), n }),
    );
  },
};
