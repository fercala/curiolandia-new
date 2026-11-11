/*
 * escenas/excursion.ts: el motor de excursiones en pantalla (base B1 de docs/IDEAS-MEJORA.md, fase P5): el autobús del
 * cole (SCENES.autobus: se elige adónde ir y se viaja) y la escena genérica de una excursión (SCENES.excursion, con
 * {exc: id}): el plano del sitio con sus estaciones, el guía (en la granja, la granjera Rosa) y Tito; al tocar una
 * estación jugable se va a su escena, y al volver (volverDeEstacion, {hecha: id}) se apunta. Cuando se han hecho todas
 * las estaciones que ya se pueden jugar, la foto de grupo: un flash, «¡Patata!» y la foto de recuerdo, y monedas la
 * primera vez de cada día. Las reglas, en dominio/excursiones.ts; los datos, en contenido/excursiones.ts; lo guardado, en
 * S.exc. Desde la fase P4, si la familia ha quitado los juegos de moverse, no cambia nada aquí (las excursiones no son de
 * moverse).
 * Exporta: fondoGranja (el fondo de la granja, que usan también sus estaciones), DESTINOS (dónde está cada cartel del
 * autobús), ALBUM_EXC_BOTON (desde la P7, el botón del álbum de excursiones), sitioEstacion (lo mismo para las estaciones), volverDeEstacion y, desde la fase ID2f de docs/PLAN-IDIOMAS.md, nombreExcursion; pone SCENES.autobus y SCENES.excursion.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito, monedas), las reglas de dominio/excursiones.ts y los datos de
 * contenido/excursiones.ts; desde la P7, los animales que pasean de escenas/granjaAnimales.ts, y desde la P8, el
 * manzano que crece por días de escenas/granjaManzano.ts, y desde la P9, las crías de escenas/granjaCrias.ts; desde la ID2f, el tipo Nombre de dominio/idiomas.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  H,
  S,
  SCENES,
  SFX,
  T,
  VIVO,
  W,
  atHome,
  burst,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  giveCoins,
  giveSticker,
  go,
  hC,
  hv,
  inCoinHUD,
  kid,
  later,
  noise,
  pic,
  save,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
  today,
  tone,
  fmt,
  nombreEn,
  tr,
} from '../nucleo/indice.ts';
import {
  type Estacion,
  type Excursion,
  estacionesJugables,
  siguienteEstacion,
  terminarEstacion,
  terminarVisita,
  visitaCompleta,
  visitaDe,
} from '../dominio/excursiones.ts';
import type { Nombre } from '../dominio/idiomas.ts';
import { EXCURSIONES, excursionPorId } from '../contenido/excursiones.ts';
import { dibujaPaseo, empezarPaseo, moverPaseo, ponerCrias, tocarPaseo } from './granjaAnimales.ts';
import { cuidarManzano, dibujaManzano, tocarManzano } from './granjaManzano.ts';
import { avisoCria, criasEnPaseo, dibujaBotonesCrias, tocarBotonesCrias } from './granjaCrias.ts';

/* ---------- lo común ---------- */

// cielo(a, b): el cielo con un degradado de arriba (a) abajo (b), hasta la línea del horizonte.
function cielo(a: string, b: string, alto: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, alto);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, alto);
}

// nombreExcursion(e): las formas (nombreEn) del nombre de la excursión e en el idioma del juego. El nombre se escribe
// con mayúscula ('La granja escuela') y la tabla de nombres lo guarda en minúscula, como los demás ('la granja escuela').
// Desde la fase ID2f de docs/PLAN-IDIOMAS.md; lo usa también el álbum de excursiones.
export const nombreExcursion = (e: Excursion): Nombre => nombreEn(e.nombre.charAt(0).toLowerCase() + e.nombre.slice(1));

// fondoGranja(): la granja: el cielo, el prado, el granero rojo con su tejado, la valla y el camino de tierra. Lo usan la
// excursión de la granja y sus estaciones.
export function fondoGranja(): void {
  cielo('#BFE3FF', '#E6F5FF', 300);
  ctx.fillStyle = '#A6DB86';
  ctx.fillRect(0, 280, W, H - 280);
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#4A3B2A';
  // el granero, al fondo a la derecha
  ctx.fillStyle = '#D9534F';
  ctx.fillRect(1290, 130, 230, 170);
  ctx.strokeRect(1290, 130, 230, 170);
  ctx.beginPath();
  ctx.moveTo(1270, 140);
  ctx.lineTo(1405, 50);
  ctx.lineTo(1540, 140);
  ctx.closePath();
  ctx.fillStyle = '#8C3B2E';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFF4E0';
  ctx.fillRect(1365, 200, 80, 100);
  ctx.strokeRect(1365, 200, 80, 100);
  // la valla, a lo largo del horizonte
  ctx.strokeStyle = '#B08A5A';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 262);
  ctx.lineTo(1270, 262);
  ctx.moveTo(0, 292);
  ctx.lineTo(1270, 292);
  ctx.stroke();
  Array.from({ length: 22 }, (_, i) => i * 60 + 20).forEach((x) => {
    ctx.fillStyle = '#C9A06A';
    ctx.fillRect(x - 7, 240, 14, 70);
  });
  ctx.restore();
}

// caminoGranja(): el camino de tierra que une las estaciones del plano de la granja.
function caminoGranja(e: Excursion): void {
  ctx.save();
  ctx.strokeStyle = '#E8D3A8';
  ctx.lineWidth = 60;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  e.estaciones.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
  ctx.stroke();
  ctx.restore();
}

/* ---------- el autobús ---------- */

/** Un cartel de destino del autobús: la excursión y dónde está. */
interface Destino {
  readonly e: Excursion;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
// DESTINOS: los carteles del autobús, uno por excursión, en fila y centrados.
export const DESTINOS: readonly Destino[] = EXCURSIONES.map((e, i, todas) => {
  const w = 300,
    sep = 50,
    ancho = todas.length * w + (todas.length - 1) * sep;
  return { e, x: (W - ancho) / 2 + i * (w + sep), y: 230, w, h: 330 };
});
// enDestino(d, x, y): ¿se ha tocado el cartel d?
const enDestino = (d: Destino, x: number, y: number): boolean => x > d.x && x < d.x + d.w && y > d.y && y < d.y + d.h;

// ALBUM_EXC_BOTON: el botón del álbum de excursiones en el autobús (desde la P7; centro y radio).
export const ALBUM_EXC_BOTON = { x: 250, y: 110, r: 62 };

// dibujaBotonAlbum(): el botón del álbum de excursiones: un círculo blanco con un libro y «Álbum» debajo.
function dibujaBotonAlbum(): void {
  const b = ALBUM_EXC_BOTON,
    k = hv('bus:album', hC(b.x, b.y, b.r));
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(k, k);
  circ(0, 0, b.r, '#fff', 6);
  pic('libro', 0, 0, 90);
  card(-58, b.r - 6, 116, 40, '#FFD66B', 4, 20);
  text('Álbum', 0, b.r + 22, 26);
  ctx.restore();
}

/** El estado del autobús: eligiendo destino o viajando (hacia la excursión id, desde T = t0). */
const bus = { fase: 'elige' as 'elige' | 'viaje', destino: '', t0: 0 };

// dibujaCarretera(v): el paisaje del viaje: el cielo, las colinas, la carretera con sus rayas y árboles que pasan (v:
// cuánto se ha avanzado).
function dibujaCarretera(v: number): void {
  cielo('#9ED6FF', '#E3F4FF', 520);
  ctx.fillStyle = '#9BD47A';
  ctx.beginPath();
  ctx.ellipse(400, 560, 600, 160, 0, Math.PI, 0);
  ctx.ellipse(1250, 560, 650, 200, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#A6DB86';
  ctx.fillRect(0, 520, W, 120);
  ctx.fillStyle = '#6B6B6B';
  ctx.fillRect(0, 640, W, 200);
  ctx.fillStyle = '#A6DB86';
  ctx.fillRect(0, 840, W, H - 840);
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    const x = ((((i * 200 - v * 3) % 2000) + 2000) % 2000) - 200;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, 735, 110, 14);
  });
  Array.from({ length: 7 }, (_, i) => i).forEach((i) => {
    const x = ((((i * 300 - v * 1.6) % 2100) + 2100) % 2100) - 250;
    pic('arbol', x, 520, 170);
  });
}

SCENES['autobus'] = {
  music: 'map',
  // enter(): el autobús espera con los carteles de las excursiones; Tito pregunta adónde vamos.
  enter() {
    Object.assign(bus, { fase: 'elige', destino: '', t0: T });
    later(400, () => this.prompt!());
  },
  // prompt(): la consigna, mientras se elige.
  prompt() {
    if (bus.fase === 'elige')
      say(fmt('¡Sube al autobús{nino}! ¿Adónde nos vamos de excursión? Toca un cartel.', { nino: kid() }));
  },
  // hint(): la primera excursión que ya se puede hacer.
  hint() {
    const d = DESTINOS.find((x) => estacionesJugables(x.e).length);
    return bus.fase === 'elige' && d ? { x: d.x + d.w / 2, y: d.y + d.h / 2, r: 120 } : null;
  },
  // dwell(id): dice el nombre de la excursión (o del álbum) bajo el ratón.
  dwell(id: string) {
    if (id === 'bus:album') say('El álbum de excursiones.');
    const d = DESTINOS.find((x) => 'bus:' + x.e.id === id);
    if (d) say(d.e.nombre + '.');
  },
  // update(): en el viaje, el motor suena de vez en cuando; a los 5 segundos se llega.
  update() {
    if (bus.fase !== 'viaje') return;
    VIVO.idle = 0;
    if (T - bus.t0 > 5.5 && sceneName === 'autobus') go('excursion', { exc: bus.destino, hello: true });
  },
  // draw(): eligiendo, los carteles (los que aún no tienen estaciones, en gris con «¡Muy pronto!») sobre la carretera y
  // el autobús parado; viajando, el autobús va dando botes por la carretera con el paisaje pasando.
  draw() {
    const viaje = bus.fase === 'viaje',
      t = T - bus.t0;
    dibujaCarretera(viaje ? t * 120 : 0);
    pic('autobus', viaje ? 800 : 1340, 690 + (viaje ? Math.sin(t * 18) * 5 : 0), viaje ? 420 : 300);
    if (!viaje)
      DESTINOS.forEach((d) => {
        const lista = estacionesJugables(d.e).length > 0,
          s = hv('bus:' + d.e.id, hC(d.x + d.w / 2, d.y + d.h / 2, d.w / 2));
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
        ctx.scale(s, s);
        ctx.translate(-d.x - d.w / 2, -d.y - d.h / 2);
        card(d.x, d.y, d.w, d.h, lista ? '#fff' : '#EEE8DE', 6, 30);
        pic(d.e.icono, d.x + d.w / 2, d.y + 140, 190, lista ? 1 : 0.45);
        // los textos se encogen si no caben en su tarjeta (desde la fase ID3 de docs/PLAN-IDIOMAS.md)
        text(d.e.nombre, d.x + d.w / 2, d.y + d.h - 40, 30, lista ? '#4A3B2A' : '#9A9086', { max: d.w - 30 });
        if (!lista) {
          card(d.x + d.w / 2 - 100, d.y - 26, 200, 50, '#FFD66B', 5, 25);
          text('¡Muy pronto!', d.x + d.w / 2, d.y + 9, 28, undefined, { max: 180 });
        }
        ctx.restore();
      });
    else text('¡Nos vamos de excursión!', W / 2, 160, 56, '#4A3B2A');
    if (!viaje) dibujaBotonAlbum();
    drawHome();
    drawCoinHUD();
    if (!viaje) drawTito(60, 640, 200);
  },
  // down(x, y): casa -> el cole; monedas -> tienda; el álbum -> el álbum de excursiones; un cartel con estaciones -> ¡al
  // viaje!; uno sin -> «muy pronto».
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('cole');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (bus.fase !== 'elige') return;
    if (dist(x, y, ALBUM_EXC_BOTON.x, ALBUM_EXC_BOTON.y) < ALBUM_EXC_BOTON.r) {
      SFX.pop();
      go('albumExcursiones');
      return;
    }
    const d = DESTINOS.find((z) => enDestino(z, x, y));
    if (!d) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    if (!estacionesJugables(d.e).length) {
      SFX.boing();
      say(fmt('¡{Excursion} está en obras! Muy pronto podremos ir.', { excursion: nombreExcursion(d.e).art }));
      return;
    }
    SFX.pop();
    Object.assign(bus, { fase: 'viaje', destino: d.e.id, t0: T });
    tone(180, 0.5, 'sawtooth', 0.15);
    say(fmt('¡Nos vamos {excursion}! ¡Brum, brum!', { excursion: nombreExcursion(d.e).a }));
  },
};

/* ---------- la excursión ---------- */

/** El estado de la excursión en pantalla: cuál, si se está haciendo la foto de grupo (desde T = foto) o ya está. */
const exc = { id: 'granja', foto: -1, hecha: false };

// excursionActual(): la excursión que se está viendo (si el id no existe, la granja).
const excursionActual = (): Excursion => excursionPorId(exc.id) ?? EXCURSIONES[0]!;

// visitaActual(): lo guardado de la excursión que se está viendo (S.exc).
const visitaActual = () => visitaDe(S.exc, exc.id);

// guardarVisita(v): pone en S.exc lo guardado de la excursión que se está viendo y guarda.
function guardarVisita(v: ReturnType<typeof visitaDe>): void {
  S.exc = { ...S.exc, [exc.id]: { ...v, vistas: [...v.vistas] } };
  save();
}

// sitioEstacion(s): el círculo de la estación s en el plano (centro y radio).
export const sitioEstacion = (s: Estacion) => ({ x: s.x, y: s.y, r: 95 });

// volverDeEstacion(excId, estId): una estación ha terminado: vuelve al plano de la excursión, que la apunta como hecha.
export function volverDeEstacion(excId: string, estId: string): void {
  go('excursion', { exc: excId, hecha: estId });
}

// GUIA: dónde está el guía (la granjera) en el plano (centro y tamaño del dibujo).
const GUIA = { x: 800, y: 430, s: 230 };

// dibujaEstacion(s, v): el sitio de la estación s: un círculo blanco con su dibujo; si ya se ha hecho en esta visita,
// con un visto verde; si aún no se puede jugar, en gris con «¡Muy pronto!».
function dibujaEstacion(s: Estacion, hecha: boolean): void {
  const lista = !!s.escena,
    z = sitioEstacion(s),
    k = hv('exc:' + s.id, hC(z.x, z.y, z.r));
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.scale(k, k);
  circ(0, 0, z.r, lista ? '#fff' : '#EEE8DE', 6);
  pic(s.icono, 0, 0, 130, lista ? 1 : 0.4);
  if (hecha) {
    circ(62, -62, 30, '#7CC86E', 5);
    text('✓', 62, -50, 36, '#fff');
  }
  if (!lista) {
    card(-90, -z.r - 40, 180, 44, '#FFD66B', 5, 22);
    text('¡Muy pronto!', 0, -z.r - 9, 24, undefined, { max: 164 });
  }
  ctx.restore();
}

// dibujaFoto(): la foto de grupo: el flash al hacerla y, después, la foto de recuerdo (Tito, la granjera y los animales)
// en un marco blanco un poco torcido.
function dibujaFoto(): void {
  const t = T - exc.foto;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, 450);
  ctx.rotate(-0.04);
  card(-380, -300, 760, 600, '#fff', 6, 12);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-340, -260, 680, 440);
  ctx.clip();
  ctx.translate(-W / 2, -450);
  fondoGranja();
  ctx.restore();
  pic('vaca', -220, 60, 200);
  pic('cerdo', 230, 90, 150);
  pic('gallina', 150, 20, 110);
  pic(excursionActual().guia, 30, -20, 260);
  drawTito(-200, -40, 180);
  text('¡Patata!', 0, 250, 48, '#4A3B2A');
  ctx.restore();
  if (t < 0.5) {
    ctx.fillStyle = `rgba(255,255,255,${1 - t * 2})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// hacerFoto(): la visita está completa: la foto de grupo (flash y sonido de cámara), se apunta (terminarVisita), las
// monedas la primera vez de cada día y la despedida del guía. Desde la P7, la foto va al álbum de excursiones
// (SCENES.albumExcursiones) y la primera visita da la pegatina de la excursión (su dibujo, e.icono).
function hacerFoto(): void {
  const e = excursionActual(),
    r = terminarVisita(visitaActual(), today());
  exc.foto = T;
  guardarVisita(r.visita);
  if (r.monedas) {
    creditCoins(r.monedas);
    save();
  }
  noise(0.08, 0.5, 4000);
  SFX.tada();
  burst(W / 2, 400, 60);
  if (r.monedas) later(1200, () => giveCoins(r.monedas, W / 2, 450, undefined, true));
  const primera = r.visita.veces === 1;
  if (primera) {
    S.stk[e.icono] = (S.stk[e.icono] || 0) + 1;
    save();
  }
  say(
    fmt(
      '¡Una foto de grupo! ¡Patata! Ha sido una excursión estupenda. {guia} nos espera otro día en {excursion}. La foto se queda en el álbum de excursiones. Toca la casa para volver al cole.',
      { guia: e.nombreGuia, excursion: nombreExcursion(e).art },
    ),
    () => {
      if (primera && sceneName === 'excursion') giveSticker(e.icono, true);
    },
  );
}

SCENES['excursion'] = {
  music: 'jardin',
  // enter(o): la excursión o.exc. Si se vuelve de una estación (o.hecha), se apunta; si con eso la visita está completa,
  // la foto de grupo. Si no, el guía saluda (la primera vez, presentándose, S.first['exc:' + id]) o dice qué toca; desde
  // la P8, en la granja el manzano cuenta el día y, si se planta o crece, el guía lo dice antes; desde la P9, las crías
  // salen a pasear con su madre y, si a una le toca nacer, el guía avisa.
  enter(o: OpcionesEscena) {
    Object.assign(exc, { id: o.exc || exc.id, foto: -1, hecha: false });
    const e = excursionActual();
    empezarPaseo(e.id, e.animales ?? []);
    if (e.id === 'granja') ponerCrias(criasEnPaseo());
    // el manzano de la granja cuenta el día (una vez al día); si se planta o crece, Rosa lo dice antes de lo que toca, y
    // si a una cría le toca nacer, también (desde la P9)
    const avisos = [cuidarManzano(e.id), e.id === 'granja' ? avisoCria() : ''].filter((t) => t).join(' '),
      luego = (): void => (avisos ? sayQ(avisos, () => this.prompt!()) : this.prompt!());
    if (o.hecha) {
      const v = terminarEstacion(visitaActual(), o.hecha);
      guardarVisita(v);
      if (visitaCompleta(e, v)) {
        later(600, () => hacerFoto());
        return;
      }
    }
    const clave = 'exc:' + e.id,
      primera = !S.first[clave];
    if (primera) {
      S.first[clave] = 1;
      save();
      later(500, () =>
        sayQ(
          fmt(
            '¡Hola{nino}! Soy {guia}, la granjera. ¡Bienvenido a la granja escuela! Hoy vas a ayudarme a cuidar a los animales.',
            { nino: kid(), guia: e.nombreGuia },
          ),
          luego,
        ),
      );
    } else later(500, luego);
  },
  // prompt(): lo que toca: la siguiente estación por hacer (o, tras la foto, volver).
  prompt() {
    if (exc.foto >= 0) {
      say('Toca la casa para volver al cole.');
      return;
    }
    const s = siguienteEstacion(excursionActual(), visitaActual());
    if (s) say(fmt('¡Vamos a {estacion}! Toca su dibujo.', { estacion: tr(s.nombre).toLowerCase() }));
  },
  // hint(): la siguiente estación por hacer; tras la foto, nada.
  hint() {
    const s = exc.foto < 0 ? siguienteEstacion(excursionActual(), visitaActual()) : undefined;
    return s ? sitioEstacion(s) : null;
  },
  // dwell(id): dice el nombre de la estación bajo el ratón.
  dwell(id: string) {
    const s = excursionActual().estaciones.find((x) => 'exc:' + x.id === id);
    if (s) say(s.nombre + '.');
  },
  // update(): los animales pasean por el prado (desde la P7).
  update() {
    moverPaseo();
  },
  // draw(): la granja, el camino, el manzano (en la granja), los animales que pasean, la estrella de la cría y el botón
  // de las familias, las estaciones, el guía y Tito; tras la visita completa, la
  // foto de grupo.
  draw() {
    const e = excursionActual(),
      v = visitaActual();
    fondoGranja();
    caminoGranja(e);
    if (e.id === 'granja') dibujaManzano();
    dibujaPaseo();
    if (e.id === 'granja' && exc.foto < 0) dibujaBotonesCrias();
    e.estaciones.forEach((s) => dibujaEstacion(s, v.vistas.includes(s.id)));
    pic(e.guia, GUIA.x, GUIA.y + Math.sin(T * 2) * 4, GUIA.s);
    drawTito(560, 380, 170);
    if (exc.foto >= 0) dibujaFoto();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el cole; monedas -> tienda; una estación jugable -> su escena; una «muy pronto» -> el guía lo
  // dice; la estrella de la cría o el botón de las familias (desde la P9) -> su escena; el guía -> repite lo que toca; el manzano (en la granja) -> se mece y Tito dice cómo va; un animal que pasea
  // -> salta y hace su sonido.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('cole');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (exc.foto >= 0) return;
    const s = excursionActual().estaciones.find((z) => dist(x, y, z.x, z.y) < sitioEstacion(z).r);
    if (s) {
      if (!s.escena) {
        SFX.boing();
        say(fmt('{estacion}: ¡muy pronto podremos hacerlo!', { estacion: tr(s.nombre) }));
        return;
      }
      SFX.pop();
      go(s.escena, { exc: exc.id, hello: true });
      return;
    }
    if (excursionActual().id === 'granja' && tocarBotonesCrias(x, y)) return;
    if (dist(x, y, GUIA.x, GUIA.y) < GUIA.s / 2) {
      this.prompt!();
      return;
    }
    if (excursionActual().id === 'granja' && tocarManzano(x, y)) return;
    if (tocarPaseo(x, y)) return;
    SFX.tap();
    sparkles(x, y);
  },
};
