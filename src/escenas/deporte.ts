/*
 * escenas/deporte.ts: el gran día del deporte del patio del cole (idea 17 de docs/IDEAS-MEJORA.md, fase P11), la
 * escena SCENES.deporte. Es la jornada: una fila de cinco tarjetas, una por prueba (PRUEBAS_DEPORTE de
 * dominio/deporte.ts: la carrera, el salto de longitud, la puntería, el equilibrio y los relevos), que se hacen en orden.
 * Al tocar la que toca se va a su escena con {deporte: true}; al acabarla, la prueba vuelve aquí con {prueba, puntos} y
 * la tarjeta enseña su medalla (medallaDe: oro, plata o bronce; siempre hay medalla). Con todas hechas, el medallero y
 * la copa: la primera jornada de cada semana gana la copa (ganarCopa, S.deporte), que se queda en la vitrina de arriba;
 * y, como los demás juegos del patio, 3 monedas la primera vez de cada día (terminarEnElPatio, S.cole, id 'deporte').
 * La carrera es la de la fase P10 (SCENES.carreras, en 3D): sin WebGL no hay carrera y la jornada tiene cuatro pruebas.
 * Lo de la jornada en marcha (JORNADA: las medallas de hoy) no se guarda: si se sale a mitad, se sigue mientras no se
 * cierre el juego.
 * Exporta: JORNADA y TARJETAS_DEPORTE (para las pruebas), pruebasDeHoy, dibujaMedalla y dibujaCopa (los usan las
 * pruebas de escenas/deportePruebas.ts) y pone SCENES.deporte al cargarse.
 * Importa: el núcleo (dibujo, voz, toque, guardado), el fondo del patio y lo común del patio, y las reglas de
 * dominio/deporte.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y colores en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  S,
  SCENES,
  SFX,
  T,
  W,
  atHome,
  burst,
  card,
  circ,
  ctx,
  drawCoinHUD,
  drawHome,
  go,
  hR,
  hv,
  inCoinHUD,
  kid,
  later,
  pic,
  save,
  say,
  sayQ,
  sparkles,
  star,
  text,
  today,
  fmt,
  juntar,
  nombreEn,
  tr,
} from '../nucleo/indice.ts';
import { fondoPatio } from './patio.ts';
import { dibujaFinal, enOtraVez, terminarEnElPatio } from './patioComun.ts';
import {
  type Medalla,
  type PruebaDeporte,
  PRUEBAS_DEPORTE,
  fraseMedallero,
  ganarCopa,
  medallaDe,
  registroDeporte,
} from '../dominio/deporte.ts';

/** Una tarjeta de la jornada: su prueba y su rectángulo. */
interface TarjetaDeporte {
  readonly p: PruebaDeporte;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

// JORNADA: la jornada en marcha: las medallas de las pruebas hechas (id -> medalla), si ya se ha hecho el medallero
// (fin) y si en él se ha ganado la copa (copaNueva).
export const JORNADA: { medallas: Record<string, Medalla>; fin: boolean; copaNueva: boolean } = {
  medallas: {},
  fin: false,
  copaNueva: false,
};
// COLOR_MEDALLA: el color de cada medalla (y el de su cinta).
const COLOR_MEDALLA: Readonly<Record<Medalla, string>> = { oro: '#FFC93C', plata: '#D9DEE6', bronce: '#E09A5B' };
// ICONO: el dibujo de la tarjeta de cada prueba.
const ICONO: Readonly<Record<string, string>> = {
  carrera: 'estrellas',
  salto: 'conejo',
  punteria: 'pelotaPlaya',
  equilibrio: 'pinguino',
  relevos: 'manos',
};

// pruebasDeHoy(): las pruebas de la jornada: las de PRUEBAS_DEPORTE cuya escena existe (sin WebGL, sin la carrera).
export const pruebasDeHoy = (): PruebaDeporte[] => PRUEBAS_DEPORTE.filter((p) => !!SCENES[p.escena]);

// TARJETAS_DEPORTE(): las tarjetas de las pruebas de hoy, en fila y centradas.
export function TARJETAS_DEPORTE(): TarjetaDeporte[] {
  const ps = pruebasDeHoy(),
    w = 250,
    sep = 30,
    ancho = ps.length * w + (ps.length - 1) * sep;
  return ps.map((p, i) => ({ p, x: (W - ancho) / 2 + i * (w + sep), y: 300, w, h: 300 }));
}

// siguiente(): la primera prueba de hoy que aún no tiene medalla, o undefined si están todas.
const siguiente = (): PruebaDeporte | undefined => pruebasDeHoy().find((p) => !JORNADA.medallas[p.id]);

// dibujaMedalla(x, y, r, m): una medalla de radio r en (x, y), con su cinta azul y roja y una estrella en medio.
export function dibujaMedalla(x: number, y: number, r: number, m: Medalla): void {
  ctx.save();
  ctx.lineWidth = r * 0.35;
  ctx.lineCap = 'round';
  [
    ['#5B8DEF', -1],
    ['#E8554E', 1],
  ].forEach(([c, s]) => {
    ctx.strokeStyle = c as string;
    ctx.beginPath();
    ctx.moveTo(x + (s as number) * r * 0.5, y - r * 0.8);
    ctx.lineTo(x + (s as number) * r * 0.2, y - r * 2.1);
    ctx.stroke();
  });
  ctx.restore();
  circ(x, y, r, COLOR_MEDALLA[m], Math.max(3, r * 0.12));
  star(x, y, r * 0.55, '#fff', Math.max(2, r * 0.06));
}

// dibujaCopa(x, y, s): la copa dorada (el pie en (x, y), de alto s), con sus asas y un brillo que se mueve.
export function dibujaCopa(x: number, y: number, s: number): void {
  const k = s / 200;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#4A3B2A';
  ctx.fillStyle = '#FFC93C';
  // las asas
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    ctx.arc(d * 62, -150, 28, 0, Math.PI * 2);
    ctx.stroke();
  });
  // la copa
  ctx.beginPath();
  ctx.moveTo(-70, -190);
  ctx.lineTo(70, -190);
  ctx.quadraticCurveTo(66, -100, 0, -86);
  ctx.quadraticCurveTo(-66, -100, -70, -190);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // el pie
  ctx.fillRect(-12, -88, 24, 50);
  ctx.strokeRect(-12, -88, 24, 50);
  ctx.beginPath();
  ctx.roundRect(-50, -40, 100, 40, 8);
  ctx.fillStyle = '#C98A4B';
  ctx.fill();
  ctx.stroke();
  // el brillo
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-30 + Math.sin(T * 2) * 10, -160, 10, 22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// dibujaTarjeta(t, i): la tarjeta de una prueba: hecha, con su medalla; la que toca, de color y moviéndose un poco
// (crece bajo el ratón); las de después, gris.
function dibujaTarjeta(t: TarjetaDeporte, i: number): void {
  const m = JORNADA.medallas[t.p.id],
    toca = siguiente() === t.p,
    s = toca ? hv('deporte:' + t.p.id, hR(t.x, t.y, t.w, t.h)) : 1,
    cx = t.x + t.w / 2,
    cy = t.y + t.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  card(
    t.x,
    t.y,
    t.w,
    t.h,
    m || toca ? ['#FF8A7A', '#5BB8E6', '#9B8AD9', '#7CC86E', '#FFA94D'][i % 5]! : '#D8D2C8',
    7,
    32,
  );
  card(t.x + 20, t.y + 20, t.w - 40, t.h - 110, '#fff', 5, 24);
  ctx.globalAlpha = m || toca ? 1 : 0.45;
  pic(ICONO[t.p.id] ?? 'estrellas', cx, t.y + 20 + (t.h - 110) / 2 - (toca ? Math.abs(Math.sin(T * 3)) * 10 : 0), 130);
  ctx.globalAlpha = 1;
  text(String(i + 1), t.x + 34, t.y + 56, 34, '#C9C2B8');
  const nombre = t.p.nombre.charAt(0).toUpperCase() + t.p.nombre.slice(1);
  text(nombre, cx, t.y + t.h - 40, nombre.length > 14 ? 24 : 30, '#fff', { st: 6, sc: 'rgba(0,0,0,.25)' });
  ctx.restore();
  if (m) dibujaMedalla(t.x + t.w - 40, t.y + 70, 34, m);
}

// dibujaVitrina(): arriba a la derecha, las copas ganadas (S.deporte): una copa pequeña y cuántas.
function dibujaVitrina(): void {
  const copas = registroDeporte(S.deporte).copas;
  if (!copas) return;
  card(1180, 120, 200, 90, 'rgba(255,255,255,.92)', 5, 30);
  dibujaCopa(1230, 200, 70);
  text('× ' + copas, 1320, 182, 40);
}

// dibujaMedallero(): al final, las medallas de todas las pruebas en fila y la copa grande en medio, que brilla.
function dibujaMedallero(): void {
  const ps = pruebasDeHoy();
  card(W / 2 - 520, 260, 1040, 350, 'rgba(255,255,255,.94)', 7, 40);
  text('¡Medallero!', W / 2 - 330, 330, 46);
  ps.forEach((p, i) => {
    const x = W / 2 - ((ps.length - 1) * 150) / 2 + i * 150,
      m = JORNADA.medallas[p.id];
    if (m) dibujaMedalla(x, 555, 40, m);
  });
  const b = Math.abs(Math.sin(T * 3)) * 10;
  dibujaCopa(W / 2, 450 - b, 160);
  if (JORNADA.copaNueva) text('¡Copa nueva!', W / 2 + 300, 330, 38, '#E8554E');
}

// empezarPrueba(p): va a la escena de la prueba p, como parte de la jornada.
function empezarPrueba(p: PruebaDeporte): void {
  SFX.pop();
  go(p.escena, { deporte: true, hello: true });
}

// acabarJornada(): todas las pruebas hechas: la copa (la primera vez de la semana; se guarda en S.deporte), el
// medallero dicho por Tito y lo de todos los juegos del patio (terminarEnElPatio: apuntarlo y las monedas de hoy).
function acabarJornada(): void {
  const r = ganarCopa(S.deporte, today());
  S.deporte = { ...r.registro };
  save();
  Object.assign(JORNADA, { fin: true, copaNueva: r.nueva });
  terminarEnElPatio('deporte', W / 2, 450);
  const copa = r.nueva
    ? r.registro.copas === 1
      ? tr('¡Y ganas la copa de esta semana! Ya tienes una copa.')
      : fmt('¡Y ganas la copa de esta semana! Ya tienes {n} copas.', { n: r.registro.copas })
    : tr('La copa de esta semana ya es tuya. ¡Vuelve la semana que viene a por otra!');
  later(600, () =>
    sayQ(
      juntar(
        fmt('¡Has terminado el gran día del deporte{nino}!', { nino: kid() }),
        fraseMedallero(JORNADA.medallas, tr),
        copa,
      ),
    ),
  );
}

SCENES['deporte'] = {
  music: 'jardin',
  // enter(o): desde el patio (o.hello sin prueba), una jornada nueva con su presentación; al volver de una prueba
  // (o.prueba), su medalla y lo que toca después (o el medallero si era la última).
  enter(o: OpcionesEscena) {
    if (o.prueba) {
      const m = medallaDe(o.prueba, o.puntos ?? 0, AGE()),
        p = PRUEBAS_DEPORTE.find((x) => x.id === o.prueba);
      JORNADA.medallas = { ...JORNADA.medallas, [o.prueba]: m };
      SFX.tada();
      burst(W / 2, 400, 40);
      const sig = siguiente();
      later(500, () =>
        sayQ(
          fmt('¡Medalla de {medalla} en {prueba}!', {
            medalla: tr(m),
            prueba: nombreEn(p ? p.nombre : 'la prueba').art,
          }),
          () => {
            if (!sig) acabarJornada();
            else say(fmt('Ahora, {prueba}. Toca su tarjeta.', { prueba: nombreEn(sig.nombre).art }));
          },
        ),
      );
      return;
    }
    if (JORNADA.fin || !Object.keys(JORNADA.medallas).length) {
      Object.assign(JORNADA, { medallas: {}, fin: false, copaNueva: false });
      const ps = pruebasDeHoy();
      later(400, () =>
        sayQ(
          fmt(
            ps.length === 5
              ? '¡Hoy es el gran día del deporte! Hay cinco pruebas y en cada una ganas una medalla. ¡Empezamos con {prueba}! Toca su tarjeta.'
              : '¡Hoy es el gran día del deporte! Hay cuatro pruebas y en cada una ganas una medalla. ¡Empezamos con {prueba}! Toca su tarjeta.',
            { prueba: ps[0] ? nombreEn(ps[0].nombre).art : tr('la primera') },
          ),
        ),
      );
    } else if (o.hello) later(400, () => this.prompt!());
  },
  // prompt(): la consigna: la prueba que toca o, al final, volver a empezar.
  prompt() {
    const sig = siguiente();
    if (JORNADA.fin) say('¿Otra jornada? Toca la flecha verde.');
    else if (sig) say(fmt('Ahora toca {prueba}. Toca su tarjeta.', { prueba: nombreEn(sig.nombre).art }));
  },
  // hint(): la tarjeta de la prueba que toca; al final, el botón de otra vez.
  hint() {
    if (JORNADA.fin) return { x: 1000, y: 700, r: 80 };
    const t = TARJETAS_DEPORTE().find((x) => x.p === siguiente());
    return t ? { x: t.x + t.w / 2, y: t.y + t.h / 2, r: t.w / 2 } : null;
  },
  // dwell(id): dice el nombre de la prueba que hay bajo el ratón.
  dwell(id: string) {
    const p = PRUEBAS_DEPORTE.find((x) => 'deporte:' + x.id === id);
    if (p) say(p.nombre);
  },
  // draw(): el patio, el cartel y las tarjetas (o, al final, el medallero con el cartel del final), la vitrina de
  // copas, la casa y las monedas.
  draw() {
    fondoPatio();
    if (!JORNADA.fin) {
      card(W / 2 - 330, 120, 660, 90, '#fff', 6, 45);
      text('Gran día del deporte', W / 2, 182, 48);
    }
    if (JORNADA.fin) {
      dibujaMedallero();
      dibujaFinal();
    } else TARJETAS_DEPORTE().forEach(dibujaTarjeta);
    dibujaVitrina();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el patio; monedas -> tienda; al final, otra vez -> otra jornada; la tarjeta que toca -> su
  // prueba; una de después -> Tito dice que van en orden.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('patio');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (JORNADA.fin) {
      if (enOtraVez(x, y)) {
        SFX.pop();
        this.enter!({ hello: true });
      }
      return;
    }
    const t = TARJETAS_DEPORTE().find((q) => x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h);
    if (!t) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    const sig = siguiente();
    if (t.p === sig) empezarPrueba(t.p);
    else if (JORNADA.medallas[t.p.id])
      say(
        fmt('En {prueba} has ganado la medalla de {medalla}.', {
          prueba: nombreEn(t.p.nombre).art,
          medalla: tr(JORNADA.medallas[t.p.id]!),
        }),
      );
    else {
      SFX.boing();
      say(
        fmt('Las pruebas van en orden. Ahora toca {prueba}.', {
          prueba: sig ? nombreEn(sig.nombre).art : tr('la siguiente'),
        }),
      );
    }
  },
};
