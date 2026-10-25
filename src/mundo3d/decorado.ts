/*
 * mundo3d/decorado.ts: las piezas de decoración de la capa 3D (desde la fase 4h; antes, el principio de la utilería de
 * mundo3d/mundo3d.ts): flores (flower3, con su zona de toque invisible, el material FHIT), árboles (tree3, con los colores
 * de cada estación en TREEC), arbustos (bush3), piedras (rock3), candados (lock3), flechas (arrow3, arrowSway), aros
 * (ring3), cintas y caminos (ribbon, bez), mariposas (butterfly3), gaviotas (gull3), luciérnagas (fireflies), estrellas
 * del cielo de noche (skyStars) y lo que cae (pétalos, nieve: fallPts, con la textura suave softTex).
 * Los objetos que se pueden tocar siguen el patrón de la utilería (abajo); lo que pasa al tocarlos está en wobTap
 * (mundo3d/interaccion.ts). Usa THREE (global, de three.min.js) solo dentro de las funciones: así el módulo se carga
 * igual sin Three.js (el juego va en 2D).
 * Exporta: las piezas de arriba, fhit() (el material FHIT) y softTex. Importa: las piezas de mundo3d/materiales.ts, K
 * (src/dibujos/), del núcleo PI, T y ctx, y azar() (aplicacion/puertos.ts).
 */
import type * as Tres from 'three';
import type { Libre } from '../nucleo/tipos.ts';
import type { Mundo, OpcionesCinta, PuntoSuelo, Trio } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { PI, T, ctx } from '../nucleo/indice.ts';
// ahora() y azar(): la fecha y la hora y el azar (puertos de aplicacion/puertos.ts, desde la fase 3g; antes new
// Date() y Math.random()).
import { azar } from '../aplicacion/puertos.ts';
import { Box, Cone, Cyl, M, Sph, canvasTex, gcache, grp, mg, mk, rbox } from './materiales.ts';

/* ---------- utilería ---------- */
/* Patrón de los objetos de decoración de las zonas y del mapa (flower3, tree3, frog3, bus3...):
 *  - reciben el mundo w (o el grupo "to" donde se añaden), la posición (x,z sobre el suelo) y la escala s;
 *  - se montan con grp + mk y devuelven el grupo g;
 *  - llevan una marca en g.userData (tree, frog, bus...) para que wobInit los apunte en w.trees y se puedan tocar;
 *  - su animación se añade a w.upd y usa e=T-g.userData.wob (segundos desde que se tocó; 9 si nunca);
 *    g.userData.dur = cuánto dura la reacción al toque (si no, 1,6 s);
 *  - las piezas muy pequeñas llevan una esfera invisible más grande (FHIT o hitS) para que un dedo las acierte;
 *  - muchos miran skyNow().night para dormirse de noche (con las "Zzz" de zzz3) o encender luces.
 * El sonido y lo que dice Tito al tocarlos no está aquí, sino en wobTap (mundo3d/interaccion.ts). */
// flower3(to,x,z,c,s,y): flor de color c (tallo + 5 pétalos + centro amarillo) con una zona de toque invisible
// grande. Guarda la cabeza en g.userData.flower (wobInit la hace girar al tocarla). Devuelve el grupo.
export function flower3(to: Tres.Object3D,x: number,z: number,c: string,s=1,y=0){const g=grp(to,[x,y,z],s);mk(gcache('stem',()=>Cyl(.035,.035,.5,5)),'#6FB84F',{p:[0,.25,0],ol:0,cs:false,to:g});const h=grp(g,[0,.55,0]);h.rotation.x=-.5;
  mk(gcache('petals',()=>mg([0,1,2,3,4].map(i=>{const a=i/5*PI*2;return[Sph(.12,9,7),[Math.cos(a)*.13,Math.sin(a)*.13,0],[1,1,.5]]}))),c,{ol:.02,cs:false,to:h});mk(gcache('fcenter',()=>Sph(.09,9,7)),'#FFD66B',{p:[0,0,.03],s:[1,1,.6],ol:0,cs:false,to:h});
  const hit=new THREE.Mesh(gcache('fhit',()=>Sph(.32,6,4)),fhit());hit.position.y=.45;g.add(hit);g.userData.flower=h;return g}
// FHIT: material invisible de las zonas de toque (las flores y otras piezas son muy pequeñas para un dedo). Desde la
// fase 4h se crea la primera vez que se pide (fhit()), no al cargar el módulo: así se carga igual sin Three.js.
let FHIT: Tres.MeshBasicMaterial|null=null;
// fhit(): el material FHIT (lo crea la primera vez que se pide).
export function fhit(): Tres.MeshBasicMaterial{return FHIT||(FHIT=new THREE.MeshBasicMaterial({visible:false}))}
// TREEC: colores de los árboles según el tipo: [copa, frutos o flores (null = sin ellos)].
const TREEC: Record<string, [string, string|null]>={primavera:['#9BD86A','#F58BB4'],verano:['#6FC25A',null],'otoño':['#FFA94D','#FF6B5E'],invierno:['#E8F4F8',null],gris:['#C9C2B8',null]};
// tree3(to,x,z,s,kind,pine): árbol en (x,z) de escala s. kind = 'primavera'|'verano'|'otoño'|'invierno'|'gris'
// (gris = zona aún bloqueada); pine=true hace un pino de tres conos. Marca userData.tree. Devuelve el grupo.
export function tree3(to: Tres.Object3D,x: number,z: number,s=1,kind='verano',pine?: boolean|number){const g=grp(to,[x,0,z],s),c=TREEC[kind]||TREEC.verano;mk(Cyl(.18,.26,1.4,10),kind==='gris'?'#B8AFA4':'#A86B43',{p:[0,.7,0],to:g});
  if(pine){[[1.1,1.3,1.5],[.85,1.1,2.2],[.55,.9,2.85]].forEach(([r,h,y])=>mk(Cone(r,h,9),kind==='gris'?'#C9C2B8':'#4FA36A',{p:[0,y,0],to:g}))}
  else{mk(gcache('canopy',()=>mg([[0,2.1,0,.95],[-.55,1.75,.2,.7],[.55,1.8,-.1,.72],[.1,2.6,-.1,.6]].map(([a,b,d,r])=>[Sph(r,14,10),[a,b,d]]))),c[0],{to:g});
    if(c[1])mk(gcache('berries',()=>mg([0,1,2,3,4].map(i=>{const a=i*1.3;return[Sph(.13,8,6),[Math.cos(a)*.75,1.9+Math.sin(i*2)*.4,Math.sin(a)*.75+.2]]}))),c[1],{ol:.02,cs:false,to:g})}
  g.userData.tree=1;return g}
// bush3(to,x,z,s,c): arbusto de tres bolas de color c. Marca userData.bush (al tocarlo se aplasta).
export function bush3(to: Tres.Object3D,x: number,z: number,s=1,c='#7CC86E'){const g=grp(to,[x,0,z],s);mk(gcache('bush',()=>mg([[0,.35,0,.45],[-.4,.28,.1,.33],[.4,.3,0,.35]].map(([a,b,d,r])=>[Sph(r,12,8),[a,b,d]]))),c,{to:g});g.userData.bush=1;return g}
// rock3(to,x,z,s,c): piedra (dodecaedro achatado) con un giro que depende de x. Marca userData.rock (bota).
export function rock3(to: Tres.Object3D,x: number,z: number,s=1,c='#B9B2A8'){const m=mk(new THREE.DodecahedronGeometry(.5,0),c,{p:[x,.2*s,z],s:[s,s*.7,s],r:[0,x*3,0],to});m.userData.rock=1;return m}
// lock3(to,p,s): candado amarillo en la posición p, para las zonas y casitas que aún no están abiertas.
export function lock3(to: Tres.Object3D,p: Trio,s=1){const g=grp(to,p,s);mk(rbox(1.1,.85,.45,.12),'#FFC93C',{to:g,ol:.05});
  const sh=new THREE.TorusGeometry(.33,.09,10,20,PI);mk(sh,'#B8B0A6',{p:[0,.42,0],to:g,ol:.04});
  mk(Cyl(.09,.09,.1,12),K,{p:[0,.05,.24],r:[PI/2,0,0],ol:0,to:g});mk(Box(.07,.22,.08),K,{p:[0,-.12,.24],ol:0,to:g});return g}
// arrow3(to,p,s): flecha amarilla gruesa (apunta hacia arriba) que señala lo siguiente que hay que hacer.
export function arrow3(to: Tres.Object3D,p: Trio,s=1){const sh=new THREE.Shape();[[-15,-46],[15,-46],[15,-16],[32,-16],[0,18],[-32,-16],[-15,-16]].forEach(([x,y],i)=>i?sh.lineTo(x/30,-y/30):sh.moveTo(x/30,-y/30));
  const g=new THREE.ExtrudeGeometry(sh,{depth:.25,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:1});g.translate(0,0,-.125);return mk(g,'#FFC93C',{p,s,to,ol:.05,cs:false})}
// la flecha de "siguiente" ya no gira entera (de canto se veía como una rayita): mira a la cámara y se balancea un poco
// arrowSway(w,ar): en cada cuadro, gira la flecha ar para que mire a la cámara, con un balanceo suave.
export const arrowSway=(w: Mundo,ar: Tres.Object3D)=>{ar.rotation.y=Math.atan2(w.cam.position.x-ar.position.x,w.cam.position.z-ar.position.z)+Math.sin(T*1.5)*.45};
// ring3(to,p,r,c): aro plano y semitransparente de radio r tumbado en el suelo en p (marca un lugar).
export function ring3(to: Tres.Object3D,p: Trio,r: number,c='#FFC93C'){const m=new THREE.Mesh(new THREE.TorusGeometry(r,.09,8,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.8}));m.rotation.x=-PI/2;m.position.set(p[0],p[1],p[2]);to.add(m);return m}
// cinta plana (caminos): pts = [[x,z],...]
// ribbon(to,pts,w,c,y,o): cinta plana de ancho w y color c que sigue los puntos pts del suelo (los caminos).
// En cada punto se calcula la dirección (con el anterior y el siguiente) y se ponen dos vértices a los lados.
// o.polygonOffset: empuja la cinta "hacia delante" para que no parpadee con el suelo; o.dash cada cuántos
// puntos se pone una piedrecita (o.dashC su color). Devuelve la pieza.
export function ribbon(to: Tres.Object3D,pts: PuntoSuelo[],w: number,c: string,y=.02,o: OpcionesCinta={}){const pos=[],idx=[];const n=pts.length;
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    pos.push(pts[i][0]-dz*w/2,y,pts[i][1]+dx*w/2,pts[i][0]+dz*w/2,y,pts[i][1]-dx*w/2);if(i)idx.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,M(c,Object.assign({side:THREE.DoubleSide},o.polygonOffset?{polygonOffset:true,polygonOffsetFactor:-1-o.polygonOffset,polygonOffsetUnits:-4*o.polygonOffset}:{})));m.receiveShadow=true;to.add(m);
  if(o.dash){for(let i=2;i<n-2;i+=o.dash){mk(Cyl(.07,.07,.03,8),o.dashC||'#E4CFA0',{p:[pts[i][0],y+.02,pts[i][1]],ol:0,cs:false,to})}}return m}
// bez(a,c,b,n): n+1 puntos [x,z] de una curva de Bézier cuadrática de a a b con el punto de control c (curvas de caminos).
export function bez(a: PuntoSuelo,c: PuntoSuelo,b: PuntoSuelo,n=24){const r: PuntoSuelo[]=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;r.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return r}
// punto suave y redondo para partículas (luciérnagas, nieve)
// softTex(): textura de un punto blanco difuminado (64x64), compartida por todas las partículas que brillan.
export function softTex(){return canvasTex(64,64,()=>{const g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.25,'rgba(255,255,255,.95)');g.addColorStop(.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64)},'ffly')}
// partículas que caen despacio sobre una zona (nieve, confeti…): un solo dibujo para todas, y no se pueden tocar
// fallPts(w,n,cols,o): n partículas (con colores de la lista cols) que caen despacio y se mecen sobre una zona.
// o: size tamaño, map textura, sp velocidad de caída, sw balanceo, h altura, wx/wz ancho y fondo, cx/cz centro, op opacidad.
// Al llegar al suelo vuelven arriba. Todas son un único objeto Points (un solo dibujo). Devuelve el objeto.
export function fallPts(w: Mundo,n: number,cols: string[],o: Libre){const pos=new Float32Array(n*3),col=new Float32Array(n*3),ph: number[]=[],c=new THREE.Color(),H=o.h||9,WX=o.wx||36,WZ=o.wz||18,CX=o.cx||0,CZ=o.cz||0;
  for(let i=0;i<n;i++){pos[i*3]=CX+(azar()-.5)*WX;pos[i*3+1]=azar()*H;pos[i*3+2]=CZ+(azar()-.5)*WZ;c.set(cols[i%cols.length]);col.set([c.r,c.g,c.b],i*3);ph.push(azar()*6.28)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size:o.size,map:o.map,vertexColors:true,transparent:true,depthWrite:false,opacity:o.op||1}));p.raycast=()=>{};w.sc.add(p);
  w.upd.push((dt: number)=>{for(let i=0;i<n;i++){const k=i*3;pos[k+1]-=o.sp*dt*(.7+(i%5)*.15);pos[k]+=Math.sin(T*.8+ph[i])*o.sw*dt;if(pos[k+1]<0){pos[k+1]=H;pos[k]=CX+(azar()-.5)*WX}}g.attributes.position.needsUpdate=true});return p}
// mariposa: dos alas que aletean y un vuelo en curvas alrededor de un punto
// butterfly3(w,cx,cz,c,ph,o): mariposa de color c que vuela en ochos alrededor de (cx,cz); ph desfasa su vuelo.
// o: s escala, r radio del vuelo, h altura. Al tocarla (userData.bfly) sube asustada y aletea más rápido.
export function butterfly3(w: Mundo,cx: number,cz: number,c: string,ph: number,o: Libre={}){const g=grp(w.sc,[cx,1.5,cz],o.s||1.7);g.userData.bfly=1;g.add(new THREE.Mesh(gcache('bhit',()=>Sph(.4,6,4)),fhit()));const wg=gcache('wing',()=>{const c=(r: number)=>new THREE.CircleGeometry(r,12).rotateX(-PI/2);return mg([[c(.3),[0,0,-.13]],[c(.2),[-.06,0,.17]]])});// ala de dos lóbulos
  mk(Cyl(.035,.035,.42,6),K,{r:[PI/2,0,0],ol:0,cs:false,to:g});const W: [Tres.Group, number][]=[];
  for(const sd of[-1,1]){const pv=grp(g,[0,0,0]);mk(wg,M(c,{side:THREE.DoubleSide}),{p:[sd*.3,0,0],ol:0,cs:false,to:pv});W.push([pv,sd])}
  let lx=cx,lz=cz;w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,up=e<1.4?Math.sin(Math.min(e/1.4,1)*PI)*1.6:0;// al tocarla sube asustada y vuelve
    const t=T*.5+ph,R=o.r||3.2,x=cx+Math.cos(t)*R,z=cz+Math.sin(t*1.3)*R*.5;g.position.set(x,(o.h||1.9)+Math.sin(T*1.7+ph)*.4+up,z);
    g.rotation.y=Math.atan2(x-lx,z-lz);lx=x;lz=z;for(const [pv,sd] of W)pv.rotation.z=sd*(.45+Math.sin(T*(e<1.4?30:16)+ph)*.6)});return g}// alas en V: se ven también desde una cámara baja
// gaviota: vuela en círculos sobre el mar aleteando de vez en cuando
// gull3(w,R,Rz,h,ph,dir): gaviota que vuela en una elipse de radios R x Rz a la altura h sobre el mar;
// dir = 1 o -1 es el sentido de giro. Aletea a ratos y planea; al tocarla da una voltereta.
export function gull3(w: Mundo,R: number,Rz: number,h: number,ph: number,dir: number){const g=grp(w.sc,[0,h,0],1.6);g.userData.gull=1;g.add(new THREE.Mesh(gcache('ghit',()=>Sph(.9,6,4)),fhit()));// zona de toque invisible
  mk(Sph(.18,10,8),'#FFFFFF',{s:[1,.8,1.6],ol:.02,cs:false,to:g});mk(Cone(.06,.2,6),'#FFA94D',{p:[0,0,.36],r:[PI/2,0,0],ol:0,cs:false,to:g});
  const W: [Tres.Group, number][]=[];for(const sd of[-1,1]){const pv=grp(g,[sd*.12,.04,0]);mk(Box(.8,.04,.26),'#FFFFFF',{p:[sd*.4,0,0],ol:.02,cs:false,to:pv});W.push([pv,sd])}
  w.upd.push(()=>{const t=T*.12*dir+ph,x=Math.cos(t)*R,z=Math.sin(t)*Rz;g.position.set(x,h+Math.sin(T*.7+ph)*.5,z);g.rotation.y=Math.atan2(-Math.sin(t)*R*dir,Math.cos(t)*Rz*dir);
    const fl=Math.sin(T*.9+ph)>-.2?Math.sin(T*9+ph)*.5:.15;for(const [pv,sd] of W)pv.rotation.z=sd*fl;
    const k=g.userData.wob,e=k==null?9:T-k;g.rotation.z=e<.8?Math.min(e/.8,1)*PI*2:0});return g}// al tocarla da una voltereta
// luciérnagas que flotan y parpadean (de noche); un solo dibujo para todas
// fireflies(w,WX,WZ,sz): 24 luciérnagas repartidas en WX x WZ que flotan y parpadean (de noche).
// Si se acaba de tocar la luna (w.starT), suben y brillan más un momento.
export function fireflies(w: Mundo,WX: number,WZ: number,sz?: number){const n=24,pos=new Float32Array(n*3),ph: Trio[]=[];for(let i=0;i<n;i++)ph.push([(azar()-.5)*WX,(azar()-.5)*WZ,azar()*6.28]);
    const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const ff=new THREE.Points(fg,new THREE.PointsMaterial({color:'#FFF06A',size:sz||2.2,blending:THREE.AdditiveBlending,map:softTex(),transparent:true,depthWrite:false}));ff.raycast=()=>{};w.sc.add(ff);
    const s0=ff.material.size;w.upd.push(()=>{const b=w.starT!=null&&T-w.starT<1.6?Math.sin((T-w.starT)/1.6*PI):0;/* al tocar la luna, las luciérnagas suben a saludarla y brillan más */ff.material.size=s0*(1+b*.5);for(let i=0;i<n;i++){const [x,z,a]=ph[i];pos[i*3]=x+Math.sin(T*.5+a)*1.2;pos[i*3+1]=1.3+Math.sin(T*.9+a*2)*.6+b*1.4;pos[i*3+2]=z+Math.cos(T*.4+a)*1.2}fg.attributes.position.needsUpdate=true;ff.material.opacity=.65+.35*Math.sin(T*3)})}
// estrellas que titilan en el cielo de noche (tres grupos que brillan a destiempo)
// skyStars(w,y0,z0,WX,HY): cielo de noche: tres grupos de 12 estrellas en una franja de ancho WX y alto HY
// sobre y0, en el fondo z0, que titilan a destiempo, y una estrella fugaz cada 9 s (o al tocar la luna: w.shootT).
export function skyStars(w: Mundo,y0: number,z0: number,WX: number,HY: number){for(let k=0;k<3;k++){const n=12,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=(azar()-.5)*WX;pos[i*3+1]=y0+azar()*HY;pos[i*3+2]=z0-azar()*2;if(Math.abs(pos[i*3]+12)<2&&Math.abs(pos[i*3+1]-2.3)<2)pos[i*3]+=5/* que no tapen la luna */}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({color:'#FFF6C8',size:1.5,blending:THREE.AdditiveBlending,map:softTex(),transparent:true,depthWrite:false}));p.raycast=()=>{};w.sc.add(p);
    w.upd.push(()=>{const b=w.starT!=null&&T-w.starT<1.6?1-(T-w.starT)/1.6:0;/* al tocar la luna, las estrellas brillan más un momento */p.material.opacity=Math.min(1,.55+.45*Math.sin(T*2.2+k*2.1)+b*.6);p.material.size=1.5+b*1.4})}
  // de vez en cuando cruza una estrella fugaz con su estela
  const n=6,fp=new Float32Array(n*3),fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));
  const f=new THREE.Points(fg,new THREE.PointsMaterial({color:'#FFFFFF',size:1.6,blending:THREE.AdditiveBlending,map:softTex(),transparent:true,depthWrite:false}));f.raycast=()=>{};w.sc.add(f);
  w.upd.push(()=>{const c=w.shootT!=null&&T-w.shootT<1.3?T-w.shootT:T%9/* al tocar la luna, sale una enseguida */,q=c/1.3;f.visible=q<1;if(!f.visible)return;const s0=Math.floor(T/9)%2?1:-1;for(let i=0;i<n;i++){const qq=Math.max(0,q-i*.035);fp[i*3]=s0*(-WX*.4+qq*WX*.8);fp[i*3+1]=y0+HY-qq*HY*.7;fp[i*3+2]=z0}fg.attributes.position.needsUpdate=true;f.material.opacity=Math.sin(q*PI);if(w.tito&&q>.15&&q<.85)w.tito.userData.lk={p:new THREE.Vector3(fp[0],fp[1],fp[2]),t:T}/* Tito sigue la estrella fugaz con la mirada */})}
