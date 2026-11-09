/*
 * escenas/granjaCrias.ts: las crías y familias de animales de la granja escuela (idea 22 de docs/IDEAS-MEJORA.md, fase
 * P9). Los animales bien cuidados tienen crías: el segundo día de granja nace el pollito y luego, un día tras otro, el
 * corderito, el ternero, el lechón y el potro (CRIAS de dominio/crias.ts; los días de granja son los del manzano). Cuando
 * a una cría le toca nacer, en el plano de la granja sale una estrella y Rosa avisa; al tocarla se abre el nacimiento
 * (SCENES.granjaNace): se toca la paja (o el huevo, que se rompe) hasta que sale la cría, y se elige su nombre entre
 * tres. Las crías nacidas pasean detrás de su madre (ponerCrias de escenas/granjaAnimales.ts) y crecen con los días
 * de granja (etapaCria). Con dos o más, el botón de las familias abre «Cada cría con su mamá» (SCENES.granjaFamilias):
 * se arrastra cada cría hasta su madre. Lo guardado, en S.crias.
 * Exporta: CRIA_ESTRELLA y FAMILIAS_BOTON (dónde están en el plano), ESTADO_CRIAS (para las pruebas), diasGranja,
 * criasEnPaseo, avisoCria, dibujaBotonesCrias y tocarBotonesCrias (los usa SCENES.excursion), y pone
 * SCENES.granjaNace y SCENES.granjaFamilias.
 * Importa: el núcleo (S, guardar, dibujo, voz, sonido, toque), las reglas de dominio/crias.ts y dominio/crecer.ts,
 * MANZANO de dominio/excursiones.ts, fondoGranja de escenas/excursion.ts, dibujaAnimal de escenas/granjaAnimales.ts y el
 * azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
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
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  go,
  hC,
  hR,
  hv,
  kid,
  later,
  noise,
  pic,
  playSound,
  save,
  say,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { type Cria, criaPendiente, criaPorId, criasDe, etapaCria, familiasListas, nacer } from '../dominio/crias.ts';
import { crecimientoDe } from '../dominio/crecer.ts';
import { MANZANO } from '../dominio/excursiones.ts';
import { fondoGranja } from './excursion.ts';
import { type CriaPaseo, dibujaAnimal } from './granjaAnimales.ts';
import { azar } from '../aplicacion/puertos.ts';

// CRIA_ESTRELLA: la estrella que sale en el plano cuando a una cría le toca nacer (centro y radio).
export const CRIA_ESTRELLA = { x: 800, y: 225, r: 62 };
// FAMILIAS_BOTON: el botón de «Cada cría con su mamá» en el plano, con dos crías o más (centro y radio).
export const FAMILIAS_BOTON = { x: 990, y: 225, r: 62 };
// ESCALA_CRIA: el tamaño de la cría en cada etapa (0 recién nacida, 1 pequeña, 2 mayor), comparada con su madre; el
// pollito, que tiene su propio dibujo, va más grande.
const ESCALA_CRIA: readonly number[] = [0.45, 0.58, 0.72];
const ESCALA_POLLITO: readonly number[] = [0.7, 0.85, 1];
// TOQUES_NACER: cuántas veces se toca la paja (o el huevo) hasta que sale la cría.
const TOQUES_NACER = 3;

// diasGranja(): los días distintos que se ha ido a la granja (los que cuenta el manzano, S.crece).
export const diasGranja = (): number => crecimientoDe(S.crece, MANZANO.id).dias;

// dibujoCria(c): con qué animal recortable se dibuja la cría c (el suyo o, si no tiene, el de su madre).
const dibujoCria = (c: Cria): string => c.dibujo ?? c.madre;

// escalaCria(c, etapa): el tamaño de la cría c en esa etapa.
const escalaCria = (c: Cria, etapa: number): number => (c.dibujo ? ESCALA_POLLITO : ESCALA_CRIA)[etapa] ?? 0.6;

// criasEnPaseo(): las crías nacidas (S.crias), listas para pasear detrás de su madre, con su tamaño según lo que han
// crecido y lo que dice Tito al tocarlas.
export function criasEnPaseo(): CriaPaseo[] {
  const dias = diasGranja();
  return Object.entries(criasDe(S.crias)).flatMap(([id, n]) => {
    const c = criaPorId(id);
    if (!c) return [];
    return [
      {
        id,
        animal: dibujoCria(c),
        madre: c.madre,
        escala: escalaCria(c, etapaCria(dias, n)),
        dice: `¡Es ${n.nombre}, ${c.nombre}! Va siempre con su mamá.`,
      },
    ];
  });
}

// avisoCria(): lo que dice Rosa al llegar si a una cría le toca nacer; si no, ''.
export function avisoCria(): string {
  return criaPendiente(diasGranja(), criasDe(S.crias))
    ? '¡Tengo una sorpresa! Algo se mueve en la paja. Toca la estrella para verlo.'
    : '';
}

// dibujaBotonesCrias(): en el plano, la estrella que late si a una cría le toca nacer y, con dos crías o más, el botón
// de las familias (una gallina con su pollito).
export function dibujaBotonesCrias(): void {
  const nacidas = criasDe(S.crias);
  if (criaPendiente(diasGranja(), nacidas)) {
    const b = CRIA_ESTRELLA,
      k = hv('cria:nace', hC(b.x, b.y, b.r)) * (1 + Math.sin(T * 5) * 0.06);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(k, k);
    circ(0, 0, b.r, '#FFF3B0', 6);
    pic('estrella', 0, 0, 90);
    ctx.restore();
    if (Math.sin(T * 3) > 0.9) sparkles(b.x + (azar() - 0.5) * 100, b.y + (azar() - 0.5) * 100, 1);
  }
  if (familiasListas(nacidas)) {
    const b = FAMILIAS_BOTON,
      k = hv('cria:familias', hC(b.x, b.y, b.r));
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(k, k);
    circ(0, 0, b.r, '#fff', 6);
    pic('gallina', -12, -4, 70);
    pic('pollito', 26, 18, 36);
    ctx.restore();
  }
}

// tocarBotonesCrias(x, y): en el plano, la estrella abre el nacimiento y el botón de las familias, su juego. Devuelve
// si se ha tocado alguno.
export function tocarBotonesCrias(x: number, y: number): boolean {
  const nacidas = criasDe(S.crias);
  if (criaPendiente(diasGranja(), nacidas) && dist(x, y, CRIA_ESTRELLA.x, CRIA_ESTRELLA.y) < CRIA_ESTRELLA.r) {
    SFX.pop();
    go('granjaNace', { exc: 'granja' });
    return true;
  }
  if (familiasListas(nacidas) && dist(x, y, FAMILIAS_BOTON.x, FAMILIAS_BOTON.y) < FAMILIAS_BOTON.r) {
    SFX.pop();
    go('granjaFamilias', { exc: 'granja' });
    return true;
  }
  return false;
}

/* ---------- el nacimiento ---------- */

// NIDO: dónde está la paja (o el nido con el huevo) y la madre al lado.
const NIDO = { x: 860, y: 640, madreX: 470 };
// TARJETAS_NOMBRE: las tres tarjetas de los nombres para elegir (esquina, ancho y alto de la primera; van en fila).
const TARJETAS_NOMBRE = { x: 380, y: 170, w: 260, h: 110, sep: 50 };
// nace: el estado del nacimiento: la cría, los toques que lleva, cuándo nació (o -1) y si ya tiene nombre.
const nace = { cria: null as Cria | null, toques: 0, nacio: -1, nombrada: false, toque: -9 };

// tarjeta(i): la tarjeta del nombre i (esquina, ancho y alto).
const tarjeta = (i: number) => ({
  x: TARJETAS_NOMBRE.x + i * (TARJETAS_NOMBRE.w + TARJETAS_NOMBRE.sep),
  y: TARJETAS_NOMBRE.y,
  w: TARJETAS_NOMBRE.w,
  h: TARJETAS_NOMBRE.h,
});

// dibujaPaja(k): el montón de paja del nido (se va haciendo pequeño con los toques, k de 1 a 0) o, con el pollito, el
// nido con el huevo, que tiembla al tocarlo y se va rajando.
function dibujaPaja(k: number): void {
  const c = nace.cria,
    tiembla = Math.max(0, 1 - (T - nace.toque) * 3) * Math.sin(T * 50) * 8;
  ctx.save();
  ctx.fillStyle = '#F2D06B';
  ctx.strokeStyle = '#B98A2E';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(NIDO.x, NIDO.y, 200, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (c?.dibujo) {
    if (nace.nacio < 0) {
      ctx.translate(NIDO.x + tiembla, NIDO.y - 60);
      ctx.fillStyle = '#FFF8EC';
      ctx.strokeStyle = '#4A3B2A';
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 78, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // una raja más con cada toque
      Array.from({ length: nace.toques }, (_, i) => i).forEach((i) => {
        ctx.beginPath();
        ctx.moveTo(-40 + i * 25, -10 + i * 6);
        ctx.lineTo(-25 + i * 25, 8 + i * 6);
        ctx.lineTo(-10 + i * 25, -12 + i * 6);
        ctx.stroke();
      });
    }
  } else if (k > 0) {
    ctx.translate(NIDO.x + tiembla, NIDO.y);
    ctx.scale(1, 0.4 + k * 0.6);
    ctx.beginPath();
    ctx.ellipse(0, 0, 170, 140, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    Array.from({ length: 8 }, (_, i) => i).forEach((i) => {
      ctx.beginPath();
      ctx.moveTo(-140 + i * 40, 0);
      ctx.lineTo(-120 + i * 40 + ((i % 2) * 2 - 1) * 15, -110);
      ctx.stroke();
    });
  }
  ctx.restore();
}

// naceCria(): la cría sale: salto de alegría, el sonido de su madre y Rosa pregunta cómo se va a llamar.
function naceCria(): void {
  const c = nace.cria;
  if (!c) return;
  nace.nacio = T;
  SFX.tada();
  burst(NIDO.x, NIDO.y - 100, 40);
  playSound(c.dibujo ?? c.madre);
  later(700, () =>
    say(
      `¡Ha nacido ${c.nombre}! Es la cría de ${c.nombreMadre}. ¿Cómo lo llamamos? ¿${c.nombres[0]}, ${c.nombres[1]} o ${c.nombres[2]}? Toca un nombre.`,
    ),
  );
}

// ponerNombre(i): se elige el nombre i: la cría nace de verdad (S.crias) y, cuando Rosa lo dice, se vuelve al plano.
function ponerNombre(i: number): void {
  const c = nace.cria,
    nombre = c?.nombres[i];
  if (!c || !nombre || nace.nombrada) return;
  nace.nombrada = true;
  S.crias = { ...nacer(criasDe(S.crias), c.id, nombre, diasGranja()) };
  save();
  SFX.good();
  sparkles(NIDO.x, NIDO.y - 120, 16);
  say(`¡Hola, ${nombre}! Ya vive en la granja con su mamá. Cada día que vengas, ${nombre} estará más grande.`, () =>
    go('excursion', { exc: 'granja' }),
  );
}

SCENES['granjaNace'] = {
  music: 'jardin',
  // enter(): la cría a la que le toca nacer; Rosa explica que hay que tocar la paja (o el huevo).
  enter(_o: OpcionesEscena) {
    Object.assign(nace, {
      cria: criaPendiente(diasGranja(), criasDe(S.crias)) ?? null,
      toques: 0,
      nacio: -1,
      nombrada: false,
      toque: -9,
    });
    const c = nace.cria;
    if (!c) {
      later(300, () => go('excursion', { exc: 'granja' }));
      return;
    }
    later(400, () =>
      say(
        c.dibujo
          ? `¡El huevo de ${c.nombreMadre} se mueve! Tócalo para ayudar al pollito a salir.`
          : `¡Algo se mueve en la paja, al lado de ${c.nombreMadre}! Toca la paja para ver qué es.`,
      ),
    );
  },
  // prompt(): la consigna: tocar la paja (o el huevo) o elegir un nombre.
  prompt() {
    const c = nace.cria;
    if (!c || nace.nombrada) return;
    if (nace.nacio < 0) say(c.dibujo ? 'Toca el huevo.' : 'Toca la paja.');
    else say(`Elige un nombre: ¿${c.nombres[0]}, ${c.nombres[1]} o ${c.nombres[2]}?`);
  },
  // hint(): la paja (o el huevo) y, cuando ya ha nacido, el primer nombre.
  hint() {
    if (!nace.cria || nace.nombrada) return null;
    if (nace.nacio < 0) return { x: NIDO.x, y: NIDO.y - 60, r: 110 };
    const t = tarjeta(0);
    return { x: t.x + t.w / 2, y: t.y + t.h / 2, r: 80 };
  },
  // dwell(id): dice el nombre de la tarjeta bajo el ratón.
  dwell(id: string) {
    const c = nace.cria;
    if (c && id.startsWith('nace:')) say(c.nombres[Number(id.slice(5))] ?? '');
  },
  // draw(): la granja, la madre al lado, la paja (o el huevo) y, cuando ha nacido, la cría que da saltitos y las tres
  // tarjetas de los nombres.
  draw() {
    fondoGranja();
    const c = nace.cria;
    if (c) {
      dibujaAnimal(c.madre, NIDO.madreX, NIDO.y + 40, 1.8, 1);
      dibujaPaja(1 - nace.toques / TOQUES_NACER);
      if (nace.nacio >= 0) {
        const bote = Math.abs(Math.sin((T - nace.nacio) * 6)) * 14;
        dibujaAnimal(dibujoCria(c), NIDO.x, NIDO.y - 10 - bote, escalaCria(c, 0) * 2.4, -1);
        if (!nace.nombrada)
          c.nombres.forEach((n, i) => {
            const t = tarjeta(i),
              k = hv('nace:' + i, hR(t.x, t.y, t.w, t.h));
            ctx.save();
            ctx.translate(t.x + t.w / 2, t.y + t.h / 2);
            ctx.scale(k, k);
            card(-t.w / 2, -t.h / 2, t.w, t.h, '#fff', 6, 24);
            text(n, 0, 16, 44, '#4A3B2A');
            ctx.restore();
          });
      }
    }
    drawTito(14, 720, 170);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el plano; antes de nacer, la paja (o el huevo) -> un toque más (al tercero, nace); después, una
  // tarjeta -> ese nombre.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('excursion', { exc: 'granja' });
      return;
    }
    const c = nace.cria;
    if (!c || nace.nombrada) return;
    if (nace.nacio < 0) {
      if (dist(x, y, NIDO.x, NIDO.y - 60) > 200) {
        SFX.tap();
        sparkles(x, y);
        return;
      }
      nace.toques++;
      nace.toque = T;
      noise(0.2, 0.25, c.dibujo ? 5000 : 2500);
      if (nace.toques >= TOQUES_NACER) naceCria();
      return;
    }
    const i = c.nombres.findIndex((_, j) => {
      const t = tarjeta(j);
      return x > t.x && x < t.x + t.w && y > t.y && y < t.y + t.h;
    });
    if (i >= 0) ponerNombre(i);
  },
};

/* ---------- cada cría con su mamá ---------- */

/** Una madre o una cría en el juego de las familias: de qué cría es, dónde está y (las crías) de dónde salió y si ya
 * está con su madre. */
interface PiezaFamilia {
  readonly c: Cria;
  readonly nombre: string;
  readonly x0: number;
  readonly y0: number;
  x: number;
  y: number;
  puesta: boolean;
}
// familias: el estado del juego: las madres, las crías, la que se arrastra y si ya se ha terminado.
const familias = {
  madres: [] as PiezaFamilia[],
  crias: [] as PiezaFamilia[],
  arrastra: null as PiezaFamilia | null,
  fin: false,
};

// prepararFamilias(): las madres de las crías nacidas en fila arriba y las crías, barajadas, abajo.
function prepararFamilias(): void {
  const nacidas = Object.entries(criasDe(S.crias)).flatMap(([id, n]) => {
      const c = criaPorId(id);
      return c ? [{ c, nombre: n.nombre }] : [];
    }),
    paso = W / (nacidas.length + 1);
  familias.madres = nacidas.map((p, i) => ({
    ...p,
    x0: paso * (i + 1),
    y0: 470,
    x: paso * (i + 1),
    y: 470,
    puesta: false,
  }));
  familias.crias = nacidas
    .map((p) => ({ p, k: azar() }))
    .sort((a, b) => a.k - b.k)
    .map(({ p }, i) => ({ ...p, x0: paso * (i + 1), y0: 800, x: paso * (i + 1), y: 800, puesta: false }));
  familias.arrastra = null;
  familias.fin = false;
}

// deCria(c): «de» delante del nombre de la cría c con su artículo: «del corderito» (todas empiezan por «el»).
const deCria = (c: Cria): string => (c.nombre.startsWith('el ') ? 'del ' + c.nombre.slice(3) : 'de ' + c.nombre);

// soltarCria(f): se suelta la cría f: si está sobre su madre, se queda con ella (sonido y Rosa dice su nombre); si está
// sobre otra madre, «esa no es su mamá» y vuelve; si no, vuelve sin más. Con todas, se termina.
function soltarCria(f: PiezaFamilia): void {
  const m = familias.madres.find((z) => dist(f.x, f.y, z.x, z.y - 80) < 140);
  if (m && m.c.id === f.c.id) {
    Object.assign(f, { puesta: true, x: m.x + 110, y: m.y });
    SFX.good();
    playSound(f.c.dibujo ?? f.c.madre);
    burst(m.x, m.y - 80, 14);
    if (familias.crias.every((z) => z.puesta)) {
      familias.fin = true;
      later(800, () =>
        say(`¡Cada cría está con su mamá! ¡Muy bien${kid()}!`, () => go('excursion', { exc: 'granja' })),
      );
    } else say(`¡${f.nombre} está con ${f.c.nombreMadre}!`);
    return;
  }
  if (m) {
    SFX.boing();
    say(`Esa no es su mamá. La mamá ${deCria(f.c)} es ${f.c.nombreMadre}.`);
  }
  Object.assign(f, { x: f.x0, y: f.y0 });
}

SCENES['granjaFamilias'] = {
  music: 'jardin',
  // enter(): coloca las madres y las crías y explica qué hay que hacer.
  enter(_o: OpcionesEscena) {
    prepararFamilias();
    later(400, () => say('Las crías se han despistado. Arrastra cada cría hasta su mamá.'));
  },
  // prompt(): la consigna.
  prompt() {
    say('Arrastra cada cría hasta su mamá.');
  },
  // hint(): la primera cría que aún no está con su madre.
  hint() {
    const f = familias.crias.find((z) => !z.puesta);
    return f && !familias.fin ? { x: f.x0, y: f.y0 - 40, r: 80 } : null;
  },
  // draw(): la granja, las madres arriba, las crías (con su nombre) abajo y la que se arrastra encima.
  draw() {
    fondoGranja();
    familias.madres.forEach((m) => dibujaAnimal(m.c.madre, m.x, m.y, 1.3, -1));
    familias.crias
      .filter((f) => f !== familias.arrastra)
      .forEach((f) => {
        if (!f.puesta) circ(f.x0, f.y0 - 50, 85, 'rgba(255,255,255,0.7)', 0);
        dibujaAnimal(dibujoCria(f.c), f.x, f.y, escalaCria(f.c, 0) * 1.8, -1);
        text(f.nombre, f.x, f.y + 40, 30, '#4A3B2A');
      });
    const a = familias.arrastra;
    if (a) dibujaAnimal(dibujoCria(a.c), a.x, a.y, escalaCria(a.c, 0) * 2, -1);
    drawTito(14, 720, 170);
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el plano; una cría que aún no está con su madre -> se coge; si no, chispas.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('excursion', { exc: 'granja' });
      return;
    }
    if (familias.fin) return;
    const f = familias.crias.find((z) => !z.puesta && dist(x, y, z.x, z.y - 50) < 90);
    if (f) {
      SFX.pop();
      familias.arrastra = f;
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
  // move(x, y): la cría que se arrastra sigue al dedo.
  move(x: number, y: number) {
    if (familias.arrastra) Object.assign(familias.arrastra, { x, y: y + 40 });
  },
  // up(): se suelta la cría que se arrastraba (soltarCria).
  up() {
    const f = familias.arrastra;
    familias.arrastra = null;
    if (f) soltarCria(f);
  },
};

// ESTADO_CRIAS: el estado del nacimiento y del juego de las familias, para las pruebas (docs/CONTRATO-PRUEBAS.md).
// Solo se lee.
export const ESTADO_CRIAS = { nace, familias, NIDO, tarjeta };
