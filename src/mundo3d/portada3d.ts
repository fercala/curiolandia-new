/*
 * mundo3d/portada3d.ts: la portada en 3D (desde la fase 4h; antes, en mundo3d/mundo3d.ts): buildTitle monta la isla
 * pequeña con flores, un árbol, Tito, mariposas o luciérnagas, pétalos y los «?» que suben.
 * montarPortada3D() (la llama mundo3d/mundo3d.ts al montar la capa 3D) pone en SCENES.title la portada 3D, otra escena
 * hecha a partir de la 2D (desde la fase 4i; antes la envolvía): enter monta el mundo y draw pinta encima el logo, el
 * botón de jugar y los botones de abajo.
 * Exporta: montarPortada3D. Importa: del núcleo y de escenas/escenas2d.ts lo que dibuja la portada; el motor, las
 * piezas y lo de los demás módulos de mundo3d/.
 */
import * as THREE from 'three';
import type { Escena, Libre } from '../nucleo/tipos.ts';
import type { Nodo } from './tipos.ts';
import { K } from '../dibujos/todos.ts';
import { FLC, LF, PI, S, SCENES, T, VIVO, card, circ, ctx, fillStroke, hC, hR, hv, text } from '../nucleo/indice.ts';
import { LOGOC, drawLogo, pill, standalone } from '../escenas/escenas2d.ts';
import { W3, camRig, newWorld, projO, setWorld } from './motor.ts';
import { Cyl, V3, canvasTex, gradTex, mk, spr } from './materiales.ts';
import { bush3, butterfly3, fallPts, fireflies, flower3, tree3 } from './decorado.ts';
import { makeTito } from './personajes.ts';
import { skyNow } from './cielo.ts';

/* ================= LA PORTADA ================= */
// buildTitle(): mundo 3D de la portada: isla pequeña con flores, árbol, Tito, mariposas o luciérnagas, pétalos y «?» que suben
function buildTitle(){const w=newWorld({fov:34,kind:'title',shadow:10}),nt=skyNow().night;w.sc.background=nt?gradTex('#F8DCCF','#5F6FB4','titleBgN'):gradTex('#FFF6E6','#FCE3C0','titleBg');// de noche, cielo de anochecer
  mk(Cyl(5.2,5.5,.7,48),'#BFE6A0',{p:[0,-.35,0],s:[1,1,.75],to:w.sc,ol:.1});mk(Cyl(5.6,4.2,1.6,48),'#D9A86C',{p:[0,-1.45,0],s:[1,1,.75],to:w.sc,ol:.1});
  for(let i=0;i<9;i++){const a=i/9*PI*2;flower3(w.sc,Math.cos(a)*4.3,Math.sin(a)*3,FLC[i%7],.8)}
  tree3(w.sc,-3.6,-1.6,.8,'primavera');bush3(w.sc,3.5,-1.4,.9);
  const tito=makeTito();tito.position.set(-.3,0,.6);tito.rotation.y=-.25;w.sc.add(tito);w.tito=tito;
  if(nt){w.sc.children.forEach((o: Nodo)=>{if(o.isLight)o.intensity!*=.85});fireflies(w,14,8,1)}else butterfly3(w,-3.2,-1,'#FF8FB1',0,{s:1,h:2.6,r:1.8});fallPts(w,24,['#FFB3C7','#FFD1DC','#FFFFFF'],{size:.7,map:canvasTex(32,32,()=>{ctx.beginPath();ctx.ellipse(16,16,13,7,.6,0,PI*2);ctx.fillStyle='#fff';ctx.fill()},'leaf'),sp:.45,sw:.8,h:7,wx:18,wz:8,cx:2,cz:-1});/* pétalos */if(!nt)butterfly3(w,4.2,-.5,'#7FD3F0',3,{s:1,h:1.6,r:1.8});// mariposas en la portada
  const qs: THREE.Sprite[]=[];for(let i=0;i<10;i++){const s=spr(canvasTex(128,128,()=>text('?',64,108,120,LOGOC[i%LOGOC.length],{st:8,sc:'#fff'}),'q'+i),.9,.9,{p:[-8+i*1.8,1+(i*53%7)*.8,-3-(i%3)*1.5],to:w.sc,op:.8});qs.push(s)}
  w.upd.push((dt: number)=>{tito.userData.anim(dt,{});tito.rotation.y=-.25+Math.sin(T*.5)*.35;qs.forEach((q,i)=>{q.position.y+=dt*(.3+(i%3)*.15);if(q.position.y>8)q.position.y=-1;q.material.rotation=Math.sin(T+i)*.2;
    // al pasar por detrás del título y del subtítulo se desvanecen para que se lean bien
    if(W3===w){const [x,y]=projO(q),tt=x>470&&x<1270&&y>40&&y<330;q.material.opacity+=((tt?.08:.8)-q.material.opacity)*Math.min(1,dt*6)}})});
  camRig(w,V3(3.2,3.8,12.5),V3(2.6,2.1,0),.6);return w}
// montarPortada3D(): pone la portada en 3D en lugar de la 2D (SCENES.title). La llama mundo3d/mundo3d.ts al montar la
// capa 3D. Desde la fase 4i, la portada 3D es otra escena, no una envoltura: copia de la 2D (portada2D, que no se toca)
// lo que es igual (update, down: los toques van a los mismos sitios) y pone su enter (el de la 2D y luego el mundo) y
// su draw (encima del mundo, el logo, el botón de jugar y los botones de abajo).
export function montarPortada3D(): void{
const portada2D=SCENES.title;
 SCENES.title={...portada2D,three:true,
  // enter(o): prepara la portada como la 2D y monta el mundo 3D
  enter(o: Libre){portada2D.enter!.call(this,o);setWorld(buildTitle())},
  // draw(): encima del mundo, el logo, el subtítulo, «3D», el botón de jugar y los de abajo, pantalla completa e instalar
  draw(){drawLogo(800,200,140);
    text('Tito y las preguntas escondidas',800,280,44,K,{w:600,st:10,sc:'#FFF6E6'});
    {ctx.save();text('3D',1180,150,54,'#fff',{f:LF,st:12,sc:'#9B8AD9'});ctx.restore()}
    const p=hv('play',hC(1180,560,120))*(1+Math.sin(T*4)*.05);ctx.save();ctx.translate(1180,560);ctx.scale(p,p);circ(0,0,110,'#7CC86E',8);ctx.beginPath();ctx.moveTo(-30,-48);ctx.lineTo(54,0);ctx.lineTo(-30,48);ctx.closePath();fillStroke('#fff',6);ctx.restore();
    if(S.age){pill(205,830,330,80,S.name?'Juega: '+S.name:'¿Quién juega?');pill(1395,830,330,80,'Empezar de nuevo','#fff','#C0473C')}
    if(document.fullscreenEnabled&&!standalone()){const s=hv('fs',hR(1515,85,90,90));ctx.save();ctx.translate(1515,85);ctx.scale(s,s);card(-45,-45,90,90,'#fff',6,28);ctx.lineWidth=7;ctx.strokeStyle=K;ctx.lineCap='round';ctx.beginPath();for(const[a,b,c,d]of[[-25,-10,-25,-25],[-25,-25,-10,-25],[25,-25,10,-25],[25,-25,25,-10],[-25,10,-25,25],[-25,25,-10,25],[25,25,10,25],[25,25,25,10]]){ctx.moveTo(a,b);ctx.lineTo(c,d)}ctx.stroke();ctx.restore()}
    if(VIVO.deferredInstall&&!standalone())pill(185,85,300,74,'Instalar el juego','#FFE08A',K,30)}} satisfies Escena;
}
