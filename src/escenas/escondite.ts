/*
 * escenas/escondite.ts: el escondite del patio (idea 14 de docs/IDEAS-MEJORA.md, fase P13a), la escena SCENES.escondite.
 * Se abre desde su botón del patio (escenas/patio.ts). Tres partes:
 *   1. Tito se tapa los ojos y cuenta hasta diez, despacio (el niño cuenta con él), con el número grande en pantalla.
 *   2. Tito busca a sus amigos, escondidos en los sitios del patio (planEscondite, dominio/escondite.ts): para cada uno
 *      dice una pista de posición («¡Está detrás del árbol!», «debajo del tobogán», «dentro de la casita») y el niño toca
 *      el sitio. Con 3 años se les ve un poco más, con 4 menos y con 5 nada (ESCONDITE.asoma). En otro sitio, Tito dice
 *      que allí no hay nadie y repite la pista. El amigo encontrado sale de un salto y se queda al lado.
 *   3. Se cambian los papeles: el niño toca dónde se esconde Tito y Lupi lo busca, mirando antes en otros sitios
 *      (busquedaLupi), hasta que lo encuentra.
 * Al final, como en los demás juegos del patio, se apunta en S.cole con sus monedas (terminarEnElPatio) y salen el
 * cartel y el botón «Otra vez». La casa vuelve al patio. Practica los conceptos espaciales (detrás, debajo, dentro),
 * contar y la atención.
 * Exporta: ESCONDITE_ST (el estado de la partida, para las pruebas), SITIOS (dónde está cada sitio en la pantalla) y
 * pone SCENES.escondite.
 * Importa: el núcleo (dibujo, voz, toque, Tito), el azar de aplicacion/puertos.ts, las reglas de dominio/escondite.ts,
 * NUM de juegos/comps.ts, el fondo del patio y lo común del patio.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  AGE,
  SCENES,
  SFX,
  T,
  TITO,
  VIVO,
  W,
  atHome,
  card,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  easeOut,
  ell,
  go,
  inCoinHUD,
  later,
  pic,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
  tree,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { ESCONDITE, busquedaLupi, planEscondite, sitioEscondite, type Escondido } from '../dominio/escondite.ts';
import { NUM } from '../juegos/comps.ts';
import { fondoPatio } from './patio.ts';
import { OTRA_VEZ, dibujaFinal, dibujaRondas, enOtraVez, sombra, terminarEnElPatio } from './patioComun.ts';

/** Las fases: Tito explica, cuenta, busca (y acaba de encontrar a uno), el niño esconde a Tito, Lupi busca o se acaba. */
type FaseEscondite = 'intro' | 'cuenta' | 'busca' | 'encontrado' | 'esconde' | 'lupi' | 'fin';
/** Un punto de la pantalla. */
type Punto = { x: number; y: number };
/** Dónde está un sitio en la pantalla: su centro, lo que mide su dibujo y lo que toca. */
interface SitioPantalla extends Punto {
  readonly id: string;
  readonly tam: number;
  readonly r: number;
}

// SITIOS: dónde está cada sitio del patio (los de SITIOS_ESCONDITE) en la pantalla. El árbol es el de tree(), con la
// copa en su centro; el arbusto se dibuja aquí.
export const SITIOS: readonly SitioPantalla[] = [
  { id: 'arbol', x: 330, y: 470, tam: 240, r: 115 },
  { id: 'tobogan', x: 660, y: 560, tam: 230, r: 110 },
  { id: 'casita', x: 1020, y: 470, tam: 230, r: 110 },
  { id: 'arbusto', x: 1360, y: 560, tam: 230, r: 110 },
  { id: 'banco', x: 560, y: 790, tam: 190, r: 95 },
  { id: 'caja', x: 1130, y: 790, tam: 160, r: 85 },
];
// AMIGOS: los dibujos de los amigos que se esconden (hasta cuatro).
const AMIGOS = ['conejo', 'ardilla', 'erizo', 'pinguino'];
// MEDIDAS: cada cuánto dice Tito un número al contar, lo que tarda en ir a esconderse, lo que tarda Lupi de un sitio a
// otro y lo que mira en cada uno, y el tamaño de los amigos.
const MEDIDAS = { paso: 0.9, esconderse: 0.8, lupiVa: 1.1, lupiMira: 1.2, amigo: 100 };
// FRASES_ENCONTRADO: lo que dice Tito al encontrar a un amigo, por turnos.
const FRASES_ENCONTRADO = ['¡Te encontré!', '¡Aquí estás!', '¡Pillado!', '¡Ya te he visto!'];

// ESCONDITE_ST: el estado de la partida: la fase y cuándo empezó, el número que va contando, dónde está cada amigo y a
// cuál busca, los encontrados, dónde se esconde Tito, por dónde busca Lupi (y en qué paso va, desde cuándo, y si ya ha
// dicho lo de ese sitio) y cuándo avisó Tito de un sitio vacío.
export const ESCONDITE_ST = {
  fase: 'intro' as FaseEscondite,
  t0: 0,
  cuenta: 0,
  plan: [] as Escondido[],
  i: 0,
  sitioTito: '',
  ruta: [] as string[],
  paso: 0,
  pasoT: 0,
  dicho: -1,
  aviso: -9,
};

// sigue(): ¿se sigue en la escena del escondite? (para lo que se dice con espera).
const sigue = (): boolean => sceneName === 'escondite';
// sitio(id): dónde está en la pantalla el sitio con ese id.
const sitio = (id: string): SitioPantalla => SITIOS.find((s) => s.id === id) ?? SITIOS[0]!;
// buscado(): el amigo que busca Tito ahora.
const buscado = (): Escondido | undefined => ESCONDITE_ST.plan[ESCONDITE_ST.i];
// pistaDe(e): la pista del sitio donde está el amigo e.
const pistaDe = (e: Escondido | undefined): string => sitioEscondite(e?.sitio ?? '')?.pista ?? '';
// asoma(): cuánto asoman los escondidos con la edad de ahora (de 0 a 1).
const asoma = (): number => ESCONDITE.asoma[Math.min(5, Math.max(3, AGE()))] ?? 0.3;
// mezcla(a, b, k): el punto que hay de a a b en la parte k (de 0 a 1).
const mezcla = (a: Punto, b: Punto, k: number): Punto => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
// enSitio(x, y): el sitio que hay en (x, y), o undefined.
const enSitio = (x: number, y: number): SitioPantalla | undefined => SITIOS.find((s) => dist(x, y, s.x, s.y) < s.r);
// pieTito: dónde tiene los pies Tito al contar (en su sitio de siempre, abajo a la izquierda).
const pieTito = (): Punto => ({ x: TITO.x + TITO.w / 2, y: TITO.y + (TITO.w * 200) / 240 });

// buscar(): Tito busca al amigo de ahora: dice su pista.
function buscar(): void {
  Object.assign(ESCONDITE_ST, { fase: 'busca', t0: T });
  say(pistaDe(buscado()));
}

// tocarBusca(s): mientras Tito busca, se ha tocado el sitio s: si está allí el amigo, sale y se busca al siguiente (o
// empieza la segunda parte); si no, Tito dice que allí no hay nadie y repite la pista (como mucho cada 2,5 segundos).
function tocarBusca(s: SitioPantalla): void {
  const st = ESCONDITE_ST,
    e = buscado();
  if (!e) return;
  if (e.sitio !== s.id) {
    SFX.boing();
    if (T - st.aviso > 2.5) {
      st.aviso = T;
      sayQ('¡Aquí no hay nadie!', () => {
        if (sigue() && st.fase === 'busca') say(pistaDe(buscado()));
      });
    }
    return;
  }
  SFX.good();
  sparkles(s.x, s.y - 40, 14);
  Object.assign(st, { fase: 'encontrado', t0: T, i: st.i + 1 });
  if (st.i < st.plan.length) {
    sayQ(FRASES_ENCONTRADO[(st.i - 1) % FRASES_ENCONTRADO.length] ?? '¡Te encontré!', () => {
      if (sigue() && st.fase === 'encontrado') later(300, buscar);
    });
    return;
  }
  sayQ('¡Os he encontrado a todos! Ahora me escondo yo. Toca dónde quieres que me esconda.', () => {
    if (sigue() && st.fase === 'encontrado') Object.assign(st, { fase: 'esconde', t0: T });
  });
}

// esconderTito(s): el niño ha elegido el sitio s para Tito: Tito va allí y Lupi empieza a buscar (por busquedaLupi).
function esconderTito(s: SitioPantalla): void {
  const st = ESCONDITE_ST;
  SFX.whoosh();
  Object.assign(st, { fase: 'lupi', t0: T, sitioTito: s.id, ruta: busquedaLupi(s.id, azar), paso: -1, dicho: -1 });
  sayQ('¡Chis! Lupi cuenta y viene a buscarme.', () => {
    if (sigue() && st.fase === 'lupi') Object.assign(st, { paso: 0, pasoT: T });
  });
}

// lupiAvanza(): Lupi va de sitio en sitio; al llegar a cada uno mira (y dice si está o no) y, después de mirar, va al
// siguiente; en el de Tito lo encuentra y se acaba.
function lupiAvanza(): void {
  const st = ESCONDITE_ST;
  if (st.paso < 0 || T - st.pasoT < MEDIDAS.lupiVa) return;
  const ultimo = st.paso >= st.ruta.length - 1;
  if (st.dicho !== st.paso) {
    st.dicho = st.paso;
    if (ultimo) {
      SFX.good();
      const s = sitio(st.sitioTito);
      sparkles(s.x, s.y - 40, 16);
      later(1500, () => {
        if (sigue() && st.fase === 'lupi') acabar();
      });
      say('¡Lupi me ha encontrado!');
      return;
    }
    say('¿Estará aquí? ¡No!');
  }
  if (!ultimo && T - st.pasoT > MEDIDAS.lupiVa + MEDIDAS.lupiMira) Object.assign(st, { paso: st.paso + 1, pasoT: T });
}

// acabar(): se ha jugado todo: se apunta en S.cole con sus monedas y Tito se despide.
function acabar(): void {
  ESCONDITE_ST.fase = 'fin';
  terminarEnElPatio('escondite', W / 2, 400);
  say('¡Qué bien nos lo hemos pasado jugando al escondite! ¿Jugamos otra vez?');
}

// dibujaArbusto(s): el arbusto, unas bolas verdes juntas.
function dibujaArbusto(s: SitioPantalla): void {
  const k = s.tam / 230;
  [
    [-70, 20, 70],
    [70, 20, 70],
    [0, -20, 85],
    [-30, 40, 60],
    [40, 45, 60],
  ].forEach(([dx, dy, r]) =>
    ell(s.x + (dx ?? 0) * k, s.y + (dy ?? 0) * k, (r ?? 60) * k, (r ?? 60) * 0.85 * k, '#5FA84E', 5),
  );
}

// dibujaSitio(s): el dibujo de un sitio: el árbol con tree(), el arbusto aquí y lo demás con su dibujo.
function dibujaSitio(s: SitioPantalla): void {
  const d = sitioEscondite(s.id)?.dibujo ?? '';
  if (d === 'arbol') {
    tree(s.x, s.y + 96, 1.2, 'verano');
    return;
  }
  if (d === 'arbusto') {
    dibujaArbusto(s);
    return;
  }
  sombra(s.x, s.y + s.tam * 0.42, s.tam * 0.35);
  pic(d, s.x, s.y, s.tam);
}

// asomando(s, cuanto): dónde se dibuja alguien escondido en el sitio s, asomando cuanto (de 0 a 1): por arriba si está
// dentro, por un lado si está detrás o debajo.
function asomando(s: SitioPantalla, cuanto: number): Punto {
  if (sitioEscondite(s.id)?.posicion === 'dentro') return { x: s.x, y: s.y - s.tam * 0.55 * cuanto };
  return { x: s.x + s.tam * 0.55 * cuanto, y: s.y + s.tam * 0.1 };
}

// dibujaEscondidos(): antes que los sitios (para que los tapen), los amigos que aún no se han encontrado, asomando lo
// de su edad, y Tito escondido en la última parte (asoma un poco, para que el niño sepa dónde está).
function dibujaEscondidos(): void {
  const st = ESCONDITE_ST,
    a = asoma();
  if (a > 0 && (st.fase === 'busca' || st.fase === 'encontrado' || st.fase === 'cuenta'))
    st.plan.slice(st.i).forEach((e) => {
      const p = asomando(sitio(e.sitio), a);
      pic(AMIGOS[e.amigo % AMIGOS.length] ?? 'conejo', p.x, p.y, MEDIDAS.amigo);
    });
  if (st.fase === 'lupi' && st.sitioTito) {
    const k = easeOut(Math.min(1, (T - st.t0) / MEDIDAS.esconderse)),
      p = mezcla({ x: pieTito().x, y: pieTito().y - 90 }, asomando(sitio(st.sitioTito), 0.35), k);
    drawTito(p.x - 65, p.y - 55, 130, { bubble: false });
  }
}

// dibujaEncontrados(): los amigos ya encontrados, de pie al lado de su sitio (el último sale de un salto).
function dibujaEncontrados(): void {
  const st = ESCONDITE_ST;
  st.plan.slice(0, st.i).forEach((e, j) => {
    const s = sitio(e.sitio),
      salto =
        j === st.i - 1 && st.fase === 'encontrado'
          ? Math.max(0, Math.sin(Math.min(1, (T - st.t0) / 0.5) * Math.PI)) * 60
          : 0,
      x = s.x + s.r * 0.9,
      y = s.y + s.tam * 0.3;
    sombra(x, y + 45, 30);
    pic(AMIGOS[e.amigo % AMIGOS.length] ?? 'conejo', x, y - salto, MEDIDAS.amigo * 0.9);
  });
}

// dibujaLupi(): Lupi, que va de sitio en sitio buscando a Tito.
function dibujaLupi(): void {
  const st = ESCONDITE_ST;
  if (st.fase !== 'lupi' || st.paso < 0) return;
  const desde = st.paso === 0 ? { x: W / 2, y: 880 } : sitio(st.ruta[st.paso - 1] ?? ''),
    hasta = sitio(st.ruta[st.paso] ?? ''),
    k = easeOut(Math.min(1, (T - st.pasoT) / MEDIDAS.lupiVa)),
    p = mezcla({ x: desde.x - 90, y: desde.y + 60 }, { x: hasta.x - 90, y: hasta.y + 60 }, k);
  sombra(p.x, p.y + 50, 40);
  pic('lupi', p.x, p.y - Math.abs(Math.sin(T * 8)) * (k < 1 ? 14 : 0), 120);
}

// dibujaTito(): Tito en su sitio: contando con los ojos tapados (dormido) o buscando; cuando se esconde, ya no (lo
// dibuja dibujaEscondidos).
function dibujaTito(): void {
  const f = ESCONDITE_ST.fase;
  if (f === 'lupi' || f === 'fin') return;
  drawTito(TITO.x, TITO.y, TITO.w, { sleep: f === 'cuenta', bubble: false });
}

SCENES['escondite'] = {
  music: 'jardin',
  // enter(): una partida nueva con sus amigos escondidos (planEscondite); Tito lo explica y empieza a contar.
  enter(_o: OpcionesEscena) {
    Object.assign(ESCONDITE_ST, { fase: 'intro', t0: T, cuenta: 0, plan: planEscondite(AGE(), azar), i: 0 });
    Object.assign(ESCONDITE_ST, { sitioTito: '', ruta: [], paso: -1, pasoT: 0, dicho: -1, aviso: -9 });
    later(400, () =>
      sayQ('¡Vamos a jugar al escondite! Mis amigos se esconden y yo cuento hasta diez. Cuenta conmigo.', () => {
        if (sigue()) Object.assign(ESCONDITE_ST, { fase: 'cuenta', t0: T, cuenta: 0 });
      }),
    );
  },
  // update(): al contar, un número cada MEDIDAS.paso segundos y, al llegar a diez, a buscar; con Lupi, su búsqueda. La
  // ayuda automática no sale mientras Tito explica, cuenta o Lupi busca.
  update() {
    const st = ESCONDITE_ST;
    if (st.fase !== 'busca' && st.fase !== 'esconde' && st.fase !== 'fin') VIVO.idle = 0;
    if (st.fase === 'lupi') lupiAvanza();
    if (st.fase !== 'cuenta' || T - st.t0 < (st.cuenta + 1) * MEDIDAS.paso) return;
    st.cuenta++;
    say(NUM[st.cuenta] ?? String(st.cuenta));
    if (st.cuenta < ESCONDITE.cuenta) return;
    st.fase = 'intro';
    later(800, () =>
      sayQ('¡Allá voy! ¿Dónde se habrán escondido?', () => {
        if (sigue()) buscar();
      }),
    );
  },
  // prompt(): repite lo que toca.
  prompt() {
    const f = ESCONDITE_ST.fase;
    if (f === 'fin') say('Toca la flecha para jugar otra vez.');
    else if (f === 'busca') say(pistaDe(buscado()));
    else if (f === 'esconde') say('Toca dónde quieres que me esconda.');
  },
  // hint(): mientras busca, el sitio del amigo; para esconder a Tito, la casita; al final, el botón de otra vez.
  hint() {
    const st = ESCONDITE_ST;
    if (st.fase === 'fin') return { x: OTRA_VEZ.x, y: OTRA_VEZ.y, r: OTRA_VEZ.r };
    if (st.fase === 'esconde') {
      const s = sitio('casita');
      return { x: s.x, y: s.y, r: s.r };
    }
    const e = buscado();
    if (st.fase !== 'busca' || !e) return null;
    const s = sitio(e.sitio);
    return { x: s.x, y: s.y, r: s.r };
  },
  // dwell(id): dice qué es el botón de otra vez.
  dwell(id: string) {
    if (id === 'otraVez') say('Otra vez.');
  },
  // draw(): el patio, los escondidos (antes, para que los tapen los sitios), los sitios, los encontrados, Lupi, Tito,
  // el número al contar o el amigo que se busca, los encontrados arriba y, al final, el botón de otra vez.
  draw() {
    fondoPatio();
    const st = ESCONDITE_ST,
      e = buscado();
    dibujaEscondidos();
    SITIOS.forEach(dibujaSitio);
    dibujaEncontrados();
    dibujaLupi();
    dibujaTito();
    dibujaRondas(st.plan.length, st.i);
    if (st.fase === 'cuenta' && st.cuenta > 0) {
      card(W / 2 - 80, 110, 160, 130, '#fff', 6, 40);
      text(st.cuenta, W / 2, 210, 96);
    } else if (st.fase === 'busca' && e) {
      card(W / 2 - 110, 110, 220, 120, '#fff', 6, 40);
      pic(AMIGOS[e.amigo % AMIGOS.length] ?? 'conejo', W / 2 - 40, 170, 90);
      text('?', W / 2 + 55, 200, 80, '#E07BB5');
    } else if (st.fase !== 'fin') {
      card(W / 2 - 200, 120, 400, 70, '#fff', 6, 35);
      text('El escondite', W / 2, 170, 40);
    }
    if (st.fase === 'fin') dibujaFinal();
    drawHome();
    drawCoinHUD();
  },
  // down(x, y): casa -> el patio; monedas -> tienda; al final, otra vez; mientras Tito busca, un sitio; para esconder a
  // Tito, un sitio; si no, chispas.
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
    const st = ESCONDITE_ST;
    if (st.fase === 'fin' && enOtraVez(x, y)) {
      SFX.pop();
      this.enter!({});
      return;
    }
    const s = enSitio(x, y);
    if (s && st.fase === 'busca') {
      tocarBusca(s);
      return;
    }
    if (s && st.fase === 'esconde') {
      esconderTito(s);
      return;
    }
    SFX.tap();
    sparkles(x, y);
  },
};
