/*
 * mundo3d/casa3d.ts: el prototipo de la casa de Tito por dentro en 3D (fase M0 de docs/PLAN-CASA-MEJORA.md). Es una
 * escena aparte, SCENES.casa3dPrueba, que se abre desde la zona de adultos («Casa de Tito en 3D (prueba)»): el salón
 * como una habitación 3D de verdad (suelo, paredes, zócalo, ventana con el sol o la luna y una puerta), con las cosas
 * del salón del niño como recortables de cartón de pie (los dibujos de siempre, con picTex, y una sombra redonda en vez
 * de sombras reales) y el Tito 3D de siempre, que anda al tocar el suelo y va a jugar con lo que se toca. Arriba a la
 * derecha enseña los FPS y la calidad (PRK), para medir en un móvil de verdad si la casa 3D va bien antes de seguir con
 * las fases M4 y M5. No cambia la casa de verdad (SCENES.casaTito, escenas/casa.ts) ni guarda nada.
 * Cada cosa va en su sitio (dominio/casaSitios.ts, como hará la casa desde la fase M2); lo que no tiene sitio no sale.
 * Si el salón del niño tiene menos de 4 cosas con sitio, se enseñan 8 de muestra (MUESTRA) para poder probarla igual.
 * montarCasa3D() la llama mundo3d/mundo3d.ts al montar la capa 3D: sin WebGL no se monta y la zona de adultos no
 * enseña el botón.
 * Exporta: montarCasa3D y, para las pruebas, MUESTRA y aTres. Importa: del núcleo lo que dibuja y suena; HSIZE y
 * homeItems de escenas/tienda.ts, los sitios de dominio/casaSitios.ts y FRASES_CASA de contenido/casa.ts; el motor, las piezas y lo de los demás módulos de
 * mundo3d/ (Tito, su paseo y el cielo).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las medidas de la habitación y de la cámara son el dibujo mismo. */
import * as THREE from 'three';
import type { Escena } from '../nucleo/tipos.ts';
import type { Mundo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  DF,
  PI,
  S,
  SCENES,
  SFX,
  T,
  W_,
  cap,
  card,
  circ,
  ctx,
  go,
  hC,
  hv,
  say,
  sceneName,
  sparkles,
  text,
} from '../nucleo/indice.ts';
import { HSIZE, homeItems } from '../escenas/tienda.ts';
import { PLANO, asignarSitios, sitioDe, type Casa, type Sitio } from '../dominio/casaSitios.ts';
import { FRASES_CASA } from '../contenido/casa.ts';
import { PRK, W3, camRig, newWorld, pickAt, setWorld } from './motor.ts';
import { Box, V3, grp, mk, picTex, plane, rbox } from './materiales.ts';
import { busy3, titoRect, walkGround, walkTick, walkTo } from './interaccion.ts';
import { makeTito } from './personajes.ts';
import { skyNow } from './cielo.ts';

/** Una cosa que se pone en la casa 3D: su id y su sitio (dominio/casaSitios.ts). */
interface CosaCasa {
  readonly id: string;
  readonly h: string;
}

// MUESTRA: las cosas que se enseñan si el salón del niño tiene menos de 4, cada una en un sitio del salón.
export const MUESTRA: readonly CosaCasa[] = [
  { id: 'sofa', h: 'salon:grande2' },
  { id: 'piano', h: 'salon:grande1' },
  { id: 'estanteria', h: 'salon:grande3' },
  { id: 'lampara', h: 'salon:suelo5' },
  { id: 'plantaInterior', h: 'salon:suelo1' },
  { id: 'alfombra', h: 'salon:alfombra' },
  { id: 'cuadro', h: 'salon:pared1' },
  { id: 'reloj', h: 'salon:pared2' },
];

// Medidas de la habitación (unidades 3D): ancho y fondo del suelo, alto de las paredes.
const ANCHO = 17,
  FONDO = 9,
  ALTO = 7;

// aTres(x, y): la posición 3D [X, Z] del pie de un objeto que en la casa 2D está en el suelo, en (x, y): el suelo 2D
// (y de 600 a 800) va del fondo (Z = -3) al frente (Z = 3,5) y el ancho de la pantalla, de lado a lado de la habitación.
export function aTres(x: number, y: number): [number, number] {
  const X = (x - 950) / 80,
    Z = -3 + ((y - 600) / 200) * 6.5;
  return [Math.max(-ANCHO / 2 + 1.2, Math.min(ANCHO / 2 - 1.2, X)), Z];
}

// cosasDelSalon(): las cosas del salón del niño, cada una con su sitio: se asignan con asignarSitios (como hará la
// casa desde la fase M2) y se quedan las que tienen sitio; lo que no cabe irá al baúl, y aquí no sale.
function cosasDelSalon(): CosaCasa[] {
  const casa = asignarSitios(PLANO, S.home || {});
  return homeItems('salon')
    .map((o) => ({ id: o.id, h: casa[o.id] && casa[o.id].h }))
    .filter((o): o is CosaCasa => !!o.h);
}

// sombra(to, r): una sombra redonda y suave debajo de un objeto (en vez de sombras reales, que pesan en los móviles).
function sombra(to: THREE.Object3D, r: number) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r, 20),
    new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.16, depthWrite: false }),
  );
  m.rotation.x = -PI / 2;
  m.position.y = 0.02;
  m.scale.set(1, 0.45, 1);
  to.add(m);
}

// ponObjeto(w, id, sitio, casa): pone en la habitación el recortable del objeto id en su sitio: la alfombra, tumbada en
// el suelo; lo de la pared, colgado en la pared del fondo; lo de encima de un mueble, delante del mueble a la altura de
// su balda; lo demás, de pie con su sombra. Cada uno se puede tocar (userData.id = 'obj:id') y guarda su recortable en
// userData.carton para que bote al jugar con él.
function ponObjeto(w: Mundo, id: string, sitio: Sitio, casa: Casa) {
  const mueble = sitio.mueble && casa[sitio.mueble],
    pie = mueble ? mueble : sitio,
    [X0, Z] = sitio.tipo === 'pared' ? [(sitio.x - 950) / 80, -FONDO / 2 + 0.25] : aTres(pie.x, pie.y),
    X = mueble ? aTres(sitio.x, pie.y)[0] : X0,
    s = (HSIZE[id] || 160) / 80,
    tex = picTex(id, 256),
    g = grp(w.sc, [X, 0, mueble ? Z + 0.25 : Z]);
  g.userData.id = 'obj:' + id;
  if (sitio.tipo === 'alfombra') {
    const p = plane(tex, s * 1.1, s * 1.1, { to: g, p: [0, 0.03, 0], r: [-PI / 2, 0, 0] });
    g.userData.carton = p;
  } else if (sitio.tipo === 'pared') {
    g.userData.carton = plane(tex, s, s, { to: g, p: [0, 3.2 + ((600 - sitio.y) / 300) * 1.6, 0.05] });
  } else if (mueble) {
    g.userData.carton = plane(tex, s, s, { to: g, p: [0, ((pie.y - sitio.y) / 80) * 1.15 + s * 0.42, 0] });
  } else {
    g.userData.carton = plane(tex, s, s, { to: g, p: [0, s * 0.42, 0] });
    sombra(g, s * 0.42);
  }
  g.userData.base = g.userData.carton.position.y;
  w.pick.push(g);
  return g;
}

// habitacion(w, noche): el suelo de madera, la pared del fondo con su zócalo, las dos paredes de los lados, la ventana
// (con el sol de día o la luna de noche) y una puerta a la derecha (desde la fase M5, para ir a otra habitación).
function habitacion(w: Mundo, noche: boolean) {
  const suelo = mk(Box(ANCHO, 0.4, FONDO + 2), '#E3B887', { p: [0, -0.2, 0.6], to: w.sc, ol: 0 });
  w.ground = suelo;
  w.gb = [-ANCHO / 2 + 1.2, ANCHO / 2 - 1.2, -2.8, 3.6];
  // tablas del suelo: rayas un poco más oscuras
  [-3, -2, -1, 0, 1, 2, 3].forEach((i) =>
    mk(Box(ANCHO, 0.01, 0.05), '#C99A66', { p: [0, 0.01, i * 1.4], to: w.sc, ol: 0 }),
  );
  const pared = noche ? '#C9C2E8' : '#FFF1D6';
  mk(Box(ANCHO, ALTO, 0.3), pared, { p: [0, ALTO / 2, -FONDO / 2], to: w.sc, ol: 0 });
  mk(Box(0.3, ALTO, FONDO), pared, { p: [-ANCHO / 2, ALTO / 2, 0], to: w.sc, ol: 0 });
  mk(Box(0.3, ALTO, FONDO), pared, { p: [ANCHO / 2, ALTO / 2, 0], to: w.sc, ol: 0 });
  mk(Box(ANCHO, 0.5, 0.1), '#B5763F', { p: [0, 0.25, -FONDO / 2 + 0.2], to: w.sc, ol: 0.02 });
  // la ventana, a la derecha de la pared del fondo
  const v = grp(w.sc, [4.6, 4.3, -FONDO / 2 + 0.18]);
  mk(rbox(3.4, 2.6, 0.2, 0.1), '#FFFFFF', { to: v, ol: 0.05 });
  mk(Box(3, 2.2, 0.05), noche ? '#2E3F7A' : '#BFEAF7', { p: [0, 0, 0.1], to: v, ol: 0 });
  mk(Box(0.1, 2.2, 0.08), '#FFFFFF', { p: [0, 0, 0.13], to: v, ol: 0 });
  mk(Box(3, 0.1, 0.08), '#FFFFFF', { p: [0, 0, 0.13], to: v, ol: 0 });
  plane(picTex(noche ? 'luna' : 'sol', 128), 1, 1, { to: v, p: [-0.7, 0.5, 0.17] });
  // la puerta, en la pared de la derecha
  const pu = grp(w.sc, [ANCHO / 2 - 0.18, 0, 1.2]);
  pu.rotation.y = -PI / 2;
  mk(rbox(2, 3.8, 0.2, 0.12), '#C98A4B', { p: [0, 1.9, 0], to: pu, ol: 0.05 });
  mk(new THREE.SphereGeometry(0.12, 12, 8), '#FFC93C', { p: [0.65, 1.9, 0.15], to: pu, ol: 0 });
}

// construye(st): el mundo de la casa 3D: la habitación, los objetos del salón (o la MUESTRA), Tito y la cámara. En
// cada cuadro, los recortables giran un poco hacia la cámara, el que se acaba de jugar bota (userData.wob) y Tito anda.
function construye(st: Escena) {
  const noche = skyNow().night,
    w = newWorld({ fov: 40, bg: noche ? '#3B4A86' : '#FFE9C2', kind: 'casa', shadow: 12 });
  // sin sombras reales (decisión de rendimiento del plan): solo la de Tito, que es pequeña
  w.sun!.castShadow = false;
  if (noche)
    w.sc.children.forEach((o) => {
      if ((o as THREE.Light).isLight) (o as THREE.Light).intensity *= 0.75;
    });
  habitacion(w, !!noche);
  const suyas = cosasDelSalon(),
    lista = suyas.length >= 4 ? suyas : MUESTRA,
    casa: Casa = Object.fromEntries(lista.map((o) => [o.id, { x: 0, y: 0, r: 'salon', h: o.h }])),
    conPos: Casa = Object.fromEntries(
      lista.map((o) => {
        const si = sitioDe(PLANO, casa, o.h);
        return [o.id, { x: si ? si.x : 0, y: si ? si.y : 0, r: 'salon', h: o.h }];
      }),
    );
  st.objetos = lista
    .map((o) => [o.id, sitioDe(PLANO, conPos, o.h)] as const)
    .filter((par): par is readonly [string, Sitio] => !!par[1])
    .map(([id, si]) => ponObjeto(w, id, si, conPos));
  st.muestra = suyas.length < 4;
  const tito = makeTito();
  tito.scale.setScalar(0.6);
  tito.position.set(-1.5, 0, 3.6);
  tito.rotation.y = -0.3;
  w.sc.add(tito);
  w.tito = tito;
  w.pick.push(tito);
  w.upd.push((dt: number) => {
    const wk = walkTick(w, tito, dt);
    tito.userData.anim(dt, { walk: wk, hop: st.hop });
    (st.objetos as THREE.Group[]).forEach((g) => {
      const c = g.userData.carton as THREE.Mesh;
      if (g.userData.id !== 'obj:alfombra' && c.position.z < 0.04)
        g.rotation.y = Math.atan2(w.cam.position.x - g.position.x, w.cam.position.z - g.position.z) * 0.5;
      const e = T - (g.userData.wob ?? -9);
      const b = e < 0.8 ? Math.sin(e * 14) * (0.8 - e) * 0.25 : 0;
      c.scale.set(1 - b * 0.5, 1 + b, 1);
      c.position.y = g.userData.base + Math.max(0, b) * 0.6;
    });
  });
  camRig(w, V3(0, 6.2, 13.5), V3(0, 2.3, 0), 0.6);
  return w;
}

// juega(st, g): lo que pasa al llegar Tito junto al objeto g (o al tocarlo si Tito ya está al lado): bota, chispitas,
// suena y Tito dice su frase de la casa (FRASES_CASA) o el nombre del objeto.
function juega(st: Escena, g: THREE.Group, x: number, y: number) {
  const id = String(g.userData.id).slice(4);
  g.userData.wob = T;
  st.hop = T;
  SFX.pop();
  sparkles(x, y, 8);
  say(FRASES_CASA[id] ?? cap(W_(id)) + '.');
  st.jugado = id;
}

// montarCasa3D(): pone la escena SCENES.casa3dPrueba (el prototipo de la casa 3D). La llama mundo3d/mundo3d.ts al
// montar la capa 3D, después de las demás escenas 3D. Estado de la escena: objetos (los grupos 3D de los recortables),
// muestra (si se enseña la MUESTRA), hop (cuándo saltó Tito), jugado (el último objeto con el que se jugó, para las
// pruebas) y la medida de FPS (fpsT0, fpsN y fps: cuadros contados durante un segundo).
export function montarCasa3D(): void {
  SCENES.casa3dPrueba = {
    three: true,
    music: 'casita',
    // enter(): construye el mundo y Tito lo presenta
    enter() {
      this.hop = null;
      this.jugado = null;
      this.fpsT0 = T;
      this.fpsN = 0;
      this.fps = 0;
      setWorld(construye(this));
      titoRect(W3!.tito!);
      say('¡Mira mi casa en tres dimensiones! Toca el suelo para que ande, o toca una cosa para jugar.');
    },
    // draw(): encima del mundo 3D: el botón de volver a la casa, el cartel con el nombre y el contador de FPS
    draw() {
      const w = W3;
      if (w && w.kind === 'casa') titoRect(w.tito!);
      this.fpsN++;
      if (T - this.fpsT0 >= 1) {
        this.fps = Math.round(this.fpsN / (T - this.fpsT0));
        this.fpsN = 0;
        this.fpsT0 = T;
      }
      const s = hv('c3:volver', hC(90, 90, 60));
      ctx.save();
      ctx.translate(90, 90);
      ctx.scale(s, s);
      circ(0, 0, 58, '#fff', 6);
      ctx.beginPath();
      ctx.moveTo(18, -26);
      ctx.lineTo(-20, 0);
      ctx.lineTo(18, 26);
      ctx.lineWidth = 10;
      ctx.strokeStyle = K;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
      card(180, 50, 520, 84, '#fff', 6, 42);
      text(this.muestra ? 'Casa en 3D (prueba, muestra)' : 'Casa en 3D (prueba)', 440, 104, 36, K, { w: 600 });
      card(1300, 40, 260, 70, 'rgba(255,255,255,.9)', 4, 20);
      ctx.font = `600 30px ${DF}`;
      text(this.fps + ' FPS · ' + Math.round(PRK * 100) + ' %', 1430, 86, 30, K, { w: 600 });
    },
    // down(x, y): el botón de volver lleva a la casa de verdad; Tito salta; un objeto: Tito va a su lado y juega con
    // él; el suelo: Tito anda hasta allí
    down(x: number, y: number) {
      const w = W3;
      if (Math.hypot(x - 90, y - 90) < 64) {
        SFX.tap();
        go('casaTito', {});
        return;
      }
      if (!w || busy3(w)) return;
      const u = pickAt(x, y);
      if (u && u.id === 'tito') {
        this.hop = T;
        SFX.boing();
        return;
      }
      const g =
        u &&
        typeof u.id === 'string' &&
        u.id.startsWith('obj:') &&
        (this.objetos as THREE.Group[]).find((o) => o.userData.id === u.id);
      if (g) {
        const lado = g.position.x > w.tito!.position.x ? -1.6 : 1.6,
          to = V3(g.position.x + lado, 0, Math.min(3.4, Math.max(-2.6, g.position.z + 1.2)));
        walkTo(
          w,
          w.tito!,
          to,
          () => {
            if (sceneName === 'casa3dPrueba') juega(this, g, x, y);
          },
          { speed: 7, max: 1.6 },
        );
        return;
      }
      SFX.tap();
      sparkles(x, y, 5);
      walkGround(w);
    },
  } satisfies Escena;
}
