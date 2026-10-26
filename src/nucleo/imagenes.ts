// imagenes.ts: los dibujos de src/dibujos/ convertidos en imágenes listas para pintar en el lienzo.
//   IMG, IMGG, svgImg(), greyOf(), pic(), picG().
// Al cargar el módulo crea una imagen por cada dibujo de PICS y las de los personajes (Tito, Lupi, las gafas, la mano).
// De dibujos/todos.ts (y no de cada pics-*.ts) para que PICS esté completo cuando se crean las imágenes.
import { CONEJO_SVG, ERIZO_SVG, GLASSES_SVG, HAND_SVG, K, LUPI_SVG, PICS, TITO_SVG, TORTUGA_SVG } from '../dibujos/todos.ts';
import { ctx } from './pantalla.ts';

/* ---------- imágenes SVG ---------- */
// IMG: imágenes listas para dibujar (clave = nombre del dibujo en PICS, más tito, erizo, tortuga, conejo, lupi, glasses y hand).
// IMGG: versiones "sin colorear" (gris) que crea greyOf() la primera vez que se piden.
export const IMG: Record<string,HTMLImageElement>={},IMGG: Record<string,HTMLImageElement>={};
// svgImg(interior, viewBox, px): crea una imagen a partir de un trozo de SVG. px es el ancho en píxeles y el alto sale de
// la proporción del viewBox. La imagen carga de forma asíncrona: hay que mirar .complete antes de dibujarla.
export function svgImg(inner: string,vb: string,px: number): HTMLImageElement{const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${px}" height="${Math.round(px*(+(vb.split(' ')[3] as string))/(+(vb.split(' ')[2] as string)))}">${inner}</svg>`);return i}
// Se convierten en imagen todos los dibujos de src/dibujos/ (cada uno está dibujado en un cuadro de -62 a 62).
for(const k in PICS) IMG[k]=svgImg(PICS[k] as string,'-62 -62 124 124',320);
// Personajes: Tito en sus cuatro formas, Lupi, las gafas y la mano que señala en las ayudas.
IMG['tito']=svgImg(TITO_SVG,'0 0 240 200',480);IMG['erizo']=svgImg(ERIZO_SVG,'0 0 240 200',480);IMG['tortuga']=svgImg(TORTUGA_SVG,'0 0 240 200',480);IMG['conejo']=svgImg(CONEJO_SVG,'0 0 240 200',480); IMG['lupi']=svgImg(LUPI_SVG,'0 0 200 230',420); IMG['glasses']=svgImg(GLASSES_SVG,'0 0 200 230',420); IMG['hand']=svgImg(HAND_SVG,'0 0 80 110',160);
// greyOf(dibujo): versión "sin colorear" del dibujo (rellenos crema y bordes claros; lo que es tinta K se mantiene).
// Se crea la primera vez y se guarda en IMGG.
function greyOf(k: string): HTMLImageElement|undefined{const p=PICS[k];if(!IMGG[k]&&p)IMGG[k]=svgImg(p.replace(/(fill|stroke)="(#[0-9A-Fa-f]{6})"/g,(m: string,a: string,c: string)=>c.toUpperCase()===K.toUpperCase()?m:(a==='fill'?'fill="#FBF8F2"':'stroke="#D8D0C4"')),'-62 -62 124 124',320);return IMGG[k]}
// pic(dibujo, x, y, tamaño, alfa): dibuja IMG[dibujo] centrado en (x,y). Si aún no ha cargado, no dibuja nada.
export function pic(n: string,x: number,y: number,s: number,a=1): void{const i=IMG[n]; if(!i||!i.complete)return; ctx.globalAlpha*=a; ctx.drawImage(i,x-s/2,y-s/2,s,s); ctx.globalAlpha/=a}
// picG(dibujo, x, y, tamaño): igual que pic() pero con la versión en gris.
export function picG(n: string,x: number,y: number,s: number): void{const i=greyOf(n); if(!i||!i.complete)return; ctx.drawImage(i,x-s/2,y-s/2,s,s)}
