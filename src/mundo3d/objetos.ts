/*
 * mundo3d/objetos.ts: los animales y las cosas que se pueden tocar en las zonas y en el mapa (desde la fase 4h; antes,
 * en mundo3d/mundo3d.ts): setas, autobús, muñeco de nieve, piñata, abejas, búho, teléfono, ranas, cangrejos, tarta,
 * mariquitas, pájaros, pingüinos, ardillas, madrigueras, reloj, iglú, tambor, buzón, hormigas, faro, guirnaldas, ballena,
 * delfines, calabazas, cometas, cabañas, tazas de té, caja sorpresa, latas, trineo, mochila, pelota, guardia inglés,
 * cañón de confeti, cabra, palmeras, girasoles, loro, banderas, pompas, nido, marmota, espantapájaros, sombrilla, toalla y
 * castillo de arena (todas las funciones xxx3, con el patrón común que se explica antes de cann3). También las fechas
 * (xmasNow, hallowNow, summerNow, winterNow, seasonFx), las nubes y los globos de adorno (cloud3, balloon3) y lo que se
 * usa al tocar: hitS (zona de toque invisible), titoCheer, dropParts, allTap (premio por tocarlos todos) y chainWob
 * (reacciones en cadena). Lo que suena y dice Tito al tocarlos está en wobTap (mundo3d/interaccion.ts).
 * Usa THREE solo dentro de las funciones: el módulo se carga igual sin Three.js.
 * Exporta: todo lo de arriba. Importa: del núcleo T, PI, SCENES, ctx, text, tone, parts, sparkles, pick, rnd, sceneName,
 * DIAC y LF; K (src/dibujos/); ahora() (aplicacion/puertos.ts); W3 (mundo3d/motor.ts); piezas de mundo3d/materiales.ts;
 * la voz del paisaje y skyNow (mundo3d/cielo.ts), fallPts, fhit y softTex (mundo3d/decorado.ts) y noteParts
 * (mundo3d/personajes.ts).
 */
import * as THREE from 'three';
import type { Mundo, Nodo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DIAC, LF, PI, SCENES, T, ctx, parts, pick, rnd, sceneName, sparkles, text, tone } from '../nucleo/indice.ts';
// ahora() y azar(): la fecha y la hora y el azar (puertos de aplicacion/puertos.ts, desde la fase 3g; antes new
// Date() y Math.random()).
import { ahora } from '../aplicacion/puertos.ts';
import { W3 } from './motor.ts';
import { Box, Cone, Cyl, M, Sph, canvasTex, gcache, gradiente, grp, mg, mk, rbox, spr, starGeo } from './materiales.ts';
import { numPop, say3, sayNum, skyNow, sylClap } from './cielo.ts';
import { fallPts, fhit, softTex } from './decorado.ts';
import { noteParts } from './personajes.ts';

// seta de sombrero rojo con lunares; al tocarla se aplasta y rebota como los arbustos
// mush3(to,x,z,s): seta de sombrero rojo con lunares (de noche brillan). Marca userData.mush.
export function mush3(to: THREE.Object3D,x: number,z: number,s: number){const g=grp(to,[x,0,z],s);g.userData.mush=1;mk(Cyl(.16,.2,.5,12),'#FFF6E6',{p:[0,.25,0],to:g,ol:.025});
  const nt=skyNow().night,cap=new THREE.SphereGeometry(.42,16,10,0,PI*2,0,PI/2);/* de noche las setas brillan un poco */mk(cap,nt?M('#E8503C',{emissive:'#6A1A0E'}):'#E8503C',{p:[0,.48,0],s:[1,.75,1],to:g,ol:.03});
  const dc=nt?M('#FFFFFF',{emissive:'#8FE3FF'}):'#FFFFFF';for(let i=0;i<5;i++){const a=i/5*PI*2;mk(Sph(.06,8,6),dc,{p:[Math.cos(a)*.26,.68,Math.sin(a)*.26],s:[1,.5,1],ol:0,cs:false,to:g})}mk(Sph(.07,8,6),dc,{p:[0,.8,0],s:[1,.5,1],ol:0,cs:false,to:g});return g}
// autobús rojo de dos pisos que va y viene; al tocarlo da un saltito y pita
// bus3(w,z): autobús rojo de dos pisos que va y viene por x entre -14 y 14 en la línea z, girando al dar la vuelta.
// De noche lleva luces. Al tocarlo (userData.bus) da un saltito.
export function bus3(w: Mundo,z: number){const D=w.sc,b=grp(D,[0,0,z],.9),body=grp(b,[0,0,0]);b.userData.bus=1;
  mk(rbox(3,1.9,1.2,.12),'#D9302C',{p:[0,1.25,0],to:body,ol:.05});mk(Box(3.02,.12,1.22),'#FFF3D6',{p:[0,1.3,0],ol:0,to:body});
  const nt=skyNow().night;for(const y of[.95,1.75])for(const sd of[-1,1])mk(Box(2.5,.38,.02),nt?M('#FFE08A',{emissive:'#C98A00'}):'#BFE6F8',{p:[0,y,sd*.61],ol:0,cs:false,to:body});
  for(const sd of[-1,1])mk(Sph(.13,10,8),nt?M('#FFF6C0',{emissive:'#FFD23C'}):'#F2EEE0',{p:[1.5,.62,sd*.38],s:[.5,1,1],ol:.015,cs:false,to:body});/* faros (de noche encendidos, y las ventanas con luz) */
  for(const x of[-.95,.95])for(const sd of[-1,1])mk(Cyl(.28,.28,.2,14),'#3A2E2A',{p:[x,.3,sd*.55],r:[PI/2,0,0],ol:.02,to:b});
  let x=-14,dir=1;w.upd.push((dt: number)=>{x+=dir*dt*1.6;if(x>14){x=14;dir=-1}if(x<-14){x=-14;dir=1}b.position.x=x;b.rotation.y+=((dir>0?0:PI)-b.rotation.y)*Math.min(1,dt*4);
    const k=b.userData.wob,e=k==null?9:T-k;body.position.y=(e<.5?Math.sin(e/.5*PI)*.4:0)+Math.abs(Math.sin(T*8))*.02});return b}
// muñeco de nieve; al tocarlo el sombrero da un salto y gira
// snowman3(w,x,z,s): muñeco de nieve; al tocarlo el sombrero salta dando una vuelta. Marca userData.snowman.
export function snowman3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.snowman=1;
  mk(Sph(.7,18,14),'#FFFFFF',{p:[0,.62,0],to:g,ol:.03});mk(Sph(.5,18,14),'#FFFFFF',{p:[0,1.6,0],to:g,ol:.03});
  for(const sd of[-1,1])mk(Sph(.06,8,6),K,{p:[sd*.17,1.7,.44],ol:0,cs:false,to:g});mk(Cone(.07,.4,8),'#FF8A3D',{p:[0,1.58,.6],r:[PI/2,0,0],ol:0,to:g});
  for(let i=0;i<3;i++)mk(Sph(.06,8,6),K,{p:[0,.5+i*.25,.68-Math.abs(i-1)*.05],ol:0,cs:false,to:g});
  mk(new THREE.TorusGeometry(.42,.09,8,20),'#E8503C',{p:[0,1.22,0],r:[PI/2,0,0],ol:0,to:g});
  const hat=grp(g,[0,2.02,0]);mk(Cyl(.45,.45,.06,16),'#3A2E2A',{to:hat,ol:.02});mk(Cyl(.3,.3,.5,16),'#3A2E2A',{p:[0,.28,0],to:hat,ol:.02});g.userData.hat=hat;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/.9,1);hat.position.y=2.02+(e<.9?Math.sin(q*PI)*.9:0);hat.rotation.y=e<.9?q*PI*2:0});return g}
// pinata3(w,x,z,s): piñata de estrella colgada de un palo; al tocarla se balancea y suelta 7 caramelos que saltan.
// Marca userData.pinata.
export function pinata3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.pinata=1;
  mk(Cyl(.08,.1,3.6,8),'#B07A4A',{p:[-1.2,1.8,0],to:g,ol:.02});mk(Cyl(.07,.07,1.5,8),'#B07A4A',{p:[-.5,3.55,0],r:[0,0,PI/2],to:g,ol:.02});
  const sw=grp(g,[.2,3.55,0]);mk(Cyl(.012,.012,.9,4),K,{p:[0,-.45,0],ol:0,cs:false,to:sw});mk(starGeo(.6,.4),'#FF6FA5',{p:[0,-1.45,0],to:sw,ol:.04});
  for(let i=0;i<5;i++){const a=PI/2+i*PI*2/5;mk(Cone(.08,.4,6),DIAC[i%7],{p:[Math.cos(a)*.62,-1.45+Math.sin(a)*.62,0],r:[0,0,a-PI/2],ol:0,cs:false,to:sw})}
  const cd: THREE.Mesh[]=[];for(let i=0;i<7;i++){const m=mk(Sph(.12,8,6),DIAC[i%7],{to:g,ol:.02,cs:false});m.visible=false;m.raycast=()=>{};cd.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;sw.rotation.z=e<2.6?Math.sin(e*6)*.45*Math.exp(-e*1.4):0;sw.rotation.y=e<2.6?e*3*Math.exp(-e):0;
    for(let i=0;i<cd.length;i++){const m=cd[i];if(e>2.4){m.visible=false;continue}const a=i/cd.length*PI*2,vx=Math.cos(a)*1.3,vz=Math.sin(a)*1.3,t=Math.min(e,.75);
      m.visible=e>.05;m.position.set(.2+vx*t,Math.max(.12,2.1+3*t-6*t*t),vz*t)}});return g}
// abeja: zumba de flor en flor; al tocarla sube dando vueltas (cuenta como mariposa para tocarla primero)
// bee3(w,cx,cz,ph,sc): abeja que zumba en ochos alrededor de (cx,cz); al tocarla sube girando. Lleva bfly y bee
// (cuenta como mariposa para algunas cosas; chainWob la separa).
export function bee3(w: Mundo,cx: number,cz: number,ph: number,sc?: number){const g=grp(w.sc,[cx,1.2,cz],sc||1.5);g.userData.bfly=1;g.userData.bee=1;g.add(new THREE.Mesh(gcache('bhit',()=>Sph(.4,6,4)),fhit()));
  mk(Sph(.2,12,10),'#FFC93C',{s:[1,1,1.35],ol:.02,cs:false,to:g});for(const z of[-.08,.1])mk(new THREE.TorusGeometry(.19,.035,6,16),K,{p:[0,0,z],s:[1,1,1],ol:0,cs:false,to:g});
  mk(Sph(.12,10,8),K,{p:[0,.02,.27],ol:0,cs:false,to:g});const W: [THREE.Group, number][]=[];
  for(const sd of[-1,1]){const pv=grp(g,[sd*.08,.14,0]);mk(Sph(.16,10,8),M('#FFFFFF',{transparent:true,opacity:.75}),{p:[sd*.14,.04,-.04],s:[1,.2,.6],ol:0,cs:false,to:pv});W.push([pv,sd])}
  let lx=cx,lz=cz;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.2,1),up=e<1.2?Math.sin(q*PI)*1.4:0;
    const t=T*.7+ph,x=cx+Math.sin(t)*4.5,z=cz+Math.sin(t*2)*1;g.position.set(x,1.1+Math.abs(Math.sin(T*2.4+ph))*.5+up,z);
    g.rotation.y=(e<1.2?q*PI*4:0)+Math.atan2(x-lx,z-lz);lx=x;lz=z;for(const [pv,sd] of W)pv.rotation.z=sd*Math.sin(T*40+ph)*.5});return g}
// búho sobre un tocón: parpadea; al tocarlo gira la cabeza y ulula
// owl3(w,x,z,s): búho sobre un tocón. De día duerme (Zzz); de noche tiene los ojos amarillos y parpadea.
// Al tocarlo gira la cabeza. Marca userData.owl.
export function owl3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.owl=1;mk(Cyl(.55,.62,.9,14),'#8A5A3A',{p:[0,.45,0],to:g,ol:.03});mk(Cyl(.5,.5,.02,14),'#D9B58A',{p:[0,.91,0],ol:0,cs:false,to:g});
  mk(Sph(.48,16,12),'#9C6B45',{p:[0,1.38,0],s:[1,1.15,.9],to:g,ol:.03});mk(Sph(.32,14,10),'#E9D2AE',{p:[0,1.3,.2],s:[1,1.2,.6],ol:0,cs:false,to:g});
  const hd=grp(g,[0,1.95,0]);mk(Sph(.4,16,12),'#9C6B45',{to:hd,ol:.03});mk(Sph(.33,14,10),'#E9D2AE',{p:[0,0,.16],s:[1.05,.85,.7],ol:0,cs:false,to:hd});const E: THREE.Mesh[]=[],EW: THREE.Mesh[]=[],nt=skyNow().night;
  for(const sd of[-1,1]){EW.push(mk(Sph(.19,12,10),nt?M('#FFE070',{emissive:'#C9A000'}):'#FFFFFF',{p:[sd*.17,.06,.3],s:[1,1,.5],ol:.02,cs:false,to:hd}));const pu=mk(Sph(.1,10,8),K,{p:[sd*.17,.07,.39],s:[1,1,.5],ol:0,cs:false,to:hd});E.push(pu);
    mk(Cone(.09,.26,6),'#7A4E30',{p:[sd*.24,.4,0],r:[0,0,-sd*.35],ol:0,cs:false,to:hd})}
  mk(Cone(.06,.16,6),'#FFA94D',{p:[0,-.08,.4],r:[PI/2+.6,0,0],ol:0,cs:false,to:hd});
  const zz=nt?null:zzz3(w,g,2.4);// el búho es nocturno: de día duerme y de noche está despierto
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.2,1),sl=!nt&&e>3,bl=sl?.12:(T%4.3)<.15?.15:1;for(const pu of E)pu.scale.y=bl;for(const m of EW)m.scale.y=sl?.15:1;if(zz)zz.forEach(z=>z.visible=!!sl);
    hd.rotation.y=e<1.2?Math.sin(q*PI*2)*1.2:sl?0:Math.sin(T*.4)*.15;hd.rotation.x=sl?.25:0;hd.rotation.z=e<1.2?Math.sin(q*PI)*.2:0});return g}
// cabina de teléfono roja (rincón de inglés): al tocarla tiembla y suena ring-ring
// phone3(w,x,z,s): cabina de teléfono roja (inglés); de noche tiene luz dentro. Al tocarla tiembla. Marca userData.phone.
export function phone3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.phone=1;const R='#D9372C';
  mk(Box(1,2.3,1),R,{p:[0,1.15,0],to:g,ol:.04});mk(Box(1.12,.18,1.12),R,{p:[0,2.38,0],to:g,ol:.03});mk(Sph(.5,14,8),R,{p:[0,2.46,0],s:[1,.35,1],to:g,ol:.03});
  const gl=canvasTex(64,128,()=>{ctx.fillStyle='#BFE6F5';ctx.fillRect(0,0,64,128);ctx.fillStyle='#D9372C';for(let i=1;i<4;i++)ctx.fillRect(0,i*32-3,64,6);ctx.fillRect(29,0,6,128)},'phonegl');
  mk(Box(.7,1.4,.02),skyNow().night?new THREE.MeshBasicMaterial({map:gl,color:'#FFF2B0'}):new THREE.MeshToonMaterial({map:gl}),{p:[0,1.15,.51],ol:0,cs:false,to:g});/* de noche la cabina tiene luz dentro */
  mk(Box(.8,.2,.02),'#FFFFFF',{p:[0,2.14,.51],ol:0,cs:false,to:g});return g}
// charca con una rana sobre un nenúfar: al tocarla da un salto y croa
// frog3(w,x,z,s): charca con nenúfares y una rana que hincha la garganta; al tocarla salta. De noche duerme.
// Marca userData.frog.
export function frog3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.frog=1;mk(Cyl(1.3,1.3,.06,24),'#7FC8E8',{p:[0,.03,0],s:[1,1,.7],ol:.02,to:g});
  mk(Cyl(.5,.5,.04,16),'#5BB04B',{p:[-.2,.08,0],ol:0,cs:false,to:g});mk(Cyl(.28,.28,.04,12),'#5BB04B',{p:[.75,.08,.2],ol:0,cs:false,to:g});
  const f=grp(g,[-.2,.1,0]);mk(Sph(.32,14,10),'#6CC24A',{p:[0,.22,0],s:[1,.7,1.1],to:f,ol:.03});
  const FE: THREE.Mesh[]=[],nt=skyNow().night;for(const sd of[-1,1]){mk(Sph(.11,10,8),'#6CC24A',{p:[sd*.15,.42,.18],to:f,ol:.02});FE.push(mk(Sph(.06,8,6),K,{p:[sd*.15,.46,.27],ol:0,cs:false,to:f}));mk(Sph(.12,8,6),'#5AAE3C',{p:[sd*.28,.08,.15],s:[1,.5,1.4],ol:.02,cs:false,to:f})}
  const th=mk(Sph(.12,10,8),'#F2E3A0',{p:[0,.2,.3],s:[1.2,.7,.6],ol:0,cs:false,to:f});
  const zz=nt?zzz3(w,f,.8):null;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/.8,1),sl=nt&&e>=.8;f.position.y=.1+(e<.8?Math.sin(q*PI)*1.1:0);f.rotation.x=e<.8?-Math.sin(q*PI)*.4:0;
    th.scale.setScalar(sl?1:1+Math.max(0,Math.sin(T*5))*.5*((T%3)<1.2?1:0));for(const m of FE)m.scale.y=sl?.15:1;if(zz)zz.forEach(z=>z.visible=!!sl)});return g}// de noche duerme sobre el nenúfar
// cangrejo de la playa del mapa: anda de lado de un lado a otro; al tocarlo abre y cierra las pinzas y corre
// crab3(w,x0,x1,z,s): cangrejo que anda de lado entre x0 y x1; al tocarlo corre y abre las pinzas. De noche duerme.
// Marca userData.crab.
export function crab3(w: Mundo,x0: number,x1: number,z: number,s: number){const g=grp(w.sc,[x0,0,z],s);g.userData.crab=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),fhit()));const C='#F0603C';
  mk(Sph(.4,14,10),C,{p:[0,.3,0],s:[1.2,.6,.9],to:g,ol:.03});const P: THREE.Group[]=[],CE: THREE.Mesh[]=[],nt=skyNow().night;
  for(const sd of[-1,1]){mk(Cyl(.03,.03,.25,5),C,{p:[sd*.13,.55,.18],ol:0,cs:false,to:g});CE.push(mk(Sph(.07,8,6),'#FFFFFF',{p:[sd*.13,.7,.18],ol:.015,cs:false,to:g}),mk(Sph(.035,6,5),K,{p:[sd*.13,.71,.24],ol:0,cs:false,to:g}));
    const cl=grp(g,[sd*.48,.35,.3]);mk(Sph(.16,10,8),C,{s:[1,.8,1.2],to:cl,ol:.02});const j=grp(cl,[0,0,.12]);mk(Box(.07,.06,.2),C,{p:[0,0,.08],ol:.01,cs:false,to:j});P.push(j);
    for(let i=0;i<3;i++)mk(Cyl(.025,.025,.35,4),C,{p:[sd*.42,.18,-.15+i*.15],r:[0,0,sd*1.1],ol:0,cs:false,to:g})}
  const zz=nt?zzz3(w,g,1):null;let ph=0;w.upd.push((dt: number)=>{const k=g.userData.wob,e=k==null?9:T-k,fast=e<1.2,sl=nt&&!fast;ph+=sl?0:dt*(fast?1.6:.35);for(const m of CE)m.scale.y=sl?.2:1;if(zz)zz.forEach(z=>z.visible=!!sl);// de noche duerme en la arena
    g.position.x=x0+(x1-x0)*(.5-.5*Math.cos(ph));
    g.position.y=Math.abs(Math.sin(ph*14))*.04;for(const j of P)j.rotation.y=fast?Math.abs(Math.sin(e*16))*.7:Math.max(0,Math.sin(T*3))*.3});return g}
// tarta de cumpleaños con velas: al tocarla se apagan con un soplido y al rato se vuelven a encender
// cake3(w,x,z,s): tarta de cumpleaños con 5 velas; al tocarla se apagan una a una y a los 2,4 s se encienden.
// Marca userData.cake.
export function cake3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.cake=1;g.userData.dur=2.5;mk(Cyl(.95,.95,.08,20),'#FFFFFF',{p:[0,.04,0],to:g,ol:.02});
  mk(Cyl(.75,.75,.5,20),'#F7A8C4',{p:[0,.33,0],to:g,ol:.03});mk(Cyl(.77,.77,.08,20),'#FFFFFF',{p:[0,.6,0],ol:.01,cs:false,to:g});mk(Cyl(.55,.55,.38,20),'#FFE08A',{p:[0,.83,0],to:g,ol:.03});
  for(let i=0;i<8;i++){const a=i/8*PI*2;mk(Sph(.07,8,6),DIAC[i%7],{p:[Math.cos(a)*.76,.5,Math.sin(a)*.76],ol:0,cs:false,to:g})}
  const F: THREE.Mesh[]=[];for(let i=0;i<5;i++){const a=i/5*PI*2+.3,cx=Math.cos(a)*.32,cz=Math.sin(a)*.32;mk(Cyl(.035,.035,.32,6),DIAC[i%7],{p:[cx,1.18,cz],ol:.01,cs:false,to:g});
    const f=mk(Sph(.065,8,6),M('#FFB53C',{emissive:'#FF8A00'}),{p:[cx,1.42,cz],s:[1,1.7,1],ol:0,cs:false,to:g});F.push(f)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,off=e<2.4;for(let i=0;i<F.length;i++){const f=F[i];f.visible=!off||e<.08*i;f.scale.set(1,1.7+Math.sin(T*12+i*2)*.25,1)}});return g}
// mariquita que pasea en círculo por el suelo; al tocarla abre las alas y da un saltito volando
// lady3(w,cx,cz,s): mariquita que da vueltas por el suelo; al tocarla abre las alas y salta volando. Marca userData.lady.
export function lady3(w: Mundo,cx: number,cz: number,s: number){const g=grp(w.sc,[cx,0,cz],s);g.userData.lady=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),fhit()));
  const b=grp(g,[0,0,0]);mk(Sph(.12,10,8),K,{p:[0,.14,.3],ol:0,cs:false,to:b});const W: [THREE.Group, number][]=[];
  for(const sd of[-1,1]){const pv=grp(b,[0,.2,.05]);mk(new THREE.SphereGeometry(.3,14,10,sd<0?PI:0,PI,0,PI/2),'#E8402C',{s:[1,.8,1.2],to:pv,ol:.02});
    for(const [dx,dz] of[[.13,.1],[.16,-.14]])mk(Sph(.05,8,6),K,{p:[sd*dx,.2,dz],s:[1,.4,1],ol:0,cs:false,to:pv});W.push([pv,sd])}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.1,1),fl=e<1.1;const a=T*.35;
    b.position.set(Math.cos(a)*.9,fl?Math.sin(q*PI)*1.3:0,Math.sin(a)*.9);b.rotation.y=-a;for(const [pv,sd] of W)pv.rotation.z=fl?sd*(.9+Math.sin(T*40)*.3):0});return g}
// pajarito que picotea el suelo dando saltitos; al tocarlo echa a volar, da una vuelta y vuelve piando
// bird3(w,cx,cz,s,c): pajarito de color c que picotea y da saltitos; al tocarlo da una vuelta volando. De noche
// duerme. Marca userData.bird.
export function bird3(w: Mundo,cx: number,cz: number,s: number,c: string){const g=grp(w.sc,[cx,0,cz],s);g.userData.bird=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),fhit()));
  const b=grp(g,[0,0,0]);mk(Sph(.3,14,10),c,{p:[0,.35,0],s:[1,.9,1.25],to:b,ol:.03});mk(Sph(.2,12,8),'#FFF1D6',{p:[0,.3,.12],s:[1,.8,1],ol:0,cs:false,to:b});
  const hd=grp(b,[0,.62,.2]);mk(Sph(.19,12,10),c,{to:hd,ol:.03});mk(Cone(.06,.16,6),'#FFA94D',{p:[0,-.02,.22],r:[PI/2,0,0],ol:0,cs:false,to:hd});
  const BE: THREE.Mesh[]=[],nt=skyNow().night;for(const sd of[-1,1])BE.push(mk(Sph(.035,6,5),K,{p:[sd*.11,.05,.13],ol:0,cs:false,to:hd}));const zz=nt?zzz3(w,g,1):null;mk(Box(.18,.04,.3),c,{p:[0,.42,-.38],r:[-.5,0,0],ol:.02,cs:false,to:b});
  const W: [THREE.Group, number][]=[];for(const sd of[-1,1]){const pv=grp(b,[sd*.25,.42,0]);mk(Box(.32,.04,.26),c,{p:[sd*.16,0,0],ol:.02,cs:false,to:pv});W.push([pv,sd])}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,fl=e<1.6,q=Math.min(e/1.6,1);
    if(fl){const a=q*PI*2;b.position.set(Math.sin(a)*1.4,Math.sin(q*PI)*2.4,(1-Math.cos(a))*.7);b.rotation.y=a+PI/2;hd.rotation.x=0;for(const [pv,sd] of W)pv.rotation.z=sd*Math.sin(T*35)*.7}
    else if(nt){b.position.set(0,0,0);b.rotation.y=.5;hd.rotation.x=.45;b.scale.set(1,1+Math.sin(T*2)*.03,1);for(const [pv] of W)pv.rotation.z=0}// de noche duerme
    else{const c2=T%3.2,hop=c2>2.6?Math.sin((c2-2.6)/.6*PI):0;b.position.set(Math.sin(T*.4)*.6,hop*.25,0);b.rotation.y=Math.sin(T*.4)>0?.9:-.9;
      hd.rotation.x=c2<1.2?Math.max(0,Math.sin(c2*PI*2.5))*.7:0;for(const [pv] of W)pv.rotation.z=0}
    for(const m of BE)m.scale.y=nt&&!fl?.15:1;if(zz)zz.forEach(q=>q.visible=!fl)});return g}
// pingüino que pasea de un lado a otro balanceándose; al tocarlo da un saltito aleteando y chilla
// peng3(w,x0,x1,z,s): pingüino que pasea entre x0 y x1 balanceándose; al tocarlo salta aleteando. De noche duerme de pie.
// Marca userData.peng.
export function peng3(w: Mundo,x0: number,x1: number,z: number,s: number){const g=grp(w.sc,[x0,0,z],s);g.userData.peng=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),fhit()));
  const b=grp(g,[0,0,0]);mk(Sph(.42,16,12),'#2F3446',{p:[0,.55,0],s:[1,1.35,.95],to:b,ol:.03});mk(Sph(.33,14,10),'#FFFFFF',{p:[0,.5,.14],s:[1,1.3,.8],ol:0,cs:false,to:b});
  mk(Sph(.28,14,10),'#2F3446',{p:[0,1.18,0],to:b,ol:.03});const PE: THREE.Mesh[]=[],nt=skyNow().night;for(const sd of[-1,1]){PE.push(mk(Sph(.07,8,6),'#FFFFFF',{p:[sd*.11,1.22,.22],ol:.01,cs:false,to:b}),mk(Sph(.035,6,5),K,{p:[sd*.11,1.22,.28],ol:0,cs:false,to:b}));
    mk(Sph(.12,8,6),'#FFA94D',{p:[sd*.15,.04,.12],s:[1,.35,1.5],ol:.01,cs:false,to:b})}
  mk(Cone(.07,.18,6),'#FFA94D',{p:[0,1.14,.3],r:[PI/2,0,0],ol:0,cs:false,to:b});const W: [THREE.Group, number][]=[];
  for(const sd of[-1,1]){const pv=grp(b,[sd*.38,.85,0]);mk(Box(.08,.5,.22),'#2F3446',{p:[0,-.22,0],ol:.02,cs:false,to:pv});W.push([pv,sd])}
  const zz=nt?zzz3(w,g,1.6):null;let ph=0;w.upd.push((dt: number)=>{const k=g.userData.wob,e=k==null?9:T-k,j=e<.9,q=Math.min(e/.9,1);if(!nt)ph+=dt*.25;const c=Math.cos(ph);g.position.x=x0+(x1-x0)*(.5-.5*c);
    for(const m of PE)m.scale.y=nt&&!j?.15:1;if(zz)zz.forEach(z=>z.visible=!j);// de noche duerme de pie, sin pasear
    b.rotation.y=j||nt?0:Math.sin(ph)>0?PI/2:-PI/2;b.rotation.z=j||nt?0:Math.sin(T*6)*.12;b.position.y=j?Math.sin(q*PI)*.7:0;for(const [pv,sd] of W)pv.rotation.z=sd*(j?.6+Math.sin(T*30)*.5:.15)});return g}
// ardilla con una bellota: mueve la cola; al tocarla salta y da una vuelta
// squir3(w,x,z,s): ardilla con una bellota que mueve la cola; al tocarla salta y da una vuelta. De noche duerme.
// Marca userData.squir.
export function squir3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.squir=1;hitS(g,.65,.6);const C='#C9772E';
  const b=grp(g,[0,0,0]);mk(Sph(.32,14,10),C,{p:[0,.42,0],s:[1,1.25,.95],to:b,ol:.03});mk(Sph(.2,12,8),'#F2D6A8',{p:[0,.4,.16],s:[1,1.2,.7],ol:0,cs:false,to:b});
  mk(Sph(.24,14,10),C,{p:[0,.9,.06],to:b,ol:.03});const SE: THREE.Mesh[]=[],nt=skyNow().night;for(const sd of[-1,1]){mk(Cone(.08,.18,6),C,{p:[sd*.13,1.13,.02],ol:.01,cs:false,to:b});SE.push(mk(Sph(.045,6,5),K,{p:[sd*.1,.95,.25],ol:0,cs:false,to:b}))}
  mk(Sph(.04,6,5),K,{p:[0,.88,.3],ol:0,cs:false,to:b});
  const ac=grp(b,[0,.62,.28]);mk(Sph(.1,10,8),'#A0662E',{s:[1,1.15,1],ol:.01,cs:false,to:ac});mk(Sph(.11,10,6),'#6B4423',{p:[0,.05,0],ol:0,cs:false,to:ac});
  const tl=grp(b,[0,.3,-.28]);mk(Sph(.26,12,10),C,{p:[0,.4,-.12],s:[.8,1.5,.7],to:tl,ol:.03});
  const zz=nt?zzz3(w,g,1.3):null;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,j=e<.8,q=Math.min(e/.8,1);tl.rotation.x=nt&&!j?.25:Math.sin(T*3)*.18;
    b.position.y=j?Math.sin(q*PI)*.9:0;b.rotation.y=j?q*PI*2:0;b.rotation.x=j?0:nt?.15:Math.max(0,Math.sin(T*1.3))*.12;for(const m of SE)m.scale.y=nt&&!j?.15:1;if(zz)zz.forEach(z=>z.visible=!j)});return g}// de noche duerme con la cola quieta
// madriguera con un conejito que se asoma de vez en cuando; al tocarlo salta fuera y vuelve a meterse
// burrow3(w,x,z,s): madriguera con un conejito que se asoma cada 5,5 s; al tocarlo salta fuera. De noche duerme dentro.
// Marca userData.burrow.
export function burrow3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.burrow=1;g.add(new THREE.Mesh(gcache('chit',()=>Sph(.7,6,4)),fhit()));
  mk(new THREE.TorusGeometry(.5,.16,8,20),'#B88A5A',{p:[0,.04,0],r:[PI/2,0,0],s:[1,1,.6],to:g,ol:.02});mk(Cyl(.48,.48,.02,20),'#4A3324',{p:[0,.03,0],ol:0,cs:false,to:g});
  const r=grp(g,[0,0,0]),W='#FFFFFF';mk(Sph(.3,14,10),W,{p:[0,.3,0],s:[1,1.1,.95],to:r,ol:.03});
  for(const sd of[-1,1]){const e=grp(r,[sd*.12,.52,-.02]);mk(Sph(.08,8,6),W,{p:[0,.24,0],s:[1,3.2,.6],to:e,ol:.02});mk(Sph(.045,6,5),'#FFB3C7',{p:[0,.24,.03],s:[1,2.6,.4],ol:0,cs:false,to:e});e.rotation.z=-sd*.15;
    mk(Sph(.045,6,5),K,{p:[sd*.11,.36,.25],ol:0,cs:false,to:r})}
  mk(Sph(.04,6,5),'#FF8FB1',{p:[0,.29,.29],ol:0,cs:false,to:r});const nt=skyNow().night,zz=nt?zzz3(w,g,.3):null;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;let y;if(zz)zz.forEach(z=>z.visible=e>=1.1);
    if(e<1.1){const q=e/1.1;y=-.1+Math.sin(q*PI)*1.3;r.rotation.y=q*PI*2}else if(nt){y=-.8;r.rotation.y=0}// de noche duerme dentro: solo salen las z
    else{const c=T%5.5,o=c<.4?c/.4:c<3.2?1:c<3.6?1-(c-3.2)/.4:0;y=-.75+o*.6;r.rotation.y=c<3.2?Math.sin(T*1.5)*.4:0}
    r.position.y=y;r.visible=y>-.7});return g}
// torre del reloj (como el Big Ben): al tocarla suenan las campanas ding-dong y las agujas dan una vuelta
// clock3(w,x,z,s): torre del reloj (como el Big Ben) cuyas agujas marcan la hora real; al tocarla dan una vuelta.
// Marca userData.clock.
export function clock3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.clock=1;const C='#D9B77A',D2='#8A6A3C';
  mk(Box(1.1,3.2,1.1),C,{p:[0,1.6,0],to:g,ol:.04});for(let i=0;i<4;i++)mk(Box(1.16,.08,1.16),D2,{p:[0,.6+i*.7,0],ol:0,cs:false,to:g});
  mk(Box(1.3,1.3,1.3),C,{p:[0,3.85,0],to:g,ol:.04});mk(Cone(.95,1.5,4),'#3E5A4A',{p:[0,5.25,0],r:[0,PI/4,0],to:g,ol:.04});mk(Sph(.1,8,6),'#FFC93C',{p:[0,6.05,0],ol:0,cs:false,to:g});
  mk(Cyl(.5,.5,.04,24),skyNow().night?M('#FFF8E6',{emissive:'#E0B040'}):'#FFF8E6',{p:[0,3.85,.66],r:[PI/2,0,0],to:g,ol:.025});/* de noche la esfera del reloj se ilumina */const H: THREE.Group[]=[];
  for(const [l,wd] of[[.38,.06],[.26,.08]]){const hd=grp(g,[0,3.85,.7]);mk(Box(wd,l,.02),K,{p:[0,l/2,0],ol:0,cs:false,to:hd});H.push(hd)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/1.5,1);const d=ahora(),mn=d.getMinutes()+d.getSeconds()/60,hr=d.getHours()%12+mn/60;H[0].rotation.z=-(e<1.5?q*PI*2:0)-mn/60*PI*2;H[1].rotation.z=-(e<1.5?q*PI/2:0)-hr/12*PI*2});return g}/* las agujas marcan la hora de verdad */
// iglú con una foca que se asoma por la puerta; al tocarlo la foca sale, aplaude y vuelve a entrar
// igloo3(w,x,z,s): iglú con una foca que se asoma cada 6 s; al tocarlo sale, aplaude y vuelve. Marca userData.igloo.
// Las aletas se guardan en sl.userData.f1 y sl.userData['f-1'] (derecha e izquierda).
export function igloo3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.igloo=1;g.userData.dur=2.1;
  mk(new THREE.SphereGeometry(1.2,20,12,0,PI*2,0,PI/2),'#F4FAFF',{to:g,ol:.04});
  for(let i=1;i<4;i++)mk(new THREE.TorusGeometry(1.2*Math.cos(i*.38),.02,4,32),'#BFD6E8',{p:[0,1.2*Math.sin(i*.38),0],r:[PI/2,0,0],ol:0,cs:false,to:g});
  mk(new THREE.CylinderGeometry(.5,.5,.8,16,1,true,-PI/2,PI),'#F4FAFF',{p:[0,.4,1.05],r:[PI/2,0,0],s:[1,1,1],to:g,ol:.03});mk(new THREE.CircleGeometry(.42,16,0,PI),skyNow().night?M('#FFC96B',{emissive:'#E08A20'}):'#3A4A66',{p:[0,.02,1.46],ol:0,cs:false,to:g});
  const sl=grp(g,[0,0,1.1]),C='#8C9AAE';mk(Sph(.3,14,10),C,{p:[0,.28,0],s:[1,.9,1.3],to:sl,ol:.03});mk(Sph(.22,12,10),C,{p:[0,.55,.25],to:sl,ol:.03});
  for(const sd of[-1,1]){mk(Sph(.045,6,5),K,{p:[sd*.09,.62,.44],ol:0,cs:false,to:sl});const f=grp(sl,[sd*.27,.3,.15]);mk(Box(.08,.26,.14),C,{p:[0,0,.06],ol:.01,cs:false,to:f});sl.userData['f'+sd]=f}
  mk(Sph(.05,6,5),K,{p:[0,.55,.47],ol:0,cs:false,to:sl});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2){const q=Math.min(e/.4,1),o=e<1.6?q:1-(e-1.6)/.4;sl.position.z=1.1+o*.9;sl.position.y=0;
      const c=e>.4&&e<1.6?Math.abs(Math.sin((e-.4)*PI*5)):0;sl.userData.f1.rotation.z=.2+c*.9;sl.userData['f-1'].rotation.z=-.2-c*.9}
    else{const c=T%6,o=c<.5?c/.5:c<2.5?1:c<3?1-(c-2.5)/.5:0;sl.position.z=1.1+o*.35;sl.userData.f1.rotation.z=.2;sl.userData['f-1'].rotation.z=-.2}
    sl.visible=sl.position.z>1.15});return g}
// tambor de fiesta: al tocarlo se aplasta y suena un redoble
// drum3(w,x,z,s): tambor de fiesta con dos baquetas; la animación al tocarlo (aplastarse) está en wobInit. Marca userData.drum.
export function drum3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.drum=1;
  mk(Cyl(.7,.7,.9,20),'#E8503C',{p:[0,.45,0],to:g,ol:.04});for(const y of[.06,.84])mk(Cyl(.73,.73,.1,20),'#FFC93C',{p:[0,y,0],ol:.02,cs:false,to:g});
  mk(Cyl(.66,.66,.02,20),'#FFF8E6',{p:[0,.91,0],ol:0,cs:false,to:g});for(let i=0;i<8;i++){const a=i/8*PI*2;mk(Cyl(.02,.02,.7,4),'#FFFFFF',{p:[Math.cos(a)*.71,.45,Math.sin(a)*.71],r:[0,0,i%2?.5:-.5],ol:0,cs:false,to:g})}
  for(const sd of[-1,1]){const st=grp(g,[sd*.35,1.05,.2]);mk(Cyl(.03,.03,.8,6),'#C9A57A',{p:[0,.3,0],r:[0,0,-sd*.5],ol:.01,cs:false,to:st});mk(Sph(.07,8,6),'#FFFFFF',{p:[sd*.19,.64,0],ol:.01,cs:false,to:st})}
  return g}
// buzón rojo inglés: al tocarlo sale volando una carta que da una vuelta y vuelve a entrar
// post3(w,x,z,s): buzón rojo inglés; al tocarlo sale una carta volando que da una vuelta. Marca userData.post.
export function post3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.post=1;const R='#D9372C';
  mk(Cyl(.42,.46,1.5,18),R,{p:[0,.75,0],to:g,ol:.04});mk(new THREE.SphereGeometry(.44,18,8,0,PI*2,0,PI/2),R,{p:[0,1.5,0],to:g,ol:.035});
  mk(Cyl(.5,.5,.12,18),'#2F2A28',{p:[0,.06,0],ol:.02,cs:false,to:g});mk(Box(.42,.07,.04),'#2F2A28',{p:[0,1.25,.43],ol:0,cs:false,to:g});
  mk(Box(.3,.2,.02),'#FFF3B0',{p:[0,.9,.44],ol:0,cs:false,to:g});
  const lt=grp(g,[0,1.25,.45]);mk(Box(.62,.4,.02),'#FFFFFF',{ol:.015,cs:false,to:lt});mk(Box(.12,.12,.025),'#E8503C',{p:[.2,.1,0],ol:0,cs:false,to:lt});lt.visible=false;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<1.6){const q=e/1.6,a=q*PI*2;lt.visible=true;lt.position.set(Math.sin(a)*1.2,1.25+Math.sin(q*PI)*1.6,.45+(1-Math.cos(a))*.5);lt.rotation.set(-.3,0,Math.sin(T*10)*.3)}else lt.visible=false});return g}
// fila de hormigas que dan vueltas; al tocarlas se dispersan corriendo y vuelven a la fila
// ants3(w,x,z,s): hormiguero con 9 hormigas en fila que dan vueltas; al tocarlo se dispersan. De noche están dentro.
// Marca userData.ants.
export function ants3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.ants=1;const hit=new THREE.Mesh(gcache('ahit',()=>Cyl(1.6,1.6,.6,10)),fhit());hit.position.y=.3;g.add(hit);
  mk(Sph(.5,12,8),'#B07A4A',{p:[0,0,0],s:[1,.5,1],to:g,ol:.02});mk(Cyl(.08,.08,.04,8),'#4A3324',{p:[0,.25,0],ol:0,cs:false,to:g});
  const A: THREE.Group[]=[],n=9,nt=skyNow().night,zz=nt?zzz3(w,g,.5):null;for(let i=0;i<n;i++){const a=grp(g,[0,0,0]);for(const z2 of[-.09,0,.09])mk(Sph(.055,6,5),'#2F2420',{p:[0,.06,z2],ol:0,cs:false,to:a});A.push(a)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,sc=e<1.6?Math.sin(Math.min(e/1.6,1)*PI)*1.2:0,ins=nt&&e>=1.6;if(zz)zz.forEach(z=>z.visible=!!ins);
    for(let i=0;i<n;i++){A[i].visible=!ins;// de noche están dentro del hormiguero
      const a=i/n*PI*2-T*.35,r=1.15+sc*(.6+.4*Math.sin(i*2.3)),ox=Math.cos(a)*r,oz=Math.sin(a)*r*.7;A[i].position.set(ox,0,oz);A[i].rotation.y=-a+(sc>.05?Math.sin(T*20+i)*.8:0)}});return g}
// faro de la orilla: la luz gira; al tocarlo suena la sirena y la luz parpadea
// lighthouse3(w,x,z,s): faro de rayas con un haz de luz que gira (más largo de noche); al tocarlo gira deprisa y
// parpadea. Marca userData.light.
export function lighthouse3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s),nt=skyNow().night;g.userData.light=1;g.userData.dur=1.9;
  for(let i=0;i<4;i++)mk(Cyl(.5-i*.06,.56-i*.06,.7,16),i%2?'#E8503C':'#FFFFFF',{p:[0,.35+i*.7,0],to:g,ol:.035});
  mk(Cyl(.42,.42,.1,16),'#3A3A3A',{p:[0,2.85,0],ol:.02,cs:false,to:g});const lm=mk(Cyl(.26,.26,.4,12),M('#FFF3B0',{emissive:'#FFC93C'}),{p:[0,3.1,0],ol:.02,cs:false,to:g});
  mk(Cone(.38,.4,12),'#E8503C',{p:[0,3.5,0],to:g,ol:.03});const bm=grp(g,[0,3.1,0]);
  const beam=new THREE.Mesh(new THREE.ConeGeometry(nt?.8:.5,nt?5:3,10,1,true).rotateZ(PI/2).translate(nt?2.6:1.6,0,0),new THREE.MeshBasicMaterial({color:'#FFF6C0',transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}));beam.raycast=()=>{};bm.add(beam);
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,f=e<1.8;bm.rotation.y=T*(f?3:.8);beam.material.opacity=f?(Math.sin(e*18)>0?.6:.15):nt?.55:.3;lm.scale.setScalar(f?1+Math.max(0,Math.sin(e*18))*.25:1)});return g}
// guirnalda de bombillas de colores que parpadean al fondo de la zona de fiestas (de noche brillan más)
// garland3(w,z,h): guirnalda de 26 bombillas de colores a la altura h en el fondo z, colgada de 4 postes.
// Las bombillas pares e impares son dos Points (mk2) que se encienden por turnos; de noche brillan más.
export function garland3(w: Mundo,z: number,h: number){const n=26,pos=new Float32Array(n*3),col=new Float32Array(n*3),wp=[];
  for(let i=0;i<n;i++){const q=i/(n-1),x=-16+q*32,y=h-Math.sin((q*3%1)*PI)*.7;pos.set([x,y,z],i*3);const c=new THREE.Color(DIAC[i%7]);col.set([c.r,c.g,c.b],i*3);wp.push(new THREE.Vector3(x,y+.12,z))}
  const wire=new THREE.Line(new THREE.BufferGeometry().setFromPoints(wp),new THREE.LineBasicMaterial({color:'#5A4636'}));wire.raycast=()=>{};w.sc.add(wire);
  for(const x of[-16,-5.33,5.33,16]){mk(Cyl(.06,.06,h+.2,6),'#B07A4A',{p:[x,(h+.2)/2,z],ol:.015,cs:false,to:w.sc})}
  const night=skyNow().night,mk2=(odd: number)=>{const gg=new THREE.BufferGeometry(),P=[],C=[];for(let i=odd;i<n;i+=2){P.push(pos[i*3],pos[i*3+1],pos[i*3+2]);C.push(col[i*3],col[i*3+1],col[i*3+2])}
    gg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const pt=new THREE.Points(gg,new THREE.PointsMaterial({size:night?1.6:1,vertexColors:true,map:night?softTex():canvasTex(32,32,()=>{ctx.beginPath();ctx.arc(16,16,11,0,PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=K;ctx.stroke()},'bulb'),transparent:true,depthWrite:false,blending:night?THREE.AdditiveBlending:THREE.NormalBlending}));pt.raycast=()=>{};w.sc.add(pt);return pt};
  const A=mk2(0),B=mk2(1),s0=A.material.size;w.upd.push(()=>{const k=(Math.sin(T*2.2)+1)/2,b=w.starT!=null&&T-w.starT<1.6?1-(T-w.starT)/1.6:0;/* al tocar la luna, las bombillas se encienden más */A.material.opacity=Math.min(1,.45+.55*k+b);B.material.opacity=Math.min(1,1-.55*k+b);A.material.size=B.material.size=s0*(1+b*.6)})}
// ballena en el mar (se ve en pantallas anchas): asoma y echa un chorro de agua; al tocarla, chorro grande y coletazo
// whale3(w,x,z,s): ballena en el mar que asoma cada 8 s y echa un chorro (24 gotas); al tocarla, chorro grande y
// coletazo. Marca userData.whale.
export function whale3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,-1.1,z],s);g.userData.whale=1;g.userData.dur=2.2;g.add(new THREE.Mesh(gcache('whit',()=>Sph(2.2,6,4)),fhit()));const C='#5B7FB8';
  const b=grp(g,[0,0,0]);mk(Sph(1.2,18,12),C,{s:[1.6,.75,1],to:b,ol:.05});mk(Sph(.9,14,10),'#DCE8F5',{p:[.2,-.25,0],s:[1.5,.5,.9],ol:0,cs:false,to:b});
  for(const sd of[-1,1]){mk(Sph(.1,8,6),K,{p:[1.25,.25,sd*.62],ol:0,cs:false,to:b})}
  const tl=grp(b,[-1.8,.1,0]);mk(Box(.6,.12,1.3),C,{p:[-.3,.3,0],r:[0,0,.5],to:tl,ol:.03});
  const n=24,pos=new Float32Array(n*3),sp=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(pos,3)),new THREE.PointsMaterial({color:'#EAF6FF',size:.9,map:softTex(),transparent:true,depthWrite:false}));sp.raycast=()=>{};g.add(sp);
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,big=e<2.2,c=T%8,up=big?1:c<5?Math.min(1,c/.8,(5-c)/.8):0;
    b.position.y=-1.2+up*1.05;tl.rotation.z=big?Math.sin(e*8)*.6:Math.sin(T*1.5)*.2;
    const st=big?e:c-1,on=up>.6&&st>0&&st<1.6,hh=big?4:2.2;sp.visible=on;if(on){for(let i=0;i<n;i++){const q=((st*1.2+i/n)%1),a=i*2.4;pos[i*3]=.6+Math.cos(a)*q*.8;pos[i*3+1]=.6+Math.sin(q*PI)*hh*(1-q*.3);pos[i*3+2]=Math.sin(a)*q*.8}sp.geometry.attributes.position.needsUpdate=true}});return g}
// delfín que salta en arco de vez en cuando (pantallas anchas); al tocarlo da un salto con voltereta
// dolph3(w,x,z,s): delfín que salta en arco cada 7 s; al tocarlo salta más alto con voltereta. Marca userData.dolph.
export function dolph3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,-1.1,z],s);g.rotation.y=PI/2;g.userData.dolph=1;g.userData.dur=1.4;g.add(new THREE.Mesh(gcache('whit',()=>Sph(2.2,6,4)),fhit()));const C='#7FA8D8';
  const b=grp(g,[0,0,0]);mk(Sph(.5,14,10),C,{s:[2,.7,.7],to:b,ol:.04});mk(Cone(.18,.5,8),C,{p:[1.15,-.05,0],r:[0,0,-PI/2],ol:.02,cs:false,to:b});
  mk(Cone(.22,.45,6),C,{p:[0,.45,0],r:[0,0,-.4],s:[1,1,.3],ol:.02,cs:false,to:b});mk(Box(.2,.08,.8),C,{p:[-1.05,0,0],ol:.02,cs:false,to:b});mk(Sph(.06,6,5),K,{p:[.75,.12,.3],ol:0,cs:false,to:b});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;let q,fl=0;if(e<1.4){q=e/1.4;fl=1}else{const c=T%7;q=c<1.2?c/1.2:-1}
    if(q<0){b.visible=false;return}b.visible=true;b.position.set((q-.5)*5,-1+Math.sin(q*PI)*(fl?4:2.6),0);b.rotation.z=(.5-q)*2.2-(fl?q*PI*2:0)});return g}
// "Zzz" que suben y se desvanecen sobre un animalito dormido (de noche)
// zzz3(w,to,y): dos "z" que suben y se desvanecen a la altura y sobre el grupo to (animal dormido). Devuelve la
// lista de sprites; cada animal decide cuándo se ven (visible).
function zzz3(w: Mundo,to: THREE.Object3D,y: number){const Z: THREE.Sprite[]=[];for(let i=0;i<2;i++){const q=spr(canvasTex(64,64,()=>text('z',32,52,56,'#FFFFFF',{f:LF,st:8,sc:'#5F6FB4'}),'zzz'),.5,.5,{p:[.2,y,0],to});q.raycast=()=>{};Z.push(q)}
  w.upd.push(()=>{Z.forEach((q,i)=>{const k=(T*.35+i*.5)%1;q.position.set(.2+k*.5,y+k*1.1,0);q.scale.setScalar(.3+k*.4);q.material.opacity=k<.15?k/.15:1-(k-.15)/.85})});return Z}
// según el mes del año, en el mapa caen hojas (otoño), nieve (invierno) o pétalos (primavera); en verano, nada
// seasonFx(w): según el mes, caen hojas (octubre y noviembre), nieve (diciembre a febrero) o pétalos (marzo a mayo)
// sobre el mapa con fallPts; en verano nada. leaf crea la textura de hoja.
export function seasonFx(w: Mundo){const m=ahora().getMonth(),O={sp:.6,sw:1.2,h:12,wx:42,wz:24},
    leaf=()=>canvasTex(32,32,()=>{ctx.beginPath();ctx.ellipse(16,16,13,7,.6,0,PI*2);ctx.fillStyle='#fff';ctx.fill()},'leaf');
  if(m===9||m===10)fallPts(w,45,['#F28C38','#E8603C','#F2C14E','#C9772E'],{...O,size:1.8,map:leaf()});
  else if(m===11||m<=1)fallPts(w,70,['#FFFFFF','#F4FAFF'],{...O,size:1.1,sp:.9,sw:.5,map:canvasTex(64,64,()=>{ctx.beginPath();ctx.arc(32,32,20,0,PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#9DBFE3';ctx.stroke()},'snow')});
  else if(m>=2&&m<=4)fallPts(w,35,['#FFB3C7','#FFD1DC','#FFFFFF'],{...O,size:1,sp:.45,map:leaf()})}
// Navidad (del 1 de diciembre al 6 de enero): árbol con bolas y luces junto a la casa de Tito; al tocarlo la estrella gira y suenan cascabeles
// xmasNow(): true en Navidad (del 1 de diciembre al 6 de enero).
export const xmasNow=()=>{const d=ahora(),m=d.getMonth();return m===11||(m===0&&d.getDate()<=6)};
// xtree3(w,x,z,s): árbol de Navidad con bolas y estrella; al tocarlo la estrella gira. Marca userData.xtree.
export function xtree3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.xtree=1;g.userData.dur=1.6;mk(Cyl(.18,.22,.6,8),'#8A5A3A',{p:[0,.3,0],to:g,ol:.03});
  [[1.4,1.6,1.2],[1.1,1.4,2.1],[.75,1.2,2.9]].forEach(([r,h,y])=>mk(Cone(r,h,14),'#3E9A55',{p:[0,y,0],to:g,ol:.04}));
  for(let i=0;i<12;i++){const y=.9+(i%4)*.55+Math.floor(i/4)*.1,a=i*2.1,r=1.25-(y-.8)*.38;mk(Sph(.1,8,6),DIAC[i%7],{p:[Math.cos(a)*r,y,Math.sin(a)*r],ol:.01,cs:false,to:g})}
  const st=mk(starGeo(.35,.12),M('#FFC93C',{emissive:'#C98A00'}),{p:[0,3.75,0],to:g,ol:.03});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;st.rotation.y=e<1.6?Math.min(e/1.6,1)*PI*4:Math.sin(T*1.2)*.4;st.scale.setScalar(e<1.6?1+Math.sin(e/1.6*PI)*.4:1)});return g}
// Halloween (del 15 de octubre al 2 de noviembre): calabaza sonriente junto a la casa de Tito; al tocarla bota y salta la tapa; de noche la cara brilla como una vela
// hallowNow(): true en Halloween (del 15 de octubre al 2 de noviembre).
export const hallowNow=()=>{const d=ahora(),m=d.getMonth(),n=d.getDate();return (m===9&&n>=15)||(m===10&&n<=2)};
// pump3(w,x,z,s): calabaza con cara; al tocarla bota y salta la tapa; de noche la cara brilla como una vela.
// Marca userData.pump.
export function pump3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.pump=1;g.userData.dur=1.5;const b=grp(g,[0,0,0]),nt=skyNow().night;
  for(let i=0;i<6;i++){const a=i/6*PI;mk(Sph(.62,16,12),'#F28A1E',{p:[Math.cos(a)*.16,.55,Math.sin(a)*.16],s:[.8,.85,1],r:[0,a,0],to:b,ol:.03})}
  const lid=grp(b,[0,1.02,0]);mk(Cyl(.07,.1,.32,8),'#5E8A3A',{p:[0,.12,0],r:[0,0,.2],to:lid,ol:.02});mk(Sph(.12,8,6),'#6CC24A',{p:[.16,.06,0],s:[1.4,.4,1],to:lid,ol:.01,cs:false});
  const fm=nt?new THREE.MeshBasicMaterial({color:'#FFC24A'}):M('#3A2414');
  const fc=grp(b,[0,.6,0]);fc.rotation.x=-.5;for(const sd of[-1,1])mk(new THREE.CircleGeometry(.14,3),fm,{p:[sd*.22,.16,.72],r:[0,0,PI/2],to:fc,ol:0,cs:false});
  mk(new THREE.CircleGeometry(.1,3),fm,{p:[0,0,.75],r:[0,0,-PI/2],to:fc,ol:0,cs:false});mk(new THREE.CircleGeometry(.3,16,PI,PI),fm,{p:[0,-.08,.72],s:[1,.55,1],to:fc,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(nt)fm.color.setHSL(.11,1,.6+Math.sin(T*9)*.04+Math.sin(T*23)*.03);
    if(e<1.5){const h=Math.abs(Math.sin(e/1.5*PI*3))*(1-e/1.5)*.7;b.position.y=h;b.scale.set(1+(h<.05?.15:0),1-(h<.05?.15:0),1);lid.position.y=1.02+Math.sin(Math.min(e/.8,1)*PI)*.6;lid.rotation.z=Math.sin(Math.min(e/.8,1)*PI)*.8}
    else{b.position.y=0;b.scale.set(1,1,1);lid.position.y=1.02;lid.rotation.z=0}});return g}
// Bosque: montón de hojas secas; al tocarlo las hojas saltan por el aire y vuelven a caer en su sitio
// leafs3(w,x,z,s): montón de hojas secas (16 hojas); al tocarlo saltan por el aire y vuelven a su sitio.
// La posición de reposo y el salto de cada hoja se guardan en l.userData.b. Marca userData.leafs.
export function leafs3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.leafs=1;g.userData.dur=1.9;mk(Sph(.9,14,8),'#C9772E',{s:[1.3,.45,1],to:g,ol:.03});
  const LC=['#F28C38','#E8603C','#F2C14E','#C9772E','#D9502E'],L: THREE.Mesh[]=[];for(let i=0;i<16;i++){const a=i*2.4,r=.25+(i%4)*.25,y=.42-r*.28,l=mk(Sph(.2,6,4),LC[i%5],{p:[Math.cos(a)*r*1.3,y,Math.sin(a)*r],s:[1.3,.25,.8],r:[0,a,.3],ol:.01,cs:false,to:g});
    l.userData.b=[l.position.x,y,l.position.z,Math.cos(a)*(1+i%3*.4),2.6+(i%5)*.5,Math.sin(a)*(1+i%3*.4)];L.push(l)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;for(const l of L){const b=l.userData.b;if(e<1.9){const q=e/1.9,h=Math.sin(q*PI)*b[4];l.position.set(b[0]+b[3]*Math.sin(q*PI)*.8,b[1]+h,b[2]+b[5]*Math.sin(q*PI)*.8);l.rotation.z=.3+Math.sin(e*7+b[3])*.8}else if(l.position.y!==b[1]){l.position.set(b[0],b[1],b[2]);l.rotation.z=.3}}});return g}
// Jardín (de día): una cometa de colores ondea en el cielo; al tocarla da una vuelta en el aire
// kite3(w,x,y,z,s): cometa de 4 colores con cola que ondea en el cielo; al tocarla da una vuelta. Marca userData.kite.
export function kite3(w: Mundo,x: number,y: number,z: number,s: number){const g=grp(w.sc,[x,y,z],s);g.userData.kite=1;hitS(g,1.1,-.4,1,1.5);g.userData.dur=1.4;const k=grp(g,[0,0,0]);
  ([['#FF6B6B',0],['#FFC93C',1],['#5BB8F5',2],['#6CC24A',3]] as [string, number][]).forEach(([c,i])=>{const P=[[0,1],[-1,0],[0,-1],[1,0]],A=P[i],B=P[(i+1)%4],gq=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(B[0]*.6,B[1]*.95,0),new THREE.Vector3(A[0]*.6,A[1]*.95,0)]);gq.computeVertexNormals();mk(gq,M(c,{side:THREE.DoubleSide}),{ol:0,cs:false,to:k})});mk(Cyl(.02,.02,1.9,4),'#8A5A3A',{p:[0,0,.01],ol:0,cs:false,to:k});mk(Cyl(.02,.02,1.2,4),'#8A5A3A',{p:[0,0,.01],r:[0,0,PI/2],ol:0,cs:false,to:k});
  const tl: THREE.Mesh[]=[];for(let i=0;i<5;i++)tl.push(mk(Box(.22,.12,.02),DIAC[i%7],{p:[0,-1.1-i*.38,0],r:[0,0,.6],ol:0,cs:false,to:k}));
  mk(Cyl(.012,.012,9,3),'#FFFFFF',{p:[1.6,-4.4,.5],r:[.1,0,.36],ol:0,cs:false,rs:false,to:g});
  w.upd.push(()=>{const q=g.userData.wob,e=q==null?9:T-q;g.position.x=x+Math.sin(T*.5)*.6;g.position.y=y+Math.sin(T*.8)*.3;
    k.rotation.z=(e<1.4?Math.min(e/1.4,1)*PI*2:0)+Math.sin(T*1.1)*.15;tl.forEach((t,i)=>t.position.x=Math.sin(T*3-i*.8)*.12*(i+1));
    if(e<1.4)g.position.y+=Math.sin(e/1.4*PI)*.5});return g}
// Mapa (de día): un globo aerostático de rayas flota sobre el mar; al tocarlo se enciende la llama y sube un poco
// hab3(w,x,y,z,s): globo aerostático de gajos de colores que flota; al tocarlo se enciende la llama y sube.
// De noche brilla y la llama queda encendida. Marca userData.hab.
export function hab3(w: Mundo,x: number,y: number,z: number,s: number){const g=grp(w.sc,[x,y,z],s);g.userData.hab=1;g.userData.dur=2.2;const nt=skyNow().night;/* de noche la llama queda encendida y el globo brilla */
  ['#FF6B6B','#FFC93C','#5BB8F5','#FF6B6B','#FFC93C','#5BB8F5'].forEach((c,i)=>mk(new THREE.SphereGeometry(1.2,6,14,i*PI/3,PI/3),nt?M(c,{emissive:'#'+new THREE.Color(c).multiplyScalar(.4).getHexString()}):c,{p:[0,1.6,0],s:[1,1.15,1],ol:.03,to:g}));
  mk(Cyl(.45,.25,.5,12),'#FF6B6B',{p:[0,.35,0],ol:.02,cs:false,to:g});mk(Box(.55,.4,.55),'#B07A4A',{p:[0,-.7,0],ol:.03,to:g});
  for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])mk(Cyl(.015,.015,.75,3),'#6B4423',{p:[a*.22,-.15,b*.22],ol:0,cs:false,to:g});
  const fl=mk(Cone(.12,.35,8),M('#FFB020',{emissive:'#FF7A00'}),{p:[0,.05,0],ol:0,cs:false,to:g});fl.visible=false;
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;g.position.x=x+Math.sin(T*.13)*.8;g.position.y=y+Math.sin(T*.6)*.2+(e<2.2?Math.sin(e/2.2*PI)*1.2:0);fl.visible=!!(nt||e<1.2);if(fl.visible)fl.scale.setScalar((e<1.2?1:.6)*(1+Math.sin(T*30)*.25))});return g}
// Inglés: una tetera para la hora del té; al tocarla tiembla, silba y echa vapor por el pitorro
// tea3(w,x,z,s): tetera con taza (inglés); al tocarla tiembla y echa vapor (4 bolitas). Marca userData.tea.
export function tea3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.tea=1;g.userData.dur=1.8;const b=grp(g,[0,0,0]),C='#5BB8F5';
  mk(Sph(.5,16,12),C,{p:[0,.45,0],s:[1,.85,1],to:b,ol:.03});mk(Sph(.3,14,8),'#FFFFFF',{p:[0,.8,0],s:[1,.5,1],to:b,ol:.02});mk(Sph(.08,8,6),'#FFC93C',{p:[0,.97,0],to:b,ol:.01,cs:false});
  mk(Cyl(.06,.1,.5,8),C,{p:[.55,.6,0],r:[0,0,-.9],to:b,ol:.02});mk(new THREE.TorusGeometry(.2,.05,6,12),C,{p:[-.5,.5,0],to:b,ol:.02});
  for(let i=0;i<6;i++){const a=i/6*PI*2;mk(Sph(.06,6,5),'#FFFFFF',{p:[Math.cos(a)*.47,.45,Math.sin(a)*.47],ol:0,cs:false,to:b})}
  const cp=grp(g,[.95,0,.45]);mk(Cyl(.17,.13,.26,12),'#FFFFFF',{p:[0,.13,0],to:cp,ol:.02});mk(Cyl(.3,.3,.03,14),'#FFFFFF',{p:[0,.01,0],to:cp,ol:.02,cs:false});mk(new THREE.TorusGeometry(.08,.025,5,10),'#FFFFFF',{p:[.19,.15,0],to:cp,ol:.01,cs:false});
  const sm=new THREE.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:0,depthWrite:false}),ST: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[]=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(gcache('steam',()=>Sph(.14,8,6)),sm);m.raycast=()=>{};g.add(m);ST.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;b.rotation.z=e<1.2?Math.sin(e*40)*.05*(1-e/1.2):0;sm.opacity=e<1.8?Math.min(e*4,1)*(1-e/1.8)*.9:0;
    ST.forEach((m,i)=>{const q=((e*1.2+i*.25)%1);m.position.set(.8+q*.5,.85+q*1.1,0);m.scale.setScalar(.6+q*1.4)})});return g}
// Fiestas: caja sorpresa; al tocarla se abre la tapa y sale un payaso con muelle que rebota
// jack3(w,x,z,s): caja sorpresa; al tocarla se abre la tapa y sale un payaso con muelle que rebota. Marca userData.jack.
export function jack3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.jack=1;g.userData.dur=2.4;
  ['#FF6B6B','#5BB8F5','#FFC93C','#6CC24A'].forEach((c,i)=>mk(Box(.9,.9,.02),c,{p:[Math.sin(i*PI/2)*.45,.45,Math.cos(i*PI/2)*.45],r:[0,i*PI/2,0],to:g,ol:.02}));mk(Box(.9,.02,.9),'#C9772E',{p:[0,.01,0],to:g,ol:0,cs:false});
  const lid=grp(g,[0,.9,-.45]);mk(Box(.94,.06,.94),'#B48CE0',{p:[0,.03,.45],to:lid,ol:.02});mk(Cyl(.04,.04,.4,6),'#8A5A3A',{p:[.5,.45,0],r:[0,0,PI/2],ol:0,cs:false,to:g});mk(Sph(.07,8,6),'#FF6B6B',{p:[.72,.6,0],to:g,ol:.01,cs:false});
  const j=grp(g,[0,.3,0]),sp=[];for(let i=0;i<6;i++)sp.push(mk(new THREE.TorusGeometry(.16,.035,5,10),'#BFC6D1',{p:[0,i*.17,0],r:[PI/2,0,0],ol:0,cs:false,to:j}));
  const hd=grp(j,[0,1.1,0]);mk(Sph(.26,14,10),'#FFE0C2',{to:hd,ol:.03});mk(Sph(.07,8,6),'#FF3B3B',{p:[0,-.02,.25],to:hd,ol:0,cs:false});for(const sd of[-1,1]){mk(Sph(.035,6,5),K,{p:[sd*.09,.07,.23],ol:0,cs:false,to:hd});mk(Sph(.1,8,6),'#FF8FB1',{p:[sd*.27,.12,0],to:hd,ol:0,cs:false})}
  mk(Cone(.2,.4,10),'#FFC93C',{p:[0,.35,0],to:hd,ol:.02});mk(Sph(.06,8,6),'#FF6B6B',{p:[0,.56,0],to:hd,ol:0,cs:false});
  j.visible=false;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2.4){const o=Math.min(e/.15,1)*(e<2?1:1-(e-2)/.4);lid.rotation.x=-o*2;j.visible=e<2.3;
    const st=e<2?1+Math.sin(e*14)*Math.exp(-e*2.5)*.45:Math.max(0,1-(e-2)/.3);j.scale.y=st*o;hd.scale.set(1,1/Math.max(st*o,.2),1);hd.rotation.z=Math.sin(e*9)*.25*Math.exp(-e*1.5)}else{lid.rotation.x=0;j.visible=false}});return g}
// Jardín: una regadera; al tocarla se inclina y riega con gotitas
// can3(w,x,z,s): regadera; al tocarla se inclina y caen gotitas. Marca userData.can.
export function can3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.can=1;g.userData.dur=1.8;const b=grp(g,[0,0,0]),C='#5BB8F5';
  mk(Cyl(.32,.36,.6,14),C,{p:[0,.3,0],to:b,ol:.03});mk(new THREE.TorusGeometry(.22,.045,6,12,PI),C,{p:[-.05,.6,0],to:b,ol:.02});mk(Cyl(.04,.07,.7,8),C,{p:[.5,.45,0],r:[0,0,-1],to:b,ol:.02});mk(Cyl(.1,.05,.1,10),'#FFC93C',{p:[.8,.66,0],r:[0,0,-1],to:b,ol:.01,cs:false});
  const dm=new THREE.MeshBasicMaterial({color:'#7FC8F8',transparent:true,opacity:0}),DR: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[]=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(gcache('drop',()=>Sph(.05,6,5)),dm);m.raycast=()=>{};g.add(m);DR.push(m)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,o=e<1.8?Math.min(e/.3,1)*Math.min((1.8-e)/.3,1):0;b.rotation.z=-o*.5;dm.opacity=o>.8?.9:0;
    DR.forEach((m,i)=>{const q=(e*2+i/6)%1;m.position.set(1+q*.35+(i%3-1)*.05,.55-q*.55,(i%3-1)*.1)})});return g}
// Montaña: un trineo rojo; al tocarlo se desliza por la nieve y vuelve
// sled3(w,x,z,s): trineo rojo; al tocarlo se desliza por la nieve y vuelve. Marca userData.sled.
export function sled3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.sled=1;g.userData.dur=2;const b=grp(g,[0,0,0]);
  mk(Box(1.4,.08,.6),'#E8503C',{p:[0,.32,0],to:b,ol:.03});for(const sd of[-1,1]){mk(Box(1.5,.05,.05),'#8A5A3A',{p:[0,.05,sd*.26],to:b,ol:.01,cs:false});mk(new THREE.TorusGeometry(.12,.025,5,10,PI),'#8A5A3A',{p:[.75,.17,sd*.26],r:[0,0,-PI/2],to:b,ol:0,cs:false});
    for(const px of[-.45,.35])mk(Cyl(.025,.025,.27,4),'#8A5A3A',{p:[px,.18,sd*.26],to:b,ol:0,cs:false})}
  mk(Box(.08,.3,.6),'#E8503C',{p:[-.68,.48,0],to:b,ol:.02});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2){const q=e/2,d=Math.sin(q*PI);b.position.x=d*2.2;b.rotation.z=Math.cos(q*PI)*.08*Math.min(d*4,1)}else{b.position.x=0;b.rotation.z=0}});return g}
// Bosque: un pájaro carpintero en un tronco; de vez en cuando picotea, y al tocarlo hace toc-toc-toc muy rápido; de noche duerme
// wpk3(w,x,z,s): pájaro carpintero en un tronco que picotea cada 4,5 s; al tocarlo hace toc-toc rápido. De noche
// duerme. Marca userData.wpk.
export function wpk3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.wpk=1;hitS(g,.6,1.3,1,1.6);g.userData.dur=1.3;mk(Cyl(.32,.4,2.4,12),'#8A5A3A',{p:[0,1.2,0],to:g,ol:.04});mk(Cyl(.33,.33,.04,12),'#E3C08F',{p:[0,2.41,0],to:g,ol:0,cs:false});
  mk(Sph(.12,10,8),'#3A2414',{p:[.05,1.7,.33],s:[1,1.3,.3],to:g,ol:0,cs:false});const bd=grp(g,[.22,1.15,.42],1.5),nt=skyNow().night;
  mk(Sph(.18,12,10),'#2F3446',{p:[0,0,0],s:[.9,1.3,.8],to:bd,ol:.02});mk(Sph(.12,10,8),'#FFFFFF',{p:[0,-.02,.1],s:[.9,1.2,.6],to:bd,ol:0,cs:false});
  const hd=grp(bd,[0,.26,.04]);mk(Sph(.13,12,10),'#2F3446',{to:hd,ol:.02});mk(Sph(.09,10,8),'#E8503C',{p:[0,.1,-.04],s:[1,.8,1.4],to:hd,ol:0,cs:false});mk(Cone(.035,.2,6),'#FFC93C',{p:[0,-.02,.18],r:[PI/2,0,0],to:hd,ol:0,cs:false});
  for(const sd of[-1,1])mk(Sph(.03,6,5),nt?'#2F3446':'#FFFFFF',{p:[sd*.08,.03,.09],s:nt?[1,.3,1]:[1,1,1],to:hd,ol:0,cs:false});if(nt)zzz3(w,g,1.6);
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<1.3)hd.rotation.x=Math.abs(Math.sin(e*PI*7))*.6;else if(nt)hd.rotation.x=.5;else{const c=T%4.5;hd.rotation.x=c<.6?Math.abs(Math.sin(c*PI*5))*.5:0}});return g}
// Casitas: una pelota de playa; al tocarla bota tres veces rodando y vuelve a su sitio
// ball3(w,x,z,s): pelota de playa de gajos; al tocarla bota tres veces rodando y vuelve. Marca userData.ball.
export function ball3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.ball=1;g.userData.dur=1.8;const b=grp(g,[0,.45,0]);
  ['#FF6B6B','#FFFFFF','#5BB8F5','#FFFFFF','#FFC93C','#FFFFFF'].forEach((c,i)=>mk(new THREE.SphereGeometry(.45,5,12,i*PI/3,PI/3),c,{to:b,ol:.02}));
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<1.8){const q=e/1.8,ph=q*3,h=Math.abs(Math.sin(ph*PI))*(1-q)*1.6,d=Math.sin(q*PI)*1.2;b.position.set(d,.45+h,0);b.rotation.z=-d/.45;b.scale.set(1,h<.08?.85:1,1)}
    else if(b.position.x!==0){b.position.set(0,.45,0);b.rotation.z=0;b.scale.set(1,1,1)}});return g}
// Inglés: un soldado de la guardia con gorro alto; al tocarlo saluda y marca el paso
// guard3(w,x,z,s): soldado de la guardia inglesa con gorro alto; al tocarlo saluda y marca el paso. Marca userData.guard.
export function guard3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.guard=1;g.userData.dur=2;const b=grp(g,[0,0,0]),L: THREE.Group[]=[];
  for(const sd of[-1,1]){const l=grp(b,[sd*.12,.55,0]);mk(Cyl(.08,.08,.55,8),'#2F3446',{p:[0,-.27,0],to:l,ol:.02});mk(Box(.14,.08,.22),K,{p:[0,-.52,.04],to:l,ol:0,cs:false});L.push(l)}
  mk(Cyl(.24,.22,.6,12),'#E03A3A',{p:[0,.85,0],to:b,ol:.03});mk(Cyl(.25,.25,.07,12),'#FFFFFF',{p:[0,.7,0],to:b,ol:0,cs:false});for(let i=0;i<3;i++)mk(Sph(.025,6,5),'#FFC93C',{p:[0,.8+i*.12,.23],to:b,ol:0,cs:false});
  mk(Sph(.17,12,10),'#FFE0C2',{p:[0,1.3,0],to:b,ol:.02});for(const sd of[-1,1])mk(Sph(.025,6,5),K,{p:[sd*.06,1.32,.15],to:b,ol:0,cs:false});
  mk(Cyl(.19,.21,.5,12),'#1E1E28',{p:[0,1.65,0],to:b,ol:.03});mk(Sph(.19,12,8),'#1E1E28',{p:[0,1.9,0],s:[1,.6,1],to:b,ol:0,cs:false});
  // los brazos: un grupo por brazo con el pivote en el hombro, para poder girarlos enteros
  const A: THREE.Group[]=[];for(const sd of[-1,1]){const a=grp(b,[sd*.29,1.08,0]);mk(Cyl(.06,.06,.45,8),'#E03A3A',{p:[0,-.2,0],to:a,ol:.02});mk(Sph(.07,8,6),'#FFFFFF',{p:[0,-.45,0],to:a,ol:0,cs:false});A.push(a)}
  // cada cuadro: durante 2 s tras el toque, el brazo derecho (A[1]) sube a saludar en 0,25 s, se queda y baja;
  // desde 0,8 s las piernas (L) marcan el paso alternándose y el cuerpo b da botecitos. Después, todo en reposo.
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(e<2){A[1].rotation.z=e<.25?e/.25*2.6:e<1?2.6:Math.max(0,2.6-(e-1)*5);A[1].rotation.x=e<1?-.4:0;
    const m=e>.8?Math.sin((e-.8)*PI*4):0;L[0].rotation.x=Math.max(0,m)*-.9;L[1].rotation.x=Math.max(0,-m)*-.9;b.position.y=Math.abs(m)*.05}else{A[1].rotation.set(0,0,0);L[0].rotation.x=L[1].rotation.x=0;b.position.y=0}});return g}
// Fiestas: un cañón de confeti; al tocarlo da un respingo con un ¡pum! y lanza confeti de colores
// ===== PATRÓN COMÚN DE LOS OBJETOS 3D TOCABLES DE LAS ZONAS (cann3, goat3, palm3, sunf3... y los demás xxx3 de este archivo) =====
// Firma: xxx3(w,x,z,s) -> devuelve el grupo g del objeto.
//   w: el mundo 3D activo (lo crea newWorld: w.sc es la escena, w.upd la lista de funciones que se llaman en cada cuadro).
//   x,z: posición en el suelo de la zona (y=0); s: escala del objeto entero.
// Pasos:
//   1. g=grp(w.sc,[x,0,z],s): grupo raíz colgado de la escena; las piezas van dentro (mk(...,{to:g}) o en subgrupos grp(g,[...])).
//      mk(geometría,color,{p:posición,r:rotación,s:escala,to:padre,ol:grosor del contorno oscuro (0 = sin contorno),cs:false = no hace sombra}).
//      Los subgrupos sirven de "articulaciones": se gira o mueve el subgrupo y se mueven todas sus piezas.
//   2. g.userData.cann=1: la "marca de tipo". WOBK (mundo3d/interaccion.ts) reconoce por ella los objetos que se pueden tocar; wobInit los guarda
//      en w.trees y wobTap, al tocarlos, pone g.userData.wob=T (el instante del toque, en segundos del reloj global T de nucleo/pantalla.ts).
//   3. g.userData.dur: cuánto dura (en segundos) la animación del toque; pasado ese tiempo, wobInit vuelve a poner wob=null.
//      Para eso el tipo tiene que estar también en la lista larga de wobInit; si no, se usa el meneo genérico de árbol de 1,6 s.
//   4. hitS(g,...) (opcional): una bola invisible más grande para acertar con el dedo en objetos finos.
//   5. w.upd.push(()=>{...}): animación de cada cuadro. Siempre empieza igual: k=g.userData.wob; e=k==null?9:T-k
//      (e = segundos desde el toque; 9 significa "no tocado", así que "e<dur" quiere decir "se está animando ahora").
//      Fuera del toque suele haber una animación suave de reposo con T (respirar, mirar, ondear) y todo vuelve a su sitio.
//   6. Los sonidos, partículas y la voz del toque NO están aquí: están en wobTap, en la rama else if(u.cann){...}.
//   De noche (skyNow().night) muchos animales duermen: zzz3 les pone unas zetas y su animación de reposo cambia.
// cann3: el cuerpo b retrocede, el tubo tb se aplasta y salen 18 papelitos de confeti P en parábola durante 2 s.
export function cann3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.cann=1;g.userData.dur=2;const b=grp(g,[0,0,0]);
  for(const sd of[-1,1])mk(Cyl(.28,.28,.08,14),'#FFC93C',{p:[sd*.32,.28,0],r:[0,0,PI/2],to:b,ol:.02});mk(Box(.5,.18,.5),'#8A5A3A',{p:[0,.3,0],to:b,ol:.02});
  const tb=grp(b,[0,.45,0]);tb.rotation.x=-.7;mk(Cyl(.2,.24,.9,14),'#B48CE0',{p:[0,.3,0],to:tb,ol:.03});mk(Cyl(.23,.23,.08,14),'#FF6B6B',{p:[0,.72,0],to:tb,ol:.01,cs:false});
  // 18 papelitos escondidos; cada uno guarda en userData.v su velocidad inicial [x,y,z]. raycast vacío = no se pueden tocar
  const P: THREE.Mesh[]=[];for(let i=0;i<18;i++){const m=mk(Box(.2,.03,.12),DIAC[i%7],{ol:0,cs:false,to:g});m.raycast=()=>{};m.visible=false;const a=i*2.4,r=.4+(i%5)*.25;m.userData.v=[Math.cos(a)*r,3.4+(i%4)*.5,1.6+Math.sin(a)*r];P.push(m)}
  // retroceso del cañón (0,4 s) y aplastamiento del tubo (0,2 s); cada papelito sigue una parábola y=0,9+vy*t-2,6*t*t
  // (la gravedad), sin bajar del suelo (.05) y con el avance en z topado; a los 2 s se esconden otra vez
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;b.position.z=e<.4?-Math.sin(e/.4*PI)*.18:0;tb.scale.y=e<.2?1-Math.sin(e/.2*PI)*.2:1;
    for(const m of P){if(e<2){const v=m.userData.v,t=Math.max(e-.05,0);m.visible=e>.05;m.position.set(v[0]*t,Math.max(.05,.9+v[1]*t-2.6*t*t),Math.min(.6+v[2]*t,.6+v[2]*1.2));m.rotation.set(t*9+v[0],t*7,t*5)}else if(m.visible)m.visible=false}});return g}
// Montaña: una cabra montés sobre una roca; mueve la cabeza y al tocarla da un salto y bala
// (patrón común: ver cann3) Marca goat, 1,6 s. b = el cuerpo, que salta y da una vuelta entera; hd = la cabeza, que se mueve sola.
// De noche duerme: zetas, cabeza agachada y cuerpo un poco aplastado.
export function goat3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.goat=1;g.userData.dur=1.6;mk(Sph(.7,10,8),'#9AA3AE',{p:[0,.2,0],s:[1.2,.75,1],to:g,ol:.04});
  const b=grp(g,[0,.68,0]),C='#F1E7D6',nt=skyNow().night;if(nt)zzz3(w,g,1.4);mk(Sph(.32,12,10),C,{p:[0,.42,0],s:[1.35,.9,.9],to:b,ol:.03});for(const [px,pz] of[[-.28,-.14],[-.28,.14],[.28,-.14],[.28,.14]])mk(Cyl(.05,.05,.32,6),C,{p:[px,.16,pz],to:b,ol:.01,cs:false});
  const hd=grp(b,[.42,.62,0]);mk(Sph(.17,10,8),C,{s:[1.2,1,.9],to:hd,ol:.02});for(const sd of[-1,1]){mk(new THREE.TorusGeometry(.1,.03,5,10,PI*1.2),'#8A6A4A',{p:[-.05,.14,sd*.07],r:[0,0,.6],to:hd,ol:0,cs:false});mk(Sph(.025,6,5),K,{p:[.1,.04,sd*.1],to:hd,ol:0,cs:false})}
  mk(Cone(.05,.14,6),'#FFFFFF',{p:[.12,-.18,0],r:[PI,0,0],to:hd,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;hd.rotation.z=nt&&!(e<1.6)?-.45:Math.sin(T*.9)*.15;if(e<1.6){const q=e/1.6;b.position.y=.68+Math.sin(q*PI)*1.1;b.rotation.y=q*PI*2;b.scale.y=q<.08||q>.92?.85:1}else{b.position.y=nt?.6:.68;b.rotation.y=0;b.scale.y=nt?.8:1}});return g}
// Mapa: una palmera en la playa; al tocarla se balancea y se le cae un coco que bota
// (patrón común: ver cann3) Marca palm, 1,8 s. t = tronco (6 trozos que se curvan), cr = copa con 7 hojas, C = 3 cocos; solo cae el primero (cc).
// El tronco se mece siempre un poco con T; al tocarlo, un vaivén que se va apagando.
export function palm3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.palm=1;g.userData.dur=1.8;const t=grp(g,[0,0,0]);
  for(let i=0;i<6;i++)mk(Cyl(.17-i*.012,.2-i*.012,.5,8),i%2?'#B88A5A':'#A47548',{p:[Math.sin(i*.25)*.25*i/5,.25+i*.46,0],r:[0,0,-.12*i/5],to:t,ol:.02});
  const cr=grp(t,[.3,2.85,0]);for(let i=0;i<7;i++){const l=grp(cr,[0,0,0]);l.rotation.y=i/7*PI*2;mk(Cone(.32,1.6,4),i%2?'#4FAF5A':'#3E9A55',{p:[.75,-.12,0],r:[0,0,-PI/2-.35],s:[1,1,.25],to:l,ol:.02})}
  const C=[];for(const [a,b] of[[.18,.12],[-.14,.15],[.02,-.18]])C.push(mk(Sph(.14,10,8),'#6B4423',{p:[a,-.2,b],to:cr,ol:.02}));const cc=C[0];
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;t.rotation.z=Math.sin(T*.8)*.03+(e<1.8?Math.sin(e*8)*.12*(1-e/1.8):0);
    // el coco cae acelerando (f*f) hasta el suelo hacia los 0,43 s y luego bota cada vez menos; al acabar vuelve a la copa
    if(e<1.8){const f=Math.max(e-.2,0),y=-.2-Math.min(f*f*14,2.55)+(f>.43?Math.abs(Math.sin((f-.43)*9))*.5*Math.max(0,1-(f-.43)*1.4):0);cc.position.set(.18+Math.min(f,.43)*.8,y,.12)}else if(cc.position.y!==-.2)cc.position.set(.18,-.2,.12)});return g}
// Jardín: un girasol que mira hacia Tito; al tocarlo gira los pétalos y sonríe
// (patrón común: ver cann3) Marca sunf, 1,5 s, con hitS. hd = cabeza que gira despacio hacia Tito (w.tito); pt = corona de pétalos,
// que da una vuelta al tocarlo; sm = sonrisa, que se estira. De noche cierra los ojos, agacha la cabeza y encoge los pétalos.
export function sunf3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.sunf=1;hitS(g,.7,1.6,1,1.7);g.userData.dur=1.5;mk(Cyl(.06,.08,2.2,6),'#5E8A3A',{p:[0,1.1,0],to:g,ol:.02});for(const sd of[-1,1])mk(Sph(.22,8,6),'#6CC24A',{p:[sd*.22,.9+sd*.2,0],s:[1.4,.3,.8],r:[0,0,sd*.4],to:g,ol:.01,cs:false});
  const hd=grp(g,[0,2.25,.05]),pt=grp(hd,[0,0,0]),nt=skyNow().night;if(nt)zzz3(w,g,2.6);for(let i=0;i<12;i++){const a=i/12*PI*2;mk(Sph(.15,8,6),'#FFC93C',{p:[Math.cos(a)*.42,Math.sin(a)*.42,0],s:[1.6,.7,.3],r:[0,0,a],to:pt,ol:.01,cs:false})}
  mk(Cyl(.32,.32,.12,16),'#8A5A3A',{r:[PI/2,0,0],p:[0,0,.03],to:hd,ol:.02});for(const sd of[-1,1])mk(Sph(.04,6,5),K,{p:[sd*.11,.07,.1],s:nt?[1.2,.3,1]:[1,1,1],to:hd,ol:0,cs:false});const sm=mk(new THREE.TorusGeometry(.1,.025,5,10,PI),K,{p:[0,-.02,.1],r:[0,0,PI],to:hd,ol:0,cs:false});
  // seguimiento suave: en cada cuadro la cabeza recorre un 5 % de lo que le falta hasta el ángulo que mira a Tito (como mucho ±0,7)
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;const tx=w.tito?w.tito.position.x-x:0;if(nt&&!(e<1.5)){hd.rotation.y*=.9;hd.rotation.x+=(.6-hd.rotation.x)*.1;pt.scale.setScalar(.7)}else{hd.rotation.x*=.85;pt.scale.setScalar(1);hd.rotation.y+=((Math.max(-.7,Math.min(.7,tx*.12)))-hd.rotation.y)*.05}
    pt.rotation.z=e<1.5?e/1.5*PI*2:0;sm.scale.set(1,e<1.5?1.6:1,1);hd.position.y=2.25+(e<1.5?Math.sin(e/1.5*PI)*.15:0)});return g}
// Cofre: un loro pirata en su percha; mueve la cabeza, al tocarlo aletea y grazna, y lo celebra cuando se abre el cofre
// (patrón común: ver cann3) Marca parrot, 1,4 s, con hitS. b = cuerpo, W = alas (grupos con pivote en el hombro), hd = cabeza.
// También se anima solo con chainWob (titoCheer, flores y cofre en la zona del cofre). Dormido (de noche) ladea la cabeza.
export function parrot3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.parrot=1;hitS(g,.7,1.6,1,2);g.userData.dur=1.4;mk(Cyl(.06,.08,2,8),'#8A5A3A',{p:[0,1,0],to:g,ol:.02});mk(Cyl(.3,.36,.08,12),'#8A5A3A',{p:[0,.04,0],to:g,ol:.02});mk(Cyl(.04,.04,.9,6),'#A47548',{p:[0,2,0],r:[0,0,PI/2],to:g,ol:.02});
  const b=grp(g,[0,2.04,0]);mk(Sph(.24,12,10),'#E8503C',{p:[0,.28,0],s:[.9,1.3,.85],to:b,ol:.03});mk(Box(.14,.4,.05),'#5BB8F5',{p:[0,.02,-.2],r:[.5,0,0],to:b,ol:.01,cs:false});
  const W: THREE.Group[]=[];for(const sd of[-1,1]){const wg=grp(b,[sd*.2,.38,0]);mk(Sph(.14,8,6),'#5BB8F5',{p:[sd*.04,-.12,-.02],s:[.45,1.3,.8],to:wg,ol:.01,cs:false});mk(Sph(.08,8,6),'#FFC93C',{p:[sd*.05,-.28,-.04],s:[.5,1,.7],to:wg,ol:0,cs:false});W.push(wg)}
  const hd=grp(b,[0,.62,.05]),nt=skyNow().night;if(nt)zzz3(w,g,2.9);mk(Sph(.17,12,10),'#E8503C',{to:hd,ol:.02});mk(Sph(.09,8,6),'#FFFFFF',{p:[0,.02,.12],s:[1.3,.8,.6],to:hd,ol:0,cs:false});mk(Cone(.06,.16,6),'#3A2414',{p:[0,-.04,.19],r:[PI/2+.6,0,0],to:hd,ol:0,cs:false});
  for(const sd of[-1,1])mk(Sph(.03,6,5),K,{p:[sd*.1,.05,.12],s:nt?[1.3,.3,1]:[1,1,1],to:hd,ol:0,cs:false});for(const sd of[-1,1])mk(Sph(.04,6,5),'#FFC93C',{p:[sd*.06,-.02,0],s:[1,.5,1.6],to:b,ol:0,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,sl=nt&&!(e>=0&&e<1.4);hd.rotation.z=sl?.35:Math.sin(T*1.3)*.2;hd.rotation.y=sl?0:Math.sin(T*.7)*.4;
    if(e>=0&&e<1.4){const f=Math.sin(e*28)*.8*(1-e/1.4);W[0].rotation.z=-.3+f;W[1].rotation.z=.3-f;b.position.y=2.04+Math.sin(e/1.4*PI)*.35;hd.rotation.x=Math.sin(e*12)*.2}else{W[0].rotation.z=W[1].rotation.z=0;b.position.y=2.04;hd.rotation.x=0}});return g}
// squawk(d): graznido del loro, dos notas seguidas con tone (nucleo/sonido.ts); d = retraso en segundos
export const squawk=(d=0)=>{tone(1100,.12,'sawtooth',.04,1.4,d);tone(1300,.16,'sawtooth',.04,.7,d+.15)};
// Inglés: la bandera del Reino Unido ondea en su mástil; al tocarla ondea con fuerza y suena una fanfarria
// (patrón común: ver cann3) Marca flag, 1,8 s, con hitS. La tela es un plano de 10x1 trozos con la bandera dibujada en un canvas
// (canvasTex, guardada en caché como 'ukflag'). En cada cuadro se mueve la z de cada vértice con una onda: más fuerte y rápida tras el toque.
export function flag3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.flag=1;hitS(g,.8,2.6,1.1,1.8);g.userData.dur=1.8;mk(Cyl(.05,.06,3.4,8),'#E8E8EE',{p:[0,1.7,0],to:g,ol:.02});mk(Sph(.1,8,6),'#FFC93C',{p:[0,3.45,0],to:g,ol:.01,cs:false});
  const tx=canvasTex(256,128,()=>{ctx.fillStyle='#1F3D8F';ctx.fillRect(0,0,256,128);ctx.lineCap='butt';/* X(color,grosor): dibuja las dos diagonales de la bandera */const X=(c: string,wd: number)=>{ctx.strokeStyle=c;ctx.lineWidth=wd;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(256,128);ctx.moveTo(256,0);ctx.lineTo(0,128);ctx.stroke()};X('#fff',26);X('#D7263D',9);
    ctx.fillStyle='#fff';ctx.fillRect(108,0,40,128);ctx.fillRect(0,44,256,40);ctx.fillStyle='#D7263D';ctx.fillRect(116,0,24,128);ctx.fillRect(0,52,256,24)},'ukflag');
  // translate(.8,...) pone el borde izquierdo de la tela en el mástil; X0 guarda la x original de cada vértice: la onda crece con x,
  // así el lado del mástil no se mueve. P.needsUpdate=true avisa a Three.js de que los vértices han cambiado
  const geo=new THREE.PlaneGeometry(1.6,.8,10,1);geo.translate(.8,0,0);const fl=new THREE.Mesh(geo,new THREE.MeshToonMaterial({map:tx,gradientMap:gradiente(),side:THREE.DoubleSide}));fl.position.set(.04,3,0);g.add(fl);const P=geo.attributes.position,X0: number[]=[];for(let i=0;i<P.count;i++)X0.push(P.getX(i));
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,a=e<1.8?.22*(1-e/1.8)+.07:.07,sp=e<1.8?9:3.5;for(let i=0;i<P.count;i++){const x=X0[i];P.setZ(i,Math.sin(x*4-T*sp)*a*x)}P.needsUpdate=true});return g}
// Fiestas: una máquina de pompas; las pompas suben despacio y, al tocarlas, explotan con un "plop"
// (patrón común: ver cann3, con una diferencia) Lo tocable no es la máquina sino cada pompa: 5 grupos b con marca bub y dur 0,35 s.
// u.ph (0..1) es la fase de subida de cada pompa; al tocarla crece, desaparece y vuelve a empezar abajo (ph=0).
// Todas las pompas comparten material (bm) y geometría (gcache), para gastar menos memoria.
export function bubbles3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);mk(rbox(.7,.5,.5,.08),'#5BB8F5',{p:[0,.25,0],to:g,ol:.03});mk(Cyl(.12,.15,.2,10),'#FFC93C',{p:[0,.58,0],to:g,ol:.02});
  const bm=new THREE.MeshBasicMaterial({color:'#7FC8FF',transparent:true,opacity:.6,depthWrite:false}),hm=new THREE.MeshBasicMaterial({color:'#FFFFFF'}),B: THREE.Group[]=[];
  for(let i=0;i<5;i++){const b=grp(g,[0,0,0]);b.userData.bub=1;b.userData.dur=.35;const m=new THREE.Mesh(gcache('bub',()=>Sph(.3,14,10)),bm);b.add(m);const h=new THREE.Mesh(gcache('bubh',()=>Sph(.05,6,5)),hm);h.position.set(-.1,.12,.21);h.raycast=()=>{};b.add(h);b.userData.ph=i/5;B.push(b)}
  // dt = segundos desde el cuadro anterior (lo pasa R3frame): la subida avanza con dt y cada pompa sigue su propio camino ondulado
  w.upd.push((dt: number)=>{for(const b of B){const u=b.userData;if(u.wob!=null&&T-u.wob<.35){b.scale.setScalar(1+(T-u.wob)*3);(b.children[0] as Nodo).material===bm&&(b.visible=(T-u.wob)<.12);if(T-u.wob>.3)u.ph=0;continue}b.visible=true;
    u.ph=(u.ph+dt*.12)%1;const q=u.ph,i=B.indexOf(b);b.position.set(Math.sin(q*9+i*2)*.5+(i-2)*.25,.7+q*4.2,Math.cos(q*7+i)*.3);b.scale.setScalar(Math.min(q*8,1)*(.8+(i%3)*.15))}});return g}
// Bosque: un nido con tres huevos sobre un tocón; al tocarlo los huevos se abren, asoman tres pollitos piando y se vuelven a esconder
// (patrón común: ver cann3) Marca nest, 2,4 s. E = los 3 huevos {e: grupo del huevo, ck: pollito, top: mitad de arriba de la cáscara, i: número}.
// Cada huevo empieza 0,15 s después del anterior.
export function nest3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.nest=1;g.userData.dur=2.4;mk(Cyl(.45,.5,.6,12),'#8A5A3A',{p:[0,.3,0],to:g,ol:.03});mk(Cyl(.44,.44,.03,12),'#E3C08F',{p:[0,.61,0],to:g,ol:0,cs:false});
  mk(new THREE.TorusGeometry(.32,.12,6,14),'#B07A4A',{p:[0,.7,0],r:[PI/2,0,0],to:g,ol:.02});mk(Cyl(.3,.24,.1,12),'#9A6A3E',{p:[0,.66,0],to:g,ol:0,cs:false});
  const E: {e: THREE.Group, ck: THREE.Group, top: THREE.Mesh, i: number}[]=[];[[-.12,-.06],[.13,-.04],[0,.12]].forEach(([a,b],i)=>{const e=grp(g,[a,.72,b]);mk(Sph(.11,10,8),'#F6F0E2',{s:[1,1.25,1],to:e,ol:.01,cs:false});
    const ck=grp(e,[0,0,0]);mk(Sph(.1,10,8),'#FFD84A',{p:[0,.06,0],to:ck,ol:.01,cs:false});mk(Cone(.03,.07,5),'#FF9A3C',{p:[0,.06,.1],r:[PI/2,0,0],to:ck,ol:0,cs:false});for(const sd of[-1,1])mk(Sph(.018,5,4),K,{p:[sd*.04,.1,.08],to:ck,ol:0,cs:false});
    const top=mk(Sph(.11,10,8),'#F6F0E2',{s:[1,1.25,1],to:e,ol:.01,cs:false});E.push({e,ck,top,i})});
  // q (0..1) sube en 0,3 s, se mantiene y baja en los últimos 0,3 s: la cáscara se levanta y gira, el pollito asoma y bota;
  // en reposo los huevos se mecen un poco
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;for(const o of E){const d=e-o.i*.15;if(d>0&&d<2.4-o.i*.15){const q=Math.min(d/.3,1)*Math.min((2.2-d)/.3,1);o.top.position.set(q*.1,.06+q*.22,0);o.top.rotation.z=-q*.8;o.top.scale.set(1,1.25,1);o.ck.position.y=q*.1+Math.abs(Math.sin(d*10))*.03*q;o.ck.visible=q>.05}
    else{o.top.position.set(0,0,0);o.top.rotation.z=0;o.ck.visible=false;o.e.rotation.z=Math.sin(T*3+o.i*2)*.05}}});return g}
// Montaña: una marmota se asoma de su madriguera en la nieve; al tocarla silba y se esconde, y vuelve a salir
// (patrón común: ver cann3) Marca marm, 2 s, con hitS. m = la marmota entera (sube y baja en y); hd = la cabeza, que mira a los lados.
// Al tocarla: espera 0,3 s, baja en 0,2 s, se queda escondida y vuelve a subir en 0,4 s.
// De noche está metida en la madriguera (y=-0,75) y se oculta (visible=false) cuando baja del todo.
export function marm3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.marm=1;hitS(g,.6,.5);g.userData.dur=2;mk(Cyl(.5,.6,.16,14),'#FFFFFF',{p:[0,.08,0],to:g,ol:.03});mk(Cyl(.3,.3,.02,12),'#3A2D28',{p:[0,.17,0],to:g,ol:0,cs:false});
  const m=grp(g,[0,0,0]),C='#A07850';mk(Sph(.26,12,10),C,{p:[0,.4,0],s:[1,1.5,.9],to:m,ol:.03});mk(Sph(.17,10,8),'#E8D2B0',{p:[0,.4,.14],s:[1,1.4,.6],to:m,ol:0,cs:false});
  const hd=grp(m,[0,.82,.04]);mk(Sph(.2,12,10),C,{to:hd,ol:.02});mk(Sph(.1,8,6),'#E8D2B0',{p:[0,-.05,.15],s:[1.2,.8,.7],to:hd,ol:0,cs:false});mk(Sph(.035,6,5),K,{p:[0,-.01,.21],to:hd,ol:0,cs:false});
  for(const sd of[-1,1]){mk(Sph(.03,6,5),K,{p:[sd*.08,.06,.16],to:hd,ol:0,cs:false});mk(Sph(.06,8,6),C,{p:[sd*.15,.14,0],s:[1,.8,.6],to:hd,ol:0,cs:false});mk(Sph(.06,8,6),C,{p:[sd*.12,.5,.18],to:m,ol:0,cs:false})}
  const nt=skyNow().night;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;let y=nt?-.75:0;if(e<2){y=e<.3?0:e<.5?-(e-.3)/.2*.85:e<1.3?-.85:Math.min(0,-.85+(e-1.3)/.4*.85);if(nt&&e>1.3)y=-.75}m.position.y=y;m.visible=y>-.8;hd.rotation.y=nt?0:Math.sin(T*.8)*.5});return g}
// Jardín: un espantapájaros con un cuervo en el brazo; al tocarlo el espantapájaros se menea, el cuervo sale volando, da una vuelta y vuelve
// (patrón común: ver cann3) Marca scare, 2,6 s. b = el espantapájaros (se menea 1,2 s); cr = el cuervo, con alas W, que da una vuelta
// en círculo (ángulo a) subiendo y bajando, y vuelve a su brazo. De noche el cuervo duerme (zetas, cabeza ladeada).
export function scare3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.scare=1;g.userData.dur=2.6;const b=grp(g,[0,0,0]);mk(Cyl(.05,.06,2.2,6),'#8A5A3A',{p:[0,1.1,0],to:b,ol:.02});mk(Cyl(.04,.04,1.6,6),'#8A5A3A',{p:[0,1.55,0],r:[0,0,PI/2],to:b,ol:.02});
  mk(Box(.6,.7,.3),'#5BB8F5',{p:[0,1.3,0],to:b,ol:.03});for(let i=0;i<3;i++)mk(Box(.12,.12,.31),'#FFC93C',{p:[-.15+i*.15,1.1+(i%2)*.25,0],to:b,ol:0,cs:false});
  for(const sd of[-1,1]){mk(Box(.4,.22,.24),'#E8503C',{p:[sd*.48,1.55,0],to:b,ol:.02});mk(Cone(.08,.2,6),'#F2C14E',{p:[sd*.76,1.55,0],r:[0,0,-sd*PI/2],to:b,ol:0,cs:false})}
  mk(Sph(.22,12,10),'#E9C99A',{p:[0,1.92,0],to:b,ol:.02});for(const sd of[-1,1])mk(Box(.06,.06,.02),K,{p:[sd*.08,1.96,.21],r:[0,0,PI/4],to:b,ol:0,cs:false});mk(new THREE.TorusGeometry(.08,.015,4,8,PI),K,{p:[0,1.86,.2],r:[0,0,PI],to:b,ol:0,cs:false});
  mk(Cyl(.42,.42,.04,14),'#C9772E',{p:[0,2.08,0],to:b,ol:.02});mk(Cyl(.2,.24,.28,12),'#C9772E',{p:[0,2.24,0],to:b,ol:.02});
  const cr=grp(g,[.6,1.7,0]),W: THREE.Group[]=[],nt=skyNow().night;if(nt)zzz3(w,g,2.1);mk(Sph(.12,10,8),'#2F3446',{s:[1.3,1,.9],to:cr,ol:.02});mk(Sph(.08,8,6),'#2F3446',{p:[.12,.1,0],to:cr,ol:.01,cs:false});mk(Cone(.03,.1,5),'#F2C14E',{p:[.22,.09,0],r:[0,0,-PI/2],to:cr,ol:0,cs:false});
  for(const sd of[-1,1]){const wg=grp(cr,[0,.04,sd*.08]);mk(Box(.18,.02,.14),'#2F3446',{p:[0,0,sd*.07],to:wg,ol:0,cs:false});W.push(wg)}
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;b.rotation.z=e<1.2?Math.sin(e*12)*.12*(1-e/1.2):0;
    if(e<2.6){const q=Math.min(e/2.6,1),a=q*PI*2;cr.position.set(.6+Math.sin(a)*1.6,1.7+Math.sin(q*PI)*1.6,Math.cos(a)*1.2-1.2+1.2*(1-Math.cos(q*PI*2))*.0);cr.rotation.y=-a;const f=Math.sin(T*30)*.7;W[0].rotation.x=f;W[1].rotation.x=-f}
    else{cr.position.set(.6,1.7,0);cr.rotation.y=0;W[0].rotation.x=W[1].rotation.x=0;cr.rotation.z=nt?-.35:0}});return g}
// Inglés: un paraguas en su soporte (en Londres llueve a menudo); al tocarlo se abre y llueve un ratito
// (patrón común: ver cann3) Marca umb, 2,4 s. cn = la copa con 8 gajos P (cada gajo es un grupo que gira en x para abrirse);
// D = 10 gotas de lluvia que caen en bucle; RB = arcoíris de 5 arcos que aparece 2 s después del toque y se va a los 5,5 s
// (rbT guarda el último toque, porque el arcoíris dura más que wob).
export function umb3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.umb=1;g.userData.dur=2.4;mk(Cyl(.25,.3,.5,12),'#2F3446',{p:[0,.25,0],to:g,ol:.02});mk(Cyl(.025,.025,1.8,6),'#2F3446',{p:[0,1.1,0],to:g,ol:.01});
  const cn=grp(g,[0,2,0]),P: THREE.Group[]=[];for(let i=0;i<8;i++){const p=grp(cn,[0,0,0]);p.rotation.y=i/8*PI*2;mk(Cone(.3,1.1,3),i%2?'#E8503C':'#FFFFFF',{p:[0,-.5,0],s:[1,1,.25],r:[0,0,0],to:p,ol:.01,cs:false});P.push(p)}
  const dm=new THREE.MeshBasicMaterial({color:'#7FC8F8',transparent:true,opacity:0}),D: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[]=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(gcache('rdrop',()=>Cyl(.015,.015,.22,4)),dm);m.raycast=()=>{};g.add(m);D.push(m)}
  /* arcoíris que sale cuando para la lluvia */const RB=['#E8503C','#F5A623','#F8E04A','#6CC56C','#4A90E2'].map((c,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(1.5-i*.12,.06,6,28,PI),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false}));m.raycast=()=>{};m.position.set(0,2.3,-.4);g.add(m);return m});let rbT=-99;
  // o (0..1) = cuánto está abierto: se abre en 0,3 s y se cierra en los últimos 0,4 s; las gotas solo se ven con el paraguas más de medio abierto
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;if(k!=null)rbT=k;const re=T-rbT,ro=re>2&&re<5.5?Math.min((re-2)/.5,1)*Math.min((5.5-re)/.8,1)*.75:0;RB.forEach(m=>{m.material.opacity=ro;m.visible=ro>0});const o=e<2.4?Math.min(e/.3,1)*Math.min((2.4-e)/.4,1):0;P.forEach(p=>p.children[0].rotation.x=-o*1.15);cn.position.y=2-o*.0;dm.opacity=o>.5?.8:0;
    D.forEach((m,i)=>{const a=i*2.4,r=1.25+(i%3)*.12,q=(e*1.6+i*.13)%1;m.position.set(Math.cos(a)*r,3.2-q*3,Math.sin(a)*r)})});return g}
// Verano (del 21 de junio al 15 de septiembre): sombrilla y castillo de arena en la playa del mapa; la sombrilla gira al tocarla y el castillo ondea su banderita
// summerNow(): ¿estamos en verano? (21 de junio a 15 de septiembre; getMonth cuenta desde 0: 5 = junio). Si es verano, el mapa pone sunb3 y sandc3
export const summerNow=()=>{const d=ahora(),m=d.getMonth(),n=d.getDate();return (m===5&&n>=21)||m===6||m===7||(m===8&&n<=15)};
// winterNow(): ¿estamos en invierno? (21 de diciembre a final de febrero). Lo usa el mapa para decorar la casa de Tito en invierno
export const winterNow=()=>{const d=ahora(),m=d.getMonth(),n=d.getDate();return (m===11&&n>=21)||m===0||m===1};
// (patrón común: ver cann3) Sombrilla de playa. Marca sunb, 1,6 s. tp = la tela (6 gajos de cono de colores), que da una vuelta
// subiendo un poco al tocarla. También pone una toalla rosa en el suelo.
export function sunb3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.sunb=1;g.userData.dur=1.6;mk(Cyl(.04,.04,2,6),'#FFFFFF',{p:[0,1,0],r:[0,0,.15],to:g,ol:.01});
  const tp=grp(g,[-.15,2,0]);tp.rotation.z=.15;['#FF6B6B','#FFFFFF','#5BB8F5','#FFFFFF','#FFC93C','#FFFFFF'].forEach((c,i)=>mk(new THREE.ConeGeometry(1.1,.5,3,1,false,i*PI/3,PI/3),c,{to:tp,ol:.02}));
  mk(Box(1,.06,.5),'#FF8FB1',{p:[.9,.03,.4],r:[0,.4,0],to:g,ol:.02,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;tp.rotation.y=e<1.6?(1-Math.cos(e/1.6*PI))*PI:0;tp.position.y=2+(e<1.6?Math.sin(e/1.6*PI)*.25:0)});return g}
// (patrón común: ver cann3) Castillo de arena. Marca sandc, 1,4 s. fl = la banderita, que ondea despacio siempre y rápido al tocarla.
// También pone un cubo azul al lado.
export function sandc3(w: Mundo,x: number,z: number,s: number){const g=grp(w.sc,[x,0,z],s);g.userData.sandc=1;g.userData.dur=1.4;const C='#EBCB8B';mk(Box(1.1,.5,.8),C,{p:[0,.25,0],to:g,ol:.03});
  for(const [a,b] of[[-.5,-.35],[.5,-.35],[-.5,.35],[.5,.35]]){mk(Cyl(.16,.18,.8,8),C,{p:[a,.4,b],to:g,ol:.02});mk(Cone(.2,.25,8),'#E0B870',{p:[a,.92,b],to:g,ol:.01,cs:false})}
  mk(Cyl(.25,.28,.7,10),C,{p:[0,.85,0],to:g,ol:.02});mk(Cyl(.015,.015,.5,4),'#8A5A3A',{p:[0,1.45,0],to:g,ol:0,cs:false});const fl=mk(Box(.28,.16,.02),'#FF6B6B',{p:[.14,1.62,0],to:g,ol:0,cs:false});
  mk(Cyl(.2,.14,.3,10),'#5BB8F5',{p:[.9,.15,.3],to:g,ol:.02,cs:false});
  w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k;fl.rotation.y=Math.sin(T*(e<1.4?14:3))*(e<1.4?.6:.25);fl.scale.y=e<1.4?1.3:1});return g}
// zona de toque invisible más grande, para que los dedos pequeños acierten con las cosas pequeñas o finas
// hitS(g,r,y,sx,sy): g = grupo al que se añade; r = radio; y = altura del centro; sx, sy = estirar en horizontal (x y z) o en vertical.
// Usa el material invisible FHIT (el rayo del toque la encuentra pero no se ve). Devuelve la malla.
export function hitS(g: THREE.Object3D,r: number,y: number,sx=1,sy=1){const h=new THREE.Mesh(gcache('xhit',()=>Sph(1,6,4)),fhit());h.position.y=y;h.scale.set(r*sx,r*sy,r*sx);g.add(h);return h}
// Tito lo celebra con un salto y una fanfarria (cada 5 pompas explotadas, o al tocar H-E-L-L-O en orden)
// titoCheer(x,y): x,y = punto de la pantalla 2D (1600x900) donde salen corazones, chispas y notas. Tito salta (st.hop) y suena una fanfarria;
// la primera vez en la visita (W3.chF) Tito explica la emoción 'contento'; de día, los animales de la zona lo celebran con chainWob.
export function titoCheer(x: number,y: number){if(W3&&!W3.chF){W3.chF=1;const sc0=sceneName;setTimeout(()=>{if(sceneName===sc0){say3('Contento. Cuando algo nos gusta mucho, sentimos alegría y sonreímos.',()=>sylClap(x,y,'CONTENTO'));numPop(x,y-60,2,'CONTENTO');parts[parts.length-1].hl=1}},2400)}/* la primera fiesta de la visita: Tito explica que está contento */noteParts(x,y,4,150);/* la fanfarria de Tito también suelta notas musicales */const st=SCENES[sceneName];if(st)st.hop=T+.15;if(W3&&!skyNow().night)({jardin:['frog','burrow'],bosque:['squir'],montana:['peng'],fiestas:['balloon'],ingles:['guard'],casita:['bird','lady'],map:['gull'],cofre:['parrot','crab']}[sceneName]||[]).forEach((k,i)=>chainWob(W3!,k,.5+i*.2,.12,3));/* los animales de alrededor también lo celebran */for(let i=0;i<5;i++)parts.push({x:x+rnd(-60,60),y:y-20+rnd(-20,20),vx:rnd(-25,25),vy:rnd(-110,-70),life:1.3,t:0,c:pick(['#FF5A7E','#FF7A9A','#F28AB8']),r:rnd(11,15),rot:0,k:'h',g:-15});/* al celebrar, también suben corazoncitos */[523,659,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.08,1,.2+i*.1));for(let i=0;i<3;i++)sparkles(x+(i-1)*60,y-40*i)}
// reacciones en cadena: al tocar algo, otras cosas de su tipo reaccionan después, escalonadas
// dropParts(x,y,n,cols,k): suelta n partículas que caen (nieve, hojas) en el punto x,y de la pantalla; cols = colores posibles,
// k = forma de la partícula (ver cómo se dibujan las parts en drawParts, nucleo/escenas.ts). (El comentario de arriba, reacciones en cadena, es de chainWob.)
export function dropParts(x: number,y: number,n: number,cols: string[],k: string){/* al sacudir un árbol cae nieve (Montaña) u hojas (Bosque) */for(let i=0;i<n;i++)parts.push({x:x+rnd(-55,55),y:y+rnd(-30,20),vx:rnd(-30,30),vy:rnd(-40,20),life:rnd(1,1.6),t:0,c:pick(cols),r:rnd(5,10),rot:rnd(0,6),k,g:260})}
// allTap(w,t,kind,x,y,N): cuenta en voz alta (sayNum) cuántos objetos distintos del tipo kind se han tocado (los guarda en el Set
// w['_all'+kind]); N = cuántos hay (si no se da, los cuenta en w.trees; con kind 'bfly' no cuenta las abejas). Cuenta hasta 10. Al tocarlos todos: '¡Muy bien!', se reinicia
// la cuenta y Tito lo celebra (titoCheer).
export function allTap(w: Mundo,t: THREE.Object3D,kind: string,x: number,y: number,N?: number){/* premio de Tito al tocar todos los de un tipo */const k=('_all'+kind) as `_all${string}`,n=N||(w.trees||[]).filter(o=>o.userData[kind]&&!(kind==='bfly'&&o.userData.bee)/* las abejas también llevan bfly: no cuentan como mariposas */).length;const o=(w[k]=w[k]||new Set).size;w[k].add(t);const m=w[k].size;if(n>1&&m>o&&m<=10){numPop(x,y,m);sayNum(m,m>=n?()=>say3('¡Muy bien!'):null)}/* en el Rincón del inglés se cuenta en inglés *//* cuenta en voz alta los que se van tocando */;if(n>1&&m>=n){w[k]=null;titoCheer(x,y)}}
// chainWob(w,kind,d0,step,max): programa que hasta max objetos del tipo kind se animen solos: el primero a los d0 segundos y cada uno
// step segundos después del anterior. Pone userData.wobAt; wobInit lo convierte en wob=T cuando llega la hora.
export function chainWob(w: Mundo,kind: string,d0: number,step: number,max: number){let i=0;for(const o of w.trees||[])if(o.userData[kind]&&!(kind==='bfly'&&o.userData.bee)&&i<max)/* las abejas también llevan bfly: aquí solo cuentan las mariposas */{o.userData.wobAt=T+d0+i*step;i++}}
// cloud3(to,x,y,z,s): nube de adorno (4 bolas unidas en una sola geometría con mg, guardada en gcache). to = padre. Devuelve el grupo.
// No lleva marca: quien la crea le pone userData.cloud=1 (y hitS) si debe poder tocarse.
export function cloud3(to: THREE.Object3D,x: number,y: number,z: number,s: number){const g=grp(to,[x,y,z],s);mk(gcache('cloud',()=>mg([[0,0,0,1],[1.1,.3,0,1.2],[2.2,0,0,.9],[1.1,-.2,.5,1]].map(([a,b,c,r])=>[Sph(r,14,10),[a,b,c]]))),'#FFFFFF',{cs:false,rs:false,ol:.04,to:g});return g}
// balloon3(to,x,z,c,h): globo de color c con su cuerda de altura h. Marca balloon: wobInit lo hace subir y bajar al tocarlo. Devuelve el grupo.
export function balloon3(to: THREE.Object3D,x: number,z: number,c: string,h=2.4){const g=grp(to,[x,0,z]);mk(Cyl(.012,.012,h,4),K,{p:[0,h/2,0],ol:0,cs:false,to:g});mk(Sph(.38,14,12),c,{p:[0,h+.35,0],s:[1,1.2,1],to:g,ol:.03});g.userData.balloon=1;return g}
