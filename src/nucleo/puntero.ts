// puntero.ts: el ratón (o el dedo) en la pantalla lógica: pasar por encima y cursores dibujados a mano.
//   VIVO.MX, VIVO.MY, VIVO.mouseOn, VIVO.hovNow..., hR, hC, hv, setCursor.
// Los eventos (pointerdown, pointermove...) están en adult.js, que rellena VIVO.MX/MY/mouseOn.
// Al cargar el módulo dibuja los dos cursores y pone el de la mano.
import { K } from '../dibujos/todos.ts';
import { cv, VIVO } from './pantalla.ts';
import { dist } from './utilidades.ts';

/* ---------- puntero: ratón grande, pasar por encima ---------- */
// Puntero en coordenadas lógicas (1600x900): MX/MY posición; mouseOn solo es true con ratón (con el dedo no hay "pasar por encima").
// hovNow: id de lo que está bajo el ratón en este cuadro (lo apunta hv() al dibujar); hovPrev, hovT y dwellDone sirven para
// el sonidito al pasar por encima y para decir el nombre si el ratón se queda quieto (hoverTick() en adult.js).
Object.assign(VIVO,{MX:-9,MY:-9,mouseOn:false,hovNow:null,hovPrev:null,hovT:0,dwellDone:false});
// hR(x,y,w,h): ¿el ratón está dentro del rectángulo centrado en (x,y)? Nunca con el dedo ni mientras se arrastra.
export const hR=(x: number,y: number,w: number,h: number): boolean=>VIVO.mouseOn&&!VIVO.drag&&Math.abs(VIVO.MX-x)<w/2&&Math.abs(VIVO.MY-y)<h/2;
// hC(x,y,r): ¿el ratón está dentro del círculo de centro (x,y) y radio r?
export const hC=(x: number,y: number,r: number): boolean=>VIVO.mouseOn&&!VIVO.drag&&dist(VIVO.MX,VIVO.MY,x,y)<r;
// hv(id, encima): si encima es cierto, apunta id como lo que hay bajo el ratón y devuelve 1.07 (escala para agrandarlo un poco);
// si no, devuelve 1. Uso típico al dibujar un botón: const s=hv('boton',hC(x,y,r)).
export function hv(id: unknown,hit: unknown): number{if(hit){VIVO.hovNow=id;return 1.07}return 1}
// CUR: cursores dibujados a mano (pt = mano que señala, grab = puño al arrastrar); curMode: el que está puesto.
const CUR: Record<string,string>={};let curMode='';
// makeCursors(): dibuja los dos cursores en un lienzo de 48x48 y los convierte en imagen para el CSS. Si falla, usa los del sistema.
(function makeCursors(): void{
  // mk(dibujo, x, y): crea un cursor con su punto activo en (x,y).
  const mk=(draw: (g: CanvasRenderingContext2D)=>void,hx: number,hy: number): string=>{const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d') as CanvasRenderingContext2D;draw(g);return `url(${c.toDataURL()}) ${hx} ${hy}, pointer`};
  // pt: mano blanca con el índice levantado.
  const pt=(g: CanvasRenderingContext2D): void=>{g.lineJoin='round';g.lineCap='round';g.lineWidth=3;g.strokeStyle=K;g.fillStyle='#fff';
    g.beginPath();g.moveTo(15,3);g.quadraticCurveTo(21,0,22,7);g.lineTo(22,20);g.lineTo(34,20);g.quadraticCurveTo(43,21,43,30);g.lineTo(42,36);g.quadraticCurveTo(40,45,30,45);g.lineTo(18,45);g.quadraticCurveTo(8,44,7,34);g.lineTo(7,26);g.quadraticCurveTo(7,22,11,22);g.lineTo(11,7);g.quadraticCurveTo(11,2,15,3);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(28,21);g.lineTo(28,29);g.moveTo(35,22);g.lineTo(35,30);g.stroke()};
  // fist: puño amarillo (mientras se arrastra).
  const fist=(g: CanvasRenderingContext2D): void=>{g.lineJoin='round';g.lineWidth=3;g.strokeStyle=K;g.fillStyle='#FFE08A';
    g.beginPath();g.moveTo(8,18);g.quadraticCurveTo(8,10,16,10);g.lineTo(36,10);g.quadraticCurveTo(44,10,44,20);g.lineTo(44,32);g.quadraticCurveTo(44,44,30,44);g.lineTo(18,44);g.quadraticCurveTo(8,44,8,32);g.closePath();g.fill();g.stroke();
    g.beginPath();for(const x of[17,26,35]){g.moveTo(x,10);g.lineTo(x,22)}g.stroke()};
  try{CUR['pt']=mk(pt,15,3);CUR['grab']=mk(fist,24,24)}catch(e){CUR['pt']='pointer';CUR['grab']='grabbing'}
})();
// setCursor('pt' o 'grab'): cambia el cursor del lienzo (solo si cambia, para no tocar el CSS en cada cuadro).
export function setCursor(m: string): void{if(m!==curMode){curMode=m;cv.style.cursor=CUR[m]||'pointer'}}
setCursor('pt');
