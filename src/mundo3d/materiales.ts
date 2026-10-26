/*
 * mundo3d/materiales.ts: las piezas con las que se construye todo el mundo 3D (desde la fase 4g; antes, el primer trozo
 * de mundo3d/mundo3d.ts). Materiales con estilo de dibujo animado (M: sombreado en 3 tonos; OLm y olGeo: el contorno
 * marrón), piezas (mk, grp) y formas (Box, Sph, Cyl, Cone, prism, rbox, starGeo), piezas unidas (mg), geometrías
 * compartidas (gcache, keep, GC) y texturas dibujadas con las funciones 2D de siempre (canvasTex, picTex, pillTex,
 * flowerTex, con su caché TXC) y sus carteles (spr, plane, pillSpr). V3 es un atajo para crear vectores.
 * Usa THREE (global, de three.min.js) solo dentro de las funciones: así el módulo se carga igual sin Three.js (el
 * juego va en 2D) y no crea nada hasta que la capa 3D se monta (mundo3d/motor.ts, montarMotor).
 * Exporta todo lo de arriba. Importa: K (src/dibujos/) y del núcleo, src/nucleo/, el lienzo y el dibujo 2D (ctx, ponCtx,
 * card, text, flower, IMG, DF, LF, PI, VIVO.mouseOn).
 */
import type * as Tres from 'three';
import type { OpcionesPieza, OpcionesPlano, OpcionesSprite, PiezaUnida, TexturaDibujada, Trio } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DF, IMG, LF, PI, VIVO, card, ctx, flower, ponCtx, text } from '../nucleo/indice.ts';

// V3(x,y,z): atajo para crear un vector 3D de Three.js.
export const V3=(x: number,y: number,z: number)=>new THREE.Vector3(x,y,z);

/* ---------- materiales con estilo de dibujo: sombreado en 3 tonos + contorno marrón ---------- */
// GRAD: textura de 3 píxeles (gris oscuro, gris claro, blanco) que hace que la luz se pinte en 3 escalones
// en vez de en degradado: es lo que da el aspecto de dibujo animado (MeshToonMaterial). Desde la fase 4g se crea la
// primera vez que se pide (gradiente()), no al cargar el módulo: así el módulo se carga igual sin Three.js (sin 3D).
let GRAD: Tres.DataTexture|null=null;
// gradiente(): la textura GRAD (la crea la primera vez que se pide).
export function gradiente(): Tres.DataTexture{return GRAD||(GRAD=(()=>{const t=new THREE.DataTexture(new Uint8Array([150,150,150,255,212,212,212,255,255,255,255,255]),3,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})())}
// MC: caché de materiales, para no crear dos iguales.
const MC: Record<string, Tres.MeshToonMaterial>={};
// M(c,o): devuelve el material toon de color c (por ejemplo '#FFC93C') con las opciones extra o de Three.js
// ({emissive, side, transparent...}). Se guarda en MC con clave color+opciones y se reutiliza.
export function M(c: string,o?: Tres.MeshToonMaterialParameters){const k=c+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:gradiente()},o||{})))}
// OLC: caché de materiales de contorno, uno por grosor.
const OLC: Record<number, Tres.ShaderMaterial>={};
// OLm(w): material del contorno marrón de grosor w. Técnica del "casco invertido": se dibuja una copia de la pieza
// hinchada w unidades a lo largo de las normales (atributo onorm) y solo por dentro (BackSide), de color marrón
// liso; como la copia es un poco más grande y se ven sus caras de atrás, asoma como un borde alrededor de la pieza.
export function OLm(w: number){w=Math.round(w*1000)/1000;return OLC[w]||(OLC[w]=new THREE.ShaderMaterial({uniforms:{w:{value:w}},side:THREE.BackSide,
  vertexShader:'attribute vec3 onorm;uniform float w;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+onorm*w,1.0);}',
  fragmentShader:'void main(){gl_FragColor=vec4(0.29,0.204,0.157,1.0);}'}))}
// normales suavizadas sólo para el contorno (si no, las cajas quedan con huecos en las aristas)
// olGeo(g): añade a la geometría g el atributo onorm que usa OLm. Junta los vértices que están en el mismo sitio
// (redondeando a 1/500) y les da la media de sus normales, así las esquinas se hinchan juntas y no se abren.
// Lo hace una sola vez por geometría (marca g.userData.ol). Devuelve g.
export function olGeo(g: Tres.BufferGeometry){if(g.userData.ol)return g;const p=g.attributes.position,n=g.attributes.normal,map=new Map(),o=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*500)+','+Math.round(p.getY(i)*500)+','+Math.round(p.getZ(i)*500);let a=map.get(k);if(!a)map.set(k,a=[]);a.push(i)}
  for(const a of map.values()){let x=0,y=0,z=0;for(const i of a){x+=n.getX(i);y+=n.getY(i);z+=n.getZ(i)}const l=Math.hypot(x,y,z)||1;for(const i of a){o[i*3]=x/l;o[i*3+1]=y/l;o[i*3+2]=z/l}}
  g.setAttribute('onorm',new THREE.BufferAttribute(o,3));g.userData.ol=1;return g}
// mk(geo,c,o): crea una pieza (Mesh) con la geometría geo y el color c (texto '#rrggbb' -> material toon M(c),
// o un material ya hecho). Opciones o: p [x,y,z] posición, r [rx,ry,rz] giro, s escala (número o [sx,sy,sz]),
// to = grupo o escena donde se añade, cs/rs = false para no proyectar/recibir sombra, ol = grosor del contorno
// (0 = sin contorno; por defecto .05). El contorno es una pieza hija que no se puede tocar (raycast vacío) y su
// grosor se divide por la escala media para que se vea igual de grueso en piezas grandes y pequeñas. Devuelve la pieza.
export function mk(geo: Tres.BufferGeometry,c: string | Tres.Material,o: OpcionesPieza={}){const m=new THREE.Mesh(geo,typeof c==='string'?M(c):c);m.castShadow=o.cs!==false;m.receiveShadow=o.rs!==false;
  if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);if(o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);
  if(o.s!=null){if(typeof o.s==='number')m.scale.setScalar(o.s);else m.scale.set(o.s[0],o.s[1],o.s[2])}
  if(o.ol!==0){const sc=(m.scale.x+m.scale.y+m.scale.z)/3,l=new THREE.Mesh(olGeo(geo),OLm((o.ol||.05)/sc));l.castShadow=false;l.receiveShadow=false;l.raycast=()=>{};m.add(l)}
  if(o.to)o.to.add(m);return m}
// grp(to,p,s): crea un grupo vacío en la posición p [x,y,z] con escala s y lo añade a to. Devuelve el grupo.
export const grp=(to: Tres.Object3D,p?: Trio,s?: number)=>{const g=new THREE.Group();if(p)g.position.set(p[0],p[1],p[2]);if(s)g.scale.setScalar(s);if(to)to.add(g);return g};
// atajos de formas básicas: caja (ancho, alto, fondo), esfera (radio, segmentos), cilindro (radio arriba, radio abajo,
// alto, lados) y cono (radio, alto, lados). Menos segmentos = menos trabajo para el móvil.
export const Box=(w: number,h: number,d: number)=>new THREE.BoxGeometry(w,h,d),Sph=(r: number,a=20,b=14)=>new THREE.SphereGeometry(r,a,b),Cyl=(a: number,b: number,h: number,n=20)=>new THREE.CylinderGeometry(a,b,h,n),Cone=(r: number,h: number,n=20)=>new THREE.ConeGeometry(r,h,n);
// prism(w,h,d): prisma triangular (como un tejado) de base w, altura h y fondo d, centrado en el fondo.
export function prism(w: number,h: number,d: number){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return g}
// rbox(w,h,d,r): caja con las esquinas redondeadas de radio r (para paredes, carteles, el autobús...).
export function rbox(w: number,h: number,d: number,r: number){const s=new THREE.Shape(),x=-w/2+r,y=-h/2+r,W_=w-2*r,H_=h-2*r;s.moveTo(x,-h/2);s.lineTo(x+W_,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,y);s.lineTo(w/2,y+H_);s.quadraticCurveTo(w/2,h/2,x+W_,h/2);s.lineTo(x,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,y+H_);s.lineTo(-w/2,y);s.quadraticCurveTo(-w/2,-h/2,x,-h/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:d-r,bevelEnabled:true,bevelThickness:r/2,bevelSize:r/2,bevelSegments:2,curveSegments:6});g.translate(0,0,-(d-r)/2);return g}
// starGeo(r,d): estrella de 5 puntas de radio r y grosor d, con los bordes biselados.
export function starGeo(r: number,d: number){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=PI/2+i*PI/5,q=i%2?r*.45:r;i?s.lineTo(Math.cos(a)*q,Math.sin(a)*q):s.moveTo(Math.cos(a)*q,Math.sin(a)*q)}s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:d*.3,bevelSize:d*.3,bevelSegments:1});g.translate(0,0,-d/2);return g}

// une varias piezas del mismo color en una sola geometría (menos llamadas de dibujo): [[geo,[x,y,z],[sx,sy,sz]|s,[rx,ry,rz]],...]
// _o3: objeto de trabajo para colocar cada pieza (se crea la primera vez que se usa mg).
let _o3: Tres.Object3D|null=null;
// mg(parts): parts = [[geometría, posición, escala, giro], ...]. Copia cada geometría, le aplica su posición/escala/giro
// y las suelta todas juntas en una BufferGeometry nueva (solo posición y normal). Devuelve esa geometría.
export function mg(parts: PiezaUnida[]){const o3=_o3||(_o3=new THREE.Object3D()),pos=[],nor=[];for(const [g0,p,sc,r] of parts){const g=g0.index?g0.toNonIndexed():g0.clone();o3.position.set(...(p||[0,0,0]));if(sc==null)o3.scale.set(1,1,1);else if(typeof sc==='number')o3.scale.setScalar(sc);else o3.scale.set(...sc);o3.rotation.set(...(r||[0,0,0]));o3.updateMatrix();g.applyMatrix4(o3.matrix);
  pos.push(...(g.attributes.position.array as Float32Array));nor.push(...(g.attributes.normal.array as Float32Array))}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g}
// GC: caché de geometrías compartidas. keep(g) las marca para que disposeWorld no las borre al cambiar de escena.
export const GC: Record<string, Tres.BufferGeometry>={};export const keep=(g: Tres.BufferGeometry)=>{g.userData.keep=1;return g};
// gcache(k,f): devuelve la geometría guardada con el nombre k; si no existe, la crea con f(), le prepara el contorno
// (olGeo) y la guarda para siempre. Úsalo para piezas que se repiten mucho (flores, copas de árbol, nubes...).
export const gcache=(k: string,f: () => Tres.BufferGeometry)=>GC[k]||(GC[k]=keep(olGeo(f())));
/* ---------- texturas hechas con el dibujo 2D de siempre ---------- */
// TXC: caché de texturas dibujadas (por clave). Estas no se liberan al cambiar de escena.
export const TXC: Record<string, TexturaDibujada>={};
// canvasTex(w,h,fn,key): crea una textura de w x h píxeles dibujándola con fn(g). Truco: cambia por un momento la
// variable global ctx (nucleo/pantalla.ts, con ponCtx) por la del lienzo nuevo, así fn puede usar las funciones 2D de siempre (card, text,
// flower...); mouseOn se apaga para que no se dibujen efectos de "ratón encima". Si se da key, se guarda en TXC.
// La textura trae t.redraw() para volver a dibujarla (por ejemplo cuando termina de cargar una imagen).
export function canvasTex(w: number,h: number,fn: (g: CanvasRenderingContext2D) => void,key?: string){if(key&&TXC[key])return TXC[key];const c=document.createElement('canvas');c.width=w;c.height=h;
  const draw=()=>{const g=c.getContext('2d')!,old=ctx;g.clearRect(0,0,w,h);ponCtx(g);const mo=VIVO.mouseOn;VIVO.mouseOn=false;try{fn(g)}catch(e){console.error(e)}VIVO.mouseOn=mo;ponCtx(old)};draw();
  const t=new THREE.CanvasTexture(c) as TexturaDibujada;t.anisotropy=4;t.redraw=()=>{draw();t.needsUpdate=true};if(key)TXC[key]=t;return t}
// picTex(k,px): textura cuadrada de px píxeles con la imagen IMG[k] (dibujos de src/dibujos/). Si la imagen aún
// carga, se redibuja sola al terminar.
export function picTex(k: string,px=256){const t=canvasTex(px,px,g=>{const i=IMG[k];if(i&&i.complete)g.drawImage(i,0,0,px,px)},'pic:'+k+px);
  if(IMG[k]&&!IMG[k].complete)IMG[k].addEventListener('load',()=>t.redraw(),{once:true});return t}
// spr(tex,w,h,o): sprite (cartel plano que siempre mira a la cámara) con la textura tex, de w x h unidades.
// Opciones o: p posición, to dónde añadirlo, dt=false para dibujarlo siempre por encima, op opacidad, ro orden de dibujo.
export function spr(tex: Tres.Texture,w: number,h?: number,o: OpcionesSprite={}){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:o.dt!==false,opacity:o.op??1}));m.scale.set(w,h??w,1);if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);if(o.to)o.to.add(m);m.renderOrder=o.ro||0;return m}
// plane(tex,w,h,o): plano fijo con la textura tex (no gira hacia la cámara). Opciones: p, r, to, ds (dos caras).
export function plane(tex: Tres.Texture,w: number,h: number,o: OpcionesPlano={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.02,side:o.ds?THREE.DoubleSide:THREE.FrontSide}));if(o.p)m.position.set(o.p[0],o.p[1],o.p[2]);if(o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);if(o.to)o.to.add(m);return m}
// cartel en forma de píldora: [texto, fondo, color del texto]
// pillTex(t,bg,fg,sz): textura de 512x128 con el texto t sobre un cartel redondeado; se guarda en caché.
export function pillTex(t: string,bg='#fff',fg=K,sz=56){return canvasTex(512,128,g=>{g.font=`700 ${sz}px ${DF}`;const tw=Math.min(470,g.measureText(t).width+60);card(256-tw/2,14,tw,100,bg,8,50);text(t,256,64+sz*.36,sz,fg)},'pill:'+t+bg+fg+sz)}
// pillSpr(t,bg,fg,o): sprite con el cartel pillTex, de o.w unidades de ancho (2,4 por defecto) y proporción 4:1.
export const pillSpr=(t: string,bg?: string,fg?: string,o: OpcionesSprite={})=>spr(pillTex(t,bg,fg),o.w||2.4,(o.w||2.4)/4,o);
// flowerTex(c,n): textura de un cartelito con una flor de color c y el número n al lado.
export function flowerTex(c: string,n: number|string){return canvasTex(256,128,()=>{card(14,14,228,100,'#fff',8,50);flower(80,64,28,c,4);const L=String(n).length>1;text(String(n),L?168:170,L?84:92,L?52:72,K,{f:LF})},'fl:'+c+n)}
