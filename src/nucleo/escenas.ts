// escenas.ts: las escenas (pantallas) del juego, los temporizadores de escena y las partículas.
//   SCENES, scene, sceneName, sceneArg, sceneTok, go(), ponGo(), REP_ON, ponRepOn(), later(), whenQuiet(), parts,
//   burst(), sparkles(), heart(), drawParts(); VIVO.fade, VIVO.timers, VIVO.idle, VIVO.hintSaid, VIVO.drag.
// scene, sceneName, sceneArg, sceneTok, parts, go y REP_ON cambian: desde fuera de este módulo solo se leen (go cambia
// con ponGo y REP_ON con ponRepOn).
// sayQ (decir algo cuando Tito calle) está en voz.ts, porque usa say().
import { star, circ } from './dibujo.ts';
import { ctx, DF, T, VIVO } from './pantalla.ts';
import { setCursor } from './puntero.ts';
import { ponMusica } from './sonido.ts';
import type { Escena, Libre, Particula } from './tipos.ts';
import { pick, PI, rnd } from './utilidades.ts';
// azar(): el azar del juego (puerto de aplicacion/puertos.ts, desde la fase 3g; antes Math.random()).
import { azar } from '../aplicacion/puertos.ts';

/* ---------- escenas, temporizadores, partículas ---------- */
/* SISTEMA DE ESCENAS
   Cada pantalla del juego es una "escena": un objeto guardado en SCENES[nombre] (aquí; las rellenan escenas/escenas2d.ts, escenas/zonas.ts, escenas/tienda.ts,
   escenas/repaso.ts, los de mundo3d/...). Lo que puede tener una escena (todo opcional salvo draw):
     enter(o)      al entrar; o son las opciones que se pasaron a go().
     update(dt)    en cada cuadro, antes de dibujar (dt = segundos desde el cuadro anterior).
     draw()        dibuja la escena en la pantalla lógica de 1600x900.
     down(x,y) / move(x,y) / up(x,y)   tocar, mover y soltar (dedo o ratón), en coordenadas lógicas.
     hint()        devuelve {x,y,r} (o un path) de lo que hay que tocar, para la ayuda si el niño no hace nada.
     prompt()      repite la consigna cuando aparece la manita de ayuda.
     dwell(id)     el ratón se quedó quieto sobre el elemento id (suele decir su nombre).
     music         clave de MUSIC; three: true si la escena se dibuja en 3D (la capa 3D, mundo3d/); starPop (ver drawRounds).
   Variables: scene (escena actual), sceneName (su nombre), sceneArg (opciones de go), sceneTok (sube con cada cambio
   de escena y anula temporizadores y callbacks de la anterior), T (segundos desde el arranque; para animar),
   fade (velo de transición, de 1 a 0), timers (de later), parts (partículas), idle (segundos sin tocar; activa
   las ayudas), hintSaid (ya se repitió la consigna), drag (lo que se está arrastrando, o null). */
// SCENES: todas las escenas por nombre. Empieza vacío: cada archivo del juego añade las suyas (SCENES.map={...}).
export const SCENES: Record<string,Escena>={};
export let scene: Escena|null=null,sceneName='',sceneTok=0,parts: Particula[]=[],sceneArg: Libre={};
Object.assign(VIVO,{fade:0,timers:[],idle:0,hintSaid:false,drag:null});
// later(ms, fn): ejecuta fn dentro de ms milisegundos, pero solo si se sigue en la misma escena. Dentro de las escenas
// usa esto en vez de setTimeout: lo cuenta frame() con el reloj del juego y go() lo anula.
export function later(ms: number,fn: ()=>void): void{VIVO.timers.push({t:ms/1000,fn,tok:sceneTok})}
// whenQuiet(fn, max): llama a fn en cuanto Tito calla (talking false), o como mucho a los max segundos (8) por si la
// voz se queda colgada. Va con later(), así que si se cambia de escena mientras espera, fn no se llama.
export function whenQuiet(fn: ()=>void,max=8): void{const t0=T,chk=(): void=>{if(!VIVO.talking||T-t0>max)fn();else later(100,chk)};chk()}
// REP_ON: true mientras se juega un juego lanzado desde el repaso del día (SCENES.repaso, en escenas/repaso.ts): al
// terminarlo, finishGame (escenas/escenas2d.ts) lo marca hecho en el repaso y la casita vuelve al repaso. Desde la fase
// 4b está aquí (antes en escenas/repaso.ts, que se carga después de finishGame); lo cambian escenas/repaso.ts y la
// casita (escenas/zonas.ts) con ponRepOn, go lo apaga al salir del repaso y lo leen también las pruebas.
export let REP_ON=false;
// ponRepOn(v): pone REP_ON a v (escenas/repaso.ts: true al lanzar un juego del repaso; la casita, false al volver).
export function ponRepOn(v: boolean): void{REP_ON=v}
// go(nombre, o): cambia a la escena SCENES[nombre]. Anula temporizadores, partículas, arrastre y voz de la escena anterior,
// pone el velo de transición (fade=1), elige la música (scene.music) y llama a enter(o) de la nueva escena.
// Si SCENES[nombre] no existe, avisa en la consola y no cambia de escena.
// Si se está jugando un juego del repaso (REP_ON) y se va a otro sitio que no sea la vuelta normal (un atajo de la
// zona de adultos al mapa, a una zona o a otro tema con hello), se olvida el repaso: si no, la siguiente casita que se
// abriera saltaría al repaso. (Desde la fase 4c está aquí; antes escenas/repaso.ts envolvía go para hacerlo.)
// Ejemplos: go('map',{hello:true}) vuelve al mapa saludando; go('casita',{t:idTema}) abre un tema.
// Es let y no function porque las pruebas la envuelven con ponGo (tests/regresion/camino.js; hasta la fase 4k también la
// capa 3D, mundo3d/interaccion.ts).
export let go=(n: string,o: Libre={}): void=>{
  if(REP_ON&&(n!=='juego'&&n!=='casita'||o.hello))REP_ON=false;
  const e=SCENES[n];
  if(!e){console.warn('go: no existe la escena',n);return}// nombre mal escrito: se queda en la escena actual en vez de romperse
  sceneTok++; VIVO.timers=[]; parts=[]; VIVO.idle=0; VIVO.hintSaid=false; VIVO.drag=null; setCursor('pt');
  try{speechSynthesis.cancel()}catch(e){} VIVO.talking=false;
  sceneName=n; sceneArg=o; scene=e; VIVO.fade=1; ponMusica(e.music||null); if(e.enter)e.enter(o);
};
// ponGo(f): cambia go por otra función. Solo la usan las pruebas (tests/regresion/camino.js, para apuntar las escenas; ver
// docs/CONTRATO-PRUEBAS.md); el juego ya no envuelve go (hasta la fase 4k, mundo3d/interaccion.ts, y hasta la 4c,
// escenas/repaso.ts). La envoltura llama a la de antes, que guarda antes de llamar a ponGo.
export function ponGo(f: typeof go): void{go=f}
/* PARTÍCULAS. parts es una lista de objetos {x, y, vx, vy (velocidad en px/s), life (segundos que dura), t (edad),
   c (color), r (tamaño), rot (giro), g (gravedad; 900 si no se da; 0 = flota), k (tipo)}.
   Tipos k: 's' estrella; 'c' confeti (rectángulo que gira; es lo que se dibuja con cualquier otro valor); 'd' punto;
   'h' corazón; 'o' onda (anillo que se agranda, como en el agua); 'n' nota musical; 't' texto que sube (p.tx; con
   hl la primera letra va en rojo y con dots salen puntitos debajo para contar); 'z' una "z" de dormir.
   Cualquier archivo puede añadir partículas con parts.push({...}); drawParts() las mueve, dibuja y borra al caducar.
   go() vacía la lista. */
// burst(x,y,n,colores): explosión de n confetis y estrellas desde (x,y), para aciertos y premios.
export function burst(x: number,y: number,n=24,cols: readonly string[]=['#FFC93C','#F58BB4','#7CC86E','#5B8DEF','#FF8A7A','#9B8AD9']): void{
  for(let i=0;i<n;i++){const a=rnd(0,PI*2),v=rnd(200,620);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,life:rnd(.8,1.5),t:0,c:pick(cols),r:rnd(7,15),rot:rnd(0,6),k:azar()<.35?'s':'c'})}
}
// heart(x,y,radio,color): corazón relleno (partículas de tipo 'h').
function heart(x: number,y: number,r: number,f: string): void{/* corazoncito para las partículas */ctx.beginPath();ctx.moveTo(x,y+r*.9);ctx.bezierCurveTo(x-r*1.4,y,x-r*.7,y-r*1.1,x,y-r*.35);ctx.bezierCurveTo(x+r*.7,y-r*1.1,x+r*1.4,y,x,y+r*.9);ctx.fillStyle=f;ctx.fill()}
// sparkles(x,y,n): unos pocos brillos (estrellas) que suben flotando, sin gravedad.
export function sparkles(x: number,y: number,n=6): void{for(let i=0;i<n;i++)parts.push({x:x+rnd(-20,20),y:y+rnd(-20,20),vx:rnd(-80,80),vy:rnd(-160,-40),life:rnd(.4,.8),t:0,c:pick(['#FFC93C','#FFF3B0','#F58BB4']),r:rnd(6,11),rot:0,k:'s',g:0})}
// drawParts(dt): mueve cada partícula (velocidad y gravedad), la dibuja según su tipo k, la vuelve transparente al
// envejecer y quita las caducadas. La llama frame() en cada cuadro, encima de la escena.
export function drawParts(dt: number): void{
  for(const p of parts){p.t+=dt;p.vy+=(p.g??900)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot=(p.rot as number)+dt*6;const rot=p.rot;// sin rot queda NaN y rotate() no gira, como antes
    const a=1-p.t/p.life; if(a<=0)continue; ctx.globalAlpha=a;
    if(p.k==='s')star(p.x,p.y,p.r,p.c,0); else if(p.k==='d'){circ(p.x,p.y,p.r,p.c,0)} else if(p.k==='h'){heart(p.x,p.y,p.r,p.c)} else if(p.k==='o'){const q=1+p.t/p.life*2;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*q,p.r*.42*q,0,0,PI*2);ctx.lineWidth=3;ctx.strokeStyle=p.c;ctx.stroke()} else if(p.k==='n'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(rot*.5)*.3);ctx.lineWidth=3;ctx.strokeStyle='#FFFFFF';ctx.fillStyle=p.c;ctx.beginPath();ctx.ellipse(0,0,p.r*.55,p.r*.4,-.4,0,PI*2);ctx.stroke();ctx.fill();ctx.fillRect(p.r*.38,-p.r*1.7,p.r*.18,p.r*1.7);ctx.beginPath();ctx.moveTo(p.r*.56,-p.r*1.7);ctx.quadraticCurveTo(p.r*1.2,-p.r*1.3,p.r*.95,-p.r*.8);ctx.lineWidth=p.r*.16;ctx.strokeStyle=p.c;ctx.stroke();ctx.restore()} else if(p.k==='t'){/* un número que sube flotando al contar, y entra con un saltito */const q=Math.min(1,p.t/.18),sc=.5+.5*q+Math.sin(q*PI)*.25;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);ctx.font=`800 ${p.r*2}px ${DF}`;ctx.textAlign='center';ctx.lineWidth=7;ctx.lineJoin='round';ctx.strokeStyle='#FFFFFF';ctx.strokeText(p.tx as string,0,0);ctx.fillStyle=p.c;if(p.hl){/* la primera letra de la palabra, en rojo, como en Letrilandia */const tx=p.tx as string,W=ctx.measureText(tx).width,w1=ctx.measureText(tx[0] as string).width;ctx.textAlign='left';ctx.fillText(tx.slice(1),-W/2+w1,0);ctx.fillStyle='#E84A4A';ctx.fillText(tx[0] as string,-W/2,0)}else ctx.fillText(p.tx as string,0,0);if(p.dots){/* debajo del número, tantos puntitos como dice, para verlo de un vistazo */const n=p.dots,r1=n>5?2:1,per=Math.ceil(n/r1);for(let i=0;i<n;i++){const row=Math.floor(i/per),col=i%per,cn=row?n-per:per;ctx.beginPath();ctx.arc((col-(cn-1)/2)*22,24+row*22,8,0,PI*2);ctx.fillStyle=p.c;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke()}}ctx.restore()} else if(p.k==='z'){ctx.font=`700 ${p.r*2}px ${DF}`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#5F6FB4';ctx.strokeText('z',p.x,p.y);ctx.fillStyle=p.c;ctx.fillText('z',p.x,p.y)} else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(rot);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore()}
  } ctx.globalAlpha=1; parts=parts.filter(p=>p.t<p.life);
}
