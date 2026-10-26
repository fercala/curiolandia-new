// dibujo.ts: lo básico para dibujar en el lienzo (ctx) de la pantalla lógica de 1600x900.
//   rr, fillStroke, card, circ, ell, text, star, hand, speaker, sky, cloud, flower y, desde la fase 4o, tree (un árbol según la estación).
import { K } from '../dibujos/todos.ts';
import { IMG } from './imagenes.ts';
import { ctx, DF, H, T, W } from './pantalla.ts';
import { PI } from './utilidades.ts';

/** Opciones de text(): grosor de letra, fuente, alineación, línea base y contorno (grosor y color). */
export interface OpcionesTexto {
  w?: number|string;
  f?: string;
  al?: CanvasTextAlign;
  bl?: CanvasTextBaseline;
  st?: number;
  sc?: string;
}
/* ---------- dibujo básico ---------- */
// rr(x,y,ancho,alto,radio): traza (sin pintarlo) un rectángulo con esquinas redondeadas; después hay que rellenar o bordear.
export function rr(x: number,y: number,w: number,h: number,r: number): void{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
// fillStroke(relleno, grosor, colorBorde): rellena y/o bordea el trazo actual. relleno null = solo borde; grosor 0 = sin borde.
export function fillStroke(f: string|CanvasGradient|CanvasPattern|null|undefined,lw=6,s: string=K): void{if(f){ctx.fillStyle=f;ctx.fill()} if(lw){ctx.lineWidth=lw;ctx.strokeStyle=s;ctx.lineJoin='round';ctx.stroke()}}
// card(x,y,w,h,relleno,grosor,radio,borde): tarjeta redondeada con borde; (x,y) es la esquina de arriba a la izquierda.
export function card(x: number,y: number,w: number,h: number,f: string|CanvasGradient|null='#fff',lw=6,r=36,s: string=K): void{rr(x,y,w,h,r);fillStroke(f,lw,s)}
// circ(x,y,radio,relleno,grosor,borde): círculo con relleno y borde.
export function circ(x: number,y: number,r: number,f: string|CanvasGradient|null|undefined,lw=6,s: string=K): void{ctx.beginPath();ctx.arc(x,y,r,0,PI*2);fillStroke(f,lw,s)}
// ell(x,y,rx,ry,relleno,grosor,borde): elipse.
export function ell(x: number,y: number,rx: number,ry: number,f: string|CanvasGradient|null|undefined,lw=6,s: string=K): void{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI*2);fillStroke(f,lw,s)}
// text(texto,x,y,tamaño,color,o): escribe texto. Opciones o: w (grosor de letra), f (fuente), al (alineación),
// bl (línea base), st (grosor del contorno; sin él no hay contorno), sc (color del contorno).
export function text(t: string|number,x: number,y: number,size: number,color: string|CanvasGradient=K,o: OpcionesTexto={}): void{
  ctx.font=`${o.w||700} ${size}px ${o.f||DF}`; ctx.textAlign=o.al||'center'; ctx.textBaseline=o.bl||'alphabetic';
  if(o.st){ctx.lineJoin='round';ctx.lineWidth=o.st;ctx.strokeStyle=o.sc||K;ctx.strokeText(t as string,x,y)}
  ctx.fillStyle=color; ctx.fillText(t as string,x,y);
}
// star(x,y,radio,relleno,grosor): estrella de 5 puntas (rondas, premios, partículas).
export function star(x: number,y: number,r: number,f: string|null,lw?: number): void{ctx.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,q=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}ctx.closePath();fillStroke(f,lw??r*.13)}
// hand(x,y,ancho,giro): la manita que señala en las ayudas; (x,y) queda cerca de la punta del dedo.
export function hand(x: number,y: number,w: number,rot=-.2): void{const i=IMG['hand'] as HTMLImageElement;if(!i.complete)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(i,-w*.47,0,w,w*1.37);ctx.restore()}
// speaker(x,y,tamaño,color): icono de altavoz (bocadillo de Tito mientras habla, botones de volver a escuchar).
export function speaker(x: number,y: number,s: number,c: string=K): void{ctx.save();ctx.translate(x,y);ctx.scale(s/60,s/60);ctx.beginPath();ctx.moveTo(-24,-8);ctx.lineTo(-12,-8);ctx.lineTo(4,-21);ctx.lineTo(4,21);ctx.lineTo(-12,8);ctx.lineTo(-24,8);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle=c;ctx.lineCap='round';ctx.beginPath();ctx.arc(6,0,12,-.9,.9);ctx.stroke();ctx.beginPath();ctx.arc(6,0,22,-.9,.9);ctx.stroke();ctx.restore()}
// sky(colorArriba, colorAbajo): pinta todo el fondo con un degradado vertical.
export function sky(top: string,bot: string): void{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
// cloud(x,y,escala,color): nube hecha con 4 círculos.
export function cloud(x: number,y: number,s: number,c='#fff'): void{ctx.fillStyle=c;for(const [a,b,r] of [[0,0,40],[40,-18,46],[86,0,38],[44,12,40]] as const){ctx.beginPath();ctx.arc(x+a*s,y+b*s,r*s,0,PI*2);ctx.fill()}}
// flower(x,y,radio,color,grosor): flor de 5 pétalos con centro amarillo (las del caparazón de Tito).
// Nota: T*.0 vale siempre 0, así que la flor no gira.
export function flower(x: number,y: number,r: number,c: string,lw=3): void{for(let i=0;i<5;i++){const a=i*PI*2/5+T*.0;circ(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.5,c,lw)}circ(x,y,r*.42,'#FFD66B',lw)}
// tree(x, y, s, season): dibuja un árbol en (x, y) a escala s según la estación: 'invierno' (ramas con nieve),
// 'primavera' (flores), 'verano' (frutas), 'otoño' (hojas caídas) o 'gris' (zona dormida). Lo usan el mapa, las zonas,
// la asamblea (pregunta de las estaciones), los temas y el mundo 3D. Hasta la fase 4o estaba en escenas/escenas2d.ts.
export function tree(x: number,y: number,s: number,season: string){ctx.save();ctx.translate(x,y);ctx.scale(s,s);card(-12,-10,24,90,'#A86B43',6,6);
  if(season==='invierno'){ctx.lineWidth=8;ctx.strokeStyle='#A86B43';ctx.lineCap='round';for(const [a,b,c,d] of[[0,-10,-40,-70],[0,-10,40,-80],[0,-30,0,-100],[-40,-70,-60,-90],[40,-80,60,-96]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke()}for(const [a,b] of[[-40,-74],[40,-84],[0,-104]])ell(a,b,18,8,'#fff',3)}
  else{const c=season==='gris'?'#C9CFC2':season==='otoño'?'#FFA94D':season==='verano'?'#5FA84E':'#8FD67F';circ(0,-80,74,c,6);
    if(season==='primavera')for(let i=0;i<7;i++)flower(Math.cos(i*.9)*44,-80+Math.sin(i*.9)*40,11,'#F58BB4',2);
    if(season==='verano')for(let i=0;i<5;i++)circ(Math.cos(i*1.3)*40,-80+Math.sin(i*1.3)*36,10,'#FF5A5A',3);
    if(season==='otoño')for(let i=0;i<4;i++){ell(-60+i*40,60+Math.sin(i)*6,12,6,i%2?'#FF6B5E':'#C98A4B',2)}}
  ctx.restore()}
