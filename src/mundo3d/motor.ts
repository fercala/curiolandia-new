/*
 * mundo3d/motor.ts: el motor de la capa 3D (desde la fase 4g; antes, dentro de mundo3d/mundo3d.ts): el dibujante de
 * Three.js (R) sobre el <canvas id="gl">, el mundo activo (W3) y su cámara, la calidad adaptable (PRK, FPS), la
 * proyección del 3D a la pantalla lógica de 1600x900 (proj, projO, projR) y el toque con rayos (RC, pickAt).
 * Nada se crea al cargar el módulo: lo crea montarMotor(), que mundo3d/mundo3d.ts llama al montar la capa 3D y que
 * devuelve false si no hay Three.js o el aparato no tiene WebGL (entonces el juego sigue en 2D).
 * Exporta: R, W3, PRK y ponPRK, FPS, RC, montarMotor, rs, proj, projO, projR, pickAt, newWorld,
 * setWorld, camRig, camTick y fpsTick. Importa: del núcleo, src/nucleo/, PI, VIVO (MX, MY, mouseOn) y
 * OX, OY y SC (de 1600x900 a píxeles), y de mundo3d/materiales.ts la caché de texturas TXC. fitCam, trimShadows
 * y disposeWorld son internas (desde la fase 4n).
 */
import * as THREE from 'three';
import type { Mundo, Nodo, OpcionesMundo } from './tipos.ts';
import { OX, OY, PI, SC, VIVO } from '../nucleo/indice.ts';
import { TXC } from './materiales.ts';

// R: el dibujante (renderer) de Three.js sobre el <canvas id="gl">. Lo crea montarMotor.
export let R!: THREE.WebGLRenderer;
// SHM: tamaño del mapa de sombras. En móviles y tablets la sombra a 1024 se ve casi igual y ahorra memoria de GPU y
// batería (lo decide montarMotor).
let SHM=2048;
// W3: el mundo 3D activo (escena, cámara, animaciones...). Ver la cabecera de mundo3d/mundo3d.ts. Lo cambia setWorld.
export let W3: Mundo|null=null;
// fitCam(w): ajusta la cámara del mundo w al tamaño de la ventana.
// La escena está pensada para 16:9: si la pantalla es más estrecha (móvil en vertical, tablet 4:3), se abre el
// ángulo vertical (fov) para que lo que se ve a lo ancho sea lo mismo que en 16:9 y no se corten los lados.
function fitCam(w: Mundo){const a=innerWidth/innerHeight,c=w.cam,f=w.fov||40,A=16/9;c.aspect=a;
  c.fov=a<A?2*Math.atan(Math.tan(f*PI/360)*A/a)*180/PI:f;c.updateProjectionMatrix()}
// PRK: factor de calidad (1 = nitidez completa, mínimo 0,5). Lo baja fpsTick si el aparato va lento.
export let PRK=1;
// rs(): ajusta el tamaño del dibujo 3D a la ventana y la densidad de píxeles (topada a 1,5 en táctiles y 1,75
// en ordenadores, multiplicada por PRK, nunca por debajo de 0,75). Se llama al cambiar el tamaño de la ventana.
export function rs(){const b=Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.5:1.75);R.setPixelRatio(Math.max(Math.min(b,.75),b*PRK));R.setSize(innerWidth,innerHeight,false);if(W3)fitCam(W3)}
// ponPRK(v): cambia la calidad PRK y ajusta el dibujo (window.__w3.PRK: las pruebas y la zona de adultos).
export function ponPRK(v: number): void{PRK=v;rs()}
// montarMotor(): crea el dibujante R (si el aparato no tiene WebGL, devuelve false y no hay 3D), apaga la gestión de
// color de Three.js (desde r152 convierte los colores a sRGB; el juego se diseñó con r128, que no lo hacía, y con ella
// todo saldría más claro), activa las sombras suaves (PCFShadowMap: PCFSoftShadowMap ya no existe; el radio del sol, 1, lo deja como antes:
// con más, el borde sale punteado), decide el tamaño de las sombras (SHM), crea los vectores y el rayo de trabajo, ajusta el
// tamaño del dibujo (rs) y lo vuelve a ajustar cada vez que cambia el tamaño de la ventana. Devuelve true si hay 3D.
export function montarMotor(): boolean{
  THREE.ColorManagement.enabled=false;
  try{R=new THREE.WebGLRenderer({canvas:document.getElementById('gl') as HTMLCanvasElement,antialias:true,powerPreference:'high-performance'})}catch(e){return false}
  if(!R.getContext())return false;
  R.outputColorSpace=THREE.LinearSRGBColorSpace;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
  SHM=matchMedia('(pointer:coarse)').matches?1024:2048;
  addEventListener('resize',rs);rs();
  _v=new THREE.Vector3();_w=new THREE.Vector3();_u=new THREE.Vector3();_c=new THREE.Vector3();RC=new THREE.Raycaster();_m=new THREE.Vector2();
  return true}

/* ---------- proyección 3D → 1600x900 y selección con el puntero ---------- */
// vectores de trabajo reutilizados (crear vectores nuevos en cada cuadro haría trabajar de más al recolector de basura).
// Los crea montarMotor. _v, _w y _u son de la proyección; _c, del destino de la cámara en camTick.
let _v!: THREE.Vector3,_w!: THREE.Vector3,_u!: THREE.Vector3,_c!: THREE.Vector3;
// proj(p): pasa un punto 3D del mundo (Vector3) a coordenadas de la pantalla lógica 1600x900. Devuelve [x,y].
// project() da coordenadas de -1 a 1; se pasan a píxeles de la ventana y luego se deshace el encaje del juego
// en la ventana (desplazamiento OX/OY y escala SC de nucleo/pantalla.ts).
export function proj(p: THREE.Vector3){_v.copy(p).project(W3!.cam);return[((_v.x+1)/2*innerWidth-OX)/SC,((1-_v.y)/2*innerHeight-OY)/SC]}
// projO(o,dy): como proj, pero del centro de un objeto 3D o, subido dy unidades. Devuelve [x,y] en 1600x900.
export function projO(o: THREE.Object3D,dy=0){o.getWorldPosition(_w);_w.y+=dy;return proj(_w)}
// projR(o,r,dy): proyecta el objeto o (subido dy) y además calcula cuánto mide en pantalla un radio r 3D
// (proyectando otro punto r unidades "hacia arriba" según la cámara). Devuelve [x,y,radio] en 1600x900;
// sirve para rellenar los círculos de toque de la lógica 2D (MZ2: x,y,r).
export function projR(o: THREE.Object3D,r: number,dy=0){o.getWorldPosition(_w);_w.y+=dy;const a=proj(_w);_u.set(0,1,0).applyQuaternion(W3!.cam.quaternion).multiplyScalar(r).add(_w);const b=proj(_u);return[a[0],a[1],Math.hypot(a[0]-b[0],a[1]-b[1])]}
// RC: el rayo que se lanza al tocar; _m: el punto tocado en coordenadas de -1 a 1. Tras pickAt, RC sigue
// apuntando al toque y lo reutilizan wobTap, flyTap, skyTap...
// Los crea montarMotor.
export let RC!: THREE.Raycaster;let _m!: THREE.Vector2;
// pickAt(x,y): ¿qué objeto 3D hay bajo el punto (x,y) de 1600x900? Lanza un rayo desde la cámara contra W3.pick
// y sube por los padres del objeto tocado hasta encontrar uno con userData.id. Devuelve ese userData
// (por ejemplo {id:'mz:jardin',spot:'jardin'}) o null si no hay nada que se pueda tocar.
export function pickAt(x: number,y: number){if(!W3)return null;_m.set((x*SC+OX)/innerWidth*2-1,-((y*SC+OY)/innerHeight)*2+1);RC.setFromCamera(_m,W3.cam);
  for(const h of RC.intersectObjects(W3.pick,true)){let o: THREE.Object3D|null=h.object;while(o&&!o.userData.id)o=o.parent;if(o)return o.userData}return null}

/* ---------- el mundo activo ---------- */
// newWorld(o): crea un mundo 3D vacío: escena, cámara (o.fov, 40 por defecto, 16:9), fondo o.bg, niebla o.fog=[cerca,lejos] y luces
// (cielo, ambiente y sol con sombras que cubren o.shadow; sus intensidades van × PI porque desde r155 las luces son
// «físicas» y r128 ya multiplicaba por PI por dentro: así se ven igual). Devuelve w = {sc, cam, fov, pick:[] (cosas que se pueden tocar),
// upd:[] (funciones de cada cuadro), kind, sun}. Cada escena 3D lo rellena y luego llama a setWorld(w).
export function newWorld(o: OpcionesMundo={}){const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(o.fov||40,16/9,.1,400);
  const w: Mundo={sc,cam,fov:o.fov||40,pick:[],upd:[],kind:o.kind};
  sc.background=new THREE.Color(o.bg||'#BFE9F8');if(o.fog)sc.fog=new THREE.Fog(o.bg||'#BFE9F8',o.fog[0],o.fog[1]);
  sc.add(new THREE.HemisphereLight(0xffffff,0xb7d39c,.44*PI));sc.add(new THREE.AmbientLight(0xffffff,.12*PI));
  const sun=new THREE.DirectionalLight(0xfff4e0,.48*PI);sun.position.set(-14,30,18);sun.castShadow=true;const s=o.shadow||24;
  Object.assign(sun.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:90});sun.shadow.mapSize.setScalar(SHM);sun.shadow.bias=-.0006;sun.shadow.radius=1;sc.add(sun);sc.add(sun.target);w.sun=sun;
  fitCam(w);return w}
// las piezas diminutas (pétalos, piedritas, puntitos) no proyectan sombra: no se nota y ahorra una pasada de dibujo por pieza
// trimShadows(w): mira el tamaño real de cada pieza (radio de su geometría por la escala); Tito (w.tito) conserva siempre sus sombras
function trimShadows(w: Mundo){const s=new THREE.Vector3(),keep=new Set();if(w.tito)w.tito.traverse(o=>keep.add(o));w.sc.updateMatrixWorld(true);
  w.sc.traverse((o: Nodo)=>{if(!o.isMesh||!o.castShadow||keep.has(o))return;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();o.getWorldScale(s);
    if(g.boundingSphere.radius*Math.max(s.x,s.y,s.z)<.3)o.castShadow=false})}
// setWorld(w): hace que w sea el mundo activo W3 (libera el anterior), ajusta la cámara, reinicia la medida de FPS y quita sombras pequeñas
export function setWorld(w: Mundo){if(W3&&W3!==w)disposeWorld(W3);W3=w;fitCam(w);FPS.last=0;trimShadows(w)}
// también se liberan las texturas de usar y tirar (las guardadas en TXC se reutilizan) y el mapa de sombras del sol;
// sin esto cada visita a una escena dejaba en la GPU ~11 texturas y una sombra de 2048x2048
// disposeWorld(w): libera de la GPU las geometrías (menos las marcadas keep, como las de gcache y el caparazón de Tito, SHELL),
// sombras y texturas de un mundo que ya no se usa.
// tx(t): libera la textura t si no está en la caché TXC
function disposeWorld(w: Mundo){const kept=new Set<THREE.Texture>(Object.values(TXC)),tx=(t: THREE.Texture|null|undefined)=>{if(t&&t.isTexture&&!kept.has(t))t.dispose()};
  w.sc.traverse((o: Nodo)=>{if(o.geometry&&!o.geometry.userData.keep)o.geometry.dispose();
    if(o.isLight&&o.shadow&&o.shadow.map){o.shadow.map.dispose();o.shadow.map=null}
    for(const m of ([] as THREE.MeshBasicMaterial[]).concat(o.material||[]))tx(m.map);if(o.material&&o.material.isSpriteMaterial)o.material.dispose()});tx(w.sc.background as THREE.Texture|null)/* si el fondo es un color, tx no hace nada */}
// cámara: base + pequeño paralaje con el mouse
// camRig(w,pos,look,par): pone la cámara en pos mirando a look. w.cb = posición base; w.camT = destino actual (walkTo lo cambia para
// acercarse); w.camL = punto al que mira ahora. par = cuánto se mueve con el ratón (paralaje)
export function camRig(w: Mundo,pos: THREE.Vector3,look: THREE.Vector3,par=1){w.cb={pos:pos.clone(),look:look.clone(),par};w.cam.position.copy(pos);w.cam.lookAt(look);w.camT={pos:pos.clone(),look:look.clone()};w.camL=look.clone()}
// camTick(w,dt): cada cuadro acerca la cámara suavemente a su destino (w.camT) más el paralaje del ratón (MX,MY);
// k=1-e^(-3*dt) hace que el suavizado vaya igual de rápido con cualquier número de cuadros por segundo.
// El destino con paralaje va en el vector de trabajo _c (sin clone() ni V3() en cada cuadro): paralaje + destino da
// exactamente los mismos números que destino + paralaje, porque la suma de dos números es conmutativa también en coma flotante
export function camTick(w: Mundo,dt: number){const c=w.cb;if(!c)return;const k=1-Math.exp(-dt*3);
  const mx=VIVO.mouseOn?(VIVO.MX-800)/800:0,my=VIVO.mouseOn?(VIVO.MY-450)/450:0;
  const tp=_c.set(mx*c.par,-my*c.par*.5,0).add(w.camT!.pos),tl=w.camT!.look;
  w.cam.position.lerp(tp,k);w.camL!.lerp(tl,k);w.cam.lookAt(w.camL!)}

// calidad adaptable: si el aparato no llega a ~24 cuadros por segundo en 3D, se baja la resolución (nunca se sube);
// debajo de 20 cuadros el juego entero va más lento porque el paso de tiempo está topado en 0,05 s
// FPS = {n: cuadros contados, t0: inicio de la medida, last: último cuadro, up: ya se subió la calidad, noUp: no volver a subirla}.
// PRK = escala de la resolución (1 = completa, mínimo 0,5); rs() redimensiona el lienzo
export const FPS: {n: number; t0: number; last: number; up?: boolean; noUp?: boolean}={n:0,t0:0,last:0};
// fpsTick(): se llama en cada cuadro 3D. Cuenta cuadros durante 4 s y baja o sube PRK. Tras una pausa de más de 1 s (o con la
// pestaña oculta) empieza a contar de nuevo, para no confundir la pausa con lentitud
export function fpsTick(){const now=performance.now();if(now-FPS.last>1000||document.hidden){FPS.n=0;FPS.t0=now}FPS.last=now;FPS.n++;
  if(now-FPS.t0>=4000){const fps=FPS.n*1000/(now-FPS.t0);if(fps<24&&PRK>.5){PRK=Math.max(.5,PRK*.75);if(FPS.up)FPS.noUp=true;rs()}
    // si fue un tirón pasajero (cargando, otra app) y ahora va sobrado, la nitidez vuelve a subir; si vuelve a ir lento después de subir, se queda baja
    else if(fps>=55&&PRK<1&&!FPS.noUp){PRK=Math.min(1,PRK/.75);FPS.up=true;rs()}
    FPS.n=0;FPS.t0=now}}
