/*
 * mundo3d/islaIngles3d.ts: la Isla del Inglés en 3D (fase I6 de docs/PLAN-INGLES.md). Como la Isla de las Letras
 * (mundo3d/isla3d.ts), es otra escena hecha a partir de la 2D (escenas/islaIngles.ts, que no se toca):
 * SCENES.islaIngles = {...islaIngles2D, three: true, enter, draw, down}. El mundo tiene el mar, la isla de arena y
 * hierba, las tres zonas (la Playa Hello con su palmera, el castillo de arena y las letras HELLO; el Parque de Londres con la
 * cabina, el reloj y la bandera; el Pueblo de los Cuentos con tres casitas con palabras en inglés), Polly en el centro,
 * el globo para volver al mapa (con su cartel), nubes y Tito, que camina hasta la zona tocada antes de entrar.
 * Tocar: los botones (casa, monedas, seguir) van al down 2D tal cual; un sitio 3D tocado (zona, Polly o globo) llama al
 * down 2D con el punto 2D de ese sitio (ISLA_INGLES, POLLY, GLOBO), así las reglas (abierta, cerrada, en obras) son las
 * de la escena 2D. Las zonas cerradas salen en gris con un candado.
 * Exporta: montarIslaIngles3D (la llama mundo3d/mundo3d.ts al montar la capa 3D).
 * Importa: el núcleo, la escena 2D y sus sitios (escenas/islaIngles.ts), las reglas de escenas/zonas.ts (ZONES,
 * zoneOpen, nextIngles, SEGUIR y drawSeguir), el motor, las piezas y lo de los demás módulos de mundo3d/ (el mar, el
 * gris y el globo de mapa3d.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements, ts-patterns/no-param-reassign -- posiciones
   y tamaños del mundo 3D y de la pantalla de 1600x900; los grupos y el mundo de Three.js se cambian en su sitio y los
   bucles recorren las zonas con efectos (añadir al mundo), como en el resto de la capa 3D (isla3d.ts). */
import * as THREE from 'three';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Mundo, Trio } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import {
  DF,
  DIAC,
  LF,
  PI,
  SCENES,
  SFX,
  T,
  VIVO,
  atHome,
  cap,
  card,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  inCoinHUD,
  lerp,
  sceneName,
  sparkles,
  speaker,
  text,
  titoPos,
} from '../nucleo/indice.ts';
import { GLOBO, ISLA_INGLES, POLLY } from '../escenas/islaIngles.ts';
import { SEGUIR, ZONES, drawSeguir, nextIngles, zoneOpen } from '../escenas/zonas.ts';
import { W3, camRig, newWorld, pickAt, projR, setWorld } from './motor.ts';
import { Box, Cyl, M, OLm, V3, canvasTex, grp, mk, olGeo, picTex, pillSpr, pillTex, prism, spr } from './materiales.ts';
import { lock3, ring3, tree3 } from './decorado.ts';
import {
  busy3,
  call0,
  flyTap,
  seaTap,
  titoRect,
  walkGround,
  walkTick,
  walkTo,
  wobInit,
  wobTap,
} from './interaccion.ts';
import { clock3, cloud3, flag3, palm3, phone3, sandc3 } from './objetos.ts';
import { ffTap, makeTito, titoHearts, titoTapSfx } from './personajes.ts';
import { skyNow } from './cielo.ts';
import { globoAire3, greyAll, sea3 } from './mapa3d.ts';

// POS3: dónde va cada sitio de la isla en el suelo 3D ([x, z]): las tres zonas, Polly, el globo y dónde empieza Tito.
const POS3: Record<string, [number, number]> = {
  playaHello: [-8.6, 2.6],
  parqueLondres: [0, -3.4],
  puebloCuentos: [8.6, 2.6],
  polly: [0, 3.4],
  globo: [13.4, 6.6],
  tito: [-2.6, 5.6],
};
// IP: dónde ha quedado en la pantalla cada zona de la isla (lo proyecta draw() cada cuadro), para su nombre al pasar por
// encima.
const IP: Record<string, { x: number; y: number; r: number }> = {};

// isla3(w): la isla: una elipse de arena con la hierba encima (w.ground, para pasear) y su contorno de dibujo.
function isla3(w: Mundo): void {
  const forma = (rx: number, rz: number) => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, rx, rz, 0, PI * 2, false, 0);
    return s;
  };
  const arena = new THREE.ExtrudeGeometry(forma(16.5, 9.6), {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 1,
    bevelSegments: 2,
    curveSegments: 48,
  });
  arena.rotateX(PI / 2);
  const a = new THREE.Mesh(arena, M('#FFE9B8'));
  a.position.set(0, -0.75, 0.6);
  a.receiveShadow = true;
  w.sc.add(a);
  const hierba = new THREE.ExtrudeGeometry(forma(14.6, 8.2), {
    depth: 1.6,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.6,
    bevelSegments: 3,
    curveSegments: 48,
  });
  hierba.rotateX(PI / 2);
  const h = new THREE.Mesh(hierba, [M('#CFE8C0'), M('#D9A86C')]);
  h.position.set(0, -0.45, 0.2);
  h.receiveShadow = true;
  w.sc.add(h);
  w.ground = h;
  const ol = new THREE.Mesh(olGeo(hierba), OLm(0.12));
  ol.position.copy(h.position);
  w.sc.add(ol);
}

// letras3(g, ls, y, r, cs): las letras ls en sprites alrededor del centro del grupo g, a la altura y y separadas r; cada
// una con su color de cs. Devuelve los sprites (botan en anim).
function letras3(g: THREE.Group, ls: string, y: number, r: number, cs: readonly string[]): THREE.Sprite[] {
  return ls.split('').map((l, i) =>
    spr(
      canvasTex(
        128,
        128,
        () => text(l, 64, 104, 104, cs[i % cs.length]!, { f: LF, st: 8, sc: '#fff' }),
        'islaIL' + l + cs[i % cs.length],
      ),
      1.2,
      1.2,
      { p: [(i - (ls.length - 1) / 2) * r, y, 0.4], to: g },
    ),
  );
}

// SITIOS3: un constructor por zona de la isla (id de ISLA_INGLES): recibe el grupo ya colocado, el mundo y si está
// abierta, y pone sus piezas (y, si algo se mueve, g.userData.anim). Los objetos que se ponen con el mundo (la palmera,
// la cabina...) van en coordenadas del suelo, junto al grupo.
const SITIOS3: Record<string, (g: THREE.Group, w: Mundo, open: boolean) => void> = {
  // la Playa Hello: arena, una palmera, el castillo de arena y las letras HELLO que saltan
  playaHello(g, w) {
    mk(Cyl(3.3, 3.4, 0.2, 36), '#FFE6A8', { p: [0, 0.1, 0], s: [1, 1, 0.8], to: g, ol: 0.05 });
    const p = g.position;
    palm3(w, p.x - 2.4, p.z - 1, 0.75);
    sandc3(w, p.x + 1.7, p.z + 0.7, 0.9);
    const ls = letras3(g, 'HELLO', 2.6, 1.05, DIAC);
    g.userData.anim = () =>
      ls.forEach((q, i) => {
        q.position.y = 2.6 + Math.abs(Math.sin(T * 3 + i)) * 0.45;
      });
  },
  // el Parque de Londres: césped, un árbol, la cabina roja, el reloj y la bandera
  parqueLondres(g, w, open) {
    mk(Cyl(3.3, 3.4, 0.2, 36), open ? '#A8DC8F' : '#D8D2C8', { p: [0, 0.1, 0], s: [1, 1, 0.8], to: g, ol: 0.05 });
    tree3(g, -2, -0.6, 0.7, open ? 'verano' : 'gris');
    const p = g.position;
    phone3(w, p.x + 1.9, p.z - 0.4, 0.7);
    clock3(w, p.x - 0.2, p.z - 1, 0.55);
    flag3(w, p.x + 0.2, p.z + 1.2, 0.6);
  },
  // el Pueblo de los Cuentos: tres casitas de colores con una palabra en inglés en el tejado (CAT, SUN, DOG)
  puebloCuentos(g, _w, open) {
    mk(Cyl(3.3, 3.4, 0.2, 36), open ? '#E9F2D8' : '#D8D2C8', { p: [0, 0.1, 0], s: [1, 1, 0.8], to: g, ol: 0.05 });
    (['CAT', 'SUN', 'DOG'] as const).forEach((pal, i) => {
      const c = grp(g, [(i - 1) * 2, 0, i === 1 ? -0.9 : 0.3] as Trio);
      mk(Box(1.4, 1.1, 1.2), '#FFF3D6', { p: [0, 0.75, 0], to: c, ol: 0.04 });
      mk(prism(1.8, 0.9, 1.4), ['#9B8AD9', '#5B8DEF', '#F58BB4'][i]!, { p: [0, 1.75, 0], to: c, ol: 0.04 });
      mk(Box(0.4, 0.6, 0.05), '#C98A4B', { p: [0, 0.5, 0.62], to: c, ol: 0.02 });
      spr(
        canvasTex(
          256,
          128,
          () => {
            card(8, 14, 240, 100, '#fff', 8, 24);
            text(pal, 128, 96, 76, DIAC[i + 3]!, { f: LF });
          },
          'islaIP' + pal,
        ),
        1.6,
        0.8,
        { p: [0, 2.75, 0.4], to: c },
      );
    });
  },
};

// globo3(w): el globo aerostático para volver al mapa (globoAire3 de mapa3d.ts) en la orilla, con su cartel «Mapa»; sube
// y baja despacio. Su grupo lleva userData.id 'globo'.
function globo3(w: Mundo): THREE.Group {
  const [x, z] = POS3.globo!,
    g = grp(w.sc, [x, -0.4, z]);
  g.userData.id = 'globo';
  const b = grp(g, [0, 0, 0]);
  globoAire3(b);
  spr(pillTex('Mapa', '#E8554E', '#fff', 50), 2.6, 1.1, { p: [0, 5.6, 0.6], to: g });
  const hit = new THREE.Mesh(Cyl(1.8, 1.8, 5.6, 10), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 2.6;
  g.add(hit);
  w.upd.push(() => {
    b.position.y = Math.sin(T * 1.3) * 0.2;
    b.rotation.y = Math.sin(T * 0.5) * 0.15;
  });
  w.pick.push(g);
  return g;
}

// polly3(w): Polly, la lorita, en un sprite que se balancea sobre una percha, en el centro de la isla (userData.id 'polly').
function polly3(w: Mundo): THREE.Group {
  const [x, z] = POS3.polly!,
    g = grp(w.sc, [x, 0, z]);
  g.userData.id = 'polly';
  mk(Cyl(0.08, 0.1, 1.2, 8), '#A86B43', { p: [0, 0.6, 0], to: g, ol: 0.02 });
  mk(Cyl(0.9, 0.9, 0.08, 16), '#A86B43', { p: [0, 0.05, 0], s: [1, 1, 0.6], to: g, ol: 0.03 });
  const s = spr(picTex('polly'), 2.4, 2.4, { p: [0, 1.9, 0], to: g });
  const hit = new THREE.Mesh(Cyl(1.1, 1.1, 3, 10), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 1.5;
  g.add(hit);
  w.upd.push(() => {
    s.material.rotation = Math.sin(T * 1.5) * 0.06;
    s.position.y =
      1.9 + (g.userData.salto && T - g.userData.salto < 0.5 ? Math.sin((T - g.userData.salto) * PI * 2) * 0.4 : 0);
  });
  w.pick.push(g);
  return g;
}

// buildIslaIngles(st): el mundo 3D de la isla: cielo según la hora, mar, isla, nubes, las tres zonas (las cerradas en
// gris y con candado; la de la casita que toca, con un aro dorado), Polly, el globo y Tito. Devuelve el mundo.
function buildIslaIngles(st: Escena): Mundo {
  const sk = skyNow(),
    w = newWorld({ fov: 36, bg: sk.bg, kind: 'islaIngles', shadow: 24 });
  sea3(w, sk.sea);
  isla3(w);
  for (let i = 0; i < 4; i++) {
    const c = cloud3(w.sc, -30 + i * 16, 9 + (i % 2) * 1.5, -16 + (i % 2) * 5, 1 + (i % 3) * 0.3);
    w.upd.push((dt: number) => {
      c.position.x += 0.3 * dt;
      if (c.position.x > 36) c.position.x = -36;
    });
  }
  const t = nextIngles();
  w.spots = {};
  for (const z of ISLA_INGLES) {
    const [x, zz] = POS3[z.id]!,
      g = grp(w.sc, [x, 0, zz]);
    g.userData.id = 'ii:' + z.id;
    g.userData.spot = z.id;
    const open = !!ZONES[z.id] && zoneOpen(z.id);
    SITIOS3[z.id]!(g, w, open);
    pillSpr(`${z.edad} años`, open ? ['#FF8A7A', '#7CC86E', '#5B8DEF'][z.edad - 3]! : '#B8B0A6', '#fff', {
      p: [0, 0.6, 3],
      w: 4.2,
      to: g,
    });
    const hit = new THREE.Mesh(Cyl(3.2, 3.2, 3.6, 12), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 1.6;
    g.add(hit);
    if (!open) {
      greyAll(g, true);
      g.userData.lock = lock3(g, [0, 4.8, 0], 1.15);
    }
    if (open && t && t.zone === z.id) {
      const r = ring3(g, [0, 0.25, 0], 3.6);
      w.upd.push(() => {
        r.material.opacity = 0.45 + 0.35 * Math.sin(T * 4);
      });
    }
    w.spots[z.id] = g;
    w.pick.push(g);
  }
  polly3(w);
  globo3(w);
  // Tito: empieza delante de Polly (o junto a la zona de la que vuelve)
  const tito = makeTito();
  tito.scale.setScalar(0.75);
  const [tx, tz] = POS3[st.titoAt as string] ?? POS3.tito!;
  tito.position.set(tx + (st.titoAt ? 1.4 : 0), 0, tz + (st.titoAt ? 3 : 0));
  tito.rotation.y = -0.35;
  w.sc.add(tito);
  w.tito = tito;
  w.pick.push(tito);
  w.upd.push((dt: number) => {
    const wk = walkTick(w, tito, dt);
    tito.userData.anim(dt, { walk: wk, hop: st.hop, hov: st.hovTito });
    for (const id in w.spots) {
      const g = w.spots[id]!;
      g.userData.anim?.();
      g.scale.setScalar(lerp(g.scale.x, st.hov === id && !busy3(w) ? 1.06 : 1, 0.2));
      const L = g.userData.lock;
      if (L) {
        L.position.y = 4.8 + Math.sin(T * 2 + g.position.x) * 0.15;
        const sh = st.lockShake && st.lockShake.id === id ? Math.max(0, 1 - (T - st.lockShake.t) * 2) : 0;
        L.rotation.z = Math.sin(T * 40) * 0.3 * sh;
      }
    }
  });
  wobInit(w);
  camRig(w, V3(0, 27, 24), V3(0, 0, 1.8), 1.4);
  return w;
}

// montarIslaIngles3D(): pone la Isla del Inglés en 3D en lugar de la 2D (SCENES.islaIngles), como montarIsla3D con la
// de las Letras: copia de la escena 2D la lógica (prompt, hint, dwell...) y pone su enter, draw y down. three: true hace
// que el bucle dibuje la capa 3D debajo de lo que pinte draw().
export function montarIslaIngles3D(): void {
  const isla2D = SCENES['islaIngles']!;
  SCENES['islaIngles'] = {
    ...isla2D,
    three: true,
    // enter(o): limpia los estados de la visita anterior, llama al enter 2D (saludos) y construye el mundo 3D
    enter(o: Libre) {
      this.hov = null;
      this.lockShake = null;
      this.hop = null;
      isla2D.enter!.call(this, o);
      setWorld(buildIslaIngles(this));
    },
    // draw(): encima del 3D: proyecta las zonas (IP) y a Tito, decide qué hay bajo el ratón (su nombre en un cartel) y
    // pinta los botones (seguir, casa, monedas) y el bocadillo de Tito cuando habla
    draw() {
      const w = W3;
      if (!w || w.kind !== 'islaIngles') return;
      for (const z of ISLA_INGLES) {
        const g = w.spots![z.id];
        if (g) {
          const [x, y, r] = projR(g, 3, 1.4);
          IP[z.id] = { x, y, r: Math.max(60, r) };
        }
      }
      titoRect(w.tito!);
      let hov: string | null = null,
        hT = false;
      if (VIVO.mouseOn && !VIVO.drag && !busy3(w)) {
        const u = pickAt(VIVO.MX, VIVO.MY);
        if (u?.spot) {
          hov = u.spot;
          VIVO.hovNow = 'ii:' + u.spot;
        } else if (u?.id === 'tito') {
          VIVO.hovNow = 'tito';
          hT = true;
        } else if (u?.id) VIVO.hovNow = u.id;
      }
      this.hov = hov;
      this.hovTito = hT;
      if (hov && IP[hov]) {
        const z = ISLA_INGLES.find((s) => s.id === hov)!,
          p = IP[hov]!;
        ctx.font = `600 34px ${DF}`;
        const tt = cap(z.name),
          tw = ctx.measureText(tt).width,
          cy = Math.max(p.y - p.r - 70, 118);
        card(p.x - tw / 2 - 26, cy, tw + 52, 58, 'rgba(255,255,255,.92)', 5, 29);
        text(tt, p.x, cy + 41, 34, K, { w: 600 });
      }
      drawSeguir();
      drawHome();
      drawCoinHUD();
      if (VIVO.talking) {
        const tp = titoPos(),
          bx = tp.x + tp.w * 0.85,
          by = tp.y - 50;
        ctx.globalAlpha = 0.95;
        card(bx, by, 96, 72, '#fff', 5, 28);
        ctx.globalAlpha = 1;
        speaker(bx + 50, by + 36, 46 + Math.sin(T * 12) * 4);
      }
    },
    // down(x, y): los botones van al down 2D; Tito salta y repite la consigna; Polly salta y se presenta; el globo lleva
    // al mapa; una zona abierta: Tito camina hasta ella y entra (down 2D con su punto 2D); cerrada o en obras: el candado
    // tiembla y el down 2D dice por qué; nada: objetos tocables, el mar o pasear
    down(x: number, y: number) {
      const w = W3;
      if (!w || w.kind !== 'islaIngles' || busy3(w)) return;
      if (atHome(x, y) || inCoinHUD(x, y) || dist(x, y, SEGUIR.x, SEGUIR.y) < SEGUIR.r + 10)
        return call0(isla2D.down!, this, x, y);
      const u = pickAt(x, y);
      if (flyTap(w, x, y)) return;
      if (!u) {
        if (wobTap(w, x, y) || seaTap(w)) return;
        SFX.tap();
        if (skyNow().night) ffTap(x, y);
        else sparkles(x, y);
        walkGround(w);
        return;
      }
      if (u.id === 'tito') {
        this.hop = T;
        titoTapSfx();
        titoHearts(x, y);
        this.prompt!(false);
        return;
      }
      if (u.id === 'polly') {
        const g = w.pick.find((o) => o.userData.id === 'polly');
        if (g) g.userData.salto = T;
        return call0(isla2D.down!, this, POLLY.x, POLLY.y);
      }
      if (u.id === 'globo') return call0(isla2D.down!, this, GLOBO.x, GLOBO.y);
      const z = ISLA_INGLES.find((s) => s.id === u.spot);
      if (!z) return;
      if (!(ZONES[z.id] && zoneOpen(z.id))) {
        this.lockShake = { id: z.id, t: T };
        return call0(isla2D.down!, this, z.x, z.y);
      }
      SFX.whoosh();
      const g = w.spots![z.id]!;
      this.titoAt = z.id;
      walkTo(
        w,
        w.tito!,
        g.position.clone().add(V3(1.4, 0, 3)),
        () => {
          if (sceneName === 'islaIngles') call0(isla2D.down!, this, z.x, z.y);
        },
        { zoom: V3(0, 9, 8) },
      );
    },
  } satisfies Escena;
}
