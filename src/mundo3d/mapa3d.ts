/*
 * mundo3d/mapa3d.ts: el mapa en 3D, la isla de Curiolandia (desde la fase 4h; antes, en mundo3d/mundo3d.ts): el mar
 * (sea3), la isla (island3), cada lugar del mapa (SPOT3, colocados con MAPPOS y MP), la casa de Tito con Pipo, los
 * lugares dormidos (zzz) o aún cerrados (greyAll) y buildMap, que monta el mundo entero.
 * montarMapa3D() (la llama mundo3d/mundo3d.ts al montar la capa 3D) pone la disposición de los lugares
 * (nucleo/disposicion.ts: lo que proyecta sync() cada cuadro, en MZP, para que mzOf y la lógica 2D de escenas/zonas.ts
 * acierten) y pone en SCENES.map el mapa 3D, otra escena hecha a partir de la 2D (desde la fase 4j; antes la envolvía,
 * escribía lo proyectado en MZ2 y envolvía goSeguir). Su seguir() hace que Tito camine hasta el lugar antes de entrar.
 * Exporta: montarMapa3D. Importa: del núcleo, escenas/escenas2d.ts y escenas/zonas.ts lo que dibuja y lee el mapa;
 * ahora() (aplicacion/puertos.ts); el motor (mundo3d/motor.ts), las piezas (mundo3d/materiales.ts) y lo de los demás
 * módulos de mundo3d/ (decorado, cielo, objetos, personajes e interacción).
 */
import * as THREE from 'three';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Mundo, Nodo, PuntoSuelo, Trio } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DF, DIAC, FLC, LF, PI, S, SCENES, SFX, T, VIVO, atHome, cap, card, circ, ctx, dist, drawCoinHUD, drawHome, fillStroke, inCoinHUD, lerp, pic, sceneName, sparkles, speaker, text, titoPos } from '../nucleo/indice.ts';
import { asamHoy, drawLogoSmall } from '../escenas/escenas2d.ts';
import { MAINZ, MZ2, SEGUIR, ZAGE, drawSeguir, goSeguir, houseLevel, mzOf, nextTema, petStage, spotNeed, spotOpen, zoneOpen } from '../escenas/zonas.ts';
import { ponDisposicion } from '../nucleo/disposicion.ts';
import { W3, camRig, newWorld, pickAt, projO, projR, setWorld } from './motor.ts';
import { Box, Cone, Cyl, M, OLm, Sph, V3, canvasTex, flowerTex, gradiente, grp, mg, mk, olGeo, picTex, pillSpr, pillTex, plane, prism, spr, starGeo } from './materiales.ts';
import { bez, bush3, fhit, fireflies, flower3, gull3, lock3, ribbon, ring3, rock3, tree3 } from './decorado.ts';
import { busy3, call0, flyTap, ponCasaP, seaTap, titoRect, walkGround, walkTick, walkTo, wobInit, wobTap } from './interaccion.ts';
import { balloon3, cloud3, crab3, dolph3, hab3, hallowNow, lighthouse3, palm3, pump3, sandc3, seasonFx, snowman3, summerNow, sunb3, whale3, winterNow, xmasNow, xtree3 } from './objetos.ts';
import { ffTap, makeHouse, makePipo, makeTito, titoHearts, titoTapSfx } from './personajes.ts';
import { skyNow } from './cielo.ts';

/* ================= EL MAPA: la isla de Curiolandia ================= */
// MZP: dónde ha quedado en la pantalla cada lugar del mapa {x,y,r} (id de MZ2 -> lo proyectado), lo último que proyectó
// sync(). Es la disposición de los lugares (nucleo/disposicion.ts: mzOf la pregunta). Desde la fase 4j; antes sync()
// escribía en MZ2 y una copia, MZB, guardaba las posiciones 2D.
// MP(x,y): pasa un punto de la pantalla 2D del mapa (1600x900) a coordenadas [x,z] del suelo 3D (40 píxeles = 1 unidad).
// MAPPOS: dónde va cada lugar del mapa en 3D, en píxeles 2D (se pasan con MP). id del lugar -> [x,y].
const MZP: Record<string, {x: number; y: number; r: number}>={};
const MP=(x: number,y: number): PuntoSuelo=>[(x-800)/40,(y-500)/40];
const MAPPOS: Record<string, PuntoSuelo>={plaza:[790,520],jardin:[360,560],bosque:[1110,300],montana:[1400,560],canciones:[330,310],trazos:[560,250],rutinas:[790,250],album:[1440,250],ingles:[1270,450],fiestas:[560,790],tienda:[800,820],casaTito:[1070,740]};
// sea3(w,c): crea el mar (plano grande de color c) en w.sc, lo guarda en w.sea y añade a w.upd la animación de las olas.
function sea3(w: Mundo,c: string){const g=new THREE.PlaneGeometry(220,160,70,50);g.rotateX(-PI/2);const m=new THREE.Mesh(g,M(c));m.position.y=-1.1;m.receiveShadow=true;w.sc.add(m);w.sea=m;
  // olas: altura y normal calculadas a mano (derivada de la fórmula); computeVertexNormals en cada cuadro costaba ~0,6 ms
  const p=g.attributes.position,nm=g.attributes.normal,b=Float32Array.from(p.array),A=p.array as Float32Array,N=nm.array as Float32Array;w.upd.push(()=>{for(let i=0,j=0;i<p.count;i++,j+=3){const ax=b[j]*.35+T*1.2,az=b[j+2]*.4+T*.9;
    A[j+1]=Math.sin(ax)*.12+Math.cos(az)*.12;const nx=-.042*Math.cos(ax),nz=.048*Math.sin(az),l=1/Math.sqrt(nx*nx+1+nz*nz);N[j]=nx*l;N[j+1]=l;N[j+2]=nz*l}p.needsUpdate=true;nm.needsUpdate=true})}
// island3(w): crea la isla del mapa (forma de curvas extruida, con césped arriba y tierra al lado), su contorno y la playa.
// La isla queda como w.ground (el suelo por donde pasea Tito).
function island3(w: Mundo){const pts=[[150,560],[100,330,180,170,420,170],[640,130,1000,130,1250,170],[1500,170,1590,330,1570,520],[1580,760,1400,880,1100,870],[840,895,520,885,330,850],[180,810,160,690,150,560]];
  const s=new THREE.Shape(),P=(x: number,y: number)=>MP(x,y);s.moveTo(...P(pts[0][0],pts[0][1]));for(let i=1;i<pts.length;i++){const q=pts[i];s.bezierCurveTo(...P(q[0],q[1]),...P(q[2],q[3]),...P(q[4],q[5]))}
  const g=new THREE.ExtrudeGeometry(s,{depth:2.2,bevelEnabled:true,bevelThickness:.45,bevelSize:.7,bevelSegments:3,curveSegments:40});g.rotateX(PI/2);
  const m=new THREE.Mesh(g,[M('#9BDB82'),M('#D9A86C')]);m.position.y=-.45;m.receiveShadow=true;m.castShadow=false;w.sc.add(m);w.ground=m;
  const ol=new THREE.Mesh(olGeo(g),OLm(.12));ol.position.copy(m.position);w.sc.add(ol);
  // la playa alrededor
  const g2=new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:true,bevelThickness:.2,bevelSize:1.6,bevelSegments:2,curveSegments:40});g2.rotateX(PI/2);const b=new THREE.Mesh(g2,M('#FFE9B8'));b.position.y=-.75;b.receiveShadow=true;w.sc.add(b)}
// SPOT3: un constructor por cada lugar del mapa (clave = id de MZ2). Cada uno recibe g (el grupo ya colocado en el mapa) y, las zonas
// por edad, open (true si la zona está abierta; si no, se dibuja en gris y dormida con zzz). Añaden las piezas con mk/spr/plane
// y, si se mueve algo, ponen g.userData.anim (se llama cada cuadro desde buildMap).
const SPOT3: Record<string, (g: THREE.Group, open: boolean) => void>={
  // plaza / asamblea: fuente con gotas, banderitas de colores (userData.wave) y el cartel ASAMBLEA
  plaza(g: THREE.Group){mk(Cyl(2.9,3,.18,40),'#F1E2C8',{p:[0,.09,0],to:g,ol:.05});mk(Cyl(2.2,2.2,.04,40),'#E8D4B0',{p:[0,.2,0],ol:0,to:g});
    mk(Cyl(1.25,1.35,.5,32),'#FFFFFF',{p:[0,.35,0],to:g,ol:.05});mk(Cyl(1.08,1.08,.1,32),'#7FD3F0',{p:[0,.58,0],ol:0,to:g});
    mk(Cyl(.2,.3,1.1,12),'#FFFFFF',{p:[0,.9,0],to:g,ol:.04});mk(Cyl(.55,.45,.18,20),'#FFFFFF',{p:[0,1.45,0],to:g,ol:.04});
    const drops: THREE.Mesh[]=[];for(let i=0;i<8;i++)drops.push(mk(Sph(.09,8,6),'#BFEAF7',{ol:.015,cs:false,to:g}));
    g.userData.anim=()=>{drops.forEach((d,i)=>{const a=i/8*PI*2,k=(T*.9+i*.37)%1;d.position.set(Math.cos(a)*(.4+k*.6),1.55+Math.sin(k*PI)*.7-k*.6,Math.sin(a)*(.4+k*.6))})};
    DIAC.forEach((c,i)=>{const a=PI*1.05+i/6*PI*.9,x=Math.cos(a)*2.55,z=Math.sin(a)*2.55;mk(Cyl(.05,.05,1.6,6),'#FFFFFF',{p:[x,.8,z],to:g,ol:.025});
      const f=mk(new THREE.PlaneGeometry(.55,.38),new THREE.MeshToonMaterial({color:c,gradientMap:gradiente(),side:THREE.DoubleSide}),{p:[x+.27,1.4,z],ol:0,to:g});f.userData.wave=i});
    spr(canvasTex(512,150,()=>{card(16,16,480,118,'#fff',8,30);DIAC.forEach((c,i)=>circ(100+i*52,44,13,c,4));text('ASAMBLEA',256,124,66,K,{f:LF})},'asamblea'),3.9,1.15,{p:[0,2.8,-.6],to:g})},
  // jardín (3 años): valla, cuatro casitas de colores, flores y la pastilla «3 años»
  jardin(g: THREE.Group){mk(Cyl(3.2,3.3,.2,36),'#B5E89E',{p:[0,.1,0],s:[1,1,.78],to:g,ol:.05});
    mk(mg(Array.from({length:16},(_,i)=>{const a=i/16*PI*2;return[Box(.14,.6,.14),[Math.cos(a)*3.05,.45,Math.sin(a)*2.35]]})),'#C98A4B',{to:g,ol:.025});
    [[-1.4,-.4,0],[.3,-.9,1],[1.6,.2,2],[-.4,.9,3]].forEach(([x,z,i])=>{const h=grp(g,[x,.2,z],.75);mk(Box(1.1,.8,.9),'#FFF3B0',{p:[0,.4,0],to:h,ol:.04});mk(Cone(.95,.75,4),FLC[i],{p:[0,1.18,0],r:[0,PI/4,0],to:h,ol:.04});mk(Box(.28,.45,.06),'#C98A4B',{p:[0,.25,.46],to:h,ol:.02})});
    for(let i=0;i<7;i++)flower3(g,-2.4+i*.8,1.75+(i%2)*.25,FLC[i%7],.7,.2);
    pillSpr('3 años','#FF8A7A','#fff',{p:[0,2.9,0],w:3.2,to:g})},
  // bosque (4 años): árboles de varias estaciones y la pastilla «4 años»; cerrado: gris y con zzz
  bosque(g: THREE.Group,open: boolean){mk(Cyl(3.1,3.2,.2,30),open?'#8CCB78':'#CFC8BF',{p:[0,.1,0],s:[1,1,.8],to:g,ol:.05});
    ([[-1.7,.4,.85,'otoño'],[0,-.6,1.05,'verano'],[1.7,.3,.9,'verano'],[-.7,1.4,.7,'otoño'],[1,1.5,.7,'primavera'],[-2.2,-.9,.7,null],[2.3,-.9,.7,null]] as [number, number, number, string|null][]).forEach(([x,z,s,k])=>tree3(g,x,z,s,open?(k||'verano'):'gris',!k));
    spr(pillTex('4 años',open?'#7CC86E':'#B8B0A6','#fff',72),4,1,{p:[0,.65,3.1],to:g});if(!open)zzz(g,[2,3.2,0])},
  // montaña (5 años): dos picos nevados, flores si está abierta, piedras y la pastilla «5 años»
  montana(g: THREE.Group,open: boolean){const gc=open?'#A7BCD6':'#CFC8BF';mk(Cone(2.4,4.2,9),gc,{p:[-1,2.1,-.4],to:g,ol:.07});mk(Cone(2,3.4,9),gc,{p:[1.5,1.7,.2],to:g,ol:.07});
    mk(Cone(.95,1.65,9),'#FFFFFF',{p:[-1,3.4,-.4],to:g,ol:.05});mk(Cone(.75,1.3,9),'#FFFFFF',{p:[1.5,2.8,.2],to:g,ol:.05});
    if(open)for(let i=0;i<5;i++)flower3(g,-2+i*1,2+(i%2)*.3,FLC[i+1],.75,0);rock3(g,2.8,1.4,.8);rock3(g,-3,1.2,.6);
    pillSpr('5 años',open?'#5B8DEF':'#B8B0A6','#fff',{p:[0,.6,2.9],w:3.2,to:g});if(!open)zzz(g,[2.3,4,0])},
  // canciones: carpa de rayas con bandera y notas musicales que suben
  canciones(g: THREE.Group){mk(Cyl(1.5,1.5,1.3,16),M('#fff',{map:stripesTex()}),{p:[0,.65,0],to:g,ol:.05});mk(Cone(1.85,1.6,16),'#FF6B5E',{p:[0,2.1,0],to:g,ol:.05});
    mk(Cyl(.03,.03,.7,6),K,{p:[0,3.1,0],ol:0,to:g});mk(new THREE.PlaneGeometry(.5,.3),new THREE.MeshToonMaterial({color:'#FFC93C',gradientMap:gradiente(),side:THREE.DoubleSide}),{p:[.25,3.3,0],ol:0,to:g});
    mk(Box(.8,.95,.1),'#7A4C30',{p:[0,.48,1.47],to:g,ol:.03});
    const notes=[0,1,2].map(i=>spr(canvasTex(128,128,()=>text('♪',64,100,110,DIAC[i*2],{st:8}),'nota'+i),.9,.9,{to:g}));
    g.userData.anim=()=>notes.forEach((n,i)=>{const k=(T*.5+i/3)%1;n.position.set(-1+i+Math.sin(T*2+i)*.3,2.6+k*1.8,.5);n.material.opacity=1-k})},
  // trazos: caballete con una pizarra de trazos
  trazos(g: THREE.Group){const e=grp(g,[0,0,0]);for(const x of[-.7,.7])mk(Box(.12,2.6,.12),'#C98A4B',{p:[x,1.25,0],r:[-.12,0,x>0?-.12:.12],to:e,ol:.03});
    mk(Box(2,1.4,.12),'#C98A4B',{p:[0,1.75,.12],r:[-.12,0,0],to:e,ol:.04});
    plane(canvasTex(256,180,()=>{ctx.fillStyle='#3E7A5A';ctx.fillRect(0,0,256,180);ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();for(let x=20;x<230;x+=6)ctx.lineTo(x,60+Math.sin(x/14)*22);ctx.stroke();ctx.beginPath();ctx.arc(70,130,24,0,PI*2);ctx.stroke();text('a',160,150,60,'#FFE08A',{f:LF})},'pizarra3'),1.8,1.25,{p:[0,1.75,.19],r:[-.12,0,0],to:e});
    mk(Box(1.9,.1,.25),'#C98A4B',{p:[0,1,.28],to:e,ol:.02})},
  // rutinas: casita con el dibujo de las manos y pompas de jabón que suben
  rutinas(g: THREE.Group){mk(Box(1.9,1.3,1.6),'#BFEAF7',{p:[0,.65,0],to:g,ol:.05});mk(prism(2.4,1.1,2),'#5BB8E6',{p:[0,1.3,0],to:g,ol:.05});
    plane(canvasTex(160,160,()=>{circ(80,80,70,'#fff',8);pic('manos',80,80,110)},'manos3'),1,1,{p:[0,.75,.82],to:g});
    const bub=[0,1,2,3].map(i=>{const m=new THREE.Mesh(Sph(.16+i*.04,12,10),new THREE.MeshToonMaterial({color:'#E8F8FF',gradientMap:gradiente(),transparent:true,opacity:.75}));g.add(m);return m});
    g.userData.anim=()=>bub.forEach((b,i)=>{const k=(T*.6+i/4)%1;b.position.set(1.1+Math.sin(T*3+i)*.2,1.2+k*2,.3);b.scale.setScalar(1-k*.3);b.visible=k<.95})},
  // álbum: libro abierto con una estrella que se balancea encima
  album(g: THREE.Group){const b=grp(g,[0,.2,0]);b.rotation.y=-.25;mk(Box(1.5,.25,2),'#9B8AD9',{p:[-.78,.12,0],r:[0,0,.12],to:b,ol:.04});mk(Box(1.5,.25,2),'#9B8AD9',{p:[.78,.12,0],r:[0,0,-.12],to:b,ol:.04});
    mk(Box(1.35,.12,1.8),'#FFF6E6',{p:[-.72,.32,0],r:[0,0,.12],to:b,ol:.02});mk(Box(1.35,.12,1.8),'#FFF6E6',{p:[.72,.32,0],r:[0,0,-.12],to:b,ol:.02});
    const st=mk(starGeo(.45,.15),'#FFC93C',{p:[0,1.3,0],to:b,ol:.03});g.userData.anim=()=>{st.rotation.y=Math.sin(T*1.4)*.55;st.position.y=1.3+Math.sin(T*2)*.12}},
  // rincón del inglés: bocadillo «Hello!» y tres cubos A, B y C
  ingles(g: THREE.Group){mk(Cyl(.08,.08,1.8,8),'#C98A4B',{p:[0,.9,0],to:g,ol:.03});
    spr(canvasTex(256,180,()=>{card(14,14,228,120,'#fff',8,50);ctx.beginPath();ctx.moveTo(90,128);ctx.lineTo(70,170);ctx.lineTo(125,128);ctx.closePath();fillStroke('#fff',8);ctx.fillStyle='#fff';ctx.fillRect(80,118,50,14);text('Hello!',128,95,58,'#5B8DEF',{f:LF})},'hello3'),1.9,1.33,{p:[0,2.35,0],to:g});
    ['A','B','C'].forEach((l,i)=>{const t=canvasTex(128,128,()=>{ctx.fillStyle=['#FF6B5E','#FFC93C','#7CC86E'][i];ctx.fillRect(0,0,128,128);text(l,64,100,96,'#fff',{f:LF,st:8})},'abc'+l);
      const m=new THREE.Mesh(Box(.7,.7,.7),new THREE.MeshToonMaterial({map:t,gradientMap:gradiente()}));m.position.set(-.85+i*.85,.35+(i===1?.0:0),.9);m.rotation.y=(i-1)*.3;m.castShadow=true;g.add(m);m.add(Object.assign(new THREE.Mesh(olGeo(m.geometry),OLm(.035)),{raycast:()=>{}}))})},
  // fiestas: tarta con velas (llamitas userData.fl), dos regalos y cuatro globos que se mecen
  fiestas(g: THREE.Group){const c=grp(g,[0,0,0]);mk(Cyl(1,1,.6,24),'#F58BB4',{p:[0,.3,0],to:c,ol:.04});mk(Cyl(.75,.75,.5,24),'#FFF6E6',{p:[0,.85,0],to:c,ol:.04});
    for(let i=0;i<4;i++){const a=i/4*PI*2;mk(Cyl(.05,.05,.35,6),DIAC[i],{p:[Math.cos(a)*.4,1.27,Math.sin(a)*.4],to:c,ol:.015});const fl=mk(Sph(.07,8,6),'#FFC93C',{p:[Math.cos(a)*.4,1.5,Math.sin(a)*.4],s:[1,1.6,1],ol:0,cs:false,to:c});fl.userData.fl=1}
    ([[1.6,.5,'#5B8DEF'],[-1.5,.7,'#7CC86E']] as [number, number, string][]).forEach(([x,z,cc])=>{const p=grp(g,[x,0,z]);mk(Box(.8,.7,.8),cc,{p:[0,.35,0],to:p,ol:.035});mk(Box(.84,.74,.18),'#FFC93C',{p:[0,.35,0],ol:.02,to:p});mk(Box(.18,.74,.84),'#FFC93C',{p:[0,.35,0],ol:.02,to:p})});
    const bl=([['#FF6B5E',-1.2,-.8],['#FFC93C',-.4,-1.2],['#9B8AD9',.6,-1.1],['#7FD3F0',1.3,-.6]] as [string, number, number][]).map(([cc,x,z])=>balloon3(g,x,z,cc,2.2));
    g.userData.anim=()=>bl.forEach((b,i)=>{b.rotation.z=Math.sin(T*1.5+i)*.06;b.rotation.x=Math.cos(T*1.2+i)*.05})},
  // tienda: mostrador con toldo de rayas, monedas y dibujos; si hay monedas (S.coins), una moneda gira encima
  tienda(g: THREE.Group){mk(Box(2.6,1,1.1),'#FFF3D6',{p:[0,.5,.3],to:g,ol:.05});for(const x of[-1.2,1.2])for(const z of[-.3,.8])mk(Box(.13,2.3,.13),'#C98A4B',{p:[x,1.15,z],to:g,ol:.025});
    const aw=grp(g,[0,2.35,.25]);aw.rotation.x=.25;for(let i=0;i<6;i++)mk(Box(.47,.12,1.6),i%2?'#fff':'#FF6B5E',{p:[-1.18+i*.47,0,0],to:aw,ol:.025});
    spr(pillTex('Tienda','#7CC86E','#fff',80),3.2,.8,{p:[0,3.3,0],to:g});
    for(let i=0;i<5;i++)mk(Cyl(.2,.2,.07,16),'#FFC93C',{p:[-.7+(i%3)*.3,1.05+Math.floor(i/3)*.08,.4+(i%2)*.15],to:g,ol:.02});
    spr(picTex('manzana'),.6,.6,{p:[.5,1.3,.4],to:g});spr(picTex('pelota'),.6,.6,{p:[.95,1.3,.4],to:g});
    if(S.coins!>0){const c=mk(Cyl(.4,.4,.1,24),'#FFC93C',{p:[1.4,2.6,.6],r:[PI/2,0,0],to:g,ol:.03});g.userData.anim=()=>{c.rotation.z=T*3;c.position.y=2.9+Math.sin(T*3)*.12}}},
};
// stripesTex(): textura de rayas rojas y blancas (para la carpa de canciones)
function stripesTex(){return canvasTex(256,64,()=>{for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#FFF6E6':'#FF6B5E';ctx.fillRect(i*32,0,32,64)}},'stripes')}
// zzz(g,p): dos «z» que suben desde el punto p del grupo g (lugar dormido). Encadena con el g.userData.anim que ya hubiera.
function zzz(g: THREE.Object3D,p: Trio){const zs=[0,1].map(i=>spr(canvasTex(96,96,()=>text('z',48,76,80,'#7A6252',{st:6,sc:'#fff'}),'z'),.6+i*.2,.6+i*.2,{to:g}));
  const a=g.userData.anim;g.userData.anim=()=>{a&&a();zs.forEach((z,i)=>{const k=(T*.4+i*.5)%1;z.position.set(p[0]+k*.6,p[1]+k*1.4,p[2]);z.material.opacity=Math.sin(k*PI)})}}
// greyAll(g,on): on=true pinta de gris todas las piezas toon del grupo g (guardando el material en userData.m0); on=false lo deshace.
function greyAll(g: THREE.Object3D,on: boolean){g.traverse((o: Nodo)=>{if(o.isMesh&&o.material&&o.material.isMeshToonMaterial){if(on){o.userData.m0=o.userData.m0||o.material;o.material=M('#CFC8BF')}else if(o.userData.m0)o.material=o.userData.m0}})}

// buildMap(st): construye el mundo 3D del mapa y lo devuelve (setWorld lo activa). st es la escena SCENES.map, de la que lee
// titoAt, hop, hov, unl (candado que se abre), wake (zona que despierta), lockShake, shake (casa) y petJump (mascota).
// Orden: cielo y mar, isla, noche/estación, animales y objetos tocables (*3), barquitos, caminos, decoración, los lugares (SPOT3,
// casa de Tito con mascota, candados), fechas especiales, Tito, la animación por cuadro (w.upd), wobInit y la cámara (camRig).
function buildMap(st: Escena){const sk=skyNow(),w=newWorld({fov:36,bg:sk.bg,kind:'map',shadow:26});
  sea3(w,sk.sea);island3(w);
  if(sk.night){w.sc.children.forEach((o: Nodo)=>{if(o.isLight)o.intensity!*=.82});const moon=mk(Sph(2,20,16),'#FFF3B0',{p:[-30,22,-40],ol:.2,cs:false,rs:false});w.sc.add(moon)}
  if(sk.night)fireflies(w,30,14);// de noche, luciérnagas sobre la isla
  seasonFx(w);
  // nubes y estrellas se mueven según el tiempo, no por cuadro: igual en una pantalla de 30, 60 o 120 Hz
  for(let i=0;i<6;i++){const c=cloud3(w.sc,-34+i*14,9+(i%3)*1.5,-18+(i%2)*6,1+(i%3)*.3);w.upd.push((dt: number)=>{c.position.x+=.3*dt;if(c.position.x>40)c.position.x=-40})}
  // gaviotas que vuelan en círculos sobre la orilla de la isla
  crab3(w,-4,3,10.2,1);whale3(w,-21.8,0,.85);dolph3(w,22.9,.5,.9);lighthouse3(w,11.9,9.9,1);if(summerNow()){sunb3(w,7.2,10.1,.9);sandc3(w,9.3,10.5,1.15)}palm3(w,-11.4,10,1);hab3(w,12,2.8,-6,.9);gull3(w,18,10,7,0,1);gull3(w,16,9,8,2.2,1);gull3(w,19,11,6.5,4,-1);
  // barquitos
  for(const [x,z,c] of([[-22,4,'#FF6B5E'],[24,-6,'#5B8DEF'],[16,14,'#FFC93C']] as [number, number, string][])){const b=grp(w.sc,[x,-1,z]);mk(Box(1.6,.4,.7),c,{p:[0,.2,0],to:b,ol:.04});mk(Cyl(.04,.04,1.6,6),'#C98A4B',{p:[0,1.1,0],ol:0,to:b});mk(prism(.9,1.2,.05),'#fff',{p:[.1,.5,0],r:[0,0,0],to:b,ol:.02});
    const hb=new THREE.Mesh(Box(2.6,2.4,1.6),fhit());hb.position.y=.8;b.add(hb);b.userData.boat=1;// al tocarlo, salta dando una vuelta y toca la bocina
    w.upd.push(()=>{const k=b.userData.wob,e=k==null?9:T-k,q=Math.min(e/.8,1);b.position.y=-1+Math.sin(T*1.3+x)*.15+(e<.8?Math.sin(q*PI)*.9:0);b.rotation.z=Math.sin(T*1.1+z)*.08;b.rotation.y=e<.8?q*PI*2:0})}
  // caminos desde la plaza
  const P=MP(...MAPPOS.plaza);
  for(const id in MAPPOS){if(id==='plaza')continue;const Q=MP(...MAPPOS[id]),c: PuntoSuelo=[(P[0]+Q[0])/2+(Q[1]-P[1])*.12,(P[1]+Q[1])/2-(Q[0]-P[0])*.08];ribbon(w.sc,bez(P,c,Q,30),.9,'#FFF3D6',.03,{dash:3})}
  // decoración: árboles, arbustos, flores, piedras en lugares libres
  ([[-14.5,-5,'verano'],[-12.5,7,'primavera'],[2.5,-7.2,'otoño'],[17.5,-2,'verano'],[14,8.5,'primavera'],[-4,7.8,null],[18,5.5,null],[-15.5,1.5,null],[8.5,-7.5,null],[11.5,-.5,'verano']] as [number, number, string|null][]).forEach(([x,z,k],i)=>tree3(w.sc,x,z,.75+(i%3)*.1,k||'verano',!k));
  [[-8,-1],[3.8,1.8],[7.8,2.5],[-3,4.5],[12,4],[-13,4],[5,-3.2]].forEach(([x,z],i)=>bush3(w.sc,x,z,.8,i%2?'#7CC86E':'#6FC25A'));
  for(let i=0;i<26;i++){const a=i*2.4,r=6+(i*37%11);const x=Math.cos(a)*r*1.35+1,z=Math.sin(a)*r*.62+1;if(Math.abs(z)<8.5&&Math.abs(x)<17)flower3(w.sc,x,z,FLC[i%7],.6)}
  rock3(w.sc,-16,-2.5,1);rock3(w.sc,19,1,.9);rock3(w.sc,6,9.5,.7);
  // los lugares
  w.spots={};
  for(const z of MZ2){const [x,zz]=MP(...MAPPOS[z.id]),g=grp(w.sc,[x,0,zz]);g.userData.id='mz:'+z.id;g.userData.spot=z.id;
    const open=ZAGE[z.id]?zoneOpen(z.id):spotOpen(z.id);
    if(z.id==='casaTito'){const h=makeHouse(houseLevel());g.add(h);h.position.set(-.6,0,-.6);h.scale.setScalar(1.12);g.userData.house=h;
      const p=makePipo(petStage());p.position.set(3.4,.1,1.6);p.scale.setScalar(.8);g.add(p);g.userData.pet=p;w.pick.push(p)}
    else SPOT3[z.id](g,open);
    const hit=new THREE.Mesh(Cyl(z.id==='casaTito'?3:2.4,2.4,3.4,12),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.5;g.add(hit);
    const lk=!spotOpen(z.id)&&!ZAGE[z.id];
    if(lk||(st.unl&&st.unl.id===z.id)){const ly=z.id==='ingles'?4.3:3.3;g.userData.lockY=ly;g.userData.lock=lock3(g,[0,ly,0],1.15);// el bocadillo de Hello! no queda tapado por el candado
    if(lk){g.userData.need=spr(flowerTex(FLC[0],spotNeed(z.id)),2.3,1.15,{p:[0,2.2,1.7],to:g});greyAll(g,true)}}
    if(st.wake&&st.wake.z===z.id)greyAll(g,true);
    w.spots[z.id]=g;w.pick.push(g)}
  if(xmasNow()&&w.spots.casaTito){const p=w.spots.casaTito.position;xtree3(w,p.x-4.2,p.z+.6,.9)}if(winterNow()&&!xmasNow()&&w.spots.casaTito){const p=w.spots.casaTito.position;snowman3(w,p.x-4.2,p.z+.8,.8)}/* en invierno, pasado Reyes, un muñeco de nieve ocupa el sitio del árbol de Navidad */if(hallowNow()&&w.spots.casaTito){const p=w.spots.casaTito.position;pump3(w,p.x-3.9,p.z+1,1.1)}
  // Tito
  const tito=makeTito();tito.scale.setScalar(.75);const at=w.spots[st.titoAt||'plaza']||w.spots.plaza,ap=at.position;
  tito.position.set(ap.x+(st.titoAt&&st.titoAt!=='plaza'?1.5:2.2),0,ap.z+(st.titoAt&&st.titoAt!=='plaza'?2.6:1.6));tito.rotation.y=-.35;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  const asam=w.spots.plaza,gl=ring3(asam,[0,.25,0],3.1);
  w.upd.push((dt: number)=>{const wk=walkTick(w,tito,dt);tito.userData.anim(dt,{walk:wk,hop:st.hop,hov:st.hovTito});
    gl.visible=!asamHoy();gl.material.opacity=.45+.35*Math.sin(T*4);gl.scale.setScalar(1+Math.sin(T*4)*.03);
    for(const id in w.spots){const g=w.spots[id];g.userData.anim&&g.userData.anim();
      // banderitas y llamitas: se buscan una sola vez, no recorriendo todo el lugar en cada cuadro
      const wf=g.userData.wf||(g.userData.wf=[]);if(!g.userData.wfOk){g.userData.wfOk=1;g.traverse(o=>{if(o.userData.wave!=null||o.userData.fl)wf.push(o)})}
      for(const o of wf){if(o.userData.wave!=null)o.rotation.y=Math.sin(T*3+o.userData.wave)*.4;if(o.userData.fl)o.scale.set(1+Math.sin(T*14+o.position.x*9)*.15,1.6,1)}
      const hs=st.hov===id&&!busy3(w)?1.06:1;g.scale.setScalar(lerp(g.scale.x,hs,.2));
      // candado: si este lugar se está abriendo (st.unl) sale volando y girando durante 1,3 s y el lugar recupera el color;
      // si no, flota y tiembla un momento cuando se toca cerrado (st.lockShake)
      const L=g.userData.lock;if(L){if(st.unl&&st.unl.id===id&&T>st.unl.t){const k=(T-st.unl.t)/1.3;if(k>1){g.remove(L);g.userData.lock=null;if(g.userData.need){g.remove(g.userData.need);g.userData.need=null}greyAll(g,false)}else{L.position.set(k*2,(g.userData.lockY||3.3)+k*k*5,0);L.rotation.z=k*3;L.scale.setScalar(1.15*(1+k*.4));if(k>.15)greyAll(g,false)}}
        else{L.position.y=(g.userData.lockY||3.3)+Math.sin(T*2+g.position.x)*.15;L.rotation.y=Math.sin(T*1.2)*.4;const sh=st.lockShake&&st.lockShake.id===id?Math.max(0,1-(T-st.lockShake.t)*2):0;L.rotation.z=Math.sin(T*40)*.3*sh}}}
    // zona que despierta (st.wake): en el momento st.wake.t recupera el color y tiembla 1,5 s
    if(st.wake){const g=w.spots![st.wake.z];if(T>st.wake.t&&!st.wake.done){st.wake.done=1;greyAll(g,false)}if(st.wake.done&&T<st.wake.t+1.5)g.position.x=MP(...MAPPOS[st.wake.z])[0]+Math.sin(T*40)*.15*(1-(T-st.wake.t)/1.5)}
    const h=w.spots!.casaTito;h.userData.house.userData.anim(st.shake);h.userData.pet.userData.anim(st.petJump)});
  wobInit(w);
  camRig(w,V3(1.2,25,20.5),V3(1.2,0,1.4),1.6);
  return w}
// montarMapa3D(): pone el mapa en 3D en lugar del 2D (SCENES.map) y la disposición de los lugares (los proyectados). La
// llama mundo3d/mundo3d.ts al montar la capa 3D. Desde la fase 4j es otra escena, no una envoltura: copia del mapa 2D
// (mapa2D, de escenas/zonas.ts, que no se toca) la lógica (prompt, hint...) y pone su enter, sync, draw, down y seguir,
// que llaman a los del 2D cuando hace falta la lógica de siempre. three:true hace que el bucle dibuje la capa 3D (R3frame)
// debajo de lo que pinte draw().
export function montarMapa3D(): void{
const mapa2D=SCENES.map;
 // lugar(id): el lugar id del mapa, donde lo dejó la última proyección (MZP); null si aún no se ha proyectado
 ponDisposicion({lugar:id=>MZP[id]||null});
 SCENES.map={...mapa2D,three:true,
  // enter(o): entra al mapa: limpia estados, llama al enter original, construye el mundo 3D y sincroniza las posiciones 2D
  enter(o: Libre){this.hov=null;this.lockShake=null;this.hop=null;mapa2D.enter!.call(this,o);setWorld(buildMap(this));this.sync()},
  // sync(): proyecta cada lugar 3D a la pantalla y lo apunta en MZP (la disposición: así mzOf y la lógica 2D de
  // escenas/zonas.ts aciertan); también la casa y Tito
  sync(){const w=W3;if(!w||w.kind!=='map')return;
    for(const z of MZ2){const g=w.spots![z.id];if(!g)continue;const [x,y,r]=projR(g,2.6,1.2);MZP[z.id]={x,y,r:Math.max(60,r)}}
    const h=w.spots!.casaTito,[hx,hy]=projO(h,0);ponCasaP(hx,hy+60);titoRect(w.tito!)},
  // draw(): se llama cada cuadro encima del 3D: decide qué hay bajo el ratón (hov, hovTito), su nombre, el logo, botones y bocadillo de Tito
  draw(){this.sync();const w=W3;
    let hv_=null;let hT=false;if(VIVO.mouseOn&&!VIVO.drag&&!(w&&busy3(w))){const u=pickAt(VIVO.MX,VIVO.MY);if(u&&u.spot){hv_=u.spot;VIVO.hovNow='mz'+u.spot}else if(u&&u.id==='tito'){VIVO.hovNow='tito';hT=true}else if(u&&u.id==='pipo')VIVO.hovNow='pipo'}
    this.hov=hv_;this.hovTito=hT;
    // nombre del lugar bajo el ratón; los de arriba del mapa quedaban escondidos detrás del cartel de Curiolandia
    if(hv_){const z=mzOf(hv_);ctx.font=`600 34px ${DF}`;const t=cap(z.name),tw=ctx.measureText(t).width;const cy=Math.max(z.y-z.r-70,118);card(z.x-tw/2-26,cy,tw+52,58,'rgba(255,255,255,.92)',5,29);text(t,z.x,cy+41,34,K,{w:600})}
    card(560,22,480,88,'#fff',6,44);drawLogoSmall(800,86,56);
    drawSeguir();drawHome();drawCoinHUD();
    if(VIVO.talking){const tp=titoPos(),bx=tp.x+tp.w*.85,by=tp.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
  // down(x,y): toque en el mapa. Botones 2D -> lógica original; objetos que vuelan; nada -> objeto tocable, mar o pasear;
  // Tito -> salta; mascota -> lógica 2D de la mascota; lugar cerrado -> tiembla el candado; lugar abierto -> Tito camina y luego se entra
  down(x: number,y: number){const w=W3;if(!w||busy3(w))return;
    if(atHome(x,y)||inCoinHUD(x,y)||dist(x,y,SEGUIR.x,SEGUIR.y)<SEGUIR.r+10)return call0(mapa2D.down!,this,x,y);
    const u=pickAt(x,y);if(flyTap(w,x,y))return;
    if(!u){if(wobTap(w,x,y)||seaTap(w))return;SFX.tap();if(skyNow().night)ffTap(x,y);else sparkles(x,y);walkGround(w);return}
    if(u.id==='tito'){this.hop=T;titoTapSfx();titoHearts(x,y);this.prompt!(false);return}
    if(u.id==='pipo'){this.petJump=T;mapa2D.tocarPipo!.call(this);return}
    const z=mzOf(u.spot);if(!z)return;const open=ZAGE[z.id]?zoneOpen(z.id):spotOpen(z.id);
    if(!open){this.lockShake={id:z.id,t:T};return call0(mapa2D.down!,this,z.x,z.y)}
    SFX.whoosh&&SFX.whoosh();const g=w.spots![z.id],to=g.position.clone().add(V3(z.id==='casaTito'?1.2:1.4,0,z.id==='casaTito'?2.8:2.4));
    this.titoAt=z.id;walkTo(w,w.tito!,to,()=>{if(sceneName==='map'){const q=mzOf(z.id);call0(mapa2D.down!,this,q.x,q.y)}},{zoom:V3(0,9,8)})},/* al llegar, el lugar donde está entonces (la cámara se ha movido) */
  // seguir(): el botón verde: Tito camina hacia la plaza o hacia la zona del próximo tema y luego se sigue (goSeguir)
  seguir(){const w=W3;if(sceneName!=='map'||!w||w.kind!=='map')return goSeguir();
   let id='plaza';if(asamHoy()){const t=nextTema();if(!t)return goSeguir();id=MAINZ.includes(t.zone)?t.zone:t.zone==='fiestas'?'fiestas':t.zone==='ingles'?'ingles':t.id==='X-CAN'?'canciones':t.id==='X-RUT'?'rutinas':t.id==='X-TRZ'?'trazos':'plaza'}
   const g=w.spots![id];this.titoAt=id;walkTo(w,w.tito!,g.position.clone().add(V3(1.4,0,2.4)),()=>{if(sceneName==='map')goSeguir()},{zoom:V3(0,9,8)})}
 } satisfies Escena;
}
