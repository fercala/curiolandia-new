// ARCHIVO: nucleo/monedas.ts — las monedas en pantalla: el marcador (drawCoinHUD, inCoinHUD), las monedas que vuelan
//   y el cartel "+N" (drawCoinFx), abonar (creditCoins), dar (giveCoins) y gastar (spendCoins) monedas.
// Desde la fase 4a de docs/PLAN-MIGRACION.md es un módulo aparte (antes estaba dentro de escenas/tienda.ts), y desde la
//   4b está en el núcleo (en la 4a estaba en escenas/monedas.ts): onRight (nucleo/interfaz.ts) da aquí la moneda de
//   cada acierto, sin que escenas/tienda.ts la envuelva. Las escenas, aplicacion/adultos.ts y la capa 3D (mundo3d/) lo
//   importan del núcleo. Las reglas (cuántas monedas da cada cosa, ganar y gastar)
//   están en dominio/monedas.ts; aquí solo se suman a S y se animan.
// Exporta: creditCoins, drawCoinHUD, inCoinHUD, giveCoins, spendCoins y drawCoinFx.
// Importa: del núcleo, pantalla.ts (LF, T, ctx, VIVO), utilidades.ts (inR, lerp, back, clamp, rnd, PI), guardado.ts
//   (S, save), escenas.ts (sceneName, sceneTok), imagenes.ts (pic), dibujo.ts (card, text), puntero.ts (hv, hR) y
//   sonido.ts (tone); K de los dibujos y ganar y gastar de dominio/monedas.ts.
import { K } from '../dibujos/todos.ts';
import { card, text } from './dibujo.ts';
import { sceneName, sceneTok } from './escenas.ts';
import { S, save } from './guardado.ts';
import { pic } from './imagenes.ts';
import { ctx, LF, T, VIVO } from './pantalla.ts';
import { hR, hv } from './puntero.ts';
import { tone } from './sonido.ts';
import { back, clamp, inR, lerp, PI, rnd } from './utilidades.ts';
import { ganar, gastar } from '../dominio/monedas.ts';

/** Una moneda que vuela (coinFx): de (x, y) al marcador, o al revés si spend; v monedas que suma al llegar. */
interface MonedaVuela {
  x: number;
  y: number;
  t: number;
  v?: number;
  spend?: number;
  done?: number;
}

/* ---------- monedas ---------- */
// Animación de monedas: shownCoins es el número que se ve (va subiendo cuando cada moneda llega al marcador),
// coinFx las monedas que vuelan, coinBanner el cartel "+N", coinBumpT cuándo saltó el marcador por última vez.
// shownCoins empieza en S.coins (0 si aún no hay: escenas/tienda.ts pone el valor por defecto después) y drawCoinFx lo
// pone al día en cada cuadro.
let shownCoins=S.coins??0,coinFx: MonedaVuela[]=[],coinBumpT=-9;
Object.assign(VIVO,{coinBanner:null});
// coinPend: monedas ya sumadas a S.coins (creditCoins) cuya animación aún no ha salido; el marcador no las enseña hasta
// que llegan volando. coinPendTok: escena en la que se abonaron (si se sale antes, el marcador ya las cuenta).
let coinPend=0,coinPendTok=-1;
// creditCoins(n): suma n monedas a S.coins y S.coinsTot YA (sin guardar ni animar: guarda quien llama, junto con la
// marca de "premio dado", para que salir o recargar durante la celebración no las pierda). Luego la animación se hace con
// giveCoins(n, x, y, icono, true), que ya no las vuelve a sumar.
export function creditCoins(n: number){if(!(n>0))return;Object.assign(S,ganar(S,n));coinPend+=n;coinPendTok=sceneTok}
// Posición del marcador de monedas (cambia en los juegos para no tapar otros botones).
let HUDX=1450,HUDY=64;
// Coloca el marcador de monedas: a la izquierda en los juegos, arriba a la derecha en el resto.
const hudAt=()=>{if(sceneName==='juego'){HUDX=300;HUDY=74}else{HUDX=1450;HUDY=64}};
// Dibuja el marcador de monedas (tarjeta amarilla con la moneda y el número); la moneda da un saltito al cambiar.
export function drawCoinHUD(){hudAt();const b=1+.3*Math.max(0,1-(T-coinBumpT)*4),s=hv('coins',hR(HUDX+10,HUDY,220,84));ctx.save();ctx.translate(HUDX,HUDY);ctx.scale(s,s);card(-96,-38,216,76,'#FFF6D6',6,38);
  ctx.save();ctx.translate(-50,0);ctx.scale(b,b);pic('moneda',0,0,70);ctx.restore();text(String(Math.max(0,Math.round(shownCoins))),40,16,44,K,{f:LF});ctx.restore()}
// ¿El toque (x,y) está sobre el marcador de monedas?
export const inCoinHUD=(x: number,y: number)=>{hudAt();return inR(x,y,HUDX+10,HUDY,220,84)};
// Da n monedas: las suma a S.coins y S.coinsTot y guarda. Lanza hasta 10 monedas animadas desde (x,y)
// hacia el marcador (la última lleva el resto) y, si son 3 o más o se pasa icon, muestra el cartel "+n" con ese dibujo.
// ya = true: las monedas ya se sumaron antes con creditCoins; solo se anima (y se descuentan de coinPend).
export function giveCoins(n: number,x: number,y: number,icon?: string,ya?: boolean){if(!(n>0))return;if(ya)coinPend=Math.max(0,coinPend-n);else{Object.assign(S,ganar(S,n));save()}const m=Math.min(n,10);
  for(let i=0;i<m;i++)coinFx.push({x:x+rnd(-36,36),y:y+rnd(-36,36),t:T+i*.09,v:i<m-1?1:n-(m-1)});if(n>=3||icon)VIVO.coinBanner={n,t:T,icon}}
// spendCoins(n, x, y): gasta n monedas (sin comprobar si hay suficientes) y anima monedas que salen del marcador hacia
// (x,y). La usa la tienda (escenas/tienda.ts) al comprar.
export function spendCoins(n: number,x: number,y: number){Object.assign(S,gastar(S,n));save();shownCoins-=n;coinBumpT=T;for(let i=0;i<Math.min(n,8);i++)coinFx.push({x,y,t:T+i*.06,spend:1})}
// Dibuja y avanza las monedas que vuelan y el cartel "+N". Cada moneda tarda 0,75 s; cuando llega
// suma su valor al número visible y suena. Se llama en cada cuadro desde el bucle de dibujo.
export function drawCoinFx(){hudAt();
  for(const c of coinFx){const k=(T-c.t)/.75;if(k<0)continue;
    if(k>=1){if(!c.done){c.done=1;if(!c.spend){shownCoins+=c.v!;coinBumpT=T;try{tone(1568,.08,'square',.06);tone(2093,.14,'triangle',.12,0,.05)}catch(e){}}}continue}
    // e = curva suave (smoothstep) de 0 a 1; la moneda sube en arco (seno) mientras va de a hacia b.
    const e=k*k*(3-2*k),a=c.spend?[HUDX-50,HUDY]:[c.x,c.y],b=c.spend?[c.x,c.y]:[HUDX-50,HUDY];
    pic('moneda',lerp(a[0],b[0],e),lerp(a[1],b[1],e)-Math.sin(k*PI)*130,62*(1-k*.25))}
  // sin monedas volando, el marcador enseña S.coins menos las abonadas que aún esperan su animación en esta escena
  coinFx=coinFx.filter(c=>!c.done);if(coinPend&&coinPendTok!==sceneTok)coinPend=0;if(!coinFx.length)shownCoins=S.coins!-coinPend;
  // Cartel "+N": entra con rebote (0-0,3 s), se queda y se desvanece entre 2,2 y 2,6 s.
  if(VIVO.coinBanner){const k=T-VIVO.coinBanner.t;if(k>2.6){VIVO.coinBanner=null;return}const a=k<.3?back(k/.3):k>2.2?1-(k-2.2)/.4:1;ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(VIVO.coinBanner.x||800,VIVO.coinBanner.y||470);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));
    card(-250,-90,500,180,'#FFF6D6',7,50);pic(VIVO.coinBanner.icon||'monedas',-140,0,150);text('+'+VIVO.coinBanner.n,60,26,92,'#D9962A',{f:LF,st:8,sc:'#fff'});ctx.restore()}}
