// tito.ts: Tito en las escenas 2D (en el mapa 3D lo dibuja mundo3d/mundo3d.ts).
//   TITO, temasDone(), STARS(), FLPOS, FLC, titoKind(), TITO_EYES, TITO_2D, drawTito(), inTito(), ponRopaTito().
// La ropa y los colores comprados en la tienda los pone escenas/tienda.ts con ponRopaTito (si no, Tito sale con su dibujo de
// siempre y sin ropa). Las reglas de temasDone y STARS están en dominio/progreso.ts (temasTerminados y estrellas).
import { K } from '../dibujos/todos.ts';
import { estrellas, temasTerminados } from '../dominio/progreso.ts';
import { card, circ, ell, flower, speaker } from './dibujo.ts';
import { S } from './guardado.ts';
import { IMG } from './imagenes.ts';
import { ctx, T, VIVO } from './pantalla.ts';

/** Una de las cuatro formas de Tito. */
export type FormaTito='caracol'|'erizo'|'tortuga'|'conejo';
/** Opciones de drawTito (ver su comentario). */
export interface OpcionesTito {
  flip?: boolean;
  sq?: number;
  sleep?: boolean;
  mouth?: boolean;
  bubble?: boolean;
  flowers?: number;
  plain?: boolean;
}
/* ---------- Tito ---------- */
// TITO: posición y ancho de Tito en las escenas 2D (abajo a la izquierda).
export const TITO={x:14,y:700,w:226};
// temasDone(): cuántos temas están completos; es el número de flores del caparazón de Tito (temasTerminados).
export const temasDone=(): number=>temasTerminados(S.temas);
// STARS(): número de estrellas: total de juegos terminados en todos los temas (S.temas[id].g; regla estrellas de
// dominio/progreso.ts). Abre artículos de la tienda y hace crecer a Pipo. Desde la fase 4a está aquí (antes en
// escenas/tienda.ts), así que zonas.ts y repaso.ts lo importan del núcleo.
export const STARS=(): number=>estrellas(S.temas);
// FLPOS: sitio de cada flor del caparazón como [ángulo, distancia] desde el centro de las flores (15 como mucho). FLC: sus colores.
export const FLPOS: readonly (readonly [number,number])[]=[[-2.4,58],[-1.9,60],[-1.4,62],[-.9,61],[-.4,60],[-2.9,56],[2.6,52],[-2.15,38],[-1.6,40],[-1.05,40],[-.5,38],[-2.65,36],[2.9,40],[-1.9,22],[-1.2,22]];
export const FLC=['#FF8A7A','#F58BB4','#FFC93C','#9B8AD9','#7FD3F0','#FF6B5E','#FFA94D'];
// personaje de Tito (zona de adultos): 'caracol' (por defecto), 'erizo', 'tortuga' o 'conejo'; ojos [x,y,r], boca y centro de las flores en el dibujo 2D de 240x200
// titoKind(): forma elegida para Tito (S.tito.kind); cualquier valor desconocido cuenta como 'caracol'.
export const titoKind=(): FormaTito=>{const k=S.tito&&S.tito.kind;return k==='erizo'||k==='tortuga'||k==='conejo'?k:'caracol'};
// TITO_EYES: ojos de cada forma, para dibujar el parpadeo encima. TITO_2D: color de la piel (tapa los ojos al parpadear),
// sitio de la boca y [x, y, escala] del centro de las flores.
export const TITO_EYES: Record<FormaTito,readonly (readonly [number,number,number])[]>={caracol:[[174,20,15],[222,20,15]],erizo:[[184,94,13],[210,92,12]],tortuga:[[196,88,11],[220,86,10]],conejo:[[186,94,12],[210,90,11]]},TITO_2D: Record<FormaTito,{skin: string;mouth: readonly [number,number];fl: readonly [number,number,number]}>={caracol:{skin:'#9BD86A',mouth:[206,116],fl:[96,100,1]},erizo:{skin:'#F2D6B0',mouth:[216,124],fl:[98,118,.82]},tortuga:{skin:'#8FD07A',mouth:[216,110],fl:[100,116,.95]},conejo:{skin:'#EDE3D6',mouth:[220,122],fl:[69,142,.5]}};
// titoImgF: da la imagen de Tito con los colores comprados; ropaF(k): le dibuja encima la ropa comprada a escala k.
// Los pone escenas/tienda.ts (titoImg, drawTitoWear) con ponRopaTito; hasta entonces, el dibujo de siempre y sin ropa.
let titoImgF: (()=>HTMLImageElement)|null=null,ropaF: ((k: number)=>void)|null=null;
// ponRopaTito(img, ropa): escenas/tienda.ts dice cómo vestir a Tito: img() da su imagen con los colores comprados y ropa(k) le
// dibuja la ropa encima (k = escala del dibujo de 240x200). Antes era una dependencia hacia delante de core.js.
export function ponRopaTito(img: ()=>HTMLImageElement,ropa: (k: number)=>void): void{titoImgF=img;ropaF=ropa}
// drawTito(x,y,ancho,o): dibuja a Tito en 2D (en el mapa 3D lo dibuja mundo3d/mundo3d.ts) con su balanceo, parpadeo, la boca
// que se abre mientras talking es true, las flores del caparazón y la ropa de la tienda (ropaF, de ponRopaTito).
// Opciones o: flip (mira a la izquierda), sq (aplastado, para saltar), sleep (ojos cerrados), mouth:false (sin boca),
// bubble:false (sin bocadillo de altavoz), flowers (número fijo de flores), plain (sin ropa).
export function drawTito(x: number,y: number,w: number,o: OpcionesTito={}): void{
  const k=w/240,h=200*k,b=Math.sin(T*2.2)*w*.02,i=titoImgF?titoImgF():IMG['tito'] as HTMLImageElement; if(!i.complete)return;
  ctx.save();ctx.translate(x,y+b);
  if(o.flip){ctx.translate(w,0);ctx.scale(-1,1)}
  const sq=o.sq||0;ctx.translate(w/2,h);ctx.scale(1+sq,1-sq);ctx.translate(-w/2,-h);
  // antenas que se mueven
  ctx.drawImage(i,0,0,w,h);
  const blink=o.sleep||((T+.5)%3.9)<.14;
  const tk=titoKind(),D=TITO_2D[tk];
  if(blink)for(const [ex,ey,er] of TITO_EYES[tk]){circ(ex*k,ey*k,(er+1)*k,D.skin,5*k);ctx.beginPath();ctx.moveTo((ex-10)*k,(ey+2)*k);ctx.quadraticCurveTo(ex*k,(ey+(o.sleep?10:7))*k,(ex+10)*k,(ey+2)*k);ctx.lineWidth=4*k;ctx.strokeStyle=K;ctx.stroke()}
  if(VIVO.talking&&o.mouth!==false&&(T*7|0)%2){ell(D.mouth[0]*k,D.mouth[1]*k,11*k,9*k,'#7A2E3A',3.5*k)}
  // flores en el caparazón
  const n=Math.min(FLPOS.length,o.flowers??temasDone());
  for(let j=0;j<n;j++){const [a,r]=FLPOS[j] as readonly [number,number],[fx,fy,fs]=D.fl;flower((fx+Math.cos(a)*r*fs)*k,(fy+Math.sin(a)*r*fs)*k,13*k*(1+Math.sin(T*3+j)*.05),FLC[j%FLC.length] as string,2.5*k)}
  if(ropaF&&!o.plain)ropaF(k);
  ctx.restore();
  if(VIVO.talking&&o.bubble!==false&&!o.flip){const bx=x+w*.92,by=y-30;ctx.globalAlpha=.95;card(bx,by,96,72,'#fff',5,28);ctx.globalAlpha=1;speaker(bx+50,by+36,46+Math.sin(T*12)*4)}
}
// inTito(x,y): ¿el punto toca a Tito? (rectángulo aproximado alrededor de TITO).
export const inTito=(x: number,y: number): boolean=>x>TITO.x&&x<TITO.x+TITO.w&&y>TITO.y-40&&y<TITO.y+TITO.w*.85;
