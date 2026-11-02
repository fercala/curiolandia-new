/*
 * mundo3d/isla3d.ts: la Isla de las Letras en 3D (fase L6 de docs/PLAN-LECTURA.md). Como el mapa (mundo3d/mapa3d.ts),
 * es otra escena hecha a partir de la 2D (escenas/isla.ts, que no se toca): SCENES.isla = {...isla2D, three: true,
 * enter, draw, down}. El mundo tiene el mar, la isla de arena y hierba, las tres zonas (la playa con su palmera, el
 * castillo y las vocales; el bosque con sus árboles y letras; el pueblo con tres casitas con palabras), Lupi en el centro,
 * el barco para volver, nubes y Tito, que camina hasta la zona tocada antes de entrar.
 * Tocar: los botones (casa, monedas, seguir) van al down 2D tal cual; un sitio 3D tocado (zona, Lupi o barco) llama al
 * down 2D con el punto 2D de ese sitio (ISLA, LUPI, BARCO), así las reglas (abierta, cerrada, en obras) son las de la
 * escena 2D. Las zonas cerradas salen en gris con un candado.
 * Exporta: montarIsla3D (la llama mundo3d/mundo3d.ts al montar la capa 3D).
 * Importa: el núcleo, la escena 2D y sus sitios (escenas/isla.ts), las reglas de escenas/zonas.ts (ZONES, zoneOpen,
 * nextLetra, SEGUIR y drawSeguir), el motor, las piezas y lo de los demás módulos de mundo3d/.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones y tamaños del mundo 3D y de la pantalla de 1600x900, como en
   el resto de la capa 3D. */
import * as THREE from 'three';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Mundo, Trio } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DF, DIAC, LF, PI, SCENES, SFX, T, VIVO, atHome, cap, card, ctx, dist, drawCoinHUD, drawHome, inCoinHUD, lerp, sceneName, sparkles, speaker, text, titoPos } from '../nucleo/indice.ts';
import { BARCO, ISLA, LUPI } from '../escenas/isla.ts';
import { SEGUIR, ZONES, drawSeguir, nextLetra, zoneOpen } from '../escenas/zonas.ts';
import { W3, camRig, newWorld, pickAt, projR, setWorld } from './motor.ts';
import { Box, Cyl, M, OLm, V3, canvasTex, grp, mk, olGeo, picTex, pillSpr, prism, spr } from './materiales.ts';
import { lock3, ring3, tree3 } from './decorado.ts';
import { busy3, call0, flyTap, seaTap, titoRect, walkGround, walkTick, walkTo, wobInit, wobTap } from './interaccion.ts';
import { cloud3, palm3, sandc3 } from './objetos.ts';
import { ffTap, makeTito, titoHearts, titoTapSfx } from './personajes.ts';
import { skyNow } from './cielo.ts';
import { greyAll, sea3 } from './mapa3d.ts';

// POS3: dónde va cada sitio de la isla en el suelo 3D ([x, z]): las tres zonas, Lupi, el barco y dónde empieza Tito.
const POS3: Record<string, [number, number]> = { playaSonidos: [-8.6, 2.6], bosqueLetras: [0, -3.4], puebloPalabras: [8.6, 2.6], lupi: [0, 3.4], barco: [15, 7.8], tito: [-2.6, 5.6] };
// IP: dónde ha quedado en la pantalla cada zona de la isla (lo proyecta draw() cada cuadro), para su nombre al pasar por
// encima.
const IP: Record<string, { x: number; y: number; r: number }> = {};

// isla3(w): la isla: una elipse de arena con la hierba encima (w.ground, para pasear) y su contorno de dibujo.
function isla3(w: Mundo): void {
  const forma = (rx: number, rz: number) => { const s = new THREE.Shape(); s.absellipse(0, 0, rx, rz, 0, PI * 2, false, 0); return s; };
  const arena = new THREE.ExtrudeGeometry(forma(16.5, 9.6), { depth: .5, bevelEnabled: true, bevelThickness: .2, bevelSize: 1, bevelSegments: 2, curveSegments: 48 }); arena.rotateX(PI / 2);
  const a = new THREE.Mesh(arena, M('#FFE9B8')); a.position.set(0, -.75, .6); a.receiveShadow = true; w.sc.add(a);
  const hierba = new THREE.ExtrudeGeometry(forma(14.6, 8.2), { depth: 1.6, bevelEnabled: true, bevelThickness: .35, bevelSize: .6, bevelSegments: 3, curveSegments: 48 }); hierba.rotateX(PI / 2);
  const h = new THREE.Mesh(hierba, [M('#C8EBAA'), M('#D9A86C')]); h.position.set(0, -.45, .2); h.receiveShadow = true; w.sc.add(h); w.ground = h;
  const ol = new THREE.Mesh(olGeo(hierba), OLm(.12)); ol.position.copy(h.position); w.sc.add(ol);
}

// letras3(g, ls, y, r, cs): las letras ls en sprites alrededor del centro del grupo g, a la altura y y separadas r; cada
// una con su color de cs. Devuelve los sprites (botan en anim).
function letras3(g: THREE.Group, ls: string, y: number, r: number, cs: readonly string[]): THREE.Sprite[] {
  return ls.split('').map((l, i) => spr(canvasTex(128, 128, () => text(l, 64, 104, 104, cs[i % cs.length]!, { f: LF, st: 8, sc: '#fff' }), 'islaL' + l + cs[i % cs.length]), 1.3, 1.3,
    { p: [(i - (ls.length - 1) / 2) * r, y, .4], to: g }));
}

// SITIOS3: un constructor por zona de la isla (id de ISLA): recibe el grupo ya colocado, el mundo y si está abierta, y pone
// sus piezas (y, si algo se mueve, g.userData.anim).
const SITIOS3: Record<string, (g: THREE.Group, w: Mundo, open: boolean) => void> = {
  // la Playa de los Sonidos: arena, una palmera, un castillo de arena y las cinco vocales que saltan
  playaSonidos(g, w) {
    mk(Cyl(3.3, 3.4, .2, 36), '#FFE6A8', { p: [0, .1, 0], s: [1, 1, .8], to: g, ol: .05 });
    const p = g.position; palm3(w, p.x - 2.4, p.z - 1, .75); sandc3(w, p.x + 1.4, p.z - .6, .8);
    const ls = letras3(g, 'AEIOU', 2.6, 1.15, DIAC);
    g.userData.anim = () => ls.forEach((q, i) => { q.position.y = 2.6 + Math.abs(Math.sin(T * 3 + i)) * .45; });
  },
  // el Bosque de las Letras: hierba, tres árboles y las letras M, P y L colgando como frutas
  bosqueLetras(g, _w, open) {
    mk(Cyl(3.3, 3.4, .2, 36), open ? '#A8DC8F' : '#D8D2C8', { p: [0, .1, 0], s: [1, 1, .8], to: g, ol: .05 });
    for (const [x, z, s] of [[-1.8, .2, .75], [0, -.9, .95], [1.8, .2, .75]] as const) tree3(g, x, z, s, open ? 'verano' : 'gris');
    const ls = letras3(g, 'MPL', 3.1, 1.8, ['#E8554E']);
    g.userData.anim = () => ls.forEach((q, i) => { q.material.rotation = Math.sin(T * 1.6 + i) * .15; });
  },
  // el Pueblo de las Palabras: tres casitas de colores con una palabra en el tejado (SOL, PAN, LUZ)
  puebloPalabras(g, _w, open) {
    mk(Cyl(3.3, 3.4, .2, 36), open ? '#E9F2D8' : '#D8D2C8', { p: [0, .1, 0], s: [1, 1, .8], to: g, ol: .05 });
    (['SOL', 'PAN', 'LUZ'] as const).forEach((pal, i) => {
      const c = grp(g, [(i - 1) * 2, 0, i === 1 ? -.9 : .3] as Trio);
      mk(Box(1.4, 1.1, 1.2), '#FFF3D6', { p: [0, .75, 0], to: c, ol: .04 }); mk(prism(1.8, .9, 1.4), ['#FF8A7A', '#F58BB4', '#FFC93C'][i]!, { p: [0, 1.75, 0], to: c, ol: .04 });
      mk(Box(.4, .6, .05), '#C98A4B', { p: [0, .5, .62], to: c, ol: .02 });
      spr(canvasTex(256, 128, () => { card(8, 14, 240, 100, '#fff', 8, 24); text(pal, 128, 96, 76, DIAC[i]!, { f: LF }); }, 'islaP' + pal), 1.6, .8, { p: [0, 2.75, .4], to: c });
    });
  },
};

// barco3(w): el barco de vela con la A, en el agua junto a la isla; se mece. Su grupo lleva userData.id 'barco'.
function barco3(w: Mundo): THREE.Group {
  const [x, z] = POS3.barco!, b = grp(w.sc, [x, -.9, z]); b.userData.id = 'barco';
  mk(Box(3.2, .7, 1.3), '#C98A4B', { p: [0, .35, 0], to: b, ol: .04 }); mk(Box(3.4, .15, 1.4), '#A86B43', { p: [0, .75, 0], to: b, ol: .03 });
  mk(Cyl(.08, .08, 3.4, 8), '#7A5A3A', { p: [0, 2.4, 0], to: b, ol: .02 });
  const vela = new THREE.Shape(); vela.moveTo(0, 0); vela.lineTo(1.7, 0); vela.lineTo(0, 2.6); vela.closePath();
  const vg = new THREE.ShapeGeometry(vela), v = new THREE.Mesh(vg, new THREE.MeshBasicMaterial({ color: '#fff', side: THREE.DoubleSide })); v.position.set(.1, 1.1, 0); b.add(v);
  spr(canvasTex(128, 128, () => text('A', 64, 104, 104, '#E8554E', { f: LF })), .9, .9, { p: [.6, 1.7, .1], to: b });
  const hit = new THREE.Mesh(Cyl(2, 2, 4, 10), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.6; b.add(hit);
  w.upd.push(() => { b.rotation.z = Math.sin(T * 1.6) * .05; b.position.y = -.9 + Math.sin(T * 2) * .08; });
  w.pick.push(b); return b;
}

// lupi3(w): Lupi, la lechuza, en un sprite que se balancea sobre un tocón, en el centro de la isla (userData.id 'lupi').
function lupi3(w: Mundo): THREE.Group {
  const [x, z] = POS3.lupi!, g = grp(w.sc, [x, 0, z]); g.userData.id = 'lupi';
  mk(Cyl(.7, .8, .5, 14), '#A86B43', { p: [0, .25, 0], to: g, ol: .03 });
  const s = spr(picTex('lupi'), 2.4, 2.4, { p: [0, 1.7, 0], to: g });
  const hit = new THREE.Mesh(Cyl(1.1, 1.1, 2.8, 10), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.4; g.add(hit);
  w.upd.push(() => { s.material.rotation = Math.sin(T * 1.5) * .06; s.position.y = 1.7 + (g.userData.salto && T - g.userData.salto < .5 ? Math.sin((T - g.userData.salto) * PI * 2) * .4 : 0); });
  w.pick.push(g); return g;
}

// buildIsla(st): el mundo 3D de la isla: cielo según la hora, mar, isla, nubes, las tres zonas (las cerradas en
// gris y con candado; la de la casita que toca, con un aro dorado), Lupi, el barco y Tito. Devuelve el mundo.
function buildIsla(st: Escena): Mundo {
  const sk = skyNow(), w = newWorld({ fov: 36, bg: sk.bg, kind: 'isla', shadow: 24 });
  sea3(w, sk.sea); isla3(w);
  for (let i = 0; i < 4; i++) { const c = cloud3(w.sc, -30 + i * 16, 9 + (i % 2) * 1.5, -16 + (i % 2) * 5, 1 + (i % 3) * .3); w.upd.push((dt: number) => { c.position.x += .3 * dt; if (c.position.x > 36) c.position.x = -36; }); }
  const t = nextLetra(); w.spots = {};
  for (const z of ISLA) {
    const [x, zz] = POS3[z.id]!, g = grp(w.sc, [x, 0, zz]); g.userData.id = 'is:' + z.id; g.userData.spot = z.id;
    const open = !!ZONES[z.id] && zoneOpen(z.id);
    SITIOS3[z.id]!(g, w, open);
    pillSpr(`${z.edad} años`, open ? ['#FF8A7A', '#7CC86E', '#5B8DEF'][z.edad - 3]! : '#B8B0A6', '#fff', { p: [0, .6, 3], w: 4.2, to: g });
    const hit = new THREE.Mesh(Cyl(3.2, 3.2, 3.6, 12), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.6; g.add(hit);
    if (!open) { greyAll(g, true); g.userData.lock = lock3(g, [0, 4.8, 0], 1.15); }
    if (open && t && t.zone === z.id) { const r = ring3(g, [0, .25, 0], 3.6); w.upd.push(() => { r.material.opacity = .45 + .35 * Math.sin(T * 4); }); }
    w.spots[z.id] = g; w.pick.push(g);
  }
  lupi3(w); barco3(w);
  // Tito: empieza delante de Lupi (o junto a la zona de la que vuelve)
  const tito = makeTito(); tito.scale.setScalar(.75); const [tx, tz] = POS3[st.titoAt as string] ?? POS3.tito!;
  tito.position.set(tx + (st.titoAt ? 1.4 : 0), 0, tz + (st.titoAt ? 3 : 0)); tito.rotation.y = -.35; w.sc.add(tito); w.tito = tito; w.pick.push(tito);
  w.upd.push((dt: number) => { const wk = walkTick(w, tito, dt); tito.userData.anim(dt, { walk: wk, hop: st.hop, hov: st.hovTito });
    for (const id in w.spots) { const g = w.spots[id]!; g.userData.anim?.(); g.scale.setScalar(lerp(g.scale.x, st.hov === id && !busy3(w) ? 1.06 : 1, .2));
      const L = g.userData.lock; if (L) { L.position.y = 4.8 + Math.sin(T * 2 + g.position.x) * .15; const sh = st.lockShake && st.lockShake.id === id ? Math.max(0, 1 - (T - st.lockShake.t) * 2) : 0; L.rotation.z = Math.sin(T * 40) * .3 * sh; } } });
  wobInit(w);
  camRig(w, V3(0, 27, 24), V3(0, 0, 1.8), 1.4);
  return w;
}

// montarIsla3D(): pone la isla en 3D en lugar de la 2D (SCENES.isla), como montarMapa3D con el mapa: copia de la escena
// 2D (isla2D) la lógica (prompt, hint, dwell...) y pone su enter, draw y down. three: true hace que el bucle dibuje la
// capa 3D debajo de lo que pinte draw().
export function montarIsla3D(): void {
  const isla2D = SCENES['isla']!;
  SCENES['isla'] = { ...isla2D, three: true,
    // enter(o): limpia los estados de la visita anterior, llama al enter 2D (saludos) y construye el mundo 3D
    enter(o: Libre) { this.hov = null; this.lockShake = null; this.hop = null; isla2D.enter!.call(this, o); setWorld(buildIsla(this)); },
    // draw(): encima del 3D: proyecta las zonas (IP) y a Tito, decide qué hay bajo el ratón (su nombre en un cartel) y
    // pinta los botones (seguir, casa, monedas) y el bocadillo de Tito cuando habla
    draw() { const w = W3; if (!w || w.kind !== 'isla') return;
      for (const z of ISLA) { const g = w.spots![z.id]; if (g) { const [x, y, r] = projR(g, 3, 1.4); IP[z.id] = { x, y, r: Math.max(60, r) }; } }
      titoRect(w.tito!);
      let hov: string | null = null, hT = false;
      if (VIVO.mouseOn && !VIVO.drag && !busy3(w)) { const u = pickAt(VIVO.MX, VIVO.MY); if (u?.spot) { hov = u.spot; VIVO.hovNow = 'is:' + u.spot; } else if (u?.id === 'tito') { VIVO.hovNow = 'tito'; hT = true; } else if (u?.id) VIVO.hovNow = u.id; }
      this.hov = hov; this.hovTito = hT;
      if (hov && IP[hov]) { const z = ISLA.find((s) => s.id === hov)!, p = IP[hov]!; ctx.font = `600 34px ${DF}`; const tt = cap(z.name), tw = ctx.measureText(tt).width, cy = Math.max(p.y - p.r - 70, 118);
        card(p.x - tw / 2 - 26, cy, tw + 52, 58, 'rgba(255,255,255,.92)', 5, 29); text(tt, p.x, cy + 41, 34, K, { w: 600 }); }
      drawSeguir(); drawHome(); drawCoinHUD();
      if (VIVO.talking) { const tp = titoPos(), bx = tp.x + tp.w * .85, by = tp.y - 50; ctx.globalAlpha = .95; card(bx, by, 96, 72, '#fff', 5, 28); ctx.globalAlpha = 1; speaker(bx + 50, by + 36, 46 + Math.sin(T * 12) * 4); } },
    // down(x, y): los botones van al down 2D; Tito salta y repite la consigna; Lupi salta y se presenta; el barco lleva
    // al mapa; una zona abierta: Tito camina hasta ella y entra (down 2D con su punto 2D); cerrada: el candado tiembla y
    // Tito dice cuándo se abre; nada: objetos tocables, el mar o pasear
    down(x: number, y: number) { const w = W3; if (!w || w.kind !== 'isla' || busy3(w)) return;
      if (atHome(x, y) || inCoinHUD(x, y) || dist(x, y, SEGUIR.x, SEGUIR.y) < SEGUIR.r + 10) return call0(isla2D.down!, this, x, y);
      const u = pickAt(x, y); if (flyTap(w, x, y)) return;
      if (!u) { if (wobTap(w, x, y) || seaTap(w)) return; SFX.tap(); if (skyNow().night) ffTap(x, y); else sparkles(x, y); walkGround(w); return; }
      if (u.id === 'tito') { this.hop = T; titoTapSfx(); titoHearts(x, y); this.prompt!(false); return; }
      if (u.id === 'lupi') { const g = w.pick.find((o) => o.userData.id === 'lupi'); if (g) g.userData.salto = T; return call0(isla2D.down!, this, LUPI.x, LUPI.y); }
      if (u.id === 'barco') return call0(isla2D.down!, this, BARCO.x, BARCO.y);
      const z = ISLA.find((s) => s.id === u.spot); if (!z) return;
      if (!(ZONES[z.id] && zoneOpen(z.id))) { this.lockShake = { id: z.id, t: T }; return call0(isla2D.down!, this, z.x, z.y); }
      SFX.whoosh(); const g = w.spots![z.id]!; this.titoAt = z.id;
      walkTo(w, w.tito!, g.position.clone().add(V3(1.4, 0, 3)), () => { if (sceneName === 'isla') call0(isla2D.down!, this, z.x, z.y); }, { zoom: V3(0, 9, 8) }); },
  } satisfies Escena;
}
