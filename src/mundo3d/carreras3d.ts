/*
 * mundo3d/carreras3d.ts: las carreras de Tito en el patio del cole, en 3D (idea 10 y base B3 de docs/IDEAS-MEJORA.md,
 * fase P10). Es la escena SCENES.carreras, que se abre desde el patio (escenas/patio.ts). El patio 3D: césped, una
 * pista roja con sus calles y sus rayas, la salida, el arco de la meta con banderas, árboles y arbustos a los lados. En
 * la pista corren Tito (el de siempre, en 3D) y sus amigos Polly y Lupi (recortables de sus dibujos) y Pipo, si ya ha
 * salido del huevo. La cámara va detrás de Tito.
 * Cómo se juega (las reglas, en dominio/carreras.ts): tras «Preparados, listos... ¡ya!», todos corren solos; el niño
 * toca la pantalla para que Tito salte los charcos y las piedras (si no salta, tropieza y va más despacio un momento) y
 * coja las estrellas de arriba. Desde los 4 años hay un cruce: la carrera se para y se elige izquierda o derecha (por un
 * lado hay más estrellas). A los 5 años, los números del 1 al 5 flotan sobre la pista, en orden, para cogerlos
 * saltando. Al llegar todos, el podio dice el lugar de cada uno con los ordinales y todos tienen medalla; la primera vez
 * de cada día da 3 monedas (terminarEnElPatio de escenas/patioComun.ts, apuntado en S.cole).
 * montarCarreras3D() la llama mundo3d/mundo3d.ts al montar la capa 3D: sin WebGL no hay escena y el patio enseña las
 * carreras como «¡Muy pronto!».
 * Exporta: montarCarreras3D y, para las pruebas, CALLES (dónde corre cada uno) y LADOS (los botones del cruce).
 * Importa: del núcleo lo que dibuja, suena y habla; la edad y Pipo de escenas/zonas.ts; lo común del patio de
 * escenas/patioComun.ts; las reglas de dominio/carreras.ts; el motor, las piezas, el decorado y los personajes 3D.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas de la pista y de la cámara y las posiciones en la pantalla
   de 1600x900 son el dibujo mismo. */
import * as THREE from 'three';
import type { Escena, OpcionesEscena } from '../nucleo/tipos.ts';
import type { Mundo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  AGE,
  PI,
  SCENES,
  SFX,
  T,
  W,
  atHome,
  burst,
  card,
  circ,
  ctx,
  drawHome,
  drawTito,
  go,
  hC,
  hv,
  kid,
  later,
  pic,
  say,
  sayQ,
  sceneName,
  sparkles,
  star,
  text,
} from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';
import { drawPet, petStage } from '../escenas/zonas.ts';
import { dibujaFinal, enOtraVez, terminarEnElPatio } from '../escenas/patioComun.ts';
import {
  CARRERA,
  CORREDORES,
  type Corredor,
  type PlanCarrera,
  type Premio,
  choca,
  enElAire,
  fraseLugar,
  planCarrera,
  podio,
  velocidad,
} from '../dominio/carreras.ts';
import { camRig, newWorld, setWorld } from './motor.ts';
import { Box, Cyl, V3, grp, mk, picTex, pillTex, plane, spr } from './materiales.ts';
import { bush3, tree3 } from './decorado.ts';
import { flag3 } from './objetos.ts';
import { makePipo, makeTito } from './personajes.ts';

// CALLES: la x de la calle de cada corredor (Tito, en el centro, con la cámara detrás).
export const CALLES: Readonly<Record<string, number>> = { tito: 0, polly: -3.2, lupi: 3.2, pipo: -6.4 };
// LADOS: los dos botones del cruce (centro y radio en la pantalla): izquierda y derecha.
export const LADOS = {
  izquierda: { x: 330, y: 560, r: 130 },
  derecha: { x: 1270, y: 560, r: 130 },
} as const;
// Lo ancho del cruce: hacia qué x va Tito por cada camino (dentro de su calle).
const DESVIO = 1.05;
// Altura del salto de Tito y a qué altura flotan las cosas de arriba.
const ALTO_SALTO = 2.1,
  ALTO_PREMIO = 2.6;
// COLOR: el color de cada corredor en la barra de la carrera.
const COLOR: Readonly<Record<string, string>> = { tito: '#7CC86E', polly: '#5BB8E6', lupi: '#FFA94D', pipo: '#9B8AD9' };

/** Lo que pasa en la carrera: la fase, el reloj (sin contar el cruce), el plan, por dónde va cada uno, cuándo saltó y
 * tropezó Tito, lo que se ha cogido, el lado del cruce elegido y las llegadas. */
interface EstadoCarrera {
  fase: 'salida' | 'corre' | 'cruce' | 'podio' | 'fin';
  reloj: number;
  plan: PlanCarrera;
  corren: readonly Corredor[];
  d: Record<string, number>;
  llegadas: Record<string, number>;
  salto: number | null;
  tropiezo: number | null;
  vistos: Set<number>;
  cogidos: Set<Premio>;
  estrellas: number;
  numeros: number[];
  tropiezos: number;
  lado: 'izquierda' | 'derecha' | null;
  orden: string[];
}

// estadoNuevo(): una carrera nueva con el plan para la edad del niño; Pipo corre solo si ya ha salido del huevo.
function estadoNuevo(): EstadoCarrera {
  const corren = CORREDORES.filter((c) => c.id !== 'pipo' || petStage() >= 2);
  return {
    fase: 'salida',
    reloj: 0,
    plan: planCarrera(AGE(), azar),
    corren,
    d: Object.fromEntries(corren.map((c) => [c.id, 0])),
    llegadas: {},
    salto: null,
    tropiezo: null,
    vistos: new Set(),
    cogidos: new Set(),
    estrellas: 0,
    numeros: [],
    tropiezos: 0,
    lado: null,
    orden: [],
  };
}

// xPremio(p, cruce): la x de un premio: en el centro de la calle de Tito, o en su camino si está en el cruce.
function xPremio(p: Premio): number {
  if (!p.lado) return 0;
  return p.lado === 'izquierda' ? -DESVIO : DESVIO;
}

// pista(w, plan): el patio 3D: el césped, la pista con sus calles, la salida, la meta con su arco y sus banderas, los
// obstáculos y lo que se coge (cada cosa guarda su premio en userData.premio para esconderla al cogerla), y árboles y
// arbustos a los lados. Devuelve los grupos de los premios.
function pista(w: Mundo, plan: PlanCarrera): THREE.Object3D[] {
  const L = plan.largo;
  mk(Box(80, 0.4, L + 90), '#9DD67E', { p: [0, -0.2, -L / 2], to: w.sc, ol: 0 });
  mk(Box(15, 0.06, L + 30), '#E0785A', { p: [0, 0.03, -L / 2 + 5], to: w.sc, ol: 0 });
  [-7.5, -4.8, -1.6, 1.6, 4.8, 7.5].forEach((x) =>
    mk(Box(0.12, 0.02, L + 30), '#FFFFFF', { p: [x, 0.07, -L / 2 + 5], to: w.sc, ol: 0 }),
  );
  mk(Box(15, 0.02, 0.5), '#FFFFFF', { p: [0, 0.08, 0.8], to: w.sc, ol: 0 });
  // la meta: la raya de cuadros y el arco con el cartel
  Array.from({ length: 15 }, (_, i) => i).forEach((i) =>
    mk(Box(1, 0.02, 0.6), i % 2 ? '#222222' : '#FFFFFF', { p: [-7 + i, 0.08, -L], to: w.sc, ol: 0 }),
  );
  [-7.8, 7.8].forEach((x) => mk(Cyl(0.25, 0.25, 6, 10), '#FFFFFF', { p: [x, 3, -L], to: w.sc, ol: 0.03 }));
  mk(Box(16, 1.2, 0.3), '#FF8A7A', { p: [0, 6, -L], to: w.sc, ol: 0.04 });
  spr(pillTex('META', '#FFD66B', K, 70), 6, 1.5, { p: [0, 6, -L + 0.3], to: w.sc });
  [-10, 10].forEach((x) => flag3(w, x, -L, 1.2));
  // el cruce: un cartel con las dos flechas y la isleta de hierba entre los dos caminos
  if (plan.cruce) {
    const c = plan.cruce;
    mk(Box(0.9, 0.08, c.fin - c.d - 4), '#9DD67E', { p: [0, 0.06, -(c.d + c.fin) / 2], to: w.sc, ol: 0 });
    spr(pillTex('⬅  ➡', '#fff', K, 64), 3, 0.75, { p: [0, 3.4, -c.d + 1], to: w.sc });
    mk(Cyl(0.08, 0.08, 3, 8), '#E8E8EE', { p: [0, 1.5, -c.d + 1], to: w.sc, ol: 0.02 });
  }
  plan.obstaculos.forEach((o) => {
    if (o.tipo === 'charco') {
      const m = mk(Cyl(1, 1, 0.05, 24), '#5BB8E6', { p: [0, 0.08, -o.d], to: w.sc, ol: 0 });
      m.scale.set(1, 1, 0.6);
    } else
      mk(new THREE.DodecahedronGeometry(0.55), '#B9B2A8', { p: [0, 0.4, -o.d], s: [1.2, 0.8, 1], to: w.sc, ol: 0.05 });
  });
  const premios = plan.premios.map((p) => {
    const g = grp(w.sc, [xPremio(p), p.arriba ? ALTO_PREMIO : 0.9, -p.d]);
    if (p.tipo === 'numero') spr(pillTex(String(p.n), '#5BB8E6', '#fff', 90), 2.4, 0.6, { to: g });
    else spr(picTex('estrella', 128), 0.9, 0.9, { to: g });
    g.userData.premio = p;
    return g;
  });
  // a los lados: árboles y arbustos cada pocos pasos
  Array.from({ length: Math.ceil((L + 40) / 14) }, (_, i) => 10 - i * 14).forEach((z, i) => {
    tree3(w.sc, -11 - (i % 3), z, 1.3, i % 2 ? 'verano' : 'primavera');
    tree3(w.sc, 11 + (i % 2), z - 7, 1.3, i % 2 ? 'primavera' : 'verano');
    bush3(w.sc, -9, z - 4, 1);
    bush3(w.sc, 9.2, z - 10, 1, '#8ED67A');
  });
  return premios;
}

// recortable(w, k): un amigo recortable (el dibujo k en cartón, de pie) en un grupo, para que corra por su calle.
function recortable(w: Mundo, k: string): THREE.Group {
  const g = grp(w.sc, [0, 0, 0]);
  plane(picTex(k, 256), 2.2, 2.2, { to: g, p: [0, 1.15, 0], ds: true });
  return g;
}

// construye(st): el mundo de la carrera (sin sombras reales): la pista con el plan, Tito y sus amigos en la salida y la cámara detrás de
// Tito. En cada cuadro (si la escena sigue siendo esta) avanza la carrera (avanza) y coloca a cada uno y la cámara.
function construye(st: Escena) {
  const e = st.c as EstadoCarrera,
    w = newWorld({ fov: 50, bg: '#BFE9F8', fog: [40, 110], kind: 'carreras', shadow: 16 });
  // sin sombras reales (como la casa 3D de prueba): la pista es larga y pesaría en los móviles
  w.sun!.castShadow = false;
  Object.assign(st, { premios: pista(w, e.plan) });
  const tito = makeTito();
  tito.scale.setScalar(0.75);
  tito.rotation.y = PI / 2;
  w.sc.add(tito);
  w.tito = tito;
  const amigos: Record<string, THREE.Group> = Object.fromEntries(
    e.corren
      .filter((c) => c.id !== 'tito')
      .map((c) => {
        if (c.id !== 'pipo') return [c.id, recortable(w, c.id)];
        const p = makePipo(petStage());
        p.scale.setScalar(0.7);
        p.rotation.y = PI;
        w.sc.add(p);
        return [c.id, p];
      }),
  );
  Object.assign(st, { amigos });
  w.upd.push((dt: number) => {
    if (sceneName !== 'carreras') return;
    avanza(st, dt);
    const enAire = enElAire(e.reloj, e.salto),
      k = enAire && e.salto !== null ? (e.reloj - e.salto) / CARRERA.salto : 0,
      dT = e.d.tito ?? 0,
      corre = e.fase === 'corre' || (e.fase !== 'cruce' && e.llegadas.tito === undefined && e.fase !== 'salida');
    tito.position.set(xTito(e), enAire ? Math.sin(k * PI) * ALTO_SALTO : 0, -dT);
    tito.rotation.z =
      e.tropiezo !== null && e.reloj - e.tropiezo < 0.4 ? Math.sin((e.reloj - e.tropiezo) * 30) * 0.2 : 0;
    tito.userData.anim(dt, { walk: corre ? 1 : 0, hop: st.hop });
    Object.entries(amigos).forEach(([id, g], i) => {
      const d = e.d[id] ?? 0,
        llegado = e.llegadas[id] !== undefined;
      g.position.set(CALLES[id] ?? 0, llegado ? 0 : Math.abs(Math.sin(T * 9 + i)) * 0.35, -d);
    });
    // la cámara, detrás de Tito y un poco por encima (sin retraso: se pone donde toca en cada cuadro)
    const cam = V3(xTito(e) * 0.5, 5.2, -dT + 10.5),
      mira = V3(xTito(e) * 0.4, 1.6, -dT - 9);
    w.camT = { pos: cam, look: mira };
    w.cam.position.copy(cam);
    w.camL = mira.clone();
    // los premios giran; los cogidos se esconden
    (st.premios as THREE.Object3D[]).forEach((g, i) => {
      Object.assign(g, { visible: !e.cogidos.has(g.userData.premio) });
      g.position.setY((g.userData.premio.arriba ? ALTO_PREMIO : 0.9) + Math.sin(T * 3 + i) * 0.12);
    });
  });
  camRig(w, V3(0, 5.2, 10.5), V3(0, 1.6, -9), 0);
  return w;
}

// xTito(e): la x de Tito: en el centro de su calle, o por el camino que ha elegido mientras dura el cruce.
function xTito(e: EstadoCarrera): number {
  const c = e.plan.cruce,
    d = e.d.tito ?? 0;
  if (!c || !e.lado || d < c.d || d > c.fin) return 0;
  const s = e.lado === 'izquierda' ? -DESVIO : DESVIO,
    entra = Math.min(1, (d - c.d) / 3),
    sale = Math.min(1, (c.fin - d) / 3);
  return s * Math.min(entra, sale);
}

// avanza(st, dt): un paso de la carrera (si está corriendo): avanza el reloj y a cada corredor según su velocidad (la
// de Tito, más despacio si está tropezando); mira lo que pisa Tito (obstáculos y premios), si llega al cruce y quién
// llega a la meta. Cuando han llegado todos, el podio.
function avanza(st: Escena, dt: number) {
  const e = st.c as EstadoCarrera;
  if (e.fase !== 'corre') return;
  e.reloj += dt;
  e.corren.forEach((c) => {
    if (e.llegadas[c.id] !== undefined) return;
    const v = c.id === 'tito' ? velocidad(c.vel, e.reloj, e.tropiezo) : c.vel,
      d = Math.min(e.plan.largo, (e.d[c.id] ?? 0) + v * dt);
    e.d[c.id] = d;
    if (d >= e.plan.largo) {
      e.llegadas[c.id] = e.reloj;
      if (c.id === 'tito') {
        SFX.tada();
        burst(800, 420, 40);
        say('¡Meta!');
      }
    }
  });
  const dT = e.d.tito ?? 0,
    aire = enElAire(e.reloj, e.salto);
  e.plan.obstaculos.forEach((o, i) => {
    if (e.vistos.has(i) || !choca(dT, o)) return;
    if (aire) return;
    e.vistos.add(i);
    e.tropiezo = e.reloj;
    e.tropiezos++;
    SFX.boing();
  });
  e.plan.premios.forEach((p) => {
    if (e.cogidos.has(p) || !choca(dT, p) || p.arriba !== aire) return;
    if (p.lado && p.lado !== e.lado) return;
    e.cogidos.add(p);
    if (p.tipo === 'numero') {
      e.numeros = [...e.numeros, p.n ?? 0];
      SFX.good();
      sparkles(800, 300, 10);
    } else {
      e.estrellas++;
      SFX.pop();
      sparkles(800, 360, 6);
    }
  });
  const c = e.plan.cruce;
  if (c && !e.lado && dT >= c.d - 3) {
    e.fase = 'cruce';
    say(`¡Un cruce! ¿Vamos por la izquierda o por la derecha? Las estrellas están a la ${c.bueno}.`);
  }
  if (e.corren.every((x) => e.llegadas[x.id] !== undefined)) acabar(st);
}

// elegir(st, lado): en el cruce, Tito va por el lado elegido y la carrera sigue.
function elegir(st: Escena, lado: 'izquierda' | 'derecha') {
  const e = st.c as EstadoCarrera;
  e.lado = lado;
  e.fase = 'corre';
  SFX.whoosh();
  say(lado === 'izquierda' ? '¡Por la izquierda!' : '¡Por la derecha!');
}

// fraseNumeros(e): lo que dice Tito de los números cogidos (solo a los 5 años, cuando hay números; si no, '').
function fraseNumeros(e: EstadoCarrera): string {
  if (!e.plan.numeros) return '';
  if (e.numeros.length === 5) return ' ¡Y has cogido todos los números, del uno al cinco!';
  return ` Has cogido ${e.numeros.length === 1 ? 'un número' : e.numeros.length + ' números'}.`;
}

// acabar(st): han llegado todos (desde la fase P11, si la carrera es del gran día del deporte, st.deporte, al acabar
// se vuelve a la jornada con los puntos en vez de dar las monedas aquí): el podio, que Tito cuenta con los ordinales; todos tienen medalla. Luego, lo que ha
// cogido el niño, las monedas (la primera vez de hoy) y el botón de otra vez.
function acabar(st: Escena) {
  const e = st.c as EstadoCarrera;
  e.fase = 'podio';
  e.orden = podio(
    e.corren.map((c) => c.id),
    e.llegadas,
  );
  const cogido = fraseNumeros(e);
  later(900, () =>
    sayQ(fraseLugar(e.orden) + ' ¡Todos tenemos medalla!', () => {
      if (sceneName !== 'carreras') return;
      sayQ(`Has cogido ${e.estrellas === 1 ? 'una estrella' : e.estrellas + ' estrellas'}${kid()}.${cogido}`, () => {
        if (sceneName !== 'carreras') return;
        // en el gran día del deporte (fase P11), se vuelve a la jornada con los puntos: 4 menos el lugar de Tito
        if (st.deporte) {
          go('deporte', { prueba: 'carrera', puntos: 4 - (e.orden.indexOf('tito') + 1) });
          return;
        }
        e.fase = 'fin';
        terminarEnElPatio('carreras', 800, 450);
      });
    }),
  );
}

// empezar(st): una carrera nueva: el plan, el mundo y la cuenta atrás («Preparados, listos... ¡ya!»).
function empezar(st: Escena) {
  const e = estadoNuevo();
  Object.assign(st, { c: e, hop: null });
  setWorld(construye(st));
  sayQ('Preparados, listos...', () => {
    if (sceneName !== 'carreras' || st.c !== e) return;
    SFX.whoosh();
    e.fase = 'corre';
    say('¡Ya!');
  });
}

// cabeza(id, x, y, s): la cara pequeña de un corredor en la barra de la carrera y en el podio.
function cabeza(id: string, x: number, y: number, s: number) {
  if (id === 'tito') drawTito(x - s * 0.6, y - s * 0.55, s * 1.2);
  else if (id === 'pipo') drawPet(x, y + s * 0.5, s);
  else pic(id, x, y, s);
}

// dibujaBarra(e): arriba, la barra de la carrera: de la salida a la meta, con un punto de color por corredor.
function dibujaBarra(e: EstadoCarrera) {
  card(380, 28, 840, 60, 'rgba(255,255,255,.92)', 5, 30);
  ctx.fillStyle = '#E0785A';
  ctx.fillRect(420, 54, 720, 8);
  star(1170, 58, 20, '#FFD66B', 4);
  e.corren.forEach((c) =>
    circ(420 + ((e.d[c.id] ?? 0) / e.plan.largo) * 720, 58, c.id === 'tito' ? 17 : 13, COLOR[c.id] ?? '#fff', 4),
  );
}

// dibujaCogido(e): a la derecha, las estrellas cogidas; a los 5 años, los cinco números (llenos los cogidos).
function dibujaCogido(e: EstadoCarrera) {
  card(1300, 110, 260, 80, 'rgba(255,255,255,.92)', 5, 30);
  star(1350, 150, 26, '#FFC93C', 4);
  text('× ' + e.estrellas, 1450, 166, 44);
  if (!e.plan.numeros) return;
  [1, 2, 3, 4, 5].forEach((n, i) => {
    const x = 1300 + i * 52 + 26,
      si = e.numeros.includes(n);
    circ(x, 240, 23, si ? '#5BB8E6' : '#fff', 4);
    text(String(n), x, 252, 30, si ? '#fff' : '#C9C2B8');
  });
}

// dibujaCruce(): los dos botones del cruce, con su flecha y su palabra (crecen bajo el ratón).
function dibujaCruce() {
  (['izquierda', 'derecha'] as const).forEach((lado) => {
    const b = LADOS[lado],
      s = hv('carrera:' + lado, hC(b.x, b.y, b.r));
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(s, s);
    circ(0, 0, b.r, '#FFD66B', 7);
    ctx.beginPath();
    const dir = lado === 'izquierda' ? -1 : 1;
    ctx.moveTo(-50 * dir, -22);
    ctx.lineTo(10 * dir, -22);
    ctx.lineTo(10 * dir, -55);
    ctx.lineTo(62 * dir, 0);
    ctx.lineTo(10 * dir, 55);
    ctx.lineTo(10 * dir, 22);
    ctx.lineTo(-50 * dir, 22);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = K;
    ctx.stroke();
    ctx.restore();
    text(lado, b.x, b.y + b.r + 50, 40, K, { st: 6, sc: '#fff' });
  });
}

// dibujaPodio(e): el podio: los cajones del primero (en medio, el más alto), el segundo y el tercero, y el cuarto al
// otro lado del botón de otra vez (que sale al final, en OTRA_VEZ de escenas/patioComun.ts); cada uno con su corredor, su número y una medalla (oro, plata, bronce y la del cuarto, azul).
function dibujaPodio(e: EstadoCarrera) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.fillRect(0, 0, W, 900);
  ctx.restore();
  const sitios = [
      { x: 560, h: 230 },
      { x: 330, h: 170 },
      { x: 790, h: 120 },
      { x: 1320, h: 70 },
    ],
    medallas = ['#FFC93C', '#D9DEE6', '#E09A5B', '#7FB8F0'];
  e.orden.forEach((id, i) => {
    const s = sitios[i],
      base = 820;
    if (!s) return;
    card(s.x - 100, base - s.h, 200, s.h, ['#FF8A7A', '#5BB8E6', '#7CC86E', '#9B8AD9'][i] ?? '#fff', 6, 18);
    text(String(i + 1), s.x, base - s.h + 70, 64, '#fff', { st: 6, sc: 'rgba(0,0,0,.25)' });
    cabeza(id, s.x, base - s.h - 80 - Math.abs(Math.sin(T * 4 + i)) * 10, 130);
    circ(s.x + 70, base - s.h - 40, 26, medallas[i] ?? '#fff', 5);
  });
}

// montarCarreras3D(): pone la escena SCENES.carreras. La llama mundo3d/mundo3d.ts al montar la capa 3D. Estado de la
// escena: c (la carrera, EstadoCarrera), premios y amigos (los grupos 3D) y hop (cuándo se tocó a Tito).
export function montarCarreras3D(): void {
  SCENES.carreras = {
    three: true,
    music: 'jardin',
    // enter(o): una carrera nueva; Tito explica cómo se juega y empieza la cuenta atrás. Con o.deporte (fase P11), es
    // la primera prueba del gran día del deporte: al acabar y con la casa se vuelve a la jornada (SCENES.deporte).
    enter(o: OpcionesEscena) {
      const edad = AGE();
      this.deporte = !!o.deporte;
      later(300, () =>
        sayQ(
          '¡Vamos a hacer una carrera! Toca la pantalla para que Tito salte los charcos y las piedras.' +
            (edad >= 5 ? ' ¡Y coge los números del uno al cinco, saltando!' : ''),
          () => {
            if (sceneName === 'carreras') empezar(this);
          },
        ),
      );
      Object.assign(this, { c: estadoNuevo(), hop: null });
      setWorld(construye(this));
    },
    // prompt(): la consigna, según la fase.
    prompt() {
      const e = this.c as EstadoCarrera;
      if (e.fase === 'cruce') say('¿Por dónde vamos? ¿Por la izquierda o por la derecha?');
      else if (e.fase === 'fin') say('¿Otra carrera? Toca la flecha verde.');
      else say('Toca la pantalla para que Tito salte.');
    },
    // hint(): lo que hay que tocar ahora (para la mano de ayuda y las pruebas): el lado bueno del cruce; saltar si
    // viene un obstáculo o algo de arriba (a 2 o 5 pasos); al final, el botón de otra vez.
    hint() {
      const e = this.c as EstadoCarrera;
      if (e.fase === 'cruce' && e.plan.cruce) {
        const b = LADOS[e.plan.cruce.bueno];
        return { x: b.x, y: b.y, r: b.r };
      }
      if (e.fase === 'fin') return { x: 1000, y: 700, r: 80 };
      if (e.fase !== 'corre' || enElAire(e.reloj, e.salto)) return null;
      const d = e.d.tito ?? 0,
        cerca = (x: number) => x - d > 2 && x - d < 5;
      const viene =
        e.plan.obstaculos.some((o) => cerca(o.d)) ||
        e.plan.premios.some((p) => p.arriba && cerca(p.d) && !e.cogidos.has(p));
      return viene ? { x: 800, y: 600, r: 120 } : null;
    },
    // draw(): encima del 3D: la casa (vuelve al patio), la barra de la carrera y lo cogido; en el cruce, sus botones;
    // en el podio, el podio; al final, el cartel y el botón de otra vez.
    draw() {
      const e = this.c as EstadoCarrera | undefined;
      if (!e) return;
      if (e.fase === 'podio' || e.fase === 'fin') dibujaPodio(e);
      else {
        dibujaBarra(e);
        dibujaCogido(e);
      }
      if (e.fase === 'cruce') dibujaCruce();
      if (e.fase === 'fin') dibujaFinal();
      drawHome();
    },
    // down(x, y): casa -> el patio (o la jornada del día del deporte); en el cruce, un lado; al final, otra vez; corriendo, Tito salta (si no está ya en
    // el aire).
    down(x: number, y: number) {
      const e = this.c as EstadoCarrera;
      if (atHome(x, y)) {
        SFX.whoosh();
        go(this.deporte ? 'deporte' : 'patio');
        return;
      }
      if (e.fase === 'cruce') {
        const lado = (['izquierda', 'derecha'] as const).find(
          (l) => Math.hypot(x - LADOS[l].x, y - LADOS[l].y) < LADOS[l].r + 30,
        );
        if (lado) elegir(this, lado);
        else say('¿Por la izquierda o por la derecha? Toca una flecha.');
        return;
      }
      if (e.fase === 'fin') {
        if (enOtraVez(x, y)) {
          SFX.pop();
          empezar(this);
        }
        return;
      }
      if (e.fase !== 'corre' || e.llegadas.tito !== undefined || enElAire(e.reloj, e.salto)) return;
      e.salto = e.reloj;
      this.hop = T;
      SFX.boing();
    },
  } satisfies Escena;
}
