/*
 * escenas/casaMascotas.ts: las mascotas que crecen (fase C6 de docs/PLAN-CASA.md). Las 6 mascotas de la tienda
 * (MASCOTAS en dominio/casa.ts) nacen bebés y crecen con los días en que se cuidan: joven a los 3 días y mayor a los 8
 * (DIAS_ETAPA; un día cuenta con dos cuidados distintos). Nunca enferman ni se ponen tristes (decisión 4 del plan).
 * Aquí está cómo se dibujan según su etapa (dibujaMascota: el bebé, más pequeño y rechoncho; el joven, casi como el de
 * siempre; el mayor, con su medalla), el bocadillo con lo que piden hoy (bocadillo, quiereHoy) y la escena
 * SCENES.casaMascota, que se abre cuando Tito llega junto a una mascota en su casa (escenas/tienda.ts, irA): la
 * mascota en grande, su nombre (la primera vez se elige entre tres, NOMBRES_MASCOTA), los corazones de los días
 * cuidados, los botones de sus cuidados (cuidadosDe) y la fiesta al crecer. Pipo también se puede cuidar (id 'pipo',
 * desde que nace), aunque crece con las estrellas, como siempre (petStage de escenas/zonas.ts).
 * Lo de cada mascota se guarda en S.mascotas (FichaMascota, con fichaDe, cuidar y fichaNueva de dominio/casa.ts).
 * Exporta: NOMBRES_MASCOTA, ESCALA_ETAPA, fichaMascota, etapaDe, dibujaMascota, mascotasMayores, pideAlgo, bocadillo y pone SCENES.casaMascota.
 * Importa: el núcleo (dibujo, voz, sonido, toque, guardado), drawPet y petStage de escenas/zonas.ts y las reglas de las
 * mascotas de dominio/casa.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import {
  PI,
  S,
  SCENES,
  SFX,
  T,
  atHome,
  burst,
  card,
  circ,
  ctx,
  dist,
  drawHome,
  drawTito,
  fmt,
  go,
  hC,
  hv,
  juntar,
  later,
  parts,
  pic,
  rnd,
  save,
  say,
  sayQ,
  sparkles,
  star,
  text,
  today,
  tr,
} from '../nucleo/indice.ts';
import {
  DIAS_ETAPA,
  cuidadosDe,
  cuidar,
  etapaMascota,
  fichaDe,
  quiereHoy,
  type Cuidado,
  type FichaMascota,
} from '../dominio/casa.ts';
import { drawPet, petStage } from './zonas.ts';

// NOMBRES_MASCOTA: los tres nombres para elegir de cada mascota (decisión 6 del plan).
export const NOMBRES_MASCOTA: Readonly<Record<string, readonly string[]>> = {
  casitaPerro: ['Toby', 'Lula', 'Coco'],
  gato: ['Misi', 'Nube', 'Bigotes'],
  pajaro: ['Kiwi', 'Pío', 'Lima'],
  conejo: ['Copito', 'Nieve', 'Saltarín'],
  hamster: ['Bolita', 'Canela', 'Pipas'],
  pecera: ['Burbuja', 'Aleta', 'Coral'],
};
// ESPECIE: cómo se dice cada mascota mientras no tiene nombre.
const ESPECIE: Readonly<Record<string, string>> = {
  casitaPerro: 'el perrito',
  gato: 'el gatito',
  pajaro: 'el pajarito',
  conejo: 'el conejito',
  hamster: 'el hámster',
  pecera: 'los peces',
  pipo: 'Pipo',
};
// DIBUJO: el dibujo de la mascota (el perro vive en su casita; los peces, en la pecera).
const DIBUJO: Readonly<Record<string, string>> = {
  casitaPerro: 'perro',
  gato: 'gato',
  pajaro: 'pajaro',
  conejo: 'conejo',
  hamster: 'hamster',
  pecera: 'pecera',
};
// COMIDA: el dibujo de la comida de cada una (el botón de comer). JUGUETE: el del botón de jugar.
const COMIDA: Readonly<Record<string, string>> = {
  casitaPerro: 'hueso',
  gato: 'pez',
  pajaro: 'pan',
  conejo: 'zanahoria',
  hamster: 'queso',
  pecera: 'pan',
  pipo: 'zanahoria',
};
const JUGUETE: Readonly<Record<string, string>> = { gato: 'pluma', pajaro: 'pluma' };
// ESCALA_ETAPA: el tamaño de la mascota en cada etapa (bebé, joven, mayor).
export const ESCALA_ETAPA: readonly number[] = [0.62, 0.82, 1];
// FRASE_CUIDADO: lo que dice Tito al hacer cada cuidado. PIDE: lo que dice cuando la mascota lo pide.
const FRASE_CUIDADO: Readonly<Record<Cuidado, string>> = {
  comer: '¡Ñam, ñam! Le encanta su comida.',
  agua: '¡Qué fresquita el agua!',
  jugar: '¡Cómo se divierte!',
  lavar: '¡Ahora huele muy bien!',
  mirar: '¡Mira cómo nadan!',
};
const PIDE: Readonly<Record<Cuidado, string>> = {
  comer: '¡Es la hora de comer!',
  agua: '¡Es la hora de beber agua!',
  jugar: '¡Es la hora de jugar!',
  lavar: '¡Es la hora del baño!',
  mirar: '¡Es la hora de mirar cómo nadan!',
};
// PANTALLA: dónde está la mascota en la escena (x, y del suelo y tamaño de mayor), la fila de botones y los nombres.
const PANTALLA = {
  x: 800,
  y: 660,
  s: 430,
  botones: { y: 810, dx: 190, r: 70 },
  nombres: { y: 470, xs: [480, 800, 1120] },
};

// fichaMascota(id): la ficha guardada de la mascota (S.mascotas) o la de una comprada antes (fichaDe).
export function fichaMascota(id: string): FichaMascota {
  return fichaDe(S.mascotas || {}, id);
}
// etapaDe(id): 0 bebé, 1 joven o 2 mayor, por los días cuidados.
export function etapaDe(id: string): number {
  return etapaMascota(fichaMascota(id).dias);
}
// nombreDe(id): el nombre que le puso el niño, o cómo se dice la mascota si aún no tiene (desde la fase ID2f de
// docs/PLAN-IDIOMAS.md, en el idioma del juego). Desde la ID4c, también el nombre elegido, que se guarda en castellano
// (NOMBRES_MASCOTA), sale traducido; juntar lo marca como ya traducido para que text() no lo traduzca otra vez.
const nombreDe = (id: string): string => {
  const e = ESPECIE[id],
    nombre = fichaMascota(id).nombre;
  return juntar(nombre ? tr(nombre) : e ? tr(e) : id);
};
// mayuscula(t): t con la primera letra en mayúscula.
const mayuscula = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

// dibujaMascota(id, x, y, s, salto): la mascota id con el suelo en (x, y) y tamaño s de mayor, según su etapa: el bebé,
// pequeño y algo más ancho que alto; el mayor, con una medalla dorada. salto: lo que sube (en px, negativo) ahora.
// La pecera crece por dentro: un pez por etapa, más grandes cuanto mayores.
export function dibujaMascota(id: string, x: number, y: number, s: number, salto = 0): void {
  const e = etapaDe(id);
  if (id === 'pecera') {
    pic('pecera', x, y - s * 0.42, s);
    Array.from({ length: e + 1 }, (_v, i) => i).forEach((i) => {
      const a = T * (0.8 + i * 0.3) + i * 2,
        fx = x + Math.sin(a) * s * 0.22,
        fy = y - s * (0.36 + i * 0.1);
      ctx.save();
      ctx.translate(fx, fy);
      if (Math.cos(a) < 0) ctx.scale(-1, 1);
      pic('pez', 0, 0, s * (0.16 + e * 0.05));
      ctx.restore();
    });
    return;
  }
  const t = s * ESCALA_ETAPA[e];
  ctx.save();
  ctx.translate(x, y + salto);
  if (e === 0) ctx.scale(1.1, 0.92);
  pic(DIBUJO[id] || id, 0, -t * 0.42, t);
  if (e === 2) {
    circ(t * 0.12, -t * 0.2, t * 0.08, '#FFC93C', Math.max(2, t * 0.012));
    star(t * 0.12, -t * 0.2, t * 0.045, '#FFF3B0', 0);
  }
  ctx.restore();
}

// iconoCuidado(c, id, x, y, s): el dibujo del cuidado c de la mascota id (su comida, una gota de agua, su juguete, el
// jabón o la lupa), centrado en (x, y).
function iconoCuidado(c: Cuidado, id: string, x: number, y: number, s: number): void {
  if (c === 'agua') {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.3, -s * 0.1, s * 0.28, s * 0.12);
    ctx.arc(0, s * 0.12, s * 0.28, 0, PI);
    ctx.quadraticCurveTo(-s * 0.3, -s * 0.1, 0, -s * 0.45);
    ctx.fillStyle = '#7FD3F0';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3A281E';
    ctx.stroke();
    ctx.restore();
    return;
  }
  const ic: Record<Cuidado, string> = {
    comer: COMIDA[id] || 'galleta',
    agua: '',
    jugar: JUGUETE[id] || 'pelota',
    lavar: 'jabon',
    mirar: 'lupa',
  };
  pic(ic[c], x, y, s);
}

// mascotasMayores(): los dibujos de las mascotas mayores del niño que salen a pasear por el mapa junto a la casa de Tito
// (desde la fase C7; los peces no salen de su pecera).
export const mascotasMayores = (): string[] =>
  ['casitaPerro', 'gato', 'pajaro', 'conejo', 'hamster']
    .filter((id) => S.owned?.[id] && etapaDe(id) === 2)
    .map((id) => DIBUJO[id]);

// pideAlgo(id): ¿la mascota pide hoy algo todavía (quiereHoy)?
export const pideAlgo = (id: string): boolean => quiereHoy(fichaMascota(id), id, today()) !== null;

// bocadillo(id, x, y): el bocadillo con lo que la mascota pide hoy (quiereHoy), con la punta en (x, y); nada si hoy ya
// está cuidada. Se mece un poco para que se vea.
export function bocadillo(id: string, x: number, y: number): void {
  const c = quiereHoy(fichaMascota(id), id, today());
  if (!c) return;
  const b = Math.sin(T * 2.5) * 5;
  ctx.save();
  ctx.translate(x, y + b);
  circ(0, -70, 52, '#FFFFFF', 4);
  circ(-18, -10, 10, '#FFFFFF', 3);
  circ(-28, 8, 6, '#FFFFFF', 3);
  iconoCuidado(c, id, 0, -70, 66);
  ctx.restore();
}

// corazones(id, x, y): los días cuidados hasta la etapa siguiente, como corazones (llenos los cuidados); el mayor, una
// estrella.
function corazones(id: string, x: number, y: number): void {
  const f = fichaMascota(id),
    e = etapaMascota(f.dias);
  if (e >= DIAS_ETAPA.length) {
    star(x, y, 34, '#FFC93C', 4);
    return;
  }
  const desde = e ? DIAS_ETAPA[e - 1] : 0,
    n = DIAS_ETAPA[e] - desde,
    x0 = x - (n - 1) * 32;
  Array.from({ length: n }, (_v, i) => i).forEach((i) => {
    const lleno = f.dias - desde > i;
    ctx.save();
    ctx.translate(x0 + i * 64, y);
    ctx.globalAlpha = lleno ? 1 : 0.35;
    pic('corazon', 0, 0, 52);
    ctx.restore();
  });
}

// botones(id): dónde están los botones de los cuidados de la mascota, centrados abajo.
const botones = (id: string): { c: Cuidado; x: number; y: number }[] => {
  const cs = cuidadosDe(id),
    b = PANTALLA.botones;
  return cs.map((c, i) => ({ c, x: PANTALLA.x + (i - (cs.length - 1) / 2) * b.dx, y: b.y }));
};

// LA MASCOTA: estado: id (qué mascota; 'pipo' es Pipo), elige (los tres nombres para elegir, o null), anim ({c, t0}:
// el cuidado que se está haciendo) y fiesta (hora T a la que creció, o -9).
SCENES.casaMascota = {
  music: null,
  // enter(o): la mascota o.inst. Si no tiene nombre (y no es Pipo), primero se elige; si no, Tito dice lo que pide.
  enter(o?: { inst?: string }) {
    const id = (o && o.inst) || 'gato';
    this.id = id;
    this.anim = null;
    this.fiesta = -9;
    const f = fichaMascota(id);
    this.elige = id !== 'pipo' && !f.nombre ? NOMBRES_MASCOTA[id] || null : null;
    const n = this.elige as readonly string[] | null;
    if (n) {
      later(400, () =>
        sayQ(
          fmt('¡Hay que ponerle nombre! ¿{a}, {b} o {c}? Toca el que más te guste.', {
            a: tr(n[0]!),
            b: tr(n[1]!),
            c: tr(n[2]!),
          }),
        ),
      );
      return;
    }
    later(400, () => this.saluda!());
  },
  // saluda(): Tito dice cómo se llama la mascota y lo que pide hoy (o que ya está feliz).
  saluda() {
    const id = this.id as string,
      c = quiereHoy(fichaMascota(id), id, today());
    sayQ(juntar(fmt('¡Hola, {nombre}!', { nombre: nombreDe(id) }), tr(c ? PIDE[c] : '¡Hoy ya está feliz!')));
  },
  // prompt(): elegir nombre, o lo que pide la mascota.
  prompt() {
    if (this.elige) {
      say('Toca el nombre que más te guste.');
      return;
    }
    const id = this.id as string,
      c = quiereHoy(fichaMascota(id), id, today());
    say(c ? juntar(tr(PIDE[c]), tr('Toca los botones de abajo.')) : 'Hoy ya está feliz. Puedes seguir jugando.');
  },
  // draw(): el cuarto, la mascota en grande (saltando al jugar o en la fiesta), lo que se le está dando, su nombre y
  // sus corazones, los botones de cuidados, el bocadillo, Tito, la casa y, si toca, los tres nombres para elegir.
  draw() {
    const id = this.id as string,
      P = PANTALLA,
      an = this.anim as { c: Cuidado; t0: number } | null,
      u = an ? (T - an.t0) / 1.4 : 1;
    ctx.fillStyle = '#FFF4E8';
    ctx.fillRect(0, 0, 1600, 900);
    ctx.fillStyle = '#F2D9B8';
    ctx.fillRect(0, 640, 1600, 260);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(P.x, P.y + 10, 260, 40, 0, 0, PI * 2);
    ctx.fillStyle = 'rgba(120,80,40,.15)';
    ctx.fill();
    ctx.restore();
    const brinca = (an && an.c === 'jugar' && u < 1) || T - this.fiesta < 2.5,
      salto = brinca ? -Math.abs(Math.sin(T * 9)) * 50 : 0;
    if (id === 'pipo') drawPet(P.x, P.y + salto, P.s * 0.9, { st: petStage() });
    else dibujaMascota(id, P.x, P.y, P.s, salto);
    if (an && u < 1) {
      if (an.c === 'comer') iconoCuidado('comer', id, P.x + 260 - u * 200, P.y - 120, 110 * (1 - u * 0.7));
      if (an.c === 'agua') {
        card(P.x + 120, P.y - 60, 170, 60, '#9BD3EE', 4, 24);
        iconoCuidado('agua', id, P.x + 205, P.y - 120 - u * 40, 60);
      }
      if (an.c === 'jugar') iconoCuidado('jugar', id, P.x + 240, P.y - 80 - Math.abs(Math.sin(T * 7)) * 160, 90);
      if (an.c === 'lavar')
        Array.from({ length: 8 }, (_v, i) => i).forEach((i) =>
          circ(
            P.x + Math.cos(i * 0.8 + T * 2) * 180,
            P.y - 160 - ((i * 35 + u * 120) % 260),
            18 + (i % 3) * 8,
            'rgba(255,255,255,.7)',
            3,
            '#9BD3EE',
          ),
        );
      if (an.c === 'mirar')
        iconoCuidado('mirar', id, P.x + Math.cos(T * 2) * 120, P.y - 260 + Math.sin(T * 2) * 60, 120);
    }
    card(P.x - 230, 30, 460, 90, '#FFFFFF', 5, 30);
    text(juntar(mayuscula(nombreDe(id))), P.x, 84, 48, '#3A281E');
    if (id !== 'pipo') corazones(id, P.x, 170);
    if (!this.elige) {
      botones(id).forEach((b) => {
        const s = hv('cu' + b.c, hC(b.x, b.y, PANTALLA.botones.r));
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(s, s);
        circ(0, 0, PANTALLA.botones.r, '#FFFFFF', 5);
        iconoCuidado(b.c, id, 0, 0, 92);
        ctx.restore();
      });
      if (!an || u >= 1) bocadillo(id, P.x + 200, P.y - P.s * 0.75);
    }
    drawTito(30, 640, 210);
    drawHome();
    const n = this.elige as readonly string[] | null;
    if (n) {
      ctx.fillStyle = 'rgba(58,40,30,.45)';
      ctx.fillRect(0, 0, 1600, 900);
      card(260, 300, 1080, 320, '#FFFFFF', 6, 40);
      text('¿Cómo se llama?', 800, 370, 50, '#3A281E');
      n.forEach((t, i) => {
        const x = P.nombres.xs[i],
          s = hv('nom' + i, hC(x, P.nombres.y, 120));
        ctx.save();
        ctx.translate(x, P.nombres.y);
        ctx.scale(s, s);
        card(-140, -60, 280, 120, ['#FFE08A', '#BDE7F5', '#F9C6DA'][i], 5, 30);
        text(t, 0, 10, 46, '#3A281E');
        ctx.restore();
      });
    }
  },
  // down(x, y): la casa vuelve a la casa de Tito; eligiendo nombre, un nombre se queda (y se guarda); un botón hace su
  // cuidado (cuidar: si el día cuenta, Tito lo dice; si crece, hay fiesta); tocar la mascota, un saltito.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.tap();
      go('casaTito', { volver: 1 });
      return;
    }
    const id = this.id as string,
      n = this.elige as readonly string[] | null;
    if (n) {
      const i = PANTALLA.nombres.xs.findIndex((nx) => Math.abs(x - nx) < 150 && Math.abs(y - PANTALLA.nombres.y) < 70);
      if (i < 0) return;
      S.mascotas = {
        ...S.mascotas,
        [id]: { ...fichaMascota(id), nombre: n[i], hechos: [...fichaMascota(id).hechos] },
      };
      save();
      this.elige = null;
      SFX.tada();
      burst(PANTALLA.x, PANTALLA.y - 200, 30);
      say(fmt('¡Se llama {nombre}! ¡Qué nombre tan bonito!', { nombre: tr(n[i]!) }), () => this.saluda!());
      return;
    }
    const b = botones(id).find((k) => dist(x, y, k.x, k.y) < PANTALLA.botones.r + 10);
    if (b) {
      this.cuida!(b.c);
      return;
    }
    if (dist(x, y, PANTALLA.x, PANTALLA.y - 160) < 200) {
      this.anim = { c: 'jugar', t0: T };
      SFX.boing();
      parts.push({
        x: PANTALLA.x,
        y: PANTALLA.y - 300,
        vx: rnd(-20, 20),
        vy: -60,
        life: 1.4,
        t: 0,
        c: '#FF6B8A',
        r: 26,
        rot: 0,
        k: 'h',
        g: 0,
      });
    }
  },
  // cuida(c): hace el cuidado c: animación, sonido y corazones; apunta el cuidado de hoy (cuidar, se guarda) y Tito
  // dice la frase del cuidado; si con él cuenta el día, que ya está feliz; si crece, la fiesta.
  cuida(c: Cuidado) {
    const id = this.id as string,
      r = cuidar(fichaMascota(id), c, today());
    this.anim = { c, t0: T };
    const sonido: Record<Cuidado, () => void> = {
      comer: () => SFX.munch(),
      agua: () => SFX.drip(),
      jugar: () => SFX.boing(),
      lavar: () => SFX.splash(),
      mirar: () => SFX.sparkle(),
    };
    sonido[c]();
    sparkles(PANTALLA.x, PANTALLA.y - 220, 6);
    Array.from({ length: 3 }, (_v, i) => i).forEach((i) =>
      parts.push({
        x: PANTALLA.x + (i - 1) * 80,
        y: PANTALLA.y - 280,
        vx: rnd(-20, 20),
        vy: -70,
        life: 1.6,
        t: 0,
        c: '#FF6B8A',
        r: 24,
        rot: 0,
        k: 'h',
        g: 0,
      }),
    );
    S.mascotas = { ...S.mascotas, [id]: { ...r.ficha, hechos: [...r.ficha.hechos] } };
    save();
    if (r.crece && id !== 'pipo') {
      const e = etapaMascota(r.ficha.dias);
      later(1400, () => {
        this.fiesta = T;
        SFX.tada();
        burst(PANTALLA.x, PANTALLA.y - 250, 60);
        say(
          juntar(
            fmt('¡{Nombre} ha crecido!', { nombre: nombreDe(id) }),
            tr(e === 2 ? '¡Ya es mayor!' : 'Ya no es un bebé.'),
          ),
        );
      });
      say(FRASE_CUIDADO[c]);
      return;
    }
    say(juntar(tr(FRASE_CUIDADO[c]), r.cuenta ? tr('¡Hoy ya está feliz! Mañana, más mimos.') : ''));
  },
};
