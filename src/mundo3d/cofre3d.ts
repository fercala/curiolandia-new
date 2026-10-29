/*
 * mundo3d/cofre3d.ts: el cofre del tesoro en 3D (desde la fase 4h; antes, en mundo3d/mundo3d.ts): buildCofre monta el
 * mundo (el cofre con su tapa, rayos de luz, estrellas, flores, el loro, el cangrejo y Tito).
 * montarCofre3D() (la llama mundo3d/mundo3d.ts al montar la capa 3D) pone en SCENES.cofre el cofre 3D, otra escena
 * hecha a partir de la 2D (desde la fase 4i; antes la envolvía): dibuja encima el premio que sale y los toques que faltan, y el toque abre el cofre con la lógica de siempre.
 * Exporta: montarCofre3D. Importa: del núcleo y de escenas/ lo que dibuja y lee el cofre; el motor, las piezas (también
 * gradTex) y lo de los demás módulos de mundo3d/.
 */
import * as THREE from 'three';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Nodo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DF, FLC, PI, SCENES, T, VIVO, atHome, back, cap, card, circ, clamp, ctx, drawCoinHUD, drawHome, fillStroke, hC, hv, inR, lerp, pic, sceneName, speaker, text, titoPos } from '../nucleo/indice.ts';
import { drawTitoHouse, houseLevel } from '../escenas/zonas.ts';
import { drawItemPic, itemName } from '../escenas/tienda.ts';
import { W3, camRig, newWorld, pickAt, setWorld } from './motor.ts';
import { Box, Cyl, M, V3, gradTex, grp, mk, rbox, starGeo } from './materiales.ts';
import { fireflies, flower3 } from './decorado.ts';
import { call0, titoRect, wobInit, wobTap } from './interaccion.ts';
import { crab3, parrot3, squawk } from './objetos.ts';
import { makeTito } from './personajes.ts';
import { skyNow } from './cielo.ts';

/* ================= EL COFRE DEL TESORO ================= */
// buildCofre(st): mundo 3D del cofre del tesoro: cofre con tapa que se abre (st.op de 0 a 1), rayos de luz, estrellas, flores,
// loro, cangrejo y Tito. st es SCENES.cofre (openT: cuándo se abrió, shakeT: sacudida al tocarlo, hov, hop).
function buildCofre(st: Escena){const w=newWorld({fov:36,kind:'cofre',shadow:10}),nt=skyNow().night;w.sc.background=nt?gradTex('#F3D9E8','#5F6FB4','cofreBgN'):gradTex('#FFE9C2','#FFD7E4','cofreBg');
  // de noche: cielo de anochecer, estrellas que brillan y luciérnagas
  if(nt){w.sc.children.forEach((o: Nodo)=>{if(o.isLight)o.intensity!*=.85});fireflies(w,16,8,1)}
  mk(Cyl(7,7.4,.6,48),'#BFE6A0',{p:[0,-.3,0],s:[1,1,.7],to:w.sc,ol:.1});
  for(let i=0;i<12;i++){const a=i/12*PI*2;if(Math.sin(a)>.55)continue;flower3(w.sc,Math.cos(a)*5.8,Math.sin(a)*3.8,FLC[i%7],.8)}
  // estrellas del fondo: se balancean y ladean en vez de girar enteras (de canto se veían como rayitas sueltas)
  const stars: THREE.Mesh[]=[];for(let i=0;i<14;i++){const s=mk(starGeo(.18+(i%3)*.08,.06),nt?M('#FFF3B0',{emissive:'#C9A000'}):'#FFF3B0',{p:[-9+i*1.4,4+(i*37%5)*.8,-6-(i%3)],ol:.02,cs:false,to:w.sc});s.userData.y0=s.position.y;stars.push(s)}
  const ch=grp(w.sc,[0,0,0]);w.chest=ch;
  mk(rbox(3.2,1.7,2.2,.15),'#B5763F',{p:[0,.85,0],to:ch,ol:.07});
  for(const y of[.55,1.15])mk(Box(3.22,.07,2.22),'#8A5A3C',{p:[0,y,0],ol:0,to:ch});
  for(const x of[-1.05,1.05])mk(Box(.35,1.72,2.26),'#FFC93C',{p:[x,.86,0],to:ch,ol:.04});
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.8),new THREE.MeshBasicMaterial({color:'#FFE08A',transparent:true,opacity:0}));glow.rotation.x=-PI/2;glow.position.y=1.72;ch.add(glow);
  const piv=grp(ch,[0,1.7,-1.1]),lg=new THREE.CylinderGeometry(1.1,1.1,3.2,24,1,false,0,PI);lg.rotateZ(PI/2);lg.rotateX(PI/2);
  mk(lg,'#C98A4B',{p:[0,0,1.1],s:[1,.62,1],to:piv,ol:.07});for(const x of[-1.05,1.05])mk(new THREE.CylinderGeometry(1.13,1.13,.35,24,1,false,0,PI).rotateZ(PI/2).rotateX(PI/2),'#FFC93C',{p:[x,0,1.1],s:[1,.62,1],to:piv,ol:.04});
  mk(Box(3.2,.1,2.2),'#7A4C30',{p:[0,.02,1.1],ol:.03,to:piv});
  const lock=grp(ch,[0,1.6,1.16]);mk(rbox(.6,.7,.14,.06),'#FFC93C',{to:lock,ol:.035});mk(Cyl(.08,.08,.06,10),K,{p:[0,.08,.08],r:[PI/2,0,0],ol:0,to:lock});
  const rays=grp(w.sc,[0,1.8,-.6]);for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,14),new THREE.MeshBasicMaterial({color:i%2?'#FFF3B0':'#FFE08A',transparent:true,opacity:0,depthWrite:false}));m.geometry.translate(0,7,0);m.rotation.z=i/12*PI*2;rays.add(m)}
  const prt=parrot3(w,-6,-1.4,.85);/* loro pirata junto al cofre */const crb=crab3(w,3.9,4.9,1.8,.75);/* y un cangrejo que pasea por la derecha */
  const tito=makeTito();tito.scale.setScalar(.62);tito.position.set(-4,0,1.1);tito.rotation.y=-.5;w.sc.add(tito);w.tito=tito;w.pick.push(tito);
  ch.userData.id='chest';w.pick.push(ch);
  // antes de abrirse el cofre "respira" para invitar a tocarlo, y crece un poco con el ratón encima
  let chS=1;
  w.upd.push((dt: number)=>{const op=st.op||0,sh=Math.max(0,1-(T-st.shakeT)*3)*Math.sin(T*50);ch.rotation.z=sh*.06;ch.position.x=sh*.08;
    const sT=st.openT?1:(st.hov?1.07:1)*(1+Math.sin(T*3)*.025);chS+=(sT-chS)*Math.min(1,dt*10);ch.scale.setScalar(chS);
    piv.rotation.x=-op*1.95;lock.visible=op<.15;glow.material.opacity=Math.min(1,op*2)*.9;
    rays.rotation.z=T*.4;rays.children.forEach((r: Nodo)=>r.material.opacity=Math.min(1,op*1.5)*.55);stars.forEach((s,i)=>{s.rotation.y=Math.sin(T*1.2+i)*.55;s.rotation.z=Math.sin(T*.8+i*1.7)*.25;s.position.y=s.userData.y0+Math.cos(T*2+i)*.06});
    if(st.openT&&!prt.userData.cheer){prt.userData.cheer=1;prt.userData.wob=st.openT+.5;squawk(.5);squawk(.95);crb.userData.wob=st.openT+.8}/* el loro celebra que se abre el cofre */
    tito.userData.anim(dt,{hop:st.openT?st.openT+.2:st.hop})});
  wobInit(w);
  camRig(w,V3(0,4.6,10),V3(0,2.05,0),.5);return w}
// montarCofre3D(): pone el cofre del tesoro en 3D en lugar del 2D (SCENES.cofre). La llama mundo3d/mundo3d.ts al montar
// la capa 3D. Desde la fase 4i es otra escena, no una envoltura: copia del cofre 2D (cofre2D, de escenas/zonas.ts, que
// no se toca) la lógica (reward, next, prompt, hint, dwell) y pone su enter, su draw y su down, que llaman a los del 2D
// cuando hace falta la lógica de siempre.
export function montarCofre3D(): void{
const cofre2D=SCENES.cofre;
 SCENES.cofre={...cofre2D,three:true,
  // enter(o): construye el mundo del cofre
  enter(o: Libre){this.hop=null;this.hov=false;cofre2D.enter!.call(this,o);if(sceneName!=='cofre')return;setWorld(buildCofre(this));titoRect(W3!.tito!)},
  // draw(): cada cuadro: ratón sobre el cofre, apertura (this.op), el premio que sale, los toques que faltan (3 círculos) y botones
  draw(){const w=W3;if(w&&w.kind==='cofre')titoRect(w.tito!);
    this.hov=false;if(!this.openT&&VIVO.mouseOn&&!VIVO.drag&&w&&w.kind==='cofre'){const u=pickAt(VIVO.MX,VIVO.MY);if(u&&u.id==='chest'){this.hov=true;VIVO.hovNow='cf:cofre'}}
    if(this.openT){const k=T-this.openT;this.op=clamp(k*2.2,0,1)}
    if(this.openT){const k=T-this.openT,e=clamp((k-.25)/.8,0,1),gy=lerp(520,290,e*e*(3-2*e)),gs=back(e)*260;
      if(e>0){if(this.gift)drawItemPic(this.gift,800,gy,gs);else pic('monedas',800,gy,gs)}
      if(k>1.1&&this.gift){ctx.font=`600 44px ${DF}`;const nm=cap(itemName(this.gift)),tw=ctx.measureText(nm).width;card(800-tw/2-40,96,tw+80,84,'#fff',6,42);text(nm,800,152,44,K,{w:600})}}
    else{for(let i=0;i<3;i++){const on=i<this.taps;circ(740+i*60,830,20,on?'#FFC93C':'#fff',5)}}
    if(this.openT&&T>this.openT+1.4){
      {const s=hv('cf:casa',hC(600,800,74));ctx.save();ctx.translate(600,800);ctx.scale(s,s);circ(0,0,72,'#fff',7);ctx.save();ctx.scale(.3,.3);drawTitoHouse(0,90,houseLevel());ctx.restore();ctx.restore()}
      {const p=(Math.sin(T*4)+1)/2,s=hv('cf:seguir',hC(1000,800,74));ctx.save();ctx.translate(1000,800);ctx.scale(s*(1+p*.05),s*(1+p*.05));ctx.globalAlpha=.35+.3*p;circ(0,0,84,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,72,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(34,0);ctx.lineTo(-20,32);ctx.closePath();fillStroke('#fff',5);ctx.restore()}}
    drawHome();drawCoinHUD();
    if(VIVO.talking){const tp=titoPos(),bx=tp.x+tp.w*.85,by=tp.y-50;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}},
  // down(x,y): antes de abrirse: el cofre (lógica original en el centro), Tito o las flores; después, lógica original
  down(x: number,y: number){if(!this.openT){const u=pickAt(x,y);if(u&&u.id==='chest')return call0(cofre2D.down!,this,800,520);if(u&&u.id==='tito'){this.hop=T;return cofre2D.down!.call(this,x,y)}
      // las flores alrededor del cofre también responden (lejos del cofre, para no quitarle toques)
      if(!u&&!atHome(x,y)&&!inR(x,y,800,520,380,360)&&W3&&wobTap(W3,x,y))return}
    return cofre2D.down!.call(this,x,y)}} satisfies Escena;
 // la casa de Tito por dentro sigue en 2D, pero en su lugar original
}
