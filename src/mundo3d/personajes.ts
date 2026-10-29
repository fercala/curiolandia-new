/*
 * mundo3d/personajes.ts: los personajes de la capa 3D (desde la fase 4h; antes, en mundo3d/mundo3d.ts): Tito
 * (makeTito: el caracol, el erizo, la tortuga o el conejo, con su caparazón shellGeo guardado en SHELL, la bufanda y el
 * color de la tienda), Pipo, la mascota que crece (makePipo), y la casa de Tito, que crece con las casitas terminadas
 * (makeHouse, con el escudo shellTex). Además, lo que pasa al tocar a Tito: titoTapSfx (su sonido), titoHearts, ffTap,
 * ringParts y noteParts (partículas en la pantalla 2D).
 * Usa THREE solo dentro de las funciones (también la curva Spiral, que se define dentro de shellGeo).
 * Exporta: makeTito, makePipo, makeHouse, shellTex, titoTapSfx, titoHearts, ffTap, ringParts y noteParts. Importa: del
 * núcleo S, T, PI, IMG, SFX, VIVO, FLC, tone, noise, parts, pick, rnd, temasDone y titoKind; K (src/dibujos/);
 * shellIcon (escenas/zonas.ts); SHELLC y SCARFC (escenas/tienda.ts); ahora() (aplicacion/puertos.ts); piezas de
 * mundo3d/materiales.ts y flower3 (mundo3d/decorado.ts).
 */
import type * as Tres from 'three';
import type { Libre } from '../nucleo/tipos.ts';
import type { Nodo, PiezaUnida, Trio } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { FLC, IMG, PI, S, SCARFC, SFX, SHELLC, T, VIVO, noise, parts, pick, rnd, temasDone, titoKind, tone } from '../nucleo/indice.ts';
import { shellIcon } from '../escenas/zonas.ts';
// ahora() y azar(): la fecha y la hora y el azar (puertos de aplicacion/puertos.ts, desde la fase 3g; antes new
// Date() y Math.random()).
import { ahora } from '../aplicacion/puertos.ts';
import { Box, Cone, Cyl, M, Sph, canvasTex, gcache, gradiente, grp, keep, mg, mk, picTex, pillTex, plane, prism, rbox, spr, starGeo } from './materiales.ts';
import { flower3 } from './decorado.ts';

/* ---------- Tito, el caracol, en 3D ---------- */
// shellGeo(): geometría del caparazón del caracol. Hace un tubo de radio 1 a lo largo de la espiral y luego encoge cada anillo según su
// distancia al centro (k) y lo estira en z (zs), así la concha se estrecha hacia dentro. Devuelve {g: geometría, sp: espiral, k, zs}
// (sp, k y zs se usan para colocar la raya y las flores). Se calcula una sola vez y se guarda en SHELL.
function shellGeo(){
  // Spiral: la curva de Three.js con forma de espiral logarítmica (radio R*e^(-b*ángulo)) en el plano XY; turns = vueltas, a0 = ángulo de
  // inicio. Es el eje del caparazón del caracol. Desde la fase 4h se define aquí dentro (shellGeo solo se llama una
  // vez, ver SHELL) y no al cargar el módulo, porque THREE.Curve solo existe cuando se ha cargado three.min.js.
  class Spiral extends THREE.Curve<Tres.Vector3>{declare R: number;declare b: number;declare T: number;declare a0: number;
    constructor(R: number,b: number,turns: number,a0: number){super();this.R=R;this.b=b;this.T=turns*PI*2;this.a0=a0}
    // getPoint(t,o): el punto de la curva para t de 0 a 1 (lo pide TubeGeometry); lo escribe en o y lo devuelve
    getPoint(t: number,o=new THREE.Vector3()){const th=t*this.T,r=this.R*Math.exp(-this.b*th),a=this.a0+th;return o.set(Math.cos(a)*r,Math.sin(a)*r,0)}}
  const R=.74,b=.12,k=.36,zs=1.85,sp=new Spiral(R,b,2.1,-1.0),seg=150,rad=14,g=new THREE.TubeGeometry(sp,seg,1,rad,false),p=g.attributes.position;
  // vértice v = anillo i, punto j del anillo: se acerca al centro del anillo (P) multiplicando su distancia por tr
  for(let i=0;i<=seg;i++){const P=sp.getPointAt(i/seg),tr=k*Math.hypot(P.x,P.y);for(let j=0;j<=rad;j++){const v=i*(rad+1)+j;p.setXYZ(v,P.x+(p.getX(v)-P.x)*tr,P.y+(p.getY(v)-P.y)*tr,(p.getZ(v)-P.z)*tr*zs)}}
  g.computeVertexNormals();return {g,sp,k,zs}}
// SHELL: caché del caparazón (disposeWorld no la borra al cambiar de mundo)
let SHELL: ReturnType<typeof shellGeo>|null=null;
// personajes de Tito que ya tienen modelo (S.tito.kind; los demás vuelven al caracol)
const TITO_KINDS: readonly (string|undefined)[]=['caracol','erizo','tortuga','conejo'];
// sonido al tocar a Tito, según el animal: el caracol con su boing de siempre, el conejo un pip-pip agudo, la tortuga un bonk grave y el erizo un resoplido
// ffTap(x,y): lucecitas de luciérnaga en el punto tocado de la pantalla (de noche). (El comentario de arriba es de titoTapSfx.)
export function ffTap(x: number,y: number){/* de noche, donde se toca salen lucecitas de luciérnaga */for(let i=0;i<6;i++)parts.push({x:x+rnd(-18,18),y:y+rnd(-12,12),vx:rnd(-35,35),vy:rnd(-45,-15),life:rnd(.8,1.2),t:0,c:pick(['#E8FF8A','#C8F560','#FFF6A8']),r:rnd(3,5),rot:0,k:'d',g:-10})}
// ringParts(x,y,n,d,c): n ondas (partículas 'o'), una cada 180 ms, empezando a los d ms; c = color (blanco si no se da)
export function ringParts(x: number,y: number,n: number,d: number,c: string){for(let i=0;i<n;i++)setTimeout(()=>parts.push({x:x+rnd(-30,30),y:y+rnd(-8,8),vx:0,vy:0,life:.8,t:0,c:c||'#FFFFFF',r:rnd(10,14),rot:0,k:'o',g:0}),(d||0)+i*180)}// ondas en el agua o en el suelo
// noteParts(x,y,n,d): n notas musicales de colores que suben desde x,y de la pantalla; d = retraso en ms
export function noteParts(x: number,y: number,n: number,d: number){setTimeout(()=>{for(let i=0;i<n;i++)parts.push({x:x+rnd(-25,25),y:y-40+rnd(-10,10),vx:rnd(-35,35),vy:rnd(-95,-60),life:rnd(1,1.3),t:0,c:pick(['#7C5CFF','#FF5A7E','#2FA8E0','#3FAE5A','#F2A91C']),r:rnd(15,19),rot:rnd(-2,2),k:'n',g:-10})},d||0)}// notas musicales que suben
// titoHearts(x,y): 3 corazoncitos que suben encima de Tito
export function titoHearts(x: number,y: number){/* al tocar a Tito suben unos corazoncitos */for(let i=0;i<3;i++)parts.push({x:x+(i-1)*24,y:y-40-Math.abs(i-1)*8,vx:rnd(-15,15),vy:rnd(-95,-65),life:1.1,t:0,c:pick(['#FF5A7E','#FF7A9A','#F28AB8']),r:rnd(11,14),rot:0,k:'h',g:-15})}
// titoTapSfx(): el sonido al tocar a Tito según S.tito.kind (ver el comentario de antes de ffTap); try/catch por si el audio falla
export function titoTapSfx(){const k=S.tito&&S.tito.kind;try{if(k==='conejo'){tone(1180,.07,'triangle',.22,1.3);tone(1400,.07,'triangle',.2,1.3,.1)}else if(k==='tortuga'){tone(190,.22,'sine',.45,.6);tone(130,.18,'triangle',.18,0,.06)}else if(k==='erizo'){noise(.06,.18,2600);noise(.06,.16,3200,.09);tone(700,.06,'sine',.08,1.3,.16)}else SFX.boing()}catch(e){}}
// HOP[animal] = [altura del salto, duración en s] cuando se toca a Tito (lo usa root.userData.anim)
const HOP: Record<string, [number, number]>={caracol:[.9,.6],erizo:[.65,.45],tortuga:[.4,.5],conejo:[1.4,.7]};
// makeTito(into): construye el modelo 3D de Tito según S.tito: kind = animal (TITO_KINDS), shell = color del caparazón/púas/mochila,
// scarf = bufanda, hat/bow/glasses = ropa de la tienda; pone una flor por cada casita terminada (temasDone(), como mucho 15).
// into: grupo donde construirlo (si no, uno nuevo). Devuelve root con userData.id='tito', userData.kind, userData.parts (piezas)
// y userData.anim(dt,o) para animarlo en cada cuadro. No cambia S.
export function makeTito(into?: Tres.Group){const root=into||new THREE.Group(),b=grp(root);root.userData.id='tito';const t=S.tito||{},GR='#9BD86A';
  const kind: string=TITO_KINDS.includes(t.kind)?t.kind!:'caracol';root.userData.kind=kind;
  const sc=(SHELLC[t.shell!]||SHELLC.naranja),scarf=SCARFC[t.scarf!]||SCARFC.roja;
  let head,mouth,mo,sh,nose=null;const eyes: Tres.Group[]=[],wig: [Tres.Object3D, 'x'|'y'|'z', number, number, number, number][]=[],stalks: Tres.Group[]=[],ears: Tres.Group[]=[];
  // cada animal construye su cuerpo y rellena head, eyes, mouth (boca cerrada), mo (boca abierta al hablar) y sh (grupo de las flores);
  // wig = piezas que se menean solas: [malla, eje, ángulo base, amplitud, velocidad, fase]
  if(kind==='caracol'){
  mk(Sph(1,26,16),GR,{p:[.15,.46,0],s:[1.4,.48,.56],to:b,ol:.06});mk(Cone(.36,.8,14),GR,{p:[-1.3,.3,0],r:[0,0,PI/2+.2],s:[1,1,.8],to:b,ol:.05});
  mk(Cyl(.42,.55,1.25,18),GR,{p:[.95,.95,0],r:[0,0,-.22],to:b,ol:.05});
  head=grp(b,[1.2,1.72,0]);mk(Sph(.6,24,18),GR,{to:head,ol:.05});
  for(const z of[-.26,.26]){const st=grp(head,[.05,.4,z]);st.rotation.set(z*.5,0,-.12);stalks.push(st);mk(Cyl(.06,.08,.75,8),GR,{p:[0,.37,0],to:st,ol:.03});
    const e=grp(st,[0,.82,0]);mk(Sph(.22,16,12),'#FFFFFF',{to:e,ol:.03});mk(Sph(.11,12,10),K,{p:[.12,.02,.11],ol:0,to:e});mk(Sph(.035,8,6),'#FFFFFF',{p:[.19,.07,.16],ol:0,to:e});eyes.push(e)}
  mouth=mk(new THREE.TorusGeometry(.16,.04,8,16,PI),'#7A2E3A',{p:[.48,-.15,.28],r:[0,.9,PI],ol:0,to:head});
  mo=mk(Sph(.12,12,10),'#7A2E3A',{p:[.5,-.2,.26],s:[1,.2,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.1,10,8),'#FF9EAA',{p:[.38,-.05,z*.42],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[.92,1.02,0]);sg.rotation.z=-.22;mk(new THREE.TorusGeometry(.47,.15,10,24),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}mk(Box(.22,.5,.12),scarf,{p:[.62,.62,.38],r:[0,0,.3],to:b,ol:.03});
  if(!SHELL){SHELL=shellGeo();keep(SHELL.g)}sh=grp(b,[-.32,1.55,0]);mk(SHELL.g,sc[0],{to:sh,ol:.045});mk(Sph(.18,12,10),sc[0],{s:[1,1,1.4],to:sh,ol:.03});
  // la raya del caparazón
  {const sp=SHELL.sp,pts=[];for(let i=0;i<=120;i++){const P=sp.getPointAt(i/120),tr=SHELL.k*Math.hypot(P.x,P.y);pts.push(new THREE.Vector3(P.x,P.y,tr*SHELL.zs*.97))}
   const cv3=new THREE.CatmullRomCurve3(pts);for(const sg of[1,-1]){const m=mk(new THREE.TubeGeometry(cv3,120,.035,6,false),sc[1],{ol:0,cs:false,to:sh});m.scale.z=sg}}
  // flores en el caparazón (una por casita terminada)
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const P=SHELL.sp.getPointAt(.02+j*.034),tr=SHELL.k*Math.hypot(P.x,P.y),f=grp(sh,[P.x*1.04,P.y*1.04,tr*SHELL.zs*.9],.55);
    for(let i=0;i<5;i++){const a=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a)*.14,Math.sin(a)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }else if(kind==='erizo'){
  // ERIZO: cuerpo crema, abrigo de púas (una sola geometría) del color elegido en la tienda (marrón con el naranja de siempre)
  const CR='#F2D6B0',PU=t.shell&&t.shell!=='naranja'?sc[0]:'#9A6A45';
  mk(Sph(1,26,16),CR,{p:[.1,.72,0],s:[1.25,.72,.82],to:b,ol:.06});
  mk(Sph(1,24,16),PU,{p:[-.12,.98,0],s:[1.18,.82,.86],to:b,ol:.05});
  const sp=gcache('puas',()=>{const parts: PiezaUnida[]=[],cn=Cone(.12,.46,6),q=new THREE.Quaternion(),e=new THREE.Euler(),U=new THREE.Vector3(0,1,0);
    for(let i=0;i<70;i++){const y=1-(i+.5)/70*1.25,r=Math.sqrt(Math.max(0,1-y*y)),a=i*2.39996,d=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);if(d.x>.55||y<-.2)continue;
      const P=[d.x*1.15,d.y*.8,d.z*.84],n=new THREE.Vector3(d.x/1.15,d.y/.8,d.z/.84).normalize();q.setFromUnitVectors(U,n);e.setFromQuaternion(q);parts.push([cn,[P[0]+n.x*.16,P[1]+n.y*.16,P[2]+n.z*.16],1,[e.x,e.y,e.z]])}return mg(parts)});
  mk(sp,PU,{p:[-.12,.98,0],to:b,ol:.025});
  for(const [x,z] of[[.6,.42],[.6,-.42],[-.55,.45],[-.55,-.45]])mk(Sph(.17,10,8),'#8A5A3C',{p:[x,.14,z],s:[1.3,.7,1],to:b,ol:.025});
  head=grp(b,[1.08,1.02,0]);mk(Sph(.56,22,16),CR,{s:[1.08,1,1],to:head,ol:.05});
  mk(Cone(.27,.62,16),CR,{p:[.62,-.1,0],r:[0,0,-PI/2],to:head,ol:.035});nose=mk(Sph(.12,12,10),K,{p:[.94,-.1,0],ol:0,to:head});
  for(const z of[-.34,.34])mk(Sph(.15,10,8),'#E8B98A',{p:[-.12,.44,z],s:[1,1,.55],to:head,ol:.025});
  for(const z of[-.24,.24]){const e=grp(head,[.36,.16,z]);mk(Sph(.16,14,10),'#FFFFFF',{to:e,ol:.03});mk(Sph(.085,10,8),K,{p:[.1,.01,z*.2],ol:0,to:e});mk(Sph(.03,8,6),'#FFFFFF',{p:[.16,.05,z*.25],ol:0,to:e});eyes.push(e)}
  mouth=mk(new THREE.TorusGeometry(.12,.035,8,14,PI),'#7A2E3A',{p:[.62,-.3,0],r:[0,PI/2,PI],ol:0,to:head});
  mo=mk(Sph(.09,10,8),'#7A2E3A',{p:[.64,-.32,0],s:[.5,.6,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.1,10,8),'#FF9EAA',{p:[.46,-.14,z*.36],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[.72,.86,0]);sg.rotation.z=-.85;mk(new THREE.TorusGeometry(.44,.14,10,24),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}
  sh=grp(b,[-.12,.98,0]);
  // flores entre las púas (una por casita terminada)
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const f_=.15+(j%5)*.36,y=.3+Math.floor(j/5)*.24,r=Math.sqrt(1-y*y),d=new THREE.Vector3(-Math.sin(f_)*r,y,Math.cos(f_)*r);
    const f=grp(sh,[d.x*1.28,d.y*.92,d.z*.95],.5);f.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);
    for(let i=0;i<5;i++){const a2=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a2)*.14,Math.sin(a2)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }else if(kind==='tortuga'){
  // TORTUGA: caparazón con el color de la tienda (el naranja de siempre) y dibujo de placas del color oscuro
  const SK='#8FD07A',U=new THREE.Vector3(0,1,0);
  for(const [x,z] of[[.68,.5],[.68,-.5],[-.62,.5],[-.62,-.5]])mk(Cyl(.2,.24,.5,10),SK,{p:[x,.25,z],to:b,ol:.03});
  wig.push([mk(Cone(.16,.42,8),SK,{p:[-1.3,.42,0],r:[0,0,PI/2+.3],to:b,ol:.025}),'y',0,.35,5,0]);
  mk(Cyl(.2,.26,.7,12),SK,{p:[1.15,.72,0],r:[0,0,-.95],to:b,ol:.035});
  mk(Sph(1,22,12),'#F3E2A9',{p:[0,.44,0],s:[1.22,.2,.92],to:b,ol:.04});
  mk(new THREE.SphereGeometry(1,28,14,0,PI*2,0,PI/2),sc[0],{p:[0,.46,0],s:[1.25,.95,.95],to:b,ol:.06});
  mk(new THREE.TorusGeometry(1,.1,8,36),sc[1],{p:[0,.47,0],r:[PI/2,0,0],s:[1.25,.95,1],to:b,ol:.03});
  sh=grp(b,[0,.46,0]);
  for(const [x,y,z] of[[0,1,0],[.6,.72,.35],[.6,.72,-.35],[-.6,.72,.35],[-.6,.72,-.35],[0,.62,.78],[0,.62,-.78]]){const d=new THREE.Vector3(x,y,z).normalize(),m=mk(Sph(.3,14,8),sc[1],{p:[d.x*1.25,d.y*.95,d.z*.95],s:[1,.22,1],ol:0,cs:false,to:sh});m.quaternion.setFromUnitVectors(U,d)}
  head=grp(b,[1.48,1.05,0]);mk(Sph(.46,20,14),SK,{s:[1.15,1,1],to:head,ol:.05});
  for(const z of[-.22,.22]){const e=grp(head,[.28,.16,z]);mk(Sph(.15,14,10),'#FFFFFF',{to:e,ol:.03});mk(Sph(.08,10,8),K,{p:[.09,.01,z*.2],ol:0,to:e});mk(Sph(.03,8,6),'#FFFFFF',{p:[.15,.05,z*.25],ol:0,to:e});eyes.push(e)}
  mouth=mk(new THREE.TorusGeometry(.12,.035,8,14,PI),'#7A2E3A',{p:[.5,-.14,0],r:[0,PI/2,PI],ol:0,to:head});
  mo=mk(Sph(.09,10,8),'#7A2E3A',{p:[.52,-.16,0],s:[.5,.6,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.09,10,8),'#FF9EAA',{p:[.38,-.08,z*.34],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[1.18,.78,0]);sg.rotation.z=-.95;mk(new THREE.TorusGeometry(.32,.11,10,22),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const f_=.15+(j%5)*.36,y=.45+Math.floor(j/5)*.2,r=Math.sqrt(1-y*y),d=new THREE.Vector3(-Math.sin(f_)*r,y,Math.cos(f_)*r);
    const f=grp(sh,[d.x*1.29,d.y*.99,d.z*.99],.5);f.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);
    for(let i=0;i<5;i++){const a2=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a2)*.14,Math.sin(a2)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }else{
  // CONEJO: pelo claro, orejas largas y la mochila de las preguntas con el color de la tienda
  const FU='#EDE3D6',IN='#FFB3C1';
  mk(Sph(1,24,16),FU,{p:[0,.88,0],s:[.98,.86,.8],to:b,ol:.06});mk(Sph(.6,16,12),'#FFFFFF',{p:[.5,.72,0],s:[.6,1,.95],ol:0,to:b});
  for(const z of[-.38,.38])mk(Sph(.25,12,10),FU,{p:[.38,.12,z],s:[1.8,.6,1],to:b,ol:.03});
  mk(Sph(.28,12,10),'#FFFFFF',{p:[-.95,.8,0],to:b,ol:.03});
  const mb=grp(b,[-.78,1.05,0]);mb.rotation.y=PI/2;mk(rbox(.95,1,.5,.12),sc[0],{to:mb,ol:.04});mk(rbox(.95,.4,.12,.05),sc[1],{p:[0,.32,.27],to:mb,ol:.03});
  head=grp(b,[.78,1.78,0]);mk(Sph(.55,22,16),FU,{s:[1.05,.95,.95],to:head,ol:.05});
  for(const z of[-.13,.13])mk(Sph(.2,12,10),'#FFFFFF',{p:[.42,-.14,z],ol:0,to:head});mk(Sph(.08,10,8),'#FF8AA0',{p:[.57,-.02,0],ol:0,to:head});
  for(const z of[-.2,.2]){const ear=grp(head,[-.05,.42,z]);ear.rotation.x=z*1.1;ears.push(ear);wig.push([ear,'x',z*1.1,.07,2.4,z*6]);mk(Sph(.18,12,10),FU,{p:[0,.45,0],s:[1,3,.55],to:ear,ol:.03});mk(Sph(.11,10,8),IN,{p:[.08,.45,0],s:[.6,2.5,.4],ol:0,to:ear})}
  for(const z of[-.22,.22]){const e=grp(head,[.32,.14,z]);mk(Sph(.15,14,10),'#FFFFFF',{to:e,ol:.03});mk(Sph(.08,10,8),K,{p:[.09,.01,z*.2],ol:0,to:e});mk(Sph(.03,8,6),'#FFFFFF',{p:[.15,.05,z*.25],ol:0,to:e});eyes.push(e)}
  // boca pegada al hocico (antes quedaba colgando por debajo de la barbilla)
  mouth=mk(new THREE.TorusGeometry(.08,.026,8,14,PI),'#7A2E3A',{p:[.6,-.25,0],r:[0,PI/2,PI],ol:0,to:head});
  mo=mk(Sph(.065,10,8),'#7A2E3A',{p:[.61,-.27,0],s:[.5,.6,1],ol:0,to:head});
  for(const z of[-1,1])mk(Sph(.1,10,8),'#FF9EAA',{p:[.38,-.1,z*.38],s:[1,.6,.4],ol:0,to:head});
  {const sg=grp(b,[.7,1.32,0]);sg.rotation.z=-.4;mk(new THREE.TorusGeometry(.4,.13,10,24),scarf,{r:[PI/2,0,0],to:sg,ol:.03})}
  sh=grp(b,[0,.88,0]);
  const n=Math.min(15,temasDone());for(let j=0;j<n;j++){const f_=.35+(j%5)*.3,y=.05+Math.floor(j/5)*.28,r=Math.sqrt(1-y*y),d=new THREE.Vector3(-Math.sin(f_)*r,y,Math.cos(f_)*r);
    const f=grp(sh,[d.x*1.0,d.y*.88,d.z*.83],.45);f.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);
    for(let i=0;i<5;i++){const a2=i/5*PI*2;mk(Sph(.12,8,6),FLC[j%FLC.length],{p:[Math.cos(a2)*.14,Math.sin(a2)*.14,0],s:[1,1,.5],ol:.025,to:f})}mk(Sph(.09,8,6),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:.02,to:f})}
  }
  // ropa: sombrero en la cabeza y moño, en el sitio de cada personaje
  const HP=({caracol:[.05,.95,0],erizo:[-.05,.85,0],tortuga:[-.05,.72,0],conejo:[.07,.74,0]} as Record<string, Trio>)[kind],BP=({caracol:[-.3,2.55,.3],erizo:[-.25,1.95,.3],tortuga:[-.3,1.55,.3],conejo:[.35,2.4,.4]} as Record<string, Trio>)[kind];
  if(t.hat&&IMG[t.hat])spr(picTex(t.hat),1.35,1.35,{p:HP,to:head});
  if(t.bow)spr(picTex('monio'),.8,.8,{p:BP,to:b});
  if(t.glasses)for(const e of eyes){const gm=new THREE.Mesh(new THREE.TorusGeometry(.25,.04,8,20),M(K));gm.position.set(.16,0,.1);gm.rotation.y=PI/2.4;e.add(gm);const ln=new THREE.Mesh(new THREE.CircleGeometry(.24,20),new THREE.MeshBasicMaterial({color:0x28284a,transparent:true,opacity:.38}));ln.position.copy(gm.position);ln.rotation.copy(gm.rotation);e.add(ln)}
  // caja invisible para tocarlo
  const hit=new THREE.Mesh(Box(4,3.6,1.6),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(.2,1.5,0);root.add(hit);
  root.userData.parts={b,head,eyes,mouth,mo,sh};
  const hx0=head.position.x;
  // con el ratón encima Tito crece un poco, como las casitas y los lugares (hs = escala actual, suave)
  let hs=1,la=0;
  // anim(dt,o): se llama en cada cuadro desde la escena. dt = segundos desde el cuadro anterior. o = opciones: ph (desfase de tiempo),
  // walk (0..1, cuánto camina), hov (ratón encima), look (inclinar la cabeza), hop (instante T del toque), y0 (altura del suelo),
  // talk:false (no mover la boca aunque hable). Respira, parpadea, camina a su manera, mira alrededor, habla y reacciona al toque.
  root.userData.anim=(dt: number,o: Libre={})=>{const tt=T+(o.ph||0),wk=o.walk||0;
    hs+=((o.hov?1.08:1)-hs)*Math.min(1,(dt||0)*10);const br=Math.sin(tt*2.2)*.04;
    // cada animal camina a su manera: el caracol se estira y encoge, el conejo da saltitos, la tortuga se balancea despacio y el erizo trota
    if(kind==='conejo'){const ph=tt*6,u=Math.abs(Math.sin(ph)),sq=wk*Math.max(0,.35-u)*.5;b.position.y=u*.5*wk+br;b.rotation.z=-Math.cos(ph)*Math.sign(Math.sin(ph))*.12*wk;b.scale.set(hs*(1+sq),hs*(1-sq),hs)}
    else if(kind==='tortuga'){b.position.y=Math.abs(Math.sin(tt*5))*.06*wk+br;b.rotation.x=Math.sin(tt*5)*.09*wk;b.scale.setScalar(hs)}
    else if(kind==='erizo'){b.position.y=Math.abs(Math.sin(tt*12))*.12*wk+br;b.rotation.x=Math.sin(tt*12)*.05*wk;b.scale.set(hs,hs*(1-Math.abs(Math.sin(tt*12))*.03*wk),hs)}
    else{b.position.y=Math.abs(Math.sin(tt*9))*.18*wk+br;b.scale.set(hs*(1+Math.sin(tt*9)*.05*wk),hs*(1-Math.sin(tt*9)*.05*wk),hs)}
    // parpadeo: cada 3,9 s cierra los ojos 0,14 s (escala y al 12 %)
    const bl=((tt+.5)%3.9)<.14?.12:1;for(const e of eyes)e.scale.y=bl;
    head.rotation.z=Math.sin(tt*1.3)*.06+(o.look||0);
    // si está quieto y callado, cada tanto mira a un lado y al otro (como buscando las preguntas); al caminar o hablar mira al frente
    {const c=(tt+(o.ph||0)*3)%9;let lt=!wk&&!VIVO.talking&&c<2.4?Math.sin(c/2.4*PI*2)*.45:0;const lk=root.userData.lk;
      if(lk&&!wk&&T-lk.t<2.2){const v=root.worldToLocal(lk.p.clone());lt=Math.max(-1.1,Math.min(1.1,Math.atan2(-v.z,v.x)))}// y si se toca algo del paisaje, gira la cabeza para mirarlo
      la+=(lt-la)*Math.min(1,(dt||0)*5);head.rotation.y=la}
    // el erizo olisquea: la nariz da unos saltitos rápidos cada pocos segundos
    if(nose){const c=(tt+1.7)%4.3;nose.scale.setScalar(c<.6?1+Math.abs(Math.sin(c*PI*5))*.3:1)}
    // orejas del conejo (se mueven solas y de vez en cuando dan un respingo) y cola de la tortuga
    for(const [m,ax,b0,amp,sp,ph] of wig){const tw=((tt+ph*.3)%5)<.35?Math.sin(((tt+ph*.3)%5)/.35*PI)*2.5:0;m.rotation[ax]=b0+Math.sin(tt*sp+ph)*amp+tw*amp*Math.sign(b0||1)}const tk=VIVO.talking&&o.talk!==false&&(T*7|0)%2;mo.visible=!!tk;mouth.visible=!tk;
    // al terminar el salto vuelve justo al suelo (antes se quedaba flotando a la altura del último cuadro del salto)
    // al tocarlo salta a su manera: el conejo alto, la tortuga apenas (pesa con su caparazón), el erizo un brinco corto
    if(o.hop!=null){const k=T-o.hop,[hh,hd]=HOP[kind]||HOP.caracol;root.position.y=(o.y0||0)+(k>=0&&k<hd?Math.sin(k/hd*PI)*hh:0)}
    // al tocarlo, el erizo da una voltereta en el aire (gira alrededor de su centro, no de las patas)
    if(kind==='erizo'){const k=o.hop!=null?T-o.hop:9,hd=HOP.erizo[1],a2=k>=0&&k<hd?-(k/hd)*PI*2:0,cy=.9;b.rotation.z=a2;b.position.x=cy*Math.sin(-a2)*-1;b.position.y+=cy-cy*Math.cos(a2)}
    // y la tortuga esconde la cabeza un momento en el caparazón
    // el conejo echa las orejas hacia atrás con el salto y vuelven con un rebote
    if(ears.length){const k=o.hop!=null?T-o.hop:9,e=k<0||k>1.1?0:k<.25?k/.25:Math.cos((k-.25)*9)*Math.exp(-(k-.25)*4);for(const ea of ears)ea.rotation.z=.75*e}
    // el caracol mete los ojos (encoge las antenas) un momento y los vuelve a sacar
    if(stalks.length){const k=o.hop!=null?T-o.hop:9,e=k<0?0:k<.12?k/.12:k<.7?1:Math.max(0,1-(k-.7)/.35);for(const st of stalks)st.scale.y=1-.65*e}
    if(kind==='tortuga'){const k=o.hop!=null?T-o.hop:9,e=k<0?0:k<.15?k/.15:k<.9?1:Math.max(0,1-(k-.9)/.3);head.position.x=hx0-.5*e;head.scale.setScalar(1-.25*e)}};
  root.traverse((o: Nodo)=>{if(o.isMesh&&o.material&&o.material.type==='MeshToonMaterial')o.castShadow=true});
  return root}

/* ---------- Pipo, el dinosaurio que crece ---------- */
// makePipo(st): construye a Pipo según su etapa st (petStage() en escenas/zonas.ts, según las estrellas): 0 = huevo, 1 = huevo con la cabeza
// asomando, 2 y 3 = dinosaurio pequeño y mediano, 4 = grande con corona. Devuelve el grupo con userData.id='pipo' y userData.anim.
export function makePipo(st: number){const g=new THREE.Group(),b=grp(g);g.userData.id='pipo';
  if(st<=1){mk(Sph(.62,22,16),'#FFF6E0',{p:[0,.78,0],s:[1,1.28,1],to:b,ol:.04});
    [[.2,1,.5],[-.25,.6,.5],[.35,.5,.4],[-.1,1.3,.42],[.45,1.05,.2]].forEach(([x,y,z])=>mk(Sph(.11,10,8),'#9BD86A',{p:[x,y,z],s:[1,1,.3],ol:0,to:b}));
    if(st===1){const hd=grp(b,[0,1.5,0]);mk(Sph(.38,16,12),'#7CC86E',{to:hd,ol:.03});for(const z of[-.15,.15]){mk(Sph(.09,10,8),'#fff',{p:[.25,.08,z],ol:.02,to:hd});mk(Sph(.045,8,6),K,{p:[.32,.08,z*1.1],ol:0,to:hd})}
      mk(Sph(.35,14,10),'#FFF6E0',{p:[0,.22,0],s:[1,.55,1],to:hd,ol:.03})}}
  else{const k=st===2?.62:st===3?.82:1,G2='#7CC86E';b.scale.setScalar(k);
    mk(Sph(.8,22,16),G2,{p:[0,1.05,0],s:[1.15,.9,.82],to:b,ol:.05});mk(Sph(.55,16,12),'#C9EFA5',{p:[.35,.95,.3],s:[1,1,.5],ol:0,to:b});
    const hd=grp(b,[.95,1.85,0]);mk(Sph(.5,18,14),G2,{s:[1.15,1,1],to:hd,ol:.045});
    for(const z of[-.2,.2]){mk(Sph(.13,12,10),'#fff',{p:[.25,.18,z],ol:.025,to:hd});mk(Sph(.065,8,6),K,{p:[.35,.2,z*1.15],ol:0,to:hd})}
    mk(new THREE.TorusGeometry(.14,.03,6,12,PI),K,{p:[.48,-.08,0],r:[0,PI/2,PI],ol:0,to:hd});
    mk(Cone(.42,1.4,14),G2,{p:[-1.15,.95,0],r:[0,0,PI/2+.35],to:b,ol:.04});
    for(const [x,z] of[[.4,.35],[.4,-.35],[-.4,.35],[-.4,-.35]])mk(Cyl(.17,.2,.6,10),G2,{p:[x,.3,z],to:b,ol:.04});
    for(let i=0;i<5;i++)mk(Cone(.16,.38,6),'#FFA94D',{p:[-.7+i*.35,1.82-Math.abs(i-2.2)*.1,0],to:b,ol:.025});
    if(st>=4){const cr=grp(hd,[-.05,.5,0]);mk(Cyl(.28,.28,.22,16),'#FFC93C',{to:cr,ol:.03});for(let i=0;i<5;i++){const a=i/5*PI*2;mk(Cone(.07,.2,6),'#FFC93C',{p:[Math.cos(a)*.24,.2,Math.sin(a)*.24],to:cr,ol:.02})}}}
  const hit=new THREE.Mesh(Box(2,2.6,1.6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.1;g.add(hit);
  // anim(jump): cada cuadro; en la etapa 0 el huevo tiembla a ratos, después respira; jump = instante T del toque (botes que se apagan)
  g.userData.anim=(jump: number)=>{if(st===0){const w=Math.sin(T*.8)>.55?Math.sin(T*9)*.12:0;b.rotation.z=w}else b.position.y=Math.abs(Math.sin(T*3))*.06;
    const j=jump?Math.max(0,1-(T-jump)*1.6)*Math.abs(Math.sin((T-jump)*10)):0;g.position.y=(g.userData.y0||0)+j*.8};
  return g}

/* ---------- la casa de Tito, que crece con las casitas terminadas ---------- */
// shellTex(): textura con el icono de Tito (shellIcon) para el escudo de la fachada de la casa; en caché por animal y color
export function shellTex(){const c=(SHELLC[(S.tito&&S.tito.shell)!]||SHELLC.naranja)[0];return canvasTex(128,128,()=>{shellIcon(64,64,52)},'shell:'+titoKind()+':'+c)}
// makeHouse(lvl,o): la casa de Tito, que mejora con lvl: 1 = valla y flores, 2 = segundo piso con balcón, 3 = torre con bandera,
// 4 = estrella y arcoíris. Las ventanas se encienden de 19 h a 7 h. Añade lo comprado en la tienda (S.owned: farol, fuente,
// casitaPerro, banco) y el cartel. Devuelve g con userData.id='casaTito' y userData.anim(shake). El parámetro o no se usa.
export function makeHouse(lvl: number){const g=new THREE.Group();g.userData.id='casaTito';const h=ahora().getHours(),lit=h>=19||h<7,win=lit?'#FFE08A':'#BFEAF7';
  const two=lvl>=2,H1=two?3.6:2.1;
  mk(Cyl(3.4,3.5,.25,40),'#9FD88A',{p:[0,.12,0],s:[1,1,.75],to:g,ol:.04});
  mk(Box(3.1,H1,2.4),'#FFF3D6',{p:[0,.25+H1/2,0],to:g,ol:.06});
  mk(prism(3.9,1.7,2.9),'#FF8A7A',{p:[0,.25+H1,0],to:g,ol:.06});
  mk(Box(.5,1.1,.5),'#C98A4B',{p:[.8,.25+H1+1.0,-.4],to:g,ol:.04});
  const smoke: Tres.Mesh[]=[];for(let i=0;i<3;i++)smoke.push(mk(Sph(.22,10,8),'#FFFFFF',{p:[.8,.25+H1+1.7,-.4],to:g,ol:.025,cs:false}));
  g.userData.emb=plane(shellTex(),.8,.8,{p:[0,.25+H1+.65,1.46],to:g});
  mk(Box(.75,1.25,.12),'#C98A4B',{p:[0,.25+.62,1.22],to:g,ol:.04});mk(Sph(.06,8,6),K,{p:[.22,.9,1.3],ol:0,to:g});
  const wins=[[-1,1.3],[1,1.3]];if(two)wins.push([-1,2.85],[1,2.85]);
  for(const [x,y] of wins){mk(Box(.62,.56,.1),win,{p:[x,y,1.22],to:g,ol:.035,cs:false});mk(Box(.62,.05,.12),K,{p:[x,y,1.24],ol:0,to:g});mk(Box(.05,.56,.12),K,{p:[x,y,1.24],ol:0,to:g})}
  if(two){mk(Box(1.7,.12,.6),'#C98A4B',{p:[0,2.25,1.45],to:g,ol:.03});for(let i=0;i<3;i++)flower3(g,-.5+i*.5,1.55,FLC[i+2],.55,2.3)}
  if(lvl>=1){for(const sd of[-1,1]){for(let i=0;i<4;i++)mk(Box(.14,.6,.1),'#FFF6E0',{p:[sd*(1.1+i*.5),.5,2.1],to:g,ol:.025});mk(Box(1.75,.1,.08),'#FFF6E0',{p:[sd*1.85,.62,2.12],to:g,ol:.02})}
    for(let i=0;i<8;i++)flower3(g,-2.8+i*.8,2.45+(i%2)*.2,FLC[i%7],.7,.2)}
  if(lvl>=3){const tw=grp(g,[2.05,0,-.4]);mk(Cyl(.62,.62,4.6,20),'#FFE3B0',{p:[0,2.55,0],to:tw,ol:.05});mk(Cone(.85,1.5,20),'#9B8AD9',{p:[0,5.6,0],to:tw,ol:.05});
    mk(Cyl(.03,.03,1.1,6),K,{p:[0,6.8,0],ol:0,to:tw});
    const fg=new THREE.PlaneGeometry(.8,.45,8,1);fg.translate(.4,0,0);const flag=new THREE.Mesh(fg,new THREE.MeshToonMaterial({color:'#FF6B5E',gradientMap:gradiente(),side:THREE.DoubleSide}));flag.position.set(0,7.1,0);tw.add(flag);g.userData.flag=flag;
    mk(Box(.36,.5,.1),'#BFEAF7',{p:[0,2.6,.6],to:tw,ol:.03})}
  if(lvl>=4){const st=mk(starGeo(.55,.18),'#FFC93C',{p:[0,.25+H1+2.3,0],to:g,ol:.04});g.userData.star=st;
    ['#FF6B5E','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9'].forEach((c,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(4.6-i*.22,.12,6,40,PI),M(c));m.position.set(0,.3,-1.9);g.add(m)})}
  // own(k): ¿se ha comprado el artículo k en la tienda?
  const own=(k: string)=>S.owned&&S.owned[k];
  if(own('farol'))spr(picTex('farol'),1.5,1.5,{p:[-2.7,.9,1],to:g});
  if(own('fuente'))spr(picTex('fuente'),1.3,1.3,{p:[-2.3,.75,1.9],to:g});
  if(own('casitaPerro')){spr(picTex('casitaPerro'),1.3,1.3,{p:[2.7,.75,1.2],to:g});spr(picTex('perro'),.75,.75,{p:[3.2,.45,1.8],to:g})}
  if(own('banco'))spr(picTex('banco'),1.1,1.1,{p:[-1.5,.55,2.2],to:g});
  spr(pillTex('Casa de Tito','#FFA94D','#fff',72),3.4,.85,{p:[0,.55,2.5],to:g});
  const hit=new THREE.Mesh(Box(5,5,4),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=2.2;g.add(hit);
  // anim(shake): cada cuadro mueve el humo de la chimenea, la estrella y la bandera; shake = instante T del toque: tiembla 1,4 s
  g.userData.anim=(shake: number)=>{for(let i=0;i<3;i++){const k=(T*.35+i/3)%1,s=smoke[i];s.position.set(.8+Math.sin(T+i)*.2+k*.5,.25+H1+1.7+k*1.8,-.4);s.scale.setScalar(.6+k*1.4);s.visible=k<.92}
    if(g.userData.star)g.userData.star.rotation.y=Math.sin(T*1.5)*.55;
    if(g.userData.flag){const p=g.userData.flag.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(T*6-x*6)*.12*x)}p.needsUpdate=true}
    const sk=shake?Math.sin(T*40)*.15*Math.max(0,1-(T-shake)/1.4):0;g.children[0].parent!.rotation.z=sk*.15};
  return g}
