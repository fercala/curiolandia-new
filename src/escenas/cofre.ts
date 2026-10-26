/*
 * escenas/cofre.ts: el cofre del tesoro, el premio al terminar una casita (fase 4q de docs/PLAN-MIGRACION.md: hasta
 * entonces estaba al final de escenas/zonas.ts, que se carga antes que la tienda y usaba lo de ella como globales
 * tardías). Va después de escenas/tienda.ts (escenas/indice.ts) e importa de ella el catálogo y cómo se da un artículo.
 * Define: drawChest. La escena SCENES.cofre (la versión 3D la pone mundo3d/cofre3d.ts, que llama a esta por su nombre).
 * Exporta: GIFTS (de dominio/progreso.ts), nextGift, grantGift y cofrePend (lo llama aplicacion/arranque.ts).
 * Importa: el núcleo, src/nucleo/ (S, save, go, later, say, SFX, T, dibujo, monedas...), escenas/tienda.ts (SHOP, wear,
 *   placeHome, itemName, drawItemPic y el tipo Articulo), escenas/escenas2d.ts (TEMA), las reglas de dominio/progreso.ts
 *   (GIFTS, siguienteRegalo) y de dominio/monedas.ts (ganar) y los casos de uso del cofre (aplicacion/abrirCofre.ts).
 * Partes de S que toca: S.cofres, S.cofreP, S.owned, S.stk, S.coins (vía los casos de uso, giveCoins y ganar).
 */
import type { Libre } from '../juegos/tipos.ts';
import type { Articulo } from './tienda.ts';
import { K } from '../dibujos/todos.ts';
import { DF, PI, S, SCENES, SFX, T, TITO, VIVO, atHome, back, burst, cap, card, circ, clamp, ctx, dist, drawCoinHUD, drawHome, drawTito, ell, fillStroke, giveCoins, giveSticker, go, hC, hv, inR, inTito, kid, later, lerp, pic, save, say, sayQ, scene, sky, sparkles, star, text, tone } from '../nucleo/indice.ts';
import { SHOP, drawItemPic, itemName, placeHome, wear } from './tienda.ts';
import { TEMA } from './escenas2d.ts';
import { ZONES, drawTitoHouse, houseLevel, lowName } from './zonas.ts';
import { GIFTS, siguienteRegalo } from '../dominio/progreso.ts';
import { ganar } from '../dominio/monedas.ts';
import { abrirCofre, ganarCofre, sinPendiente } from '../aplicacion/abrirCofre.ts';

/* ---------- el cofre del tesoro: premio al terminar una casita ---------- */
// GIFTS: regalos del cofre, en orden fijo (sorpresa para el nene, pero sin azar): ids de artículos de SHOP
// (escenas/tienda.ts). Están en dominio/progreso.ts y se exportan también desde aquí. nextGift(): el primero que aún no
// se tiene (S.owned) o null. grantGift(it): lo marca como tuyo y se lo pone a Tito (wear) o lo coloca en su casa
// (placeHome). Modifica S.owned (y lo que toquen wear/placeHome) y guarda.
export { GIFTS };
// nextGift(): siguiente regalo de GIFTS que aún no se tiene, o null (siguienteRegalo, en dominio/progreso.ts).
export const nextGift=()=>siguienteRegalo(SHOP,S.owned!);
// grantGift(it): da el artículo it: S.owned, y se lo pone a Tito (si tiene slot) o lo coloca en su casa. Guarda.
// Si se lo pone y la escena es 3D (el cofre), rehace a Tito 3D (retito) para que se vea al momento.
export function grantGift(it: Articulo){S.owned![it.id]=1;if(it.slot)wear(it,true);else placeHome(it.id);save();
  if(it.slot&&scene&&scene.three&&window.__w3&&window.__w3.retito)window.__w3.retito()}// Tito 3D se viste ya (en el cofre), no al cambiar de escena
// drawChest(x, y, s, op, sh): dibuja el cofre a escala s, desplazado sh en horizontal (temblor). op = cuánto está abierto
// (0 cerrado, 1 abierto): con op > 0 salen rayos de luz y brillo dentro; la tapa se aplasta en vertical (escala Y) hasta
// casi desaparecer y, pasada la mitad, reaparece abierta por dentro. Con op < 0,15 se ve la cerradura.
function drawChest(x: number,y: number,s: number,op: number,sh: number){ctx.save();ctx.translate(x+sh,y);ctx.scale(s,s);
  if(op>0){ctx.save();ctx.globalAlpha=Math.min(1,op*1.5)*.85;for(let i=0;i<12;i++){const a=T*.6+i/12*PI*2;ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(Math.cos(a-.12)*520,-40+Math.sin(a-.12)*520);ctx.lineTo(Math.cos(a+.12)*520,-40+Math.sin(a+.12)*520);ctx.closePath();ctx.fillStyle=i%2?'#FFF3B0':'#FFE08A';ctx.fill()}ctx.restore()}
  ell(0,138,190,26,'rgba(74,52,40,.18)',0);
  card(-150,-30,300,160,'#B5763F',8,18);for(const yy of[20,70])card(-146,yy,292,6,'#8A5A3C',0,3);
  for(const bx of[-110,110])card(bx-16,-30,32,160,'#FFC93C',6,6);
  if(op>0){ell(0,-30,140,26,'#5A3A26',5);ctx.globalAlpha=Math.min(1,op*2);ell(0,-36,110,18,'#FFE08A',0);ctx.globalAlpha=1}
  {const inner=op>.5,h=inner?(op-.5)*2*.75:1-op*1.8;ctx.save();ctx.translate(0,inner?-52:-30);ctx.scale(1,Math.max(h,.04));
   ctx.beginPath();ctx.moveTo(-156,0);ctx.lineTo(-156,-44);ctx.quadraticCurveTo(-150,-118,0,-120);ctx.quadraticCurveTo(150,-118,156,-44);ctx.lineTo(156,0);ctx.closePath();fillStroke(inner?'#7A4C30':'#C98A4B',8/Math.max(.3,h));
   for(const bx of[-110,110])card(bx-16,-110,32,110,'#FFC93C',6/Math.max(.3,h),6);ctx.restore()}
  if(op<.15){card(-30,-56,60,70,'#FFC93C',6,12);circ(0,-30,10,K,0);card(-4,-28,8,22,K,0,3)}
  ctx.restore()}

// EL COFRE DEL TESORO: premio por terminar un tema. Se llega con go('cofre', {t: id}) desde la casita con o.fin.
// Hay que tocarlo 3 veces; al abrirse da el siguiente regalo de GIFTS (o 20 monedas si ya no quedan), la figurita del tema
// y 10 monedas. Luego se puede ir a la casa de Tito a verlo o seguir el camino. (mundo3d/cofre3d.ts pone un
// cofre 3D hecho a partir de este; hasta la fase 4i lo envolvía.)
// Mientras el cofre está sin abrir, S.cofreP[id del tema] = 1 (premio pendiente): si se cierra o recarga la página antes
// de abrirlo, cofrePend() lo entrega al arrancar, para que el premio del tema nunca se pierda.
SCENES.cofre={music:'casita',
// enter(o): prepara el cofre cerrado, elige el regalo, suma S.cofres, apunta el premio pendiente (S.cofreP) y lo anuncia.
// Lo de la partida lo dice el caso de uso ganarCofre (aplicacion/abrirCofre.ts, desde la fase 4l).
  enter(o: Libre){VIVO.coinBanner=null;VIVO.toast=null;this.t=TEMA[o.t];this.taps=0;this.op=0;this.openT=0;this.shakeT=-9;this.rewarded=false;this.gift=nextGift();this.busy=false;
    Object.assign(S,ganarCofre(S,this.t.id));save();
    const n=lowName(this.t);later(400,()=>{SFX.tada();burst(800,300,70);say(('¡Terminaste todos los juegos de '+n).replace(/ de el /,' del ')+kid()+'! ¡Ganaste un cofre del tesoro! Tocalo tres veces para abrirlo.')})},
// reward(): entrega el premio una sola vez (this.rewarded): regalo, figurita (S.stk) y monedas (S.coins). Se llama al
// abrirse o al salir con la casa sin abrirlo, para que nunca se pierda. Quita el pendiente de S.cofreP (giveCoins guarda).
// Lo de la partida (pendiente y figurita) y cuántas monedas da lo dice el caso de uso abrirCofre (aplicacion/abrirCofre.ts,
// desde la fase 4l); aquí se ponen en S, se da el regalo (grantGift) y se enseñan la figurita y las monedas.
  reward(){if(this.rewarded)return;this.rewarded=true;const it=this.gift,r=abrirCofre(S,this.t.id,this.t.icon,!!it);Object.assign(S,r.partida);if(it)grantGift(it);giveSticker(this.t.icon,true);giveCoins(r.monedas,800,560);
    // los carteles de figurita y monedas van a la derecha: en el centro tapaban el regalo y su nombre
    if(VIVO.toast){VIVO.toast.x=1290;VIVO.toast.y=300}if(VIVO.coinBanner){VIVO.coinBanner.x=1300;VIVO.coinBanner.y=540}},
// next(): vuelve a la zona del tema con {from: id} (la zona felicita si ya no queda camino).
  next(){const z=this.t.zone;go(ZONES[z]?z:'map',{from:this.t.id})},
// prompt(): cuántos toques faltan o, ya abierto, qué se puede hacer.
  prompt(){if(!this.openT)say('Tocá el cofre para abrirlo. ¡Te '+(3-this.taps===1?'falta un toque':'faltan '+(3-this.taps)+' toques')+'!');else say('Tocá la casa para ver tu regalo, o la flecha verde para seguir el camino.')},
// hint(): señala el cofre; ya abierto, tras 3 s, la flecha de seguir.
  hint(){if(!this.openT)return{x:800,y:560,r:200};if(T<this.openT+3)return null;return{x:1000,y:800,r:80}},
// dwell(id): nombres de los dos botones del final.
  dwell(id: string){if(id==='cf:casa')say('La casa de Tito.');if(id==='cf:seguir')say('Seguir el camino.')},
// draw(): fondo con estrellas, cofre (op crece desde openT), el regalo que sube con un rebote (back) y su nombre, los 3
// puntos de toques y, al final, los botones "casa de Tito" y "seguir".
  draw(){sky('#FFE9C2','#FFD7E4');
    for(let i=0;i<10;i++){const x=(i*173+T*30)%1700-50,y=120+(i*97)%300;star(x,y,8+(i%3)*4,'#FFF6D6',0)}
    const sh=Math.max(0,1-(T-this.shakeT)*3)*Math.sin(T*50)*14;
    if(this.openT){const k=T-this.openT;this.op=clamp(k*2.2,0,1)}
    drawChest(800,560,1.15,this.op,sh);
    if(this.openT){const k=T-this.openT,e=clamp((k-.25)/.8,0,1),gy=lerp(520,300,e*e*(3-2*e)),gs=back(e)*260;
      if(e>0){if(this.gift)drawItemPic(this.gift,800,gy,gs);else pic('monedas',800,gy,gs)}
      if(k>1.1&&this.gift){ctx.font=`600 44px ${DF}`;const nm=cap(itemName(this.gift)),tw=ctx.measureText(nm).width;card(800-tw/2-40,96,tw+80,84,'#fff',6,42);text(nm,800,152,44,K,{w:600})}}
    else{for(let i=0;i<3;i++){const on=i<this.taps;circ(740+i*60,830,20,on?'#FFC93C':'#fff',5)}}
    if(this.openT&&T>this.openT+1.4){
      {const s=hv('cf:casa',hC(600,800,74));ctx.save();ctx.translate(600,800);ctx.scale(s,s);circ(0,0,72,'#fff',7);ctx.save();ctx.scale(.3,.3);drawTitoHouse(0,90,houseLevel());ctx.restore();ctx.restore()}
      {const p=(Math.sin(T*4)+1)/2,s=hv('cf:seguir',hC(1000,800,74));ctx.save();ctx.translate(1000,800);ctx.scale(s*(1+p*.05),s*(1+p*.05));ctx.globalAlpha=.35+.3*p;circ(0,0,84,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,72,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(34,0);ctx.lineTo(-20,32);ctx.closePath();fillStroke('#fff',5);ctx.restore()}}
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
// down(x, y): casa -> entrega el premio y sigue; cada toque al cofre lo sacude (como mucho uno cada 0,18 s) y al
// tercero se abre; ya abierto (tras 1,4 s): casa de Tito, seguir o tocar el regalo para oír su nombre.
  down(x: number,y: number){
    if(atHome(x,y)){SFX.tap();this.reward();this.next();return}
    if(inTito(x,y)){this.prompt!();return}
    if(!this.openT){if(inR(x,y,800,520,380,360)){if(T-this.shakeT<.18)return;this.taps++;this.shakeT=T;SFX.pop();tone(500+this.taps*180,.12,'triangle',.15);sparkles(800,420,10);
        if(this.taps>=3){this.openT=T+.15;later(150,()=>{SFX.tada();burst(800,420,100);burst(400,300,30);burst(1200,300,30);this.reward()});
          const it=this.gift;later(1300,()=>sayQ(it?'¡Mirá lo que había'+kid()+': '+itemName(it)+'! '+(it.slot?'¡Tito ya se lo puso!':'Ya está en la casa de Tito.')+' ¡Y diez monedas!':'¡Mirá cuántas monedas'+kid()+'! ¡Veinte monedas!',()=>later(300,()=>sayQ(it?'Tocá la casa para verlo, o la flecha verde para seguir el camino.':'Tocá la flecha verde para seguir el camino.'))))}
        else say(this.taps===1?'¡Otra vez!':'¡Una vez más!');return}
      SFX.tap();sparkles(x,y,3);return}
    if(T<this.openT+1.4)return;
    if(dist(x,y,600,800)<78){SFX.pop();go('casaTito',{nuevo:this.gift&&this.gift.id});return}
    if(dist(x,y,1000,800)<78){SFX.pop();this.next();return}
    if(this.gift&&dist(x,y,800,300)<140){SFX.pop();sparkles(800,300,10);say(cap(itemName(this.gift))+'.');return}
    SFX.tap();sparkles(x,y,3)}
};
// cofrePend(): al arrancar (aplicacion/arranque.ts), entrega sin animación los cofres que quedaron sin abrir (S.cofreP), uno por tema:
// el siguiente regalo (o 20 monedas si no quedan), la pegatina del tema y 10 monedas, como reward(): desde la fase 4l, con
// el mismo caso de uso, abrirCofre (aplicacion/abrirCofre.ts). Se ven en la casa de Tito. Un pendiente de un tema que ya
// no existe solo se quita.
export function cofrePend(){const P=S.cofreP;if(!P||typeof P!=='object'){delete S.cofreP;return}
  for(const id of Object.keys(P)){const t=TEMA[id];if(!t){S.cofreP=sinPendiente(S.cofreP,id);continue}const it=nextGift(),r=abrirCofre(S,id,t.icon,!!it);
    Object.assign(S,r.partida);if(it)grantGift(it);Object.assign(S,ganar(S,r.monedas))}
  save()}
