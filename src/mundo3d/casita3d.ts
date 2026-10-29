/*
 * mundo3d/casita3d.ts: la casita de un tema en 3D, con un puesto para cada juego (desde la fase 4h; antes, en
 * mundo3d/mundo3d.ts): dónde va cada puesto (st3Pos) y dónde se para Tito junto a él (st3Tito), el telón con el fondo
 * del tema (bgSample) y buildCasita, que monta el mundo.
 * montarCasita3D() (la llama mundo3d/mundo3d.ts al montar la capa 3D) pone la disposición de la casita 3D
 * (nucleo/disposicion.ts: stationPos devuelve los puestos proyectados) y pone en SCENES.casita la casita 3D, otra escena
 * hecha a partir de la 2D (desde la fase 4i; antes envolvía la casita, SCENES.juego.enter para apuntar el último juego,
 * que ahora es ultimoJuego de escenas/escenas2d.ts, y stationPos con ponStationPos).
 * Exporta: montarCasita3D. Importa: del núcleo y de escenas/ lo que dibuja y lee la casita; el motor, las piezas y lo de
 * los demás módulos de mundo3d/ (también roadPts de mundo3d/zonas3d.ts).
 */
import * as THREE from 'three';
import type { Tema } from '../juegos/tipos.ts';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Nodo, PuntoSuelo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DF, FLC, LF, PI, S, SCENES, SFX, T, VIVO, atHome, card, circ, ctx, drawCoinHUD, drawHome, inCoinHUD, lerp, pic, ponCtx, scene, sceneName, sparkles, speaker, text, titoPos } from '../nucleo/indice.ts';
import { GNAME, drawStation, tst, ultimoJuego } from '../escenas/escenas2d.ts';
import { gameOpen, nextGameOf } from '../escenas/zonas.ts';
import { ponDisposicion } from '../nucleo/disposicion.ts';
import { W3, camRig, newWorld, pickAt, projO, setWorld } from './motor.ts';
import { Box, Cyl, V3, canvasTex, grp, mk, spr } from './materiales.ts';
import { arrow3, arrowSway, butterfly3, fireflies, flower3, lock3, ribbon, ring3 } from './decorado.ts';
import { busy3, call0, flyTap, titoRect, walkGround, walkTick, walkTo, wobInit, wobTap } from './interaccion.ts';
import { ball3, bird3, lady3 } from './objetos.ts';
import { ffTap, makeTito, titoHearts, titoTapSfx } from './personajes.ts';
import { roadPts } from './zonas3d.ts';
import { skyNow } from './cielo.ts';

/* ================= LA CASITA DE UN TEMA: los juegos en estaciones ================= */
// dónde se para Tito junto a la estación j: en la fila de atrás (si hay dos filas) se queda más atrás para que el cartel de la fila de delante no lo tape
// la tortuga y el erizo llevan la cabeza baja y larga: un poco más a la izquierda para que el disco del juego no les tape la cara
// st3Tito(n,j): desplazamiento [dx,dz] de Tito respecto a la estación j (de n juegos), según la fila y el animal.
const st3Tito=(n: number,j: number)=>{const g=({tortuga:-.7,erizo:-.45} as Record<string, number>)[(S.tito&&S.tito.kind)!]||0;return n>4&&st3Pos(n,j)[1]<0?[-2.3+g,-.5]:[-2+g,1.35]};
// st3Pos(n,j): posición [x,z] de la estación del juego j de n: una fila si son 4 o menos; si no, dos filas en zigzag (3 o 4 por fila).
function st3Pos(n: number,j: number): PuntoSuelo{if(n<=4)return[(j-(n-1)/2)*4.3,.4];const per=n<=6?3:4,r=Math.floor(j/per),c=j%per,cc=r?per-1-c:c;return[(cc-(per-1)/2)*(per===3?4.8:4.2),r?3.4:-2.4]}
// bgSample(t): dibuja el fondo 2D del tema (t.bg) en un lienzo para usarlo de telón 3D y toma muestras de color.
// Devuelve {tex: textura del fondo, ground: color medio del suelo, top: color de arriba (cielo)}. Cambia ctx un momento.
function bgSample(t: Tema){const c=document.createElement('canvas');c.width=1024;c.height=576;const g=c.getContext('2d')!,old=ctx;ponCtx(g);g.scale(.64,.64);try{t.bg()}catch(e){}
  const c2=document.createElement('canvas');c2.width=64;c2.height=36;const g2=c2.getContext('2d',{willReadFrequently:true})!;ponCtx(g2);g2.scale(.04,.04);try{t.bg()}catch(e){}ponCtx(old);
  const d=g2.getImageData(28,33,8,3).data;let r=0,gg=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2]}const n=d.length/4;const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;
  const top=g2.getImageData(32,0,1,1).data;return{tex,ground:new THREE.Color(r/n/255,gg/n/255,b/n/255),top:new THREE.Color(top[0]/255,top[1]/255,top[2]/255)}}
// buildCasita(t,st): mundo 3D de dentro de la casita del tema t: telón con el fondo del tema, suelo, camino y una estación por juego
// (disco con el dibujo del juego y su número; candado si está cerrado), flecha al siguiente juego, animales, Tito y la animación.
// st es SCENES.casita (titoAt, hov, hop, unl, lockShake).
function buildCasita(t: Tema,st: Escena){const bs=bgSample(t),w=newWorld({fov:38,bg:'#'+bs.top.getHexString(),kind:'casita',shadow:16});w.t=t;
  const back=new THREE.Mesh(new THREE.CylinderGeometry(26,26,18,48,1,true,-PI*.32,PI*.64),new THREE.MeshBasicMaterial({map:bs.tex,side:THREE.BackSide}));back.position.set(0,6,8);back.rotation.y=PI;w.sc.add(back);
  const gc='#'+bs.ground.clone().lerp(new THREE.Color('#BFE6A0'),.35).getHexString();
  w.ground=mk(Cyl(15,15.4,.6,60),gc,{p:[0,-.3,0],s:[1,1,.62],to:w.sc,ol:.1});w.gb=[-12,12,-5,5.5];
  const n=t.games.length,nx=nextGameOf(t),P=[];for(let j=0;j<n;j++)P.push(st3Pos(n,j));
  ribbon(w.sc,roadPts(P,3.2),1.3,'#FFF6E0',.04,{dash:4,dashC:'#C9AE7A'});
  if(nx!==0){const lim=nx<0?n-1:nx,rp=roadPts(P,3.2),per=rp.length/(n-1||1);ribbon(w.sc,rp.slice(0,Math.round(lim*per)+1),1.3,'#FFE08A',.05,{polygonOffset:1})}
  w.st=[];for(let j=0;j<n;j++){const [x,z]=P[j],lk=!gameOpen(t,j),g=grp(w.sc,[x,0,z]);g.userData.id='g:'+j;g.userData.game=j;
    mk(Cyl(1.25,1.4,.45,28),j===nx?'#FFF3B0':'#FFFFFF',{p:[0,.22,0],to:g,ol:.05});
    // número del juego: en los cerrados va en marrón oscuro (blanco sobre el gris claro casi no se leía)
    const tex=canvasTex(320,320,()=>{drawStation(t,j,160,160,{s:1.1});circ(50,50,44,lk?'#EADFCF':tst(t.id).g[j]?'#7CC86E':'#5B8DEF',6);text(String(j+1),50,69,54,lk?'#6B5646':'#fff',{f:LF})});
    const sp=spr(tex,2.9,2.9,{p:[0,2.05,0],to:g});if(lk)sp.material.color.set('#BDB6AC');
    const hit=new THREE.Mesh(Box(2.9,3.6,2),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.7;g.add(hit);
    if(lk||(st.unl&&st.unl.j===j))g.userData.lock=lock3(g,[.75,1.25,.9],.8);
    w.st.push({g,sp,p2:[0,0]});w.pick.push(g)}
  w.avoid=P.map(([x,z])=>[x,z,2.2]);
  for(let i=0;i<10;i++){const a=PI*.15+i/9*PI*.7;flower3(w.sc,Math.cos(a)*13.2,-Math.sin(a)*8+1,FLC[i%7],.8)}
  lady3(w,-10,-4.4,1.3);ball3(w,7.4,-4.6,1.3);bird3(w,10,-4.4,1.3,'#7FA8E8');
  // de noche, también dentro de la casita: fondo más oscuro y azulado, menos luz y luciérnagas en vez de mariposas
  if(skyNow().night){back.material.color.set('#8A93C4');w.sc.background=new THREE.Color(w.sc.background as THREE.Color).multiplyScalar(.55);w.sc.children.forEach((o: Nodo)=>{if(o.isLight)o.intensity!*=.85});fireflies(w,26,12,1.1)}
  else{butterfly3(w,-7,-6.5,'#FF8FB1',0,{s:1.1,h:3});butterfly3(w,7,-6.5,'#FFC93C',2.4,{s:1.1,h:3})}// dos mariposas junto a las flores del fondo
  let ar: ReturnType<typeof arrow3>|null=null,rg: ReturnType<typeof ring3>|null=null;if(nx>=0){const [x,z]=P[nx];ar=arrow3(w.sc,[x,4.2,z],.75);rg=ring3(w.sc,[x,.5,z],1.7)}
  const tito=makeTito();tito.scale.setScalar(.6);const ta=P[st.titoAt!=null&&P[st.titoAt]?st.titoAt:Math.max(0,nx)];{const ti=st3Tito(n,P.indexOf(ta)),o=ti;tito.position.set(ta[0]+o[0],0,ta[1]+o[1])}tito.rotation.y=-.2;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  w.upd.push((dt: number)=>{const wk=walkTick(w,tito,dt);tito.userData.anim(dt,{walk:wk,hop:st.hop,hov:st.hovTito});
    if(ar){ar.position.y=4.1+Math.abs(Math.sin(T*4))*.4;arrowSway(w,ar);rg!.material.opacity=.45+.35*Math.sin(T*4)}
    // cada estación crece con el ratón encima, su disco flota y su candado se abre o tiembla como en el mapa
    w.st!.forEach((s,j)=>{const hs=st.hov===j&&!busy3(w)?1.08:1;s.g.scale.setScalar(lerp(s.g.scale.x,hs,.2));s.sp.position.y=2.05+Math.sin(T*2+j)*.06;
      const L=s.g.userData.lock;if(L){if(st.unl&&st.unl.j===j&&T>st.unl.t){const k=(T-st.unl.t)/1.3;if(k>1){s.g.remove(L);s.g.userData.lock=null;s.sp.material.color.set('#fff')}else{L.position.set(.75+k*1.5,1.25+k*k*5,.9);L.rotation.z=k*3;if(k>.15)s.sp.material.color.set('#fff')}}
        else{L.position.y=1.25+Math.sin(T*2+j)*.1;const sh=st.lockShake&&st.lockShake.j===j?Math.max(0,1-(T-st.lockShake.t)*2):0;L.rotation.z=Math.sin(T*40)*.3*sh}}})});
  wobInit(w);
  camRig(w,V3(0,11,15.5),V3(0,2.4,0),1.1);return w}
// montarCasita3D(): pone la casita de un tema en 3D en lugar de la 2D (SCENES.casita) y su disposición (dónde están los
// puestos en la pantalla: los proyectados). La llama mundo3d/mundo3d.ts al montar la capa 3D. Desde la fase 4i es otra
// escena, no una envoltura: copia de la casita 2D (casita2D, de escenas/zonas.ts, que no se toca) la lógica (prompt,
// hint...) y pone su enter, sync, draw y down, que llaman a los del 2D cuando hace falta la lógica de siempre.
export function montarCasita3D(): void{
const casita2D=SCENES.casita;
 // puesto(t,j): en la casita 3D, el puesto j es el proyectado (w.st[j].p2); si no, null y vale el 2D (stationPos)
 ponDisposicion({puesto(t,j){const w=W3;if(w&&w.kind==='casita'&&w.t===t&&w.st&&w.st[j]&&scene===SCENES.casita)return w.st[j].p2!;return null}});
 SCENES.casita={...casita2D,three:true,
  // enter(o): o.t = tema, o.g = juego del que se vuelve (Tito aparece ahí); construye el mundo 3D
  enter(o: Libre){this.hov=null;this.hop=null;this.lockShake=null;this.titoAt=o&&o.g!=null?o.g:(ultimoJuego&&ultimoJuego.t===(o&&o.t)?ultimoJuego.g:null);casita2D.enter!.call(this,o);if(sceneName!=='casita')return;setWorld(buildCasita(this.t,this));this.sync()},
  // sync(): proyecta las estaciones a la pantalla (p2) y coloca a Tito (titoRect)
  sync(){const w=W3;if(!w||w.kind!=='casita')return;w.st!.forEach((s)=>{const [x,y]=projO(s.sp,0);s.p2=[x,y]});titoRect(w.tito!)},
  // draw(): cada cuadro: estación bajo el ratón y su nombre (GNAME), cartel con el tema, botones y bocadillo de Tito
  draw(){this.sync();const t=this.t,w=W3;let hv_=null;
    let hT=false;if(VIVO.mouseOn&&!VIVO.drag&&!(w&&busy3(w))){const u=pickAt(VIVO.MX,VIVO.MY);if(u&&u.game!=null){hv_=u.game;VIVO.hovNow='g:'+u.game}else if(u&&u.id==='tito'){VIVO.hovNow='tito';hT=true}}this.hov=hv_;this.hovTito=hT;
    {ctx.font=`600 54px ${DF}`;const tw=Math.min(900,ctx.measureText(t.n).width);card(170,34,tw+190,112,'#fff',6,56);pic(t.icon,250,90,90);text(t.n,310+tw/2,110,54,K,{w:600})}
    if(hv_!=null){const g=t.games[hv_],nm=GNAME[g.t]||'',p=w!.st![hv_].p2;if(nm){ctx.font=`600 32px ${DF}`;const tw=ctx.measureText(nm).width;card(p[0]-tw/2-24,p[1]+120,tw+48,54,'rgba(255,255,255,.92)',5,27);text(nm,p[0],p[1]+158,32,K,{w:600})}}
    drawHome();drawCoinHUD();
    if(VIVO.talking){const tp=titoPos(),bx=tp.x+tp.w*.85,by=tp.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
  // down(x,y): toque en la casita: botones; objetos; Tito; estación cerrada -> candado; abierta -> Tito camina y se abre el juego
  down(x: number,y: number){const w=W3;if(!w||busy3(w))return;const t=this.t;
    if(atHome(x,y)||inCoinHUD(x,y))return call0(casita2D.down!,this,x,y);
    const u=pickAt(x,y);if(flyTap(w,x,y))return;if(!u){if(wobTap(w,x,y))return;SFX.tap();if(skyNow().night)ffTap(x,y);else sparkles(x,y);walkGround(w);return}
    if(u.id==='tito'){this.hop=T;titoTapSfx();titoHearts(x,y);this.prompt!(true);return}
    if(u.game==null)return;const j=u.game,p=w.st![j].p2;
    if(!gameOpen(t,j)){this.lockShake={j,t:T};return call0(casita2D.down!,this,p[0],p[1])}
    const g=w.st![j].g;const o=st3Tito(t.games.length,j);walkTo(w,w.tito!,g.position.clone().add(V3(o[0],0,o[1])),()=>{if(sceneName==='casita')call0(casita2D.down!,this,p[0],p[1])},{zoom:V3(0,4,4.5),max:.8})}} satisfies Escena;
}
