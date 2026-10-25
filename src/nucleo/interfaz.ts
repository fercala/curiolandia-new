// interfaz.ts: lo común a todas las pantallas y al juego: botón de volver, estrellas de rondas, candado de adultos,
// ayudas automáticas, dificultad adaptativa, tiempo de juego, pegatinas y calendario.
//   HOME, drawHome, atHome, drawRounds, drawLock, drawHelp; nOpts, onRight, ponOnRight, onWrongTwice, nRounds;
//   giveSticker, drawSticker, drawToast; DIAS, DIASL, DIAC, MESES, ESTACIONES, estacionDe.
//   VIVO.lockHold/lockDown/lockPrev, VIVO.ADAPT/REP, VIVO.sessionT/restAsked/minuteAcc y VIVO.toast.
// onRight cambia (ponOnRight): desde fuera de este módulo solo se lee.
import { K } from '../dibujos/todos.ts';
import { card, circ, fillStroke, hand, rr, star, text } from './dibujo.ts';
import { scene } from './escenas.ts';
import { AGE, S, save } from './guardado.ts';
import { V } from './idioma.ts';
import { pic, picG } from './imagenes.ts';
import { ctx, T, VIVO } from './pantalla.ts';
import { hC, hv } from './puntero.ts';
import { SFX } from './sonido.ts';
import { back, clamp, dist, lerp, PI } from './utilidades.ts';

/* ---------- HUD ---------- */
// HOME: botón de la casita (volver) arriba a la izquierda: centro y radio.
export const HOME={x:80,y:80,r:52};
// drawHome(): dibuja el botón de volver (se agranda con el ratón encima).
export function drawHome(): void{const s=hv('home',hC(HOME.x,HOME.y,HOME.r+10));ctx.save();ctx.translate(HOME.x,HOME.y);ctx.scale(s,s);ctx.translate(-HOME.x,-HOME.y);circ(HOME.x,HOME.y,HOME.r,'#fff',6);ctx.beginPath();ctx.moveTo(52,86);ctx.lineTo(80,60);ctx.lineTo(108,86);ctx.lineTo(108,108);ctx.lineTo(52,108);ctx.closePath();fillStroke('#FF8A7A',5);ctx.fillStyle=K;ctx.fillRect(72,90,16,18);ctx.restore()}
// atHome(x,y): ¿se tocó el botón de volver?
export const atHome=(x: number,y: number): boolean=>dist(x,y,HOME.x,HOME.y)<72;
// drawRounds(hechas, total, y): fila de estrellas arriba a la derecha con las rondas del juego. Si la escena tiene
// starPop (el momento T del último acierto), la última estrella ganada hace un "pop".
export function drawRounds(done: number,of: number,y=80): void{
  const w=of*66+30, x=1560-w, pop=scene&&scene.starPop; card(x,y-44,w,88,'#fff',6,44);
  for(let i=0;i<of;i++){const sc=i===done-1&&pop?1+.4*Math.max(0,1-(T-pop)*3):1;star(x+48+i*66,y,25*sc,i<done?'#FFC93C':'#EADFCF',3.5)}
}
// Candado de la zona de adultos (abajo a la derecha): hay que mantenerlo pulsado 3 s. lockDown = se está pulsando;
// lockHold = segundos que lleva, en tiempo real (aunque el aparato vaya a pocos cuadros por segundo); lockPrev = hora
// del cuadro anterior. Lo gestionan pointerdown y frame() en adult.js.
Object.assign(VIVO,{lockHold:0,lockDown:false,lockPrev:0});
// drawLock(): dibuja el candado semitransparente y, mientras se pulsa, un arco que se va llenando.
export function drawLock(): void{
  const x=1546,y=852; ctx.globalAlpha=.45; ctx.fillStyle=K; rr(x-18,y-12,36,28,6); ctx.fill(); ctx.beginPath(); ctx.arc(x,y-12,11,PI,0); ctx.lineWidth=5; ctx.strokeStyle=K; ctx.stroke(); ctx.globalAlpha=1;
  if(VIVO.lockDown){ctx.beginPath();ctx.arc(x,y,40,-PI/2,-PI/2+PI*2*VIVO.lockHold/3);ctx.lineWidth=8;ctx.strokeStyle='#9B8AD9';ctx.stroke()}
}
/* ayuda: brillo y manito */
// drawHelp(): ayuda automática si el niño no hace nada. Pide a la escena su hint(): a los 6 s sin tocar dibuja un brillo
// alrededor; a los 11 s, la manita (siguiendo h.path si lo hay, o moviéndose con h.dx/h.dy) y repite una vez la consigna con scene.prompt().
// idle no cuenta mientras Tito habla (frame) y vuelve a 0 con cada say(): la ayuda nunca corta una frase de Tito.
export function drawHelp(): void{
  if(!scene||!scene.hint||VIVO.drag)return; const h=scene.hint(); if(!h)return;
  if(VIVO.idle>6){const p=(Math.sin(T*5)+1)/2;ctx.save();ctx.globalAlpha=.35+.35*p;ctx.lineWidth=12;ctx.strokeStyle='#FFC93C';ctx.beginPath();ctx.arc(h.x,h.y,(h.r||110)+10+p*12,0,PI*2);ctx.stroke();ctx.restore()}
  if(VIVO.idle>11){const k=(T*1.2)%1;if(h.path&&h.path.length>1){const q=(T*.5)%1,f=q*(h.path.length-1),i=Math.floor(f),a=h.path[i] as number[],b=h.path[Math.min(h.path.length-1,i+1)] as number[];hand(lerp(a[0] as number,b[0] as number,f-i)+20,lerp(a[1] as number,b[1] as number,f-i)+14,90)}else hand(h.x+30-k*20+(h.dx||0)*k,h.y+20-k*10+(h.dy||0)*k,90);
    if(!VIVO.hintSaid&&scene.prompt&&!VIVO.talking){VIVO.hintSaid=true;scene.prompt()}}// nunca mientras Tito habla: cortaría su frase
}
/* adaptativo */
// Dificultad adaptativa (no se guarda en S): ADAPT va de -1 (más fácil) a 1 (más difícil); streak cuenta aciertos a la
// primera seguidos; REP = veces que ya se jugó este juego (0 a 2; lo pone la escena 'juego' de escenas/escenas2d.ts).
let streak=0;
Object.assign(VIVO,{ADAPT:0,REP:0});
// nOpts(): cuántas opciones enseñar en un juego (de 2 a 4): 2 a los 3 años y 3 a los 4 y 5, más ADAPT, y +1 al repetir.
export function nOpts(): number{return clamp((({3:2,4:3,5:3} as Record<number,number>)[AGE()] as number)+VIVO.ADAPT+(VIVO.REP>=1?1:0),2,4)}
// onRight(aLaPrimera): avisar de un acierto; 4 aciertos seguidos a la primera suben la dificultad.
// Es let y no function porque escenas/tienda.ts la envuelve con ponOnRight.
export let onRight=(first: unknown): void=>{if(first){streak++;if(streak>=4){VIVO.ADAPT=Math.min(1,VIVO.ADAPT+1);streak=0}}};
// ponOnRight(f): cambia onRight por otra función (escenas/tienda.ts la envuelve para dar monedas al acertar).
export function ponOnRight(f: typeof onRight): void{onRight=f}
// onWrongTwice(): avisar de que se falló dos veces; baja la dificultad.
export function onWrongTwice(): void{VIVO.ADAPT=Math.max(-1,VIVO.ADAPT-1);streak=0}
// nRounds(): rondas de cada juego: 4 a los 3 años y 5 después; una más a partir de la segunda repetición.
export const nRounds=(): number=>(AGE()<=3?4:5)+(VIVO.REP>=2?1:0);
/* tiempo de juego */
// sessionT: segundos jugados en esta sesión (para S.limit); restAsked: ya se propuso descansar; minuteAcc: segundos aún
// no apuntados en S.days. Los usa frame() en adult.js.
// La sesión sigue al recargar la página: si S.ses ({t: segundos, at: hora en ms}, se guarda cada 15 s) es de hace menos
// de 30 min, sessionT sigue desde ahí. Así recargar no se salta el límite de tiempo («a dormir»).
Object.assign(VIVO,{sessionT:((): number=>{const s=S.ses,ago=s&&Date.now()-s.at;return s&&isFinite(+s.t)&&typeof ago==='number'&&ago>=0&&ago<30*60e3?+s.t:0})(),restAsked:false,minuteAcc:0});

/* ---------- pegatinas ---------- */
// toast: aviso de "¡Pegatina nueva!" que se ve unos segundos: {k: dibujo, t: momento T en que salió, x, y opcionales}.
Object.assign(VIVO,{toast:null});
// giveSticker(dibujo, ya): da una pegatina (suma 1 en S.stk y guarda), enseña el aviso y suena un brillo. Devuelve la clave.
// ya = true: la pegatina ya se sumó antes (premio guardado al momento); solo enseña el aviso.
export function giveSticker(k: string,ya?: boolean): string{if(!ya){S.stk[k]=(S.stk[k]||0)+1;save()}VIVO.toast={k,t:T};setTimeout(()=>SFX.sparkle(),300);return k}
// drawSticker(dibujo,x,y,tamaño,giro,gris): pegatina redonda con sombra; gris = una que aún no se tiene.
export function drawSticker(k: string,x: number,y: number,s: number,rot=0,grey?: boolean): void{ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.shadowColor='rgba(74,52,40,.25)';ctx.shadowBlur=s*.08;ctx.shadowOffsetY=s*.04;
  circ(0,0,s*.55,'#fff',0);ctx.shadowColor='transparent';circ(0,0,s*.55,null,3,'#EADFCF');if(grey){ctx.globalAlpha=.25;picG(k,0,0,s*.86);ctx.globalAlpha=1}else pic(k,0,0,s*.86);ctx.restore()}
// drawToast(): dibuja el aviso de pegatina nueva: entra con rebote, se queda y se va a los 2,8 s.
export function drawToast(): void{const toast=VIVO.toast;if(!toast)return;const k=T-toast.t;if(k>2.8){VIVO.toast=null;return}
  const a=k<.3?back(k/.3):k>2.4?1-(k-2.4)/.4:1;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(toast.x||800,toast.y||180);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));
  card(-230,-80,460,160,'#FFF6E6',6,40);drawSticker(toast.k,-140,0,130,Math.sin(T*4)*.1);text(V(['¡Figurita nueva!','¡Pegatina nueva!']),60,14,38,K);ctx.restore()}

/* ---------- calendario ---------- */
// Calendario: DIAS empieza en domingo (como getDay()); DIASL en lunes; DIAC es el color de cada día (desde el lunes).
export const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
export const DIASL=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
export const DIAC=['#FF8A7A','#FFA94D','#FFD66B','#7CC86E','#5BB8E6','#9B8AD9','#F58BB4'];
export const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export const ESTACIONES=['primavera','verano','otoño','invierno'];
// estacionDe(fecha): estación ('primavera', 'verano', 'otoño' o 'invierno') según la fecha (cambia hacia el día 21
// de marzo, junio, septiembre y diciembre) y el hemisferio S.hemi (en el sur se invierte).
export function estacionDe(d=new Date()): string{
  const m=d.getMonth()+1,dd=d.getDate(),v=m*100+dd;
  let e=v>=1221||v<321?'invierno':v<621?'primavera':v<923?'verano':'otoño';
  if(S.hemi==='S')e=({invierno:'verano',verano:'invierno',primavera:'otoño',otoño:'primavera'} as Record<string,string>)[e] as string;
  return e;
}
