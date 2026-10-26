/*
 * mundo3d/zonas3d.ts: las zonas en 3D, un camino de casitas (desde la fase 4h; antes, en mundo3d/mundo3d.ts): el suelo
 * (slab), las casitas de tema (casita3), el camino (roadPts, que usa también la casita), lo que adorna cada zona
 * (zoneDecor: aquí se añade un objeto 3D nuevo a una zona, ver docs/COMO-AGREGAR.md) y buildZone, que monta el mundo.
 * Las posiciones 2D de las casitas (ZPOS, escenas/zonas.ts) se pasan al suelo con ZX; ZSTYLE da los colores de cada zona.
 * montarZonas3D() (la llama mundo3d/mundo3d.ts al montar la capa 3D) guarda en ZPB las posiciones 2D originales y
 * convierte en 3D la escena de cada zona de ZONES (como el mapa: cada cuadro proyecta las casitas a ZPOS).
 * Exporta: roadPts y montarZonas3D. Importa: del núcleo, temas/, escenas/escenas2d.ts y escenas/zonas.ts lo que dibuja
 * y lee cada zona; ahora() (aplicacion/puertos.ts); el motor, las piezas y lo de los demás módulos de mundo3d/.
 */
import type * as Tres from 'three';
import type { Tema } from '../juegos/tipos.ts';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Mundo, Nodo, PuntoSuelo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DF, DIAC, FLC, LF, PI, SCENES, SFX, T, TITO, V, VIVO, atHome, cap, card, circ, ctx, drawCoinHUD, drawHome, inCoinHUD, lerp, pic, sceneName, sparkles, speaker, text } from '../nucleo/indice.ts';
import { FIESTAS } from '../temas/indice.ts';
import { TEMA, gDone, isBday, tst } from '../escenas/escenas2d.ts';
import { MAINZ, ZONES, ZPOS, pathDone, pathOf, temaOpen } from '../escenas/zonas.ts';
// ahora() y azar(): la fecha y la hora y el azar (puertos de aplicacion/puertos.ts, desde la fase 3g; antes new
// Date() y Math.random()).
import { ahora } from '../aplicacion/puertos.ts';
import { RC, W3, camRig, newWorld, pickAt, projR, setWorld } from './motor.ts';
import { Box, Cone, Cyl, M, OLm, Sph, V3, canvasTex, flowerTex, gradiente, grp, mk, olGeo, picTex, plane, rbox, spr, starGeo } from './materiales.ts';
import { bigDipper, jupiter, mountEagle, orbFace, saturn, skyBirds, skyClouds, skyNow, skyTap, sunRays, xmasSleigh, zoneMoon } from './cielo.ts';
import { arrow3, arrowSway, bush3, butterfly3, fallPts, fireflies, flower3, lock3, ribbon, ring3, rock3, skyStars, tree3 } from './decorado.ts';
import { busy3, call0, flyTap, titoRect, walkGround, walkTick, walkTo, wobInit, wobTap } from './interaccion.ts';
import { ants3, balloon3, bee3, bubbles3, burrow3, bus3, cake3, can3, cann3, clock3, cloud3, drum3, flag3, frog3, garland3, goat3, guard3, hallowNow, hitS, igloo3, jack3, kite3, leafs3, marm3, mush3, nest3, owl3, peng3, phone3, pinata3, post3, pump3, scare3, sled3, snowman3, squir3, sunf3, tea3, umb3, wpk3, xmasNow } from './objetos.ts';
import { ffTap, makeTito, titoHearts, titoTapSfx } from './personajes.ts';

/* ================= LAS ZONAS: un camino de casitas en 3D ================= */
// ZX(x,y): pasa un punto 2D de una zona (ZPOS, escenas/zonas.ts) a [x,z] del suelo 3D de la zona (37 píxeles = 1 unidad)
// ZPB: copia de las posiciones 2D originales de cada casita (ZPOS[zona][idTema]); sync() sobrescribe ZPOS con las proyectadas.
// La llena montarZonas3D.
// ZSTYLE: colores de cada zona {bg: cielo, g: césped, e: borde de tierra}.
const ZX=(x: number,y: number): PuntoSuelo=>[(x-930)/37,(y-490)/37];
const ZPB: Record<string, Record<string, {x: number; y: number}>>={};
const ZSTYLE: Record<string, {bg: string; g: string; e: string}>={jardin:{bg:'#D9F1FB',g:'#BFE6A0',e:'#D9A86C'},bosque:{bg:'#CFEFD0',g:'#9FD08A',e:'#B98A5B'},montana:{bg:'#DCE6F7',g:'#CFE3B5',e:'#B5A79A'},fiestas:{bg:'#FFE6F0',g:'#FFE3B8',e:'#E8B98A'},ingles:{bg:'#DDEBFF',g:'#CFE8C0',e:'#C9A57A'}};
// slab(to,w,d,c,e,y,r): losa de suelo con esquinas redondeadas (ancho w, fondo d, radio r) con césped c y borde e, a la altura y.
// La añade a to (con contorno) y devuelve la malla (se usa como w.ground).
function slab(to: Tres.Object3D,w: number,d: number,c: string,e: string,y=0,r=3){const s=new THREE.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);
  const g=new THREE.ExtrudeGeometry(s,{depth:1.6,bevelEnabled:true,bevelThickness:.3,bevelSize:.4,bevelSegments:2,curveSegments:10});g.rotateX(PI/2);const m=new THREE.Mesh(g,[M(c),M(e)]);m.position.y=y-.3;m.receiveShadow=true;to.add(m);
  const o=new THREE.Mesh(olGeo(g),OLm(.1));o.position.copy(m.position);to.add(o);return m}
// casita3(to,t,p,o): casita de un tema t (TEMA) en la posición p=[x,z]. o = {s: escala, locked: cerrada (gris y candado), unl: se está abriendo}.
// El Rincón de los Conceptos (t.concepts) es una mesa con figuras. Delante pone una bolita por juego (doradas las hechas) y,
// si el tema está terminado, una estrella y flores. Devuelve el grupo (userData.tema = id del tema, para pickAt).
function casita3(to: Tres.Object3D,t: Tema,p: PuntoSuelo,o: Libre){const g=grp(to,[p[0],0,p[1]],o.s||1),lk=o.locked,st=tst(t.id),n=gDone(t);g.userData.id='t:'+t.id;g.userData.tema=t.id;
  if(t.concepts){mk(rbox(2.6,1.7,2,.2),lk?'#CFC8BF':'#9B8AD9',{p:[0,.85,0],to:g,ol:.06});mk(Box(2.2,.1,1.6),'#EDE7FF',{p:[0,1.72,0],to:g,ol:.03});
    mk(Sph(.38,16,12),'#FF8A7A',{p:[-.6,2.15,0],to:g,ol:.04});mk(Box(.6,.6,.6),'#5BB8E6',{p:[.25,2.08,.1],r:[0,.5,0],to:g,ol:.04});mk(Cone(.35,.7,4),'#7CC86E',{p:[.9,2.12,-.2],to:g,ol:.04});
    const s2=mk(starGeo(.42,.14),'#FFC93C',{p:[0,2.95,0],to:g,ol:.03});g.userData.spin=s2}
  else{const roof=lk?'#CFC8BF':t.c;mk(Box(2.2,1.55,1.8),'#FFF6E6',{p:[0,.78,0],to:g,ol:.06});mk(Cone(1.8,1.25,4),roof,{p:[0,2.17,0],r:[0,PI/4,0],to:g,ol:.06});
    mk(Box(1.1,1.02,.1),'#FFFFFF',{p:[-.35,.92,.92],to:g,ol:.035});plane(picTex(t.icon),1,1,{p:[-.35,.92,.98],to:g});
    mk(Box(.45,.95,.08),'#C98A4B',{p:[.68,.48,.92],to:g,ol:.03});
    const bt=canvasTex(160,160,()=>{circ(80,80,70,'#fff',8);pic(t.icon,80,82,108)},'badge:'+t.icon);const bs=spr(bt,1.35,1.35,{p:[0,3.35,.2],to:g});if(lk)bs.material.color.set('#C9C2B8');g.userData.badge=bs}
  const k=t.games.length;for(let j=0;j<k;j++)mk(Sph(.17,10,8),j<n?'#FFC93C':'#EADFCF',{p:[-((k-1)*.2)+j*.4,.18,1.4],ol:.02,cs:false,to:g});
  if(st.done){const s=mk(starGeo(.4,.13),'#FFC93C',{p:[.95,2.75,.3],to:g,ol:.03});g.userData.spin=g.userData.spin||s;flower3(g,-1.3,1.1,FLC[1],.7);flower3(g,1.3,1.1,FLC[3],.7)}
  const hit=new THREE.Mesh(Box(2.9,3.4,2.6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.5;g.add(hit);
  if(lk||o.unl){g.userData.lock=lock3(g,[.75,2.85,.9],.8);if(lk)g.traverse((m: Nodo)=>{if(m.isMesh&&m.material&&m.material.map&&!m.material.isMeshToonMaterial){m.material=m.material.clone();m.material.color.set('#C9C2B8')}})}
  return g}
// roadPts(P,o): puntos de un camino que une los puntos P=[[x,z],...]: recto en la misma fila y, al cambiar de fila, una curva
// que sale hacia el lado (o = cuánto se abre). Devuelve la lista de puntos para ribbon().
export function roadPts(P: PuntoSuelo[],o: number){const r: PuntoSuelo[]=[];for(let i=0;i<P.length;i++){if(!i){r.push(P[0]);continue}const a=P[i-1],b=P[i];
  if(Math.abs(a[1]-b[1])<.2){for(let k=1;k<=12;k++)r.push([lerp(a[0],b[0],k/12),a[1]])}
  else{const sd=(a[0]+b[0])/2>0?1:-1;for(let k=1;k<=24;k++){const t=k/24,u=1-t;const c1=[a[0]+sd*o,a[1]],c2=[b[0]+sd*o,b[1]];r.push([u*u*u*a[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*b[0],u*u*u*a[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*b[1]])}}}return r}
// zoneDecor(w,z): pone la decoración y los objetos tocables de la zona z (jardin, bosque, montana, fiestas, ingles): animales y objetos
// con sus funciones *3 (frog3, owl3...), árboles, flores, cosas que caen (fallPts) y las letras flotantes / bloques HELLO del inglés.
// Aquí se añade un objeto 3D nuevo a una zona (ver docs/COMO-AGREGAR.md).
function zoneDecor(w: Mundo,z: string){const D=w.sc;
  if(z==='jardin'){frog3(w,7.9,5.4,1.1);can3(w,4.6,6,1.25);sunf3(w,-1.6,7,1.1);scare3(w,-7.5,8.3,.95);burrow3(w,-9.4,7.3,1.2)}if(z==='jardin'&&!skyNow().night){kite3(w,8.6,5.6,-6,1.15);bee3(w,-6,-6.4,0,1.9);bee3(w,8,-6.6,2.5,1.9);/* abejas */([['#FF8FB1',-8,2],['#FFC93C',4,-3],['#9B8AD9',10,3],['#7FD3F0',-2,-6]] as [string, number, number][]).forEach(([c,x,zz],i)=>butterfly3(w,x,zz,c,i*1.7))}// mariposas en el jardín (de noche duermen)
  if(z==='jardin'||z==='ingles'){for(let i=0;i<14;i++)flower3(D,-15+i*2.3,-8.2+(i%2)*.4,FLC[i%7],.8);for(let i=0;i<9;i++)bush3(D,-15.5+i*3.9,8.6,.8);for(const x of[-17.5,17.5])for(let i=0;i<5;i++)tree3(D,x,-6+i*3,.75,i%2?'primavera':'verano')}
  if(z==='bosque'){owl3(w,7.9,5.4,1.15);leafs3(w,-1.2,6.8,1.1);nest3(w,.6,8.6,1.25);if(hallowNow())[[-4.2,8.7],[8.3,8.7],[-10.8,8.9]].forEach(([a,b])=>pump3(w,a,b,.55));wpk3(w,10.4,6.4,1.1);ants3(w,5.4,7.8,1.25);squir3(w,-9.4,7.3,1.3);fallPts(w,40,['#F28C38','#E8603C','#F2C14E','#C9772E'],{size:1.5,map:canvasTex(32,32,()=>{ctx.beginPath();ctx.ellipse(16,16,13,7,.6,0,PI*2);ctx.fillStyle='#fff';ctx.fill()},'leaf'),sp:.6,sw:1.3});/* hojas que caen */for(let i=0;i<12;i++)tree3(D,-16.5+i*3,-8.6,.85+(i%3)*.15,i%3?'verano':'otoño',i%2);for(const x of[-18,18])for(let i=0;i<5;i++)tree3(D,x,-6+i*3,.8,'verano',i%2);for(let i=0;i<8;i++)rock3(D,-14+i*4,8.7,.5);[[-16,6.5],[-12,8.9],[-5.5,9],[2,8.8],[10,9],[15.5,6.8]].forEach(([x,zz],i)=>mush3(D,x,zz,.9+(i%3)*.2))}
  if(z==='montana'){[[-15,-22,7,10],[-5,-25,8,12.5],[6,-24,7.5,11],[16,-22,7,9.5]].forEach(([x,zz,r,h])=>{mk(Cone(r,h,10),'#B9C7DA',{p:[x,h/2-.3,zz],to:D,ol:.1}).userData.mount=1;mk(Cone(r*.38,h*.38,10),'#FFFFFF',{p:[x,h-.3-h*.19,zz],to:D,ol:.07}).userData.mount=1});
    for(let i=0;i<10;i++)rock3(D,-16+i*3.6,8.6,.6+(i%3)*.2);fallPts(w,70,['#FFFFFF','#F4FAFF'],{size:.9,map:canvasTex(64,64,()=>{ctx.beginPath();ctx.arc(32,32,20,0,PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#9DBFE3';ctx.stroke()},'snow'),sp:.9,sw:.5});/* copos de nieve que caen despacio */snowman3(w,-10.8,6.2,.8);snowman3(w,10,5.2,.9);peng3(w,5.2,7.6,5.6,1.25);igloo3(w,-2,5.8,.9);sled3(w,-6.6,7.4,1.1);goat3(w,1.4,8.6,1.35);marm3(w,7.6,8.4,1.6);for(const x of[-18,18])for(let i=0;i<4;i++)tree3(D,x,-4+i*3,.8,'verano',1)}
  if(z==='fiestas'){fallPts(w,60,DIAC,{size:1,map:canvasTex(32,32,()=>{ctx.fillStyle='#fff';ctx.fillRect(9,4,14,24)},'conf'),sp:.7,sw:.9});/* confeti que cae despacio */pinata3(w,-7.2,5.3,.9);cake3(w,7.9,5,1.4);drum3(w,.8,5.4,1.1);jack3(w,4.4,5.6,1.1);cann3(w,-3.4,5.6,1.5);bubbles3(w,-1.3,6.2,1.25);garland3(w,-6.6,3.9);for(let i=0;i<10;i++)balloon3(D,-15+i*3.3,-7.5,DIAC[i%7],2.5+(i%3)*.5);for(let i=0;i<8;i++){const b=grp(D,[-14+i*4,0,8]);b.userData.gift=1;mk(Box(.8,.7,.8),DIAC[i%7],{p:[0,.35,0],to:b,ol:.035});mk(Box(.18,.72,.82),'#FFC93C',{p:[0,.35,0],ol:.02,to:b})}}
  if(z==='ingles'){// letras del abecedario que suben flotando despacio, como pompas
    const AB='ABCDEFGHIJ';for(let i=0;i<10;i++){const L=AB[i],q=spr(canvasTex(128,128,()=>text(L,64,104,104,DIAC[i%7],{f:LF,st:8,sc:K}),'abcf'+L),1.4,1.4,{p:[-16+i*3.5,(i*37%9),-6+(i*53%12)],to:D,op:.9});
      q.userData.abc=i+1;q.userData.dur=.6;/* al tocar una letra, crece, gira y explota con su nota, y vuelve a salir desde abajo */
      w.upd.push((dt: number)=>{const u=q.userData,e=u.wob==null?9:T-u.wob;if(e<.6){q.scale.setScalar(1.4*(1+e*1.4));q.material.rotation+=dt*12;q.material.opacity=.9*(1-e/.6);u.pp=1;return}
        if(u.pp){u.pp=0;q.position.y=0;q.scale.setScalar(1.4);q.material.opacity=.9}q.position.y+=dt*.45;q.position.x+=Math.sin(T+i)*dt*.3;q.material.rotation=Math.sin(T*.8+i)*.25;if(q.position.y>9)q.position.y=0})}}
  if(z==='ingles'){bus3(w,7.2);phone3(w,8.2,4.4,1);clock3(w,-1.6,4.8,.85);post3(w,3.8,5,1);tea3(w,-5.8,4.6,1.5);guard3(w,-9.6,4.8,1.3);flag3(w,6,3.4,1.1);umb3(w,.9,6.4,1)}
  if(z==='ingles'){['H','E','L','L','O'].forEach((l,i)=>{const t=canvasTex(128,128,()=>{ctx.fillStyle=DIAC[i];ctx.fillRect(0,0,128,128);text(l,64,100,96,'#fff',{f:LF,st:8})},'abc'+l+i);const m=new THREE.Mesh(Box(1.2,1.2,1.2),new THREE.MeshToonMaterial({map:t,gradientMap:gradiente()}));m.position.set(-4+i*2,.6,-8.2);m.rotation.y=(i%2?.2:-.2);m.castShadow=true;m.userData.letter=i+1;D.add(m)})}}
// buildZone(z,st): construye el mundo 3D de la zona z (camino de casitas). st es la escena de la zona (titoAt, cur = tema siguiente,
// hov, hop, unl, lockShake). Pone suelo, decoración, cielo según la hora (luna con gorro, sol con accesorios según el mes),
// carteles de estación, camino (en amarillo lo ya recorrido), casitas, flecha al tema siguiente, Tito y la animación por cuadro.
function buildZone(z: string,st: Escena){const Z=ZONES[z],sty=ZSTYLE[z]||ZSTYLE.jardin,w=newWorld({fov:36,bg:sty.bg,kind:'zone',shadow:22});w.z=z;
  w.ground=slab(w.sc,38,20,sty.g,sty.e);w.gb=[-16,16,-8,5.5];// que Tito no se salga del cuadro
  zoneDecor(w,z);
  // de noche, las zonas también: cielo de noche, un poco menos de luz y luciérnagas en las zonas verdes (como el mapa)
  {const hr=ahora().getHours();if(!skyNow().night&&(hr>=18||hr<9))w.sc.background=new THREE.Color(sty.bg).lerp(new THREE.Color(hr>=18?'#FFC9A0':'#FFDCE6'),hr>=18?.45:.4)}/* al atardecer el cielo se pone anaranjado, y al amanecer rosado */
  if(skyNow().night){w.sc.background=new THREE.Color('#3B4A86');w.sc.children.forEach((o: Nodo)=>{if(o.isLight)o.intensity!*=.82});if(['jardin','bosque','ingles'].includes(z))fireflies(w,30,14);skyStars(w,1.2,-18,56,3.4);if(z!=='montana'){const G=zoneMoon(w,-12,1.95,-19);orbFace(w,G,1);skyClouds(w,'#D2D8F6');bigDipper(w);jupiter(w);saturn(w);if(xmasNow())xmasSleigh(w);{const xm=xmasNow(),dd=ahora(),hw=dd.getMonth()===9&&dd.getDate()>=25,h=new THREE.Group();h.position.set(-.2,.95,.15);h.rotation.z=.4;G.add(h);if(hw){mk(Cyl(.85,.85,.06,20),'#5A3A8A',{ol:.04,cs:false,rs:false,to:h});mk(Cone(.45,1.2,14),'#5A3A8A',{p:[0,.62,0],r:[0,0,.15],ol:.04,cs:false,rs:false,to:h});mk(Cyl(.47,.47,.12,16),'#FF9A3C',{p:[0,.1,0],ol:0,cs:false,rs:false,to:h})}/* en Halloween, la luna también lleva sombrero de bruja */else{mk(Cone(.6,1.1,14),xm?'#E8503C':'#6C7BD9',{p:[0,.5,0],ol:.04,cs:false,rs:false,to:h});mk(Cyl(.64,.64,.18,16),'#FFFFFF',{ol:.03,cs:false,rs:false,to:h});mk(Sph(.17,10,8),xm?'#FFFFFF':'#FFE45C',{p:[0,1.05,0],ol:.03,cs:false,rs:false,to:h});h.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}})}}/* la luna duerme con su gorro de dormir (en Navidad, rojo como el de Papá Noel) */
    if(ahora().getMonth()===9)for(let i=0;i<2;i++){const b=new THREE.Group();w.sc.add(b);const W: [Tres.Group, number][]=[];mk(Sph(.16,10,8),'#6E5C96',{ol:0,cs:false,rs:false,to:b});for(const sd of[-1,1]){const a=new THREE.Group();a.position.x=sd*.1;b.add(a);mk(Cone(.22,.5,3),'#6E5C96',{p:[sd*.26,0,0],r:[0,0,sd*PI/2],ol:0,cs:false,rs:false,to:a});W.push([a,sd])}b.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}});
      w.upd.push(()=>{const t=T*.9+i*PI;b.position.set(-12+Math.cos(t)*2.6,1.8+Math.sin(t)*1.1,-18.2+Math.sin(t)*.3);W.forEach(([a,sd])=>a.rotation.z=sd*Math.sin(T*12+i)*.6)})}/* en octubre, dos murciélagos dan vueltas a la luna */}}else if(z!=='montana'){const dk=ahora().getHours()>=18,mo0=ahora().getMonth(),sy=dk?1.5:1.95/* un poco bajo, para que se vea lo que lleva en la cabeza */,C=dk?['#FF8A2A','#6A2200','#FFB070']:ahora().getHours()<9?['#FFC64A','#C07A10','#FFD9A0']/* al amanecer, el sol aún algo anaranjado */:['#FFD447','#E0A020','#FFE58A'],G=zoneMoon(w,-12,sy,-19,...C);orbFace(w,G,0);const bd=isBday(),fz=z==='fiestas',hw=mo0===9&&ahora().getDate()>=25,acc=bd||fz||hw;G.userData.fz=fz;
    if(acc){const h=new THREE.Group();h.position.set(.2,1.0,.2);h.rotation.z=-.3;G.add(h);if(bd||fz){mk(Cone(.5,1.1,16),'#FF6FA8',{p:[0,.5,0],ol:.04,cs:false,rs:false,to:h});for(let k=0;k<3;k++)mk(Cyl(.47-k*.14,.47-k*.14,.06,16),['#FFE45C','#7ED957','#5AB8F0'][k],{p:[0,.12+k*.3,0],ol:0,cs:false,rs:false,to:h});mk(Sph(.16,10,8),'#FFE45C',{p:[0,1.08,0],ol:.03,cs:false,rs:false,to:h})/* el día de su cumpleaños (y en la zona de fiestas), el sol lleva gorro de fiesta */;
        if(bd)['#FF6B6B','#FFE45C','#5AB8F0','#7ED957'].forEach((c,i)=>{const b=balloon3(w.sc,-14+i*9,-12,c,1.4);b.userData.balloon=0;b.userData.bball=1;b.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}});hitS(b,.6,1.75);let py=0;w.upd.push(()=>{const y=(T*.5+i*2.7)%11-4;if(y<py)b.visible=true/* el globo explotado vuelve a salir abajo */;py=y;b.position.y=y;b.position.x=-14+i*9+Math.sin(T*.8+i)*.6})})/* y suben globos por el cielo */}
      else{mk(Cyl(.85,.85,.06,20),'#5A3A8A',{ol:.04,cs:false,rs:false,to:h});mk(Cone(.45,1.2,14),'#5A3A8A',{p:[0,.62,0],r:[0,0,-.15],ol:.04,cs:false,rs:false,to:h});mk(Cyl(.47,.47,.12,16),'#FF9A3C',{p:[0,.1,0],ol:0,cs:false,rs:false,to:h})/* la última semana de octubre, sombrero de bruja */}h.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}})}
    {const mo=ahora().getMonth();if(!acc&&(mo===11||mo<=1)){const h=new THREE.Group();h.position.set(.25,.95,.2);h.rotation.z=-.35;G.add(h);mk(Cone(.62,.95,14),'#E8503C',{p:[0,.42,0],ol:.04,cs:false,rs:false,to:h});mk(Cyl(.66,.66,.2,16),'#FFFFFF',{ol:.03,cs:false,rs:false,to:h});mk(Sph(.18,10,8),'#FFFFFF',{p:[0,.92,0],ol:.03,cs:false,rs:false,to:h});h.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}})}}/* en invierno, el sol lleva gorro de lana */
    if(!acc&&mo0>=5&&mo0<=7){const h=new THREE.Group();h.position.set(0,.2,1.12);G.add(h);for(const sd of[-1,1])mk(Cyl(.3,.3,.05,16),'#2A2A3A',{p:[sd*.38,0,0],r:[PI/2,0,0],ol:.02,cs:false,rs:false,to:h});mk(Box(.3,.06,.05),'#2A2A3A',{p:[0,.04,0],ol:0,cs:false,rs:false,to:h});h.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}})}/* en verano, gafas de sol */
    if(!acc&&mo0>=2&&mo0<=4){const h=new THREE.Group();h.position.set(0,.88,.55);G.add(h);([[-.5,-.16,'#FF8FB1'],[0,.05,'#FFFFFF'],[.5,-.16,'#C9A2F2']] as [number, number, string][]).forEach(([x,y,c])=>{for(let k=0;k<5;k++){const a=k/5*PI*2;mk(Sph(.13,8,6),c,{p:[x+Math.cos(a)*.17,y+Math.sin(a)*.17,0],ol:.02,cs:false,rs:false,to:h})}mk(Sph(.1,8,6),'#FFB43A',{p:[x,y,.06],ol:.02,cs:false,rs:false,to:h})});h.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}})}/* en primavera, flores en la cabeza */
    if(!acc&&mo0>=8&&mo0<=10){const h=new THREE.Group();h.position.set(.32,1.22,.3);h.rotation.z=.9;G.add(h);mk(Sph(.42,12,8),'#E8703C',{s:[1,.5,.25],ol:.03,cs:false,rs:false,to:h});mk(Cyl(.025,.025,.3,5),'#8A5A2E',{p:[-.38,-.04,0],r:[0,0,PI/2],ol:0,cs:false,rs:false,to:h});h.traverse((o: Nodo)=>{if(o.isMesh)o.raycast=()=>{}})}/* en otoño, una hoja en la cabeza */sunRays(w,-12,sy,-19,C[0],C[1]);skyClouds(w);skyBirds(w)}else if(!skyNow().night)mountEagle(w);/* en la montaña, de día, un águila *//* al atardecer, el sol está más bajo y naranja *//* de día, un sol en el mismo sitio (en la montaña no: la tapa el pico) */
  for(let i=0;i<4;i++)cloud3(w.sc,-20+i*13,10+(i%2)*1.5,-14,.9);
  const main=MAINZ.includes(z),path=z==='fiestas'?FIESTAS:main?pathOf(z):Z.temas,B: Record<string, PuntoSuelo>=w.base={};
  for(const t of Z.temas)B[t.id]=ZX(ZPB[z][t.id].x,ZPB[z][t.id].y);
  // carteles de estación de cada fila: en el borde (x≈-17) quedaban detrás de los árboles o fuera de la pantalla;
  // ahora van detrás de la fila, entre la 1.ª y la 2.ª casita, y Tito los esquiva al pasear
  if(main){['hojaNaranja','copo','flor'].forEach((k,i)=>{const zz=ZX(292,[250,490,725][i])[1]-1.8,x=-10.2;const g=grp(w.sc,[x,0,zz]);g.userData.sign=1;g.userData.sk=i;(w.avoid=w.avoid||[]).push([x,zz,.8]);mk(Cyl(.07,.07,1.4,6),'#C98A4B',{p:[0,.7,0],to:g,ol:.025});spr(canvasTex(160,160,()=>{circ(80,80,68,'#fff',8);pic(k,80,80,104)},'season'+k),1.4,1.4,{p:[0,1.75,0],to:g})})}
  const pts=path.map(t=>B[t.id]),ci=st.cur?path.indexOf(st.cur):path.length-1,rp=roadPts(pts,4.4);
  ribbon(w.sc,rp,1.5,'#FFF6E0',.04,{dash:4,dashC:'#C9AE7A'});
  if(ci>0){const per=rp.length/(pts.length-1||1);ribbon(w.sc,rp.slice(0,Math.round(ci*per)+1),1.5,'#FFE08A',.05,{polygonOffset:1})}
  w.cas={};for(const t of Z.temas){const g=casita3(w.sc,t,B[t.id],{s:main?1:1.25,locked:!temaOpen(t),unl:st.unl&&st.unl.id===t.id});w.cas[t.id]=g;w.pick.push(g)}
  w.avoid=(w.avoid||[]).concat(Object.values(w.cas).map(g=>[g.position.x,g.position.z,(main?1:1.25)*2.4]));
  const c=Z.temas.find(t=>t.concepts);if(c&&!temaOpen(c)){spr(flowerTex(FLC[0],Math.min(pathDone(z),3)+'/3'),2.3,1.15,{p:[B[c.id][0],.9,B[c.id][1]+2.4],to:w.sc})}
  let ar: ReturnType<typeof arrow3>|null=null,rg: ReturnType<typeof ring3>|null=null;if(st.cur){const p=B[st.cur.id];ar=arrow3(w.sc,[p[0],5.2,p[1]],.85);rg=ring3(w.sc,[p[0],.08,p[1]],2.1)}
  const tito=makeTito();tito.scale.setScalar(.62);const ta=B[(st.titoAt&&B[st.titoAt]&&st.titoAt)||(st.cur&&st.cur.id)||path[0].id];tito.position.set(ta[0]+1.9,0,ta[1]+1.2);tito.rotation.y=-.3;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  w.upd.push((dt: number)=>{const wk=walkTick(w,tito,dt);tito.userData.anim(dt,{walk:wk,hop:st.hop,hov:st.hovTito});
    if(ar){ar.position.y=5.1+Math.abs(Math.sin(T*4))*.45;arrowSway(w,ar);rg!.material.opacity=.45+.35*Math.sin(T*4)}
    // cada casita: la estrella gira, crece con el ratón encima y su candado se abre o tiembla como en el mapa
    for(const id in w.cas){const g=w.cas[id];if(g.userData.spin)g.userData.spin.rotation.y=T*1.5;const hs=st.hov===id&&!busy3(w)?1.07:1,s0=main?1:1.25;g.scale.setScalar(lerp(g.scale.x,hs*s0,.2));
      const L=g.userData.lock;if(L){if(st.unl&&st.unl.id===id&&T>st.unl.t){const k=(T-st.unl.t)/1.3;if(k>1){g.remove(L);g.userData.lock=null}else{L.position.set(.75+k*1.5,2.85+k*k*5,.9);if(k>.15&&g.userData.badge)g.userData.badge.material.color.set('#fff');L.rotation.z=k*3}}
        else{L.position.y=2.85+Math.sin(T*2+g.position.x)*.1;const sh=st.lockShake&&st.lockShake.id===id?Math.max(0,1-(T-st.lockShake.t)*2):0;L.rotation.z=Math.sin(T*40)*.3*sh}}}});
  wobInit(w);
  camRig(w,V3(0,20,24.5),V3(0,0,-.9),1.4);return w}
// montarZonas3D(): convierte en 3D las escenas de las zonas. La llama mundo3d/mundo3d.ts al montar la capa 3D.
export function montarZonas3D(): void{
// primero, la copia de las posiciones 2D originales de las casitas (antes de que sync() las cambie)
for(const z in ZPOS){ZPB[z]={};for(const id in ZPOS[z])ZPB[z][id]={x:ZPOS[z][id].x,y:ZPOS[z][id].y}}
// Convierte en 3D las escenas de cada zona de ZONES (igual que el mapa): se guardan enter/down originales y se sustituyen.
for(const z in ZONES){const S0=SCENES[z],enter0=S0.enter!,down0=S0.down!;
  Object.assign(S0,{three:true,
    // enter(o): entra a la zona (o.from = tema del que se viene, ahí aparece Tito) y construye su mundo 3D
    enter(o: Libre){this.hov=null;this.hop=null;this.lockShake=null;enter0!.call(this,o);if(sceneName!==z)return;if(o&&o.from)this.titoAt=o.from;setWorld(buildZone(z,this));this.sync()},
    // sync(): proyecta cada casita a la pantalla y la escribe en ZPOS (lógica 2D de escenas/zonas.ts); también Tito
    sync(){const w=W3;if(!w||w.kind!=='zone')return;const P=ZPOS[z];for(const id in w.cas){const [x,y]=projR(w.cas[id],1.6,1.3);P[id].x=x;P[id].y=y}titoRect(w.tito!)},
    // draw(): cada cuadro: qué casita hay bajo el ratón, cartel con el nombre de la zona y de la casita, botones y bocadillo de Tito
    draw(){this.sync();const w=W3,Z=ZONES[z];let hv_=null;
      let hT=false;if(VIVO.mouseOn&&!VIVO.drag&&!(w&&busy3(w))){const u=pickAt(VIVO.MX,VIVO.MY);if(u&&u.tema){hv_=u.tema;VIVO.hovNow='j:'+u.tema}else if(u&&u.id==='tito'){VIVO.hovNow='tito';hT=true}}this.hov=hv_;this.hovTito=hT;
      {const nm=cap(Z.name);ctx.font=`600 44px ${DF}`;const tw=Math.min(900,ctx.measureText(nm).width);card(800-tw/2-40,26,tw+80,80,'rgba(255,255,255,.92)',6,40);text(nm,800,82,44,K,{w:600})}
      // nombre de la casita bajo el ratón; en la fila de arriba no se monta sobre el cartel de la zona
      if(hv_){const t=TEMA[hv_],p=ZPOS[z][hv_];ctx.font=`600 32px ${DF}`;const nm=t.concepts?'Rincón de los Conceptos':V(t.n),tw=ctx.measureText(nm).width,cy=Math.max(p.y-178,116);card(p.x-tw/2-24,cy,tw+48,54,'rgba(255,255,255,.92)',5,27);text(nm,p.x,cy+38,32,K,{w:600})}
      drawHome();drawCoinHUD();
      if(VIVO.talking){const bx=TITO.x+TITO.w*.85,by=TITO.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
    // down(x,y): toque en la zona: botones; objetos que vuelan; nada -> objeto tocable, cielo (skyTap) o pasear; Tito -> salta;
    // casita cerrada -> tiembla el candado; casita abierta -> Tito camina hasta ella y luego se entra (down original)
    down(x: number,y: number){const w=W3;if(!w||busy3(w))return;
      if(atHome(x,y)||inCoinHUD(x,y))return call0(down0,this,x,y);
      const u=pickAt(x,y);if(flyTap(w,x,y))return;if(!u){if(wobTap(w,x,y))return;if(y<260&&!(w.ground&&RC.intersectObject(w.ground,false)[0])){skyTap(x,y,w);return}/* tocar el cielo vacío */SFX.tap();if(skyNow().night)ffTap(x,y);else sparkles(x,y);walkGround(w);return}
      if(u.id==='tito'){this.hop=T;titoTapSfx();titoHearts(x,y);this.prompt!(true);return}
      const t=TEMA[u.tema];if(!t)return;const p=ZPOS[z][t.id];
      if(!temaOpen(t)){this.lockShake={id:t.id,t:T};return call0(down0,this,p.x,p.y)}
      const g=w.cas![t.id];this.titoAt=t.id;walkTo(w,w.tito!,g.position.clone().add(V3(1.9,0,1.5)),()=>{if(sceneName===z)call0(down0,this,p.x,p.y)},{zoom:V3(0,7,6)})}} satisfies Escena)}
}
